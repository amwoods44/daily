/**
 * Bill Tracker
 *
 * Tracks bills and recurring expenses:
 * - Detects recurring charges from transaction history
 * - Predicts upcoming bills
 * - Warns when account balance may be insufficient
 * - Tracks subscription creep
 */

import type { Bill, Transaction, CashFlowPrediction } from '../types';

// ============================================================================
// TYPES
// ============================================================================

interface RecurringPattern {
  merchantName: string;
  averageAmount: number;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  dayOfMonth?: number;
  lastOccurrence: string;
  occurrences: number;
  confidence: number; // 0-1
}

interface SubscriptionAnalysis {
  totalMonthlySubscriptions: number;
  subscriptionCount: number;
  unusedSubscriptions: Bill[];
  recentlyAdded: Bill[];
  subscriptionTrend: 'increasing' | 'stable' | 'decreasing';
}

interface BillWarning {
  type: 'insufficient_funds' | 'missed_payment' | 'unusual_amount' | 'new_subscription';
  severity: 'high' | 'medium' | 'low';
  bill: Bill;
  message: string;
  suggestedAction?: string;
}

// ============================================================================
// PATTERN DETECTION
// ============================================================================

/**
 * Detect recurring payment patterns from transaction history
 */
export function detectRecurringPatterns(
  transactions: Transaction[]
): RecurringPattern[] {
  const merchantGroups: Record<string, Transaction[]> = {};

  // Group transactions by merchant
  transactions.forEach((tx) => {
    const merchant = tx.merchant || tx.description;
    if (!merchantGroups[merchant]) {
      merchantGroups[merchant] = [];
    }
    merchantGroups[merchant].push(tx);
  });

  const patterns: RecurringPattern[] = [];

  Object.entries(merchantGroups).forEach(([merchant, txs]) => {
    // Need at least 2 occurrences to detect a pattern
    if (txs.length < 2) return;

    // Sort by date
    txs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate average interval between transactions
    let totalDays = 0;
    for (let i = 1; i < txs.length; i++) {
      const daysDiff =
        (new Date(txs[i].date).getTime() - new Date(txs[i - 1].date).getTime()) /
        (1000 * 60 * 60 * 24);
      totalDays += daysDiff;
    }
    const avgInterval = totalDays / (txs.length - 1);

    // Determine frequency
    let frequency: RecurringPattern['frequency'];
    let confidence = 0.5;

    if (avgInterval <= 10) {
      frequency = 'weekly';
      confidence = avgInterval >= 5 && avgInterval <= 10 ? 0.8 : 0.5;
    } else if (avgInterval <= 20) {
      frequency = 'biweekly';
      confidence = avgInterval >= 12 && avgInterval <= 18 ? 0.8 : 0.5;
    } else if (avgInterval <= 45) {
      frequency = 'monthly';
      confidence = avgInterval >= 25 && avgInterval <= 35 ? 0.9 : 0.6;
    } else if (avgInterval <= 100) {
      frequency = 'quarterly';
      confidence = avgInterval >= 80 && avgInterval <= 100 ? 0.8 : 0.5;
    } else {
      frequency = 'yearly';
      confidence = avgInterval >= 350 && avgInterval <= 380 ? 0.8 : 0.4;
    }

    // Calculate average amount
    const avgAmount = txs.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) / txs.length;

    // Detect typical day of month for monthly bills
    let dayOfMonth: number | undefined;
    if (frequency === 'monthly') {
      const days = txs.map((tx) => new Date(tx.date).getDate());
      const dayCounts: Record<number, number> = {};
      days.forEach((d) => {
        dayCounts[d] = (dayCounts[d] || 0) + 1;
      });
      const mostCommon = Object.entries(dayCounts).sort(([, a], [, b]) => b - a)[0];
      if (mostCommon && Number(mostCommon[1]) >= txs.length * 0.5) {
        dayOfMonth = Number(mostCommon[0]);
        confidence += 0.1;
      }
    }

    patterns.push({
      merchantName: merchant,
      averageAmount: avgAmount,
      frequency,
      dayOfMonth,
      lastOccurrence: txs[txs.length - 1].date,
      occurrences: txs.length,
      confidence: Math.min(confidence, 1),
    });
  });

  // Sort by confidence and occurrence count
  return patterns
    .filter((p) => p.confidence >= 0.5 && p.occurrences >= 2)
    .sort((a, b) => b.confidence - a.confidence || b.occurrences - a.occurrences);
}

/**
 * Convert detected patterns to bill predictions
 */
export function patternsToBills(patterns: RecurringPattern[]): Bill[] {
  const now = new Date();

  return patterns.map((pattern) => {
    // Predict next occurrence
    const lastDate = new Date(pattern.lastOccurrence);
    const nextDate = new Date(lastDate);

    switch (pattern.frequency) {
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'biweekly':
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        if (pattern.dayOfMonth) {
          nextDate.setDate(pattern.dayOfMonth);
        }
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    // Adjust if predicted date is in the past
    while (nextDate < now) {
      switch (pattern.frequency) {
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case 'biweekly':
          nextDate.setDate(nextDate.getDate() + 14);
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case 'quarterly':
          nextDate.setMonth(nextDate.getMonth() + 3);
          break;
        case 'yearly':
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
      }
    }

    const daysUntilDue = Math.ceil(
      (nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      id: `bill-${pattern.merchantName.toLowerCase().replace(/\s+/g, '-')}`,
      name: pattern.merchantName,
      amount: pattern.averageAmount,
      dueDate: nextDate.toISOString().split('T')[0],
      daysUntilDue,
      recurring: true,
      frequency: pattern.frequency,
      autopay: false, // Unknown, assume false
      status: daysUntilDue <= 0 ? 'overdue' : daysUntilDue <= 3 ? 'due_soon' : 'upcoming',
      category: categorizeSubscription(pattern.merchantName),
    };
  });
}

// ============================================================================
// CASH FLOW PREDICTION
// ============================================================================

/**
 * Predict cash flow for upcoming period
 */
export function predictCashFlow(
  currentBalance: number,
  upcomingBills: Bill[],
  expectedIncome: number,
  daysAhead: number = 30
): CashFlowPrediction[] {
  const predictions: CashFlowPrediction[] = [];
  const now = new Date();

  // Create daily predictions
  for (let day = 0; day <= daysAhead; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() + day);
    const dateStr = date.toISOString().split('T')[0];

    // Find bills due on this day
    const billsOnDay = upcomingBills.filter((bill) => {
      const billDate = new Date(bill.dueDate);
      return billDate.toISOString().split('T')[0] === dateStr;
    });

    const dailyExpenses = billsOnDay.reduce((sum, bill) => sum + bill.amount, 0);

    // Simple income assumption: monthly income split across work days
    // In production, would use actual payroll schedule
    const isPayday = day === 0 || day === 15; // Assume bi-weekly pay
    const dailyIncome = isPayday ? expectedIncome / 2 : 0;

    // Calculate projected balance
    const previousBalance =
      day === 0
        ? currentBalance
        : predictions[day - 1].projectedBalance;

    const projectedBalance = previousBalance + dailyIncome - dailyExpenses;

    // Generate warnings
    const warnings: string[] = [];
    if (projectedBalance < 0) {
      warnings.push('Projected overdraft');
    } else if (projectedBalance < 100) {
      warnings.push('Very low balance');
    } else if (projectedBalance < 500 && billsOnDay.length > 0) {
      warnings.push('Low balance with upcoming bills');
    }

    predictions.push({
      date: dateStr,
      projectedBalance,
      expectedIncome: dailyIncome,
      expectedExpenses: dailyExpenses,
      bills: billsOnDay,
      warnings,
    });
  }

  return predictions;
}

// ============================================================================
// SUBSCRIPTION ANALYSIS
// ============================================================================

/**
 * Analyze subscription spending
 */
export function analyzeSubscriptions(bills: Bill[]): SubscriptionAnalysis {
  const subscriptions = bills.filter(
    (b) =>
      b.recurring &&
      (b.category === 'Subscriptions' ||
        b.category === 'Entertainment' ||
        b.category === 'Software')
  );

  // Calculate monthly equivalent
  const totalMonthly = subscriptions.reduce((sum, sub) => {
    let monthlyAmount = sub.amount;
    switch (sub.frequency) {
      case 'weekly':
        monthlyAmount = sub.amount * 4.33;
        break;
      case 'biweekly':
        monthlyAmount = sub.amount * 2.17;
        break;
      case 'quarterly':
        monthlyAmount = sub.amount / 3;
        break;
      case 'yearly':
        monthlyAmount = sub.amount / 12;
        break;
    }
    return sum + monthlyAmount;
  }, 0);

  // In production, would analyze usage to detect unused subscriptions
  // For now, flag subscriptions with high cost and low assumed usage
  const unusedSubscriptions = subscriptions.filter(
    (s) => s.amount > 30 && Math.random() > 0.7 // Mock: randomly flag some
  );

  // Recently added (would need historical data)
  const recentlyAdded: Bill[] = [];

  return {
    totalMonthlySubscriptions: totalMonthly,
    subscriptionCount: subscriptions.length,
    unusedSubscriptions,
    recentlyAdded,
    subscriptionTrend: 'stable',
  };
}

// ============================================================================
// WARNINGS
// ============================================================================

/**
 * Generate bill warnings
 */
export function generateBillWarnings(
  bills: Bill[],
  checkingBalance: number
): BillWarning[] {
  const warnings: BillWarning[] = [];

  bills.forEach((bill) => {
    // Check for insufficient funds
    if (
      bill.daysUntilDue !== undefined &&
      bill.daysUntilDue <= 7 &&
      !bill.autopay &&
      bill.amount > checkingBalance
    ) {
      warnings.push({
        type: 'insufficient_funds',
        severity: 'high',
        bill,
        message: `Not enough funds for ${bill.name} (${formatCurrency(bill.amount)})`,
        suggestedAction: `Transfer ${formatCurrency(bill.amount - checkingBalance + 50)} to checking`,
      });
    }

    // Check for overdue
    if (bill.status === 'overdue' && !bill.autopay) {
      warnings.push({
        type: 'missed_payment',
        severity: 'high',
        bill,
        message: `${bill.name} payment is overdue`,
        suggestedAction: 'Pay immediately to avoid late fees',
      });
    }
  });

  return warnings.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

// ============================================================================
// HELPERS
// ============================================================================

function categorizeSubscription(merchantName: string): string {
  const name = merchantName.toLowerCase();

  if (name.includes('netflix') || name.includes('hulu') || name.includes('disney') ||
      name.includes('spotify') || name.includes('apple music')) {
    return 'Entertainment';
  }
  if (name.includes('adobe') || name.includes('microsoft') || name.includes('google') ||
      name.includes('dropbox') || name.includes('slack')) {
    return 'Software';
  }
  if (name.includes('gym') || name.includes('fitness') || name.includes('peloton')) {
    return 'Health';
  }
  if (name.includes('electric') || name.includes('gas') || name.includes('water') ||
      name.includes('internet') || name.includes('phone')) {
    return 'Utilities';
  }
  return 'Subscriptions';
}

function formatCurrency(amount: number): string {
  return `$${Math.abs(amount).toFixed(2)}`;
}

