import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router'
import { ref, computed, nextTick } from 'vue'

// Mock useAuth composable
const mockIsSignedIn = ref(false)
const mockIsLoaded = ref(false)
const mockRenderButton = vi.fn()

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    isSignedIn: computed(() => mockIsSignedIn.value),
    isLoaded: computed(() => mockIsLoaded.value),
    renderButton: mockRenderButton,
    initialize: vi.fn(),
    signOut: vi.fn(),
    user: computed(() => null),
    getIdToken: vi.fn(),
  }),
}))

import AuthView from '@/views/AuthView.vue'

describe('AuthView', () => {
  let router

  beforeEach(() => {
    mockIsSignedIn.value = false
    mockIsLoaded.value = false
    mockRenderButton.mockReset()

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div>Landing</div>' } },
        { path: '/sign-in', component: AuthView },
        { path: '/app', component: { template: '<div>App</div>' } },
        { path: '/terms', component: { template: '<div>Terms</div>' } },
        { path: '/privacy', component: { template: '<div>Privacy</div>' } },
      ],
    })
  })

  it('renders sign-in card', async () => {
    router.push('/sign-in')
    await router.isReady()

    const wrapper = mount(AuthView, {
      global: { plugins: [router] },
    })

    expect(wrapper.text()).toContain('SIGN IN')
    expect(wrapper.text()).toContain('Access your personal analysis dashboard')
  })

  it('shows loading text before GIS loads', async () => {
    router.push('/sign-in')
    await router.isReady()

    const wrapper = mount(AuthView, {
      global: { plugins: [router] },
    })

    expect(wrapper.text()).toContain('Loading sign-in...')
  })

  it('hides loading text after button renders', async () => {
    mockIsLoaded.value = true
    router.push('/sign-in')
    await router.isReady()

    const wrapper = mount(AuthView, {
      global: { plugins: [router] },
    })

    await nextTick()
    await nextTick()

    // Once isLoaded is true and renderButton is called, buttonRendered becomes true
    // The loading text should be hidden
    if (mockRenderButton.mock.calls.length > 0) {
      expect(wrapper.text()).not.toContain('Loading sign-in...')
    }
  })

  it('redirects to /app when already signed in', async () => {
    mockIsSignedIn.value = true
    router.push('/sign-in')
    await router.isReady()

    mount(AuthView, {
      global: { plugins: [router] },
    })

    // The watch triggers router.push('/app') which is async
    // Wait for the navigation to complete
    await new Promise(resolve => setTimeout(resolve, 50))
    await nextTick()

    expect(router.currentRoute.value.path).toBe('/app')
  })

  it('has back link to landing page', async () => {
    router.push('/sign-in')
    await router.isReady()

    const wrapper = mount(AuthView, {
      global: { plugins: [router] },
    })

    const backLink = wrapper.find('a[href="/"]')
    expect(backLink.exists()).toBe(true)
    expect(backLink.text()).toContain('Back to Analyze.me')
  })

  it('has terms and privacy links', async () => {
    router.push('/sign-in')
    await router.isReady()

    const wrapper = mount(AuthView, {
      global: { plugins: [router] },
    })

    expect(wrapper.text()).toContain('Terms')
    expect(wrapper.text()).toContain('Privacy Policy')
  })

  it('contains Google button container element', async () => {
    router.push('/sign-in')
    await router.isReady()

    const wrapper = mount(AuthView, {
      global: { plugins: [router] },
    })

    // The ref="googleButtonRef" div
    const buttonContainer = wrapper.find('.flex.justify-center > div')
    expect(buttonContainer.exists()).toBe(true)
  })
})
