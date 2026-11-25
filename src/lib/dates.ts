import { format, parseISO } from 'date-fns';
import type { VisitEntry } from '../types';

// Trip dates are stored as the instant of local midnight, matching how calendar
// imports are stored, so a date input must be read in local time, not as UTC.
export function dateInputToISO(value: string): string {
  return parseISO(value).toISOString();
}

export function isoToDateInput(iso: string): string {
  return format(new Date(iso), 'yyyy-MM-dd');
}

export function formatDateRange(entry: VisitEntry): string {
  const start = format(new Date(entry.startDate), 'MMM d, yyyy');
  if (entry.endDate) {
    const end = format(new Date(entry.endDate), 'MMM d, yyyy');
    if (end !== start) {
      return `${start} - ${end}`;
    }
  }
  return start;
}
