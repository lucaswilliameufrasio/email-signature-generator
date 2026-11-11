---
tags: [skill-creator, cli]
max_turns: 12
timeout_seconds: 180
allowed_tools: [Read, Glob, Grep, Skill]
---

Inspect the provided project fixture under `files/project`. It is a terminal
application with documented commands and existing tests, no web UI, and no
browser automation dependency. The target agent harness is OpenCode. Make a
project-local skill that lets a future agent verify the top user workflows. Do
not add packages or run the commands now. Inspect the repository's agent
instructions and identify what the skill can truthfully specify versus what
still needs a real execution.
