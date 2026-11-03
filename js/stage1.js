// Stage 1 – Ausgleichsströme: warm & cold (two blocks joined by a channel,
// like the classic "Hot → heat flow → Cold" picture) and ink in water.
// Elastic collisions between equal particles. In warm & cold a gate in the
// channel can be opened; the fast (warm) particles then carry heat across,
// and an arrow "Wärmestrom" shows the flow from warm to cold.
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
  let mode = 'waerme', P = [], wallOpen = false, d0 = 1, frac = 1, inkDone = false;
  // warm & cold: two blocks and the channel between them; the gate sits in the channel at x = WX
  const BL = { x0: M, x1: 236, y0: 96, y1: 504 }, BR = { x0: 364, x1: W - M, y0: 96, y1: 504 };
  const CH = { x0: BL.x1, x1: BR.x0, y0: 236, y1: 364 };
  const GLASS = { x0: M, x1: W - M, y0: M, y1: H - M };
  let gateBottom = CH.y1, keHot = 1, keCold = 0;
  const inBox = (b, x, y, r) => x >= b.x0 + r && x <= b.x1 - r && y >= b.y0 + r && y <= b.y1 - r;
  // where a particle of radius r may be
  const ok = (x, y, r) => mode === 'tinte'
    ? inBox(GLASS, x, y, r)
    : inBox(BL, x, y, r) || inBox(BR, x, y, r) || (x >= CH.x0 - 30 && x <= CH.x1 + 30 && y >= CH.y0 + r && y <= CH.y1 - r);

  // ln(n!) table for counting the ways
  const LNF = [0];
  for (let n = 1; n <= 2000; n++) LNF[n] = LNF[n - 1] + Math.log(n);
  const lnChoose = (n, k) => LNF[n] - LNF[k] - LNF[n - k];
  const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const sup = n => String(n).split('').map(d => SUP[+d]).join('');

  const spawn = (n, b, smin, smax, kind, r, tag = false) => {
    for (let i = 0; i < n; i++) {
      const a = rnd(0, Math.PI * 2), s = rnd(smin, smax);
      P.push({ x: rnd(b.x0 + r + 2, b.x1 - r - 2), y: rnd(b.y0 + r + 2, b.y1 - r - 2), vx: Math.cos(a) * s, vy: Math.sin(a) * s, r, kind, tag, px: 0, py: 0 });
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

  // how mixed: counts per field (ink) or per side (warm & cold)
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
    // warm & cold: where the (formerly) warm particles are
    const set = P.filter(p => p.tag);
    let l = 0; for (const p of set) if (p.x < WX) l++;
    return [lnChoose(set.length, l), lnChoose(set.length, Math.floor(set.length / 2))];
  };
  const measure = () => {
    if (mode === 'tinte') { const [a, b] = lnWays(); return 1 - a / b; }
    let el = 0, nl = 0, er = 0, nr = 0;
    for (const p of P) { const e = p.vx * p.vx + p.vy * p.vy; if (p.x < WX) { el += e; nl++; } else { er += e; nr++; } }
    el /= Math.max(1, nl); er /= Math.max(1, nr);
    return Math.abs(el - er) / (el + er || 1);
  };
  // mean kinetic energy per side → model temperature in °C (warm side 60 °C, cold side 10 °C at the start)
  const sideKE = () => {
    let el = 0, nl = 0, er = 0, nr = 0;
    for (const p of P) { const e = p.vx * p.vx + p.vy * p.vy; if (p.x < WX) { el += e; nl++; } else { er += e; nr++; } }
    return [el / Math.max(1, nl), er / Math.max(1, nr)];
  };
  const celsius = ke => 10 + 50 * (ke - keCold) / (keHot - keCold || 1);
  const reset = () => {
    P = [];
    const ink = mode === 'tinte';
    wallOpen = ink; gateBottom = CH.y1;
    if (ink) { spawn(320, GLASS, 60, 110, 'w', 4); spawn(120, GLASS, 60, 110, 'd', 4); drop(W / 2, 140); }
    else {
      spawn(110, BL, 210, 270, 'p', 6, true); spawn(110, BR, 35, 70, 'p', 6);
      [keHot, keCold] = sideKE();
    }
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
    const all = ['waerme', 'tinte'].every(tasks.isDone);
    status.textContent = t(all ? 's1.tasks.all' : 's1.tasks.one');
  };

  const step = dt => {
    // the gate slides up into the channel roof when opened
    const target = wallOpen ? CH.y0 : CH.y1;
    gateBottom += clamp(target - gateBottom, -400 * dt, 400 * dt);
    const wallOn = mode !== 'tinte' && gateBottom > CH.y0 + 1;
    for (const p of P) {
      p.px = p.x; p.py = p.y;
      p.x += p.vx * dt; p.y += p.vy * dt;
      // bounce off the outline: try undoing x, then y, then both
      if (!ok(p.x, p.y, p.r)) {
        if (ok(p.px, p.y, p.r)) { p.x = p.px; p.vx = -p.vx; }
        else if (ok(p.x, p.py, p.r)) { p.y = p.py; p.vy = -p.vy; }
        else { p.x = p.px; p.y = p.py; p.vx = -p.vx; p.vy = -p.vy; }
        if (!ok(p.x, p.y, p.r)) {   // pushed out by a collision: back into its block
          const b = mode === 'tinte' ? GLASS : p.x < WX ? BL : BR;
          p.x = clamp(p.x, b.x0 + p.r, b.x1 - p.r); p.y = clamp(p.y, b.y0 + p.r, b.y1 - p.r);
        }
      }
      if (wallOn && p.y - p.r < gateBottom && p.y + p.r > CH.y0) {
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
          if (wallOn && (a.x < WX) !== (b.x < WX)) continue;
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

  // a lighter version of a temperature colour for the block fill
  const pale = (rgb, f = 0.55) => 'rgb(' + rgb.match(/\d+/g).map(v => Math.round(+v + (255 - v) * f)).join(',') + ')';
  const OUTLINE = [[BL.x0, BL.y0], [BL.x1, BL.y0], [BL.x1, CH.y0], [BR.x0, CH.y0], [BR.x0, BR.y0], [BR.x1, BR.y0], [BR.x1, BR.y1], [BR.x0, BR.y1], [BR.x0, CH.y1], [BL.x1, CH.y1], [BL.x1, BL.y1], [BL.x0, BL.y1]];

  const drawWarmCold = () => {
    const [kl, kr] = sideKE(), tl = celsius(kl), tr = celsius(kr);
    const col = c => THEME.tempColor((c - 10) / 50 * 0.9 + 0.05);
    // blocks in the colour of their temperature, the channel half and half
    ctx.fillStyle = pale(col(tl)); ctx.fillRect(BL.x0, BL.y0, BL.x1 - BL.x0, BL.y1 - BL.y0); ctx.fillRect(CH.x0, CH.y0, WX - CH.x0, CH.y1 - CH.y0);
    ctx.fillStyle = pale(col(tr)); ctx.fillRect(BR.x0, BR.y0, BR.x1 - BR.x0, BR.y1 - BR.y0); ctx.fillRect(WX, CH.y0, CH.x1 - WX, CH.y1 - CH.y0);
    // heat flow arrow above the channel: from warm to cold, as long as there is a difference and the gate is open
    const d = tl - tr;
    if (wallOpen && Math.abs(d) > 1.5) {
      const len = 40 + Math.min(1, Math.abs(d) / 40) * 70, dir = Math.sign(d), y = CH.y0 - 52;
      ctx.fillStyle = K.ink;
      ctx.beginPath();
      ctx.moveTo(WX - dir * len / 2, y - 14); ctx.lineTo(WX + dir * (len / 2 - 18), y - 14); ctx.lineTo(WX + dir * (len / 2 - 18), y - 24);
      ctx.lineTo(WX + dir * len / 2 + dir * 10, y); ctx.lineTo(WX + dir * (len / 2 - 18), y + 24); ctx.lineTo(WX + dir * (len / 2 - 18), y + 14);
      ctx.lineTo(WX - dir * len / 2, y + 14); ctx.closePath(); ctx.fill();
      text(ctx, t('s1.canvas.flow'), WX, CH.y0 - 14, 13, K.ink, 500, 'center');
    }
    // particles
    ctx.strokeStyle = K.ink; ctx.lineWidth = 1;
    for (const p of P) { ctx.fillStyle = heatColor(p); ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    // the gate
    if (gateBottom > CH.y0 + 1) { ctx.fillStyle = K.ink; ctx.fillRect(WX - WT / 2, CH.y0, WT, gateBottom - CH.y0); }
    // outline of both blocks and the channel
    ctx.strokeStyle = K.ink; ctx.lineWidth = 4; ctx.lineJoin = 'miter';
    ctx.beginPath(); OUTLINE.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.stroke();
    // labels: WARM / KALT (LAUWARM once balanced) and the model temperature
    const lab = (tt, other) => t(Math.abs(tt - other) < 2 ? 's1.canvas.even' : tt > other ? 's1.canvas.warm' : 's1.canvas.cold');
    const lx = (BL.x0 + BL.x1) / 2, rx = (BR.x0 + BR.x1) / 2;
    text(ctx, lab(tl, tr), lx, BL.y0 - 44, 30, K.ink, 300, 'center');
    text(ctx, lab(tr, tl), rx, BR.y0 - 44, 30, K.ink, 300, 'center');
    text(ctx, t('s1.canvas.temp', Math.round(tl)), lx, BL.y0 - 14, 18, K.ink, 500, 'center');
    text(ctx, t('s1.canvas.temp', Math.round(tr)), rx, BR.y0 - 14, 18, K.ink, 500, 'center');
  };

  const draw = () => {
    ctx.fillStyle = K.paper; ctx.fillRect(0, 0, W, H);
    if (mode === 'waerme') { drawWarmCold(); return; }
    ctx.fillStyle = K.box[mode]; ctx.fillRect(M, M, W - 2 * M, H - 2 * M);
    if (mode === 'tinte') {
      // the ink as a soft colour field (ink per field of a coarse grid, smoothed), then the particles
      inkField();
      ctx.fillStyle = K.water;
      for (const p of P) if (p.kind === 'w') dot(p.x, p.y, 2.5);
      ctx.fillStyle = K.ink2;
      for (const p of P) if (p.kind === 'd') dot(p.x, p.y, 3);
    }
    ctx.strokeStyle = K.ink; ctx.lineWidth = 4; ctx.strokeRect(M, M, W - 2 * M, H - 2 * M);
  };

  const readout = () => {
    if (mode === 'tinte') return t('s1.readout.tinte');
    const [kl, kr] = sideKE();
    return t('s1.readout.waerme', Math.round(celsius(kl)), Math.round(celsius(kr)));
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
    else if (Math.abs(p.x - WX) < 70 && p.y > CH.y0 - 20 && p.y < CH.y1 + 20) toggleWall();   // tap the gate
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
