'use client';

import { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  delay: number;
  size: number;
}

interface ConfettiProps {
  active: boolean;
  onComplete?: () => void;
  particleCount?: number;
  colors?: string[];
  duration?: number;
}

const DEFAULT_COLORS = [
  'var(--brand-primary)',
  'var(--semantic-success)',
  'var(--semantic-warning)',
  '#E879F9', // pink
  '#60A5FA', // blue
  '#34D399', // green
];

export function Confetti({
  active,
  onComplete,
  particleCount = 30,
  colors = DEFAULT_COLORS,
  duration = 1000,
}: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }

    // Generate confetti pieces
    const newPieces: ConfettiPiece[] = [];
    for (let i = 0; i < particleCount; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.3,
        size: 6 + Math.random() * 8,
      });
    }
    setPieces(newPieces);

    // Clear after duration
    const timer = setTimeout(() => {
      setPieces([]);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [active, particleCount, colors, duration, onComplete]);

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            backgroundColor: piece.color,
            width: piece.size,
            height: piece.size,
            animationDelay: `${piece.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// Celebration component for completing all tasks
export function Celebration({
  show,
  message = "You're all caught up!",
  onDismiss,
}: {
  show: boolean;
  message?: string;
  onDismiss?: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
    }
  }, [show]);

  if (!visible) return null;

  return (
    <>
      <Confetti active={show} />
      <div
        className="fixed inset-0 flex items-center justify-center z-40 animate-fade-in"
        style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
        onClick={() => {
          setVisible(false);
          onDismiss?.();
        }}
      >
        <div
          className="rounded-2xl p-8 text-center animate-slide-up max-w-sm mx-4"
          style={{
            backgroundColor: 'var(--bg-surface)',
            boxShadow: 'var(--shadow-lg)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2
            className="text-2xl font-bold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            {message}
          </h2>
          <p className="mb-6" style={{ color: 'var(--text-tertiary)' }}>
            Take a moment to celebrate your productivity.
          </p>
          <button
            onClick={() => {
              setVisible(false);
              onDismiss?.();
            }}
            className="px-6 py-3 rounded-xl font-medium btn-press"
            style={{
              backgroundColor: 'var(--brand-primary)',
              color: 'var(--text-on-accent)',
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </>
  );
}

// Mini celebration for individual task completion
export function TaskCompletionBurst({ x, y }: { x: number; y: number }) {
  const [particles, setParticles] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const newParticles: ConfettiPiece[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      newParticles.push({
        id: i,
        x: x + Math.cos(angle) * 20,
        y: y + Math.sin(angle) * 20,
        color: DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
        delay: 0,
        size: 6,
      });
    }
    setParticles(newParticles);

    const timer = setTimeout(() => setParticles([]), 600);
    return () => clearTimeout(timer);
  }, [x, y]);

  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti"
          style={{
            left: p.x,
            top: p.y,
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
            position: 'fixed',
          }}
        />
      ))}
    </>
  );
}
