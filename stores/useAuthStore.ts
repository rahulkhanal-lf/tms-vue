import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useNotificationStore } from './useNotificationStore'

export interface User {
  id: number
  email: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!user.value)

  async function login(email: string, password: string) {
    const notif = useNotificationStore()
    loading.value = true

    try {
      const response = await $fetch<{ token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })

      token.value = response.token
      user.value = response.user

      // Store token in localStorage
      if (import.meta.client) {
        localStorage.setItem('auth_token', response.token)
      }

      notif.notify('success', 'Logged in successfully')
    } catch (error: any) {
      const msg = error?.data?.statusMessage || 'Login failed'
      notif.notify('error', msg)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function register(email: string, password: string) {
    const notif = useNotificationStore()
    loading.value = true

    try {
      const response = await $fetch<{ token: string; user: User }>('/api/auth/register', {
        method: 'POST',
        body: { email, password }
      })

      token.value = response.token
      user.value = response.user

      if (import.meta.client) {
        localStorage.setItem('auth_token', response.token)
      }

      notif.notify('success', 'Account created successfully')
    } catch (error: any) {
      const msg = error?.data?.statusMessage || 'Registration failed'
      notif.notify('error', msg)
      throw error
    } finally {
      loading.value = false
    }
  }

  function logout() {
    user.value = null
    token.value = null
    if (import.meta.client) {
      localStorage.removeItem('auth_token')
    }
    const notif = useNotificationStore()
    notif.notify('info', 'Logged out')
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  async function initializeAuth() {
    if (import.meta.client) {
      const storedToken = localStorage.getItem('auth_token')
      if (storedToken) {
        token.value = storedToken
        try {
          // Verify token and get user info
          const userData = await $fetch<User>('/api/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` }
          })
          user.value = userData
        } catch (error) {
          // Token is invalid, clear it
          localStorage.removeItem('auth_token')
          token.value = null
        }
      }
    }
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    initializeAuth
  }
})