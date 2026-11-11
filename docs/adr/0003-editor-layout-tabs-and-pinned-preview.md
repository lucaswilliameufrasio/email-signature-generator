---
status: accepted
date: 2026-11-10
---

# Editor in tabs, preview pinned and holding the export actions

The editor grew to ~55 controls in one scrolling panel. On phones the preview ended up below ~3,400px of controls, and on desktop the export actions sat at the bottom of a ~1,700px panel (see `docs/design-system.md`, audit A1–A3). We will split the editor into four tabs (Conteúdo, Logos, Texto, Layout e cores), keep fine-tuning inside one "Ajuste fino" disclosure per tab, and keep the preview always visible (sticky column on desktop, pinned at the top on phones) with export, copy and their status in the preview toolbar.

## Considered Options

- **Accordion sections in one scroll.** NN/g recommends accordions when users need few independent sections. Here they would still leave export far from the preview and the preview below the controls on phones. Rejected.
- **Step-by-step wizard.** It suits first-time setup, but it slows down people coming back to adjust one thing (autosave makes returning common). Rejected; the tabs keep a natural order (content → logos → text → layout) without forcing it.
- **Floating preview window.** It overlaps controls and hurts phones. Rejected.

## Consequences

- Element ids used by tests and the saved-state format stay unchanged; tests that rely on a control being visible must first open its tab.
- The export bar moves out of the editor panel and into the preview stage.
