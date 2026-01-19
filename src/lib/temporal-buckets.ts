/**
 * Temporal Bucketing System for Daily Pulse
 *
 * Sorts ALL actionable items by WHEN they need attention, not WHAT type they are.
 * This is the core logic that drives the time-based dashboard architecture.
 *
 * THRESHOLDS:
 * - Person waiting ≥2 days → RIGHT NOW
 * - Person waiting 1 day → TODAY
 * - Meeting in ≤30 min → RIGHT NOW
 * - Meeting later today → TODAY
 * - Task overdue → RIGHT NOW
 * - Task due today → TODAY
 * - Task due this week → THIS WEEK
 * - Bill due ≤1 day → RIGHT NOW
 * - Bill due 2-7 days → THIS WEEK
 * - Habit incomplete for today → TODAY
 * - Relationship overdue → THIS WEEK
 */

import type {
  Meeting,
  Email,
  Task,
  PersonWaiting,
  HabitToday,
  Bill,
  LifeAdminItem,
  Relationship,
  Risk,
  DailyBriefing,
} from './mock-data';

// ============================================================================
// TYPES
// ============================================================================

export type TemporalBucket = 'right_now' | 'today' | 'this_week' | 'later';

export type UnifiedItemType =
  | 'meeting'
  | 'email'
  | 'task'
  | 'person_waiting'
  | 'habit'
  | 'bill'
  | 'life_admin'
  | 'relationship'
  | 'risk';

export interface UnifiedItem {
  id: string;
  type: UnifiedItemType;
  bucket: TemporalBucket;

  // Display
  title: string;
  subtitle?: string;
  description?: string;
  emoji?: string;

  // Timing
  time?: string; // "09:00", "EOD", etc.
  date?: string;
  daysWaiting?: number;
  daysUntil?: number;

  // Urgency
  urgencyScore: number;
  urgencyReason?: string;
  severity?: 'high' | 'medium' | 'low';

  // Context
  from?: string;
  attendees?: string[];
  meetLink?: string;
  relationshipNote?: string;

  // Actions
  actions: ItemAction[];

  // AI flags
  aiFlagged?: boolean;
  suggestedAction?: string;

  // Original data reference
  originalData: unknown;
}

export interface ItemAction {
  id: string;
  label: string;
  icon?: string;
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  handler: string;
}

export interface TemporalBuckets {
  rightNow: UnifiedItem[];
  today: UnifiedItem[];
  thisWeek: UnifiedItem[];
  insights: string[];
}

// Re-export types for convenience
export type { Meeting, Email, Task, DailyBriefing };

// ============================================================================
// BUCKETING LOGIC
// ============================================================================

function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

function getCurrentMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

// ----------------------------------------------------------------------------
// MEETINGS
// ----------------------------------------------------------------------------

function bucketMeeting(meeting: Meeting): UnifiedItem {
  const startMinutes = parseTime(meeting.start);
  const currentMinutes = getCurrentMinutes();
  const minutesUntil = startMinutes - currentMinutes;

  let bucket: TemporalBucket = 'today';
  let urgencyScore = 50;
  let urgencyReason: string | undefined;

  if (minutesUntil <= 30 && minutesUntil >= -60) {
    bucket = 'right_now';
    if (minutesUntil <= 0) {
      urgencyScore = 100;
      urgencyReason = 'Happening now';
    } else {
      urgencyScore = 90 - minutesUntil;
      urgencyReason = `Starts in ${minutesUntil} min`;
    }
  } else if (minutesUntil > 30) {
    bucket = 'today';
    urgencyScore = 60 - Math.floor(minutesUntil / 60);
  }

  const actions: ItemAction[] = [];
  if (meeting.meetLink) {
    actions.push({
      id: 'join',
      label: 'Join',
      icon: 'video',
      variant: 'primary',
      handler: 'join_meeting',
    });
  }
  actions.push({
    id: 'prep',
    label: 'Prep',
    icon: 'file',
    variant: 'ghost',
    handler: 'prep_meeting',
  });

  return {
    id: `meeting-${meeting.id}`,
    type: 'meeting',
    bucket,
    title: meeting.title,
    subtitle: meeting.attendees?.join(', '),
    time: `${meeting.start} - ${meeting.end}`,
    emoji: '📅',
    urgencyScore,
    urgencyReason,
    attendees: meeting.attendees,
    meetLink: meeting.meetLink,
    actions,
    originalData: meeting,
  };
}

// ----------------------------------------------------------------------------
// PEOPLE WAITING
// ----------------------------------------------------------------------------

function bucketPersonWaiting(person: PersonWaiting): UnifiedItem {
  let bucket: TemporalBucket = 'today';
  let urgencyScore = 60;
  let urgencyReason = `${person.daysWaiting} days waiting`;

  // ≥2 days → RIGHT NOW
  if (person.daysWaiting >= 2) {
    bucket = 'right_now';
    urgencyScore = 85 + Math.min(person.daysWaiting * 2, 10);
    urgencyReason = `${Math.floor(person.daysWaiting)} days waiting`;
  } else if (person.daysWaiting >= 1) {
    // 1 day → TODAY
    bucket = 'today';
    urgencyScore = 70;
    urgencyReason = '1 day waiting';
  } else {
    // Less than 1 day
    bucket = 'today';
    urgencyScore = 55;
    const hours = Math.round(person.daysWaiting * 24);
    urgencyReason = `${hours} hours waiting`;
  }

  return {
    id: `person-${person.id}`,
    type: 'person_waiting',
    bucket,
    title: person.context,
    subtitle: person.name,
    daysWaiting: person.daysWaiting,
    emoji: '👤',
    urgencyScore,
    urgencyReason,
    from: person.name,
    relationshipNote: person.relationshipNote,
    actions: [
      {
        id: 'reply',
        label: 'Quick Reply',
        icon: 'reply',
        variant: 'primary',
        handler: 'quick_reply',
      },
      {
        id: 'full',
        label: 'Full Reply',
        icon: 'edit',
        variant: 'secondary',
        handler: 'full_reply',
      },
      {
        id: 'snooze',
        label: '+1h',
        icon: 'clock',
        variant: 'ghost',
        handler: 'snooze',
      },
    ],
    originalData: person,
  };
}

// ----------------------------------------------------------------------------
// TASKS
// ----------------------------------------------------------------------------

function bucketTask(task: Task): UnifiedItem | null {
  if (task.completed) return null;

  let bucket: TemporalBucket = 'today';
  let urgencyScore = 45;
  let urgencyReason: string | undefined;

  const due = task.due?.toLowerCase();

  if (due === 'eod' || due === 'today') {
    bucket = 'right_now';
    urgencyScore = 75;
    urgencyReason = 'Due today';
  } else if (due === 'tomorrow') {
    bucket = 'today';
    urgencyScore = 50;
    urgencyReason = 'Due tomorrow';
  } else if (due?.includes('friday') || due?.includes('week')) {
    bucket = 'this_week';
    urgencyScore = 30;
    urgencyReason = task.due;
  }

  return {
    id: `task-${task.id}`,
    type: 'task',
    bucket,
    title: task.title,
    subtitle: task.due,
    emoji: '✅',
    urgencyScore,
    urgencyReason,
    actions: [
      {
        id: 'done',
        label: 'Done',
        icon: 'check',
        variant: 'primary',
        handler: 'complete_task',
      },
      {
        id: 'later',
        label: 'Later',
        icon: 'clock',
        variant: 'ghost',
        handler: 'snooze_task',
      },
    ],
    originalData: task,
  };
}

// ----------------------------------------------------------------------------
// HABITS
// ----------------------------------------------------------------------------

function bucketHabit(habitToday: HabitToday): UnifiedItem | null {
  if (habitToday.completed) return null;

  const habit = habitToday.habit;

  return {
    id: `habit-${habit.id}`,
    type: 'habit',
    bucket: 'today',
    title: habit.name,
    subtitle: habit.targetTime ? `Best time: ${habit.targetTime}` : undefined,
    emoji: habit.emoji,
    urgencyScore: 40 + (habit.streak > 5 ? 15 : 0), // Higher urgency if streak at risk
    urgencyReason: habit.streak > 0 ? `${habit.streak} day streak` : undefined,
    actions: [
      {
        id: 'done',
        label: 'Done',
        icon: 'check',
        variant: 'primary',
        handler: 'complete_habit',
      },
      {
        id: 'skip',
        label: 'Skip',
        icon: 'x',
        variant: 'ghost',
        handler: 'skip_habit',
      },
    ],
    originalData: habitToday,
  };
}

// ----------------------------------------------------------------------------
// BILLS
// ----------------------------------------------------------------------------

function bucketBill(bill: Bill): UnifiedItem | null {
  if (bill.autopay && bill.daysUntilDue > 1) return null; // Autopay bills only show if due very soon

  let bucket: TemporalBucket = 'this_week';
  let urgencyScore = 40;
  let urgencyReason = `Due in ${bill.daysUntilDue} days`;

  // ≤1 day → RIGHT NOW
  if (bill.daysUntilDue <= 1) {
    bucket = 'right_now';
    urgencyScore = 88;
    urgencyReason = bill.daysUntilDue === 0 ? 'Due today' : 'Due tomorrow';
  } else if (bill.daysUntilDue <= 7) {
    // 2-7 days → THIS WEEK
    bucket = 'this_week';
    urgencyScore = 50 - bill.daysUntilDue;
  }

  return {
    id: `bill-${bill.id}`,
    type: 'bill',
    bucket,
    title: bill.name,
    subtitle: `$${bill.amount.toFixed(2)}${bill.autopay ? ' (autopay)' : ''}`,
    daysUntil: bill.daysUntilDue,
    emoji: '💰',
    urgencyScore,
    urgencyReason,
    actions: bill.autopay
      ? [
          {
            id: 'view',
            label: 'View',
            icon: 'eye',
            variant: 'ghost',
            handler: 'view_bill',
          },
        ]
      : [
          {
            id: 'pay',
            label: 'Pay Now',
            icon: 'credit-card',
            variant: 'primary',
            handler: 'pay_bill',
          },
          {
            id: 'remind',
            label: 'Remind Me',
            icon: 'bell',
            variant: 'ghost',
            handler: 'remind_bill',
          },
        ],
    originalData: bill,
  };
}

// ----------------------------------------------------------------------------
// LIFE ADMIN
// ----------------------------------------------------------------------------

function bucketLifeAdmin(item: LifeAdminItem): UnifiedItem | null {
  if (!item.daysUntil || item.daysUntil > 14) return null; // Only show items within 2 weeks

  let bucket: TemporalBucket = 'this_week';
  let urgencyScore = 35;

  if (item.daysUntil <= 1) {
    bucket = 'right_now';
    urgencyScore = 75;
  } else if (item.daysUntil <= 3) {
    bucket = 'today';
    urgencyScore = 55;
  } else if (item.daysUntil <= 7) {
    bucket = 'this_week';
    urgencyScore = 40;
  }

  const emojiMap: Record<string, string> = {
    document: '📄',
    subscription: '🔄',
    appointment: '🏥',
    package: '📦',
    other: '📋',
  };

  return {
    id: `admin-${item.id}`,
    type: 'life_admin',
    bucket,
    title: item.title,
    subtitle: item.notes,
    daysUntil: item.daysUntil,
    emoji: emojiMap[item.category] || '📋',
    urgencyScore,
    urgencyReason: `In ${item.daysUntil} day${item.daysUntil === 1 ? '' : 's'}`,
    actions: [
      {
        id: 'handle',
        label: 'Handle',
        icon: 'check',
        variant: 'primary',
        handler: 'handle_admin',
      },
      {
        id: 'snooze',
        label: 'Later',
        icon: 'clock',
        variant: 'ghost',
        handler: 'snooze_admin',
      },
    ],
    originalData: item,
  };
}

// ----------------------------------------------------------------------------
// RELATIONSHIPS
// ----------------------------------------------------------------------------

function bucketRelationship(rel: Relationship): UnifiedItem | null {
  // Check if overdue for contact
  const overdueDays = rel.daysSinceContact - rel.targetFrequencyDays;
  if (overdueDays <= 0) return null; // Not overdue

  // Check for upcoming birthday (within 7 days)
  let hasBirthdaySoon = false;
  if (rel.birthday) {
    const [month, day] = rel.birthday.split('-').map(Number);
    const today = new Date();
    const birthday = new Date(today.getFullYear(), month - 1, day);
    const daysUntilBirthday = Math.ceil((birthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    hasBirthdaySoon = daysUntilBirthday >= 0 && daysUntilBirthday <= 7;
  }

  let bucket: TemporalBucket = 'this_week';
  let urgencyScore = 35 + Math.min(overdueDays * 2, 20);

  if (hasBirthdaySoon) {
    urgencyScore += 20;
  }

  if (rel.type === 'family' && overdueDays > 7) {
    bucket = 'today';
    urgencyScore += 10;
  }

  return {
    id: `rel-${rel.id}`,
    type: 'relationship',
    bucket,
    title: `Reach out to ${rel.name}`,
    subtitle: hasBirthdaySoon ? 'Birthday coming up!' : `${rel.daysSinceContact} days since contact`,
    daysWaiting: rel.daysSinceContact,
    emoji: rel.type === 'family' ? '👨‍👩‍👧' : rel.type === 'romantic' ? '❤️' : '👋',
    urgencyScore,
    urgencyReason: `${overdueDays} days overdue`,
    actions: [
      {
        id: 'call',
        label: 'Call',
        icon: 'phone',
        variant: 'primary',
        handler: 'call_contact',
      },
      {
        id: 'text',
        label: 'Text',
        icon: 'message',
        variant: 'secondary',
        handler: 'text_contact',
      },
      {
        id: 'log',
        label: 'Log Contact',
        icon: 'check',
        variant: 'ghost',
        handler: 'log_contact',
      },
    ],
    originalData: rel,
  };
}

// ----------------------------------------------------------------------------
// RISKS
// ----------------------------------------------------------------------------

function bucketRisk(risk: Risk): UnifiedItem {
  let urgencyScore = 80;

  if (risk.severity === 'high') {
    urgencyScore = 95;
  } else if (risk.severity === 'medium') {
    urgencyScore = 75;
  } else {
    urgencyScore = 60;
  }

  return {
    id: `risk-${risk.id}`,
    type: 'risk',
    bucket: 'right_now',
    title: risk.title,
    description: risk.description,
    emoji: '⚠️',
    urgencyScore,
    urgencyReason: `${risk.severity.toUpperCase()} severity`,
    severity: risk.severity,
    suggestedAction: risk.suggestedAction,
    aiFlagged: true,
    actions: [
      {
        id: 'open',
        label: 'Open Thread',
        icon: 'external',
        variant: 'primary',
        handler: 'open_risk',
      },
      {
        id: 'draft',
        label: 'Draft Response',
        icon: 'edit',
        variant: 'secondary',
        handler: 'draft_response',
      },
    ],
    originalData: risk,
  };
}

// ----------------------------------------------------------------------------
// EMAILS (important ones only)
// ----------------------------------------------------------------------------

function bucketEmail(email: Email): UnifiedItem | null {
  if (!email.important) return null;

  return {
    id: `email-${email.id}`,
    type: 'email',
    bucket: 'today',
    title: email.subject,
    subtitle: email.from,
    description: email.snippet,
    date: email.date,
    emoji: '📧',
    urgencyScore: 55,
    urgencyReason: 'Priority email',
    from: email.from,
    actions: [
      {
        id: 'reply',
        label: 'Reply',
        icon: 'reply',
        variant: 'primary',
        handler: 'reply_email',
      },
      {
        id: 'snooze',
        label: 'Later',
        icon: 'clock',
        variant: 'ghost',
        handler: 'snooze_email',
      },
    ],
    originalData: email,
  };
}

// ============================================================================
// MAIN BUCKETING FUNCTION
// ============================================================================

export function bucketItems(data: DailyBriefing): TemporalBuckets {
  const allItems: UnifiedItem[] = [];

  // Process risks first (highest priority)
  data.risks?.forEach((risk) => {
    allItems.push(bucketRisk(risk));
  });

  // Process people waiting
  data.peopleWaiting?.forEach((person) => {
    allItems.push(bucketPersonWaiting(person));
  });

  // Process meetings
  data.meetings?.forEach((meeting) => {
    allItems.push(bucketMeeting(meeting));
  });

  // Process tasks
  data.tasks?.forEach((task) => {
    const item = bucketTask(task);
    if (item) allItems.push(item);
  });

  // Process habits
  data.habitsToday?.forEach((habit) => {
    const item = bucketHabit(habit);
    if (item) allItems.push(item);
  });

  // Process bills
  data.finance?.upcomingBills?.forEach((bill) => {
    const item = bucketBill(bill);
    if (item) allItems.push(item);
  });

  // Process life admin
  data.lifeAdmin?.forEach((admin) => {
    const item = bucketLifeAdmin(admin);
    if (item) allItems.push(item);
  });

  // Process relationships
  data.relationships?.forEach((rel) => {
    const item = bucketRelationship(rel);
    if (item) allItems.push(item);
  });

  // Process important emails (but avoid duplicates with people waiting)
  const waitingNames = new Set(data.peopleWaiting?.map((p) => p.name) || []);
  data.emails?.forEach((email) => {
    if (!waitingNames.has(email.from)) {
      const item = bucketEmail(email);
      if (item) allItems.push(item);
    }
  });

  // Sort by urgency score (descending)
  allItems.sort((a, b) => b.urgencyScore - a.urgencyScore);

  // Separate into buckets
  return {
    rightNow: allItems.filter((i) => i.bucket === 'right_now'),
    today: allItems.filter((i) => i.bucket === 'today'),
    thisWeek: allItems.filter((i) => i.bucket === 'this_week'),
    insights: data.insights || [],
  };
}
