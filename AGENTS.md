# Agent instructions

- Stack: Vite + strict TypeScript, plain DOM, no UI framework (`docs/adr/0001-*`).
- Code style: follow `.agents/skills/coding-standards/SKILL.md` (no `null`, no `.forEach()`, descriptive names, braced multi-line `if`, template literals, async/await, `===`, no comments unless asked).
- Interface work: `docs/design-system.md` is the source of truth (tokens, components, directives D1–D11, checklist). Use tokens only; keep the accent for actions, selection and focus.
- Decisions: `docs/adr/`. Read them before changing build, export, logo rendering or editor layout.
- Quality gate before finishing: `npm run check` (typecheck, unit tests, build, end-to-end tests). End-to-end tests open editor tabs through `tests/e2e/helpers.ts` (`reveal`, `openTab`); clipboard assertions use `captureClipboard`.
- Saved signatures live in `localStorage` under `email-signature-generator:state:v1`; keep `parseState` backward compatible.
