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
    mock: 'bg-amber-100 text-amber-700 border-amber-200',
    partial: 'bg-blue-100 text-blue-700 border-blue-200',
    real: 'bg-emerald-100 text-emerald-700 border-emerald-200',
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
        <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-lg border border-stone-200 shadow-lg p-3 text-xs">
          <div className="font-medium text-stone-900 mb-2">
            {source.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </div>

          <div className="space-y-2 text-stone-600">
            <div>
              <span className="text-stone-400">Real provider:</span>
              <br />
              {sourceData.realProvider}
            </div>

            <div>
              <span className="text-stone-400">Effort:</span>{' '}
              <span className={`font-medium ${
                sourceData.effort === 'low' ? 'text-emerald-600' :
                sourceData.effort === 'medium' ? 'text-amber-600' :
                'text-red-600'
              }`}>
                {sourceData.effort}
              </span>
            </div>

            <div>
              <span className="text-stone-400">Requirements:</span>
              <ul className="mt-1 space-y-0.5 list-disc list-inside text-[11px]">
                {sourceData.requirements.slice(0, 3).map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
                {sourceData.requirements.length > 3 && (
                  <li className="text-stone-400">
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
        className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg border border-amber-300 shadow-lg transition text-sm font-medium"
      >
        <AlertCircle className="w-4 h-4" />
        {mockCount}/{totalCount} Mock
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-stone-900">
                  Data Sources Status
                </h2>
                <p className="text-sm text-stone-500">
                  {mockCount} of {totalCount} sources using mock data
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-stone-100 rounded-lg transition"
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
            <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 text-xs text-stone-500">
              Set <code className="bg-stone-200 px-1 rounded">NEXT_PUBLIC_SHOW_MOCK_INDICATORS=false</code> in .env.local to hide these indicators
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
    mock: 'bg-amber-100 text-amber-700',
    partial: 'bg-blue-100 text-blue-700',
    real: 'bg-emerald-100 text-emerald-700',
  };

  const effortColors = {
    low: 'text-emerald-600',
    medium: 'text-amber-600',
    high: 'text-red-600',
  };

  return (
    <div className="border border-stone-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-50 transition text-left"
      >
        <div className="flex items-center gap-3">
          <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusColors[source.status]}`}>
            {source.status}
          </span>
          <span className="font-medium text-stone-900">
            {name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs ${effortColors[source.effort]}`}>
            {source.effort} effort
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-stone-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-stone-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 py-3 bg-stone-50 border-t border-stone-200 text-sm">
          <div className="mb-2">
            <span className="text-stone-500">Real provider:</span>{' '}
            <span className="text-stone-700">{source.realProvider}</span>
          </div>

          <div className="mb-2">
            <span className="text-stone-500">Requirements:</span>
            <ul className="mt-1 space-y-1 list-disc list-inside text-stone-600 text-xs">
              {source.requirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>

          <div>
            <span className="text-stone-500">Files to modify:</span>
            <ul className="mt-1 space-y-0.5 text-xs font-mono text-stone-600">
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
