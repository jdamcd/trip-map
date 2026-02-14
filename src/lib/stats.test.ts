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
    expect(result).toEqual([
      { year: 2022, trips: 1, countries: [{ code: 'DE', name: 'Germany', count: 1 }] },
      {
        year: 2023,
        trips: 3,
        countries: [
          { code: 'FR', name: 'France', count: 2 },
          { code: 'DE', name: 'Germany', count: 1 },
        ],
      },
    ]);
  });

  it('handles entries across many years', () => {
    const visits = [
      visit('JP', 'Japan', ['2020-01-01', '2021-01-01', '2022-01-01']),
    ];
    const result = tripsPerYear(visits);
    expect(result).toHaveLength(3);
    expect(result[0].year).toBe(2020);
    expect(result[2].year).toBe(2022);
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
