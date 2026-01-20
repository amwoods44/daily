'use client';

import { useState, useEffect, useRef } from 'react';

type EventType = 'meeting' | 'focus' | 'break' | 'task' | 'travel';

interface TimelineEvent {
  id: string;
  title: string;
  startTime: string; // HH:MM format
  endTime: string;
  type: EventType;
  subtitle?: string;
}

interface VisualTimelineBarProps {
  events: TimelineEvent[];
  dayStart?: string; // HH:MM, defaults to "08:00"
  dayEnd?: string; // HH:MM, defaults to "22:00"
}

const EVENT_COLORS: Record<EventType, { bg: string; border: string; text: string }> = {
  meeting: {
    bg: 'rgba(184, 81, 31, 0.08)',
    border: 'var(--brand-primary)',
    text: 'var(--text-on-accent)',
  },
  focus: {
    bg: 'rgba(45, 107, 61, 0.08)',
    border: 'var(--semantic-success)',
    text: 'var(--text-on-accent)',
  },
  break: {
    bg: 'rgba(151, 142, 135, 0.08)',
    border: 'var(--text-tertiary)',
    text: 'var(--text-secondary)',
  },
  task: {
    bg: 'rgba(28, 107, 122, 0.08)',
    border: 'var(--semantic-info)',
    text: 'var(--text-on-accent)',
  },
  travel: {
    bg: 'rgba(184, 101, 31, 0.08)',
    border: 'var(--semantic-warning)',
    text: 'var(--text-on-accent)',
  },
};

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}${mins > 0 ? `:${mins.toString().padStart(2, '0')}` : ''} ${period}`;
}

function getCurrentTimeString(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

export function VisualTimelineBar({
  events,
  dayStart = '08:00',
  dayEnd = '22:00',
}: VisualTimelineBarProps) {
  const [currentTime, setCurrentTime] = useState(getCurrentTimeString());
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTimeString());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const dayStartMinutes = timeToMinutes(dayStart);
  const dayEndMinutes = timeToMinutes(dayEnd);
  const totalMinutes = dayEndMinutes - dayStartMinutes;
  const currentMinutes = timeToMinutes(currentTime);

  const getPosition = (time: string) => {
    const minutes = timeToMinutes(time);
    return ((minutes - dayStartMinutes) / totalMinutes) * 100;
  };

  const getWidth = (start: string, end: string) => {
    const startMin = timeToMinutes(start);
    const endMin = timeToMinutes(end);
    return ((endMin - startMin) / totalMinutes) * 100;
  };

  const currentPosition = getPosition(currentTime);
  const isWithinDay = currentMinutes >= dayStartMinutes && currentMinutes <= dayEndMinutes;

  // Generate hour markers
  const hourMarkers = [];
  for (let minutes = dayStartMinutes; minutes <= dayEndMinutes; minutes += 60) {
    const position = ((minutes - dayStartMinutes) / totalMinutes) * 100;
    hourMarkers.push({ minutes, position, label: minutesToTime(minutes) });
  }

  return (
    <div className="visual-timeline-container">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-4)',
        }}
      >
        <span className="text-label-md" style={{ color: 'var(--text-tertiary)' }}>
          Your Day
        </span>
        <span className="text-mono-sm" style={{ color: 'var(--text-secondary)' }}>
          {events.length} events · {Math.round((dayEndMinutes - currentMinutes) / 60)}h remaining
        </span>
      </div>

      {/* Timeline Track */}
      <div
        ref={timelineRef}
        className="timeline-track"
        style={{
          position: 'relative',
          height: 64,
          backgroundColor: 'var(--bg-muted)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'visible',
        }}
      >
        {/* Hour markers */}
        {hourMarkers.map((marker, i) => (
          <div
            key={marker.minutes}
            style={{
              position: 'absolute',
              left: `${marker.position}%`,
              top: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transform: 'translateX(-50%)',
              pointerEvents: 'none',
            }}
          >
            {/* Tick mark */}
            <div
              style={{
                width: 1,
                height: 6,
                backgroundColor: 'var(--border-default)',
              }}
            />
            {/* Label - show only even hours */}
            {i % 2 === 0 && (
              <span
                className="text-mono-sm"
                style={{
                  position: 'absolute',
                  top: -18,
                  color: 'var(--text-quaternary)',
                  whiteSpace: 'nowrap',
                }}
              >
                {marker.label}
              </span>
            )}
          </div>
        ))}

        {/* Events */}
        {events.map((event) => {
          const left = getPosition(event.startTime);
          const width = getWidth(event.startTime, event.endTime);
          const colors = EVENT_COLORS[event.type];
          const isHovered = hoveredEvent === event.id;

          return (
            <div
              key={event.id}
              onMouseEnter={() => setHoveredEvent(event.id)}
              onMouseLeave={() => setHoveredEvent(null)}
              style={{
                position: 'absolute',
                left: `${left}%`,
                width: `${width}%`,
                top: 6,
                bottom: 6,
                minHeight: 32,
                backgroundColor: colors.bg,
                borderLeft: `4px solid ${colors.border}`,
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                zIndex: isHovered ? 10 : 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                paddingLeft: 10,
                paddingRight: 6,
                overflow: 'hidden',
              }}
            >
              {/* Event title - only show if width allows */}
              {width > 8 && (
                <span
                  className="text-body-sm"
                  style={{
                    fontWeight: 'var(--weight-medium)',
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {event.title}
                </span>
              )}
              {/* Time stamp - show if width allows */}
              {width > 12 && (
                <span
                  className="text-mono-sm"
                  style={{
                    color: 'var(--text-tertiary)',
                    marginTop: 2,
                  }}
                >
                  {minutesToTime(timeToMinutes(event.startTime))}
                </span>
              )}

              {/* Hover tooltip */}
              {isHovered && (
                <div
                  className="timeline-tooltip animate-fade-in"
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginBottom: 'var(--space-2)',
                    padding: 'var(--space-3) var(--space-4)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-xl)',
                    whiteSpace: 'nowrap',
                    zIndex: 100,
                  }}
                >
                  <div
                    className="text-body"
                    style={{
                      fontWeight: 'var(--weight-semibold)',
                      color: 'var(--text-primary)',
                      marginBottom: 'var(--space-1)',
                    }}
                  >
                    {event.title}
                  </div>
                  <div className="text-mono-sm" style={{ color: 'var(--text-tertiary)' }}>
                    {minutesToTime(timeToMinutes(event.startTime))} –{' '}
                    {minutesToTime(timeToMinutes(event.endTime))}
                    {event.subtitle && ` · ${event.subtitle}`}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Current time indicator */}
        {isWithinDay && (
          <div
            className="current-time-marker"
            style={{
              position: 'absolute',
              left: `${currentPosition}%`,
              top: -4,
              bottom: -4,
              width: 2,
              backgroundColor: 'var(--semantic-error)',
              borderRadius: 1,
              zIndex: 20,
              boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)',
            }}
          >
            {/* Current time label */}
            <div
              className="text-mono-sm"
              style={{
                position: 'absolute',
                top: -20,
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'var(--semantic-error)',
                color: 'var(--text-on-accent)',
                fontWeight: 'var(--weight-semibold)',
                padding: '2px 6px',
                borderRadius: 'var(--radius-sm)',
                whiteSpace: 'nowrap',
              }}
            >
              {minutesToTime(currentMinutes)}
            </div>
            {/* Pulsing dot at top */}
            <div
              style={{
                position: 'absolute',
                top: -2,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'var(--semantic-error)',
                animation: 'pulse 2s infinite',
              }}
            />
          </div>
        )}
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-4)',
          marginTop: 'var(--space-4)',
          flexWrap: 'wrap',
        }}
      >
        {Object.entries(EVENT_COLORS).map(([type, colors]) => (
          <div
            key={type}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 'var(--radius-xs)',
                backgroundColor: colors.bg,
                borderLeft: `2px solid ${colors.border}`,
              }}
            />
            <span className="text-label-sm" style={{ color: 'var(--text-tertiary)' }}>
              {type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Default mock data for demonstration
export function getDefaultTimelineEvents(): TimelineEvent[] {
  return [
    {
      id: 'standup',
      title: 'Team Standup',
      startTime: '09:00',
      endTime: '09:30',
      type: 'meeting',
      subtitle: 'Zoom',
    },
    {
      id: 'focus1',
      title: 'Deep Work',
      startTime: '09:45',
      endTime: '11:30',
      type: 'focus',
      subtitle: 'Q4 Planning Doc',
    },
    {
      id: 'travel1',
      title: 'Commute',
      startTime: '11:30',
      endTime: '12:00',
      type: 'travel',
      subtitle: '25 min drive',
    },
    {
      id: 'lunch',
      title: 'Lunch',
      startTime: '12:00',
      endTime: '13:00',
      type: 'break',
    },
    {
      id: 'meeting1',
      title: '1:1 with Sarah',
      startTime: '14:00',
      endTime: '14:30',
      type: 'meeting',
      subtitle: 'Career chat',
    },
    {
      id: 'task1',
      title: 'Review PRs',
      startTime: '15:00',
      endTime: '16:00',
      type: 'task',
      subtitle: '3 pending',
    },
    {
      id: 'focus2',
      title: 'Feature Work',
      startTime: '16:00',
      endTime: '18:00',
      type: 'focus',
      subtitle: 'Auth flow',
    },
  ];
}
