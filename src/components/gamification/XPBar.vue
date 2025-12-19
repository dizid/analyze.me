<template>
  <div class="xp-bar-container">
    <div class="flex items-center gap-2 mb-1">
      <span class="text-xs text-gray-400 font-mono">XP</span>
      <span class="text-xs text-cyberpunk-cyan font-bold">
        {{ formatNumber(xpProgress.current) }} / {{ formatNumber(xpProgress.needed) }}
      </span>
    </div>

    <div class="xp-bar-track">
      <div
        class="xp-bar-fill"
        :style="{ width: `${xpProgress.percentage}%` }"
      >
        <div class="xp-bar-shine"></div>
      </div>

      <!-- XP Gain Animation -->
      <transition name="xp-gain">
        <div
          v-if="showGain"
          class="xp-gain-popup"
        >
          +{{ lastGain }} XP
        </div>
      </transition>
    </div>

    <!-- Level indicator dots -->
    <div class="flex justify-between mt-1" v-if="showLevelMarkers">
      <div
        v-for="n in 5"
        :key="n"
        class="level-marker"
        :class="{ 'active': xpProgress.percentage >= (n * 20) }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  xpProgress: {
    type: Object,
    required: true,
    default: () => ({ current: 0, needed: 100, percentage: 0 }),
  },
  showLevelMarkers: {
    type: Boolean,
    default: false,
  },
})

const showGain = ref(false)
const lastGain = ref(0)

// Watch for XP increases to trigger animation
watch(() => props.xpProgress.current, (newVal, oldVal) => {
  if (newVal > oldVal) {
    lastGain.value = newVal - oldVal
    showGain.value = true
    setTimeout(() => {
      showGain.value = false
    }, 1500)
  }
})

const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}
</script>

<style scoped>
.xp-bar-container {
  width: 100%;
  min-width: 120px;
}

.xp-bar-track {
  position: relative;
  height: 8px;
  background: linear-gradient(90deg,
    rgba(45, 27, 61, 0.8) 0%,
    rgba(26, 10, 46, 0.8) 100%
  );
  border: 1px solid rgba(0, 255, 238, 0.3);
  border-radius: 4px;
  overflow: hidden;
  box-shadow: inset 0 0 10px rgba(0, 255, 238, 0.1);
}

.xp-bar-fill {
  position: relative;
  height: 100%;
  background: linear-gradient(90deg,
    #00ffee 0%,
    #00ff41 100%
  );
  border-radius: 3px;
  transition: width 0.5s ease-out;
  box-shadow: 0 0 10px #00ffee, 0 0 20px #00ffee80;
}

.xp-bar-shine {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background: linear-gradient(180deg,
    rgba(255, 255, 255, 0.3) 0%,
    transparent 100%
  );
  border-radius: 3px 3px 0 0;
}

.xp-gain-popup {
  position: absolute;
  right: 0;
  top: -24px;
  color: #00ff41;
  font-size: 14px;
  font-weight: bold;
  text-shadow: 0 0 10px #00ff41;
  font-family: 'Orbitron', sans-serif;
}

.xp-gain-enter-active {
  animation: xp-pop 0.3s ease-out;
}

.xp-gain-leave-active {
  animation: xp-fade 0.5s ease-out;
}

@keyframes xp-pop {
  0% {
    transform: translateY(10px) scale(0.5);
    opacity: 0;
  }
  50% {
    transform: translateY(-5px) scale(1.2);
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes xp-fade {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px);
  }
}

.level-marker {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(0, 255, 238, 0.2);
  border: 1px solid rgba(0, 255, 238, 0.3);
  transition: all 0.3s ease;
}

.level-marker.active {
  background: #00ffee;
  box-shadow: 0 0 8px #00ffee;
}
</style>
