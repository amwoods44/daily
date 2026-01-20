'use client';

import { useState, useEffect, useRef } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
} from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type EventType = 'meeting' | 'focus' | 'break' | 'task' | 'travel';

export interface TimelineEvent {
  id: string;
  title: string;
  startTime: string; // HH:MM format
  endTime: string;
  type: EventType;
  subtitle?: string;
  location?: string;
  attendees?: string[];
  meetLink?: string;
  description?: string;
}

interface VisualTimelineBarProps {
  events: TimelineEvent[];
  dayStart?: string; // HH:MM, defaults to "08:00"
  dayEnd?: string; // HH:MM, defaults to "22:00"
  onEventClick?: (eventId: string) => void;
  onEventUpdate?: (eventId: string, updates: Partial<TimelineEvent>) => void;
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

// Draggable Event Component
function DraggableEvent({
  event,
  left,
  width,
  isHovered,
  isDragging,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: {
  event: TimelineEvent;
  left: number;
  width: number;
  isHovered: boolean;
  isDragging: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useSortable({
    id: event.id,
  });

  const colors = EVENT_COLORS[event.type];

  const style = {
    position: 'absolute' as const,
    left: `${left}%`,
    width: `${width}%`,
    top: 6,
    bottom: 6,
    minHeight: 32,
    backgroundColor: colors.bg,
    borderLeft: `4px solid ${colors.border}`,
    borderRadius: 'var(--radius-sm)',
    cursor: isDragging ? 'grabbing' : 'grab',
    transition: isDragging ? 'none' : 'all 0.2s ease',
    transform: transform
      ? `translate3d(${transform.x}px, 0, 0)`
      : isHovered
        ? 'scale(1.02)'
        : 'scale(1)',
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : isHovered ? 10 : 1,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    paddingLeft: 10,
    paddingRight: 6,
    overflow: 'hidden',
    boxShadow: isDragging ? 'var(--shadow-glow-brand)' : 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={(e) => {
        if (!isDragging) {
          e.stopPropagation();
          onClick();
        }
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

      {/* Hover tooltip - hide during drag */}
      {isHovered && !isDragging && (
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
}

export function VisualTimelineBar({
  events,
  dayStart = '08:00',
  dayEnd = '22:00',
  onEventClick,
  onEventUpdate,
}: VisualTimelineBarProps) {
  const [currentTime, setCurrentTime] = useState(getCurrentTimeString());
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before dragging starts (allows clicks)
      },
    })
  );

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

  // Drag handlers
  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, delta } = event;

    if (!onEventUpdate || !timelineRef.current) {
      setActiveId(null);
      return;
    }

    // Calculate timeline track width
    const trackWidth = timelineRef.current.offsetWidth;
    const pixelsPerMinute = trackWidth / totalMinutes;

    // Calculate minutes moved (snap to 15-minute increments)
    const minutesMoved = Math.round((delta.x / pixelsPerMinute) / 15) * 15;

    if (minutesMoved === 0) {
      setActiveId(null);
      return; // No movement
    }

    // Find the event being dragged
    const draggedEvent = events.find((e) => e.id === active.id);
    if (!draggedEvent) {
      setActiveId(null);
      return;
    }

    // Calculate new times
    const oldStartMinutes = timeToMinutes(draggedEvent.startTime);
    const oldEndMinutes = timeToMinutes(draggedEvent.endTime);
    const newStartMinutes = oldStartMinutes + minutesMoved;
    const newEndMinutes = oldEndMinutes + minutesMoved;

    // Bounds check - don't allow dragging outside day range
    if (newStartMinutes < dayStartMinutes || newEndMinutes > dayEndMinutes) {
      setActiveId(null);
      return;
    }

    // Update event
    onEventUpdate(active.id as string, {
      startTime: minutesToTime(newStartMinutes),
      endTime: minutesToTime(newEndMinutes),
    });

    setActiveId(null);
  }

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
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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

        {/* Events - now draggable */}
        {events.map((event) => {
          const left = getPosition(event.startTime);
          const width = getWidth(event.startTime, event.endTime);
          const isHovered = hoveredEvent === event.id;
          const isDragging = activeId === event.id;

          return (
            <DraggableEvent
              key={event.id}
              event={event}
              left={left}
              width={width}
              isHovered={isHovered}
              isDragging={isDragging}
              onMouseEnter={() => setHoveredEvent(event.id)}
              onMouseLeave={() => setHoveredEvent(null)}
              onClick={() => onEventClick?.(event.id)}
            />
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
    </DndContext>
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
      attendees: ['Sarah Chen', 'Mike Rodriguez', 'Alex Kim'],
      meetLink: 'https://zoom.us/j/example',
      description: 'Daily sync on sprint progress and blockers',
    },
    {
      id: 'focus1',
      title: 'Deep Work',
      startTime: '09:45',
      endTime: '11:30',
      type: 'focus',
      subtitle: 'Q4 Planning Doc',
      description: 'Draft quarterly objectives and key results',
    },
    {
      id: 'travel1',
      title: 'Commute',
      startTime: '11:30',
      endTime: '12:00',
      type: 'travel',
      subtitle: '25 min drive',
      location: 'Downtown Office, 123 Main St, Austin, TX',
      description: 'Drive to downtown office for afternoon meetings',
    },
    {
      id: 'lunch',
      title: 'Lunch',
      startTime: '12:00',
      endTime: '13:00',
      type: 'break',
      location: 'Riverside Cafe, 456 River Rd, Austin, TX',
      description: 'Lunch with the team at Riverside Cafe',
    },
    {
      id: 'meeting1',
      title: '1:1 with Sarah',
      startTime: '14:00',
      endTime: '14:30',
      type: 'meeting',
      subtitle: 'Career chat',
      attendees: ['Sarah Chen'],
      location: 'Conference Room B, Downtown Office',
      description: 'Quarterly career development discussion',
    },
    {
      id: 'task1',
      title: 'Review PRs',
      startTime: '15:00',
      endTime: '16:00',
      type: 'task',
      subtitle: '3 pending',
      description: 'Review pull requests from team members',
    },
    {
      id: 'focus2',
      title: 'Feature Work',
      startTime: '16:00',
      endTime: '18:00',
      type: 'focus',
      subtitle: 'Auth flow',
      description: 'Implement OAuth 2.0 authentication for new API',
    },
  ];
}
