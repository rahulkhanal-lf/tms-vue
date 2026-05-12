<template>
  <div class="filter-bar">
    <!-- Status filters -->
    <div class="filter-group" role="tablist" aria-label="Filter by status">
      <button
        v-for="f in statusFilters"
        :key="f.value"
        role="tab"
        :aria-selected="filterStatus === f.value"
        class="filter-tab"
        :class="{ 'filter-tab--active': filterStatus === f.value }"
        @click="prefStore.setFilter(f.value)"
      >
        {{ f.label }}
      </button>
    </div>

    <div class="filter-divider" aria-hidden="true" />

    <!-- Priority filters -->
    <div class="filter-group" role="tablist" aria-label="Filter by priority">
      <button
        v-for="p in priorityFilters"
        :key="p.value"
        role="tab"
        :aria-selected="filterPriority === p.value"
        class="filter-tab"
        :class="[
          { 'filter-tab--active': filterPriority === p.value },
          p.value !== 'all' ? `priority-tab--${p.value}` : ''
        ]"
        @click="prefStore.setPriorityFilter(p.value)"
      >
        {{ p.label }}
      </button>
    </div>

    <div class="filter-divider" aria-hidden="true" />

    <!-- Sort controls -->
    <div class="filter-group" role="group" aria-label="Sort tasks">
      <button
        v-for="s in sortOptions"
        :key="s.value"
        class="filter-tab"
        :class="{ 'filter-tab--active': sortBy === s.value }"
        @click="toggleSort(s.value)"
      >
        {{ s.label }}
        <span v-if="sortBy === s.value" aria-hidden="true">
          {{ sortDirection === 'asc' ? '↑' : '↓' }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { usePreferencesStore } from '~/stores/usePreferencesStore'
import type { SortBy } from '~/stores/usePreferencesStore'

const prefStore = usePreferencesStore()
const { filterStatus, filterPriority, sortBy, sortDirection } = storeToRefs(prefStore)

const statusFilters = [
  { value: 'all' as const,       label: 'All' },
  { value: 'active' as const,    label: 'Active' },
  { value: 'completed' as const, label: 'Completed' }
]

const priorityFilters = [
  { value: 'all' as const,    label: 'All' },
  { value: 'high' as const,   label: '🔴 High' },
  { value: 'medium' as const, label: '🟡 Med' },
  { value: 'low' as const,    label: '🟢 Low' }
]

const sortOptions = [
  { value: 'date' as SortBy,   label: 'Date' },
  { value: 'title' as SortBy,  label: 'Title' },
  { value: 'status' as SortBy, label: 'Status' }
]

function toggleSort(field: SortBy) {
  if (sortBy.value === field) {
    prefStore.setSortBy(field, sortDirection.value === 'asc' ? 'desc' : 'asc')
  } else {
    prefStore.setSortBy(field, 'desc')
  }
}
</script>

<style scoped>
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 1.25rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  padding: 0.3rem 0.4rem;
  box-shadow: var(--shadow-sm);
  width: fit-content;
}

.filter-group { display: flex; gap: 0.15rem; }

.filter-divider {
  width: 1px;
  height: 18px;
  background: var(--border);
  flex-shrink: 0;
  align-self: center;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.28rem 0.75rem;
  border-radius: var(--radius-pill);
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
  font-family: var(--font);
}

.filter-tab:hover { background: var(--hover); color: var(--text); }
.filter-tab--active { background: var(--primary); color: #fff; }

.priority-tab--high.filter-tab--active   { background: #dc2626; }
.priority-tab--medium.filter-tab--active { background: #d97706; }
.priority-tab--low.filter-tab--active    { background: #16a34a; }

@media (max-width: 640px) {
  .filter-bar {
    width: 100%;
    border-radius: var(--radius-lg);
    flex-direction: column;
    align-items: flex-start;
  }
  .filter-divider { width: 100%; height: 1px; }
}
</style>
