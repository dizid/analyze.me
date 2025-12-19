<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="achievement-modal-overlay" @click.self="close">
        <div class="achievement-modal" :class="`rarity-${achievement?.rarity}`">
          <!-- Particles background -->
          <div class="particles">
            <span v-for="i in 20" :key="i" class="particle" :style="getParticleStyle(i)"></span>
          </div>

          <!-- Glitch header -->
          <div class="modal-header">
            <div class="glitch-text" data-text="ACHIEVEMENT UNLOCKED">
              ACHIEVEMENT UNLOCKED
            </div>
          </div>

          <!-- Achievement content -->
          <div class="modal-content">
            <div class="achievement-icon-large">
              <span class="icon-emoji">{{ achievement?.icon }}</span>
              <div class="icon-ring"></div>
              <div class="icon-glow"></div>
            </div>

            <h2 class="achievement-title">{{ achievement?.name }}</h2>
            <p class="achievement-desc">{{ achievement?.description }}</p>

            <div class="achievement-rewards">
              <div class="reward-xp">
                <span class="xp-icon">⚡</span>
                <span class="xp-value">+{{ achievement?.xp }} XP</span>
              </div>
              <div class="reward-rarity" :class="`rarity-${achievement?.rarity}`">
                {{ rarityLabel }}
              </div>
            </div>
          </div>

          <!-- Close button -->
          <button class="close-button" @click="close">
            <span>CONTINUE</span>
            <div class="button-glow"></div>
          </button>

          <!-- Scan lines effect -->
          <div class="scan-lines"></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch } from 'vue'
import { RARITY_CONFIG } from '@/config/gamification'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  achievement: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close'])

const rarityLabel = computed(() => {
  return RARITY_CONFIG[props.achievement?.rarity]?.label || ''
})

const close = () => {
  emit('close')
}

const getParticleStyle = (index) => {
  const angle = (index * 18) % 360
  const delay = (index * 0.1) % 2
  const duration = 1.5 + (index % 3) * 0.5

  return {
    '--angle': `${angle}deg`,
    '--delay': `${delay}s`,
    '--duration': `${duration}s`,
  }
}

// Auto-close after delay (optional)
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // Play sound if available
    // playAchievementSound()
  }
})
</script>

<style scoped>
.achievement-modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 10, 15, 0.9);
  backdrop-filter: blur(10px);
  z-index: 9999;
}

.achievement-modal {
  position: relative;
  width: 90%;
  max-width: 400px;
  padding: 32px;
  background: linear-gradient(135deg,
    rgba(45, 27, 61, 0.95) 0%,
    rgba(26, 10, 46, 0.95) 100%
  );
  border: 2px solid;
  border-radius: 16px;
  text-align: center;
  overflow: hidden;
}

/* Rarity border colors */
.achievement-modal.rarity-common {
  border-color: #00ff41;
  box-shadow: 0 0 30px rgba(0, 255, 65, 0.3), inset 0 0 30px rgba(0, 255, 65, 0.1);
}

.achievement-modal.rarity-uncommon {
  border-color: #00ffee;
  box-shadow: 0 0 30px rgba(0, 255, 238, 0.3), inset 0 0 30px rgba(0, 255, 238, 0.1);
}

.achievement-modal.rarity-rare {
  border-color: #ff00ff;
  box-shadow: 0 0 30px rgba(255, 0, 255, 0.3), inset 0 0 30px rgba(255, 0, 255, 0.1);
}

.achievement-modal.rarity-epic {
  border-color: #a855f7;
  box-shadow: 0 0 30px rgba(168, 85, 247, 0.3), inset 0 0 30px rgba(168, 85, 247, 0.1);
}

.achievement-modal.rarity-legendary {
  border-color: #facc15;
  box-shadow: 0 0 40px rgba(250, 204, 21, 0.4), inset 0 0 40px rgba(250, 204, 21, 0.15);
  animation: legendary-pulse 2s ease-in-out infinite;
}

@keyframes legendary-pulse {
  0%, 100% {
    box-shadow: 0 0 40px rgba(250, 204, 21, 0.4), inset 0 0 40px rgba(250, 204, 21, 0.15);
  }
  50% {
    box-shadow: 0 0 60px rgba(250, 204, 21, 0.6), inset 0 0 60px rgba(250, 204, 21, 0.2);
  }
}

/* Particles */
.particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.particle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: particle-burst var(--duration) ease-out var(--delay) infinite;
}

.rarity-common .particle { background: #00ff41; }
.rarity-uncommon .particle { background: #00ffee; }
.rarity-rare .particle { background: #ff00ff; }
.rarity-epic .particle { background: #a855f7; }
.rarity-legendary .particle { background: #facc15; }

@keyframes particle-burst {
  0% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-150px) scale(0);
    opacity: 0;
  }
}

/* Header */
.modal-header {
  margin-bottom: 24px;
}

.glitch-text {
  font-family: 'Orbitron', sans-serif;
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 3px;
  color: #00ffee;
  text-shadow: 0 0 10px #00ffee;
  animation: glitch 3s infinite;
}

@keyframes glitch {
  0%, 90%, 100% { transform: translate(0); }
  92% { transform: translate(-2px, 2px); }
  94% { transform: translate(2px, -2px); }
  96% { transform: translate(-2px, -2px); }
  98% { transform: translate(2px, 2px); }
}

/* Achievement icon */
.achievement-icon-large {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-emoji {
  font-size: 48px;
  z-index: 2;
  animation: icon-bounce 0.6s ease-out;
}

@keyframes icon-bounce {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.icon-ring {
  position: absolute;
  inset: 0;
  border: 3px solid;
  border-radius: 50%;
  animation: ring-expand 1s ease-out;
}

.rarity-common .icon-ring { border-color: #00ff41; }
.rarity-uncommon .icon-ring { border-color: #00ffee; }
.rarity-rare .icon-ring { border-color: #ff00ff; }
.rarity-epic .icon-ring { border-color: #a855f7; }
.rarity-legendary .icon-ring { border-color: #facc15; }

@keyframes ring-expand {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.icon-glow {
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  animation: glow-pulse 2s ease-in-out infinite;
}

.rarity-common .icon-glow { box-shadow: 0 0 30px #00ff41; }
.rarity-uncommon .icon-glow { box-shadow: 0 0 30px #00ffee; }
.rarity-rare .icon-glow { box-shadow: 0 0 30px #ff00ff; }
.rarity-epic .icon-glow { box-shadow: 0 0 30px #a855f7; }
.rarity-legendary .icon-glow { box-shadow: 0 0 40px #facc15; }

@keyframes glow-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* Content */
.achievement-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin: 0 0 8px 0;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

.achievement-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 20px 0;
}

.achievement-rewards {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
}

.reward-xp {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(0, 255, 65, 0.1);
  border: 1px solid rgba(0, 255, 65, 0.3);
  border-radius: 20px;
}

.xp-icon {
  font-size: 16px;
}

.xp-value {
  font-family: 'Orbitron', sans-serif;
  font-size: 16px;
  font-weight: bold;
  color: #00ff41;
}

.reward-rarity {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.reward-rarity.rarity-common {
  background: rgba(0, 255, 65, 0.1);
  border: 1px solid rgba(0, 255, 65, 0.3);
  color: #00ff41;
}

.reward-rarity.rarity-uncommon {
  background: rgba(0, 255, 238, 0.1);
  border: 1px solid rgba(0, 255, 238, 0.3);
  color: #00ffee;
}

.reward-rarity.rarity-rare {
  background: rgba(255, 0, 255, 0.1);
  border: 1px solid rgba(255, 0, 255, 0.3);
  color: #ff00ff;
}

.reward-rarity.rarity-epic {
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.3);
  color: #a855f7;
}

.reward-rarity.rarity-legendary {
  background: rgba(250, 204, 21, 0.1);
  border: 1px solid rgba(250, 204, 21, 0.3);
  color: #facc15;
}

/* Close button */
.close-button {
  position: relative;
  padding: 12px 32px;
  background: transparent;
  border: 2px solid #00ffee;
  border-radius: 4px;
  color: #00ffee;
  font-family: 'Orbitron', sans-serif;
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 2px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
}

.close-button:hover {
  background: rgba(0, 255, 238, 0.1);
  box-shadow: 0 0 20px rgba(0, 255, 238, 0.3);
}

.button-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 238, 0.2), transparent);
  transform: translateX(-100%);
  transition: transform 0.5s ease;
}

.close-button:hover .button-glow {
  transform: translateX(100%);
}

/* Scan lines */
.scan-lines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 255, 238, 0.03) 0px,
    transparent 1px,
    transparent 2px,
    rgba(0, 255, 238, 0.03) 3px
  );
  pointer-events: none;
  animation: scan 8s linear infinite;
}

@keyframes scan {
  0% { transform: translateY(0); }
  100% { transform: translateY(50px); }
}

/* Modal transitions */
.modal-enter-active {
  animation: modal-in 0.4s ease-out;
}

.modal-leave-active {
  animation: modal-out 0.3s ease-in;
}

@keyframes modal-in {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes modal-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.8);
  }
}
</style>
