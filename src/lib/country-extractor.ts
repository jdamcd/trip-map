import { v4 as uuidv4 } from 'uuid';
import type { CalendarEvent, CountryVisit, VisitEntry } from '../types';
import { airportToCountry, cityToCountry } from '../data/airport-codes';
import { countryByCode, countries } from '../data/countries';

// Patterns to identify travel-related events
const FLIGHT_KEYWORDS = [
  'flight', 'flying', 'fly to', 'depart', 'arrive', 'airline',
  'airways', 'air ', 'boarding', 'takeoff', 'landing'
];

const HOTEL_KEYWORDS = [
  'hotel', 'resort', 'hostel', 'airbnb', 'booking', 'check-in',
  'check in', 'checkout', 'check out', 'accommodation', 'stay at',
  'marriott', 'hilton', 'hyatt', 'sheraton', 'westin', 'radisson',
  'holiday inn', 'best western', 'ibis', 'novotel', 'accor', 'ihg'
];

const TRAVEL_KEYWORDS = [
  'trip', 'travel', 'vacation', 'holiday', 'visit', 'tour',
  'excursion', 'journey', 'abroad'
];

function extractAirportCodes(text: string): string[] {
  const matches = text.match(/(?:^|[^A-Za-z0-9])([A-Z]{3})(?:[^A-Za-z0-9]|$)/g) || [];
  return matches
    .map((match) => match.match(/[A-Z]{3}/)?.[0])
    .filter((code): code is string => code !== undefined && code in airportToCountry);
}

function normalizeText(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function matchesWholeWord(text: string, word: string, caseSensitive = false): boolean {
  const normalizedText = normalizeText(text);
  const normalizedWord = normalizeText(word);
  const flags = caseSensitive ? '' : 'i';
  const regex = new RegExp(`\\b${normalizedWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, flags);
  return regex.test(normalizedText);
}

function extractCountriesFromText(text: string): string[] {
  const lowerText = text.toLowerCase();
  const foundCountries = new Set<string>();

  for (const country of countries) {
    if (matchesWholeWord(lowerText, country.name.toLowerCase())) {
      foundCountries.add(country.code);
    }
  }

  for (const [city, countryCode] of Object.entries(cityToCountry)) {
    // For 2-letter abbreviations (like LA, SF, DC), require uppercase in original text
    // to avoid false positives with common words (e.g., French "la")
    if (city.length <= 2) {
      if (matchesWholeWord(text, city.toUpperCase(), true)) {
        foundCountries.add(countryCode);
      }
    } else if (matchesWholeWord(lowerText, city)) {
      foundCountries.add(countryCode);
    }
  }

  return Array.from(foundCountries);
}

function isTravelEvent(event: CalendarEvent): boolean {
  const searchText = `${event.summary} ${event.description || ''} ${event.location || ''}`.toLowerCase();

  const hasFlightKeyword = FLIGHT_KEYWORDS.some((kw) => matchesWholeWord(searchText, kw));
  const hasHotelKeyword = HOTEL_KEYWORDS.some((kw) => matchesWholeWord(searchText, kw));
  const hasTravelKeyword = TRAVEL_KEYWORDS.some((kw) => matchesWholeWord(searchText, kw));
  const hasAirportCode = extractAirportCodes(
    `${event.summary} ${event.description || ''} ${event.location || ''}`
  ).length > 0;

  if (hasFlightKeyword || hasHotelKeyword || hasTravelKeyword || hasAirportCode) {
    return true;
  }

  const hasLocationName = extractCountriesFromText(searchText).length > 0;
  const isMultiDay = event.endDate
    ? event.endDate.getTime() - event.startDate.getTime() > 24 * 60 * 60 * 1000
    : false;

  return hasLocationName && isMultiDay;
}

function extractCountriesFromEvent(event: CalendarEvent): string[] {
  const countryCodes = new Set<string>();
  const fullText = `${event.summary} ${event.description || ''} ${event.location || ''}`;

  const airportCodes = extractAirportCodes(fullText);
  for (const code of airportCodes) {
    const countryCode = airportToCountry[code];
    if (countryCode) {
      countryCodes.add(countryCode);
    }
  }

  const countriesFromText = extractCountriesFromText(fullText);
  countriesFromText.forEach(code => countryCodes.add(code));

  if (event.location) {
    const countriesFromLocation = extractCountriesFromText(event.location);
    countriesFromLocation.forEach(code => countryCodes.add(code));
  }

  return Array.from(countryCodes);
}

// Buffer in milliseconds for considering dates as overlapping (1 week)
const OVERLAP_BUFFER_MS = 7 * 24 * 60 * 60 * 1000;

function mergeOverlappingEntries(entries: VisitEntry[]): VisitEntry[] {
  if (entries.length <= 1) return entries;

  const sorted = [...entries].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const merged: VisitEntry[] = [];
  let current = { ...sorted[0] };

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];
    const currentEnd = current.endDate
      ? new Date(current.endDate).getTime()
      : new Date(current.startDate).getTime();
    const nextStart = new Date(next.startDate).getTime();

    if (nextStart <= currentEnd + OVERLAP_BUFFER_MS) {
      const nextEnd = next.endDate
        ? new Date(next.endDate).getTime()
        : new Date(next.startDate).getTime();

      if (nextEnd > currentEnd) {
        current.endDate = next.endDate || next.startDate;
      }

      if (next.eventTitle && current.eventTitle) {
        const currentTitles = current.eventTitle.split('; ');
        if (!currentTitles.includes(next.eventTitle)) {
          current.eventTitle = `${current.eventTitle}; ${next.eventTitle}`;
        }
      } else if (next.eventTitle) {
        current.eventTitle = next.eventTitle;
      }
    } else {
      merged.push(current);
      current = { ...next };
    }
  }

  merged.push(current);

  return merged;
}

export function extractCountryVisits(events: CalendarEvent[]): CountryVisit[] {
  const visitMap = new Map<string, CountryVisit>();

  for (const event of events) {
    if (!isTravelEvent(event)) continue;

    const countryCodes = extractCountriesFromEvent(event);

    for (const countryCode of countryCodes) {
      const country = countryByCode[countryCode];
      if (!country) continue;

      const entry: VisitEntry = {
        id: uuidv4(),
        startDate: event.startDate.toISOString(),
        endDate: event.endDate?.toISOString(),
        source: 'calendar',
        eventTitle: event.summary,
      };

      if (visitMap.has(countryCode)) {
        visitMap.get(countryCode)!.entries.push(entry);
      } else {
        visitMap.set(countryCode, {
          id: uuidv4(),
          countryCode,
          countryName: country.name,
          entries: [entry],
        });
      }
    }
  }

  for (const visit of visitMap.values()) {
    visit.entries = mergeOverlappingEntries(visit.entries);
  }

  return Array.from(visitMap.values()).sort((a, b) =>
    a.countryName.localeCompare(b.countryName)
  );
}

export function mergeVisits(
  existing: CountryVisit[],
  newVisits: CountryVisit[]
): CountryVisit[] {
  const merged = new Map<string, CountryVisit>();

  for (const visit of existing) {
    merged.set(visit.countryCode, { ...visit, entries: [...visit.entries] });
  }

  for (const visit of newVisits) {
    if (merged.has(visit.countryCode)) {
      const existing = merged.get(visit.countryCode)!;
      for (const entry of visit.entries) {
        const isDuplicate = existing.entries.some(
          (e) =>
            e.eventTitle === entry.eventTitle &&
            e.startDate === entry.startDate
        );
        if (!isDuplicate) {
          existing.entries.push(entry);
        }
      }
      existing.entries = mergeOverlappingEntries(existing.entries);
    } else {
      merged.set(visit.countryCode, { ...visit, entries: [...visit.entries] });
    }
  }

  return Array.from(merged.values()).sort((a, b) =>
    a.countryName.localeCompare(b.countryName)
  );
}

export function createManualVisit(
  countryCode: string,
  startDate: string,
  endDate?: string
): CountryVisit | null {
  const country = countryByCode[countryCode];
  if (!country) return null;

  return {
    id: uuidv4(),
    countryCode,
    countryName: country.name,
    entries: [
      {
        id: uuidv4(),
        startDate,
        endDate,
        source: 'manual',
      },
    ],
  };
}
