import { format } from 'date-fns';
import type { VisitEntry } from '../types';

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
