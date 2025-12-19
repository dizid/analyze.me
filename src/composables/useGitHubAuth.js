import { ref, computed } from 'vue'
import { GITHUB_CONFIG } from '@/config/github'

const STORAGE_KEY = 'github_auth'

// Singleton state
const accessToken = ref(null)
const user = ref(null)
const isLoading = ref(false)
const error = ref(null)

// Load from storage on init
const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const data = JSON.parse(stored)
      accessToken.value = data.accessToken
      user.value = data.user
    }
  } catch (e) {
    console.error('Failed to load GitHub auth from storage:', e)
  }
}

const saveToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      accessToken: accessToken.value,
      user: user.value,
    }))
  } catch (e) {
    console.error('Failed to save GitHub auth to storage:', e)
  }
}

const clearStorage = () => {
  localStorage.removeItem(STORAGE_KEY)
}

// Initialize on module load
loadFromStorage()

export function useGitHubAuth() {
  const isAuthenticated = computed(() => !!accessToken.value)

  const initiateAuth = async () => {
    // Generate state for CSRF protection
    const state = crypto.randomUUID()
    sessionStorage.setItem('github_oauth_state', state)

    const params = new URLSearchParams({
      client_id: GITHUB_CONFIG.clientId,
      redirect_uri: GITHUB_CONFIG.redirectUri,
      scope: GITHUB_CONFIG.scopes,
      state,
    })

    const authUrl = `${GITHUB_CONFIG.authEndpoint}?${params.toString()}`

    // Open popup for auth
    const width = 600
    const height = 700
    const left = window.screenX + (window.innerWidth - width) / 2
    const top = window.screenY + (window.innerHeight - height) / 2

    const popup = window.open(
      authUrl,
      'GitHub OAuth',
      `width=${width},height=${height},left=${left},top=${top},popup=1`
    )

    // Listen for callback
    return new Promise((resolve, reject) => {
      const handleMessage = async (event) => {
        if (event.origin !== window.location.origin) return

        if (event.data?.type === 'github-oauth-callback') {
          window.removeEventListener('message', handleMessage)

          const { code, state: returnedState, error: authError } = event.data

          if (authError) {
            reject(new Error(authError))
            return
          }

          // Verify state
          const savedState = sessionStorage.getItem('github_oauth_state')
          if (returnedState !== savedState) {
            reject(new Error('State mismatch - possible CSRF attack'))
            return
          }

          sessionStorage.removeItem('github_oauth_state')

          try {
            await exchangeCodeForToken(code)
            resolve()
          } catch (e) {
            reject(e)
          }
        }
      }

      window.addEventListener('message', handleMessage)

      // Check if popup was blocked
      if (!popup) {
        window.removeEventListener('message', handleMessage)
        reject(new Error('Popup blocked - please allow popups for this site'))
      }

      // Monitor popup close
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed)
          window.removeEventListener('message', handleMessage)
          // Don't reject - user may have completed auth
        }
      }, 500)
    })
  }

  const exchangeCodeForToken = async (code) => {
    isLoading.value = true
    error.value = null

    try {
      // Use Netlify function to exchange code for token (keeps secret server-side)
      const functionsUrl = import.meta.env.VITE_NETLIFY_FUNCTIONS_URL || '/.netlify/functions'
      const response = await fetch(`${functionsUrl}/github-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Token exchange failed')
      }

      const data = await response.json()
      accessToken.value = data.access_token

      // Fetch user info
      await fetchUserInfo()
      saveToStorage()
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const fetchUserInfo = async () => {
    if (!accessToken.value) return

    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user info')
    }

    user.value = await response.json()
  }

  const getAccessToken = () => {
    return accessToken.value
  }

  const signOut = () => {
    accessToken.value = null
    user.value = null
    clearStorage()
  }

  return {
    isAuthenticated,
    isLoading,
    error,
    user,
    initiateAuth,
    getAccessToken,
    signOut,
  }
}
