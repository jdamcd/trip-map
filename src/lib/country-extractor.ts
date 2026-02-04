import { v4 as uuidv4 } from 'uuid';
import type { CalendarEvent, CountryVisit, VisitEntry } from '../types';
import { airportToCountry, cityToCountry, trainStationToCountry } from '../data/location-codes';
import { countryByCode, countries } from '../data/countries';

// Patterns to identify travel-related events
const FLIGHT_KEYWORDS = [
  'flight', 'flying', 'fly to', 'depart', 'arrive', 'airline',
  'airways', 'air ', 'boarding', 'takeoff', 'landing'
];

const HOTEL_KEYWORDS = [
  'hotel', 'resort', 'hostel', 'airbnb', 'booking', 'check-in',
  'check in', 'checkout', 'check out', 'accommodation', 'stay at',
  // Major chains
  'marriott', 'hilton', 'hyatt', 'sheraton', 'westin', 'radisson',
  'holiday inn', 'best western', 'ibis', 'novotel', 'accor', 'ihg',
  // Luxury
  'ritz', 'four seasons', 'mandarin oriental', 'peninsula', 'st. regis',
  'st regis', 'w hotel', 'waldorf', 'fairmont', 'sofitel', 'intercontinental',
  // Mid-range
  'le meridien', 'crowne plaza', 'doubletree', 'hampton inn', 'courtyard',
  'residence inn', 'embassy suites', 'homewood suites',
  // Budget
  'travelodge', 'premier inn', 'motel 6', 'super 8', 'la quinta'
];

const TRAVEL_KEYWORDS = [
  'trip', 'travel', 'vacation', 'holiday', 'visit',
  'excursion', 'journey', 'abroad'
];

// Keywords indicating virtual/remote events (not actual travel)
const VIRTUAL_KEYWORDS = [
  'virtual', 'online', 'remote', 'zoom', 'teams', 'webinar',
  'video call', 'conference call', 'webex', 'google meet'
];

// Pre-compiled regex patterns for performance (built once at module load)
function buildKeywordRegex(keywords: string[]): RegExp {
  const escaped = keywords.map(kw => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`\\b(${escaped.join('|')})\\b`, 'i');
}

const FLIGHT_REGEX = buildKeywordRegex(FLIGHT_KEYWORDS);
const HOTEL_REGEX = buildKeywordRegex(HOTEL_KEYWORDS);
const TRAVEL_REGEX = buildKeywordRegex(TRAVEL_KEYWORDS);
const VIRTUAL_REGEX = buildKeywordRegex(VIRTUAL_KEYWORDS);

// Pre-build country and city lookup structures for fast matching
const COUNTRY_NAMES_LOWER = countries.map(c => c.name.toLowerCase());
const COUNTRY_REGEX = buildKeywordRegex(countries.map(c => c.name));
const CITY_ENTRIES = Object.entries(cityToCountry);
const CITY_REGEX = buildKeywordRegex(CITY_ENTRIES.filter(([city]) => city.length > 2).map(([city]) => city));
const SHORT_CITY_CODES = new Map(CITY_ENTRIES.filter(([city]) => city.length <= 2));
const TRAIN_STATION_REGEX = buildKeywordRegex(Object.keys(trainStationToCountry));

// US states and Canadian provinces that share city names with international destinations
const DISAMBIGUATION_PATTERNS: Record<string, string[]> = {
  // US states (full names and abbreviations)
  paris: ['texas', 'tx', 'tennessee', 'tn', 'kentucky', 'ky', 'illinois', 'il', 'maine', 'me'],
  dublin: ['ohio', 'oh', 'california', 'ca', 'georgia', 'ga', 'texas', 'tx'],
  london: ['ontario', 'on', 'kentucky', 'ky', 'ohio', 'oh'],
  athens: ['georgia', 'ga', 'ohio', 'oh', 'texas', 'tx', 'alabama', 'al'],
  rome: ['georgia', 'ga', 'new york', 'ny'],
  venice: ['california', 'ca', 'florida', 'fl', 'louisiana', 'la'],
  florence: ['south carolina', 'sc', 'alabama', 'al', 'kentucky', 'ky'],
  milan: ['michigan', 'mi', 'ohio', 'oh', 'tennessee', 'tn'],
  naples: ['florida', 'fl'],
  cambridge: ['massachusetts', 'ma', 'ontario', 'on', 'ohio', 'oh'],
  oxford: ['mississippi', 'ms', 'ohio', 'oh', 'alabama', 'al'],
  barcelona: ['new york', 'ny'],
};

// City names that are part of longer compound city names
// Maps short name -> longer compound names that take precedence
const COMPOUND_CITY_NAMES: Record<string, string[]> = {
  york: ['new york'],
  orleans: ['new orleans'],
  jersey: ['new jersey'],
  delhi: ['new delhi'],
};

// Major international airline IATA/ICAO codes for flight number validation
const AIRLINE_CODES = new Set([
  // North America
  'AA', 'UA', 'DL', 'WN', 'B6', 'AS', 'NK', 'F9', 'HA', // US
  'AC', 'WS', 'TS', // Canada
  'AM', 'VB', // Mexico
  // Europe - Flag carriers
  'BA', 'VS', 'AF', 'LH', 'KL', 'IB', 'AZ', 'SK', 'AY', 'LX', 'OS', 'SN', 'TP', 'EI',
  'LO', 'OK', 'RO', 'BT', 'OU', 'JU', 'PS', 'SU', 'FI', 'DY', 'A3', 'UX',
  // Europe - Low cost
  'FR', 'U2', 'W6', 'VY', 'EW', 'HV', 'LS', 'BY', 'ZT',
  // Middle East & Africa
  'EK', 'QR', 'EY', 'TK', 'MS', 'GF', 'WY', 'SV', 'RJ', 'ME', 'KU', 'PC',
  'ET', 'SA', 'KQ', 'AT', 'WB',
  // Asia - East
  'CX', 'SQ', 'JL', 'NH', 'KE', 'OZ', 'CI', 'BR', 'PR', 'MH', 'TG', 'VN',
  'GA', 'BI', '5J', 'AK', 'FD', 'QZ',
  'CA', 'MU', 'CZ', 'HU', '3U', 'ZH', 'MF', 'SC', // China
  // Asia - South
  'AI', 'UK', '6E', 'SG', 'G8', // India
  'PK', 'UL', 'BG', 'RA', // South Asia
  // Oceania
  'QF', 'NZ', 'VA', 'JQ', 'FJ',
  // Latin America
  'LA', 'AV', 'CM', 'G3', 'AD', 'AR', 'H2',
  // 3-letter ICAO codes (some booking systems use these)
  'SIA', 'UAE', 'ETD', 'QTR', 'THY', 'KAL', 'CAL', 'EVA', 'ANA',
  'EZY', 'EJU', 'RYR', 'BAW', 'DLH', 'AFR', 'KLM', 'DAL', 'AAL', 'UAL',
  // Defunct airlines (for historical calendar imports)
  'AB', 'ZB', 'MT', 'BE', 'VX', 'WW', '9W', 'IG', '4U',
]);

// Check if a short city name should be skipped because a compound form exists in the text
function isPartOfCompoundCity(text: string, cityName: string): boolean {
  const lowerText = text.toLowerCase();
  const compounds = COMPOUND_CITY_NAMES[cityName.toLowerCase()];
  if (!compounds) return false;

  for (const compound of compounds) {
    if (matchesWholeWord(lowerText, compound)) {
      return true;
    }
  }
  return false;
}

// Pre-compiled regexes for airport codes and flight numbers
const AIRPORT_CODE_REGEX = /(?:^|[^A-Za-z0-9])([A-Z]{3})(?:[^A-Za-z0-9]|$)/g;
const THREE_LETTER_EXTRACT = /[A-Z]{3}/;
const FLIGHT_NUMBER_REGEX = /\b([A-Z]{2,3})(\d{1,4})\b/g;

function extractAirportCodes(text: string): string[] {
  // Quick check - must have at least one 3-letter uppercase sequence
  if (!/[A-Z]{3}/.test(text)) return [];

  AIRPORT_CODE_REGEX.lastIndex = 0; // Reset regex state
  const matches = text.match(AIRPORT_CODE_REGEX) || [];
  return matches
    .map((match) => match.match(THREE_LETTER_EXTRACT)?.[0])
    .filter((code): code is string => code !== undefined && code in airportToCountry);
}

// Detect flight number patterns like BA123, UA1234, EK5
function hasFlightNumber(text: string): boolean {
  // Quick check - must have uppercase letter followed by digit
  if (!/[A-Z]\d/.test(text)) return false;

  FLIGHT_NUMBER_REGEX.lastIndex = 0; // Reset regex state
  let match;
  while ((match = FLIGHT_NUMBER_REGEX.exec(text)) !== null) {
    if (AIRLINE_CODES.has(match[1])) {
      return true;
    }
  }
  return false;
}

// Check if a city name is followed by a US state or Canadian province
function isDisambiguatedCity(text: string, cityName: string): boolean {
  const lowerText = text.toLowerCase();
  const patterns = DISAMBIGUATION_PATTERNS[cityName.toLowerCase()];
  if (!patterns) return false;

  // Look for patterns like "Paris, Texas" or "Paris TX" or "Paris, TX"
  for (const pattern of patterns) {
    const regex = new RegExp(`\\b${cityName}\\s*,?\\s*${pattern}\\b`, 'i');
    if (regex.test(lowerText)) {
      return true;
    }
  }
  return false;
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

// Fast check for any location name (used for quick filtering)
function hasLocationNameFast(text: string): boolean {
  if (COUNTRY_REGEX.test(text)) return true;
  if (CITY_REGEX.test(text)) return true;
  if (TRAIN_STATION_REGEX.test(text)) return true;
  // Check 2-letter city codes (require uppercase)
  for (const [code] of SHORT_CITY_CODES) {
    if (text.includes(code)) return true;
  }
  return false;
}

function extractCountriesFromText(text: string, originalText?: string): string[] {
  const lowerText = text.toLowerCase();
  const fullText = originalText || text;
  const foundCountries = new Set<string>();

  // Use pre-compiled regex for initial fast check, then identify specific matches
  if (COUNTRY_REGEX.test(fullText)) {
    for (let i = 0; i < countries.length; i++) {
      if (lowerText.includes(COUNTRY_NAMES_LOWER[i])) {
        // Verify with word boundary check
        if (matchesWholeWord(lowerText, COUNTRY_NAMES_LOWER[i])) {
          foundCountries.add(countries[i].code);
        }
      }
    }
  }

  // Check cities - use includes() as fast pre-filter
  for (const [city, countryCode] of CITY_ENTRIES) {
    if (city.length <= 2) {
      // For 2-letter abbreviations, require uppercase
      if (fullText.includes(city.toUpperCase())) {
        foundCountries.add(countryCode);
      }
    } else if (lowerText.includes(city.toLowerCase())) {
      // Fast pre-filter passed, now verify with word boundary
      if (matchesWholeWord(lowerText, city)) {
        if (isPartOfCompoundCity(fullText, city)) continue;
        if (!isDisambiguatedCity(fullText, city)) {
          foundCountries.add(countryCode);
        }
      }
    }
  }

  // Check train stations with fast pre-filter
  for (const [station, countryCode] of Object.entries(trainStationToCountry)) {
    const stationLower = station.toLowerCase();
    if (lowerText.includes(stationLower) && matchesWholeWord(lowerText, stationLower)) {
      foundCountries.add(countryCode);
    }
  }

  return Array.from(foundCountries);
}

function isTravelEvent(event: CalendarEvent): boolean {
  const fullText = `${event.summary} ${event.description || ''} ${event.location || ''}`;

  // Skip virtual/remote events even if they mention a location (fast regex check)
  if (VIRTUAL_REGEX.test(fullText)) {
    return false;
  }

  // Fast checks using pre-compiled regexes - return early on first match
  if (FLIGHT_REGEX.test(fullText)) return true;
  if (HOTEL_REGEX.test(fullText)) return true;
  if (TRAVEL_REGEX.test(fullText)) return true;
  if (extractAirportCodes(fullText).length > 0) return true;
  if (hasFlightNumber(event.summary)) return true;

  // Only do expensive location check for multi-day events
  const isMultiDay = event.endDate
    ? event.endDate.getTime() - event.startDate.getTime() > 24 * 60 * 60 * 1000
    : false;

  if (!isMultiDay) return false;

  return hasLocationNameFast(fullText);
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

  const countriesFromText = extractCountriesFromText(fullText.toLowerCase(), fullText);
  countriesFromText.forEach(code => countryCodes.add(code));

  if (event.location) {
    const countriesFromLocation = extractCountriesFromText(event.location.toLowerCase(), event.location);
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

export function extractCountryVisits(
  events: CalendarEvent[],
  onProgress?: (processed: number, total: number) => void
): CountryVisit[] {
  const visitMap = new Map<string, CountryVisit>();
  const total = events.length;
  let lastProgressTime = 0;
  const PROGRESS_INTERVAL_MS = 100; // Update every 100ms max

  for (let i = 0; i < events.length; i++) {
    const event = events[i];

    // Report progress based on time, not count (prevents batching issues)
    if (onProgress) {
      const now = Date.now();
      if (now - lastProgressTime >= PROGRESS_INTERVAL_MS) {
        onProgress(i, total);
        lastProgressTime = now;
      }
    }

    if (!isTravelEvent(event)) {
      continue;
    }

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

  // Final progress update
  if (onProgress) {
    onProgress(total, total);
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
