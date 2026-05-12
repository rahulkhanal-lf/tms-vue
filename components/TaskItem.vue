<template>
  <li
    class="task-item"
    :class="[`task-item--${task.priority}`, { 'task-item--done': task.completed }]"
  >
    <!-- VIEW MODE -->
    <template v-if="!editing">
      <label class="task-check" :for="`task-${task.id}`">
        <input
          :id="`task-${task.id}`"
          type="checkbox"
          :checked="task.completed"
          @change="emit('toggle', task.id)"
          :aria-label="`Mark '${task.title}' as ${task.completed ? 'incomplete' : 'complete'}`"
        />
        <span class="custom-check" aria-hidden="true">
          <span v-if="task.completed" class="check-tick">✓</span>
        </span>
      </label>

      <div class="task-body">
        <span class="task-title">{{ task.title }}</span>
        <span class="priority-dot" :class="`dot--${task.priority}`" :title="task.priority">
          {{ priorityLabel }}
        </span>
      </div>

      <div class="actions">
        <button class="btn-icon btn-edit" @click="startEdit" :aria-label="`Edit: ${task.title}`" title="Edit">
          ✏️
        </button>
        <button class="btn-icon btn-delete" @click="emit('delete', task.id)" :aria-label="`Delete: ${task.title}`" title="Delete">
          ✕
        </button>
      </div>
    </template>

    <!-- EDIT MODE -->
    <template v-else>
      <label :for="`edit-${task.id}`" class="sr-only">Edit task title</label>
      <input
        :id="`edit-${task.id}`"
        v-model="editTitle"
        class="edit-input"
        :class="{ 'edit-input--error': editError }"
        @keydown.enter="saveEdit"
        @keydown.escape="cancelEdit"
        ref="editInputRef"
      />

      <label :for="`edit-priority-${task.id}`" class="sr-only">Priority</label>
      <select :id="`edit-priority-${task.id}`" v-model="editPriority" class="edit-priority">
        <option value="high">🔴 High</option>
        <option value="medium">🟡 Medium</option>
        <option value="low">🟢 Low</option>
      </select>

      <div class="actions">
        <button class="btn-icon btn-save" @click="saveEdit" aria-label="Save" title="Save (Enter)">✔</button>
        <button class="btn-icon btn-cancel" @click="cancelEdit" aria-label="Cancel" title="Cancel (Esc)">✕</button>
      </div>

      <p v-if="editError" class="edit-error" role="alert">{{ editError }}</p>
    </template>
  </li>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useTasks } from '~/composables/useTasks'
import { useAppToast } from '~/composables/useAppToast'
import type { Task, Priority } from '~/composables/useTasks'

const props = defineProps<{ task: Task }>()

const emit = defineEmits<{
  toggle: [id: number]
  delete: [id: number]
}>()

const { editTask } = useTasks()
const toast = useAppToast()

const editing = ref(false)
const editTitle = ref('')
const editPriority = ref<Priority>('medium')
const editError = ref('')
const editInputRef = ref<HTMLInputElement | null>(null)

const priorityLabel = computed(() => (
  { high: '● High', medium: '● Med', low: '● Low' }[props.task.priority]
))

async function startEdit() {
  editTitle.value = props.task.title
  editPriority.value = props.task.priority
  editError.value = ''
  editing.value = true
  await nextTick()
  editInputRef.value?.focus()
}

function saveEdit() {
  try {
    editTask(props.task.id, editTitle.value, editPriority.value)
    editing.value = false
    editError.value = ''
    toast.success('Task updated successfully!')
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid input'
    editError.value = message
    toast.error(message)
  }
}

function cancelEdit() {
  editing.value = false
  editError.value = ''
}
</script>

<style scoped>
.task-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  transition: background 0.12s;
  flex-wrap: wrap;
  position: relative;
  cursor: default;
}

.task-item:hover { background: var(--hover); }
.task-item--done { opacity: 0.5; }
.task-item--done .task-title { text-decoration: line-through; color: var(--text-muted); }

/* Custom circular checkbox */
.task-check { display: flex; align-items: center; cursor: pointer; flex-shrink: 0; }

.task-check input[type='checkbox'] {
  position: absolute;
  opacity: 0;
  width: 0; height: 0;
}

.custom-check {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.15s, background 0.15s;
  flex-shrink: 0;
}

.task-check:hover .custom-check { border-color: var(--primary); }

.task-item--done .custom-check {
  background: var(--primary);
  border-color: var(--primary);
}

.check-tick {
  font-size: 0.65rem;
  color: #fff;
  font-weight: 700;
  line-height: 1;
}

/* Task body */
.task-body {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
}

.task-title {
  font-size: 0.92rem;
  color: var(--text);
  font-weight: 500;
  word-break: break-word;
  min-width: 0;
}

/* Priority inline label */
.priority-dot {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.12rem 0.5rem;
  border-radius: var(--radius-pill);
  white-space: nowrap;
  flex-shrink: 0;
}

.dot--high   { background: #fef2f2; color: #b91c1c; }
.dot--medium { background: #fffbeb; color: #92400e; }
.dot--low    { background: #f0fdf4; color: #15803d; }

.dark .dot--high   { background: #2d1515; color: #fca5a5; }
.dark .dot--medium { background: #292010; color: #fcd34d; }
.dark .dot--low    { background: #142d1e; color: #86efac; }

/* Actions — hidden until hover */
.actions {
  display: flex;
  gap: 0.15rem;
  align-items: center;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.15s;
}

.task-item:hover .actions { opacity: 1; }

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.28rem 0.4rem;
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  line-height: 1;
  transition: background 0.15s, color 0.15s;
  color: var(--text-muted);
}

.btn-edit:hover   { background: var(--primary-subtle); }
.btn-delete:hover { background: var(--danger-light); color: var(--danger); }
.btn-save:hover   { background: var(--success-light); color: var(--success); }
.btn-cancel:hover { background: var(--danger-light); color: var(--danger); }

/* Edit inputs */
.edit-input {
  flex: 1;
  min-width: 120px;
  padding: 0.4rem 0.75rem;
  border: 1.5px solid var(--primary);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  background: var(--surface);
  color: var(--text);
  outline: none;
  font-family: var(--font);
  box-shadow: 0 0 0 3px var(--primary-light);
}

.edit-input--error { border-color: var(--danger); }

.edit-priority {
  padding: 0.4rem 0.6rem;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
  outline: none;
  font-family: var(--font);
}

.edit-error {
  width: 100%;
  font-size: 0.75rem;
  color: var(--danger);
  margin-top: 0.2rem;
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
