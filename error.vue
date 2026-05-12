<template>
  <div class="error-page">
    <div class="error-card">
      <div class="error-icon" aria-hidden="true">
        {{ error.statusCode === 404 ? '🔍' : '⚠️' }}
      </div>
      <h1 class="error-code">{{ error.statusCode }}</h1>
      <p class="error-title">
        {{ error.statusCode === 404 ? 'Page not found' : 'Something went wrong' }}
      </p>
      <p class="error-message">{{ error.message }}</p>
      <button class="error-btn" @click="handleError">
        {{ error.statusCode === 404 ? 'Go to Dashboard' : 'Try again' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  error: {
    statusCode: number
    message: string
  }
}>()

function handleError() {
  clearError({ redirect: '/' })
}
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  font-family: var(--font);
  padding: 2rem;
}

.error-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 3rem 2.5rem;
  text-align: center;
  max-width: 420px;
  width: 100%;
  box-shadow: var(--shadow-lg);
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  line-height: 1;
}

.error-code {
  font-size: 4rem;
  font-weight: 900;
  color: var(--primary);
  letter-spacing: -0.05em;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.error-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 0.5rem;
}

.error-message {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.error-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.6rem 1.75rem;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-pill);
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s, box-shadow 0.15s;
  font-family: var(--font);
}

.error-btn:hover {
  background: var(--primary-dark);
  box-shadow: var(--shadow-md);
}
</style>
