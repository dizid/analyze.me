<template>
  <div class="min-h-screen p-4 md:p-8">
    <!-- Header -->
    <header class="mb-8 text-center">
      <h1 class="text-4xl md:text-6xl font-bold mb-2">
        <GlitchText text="GROK" color="cyan" class="animate-neon-pulse" />
        <span class="text-cyberpunk-pink"> AI </span>
        <span class="text-cyberpunk-lime">ANALYSIS</span>
      </h1>
      <p class="text-gray-400 text-sm md:text-base font-mono">
        Self-Analysis Dashboard • Powered by xAI
      </p>
    </header>

    <!-- Dashboard Grid -->
    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Google Auth & Document Selection -->
      <div class="lg:col-span-1 space-y-6">
        <GoogleAuth
          @document-selected="handleDocumentSelected"
          @document-cleared="handleDocumentCleared"
        />

        <!-- History Panel -->
        <CyberpunkPanel title="Recent Analyses" title-color="cyan" v-if="history.length > 0">
          <div class="space-y-2 max-h-64 overflow-y-auto">
            <button
              v-for="item in history.slice(0, 5)"
              :key="item.id"
              @click="loadHistoryItem(item)"
              class="w-full text-left p-3 border border-gray-700 hover:border-cyberpunk-cyan
                     rounded transition-all text-sm"
            >
              <div class="font-semibold text-cyberpunk-cyan truncate">{{ item.documentName }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ formatDate(item.timestamp) }}</div>
            </button>
          </div>
          <button
            @click="clearAllHistory"
            class="w-full mt-3 text-xs text-gray-500 hover:text-cyberpunk-pink transition-colors"
          >
            Clear History
          </button>
        </CyberpunkPanel>
      </div>

      <!-- Middle Column: Analysis Prompts -->
      <div class="lg:col-span-1">
        <GrokAnalysis
          :document="selectedDocument"
          @analysis-complete="handleAnalysisComplete"
          @analysis-error="handleAnalysisError"
        />
      </div>

      <!-- Right Column: Results -->
      <div class="lg:col-span-1">
        <ResultDisplay :result="analysisResult" />
      </div>
    </div>

    <!-- Error Dialog -->
    <ErrorDialog
      :visible="showError"
      :message="errorMessage"
      :on-retry="errorRetryAction"
      @close="showError = false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import GoogleAuth from '@/components/GoogleAuth.vue'
import GrokAnalysis from '@/components/GrokAnalysis.vue'
import ResultDisplay from '@/components/ResultDisplay.vue'
import ErrorDialog from '@/components/ErrorDialog.vue'
import CyberpunkPanel from '@/components/ui/CyberpunkPanel.vue'
import GlitchText from '@/components/ui/GlitchText.vue'
import { useAnalysisHistory } from '@/composables/useAnalysisHistory'
import { handleError } from '@/utils/errorHandler'

const { history, addToHistory, clearHistory } = useAnalysisHistory()

const selectedDocument = ref(null)
const analysisResult = ref(null)
const showError = ref(false)
const errorMessage = ref('')
const errorRetryAction = ref(null)

const handleDocumentSelected = (document) => {
  selectedDocument.value = document
  analysisResult.value = null // Clear previous results
}

const handleDocumentCleared = () => {
  selectedDocument.value = null
  analysisResult.value = null
}

const handleAnalysisComplete = (result) => {
  analysisResult.value = result

  // Save to history
  if (selectedDocument.value) {
    addToHistory(result, selectedDocument.value)
  }
}

const handleAnalysisError = (error) => {
  const errorInfo = handleError(error)
  errorMessage.value = errorInfo.message
  showError.value = true

  if (errorInfo.retryable) {
    errorRetryAction.value = () => {
      // Retry logic would go here
      console.log('Retrying...')
    }
  } else {
    errorRetryAction.value = null
  }
}

const loadHistoryItem = (item) => {
  analysisResult.value = {
    content: item.content,
    timestamp: item.timestamp,
    promptUsed: item.promptUsed,
    model: item.model,
  }
}

const clearAllHistory = () => {
  if (confirm('Are you sure you want to clear all analysis history?')) {
    clearHistory()
  }
}

const formatDate = (isoString) => {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>
