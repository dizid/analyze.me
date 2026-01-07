<template>
  <CyberpunkPanel title="Analysis Prompts" title-color="pink">
    <div v-if="!hasDocument" class="text-center py-8 text-gray-400">
      <p class="text-lg">📄</p>
      <p class="mt-2">Select a document first to begin analysis</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Pre-configured Prompts -->
      <div>
        <label class="block text-sm font-semibold text-cyberpunk-cyan mb-3">
          Choose Analysis Type
        </label>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            v-for="promptConfig in ANALYSIS_PROMPTS"
            :key="promptConfig.id"
            @click="selectPrompt(promptConfig)"
            :class="[
              'p-4 border-2 rounded-lg transition-all text-left',
              selectedPromptId === promptConfig.id
                ? 'border-cyberpunk-pink bg-cyberpunk-pink/10 shadow-[var(--shadow-neon-pink)]'
                : 'border-gray-600 hover:border-cyberpunk-cyan hover:bg-cyberpunk-cyan/5'
            ]"
          >
            <div class="text-2xl mb-2">{{ promptConfig.icon }}</div>
            <div class="text-sm font-semibold">{{ promptConfig.label }}</div>
          </button>
        </div>
      </div>

      <!-- Custom/Editable Prompt -->
      <!-- Commented out - can be restored later if needed
      <div>
        <label class="block text-sm font-semibold text-cyberpunk-lime mb-2">
          Custom Prompt
          <span class="text-xs text-gray-400 ml-2">(Edit the selected prompt or write your own)</span>
        </label>
        <textarea
          v-model="customPrompt"
          rows="6"
          class="w-full px-4 py-3 bg-cyberpunk-purple-900/50 border-2 border-gray-600
                 focus:border-cyberpunk-lime focus:outline-none rounded-lg
                 text-white placeholder-gray-500 font-mono text-sm"
          placeholder="Enter your custom analysis prompt here..."
        ></textarea>
      </div>
      -->

      <!-- Output Length Selection -->
      <div>
        <label class="block text-sm font-semibold text-cyberpunk-cyan mb-3">
          Output Length
        </label>
        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="lengthOption in OUTPUT_LENGTH_OPTIONS"
            :key="lengthOption.id"
            @click="selectLength(lengthOption)"
            :class="[
              'p-3 border-2 rounded-lg transition-all text-center',
              outputLength === lengthOption.id
                ? 'border-cyberpunk-cyan bg-cyberpunk-cyan/10 shadow-[var(--shadow-neon-cyan)]'
                : 'border-gray-600 hover:border-cyberpunk-lime hover:bg-cyberpunk-lime/5'
            ]"
          >
            <div class="text-xl mb-1">{{ lengthOption.icon }}</div>
            <div class="text-xs font-semibold">{{ lengthOption.label }}</div>
            <div class="text-[10px] text-gray-400 mt-1">{{ lengthOption.description }}</div>
          </button>
        </div>
      </div>

      <!-- Analyze Button -->
      <CyberpunkButton
        variant="lime"
        icon="⚡"
        :disabled="!customPrompt.trim() || isAnalyzing"
        @click="handleAnalyze"
        class="w-full text-lg"
      >
        <span v-if="!isAnalyzing">Analyze Document</span>
        <span v-else class="flex items-center justify-center">
          <LoadingSpinner size="sm" class="mr-2" />
          Analyzing...
        </span>
      </CyberpunkButton>
    </div>
  </CyberpunkPanel>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ANALYSIS_PROMPTS } from '@/config/prompts'
import CyberpunkPanel from '@/components/ui/CyberpunkPanel.vue'
import CyberpunkButton from '@/components/ui/CyberpunkButton.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { useGrokAnalysis } from '@/composables/useGrokAnalysis'

const OUTPUT_LENGTH_OPTIONS = [
  {
    id: 'summary',
    label: 'Summary',
    icon: '📝',
    tokens: 150,
    description: 'Brief and concise'
  },
  {
    id: 'middle',
    label: 'Middle',
    icon: '📄',
    tokens: 400,
    description: 'Balanced detail'
  },
  {
    id: 'long',
    label: 'Long',
    icon: '📚',
    tokens: 800,
    description: 'Comprehensive'
  }
]

const props = defineProps({
  document: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['analysis-complete', 'analysis-error'])

const { isAnalyzing, analyze } = useGrokAnalysis()

const selectedPromptId = ref(null)
const customPrompt = ref('')
const outputLength = ref('middle')

const hasDocument = computed(() => props.document !== null)

const selectPrompt = (promptConfig) => {
  selectedPromptId.value = promptConfig.id
  customPrompt.value = promptConfig.prompt
}

const selectLength = (lengthOption) => {
  outputLength.value = lengthOption.id
}

const handleAnalyze = async () => {
  if (!props.document || !customPrompt.value.trim()) {
    return
  }

  try {
    const selectedLengthOption = OUTPUT_LENGTH_OPTIONS.find(opt => opt.id === outputLength.value)
    const result = await analyze(props.document.content, customPrompt.value, {
      max_tokens: selectedLengthOption?.tokens || 400,
      output_length: outputLength.value
    })
    emit('analysis-complete', result)
  } catch (error) {
    emit('analysis-error', error)
  }
}
</script>
