import { parseICalDataWithProgress } from './calendar-parser';
import { extractCountryVisits } from './country-extractor';
import type { CalendarEvent, CountryVisit } from '../types';

export interface WorkerMessage {
  type: 'process' | 'extractOnly';
  data?: string;
  events?: CalendarEvent[];
}

export interface WorkerResponse {
  type: 'progress' | 'complete' | 'error';
  eventsProcessed?: number;
  totalEvents?: number;
  visits?: CountryVisit[];
  error?: string;
}

function extractAndReport(events: CalendarEvent[]) {
  const visits = extractCountryVisits(events, (processed, total) => {
    self.postMessage({
      type: 'progress',
      eventsProcessed: processed,
      totalEvents: total,
    } as WorkerResponse);
  });

  self.postMessage({
    type: 'complete',
    visits,
  } as WorkerResponse);
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  try {
    if (e.data.type === 'process') {
      const events = parseICalDataWithProgress(e.data.data!, (current, total) => {
        self.postMessage({
          type: 'progress',
          eventsProcessed: current,
          totalEvents: total,
        } as WorkerResponse);
      });
      extractAndReport(events);
    } else if (e.data.type === 'extractOnly') {
      // Ensure dates are Date objects (defensive against serialisation)
      const events = (e.data.events || []).map((ev) => ({
        ...ev,
        startDate: new Date(ev.startDate),
        endDate: ev.endDate ? new Date(ev.endDate) : undefined,
      }));
      extractAndReport(events);
    }
  } catch (err) {
    self.postMessage({
      type: 'error',
      error: err instanceof Error ? err.message : 'Unknown error',
    } as WorkerResponse);
  }
};
