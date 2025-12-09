<template>
  <button
    :class="[
      'neon-button',
      variantClasses,
      sizeClasses,
      { 'opacity-50 cursor-not-allowed': disabled }
    ]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <span v-if="icon" class="mr-2">{{ icon }}</span>
    <slot></slot>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'cyan',
    validator: (value) => ['cyan', 'pink', 'lime'].includes(value),
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value),
  },
  icon: String,
  disabled: Boolean,
})

defineEmits(['click'])

const variantClasses = computed(() => {
  const variants = {
    cyan: 'border-cyberpunk-cyan text-cyberpunk-cyan hover:shadow-[var(--shadow-neon-cyan)]',
    pink: 'border-cyberpunk-pink text-cyberpunk-pink hover:shadow-[var(--shadow-neon-pink)]',
    lime: 'border-cyberpunk-lime text-cyberpunk-lime hover:shadow-[var(--shadow-neon-lime)]',
  }
  return variants[props.variant]
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }
  return sizes[props.size]
})
</script>
