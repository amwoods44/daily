'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lock, Unlock, ArrowLeft, Save, RotateCcw, Check } from 'lucide-react';
import { useDashboardConfig } from '@/hooks/useDashboardConfig';
import { PersonalInfoForm } from '@/components/settings/PersonalInfoForm';
import { LayoutConfigPanel } from '@/components/settings/LayoutConfigPanel';
import { PresetSelector } from '@/components/settings/PresetSelector';

type Tab = 'personal' | 'layout' | 'presets';

export default function DashboardSettingsPage() {
  const {
    config,
    updatePersonalInfo,
    updateLayout,
    isLocked,
    lock,
    unlock,
    reset,
    applyPreset,
    exportConfig,
    importConfig,
  } = useDashboardConfig();

  const [activeTab, setActiveTab] = useState<Tab>('personal');
  const [unlockInput, setUnlockInput] = useState('');
  const [unlockError, setUnlockError] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleUnlock = () => {
    if (unlock(unlockInput)) {
      setUnlockInput('');
      setUnlockError(false);
    } else {
      setUnlockError(true);
    }
  };

  const handleLock = () => {
    if (confirm('Lock dashboard settings? You\'ll need your passphrase to make changes.')) {
      lock();
    }
  };

  const handleReset = () => {
    if (confirm('Reset all settings to defaults? This cannot be undone.')) {
      reset();
      setSaveMessage('Settings reset to defaults');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleSave = () => {
    setSaveMessage('Settings saved successfully');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  // Locked state
  if (isLocked) {
    return (
      <div
        className="min-h-screen grain-overlay"
        style={{ backgroundColor: 'var(--bg-canvas)' }}
      >
        <header className="masthead">
          <div className="masthead-inner">
            <Link href="/settings" className="btn btn-ghost btn-sm inline-flex items-center" style={{ gap: 'var(--space-2)' }}>
              <ArrowLeft className="w-4 h-4" />
              Back to Settings
            </Link>
            <h1
              className="text-display-md"
              style={{
                color: 'var(--text-primary)',
                marginTop: 'var(--space-8)',
              }}
            >
              Dashboard Settings
            </h1>
          </div>
        </header>

        <main
          className="container-premium"
          style={{
            paddingTop: 'var(--space-16)',
            paddingBottom: 'var(--space-16)',
          }}
        >
          <div
            className="card-accent"
            style={{
              maxWidth: '600px',
              margin: '0 auto',
              textAlign: 'center',
            }}
          >
            <div className="stat-icon" style={{ margin: '0 auto var(--space-8)' }}>
              <Lock className="w-8 h-8" style={{ color: 'var(--brand-primary)' }} />
            </div>

            <h2
              className="text-display-sm"
              style={{
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-3)',
              }}
            >
              Dashboard is Locked
            </h2>

            <p
              className="text-body-lg"
              style={{
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-10)',
              }}
            >
              Enter your passphrase to customize dashboard settings
            </p>

            <div style={{ marginTop: 'var(--space-8)' }}>
              <input
                type="password"
                value={unlockInput}
                onChange={(e) => setUnlockInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                placeholder="Enter passphrase"
                autoFocus
                className="text-mono"
                style={{
                  width: '100%',
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-lg)',
                  border: `2px solid ${
                    unlockError ? 'var(--semantic-error)' : 'var(--border-default)'
                  }`,
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-lg)',
                  fontFamily: 'var(--font-mono)',
                  textAlign: 'center',
                }}
              />

              {unlockError && (
                <p
                  className="text-body-sm"
                  style={{
                    color: 'var(--semantic-error)',
                    marginTop: 'var(--space-2)',
                  }}
                >
                  Incorrect passphrase. Please try again.
                </p>
              )}

              <button
                onClick={handleUnlock}
                className="btn btn-primary btn-xl"
                style={{
                  marginTop: 'var(--space-5)',
                  width: '100%',
                }}
              >
                Unlock Dashboard Settings
              </button>

              <p
                className="text-mono-sm"
                style={{
                  marginTop: 'var(--space-6)',
                  color: 'var(--text-quaternary)',
                }}
              >
                Default passphrase: &quot;daily&quot;
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Unlocked state
  return (
    <div
      className="min-h-screen grain-overlay"
      style={{ backgroundColor: 'var(--bg-canvas)' }}
    >
      <header className="masthead">
        <div className="masthead-inner">
          <div className="flex items-center justify-between">
            <Link href="/settings" className="btn btn-ghost btn-sm inline-flex items-center" style={{ gap: 'var(--space-2)' }}>
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>

            <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
              {saveMessage && (
                <div
                  className="flex items-center text-body-sm"
                  style={{
                    color: 'var(--semantic-success)',
                    gap: 'var(--space-2)',
                  }}
                >
                  <Check className="w-4 h-4" />
                  {saveMessage}
                </div>
              )}

              <button onClick={handleLock} className="btn btn-ghost btn-sm inline-flex items-center" style={{ gap: 'var(--space-2)' }}>
                <Unlock className="w-4 h-4" />
                Lock
              </button>
            </div>
          </div>

          <h1
            className="text-display-md"
            style={{
              color: 'var(--text-primary)',
              marginTop: 'var(--space-8)',
            }}
          >
            Dashboard Settings
          </h1>

          <p
            className="text-body-lg"
            style={{
              color: 'var(--text-secondary)',
              marginTop: 'var(--space-3)',
            }}
          >
            Customize your dashboard layout, data sources, and preferences
          </p>
        </div>
      </header>

      <main
        className="container-premium"
        style={{
          paddingTop: 'var(--space-12)',
          paddingBottom: 'var(--space-20)',
        }}
      >
        {/* Tabs */}
        <div
          className="flex"
          style={{
            gap: 'var(--space-2)',
            marginBottom: 'var(--space-10)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {[
            { id: 'personal' as const, label: 'Personal Info' },
            { id: 'layout' as const, label: 'Dashboard Layout' },
            { id: 'presets' as const, label: 'Quick Presets' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="text-label-md"
              style={{
                padding: 'var(--space-3) var(--space-5)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color:
                  activeTab === tab.id ? 'var(--brand-primary)' : 'var(--text-tertiary)',
                borderBottom:
                  activeTab === tab.id ? '4px solid var(--brand-primary)' : '4px solid transparent',
                marginBottom: '-1px',
                transition: 'all var(--duration-fast) var(--ease-out-quart)',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                }
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'personal' && (
          <PersonalInfoForm personalInfo={config.personalInfo} onChange={updatePersonalInfo} />
        )}

        {activeTab === 'layout' && (
          <LayoutConfigPanel layout={config.layout} onChange={updateLayout} />
        )}

        {activeTab === 'presets' && (
          <PresetSelector
            currentConfig={config}
            onApplyPreset={applyPreset}
            onExport={exportConfig}
            onImport={importConfig}
          />
        )}

        {/* Action buttons */}
        <div
          className="flex"
          style={{
            gap: 'var(--space-4)',
            marginTop: 'var(--space-12)',
            paddingTop: 'var(--space-8)',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <button
            onClick={handleSave}
            className="btn btn-primary btn-lg flex items-center"
            style={{ gap: 'var(--space-2)' }}
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>

          <button
            onClick={handleReset}
            className="btn btn-danger flex items-center"
            style={{ gap: 'var(--space-2)' }}
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </button>

          <button
            onClick={handleLock}
            className="btn btn-secondary flex items-center"
            style={{ gap: 'var(--space-2)', marginLeft: 'auto' }}
          >
            <Lock className="w-4 h-4" />
            Lock Settings
          </button>
        </div>

        {/* Info footer */}
        <div
          className="text-mono-sm text-center"
          style={{
            color: 'var(--text-quaternary)',
            marginTop: 'var(--space-8)',
          }}
        >
          Last modified: {new Date(config.lastModified).toLocaleString()}
        </div>
      </main>
    </div>
  );
}
