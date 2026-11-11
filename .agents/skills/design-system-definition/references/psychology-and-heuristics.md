# Psychology and heuristics for design decisions

Pick the principles that apply to the product; cite them in the design document
next to the decision they justify. Each engagement pattern needs an ethical
boundary written beside it.

## Perception and trust

| Principle | What it means for decisions |
| --- | --- |
| Aesthetic-usability effect | Polished, consistent interfaces are perceived as easier and more trustworthy. Consistency (one radius, one icon style, one accent) is the cheapest polish. |
| First impression (about 50 ms) | The first viewport decides credibility. It must show the product's real content and purpose, not a generic hero. |
| Visual hierarchy and contrast | One dominant element per view; size, weight, and color establish order. Several equally loud elements read as noise. |
| Gestalt grouping | Proximity and shared containers say "these belong together". Use spacing before borders. |
| Von Restorff (isolation) | The one thing that differs gets noticed: reserve the accent for the primary action and current state. |
| Serial position, peak-end rule | People remember the first, the last, and the best moment. Design the first view and the moment of success (saved, played, finished) carefully. |

## Effort and choice

| Principle | What it means for decisions |
| --- | --- |
| Jakob's law | Users spend most time in other products; follow established conventions for navigation, players, forms, and keyboard shortcuts. |
| Hick's law | Decision time grows with options. Few top-level choices, progressive disclosure for the rest. |
| Fitts's law | Frequent and important targets are large and close; destructive ones are not adjacent to frequent ones. |
| Miller / chunking | Group information into small, labeled sets rather than long undifferentiated lists. |
| Recognition over recall | Show state, history, and options instead of requiring memory. |
| Doherty threshold | Respond in under about 400 ms or show progress; skeletons over spinners for known layouts. |
| Tesler's law | Complexity moves to the system, not the user: sensible defaults, remembered preferences. |

## Motivation and return visits

| Pattern | Healthy use | Ethical boundary |
| --- | --- | --- |
| Hook model (trigger, action, variable reward, investment) | A real reason to return (new edition, new content the user asked for) | No artificial variable rewards, no streak pressure, no notifications without explicit consent |
| IKEA effect / investment | Favorites, notes, ratings, and collections the user builds and owns | Data is exportable and never held hostage; leaving is as easy as joining |
| Goal gradient / progress | Show real progress toward the user's own goal | No fake progress bars or inflated completion |
| Finite selection | A curated, complete set the user can finish | Do not convert to an endless feed to raise time-on-site |
| Social proof | Real, sourced signals only | Never invent counts, reviews, rankings, or "people are viewing" claims |
| Zeigarnik effect | Gentle "continue where you left off" | No guilt copy, no nagging reminders |

## Usability heuristics (Nielsen) as review questions

1. Is system status always visible (loading, saving, playing, offline)?
2. Does the language match the user's vocabulary, consistently?
3. Can the user undo, close, or go back from every state?
4. Is the same thing named, styled, and placed the same way everywhere?
5. Are errors prevented (confirmation for destructive actions, constraints on input)?
6. Are options visible rather than remembered?
7. Do frequent users have accelerators (keyboard, shortcuts, remembered filters)?
8. Is every element on screen earning its place?
9. Do error messages say what happened and what to do next, near the cause?
10. Is help available in context where it is needed?

## Accessibility as a quality floor

- Contrast: 4.5:1 for body text, 3:1 for large text and essential non-text UI.
- Targets: at least 44×44 points (iOS) / 48×48 dp (Android) / 24×24 CSS px
  minimum with comfortable spacing on the web; larger for primary actions.
- Focus is always visible; every control is reachable and operable by keyboard
  (or switch/screen reader on mobile) and has an accessible name.
- Motion respects reduced-motion settings; nothing flashes more than three times
  per second.
- Text scales with user settings without clipping or overlap.
