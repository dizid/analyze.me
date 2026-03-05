import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock auth utility
const mockGetUserId = vi.fn()
vi.mock('../../netlify/functions/utils/auth.js', () => ({
  getUserIdFromHeaders: (...args) => mockGetUserId(...args),
  unauthorized: vi.fn(() => ({
    statusCode: 401,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'Unauthorized' }),
  })),
}))

// Mock database
const mockSql = vi.fn()
vi.mock('../../netlify/functions/utils/db.js', () => ({
  getDb: vi.fn(() => mockSql),
}))

const originalEnv = { ...process.env }

describe('User Sync Netlify Function', () => {
  let handler

  beforeEach(async () => {
    vi.resetModules()
    process.env.DATABASE_URL = 'postgres://test'
    process.env.VITE_GOOGLE_CLIENT_ID = 'test-client-id'
    mockSql.mockReset()
    mockGetUserId.mockReset()

    vi.doMock('../../netlify/functions/utils/auth.js', () => ({
      getUserIdFromHeaders: (...args) => mockGetUserId(...args),
      unauthorized: vi.fn(() => ({
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unauthorized' }),
      })),
    }))
    vi.doMock('../../netlify/functions/utils/db.js', () => ({
      getDb: vi.fn(() => mockSql),
    }))

    const mod = await import('../../netlify/functions/user-sync.js')
    handler = mod.handler
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.restoreAllMocks()
  })

  const makeEvent = (method = 'POST', body = {}) => ({
    httpMethod: method,
    headers: { authorization: 'Bearer test-token' },
    body: JSON.stringify(body),
  })

  // ==========================================================================
  // HTTP method validation
  // ==========================================================================
  describe('HTTP methods', () => {
    it('rejects non-POST methods with 405', async () => {
      const result = await handler(makeEvent('GET'))
      expect(result.statusCode).toBe(405)
    })

    it('rejects PUT with 405', async () => {
      const result = await handler(makeEvent('PUT'))
      expect(result.statusCode).toBe(405)
    })
  })

  // ==========================================================================
  // Authentication
  // ==========================================================================
  describe('Authentication', () => {
    it('returns 401 when user is not authenticated', async () => {
      mockGetUserId.mockResolvedValue(null)

      const result = await handler(makeEvent('POST', {
        email: 'a@b.com',
        displayName: 'Test',
      }))
      expect(result.statusCode).toBe(401)
    })
  })

  // ==========================================================================
  // Successful sync
  // ==========================================================================
  describe('Successful sync', () => {
    it('upserts user and creates gamification row', async () => {
      mockGetUserId.mockResolvedValue('user-123')

      // Mock two SQL calls: user upsert + gamification insert
      let callCount = 0
      mockSql.mockImplementation(() => {
        callCount++
        return Promise.resolve([])
      })

      const result = await handler(makeEvent('POST', {
        email: 'test@example.com',
        displayName: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
      }))

      expect(result.statusCode).toBe(200)
      expect(JSON.parse(result.body).ok).toBe(true)
      // Two SQL calls: upsert user + insert gamification
      expect(callCount).toBe(2)
    })

    it('handles null optional fields', async () => {
      mockGetUserId.mockResolvedValue('user-456')
      mockSql.mockImplementation(() => Promise.resolve([]))

      const result = await handler(makeEvent('POST', {}))

      expect(result.statusCode).toBe(200)
    })
  })

  // ==========================================================================
  // Error handling
  // ==========================================================================
  describe('Error handling', () => {
    it('returns 500 on database error', async () => {
      mockGetUserId.mockResolvedValue('user-123')
      mockSql.mockImplementation(() => Promise.reject(new Error('DB error')))

      const result = await handler(makeEvent('POST', {
        email: 'test@example.com',
      }))

      expect(result.statusCode).toBe(500)
      expect(JSON.parse(result.body).error).toBe('Internal server error')
    })
  })
})
