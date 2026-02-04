import ICAL from 'ical.js';
import type { CalendarEvent } from '../types';

/**
 * Parse iCal data with progress reporting.
 * Uses ComponentParser for streaming event extraction.
 */
export function parseICalDataWithProgress(
  icalData: string,
  onProgress?: (current: number, total: number) => void
): CalendarEvent[] {
  // Quick count of events (fast string scan)
  const eventCount = countEvents(icalData);
  onProgress?.(0, eventCount);

  // Parse the iCal string
  const jcalData = ICAL.parse(icalData);
  const vcalendar = new ICAL.Component(jcalData);

  // Extract events using ComponentParser for streaming
  const events: CalendarEvent[] = [];
  let processed = 0;
  const PROGRESS_INTERVAL_MS = 100;
  let lastProgressTime = Date.now();

  const parser = new ICAL.ComponentParser({ parseEvent: true });

  parser.onevent = (event: ICAL.Event) => {
    const startDate = event.startDate?.toJSDate();
    if (!startDate) return;

    events.push({
      uid: event.uid || crypto.randomUUID(),
      summary: event.summary || '',
      description: event.description || undefined,
      location: event.location || undefined,
      startDate,
      endDate: event.endDate?.toJSDate(),
    });

    processed++;
    const now = Date.now();
    if (onProgress && now - lastProgressTime >= PROGRESS_INTERVAL_MS) {
      onProgress(processed, eventCount);
      lastProgressTime = now;
    }
  };

  parser.process(vcalendar);

  // Final progress update
  onProgress?.(events.length, events.length);

  return events;
}

/**
 * Fast event count using string matching (much faster than parsing)
 */
function countEvents(icalData: string): number {
  let count = 0;
  let pos = 0;
  while ((pos = icalData.indexOf('BEGIN:VEVENT', pos)) !== -1) {
    count++;
    pos += 12; // length of 'BEGIN:VEVENT'
  }
  return count;
}

/**
 * Simple parse without progress reporting.
 */
export function parseICalData(icalData: string): CalendarEvent[] {
  const jcalData = ICAL.parse(icalData);
  const vcalendar = new ICAL.Component(jcalData);
  const vevents = vcalendar.getAllSubcomponents('vevent');

  const events: CalendarEvent[] = [];
  for (const vevent of vevents) {
    const event = new ICAL.Event(vevent);
    const startDate = event.startDate?.toJSDate();
    if (!startDate) continue;

    events.push({
      uid: event.uid || crypto.randomUUID(),
      summary: event.summary || '',
      description: event.description || undefined,
      location: event.location || undefined,
      startDate,
      endDate: event.endDate?.toJSDate(),
    });
  }
  return events;
}

export function filterEventsByDateRange(
  events: CalendarEvent[],
  startDate: Date,
  endDate: Date
): CalendarEvent[] {
  return events.filter((event) => {
    return event.startDate >= startDate && event.startDate <= endDate;
  });
}
