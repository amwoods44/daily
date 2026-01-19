'use client';

import React from 'react';
import {
  Wallet,
  CreditCard,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ChevronRight,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import type { Account, FinanceSnapshot } from '@/lib/types';
import type { FinanceOverview } from '@/lib/mock-data';

// ============================================================================
// TYPES
// ============================================================================

interface AccountOverviewProps {
  finance: FinanceOverview;
  onViewDetails?: () => void;
  variant?: 'full' | 'compact' | 'minimal';
}

interface AccountCardProps {
  account: {
    name: string;
    type: 'checking' | 'savings' | 'credit' | 'investment';
    balance: number;
    limit?: number;
  };
  onClick?: () => void;
}

// ============================================================================
// HELPERS
// ============================================================================

function formatCurrency(amount: number): string {
  const isNegative = amount < 0;
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));

  return isNegative ? `-${formatted}` : formatted;
}

function formatCurrencyDetailed(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function getAccountIcon(type: string) {
  switch (type) {
    case 'checking':
      return <Wallet className="w-5 h-5" />;
    case 'savings':
      return <PiggyBank className="w-5 h-5" />;
    case 'credit':
      return <CreditCard className="w-5 h-5" />;
    case 'investment':
      return <TrendingUp className="w-5 h-5" />;
    default:
      return <DollarSign className="w-5 h-5" />;
  }
}

function getAccountColor(type: string): string {
  switch (type) {
    case 'checking':
      return 'bg-blue-100 text-blue-600';
    case 'savings':
      return 'bg-emerald-100 text-emerald-600';
    case 'credit':
      return 'bg-purple-100 text-purple-600';
    case 'investment':
      return 'bg-amber-100 text-amber-600';
    default:
      return 'bg-stone-100 text-stone-600';
  }
}

// ============================================================================
// ACCOUNT CARD
// ============================================================================

function AccountCard({ account, onClick }: AccountCardProps) {
  const isCredit = account.type === 'credit';
  const utilization = isCredit && account.limit
    ? (account.balance / account.limit) * 100
    : undefined;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-stone-200 hover:shadow-sm transition text-left w-full"
    >
      <div className={`w-10 h-10 rounded-lg ${getAccountColor(account.type)} flex items-center justify-center`}>
        {getAccountIcon(account.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-stone-900 truncate">{account.name}</div>
        <div className="text-xs text-stone-500 capitalize">{account.type}</div>
      </div>
      <div className="text-right">
        <div className={`font-semibold ${isCredit ? 'text-purple-600' : 'text-stone-900'}`}>
          {isCredit ? '-' : ''}{formatCurrencyDetailed(account.balance)}
        </div>
        {utilization !== undefined && (
          <div className={`text-xs ${utilization > 30 ? 'text-amber-600' : 'text-stone-400'}`}>
            {Math.round(utilization)}% used
          </div>
        )}
      </div>
    </button>
  );
}

// ============================================================================
// SPENDING PROGRESS
// ============================================================================

function SpendingProgress({
  spent,
  budget,
}: {
  spent: number;
  budget: number;
}) {
  const percentage = (spent / budget) * 100;
  const remaining = budget - spent;
  const daysInMonth = 30;
  const today = new Date().getDate();
  const expectedPercentage = (today / daysInMonth) * 100;

  const isOverBudget = percentage > 100;
  const isAheadOfPace = percentage > expectedPercentage + 10;

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-stone-700">Monthly Budget</div>
        <div className="text-xs text-stone-500">
          {Math.round(percentage)}% used
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-stone-100 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all ${
            isOverBudget
              ? 'bg-red-500'
              : isAheadOfPace
                ? 'bg-amber-500'
                : 'bg-emerald-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* Stats */}
      <div className="flex justify-between text-sm">
        <div>
          <div className="text-stone-500">Spent</div>
          <div className="font-semibold text-stone-900">
            {formatCurrency(spent)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-stone-500">Remaining</div>
          <div className={`font-semibold ${remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(remaining)}
          </div>
        </div>
      </div>

      {/* Warning */}
      {isAheadOfPace && !isOverBudget && (
        <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          Spending faster than usual
        </div>
      )}
      {isOverBudget && (
        <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          Over budget by {formatCurrency(Math.abs(remaining))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// INVESTMENT SUMMARY
// ============================================================================

function InvestmentSummary({
  value,
  change,
}: {
  value: number;
  change: number;
}) {
  const isPositive = change >= 0;

  return (
    <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
      <div className="w-10 h-10 rounded-lg bg-amber-200 text-amber-700 flex items-center justify-center">
        <TrendingUp className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="text-sm text-amber-700">Investments</div>
        <div className="font-semibold text-amber-900">
          {formatCurrency(value)}
        </div>
      </div>
      <div className={`flex items-center gap-1 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
        {isPositive ? (
          <ArrowUpRight className="w-4 h-4" />
        ) : (
          <ArrowDownRight className="w-4 h-4" />
        )}
        <span className="font-medium">{isPositive ? '+' : ''}{change.toFixed(1)}%</span>
      </div>
    </div>
  );
}

// ============================================================================
// FULL VARIANT
// ============================================================================

function FullAccountOverview({
  finance,
  onViewDetails,
}: {
  finance: FinanceOverview;
  onViewDetails?: () => void;
}) {
  const totalLiquid = finance.checking + finance.savings;

  return (
    <div className="space-y-4">
      {/* Net position header */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <div className="text-sm text-stone-500 mb-1">Available Cash</div>
        <div className="text-3xl font-light text-stone-900">
          {formatCurrencyDetailed(totalLiquid)}
        </div>
        <div className="text-sm text-stone-500 mt-2">
          Checking: {formatCurrency(finance.checking)} • Savings: {formatCurrency(finance.savings)}
        </div>
      </div>

      {/* Accounts */}
      <div className="space-y-2">
        <AccountCard
          account={{
            name: 'Checking',
            type: 'checking',
            balance: finance.checking,
          }}
        />
        <AccountCard
          account={{
            name: 'Savings',
            type: 'savings',
            balance: finance.savings,
          }}
        />
        <AccountCard
          account={{
            name: 'Credit Card',
            type: 'credit',
            balance: finance.creditCardBalance,
            limit: finance.creditCardLimit,
          }}
        />
      </div>

      {/* Budget progress */}
      <SpendingProgress
        spent={finance.monthlySpent}
        budget={finance.monthlyBudget}
      />

      {/* Investments */}
      <InvestmentSummary
        value={finance.investmentValue}
        change={finance.investmentChange}
      />

      {/* View all button */}
      {onViewDetails && (
        <button
          onClick={onViewDetails}
          className="w-full py-3 text-sm text-stone-500 hover:text-stone-700 transition flex items-center justify-center gap-1"
        >
          View all accounts
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ============================================================================
// COMPACT VARIANT
// ============================================================================

function CompactAccountOverview({
  finance,
  onViewDetails,
}: {
  finance: FinanceOverview;
  onViewDetails?: () => void;
}) {
  const totalLiquid = finance.checking + finance.savings;
  const spendingPercentage = (finance.monthlySpent / finance.monthlyBudget) * 100;

  return (
    <button
      onClick={onViewDetails}
      className="w-full flex items-center gap-4 p-4 bg-white rounded-xl border border-stone-200 hover:shadow-sm transition text-left"
    >
      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
        <Wallet className="w-6 h-6 text-emerald-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-stone-900">Finances</div>
        <div className="text-sm text-stone-500">
          {formatCurrency(totalLiquid)} available
          {spendingPercentage > 80 && (
            <span className="text-amber-600"> • {Math.round(100 - spendingPercentage)}% budget left</span>
          )}
        </div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-light text-emerald-600">
          {formatCurrency(totalLiquid)}
        </div>
        <div className="text-xs text-stone-400">liquid</div>
      </div>
      <ChevronRight className="w-5 h-5 text-stone-400" />
    </button>
  );
}

// ============================================================================
// MINIMAL VARIANT
// ============================================================================

function MinimalAccountOverview({ finance }: { finance: FinanceOverview }) {
  const totalLiquid = finance.checking + finance.savings;

  return (
    <div className="flex items-center gap-3">
      <Wallet className="w-5 h-5 text-emerald-600" />
      <div className="flex-1">
        <div className="text-sm font-medium text-stone-700">Finances</div>
      </div>
      <div className="text-lg font-light text-emerald-600">
        {formatCurrency(totalLiquid)}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AccountOverview({
  finance,
  onViewDetails,
  variant = 'full',
}: AccountOverviewProps) {
  if (variant === 'minimal') {
    return <MinimalAccountOverview finance={finance} />;
  }

  if (variant === 'compact') {
    return (
      <CompactAccountOverview
        finance={finance}
        onViewDetails={onViewDetails}
      />
    );
  }

  return (
    <FullAccountOverview
      finance={finance}
      onViewDetails={onViewDetails}
    />
  );
}

export default AccountOverview;
