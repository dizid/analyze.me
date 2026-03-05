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

        <!-- Google renders its own button here — most reliable method -->
        <div class="flex justify-center">
          <div ref="googleButtonRef" class="w-full"></div>
        </div>

        <!-- Loading state before Google button renders -->
        <div v-if="!buttonRendered" class="text-center text-gray-500 text-sm font-mono py-4">
          Loading sign-in...
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
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { isSignedIn, isLoaded, renderButton } = useAuth()
const googleButtonRef = ref(null)
const buttonRendered = ref(false)

// If already signed in, redirect to app
watch(isSignedIn, (val) => {
  if (val) router.push('/app')
}, { immediate: true })

// Render Google button once GIS is loaded and DOM element is ready
watch(isLoaded, (loaded) => {
  if (loaded && googleButtonRef.value) {
    renderButton(googleButtonRef.value)
    buttonRendered.value = true
  }
})

onMounted(() => {
  // If GIS already loaded (e.g., navigated back), render immediately
  if (isLoaded.value && googleButtonRef.value) {
    renderButton(googleButtonRef.value)
    buttonRendered.value = true
  }
})
</script>
