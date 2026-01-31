import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import type { CountryVisit, VisitEntry } from '../types';

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

  const formatDateRange = (entry: VisitEntry) => {
    const start = format(new Date(entry.startDate), 'MMM d, yyyy');
    if (entry.endDate) {
      const end = format(new Date(entry.endDate), 'MMM d, yyyy');
      if (end !== start) {
        return `${start} - ${end}`;
      }
    }
    return start;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-200">
        <div className="flex gap-2 text-sm">
          <span className="text-gray-500">Sort:</span>
          {(['name', 'date', 'count'] as SortBy[]).map((option) => (
            <button
              key={option}
              onClick={() => setSortBy(option)}
              className={`px-2 py-0.5 rounded ${
                sortBy === option
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {sortLabels[option]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sortedVisits.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No countries visited yet
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {sortedVisits.map((visit) => {
              const isExpanded = expandedCountries.has(visit.countryCode);
              const isHighlighted = highlightedCountry === visit.countryCode;

              return (
                <li
                  key={visit.countryCode}
                  className={`${isHighlighted ? 'bg-blue-50' : ''}`}
                >
                  <div
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleExpanded(visit.countryCode)}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`transform transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      >
                        ▶
                      </span>
                      <span className="font-medium">{visit.countryName}</span>
                      <span className="text-sm text-gray-500">
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
                      className="text-red-500 hover:text-red-700 px-2"
                      title="Remove country"
                    >
                      ✕
                    </button>
                  </div>

                  {isExpanded && (
                    <ul className="bg-gray-50 pl-8 pr-3 pb-2">
                      {visit.entries.map((entry) => (
                        <li
                          key={entry.id}
                          className="py-2 border-b border-gray-100 last:border-0"
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
                                  <div className="text-sm">
                                    {formatDateRange(entry)}
                                  </div>
                                  {entry.eventTitle && (
                                    <div className="text-xs text-gray-500">
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
                                  className="text-blue-500 hover:text-blue-700 px-2 text-sm"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    onDeleteVisit(visit.countryCode, entry.id)
                                  }
                                  className="text-red-500 hover:text-red-700 px-2 text-sm"
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
          className="px-2 py-1 border rounded text-sm"
          required
        />
        <span className="text-gray-500">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-2 py-1 border rounded text-sm"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
