import { useState, useRef, useEffect } from 'react';
import type { CalendarEvent, CountryVisit } from '../types';
import type { WorkerResponse } from '../lib/calendar-worker';
import CalendarWorker from '../lib/calendar-worker?worker';
import {
  loadGisScript,
  requestAccessToken,
  fetchCalendarList,
  fetchCalendarEvents,
  type GoogleCalendar,
} from '../lib/google-calendar';

type InputMode = 'file' | 'paste' | 'google';
type GoogleStep = 'idle' | 'authenticating' | 'selecting' | 'fetching';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

interface CalendarInputProps {
  onImport: (visits: CountryVisit[]) => void;
}

export function CalendarInput({ onImport }: CalendarInputProps) {
  const [mode, setMode] = useState<InputMode>('file');
  const [pastedText, setPastedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ processed: number; total: number } | null>(null);
  const workerRef = useRef<Worker | null>(null);

  // Google-specific state
  const [googleStep, setGoogleStep] = useState<GoogleStep>('idle');
  const [calendars, setCalendars] = useState<GoogleCalendar[]>([]);
  const [selectedCalendars, setSelectedCalendars] = useState<Set<string>>(new Set());
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [googleFetchProgress, setGoogleFetchProgress] = useState<string | null>(null);

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const setupWorkerHandlers = (worker: Worker) => {
    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const response = e.data;

      if (response.type === 'progress') {
        setProgress({
          processed: response.eventsProcessed || 0,
          total: response.totalEvents || 0,
        });
      } else if (response.type === 'complete') {
        setLoading(false);
        setProgress(null);
        setGoogleStep('idle');
        setGoogleFetchProgress(null);

        if (!response.visits || response.visits.length === 0) {
          setError(
            'No travel-related events found. Try adding events with flight info, hotel bookings, or location data.'
          );
          return;
        }

        onImport(response.visits);
        setError(null);
        setPastedText('');
        worker.terminate();
      } else if (response.type === 'error') {
        setLoading(false);
        setProgress(null);
        setGoogleStep('idle');
        setGoogleFetchProgress(null);
        setError(response.error || 'Failed to parse calendar data. Please check the format.');
        worker.terminate();
      }
    };

    worker.onerror = (err) => {
      setLoading(false);
      setProgress(null);
      setGoogleStep('idle');
      setGoogleFetchProgress(null);
      setError('Failed to process calendar data.');
      console.error(err);
      worker.terminate();
    };
  };

  const processWithWorker = (data: string) => {
    workerRef.current?.terminate();
    const worker = new CalendarWorker();
    workerRef.current = worker;
    setupWorkerHandlers(worker);
    worker.postMessage({ type: 'process', data });
  };

  const processEventsWithWorker = (events: CalendarEvent[]) => {
    workerRef.current?.terminate();
    const worker = new CalendarWorker();
    workerRef.current = worker;
    setupWorkerHandlers(worker);
    worker.postMessage({ type: 'extractOnly', events });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setProgress(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result as string;
      processWithWorker(data);
    };
    reader.onerror = () => {
      setError('Failed to read file');
      setLoading(false);
    };
    reader.readAsText(file);

    // Reset file input
    e.target.value = '';
  };

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedText) return;

    setLoading(true);
    setError(null);
    setProgress(null);
    processWithWorker(pastedText);
  };

  const handleGoogleConnect = async () => {
    if (!GOOGLE_CLIENT_ID) return;

    setError(null);
    setGoogleStep('authenticating');

    try {
      await loadGisScript();
      const token = await requestAccessToken(GOOGLE_CLIENT_ID);
      setAccessToken(token);

      const calendarList = await fetchCalendarList(token);
      setCalendars(calendarList);

      // Pre-select primary calendar
      const primaryIds = new Set(
        calendarList.filter((c) => c.primary).map((c) => c.id)
      );
      setSelectedCalendars(primaryIds.size > 0 ? primaryIds : new Set([calendarList[0]?.id].filter(Boolean)));
      setGoogleStep('selecting');
    } catch (err) {
      setGoogleStep('idle');
      const message = err instanceof Error ? err.message : 'Failed to connect';
      setError(message);
    }
  };

  const handleGoogleFetch = async () => {
    if (!accessToken || selectedCalendars.size === 0) return;

    setError(null);
    setGoogleStep('fetching');
    setLoading(true);

    // Default: 10 years back to today
    const timeMax = new Date();
    const timeMin = new Date();
    timeMin.setFullYear(timeMin.getFullYear() - 10);

    try {
      const allEvents: CalendarEvent[] = [];
      const seen = new Set<string>();
      for (const calId of selectedCalendars) {
        const calName = calendars.find((c) => c.id === calId)?.summary || calId;
        setGoogleFetchProgress(`Fetching ${calName}...`);

        const events = await fetchCalendarEvents(
          accessToken,
          calId,
          timeMin,
          timeMax,
          (fetched) => {
            setGoogleFetchProgress(`Fetching ${calName}: ${fetched.toLocaleString()} events`);
          }
        );

        for (const event of events) {
          if (!seen.has(event.uid)) {
            seen.add(event.uid);
            allEvents.push(event);
          }
        }
      }

      if (allEvents.length === 0) {
        setLoading(false);
        setGoogleStep('idle');
        setGoogleFetchProgress(null);
        setError('No events found in the selected calendars.');
        return;
      }

      setGoogleFetchProgress(`Extracting trips from ${allEvents.length.toLocaleString()} events...`);
      processEventsWithWorker(allEvents);
    } catch (err) {
      setLoading(false);
      setGoogleStep('idle');
      setGoogleFetchProgress(null);
      const message = err instanceof Error ? err.message : 'Failed to fetch events';
      setError(message);
    }
  };

  const toggleCalendar = (id: string) => {
    setSelectedCalendars((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const modes: { key: InputMode; label: string }[] = [
    { key: 'file', label: 'Upload file' },
    ...(GOOGLE_CLIENT_ID ? [{ key: 'google' as InputMode, label: 'Google Calendar' }] : []),
    { key: 'paste', label: 'Paste iCal' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h2 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">Import calendar</h2>

      <div className="flex gap-2 mb-4">
        {modes.map((m) => (
          <button
            key={m.key}
            onClick={() => {
              setMode(m.key);
              setError(null);
            }}
            className={`px-3 py-1 rounded text-sm border ${
              mode === m.key
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'file' && (
        <div>
          {loading ? (
            <div className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-blue-400 dark:border-blue-500 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium tabular-nums">
                  {progress && progress.total > 0
                    ? `${Math.round((progress.processed / progress.total) * 100)}% of ${progress.total.toLocaleString()} events`
                    : 'Processing...'}
                </div>
              </div>
            </div>
          ) : (
            <label className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Upload an .ics file exported from your calendar
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Click to browse
                </div>
              </div>
              <input
                type="file"
                accept=".ics,.ical,text/calendar"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      )}

      {mode === 'paste' && (
        <form onSubmit={handlePasteSubmit} className="space-y-3">
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste iCal data here (starts with BEGIN:VCALENDAR)..."
            className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md font-mono text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!pastedText || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Import'}
          </button>
        </form>
      )}

      {mode === 'google' && (
        <div>
          {googleStep === 'idle' && (
            <button
              onClick={handleGoogleConnect}
              className="w-full flex items-center justify-center gap-2 px-4 py-[1.35rem] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm text-gray-600 dark:text-gray-300"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Connect Google Calendar
              <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700 dark:bg-purple-800/50 dark:text-purple-300">Beta</span>
            </button>
          )}

          {googleStep === 'authenticating' && (
            <div className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-blue-400 dark:border-blue-500 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Connecting to Google...
                </div>
              </div>
            </div>
          )}

          {googleStep === 'selecting' && (
            <div className="space-y-3">
              <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                Select calendars to import:
              </div>
              <div className="border border-gray-200 dark:border-gray-600 rounded-md divide-y divide-gray-200 dark:divide-gray-600 max-h-48 overflow-y-auto">
                {calendars.map((cal) => (
                  <label
                    key={cal.id}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCalendars.has(cal.id)}
                      onChange={() => toggleCalendar(cal.id)}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-900 dark:text-white truncate">
                      {cal.summary}
                      {cal.primary && (
                        <span className="ml-1 text-xs text-gray-400">(primary)</span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleGoogleFetch}
                  disabled={selectedCalendars.size === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  Import events
                </button>
                <button
                  onClick={() => {
                    setGoogleStep('idle');
                    setAccessToken(null);
                    setCalendars([]);
                    setSelectedCalendars(new Set());
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-md hover:border-gray-400 text-sm"
                >
                  Cancel
                </button>
              </div>
              <div className="text-xs text-gray-400">
                Imports events from the last 10 years.
              </div>
            </div>
          )}

          {googleStep === 'fetching' && (
            <div className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-blue-400 dark:border-blue-500 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium tabular-nums">
                  {progress && progress.total > 0
                    ? `${Math.round((progress.processed / progress.total) * 100)}% of ${progress.total.toLocaleString()} events`
                    : googleFetchProgress || 'Fetching events...'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      <details className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <summary className="font-medium cursor-pointer">Always check for errors. How are trips detected?</summary>
        <ul className="list-disc ml-7 space-y-0.5 mt-1">
          <li>Flights and events with airport codes (e.g. JFK, LHR)</li>
          <li>Hotel and accommodation bookings</li>
          <li>Multi-day events that include countries or cities</li>
          <li>Events with keywords like "flight", "hotel", or "trip"</li>
        </ul>
      </details>
    </div>
  );
}
