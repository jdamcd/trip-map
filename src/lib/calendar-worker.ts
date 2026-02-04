import { parseICalDataWithProgress } from './calendar-parser';
import { extractCountryVisits } from './country-extractor';
import type { CountryVisit } from '../types';

export interface WorkerMessage {
  type: 'process';
  data: string;
}

export interface WorkerResponse {
  type: 'progress' | 'complete' | 'error';
  eventsProcessed?: number;
  totalEvents?: number;
  visits?: CountryVisit[];
  error?: string;
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  if (e.data.type === 'process') {
    try {
      // Parse the calendar data with progress reporting
      const events = parseICalDataWithProgress(e.data.data, (current, total) => {
        self.postMessage({
          type: 'progress',
          eventsProcessed: current,
          totalEvents: total,
        } as WorkerResponse);
      });

      // Extract country visits with progress reporting
      const visits = extractCountryVisits(events, (processed, total) => {
        self.postMessage({
          type: 'progress',
          eventsProcessed: processed,
          totalEvents: total,
        } as WorkerResponse);
      });

      // Report completion
      self.postMessage({
        type: 'complete',
        visits,
      } as WorkerResponse);
    } catch (err) {
      self.postMessage({
        type: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
      } as WorkerResponse);
    }
  }
};
