# Email Signature Generator

![Screenshot](email-signature-generator.png)

A browser-based tool to design, preview, and export email signatures with custom colors, logos, fonts, and layout.

## Features

- Live preview of the signature as you edit
- Optional text lines (name, role, phone): empty lines are hidden
- Custom colors: text, divider, accent (role) and background, each labeled with where it is used
- Built-in color palettes for quick styling
- Font family selector (Arial, Trebuchet MS, Segoe UI, Verdana, Tahoma, Georgia, Times New Roman)
- Logo upload via file picker or drag-and-drop (main and secondary)
- Horizontal or stacked logo layout
- Adjustable logo width
- Image export: PNG, JPG, WebP and SVG, with 1x/2x/3x scale and quality control for JPG/WebP; the status shows the file size
- Guided "Copy HTML" flow: asks which email client you use and whether your logo is hosted at a public https URL, tests the URL, copies rich HTML and shows paste instructions; without a hosted logo it recommends image export instead
- Download signature as standalone HTML file
- Internationalization: English and Portuguese (Brazilian), auto-detected from the browser (falls back to pt-BR)

## Usage

1. Fill in your name, role, and phone number
2. Pick a font family
3. Upload logos (optional) and choose layout
4. Adjust colors manually or pick a palette
5. Preview updates in real time
6. Export as PNG, JPG, WebP or SVG, or copy/download the HTML

## Development

Requirements: Node.js (version in `.nvmrc`) and npm.

```bash
npm install
npm run dev
```

Then open the URL printed by Vite (usually http://localhost:5173).

### Checks

| Command | What it does |
|---|---|
| `npm run typecheck` | Strict TypeScript check |
| `npm run test` | Unit tests (Vitest) |
| `npm run build` | Production build into `dist/` |
| `npm run test:e2e` | End-to-end tests (Playwright) against the built app |
| `npm run check` | All of the above, in order |

Before the first end-to-end run, install the browser once:

```bash
npx playwright install chromium
```

### Agent skills

Project skills live in `.agents/skills/` (linked into `.claude/skills/` for Claude Code) and are pinned in `skills-lock.json`. They are committed, so a fresh clone already has them. To restore or reinstall them from the lock file:

```bash
npx skills experimental_install
```

### Deployment

The GitHub Actions workflow (`.github/workflows/deploy.yaml`) runs the full check on every pull request and push. Pushes to `main` publish `dist/` to GitHub Pages.

Architecture decisions are recorded in `docs/adr/`.

## Tech Stack

- TypeScript and plain DOM (no UI framework), built with [Vite](https://vite.dev)
- [html-to-image](https://github.com/bubkoo/html-to-image) for PNG export
- [Vitest](https://vitest.dev) and [Playwright](https://playwright.dev) for tests
- Static output, deployed to GitHub Pages
