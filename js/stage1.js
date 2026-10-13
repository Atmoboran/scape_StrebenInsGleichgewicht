// Stage 1 – particle box: density, heat (fast/slow particles) and dye in water.
// Elastic collisions between equal particles, a wall that can be pulled away.
(() => {
  'use strict';
  const { $, $$, clamp, rnd, makeView, Meter, setChain, text } = Streben;
  const K = THEME.streben;

  const W = 600, H = 600, M = 22, WX = 300, WT = 8, CELL = 16;
  const view = makeView($('#c1'), W, H), ctx = view.ctx;
  const meter = new Meter($('#m1'));
  const wallBtn = $('#s1wall'), read = $('#s1read'), hint = $('#s1hint'), status = $('#s1status');
  const tasks = SCAPE.tasks($('#s1tasks'));
  const hideBadge = Streben.firstHint($('#f1'), 's1.badge');
  const GW = Math.ceil(W / CELL), GH = Math.ceil(H / CELL);
  const grid = Array.from({ length: GW * GH }, () => []);
  let mode = 'dichte', P = [], wallOpen = false, wallBottom = H - M, d0 = 1, frac = 1;

  const spawn = (n, x0, x1, smin, smax, kind, r) => {
    for (let i = 0; i < n; i++) {
      const a = rnd(0, Math.PI * 2), s = rnd(smin, smax);
      P.push({ x: rnd(x0 + r + 2, x1 - r - 2), y: rnd(M + r + 2, H - M - r - 2), vx: Math.cos(a) * s, vy: Math.sin(a) * s, r, kind, px: 0 });
    }
  };
  const measure = () => {
    if (mode === 'dichte') {
      let l = 0; for (const p of P) if (p.x < WX) l++;
      return Math.abs(l - (P.length - l)) / P.length;
    }
    if (mode === 'waerme') {
      let el = 0, nl = 0, er = 0, nr = 0;
      for (const p of P) { const e = p.vx * p.vx + p.vy * p.vy; if (p.x < WX) { el += e; nl++; } else { er += e; nr++; } }
      el /= Math.max(1, nl); er /= Math.max(1, nr);
      return Math.abs(el - er) / (el + er || 1);
    }
    let l = 0, n = 0; for (const p of P) if (p.kind === 'd') { n++; if (p.x < WX) l++; }
    return Math.abs(l - (n - l)) / n;
  };
  const reset = () => {
    P = []; wallOpen = false; wallBottom = H - M;
    const L0 = M, L1 = WX - WT / 2, R0 = WX + WT / 2, R1 = W - M;
    if (mode === 'dichte') { spawn(250, L0, L1, 70, 150, 'p', 6); spawn(40, R0, R1, 70, 150, 'p', 6); }
    if (mode === 'waerme') { spawn(130, L0, L1, 210, 270, 'p', 6); spawn(130, R0, R1, 35, 70, 'p', 6); }
    if (mode === 'farbe') { spawn(170, L0, L1, 70, 120, 'w', 5); spawn(170, R0, R1, 70, 120, 'w', 5); spawn(70, L0, L1, 70, 120, 'd', 5); }
    d0 = Math.max(1e-6, measure()); frac = 1;
    wallBtn.textContent = t('s1.wallOpen');
    hint.textContent = t('s1.hints.' + mode);
  };
  const toggleWall = () => {
    hideBadge();
    wallOpen = !wallOpen;
    wallBtn.textContent = t(wallOpen ? 's1.wallClose' : 's1.wallOpen');
  };

  const step = dt => {
    const target = wallOpen ? M : H - M;
    wallBottom += clamp(target - wallBottom, -900 * dt, 900 * dt);
    const wallOn = wallBottom > M + 1;
    for (const p of P) {
      p.px = p.x;
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.x < M + p.r) { p.x = M + p.r; p.vx = Math.abs(p.vx); }
      if (p.x > W - M - p.r) { p.x = W - M - p.r; p.vx = -Math.abs(p.vx); }
      if (p.y < M + p.r) { p.y = M + p.r; p.vy = Math.abs(p.vy); }
      if (p.y > H - M - p.r) { p.y = H - M - p.r; p.vy = -Math.abs(p.vy); }
      if (wallOn && p.y - p.r < wallBottom) {
        const half = WT / 2 + p.r;
        if (p.px < WX && p.x > WX - half) { p.x = WX - half; p.vx = -Math.abs(p.vx); }
        else if (p.px >= WX && p.x < WX + half) { p.x = WX + half; p.vx = Math.abs(p.vx); }
      }
    }
    // collisions between particles (elastic, equal mass)
    for (const c of grid) c.length = 0;
    for (let i = 0; i < P.length; i++) {
      const p = P[i];
      const gx = clamp((p.x / CELL) | 0, 0, GW - 1), gy = clamp((p.y / CELL) | 0, 0, GH - 1);
      grid[gy * GW + gx].push(i);
    }
    for (let i = 0; i < P.length; i++) {
      const a = P[i];
      const gx = clamp((a.x / CELL) | 0, 0, GW - 1), gy = clamp((a.y / CELL) | 0, 0, GH - 1);
      for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
        const cx = gx + ox, cy = gy + oy;
        if (cx < 0 || cy < 0 || cx >= GW || cy >= GH) continue;
        for (const j of grid[cy * GW + cx]) {
          if (j <= i) continue;
          const b = P[j];
          const dx = b.x - a.x, dy = b.y - a.y, rr = a.r + b.r, d2 = dx * dx + dy * dy;
          if (d2 >= rr * rr || d2 === 0) continue;
          // no collisions through the wall
          if (wallOn && (a.x < WX) !== (b.x < WX) && Math.min(a.y, b.y) < wallBottom) continue;
          const d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
          const rel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
          if (rel > 0) { a.vx -= rel * nx; a.vy -= rel * ny; b.vx += rel * nx; b.vy += rel * ny; }
          const push = (rr - d) / 2;
          a.x -= nx * push; a.y -= ny * push; b.x += nx * push; b.y += ny * push;
        }
      }
    }
  };

  // speed → CD temperature scale (slow = cold blue, fast = warm red)
  const heatColor = p => THEME.tempColor((Math.hypot(p.vx, p.vy) - 50) / 180);
  const dot = (x, y, r) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); };

  const draw = () => {
    ctx.fillStyle = K.paper; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = K.box[mode]; ctx.fillRect(M, M, W - 2 * M, H - 2 * M);
    if (mode === 'farbe') {
      ctx.fillStyle = K.dyeCloud;
      for (const p of P) if (p.kind === 'd') dot(p.x, p.y, 30);
      ctx.fillStyle = K.water;
      for (const p of P) if (p.kind === 'w') dot(p.x, p.y, 3);
      ctx.fillStyle = K.dye;
      for (const p of P) if (p.kind === 'd') dot(p.x, p.y, p.r);
    } else if (mode === 'waerme') {
      ctx.strokeStyle = K.ink; ctx.lineWidth = 1;
      for (const p of P) {
        ctx.fillStyle = heatColor(p);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
    } else {
      ctx.fillStyle = K.particle;
      for (const p of P) dot(p.x, p.y, p.r);
    }
    // the wall
    if (wallBottom > M + 1) {
      ctx.fillStyle = K.ink; ctx.fillRect(WX - WT / 2, M, WT, wallBottom - M);
      ctx.fillRect(WX - 16, wallBottom - 6, 32, 6);
    }
    ctx.strokeStyle = K.ink; ctx.lineWidth = 4; ctx.strokeRect(M, M, W - 2 * M, H - 2 * M);
    text(ctx, t('s1.left'), M + 12, M + 28, 16, K.ink);
    text(ctx, t('s1.right'), W - M - 12, M + 28, 16, K.ink, 500, 'right');
  };

  const readout = () => {
    let l = 0, r = 0;
    if (mode === 'dichte') {
      for (const p of P) if (p.x < WX) l++;
      return t('s1.readout.dichte', l, P.length - l);
    }
    if (mode === 'waerme') {
      let nl = 0, nr = 0;
      for (const p of P) { const s = Math.hypot(p.vx, p.vy); if (p.x < WX) { l += s; nl++; } else { r += s; nr++; } }
      return t('s1.readout.waerme', Math.round(l / Math.max(1, nl) / 10), Math.round(r / Math.max(1, nr) / 10));
    }
    for (const p of P) if (p.kind === 'd') { if (p.x < WX) l++; else r++; }
    return t('s1.readout.farbe', l, r);
  };

  let readT = 0;
  const frame = dt => {
    if (!view.fit()) return;
    step(dt / 2); step(dt / 2);
    const raw = measure() / d0;
    frac += (Math.min(1, raw) - frac) * Math.min(1, dt * 4);
    meter.set(frac);
    draw();
    readT -= dt; if (readT <= 0) { read.textContent = readout(); readT = 0.25; }
    setChain($('#chain1'), frac < 0.05 ? 3 : wallOpen ? 2 : 1);
    // task: difference below 10 % with the wall open, in each experiment
    if (wallOpen && frac < 0.1 && tasks.done(mode)) {
      const all = ['dichte', 'waerme', 'farbe'].every(tasks.isDone);
      status.textContent = t(all ? 's1.tasks.all' : 's1.tasks.one');
    }
  };

  $$('#s1modes .btn').forEach(b => b.addEventListener('click', () => {
    mode = b.dataset.mode;
    $$('#s1modes .btn').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    reset();
  }));
  wallBtn.addEventListener('click', toggleWall);
  $('#s1reset').addEventListener('click', reset);
  view.canvas.addEventListener('pointerdown', e => { const p = view.local(e); if (Math.abs(p.x - WX) < 60) toggleWall(); });
  reset();
  Streben.stages['stufe-1'] = { frame };
})();
