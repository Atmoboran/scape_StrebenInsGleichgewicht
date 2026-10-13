// Stage 3 – weather map: visitors paint highs and lows; pressure differences
// even out by diffusion, wind blows down the gradient and is turned to the
// right when Earth's rotation is switched on. The sun keeps making new
// differences (lows over land, highs over the sea).
(() => {
  'use strict';
  const { $, $$, clamp, rnd, fmt, makeView, Meter, setChain, text, arrow, beaufort, pressToggle } = Streben;
  const K = THEME.streben, D = THEME.data;

  const W = 600, H = 600, NX = 40, NY = 40, CW = W / NX, CH = H / NY;
  const view = makeView($('#c3'), W, H), ctx = view.ctx;
  const meter = new Meter($('#m3'));
  const read = $('#s3read'), status = $('#s3status');
  const tasks = SCAPE.tasks($('#s3tasks'));
  const hideBadge = Streben.firstHint($('#f3'), 's3.badge');
  let p = new Float32Array(NX * NY), q = new Float32Array(NX * NY);
  const U = new Float32Array(NX * NY), V = new Float32Array(NX * NY);
  let brush = 1, rotOn = false, rot = 0, sunOn = true, showArrows = false;
  let pointer = null, painting = false, sunTimer = 2;
  const events = [];
  const LAND = [[373, 0], [347, 70], [365, 150], [319, 238], [291, 322], [319, 410], [261, 500], [233, 600], [600, 600], [600, 0]];
  const ISLAND = [[87, 420], [127, 392], [157, 430], [139, 488], [99, 480]];
  const LIGHT = { x: 296, y: 322 };
  const newPart = o => { o.x = rnd(0, W); o.y = rnd(0, H); o.life = rnd(1.5, 4); o.trail = []; return o; };
  const parts = Array.from({ length: 450 }, () => newPart({}));
  let stillArmed = false;

  const idx = (i, j) => j * NX + i;
  const inPoly = (poly, x, y) => {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  const isLand = (x, y) => inPoly(LAND, x, y) || inPoly(ISLAND, x, y);
  const addBlob = (cx, cy, amount, sigma = 3) => {
    const gi = cx / CW - 0.5, gj = cy / CH - 0.5, R = Math.ceil(sigma * 3);
    for (let j = Math.max(1, Math.floor(gj - R)); j <= Math.min(NY - 2, Math.ceil(gj + R)); j++)
      for (let i = Math.max(1, Math.floor(gi - R)); i <= Math.min(NX - 2, Math.ceil(gi + R)); i++) {
        const d2 = (i - gi) ** 2 + (j - gj) ** 2;
        const k = idx(i, j);
        p[k] = clamp(p[k] + amount * Math.exp(-d2 / (2 * sigma * sigma)), -32, 32);
      }
  };
  const reset = () => {
    p.fill(0); events.length = 0;
    addBlob(167, 230, 14, 4.5); addBlob(460, 300, -14, 4);
    for (const o of parts) newPart(o);
  };
  const sample = (arr, x, y) => {
    const gx = clamp(x / CW - 0.5, 0, NX - 1.001), gy = clamp(y / CH - 0.5, 0, NY - 1.001);
    const i = gx | 0, j = gy | 0, fx = gx - i, fy = gy - j;
    const a = arr[idx(i, j)], b = arr[idx(i + 1, j)], c = arr[idx(i, j + 1)], d = arr[idx(i + 1, j + 1)];
    return a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + d * fx * fy;
  };

  const update = dt => {
    // the brush
    if (painting && pointer) addBlob(pointer.x, pointer.y, brush * 16 * dt);
    // the sun makes new differences: warm land → low, cool sea → high
    if (sunOn) {
      sunTimer -= dt;
      if (sunTimer <= 0) {
        sunTimer = rnd(2.5, 4.5);
        const x = rnd(80, W - 80), y = rnd(80, H - 80);
        events.push({ x, y, amp: isLand(x, y) ? -9 : 7, left: 3 });
      }
    }
    for (let e = events.length - 1; e >= 0; e--) {
      const ev = events[e];
      const d = Math.min(dt, ev.left); ev.left -= d;
      addBlob(ev.x, ev.y, ev.amp * d / 3, 3.5);
      if (ev.left <= 0) events.splice(e, 1);
    }
    // balance by diffusion; with rotation the air circles the low and fills it more slowly
    const target = rotOn ? 1.22 : 0;
    rot += clamp(target - rot, -1.2 * dt, 1.2 * dt);
    const Dif = (sunOn ? 2.2 : 7) * (0.25 + 0.75 * Math.cos(rot));
    const k = Math.min(0.24, Dif * dt);
    for (let j = 1; j < NY - 1; j++) for (let i = 1; i < NX - 1; i++) {
      const c = idx(i, j);
      q[c] = p[c] + k * (p[c - 1] + p[c + 1] + p[c - NX] + p[c + NX] - 4 * p[c]);
    }
    for (let i = 0; i < NX; i++) { q[idx(i, 0)] = 0; q[idx(i, NY - 1)] = 0; }
    for (let j = 0; j < NY; j++) { q[idx(0, j)] = 0; q[idx(NX - 1, j)] = 0; }
    [p, q] = [q, p];

    // wind: from high to low (−gradient), turned to the right with rotation
    const cr = Math.cos(rot), sr = Math.sin(rot), KW = 4;   // m/s per hPa per grid cell
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
      const gx = (p[idx(Math.min(NX - 1, i + 1), j)] - p[idx(Math.max(0, i - 1), j)]) / 2;
      const gy = (p[idx(i, Math.min(NY - 1, j + 1))] - p[idx(i, Math.max(0, j - 1))]) / 2;
      const ux = -gx * KW, uy = -gy * KW;
      U[idx(i, j)] = cr * ux - sr * uy;
      V[idx(i, j)] = sr * ux + cr * uy;
    }
    for (const o of parts) {
      const u = sample(U, o.x, o.y), v = sample(V, o.x, o.y);
      o.x += u * 9 * dt; o.y += v * 9 * dt; o.life -= dt;
      o.trail.push(o.x, o.y); if (o.trail.length > 16) o.trail.splice(0, 2);
      if (o.life <= 0 || o.x < 0 || o.x > W || o.y < 0 || o.y > H) newPart(o);
    }
  };

  // marching squares: isobar at one pressure level
  const SEG = { 1: [[3, 2]], 2: [[2, 1]], 3: [[3, 1]], 4: [[0, 1]], 5: [[3, 0], [2, 1]], 6: [[0, 2]], 7: [[3, 0]], 8: [[3, 0]], 9: [[0, 2]], 10: [[0, 1], [3, 2]], 11: [[0, 1]], 12: [[3, 1]], 13: [[2, 1]], 14: [[3, 2]] };
  const isobars = level => {
    ctx.beginPath();
    for (let j = 0; j < NY - 1; j++) for (let i = 0; i < NX - 1; i++) {
      const a = p[idx(i, j)], b = p[idx(i + 1, j)], c = p[idx(i + 1, j + 1)], d = p[idx(i, j + 1)];
      const n = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
      const segs = SEG[n]; if (!segs) continue;
      const pt = e => {
        let x, y;
        if (e === 0) { x = i + (level - a) / (b - a); y = j; }
        else if (e === 1) { x = i + 1; y = j + (level - b) / (c - b); }
        else if (e === 2) { x = i + (level - d) / (c - d); y = j + 1; }
        else { x = i; y = j + (level - a) / (d - a); }
        return [(x + 0.5) * CW, (y + 0.5) * CH];
      };
      for (const [e1, e2] of segs) { const [x1, y1] = pt(e1), [x2, y2] = pt(e2); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); }
    }
    ctx.stroke();
  };
  const extrema = () => {
    const out = [];
    for (let j = 2; j < NY - 2; j++) for (let i = 2; i < NX - 2; i++) {
      const v = p[idx(i, j)]; if (Math.abs(v) < 4) continue;
      let isMax = true, isMin = true;
      for (let b = -2; b <= 2 && (isMax || isMin); b++) for (let a = -2; a <= 2; a++) {
        if (!a && !b) continue;
        const w = p[idx(i + a, j + b)];
        if (w >= v) isMax = false;
        if (w <= v) isMin = false;
      }
      if ((isMax && v > 0) || (isMin && v < 0)) out.push({ x: (i + 0.5) * CW, y: (j + 0.5) * CH, v });
    }
    out.sort((a, b) => Math.abs(b.v) - Math.abs(a.v));
    return out.slice(0, 8);
  };
  const poly = (pts, col) => { ctx.fillStyle = col; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fill(); };

  const draw = stats => {
    ctx.fillStyle = K.mapSea; ctx.fillRect(0, 0, W, H);
    poly(LAND, K.mapLand); poly(ISLAND, K.mapLand);
    // isobars every 2 hPa
    ctx.strokeStyle = K.mapIsobar; ctx.lineWidth = 2;
    for (let L = -32; L <= 32; L += 2) { if (L !== 0) isobars(L); }
    // wind trails
    ctx.strokeStyle = K.windTrail; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
    ctx.beginPath();
    for (const o of parts) {
      const tr = o.trail; if (tr.length < 4) continue;
      ctx.moveTo(tr[0], tr[1]); for (let k = 2; k < tr.length; k += 2) ctx.lineTo(tr[k], tr[k + 1]);
    }
    ctx.stroke();
    if (showArrows) {
      for (let j = 2; j < NY; j += 4) for (let i = 2; i < NX; i += 4) {
        const u = U[idx(i, j)], v = V[idx(i, j)], sp = Math.hypot(u, v); if (sp < 0.8) continue;
        const k = Math.min(48, sp * 4) / sp;
        const x = (i + 0.5) * CW, y = (j + 0.5) * CH;
        arrow(ctx, x - u * k / 2, y - v * k / 2, u * k, v * k, K.ink, 2.5, 9);
      }
    }
    // centres of highs (H, blue) and lows (T, red)
    for (const e of stats.ext) {
      const hi = e.v > 0;
      text(ctx, t(hi ? 's3.canvas.high' : 's3.canvas.low'), e.x, e.y + 14, 40, hi ? D.high : D.low, 500, 'center', 'alphabetic', K.paper);
      text(ctx, String(Math.round(1013 + e.v)), e.x, e.y + 32, 13, K.ink, 500, 'center');
    }
    // lighthouse with weather station
    const { x, y } = LIGHT;
    ctx.fillStyle = K.ink; ctx.beginPath(); ctx.moveTo(x - 9, y + 4); ctx.lineTo(x + 9, y + 4); ctx.lineTo(x + 5, y - 30); ctx.lineTo(x - 5, y - 30); ctx.closePath(); ctx.fill();
    ctx.fillStyle = K.lampTop; ctx.fillRect(x - 7, y - 40, 14, 10);
    ctx.fillStyle = K.lampBand; ctx.fillRect(x - 7, y - 16, 14, 6);
    ctx.fillStyle = K.ink; ctx.fillRect(x - 128, y - 22, 108, 34);
    text(ctx, t('s3.canvas.bft', stats.bft), x - 74, y + 2, 20, stats.bft >= 6 ? K.bftStrong : K.paper, 500, 'center');
    // brush preview
    if (pointer) {
      ctx.strokeStyle = brush > 0 ? D.high : D.low; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.arc(pointer.x, pointer.y, 3 * CW * 1.6, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    }
    const lh = Math.max(15, SCAPE.minFont(ctx)) * 1.35;
    text(ctx, t(rotOn ? 's3.canvas.rotOn' : 's3.canvas.rotOff'), 14, 10 + lh, 15, K.ink);
    text(ctx, t(sunOn ? 's3.canvas.sunOn' : 's3.canvas.sunOff'), 14, 10 + 2 * lh, 15, K.ink);
  };

  let readT = 0;
  const frame = dt => {
    if (!view.fit()) return;
    update(dt);
    let mn = Infinity, mx = -Infinity;
    for (let k = 0; k < p.length; k++) { if (p[k] < mn) mn = p[k]; if (p[k] > mx) mx = p[k]; }
    const range = mx - mn;
    const ms = Math.hypot(sample(U, LIGHT.x, LIGHT.y), sample(V, LIGHT.x, LIGHT.y));
    const bft = beaufort(ms);
    const ext = extrema();
    draw({ bft, ext });
    const frac = range / 40;
    meter.set(frac, t('meter.hpa', fmt(range, 0)));
    setChain($('#chain3'), frac < 0.05 ? 3 : 2);
    readT -= dt;
    if (readT <= 0) {
      readT = 0.25;
      read.textContent = t('s3.readout', fmt(ms, 1), bft, fmt(range, 0));
    }
    // tasks
    const tick = key => {
      if (!tasks.done(key)) return;
      const all = ['bft6', 'wirbel', 'still'].every(tasks.isDone);
      status.textContent = t(all ? 's3.tasks.all' : 's3.tasks.one');
    };
    if (bft >= 6) tick('bft6');
    if (rot > 1.1 && ext.some(e => e.v < -10)) tick('wirbel');
    if (!sunOn && frac > 0.2) stillArmed = true;
    if (!sunOn && stillArmed && frac < 0.05) tick('still');
  };

  const cv = view.canvas;
  cv.addEventListener('pointerdown', e => { hideBadge(); cv.setPointerCapture(e.pointerId); pointer = view.local(e); painting = true; e.preventDefault(); });
  cv.addEventListener('pointermove', e => { pointer = view.local(e); });
  const stop = e => { painting = false; if (e.pointerType !== 'mouse') pointer = null; };
  cv.addEventListener('pointerup', stop); cv.addEventListener('pointercancel', stop);
  cv.addEventListener('pointerleave', () => { painting = false; pointer = null; });
  $$('#s3brush .btn').forEach(b => b.addEventListener('click', () => {
    brush = +b.dataset.brush;
    $$('#s3brush .btn').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
  }));
  $('#s3rot').addEventListener('click', e => { rotOn = !rotOn; pressToggle(e.currentTarget, rotOn); });
  $('#s3sun').addEventListener('click', e => { sunOn = !sunOn; stillArmed = false; pressToggle(e.currentTarget, sunOn, ['s3.sunOn', 's3.sunOff']); });
  $('#s3arrows').addEventListener('click', e => { showArrows = !showArrows; pressToggle(e.currentTarget, showArrows); });
  $('#s3reset').addEventListener('click', () => { reset(); p.fill(0); });
  reset();
  Streben.stages['stufe-3'] = { frame };
})();
