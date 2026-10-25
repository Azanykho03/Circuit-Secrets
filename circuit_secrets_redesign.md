# CIRCUIT SECRETS

## Interactive 3D Hidden-Object Game --- Interface & Experience Upgrade

**Project:** Circuit Secrets: COMPLAB 2\
**Genre:** Hidden-object investigation / educational puzzle\
**Setting:** CTU Danao's Computer Lab 2 and engineering wing\
**Core idea:** Play as Fiona, a third-year Computer Engineering student.
Search detailed labs for missing components and trace the Circuit Secrets
Protocol through hardware, circuits, network logs, and code.

------------------------------------------------------------------------

## 1. Game Vision

Circuit Secrets is a hidden-object investigation game inspired by the
classic hidden-object format popularized by *Mystery Case Files*.
Instead of searching for ordinary household or story-themed objects,
players investigate computer engineering labs and recover components,
tools, and technical equipment.

The experience should feel like entering a real, slightly mysterious
engineering lab: layered workbenches, shelves, circuit boards, monitors,
cables, drawers, instruments, warning lights, and interactive machinery.
The objects should have a polished **3D appearance** and be readable
against the busy scene.

**Design goal:** Keep the current component-finding gameplay, but make
the interface more atmospheric, tactile, animated, and rewarding.

------------------------------------------------------------------------

## 2. Existing Game Foundation

The current game has ten connected engineering locations. Fiona's
ordinary practical in Computer Lab 2 is interrupted by a warning about
corrupted files, unauthorized access, and the Circuit Secrets Protocol.
After a controlled shutdown, the class files and several components are
missing. The player recovers hardware, reads evidence, solves access
puzzles, and discovers who designed the protocol. Timed searches, scores,
combos, hints, scans, a case file, and an explorable home lab support the
investigation.

Preserve these recognizable mechanics and improve their presentation
rather than replacing the game's identity.

------------------------------------------------------------------------

## 3. Visual Direction

### Atmosphere

-   **Theme:** High-tech campus computer lab with a subtle mystery /
    investigation mood.
-   **Lighting:** Cool monitor glow, soft overhead fluorescent lights,
    small warm status LEDs, and gentle shadows.
-   **Palette:** Deep navy, charcoal, slate, cyan, electric blue, and
    restrained amber/orange for alerts.
-   **Materials:** Brushed metal, matte plastic, glass, rubber cable
    insulation, PCB solder mask, and slightly worn lab surfaces.
-   **Mood:** Curious and immersive, not horror. The lab should look
    used and believable.

### Graphics and depth

-   Build each room as a rich scene with foreground, middle-ground, and
    background layers.
-   Use parallax or subtle camera movement to make the room feel
    dimensional.
-   Add small ambient animations: monitor scan lines, blinking LEDs, fan
    movement, floating dust, waveform activity, and occasional light
    flicker.
-   Use clear silhouettes and controlled contrast so the hidden
    components remain fair to find.
-   Avoid filling every inch with visual noise. Decorative detail should
    support the scene, not obscure the target objects unfairly.

### 3D object style

Use consistent stylized-realistic 3D models with: - Soft but directional
lighting and contact shadows. - Slight bevels on hard edges. - Realistic
material response without excessive reflections. - A consistent camera
angle and scale across objects. - A subtle outline or glow only when an
object is selected, highlighted, or revealed by a hint.

Objects should look like small physical items placed in the lab, not
flat icons pasted onto a background.

------------------------------------------------------------------------

## 4. Main Interface Layout

### A. Top HUD

Keep the player's attention on the scene while showing the essentials in
a compact status bar.

**Left** - Circuit Secrets logo / case emblem. - Current case and room
name (example: `CASE 01 // HARDWARE BAY`).

**Center** - Countdown timer. - Progress: `FOUND 4 / 10`. - A slim
progress bar that fills as components are recovered.

**Right** - Score. - Combo / chain. - Hint charges. - Pause and sound
controls.

Use clear labels and strong number hierarchy. The timer should be
noticeable but not so large that it competes with the scene.

### B. Main Investigation Scene

The room should occupy most of the screen.

Interactive areas may include: - Workbench and soldering station. -
Computer tower and open PC case. - Oscilloscope and bench power
supply. - Component drawers and storage shelves. - Cable bins, tool
racks, and lab notebooks. - Monitor screens with fictional diagnostic
readouts.

On hover or focus, objects can show a small cursor response. On
selection, use a brief visual confirmation and a compact label.

### C. Component Search Dock

Place a clean, readable dock below or beside the scene.

Each target entry should include: - A small 3D thumbnail or rendered
object preview. - The component name. - Found / not-found state. -
Optional category marker (IC, passive, tool, instrument, cable).

When found: - Play a short confirmation animation. - Mark the entry as
recovered. - Keep it visible but visually subdued so players can track
progress.

Make the dock responsive: horizontal cards on wide screens, compact
grid/list on smaller screens.

### D. Investigation Tools

Group the tools in one consistent panel: - **Inspect:** Opens a close-up
view of a selected object. - **Hint:** Reveals a general search area,
not the exact answer immediately. - **Scan:** Briefly adds a visual scan
effect or identifies an interactive region. - **Power:** Toggles a room
device or activates a scene clue when appropriate. - **Reset View:**
Returns the camera to its default framing.

Tool buttons should have icons, short labels, hover/focus states, and
cooldown or remaining-use indicators where relevant.

------------------------------------------------------------------------

## 5. Core Interactions

### Finding an object

1.  Player reads the target list.
2.  Player searches the lab scene.
3.  Hovering or focusing may gently brighten an interactive object,
    without revealing every hidden item.
4.  Clicking/tapping a target triggers a short selection animation.
5.  The game checks whether the selected object matches a remaining
    target.
6.  Correct find: sound cue, score update, progress update, and
    recovered-item entry.
7.  Incorrect click: small time penalty and a restrained "No match"
    response.

### 3D inspection

When the player presses **Inspect** or selects an inspectable object: -
Bring the object into a centered close-up. - Allow rotate and zoom
controls, with drag-to-rotate on desktop and touch gestures on mobile. -
Show a nameplate and one or two short facts. - Include a **Return to
Lab** control. - Keep the inspection view optional so it does not
interrupt the search flow.

For educational value, include concise labels such as "Resistor ---
limits current" or "Logic analyzer --- observes digital signals." Avoid
long textbook paragraphs during active play.

### Clues and room logic

Objects can be connected to small environmental clues: - A powered
oscilloscope displays a waveform clue. - A drawer label hints at a
component category. - A monitor shows a partial diagnostic message. - A
notebook contains a schematic fragment. - A powered device reveals a new
clickable region.

Use these interactions to make the lab feel like a place to investigate,
not just a static picture.

------------------------------------------------------------------------

## 6. Level and Room Concepts

1.  **Hardware Bay:** Fiona finds a CS-TRAIN tag beside the Lab 2
    shutdown trace.
2.  **Server Room:** The class files are intact in an encrypted snapshot.
3.  **Quantum Core:** A shielded bay contains the isolated backup.
4.  **Signal Vault:** A scheduled classroom command, not a campus outage,
    triggered the warning.
5.  **Fabrication Deck:** The missing components were staged in
    antistatic trays.
6.  **ESD Archive:** A training token accounts for every part.
7.  **Robotics Lab:** An isolated rig reproduces the scripted relay
    trigger without malware.
8.  **Power Systems:** A protected local relay safely disconnected the
    workstations at 09:18.
9.  **Firmware Studio:** Source code generated the simulated error and
    moved the files to a restorable snapshot.
10. **Demo Theater:** Fiona decodes TEST MODE and opens the signed audit.

The exact target lists and coordinates live in `assets.js`.

------------------------------------------------------------------------

## 7. Mystery and Narrative

Give each level a short case-file introduction and a small reveal after
completion.

The animated prologue introduces Fiona, Marie, and Engr. Reyes during a
normal practical. Fiona sees the exact system warning before the
computers shut down. Each search recovers components; its evidence
report reveals one step of the hardware, network, and software trail.
An access puzzle then unlocks the next room. The final audit reveals
that Engr. Reyes and the lab technician built a supervised test of
students' investigation skills. The files and parts are restored.

Keep dialogue short and skippable. The objects and the environment
should tell most of the story.

------------------------------------------------------------------------

## 8. Feedback, Motion, and Sound

### Micro-animations

-   Buttons depress slightly when clicked.
-   Found objects lift or glow briefly.
-   Target cards flip or slide into a recovered state.
-   Progress bar animates smoothly.
-   Hint pulse travels across the relevant area.
-   The room camera eases between default and inspection views.

### Sound design

-   Soft room ambience: fans, ventilation, distant electrical hum.
-   Distinct, quiet confirmation sound for correct finds.
-   Subtle low feedback for incorrect clicks.
-   Short interface sounds for opening panels and changing rooms.
-   Separate volume controls for effects and ambience if feasible.

Include a visible mute toggle and respect the player's sound setting.

### Accessibility

-   Do not rely on color alone to communicate found state.
-   Provide labels and readable text at common screen sizes.
-   Make all essential controls keyboard accessible.
-   Include reduced-motion behavior if possible.
-   Use generous click/tap targets, especially on mobile.
-   Avoid flashing effects and excessive screen shake.

------------------------------------------------------------------------

## 9. Suggested Screen Flow

1.  **Title screen:** Logo, atmospheric lab background, Start
    Investigation, How to Play, Settings.
2.  **Case briefing:** Short transmission, case objective, Begin Search.
3.  **Investigation:** Main scene, HUD, target dock, tools.
4.  **Inspect overlay:** Large 3D object, rotate/zoom, short educational
    note, Return to Lab.
5.  **Pause menu:** Resume, Restart Room, Settings, Return to Title.
6.  **Room cleared:** Score, time remaining, components recovered, hints
    used, Next Room.
7.  **Case closed:** Overall score, completion summary, Play Again.

Keep transitions quick so the player spends most of the time exploring.

------------------------------------------------------------------------

## 10. Implementation Priorities

### Priority 1 --- Make the current game clearer

-   Improve spacing, typography, button hierarchy, and responsive
    layout.
-   Make the target dock easier to scan.
-   Clarify timer, score, found count, and hint availability.
-   Ensure pause, restart, sound, and help controls are easy to
    identify.

### Priority 2 --- Make the lab feel alive

-   Add layered room artwork and ambient animation.
-   Improve object placement, shadows, lighting, and scene depth.
-   Add hover/focus feedback and polished correct/incorrect responses.

### Priority 3 --- Add 3D object interaction

-   Create a reusable 3D object viewer with rotate, zoom, and reset.
-   Use consistent models and materials for components.
-   Add short educational labels and category tags.

### Priority 4 --- Expand the investigation

-   Add clue interactions and room-specific mechanics.
-   Connect all ten locations through Fiona's investigation.
-   Add end-of-room summaries and unlock progression.

### Priority 5 --- Polish and test

-   Test desktop, tablet, and mobile layouts.
-   Check object visibility and difficulty.
-   Verify that targets are clickable and not blocked by overlays.
-   Test keyboard controls, sound toggle, hints, timer, and pause
    behavior.
-   Optimize 3D assets and scene effects for smooth performance.

------------------------------------------------------------------------

## 11. Design Rules

-   **The scene is the star:** Keep the lab large and visually rich.
-   **Search remains fair:** Hidden objects should be challenging, not
    invisible or covered by decoration.
-   **3D should add value:** Use 3D for physical presence and
    inspection, not as visual clutter.
-   **Feedback should be immediate:** Every valid action should clearly
    respond.
-   **Learning stays lightweight:** Give useful engineering facts in
    short, optional moments.
-   **Keep the identity consistent:** Use the Circuit Secrets name,
    technical language, and case-file atmosphere throughout.

------------------------------------------------------------------------

## 12. Ready-to-Use Prompt for a Game UI Redesign

Redesign and improve **Circuit Secrets: COMPLAB 2**, an existing
computer-engineering hidden-object web game. Preserve its core gameplay:
players search computer-lab scenes for a list of engineering components,
use limited hints, manage a timer, earn score and combos, and advance
through ten engineering locations as Fiona, a third-year CTU Danao student.

Create a polished, highly interactive interface inspired by the
atmosphere and layered scene design of classic hidden-object
investigation games, while keeping the visual identity original to
Circuit Secrets. The setting must be a believable computer engineering
laboratory with workbenches, PC hardware, circuit boards, instruments,
tools, component drawers, monitors, cables, and diagnostic equipment.

Use a rich, dimensional visual style: layered backgrounds, realistic
lighting, soft shadows, parallax depth, subtle animated monitors and
LEDs, and detailed **3D-looking objects**. Hidden targets should be
actual 3D models or consistent 3D-rendered assets placed naturally in
the room. Add an optional inspection mode where the player can rotate
and zoom a selected object and read a short engineering description.

Design a clear HUD with case/room title, timer, score, found count,
progress bar, combo, hint count, pause, and sound. Add a polished
component dock with small 3D thumbnails and found states. Include
interactive controls for Inspect, Hint, Scan, Power, and Reset View,
with clear feedback and remaining-use indicators.

Make the experience immersive but readable, responsive on desktop and
mobile, keyboard accessible, and optimized so visual effects do not make
object-finding unfair. Add brief case briefings, environmental clues,
room-clear summaries, and a connected mystery from the Lab 2 shutdown
to the signed Circuit Secrets Protocol audit. Keep the tone curious and
technical, not horror. Use original graphics and interface elements
rather than copying the exact artwork or UI of another game.

**Primary outcome:** A more atmospheric, graphic-rich, interactive
engineering-lab investigation game where discovering and inspecting 3D
computer-engineering objects is the main pleasure.
