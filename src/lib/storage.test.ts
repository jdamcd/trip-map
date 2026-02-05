// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveVisits,
  loadVisits,
  clearVisits,
  saveHomeCountry,
  loadHomeCountry,
  exportToJson,
  importFromJson,
} from './storage';
import type { CountryVisit } from '../types';

const sampleVisits: CountryVisit[] = [
  {
    countryCode: 'FR',
    countryName: 'France',
    entries: [
      {
        id: '1',
        startDate: '2024-06-01',
        endDate: '2024-06-05',
        source: 'calendar',
        eventTitle: 'Paris trip',
      },
    ],
  },
];

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveVisits / loadVisits', () => {
    it('round-trips visits through localStorage', () => {
      saveVisits(sampleVisits);
      expect(loadVisits()).toEqual(sampleVisits);
    });

    it('returns [] when storage is empty', () => {
      expect(loadVisits()).toEqual([]);
    });

    it('returns [] and warns on corrupt JSON', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      localStorage.setItem('trip-map-visits', '{bad json');
      expect(loadVisits()).toEqual([]);
      expect(warnSpy).toHaveBeenCalledOnce();
      warnSpy.mockRestore();
    });

    it('returns [] when visits field is missing', () => {
      localStorage.setItem('trip-map-visits', JSON.stringify({ version: 1 }));
      expect(loadVisits()).toEqual([]);
    });
  });

  describe('clearVisits', () => {
    it('clears stored visits', () => {
      saveVisits(sampleVisits);
      clearVisits();
      expect(loadVisits()).toEqual([]);
    });
  });

  describe('saveHomeCountry / loadHomeCountry', () => {
    it('round-trips home country', () => {
      saveHomeCountry('US');
      expect(loadHomeCountry()).toBe('US');
    });

    it('returns GB as default', () => {
      expect(loadHomeCountry()).toBe('GB');
    });
  });

  describe('exportToJson', () => {
    it('produces valid JSON with exportDate and visits', () => {
      const json = exportToJson(sampleVisits);
      const parsed = JSON.parse(json);
      expect(parsed.visits).toEqual(sampleVisits);
      expect(typeof parsed.exportDate).toBe('string');
      expect(() => new Date(parsed.exportDate)).not.toThrow();
    });
  });

  describe('importFromJson', () => {
    function makeFile(content: string): File {
      return { text: () => Promise.resolve(content) } as unknown as File;
    }

    it('imports visits from export format', async () => {
      const file = makeFile(JSON.stringify({ visits: sampleVisits }));
      const result = await importFromJson(file);
      expect(result).toEqual(sampleVisits);
    });

    it('imports bare array format', async () => {
      const file = makeFile(JSON.stringify(sampleVisits));
      const result = await importFromJson(file);
      expect(result).toEqual(sampleVisits);
    });

    it('throws on invalid format', async () => {
      const file = makeFile(JSON.stringify({ something: 'else' }));
      await expect(importFromJson(file)).rejects.toThrow('Invalid file format');
    });

    it('throws on invalid JSON', async () => {
      const file = makeFile('{not json');
      await expect(importFromJson(file)).rejects.toThrow();
    });
  });
});
