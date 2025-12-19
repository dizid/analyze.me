import { ref, computed } from 'vue'
import { SPOTIFY_CONFIG } from '@/config/spotify'

const STORAGE_KEY = 'spotify-auth'

const authState = ref({
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
})

// Load from storage on init
const loadAuth = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      authState.value = JSON.parse(stored)
    }
  } catch (err) {
    console.error('Failed to load Spotify auth:', err)
  }
}

loadAuth()

export function useSpotifyAuth() {
  const isAuthenticated = computed(() => {
    if (!authState.value.accessToken) return false
    if (authState.value.expiresAt && Date.now() > authState.value.expiresAt) {
      return false
    }
    return true
  })

  const generateRandomString = (length) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const values = crypto.getRandomValues(new Uint8Array(length))
    return values.reduce((acc, x) => acc + possible[x % possible.length], '')
  }

  const generateCodeChallenge = async (verifier) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(verifier)
    const digest = await crypto.subtle.digest('SHA-256', data)
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }

  const initiateAuth = async () => {
    const codeVerifier = generateRandomString(64)
    const codeChallenge = await generateCodeChallenge(codeVerifier)

    // Store verifier for later
    localStorage.setItem('spotify-code-verifier', codeVerifier)

    const params = new URLSearchParams({
      client_id: SPOTIFY_CONFIG.clientId,
      response_type: 'code',
      redirect_uri: SPOTIFY_CONFIG.redirectUri,
      scope: SPOTIFY_CONFIG.scopes,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      state: generateRandomString(16),
    })

    // Open popup for auth
    const width = 500
    const height = 700
    const left = (window.innerWidth - width) / 2
    const top = (window.innerHeight - height) / 2

    const popup = window.open(
      `${SPOTIFY_CONFIG.authEndpoint}?${params}`,
      'Spotify Login',
      `width=${width},height=${height},left=${left},top=${top}`
    )

    return new Promise((resolve, reject) => {
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          window.removeEventListener('message', handleMessage)
          reject(new Error('Popup closed'))
        }
      }, 500)

      const handleMessage = async (event) => {
        if (event.origin !== window.location.origin) return

        if (event.data.type === 'spotify-callback') {
          clearInterval(checkClosed)
          window.removeEventListener('message', handleMessage)
          popup.close()

          if (event.data.code) {
            try {
              await exchangeCodeForToken(event.data.code)
              resolve(true)
            } catch (err) {
              reject(err)
            }
          } else if (event.data.error) {
            reject(new Error(event.data.error))
          }
        }
      }

      window.addEventListener('message', handleMessage)
    })
  }

  const exchangeCodeForToken = async (code) => {
    const codeVerifier = localStorage.getItem('spotify-code-verifier')

    // Use Netlify function to exchange code (keeps client secret secure)
    const response = await fetch('/.netlify/functions/spotify-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        redirect_uri: SPOTIFY_CONFIG.redirectUri,
        code_verifier: codeVerifier,
      }),
    })

    if (!response.ok) {
      throw new Error('Token exchange failed')
    }

    const data = await response.json()

    authState.value = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(authState.value))
    localStorage.removeItem('spotify-code-verifier')

    return authState.value.accessToken
  }

  const refreshAccessToken = async () => {
    if (!authState.value.refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await fetch('/.netlify/functions/spotify-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: authState.value.refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      throw new Error('Token refresh failed')
    }

    const data = await response.json()

    authState.value = {
      ...authState.value,
      accessToken: data.access_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(authState.value))

    return authState.value.accessToken
  }

  const getAccessToken = async () => {
    if (!authState.value.accessToken) {
      throw new Error('Not authenticated')
    }

    // Check if token is expired or about to expire (5 min buffer)
    if (authState.value.expiresAt && Date.now() > authState.value.expiresAt - 300000) {
      try {
        return await refreshAccessToken()
      } catch {
        // If refresh fails, need to re-authenticate
        signOut()
        throw new Error('Session expired, please reconnect')
      }
    }

    return authState.value.accessToken
  }

  const signOut = () => {
    authState.value = {
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
    }
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('spotify-code-verifier')
  }

  return {
    isAuthenticated,
    initiateAuth,
    getAccessToken,
    signOut,
  }
}
