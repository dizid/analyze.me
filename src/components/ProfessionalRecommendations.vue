<template>
  <div v-if="recommendations.length > 0 || showFreeResources" class="space-y-4">
    <h4 class="text-sm font-semibold text-cyberpunk-pink flex items-center gap-2">
      <span>🤝</span>
      Professional Support
    </h4>

    <!-- Recommendations -->
    <div v-if="recommendations.length > 0" class="space-y-3">
      <div
        v-for="rec in recommendations"
        :key="rec.id"
        :class="[
          'p-4 border rounded-lg transition-all hover:shadow-lg',
          rec.urgent
            ? 'bg-red-500/10 border-red-500/50 hover:border-red-500'
            : `bg-cyberpunk-purple-900/30 border-gray-700 hover:border-cyberpunk-${rec.color}`
        ]"
      >
        <div class="flex items-start gap-3">
          <span class="text-2xl flex-shrink-0">{{ rec.icon }}</span>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h5 class="font-semibold text-white">{{ rec.name }}</h5>
              <span
                :class="[
                  'text-xs px-2 py-0.5 rounded',
                  rec.type === 'therapy' ? 'bg-cyan-500/20 text-cyan-300' :
                  rec.type === 'coaching' ? 'bg-lime-500/20 text-lime-300' :
                  rec.type === 'mindfulness' ? 'bg-purple-500/20 text-purple-300' :
                  'bg-gray-500/20 text-gray-300'
                ]"
              >
                {{ formatType(rec.type) }}
              </span>
            </div>

            <p class="text-sm text-gray-400 mt-1">{{ rec.description }}</p>

            <p v-if="rec.reason" class="text-xs text-cyberpunk-cyan mt-2 italic">
              {{ rec.reason }}
            </p>

            <div class="flex items-center justify-between mt-3">
              <span class="text-xs text-gray-500">{{ rec.priceRange }}</span>

              <a
                :href="rec.affiliateUrl"
                target="_blank"
                rel="noopener"
                :class="[
                  'px-4 py-1.5 text-sm font-semibold rounded transition-all',
                  `bg-cyberpunk-${rec.color}/20 text-cyberpunk-${rec.color}`,
                  `hover:bg-cyberpunk-${rec.color}/30 hover:shadow-[var(--shadow-neon-${rec.color})]`
                ]"
                @click="trackClick(rec)"
              >
                Learn More →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Free Resources Section -->
    <div v-if="showFreeResources" class="mt-4">
      <h5 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        Free Resources
      </h5>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <a
          v-for="resource in freeResources"
          :key="resource.name"
          :href="resource.url"
          target="_blank"
          rel="noopener"
          class="p-2 bg-cyberpunk-purple-900/20 border border-gray-700 rounded
                 hover:border-cyberpunk-cyan/50 transition-colors text-center"
        >
          <span class="text-lg">{{ resource.icon }}</span>
          <p class="text-xs font-semibold text-gray-300 mt-1">{{ resource.name }}</p>
          <p class="text-xs text-gray-500">{{ resource.description }}</p>
          <p v-if="resource.action" class="text-xs text-cyberpunk-lime mt-1">
            {{ resource.action }}
          </p>
        </a>
      </div>
    </div>

    <!-- Affiliate Disclosure -->
    <p class="text-xs text-gray-600 italic mt-4">
      {{ disclosure }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  matchRecommendations,
  FREE_RESOURCES,
  AFFILIATE_DISCLOSURE
} from '@/config/affiliates'

const props = defineProps({
  analysisContent: {
    type: String,
    default: ''
  },
  showFreeResources: {
    type: Boolean,
    default: true
  }
})

const recommendations = computed(() => {
  if (!props.analysisContent) return []
  return matchRecommendations(props.analysisContent)
})

const freeResources = FREE_RESOURCES
const disclosure = AFFILIATE_DISCLOSURE

function formatType(type) {
  const labels = {
    therapy: 'Therapy',
    coaching: 'Coaching',
    mindfulness: 'Mindfulness',
    directory: 'Directory'
  }
  return labels[type] || type
}

function trackClick(recommendation) {
  // Analytics tracking for affiliate clicks
  if (window.gtag) {
    window.gtag('event', 'affiliate_click', {
      event_category: 'monetization',
      event_label: recommendation.id,
      partner_name: recommendation.name,
      partner_type: recommendation.type
    })
  }

  console.log('Affiliate click tracked:', recommendation.name)
}
</script>
