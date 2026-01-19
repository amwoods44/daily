'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Command,
  Search,
  X,
  ArrowRight,
  Calendar,
  CheckSquare,
  Heart,
  DollarSign,
  Users,
  Sparkles,
  Clock,
  Mic,
  MicOff,
  Loader2,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { parseIntent, getCommandSuggestions, generateNaturalResponse } from '@/lib/nlp/intent-parser';
import type { ParsedIntent } from '@/lib/types';

// ============================================================================
// TYPES
// ============================================================================

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  onExecute?: (intent: ParsedIntent, response: string) => void;
  currentPage?: string;
  recentQueries?: string[];
}

interface CommandResult {
  success: boolean;
  message: string;
  data?: {
    events?: { title: string; time?: string }[];
    tasks?: { title: string; priority?: string }[];
    health?: { sleep: { hours: number }; steps: number; hrv: number };
    finance?: { totalBalance: number; monthlySpending: number };
    relationships?: { peopleToContact: number };
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

const INTENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  schedule: Calendar,
  tasks: CheckSquare,
  health: Heart,
  finance: DollarSign,
  relationships: Users,
  overview: Sparkles,
};

const QUICK_COMMANDS = [
  { label: "Today's schedule", command: "What's on my schedule today?", icon: Calendar },
  { label: 'Pending tasks', command: 'Show my tasks', icon: CheckSquare },
  { label: 'Health check', command: "How's my health?", icon: Heart },
  { label: 'Spending', command: 'How much did I spend?', icon: DollarSign },
  { label: 'Relationships', command: 'Who should I reach out to?', icon: Users },
];

// ============================================================================
// SUGGESTION ITEM
// ============================================================================

function SuggestionItem({
  suggestion,
  isSelected,
  onClick,
}: {
  suggestion: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  // Determine icon based on content
  let Icon = Sparkles;
  const lowerSuggestion = suggestion.toLowerCase();
  if (lowerSuggestion.includes('schedule') || lowerSuggestion.includes('calendar') || lowerSuggestion.includes('meeting')) {
    Icon = Calendar;
  } else if (lowerSuggestion.includes('task') || lowerSuggestion.includes('todo')) {
    Icon = CheckSquare;
  } else if (lowerSuggestion.includes('health') || lowerSuggestion.includes('sleep') || lowerSuggestion.includes('energy')) {
    Icon = Heart;
  } else if (lowerSuggestion.includes('spend') || lowerSuggestion.includes('money') || lowerSuggestion.includes('balance') || lowerSuggestion.includes('bill')) {
    Icon = DollarSign;
  } else if (lowerSuggestion.includes('reach') || lowerSuggestion.includes('contact') || lowerSuggestion.includes('relationship')) {
    Icon = Users;
  }

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${
        isSelected
          ? 'bg-stone-100 text-stone-900'
          : 'text-stone-600 hover:bg-stone-50'
      }`}
    >
      <Icon className="w-4 h-4 text-stone-400" />
      <span className="flex-1 text-sm">{suggestion}</span>
      <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-stone-500' : 'text-stone-300'}`} />
    </button>
  );
}

// ============================================================================
// QUICK COMMAND CHIP
// ============================================================================

function QuickCommandChip({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-full text-xs text-stone-600 transition"
    >
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </button>
  );
}

// ============================================================================
// RESULT DISPLAY
// ============================================================================

function ResultDisplay({
  result,
  intent,
}: {
  result: CommandResult;
  intent: ParsedIntent;
}) {
  const Icon = INTENT_ICONS[intent.entities.target as string] || Sparkles;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`px-4 py-4 border-t border-stone-100 ${
        result.success ? 'bg-stone-50' : 'bg-red-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          result.success ? 'bg-emerald-100' : 'bg-red-100'
        }`}>
          {result.success ? (
            <Icon className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
        </div>
        <div className="flex-1">
          <p className={`text-sm ${result.success ? 'text-stone-700' : 'text-red-700'}`}>
            {result.message}
          </p>

          {/* Display relevant data */}
          {result.success && result.data?.events && (
            <div className="mt-3 space-y-2">
              {result.data.events.slice(0, 3).map((event, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-stone-500">
                  <Clock className="w-3 h-3" />
                  <span>{event.title}</span>
                  {event.time && (
                    <span className="text-stone-400">
                      {new Date(event.time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {result.success && result.data?.tasks && (
            <div className="mt-3 space-y-2">
              {result.data.tasks.slice(0, 3).map((task, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-stone-500">
                  <CheckSquare className="w-3 h-3" />
                  <span>{task.title}</span>
                  {task.priority === 'high' && (
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-[10px]">High</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {result.success && result.data?.health && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {(() => {
                const health = result.data.health as { sleep: { hours: number }; steps: number; hrv: number };
                return (
                  <>
                    <div className="text-center p-2 bg-white rounded-lg">
                      <div className="text-lg font-medium text-stone-900">{health.sleep.hours.toFixed(1)}h</div>
                      <div className="text-[10px] text-stone-500">Sleep</div>
                    </div>
                    <div className="text-center p-2 bg-white rounded-lg">
                      <div className="text-lg font-medium text-stone-900">{health.steps.toLocaleString()}</div>
                      <div className="text-[10px] text-stone-500">Steps</div>
                    </div>
                    <div className="text-center p-2 bg-white rounded-lg">
                      <div className="text-lg font-medium text-stone-900">{health.hrv}</div>
                      <div className="text-[10px] text-stone-500">HRV</div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CommandBar({
  isOpen,
  onClose,
  onExecute,
  currentPage,
  recentQueries = [],
}: CommandBarProps) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ result: CommandResult; intent: ParsedIntent } | null>(null);
  const [isListening, setIsListening] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setInput('');
      setResult(null);
      setSuggestions(getCommandSuggestions('', { currentPage, recentQueries }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentPage]);

  // Update suggestions as user types
  useEffect(() => {
    const newSuggestions = getCommandSuggestions(input, { currentPage, recentQueries });
    setSuggestions(newSuggestions);
    setSelectedIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, currentPage]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0 && !input) {
        executeCommand(suggestions[selectedIndex]);
      } else if (input) {
        executeCommand(input);
      }
      return;
    }

    if (e.key === 'Tab' && suggestions.length > 0) {
      e.preventDefault();
      setInput(suggestions[selectedIndex]);
      return;
    }
  }, [suggestions, selectedIndex, input, onClose]);

  // Execute command
  const executeCommand = useCallback(async (command: string) => {
    if (!command.trim() || isProcessing) return;

    setIsProcessing(true);
    setResult(null);

    // Parse the intent
    const intent = parseIntent(command, { currentPage, recentQueries });

    // Simulate data fetching for demo
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate response (in real app, this would use actual data)
    const mockData: Record<string, unknown> = {
      events: [
        { title: 'Team standup', time: new Date().toISOString() },
        { title: 'Product review', time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() },
      ],
      tasks: [
        { title: 'Review PR #423', priority: 'high' },
        { title: 'Update documentation', priority: 'medium' },
        { title: 'Send weekly report', priority: 'medium' },
      ],
      health: {
        sleep: { hours: 7.5, quality: 'good' },
        steps: 8432,
        hrv: 52,
      },
      finance: {
        balance: 4532.50,
        spending: 847.23,
      },
      people: [
        { name: 'Mom', lastContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'Alex', lastContact: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
      ],
    };

    const response = generateNaturalResponse(intent, mockData);

    const commandResult: CommandResult = {
      success: intent.intent !== 'unknown',
      message: response,
      data: intent.intent !== 'unknown' ? mockData : undefined,
    };

    setResult({ result: commandResult, intent });
    setIsProcessing(false);

    // Notify parent
    onExecute?.(intent, response);
  }, [isProcessing, currentPage, recentQueries, onExecute]);

  // Toggle voice input (placeholder)
  const toggleVoice = useCallback(() => {
    setIsListening(prev => !prev);
    // In real app, integrate with Web Speech API
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false);
        setInput("What's on my schedule today?");
      }, 2000);
    }
  }, [isListening]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Command bar */}
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Input area */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-stone-100">
            {isProcessing ? (
              <Loader2 className="w-5 h-5 text-stone-400 animate-spin" />
            ) : (
              <Command className="w-5 h-5 text-stone-400" />
            )}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              className="flex-1 text-stone-900 placeholder-stone-400 outline-none text-base"
              disabled={isProcessing}
            />
            <div className="flex items-center gap-2">
              <button
                onClick={toggleVoice}
                className={`p-2 rounded-lg transition ${
                  isListening
                    ? 'bg-red-100 text-red-600'
                    : 'hover:bg-stone-100 text-stone-400'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
              {input && (
                <button
                  onClick={() => setInput('')}
                  className="p-2 hover:bg-stone-100 rounded-lg text-stone-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          {result && (
            <ResultDisplay result={result.result} intent={result.intent} />
          )}

          {/* Suggestions */}
          {!result && suggestions.length > 0 && (
            <div className="max-h-64 overflow-y-auto">
              {suggestions.map((suggestion, i) => (
                <SuggestionItem
                  key={i}
                  suggestion={suggestion}
                  isSelected={i === selectedIndex}
                  onClick={() => executeCommand(suggestion)}
                />
              ))}
            </div>
          )}

          {/* Quick commands */}
          {!result && !input && (
            <div className="px-4 py-3 border-t border-stone-100">
              <div className="text-xs text-stone-400 mb-2">Quick commands</div>
              <div className="flex flex-wrap gap-2">
                {QUICK_COMMANDS.map((cmd) => (
                  <QuickCommandChip
                    key={cmd.label}
                    label={cmd.label}
                    icon={cmd.icon}
                    onClick={() => executeCommand(cmd.command)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Keyboard hints */}
          <div className="px-4 py-2 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white rounded border border-stone-200 text-[10px]">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white rounded border border-stone-200 text-[10px]">Tab</kbd>
                Complete
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white rounded border border-stone-200 text-[10px]">↵</kbd>
                Execute
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-stone-200 text-[10px]">Esc</kbd>
              Close
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default CommandBar;
