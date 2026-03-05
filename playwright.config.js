import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    // Test against production by default; override with BASE_URL env var
    baseURL: process.env.BASE_URL || 'https://readmymind.me',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    // Mobile-first viewport (CEO uses phone primarily)
    viewport: { width: 390, height: 844 },
  },
  projects: [
    {
      name: 'mobile',
      use: { viewport: { width: 390, height: 844 } },
    },
    {
      name: 'desktop',
      use: { viewport: { width: 1280, height: 720 } },
    },
  ],
})
