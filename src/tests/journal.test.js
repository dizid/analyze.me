import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock auth utility
vi.mock('../../netlify/functions/utils/auth.js', () => ({
  getUserIdFromHeaders: vi.fn(),
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

import { getUserIdFromHeaders } from '../../netlify/functions/utils/auth.js'

const originalEnv = { ...process.env }

describe('Journal Netlify Function', () => {
  let handler

  beforeEach(async () => {
    vi.resetModules()
    process.env.DATABASE_URL = 'postgres://test'
    process.env.VITE_GOOGLE_CLIENT_ID = 'test-client-id'

    // Re-mock after resetModules
    vi.doMock('../../netlify/functions/utils/auth.js', () => ({
      getUserIdFromHeaders: vi.fn(),
      unauthorized: vi.fn(() => ({
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unauthorized' }),
      })),
    }))
    vi.doMock('../../netlify/functions/utils/db.js', () => ({
      getDb: vi.fn(() => mockSql),
    }))

    const mod = await import('../../netlify/functions/journal.js')
    handler = mod.handler
    mockSql.mockReset()
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.restoreAllMocks()
  })

  const makeEvent = (method, overrides = {}) => ({
    httpMethod: method,
    headers: { authorization: 'Bearer test-token' },
    queryStringParameters: overrides.params || {},
    body: overrides.body ? JSON.stringify(overrides.body) : null,
  })

  // ==========================================================================
  // Authentication
  // ==========================================================================
  describe('Authentication', () => {
    it('returns 401 when user is not authenticated', async () => {
      const { getUserIdFromHeaders: mockAuth } = await import('../../netlify/functions/utils/auth.js')
      mockAuth.mockResolvedValue(null)

      const result = await handler(makeEvent('GET'))
      expect(result.statusCode).toBe(401)
    })

    it('proceeds when user is authenticated', async () => {
      const { getUserIdFromHeaders: mockAuth } = await import('../../netlify/functions/utils/auth.js')
      mockAuth.mockResolvedValue('user-123')

      // Mock SQL tagged template for GET
      mockSql.mockImplementation(() => Promise.resolve([]))

      const result = await handler(makeEvent('GET'))
      expect(result.statusCode).toBe(200)
    })
  })

  // ==========================================================================
  // GET - List entries
  // ==========================================================================
  describe('GET /journal', () => {
    beforeEach(async () => {
      const { getUserIdFromHeaders: mockAuth } = await import('../../netlify/functions/utils/auth.js')
      mockAuth.mockResolvedValue('user-123')
    })

    it('returns entries for the user', async () => {
      const mockEntries = [
        { id: 1, user_id: 'user-123', content: 'Entry 1', mood: 4 },
        { id: 2, user_id: 'user-123', content: 'Entry 2', mood: 3 },
      ]
      mockSql.mockImplementation(() => Promise.resolve(mockEntries))

      const result = await handler(makeEvent('GET'))
      const body = JSON.parse(result.body)

      expect(result.statusCode).toBe(200)
      expect(body.entries).toEqual(mockEntries)
    })

    it('filters by mood when param provided', async () => {
      mockSql.mockImplementation(() => Promise.resolve([]))

      await handler(makeEvent('GET', { params: { mood: '4' } }))

      // Verify SQL was called (tagged template)
      expect(mockSql).toHaveBeenCalled()
    })
  })

  // ==========================================================================
  // POST - Create entry
  // ==========================================================================
  describe('POST /journal', () => {
    beforeEach(async () => {
      const { getUserIdFromHeaders: mockAuth } = await import('../../netlify/functions/utils/auth.js')
      mockAuth.mockResolvedValue('user-123')
    })

    it('creates entry with valid data', async () => {
      const newEntry = { id: 1, user_id: 'user-123', content: 'My journal entry', mood: 4 }
      mockSql.mockImplementation(() => Promise.resolve([newEntry]))

      const result = await handler(makeEvent('POST', {
        body: { content: 'My journal entry', mood: 4, title: 'Test' },
      }))
      const body = JSON.parse(result.body)

      expect(result.statusCode).toBe(201)
      expect(body.entry).toEqual(newEntry)
    })

    it('rejects empty content', async () => {
      const result = await handler(makeEvent('POST', {
        body: { content: '', mood: 3 },
      }))

      expect(result.statusCode).toBe(400)
      expect(JSON.parse(result.body).error).toBe('Content is required')
    })

    it('rejects whitespace-only content', async () => {
      const result = await handler(makeEvent('POST', {
        body: { content: '   ', mood: 3 },
      }))

      expect(result.statusCode).toBe(400)
      expect(JSON.parse(result.body).error).toBe('Content is required')
    })

    it('uses defaults for optional fields', async () => {
      mockSql.mockImplementation(() => Promise.resolve([{ id: 1 }]))

      const result = await handler(makeEvent('POST', {
        body: { content: 'Just content' },
      }))

      expect(result.statusCode).toBe(201)
    })
  })

  // ==========================================================================
  // PUT - Update entry
  // ==========================================================================
  describe('PUT /journal', () => {
    beforeEach(async () => {
      const { getUserIdFromHeaders: mockAuth } = await import('../../netlify/functions/utils/auth.js')
      mockAuth.mockResolvedValue('user-123')
    })

    it('returns 400 when ID is missing', async () => {
      const result = await handler(makeEvent('PUT', {
        body: { content: 'Updated' },
      }))

      expect(result.statusCode).toBe(400)
      expect(JSON.parse(result.body).error).toBe('Entry ID required')
    })

    it('updates existing entry', async () => {
      const updated = { id: 1, user_id: 'user-123', content: 'Updated', mood: 5 }
      mockSql.mockImplementation(() => Promise.resolve([updated]))

      const result = await handler(makeEvent('PUT', {
        params: { id: '1' },
        body: { content: 'Updated', mood: 5 },
      }))

      expect(result.statusCode).toBe(200)
      expect(JSON.parse(result.body).entry).toEqual(updated)
    })

    it('returns 404 when entry not found or not owned', async () => {
      mockSql.mockImplementation(() => Promise.resolve([]))

      const result = await handler(makeEvent('PUT', {
        params: { id: '999' },
        body: { content: 'Updated' },
      }))

      expect(result.statusCode).toBe(404)
    })
  })

  // ==========================================================================
  // DELETE - Delete entry
  // ==========================================================================
  describe('DELETE /journal', () => {
    beforeEach(async () => {
      const { getUserIdFromHeaders: mockAuth } = await import('../../netlify/functions/utils/auth.js')
      mockAuth.mockResolvedValue('user-123')
    })

    it('returns 400 when ID is missing', async () => {
      const result = await handler(makeEvent('DELETE'))

      expect(result.statusCode).toBe(400)
      expect(JSON.parse(result.body).error).toBe('Entry ID required')
    })

    it('deletes existing entry', async () => {
      mockSql.mockImplementation(() => Promise.resolve([{ id: 1 }]))

      const result = await handler(makeEvent('DELETE', { params: { id: '1' } }))

      expect(result.statusCode).toBe(200)
      expect(JSON.parse(result.body).deleted).toBe(true)
    })

    it('returns 404 when entry not found or not owned', async () => {
      mockSql.mockImplementation(() => Promise.resolve([]))

      const result = await handler(makeEvent('DELETE', { params: { id: '999' } }))

      expect(result.statusCode).toBe(404)
    })
  })

  // ==========================================================================
  // Method not allowed
  // ==========================================================================
  describe('Unsupported methods', () => {
    it('returns 405 for PATCH', async () => {
      const { getUserIdFromHeaders: mockAuth } = await import('../../netlify/functions/utils/auth.js')
      mockAuth.mockResolvedValue('user-123')

      const result = await handler(makeEvent('PATCH'))
      expect(result.statusCode).toBe(405)
    })
  })

  // ==========================================================================
  // Error handling
  // ==========================================================================
  describe('Error handling', () => {
    it('returns 500 on database error', async () => {
      const { getUserIdFromHeaders: mockAuth } = await import('../../netlify/functions/utils/auth.js')
      mockAuth.mockResolvedValue('user-123')

      mockSql.mockImplementation(() => Promise.reject(new Error('DB connection failed')))

      const result = await handler(makeEvent('GET'))
      expect(result.statusCode).toBe(500)
      expect(JSON.parse(result.body).error).toBe('Internal server error')
    })
  })
})
