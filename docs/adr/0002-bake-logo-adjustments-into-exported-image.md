---
status: accepted
date: 2026-11-10
---

# Bake logo crop and framing into the exported image

Users will crop, zoom and position logos inside a fixed logo area. Email clients (notably Outlook and Gmail) do not support `object-fit`, `object-position` or absolute positioning, so the adjustments are rendered onto a canvas and exported as a pre-cropped image with fixed dimensions instead of being expressed in CSS. Fine positioning of texts and the divider uses table padding/spacing rather than absolute positioning, so both image and HTML exports stay correct.

Cropping uses Cropper.js as the only new runtime dependency.
