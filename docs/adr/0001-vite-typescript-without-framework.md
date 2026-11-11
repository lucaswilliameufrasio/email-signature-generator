---
status: accepted
date: 2026-11-10
---

# Vite + TypeScript without a UI framework

The app grew past what a single `index.html` handles comfortably (logo cropping, per-element fine tuning, persistence, dark theme), and it needed automated tests. We moved to Vite + strict TypeScript with plain DOM code, keeping deployment as static files on GitHub Pages.

## Considered Options

- **Keep a single HTML file with no build.** Rejected: Playwright and Vitest already need Node and `node_modules` in development, so a build adds little on top, while modules and types make the upcoming features safer to change.
- **Svelte (or another framework).** Rejected for now: the state is one signature model that maps to one preview, which a single state object plus a render function handles. Revisit if UI state and component count grow to the point where manual DOM updates become a source of bugs.

## Consequences

- Deploy runs `npm ci`, typecheck, unit and end-to-end tests, then `vite build`; only `dist/` is published.
- Runtime dependencies are bundled from npm instead of loaded from a CDN at runtime.
