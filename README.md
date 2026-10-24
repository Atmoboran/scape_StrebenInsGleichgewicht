# SCAPE° — Das Streben nach Gleichgewicht

A browser-only simulation in three stages, each showing the same principle at
a larger scale: everything strives for balance – nature always evens out
differences. A meter above every simulation always shows how big the
difference still is.

- **Stage 1 – Teilchenkasten** (`#stufe-1`): a particle box with a wall to
  pull away; two experiments: density and heat (fast and slow particles,
  coloured on the CD temperature scale). Below it the info text "Immer
  dasselbe" (heat, water, current, wind – the former comparison screen) and a
  topic on why the particles never sort back (entropy). Square stage.
- **Stage 2 – Seewind** (`#stufe-2`): a cross-section through sea, coast and
  air. Time runs by itself; the time-of-day slider sets it (time pauses
  briefly while the slider is used). Isobars, arrows, smoke and air particles
  are always shown. Stays 3:2 (an inherently wide subject).
- **Stage 3 – Wetterkarte** (`#stufe-3`): one map surface with the coastlines
  of Europe and the North Atlantic as a backdrop (synoptic scale); it starts
  with an Iceland low and an Azores high. Paint highs and lows, switch on
  Earth's rotation; arrows on. Square stage; "H" blue, "T" red.
  "Von oben / Von der Seite": the side view is a west–east cross-section
  (x–z) along one latitude (dashed line on the map, slider "Schnitt bei";
  it jumps to the strongest high or low when switched on). Surfaces of equal
  pressure bulge up over highs and dip over lows; air flows from high to low
  at the ground and back aloft, sinks in the high (sun) and rises in the low
  (clouds, rain when deep). Painting works in both views.

Each stage has tasks behind an "Aufgaben" button (popup, with a progress
count; the button flashes when a task is solved). Solving them unlocks the
"Merke" box:

| Stage | Tasks (success condition) |
|---|---|
| 1 | In both experiments, open the wall and bring the difference below 10 %. |
| 2 | Start the task and bring the sailing boat to the shore within 30 s (time stands still during the task, only the slider moves it); observe land breeze at night (after 21:00, land at least 2 °C cooler than the sea). |
| 3 | Wind force 8 anywhere on the map; wind circling a strong low (rotation on, a low below −10 hPa); paint a strong high or low and wait until it has evened out (difference below 5 %). |

Longer explanations and one sentence on what each model simplifies sit in
collapsible topics below each stage.

## Run

Open `index.html` (double-click works, no build, no server, works offline),
or serve the folder with any static file server / GitHub Pages. Each part can
be opened directly via its hash (e.g. `index.html#stufe-2`).

URL switches for staff:

- `?kiosk` – exhibit mode: back to the start page after 3 minutes without touch.
- `?dev`, Shift+D or the small "Dev-Modus" button in the footer – dev mode:
  stage 2 gets switches for the sun, arrows, isobars, smoke and air particles;
  stage 3 for the sun (keeps creating new highs and lows) and the arrows.
  Leaving dev mode restores the visitor defaults.

## Files

```
index.html          structure only (data-t placeholders for every text)
css/kit.css         shared SCAPE° components (same in every app)
css/app.css         layout of this app
js/view.js          phone/desktop layout switch (loaded in <head>)
js/texts.js         fills the texts from content/
js/brand.js         fills logo and footer line from the theme
js/kit.js           fullscreen button, hint badge, info notes, tasks/Merke, kiosk mode, dev mode
js/common.js        shared helpers: canvas views, difference meter, canvas text
js/stage1.js        particle box
js/stage2.js        sea breeze cross-section
js/stage3.js        weather map
js/app.js           navigation, task popups, dev button, animation loop
content/texts.de.js every visible text (edit or translate here)
theme/              the design: font, palette, logo, colours (see theme/README.md)
```

## Layout

Sticky header with the numbered stage buttons (1 Prinzip · 2 Seewind ·
3 Wetterkarte) and the view toggle; every part ends with a
"Weiter zu … →" button. Phone: selection, the simulation with its
meter at full width, controls, readout, hint, "Aufgaben" button, Merke, topics. Desktop
(automatic from 1000 px, or via the "Desktop-/Handy-Ansicht" toggle,
remembered for this app only): the simulation on the left, sized to fit the
screen; selection, controls, "Aufgaben" button and Merke on the right. Every
simulation has a fullscreen button; in fullscreen the drawing keeps its shape
and is centred.

## Adapting

Design: `theme/` only – each part has its own colour combination
(`[data-stage="…"]` block at the end of `theme.css`), canvas colours are in
`THEME.streben` (`theme.js`). Texts: `content/texts.de.js` only. Founders
Grotesk is used when installed, otherwise the system fallback.
