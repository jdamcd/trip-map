import { test } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseICalData } from '../src/lib/calendar-parser';
import { extractCountryVisits } from '../src/lib/country-extractor';

const icsData = readFileSync(join(process.cwd(), 'test-calendar.ics'), 'utf-8');
const visits = extractCountryVisits(parseICalData(icsData));
const storageData = JSON.stringify({ visits, version: 1 });

test.use({ colorScheme: 'dark' });

test('generate README screenshot', async ({ page }) => {
  await page.addInitScript((data) => {
    localStorage.setItem('trip-map-visits', data);
  }, storageData);

  await page.goto('/');
  await page.waitForSelector('canvas.mapboxgl-canvas');
  await page.waitForTimeout(2000);

  // Sort by trips and expand the top country
  await page.getByRole('button', { name: 'Trips' }).click();
  const countryRows = page.locator('ul.divide-y > li > div.cursor-pointer');
  await countryRows.nth(0).click();

  await page.screenshot({
    path: join(process.cwd(), 'screenshot.png'),
  });
});
