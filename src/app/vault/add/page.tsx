'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isUnlocked } from '@/lib/vault';
import { AddItemFlow, VaultUnlock } from '@/components/vault';

export default function AddItemPage() {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  useEffect(() => {
    setUnlocked(isUnlocked());
  }, []);

  // Still checking
  if (unlocked === null) {
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
        onUnlock={() => setUnlocked(true)}
      />
    );
  }

  return (
    <AddItemFlow
      onComplete={() => router.push('/vault')}
      onCancel={() => router.push('/vault')}
    />
  );
}
