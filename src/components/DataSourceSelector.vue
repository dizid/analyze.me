<template>
  <CyberpunkPanel title="Data Source" title-color="cyan">
    <!-- Tab Navigation -->
    <div class="flex border-b border-gray-700 mb-4">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'flex-1 py-2 px-3 text-sm font-semibold transition-all border-b-2 -mb-px',
          activeTab === tab.id
            ? 'text-cyberpunk-cyan border-cyberpunk-cyan'
            : 'text-gray-400 border-transparent hover:text-white hover:border-gray-500'
        ]"
      >
        <span class="mr-1">{{ tab.icon }}</span>
        <span class="hidden sm:inline">{{ tab.label }}</span>
      </button>
    </div>

    <!-- Google Docs Tab -->
    <div v-show="activeTab === 'google'">
      <GoogleAuthContent
        @document-selected="handleDocumentSelected"
        @document-cleared="handleDocumentCleared"
      />
    </div>

    <!-- Manual Import Tab -->
    <div v-show="activeTab === 'manual'">
      <ManualImport
        @content-ready="handleManualContent"
        @content-cleared="handleContentCleared"
      />
    </div>

    <!-- Twitter Archive Tab -->
    <div v-show="activeTab === 'twitter'">
      <TwitterArchiveImport
        @content-ready="handleTwitterContent"
        @content-cleared="handleContentCleared"
      />
    </div>
  </CyberpunkPanel>
</template>

<script setup>
import { ref } from 'vue'
import CyberpunkPanel from '@/components/ui/CyberpunkPanel.vue'
import GoogleAuthContent from '@/components/GoogleAuthContent.vue'
import ManualImport from '@/components/ManualImport.vue'
import TwitterArchiveImport from '@/components/TwitterArchiveImport.vue'

const emit = defineEmits(['document-selected', 'document-cleared'])

const tabs = [
  { id: 'google', label: 'Google Docs', icon: '📄' },
  { id: 'manual', label: 'Manual', icon: '✍️' },
  { id: 'twitter', label: 'Twitter', icon: '🐦' },
]

const activeTab = ref('google')

const handleDocumentSelected = (document) => {
  emit('document-selected', document)
}

const handleDocumentCleared = () => {
  emit('document-cleared')
}

const handleManualContent = (content) => {
  // Convert manual content to document format
  const document = {
    id: `manual-${Date.now()}`,
    name: 'Manual Import',
    sizeBytes: new Blob([content]).size,
    content: content,
    source: 'manual'
  }
  emit('document-selected', document)
}

const handleTwitterContent = (data) => {
  // Convert Twitter data to document format
  const document = {
    id: `twitter-${Date.now()}`,
    name: `Twitter Archive (${data.tweetCount} tweets)`,
    sizeBytes: new Blob([data.content]).size,
    content: data.content,
    source: 'twitter',
    metadata: {
      tweetCount: data.tweetCount,
      dateRange: data.dateRange
    }
  }
  emit('document-selected', document)
}

const handleContentCleared = () => {
  emit('document-cleared')
}
</script>
