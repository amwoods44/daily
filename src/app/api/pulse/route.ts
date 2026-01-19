import { NextResponse } from 'next/server';

// Combined endpoint that fetches all data and generates the daily pulse
export async function GET(request: Request) {
  const baseUrl = new URL(request.url).origin;

  try {
    // Fetch all data in parallel
    const [calendarRes, emailsRes, weatherRes] = await Promise.all([
      fetch(`${baseUrl}/api/calendar`),
      fetch(`${baseUrl}/api/emails`),
      fetch(`${baseUrl}/api/weather`),
    ]);

    const [calendarData, emailsData, weatherData] = await Promise.all([
      calendarRes.json(),
      emailsRes.json(),
      weatherRes.json(),
    ]);

    // Generate insights based on calendar and emails
    const insightsRes = await fetch(`${baseUrl}/api/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        meetings: calendarData.meetings,
        emails: emailsData.emails,
      }),
    });

    const insightsData = await insightsRes.json();

    // Generate greeting based on time
    const hour = new Date().getHours();
    let greeting = 'Good evening';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 17) greeting = 'Good afternoon';

    // Format date
    const now = new Date();
    const date = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Demo tasks (would connect to Google Tasks, Todoist, etc.)
    const tasks = [
      { id: '1', title: 'Finalize QBR deck', due: 'EOD', completed: false },
      { id: '2', title: 'Review vendor invoices', due: 'Tomorrow', completed: false },
      { id: '3', title: 'Submit expense report', due: 'Friday', completed: false },
    ];

    return NextResponse.json({
      greeting,
      date,
      weather: weatherData.weather,
      meetings: calendarData.meetings,
      emails: emailsData.emails,
      tasks,
      risks: insightsData.risks || [],
      insights: insightsData.insights || [],
      sources: {
        calendar: calendarData.source,
        emails: emailsData.source,
        weather: weatherData.source,
        insights: insightsData.source,
      },
    });

  } catch (error) {
    console.error('Pulse API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate daily pulse' },
      { status: 500 }
    );
  }
}
