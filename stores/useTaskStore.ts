import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { z } from 'zod'
import { useNotificationStore } from './useNotificationStore'

export type Priority = 'high' | 'medium' | 'low'

export interface Task {
  id: number
  title: string
  completed: boolean
  priority: Priority
  createdAt: Date
}

// ── Zod schemas ────────────────────────────────────────────────
const PrioritySchema = z.enum(['high', 'medium', 'low'])

const TaskTitleSchema = z.string()
  .trim()
  .min(1, 'Task title cannot be empty')
  .max(200, 'Task title is too long (max 200 characters)')

// ── Store ──────────────────────────────────────────────────────
export const useTaskStore = defineStore('tasks', () => {
  // ── State ──────────────────────────────────────────────────
  const tasks        = ref<Task[]>([])
  const loading      = ref(false)
  const error        = ref<string | null>(null)
  const lastFetchedAt = ref<Date | null>(null)
  let   nextId       = 1

  // ── Getters ────────────────────────────────────────────────
  const completedTasks = computed(() => tasks.value.filter(t => t.completed))
  const pendingTasks   = computed(() => tasks.value.filter(t => !t.completed))
  const completedCount = computed(() => completedTasks.value.length)
  const pendingCount   = computed(() => pendingTasks.value.length)
  const isEmpty        = computed(() => tasks.value.length === 0)

  const completionPercentage = computed(() =>
    tasks.value.length === 0
      ? 0
      : Math.round((completedCount.value / tasks.value.length) * 100)
  )

  const tasksByDate = computed(() =>
    [...tasks.value].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  )

  // ── Helpers ────────────────────────────────────────────────
  function validateTitle(title: string) {
    const result = TaskTitleSchema.safeParse(title)
    if (!result.success) throw new Error(result.error.issues[0].message)
    return result.data
  }

  function validatePriority(priority: string) {
    const result = PrioritySchema.safeParse(priority)
    if (!result.success) throw new Error('Invalid priority value')
    return result.data
  }

  function syncNextId() {
    if (tasks.value.length > 0) {
      nextId = Math.max(...tasks.value.map(t => t.id)) + 1
    }
  }

  // ── Actions ────────────────────────────────────────────────
  async function fetchTasks() {
    const notif = useNotificationStore()
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<{ id: number; title: string; completed: boolean }[]>(
        'https://jsonplaceholder.typicode.com/todos?_limit=5'
      )
      tasks.value = data.map(item => ({
        id: item.id,
        title: item.title,
        completed: item.completed,
        priority: 'medium' as Priority,
        createdAt: new Date()
      }))
      syncNextId()
      lastFetchedAt.value = new Date()
      notif.notify('success', `Loaded ${tasks.value.length} tasks`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch tasks'
      error.value = msg
      notif.notify('error', msg)
    } finally {
      loading.value = false
    }
  }

  function addTask(title: string, priority: Priority = 'medium') {
    const notif = useNotificationStore()
    const trimmed = validateTitle(title)
    validatePriority(priority)

    const duplicate = tasks.value.find(
      t => t.title.toLowerCase() === trimmed.toLowerCase()
    )
    if (duplicate) throw new Error('A task with this title already exists')

    tasks.value.push({
      id: nextId++,
      title: trimmed,
      completed: false,
      priority,
      createdAt: new Date()
    })
    notif.notify('success', 'Task added')
  }

  function toggleTaskStatus(id: number) {
    const notif = useNotificationStore()
    const task = tasks.value.find(t => t.id === id)
    if (!task) return
    task.completed = !task.completed
    notif.notify('info', task.completed ? `"${task.title}" completed` : `"${task.title}" reopened`)
  }

  function deleteTask(id: number) {
    const notif = useNotificationStore()
    const task = tasks.value.find(t => t.id === id)
    if (!task) return
    tasks.value = tasks.value.filter(t => t.id !== id)
    notif.notify('info', `"${task.title}" deleted`)
  }

  function editTask(id: number, title: string, priority: Priority) {
    const trimmed = validateTitle(title)
    validatePriority(priority)

    const task = tasks.value.find(t => t.id === id)
    if (!task) return

    const duplicate = tasks.value.find(
      t => t.id !== id && t.title.toLowerCase() === trimmed.toLowerCase()
    )
    if (duplicate) throw new Error('A task with this title already exists')

    task.title = trimmed
    task.priority = priority

    const notif = useNotificationStore()
    notif.notify('success', 'Task updated')
  }

  function clearCompleted() {
    const count = completedTasks.value.length
    tasks.value = tasks.value.filter(t => !t.completed)
    const notif = useNotificationStore()
    notif.notify('info', `Cleared ${count} completed task${count !== 1 ? 's' : ''}`)
  }

  function reorderTasks(fromIndex: number, toIndex: number) {
    const list = [...tasks.value]
    const [moved] = list.splice(fromIndex, 1)
    list.splice(toIndex, 0, moved)
    tasks.value = list
  }

  function clearError() {
    error.value = null
  }

  // Hydrate from persisted data (called by persistence plugin)
  function hydrateTasks(incoming: Task[]) {
    tasks.value = incoming.map(t => ({
      ...t,
      priority: (PrioritySchema.safeParse(t.priority).success ? t.priority : 'medium') as Priority,
      createdAt: new Date(t.createdAt)
    }))
    syncNextId()
  }

  return {
    // state
    tasks, loading, error, lastFetchedAt,
    // getters
    completedTasks, pendingTasks, completedCount, pendingCount,
    completionPercentage, tasksByDate, isEmpty,
    // actions
    fetchTasks, addTask, toggleTaskStatus, deleteTask, editTask,
    clearCompleted, reorderTasks, clearError, hydrateTasks
  }
})
