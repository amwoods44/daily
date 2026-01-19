import { NextResponse } from 'next/server';
import { google } from 'googleapis';

// Gmail API integration
export async function GET() {
  try {
    const accessToken = process.env.GOOGLE_ACCESS_TOKEN;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!accessToken && !refreshToken) {
      return NextResponse.json({
        emails: getDemoEmails(),
        source: 'demo'
      });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Get recent important/unread emails
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10,
      q: 'is:unread OR is:important newer_than:2d',
    });

    const messageIds = response.data.messages || [];

    const emails = await Promise.all(
      messageIds.slice(0, 5).map(async (msg) => {
        const detail = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id!,
          format: 'metadata',
          metadataHeaders: ['From', 'Subject', 'Date'],
        });

        const headers = detail.data.payload?.headers || [];
        const getHeader = (name: string) =>
          headers.find(h => h.name === name)?.value || '';

        const fromRaw = getHeader('From');
        const fromMatch = fromRaw.match(/^([^<]+)/);
        const from = fromMatch ? fromMatch[1].trim().replace(/"/g, '') : fromRaw;

        const isImportant = detail.data.labelIds?.includes('IMPORTANT') || false;

        return {
          id: msg.id!,
          from,
          subject: getHeader('Subject'),
          snippet: detail.data.snippet || '',
          date: formatEmailDate(getHeader('Date')),
          important: isImportant,
        };
      })
    );

    return NextResponse.json({
      emails,
      source: 'google'
    });

  } catch (error) {
    console.error('Gmail API error:', error);
    return NextResponse.json({
      emails: getDemoEmails(),
      source: 'demo',
      error: 'Failed to fetch emails'
    });
  }
}

function formatEmailDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } else if (diffHours < 48) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

function getDemoEmails() {
  return [
    { id: '1', from: 'Sam Patel', subject: 'Contract draft ready for review', snippet: 'Hi Aaron, the latest contract draft is ready...', date: '8:41 AM', important: true },
    { id: '2', from: 'Lisa Wong', subject: 'Renewal terms - need input', snippet: 'Can we discuss the renewal terms before...', date: '7:58 AM', important: true },
    { id: '3', from: 'HR Team', subject: 'Benefits enrollment reminder', snippet: 'Open enrollment ends Friday...', date: 'Yesterday', important: false },
  ];
}
