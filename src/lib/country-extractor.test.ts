import { describe, it, expect } from 'vitest';
import { extractCountryVisits, mergeVisits, createManualVisit } from './country-extractor';
import type { CalendarEvent, CountryVisit } from '../types';

function createEvent(props: Omit<CalendarEvent, 'uid'>): CalendarEvent {
  return { uid: crypto.randomUUID(), ...props };
}

describe('extractCountryVisits', () => {
  it('extracts country from airport code in event summary', () => {
    const events: CalendarEvent[] = [
      createEvent({
        summary: 'Flight to JFK',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-15'),
      }),
    ];
    const visits = extractCountryVisits(events);
    expect(visits).toHaveLength(1);
    expect(visits[0].countryCode).toBe('US');
  });

  it('extracts country from airport code in description', () => {
    const events: CalendarEvent[] = [
      createEvent({
        summary: 'Flight',
        description: 'Departing from LHR terminal 5',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-15'),
      }),
    ];
    const visits = extractCountryVisits(events);
    expect(visits).toHaveLength(1);
    expect(visits[0].countryCode).toBe('GB');
  });

  it('extracts country from country name in event', () => {
    const events: CalendarEvent[] = [
      createEvent({
        summary: 'Trip to Japan',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-20'),
      }),
    ];
    const visits = extractCountryVisits(events);
    expect(visits).toHaveLength(1);
    expect(visits[0].countryCode).toBe('JP');
    expect(visits[0].countryName).toBe('Japan');
  });

  it('extracts country from city name', () => {
    const events: CalendarEvent[] = [
      createEvent({
        summary: 'Hotel in Paris',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-18'),
      }),
    ];
    const visits = extractCountryVisits(events);
    expect(visits).toHaveLength(1);
    expect(visits[0].countryCode).toBe('FR');
  });

  it('does not match French article "la" as Los Angeles', () => {
    const events: CalendarEvent[] = [
      createEvent({
        summary: 'Réunion à la maison',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-20'),
      }),
    ];
    const visits = extractCountryVisits(events);
    // Should not match because "la" is lowercase (French article)
    // Even though it's multi-day, no country/location is detected
    expect(visits).toHaveLength(0);
  });

  it('matches uppercase LA as Los Angeles', () => {
    const events: CalendarEvent[] = [
      createEvent({
        summary: 'Flight to LA',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-15'),
      }),
    ];
    const visits = extractCountryVisits(events);
    expect(visits).toHaveLength(1);
    expect(visits[0].countryCode).toBe('US');
  });

  it('matches SF as San Francisco', () => {
    const events: CalendarEvent[] = [
      createEvent({
        summary: 'Trip to SF',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-20'),
      }),
    ];
    const visits = extractCountryVisits(events);
    expect(visits).toHaveLength(1);
    expect(visits[0].countryCode).toBe('US');
  });

  it('detects hotel bookings', () => {
    const events: CalendarEvent[] = [
      createEvent({
        summary: 'Marriott Hotel Rome',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-18'),
      }),
    ];
    const visits = extractCountryVisits(events);
    expect(visits).toHaveLength(1);
    expect(visits[0].countryCode).toBe('IT');
  });

  it('ignores non-travel events', () => {
    const events: CalendarEvent[] = [
      createEvent({
        summary: 'Team meeting',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-15'),
      }),
    ];
    const visits = extractCountryVisits(events);
    expect(visits).toHaveLength(0);
  });

  it('detects flight numbers as travel indicator', () => {
    const events: CalendarEvent[] = [
      createEvent({
        summary: 'BA175 to New York',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-15'),
      }),
    ];
    const visits = extractCountryVisits(events);
    expect(visits).toHaveLength(1);
    expect(visits[0].countryCode).toBe('US');
  });

  it('ignores virtual events even with location mentions', () => {
    const events: CalendarEvent[] = [
      createEvent({
        summary: 'Virtual meeting with Paris team',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-20'),
      }),
    ];
    const visits = extractCountryVisits(events);
    expect(visits).toHaveLength(0);
  });

  it('ignores Zoom calls even with location mentions', () => {
    const events: CalendarEvent[] = [
      createEvent({
        summary: 'Zoom call with Tokyo office',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-20'),
      }),
    ];
    const visits = extractCountryVisits(events);
    expect(visits).toHaveLength(0);
  });

  it('does not match Paris, Texas as France', () => {
    const events: CalendarEvent[] = [
      createEvent({
        summary: 'Trip to Paris, Texas',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-18'),
      }),
    ];
    const visits = extractCountryVisits(events);
    // Should not match France because of ", Texas" disambiguation
    expect(visits).toHaveLength(0);
  });

  it('does not match Dublin, Ohio as Ireland', () => {
    const events: CalendarEvent[] = [
      createEvent({
        summary: 'Conference in Dublin OH',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-18'),
      }),
    ];
    const visits = extractCountryVisits(events);
    expect(visits).toHaveLength(0);
  });

  it('does not match York (GB) when New York is in the text', () => {
    const events: CalendarEvent[] = [
      createEvent({
        summary: 'Trip to New York',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-20'),
      }),
    ];
    const visits = extractCountryVisits(events);
    expect(visits).toHaveLength(1);
    expect(visits[0].countryCode).toBe('US');
  });

  it('only detects flight numbers in summary, not description or location', () => {
    const events: CalendarEvent[] = [
      createEvent({
        summary: 'Local event',
        description: 'Reference: AB123',
        location: '123 Main St, London SW1A 1AA',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-15'),
      }),
    ];
    const visits = extractCountryVisits(events);
    expect(visits).toHaveLength(0);
  });

  it('only matches flight numbers from known airline codes', () => {
    const events: CalendarEvent[] = [
      createEvent({
        summary: 'BA123 to New York', // Valid airline code
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-15'),
      }),
      createEvent({
        summary: 'XY456 to Paris', // Invalid airline code
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-15'),
      }),
    ];
    const visits = extractCountryVisits(events);
    expect(visits).toHaveLength(1);
    expect(visits[0].countryCode).toBe('US');
  });

  it('detects train stations as travel indicator', () => {
    const events: CalendarEvent[] = [
      createEvent({
        summary: 'Eurostar from St Pancras',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-18'),
      }),
    ];
    const visits = extractCountryVisits(events);
    expect(visits).toHaveLength(1);
    expect(visits[0].countryCode).toBe('GB');
  });

  it('detects Gare du Nord as France', () => {
    const events: CalendarEvent[] = [
      createEvent({
        summary: 'Arriving at Gare du Nord',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-18'),
      }),
    ];
    const visits = extractCountryVisits(events);
    expect(visits).toHaveLength(1);
    expect(visits[0].countryCode).toBe('FR');
  });

  it('merges overlapping entries for the same country', () => {
    const events: CalendarEvent[] = [
      createEvent({
        summary: 'Flight to CDG',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-15'),
      }),
      createEvent({
        summary: 'Hotel in Paris',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-18'),
      }),
    ];
    const visits = extractCountryVisits(events);
    expect(visits).toHaveLength(1);
    expect(visits[0].countryCode).toBe('FR');
    expect(visits[0].entries).toHaveLength(1);
  });
});

describe('mergeVisits', () => {
  it('merges visits from different countries', () => {
    const existing: CountryVisit[] = [
      {
        countryCode: 'FR',
        countryName: 'France',
        entries: [
          {
            id: 'e1',
            startDate: '2024-01-15T00:00:00.000Z',
            endDate: '2024-01-18T00:00:00.000Z',
            source: 'calendar',
          },
        ],
      },
    ];
    const newVisits: CountryVisit[] = [
      {
        countryCode: 'IT',
        countryName: 'Italy',
        entries: [
          {
            id: 'e2',
            startDate: '2024-02-01T00:00:00.000Z',
            endDate: '2024-02-05T00:00:00.000Z',
            source: 'calendar',
          },
        ],
      },
    ];
    const merged = mergeVisits(existing, newVisits);
    expect(merged).toHaveLength(2);
  });

  it('adds new entries to existing country', () => {
    const existing: CountryVisit[] = [
      {
        countryCode: 'FR',
        countryName: 'France',
        entries: [
          {
            id: 'e1',
            startDate: '2024-01-15T00:00:00.000Z',
            endDate: '2024-01-18T00:00:00.000Z',
            source: 'calendar',
          },
        ],
      },
    ];
    const newVisits: CountryVisit[] = [
      {
        countryCode: 'FR',
        countryName: 'France',
        entries: [
          {
            id: 'e2',
            startDate: '2024-06-01T00:00:00.000Z',
            endDate: '2024-06-05T00:00:00.000Z',
            source: 'calendar',
          },
        ],
      },
    ];
    const merged = mergeVisits(existing, newVisits);
    expect(merged).toHaveLength(1);
    expect(merged[0].entries).toHaveLength(2);
  });

  it('skips duplicate entries', () => {
    const existing: CountryVisit[] = [
      {
        countryCode: 'FR',
        countryName: 'France',
        entries: [
          {
            id: 'e1',
            startDate: '2024-01-15T00:00:00.000Z',
            endDate: '2024-01-18T00:00:00.000Z',
            source: 'calendar',
            eventTitle: 'Paris Trip',
          },
        ],
      },
    ];
    const newVisits: CountryVisit[] = [
      {
        countryCode: 'FR',
        countryName: 'France',
        entries: [
          {
            id: 'e2',
            startDate: '2024-01-15T00:00:00.000Z',
            endDate: '2024-01-18T00:00:00.000Z',
            source: 'calendar',
            eventTitle: 'Paris Trip',
          },
        ],
      },
    ];
    const merged = mergeVisits(existing, newVisits);
    expect(merged).toHaveLength(1);
    expect(merged[0].entries).toHaveLength(1);
  });
});

describe('createManualVisit', () => {
  it('creates a visit with country info', () => {
    const visit = createManualVisit('JP', '2024-01-15T00:00:00.000Z', '2024-01-20T00:00:00.000Z');
    expect(visit).not.toBeNull();
    expect(visit!.countryCode).toBe('JP');
    expect(visit!.countryName).toBe('Japan');
    expect(visit!.entries).toHaveLength(1);
    expect(visit!.entries[0].source).toBe('manual');
  });

  it('returns null for invalid country code', () => {
    const visit = createManualVisit('XX', '2024-01-15T00:00:00.000Z');
    expect(visit).toBeNull();
  });

  it('stores note as eventTitle when provided', () => {
    const visit = createManualVisit('JP', '2024-01-15T00:00:00.000Z', undefined, 'Summer holiday');
    expect(visit).not.toBeNull();
    expect(visit!.entries[0].eventTitle).toBe('Summer holiday');
  });

  it('omits eventTitle when note not provided', () => {
    const visit = createManualVisit('JP', '2024-01-15T00:00:00.000Z');
    expect(visit).not.toBeNull();
    expect(visit!.entries[0].eventTitle).toBeUndefined();
  });
});
