<template>
  <div class="min-h-screen p-4 md:p-8">
    <!-- Header -->
    <header class="mb-8 text-center relative">
      <!-- Top Bar: Profile & Navigation -->
      <div class="flex justify-between items-start mb-4">
        <!-- Profile Button -->
        <button
          class="neon-button px-4 py-2 text-sm border-cyberpunk-cyan text-cyberpunk-cyan hover:shadow-[var(--shadow-neon-cyan)]"
          @click="router.push('/profile')"
        >
          Profile
        </button>

        <!-- Right Side Navigation -->
        <div class="flex gap-2">
          <!-- Journal Button -->
          <button
            class="neon-button px-4 py-2 text-sm border-cyberpunk-lime text-cyberpunk-lime hover:shadow-[var(--shadow-neon-lime)]"
            @click="router.push('/journal')"
          >
            Journal
          </button>

          <!-- Digest Button -->
          <button
            class="neon-button px-4 py-2 text-sm border-cyberpunk-pink text-cyberpunk-pink hover:shadow-[var(--shadow-neon-pink)]"
            @click="router.push('/digest')"
          >
            Digest
          </button>

          <!-- Projects Button -->
          <button
            class="neon-button px-3 py-1.5 text-xs border-cyberpunk-lime text-cyberpunk-lime hover:shadow-[var(--shadow-neon-lime)] opacity-60 hover:opacity-100 transition-opacity"
            @click="router.push('/projects')"
          >
            Projects
          </button>
        </div>
      </div>

      <!-- Gamification Bar -->
      <div class="flex justify-center mb-6">
        <GamificationBar @show-achievements="router.push('/achievements')" />
      </div>

      <h1 class="text-4xl md:text-6xl font-bold mb-2">
        <GlitchText text="CLAUDE" color="cyan" class="animate-neon-pulse" />
        <span class="text-cyberpunk-pink"> AI </span>
        <span class="text-cyberpunk-lime">ANALYSIS</span>
      </h1>
      <p class="text-gray-400 text-sm md:text-base font-mono">
        Self-Analysis Dashboard • Powered by Anthropic
      </p>
    </header>

    <!-- Dashboard Grid -->
    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Data Sources & Document Selection -->
      <div class="lg:col-span-1 space-y-6">
        <DataSourceSelector
          @document-selected="handleDocumentSelected"
          @document-cleared="handleDocumentCleared"
          @tab-changed="handleTabChanged"
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
        <AnalysisPrompt
          :document="selectedDocument"
          :data-source="activeDataSource"
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

    <!-- Achievement Unlock Modal -->
    <AchievementUnlockModal
      :visible="showAchievementModal"
      :achievement="currentAchievement"
      @close="handleAchievementModalClose"
    />

    <!-- XP Notifications -->
    <XPGainNotification ref="xpNotificationRef" />

    <!-- Onboarding Overlay (first visit only) -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showOnboarding"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          style="background: rgba(0,0,0,0.8); backdrop-filter: blur(8px);"
        >
          <div
            class="w-full max-w-lg border border-cyberpunk-cyan rounded-lg p-8"
            style="background: #0d0d1a;"
          >
            <!-- Title -->
            <h2 class="text-2xl font-bold text-cyberpunk-cyan mb-2 text-center tracking-wider">
              WELCOME TO ANALYZE.ME
            </h2>
            <p class="text-gray-400 text-sm text-center mb-8 font-mono">
              Your personal AI-powered self-analysis dashboard
            </p>

            <!-- Steps -->
            <div class="space-y-5 mb-8">
              <!-- Step 1 -->
              <div class="flex gap-4 items-start p-4 border border-gray-700 rounded">
                <span class="text-cyberpunk-cyan text-2xl font-bold font-mono leading-none mt-0.5">01</span>
                <div>
                  <h3 class="font-bold text-cyberpunk-cyan text-sm tracking-wide mb-1">CONNECT YOUR DATA</h3>
                  <p class="text-gray-400 text-sm leading-relaxed">
                    Upload documents, connect Gmail, Spotify, GitHub, Calendar, or paste any text directly.
                  </p>
                </div>
              </div>

              <!-- Step 2 -->
              <div class="flex gap-4 items-start p-4 border border-gray-700 rounded">
                <span class="text-cyberpunk-pink text-2xl font-bold font-mono leading-none mt-0.5">02</span>
                <div>
                  <h3 class="font-bold text-cyberpunk-pink text-sm tracking-wide mb-1">CHOOSE ANALYSIS TYPE</h3>
                  <p class="text-gray-400 text-sm leading-relaxed">
                    Pick from AI-powered analysis prompts tailored to your data — mood, productivity, growth, and more.
                  </p>
                </div>
              </div>

              <!-- Step 3 -->
              <div class="flex gap-4 items-start p-4 border border-gray-700 rounded">
                <span class="text-cyberpunk-lime text-2xl font-bold font-mono leading-none mt-0.5">03</span>
                <div>
                  <h3 class="font-bold text-cyberpunk-lime text-sm tracking-wide mb-1">GET PERSONAL INSIGHTS</h3>
                  <p class="text-gray-400 text-sm leading-relaxed">
                    Receive actionable insights, mood analysis, and growth recommendations powered by Claude AI.
                  </p>
                </div>
              </div>
            </div>

            <!-- CTA -->
            <div class="text-center">
              <CyberpunkButton variant="cyan" size="lg" @click="dismissOnboarding">
                Get Started
              </CyberpunkButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DataSourceSelector from '@/components/DataSourceSelector.vue'
import AnalysisPrompt from '@/components/AnalysisPrompt.vue'
import ResultDisplay from '@/components/ResultDisplay.vue'
import ErrorDialog from '@/components/ErrorDialog.vue'
import CyberpunkPanel from '@/components/ui/CyberpunkPanel.vue'
import CyberpunkButton from '@/components/ui/CyberpunkButton.vue'
import GlitchText from '@/components/ui/GlitchText.vue'
import GamificationBar from '@/components/gamification/GamificationBar.vue'
import AchievementUnlockModal from '@/components/gamification/AchievementUnlockModal.vue'
import XPGainNotification from '@/components/gamification/XPGainNotification.vue'
import { useAnalysisHistory } from '@/composables/useAnalysisHistory'
import { useGamification } from '@/composables/useGamification'
import { handleError } from '@/utils/errorHandler'

const router = useRouter()

// Onboarding overlay — shown only on first visit
const ONBOARDING_KEY = 'analyze-me-onboarding-complete'
const showOnboarding = ref(!localStorage.getItem(ONBOARDING_KEY))

const dismissOnboarding = () => {
  localStorage.setItem(ONBOARDING_KEY, '1')
  showOnboarding.value = false
}

const { history, addToHistory, clearHistory } = useAnalysisHistory()
const {
  trackAnalysis,
  trackDataSourceConnected,
  getPendingUnlock,
  hasPendingUnlocks,
  formatXPReason,
} = useGamification()

const selectedDocument = ref(null)
const activeDataSource = ref(null)
const analysisResult = ref(null)
const showError = ref(false)
const errorMessage = ref('')
const errorRetryAction = ref(null)

// Gamification state
const showAchievementModal = ref(false)
const currentAchievement = ref(null)
const xpNotificationRef = ref(null)

const handleTabChanged = (tabId) => {
  activeDataSource.value = tabId
}

const handleDocumentSelected = (document) => {
  selectedDocument.value = document
  analysisResult.value = null // Clear previous results

  // Sync active data source from the document's source field
  if (document?.source) {
    activeDataSource.value = document.source

    const result = trackDataSourceConnected(document.source)
    if (result?.isNew) {
      showXPNotifications(result.xpResult)
      processNewAchievements(result.newAchievements)
    }
  }
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

  // Track gamification
  const gamificationResult = trackAnalysis(result, selectedDocument.value)

  // Show XP notifications
  if (gamificationResult.xpResults?.length > 0) {
    gamificationResult.xpResults.forEach(xpResult => {
      showXPNotifications(xpResult)
    })
  }

  // Check for level up
  if (gamificationResult.levelUp) {
    xpNotificationRef.value?.addNotification({
      isLevelUp: true,
      newLevel: gamificationResult.newLevel,
      reason: 'Level Up!',
    })
  }

  // Process new achievements
  processNewAchievements(gamificationResult.newAchievements)
}

const showXPNotifications = (xpResult) => {
  if (!xpResult) return

  xpNotificationRef.value?.addNotification({
    amount: xpResult.xpGained,
    reason: formatXPReason(xpResult.reason),
  })
}

const processNewAchievements = (newAchievements) => {
  if (!newAchievements?.length) return

  // Show the first achievement modal, queue the rest
  showNextAchievement()
}

const showNextAchievement = () => {
  if (hasPendingUnlocks.value) {
    currentAchievement.value = getPendingUnlock()
    if (currentAchievement.value) {
      showAchievementModal.value = true
    }
  }
}

const handleAchievementModalClose = () => {
  showAchievementModal.value = false
  currentAchievement.value = null

  // Show next achievement if queued
  setTimeout(() => {
    showNextAchievement()
  }, 300)
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

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
