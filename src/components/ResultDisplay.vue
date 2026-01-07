<template>
  <CyberpunkPanel title="Analysis Results" title-color="lime" :holographic="true">
    <div v-if="!result" class="text-center py-12 text-gray-400">
      <p class="text-3xl mb-3">🤖</p>
      <p class="text-lg">Run an analysis to see results here</p>
    </div>

    <div v-else class="space-y-4">
      <!-- Metadata -->
      <div class="flex items-center justify-between text-xs text-gray-400 pb-3 border-b border-gray-700">
        <span>{{ formatDate(result.timestamp) }}</span>
        <span>Model: {{ result.model }}</span>
      </div>

      <!-- Rendered Content -->
      <div
        class="prose prose-invert max-w-none
               prose-headings:text-cyberpunk-cyan
               prose-p:text-gray-300
               prose-strong:text-cyberpunk-pink
               prose-code:text-cyberpunk-lime prose-code:bg-cyberpunk-purple-900/50
               prose-a:text-cyberpunk-cyan prose-a:no-underline hover:prose-a:underline
               prose-ul:text-gray-300 prose-ol:text-gray-300"
        v-html="renderedContent"
      ></div>

      <!-- Post-Analysis: Action Items -->
      <div class="pt-4 border-t border-gray-700">
        <ActionItems :analysisContent="result.content" />
      </div>

      <!-- Post-Analysis: Professional Recommendations -->
      <div class="pt-4 border-t border-gray-700">
        <ProfessionalRecommendations :analysisContent="result.content" />
      </div>

      <!-- Export Action Buttons -->
      <div class="flex gap-3 pt-4 border-t border-gray-700">
        <CyberpunkButton
          variant="cyan"
          icon="📋"
          @click="copyToClipboard"
          class="flex-1"
        >
          Copy
        </CyberpunkButton>

        <CyberpunkButton
          variant="pink"
          icon="📝"
          @click="downloadMarkdown"
          class="flex-1"
        >
          Save .md
        </CyberpunkButton>

        <CyberpunkButton
          variant="lime"
          icon="📄"
          @click="downloadText"
          class="flex-1"
        >
          Save .txt
        </CyberpunkButton>
      </div>

      <!-- Success Message -->
      <Transition name="fade">
        <div v-if="showSuccess" class="p-2 bg-cyberpunk-cyan/20 border border-cyberpunk-cyan rounded text-center text-sm">
          {{ successMessage }}
        </div>
      </Transition>
    </div>
  </CyberpunkPanel>
</template>

<script setup>
import { ref, computed } from 'vue'
import CyberpunkPanel from '@/components/ui/CyberpunkPanel.vue'
import CyberpunkButton from '@/components/ui/CyberpunkButton.vue'
import ActionItems from '@/components/ActionItems.vue'
import ProfessionalRecommendations from '@/components/ProfessionalRecommendations.vue'
import { useMarkdownRenderer } from '@/composables/useMarkdownRenderer'

const props = defineProps({
  result: {
    type: Object,
    default: null,
  },
})

const { renderMarkdown } = useMarkdownRenderer()

const showSuccess = ref(false)
const successMessage = ref('')

const renderedContent = computed(() => {
  if (!props.result?.content) return ''
  return renderMarkdown(props.result.content)
})

const formatDate = (isoString) => {
  const date = new Date(isoString)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const showSuccessMessage = (message) => {
  successMessage.value = message
  showSuccess.value = true
  setTimeout(() => {
    showSuccess.value = false
  }, 2000)
}

const copyToClipboard = async () => {
  if (!props.result?.content) return

  try {
    await navigator.clipboard.writeText(props.result.content)
    showSuccessMessage('✓ Copied to clipboard!')
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const downloadMarkdown = () => {
  if (!props.result?.content) return

  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `grok-analysis-${timestamp}.md`

  // Add metadata header to markdown
  const header = `# Grok AI Analysis\n\n**Date:** ${formatDate(props.result.timestamp)}\n**Model:** ${props.result.model}\n\n---\n\n`
  const content = header + props.result.content

  downloadFile(content, filename, 'text/markdown')
  showSuccessMessage('✓ Downloaded as Markdown!')
}

const downloadText = () => {
  if (!props.result?.content) return

  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `grok-analysis-${timestamp}.txt`

  // Add metadata header
  const header = `GROK AI ANALYSIS\n${'='.repeat(50)}\nDate: ${formatDate(props.result.timestamp)}\nModel: ${props.result.model}\n${'='.repeat(50)}\n\n`
  const content = header + props.result.content

  downloadFile(content, filename, 'text/plain')
  showSuccessMessage('✓ Downloaded as Text!')
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
