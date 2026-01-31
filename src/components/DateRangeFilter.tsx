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
    { value: '1y', label: '1 Year' },
    { value: '5y', label: '5 Years' },
    { value: 'all', label: 'All Time' },
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
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-gray-700">Period:</span>

      <div className="flex flex-wrap gap-1">
        {presets.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => handlePresetChange(value)}
            className={`px-3 py-1 text-sm rounded ${
              currentPreset === value
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {showCustom && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={format(dateRange.start, 'yyyy-MM-dd')}
            onChange={(e) => handleCustomDateChange('start', e.target.value)}
            className="px-2 py-1 text-sm border rounded"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={format(dateRange.end, 'yyyy-MM-dd')}
            onChange={(e) => handleCustomDateChange('end', e.target.value)}
            className="px-2 py-1 text-sm border rounded"
          />
        </div>
      )}
    </div>
  );
}
