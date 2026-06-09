# Email Signature Generator

![Screenshot](email-signature-generator.png)

A browser-based tool to design, preview, and export email signatures with custom colors, logos, fonts, and layout.

## Features

- Live preview of the signature as you edit
- Custom text (name, role, phone)
- Custom colors: text, divider, accent, and background
- Built-in color palettes for quick styling
- Font family selector (Arial, Trebuchet MS, Segoe UI, Verdana, Tahoma, Georgia, Times New Roman)
- Logo upload via file picker or drag-and-drop (main and secondary)
- Horizontal or stacked logo layout
- Adjustable logo width
- Export formats: PNG, JPG, SVG
- Export resolution scaling (1x, 2x, 3x)
- Copy signature HTML to clipboard
- Download signature as standalone HTML file
- Internationalization: English and Portuguese (Brazilian) — language selector in the panel
- Auto-detects browser language (falls back to pt-BR)

## Usage

1. Fill in your name, role, and phone number
2. Pick a font family
3. Upload logos (optional) and choose layout
4. Adjust colors manually or pick a palette
5. Preview updates in real time
6. Export as PNG, JPG, SVG, or copy/download the HTML

## How to Serve Locally

This is a static single-file application. Serve it with any HTTP server:

### Python 3

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000

### Node.js (via npx)

```bash
npx serve .
```

### VS Code

Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.liveServer) extension, right-click `index.html`, and select **Open with Live Server**.

### Zed

Open the project folder, then in the integrated terminal run:

```bash
npx serve .
```

Or use Zed's built-in HTTP server via the command palette: `zed: open dev server`.

### WebStorm / IntelliJ IDEA

Right-click `index.html` and select **Open in Browser**, or use the built-in **Live Edit** feature (enabled by default for HTML files).

### GitHub Pages

This project is already set up with a GitHub Actions workflow (`.github/workflows/deploy.yaml`) that deploys to GitHub Pages automatically on every push to `main`.

## Tech Stack

- Vanilla HTML, CSS, and JavaScript (no framework, no build step)
- [html-to-image](https://github.com/bubkoo/html-to-image) via esm.sh for PNG export
- Single file — open in a browser and it works
