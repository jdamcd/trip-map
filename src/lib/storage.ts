import type { CountryVisit } from '../types';

const STORAGE_KEY = 'trip-map-visits';
const HOME_COUNTRY_KEY = 'trip-map-home-country';

interface StoredData {
  visits: CountryVisit[];
  version: number;
}

export function saveVisits(visits: CountryVisit[]): void {
  const data: StoredData = {
    visits,
    version: 1,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadVisits(): CountryVisit[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const data: StoredData = JSON.parse(raw);
    return data.visits || [];
  } catch (e) {
    console.warn('Failed to parse stored visits:', e);
    return [];
  }
}

export function clearVisits(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function saveHomeCountry(countryCode: string): void {
  localStorage.setItem(HOME_COUNTRY_KEY, countryCode);
}

export function loadHomeCountry(): string {
  return localStorage.getItem(HOME_COUNTRY_KEY) || 'GB';
}

export function exportToJson(visits: CountryVisit[]): string {
  const data = {
    exportDate: new Date().toISOString(),
    visits,
  };
  return JSON.stringify(data, null, 2);
}

export function downloadJson(visits: CountryVisit[]): void {
  const json = exportToJson(visits);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `trip-map-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importFromJson(file: File): Promise<CountryVisit[]> {
  const text = await file.text();
  const data = JSON.parse(text);

  if (Array.isArray(data.visits)) {
    return data.visits;
  } else if (Array.isArray(data)) {
    return data;
  }

  throw new Error('Invalid file format');
}
