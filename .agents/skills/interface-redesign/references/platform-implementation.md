# Platform implementation notes

Confirm each point against the project's actual stack and current documentation;
these are checks, not framework-specific instructions.

## Web

- **Styled first paint.** In server-rendered or prerendered apps, the initial
  HTML must link or inline the stylesheet and font declarations. Reload with the
  cache disabled and throttled network: there must be no flash of unstyled
  content. Check the built HTML for the stylesheet link; some frameworks only
  emit links for styles imported from components or the document head, not from
  data-loading modules.
- **Fonts.** Few weights, subset by script, `font-display` chosen deliberately,
  fallback metrics close to the web font to avoid layout shift.
- **Layout shift.** Reserve space for images and embeds (aspect ratio or fixed
  size); no content jumps after hydration.
- **Hydration readiness.** If end-to-end tests click before client code is
  active, expose a readiness signal (for example an attribute set after mount)
  and wait for it in tests rather than adding sleeps.
- **Sizes.** At least a 320–390 CSS px phone width and a wide desktop; also an
  intermediate tablet width when layouts change there.
- **Metadata.** Title, description, canonical, Open Graph/Twitter image, theme
  color, favicon and app icons consistent with the new system.
- **Evidence.** Use the project's existing browser automation (Playwright,
  Cypress, or an approved browser tool) to capture full-page and viewport
  screenshots per state.

## Mobile

- Run on simulator/emulator at a small and a large device, light and dark if
  supported, and the largest accessibility text size.
- Check safe areas, keyboard overlap, back navigation, and orientation if
  supported.
- Evidence: platform screenshot tooling or the project's UI test framework.

## Desktop

- Check minimum, default, and maximized window sizes; fractional scaling; system
  light/dark and high-contrast modes; keyboard-only navigation.
- Evidence: screenshots of the real window, captured in an isolated session
  (see a desktop visual QA workflow if available).

## Terminal (TUI)

- Run in a pseudo-terminal at the minimum supported size (often 80×24) and a
  wide size; with truecolor, 256-color, 16-color, and `NO_COLOR`; on light and
  dark backgrounds.
- Confirm glyph fallbacks when the font lacks symbols.
- Evidence: text snapshots of the screen buffer (stable for review and tests)
  plus rendered images when color matters.
