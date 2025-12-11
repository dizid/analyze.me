<template>
  <div v-if="actionItems.length > 0" class="space-y-3">
    <h4 class="text-sm font-semibold text-cyberpunk-lime flex items-center gap-2">
      <span>✅</span>
      Recommended Actions
    </h4>

    <div class="space-y-2">
      <div
        v-for="(item, index) in actionItems"
        :key="index"
        class="flex items-start gap-3 p-3 bg-cyberpunk-purple-900/30 border border-gray-700
               rounded hover:border-cyberpunk-lime/50 transition-colors group"
      >
        <button
          @click="toggleItem(index)"
          :class="[
            'flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
            completedItems.has(index)
              ? 'bg-cyberpunk-lime border-cyberpunk-lime text-black'
              : 'border-gray-500 group-hover:border-cyberpunk-lime'
          ]"
        >
          <span v-if="completedItems.has(index)" class="text-xs">✓</span>
        </button>

        <div class="flex-1 min-w-0">
          <p
            :class="[
              'text-sm',
              completedItems.has(index) ? 'text-gray-500 line-through' : 'text-gray-200'
            ]"
          >
            {{ item.text }}
          </p>
          <p v-if="item.category" class="text-xs text-gray-500 mt-1">
            {{ item.category }}
          </p>
        </div>

        <span class="text-lg flex-shrink-0">{{ item.icon }}</span>
      </div>
    </div>

    <p class="text-xs text-gray-500 italic">
      Based on patterns identified in your analysis
    </p>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  analysisContent: {
    type: String,
    default: ''
  }
})

const completedItems = ref(new Set())

// Extract action items from analysis content
const actionItems = computed(() => {
  if (!props.analysisContent) return []

  const items = []
  const text = props.analysisContent.toLowerCase()

  // Pattern-based action extraction
  const patterns = [
    // Direct recommendations from AI
    { regex: /(?:recommend|suggest|try|consider|would benefit from|might help)[:\s]+([^.!?\n]{10,100})/gi, category: 'Recommendation', icon: '💡' },
    // Action verbs
    { regex: /(?:start|begin|practice|schedule|set up|create|establish)[:\s]+([^.!?\n]{10,80})/gi, category: 'Action', icon: '🎯' },
    // Should/could statements
    { regex: /(?:you should|you could|it would help to)[:\s]+([^.!?\n]{10,80})/gi, category: 'Suggestion', icon: '📝' },
  ]

  patterns.forEach(({ regex, category, icon }) => {
    let match
    while ((match = regex.exec(props.analysisContent)) !== null) {
      const actionText = match[1].trim()
      // Clean up and validate
      if (actionText.length > 10 && !items.some(i => i.text.toLowerCase() === actionText.toLowerCase())) {
        items.push({
          text: capitalizeFirst(actionText),
          category,
          icon
        })
      }
    }
  })

  // Add common helpful actions based on content themes
  const themeActions = getThemeBasedActions(text)
  items.push(...themeActions.filter(ta =>
    !items.some(i => i.text.toLowerCase().includes(ta.text.toLowerCase().slice(0, 20)))
  ))

  return items.slice(0, 6) // Limit to 6 items
})

// Generate actions based on detected themes
function getThemeBasedActions(text) {
  const actions = []

  if (text.includes('stress') || text.includes('overwhelm') || text.includes('anxious')) {
    actions.push({
      text: 'Try a 5-minute breathing exercise daily',
      category: 'Mindfulness',
      icon: '🧘'
    })
  }

  if (text.includes('goal') || text.includes('achieve') || text.includes('want to')) {
    actions.push({
      text: 'Write down 3 specific, measurable goals for this month',
      category: 'Goal Setting',
      icon: '🎯'
    })
  }

  if (text.includes('journal') || text.includes('writing') || text.includes('reflect')) {
    actions.push({
      text: 'Schedule 10 minutes daily for reflective journaling',
      category: 'Self-Reflection',
      icon: '📔'
    })
  }

  if (text.includes('sleep') || text.includes('tired') || text.includes('exhausted')) {
    actions.push({
      text: 'Establish a consistent bedtime routine',
      category: 'Wellness',
      icon: '😴'
    })
  }

  if (text.includes('relationship') || text.includes('communication') || text.includes('conflict')) {
    actions.push({
      text: 'Practice active listening in your next conversation',
      category: 'Relationships',
      icon: '💬'
    })
  }

  if (text.includes('negative') || text.includes('self-critical') || text.includes('harsh on yourself')) {
    actions.push({
      text: 'Write 3 things you appreciate about yourself today',
      category: 'Self-Compassion',
      icon: '💜'
    })
  }

  return actions
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function toggleItem(index) {
  if (completedItems.value.has(index)) {
    completedItems.value.delete(index)
  } else {
    completedItems.value.add(index)
  }
  completedItems.value = new Set(completedItems.value) // Trigger reactivity
}

// Reset completed items when analysis changes
watch(() => props.analysisContent, () => {
  completedItems.value = new Set()
})
</script>
