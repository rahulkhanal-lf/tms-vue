# Task Dashboard

A personal task management app built with **Vue 3** and **Nuxt 3**. Demonstrates file-based routing, shared reactive state via composables, server API persistence with MySQL, dark mode, and animated UI.

---

## Getting Started

```bash
# Install dependencies
pnpm install

# Start MySQL in Docker
pnpm exec docker compose up -d

# Start development server
pnpm dev
```

App runs at `http://localhost:3000` and connects to MySQL at `127.0.0.1:3306`.

---

## Database

This project includes a MySQL Docker setup in `docker-compose.yml` and an initialization script at `docker/mysql-init.sql`.

- Database: `tasksdb`
- User: `app`
- Password: `secret`

The Nuxt backend uses `/api/tasks` for task persistence instead of client-side `localStorage`.

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| Nuxt | 3.x | Framework — SSR, routing, auto-imports |
| Vue | 3.x | UI layer — Composition API |
| TypeScript | built-in | Type safety throughout |
| @nuxtjs/color-mode | 4.x | Dark / light mode toggle |
| pnpm | — | Package manager |

---

## Project Structure

```
nuxtapp/
├── app.vue                        # Root component — mounts layout + page
├── nuxt.config.ts                 # Nuxt configuration
├── tsconfig.json                  # TypeScript config (extends .nuxt/tsconfig.json)
│
├── assets/
│   └── css/
│       └── main.css               # Global CSS reset + design tokens (CSS variables)
│
├── layouts/
│   └── default.vue                # App shell — wraps every page with AppHeader + <slot>
│
├── pages/
│   ├── index.vue                  # Route: /        — Dashboard summary
│   ├── tasks.vue                  # Route: /tasks   — Full task CRUD
│   └── about.vue                  # Route: /about   — Static info page
│
├── components/
│   ├── AppHeader.vue              # Sticky nav bar + dark mode toggle
│   ├── TaskInput.vue              # Text input + Add button with validation
│   ├── TaskItem.vue               # Single task row (checkbox, title, delete)
│   ├── TaskList.vue               # Animated list of TaskItems + empty state
│   ├── SummaryCard.vue            # Reusable stat card (icon + number + label)
│   └── ProgressBar.vue            # CSS completion percentage bar
│
├── composables/
│   └── useTasks.ts                # Shared reactive task state + all task logic
│
└── plugins/
    └── persist-tasks.client.ts    # localStorage hydration + persistence (browser only)
```

---

## How It Works

### Routing

Nuxt's file-based routing maps files in `pages/` directly to URL routes — no router config needed.

| File | Route |
|---|---|
| `pages/index.vue` | `/` |
| `pages/tasks.vue` | `/tasks` |
| `pages/about.vue` | `/about` |

`app.vue` uses `<NuxtLayout>` and `<NuxtPage>` to render the active layout and page. Navigation uses `<NuxtLink>` which does client-side routing without full page reloads.

---

### Layout

`layouts/default.vue` is the single layout applied to all pages. It renders `AppHeader` at the top and a `<slot />` where the current page content is injected.

```
┌─────────────────────────────┐
│         AppHeader           │  ← sticky nav + dark mode toggle
├─────────────────────────────┤
│                             │
│        <slot /> (page)      │  ← index.vue / tasks.vue / about.vue
│                             │
└─────────────────────────────┘
```

---

### State Management — `useTasks.ts`

All task state lives in `composables/useTasks.ts`. The key detail is that `tasks` and `nextId` are declared **outside** the function body, making them module-level singletons. Every component that calls `useTasks()` gets the same reactive reference.

```ts
// Module-level — shared across all callers
const tasks = ref<Task[]>([])
let nextId = 1

export function useTasks() {
  // computed, methods...
  return { tasks, completedCount, pendingCount, addTask, toggleTask, deleteTask, seedTasks }
}
```

**Exposed API:**

| Export | Type | Description |
|---|---|---|
| `tasks` | `Ref<Task[]>` | The full reactive task list |
| `completedCount` | `ComputedRef<number>` | Count of completed tasks |
| `pendingCount` | `ComputedRef<number>` | Count of incomplete tasks |
| `addTask(title)` | function | Appends a new task, trims whitespace |
| `toggleTask(id)` | function | Flips `completed` on a task |
| `deleteTask(id)` | function | Removes a task by id |
| `seedTasks(tasks)` | function | Replaces the list (used by the persistence plugin) |

**Task shape:**

```ts
interface Task {
  id: number
  title: string
  completed: boolean
  createdAt: Date
}
```

---

### localStorage Persistence — `persist-tasks.client.ts`

The `.client.ts` suffix tells Nuxt to only load this plugin in the browser — it never runs during SSR, so there are no `window is not defined` errors.

**On startup:** reads `task-dashboard:tasks` from `localStorage`, parses the JSON, converts `createdAt` strings back to `Date` objects, and calls `seedTasks()` to hydrate the store before the first render.

**On every change:** a deep `watch` on `tasks` serialises the array to JSON and writes it back to `localStorage`.

**On corrupted data:** a `try/catch` clears the bad key and starts fresh rather than crashing.

```
Browser starts
      │
      ▼
Plugin reads localStorage
      │
      ├─ data found → seedTasks() → store hydrated
      └─ no data / bad JSON → store stays empty
      │
      ▼
User interacts (add / toggle / delete)
      │
      ▼
watch(tasks) fires → localStorage.setItem(...)
```

---

### Components

#### `AppHeader.vue`
Sticky top navigation bar. Uses `<NuxtLink>` with `exact-active-class` / `active-class` to highlight the current route. Contains the dark mode toggle button which calls `useColorMode()` from `@nuxtjs/color-mode`.

#### `TaskInput.vue`
Controlled input with local `ref` for the value and error message. Emits an `add` event with the trimmed title. Validates on both button click and `Enter` keydown. Rejects empty/whitespace-only input with an inline error message.

#### `TaskItem.vue`
Renders a single task row. Receives a `Task` prop and emits `toggle` and `delete` events up to the parent. Applies `task-item--done` class when `task.completed` is true, which triggers strikethrough styling and reduced opacity.

#### `TaskList.vue`
Wraps `TaskItem` components in a `<TransitionGroup>` for animated additions and removals. Shows an empty state message when the list is empty, wrapped in a `<Transition>` for a fade effect.

#### `SummaryCard.vue`
Purely presentational. Accepts `icon`, `value`, and `label` props and renders a styled stat card. Used three times on the Dashboard page.

#### `ProgressBar.vue`
Accepts a `percentage` prop (0–100) and renders a CSS bar with a `width` transition. Includes proper `role="progressbar"` and `aria-valuenow` attributes for accessibility.

---

### Pages

#### Dashboard (`pages/index.vue`)
Calls `useTasks()` to read `tasks`, `completedCount`, and `pendingCount`. Computes `percentage` locally. Renders three `SummaryCard` components and a `ProgressBar`. All values update reactively in real time as tasks are modified on the Tasks page — no prop drilling or event bus needed because both pages share the same composable instance.

#### Tasks (`pages/tasks.vue`)
The main interactive page. Contains:
- **Filter tabs** — All / Active / Completed, implemented as a local `activeFilter` ref that drives a `computed` `filteredTasks` array
- **`TaskInput`** — emits `add` events handled by `handleAdd()`
- **`TaskList`** — receives `filteredTasks`, emits `toggle` and `delete` up to the page which forwards them to the composable

#### About (`pages/about.vue`)
Static page. No reactive state. Renders the tech stack and feature list from plain arrays defined in `<script setup>`.

---

### Dark Mode

Powered by `@nuxtjs/color-mode`. Configured with `classSuffix: ''` in `nuxt.config.ts`, which means the module adds the class `dark` (not `dark-mode`) to the `<html>` element when dark mode is active.

All colours are defined as CSS custom properties in `assets/css/main.css`:

```css
:root       { --bg: #f7f8fc; --surface: #ffffff; ... }  /* light */
.dark       { --bg: #0f1117; --surface: #1a1d27; ... }  /* dark  */
```

Every component uses `var(--bg)`, `var(--text)`, etc., so switching the class on `<html>` instantly re-themes the entire app. The user's preference is stored in a cookie by the module and restored on the next visit.

---

### Styling

No CSS framework is used. All styles are written in scoped `<style scoped>` blocks inside each component, plus the global `assets/css/main.css` for the reset and design tokens.

Animations use Vue's built-in `<Transition>` and `<TransitionGroup>` components:
- **Task added** — slides in from above with a fade
- **Task deleted** — slides out to the right with a fade
- **Empty state** — fades in/out
- **Error banner** — fades in/out
- **Progress bar fill** — CSS `transition: width 0.4s ease`

---

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server with HMR at `localhost:3000` |
| `pnpm build` | Build for production (outputs to `.output/`) |
| `pnpm preview` | Preview the production build locally |
| `pnpm postinstall` | Runs `nuxt prepare` to regenerate `.nuxt/` types |
# tms-vue
