'use client';

import { useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { PRESETS, type DashboardConfig } from '@/lib/preferences/dashboard-config';

interface PresetSelectorProps {
  currentConfig: DashboardConfig;
  onApplyPreset: (presetName: string, preset: Partial<DashboardConfig>) => void;
  onExport: () => string;
  onImport: (json: string) => boolean;
}

export function PresetSelector({
  onApplyPreset,
  onExport,
  onImport,
}: PresetSelectorProps) {
  const [importError, setImportError] = useState<string | null>(null);

  const handleExport = () => {
    const json = onExport();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-pulse-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const json = event.target?.result as string;
        const success = onImport(json);

        if (success) {
          setImportError(null);
          alert('Settings imported successfully!');
        } else {
          setImportError('Invalid configuration file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const presets = [
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Focus on one thing, minimal clutter',
      details: 'Timeline + One Thing + Tasks only',
    },
    {
      id: 'full',
      name: 'Full Power User',
      description: 'All features, maximum insight',
      details: 'All sections enabled',
    },
    {
      id: 'demo',
      name: 'Demo Mode',
      description: 'Everything with mock data',
      details: 'Perfect for presentations',
    },
  ];

  return (
    <div className="stack-lg">
      {/* Preset cards */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {presets.map((preset) => (
          <div
            key={preset.id}
            className="card"
            style={{
              border: '2px solid var(--border-default)',
            }}
          >
            <div className="stack-sm">
              <div>
                <h4
                  className="text-heading-md"
                  style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}
                >
                  {preset.name}
                </h4>
                <p className="text-body-sm" style={{ color: 'var(--text-tertiary)' }}>
                  {preset.description}
                </p>
              </div>

              <div
                className="text-mono-sm"
                style={{
                  color: 'var(--text-quaternary)',
                  padding: 'var(--space-2)',
                  backgroundColor: 'var(--bg-muted)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                {preset.details}
              </div>

              <button
                onClick={() => {
                  if (confirm(`Apply "${preset.name}" preset? This will update your dashboard configuration.`)) {
                    onApplyPreset(preset.id, PRESETS[preset.id]);
                  }
                }}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%' }}
              >
                Apply Preset
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Export/Import */}
      <div className="card-accent">
        <h3
          className="text-label-md"
          style={{
            color: 'var(--brand-primary)',
            marginBottom: 'var(--space-6)',
          }}
        >
          Import / Export Settings
        </h3>

        <p
          className="text-body-sm"
          style={{
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-6)',
          }}
        >
          Save your current configuration as a JSON file, or import settings from a file.
        </p>

        {importError && (
          <div
            className="card-error"
            style={{
              marginBottom: 'var(--space-4)',
              padding: 'var(--space-3)',
            }}
          >
            <p className="text-body-sm" style={{ color: 'var(--semantic-error)' }}>
              {importError}
            </p>
          </div>
        )}

        <div className="flex" style={{ gap: 'var(--space-3)' }}>
          <button
            onClick={handleExport}
            className="btn btn-secondary flex items-center"
            style={{ gap: 'var(--space-2)', flex: 1 }}
          >
            <Download className="w-4 h-4" />
            Export Settings
          </button>

          <button
            onClick={handleImport}
            className="btn btn-secondary flex items-center"
            style={{ gap: 'var(--space-2)', flex: 1 }}
          >
            <Upload className="w-4 h-4" />
            Import Settings
          </button>
        </div>
      </div>
    </div>
  );
}
