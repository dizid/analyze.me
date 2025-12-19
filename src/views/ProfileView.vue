<template>
  <div class="min-h-screen p-4 md:p-8">
    <!-- Header -->
    <header class="mb-8">
      <button
        @click="$emit('back')"
        class="neon-button px-4 py-2 text-sm border-cyberpunk-cyan text-cyberpunk-cyan hover:shadow-[var(--shadow-neon-cyan)] mb-4"
      >
        ← Back to Dashboard
      </button>

      <div class="text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-2">
          <span class="text-cyberpunk-cyan">YOUR</span>
          <span class="text-cyberpunk-pink"> PROFILE</span>
        </h1>
        <p class="text-gray-400 text-sm font-mono">
          Track your progress • Unlock achievements
        </p>
      </div>
    </header>

    <div class="max-w-4xl mx-auto space-y-8">
      <!-- Profile Card -->
      <div class="profile-card">
        <div class="profile-header">
          <div class="level-display">
            <LevelBadge :level="currentLevel" size="xl" />
            <div class="level-details">
              <h2 class="level-title">{{ levelTitle }}</h2>
              <p class="level-label">Level {{ currentLevel }}</p>
            </div>
          </div>

          <div class="xp-display">
            <div class="total-xp">
              <span class="xp-value">{{ formatNumber(totalXp) }}</span>
              <span class="xp-label">Total XP</span>
            </div>
            <XPBar :xp-progress="xpProgress" :show-level-markers="true" />
            <p class="next-level-text" v-if="!isMaxLevel">
              {{ formatNumber(xpProgress.needed - xpProgress.current) }} XP to Level {{ currentLevel + 1 }}
            </p>
            <p class="max-level-text" v-else>
              Maximum Level Reached!
            </p>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-icon">📊</span>
            <span class="stat-value">{{ stats.totalAnalyses || 0 }}</span>
            <span class="stat-label">Analyses</span>
          </div>

          <div class="stat-card streak">
            <span class="stat-icon">{{ getStreakEmoji(currentStreak) }}</span>
            <span class="stat-value">{{ currentStreak }}</span>
            <span class="stat-label">Day Streak</span>
          </div>

          <div class="stat-card">
            <span class="stat-icon">🏆</span>
            <span class="stat-value">{{ unlockedCount }}/{{ totalAchievements }}</span>
            <span class="stat-label">Achievements</span>
          </div>

          <div class="stat-card">
            <span class="stat-icon">🔌</span>
            <span class="stat-value">{{ stats.sourcesConnected?.length || 0 }}</span>
            <span class="stat-label">Sources</span>
          </div>
        </div>
      </div>

      <!-- Streak Section -->
      <div class="cyberpunk-panel">
        <h3 class="section-title">
          <span class="title-icon">🔥</span>
          Streak Status
        </h3>

        <div class="streak-details">
          <div class="streak-current">
            <span class="streak-emoji-large">{{ getStreakEmoji(currentStreak) }}</span>
            <div class="streak-info">
              <span class="streak-number">{{ currentStreak }}</span>
              <span class="streak-text">{{ getStreakMessage(currentStreak) }}</span>
            </div>
          </div>

          <div class="streak-stats">
            <div class="streak-stat">
              <span class="stat-label">Longest Streak</span>
              <span class="stat-value">{{ longestStreak }} days</span>
            </div>
            <div v-if="isStreakAtRisk" class="streak-warning">
              <span class="warning-icon">⚠️</span>
              <span>{{ hoursUntilStreakLost }}h until streak is lost!</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent XP History -->
      <div class="cyberpunk-panel">
        <h3 class="section-title">
          <span class="title-icon">⚡</span>
          Recent Activity
        </h3>

        <div class="xp-history">
          <div
            v-for="(entry, index) in recentXPHistory"
            :key="index"
            class="xp-entry"
          >
            <div class="entry-info">
              <span class="entry-reason">{{ formatXPReason(entry.reason) }}</span>
              <span class="entry-time">{{ formatTimeAgo(entry.timestamp) }}</span>
            </div>
            <span class="entry-xp">+{{ entry.amount }} XP</span>
          </div>

          <p v-if="recentXPHistory.length === 0" class="no-activity">
            Complete analyses to start earning XP!
          </p>
        </div>
      </div>

      <!-- Next Achievements -->
      <div class="cyberpunk-panel">
        <div class="section-header">
          <h3 class="section-title">
            <span class="title-icon">🎯</span>
            Next Achievements
          </h3>
          <button
            @click="$emit('navigate', 'achievements')"
            class="view-all-button"
          >
            View All →
          </button>
        </div>

        <div class="achievements-preview">
          <AchievementCard
            v-for="achievement in nextAchievements"
            :key="achievement.id"
            :achievement="achievement"
            :is-unlocked="false"
          />
        </div>
      </div>

      <!-- Account Info -->
      <div class="cyberpunk-panel">
        <h3 class="section-title">
          <span class="title-icon">ℹ️</span>
          Account Info
        </h3>

        <div class="account-info">
          <div class="info-row">
            <span class="info-label">Member Since</span>
            <span class="info-value">{{ memberSince }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Account Age</span>
            <span class="info-value">{{ accountAgeDays }} days</span>
          </div>
          <div class="info-row">
            <span class="info-label">XP This Week</span>
            <span class="info-value">{{ formatNumber(xpThisWeek) }} XP</span>
          </div>
        </div>

        <div class="account-actions">
          <button @click="handleExportData" class="action-button">
            Export Data
          </button>
          <button @click="handleResetProgress" class="action-button danger">
            Reset Progress
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGamification } from '@/composables/useGamification'
import LevelBadge from '@/components/gamification/LevelBadge.vue'
import XPBar from '@/components/gamification/XPBar.vue'
import AchievementCard from '@/components/gamification/AchievementCard.vue'

defineEmits(['back', 'navigate'])

const {
  totalXp,
  currentLevel,
  levelTitle,
  xpProgress,
  isMaxLevel,
  currentStreak,
  longestStreak,
  isStreakAtRisk,
  hoursUntilStreakLost,
  unlockedCount,
  totalAchievements,
  stats,
  profile,
  accountAgeDays,
  getStreakEmoji,
  getStreakMessage,
  getNextAchievements,
  getRecentXPHistory,
  formatXPReason,
  exportState,
  resetState,
} = useGamification()

const recentXPHistory = computed(() => getRecentXPHistory(10))
const nextAchievements = computed(() => getNextAchievements(3))

const xpThisWeek = computed(() => {
  const history = getRecentXPHistory(100)
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  return history
    .filter(entry => new Date(entry.timestamp) > oneWeekAgo)
    .reduce((sum, entry) => sum + entry.amount, 0)
})

const memberSince = computed(() => {
  if (!profile.value?.createdAt) return 'Unknown'
  return new Date(profile.value.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
})

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num?.toString() || '0'
}

const formatTimeAgo = (timestamp) => {
  const now = new Date()
  const date = new Date(timestamp)
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

const handleExportData = () => {
  const data = exportState()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `analyze-me-profile-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const handleResetProgress = () => {
  resetState()
}
</script>

<style scoped>
.profile-card {
  background: rgba(45, 27, 61, 0.6);
  border: 2px solid rgba(0, 255, 238, 0.3);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
}

.profile-header {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  margin-bottom: 32px;
}

.level-display {
  display: flex;
  align-items: center;
  gap: 16px;
}

.level-details {
  display: flex;
  flex-direction: column;
}

.level-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 24px;
  font-weight: bold;
  color: #00ffee;
  text-shadow: 0 0 10px rgba(0, 255, 238, 0.5);
  margin: 0;
}

.level-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.xp-display {
  flex: 1;
  min-width: 200px;
}

.total-xp {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
}

.total-xp .xp-value {
  font-family: 'Orbitron', sans-serif;
  font-size: 32px;
  font-weight: bold;
  color: #00ff41;
  text-shadow: 0 0 15px rgba(0, 255, 65, 0.5);
}

.total-xp .xp-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.next-level-text, .max-level-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 8px;
}

.max-level-text {
  color: #facc15;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: rgba(26, 10, 46, 0.6);
  border: 1px solid rgba(0, 255, 238, 0.2);
  border-radius: 12px;
}

.stat-card.streak {
  border-color: rgba(255, 149, 0, 0.3);
}

.stat-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.stat-card .stat-value {
  font-family: 'Orbitron', sans-serif;
  font-size: 24px;
  font-weight: bold;
  color: white;
}

.stat-card .stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.cyberpunk-panel {
  background: rgba(45, 27, 61, 0.6);
  border: 1px solid rgba(0, 255, 238, 0.2);
  border-radius: 12px;
  padding: 24px;
  backdrop-filter: blur(10px);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
  color: #00ffee;
  margin: 0 0 16px 0;
}

.title-icon {
  font-size: 20px;
}

.view-all-button {
  font-size: 14px;
  color: #00ffee;
  background: none;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.view-all-button:hover {
  opacity: 0.8;
}

.streak-details {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  align-items: center;
}

.streak-current {
  display: flex;
  align-items: center;
  gap: 16px;
}

.streak-emoji-large {
  font-size: 48px;
}

.streak-info {
  display: flex;
  flex-direction: column;
}

.streak-number {
  font-family: 'Orbitron', sans-serif;
  font-size: 36px;
  font-weight: bold;
  color: #ff9500;
  text-shadow: 0 0 15px rgba(255, 149, 0, 0.5);
}

.streak-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.streak-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.streak-stat {
  display: flex;
  gap: 8px;
}

.streak-stat .stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.streak-stat .stat-value {
  font-size: 14px;
  font-weight: bold;
  color: white;
}

.streak-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 200, 0, 0.1);
  border: 1px solid rgba(255, 200, 0, 0.3);
  border-radius: 8px;
  color: #ffc800;
  font-size: 14px;
}

.xp-history {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.xp-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(26, 10, 46, 0.4);
  border-radius: 8px;
}

.entry-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.entry-reason {
  font-size: 14px;
  color: white;
}

.entry-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.entry-xp {
  font-family: 'Orbitron', sans-serif;
  font-size: 14px;
  font-weight: bold;
  color: #00ff41;
}

.no-activity {
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  padding: 24px;
}

.achievements-preview {
  display: grid;
  gap: 12px;
}

.account-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.info-value {
  font-size: 14px;
  color: white;
}

.account-actions {
  display: flex;
  gap: 12px;
}

.action-button {
  padding: 10px 20px;
  background: transparent;
  border: 1px solid rgba(0, 255, 238, 0.3);
  border-radius: 6px;
  color: #00ffee;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button:hover {
  background: rgba(0, 255, 238, 0.1);
  border-color: rgba(0, 255, 238, 0.5);
}

.action-button.danger {
  border-color: rgba(255, 0, 100, 0.3);
  color: #ff0064;
}

.action-button.danger:hover {
  background: rgba(255, 0, 100, 0.1);
  border-color: rgba(255, 0, 100, 0.5);
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .level-display {
    flex-direction: column;
  }

  .streak-details {
    flex-direction: column;
    align-items: flex-start;
  }

  .account-actions {
    flex-direction: column;
  }
}
</style>
