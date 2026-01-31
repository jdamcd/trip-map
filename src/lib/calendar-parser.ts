import ICAL from 'ical.js';
import type { CalendarEvent } from '../types';

export function parseICalData(icalData: string): CalendarEvent[] {
  const jcalData = ICAL.parse(icalData);
  const vcalendar = new ICAL.Component(jcalData);
  const vevents = vcalendar.getAllSubcomponents('vevent');

  const events: CalendarEvent[] = [];

  for (const vevent of vevents) {
    const event = new ICAL.Event(vevent);

    const startDate = event.startDate?.toJSDate();
    if (!startDate) continue;

    const calEvent: CalendarEvent = {
      uid: event.uid || crypto.randomUUID(),
      summary: event.summary || '',
      description: event.description || undefined,
      location: event.location || undefined,
      startDate,
      endDate: event.endDate?.toJSDate(),
    };

    events.push(calEvent);
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
