import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock global fetch
const mockFetch = vi.fn()
globalThis.fetch = mockFetch

describe('Spotify Token Netlify Function', () => {
  let handler
  const originalEnv = { ...process.env }

  beforeEach(async () => {
    vi.resetModules()
    process.env.SPOTIFY_CLIENT_ID = 'test-spotify-id'
    process.env.SPOTIFY_CLIENT_SECRET = 'test-spotify-secret'
    process.env.ALLOWED_ORIGIN = 'http://localhost:3000'
    mockFetch.mockReset()

    const mod = await import('../../netlify/functions/spotify-token.js')
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
    it('should reject non-POST methods', async () => {
      const result = await handler({ httpMethod: 'GET' })
      expect(result.statusCode).toBe(405)
    })

    // Note: OPTIONS check is after the POST check in the source, so OPTIONS returns 405
    it('should reject OPTIONS (due to order of checks)', async () => {
      const result = await handler({ httpMethod: 'OPTIONS' })
      expect(result.statusCode).toBe(405)
    })
  })

  // ==========================================================================
  // Missing credentials
  // ==========================================================================
  describe('Server configuration', () => {
    it('should return 500 when Spotify credentials are missing', async () => {
      vi.resetModules()
      delete process.env.SPOTIFY_CLIENT_ID
      delete process.env.SPOTIFY_CLIENT_SECRET

      const mod = await import('../../netlify/functions/spotify-token.js')
      const result = await mod.handler(makeEvent({ code: 'test' }))
      expect(result.statusCode).toBe(500)
      expect(JSON.parse(result.body).error).toBe('Spotify credentials not configured')
    })
  })

  // ==========================================================================
  // Authorization code flow
  // ==========================================================================
  describe('Authorization code flow', () => {
    it('should exchange auth code for token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'spotify-access-token',
          refresh_token: 'spotify-refresh-token',
          expires_in: 3600,
          token_type: 'bearer',
        }),
      })

      const result = await handler(makeEvent({
        code: 'auth-code-123',
        redirect_uri: 'http://localhost:3000/callback/spotify',
        code_verifier: 'verifier-string',
      }))

      const body = JSON.parse(result.body)
      expect(result.statusCode).toBe(200)
      expect(body.access_token).toBe('spotify-access-token')
      expect(body.refresh_token).toBe('spotify-refresh-token')
      expect(body.expires_in).toBe(3600)
    })

    it('should send correct parameters to Spotify', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'token' }),
      })

      await handler(makeEvent({
        code: 'my-code',
        redirect_uri: 'http://localhost:3000/callback/spotify',
        code_verifier: 'my-verifier',
      }))

      expect(mockFetch).toHaveBeenCalledWith(
        'https://accounts.spotify.com/api/token',
        expect.objectContaining({
          method: 'POST',
        })
      )

      // Check Authorization header uses Basic auth
      const headers = mockFetch.mock.calls[0][1].headers
      expect(headers.Authorization).toContain('Basic')

      // Check body params
      const body = mockFetch.mock.calls[0][1].body
      expect(body.get('grant_type')).toBe('authorization_code')
      expect(body.get('code')).toBe('my-code')
      expect(body.get('redirect_uri')).toBe('http://localhost:3000/callback/spotify')
      expect(body.get('code_verifier')).toBe('my-verifier')
      expect(body.get('client_id')).toBe('test-spotify-id')
    })
  })

  // ==========================================================================
  // Refresh token flow
  // ==========================================================================
  describe('Refresh token flow', () => {
    it('should refresh token successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'new-access-token',
          expires_in: 3600,
          token_type: 'bearer',
        }),
      })

      const result = await handler(makeEvent({
        refresh_token: 'old-refresh-token',
        grant_type: 'refresh_token',
      }))

      const body = JSON.parse(result.body)
      expect(result.statusCode).toBe(200)
      expect(body.access_token).toBe('new-access-token')
    })

    it('should send refresh_token grant type to Spotify', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'token' }),
      })

      await handler(makeEvent({
        refresh_token: 'my-refresh-token',
        grant_type: 'refresh_token',
      }))

      const body = mockFetch.mock.calls[0][1].body
      expect(body.get('grant_type')).toBe('refresh_token')
      expect(body.get('refresh_token')).toBe('my-refresh-token')
      expect(body.get('client_id')).toBe('test-spotify-id')
    })
  })

  // ==========================================================================
  // Missing parameters
  // ==========================================================================
  describe('Missing parameters', () => {
    it('should reject when both code and refresh_token are missing', async () => {
      const result = await handler(makeEvent({}))
      expect(result.statusCode).toBe(400)
      expect(JSON.parse(result.body).error).toBe('Missing required parameters')
    })
  })

  // ==========================================================================
  // Error handling
  // ==========================================================================
  describe('Error handling', () => {
    it('should handle Spotify API error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'invalid_grant',
          error_description: 'Authorization code expired',
        }),
      })

      const result = await handler(makeEvent({ code: 'expired-code' }))
      expect(result.statusCode).toBe(400)
      expect(JSON.parse(result.body).error).toContain('Authorization code expired')
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection refused'))

      const result = await handler(makeEvent({ code: 'test-code' }))
      expect(result.statusCode).toBe(500)
      expect(JSON.parse(result.body).error).toBe('Internal server error')
    })
  })
})
