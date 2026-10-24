// Streben nach Gleichgewicht – navigation between the parts (hash routes
// #start, #stufe-1 … #stufe-3), the task popups, the dev button and the
// animation loop of the visible part.
(() => {
  'use strict';
  const { $$, stages } = Streben;
  const PARTS = ['start', 'stufe-1', 'stufe-2', 'stufe-3'];
  let active = null, current = '';

  const route = () => {
    let id = location.hash.replace('#', '') || 'start';
    if (!PARTS.includes(id)) id = 'start';
    if (id === current) return;
    current = id;
    $$('.part').forEach(s => { s.hidden = s.dataset.stage !== id; });
    $$('.nav a').forEach(a => { if (a.dataset.route === id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    $$('dialog[open]').forEach(d => d.close());
    active = stages[id] || null;
    if (active && active.enter) active.enter();
    window.scrollTo(0, 0);
    window.dispatchEvent(new Event('resize'));   // header height, stage size
  };
  window.addEventListener('hashchange', route);
  route();

  // ---- popups: "Anleitung" (how-to) and "Aufgaben" (tasks) ----------------
  $$('.dlg-open').forEach(btn => {
    const dlg = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', () => { btn.classList.remove('flash'); dlg.showModal(); });
    dlg.addEventListener('click', e => { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });
  });
  // the task button shows the progress ("1/2") and flashes when a task is solved
  $$('.task-open').forEach(btn => {
    const dlg = document.getElementById(btn.getAttribute('aria-controls'));
    const items = $$('li[data-task]', dlg);
    const count = btn.querySelector('.count');
    let shown = 0;
    const update = () => {
      const n = items.filter(li => li.classList.contains('done')).length;
      count.textContent = n + '/' + items.length;
      btn.classList.toggle('all-done', n === items.length);
      if (n > shown && !dlg.open) { btn.classList.remove('flash'); void btn.offsetWidth; btn.classList.add('flash'); }
      shown = n;
    };
    update();
    new MutationObserver(update).observe(dlg, { subtree: true, attributes: true, attributeFilter: ['class'] });
  });

  // ---- dev button in the footer shows its state ----------------------------
  const devState = () => $$('[data-dev-link]').forEach(b => b.setAttribute('aria-pressed', SCAPE.dev ? 'true' : 'false'));
  window.addEventListener('scape:dev', devState);
  devState();

  let last = performance.now();
  const loop = now => {
    const dt = Math.min(1 / 30, (now - last) / 1000);
    last = now;
    if (active && dt > 0) active.frame(dt);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
})();
