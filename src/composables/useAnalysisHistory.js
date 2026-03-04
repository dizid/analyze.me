import { ref, computed } from 'vue'

const STORAGE_KEY = 'analyze-me-history'
const LEGACY_KEY = 'grok-analysis-history'
const MAX_HISTORY_ITEMS = 50

const historyItems = ref([])

// Load from localStorage on initialization (with legacy key migration)
const loadHistory = () => {
  try {
    let stored = localStorage.getItem(STORAGE_KEY)
    // Migrate from legacy key if needed
    if (!stored) {
      const legacy = localStorage.getItem(LEGACY_KEY)
      if (legacy) {
        stored = legacy
        localStorage.setItem(STORAGE_KEY, legacy)
        localStorage.removeItem(LEGACY_KEY)
      }
    }
    if (stored) {
      historyItems.value = JSON.parse(stored)
    }
  } catch (err) {
    console.error('Failed to load history:', err)
    historyItems.value = []
  }
}

// Save to localStorage
const saveHistory = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(historyItems.value))
  } catch (err) {
    console.error('Failed to save history:', err)
  }
}

// Initialize
loadHistory()

export function useAnalysisHistory() {
  const addToHistory = (analysisResult, documentInfo) => {
    const historyItem = {
      id: Date.now(),
      timestamp: analysisResult.timestamp,
      documentName: documentInfo.name,
      promptUsed: analysisResult.promptUsed,
      content: analysisResult.content,
      model: analysisResult.model,
    }

    // Add to beginning of array
    historyItems.value.unshift(historyItem)

    // Limit history size
    if (historyItems.value.length > MAX_HISTORY_ITEMS) {
      historyItems.value = historyItems.value.slice(0, MAX_HISTORY_ITEMS)
    }

    saveHistory()
  }

  const removeFromHistory = (id) => {
    historyItems.value = historyItems.value.filter(item => item.id !== id)
    saveHistory()
  }

  const clearHistory = () => {
    historyItems.value = []
    saveHistory()
  }

  const getHistoryItem = (id) => {
    return historyItems.value.find(item => item.id === id)
  }

  return {
    history: computed(() => historyItems.value),
    addToHistory,
    removeFromHistory,
    clearHistory,
    getHistoryItem,
  }
}
