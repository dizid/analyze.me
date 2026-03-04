import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Vue
vi.mock('vue', () => ({
  ref: (val) => ({ value: val }),
  computed: (fn) => ({ value: fn() }),
}))

describe('useAnalysisHistory', () => {
  let useAnalysisHistory

  beforeEach(async () => {
    vi.resetModules()
    localStorage.clear()
    const mod = await import('@/composables/useAnalysisHistory')
    useAnalysisHistory = mod.useAnalysisHistory
  })

  // ==========================================================================
  // addToHistory
  // ==========================================================================
  describe('addToHistory', () => {
    it('should add an item to the beginning of history', () => {
      const { addToHistory, history } = useAnalysisHistory()

      addToHistory(
        { timestamp: '2024-01-01T00:00:00Z', promptUsed: 'themes', content: 'Analysis result', model: 'claude-sonnet-4-20250514' },
        { name: 'test-doc.txt' }
      )

      // history is a computed, check the underlying storage
      const stored = JSON.parse(localStorage.getItem('analyze-me-history'))
      expect(stored).toHaveLength(1)
      expect(stored[0].documentName).toBe('test-doc.txt')
      expect(stored[0].promptUsed).toBe('themes')
    })

    it('should limit history to 50 items', () => {
      const { addToHistory } = useAnalysisHistory()

      for (let i = 0; i < 55; i++) {
        addToHistory(
          { timestamp: `2024-01-01T00:00:${String(i).padStart(2, '0')}Z`, promptUsed: 'themes', content: `Result ${i}`, model: 'test' },
          { name: `doc-${i}.txt` }
        )
      }

      const stored = JSON.parse(localStorage.getItem('analyze-me-history'))
      expect(stored).toHaveLength(50)
      // Most recent should be first
      expect(stored[0].documentName).toBe('doc-54.txt')
    })
  })

  // ==========================================================================
  // removeFromHistory
  // ==========================================================================
  describe('removeFromHistory', () => {
    it('should remove specific item by id', () => {
      const { addToHistory, removeFromHistory } = useAnalysisHistory()

      addToHistory(
        { timestamp: '2024-01-01', promptUsed: 'themes', content: 'R1', model: 'test' },
        { name: 'doc1.txt' }
      )

      const stored = JSON.parse(localStorage.getItem('analyze-me-history'))
      const id = stored[0].id

      removeFromHistory(id)

      const afterRemove = JSON.parse(localStorage.getItem('analyze-me-history'))
      expect(afterRemove).toHaveLength(0)
    })
  })

  // ==========================================================================
  // clearHistory
  // ==========================================================================
  describe('clearHistory', () => {
    it('should clear all history items', () => {
      const { addToHistory, clearHistory } = useAnalysisHistory()

      addToHistory(
        { timestamp: '2024-01-01', promptUsed: 'themes', content: 'R1', model: 'test' },
        { name: 'doc.txt' }
      )

      clearHistory()

      const stored = JSON.parse(localStorage.getItem('analyze-me-history'))
      expect(stored).toHaveLength(0)
    })
  })

  // ==========================================================================
  // getHistoryItem
  // ==========================================================================
  describe('getHistoryItem', () => {
    it('should find item by id', () => {
      const { addToHistory, getHistoryItem } = useAnalysisHistory()

      addToHistory(
        { timestamp: '2024-01-01', promptUsed: 'sentiment', content: 'Mood analysis', model: 'test' },
        { name: 'diary.txt' }
      )

      const stored = JSON.parse(localStorage.getItem('analyze-me-history'))
      const item = getHistoryItem(stored[0].id)

      expect(item).toBeDefined()
      expect(item.promptUsed).toBe('sentiment')
    })

    it('should return undefined for nonexistent id', () => {
      const { getHistoryItem } = useAnalysisHistory()
      expect(getHistoryItem(99999)).toBeUndefined()
    })
  })

  // ==========================================================================
  // Persistence
  // ==========================================================================
  describe('Persistence', () => {
    it('should load existing history from localStorage', async () => {
      const existing = [
        { id: 1, timestamp: '2024-01-01', documentName: 'old.txt', promptUsed: 'themes', content: 'Old', model: 'test' },
      ]
      localStorage.setItem('analyze-me-history', JSON.stringify(existing))

      // Re-import to trigger loadHistory
      vi.resetModules()
      const mod = await import('@/composables/useAnalysisHistory')
      const { getHistoryItem } = mod.useAnalysisHistory()

      const item = getHistoryItem(1)
      expect(item).toBeDefined()
      expect(item.documentName).toBe('old.txt')
    })

    it('should handle corrupted localStorage data', async () => {
      localStorage.setItem('analyze-me-history', 'not-json')

      vi.resetModules()
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const mod = await import('@/composables/useAnalysisHistory')
      const { getHistoryItem } = mod.useAnalysisHistory()

      // Should not crash, just return empty
      expect(getHistoryItem(1)).toBeUndefined()
      consoleSpy.mockRestore()
    })
  })
})
