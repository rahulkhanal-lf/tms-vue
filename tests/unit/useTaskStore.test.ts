import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTaskStore } from '~/stores/useTaskStore'

// Mock $fetch globally
;(globalThis as any).$fetch = vi.fn()

describe('useTaskStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should initialize with empty tasks', () => {
    const store = useTaskStore()
    expect(store.tasks).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBe(null)
    expect(store.isEmpty).toBe(true)
  })

  it('should add a task', () => {
    const store = useTaskStore()
    store.addTask('Test Task')

    expect(store.tasks).toHaveLength(1)
    expect(store.tasks[0].title).toBe('Test Task')
    expect(store.tasks[0].completed).toBe(false)
    expect(store.tasks[0].id).toBe(1)
  })

  it('should not add duplicate task titles', () => {
    const store = useTaskStore()
    store.addTask('Test Task')

    expect(() => store.addTask('Test Task')).toThrow('A task with this title already exists')
    expect(store.tasks).toHaveLength(1)
  })

  it('should toggle task completion', () => {
    const store = useTaskStore()
    store.addTask('Test Task')

    const taskId = store.tasks[0].id
    store.toggleTaskStatus(taskId)

    expect(store.tasks[0].completed).toBe(true)
    expect(store.completedCount).toBe(1)
    expect(store.pendingCount).toBe(0)
  })

  it('should delete a task', () => {
    const store = useTaskStore()
    store.addTask('Test Task')

    const taskId = store.tasks[0].id
    store.deleteTask(taskId)

    expect(store.tasks).toHaveLength(0)
    expect(store.isEmpty).toBe(true)
  })

  it('should calculate completion percentage', () => {
    const store = useTaskStore()
    store.addTask('Task 1')
    store.addTask('Task 2')

    expect(store.completionPercentage).toBe(0)

    store.toggleTaskStatus(store.tasks[0].id)
    expect(store.completionPercentage).toBe(50)

    store.toggleTaskStatus(store.tasks[1].id)
    expect(store.completionPercentage).toBe(100)
  })

  it('should fetch tasks from API', async () => {
    const mockData = [
      { id: 1, title: 'API Task 1', completed: false },
      { id: 2, title: 'API Task 2', completed: true }
    ]

    // @ts-ignore
    global.$fetch.mockResolvedValue(mockData)

    const store = useTaskStore()
    await store.fetchTasks()

    expect(store.tasks).toHaveLength(2)
    expect(store.tasks[0].title).toBe('API Task 1')
    expect(store.tasks[0].completed).toBe(false)
    expect(store.tasks[1].completed).toBe(true)
    expect(store.loading).toBe(false)
    expect(store.lastFetchedAt).toBeInstanceOf(Date)
  })

  it('should handle API fetch error', async () => {
    (globalThis as any).$fetch.mockRejectedValue(new Error('Network error'))

    const store = useTaskStore()
    await store.fetchTasks()

    expect(store.tasks).toEqual([])
    expect(store.error).toBe('Network error')
    expect(store.loading).toBe(false)
  })

  it('should clear completed tasks', () => {
    const store = useTaskStore()
    store.addTask('Task 1')
    store.addTask('Task 2')
    store.toggleTaskStatus(store.tasks[0].id)

    store.clearCompleted()

    expect(store.tasks).toHaveLength(1)
    expect(store.tasks[0].title).toBe('Task 2')
    expect(store.tasks[0].completed).toBe(false)
  })

  it('should clear error', () => {
    const store = useTaskStore()
    store.error = 'Some error'
    store.clearError()

    expect(store.error).toBe(null)
  })
})