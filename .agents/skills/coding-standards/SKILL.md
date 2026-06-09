---
name: coding-standards
description: Coding style preferences for this project.
---

# Coding Standards

When writing or editing code in this project, follow these rules:

1. **No `null`** — use `undefined` or empty string `""` instead.
2. **No `.forEach()`** — use `for...of` loops instead.
3. **No short variable names** — variable names must be at least 3 characters and describe the value (e.g. `fontFamily` not `f`, `palette` not `p`).
4. **No one-line `if`** — always use blocks with `{ }`, even for single statements. Braces go on the same line as the condition.
5. **Use template literals** over string concatenation (e.g. `` `Hello ${name}` `` not `"Hello " + name`).
6. **Use async/await** over `.then()` chains.
7. **Use `===` not `==`.**
8. **No emojis in code or comments.**
9. **Do not add comments** unless the user asks for them.
