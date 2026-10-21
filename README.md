# Personal Command Center · v0.1

A focused, local-first dashboard for personal projects and their next actions. Built with React, TypeScript, and Vite. No backend, sign-in, external services, or AI features.

## Run locally

Requires Node.js 20.19+ or 22.12+ (validated with Node.js 24) and npm.

```sh
npm ci
npm run dev
```

Open the address printed by Vite (normally port 5173). The dev server binds to all interfaces for use in development containers.

```sh
npm test          # interaction tests, including persistence and weekly focus
npm run build    # TypeScript checking and production build
npm run preview  # serve the production build, normally on port 4173
```

## Using the dashboard

- Start with Roundly, Klarevoyant, Ballett Akademie, and Personal Development, each containing sample next actions.
- Add tasks, edit their titles with the pencil button, and check them off. Click a completed checkbox to reopen a task.
- Flag up to three outstanding tasks for **Focus this week**. Unflag a task to make room; completing one removes it from focus.
- Change each project's status with its status dropdown. Filter by status or search project names, categories, and task titles.
- Use Overview, Projects, and Weekly focus to switch views. Project shortcuts open a filtered project view.

All changes save automatically in this browser's `localStorage`, under `personal-command-center:v1`. Data stays on this browser and origin; it is not synced or backed up. Clearing browser storage resets the dashboard to sample data. Storage problems display a warning while the app remains usable for the session. Malformed saved data falls back to sample projects; the next change replaces the saved copy.

## Structure

- `src/App.tsx`: dashboard, navigation, task editor, and interactions
- `src/model.ts`: types, sample projects, persisted-data validation, and loading
- `src/styles.css`: responsive dark interface, using system fonts and local SVG icons
- `src/App.test.tsx`: user interaction tests

Project status is managed independently of task completion; finishing tasks does not automatically change a project's status. No deployment is configured.
