/**
 * Communication Tracker
 *
 * Aggregates communication from multiple sources:
 * - Gmail
 * - Calendar (meetings with specific people)
 * - Future: iMessage, Slack, WhatsApp
 *
 * Provides unified view of communication history per person.
 */

import type { CommunicationChannel } from '../types';
import type { Meeting, Email, PersonWaiting } from '../mock-data';

// ============================================================================
// TYPES
// ============================================================================

export interface CommunicationRecord {
  id: string;
  personId: string;
  personName: string;
  type: 'email' | 'meeting' | 'call' | 'text' | 'message';
  direction: 'inbound' | 'outbound' | 'bidirectional';
  timestamp: Date;
  summary: string;
  channel: CommunicationChannel;
  metadata?: {
    subject?: string;
    duration?: number; // minutes
    attendees?: string[];
    threadId?: string;
  };
}

export interface CommunicationSummary {
  personId: string;
  personName: string;
  totalInteractions: number;
  lastContact: Date;
  channelBreakdown: Record<CommunicationChannel, number>;
  averageResponseTime?: number; // hours
  recentCommunications: CommunicationRecord[];
  interactionFrequency: 'high' | 'medium' | 'low' | 'rare';
}

export interface ResponseTimeAnalysis {
  personId: string;
  personName: string;
  yourAverageResponseTime: number; // hours
  theirAverageResponseTime: number; // hours
  trend: 'faster' | 'slower' | 'consistent';
  comparison: 'you_faster' | 'they_faster' | 'similar';
}

// ============================================================================
// AGGREGATION
// ============================================================================

/**
 * Aggregate communications from multiple sources for a person
 */
export function aggregateCommunications(
  personName: string,
  emails: Email[],
  meetings: Meeting[]
): CommunicationRecord[] {
  const records: CommunicationRecord[] = [];
  const personId = personName.toLowerCase().replace(/\s+/g, '-');

  // Process emails
  emails
    .filter((email) => email.from.toLowerCase().includes(personName.toLowerCase()))
    .forEach((email) => {
      records.push({
        id: `email-${email.id}`,
        personId,
        personName,
        type: 'email',
        direction: 'inbound',
        timestamp: parseEmailDate(email.date),
        summary: email.subject,
        channel: 'email',
        metadata: {
          subject: email.subject,
          threadId: email.threadId,
        },
      });
    });

  // Process meetings
  meetings
    .filter((meeting) =>
      meeting.attendees?.some((a) =>
        a.toLowerCase().includes(personName.toLowerCase())
      )
    )
    .forEach((meeting) => {
      const [startH, startM] = meeting.start.split(':').map(Number);
      const [endH, endM] = meeting.end.split(':').map(Number);
      const duration = (endH * 60 + endM) - (startH * 60 + startM);

      records.push({
        id: `meeting-${meeting.id}`,
        personId,
        personName,
        type: 'meeting',
        direction: 'bidirectional',
        timestamp: parseMeetingTime(meeting.start),
        summary: meeting.title,
        channel: meeting.meetLink ? 'video' : 'in_person',
        metadata: {
          duration,
          attendees: meeting.attendees,
        },
      });
    });

  // Sort by timestamp descending
  records.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return records;
}

/**
 * Get communication summary for a person
 */
export function getCommunicationSummary(
  personName: string,
  emails: Email[],
  meetings: Meeting[]
): CommunicationSummary {
  const records = aggregateCommunications(personName, emails, meetings);
  const personId = personName.toLowerCase().replace(/\s+/g, '-');

  // Calculate channel breakdown
  const channelBreakdown: Record<CommunicationChannel, number> = {
    email: 0,
    call: 0,
    text: 0,
    video: 0,
    in_person: 0,
    slack: 0,
  };

  records.forEach((r) => {
    channelBreakdown[r.channel]++;
  });

  // Determine interaction frequency
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentCount = records.filter(
    (r) => r.timestamp >= thirtyDaysAgo
  ).length;

  let interactionFrequency: CommunicationSummary['interactionFrequency'];
  if (recentCount >= 10) {
    interactionFrequency = 'high';
  } else if (recentCount >= 4) {
    interactionFrequency = 'medium';
  } else if (recentCount >= 1) {
    interactionFrequency = 'low';
  } else {
    interactionFrequency = 'rare';
  }

  return {
    personId,
    personName,
    totalInteractions: records.length,
    lastContact: records.length > 0 ? records[0].timestamp : new Date(0),
    channelBreakdown,
    recentCommunications: records.slice(0, 10),
    interactionFrequency,
  };
}

// ============================================================================
// RESPONSE TIME ANALYSIS
// ============================================================================

/**
 * Analyze response time patterns with a person
 */
export function analyzeResponseTimes(
  personName: string,
  _emails: Email[]
): ResponseTimeAnalysis | null {
  const personId = personName.toLowerCase().replace(/\s+/g, '-');

  // In production, this would analyze email thread timestamps
  // For now, return mock analysis
  return {
    personId,
    personName,
    yourAverageResponseTime: 4.5,
    theirAverageResponseTime: 2.1,
    trend: 'consistent',
    comparison: 'they_faster',
  };
}

// ============================================================================
// PEOPLE WAITING DETECTION
// ============================================================================

/**
 * Detect people waiting on your response
 * This would integrate with Gmail API in production
 */
export function detectPeopleWaiting(
  emails: Email[],
  _existingPeople?: string[]
): PersonWaiting[] {
  const waiting: PersonWaiting[] = [];
  const now = new Date();

  // In production, this would analyze email threads to find:
  // 1. Last message in thread is FROM them (not you)
  // 2. Thread has no response from you
  // 3. Calculate days waiting

  // For demo, use important emails as proxy
  emails
    .filter((e) => e.important)
    .forEach((email, index) => {
      const daysWaiting = index * 0.5 + 0.5; // Mock increasing wait times

      waiting.push({
        id: `pw-${email.id}`,
        name: email.from,
        context: email.subject,
        waitingSince: new Date(now.getTime() - daysWaiting * 24 * 60 * 60 * 1000).toISOString(),
        daysWaiting,
        channel: 'email',
        relationshipNote: daysWaiting > 2 ? 'Waiting over 2 days' : undefined,
      });
    });

  return waiting;
}

// ============================================================================
// COMMUNICATION PATTERNS
// ============================================================================

/**
 * Detect communication patterns with a person
 */
export function detectCommunicationPatterns(
  personName: string,
  records: CommunicationRecord[]
): {
  preferredChannel: CommunicationChannel;
  typicalFrequency: string;
  bestTimeToReach: string;
  patterns: string[];
} {
  // Count channels
  const channelCounts: Record<string, number> = {};
  records.forEach((r) => {
    channelCounts[r.channel] = (channelCounts[r.channel] || 0) + 1;
  });

  // Find preferred channel
  const sortedChannels = Object.entries(channelCounts).sort(([, a], [, b]) => b - a);
  const preferredChannel = (sortedChannels[0]?.[0] || 'email') as CommunicationChannel;

  // Calculate frequency
  const daysSpan = records.length > 1
    ? (records[0].timestamp.getTime() - records[records.length - 1].timestamp.getTime()) / (1000 * 60 * 60 * 24)
    : 30;
  const interactionsPerMonth = (records.length / daysSpan) * 30;

  let typicalFrequency: string;
  if (interactionsPerMonth >= 20) {
    typicalFrequency = 'daily';
  } else if (interactionsPerMonth >= 8) {
    typicalFrequency = 'several times a week';
  } else if (interactionsPerMonth >= 4) {
    typicalFrequency = 'weekly';
  } else if (interactionsPerMonth >= 1) {
    typicalFrequency = 'monthly';
  } else {
    typicalFrequency = 'rarely';
  }

  // Analyze timing (in production, would look at actual timestamps)
  const patterns: string[] = [];

  if (records.length >= 5) {
    patterns.push(`Typically communicates via ${preferredChannel}`);
    patterns.push(`Interaction frequency: ${typicalFrequency}`);
  }

  return {
    preferredChannel,
    typicalFrequency,
    bestTimeToReach: 'mornings', // Would calculate from actual data
    patterns,
  };
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Parse email date string to Date object
 */
function parseEmailDate(dateStr: string): Date {
  // Handle relative dates
  const now = new Date();

  if (dateStr === 'Yesterday') {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  }

  // Handle time strings like "8:41 AM"
  const timeMatch = dateStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (timeMatch) {
    const hours = parseInt(timeMatch[1]) + (timeMatch[3].toUpperCase() === 'PM' ? 12 : 0);
    const minutes = parseInt(timeMatch[2]);
    const today = new Date();
    today.setHours(hours, minutes, 0, 0);
    return today;
  }

  // Default: try to parse as date
  return new Date(dateStr);
}

/**
 * Parse meeting time to today's date
 */
function parseMeetingTime(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const today = new Date();
  today.setHours(hours, minutes, 0, 0);
  return today;
}

