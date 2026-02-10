import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toCalendarEvent, fetchCalendarEvents, fetchCalendarList } from './google-calendar';

describe('toCalendarEvent', () => {
  it('converts event with dateTime fields', () => {
    const result = toCalendarEvent({
      id: 'evt1',
      status: 'confirmed',
      summary: 'Flight to London',
      location: 'Heathrow Airport',
      description: 'BA123',
      start: { dateTime: '2024-06-15T10:00:00Z' },
      end: { dateTime: '2024-06-15T14:00:00Z' },
    });

    expect(result).toEqual({
      uid: 'evt1',
      summary: 'Flight to London',
      location: 'Heathrow Airport',
      description: 'BA123',
      startDate: new Date('2024-06-15T10:00:00Z'),
      endDate: new Date('2024-06-15T14:00:00Z'),
    });
  });

  it('converts all-day event with date fields', () => {
    const result = toCalendarEvent({
      id: 'evt2',
      status: 'confirmed',
      summary: 'Hotel in Paris',
      start: { date: '2024-06-15' },
      end: { date: '2024-06-18' },
    });

    expect(result).not.toBeNull();
    expect(result!.uid).toBe('evt2');
    expect(result!.summary).toBe('Hotel in Paris');
    expect(result!.startDate).toEqual(new Date('2024-06-15'));
    expect(result!.endDate).toEqual(new Date('2024-06-18'));
  });

  it('returns null when start date is missing', () => {
    const result = toCalendarEvent({
      id: 'evt3',
      status: 'confirmed',
      summary: 'No dates',
    });

    expect(result).toBeNull();
  });

  it('handles missing optional fields', () => {
    const result = toCalendarEvent({
      id: 'evt4',
      status: 'confirmed',
      start: { dateTime: '2024-06-15T10:00:00Z' },
    });

    expect(result).not.toBeNull();
    expect(result!.summary).toBe('');
    expect(result!.description).toBeUndefined();
    expect(result!.location).toBeUndefined();
    expect(result!.endDate).toBeUndefined();
  });
});

describe('fetchCalendarList', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches and maps calendar list', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            { id: 'primary@gmail.com', summary: 'My Calendar', primary: true },
            { id: 'work@group.v.calendar.google.com', summary: 'Work' },
          ],
        }),
        { status: 200 }
      )
    );

    const calendars = await fetchCalendarList('fake-token');

    expect(calendars).toEqual([
      { id: 'primary@gmail.com', summary: 'My Calendar', primary: true },
      { id: 'work@group.v.calendar.google.com', summary: 'Work', primary: false },
    ]);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/users/me/calendarList'),
      expect.objectContaining({
        headers: { Authorization: 'Bearer fake-token' },
      })
    );
  });

  it('throws on API error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('Unauthorized', { status: 401 })
    );

    await expect(fetchCalendarList('bad-token')).rejects.toThrow('Failed to fetch calendars: 401');
  });
});

describe('fetchCalendarEvents', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches events and filters cancelled', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              id: 'e1',
              status: 'confirmed',
              summary: 'Flight LHR-JFK',
              start: { dateTime: '2024-06-15T10:00:00Z' },
              end: { dateTime: '2024-06-15T18:00:00Z' },
            },
            {
              id: 'e2',
              status: 'cancelled',
              summary: 'Cancelled trip',
              start: { dateTime: '2024-06-20T10:00:00Z' },
            },
          ],
        }),
        { status: 200 }
      )
    );

    const events = await fetchCalendarEvents(
      'token',
      'primary',
      new Date('2024-01-01'),
      new Date('2024-12-31')
    );

    expect(events).toHaveLength(1);
    expect(events[0].summary).toBe('Flight LHR-JFK');
  });

  it('handles pagination', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          items: [
            {
              id: 'e1',
              status: 'confirmed',
              summary: 'Event 1',
              start: { dateTime: '2024-06-15T10:00:00Z' },
            },
          ],
          nextPageToken: 'page2',
        }),
        { status: 200 }
      )
    );

    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          items: [
            {
              id: 'e2',
              status: 'confirmed',
              summary: 'Event 2',
              start: { dateTime: '2024-06-16T10:00:00Z' },
            },
          ],
        }),
        { status: 200 }
      )
    );

    const progressCalls: number[] = [];
    const events = await fetchCalendarEvents(
      'token',
      'primary',
      new Date('2024-01-01'),
      new Date('2024-12-31'),
      (fetched) => progressCalls.push(fetched)
    );

    expect(events).toHaveLength(2);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(progressCalls).toEqual([1, 2]);

    // Verify second call includes pageToken
    const secondCallUrl = fetchSpy.mock.calls[1][0] as string;
    expect(secondCallUrl).toContain('pageToken=page2');
  });

  it('throws on API error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('Forbidden', { status: 403 })
    );

    await expect(
      fetchCalendarEvents('token', 'primary', new Date('2024-01-01'), new Date('2024-12-31'))
    ).rejects.toThrow('Failed to fetch events: 403');
  });
});
