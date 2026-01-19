/**
 * AI Briefing Generator
 *
 * Creates structured, scannable briefings that answer:
 * 1. What's the situation? (verdict)
 * 2. What do I do first? (first move)
 * 3. What else should I know? (waiting, watch out)
 */

import type { DailyBriefing as DailyData, Meeting, Email, Task, Risk, PersonWaiting } from './mock-data';

// ============================================================================
// TYPES
// ============================================================================

export interface AIBriefing {
  verdict: {
    rating: string; // "Manageable", "Heavy", "Light", "Chaotic"
    summary: string; // "but sequencing matters"
  };
  firstMove: {
    item: string; // "QBR deck"
    context: string; // "due EOD, untouched"
    action: string; // "Block 9:00-10:30. Don't open email until it ships."
    why?: string; // Explanation of why this first
  } | null;
  waitingOnYou: Array<{
    person: string;
    context: string; // "18 hours"
    subtext?: string; // "(he's a fast responder, he'll notice)"
    action: string; // "Quick 'reviewing now, reply by 2pm' buys time"
  }>;
  watchOut: Array<{
    warning: string;
    action?: string;
  }>;
  freeTime: {
    duration: string; // "195 min"
    startTime: string; // "10:45"
    endTime: string; // "14:00"
    suggestion: string; // "best window for deep work"
  } | undefined;
  schedule: {
    meetingCount: number;
    totalMeetingMinutes: number;
    longestGap: number;
  };
}

export interface OneThing {
  title: string;
  subtitle: string; // "Due end of day · ~90 min effort"
  description?: string; // Optional longer description
  why: string; // "You have a 70-minute focus window..."
  emoji?: string; // Optional emoji indicator
  context?: string; // Optional context info
  actions: Array<{
    label: string;
    variant: 'primary' | 'secondary' | 'ghost';
    handler: string;
  }>;
  originalData: unknown;
}

// ============================================================================
// GREETING GENERATOR
// ============================================================================

export function getAdaptiveGreeting(name: string): string {
  const hour = new Date().getHours();
  const day = new Date().getDay();
  const isWeekend = day === 0 || day === 6;

  if (isWeekend) {
    if (day === 0) return `Happy Sunday, ${name}`;
    return `Happy Saturday, ${name}`;
  }

  if (hour >= 21) return `Working late, ${name}?`;
  if (hour >= 17) return `Good evening, ${name}`;
  if (hour >= 13) return `Good afternoon, ${name}`;
  if (hour >= 11) return `Hey ${name}`;
  if (hour >= 5) return `Good morning, ${name}`;
  return `Burning the midnight oil, ${name}?`;
}

// ============================================================================
// BRIEFING GENERATOR
// ============================================================================

export function generateAIBriefing(data: DailyData): AIBriefing {
  const urgentEmails = data.emails.filter(e => e.important);
  const pendingTasks = data.tasks.filter(t => !t.completed);
  const risks = data.risks;
  const meetings = data.meetings;

  // Calculate day rating
  const urgentCount = risks.length + urgentEmails.length + pendingTasks.filter(t => t.due?.toLowerCase() === 'eod').length;
  const meetingLoad = meetings.length;

  let rating: string;
  let summary: string;

  if (risks.length > 0) {
    rating = 'Needs attention';
    summary = `you have ${risks.length} risk${risks.length > 1 ? 's' : ''} to address`;
  } else if (urgentCount >= 4 || meetingLoad >= 5) {
    rating = 'Heavy';
    summary = 'prioritization will be key';
  } else if (urgentCount >= 2 || meetingLoad >= 3) {
    rating = 'Manageable';
    summary = 'but sequencing matters';
  } else if (urgentCount === 0 && meetingLoad <= 1) {
    rating = 'Light';
    summary = 'good day for deep work';
  } else {
    rating = 'Moderate';
    summary = 'nothing unusual';
  }

  // Determine first move
  let firstMove: AIBriefing['firstMove'] = null;

  // Priority: Risk > EOD Task > Urgent Email
  if (risks.length > 0) {
    const risk = risks[0];
    firstMove = {
      item: risk.title,
      context: `${risk.severity} severity risk`,
      action: risk.suggestedAction,
      why: 'Risks compound when ignored. Address this before it escalates.',
    };
  } else {
    const eodTask = pendingTasks.find(t => t.due?.toLowerCase() === 'eod' || t.due?.toLowerCase() === 'today');
    if (eodTask) {
      firstMove = {
        item: eodTask.title,
        context: `due ${eodTask.due}`,
        action: findFreeWindow(meetings)
          ? `Block ${findFreeWindow(meetings)}. Don't open email until it ships.`
          : 'Start this before your first meeting.',
        why: meetings.length > 0
          ? `You have ${meetings.length} meetings today. This is your only task with a hard deadline.`
          : 'Clear this early and the rest of your day opens up.',
      };
    }
  }

  // Waiting on you - prioritize people waiting data, then fall back to emails
  const waitingOnYou: AIBriefing['waitingOnYou'] = [];

  // Add people waiting (more accurate than email timestamps)
  if (data.peopleWaiting) {
    data.peopleWaiting.forEach(person => {
      const hoursOrDays = person.daysWaiting >= 1
        ? `${Math.floor(person.daysWaiting)} day${person.daysWaiting >= 2 ? 's' : ''} waiting`
        : `${Math.round(person.daysWaiting * 24)} hours waiting`;

      waitingOnYou.push({
        person: person.name,
        context: hoursOrDays,
        subtext: person.relationshipNote,
        action: generatePersonAction(person, meetings),
      });
    });
  } else {
    // Fallback to emails if no peopleWaiting data
    urgentEmails.forEach(email => {
      const hoursAgo = parseTimeAgo(email.date);
      waitingOnYou.push({
        person: email.from,
        context: hoursAgo ? `${hoursAgo}` : email.date,
        subtext: getPersonContext(email.from),
        action: generateEmailAction(email, meetings),
      });
    });
  }

  // Watch out
  const watchOut: AIBriefing['watchOut'] = [];

  // Check for back-to-back meetings
  const backToBackCount = countBackToBackMeetings(meetings);
  if (backToBackCount >= 3) {
    watchOut.push({
      warning: `${backToBackCount} back-to-back meetings today`,
      action: 'Eat something real before they start',
    });
  }

  // Check for long meeting streaks
  const meetingGap = findLargestGap(meetings);
  if (meetingGap && meetings.length >= 3) {
    watchOut.push({
      warning: `Only break is ${meetingGap.duration} min before ${meetingGap.beforeMeeting}`,
    });
  }

  // Free time suggestion
  const freeWindow = findFreeWindowDetails(meetings);

  // Schedule summary
  const totalMeetingMinutes = meetings.reduce((acc, m) => {
    return acc + calculateMeetingDuration(m.start, m.end);
  }, 0);

  return {
    verdict: { rating, summary },
    firstMove,
    waitingOnYou,
    watchOut,
    freeTime: freeWindow ?? undefined,
    schedule: {
      meetingCount: meetings.length,
      totalMeetingMinutes,
      longestGap: freeWindow ? parseInt(freeWindow.duration) : 0,
    },
  };
}

function calculateMeetingDuration(start: string, end: string): number {
  const startMinutes = parseTimeToMinutes(start);
  const endMinutes = parseTimeToMinutes(end);
  return endMinutes - startMinutes;
}

// ============================================================================
// ONE THING GENERATOR
// ============================================================================

export function generateOneThing(data: DailyData): OneThing | null {
  const risks = data.risks;
  const pendingTasks = data.tasks.filter(t => !t.completed);
  const urgentEmails = data.emails.filter(e => e.important);

  // Priority: Risk > EOD Task > Important Email
  if (risks.length > 0) {
    const risk = risks[0];
    return {
      title: risk.title,
      subtitle: `${risk.severity.toUpperCase()} severity · Needs immediate attention`,
      why: risk.suggestedAction,
      actions: [
        { label: 'Open Thread', variant: 'primary', handler: 'open_risk' },
        { label: 'Draft Response', variant: 'secondary', handler: 'draft_response' },
        { label: 'I Need More Time', variant: 'ghost', handler: 'snooze_risk' },
      ],
      originalData: risk,
    };
  }

  const eodTask = pendingTasks.find(t =>
    t.due?.toLowerCase() === 'eod' || t.due?.toLowerCase() === 'today'
  );

  if (eodTask) {
    return {
      title: eodTask.title,
      subtitle: `Due end of day · ~90 min effort`,
      why: `You have a focus window before your first meeting. This is the only task with a hard EOD deadline. The emails can wait—people expect slower replies on Sunday evenings.`,
      actions: [
        { label: 'Open Document', variant: 'primary', handler: 'open_task' },
        { label: 'Mark Complete', variant: 'secondary', handler: 'complete_task' },
        { label: 'I Need More Time', variant: 'ghost', handler: 'snooze_task' },
      ],
      originalData: eodTask,
    };
  }

  if (urgentEmails.length > 0) {
    const email = urgentEmails[0];
    return {
      title: `Reply to ${email.from}`,
      subtitle: `${email.subject} · Waiting since ${email.date}`,
      why: `${email.from} is waiting on this. A quick acknowledgment now prevents the awkward follow-up later.`,
      actions: [
        { label: 'Quick Reply', variant: 'primary', handler: 'quick_reply' },
        { label: 'Full Reply', variant: 'secondary', handler: 'full_reply' },
        { label: 'I Need More Time', variant: 'ghost', handler: 'snooze_email' },
      ],
      originalData: email,
    };
  }

  return null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function parseTimeAgo(dateStr: string): string | null {
  // Parse "8:41 AM" or "Yesterday" style dates
  if (dateStr.includes('AM') || dateStr.includes('PM')) {
    const now = new Date();
    const [time, period] = dateStr.split(' ');
    const [hours] = time.split(':').map(Number);
    const hour24 = period === 'PM' && hours !== 12 ? hours + 12 : hours;
    const hoursDiff = now.getHours() - hour24;

    if (hoursDiff > 0) {
      return `${hoursDiff} hour${hoursDiff > 1 ? 's' : ''} waiting`;
    }
  }

  if (dateStr.toLowerCase() === 'yesterday') {
    return '1 day waiting';
  }

  return null;
}

function getPersonContext(name: string): string | undefined {
  // In a real app, this would pull from relationship data
  const contexts: Record<string, string> = {
    'Sam Patel': "he's a fast responder, he'll notice",
    'Lisa Wong': 'strategic relationship, worth getting right',
  };
  return contexts[name];
}

function generateEmailAction(email: Email, meetings: Meeting[]): string {
  const freeWindow = findFreeWindowDetails(meetings);

  if (freeWindow) {
    return `Use your ${freeWindow.duration} min free window (${freeWindow.startTime}–${freeWindow.endTime})`;
  }

  return `Quick "reviewing now, will reply by 2pm" buys time`;
}

function generatePersonAction(person: PersonWaiting, meetings: Meeting[]): string {
  const freeWindow = findFreeWindowDetails(meetings);

  if (person.channel === 'text') {
    return `Send a quick text to acknowledge`;
  }

  if (person.daysWaiting >= 2) {
    return `This is getting awkward. Reply now to reset.`;
  }

  if (freeWindow) {
    return `Use your ${freeWindow.duration} min free window (${freeWindow.startTime}–${freeWindow.endTime})`;
  }

  return `Quick "reviewing now, will reply by 2pm" buys time`;
}

function findFreeWindow(meetings: Meeting[]): string | null {
  if (meetings.length === 0) return null;

  const firstMeeting = meetings[0];
  const startMinutes = parseTimeToMinutes(firstMeeting.start);
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (startMinutes - currentMinutes >= 60) {
    return `now until ${firstMeeting.start}`;
  }

  // Find gap between meetings
  for (let i = 0; i < meetings.length - 1; i++) {
    const endCurrent = parseTimeToMinutes(meetings[i].end);
    const startNext = parseTimeToMinutes(meetings[i + 1].start);
    const gap = startNext - endCurrent;

    if (gap >= 60) {
      return `${meetings[i].end} - ${meetings[i + 1].start}`;
    }
  }

  return null;
}

function findFreeWindowDetails(meetings: Meeting[]): { duration: string; startTime: string; endTime: string; suggestion: string } | null {
  if (meetings.length === 0) return null;

  // Find largest gap
  let maxGap = 0;
  let gapStart = '';
  let gapEnd = '';

  for (let i = 0; i < meetings.length - 1; i++) {
    const endCurrent = parseTimeToMinutes(meetings[i].end);
    const startNext = parseTimeToMinutes(meetings[i + 1].start);
    const gap = startNext - endCurrent;

    if (gap > maxGap) {
      maxGap = gap;
      gapStart = meetings[i].end;
      gapEnd = meetings[i + 1].start;
    }
  }

  if (maxGap >= 30) {
    return {
      duration: `${maxGap}`,
      startTime: gapStart,
      endTime: gapEnd,
      suggestion: 'best window for focused work',
    };
  }

  return null;
}

function findLargestGap(meetings: Meeting[]): { duration: number; beforeMeeting: string } | null {
  if (meetings.length < 2) return null;

  let maxGap = 0;
  let beforeMeeting = '';

  for (let i = 0; i < meetings.length - 1; i++) {
    const endCurrent = parseTimeToMinutes(meetings[i].end);
    const startNext = parseTimeToMinutes(meetings[i + 1].start);
    const gap = startNext - endCurrent;

    if (gap > maxGap) {
      maxGap = gap;
      beforeMeeting = meetings[i + 1].title;
    }
  }

  return maxGap > 0 ? { duration: maxGap, beforeMeeting } : null;
}

function countBackToBackMeetings(meetings: Meeting[]): number {
  let count = 1;
  let maxStreak = 1;

  for (let i = 0; i < meetings.length - 1; i++) {
    const endCurrent = parseTimeToMinutes(meetings[i].end);
    const startNext = parseTimeToMinutes(meetings[i + 1].start);
    const gap = startNext - endCurrent;

    if (gap <= 15) { // 15 min or less between meetings
      count++;
      maxStreak = Math.max(maxStreak, count);
    } else {
      count = 1;
    }
  }

  return maxStreak;
}

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}
