'use client';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'heading' | 'card' | 'avatar' | 'custom';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  count = 1,
}: SkeletonProps) {
  const variantClasses = {
    text: 'skeleton skeleton-text',
    heading: 'skeleton skeleton-heading',
    card: 'skeleton skeleton-card',
    avatar: 'skeleton skeleton-avatar',
    custom: 'skeleton',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`${variantClasses[variant]} ${className}`}
            style={{
              ...style,
              width: variant === 'text' && i === count - 1 ? '75%' : style.width,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

// Pre-built skeleton layouts
export function SkeletonCard() {
  return (
    <div
      className="rounded-xl p-5 space-y-4"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
      }}
    >
      <div className="flex items-start gap-4">
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="heading" />
          <Skeleton variant="text" count={2} />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton variant="custom" width={80} height={32} />
        <Skeleton variant="custom" width={80} height={32} />
      </div>
    </div>
  );
}

export function SkeletonBrief() {
  return (
    <div
      className="rounded-2xl p-8 space-y-6"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
      }}
    >
      <Skeleton variant="heading" width="40%" />
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Skeleton variant="text" count={3} />
          <div className="flex items-center gap-3 pt-2">
            <Skeleton variant="custom" width={40} height={40} className="rounded-lg" />
            <div className="space-y-2 flex-1">
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton variant="text" count={4} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div
      className="rounded-2xl p-8 space-y-4"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
      }}
    >
      <Skeleton variant="custom" width={100} height={24} className="rounded-full" />
      <Skeleton variant="heading" width="70%" height={32} />
      <Skeleton variant="text" width="50%" />
      <div className="flex gap-3 pt-4">
        <Skeleton variant="custom" width={120} height={44} className="rounded-xl" />
        <Skeleton variant="custom" width={120} height={44} className="rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonTimeline() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton variant="custom" width={56} height={16} />
          <Skeleton variant="custom" height={40} className="flex-1 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTaskList() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
