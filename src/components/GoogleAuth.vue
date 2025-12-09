<template>
  <CyberpunkPanel title="Google Docs" title-color="cyan">
    <div v-if="!isAuthenticated" class="space-y-4">
      <p class="text-gray-400">Connect your Google account to access documents</p>
      <CyberpunkButton
        variant="cyan"
        @click="handleSignIn"
        :disabled="isLoading"
        class="w-full"
      >
        <span v-if="!isLoading">Connect Google</span>
        <span v-else>Connecting...</span>
      </CyberpunkButton>
    </div>

    <div v-else class="space-y-4">
      <CyberpunkButton
        variant="cyan"
        @click="handleSelectDocument"
        :disabled="isLoading"
        class="w-full"
      >
        <span v-if="!selectedDocument">📄 Select Document</span>
        <span v-else>📄 Change Document</span>
      </CyberpunkButton>

      <div
        v-if="selectedDocument"
        class="p-4 bg-cyberpunk-purple-900/50 border border-cyberpunk-pink/30 rounded"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-cyberpunk-pink font-semibold">{{ selectedDocument.name }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ formatFileSize(selectedDocument.sizeBytes) }}</p>
          </div>
          <button
            @click="clearDocument"
            class="text-cyberpunk-cyan hover:text-cyberpunk-pink transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      <button
        @click="handleSignOut"
        class="w-full px-4 py-2 text-sm border border-gray-600 text-gray-400 hover:border-cyberpunk-pink hover:text-cyberpunk-pink rounded transition-all"
      >
        Disconnect
      </button>
    </div>

    <div v-if="error" class="mt-4 p-3 bg-red-500/20 border border-red-500 rounded text-sm">
      {{ error }}
    </div>
  </CyberpunkPanel>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGoogleAuth } from '@/composables/useGoogleAuth'
import CyberpunkPanel from '@/components/ui/CyberpunkPanel.vue'
import CyberpunkButton from '@/components/ui/CyberpunkButton.vue'

const emit = defineEmits(['document-selected', 'document-cleared'])

const {
  isAuthenticated,
  error,
  isLoading,
  initializeGoogleAuth,
  signIn,
  signOut,
  openDocumentPicker,
  fetchDocumentContent,
} = useGoogleAuth()

const selectedDocument = ref(null)

onMounted(async () => {
  try {
    await initializeGoogleAuth()
  } catch (err) {
    console.error('Failed to initialize Google Auth:', err)
  }
})

const handleSignIn = async () => {
  try {
    await signIn()
  } catch (err) {
    console.error('Sign in error:', err)
  }
}

const handleSignOut = () => {
  signOut()
  clearDocument()
}

const handleSelectDocument = async () => {
  try {
    const doc = await openDocumentPicker()
    const content = await fetchDocumentContent(doc.id)

    selectedDocument.value = {
      id: doc.id,
      name: doc.name,
      sizeBytes: doc.sizeBytes,
      content,
    }

    emit('document-selected', selectedDocument.value)
  } catch (err) {
    console.error('Error selecting document:', err)
  }
}

const clearDocument = () => {
  selectedDocument.value = null
  emit('document-cleared')
}

const formatFileSize = (bytes) => {
  if (!bytes) return 'Unknown size'
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}
</script>
