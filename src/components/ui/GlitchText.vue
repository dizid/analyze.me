<template>
  <span
    class="glitch-text inline-block"
    :class="colorClass"
    :data-text="text"
  >
    {{ text }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: 'cyan',
    validator: (value) => ['cyan', 'pink', 'lime', 'white'].includes(value),
  },
})

const colorClass = computed(() => {
  const colors = {
    cyan: 'text-cyberpunk-cyan',
    pink: 'text-cyberpunk-pink',
    lime: 'text-cyberpunk-lime',
    white: 'text-white',
  }
  return colors[props.color]
})
</script>
