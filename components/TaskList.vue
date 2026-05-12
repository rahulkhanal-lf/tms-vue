<template>
  <div class="list-wrap">
    <TransitionGroup name="task" tag="ul" class="task-list" aria-label="Task list">
      <TaskItem
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @toggle="emit('toggle', $event)"
        @delete="emit('delete', $event)"
      />
    </TransitionGroup>

    <Transition name="fade">
      <div v-if="tasks.length === 0" class="empty-state" role="status">
        <span class="empty-icon" aria-hidden="true">🗒️</span>
        <p class="empty-title">No tasks here</p>
        <p class="empty-sub">Add a task above to get started.</p>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { Task, Priority } from '~/stores/useTaskStore'

defineProps<{ tasks: Task[] }>()

const emit = defineEmits<{
  toggle: [id: number]
  delete: [id: number]
  edit: [id: number, title: string, priority: Priority]
}>()
</script>

<style scoped>
.list-wrap {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.task-list {
  list-style: none;
  padding: 0.4rem 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* Divider between items */
.task-list > li + li {
  border-top: 1px solid var(--border);
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 3.5rem 1rem;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 2.2rem;
  display: block;
  margin-bottom: 0.75rem;
}

.empty-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.empty-sub {
  font-size: 0.82rem;
  color: var(--text-muted);
}

/* Transitions */
.task-enter-active,
.task-leave-active { transition: all 0.22s ease; }
.task-enter-from   { opacity: 0; transform: translateY(-6px); }
.task-leave-to     { opacity: 0; transform: translateX(16px); }
.task-leave-active { position: absolute; width: 100%; }

.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from,
.fade-leave-to     { opacity: 0; }
</style>
