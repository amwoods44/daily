'use client';

import { useMemo } from 'react';
import { TrendingUp, Package, FileText, Wallet } from 'lucide-react';
import type { VaultItem } from '@/lib/vault';
import { CATEGORY_META } from '@/lib/vault';

interface AssetsSummaryProps {
  items: VaultItem[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function AssetsSummary({ items }: AssetsSummaryProps) {
  const stats = useMemo(() => {
    const assets = items.filter((i) => i.type === 'asset');
    const documents = items.filter((i) => i.type === 'document');
    const accounts = items.filter((i) => i.type === 'account');

    const totalValue = assets.reduce((sum, item) => sum + (item.currentValue ?? 0), 0);
    const purchaseValue = assets.reduce((sum, item) => sum + (item.purchasePrice ?? 0), 0);

    // Group assets by category
    const categoryBreakdown = assets.reduce(
      (acc, item) => {
        const cat = item.category;
        if (!acc[cat]) {
          acc[cat] = { count: 0, value: 0 };
        }
        acc[cat].count += 1;
        acc[cat].value += item.currentValue ?? 0;
        return acc;
      },
      {} as Record<string, { count: number; value: number }>
    );

    // Sort categories by value
    const topCategories = Object.entries(categoryBreakdown)
      .sort(([, a], [, b]) => b.value - a.value)
      .slice(0, 4);

    return {
      totalValue,
      purchaseValue,
      assetCount: assets.length,
      documentCount: documents.length,
      accountCount: accounts.length,
      topCategories,
    };
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
        Overview
      </h2>

      {/* Value card */}
      {stats.totalValue > 0 && (
        <div
          className="p-5 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
            color: 'var(--text-on-accent)',
          }}
        >
          <p className="text-sm opacity-80 mb-1">Total Asset Value</p>
          <p className="text-3xl font-bold">{formatCurrency(stats.totalValue)}</p>
          {stats.purchaseValue > 0 && stats.purchaseValue !== stats.totalValue && (
            <div className="flex items-center gap-1 mt-2 text-sm opacity-80">
              <TrendingUp className="w-4 h-4" />
              <span>
                {formatCurrency(stats.totalValue - stats.purchaseValue)} from purchase
              </span>
            </div>
          )}
        </div>
      )}

      {/* Counts */}
      <div className="grid grid-cols-3 gap-3">
        <div
          className="p-4 rounded-xl"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}
        >
          <Package className="w-5 h-5 mb-2" style={{ color: 'var(--text-muted)' }} />
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {stats.assetCount}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Assets</p>
        </div>
        <div
          className="p-4 rounded-xl"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}
        >
          <FileText className="w-5 h-5 mb-2" style={{ color: 'var(--text-muted)' }} />
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {stats.documentCount}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Documents</p>
        </div>
        <div
          className="p-4 rounded-xl"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}
        >
          <Wallet className="w-5 h-5 mb-2" style={{ color: 'var(--text-muted)' }} />
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {stats.accountCount}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Accounts</p>
        </div>
      </div>

      {/* Category breakdown */}
      {stats.topCategories.length > 0 && (
        <div
          className="p-4 rounded-xl"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}
        >
          <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
            Assets by Category
          </p>
          <div className="space-y-3">
            {stats.topCategories.map(([category, data]) => {
              const meta = CATEGORY_META[category as keyof typeof CATEGORY_META];
              const percentage =
                stats.totalValue > 0
                  ? Math.round((data.value / stats.totalValue) * 100)
                  : 0;

              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-sm flex items-center gap-2"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <span>{meta?.emoji || '📦'}</span>
                      {meta?.label || category}
                    </span>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {formatCurrency(data.value)}
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: 'var(--bg-tertiary)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: 'var(--accent)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
