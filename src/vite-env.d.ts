/// <reference types="vite/client" />

declare module 'react-map-gl/mapbox' {
  import * as React from 'react';

  export interface ViewState {
    longitude: number;
    latitude: number;
    zoom: number;
    bearing?: number;
    pitch?: number;
    padding?: { top: number; bottom: number; left: number; right: number };
  }

  export interface MapLayerMouseEvent {
    features?: Array<{
      properties?: Record<string, unknown>;
      [key: string]: unknown;
    }>;
    lngLat: { lng: number; lat: number };
    point: { x: number; y: number };
    originalEvent: MouseEvent;
  }

  export interface MapProps {
    initialViewState?: Partial<ViewState>;
    minZoom?: number;
    maxZoom?: number;
    style?: React.CSSProperties;
    mapStyle?: string;
    mapboxAccessToken?: string;
    interactiveLayerIds?: string[];
    onMouseMove?: (event: MapLayerMouseEvent) => void;
    onMouseLeave?: () => void;
    onClick?: (event: MapLayerMouseEvent) => void;
    children?: React.ReactNode;
    [key: string]: unknown;
  }

  export interface SourceProps {
    id: string;
    type: 'vector' | 'raster' | 'geojson' | 'image' | 'video';
    url?: string;
    tiles?: string[];
    data?: object | string;
    children?: React.ReactNode;
  }

  export interface LayerProps {
    id: string;
    type: 'fill' | 'line' | 'symbol' | 'circle' | 'heatmap' | 'fill-extrusion' | 'raster' | 'hillshade' | 'background';
    'source-layer'?: string;
    filter?: unknown[];
    paint?: Record<string, unknown>;
    layout?: Record<string, unknown>;
  }

  export interface PopupProps {
    longitude: number;
    latitude: number;
    anchor?: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    closeButton?: boolean;
    closeOnClick?: boolean;
    children?: React.ReactNode;
  }

  export const Map: React.FC<MapProps>;
  export const Source: React.FC<SourceProps>;
  export const Layer: React.FC<LayerProps>;
  export const Popup: React.FC<PopupProps>;
}
