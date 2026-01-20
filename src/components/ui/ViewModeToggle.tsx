'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Minimize2, List, Maximize2 } from 'lucide-react';

type ViewMode = 'minimal' | 'curated' | 'full';

interface ViewModeContextType {
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
}

const ViewModeContext = createContext<ViewModeContextType | null>(null);

export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error('useViewMode must be used within ViewModeProvider');
  }
  return context;
}

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ViewMode>('curated');

  return (
    <ViewModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}

interface ViewModeToggleProps {
  compact?: boolean;
}

export function ViewModeToggle({ compact = false }: ViewModeToggleProps) {
  const { mode, setMode } = useViewMode();

  const modes: { id: ViewMode; icon: typeof Minimize2; label: string; shortLabel: string }[] = [
    { id: 'minimal', icon: Minimize2, label: 'Minimal', shortLabel: 'Min' },
    { id: 'curated', icon: List, label: 'Curated', shortLabel: 'Cur' },
    { id: 'full', icon: Maximize2, label: 'Full', shortLabel: 'Full' },
  ];

  return (
    <div
      className="view-mode-toggle"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        padding: 3,
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--bg-muted)',
        border: '1px solid var(--border-default)',
      }}
    >
      {modes.map(({ id, icon: Icon, label, shortLabel }) => {
        const isActive = mode === id;
        return (
          <button
            key={id}
            onClick={() => setMode(id)}
            title={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: compact ? '6px 10px' : '8px 14px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 500,
              transition: 'all 0.2s ease',
              backgroundColor: isActive ? 'var(--bg-surface)' : 'transparent',
              color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
              boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <Icon style={{ width: 14, height: 14 }} />
            {!compact && <span>{shortLabel}</span>}
          </button>
        );
      })}
    </div>
  );
}

// Helper component for conditionally showing content based on view mode
export function ViewModeContent({
  minimal,
  curated,
  full,
  children,
}: {
  minimal?: ReactNode;
  curated?: ReactNode;
  full?: ReactNode;
  children?: ReactNode;
}) {
  const { mode } = useViewMode();

  // If specific content is provided for the mode, show it
  if (mode === 'minimal' && minimal !== undefined) return <>{minimal}</>;
  if (mode === 'curated' && curated !== undefined) return <>{curated}</>;
  if (mode === 'full' && full !== undefined) return <>{full}</>;

  // Otherwise show children
  return <>{children}</>;
}

// Helper hook for view mode visibility
export function useViewModeVisibility() {
  const { mode } = useViewMode();

  return {
    isMinimal: mode === 'minimal',
    isCurated: mode === 'curated',
    isFull: mode === 'full',
    showInMinimal: mode !== 'full', // Show in minimal and curated
    showInCurated: mode !== 'minimal', // Show in curated and full
    showAlways: true,
    showOnlyInFull: mode === 'full',
    showOnlyInMinimal: mode === 'minimal',
  };
}
