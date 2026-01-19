'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { isUnlocked, getItem, getReminders, subscribe } from '@/lib/vault';
import type { VaultItem, VaultReminder } from '@/lib/vault';
import { ItemDetail, VaultUnlock } from '@/components/vault';

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [item, setItem] = useState<VaultItem | null>(null);
  const [reminders, setReminders] = useState<VaultReminder[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    if (!isUnlocked()) return;

    const loadedItem = getItem(id);
    if (!loadedItem) {
      router.push('/vault');
      return;
    }

    setItem(loadedItem);
    setReminders(getReminders());
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    const currentlyUnlocked = isUnlocked();
    setUnlocked(currentlyUnlocked);

    if (currentlyUnlocked) {
      loadData();
    } else {
      setLoading(false);
    }

    const unsubscribe = subscribe(() => {
      const nowUnlocked = isUnlocked();
      setUnlocked(nowUnlocked);
      if (nowUnlocked) {
        loadData();
      }
    });

    return unsubscribe;
  }, [loadData]);

  // Still checking
  if (unlocked === null || loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not unlocked
  if (!unlocked) {
    return (
      <VaultUnlock
        onUnlock={() => {
          setUnlocked(true);
          loadData();
        }}
      />
    );
  }

  // Item not found
  if (!item) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-500">Item not found</p>
          <button
            onClick={() => router.push('/vault')}
            className="mt-4 px-4 py-2 rounded-lg bg-stone-900 text-white"
          >
            Back to Vault
          </button>
        </div>
      </div>
    );
  }

  return <ItemDetail item={item} reminders={reminders} onUpdate={loadData} />;
}
