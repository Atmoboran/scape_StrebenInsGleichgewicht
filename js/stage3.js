// Stage 3 – weather map on the synoptic scale (Europe and the North Atlantic).
// Visitors paint highs and lows; pressure differences even out by diffusion,
// wind blows down the gradient and is turned to the right when Earth's
// rotation is switched on. The coastlines are only a backdrop: the map is one
// surface, land and sea behave the same. Dev mode: the sun (keeps making new
// highs and lows) and the arrows can be switched.
(() => {
  'use strict';
  const { $, $$, clamp, rnd, fmt, makeView, Meter, text, arrow, beaufort, pressToggle } = Streben;
  const K = THEME.streben, D = THEME.data;

  const W = 600, H = 600, NX = 40, NY = 40, CW = W / NX, CH = H / NY;
  const view = makeView($('#c3'), W, H), ctx = view.ctx;
  const meter = new Meter($('#m3'));
  const read = $('#s3read'), status = $('#s3status');
  const tasks = SCAPE.tasks($('#s3tasks'));
  const hideBadge = Streben.firstHint($('#f3'), 's3.badge');
  let p = new Float32Array(NX * NY), q = new Float32Array(NX * NY);
  const U = new Float32Array(NX * NY), V = new Float32Array(NX * NY);
  const SUN_DEFAULT = false, ARROWS_DEFAULT = true;
  let brush = 1, rotOn = false, rot = 0, sunOn = SUN_DEFAULT, showArrows = ARROWS_DEFAULT;
  let pointer = null, painting = false, sunTimer = 2, stillArmed = false;
  const events = [];
  const newPart = o => { o.x = rnd(0, W); o.y = rnd(0, H); o.life = rnd(1.5, 4); o.trail = []; return o; };
  const parts = Array.from({ length: 450 }, () => newPart({}));

  // ---- map: 45° W – 27° E, 30° N – 72° N, plate carrée -------------------
  const LON0 = -45, LON1 = 27, LAT0 = 30, LAT1 = 72;
  const px = (lon, lat) => [(lon - LON0) / (LON1 - LON0) * W, (LAT1 - lat) / (LAT1 - LAT0) * H];
  // Simplified coastlines (lon, lat). Open lines run off the map edge.
  const COAST = [
    // North Africa, Mediterranean, Iberia, Atlantic coast, North Sea, Baltic, Scandinavia
    { closed: false, pts: [[-9.8, 29.5], [-9.6, 32], [-6.8, 34], [-5.9, 35.8], [-2, 35.1], [3, 36.8], [10, 37.2], [11, 35], [10, 34], [15, 32], [20, 31], [20, 32.5], [25, 31.8], [28, 31], [29, 29]] },
    { closed: false, pts: [[29, 41], [26.5, 40.3], [26, 40.8], [23, 40.5], [23.5, 38], [22, 36.5], [21, 38], [19.5, 40], [19.5, 42], [16, 43.5], [13.7, 45.6], [12.3, 45.3], [12.5, 44], [14, 42.5], [16, 41.5], [18.5, 40.2], [17, 39], [16, 38], [15.7, 40], [14, 40.8], [12, 41.8], [10.5, 43], [8.8, 44.4], [7, 43.6], [4.5, 43.4], [3, 42.5], [3.2, 41.8], [0.8, 41], [-0.3, 39.5], [0.2, 38.8], [-0.7, 37.6], [-2.1, 36.7], [-4.4, 36.7], [-5.6, 36], [-6.3, 36.8], [-8.9, 37], [-8.8, 38.7], [-8.9, 40.5], [-8.9, 42.8], [-8, 43.7], [-5, 43.5], [-1.8, 43.4], [-1.2, 44.7], [-1.2, 46.2], [-2.5, 47.3], [-4.7, 48], [-3, 48.8], [-1.6, 48.7], [-1.3, 49.7], [0.2, 49.5], [1.6, 50.2], [2.5, 51.1], [4, 51.6], [4.8, 53], [7, 53.6], [8.6, 53.9], [8.6, 55.5], [8.2, 56.8], [10.5, 57.7], [10.6, 56.3], [9.9, 55], [10.8, 54.4], [12.5, 54.5], [14, 54], [18.5, 54.7], [21, 55.2], [21, 57], [23.5, 57], [24.3, 57.8], [23.5, 59.2], [27, 59.5], [27, 60.5], [22.5, 60], [21.3, 61], [21.5, 63], [25, 65], [25.4, 65.4], [22, 65.8], [21, 64.5], [19, 63.5], [17.5, 62.4], [17.2, 60.8], [18.9, 59.9], [16.5, 57], [15.8, 56.1], [14.2, 55.4], [12.8, 55.6], [12.5, 56.3], [11.6, 58], [10.9, 59.2], [10.4, 59.5], [9, 58.8], [7, 58], [5.6, 58.9], [5, 60.5], [5, 62], [7, 62.8], [10, 64], [12, 65.5], [14, 67.5], [16, 68.7], [19, 70], [23, 70.6], [26, 71], [27.5, 70.8]] },
    // Great Britain, Ireland, Iceland
    { closed: true, pts: [[-5.7, 50.1], [-3.5, 50.3], [-1, 50.8], [1.4, 51.2], [1.7, 52.6], [0.3, 53.4], [-0.1, 54.4], [-1.5, 55.5], [-2, 56], [-2.8, 56.3], [-1.8, 57.5], [-3.5, 57.7], [-3.1, 58.6], [-5, 58.6], [-5.8, 57.8], [-5.6, 56.5], [-5, 55.7], [-5, 54.8], [-3.4, 54.9], [-3, 54], [-3, 53.3], [-4.6, 53.3], [-4.2, 52.9], [-4.1, 52.3], [-5.3, 51.8], [-3.2, 51.4]] },
    { closed: true, pts: [[-6, 52], [-6.3, 53.4], [-6, 54], [-5.7, 54.6], [-6.2, 55.2], [-7.5, 55.3], [-8.4, 54.6], [-10, 54.2], [-9.8, 53.2], [-9.5, 52.2], [-10.3, 51.8], [-9.5, 51.5], [-8, 51.8]] },
    { closed: true, pts: [[-22.5, 63.8], [-20, 63.5], [-17, 63.8], [-14.5, 64.4], [-13.5, 65.2], [-14.8, 66.2], [-16.5, 66.5], [-19, 66], [-22, 66.4], [-24, 65.5], [-22, 64.8], [-24, 64.8]] },
    // Corsica, Sardinia, Sicily
    { closed: true, pts: [[8.6, 41.4], [9.4, 42], [9.4, 43], [8.6, 42.4]] },
    { closed: true, pts: [[8.4, 39], [9.6, 39.2], [9.8, 41], [9.2, 41.2], [8.2, 40.9]] },
    { closed: true, pts: [[12.4, 38.1], [15.6, 38.3], [15.1, 36.7], [12.4, 37.8]] },
    // southern Greenland
    { closed: false, pts: [[-45, 61.2], [-44, 59.9], [-43, 60.5], [-41, 62.5], [-40, 64.5], [-37.5, 65.6], [-33, 68], [-26, 69], [-22.5, 70.5], [-22, 72]] }
  ].map(c => ({ closed: c.closed, pts: c.pts.map(([lo, la]) => px(lo, la)) }));
  const ISLAND_LOW = px(-22, 62), AZORES_HIGH = px(-28, 38);

  const idx = (i, j) => j * NX + i;
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
    addBlob(ISLAND_LOW[0], ISLAND_LOW[1], -16, 4.5);   // Iceland low
    addBlob(AZORES_HIGH[0], AZORES_HIGH[1], 14, 5);    // Azores high
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
    // dev mode: the sun keeps making new highs and lows
    if (sunOn) {
      sunTimer -= dt;
      if (sunTimer <= 0) {
        sunTimer = rnd(2.5, 4.5);
        events.push({ x: rnd(80, W - 80), y: rnd(80, H - 80), amp: Math.random() < 0.5 ? -9 : 8, left: 3 });
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
    const Dif = (sunOn ? 2.2 : 2.6) * (0.25 + 0.75 * Math.cos(rot));
    const k = Math.min(0.24, Dif * dt);
    const leak = 1 - 0.07 * dt;   // air also escapes beyond the map edge, so the last few hPa settle quicker
    for (let j = 1; j < NY - 1; j++) for (let i = 1; i < NX - 1; i++) {
      const c = idx(i, j);
      q[c] = (p[c] + k * (p[c - 1] + p[c + 1] + p[c - NX] + p[c + NX] - 4 * p[c])) * leak;
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

  const drawCoasts = () => {
    ctx.strokeStyle = K.mapCoast; ctx.lineWidth = 1.5; ctx.lineJoin = 'round';
    ctx.beginPath();
    for (const c of COAST) {
      c.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      if (c.closed) ctx.closePath();
    }
    ctx.stroke();
    const [ax, ay] = px(-31, 50), [ex, ey] = px(14, 49);
    text(ctx, t('s3.canvas.atlantic'), ax, ay, 14, K.mapCoast, 500, 'center');
    text(ctx, t('s3.canvas.europe'), ex, ey, 14, K.mapCoast, 500, 'center');
  };

  const draw = stats => {
    ctx.fillStyle = K.mapBg; ctx.fillRect(0, 0, W, H);
    drawCoasts();
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
      text(ctx, String(Math.round(1013 + e.v)), e.x, e.y + 32, 13, K.ink, 500, 'center', 'alphabetic', K.paper);
    }
    // brush preview
    if (pointer) {
      ctx.strokeStyle = brush > 0 ? D.high : D.low; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.arc(pointer.x, pointer.y, 3 * CW * 1.6, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    }
    const lh = Math.max(15, SCAPE.minFont(ctx)) * 1.35;
    text(ctx, t(rotOn ? 's3.canvas.rotOn' : 's3.canvas.rotOff'), 14, 10 + lh, 15, K.ink, 500, 'left', 'alphabetic', K.paper);
    if (SCAPE.dev) text(ctx, t(sunOn ? 's3.canvas.sunOn' : 's3.canvas.sunOff'), 14, 10 + 2 * lh, 15, K.ink, 500, 'left', 'alphabetic', K.paper);
  };

  let readT = 0;
  const frame = dt => {
    if (!view.fit()) return;
    update(dt);
    let mn = Infinity, mx = -Infinity, vmax = 0;
    for (let k = 0; k < p.length; k++) {
      if (p[k] < mn) mn = p[k];
      if (p[k] > mx) mx = p[k];
      const v2 = U[k] * U[k] + V[k] * V[k]; if (v2 > vmax) vmax = v2;
    }
    const range = mx - mn, ms = Math.sqrt(vmax), bft = beaufort(ms);
    const ext = extrema();
    draw({ ext });
    const frac = range / 40;
    meter.set(frac, t('meter.hpa', fmt(range, 0)));
    readT -= dt;
    if (readT <= 0) {
      readT = 0.25;
      read.textContent = t('s3.readout', fmt(ms, 1), bft, fmt(range, 0));
    }
    // tasks
    const tick = key => {
      if (!tasks.done(key)) return;
      const all = ['sturm', 'wirbel', 'still'].every(tasks.isDone);
      status.textContent = t(all ? 's3.tasks.all' : 's3.tasks.one');
    };
    if (bft >= 8) tick('sturm');
    if (rot > 1.1 && ext.some(e => e.v < -10)) tick('wirbel');
    if (painting && frac > 0.3) stillArmed = true;           // a strong high or low painted by the visitor …
    if (stillArmed && !painting && frac < 0.05) tick('still'); // … has evened out
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
  // dev mode
  const setSun = on => { sunOn = on; pressToggle($('#s3sun'), on, ['s3.sunOn', 's3.sunOff']); };
  const setArrows = on => { showArrows = on; pressToggle($('#s3arrows'), on); };
  $('#s3sun').addEventListener('click', () => setSun(!sunOn));
  $('#s3arrows').addEventListener('click', () => setArrows(!showArrows));
  window.addEventListener('scape:dev', e => { if (!e.detail) { setSun(SUN_DEFAULT); setArrows(ARROWS_DEFAULT); } });
  reset();
  Streben.stages['stufe-3'] = { frame };
})();
