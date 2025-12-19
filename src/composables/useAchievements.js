import { ref, computed } from 'vue'
import { useGamificationStorage } from './useGamificationStorage'
import { useXP } from './useXP'
import {
  getAllAchievements,
  getAchievementById,
  getAchievementsByCategory,
  RARITY_CONFIG,
} from '@/config/gamification'

// Queue for achievement unlock notifications
const pendingUnlocks = ref([])

export function useAchievements() {
  const { state } = useGamificationStorage()
  const { addXP } = useXP()

  const unlockedAchievements = computed(() => {
    return state.value?.achievements?.unlocked || []
  })

  const unlockedAchievementIds = computed(() => {
    return unlockedAchievements.value.map(a => a.id)
  })

  const totalAchievements = computed(() => getAllAchievements().length)

  const unlockedCount = computed(() => unlockedAchievements.value.length)

  const completionPercentage = computed(() => {
    return Math.round((unlockedCount.value / totalAchievements.value) * 100)
  })

  const isAchievementUnlocked = (achievementId) => {
    return unlockedAchievementIds.value.includes(achievementId)
  }

  const getAchievementStatus = (achievementId) => {
    const achievement = getAchievementById(achievementId)
    if (!achievement) return null

    const unlockInfo = unlockedAchievements.value.find(a => a.id === achievementId)

    return {
      ...achievement,
      isUnlocked: !!unlockInfo,
      unlockedAt: unlockInfo?.unlockedAt || null,
      rarity: RARITY_CONFIG[achievement.rarity],
    }
  }

  const unlockAchievement = (achievementId) => {
    if (!state.value || isAchievementUnlocked(achievementId)) return null

    const achievement = getAchievementById(achievementId)
    if (!achievement) return null

    // Add to unlocked list
    const unlockData = {
      id: achievementId,
      unlockedAt: new Date().toISOString(),
    }

    state.value.achievements.unlocked.push(unlockData)

    // Award XP
    if (achievement.xp > 0) {
      addXP(achievement.xp, 'achievement')
    }

    // Add to pending notifications queue
    pendingUnlocks.value.push({
      ...achievement,
      unlockedAt: unlockData.unlockedAt,
    })

    return {
      achievement,
      unlockedAt: unlockData.unlockedAt,
    }
  }

  const checkAchievements = () => {
    if (!state.value) return []

    const newlyUnlocked = []
    const allAchievements = getAllAchievements()

    // Build stats object for condition checking
    const stats = {
      ...state.value.stats,
      currentStreak: state.value.streaks?.currentStreak || 0,
      longestStreak: state.value.streaks?.longestStreak || 0,
      unlockedAchievements: unlockedAchievementIds.value,
      currentLevel: state.value.profile?.currentLevel || 1,
    }

    for (const achievement of allAchievements) {
      // Skip already unlocked
      if (isAchievementUnlocked(achievement.id)) continue

      // Check condition
      try {
        if (achievement.condition(stats)) {
          const result = unlockAchievement(achievement.id)
          if (result) {
            newlyUnlocked.push(result)
          }
        }
      } catch (err) {
        console.error(`Error checking achievement ${achievement.id}:`, err)
      }
    }

    return newlyUnlocked
  }

  const getPendingUnlock = () => {
    return pendingUnlocks.value.shift() || null
  }

  const hasPendingUnlocks = computed(() => pendingUnlocks.value.length > 0)

  const clearPendingUnlocks = () => {
    pendingUnlocks.value = []
  }

  const getAchievementsByRarity = (rarity) => {
    return getAllAchievements().filter(a => a.rarity === rarity)
  }

  const getUnlockedByCategory = (category) => {
    const categoryAchievements = getAchievementsByCategory(category)
    return categoryAchievements.filter(a => isAchievementUnlocked(a.id))
  }

  const getCategoryProgress = (category) => {
    const categoryAchievements = category === 'all'
      ? getAllAchievements()
      : getAchievementsByCategory(category)
    const unlocked = categoryAchievements.filter(a => isAchievementUnlocked(a.id))

    return {
      total: categoryAchievements.length,
      unlocked: unlocked.length,
      percentage: categoryAchievements.length > 0
        ? Math.round((unlocked.length / categoryAchievements.length) * 100)
        : 0,
    }
  }

  const getNextAchievements = (count = 3) => {
    // Get achievements that are close to being unlocked
    const allAchievements = getAllAchievements()
    const locked = allAchievements.filter(a => !isAchievementUnlocked(a.id))

    // Sort by rarity (common first) and return top N
    const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary']
    locked.sort((a, b) => rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity))

    return locked.slice(0, count)
  }

  const getTotalXPFromAchievements = () => {
    return unlockedAchievements.value.reduce((total, unlock) => {
      const achievement = getAchievementById(unlock.id)
      return total + (achievement?.xp || 0)
    }, 0)
  }

  return {
    unlockedAchievements,
    unlockedAchievementIds,
    totalAchievements,
    unlockedCount,
    completionPercentage,
    isAchievementUnlocked,
    getAchievementStatus,
    unlockAchievement,
    checkAchievements,
    getPendingUnlock,
    hasPendingUnlocks,
    clearPendingUnlocks,
    getAchievementsByRarity,
    getUnlockedByCategory,
    getCategoryProgress,
    getNextAchievements,
    getTotalXPFromAchievements,
  }
}
