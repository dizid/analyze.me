import { ref, computed } from 'vue'
import axios from 'axios'

const FUNCTIONS_URL = import.meta.env.VITE_NETLIFY_FUNCTIONS_URL

export function useGrokAnalysis() {
  const isAnalyzing = ref(false)
  const analysisResult = ref(null)
  const error = ref(null)

  const analyze = async (documentContent, prompt, options = {}) => {
    isAnalyzing.value = true
    error.value = null
    analysisResult.value = null

    try {
      const response = await axios.post(
        `${FUNCTIONS_URL}/analyze`,
        {
          content: documentContent,
          prompt: prompt,
          model: options.model || 'grok-4-fast-reasoning',
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 2000,
        },
        {
          timeout: 60000, // 60 second timeout
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      analysisResult.value = {
        content: response.data.analysis,
        timestamp: new Date().toISOString(),
        promptUsed: prompt,
        model: options.model || 'grok-4-fast-reasoning',
        usage: response.data.usage,
      }

      return analysisResult.value
    } catch (err) {
      console.error('Analysis error:', err)

      if (err.code === 'ECONNABORTED') {
        error.value = 'Analysis timed out. Please try again.'
      } else if (err.response?.status === 429) {
        error.value = 'Rate limit exceeded. Please wait a moment and try again.'
      } else if (err.response?.status === 401) {
        error.value = 'Authentication failed. Please check API configuration.'
      } else if (err.response?.data?.error) {
        error.value = err.response.data.error
      } else {
        error.value = 'Failed to analyze document. Please try again.'
      }

      throw err
    } finally {
      isAnalyzing.value = false
    }
  }

  const clearResult = () => {
    analysisResult.value = null
    error.value = null
  }

  return {
    isAnalyzing: computed(() => isAnalyzing.value),
    analysisResult: computed(() => analysisResult.value),
    error: computed(() => error.value),
    analyze,
    clearResult,
  }
}
