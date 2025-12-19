import { ref, watch } from 'vue'

const STORAGE_KEY = 'analyze-me-gamification'
const STORAGE_VERSION = 1

// Default state structure
const getDefaultState = () => ({
  version: STORAGE_VERSION,
  profile: {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    totalXp: 0,
    currentLevel: 1,
    lastLoginDate: null,
  },
  stats: {
    totalAnalyses: 0,
    uniquePromptsUsed: [],
    promptCounts: {},
    sourcesConnected: [],
    sentimentAnalyses: 0,
    nightAnalyses: 0,
    earlyAnalyses: 0,
    weekendAnalyses: 0,
    exportCount: 0,
    copyCount: 0,
    largestDocument: 0,
    maxAnalysesInDay: 0,
    analysesPerDay: {},
  },
  streaks: {
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    activityDates: [],
  },
  achievements: {
    unlocked: [],
  },
  unlockables: {
    unlocked: [],
    active: {
      theme: 'default',
      profileFrame: null,
    },
  },
  xpHistory: [],
})

// Singleton state
const state = ref(null)
const isInitialized = ref(false)

const loadState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)

      // Version migration if needed
      if (parsed.version !== STORAGE_VERSION) {
        return migrateState(parsed)
      }

      return parsed
    }
  } catch (err) {
    console.error('Failed to load gamification state:', err)
  }

  return getDefaultState()
}

const migrateState = (oldState) => {
  // Future migrations can be handled here
  const newState = getDefaultState()

  // Merge old data into new structure
  if (oldState.profile) {
    newState.profile = { ...newState.profile, ...oldState.profile }
  }
  if (oldState.stats) {
    newState.stats = { ...newState.stats, ...oldState.stats }
  }
  if (oldState.streaks) {
    newState.streaks = { ...newState.streaks, ...oldState.streaks }
  }
  if (oldState.achievements) {
    newState.achievements = { ...newState.achievements, ...oldState.achievements }
  }
  if (oldState.unlockables) {
    newState.unlockables = { ...newState.unlockables, ...oldState.unlockables }
  }
  if (oldState.xpHistory) {
    newState.xpHistory = oldState.xpHistory
  }

  newState.version = STORAGE_VERSION
  return newState
}

const saveState = () => {
  if (!state.value) return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value))
  } catch (err) {
    console.error('Failed to save gamification state:', err)
  }
}

// Initialize singleton
const initializeState = () => {
  if (!isInitialized.value) {
    state.value = loadState()
    isInitialized.value = true

    // Auto-save on changes
    watch(state, saveState, { deep: true })
  }
  return state
}

export function useGamificationStorage() {
  const gamificationState = initializeState()

  const resetState = () => {
    if (confirm('Are you sure you want to reset all gamification progress? This cannot be undone.')) {
      state.value = getDefaultState()
      saveState()
      return true
    }
    return false
  }

  const exportState = () => {
    return JSON.stringify(state.value, null, 2)
  }

  const importState = (jsonString) => {
    try {
      const imported = JSON.parse(jsonString)
      if (imported.version) {
        state.value = imported.version === STORAGE_VERSION
          ? imported
          : migrateState(imported)
        saveState()
        return true
      }
      throw new Error('Invalid state format')
    } catch (err) {
      console.error('Failed to import state:', err)
      return false
    }
  }

  return {
    state: gamificationState,
    saveState,
    resetState,
    exportState,
    importState,
    isInitialized,
  }
}
