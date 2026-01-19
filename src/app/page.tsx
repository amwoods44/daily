'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sun, Cloud, CloudRain, RefreshCw, Settings, Coffee, ChevronDown, ChevronUp, Command, Calendar, Heart, Users } from 'lucide-react';
import Link from 'next/link';
import { bucketItems, type UnifiedItem } from '@/lib/temporal-buckets';
import { mockBriefing, type DailyBriefing } from '@/lib/mock-data';
import { generateAIBriefing, generateOneThing, getAdaptiveGreeting } from '@/lib/ai-briefing';
import { AIBriefingCard, OneThingCard } from '@/components/briefing';
import { Timeline } from '@/components/schedule';
import { UnifiedItemList } from '@/components/temporal';
import { NudgeCards } from '@/components/nudges';
import { PulseCheckSection } from '@/components/pulse-check';
import { CommandBar } from '@/components/nlp';

// ============================================================================
// COMPONENTS
// ============================================================================

function WeatherIcon({ condition }: { condition: string }) {
  switch (condition) {
    case 'sunny':
      return <Sun className="w-5 h-5 text-amber-500" />;
    case 'cloudy':
      return <Cloud className="w-5 h-5 text-stone-400" />;
    case 'rainy':
      return <CloudRain className="w-5 h-5 text-blue-400" />;
    default:
      return <Sun className="w-5 h-5 text-amber-500" />;
  }
}

function CollapsibleSection({
  title,
  count,
  children,
  defaultExpanded = false,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (count === 0) return null;

  return (
    <section className="mb-8">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-3 group"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 group-hover:text-stone-600 transition">
            {title}
          </h2>
          <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded">
            {count}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-stone-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-stone-400" />
        )}
      </button>
      {expanded && <div className="mt-2">{children}</div>}
    </section>
  );
}

function EmptyRightNow() {
  const hour = new Date().getHours();
  const isEvening = hour >= 18;
  const isMorning = hour >= 5 && hour < 12;

  let message = "Your first task hasn't surfaced yet. Enjoy the calm.";
  if (isMorning) {
    message =
      "Nothing urgent. You have time for a real breakfast or a quick review of yesterday's notes.";
  } else if (isEvening) {
    message = 'All clear. Good time to wind down or prep for tomorrow.';
  }

  return (
    <div className="bg-stone-50 rounded-2xl p-8 border border-stone-200/60 text-center">
      <p className="text-stone-500">{message}</p>
    </div>
  );
}

function QuickStats({
  urgentCount,
  todayCount,
  weekCount,
}: {
  urgentCount: number;
  todayCount: number;
  weekCount: number;
}) {
  return (
    <div className="flex items-center gap-4 text-sm">
      {urgentCount > 0 && (
        <span className="text-amber-600 font-medium">{urgentCount} urgent</span>
      )}
      <span className="text-stone-400">•</span>
      <span className="text-stone-500">{todayCount} today</span>
      <span className="text-stone-400">•</span>
      <span className="text-stone-400">{weekCount} this week</span>
    </div>
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
      // In a real app, this would fetch from /api/pulse
      // For now, use mock data
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
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

  const handleAction = useCallback((actionId: string, item?: UnifiedItem) => {
    console.log('Action:', actionId, item?.id);
    // TODO: Implement action handlers
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-stone-500">
          <Coffee className="w-6 h-6 animate-pulse" />
          <span className="text-lg">Brewing your daily pulse...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Generate AI content
  const greeting = getAdaptiveGreeting('Aaron');
  const briefing = generateAIBriefing(data);
  const oneThing = generateOneThing(data);
  const buckets = bucketItems(data);

  // Secondary urgent items (everything in RIGHT NOW except the #1 priority)
  const secondaryUrgent = buckets.rightNow.filter((item) => {
    if (!oneThing) return true;
    return item.title !== oneThing.title;
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-stone-50">
      {/* ================================================================
          HEADER
          ================================================================ */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between">
            {/* Greeting */}
            <div>
              <h1 className="text-2xl font-semibold text-stone-900">{greeting}</h1>
              <p className="text-stone-400 mt-1">{currentDate}</p>
            </div>

            {/* Controls & Weather */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition"
                aria-label="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <Link
                href="/settings"
                className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition"
                aria-label="Settings"
              >
                <Settings className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-2 pl-3 ml-1 border-l border-stone-200">
                <WeatherIcon condition={data.weather.condition} />
                <span className="text-sm font-medium text-stone-700">
                  {data.weather.temp}°
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-4">
            <QuickStats
              urgentCount={buckets.rightNow.length}
              todayCount={buckets.today.length}
              weekCount={buckets.thisWeek.length}
            />
          </div>
        </div>
      </header>

      {/* ================================================================
          MAIN CONTENT
          ================================================================ */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* AI Briefing */}
        <section className="mb-8">
          <AIBriefingCard briefing={briefing} />
        </section>

        {/* AI Nudge Cards */}
        {data.nudges && data.nudges.length > 0 && (
          <section className="mb-8">
            <NudgeCards nudges={data.nudges} onAction={handleAction} />
          </section>
        )}

        {/* Your One Thing (Hero Priority) */}
        {oneThing ? (
          <section className="mb-8">
            <OneThingCard oneThing={oneThing} onAction={handleAction} />
          </section>
        ) : (
          <section className="mb-8">
            <EmptyRightNow />
          </section>
        )}

        {/* Also Needs Attention (other RIGHT NOW items) */}
        {secondaryUrgent.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4">
              Also Needs Attention
            </h2>
            <UnifiedItemList
              items={secondaryUrgent}
              onAction={handleAction}
              isSecondary
            />
          </section>
        )}

        {/* Your Day (Schedule Timeline) */}
        {data.meetings.length > 0 && (
          <CollapsibleSection
            title="Your Day"
            count={data.meetings.length}
            defaultExpanded
          >
            <div className="bg-white rounded-xl p-5 border border-stone-200">
              <Timeline meetings={data.meetings} />
            </div>
          </CollapsibleSection>
        )}

        {/* Today (tasks, habits, emails for today) */}
        {buckets.today.length > 0 && (
          <CollapsibleSection title="Today" count={buckets.today.length}>
            <UnifiedItemList items={buckets.today} onAction={handleAction} />
          </CollapsibleSection>
        )}

        {/* This Week */}
        {buckets.thisWeek.length > 0 && (
          <CollapsibleSection title="This Week" count={buckets.thisWeek.length}>
            <UnifiedItemList items={buckets.thisWeek} onAction={handleAction} />
          </CollapsibleSection>
        )}

        {/* Pulse Check (Reference Data) */}
        <section className="mb-8">
          <PulseCheckSection
            pulseScore={data.pulseScore}
            health={data.health}
            finance={data.finance}
            relationships={data.relationships}
            habitsToday={data.habitsToday}
            vehicles={data.vehicles}
          />
        </section>

        {/* Insights */}
        {buckets.insights.length > 0 && (
          <CollapsibleSection title="Insights" count={buckets.insights.length}>
            <div className="space-y-2">
              {buckets.insights.map((insight, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg p-4 border border-stone-200 text-stone-600 text-sm"
                >
                  {insight}
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}
      </main>

      {/* ================================================================
          FOOTER
          ================================================================ */}
      <footer className="max-w-3xl mx-auto px-6 py-8 text-center">
        <p className="text-xs text-stone-400">
          Last updated{' '}
          {new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </p>
      </footer>

      {/* ================================================================
          COMMAND BAR (CMD+K)
          ================================================================ */}
      <CommandBar
        isOpen={commandBarOpen}
        onClose={() => setCommandBarOpen(false)}
        currentPage="/"
      />

      {/* ================================================================
          QUICK ACCESS NAV
          ================================================================ */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-lg rounded-full shadow-lg border border-stone-200/50 px-2 py-2 flex items-center gap-1 z-40">
        <Link
          href="/morning"
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-stone-600 hover:bg-stone-100 transition"
        >
          <Coffee className="w-4 h-4" />
          <span className="hidden sm:inline">Morning</span>
        </Link>
        <Link
          href="/weekly"
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-stone-600 hover:bg-stone-100 transition"
        >
          <Calendar className="w-4 h-4" />
          <span className="hidden sm:inline">Weekly</span>
        </Link>
        <button
          onClick={() => setCommandBarOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-full text-sm hover:bg-stone-800 transition"
        >
          <Command className="w-4 h-4" />
          <span className="hidden sm:inline">⌘K</span>
        </button>
      </nav>
    </div>
  );
}
