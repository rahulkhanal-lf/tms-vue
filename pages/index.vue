<template>
  <div class="page">

    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-sub">{{ today }}</p>
      </div>
      <NuxtLink to="/tasks" class="cta-btn">+ New Task</NuxtLink>
    </div>

    <!-- Bento grid -->
    <div class="bento">

      <!-- Hero stat — total -->
      <div class="bento-hero">
        <span class="hero-label">Total Tasks</span>
        <span class="hero-number">{{ tasks.length }}</span>
        <span class="hero-hint">tasks in your workspace</span>
        <div class="hero-bg-circle" aria-hidden="true" />
      </div>

      <!-- Right column -->
      <div class="bento-side">

        <!-- Completed -->
        <div class="mini-card mini-card--green">
          <div class="mini-top">
            <span class="mini-label">Completed</span>
            <span class="mini-icon" aria-hidden="true">✓</span>
          </div>
          <span class="mini-value">{{ completedCount }}</span>
        </div>

        <!-- Pending -->
        <div class="mini-card mini-card--amber">
          <div class="mini-top">
            <span class="mini-label">Pending</span>
            <span class="mini-icon" aria-hidden="true">◷</span>
          </div>
          <span class="mini-value">{{ pendingCount }}</span>
        </div>

      </div>

      <!-- Progress ring card — full width -->
      <div class="bento-progress">
        <div class="ring-wrap">
          <!-- SVG ring -->
          <svg class="ring" viewBox="0 0 100 100" aria-hidden="true">
            <circle class="ring-track" cx="50" cy="50" r="38" />
            <circle
              class="ring-fill"
              cx="50" cy="50" r="38"
              :stroke-dasharray="`${circumference}`"
              :stroke-dashoffset="dashOffset"
            />
          </svg>
          <div class="ring-center">
            <span class="ring-pct">{{ completionPercentage }}%</span>
            <span class="ring-sub">done</span>
          </div>
        </div>
        <div class="progress-info">
          <p class="progress-title">Completion</p>
          <p class="progress-desc">
            You've completed
            <strong>{{ completedCount }}</strong> out of
            <strong>{{ tasks.length }}</strong> tasks.
            <template v-if="completionPercentage === 100"> 🎉 All done!</template>
            <template v-else-if="completionPercentage >= 50"> Keep going!</template>
            <template v-else> Let's get started!</template>
          </p>
          <NuxtLink to="/tasks" class="progress-link">View all tasks →</NuxtLink>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useTaskStore } from '~/stores/useTaskStore'
import { useTaskStats } from '~/composables/useTaskStats'
import { useAuthStore } from '~/stores/useAuthStore'

const authStore = useAuthStore()
const taskStore = useTaskStore()
const { tasks } = storeToRefs(taskStore)
const { completedCount, pendingCount, completionPercentage, completionLabel } = useTaskStats()

onMounted(async () => {
  if (import.meta.client) {
    await authStore.initializeAuth()
    if (!authStore.isAuthenticated) {
      return navigateTo('/auth')
    }
    taskStore.fetchTasks()
  }
})

const circumference = 2 * Math.PI * 38
const dashOffset = computed(() => circumference - (completionPercentage.value / 100) * circumference)

const today = computed(() => new Date().toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric'
}))
</script>

<style scoped>
.page { max-width: 780px; }

/* Header */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.75rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.page-sub {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-top: 0.2rem;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1.2rem;
  background: var(--primary);
  color: #fff;
  border-radius: var(--radius-pill);
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.15s, box-shadow 0.15s;
  white-space: nowrap;
}
.cta-btn:hover { background: var(--primary-dark); box-shadow: var(--shadow-md); }

/* ── Bento grid ─────────────────────────────────────── */
.bento {
  display: grid;
  grid-template-columns: 1fr 180px;
  grid-template-rows: auto auto;
  gap: 0.85rem;
}

/* Hero */
.bento-hero {
  grid-column: 1;
  grid-row: 1;
  background: var(--primary);
  border-radius: var(--radius-lg);
  padding: 2rem 2rem 1.75rem;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 160px;
}

.hero-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,0.65);
  margin-bottom: 0.4rem;
}

.hero-number {
  font-size: 4.5rem;
  font-weight: 900;
  color: #fff;
  line-height: 1;
  letter-spacing: -0.05em;
}

.hero-hint {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.55);
  margin-top: 0.35rem;
}

.hero-bg-circle {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  pointer-events: none;
}

/* Side mini cards */
.bento-side {
  grid-column: 2;
  grid-row: 1;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.mini-card {
  flex: 1;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1rem 1.1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s;
}
.mini-card:hover { box-shadow: var(--shadow-md); }

.mini-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mini-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.mini-icon {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.mini-value {
  font-size: 2.2rem;
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1;
  margin-top: 0.5rem;
}

.mini-card--green .mini-value { color: #16a34a; }
.mini-card--amber .mini-value { color: #d97706; }

/* Progress ring card */
.bento-progress {
  grid-column: 1 / -1;
  grid-row: 2;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  box-shadow: var(--shadow-sm);
}

.ring-wrap {
  position: relative;
  width: 110px;
  height: 110px;
  flex-shrink: 0;
}

.ring {
  width: 110px;
  height: 110px;
  transform: rotate(-90deg);
}

.ring-track {
  fill: none;
  stroke: var(--border);
  stroke-width: 8;
}

.ring-fill {
  fill: none;
  stroke: var(--primary);
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1);
}

.ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.ring-pct {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--primary);
  letter-spacing: -0.03em;
  line-height: 1;
}

.ring-sub {
  font-size: 0.65rem;
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.progress-info { flex: 1; }

.progress-title {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.progress-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 0.85rem;
}

.progress-desc strong { color: var(--text); }

.progress-link {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--primary);
  text-decoration: none;
  transition: opacity 0.15s;
}
.progress-link:hover { opacity: 0.75; }

/* Responsive */
@media (max-width: 600px) {
  .bento { grid-template-columns: 1fr; }
  .bento-side { grid-column: 1; grid-row: 2; flex-direction: row; }
  .bento-progress { grid-row: 3; flex-direction: column; text-align: center; }
}
</style>
