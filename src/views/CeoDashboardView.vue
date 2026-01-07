<template>
  <div class="min-h-screen p-4 md:p-8">
    <!-- Header -->
    <header class="mb-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold">
            <span class="text-cyberpunk-cyan glitch-text" data-text="CEO">CEO</span>
            <span class="text-cyberpunk-pink"> DASHBOARD</span>
          </h1>
          <p class="text-gray-400 text-sm mt-1">
            <span v-if="lastRefresh">Last updated: {{ formatDateTime(lastRefresh) }}</span>
            <span v-else>Not yet refreshed</span>
          </p>
        </div>
        <div class="flex gap-3">
          <button
            class="neon-button px-4 py-2 border-cyberpunk-cyan text-cyberpunk-cyan"
            :disabled="isRefreshing || !isAuthenticated"
            @click="refreshDashboard"
          >
            <span v-if="isRefreshing" class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></span>
            {{ isRefreshing ? 'Refreshing...' : 'Refresh' }}
          </button>
          <button
            class="neon-button px-4 py-2 border-cyberpunk-pink text-cyberpunk-pink"
            @click="$emit('back')"
          >
            Back
          </button>
        </div>
      </div>
    </header>

    <!-- Not Authenticated State -->
    <div v-if="!isAuthenticated" class="cyberpunk-panel text-center py-12">
      <h2 class="text-2xl font-bold text-cyberpunk-cyan mb-4">Connect Google Account</h2>
      <p class="text-gray-400 mb-6">Sign in with Google to access your development documents.</p>
      <button
        class="neon-button px-6 py-3 border-cyberpunk-lime text-cyberpunk-lime"
        @click="handleSignIn"
      >
        Connect Google Drive
      </button>
    </div>

    <!-- Authenticated Content -->
    <template v-else>
      <!-- Stats Overview -->
      <DashboardStats :stats="statusCounts" class="mb-6" />

      <!-- Loading State -->
      <div v-if="isRefreshing && projects.length === 0" class="cyberpunk-panel text-center py-12">
        <div class="inline-block w-8 h-8 border-3 border-cyberpunk-cyan border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-gray-400">Fetching your documents...</p>
      </div>

      <!-- No Dev Documents Found -->
      <div v-else-if="!isRefreshing && projects.length === 0" class="cyberpunk-panel text-center py-12">
        <h2 class="text-xl font-bold text-cyberpunk-pink mb-4">No Development Documents Found</h2>
        <p class="text-gray-400 mb-4">
          We couldn't find any development-related documents in your last 25 Google Docs.
        </p>
        <p class="text-gray-500 text-sm mb-6">
          Documents are identified by keywords like: app, project, api, spec, roadmap, etc.
        </p>
        <button
          class="neon-button px-6 py-3 border-cyberpunk-cyan text-cyberpunk-cyan"
          @click="refreshDashboard"
        >
          Try Again
        </button>
      </div>

      <!-- Project Cards Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProjectCard
          v-for="project in projects"
          :key="project.documentId || project.id"
          :project="project"
          :is-generating="generatingIds.has(project.documentId || project.id)"
          @view-details="openDetailView"
          @refresh="refreshProject"
        />
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mt-6 cyberpunk-panel border-red-500/50">
        <p class="text-red-400">{{ error }}</p>
      </div>
    </template>

    <!-- Detail Modal -->
    <ProjectDetailModal
      v-if="selectedProject"
      :project="selectedProject"
      :is-loading-full="isLoadingFullAnalysis"
      @close="selectedProject = null"
      @generate-full="generateFullAnalysis"
      @refresh="refreshProject"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useGoogleAuth } from '@/composables/useGoogleAuth'
import { useDriveDocuments } from '@/composables/useDriveDocuments'
import { useDocumentClassifier } from '@/composables/useDocumentClassifier'
import { useCeoDashboardCache } from '@/composables/useCeoDashboardCache'
import { useGrokAnalysis } from '@/composables/useGrokAnalysis'
import { CEO_PROMPTS } from '@/config/ceoPrompts'
import ProjectCard from '@/components/dashboard/ProjectCard.vue'
import ProjectDetailModal from '@/components/dashboard/ProjectDetailModal.vue'
import DashboardStats from '@/components/dashboard/DashboardStats.vue'

defineEmits(['back'])

// Composables
const { isAuthenticated, accessToken, signIn, initializeGoogleAuth } = useGoogleAuth()
const { fetchRecentDocuments, fetchDocumentContent } = useDriveDocuments()
const { filterDevDocuments } = useDocumentClassifier()
const {
  getCachedSummary,
  isCacheValid,
  setCachedSummary,
  setCachedFullAnalysis,
  updateLastRefresh,
  getLastRefreshTime,
  shouldAutoRefresh,
  getStatusCounts,
} = useCeoDashboardCache()
const { analyze } = useGrokAnalysis()

// State
const projects = ref([])
const isRefreshing = ref(false)
const error = ref(null)
const selectedProject = ref(null)
const isLoadingFullAnalysis = ref(false)
const generatingIds = ref(new Set())
const lastRefresh = ref(getLastRefreshTime())

// Computed
const statusCounts = computed(() => {
  if (projects.value.length === 0) {
    return { total: 0, green: 0, yellow: 0, red: 0 }
  }

  const counts = { total: projects.value.length, green: 0, yellow: 0, red: 0 }
  projects.value.forEach(p => {
    const status = p.status?.toUpperCase() || ''
    if (status.includes('ON TRACK') || status === 'GREEN') counts.green++
    else if (status.includes('ATTENTION') || status === 'YELLOW') counts.yellow++
    else if (status.includes('RISK') || status === 'RED') counts.red++
  })
  return counts
})

// Methods
const handleSignIn = async () => {
  try {
    await initializeGoogleAuth()
    await signIn()
  } catch (err) {
    error.value = 'Failed to sign in with Google'
  }
}

const refreshDashboard = async () => {
  if (isRefreshing.value) return

  isRefreshing.value = true
  error.value = null

  try {
    // Get access token from the composable
    const token = accessToken.value
    if (!token) {
      throw new Error('Not authenticated. Please sign in again.')
    }

    const allDocs = await fetchRecentDocuments(token, 25)

    // Filter to dev documents only
    const devDocs = filterDevDocuments(allDocs)

    // Load cached data or generate summaries
    const projectsWithSummaries = []

    for (const doc of devDocs) {
      const docId = doc.id
      const cached = getCachedSummary(docId)

      if (cached && isCacheValid(docId, doc.modifiedTime)) {
        // Use cached summary
        projectsWithSummaries.push({
          ...cached,
          id: docId,
          name: doc.name,
          modifiedTime: doc.modifiedTime,
        })
      } else {
        // Need to generate summary - add to list and generate async
        projectsWithSummaries.push({
          documentId: docId,
          id: docId,
          documentName: doc.name,
          name: doc.name,
          modifiedTime: doc.modifiedTime,
          summary: null,
          status: 'unknown',
        })
      }
    }

    projects.value = projectsWithSummaries

    // Generate missing summaries with rate limiting (sequential, 1.5s delay)
    const projectsNeedingSummary = projectsWithSummaries.filter(p => !p.summary)
    generateSummariesSequentially(projectsNeedingSummary)

    updateLastRefresh()
    lastRefresh.value = getLastRefreshTime()
  } catch (err) {
    console.error('Dashboard refresh error:', err)
    error.value = err.message || 'Failed to refresh dashboard'
  } finally {
    isRefreshing.value = false
  }
}

// Helper to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Process summaries one at a time with delay to avoid rate limits
const generateSummariesSequentially = async (projectsToProcess) => {
  for (let i = 0; i < projectsToProcess.length; i++) {
    const project = projectsToProcess[i]
    try {
      await generateSummary(project)
    } catch (err) {
      // Continue with next project even if one fails
      console.error(`Summary generation failed for ${project.name}:`, err)
    }
    // Wait 1.5 seconds between requests to avoid rate limiting
    if (i < projectsToProcess.length - 1) {
      await delay(1500)
    }
  }
}

const generateSummary = async (project) => {
  const docId = project.documentId || project.id

  if (generatingIds.value.has(docId)) return
  generatingIds.value.add(docId)

  try {
    const token = accessToken.value
    if (!token) {
      throw new Error('Not authenticated')
    }

    // Fetch document content
    const content = await fetchDocumentContent(token, docId)

    // Generate executive summary using Grok
    const result = await analyze(
      content,
      CEO_PROMPTS.executiveSummary.prompt,
      { max_tokens: CEO_PROMPTS.executiveSummary.max_tokens }
    )

    // Extract status from response
    const status = extractStatus(result.content)

    // Update cache
    setCachedSummary(docId, {
      documentName: project.name || project.documentName,
      modifiedTime: project.modifiedTime,
      summary: result.content,
      status: status,
    })

    // Update local state
    const idx = projects.value.findIndex(p => (p.documentId || p.id) === docId)
    if (idx !== -1) {
      projects.value[idx] = {
        ...projects.value[idx],
        summary: result.content,
        status: status,
      }
    }
  } catch (err) {
    console.error(`Failed to generate summary for ${docId}:`, err)
  } finally {
    generatingIds.value.delete(docId)
  }
}

const extractStatus = (content) => {
  const upperContent = content.toUpperCase()
  if (upperContent.includes('ON TRACK')) return 'ON TRACK'
  if (upperContent.includes('NEEDS ATTENTION') || upperContent.includes('ATTENTION')) return 'NEEDS ATTENTION'
  if (upperContent.includes('AT RISK') || upperContent.includes('RISK')) return 'AT RISK'
  return 'unknown'
}

const refreshProject = async (project) => {
  const docId = project.documentId || project.id

  // Clear cache for this project
  const idx = projects.value.findIndex(p => (p.documentId || p.id) === docId)
  if (idx !== -1) {
    projects.value[idx] = {
      ...projects.value[idx],
      summary: null,
      fullAnalysis: null,
      status: 'unknown',
    }
  }

  // Regenerate
  await generateSummary(project)

  // Update selected project if it's the one being viewed
  if (selectedProject.value && (selectedProject.value.documentId || selectedProject.value.id) === docId) {
    selectedProject.value = projects.value[idx]
  }
}

const openDetailView = (project) => {
  selectedProject.value = { ...project }
}

const generateFullAnalysis = async (project) => {
  const docId = project.documentId || project.id
  isLoadingFullAnalysis.value = true

  try {
    const token = accessToken.value
    if (!token) {
      throw new Error('Not authenticated')
    }

    // Fetch document content
    const content = await fetchDocumentContent(token, docId)

    // Generate detailed analysis
    const result = await analyze(
      content,
      CEO_PROMPTS.detailedAnalysis.prompt,
      { max_tokens: CEO_PROMPTS.detailedAnalysis.max_tokens }
    )

    // Update cache
    setCachedFullAnalysis(docId, result.content)

    // Update local state
    const idx = projects.value.findIndex(p => (p.documentId || p.id) === docId)
    if (idx !== -1) {
      projects.value[idx] = {
        ...projects.value[idx],
        fullAnalysis: result.content,
      }
    }

    // Update selected project
    if (selectedProject.value) {
      selectedProject.value = {
        ...selectedProject.value,
        fullAnalysis: result.content,
      }
    }
  } catch (err) {
    console.error('Failed to generate full analysis:', err)
    error.value = 'Failed to generate detailed analysis'
  } finally {
    isLoadingFullAnalysis.value = false
  }
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Watch for authentication changes
watch(isAuthenticated, (newVal) => {
  if (newVal && shouldAutoRefresh()) {
    refreshDashboard()
  }
})

// Initialize
onMounted(async () => {
  try {
    await initializeGoogleAuth()

    // If already authenticated and should refresh, do it
    if (isAuthenticated.value && shouldAutoRefresh()) {
      await refreshDashboard()
    } else if (isAuthenticated.value) {
      // Load from cache
      const cached = getStatusCounts()
      // Load cached projects
      const allCached = useCeoDashboardCache().getAllCachedProjects()
      if (allCached.length > 0) {
        projects.value = allCached
      }
    }
  } catch (err) {
    console.error('Failed to initialize dashboard:', err)
  }
})
</script>
