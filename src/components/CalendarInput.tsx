import { useState } from 'react';
import { parseICalData } from '../lib/calendar-parser';
import { extractCountryVisits } from '../lib/country-extractor';
import type { CountryVisit } from '../types';

type InputMode = 'file' | 'paste';

interface CalendarInputProps {
  onImport: (visits: CountryVisit[]) => void;
}

export function CalendarInput({ onImport }: CalendarInputProps) {
  const [mode, setMode] = useState<InputMode>('file');
  const [pastedText, setPastedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processICalData = (data: string) => {
    try {
      const events = parseICalData(data);
      const visits = extractCountryVisits(events);

      if (visits.length === 0) {
        setError(
          'No travel-related events found. Try adding events with flight info, hotel bookings, or location data.'
        );
        return;
      }

      onImport(visits);
      setError(null);
      setPastedText('');
    } catch (err) {
      setError('Failed to parse calendar data. Please check the format.');
      console.error(err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result as string;
      processICalData(data);
      setLoading(false);
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
    processICalData(pastedText);
    setLoading(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h2 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">Import calendar</h2>

      <div className="flex gap-2 mb-4">
        {(['file', 'paste'] as InputMode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={`px-3 py-1 rounded text-sm border ${
              mode === m
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            {m === 'file' ? 'Upload file' : 'Paste iCal'}
          </button>
        ))}
      </div>

      {mode === 'file' && (
        <div>
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

      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p className="font-medium mb-1">Always check for errors. Trips are detected based on:</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>Flights and events with airport codes (e.g. JFK, LHR)</li>
          <li>Hotel and accommodation bookings</li>
          <li>Multi-day events that include countries or cities</li>
          <li>Events with keywords like "flight", "hotel", or "trip"</li>
        </ul>
      </div>
    </div>
  );
}
