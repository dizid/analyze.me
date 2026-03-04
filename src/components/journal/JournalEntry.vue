<template>
  <div class="journal-entry-form">
    <!-- Prompt selector -->
    <div>
      <span class="section-label">PROMPT</span>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="p in PROMPTS"
          :key="p.id"
          :class="['prompt-chip', { active: selectedPrompt === p.id }]"
          @click="selectedPrompt = p.id"
          type="button"
        >
          {{ p.label }}
        </button>
      </div>
    </div>

    <!-- Active prompt question -->
    <Transition name="slide-down">
      <p v-if="activePromptQuestion" class="prompt-question">
        {{ activePromptQuestion }}
      </p>
    </Transition>

    <!-- Mood selector -->
    <div>
      <span class="section-label">MOOD</span>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="mood in MOODS"
          :key="mood.level"
          :class="['mood-btn', { active: selectedMood === mood.level }]"
          :title="mood.label"
          @click="selectedMood = mood.level"
          type="button"
        >
          <span
            class="w-3 h-3 rounded-full flex-shrink-0 transition-all duration-200"
            :style="{ background: mood.color, boxShadow: selectedMood === mood.level ? `0 0 10px ${mood.color}, 0 0 20px ${mood.color}` : 'none' }"
          ></span>
          <span class="text-xs" :class="selectedMood === mood.level ? 'text-white' : 'text-white/70'">{{ mood.label }}</span>
        </button>
      </div>
    </div>

    <!-- Textarea -->
    <div class="flex flex-col gap-2">
      <textarea
        ref="textareaRef"
        v-model="content"
        class="entry-textarea"
        :placeholder="textareaPlaceholder"
        @input="autoGrow"
        @keydown.ctrl.enter.prevent="handleSaveAndAnalyze"
        @keydown.meta.enter.prevent="handleSaveAndAnalyze"
      ></textarea>
      <div class="flex justify-between items-center px-1">
        <span class="text-xs font-mono" :class="content.length > 8000 ? 'text-orange-400' : 'text-white/35'">
          {{ wordCount }} words · {{ content.length }} chars
        </span>
        <span class="text-xs text-white/20">Ctrl+Enter to save</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-between items-center flex-wrap gap-3">
      <button class="action-btn cancel-btn" @click="$emit('cancel')" type="button">
        Cancel
      </button>
      <div class="flex gap-3">
        <button class="action-btn save-btn" :disabled="!isValid" @click="handleSaveOnly" type="button">
          Save Only
        </button>
        <button class="action-btn analyze-btn" :disabled="!isValid" @click="handleSaveAndAnalyze" type="button">
          Save &amp; Analyze
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'

const MOODS = [
  { level: 1, label: 'Terrible', color: '#ef4444' },
  { level: 2, label: 'Bad',      color: '#f97316' },
  { level: 3, label: 'Neutral',  color: '#6b7280' },
  { level: 4, label: 'Good',     color: '#00ffee' },
  { level: 5, label: 'Great',    color: '#00ff41' },
]

const PROMPTS = [
  { id: 'free-write',  label: 'Free Write',           question: null },
  { id: 'how-feeling', label: 'How are you feeling?',  question: 'How are you feeling today? What emotions are present right now?' },
  { id: 'gratitude',   label: 'Gratitude',             question: 'What are you grateful for today? What went right, however small?' },
  { id: 'mind-dump',   label: "What's on your mind?",  question: "What's on your mind right now? Let it out without filter." },
  { id: 'evening',     label: 'Evening Reflection',    question: 'How did today go? What would you do differently? What are you proud of?' },
  { id: 'weekly',      label: 'Weekly Review',         question: 'Looking back at this week: what did you accomplish, learn, and struggle with?' },
]

const props = defineProps({
  entry: { type: Object, default: null },
})

const emit = defineEmits(['save', 'cancel'])

const textareaRef = ref(null)
const selectedMood = ref(props.entry?.mood ?? 3)
const selectedPrompt = ref(props.entry?.prompt ?? 'free-write')
const content = ref(props.entry?.content ?? '')

const wordCount = computed(() => {
  const trimmed = content.value.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).filter((w) => w.length > 0).length
})

const isValid = computed(() => content.value.trim().length >= 1)

const activePromptQuestion = computed(
  () => PROMPTS.find((p) => p.id === selectedPrompt.value)?.question ?? null
)

const textareaPlaceholder = computed(() => {
  if (selectedPrompt.value === 'free-write') return 'Start writing — this space is just for you...'
  return activePromptQuestion.value ?? 'Start writing...'
})

const autoGrow = () => {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

const buildPayload = (analyze) => ({
  mood: selectedMood.value,
  prompt: selectedPrompt.value,
  content: content.value,
  analyzed: analyze,
})

const handleSaveOnly = () => {
  if (!isValid.value) return
  emit('save', buildPayload(false))
}

const handleSaveAndAnalyze = () => {
  if (!isValid.value) return
  emit('save', buildPayload(true))
}

onMounted(async () => {
  await nextTick()
  textareaRef.value?.focus()
  autoGrow()
})
</script>

<style scoped>
.journal-entry-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(0, 255, 238, 0.6);
  text-transform: uppercase;
  display: block;
  margin-bottom: 10px;
}

.prompt-chip {
  padding: 6px 14px;
  background: rgba(45, 27, 61, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.55);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.prompt-chip:hover {
  border-color: rgba(0, 255, 238, 0.35);
  color: rgba(255, 255, 255, 0.85);
}

.prompt-chip.active {
  background: rgba(0, 255, 238, 0.1);
  border-color: #00ffee;
  color: #00ffee;
}

.prompt-question {
  padding: 12px 16px;
  background: rgba(0, 255, 238, 0.04);
  border-left: 3px solid rgba(0, 255, 238, 0.5);
  border-radius: 0 8px 8px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.75);
  font-style: italic;
  line-height: 1.6;
  margin: 0;
}

.mood-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: rgba(45, 27, 61, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.mood-btn:hover {
  border-color: rgba(255, 255, 255, 0.25);
}

.mood-btn.active {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(45, 27, 61, 0.9);
}

.entry-textarea {
  width: 100%;
  min-height: 160px;
  background: rgba(10, 10, 15, 0.7);
  border: 1px solid rgba(0, 255, 238, 0.2);
  border-radius: 8px;
  padding: 16px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 15px;
  font-family: 'Courier New', monospace;
  line-height: 1.75;
  resize: none;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.entry-textarea::placeholder { color: rgba(255, 255, 255, 0.25); }

.entry-textarea:focus {
  outline: none;
  border-color: rgba(0, 255, 238, 0.5);
  box-shadow: 0 0 0 3px rgba(0, 255, 238, 0.06);
}

.action-btn {
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.action-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.cancel-btn {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.5);
}

.cancel-btn:hover { border-color: rgba(255, 255, 255, 0.3); color: rgba(255, 255, 255, 0.75); }

.save-btn {
  background: transparent;
  border-color: rgba(0, 255, 238, 0.35);
  color: #00ffee;
}

.save-btn:not(:disabled):hover {
  background: rgba(0, 255, 238, 0.08);
  border-color: #00ffee;
  box-shadow: 0 0 10px rgba(0, 255, 238, 0.2);
}

.analyze-btn {
  background: rgba(255, 0, 255, 0.12);
  border-color: #ff00ff;
  color: #ff00ff;
}

.analyze-btn:not(:disabled):hover {
  background: rgba(255, 0, 255, 0.22);
  box-shadow: 0 0 15px rgba(255, 0, 255, 0.3);
}

.slide-down-enter-active,
.slide-down-leave-active { transition: all 0.25s ease; }
.slide-down-enter-from,
.slide-down-leave-to { opacity: 0; transform: translateY(-8px); }

@media (max-width: 480px) {
  .action-btn { text-align: center; width: 100%; }
}
</style>
