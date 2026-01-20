'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsibleSectionProps {
  id: string; // Used for localStorage persistence
  title: React.ReactNode;
  badge?: React.ReactNode;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  className?: string;
}

const STORAGE_PREFIX = 'daily-pulse-section-';

export function CollapsibleSection({
  id,
  title,
  badge,
  defaultExpanded = true,
  children,
  className = '',
}: CollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [mounted, setMounted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | 'auto'>('auto');

  // Load saved state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}${id}`);
    if (saved !== null) {
      setExpanded(saved === 'true');
    }
    setMounted(true);
  }, [id]);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(`${STORAGE_PREFIX}${id}`, String(expanded));
    }
  }, [expanded, id, mounted]);

  // Measure content height for smooth animation
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [children]);

  const toggle = () => setExpanded(!expanded);

  return (
    <div className={className}>
      {/* Header */}
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between py-3 group"
      >
        <div className="flex items-center gap-3">
          {typeof title === 'string' ? (
            <span
              className="text-xs font-semibold uppercase tracking-[0.15em]"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {title}
            </span>
          ) : (
            title
          )}
          {badge && <span>{badge}</span>}
        </div>
        <ChevronDown
          className={`w-4 h-4 chevron-rotate ${expanded ? 'expanded' : ''}`}
          style={{ color: 'var(--text-tertiary)' }}
        />
      </button>

      {/* Content with smooth height animation */}
      <div
        style={{
          maxHeight: expanded ? contentHeight : 0,
          overflow: 'hidden',
          transition: 'max-height 0.3s ease, opacity 0.3s ease',
          opacity: expanded ? 1 : 0,
        }}
      >
        <div ref={contentRef}>
          {children}
        </div>
      </div>
    </div>
  );
}

// Simpler variant for inline expand/collapse
export function ExpandableContent({
  expanded,
  children,
}: {
  expanded: boolean;
  children: React.ReactNode;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [children]);

  return (
    <div
      style={{
        maxHeight: expanded ? height : 0,
        overflow: 'hidden',
        transition: 'max-height 0.3s ease, opacity 0.2s ease',
        opacity: expanded ? 1 : 0,
      }}
    >
      <div ref={contentRef}>{children}</div>
    </div>
  );
}
