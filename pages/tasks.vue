<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Tasks</h1>
        <p class="page-subtitle">Add, edit, and manage your tasks.</p>
      </div>
    </div>

    <!-- Filter bar -->
    <div class="filter-bar">
      <div class="filter-group" role="tablist" aria-label="Filter by status">
        <button
          v-for="f in statusFilters"
          :key="f.value"
          role="tab"
          :aria-selected="activeStatus === f.value"
          class="filter-tab"
          :class="{ 'filter-tab--active': activeStatus === f.value }"
          @click="activeStatus = f.value"
        >
          {{ f.label }}
        </button>
      </div>

      <div class="filter-divider" aria-hidden="true" />

      <div class="filter-group" role="tablist" aria-label="Filter by priority">
        <button
          v-for="p in priorityFilters"
          :key="p.value"
          role="tab"
          :aria-selected="activePriority === p.value"
          class="filter-tab"
          :class="[
            { 'filter-tab--active': activePriority === p.value },
            p.value !== 'all' ? `priority-tab--${p.value}` : ''
          ]"
          @click="activePriority = p.value"
        >
          {{ p.label }}
        </button>
      </div>
    </div>

    <TaskInput @add="handleAdd" />
    <TaskList
      :tasks="filteredTasks"
      @toggle="toggleTaskStatus"
      @delete="deleteTask"
      @edit="editTask"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTasks } from '~/composables/useTasks'
import type { Priority } from '~/composables/useTasks'

const { tasks, addTask, toggleTaskStatus, deleteTask, editTask } = useTasks()

const activeStatus   = ref<'all' | 'active' | 'completed'>('all')
const activePriority = ref<'all' | Priority>('all')

const statusFilters = [
  { value: 'all' as const,       label: 'All' },
  { value: 'active' as const,    label: 'Active' },
  { value: 'completed' as const, label: 'Completed' }
]

const priorityFilters = [
  { value: 'all' as const,    label: 'All Priority' },
  { value: 'high' as const,   label: '🔴 High' },
  { value: 'medium' as const, label: '🟡 Medium' },
  { value: 'low' as const,    label: '🟢 Low' }
]

const filteredTasks = computed(() => {
  let result = tasks.value
  if (activeStatus.value === 'active')    result = result.filter(t => !t.completed)
  if (activeStatus.value === 'completed') result = result.filter(t => t.completed)
  if (activePriority.value !== 'all')     result = result.filter(t => t.priority === activePriority.value)
  return result
})

function handleAdd(title: string, priority: Priority) {
  addTask(title, priority)
}
</script>

<style scoped>
.page-header {
  margin-bottom: 1.75rem;
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

/* Filter bar */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  padding: 0.35rem 0.5rem;
  box-shadow: var(--shadow-sm);
  width: fit-content;
}

.filter-group {
  display: flex;
  gap: 0.2rem;
}

.filter-divider {
  width: 1px;
  height: 20px;
  background: var(--border);
  flex-shrink: 0;
}

.filter-tab {
  padding: 0.3rem 0.85rem;
  border-radius: var(--radius-pill);
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
  font-family: var(--font);
}

.filter-tab:hover {
  background: var(--hover);
  color: var(--text);
}

.filter-tab--active {
  background: var(--primary);
  color: #fff;
}

.priority-tab--high.filter-tab--active   { background: #dc2626; }
.priority-tab--medium.filter-tab--active { background: #d97706; }
.priority-tab--low.filter-tab--active    { background: #16a34a; }

@media (max-width: 640px) {
  .filter-bar {
    width: 100%;
    border-radius: var(--radius-lg);
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-divider {
    width: 100%;
    height: 1px;
  }
}
</style>
