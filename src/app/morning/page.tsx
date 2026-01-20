'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  Moon,
  Sparkles,
  ChevronRight,
  Check,
  Clock,
  Calendar,
  ArrowRight,
  Zap,
  Heart,
  Coffee,
} from 'lucide-react';
import { mockBriefing, type DailyBriefing } from '@/lib/mock-data';
import { generateOneThing } from '@/lib/ai-briefing';

// ============================================================================
// TYPES
// ============================================================================

type RitualStep = 'greeting' | 'day_overview' | 'one_thing' | 'quick_wins' | 'ready';

interface QuickWin {
  id: string;
  title: string;
  subtitle?: string;
  emoji: string;
  estimatedMinutes: number;
  completed: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function getGreeting(name: string): { greeting: string; emoji: React.ReactNode } {
  const timeOfDay = getTimeOfDay();
  switch (timeOfDay) {
    case 'morning':
      return {
        greeting: `Good morning, ${name}`,
        emoji: <Sun className="w-8 h-8" style={{ color: 'var(--brand-primary-vivid)' }} />
      };
    case 'afternoon':
      return {
        greeting: `Good afternoon, ${name}`,
        emoji: <Sun className="w-8 h-8" style={{ color: 'var(--brand-primary)' }} />
      };
    case 'evening':
      return {
        greeting: `Good evening, ${name}`,
        emoji: <Moon className="w-8 h-8" style={{ color: 'var(--semantic-info-vivid)' }} />
      };
    case 'night':
      return {
        greeting: `Night owl, ${name}?`,
        emoji: <Moon className="w-8 h-8" style={{ color: 'var(--semantic-info)' }} />
      };
  }
}

function getQuickWins(data: DailyBriefing): QuickWin[] {
  const wins: QuickWin[] = [];

  // Add incomplete habits
  data.habitsToday
    .filter((h) => !h.completed)
    .slice(0, 2)
    .forEach((h) => {
      wins.push({
        id: `habit-${h.habit.id}`,
        title: h.habit.name,
        emoji: h.habit.emoji,
        estimatedMinutes: 5,
        completed: false,
      });
    });

  // Add quick tasks
  data.tasks
    .filter((t) => !t.completed && t.estimatedMinutes && t.estimatedMinutes <= 15)
    .slice(0, 2)
    .forEach((t) => {
      wins.push({
        id: `task-${t.id}`,
        title: t.title,
        subtitle: t.due,
        emoji: '✅',
        estimatedMinutes: t.estimatedMinutes || 10,
        completed: false,
      });
    });

  return wins.slice(0, 4);
}

// ============================================================================
// STEP COMPONENTS
// ============================================================================

function GreetingStep({
  data,
  onNext,
}: {
  data: DailyBriefing;
  onNext: () => void;
}) {
  const { greeting, emoji } = getGreeting('Aaron');
  const sleepHours = data.health.sleep.hours;
  const sleepQuality = data.health.sleep.quality;

  useEffect(() => {
    const timer = setTimeout(onNext, 4000); // Auto-advance after 4 seconds
    return () => clearTimeout(timer);
  }, [onNext]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        style={{ marginBottom: 'var(--space-10)' }}
      >
        {emoji}
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-display-md text-balance"
        style={{
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-6)',
          fontWeight: 'var(--weight-medium)'
        }}
      >
        {greeting}
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center text-body-lg"
        style={{
          gap: 'var(--space-8)',
          color: 'var(--text-secondary)'
        }}
      >
        <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
          <span className="text-2xl">😴</span>
          <span className="text-mono" style={{ fontWeight: 'var(--weight-medium)' }}>
            {sleepHours.toFixed(1)}h • {sleepQuality}
          </span>
        </div>
        <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
          <span className="text-2xl">
            {data.weather.condition === 'sunny' ? '☀️' : data.weather.condition === 'cloudy' ? '☁️' : '🌧️'}
          </span>
          <span className="text-mono" style={{ fontWeight: 'var(--weight-medium)' }}>
            {data.weather.temp}°F
          </span>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={onNext}
        className="btn btn-ghost text-label-md flex items-center mx-auto"
        style={{
          marginTop: 'var(--space-16)',
          gap: 'var(--space-2)'
        }}
      >
        <span>Continue</span>
        <ChevronRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}

function DayOverviewStep({
  data,
  onNext,
}: {
  data: DailyBriefing;
  onNext: () => void;
}) {
  const meetings = data.meetings;
  const totalMeetingMinutes = meetings.reduce((acc, m) => {
    const [startH, startM] = m.start.split(':').map(Number);
    const [endH, endM] = m.end.split(':').map(Number);
    return acc + (endH * 60 + endM) - (startH * 60 + startM);
  }, 0);
  const meetingHours = Math.round(totalMeetingMinutes / 60 * 10) / 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{ maxWidth: '600px', margin: '0 auto' }}
    >
      <h2
        className="text-display-sm text-center text-balance"
        style={{
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-10)',
        }}
      >
        Your day at a glance
      </h2>

      {/* Stats row - monospace authority */}
      <div
        className="flex justify-center"
        style={{
          gap: 'var(--space-10)',
          marginBottom: 'var(--space-12)',
        }}
      >
        <div className="text-center">
          <div className="stat-medium">{meetings.length}</div>
          <div className="stat-label">Meetings</div>
        </div>
        <div className="text-center">
          <div className="stat-medium">{meetingHours}h</div>
          <div className="stat-label">In Calls</div>
        </div>
        <div className="text-center">
          <div className="stat-medium">{data.tasks.filter(t => !t.completed).length}</div>
          <div className="stat-label">Tasks</div>
        </div>
      </div>

      {/* Visual timeline - card system */}
      <div
        className="card"
        style={{
          marginBottom: 'var(--space-10)',
        }}
      >
        <div
          className="flex items-center text-body-sm"
          style={{
            gap: 'var(--space-2)',
            color: 'var(--text-tertiary)',
            marginBottom: 'var(--space-5)',
          }}
        >
          <Calendar className="w-4 h-4" />
          <span className="text-label-md">Today's Schedule</span>
        </div>

        <div className="stack-md">
          {meetings.slice(0, 4).map((meeting, i) => (
            <motion.div
              key={meeting.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex items-center"
              style={{ gap: 'var(--space-4)' }}
            >
              <div
                className="text-mono-sm"
                style={{
                  color: 'var(--text-quaternary)',
                  width: '64px',
                }}
              >
                {meeting.start}
              </div>
              <div style={{ flex: 1 }}>
                <div className="text-body" style={{ fontWeight: 'var(--weight-medium)', color: 'var(--text-primary)' }}>
                  {meeting.title}
                </div>
                {meeting.attendees && (
                  <div className="text-body-sm" style={{ color: 'var(--text-tertiary)' }}>
                    {meeting.attendees.join(', ')}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {meetings.length > 4 && (
            <div
              className="text-body-sm text-center"
              style={{
                color: 'var(--text-quaternary)',
                paddingTop: 'var(--space-2)',
              }}
            >
              +{meetings.length - 4} more
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onNext}
        className="btn btn-primary btn-xl flex items-center justify-center"
        style={{
          width: '100%',
          gap: 'var(--space-2)',
        }}
      >
        What matters most today
        <ArrowRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
}

function OneThingStep({
  data,
  onNext,
}: {
  data: DailyBriefing;
  onNext: () => void;
}) {
  const oneThing = generateOneThing(data);

  if (!oneThing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="text-center"
        style={{ maxWidth: '600px', margin: '0 auto' }}
      >
        <div className="stat-icon" style={{ margin: '0 auto var(--space-8)' }}>
          <Sparkles className="w-8 h-8" style={{ color: 'var(--semantic-success)' }} />
        </div>
        <h2 className="text-display-sm" style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>
          All clear!
        </h2>
        <p className="text-body-lg" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-10)' }}>
          Nothing urgent needs your attention right now.
          <br />
          Enjoy the calm.
        </p>
        <button onClick={onNext} className="btn btn-primary btn-lg">
          Continue
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center"
      style={{ maxWidth: '600px', margin: '0 auto' }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring' }}
        className="stat-icon"
        style={{ margin: '0 auto var(--space-8)' }}
      >
        <Zap className="w-8 h-8" style={{ color: 'var(--brand-primary)' }} />
      </motion.div>

      <h2
        className="text-label-md text-center"
        style={{
          color: 'var(--text-tertiary)',
          marginBottom: 'var(--space-6)',
        }}
      >
        If you do nothing else today
      </h2>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card-hero"
        style={{ marginBottom: 'var(--space-10)' }}
      >
        <div style={{ fontSize: 'var(--text-5xl)', marginBottom: 'var(--space-5)' }}>
          {oneThing.emoji || '⚡'}
        </div>
        <h3 className="text-heading-xl" style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>
          {oneThing.title}
        </h3>
        <p className="text-body-lg" style={{ color: 'var(--text-secondary)' }}>
          {oneThing.description}
        </p>
        {oneThing.context && (
          <p
            className="text-body-sm"
            style={{
              color: 'var(--brand-primary)',
              marginTop: 'var(--space-5)',
              fontStyle: 'italic',
            }}
          >
            {oneThing.context}
          </p>
        )}
      </motion.div>

      <div className="flex" style={{ gap: 'var(--space-3)' }}>
        <button onClick={onNext} className="btn btn-primary btn-lg" style={{ flex: 1 }}>
          Got it
        </button>
        <button onClick={onNext} className="btn btn-secondary btn-lg">
          Do it now
        </button>
      </div>
    </motion.div>
  );
}

function QuickWinsStep({
  data,
  onNext,
}: {
  data: DailyBriefing;
  onNext: () => void;
}) {
  const [wins, setWins] = useState<QuickWin[]>(() => getQuickWins(data));
  const [showCelebration, setShowCelebration] = useState(false);

  const toggleWin = (id: string) => {
    setWins((prev) =>
      prev.map((w) => (w.id === id ? { ...w, completed: !w.completed } : w))
    );
  };

  const completedCount = wins.filter((w) => w.completed).length;

  useEffect(() => {
    if (completedCount > 0 && completedCount === wins.length) {
      // Use timeout to avoid synchronous setState in effect
      const showTimer = setTimeout(() => setShowCelebration(true), 0);
      const hideTimer = setTimeout(() => setShowCelebration(false), 2000);
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [completedCount, wins.length]);

  if (wins.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="text-center"
        style={{ maxWidth: '600px', margin: '0 auto' }}
      >
        <div className="stat-icon" style={{ margin: '0 auto var(--space-8)' }}>
          <Coffee className="w-8 h-8" style={{ color: 'var(--brand-primary)' }} />
        </div>
        <h2 className="text-display-sm" style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>
          No quick wins right now
        </h2>
        <p className="text-body-lg" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-10)' }}>
          Your morning is clear for focus work.
        </p>
        <button onClick={onNext} className="btn btn-primary btn-lg">
          Let's go
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{ maxWidth: '600px', margin: '0 auto' }}
    >
      <div className="text-center" style={{ marginBottom: 'var(--space-10)' }}>
        <h2 className="text-display-sm" style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>
          Quick wins
        </h2>
        <p className="text-body-lg" style={{ color: 'var(--text-secondary)' }}>
          Knock these out in under 15 minutes
        </p>
      </div>

      <div className="stack-md" style={{ marginBottom: 'var(--space-10)' }}>
        {wins.map((win, i) => (
          <motion.button
            key={win.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => toggleWin(win.id)}
            className={win.completed ? 'card-success' : 'card'}
            style={{
              width: '100%',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)',
              cursor: 'pointer',
            }}
          >
            <div
              className={win.completed ? 'stat-icon' : 'stat-icon'}
              style={{
                backgroundColor: win.completed ? 'var(--semantic-success-subtle)' : 'var(--bg-muted)',
              }}
            >
              {win.completed ? (
                <Check className="w-5 h-5" style={{ color: 'var(--semantic-success)' }} />
              ) : (
                <span style={{ fontSize: 'var(--text-2xl)' }}>{win.emoji}</span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div
                className="text-body"
                style={{
                  fontWeight: 'var(--weight-medium)',
                  color: win.completed ? 'var(--semantic-success)' : 'var(--text-primary)',
                  textDecoration: win.completed ? 'line-through' : 'none',
                }}
              >
                {win.title}
              </div>
              {win.subtitle && (
                <div className="text-body-sm" style={{ color: 'var(--text-tertiary)' }}>
                  {win.subtitle}
                </div>
              )}
            </div>
            <div
              className="flex items-center text-mono-sm"
              style={{
                color: 'var(--text-quaternary)',
                gap: 'var(--space-1)',
              }}
            >
              <Clock className="w-3 h-3" />
              {win.estimatedMinutes}m
            </div>
          </motion.button>
        ))}
      </div>

      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
          >
            <div
              className="card-hero text-center"
              style={{ maxWidth: '400px' }}
            >
              <div style={{ fontSize: 'var(--text-6xl)', marginBottom: 'var(--space-5)' }}>🎉</div>
              <div className="text-heading-xl" style={{ color: 'var(--text-primary)' }}>
                All done!
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={onNext}
        className="btn btn-primary btn-xl flex items-center justify-center"
        style={{
          width: '100%',
          gap: 'var(--space-2)',
        }}
      >
        {completedCount === wins.length ? "I'm ready" : 'Continue to dashboard'}
        <ArrowRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
}

function ReadyStep({ onComplete }: { onComplete: () => void }) {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      onComplete();
    }
  }, [countdown, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring' }}
        className="stat-icon"
        style={{
          width: '80px',
          height: '80px',
          margin: '0 auto var(--space-10)',
          backgroundColor: 'var(--semantic-success-subtle)',
        }}
      >
        <Heart className="w-10 h-10" style={{ color: 'var(--semantic-success)' }} />
      </motion.div>

      <h2
        className="text-display-md"
        style={{
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-5)',
          fontWeight: 'var(--weight-medium)',
        }}
      >
        You're set
      </h2>
      <p
        className="text-body-xl"
        style={{
          color: 'var(--text-secondary)',
          marginBottom: 'var(--space-10)',
        }}
      >
        Have a great day.
      </p>

      <button onClick={onComplete} className="btn btn-primary btn-xl">
        Open dashboard
      </button>
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MorningRitualPage() {
  const router = useRouter();
  const [step, setStep] = useState<RitualStep>('greeting');
  // Use lazy initializer instead of effect for static data
  const [data] = useState<DailyBriefing | null>(() => mockBriefing);

  const handleComplete = useCallback(() => {
    router.push('/');
  }, [router]);

  if (!data) {
    return (
      <div
        className="min-h-screen grain-overlay flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-canvas)' }}
      >
        <div className="skeleton h-8 w-32" style={{ borderRadius: 'var(--radius-lg)' }} />
      </div>
    );
  }

  const steps: RitualStep[] = ['greeting', 'day_overview', 'one_thing', 'quick_wins', 'ready'];
  const currentIndex = steps.indexOf(step);

  return (
    <div
      className="min-h-screen grain-overlay flex flex-col"
      style={{ backgroundColor: 'var(--bg-canvas)' }}
    >
      {/* Progress bar */}
      <div
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          height: '2px',
          backgroundColor: 'var(--bg-muted)'
        }}
      >
        <motion.div
          style={{
            height: '100%',
            backgroundColor: 'var(--brand-primary)'
          }}
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Skip button */}
      <button
        onClick={handleComplete}
        className="btn btn-ghost btn-sm fixed top-6 right-6 z-50"
      >
        Skip ritual
      </button>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {step === 'greeting' && (
            <GreetingStep
              key="greeting"
              data={data}
              onNext={() => setStep('day_overview')}
            />
          )}
          {step === 'day_overview' && (
            <DayOverviewStep
              key="day_overview"
              data={data}
              onNext={() => setStep('one_thing')}
            />
          )}
          {step === 'one_thing' && (
            <OneThingStep
              key="one_thing"
              data={data}
              onNext={() => setStep('quick_wins')}
            />
          )}
          {step === 'quick_wins' && (
            <QuickWinsStep
              key="quick_wins"
              data={data}
              onNext={() => setStep('ready')}
            />
          )}
          {step === 'ready' && (
            <ReadyStep key="ready" onComplete={handleComplete} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
