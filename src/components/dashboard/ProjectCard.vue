<template>
  <div class="cyberpunk-panel relative group cursor-pointer hover:border-cyberpunk-cyan transition-all duration-300">
    <!-- Status indicator -->
    <div
      class="absolute top-4 right-4 w-3 h-3 rounded-full animate-pulse"
      :class="statusColorClass"
      :title="statusLabel"
    ></div>

    <!-- Project name -->
    <h3 class="text-lg font-bold text-cyberpunk-cyan mb-2 pr-8 line-clamp-1">
      {{ project.documentName || project.name }}
    </h3>

    <!-- Last modified -->
    <p class="text-xs text-gray-500 mb-3">
      Modified: {{ formatDate(project.modifiedTime) }}
    </p>

    <!-- Summary or loading state -->
    <div class="mb-4 min-h-[60px]">
      <p v-if="project.summary" class="text-sm text-gray-300 line-clamp-3">
        {{ cleanSummary(project.summary) }}
      </p>
      <div v-else-if="isGenerating" class="flex items-center gap-2 text-gray-400">
        <span class="inline-block w-4 h-4 border-2 border-cyberpunk-cyan border-t-transparent rounded-full animate-spin"></span>
        <span class="text-sm">Generating summary...</span>
      </div>
      <p v-else class="text-sm text-gray-500 italic">
        Click to generate summary
      </p>
    </div>

    <!-- Actions -->
    <div class="flex gap-2">
      <button
        class="neon-button px-4 py-2 text-sm border-cyberpunk-cyan text-cyberpunk-cyan hover:shadow-[var(--shadow-neon-cyan)]"
        @click.stop="$emit('view-details', project)"
      >
        View Details
      </button>
      <button
        v-if="project.summary"
        class="neon-button px-4 py-2 text-sm border-cyberpunk-pink text-cyberpunk-pink hover:shadow-[var(--shadow-neon-pink)]"
        @click.stop="$emit('refresh', project)"
      >
        Refresh
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
  isGenerating: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['view-details', 'refresh'])

const statusColorClass = computed(() => {
  const status = props.project.status?.toUpperCase() || ''
  if (status.includes('ON TRACK') || status === 'GREEN') {
    return 'bg-green-400 shadow-[0_0_10px_#4ade80]'
  }
  if (status.includes('ATTENTION') || status === 'YELLOW') {
    return 'bg-yellow-400 shadow-[0_0_10px_#facc15]'
  }
  if (status.includes('RISK') || status === 'RED') {
    return 'bg-red-400 shadow-[0_0_10px_#f87171]'
  }
  return 'bg-gray-400'
})

const statusLabel = computed(() => {
  const status = props.project.status?.toUpperCase() || ''
  if (status.includes('ON TRACK') || status === 'GREEN') return 'On Track'
  if (status.includes('ATTENTION') || status === 'YELLOW') return 'Needs Attention'
  if (status.includes('RISK') || status === 'RED') return 'At Risk'
  return 'Unknown'
})

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const cleanSummary = (summary) => {
  // Remove markdown headers and status prefix for card display
  return summary
    .replace(/^\*\*STATUS:\*\*.*$/m, '')
    .replace(/^\*\*SUMMARY:\*\*/m, '')
    .replace(/^#+\s*/gm, '')
    .replace(/\*\*/g, '')
    .trim()
    .substring(0, 200)
}
</script>
