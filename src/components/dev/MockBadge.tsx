'use client';

import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Database, ExternalLink } from 'lucide-react';
import {
  DATA_SOURCES,
  shouldShowMockIndicators,
  type DataSource,
} from '@/lib/data-sources';

// ============================================================================
// TYPES
// ============================================================================

interface MockBadgeProps {
  /** The data source key from DATA_SOURCES */
  source: keyof typeof DATA_SOURCES;
  /** Optional custom label */
  label?: string;
  /** Show inline (small) or as a larger card */
  variant?: 'inline' | 'card';
  /** Position for inline variant */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

interface MockIndicatorProps {
  /** The data source key from DATA_SOURCES */
  source: keyof typeof DATA_SOURCES;
  children: React.ReactNode;
  /** Additional class for the wrapper */
  className?: string;
}

// ============================================================================
// BADGE COMPONENT
// ============================================================================

/**
 * Small badge that indicates a section is using mock data
 * Only renders when NEXT_PUBLIC_SHOW_MOCK_INDICATORS=true
 */
export function MockBadge({
  source,
  label,
  variant = 'inline',
  position = 'top-right',
}: MockBadgeProps) {
  const [expanded, setExpanded] = useState(false);

  // Don't render if indicators are disabled
  if (!shouldShowMockIndicators()) {
    return null;
  }

  const sourceData = DATA_SOURCES[source];
  if (!sourceData || sourceData.status === 'real') {
    return null;
  }

  const statusColors = {
    mock: 'bg-[var(--semantic-warning-subtle)] text-[var(--semantic-warning)] border-[var(--semantic-warning)]',
    partial: 'bg-[var(--semantic-info-subtle)] text-[var(--semantic-info)] border-[var(--semantic-info)]',
    real: 'bg-[var(--semantic-success-subtle)] text-[var(--semantic-success)] border-[var(--semantic-success)]',
  };

  const positionClasses = {
    'top-right': 'top-2 right-2',
    'top-left': 'top-2 left-2',
    'bottom-right': 'bottom-2 right-2',
    'bottom-left': 'bottom-2 left-2',
  };

  if (variant === 'inline') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded border ${statusColors[sourceData.status]}`}
        title={`Using ${sourceData.status} data. Real: ${sourceData.realProvider}`}
      >
        <Database className="w-2.5 h-2.5" />
        {label || sourceData.status.toUpperCase()}
      </span>
    );
  }

  // Card variant with expandable details
  return (
    <div className={`absolute ${positionClasses[position]} z-10`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-lg border shadow-sm transition ${statusColors[sourceData.status]} hover:shadow-md`}
      >
        <Database className="w-3 h-3" />
        {sourceData.status.toUpperCase()}
        {expanded ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
      </button>

      {expanded && (
        <div className="absolute top-full right-0 mt-1 w-64 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-default)] shadow-lg p-3 text-xs">
          <div className="font-medium text-[var(--text-primary)] mb-2">
            {source.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </div>

          <div className="space-y-2 text-[var(--text-secondary)]">
            <div>
              <span className="text-[var(--text-tertiary)]">Real provider:</span>
              <br />
              {sourceData.realProvider}
            </div>

            <div>
              <span className="text-[var(--text-tertiary)]">Effort:</span>{' '}
              <span className={`font-medium ${
                sourceData.effort === 'low' ? 'text-[var(--semantic-success)]' :
                sourceData.effort === 'medium' ? 'text-[var(--semantic-warning)]' :
                'text-[var(--semantic-error)]'
              }`}>
                {sourceData.effort}
              </span>
            </div>

            <div>
              <span className="text-[var(--text-tertiary)]">Requirements:</span>
              <ul className="mt-1 space-y-0.5 list-disc list-inside text-[11px]">
                {sourceData.requirements.slice(0, 3).map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
                {sourceData.requirements.length > 3 && (
                  <li className="text-[var(--text-tertiary)]">
                    +{sourceData.requirements.length - 3} more
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// WRAPPER COMPONENT
// ============================================================================

/**
 * Wraps a section and adds a mock indicator badge
 * Only adds the badge when NEXT_PUBLIC_SHOW_MOCK_INDICATORS=true
 */
export function MockIndicator({
  source,
  children,
  className = '',
}: MockIndicatorProps) {
  if (!shouldShowMockIndicators()) {
    return <>{children}</>;
  }

  const sourceData = DATA_SOURCES[source];
  if (!sourceData || sourceData.status === 'real') {
    return <>{children}</>;
  }

  return (
    <div className={`relative ${className}`}>
      {children}
      <MockBadge source={source} variant="card" position="top-right" />
    </div>
  );
}

// ============================================================================
// DEV PANEL COMPONENT
// ============================================================================

/**
 * Developer panel showing all data sources and their status
 * Useful during development to see what's mock vs real
 */
export function DataSourcesPanel() {
  const [isOpen, setIsOpen] = useState(false);

  if (!shouldShowMockIndicators()) {
    return null;
  }

  const sources = Object.entries(DATA_SOURCES);
  const mockCount = sources.filter(([_, s]) => s.status === 'mock').length;
  const totalCount = sources.length;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-2 bg-[var(--semantic-warning-subtle)] hover:bg-[var(--bg-muted)] text-[var(--semantic-warning)] rounded-lg border border-[var(--semantic-warning)] shadow-lg transition text-sm font-medium"
      >
        <AlertCircle className="w-4 h-4" />
        {mockCount}/{totalCount} Mock
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--text-primary)]/50">
          <div className="bg-[var(--bg-surface)] rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[var(--border-default)] flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Data Sources Status
                </h2>
                <p className="text-sm text-[var(--text-tertiary)]">
                  {mockCount} of {totalCount} sources using mock data
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-[var(--bg-muted)] rounded-lg transition"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
              <div className="space-y-3">
                {sources.map(([key, source]) => (
                  <DataSourceRow key={key} name={key} source={source} />
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-[var(--bg-muted)] border-t border-[var(--border-default)] text-xs text-[var(--text-tertiary)]">
              Set <code className="bg-[var(--bg-canvas)] px-1 rounded">NEXT_PUBLIC_SHOW_MOCK_INDICATORS=false</code> in .env.local to hide these indicators
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DataSourceRow({ name, source }: { name: string; source: DataSource }) {
  const [expanded, setExpanded] = useState(false);

  const statusColors = {
    mock: 'bg-[var(--semantic-warning-subtle)] text-[var(--semantic-warning)]',
    partial: 'bg-[var(--semantic-info-subtle)] text-[var(--semantic-info)]',
    real: 'bg-[var(--semantic-success-subtle)] text-[var(--semantic-success)]',
  };

  const effortColors = {
    low: 'text-[var(--semantic-success)]',
    medium: 'text-[var(--semantic-warning)]',
    high: 'text-[var(--semantic-error)]',
  };

  return (
    <div className="border border-[var(--border-default)] rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--bg-muted)] transition text-left"
      >
        <div className="flex items-center gap-3">
          <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusColors[source.status]}`}>
            {source.status}
          </span>
          <span className="font-medium text-[var(--text-primary)]">
            {name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs ${effortColors[source.effort]}`}>
            {source.effort} effort
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-[var(--text-tertiary)]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 py-3 bg-[var(--bg-muted)] border-t border-[var(--border-default)] text-sm">
          <div className="mb-2">
            <span className="text-[var(--text-tertiary)]">Real provider:</span>{' '}
            <span className="text-[var(--text-secondary)]">{source.realProvider}</span>
          </div>

          <div className="mb-2">
            <span className="text-[var(--text-tertiary)]">Requirements:</span>
            <ul className="mt-1 space-y-1 list-disc list-inside text-[var(--text-secondary)] text-xs">
              {source.requirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>

          <div>
            <span className="text-[var(--text-tertiary)]">Files to modify:</span>
            <ul className="mt-1 space-y-0.5 text-xs font-mono text-[var(--text-secondary)]">
              {source.files.map((file, i) => (
                <li key={i}>{file}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default MockBadge;
