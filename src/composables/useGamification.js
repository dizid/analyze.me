import { computed, onMounted } from 'vue'
import { useGamificationStorage } from './useGamificationStorage'
import { useXP } from './useXP'
import { useAchievements } from './useAchievements'
import { useStreaks } from './useStreaks'

export function useGamification() {
  const { state, resetState, exportState, importState } = useGamificationStorage()
  const {
    totalXp,
    currentLevel,
    levelTitle,
    xpProgress,
    isMaxLevel,
    addXP,
    awardAnalysisXP,
    awardDataSourceXP,
    awardExportXP,
    awardCopyXP,
    awardDailyLoginXP,
    getRecentXPHistory,
    formatXPReason,
  } = useXP()
  const {
    unlockedAchievements,
    unlockedCount,
    totalAchievements,
    completionPercentage,
    isAchievementUnlocked,
    getAchievementStatus,
    checkAchievements,
    getPendingUnlock,
    hasPendingUnlocks,
    clearPendingUnlocks,
    getNextAchievements,
    getCategoryProgress,
  } = useAchievements()
  const {
    currentStreak,
    longestStreak,
    isStreakAtRisk,
    hoursUntilStreakLost,
    updateStreak,
    getStreakEmoji,
    getStreakMessage,
  } = useStreaks()

  // Stats computed from state
  const stats = computed(() => state.value?.stats || {})
  const profile = computed(() => state.value?.profile || {})

  // Track analysis completion
  const trackAnalysis = (analysisResult, documentInfo) => {
    if (!state.value) return { xpResults: [], newAchievements: [] }

    const results = {
      xpResults: [],
      newAchievements: [],
      levelUp: false,
      previousLevel: currentLevel.value,
    }

    // Update stats
    state.value.stats.totalAnalyses++

    // Track document size
    const docSize = documentInfo?.content?.length || 0
    if (docSize > state.value.stats.largestDocument) {
      state.value.stats.largestDocument = docSize
    }

    // Track prompt usage
    if (analysisResult?.promptUsed) {
      const promptId = analysisResult.promptUsed
      if (!state.value.stats.uniquePromptsUsed.includes(promptId)) {
        state.value.stats.uniquePromptsUsed.push(promptId)
      }

      // Track prompt counts
      if (!state.value.stats.promptCounts) {
        state.value.stats.promptCounts = {}
      }
      state.value.stats.promptCounts[promptId] = (state.value.stats.promptCounts[promptId] || 0) + 1
    }

    // Track time-based stats
    const now = new Date()
    const hour = now.getHours()
    const dayOfWeek = now.getDay()

    if (hour >= 0 && hour < 5) {
      state.value.stats.nightAnalyses++
    }
    if (hour >= 5 && hour < 7) {
      state.value.stats.earlyAnalyses++
    }
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      state.value.stats.weekendAnalyses++
    }

    // Track analyses per day
    const today = now.toISOString().split('T')[0]
    if (!state.value.stats.analysesPerDay) {
      state.value.stats.analysesPerDay = {}
    }
    state.value.stats.analysesPerDay[today] = (state.value.stats.analysesPerDay[today] || 0) + 1

    // Update max analyses in a day
    if (state.value.stats.analysesPerDay[today] > state.value.stats.maxAnalysesInDay) {
      state.value.stats.maxAnalysesInDay = state.value.stats.analysesPerDay[today]
    }

    // Award XP
    results.xpResults = awardAnalysisXP(documentInfo, analysisResult?.promptUsed)

    // Check for level up
    if (currentLevel.value > results.previousLevel) {
      results.levelUp = true
      results.newLevel = currentLevel.value
    }

    // Update streak
    updateStreak()

    // Check for new achievements
    results.newAchievements = checkAchievements()

    return results
  }

  // Track data source connection
  const trackDataSourceConnected = (sourceId) => {
    if (!state.value) return null

    if (!state.value.stats.sourcesConnected.includes(sourceId)) {
      state.value.stats.sourcesConnected.push(sourceId)
      const xpResult = awardDataSourceXP(sourceId)
      const newAchievements = checkAchievements()

      return {
        xpResult,
        newAchievements,
        isNew: true,
      }
    }

    return { isNew: false }
  }

  // Track PDF export
  const trackExport = () => {
    if (!state.value) return null

    state.value.stats.exportCount++
    const xpResult = awardExportXP()
    const newAchievements = checkAchievements()

    return { xpResult, newAchievements }
  }

  // Track copy to clipboard
  const trackCopy = () => {
    if (!state.value) return null

    state.value.stats.copyCount++
    const xpResult = awardCopyXP()

    return { xpResult }
  }

  // Initialize daily login bonus
  const initializeDailyLogin = () => {
    const result = awardDailyLoginXP()
    if (result) {
      checkAchievements()
    }
    return result
  }

  // Get summary stats for display
  const getSummaryStats = () => {
    return {
      totalAnalyses: stats.value.totalAnalyses || 0,
      totalXp: totalXp.value,
      currentLevel: currentLevel.value,
      levelTitle: levelTitle.value,
      currentStreak: currentStreak.value,
      longestStreak: longestStreak.value,
      achievementsUnlocked: unlockedCount.value,
      totalAchievements: totalAchievements.value,
      sourcesConnected: stats.value.sourcesConnected?.length || 0,
      exportCount: stats.value.exportCount || 0,
    }
  }

  // Check if user is new (first time)
  const isNewUser = computed(() => {
    return (state.value?.stats?.totalAnalyses || 0) === 0
  })

  // Get account age in days
  const accountAgeDays = computed(() => {
    if (!state.value?.profile?.createdAt) return 0
    const created = new Date(state.value.profile.createdAt)
    const now = new Date()
    return Math.floor((now - created) / (1000 * 60 * 60 * 24))
  })

  // Initialize on mount
  onMounted(() => {
    initializeDailyLogin()

    // Check for first_day achievement for new users
    if (isNewUser.value) {
      checkAchievements()
    }
  })

  return {
    // State
    state,
    stats,
    profile,

    // XP & Levels
    totalXp,
    currentLevel,
    levelTitle,
    xpProgress,
    isMaxLevel,
    addXP,
    getRecentXPHistory,
    formatXPReason,

    // Streaks
    currentStreak,
    longestStreak,
    isStreakAtRisk,
    hoursUntilStreakLost,
    getStreakEmoji,
    getStreakMessage,

    // Achievements
    unlockedAchievements,
    unlockedCount,
    totalAchievements,
    completionPercentage,
    isAchievementUnlocked,
    getAchievementStatus,
    getPendingUnlock,
    hasPendingUnlocks,
    clearPendingUnlocks,
    getNextAchievements,
    getCategoryProgress,

    // Tracking actions
    trackAnalysis,
    trackDataSourceConnected,
    trackExport,
    trackCopy,
    initializeDailyLogin,

    // Utility
    getSummaryStats,
    isNewUser,
    accountAgeDays,
    resetState,
    exportState,
    importState,
  }
}
