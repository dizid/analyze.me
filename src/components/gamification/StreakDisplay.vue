<template>
  <div
    class="streak-display"
    :class="{ 'at-risk': isAtRisk, 'has-streak': streak > 0 }"
    @mouseenter="showTooltip = true"
    @mouseleave="showTooltip = false"
  >
    <div class="streak-icon">
      <span class="streak-emoji">{{ emoji }}</span>
      <div v-if="streak > 0" class="streak-fire-particles">
        <span v-for="i in 3" :key="i" class="particle"></span>
      </div>
    </div>

    <div class="streak-info">
      <span class="streak-count">{{ streak }}</span>
      <span class="streak-label">day{{ streak !== 1 ? 's' : '' }}</span>
    </div>

    <!-- At risk indicator -->
    <div v-if="isAtRisk && hoursLeft !== null" class="streak-warning">
      <span class="warning-icon">⚠️</span>
      <span class="warning-text">{{ hoursLeft }}h left</span>
    </div>

    <!-- Tooltip -->
    <transition name="fade">
      <div v-if="showTooltip" class="streak-tooltip">
        <div class="tooltip-header">
          <span class="tooltip-emoji">{{ emoji }}</span>
          <span class="tooltip-title">{{ message }}</span>
        </div>
        <div class="tooltip-stats">
          <div class="stat">
            <span class="stat-label">Current</span>
            <span class="stat-value">{{ streak }} days</span>
          </div>
          <div class="stat">
            <span class="stat-label">Best</span>
            <span class="stat-value">{{ longestStreak }} days</span>
          </div>
        </div>
        <div v-if="isAtRisk" class="tooltip-warning">
          Complete an analysis to keep your streak!
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  streak: {
    type: Number,
    default: 0,
  },
  longestStreak: {
    type: Number,
    default: 0,
  },
  isAtRisk: {
    type: Boolean,
    default: false,
  },
  hoursLeft: {
    type: Number,
    default: null,
  },
})

const showTooltip = ref(false)

const emoji = computed(() => {
  if (props.streak >= 100) return '👑'
  if (props.streak >= 30) return '💎'
  if (props.streak >= 14) return '💪'
  if (props.streak >= 7) return '⚡'
  if (props.streak >= 3) return '🔥'
  if (props.streak >= 1) return '✨'
  return '💤'
})

const message = computed(() => {
  if (props.streak >= 100) return 'LEGENDARY!'
  if (props.streak >= 30) return 'Unstoppable!'
  if (props.streak >= 14) return 'On Fire!'
  if (props.streak >= 7) return 'Crushing it!'
  if (props.streak >= 3) return 'Building momentum!'
  if (props.streak >= 1) return 'Keep going!'
  return 'Start your streak!'
})
</script>

<style scoped>
.streak-display {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(45, 27, 61, 0.6);
  border: 1px solid rgba(255, 100, 0, 0.3);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.streak-display.has-streak {
  border-color: rgba(255, 100, 0, 0.5);
  box-shadow: 0 0 10px rgba(255, 100, 0, 0.2);
}

.streak-display.at-risk {
  animation: pulse-warning 1.5s ease-in-out infinite;
}

@keyframes pulse-warning {
  0%, 100% {
    border-color: rgba(255, 100, 0, 0.5);
    box-shadow: 0 0 10px rgba(255, 100, 0, 0.2);
  }
  50% {
    border-color: rgba(255, 200, 0, 0.8);
    box-shadow: 0 0 20px rgba(255, 200, 0, 0.4);
  }
}

.streak-icon {
  position: relative;
  font-size: 18px;
  line-height: 1;
}

.streak-emoji {
  position: relative;
  z-index: 1;
}

.streak-fire-particles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #ff6400;
  border-radius: 50%;
  animation: float-up 1.5s ease-out infinite;
}

.particle:nth-child(1) {
  left: -4px;
  animation-delay: 0s;
}

.particle:nth-child(2) {
  left: 0;
  animation-delay: 0.3s;
}

.particle:nth-child(3) {
  left: 4px;
  animation-delay: 0.6s;
}

@keyframes float-up {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-15px) scale(0);
    opacity: 0;
  }
}

.streak-info {
  display: flex;
  align-items: baseline;
  gap: 3px;
}

.streak-count {
  font-family: 'Orbitron', sans-serif;
  font-size: 16px;
  font-weight: bold;
  color: #ff9500;
  text-shadow: 0 0 10px rgba(255, 149, 0, 0.5);
}

.streak-label {
  font-size: 10px;
  color: rgba(255, 149, 0, 0.7);
  text-transform: uppercase;
}

.streak-warning {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: 4px;
  padding: 2px 6px;
  background: rgba(255, 200, 0, 0.2);
  border-radius: 10px;
}

.warning-icon {
  font-size: 10px;
}

.warning-text {
  font-size: 10px;
  color: #ffc800;
  font-weight: bold;
}

/* Tooltip */
.streak-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 10px;
  padding: 12px 16px;
  background: rgba(26, 10, 46, 0.95);
  border: 1px solid rgba(255, 149, 0, 0.3);
  border-radius: 8px;
  min-width: 180px;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.streak-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: rgba(255, 149, 0, 0.3);
}

.tooltip-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 149, 0, 0.2);
}

.tooltip-emoji {
  font-size: 20px;
}

.tooltip-title {
  font-size: 14px;
  font-weight: bold;
  color: #ff9500;
}

.tooltip-stats {
  display: flex;
  justify-content: space-between;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
}

.stat-value {
  font-size: 14px;
  font-weight: bold;
  color: white;
}

.tooltip-warning {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 149, 0, 0.2);
  font-size: 11px;
  color: #ffc800;
  text-align: center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(5px);
}
</style>
