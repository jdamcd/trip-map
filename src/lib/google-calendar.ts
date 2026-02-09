import type { CalendarEvent } from '../types';

const GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client';
const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

let gisLoadPromise: Promise<void> | null = null;

export function loadGisScript(): Promise<void> {
  if (gisLoadPromise) return gisLoadPromise;

  gisLoadPromise = new Promise<void>((resolve, reject) => {
    // Already loaded
    if (typeof google !== 'undefined' && google.accounts?.oauth2) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = GIS_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      gisLoadPromise = null; // Allow retry
      reject(new Error('Failed to load Google Identity Services'));
    };
    document.head.appendChild(script);
  });

  return gisLoadPromise;
}

export function requestAccessToken(clientId: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/calendar.readonly',
      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error_description || response.error));
          return;
        }
        resolve(response.access_token);
      },
      error_callback: (error) => {
        const message =
          error.type === 'popup_closed'
            ? 'Sign-in cancelled. Please try again and complete the Google sign-in.'
            : error.type === 'popup_failed_to_open'
              ? 'Pop-up blocked. Please allow pop-ups for this site and try again.'
              : error.message || 'Authentication failed. Please try again.';
        reject(new Error(message));
      },
    });
    client.requestAccessToken();
  });
}

export interface GoogleCalendar {
  id: string;
  summary: string;
  primary?: boolean;
}

export async function fetchCalendarList(accessToken: string): Promise<GoogleCalendar[]> {
  const response = await fetch(`${CALENDAR_API_BASE}/users/me/calendarList`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch calendars: ${response.status}`);
  }

  const data = await response.json();
  const calendars = (data.items || []).map((item: { id: string; summary: string; primary?: boolean }) => ({
    id: item.id,
    summary: item.summary,
    primary: item.primary || false,
  }));
  calendars.sort((a: GoogleCalendar, b: GoogleCalendar) => (a.primary === b.primary ? 0 : a.primary ? -1 : 1));
  return calendars;
}

interface GoogleEvent {
  id: string;
  status: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
}

interface GoogleEventsResponse {
  items?: GoogleEvent[];
  nextPageToken?: string;
}

export async function fetchCalendarEvents(
  accessToken: string,
  calendarId: string,
  timeMin: Date,
  timeMax: Date,
  onProgress?: (fetched: number) => void
): Promise<CalendarEvent[]> {
  const events: CalendarEvent[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      maxResults: '2500',
      singleEvents: 'true',
      orderBy: 'startTime',
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
    });
    if (pageToken) params.set('pageToken', pageToken);

    const response = await fetch(
      `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.status}`);
    }

    const data: GoogleEventsResponse = await response.json();

    for (const item of data.items || []) {
      if (item.status === 'cancelled') continue;
      const converted = toCalendarEvent(item);
      if (converted) events.push(converted);
    }

    onProgress?.(events.length);
    pageToken = data.nextPageToken;
  } while (pageToken);

  return events;
}

export function toCalendarEvent(event: GoogleEvent): CalendarEvent | null {
  const startStr = event.start?.dateTime || event.start?.date;
  if (!startStr) return null;

  const startDate = new Date(startStr);
  const endStr = event.end?.dateTime || event.end?.date;
  const endDate = endStr ? new Date(endStr) : undefined;

  return {
    uid: event.id,
    summary: event.summary || '',
    description: event.description || undefined,
    location: event.location || undefined,
    startDate,
    endDate,
  };
}
