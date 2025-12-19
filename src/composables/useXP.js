import { computed } from 'vue'
import { useGamificationStorage } from './useGamificationStorage'
import {
  XP_VALUES,
  calculateLevel,
  getXpForNextLevel,
  getXpProgress,
  getLevelTitle,
} from '@/config/gamification'

const MAX_XP_HISTORY = 100

export function useXP() {
  const { state } = useGamificationStorage()

  const totalXp = computed(() => state.value?.profile?.totalXp || 0)

  const currentLevel = computed(() => {
    const level = calculateLevel(totalXp.value)
    // Keep state in sync
    if (state.value && state.value.profile.currentLevel !== level) {
      state.value.profile.currentLevel = level
    }
    return level
  })

  const levelTitle = computed(() => getLevelTitle(currentLevel.value))

  const xpForNextLevel = computed(() => getXpForNextLevel(currentLevel.value))

  const xpProgress = computed(() => getXpProgress(totalXp.value, currentLevel.value))

  const isMaxLevel = computed(() => xpForNextLevel.value === null)

  const addXP = (amount, reason = 'unknown') => {
    if (!state.value || amount <= 0) return null

    const previousLevel = currentLevel.value
    state.value.profile.totalXp += amount

    // Add to history
    state.value.xpHistory.unshift({
      amount,
      reason,
      timestamp: new Date().toISOString(),
      totalAfter: state.value.profile.totalXp,
    })

    // Trim history
    if (state.value.xpHistory.length > MAX_XP_HISTORY) {
      state.value.xpHistory = state.value.xpHistory.slice(0, MAX_XP_HISTORY)
    }

    // Check for level up
    const newLevel = calculateLevel(state.value.profile.totalXp)
    const didLevelUp = newLevel > previousLevel

    if (didLevelUp) {
      state.value.profile.currentLevel = newLevel
    }

    return {
      xpGained: amount,
      totalXp: state.value.profile.totalXp,
      previousLevel,
      newLevel,
      didLevelUp,
      reason,
    }
  }

  const awardAnalysisXP = (documentInfo, promptUsed) => {
    const results = []

    // Base XP for completing analysis
    results.push(addXP(XP_VALUES.ANALYSIS_COMPLETED, 'analysis_completed'))

    // Bonus for long documents
    if (documentInfo?.content?.length > 5000) {
      results.push(addXP(XP_VALUES.LONG_DOCUMENT_BONUS, 'long_document'))
    }

    // Bonus for first time using a prompt type
    if (promptUsed && state.value) {
      if (!state.value.stats.uniquePromptsUsed.includes(promptUsed)) {
        results.push(addXP(XP_VALUES.NEW_PROMPT_TYPE, 'new_prompt_type'))
      }
    }

    return results.filter(Boolean)
  }

  const awardDataSourceXP = (sourceId) => {
    if (!state.value) return null

    // Check if this is a new data source
    if (!state.value.stats.sourcesConnected.includes(sourceId)) {
      return addXP(XP_VALUES.NEW_DATA_SOURCE_CONNECTED, `connected_${sourceId}`)
    }

    return null
  }

  const awardExportXP = () => {
    return addXP(XP_VALUES.EXPORT_PDF, 'export_pdf')
  }

  const awardCopyXP = () => {
    return addXP(XP_VALUES.COPY_RESULT, 'copy_result')
  }

  const awardDailyLoginXP = () => {
    if (!state.value) return null

    const today = new Date().toISOString().split('T')[0]
    const lastLogin = state.value.profile.lastLoginDate

    if (lastLogin !== today) {
      state.value.profile.lastLoginDate = today

      // Daily login bonus
      const dailyResult = addXP(XP_VALUES.DAILY_LOGIN, 'daily_login')

      // Streak bonus (capped at 7 days)
      const streakDays = Math.min(state.value.streaks?.currentStreak || 0, 7)
      if (streakDays > 0) {
        const streakBonus = streakDays * XP_VALUES.CONSECUTIVE_DAY_BONUS
        addXP(streakBonus, 'streak_bonus')
      }

      return dailyResult
    }

    return null
  }

  const getRecentXPHistory = (count = 10) => {
    return state.value?.xpHistory?.slice(0, count) || []
  }

  const getTotalXPThisWeek = () => {
    if (!state.value?.xpHistory) return 0

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    return state.value.xpHistory
      .filter(entry => new Date(entry.timestamp) > oneWeekAgo)
      .reduce((sum, entry) => sum + entry.amount, 0)
  }

  const formatXPReason = (reason) => {
    const reasonMap = {
      analysis_completed: 'Analysis completed',
      long_document: 'Long document bonus',
      new_prompt_type: 'New prompt type',
      connected_google: 'Connected Google Docs',
      connected_gmail: 'Connected Gmail',
      connected_calendar: 'Connected Calendar',
      connected_spotify: 'Connected Spotify',
      connected_github: 'Connected GitHub',
      connected_twitter: 'Imported Twitter',
      connected_manual: 'Used manual input',
      export_pdf: 'Exported PDF',
      copy_result: 'Copied result',
      daily_login: 'Daily login',
      streak_bonus: 'Streak bonus',
      achievement: 'Achievement unlocked',
    }

    return reasonMap[reason] || reason
  }

  return {
    totalXp,
    currentLevel,
    levelTitle,
    xpForNextLevel,
    xpProgress,
    isMaxLevel,
    addXP,
    awardAnalysisXP,
    awardDataSourceXP,
    awardExportXP,
    awardCopyXP,
    awardDailyLoginXP,
    getRecentXPHistory,
    getTotalXPThisWeek,
    formatXPReason,
  }
}
