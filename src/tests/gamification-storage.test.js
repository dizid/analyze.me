import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Vue reactivity
vi.mock('vue', () => ({
  ref: (val) => ({ value: val }),
  watch: vi.fn(),
}))

describe('useGamificationStorage', () => {
  let useGamificationStorage

  beforeEach(async () => {
    vi.resetModules()
    localStorage.clear()
    const mod = await import('@/composables/useGamificationStorage')
    useGamificationStorage = mod.useGamificationStorage
  })

  // ==========================================================================
  // Default state
  // ==========================================================================
  describe('Default state initialization', () => {
    it('should create default state when localStorage is empty', () => {
      const { state } = useGamificationStorage()

      expect(state.value).toBeDefined()
      expect(state.value.version).toBe(1)
      expect(state.value.profile.totalXp).toBe(0)
      expect(state.value.profile.currentLevel).toBe(1)
      expect(state.value.stats.totalAnalyses).toBe(0)
      expect(state.value.stats.uniquePromptsUsed).toEqual([])
      expect(state.value.stats.sourcesConnected).toEqual([])
      expect(state.value.streaks.currentStreak).toBe(0)
      expect(state.value.streaks.longestStreak).toBe(0)
      expect(state.value.streaks.activityDates).toEqual([])
      expect(state.value.achievements.unlocked).toEqual([])
      expect(state.value.unlockables.unlocked).toEqual([])
      expect(state.value.unlockables.active.theme).toBe('default')
      expect(state.value.xpHistory).toEqual([])
    })

    it('should generate a UUID for profile id', () => {
      const { state } = useGamificationStorage()
      expect(state.value.profile.id).toBeDefined()
      expect(typeof state.value.profile.id).toBe('string')
    })

    it('should set createdAt timestamp', () => {
      const { state } = useGamificationStorage()
      expect(state.value.profile.createdAt).toBeDefined()
      // Should be a valid ISO string
      expect(new Date(state.value.profile.createdAt).toISOString()).toBe(state.value.profile.createdAt)
    })
  })

  // ==========================================================================
  // Loading from localStorage
  // ==========================================================================
  describe('Loading state', () => {
    it('should load existing state from localStorage', async () => {
      const existingState = {
        version: 1,
        profile: {
          id: 'existing-id',
          createdAt: '2024-01-01T00:00:00.000Z',
          totalXp: 500,
          currentLevel: 4,
          lastLoginDate: '2024-03-01',
        },
        stats: {
          totalAnalyses: 10,
          uniquePromptsUsed: ['themes', 'sentiment'],
          promptCounts: { themes: 5, sentiment: 5 },
          sourcesConnected: ['google'],
          sentimentAnalyses: 5,
          nightAnalyses: 0,
          earlyAnalyses: 0,
          weekendAnalyses: 2,
          exportCount: 3,
          copyCount: 1,
          largestDocument: 5000,
          maxAnalysesInDay: 3,
          analysesPerDay: {},
        },
        streaks: {
          currentStreak: 3,
          longestStreak: 5,
          lastActivityDate: '2024-03-01',
          activityDates: ['2024-02-28', '2024-03-01'],
        },
        achievements: {
          unlocked: [{ id: 'first_analysis', unlockedAt: '2024-01-01T00:00:00.000Z' }],
        },
        unlockables: {
          unlocked: [],
          active: { theme: 'default', profileFrame: null },
        },
        xpHistory: [{ amount: 50, reason: 'analysis_completed', timestamp: '2024-01-01', totalAfter: 50 }],
      }

      localStorage.setItem('analyze-me-gamification', JSON.stringify(existingState))

      vi.resetModules()
      const mod = await import('@/composables/useGamificationStorage')
      const { state } = mod.useGamificationStorage()

      expect(state.value.profile.totalXp).toBe(500)
      expect(state.value.profile.currentLevel).toBe(4)
      expect(state.value.stats.totalAnalyses).toBe(10)
      expect(state.value.streaks.currentStreak).toBe(3)
      expect(state.value.achievements.unlocked).toHaveLength(1)
    })

    it('should handle corrupted localStorage', async () => {
      localStorage.setItem('analyze-me-gamification', 'invalid-json')

      vi.resetModules()
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const mod = await import('@/composables/useGamificationStorage')
      const { state } = mod.useGamificationStorage()

      // Should fall back to default state
      expect(state.value.version).toBe(1)
      expect(state.value.profile.totalXp).toBe(0)
      consoleSpy.mockRestore()
    })
  })

  // ==========================================================================
  // State migration
  // ==========================================================================
  describe('State migration', () => {
    it('should migrate old state format to new version', async () => {
      const oldState = {
        version: 0, // old version triggers migration
        profile: {
          id: 'old-id',
          totalXp: 200,
          currentLevel: 3,
        },
        stats: {
          totalAnalyses: 5,
        },
        streaks: {
          currentStreak: 2,
        },
        achievements: {
          unlocked: [{ id: 'first_analysis', unlockedAt: '2024-01-01' }],
        },
      }

      localStorage.setItem('analyze-me-gamification', JSON.stringify(oldState))

      vi.resetModules()
      const mod = await import('@/composables/useGamificationStorage')
      const { state } = mod.useGamificationStorage()

      // Should have merged old data into new structure
      expect(state.value.version).toBe(1)
      expect(state.value.profile.totalXp).toBe(200)
      expect(state.value.stats.totalAnalyses).toBe(5)
      // New fields should have defaults
      expect(state.value.stats.sourcesConnected).toEqual([])
    })
  })

  // ==========================================================================
  // saveState
  // ==========================================================================
  describe('saveState', () => {
    it('should save state to localStorage', () => {
      const { state, saveState } = useGamificationStorage()
      state.value.profile.totalXp = 999

      saveState()

      const stored = JSON.parse(localStorage.getItem('analyze-me-gamification'))
      expect(stored.profile.totalXp).toBe(999)
    })
  })

  // ==========================================================================
  // resetState
  // ==========================================================================
  describe('resetState', () => {
    it('should reset state when confirmed', () => {
      globalThis.confirm = vi.fn(() => true)

      const { state, resetState } = useGamificationStorage()
      state.value.profile.totalXp = 5000
      state.value.stats.totalAnalyses = 50

      const result = resetState()

      expect(result).toBe(true)
      expect(state.value.profile.totalXp).toBe(0)
      expect(state.value.stats.totalAnalyses).toBe(0)
    })

    it('should not reset when user cancels', () => {
      globalThis.confirm = vi.fn(() => false)

      const { state, resetState } = useGamificationStorage()
      state.value.profile.totalXp = 5000

      const result = resetState()

      expect(result).toBe(false)
      expect(state.value.profile.totalXp).toBe(5000)
    })
  })

  // ==========================================================================
  // exportState / importState
  // ==========================================================================
  describe('Export and import', () => {
    it('should export state as JSON string', () => {
      const { state, exportState } = useGamificationStorage()
      state.value.profile.totalXp = 123

      const exported = exportState()
      const parsed = JSON.parse(exported)

      expect(parsed.profile.totalXp).toBe(123)
    })

    it('should import valid state', () => {
      const { state, importState } = useGamificationStorage()

      const importData = {
        version: 1,
        profile: { totalXp: 777, currentLevel: 7, id: 'imported', createdAt: '2024-01-01T00:00:00Z', lastLoginDate: null },
        stats: { totalAnalyses: 20, uniquePromptsUsed: [], promptCounts: {}, sourcesConnected: [], sentimentAnalyses: 0, nightAnalyses: 0, earlyAnalyses: 0, weekendAnalyses: 0, exportCount: 0, copyCount: 0, largestDocument: 0, maxAnalysesInDay: 0, analysesPerDay: {} },
        streaks: { currentStreak: 0, longestStreak: 0, lastActivityDate: null, activityDates: [] },
        achievements: { unlocked: [] },
        unlockables: { unlocked: [], active: { theme: 'default', profileFrame: null } },
        xpHistory: [],
      }

      const result = importState(JSON.stringify(importData))

      expect(result).toBe(true)
      expect(state.value.profile.totalXp).toBe(777)
    })

    it('should reject invalid import data', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { importState } = useGamificationStorage()
      const result = importState('not-json')

      expect(result).toBe(false)
      consoleSpy.mockRestore()
    })

    it('should reject import without version field', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { importState } = useGamificationStorage()
      const result = importState(JSON.stringify({ profile: { totalXp: 100 } }))

      expect(result).toBe(false)
      consoleSpy.mockRestore()
    })

    it('should reject import with version 0 (falsy check)', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { importState } = useGamificationStorage()

      // version: 0 is falsy, so importState's `if (imported.version)` fails
      const oldImport = { version: 0, profile: { totalXp: 300 }, stats: { totalAnalyses: 8 } }
      const result = importState(JSON.stringify(oldImport))

      expect(result).toBe(false)
      consoleSpy.mockRestore()
    })

    it('should migrate imported state with non-current version', () => {
      const { state, importState } = useGamificationStorage()

      // Use version 99 (truthy but != STORAGE_VERSION=1) to trigger migration
      const oldImport = {
        version: 99,
        profile: { totalXp: 300, currentLevel: 3 },
        stats: { totalAnalyses: 8 },
      }

      const result = importState(JSON.stringify(oldImport))

      expect(result).toBe(true)
      expect(state.value.version).toBe(1)
      expect(state.value.profile.totalXp).toBe(300)
    })
  })

  // ==========================================================================
  // Singleton pattern
  // ==========================================================================
  describe('Singleton pattern', () => {
    it('should return the same state across multiple calls', () => {
      const { state: state1 } = useGamificationStorage()
      const { state: state2 } = useGamificationStorage()

      // Both should reference the same object
      state1.value.profile.totalXp = 42

      expect(state2.value.profile.totalXp).toBe(42)
    })
  })
})
