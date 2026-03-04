import { createApp } from 'vue'
import { clerkPlugin } from '@clerk/vue'
import App from './App.vue'
import router from './router'
import './assets/styles/main.css'

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const app = createApp(App)

app.use(router)

if (CLERK_PUBLISHABLE_KEY) {
  app.use(clerkPlugin, {
    publishableKey: CLERK_PUBLISHABLE_KEY,
    afterSignInUrl: '/app',
    afterSignUpUrl: '/app',
  })
}

// Global error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err, info)
}

app.mount('#app')
