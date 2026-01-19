# Daily Pulse ☕

Your personalized daily briefing dashboard. See your calendar, priority emails, weather, tasks, and AI-powered insights at a glance.

## Features

- 📅 **Google Calendar** - Today's meetings with join links
- 📧 **Gmail** - Priority/important emails
- 🌤️ **Weather** - Current conditions (Open-Meteo, no API key needed)
- ✅ **Tasks** - Your to-do list
- 🚨 **Risk Detection** - AI identifies urgent items
- 💡 **AI Insights** - Smart suggestions based on your schedule

## Quick Start

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - works immediately with demo data!

## Connect Real Data

### Google Calendar & Gmail

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select existing
3. Enable the **Google Calendar API** and **Gmail API**
4. Create OAuth 2.0 credentials (Web application)
5. Add redirect URI: `http://localhost:3000/api/auth/callback`
6. Create `.env.local` with your credentials:

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

7. Visit http://localhost:3000/api/auth to authorize
8. Copy the tokens to your `.env.local`:

```env
GOOGLE_ACCESS_TOKEN=your_access_token
GOOGLE_REFRESH_TOKEN=your_refresh_token
```

### OpenAI (Optional)

For AI-powered insights and risk analysis:

```env
OPENAI_API_KEY=sk-your-key
```

Without OpenAI, the app uses rule-based insights (still useful!).

## Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **googleapis** - Google Calendar & Gmail
- **OpenAI** - AI insights (optional)
- **Open-Meteo** - Weather API (free)
- **Lucide React** - Icons

## Project Structure

```
src/app/
├── page.tsx           # Main dashboard
├── settings/          # Settings page
├── api/
│   ├── pulse/         # Combined data endpoint
│   ├── calendar/      # Google Calendar
│   ├── emails/        # Gmail
│   ├── weather/       # Weather data
│   ├── insights/      # AI insights
│   └── auth/          # OAuth flow
```

## Deploy

Deploy to Vercel:

```bash
npm install -g vercel
vercel
```

Add your environment variables in the Vercel dashboard.

## License

MIT
