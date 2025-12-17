import { ref, computed } from 'vue'

const CACHE_KEY = 'ceo-dashboard-cache'
const META_KEY = 'ceo-dashboard-meta'
const DAILY_REFRESH_HOUR = 8 // 8 AM local time

// Module-level state
const cache = ref({})
const meta = ref({ lastRefresh: null })

// Load from localStorage on init
const loadCache = () => {
  try {
    const storedCache = localStorage.getItem(CACHE_KEY)
    const storedMeta = localStorage.getItem(META_KEY)
    if (storedCache) cache.value = JSON.parse(storedCache)
    if (storedMeta) meta.value = JSON.parse(storedMeta)
  } catch (err) {
    console.error('Failed to load dashboard cache:', err)
    cache.value = {}
    meta.value = { lastRefresh: null }
  }
}

// Save to localStorage
const saveCache = () => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache.value))
    localStorage.setItem(META_KEY, JSON.stringify(meta.value))
  } catch (err) {
    console.error('Failed to save dashboard cache:', err)
  }
}

// Initialize
loadCache()

export function useCeoDashboardCache() {
  // Get cached summary for a document
  const getCachedSummary = (documentId) => {
    return cache.value[documentId] || null
  }

  // Check if cache is valid (document hasn't changed since we cached it)
  const isCacheValid = (documentId, modifiedTime) => {
    const cached = cache.value[documentId]
    if (!cached) return false

    // Cache is invalid if document was modified after we generated the summary
    return new Date(modifiedTime) <= new Date(cached.generatedAt)
  }

  // Store summary in cache
  const setCachedSummary = (documentId, data) => {
    cache.value[documentId] = {
      documentId,
      documentName: data.documentName,
      modifiedTime: data.modifiedTime,
      summary: data.summary,
      fullAnalysis: data.fullAnalysis || null,
      status: data.status || 'unknown',
      generatedAt: new Date().toISOString(),
    }
    saveCache()
  }

  // Update just the full analysis (lazy loaded)
  const setCachedFullAnalysis = (documentId, fullAnalysis) => {
    if (cache.value[documentId]) {
      cache.value[documentId].fullAnalysis = fullAnalysis
      saveCache()
    }
  }

  // Remove from cache
  const removeCachedSummary = (documentId) => {
    delete cache.value[documentId]
    saveCache()
  }

  // Clear all cache
  const clearCache = () => {
    cache.value = {}
    meta.value = { lastRefresh: null }
    saveCache()
  }

  // Update last refresh time
  const updateLastRefresh = () => {
    meta.value.lastRefresh = new Date().toISOString()
    saveCache()
  }

  // Get last refresh time
  const getLastRefreshTime = () => {
    return meta.value.lastRefresh
  }

  // Check if we should auto-refresh (daily at 8 AM)
  const shouldAutoRefresh = () => {
    if (!meta.value.lastRefresh) return true

    const lastRefresh = new Date(meta.value.lastRefresh)
    const now = new Date()

    // Get today's refresh time (8 AM)
    const todayRefreshTime = new Date(now)
    todayRefreshTime.setHours(DAILY_REFRESH_HOUR, 0, 0, 0)

    // Should refresh if we're past today's refresh time and haven't refreshed today
    return now >= todayRefreshTime && lastRefresh < todayRefreshTime
  }

  // Get all cached projects as array
  const getAllCachedProjects = () => {
    return Object.values(cache.value)
  }

  // Get status counts from cache
  const getStatusCounts = () => {
    const projects = getAllCachedProjects()
    return {
      total: projects.length,
      green: projects.filter(p => p.status === 'green' || p.status === 'ON TRACK').length,
      yellow: projects.filter(p => p.status === 'yellow' || p.status === 'NEEDS ATTENTION').length,
      red: projects.filter(p => p.status === 'red' || p.status === 'AT RISK').length,
      unknown: projects.filter(p => !p.status || p.status === 'unknown').length,
    }
  }

  return {
    cache: computed(() => cache.value),
    lastRefresh: computed(() => meta.value.lastRefresh),
    getCachedSummary,
    isCacheValid,
    setCachedSummary,
    setCachedFullAnalysis,
    removeCachedSummary,
    clearCache,
    updateLastRefresh,
    getLastRefreshTime,
    shouldAutoRefresh,
    getAllCachedProjects,
    getStatusCounts,
  }
}
