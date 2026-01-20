'use client';

import { useState } from 'react';
import { Lock, Eye, EyeOff, Shield, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { isInitialized, initialize, unlock } from '@/lib/vault';

interface VaultUnlockProps {
  onUnlock: () => void;
}

export function VaultUnlock({ onUnlock }: VaultUnlockProps) {
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isNewVault = !isInitialized();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isNewVault) {
        // Creating new vault
        if (passphrase.length < 8) {
          setError('Passphrase must be at least 8 characters');
          setLoading(false);
          return;
        }
        if (passphrase !== confirmPassphrase) {
          setError('Passphrases do not match');
          setLoading(false);
          return;
        }
        await initialize(passphrase);
        onUnlock();
      } else {
        // Unlocking existing vault
        const success = await unlock(passphrase);
        if (success) {
          onUnlock();
        } else {
          setError('Incorrect passphrase');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-canvas)' }}>
      {/* Back button */}
      <div className="p-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back to Dashboard</span>
        </Link>
      </div>

      <div className="flex items-center justify-center p-6 pt-0">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{ backgroundColor: 'var(--bg-muted)' }}
            >
              <Shield className="w-8 h-8" style={{ color: 'var(--text-secondary)' }} />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {isNewVault ? 'Create Your Vault' : 'Unlock Vault'}
            </h1>
            <p style={{ color: 'var(--text-tertiary)' }}>
              {isNewVault
                ? "Set a passphrase to encrypt your vault. You'll need this to access your data."
                : 'Enter your passphrase to access your vault.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Passphrase input */}
            <div>
              <label
                htmlFor="passphrase"
                className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--text-secondary)' }}
              >
                Passphrase
              </label>
              <div className="relative">
                <input
                  id="passphrase"
                  type={showPassphrase ? 'text' : 'password'}
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder={isNewVault ? 'Create a strong passphrase' : 'Enter your passphrase'}
                  className="w-full px-4 py-3 pr-12 rounded-xl transition-all"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                  }}
                  autoFocus
                  autoComplete={isNewVault ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassphrase(!showPassphrase)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {showPassphrase ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm passphrase (new vault only) */}
            {isNewVault && (
              <div>
                <label
                  htmlFor="confirmPassphrase"
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Confirm Passphrase
                </label>
                <input
                  id="confirmPassphrase"
                  type={showPassphrase ? 'text' : 'password'}
                  value={confirmPassphrase}
                  onChange={(e) => setConfirmPassphrase(e.target.value)}
                  placeholder="Confirm your passphrase"
                  className="w-full px-4 py-3 rounded-xl transition-all"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                  }}
                  autoComplete="new-password"
                />
              </div>
            )}

            {/* Error message */}
            {error && (
              <div
                className="flex items-center gap-2 p-3 rounded-lg"
                style={{
                  backgroundColor: 'var(--semantic-error-subtle)',
                  color: 'var(--semantic-error)',
                }}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || !passphrase}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{
                backgroundColor: 'var(--brand-primary)',
                color: 'var(--text-on-accent)',
              }}
            >
              {loading ? (
                <div
                  className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: 'var(--text-on-accent)', borderTopColor: 'transparent' }}
                />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  {isNewVault ? 'Create Vault' : 'Unlock'}
                </>
              )}
            </button>

            {/* Security note */}
            {isNewVault && (
              <p className="text-xs text-center mt-4" style={{ color: 'var(--text-tertiary)' }}>
                Your passphrase is never stored. If you forget it, your data cannot be recovered.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
