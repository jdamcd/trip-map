import { describe, it, expect } from 'vitest';
import { dateInputToISO, isoToDateInput } from './dates';

describe('date input conversion', () => {
  it('stores a date input as local midnight', () => {
    const date = new Date(dateInputToISO('2020-01-01'));
    expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()]).toEqual([2020, 0, 1, 0]);
  });

  it('round-trips a date input', () => {
    expect(isoToDateInput(dateInputToISO('2020-01-01'))).toBe('2020-01-01');
  });

  it('shows a calendar import on its local date', () => {
    const localMidnight = new Date(2024, 6, 15).toISOString();
    expect(isoToDateInput(localMidnight)).toBe('2024-07-15');
  });
});
