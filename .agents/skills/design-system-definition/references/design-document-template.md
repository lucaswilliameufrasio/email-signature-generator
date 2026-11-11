# Design document template

Adapt headings to the repository's language and documentation style. Keep every
section; write "not applicable" with a reason rather than deleting one.

```markdown
# <Product> design system

Status: <draft | approved on YYYY-MM-DD by …> · Decision: <link to decision record>

## 1. Purpose and audience
What the product is for, who uses it, where, and the first job to understand.

## 2. Audit summary
What is kept, what is removed, and why the previous direction failed.

## 3. Concept and principles
Concept phrase and why it fits the brand and purpose.
Principles as testable rules with "so we never …".

## 4. Tokens
### Color
| Token | Value | Role | Contrast on <surface> |
### Typography
| Style | Size / line height | Weight | Use |
### Space, layout, shape, depth
Scale, grid/breakpoints (or terminal columns), radii, borders, elevation.
### Motion
| Type | Duration | Easing | Reduced-motion behavior |

## 5. Iconography, imagery, and content honesty
Icon set and sizes; image sources allowed; missing-image behavior.

## 6. Voice and microcopy
Tone, vocabulary table, message patterns for empty, loading, error, success.

## 7. Components
For each: anatomy, variants, sizes, states (default, hover, focus, pressed,
selected, disabled, loading, empty, error, read-only), accessibility notes.

## 8. Screen patterns
Layouts for the main screen types and where each component appears.

## 9. Engagement patterns and ethics
Supported loops with their limits; prohibited patterns.

## 10. Platform adaptations
Web / mobile / desktop / terminal mapping of the foundations.

## 11. Directives
D1. MUST …
D2. MUST NOT …
(numbered, checkable, each traceable to a principle or audit finding)

## 12. Anti-patterns
What was observed, why it is banned, what to do instead.

## 13. Pre-delivery checklist
- [ ] Tokens only; no raw values in components
- [ ] Contrast measured for new text/surface pairs
- [ ] Every state designed, including empty and error
- [ ] Keyboard/focus and accessible names
- [ ] Reduced motion respected
- [ ] Real content only; honest empty states
- [ ] Checked at the documented sizes with screenshots

## 14. Research sources
| Source | What it informed | Consulted on |

## 15. Change log
| Date | Change | Decision |
```
