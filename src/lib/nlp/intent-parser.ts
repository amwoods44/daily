/**
 * Intent Parser - Natural Language Understanding
 *
 * Parses natural language commands into structured intents.
 * Supports conversational queries about:
 * - Schedule and calendar
 * - Tasks and todos
 * - Health and wellness
 * - Finances and spending
 * - Relationships and contacts
 * - Navigation and app control
 *
 * Uses pattern matching with fuzzy tolerance for typos.
 */

import type { ParsedIntent } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface IntentPattern {
  patterns: RegExp[];
  intent: ParsedIntent['intent'];
  extractEntities: (match: RegExpMatchArray, input: string) => ParsedIntent['entities'];
}

export interface ParserConfig {
  fuzzyThreshold: number; // 0-1, how much typo tolerance
  contextWeight: number; // How much to weight recent context
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_CONFIG: ParserConfig = {
  fuzzyThreshold: 0.8,
  contextWeight: 0.3,
};

// ============================================================================
// ENTITY EXTRACTORS
// ============================================================================

function extractDate(input: string): Date | undefined {
  const now = new Date();
  const lowerInput = input.toLowerCase();

  // Relative dates
  if (lowerInput.includes('today')) {
    return now;
  }
  if (lowerInput.includes('tomorrow')) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  if (lowerInput.includes('yesterday')) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  }

  // Day of week
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (let i = 0; i < days.length; i++) {
    if (lowerInput.includes(days[i])) {
      const today = now.getDay();
      let diff = i - today;
      if (diff <= 0) diff += 7;
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + diff);
      return targetDate;
    }
  }

  // "next week"
  if (lowerInput.includes('next week')) {
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek;
  }

  // "this weekend"
  if (lowerInput.includes('weekend')) {
    const saturday = new Date(now);
    const dayUntilSat = (6 - now.getDay() + 7) % 7 || 7;
    saturday.setDate(saturday.getDate() + dayUntilSat);
    return saturday;
  }

  // "in X days"
  const inDaysMatch = lowerInput.match(/in\s+(\d+)\s+days?/i);
  if (inDaysMatch) {
    const days = parseInt(inDaysMatch[1], 10);
    const future = new Date(now);
    future.setDate(future.getDate() + days);
    return future;
  }

  // Specific date formats
  const dateMatch = lowerInput.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
  if (dateMatch) {
    const month = parseInt(dateMatch[1], 10) - 1;
    const day = parseInt(dateMatch[2], 10);
    const year = dateMatch[3]
      ? parseInt(dateMatch[3], 10) + (dateMatch[3].length === 2 ? 2000 : 0)
      : now.getFullYear();
    return new Date(year, month, day);
  }

  return undefined;
}

function extractTime(input: string): string | undefined {
  const lowerInput = input.toLowerCase();

  // "at X pm/am"
  const timeMatch = lowerInput.match(/at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const period = timeMatch[3]?.toLowerCase();

    if (period === 'pm' && hours < 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // Fuzzy times
  if (lowerInput.includes('morning')) return '09:00';
  if (lowerInput.includes('noon') || lowerInput.includes('lunch')) return '12:00';
  if (lowerInput.includes('afternoon')) return '14:00';
  if (lowerInput.includes('evening')) return '18:00';
  if (lowerInput.includes('night')) return '21:00';

  return undefined;
}

function extractDuration(input: string): number | undefined {
  const lowerInput = input.toLowerCase();

  // "for X hours/minutes"
  const durationMatch = lowerInput.match(/for\s+(\d+(?:\.\d+)?)\s*(hours?|minutes?|mins?|hrs?)/i);
  if (durationMatch) {
    const value = parseFloat(durationMatch[1]);
    const unit = durationMatch[2].toLowerCase();

    if (unit.startsWith('hour') || unit.startsWith('hr')) {
      return value * 60;
    }
    return value;
  }

  // "X hour meeting"
  const meetingDuration = lowerInput.match(/(\d+(?:\.\d+)?)\s*(?:hour|hr)?\s*meeting/i);
  if (meetingDuration) {
    return parseFloat(meetingDuration[1]) * 60;
  }

  return undefined;
}

function extractPerson(input: string): { name: string } | undefined {
  // "with [Name]"
  const withMatch = input.match(/with\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  if (withMatch) {
    return { name: withMatch[1] };
  }

  // "[Name]'s" (possessive)
  const possessiveMatch = input.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)'s/);
  if (possessiveMatch) {
    return { name: possessiveMatch[1] };
  }

  // "call/email/text [Name]"
  const actionMatch = input.match(/(?:call|email|text|message)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  if (actionMatch) {
    return { name: actionMatch[1] };
  }

  return undefined;
}

function extractAmount(input: string): number | undefined {
  // "$X" or "X dollars"
  const amountMatch = input.match(/\$?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:dollars?)?/i);
  if (amountMatch) {
    return parseFloat(amountMatch[1].replace(/,/g, ''));
  }

  return undefined;
}

function extractCategory(input: string): string | undefined {
  const lowerInput = input.toLowerCase();

  const categories = [
    'food', 'dining', 'groceries', 'restaurant',
    'transport', 'transportation', 'uber', 'lyft', 'gas',
    'shopping', 'retail', 'amazon', 'clothes', 'clothing',
    'entertainment', 'movies', 'music', 'streaming',
    'bills', 'utilities', 'rent', 'mortgage',
    'health', 'medical', 'pharmacy', 'doctor',
    'travel', 'flights', 'hotels', 'vacation',
  ];

  for (const category of categories) {
    if (lowerInput.includes(category)) {
      return category;
    }
  }

  return undefined;
}

// ============================================================================
// INTENT PATTERNS
// ============================================================================

const INTENT_PATTERNS: IntentPattern[] = [
  // SCHEDULE QUERIES
  {
    patterns: [
      /what(?:'s| is)?\s+(?:on\s+)?my\s+(?:schedule|calendar|agenda)\s*(?:for\s+)?(.+)?/i,
      /show\s+(?:me\s+)?(?:my\s+)?(?:schedule|calendar|agenda)\s*(?:for\s+)?(.+)?/i,
      /what\s+do\s+I\s+have\s+(?:on\s+|for\s+)?(.+)/i,
      /am\s+I\s+free\s+(.+)/i,
    ],
    intent: 'query',
    extractEntities: (match, input) => ({
      target: 'schedule',
      date: extractDate(input),
      time: extractTime(input),
    }),
  },

  // TASK QUERIES
  {
    patterns: [
      /what(?:'s| are)?\s+(?:my\s+)?(?:tasks?|todos?|to-?dos?)\s*(?:for\s+)?(.+)?/i,
      /show\s+(?:me\s+)?(?:my\s+)?(?:tasks?|todos?)/i,
      /what\s+do\s+I\s+need\s+to\s+do/i,
      /what's\s+(?:left|remaining|pending)/i,
    ],
    intent: 'query',
    extractEntities: (match, input) => ({
      target: 'tasks',
      date: extractDate(input),
      priority: input.toLowerCase().includes('important') || input.toLowerCase().includes('urgent')
        ? 'high'
        : undefined,
    }),
  },

  // ADD EVENT
  {
    patterns: [
      /(?:add|create|schedule|book)\s+(?:a\s+)?(?:meeting|event|appointment)\s+(?:called\s+|titled\s+)?(?:"|')?([^"']+?)(?:"|')?\s*(?:on|for|at)?/i,
      /put\s+(.+?)\s+on\s+(?:my\s+)?(?:calendar|schedule)/i,
      /(?:schedule|book)\s+(.+?)\s+(?:for|on|at)/i,
    ],
    intent: 'create',
    extractEntities: (match, input) => ({
      target: 'event',
      title: match[1]?.trim(),
      date: extractDate(input),
      time: extractTime(input),
      duration: extractDuration(input),
      attendees: extractPerson(input) ? [extractPerson(input)!.name] : undefined,
    }),
  },

  // ADD TASK
  {
    patterns: [
      /(?:add|create)\s+(?:a\s+)?(?:task|todo|to-?do)\s*(?:to|:)?\s*(.+)/i,
      /remind\s+me\s+to\s+(.+)/i,
      /I\s+need\s+to\s+(.+)/i,
      /don't\s+(?:let\s+me\s+)?forget\s+(?:to\s+)?(.+)/i,
    ],
    intent: 'create',
    extractEntities: (match, input) => ({
      target: 'task',
      title: match[1]?.trim().replace(/\s+(?:by|before|until)\s+.+$/i, ''),
      date: extractDate(input),
      priority: input.toLowerCase().includes('important') || input.toLowerCase().includes('urgent')
        ? 'high'
        : 'medium',
    }),
  },

  // HEALTH QUERIES
  {
    patterns: [
      /how\s+(?:did\s+)?I\s+sleep/i,
      /(?:show|what(?:'s| is)?)\s+(?:my\s+)?sleep/i,
      /how\s+(?:was|is)\s+my\s+sleep/i,
    ],
    intent: 'query',
    extractEntities: () => ({
      target: 'health',
      metric: 'sleep',
    }),
  },
  {
    patterns: [
      /(?:how(?:'s| is)?|what(?:'s| is)?)\s+my\s+(?:health|wellness|wellbeing)/i,
      /health\s+(?:score|status|summary)/i,
      /am\s+I\s+healthy/i,
    ],
    intent: 'query',
    extractEntities: () => ({
      target: 'health',
    }),
  },
  {
    patterns: [
      /(?:how(?:'s| is)?|what(?:'s| is)?)\s+my\s+(?:energy|hrv|heart\s*rate)/i,
      /am\s+I\s+(?:tired|exhausted|recovered)/i,
    ],
    intent: 'query',
    extractEntities: () => ({
      target: 'health',
      metric: 'energy',
    }),
  },

  // FINANCE QUERIES
  {
    patterns: [
      /(?:how\s+much|what)\s+(?:did\s+I|have\s+I)\s+(?:spend|spent)/i,
      /(?:show|what(?:'s| is)?)\s+my\s+spending/i,
      /spending\s+(?:summary|report)/i,
    ],
    intent: 'query',
    extractEntities: (match, input) => ({
      target: 'finance',
      metric: 'spending',
      category: extractCategory(input),
      date: extractDate(input),
    }),
  },
  {
    patterns: [
      /(?:what(?:'s| is)?|show)\s+my\s+(?:balance|account)/i,
      /how\s+much\s+(?:money\s+)?(?:do\s+)?I\s+have/i,
    ],
    intent: 'query',
    extractEntities: () => ({
      target: 'finance',
      metric: 'balance',
    }),
  },
  {
    patterns: [
      /(?:what|when)\s+(?:are\s+)?(?:my\s+)?(?:bills?|payments?)\s*(?:due)?/i,
      /upcoming\s+bills?/i,
    ],
    intent: 'query',
    extractEntities: () => ({
      target: 'finance',
      metric: 'bills',
    }),
  },

  // RELATIONSHIP QUERIES
  {
    patterns: [
      /when\s+(?:did\s+I\s+last\s+|was\s+the\s+last\s+time\s+I\s+)?(?:talk|speak|chat|meet)\s+(?:to|with)\s+(.+)/i,
      /when\s+(?:is\s+)?(.+?)(?:'s)?\s+birthday/i,
    ],
    intent: 'query',
    extractEntities: (match, input) => ({
      target: 'relationships',
      person: match[1]?.trim(),
    }),
  },
  {
    patterns: [
      /who\s+(?:should\s+I|do\s+I\s+need\s+to)\s+(?:reach\s+out\s+to|contact|call)/i,
      /(?:show\s+)?(?:relationship|people)\s+(?:that\s+)?need\s+attention/i,
    ],
    intent: 'query',
    extractEntities: () => ({
      target: 'relationships',
      filter: 'needs_attention',
    }),
  },

  // CONTACT ACTIONS
  {
    patterns: [
      /(?:call|phone)\s+(.+)/i,
    ],
    intent: 'action',
    extractEntities: (match) => ({
      target: 'communication',
      action: 'call',
      person: match[1]?.trim(),
    }),
  },
  {
    patterns: [
      /(?:email|send\s+(?:an\s+)?email\s+to)\s+(.+)/i,
    ],
    intent: 'action',
    extractEntities: (match) => ({
      target: 'communication',
      action: 'email',
      person: match[1]?.trim(),
    }),
  },
  {
    patterns: [
      /(?:text|message)\s+(.+)/i,
    ],
    intent: 'action',
    extractEntities: (match) => ({
      target: 'communication',
      action: 'text',
      person: match[1]?.trim(),
    }),
  },

  // NAVIGATION
  {
    patterns: [
      /(?:go\s+to|open|show)\s+(?:the\s+)?(?:morning|daily)\s+(?:ritual|routine|briefing)/i,
      /start\s+(?:my\s+)?(?:morning|day)/i,
    ],
    intent: 'navigate',
    extractEntities: () => ({
      target: 'page',
      destination: '/morning',
    }),
  },
  {
    patterns: [
      /(?:go\s+to|open|show)\s+(?:the\s+)?(?:weekly|week)\s+(?:review|summary)/i,
    ],
    intent: 'navigate',
    extractEntities: () => ({
      target: 'page',
      destination: '/weekly',
    }),
  },
  {
    patterns: [
      /(?:go\s+to|open|show)\s+(?:the\s+)?(?:finance|money|spending|budget)/i,
    ],
    intent: 'navigate',
    extractEntities: () => ({
      target: 'page',
      destination: '/finance',
    }),
  },
  {
    patterns: [
      /(?:go\s+to|open|show)\s+(?:the\s+)?(?:health|wellness)/i,
    ],
    intent: 'navigate',
    extractEntities: () => ({
      target: 'page',
      destination: '/health',
    }),
  },
  {
    patterns: [
      /(?:go\s+to|open|show)\s+(?:the\s+)?(?:settings|preferences)/i,
    ],
    intent: 'navigate',
    extractEntities: () => ({
      target: 'page',
      destination: '/settings',
    }),
  },
  {
    patterns: [
      /(?:go\s+)?(?:home|back\s+to\s+home)/i,
    ],
    intent: 'navigate',
    extractEntities: () => ({
      target: 'page',
      destination: '/',
    }),
  },

  // GENERAL QUERIES
  {
    patterns: [
      /what's\s+(?:happening|going\s+on|up)/i,
      /(?:give\s+me\s+(?:a\s+)?)?(?:overview|summary|status)/i,
    ],
    intent: 'query',
    extractEntities: () => ({
      target: 'overview',
    }),
  },

  // HELP
  {
    patterns: [
      /(?:what\s+can\s+you|how\s+do\s+I|help)/i,
    ],
    intent: 'help',
    extractEntities: () => ({}),
  },
];

// ============================================================================
// PARSER
// ============================================================================

export function parseIntent(
  input: string,
  context?: { recentQueries?: string[]; currentPage?: string },
  config: ParserConfig = DEFAULT_CONFIG
): ParsedIntent {
  const normalizedInput = input.trim();

  // Try each pattern
  for (const pattern of INTENT_PATTERNS) {
    for (const regex of pattern.patterns) {
      const match = normalizedInput.match(regex);
      if (match) {
        return {
          intent: pattern.intent,
          confidence: calculateConfidence(match, normalizedInput),
          rawInput: input,
          entities: pattern.extractEntities(match, normalizedInput),
        };
      }
    }
  }

  // No pattern matched - attempt fallback classification
  return fallbackClassification(normalizedInput);
}

function calculateConfidence(match: RegExpMatchArray, input: string): number {
  // Higher confidence for longer matches relative to input
  const matchLength = match[0].length;
  const inputLength = input.length;
  const lengthRatio = matchLength / inputLength;

  // Base confidence on how much of the input was matched
  let confidence = 0.5 + (lengthRatio * 0.4);

  // Boost for exact matches
  if (matchLength === inputLength) {
    confidence += 0.1;
  }

  return Math.min(1, confidence);
}

function fallbackClassification(input: string): ParsedIntent {
  const lowerInput = input.toLowerCase();

  // Simple keyword-based fallback
  if (lowerInput.includes('schedule') || lowerInput.includes('calendar') || lowerInput.includes('meeting')) {
    return {
      intent: 'query',
      confidence: 0.4,
      rawInput: input,
      entities: { target: 'schedule' },
    };
  }

  if (lowerInput.includes('task') || lowerInput.includes('todo')) {
    return {
      intent: 'query',
      confidence: 0.4,
      rawInput: input,
      entities: { target: 'tasks' },
    };
  }

  if (lowerInput.includes('health') || lowerInput.includes('sleep') || lowerInput.includes('energy')) {
    return {
      intent: 'query',
      confidence: 0.4,
      rawInput: input,
      entities: { target: 'health' },
    };
  }

  if (lowerInput.includes('money') || lowerInput.includes('spend') || lowerInput.includes('bill')) {
    return {
      intent: 'query',
      confidence: 0.4,
      rawInput: input,
      entities: { target: 'finance' },
    };
  }

  // Unknown intent
  return {
    intent: 'unknown',
    confidence: 0,
    rawInput: input,
    entities: {},
  };
}

// ============================================================================
// COMMAND SUGGESTIONS
// ============================================================================

export function getCommandSuggestions(
  partialInput: string,
  context?: { recentQueries?: string[]; currentPage?: string }
): string[] {
  const lowerInput = partialInput.toLowerCase();
  const suggestions: string[] = [];

  const allCommands = [
    'What\'s on my schedule today?',
    'What\'s on my calendar tomorrow?',
    'Show my tasks',
    'What do I need to do?',
    'How did I sleep?',
    'What\'s my health score?',
    'How much did I spend this week?',
    'Show my balance',
    'When are my bills due?',
    'Who should I reach out to?',
    'Start my morning ritual',
    'Go to weekly review',
    'Add a task to...',
    'Schedule a meeting with...',
    'Remind me to...',
  ];

  // Filter by partial input
  if (lowerInput.length > 0) {
    return allCommands
      .filter(cmd => cmd.toLowerCase().includes(lowerInput))
      .slice(0, 5);
  }

  // Return contextual suggestions based on current page
  if (context?.currentPage) {
    switch (context.currentPage) {
      case '/':
        return [
          'What\'s on my schedule today?',
          'What do I need to do?',
          'Start my morning ritual',
          'What\'s my health score?',
        ];
      case '/morning':
        return [
          'What\'s on my schedule today?',
          'What\'s my most important task?',
          'How did I sleep?',
        ];
      case '/finance':
        return [
          'How much did I spend this week?',
          'When are my bills due?',
          'Show my balance',
        ];
      case '/health':
        return [
          'How did I sleep?',
          'What\'s my energy like?',
          'Show my health trends',
        ];
    }
  }

  // Return recent queries or defaults
  if (context?.recentQueries && context.recentQueries.length > 0) {
    return context.recentQueries.slice(0, 3);
  }

  return allCommands.slice(0, 5);
}

// ============================================================================
// NATURAL RESPONSE GENERATION
// ============================================================================

export function generateNaturalResponse(
  intent: ParsedIntent,
  data: Record<string, unknown>
): string {
  if (intent.intent === 'unknown') {
    return "I'm not sure what you mean. Try asking about your schedule, tasks, health, or finances.";
  }

  if (intent.intent === 'help') {
    return `I can help you with:
• Schedule - "What's on my calendar today?"
• Tasks - "What do I need to do?"
• Health - "How did I sleep?"
• Finances - "How much did I spend?"
• Relationships - "Who should I reach out to?"
• Navigation - "Go to settings"

Just ask naturally!`;
  }

  // Generate response based on intent and data
  const target = intent.entities.target;

  switch (target) {
    case 'schedule':
      const events = data.events as { title: string; time: string }[] | undefined;
      if (!events || events.length === 0) {
        return "Your schedule is clear! A rare gift. 🎁";
      }
      return `You have ${events.length} event${events.length > 1 ? 's' : ''} ${intent.entities.date ? 'on that day' : 'today'}.`;

    case 'tasks':
      const tasks = data.tasks as { title: string }[] | undefined;
      if (!tasks || tasks.length === 0) {
        return "All caught up on tasks! 🎉";
      }
      return `You have ${tasks.length} task${tasks.length > 1 ? 's' : ''} pending.`;

    case 'health':
      const health = data.health as { score: number; sleep?: number } | undefined;
      if (!health) {
        return "I couldn't fetch your health data right now.";
      }
      if (intent.entities.metric === 'sleep') {
        return health.sleep
          ? `You got ${health.sleep.toFixed(1)} hours of sleep last night.`
          : "Sleep data not available.";
      }
      return `Your health score is ${health.score}. ${health.score >= 80 ? 'Looking great!' : health.score >= 60 ? 'Room for improvement.' : 'Time to focus on wellness.'}`;

    case 'finance':
      const finance = data.finance as { spending?: number; balance?: number } | undefined;
      if (!finance) {
        return "I couldn't fetch your financial data right now.";
      }
      if (intent.entities.metric === 'spending') {
        return finance.spending !== undefined
          ? `You've spent $${finance.spending.toFixed(2)} ${intent.entities.category ? `on ${intent.entities.category}` : 'recently'}.`
          : "Spending data not available.";
      }
      if (intent.entities.metric === 'balance') {
        return finance.balance !== undefined
          ? `Your current balance is $${finance.balance.toFixed(2)}.`
          : "Balance not available.";
      }
      return "Here's your financial overview.";

    case 'relationships':
      const people = data.people as { name: string; lastContact?: string }[] | undefined;
      if (!people || people.length === 0) {
        return "No relationships need attention right now!";
      }
      return `${people.length} relationship${people.length > 1 ? 's' : ''} could use some attention.`;

    default:
      return "Here's what I found.";
  }
}
