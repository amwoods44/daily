'use client';

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Utensils,
  Car,
  Film,
  ShoppingBag,
  Home,
  Activity,
  Zap,
  DollarSign,
} from 'lucide-react';
import type { FinanceOverview } from '@/lib/mock-data';
import type { SpendingCategory } from '@/lib/finance-data';

interface SpendingAnalysisProps {
  monthlySpent: number;
  monthlyBudget: number;
  categories: SpendingCategory[];
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
    case 'food & dining':
    case 'food':
      return Utensils;
    case 'transportation':
      return Car;
    case 'entertainment':
      return Film;
    case 'shopping':
      return ShoppingBag;
    case 'housing':
      return Home;
    case 'health':
      return Activity;
    case 'utilities':
      return Zap;
    default:
      return DollarSign;
  }
}

// ============================================================================
// CATEGORY ROW
// ============================================================================

function CategoryRow({ category, maxPercentage }: { category: SpendingCategory; maxPercentage: number }) {
  const Icon = getCategoryIcon(category.name);
  const barWidth = (category.percentage / maxPercentage) * 100;
  const isOverBudget = category.amount > category.budget;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-2) 0',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-accent-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon
          className="w-4 h-4"
          style={{ color: 'var(--brand-primary)' }}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-1)',
          }}
        >
          <span
            className="text-body-sm"
            style={{
              color: 'var(--text-secondary)',
              fontWeight: 'var(--weight-medium)',
            }}
          >
            {category.name}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span
              className="text-body-sm"
              style={{
                color: isOverBudget ? 'var(--semantic-error)' : 'var(--text-primary)',
                fontWeight: 'var(--weight-semibold)',
              }}
            >
              {formatCurrency(category.amount)}
            </span>
            {category.trend !== 0 && (
              <span style={{ display: 'flex', alignItems: 'center' }}>
                {category.trend > 0 ? (
                  <TrendingUp
                    className="w-3 h-3"
                    style={{ color: 'var(--semantic-error)' }}
                  />
                ) : (
                  <TrendingDown
                    className="w-3 h-3"
                    style={{ color: 'var(--semantic-success)' }}
                  />
                )}
              </span>
            )}
          </div>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--bg-muted)' }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${barWidth}%`,
              backgroundColor: isOverBudget
                ? 'var(--semantic-error)'
                : 'var(--brand-primary)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SpendingAnalysis({
  monthlySpent,
  monthlyBudget,
  categories,
}: SpendingAnalysisProps) {
  const maxPercentage = Math.max(...categories.map((c) => c.percentage));
  const budgetProgress = (monthlySpent / monthlyBudget) * 100;
  const isOverBudget = monthlySpent > monthlyBudget;

  return (
    <section className="card">
      {/* Section Header */}
      <div className="section-header">
        <span className="text-label-sm" style={{ color: 'var(--brand-primary)' }}>
          Spending Analysis
        </span>
        <div className="section-header-line" />
        <span
          className="text-mono-sm"
          style={{
            color: 'var(--text-quaternary)',
            backgroundColor: 'var(--bg-muted)',
            padding: 'var(--space-1) var(--space-2)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          This Month
        </span>
      </div>

      {/* Budget Overview */}
      <div
        style={{
          padding: 'var(--space-5)',
          marginBottom: 'var(--space-6)',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--bg-muted)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 'var(--space-3)',
          }}
        >
          <span
            className="text-label-sm"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Monthly Budget
          </span>
          <div>
            <span
              className="text-mono"
              style={{
                color: isOverBudget ? 'var(--semantic-error)' : 'var(--text-primary)',
                fontWeight: 'var(--weight-semibold)',
              }}
            >
              {formatCurrency(monthlySpent)}
            </span>
            <span
              className="text-mono-sm"
              style={{
                color: 'var(--text-tertiary)',
                marginLeft: 'var(--space-2)',
              }}
            >
              / {formatCurrency(monthlyBudget)}
            </span>
          </div>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--bg-surface)' }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, budgetProgress)}%`,
              backgroundColor: isOverBudget
                ? 'var(--semantic-error)'
                : budgetProgress > 80
                  ? 'var(--semantic-warning)'
                  : 'var(--semantic-success)',
            }}
          />
        </div>
        <div
          className="text-body-sm"
          style={{
            color: 'var(--text-tertiary)',
            marginTop: 'var(--space-2)',
          }}
        >
          {Math.round(budgetProgress)}% of budget used
        </div>
      </div>

      {/* Categories */}
      <div className="stack-sm">
        {categories.map((cat) => (
          <CategoryRow
            key={cat.id}
            category={cat}
            maxPercentage={maxPercentage}
          />
        ))}
      </div>
    </section>
  );
}

export default SpendingAnalysis;
