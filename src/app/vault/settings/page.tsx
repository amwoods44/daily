'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Save, RotateCcw, Lock } from 'lucide-react';
import {
  isUnlocked,
  loadReminderConfig,
  saveReminderConfig,
  resetReminderConfig,
  DEFAULT_REMINDER_CONFIG,
  CATEGORY_META,
  ALL_CATEGORIES,
} from '@/lib/vault';
import type { ReminderConfig, VaultCategory } from '@/lib/vault';
import { VaultUnlock } from '@/components/vault';

export default function VaultSettingsPage() {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [config, setConfig] = useState<ReminderConfig>(DEFAULT_REMINDER_CONFIG);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const currentlyUnlocked = isUnlocked();
    setUnlocked(currentlyUnlocked);

    if (currentlyUnlocked) {
      setConfig(loadReminderConfig());
    }
  }, []);

  const handleSave = () => {
    setSaving(true);
    saveReminderConfig(config);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    resetReminderConfig();
    setConfig(DEFAULT_REMINDER_CONFIG);
  };

  const updateCategoryConfig = (
    category: VaultCategory,
    field: 'reminderDays' | 'priorityBoostDays',
    value: number
  ) => {
    setConfig((prev) => ({
      ...prev,
      categoryDefaults: {
        ...prev.categoryDefaults,
        [category]: {
          ...prev.categoryDefaults[category],
          [field]: value,
        },
      },
    }));
  };

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
    return <VaultUnlock onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-stone-200">
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          <button
            onClick={() => router.push('/vault')}
            className="p-2 -ml-2 text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-stone-900">Vault Settings</h1>
          <div className="w-9" />
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Global toggle */}
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-stone-500" />
              <div>
                <p className="font-medium text-stone-900">Reminders</p>
                <p className="text-sm text-stone-500">Enable vault reminders</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.globalEnabled}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, globalEnabled: e.target.checked }))
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-stone-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-900"></div>
            </label>
          </div>
        </div>

        {/* Category settings */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-stone-900">Reminder Windows</h2>
          <p className="text-sm text-stone-500">
            Customize how many days before a date you&apos;ll be reminded for each category.
          </p>

          <div className="space-y-3">
            {ALL_CATEGORIES.map((category) => {
              const meta = CATEGORY_META[category];
              const categoryConfig = config.categoryDefaults[category] ??
                DEFAULT_REMINDER_CONFIG.categoryDefaults[category] ?? {
                  reminderDays: 30,
                  priorityBoostDays: 7,
                };

              return (
                <div
                  key={category}
                  className="bg-white rounded-xl border border-stone-200 p-4 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{meta.emoji}</span>
                    <span className="font-medium text-stone-900">{meta.label}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-stone-500 mb-1">
                        Remind days before
                      </label>
                      <input
                        type="number"
                        value={categoryConfig.reminderDays}
                        onChange={(e) =>
                          updateCategoryConfig(
                            category,
                            'reminderDays',
                            Number(e.target.value)
                          )
                        }
                        min={1}
                        max={365}
                        className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-500 mb-1">
                        High priority at
                      </label>
                      <input
                        type="number"
                        value={categoryConfig.priorityBoostDays}
                        onChange={(e) =>
                          updateCategoryConfig(
                            category,
                            'priorityBoostDays',
                            Number(e.target.value)
                          )
                        }
                        min={1}
                        max={180}
                        className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-stone-900 text-white font-medium hover:bg-stone-800 disabled:opacity-50 transition-colors"
          >
            {saved ? (
              <>Saved!</>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>

        {/* Security section */}
        <div className="pt-6 border-t border-stone-200">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">Security</h2>
          <div className="bg-white rounded-xl border border-stone-200 p-4">
            <div className="flex items-center gap-3 text-stone-600">
              <Lock className="w-5 h-5" />
              <div>
                <p className="font-medium">Change Passphrase</p>
                <p className="text-sm text-stone-500">Update your vault encryption key</p>
              </div>
            </div>
            <button
              onClick={() => alert('Change passphrase feature coming soon')}
              className="mt-3 text-sm text-stone-600 hover:text-stone-900 underline"
            >
              Change passphrase
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
