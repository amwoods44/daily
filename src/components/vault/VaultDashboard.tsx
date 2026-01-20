'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Settings, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import {
  isUnlocked,
  getItems,
  syncReminders,
  subscribe,
} from '@/lib/vault';
import type { VaultItem, VaultReminder } from '@/lib/vault';
import { VaultUnlock } from './VaultUnlock';
import { VaultItemList } from './VaultItemList';
import { NeedsAttentionList } from './NeedsAttentionList';
import { AssetsSummary } from './AssetsSummary';

export function VaultDashboard() {
  const router = useRouter();
  // Use lazy initializers for initial state
  const [unlocked, setUnlocked] = useState(() => isUnlocked());
  const [items, setItems] = useState<VaultItem[]>([]);
  const [reminders, setReminders] = useState<VaultReminder[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!isUnlocked()) return;

    try {
      const loadedItems = getItems();
      setItems(loadedItems);

      // Sync reminders (generates new ones, preserves dismissed state)
      const syncedReminders = await syncReminders();
      setReminders(syncedReminders);
    } catch (error) {
      console.error('Failed to load vault data:', error);
    }
  }, []);

  useEffect(() => {
    // Load data if already unlocked
    if (unlocked) {
      loadData().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    // Subscribe to changes (callback-based setState is valid)
    const unsubscribe = subscribe(() => {
      const nowUnlocked = isUnlocked();
      setUnlocked(nowUnlocked);
      if (nowUnlocked) {
        loadData();
      }
    });

    return unsubscribe;
  }, [loadData, unlocked]);

  const handleUnlock = () => {
    setUnlocked(true);
    loadData();
  };

  const handleRefresh = async () => {
    setLoading(true);
    await loadData();
    setLoading(false);
  };

  // Show unlock screen if not unlocked
  if (!unlocked) {
    return <VaultUnlock onUnlock={handleUnlock} />;
  }

  // Filter active reminders
  const activeReminders = reminders.filter((r) => {
    if (r.dismissed) return false;
    if (r.snoozedUntil) {
      const today = new Date().toISOString().split('T')[0];
      if (r.snoozedUntil > today) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center justify-between px-4 py-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 -ml-2 transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Life Vault
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {items.length} items • {activeReminders.length} needs attention
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 transition-colors disabled:opacity-50"
              style={{ color: 'var(--text-muted)' }}
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => router.push('/vault/settings')}
              className="p-2 transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="px-4 py-6 max-w-2xl mx-auto space-y-8">
        {/* Needs attention */}
        {activeReminders.length > 0 && (
          <NeedsAttentionList
            reminders={activeReminders}
            items={items}
            onUpdate={loadData}
          />
        )}

        {/* Assets overview */}
        <AssetsSummary items={items} />

        {/* All items */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            All Items
          </h2>
          <VaultItemList
            items={items}
            emptyMessage="No items yet. Add your first item to get started."
          />
        </div>
      </main>

      {/* FAB - Add item */}
      <button
        onClick={() => router.push('/vault/add')}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg active:scale-95 transition-all flex items-center justify-center"
        style={{
          backgroundColor: 'var(--accent)',
          color: 'var(--text-on-accent)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
