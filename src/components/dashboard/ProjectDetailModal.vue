<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="cyberpunk-panel w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="flex items-start justify-between mb-4 pb-4 border-b border-cyberpunk-cyan/30">
        <div>
          <h2 class="text-2xl font-bold text-cyberpunk-cyan mb-1">
            {{ project.documentName || project.name }}
          </h2>
          <p class="text-sm text-gray-400">
            Last modified: {{ formatDate(project.modifiedTime) }}
          </p>
        </div>
        <button
          class="neon-button px-3 py-2 text-sm border-cyberpunk-pink text-cyberpunk-pink"
          @click="$emit('close')"
        >
          Close
        </button>
      </div>

      <!-- Status Badge -->
      <div class="mb-4">
        <span
          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
          :class="statusBadgeClass"
        >
          <span class="w-2 h-2 rounded-full mr-2" :class="statusDotClass"></span>
          {{ statusLabel }}
        </span>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <!-- Executive Summary -->
        <div v-if="project.summary" class="mb-6">
          <h3 class="text-lg font-bold text-cyberpunk-lime mb-2">Executive Summary</h3>
          <div class="prose prose-invert prose-sm max-w-none text-gray-300" v-html="renderedSummary"></div>
        </div>

        <!-- Full Analysis -->
        <div v-if="project.fullAnalysis" class="mb-6">
          <h3 class="text-lg font-bold text-cyberpunk-pink mb-2">Detailed Analysis</h3>
          <div class="prose prose-invert prose-sm max-w-none text-gray-300" v-html="renderedFullAnalysis"></div>
        </div>

        <!-- Loading state for full analysis -->
        <div v-else-if="isLoadingFull" class="flex items-center justify-center py-8">
          <span class="inline-block w-6 h-6 border-2 border-cyberpunk-cyan border-t-transparent rounded-full animate-spin mr-3"></span>
          <span class="text-gray-400">Generating detailed analysis...</span>
        </div>

        <!-- Button to generate full analysis -->
        <div v-else class="text-center py-6">
          <button
            class="neon-button px-6 py-3 border-cyberpunk-lime text-cyberpunk-lime"
            @click="$emit('generate-full', project)"
          >
            Generate Detailed Analysis
          </button>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="mt-4 pt-4 border-t border-cyberpunk-cyan/30 flex justify-between">
        <button
          class="neon-button px-4 py-2 text-sm border-gray-500 text-gray-400"
          @click="openInDrive"
        >
          Open in Google Docs
        </button>
        <button
          class="neon-button px-4 py-2 text-sm border-cyberpunk-cyan text-cyberpunk-cyan"
          @click="$emit('refresh', project)"
        >
          Refresh Analysis
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMarkdownRenderer } from '@/composables/useMarkdownRenderer'

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
  isLoadingFull: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['close', 'generate-full', 'refresh'])

const { renderMarkdown } = useMarkdownRenderer()

const renderedSummary = computed(() => {
  return renderMarkdown(props.project.summary || '')
})

const renderedFullAnalysis = computed(() => {
  return renderMarkdown(props.project.fullAnalysis || '')
})

const statusBadgeClass = computed(() => {
  const status = props.project.status?.toUpperCase() || ''
  if (status.includes('ON TRACK') || status === 'GREEN') {
    return 'bg-green-400/20 text-green-400 border border-green-400/30'
  }
  if (status.includes('ATTENTION') || status === 'YELLOW') {
    return 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30'
  }
  if (status.includes('RISK') || status === 'RED') {
    return 'bg-red-400/20 text-red-400 border border-red-400/30'
  }
  return 'bg-gray-400/20 text-gray-400 border border-gray-400/30'
})

const statusDotClass = computed(() => {
  const status = props.project.status?.toUpperCase() || ''
  if (status.includes('ON TRACK') || status === 'GREEN') return 'bg-green-400'
  if (status.includes('ATTENTION') || status === 'YELLOW') return 'bg-yellow-400'
  if (status.includes('RISK') || status === 'RED') return 'bg-red-400'
  return 'bg-gray-400'
})

const statusLabel = computed(() => {
  const status = props.project.status?.toUpperCase() || ''
  if (status.includes('ON TRACK') || status === 'GREEN') return 'On Track'
  if (status.includes('ATTENTION') || status === 'YELLOW') return 'Needs Attention'
  if (status.includes('RISK') || status === 'RED') return 'At Risk'
  return 'Unknown Status'
})

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const openInDrive = () => {
  const url = `https://docs.google.com/document/d/${props.project.documentId || props.project.id}`
  window.open(url, '_blank')
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 255, 238, 0.1);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 238, 0.3);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 238, 0.5);
}
</style>
