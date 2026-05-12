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
        <span class="checkmark" aria-hidden="true" />
      </label>

      <span class="priority-badge" :class="`badge--${task.priority}`">
        {{ priorityLabel }}
      </span>

      <span class="task-title">{{ task.title }}</span>

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
import type { Task, Priority } from '~/composables/useTasks'

const props = defineProps<{ task: Task }>()

const emit = defineEmits<{
  toggle: [id: number]
  delete: [id: number]
  edit: [id: number, title: string, priority: Priority]
}>()

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
  if (!editTitle.value.trim()) {
    editError.value = 'Title cannot be empty.'
    return
  }
  emit('edit', props.task.id, editTitle.value.trim(), editPriority.value)
  editing.value = false
  editError.value = ''
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
  gap: 0.75rem;
  padding: 0.85rem 1.1rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.15s, transform 0.15s;
  flex-wrap: wrap;
  position: relative;
  border-left-width: 3px;
}

.task-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateX(2px);
}

.task-item--high   { border-left-color: #dc2626; }
.task-item--medium { border-left-color: #d97706; }
.task-item--low    { border-left-color: #16a34a; }

.task-item--done {
  opacity: 0.5;
}

.task-item--done .task-title {
  text-decoration: line-through;
  color: var(--text-muted);
}

/* Custom checkbox */
.task-check {
  display: flex;
  align-items: center;
  cursor: pointer;
  flex-shrink: 0;
}

.task-check input[type='checkbox'] {
  width: 17px;
  height: 17px;
  accent-color: var(--primary);
  cursor: pointer;
  border-radius: 4px;
}

/* Priority badge */
.priority-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.18rem 0.6rem;
  border-radius: var(--radius-pill);
  white-space: nowrap;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.badge--high   { background: #fef2f2; color: #b91c1c; }
.badge--medium { background: #fffbeb; color: #92400e; }
.badge--low    { background: #f0fdf4; color: #15803d; }

.dark .badge--high   { background: #2d1515; color: #fca5a5; }
.dark .badge--medium { background: #292010; color: #fcd34d; }
.dark .badge--low    { background: #142d1e; color: #86efac; }

/* Title */
.task-title {
  flex: 1;
  font-size: 0.92rem;
  color: var(--text);
  word-break: break-word;
  min-width: 0;
  font-weight: 500;
}

/* Actions */
.actions {
  display: flex;
  gap: 0.2rem;
  align-items: center;
  flex-shrink: 0;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.3rem 0.45rem;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
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
