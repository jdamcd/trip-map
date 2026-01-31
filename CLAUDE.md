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
```

## Architecture

### Core Flow
1. User imports calendar (.ics file or pasted iCal data)
2. `calendar-parser.ts` parses iCal format using ical.js
3. `country-extractor.ts` detects travel events and extracts countries
4. Visits are stored in localStorage and displayed on map

### Key Files

- `src/App.tsx` - Main application component, state management
- `src/components/WorldMap.tsx` - MapBox GL map with country highlighting
- `src/components/VisitList.tsx` - Sortable list of visited countries
- `src/components/CalendarInput.tsx` - File upload and paste input for calendar data
- `src/lib/calendar-parser.ts` - iCal parsing using ical.js
- `src/lib/country-extractor.ts` - Travel event detection and country extraction
- `src/lib/storage.ts` - localStorage persistence and JSON export/import
- `src/data/airport-codes.ts` - IATA codes and city name mappings
- `src/data/countries.ts` - Country code to name mappings

### Data Types (src/types.ts)

- `CountryVisit` - A country with multiple visit entries
- `VisitEntry` - A single trip with dates and source
- `CalendarEvent` - Parsed calendar event
- `DateRange` - Start/end date filter

## Testing

Tests are in `src/lib/country-extractor.test.ts` covering:
- Airport code extraction
- Country/city name matching
- French "la" false positive prevention (2-letter codes require uppercase)
- Travel event detection
- Visit merging logic

## Environment Variables

- `VITE_MAPBOX_TOKEN` - Required MapBox access token for the map

## Notes

- The app uses Tailwind CSS v4 with the Vite plugin
- MapBox country boundaries use ISO 3166-1 alpha-2 codes
- 2-letter city abbreviations (LA, SF, DC) require uppercase to avoid false positives
