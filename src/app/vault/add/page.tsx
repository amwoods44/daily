'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { isUnlocked } from '@/lib/vault';
import { AddItemFlow, VaultUnlock } from '@/components/vault';

export default function AddItemPage() {
  const router = useRouter();
  // Use lazy initializer - safe for client components
  const [unlocked, setUnlocked] = useState<boolean>(() => isUnlocked());

  // Not unlocked - show unlock screen
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
