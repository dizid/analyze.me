<template>
  <div class="github-import">
    <!-- Not Connected -->
    <div v-if="!isConnected" class="connect-section">
      <div class="info-text">
        <span class="icon">🐙</span>
        <p>Connect GitHub to analyze your coding patterns, commit habits, and developer wellness indicators.</p>
      </div>

      <button
        @click="handleConnect"
        class="connect-button github"
        :disabled="isConnecting"
      >
        <span v-if="isConnecting" class="spinner"></span>
        <span v-else>Connect GitHub</span>
      </button>

      <p class="privacy-note">
        We only read your public profile, repos, and activity. We cannot modify your repositories.
      </p>
    </div>

    <!-- Connected -->
    <div v-else class="connected-section">
      <div class="connection-status github">
        <span class="status-icon">✓</span>
        <span class="status-text">GitHub Connected</span>
        <span v-if="user" class="username">@{{ user.login }}</span>
        <button @click="handleDisconnect" class="disconnect-btn">Disconnect</button>
      </div>

      <!-- Fetch Button -->
      <button
        @click="handleFetch"
        class="fetch-button"
        :disabled="isLoading"
      >
        <span v-if="isLoading" class="spinner"></span>
        <span v-else>{{ githubData ? 'Refresh Data' : 'Fetch GitHub Data' }}</span>
      </button>

      <!-- Data Summary -->
      <div v-if="githubData" class="data-summary">
        <h4 class="summary-title">Developer Profile Ready</h4>

        <!-- Burnout Indicator -->
        <div class="burnout-display" :class="githubData.metadata.burnoutLevel.level">
          <div class="burnout-header">
            <span class="burnout-emoji">{{ getBurnoutEmoji(githubData.metadata.burnoutLevel.level) }}</span>
            <div class="burnout-info">
              <span class="burnout-label">Work-Life Balance</span>
              <span class="burnout-value">{{ githubData.metadata.burnoutLevel.label }}</span>
            </div>
          </div>
          <div class="burnout-bar">
            <div
              class="burnout-fill"
              :style="{
                width: `${githubData.metadata.burnoutScore}%`,
                background: githubData.metadata.burnoutLevel.color
              }"
            ></div>
          </div>
          <span class="burnout-score">Risk Score: {{ githubData.metadata.burnoutScore }}/100</span>
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid">
          <div class="stat">
            <span class="stat-value">{{ githubData.metadata.repoStats.total }}</span>
            <span class="stat-label">Repos</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ githubData.metadata.repoStats.stars }}</span>
            <span class="stat-label">Stars</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ githubData.metadata.activitySummary.commits }}</span>
            <span class="stat-label">Recent Commits</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ githubData.metadata.activityPatterns.weekendWorkPercent }}%</span>
            <span class="stat-label">Weekend Work</span>
          </div>
        </div>

        <!-- Top Languages -->
        <div class="languages" v-if="githubData.metadata.topLanguages?.length">
          <span class="languages-label">Top Languages:</span>
          <div class="language-tags">
            <span
              v-for="lang in githubData.metadata.topLanguages.slice(0, 4)"
              :key="lang.language"
              class="language-tag"
              :style="{ borderColor: getLanguageColor(lang.language) }"
            >
              {{ lang.language }}
            </span>
          </div>
        </div>

        <!-- Activity Pattern -->
        <div class="activity-pattern">
          <span class="pattern-label">
            Peak activity: {{ githubData.metadata.activityPatterns.peakHourFormatted }} on {{ githubData.metadata.activityPatterns.peakDay }}s
          </span>
        </div>

        <button @click="handleAnalyze" class="analyze-button">
          Analyze Developer Wellness →
        </button>
      </div>

      <!-- Error -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGitHubAuth } from '@/composables/useGitHubAuth'
import { useGitHubData } from '@/composables/useGitHubData'

const emit = defineEmits(['content-ready', 'content-cleared'])

const { isAuthenticated, user, initiateAuth, getAccessToken, signOut } = useGitHubAuth()
const { isLoading, error, githubData, fetchGitHubData, clearData } = useGitHubData()

const isConnecting = ref(false)

const isConnected = computed(() => isAuthenticated.value)

const handleConnect = async () => {
  isConnecting.value = true
  try {
    await initiateAuth()
  } catch (err) {
    console.error('GitHub auth failed:', err)
  } finally {
    isConnecting.value = false
  }
}

const handleDisconnect = () => {
  signOut()
  clearData()
  emit('content-cleared')
}

const handleFetch = async () => {
  try {
    const token = getAccessToken()
    await fetchGitHubData(token)
  } catch (err) {
    console.error('Failed to fetch GitHub data:', err)
  }
}

const handleAnalyze = () => {
  if (githubData.value) {
    emit('content-ready', {
      content: githubData.value.content,
      metadata: githubData.value.metadata,
    })
  }
}

const getBurnoutEmoji = (level) => {
  const emojis = {
    healthy: '💚',
    moderate: '💛',
    elevated: '🧡',
    high: '❤️‍🔥',
  }
  return emojis[level] || '💚'
}

const getLanguageColor = (language) => {
  const colors = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572A5',
    Java: '#b07219',
    Go: '#00ADD8',
    Rust: '#dea584',
    Ruby: '#701516',
    PHP: '#4F5D95',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#178600',
    Swift: '#F05138',
    Kotlin: '#A97BFF',
    Vue: '#41b883',
    HTML: '#e34c26',
    CSS: '#563d7c',
  }
  return colors[language] || '#00ffee'
}
</script>

<style scoped>
.github-import {
  padding: 8px 0;
}

.connect-section,
.connected-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-text {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: rgba(110, 84, 148, 0.1);
  border-radius: 8px;
}

.info-text .icon {
  font-size: 24px;
}

.info-text p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.5;
}

.connect-button,
.fetch-button,
.analyze-button {
  padding: 12px 20px;
  background: transparent;
  border: 2px solid #00ffee;
  border-radius: 6px;
  color: #00ffee;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.connect-button.github {
  border-color: #6e5494;
  color: #a78bfa;
}

.connect-button.github:hover {
  background: rgba(110, 84, 148, 0.2);
  box-shadow: 0 0 15px rgba(110, 84, 148, 0.4);
}

.connect-button:hover,
.fetch-button:hover {
  background: rgba(0, 255, 238, 0.1);
  box-shadow: 0 0 15px rgba(0, 255, 238, 0.3);
}

.connect-button:disabled,
.fetch-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.analyze-button {
  background: rgba(110, 84, 148, 0.1);
  border-color: #6e5494;
  color: #a78bfa;
}

.privacy-note {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(110, 84, 148, 0.1);
  border: 1px solid rgba(110, 84, 148, 0.3);
  border-radius: 6px;
}

.status-icon {
  color: #a78bfa;
  font-weight: bold;
}

.status-text {
  font-size: 13px;
  color: #a78bfa;
}

.username {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  flex: 1;
}

.disconnect-btn {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  background: none;
  border: none;
  cursor: pointer;
}

.disconnect-btn:hover {
  color: #ff0064;
}

.data-summary {
  padding: 16px;
  background: rgba(26, 10, 46, 0.6);
  border: 1px solid rgba(110, 84, 148, 0.2);
  border-radius: 8px;
}

.summary-title {
  font-size: 14px;
  font-weight: bold;
  color: #a78bfa;
  margin: 0 0 16px 0;
}

.burnout-display {
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  margin-bottom: 16px;
}

.burnout-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.burnout-emoji {
  font-size: 28px;
}

.burnout-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.burnout-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
}

.burnout-value {
  font-size: 16px;
  font-weight: bold;
  color: white;
}

.burnout-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 4px;
}

.burnout-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.burnout-score {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px;
  background: rgba(110, 84, 148, 0.1);
  border-radius: 6px;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #a78bfa;
}

.stat-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
}

.languages {
  margin-bottom: 12px;
}

.languages-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  display: block;
  margin-bottom: 6px;
}

.language-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.language-tag {
  font-size: 11px;
  padding: 4px 8px;
  background: rgba(110, 84, 148, 0.1);
  border: 1px solid rgba(110, 84, 148, 0.3);
  border-radius: 12px;
  color: white;
}

.activity-pattern {
  margin-bottom: 16px;
}

.pattern-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.error-message {
  padding: 12px;
  background: rgba(255, 0, 100, 0.1);
  border: 1px solid rgba(255, 0, 100, 0.3);
  border-radius: 6px;
  color: #ff0064;
  font-size: 13px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(110, 84, 148, 0.3);
  border-top-color: #a78bfa;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
