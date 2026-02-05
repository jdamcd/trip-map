import { describe, it, expect } from 'vitest';
import {
  parseICalData,
  parseICalDataWithProgress,
} from './calendar-parser';

/** Minimal valid iCal wrapper */
function wrapEvents(...vevents: string[]): string {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Test//Test//EN',
    ...vevents,
    'END:VCALENDAR',
  ].join('\r\n');
}

function makeVEvent(overrides: {
  uid?: string;
  summary?: string;
  location?: string;
  description?: string;
  dtstart?: string;
  dtend?: string;
}): string {
  const lines = ['BEGIN:VEVENT'];
  if (overrides.uid) lines.push(`UID:${overrides.uid}`);
  if (overrides.summary) lines.push(`SUMMARY:${overrides.summary}`);
  if (overrides.location) lines.push(`LOCATION:${overrides.location}`);
  if (overrides.description) lines.push(`DESCRIPTION:${overrides.description}`);
  if (overrides.dtstart) lines.push(`DTSTART:${overrides.dtstart}`);
  if (overrides.dtend) lines.push(`DTEND:${overrides.dtend}`);
  lines.push('END:VEVENT');
  return lines.join('\r\n');
}

describe('parseICalData', () => {
  it('skips events without a start date', () => {
    const ical = wrapEvents(
      makeVEvent({ uid: 'no-date', summary: 'Missing date' }),
      makeVEvent({ uid: 'has-date', summary: 'Has date', dtstart: '20240601T090000Z' })
    );

    const events = parseICalData(ical);
    expect(events).toHaveLength(1);
    expect(events[0].summary).toBe('Has date');
  });

  it('sets empty string for missing summary', () => {
    const ical = wrapEvents(makeVEvent({ uid: 'no-summary', dtstart: '20240601T090000Z' }));

    const events = parseICalData(ical);
    expect(events[0].summary).toBe('');
  });

  it('sets undefined for missing location and description', () => {
    const ical = wrapEvents(makeVEvent({ uid: 'minimal', dtstart: '20240601T090000Z' }));

    const events = parseICalData(ical);
    expect(events[0].location).toBeUndefined();
    expect(events[0].description).toBeUndefined();
  });

  it('generates uid when event has none', () => {
    const ical = wrapEvents(makeVEvent({ summary: 'No UID', dtstart: '20240601T090000Z' }));

    const events = parseICalData(ical);
    expect(events[0].uid).toBeDefined();
    expect(events[0].uid.length).toBeGreaterThan(0);
  });
});

describe('parseICalDataWithProgress', () => {
  it('returns same results as parseICalData', () => {
    const ical = wrapEvents(
      makeVEvent({ uid: 'a', summary: 'A', dtstart: '20240601T090000Z' }),
      makeVEvent({ uid: 'b', summary: 'B', dtstart: '20240602T090000Z' })
    );

    const withProgress = parseICalDataWithProgress(ical);
    const without = parseICalData(ical);
    expect(withProgress).toEqual(without);
  });

  it('calls progress with initial zero and final count', () => {
    const ical = wrapEvents(
      makeVEvent({ uid: 'a', summary: 'A', dtstart: '20240601T090000Z' }),
      makeVEvent({ uid: 'b', summary: 'B', dtstart: '20240602T090000Z' })
    );

    const calls: Array<[number, number]> = [];
    parseICalDataWithProgress(ical, (current, total) => {
      calls.push([current, total]);
    });

    // First call: initial (0, total)
    expect(calls[0]).toEqual([0, 2]);
    // Last call: final (count, count)
    const last = calls[calls.length - 1];
    expect(last[0]).toBe(last[1]);
    expect(last[0]).toBe(2);
  });

  it('works without progress callback', () => {
    const ical = wrapEvents(
      makeVEvent({ uid: 'a', summary: 'A', dtstart: '20240601T090000Z' })
    );

    const events = parseICalDataWithProgress(ical);
    expect(events).toHaveLength(1);
  });

  it('handles empty calendar with progress', () => {
    const calls: Array<[number, number]> = [];
    const events = parseICalDataWithProgress(wrapEvents(), (current, total) => {
      calls.push([current, total]);
    });

    expect(events).toEqual([]);
    // Should still get initial and final progress calls
    expect(calls).toContainEqual([0, 0]);
  });
});
