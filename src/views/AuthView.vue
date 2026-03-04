<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Back to landing -->
      <div class="text-center mb-8">
        <router-link to="/" class="text-cyberpunk-cyan hover:text-cyberpunk-pink transition-colors text-sm">
          &larr; Back to Analyze.me
        </router-link>
      </div>

      <!-- Clerk Sign In/Up component -->
      <div class="flex justify-center">
        <SignIn
          v-if="isSignIn"
          :routing="'virtual'"
          :sign-up-url="'/sign-up'"
          :appearance="clerkAppearance"
        />
        <SignUp
          v-else
          :routing="'virtual'"
          :sign-in-url="'/sign-in'"
          :appearance="clerkAppearance"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { SignIn, SignUp } from '@clerk/vue'

const route = useRoute()
const isSignIn = computed(() => route.name === 'sign-in')

// Custom Clerk appearance to match cyberpunk theme
const clerkAppearance = {
  variables: {
    colorPrimary: '#00ffee',
    colorBackground: '#0d0d1a',
    colorText: '#e0e0e0',
    colorTextSecondary: '#888888',
    colorInputBackground: '#141428',
    colorInputText: '#e0e0e0',
    borderRadius: '8px',
    fontFamily: '"Orbitron", monospace, sans-serif',
  },
  elements: {
    card: {
      backgroundColor: '#0d0d1a',
      border: '1px solid rgba(0, 255, 238, 0.2)',
      boxShadow: '0 0 30px rgba(0, 255, 238, 0.05)',
    },
    headerTitle: {
      color: '#00ffee',
    },
    headerSubtitle: {
      color: '#888888',
    },
    formButtonPrimary: {
      backgroundColor: 'rgba(0, 255, 238, 0.15)',
      border: '2px solid #00ffee',
      color: '#00ffee',
      fontWeight: '700',
    },
    formButtonPrimary__hover: {
      backgroundColor: 'rgba(0, 255, 238, 0.25)',
    },
    footerActionLink: {
      color: '#ff00ff',
    },
    socialButtonsBlockButton: {
      border: '1px solid rgba(255, 255, 255, 0.15)',
      backgroundColor: 'rgba(45, 27, 61, 0.6)',
    },
  },
}
</script>
