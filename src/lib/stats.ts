import type { CountryVisit } from '../types';
import { countryToContinent, CONTINENT_NAMES } from '../data/continents';

export interface YearTrips {
  year: number;
  trips: number;
  countries: { code: string; name: string; count: number }[];
}

export interface ContinentStats {
  continent: string;
  visited: number;
  trips: number;
  countryCodes: string[];
}

export function tripsPerYear(visits: CountryVisit[], startYear?: number, endYear?: number): YearTrips[] {
  const byYear = new Map<number, { trips: number; perCountry: Map<string, number> }>();
  for (const visit of visits) {
    for (const entry of visit.entries) {
      const year = new Date(entry.startDate).getFullYear();
      const current = byYear.get(year) ?? { trips: 0, perCountry: new Map<string, number>() };
      current.trips += 1;
      current.perCountry.set(visit.countryCode, (current.perCountry.get(visit.countryCode) ?? 0) + 1);
      byYear.set(year, current);
    }
  }

  if (byYear.size === 0) return [];

  const codeToName = new Map(visits.map((v) => [v.countryCode, v.countryName]));

  const minYear = startYear ?? Math.min(...byYear.keys());
  const maxYear = endYear ?? Math.max(...byYear.keys(), new Date().getFullYear());

  const result: YearTrips[] = [];
  for (let year = minYear; year <= maxYear; year++) {
    const data = byYear.get(year);
    result.push({
      year,
      trips: data?.trips ?? 0,
      countries: data
        ? Array.from(data.perCountry.entries())
            .map(([code, count]) => ({ code, name: codeToName.get(code) ?? code, count }))
            .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
        : [],
    });
  }
  return result;
}

export function continentCoverage(visits: CountryVisit[]): ContinentStats[] {
  const tripsByCode = new Map(visits.map((v) => [v.countryCode, v.entries.length]));
  const stats = new Map<string, { visited: number; trips: number; countryCodes: string[] }>();

  for (const visit of visits) {
    const continent = countryToContinent[visit.countryCode];
    if (!continent) continue;
    const current = stats.get(continent) ?? { visited: 0, trips: 0, countryCodes: [] };
    current.visited += 1;
    current.trips += visit.entries.length;
    current.countryCodes.push(visit.countryCode);
    stats.set(continent, current);
  }

  return CONTINENT_NAMES
    .filter((c) => stats.has(c))
    .map((continent) => {
      const s = stats.get(continent)!;
      return {
        continent,
        visited: s.visited,
        trips: s.trips,
        countryCodes: s.countryCodes.sort(
          (a, b) => (tripsByCode.get(b) ?? 0) - (tripsByCode.get(a) ?? 0),
        ),
      };
    })
    .sort((a, b) => b.visited - a.visited);
}
