'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Sun, Cloud, CloudRain, RefreshCw, Settings, Coffee, Command, Calendar, Shield, ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { bucketItems, type UnifiedItem } from '@/lib/temporal-buckets';
import { mockBriefing, type DailyBriefing } from '@/lib/mock-data';
import { generateAIBriefing, generateOneThing, getAdaptiveGreeting } from '@/lib/ai-briefing';
import { Timeline } from '@/components/schedule';
import { UnifiedItemList } from '@/components/temporal';
import { NudgeCards } from '@/components/nudges';
import { PulseCheckSection } from '@/components/pulse-check';
import { CommandBar } from '@/components/nlp';
import { FocusModeProvider, FocusModeToggle, FocusModeSection } from '@/components/ui/FocusMode';
import { DayProgressCompact } from '@/components/ui/DayProgress';
import { Celebration } from '@/components/ui/Confetti';
import { SkeletonBrief, SkeletonHero, SkeletonTimeline, SkeletonTaskList } from '@/components/ui/Skeleton';
import { LifePulseStrip, getDefaultPulseItems } from '@/components/life-pulse';
import { VisualTimelineBar, getDefaultTimelineEvents } from '@/components/timeline';
import { ViewModeProvider, ViewModeToggle } from '@/components/ui/ViewModeToggle';

// ============================================================================
// EDITORIAL COMPONENTS
// ============================================================================

// WeatherIcon must be defined outside of Masthead to avoid re-creation on each render
function WeatherIcon({ condition }: { condition: string }) {
  const iconClass = "w-4 h-4";
  switch (condition) {
    case 'sunny': return <Sun className={iconClass} />;
    case 'cloudy': return <Cloud className={iconClass} />;
    case 'rainy': return <CloudRain className={iconClass} />;
    default: return <Sun className={iconClass} />;
  }
}

function Masthead({ greeting, date, weather, onRefresh, refreshing, completedTasks, totalTasks }: {
  greeting: string;
  date: string;
  weather: { temp: number; condition: string };
  onRefresh: () => void;
  refreshing: boolean;
  completedTasks: number;
  totalTasks: number;
}) {
  return (
    <header className="masthead">
      <div className="masthead-inner">
        {/* Top bar */}
        <div className="masthead-top">
          <div className="masthead-brand">Your Daily Briefing</div>
          <div className="masthead-actions">
            {/* Day Progress */}
            <DayProgressCompact completed={completedTasks} total={totalTasks} />
            <div className="w-px h-5" style={{ backgroundColor: 'var(--border)' }} />
            <div
              className="flex items-center gap-2 text-sm"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <WeatherIcon condition={weather.condition} />
              <span className="font-medium">{weather.temp}°</span>
            </div>
            <div className="w-px h-5" style={{ backgroundColor: 'var(--border)' }} />
            {/* View Mode Toggle */}
            <ViewModeToggle compact />
            <div className="w-px h-5" style={{ backgroundColor: 'var(--border)' }} />
            {/* Focus Mode */}
            <FocusModeToggle />
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="btn btn-ghost btn-sm"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <Link href="/settings" className="btn btn-ghost btn-sm">
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Main masthead */}
        <div className="masthead-center">
          <p className="masthead-date">{date}</p>
          <h1 className="masthead-greeting">{greeting}</h1>
        </div>
      </div>
    </header>
  );
}

function EditorsBrief({ briefing }: { briefing: ReturnType<typeof generateAIBriefing> }) {
  const { verdict, firstMove, waitingOnYou, watchOut, freeTime } = briefing;

  return (
    <section
      className="animate-slide-up stagger-1 opacity-0 h-full"
      style={{ animationFillMode: 'forwards' }}
    >
      <div className="premium-card-lg h-full">
        {/* Section header */}
        <div className="section-header" style={{ marginBottom: 'var(--space-6)' }}>
          <span className="section-header-label">Today&apos;s Outlook</span>
          <div className="section-header-line" />
        </div>

        {/* Verdict - the lead */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <p
            className="text-xl leading-relaxed"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', letterSpacing: '-0.01em' }}
          >
            <span style={{
              color: verdict.rating === 'Needs attention' || verdict.rating === 'Heavy' ? 'var(--accent)' : 'var(--text-primary)',
              fontWeight: 600
            }}>{verdict.rating}</span>
            {verdict.summary && (
              <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}> — {verdict.summary}</span>
            )}
          </p>
        </div>

        {/* Content grid */}
        <div className="grid md:grid-cols-2" style={{ gap: 'var(--space-8)' }}>
          {/* Left column */}
          <div className="stack-lg">
            {firstMove && (
              <div>
                <h3 className="section-header-label" style={{ marginBottom: 'var(--space-3)' }}>
                  Your First Move
                </h3>
                <p style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '14px' }}>
                  {firstMove.item}
                </p>
                <p
                  style={{ color: 'var(--text-tertiary)', fontSize: '13px', marginTop: 'var(--space-1)' }}
                >
                  {firstMove.context}
                </p>
                <p
                  className="flex items-start"
                  style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: 'var(--space-2)', gap: 'var(--space-2)' }}
                >
                  <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)', marginTop: '2px' }} />
                  {firstMove.action}
                </p>
              </div>
            )}

            {freeTime && (
              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div className="flex items-center" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                  <Clock className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>
                    {freeTime.duration} min free
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    {freeTime.startTime}–{freeTime.endTime}
                  </span>
                </div>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>
                  {freeTime.suggestion}
                </p>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="stack-lg">
            {waitingOnYou.length > 0 && (
              <div>
                <h3 className="section-header-label" style={{ marginBottom: 'var(--space-3)' }}>
                  Waiting On You
                </h3>
                <div className="stack-md">
                  {waitingOnYou.map((item, i) => (
                    <div key={i}>
                      <p style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                        <strong>{item.person}</strong>
                        <span style={{ color: 'var(--text-tertiary)' }}> — {item.context}</span>
                      </p>
                      <p
                        className="flex items-start"
                        style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: 'var(--space-1)', gap: 'var(--space-2)' }}
                      >
                        <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)', marginTop: '2px' }} />
                        {item.action}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {watchOut.length > 0 && (
              <div>
                <h3 className="section-header-label" style={{ marginBottom: 'var(--space-3)', color: 'var(--warning)' }}>
                  Watch Out
                </h3>
                <div className="stack-sm">
                  {watchOut.map((item, i) => (
                    <p key={i} style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                      {item.warning}
                      {item.action && (
                        <span style={{ color: 'var(--text-muted)' }}> → {item.action}</span>
                      )}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroPriority({ oneThing, onAction }: {
  oneThing: ReturnType<typeof generateOneThing>;
  onAction: (handler: string) => void;
}) {
  const [showWhy, setShowWhy] = useState(false);

  if (!oneThing) return null;

  return (
    <section
      className="animate-slide-up stagger-2 opacity-0 h-full"
      style={{ animationFillMode: 'forwards' }}
    >
      <div className="hero-focus-card h-full flex flex-col">
        {/* Top bar: Label + Time context */}
        <div className="flex items-center justify-between mb-6">
          <div
            className="hero-focus-label"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'transparent',
              border: '1px solid var(--accent)',
              color: 'var(--accent)',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: 'var(--accent)',
              animation: 'pulse 2s infinite',
            }} />
            Focus Now
          </div>

          {/* Time context */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
            }}
          >
            <span style={{
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}>
              10:45 AM
            </span>
            <span style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              best time
            </span>
          </div>
        </div>

        {/* Main content - THE thing */}
        <h2
          className="hero-focus-title"
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 600,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-heading)',
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
            marginBottom: 12,
          }}
        >
          {oneThing.title}
        </h2>

        <p
          style={{
            fontSize: 14,
            color: 'var(--text-tertiary)',
            lineHeight: 1.5,
            marginBottom: 24,
          }}
        >
          {oneThing.subtitle}
        </p>

        {/* Actions - prominent */}
        <div className="flex flex-wrap gap-3 mb-6">
          {oneThing.actions.slice(0, 2).map((action, i) => (
            <button
              key={i}
              onClick={() => onAction(action.handler)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: i === 0 ? '14px 28px' : '14px 20px',
                borderRadius: 'var(--radius-lg)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: 'none',
                backgroundColor: i === 0 ? 'var(--accent)' : 'var(--bg-tertiary)',
                color: i === 0 ? 'var(--text-on-accent)' : 'var(--text-secondary)',
              }}
            >
              {action.label}
            </button>
          ))}
          {oneThing.actions.length > 2 && (
            <button
              onClick={() => onAction(oneThing.actions[2].handler)}
              style={{
                padding: '14px 16px',
                fontSize: 13,
                color: 'var(--text-muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {oneThing.actions[2].label}
            </button>
          )}
        </div>

        {/* Why this first - collapsible */}
        <div className="mt-auto">
          <button
            onClick={() => setShowWhy(!showWhy)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            <ChevronRight
              style={{
                width: 14,
                height: 14,
                transform: showWhy ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
            Why this first?
          </button>

          {showWhy && (
            <div
              style={{
                padding: '12px 16px',
                marginTop: 8,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-secondary)',
                fontSize: 13,
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                animation: 'fadeIn 0.2s ease',
              }}
            >
              {oneThing.why}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="divider-with-label">
      <span>{label}</span>
    </div>
  );
}

function ScheduleSection({ meetings }: { meetings: DailyBriefing['meetings'] }) {
  if (meetings.length === 0) return null;

  return (
    <section
      className="animate-slide-up stagger-3 opacity-0"
      style={{ animationFillMode: 'forwards' }}
    >
      <div className="section-header">
        <span className="section-header-label">Your Day</span>
        <div className="section-header-line" />
        <span className="section-header-badge">{meetings.length} events</span>
      </div>

      <div className="premium-card">
        <Timeline meetings={meetings} />
      </div>
    </section>
  );
}

function TaskSection({ title, items, onAction, delay = 4 }: {
  title: string;
  items: UnifiedItem[];
  onAction: (id: string, item?: UnifiedItem) => void;
  delay?: number;
}) {
  if (items.length === 0) return null;

  return (
    <section
      className={`animate-slide-up stagger-${delay} opacity-0`}
      style={{ animationFillMode: 'forwards' }}
    >
      <div className="section-header">
        <span className="section-header-label">{title}</span>
        <div className="section-header-line" />
        <span className="section-header-badge">{items.length}</span>
      </div>

      <div className="premium-card stack-md">
        <UnifiedItemList items={items} onAction={onAction} />
      </div>
    </section>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DailyPulse() {
  const [data, setData] = useState<DailyBriefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [commandBarOpen, setCommandBarOpen] = useState(false);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [showCelebration, setShowCelebration] = useState(false);

  // Global keyboard shortcut for command bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandBarOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setCommandBarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchData = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setData(mockBriefing);
    } catch (err) {
      console.error('Failed to fetch pulse:', err);
      setData(mockBriefing);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Memoize data processing
  const { greeting, briefing, oneThing, buckets, currentDate, totalTasks, completedTasks: completedCount } = useMemo(() => {
    if (!data) {
      return {
        greeting: '',
        briefing: null,
        oneThing: null,
        buckets: { overdue: [], today: [], thisWeek: [], later: [] },
        currentDate: '',
        totalTasks: 0,
        completedTasks: 0,
      };
    }

    const greet = getAdaptiveGreeting('Aaron');
    const brief = generateAIBriefing(data);
    const one = generateOneThing(data);
    const buck = bucketItems(data);

    const date = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const total = buck.today.length + buck.thisWeek.length;

    return {
      greeting: greet,
      briefing: brief,
      oneThing: one,
      buckets: buck,
      currentDate: date,
      totalTasks: total,
      completedTasks: completedTaskIds.size,
    };
  }, [data, completedTaskIds.size]);

  // Check for all tasks completed celebration
  useEffect(() => {
    if (totalTasks > 0 && completedCount === totalTasks && !showCelebration) {
      setShowCelebration(true);
    }
  }, [completedCount, totalTasks, showCelebration]);

  const handleAction = useCallback((actionId: string, item?: UnifiedItem) => {
    console.log('Action:', actionId, item?.id);

    // Track completed tasks
    if (actionId === 'complete' && item?.id) {
      setCompletedTaskIds(prev => {
        const next = new Set(prev);
        next.add(item.id);
        return next;
      });
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen grain-overlay" style={{ backgroundColor: 'var(--bg-primary)' }}>
        {/* Skeleton Masthead */}
        <header
          className="border-b"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="max-w-6xl mx-auto px-6 py-10">
            <div className="flex items-center justify-between mb-8">
              <div className="skeleton h-3 w-32 rounded" />
              <div className="flex items-center gap-3">
                <div className="skeleton h-6 w-20 rounded-full" />
                <div className="skeleton h-6 w-12 rounded" />
              </div>
            </div>
            <div className="text-center">
              <div className="skeleton h-4 w-40 mx-auto mb-3 rounded" />
              <div className="skeleton h-12 w-64 mx-auto rounded" />
            </div>
          </div>
        </header>
        {/* Skeleton Content */}
        <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
          <SkeletonBrief />
          <SkeletonHero />
          <SkeletonTimeline />
          <SkeletonTaskList />
        </main>
      </div>
    );
  }

  if (!data || !briefing) return null;

  return (
    <ViewModeProvider>
    <FocusModeProvider>
    <div className="min-h-screen grain-overlay" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Celebration Modal */}
      <Celebration
        show={showCelebration}
        message="All tasks complete!"
        onDismiss={() => setShowCelebration(false)}
      />

      {/* Masthead */}
      <Masthead
        greeting={greeting}
        completedTasks={completedCount}
        totalTasks={totalTasks}
        date={currentDate}
        weather={data.weather}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {/* Life Pulse Strip - Your vitals at a glance */}
      <div
        className="animate-fade-in"
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: 'var(--space-6) var(--space-4)',
          marginTop: 'calc(-1 * var(--space-6))',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <LifePulseStrip items={getDefaultPulseItems()} />
      </div>

      {/* Visual Timeline Bar - See your day at a glance */}
      <div
        className="container-premium animate-slide-up stagger-1 opacity-0"
        style={{
          paddingTop: 'var(--space-4)',
          paddingBottom: 'var(--space-4)',
          animationFillMode: 'forwards',
        }}
      >
        <div className="premium-card" style={{ padding: 'var(--space-5)' }}>
          <VisualTimelineBar events={getDefaultTimelineEvents()} />
        </div>
      </div>

      {/* Main Content */}
      <main className="container-premium" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        {/* Top Section: Brief + Hero side by side on larger screens */}
        <div className="grid-premium grid-premium-2">
          {/* AI Briefing - The Lead Story */}
          <FocusModeSection>
            <EditorsBrief briefing={briefing} />
          </FocusModeSection>

          {/* Hero Priority - Always visible in focus mode */}
          {oneThing && (
            <FocusModeSection isPriority>
              <HeroPriority oneThing={oneThing} onAction={handleAction} />
            </FocusModeSection>
          )}
        </div>

        {/* Nudges */}
        {data.nudges && data.nudges.length > 0 && (
          <FocusModeSection>
            <div style={{ marginTop: 'var(--space-12)' }} className="animate-slide-up stagger-2 opacity-0" >
              <NudgeCards nudges={data.nudges} onAction={handleAction} />
            </div>
          </FocusModeSection>
        )}

        {/* Schedule + Tasks Grid */}
        <div className="grid-premium grid-premium-3" style={{ marginTop: 'var(--space-12)' }}>
          {/* Schedule - Left column */}
          <FocusModeSection>
            <ScheduleSection meetings={data.meetings} />
          </FocusModeSection>

          {/* Tasks: Today - Middle column, Priority in focus mode */}
          <FocusModeSection isPriority>
            <TaskSection
              title="Today"
              items={buckets.today}
              onAction={handleAction}
              delay={4}
            />
          </FocusModeSection>

          {/* Tasks: This Week - Right column */}
          <FocusModeSection>
            <TaskSection
              title="This Week"
              items={buckets.thisWeek}
              onAction={handleAction}
              delay={5}
            />
          </FocusModeSection>
        </div>

        {/* Pulse Check */}
        <FocusModeSection>
          <div style={{ marginTop: 'var(--space-12)' }}>
            <SectionDivider label="Life Overview" />
            <PulseCheckSection
              pulseScore={data.pulseScore}
              health={data.health}
              finance={data.finance}
              relationships={data.relationships}
              habitsToday={data.habitsToday}
              vehicles={data.vehicles}
            />
          </div>
        </FocusModeSection>
      </main>

      {/* Footer */}
      <footer className="container-premium" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-20)' }}>
        <div className="divider-subtle" />
        <p className="text-center" style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 'var(--space-6)' }}>
          Updated {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </p>
      </footer>

      {/* Command Bar */}
      <CommandBar
        isOpen={commandBarOpen}
        onClose={() => setCommandBarOpen(false)}
        currentPage="/"
      />

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-6 left-1/2 -translate-x-1/2 glass-nav flex items-center gap-1 z-40"
        style={{
          padding: 'var(--space-2)',
          borderRadius: 'var(--radius-full)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}
      >
        {[
          { href: '/morning', icon: Coffee, label: 'Morning' },
          { href: '/weekly', icon: Calendar, label: 'Weekly' },
          { href: '/vault', icon: Shield, label: 'Vault' },
        ].map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="btn btn-ghost"
            style={{ borderRadius: 'var(--radius-full)', padding: 'var(--space-2) var(--space-4)' }}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        ))}
        <button
          onClick={() => setCommandBarOpen(true)}
          className="btn btn-primary"
          style={{ borderRadius: 'var(--radius-full)', padding: 'var(--space-2) var(--space-4)' }}
        >
          <Command className="w-4 h-4" />
          <span className="hidden sm:inline">⌘K</span>
        </button>
      </nav>
    </div>
    </FocusModeProvider>
    </ViewModeProvider>
  );
}
