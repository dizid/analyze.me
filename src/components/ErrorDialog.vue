<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        @click.self="close"
      >
        <div class="relative max-w-md w-full">
          <!-- Glitch effect border -->
          <div class="absolute inset-0 bg-gradient-to-r from-cyberpunk-pink via-cyberpunk-cyan to-cyberpunk-pink opacity-50 blur-xl animate-pulse"></div>

          <div class="relative bg-cyberpunk-purple-900 border-2 border-cyberpunk-pink rounded-lg p-6 shadow-[var(--shadow-neon-pink)]">
            <!-- Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="text-4xl animate-flicker">⚠️</div>
                <h3 class="text-xl font-bold text-cyberpunk-pink glitch-text" data-text="ERROR">
                  ERROR
                </h3>
              </div>
              <button
                @click="close"
                class="text-2xl text-gray-400 hover:text-cyberpunk-cyan transition-colors"
              >
                ×
              </button>
            </div>

            <!-- Error Message -->
            <div class="mb-6">
              <p class="text-gray-300 font-mono text-sm">{{ message }}</p>
            </div>

            <!-- Actions -->
            <div class="flex gap-3">
              <CyberpunkButton
                variant="cyan"
                @click="close"
                class="flex-1"
              >
                Dismiss
              </CyberpunkButton>
              <CyberpunkButton
                v-if="onRetry"
                variant="pink"
                @click="handleRetry"
                class="flex-1"
              >
                Retry
              </CyberpunkButton>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import CyberpunkButton from '@/components/ui/CyberpunkButton.vue'

const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  visible: {
    type: Boolean,
    default: false,
  },
  onRetry: {
    type: Function,
    default: null,
  },
})

const emit = defineEmits(['close'])

const isVisible = ref(props.visible)

watch(() => props.visible, (newVal) => {
  isVisible.value = newVal
})

const close = () => {
  isVisible.value = false
  emit('close')
}

const handleRetry = () => {
  if (props.onRetry) {
    props.onRetry()
  }
  close()
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
