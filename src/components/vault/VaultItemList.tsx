'use client';

import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Package, FileText, Wallet } from 'lucide-react';
import type { VaultItem, VaultItemType } from '@/lib/vault';
import { VaultItemCard } from './VaultItemCard';

interface VaultItemListProps {
  items: VaultItem[];
  emptyMessage?: string;
}

const TYPE_TABS: { value: VaultItemType | 'all'; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'All', icon: Package },
  { value: 'asset', label: 'Assets', icon: Package },
  { value: 'document', label: 'Documents', icon: FileText },
  { value: 'account', label: 'Accounts', icon: Wallet },
];

export function VaultItemList({ items, emptyMessage = 'No items found' }: VaultItemListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState<VaultItemType | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredItems = useMemo(() => {
    let filtered = items;

    // Filter by type
    if (activeType !== 'all') {
      filtered = filtered.filter((item) => item.type === activeType);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort by updatedAt (most recent first)
    return filtered.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [items, activeType, searchQuery]);

  const typeCounts = useMemo(() => {
    return {
      all: items.length,
      asset: items.filter((i) => i.type === 'asset').length,
      document: items.filter((i) => i.type === 'document').length,
      account: items.filter((i) => i.type === 'account').length,
    };
  }, [items]);

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'var(--text-tertiary)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl transition-all text-sm"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="p-2.5 rounded-xl transition-all"
          style={{
            backgroundColor: showFilters ? 'var(--brand-primary)' : 'var(--bg-surface)',
            color: showFilters ? 'var(--text-on-accent)' : 'var(--text-secondary)',
            border: showFilters ? '1px solid var(--brand-primary)' : '1px solid var(--border-default)',
          }}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TYPE_TABS.map((tab) => {
          const Icon = tab.icon;
          const count = typeCounts[tab.value];
          const isActive = activeType === tab.value;

          return (
            <button
              key={tab.value}
              onClick={() => setActiveType(tab.value)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
              style={{
                backgroundColor: isActive ? 'var(--brand-primary)' : 'var(--bg-muted)',
                color: isActive ? 'var(--text-on-accent)' : 'var(--text-secondary)',
              }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'var(--bg-muted)',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Items list */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-tertiary)' }} />
          <p style={{ color: 'var(--text-tertiary)' }}>{emptyMessage}</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-sm underline"
              style={{ color: 'var(--text-secondary)' }}
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <VaultItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
