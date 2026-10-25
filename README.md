# Circuit Secrets: COMPLAB 2

A browser-based Computer Engineering investigation game set at CTU Danao. Fiona and Marie search the COMPLAB 2 workbench, recover components, and follow evidence through the engineering rooms.

## Run locally

The 3D scenes use ES modules and the Three.js import map, so serve the folder over HTTP rather than opening `index.html` directly:

```powershell
cd "C:\Users\USER\Downloads\Circuit Secrets"
python -m http.server 4173
```

Then open `http://127.0.0.1:4173/`. The game has no build step or package install. The project loads Three.js and its three typefaces from their configured CDNs, so an internet connection is needed for the full 3D experience and web fonts. If WebGL is unavailable, the page retains its SVG scene fallbacks.

## Netlify

This is a static site. Publish the project root with no build command. Keep the relative asset paths intact; the title, credits, favicon, and share-card files are all served from the root. The current deployment URL is `https://effortless-taffy-5a8ada.netlify.app/`.

## Controls

- Click visible components to recover them.
- Scroll over the workbench to zoom; drag empty workbench space to pan without moving component objects.
- Press `R` to scan for remaining components, `H` to request a hint, `P` to pause, and `M` to open the investigation map.
- Open **How to Play** for the complete control list.

## Credits and licensing

See [credits.html](credits.html) for fonts, icons, Three.js, generated sound, and the runtime artwork inventory, including assets whose archival provenance still needs confirmation.
