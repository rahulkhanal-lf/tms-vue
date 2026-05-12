import { ref, computed } from 'vue'
import { z } from 'zod'

export type Priority = 'high' | 'medium' | 'low'

export interface Task {
  id: number
  title: string
  completed: boolean
  priority: Priority
  createdAt: Date
}

// Zod schemas
const PrioritySchema = z.enum(['high', 'medium', 'low'])

const TaskTitleSchema = z.string()
  .trim()
  .min(1, 'Task title cannot be empty')
  .max(200, 'Task title is too long (max 200 characters)')

const tasks = ref<Task[]>([])
let nextId = 1

export function useTasks() {
  const completedCount = computed(() => tasks.value.filter(t => t.completed).length)
  const pendingCount = computed(() => tasks.value.filter(t => !t.completed).length)

  function addTask(title: string, priority: Priority = 'medium') {
    // Validate title with zod
    const titleResult = TaskTitleSchema.safeParse(title)
    if (!titleResult.success) {
      throw new Error(titleResult.error.issues[0].message)
    }

    // Validate priority with zod
    const priorityResult = PrioritySchema.safeParse(priority)
    if (!priorityResult.success) {
      throw new Error('Invalid priority value')
    }

    const trimmed = titleResult.data

    // Check for duplicate (case-insensitive)
    const duplicate = tasks.value.find(
      t => t.title.toLowerCase() === trimmed.toLowerCase()
    )
    if (duplicate) {
      throw new Error('A task with this title already exists')
    }

    tasks.value.push({
      id: nextId++,
      title: trimmed,
      completed: false,
      priority: priorityResult.data,
      createdAt: new Date()
    })
  }

  function toggleTaskStatus(id: number) {
    const task = tasks.value.find(t => t.id === id)
    if (task) task.completed = !task.completed
  }

  function deleteTask(id: number) {
    tasks.value = tasks.value.filter(t => t.id !== id)
  }

  function editTask(id: number, title: string, priority: Priority) {
    const task = tasks.value.find(t => t.id === id)
    if (!task) return

    // Validate title with zod
    const titleResult = TaskTitleSchema.safeParse(title)
    if (!titleResult.success) {
      throw new Error(titleResult.error.issues[0].message)
    }

    // Validate priority with zod
    const priorityResult = PrioritySchema.safeParse(priority)
    if (!priorityResult.success) {
      throw new Error('Invalid priority value')
    }

    const trimmed = titleResult.data

    // Check duplicate — exclude the task being edited itself
    const duplicate = tasks.value.find(
      t => t.id !== id && t.title.toLowerCase() === trimmed.toLowerCase()
    )
    if (duplicate) {
      throw new Error('A task with this title already exists')
    }

    task.title = trimmed
    task.priority = priorityResult.data
  }

  function hydrateTasks(incoming: Task[]) {
    tasks.value = incoming.map(t => ({
      ...t,
      priority: (t.priority as Priority) ?? 'medium'
    }))
    nextId = Math.max(0, ...incoming.map(t => t.id)) + 1
  }

  return { tasks, completedCount, pendingCount, addTask, toggleTaskStatus, deleteTask, editTask, hydrateTasks }
}
