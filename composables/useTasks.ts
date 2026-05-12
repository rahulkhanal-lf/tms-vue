import { ref, computed } from 'vue'

export type Priority = 'high' | 'medium' | 'low'

export interface Task {
  id: number
  title: string
  completed: boolean
  priority: Priority
  createdAt: Date
}

const tasks = ref<Task[]>([])
let nextId = 1

export function useTasks() {
  const completedCount = computed(() => tasks.value.filter(t => t.completed).length)
  const pendingCount = computed(() => tasks.value.filter(t => !t.completed).length)

  function addTask(title: string, priority: Priority = 'medium') {
    const trimmed = title.trim()
    if (!trimmed) return
    tasks.value.push({
      id: nextId++,
      title: trimmed,
      completed: false,
      priority,
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
    const trimmed = title.trim()
    if (!trimmed) return
    task.title = trimmed
    task.priority = priority
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
