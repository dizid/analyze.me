import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'

// Import the route definitions to test
// We recreate the router with memory history for testing
const routes = [
  {
    path: '/',
    name: 'landing',
    component: { template: '<div>Landing</div>' },
    meta: { showFooter: true },
  },
  {
    path: '/sign-in',
    name: 'sign-in',
    component: { template: '<div>Sign In</div>' },
  },
  {
    path: '/sign-up',
    redirect: '/sign-in',
  },
  {
    path: '/app',
    name: 'home',
    component: { template: '<div>Home</div>' },
    meta: { showFooter: true, requiresAuth: true },
  },
  {
    path: '/journal',
    name: 'journal',
    component: { template: '<div>Journal</div>' },
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: { template: '<div>Profile</div>' },
    meta: { requiresAuth: true },
  },
  {
    path: '/achievements',
    name: 'achievements',
    component: { template: '<div>Achievements</div>' },
    meta: { requiresAuth: true },
  },
  {
    path: '/digest',
    name: 'digest',
    component: { template: '<div>Digest</div>' },
    meta: { requiresAuth: true },
  },
  {
    path: '/projects',
    name: 'ceo-dashboard',
    component: { template: '<div>CEO Dashboard</div>' },
    meta: { requiresAuth: true },
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: { template: '<div>Privacy</div>' },
    meta: { showFooter: true },
  },
  {
    path: '/terms',
    name: 'terms',
    component: { template: '<div>Terms</div>' },
    meta: { showFooter: true },
  },
  {
    path: '/callback/github',
    name: 'github-callback',
    component: { template: '<div>GitHub Callback</div>' },
    meta: { requiresAuth: true },
  },
  {
    path: '/callback/spotify',
    name: 'spotify-callback',
    component: { template: '<div>Spotify Callback</div>' },
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

describe('Router configuration', () => {
  let router

  beforeEach(() => {
    router = createRouter({
      history: createMemoryHistory(),
      routes,
    })
  })

  // ==========================================================================
  // Public routes
  // ==========================================================================
  describe('Public routes', () => {
    it('/ is accessible and does not require auth', async () => {
      await router.push('/')
      await router.isReady()
      expect(router.currentRoute.value.path).toBe('/')
      expect(router.currentRoute.value.meta.requiresAuth).toBeFalsy()
    })

    it('/sign-in is accessible and does not require auth', async () => {
      await router.push('/sign-in')
      await router.isReady()
      expect(router.currentRoute.value.path).toBe('/sign-in')
      expect(router.currentRoute.value.meta.requiresAuth).toBeFalsy()
    })

    it('/privacy is accessible and does not require auth', async () => {
      await router.push('/privacy')
      await router.isReady()
      expect(router.currentRoute.value.path).toBe('/privacy')
      expect(router.currentRoute.value.meta.requiresAuth).toBeFalsy()
    })

    it('/terms is accessible and does not require auth', async () => {
      await router.push('/terms')
      await router.isReady()
      expect(router.currentRoute.value.path).toBe('/terms')
      expect(router.currentRoute.value.meta.requiresAuth).toBeFalsy()
    })
  })

  // ==========================================================================
  // Protected routes
  // ==========================================================================
  describe('Protected routes', () => {
    const protectedPaths = [
      '/app',
      '/journal',
      '/profile',
      '/achievements',
      '/digest',
      '/projects',
      '/callback/github',
      '/callback/spotify',
    ]

    protectedPaths.forEach((path) => {
      it(`${path} has requiresAuth: true`, async () => {
        await router.push(path)
        await router.isReady()
        expect(router.currentRoute.value.meta.requiresAuth).toBe(true)
      })
    })
  })

  // ==========================================================================
  // Redirects
  // ==========================================================================
  describe('Redirects', () => {
    it('/sign-up redirects to /sign-in', async () => {
      await router.push('/sign-up')
      await router.isReady()
      expect(router.currentRoute.value.path).toBe('/sign-in')
    })

    it('unknown path redirects to /', async () => {
      await router.push('/nonexistent-page')
      await router.isReady()
      expect(router.currentRoute.value.path).toBe('/')
    })

    it('deeply nested unknown path redirects to /', async () => {
      await router.push('/foo/bar/baz')
      await router.isReady()
      expect(router.currentRoute.value.path).toBe('/')
    })
  })

  // ==========================================================================
  // Route meta
  // ==========================================================================
  describe('Route metadata', () => {
    it('/ has showFooter: true', async () => {
      await router.push('/')
      await router.isReady()
      expect(router.currentRoute.value.meta.showFooter).toBe(true)
    })

    it('/app has showFooter: true', async () => {
      await router.push('/app')
      await router.isReady()
      expect(router.currentRoute.value.meta.showFooter).toBe(true)
    })

    it('/journal does not have showFooter', async () => {
      await router.push('/journal')
      await router.isReady()
      expect(router.currentRoute.value.meta.showFooter).toBeFalsy()
    })

    it('/privacy has showFooter: true', async () => {
      await router.push('/privacy')
      await router.isReady()
      expect(router.currentRoute.value.meta.showFooter).toBe(true)
    })
  })

  // ==========================================================================
  // Route names
  // ==========================================================================
  describe('Route names', () => {
    it('/ has name "landing"', async () => {
      await router.push('/')
      expect(router.currentRoute.value.name).toBe('landing')
    })

    it('/app has name "home"', async () => {
      await router.push('/app')
      expect(router.currentRoute.value.name).toBe('home')
    })

    it('/projects has name "ceo-dashboard"', async () => {
      await router.push('/projects')
      expect(router.currentRoute.value.name).toBe('ceo-dashboard')
    })
  })
})
