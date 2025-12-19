<template>
  <div class="calendar-import">
    <!-- Connection Status -->
    <div v-if="!isConnected" class="connect-section">
      <div class="info-text">
        <span class="icon">📅</span>
        <p>Connect your Google Calendar to analyze work-life balance, meeting patterns, and time allocation.</p>
      </div>

      <button
        @click="handleConnect"
        class="connect-button"
        :disabled="isConnecting"
      >
        <span v-if="isConnecting" class="spinner"></span>
        <span v-else>Connect Calendar</span>
      </button>

      <p class="privacy-note">
        We only read event titles and times. Event details and attendees are not accessed.
      </p>
    </div>

    <!-- Connected State -->
    <div v-else class="connected-section">
      <div class="connection-status">
        <span class="status-icon">✓</span>
        <span class="status-text">Calendar Connected</span>
      </div>

      <!-- Options -->
      <div class="options">
        <label class="option">
          <span>Look Back</span>
          <select v-model="monthsBack" class="select-input">
            <option :value="1">1 month</option>
            <option :value="2">2 months</option>
            <option :value="3">3 months</option>
            <option :value="6">6 months</option>
          </select>
        </label>

        <label class="option">
          <span>Look Ahead</span>
          <select v-model="monthsForward" class="select-input">
            <option :value="0">None</option>
            <option :value="1">1 month</option>
            <option :value="2">2 months</option>
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
        <span v-else>{{ calendarData ? 'Refresh Data' : 'Fetch Events' }}</span>
      </button>

      <!-- Data Summary -->
      <div v-if="calendarData" class="data-summary">
        <h4 class="summary-title">Calendar Data Ready</h4>

        <div class="summary-grid">
          <div class="summary-item">
            <span class="item-label">Total Events</span>
            <span class="item-value">{{ calendarData.metadata.totalMeetings }}</span>
          </div>
          <div class="summary-item">
            <span class="item-label">Avg/Week</span>
            <span class="item-value">{{ calendarData.metadata.avgMeetingsPerWeek }}</span>
          </div>
          <div class="summary-item">
            <span class="item-label">Busiest Day</span>
            <span class="item-value">{{ calendarData.metadata.busiestDay || 'N/A' }}</span>
          </div>
          <div class="summary-item">
            <span class="item-label">Work/Life</span>
            <span class="item-value">{{ calendarData.metadata.workLifeRatio }}% work</span>
          </div>
        </div>

        <div class="insights">
          <div v-if="calendarData.metadata.weekendEvents > 0" class="insight warning">
            ⚠️ {{ calendarData.metadata.weekendEvents }} weekend events detected
          </div>
          <div v-if="calendarData.metadata.lateEveningEvents > 5" class="insight warning">
            ⚠️ {{ calendarData.metadata.lateEveningEvents }} late evening events
          </div>
          <div v-if="calendarData.metadata.avgMeetingsPerWeek < 5" class="insight good">
            ✓ Healthy meeting load
          </div>
        </div>

        <button @click="handleAnalyze" class="analyze-button">
          Analyze Work-Life Balance →
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGoogleAuth } from '@/composables/useGoogleAuth'
import { useCalendarData } from '@/composables/useCalendarData'

const emit = defineEmits(['content-ready', 'content-cleared'])

const { isAuthenticated, getAccessToken, signIn } = useGoogleAuth()
const { isLoading, error, calendarData, fetchEvents, clearData } = useCalendarData()

const isConnecting = ref(false)
const monthsBack = ref(3)
const monthsForward = ref(1)

const isConnected = computed(() => isAuthenticated.value)

const handleConnect = async () => {
  isConnecting.value = true
  try {
    await signIn()
  } catch (err) {
    console.error('Failed to connect Calendar:', err)
  } finally {
    isConnecting.value = false
  }
}

const handleFetch = async () => {
  try {
    const token = await getAccessToken()
    await fetchEvents(token, {
      monthsBack: monthsBack.value,
      monthsForward: monthsForward.value,
    })
  } catch (err) {
    console.error('Failed to fetch events:', err)
  }
}

const handleAnalyze = () => {
  if (calendarData.value) {
    emit('content-ready', {
      content: calendarData.value.content,
      metadata: calendarData.value.metadata,
    })
  }
}
</script>

<style scoped>
.calendar-import {
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
  background: rgba(0, 255, 238, 0.05);
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

.connect-button:hover,
.fetch-button:hover,
.analyze-button:hover {
  background: rgba(0, 255, 238, 0.1);
  box-shadow: 0 0 15px rgba(0, 255, 238, 0.3);
}

.connect-button:disabled,
.fetch-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.analyze-button {
  background: rgba(0, 255, 65, 0.1);
  border-color: #00ff41;
  color: #00ff41;
}

.analyze-button:hover {
  box-shadow: 0 0 15px rgba(0, 255, 65, 0.3);
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
  background: rgba(0, 255, 65, 0.1);
  border: 1px solid rgba(0, 255, 65, 0.3);
  border-radius: 6px;
}

.status-icon {
  color: #00ff41;
  font-weight: bold;
}

.status-text {
  font-size: 13px;
  color: #00ff41;
}

.options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.option {
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
  border: 1px solid rgba(0, 255, 238, 0.3);
  border-radius: 4px;
  color: white;
  font-size: 13px;
  cursor: pointer;
}

.select-input:focus {
  outline: none;
  border-color: #00ffee;
}

.data-summary {
  padding: 16px;
  background: rgba(26, 10, 46, 0.6);
  border: 1px solid rgba(0, 255, 238, 0.2);
  border-radius: 8px;
}

.summary-title {
  font-size: 14px;
  font-weight: bold;
  color: #00ffee;
  margin: 0 0 12px 0;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
}

.item-value {
  font-family: 'Orbitron', sans-serif;
  font-size: 16px;
  font-weight: bold;
  color: white;
}

.insights {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.insight {
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 4px;
}

.insight.warning {
  background: rgba(255, 200, 0, 0.1);
  color: #ffc800;
}

.insight.good {
  background: rgba(0, 255, 65, 0.1);
  color: #00ff41;
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
  border: 2px solid rgba(0, 255, 238, 0.3);
  border-top-color: #00ffee;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
