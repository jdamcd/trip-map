import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { CountryVisit, DateRange } from '../types';
import { tripsPerYear, continentCoverage, type YearTrips } from '../lib/stats';
import { countryCodeToFlag } from '../lib/format';
import { useDarkMode } from '../lib/useDarkMode';

interface StatsPanelProps {
  visits: CountryVisit[];
  dateRange: DateRange;
}

export function StatsPanel({ visits, dateRange }: StatsPanelProps) {
  const isDark = useDarkMode();

  const yearData = useMemo(() => {
    const startYear = dateRange.start.getFullYear() <= 1900 ? undefined : dateRange.start.getFullYear();
    return tripsPerYear(visits, startYear, dateRange.end.getFullYear());
  }, [visits, dateRange]);
  const continentData = useMemo(() => continentCoverage(visits), [visits]);

  if (visits.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center text-gray-500 dark:text-gray-400">
        No trip data to show
      </div>
    );
  }

  const axisColor = isDark ? '#9ca3af' : '#6b7280';
  const gridColor = isDark ? '#374151' : '#e5e7eb';
  const tooltipBg = isDark ? '#1f2937' : '#ffffff';
  const tooltipBorder = isDark ? '#374151' : '#e5e7eb';
  const lineColor = '#3b82f6';

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
      {/* Trips per year */}
      {yearData.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Trips per year
          </h3>
          <div className="h-40 [&_.recharts-surface]:outline-none">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yearData} margin={{ top: 8, right: 8, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="year"
                  tick={{ fill: axisColor, fontSize: 12 }}
                  tickLine={{ stroke: axisColor }}
                  axisLine={{ stroke: gridColor }}
                />
                <YAxis
                  allowDecimals={false}
                  domain={[0, (max: number) => max]}
                  tick={{ fill: axisColor, fontSize: 12 }}
                  tickLine={{ stroke: axisColor }}
                  axisLine={{ stroke: gridColor }}
                  tickFormatter={(value: number) => (value === 0 ? '' : String(value))}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload as YearTrips;
                    return (
                      <div
                        style={{
                          backgroundColor: tooltipBg,
                          border: `1px solid ${tooltipBorder}`,
                          borderRadius: '0.375rem',
                          color: isDark ? '#f3f4f6' : '#111827',
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.75rem',
                        }}
                      >
                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                          {data.year} — {data.trips} {data.trips === 1 ? 'trip' : 'trips'}
                        </div>
                        <div>
                          {data.countries.map((c) => (
                            <div key={c.code}>
                              {c.name}{c.count > 1 ? ` x${c.count}` : ''}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="trips"
                  stroke={lineColor}
                  strokeWidth={2}
                  dot={{ fill: lineColor, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Continents */}
      {continentData.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Continents
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {continentData.map((c) => (
              <div
                key={c.continent}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"
              >
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {c.continent}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {c.visited} {c.visited === 1 ? 'country' : 'countries'}, {c.trips}{' '}
                  {c.trips === 1 ? 'trip' : 'trips'}
                </div>
                <div className="mt-1.5 leading-relaxed">
                  {c.countryCodes.map((code) => (
                    <span key={code} title={code} className="text-sm">
                      {countryCodeToFlag(code)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
