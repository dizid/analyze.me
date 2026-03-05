import { describe, it, expect, vi, beforeEach } from 'vitest'

// ==========================================================================
// Helper: create a valid-looking JWT (header.payload.signature)
// ==========================================================================
function createJwt(payload, validSig = true) {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  const sig = validSig ? 'fake-signature' : ''
  return `${header}.${body}.${sig}`
}

// ==========================================================================
// Client-side auth (useAuth composable)
// ==========================================================================
describe('useAuth composable', () => {
  let useAuth

  beforeEach(async () => {
    vi.resetModules()
    localStorage.clear()

    // Mock window.google for GIS
    globalThis.window = globalThis.window || {}
    window.google = {
      accounts: {
        id: {
          initialize: vi.fn(),
          renderButton: vi.fn(),
          disableAutoSelect: vi.fn(),
          prompt: vi.fn(),
        },
      },
    }

    // Mock the Google config module
    vi.doMock('@/config/google', () => ({
      GOOGLE_CONFIG: { clientId: 'test-client-id' },
    }))

    const mod = await import('@/composables/useAuth')
    useAuth = mod.useAuth
  })

  // --------------------------------------------------------------------------
  // JWT decode + expiration
  // --------------------------------------------------------------------------
  describe('token handling', () => {
    it('getIdToken returns null when no token exists', () => {
      const { getIdToken } = useAuth()
      expect(getIdToken()).toBeNull()
    })

    it('getIdToken returns token when valid and not expired', async () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600
      const token = createJwt({ sub: '123', email: 'a@b.com', name: 'A', picture: '', exp: futureExp })

      localStorage.setItem('analyze-me-id-token', token)
      localStorage.setItem('analyze-me-user', JSON.stringify({ id: '123', email: 'a@b.com', name: 'A', picture: '' }))

      // Re-import to pick up localStorage
      vi.resetModules()
      vi.doMock('@/config/google', () => ({
        GOOGLE_CONFIG: { clientId: 'test-client-id' },
      }))
      const mod = await import('@/composables/useAuth')
      const auth = mod.useAuth()
      await auth.initialize()

      expect(auth.getIdToken()).toBe(token)
      expect(auth.isSignedIn.value).toBe(true)
    })

    it('getIdToken signs out and returns null for expired token', async () => {
      const pastExp = Math.floor(Date.now() / 1000) - 100
      const token = createJwt({ sub: '123', email: 'a@b.com', name: 'A', picture: '', exp: pastExp })

      localStorage.setItem('analyze-me-id-token', token)
      localStorage.setItem('analyze-me-user', JSON.stringify({ id: '123' }))

      vi.resetModules()
      vi.doMock('@/config/google', () => ({
        GOOGLE_CONFIG: { clientId: 'test-client-id' },
      }))
      const mod = await import('@/composables/useAuth')
      const auth = mod.useAuth()
      await auth.initialize()

      // Token was expired, so initialize should have cleaned up
      expect(auth.isSignedIn.value).toBe(false)
      expect(auth.getIdToken()).toBeNull()
    })
  })

  // --------------------------------------------------------------------------
  // Session restoration
  // --------------------------------------------------------------------------
  describe('session restoration', () => {
    it('restores valid session from localStorage', async () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600
      const token = createJwt({ sub: '456', exp: futureExp })
      const userData = { id: '456', email: 'b@c.com', name: 'B', picture: '' }

      localStorage.setItem('analyze-me-id-token', token)
      localStorage.setItem('analyze-me-user', JSON.stringify(userData))

      vi.resetModules()
      vi.doMock('@/config/google', () => ({
        GOOGLE_CONFIG: { clientId: 'test-client-id' },
      }))
      const mod = await import('@/composables/useAuth')
      const auth = mod.useAuth()
      await auth.initialize()

      expect(auth.isSignedIn.value).toBe(true)
      expect(auth.user.value).toEqual(userData)
    })

    it('clears expired session from localStorage', async () => {
      const pastExp = Math.floor(Date.now() / 1000) - 100
      const token = createJwt({ sub: '789', exp: pastExp })

      localStorage.setItem('analyze-me-id-token', token)
      localStorage.setItem('analyze-me-user', JSON.stringify({ id: '789' }))

      vi.resetModules()
      vi.doMock('@/config/google', () => ({
        GOOGLE_CONFIG: { clientId: 'test-client-id' },
      }))
      const mod = await import('@/composables/useAuth')
      const auth = mod.useAuth()
      await auth.initialize()

      expect(auth.isSignedIn.value).toBe(false)
      expect(localStorage.getItem('analyze-me-id-token')).toBeNull()
      expect(localStorage.getItem('analyze-me-user')).toBeNull()
    })

    it('handles missing localStorage data gracefully', async () => {
      vi.resetModules()
      vi.doMock('@/config/google', () => ({
        GOOGLE_CONFIG: { clientId: 'test-client-id' },
      }))
      const mod = await import('@/composables/useAuth')
      const auth = mod.useAuth()
      await auth.initialize()

      expect(auth.isSignedIn.value).toBe(false)
      expect(auth.user.value).toBeNull()
    })
  })

  // --------------------------------------------------------------------------
  // Sign out
  // --------------------------------------------------------------------------
  describe('signOut', () => {
    it('clears all state and localStorage', async () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600
      const token = createJwt({ sub: '123', exp: futureExp })

      localStorage.setItem('analyze-me-id-token', token)
      localStorage.setItem('analyze-me-user', JSON.stringify({ id: '123' }))

      vi.resetModules()
      vi.doMock('@/config/google', () => ({
        GOOGLE_CONFIG: { clientId: 'test-client-id' },
      }))
      const mod = await import('@/composables/useAuth')
      const auth = mod.useAuth()
      await auth.initialize()

      expect(auth.isSignedIn.value).toBe(true)

      auth.signOut()

      expect(auth.isSignedIn.value).toBe(false)
      expect(auth.user.value).toBeNull()
      expect(auth.getIdToken()).toBeNull()
      expect(localStorage.getItem('analyze-me-id-token')).toBeNull()
      expect(localStorage.getItem('analyze-me-user')).toBeNull()
    })
  })

  // --------------------------------------------------------------------------
  // isLoaded
  // --------------------------------------------------------------------------
  describe('isLoaded', () => {
    it('is true after initialize completes', async () => {
      vi.resetModules()
      vi.doMock('@/config/google', () => ({
        GOOGLE_CONFIG: { clientId: 'test-client-id' },
      }))
      const mod = await import('@/composables/useAuth')
      const auth = mod.useAuth()

      expect(auth.isLoaded.value).toBe(false)
      await auth.initialize()
      expect(auth.isLoaded.value).toBe(true)
    })
  })
})

// ==========================================================================
// Server-side auth (getUserIdFromHeaders)
// ==========================================================================
describe('Server-side auth - getUserIdFromHeaders', () => {
  let getUserIdFromHeaders, unauthorized

  beforeEach(async () => {
    vi.resetModules()
    process.env.VITE_GOOGLE_CLIENT_ID = 'test-client-id'

    // Mock google-auth-library
    vi.doMock('google-auth-library', () => ({
      OAuth2Client: vi.fn().mockImplementation(() => ({
        verifyIdToken: vi.fn().mockImplementation(async ({ idToken }) => {
          if (idToken === 'valid-token') {
            return {
              getPayload: () => ({ sub: 'user-123', email: 'test@example.com' }),
            }
          }
          throw new Error('Invalid token')
        }),
      })),
    }))

    const mod = await import('../../netlify/functions/utils/auth.js')
    getUserIdFromHeaders = mod.getUserIdFromHeaders
    unauthorized = mod.unauthorized
  })

  it('returns user ID for valid Bearer token', async () => {
    const userId = await getUserIdFromHeaders({
      authorization: 'Bearer valid-token',
    })
    expect(userId).toBe('user-123')
  })

  it('returns null for missing Authorization header', async () => {
    const userId = await getUserIdFromHeaders({})
    expect(userId).toBeNull()
  })

  it('returns null for malformed Authorization header', async () => {
    const userId = await getUserIdFromHeaders({
      authorization: 'NotBearer token',
    })
    expect(userId).toBeNull()
  })

  it('returns null for invalid token', async () => {
    const userId = await getUserIdFromHeaders({
      authorization: 'Bearer invalid-token',
    })
    expect(userId).toBeNull()
  })

  it('handles case-insensitive Authorization header', async () => {
    const userId = await getUserIdFromHeaders({
      Authorization: 'Bearer valid-token',
    })
    expect(userId).toBe('user-123')
  })

  it('unauthorized() returns 401 response', () => {
    const result = unauthorized()
    expect(result.statusCode).toBe(401)
    expect(JSON.parse(result.body).error).toBe('Unauthorized')
  })
})
