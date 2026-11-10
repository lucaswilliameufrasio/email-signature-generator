---
tags: [skill-creator, browser]
max_turns: 12
timeout_seconds: 180
allowed_tools: [Read, Glob, Grep, Skill]
---

Inspect the provided project fixture under `files/project`. Create a project-
local agent skill that can verify the main user flows, with a feature map.
The target agent harness is OpenCode. Reuse the project's current setup; do not
install packages, start services, or claim that you ran the app. First inspect
its repository instructions and scripts. Explain what evidence is still needed
to prove the generated skill end to end.
