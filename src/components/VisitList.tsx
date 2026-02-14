import { useState, useMemo } from 'react';
import type { CountryVisit, VisitEntry } from '../types';
import { formatDateRange } from '../lib/dates';
import { countryCodeToFlag } from '../lib/format';

interface VisitListProps {
  visits: CountryVisit[];
  onDeleteVisit: (countryCode: string, entryId: string) => void;
  onDeleteCountry: (countryCode: string) => void;
  onEditEntry: (
    countryCode: string,
    entryId: string,
    startDate: string,
    endDate?: string
  ) => void;
  highlightedCountry?: string;
}

type SortBy = 'name' | 'date' | 'count';

const sortLabels: Record<SortBy, string> = {
  name: 'Name',
  date: 'Date',
  count: 'Trips',
};

export function VisitList({
  visits,
  onDeleteVisit,
  onDeleteCountry,
  onEditEntry,
  highlightedCountry,
}: VisitListProps) {
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(
    new Set()
  );
  const [editingEntry, setEditingEntry] = useState<{
    countryCode: string;
    entryId: string;
  } | null>(null);

  const sortedVisits = useMemo(() => {
    return [...visits].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.countryName.localeCompare(b.countryName);
        case 'date': {
          const aDate = Math.max(
            ...a.entries.map((e) => new Date(e.startDate).getTime())
          );
          const bDate = Math.max(
            ...b.entries.map((e) => new Date(e.startDate).getTime())
          );
          return bDate - aDate; // Most recent first
        }
        case 'count':
          return b.entries.length - a.entries.length;
        default:
          return 0;
      }
    });
  }, [visits, sortBy]);

  const toggleExpanded = (countryCode: string) => {
    setExpandedCountries((prev) => {
      const next = new Set(prev);
      if (next.has(countryCode)) {
        next.delete(countryCode);
      } else {
        next.add(countryCode);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm">
          <svg className="w-4 h-4 shrink-0 mr-1 text-gray-500 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M6 12h12M9 18h6" />
          </svg>
          {(['name', 'date', 'count'] as SortBy[]).map((option) => (
            <button
              key={option}
              onClick={() => setSortBy(option)}
              className={`px-2 py-1 rounded border ${
                sortBy === option
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              {sortLabels[option]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sortedVisits.length === 0 ? (
          <div className="flex items-center justify-center h-full p-6 text-center text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">Import a calendar to visualise travel history</p>
              <p>Trips are automatically detected from events like flights and hotel bookings</p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {sortedVisits.map((visit) => {
              const isExpanded = expandedCountries.has(visit.countryCode);
              const isHighlighted = highlightedCountry === visit.countryCode;

              return (
                <li
                  key={visit.countryCode}
                  className={`${isHighlighted ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
                >
                  <div
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    onClick={() => toggleExpanded(visit.countryCode)}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`transform transition-transform text-gray-600 dark:text-gray-400 ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      >
                        ▶
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {countryCodeToFlag(visit.countryCode)} {visit.countryName}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({visit.entries.length} trip
                        {visit.entries.length !== 1 ? 's' : ''})
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          confirm(
                            `Remove all trips to ${visit.countryName}?`
                          )
                        ) {
                          onDeleteCountry(visit.countryCode);
                        }
                      }}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 px-2"
                      title="Remove country"
                    >
                      ✕
                    </button>
                  </div>

                  {isExpanded && (
                    <ul className="bg-gray-50 dark:bg-gray-900/50 pl-8 pr-3 py-1">
                      {[...visit.entries].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map((entry) => (
                        <li
                          key={entry.id}
                          className="py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                        >
                          {editingEntry?.countryCode === visit.countryCode &&
                          editingEntry?.entryId === entry.id ? (
                            <EntryEditor
                              entry={entry}
                              onSave={(startDate, endDate) => {
                                onEditEntry(
                                  visit.countryCode,
                                  entry.id,
                                  startDate,
                                  endDate
                                );
                                setEditingEntry(null);
                              }}
                              onCancel={() => setEditingEntry(null)}
                            />
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-start gap-2">
                                <span className="text-gray-400 text-sm mt-0.5">
                                  {entry.source === 'manual' ? '✏️' : '📅'}
                                </span>
                                <div>
                                  <div className="text-sm text-gray-900 dark:text-white">
                                    {formatDateRange(entry)}
                                  </div>
                                  {entry.eventTitle && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {entry.eventTitle.split('; ').map((title, idx) => (
                                        <div key={idx}>{title}</div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() =>
                                    setEditingEntry({
                                      countryCode: visit.countryCode,
                                      entryId: entry.id,
                                    })
                                  }
                                  className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 px-2 text-sm"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    onDeleteVisit(visit.countryCode, entry.id)
                                  }
                                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 px-2 text-sm"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

interface EntryEditorProps {
  entry: VisitEntry;
  onSave: (startDate: string, endDate?: string) => void;
  onCancel: () => void;
}

function EntryEditor({ entry, onSave, onCancel }: EntryEditorProps) {
  const [startDate, setStartDate] = useState(entry.startDate.split('T')[0]);
  const [endDate, setEndDate] = useState(
    entry.endDate ? entry.endDate.split('T')[0] : ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      new Date(startDate).toISOString(),
      endDate ? new Date(endDate).toISOString() : undefined
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm">
          {entry.source === 'manual' ? '✏️' : '📅'}
        </span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          required
        />
        <span className="text-gray-500 dark:text-gray-400">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-500"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
