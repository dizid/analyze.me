<template>
  <div class="min-h-screen p-4 md:p-8">
    <!-- Header -->
    <header class="mb-8">
      <button
        @click="router.push('/app')"
        class="neon-button px-4 py-2 text-sm border-cyberpunk-cyan text-cyberpunk-cyan hover:shadow-[var(--shadow-neon-cyan)] mb-4"
      >
        &larr; Back
      </button>

      <div class="text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-2">
          <span class="text-cyberpunk-cyan">MY</span>
          <span class="text-cyberpunk-pink"> JOURNAL</span>
        </h1>
        <p class="text-gray-400 text-sm font-mono">
          {{ totalEntries }} {{ totalEntries === 1 ? 'entry' : 'entries' }} recorded
          <span v-if="journalStreak > 0"> · {{ journalStreak }}-day streak</span>
        </p>
      </div>
    </header>

    <div class="max-w-3xl mx-auto space-y-6">
      <!-- Stats bar -->
      <div class="grid grid-cols-4 gap-3">
        <div class="stat-pill">
          <span class="stat-value">{{ totalEntries }}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat-pill" :class="journalStreak > 0 ? 'border-cyberpunk-lime/35' : ''">
          <span class="stat-value" :class="journalStreak > 0 ? 'text-cyberpunk-lime' : ''">{{ journalStreak }}</span>
          <span class="stat-label">Streak</span>
        </div>
        <div class="stat-pill">
          <span class="stat-value">{{ recentEntries.length }}</span>
          <span class="stat-label">This Week</span>
        </div>
        <div class="stat-pill">
          <span class="stat-value text-sm">{{ todayEntry ? 'Done' : 'None' }}</span>
          <span class="stat-label">Today</span>
        </div>
      </div>

      <!-- New entry button -->
      <div v-if="!showForm">
        <button class="new-entry-btn" @click="openNewEntry">
          <span class="text-2xl font-light">+</span>
          <span>New Entry</span>
        </button>
      </div>

      <!-- Inline form -->
      <Transition name="form-expand">
        <CyberpunkPanel v-if="showForm" :title="editingEntry ? 'Edit Entry' : 'New Entry'" titleColor="cyan">
          <JournalEntry
            :entry="editingEntry"
            @save="handleSave"
            @cancel="closeForm"
          />
        </CyberpunkPanel>
      </Transition>

      <!-- Mood filter -->
      <div v-if="totalEntries > 0" class="flex items-center gap-3 flex-wrap">
        <span class="text-[10px] font-bold tracking-widest text-white/35 uppercase">Filter</span>
        <div class="flex gap-1.5 flex-wrap">
          <button
            :class="['filter-chip', { active: activeMoodFilter === null }]"
            @click="activeMoodFilter = null"
          >All</button>
          <button
            v-for="mood in MOODS"
            :key="mood.level"
            :class="['filter-chip', { active: activeMoodFilter === mood.level }]"
            @click="activeMoodFilter = activeMoodFilter === mood.level ? null : mood.level"
          >
            <span
              class="w-2.5 h-2.5 rounded-full flex-shrink-0"
              :style="{ background: mood.color, boxShadow: activeMoodFilter === mood.level ? `0 0 8px ${mood.color}` : 'none' }"
            ></span>
            {{ mood.label }}
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="filteredEntries.length === 0 && !showForm" class="flex flex-col items-center gap-3 py-16 text-center">
        <div class="w-16 h-16 border-2 border-cyberpunk-cyan/20 rounded-full flex items-center justify-center mb-2">
          <span class="text-3xl text-cyberpunk-cyan/35 animate-pulse">_</span>
        </div>
        <p class="text-lg font-semibold text-white/70">
          {{ activeMoodFilter ? 'No entries with that mood yet.' : 'Your story starts here.' }}
        </p>
        <p class="text-sm text-white/35 max-w-[280px] leading-relaxed">
          {{ activeMoodFilter ? 'Try a different filter or write a new entry.' : 'Write your first entry — no judgement, just you.' }}
        </p>
        <button v-if="!activeMoodFilter" class="neon-button px-6 py-2.5 text-sm border-cyberpunk-cyan text-cyberpunk-cyan mt-2" @click="openNewEntry">
          Write Something
        </button>
      </div>

      <!-- Entry list -->
      <TransitionGroup name="entry-list" tag="div" class="flex flex-col gap-3">
        <div
          v-for="entry in filteredEntries"
          :key="entry.id"
          class="cyberpunk-panel !p-0 overflow-hidden transition-all duration-200"
          :class="expandedId === entry.id ? 'border-cyberpunk-cyan/40' : ''"
        >
          <!-- Card header -->
          <div
            class="flex items-center justify-between gap-3 p-4 cursor-pointer hover:bg-cyberpunk-cyan/[0.03] transition-colors select-none"
            @click="toggleExpand(entry.id)"
          >
            <div class="flex items-center gap-3.5 min-w-0 flex-1">
              <!-- Mood bar -->
              <div
                class="w-1 h-10 rounded-sm flex-shrink-0"
                :style="{ background: moodColor(entry.mood), boxShadow: `0 0 6px ${moodColor(entry.mood)}` }"
              ></div>
              <div class="flex flex-col gap-1 min-w-0">
                <p class="text-[15px] font-semibold text-white/90 truncate max-w-[380px]">{{ entry.title }}</p>
                <p class="text-xs text-white/40 flex items-center gap-1.5 flex-wrap">
                  <span>{{ formatDate(entry.date) }}</span>
                  <span class="opacity-40">·</span>
                  <span>{{ entry.wordCount }} words</span>
                  <span v-if="entry.analyzed" class="text-[10px] px-1.5 py-0.5 bg-cyberpunk-pink/10 border border-cyberpunk-pink/30 rounded-full text-cyberpunk-pink">analyzed</span>
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2.5 flex-shrink-0">
              <span
                class="text-[11px] font-bold px-2.5 py-0.5 border rounded-full uppercase tracking-wider hidden sm:inline"
                :style="{ color: moodColor(entry.mood), borderColor: moodColor(entry.mood) + '55' }"
              >{{ moodLabel(entry.mood) }}</span>
              <span class="text-xl text-white/30 transition-transform duration-250" :class="expandedId === entry.id ? 'rotate-90' : ''">›</span>
            </div>
          </div>

          <!-- Expanded content -->
          <Transition name="expand">
            <div v-if="expandedId === entry.id" class="px-4 pb-4">
              <div class="h-px bg-white/[0.07] mb-4"></div>
              <div v-if="entry.prompt && entry.prompt !== 'free-write'" class="inline-block text-[11px] font-bold px-2.5 py-0.5 bg-cyberpunk-cyan/[0.07] border border-cyberpunk-cyan/20 rounded-full text-cyberpunk-cyan/70 uppercase tracking-wider mb-3.5">
                {{ promptLabel(entry.prompt) }}
              </div>
              <div class="font-mono text-sm leading-[1.8] text-white/75 whitespace-pre-wrap break-words">{{ entry.content }}</div>
              <div class="flex gap-2.5 mt-5 pt-4 border-t border-white/[0.06]">
                <button class="entry-action-btn text-cyberpunk-cyan border-cyberpunk-cyan/30 hover:bg-cyberpunk-cyan/[0.08] hover:border-cyberpunk-cyan" @click.stop="startEdit(entry)">Edit</button>
                <button class="entry-action-btn text-red-500 border-red-500/30 hover:bg-red-500/[0.08] hover:border-red-500" @click.stop="confirmDelete(entry.id)">Delete</button>
              </div>
            </div>
          </Transition>
        </div>
      </TransitionGroup>
    </div>

    <!-- Delete confirmation -->
    <Transition name="fade">
      <div v-if="pendingDeleteId !== null" class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm" @click.self="pendingDeleteId = null">
        <CyberpunkPanel class="w-full max-w-sm mx-4">
          <p class="text-base text-white/85 text-center mb-5">Delete this entry permanently?</p>
          <div class="flex gap-3 justify-center">
            <button class="entry-action-btn text-white/55 border-white/20 hover:border-white/35" @click="pendingDeleteId = null">Cancel</button>
            <button class="entry-action-btn text-red-500 border-red-500 hover:bg-red-500/[0.12]" @click="executeDelete">Delete</button>
          </div>
        </CyberpunkPanel>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useJournal } from '@/composables/useJournal'
import JournalEntry from '@/components/journal/JournalEntry.vue'
import CyberpunkPanel from '@/components/ui/CyberpunkPanel.vue'

const router = useRouter()

const {
  entries,
  recentEntries,
  todayEntry,
  totalEntries,
  journalStreak,
  addEntry,
  updateEntry,
  deleteEntry,
} = useJournal()

const MOODS = [
  { level: 1, label: 'Terrible', color: '#ef4444' },
  { level: 2, label: 'Bad',      color: '#f97316' },
  { level: 3, label: 'Neutral',  color: '#6b7280' },
  { level: 4, label: 'Good',     color: '#00ffee' },
  { level: 5, label: 'Great',    color: '#00ff41' },
]

const PROMPT_LABELS = {
  'free-write':  'Free Write',
  'how-feeling': 'How are you feeling?',
  'gratitude':   'Gratitude',
  'mind-dump':   "What's on your mind?",
  'evening':     'Evening Reflection',
  'weekly':      'Weekly Review',
}

const showForm = ref(false)
const editingEntry = ref(null)
const expandedId = ref(null)
const activeMoodFilter = ref(null)
const pendingDeleteId = ref(null)

const filteredEntries = computed(() => {
  if (activeMoodFilter.value === null) return entries.value
  return entries.value.filter((e) => e.mood === activeMoodFilter.value)
})

const moodColor = (level) => MOODS.find((m) => m.level === level)?.color ?? '#6b7280'
const moodLabel = (level) => MOODS.find((m) => m.level === level)?.label ?? 'Unknown'
const promptLabel = (id) => PROMPT_LABELS[id] ?? id

const formatDate = (isoString) => {
  const d = new Date(isoString)
  const now = new Date()
  const diffDays = Math.floor((now - d) / 86400000)

  if (diffDays === 0) return 'Today · ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return 'Yesterday · ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

const openNewEntry = () => {
  editingEntry.value = null
  showForm.value = true
  expandedId.value = null
}

const closeForm = () => {
  showForm.value = false
  editingEntry.value = null
}

const startEdit = (entry) => {
  editingEntry.value = { ...entry }
  showForm.value = true
  expandedId.value = null
}

const toggleExpand = (id) => {
  expandedId.value = expandedId.value === id ? null : id
}

const handleSave = (payload) => {
  if (editingEntry.value) {
    updateEntry(editingEntry.value.id, payload)
  } else {
    addEntry(payload)
  }
  closeForm()
}

const confirmDelete = (id) => { pendingDeleteId.value = id }

const executeDelete = () => {
  if (pendingDeleteId.value !== null) {
    deleteEntry(pendingDeleteId.value)
    if (expandedId.value === pendingDeleteId.value) expandedId.value = null
    pendingDeleteId.value = null
  }
}
</script>

<style scoped>
.stat-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 8px;
  background: rgba(45, 27, 61, 0.6);
  border: 1px solid rgba(0, 255, 238, 0.15);
  border-radius: 10px;
  backdrop-filter: blur(10px);
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: white;
  line-height: 1;
}

.stat-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.45);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 4px;
}

.new-entry-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 16px;
  background: rgba(255, 0, 255, 0.06);
  border: 2px dashed rgba(255, 0, 255, 0.3);
  border-radius: 10px;
  color: #ff00ff;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
}

.new-entry-btn:hover {
  background: rgba(255, 0, 255, 0.12);
  border-color: rgba(255, 0, 255, 0.6);
  box-shadow: 0 0 20px rgba(255, 0, 255, 0.15);
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: rgba(45, 27, 61, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-chip:hover { border-color: rgba(255, 255, 255, 0.25); color: rgba(255, 255, 255, 0.75); }
.filter-chip.active { background: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.3); color: white; }

.entry-action-btn {
  padding: 7px 16px;
  background: transparent;
  border: 1px solid;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
}

/* Transitions */
.form-expand-enter-active, .form-expand-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.form-expand-enter-from, .form-expand-leave-to { opacity: 0; transform: translateY(-10px); }

.expand-enter-active, .expand-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.expand-enter-from, .expand-leave-to { opacity: 0; transform: translateY(-6px); }

.entry-list-enter-active, .entry-list-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.entry-list-enter-from, .entry-list-leave-to { opacity: 0; transform: translateY(-8px); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 480px) {
  .stat-value { font-size: 16px; }
}
</style>
