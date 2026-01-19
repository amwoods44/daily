/**
 * Mock Data for Daily Pulse
 *
 * This represents ALL the life domains that Daily Pulse tracks:
 * - Calendar/Meetings
 * - Emails
 * - Tasks
 * - People Waiting on responses
 * - Habits
 * - Health metrics
 * - Finance
 * - Relationships
 * - Bills/Life Admin
 * - Vehicles
 * - AI-detected Risks
 */

// ============================================================================
// CALENDAR & MEETINGS
// ============================================================================

export interface Meeting {
  id: string;
  title: string;
  start: string; // "09:00"
  end: string;
  attendees?: string[];
  meetLink?: string;
  location?: string;
  isAllDay?: boolean;
}

export const mockMeetings: Meeting[] = [
  {
    id: 'm1',
    title: 'Daily Standup',
    start: '09:00',
    end: '09:30',
    attendees: ['Team'],
    meetLink: 'https://meet.google.com/abc',
  },
  {
    id: 'm2',
    title: 'Client Go-Live Readiness',
    start: '10:00',
    end: '10:45',
    attendees: ['Sam Patel', 'Lisa Wong'],
    meetLink: 'https://meet.google.com/xyz',
  },
  {
    id: 'm3',
    title: 'Q1 Planning Review',
    start: '14:00',
    end: '15:00',
    attendees: ['Leadership'],
    location: 'Conf Room B',
  },
];

// ============================================================================
// EMAILS
// ============================================================================

export interface Email {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
  important: boolean;
  threadId?: string;
}

export const mockEmails: Email[] = [
  {
    id: 'e1',
    from: 'Sam Patel',
    subject: 'Contract draft ready for review',
    snippet: 'Hi Aaron, the latest contract draft is ready for your review...',
    date: '8:41 AM',
    important: true,
  },
  {
    id: 'e2',
    from: 'Lisa Wong',
    subject: 'Renewal terms - need input',
    snippet: 'Can we discuss the renewal terms before the client call...',
    date: '7:58 AM',
    important: true,
  },
  {
    id: 'e3',
    from: 'HR Team',
    subject: 'Benefits enrollment reminder',
    snippet: 'Open enrollment ends Friday. Make sure to review your options...',
    date: 'Yesterday',
    important: false,
  },
];

// ============================================================================
// TASKS
// ============================================================================

export interface Task {
  id: string;
  title: string;
  due?: string; // "EOD", "Tomorrow", "Friday", etc.
  completed: boolean;
  project?: string;
  estimatedMinutes?: number;
}

export const mockTasks: Task[] = [
  { id: 't1', title: 'Finalize QBR deck', due: 'EOD', completed: false, estimatedMinutes: 90 },
  { id: 't2', title: 'Review vendor invoices', due: 'Tomorrow', completed: false, estimatedMinutes: 20 },
  { id: 't3', title: 'Submit expense report', due: 'Friday', completed: false, estimatedMinutes: 15 },
  { id: 't4', title: 'Update project roadmap', due: 'This week', completed: false },
];

// ============================================================================
// PEOPLE WAITING
// ============================================================================

export interface PersonWaiting {
  id: string;
  name: string;
  email?: string;
  context: string; // "Contract review request"
  waitingSince: string; // ISO date string
  daysWaiting: number;
  channel: 'email' | 'slack' | 'text' | 'call';
  relationshipNote?: string; // "fast responder", "strategic relationship"
}

export const mockPeopleWaiting: PersonWaiting[] = [
  {
    id: 'pw1',
    name: 'Sam Patel',
    context: 'Contract draft review',
    waitingSince: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
    daysWaiting: 0.75,
    channel: 'email',
    relationshipNote: "fast responder - he'll notice the delay",
  },
  {
    id: 'pw2',
    name: 'Lisa Wong',
    context: 'Renewal terms input',
    waitingSince: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    daysWaiting: 0.5,
    channel: 'email',
    relationshipNote: 'strategic relationship - $240K contract',
  },
  {
    id: 'pw3',
    name: 'Jennifer Martinez',
    context: 'Budget approval',
    waitingSince: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    daysWaiting: 3,
    channel: 'email',
    relationshipNote: 'tends to escalate after 3 days',
  },
  {
    id: 'pw4',
    name: 'Mom',
    context: 'Visit dates',
    waitingSince: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    daysWaiting: 5,
    channel: 'text',
  },
];

// ============================================================================
// HABITS
// ============================================================================

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  frequency: 'daily' | 'weekdays' | 'weekends' | 'weekly';
  targetTime?: string; // "morning", "evening", "anytime"
  streak: number;
}

export interface HabitToday {
  habit: Habit;
  completed: boolean;
  completedAt?: string;
}

export const mockHabits: Habit[] = [
  { id: 'h1', name: 'Morning walk', emoji: '🚶', frequency: 'daily', targetTime: 'morning', streak: 12 },
  { id: 'h2', name: 'Read 20 pages', emoji: '📚', frequency: 'daily', targetTime: 'evening', streak: 5 },
  { id: 'h3', name: 'Meditate', emoji: '🧘', frequency: 'daily', targetTime: 'morning', streak: 0 },
  { id: 'h4', name: 'Exercise', emoji: '💪', frequency: 'weekdays', targetTime: 'morning', streak: 3 },
  { id: 'h5', name: 'Journal', emoji: '✍️', frequency: 'daily', targetTime: 'evening', streak: 8 },
];

export const mockHabitsToday: HabitToday[] = [
  { habit: mockHabits[0], completed: true, completedAt: '7:30 AM' },
  { habit: mockHabits[1], completed: false },
  { habit: mockHabits[2], completed: false },
  { habit: mockHabits[3], completed: true, completedAt: '6:45 AM' },
  { habit: mockHabits[4], completed: false },
];

// ============================================================================
// HEALTH METRICS
// ============================================================================

export interface HealthMetrics {
  sleep: {
    hours: number;
    quality: 'poor' | 'fair' | 'good' | 'excellent';
    bedtime: string;
    wakeTime: string;
  };
  hrv: number; // Heart Rate Variability
  restingHR: number;
  steps: number;
  stepsGoal: number;
  activeMinutes: number;
  weight?: number;
  waterGlasses: number;
  waterGoal: number;
}

export const mockHealth: HealthMetrics = {
  sleep: {
    hours: 6.2,
    quality: 'fair',
    bedtime: '11:45 PM',
    wakeTime: '6:00 AM',
  },
  hrv: 42,
  restingHR: 62,
  steps: 3240,
  stepsGoal: 10000,
  activeMinutes: 22,
  weight: 175,
  waterGlasses: 2,
  waterGoal: 8,
};

// ============================================================================
// FINANCE
// ============================================================================

export interface FinanceOverview {
  checking: number;
  savings: number;
  creditCardBalance: number;
  creditCardLimit: number;
  investmentValue: number;
  investmentChange: number; // percentage
  monthlyBudget: number;
  monthlySpent: number;
  upcomingBills: Bill[];
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // ISO date
  daysUntilDue: number;
  autopay: boolean;
  category: string;
}

export const mockFinance: FinanceOverview = {
  checking: 4250.32,
  savings: 15000,
  creditCardBalance: 1847.23,
  creditCardLimit: 10000,
  investmentValue: 127450,
  investmentChange: 2.3,
  monthlyBudget: 5500,
  monthlySpent: 3200,
  upcomingBills: [
    { id: 'b1', name: 'Rent', amount: 2400, dueDate: '2026-01-25', daysUntilDue: 6, autopay: true, category: 'Housing' },
    { id: 'b2', name: 'Electric', amount: 145, dueDate: '2026-01-22', daysUntilDue: 3, autopay: false, category: 'Utilities' },
    { id: 'b3', name: 'Internet', amount: 79, dueDate: '2026-01-20', daysUntilDue: 1, autopay: true, category: 'Utilities' },
    { id: 'b4', name: 'Adobe Creative Cloud', amount: 59.99, dueDate: '2026-01-21', daysUntilDue: 2, autopay: true, category: 'Subscriptions' },
    { id: 'b5', name: 'Car Insurance', amount: 180, dueDate: '2026-01-28', daysUntilDue: 9, autopay: false, category: 'Auto' },
  ],
};

// ============================================================================
// RELATIONSHIPS
// ============================================================================

export interface Relationship {
  id: string;
  name: string;
  type: 'family' | 'friend' | 'professional' | 'romantic';
  lastContact: string; // ISO date
  daysSinceContact: number;
  targetFrequencyDays: number;
  birthday?: string; // "MM-DD"
  notes?: string;
  photo?: string;
}

export const mockRelationships: Relationship[] = [
  {
    id: 'r1',
    name: 'Mom',
    type: 'family',
    lastContact: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    daysSinceContact: 12,
    targetFrequencyDays: 7,
    birthday: '05-15',
    notes: 'Wants to visit in February',
  },
  {
    id: 'r2',
    name: 'Dad',
    type: 'family',
    lastContact: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    daysSinceContact: 8,
    targetFrequencyDays: 7,
    birthday: '08-22',
  },
  {
    id: 'r3',
    name: 'Sarah Chen',
    type: 'friend',
    lastContact: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    daysSinceContact: 21,
    targetFrequencyDays: 14,
    birthday: '01-20', // Coming up!
    notes: 'Birthday in 1 day!',
  },
  {
    id: 'r4',
    name: 'Mike Johnson',
    type: 'friend',
    lastContact: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    daysSinceContact: 45,
    targetFrequencyDays: 30,
  },
  {
    id: 'r5',
    name: 'Marie',
    type: 'romantic',
    lastContact: new Date().toISOString(),
    daysSinceContact: 0,
    targetFrequencyDays: 1,
  },
];

// ============================================================================
// VEHICLES
// ============================================================================

export interface Vehicle {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  nextService: {
    type: string;
    dueMileage?: number;
    dueDate?: string;
    daysUntil?: number;
  };
  registration: {
    expires: string;
    daysUntil: number;
  };
  insurance: {
    expires: string;
    daysUntil: number;
  };
}

export const mockVehicles: Vehicle[] = [
  {
    id: 'v1',
    name: 'Tesla',
    make: 'Tesla',
    model: 'Model 3',
    year: 2022,
    mileage: 28450,
    nextService: {
      type: 'Tire rotation',
      dueMileage: 30000,
      daysUntil: 45,
    },
    registration: {
      expires: '2026-03-15',
      daysUntil: 55,
    },
    insurance: {
      expires: '2026-06-01',
      daysUntil: 133,
    },
  },
];

// ============================================================================
// LIFE ADMIN
// ============================================================================

export interface LifeAdminItem {
  id: string;
  title: string;
  category: 'document' | 'subscription' | 'appointment' | 'package' | 'other';
  dueDate?: string;
  daysUntil?: number;
  status: 'pending' | 'upcoming' | 'overdue';
  notes?: string;
}

export const mockLifeAdmin: LifeAdminItem[] = [
  {
    id: 'la1',
    title: 'Passport renewal',
    category: 'document',
    dueDate: '2026-04-15',
    daysUntil: 86,
    status: 'upcoming',
    notes: 'Expires in 3 months - start process now',
  },
  {
    id: 'la2',
    title: 'Amazon package arriving',
    category: 'package',
    dueDate: '2026-01-20',
    daysUntil: 1,
    status: 'upcoming',
    notes: 'USB-C hub',
  },
  {
    id: 'la3',
    title: 'Adobe subscription',
    category: 'subscription',
    dueDate: '2026-01-21',
    daysUntil: 2,
    status: 'upcoming',
    notes: 'Consider canceling - $59.99/mo, barely used',
  },
  {
    id: 'la4',
    title: 'Dentist appointment',
    category: 'appointment',
    dueDate: '2026-01-22',
    daysUntil: 3,
    status: 'upcoming',
    notes: '10:30 AM',
  },
];

// ============================================================================
// AI RISKS & NUDGES
// ============================================================================

export interface Risk {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  suggestedAction: string;
  source: string; // "calendar", "email", "relationship", etc.
}

export interface Nudge {
  id: string;
  type: 'warning' | 'celebration' | 'reminder' | 'suggestion';
  title: string;
  description: string;
  action?: {
    label: string;
    handler: string;
  };
  color: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';
}

export const mockRisks: Risk[] = [
  {
    id: 'risk1',
    title: 'Supplier delayed shipment by 2 weeks',
    description: 'Threatens client go-live (Aug 28); potential renewal risk and Q3 impact.',
    severity: 'high',
    suggestedAction: 'Escalate for partial shipment + penalty waiver. Communicate revised install window.',
    source: 'email',
  },
];

export const mockNudges: Nudge[] = [
  {
    id: 'nudge1',
    type: 'warning',
    title: 'Adobe subscription renewing',
    description: '$59.99/mo - you used it 2x last month. Cancel before Wednesday to avoid charge.',
    action: { label: 'Review', handler: 'open_subscription' },
    color: 'orange',
  },
  {
    id: 'nudge2',
    type: 'reminder',
    title: "Mom's waiting on visit dates",
    description: "5 days since her text. She mentioned February availability.",
    action: { label: 'Reply', handler: 'open_messages' },
    color: 'purple',
  },
  {
    id: 'nudge3',
    type: 'warning',
    title: 'Sleep deficit building',
    description: '6.2 hours last night, 6.0 average this week. Below your 7h target.',
    color: 'yellow',
  },
  {
    id: 'nudge4',
    type: 'celebration',
    title: '12-day walk streak! 🔥',
    description: "Longest streak since October. Don't break the chain.",
    color: 'green',
  },
  {
    id: 'nudge5',
    type: 'reminder',
    title: "Sarah's birthday tomorrow",
    description: "You haven't talked in 3 weeks. Good excuse to reconnect.",
    action: { label: 'Send message', handler: 'open_messages' },
    color: 'blue',
  },
];

// ============================================================================
// PULSE SCORE
// ============================================================================

export interface PulseScore {
  overall: number; // 0-100
  breakdown: {
    responsiveness: { score: number; label: string; trend: 'up' | 'down' | 'stable' };
    commitments: { score: number; label: string; trend: 'up' | 'down' | 'stable' };
    relationships: { score: number; label: string; trend: 'up' | 'down' | 'stable' };
    health: { score: number; label: string; trend: 'up' | 'down' | 'stable' };
    lifeAdmin: { score: number; label: string; trend: 'up' | 'down' | 'stable' };
  };
}

export const mockPulseScore: PulseScore = {
  overall: 72,
  breakdown: {
    responsiveness: { score: 65, label: 'Slipping', trend: 'down' },
    commitments: { score: 80, label: 'On track', trend: 'stable' },
    relationships: { score: 58, label: 'Needs attention', trend: 'down' },
    health: { score: 70, label: 'Fair', trend: 'stable' },
    lifeAdmin: { score: 85, label: 'Good', trend: 'up' },
  },
};

// ============================================================================
// WEATHER
// ============================================================================

export interface Weather {
  temp: number;
  high: number;
  low: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';
  location: string;
  humidity?: number;
  feelsLike?: number;
}

export const mockWeather: Weather = {
  temp: 72,
  high: 78,
  low: 65,
  condition: 'sunny',
  location: 'Austin, TX',
  humidity: 45,
  feelsLike: 74,
};

// ============================================================================
// COMBINED BRIEFING DATA
// ============================================================================

export interface DailyBriefing {
  // Meta
  greeting: string;
  date: string;

  // Core data
  weather: Weather;
  meetings: Meeting[];
  emails: Email[];
  tasks: Task[];

  // People & Relationships
  peopleWaiting: PersonWaiting[];
  relationships: Relationship[];

  // Habits & Health
  habitsToday: HabitToday[];
  health: HealthMetrics;

  // Finance & Life Admin
  finance: FinanceOverview;
  lifeAdmin: LifeAdminItem[];
  vehicles: Vehicle[];

  // AI-generated
  risks: Risk[];
  nudges: Nudge[];
  pulseScore: PulseScore;
  insights: string[];
}

export const mockBriefing: DailyBriefing = {
  greeting: 'Good morning',
  date: new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
  weather: mockWeather,
  meetings: mockMeetings,
  emails: mockEmails,
  tasks: mockTasks,
  peopleWaiting: mockPeopleWaiting,
  relationships: mockRelationships,
  habitsToday: mockHabitsToday,
  health: mockHealth,
  finance: mockFinance,
  lifeAdmin: mockLifeAdmin,
  vehicles: mockVehicles,
  risks: mockRisks,
  nudges: mockNudges,
  pulseScore: mockPulseScore,
  insights: [
    "You've responded to Sam within 2 hours on average — he's likely expecting a quick reply.",
    "Three back-to-back meetings tomorrow. Consider blocking prep time.",
    "Your sleep has been below target for 4 days. HRV is trending down.",
  ],
};
