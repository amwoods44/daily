'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Clock,
  MapPin,
  Users,
  Video,
  ExternalLink,
  Edit2,
  Trash2,
  Navigation,
  Car,
  Map,
  ChevronDown,
} from 'lucide-react';

interface TimelineEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  type: 'meeting' | 'focus' | 'break' | 'task' | 'travel';
  subtitle?: string;
  location?: string;
  attendees?: string[];
  meetLink?: string;
  description?: string;
}

interface DirectionsData {
  distance: string;
  duration: string;
  durationInTraffic: string;
  polyline: string;
  start: string;
  end: string;
}

interface EventDetailModalProps {
  event: TimelineEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (eventId: string, updates: Partial<TimelineEvent>) => void;
  onDelete: (eventId: string) => void;
}

function calculateDuration(startTime: string, endTime: string): string {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}min`;
}

function openGoogleMaps(address: string) {
  const encoded = encodeURIComponent(address);
  const url = `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
  window.open(url, '_blank');
}

export function EventDetailModal({
  event,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: EventDetailModalProps) {
  const [directions, setDirections] = useState<DirectionsData | null>(null);
  const [loadingDirections, setLoadingDirections] = useState(false);
  const [showMapPreview, setShowMapPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch directions if event has location
  useEffect(() => {
    if (!event?.location) {
      setDirections(null);
      return;
    }

    setLoadingDirections(true);

    // TODO: Get user's current location or home address
    const origin = 'Current Location'; // Placeholder

    fetch('/api/maps/directions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin,
        destination: event.location,
        departureTime: new Date().toISOString(),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setDirections(data);
        setLoadingDirections(false);
      })
      .catch(() => {
        setLoadingDirections(false);
      });
  }, [event?.location]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleDelete = () => {
    if (!event) return;
    if (!confirm(`Delete "${event.title}"?`)) return;
    onDelete(event.id);
  };

  if (!event) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              padding: 'var(--space-6)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              className="card-hero w-full"
              style={{
                maxWidth: '800px',
                maxHeight: '90vh',
                overflow: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Header */}
              <div
                className="flex items-start justify-between"
                style={{ marginBottom: 'var(--space-8)' }}
              >
                <div style={{ flex: 1 }}>
                  <span
                    className="text-label-sm"
                    style={{
                      color: 'var(--brand-primary)',
                      display: 'block',
                      marginBottom: 'var(--space-2)',
                    }}
                  >
                    {event.type.toUpperCase()}
                  </span>
                  <h2
                    className="text-display-sm text-balance"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {event.title}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="btn-icon btn-ghost"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Time Section */}
              <div className="card-flat" style={{ marginBottom: 'var(--space-6)' }}>
                <div
                  className="flex items-center"
                  style={{
                    gap: 'var(--space-3)',
                    marginBottom: 'var(--space-2)',
                  }}
                >
                  <Clock className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
                  <div>
                    <div
                      className="text-mono-lg"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {event.startTime} – {event.endTime}
                    </div>
                    <div
                      className="text-mono-sm"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {calculateDuration(event.startTime, event.endTime)} duration
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Section */}
              {event.location && (
                <div
                  className="card-flat"
                  style={{ marginBottom: 'var(--space-6)' }}
                >
                  <div
                    className="flex items-start"
                    style={{
                      gap: 'var(--space-3)',
                      marginBottom: 'var(--space-4)',
                    }}
                  >
                    <MapPin
                      className="w-5 h-5"
                      style={{ color: 'var(--brand-primary)', marginTop: '2px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        className="text-body"
                        style={{
                          fontWeight: 'var(--weight-medium)',
                          color: 'var(--text-primary)',
                          marginBottom: 'var(--space-1)',
                        }}
                      >
                        {event.location}
                      </div>

                      {/* Directions data */}
                      {loadingDirections && (
                        <div
                          className="text-body-sm"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          Loading traffic data...
                        </div>
                      )}

                      {directions && !loadingDirections && (
                        <div className="stack-sm">
                          <div
                            className="flex items-center"
                            style={{ gap: 'var(--space-4)' }}
                          >
                            <div>
                              <div
                                className="text-mono"
                                style={{
                                  fontWeight: 'var(--weight-semibold)',
                                  color: 'var(--text-secondary)',
                                }}
                              >
                                {directions.distance}
                              </div>
                              <div
                                className="text-label-sm"
                                style={{ color: 'var(--text-quaternary)' }}
                              >
                                Distance
                              </div>
                            </div>
                            <div>
                              <div
                                className="text-mono"
                                style={{
                                  fontWeight: 'var(--weight-semibold)',
                                  color: 'var(--text-secondary)',
                                }}
                              >
                                {directions.durationInTraffic}
                              </div>
                              <div
                                className="text-label-sm"
                                style={{ color: 'var(--text-quaternary)' }}
                              >
                                With Traffic
                              </div>
                            </div>
                          </div>

                          {/* When to leave calculation */}
                          {(() => {
                            const now = new Date();
                            const [hours, minutes] = event.startTime.split(':').map(Number);
                            const eventTime = new Date(now);
                            eventTime.setHours(hours, minutes, 0, 0);

                            const minutesUntil = Math.floor((eventTime.getTime() - now.getTime()) / 60000);
                            const travelMinutes = parseInt(directions.durationInTraffic);

                            if (minutesUntil > 0 && minutesUntil < 180) {
                              const leaveInMinutes = minutesUntil - travelMinutes - 5; // 5 min buffer

                              if (leaveInMinutes <= 15 && leaveInMinutes > 0) {
                                return (
                                  <div
                                    style={{
                                      padding: 'var(--space-3) var(--space-4)',
                                      borderRadius: 'var(--radius-lg)',
                                      backgroundColor: 'var(--semantic-warning-subtle)',
                                      border: '1px solid var(--semantic-warning)',
                                    }}
                                  >
                                    <div
                                      className="flex items-center"
                                      style={{ gap: 'var(--space-2)' }}
                                    >
                                      <Car
                                        className="w-4 h-4"
                                        style={{ color: 'var(--semantic-warning)' }}
                                      />
                                      <span
                                        className="text-body"
                                        style={{
                                          fontWeight: 'var(--weight-semibold)',
                                          color: 'var(--semantic-warning)',
                                        }}
                                      >
                                        Leave in {leaveInMinutes} minutes
                                      </span>
                                    </div>
                                  </div>
                                );
                              }
                            }
                            return null;
                          })()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons for location */}
                  <div className="flex" style={{ gap: 'var(--space-3)' }}>
                    <button
                      onClick={() => openGoogleMaps(event.location!)}
                      className="btn btn-secondary flex items-center"
                      style={{ gap: 'var(--space-2)' }}
                    >
                      <Navigation className="w-4 h-4" />
                      Open in Maps
                    </button>

                    <button
                      onClick={() => setShowMapPreview(!showMapPreview)}
                      className="btn btn-ghost flex items-center"
                      style={{ gap: 'var(--space-2)' }}
                    >
                      <Map className="w-4 h-4" />
                      {showMapPreview ? 'Hide' : 'Show'} Preview
                      <ChevronDown
                        className="w-3 h-3"
                        style={{
                          transform: showMapPreview ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform var(--duration-base) var(--ease-out-quart)',
                        }}
                      />
                    </button>
                  </div>

                  {/* Map preview (placeholder for now) */}
                  {showMapPreview && (
                    <div
                      className="animate-fade-in"
                      style={{ marginTop: 'var(--space-4)' }}
                    >
                      <div
                        className="card-flat"
                        style={{
                          height: '240px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <div className="text-center">
                          <Map
                            className="w-12 h-12"
                            style={{
                              color: 'var(--text-quaternary)',
                              margin: '0 auto var(--space-3)',
                            }}
                          />
                          <p
                            className="text-body-sm"
                            style={{ color: 'var(--text-tertiary)' }}
                          >
                            Map preview will load here
                          </p>
                          <p
                            className="text-mono-sm"
                            style={{
                              color: 'var(--text-quaternary)',
                              marginTop: 'var(--space-1)',
                            }}
                          >
                            (Requires GOOGLE_MAPS_API_KEY)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Meet Link */}
              {event.meetLink && (
                <div
                  className="card-flat"
                  style={{ marginBottom: 'var(--space-6)' }}
                >
                  <div
                    className="flex items-center justify-between"
                    style={{ gap: 'var(--space-3)' }}
                  >
                    <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
                      <Video className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
                      <span
                        className="text-body"
                        style={{
                          color: 'var(--text-secondary)',
                        }}
                      >
                        Video call link available
                      </span>
                    </div>
                    <a
                      href={event.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm flex items-center"
                      style={{ gap: 'var(--space-2)' }}
                    >
                      Join Call
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Attendees */}
              {event.attendees && event.attendees.length > 0 && (
                <div
                  className="card-flat"
                  style={{ marginBottom: 'var(--space-6)' }}
                >
                  <div
                    className="flex items-start"
                    style={{ gap: 'var(--space-3)' }}
                  >
                    <Users className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
                    <div style={{ flex: 1 }}>
                      <div
                        className="text-label-md"
                        style={{
                          color: 'var(--text-tertiary)',
                          marginBottom: 'var(--space-3)',
                        }}
                      >
                        Attendees ({event.attendees.length})
                      </div>
                      <div className="stack-sm">
                        {event.attendees.map((attendee, i) => (
                          <div
                            key={i}
                            className="flex items-center"
                            style={{ gap: 'var(--space-3)' }}
                          >
                            <div
                              className="stat-icon-sm"
                              style={{
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--weight-semibold)',
                                color: 'var(--brand-primary)',
                              }}
                            >
                              {attendee.charAt(0).toUpperCase()}
                            </div>
                            <span
                              className="text-body"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {attendee}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              {event.description && (
                <div
                  className="card-flat"
                  style={{ marginBottom: 'var(--space-6)' }}
                >
                  <p
                    className="text-body"
                    style={{
                      color: 'var(--text-secondary)',
                      lineHeight: 'var(--leading-relaxed)',
                    }}
                  >
                    {event.description}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div
                className="flex flex-wrap"
                style={{
                  gap: 'var(--space-3)',
                  marginTop: 'var(--space-8)',
                  paddingTop: 'var(--space-6)',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-secondary flex items-center"
                  style={{ gap: 'var(--space-2)' }}
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Event
                </button>

                {event.location && (
                  <button
                    onClick={() => openGoogleMaps(event.location!)}
                    className="btn btn-primary flex items-center"
                    style={{ gap: 'var(--space-2)' }}
                  >
                    <Navigation className="w-4 h-4" />
                    Get Directions
                  </button>
                )}

                <button
                  onClick={handleDelete}
                  className="btn btn-danger btn-sm flex items-center"
                  style={{
                    gap: 'var(--space-2)',
                    marginLeft: 'auto',
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>

              {/* Edit Mode Notice (TODO: Full edit form) */}
              {isEditing && (
                <div
                  className="card-info animate-fade-in"
                  style={{ marginTop: 'var(--space-6)' }}
                >
                  <p
                    className="text-body-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Event editing will be available in the next phase. For now, you can delete
                    and recreate, or edit directly in Google Calendar.
                  </p>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn btn-ghost btn-sm"
                    style={{ marginTop: 'var(--space-3)' }}
                  >
                    Got it
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
