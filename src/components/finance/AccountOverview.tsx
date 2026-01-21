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
      return 'bg-[var(--semantic-info-subtle)] text-[var(--semantic-info)]';
    case 'savings':
      return 'bg-[var(--semantic-success-subtle)] text-[var(--semantic-success)]';
    case 'credit':
      return 'bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]';
    case 'investment':
      return 'bg-[var(--semantic-warning-subtle)] text-[var(--semantic-warning)]';
    default:
      return 'bg-[var(--bg-muted)] text-[var(--text-secondary)]';
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
      className="flex items-center gap-4 p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] hover:shadow-sm transition text-left w-full"
    >
      <div className={`w-10 h-10 rounded-lg ${getAccountColor(account.type)} flex items-center justify-center`}>
        {getAccountIcon(account.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-[var(--text-primary)] truncate">{account.name}</div>
        <div className="text-xs text-[var(--text-secondary)] capitalize">{account.type}</div>
      </div>
      <div className="text-right">
        <div className={`font-semibold ${isCredit ? 'text-[var(--brand-primary)]' : 'text-[var(--text-primary)]'}`}>
          {isCredit ? '-' : ''}{formatCurrencyDetailed(account.balance)}
        </div>
        {utilization !== undefined && (
          <div className={`text-xs ${utilization > 30 ? 'text-[var(--semantic-warning)]' : 'text-[var(--text-tertiary)]'}`}>
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
    <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-[var(--text-primary)]">Monthly Budget</div>
        <div className="text-xs text-[var(--text-secondary)]">
          {Math.round(percentage)}% used
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-[var(--bg-muted)] rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all ${
            isOverBudget
              ? 'bg-[var(--semantic-error)]'
              : isAheadOfPace
                ? 'bg-[var(--semantic-warning)]'
                : 'bg-[var(--semantic-success)]'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* Stats */}
      <div className="flex justify-between text-sm">
        <div>
          <div className="text-[var(--text-secondary)]">Spent</div>
          <div className="font-semibold text-[var(--text-primary)]">
            {formatCurrency(spent)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[var(--text-secondary)]">Remaining</div>
          <div className={`font-semibold ${remaining >= 0 ? 'text-[var(--semantic-success)]' : 'text-[var(--semantic-error)]'}`}>
            {formatCurrency(remaining)}
          </div>
        </div>
      </div>

      {/* Warning */}
      {isAheadOfPace && !isOverBudget && (
        <div className="mt-3 flex items-center gap-2 text-xs text-[var(--semantic-warning)] bg-[var(--semantic-warning-subtle)] p-2 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          Spending faster than usual
        </div>
      )}
      {isOverBudget && (
        <div className="mt-3 flex items-center gap-2 text-xs text-[var(--semantic-error)] bg-[var(--semantic-error-subtle)] p-2 rounded-lg">
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
    <div className="flex items-center gap-4 p-4 bg-[var(--semantic-warning-subtle)] rounded-xl border border-[var(--semantic-warning)]">
      <div className="w-10 h-10 rounded-lg bg-[var(--semantic-warning)] text-[var(--text-on-accent)] flex items-center justify-center">
        <TrendingUp className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="text-sm text-[var(--semantic-warning)]">Investments</div>
        <div className="font-semibold text-[var(--text-primary)]">
          {formatCurrency(value)}
        </div>
      </div>
      <div className={`flex items-center gap-1 ${isPositive ? 'text-[var(--semantic-success)]' : 'text-[var(--semantic-error)]'}`}>
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
      <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-5">
        <div className="text-sm text-[var(--text-secondary)] mb-1">Available Cash</div>
        <div className="text-3xl font-light text-[var(--text-primary)]">
          {formatCurrencyDetailed(totalLiquid)}
        </div>
        <div className="text-sm text-[var(--text-secondary)] mt-2">
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
          className="w-full py-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition flex items-center justify-center gap-1"
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
      className="w-full flex items-center gap-4 p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] hover:shadow-sm transition text-left"
    >
      <div className="w-12 h-12 rounded-full bg-[var(--semantic-success-subtle)] flex items-center justify-center">
        <Wallet className="w-6 h-6 text-[var(--semantic-success)]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-[var(--text-primary)]">Finances</div>
        <div className="text-sm text-[var(--text-secondary)]">
          {formatCurrency(totalLiquid)} available
          {spendingPercentage > 80 && (
            <span className="text-[var(--semantic-warning)]"> • {Math.round(100 - spendingPercentage)}% budget left</span>
          )}
        </div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-light text-[var(--semantic-success)]">
          {formatCurrency(totalLiquid)}
        </div>
        <div className="text-xs text-[var(--text-tertiary)]">liquid</div>
      </div>
      <ChevronRight className="w-5 h-5 text-[var(--text-tertiary)]" />
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
      <Wallet className="w-5 h-5 text-[var(--semantic-success)]" />
      <div className="flex-1">
        <div className="text-sm font-medium text-[var(--text-primary)]">Finances</div>
      </div>
      <div className="text-lg font-light text-[var(--semantic-success)]">
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
