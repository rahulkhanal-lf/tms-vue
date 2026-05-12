<template>
  <div class="progress-wrap">
    <div class="progress-header">
      <span class="progress-label">Completion Progress</span>
      <span class="progress-pct">{{ percentage }}%</span>
    </div>
    <div
      class="progress-track"
      role="progressbar"
      :aria-valuenow="percentage"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="`${percentage}% of tasks completed`"
    >
      <div class="progress-fill" :style="{ width: percentage + '%' }" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ percentage: number }>()
</script>

<style scoped>
.progress-wrap {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.25rem 1.5rem;
  box-shadow: var(--shadow-sm);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.85rem;
}

.progress-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.progress-pct {
  font-size: 1rem;
  font-weight: 800;
  color: var(--primary);
  letter-spacing: -0.02em;
}

.progress-track {
  height: 8px;
  background: var(--border);
  border-radius: var(--radius-pill);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%);
  border-radius: var(--radius-pill);
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
