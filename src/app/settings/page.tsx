'use client';

import { useState, useEffect } from 'react';
import { Settings, Calendar, Mail, Cloud, Sparkles, ArrowLeft, Check, X, ExternalLink, Sliders } from 'lucide-react';
import Link from 'next/link';

interface ConnectionStatus {
  calendar: boolean;
  email: boolean;
  weather: boolean;
  ai: boolean;
}

export default function SettingsPage() {
  const [status, setStatus] = useState<ConnectionStatus>({
    calendar: false,
    email: false,
    weather: true, // Weather is always available (no auth needed)
    ai: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check connection status by fetching pulse data
    fetch('/api/pulse')
      .then(res => res.json())
      .then(data => {
        setStatus({
          calendar: data.sources?.calendar === 'google',
          email: data.sources?.emails === 'google',
          weather: data.sources?.weather === 'open-meteo',
          ai: data.sources?.insights === 'openai',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const connections = [
    {
      id: 'google',
      name: 'Google Account',
      description: 'Calendar events and Gmail messages',
      icons: [Calendar, Mail],
      connected: status.calendar && status.email,
      authUrl: '/api/auth',
      setupUrl: 'https://console.cloud.google.com/apis/credentials',
    },
    {
      id: 'weather',
      name: 'Weather',
      description: 'Open-Meteo (free, no setup required)',
      icons: [Cloud],
      connected: status.weather,
      authUrl: null,
      setupUrl: null,
    },
    {
      id: 'ai',
      name: 'OpenAI',
      description: 'AI-powered insights and risk analysis',
      icons: [Sparkles],
      connected: status.ai,
      authUrl: null,
      setupUrl: 'https://platform.openai.com/api-keys',
    },
  ];

  return (
    <div className="min-h-screen grain-overlay" style={{ backgroundColor: 'var(--bg-canvas)' }}>
      <header className="masthead">
        <div
          className="masthead-inner"
          style={{
            maxWidth: '896px',
            margin: '0 auto',
          }}
        >
          <Link
            href="/"
            className="btn btn-ghost btn-sm inline-flex items-center"
            style={{
              gap: 'var(--space-2)',
              marginBottom: 'var(--space-6)',
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Daily Pulse
          </Link>
          <div className="flex items-center" style={{ gap: 'var(--space-4)' }}>
            <Settings className="w-8 h-8" style={{ color: 'var(--brand-primary)' }} />
            <h1 className="text-display-md" style={{ color: 'var(--text-primary)' }}>
              Settings
            </h1>
          </div>
          <p
            className="text-body-lg"
            style={{
              color: 'var(--text-secondary)',
              marginTop: 'var(--space-3)',
            }}
          >
            Connect your accounts to see real data
          </p>
        </div>
      </header>

      <main
        style={{
          maxWidth: '896px',
          margin: '0 auto',
          padding: 'var(--space-8) var(--space-6)',
        }}
      >
        {/* Dashboard Customization Card */}
        <div
          className="card-accent"
          style={{
            marginBottom: 'var(--space-8)',
          }}
        >
          <div
            className="flex items-center"
            style={{ gap: 'var(--space-4)' }}
          >
            <div className="stat-icon">
              <Sliders className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h2
                className="text-heading-lg"
                style={{
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-1)',
                }}
              >
                Customize Dashboard
              </h2>
              <p className="text-body-sm" style={{ color: 'var(--text-tertiary)' }}>
                Personalize layout, toggle sections, set your name and location
              </p>
            </div>
            <Link href="/settings/dashboard" className="btn btn-primary">
              Configure →
            </Link>
          </div>
        </div>

        <section
          className="card stack-xs"
          style={{
            borderRadius: 'var(--radius-2xl)',
            padding: 0,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: 'var(--space-6)' }}>
            <h2 className="text-heading-lg" style={{ color: 'var(--text-primary)' }}>
              Connected Services
            </h2>
          </div>

          {connections.map(conn => (
            <div key={conn.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-1">
                  {conn.icons.map((Icon, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white"
                    >
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{conn.name}</p>
                  <p className="text-sm text-gray-500">{conn.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {loading ? (
                  <span className="text-sm text-gray-400">Checking...</span>
                ) : conn.connected ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                    <Check className="w-4 h-4" />
                    Connected
                  </span>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-500 text-sm font-medium rounded-full">
                      <X className="w-4 h-4" />
                      Not connected
                    </span>
                    {conn.authUrl && (
                      <a
                        href={conn.authUrl}
                        className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition"
                      >
                        Connect
                      </a>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </section>

        <section className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Setup Instructions</h2>

          <div className="space-y-6 text-sm">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">1. Google Calendar & Gmail</h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>
                  Go to{' '}
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    Google Cloud Console <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>Create OAuth 2.0 credentials (Web application type)</li>
                <li>Add <code className="bg-gray-100 px-1 rounded">http://localhost:3000/api/auth/callback</code> as redirect URI</li>
                <li>Enable Calendar API and Gmail API</li>
                <li>Copy Client ID and Secret to <code className="bg-gray-100 px-1 rounded">.env.local</code></li>
                <li>Click &quot;Connect&quot; above to authorize</li>
              </ol>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-2">2. OpenAI (optional)</h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>
                  Get an API key from{' '}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    OpenAI <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>Add <code className="bg-gray-100 px-1 rounded">OPENAI_API_KEY=sk-...</code> to <code className="bg-gray-100 px-1 rounded">.env.local</code></li>
                <li>Restart the dev server</li>
              </ol>
            </div>
          </div>
        </section>

        <section className="mt-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6">
          <h2 className="font-semibold text-indigo-900 mb-2">Works without setup!</h2>
          <p className="text-sm text-indigo-800">
            Daily Pulse works out of the box with demo data. Connect your accounts whenever you&apos;re ready to see real calendar events, emails, and AI-powered insights.
          </p>
        </section>
      </main>
    </div>
  );
}
