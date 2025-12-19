<template>
  <Teleport to="body">
    <TransitionGroup name="notification" tag="div" class="xp-notifications-container">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="xp-notification"
        :class="{ 'level-up': notification.isLevelUp }"
      >
        <div class="notification-icon">
          {{ notification.isLevelUp ? '🎉' : '⚡' }}
        </div>
        <div class="notification-content">
          <span v-if="notification.isLevelUp" class="level-up-text">
            LEVEL UP! Level {{ notification.newLevel }}
          </span>
          <span v-else class="xp-text">
            +{{ notification.amount }} XP
          </span>
          <span class="reason-text">{{ notification.reason }}</span>
        </div>
        <div class="notification-glow"></div>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const notifications = ref([])
let notificationId = 0

const addNotification = (data) => {
  const id = ++notificationId

  notifications.value.push({
    id,
    ...data,
  })

  // Auto-remove after delay
  setTimeout(() => {
    removeNotification(id)
  }, data.isLevelUp ? 4000 : 2500)
}

const removeNotification = (id) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index !== -1) {
    notifications.value.splice(index, 1)
  }
}

// Event listener for XP gains
const handleXPGain = (event) => {
  addNotification(event.detail)
}

onMounted(() => {
  window.addEventListener('xp-gain', handleXPGain)
})

onUnmounted(() => {
  window.removeEventListener('xp-gain', handleXPGain)
})

// Expose method for direct calls
defineExpose({
  addNotification,
})
</script>

<style scoped>
.xp-notifications-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9998;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.xp-notification {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(45, 27, 61, 0.95);
  border: 1px solid rgba(0, 255, 65, 0.5);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  overflow: hidden;
  pointer-events: auto;
}

.xp-notification.level-up {
  border-color: #facc15;
  box-shadow: 0 0 20px rgba(250, 204, 21, 0.3);
}

.notification-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.notification-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.xp-text {
  font-family: 'Orbitron', sans-serif;
  font-size: 16px;
  font-weight: bold;
  color: #00ff41;
  text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

.level-up-text {
  font-family: 'Orbitron', sans-serif;
  font-size: 16px;
  font-weight: bold;
  color: #facc15;
  text-shadow: 0 0 10px rgba(250, 204, 21, 0.5);
  animation: pulse-text 0.5s ease-in-out infinite alternate;
}

@keyframes pulse-text {
  from { opacity: 1; }
  to { opacity: 0.8; }
}

.reason-text {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.notification-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 65, 0.1), transparent);
  animation: glow-sweep 1s ease-out;
}

.level-up .notification-glow {
  background: linear-gradient(90deg, transparent, rgba(250, 204, 21, 0.2), transparent);
}

@keyframes glow-sweep {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Transitions */
.notification-enter-active {
  animation: slide-in 0.3s ease-out;
}

.notification-leave-active {
  animation: slide-out 0.3s ease-in;
}

.notification-move {
  transition: transform 0.3s ease;
}

@keyframes slide-in {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-out {
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}
</style>
