import { useState } from 'react';
import { countries } from '../data/countries';

interface AddVisitFormProps {
  onAdd: (countryCode: string, startDate: string, endDate?: string, note?: string) => void;
  onCancel: () => void;
}

export function AddVisitForm({ onAdd, onCancel }: AddVisitFormProps) {
  const [countryCode, setCountryCode] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [note, setNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCountries = searchTerm
    ? countries.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : countries;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!countryCode || !startDate) return;

    onAdd(
      countryCode,
      new Date(startDate).toISOString(),
      endDate ? new Date(endDate).toISOString() : undefined,
      note.trim() || undefined
    );
  };

  const selectedCountry = countries.find((c) => c.code === countryCode);

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm space-y-4">
      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Add trip manually</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Country
          </label>
          {selectedCountry ? (
            <div className="flex items-center gap-2">
              <span className="px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                {selectedCountry.name}
              </span>
              <button
                type="button"
                onClick={() => {
                  setCountryCode('');
                  setSearchTerm('');
                }}
                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 px-2 text-sm"
              >
                Edit
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                type="text"
                placeholder="Search for a country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm && (
                <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {filteredCountries.slice(0, 10).map((country) => (
                    <li
                      key={country.code}
                      onClick={() => {
                        setCountryCode(country.code);
                        setSearchTerm('');
                      }}
                      className="px-3 py-2 cursor-pointer text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    >
                      {country.name}
                    </li>
                  ))}
                  {filteredCountries.length === 0 && (
                    <li className="px-3 py-2 text-gray-500 dark:text-gray-400">No countries found</li>
                  )}
                </ul>
              )}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Note (optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Summer holiday"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={60}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            End date (optional)
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={!countryCode || !startDate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          Add trip
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
