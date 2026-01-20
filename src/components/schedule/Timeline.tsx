'use client';

import type { Meeting } from '@/lib/temporal-buckets';

interface TimelineProps {
  meetings: Meeting[];
}

interface GapInfo {
  duration: number;
  suggestion: string;
}

function calculateGap(end: string, nextStart: string): GapInfo | null {
  const [endH, endM] = end.split(':').map(Number);
  const [startH, startM] = nextStart.split(':').map(Number);
  const endMinutes = endH * 60 + endM;
  const startMinutes = startH * 60 + startM;
  const gap = startMinutes - endMinutes;

  if (gap < 15) return null;

  let suggestion = '';
  if (gap >= 90) {
    suggestion = 'Deep work window';
  } else if (gap >= 60) {
    suggestion = 'Good for focused task';
  } else if (gap >= 30) {
    suggestion = 'Quick task or break';
  } else {
    suggestion = 'Buffer time';
  }

  return { duration: gap, suggestion };
}

function calculateDuration(start: string, end: string): number {
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  return (endH * 60 + endM) - (startH * 60 + startM);
}

export function Timeline({ meetings }: TimelineProps) {
  if (meetings.length === 0) {
    return (
      <div className="text-sm py-4" style={{ color: 'var(--text-tertiary)' }}>
        No meetings scheduled — wide open for focused work.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {meetings.map((meeting, i) => {
        const duration = calculateDuration(meeting.start, meeting.end);
        const nextMeeting = meetings[i + 1];
        const gap = nextMeeting ? calculateGap(meeting.end, nextMeeting.start) : null;

        return (
          <div key={meeting.id}>
            {/* Meeting row */}
            <div className="flex items-center gap-4 py-2 group">
              {/* Time */}
              <div
                className="w-14 text-right text-sm font-mono shrink-0"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {meeting.start}
              </div>

              {/* Bar */}
              <div className="flex-1">
                <div
                  className="h-10 rounded-lg transition-colors flex items-center px-4 gap-3"
                  style={{ backgroundColor: 'var(--bg-muted)' }}
                >
                  <span
                    className="text-sm font-medium flex-1 truncate"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {meeting.title}
                  </span>
                  <span className="text-xs shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                    {duration}m
                  </span>
                  {meeting.attendees && meeting.attendees.length > 0 && (
                    <span
                      className="text-xs hidden sm:block shrink-0"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {meeting.attendees.slice(0, 2).join(', ')}
                      {meeting.attendees.length > 2 && ` +${meeting.attendees.length - 2}`}
                    </span>
                  )}
                  {meeting.meetLink && (
                    <a
                      href={meeting.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 text-xs font-medium rounded transition shrink-0"
                      style={{
                        color: 'var(--brand-primary)',
                        backgroundColor: 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-accent-subtle)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Join
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Gap between meetings */}
            {gap && (
              <div className="flex items-center gap-4 py-1">
                <div
                  className="w-14 text-right text-xs font-mono shrink-0"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {meeting.end}
                </div>
                <div className="flex-1 flex items-center gap-2 px-4">
                  <div className="h-px flex-1" style={{ backgroundColor: 'var(--border-subtle)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {gap.duration}m · {gap.suggestion}
                  </span>
                  <div className="h-px flex-1" style={{ backgroundColor: 'var(--border-subtle)' }} />
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* End time */}
      <div className="flex items-center gap-4 py-2 opacity-60">
        <div
          className="w-14 text-right text-sm font-mono shrink-0"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {meetings[meetings.length - 1].end}
        </div>
        <div className="text-xs px-4" style={{ color: 'var(--text-tertiary)' }}>
          Free for the rest of the day
        </div>
      </div>
    </div>
  );
}
