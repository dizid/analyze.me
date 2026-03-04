import { ref, computed } from 'vue'

const STORAGE_KEY = 'analyze-me-journal'
const MAX_ENTRIES = 500

const entries = ref([])

const loadEntries = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      entries.value = JSON.parse(stored)
    }
  } catch (err) {
    console.error('[useJournal] Failed to load entries:', err)
    entries.value = []
  }
}

const saveEntries = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.value))
  } catch (err) {
    console.error('[useJournal] Failed to save entries:', err)
  }
}

// Initialize from localStorage once at module load
loadEntries()

/**
 * Derives a plain-text title from the first non-empty line of content.
 */
const deriveTitle = (content) => {
  if (!content) return 'Untitled Entry'
  const firstLine = content
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 0)
  if (!firstLine) return 'Untitled Entry'
  const stripped = firstLine.replace(/^#{1,6}\s*/, '').trim()
  return stripped.length > 80 ? stripped.slice(0, 77) + '...' : stripped
}

const countWords = (text) => {
  if (!text) return 0
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length
}

const todayString = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const isoToDateString = (isoString) => {
  const d = new Date(isoString)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function useJournal() {
  const sortedEntries = computed(() =>
    [...entries.value].sort((a, b) => new Date(b.date) - new Date(a.date))
  )

  const recentEntries = computed(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 6)
    cutoff.setHours(0, 0, 0, 0)
    return sortedEntries.value.filter((e) => new Date(e.date) >= cutoff)
  })

  const todayEntry = computed(() => {
    const today = todayString()
    return sortedEntries.value.find((e) => isoToDateString(e.date) === today) ?? null
  })

  const totalEntries = computed(() => entries.value.length)

  const journalStreak = computed(() => {
    if (entries.value.length === 0) return 0

    const datesWithEntries = new Set(entries.value.map((e) => isoToDateString(e.date)))
    const today = todayString()

    // Check if today or yesterday has an entry to start the streak
    let startDate = today
    if (!datesWithEntries.has(today)) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      startDate = isoToDateString(yesterday.toISOString())
    }

    if (!datesWithEntries.has(startDate)) return 0

    let streak = 0
    const cursor = new Date(startDate)
    while (datesWithEntries.has(isoToDateString(cursor.toISOString()))) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    }

    return streak
  })

  const addEntry = (data) => {
    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      mood: data.mood,
      prompt: data.prompt ?? 'free-write',
      content: data.content ?? '',
      title: deriveTitle(data.content),
      wordCount: countWords(data.content),
      analyzed: data.analyzed ?? false,
    }

    entries.value.unshift(entry)

    if (entries.value.length > MAX_ENTRIES) {
      entries.value = entries.value.slice(0, MAX_ENTRIES)
    }

    saveEntries()
    return entry
  }

  const updateEntry = (id, updates) => {
    const index = entries.value.findIndex((e) => e.id === id)
    if (index === -1) return null

    const existing = entries.value[index]
    const newContent = updates.content ?? existing.content

    entries.value[index] = {
      ...existing,
      ...updates,
      content: newContent,
      title: deriveTitle(newContent),
      wordCount: countWords(newContent),
    }

    saveEntries()
    return entries.value[index]
  }

  const deleteEntry = (id) => {
    entries.value = entries.value.filter((e) => e.id !== id)
    saveEntries()
  }

  const getEntry = (id) => entries.value.find((e) => e.id === id)

  const getEntriesByMood = (mood) =>
    sortedEntries.value.filter((e) => e.mood === mood)

  const getEntriesByDateRange = (from, to) => {
    const start = new Date(from)
    start.setHours(0, 0, 0, 0)
    const end = new Date(to)
    end.setHours(23, 59, 59, 999)
    return sortedEntries.value.filter((e) => {
      const d = new Date(e.date)
      return d >= start && d <= end
    })
  }

  return {
    entries: sortedEntries,
    recentEntries,
    todayEntry,
    totalEntries,
    journalStreak,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntry,
    getEntriesByMood,
    getEntriesByDateRange,
  }
}
