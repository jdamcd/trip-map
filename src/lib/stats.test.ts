import { describe, it, expect } from 'vitest';
import { tripsPerYear, continentCoverage } from './stats';
import type { CountryVisit } from '../types';

function visit(
  countryCode: string,
  countryName: string,
  dates: string[]
): CountryVisit {
  return {
    countryCode,
    countryName,
    entries: dates.map((d) => ({
      id: crypto.randomUUID(),
      startDate: d,
      source: 'manual' as const,
    })),
  };
}

describe('tripsPerYear', () => {
  it('returns empty array for no visits', () => {
    expect(tripsPerYear([])).toEqual([]);
  });

  it('groups trips by year and sorts chronologically', () => {
    const visits = [
      visit('FR', 'France', ['2023-03-01', '2023-07-15']),
      visit('DE', 'Germany', ['2022-06-01', '2023-12-01']),
    ];
    const result = tripsPerYear(visits);
    const y2022 = result.find((r) => r.year === 2022);
    const y2023 = result.find((r) => r.year === 2023);
    expect(y2022).toEqual({ year: 2022, trips: 1, countries: [{ code: 'DE', name: 'Germany', count: 1 }] });
    expect(y2023).toEqual({
      year: 2023,
      trips: 3,
      countries: [
        { code: 'FR', name: 'France', count: 2 },
        { code: 'DE', name: 'Germany', count: 1 },
      ],
    });
    expect(result[0].year).toBe(2022);
    expect(result[result.length - 1].year).toBe(new Date().getFullYear());
  });

  it('fills gap years with zero trips', () => {
    const visits = [
      visit('FR', 'France', ['2020-06-01']),
      visit('DE', 'Germany', ['2023-06-01']),
    ];
    const result = tripsPerYear(visits);
    expect(result[0].year).toBe(2020);
    const y2021 = result.find((r) => r.year === 2021);
    const y2022 = result.find((r) => r.year === 2022);
    expect(y2021).toEqual({ year: 2021, trips: 0, countries: [] });
    expect(y2022).toEqual({ year: 2022, trips: 0, countries: [] });
  });

  it('extends to current year', () => {
    const currentYear = new Date().getFullYear();
    const visits = [
      visit('JP', 'Japan', ['2020-01-01']),
    ];
    const result = tripsPerYear(visits);
    expect(result[result.length - 1].year).toBe(currentYear);
    expect(result).toHaveLength(currentYear - 2020 + 1);
  });

  it('respects custom date range bounds', () => {
    const visits = [
      visit('FR', 'France', ['2015-06-01']),
      visit('DE', 'Germany', ['2018-03-01']),
    ];
    const result = tripsPerYear(visits, 2012, 2020);
    expect(result[0].year).toBe(2012);
    expect(result[result.length - 1].year).toBe(2020);
    expect(result).toHaveLength(9);
    expect(result.find((r) => r.year === 2015)!.trips).toBe(1);
    expect(result.find((r) => r.year === 2013)!.trips).toBe(0);
  });
});

describe('continentCoverage', () => {
  it('returns empty array for no visits', () => {
    expect(continentCoverage([])).toEqual([]);
  });

  it('counts visited countries and trips per continent', () => {
    const visits = [
      visit('FR', 'France', ['2023-01-01', '2023-06-01']),
      visit('DE', 'Germany', ['2023-03-01']),
      visit('JP', 'Japan', ['2023-04-01']),
    ];
    const result = continentCoverage(visits);
    const europe = result.find((c) => c.continent === 'Europe');
    const asia = result.find((c) => c.continent === 'Asia');
    expect(europe).toEqual({ continent: 'Europe', visited: 2, trips: 3, countryCodes: ['FR', 'DE'] });
    expect(asia).toEqual({ continent: 'Asia', visited: 1, trips: 1, countryCodes: ['JP'] });
  });

  it('excludes continents with zero visits', () => {
    const visits = [visit('AU', 'Australia', ['2023-01-01'])];
    const result = continentCoverage(visits);
    expect(result).toHaveLength(1);
    expect(result[0].continent).toBe('Oceania');
  });

  it('sorts by visited count descending', () => {
    const visits = [
      visit('JP', 'Japan', ['2023-01-01']),
      visit('FR', 'France', ['2023-01-01']),
      visit('DE', 'Germany', ['2023-01-01']),
      visit('IT', 'Italy', ['2023-01-01']),
    ];
    const result = continentCoverage(visits);
    expect(result[0].continent).toBe('Europe');
    expect(result[0].visited).toBe(3);
    expect(result[1].continent).toBe('Asia');
  });
});
