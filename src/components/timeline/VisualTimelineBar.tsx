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
    bg: 'rgba(194, 65, 12, 0.1)',
    border: 'var(--accent)',
    text: '#FFFFFF',
  },
  focus: {
    bg: 'rgba(34, 197, 94, 0.1)',
    border: 'var(--success)',
    text: '#FFFFFF',
  },
  break: {
    bg: 'rgba(120, 113, 108, 0.1)',
    border: 'var(--text-muted)',
    text: 'var(--text-secondary)',
  },
  task: {
    bg: 'rgba(59, 130, 246, 0.1)',
    border: 'rgb(59, 130, 246)',
    text: '#FFFFFF',
  },
  travel: {
    bg: 'rgba(168, 85, 247, 0.1)',
    border: 'rgb(168, 85, 247)',
    text: '#FFFFFF',
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
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-muted)',
          }}
        >
          Your Day
        </span>
        <span
          style={{
            fontSize: 12,
            color: 'var(--text-secondary)',
          }}
        >
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
          backgroundColor: 'var(--bg-secondary)',
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
                backgroundColor: 'var(--border)',
              }}
            />
            {/* Label - show only even hours */}
            {i % 2 === 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -18,
                  fontSize: 10,
                  color: 'var(--text-muted)',
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
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
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
                  style={{
                    fontSize: 10,
                    color: 'var(--text-muted)',
                    marginTop: 2,
                  }}
                >
                  {minutesToTime(timeToMinutes(event.startTime))}
                </span>
              )}

              {/* Hover tooltip */}
              {isHovered && (
                <div
                  className="timeline-tooltip"
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginBottom: 8,
                    padding: '8px 12px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    whiteSpace: 'nowrap',
                    zIndex: 100,
                    animation: 'fadeIn 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginBottom: 2,
                    }}
                  >
                    {event.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
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
              backgroundColor: 'var(--error)',
              borderRadius: 1,
              zIndex: 20,
              boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)',
            }}
          >
            {/* Current time label */}
            <div
              style={{
                position: 'absolute',
                top: -20,
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'var(--error)',
                color: 'white',
                fontSize: 10,
                fontWeight: 600,
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
                backgroundColor: 'var(--error)',
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
          gap: 16,
          marginTop: 12,
          flexWrap: 'wrap',
        }}
      >
        {Object.entries(EVENT_COLORS).map(([type, colors]) => (
          <div
            key={type}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                backgroundColor: colors.bg,
                borderLeft: `2px solid ${colors.border}`,
              }}
            />
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                textTransform: 'capitalize',
              }}
            >
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
