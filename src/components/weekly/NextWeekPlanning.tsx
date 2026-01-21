'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Plus,
  X,
  Calendar,
  CheckCircle,
  Sparkles,
  ChevronRight,
  Lightbulb,
  Clock,
  ArrowRight,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface NextWeekPlanningProps {
  suggestions: {
    id: string;
    title: string;
    category: string;
    priority: 'high' | 'medium' | 'low';
    reason: string;
    actionable: string;
  }[];
  onAddGoal?: (goal: string) => void;
  onScheduleTime?: (goal: string, time: string) => void;
}

interface Goal {
  id: string;
  text: string;
  scheduled?: string;
  fromSuggestion?: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

function getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
  switch (priority) {
    case 'high':
      return 'bg-[var(--semantic-error-subtle)] text-[var(--semantic-error)] border-[var(--semantic-error)]';
    case 'medium':
      return 'bg-[var(--semantic-warning-subtle)] text-[var(--semantic-warning)] border-[var(--semantic-warning)]';
    case 'low':
      return 'bg-[var(--semantic-success-subtle)] text-[var(--semantic-success)] border-[var(--semantic-success)]';
  }
}

// ============================================================================
// SUGGESTION CARD
// ============================================================================

function SuggestionCard({
  suggestion,
  onAccept,
  onDismiss,
}: {
  suggestion: NextWeekPlanningProps['suggestions'][0];
  onAccept: () => void;
  onDismiss: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] overflow-hidden"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--semantic-warning-subtle)] flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-4 h-4 text-[var(--semantic-warning)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[var(--text-primary)]">{suggestion.title}</span>
              <span className={`px-2 py-0.5 text-xs rounded-full border ${getPriorityColor(suggestion.priority)}`}>
                {suggestion.priority}
              </span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-1">{suggestion.reason}</p>
          </div>
          <ChevronRight
            className={`w-5 h-5 text-[var(--text-tertiary)] transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          />
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 pt-0">
              <div className="pl-11">
                <div className="p-3 bg-[var(--bg-muted)] rounded-lg mb-3">
                  <p className="text-sm text-[var(--text-secondary)]">{suggestion.actionable}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={onAccept}
                    className="flex-1 py-2 px-3 bg-[var(--semantic-success)] hover:bg-[var(--semantic-success-vivid)] text-[var(--text-on-accent)] text-sm rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add to Goals
                  </button>
                  <button
                    onClick={onDismiss}
                    className="py-2 px-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm transition"
                  >
                    Skip
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================================
// GOAL ITEM
// ============================================================================

function GoalItem({
  goal,
  onRemove,
  onSchedule,
}: {
  goal: Goal;
  onRemove: () => void;
  onSchedule: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-center gap-3 p-3 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-default)]"
    >
      <div className="w-6 h-6 rounded-full bg-[var(--semantic-success-subtle)] flex items-center justify-center">
        <CheckCircle className="w-3 h-3 text-[var(--semantic-success)]" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm text-[var(--text-primary)]">{goal.text}</span>
        {goal.scheduled && (
          <div className="flex items-center gap-1 mt-1 text-xs text-[var(--text-secondary)]">
            <Clock className="w-3 h-3" />
            <span>{goal.scheduled}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        {!goal.scheduled && (
          <button
            onClick={onSchedule}
            className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--semantic-info)] hover:bg-[var(--semantic-info-subtle)] rounded transition"
            title="Schedule time"
          >
            <Calendar className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={onRemove}
          className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--semantic-error)] hover:bg-[var(--semantic-error-subtle)] rounded transition"
          title="Remove"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// ADD GOAL INPUT
// ============================================================================

function AddGoalInput({ onAdd }: { onAdd: (text: string) => void }) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text.trim());
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a goal for next week..."
        className="flex-1 px-4 py-2 bg-[var(--bg-muted)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:ring-2 focus:ring-[var(--semantic-success)]"
      />
      <button
        type="submit"
        disabled={!text.trim()}
        className="px-4 py-2 bg-[var(--semantic-success)] hover:bg-[var(--semantic-success-vivid)] disabled:bg-[var(--bg-muted)] disabled:text-[var(--text-tertiary)] text-[var(--text-on-accent)] text-sm rounded-lg transition flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add
      </button>
    </form>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function NextWeekPlanning({
  suggestions,
  onAddGoal,
  onScheduleTime,
}: NextWeekPlanningProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());

  const visibleSuggestions = suggestions.filter(s => !dismissedSuggestions.has(s.id));

  const handleAddGoal = (text: string) => {
    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      text,
      fromSuggestion: false,
    };
    setGoals(prev => [...prev, newGoal]);
    onAddGoal?.(text);
  };

  const handleAcceptSuggestion = (suggestion: NextWeekPlanningProps['suggestions'][0]) => {
    const newGoal: Goal = {
      id: `goal-${suggestion.id}`,
      text: suggestion.title,
      fromSuggestion: true,
    };
    setGoals(prev => [...prev, newGoal]);
    setDismissedSuggestions(prev => new Set([...prev, suggestion.id]));
    onAddGoal?.(suggestion.title);
  };

  const handleDismissSuggestion = (id: string) => {
    setDismissedSuggestions(prev => new Set([...prev, id]));
  };

  const handleRemoveGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const handleScheduleGoal = (goalId: string) => {
    // In a real app, this would open a time picker
    const scheduledTime = 'Monday morning';
    setGoals(prev =>
      prev.map(g =>
        g.id === goalId ? { ...g, scheduled: scheduledTime } : g
      )
    );
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      onScheduleTime?.(goal.text, scheduledTime);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--semantic-info)] to-[var(--semantic-info-vivid)] flex items-center justify-center">
          <Target className="w-5 h-5 text-[var(--text-on-accent)]" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Plan Next Week</h2>
          <p className="text-sm text-[var(--text-secondary)]">Set goals and intentions</p>
        </div>
      </div>

      {/* Suggestions */}
      {visibleSuggestions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--semantic-warning)]" />
            <h3 className="text-sm font-medium text-[var(--text-primary)]">Suggested Goals</h3>
          </div>
          <div className="space-y-2">
            {visibleSuggestions.map(suggestion => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onAccept={() => handleAcceptSuggestion(suggestion)}
                onDismiss={() => handleDismissSuggestion(suggestion.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-[var(--text-primary)]">Your Goals</h3>
          <span className="text-xs text-[var(--text-tertiary)]">{goals.length} goal{goals.length !== 1 ? 's' : ''}</span>
        </div>

        {goals.length === 0 ? (
          <div className="p-6 bg-[var(--bg-muted)] rounded-xl text-center">
            <Target className="w-8 h-8 text-[var(--text-quaternary)] mx-auto mb-2" />
            <p className="text-[var(--text-secondary)] text-sm">No goals set yet.</p>
            <p className="text-[var(--text-tertiary)] text-xs mt-1">Add goals from suggestions or create your own.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {goals.map(goal => (
                <GoalItem
                  key={goal.id}
                  goal={goal}
                  onRemove={() => handleRemoveGoal(goal.id)}
                  onSchedule={() => handleScheduleGoal(goal.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        <AddGoalInput onAdd={handleAddGoal} />
      </div>

      {/* Completion */}
      {goals.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-[var(--semantic-success-subtle)] rounded-xl border border-[var(--semantic-success)]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--semantic-success-subtle)] flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-[var(--semantic-success)]" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-[var(--semantic-success)]">Great planning!</p>
              <p className="text-sm text-[var(--semantic-success)]">You&apos;re set for a productive week ahead.</p>
            </div>
            <ArrowRight className="w-5 h-5 text-[var(--semantic-success)]" />
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default NextWeekPlanning;
