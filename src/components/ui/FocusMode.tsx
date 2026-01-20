'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface FocusModeContextType {
  isActive: boolean;
  toggle: () => void;
  enable: () => void;
  disable: () => void;
}

const FocusModeContext = createContext<FocusModeContextType | null>(null);

const STORAGE_KEY = 'daily-pulse-focus-mode';

export function FocusModeProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);

  // Load saved state
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'true') {
      setIsActive(true);
    }
  }, []);

  const toggle = useCallback(() => {
    setIsActive((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const enable = useCallback(() => {
    setIsActive(true);
    localStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  const disable = useCallback(() => {
    setIsActive(false);
    localStorage.setItem(STORAGE_KEY, 'false');
  }, []);

  return (
    <FocusModeContext.Provider value={{ isActive, toggle, enable, disable }}>
      {children}
    </FocusModeContext.Provider>
  );
}

export function useFocusMode() {
  const context = useContext(FocusModeContext);
  if (!context) {
    return {
      isActive: false,
      toggle: () => {},
      enable: () => {},
      disable: () => {},
    };
  }
  return context;
}

// Toggle button component
export function FocusModeToggle() {
  const { isActive, toggle } = useFocusMode();

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all btn-press"
      style={{
        backgroundColor: isActive ? 'var(--brand-primary)' : 'var(--bg-muted)',
        color: isActive ? 'var(--text-on-accent)' : 'var(--text-secondary)',
      }}
      title={isActive ? 'Exit Focus Mode' : 'Enter Focus Mode'}
    >
      {isActive ? (
        <>
          <EyeOff className="w-4 h-4" />
          <span className="hidden sm:inline">Focus Mode</span>
        </>
      ) : (
        <>
          <Eye className="w-4 h-4" />
          <span className="hidden sm:inline">Focus</span>
        </>
      )}
    </button>
  );
}

// Wrapper that applies focus mode styles
export function FocusModeSection({
  children,
  isPriority = false,
}: {
  children: React.ReactNode;
  isPriority?: boolean;
}) {
  const { isActive } = useFocusMode();

  return (
    <div
      className={
        isActive
          ? isPriority
            ? 'focus-mode-visible'
            : 'focus-mode-hidden'
          : ''
      }
    >
      {children}
    </div>
  );
}
