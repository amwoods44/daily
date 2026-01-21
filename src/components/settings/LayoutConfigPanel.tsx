'use client';

import type { LayoutConfig } from '@/lib/preferences/dashboard-config';

interface LayoutConfigPanelProps {
  layout: LayoutConfig;
  onChange: (updates: Partial<LayoutConfig>) => void;
}

const SECTIONS = [
  { key: 'lifePulse' as keyof LayoutConfig, label: 'Life Pulse Strip', description: 'Sleep, meetings, habits, finance overview' },
  { key: 'timeline' as keyof LayoutConfig, label: 'Visual Timeline Bar', description: 'Interactive hourly schedule visualization' },
  { key: 'outlook' as keyof LayoutConfig, label: "Today's Outlook", description: 'AI-generated daily briefing' },
  { key: 'focusNow' as keyof LayoutConfig, label: 'Focus Now Card', description: 'Your one priority for the day' },
  { key: 'nudges' as keyof LayoutConfig, label: 'Nudges', description: 'Smart reminders and suggestions' },
  { key: 'schedule' as keyof LayoutConfig, label: 'Schedule List', description: 'Detailed meeting list view' },
  { key: 'tasksToday' as keyof LayoutConfig, label: 'Tasks: Today', description: 'Tasks due today' },
  { key: 'tasksWeek' as keyof LayoutConfig, label: 'Tasks: This Week', description: 'Tasks due this week' },
  { key: 'lifeOverview' as keyof LayoutConfig, label: 'Life Overview', description: 'Health, finance, relationships pulse check' },
];

export function LayoutConfigPanel({ layout, onChange }: LayoutConfigPanelProps) {
  const enabledCount = SECTIONS.filter((section) => layout[section.key]).length;

  return (
    <div className="stack-lg">
      {/* Section toggles */}
      <div className="card-flat">
        <div
          className="flex items-center justify-between"
          style={{ marginBottom: 'var(--space-6)' }}
        >
          <h3 className="text-label-md" style={{ color: 'var(--brand-primary)' }}>
            Dashboard Sections
          </h3>
          <span className="text-mono-sm" style={{ color: 'var(--text-tertiary)' }}>
            {enabledCount} / {SECTIONS.length} enabled
          </span>
        </div>

        <div className="stack-sm">
          {SECTIONS.map((section) => (
            <label
              key={section.key}
              className="flex items-start cursor-pointer card"
              style={{
                gap: 'var(--space-3)',
                padding: 'var(--space-4)',
                transition: 'all var(--duration-fast) var(--ease-out-quart)',
              }}
            >
              <input
                type="checkbox"
                checked={layout[section.key] as boolean}
                onChange={(e) => onChange({ [section.key]: e.target.checked })}
                style={{
                  width: '20px',
                  height: '20px',
                  marginTop: '2px',
                  accentColor: 'var(--brand-primary)',
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  className="text-body"
                  style={{
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {section.label}
                </div>
                <p
                  className="text-body-sm"
                  style={{
                    color: 'var(--text-tertiary)',
                    marginTop: 'var(--space-1)',
                  }}
                >
                  {section.description}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Grid size selector */}
      <div className="card-flat">
        <h3
          className="text-label-md"
          style={{
            color: 'var(--brand-primary)',
            marginBottom: 'var(--space-6)',
          }}
        >
          Layout Density
        </h3>

        <div className="stack-sm">
          {[
            { value: 'compact' as const, label: 'Compact', description: 'More content, less spacing' },
            { value: 'comfortable' as const, label: 'Comfortable', description: 'Balanced spacing (recommended)' },
            { value: 'spacious' as const, label: 'Spacious', description: 'Maximum breathing room' },
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center cursor-pointer"
              style={{
                gap: 'var(--space-3)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                border: '2px solid',
                borderColor:
                  layout.gridSize === option.value
                    ? 'var(--brand-primary)'
                    : 'var(--border-default)',
                backgroundColor:
                  layout.gridSize === option.value
                    ? 'var(--brand-primary-subtle)'
                    : 'var(--bg-surface)',
                transition: 'all var(--duration-fast) var(--ease-out-quart)',
              }}
            >
              <input
                type="radio"
                name="gridSize"
                value={option.value}
                checked={layout.gridSize === option.value}
                onChange={() => onChange({ gridSize: option.value })}
                style={{
                  width: '20px',
                  height: '20px',
                  accentColor: 'var(--brand-primary)',
                }}
              />
              <div>
                <div
                  className="text-body"
                  style={{
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {option.label}
                </div>
                <p className="text-body-sm" style={{ color: 'var(--text-tertiary)' }}>
                  {option.description}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
