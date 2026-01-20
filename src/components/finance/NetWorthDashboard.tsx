'use client';

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  CreditCard,
  Building,
} from 'lucide-react';
import type { Account } from '@/lib/finance-data';

interface NetWorthDashboardProps {
  netWorth: number;
  netWorthChange: number; // percentage
  accounts: Account[];
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
  }).format(Math.abs(amount));
}

function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

function getIconComponent(iconName: string) {
  const icons: Record<string, React.ElementType> = {
    Wallet,
    PiggyBank,
    TrendingUp,
    Building,
    CreditCard,
  };
  return icons[iconName] || Wallet;
}

// ============================================================================
// ACCOUNT CARD
// ============================================================================

function AccountCard({ account }: { account: Account }) {
  const IconComponent = getIconComponent(account.icon);
  const isNegative = account.balance < 0;

  return (
    <div
      className="premium-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      {/* Icon + Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-accent-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconComponent
            className="w-5 h-5"
            style={{ color: 'var(--brand-primary)' }}
          />
        </div>
        <span className="text-label-md" style={{ color: 'var(--text-tertiary)' }}>
          {account.label}
        </span>
      </div>

      {/* Balance */}
      <div>
        <div
          className="text-heading-lg"
          style={{
            color: isNegative ? 'var(--semantic-error)' : 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontWeight: 'var(--weight-semibold)',
          }}
        >
          {isNegative && '−'}
          {formatCurrency(account.balance)}
        </div>
        <div
          className="text-body-sm"
          style={{
            color: 'var(--text-tertiary)',
            marginTop: 'var(--space-1)',
          }}
        >
          {account.percentage.toFixed(1)}% of total
        </div>
      </div>

      {/* Trend (if exists) */}
      {account.trend !== undefined && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}
        >
          {account.trend >= 0 ? (
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--semantic-success)' }} />
          ) : (
            <TrendingDown className="w-4 h-4" style={{ color: 'var(--semantic-error)' }} />
          )}
          <span
            className="text-mono-sm"
            style={{
              color: account.trend >= 0 ? 'var(--semantic-success)' : 'var(--semantic-error)',
            }}
          >
            {formatPercentage(account.trend)} this month
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function NetWorthDashboard({
  netWorth,
  netWorthChange,
  accounts,
}: NetWorthDashboardProps) {
  return (
    <section
      className="card-hero"
      style={{
        padding: 'var(--space-10)',
      }}
    >
      {/* Net Worth Total */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: 'var(--space-12)',
        }}
      >
        <span
          className="text-label-md"
          style={{
            color: 'var(--text-tertiary)',
            display: 'block',
            marginBottom: 'var(--space-3)',
          }}
        >
          Total Net Worth
        </span>
        <div
          className="text-display-2xl"
          style={{
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontWeight: 'var(--weight-bold)',
            marginBottom: 'var(--space-3)',
          }}
        >
          {formatCurrency(netWorth)}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-2)',
          }}
        >
          {netWorthChange >= 0 ? (
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--semantic-success)' }} />
          ) : (
            <TrendingDown className="w-4 h-4" style={{ color: 'var(--semantic-error)' }} />
          )}
          <span
            className="text-mono-sm"
            style={{
              color: netWorthChange >= 0 ? 'var(--semantic-success)' : 'var(--semantic-error)',
            }}
          >
            {formatPercentage(netWorthChange)} this month
          </span>
        </div>
      </div>

      {/* Account Breakdown Grid */}
      <div
        className="grid-premium grid-premium-3"
        style={{
          gap: 'var(--space-6)',
        }}
      >
        {accounts.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}
      </div>
    </section>
  );
}

export default NetWorthDashboard;
