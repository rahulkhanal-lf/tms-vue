<template>
  <Teleport to="body">
    <div class="toast-container" aria-live="polite" aria-label="Notifications">
      <TransitionGroup name="toast">
        <div
          v-for="n in notifications"
          :key="n.id"
          class="toast"
          :class="`toast--${n.type}`"
          role="alert"
        >
          <span class="toast-icon" aria-hidden="true">{{ icons[n.type] }}</span>
          <span class="toast-msg">{{ n.message }}</span>
          <button
            v-if="n.dismissible"
            class="toast-close"
            @click="dismiss(n.id)"
            aria-label="Dismiss notification"
          >✕</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useNotificationStore } from '~/stores/useNotificationStore'

const notifStore = useNotificationStore()
const { notifications } = storeToRefs(notifStore)
const { dismiss } = notifStore

const icons = {
  success: '✅',
  error:   '❌',
  warning: '⚠️',
  info:    'ℹ️'
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 1.25rem;
  right: 1.25rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  max-width: 360px;
  width: 100%;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text);
  pointer-events: all;
}

.toast--success { border-left: 3px solid var(--success); }
.toast--error   { border-left: 3px solid var(--danger); }
.toast--warning { border-left: 3px solid var(--warning); }
.toast--info    { border-left: 3px solid var(--primary); }

.toast-icon { font-size: 1rem; flex-shrink: 0; }

.toast-msg { flex: 1; line-height: 1.4; }

.toast-close {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.1rem 0.25rem;
  border-radius: var(--radius-sm);
  transition: background 0.15s;
  flex-shrink: 0;
}
.toast-close:hover { background: var(--hover); }

/* Transitions */
.toast-enter-active { transition: all 0.25s ease; }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from   { opacity: 0; transform: translateX(20px); }
.toast-leave-to     { opacity: 0; transform: translateX(20px); }
</style>
