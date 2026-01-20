/**
 * Extended Health Mock Data
 *
 * Provides data for Health & Fitness drill-down page including:
 * - Sleep trends (7-day history)
 * - Activity trends (step counts, active minutes)
 * - Health insights (AI-detected warnings, alerts, celebrations)
 * - Lab results, nutrition tracking, workout history, BodySpec scans
 */

import type { HealthMetrics } from './mock-data';

// ============================================================================
// INTERFACES
// ============================================================================

export interface SleepDay {
  date: Date;
  hours: number;
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  bedtime: string;
  wakeTime: string;
}

export interface ActivityDay {
  date: Date;
  steps: number;
  activeMinutes: number;
}

export interface HealthInsight {
  id: string;
  type: 'warning' | 'alert' | 'reminder' | 'celebration';
  title: string;
  description: string;
  timestamp: Date;
  emoji: string;
}

export interface LabResult {
  id: string;
  date: Date;
  type: string; // 'Blood Panel', 'Vitamin D', 'Cholesterol', etc.
  metrics: Array<{
    name: string;
    value: string;
    unit: string;
    status: 'normal' | 'low' | 'high';
    range: string; // e.g., "30-100"
  }>;
}

export interface NutritionDay {
  date: Date;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
}

export interface Workout {
  id: string;
  date: Date;
  type: string; // 'Running', 'Lifting', 'Cycling', 'Yoga', etc.
  duration: number; // minutes
  distance?: number; // miles
  calories?: number;
  notes?: string;
}

export interface BodySpecResult {
  id: string;
  date: Date;
  bodyFat: number; // percentage
  leanMass: number; // lbs
  boneDensity: number; // g/cm²
  visceralFat: number; // cm²
}

// ============================================================================
// MOCK DATA
// ============================================================================

// 7-day sleep trend
export const mockSleepTrend: SleepDay[] = [
  {
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    hours: 7.2,
    quality: 'good',
    bedtime: '10:30 PM',
    wakeTime: '5:45 AM',
  },
  {
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    hours: 6.5,
    quality: 'fair',
    bedtime: '11:15 PM',
    wakeTime: '6:00 AM',
  },
  {
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    hours: 6.8,
    quality: 'fair',
    bedtime: '11:00 PM',
    wakeTime: '6:00 AM',
  },
  {
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    hours: 5.9,
    quality: 'poor',
    bedtime: '12:15 AM',
    wakeTime: '6:15 AM',
  },
  {
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    hours: 7.5,
    quality: 'good',
    bedtime: '10:15 PM',
    wakeTime: '5:45 AM',
  },
  {
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    hours: 8.1,
    quality: 'excellent',
    bedtime: '9:45 PM',
    wakeTime: '5:50 AM',
  },
  {
    date: new Date(),
    hours: 6.2,
    quality: 'fair',
    bedtime: '11:45 PM',
    wakeTime: '6:00 AM',
  },
];

// 7-day activity trend
export const mockActivityTrend: ActivityDay[] = [
  { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), steps: 8420, activeMinutes: 38 },
  { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), steps: 10250, activeMinutes: 45 },
  { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), steps: 6890, activeMinutes: 28 },
  { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), steps: 9540, activeMinutes: 41 },
  { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), steps: 11200, activeMinutes: 52 },
  { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), steps: 4320, activeMinutes: 18 },
  { date: new Date(), steps: 3240, activeMinutes: 22 },
];

// Health insights (AI-detected)
export const mockHealthInsights: HealthInsight[] = [
  {
    id: 'insight1',
    type: 'warning',
    title: 'Sleep deficit building',
    description: '3 nights below 7h target this week. Consider earlier bedtime.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
    emoji: '⚠️',
  },
  {
    id: 'insight2',
    type: 'alert',
    title: 'HRV trending down 15%',
    description: 'Recovery score declining. Consider a rest day or lighter activity.',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5h ago
    emoji: '📉',
  },
  {
    id: 'insight3',
    type: 'reminder',
    title: 'Hydration low',
    description: 'Only 2 of 8 glasses today. Drink water to stay hydrated.',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1h ago
    emoji: '💧',
  },
  {
    id: 'insight4',
    type: 'celebration',
    title: '12-day walk streak! 🔥',
    description: 'Longest streak since October. Keep it going!',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8h ago
    emoji: '🔥',
  },
  {
    id: 'insight5',
    type: 'reminder',
    title: 'Resting HR elevated',
    description: 'RHR is 8 bpm above normal. Could indicate stress or overtraining.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1d ago
    emoji: '❤️',
  },
];

// Lab results
export const mockLabResults: LabResult[] = [
  {
    id: 'lab1',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
    type: 'Blood Panel',
    metrics: [
      { name: 'Glucose', value: '92', unit: 'mg/dL', status: 'normal', range: '70-100' },
      { name: 'Cholesterol (Total)', value: '178', unit: 'mg/dL', status: 'normal', range: '<200' },
      { name: 'HDL', value: '58', unit: 'mg/dL', status: 'normal', range: '>40' },
      { name: 'LDL', value: '105', unit: 'mg/dL', status: 'normal', range: '<100' },
      { name: 'Triglycerides', value: '112', unit: 'mg/dL', status: 'normal', range: '<150' },
    ],
  },
  {
    id: 'lab2',
    date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 3 months ago
    type: 'Vitamin D',
    metrics: [
      { name: 'Vitamin D', value: '28', unit: 'ng/mL', status: 'low', range: '30-100' },
    ],
  },
];

// Nutrition tracking (7 days)
export const mockNutritionData: NutritionDay[] = [
  { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), calories: 2150, protein: 145, carbs: 220, fat: 65 },
  { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), calories: 1980, protein: 138, carbs: 195, fat: 58 },
  { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), calories: 2340, protein: 152, carbs: 250, fat: 72 },
  { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), calories: 2020, protein: 140, carbs: 210, fat: 61 },
  { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), calories: 2180, protein: 148, carbs: 225, fat: 66 },
  { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), calories: 1850, protein: 125, carbs: 180, fat: 52 },
  { date: new Date(), calories: 1620, protein: 98, carbs: 165, fat: 48 }, // Today (in progress)
];

// Workout history
export const mockWorkouts: Workout[] = [
  {
    id: 'workout1',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    type: 'Running',
    duration: 35,
    distance: 3.8,
    calories: 320,
    notes: 'Morning run, felt great',
  },
  {
    id: 'workout2',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    type: 'Lifting',
    duration: 55,
    calories: 240,
    notes: 'Upper body strength',
  },
  {
    id: 'workout3',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    type: 'Running',
    duration: 42,
    distance: 4.5,
    calories: 390,
    notes: 'Tempo run',
  },
  {
    id: 'workout4',
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    type: 'Yoga',
    duration: 30,
    calories: 120,
    notes: 'Recovery flow',
  },
  {
    id: 'workout5',
    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    type: 'Cycling',
    duration: 60,
    distance: 12.3,
    calories: 480,
    notes: 'Outdoor ride',
  },
];

// BodySpec / DEXA scan results
export const mockBodySpecResults: BodySpecResult[] = [
  {
    id: 'bs1',
    date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 3 months ago
    bodyFat: 18.2,
    leanMass: 143.8,
    boneDensity: 1.15,
    visceralFat: 45.2,
  },
  {
    id: 'bs2',
    date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 6 months ago
    bodyFat: 19.5,
    leanMass: 141.2,
    boneDensity: 1.14,
    visceralFat: 48.7,
  },
];

// Helper: Calculate average sleep hours
export const calculateAverageSleep = (sleepData: SleepDay[]): number => {
  const total = sleepData.reduce((sum, day) => sum + day.hours, 0);
  return total / sleepData.length;
};

// Helper: Calculate sleep debt
export const calculateSleepDebt = (sleepData: SleepDay[], targetHours: number = 7): number => {
  const deficit = sleepData.reduce((debt, day) => {
    const dailyDeficit = Math.max(0, targetHours - day.hours);
    return debt + dailyDeficit;
  }, 0);
  return deficit;
};

// Helper: Get bedtime consistency (variance in hours)
export const getBedtimeConsistency = (sleepData: SleepDay[]): number => {
  // Convert bedtimes to hours (simplified calculation)
  const bedtimeHours = sleepData.map((day) => {
    const match = day.bedtime.match(/(\d+):(\d+)\s*(AM|PM)/);
    if (!match) return 0;
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3];
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours + minutes / 60;
  });

  const max = Math.max(...bedtimeHours);
  const min = Math.min(...bedtimeHours);
  return max - min;
};
