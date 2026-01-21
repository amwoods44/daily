'use client';

import type { PersonalInfo } from '@/lib/preferences/dashboard-config';

interface PersonalInfoFormProps {
  personalInfo: PersonalInfo;
  onChange: (updates: Partial<PersonalInfo>) => void;
}

export function PersonalInfoForm({ personalInfo, onChange }: PersonalInfoFormProps) {
  return (
    <div className="stack-lg">
      {/* Name & Location */}
      <div className="card-flat">
        <h3
          className="text-label-md"
          style={{
            color: 'var(--brand-primary)',
            marginBottom: 'var(--space-6)',
          }}
        >
          Basic Information
        </h3>

        <div className="stack-md">
          <div>
            <label className="text-label-md" style={{ color: 'var(--text-tertiary)', display: 'block', marginBottom: 'var(--space-2)' }}>
              Name
            </label>
            <input
              type="text"
              value={personalInfo.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className="text-body"
              style={{
                width: '100%',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                border: '2px solid var(--border-default)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-base)',
              }}
            />
          </div>

          <div>
            <label className="text-label-md" style={{ color: 'var(--text-tertiary)', display: 'block', marginBottom: 'var(--space-2)' }}>
              Location
            </label>
            <input
              type="text"
              value={personalInfo.location}
              onChange={(e) => onChange({ location: e.target.value })}
              placeholder="Austin, TX"
              className="text-body"
              style={{
                width: '100%',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                border: '2px solid var(--border-default)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
              }}
            />
            <p className="text-body-sm" style={{ color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
              Used for weather and commute calculations
            </p>
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div className="card-flat">
        <h3
          className="text-label-md"
          style={{
            color: 'var(--brand-primary)',
            marginBottom: 'var(--space-6)',
          }}
        >
          Addresses (Optional)
        </h3>

        <div className="stack-md">
          <div>
            <label className="text-label-md" style={{ color: 'var(--text-tertiary)', display: 'block', marginBottom: 'var(--space-2)' }}>
              Home Address
            </label>
            <input
              type="text"
              value={personalInfo.homeAddress || ''}
              onChange={(e) => onChange({ homeAddress: e.target.value })}
              placeholder="123 Main St, Austin, TX 78701"
              className="text-body"
              style={{
                width: '100%',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                border: '2px solid var(--border-default)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div>
            <label className="text-label-md" style={{ color: 'var(--text-tertiary)', display: 'block', marginBottom: 'var(--space-2)' }}>
              Work Address
            </label>
            <input
              type="text"
              value={personalInfo.workAddress || ''}
              onChange={(e) => onChange({ workAddress: e.target.value })}
              placeholder="Downtown Office, 456 Business Ave"
              className="text-body"
              style={{
                width: '100%',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                border: '2px solid var(--border-default)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Work Hours */}
      <div className="card-flat">
        <h3
          className="text-label-md"
          style={{
            color: 'var(--brand-primary)',
            marginBottom: 'var(--space-6)',
          }}
        >
          Work Hours
        </h3>

        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div>
            <label className="text-label-md" style={{ color: 'var(--text-tertiary)', display: 'block', marginBottom: 'var(--space-2)' }}>
              Start
            </label>
            <input
              type="time"
              value={personalInfo.workHours.start}
              onChange={(e) =>
                onChange({
                  workHours: { ...personalInfo.workHours, start: e.target.value },
                })
              }
              className="text-mono"
              style={{
                width: '100%',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                border: '2px solid var(--border-default)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
              }}
            />
          </div>

          <div>
            <label className="text-label-md" style={{ color: 'var(--text-tertiary)', display: 'block', marginBottom: 'var(--space-2)' }}>
              End
            </label>
            <input
              type="time"
              value={personalInfo.workHours.end}
              onChange={(e) =>
                onChange({
                  workHours: { ...personalInfo.workHours, end: e.target.value },
                })
              }
              className="text-mono"
              style={{
                width: '100%',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                border: '2px solid var(--border-default)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Goals */}
      <div className="card-flat">
        <h3
          className="text-label-md"
          style={{
            color: 'var(--brand-primary)',
            marginBottom: 'var(--space-6)',
          }}
        >
          Daily Goals
        </h3>

        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div>
            <label className="text-label-md" style={{ color: 'var(--text-tertiary)', display: 'block', marginBottom: 'var(--space-2)' }}>
              Tasks/Day
            </label>
            <input
              type="number"
              value={personalInfo.goals.dailyTasks}
              onChange={(e) =>
                onChange({
                  goals: {
                    ...personalInfo.goals,
                    dailyTasks: parseInt(e.target.value) || 0,
                  },
                })
              }
              min="1"
              max="50"
              className="text-mono"
              style={{
                width: '100%',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                border: '2px solid var(--border-default)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-base)',
              }}
            />
          </div>

          <div>
            <label className="text-label-md" style={{ color: 'var(--text-tertiary)', display: 'block', marginBottom: 'var(--space-2)' }}>
              Weekly Goals
            </label>
            <input
              type="number"
              value={personalInfo.goals.weeklySprint}
              onChange={(e) =>
                onChange({
                  goals: {
                    ...personalInfo.goals,
                    weeklySprint: parseInt(e.target.value) || 0,
                  },
                })
              }
              min="1"
              max="10"
              className="text-mono"
              style={{
                width: '100%',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                border: '2px solid var(--border-default)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
              }}
            />
          </div>

          <div>
            <label className="text-label-md" style={{ color: 'var(--text-tertiary)', display: 'block', marginBottom: 'var(--space-2)' }}>
              Sleep (hours)
            </label>
            <input
              type="number"
              value={personalInfo.goals.sleepTarget}
              onChange={(e) =>
                onChange({
                  goals: {
                    ...personalInfo.goals,
                    sleepTarget: parseFloat(e.target.value) || 0,
                  },
                })
              }
              min="4"
              max="12"
              step="0.5"
              className="text-mono"
              style={{
                width: '100%',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                border: '2px solid var(--border-default)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="card-flat">
        <h3
          className="text-label-md"
          style={{
            color: 'var(--brand-primary)',
            marginBottom: 'var(--space-6)',
          }}
        >
          Preferences
        </h3>

        <div className="stack-md">
          <label className="flex items-center cursor-pointer" style={{ gap: 'var(--space-3)' }}>
            <input
              type="checkbox"
              checked={personalInfo.preferences.useFahrenheit}
              onChange={(e) =>
                onChange({
                  preferences: {
                    ...personalInfo.preferences,
                    useFahrenheit: e.target.checked,
                  },
                })
              }
              style={{
                width: '20px',
                height: '20px',
                accentColor: 'var(--brand-primary)',
              }}
            />
            <span className="text-body" style={{ color: 'var(--text-primary)' }}>
              Show weather in °F (Fahrenheit)
            </span>
          </label>

          <label className="flex items-center cursor-pointer" style={{ gap: 'var(--space-3)' }}>
            <input
              type="checkbox"
              checked={personalInfo.preferences.use12HourTime}
              onChange={(e) =>
                onChange({
                  preferences: {
                    ...personalInfo.preferences,
                    use12HourTime: e.target.checked,
                  },
                })
              }
              style={{
                width: '20px',
                height: '20px',
                accentColor: 'var(--brand-primary)',
              }}
            />
            <span className="text-body" style={{ color: 'var(--text-primary)' }}>
              Use 12-hour time format
            </span>
          </label>

          <label className="flex items-center cursor-pointer" style={{ gap: 'var(--space-3)' }}>
            <input
              type="checkbox"
              checked={personalInfo.preferences.showCommuteAlerts}
              onChange={(e) =>
                onChange({
                  preferences: {
                    ...personalInfo.preferences,
                    showCommuteAlerts: e.target.checked,
                  },
                })
              }
              style={{
                width: '20px',
                height: '20px',
                accentColor: 'var(--brand-primary)',
              }}
            />
            <span className="text-body" style={{ color: 'var(--text-primary)' }}>
              Show when-to-leave alerts for events
            </span>
          </label>

          <label className="flex items-center cursor-pointer" style={{ gap: 'var(--space-3)' }}>
            <input
              type="checkbox"
              checked={personalInfo.preferences.enableAI}
              onChange={(e) =>
                onChange({
                  preferences: {
                    ...personalInfo.preferences,
                    enableAI: e.target.checked,
                  },
                })
              }
              style={{
                width: '20px',
                height: '20px',
                accentColor: 'var(--brand-primary)',
              }}
            />
            <span className="text-body" style={{ color: 'var(--text-primary)' }}>
              Enable AI-powered insights
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
