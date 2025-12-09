import { ref, computed } from 'vue'
import { GOOGLE_CONFIG, GOOGLE_PICKER_CONFIG } from '@/config/google'

const isAuthenticated = ref(false)
const user = ref(null)
const accessToken = ref(null)
const tokenClient = ref(null)
const gapiLoaded = ref(false)
const gisLoaded = ref(false)

export function useGoogleAuth() {
  const error = ref(null)
  const isLoading = ref(false)

  // Load Google API scripts
  const loadGoogleScripts = () => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google && window.gapi) {
        gisLoaded.value = true
        gapiLoaded.value = true
        resolve()
        return
      }

      // Load Google Identity Services
      const gisScript = document.createElement('script')
      gisScript.src = 'https://accounts.google.com/gsi/client'
      gisScript.async = true
      gisScript.defer = true
      gisScript.onload = () => {
        gisLoaded.value = true
        if (gapiLoaded.value) resolve()
      }
      gisScript.onerror = reject
      document.head.appendChild(gisScript)

      // Load Google API (for Picker)
      const gapiScript = document.createElement('script')
      gapiScript.src = 'https://apis.google.com/js/api.js'
      gapiScript.async = true
      gapiScript.defer = true
      gapiScript.onload = () => {
        window.gapi.load('picker', () => {
          gapiLoaded.value = true
          if (gisLoaded.value) resolve()
        })
      }
      gapiScript.onerror = reject
      document.head.appendChild(gapiScript)
    })
  }

  // Initialize Google Auth
  const initializeGoogleAuth = async () => {
    isLoading.value = true
    error.value = null

    try {
      await loadGoogleScripts()

      // Initialize OAuth2 token client
      tokenClient.value = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CONFIG.clientId,
        scope: GOOGLE_CONFIG.scopes,
        callback: (tokenResponse) => {
          if (tokenResponse.error) {
            error.value = tokenResponse.error
            return
          }
          accessToken.value = tokenResponse.access_token
          isAuthenticated.value = true
        },
      })
    } catch (err) {
      console.error('Failed to initialize Google Auth:', err)
      error.value = 'Failed to initialize Google authentication'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Sign in
  const signIn = async () => {
    isLoading.value = true
    error.value = null

    try {
      if (!tokenClient.value) {
        await initializeGoogleAuth()
      }

      // Request OAuth token
      tokenClient.value.requestAccessToken({ prompt: 'consent' })
    } catch (err) {
      error.value = err.message || 'Failed to sign in'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Sign out
  const signOut = () => {
    if (accessToken.value) {
      window.google.accounts.oauth2.revoke(accessToken.value)
    }
    isAuthenticated.value = false
    user.value = null
    accessToken.value = null
  }

  // Open Document Picker
  const openDocumentPicker = () => {
    return new Promise((resolve, reject) => {
      if (!accessToken.value) {
        reject(new Error('Not authenticated'))
        return
      }

      if (!gapiLoaded.value) {
        reject(new Error('Google Picker not loaded'))
        return
      }

      const picker = new window.google.picker.PickerBuilder()
        .setOAuthToken(accessToken.value)
        .setDeveloperKey(GOOGLE_CONFIG.apiKey)
        .setAppId(GOOGLE_CONFIG.clientId.split('-')[0])
        .addView(
          new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
            .setMimeTypes(GOOGLE_PICKER_CONFIG.mimeTypes.join(','))
        )
        .setCallback((data) => {
          if (data.action === window.google.picker.Action.PICKED) {
            const doc = data.docs[0]
            resolve({
              id: doc.id,
              name: doc.name,
              mimeType: doc.mimeType,
              sizeBytes: doc.sizeBytes,
              url: doc.url,
            })
          } else if (data.action === window.google.picker.Action.CANCEL) {
            reject(new Error('User cancelled document selection'))
          }
        })
        .build()

      picker.setVisible(true)
    })
  }

  // Fetch Document Content
  const fetchDocumentContent = async (documentId) => {
    isLoading.value = true
    error.value = null

    try {
      if (!accessToken.value) {
        throw new Error('Not authenticated')
      }

      // Use Google Drive API to export as plain text
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${documentId}/export?mimeType=text/plain`,
        {
          headers: {
            Authorization: `Bearer ${accessToken.value}`,
          },
        }
      )

      if (!response.ok) {
        // If export fails, try getting as Google Doc
        const docResponse = await fetch(
          `https://docs.googleapis.com/v1/documents/${documentId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken.value}`,
            },
          }
        )

        if (!docResponse.ok) {
          throw new Error('Failed to fetch document content')
        }

        const docData = await docResponse.json()
        // Extract text from Google Docs structure
        const content = extractTextFromDoc(docData)
        return content
      }

      return await response.text()
    } catch (err) {
      console.error('Error fetching document:', err)
      error.value = err.message || 'Failed to fetch document content'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Extract text from Google Docs JSON structure
  const extractTextFromDoc = (docData) => {
    let text = ''
    if (docData.body && docData.body.content) {
      docData.body.content.forEach((element) => {
        if (element.paragraph) {
          element.paragraph.elements?.forEach((el) => {
            if (el.textRun) {
              text += el.textRun.content || ''
            }
          })
        }
      })
    }
    return text
  }

  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    user: computed(() => user.value),
    error: computed(() => error.value),
    isLoading: computed(() => isLoading.value),
    initializeGoogleAuth,
    signIn,
    signOut,
    openDocumentPicker,
    fetchDocumentContent,
  }
}
