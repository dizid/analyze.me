<template>
  <div class="landing-page min-h-screen overflow-x-hidden">

    <!-- HERO -->
    <section class="relative min-h-screen flex flex-col items-center justify-center px-4 py-24 text-center">
      <!-- Radial glow backdrop -->
      <div
        class="absolute inset-0 pointer-events-none"
        style="background: radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,255,238,0.06) 0%, rgba(255,0,255,0.04) 50%, transparent 80%);"
      ></div>

      <!-- Wordmark -->
      <p class="mb-8 text-sm tracking-[0.4em] uppercase text-cyberpunk-pink font-bold opacity-80">
        analyze.me
      </p>

      <!-- Main headline -->
      <h1 class="relative font-bold leading-none mb-6">
        <GlitchText text="DECODE" color="cyan" class="block text-5xl sm:text-7xl md:text-8xl" />
        <GlitchText text="YOUR MIND" color="pink" class="block text-5xl sm:text-7xl md:text-8xl mt-2" />
      </h1>

      <!-- Sub-headline -->
      <p class="max-w-xl mx-auto text-base sm:text-lg text-white/70 mb-10 leading-relaxed tracking-wide">
        Turn your writings, emails, music, and code into powerful self-insights.
        <br class="hidden sm:block" />
        AI-powered personal analytics — built for people who want to understand themselves.
      </p>

      <!-- CTAs -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <CyberpunkButton variant="cyan" size="lg" class="w-full sm:w-auto" @click="router.push('/app')">
          Start Analyzing
        </CyberpunkButton>
        <CyberpunkButton variant="pink" size="lg" class="w-full sm:w-auto" @click="scrollTo('features')">
          Learn More
        </CyberpunkButton>
      </div>

      <!-- Scroll indicator -->
      <div class="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <span class="text-xs tracking-widest uppercase text-cyberpunk-cyan">Scroll</span>
        <div class="w-px h-12 bg-gradient-to-b from-cyberpunk-cyan to-transparent"></div>
      </div>
    </section>

    <!-- FEATURES -->
    <section id="features" class="py-24 px-4 max-w-6xl mx-auto" style="scroll-margin-top: 2rem;">
      <div class="text-center mb-16">
        <p class="text-xs tracking-[0.4em] uppercase text-cyberpunk-pink mb-3">What You Get</p>
        <h2 class="text-3xl sm:text-4xl font-bold text-white">
          <span class="text-cyberpunk-cyan">Everything</span> you need to know yourself
        </h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <CyberpunkPanel title="Multi-Source Analysis" titleColor="cyan">
          <div class="w-10 h-10 mb-4 flex items-center justify-center rounded border border-cyberpunk-cyan/40 bg-cyberpunk-cyan/10">
            <span class="text-cyberpunk-cyan text-xl font-bold">7</span>
          </div>
          <p class="text-white/60 text-sm leading-relaxed">
            Connect Google Docs, Gmail, Spotify, GitHub, Calendar, Twitter, and journal entries.
            One unified view of who you are.
          </p>
        </CyberpunkPanel>

        <CyberpunkPanel title="AI-Powered Insights" titleColor="pink">
          <div class="w-10 h-10 mb-4 flex items-center justify-center rounded border border-cyberpunk-pink/40 bg-cyberpunk-pink/10">
            <svg class="w-5 h-5 text-cyberpunk-pink" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <p class="text-white/60 text-sm leading-relaxed">
            Claude AI analyzes your data with deep, nuanced prompts — not generic summaries.
            Personality, habits, emotional patterns, and more.
          </p>
        </CyberpunkPanel>

        <CyberpunkPanel title="Daily Journal" titleColor="lime">
          <div class="w-10 h-10 mb-4 flex items-center justify-center rounded border border-cyberpunk-lime/40 bg-cyberpunk-lime/10">
            <svg class="w-5 h-5 text-cyberpunk-lime" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            </svg>
          </div>
          <p class="text-white/60 text-sm leading-relaxed">
            Write and reflect daily. Your journal becomes a living dataset — analyzed over time
            to surface patterns only you could have.
          </p>
        </CyberpunkPanel>

        <CyberpunkPanel title="Gamification" titleColor="pink">
          <div class="w-10 h-10 mb-4 flex items-center justify-center rounded border border-cyberpunk-pink/40 bg-cyberpunk-pink/10">
            <svg class="w-5 h-5 text-cyberpunk-pink" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </div>
          <p class="text-white/60 text-sm leading-relaxed">
            Earn XP, level up, unlock achievements, and maintain streaks. Self-knowledge
            becomes a habit when it feels like a game.
          </p>
        </CyberpunkPanel>

        <CyberpunkPanel title="Trend Analysis" titleColor="cyan">
          <div class="w-10 h-10 mb-4 flex items-center justify-center rounded border border-cyberpunk-cyan/40 bg-cyberpunk-cyan/10">
            <svg class="w-5 h-5 text-cyberpunk-cyan" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
          </div>
          <p class="text-white/60 text-sm leading-relaxed">
            Watch yourself evolve. Longitudinal analysis shows how your personality, mood,
            and habits shift — week by week, month by month.
          </p>
        </CyberpunkPanel>

        <CyberpunkPanel title="Privacy First" titleColor="lime">
          <div class="w-10 h-10 mb-4 flex items-center justify-center rounded border border-cyberpunk-lime/40 bg-cyberpunk-lime/10">
            <svg class="w-5 h-5 text-cyberpunk-lime" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <p class="text-white/60 text-sm leading-relaxed">
            Your data is yours. Analysis runs on-demand. Nothing is sold, shared, or stored
            without your explicit consent.
          </p>
        </CyberpunkPanel>
      </div>
    </section>

    <!-- DATA SOURCES -->
    <section class="py-24 px-4" style="background: rgba(45, 27, 61, 0.15);">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-16">
          <p class="text-xs tracking-[0.4em] uppercase text-cyberpunk-lime mb-3">Data Sources</p>
          <h2 class="text-3xl sm:text-4xl font-bold text-white">
            Connect <span class="text-cyberpunk-lime">everything</span>
          </h2>
          <p class="mt-4 text-white/50 max-w-lg mx-auto text-sm leading-relaxed">
            Seven integrations, one complete picture of you.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="source in dataSources"
            :key="source.name"
            class="cyberpunk-panel flex items-start gap-4 transition-all duration-300 hover:-translate-y-0.5 cursor-default"
          >
            <div
              class="flex-shrink-0 w-12 h-12 rounded flex items-center justify-center text-lg font-bold transition-transform duration-300 hover:scale-110"
              :style="`background: ${source.color}15; border: 1px solid ${source.color}40; color: ${source.color};`"
            >
              {{ source.abbr }}
            </div>
            <div>
              <p class="font-bold text-sm text-white mb-1">{{ source.name }}</p>
              <p class="text-white/50 text-xs leading-relaxed">{{ source.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- PRICING -->
    <section id="pricing" class="py-24 px-4 max-w-4xl mx-auto" style="scroll-margin-top: 2rem;">
      <div class="text-center mb-16">
        <p class="text-xs tracking-[0.4em] uppercase text-cyberpunk-pink mb-3">Pricing</p>
        <h2 class="text-3xl sm:text-4xl font-bold text-white">
          Start free. <span class="text-cyberpunk-pink">Go deeper</span> when you're ready.
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Free Tier -->
        <CyberpunkPanel title="Free" titleColor="cyan">
          <div class="mb-6">
            <span class="text-4xl font-bold text-white">$0</span>
            <span class="text-white/40 text-sm ml-2">/ forever</span>
          </div>
          <ul class="space-y-3 mb-8">
            <li v-for="item in freeTierFeatures" :key="item" class="flex items-start gap-3 text-sm text-white/70">
              <span class="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full border border-cyberpunk-cyan/60 flex items-center justify-center">
                <span class="block w-1.5 h-1.5 rounded-full bg-cyberpunk-cyan"></span>
              </span>
              {{ item }}
            </li>
          </ul>
          <CyberpunkButton variant="cyan" size="md" class="w-full" @click="router.push('/app')">
            Get Started Free
          </CyberpunkButton>
        </CyberpunkPanel>

        <!-- Pro Tier -->
        <div class="relative">
          <div
            class="absolute -top-3 left-1/2 -translate-x-1/2 z-10 px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase"
            style="background: rgba(255,0,255,0.15); border: 1px solid #ff00ff80; color: #ff00ff; box-shadow: 0 0 12px #ff00ff40;"
          >
            Most Popular
          </div>
          <CyberpunkPanel title="Pro" titleColor="pink" :holographic="true">
            <div class="mb-6">
              <span class="text-4xl font-bold text-white">$9</span>
              <span class="text-white/40 text-sm ml-2">/ month</span>
            </div>
            <ul class="space-y-3 mb-8">
              <li v-for="item in proTierFeatures" :key="item" class="flex items-start gap-3 text-sm text-white/70">
                <span class="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full border border-cyberpunk-pink/60 flex items-center justify-center">
                  <span class="block w-1.5 h-1.5 rounded-full bg-cyberpunk-pink"></span>
                </span>
                {{ item }}
              </li>
            </ul>
            <CyberpunkButton variant="pink" size="md" class="w-full" @click="router.push('/app')">
              Upgrade to Pro
            </CyberpunkButton>
          </CyberpunkPanel>
        </div>
      </div>
    </section>

    <!-- FINAL CTA -->
    <section class="py-32 px-4 text-center relative overflow-hidden">
      <div
        class="absolute inset-0 pointer-events-none"
        style="background: radial-gradient(ellipse 70% 50% at 50% 50%, rgba(255,0,255,0.06) 0%, transparent 70%);"
      ></div>

      <div class="relative max-w-2xl mx-auto">
        <p class="text-xs tracking-[0.4em] uppercase text-cyberpunk-cyan mb-6">Ready?</p>
        <h2 class="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
          <GlitchText text="KNOW YOURSELF" color="white" class="text-4xl sm:text-5xl" />
        </h2>
        <p class="text-white/50 text-sm sm:text-base leading-relaxed mb-10 max-w-lg mx-auto">
          Free to start. No credit card required. Your first insight is minutes away.
        </p>
        <CyberpunkButton variant="cyan" size="lg" @click="router.push('/app')">
          Get Started Free
        </CyberpunkButton>
      </div>
    </section>

  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import CyberpunkPanel from '@/components/ui/CyberpunkPanel.vue'
import CyberpunkButton from '@/components/ui/CyberpunkButton.vue'
import GlitchText from '@/components/ui/GlitchText.vue'

const router = useRouter()

const scrollTo = (id) => {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

const dataSources = [
  { name: 'Google Docs', abbr: 'GD', description: 'Your documents, notes, and long-form writing reveal how you think and structure ideas.', color: '#00ffee' },
  { name: 'Gmail', abbr: 'GM', description: 'Email patterns expose your communication style, relationships, and priorities at scale.', color: '#ff00ff' },
  { name: 'Spotify', abbr: 'SP', description: 'Music taste and listening habits map directly to emotional states and energy cycles.', color: '#00ff41' },
  { name: 'GitHub', abbr: 'GH', description: 'Commit history, activity patterns, and code topics show how and when you do your best work.', color: '#00ffee' },
  { name: 'Calendar', abbr: 'CA', description: 'How you spend your time — and what you prioritize — says more than you might expect.', color: '#ff00ff' },
  { name: 'Twitter / X', abbr: 'TW', description: 'Public thoughts, reactions, and interests captured in real time over months or years.', color: '#00ff41' },
  { name: 'Journal', abbr: 'JR', description: 'Daily private reflections — the most raw and honest data source of all.', color: '#00ffee' },
]

const freeTierFeatures = [
  '5 AI analyses per month',
  'Manual text input',
  'Core analysis prompts',
  'Basic insights report',
  'No credit card required',
]

const proTierFeatures = [
  'Unlimited AI analyses',
  'All 7 data source connectors',
  'Cloud storage for history',
  'Daily journal with AI reflection',
  'Longitudinal trend analysis',
  'Full gamification — XP, levels, achievements, streaks',
  'Priority analysis processing',
]
</script>
