# Scan and HUD validation

Completed on 2026-10-25 (Asia/Manila).

## Application changes

- `main.js`: render the existing cyan scan-ring design, select targets from the current level and found set, replace overlapping pulse timers, clean up on restart/completion, and announce scan feedback through the existing status region.
- `index.html`: group Time, Score, Found, Chain, and Overclock while preserving their IDs and live updates.
- `game-polish.css`: center and emphasize the five indicators, retain visible scan markers in both renderers, and adapt the HUD, scan message, and tool controls to narrow or short screens.
- Root-file SHA-256 comparison against the pre-edit snapshot confirms that only these three existing application files changed.

The installed project-local TypeSafe skill and its architecture guidance were consulted. Remaining targets are exact game-state lookups, so no model request, API key, SDK, or new dependency is needed.

## Commands and results

- `node --check main.js` — passed.
- `node --check tmp/qa-scan-hud.cjs` — passed.
- `node tmp/qa-scan-hud.cjs` — passed in headless Chrome using the installed Playwright runtime. Covered the actual intro menu/skip flow, story entry, 3D scanning before and after collection, refreshed scan duration, charge exhaustion, hint coexistence, score/chain/Overclock updates, pause/map gating, restart cleanup, last-component recovery, room results, and puzzle entry. No unexpected JavaScript or console errors.
- The same command checked HUD centering, text clipping, and control separation at 1440×900, 1920×1080, 1024×768, 960×600, 950×600, 768×1024, 640×572, 390×844, 320×568, 844×390, and 568×320. It also tested touch collection and reduced motion with WebGL explicitly unavailable to exercise the SVG fallback.
- `node tmp/qa-scan-hud.cjs --views` — passed after the short-landscape adjustment. Checked the 3D scene at 390×844, 320×568, 844×390, and 568×320; scan messages and all tools fit without overlapping the HUD, inventory, or zoom controls. Rings remained aligned with targets during zoom and pan.
- Visually reviewed desktop, mobile 3D, mobile SVG fallback, and short-landscape screenshots in `tmp/scan-hud-*.png`.

## Validation limits

The project has no configured build, lint, or type-check command. Browser checks used Chrome with touch emulation, not physical mobile devices or other browser engines. The full ten-room campaign and every puzzle solution were not replayed.

The local preview uses the existing `tmp/preview-server.cjs` at http://127.0.0.1:4173/. The QA script's Playwright path intentionally targets this machine's installed runtime; no packages were installed.
