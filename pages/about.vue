<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">About</h1>
      <p class="page-subtitle">Learn about this app and the technology behind it.</p>
    </div>

    <div class="section-grid">
      <div class="card">
        <div class="card-header">
          <span class="card-icon" aria-hidden="true">💡</span>
          <h2>What is Task Dashboard?</h2>
        </div>
        <p class="card-text">
          A lightweight personal task manager built to demonstrate core Nuxt 3 concepts —
          file-based routing, layouts, composables, reactive state, and localStorage persistence —
          all within a clean, accessible UI.
        </p>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-icon" aria-hidden="true">🛠</span>
          <h2>Tech Stack</h2>
        </div>
        <ul class="stack-list">
          <li v-for="item in stack" :key="item.name" class="stack-item">
            <span class="stack-icon" aria-hidden="true">{{ item.icon }}</span>
            <div>
              <strong>{{ item.name }}</strong>
              <span class="stack-desc">{{ item.desc }}</span>
            </div>
          </li>
        </ul>
      </div>

      <div class="card card--full">
        <div class="card-header">
          <span class="card-icon" aria-hidden="true">✨</span>
          <h2>Features</h2>
        </div>
        <ul class="feature-grid">
          <li v-for="f in features" :key="f" class="feature-item">
            <span class="feature-dot" aria-hidden="true">◆</span>
            {{ f }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '~/stores/useAuthStore'

const authStore = useAuthStore()

onMounted(async () => {
  if (import.meta.client) {
    await authStore.initializeAuth()
    if (!authStore.isAuthenticated) {
      return navigateTo('/auth')
    }
  }
})

const stack = [
  { icon: '💚', name: 'Vue 3',           desc: 'Composition API with <script setup>' },
  { icon: '🔷', name: 'Nuxt 3',          desc: 'File-based routing, layouts, auto-imports' },
  { icon: '🔵', name: 'TypeScript',      desc: 'Type-safe composables and components' },
  { icon: '🎨', name: '@nuxtjs/color-mode', desc: 'Dark / light mode with cookie persistence' }
]

const features = [
  'Add, edit, and delete tasks',
  'Priority levels: High, Medium, Low',
  'Filter by status and priority',
  'Reactive dashboard with live stats',
  'localStorage persistence across reloads',
  'Dark mode toggle',
  'Animated task list transitions',
  'Responsive for mobile and desktop'
]
</script>

<style scoped>
.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.03em;
}

.page-subtitle {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-top: 0.3rem;
}

.section-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s;
}

.card:hover {
  box-shadow: var(--shadow-md);
}

.card--full {
  grid-column: 1 / -1;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1rem;
}

.card-icon {
  font-size: 1.2rem;
}

.card-header h2 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
}

.card-text {
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.7;
}

/* Stack list */
.stack-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.stack-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.stack-icon {
  font-size: 1.3rem;
  line-height: 1.2;
  flex-shrink: 0;
}

.stack-item strong {
  display: block;
  font-size: 0.9rem;
  color: var(--text);
  font-weight: 600;
}

.stack-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* Feature grid */
.feature-grid {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.6rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.88rem;
  color: var(--text-secondary);
}

.feature-dot {
  color: var(--primary);
  font-size: 0.5rem;
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .section-grid {
    grid-template-columns: 1fr;
  }
  .card--full {
    grid-column: 1;
  }
}
</style>
