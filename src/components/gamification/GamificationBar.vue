<template>
  <div class="gamification-bar">
    <!-- Level Badge -->
    <LevelBadge :level="currentLevel" size="md" />

    <!-- XP Progress -->
    <div class="xp-section">
      <div class="level-info">
        <span class="level-title">{{ levelTitle }}</span>
      </div>
      <XPBar :xp-progress="xpProgress" />
    </div>

    <!-- Streak Display -->
    <StreakDisplay
      :streak="currentStreak"
      :longest-streak="longestStreak"
      :is-at-risk="isStreakAtRisk"
      :hours-left="hoursUntilStreakLost"
    />

    <!-- Achievements Preview -->
    <button
      class="achievements-button"
      @click="$emit('show-achievements')"
    >
      <span class="achievement-icon">🏆</span>
      <span class="achievement-count">{{ unlockedCount }}/{{ totalAchievements }}</span>
    </button>
  </div>
</template>

<script setup>
import { useGamification } from '@/composables/useGamification'
import LevelBadge from './LevelBadge.vue'
import XPBar from './XPBar.vue'
import StreakDisplay from './StreakDisplay.vue'

defineEmits(['show-achievements'])

const {
  currentLevel,
  levelTitle,
  xpProgress,
  currentStreak,
  longestStreak,
  isStreakAtRisk,
  hoursUntilStreakLost,
  unlockedCount,
  totalAchievements,
} = useGamification()
</script>

<style scoped>
.gamification-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: rgba(45, 27, 61, 0.6);
  border: 1px solid rgba(0, 255, 238, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.xp-section {
  flex: 1;
  min-width: 150px;
  max-width: 250px;
}

.level-info {
  margin-bottom: 4px;
}

.level-title {
  font-size: 12px;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.achievements-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(255, 200, 0, 0.1);
  border: 1px solid rgba(255, 200, 0, 0.3);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.achievements-button:hover {
  background: rgba(255, 200, 0, 0.2);
  border-color: rgba(255, 200, 0, 0.5);
  box-shadow: 0 0 15px rgba(255, 200, 0, 0.2);
}

.achievement-icon {
  font-size: 16px;
}

.achievement-count {
  font-family: 'Orbitron', sans-serif;
  font-size: 12px;
  font-weight: bold;
  color: #ffc800;
}

@media (max-width: 768px) {
  .gamification-bar {
    flex-wrap: wrap;
    justify-content: center;
  }

  .xp-section {
    order: 3;
    width: 100%;
    max-width: none;
    margin-top: 8px;
  }
}
</style>
