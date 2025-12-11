<template>
  <div class="space-y-4">
    <p class="text-gray-400 text-sm">
      Paste your journal entries, social media posts, or any text you want to analyze.
    </p>

    <div class="relative">
      <textarea
        v-model="textContent"
        rows="8"
        class="w-full px-4 py-3 bg-cyberpunk-purple-900/50 border-2 border-gray-600
               focus:border-cyberpunk-lime focus:outline-none rounded-lg
               text-white placeholder-gray-500 font-mono text-sm resize-none"
        placeholder="Paste your text here...

Example:
- Journal entries
- Twitter/X posts
- Reddit comments
- Notes or thoughts
- Any personal writing"
        @input="handleInput"
      ></textarea>

      <!-- Character count -->
      <div class="absolute bottom-2 right-2 text-xs text-gray-500">
        {{ charCount.toLocaleString() }} chars
      </div>
    </div>

    <!-- Stats -->
    <div v-if="textContent" class="flex gap-4 text-xs text-gray-400">
      <span>{{ wordCount.toLocaleString() }} words</span>
      <span>{{ lineCount }} entries/lines</span>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-2">
      <CyberpunkButton
        variant="lime"
        @click="handleAnalyze"
        :disabled="!isValid"
        class="flex-1"
      >
        <span v-if="isValid">Analyze Text</span>
        <span v-else>Enter text to analyze</span>
      </CyberpunkButton>

      <button
        v-if="textContent"
        @click="clearContent"
        class="px-4 py-2 border border-gray-600 text-gray-400 hover:border-cyberpunk-pink
               hover:text-cyberpunk-pink rounded transition-all text-sm"
      >
        Clear
      </button>
    </div>

    <!-- Validation Message -->
    <div v-if="validationMessage" class="p-3 bg-yellow-500/20 border border-yellow-500/50 rounded text-sm text-yellow-200">
      {{ validationMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CyberpunkButton from '@/components/ui/CyberpunkButton.vue'

const emit = defineEmits(['content-ready', 'content-cleared'])

const textContent = ref('')
const MIN_CHARS = 50
const MAX_CHARS = 50000

const charCount = computed(() => textContent.value.length)
const wordCount = computed(() => {
  if (!textContent.value.trim()) return 0
  return textContent.value.trim().split(/\s+/).length
})
const lineCount = computed(() => {
  if (!textContent.value.trim()) return 0
  return textContent.value.trim().split(/\n+/).filter(line => line.trim()).length
})

const isValid = computed(() => {
  return charCount.value >= MIN_CHARS && charCount.value <= MAX_CHARS
})

const validationMessage = computed(() => {
  if (textContent.value && charCount.value < MIN_CHARS) {
    return `Please enter at least ${MIN_CHARS} characters for meaningful analysis. (${MIN_CHARS - charCount.value} more needed)`
  }
  if (charCount.value > MAX_CHARS) {
    return `Text is too long. Maximum ${MAX_CHARS.toLocaleString()} characters allowed. (${(charCount.value - MAX_CHARS).toLocaleString()} over limit)`
  }
  return null
})

const handleInput = () => {
  // Auto-trim if over limit
  if (charCount.value > MAX_CHARS + 1000) {
    textContent.value = textContent.value.slice(0, MAX_CHARS)
  }
}

const handleAnalyze = () => {
  if (!isValid.value) return
  emit('content-ready', textContent.value)
}

const clearContent = () => {
  textContent.value = ''
  emit('content-cleared')
}
</script>
