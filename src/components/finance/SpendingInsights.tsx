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

function getCategoryColor(category: string): string {
  switch (category.toLowerCase()) {
    case 'food':
      return 'bg-orange-100 text-orange-600';
    case 'transport':
      return 'bg-blue-100 text-blue-600';
    case 'entertainment':
      return 'bg-purple-100 text-purple-600';
    case 'shopping':
      return 'bg-pink-100 text-pink-600';
    case 'housing':
      return 'bg-stone-100 text-stone-600';
    case 'health':
      return 'bg-red-100 text-red-600';
    case 'utilities':
      return 'bg-yellow-100 text-yellow-600';
    default:
      return 'bg-emerald-100 text-emerald-600';
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

  return (
    <div className="flex items-center gap-3 py-2">
      <div className={`w-8 h-8 rounded-lg ${getCategoryColor(category)} flex items-center justify-center flex-shrink-0`}>
        {getCategoryIcon(category)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-stone-700 capitalize truncate">
            {category}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-stone-900">
              {formatCurrency(amount)}
            </span>
            {trend && trend !== 'stable' && (
              <span className={`text-xs ${trend === 'up' ? 'text-red-500' : 'text-emerald-500'}`}>
                {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              </span>
            )}
          </div>
        </div>
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${getCategoryColor(category).replace('text-', 'bg-').replace('-100', '-400')}`}
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
          ? 'bg-red-50 border-red-200'
          : isDueSoon
            ? 'bg-amber-50 border-amber-200'
            : 'bg-white border-stone-200'
      }`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          isOverdue
            ? 'bg-red-200 text-red-700'
            : isDueSoon
              ? 'bg-amber-200 text-amber-700'
              : 'bg-stone-100 text-stone-600'
        }`}
      >
        <DollarSign className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-stone-900 truncate">{bill.name}</div>
        <div className="text-xs text-stone-500">
          {isOverdue ? (
            <span className="text-red-600">Overdue</span>
          ) : isDueSoon ? (
            <span className="text-amber-600">Due in {bill.daysUntilDue} day{bill.daysUntilDue !== 1 ? 's' : ''}</span>
          ) : (
            `Due in ${bill.daysUntilDue} days`
          )}
          {bill.autopay && <span className="ml-1 text-stone-400">• Autopay</span>}
        </div>
      </div>
      <div className="font-medium text-stone-900">
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
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    suggestion: <Info className="w-5 h-5 text-purple-500" />,
  };

  const bgMap = {
    warning: 'bg-amber-50 border-amber-200',
    success: 'bg-emerald-50 border-emerald-200',
    info: 'bg-blue-50 border-blue-200',
    suggestion: 'bg-purple-50 border-purple-200',
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${bgMap[insight.type as keyof typeof bgMap] || bgMap.info}`}>
      {iconMap[insight.type as keyof typeof iconMap] || iconMap.info}
      <div>
        <div className="font-medium text-stone-900">{insight.title}</div>
        <div className="text-sm text-stone-600 mt-0.5">{insight.description}</div>
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
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <h3 className="text-sm font-semibold text-stone-900 mb-4">Spending by Category</h3>
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
        <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
          <span className="text-sm text-stone-500">Total this month</span>
          <span className="font-semibold text-stone-900">
            {formatCurrency(finance.monthlySpent)}
          </span>
        </div>
      </div>

      {/* Upcoming Bills */}
      {urgentBills.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h3 className="text-sm font-semibold text-stone-900 mb-4">Upcoming Bills</h3>
          <div className="space-y-2">
            {urgentBills.slice(0, 4).map((bill) => (
              <UpcomingBillItem key={bill.id} bill={bill} />
            ))}
          </div>
          {finance.upcomingBills.length > 4 && (
            <button
              onClick={onViewDetails}
              className="w-full mt-3 py-2 text-sm text-stone-500 hover:text-stone-700 transition flex items-center justify-center gap-1"
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
          <h3 className="text-sm font-semibold text-stone-900">Insights</h3>
          {insights.map((insight, i) => (
            <InsightCard key={i} insight={insight} />
          ))}
        </div>
      )}
    </div>
  );
}

export default SpendingInsights;
