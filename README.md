# SCAPE° — Das Streben nach Gleichgewicht

A browser-only simulation in three stages, each showing the same principle at
a larger scale: everything strives for balance – nature always evens out
differences. Stage 1 has a difference meter. Stage 2 has a small instrument bar (wind direction, Beaufort as 12 rising
bars, Δp between sea and land); stage 3 is measured by the visitor.

- **Stage 1 – Teilchenkasten** (`#stufe-1`): a particle box with a wall to
  pull away; two experiments: density and heat (fast and slow particles,
  coloured on the CD temperature scale). Below it the info text "Immer
  dasselbe" (heat, water, current, wind – the former comparison screen) and a
  topic on why the particles never sort back (entropy). Square stage.
- **Stage 2 – Seewind** (`#stufe-2`): a cross-section through sea, coast and
  air, with a low ground line so most of the picture is air. Time runs by
  itself; the time-of-day slider sets it (time pauses briefly while the
  slider is used). Isobars, arrows, smoke and air particles are always shown.
  The instrument bar shows wind direction, Beaufort and Δp. Stays 3:2.
- **Stage 3 – Wetterkarte** (`#stufe-3`): one map surface with the coastlines
  of Europe and the North Atlantic as a backdrop (synoptic scale); it starts
  with an Iceland low and an Azores high. Tools: **H** and **T** paint highs
  and lows (each with its own size, H larger by default; pressure rises
  gently while the finger is held down). The **wind vane** places a
  measuring station (wind arrow, m/s, Beaufort, "aus SW") that stays and
  keeps measuring while new highs and lows are painted; drag it to move it,
  tap it to remove it. There is no automatic readout – visitors measure
  themselves. Below the map in one row: view dropdown (from above / from the
  side, with a slider for where to cut), an on/off switch for Earth's
  rotation and a pause button that stops the pressure balance.
  The side view is a west–east cross-section (x–z) along one latitude:
  surfaces of equal pressure bulge up over highs and dip over lows; air flows
  from high to low at the ground and back aloft, sinks in the high (sun) and
  rises in the low (clouds, rain when deep). Square stage; "H" blue, "T" red.

Each stage has an "Anleitung" button (how-to popup with all explanations)
and an "Aufgaben" button (tasks popup, with a progress count; the button
flashes when a task is solved). Solving them unlocks the
"Merke" box:

| Stage | Tasks (success condition) |
|---|---|
| 1 | In both experiments, open the wall and bring the difference below 10 %. |
| 2 | Start the task and bring the sailing boat to the shore within 30 s (time stands still during the task, only the slider moves it); observe land breeze at night (after 21:00, land at least 2 °C cooler than the sea). |
| 3 | Wind force 8 measured with the visitor's own station; wind circling a strong low (rotation on, a low below −10 hPa); paint a strong high or low and wait until it has evened out (difference below 5 %). |

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
  stage 3 for the sun (keeps creating new highs and lows), the arrows and
  the speed of the pressure balance (0.1× – 4×).
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

## Style rule: numbers never move the layout

Changing values use **tabular figures** (every digit the same width,
CSS `font-variant-numeric: tabular-nums`, set in `css/kit.css`) and sit in
boxes of fixed minimum width; changing labels are left-aligned or in boxes
that only grow in large steps. Otherwise the text around a value jumps
whenever the number of digits changes (a "layout shift").

## Layout

Sticky header with the numbered stage buttons (1 Prinzip · 2 Seewind ·
3 Wetterkarte) and the view toggle; every part ends with a
"Weiter zu … →" button. Phone: selection, the simulation with its
meter at full width, controls, "Anleitung" and "Aufgaben" buttons, Merke, topics. Desktop
(automatic from 1000 px, or via the "Desktop-/Handy-Ansicht" toggle,
remembered for this app only): the simulation on the left, sized to fit the
screen; selection, controls, "Anleitung"/"Aufgaben" buttons and Merke on the right. Every
simulation has a fullscreen button; in fullscreen the drawing keeps its shape
and is centred.

## Adapting

Design: `theme/` only – each part has its own colour combination
(`[data-stage="…"]` block at the end of `theme.css`), canvas colours are in
`THEME.streben` (`theme.js`). Texts: `content/texts.de.js` only. Founders
Grotesk is used when installed, otherwise the system fallback.
