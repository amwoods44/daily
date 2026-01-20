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
      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-ghost btn-icon"
        aria-label="Change theme"
      >
        {mode === 'light' && <Sun className="w-5 h-5" />}
        {mode === 'dark' && <Moon className="w-5 h-5" />}
        {mode === 'system' && <Monitor className="w-5 h-5" />}
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          />

          {/* Panel */}
          <div
            className="card relative w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-heading-lg">
                  Theme Mode
                </h2>
                <p className="text-body-sm" style={{ color: 'var(--text-tertiary)' }}>
                  Choose light or dark appearance
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="btn btn-icon btn-ghost"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode selector */}
            <div className="space-y-3">
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
                  className="w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left"
                  style={{
                    backgroundColor: mode === id ? 'var(--brand-primary-subtle)' : 'var(--bg-muted)',
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    borderColor: mode === id ? 'var(--brand-primary)' : 'transparent',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: mode === id ? 'var(--brand-primary)' : 'var(--bg-surface)',
                      color: mode === id ? 'var(--text-inverse)' : 'var(--text-tertiary)',
                    }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {label}
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
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
