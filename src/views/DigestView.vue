<template>
  <div class="min-h-screen p-4 md:p-8">
    <!-- Header -->
    <header class="mb-8">
      <div class="flex justify-between items-start mb-4">
        <button
          @click="$emit('back')"
          class="neon-button px-4 py-2 text-sm border-cyberpunk-cyan text-cyberpunk-cyan hover:shadow-[var(--shadow-neon-cyan)]"
        >
          ← Back to Dashboard
        </button>

        <button
          @click="downloadMarkdown"
          :disabled="isGeneratingInsights"
          class="neon-button px-4 py-2 text-sm border-cyberpunk-pink text-cyberpunk-pink hover:shadow-[var(--shadow-neon-pink)] disabled:opacity-50"
        >
          Save .md
        </button>
      </div>

      <div class="text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-2">
          <span class="text-cyberpunk-cyan">ANALYSIS</span>
          <span class="text-cyberpunk-pink"> DIGEST</span>
        </h1>
        <p class="text-gray-400 text-sm font-mono">
          Last {{ recentAnalyses.length }} analyses • Generated {{ generatedDate }}
        </p>
      </div>
    </header>

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- AI Insights Section -->
      <div class="cyberpunk-panel ai-insights">
        <h3 class="section-title">
          <span class="title-icon">🧠</span>
          AI Insights
        </h3>

        <div v-if="isGeneratingInsights" class="insights-loading">
          <div class="loading-spinner"></div>
          <p>Generating meta-insights from your analyses...</p>
        </div>

        <div v-else-if="aiInsights" class="insights-content">
          <div v-html="renderedInsights" class="markdown-content"></div>
        </div>

        <div v-else-if="insightsError" class="insights-error">
          <span class="error-icon">⚠️</span>
          <p>{{ insightsError }}</p>
          <button @click="generateInsights" class="retry-button">
            Try Again
          </button>
        </div>

        <div v-else-if="recentAnalyses.length === 0" class="no-analyses">
          <p>Complete some analyses to see AI insights!</p>
        </div>
      </div>

      <!-- Recent Analyses Grid -->
      <div class="cyberpunk-panel analyses-section">
        <h3 class="section-title">
          <span class="title-icon">📋</span>
          Recent Analyses
        </h3>

        <div v-if="recentAnalyses.length > 0" class="analyses-grid">
          <div
            v-for="(analysis, index) in recentAnalyses"
            :key="analysis.id"
            class="analysis-card"
          >
            <div class="card-header">
              <span class="card-number">#{{ index + 1 }}</span>
              <span class="card-date">{{ formatDate(analysis.timestamp) }}</span>
            </div>

            <h4 class="card-title">{{ truncate(analysis.documentName, 40) }}</h4>

            <p class="card-snippet">{{ getSnippet(analysis.content) }}</p>

            <div class="card-footer">
              <span class="card-prompt">{{ analysis.promptUsed }}</span>
            </div>
          </div>
        </div>

        <div v-else class="no-analyses-grid">
          <div class="empty-state">
            <span class="empty-icon">📊</span>
            <p>No analyses yet</p>
            <p class="empty-hint">Complete your first analysis to see it here!</p>
          </div>
        </div>
      </div>

      <!-- Stats Footer -->
      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-icon">{{ getStreakEmoji(currentStreak) }}</span>
          <span class="stat-value">{{ currentStreak }}</span>
          <span class="stat-label">Day Streak</span>
        </div>

        <div class="stat-item">
          <span class="stat-icon">📊</span>
          <span class="stat-value">{{ stats.totalAnalyses || 0 }}</span>
          <span class="stat-label">Total Analyses</span>
        </div>

        <div class="stat-item">
          <span class="stat-icon">⚡</span>
          <span class="stat-value">Lvl {{ currentLevel }}</span>
          <span class="stat-label">{{ levelTitle }}</span>
        </div>

        <div class="stat-item">
          <span class="stat-icon">✨</span>
          <span class="stat-value">{{ formatNumber(totalXp) }}</span>
          <span class="stat-label">Total XP</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAnalysisHistory } from '@/composables/useAnalysisHistory'
import { useGamification } from '@/composables/useGamification'
import { useGrokAnalysis } from '@/composables/useGrokAnalysis'
import { useMarkdownRenderer } from '@/composables/useMarkdownRenderer'

defineEmits(['back'])

const { history } = useAnalysisHistory()
const {
  totalXp,
  currentLevel,
  levelTitle,
  currentStreak,
  stats,
  getStreakEmoji,
  trackExport,
} = useGamification()
const { analyze, isAnalyzing } = useGrokAnalysis()
const { renderMarkdown } = useMarkdownRenderer()

const aiInsights = ref(null)
const insightsError = ref(null)
const isGeneratingInsights = ref(false)

// Get last 5 analyses
const recentAnalyses = computed(() => {
  return history.value.slice(0, 5)
})

const generatedDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
})

const renderedInsights = computed(() => {
  if (!aiInsights.value) return ''
  return renderMarkdown(aiInsights.value)
})

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const truncate = (str, length) => {
  if (!str) return ''
  if (str.length <= length) return str
  return str.substring(0, length) + '...'
}

const getSnippet = (content) => {
  if (!content) return ''
  // Remove markdown formatting for cleaner snippet
  const cleaned = content
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/`/g, '')
    .replace(/\n/g, ' ')
    .trim()
  return truncate(cleaned, 150)
}

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num?.toString() || '0'
}

const generateInsights = async () => {
  if (recentAnalyses.value.length === 0) return

  isGeneratingInsights.value = true
  insightsError.value = null

  try {
    // Combine recent analyses content for meta-analysis
    const combinedContent = recentAnalyses.value
      .map((a, i) => `Analysis ${i + 1} (${a.documentName}):\n${a.content}`)
      .join('\n\n---\n\n')

    const prompt = `Analyze these ${recentAnalyses.value.length} recent self-analyses and provide a concise meta-summary. Identify:

1. **Common Themes**: Patterns or recurring topics across the analyses
2. **Key Insights**: The most valuable insights discovered
3. **Suggested Focus Areas**: Areas for continued reflection or action

Keep the response concise (3-4 bullet points per section). Use a supportive, insightful tone.`

    const result = await analyze(combinedContent, prompt, {
      max_tokens: 800,
      temperature: 0.7,
    })

    aiInsights.value = result.content
  } catch (err) {
    console.error('Failed to generate insights:', err)
    insightsError.value = 'Failed to generate insights. Please try again.'
  } finally {
    isGeneratingInsights.value = false
  }
}

const downloadMarkdown = () => {
  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `analysis-digest-${timestamp}.md`

  // Build markdown content
  let content = `# Analysis Digest\n\n`
  content += `**Generated:** ${generatedDate.value}\n`
  content += `**Analyses:** ${recentAnalyses.value.length}\n\n`

  // AI Insights
  if (aiInsights.value) {
    content += `## AI Insights\n\n${aiInsights.value}\n\n`
  }

  // Recent analyses
  content += `## Recent Analyses\n\n`
  recentAnalyses.value.forEach((analysis, index) => {
    content += `### ${index + 1}. ${analysis.documentName}\n`
    content += `*${formatDate(analysis.timestamp)}*\n\n`
    content += `${analysis.content}\n\n---\n\n`
  })

  // Stats
  content += `## Stats\n\n`
  content += `- **Streak:** ${currentStreak.value} days\n`
  content += `- **Total Analyses:** ${stats.value.totalAnalyses || 0}\n`
  content += `- **Level:** ${currentLevel.value} (${levelTitle.value})\n`
  content += `- **Total XP:** ${totalXp.value}\n`

  // Download
  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  trackExport()
}

onMounted(() => {
  if (recentAnalyses.value.length > 0) {
    generateInsights()
  }
})
</script>

<style scoped>
.cyberpunk-panel {
  background: rgba(45, 27, 61, 0.6);
  border: 1px solid rgba(0, 255, 238, 0.2);
  border-radius: 12px;
  padding: 24px;
  backdrop-filter: blur(10px);
}

.ai-insights {
  border-color: rgba(168, 85, 247, 0.4);
  background: linear-gradient(135deg, rgba(45, 27, 61, 0.8) 0%, rgba(26, 10, 46, 0.8) 100%);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
  color: #00ffee;
  margin: 0 0 16px 0;
}

.title-icon {
  font-size: 20px;
}

/* AI Insights */
.insights-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px;
  color: rgba(255, 255, 255, 0.6);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(168, 85, 247, 0.2);
  border-top-color: #a855f7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.insights-content {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.7;
}

.insights-content :deep(h1),
.insights-content :deep(h2),
.insights-content :deep(h3) {
  color: #a855f7;
  margin-top: 16px;
  margin-bottom: 8px;
}

.insights-content :deep(strong) {
  color: #00ffee;
}

.insights-content :deep(ul),
.insights-content :deep(ol) {
  padding-left: 20px;
  margin-bottom: 12px;
}

.insights-content :deep(li) {
  margin-bottom: 6px;
}

.insights-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  color: #ff6b6b;
}

.error-icon {
  font-size: 24px;
}

.retry-button {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid rgba(168, 85, 247, 0.5);
  border-radius: 6px;
  color: #a855f7;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-button:hover {
  background: rgba(168, 85, 247, 0.1);
}

.no-analyses {
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  padding: 24px;
}

/* Analyses Grid */
.analyses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.analysis-card {
  background: rgba(26, 10, 46, 0.6);
  border: 1px solid rgba(0, 255, 238, 0.15);
  border-radius: 10px;
  padding: 16px;
  transition: all 0.3s ease;
}

.analysis-card:hover {
  border-color: rgba(0, 255, 238, 0.4);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-number {
  font-family: 'Orbitron', sans-serif;
  font-size: 12px;
  font-weight: bold;
  color: #00ffee;
  background: rgba(0, 255, 238, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
}

.card-date {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.card-title {
  font-size: 14px;
  font-weight: bold;
  color: white;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.card-snippet {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
  margin: 0 0 12px 0;
  flex-grow: 1;
}

.card-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 12px;
}

.card-prompt {
  font-size: 10px;
  color: #ff00ff;
  text-transform: uppercase;
  font-weight: bold;
}

.no-analyses-grid {
  padding: 40px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.5);
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.empty-hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

/* Stats Bar */
.stats-bar {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 16px;
  padding: 20px;
  background: rgba(45, 27, 61, 0.6);
  border: 1px solid rgba(0, 255, 238, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 80px;
}

.stat-item .stat-icon {
  font-size: 24px;
}

.stat-item .stat-value {
  font-family: 'Orbitron', sans-serif;
  font-size: 18px;
  font-weight: bold;
  color: white;
}

.stat-item .stat-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
}

/* Responsive */
@media (max-width: 640px) {
  .analyses-grid {
    grid-template-columns: 1fr;
  }

  .stats-bar {
    padding: 16px;
    gap: 12px;
  }

  .stat-item {
    min-width: 70px;
  }

  .stat-item .stat-value {
    font-size: 16px;
  }
}

/* Print/PDF styles */
@media print {
  .cyberpunk-panel {
    background: white !important;
    border-color: #333 !important;
  }

  .section-title {
    color: #333 !important;
  }

  .analysis-card {
    background: #f5f5f5 !important;
    border-color: #ddd !important;
  }

  .card-title {
    color: #333 !important;
  }

  .card-snippet {
    color: #666 !important;
  }
}
</style>
