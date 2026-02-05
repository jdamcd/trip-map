import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseICalData } from '../src/lib/calendar-parser';
import { extractCountryVisits } from '../src/lib/country-extractor';

const icsData = readFileSync(join(process.cwd(), 'test-calendar.ics'), 'utf-8');
const visits = extractCountryVisits(parseICalData(icsData));
const storageData = JSON.stringify({ visits, version: 1 });

test('populated map matches snapshot', async ({ page }) => {
  await page.addInitScript((data) => {
    localStorage.setItem('trip-map-visits', data);
  }, storageData);

  await page.goto('/');
  await page.waitForSelector('canvas.mapboxgl-canvas');
  await page.waitForTimeout(2000);

  await expect(page).toHaveScreenshot('populated-map.png', {
    maxDiffPixels: 500,
  });
});

test('empty map matches snapshot', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('canvas.mapboxgl-canvas');
  await page.waitForTimeout(2000);

  await expect(page).toHaveScreenshot('empty-map.png', {
    maxDiffPixels: 500,
  });
});
