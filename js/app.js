// Streben nach Gleichgewicht – navigation between the parts (hash routes
// #start, #stufe-1 … #vergleich) and the animation loop of the visible part.
(() => {
  'use strict';
  const { $$, stages } = Streben;
  const PARTS = ['start', 'stufe-1', 'stufe-2', 'stufe-3', 'vergleich'];
  let active = null, current = '';

  const route = () => {
    let id = location.hash.replace('#', '') || 'start';
    if (!PARTS.includes(id)) id = 'start';
    if (id === current) return;
    current = id;
    $$('.part').forEach(s => { s.hidden = s.dataset.stage !== id; });
    $$('.nav a').forEach(a => { if (a.dataset.route === id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    active = stages[id] || null;
    if (active && active.enter) active.enter();
    window.scrollTo(0, 0);
    window.dispatchEvent(new Event('resize'));   // header height, stage size
  };
  window.addEventListener('hashchange', route);
  route();

  let last = performance.now();
  const loop = now => {
    const dt = Math.min(1 / 30, (now - last) / 1000);
    last = now;
    if (active && dt > 0) active.frame(dt);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
})();
