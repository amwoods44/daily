'use client';

import type { AIBriefing } from '@/lib/ai-briefing';

interface AIBriefingCardProps {
  briefing: AIBriefing;
}

export function AIBriefingCard({ briefing }: AIBriefingCardProps) {
  const { verdict, firstMove, waitingOnYou, watchOut, freeTime } = briefing;

  return (
    <div className="bg-[var(--bg-surface)] rounded-2xl p-6 border border-[var(--border-default)]">
      {/* Verdict Line */}
      <div className="mb-6">
        <p className="text-[var(--text-secondary)] text-lg">
          <strong className="text-[var(--text-primary)]">{verdict.rating}</strong>
          {verdict.summary && ` — ${verdict.summary}`}
        </p>
      </div>

      {/* First Move */}
      {firstMove && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-tertiary)] mb-2">
            Your First Move
          </h3>
          <p className="text-[var(--text-primary)]">
            <strong>{firstMove.item}</strong>
            <span className="text-[var(--text-tertiary)]"> — {firstMove.context}</span>
          </p>
          <p className="text-[var(--text-secondary)] mt-1 flex items-start gap-2">
            <span className="text-[var(--text-tertiary)]">→</span>
            <span>{firstMove.action}</span>
          </p>
        </div>
      )}

      {/* Waiting On You */}
      {waitingOnYou.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-tertiary)] mb-2">
            Waiting On You
          </h3>
          <div className="space-y-3">
            {waitingOnYou.map((item, i) => (
              <div key={i}>
                <p className="text-[var(--text-primary)]">
                  <strong>{item.person}</strong>
                  <span className="text-[var(--text-tertiary)]"> — {item.context}</span>
                  {item.subtext && (
                    <span className="text-[var(--text-tertiary)] text-sm"> ({item.subtext})</span>
                  )}
                </p>
                <p className="text-[var(--text-secondary)] mt-1 flex items-start gap-2">
                  <span className="text-[var(--text-tertiary)]">→</span>
                  <span>{item.action}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Watch Out */}
      {watchOut.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--semantic-warning)] mb-2">
            ⚠ Watch Out
          </h3>
          <div className="space-y-2">
            {watchOut.map((item, i) => (
              <p key={i} className="text-[var(--text-secondary)]">
                {item.warning}
                {item.action && (
                  <span className="text-[var(--text-tertiary)]"> → {item.action}</span>
                )}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Free Time */}
      {freeTime && (
        <div className="pt-4 border-t border-[var(--border-default)]">
          <p className="text-[var(--text-secondary)]">
            <strong className="text-[var(--semantic-info)]">{freeTime.duration} min free</strong>
            <span className="text-[var(--text-tertiary)]"> ({freeTime.startTime}–{freeTime.endTime})</span>
            <span className="text-[var(--text-tertiary)]"> — {freeTime.suggestion}</span>
          </p>
        </div>
      )}
    </div>
  );
}
