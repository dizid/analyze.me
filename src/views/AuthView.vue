<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Back to landing -->
      <div class="text-center mb-8">
        <router-link to="/" class="text-cyberpunk-cyan hover:text-cyberpunk-pink transition-colors text-sm">
          &larr; Back to Analyze.me
        </router-link>
      </div>

      <!-- Sign-in card -->
      <div class="relative p-8 rounded-xl border border-cyberpunk-cyan/20 bg-[#0d0d1a] shadow-[0_0_30px_rgba(0,255,238,0.05)]">
        <h2 class="text-2xl font-bold text-cyberpunk-cyan mb-2 tracking-wider text-center font-[Orbitron]">
          SIGN IN
        </h2>
        <p class="text-gray-400 text-sm mb-8 font-mono text-center">
          Access your personal analysis dashboard
        </p>

        <!-- Google Sign-In Button -->
        <button
          @click="handleSignIn"
          :disabled="isLoading"
          class="w-full flex items-center justify-center gap-3 px-6 py-4
                 bg-white/5 border-2 border-cyberpunk-cyan/40 rounded-lg
                 text-cyberpunk-cyan font-bold tracking-wider uppercase
                 hover:bg-cyberpunk-cyan/10 hover:border-cyberpunk-cyan
                 hover:shadow-[0_0_20px_rgba(0,255,238,0.2)]
                 transition-all duration-200
                 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <!-- Google "G" icon -->
          <svg viewBox="0 0 24 24" class="w-5 h-5 shrink-0">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span v-if="!isLoading">Continue with Google</span>
          <span v-else class="animate-pulse">Signing in...</span>
        </button>

        <!-- Error message -->
        <div v-if="error" class="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-sm text-red-400">
          {{ error }}
        </div>

        <!-- Terms -->
        <p class="text-gray-600 text-xs mt-6 font-mono text-center">
          By signing in, you agree to our
          <router-link to="/terms" class="text-cyberpunk-pink hover:underline">Terms</router-link>
          and
          <router-link to="/privacy" class="text-cyberpunk-pink hover:underline">Privacy Policy</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { isSignedIn, signIn } = useAuth()
const isLoading = ref(false)
const error = ref(null)

// If already signed in, redirect to app
watch(isSignedIn, (val) => {
  if (val) router.push('/app')
}, { immediate: true })

const handleSignIn = async () => {
  isLoading.value = true
  error.value = null
  try {
    await signIn()
  } catch (err) {
    error.value = err.message || 'Sign-in failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>
