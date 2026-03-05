<template>
  <div id="app">
    <RouterView />
    <Footer v-if="showFooter" />
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@clerk/vue'
import Footer from './components/Footer.vue'

const route = useRoute()
const router = useRouter()
const showFooter = computed(() => route.meta.showFooter === true)

// Auth guard: redirect to sign-in if route requires auth and user isn't authenticated
if (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
  const { isSignedIn, isLoaded } = useAuth()

  watch([isLoaded, isSignedIn, () => route.fullPath], () => {
    if (isLoaded.value && !isSignedIn.value && route.meta.requiresAuth) {
      router.push('/sign-in')
    }
  })
}
</script>
