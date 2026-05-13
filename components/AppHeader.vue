<template>
  <header class="header">
    <div class="header-inner">
      <!-- Logo -->
      <div class="logo">
        <span class="logo-icon" aria-hidden="true">◈</span>
        <span class="logo-text">Task Dashboard</span>
      </div>

      <!-- Nav -->
      <nav v-if="authStore.isAuthenticated" class="nav" aria-label="Main navigation">
        <NuxtLink to="/" class="nav-link" exact-active-class="nav-link--active">Dashboard</NuxtLink>
        <NuxtLink to="/tasks" class="nav-link" active-class="nav-link--active">Tasks</NuxtLink>
        <NuxtLink to="/about" class="nav-link" active-class="nav-link--active">About</NuxtLink>
      </nav>

      <!-- Right side -->
      <div class="header-right">
        <div v-if="authStore.isAuthenticated" class="user-menu">
          <span class="user-email">{{ authStore.user?.email }}</span>
          <button @click="authStore.logout()" class="logout-btn">Logout</button>
        </div>
        <NuxtLink v-else to="/auth" class="login-btn">Login</NuxtLink>

        <button
          class="theme-toggle"
          @click="toggleColorMode"
          :aria-label="`Switch to ${isDark ? 'light' : 'dark'} mode`"
          :title="`Switch to ${isDark ? 'light' : 'dark'} mode`"
        >
          <span aria-hidden="true">{{ isDark ? '☀️' : '🌙' }}</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '~/stores/useAuthStore'

const authStore = useAuthStore()
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
function toggleColorMode() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<style scoped>
.header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  box-shadow: 0 1px 0 var(--border), var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 2rem;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 2rem;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  flex-shrink: 0;
}

.logo-icon {
  font-size: 1.4rem;
  color: var(--primary);
  line-height: 1;
}

.logo-text {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.01em;
}

/* Nav */
.nav {
  display: flex;
  align-items: center;
  gap: 0.1rem;
  flex: 1;
}

.nav-link {
  padding: 0.4rem 0.9rem;
  border-radius: var(--radius-pill);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-muted);
  transition: background 0.15s, color 0.15s;
}

.nav-link:hover {
  background: var(--hover);
  color: var(--text);
}

.nav-link--active {
  background: var(--primary-light);
  color: var(--primary);
  font-weight: 600;
}

/* Right side */
.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
  flex-shrink: 0;
}

.theme-toggle {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-pill);
  border: 1.5px solid var(--border);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: background 0.15s, border-color 0.15s;
  color: var(--text-muted);
}

.theme-toggle:hover {
  background: var(--primary-subtle);
  border-color: var(--primary);
}

/* Responsive */
@media (max-width: 768px) {
  .header-inner {
    padding: 0 1rem;
    height: auto;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
  }

  .nav {
    order: 3;
    width: 100%;
    justify-content: center;
  }

  .header-right {
    margin-left: 0;
  }
}
</style>
