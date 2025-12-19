<template>
  <div
    class="level-badge"
    :class="[sizeClass, `rarity-${rarityClass}`]"
    @mouseenter="showTooltip = true"
    @mouseleave="showTooltip = false"
  >
    <div class="level-badge-inner">
      <div class="level-number">{{ level }}</div>
      <div class="level-glow"></div>
    </div>

    <!-- Tooltip -->
    <transition name="fade">
      <div v-if="showTooltip && showDetails" class="level-tooltip">
        <div class="text-sm font-bold text-cyberpunk-cyan">{{ title }}</div>
        <div class="text-xs text-gray-400 mt-1">Level {{ level }}</div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getLevelTitle } from '@/config/gamification'

const props = defineProps({
  level: {
    type: Number,
    required: true,
    default: 1,
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg', 'xl'].includes(v),
  },
  showDetails: {
    type: Boolean,
    default: true,
  },
})

const showTooltip = ref(false)

const title = computed(() => getLevelTitle(props.level))

const sizeClass = computed(() => `size-${props.size}`)

const rarityClass = computed(() => {
  if (props.level >= 15) return 'legendary'
  if (props.level >= 10) return 'epic'
  if (props.level >= 7) return 'rare'
  if (props.level >= 4) return 'uncommon'
  return 'common'
})
</script>

<style scoped>
.level-badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.level-badge-inner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg,
    rgba(45, 27, 61, 0.9) 0%,
    rgba(26, 10, 46, 0.9) 100%
  );
  border: 2px solid;
  transition: all 0.3s ease;
}

.level-number {
  font-family: 'Orbitron', sans-serif;
  font-weight: bold;
  z-index: 1;
}

.level-glow {
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  opacity: 0.5;
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Sizes */
.size-sm .level-badge-inner {
  width: 28px;
  height: 28px;
}
.size-sm .level-number {
  font-size: 12px;
}

.size-md .level-badge-inner {
  width: 36px;
  height: 36px;
}
.size-md .level-number {
  font-size: 14px;
}

.size-lg .level-badge-inner {
  width: 48px;
  height: 48px;
}
.size-lg .level-number {
  font-size: 18px;
}

.size-xl .level-badge-inner {
  width: 64px;
  height: 64px;
}
.size-xl .level-number {
  font-size: 24px;
}

/* Rarity colors */
.rarity-common .level-badge-inner {
  border-color: #00ff41;
}
.rarity-common .level-number {
  color: #00ff41;
}
.rarity-common .level-glow {
  box-shadow: 0 0 15px #00ff41;
}

.rarity-uncommon .level-badge-inner {
  border-color: #00ffee;
}
.rarity-uncommon .level-number {
  color: #00ffee;
}
.rarity-uncommon .level-glow {
  box-shadow: 0 0 15px #00ffee;
}

.rarity-rare .level-badge-inner {
  border-color: #ff00ff;
}
.rarity-rare .level-number {
  color: #ff00ff;
}
.rarity-rare .level-glow {
  box-shadow: 0 0 15px #ff00ff;
}

.rarity-epic .level-badge-inner {
  border-color: #a855f7;
}
.rarity-epic .level-number {
  color: #a855f7;
}
.rarity-epic .level-glow {
  box-shadow: 0 0 15px #a855f7;
}

.rarity-legendary .level-badge-inner {
  border-color: #facc15;
  animation: legendary-border 3s ease-in-out infinite;
}
.rarity-legendary .level-number {
  color: #facc15;
  text-shadow: 0 0 10px #facc15;
}
.rarity-legendary .level-glow {
  box-shadow: 0 0 20px #facc15, 0 0 40px #facc15;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}

@keyframes legendary-border {
  0%, 100% {
    border-color: #facc15;
    box-shadow: 0 0 10px #facc15;
  }
  50% {
    border-color: #fef08a;
    box-shadow: 0 0 20px #facc15, 0 0 30px #facc15;
  }
}

/* Tooltip */
.level-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  padding: 8px 12px;
  background: rgba(26, 10, 46, 0.95);
  border: 1px solid rgba(0, 255, 238, 0.3);
  border-radius: 6px;
  white-space: nowrap;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.level-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: rgba(0, 255, 238, 0.3);
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
