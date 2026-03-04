import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock global fetch
const mockFetch = vi.fn()
globalThis.fetch = mockFetch

describe('GitHub Token Netlify Function', () => {
  let handler
  const originalEnv = { ...process.env }

  beforeEach(async () => {
    vi.resetModules()
    process.env.VITE_GITHUB_CLIENT_ID = 'test-client-id'
    process.env.GITHUB_CLIENT_SECRET = 'test-client-secret'
    process.env.ALLOWED_ORIGIN = 'http://localhost:3000'
    mockFetch.mockReset()

    const mod = await import('../../netlify/functions/github-token.js')
    handler = mod.handler
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  const makeEvent = (body = {}) => ({
    httpMethod: 'POST',
    body: JSON.stringify(body),
  })

  // ==========================================================================
  // HTTP methods
  // ==========================================================================
  describe('HTTP methods', () => {
    it('should handle OPTIONS preflight', async () => {
      const result = await handler({ httpMethod: 'OPTIONS' })
      expect(result.statusCode).toBe(200)
      expect(result.headers['Access-Control-Allow-Origin']).toBe('http://localhost:3000')
    })

    it('should reject non-POST methods', async () => {
      const result = await handler({ httpMethod: 'GET' })
      expect(result.statusCode).toBe(405)
    })
  })

  // ==========================================================================
  // Input validation
  // ==========================================================================
  describe('Input validation', () => {
    it('should reject missing code', async () => {
      const result = await handler(makeEvent({}))
      expect(result.statusCode).toBe(400)
      expect(JSON.parse(result.body).error).toBe('Authorization code is required')
    })

    it('should return 500 when credentials are missing', async () => {
      vi.resetModules()
      delete process.env.VITE_GITHUB_CLIENT_ID
      delete process.env.GITHUB_CLIENT_SECRET

      const mod = await import('../../netlify/functions/github-token.js')
      const result = await mod.handler(makeEvent({ code: 'test-code' }))
      expect(result.statusCode).toBe(500)
      expect(JSON.parse(result.body).error).toBe('Server configuration error')
    })
  })

  // ==========================================================================
  // Successful token exchange
  // ==========================================================================
  describe('Successful exchange', () => {
    it('should exchange code for token successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          access_token: 'gho_test_token_123',
          token_type: 'bearer',
          scope: 'read:user,repo',
        }),
      })

      const result = await handler(makeEvent({ code: 'valid-auth-code' }))
      const body = JSON.parse(result.body)

      expect(result.statusCode).toBe(200)
      expect(body.access_token).toBe('gho_test_token_123')
      expect(body.token_type).toBe('bearer')
      expect(body.scope).toBe('read:user,repo')
    })

    it('should pass correct parameters to GitHub', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          access_token: 'token',
          token_type: 'bearer',
          scope: '',
        }),
      })

      await handler(makeEvent({ code: 'my-code' }))

      expect(mockFetch).toHaveBeenCalledWith(
        'https://github.com/login/oauth/access_token',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Accept: 'application/json',
          }),
        })
      )

      const fetchBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(fetchBody.client_id).toBe('test-client-id')
      expect(fetchBody.client_secret).toBe('test-client-secret')
      expect(fetchBody.code).toBe('my-code')
    })
  })

  // ==========================================================================
  // Error handling
  // ==========================================================================
  describe('Error handling', () => {
    it('should handle GitHub error response', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          error: 'bad_verification_code',
          error_description: 'The code passed is incorrect or expired.',
        }),
      })

      const result = await handler(makeEvent({ code: 'expired-code' }))
      expect(result.statusCode).toBe(400)
      expect(JSON.parse(result.body).error).toContain('incorrect or expired')
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await handler(makeEvent({ code: 'test-code' }))
      expect(result.statusCode).toBe(500)
      expect(JSON.parse(result.body).error).toBe('Internal server error')
    })
  })
})
