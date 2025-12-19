<template>
  <div class="gmail-import">
    <!-- Connection Status -->
    <div v-if="!isConnected" class="connect-section">
      <div class="info-text">
        <span class="icon">📧</span>
        <p>Connect your Gmail to analyze email communication patterns, sentiment, and topics.</p>
      </div>

      <button
        @click="handleConnect"
        class="connect-button"
        :disabled="isConnecting"
      >
        <span v-if="isConnecting" class="spinner"></span>
        <span v-else>Connect Gmail</span>
      </button>

      <p class="privacy-note">
        We only read email subjects and snippets. Full email content is never accessed.
      </p>
    </div>

    <!-- Connected State -->
    <div v-else class="connected-section">
      <div class="connection-status">
        <span class="status-icon">✓</span>
        <span class="status-text">Gmail Connected</span>
      </div>

      <!-- Options -->
      <div class="options">
        <label class="option">
          <span>Time Range</span>
          <select v-model="daysBack" class="select-input">
            <option :value="7">Last 7 days</option>
            <option :value="14">Last 14 days</option>
            <option :value="30">Last 30 days</option>
            <option :value="60">Last 60 days</option>
            <option :value="90">Last 90 days</option>
          </select>
        </label>

        <label class="option">
          <span>Max Emails</span>
          <select v-model="maxEmails" class="select-input">
            <option :value="25">25 emails</option>
            <option :value="50">50 emails</option>
            <option :value="100">100 emails</option>
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
        <span v-else>{{ emailData ? 'Refresh Data' : 'Fetch Emails' }}</span>
      </button>

      <!-- Data Summary -->
      <div v-if="emailData" class="data-summary">
        <h4 class="summary-title">Email Data Ready</h4>
        <div class="summary-stats">
          <div class="stat">
            <span class="stat-value">{{ emailData.metadata.totalEmails }}</span>
            <span class="stat-label">Total</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ emailData.metadata.sentCount }}</span>
            <span class="stat-label">Sent</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ emailData.metadata.receivedCount }}</span>
            <span class="stat-label">Received</span>
          </div>
        </div>

        <button @click="handleAnalyze" class="analyze-button">
          Analyze Email Patterns →
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
import { useGmailData } from '@/composables/useGmailData'

const emit = defineEmits(['content-ready', 'content-cleared'])

const { isAuthenticated, getAccessToken, signIn } = useGoogleAuth()
const { isLoading, error, emailData, fetchEmails, clearData } = useGmailData()

const isConnecting = ref(false)
const daysBack = ref(30)
const maxEmails = ref(50)

const isConnected = computed(() => isAuthenticated.value)

const handleConnect = async () => {
  isConnecting.value = true
  try {
    await signIn()
  } catch (err) {
    console.error('Failed to connect Gmail:', err)
  } finally {
    isConnecting.value = false
  }
}

const handleFetch = async () => {
  try {
    const token = await getAccessToken()
    await fetchEmails(token, {
      daysBack: daysBack.value,
      maxResults: maxEmails.value,
    })
  } catch (err) {
    console.error('Failed to fetch emails:', err)
  }
}

const handleAnalyze = () => {
  if (emailData.value) {
    emit('content-ready', {
      content: emailData.value.content,
      metadata: emailData.value.metadata,
    })
  }
}
</script>

<style scoped>
.gmail-import {
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

.summary-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 16px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-value {
  font-family: 'Orbitron', sans-serif;
  font-size: 24px;
  font-weight: bold;
  color: white;
}

.stat-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
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
