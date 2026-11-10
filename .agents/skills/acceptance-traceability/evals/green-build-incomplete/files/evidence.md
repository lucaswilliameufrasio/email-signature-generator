# Delivery evidence

User request: Let a user upload a synthetic image, crop a rectangle, and download
a valid PNG matching the selected dimensions and pixels. Keep it local-only.

Current scope: all three outcomes remain requested. No mobile or billing work.
Current source: dirty checkout based on commit abc123; export handler changed.
CI: build succeeded on abc123 before the export handler changed.
UI run on current checkout: upload preview renders; dragging a rectangle and
clicking crop updates the visible preview from 320x240 to 96x64. Screenshot stored
locally at artifacts/crop.png; not attached here. Export button is visible, but
no download listener/file inspection was run. No PNG was saved or decoded.
