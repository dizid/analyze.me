<template>
  <footer class="mt-12 py-6 border-t border-cyberpunk-cyan/30">
    <div class="max-w-7xl mx-auto px-4 text-center">
      <p class="text-sm text-gray-400 font-mono">
        <button
          @click="$emit('navigate', 'privacy')"
          class="hover:text-cyberpunk-cyan transition-colors duration-300 cursor-pointer"
        >
          Privacy Policy
        </button>
        <span class="mx-3 text-cyberpunk-cyan/50">•</span>
        <button
          @click="$emit('navigate', 'terms')"
          class="hover:text-cyberpunk-cyan transition-colors duration-300 cursor-pointer"
        >
          Terms of Service
        </button>
      </p>
      <p class="text-xs text-gray-500 mt-2 font-mono">
        © 2025 Grok AI Self-Analysis. All rights reserved.
      </p>
    </div>
  </footer>
</template>

<script setup>
defineEmits(['navigate'])
</script>
