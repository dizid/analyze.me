<template>
  <div id="app">
    <HomeView v-if="currentView === 'home'" />
    <PrivacyPolicyView
      v-else-if="currentView === 'privacy'"
      @back="currentView = 'home'"
    />
    <TermsOfServiceView
      v-else-if="currentView === 'terms'"
      @back="currentView = 'home'"
    />

    <Footer @navigate="handleNavigate" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import HomeView from './views/HomeView.vue'
import PrivacyPolicyView from './views/PrivacyPolicyView.vue'
import TermsOfServiceView from './views/TermsOfServiceView.vue'
import Footer from './components/Footer.vue'

const currentView = ref('home')

const handleNavigate = (view) => {
  currentView.value = view
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
