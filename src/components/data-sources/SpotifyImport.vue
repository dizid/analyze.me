<template>
  <div class="spotify-import">
    <!-- Not Connected -->
    <div v-if="!isConnected" class="connect-section">
      <div class="info-text">
        <span class="icon">🎵</span>
        <p>Connect Spotify to analyze your music taste, mood patterns, and listening habits.</p>
      </div>

      <button
        @click="handleConnect"
        class="connect-button spotify"
        :disabled="isConnecting"
      >
        <span v-if="isConnecting" class="spinner"></span>
        <span v-else>Connect Spotify</span>
      </button>

      <p class="privacy-note">
        We only read your listening history and top tracks. We cannot play music or access your playlists.
      </p>
    </div>

    <!-- Connected -->
    <div v-else class="connected-section">
      <div class="connection-status spotify">
        <span class="status-icon">✓</span>
        <span class="status-text">Spotify Connected</span>
        <button @click="handleDisconnect" class="disconnect-btn">Disconnect</button>
      </div>

      <!-- Options -->
      <div class="options">
        <label class="option">
          <span>Time Range</span>
          <select v-model="timeRange" class="select-input">
            <option value="short_term">Last 4 weeks</option>
            <option value="medium_term">Last 6 months</option>
            <option value="long_term">All time</option>
          </select>
        </label>
      </div>

      <!-- Fetch Button -->
      <button
        @click="handleFetch"
        class="fetch-button"
        :disabled="isLoading"
      >
        <span v-if="isLoading" class="spinner"></span>
        <span v-else>{{ spotifyData ? 'Refresh Data' : 'Fetch Music Data' }}</span>
      </button>

      <!-- Data Summary -->
      <div v-if="spotifyData" class="data-summary">
        <h4 class="summary-title">Music Data Ready</h4>

        <div class="mood-display">
          <span class="mood-emoji">{{ getMoodEmoji(spotifyData.metadata.moodCategory) }}</span>
          <div class="mood-info">
            <span class="mood-label">Current Mood</span>
            <span class="mood-value">{{ spotifyData.metadata.moodCategory }}</span>
          </div>
        </div>

        <div class="metrics-grid">
          <div class="metric">
            <div class="metric-bar">
              <div
                class="metric-fill happiness"
                :style="{ width: `${spotifyData.metadata.avgValence * 100}%` }"
              ></div>
            </div>
            <span class="metric-label">Happiness {{ Math.round(spotifyData.metadata.avgValence * 100) }}%</span>
          </div>

          <div class="metric">
            <div class="metric-bar">
              <div
                class="metric-fill energy"
                :style="{ width: `${spotifyData.metadata.avgEnergy * 100}%` }"
              ></div>
            </div>
            <span class="metric-label">Energy {{ Math.round(spotifyData.metadata.avgEnergy * 100) }}%</span>
          </div>

          <div class="metric">
            <div class="metric-bar">
              <div
                class="metric-fill dance"
                :style="{ width: `${spotifyData.metadata.avgDanceability * 100}%` }"
              ></div>
            </div>
            <span class="metric-label">Danceability {{ Math.round(spotifyData.metadata.avgDanceability * 100) }}%</span>
          </div>
        </div>

        <div class="genres" v-if="spotifyData.metadata.topGenres?.length">
          <span class="genres-label">Top Genres:</span>
          <div class="genre-tags">
            <span v-for="genre in spotifyData.metadata.topGenres.slice(0, 3)" :key="genre" class="genre-tag">
              {{ genre }}
            </span>
          </div>
        </div>

        <button @click="handleAnalyze" class="analyze-button">
          Analyze Music Mood →
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
import { useSpotifyAuth } from '@/composables/useSpotifyAuth'
import { useSpotifyData } from '@/composables/useSpotifyData'

const emit = defineEmits(['content-ready', 'content-cleared'])

const { isAuthenticated, initiateAuth, getAccessToken, signOut } = useSpotifyAuth()
const { isLoading, error, spotifyData, fetchSpotifyData, clearData } = useSpotifyData()

const isConnecting = ref(false)
const timeRange = ref('medium_term')

const isConnected = computed(() => isAuthenticated.value)

const handleConnect = async () => {
  isConnecting.value = true
  try {
    await initiateAuth()
  } catch (err) {
    console.error('Spotify auth failed:', err)
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
    const token = await getAccessToken()
    await fetchSpotifyData(token, {
      timeRange: timeRange.value,
    })
  } catch (err) {
    console.error('Failed to fetch Spotify data:', err)
  }
}

const handleAnalyze = () => {
  if (spotifyData.value) {
    emit('content-ready', {
      content: spotifyData.value.content,
      metadata: spotifyData.value.metadata,
    })
  }
}

const getMoodEmoji = (mood) => {
  const moods = {
    'happy & energetic': '🎉',
    'happy & chill': '😊',
    'intense & powerful': '💥',
    'melancholic & calm': '🌙',
    'sad or contemplative': '😔',
    'balanced': '😌',
  }
  return moods[mood] || '🎵'
}
</script>

<style scoped>
.spotify-import {
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
  background: rgba(30, 215, 96, 0.05);
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

.connect-button.spotify {
  border-color: #1ed760;
  color: #1ed760;
}

.connect-button.spotify:hover {
  background: rgba(30, 215, 96, 0.1);
  box-shadow: 0 0 15px rgba(30, 215, 96, 0.3);
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
  background: rgba(30, 215, 96, 0.1);
  border-color: #1ed760;
  color: #1ed760;
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
  background: rgba(30, 215, 96, 0.1);
  border: 1px solid rgba(30, 215, 96, 0.3);
  border-radius: 6px;
}

.status-icon {
  color: #1ed760;
  font-weight: bold;
}

.status-text {
  flex: 1;
  font-size: 13px;
  color: #1ed760;
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

.options {
  display: flex;
  gap: 12px;
}

.option {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.option span {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
}

.select-input {
  padding: 8px 12px;
  background: rgba(26, 10, 46, 0.8);
  border: 1px solid rgba(30, 215, 96, 0.3);
  border-radius: 4px;
  color: white;
  font-size: 13px;
}

.data-summary {
  padding: 16px;
  background: rgba(26, 10, 46, 0.6);
  border: 1px solid rgba(30, 215, 96, 0.2);
  border-radius: 8px;
}

.summary-title {
  font-size: 14px;
  font-weight: bold;
  color: #1ed760;
  margin: 0 0 16px 0;
}

.mood-display {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(30, 215, 96, 0.05);
  border-radius: 8px;
}

.mood-emoji {
  font-size: 32px;
}

.mood-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mood-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
}

.mood-value {
  font-size: 16px;
  font-weight: bold;
  color: white;
  text-transform: capitalize;
}

.metrics-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.metric-fill.happiness {
  background: linear-gradient(90deg, #facc15, #fde047);
}

.metric-fill.energy {
  background: linear-gradient(90deg, #f97316, #fb923c);
}

.metric-fill.dance {
  background: linear-gradient(90deg, #1ed760, #4ade80);
}

.metric-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.genres {
  margin-bottom: 16px;
}

.genres-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  display: block;
  margin-bottom: 6px;
}

.genre-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.genre-tag {
  font-size: 11px;
  padding: 4px 8px;
  background: rgba(30, 215, 96, 0.1);
  border: 1px solid rgba(30, 215, 96, 0.3);
  border-radius: 12px;
  color: #1ed760;
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
  border: 2px solid rgba(30, 215, 96, 0.3);
  border-top-color: #1ed760;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
