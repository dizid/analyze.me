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
          <span class="text-cyberpunk-pink">🏆</span>
          <span class="text-cyberpunk-cyan"> ACHIEVEMENTS</span>
        </h1>
        <p class="text-gray-400 text-sm font-mono">
          {{ unlockedCount }} of {{ totalAchievements }} unlocked ({{ completionPercentage }}%)
        </p>
      </div>
    </header>

    <!-- Progress Bar -->
    <div class="max-w-4xl mx-auto mb-8">
      <div class="progress-container">
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: `${completionPercentage}%` }"
          ></div>
        </div>
        <div class="progress-labels">
          <span>{{ unlockedCount }} unlocked</span>
          <span>{{ totalAchievements - unlockedCount }} remaining</span>
        </div>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="max-w-4xl mx-auto mb-6">
      <div class="filter-tabs">
        <button
          v-for="category in categories"
          :key="category.id"
          @click="selectedCategory = category.id"
          :class="[
            'filter-tab',
            { active: selectedCategory === category.id }
          ]"
        >
          <span class="tab-icon">{{ category.icon }}</span>
          <span class="tab-label">{{ category.label }}</span>
          <span class="tab-count">{{ getCategoryProgress(category.id).unlocked }}/{{ getCategoryProgress(category.id).total }}</span>
        </button>
      </div>
    </div>

    <!-- Achievements Grid -->
    <div class="max-w-4xl mx-auto">
      <div class="achievements-grid">
        <AchievementCard
          v-for="achievement in filteredAchievements"
          :key="achievement.id"
          :achievement="achievement"
          :is-unlocked="isAchievementUnlocked(achievement.id)"
          :unlocked-at="getUnlockedAt(achievement.id)"
        />
      </div>

      <p v-if="filteredAchievements.length === 0" class="no-achievements">
        No achievements in this category yet.
      </p>
    </div>

    <!-- Stats Section -->
    <div class="max-w-4xl mx-auto mt-8">
      <div class="stats-section">
        <h3 class="stats-title">Achievement Stats</h3>
        <div class="stats-grid">
          <div v-for="rarity in rarities" :key="rarity.id" class="rarity-stat">
            <span :class="['rarity-dot', `rarity-${rarity.id}`]"></span>
            <span class="rarity-label">{{ rarity.label }}</span>
            <span class="rarity-count">{{ getRarityCount(rarity.id) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGamification } from '@/composables/useGamification'
import AchievementCard from '@/components/gamification/AchievementCard.vue'
import {
  getAllAchievements,
  getAchievementsByCategory,
  ACHIEVEMENT_CATEGORIES,
} from '@/config/gamification'

defineEmits(['back'])

const {
  unlockedCount,
  totalAchievements,
  completionPercentage,
  unlockedAchievements,
  isAchievementUnlocked,
  getCategoryProgress,
} = useGamification()

const selectedCategory = ref('all')

const categories = computed(() => [
  { id: 'all', label: 'All', icon: '🎯' },
  ...Object.entries(ACHIEVEMENT_CATEGORIES).map(([id, config]) => ({
    id,
    ...config,
  })),
])

const rarities = [
  { id: 'common', label: 'Common' },
  { id: 'uncommon', label: 'Uncommon' },
  { id: 'rare', label: 'Rare' },
  { id: 'epic', label: 'Epic' },
  { id: 'legendary', label: 'Legendary' },
]

const filteredAchievements = computed(() => {
  if (selectedCategory.value === 'all') {
    return getAllAchievements()
  }
  return getAchievementsByCategory(selectedCategory.value)
})

const getUnlockedAt = (achievementId) => {
  const unlock = unlockedAchievements.value.find(a => a.id === achievementId)
  return unlock?.unlockedAt || null
}

const getRarityCount = (rarity) => {
  const all = getAllAchievements().filter(a => a.rarity === rarity)
  const unlocked = all.filter(a => isAchievementUnlocked(a.id))
  return `${unlocked.length}/${all.length}`
}
</script>

<style scoped>
.progress-container {
  background: rgba(45, 27, 61, 0.6);
  border: 1px solid rgba(0, 255, 238, 0.2);
  border-radius: 12px;
  padding: 16px;
}

.progress-bar {
  height: 12px;
  background: rgba(26, 10, 46, 0.8);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ffee, #00ff41);
  border-radius: 6px;
  transition: width 0.5s ease-out;
  box-shadow: 0 0 10px #00ffee;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(45, 27, 61, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tab:hover {
  border-color: rgba(0, 255, 238, 0.3);
  color: white;
}

.filter-tab.active {
  background: rgba(0, 255, 238, 0.1);
  border-color: #00ffee;
  color: #00ffee;
}

.tab-icon {
  font-size: 14px;
}

.tab-label {
  font-weight: 500;
}

.tab-count {
  font-size: 11px;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.no-achievements {
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  padding: 48px;
  font-size: 16px;
}

.stats-section {
  background: rgba(45, 27, 61, 0.6);
  border: 1px solid rgba(0, 255, 238, 0.2);
  border-radius: 12px;
  padding: 24px;
}

.stats-title {
  font-size: 16px;
  font-weight: bold;
  color: #00ffee;
  margin: 0 0 16px 0;
}

.stats-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.rarity-stat {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rarity-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.rarity-dot.rarity-common { background: #00ff41; }
.rarity-dot.rarity-uncommon { background: #00ffee; }
.rarity-dot.rarity-rare { background: #ff00ff; }
.rarity-dot.rarity-epic { background: #a855f7; }
.rarity-dot.rarity-legendary { background: #facc15; }

.rarity-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.rarity-count {
  font-size: 14px;
  font-weight: bold;
  color: white;
}

@media (max-width: 640px) {
  .achievements-grid {
    grid-template-columns: 1fr;
  }

  .filter-tabs {
    justify-content: center;
  }

  .stats-grid {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
