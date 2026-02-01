# tripm.app

A visual travel history based on events in your calendar.

![tripm.app](screenshot.png)

## Features

- **Calendar import**: Import trips from .ics calendar files, or paste iCal data directly
- **Automatic detection**: Extracts travel events based on:
  - Flights and airport codes (JFK, LHR, etc.)
  - Hotel and accommodation bookings
  - Multi-day events with country or city names
  - Travel keywords (flight, hotel, trip, etc.)
- **Map**: View visited countries on an interactive world map
- **Trip management**: Add, edit, and delete trips manually
- **Filters**: Filter trips by date and exclude events from your home country
- **Export/import**: Back up and restore your trip history

## Local development

```bash
# Install dependencies
npm install

# Create .env file with MapBox token
echo "VITE_MAPBOX_TOKEN=your_token_here" > .env

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Privacy & security

**All data is processed locally in your browser.**

- Calendar data is parsed client-side using ical.js
- Trip history is stored in localStorage only
- No user data is sent to any server
- No analytics or tracking

## Tech stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- MapBox GL JS via react-map-gl
- ical.js for calendar parsing

## License

Apache License 2.0 - see [LICENSE](LICENSE) for details.
