import { useState, useEffect, useMemo, useCallback } from 'react';
import { subYears } from 'date-fns';
import type { CountryVisit, DateRange } from './types';
import { WorldMap } from './components/WorldMap';
import { VisitList } from './components/VisitList';
import { CalendarInput } from './components/CalendarInput';
import { AddVisitForm } from './components/AddVisitForm';
import {
  saveVisits,
  loadVisits,
  clearVisits,
  downloadJson,
  importFromJson,
  saveHomeCountry,
  loadHomeCountry,
} from './lib/storage';
import { mergeVisits, createManualVisit } from './lib/country-extractor';
import { countries } from './data/countries';

function App() {
  const [visits, setVisits] = useState<CountryVisit[]>(() => loadVisits());
  const [dateRange, setDateRange] = useState<DateRange>({
    start: subYears(new Date(), 5),
    end: new Date(),
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCalendarInput, setShowCalendarInput] = useState(false);
  const [highlightedCountry, setHighlightedCountry] = useState<string>();
  const [homeCountry, setHomeCountry] = useState<string>(() => loadHomeCountry());

  // Save home country when it changes
  useEffect(() => {
    saveHomeCountry(homeCountry);
  }, [homeCountry]);

  // Save visits to localStorage when they change
  useEffect(() => {
    saveVisits(visits);
  }, [visits]);

  // Filter visits by date range
  const visitsInDateRange = useMemo(() => {
    return visits
      .map((visit) => ({
        ...visit,
        entries: visit.entries.filter((entry) => {
          const entryDate = new Date(entry.startDate);
          return entryDate >= dateRange.start && entryDate <= dateRange.end;
        }),
      }))
      .filter((visit) => visit.entries.length > 0);
  }, [visits, dateRange]);

  // Exclude home country for the list
  const filteredVisits = useMemo(() => {
    return visitsInDateRange.filter(
      (visit) => !homeCountry || visit.countryCode !== homeCountry
    );
  }, [visitsInDateRange, homeCountry]);

  const totalCountries = filteredVisits.length;
  const totalVisits = filteredVisits.reduce(
    (sum, v) => sum + v.entries.length,
    0
  );

  const handleImportCalendar = useCallback((newVisits: CountryVisit[]) => {
    setVisits((prev) => mergeVisits(prev, newVisits));
    setShowCalendarInput(false);
  }, []);

  const handleAddManualVisit = useCallback(
    (countryCode: string, startDate: string, endDate?: string) => {
      const newVisit = createManualVisit(countryCode, startDate, endDate);
      if (newVisit) {
        setVisits((prev) => mergeVisits(prev, [newVisit]));
      }
      setShowAddForm(false);
    },
    []
  );

  const handleDeleteEntry = useCallback(
    (countryCode: string, entryId: string) => {
      setVisits((prev) =>
        prev
          .map((visit) => {
            if (visit.countryCode !== countryCode) return visit;
            return {
              ...visit,
              entries: visit.entries.filter((e) => e.id !== entryId),
            };
          })
          .filter((visit) => visit.entries.length > 0)
      );
    },
    []
  );

  const handleDeleteCountry = useCallback((countryCode: string) => {
    setVisits((prev) => prev.filter((v) => v.countryCode !== countryCode));
  }, []);

  const handleEditEntry = useCallback(
    (
      countryCode: string,
      entryId: string,
      startDate: string,
      endDate?: string
    ) => {
      setVisits((prev) =>
        prev.map((visit) => {
          if (visit.countryCode !== countryCode) return visit;
          return {
            ...visit,
            entries: visit.entries.map((entry) => {
              if (entry.id !== entryId) return entry;
              return { ...entry, startDate, endDate };
            }),
          };
        })
      );
    },
    []
  );

  const handleExport = () => {
    downloadJson(visits);
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importFromJson(file);
      setVisits((prev) => mergeVisits(prev, imported));
    } catch (err) {
      alert('Failed to import file. Please check the format.');
      console.error(err);
    }

    e.target.value = '';
  };

  const handleClearAll = () => {
    if (
      confirm(
        'Are you sure you want to clear all travel history? This cannot be undone.'
      )
    ) {
      setVisits([]);
      clearVisits();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">tripm.app</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Extract travel history from your calendar
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 space-y-4">
        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowCalendarInput(!showCalendarInput)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                {showCalendarInput ? 'Cancel' : 'Import calendar'}
              </button>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm"
              >
                {showAddForm ? 'Cancel' : 'Add trip manually'}
              </button>
              <button
                onClick={handleExport}
                disabled={visits.length === 0}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm disabled:bg-gray-300 dark:disabled:bg-gray-600"
              >
                Export
              </button>
              <label className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm cursor-pointer">
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJson}
                  className="hidden"
                />
              </label>
              {visits.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 text-sm"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="home-country" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Home
                </label>
                <div className="relative">
                  <select
                    id="home-country"
                    value={homeCountry}
                    onChange={(e) => setHomeCountry(e.target.value)}
                    className="w-40 appearance-none truncate pr-7 pl-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="">None (show all)</option>
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                    <svg className="w-3 h-3 text-gray-500 dark:text-gray-400" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M6 8L1 3h10z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {totalCountries}
                </span>{' '}
                {totalCountries === 1 ? 'country' : 'countries'} /{' '}
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {totalVisits}
                </span>{' '}
                {totalVisits === 1 ? 'trip' : 'trips'}
              </div>
            </div>
          </div>
        </div>

        {/* Calendar input panel */}
        {showCalendarInput && (
          <CalendarInput onImport={handleImportCalendar} />
        )}

        {/* Add visit form */}
        {showAddForm && (
          <AddVisitForm
            onAdd={handleAddManualVisit}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {/* List and map */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
          {/* Visit list */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <VisitList
              visits={filteredVisits}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              onDeleteVisit={handleDeleteEntry}
              onDeleteCountry={handleDeleteCountry}
              onEditEntry={handleEditEntry}
              highlightedCountry={highlightedCountry}
            />
          </div>

          {/* Map */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <WorldMap
              visits={visitsInDateRange}
              homeCountry={homeCountry}
              onCountryClick={setHighlightedCountry}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 mt-auto">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
          All data is processed locally in your browser. Use import / export to back up your trip history.
        </div>
      </footer>
    </div>
  );
}

export default App;
