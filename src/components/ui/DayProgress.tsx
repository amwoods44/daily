'use client';

interface DayProgressProps {
  completed: number;
  total: number;
  variant?: 'bar' | 'ring';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function DayProgress({
  completed,
  total,
  variant = 'ring',
  size = 'md',
  showLabel = true,
}: DayProgressProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (variant === 'bar') {
    return (
      <div className="space-y-2">
        {showLabel && (
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: 'var(--text-muted)' }}>Today's Progress</span>
            <span style={{ color: 'var(--text-secondary)' }} className="font-medium">
              {completed}/{total}
            </span>
          </div>
        )}
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }

  // Ring variant
  const sizes = {
    sm: { size: 40, stroke: 3, fontSize: 'text-xs' },
    md: { size: 56, stroke: 4, fontSize: 'text-sm' },
    lg: { size: 72, stroke: 5, fontSize: 'text-base' },
  };

  const { size: ringSize, stroke, fontSize } = sizes[size];
  const radius = (ringSize - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        className="progress-ring"
        width={ringSize}
        height={ringSize}
      >
        {/* Background circle */}
        <circle
          className="progress-ring-bg"
          strokeWidth={stroke}
          fill="transparent"
          r={radius}
          cx={ringSize / 2}
          cy={ringSize / 2}
        />
        {/* Progress circle */}
        <circle
          className="progress-ring-circle"
          strokeWidth={stroke}
          fill="transparent"
          r={radius}
          cx={ringSize / 2}
          cy={ringSize / 2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {showLabel && (
        <span
          className={`absolute ${fontSize} font-semibold`}
          style={{ color: 'var(--text-primary)' }}
        >
          {percentage}%
        </span>
      )}
    </div>
  );
}

// Compact version for header
export function DayProgressCompact({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = completed === total && total > 0;

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
      style={{
        backgroundColor: isComplete ? 'var(--success-subtle)' : 'var(--bg-tertiary)',
        color: isComplete ? 'var(--success)' : 'var(--text-secondary)',
      }}
    >
      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: isComplete ? 'var(--success)' : 'var(--accent)',
          }}
        />
      </div>
      <span>{completed}/{total}</span>
    </div>
  );
}
