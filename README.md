# SCAPE° — Das Streben nach Gleichgewicht

A browser-only simulation in three stages, each showing the same principle at
a larger scale: **difference → gradient → flow → balance**. A meter above
every simulation always shows how big the difference still is, and a chain
of four steps lights up as the simulation runs.

- **Stage 1 – Teilchenkasten** (`#stufe-1`): a particle box with a wall to
  pull away; three experiments: density, heat (fast and slow particles,
  coloured on the CD temperature scale) and dye in water. Square stage.
- **Stage 2 – Seewind** (`#stufe-2`): a cross-section through sea, coast and
  air with a time-of-day slider, "heat land" / "heat sea" buttons, isobars,
  arrows, smoke and air particles. Stays 3:2 (an inherently wide subject).
- **Stage 3 – Wetterkarte** (`#stufe-3`): paint highs and lows, switch on
  Earth's rotation, switch off the sun. Square stage; "H" blue, "T" red.
- **Vergleich** (`#vergleich`): heat, water, electric current and wind side
  by side – four flows, one principle.

Each stage has tasks with check boxes that unlock its "Merke" box:

| Stage | Tasks (success condition) |
|---|---|
| 1 | In each of the three experiments, open the wall and bring the difference below 10 %. |
| 2 | Start the task and bring the sailing boat to the shore within 30 s; observe land breeze at night (after 21:00, sun on, land at least 2 °C cooler than the sea). |
| 3 | Wind force 6 at the lighthouse; wind circling a strong low (rotation on, a low below −10 hPa); sun off and wait for calm (difference above 20 %, then below 5 %). |

Longer explanations and one sentence on what each model simplifies sit in
collapsible topics below each stage.

## Run

Open `index.html` (double-click works, no build, no server, works offline),
or serve the folder with any static file server / GitHub Pages. Each part can
be opened directly via its hash (e.g. `index.html#stufe-2`).

URL switches for staff:

- `?kiosk` – exhibit mode: back to the start page after 3 minutes without touch.

The app has no staff panel.

## Files

```
index.html          structure only (data-t placeholders for every text)
css/kit.css         shared SCAPE° components (same in every app)
css/app.css         layout of this app
js/view.js          phone/desktop layout switch (loaded in <head>)
js/texts.js         fills the texts from content/
js/brand.js         fills logo and footer line from the theme
js/kit.js           fullscreen button, hint badge, info notes, tasks/Merke, kiosk mode
js/common.js        shared helpers: canvas views, difference meter, chain, canvas text
js/stage1.js        particle box
js/stage2.js        sea breeze cross-section
js/stage3.js        weather map
js/compare.js       the four comparison animations
js/app.js           navigation between the parts and the animation loop
content/texts.de.js every visible text (edit or translate here)
theme/              the design: font, palette, logo, colours (see theme/README.md)
```

## Layout

Sticky header with the numbered stage buttons (1 Prinzip · 2 Seewind ·
3 Wetterkarte · Vergleich) and the view toggle; every part ends with a
"Weiter zu … →" button. Phone: chain and selection, the simulation with its
meter at full width, controls, readout, hint, tasks, Merke, topics. Desktop
(automatic from 1000 px, or via the "Desktop-/Handy-Ansicht" toggle,
remembered for this app only): the simulation on the left, sized to fit the
screen; chain, selection, controls, tasks and Merke on the right. Every
simulation has a fullscreen button; in fullscreen the drawing keeps its shape
and is centred.

## Adapting

Design: `theme/` only – each part has its own colour combination
(`[data-stage="…"]` block at the end of `theme.css`), canvas colours are in
`THEME.streben` (`theme.js`). Texts: `content/texts.de.js` only. Founders
Grotesk is used when installed, otherwise the system fallback.
