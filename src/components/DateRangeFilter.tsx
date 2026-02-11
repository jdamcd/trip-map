import { useMemo, useState } from 'react';
import { subYears, format } from 'date-fns';
import type { DateRange } from '../types';

type PresetOption = '1y' | '5y' | 'all' | 'custom';

interface DateRangeFilterProps {
  dateRange: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangeFilter({ dateRange, onChange }: DateRangeFilterProps) {
  const now = useMemo(() => new Date(), []);
  const [showCustom, setShowCustom] = useState(false);

  const presets: { value: PresetOption; label: string }[] = [
    { value: '1y', label: '1 year' },
    { value: '5y', label: '5 years' },
    { value: 'all', label: 'All' },
    { value: 'custom', label: 'Custom' },
  ];

  const currentPreset = useMemo((): PresetOption => {
    if (!showCustom) {
      const startYear = dateRange.start.getFullYear();
      const endYear = dateRange.end.getFullYear();
      const nowYear = now.getFullYear();

      if (startYear <= 1900) return 'all';
      if (endYear !== nowYear) return 'custom';

      const yearsDiff = nowYear - startYear;
      if (yearsDiff === 1) return '1y';
      if (yearsDiff === 5) return '5y';
    }
    return 'custom';
  }, [dateRange, now, showCustom]);

  const handlePresetChange = (preset: PresetOption) => {
    if (preset === 'custom') {
      setShowCustom(true);
      onChange({ start: subYears(now, 10), end: now });
      return;
    }

    setShowCustom(false);
    let start: Date;
    const end = now;

    switch (preset) {
      case '1y':
        start = subYears(now, 1);
        break;
      case '5y':
        start = subYears(now, 5);
        break;
      case 'all':
        start = new Date(1900, 0, 1);
        break;
      default:
        return;
    }

    onChange({ start, end });
  };

  const handleCustomDateChange = (
    field: 'start' | 'end',
    value: string
  ) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) return;

    onChange({
      ...dateRange,
      [field]: date,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2">
        <span className="w-12 shrink-0 text-sm text-gray-500 dark:text-gray-400">Period</span>

        <div className="flex flex-wrap gap-2">
          {presets.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handlePresetChange(value)}
              className={`px-3 py-1 text-sm rounded border ${
                currentPreset === value
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {showCustom && (
        <div className="flex items-center gap-2 ml-14">
          <input
            type="date"
            value={format(dateRange.start, 'yyyy-MM-dd')}
            onChange={(e) => handleCustomDateChange('start', e.target.value)}
            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <span className="text-gray-500 dark:text-gray-400">to</span>
          <input
            type="date"
            value={format(dateRange.end, 'yyyy-MM-dd')}
            onChange={(e) => handleCustomDateChange('end', e.target.value)}
            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      )}
    </div>
  );
}
