import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTaskStore } from '~/stores/useTaskStore'
import { useNotificationStore } from '~/stores/useNotificationStore'

// Mock $fetch globally
;(globalThis as any).$fetch = vi.fn()

describe('useTaskStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    ;(globalThis as any).$fetch = vi.fn()
  })

  it('should initialize with empty tasks', () => {
    const store = useTaskStore()
    expect(store.tasks).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBe(null)
    expect(store.isEmpty).toBe(true)
  })

  it('should add a task', async () => {
    const store = useTaskStore()
    const mockedTask = {
      id: 1,
      title: 'Test Task',
      completed: 0,
      priority: 'medium',
      created_at: new Date().toISOString(),
      sort_order: 1
    }
    ;(globalThis as any).$fetch.mockResolvedValueOnce(mockedTask)

    await store.addTask('Test Task')

    expect(store.tasks).toHaveLength(1)
    expect(store.tasks[0].title).toBe('Test Task')
    expect(store.tasks[0].completed).toBe(false)
    expect(store.tasks[0].id).toBe(1)
  })

  it('should not add duplicate task titles', async () => {
    const store = useTaskStore()
    const mockedTask = {
      id: 1,
      title: 'Test Task',
      completed: 0,
      priority: 'medium',
      created_at: new Date().toISOString(),
      sort_order: 1
    }
    ;(globalThis as any).$fetch.mockResolvedValueOnce(mockedTask)
    await store.addTask('Test Task')

    await expect(store.addTask('Test Task')).rejects.toThrow('A task with this title already exists')
    expect(store.tasks).toHaveLength(1)
  })

  it('should toggle task completion', async () => {
    const store = useTaskStore()
    const mockedTask = {
      id: 1,
      title: 'Test Task',
      completed: 0,
      priority: 'medium',
      created_at: new Date().toISOString(),
      sort_order: 1
    }
    ;(globalThis as any).$fetch.mockResolvedValueOnce(mockedTask)
    await store.addTask('Test Task')

    const toggledTask = { ...mockedTask, completed: 1 }
    ;(globalThis as any).$fetch.mockResolvedValueOnce(toggledTask)

    const taskId = store.tasks[0].id
    await store.toggleTaskStatus(taskId)

    expect(store.tasks[0].completed).toBe(true)
    expect(store.completedCount).toBe(1)
    expect(store.pendingCount).toBe(0)
  })

  it('should delete a task', async () => {
    const store = useTaskStore()
    const mockedTask = {
      id: 1,
      title: 'Test Task',
      completed: 0,
      priority: 'medium',
      created_at: new Date().toISOString(),
      sort_order: 1
    }
    ;(globalThis as any).$fetch.mockResolvedValueOnce(mockedTask)
    await store.addTask('Test Task')

    ;(globalThis as any).$fetch.mockResolvedValueOnce({ success: true })
    const taskId = store.tasks[0].id
    await store.deleteTask(taskId)

    expect(store.tasks).toHaveLength(0)
    expect(store.isEmpty).toBe(true)
  })

  it('should calculate completion percentage', async () => {
    const store = useTaskStore()
    const task1 = {
      id: 1,
      title: 'Task 1',
      completed: 0,
      priority: 'medium',
      created_at: new Date().toISOString(),
      sort_order: 1
    }
    const task2 = {
      id: 2,
      title: 'Task 2',
      completed: 0,
      priority: 'medium',
      created_at: new Date().toISOString(),
      sort_order: 2
    }

    ;(globalThis as any).$fetch.mockResolvedValueOnce(task1)
    await store.addTask('Task 1')
    ;(globalThis as any).$fetch.mockResolvedValueOnce(task2)
    await store.addTask('Task 2')

    expect(store.completionPercentage).toBe(0)

    ;(globalThis as any).$fetch.mockResolvedValueOnce({ ...task1, completed: 1 })
    await store.toggleTaskStatus(store.tasks[0].id)
    expect(store.completionPercentage).toBe(50)

    ;(globalThis as any).$fetch.mockResolvedValueOnce({ ...task2, completed: 1 })
    await store.toggleTaskStatus(store.tasks[1].id)
    expect(store.completionPercentage).toBe(100)
  })

  it('should fetch tasks from API', async () => {
    const mockData = [
      {
        id: 1,
        title: 'API Task 1',
        completed: 0,
        priority: 'medium',
        created_at: new Date().toISOString(),
        sort_order: 1
      },
      {
        id: 2,
        title: 'API Task 2',
        completed: 1,
        priority: 'medium',
        created_at: new Date().toISOString(),
        sort_order: 2
      }
    ]

    ;(globalThis as any).$fetch.mockResolvedValueOnce(mockData)

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
    ;(globalThis as any).$fetch.mockRejectedValue(new Error('Network error'))

    const store = useTaskStore()
    await store.fetchTasks()

    expect(store.tasks).toEqual([])
    expect(store.error).toBe('Network error')
    expect(store.loading).toBe(false)
  })

  it('should clear completed tasks', async () => {
    const store = useTaskStore()
    const task1 = {
      id: 1,
      title: 'Task 1',
      completed: 0,
      priority: 'medium',
      created_at: new Date().toISOString(),
      sort_order: 1
    }
    const task2 = {
      id: 2,
      title: 'Task 2',
      completed: 0,
      priority: 'medium',
      created_at: new Date().toISOString(),
      sort_order: 2
    }

    ;(globalThis as any).$fetch.mockResolvedValueOnce(task1)
    await store.addTask('Task 1')
    ;(globalThis as any).$fetch.mockResolvedValueOnce(task2)
    await store.addTask('Task 2')

    ;(globalThis as any).$fetch.mockResolvedValueOnce({ ...task1, completed: 1 })
    await store.toggleTaskStatus(store.tasks[0].id)

    ;(globalThis as any).$fetch.mockResolvedValueOnce({ success: true })
    await store.clearCompleted()

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

  it('should show clean API error messages for collaborator failures', async () => {
    const store = useTaskStore()
    const notifications = useNotificationStore()
    store.hydrateTasks([
      {
        id: 3,
        title: 'Shared task',
        completed: false,
        priority: 'medium',
        createdAt: new Date(),
        userId: 1,
        collaborators: []
      }
    ])

    const fetchError = Object.assign(
      new Error('[POST] "/api/tasks/3/collaborators": 409 User is already a collaborator'),
      { data: { statusMessage: 'User is already a collaborator' } }
    )
    ;(globalThis as any).$fetch.mockRejectedValueOnce(fetchError)

    await expect(store.addCollaborator(3, 'user@example.com'))
      .rejects.toThrow('User is already a collaborator')

    expect(notifications.notifications[0].message).toBe('User is already a collaborator')
  })
})
