import { useState } from 'react';
import { countries } from '../data/countries';

interface AddVisitFormProps {
  onAdd: (countryCode: string, startDate: string, endDate?: string) => void;
  onCancel: () => void;
}

export function AddVisitForm({ onAdd, onCancel }: AddVisitFormProps) {
  const [countryCode, setCountryCode] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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
      endDate ? new Date(endDate).toISOString() : undefined
    );
  };

  const selectedCountry = countries.find((c) => c.code === countryCode);

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white border rounded-lg shadow-sm space-y-4">
      <h3 className="font-semibold text-lg">Add trip manually</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Country
        </label>
        {selectedCountry ? (
          <div className="flex items-center gap-2">
            <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded">
              {selectedCountry.name}
            </span>
            <button
              type="button"
              onClick={() => {
                setCountryCode('');
                setSearchTerm('');
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              Change
            </button>
          </div>
        ) : (
          <div className="relative">
            <input
              type="text"
              placeholder="Search for a country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {filteredCountries.slice(0, 10).map((country) => (
                  <li
                    key={country.code}
                    onClick={() => {
                      setCountryCode(country.code);
                      setSearchTerm('');
                    }}
                    className="px-3 py-2 cursor-pointer hover:bg-blue-50"
                  >
                    {country.name}
                  </li>
                ))}
                {filteredCountries.length === 0 && (
                  <li className="px-3 py-2 text-gray-500">No countries found</li>
                )}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date (optional)
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={!countryCode || !startDate}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Add trip
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
