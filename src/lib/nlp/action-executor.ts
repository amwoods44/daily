/**
 * Action Executor - Command Execution Engine
 *
 * Executes parsed intents by:
 * - Querying relevant data sources
 * - Performing CRUD operations
 * - Triggering navigation
 * - Initiating communication actions
 *
 * All actions are verified before execution and can be undone.
 */

import type { ParsedIntent, VerificationResult, TemporalItem, Person } from '../types';
import type { HealthMetrics } from '../mock-data';

// ============================================================================
// TYPES
// ============================================================================

export interface ActionContext {
  // Data providers
  getSchedule: (date?: Date) => Promise<TemporalItem[]>;
  getTasks: (filter?: { date?: Date; priority?: string; completed?: boolean }) => Promise<TemporalItem[]>;
  getHealth: () => Promise<HealthMetrics>;
  getFinance: () => Promise<{ balance: number; spending: number; bills: { name: string; amount: number; dueDate: Date }[] }>;
  getPeople: (filter?: { needsAttention?: boolean }) => Promise<Person[]>;

  // Mutation handlers
  createEvent: (event: Partial<TemporalItem>) => Promise<TemporalItem>;
  createTask: (task: Partial<TemporalItem>) => Promise<TemporalItem>;
  updateItem: (id: string, updates: Partial<TemporalItem>) => Promise<TemporalItem>;
  deleteItem: (id: string) => Promise<void>;

  // Navigation
  navigate: (path: string) => void;

  // Communication
  initiateCall: (person: Person) => void;
  composeEmail: (person: Person, subject?: string) => void;
  composeMessage: (person: Person) => void;

  // Lookup
  findPerson: (name: string) => Promise<Person | null>;
}

export interface ActionResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  requiresConfirmation?: boolean;
  undoAction?: () => Promise<void>;
}

// ============================================================================
// VERIFICATION
// ============================================================================

export function verifyIntent(intent: ParsedIntent): VerificationResult {
  // Check confidence threshold
  if (intent.confidence < 0.4) {
    return {
      verified: false,
      message: "I'm not confident I understood correctly. Could you rephrase?",
      suggestedCorrections: [],
    };
  }

  // Validate required entities for specific intents
  if (intent.intent === 'create') {
    if (!intent.entities.title && !intent.entities.target) {
      return {
        verified: false,
        message: "I need more details. What would you like to create?",
        suggestedCorrections: [
          'Add a task to review quarterly goals',
          'Schedule a meeting with Sarah tomorrow at 2pm',
        ],
      };
    }
  }

  if (intent.intent === 'action') {
    if (intent.entities.action && !intent.entities.person) {
      return {
        verified: false,
        message: `Who would you like to ${intent.entities.action}?`,
        suggestedCorrections: [],
      };
    }
  }

  if (intent.intent === 'navigate' && !intent.entities.destination) {
    return {
      verified: false,
      message: "Where would you like to go?",
      suggestedCorrections: [
        'Go to settings',
        'Open morning ritual',
        'Show weekly review',
      ],
    };
  }

  return {
    verified: true,
    message: 'Intent verified',
    suggestedCorrections: [],
  };
}

// ============================================================================
// QUERY EXECUTOR
// ============================================================================

async function executeQuery(
  intent: ParsedIntent,
  context: ActionContext
): Promise<ActionResult> {
  const target = intent.entities.target;

  switch (target) {
    case 'schedule': {
      const date = intent.entities.date as Date | undefined;
      const events = await context.getSchedule(date);

      return {
        success: true,
        message: events.length === 0
          ? 'Your schedule is clear!'
          : `Found ${events.length} event${events.length > 1 ? 's' : ''}.`,
        data: { events },
      };
    }

    case 'tasks': {
      const filter: { date?: Date; priority?: string; completed?: boolean } = {};
      if (intent.entities.date) filter.date = intent.entities.date as Date;
      if (intent.entities.priority) filter.priority = intent.entities.priority as string;
      filter.completed = false;

      const tasks = await context.getTasks(filter);

      return {
        success: true,
        message: tasks.length === 0
          ? 'All caught up on tasks!'
          : `You have ${tasks.length} pending task${tasks.length > 1 ? 's' : ''}.`,
        data: { tasks },
      };
    }

    case 'health': {
      const health = await context.getHealth();
      const metric = intent.entities.metric as string | undefined;

      let message = '';
      const data: Record<string, unknown> = { health };

      if (metric === 'sleep') {
        message = `You got ${health.sleep.hours.toFixed(1)} hours of ${health.sleep.quality} sleep.`;
        data.sleep = health.sleep;
      } else if (metric === 'energy') {
        message = `HRV: ${health.hrv}, Resting HR: ${health.restingHR} bpm.`;
        data.energy = { hrv: health.hrv, restingHR: health.restingHR };
      } else {
        message = `Today: ${health.sleep.hours.toFixed(1)}h sleep, ${health.steps.toLocaleString()} steps, HRV ${health.hrv}.`;
      }

      return {
        success: true,
        message,
        data,
      };
    }

    case 'finance': {
      const finance = await context.getFinance();
      const metric = intent.entities.metric as string | undefined;

      let message = '';
      const data: Record<string, unknown> = { finance };

      if (metric === 'spending') {
        const category = intent.entities.category as string | undefined;
        message = category
          ? `Your ${category} spending is tracked in your finance dashboard.`
          : `You've spent $${finance.spending.toFixed(2)} recently.`;
        data.spending = finance.spending;
      } else if (metric === 'balance') {
        message = `Your current balance is $${finance.balance.toFixed(2)}.`;
        data.balance = finance.balance;
      } else if (metric === 'bills') {
        const upcomingBills = finance.bills.filter(b => new Date(b.dueDate) > new Date());
        message = upcomingBills.length === 0
          ? 'No upcoming bills.'
          : `${upcomingBills.length} bill${upcomingBills.length > 1 ? 's' : ''} coming up.`;
        data.bills = upcomingBills;
      } else {
        message = `Balance: $${finance.balance.toFixed(2)}, Recent spending: $${finance.spending.toFixed(2)}.`;
      }

      return {
        success: true,
        message,
        data,
      };
    }

    case 'relationships': {
      const filter: { needsAttention?: boolean } = {};
      if (intent.entities.filter === 'needs_attention') {
        filter.needsAttention = true;
      }

      const people = await context.getPeople(filter);

      if (intent.entities.person) {
        const person = await context.findPerson(intent.entities.person as string);
        if (person) {
          return {
            success: true,
            message: person.lastContact
              ? `Last contacted ${person.name} on ${new Date(person.lastContact).toLocaleDateString()}.`
              : `No recent contact with ${person.name}.`,
            data: { person },
          };
        }
        return {
          success: false,
          message: `Couldn't find ${intent.entities.person} in your contacts.`,
        };
      }

      return {
        success: true,
        message: people.length === 0
          ? 'All relationships are in good shape!'
          : `${people.length} relationship${people.length > 1 ? 's' : ''} need${people.length === 1 ? 's' : ''} attention.`,
        data: { people },
      };
    }

    case 'overview': {
      const [schedule, tasks, health] = await Promise.all([
        context.getSchedule(),
        context.getTasks({ completed: false }),
        context.getHealth(),
      ]);

      const todayEvents = schedule.filter(e => {
        if (!e.time) return false;
        return new Date(e.time).toDateString() === new Date().toDateString();
      });

      return {
        success: true,
        message: `${todayEvents.length} events today, ${tasks.length} tasks pending.`,
        data: { events: todayEvents, tasks, health },
      };
    }

    default:
      return {
        success: false,
        message: "I'm not sure what to look up. Try asking about your schedule, tasks, health, or finances.",
      };
  }
}

// ============================================================================
// CREATE EXECUTOR
// ============================================================================

async function executeCreate(
  intent: ParsedIntent,
  context: ActionContext
): Promise<ActionResult> {
  const target = intent.entities.target;

  if (target === 'event') {
    const event: Partial<TemporalItem> = {
      title: intent.entities.title as string,
      type: 'calendar',
      source: 'user',
    };

    if (intent.entities.date) {
      const date = intent.entities.date as Date;
      const time = intent.entities.time as string | undefined;
      if (time) {
        const [hours, minutes] = time.split(':').map(Number);
        date.setHours(hours, minutes, 0, 0);
      }
      event.time = date.toISOString();
    }

    if (intent.entities.duration) {
      event.duration = intent.entities.duration as number;
    }

    // This would actually create the event
    // const createdEvent = await context.createEvent(event);

    return {
      success: true,
      message: `I'll create "${event.title}"${event.time ? ` for ${new Date(event.time).toLocaleString()}` : ''}.`,
      requiresConfirmation: true,
      data: { event },
    };
  }

  if (target === 'task') {
    const task: Partial<TemporalItem> = {
      title: intent.entities.title as string,
      type: 'task',
      source: 'user',
      priority: (intent.entities.priority as 'high' | 'medium' | 'low') || 'medium',
    };

    if (intent.entities.date) {
      task.deadline = (intent.entities.date as Date).toISOString();
    }

    // const createdTask = await context.createTask(task);

    return {
      success: true,
      message: `I'll add "${task.title}" to your tasks${task.deadline ? ` due ${new Date(task.deadline).toLocaleDateString()}` : ''}.`,
      requiresConfirmation: true,
      data: { task },
    };
  }

  return {
    success: false,
    message: "I'm not sure what to create. Try 'Add a task' or 'Schedule a meeting'.",
  };
}

// ============================================================================
// ACTION EXECUTOR
// ============================================================================

async function executeAction(
  intent: ParsedIntent,
  context: ActionContext
): Promise<ActionResult> {
  const action = intent.entities.action as string;
  const personName = intent.entities.person as string;

  if (!personName) {
    return {
      success: false,
      message: `Who would you like to ${action}?`,
    };
  }

  const person = await context.findPerson(personName);

  if (!person) {
    return {
      success: false,
      message: `Couldn't find ${personName} in your contacts.`,
    };
  }

  switch (action) {
    case 'call':
      context.initiateCall(person);
      return {
        success: true,
        message: `Calling ${person.name}...`,
        data: { person },
      };

    case 'email':
      context.composeEmail(person);
      return {
        success: true,
        message: `Opening email to ${person.name}...`,
        data: { person },
      };

    case 'text':
    case 'message':
      context.composeMessage(person);
      return {
        success: true,
        message: `Opening message to ${person.name}...`,
        data: { person },
      };

    default:
      return {
        success: false,
        message: `I can help you call, email, or text ${person.name}.`,
      };
  }
}

// ============================================================================
// NAVIGATION EXECUTOR
// ============================================================================

function executeNavigation(
  intent: ParsedIntent,
  context: ActionContext
): ActionResult {
  const destination = intent.entities.destination as string;

  if (!destination) {
    return {
      success: false,
      message: "Where would you like to go?",
    };
  }

  context.navigate(destination);

  const pageNames: Record<string, string> = {
    '/': 'home',
    '/morning': 'morning ritual',
    '/weekly': 'weekly review',
    '/finance': 'finances',
    '/health': 'health',
    '/settings': 'settings',
  };

  return {
    success: true,
    message: `Going to ${pageNames[destination] || destination}...`,
    data: { destination },
  };
}

// ============================================================================
// MAIN EXECUTOR
// ============================================================================

export async function executeIntent(
  intent: ParsedIntent,
  context: ActionContext
): Promise<ActionResult> {
  // First, verify the intent
  const verification = verifyIntent(intent);
  if (!verification.verified) {
    return {
      success: false,
      message: verification.message,
      data: { suggestedCorrections: verification.suggestedCorrections },
    };
  }

  // Execute based on intent type
  switch (intent.intent) {
    case 'query':
      return executeQuery(intent, context);

    case 'create':
      return executeCreate(intent, context);

    case 'action':
      return executeAction(intent, context);

    case 'navigate':
      return executeNavigation(intent, context);

    case 'help':
      return {
        success: true,
        message: `I can help you with:
• Schedule - "What's on my calendar?"
• Tasks - "What do I need to do?"
• Health - "How did I sleep?"
• Finances - "How much did I spend?"
• Relationships - "Who should I reach out to?"
• Navigation - "Go to settings"

Just ask naturally!`,
      };

    case 'unknown':
    default:
      return {
        success: false,
        message: "I'm not sure what you mean. Try asking about your schedule, tasks, health, or finances.",
      };
  }
}

// ============================================================================
// UNDO SUPPORT
// ============================================================================

export function createUndoAction(
  actionType: 'create' | 'update' | 'delete',
  originalData: Record<string, unknown>,
  context: ActionContext
): () => Promise<void> {
  return async () => {
    switch (actionType) {
      case 'create':
        // Delete the created item
        if (originalData.id) {
          await context.deleteItem(originalData.id as string);
        }
        break;

      case 'update':
        // Restore original state
        if (originalData.id && originalData.original) {
          await context.updateItem(
            originalData.id as string,
            originalData.original as Partial<TemporalItem>
          );
        }
        break;

      case 'delete':
        // Recreate the deleted item
        if (originalData.item) {
          const item = originalData.item as TemporalItem;
          if (item.type === 'task') {
            await context.createTask(item);
          } else {
            await context.createEvent(item);
          }
        }
        break;
    }
  };
}
