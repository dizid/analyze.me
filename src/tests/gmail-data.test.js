import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock fetch
const mockFetch = vi.fn()
globalThis.fetch = mockFetch

// Mock Vue
vi.mock('vue', () => ({
  ref: (val) => ({ value: val }),
}))

describe('useGmailData', () => {
  let useGmailData

  beforeEach(async () => {
    vi.resetModules()
    mockFetch.mockReset()
    const mod = await import('@/composables/useGmailData')
    useGmailData = mod.useGmailData
  })

  // ==========================================================================
  // Email fetching and analysis
  // ==========================================================================
  describe('fetchEmails', () => {
    it('should fetch and analyze emails', async () => {
      // Mock message list
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          messages: [
            { id: 'msg1' },
            { id: 'msg2' },
          ],
        }),
      })

      // Mock message details
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          payload: {
            headers: [
              { name: 'Subject', value: 'Hello there' },
              { name: 'From', value: 'alice@example.com' },
              { name: 'To', value: 'bob@example.com' },
              { name: 'Date', value: 'Mon, 4 Mar 2024 10:00:00 +0000' },
            ],
          },
          snippet: 'This is a preview of the email',
          labelIds: ['INBOX'],
        }),
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          payload: {
            headers: [
              { name: 'Subject', value: 'Re: Hello there' },
              { name: 'From', value: 'bob@example.com' },
              { name: 'To', value: 'alice@example.com' },
              { name: 'Date', value: 'Mon, 4 Mar 2024 11:00:00 +0000' },
            ],
          },
          snippet: 'Thanks for the email',
          labelIds: ['SENT'],
        }),
      })

      const { fetchEmails } = useGmailData()
      const result = await fetchEmails('test-token')

      expect(result).toBeDefined()
      expect(result.metadata.totalEmails).toBe(2)
      expect(result.metadata.sentCount).toBe(1)
      expect(result.metadata.receivedCount).toBe(1)
      expect(result.metadata.topCorrespondents.length).toBeGreaterThan(0)
    })

    it('should handle empty message list', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: [] }),
      })

      const { fetchEmails } = useGmailData()
      const result = await fetchEmails('token')

      expect(result.metadata.totalEmails).toBe(0)
      expect(result.metadata.sentCount).toBe(0)
      expect(result.metadata.receivedCount).toBe(0)
    })

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
      })

      const { fetchEmails } = useGmailData()
      await expect(fetchEmails('bad-token')).rejects.toThrow('Gmail API error: 403')
    })

    it('should handle missing messages field', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}), // no messages field
      })

      const { fetchEmails } = useGmailData()
      const result = await fetchEmails('token')

      expect(result.metadata.totalEmails).toBe(0)
    })
  })

  // ==========================================================================
  // Content formatting
  // ==========================================================================
  describe('Content formatting', () => {
    it('should format emails as readable text', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          messages: [{ id: 'msg1' }],
        }),
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          payload: {
            headers: [
              { name: 'Subject', value: 'Test Subject' },
              { name: 'From', value: 'test@example.com' },
            ],
          },
          snippet: 'Email preview text',
          labelIds: ['INBOX'],
        }),
      })

      const { fetchEmails } = useGmailData()
      const result = await fetchEmails('token')

      expect(result.content).toContain('EMAIL COMMUNICATION ANALYSIS')
      expect(result.content).toContain('Test Subject')
      expect(result.content).toContain('RECEIVED')
    })
  })

  // ==========================================================================
  // Top correspondents
  // ==========================================================================
  describe('Top correspondents', () => {
    it('should identify frequent correspondents', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          messages: [{ id: '1' }, { id: '2' }, { id: '3' }],
        }),
      })

      // 3 emails from same person
      for (let i = 0; i < 3; i++) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            payload: {
              headers: [
                { name: 'Subject', value: `Email ${i}` },
                { name: 'From', value: 'frequent@example.com' },
              ],
            },
            snippet: 'text',
            labelIds: ['INBOX'],
          }),
        })
      }

      const { fetchEmails } = useGmailData()
      const result = await fetchEmails('token')

      expect(result.metadata.topCorrespondents[0].email).toBe('frequent@example.com')
      expect(result.metadata.topCorrespondents[0].count).toBe(3)
    })

    it('should extract email from angle brackets', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          messages: [{ id: '1' }],
        }),
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          payload: {
            headers: [
              { name: 'Subject', value: 'Test' },
              { name: 'From', value: 'John Doe <john@example.com>' },
            ],
          },
          snippet: 'text',
          labelIds: ['INBOX'],
        }),
      })

      const { fetchEmails } = useGmailData()
      const result = await fetchEmails('token')

      expect(result.metadata.topCorrespondents[0].email).toBe('john@example.com')
    })
  })

  // ==========================================================================
  // clearData
  // ==========================================================================
  describe('clearData', () => {
    it('should clear email data and error', () => {
      const { clearData, emailData, error } = useGmailData()
      emailData.value = { content: 'test' }
      error.value = 'error'

      clearData()

      expect(emailData.value).toBeNull()
      expect(error.value).toBeNull()
    })
  })
})
