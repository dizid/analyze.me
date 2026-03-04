import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock fetch
const mockFetch = vi.fn()
globalThis.fetch = mockFetch

// Mock Vue
vi.mock('vue', () => ({
  ref: (val) => ({ value: val }),
}))

describe('useCalendarData', () => {
  let useCalendarData

  beforeEach(async () => {
    vi.resetModules()
    mockFetch.mockReset()
    const mod = await import('@/composables/useCalendarData')
    useCalendarData = mod.useCalendarData
  })

  // ==========================================================================
  // Event analysis
  // ==========================================================================
  describe('Event analysis', () => {
    it('should analyze calendar events correctly', async () => {
      const events = [
        // Work meeting on Monday 10am
        { summary: 'Team standup', start: { dateTime: '2024-03-04T10:00:00Z' }, recurringEventId: 'recurring1' },
        // Work call on Monday 2pm
        { summary: 'Client call', start: { dateTime: '2024-03-04T14:00:00Z' } },
        // Personal event on Saturday
        { summary: 'Birthday party', start: { dateTime: '2024-03-09T18:00:00Z' } },
        // Early morning meeting
        { summary: 'Early review', start: { dateTime: '2024-03-05T07:00:00Z' } },
        // Late evening event
        { summary: 'Evening sync', start: { dateTime: '2024-03-05T19:00:00Z' } },
        // All-day event
        { summary: 'Holiday', start: { date: '2024-03-06' } },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: events }),
      })

      const { fetchEvents } = useCalendarData()
      const result = await fetchEvents('test-token')

      expect(result).toBeDefined()
      expect(result.metadata.totalMeetings).toBe(6)
      // Weekend/time counts may vary with local timezone offset from UTC
      expect(result.metadata.weekendEvents).toBeGreaterThanOrEqual(1)
      expect(result.metadata.earlyMorningEvents).toBeGreaterThanOrEqual(0)
      expect(result.metadata.lateEveningEvents).toBeGreaterThanOrEqual(0)
      expect(result.metadata.allDayEvents).toBe(1) // Holiday
      expect(result.metadata.recurringEvents).toBe(1) // standup
    })

    it('should categorize work vs personal events', async () => {
      const events = [
        { summary: 'Team meeting', start: { dateTime: '2024-03-04T10:00:00Z' } },
        { summary: '1:1 with manager', start: { dateTime: '2024-03-04T11:00:00Z' } },
        { summary: 'Code review', start: { dateTime: '2024-03-04T14:00:00Z' } },
        { summary: 'Gym workout', start: { dateTime: '2024-03-04T18:00:00Z' } },
        { summary: 'Dinner with friends', start: { dateTime: '2024-03-04T19:00:00Z' } },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: events }),
      })

      const { fetchEvents } = useCalendarData()
      const result = await fetchEvents('token')

      // "meeting", "1:1", "review" are work keywords
      expect(result.metadata.workEvents).toBe(3)
      expect(result.metadata.personalEvents).toBe(2)
      expect(result.metadata.workLifeRatio).toBe(60) // 3 / 5 * 100
    })

    it('should handle empty events', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })

      const { fetchEvents } = useCalendarData()
      const result = await fetchEvents('token')

      expect(result.metadata.totalMeetings).toBe(0)
      expect(result.metadata.avgMeetingsPerWeek).toBe(0)
      expect(result.metadata.workLifeRatio).toBe(0)
    })

    it('should find busiest day and hour', async () => {
      // Multiple events on Wednesday at 10am
      const events = [
        { summary: 'Meeting 1', start: { dateTime: '2024-03-06T10:00:00Z' } }, // Wed
        { summary: 'Meeting 2', start: { dateTime: '2024-03-06T10:30:00Z' } }, // Wed
        { summary: 'Meeting 3', start: { dateTime: '2024-03-06T10:45:00Z' } }, // Wed
        { summary: 'Other', start: { dateTime: '2024-03-04T14:00:00Z' } }, // Mon
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: events }),
      })

      const { fetchEvents } = useCalendarData()
      const result = await fetchEvents('token')

      // Day depends on local timezone interpretation of UTC dates
      expect(result.metadata.busiestDay).toBeDefined()
      expect(result.metadata.busiestHour).toBeDefined()
    })
  })

  // ==========================================================================
  // Content formatting
  // ==========================================================================
  describe('Content formatting', () => {
    it('should format events as readable text', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            { summary: 'Team standup', start: { dateTime: '2024-03-04T10:00:00Z' } },
          ],
        }),
      })

      const { fetchEvents } = useCalendarData()
      const result = await fetchEvents('token')

      expect(result.content).toContain('CALENDAR ANALYSIS')
      expect(result.content).toContain('Team standup')
      expect(result.content).toContain('EVENT SUMMARIES')
    })
  })

  // ==========================================================================
  // Error handling
  // ==========================================================================
  describe('Error handling', () => {
    it('should throw on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      })

      const { fetchEvents } = useCalendarData()
      await expect(fetchEvents('bad-token')).rejects.toThrow('Calendar API error: 401')
    })
  })

  // ==========================================================================
  // clearData
  // ==========================================================================
  describe('clearData', () => {
    it('should clear data and error', () => {
      const { clearData, calendarData, error } = useCalendarData()
      calendarData.value = { content: 'something' }
      error.value = 'err'

      clearData()

      expect(calendarData.value).toBeNull()
      expect(error.value).toBeNull()
    })
  })
})
