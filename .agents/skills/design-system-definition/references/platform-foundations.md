# Platform foundations

Map every foundation in the design document to each surface the product ships.
Verify current platform guidance at decision time; versions and recommendations
change.

## Web

- Tokens as CSS custom properties; components read tokens, never raw values.
- Typography: self-host or reliably serve a small set of weights; subset by
  script; define fallbacks with similar metrics to limit layout shift.
- First paint must already be styled: critical CSS and font declarations reach
  the browser with the initial HTML in server-rendered and prerendered apps.
- Breakpoints from content, mobile first; no horizontal scroll at 320 CSS px.
- Respect `prefers-reduced-motion`, `prefers-color-scheme` when supporting both
  themes, and user zoom (never disable it).
- Social metadata: title, description, canonical URL, and an Open Graph image
  (1200×630) that is brand-safe and contains no unlicensed third-party artwork.

## Mobile (iOS, Android, cross-platform)

- Follow the platform's navigation model (tab bar / navigation bar, back
  gesture) unless the product has a strong reason not to.
- Touch targets at least 44×44 pt (iOS) or 48×48 dp (Android); spacing between
  adjacent targets.
- Safe areas, notches, home indicators, and keyboard avoidance.
- Dynamic Type / font scale: layouts reflow; nothing clips at the largest size.
- Platform type and icon conventions unless the brand system deliberately
  overrides them; native controls where users expect them.
- Haptics only to confirm meaningful actions.

## Desktop (native or web-wrapped)

- Window behavior: minimum size, resize reflow, multiple windows if relevant.
- Keyboard-first operation: shortcuts following platform conventions, menu bar
  or command palette, visible focus.
- Higher information density than mobile, with hover as enhancement only.
- High DPI / fractional scaling and system theme (light/dark, accent, contrast).
- Native dialogs and file pickers where users expect them.

## Terminal (TUI)

- Color depth tiers: 16-color baseline, 256-color, truecolor. Each semantic
  token gets a value per tier; the palette degrades without losing meaning.
- `NO_COLOR` and monochrome: meaning carried by symbols, weight, position, or
  text as well as color.
- Light and dark terminal backgrounds: test both; avoid assuming black.
- Layout rules in columns and rows: minimum supported size (commonly 80×24),
  behavior when smaller, resize handling.
- Typography is the terminal's font: hierarchy through bold, dim, reverse,
  underline, spacing, and box-drawing characters; confirm glyph support before
  relying on Unicode symbols or Nerd Font icons and provide ASCII fallbacks.
- Keyboard map visible on demand (help line or `?`), consistent bindings,
  conventional quits and cancels.
- Motion limited to spinners/progress with a static fallback for non-interactive
  output and screen readers.
