import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { z } from 'zod'
import { useNotificationStore } from './useNotificationStore'
import { useAuthStore } from './useAuthStore'

export type Priority = 'high' | 'medium' | 'low'

export interface Task {
  id: number
  title: string
  completed: boolean
  priority: Priority
  createdAt: Date
}

interface TaskRow {
  id: number
  title: string
  completed: number
  priority: Priority
  created_at: string
  sort_order: number
}

const apiBase = '/api/tasks'

const getAuthHeaders = () => {
  const headers: Record<string, string> = {}
  if (import.meta.client) {
    const token = localStorage.getItem('auth_token')
    console.log('Token from localStorage:', token ? 'exists' : 'null')
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }
  return headers
}

const mapTaskRow = (row: TaskRow): Task => ({
  id: row.id,
  title: row.title,
  completed: Boolean(row.completed),
  priority: (PrioritySchema.safeParse(row.priority).success ? row.priority : 'medium') as Priority,
  createdAt: new Date(row.created_at)
})

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
    // Don't fetch on server side
    if (import.meta.server) return

    const notif = useNotificationStore()
    loading.value = true
    error.value = null

    try {
      const data = await $fetch<TaskRow[]>(apiBase, {
        headers: getAuthHeaders()
      })
      tasks.value = data.map(mapTaskRow)
      syncNextId()
      lastFetchedAt.value = new Date()
      notif.notify('success', `Loaded ${tasks.value.length} tasks`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load tasks'
      error.value = msg
      notif.notify('error', msg)
    } finally {
      loading.value = false
    }
  }

   async function addTask(title: string, priority: Priority = 'medium') {
    const notif = useNotificationStore()
    const trimmed = validateTitle(title)
    validatePriority(priority)

    const duplicate = tasks.value.find(
      t => t.title.toLowerCase() === trimmed.toLowerCase()
    )
    if (duplicate) throw new Error('A task with this title already exists')

    const created = await $fetch<TaskRow>(apiBase, {
      method: 'POST',
      body: { title: trimmed, priority },
      headers: getAuthHeaders()
    })

    tasks.value.push(mapTaskRow(created))
    syncNextId()
    notif.notify('success', 'Task added')
  }

  async function toggleTaskStatus(id: number) {
    const notif = useNotificationStore()
    const task = tasks.value.find(t => t.id === id)
    if (!task) return

    const updated = await $fetch<TaskRow>(`${apiBase}/${id}`, {
      method: 'PATCH',
      body: { completed: !task.completed },
      headers: getAuthHeaders()
    })

    task.completed = Boolean(updated.completed)
    notif.notify('info', task.completed ? `"${task.title}" completed` : `"${task.title}" reopened`)
  }

  async function deleteTask(id: number) {
    const notif = useNotificationStore()
    const task = tasks.value.find(t => t.id === id)
    if (!task) return

    await $fetch(`${apiBase}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })

    tasks.value = tasks.value.filter(t => t.id !== id)
    notif.notify('info', `"${task.title}" deleted`)
  }

  async function editTask(id: number, title: string, priority: Priority) {
    const trimmed = validateTitle(title)
    validatePriority(priority)

    const duplicate = tasks.value.find(
      t => t.id !== id && t.title.toLowerCase() === trimmed.toLowerCase()
    )
    if (duplicate) throw new Error('A task with this title already exists')

    const updated = await $fetch<TaskRow>(`${apiBase}/${id}`, {
      method: 'PATCH',
      body: { title: trimmed, priority },
      headers: getAuthHeaders()
    })

    const task = tasks.value.find(t => t.id === id)
    if (!task) return

    task.title = updated.title
    task.priority = updated.priority

    const notif = useNotificationStore()
    notif.notify('success', 'Task updated')
  }

  async function clearCompleted() {
    const count = completedTasks.value.length
    await $fetch(apiBase + '?completed=true', {
      method: 'DELETE',
      headers: getAuthHeaders()
    })

    tasks.value = tasks.value.filter(t => !t.completed)
    const notif = useNotificationStore()
    notif.notify('info', `Cleared ${count} completed task${count !== 1 ? 's' : ''}`)
  }

  async function reorderTasks(fromIndex: number, toIndex: number) {
    const list = [...tasks.value]
    const [moved] = list.splice(fromIndex, 1)
    list.splice(toIndex, 0, moved)
    tasks.value = list

    await $fetch('/api/tasks/reorder', {
      method: 'PUT',
      body: { ids: list.map(task => task.id) },
      headers: getAuthHeaders()
    })
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
