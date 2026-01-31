import { useCallback, useEffect, useMemo, useState } from 'react';
import { Map as MapGL, Layer, Source, Popup } from 'react-map-gl/mapbox';
import type { MapLayerMouseEvent } from 'react-map-gl/mapbox';
import type { CountryVisit, VisitEntry } from '../types';
import { format } from 'date-fns';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Country boundaries from Mapbox
const COUNTRY_SOURCE = 'country-boundaries';
const COUNTRY_LAYER = 'country-fills';

interface WorldMapProps {
  visits: CountryVisit[];
  homeCountry?: string;
  onCountryClick?: (countryCode: string) => void;
}

function useDarkMode() {
  const [isDark, setIsDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isDark;
}

export function WorldMap({ visits, homeCountry, onCountryClick }: WorldMapProps) {
  const isDark = useDarkMode();
  const [hoverInfo, setHoverInfo] = useState<{
    longitude: number;
    latitude: number;
    countryName: string;
    countryCode: string;
    visitCount: number;
    dates: string[];
  } | null>(null);

  const visitedCountryCodes = useMemo(
    () => visits.map((v) => v.countryCode),
    [visits]
  );

  const visitsByCode = useMemo(() => {
    const map = new Map<string, CountryVisit>();
    for (const visit of visits) {
      map.set(visit.countryCode, visit);
    }
    return map;
  }, [visits]);

  // Filter expression to highlight visited countries
  const filter = useMemo(
    () => ['in', ['get', 'iso_3166_1'], ['literal', visitedCountryCodes]],
    [visitedCountryCodes]
  );

  const onHover = useCallback(
    (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      if (feature) {
        const countryCode = feature.properties?.iso_3166_1 as string;
        const visit = visitsByCode.get(countryCode);
        if (visit) {
          const sortedEntries = [...visit.entries].sort(
            (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          );
          const dates = sortedEntries.map((e: VisitEntry) => {
            const start = format(new Date(e.startDate), 'MMM d, yyyy');
            const end = e.endDate
              ? format(new Date(e.endDate), 'MMM d, yyyy')
              : null;
            return end && end !== start ? `${start} - ${end}` : start;
          });
          setHoverInfo({
            longitude: event.lngLat.lng,
            latitude: event.lngLat.lat,
            countryName: visit.countryName,
            countryCode,
            visitCount: visit.entries.length,
            dates: dates.slice(0, 5), // Show up to 5 dates
          });
        }
      } else {
        setHoverInfo(null);
      }
    },
    [visitsByCode]
  );

  const onClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      if (feature && onCountryClick) {
        const countryCode = feature.properties?.iso_3166_1;
        if (countryCode && visitsByCode.has(countryCode as string)) {
          onCountryClick(countryCode as string);
        }
      }
    },
    [onCountryClick, visitsByCode]
  );

  const mapStyle = isDark
    ? 'mapbox://styles/mapbox/dark-v11'
    : 'mapbox://styles/mapbox/light-v11';

  return (
    <MapGL
      initialViewState={{
        longitude: 0,
        latitude: 20,
        zoom: 1.75,
      }}
      minZoom={1.75}
      maxZoom={5}
      style={{ width: '100%', height: '100%' }}
      mapStyle={mapStyle}
      mapboxAccessToken={MAPBOX_TOKEN}
      interactiveLayerIds={[COUNTRY_LAYER]}
      onMouseMove={onHover}
      onMouseLeave={() => setHoverInfo(null)}
      onClick={onClick}
    >
      <Source
        id={COUNTRY_SOURCE}
        type="vector"
        url="mapbox://mapbox.country-boundaries-v1"
      >
        <Layer
          id={COUNTRY_LAYER}
          type="fill"
          source-layer="country_boundaries"
          filter={filter}
          paint={{
            'fill-color': '#3b82f6',
            'fill-opacity': 0.6,
          }}
        />
        <Layer
          id="country-borders"
          type="line"
          source-layer="country_boundaries"
          filter={filter}
          paint={{
            'line-color': '#1d4ed8',
            'line-width': 1,
          }}
        />
      </Source>

      {hoverInfo && (
        <Popup
          longitude={hoverInfo.longitude}
          latitude={hoverInfo.latitude}
          closeButton={false}
          closeOnClick={false}
          anchor="bottom"
        >
          <div className="p-1">
            <div className="font-semibold">{hoverInfo.countryName}</div>
            {homeCountry && hoverInfo.countryCode === homeCountry ? (
              <div className="text-sm text-gray-600">Home</div>
            ) : (
              <>
                <div className="text-sm text-gray-600">
                  {hoverInfo.visitCount} trip{hoverInfo.visitCount !== 1 ? 's' : ''}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {hoverInfo.dates.map((date, i) => (
                    <div key={i}>{date}</div>
                  ))}
                  {hoverInfo.visitCount > 5 && (
                    <div className="italic">
                      +{hoverInfo.visitCount - 5} more...
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </Popup>
      )}
    </MapGL>
  );
}
