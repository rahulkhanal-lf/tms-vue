<template>
  <div class="app-shell">
    <AppHeader />
    <div class="page-hero" aria-hidden="true" />
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  color: var(--text);
}

.page-hero {
  height: 6px;
  background: linear-gradient(90deg, #7c3aed 0%, #a78bfa 40%, #818cf8 70%, #60a5fa 100%);
  flex-shrink: 0;
}

.main-content {
  flex: 1;
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
  padding: 2.5rem 2rem;
}

@media (max-width: 768px) {
  .main-content { padding: 1.5rem 1rem; }
}
</style>
