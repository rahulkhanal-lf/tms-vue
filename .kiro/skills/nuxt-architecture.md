# Nuxt 4 Project Architecture Guide

This skill defines the architecture standards and conventions for this Nuxt 4 project. Follow these guidelines whenever creating, editing, or refactoring files.

---

## Stack

- **Framework**: Nuxt 4 (with `app/` directory layout)
- **UI**: Vue 3 Composition API (`<script setup>`)
- **Package Manager**: pnpm
- **Language**: TypeScript throughout

---

## Directory Structure

```
nuxtapp/
├── app/
│   ├── app.vue                  # Root app component
│   ├── pages/                   # File-based routing
│   │   └── index.vue
│   ├── components/              # Auto-imported components
│   │   ├── ui/                  # Generic, reusable UI primitives (Button, Modal, etc.)
│   │   └── features/            # Feature-specific components
│   ├── layouts/                 # Page layouts (default.vue, auth.vue, etc.)
│   ├── composables/             # Auto-imported composables (useXxx.ts)
│   ├── stores/                  # Pinia stores (useXxxStore.ts)
│   ├── middleware/              # Route middleware
│   ├── plugins/                 # Nuxt plugins
│   └── utils/                  # Pure utility/helper functions
├── server/
│   ├── api/                     # API route handlers
│   ├── middleware/              # Server middleware
│   └── utils/                  # Server-only utilities
├── shared/
│   └── types/                  # Shared TypeScript types/interfaces
├── public/                      # Static assets
└── nuxt.config.ts
```

---

## Component Rules

- Always use `<script setup lang="ts">` — never Options API.
- Component filenames use **PascalCase**: `UserCard.vue`, `AppHeader.vue`.
- Keep components focused. If a component exceeds ~150 lines, split it.
- Place reusable UI primitives in `components/ui/`, feature-specific ones in `components/features/`.
- Use `defineProps` and `defineEmits` with TypeScript types, not runtime validators.

```vue
<script setup lang="ts">
const props = defineProps<{
  title: string
  count?: number
}>()

const emit = defineEmits<{
  update: [value: number]
}>()
</script>
```

---

## Composables

- All composables live in `app/composables/` and are auto-imported.
- Name them `useXxx.ts` — e.g., `useAuth.ts`, `useCart.ts`.
- Composables handle stateful logic, API calls, and shared reactive state.
- Keep composables single-responsibility.

```ts
// app/composables/useCounter.ts
export function useCounter(initial = 0) {
  const count = ref(initial)
  const increment = () => count.value++
  const reset = () => (count.value = initial)
  return { count, increment, reset }
}
```

---

## State Management (Pinia)

- Use Pinia for global/cross-component state. Install with `@pinia/nuxt`.
- Store files live in `app/stores/` and are named `useXxxStore.ts`.
- Prefer the **setup store** syntax over options syntax.

```ts
// app/stores/useUserStore.ts
export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isLoggedIn = computed(() => !!user.value)
  function setUser(u: User) { user.value = u }
  return { user, isLoggedIn, setUser }
})
```

---

## Data Fetching

- Use `useFetch` or `useAsyncData` for SSR-aware data fetching — never raw `fetch` in components.
- Always handle `pending`, `error`, and `data` states.
- Use `$fetch` inside server routes and composables that don't need SSR hydration.

```vue
<script setup lang="ts">
const { data: posts, pending, error } = await useFetch('/api/posts')
</script>
```

---

## Server / API Routes

- All API handlers live in `server/api/`.
- Use file-based routing: `server/api/users/[id].get.ts` → `GET /api/users/:id`.
- Always type request bodies and return values.
- Handle errors with `createError`.

```ts
// server/api/users/[id].get.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Missing id' })
  const user = await getUserById(id)
  if (!user) throw createError({ statusCode: 404, message: 'User not found' })
  return user
})
```

---

## TypeScript

- All files use TypeScript. No `any` — use `unknown` and narrow types.
- Shared types/interfaces live in `shared/types/`.
- Use `interface` for object shapes, `type` for unions/aliases.

---

## Layouts

- Default layout: `app/layouts/default.vue` — wraps all pages unless overridden.
- Assign layouts in pages with `definePageMeta({ layout: 'auth' })`.

---

## Routing & Middleware

- Pages live in `app/pages/` — file name = route path.
- Use `definePageMeta` for per-page config (layout, middleware, auth guards).
- Route middleware lives in `app/middleware/` — named files are applied explicitly, `global` suffix runs on every route.

---

## Styling

- Prefer scoped styles (`<style scoped>`) in components.
- Use CSS custom properties or a utility framework (Tailwind CSS recommended) for design tokens.
- Avoid inline styles.

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase | `UserCard.vue` |
| Composables | camelCase, `use` prefix | `useAuth.ts` |
| Pinia stores | camelCase, `use` + `Store` suffix | `useUserStore.ts` |
| Pages | kebab-case | `user-profile.vue` |
| Server routes | kebab-case + HTTP method | `users.get.ts` |
| Types/Interfaces | PascalCase | `UserProfile`, `ApiResponse` |
| Utils | camelCase | `formatDate.ts` |

---

## General Principles

1. **Colocation**: Keep related logic close — composables near the components that use them until they need sharing.
2. **Single responsibility**: One file, one job.
3. **No business logic in components**: Move it to composables or stores.
4. **SSR-safe code**: Avoid `window`/`document` outside `onMounted` or `import.meta.client` guards.
5. **Auto-imports**: Rely on Nuxt's auto-import for components, composables, and Vue APIs — don't manually import them.
