<template>
  <div class="task-input">
    <div class="input-row">
      <label for="task-title" class="sr-only">New task title</label>
      <input
        id="task-title"
        v-model="title"
        type="text"
        class="input"
        :class="{ 'input--error': error }"
        placeholder="What needs to be done?"
        @keydown.enter="submit"
        aria-describedby="task-input-error"
      />

      <label for="task-priority" class="sr-only">Priority</label>
      <select id="task-priority" v-model="priority" class="priority-select">
        <option value="high">🔴 High</option>
        <option value="medium">🟡 Medium</option>
        <option value="low">🟢 Low</option>
      </select>

      <button class="btn-add" @click="submit" aria-label="Add task">
        <span aria-hidden="true">+</span> Add Task
      </button>
    </div>
    <p v-if="error" id="task-input-error" class="error-msg" role="alert">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTaskStore } from '~/stores/useTaskStore'
import type { Priority } from '~/stores/useTaskStore'

const taskStore = useTaskStore()

const title    = ref('')
const priority = ref<Priority>('medium')
const error    = ref('')

function submit() {
  error.value = ''
  try {
    taskStore.addTask(title.value, priority.value)
    title.value = ''
    priority.value = 'medium'
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Invalid input'
  }
}
</script>

<style scoped>
.task-input {
  margin-bottom: 1.5rem;
}

.input-row {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-pill);
  padding: 0.4rem 0.4rem 0.4rem 1.2rem;
  box-shadow: var(--shadow-sm);
  transition: border-color 0.15s, box-shadow 0.15s;
}

.input-row:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-light);
}

.input {
  flex: 1;
  min-width: 0;
  padding: 0.5rem 0;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  color: var(--text);
  outline: none;
  font-family: var(--font);
}

.input::placeholder {
  color: var(--text-muted);
}

.priority-select {
  padding: 0.4rem 0.75rem;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-pill);
  font-size: 0.82rem;
  font-weight: 500;
  background: var(--primary-subtle);
  color: var(--primary);
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s;
  font-family: var(--font);
}

.priority-select:focus {
  border-color: var(--primary);
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.55rem 1.25rem;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-pill);
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s, box-shadow 0.15s;
  white-space: nowrap;
  font-family: var(--font);
  letter-spacing: 0.01em;
}

.btn-add:hover {
  background: var(--primary-dark);
  box-shadow: var(--shadow-md);
}

.error-msg {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: var(--danger);
  padding-left: 1.2rem;
}

.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}
</style>
