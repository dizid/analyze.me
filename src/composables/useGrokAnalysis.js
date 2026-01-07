import { ref, computed } from 'vue'
import axios from 'axios'

// Use relative URL - works in production and with Vite proxy in development
const FUNCTIONS_URL = import.meta.env.VITE_NETLIFY_FUNCTIONS_URL || '/.netlify/functions'

// Helper for delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export function useGrokAnalysis() {
  const isAnalyzing = ref(false)
  const analysisResult = ref(null)
  const error = ref(null)

  const analyze = async (documentContent, prompt, options = {}) => {
    isAnalyzing.value = true
    error.value = null
    analysisResult.value = null

    const maxRetries = 3
    let lastError = null

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await axios.post(
        `${FUNCTIONS_URL}/analyze`,
        {
          content: documentContent,
          prompt: prompt,
          model: options.model || 'grok-4-fast-reasoning',
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 400,
          output_length: options.output_length || 'middle',
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

        isAnalyzing.value = false
        return analysisResult.value
      } catch (err) {
        lastError = err

        // Retry on rate limit (429) with exponential backoff
        if (err.response?.status === 429 && attempt < maxRetries - 1) {
          const waitTime = Math.pow(2, attempt + 1) * 1000 // 2s, 4s, 8s
          console.log(`Rate limited, retrying in ${waitTime}ms (attempt ${attempt + 1}/${maxRetries})`)
          await delay(waitTime)
          continue
        }

        // Don't retry other errors
        break
      }
    }

    // All retries failed - handle error
    console.error('Analysis error:', lastError)

    if (lastError.code === 'ECONNABORTED') {
      error.value = 'Analysis timed out. Please try again.'
    } else if (lastError.response?.status === 429) {
      error.value = 'Rate limit exceeded. Please wait a moment and try again.'
    } else if (lastError.response?.status === 401) {
      error.value = 'Authentication failed. Please check API configuration.'
    } else if (lastError.response?.data?.error) {
      error.value = lastError.response.data.error
    } else {
      error.value = 'Failed to analyze document. Please try again.'
    }

    isAnalyzing.value = false
    throw lastError
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
