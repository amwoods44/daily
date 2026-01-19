'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, Heart, DollarSign, Users, Activity, ClipboardList } from 'lucide-react';
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
  if (trend === 'up') return <TrendingUp className="w-3 h-3 text-emerald-500" />;
  if (trend === 'down') return <TrendingDown className="w-3 h-3 text-red-500" />;
  return <Minus className="w-3 h-3 text-stone-400" />;
}

function ScoreBar({ score, label, trend }: { score: number; label: string; trend: 'up' | 'down' | 'stable' }) {
  const getColor = (s: number) => {
    if (s >= 80) return 'bg-emerald-500';
    if (s >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-center gap-3">
      <div className="w-24 text-xs text-stone-500">{label}</div>
      <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor(score)} transition-all`}
          style={{ width: `${score}%` }}
        />
      </div>
      <div className="flex items-center gap-1 w-16">
        <span className="text-xs font-medium text-stone-700">{score}</span>
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
    <div className="border-b border-stone-100 last:border-b-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-3 group"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-stone-400" />
          <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900">
            {title}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-stone-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-stone-400" />
        )}
      </button>
      {expanded && <div className="pb-4">{children}</div>}
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

  return (
    <div className="bg-white rounded-xl border border-stone-200">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 group"
      >
        <div className="flex items-center gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 group-hover:text-stone-600">
            Pulse Check
          </h2>
          {/* Overall Score Badge */}
          <div className="flex items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                pulseScore.overall >= 80
                  ? 'bg-emerald-500'
                  : pulseScore.overall >= 60
                    ? 'bg-amber-500'
                    : 'bg-red-500'
              }`}
            >
              {pulseScore.overall}
            </div>
            <span className="text-sm text-stone-500">Overall</span>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-stone-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-stone-400" />
        )}
      </button>

      {/* Content */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-stone-100">
          {/* Score Breakdown */}
          <div className="py-4 space-y-3">
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
          <div className="border-t border-stone-100 pt-2">
            {/* Health */}
            <SubSection title="Health" icon={Heart}>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-stone-400">Sleep</span>
                  <p className="font-medium text-stone-700">
                    {health.sleep.hours}h ({health.sleep.quality})
                  </p>
                </div>
                <div>
                  <span className="text-stone-400">HRV</span>
                  <p className="font-medium text-stone-700">{health.hrv} ms</p>
                </div>
                <div>
                  <span className="text-stone-400">Steps</span>
                  <p className="font-medium text-stone-700">
                    {health.steps.toLocaleString()} / {health.stepsGoal.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-stone-400">Resting HR</span>
                  <p className="font-medium text-stone-700">{health.restingHR} bpm</p>
                </div>
                <div>
                  <span className="text-stone-400">Water</span>
                  <p className="font-medium text-stone-700">
                    {health.waterGlasses} / {health.waterGoal} glasses
                  </p>
                </div>
                <div>
                  <span className="text-stone-400">Active Minutes</span>
                  <p className="font-medium text-stone-700">{health.activeMinutes} min</p>
                </div>
              </div>
            </SubSection>

            {/* Finance */}
            <SubSection title="Finance" icon={DollarSign}>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-stone-400">Checking</span>
                  <p className="font-medium text-stone-700">
                    ${finance.checking.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-stone-400">Savings</span>
                  <p className="font-medium text-stone-700">
                    ${finance.savings.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-stone-400">Credit Card</span>
                  <p className="font-medium text-stone-700">
                    ${finance.creditCardBalance.toLocaleString()} / ${finance.creditCardLimit.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-stone-400">Investments</span>
                  <p className="font-medium text-stone-700">
                    ${finance.investmentValue.toLocaleString()}
                    <span className={finance.investmentChange >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                      {' '}({finance.investmentChange >= 0 ? '+' : ''}{finance.investmentChange}%)
                    </span>
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-stone-400">Monthly Spending</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${(finance.monthlySpent / finance.monthlyBudget) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-stone-500">
                      ${finance.monthlySpent.toLocaleString()} / ${finance.monthlyBudget.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </SubSection>

            {/* Relationships */}
            <SubSection title="Relationships" icon={Users}>
              <div className="space-y-2 text-sm">
                {relationships.slice(0, 5).map((rel) => {
                  const isOverdue = rel.daysSinceContact > rel.targetFrequencyDays;
                  return (
                    <div key={rel.id} className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-stone-700">{rel.name}</span>
                        <span className="text-stone-400 ml-2">{rel.type}</span>
                      </div>
                      <span className={isOverdue ? 'text-amber-600' : 'text-stone-400'}>
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
                <p className="text-sm text-stone-500 mb-3">
                  {completedHabits} of {totalHabits} completed today
                </p>
                {habitsToday.map(({ habit, completed }) => (
                  <div key={habit.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span>{habit.emoji}</span>
                      <span className={completed ? 'text-stone-400 line-through' : 'text-stone-700'}>
                        {habit.name}
                      </span>
                    </div>
                    {habit.streak > 0 && (
                      <span className="text-xs text-amber-600">{habit.streak}🔥</span>
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
                      <p className="font-medium text-stone-700">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </p>
                      <p className="text-stone-400">
                        {vehicle.mileage.toLocaleString()} miles · Next: {vehicle.nextService.type}
                      </p>
                    </div>
                  ))}
                </div>
              </SubSection>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
