// Stage 3 – weather map on the synoptic scale (Europe and the North Atlantic).
// Visitors paint highs and lows; pressure differences even out by diffusion,
// wind blows down the gradient and is turned to the right when Earth's
// rotation is switched on. The coastlines are only a backdrop: the map is one
// surface, land and sea behave the same. Tools: paint H, paint T (adjustable
// size) or measure the wind with the wind vane (a magnifier that shows speed
// and direction). The balance can be paused. Dev mode: the sun (keeps making
// new highs and lows), the arrows and the speed of the balance.
// Side view: a west–east cross-section (x–z) along one latitude (chosen with
// a slider). Air sinks in the high and rises in the low; at the ground it
// flows from high to low, aloft back. Clouds over lows, sun over highs.
(() => {
  'use strict';
  const { $, $$, clamp, rnd, fmt, makeView, Hud, text, arrow, beaufort, pressToggle } = Streben;
  const K = THEME.streben, D = THEME.data;

  const W = 600, H = 600, NX = 40, NY = 40, CW = W / NX, CH = H / NY;
  const view = makeView($('#c3'), W, H), ctx = view.ctx;
  const hud = new Hud($('#h3'));
  const status = $('#s3status');
  const tasks = SCAPE.tasks($('#s3tasks'));
  const hideBadge = Streben.firstHint($('#f3'), 's3.badge');
  let p = new Float32Array(NX * NY), q = new Float32Array(NX * NY);
  const U = new Float32Array(NX * NY), V = new Float32Array(NX * NY);
  const SUN_DEFAULT = false, ARROWS_DEFAULT = true, SPEED_DEFAULT = 1;
  const BALANCE = 1.0, LEAK = 0.025;   // diffusion (cells²/s) and loss over the map edge (1/s) at speed 1
  let tool = 'high', size = 3.5, paused = false, speed = SPEED_DEFAULT;
  let rotOn = false, rot = 0, sunOn = SUN_DEFAULT, showArrows = ARROWS_DEFAULT;
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

  // ---- side view ----------------------------------------------------------
  let side = false, cutLat = 52;
  const cutY = () => (LAT1 - cutLat) / (LAT1 - LAT0) * H;
  const GROUND = 520, TOP = 40, HC = GROUND - TOP;      // ground line and height of the air column
  const NP = 61, DX = W / (NP - 1);
  const prof = new Float32Array(NP), d1 = new Float32Array(NP), d2 = new Float32Array(NP);
  const newSide = o => { o.x = rnd(0, W); o.z = rnd(4, HC - 4); o.life = rnd(2, 5); o.trail = []; return o; };
  const sideParts = Array.from({ length: 260 }, () => newSide({}));
  const lerp = (arr, x) => { const f = clamp(x / DX, 0, NP - 1.001), i = f | 0, r = f - i; return arr[i] * (1 - r) + arr[i + 1] * r; };

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
    if (painting && pointer && tool !== 'probe') addBlob(pointer.x, side ? cutY() : pointer.y, (tool === 'high' ? 1 : -1) * 16 * dt, size);
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
    if (!paused) {
      const Dif = BALANCE * speed * (0.25 + 0.75 * Math.cos(rot));
      const k = Math.min(0.24, Dif * dt);
      const leak = 1 - LEAK * speed * dt;   // air also escapes beyond the map edge, so the last few hPa settle
      for (let j = 1; j < NY - 1; j++) for (let i = 1; i < NX - 1; i++) {
        const c = idx(i, j);
        q[c] = (p[c] + k * (p[c - 1] + p[c + 1] + p[c - NX] + p[c + NX] - 4 * p[c])) * leak;
      }
      for (let i = 0; i < NX; i++) { q[idx(i, 0)] = 0; q[idx(i, NY - 1)] = 0; }
      for (let j = 0; j < NY; j++) { q[idx(0, j)] = 0; q[idx(NX - 1, j)] = 0; }
      [p, q] = [q, p];
    }

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

  // pressure along the cut, its slope (drives the wind at the ground) and curvature (rising/sinking)
  const profile = () => {
    const y = cutY();
    for (let i = 0; i < NP; i++) prof[i] = sample(p, i * DX, y);
    for (let i = 0; i < NP; i++) {
      const a = prof[Math.max(0, i - 1)], b = prof[Math.min(NP - 1, i + 1)];
      d1[i] = (b - a) / (2 * DX);
      d2[i] = (a + b - 2 * prof[i]) / (DX * DX);
    }
  };
  // circulation in the cross-section: u at the ground from high to low, back aloft;
  // w up over the low, down over the high. Rotation weakens the flow across the isobars.
  const sideVel = (x, z) => {
    const cf = 0.25 + 0.75 * Math.cos(rot);
    return [-700 * lerp(d1, x) * Math.cos(Math.PI * z / HC) * cf, 9000 * lerp(d2, x) * Math.sin(Math.PI * z / HC) * cf];
  };
  const updateSide = dt => {
    profile();
    for (const o of sideParts) {
      const [u, w] = sideVel(o.x, o.z);
      o.x += u * dt; o.z += w * dt; o.life -= dt;
      o.trail.push(o.x, GROUND - o.z); if (o.trail.length > 14) o.trail.splice(0, 2);
      if (o.life <= 0 || o.x < 0 || o.x > W || o.z < 2 || o.z > HC) newSide(o);
    }
  };
  const profExtrema = () => {
    const out = [];
    for (let i = 2; i < NP - 2; i++) {
      const v = prof[i]; if (Math.abs(v) < 4) continue;
      const nb = [prof[i - 2], prof[i - 1], prof[i + 1], prof[i + 2]];
      if ((v > 0 && nb.every(w => w < v)) || (v < 0 && nb.every(w => w > v))) out.push({ x: i * DX, v });
    }
    return out;
  };
  const cloud = (x, y, s) => {
    const parts = [[-34, 6, 22], [-6, -10, 30], [28, 4, 22]];
    const shape = () => { parts.forEach(([dx, dy, r]) => { ctx.moveTo(x + (dx + r) * s, y + dy * s); ctx.arc(x + dx * s, y + dy * s, r * s, 0, Math.PI * 2); }); ctx.rect(x - 34 * s, y + 4 * s, 62 * s, 24 * s); };
    ctx.beginPath(); shape(); ctx.strokeStyle = K.cloudLine; ctx.lineWidth = 5; ctx.stroke();
    ctx.beginPath(); shape(); ctx.fillStyle = K.cloud; ctx.fill();
  };
  const drawSide = () => {
    ctx.fillStyle = K.sideSky; ctx.fillRect(0, 0, W, H);
    const ext = profExtrema();
    // weather: sun over the high, clouds (and rain) over the low
    for (const e of ext) {
      if (e.v > 0) {
        const r = clamp(10 + e.v * 0.8, 12, 30), y = 100;
        ctx.strokeStyle = K.sideSunRay; ctx.lineWidth = 2;
        for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; ctx.beginPath(); ctx.moveTo(e.x + Math.cos(a) * (r + 6), y + Math.sin(a) * (r + 6)); ctx.lineTo(e.x + Math.cos(a) * (r + 16), y + Math.sin(a) * (r + 16)); ctx.stroke(); }
        ctx.fillStyle = K.sideSun; ctx.beginPath(); ctx.arc(e.x, y, r, 0, Math.PI * 2); ctx.fill();
      } else {
        const s = clamp(-e.v / 14, 0.5, 1.5), y = 200;
        if (e.v < -12) {
          ctx.strokeStyle = K.rain; ctx.lineWidth = 2; ctx.setLineDash([8, 10]);
          ctx.lineDashOffset = -performance.now() / 20;
          for (let k = -2; k <= 2; k++) { const x = e.x + k * 14 * s; ctx.beginPath(); ctx.moveTo(x, y + 30 * s); ctx.lineTo(x - 10, GROUND); ctx.stroke(); }
          ctx.setLineDash([]); ctx.lineDashOffset = 0;
        }
        cloud(e.x, y, s);
      }
    }
    // surfaces of equal pressure: pushed up over the high, down over the low
    ctx.strokeStyle = K.mapIsobar; ctx.lineWidth = 2;
    for (let k = 0; k < 6; k++) {
      const base = 60 + k * 75, f = 2.6 * (0.6 + k * 0.3);
      ctx.beginPath();
      for (let x = 0; x <= W; x += 10) { const y = GROUND - base - lerp(prof, x) * f; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
    }
    // moving air
    ctx.strokeStyle = K.sideAir; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
    ctx.beginPath();
    for (const o of sideParts) {
      const tr = o.trail; if (tr.length < 4) continue;
      ctx.moveTo(tr[0], tr[1]); for (let k = 2; k < tr.length; k += 2) ctx.lineTo(tr[k], tr[k + 1]);
    }
    ctx.stroke();
    if (showArrows) {
      for (let x = 30; x < W; x += 60) for (let z = 40; z < HC; z += 80) {
        const [u, w] = sideVel(x, z), sp = Math.hypot(u, w); if (sp < 6) continue;
        const k = Math.min(46, sp * 0.5) / sp, y = GROUND - z;
        arrow(ctx, x - u * k / 2, y + w * k / 2, u * k, -w * k, K.ink, 2.5, 9);
      }
    }
    // ground
    ctx.fillStyle = K.sideGround; ctx.fillRect(0, GROUND, W, H - GROUND);
    ctx.fillStyle = K.ink; ctx.fillRect(0, GROUND - 1, W, 2);
    for (const e of ext) {
      const hi = e.v > 0;
      text(ctx, t(hi ? 's3.canvas.high' : 's3.canvas.low'), e.x, GROUND - 14, 40, hi ? D.high : D.low, 500, 'center', 'alphabetic', K.paper);
      text(ctx, String(Math.round(1013 + e.v)), e.x, GROUND + 26, 14, K.ink, 500, 'center');
      text(ctx, t(hi ? 's3.canvas.sinking' : 's3.canvas.rising'), e.x, GROUND - HC * 0.42, 13, K.ink, 500, 'center', 'alphabetic', K.paper);
    }
    text(ctx, t('s3.canvas.west'), 12, H - 18, 14, K.ink);
    text(ctx, t('s3.canvas.east'), W - 60, H - 18, 14, K.ink, 500, 'right');
    const lh = Math.max(15, SCAPE.minFont(ctx)) * 1.35;
    text(ctx, t('s3.canvas.cut', fmt(cutLat, cutLat % 1 ? 1 : 0)), W - 14, 10 + lh, 15, K.ink, 500, 'right', 'alphabetic', K.paper);
    text(ctx, t('s3.canvas.sideIsobars'), 14, GROUND - 60 - 8, 12, K.mapIsobar, 500, 'left', 'alphabetic', K.paper);
    // brush preview: where the high or low will grow (its width), or the wind vane
    if (pointer && tool !== 'probe') {
      const r = size * CW * 1.6;
      ctx.strokeStyle = tool === 'high' ? D.high : D.low; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.moveTo(pointer.x - r, GROUND - 6); ctx.lineTo(pointer.x - r, TOP); ctx.moveTo(pointer.x + r, GROUND - 6); ctx.lineTo(pointer.x + r, TOP); ctx.stroke(); ctx.setLineDash([]);
    }
    if (pointer && tool === 'probe') {
      const z = clamp(GROUND - pointer.y, 0, HC);
      const [u, w] = sideVel(pointer.x, z), sp = Math.hypot(u, w);
      const key = sp < 4 ? 'probeCalm' : Math.abs(w) > Math.abs(u) ? (w > 0 ? 'probeRising' : 'probeSinking') : (u > 0 ? 'probeEast' : 'probeWest');
      lens(pointer.x, pointer.y, sp < 4 ? null : [u / sp, -w / sp], Math.min(1, sp / 60), [t('s3.canvas.' + key)]);
    }
    if (paused) pausedLabel();
  };

  // the wind vane as a magnifier: a ring with the wind arrow inside and a label box
  const lens = (x, y, dir, strength, lines) => {
    const R = 46;
    ctx.fillStyle = K.paper; ctx.strokeStyle = K.ink; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 1.5;
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * (R - 8), y + Math.sin(a) * (R - 8)); ctx.lineTo(x + Math.cos(a) * R, y + Math.sin(a) * R); ctx.stroke(); }
    if (dir) {
      const L = 16 + 54 * strength;
      arrow(ctx, x - dir[0] * L / 2, y - dir[1] * L / 2, dir[0] * L, dir[1] * L, K.probe, 4, 13);
    } else {
      ctx.fillStyle = K.ink; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
    }
    // label box: fixed width, left-aligned text, so changing digits do not make it jump
    const fs = Math.max(17, SCAPE.minFont(ctx)), lh = fs * 1.3, bh = 12 + lines.length * lh;
    ctx.font = '500 ' + fs + 'px ' + THEME.font;
    // width in steps of 40 px, so it only grows for longer words, not for every digit
    const bw = Math.ceil((Math.max(...lines.map(l => ctx.measureText(l).width)) + 20) / 40) * 40;
    const bx = clamp(x - bw / 2, 4, W - bw - 4);
    const by = y - R - 10 - bh > 4 ? y - R - 10 - bh : Math.min(y + R + 10, H - bh - 4);
    ctx.fillStyle = K.ink; ctx.fillRect(bx, by, bw, bh);
    lines.forEach((l, i) => text(ctx, l, bx + 10, by + 6 + (i + 1) * lh - fs * 0.35, fs, K.paper, 500, 'left'));
  };
  const COMPASS = () => t('s3.canvas.dirs');
  // wind measured at a point of the map: speed, Beaufort and where it comes from
  const probeTop = (x, y) => {
    const u = sample(U, x, y), v = sample(V, x, y), ms = Math.hypot(u, v), b = beaufort(ms);
    if (ms < 0.3) { lens(x, y, null, 0, [t('s3.canvas.probeMs', fmt(ms, 1)), t('s3.canvas.probeCalm')]); return; }
    const toward = Math.atan2(u, -v) * 180 / Math.PI;           // compass bearing the wind blows to
    const from = ((toward + 180) % 360 + 360) % 360;
    const dir = COMPASS()[Math.round(from / 45) % 8];
    lens(x, y, [u / ms, v / ms], Math.min(1, ms / 20), [t('s3.canvas.probeMs', fmt(ms, 1)), t('s3.canvas.probeBft', b, dir)]);
  };
  const pausedLabel = () => {
    const lh = Math.max(15, SCAPE.minFont(ctx)) * 1.35;
    text(ctx, t('s3.canvas.paused'), 14, 10 + lh, 15, K.ink, 500, 'left', 'alphabetic', K.paper);
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
    // brush preview (its size) or the wind vane
    if (pointer && tool !== 'probe') {
      ctx.strokeStyle = tool === 'high' ? D.high : D.low; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.arc(pointer.x, pointer.y, size * CW * 1.6, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    }
    if (pointer && tool === 'probe') probeTop(pointer.x, pointer.y);
    if (paused) pausedLabel();
    if (SCAPE.dev) {
      const lh = Math.max(15, SCAPE.minFont(ctx)) * 1.35;
      text(ctx, t(sunOn ? 's3.canvas.sunOn' : 's3.canvas.sunOff'), 14, 10 + 2 * lh, 15, K.ink, 500, 'left', 'alphabetic', K.paper);
    }
  };

  let hudT = 0;
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
    if (side) { updateSide(dt); drawSide(); } else draw({ ext });
    const frac = range / 40;
    hudT -= dt;
    if (hudT <= 0) { hudT = 0.2; hud.bft(bft); hud.val('dp', t('hud.hpa', fmt(range, 0))); }
    // tasks
    const tick = key => {
      if (!tasks.done(key)) return;
      const all = ['sturm', 'wirbel', 'still'].every(tasks.isDone);
      status.textContent = t(all ? 's3.tasks.all' : 's3.tasks.one');
    };
    if (bft >= 8) tick('sturm');
    if (rot > 1.1 && ext.some(e => e.v < -10)) tick('wirbel');
    if (painting && tool !== 'probe' && frac > 0.3) stillArmed = true;           // a strong high or low painted by the visitor …
    if (stillArmed && !painting && frac < 0.05) tick('still'); // … has evened out
  };

  const cv = view.canvas;
  cv.addEventListener('pointerdown', e => { hideBadge(); cv.setPointerCapture(e.pointerId); pointer = view.local(e); painting = true; e.preventDefault(); });
  cv.addEventListener('pointermove', e => { pointer = view.local(e); });
  // the wind vane stays where the finger left it; the brush preview disappears
  const stop = e => { painting = false; if (e.pointerType !== 'mouse' && tool !== 'probe') pointer = null; };
  cv.addEventListener('pointerup', stop); cv.addEventListener('pointercancel', stop);
  cv.addEventListener('pointerleave', e => { painting = false; if (e.pointerType === 'mouse' || tool !== 'probe') pointer = null; });
  // tools: H, T, wind vane; size of H and T
  $$('#s3tool .btn').forEach(b => b.addEventListener('click', () => {
    tool = b.dataset.tool; pointer = null;
    $$('#s3tool .btn').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    $('#s3sizeRow').classList.toggle('off', tool === 'probe');
  }));
  const sizeIn = $('#s3size'), sizeDot = $('#s3sizeRow .size-dot');
  const setSize = v => { size = v; sizeDot.style.setProperty('--d', (8 + (v - 2) * 7) + 'px'); };
  sizeIn.addEventListener('input', () => setSize(parseFloat(sizeIn.value)));
  setSize(size);
  // Earth's rotation (switch) and pausing the balance
  $('#s3rot').addEventListener('click', e => { rotOn = !rotOn; e.currentTarget.setAttribute('aria-checked', String(rotOn)); });
  $('#s3pause').addEventListener('click', e => {
    paused = !paused;
    e.currentTarget.setAttribute('aria-pressed', String(paused));
    e.currentTarget.querySelector('.lbl').textContent = t(paused ? 's3.resume' : 's3.pause');
  });
  // top or side view
  const cutSlider = $('#s3cut'), cutVal = $('#s3cutVal');
  const setCut = lat => { cutLat = clamp(Math.round(lat * 2) / 2, 31, 71); cutSlider.value = cutLat; cutVal.textContent = t('s3.cutVal', fmt(cutLat, cutLat % 1 ? 1 : 0)); };
  cutSlider.addEventListener('input', () => setCut(parseFloat(cutSlider.value)));
  $('#s3view').addEventListener('change', e => {
    side = e.target.value === 'side';
    $('#s3cutRow').hidden = !side;
    pointer = null;
    if (side) {
      // cut through the strongest high or low, so there is something to see
      const ex = extrema()[0];
      if (ex) setCut(LAT1 - ex.y / H * (LAT1 - LAT0));
      for (const o of sideParts) newSide(o);
    }
  });
  $('#s3view').value = 'top';
  setCut(cutLat);
  // dev mode
  const setSun = on => { sunOn = on; pressToggle($('#s3sun'), on, ['s3.sunOn', 's3.sunOff']); };
  const setArrows = on => { showArrows = on; pressToggle($('#s3arrows'), on); };
  const speedIn = $('#s3speed'), speedOut = $('#s3speedVal');
  const setSpeed = v => { speed = v; speedIn.value = v; speedOut.textContent = t('s3.speedVal', fmt(v, 1)); };
  speedIn.addEventListener('input', () => setSpeed(parseFloat(speedIn.value)));
  setSpeed(SPEED_DEFAULT);
  $('#s3sun').addEventListener('click', () => setSun(!sunOn));
  $('#s3arrows').addEventListener('click', () => setArrows(!showArrows));
  window.addEventListener('scape:dev', e => { if (!e.detail) { setSun(SUN_DEFAULT); setArrows(ARROWS_DEFAULT); setSpeed(SPEED_DEFAULT); } });
  reset();
  Streben.stages['stufe-3'] = { frame };
})();
