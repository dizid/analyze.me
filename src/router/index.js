import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'landing',
    component: () => import('@/views/LandingView.vue'),
    meta: { showFooter: true },
  },
  {
    path: '/sign-in',
    name: 'sign-in',
    component: () => import('@/views/AuthView.vue'),
  },
  {
    path: '/sign-up',
    redirect: '/sign-in',
  },
  {
    path: '/app',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { showFooter: true, requiresAuth: true },
  },
  {
    path: '/journal',
    name: 'journal',
    component: () => import('@/views/JournalView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/achievements',
    name: 'achievements',
    component: () => import('@/views/AchievementsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/digest',
    name: 'digest',
    component: () => import('@/views/DigestView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/projects',
    name: 'ceo-dashboard',
    component: () => import('@/views/CeoDashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: () => import('@/views/PrivacyPolicyView.vue'),
    meta: { showFooter: true },
  },
  {
    path: '/terms',
    name: 'terms',
    component: () => import('@/views/TermsOfServiceView.vue'),
    meta: { showFooter: true },
  },
  // OAuth callback routes
  {
    path: '/callback/github',
    name: 'github-callback',
    component: () => import('@/views/HomeView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/callback/spotify',
    name: 'spotify-callback',
    component: () => import('@/views/HomeView.vue'),
    meta: { requiresAuth: true },
  },
  // Catch-all redirect to landing
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' }
  },
})

// Auto-reload on stale chunks after deploy (Vite hash mismatch)
router.onError((error, to) => {
  if (error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Importing a module script failed')) {
    window.location.href = to.fullPath
  }
})

export default router
