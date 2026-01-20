'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sparkles,
  Target,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { WeekInReview } from '@/components/weekly/WeekInReview';
import { NextWeekPlanning } from '@/components/weekly/NextWeekPlanning';
import type { WeeklyReview } from '@/lib/types';

// ============================================================================
// MOCK DATA
// ============================================================================

const mockReview: WeeklyReview = {
  weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  weekEnd: new Date(),
  stats: {
    tasksCompleted: 23,
    meetingsAttended: 12,
    averageSleep: 7.2,
    totalSpending: 847.32,
  },
  wins: [
    { title: 'Completed quarterly planning', category: 'productivity' },
    { title: 'Hit 10K steps 5 days', category: 'health' },
    { title: 'Stayed under budget', category: 'financial' },
  ],
  lessons: [
    'Block more focus time on calendar',
    'Start winding down earlier for better sleep',
    'Batch similar tasks together',
  ],
  nextWeekFocus: [
    'Ship feature X by Wednesday',
    'Schedule dentist appointment',
    'Reach out to Mom',
  ],
  score: 78,
  createdAt: new Date(),
};

const mockPreviousReview: WeeklyReview = {
  weekStart: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  weekEnd: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  stats: {
    tasksCompleted: 18,
    meetingsAttended: 15,
    averageSleep: 6.8,
    totalSpending: 923.50,
  },
  wins: [
    { title: 'Launched beta version', category: 'productivity' },
  ],
  lessons: [
    'Too many meetings this week',
  ],
  nextWeekFocus: [],
  score: 65,
  createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
};

const mockSuggestions = [
  {
    id: 'improve-sleep',
    title: 'Improve Sleep Quality',
    category: 'health',
    priority: 'high' as const,
    reason: 'Sleep averaged 6.8h last week, below optimal',
    actionable: 'Set a consistent bedtime of 10:30 PM for at least 5 nights',
  },
  {
    id: 'reduce-meetings',
    title: 'Protect Focus Time',
    category: 'productivity',
    priority: 'high' as const,
    reason: 'You had 15 meetings last week, leaving little deep work time',
    actionable: 'Block 2-hour focus time slots on Tuesday and Thursday mornings',
  },
  {
    id: 'reach-out',
    title: 'Connect with Family',
    category: 'relationships',
    priority: 'medium' as const,
    reason: "Haven't connected with parents in 12 days",
    actionable: 'Schedule a video call with Mom for the weekend',
  },
  {
    id: 'financial-review',
    title: 'Review Subscriptions',
    category: 'financial',
    priority: 'low' as const,
    reason: 'Recurring charges increased 15% this month',
    actionable: 'Audit all subscriptions and cancel unused ones',
  },
];

// ============================================================================
// STEP INDICATOR
// ============================================================================

function StepIndicator({
  steps,
  currentStep,
  onStepClick,
}: {
  steps: string[];
  currentStep: number;
  onStepClick: (step: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, i) => (
        <button
          key={step}
          onClick={() => onStepClick(i)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition ${
            i === currentStep
              ? 'bg-stone-900 text-white'
              : i < currentStep
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
          }`}
        >
          {i < currentStep ? (
            <CheckCircle className="w-3 h-3" />
          ) : (
            <span className="w-4 h-4 rounded-full bg-current opacity-30 flex items-center justify-center text-[10px]">
              {i + 1}
            </span>
          )}
          {step}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// COMPLETION SCREEN
// ============================================================================

function CompletionScreen({
  goalsCount,
  onFinish,
}: {
  goalsCount: number;
  onFinish: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center text-center"
      style={{
        minHeight: '60vh',
        padding: 'var(--space-6)',
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="stat-icon"
        style={{
          width: '80px',
          height: '80px',
          background: `linear-gradient(135deg, var(--semantic-success) 0%, var(--semantic-success-vivid) 100%)`,
          marginBottom: 'var(--space-8)',
        }}
      >
        <Sparkles className="w-10 h-10" style={{ color: 'var(--text-on-accent)' }} />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-display-sm"
        style={{
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-3)',
        }}
      >
        You're All Set!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-body-lg"
        style={{
          color: 'var(--text-secondary)',
          marginBottom: 'var(--space-8)',
        }}
      >
        {goalsCount > 0
          ? `${goalsCount} goal${goalsCount > 1 ? 's' : ''} ready for next week`
          : 'Ready to start fresh next week'
        }
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="stack-sm"
      >
        <button
          onClick={onFinish}
          className="btn btn-primary btn-lg flex items-center"
          style={{ gap: 'var(--space-2)' }}
        >
          Return Home
          <ArrowRight className="w-4 h-4" />
        </button>
        <p className="text-mono-sm" style={{ color: 'var(--text-quaternary)' }}>
          Your review has been saved
        </p>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function WeeklyPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [goals, setGoals] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const steps = ['Review', 'Plan'];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleAddGoal = (goal: string) => {
    setGoals(prev => [...prev, goal]);
  };

  const handleFinish = () => {
    // Navigate home - in real app
    window.location.href = '/';
  };

  if (isComplete) {
    return (
      <div className="min-h-screen grain-overlay" style={{ backgroundColor: 'var(--bg-canvas)' }}>
        <CompletionScreen goalsCount={goals.length} onFinish={handleFinish} />
      </div>
    );
  }

  return (
    <div className="min-h-screen grain-overlay" style={{ backgroundColor: 'var(--bg-canvas)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 glass"
        style={{
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            maxWidth: '672px',
            margin: '0 auto',
            padding: 'var(--space-4)',
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: 'var(--space-4)' }}
          >
            <button
              onClick={() => window.history.back()}
              className="btn-icon-sm btn-ghost"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
              <Calendar className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
              <span className="text-label-md" style={{ color: 'var(--text-primary)' }}>
                Weekly Reset
              </span>
            </div>
            <div style={{ width: '36px' }} /> {/* Spacer */}
          </div>
          <StepIndicator
            steps={steps}
            currentStep={currentStep}
            onStepClick={setCurrentStep}
          />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <WeekInReview
                review={mockReview}
                previousReview={mockPreviousReview}
              />
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <NextWeekPlanning
                suggestions={mockSuggestions}
                onAddGoal={handleAddGoal}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <footer
        className="fixed bottom-0 left-0 right-0 glass"
        style={{
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div
          className="flex items-center justify-between"
          style={{
            maxWidth: '672px',
            margin: '0 auto',
            padding: 'var(--space-4)',
          }}
        >
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              currentStep === 0
                ? 'text-stone-300 cursor-not-allowed'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition ${
                  i === currentStep ? 'bg-stone-900' : 'bg-stone-200'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg transition"
          >
            {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>

      {/* Bottom padding for fixed footer */}
      <div className="h-20" />
    </div>
  );
}
