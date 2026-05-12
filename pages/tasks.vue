<template>
  <div class="page">

    <div class="page-header">
      <div>
        <h1 class="page-title">Tasks</h1>
        <p class="page-sub">{{ taskStore.tasks.length }} task{{ taskStore.tasks.length === 1 ? '' : 's' }} total</p>
      </div>
      <button
        v-if="taskStore.completedTasks.length > 0"
        class="clear-btn"
        @click="taskStore.clearCompleted()"
      >
        Clear completed
      </button>
    </div>

    <!-- Error banner -->
    <Transition name="fade">
      <div v-if="taskStore.error" class="error-banner" role="alert">
        <span>⚠️ {{ taskStore.error }}</span>
        <button class="dismiss-btn" @click="taskStore.clearError()">✕</button>
      </div>
    </Transition>

    <!-- Filter + sort bar (driven by preferences store) -->
    <FilterBar />

    <TaskInput />

    <TaskList
      :tasks="sortedFilteredTasks"
      @toggle="taskStore.toggleTaskStatus"
      @delete="taskStore.deleteTask"
    />

  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useTaskStore } from '~/stores/useTaskStore'
import { useTaskSorting } from '~/composables/useTaskSorting'

const taskStore = useTaskStore()
const { sortedFilteredTasks } = useTaskSorting()
</script>

<style scoped>
.page { max-width: 680px; }

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.page-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.page-sub {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.clear-btn {
  padding: 0.4rem 1rem;
  border-radius: var(--radius-pill);
  border: 1.5px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  font-family: var(--font);
  white-space: nowrap;
}
.clear-btn:hover { border-color: var(--danger); color: var(--danger); }

.error-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: var(--danger-light);
  color: var(--danger);
  border: 1px solid var(--danger);
  border-radius: var(--radius-md);
  padding: 0.65rem 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.dismiss-btn {
  background: none;
  border: none;
  color: var(--danger);
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0.1rem 0.3rem;
  border-radius: var(--radius-sm);
}
.dismiss-btn:hover { background: rgba(0,0,0,0.08); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
