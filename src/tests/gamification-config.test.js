import { describe, it, expect } from 'vitest'
import {
  XP_VALUES,
  LEVEL_THRESHOLDS,
  LEVEL_TITLES,
  ACHIEVEMENTS,
  ACHIEVEMENT_CATEGORIES,
  UNLOCKABLES,
  RARITY_CONFIG,
  calculateLevel,
  getXpForNextLevel,
  getXpProgress,
  getLevelTitle,
  getAchievementById,
  getAllAchievements,
  getAchievementsByCategory,
  getUnlockableById,
  checkUnlockableCondition,
} from '@/config/gamification'

// =============================================================================
// XP_VALUES constants
// =============================================================================
describe('XP_VALUES', () => {
  it('should have positive values for all activities', () => {
    Object.entries(XP_VALUES).forEach(([key, value]) => {
      expect(value, `${key} should be positive`).toBeGreaterThan(0)
    })
  })

  it('should have expected activity XP amounts', () => {
    expect(XP_VALUES.ANALYSIS_COMPLETED).toBe(50)
    expect(XP_VALUES.LONG_DOCUMENT_BONUS).toBe(25)
    expect(XP_VALUES.NEW_PROMPT_TYPE).toBe(30)
    expect(XP_VALUES.NEW_DATA_SOURCE_CONNECTED).toBe(100)
    expect(XP_VALUES.DAILY_LOGIN).toBe(10)
    expect(XP_VALUES.CONSECUTIVE_DAY_BONUS).toBe(5)
    expect(XP_VALUES.EXPORT_PDF).toBe(15)
    expect(XP_VALUES.COPY_RESULT).toBe(5)
  })
})

// =============================================================================
// LEVEL_THRESHOLDS
// =============================================================================
describe('LEVEL_THRESHOLDS', () => {
  it('should have 20 levels', () => {
    expect(LEVEL_THRESHOLDS).toHaveLength(20)
  })

  it('should start at 0 XP for level 1', () => {
    expect(LEVEL_THRESHOLDS[0]).toBe(0)
  })

  it('should be monotonically increasing', () => {
    for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
      expect(LEVEL_THRESHOLDS[i]).toBeGreaterThan(LEVEL_THRESHOLDS[i - 1])
    }
  })

  it('should end at 29000 XP for level 20', () => {
    expect(LEVEL_THRESHOLDS[19]).toBe(29000)
  })
})

// =============================================================================
// LEVEL_TITLES
// =============================================================================
describe('LEVEL_TITLES', () => {
  it('should have a title for each level', () => {
    expect(LEVEL_TITLES).toHaveLength(20)
  })

  it('should start with Initiate and end with Cyberpunk God', () => {
    expect(LEVEL_TITLES[0]).toBe('Initiate')
    expect(LEVEL_TITLES[19]).toBe('Cyberpunk God')
  })
})

// =============================================================================
// calculateLevel()
// =============================================================================
describe('calculateLevel', () => {
  it('should return level 1 for 0 XP', () => {
    expect(calculateLevel(0)).toBe(1)
  })

  it('should return level 1 for 99 XP', () => {
    expect(calculateLevel(99)).toBe(1)
  })

  it('should return level 2 for exactly 100 XP', () => {
    expect(calculateLevel(100)).toBe(2)
  })

  it('should return level 2 for 249 XP', () => {
    expect(calculateLevel(249)).toBe(2)
  })

  it('should return level 3 for 250 XP', () => {
    expect(calculateLevel(250)).toBe(3)
  })

  it('should return level 10 for 5000 XP', () => {
    expect(calculateLevel(5000)).toBe(10)
  })

  it('should return level 20 for 29000 XP', () => {
    expect(calculateLevel(29000)).toBe(20)
  })

  it('should cap at level 20 for XP beyond max', () => {
    expect(calculateLevel(100000)).toBe(20)
  })

  it('should handle all level boundaries correctly', () => {
    LEVEL_THRESHOLDS.forEach((threshold, index) => {
      const expectedLevel = index + 1
      expect(calculateLevel(threshold)).toBe(expectedLevel)
    })
  })

  it('should handle XP just below each threshold', () => {
    for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
      expect(calculateLevel(LEVEL_THRESHOLDS[i] - 1)).toBe(i)
    }
  })
})

// =============================================================================
// getXpForNextLevel()
// =============================================================================
describe('getXpForNextLevel', () => {
  it('should return 100 for level 1 (next is level 2)', () => {
    expect(getXpForNextLevel(1)).toBe(100)
  })

  it('should return 250 for level 2', () => {
    expect(getXpForNextLevel(2)).toBe(250)
  })

  it('should return null for max level', () => {
    expect(getXpForNextLevel(20)).toBeNull()
  })

  it('should return null for levels beyond max', () => {
    expect(getXpForNextLevel(21)).toBeNull()
  })
})

// =============================================================================
// getXpProgress()
// =============================================================================
describe('getXpProgress', () => {
  it('should show 0% progress at start of level 1', () => {
    const progress = getXpProgress(0, 1)
    expect(progress.current).toBe(0)
    expect(progress.needed).toBe(100)
    expect(progress.percentage).toBe(0)
  })

  it('should show 50% progress halfway through level 1', () => {
    const progress = getXpProgress(50, 1)
    expect(progress.current).toBe(50)
    expect(progress.needed).toBe(100)
    expect(progress.percentage).toBe(50)
  })

  it('should show correct progress at start of level 2', () => {
    const progress = getXpProgress(100, 2)
    expect(progress.current).toBe(0)
    expect(progress.needed).toBe(150) // 250 - 100
    expect(progress.percentage).toBe(0)
  })

  it('should cap percentage at 100', () => {
    const progress = getXpProgress(200, 1) // Over level 1 threshold
    expect(progress.percentage).toBeLessThanOrEqual(100)
  })
})

// =============================================================================
// getLevelTitle()
// =============================================================================
describe('getLevelTitle', () => {
  it('should return Initiate for level 1', () => {
    expect(getLevelTitle(1)).toBe('Initiate')
  })

  it('should return Cyberpunk God for level 20', () => {
    expect(getLevelTitle(20)).toBe('Cyberpunk God')
  })

  it('should return last title for levels beyond max', () => {
    expect(getLevelTitle(25)).toBe('Cyberpunk God')
  })

  it('should return correct title for each level', () => {
    LEVEL_TITLES.forEach((title, index) => {
      expect(getLevelTitle(index + 1)).toBe(title)
    })
  })
})

// =============================================================================
// ACHIEVEMENTS
// =============================================================================
describe('ACHIEVEMENTS', () => {
  it('should have more than 30 achievements', () => {
    expect(Object.keys(ACHIEVEMENTS).length).toBeGreaterThan(30)
  })

  it('should have required fields on every achievement', () => {
    Object.values(ACHIEVEMENTS).forEach((achievement) => {
      expect(achievement).toHaveProperty('id')
      expect(achievement).toHaveProperty('name')
      expect(achievement).toHaveProperty('description')
      expect(achievement).toHaveProperty('icon')
      expect(achievement).toHaveProperty('xp')
      expect(achievement).toHaveProperty('rarity')
      expect(achievement).toHaveProperty('category')
      expect(achievement).toHaveProperty('condition')
      expect(typeof achievement.condition).toBe('function')
    })
  })

  it('should have valid rarity values', () => {
    const validRarities = Object.keys(RARITY_CONFIG)
    Object.values(ACHIEVEMENTS).forEach((achievement) => {
      expect(validRarities).toContain(achievement.rarity)
    })
  })

  it('should have valid category values', () => {
    const validCategories = Object.keys(ACHIEVEMENT_CATEGORIES)
    Object.values(ACHIEVEMENTS).forEach((achievement) => {
      expect(validCategories).toContain(achievement.category)
    })
  })

  it('should have non-negative XP values', () => {
    Object.values(ACHIEVEMENTS).forEach((achievement) => {
      expect(achievement.xp).toBeGreaterThanOrEqual(0)
    })
  })

  it('should have matching id and key', () => {
    Object.entries(ACHIEVEMENTS).forEach(([key, achievement]) => {
      expect(achievement.id).toBe(key)
    })
  })
})

// =============================================================================
// Achievement condition functions
// =============================================================================
describe('Achievement conditions', () => {
  // Analysis achievements
  describe('analysis achievements', () => {
    it('first_analysis unlocks at 1 analysis', () => {
      expect(ACHIEVEMENTS.first_analysis.condition({ totalAnalyses: 0 })).toBe(false)
      expect(ACHIEVEMENTS.first_analysis.condition({ totalAnalyses: 1 })).toBe(true)
    })

    it('analysis_5 unlocks at 5 analyses', () => {
      expect(ACHIEVEMENTS.analysis_5.condition({ totalAnalyses: 4 })).toBe(false)
      expect(ACHIEVEMENTS.analysis_5.condition({ totalAnalyses: 5 })).toBe(true)
    })

    it('analysis_10 unlocks at 10 analyses', () => {
      expect(ACHIEVEMENTS.analysis_10.condition({ totalAnalyses: 9 })).toBe(false)
      expect(ACHIEVEMENTS.analysis_10.condition({ totalAnalyses: 10 })).toBe(true)
    })

    it('analysis_25 unlocks at 25 analyses', () => {
      expect(ACHIEVEMENTS.analysis_25.condition({ totalAnalyses: 24 })).toBe(false)
      expect(ACHIEVEMENTS.analysis_25.condition({ totalAnalyses: 25 })).toBe(true)
    })

    it('analysis_50 unlocks at 50 analyses', () => {
      expect(ACHIEVEMENTS.analysis_50.condition({ totalAnalyses: 49 })).toBe(false)
      expect(ACHIEVEMENTS.analysis_50.condition({ totalAnalyses: 50 })).toBe(true)
    })

    it('analysis_100 unlocks at 100 analyses', () => {
      expect(ACHIEVEMENTS.analysis_100.condition({ totalAnalyses: 99 })).toBe(false)
      expect(ACHIEVEMENTS.analysis_100.condition({ totalAnalyses: 100 })).toBe(true)
    })

    it('analysis_250 unlocks at 250 analyses', () => {
      expect(ACHIEVEMENTS.analysis_250.condition({ totalAnalyses: 249 })).toBe(false)
      expect(ACHIEVEMENTS.analysis_250.condition({ totalAnalyses: 250 })).toBe(true)
    })
  })

  // Prompt mastery
  describe('prompt mastery achievements', () => {
    it('all_prompts_used unlocks at 5 unique prompts', () => {
      expect(ACHIEVEMENTS.all_prompts_used.condition({ uniquePromptsUsed: ['a', 'b', 'c', 'd'] })).toBe(false)
      expect(ACHIEVEMENTS.all_prompts_used.condition({ uniquePromptsUsed: ['a', 'b', 'c', 'd', 'e'] })).toBe(true)
    })

    it('sentiment_master unlocks at 10 sentiment analyses', () => {
      expect(ACHIEVEMENTS.sentiment_master.condition({ promptCounts: { sentiment: 9 } })).toBe(false)
      expect(ACHIEVEMENTS.sentiment_master.condition({ promptCounts: { sentiment: 10 } })).toBe(true)
    })

    it('themes_master unlocks at 10 themes analyses', () => {
      expect(ACHIEVEMENTS.themes_master.condition({ promptCounts: { themes: 10 } })).toBe(true)
    })

    it('goals_master unlocks at 10 goals analyses', () => {
      expect(ACHIEVEMENTS.goals_master.condition({ promptCounts: { goals: 10 } })).toBe(true)
    })

    it('handles missing promptCounts gracefully', () => {
      expect(ACHIEVEMENTS.sentiment_master.condition({ promptCounts: {} })).toBe(false)
      expect(ACHIEVEMENTS.sentiment_master.condition({ promptCounts: undefined })).toBe(false)
    })
  })

  // Data source achievements
  describe('data source achievements', () => {
    it('google_connected checks for google in sources', () => {
      expect(ACHIEVEMENTS.google_connected.condition({ sourcesConnected: [] })).toBe(false)
      expect(ACHIEVEMENTS.google_connected.condition({ sourcesConnected: ['google'] })).toBe(true)
    })

    it('github_connected checks for github in sources', () => {
      expect(ACHIEVEMENTS.github_connected.condition({ sourcesConnected: ['github'] })).toBe(true)
    })

    it('spotify_connected checks for spotify in sources', () => {
      expect(ACHIEVEMENTS.spotify_connected.condition({ sourcesConnected: ['spotify'] })).toBe(true)
    })

    it('multi_source_3 unlocks at 3 sources', () => {
      expect(ACHIEVEMENTS.multi_source_3.condition({ sourcesConnected: ['a', 'b'] })).toBe(false)
      expect(ACHIEVEMENTS.multi_source_3.condition({ sourcesConnected: ['a', 'b', 'c'] })).toBe(true)
    })

    it('multi_source_5 unlocks at 5 sources', () => {
      expect(ACHIEVEMENTS.multi_source_5.condition({ sourcesConnected: ['a', 'b', 'c', 'd', 'e'] })).toBe(true)
    })

    it('all_sources unlocks at 7 sources', () => {
      expect(ACHIEVEMENTS.all_sources.condition({ sourcesConnected: ['a', 'b', 'c', 'd', 'e', 'f'] })).toBe(false)
      expect(ACHIEVEMENTS.all_sources.condition({ sourcesConnected: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] })).toBe(true)
    })

    it('handles undefined sourcesConnected', () => {
      // Optional chaining returns undefined for undefined?.includes(), which is falsy
      expect(ACHIEVEMENTS.google_connected.condition({ sourcesConnected: undefined })).toBeFalsy()
      expect(ACHIEVEMENTS.multi_source_3.condition({ sourcesConnected: undefined })).toBeFalsy()
    })
  })

  // Streak achievements
  describe('streak achievements', () => {
    it('streak_3 unlocks at 3 day streak (current or longest)', () => {
      expect(ACHIEVEMENTS.streak_3.condition({ currentStreak: 2, longestStreak: 2 })).toBe(false)
      expect(ACHIEVEMENTS.streak_3.condition({ currentStreak: 3, longestStreak: 3 })).toBe(true)
      expect(ACHIEVEMENTS.streak_3.condition({ currentStreak: 0, longestStreak: 3 })).toBe(true)
    })

    it('streak_7 unlocks at 7 day streak', () => {
      expect(ACHIEVEMENTS.streak_7.condition({ currentStreak: 7, longestStreak: 7 })).toBe(true)
    })

    it('streak_14 unlocks at 14 day streak', () => {
      expect(ACHIEVEMENTS.streak_14.condition({ currentStreak: 14, longestStreak: 14 })).toBe(true)
    })

    it('streak_30 unlocks at 30 day streak', () => {
      expect(ACHIEVEMENTS.streak_30.condition({ currentStreak: 30, longestStreak: 30 })).toBe(true)
    })

    it('streak_100 unlocks at 100 day streak', () => {
      expect(ACHIEVEMENTS.streak_100.condition({ currentStreak: 100, longestStreak: 100 })).toBe(true)
      expect(ACHIEVEMENTS.streak_100.condition({ currentStreak: 0, longestStreak: 99 })).toBe(false)
    })
  })

  // Time-based achievements
  describe('time-based achievements', () => {
    it('night_owl unlocks at 1 night analysis', () => {
      expect(ACHIEVEMENTS.night_owl.condition({ nightAnalyses: 0 })).toBe(false)
      expect(ACHIEVEMENTS.night_owl.condition({ nightAnalyses: 1 })).toBe(true)
    })

    it('early_bird unlocks at 1 early analysis', () => {
      expect(ACHIEVEMENTS.early_bird.condition({ earlyAnalyses: 0 })).toBe(false)
      expect(ACHIEVEMENTS.early_bird.condition({ earlyAnalyses: 1 })).toBe(true)
    })

    it('weekend_warrior unlocks at 10 weekend analyses', () => {
      expect(ACHIEVEMENTS.weekend_warrior.condition({ weekendAnalyses: 9 })).toBe(false)
      expect(ACHIEVEMENTS.weekend_warrior.condition({ weekendAnalyses: 10 })).toBe(true)
    })
  })

  // Export achievements
  describe('export achievements', () => {
    it('first_export unlocks at 1 export', () => {
      expect(ACHIEVEMENTS.first_export.condition({ exportCount: 0 })).toBe(false)
      expect(ACHIEVEMENTS.first_export.condition({ exportCount: 1 })).toBe(true)
    })

    it('export_10 unlocks at 10 exports', () => {
      expect(ACHIEVEMENTS.export_10.condition({ exportCount: 9 })).toBe(false)
      expect(ACHIEVEMENTS.export_10.condition({ exportCount: 10 })).toBe(true)
    })
  })

  // Document size achievements
  describe('document size achievements', () => {
    it('big_thinker unlocks at 10000 char document', () => {
      expect(ACHIEVEMENTS.big_thinker.condition({ largestDocument: 9999 })).toBe(false)
      expect(ACHIEVEMENTS.big_thinker.condition({ largestDocument: 10000 })).toBe(true)
    })

    it('novel_writer unlocks at 50000 char document', () => {
      expect(ACHIEVEMENTS.novel_writer.condition({ largestDocument: 49999 })).toBe(false)
      expect(ACHIEVEMENTS.novel_writer.condition({ largestDocument: 50000 })).toBe(true)
    })
  })

  // Special achievements
  describe('special achievements', () => {
    it('first_day always unlocks', () => {
      expect(ACHIEVEMENTS.first_day.condition({})).toBe(true)
    })

    it('speed_demon unlocks at 5 analyses in one day', () => {
      expect(ACHIEVEMENTS.speed_demon.condition({ maxAnalysesInDay: 4 })).toBe(false)
      expect(ACHIEVEMENTS.speed_demon.condition({ maxAnalysesInDay: 5 })).toBe(true)
    })

    it('marathon unlocks at 10 analyses in one day', () => {
      expect(ACHIEVEMENTS.marathon.condition({ maxAnalysesInDay: 9 })).toBe(false)
      expect(ACHIEVEMENTS.marathon.condition({ maxAnalysesInDay: 10 })).toBe(true)
    })
  })
})

// =============================================================================
// getAchievementById()
// =============================================================================
describe('getAchievementById', () => {
  it('should return achievement by id', () => {
    const achievement = getAchievementById('first_analysis')
    expect(achievement).toBeDefined()
    expect(achievement.name).toBe('Neural Link Established')
  })

  it('should return null for unknown id', () => {
    expect(getAchievementById('nonexistent')).toBeNull()
  })
})

// =============================================================================
// getAllAchievements()
// =============================================================================
describe('getAllAchievements', () => {
  it('should return all achievements as an array', () => {
    const all = getAllAchievements()
    expect(Array.isArray(all)).toBe(true)
    expect(all.length).toBe(Object.keys(ACHIEVEMENTS).length)
  })
})

// =============================================================================
// getAchievementsByCategory()
// =============================================================================
describe('getAchievementsByCategory', () => {
  it('should filter by analysis category', () => {
    const analysis = getAchievementsByCategory('analysis')
    expect(analysis.length).toBeGreaterThan(0)
    analysis.forEach((a) => expect(a.category).toBe('analysis'))
  })

  it('should filter by streaks category', () => {
    const streaks = getAchievementsByCategory('streaks')
    expect(streaks.length).toBeGreaterThan(0)
    streaks.forEach((a) => expect(a.category).toBe('streaks'))
  })

  it('should return empty array for unknown category', () => {
    expect(getAchievementsByCategory('nonexistent')).toHaveLength(0)
  })
})

// =============================================================================
// UNLOCKABLES
// =============================================================================
describe('UNLOCKABLES', () => {
  it('should have required fields', () => {
    Object.values(UNLOCKABLES).forEach((unlockable) => {
      expect(unlockable).toHaveProperty('id')
      expect(unlockable).toHaveProperty('name')
      expect(unlockable).toHaveProperty('description')
      expect(unlockable).toHaveProperty('type')
      expect(unlockable).toHaveProperty('unlockCondition')
    })
  })

  it('should have valid types', () => {
    const validTypes = ['theme', 'prompt', 'cosmetic']
    Object.values(UNLOCKABLES).forEach((unlockable) => {
      expect(validTypes).toContain(unlockable.type)
    })
  })
})

// =============================================================================
// getUnlockableById()
// =============================================================================
describe('getUnlockableById', () => {
  it('should return unlockable by id', () => {
    expect(getUnlockableById('theme_matrix')).toBeDefined()
    expect(getUnlockableById('theme_matrix').name).toBe('Matrix Mode')
  })

  it('should return null for unknown id', () => {
    expect(getUnlockableById('nonexistent')).toBeNull()
  })
})

// =============================================================================
// checkUnlockableCondition()
// =============================================================================
describe('checkUnlockableCondition', () => {
  it('should check level-based unlock conditions', () => {
    const matrixTheme = UNLOCKABLES.theme_matrix // requires level 5
    expect(checkUnlockableCondition(matrixTheme, { currentLevel: 4 })).toBe(false)
    expect(checkUnlockableCondition(matrixTheme, { currentLevel: 5 })).toBe(true)
    expect(checkUnlockableCondition(matrixTheme, { currentLevel: 10 })).toBe(true)
  })

  it('should check achievement-based unlock conditions', () => {
    const deepDive = UNLOCKABLES.prompt_deep_dive // requires analysis_50 achievement
    expect(checkUnlockableCondition(deepDive, { unlockedAchievements: [] })).toBe(false)
    expect(checkUnlockableCondition(deepDive, { unlockedAchievements: ['analysis_50'] })).toBe(true)
  })

  it('should return false for unknown condition types', () => {
    const fake = { unlockCondition: { type: 'unknown', value: 1 } }
    expect(checkUnlockableCondition(fake, {})).toBe(false)
  })
})

// =============================================================================
// RARITY_CONFIG
// =============================================================================
describe('RARITY_CONFIG', () => {
  it('should have all rarity levels', () => {
    expect(RARITY_CONFIG).toHaveProperty('common')
    expect(RARITY_CONFIG).toHaveProperty('uncommon')
    expect(RARITY_CONFIG).toHaveProperty('rare')
    expect(RARITY_CONFIG).toHaveProperty('epic')
    expect(RARITY_CONFIG).toHaveProperty('legendary')
  })

  it('should have color, glow, and label for each rarity', () => {
    Object.values(RARITY_CONFIG).forEach((config) => {
      expect(config).toHaveProperty('color')
      expect(config).toHaveProperty('glow')
      expect(config).toHaveProperty('label')
    })
  })
})
