<template>
  <div id="app">
    <RouterView />
    <Footer v-if="showFooter" />
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Footer from './components/Footer.vue'

const route = useRoute()
const router = useRouter()
const showFooter = computed(() => route.meta.showFooter === true)

// Auth guard: redirect to sign-in if route requires auth and user isn't authenticated
// Clerk provides useAuth() but it may not be available if Clerk isn't configured
// We check for the Clerk instance on window to see if the user is signed in
const hasClerk = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (hasClerk) {
  // Dynamic import to avoid errors when Clerk isn't configured
  import('@clerk/vue').then(({ useAuth }) => {
    const { isSignedIn, isLoaded } = useAuth()

    watch([isLoaded, isSignedIn, () => route.fullPath], () => {
      if (isLoaded.value && !isSignedIn.value && route.meta.requiresAuth) {
        router.push('/sign-in')
      }
    })
  })
}
</script>
