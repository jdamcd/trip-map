# CLAUDE.md

This file provides guidance for Claude Code (claude.ai/claude-code) when working on this repository.

## Project Overview

tripm.app is a React + TypeScript application that extracts travel history from calendar data and displays visited countries on an interactive world map. All data processing happens client-side with no backend.

## Key Commands

```bash
npm run dev       # Start development server (Vite)
npm run build     # TypeScript check + production build
npm run lint      # ESLint check
npm test          # Run tests in watch mode (Vitest)
npm run test:run  # Run tests once
npm run check     # Pre-commit check: tests, lint, build, e2e
```

## Architecture

### Core Flow
1. User imports calendar (.ics file or pasted iCal data)
2. `calendar-parser.ts` parses iCal format using ical.js
3. `country-extractor.ts` detects travel events and extracts countries
4. Visits are stored in localStorage and displayed on map

### Key Files

- `src/App.tsx` - Main application component, state management, hash-based routing
- `src/components/WorldMap.tsx` - MapBox GL map with country highlighting
- `src/components/VisitList.tsx` - Sortable list of visited countries
- `src/components/CalendarInput.tsx` - File upload, paste, and Google Calendar import
- `src/components/LegalPage.tsx` - Renders privacy policy and terms of service from markdown
- `src/content/privacy.md` - Privacy policy content
- `src/content/terms.md` - Terms of service content
- `src/lib/calendar-parser.ts` - iCal parsing using ical.js
- `src/lib/country-extractor.ts` - Travel event detection and country extraction
- `src/lib/storage.ts` - localStorage persistence and JSON export/import
- `src/data/location-codes.ts` - IATA codes, city names, and train station mappings
- `src/data/countries.ts` - Country code to name mappings

### Data Types (src/types.ts)

- `CountryVisit` - A country with multiple visit entries
- `VisitEntry` - A single trip with dates and source
- `CalendarEvent` - Parsed calendar event
- `DateRange` - Start/end date filter

## Testing

Unit tests in `src/lib/country-extractor.test.ts` cover:
- Airport code and train station detection
- Country/city name matching
- Geographic disambiguation (Paris TX ≠ Paris FR)
- Flight number pattern detection
- Virtual event filtering
- Compound city names (New York vs York)
- 2-letter codes require uppercase (LA, SF, DC)
- Visit merging logic

Integration tests in `src/lib/integration.test.ts` cover:
- Calendar parsing with real .ics fixture
- Full extraction pipeline
- JSON export/import cycle

Test fixture: `test-calendar.ics` contains sample events exercising all matching criteria.

## Environment Variables

- `VITE_MAPBOX_TOKEN` - Required MapBox access token for the map
- `VITE_GOOGLE_CLIENT_ID` - Optional Google OAuth client ID for Google Calendar import

## Notes

- The app uses Tailwind CSS v4 with the Vite plugin
- MapBox country boundaries use ISO 3166-1 alpha-2 codes
- Travel detection uses keywords, airport codes, flight numbers, train stations, and multi-day heuristics
- Virtual/remote events are filtered out even if they mention locations
- US/Canadian cities with international namesakes are disambiguated (e.g., "Paris, TX" won't match France)
- Hash-based routing: `#privacy` and `#terms` show legal pages, all other hashes show the main app
- Legal page content lives in markdown files (`src/content/`) rendered with react-markdown
- Hosted on GitHub Pages — hash routing is used because GH Pages doesn't support SPA path fallback
