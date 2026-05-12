<template>
  <div>
    <TransitionGroup name="task" tag="ul" class="task-list" aria-label="Task list">
      <TaskItem
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @toggle="emit('toggle', $event)"
        @delete="emit('delete', $event)"
        @edit="(id, title, priority) => emit('edit', id, title, priority)"
      />
    </TransitionGroup>

    <Transition name="fade">
      <div v-if="tasks.length === 0" class="empty-state" role="status">
        <span class="empty-icon" aria-hidden="true">📋</span>
        <p>No tasks yet — add one above!</p>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { Task, Priority } from '~/composables/useTasks'

defineProps<{ tasks: Task[] }>()

const emit = defineEmits<{
  toggle: [id: number]
  delete: [id: number]
  edit: [id: number, title: string, priority: Priority]
}>()
</script>

<style scoped>
.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.75rem;
}

.task-enter-active,
.task-leave-active {
  transition: all 0.25s ease;
}

.task-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.task-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.task-leave-active {
  position: absolute;
  width: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
