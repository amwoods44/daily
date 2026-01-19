'use client';

import { useState, useEffect } from 'react';
import { Palette, X, Check, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { themes, themeOrder } from '@/lib/themes';

export function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { themeId, setThemeId, mode, setMode } = useTheme();

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
        className="fixed bottom-24 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          backgroundColor: 'var(--bg-accent)',
          color: 'var(--text-on-accent)',
          boxShadow: 'var(--shadow-lg)',
        }}
        aria-label="Change theme"
      >
        <Palette className="w-5 h-5" />
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
            className="relative w-full max-w-md rounded-2xl p-6 overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-card)',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2
                  className="text-xl font-semibold"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--text-primary)',
                  }}
                >
                  Choose Theme
                </h2>
                <p
                  className="text-sm mt-1"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Select a visual style that suits you
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode selector */}
            <div
              className="flex rounded-xl p-1 mb-6"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              {[
                { id: 'light', icon: Sun, label: 'Light' },
                { id: 'dark', icon: Moon, label: 'Dark' },
                { id: 'system', icon: Monitor, label: 'System' },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setMode(id as 'light' | 'dark' | 'system')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: mode === id ? 'var(--bg-card)' : 'transparent',
                    color: mode === id ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    boxShadow: mode === id ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Theme grid */}
            <div className="space-y-3">
              {themeOrder.map((id) => {
                const theme = themes[id];
                const isSelected = themeId === id;

                return (
                  <button
                    key={id}
                    onClick={() => setThemeId(id)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left"
                    style={{
                      backgroundColor: isSelected ? 'var(--bg-accent-subtle)' : 'var(--bg-secondary)',
                      borderWidth: '2px',
                      borderStyle: 'solid',
                      borderColor: isSelected ? 'var(--accent)' : 'transparent',
                    }}
                  >
                    {/* Color preview */}
                    <div
                      className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 relative"
                      style={{
                        backgroundColor: theme.colors.bgPrimary,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}
                    >
                      {/* Mini preview of theme */}
                      <div
                        className="absolute top-2 left-2 right-2 h-2 rounded-full"
                        style={{ backgroundColor: theme.colors.textPrimary, opacity: 0.8 }}
                      />
                      <div
                        className="absolute top-5 left-2 w-6 h-1 rounded-full"
                        style={{ backgroundColor: theme.colors.textTertiary }}
                      />
                      <div
                        className="absolute bottom-2 right-2 w-4 h-4 rounded-md"
                        style={{ backgroundColor: theme.colors.accent }}
                      />
                    </div>

                    {/* Theme info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-semibold"
                          style={{
                            fontFamily: 'var(--font-heading)',
                            color: 'var(--text-primary)',
                          }}
                        >
                          {theme.name}
                        </span>
                        {theme.isDark && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: 'var(--bg-tertiary)',
                              color: 'var(--text-tertiary)',
                            }}
                          >
                            Dark
                          </span>
                        )}
                      </div>
                      <p
                        className="text-sm mt-0.5 truncate"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        {theme.description}
                      </p>
                    </div>

                    {/* Color swatches */}
                    <div className="flex gap-1 flex-shrink-0">
                      {[
                        theme.colors.bgPrimary,
                        theme.colors.textPrimary,
                        theme.colors.accent,
                      ].map((color, i) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded-full"
                          style={{
                            backgroundColor: color,
                            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)',
                          }}
                        />
                      ))}
                    </div>

                    {/* Selected indicator */}
                    {isSelected && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: 'var(--accent)',
                          color: 'var(--text-on-accent)',
                        }}
                      >
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
