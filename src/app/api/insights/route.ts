import { NextResponse } from 'next/server';
import OpenAI from 'openai';

interface Meeting {
  id: string;
  title: string;
  start: string;
  end: string;
  attendees?: string[];
}

interface Email {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  important: boolean;
}

interface Risk {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  suggestedAction: string;
}

// AI-powered insights generation
export async function POST(request: Request) {
  try {
    const { meetings, emails } = await request.json();

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Return rule-based insights if no OpenAI key
      return NextResponse.json({
        insights: generateRuleBasedInsights(meetings, emails),
        risks: generateRuleBasedRisks(meetings, emails),
        source: 'rules'
      });
    }

    const openai = new OpenAI({ apiKey });

    const prompt = `You are a helpful executive assistant analyzing someone's day. Based on the following calendar and email data, provide:
1. 3 brief, actionable insights (one sentence each)
2. Any risks or concerns that need attention

Calendar for today:
${JSON.stringify(meetings, null, 2)}

Recent important emails:
${JSON.stringify(emails, null, 2)}

Respond in JSON format:
{
  "insights": ["insight1", "insight2", "insight3"],
  "risks": [
    {
      "title": "Risk title",
      "description": "Brief description",
      "severity": "high|medium|low",
      "suggestedAction": "What to do"
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 500,
    });

    const content = completion.choices[0].message.content;
    const parsed = JSON.parse(content || '{}');

    return NextResponse.json({
      insights: parsed.insights || [],
      risks: (parsed.risks || []).map((r: Risk, i: number) => ({
        ...r,
        id: String(i + 1),
      })),
      source: 'openai'
    });

  } catch (error) {
    console.error('Insights API error:', error);
    return NextResponse.json({
      insights: [
        'Review your calendar for any meeting conflicts.',
        'Check priority emails before your first meeting.',
        'Block time for focused work between meetings.'
      ],
      risks: [],
      source: 'fallback',
      error: 'Failed to generate insights'
    });
  }
}

function generateRuleBasedInsights(meetings: Meeting[], emails: Email[]): string[] {
  const insights: string[] = [];

  // Check for attendee overlap
  const attendeeCounts: Record<string, number> = {};
  meetings.forEach(m => {
    (m.attendees || []).forEach(a => {
      attendeeCounts[a] = (attendeeCounts[a] || 0) + 1;
    });
  });

  const frequentAttendees = Object.entries(attendeeCounts)
    .filter(([_, count]) => count > 1)
    .map(([name]) => name);

  if (frequentAttendees.length > 0) {
    insights.push(`${frequentAttendees[0]} appears in multiple meetings today - consider combining prep.`);
  }

  // Check for email-meeting alignment
  const importantEmails = emails.filter(e => e.important);
  if (importantEmails.length > 0 && meetings.length > 0) {
    insights.push(`Review ${importantEmails.length} priority email(s) before your first meeting at ${meetings[0].start}.`);
  }

  // Check for gaps in schedule
  if (meetings.length >= 2) {
    for (let i = 0; i < meetings.length - 1; i++) {
      const endTime = parseInt(meetings[i].end.replace(':', ''));
      const nextStart = parseInt(meetings[i + 1].start.replace(':', ''));
      const gap = nextStart - endTime;
      if (gap >= 30) {
        insights.push(`You have ${gap >= 100 ? Math.floor(gap / 100) + ' hour(s)' : gap + ' minutes'} free before ${meetings[i + 1].title} to prep or catch up.`);
        break;
      }
    }
  }

  // Fallback insights
  if (insights.length === 0) {
    insights.push('Your schedule looks manageable today.');
  }

  return insights.slice(0, 3);
}

function generateRuleBasedRisks(meetings: Meeting[], emails: Email[]): Risk[] {
  const risks: Risk[] = [];

  // Check for back-to-back meetings
  for (let i = 0; i < meetings.length - 1; i++) {
    if (meetings[i].end === meetings[i + 1].start) {
      risks.push({
        id: String(risks.length + 1),
        title: 'Back-to-back meetings detected',
        description: `${meetings[i].title} ends right when ${meetings[i + 1].title} starts.`,
        severity: 'medium',
        suggestedAction: 'Consider adding a 5-minute buffer or joining the second meeting a few minutes late.'
      });
      break;
    }
  }

  // Check for urgent keywords in emails
  const urgentKeywords = ['urgent', 'asap', 'deadline', 'overdue', 'critical', 'immediately'];
  emails.forEach(email => {
    const text = `${email.subject} ${email.snippet}`.toLowerCase();
    if (urgentKeywords.some(k => text.includes(k))) {
      risks.push({
        id: String(risks.length + 1),
        title: `Urgent email from ${email.from}`,
        description: email.subject,
        severity: 'high',
        suggestedAction: 'Review and respond to this email as soon as possible.'
      });
    }
  });

  return risks;
}
