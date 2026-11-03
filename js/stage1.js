// Stage 1 – Ausgleichsströme: ink in water (the classic), density and heat
// (fast/slow particles). Elastic collisions between equal particles; for
// density and heat a wall that can be pulled away.
// Besides the difference meter a second bar counts in how many ways the
// current state can come about (microstates, W): ordered states are possible
// in few ways, mixed ones in very many – that is why things mix.
(() => {
  'use strict';
  const { $, $$, clamp, rnd, makeView, Meter, text } = Streben;
  const K = THEME.streben;

  const W = 600, H = 600, M = 22, WX = 300, WT = 8, CELL = 16;
  const view = makeView($('#c1'), W, H), ctx = view.ctx;
  const meter = new Meter($('#m1')), ways = new Meter($('#w1'));
  const wallBtn = $('#s1wall'), read = $('#s1read'), hint = $('#s1hint'), status = $('#s1status');
  const tasks = SCAPE.tasks($('#s1tasks'));
  const hideBadge = Streben.firstHint($('#f1'), 's1.badge');
  const GW = Math.ceil(W / CELL), GH = Math.ceil(H / CELL);
  const grid = Array.from({ length: GW * GH }, () => []);
  const INK_CELLS = 4;                 // the glass is cut into 4 × 4 fields for counting the ways
  let mode = 'tinte', P = [], wallOpen = false, wallBottom = H - M, d0 = 1, frac = 1, inkDone = false;

  // ln(n!) table for counting the ways
  const LNF = [0];
  for (let n = 1; n <= 2000; n++) LNF[n] = LNF[n - 1] + Math.log(n);
  const lnChoose = (n, k) => LNF[n] - LNF[k] - LNF[n - k];
  const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const sup = n => String(n).split('').map(d => SUP[+d]).join('');

  const spawn = (n, x0, x1, smin, smax, kind, r, tag = false) => {
    for (let i = 0; i < n; i++) {
      const a = rnd(0, Math.PI * 2), s = rnd(smin, smax);
      P.push({ x: rnd(x0 + r + 2, x1 - r - 2), y: rnd(M + r + 2, H - M - r - 2), vx: Math.cos(a) * s, vy: Math.sin(a) * s, r, kind, tag, px: 0 });
    }
  };
  // a drop of ink: a tight cluster that falls into the water
  const drop = (cx, cy) => {
    cx = clamp(cx, M + 40, W - M - 40); cy = clamp(cy, M + 40, H - M - 40);
    for (const p of P) if (p.kind === 'd') {
      const a = rnd(0, Math.PI * 2), r = Math.sqrt(Math.random()) * 34;
      p.x = cx + Math.cos(a) * r; p.y = cy + Math.sin(a) * r;
      p.vx = rnd(-40, 40); p.vy = rnd(20, 90);
    }
    d0 = Math.max(1e-6, measure()); frac = 1; inkDone = false;
  };

  // how mixed: counts per field (ink) or per half (density, heat)
  const inkCounts = () => {
    const n = new Array(INK_CELLS * INK_CELLS).fill(0), size = (W - 2 * M) / INK_CELLS;
    for (const p of P) if (p.kind === 'd') {
      const i = clamp(((p.x - M) / size) | 0, 0, INK_CELLS - 1), j = clamp(((p.y - M) / size) | 0, 0, INK_CELLS - 1);
      n[j * INK_CELLS + i]++;
    }
    return n;
  };
  // ln W now and at most, W = number of ways (microstates) for the present counts
  const lnWays = () => {
    if (mode === 'tinte') {
      const n = inkCounts(), N = n.reduce((a, b) => a + b, 0), k = n.length;
      let lnW = LNF[N]; for (const c of n) lnW -= LNF[c];
      let lnMax = LNF[N]; for (let i = 0; i < k; i++) lnMax -= LNF[Math.floor(N / k) + (i < N % k ? 1 : 0)];
      return [lnW, lnMax];
    }
    // density: which particles are on the left; heat: where the (formerly) warm ones are
    const set = mode === 'dichte' ? P : P.filter(p => p.tag);
    let l = 0; for (const p of set) if (p.x < WX) l++;
    return [lnChoose(set.length, l), lnChoose(set.length, Math.floor(set.length / 2))];
  };
  const measure = () => {
    if (mode === 'tinte') { const [a, b] = lnWays(); return 1 - a / b; }
    if (mode === 'dichte') {
      let l = 0; for (const p of P) if (p.x < WX) l++;
      return Math.abs(l - (P.length - l)) / P.length;
    }
    let el = 0, nl = 0, er = 0, nr = 0;
    for (const p of P) { const e = p.vx * p.vx + p.vy * p.vy; if (p.x < WX) { el += e; nl++; } else { er += e; nr++; } }
    el /= Math.max(1, nl); er /= Math.max(1, nr);
    return Math.abs(el - er) / (el + er || 1);
  };
  const reset = () => {
    P = [];
    const ink = mode === 'tinte';
    wallOpen = ink; wallBottom = ink ? M : H - M;
    const L0 = M, L1 = WX - WT / 2, R0 = WX + WT / 2, R1 = W - M;
    if (mode === 'tinte') { spawn(320, M, W - M, 60, 110, 'w', 4); spawn(120, M, W - M, 60, 110, 'd', 4); drop(W / 2, 140); }
    if (mode === 'dichte') { spawn(250, L0, L1, 70, 150, 'p', 6); spawn(40, R0, R1, 70, 150, 'p', 6); }
    if (mode === 'waerme') { spawn(130, L0, L1, 210, 270, 'p', 6, true); spawn(130, R0, R1, 35, 70, 'p', 6); }
    d0 = Math.max(1e-6, measure()); frac = 1;
    wallBtn.textContent = t(ink ? 's1.dropAgain' : 's1.wallOpen');
    hint.textContent = t('s1.hints.' + mode);
  };
  const toggleWall = () => {
    hideBadge();
    if (mode === 'tinte') { drop(W / 2, 140); return; }
    // task: put the wall back once the difference shows 1 % or less
    if (wallOpen && Math.round(frac * 100) <= 1 && tasks.done(mode)) taskStatus();
    wallOpen = !wallOpen;
    wallBtn.textContent = t(wallOpen ? 's1.wallClose' : 's1.wallOpen');
  };
  const taskStatus = () => {
    const all = ['tinte', 'dichte', 'waerme'].every(tasks.isDone);
    status.textContent = t(all ? 's1.tasks.all' : 's1.tasks.one');
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

  const IG = 24, inkCv = document.createElement('canvas');
  inkCv.width = inkCv.height = IG;
  const inkCtx = inkCv.getContext('2d'), inkImg = inkCtx.createImageData(IG, IG), dens = new Float32Array(IG * IG);
  const inkRGB = [1, 3, 5].map(i => parseInt(K.ink2.slice(i, i + 2), 16));
  const inkField = () => {
    dens.fill(0);
    const size = (W - 2 * M) / IG;
    for (const p of P) if (p.kind === 'd') {
      // spread each particle over the 5 × 5 neighbouring fields
      const gi = (p.x - M) / size - 0.5, gj = (p.y - M) / size - 0.5, i0 = Math.round(gi), j0 = Math.round(gj);
      for (let j = j0 - 2; j <= j0 + 2; j++) for (let i = i0 - 2; i <= i0 + 2; i++) {
        if (i < 0 || j < 0 || i >= IG || j >= IG) continue;
        dens[j * IG + i] += Math.exp(-((i - gi) ** 2 + (j - gj) ** 2) / 2.6);
      }
    }
    for (let k = 0; k < IG * IG; k++) {
      inkImg.data[k * 4] = inkRGB[0]; inkImg.data[k * 4 + 1] = inkRGB[1]; inkImg.data[k * 4 + 2] = inkRGB[2];
      inkImg.data[k * 4 + 3] = Math.min(220, dens[k] * 34);
    }
    inkCtx.putImageData(inkImg, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(inkCv, M, M, W - 2 * M, H - 2 * M);
  };

  const draw = () => {
    ctx.fillStyle = K.paper; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = K.box[mode]; ctx.fillRect(M, M, W - 2 * M, H - 2 * M);
    if (mode === 'tinte') {
      // the ink as a soft colour field (ink per field of a coarse grid, smoothed), then the particles
      inkField();
      ctx.fillStyle = K.water;
      for (const p of P) if (p.kind === 'w') dot(p.x, p.y, 2.5);
      ctx.fillStyle = K.ink2;
      for (const p of P) if (p.kind === 'd') dot(p.x, p.y, 3);
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
    if (mode !== 'tinte') {
      text(ctx, t('s1.left'), M + 12, M + 28, 16, K.ink);
      text(ctx, t('s1.right'), W - M - 12, M + 28, 16, K.ink, 500, 'right');
    }
  };

  const readout = () => {
    let l = 0, r = 0;
    if (mode === 'tinte') return t('s1.readout.tinte');
    if (mode === 'dichte') {
      for (const p of P) if (p.x < WX) l++;
      return t('s1.readout.dichte', l, P.length - l);
    }
    let nl = 0, nr = 0;
    for (const p of P) { const s = Math.hypot(p.vx, p.vy); if (p.x < WX) { l += s; nl++; } else { r += s; nr++; } }
    return t('s1.readout.waerme', Math.round(l / Math.max(1, nl) / 10), Math.round(r / Math.max(1, nr) / 10));
  };
  // "≈ 10⁶⁶ Arten", small numbers exactly
  const waysLabel = lnW => {
    const e = lnW / Math.LN10;
    if (e < 3) { const n = Math.round(Math.exp(lnW)); return t('s1.waysExact', n); }
    return t('s1.waysPow', sup(Math.floor(e)));
  };

  let readT = 0;
  const frame = dt => {
    if (!view.fit()) return;
    step(dt / 2); step(dt / 2);
    const raw = measure() / d0;
    frac += (Math.min(1, raw) - frac) * Math.min(1, dt * 4);
    meter.set(frac);
    draw();
    readT -= dt;
    if (readT <= 0) {
      readT = 0.25;
      read.textContent = readout();
      const [lnW, lnMax] = lnWays();
      ways.set(lnMax ? lnW / lnMax : 0, waysLabel(lnW));
    }
    // task (ink): wait until the ink is spread evenly
    if (mode === 'tinte' && !inkDone && Math.round(frac * 100) <= 5) { inkDone = true; if (tasks.done('tinte')) taskStatus(); }
  };

  $$('#s1modes .btn').forEach(b => b.addEventListener('click', () => {
    mode = b.dataset.mode;
    $$('#s1modes .btn').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    reset();
  }));
  wallBtn.addEventListener('click', toggleWall);
  $('#s1reset').addEventListener('click', reset);
  view.canvas.addEventListener('pointerdown', e => {
    const p = view.local(e);
    if (mode === 'tinte') { hideBadge(); drop(p.x, p.y); }           // tap: a new drop right there
    else if (Math.abs(p.x - WX) < 60) toggleWall();
  });

  // ---- the little diagram: 4 particles, 2 halves, all 16 ways ------------
  // columns = how many are on the left (4, 3, 2, 1, 0); each mini box = one way
  const DOTS = [K.waysA, K.waysB, K.waysC, K.waysD];
  const mini = mask => {
    const slots = [[9, 9], [21, 9], [9, 21], [21, 21]];
    let li = 0, ri = 0, s = '<svg viewBox="0 0 62 30" aria-hidden="true"><rect x="1" y="1" width="60" height="28" fill="none" stroke="currentColor" stroke-width="2"/><path d="M31 1v28" stroke="currentColor" stroke-width="2"/>';
    for (let k = 0; k < 4; k++) {
      const left = mask & (1 << k), [x, y] = slots[left ? li++ : ri++];
      s += '<circle cx="' + (left ? x : x + 30) + '" cy="' + y + '" r="5" fill="' + DOTS[k] + '"/>';
    }
    return s + '</svg>';
  };
  const cols = [4, 3, 2, 1, 0].map(nl => {
    const masks = [];
    for (let m = 0; m < 16; m++) { let c = 0; for (let k = 0; k < 4; k++) if (m & (1 << k)) c++; if (c === nl) masks.push(m); }
    return '<li class="ways-col' + (nl === 2 ? ' most' : '') + '"><div class="ways-stack">' + masks.map(mini).join('') + '</div>' +
      '<b>' + t('s1.ways.split', nl, 4 - nl) + '</b><span>' + t('s1.waysExact', masks.length) + '</span></li>';
  });
  $('#s1waysChart').innerHTML = cols.join('');

  reset();
  Streben.stages['stufe-1'] = { frame };
})();
