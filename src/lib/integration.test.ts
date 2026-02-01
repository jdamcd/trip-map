import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseICalData } from './calendar-parser';
import { extractCountryVisits } from './country-extractor';
import { exportToJson } from './storage';
import type { CountryVisit } from '../types';

// Read the test fixture - use process.cwd() for CI compatibility
const icsPath = join(process.cwd(), 'test-calendar.ics');
const icsData = readFileSync(icsPath, 'utf-8');

describe('calendar integration', () => {
  const events = parseICalData(icsData);
  const visits = extractCountryVisits(events);

  describe('parseICalData', () => {
    it('parses all events from the fixture', () => {
      expect(events.length).toBeGreaterThanOrEqual(50);
    });

    it('extracts event properties correctly', () => {
      const parisHotel = events.find((e) => e.summary.includes('Hotel de Madeleine'));
      expect(parisHotel).toBeDefined();
      expect(parisHotel!.location).toBe('Paris, France');
      expect(parisHotel!.startDate).toBeInstanceOf(Date);
      expect(parisHotel!.endDate).toBeInstanceOf(Date);
    });
  });

  describe('full pipeline', () => {
    it('extracts expected countries from the fixture', () => {
      const countryCodes = visits.map((v) => v.countryCode);

      // Verify key countries are detected
      const expectedCountries = [
        'FR', 'ES', 'IT', 'JP', 'US', 'GR', 'PT', 'NL', 'DE', 'AT',
        'CH', 'IE', 'HR', 'IS', 'TH', 'SG', 'AE', 'MV', 'BE', 'GB',
      ];
      for (const code of expectedCountries) {
        expect(countryCodes).toContain(code);
      }

      // Sanity check total count
      expect(visits.length).toBeGreaterThanOrEqual(18);
      expect(visits.length).toBeLessThanOrEqual(25);
    });
  });

  describe('export/import cycle', () => {
    it('exports and preserves all visit data', () => {
      const json = exportToJson(visits);
      const parsed = JSON.parse(json);
      const reimported: CountryVisit[] = parsed.visits;

      expect(parsed.exportDate).toBeDefined();
      expect(reimported.length).toBe(visits.length);

      // Verify country codes match
      const originalCodes = visits.map((v) => v.countryCode).sort();
      const reimportedCodes = reimported.map((v) => v.countryCode).sort();
      expect(reimportedCodes).toEqual(originalCodes);

      // Verify entry counts match
      const originalEntryCount = visits.reduce((sum, v) => sum + v.entries.length, 0);
      const reimportedEntryCount = reimported.reduce((sum, v) => sum + v.entries.length, 0);
      expect(reimportedEntryCount).toBe(originalEntryCount);
    });
  });
});
