'use client';

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Info,
  DollarSign,
  ShoppingBag,
  Utensils,
  Car,
  Film,
  Home,
  Activity,
  Zap,
  ChevronRight,
} from 'lucide-react';
import type { SpendingCategory, FinanceInsight, TransactionCategory } from '@/lib/types';
import type { FinanceOverview, Bill } from '@/lib/mock-data';

// ============================================================================
// TYPES
// ============================================================================

interface SpendingInsightsProps {
  finance: FinanceOverview;
  onViewDetails?: () => void;
}

// ============================================================================
// HELPERS
// ============================================================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getCategoryIcon(category: string) {
  switch (category.toLowerCase()) {
    case 'food':
      return <Utensils className="w-4 h-4" />;
    case 'transport':
      return <Car className="w-4 h-4" />;
    case 'entertainment':
      return <Film className="w-4 h-4" />;
    case 'shopping':
      return <ShoppingBag className="w-4 h-4" />;
    case 'housing':
      return <Home className="w-4 h-4" />;
    case 'health':
      return <Activity className="w-4 h-4" />;
    case 'utilities':
      return <Zap className="w-4 h-4" />;
    default:
      return <DollarSign className="w-4 h-4" />;
  }
}

function getCategoryColor(category: string): { bg: string; text: string; bar: string } {
  // All categories use theme-aware CSS custom properties
  // Using semantic colors and brand colors for variety while maintaining theme compatibility
  switch (category.toLowerCase()) {
    case 'food':
      return {
        bg: 'bg-[var(--semantic-warning-subtle)]',
        text: 'text-[var(--semantic-warning)]',
        bar: 'bg-[var(--semantic-warning)]'
      };
    case 'transport':
      return {
        bg: 'bg-[var(--semantic-info-subtle)]',
        text: 'text-[var(--semantic-info)]',
        bar: 'bg-[var(--semantic-info)]'
      };
    case 'entertainment':
      return {
        bg: 'bg-[var(--brand-primary-subtle)]',
        text: 'text-[var(--brand-primary)]',
        bar: 'bg-[var(--brand-primary)]'
      };
    case 'shopping':
      return {
        bg: 'bg-[var(--brand-primary-subtle)]',
        text: 'text-[var(--brand-primary-vivid)]',
        bar: 'bg-[var(--brand-primary-vivid)]'
      };
    case 'housing':
      return {
        bg: 'bg-[var(--bg-muted)]',
        text: 'text-[var(--text-secondary)]',
        bar: 'bg-[var(--text-secondary)]'
      };
    case 'health':
      return {
        bg: 'bg-[var(--semantic-error-subtle)]',
        text: 'text-[var(--semantic-error)]',
        bar: 'bg-[var(--semantic-error)]'
      };
    case 'utilities':
      return {
        bg: 'bg-[var(--semantic-warning-subtle)]',
        text: 'text-[var(--semantic-warning-vivid)]',
        bar: 'bg-[var(--semantic-warning-vivid)]'
      };
    default:
      return {
        bg: 'bg-[var(--semantic-success-subtle)]',
        text: 'text-[var(--semantic-success)]',
        bar: 'bg-[var(--semantic-success)]'
      };
  }
}

// ============================================================================
// SPENDING BY CATEGORY
// ============================================================================

function CategoryBar({
  category,
  amount,
  percentage,
  trend,
  maxPercentage,
}: {
  category: string;
  amount: number;
  percentage: number;
  trend?: 'up' | 'down' | 'stable';
  maxPercentage: number;
}) {
  const barWidth = (percentage / maxPercentage) * 100;
  const colors = getCategoryColor(category);

  return (
    <div className="flex items-center gap-3 py-2">
      <div className={`w-8 h-8 rounded-lg ${colors.bg} ${colors.text} flex items-center justify-center flex-shrink-0`}>
        {getCategoryIcon(category)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-[var(--text-secondary)] capitalize truncate">
            {category}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {formatCurrency(amount)}
            </span>
            {trend && trend !== 'stable' && (
              <span className={`text-xs ${trend === 'up' ? 'text-[var(--semantic-error)]' : 'text-[var(--semantic-success)]'}`}>
                {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              </span>
            )}
          </div>
        </div>
        <div className="h-2 bg-[var(--bg-muted)] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${colors.bar}`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// UPCOMING BILLS
// ============================================================================

function UpcomingBillItem({ bill }: { bill: Bill }) {
  const daysUntilDue = bill.daysUntilDue ?? 7;
  const isDueSoon = daysUntilDue <= 3;
  const isOverdue = daysUntilDue <= 0;

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border ${
        isOverdue
          ? 'bg-[var(--semantic-error-subtle)] border-[var(--semantic-error)]'
          : isDueSoon
            ? 'bg-[var(--semantic-warning-subtle)] border-[var(--semantic-warning)]'
            : 'bg-[var(--bg-surface)] border-[var(--border-default)]'
      }`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          isOverdue
            ? 'bg-[var(--semantic-error)] text-[var(--text-on-accent)]'
            : isDueSoon
              ? 'bg-[var(--semantic-warning)] text-[var(--text-on-accent)]'
              : 'bg-[var(--bg-muted)] text-[var(--text-secondary)]'
        }`}
      >
        <DollarSign className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-[var(--text-primary)] truncate">{bill.name}</div>
        <div className="text-xs text-[var(--text-secondary)]">
          {isOverdue ? (
            <span className="text-[var(--semantic-error)]">Overdue</span>
          ) : isDueSoon ? (
            <span className="text-[var(--semantic-warning)]">Due in {bill.daysUntilDue} day{bill.daysUntilDue !== 1 ? 's' : ''}</span>
          ) : (
            `Due in ${bill.daysUntilDue} days`
          )}
          {bill.autopay && <span className="ml-1 text-[var(--text-tertiary)]">• Autopay</span>}
        </div>
      </div>
      <div className="font-medium text-[var(--text-primary)]">
        {formatCurrency(bill.amount)}
      </div>
    </div>
  );
}

// ============================================================================
// INSIGHT CARD
// ============================================================================

function InsightCard({ insight }: { insight: { type: string; title: string; description: string } }) {
  const iconMap = {
    warning: <AlertTriangle className="w-5 h-5 text-[var(--semantic-warning)]" />,
    success: <CheckCircle className="w-5 h-5 text-[var(--semantic-success)]" />,
    info: <Info className="w-5 h-5 text-[var(--semantic-info)]" />,
    suggestion: <Info className="w-5 h-5 text-[var(--brand-primary)]" />,
  };

  const bgMap = {
    warning: 'bg-[var(--semantic-warning-subtle)] border-[var(--semantic-warning)]',
    success: 'bg-[var(--semantic-success-subtle)] border-[var(--semantic-success)]',
    info: 'bg-[var(--semantic-info-subtle)] border-[var(--semantic-info)]',
    suggestion: 'bg-[var(--brand-primary-subtle)] border-[var(--brand-primary)]',
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${bgMap[insight.type as keyof typeof bgMap] || bgMap.info}`}>
      {iconMap[insight.type as keyof typeof iconMap] || iconMap.info}
      <div>
        <div className="font-medium text-[var(--text-primary)]">{insight.title}</div>
        <div className="text-sm text-[var(--text-secondary)] mt-0.5">{insight.description}</div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SpendingInsights({ finance, onViewDetails }: SpendingInsightsProps) {
  // Mock spending categories (would come from transaction analysis)
  const spendingCategories = [
    { category: 'Housing', amount: 2400, percentage: 44 },
    { category: 'Food', amount: 847, percentage: 15, trend: 'up' as const },
    { category: 'Transport', amount: 420, percentage: 8 },
    { category: 'Entertainment', amount: 156, percentage: 3 },
    { category: 'Shopping', amount: 234, percentage: 4 },
    { category: 'Utilities', amount: 320, percentage: 6 },
  ];

  const maxPercentage = Math.max(...spendingCategories.map((c) => c.percentage));

  // Generate mock insights
  const insights = [
    {
      type: 'warning',
      title: 'Food spending up 23%',
      description: `You've spent $847 on food this month, up from $689 last month.`,
    },
    {
      type: 'success',
      title: 'On track for savings goal',
      description: "At this rate, you'll save $1,200 this month.",
    },
  ];

  // Get urgent bills
  const urgentBills = finance.upcomingBills.filter((b) => (b.daysUntilDue ?? 7) <= 7);

  return (
    <div className="space-y-6">
      {/* Spending by Category */}
      <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Spending by Category</h3>
        <div className="space-y-1">
          {spendingCategories.slice(0, 5).map((cat) => (
            <CategoryBar
              key={cat.category}
              category={cat.category}
              amount={cat.amount}
              percentage={cat.percentage}
              trend={cat.trend}
              maxPercentage={maxPercentage}
            />
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <span className="text-sm text-[var(--text-secondary)]">Total this month</span>
          <span className="font-semibold text-[var(--text-primary)]">
            {formatCurrency(finance.monthlySpent)}
          </span>
        </div>
      </div>

      {/* Upcoming Bills */}
      {urgentBills.length > 0 && (
        <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Upcoming Bills</h3>
          <div className="space-y-2">
            {urgentBills.slice(0, 4).map((bill) => (
              <UpcomingBillItem key={bill.id} bill={bill} />
            ))}
          </div>
          {finance.upcomingBills.length > 4 && (
            <button
              onClick={onViewDetails}
              className="w-full mt-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition flex items-center justify-center gap-1"
            >
              View all {finance.upcomingBills.length} bills
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Insights</h3>
          {insights.map((insight, i) => (
            <InsightCard key={i} insight={insight} />
          ))}
        </div>
      )}
    </div>
  );
}

export default SpendingInsights;
