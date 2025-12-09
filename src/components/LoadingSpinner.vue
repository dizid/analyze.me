<template>
  <div class="flex items-center justify-center" :class="containerClass">
    <div class="relative">
      <!-- Outer ring -->
      <div
        class="spinner-neon rounded-full"
        :class="spinnerSize"
        style="border-color: var(--color-cyberpunk-cyan-glow); border-top-color: var(--color-cyberpunk-cyan);"
      ></div>

      <!-- Middle ring -->
      <div
        class="absolute top-0 left-0 spinner-neon rounded-full opacity-50"
        :class="spinnerSize"
        style="border-color: var(--color-cyberpunk-pink-glow); border-top-color: var(--color-cyberpunk-pink); animation-duration: 1.5s; animation-direction: reverse;"
      ></div>

      <!-- Inner glow -->
      <div
        class="absolute top-0 left-0 rounded-full pulse-neon"
        :class="spinnerSize"
        style="border: 2px solid var(--color-cyberpunk-pink-glow);"
      ></div>
    </div>

    <p v-if="message" class="ml-4 text-cyberpunk-cyan animate-pulse">{{ message }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value),
  },
  message: String,
})

const containerClass = computed(() => {
  const sizes = {
    sm: 'h-8',
    md: 'h-16',
    lg: 'h-24',
  }
  return sizes[props.size]
})

const spinnerSize = computed(() => {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  }
  return sizes[props.size]
})
</script>
