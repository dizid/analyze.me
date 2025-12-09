<template>
  <div :class="['cyberpunk-panel', { 'holographic-overlay': holographic }]">
    <div v-if="title" class="mb-4">
      <h3 class="text-xl font-bold" :class="titleColorClass">
        <span class="glitch-text" :data-text="title">{{ title }}</span>
      </h3>
    </div>
    <slot></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: String,
  titleColor: {
    type: String,
    default: 'cyan',
    validator: (value) => ['cyan', 'pink', 'lime'].includes(value),
  },
  holographic: {
    type: Boolean,
    default: false,
  },
})

const titleColorClass = computed(() => {
  const colors = {
    cyan: 'text-cyberpunk-cyan',
    pink: 'text-cyberpunk-pink',
    lime: 'text-cyberpunk-lime',
  }
  return colors[props.titleColor]
})
</script>
