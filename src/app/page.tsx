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
import { VisualTimelineBar, getDefaultTimelineEvents, EventDetailModal, type TimelineEvent } from '@/components/timeline';
import { ViewModeProvider, ViewModeToggle } from '@/components/ui/ViewModeToggle';
import { ThemeSwitcher } from '@/components/theme';

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
        {/* Top bar - refined spacing */}
        <div className="masthead-top">
          <div className="masthead-brand">Daily Pulse</div>
          <div className="masthead-actions">
            {/* Day Progress */}
            <DayProgressCompact completed={completedTasks} total={totalTasks} />
            <div
              style={{
                width: '1px',
                height: '20px',
                backgroundColor: 'var(--border-default)'
              }}
            />
            <div
              className="flex items-center"
              style={{
                gap: 'var(--space-2)',
                color: 'var(--text-tertiary)',
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <WeatherIcon condition={weather.condition} />
              <span style={{ fontWeight: 'var(--weight-medium)' }}>{weather.temp}°</span>
            </div>
            <div
              style={{
                width: '1px',
                height: '20px',
                backgroundColor: 'var(--border-default)'
              }}
            />
            <ViewModeToggle compact />
            <div
              style={{
                width: '1px',
                height: '20px',
                backgroundColor: 'var(--border-default)'
              }}
            />
            <FocusModeToggle />
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="btn btn-ghost btn-sm"
              aria-label="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <Link href="/settings" className="btn btn-ghost btn-sm" aria-label="Settings">
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Main masthead - DRAMATIC typography */}
        <div className="masthead-center">
          <p className="masthead-date">{date}</p>
          {/* Architectural accent line */}
          <div
            className="accent-line"
            style={{
              margin: 'var(--space-4) auto var(--space-8)',
              opacity: 0.6
            }}
          />
          <h1
            className="text-display-2xl text-balance"
            style={{
              color: 'var(--text-primary)',
              maxWidth: '800px',
              margin: '0 auto'
            }}
          >
            {greeting.replace(/\.$/, '')}
          </h1>
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
      <div className="card-accent h-full" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Section header with label */}
        <div style={{ marginBottom: 'var(--space-10)' }}>
          <span
            className="text-label-md"
            style={{
              color: 'var(--brand-primary)',
              marginBottom: 'var(--space-4)',
              display: 'block'
            }}
          >
            Today's Outlook
          </span>
          <h2
            className="text-display-sm"
            style={{ color: 'var(--text-primary)' }}
          >
            {verdict.rating}
          </h2>
        </div>

        {/* Verdict summary - editorial style */}
        {verdict.summary && (
          <div style={{ marginBottom: 'var(--space-10)' }}>
            <p
              className="text-body-lg"
              style={{
                color: 'var(--text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                maxWidth: '600px'
              }}
            >
              {verdict.summary}
            </p>
          </div>
        )}

        {/* Content grid with refined typography */}
        <div
          className="grid md:grid-cols-2"
          style={{
            gap: 'var(--space-10)',
            marginTop: 'auto'
          }}
        >
          {/* Left column */}
          <div className="stack-lg">
            {firstMove && (
              <div>
                <h3
                  className="text-label-md"
                  style={{
                    marginBottom: 'var(--space-3)',
                    color: 'var(--text-tertiary)'
                  }}
                >
                  Your First Move
                </h3>
                <p
                  className="text-body"
                  style={{
                    color: 'var(--text-primary)',
                    fontWeight: 'var(--weight-medium)'
                  }}
                >
                  {firstMove.item}
                </p>
                <p
                  className="text-body-sm"
                  style={{
                    color: 'var(--text-tertiary)',
                    marginTop: 'var(--space-1-5)'
                  }}
                >
                  {firstMove.context}
                </p>
                <p
                  className="flex items-start text-body-sm"
                  style={{
                    color: 'var(--text-secondary)',
                    marginTop: 'var(--space-3)',
                    gap: 'var(--space-2)'
                  }}
                >
                  <ChevronRight
                    className="w-4 h-4 flex-shrink-0"
                    style={{
                      color: 'var(--brand-primary)',
                      marginTop: '2px'
                    }}
                  />
                  {firstMove.action}
                </p>
              </div>
            )}

            {freeTime && (
              <div
                style={{
                  backgroundColor: 'var(--bg-accent-subtle)',
                  padding: 'var(--space-5)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div
                  className="flex items-center"
                  style={{
                    gap: 'var(--space-2)',
                    marginBottom: 'var(--space-2)'
                  }}
                >
                  <Clock className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />
                  <span
                    className="text-mono"
                    style={{
                      fontWeight: 'var(--weight-semibold)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {freeTime.duration} min free
                  </span>
                  <span
                    className="text-mono-sm"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {freeTime.startTime}–{freeTime.endTime}
                  </span>
                </div>
                <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                  {freeTime.suggestion}
                </p>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="stack-lg">
            {waitingOnYou.length > 0 && (
              <div>
                <h3
                  className="text-label-md"
                  style={{
                    marginBottom: 'var(--space-3)',
                    color: 'var(--text-tertiary)'
                  }}
                >
                  Waiting On You
                </h3>
                <div className="stack-md">
                  {waitingOnYou.map((item, i) => (
                    <div key={i}>
                      <p className="text-body" style={{ color: 'var(--text-primary)' }}>
                        <strong style={{ fontWeight: 'var(--weight-semibold)' }}>
                          {item.person}
                        </strong>
                        <span style={{ color: 'var(--text-tertiary)' }}> — {item.context}</span>
                      </p>
                      <p
                        className="flex items-start text-body-sm"
                        style={{
                          color: 'var(--text-secondary)',
                          marginTop: 'var(--space-2)',
                          gap: 'var(--space-2)'
                        }}
                      >
                        <ChevronRight
                          className="w-4 h-4 flex-shrink-0"
                          style={{
                            color: 'var(--brand-primary)',
                            marginTop: '2px'
                          }}
                        />
                        {item.action}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {watchOut.length > 0 && (
              <div>
                <h3
                  className="text-label-md"
                  style={{
                    marginBottom: 'var(--space-3)',
                    color: 'var(--semantic-warning-vivid)'
                  }}
                >
                  Watch Out
                </h3>
                <div className="stack-sm">
                  {watchOut.map((item, i) => (
                    <p
                      key={i}
                      className="text-body-sm"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {item.warning}
                      {item.action && (
                        <span style={{ color: 'var(--text-tertiary)' }}> → {item.action}</span>
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
        <div
          className="flex items-center justify-between"
          style={{ marginBottom: 'var(--space-8)' }}
        >
          <div
            className="text-label-sm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'transparent',
              border: '1.5px solid var(--brand-primary)',
              color: 'var(--brand-primary)',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: 'var(--brand-primary)',
                animation: 'pulse 2s infinite',
              }}
            />
            Focus Now
          </div>

          {/* Time context - monospace for technical precision */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
            }}
          >
            <span
              className="text-mono"
              style={{
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--text-primary)',
              }}
            >
              10:45 AM
            </span>
            <span
              className="text-label-sm"
              style={{ color: 'var(--text-tertiary)' }}
            >
              best time
            </span>
          </div>
        </div>

        {/* Main content - ARCHITECTURAL typography */}
        <h2
          className="text-display-md text-balance"
          style={{
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-4)',
          }}
        >
          {oneThing.title}
        </h2>

        <p
          className="text-body-lg"
          style={{
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-8)',
            maxWidth: '500px',
          }}
        >
          {oneThing.subtitle}
        </p>

        {/* Actions - refined button system */}
        <div
          className="flex flex-wrap"
          style={{
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-8)',
          }}
        >
          {oneThing.actions.slice(0, 2).map((action, i) => (
            <button
              key={i}
              onClick={() => onAction(action.handler)}
              className={i === 0 ? 'btn btn-primary btn-lg' : 'btn btn-secondary'}
            >
              {action.label}
            </button>
          ))}
          {oneThing.actions.length > 2 && (
            <button
              onClick={() => onAction(oneThing.actions[2].handler)}
              className="btn btn-ghost"
            >
              {oneThing.actions[2].label}
            </button>
          )}
        </div>

        {/* Why this first - refined collapsible */}
        <div style={{ marginTop: 'auto' }}>
          <button
            onClick={() => setShowWhy(!showWhy)}
            className="text-label-md"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2) 0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-tertiary)',
              transition: 'color var(--duration-fast) var(--ease-out-quart)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--brand-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
          >
            <ChevronRight
              style={{
                width: 14,
                height: 14,
                transform: showWhy ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform var(--duration-base) var(--ease-out-quart)',
              }}
            />
            Why this first?
          </button>

          {showWhy && (
            <div
              className="animate-fade-in"
              style={{
                padding: 'var(--space-4) var(--space-5)',
                marginTop: 'var(--space-3)',
                borderRadius: 'var(--radius-xl)',
                backgroundColor: 'var(--bg-accent-subtle)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <p
                className="text-body-sm"
                style={{
                  color: 'var(--text-secondary)',
                  lineHeight: 'var(--leading-relaxed)',
                }}
              >
                {oneThing.why}
              </p>
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
      {/* Signature header with DAILY PULSE style */}
      <div className="section-header">
        <span className="text-label-sm" style={{ color: 'var(--brand-primary)' }}>
          Your Day
        </span>
        <div className="section-header-line" />
        <span
          className="text-mono-sm"
          style={{
            color: 'var(--text-quaternary)',
            backgroundColor: 'var(--bg-muted)',
            padding: 'var(--space-1) var(--space-2)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          {meetings.length}
        </span>
      </div>

      <div className="card-stripe">
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
      {/* Signature header with DAILY PULSE style */}
      <div className="section-header">
        <span className="text-label-sm" style={{ color: 'var(--brand-primary)' }}>
          {title}
        </span>
        <div className="section-header-line" />
        <span
          className="text-mono-sm"
          style={{
            color: 'var(--text-quaternary)',
            backgroundColor: 'var(--bg-muted)',
            padding: 'var(--space-1) var(--space-2)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          {items.length}
        </span>
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
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(getDefaultTimelineEvents());

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

  const handleEventClick = useCallback((eventId: string) => {
    setSelectedEventId(eventId);
  }, []);

  const handleEventUpdate = useCallback((eventId: string, updates: Partial<TimelineEvent>) => {
    // Optimistic update
    setTimelineEvents(prev =>
      prev.map(e => (e.id === eventId ? { ...e, ...updates } : e))
    );

    // TODO: Sync to Google Calendar API
    console.log('Update event:', eventId, updates);
  }, []);

  const handleEventDelete = useCallback((eventId: string) => {
    // Remove from timeline
    setTimelineEvents(prev => prev.filter(e => e.id !== eventId));
    setSelectedEventId(null);

    // TODO: Sync deletion to Google Calendar API
    console.log('Delete event:', eventId);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen grain-overlay" style={{ backgroundColor: 'var(--bg-canvas)' }}>
        {/* Skeleton Masthead */}
        <header
          className="border-b"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
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
    <div className="min-h-screen grain-overlay" style={{ backgroundColor: 'var(--bg-canvas)' }}>
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

      {/* Visual Timeline Bar - Prominent with signature style */}
      <div
        className="container-premium animate-slide-up stagger-1 opacity-0"
        style={{
          paddingTop: 'var(--space-6)',
          paddingBottom: 'var(--space-6)',
          animationFillMode: 'forwards',
        }}
      >
        {/* Signature header */}
        <div
          className="flex items-center"
          style={{
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-6)',
          }}
        >
          <div className="accent-line" style={{ width: '32px', height: '3px' }} />
          <span className="text-label-sm" style={{ color: 'var(--brand-primary)' }}>
            Timeline
          </span>
        </div>

        <div className="card-accent" style={{ padding: 'var(--space-6)' }}>
          <VisualTimelineBar
            events={timelineEvents}
            onEventClick={handleEventClick}
            onEventUpdate={handleEventUpdate}
          />
        </div>
      </div>

      {/* Event Detail Modal */}
      <EventDetailModal
        event={timelineEvents.find(e => e.id === selectedEventId) || null}
        isOpen={!!selectedEventId}
        onClose={() => setSelectedEventId(null)}
        onEdit={handleEventUpdate}
        onDelete={handleEventDelete}
      />

      {/* Main Content */}
      <main className="container-premium" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        {/* Top Section: Brief + Hero with ASYMMETRIC emphasis on Brief */}
        <div className="grid-premium grid-asymmetric-3-2">
          {/* AI Briefing - The Lead Story (60% width on desktop) */}
          <FocusModeSection>
            <EditorsBrief briefing={briefing} />
          </FocusModeSection>

          {/* Hero Priority - Always visible in focus mode (40% width on desktop) */}
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

        {/* Schedule + Tasks Grid - Grouped with warm background tint */}
        <div
          className="bg-section-warm animate-fade-in"
          style={{
            marginTop: 'var(--space-12)',
            marginLeft: 'calc(-1 * var(--space-6))',
            marginRight: 'calc(-1 * var(--space-6))',
            padding: 'var(--space-10) var(--space-6)',
          }}
        >
          <div className="container-premium">
            <div className="grid-premium grid-premium-3">
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
          </div>
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
      <footer
        className="container-premium"
        style={{
          paddingTop: 'var(--space-8)',
          paddingBottom: 'var(--space-20)'
        }}
      >
        <div className="divider-subtle" />
        <p
          className="text-mono-sm text-center"
          style={{
            color: 'var(--text-quaternary)',
            marginTop: 'var(--space-6)'
          }}
        >
          Updated {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </p>
      </footer>

      {/* Command Bar */}
      <CommandBar
        isOpen={commandBarOpen}
        onClose={() => setCommandBarOpen(false)}
        currentPage="/"
      />

      {/* Bottom Navigation - Glass morphism floating nav */}
      <nav
        className="fixed bottom-6 left-1/2 -translate-x-1/2 glass-nav flex items-center z-40"
        style={{
          gap: 'var(--space-1)',
          padding: 'var(--space-2)',
          borderRadius: 'var(--radius-full)',
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
          className="btn btn-ghost"
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
