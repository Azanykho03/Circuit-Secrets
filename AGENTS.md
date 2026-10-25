# Circuit Secrets - Project Guidelines

## Scope and preservation

These instructions apply to the Circuit Secrets project rooted beside `index.html`.

- Inspect the relevant existing files before making changes. Treat the current implementation as the source of truth; design documents are context, not authorization to redesign the game.
- Preserve existing gameplay mechanics, UI, 3D assets, animations, audio, story, and functionality unless the user explicitly requests modifications. This includes scoring, timers, hints, scans, puzzles, room progression, and saved statistics.
- Keep changes focused, efficient, maintainable, and compatible with the existing project. Avoid unrelated refactoring, reformatting, asset replacement, or framework migrations.

## Verified architecture and file map

This is a static browser game using HTML, CSS, and plain JavaScript. There is no framework, package manifest, build step, or application backend in the current project. `index.html` loads Three.js 0.186.0 from a CDN through an import map. Rendering combines procedural Three.js scenes with SVG fallbacks; audio uses the Web Audio API, and browser storage retains selected state.

| Files | Responsibility |
| --- | --- |
| `index.html` | Game entry point, screens, overlays, stylesheets, import map, and script loading. |
| `main.js` | Game state, input, scoring, timers, puzzles, navigation, audio, and saved case-file statistics. |
| `assets.js` | Shared `ICONS`, `LEVELS`, SVG scene builders, targets, and room/story data. |
| `ui-icons.js` | Shared `window.CircuitIcons` SVG icon helpers. |
| `prologue.js`, `intro-scene.js` | Intro dialogue/playback and its Three.js scene. |
| `home-3d.js` | Interactive title-screen laboratory and inspection controls. |
| `game-scene-3d.js`, `component-models-3d.js` | Gameplay scene, hit testing, zoom/pan, and reusable component models. |
| `map-world.js`, `map-scene-3d.js` | Map pan/zoom controls and the 3D campus map. |
| `styles.css`, `prologue.css`, `intro-cinematic.css`, `game-polish.css` | Layered styling, responsive layouts, and animation rules. |
| `assets/`, `credits.html` | Artwork, map images, favicon, licenses, and attribution. |
| `cyberpunk-lab-menu.html` | Separate menu page; not the main game entry point. |
| `README.md`, `netlify.toml` | Local serving instructions and static deployment configuration. |
| `tmp/` | Existing local servers, browser QA scripts, screenshots, and logs. |

## Development conventions

- Preserve classic-script order: `assets.js`, `ui-icons.js`, `prologue.js`, `main.js`, then `map-world.js`. Keep the scene scripts as ES modules and retain their import-map resolution and relative imports.
- Preserve shared globals, custom events, DOM IDs/classes, and data attributes used across files. Keep SVG targets, inventory entries, and 3D hit testing synchronized.
- Preserve stylesheet order: `styles.css`, `prologue.css`, `intro-cinematic.css`, then `game-polish.css`. Check the existing cascade before changing a selector; reuse established variables and styles.
- Match nearby code conventions and reuse existing helpers. Retain keyboard/touch controls, focus handling, ARIA state, responsive layouts, reduced-motion behavior, and WebGL fallback paths.
- Respect existing rendering limits, material/geometry reuse, and inactive-scene handling. Avoid unnecessary per-frame work and duplicate listeners or timers; clean up resources introduced by a change.
- Keep relative asset paths and attribution intact. Preserve the static deployment model: Netlify publishes the project root without a build command.
- Do not install unnecessary dependencies or introduce tooling merely to perform a small change.

## Required TypeSafe skill

- For relevant AI integrations and features, read and follow `.agents/skills/typesafe-ai/SKILL.md` before implementation or review. This includes TypeSafe calls, typed questions and state, and replacing prompt-and-parse logic or brittle heuristics with typed judgments.
- Use the installed project-local skill. Do not reinstall it or use Claude Code installation commands. Skill installation does not imply that an SDK, API key, or CLI is configured.
- Do not assume the `jev` terminal command exists. If a task needs it, verify availability separately with `Get-Command jev -ErrorAction SilentlyContinue` in PowerShell before use; do not install it automatically.
- Keep judgments in the model and decisions in code. Keep arithmetic, exact lookups, puzzle rules, and other reliable deterministic logic in code. Do not add AI calls merely because the skill is installed.
- Follow the skill's guidance on clear state, atomic questions, centralized wording/criteria/thresholds, and explicit uncertain or no-match outcomes. Consult the live documentation linked by the skill for current API/SDK syntax; do not guess.
- Keep `TYPESAFE_API_KEY` on the server, never in browser files or public assets. The current static project has no backend; an authorized API integration must account for this before making authenticated requests. Surface API failures as errors rather than valid answers.
- For live API experiments, follow the skill's permission and budget requirements, disclose the data sent and use of `TYPESAFE_API_KEY`, and honor existing authorization within its scope. Test representative, difficult, and negative cases.

## Running and validation

- Serve the project over HTTP for ES modules. From the project root, use `node tmp/preview-server.cjs` or `python -m http.server 4173 --bind 127.0.0.1`, after verifying the chosen runtime is available. Open `http://127.0.0.1:4173/`.
- There is no project-defined npm build, lint, or test command. CDN-loaded Three.js and web fonts need network access for the full presentation.
- For game changes, test affected flows and adjacent interactions in the browser. As relevant, cover intro playback/skip, component collection, scoring/timers, hints/scans, pause/restart, map travel, puzzles, results, and saved statistics. Check console errors, desktop/mobile layouts, keyboard/touch input, and reduced-motion or WebGL fallback behavior when affected.
- Existing QA scripts in `tmp/` reference machine-specific Playwright/library paths. Inspect their prerequisites and current selectors before using them; do not assume they run unchanged or install dependencies automatically.
- For documentation-only work, verify file locations and contents and confirm existing game files remain unchanged. Do not modify runtime files or generate unrelated QA artifacts.
- Report the files changed, checks actually performed, and any validation limitations.
