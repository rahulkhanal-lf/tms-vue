<template>
  <div class="card">
    <div class="card-icon" aria-hidden="true">{{ icon }}</div>
    <div class="card-body">
      <div class="card-value">{{ value }}</div>
      <div class="card-label">{{ label }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  value: number | string
  label: string
}>()
</script>

<style scoped>
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.1rem;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s, transform 0.2s;
  position: relative;
  overflow: hidden;
}

.card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary), var(--accent));
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card-icon {
  font-size: 2rem;
  line-height: 1;
  flex-shrink: 0;
}

.card-value {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text);
  line-height: 1;
  letter-spacing: -0.03em;
}

.card-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
}
</style>
