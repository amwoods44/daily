'use client';

import { useState, useEffect } from 'react';
import { X, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { mode, setMode } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything on server or before hydration
  if (!mounted) return null;

  return (
    <>
      {/* Fixed trigger button - top right */}
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-ghost btn-sm fixed"
        style={{
          top: 'var(--space-6)',
          right: 'var(--space-6)',
          zIndex: 40,
        }}
        aria-label="Change theme"
      >
        {mode === 'light' && <Sun className="w-4 h-4" />}
        {mode === 'dark' && <Moon className="w-4 h-4" />}
        {mode === 'system' && <Monitor className="w-4 h-4" />}
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{
            zIndex: 100,
            padding: 'var(--space-6)',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
          }}
          onClick={() => setIsOpen(false)}
        >
          {/* Panel */}
          <div
            className="card-accent w-full"
            style={{ maxWidth: '480px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between"
              style={{ marginBottom: 'var(--space-8)' }}
            >
              <div>
                <h2
                  className="text-display-sm"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Theme Mode
                </h2>
                <p
                  className="text-body-sm"
                  style={{
                    color: 'var(--text-tertiary)',
                    marginTop: 'var(--space-1)',
                  }}
                >
                  Choose light or dark appearance
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="btn-icon btn-ghost"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode selector */}
            <div className="stack-md">
              {[
                { id: 'light', icon: Sun, label: 'Light', description: 'Clean, bright interface' },
                { id: 'dark', icon: Moon, label: 'Dark', description: 'Easy on the eyes' },
                { id: 'system', icon: Monitor, label: 'System', description: 'Match your OS preference' },
              ].map(({ id, icon: Icon, label, description }) => (
                <button
                  key={id}
                  onClick={() => {
                    setMode(id as 'light' | 'dark' | 'system');
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center text-left"
                  style={{
                    gap: 'var(--space-4)',
                    padding: 'var(--space-5)',
                    borderRadius: 'var(--radius-xl)',
                    transition: 'all var(--duration-fast) var(--ease-out-quart)',
                    backgroundColor: mode === id ? 'var(--brand-primary-subtle)' : 'var(--bg-muted)',
                    border: '2px solid',
                    borderColor: mode === id ? 'var(--brand-primary)' : 'transparent',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (mode !== id) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (mode !== id) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-muted)';
                    }
                  }}
                >
                  <div
                    className="stat-icon"
                    style={{
                      backgroundColor: mode === id ? 'var(--brand-primary)' : 'var(--bg-surface)',
                      color: mode === id ? 'var(--text-on-accent)' : 'var(--text-tertiary)',
                    }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div
                      className="text-body"
                      style={{
                        fontWeight: 'var(--weight-semibold)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {label}
                    </div>
                    <p
                      className="text-body-sm"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
