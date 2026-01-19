/**
 * Daily Pulse Core Types
 *
 * Comprehensive type definitions for the Life OS system.
 * These types support all 8 phases of the implementation.
 */

// ============================================================================
// PEOPLE & RELATIONSHIPS
// ============================================================================

export type RelationshipType = 'family' | 'partner' | 'close_friend' | 'friend' | 'colleague' | 'acquaintance';
export type CommunicationChannel = 'text' | 'call' | 'email' | 'in_person' | 'slack' | 'video';

export interface Person {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  photo?: string;
  relationship: RelationshipType;
  importance: 1 | 2 | 3 | 4 | 5; // 5 = most important
  lastContact: Date | string;
  preferredChannel: CommunicationChannel;
  notes?: string;
  birthday?: string; // "MM-DD" format
  currentContext?: string; // "Going through divorce", "New baby", etc.
  maxDaysWithoutContact: number;
  typicalResponseTime?: number; // hours
  location?: string;
}

// ============================================================================
// TEMPORAL ITEMS
// ============================================================================

export type TemporalBucket = 'right_now' | 'today' | 'this_week' | 'later';

export type ItemType =
  | 'meeting'
  | 'email'
  | 'task'
  | 'person_waiting'
  | 'bill'
  | 'habit'
  | 'health_alert'
  | 'relationship_nudge'
  | 'collision_warning'
  | 'life_admin'
  | 'risk';

export interface Action {
  id: string;
  label: string;
  icon?: string;
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  handler: string;
}

export interface TemporalItem {
  id: string;
  type: ItemType | 'calendar' | 'task';
  title: string;
  subtitle?: string;
  description?: string;
  urgencyScore?: number;
  bucket?: TemporalBucket;
  dueDate?: Date | string;
  deadline?: string;
  time?: string;
  duration?: number;
  person?: Person;
  actions?: Action[];
  metadata?: Record<string, unknown>;
  emoji?: string;
  urgencyReason?: string;
  source?: string;
  completed?: boolean;
  priority?: 'high' | 'medium' | 'low';
  attendees?: { id: string; name: string; email?: string }[];
  location?: string;
}

// ============================================================================
// HEALTH
// ============================================================================

export interface HealthSnapshot {
  date: string;
  sleep: {
    hours: number;
    quality: 1 | 2 | 3 | 4 | 5;
    bedtime?: string;
    wakeTime?: string;
  };
  energy: 1 | 2 | 3 | 4 | 5;
  steps?: number;
  exercise?: boolean;
  exerciseMinutes?: number;
  mood?: 1 | 2 | 3 | 4 | 5;
  heartRate?: {
    resting: number;
    hrv?: number;
  };
  water?: number;
  waterGoal?: number;
  weight?: number;
  notes?: string;
}

export interface BurnoutSignals {
  sleepTrend: 'declining' | 'stable' | 'improving';
  averageSleepHours: number;
  meetingLoad: 'heavy' | 'normal' | 'light';
  meetingHoursThisWeek: number;
  responseTimesTrend: 'increasing' | 'stable' | 'decreasing';
  socialActivityTrend: 'declining' | 'stable' | 'improving';
  overallRisk: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export interface HealthTrend {
  metric: 'sleep' | 'energy' | 'steps' | 'mood' | 'hrv';
  direction: 'up' | 'down' | 'stable';
  percentChange: number;
  insight?: string;
}

// ============================================================================
// FINANCE
// ============================================================================

export type AccountType = 'checking' | 'savings' | 'credit' | 'investment' | 'loan';
export type BillStatus = 'upcoming' | 'due_soon' | 'overdue' | 'paid';
export type TransactionCategory =
  | 'food' | 'transport' | 'entertainment' | 'shopping'
  | 'utilities' | 'housing' | 'health' | 'income' | 'other';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  institution: string;
  lastUpdated: string;
  mask?: string; // Last 4 digits
}

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  date: string;
  description: string;
  category: TransactionCategory;
  merchant?: string;
  pending?: boolean;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: Date | string;
  daysUntilDue?: number;
  recurring: boolean;
  frequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  autopay: boolean;
  status: BillStatus;
  category: string;
  lastPaid?: string;
  isPaid?: boolean;
}

export interface SpendingCategory {
  category: TransactionCategory;
  amount: number;
  budget?: number;
  percentOfTotal: number;
  trend: 'up' | 'down' | 'stable';
  comparedToLastMonth?: number; // percentage change
}

export interface FinanceSnapshot {
  accounts: Account[];
  totalBalance: number;
  recentTransactions: Transaction[];
  upcomingBills: Bill[];
  monthlySpending: SpendingCategory[];
  insights: FinanceInsight[];
  netWorth?: number;
  monthlyIncome?: number;
  monthlyExpenses?: number;
  savingsRate?: number;
}

export interface FinanceInsight {
  id: string;
  type: 'warning' | 'info' | 'success' | 'suggestion';
  title: string;
  description: string;
  action?: Action;
  priority: 'high' | 'medium' | 'low';
}

export interface CashFlowPrediction {
  date: string;
  projectedBalance: number;
  expectedIncome: number;
  expectedExpenses: number;
  bills: Bill[];
  warnings: string[];
}

// ============================================================================
// NUDGES & INSIGHTS
// ============================================================================

export type NudgeType = 'action' | 'warning' | 'celebration' | 'reminder' | 'suggestion' | 'insight';
export type NudgeCategory = 'health' | 'relationships' | 'finance' | 'productivity' | 'life_admin';
export type NudgeColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'gray';

export interface NudgeAction {
  type: 'dismiss' | 'navigate' | 'open_url' | 'send_message';
  label: string;
  payload?: Record<string, unknown>;
}

export interface Nudge {
  id: string;
  type: NudgeType;
  priority: 'high' | 'medium' | 'low';
  title: string;
  message?: string;
  description?: string;
  category?: NudgeCategory;
  color?: NudgeColor;
  action?: NudgeAction | Action;
  expiresAt?: Date | string;
  dismissible?: boolean;
  snoozeable?: boolean;
  createdAt?: Date;
}

// ============================================================================
// PULSE SCORE
// ============================================================================

export interface ScoreComponent {
  score: number; // 0-100
  label: string;
  trend: 'up' | 'down' | 'stable';
  details?: string;
  factors?: string[];
}

export interface PulseScore {
  overall: number; // 0-100
  breakdown: {
    responsiveness: ScoreComponent;
    commitments: ScoreComponent;
    relationships: ScoreComponent;
    health: ScoreComponent;
    lifeAdmin: ScoreComponent;
  };
  trend: 'improving' | 'stable' | 'declining';
  insights: string[];
  lastCalculated: string;
}

// ============================================================================
// PREDICTIONS & COLLISIONS
// ============================================================================

export type CollisionType =
  | 'schedule'
  | 'energy'
  | 'financial'
  | 'relationship'
  | 'health'
  | 'deadline'
  | 'double_booked'
  | 'no_buffer'
  | 'no_travel_time'
  | 'deep_work_conflict'
  | 'personal_conflict'
  | 'energy_mismatch';

export interface Collision {
  id: string;
  type: CollisionType;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  items: TemporalItem[];
  events?: string[]; // IDs of conflicting events
  suggestedResolution?: string;
  canAutoResolve?: boolean;
  detectedAt: Date;
  impact: {
    area: string;
    score: number;
  };
}

export interface Prediction {
  id: string;
  type: 'schedule' | 'behavior' | 'relationship' | 'finance' | 'health';
  title: string;
  description: string;
  confidence: number; // 0-100
  basedOn: string[]; // What patterns this is based on
  suggestedAction?: Action;
  timeline?: string; // "in 2 days", "next week"
}

// ============================================================================
// INTEGRATIONS & AUTH
// ============================================================================

export type Provider = 'google' | 'plaid' | 'healthkit' | 'fitbit' | 'oura' | 'whoop';
export type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'expired' | 'pending';

export interface IntegrationConnection {
  provider: Provider;
  status: ConnectionStatus;
  connectedAt?: string;
  lastSyncAt?: string;
  expiresAt?: string;
  error?: string;
  scopes?: string[];
  accountName?: string;
}

export interface TokenSet {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  provider: Provider;
  scope: string;
}

// ============================================================================
// ONBOARDING
// ============================================================================

export type OnboardingStep =
  | 'welcome'
  | 'select_services'
  | 'connect_calendar'
  | 'connect_email'
  | 'connect_banking'
  | 'connect_health'
  | 'setup_people'
  | 'setup_habits'
  | 'complete';

export interface OnboardingState {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  skippedSteps: OnboardingStep[];
  connectedServices: Provider[];
  startedAt: string;
  completedAt?: string;
}

// ============================================================================
// USER PREFERENCES
// ============================================================================

export interface UserPreferences {
  // Display
  theme: 'light' | 'dark' | 'system';
  timeFormat: '12h' | '24h';
  startOfWeek: 'sunday' | 'monday';

  // Morning Ritual
  morningRitualEnabled: boolean;
  morningRitualTime?: string; // "06:00"

  // Weekly Reset
  weeklyResetEnabled: boolean;
  weeklyResetDay?: 'sunday' | 'saturday';
  weeklyResetTime?: string;

  // Notifications
  notificationsEnabled: boolean;
  nudgeFrequency: 'low' | 'medium' | 'high';

  // Privacy
  localDataOnly: boolean;
  encryptSensitiveData: boolean;

  // Work hours (for burnout detection)
  workStartTime?: string;
  workEndTime?: string;
  workDays?: number[]; // 0-6, Sunday-Saturday
}

// ============================================================================
// WEEKLY RESET
// ============================================================================

export interface WeeklyReview {
  weekStart: Date | string;
  weekEnd: Date | string;

  // Aggregated stats
  stats: {
    tasksCompleted: number;
    meetingsAttended: number;
    averageSleep: number;
    totalSpending: number;
  };

  // Achievements
  wins: { title: string; category: string }[];
  lessons: string[];
  nextWeekFocus: string[];

  // Score
  score: number;
  createdAt: Date;

  // Legacy fields for compatibility
  meetingsAttended?: number;
  tasksCompleted?: number;
  peopleContacted?: string[];
  habitsCompleted?: number;
  habitsMissed?: number;
  averageSleep?: number;
  averageEnergy?: number;
  totalSteps?: number;
  exerciseDays?: number;
  totalSpent?: number;
  topCategories?: SpendingCategory[];
  billsPaid?: number;
  learnings?: string[];
  nextWeekIntentions?: string[];
  oneThingForNextWeek?: string;
  pulseScoreTrend?: number[];
  averagePulseScore?: number;
}

// ============================================================================
// NATURAL LANGUAGE
// ============================================================================

export type IntentType =
  | 'query'
  | 'create'
  | 'action'
  | 'navigate'
  | 'help'
  | 'unknown'
  | 'create_reminder'
  | 'check_schedule'
  | 'contact_person'
  | 'check_relationship'
  | 'cancel_meeting'
  | 'report_mood'
  | 'log_habit'
  | 'check_finances'
  | 'ask_question';

export interface ParsedIntent {
  intent: IntentType;
  type?: IntentType; // Alias for backward compatibility
  confidence: number;
  rawInput: string;
  entities: Record<string, unknown>;
  originalText?: string;
  suggestedResponse?: string;
  action?: Action;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  intent?: ParsedIntent;
  actionTaken?: boolean;
}

// ============================================================================
// VERIFICATION & QA
// ============================================================================

export interface VerificationResult {
  verified: boolean;
  message: string;
  suggestedCorrections: string[];
  name?: string;
  passed?: boolean;
  details?: string;
  timestamp?: string;
  duration?: number;
}

export interface AnomalyResult {
  name: string;
  anomaly: boolean;
  severity: 'warning' | 'error' | 'critical';
  details?: string;
  recommendation?: string;
}

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  lastCheck: string;
  responseTime?: number;
  error?: string;
}

// ============================================================================
// TEMPORAL ITEM EXTENSIONS (for components)
// ============================================================================

// Extended version compatible with both new and existing code
export interface TemporalItemExtended extends Omit<TemporalItem, 'type' | 'urgencyScore' | 'bucket' | 'actions' | 'metadata'> {
  type: ItemType | 'calendar' | 'task';
  source?: string;
  time?: string;
  deadline?: string;
  duration?: number;
  completed?: boolean;
  priority?: 'high' | 'medium' | 'low';
  attendees?: { id: string; name: string; email?: string }[];
  location?: string;
  urgencyScore?: number;
  bucket?: TemporalBucket;
  actions?: Action[];
  metadata?: Record<string, unknown>;
}
