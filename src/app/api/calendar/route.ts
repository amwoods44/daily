import { NextResponse } from 'next/server';
import { google } from 'googleapis';

// Google Calendar API integration
export async function GET() {
  try {
    // Check for OAuth credentials
    const accessToken = process.env.GOOGLE_ACCESS_TOKEN;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!accessToken && !refreshToken) {
      // Return demo data if no credentials configured
      return NextResponse.json({
        meetings: getDemoMeetings(),
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

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Get today's events
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];

    const meetings = events.map((event, index) => ({
      id: event.id || String(index),
      title: event.summary || 'Untitled',
      start: formatTime(event.start?.dateTime || event.start?.date),
      end: formatTime(event.end?.dateTime || event.end?.date),
      attendees: event.attendees?.map(a => a.displayName || a.email || 'Unknown') || [],
      location: event.location || undefined,
      meetLink: event.hangoutLink || undefined,
    }));

    return NextResponse.json({
      meetings,
      source: 'google'
    });

  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json({
      meetings: getDemoMeetings(),
      source: 'demo',
      error: 'Failed to fetch calendar'
    });
  }
}

function formatTime(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

function getDemoMeetings() {
  return [
    { id: '1', title: 'Daily Standup', start: '09:00', end: '09:30', attendees: ['Team'] },
    { id: '2', title: 'Client Go-Live Readiness', start: '10:00', end: '10:45', attendees: ['Sam Patel', 'Lisa Wong'] },
    { id: '3', title: 'Q1 Planning Review', start: '14:00', end: '15:00', attendees: ['Leadership'] },
  ];
}
