<template>
  <div class="min-h-screen p-4 md:p-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <header class="mb-8 text-center">
        <GlitchText text="PRIVACY POLICY" color="cyan" class="text-4xl md:text-5xl font-bold mb-4" />
        <p class="text-gray-400 font-mono text-sm">Last Updated: December 9, 2025</p>
      </header>

      <!-- Content Panel -->
      <CyberpunkPanel title="" titleColor="cyan">
        <div class="prose prose-invert max-w-none">
          <section class="mb-6">
            <h2 class="text-2xl font-bold text-cyberpunk-lime mb-3">1. Data Collection</h2>
            <p class="text-gray-300 leading-relaxed">We collect minimal data to provide our service:</p>
            <ul class="text-gray-300 list-disc list-inside space-y-1 ml-4">
              <li>Google account email (for authentication)</li>
              <li>Google Docs content (processed temporarily, not stored)</li>
              <li>Analysis history (stored locally in your browser)</li>
            </ul>
          </section>

          <section class="mb-6">
            <h2 class="text-2xl font-bold text-cyberpunk-lime mb-3">2. Data Usage</h2>
            <ul class="text-gray-300 list-disc list-inside space-y-1 ml-4">
              <li><strong class="text-cyberpunk-cyan">Google authentication:</strong> To access your Google Docs</li>
              <li><strong class="text-cyberpunk-cyan">Document content:</strong> Sent to xAI Grok API for analysis</li>
              <li><strong class="text-cyberpunk-cyan">Analysis results:</strong> Stored locally in your browser's localStorage</li>
            </ul>
          </section>

          <section class="mb-6">
            <h2 class="text-2xl font-bold text-cyberpunk-lime mb-3">3. Data Storage</h2>
            <ul class="text-gray-300 list-disc list-inside space-y-1 ml-4">
              <li>No server-side storage of your documents or analysis</li>
              <li>History stored in browser localStorage (your device only)</li>
              <li>You can clear history anytime from the app</li>
            </ul>
          </section>

          <section class="mb-6">
            <h2 class="text-2xl font-bold text-cyberpunk-lime mb-3">4. Third-Party Services</h2>
            <ul class="text-gray-300 list-disc list-inside space-y-1 ml-4">
              <li><strong class="text-cyberpunk-cyan">Google APIs:</strong> For authentication and document access</li>
              <li><strong class="text-cyberpunk-cyan">xAI Grok API:</strong> For AI analysis (see xAI's privacy policy)</li>
              <li><strong class="text-cyberpunk-cyan">Netlify:</strong> For hosting (see Netlify's privacy policy)</li>
            </ul>
          </section>

          <section class="mb-6">
            <h2 class="text-2xl font-bold text-cyberpunk-lime mb-3">5. Your Rights</h2>
            <ul class="text-gray-300 list-disc list-inside space-y-1 ml-4">
              <li>You control your data</li>
              <li>Clear history anytime from the app</li>
              <li>Revoke Google access from Google Account settings</li>
            </ul>
          </section>

          <section class="mb-6">
            <h2 class="text-2xl font-bold text-cyberpunk-lime mb-3">6. Contact</h2>
            <p class="text-gray-300">
              For privacy questions, please contact us at:
              <a href="mailto:privacy@example.com" class="text-cyberpunk-cyan hover:text-cyberpunk-pink transition-colors">
                privacy@example.com
              </a>
            </p>
          </section>
        </div>

        <!-- Back Button -->
        <div class="mt-8 text-center">
          <CyberpunkButton variant="cyan" @click="$emit('back')">
            ← Back to App
          </CyberpunkButton>
        </div>
      </CyberpunkPanel>
    </div>
  </div>
</template>

<script setup>
import CyberpunkPanel from '@/components/ui/CyberpunkPanel.vue'
import CyberpunkButton from '@/components/ui/CyberpunkButton.vue'
import GlitchText from '@/components/ui/GlitchText.vue'

defineEmits(['back'])
</script>
