import { computed } from 'vue'
import { useGamificationStorage } from './useGamificationStorage'

const GRACE_PERIOD_HOURS = 36

export function useStreaks() {
  const { state } = useGamificationStorage()

  const currentStreak = computed(() => state.value?.streaks?.currentStreak || 0)
  const longestStreak = computed(() => state.value?.streaks?.longestStreak || 0)
  const lastActivityDate = computed(() => state.value?.streaks?.lastActivityDate)

  const getDateString = (date) => {
    return date.toISOString().split('T')[0]
  }

  const calculateStreak = (activityDates) => {
    if (!activityDates || activityDates.length === 0) return 0

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Sort dates descending (most recent first)
    const sortedDates = [...new Set(activityDates)]
      .map(d => new Date(d))
      .sort((a, b) => b - a)

    // Check if there's recent activity (today or yesterday)
    const mostRecent = sortedDates[0]
    mostRecent.setHours(0, 0, 0, 0)

    const daysSinceActivity = Math.floor((today - mostRecent) / (1000 * 60 * 60 * 24))

    // If more than 1 day has passed without activity, streak is broken
    if (daysSinceActivity > 1) return 0

    // Count consecutive days
    let streak = 0
    let checkDate = new Date(today)

    // If no activity today, start checking from yesterday
    if (daysSinceActivity === 1) {
      checkDate.setDate(checkDate.getDate() - 1)
    }

    const dateStrings = sortedDates.map(d => getDateString(d))

    for (let i = 0; i < 365; i++) {
      const dateStr = getDateString(checkDate)

      if (dateStrings.includes(dateStr)) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  const updateStreak = () => {
    if (!state.value) return

    const today = getDateString(new Date())
    const streaks = state.value.streaks

    // Add today to activity dates if not already there
    if (!streaks.activityDates.includes(today)) {
      streaks.activityDates.push(today)

      // Keep only last 365 days
      if (streaks.activityDates.length > 365) {
        streaks.activityDates = streaks.activityDates.slice(-365)
      }
    }

    // Calculate new streak
    const newStreak = calculateStreak(streaks.activityDates)
    streaks.currentStreak = newStreak
    streaks.lastActivityDate = today

    // Update longest streak if needed
    if (newStreak > streaks.longestStreak) {
      streaks.longestStreak = newStreak
    }

    return newStreak
  }

  const isStreakAtRisk = computed(() => {
    if (!lastActivityDate.value) return false

    const today = new Date()
    const lastActivity = new Date(lastActivityDate.value)
    const hoursSinceActivity = (today - lastActivity) / (1000 * 60 * 60)

    // Streak is at risk if more than 20 hours have passed
    return hoursSinceActivity > 20 && currentStreak.value > 0
  })

  const hoursUntilStreakLost = computed(() => {
    if (!lastActivityDate.value) return null

    const lastActivity = new Date(lastActivityDate.value)
    lastActivity.setHours(23, 59, 59, 999)

    const deadline = new Date(lastActivity)
    deadline.setDate(deadline.getDate() + 1)

    const now = new Date()
    const hoursLeft = (deadline - now) / (1000 * 60 * 60)

    return Math.max(0, Math.floor(hoursLeft))
  })

  const getStreakEmoji = (streak) => {
    if (streak >= 100) return '👑'
    if (streak >= 30) return '💎'
    if (streak >= 14) return '💪'
    if (streak >= 7) return '⚡'
    if (streak >= 3) return '🔥'
    return '✨'
  }

  const getStreakMessage = (streak) => {
    if (streak >= 100) return 'LEGENDARY!'
    if (streak >= 30) return 'Unstoppable!'
    if (streak >= 14) return 'On Fire!'
    if (streak >= 7) return 'Crushing it!'
    if (streak >= 3) return 'Building momentum!'
    if (streak >= 1) return 'Keep going!'
    return 'Start your streak!'
  }

  return {
    currentStreak,
    longestStreak,
    lastActivityDate,
    isStreakAtRisk,
    hoursUntilStreakLost,
    updateStreak,
    calculateStreak,
    getStreakEmoji,
    getStreakMessage,
  }
}
