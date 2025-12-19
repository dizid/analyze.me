<template>
  <div
    class="achievement-card"
    :class="[
      `rarity-${achievement.rarity}`,
      { 'locked': !isUnlocked, 'unlocked': isUnlocked }
    ]"
  >
    <div class="achievement-icon">
      <span class="icon-emoji">{{ achievement.icon }}</span>
      <div v-if="!isUnlocked" class="lock-overlay">
        <span>🔒</span>
      </div>
    </div>

    <div class="achievement-content">
      <h4 class="achievement-name">{{ achievement.name }}</h4>
      <p class="achievement-description">{{ achievement.description }}</p>

      <div class="achievement-footer">
        <span class="achievement-xp">+{{ achievement.xp }} XP</span>
        <span class="achievement-rarity" :class="`rarity-${achievement.rarity}`">
          {{ rarityLabel }}
        </span>
      </div>
    </div>

    <!-- Unlocked date -->
    <div v-if="isUnlocked && unlockedAt" class="unlocked-date">
      Unlocked {{ formatDate(unlockedAt) }}
    </div>

    <!-- Glow effect for unlocked -->
    <div v-if="isUnlocked" class="achievement-glow"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RARITY_CONFIG } from '@/config/gamification'

const props = defineProps({
  achievement: {
    type: Object,
    required: true,
  },
  isUnlocked: {
    type: Boolean,
    default: false,
  },
  unlockedAt: {
    type: String,
    default: null,
  },
})

const rarityLabel = computed(() => {
  return RARITY_CONFIG[props.achievement.rarity]?.label || props.achievement.rarity
})

const formatDate = (isoString) => {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.achievement-card {
  position: relative;
  display: flex;
  gap: 12px;
  padding: 16px;
  background: rgba(45, 27, 61, 0.6);
  border: 2px solid;
  border-radius: 12px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.achievement-card.locked {
  border-color: rgba(100, 100, 100, 0.3);
  opacity: 0.6;
  filter: grayscale(70%);
}

.achievement-card.unlocked:hover {
  transform: translateY(-2px);
}

/* Rarity border colors */
.achievement-card.rarity-common.unlocked {
  border-color: #00ff41;
}

.achievement-card.rarity-uncommon.unlocked {
  border-color: #00ffee;
}

.achievement-card.rarity-rare.unlocked {
  border-color: #ff00ff;
}

.achievement-card.rarity-epic.unlocked {
  border-color: #a855f7;
}

.achievement-card.rarity-legendary.unlocked {
  border-color: #facc15;
  animation: legendary-glow 3s ease-in-out infinite;
}

@keyframes legendary-glow {
  0%, 100% {
    box-shadow: 0 0 10px rgba(250, 204, 21, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(250, 204, 21, 0.5), 0 0 30px rgba(250, 204, 21, 0.3);
  }
}

.achievement-icon {
  position: relative;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(26, 10, 46, 0.8);
  border-radius: 10px;
  font-size: 24px;
}

.lock-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 10px;
  font-size: 16px;
}

.achievement-content {
  flex: 1;
  min-width: 0;
}

.achievement-name {
  font-size: 14px;
  font-weight: bold;
  color: white;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.achievement-description {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.achievement-footer {
  display: flex;
  align-items: center;
  gap: 8px;
}

.achievement-xp {
  font-size: 11px;
  font-weight: bold;
  color: #00ff41;
  background: rgba(0, 255, 65, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.achievement-rarity {
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
}

.achievement-rarity.rarity-common {
  color: #00ff41;
  background: rgba(0, 255, 65, 0.1);
}

.achievement-rarity.rarity-uncommon {
  color: #00ffee;
  background: rgba(0, 255, 238, 0.1);
}

.achievement-rarity.rarity-rare {
  color: #ff00ff;
  background: rgba(255, 0, 255, 0.1);
}

.achievement-rarity.rarity-epic {
  color: #a855f7;
  background: rgba(168, 85, 247, 0.1);
}

.achievement-rarity.rarity-legendary {
  color: #facc15;
  background: rgba(250, 204, 21, 0.1);
}

.unlocked-date {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
}

.achievement-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: 12px;
}

.rarity-common .achievement-glow {
  box-shadow: inset 0 0 20px rgba(0, 255, 65, 0.1);
}

.rarity-uncommon .achievement-glow {
  box-shadow: inset 0 0 20px rgba(0, 255, 238, 0.1);
}

.rarity-rare .achievement-glow {
  box-shadow: inset 0 0 20px rgba(255, 0, 255, 0.1);
}

.rarity-epic .achievement-glow {
  box-shadow: inset 0 0 20px rgba(168, 85, 247, 0.1);
}

.rarity-legendary .achievement-glow {
  box-shadow: inset 0 0 30px rgba(250, 204, 21, 0.15);
}
</style>
