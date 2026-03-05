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
    if (window.google?.accounts?.id) {
      resolve()
      return
    }

    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', reject)
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
  } catch {
    // Non-blocking sync failure — user can still use the app
  }
}

// Callback invoked when user selects a Google account
function handleCredentialResponse(response) {
  const token = response.credential
  const payload = decodeJwtPayload(token)

  if (!payload) return

  const userData = {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
  }

  idToken.value = token
  user.value = userData
  isSignedIn.value = true

  localStorage.setItem(STORAGE_TOKEN_KEY, token)
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData))

  syncUser(userData, token)
}

let initialized = false

export function useAuth() {
  // Initialize: load GIS, restore session, set isLoaded
  const initialize = async () => {
    if (initialized) return
    initialized = true

    // Restore session from localStorage
    const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY)
    const storedUser = localStorage.getItem(STORAGE_USER_KEY)

    if (storedToken && storedUser && !isTokenExpired(storedToken)) {
      idToken.value = storedToken
      user.value = JSON.parse(storedUser)
      isSignedIn.value = true
    } else {
      localStorage.removeItem(STORAGE_TOKEN_KEY)
      localStorage.removeItem(STORAGE_USER_KEY)
    }

    // Load GIS and initialize the library
    try {
      await loadGisScript()
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CONFIG.clientId,
        callback: handleCredentialResponse,
        auto_select: true,
        use_fedcm_for_prompt: true,
      })
    } catch {
      // GIS failed to load — button won't render but app won't crash
    }

    isLoaded.value = true
  }

  // Render Google's own sign-in button into a container element
  // This is the most reliable sign-in method (no popup blocking, no FedCM issues)
  const renderButton = (containerEl, options = {}) => {
    if (!window.google?.accounts?.id || !containerEl) return

    window.google.accounts.id.renderButton(containerEl, {
      type: 'standard',
      theme: 'filled_black',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      width: containerEl.offsetWidth || 400,
      ...options,
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
    if (idToken.value) {
      // Token expired — trigger silent re-auth via GIS prompt
      // This will call handleCredentialResponse if user has an active Google session
      window.google?.accounts?.id?.prompt()
      signOut()
    }
    return null
  }

  return {
    isSignedIn: computed(() => isSignedIn.value),
    isLoaded: computed(() => isLoaded.value),
    user: computed(() => user.value),
    initialize,
    renderButton,
    signOut,
    getIdToken,
  }
}
