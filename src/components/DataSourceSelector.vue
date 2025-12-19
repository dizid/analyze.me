<template>
  <CyberpunkPanel title="Data Source" title-color="cyan">
    <!-- Tab Navigation -->
    <div class="tab-container">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'tab-button',
          activeTab === tab.id ? 'active' : ''
        ]"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
        <span v-if="tab.isNew" class="new-badge">NEW</span>
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

    <!-- Gmail Tab -->
    <div v-show="activeTab === 'gmail'">
      <GmailImport
        @content-ready="handleGmailContent"
        @content-cleared="handleContentCleared"
      />
    </div>

    <!-- Calendar Tab -->
    <div v-show="activeTab === 'calendar'">
      <CalendarImport
        @content-ready="handleCalendarContent"
        @content-cleared="handleContentCleared"
      />
    </div>

    <!-- Spotify Tab -->
    <div v-show="activeTab === 'spotify'">
      <SpotifyImport
        @content-ready="handleSpotifyContent"
        @content-cleared="handleContentCleared"
      />
    </div>

    <!-- GitHub Tab -->
    <div v-show="activeTab === 'github'">
      <GitHubImport
        @content-ready="handleGitHubContent"
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
import GmailImport from '@/components/data-sources/GmailImport.vue'
import CalendarImport from '@/components/data-sources/CalendarImport.vue'
import SpotifyImport from '@/components/data-sources/SpotifyImport.vue'
import GitHubImport from '@/components/data-sources/GitHubImport.vue'

const emit = defineEmits(['document-selected', 'document-cleared'])

const tabs = [
  { id: 'google', label: 'Docs', icon: '📄' },
  { id: 'manual', label: 'Text', icon: '✍️' },
  { id: 'twitter', label: 'Twitter', icon: '🐦' },
  { id: 'gmail', label: 'Gmail', icon: '📧', isNew: true },
  { id: 'calendar', label: 'Calendar', icon: '📅', isNew: true },
  { id: 'spotify', label: 'Spotify', icon: '🎵', isNew: true },
  { id: 'github', label: 'GitHub', icon: '🐙', isNew: true },
]

const activeTab = ref('google')

const handleDocumentSelected = (document) => {
  emit('document-selected', document)
}

const handleDocumentCleared = () => {
  emit('document-cleared')
}

const handleManualContent = (content) => {
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

const handleGmailContent = (data) => {
  const document = {
    id: `gmail-${Date.now()}`,
    name: `Gmail (${data.metadata.totalEmails} emails)`,
    sizeBytes: new Blob([data.content]).size,
    content: data.content,
    source: 'gmail',
    metadata: data.metadata
  }
  emit('document-selected', document)
}

const handleCalendarContent = (data) => {
  const document = {
    id: `calendar-${Date.now()}`,
    name: `Calendar (${data.metadata.totalMeetings} events)`,
    sizeBytes: new Blob([data.content]).size,
    content: data.content,
    source: 'calendar',
    metadata: data.metadata
  }
  emit('document-selected', document)
}

const handleSpotifyContent = (data) => {
  const document = {
    id: `spotify-${Date.now()}`,
    name: `Spotify (${data.metadata.tracksAnalyzed} tracks)`,
    sizeBytes: new Blob([data.content]).size,
    content: data.content,
    source: 'spotify',
    metadata: data.metadata
  }
  emit('document-selected', document)
}

const handleGitHubContent = (data) => {
  const document = {
    id: `github-${Date.now()}`,
    name: `GitHub (@${data.metadata.user.login})`,
    sizeBytes: new Blob([data.content]).size,
    content: data.content,
    source: 'github',
    metadata: data.metadata
  }
  emit('document-selected', document)
}

const handleContentCleared = () => {
  emit('document-cleared')
}
</script>

<style scoped>
.tab-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-button:hover {
  color: white;
  background: rgba(255, 255, 255, 0.05);
}

.tab-button.active {
  color: #00ffee;
  background: rgba(0, 255, 238, 0.1);
  border-color: rgba(0, 255, 238, 0.3);
}

.tab-icon {
  font-size: 14px;
}

.tab-label {
  display: none;
}

@media (min-width: 640px) {
  .tab-label {
    display: inline;
  }
}

.new-badge {
  font-size: 9px;
  padding: 2px 4px;
  background: rgba(255, 0, 255, 0.2);
  border: 1px solid rgba(255, 0, 255, 0.4);
  border-radius: 4px;
  color: #ff00ff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
