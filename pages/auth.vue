<template>
  <div class="auth-page">
    <div class="auth-container">
      <h1 class="auth-title">{{ isLogin ? 'Login' : 'Register' }}</h1>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="form-input"
            placeholder="your@email.com"
          />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            minlength="6"
            class="form-input"
            placeholder="••••••••"
          />
        </div>

        <button type="submit" :disabled="authStore.loading" class="auth-btn">
          {{ authStore.loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register') }}
        </button>
      </form>

      <button @click="isLogin = !isLogin" class="auth-toggle">
        {{ isLogin ? "Don't have an account? Register" : 'Already have an account? Login' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/useAuthStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

onMounted(async () => {
  if (import.meta.client) {
    await authStore.initializeAuth()
    if (authStore.isAuthenticated) {
      return navigateTo('/')
    }
  }
})

const isLogin = ref(true)
const email = ref('')
const password = ref('')

async function handleSubmit() {
  try {
    if (isLogin.value) {
      await authStore.login(email.value, password.value)
    } else {
      await authStore.register(email.value, password.value)
    }
    router.push('/')
  } catch {
    // Error handled in store
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  padding: 1rem;
}

.auth-container {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow-lg);
}

.auth-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text);
  text-align: center;
  margin-bottom: 1.5rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text);
}

.form-input {
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg);
  color: var(--text);
  font-size: 1rem;
  transition: border-color 0.15s;
}
.form-input:focus {
  outline: none;
  border-color: var(--primary);
}

.auth-btn {
  padding: 0.75rem;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  margin-top: 0.5rem;
}
.auth-btn:hover:not(:disabled) {
  background: var(--primary-dark);
}
.auth-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-toggle {
  margin-top: 1rem;
  background: none;
  border: none;
  color: var(--primary);
  cursor: pointer;
  font-size: 0.875rem;
  text-decoration: underline;
}

.demo-info {
  margin-top: 2rem;
  padding: 1rem;
  background: var(--surface);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  color: var(--text-muted);
}
.demo-info p {
  margin: 0.25rem 0;
}
</style>