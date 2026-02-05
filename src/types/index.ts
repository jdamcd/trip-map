export interface VisitEntry {
  id: string;
  startDate: string;
  endDate?: string;
  source: 'calendar' | 'manual';
  eventTitle?: string;
}

export interface CountryVisit {
  countryCode: string; // ISO 3166-1 alpha-2
  countryName: string;
  entries: VisitEntry[];
}

export interface CalendarEvent {
  uid: string;
  summary: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface AppState {
  visits: CountryVisit[];
  dateRange: DateRange;
}
