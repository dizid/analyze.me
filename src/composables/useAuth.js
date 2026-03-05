import { ref, computed } from 'vue'
import { GOOGLE_CONFIG } from '@/config/google'

// Singleton state shared across all component instances
const isSignedIn = ref(false)
const isLoaded = ref(false)
const user = ref(null) // { id, email, name, picture }
const idToken = ref(null)

const STORAGE_TOKEN_KEY = 'analyze-me-id-token'
const STORAGE_USER_KEY = 'analyze-me-user'

// Decode JWT payload without verification (verification happens server-side)
function decodeJwtPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

// Check if a token is expired
function isTokenExpired(token) {
  const payload = decodeJwtPayload(token)
  if (!payload?.exp) return true
  return Date.now() / 1000 > payload.exp
}

// Load Google Identity Services script
function loadGisScript() {
  return new Promise((resolve, reject) => {
    // Already loaded by useGoogleAuth or a previous call
    if (window.google?.accounts?.id) {
      resolve()
      return
    }

    // Script tag may exist but not yet loaded
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', reject)
      // If it already loaded between our check and listener
      if (window.google?.accounts?.id) resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = reject
    document.head.appendChild(script)
  })
}

// Sync user to backend (non-blocking)
async function syncUser(userData, token) {
  try {
    const functionsUrl = import.meta.env.VITE_NETLIFY_FUNCTIONS_URL || '/.netlify/functions'
    await fetch(`${functionsUrl}/user-sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: userData.email,
        displayName: userData.name,
        avatarUrl: userData.picture,
      }),
    })
  } catch (err) {
    console.error('User sync failed:', err)
  }
}

// Handle credential response from Google
function handleCredentialResponse(response) {
  const token = response.credential
  const payload = decodeJwtPayload(token)

  if (!payload) {
    console.error('Failed to decode Google ID token')
    return
  }

  const userData = {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
  }

  // Update reactive state
  idToken.value = token
  user.value = userData
  isSignedIn.value = true

  // Persist to localStorage
  localStorage.setItem(STORAGE_TOKEN_KEY, token)
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData))

  // Sync to backend
  syncUser(userData, token)
}

let initialized = false

export function useAuth() {
  // Initialize: load GIS, restore session, set isLoaded
  const initialize = async () => {
    if (initialized) return
    initialized = true

    // Try to restore session from localStorage
    const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY)
    const storedUser = localStorage.getItem(STORAGE_USER_KEY)

    if (storedToken && storedUser && !isTokenExpired(storedToken)) {
      idToken.value = storedToken
      user.value = JSON.parse(storedUser)
      isSignedIn.value = true
    } else {
      // Clear stale data
      localStorage.removeItem(STORAGE_TOKEN_KEY)
      localStorage.removeItem(STORAGE_USER_KEY)
    }

    // Load GIS and initialize
    try {
      await loadGisScript()
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CONFIG.clientId,
        callback: handleCredentialResponse,
        auto_select: true,
        cancel_on_tap_outside: true,
      })
    } catch (err) {
      console.error('Failed to load Google Identity Services:', err)
    }

    isLoaded.value = true
  }

  // Trigger Google Sign-In popup
  const signIn = () => {
    return new Promise((resolve, reject) => {
      if (!window.google?.accounts?.id) {
        reject(new Error('Google Identity Services not loaded'))
        return
      }

      // Store resolve/reject for the callback
      const originalCallback = handleCredentialResponse
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CONFIG.clientId,
        callback: (response) => {
          originalCallback(response)
          resolve()
        },
        cancel_on_tap_outside: true,
      })

      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback: use the button-based flow via popup
          // This happens when third-party cookies are blocked
          window.google.accounts.id.renderButton(
            document.createElement('div'),
            { type: 'standard' }
          )
          // Try the One Tap prompt again or use redirect
          reject(new Error('Sign-in popup was blocked. Please allow popups and try again.'))
        }
      })
    })
  }

  // Sign out and clear session
  const signOut = () => {
    window.google?.accounts?.id?.disableAutoSelect()
    idToken.value = null
    user.value = null
    isSignedIn.value = false
    localStorage.removeItem(STORAGE_TOKEN_KEY)
    localStorage.removeItem(STORAGE_USER_KEY)
  }

  // Get current ID token for API Authorization headers
  const getIdToken = () => {
    if (idToken.value && !isTokenExpired(idToken.value)) {
      return idToken.value
    }
    // Token expired — clear session
    if (idToken.value) {
      signOut()
    }
    return null
  }

  return {
    isSignedIn: computed(() => isSignedIn.value),
    isLoaded: computed(() => isLoaded.value),
    user: computed(() => user.value),
    initialize,
    signIn,
    signOut,
    getIdToken,
  }
}
