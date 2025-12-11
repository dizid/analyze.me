<template>
  <div class="space-y-4">
    <p class="text-gray-400 text-sm">
      Upload your Twitter/X archive to analyze your posts.
      <a
        href="https://twitter.com/settings/download_your_data"
        target="_blank"
        class="text-cyberpunk-cyan hover:underline"
      >
        Download your archive here
      </a>
    </p>

    <!-- File Upload Area -->
    <div
      v-if="!parsedData"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      :class="[
        'border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer',
        isDragging
          ? 'border-cyberpunk-cyan bg-cyberpunk-cyan/10'
          : 'border-gray-600 hover:border-cyberpunk-lime hover:bg-cyberpunk-lime/5'
      ]"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        accept=".zip,.json"
        class="hidden"
        @change="handleFileSelect"
      />

      <div v-if="!isProcessing">
        <div class="text-3xl mb-2">📁</div>
        <p class="text-sm text-gray-300">
          Drop your Twitter archive (.zip) or tweets.js file here
        </p>
        <p class="text-xs text-gray-500 mt-2">or click to browse</p>
      </div>

      <div v-else class="flex flex-col items-center">
        <LoadingSpinner size="md" />
        <p class="text-sm text-cyberpunk-cyan mt-2">Processing archive...</p>
        <p class="text-xs text-gray-500">{{ processingStatus }}</p>
      </div>
    </div>

    <!-- Parsed Data Preview -->
    <div v-if="parsedData" class="space-y-4">
      <div class="p-4 bg-cyberpunk-purple-900/50 border border-cyberpunk-cyan/30 rounded">
        <div class="flex items-start justify-between mb-3">
          <div>
            <p class="text-cyberpunk-cyan font-semibold">Twitter Archive Loaded</p>
            <p class="text-xs text-gray-400 mt-1">{{ parsedData.tweetCount }} tweets found</p>
          </div>
          <button
            @click="clearData"
            class="text-gray-400 hover:text-cyberpunk-pink transition-colors"
          >
            ✕
          </button>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-2 text-xs text-gray-400">
          <div>
            <span class="text-gray-500">Date Range:</span>
            <span class="ml-1">{{ parsedData.dateRange }}</span>
          </div>
          <div>
            <span class="text-gray-500">Characters:</span>
            <span class="ml-1">{{ parsedData.charCount.toLocaleString() }}</span>
          </div>
        </div>

        <!-- Tweet Limit Selector -->
        <div class="mt-4">
          <label class="text-xs text-gray-400 mb-2 block">Tweets to analyze:</label>
          <div class="flex gap-2">
            <button
              v-for="limit in tweetLimits"
              :key="limit"
              @click="selectedLimit = limit"
              :class="[
                'px-3 py-1 text-xs rounded border transition-all',
                selectedLimit === limit
                  ? 'border-cyberpunk-lime bg-cyberpunk-lime/20 text-cyberpunk-lime'
                  : 'border-gray-600 text-gray-400 hover:border-cyberpunk-cyan'
              ]"
            >
              {{ limit === 'all' ? 'All' : `Last ${limit}` }}
            </button>
          </div>
        </div>
      </div>

      <!-- Sample Tweets Preview -->
      <div class="max-h-32 overflow-y-auto text-xs font-mono p-3 bg-black/30 rounded border border-gray-700">
        <p class="text-gray-500 mb-2">Sample tweets:</p>
        <div v-for="(tweet, index) in previewTweets" :key="index" class="text-gray-300 mb-1">
          "{{ tweet.slice(0, 100) }}{{ tweet.length > 100 ? '...' : '' }}"
        </div>
      </div>

      <!-- Analyze Button -->
      <CyberpunkButton
        variant="lime"
        @click="handleAnalyze"
        class="w-full"
      >
        Analyze {{ effectiveTweetCount }} Tweets
      </CyberpunkButton>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="p-3 bg-red-500/20 border border-red-500 rounded text-sm text-red-200">
      {{ error }}
    </div>

    <!-- Help Text -->
    <div class="text-xs text-gray-500 space-y-1">
      <p><strong>How to get your Twitter archive:</strong></p>
      <ol class="list-decimal list-inside space-y-1 ml-2">
        <li>Go to Twitter Settings → Your Account</li>
        <li>Click "Download an archive of your data"</li>
        <li>Wait for email notification (can take 24-48 hours)</li>
        <li>Download and upload the .zip file here</li>
      </ol>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CyberpunkButton from '@/components/ui/CyberpunkButton.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { useTwitterArchive } from '@/composables/useTwitterArchive'

const emit = defineEmits(['content-ready', 'content-cleared'])

const {
  parseArchive,
  parseJsonFile,
  isProcessing,
  processingStatus,
  error,
} = useTwitterArchive()

const fileInput = ref(null)
const isDragging = ref(false)
const parsedData = ref(null)
const selectedLimit = ref(100)
const tweetLimits = [50, 100, 200, 'all']

const previewTweets = computed(() => {
  if (!parsedData.value) return []
  return parsedData.value.tweets.slice(0, 3)
})

const effectiveTweetCount = computed(() => {
  if (!parsedData.value) return 0
  if (selectedLimit.value === 'all') return parsedData.value.tweetCount
  return Math.min(selectedLimit.value, parsedData.value.tweetCount)
})

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (file) {
    await processFile(file)
  }
}

const handleDrop = async (event) => {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (file) {
    await processFile(file)
  }
}

const processFile = async (file) => {
  try {
    let data

    if (file.name.endsWith('.zip')) {
      data = await parseArchive(file)
    } else if (file.name.endsWith('.json') || file.name.endsWith('.js')) {
      data = await parseJsonFile(file)
    } else {
      throw new Error('Please upload a .zip archive or .json/.js file')
    }

    parsedData.value = data
  } catch (err) {
    console.error('Error processing file:', err)
  }
}

const handleAnalyze = () => {
  if (!parsedData.value) return

  const tweetsToAnalyze = selectedLimit.value === 'all'
    ? parsedData.value.tweets
    : parsedData.value.tweets.slice(0, selectedLimit.value)

  // Format tweets for analysis
  const formattedContent = tweetsToAnalyze
    .map((tweet, index) => `[Tweet ${index + 1}]: ${tweet}`)
    .join('\n\n')

  emit('content-ready', {
    content: formattedContent,
    tweetCount: tweetsToAnalyze.length,
    dateRange: parsedData.value.dateRange
  })
}

const clearData = () => {
  parsedData.value = null
  selectedLimit.value = 100
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  emit('content-cleared')
}
</script>
