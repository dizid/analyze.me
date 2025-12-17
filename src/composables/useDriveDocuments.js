import { ref, computed } from 'vue'

// Module-level state (shared across components)
const documents = ref([])
const isLoading = ref(false)
const error = ref(null)
const lastFetchTime = ref(null)

export function useDriveDocuments() {
  // Fetch recent Google Docs from Drive
  const fetchRecentDocuments = async (accessToken, limit = 25) => {
    if (!accessToken) {
      error.value = 'Not authenticated'
      return []
    }

    isLoading.value = true
    error.value = null

    try {
      const params = new URLSearchParams({
        pageSize: limit.toString(),
        q: "mimeType='application/vnd.google-apps.document'",
        orderBy: 'modifiedTime desc',
        fields: 'files(id,name,modifiedTime,createdTime,description)',
      })

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?${params}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `Failed to fetch documents: ${response.status}`)
      }

      const data = await response.json()
      documents.value = data.files || []
      lastFetchTime.value = new Date().toISOString()

      return documents.value
    } catch (err) {
      console.error('Error fetching Drive documents:', err)
      error.value = err.message || 'Failed to fetch documents'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Fetch content of a specific document
  const fetchDocumentContent = async (accessToken, documentId) => {
    if (!accessToken) {
      throw new Error('Not authenticated')
    }

    try {
      // Try to export as plain text first
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${documentId}/export?mimeType=text/plain`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      if (!response.ok) {
        // Fallback to Google Docs API
        const docResponse = await fetch(
          `https://docs.googleapis.com/v1/documents/${documentId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )

        if (!docResponse.ok) {
          throw new Error('Failed to fetch document content')
        }

        const docData = await docResponse.json()
        return extractTextFromDoc(docData)
      }

      return await response.text()
    } catch (err) {
      console.error('Error fetching document content:', err)
      throw err
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

  // Clear documents
  const clearDocuments = () => {
    documents.value = []
    lastFetchTime.value = null
    error.value = null
  }

  return {
    documents: computed(() => documents.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    lastFetchTime: computed(() => lastFetchTime.value),
    fetchRecentDocuments,
    fetchDocumentContent,
    clearDocuments,
  }
}
