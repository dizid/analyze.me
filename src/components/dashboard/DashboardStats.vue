<template>
  <div class="cyberpunk-panel">
    <h3 class="text-lg font-bold text-cyberpunk-lime mb-4">
      <span class="glitch-text" data-text="OVERVIEW">OVERVIEW</span>
    </h3>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
      <!-- Total Projects -->
      <div class="p-4 rounded-lg bg-black/30 border border-cyberpunk-cyan/30">
        <div class="text-3xl font-bold text-cyberpunk-cyan mb-1">
          {{ stats.total }}
        </div>
        <div class="text-sm text-gray-400">Projects</div>
      </div>

      <!-- On Track -->
      <div class="p-4 rounded-lg bg-black/30 border border-green-400/30">
        <div class="text-3xl font-bold text-green-400 mb-1">
          {{ stats.green }}
        </div>
        <div class="text-sm text-gray-400">On Track</div>
      </div>

      <!-- Needs Attention -->
      <div class="p-4 rounded-lg bg-black/30 border border-yellow-400/30">
        <div class="text-3xl font-bold text-yellow-400 mb-1">
          {{ stats.yellow }}
        </div>
        <div class="text-sm text-gray-400">Attention</div>
      </div>

      <!-- At Risk -->
      <div class="p-4 rounded-lg bg-black/30 border border-red-400/30">
        <div class="text-3xl font-bold text-red-400 mb-1">
          {{ stats.red }}
        </div>
        <div class="text-sm text-gray-400">At Risk</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: {
    type: Object,
    default: () => ({
      total: 0,
      green: 0,
      yellow: 0,
      red: 0,
    }),
  },
})
</script>
