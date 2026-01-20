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
      className="max-w-md mx-auto"
    >
      <h2 className="text-2xl font-semibold text-stone-900 text-center mb-8">
        Your day at a glance
      </h2>

      {/* Stats row */}
      <div className="flex justify-center gap-8 mb-10">
        <div className="text-center">
          <div className="text-3xl font-light text-stone-900">{meetings.length}</div>
          <div className="text-sm text-stone-500">meetings</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-light text-stone-900">{meetingHours}h</div>
          <div className="text-sm text-stone-500">in calls</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-light text-stone-900">{data.tasks.filter(t => !t.completed).length}</div>
          <div className="text-sm text-stone-500">tasks</div>
        </div>
      </div>

      {/* Visual timeline */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 mb-8">
        <div className="flex items-center gap-2 text-sm text-stone-500 mb-4">
          <Calendar className="w-4 h-4" />
          <span>Today&apos;s Schedule</span>
        </div>

        <div className="space-y-3">
          {meetings.slice(0, 4).map((meeting, i) => (
            <motion.div
              key={meeting.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="text-sm font-mono text-stone-400 w-16">
                {meeting.start}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-stone-900">{meeting.title}</div>
                {meeting.attendees && (
                  <div className="text-xs text-stone-500">{meeting.attendees.join(', ')}</div>
                )}
              </div>
            </motion.div>
          ))}
          {meetings.length > 4 && (
            <div className="text-sm text-stone-400 text-center pt-2">
              +{meetings.length - 4} more
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full py-4 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition flex items-center justify-center gap-2"
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
        className="text-center max-w-md mx-auto"
      >
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-semibold text-stone-900 mb-2">All clear!</h2>
        <p className="text-stone-500 mb-8">
          Nothing urgent needs your attention right now.
          <br />
          Enjoy the calm.
        </p>
        <button
          onClick={onNext}
          className="px-8 py-4 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition"
        >
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
      className="max-w-md mx-auto text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring' }}
        className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center"
      >
        <Zap className="w-8 h-8 text-amber-600" />
      </motion.div>

      <h2 className="text-sm uppercase tracking-widest text-stone-400 mb-4">
        If you do nothing else today
      </h2>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-stone-200 mb-8"
      >
        <div className="text-4xl mb-4">{oneThing.emoji || '⚡'}</div>
        <h3 className="text-xl font-semibold text-stone-900 mb-2">{oneThing.title}</h3>
        <p className="text-stone-500">{oneThing.description}</p>
        {oneThing.context && (
          <p className="text-sm text-amber-600 mt-4 italic">{oneThing.context}</p>
        )}
      </motion.div>

      <div className="flex gap-3">
        <button
          onClick={onNext}
          className="flex-1 py-4 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition"
        >
          Got it
        </button>
        <button
          onClick={onNext}
          className="py-4 px-6 border border-stone-200 text-stone-600 rounded-xl font-medium hover:bg-stone-50 transition"
        >
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
        className="text-center max-w-md mx-auto"
      >
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-stone-100 flex items-center justify-center">
          <Coffee className="w-8 h-8 text-stone-600" />
        </div>
        <h2 className="text-2xl font-semibold text-stone-900 mb-2">No quick wins right now</h2>
        <p className="text-stone-500 mb-8">Your morning is clear for focus work.</p>
        <button
          onClick={onNext}
          className="px-8 py-4 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition"
        >
          Let&apos;s go
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-stone-900 mb-2">Quick wins</h2>
        <p className="text-stone-500">Knock these out in under 15 minutes</p>
      </div>

      <div className="space-y-3 mb-8">
        {wins.map((win, i) => (
          <motion.button
            key={win.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => toggleWin(win.id)}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
              win.completed
                ? 'border-emerald-200 bg-emerald-50'
                : 'border-stone-200 bg-white hover:border-stone-300'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                win.completed ? 'bg-emerald-200' : 'bg-stone-100'
              }`}
            >
              {win.completed ? <Check className="w-5 h-5 text-emerald-600" /> : win.emoji}
            </div>
            <div className="flex-1">
              <div className={`font-medium ${win.completed ? 'text-emerald-700 line-through' : 'text-stone-900'}`}>
                {win.title}
              </div>
              {win.subtitle && (
                <div className="text-sm text-stone-500">{win.subtitle}</div>
              )}
            </div>
            <div className="text-xs text-stone-400 flex items-center gap-1">
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
            className="fixed inset-0 flex items-center justify-center bg-black/20 z-50"
          >
            <div className="bg-white rounded-2xl p-8 text-center shadow-xl">
              <div className="text-6xl mb-4">🎉</div>
              <div className="text-xl font-semibold text-stone-900">All done!</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={onNext}
        className="w-full py-4 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition flex items-center justify-center gap-2"
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
        className="w-20 h-20 mx-auto mb-8 rounded-full bg-emerald-100 flex items-center justify-center"
      >
        <Heart className="w-10 h-10 text-emerald-600" />
      </motion.div>

      <h2 className="text-3xl font-light text-stone-900 mb-4">You&apos;re set</h2>
      <p className="text-lg text-stone-500 mb-8">Have a great day.</p>

      <button
        onClick={onComplete}
        className="px-8 py-4 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition"
      >
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
