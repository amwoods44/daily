'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, Heart, DollarSign, Users, Activity, ClipboardList, Shield } from 'lucide-react';
import Link from 'next/link';
import type { PulseScore, HealthMetrics, FinanceOverview, Relationship, HabitToday, Vehicle } from '@/lib/mock-data';

interface PulseCheckSectionProps {
  pulseScore: PulseScore;
  health: HealthMetrics;
  finance: FinanceOverview;
  relationships: Relationship[];
  habitsToday: HabitToday[];
  vehicles: Vehicle[];
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') return <TrendingUp className="w-3 h-3" style={{ color: 'var(--success)' }} />;
  if (trend === 'down') return <TrendingDown className="w-3 h-3" style={{ color: 'var(--error)' }} />;
  return <Minus className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />;
}

function ScoreBar({ score, label, trend }: { score: number; label: string; trend: 'up' | 'down' | 'stable' }) {
  const getColor = (s: number) => {
    if (s >= 80) return 'var(--success)';
    if (s >= 60) return 'var(--warning)';
    return 'var(--error)';
  };

  return (
    <div className="flex items-center gap-3">
      <div className="w-24 text-xs" style={{ color: 'var(--text-tertiary)' }}>{label}</div>
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--bg-tertiary)' }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, backgroundColor: getColor(score) }}
        />
      </div>
      <div className="flex items-center gap-1.5 w-14">
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{score}</span>
        <TrendIcon trend={trend} />
      </div>
    </div>
  );
}

function SubSection({
  title,
  icon: Icon,
  children,
  defaultExpanded = false,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div style={{ borderBottom: '1px solid var(--border-subtle)' }} className="last:border-b-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-4 group"
      >
        <div className="flex items-center gap-2.5">
          <Icon className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <span
            className="text-sm font-medium transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            {title}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        ) : (
          <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        )}
      </button>
      {expanded && <div className="pb-5">{children}</div>}
    </div>
  );
}

export function PulseCheckSection({
  pulseScore,
  health,
  finance,
  relationships,
  habitsToday,
  vehicles,
}: PulseCheckSectionProps) {
  const [expanded, setExpanded] = useState(false);

  const completedHabits = habitsToday.filter((h) => h.completed).length;
  const totalHabits = habitsToday.length;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--error)';
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-6 group"
      >
        <div className="flex items-center gap-5">
          <h2
            className="text-xs font-semibold uppercase tracking-[0.15em] transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            Pulse Check
          </h2>
          {/* Overall Score Badge */}
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm"
              style={{
                backgroundColor: getScoreColor(pulseScore.overall),
                color: 'white',
              }}
            >
              {pulseScore.overall}
            </div>
            <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Overall</span>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        ) : (
          <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        )}
      </button>

      {/* Content */}
      {expanded && (
        <div className="px-6 pb-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {/* Score Breakdown */}
          <div className="py-5 space-y-3">
            <ScoreBar
              score={pulseScore.breakdown.responsiveness.score}
              label="Responsiveness"
              trend={pulseScore.breakdown.responsiveness.trend}
            />
            <ScoreBar
              score={pulseScore.breakdown.commitments.score}
              label="Commitments"
              trend={pulseScore.breakdown.commitments.trend}
            />
            <ScoreBar
              score={pulseScore.breakdown.relationships.score}
              label="Relationships"
              trend={pulseScore.breakdown.relationships.trend}
            />
            <ScoreBar
              score={pulseScore.breakdown.health.score}
              label="Health"
              trend={pulseScore.breakdown.health.trend}
            />
            <ScoreBar
              score={pulseScore.breakdown.lifeAdmin.score}
              label="Life Admin"
              trend={pulseScore.breakdown.lifeAdmin.trend}
            />
          </div>

          {/* Subsections */}
          <div style={{ borderTop: '1px solid var(--border-subtle)' }} className="pt-2">
            {/* Health */}
            <SubSection title="Health" icon={Heart}>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Sleep</span>
                  <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {health.sleep.hours}h ({health.sleep.quality})
                  </p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>HRV</span>
                  <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>{health.hrv} ms</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Steps</span>
                  <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {health.steps.toLocaleString()} / {health.stepsGoal.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Resting HR</span>
                  <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>{health.restingHR} bpm</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Water</span>
                  <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {health.waterGlasses} / {health.waterGoal} glasses
                  </p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Active Minutes</span>
                  <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>{health.activeMinutes} min</p>
                </div>
              </div>
            </SubSection>

            {/* Finance */}
            <SubSection title="Finance" icon={DollarSign}>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Checking</span>
                  <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                    ${finance.checking.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Savings</span>
                  <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                    ${finance.savings.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Credit Card</span>
                  <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                    ${finance.creditCardBalance.toLocaleString()} / ${finance.creditCardLimit.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Investments</span>
                  <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                    ${finance.investmentValue.toLocaleString()}
                    <span style={{ color: finance.investmentChange >= 0 ? 'var(--success)' : 'var(--error)' }}>
                      {' '}({finance.investmentChange >= 0 ? '+' : ''}{finance.investmentChange}%)
                    </span>
                  </p>
                </div>
                <div className="col-span-2">
                  <span style={{ color: 'var(--text-muted)' }}>Monthly Spending</span>
                  <div className="flex items-center gap-3 mt-2">
                    <div
                      className="flex-1 h-1.5 rounded-full overflow-hidden"
                      style={{ backgroundColor: 'var(--bg-tertiary)' }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(finance.monthlySpent / finance.monthlyBudget) * 100}%`,
                          backgroundColor: 'var(--accent)',
                        }}
                      />
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      ${finance.monthlySpent.toLocaleString()} / ${finance.monthlyBudget.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </SubSection>

            {/* Relationships */}
            <SubSection title="Relationships" icon={Users}>
              <div className="space-y-2.5 text-sm">
                {relationships.slice(0, 5).map((rel) => {
                  const isOverdue = rel.daysSinceContact > rel.targetFrequencyDays;
                  return (
                    <div key={rel.id} className="flex items-center justify-between">
                      <div>
                        <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{rel.name}</span>
                        <span className="ml-2" style={{ color: 'var(--text-muted)' }}>{rel.type}</span>
                      </div>
                      <span style={{ color: isOverdue ? 'var(--warning)' : 'var(--text-muted)' }}>
                        {rel.daysSinceContact}d ago
                      </span>
                    </div>
                  );
                })}
              </div>
            </SubSection>

            {/* Habits */}
            <SubSection title="Habits" icon={Activity}>
              <div className="space-y-2">
                <p className="text-sm mb-3" style={{ color: 'var(--text-tertiary)' }}>
                  {completedHabits} of {totalHabits} completed today
                </p>
                {habitsToday.map(({ habit, completed }) => (
                  <div key={habit.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span>{habit.emoji}</span>
                      <span
                        style={{
                          color: completed ? 'var(--text-muted)' : 'var(--text-secondary)',
                          textDecoration: completed ? 'line-through' : 'none',
                        }}
                      >
                        {habit.name}
                      </span>
                    </div>
                    {habit.streak > 0 && (
                      <span className="text-xs" style={{ color: 'var(--warning)' }}>{habit.streak}🔥</span>
                    )}
                  </div>
                ))}
              </div>
            </SubSection>

            {/* Vehicles */}
            {vehicles.length > 0 && (
              <SubSection title="Vehicles" icon={ClipboardList}>
                <div className="space-y-3 text-sm">
                  {vehicles.map((vehicle) => (
                    <div key={vehicle.id}>
                      <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </p>
                      <p style={{ color: 'var(--text-muted)' }}>
                        {vehicle.mileage.toLocaleString()} miles · Next: {vehicle.nextService.type}
                      </p>
                    </div>
                  ))}
                </div>
              </SubSection>
            )}

            {/* Life Vault */}
            <SubSection title="Life Vault" icon={Shield}>
              <div className="text-sm">
                <p className="mb-4" style={{ color: 'var(--text-tertiary)' }}>
                  Track important documents, assets, and accounts with automatic reminders.
                </p>
                <Link
                  href="/vault"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <Shield className="w-4 h-4" />
                  Open Vault
                </Link>
              </div>
            </SubSection>
          </div>
        </div>
      )}
    </div>
  );
}
