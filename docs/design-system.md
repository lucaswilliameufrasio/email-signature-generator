# Email Signature Generator design system

Status: approved on 2026-11-10 by the project owner (tabs + pinned preview, guidance-based defaults, accent #2c55d0) · Decisions: [ADR 0003](adr/0003-editor-layout-tabs-and-pinned-preview.md)

## 1. Purpose and audience

A browser tool that lets one person build a professional email signature and take it to their email client (image or HTML) in minutes. Users are mostly non-designers (professionals, small business owners, someone setting up a team) on a desktop, sometimes finishing on a phone. The first job to understand within seconds: **type your details on the left, see the signature on the right, export it.**

## 2. Audit summary

Before screenshots: `docs/design/before/` (desktop 1440×900 light/dark, mobile 390×844, plus full-page captures).

Keep:
- Live preview that reacts to every change.
- Native, labeled form controls (accessible by default).
- Light/dark site theme and pt-BR/en language.

Problems (with the heuristic or measurement each violates):

| # | Finding | Evidence | Violates |
|---|---|---|---|
| A1 | On phones the preview sits below ~3,400px of controls; users edit blind. | `before/mobile-light-full.png` (390×3446) | Visibility of system status |
| A2 | Export actions sit at the bottom of a ~1,700px panel; the primary outcome is out of sight and far from the preview. | `before/desktop-light-full.png` | Visibility; Fitts's law (distance) |
| A3 | ~55 controls in one undifferentiated scroll; basic fields and fine-tuning (letter spacing, indent, nudges) carry equal weight. | panel inventory | Aesthetic and minimalist design; Hick's law; progressive disclosure |
| A4 | Default signature is 46px name / 22px text and ~740px wide. Industry guidance: body 11–13pt, name not oversized next to a 14–16px email body, max width 600px (450px safer). | preview capture; Exclaimer, signature.email | Match with real-world use |
| A5 | Unstyled native widgets with competing colors (browser-blue sliders, navy buttons, green palette swatches); color inputs render as a thin line. | `before/desktop-light.png` | Consistency; recognition |
| A6 | Status messages appear at the bottom of the panel, away from the action that caused them. | panel | Visibility of status |
| A7 | Spacing glitches: checkbox glued to the next label, uneven field gaps. | `before/desktop-light.png` | Aesthetic design |
| A8 | Preview has no email context (where the signature will live) and no width feedback. | preview | Match with real-world use |

## 3. Concept and principles

**Concept: "Quiet workbench, signature on stage."** The editor is a calm, neutral instrument; the only colorful thing on screen is the user's signature, shown the way it will appear at the bottom of an email.

Principles:

1. **Never edit blind.** The preview stays visible while any control changes, on every screen size, so we never place the preview below the controls on phones.
2. **Essentials first, fine-tuning on demand.** Each section shows the controls most people need; fine-tuning sits behind one "Fine-tune" disclosure (max two levels), so we never show letter spacing with the same weight as the name field.
3. **One accent, for action and selection only.** Chrome is neutral gray; the accent marks the primary action, the selected tab and focus, so we never compete with the signature's own colors.
4. **The outcome lives next to the work.** Export and copy sit in the preview toolbar with their status next to them, so we never send users to the bottom of a long panel to finish.
5. **Honest defaults.** Defaults follow email-signature guidance (readable sizes, ≤600px width) and the preview shows real measurements, so we never ship a default that breaks in Outlook or looks oversized in a real email.

## 4. Tokens

### Color

Light (`:root`):

| Token | Value | Role | Contrast |
|---|---|---|---|
| `--bg` | `#f6f7f9` | App background | — |
| `--surface` | `#ffffff` | Panels, cards, inputs | — |
| `--surface-2` | `#f0f2f5` | Subtle fills, tab track, hover | — |
| `--border` | `#e2e5ea` | Dividers between regions (decorative) | — |
| `--border-strong` | `#8b93a1` | Input/control outlines | 3.09:1 on surface |
| `--text` | `#15171c` | Primary text | 17.93:1 surface, 16.73:1 bg |
| `--text-2` | `#454b57` | Labels, secondary text | 8.76:1 surface |
| `--text-3` | `#5f6673` | Hints, captions | 5.78:1 surface, 5.15:1 surface-2 |
| `--accent` | `#2c55d0` | Primary action, selection, focus, links | 6.33:1 surface |
| `--accent-hover` | `#2347b3` | Hover/pressed of accent | — |
| `--on-accent` | `#ffffff` | Text on accent | 6.33:1 |
| `--accent-soft` | `#e8eefc` | Selected tab/segment background | accent on it 5.45:1 |
| `--success` | `#147a4a` | Success status | 5.37:1 surface |
| `--warning` | `#8a5200` | Warning status | 6.39:1 surface |
| `--error` | `#b8322a` | Error status | 5.95:1 surface |

Dark (`[data-theme="dark"]`):

| Token | Value | Contrast |
|---|---|---|
| `--bg` | `#0d0f13` | — |
| `--surface` | `#15181e` | — |
| `--surface-2` | `#1c2028` | — |
| `--border` | `#2a2f39` | — |
| `--border-strong` | `#6b7383` | 3.73:1 on surface |
| `--text` | `#eceef2` | 15.30:1 surface |
| `--text-2` | `#b7bdc8` | 9.42:1 surface |
| `--text-3` | `#959cab` | 6.45:1 surface, 5.92:1 surface-2 |
| `--accent` | `#86a2ff` | 7.30:1 surface |
| `--accent-hover` | `#a1b7ff` | — |
| `--on-accent` | `#0d0f13` | 7.88:1 on accent |
| `--accent-soft` | `#1d2747` | accent on it 6.02:1 |
| `--success` | `#4fc58d` | 8.21:1 |
| `--warning` | `#f2b35e` | 9.64:1 |
| `--error` | `#ff8f86` | 8.06:1 |

Every text pair meets WCAG 2.2 AA (≥4.5:1); control outlines meet the 3:1 non-text contrast rule. Status is never conveyed by color alone (icon or text accompanies it).

The signature preview keeps the user's own colors in both themes; the theme never recolors the signature.

### Typography

One family: the system UI stack (`system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`). No web font is loaded (no new dependency, instant first paint, native rendering per OS).

| Style | Size / line height | Weight | Use |
|---|---|---|---|
| Title | 16px / 1.3 | 650 | App name in the header |
| Section | 14px / 1.4 | 600 | Section titles inside a tab |
| Body | 14px / 1.45 | 400 | Inputs, buttons, text |
| Label | 13px / 1.35 | 500 | Field labels |
| Caption | 12px / 1.4 | 400 | Hints, value readouts (tabular numbers) |

Value readouts (px, %) use `font-variant-numeric: tabular-nums` so numbers do not jitter while sliding.

### Space, layout, shape, depth

- Spacing scale (px): 4, 8, 12, 16, 20, 24, 32.
- Radii: 6px controls, 10px cards/panels, 999px pills (segmented controls).
- Borders: 1px. Elevation: one shadow for floating layers only (dialogs, toasts): `0 8px 30px rgb(0 0 0 / .18)`.
- Breakpoints: `< 960px` stacked (pinned preview on top), `≥ 960px` two columns (editor 420px + preview), `≥ 1440px` editor 460px.
- Targets: interactive controls at least 32px tall on desktop and 40px on touch layouts; at least 8px between adjacent targets.

### Motion

| Type | Duration | Easing | Reduced motion |
|---|---|---|---|
| Hover/press feedback | 120ms | ease-out | instant |
| Disclosure open/close | 160ms | ease-out | instant |
| Toast enter / exit | 180ms / 120ms | ease-out / ease-in | fade only, no slide |

## 5. Iconography, imagery, and content honesty

- Icons: inline SVG, 16px on a 24 grid, 1.75px stroke, `currentColor`, one outline style. Every icon-only button has an accessible name. No emoji as interface icons.
- Imagery: only the user's own logos. The default placeholder logo stays clearly generic ("Sua Marca").
- The email context frame around the preview uses neutral placeholder bars, not invented text, names or messages.

## 6. Voice and microcopy

- Tone: direct, friendly, second person; short verbs on buttons ("Baixar imagem", "Copiar HTML").
- Same word for the same thing: "assinatura", "logo", "área", "barra divisória", "destaque".
- Status: success states say what happened and what is next ("Imagem baixada (PNG, 2x, 18 KB)."). Errors say what failed and how to recover. No urgency, guilt or blame.

## 7. Components

| Component | Anatomy | States |
|---|---|---|
| Header | App name, language select, theme segmented control | focus |
| Section tabs | Tablist (Conteúdo, Logos, Texto, Layout e cores) with icon + label | default, hover, selected (accent-soft + accent text + indicator), focus; arrow-key navigation |
| Field | Label, control, optional hint/error | default, hover, focus (2px accent ring), disabled (50% opacity, not-allowed), invalid (error border + message) |
| Slider field | Label + tabular value readout, styled range (`accent-color`) | as field |
| Color field | Swatch button (native color picker) + hex readout + usage hint | as field |
| Segmented control | Pill track with options | selected, focus, disabled |
| Disclosure | `<details>` with caret summary "Ajuste fino" | open/closed, focus |
| Button | primary (accent), secondary (surface + strong border), ghost (text), small | hover, pressed, focus, disabled, busy |
| Preview stage | Toolbar (email background light/dark, dimensions readout with ≤600px check), email frame, signature | width warning when >600px |
| Export bar | Format, scale/quality (contextual), Download, Copy HTML, more (Download HTML) | busy, success/error status inline |
| Dialog | Title, body, actions | focus trapped (native `<dialog>`), Escape closes |
| Status | Inline live region next to export actions | success, warning, error with icon |

## 8. Screen patterns

- **Desktop (≥960px):** header row; left column = tabs + tab panel (scrolls independently); right column = sticky preview stage with toolbar and export bar.
- **Phone (<960px):** header; preview pinned at the top (scaled down to fit the width, real size kept for export); tabs pinned right below it; tab panel scrolls under them; export bar pinned at the bottom of the screen.

## 9. Engagement patterns and ethics

The only loop is "come back and your signature is still here" (autosave in the browser). Prohibited: sign-up walls, upsells, watermarks, fake urgency, tracking.

## 10. Platform adaptations

Web only. Respects `prefers-color-scheme`, `prefers-reduced-motion`, user font size (rem-based type), and keyboard navigation.

## 11. Directives

- D1. MUST keep the signature preview visible while editing at every documented size (P1, A1).
- D2. MUST place export and copy actions and their status in the preview area (P4, A2, A6).
- D3. MUST group controls into tabs; each tab shows essentials and places fine-tuning inside one "Ajuste fino" disclosure (P2, A3).
- D4. MUST use tokens only; no raw colors in component CSS (P3, A5).
- D5. MUST use the accent only for primary actions, selection and focus (P3).
- D6. MUST show the signature's rendered width and warn above 600px (P5, A4, A8).
- D7. MUST give every control a visible label and every icon-only button an accessible name.
- D8. MUST show a visible 2px focus ring on every interactive element.
- D9. MUST NOT recolor the signature with the site theme.
- D10. MUST NOT animate when `prefers-reduced-motion: reduce`.
- D11. MUST keep all existing element ids used by tests and the saved-state format.

## 12. Anti-patterns

| Observed | Why banned | Instead |
|---|---|---|
| Preview below all controls on phones | Users cannot see the effect of changes | Pinned, scaled preview on top |
| Primary action at the end of a long scroll | Outcome hidden, long pointer travel | Export bar in the preview stage |
| Every option at the same level | Overwhelms novices, slows experts | Tabs + "Ajuste fino" disclosure |
| Browser-default sliders and color inputs | Inconsistent accents, broken swatch rendering | Styled controls via `accent-color` and swatch buttons |
| Oversized defaults (46px names) | Looks unprofessional inside a real email | Guidance-based defaults |

## 13. Pre-delivery checklist

- [x] Tokens only; no raw values in component rules (email-frame backgrounds are simulated client colors, kept as tokens `--email-*`)
- [x] Contrast recomputed for any new pair (rendered-page check: no label, hint, tab or button text below 4.5:1 in light or dark)
- [x] Every state: hover, focus, disabled, invalid, busy, empty logo, long names
- [x] Keyboard: tabs with arrows/Home/End, dialogs with Escape, visible focus
- [x] Reduced motion respected (`--motion-*` set to 0ms)
- [x] Screenshots at 1440×900 and 390×844, light and dark, in `docs/design/after/`, compared with `docs/design/before/`
- [x] Full test suite green; saved signatures from before still load (saved values are kept; only new defaults changed)

## 14. Research sources

| Source | What it informed | Consulted on |
|---|---|---|
| [NN/g: Accordions on Desktop](https://www.nngroup.com/articles/accordions-on-desktop/) | When to collapse content; signifiers; allow multiple open; keep essentials visible | 2026-11-10 |
| [NN/g: Progressive Disclosure](https://nngroup.com/articles/progressive-disclosure/) | Essentials first, advanced on demand, at most two levels | 2026-11-10 |
| [Exclaimer: Using the right email signature size](https://exclaimer.com/en/email-signature-handbook/using-the-right-email-signature-size/) | 600px max (450px safer), 320px mobile, 11–13pt text, logo ~200×100, images < 50 KB | 2026-11-10 |
| [Exclaimer: 17 dos and don'ts](https://exclaimer.com/email-signature-handbook/the-17-email-signature-dos-and-donts) | Signature hierarchy and restraint | 2026-11-10 |
| [HubSpot Email Signature Generator](https://www.hubspot.com/email-signature-generator) | Category pattern: editor split into tabs (details, images, template, styling) with copy as the final action | 2026-11-10 |
| [Figma Help: Navigating UI3](https://help.figma.com/hc/articles/23954856027159) | Inspector grouped by workflow sections; context-sensitive sections | 2026-11-10 |
| [Best email signature generators 2026 roundups](https://hostadvice.com/blog/digital-marketing/email-marketing/best-email-signature-generators/) | Recurring tools and the importance of output quality across clients (affiliate source, weighed lightly) | 2026-11-10 |
| WCAG 2.2 (contrast 1.4.3, non-text contrast 1.4.11, focus visible 2.4.7, target size 2.5.8) | Contrast and interaction thresholds (general knowledge, values recomputed above) | 2026-11-10 |
| `ui-ux-pro-max` local data | Closest product analog "Resume/CV builder" → Minimalism/Swiss + Flat; form-label, focus and touch-spacing guidelines | 2026-11-10 |

Not researched: user testing with real users of this tool; rendering in every email client version (only guidance consulted).

## 15. Change log

| Date | Change | Decision |
|---|---|---|
| 2026-11-10 | First definition, from audit and research; approved by the owner | ADR 0003 |
| 2026-11-10 | Implemented. On phones only the preview is pinned at the top and the export bar is pinned at the bottom, after the first capture showed the full stage took ~60% of the screen | ADR 0003 |
| 2026-11-10 | Defaults changed to guidance: name 22px bold, role 14px, details 13px, main logo area 160×49, side 90×76; default signature ~400px wide | Owner decision |
