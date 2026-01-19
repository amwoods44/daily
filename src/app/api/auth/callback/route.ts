import { NextResponse } from 'next/server';
import { google } from 'googleapis';

// Handle OAuth callback
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/?auth_error=' + error, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?auth_error=no_code', request.url));
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);

    // In production, you'd store these tokens securely (database, encrypted cookie, etc.)
    // For now, we'll display them for manual .env configuration
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Daily Pulse - Auth Success</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              max-width: 600px;
              margin: 50px auto;
              padding: 20px;
              background: #f5f5f5;
            }
            .card {
              background: white;
              padding: 30px;
              border-radius: 12px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            h1 { color: #22c55e; margin-bottom: 10px; }
            .token-box {
              background: #f8f8f8;
              padding: 15px;
              border-radius: 8px;
              font-family: monospace;
              font-size: 12px;
              word-break: break-all;
              margin: 10px 0;
              border: 1px solid #ddd;
            }
            .label {
              font-weight: 600;
              color: #666;
              margin-top: 20px;
              margin-bottom: 5px;
            }
            .note {
              background: #fef3c7;
              padding: 15px;
              border-radius: 8px;
              margin-top: 20px;
              font-size: 14px;
              color: #92400e;
            }
            a {
              color: #2563eb;
              text-decoration: none;
            }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>✓ Google Connected!</h1>
            <p>Add these tokens to your <code>.env.local</code> file:</p>

            <p class="label">Access Token:</p>
            <div class="token-box">${tokens.access_token}</div>

            <p class="label">Refresh Token:</p>
            <div class="token-box">${tokens.refresh_token || '(none - already had one)'}</div>

            <div class="note">
              <strong>⚠️ Keep these secret!</strong><br>
              Add to your .env.local file as:<br>
              <code>GOOGLE_ACCESS_TOKEN=...</code><br>
              <code>GOOGLE_REFRESH_TOKEN=...</code>
            </div>

            <p style="margin-top: 30px;">
              <a href="/">← Back to Daily Pulse</a>
            </p>
          </div>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });

  } catch (err) {
    console.error('OAuth error:', err);
    return NextResponse.redirect(new URL('/?auth_error=token_exchange_failed', request.url));
  }
}
