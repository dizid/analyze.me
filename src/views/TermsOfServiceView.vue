<template>
  <div class="min-h-screen p-4 md:p-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <header class="mb-8 text-center">
        <GlitchText text="TERMS OF SERVICE" color="pink" class="text-4xl md:text-5xl font-bold mb-4" />
        <p class="text-gray-400 font-mono text-sm">Last Updated: December 9, 2025</p>
      </header>

      <!-- Content Panel -->
      <CyberpunkPanel title="" titleColor="pink">
        <div class="prose prose-invert max-w-none">
          <section class="mb-6">
            <h2 class="text-2xl font-bold text-cyberpunk-lime mb-3">1. Acceptance of Terms</h2>
            <p class="text-gray-300 leading-relaxed">
              By using this app, you agree to these terms.
            </p>
          </section>

          <section class="mb-6">
            <h2 class="text-2xl font-bold text-cyberpunk-lime mb-3">2. Description of Service</h2>
            <ul class="text-gray-300 list-disc list-inside space-y-1 ml-4">
              <li>AI-powered analysis of your Google Docs</li>
              <li>Uses xAI's Grok API for analysis</li>
              <li>Free to use (subject to rate limits)</li>
            </ul>
          </section>

          <section class="mb-6">
            <h2 class="text-2xl font-bold text-cyberpunk-lime mb-3">3. User Responsibilities</h2>
            <ul class="text-gray-300 list-disc list-inside space-y-1 ml-4">
              <li>You must have rights to analyze the documents you select</li>
              <li>Do not use for illegal purposes</li>
              <li>Respect rate limits (10 requests per minute)</li>
            </ul>
          </section>

          <section class="mb-6">
            <h2 class="text-2xl font-bold text-cyberpunk-lime mb-3">4. Service Limitations</h2>
            <ul class="text-gray-300 list-disc list-inside space-y-1 ml-4">
              <li>Provided "as is" without warranties</li>
              <li>No guarantee of availability or accuracy</li>
              <li>Rate limited to prevent abuse</li>
            </ul>
          </section>

          <section class="mb-6">
            <h2 class="text-2xl font-bold text-cyberpunk-lime mb-3">5. Google Integration</h2>
            <ul class="text-gray-300 list-disc list-inside space-y-1 ml-4">
              <li>Requires Google account authentication</li>
              <li>You control access permissions</li>
              <li>Subject to Google's Terms of Service</li>
            </ul>
          </section>

          <section class="mb-6">
            <h2 class="text-2xl font-bold text-cyberpunk-lime mb-3">6. xAI API Usage</h2>
            <ul class="text-gray-300 list-disc list-inside space-y-1 ml-4">
              <li>Analysis powered by xAI Grok</li>
              <li>Subject to xAI's terms and policies</li>
              <li>No guarantee of analysis quality</li>
            </ul>
          </section>

          <section class="mb-6">
            <h2 class="text-2xl font-bold text-cyberpunk-lime mb-3">7. Liability</h2>
            <ul class="text-gray-300 list-disc list-inside space-y-1 ml-4">
              <li>No liability for analysis results</li>
              <li>No liability for service interruptions</li>
              <li>Use at your own risk</li>
            </ul>
          </section>

          <section class="mb-6">
            <h2 class="text-2xl font-bold text-cyberpunk-lime mb-3">8. Changes to Terms</h2>
            <p class="text-gray-300 leading-relaxed">
              We may update these terms. Continued use means acceptance.
            </p>
          </section>

          <section class="mb-6">
            <h2 class="text-2xl font-bold text-cyberpunk-lime mb-3">9. Contact</h2>
            <p class="text-gray-300">
              For questions, please contact us at:
              <a href="mailto:support@example.com" class="text-cyberpunk-cyan hover:text-cyberpunk-pink transition-colors">
                support@example.com
              </a>
            </p>
          </section>
        </div>

        <!-- Back Button -->
        <div class="mt-8 text-center">
          <CyberpunkButton variant="pink" @click="$emit('back')">
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
