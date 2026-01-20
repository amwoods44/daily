import { NextResponse } from 'next/server';
import { google } from 'googleapis';

// Initiate Google OAuth flow
export async function GET() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // Scopes needed for Calendar write access and Gmail read access
  const scopes = [
    'https://www.googleapis.com/auth/calendar', // Write access for event modifications
    'https://www.googleapis.com/auth/gmail.readonly',
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // Force consent to get refresh token
  });

  return NextResponse.redirect(authUrl);
}
