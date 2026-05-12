<template>
  <div>
    <!-- Page header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Track your tasks and stay on top of your work.</p>
      </div>
      <NuxtLink to="/tasks" class="btn btn-primary">Manage Tasks →</NuxtLink>
    </div>

    <!-- Stats -->
    <div class="cards-grid">
      <SummaryCard icon="📝" :value="tasks.length" label="Total Tasks" />
      <SummaryCard icon="✅" :value="completedCount" label="Completed" />
      <SummaryCard icon="⏳" :value="pendingCount" label="Pending" />
    </div>

    <!-- Progress -->
    <ProgressBar :percentage="percentage" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTasks } from '~/composables/useTasks'

const { tasks, completedCount, pendingCount } = useTasks()

const percentage = computed(() =>
  tasks.value.length === 0
    ? 0
    : Math.round((completedCount.value / tasks.value.length) * 100)
)
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-top: 0.3rem;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

/* btn classes come from global main.css */
.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.55rem 1.4rem;
  border-radius: var(--radius-pill);
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  border: 2px solid transparent;
  transition: background 0.15s, box-shadow 0.15s;
  white-space: nowrap;
  text-decoration: none;
  font-family: var(--font);
}

.btn-primary {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

.btn-primary:hover {
  background: var(--primary-dark);
  box-shadow: var(--shadow-md);
}

@media (max-width: 768px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
  }
}
</style>
