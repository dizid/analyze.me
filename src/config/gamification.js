// XP values for different activities
export const XP_VALUES = {
  // Analysis activities
  ANALYSIS_COMPLETED: 50,
  LONG_DOCUMENT_BONUS: 25,        // Docs > 5000 chars
  NEW_PROMPT_TYPE: 30,            // First time using a prompt type

  // Data source activities
  NEW_DATA_SOURCE_CONNECTED: 100,
  DATA_SOURCE_SYNCED: 20,
  CROSS_SOURCE_ANALYSIS: 75,      // Analysis using 2+ sources

  // Engagement activities
  DAILY_LOGIN: 10,
  CONSECUTIVE_DAY_BONUS: 5,       // Per day of streak (caps at 7)
  EXPORT_PDF: 15,
  COPY_RESULT: 5,
}

// Level XP thresholds (exponential growth)
export const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  500,    // Level 4
  850,    // Level 5
  1300,   // Level 6
  1900,   // Level 7
  2700,   // Level 8
  3700,   // Level 9
  5000,   // Level 10
  6500,   // Level 11
  8200,   // Level 12
  10100,  // Level 13
  12200,  // Level 14
  14500,  // Level 15
  17000,  // Level 16
  19700,  // Level 17
  22600,  // Level 18
  25700,  // Level 19
  29000,  // Level 20
]

// Level titles for each level
export const LEVEL_TITLES = [
  'Initiate',           // 1
  'Novice',             // 2
  'Apprentice',         // 3
  'Analyst',            // 4
  'Adept',              // 5
  'Expert',             // 6
  'Master',             // 7
  'Virtuoso',           // 8
  'Sage',               // 9
  'Enlightened',        // 10
  'Transcendent',       // 11
  'Oracle',             // 12
  'Prophet',            // 13
  'Visionary',          // 14
  'Ascended',           // 15
  'Ethereal',           // 16
  'Cosmic',             // 17
  'Divine',             // 18
  'Legendary',          // 19
  'Cyberpunk God',      // 20
]

// Rarity colors for achievements
export const RARITY_CONFIG = {
  common: {
    color: 'cyberpunk-lime',
    glow: 'shadow-neon-lime',
    label: 'Common',
  },
  uncommon: {
    color: 'cyberpunk-cyan',
    glow: 'shadow-neon-cyan',
    label: 'Uncommon',
  },
  rare: {
    color: 'cyberpunk-pink',
    glow: 'shadow-neon-pink',
    label: 'Rare',
  },
  epic: {
    color: 'purple-400',
    glow: 'shadow-[0_0_20px_#a855f7]',
    label: 'Epic',
  },
  legendary: {
    color: 'yellow-400',
    glow: 'shadow-[0_0_30px_#facc15]',
    label: 'Legendary',
  },
}

// Achievement definitions
export const ACHIEVEMENTS = {
  // === ANALYSIS ACHIEVEMENTS ===
  first_analysis: {
    id: 'first_analysis',
    name: 'Neural Link Established',
    description: 'Complete your first analysis',
    icon: '🧠',
    xp: 100,
    rarity: 'common',
    category: 'analysis',
    condition: (stats) => stats.totalAnalyses >= 1,
  },
  analysis_5: {
    id: 'analysis_5',
    name: 'Getting Started',
    description: 'Complete 5 analyses',
    icon: '📊',
    xp: 100,
    rarity: 'common',
    category: 'analysis',
    condition: (stats) => stats.totalAnalyses >= 5,
  },
  analysis_10: {
    id: 'analysis_10',
    name: 'Data Miner',
    description: 'Complete 10 analyses',
    icon: '⛏️',
    xp: 200,
    rarity: 'uncommon',
    category: 'analysis',
    condition: (stats) => stats.totalAnalyses >= 10,
  },
  analysis_25: {
    id: 'analysis_25',
    name: 'Pattern Seeker',
    description: 'Complete 25 analyses',
    icon: '🔍',
    xp: 300,
    rarity: 'uncommon',
    category: 'analysis',
    condition: (stats) => stats.totalAnalyses >= 25,
  },
  analysis_50: {
    id: 'analysis_50',
    name: 'Pattern Recognition',
    description: 'Complete 50 analyses',
    icon: '🔮',
    xp: 500,
    rarity: 'rare',
    category: 'analysis',
    condition: (stats) => stats.totalAnalyses >= 50,
  },
  analysis_100: {
    id: 'analysis_100',
    name: 'Cyberpsychologist',
    description: 'Complete 100 analyses',
    icon: '🤖',
    xp: 1000,
    rarity: 'epic',
    category: 'analysis',
    condition: (stats) => stats.totalAnalyses >= 100,
  },
  analysis_250: {
    id: 'analysis_250',
    name: 'Mind Reader',
    description: 'Complete 250 analyses',
    icon: '👁️',
    xp: 2000,
    rarity: 'legendary',
    category: 'analysis',
    condition: (stats) => stats.totalAnalyses >= 250,
  },

  // === PROMPT MASTERY ACHIEVEMENTS ===
  all_prompts_used: {
    id: 'all_prompts_used',
    name: 'Full Spectrum',
    description: 'Use all 5 analysis prompt types',
    icon: '🌈',
    xp: 150,
    rarity: 'uncommon',
    category: 'prompts',
    condition: (stats) => stats.uniquePromptsUsed?.length >= 5,
  },
  sentiment_master: {
    id: 'sentiment_master',
    name: 'Emotional Intelligence',
    description: 'Run 10 sentiment analyses',
    icon: '💭',
    xp: 150,
    rarity: 'uncommon',
    category: 'prompts',
    condition: (stats) => stats.promptCounts?.sentiment >= 10,
  },
  themes_master: {
    id: 'themes_master',
    name: 'Theme Hunter',
    description: 'Run 10 themes analyses',
    icon: '🎯',
    xp: 150,
    rarity: 'uncommon',
    category: 'prompts',
    condition: (stats) => stats.promptCounts?.themes >= 10,
  },
  goals_master: {
    id: 'goals_master',
    name: 'Goal Digger',
    description: 'Run 10 goals analyses',
    icon: '📈',
    xp: 150,
    rarity: 'uncommon',
    category: 'prompts',
    condition: (stats) => stats.promptCounts?.goals >= 10,
  },

  // === DATA SOURCE ACHIEVEMENTS ===
  google_connected: {
    id: 'google_connected',
    name: 'Chrome Runner',
    description: 'Connect Google Docs',
    icon: '📄',
    xp: 50,
    rarity: 'common',
    category: 'sources',
    condition: (stats) => stats.sourcesConnected?.includes('google'),
  },
  twitter_imported: {
    id: 'twitter_imported',
    name: 'Digital Footprint',
    description: 'Import Twitter archive',
    icon: '🐦',
    xp: 75,
    rarity: 'common',
    category: 'sources',
    condition: (stats) => stats.sourcesConnected?.includes('twitter'),
  },
  manual_used: {
    id: 'manual_used',
    name: 'DIY Analyst',
    description: 'Use manual text input',
    icon: '✍️',
    xp: 25,
    rarity: 'common',
    category: 'sources',
    condition: (stats) => stats.sourcesConnected?.includes('manual'),
  },
  gmail_connected: {
    id: 'gmail_connected',
    name: 'Inbox Zero Hero',
    description: 'Connect Gmail for analysis',
    icon: '📧',
    xp: 100,
    rarity: 'uncommon',
    category: 'sources',
    condition: (stats) => stats.sourcesConnected?.includes('gmail'),
  },
  spotify_connected: {
    id: 'spotify_connected',
    name: 'Sonic Pulse',
    description: 'Connect Spotify',
    icon: '🎵',
    xp: 100,
    rarity: 'uncommon',
    category: 'sources',
    condition: (stats) => stats.sourcesConnected?.includes('spotify'),
  },
  github_connected: {
    id: 'github_connected',
    name: 'Code Walker',
    description: 'Connect GitHub',
    icon: '💻',
    xp: 100,
    rarity: 'uncommon',
    category: 'sources',
    condition: (stats) => stats.sourcesConnected?.includes('github'),
  },
  calendar_connected: {
    id: 'calendar_connected',
    name: 'Time Lord',
    description: 'Connect Google Calendar',
    icon: '📅',
    xp: 100,
    rarity: 'uncommon',
    category: 'sources',
    condition: (stats) => stats.sourcesConnected?.includes('calendar'),
  },
  multi_source_3: {
    id: 'multi_source_3',
    name: 'Data Collector',
    description: 'Connect 3 different data sources',
    icon: '🔗',
    xp: 200,
    rarity: 'uncommon',
    category: 'sources',
    condition: (stats) => stats.sourcesConnected?.length >= 3,
  },
  multi_source_5: {
    id: 'multi_source_5',
    name: 'Data Fusion',
    description: 'Connect 5 different data sources',
    icon: '⚡',
    xp: 400,
    rarity: 'rare',
    category: 'sources',
    condition: (stats) => stats.sourcesConnected?.length >= 5,
  },
  all_sources: {
    id: 'all_sources',
    name: 'Omniscient',
    description: 'Connect all available data sources',
    icon: '🌐',
    xp: 1000,
    rarity: 'legendary',
    category: 'sources',
    condition: (stats) => stats.sourcesConnected?.length >= 7,
  },

  // === STREAK ACHIEVEMENTS ===
  streak_3: {
    id: 'streak_3',
    name: 'Getting Serious',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    xp: 75,
    rarity: 'common',
    category: 'streaks',
    condition: (stats) => stats.currentStreak >= 3 || stats.longestStreak >= 3,
  },
  streak_7: {
    id: 'streak_7',
    name: 'Weekly Warrior',
    description: 'Maintain a 7-day streak',
    icon: '⚡',
    xp: 200,
    rarity: 'uncommon',
    category: 'streaks',
    condition: (stats) => stats.currentStreak >= 7 || stats.longestStreak >= 7,
  },
  streak_14: {
    id: 'streak_14',
    name: 'Fortnight Fighter',
    description: 'Maintain a 14-day streak',
    icon: '💪',
    xp: 400,
    rarity: 'rare',
    category: 'streaks',
    condition: (stats) => stats.currentStreak >= 14 || stats.longestStreak >= 14,
  },
  streak_30: {
    id: 'streak_30',
    name: 'Self-Analysis Addict',
    description: 'Maintain a 30-day streak',
    icon: '💎',
    xp: 1000,
    rarity: 'epic',
    category: 'streaks',
    condition: (stats) => stats.currentStreak >= 30 || stats.longestStreak >= 30,
  },
  streak_100: {
    id: 'streak_100',
    name: 'Centurion',
    description: 'Maintain a 100-day streak',
    icon: '👑',
    xp: 3000,
    rarity: 'legendary',
    category: 'streaks',
    condition: (stats) => stats.currentStreak >= 100 || stats.longestStreak >= 100,
  },

  // === TIME-BASED ACHIEVEMENTS ===
  night_owl: {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete analysis between 12am-5am',
    icon: '🦉',
    xp: 50,
    rarity: 'common',
    category: 'time',
    condition: (stats) => stats.nightAnalyses >= 1,
  },
  early_bird: {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete analysis between 5am-7am',
    icon: '🌅',
    xp: 50,
    rarity: 'common',
    category: 'time',
    condition: (stats) => stats.earlyAnalyses >= 1,
  },
  weekend_warrior: {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Complete 10 analyses on weekends',
    icon: '🎉',
    xp: 100,
    rarity: 'uncommon',
    category: 'time',
    condition: (stats) => stats.weekendAnalyses >= 10,
  },

  // === EXPORT ACHIEVEMENTS ===
  first_export: {
    id: 'first_export',
    name: 'Archivist',
    description: 'Export your first PDF',
    icon: '📑',
    xp: 50,
    rarity: 'common',
    category: 'export',
    condition: (stats) => stats.exportCount >= 1,
  },
  export_10: {
    id: 'export_10',
    name: 'Document Hoarder',
    description: 'Export 10 PDFs',
    icon: '📚',
    xp: 150,
    rarity: 'uncommon',
    category: 'export',
    condition: (stats) => stats.exportCount >= 10,
  },

  // === DOCUMENT SIZE ACHIEVEMENTS ===
  big_thinker: {
    id: 'big_thinker',
    name: 'Big Thinker',
    description: 'Analyze a document over 10,000 characters',
    icon: '📖',
    xp: 100,
    rarity: 'uncommon',
    category: 'documents',
    condition: (stats) => stats.largestDocument >= 10000,
  },
  novel_writer: {
    id: 'novel_writer',
    name: 'Novel Writer',
    description: 'Analyze a document over 50,000 characters',
    icon: '📕',
    xp: 300,
    rarity: 'rare',
    category: 'documents',
    condition: (stats) => stats.largestDocument >= 50000,
  },

  // === SPECIAL ACHIEVEMENTS ===
  first_day: {
    id: 'first_day',
    name: 'Day One',
    description: 'Welcome to analyze.me!',
    icon: '🎮',
    xp: 50,
    rarity: 'common',
    category: 'special',
    condition: () => true, // Always unlocked on first run
  },
  speed_demon: {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete 5 analyses in one day',
    icon: '⚡',
    xp: 150,
    rarity: 'uncommon',
    category: 'special',
    condition: (stats) => stats.maxAnalysesInDay >= 5,
  },
  marathon: {
    id: 'marathon',
    name: 'Analysis Marathon',
    description: 'Complete 10 analyses in one day',
    icon: '🏃',
    xp: 300,
    rarity: 'rare',
    category: 'special',
    condition: (stats) => stats.maxAnalysesInDay >= 10,
  },
}

// Achievement categories for filtering
export const ACHIEVEMENT_CATEGORIES = {
  analysis: { label: 'Analysis', icon: '📊' },
  prompts: { label: 'Prompts', icon: '💡' },
  sources: { label: 'Data Sources', icon: '🔌' },
  streaks: { label: 'Streaks', icon: '🔥' },
  time: { label: 'Time', icon: '⏰' },
  export: { label: 'Export', icon: '📤' },
  documents: { label: 'Documents', icon: '📄' },
  special: { label: 'Special', icon: '⭐' },
}

// Unlockable content
export const UNLOCKABLES = {
  // UI THEMES
  theme_matrix: {
    id: 'theme_matrix',
    name: 'Matrix Mode',
    description: 'Green-on-black hacker aesthetic',
    type: 'theme',
    unlockCondition: { type: 'level', value: 5 },
    cssClass: 'theme-matrix',
  },
  theme_neon_pink: {
    id: 'theme_neon_pink',
    name: 'Neon Pink',
    description: 'Pink-dominant synthwave vibes',
    type: 'theme',
    unlockCondition: { type: 'level', value: 8 },
    cssClass: 'theme-neon-pink',
  },
  theme_golden: {
    id: 'theme_golden',
    name: 'Golden Age',
    description: 'Luxurious gold and black theme',
    type: 'theme',
    unlockCondition: { type: 'level', value: 15 },
    cssClass: 'theme-golden',
  },

  // CUSTOM PROMPTS
  prompt_deep_dive: {
    id: 'prompt_deep_dive',
    name: 'Deep Psychological Dive',
    description: 'Advanced prompt for deeper analysis',
    type: 'prompt',
    unlockCondition: { type: 'achievement', value: 'analysis_50' },
  },
  prompt_future_self: {
    id: 'prompt_future_self',
    name: 'Letter to Future Self',
    description: 'Generate insights as a letter to your future self',
    type: 'prompt',
    unlockCondition: { type: 'achievement', value: 'streak_7' },
  },
  prompt_life_story: {
    id: 'prompt_life_story',
    name: 'Life Story Arc',
    description: 'Analyze your documents as chapters in your life story',
    type: 'prompt',
    unlockCondition: { type: 'level', value: 10 },
  },

  // PROFILE COSMETICS
  badge_frame_cyan: {
    id: 'badge_frame_cyan',
    name: 'Cyan Profile Frame',
    description: 'Neon cyan border for your profile',
    type: 'cosmetic',
    unlockCondition: { type: 'level', value: 3 },
  },
  badge_frame_pink: {
    id: 'badge_frame_pink',
    name: 'Pink Profile Frame',
    description: 'Hot pink border for your profile',
    type: 'cosmetic',
    unlockCondition: { type: 'level', value: 6 },
  },
  badge_frame_gold: {
    id: 'badge_frame_gold',
    name: 'Gold Profile Frame',
    description: 'Legendary gold border for your profile',
    type: 'cosmetic',
    unlockCondition: { type: 'level', value: 10 },
  },
  badge_frame_rainbow: {
    id: 'badge_frame_rainbow',
    name: 'Rainbow Profile Frame',
    description: 'Animated rainbow border',
    type: 'cosmetic',
    unlockCondition: { type: 'achievement', value: 'all_prompts_used' },
  },
}

// Helper functions
export const calculateLevel = (totalXp) => {
  let level = 1
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1
    } else {
      break
    }
  }
  return Math.min(level, LEVEL_THRESHOLDS.length)
}

export const getXpForNextLevel = (currentLevel) => {
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return null // Max level
  }
  return LEVEL_THRESHOLDS[currentLevel]
}

export const getXpProgress = (totalXp, currentLevel) => {
  const currentLevelXp = LEVEL_THRESHOLDS[currentLevel - 1] || 0
  const nextLevelXp = LEVEL_THRESHOLDS[currentLevel] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]

  const xpIntoLevel = totalXp - currentLevelXp
  const xpNeeded = nextLevelXp - currentLevelXp

  return {
    current: xpIntoLevel,
    needed: xpNeeded,
    percentage: Math.min((xpIntoLevel / xpNeeded) * 100, 100),
  }
}

export const getLevelTitle = (level) => {
  return LEVEL_TITLES[level - 1] || LEVEL_TITLES[LEVEL_TITLES.length - 1]
}

export const getAchievementById = (id) => {
  return ACHIEVEMENTS[id] || null
}

export const getAllAchievements = () => {
  return Object.values(ACHIEVEMENTS)
}

export const getAchievementsByCategory = (category) => {
  return Object.values(ACHIEVEMENTS).filter(a => a.category === category)
}

export const getUnlockableById = (id) => {
  return UNLOCKABLES[id] || null
}

export const checkUnlockableCondition = (unlockable, userStats) => {
  const { type, value } = unlockable.unlockCondition

  if (type === 'level') {
    return userStats.currentLevel >= value
  }

  if (type === 'achievement') {
    return userStats.unlockedAchievements?.includes(value)
  }

  return false
}
