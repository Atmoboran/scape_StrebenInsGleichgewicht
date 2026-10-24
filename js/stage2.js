// Stage 2 – sea breeze / land breeze: a cross-section through sea, coast and
// air with a time-of-day slider. One circulation cell driven by the
// temperature difference between land and sea. Time runs by itself; dragging
// the slider pauses it briefly. Sun and display toggles only in dev mode.
(() => {
  'use strict';
  const { $, $$, clamp, rnd, fmt, makeView, Hud, text, arrow, beaufort, pressToggle } = Streben;
  const K = THEME.streben, D = THEME.data;

  const W = 900, H = 600, BASE = 505, HC = 465, COAST = 450;   // low ground line: most of the picture is air
  const view = makeView($('#c2'), W, H), ctx = view.ctx;
  const hud = new Hud($('#h2'));
  const slider = $('#s2time'), clock = $('#s2clock'), status = $('#s2status');
  const tasks = SCAPE.tasks($('#s2tasks'));
  const hideBadge = Streben.firstHint($('#f2'), 's2.badge');
  const SUN = ['s2.sunOn', 's2.sunOff'];
  const show = { arrows: true, isobars: true, smoke: true, tracers: true };
  const RESUME_S = 2.5;                 // time runs on this long after the slider was let go
  let time = 13, sunOn = true, pause = 0;
  let Tl = 24, Ts = 17;
  let dT = 0;
  const tracers = Array.from({ length: 150 }, () => ({ x: rnd(0, W), z: rnd(0, HC) }));
  const smoke = []; let smokeT = 0;
  const boat = { x: 220 };
  const task = { active: false, time: 30 };

  const sunF = h => Math.max(0, Math.sin(Math.PI * (h - 6) / 12));
  const groundY = x => (x < COAST ? BASE : BASE - Math.min(1, (x - COAST) / 70) * 16);
  // stream function of a single circulation cell
  const vel = (x, z) => {
    const A = 10 * dT * HC / Math.PI;
    const u = A * (Math.PI / HC) * Math.sin(Math.PI * x / W) * Math.cos(Math.PI * z / HC);
    const w = -A * (Math.PI / W) * Math.cos(Math.PI * x / W) * Math.sin(Math.PI * z / HC);
    return [u, w];
  };
  const fmtTime = h => {
    const hh = Math.floor(h) % 24, mm = Math.floor((h - Math.floor(h)) * 60);
    return t('s2.clock', String(hh).padStart(2, '0'), String(mm).padStart(2, '0'));
  };

  const update = dt => {
    // time runs by itself, except while the slider is in use or the boat task runs
    pause = Math.max(0, pause - dt);
    if (!pause && !task.active) { time = (time + dt * 0.5) % 24; slider.value = time.toFixed(1); }
    clock.textContent = fmtTime(time);
    const s = sunOn ? sunF(time) : 0;
    const TlEq = sunOn ? 11 + 16 * s : 16, TsEq = sunOn ? 16 + 1.5 * s : 16;
    Tl += (TlEq - Tl) * Math.min(1, dt / 0.7);   // land reacts fast
    Ts += (TsEq - Ts) * Math.min(1, dt / 3.0);   // water reacts slowly
    dT = Tl - Ts;

    for (const p of tracers) {
      const [u, w] = vel(p.x, p.z);
      p.x += (u + rnd(-6, 6)) * dt; p.z += (w + rnd(-6, 6)) * dt;
      if (p.x < 0 || p.x > W || p.z < 2 || p.z > HC || Math.random() < dt * 0.05) { p.x = rnd(0, W); p.z = rnd(5, HC - 5); }
    }
    if (show.smoke) {
      smokeT -= dt;
      if (smokeT <= 0) { smokeT = 0.12; smoke.push({ x: 748, z: 118, r: 5, age: 0 }); }
    }
    for (const s2 of smoke) {
      const [u, w] = vel(s2.x, s2.z);
      s2.x += u * dt * 1.2; s2.z += (w * 1.2 + 14) * dt; s2.r += 7 * dt; s2.age += dt;
    }
    while (smoke.length && (smoke[0].age > 6 || smoke.length > 70)) smoke.shift();

    // the sailing boat is pushed by the wind near the ground
    const [ub] = vel(boat.x, 0);
    boat.x = clamp(boat.x + ub * 0.5 * dt, 40, COAST - 30);
    if (task.active) {
      task.time -= dt;
      if (boat.x >= COAST - 32) {
        task.active = false;
        status.textContent = t('s2.tasks.success', Math.ceil(task.time));
        tasks.done('boat');
      } else if (task.time <= 0) {
        task.active = false; status.textContent = t('s2.tasks.timeout');
      } else status.textContent = t('s2.tasks.left', Math.ceil(task.time));
    }
    // task: land breeze at night (after 21:00)
    const night = time >= 21 || time < 5;
    if (night && sunOn && dT < -2) tasks.done('night');
  };

  const draw = () => {
    const s = sunOn ? sunF(time) : 0;
    const night = sunOn && s <= 0;
    const ink = night ? K.inkNight : K.ink;
    ctx.fillStyle = !sunOn ? K.sky.noSun : night ? K.sky.night : s < 0.26 ? K.sky.dawn : K.sky.day;
    ctx.fillRect(0, 0, W, H);

    // sun, or moon and stars
    if (sunOn && s > 0) {
      const a = Math.PI * (time - 6) / 12, sx = 450 - 390 * Math.cos(a), sy = 420 - 340 * Math.sin(a);
      ctx.fillStyle = K.sun; ctx.beginPath(); ctx.arc(sx, sy, 32, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = K.sunRay; ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) { const r = i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(sx + Math.cos(r) * 42, sy + Math.sin(r) * 42); ctx.lineTo(sx + Math.cos(r) * 56, sy + Math.sin(r) * 56); ctx.stroke(); }
    } else if (night) {
      const h = (time + 6) % 24, a = Math.PI * h / 12, mx = 450 - 390 * Math.cos(a), my = 420 - 340 * Math.sin(a);
      ctx.fillStyle = K.moon; ctx.beginPath(); ctx.arc(mx, my, 24, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = K.sky.night; ctx.beginPath(); ctx.arc(mx + 10, my - 6, 21, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = K.star; ctx.lineWidth = 1.5;
      [[90, 70], [250, 40], [620, 60], [800, 110], [520, 150], [160, 190]].forEach(([x, y]) => {
        ctx.beginPath(); ctx.moveTo(x, y - 7); ctx.lineTo(x + 2, y - 2); ctx.lineTo(x + 7, y); ctx.lineTo(x + 2, y + 2); ctx.lineTo(x, y + 7); ctx.lineTo(x - 2, y + 2); ctx.lineTo(x - 7, y); ctx.lineTo(x - 2, y - 2); ctx.closePath(); ctx.stroke();
      });
    }

    // isobars (lines of equal pressure)
    if (show.isobars) {
      const a = 0.12;
      ctx.strokeStyle = night ? K.isobarNight : K.isobar; ctx.lineWidth = 2;
      for (let k = 0; k < 8; k++) {
        const L = 1010 - 6 * k;
        ctx.beginPath(); let started = false;
        for (let x = 0; x <= W; x += 10) {
          const d = -0.5 * dT * Math.tanh((x - COAST) / 120);
          const z = (1013 + d - L) / (a + 2 * d / HC);
          if (z < 0 || z > HC + 30) { started = false; continue; }
          const y = BASE - z;
          if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      text(ctx, t('s2.canvas.isobars'), 12, 26, 14, night ? K.isobarNight : K.isobar);
    }

    // air particles
    if (show.tracers) {
      ctx.fillStyle = night ? K.tracerNight : K.tracer;
      for (const p of tracers) {
        const y = BASE - p.z;
        if (y > groundY(p.x) - 3) continue;
        ctx.fillRect(p.x - 2, y - 2, 4, 4);
      }
    }

    // ground: sea, beach, land
    ctx.fillStyle = K.sea; ctx.fillRect(0, BASE, COAST + 10, H - BASE);
    ctx.fillStyle = K.beach;
    ctx.beginPath(); ctx.moveTo(COAST - 30, H); ctx.lineTo(COAST - 30, BASE + 4); ctx.lineTo(COAST, BASE); ctx.lineTo(COAST + 70, BASE - 16); ctx.lineTo(COAST + 70, H); ctx.closePath(); ctx.fill();
    ctx.fillStyle = K.land;
    ctx.beginPath(); ctx.moveTo(COAST + 50, H); ctx.lineTo(COAST + 50, BASE - 12); ctx.lineTo(COAST + 70, BASE - 16); ctx.lineTo(W, BASE - 16); ctx.lineTo(W, H); ctx.closePath(); ctx.fill();

    // house with chimney
    const gy = BASE - 16;
    ctx.fillStyle = K.house; ctx.fillRect(690, gy - 56, 70, 56);
    ctx.fillStyle = K.roof; ctx.beginPath(); ctx.moveTo(680, gy - 56); ctx.lineTo(725, gy - 96); ctx.lineTo(770, gy - 56); ctx.closePath(); ctx.fill();
    ctx.fillStyle = K.ink; ctx.fillRect(742, gy - 104, 12, 30);
    ctx.fillStyle = night ? K.windowNight : K.window; ctx.fillRect(704, gy - 40, 16, 16); ctx.fillRect(730, gy - 40, 16, 16);

    // smoke
    if (show.smoke) {
      ctx.fillStyle = night ? K.smokeNight : K.smoke;
      for (const p of smoke) { ctx.beginPath(); ctx.arc(p.x, BASE - p.z, p.r, 0, Math.PI * 2); ctx.fill(); }
    }

    // wind vane at the coast
    const fx = COAST + 30, fTop = BASE - 110;
    ctx.fillStyle = K.ink; ctx.fillRect(fx - 2, fTop, 4, 110 - 8);
    const [u0] = vel(COAST, 20);
    const len = clamp(Math.abs(u0) * 0.5, 6, 70) * Math.sign(u0 || 1);
    const flap = Math.sin(performance.now() / 120) * Math.min(6, Math.abs(u0) * 0.05);
    ctx.fillStyle = K.vane;
    ctx.beginPath(); ctx.moveTo(fx, fTop); ctx.lineTo(fx + len, fTop + 12 + flap); ctx.lineTo(fx, fTop + 24); ctx.closePath(); ctx.fill();

    // sailing boat
    const bx = boat.x;
    ctx.fillStyle = K.boat;
    ctx.beginPath(); ctx.moveTo(bx - 34, BASE - 12); ctx.lineTo(bx + 34, BASE - 12); ctx.lineTo(bx + 22, BASE + 6); ctx.lineTo(bx - 22, BASE + 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = K.ink; ctx.fillRect(bx - 2, BASE - 92, 4, 80);
    const sail = clamp(u0 * 0.35, -26, 26);
    ctx.fillStyle = K.sail; ctx.strokeStyle = K.ink; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(bx + 2, BASE - 90); ctx.quadraticCurveTo(bx + 30 + sail, BASE - 50, bx + 2, BASE - 18); ctx.closePath(); ctx.fill(); ctx.stroke();

    // arrows
    if (show.arrows) {
      for (let x = 70; x < W; x += 95) for (let z = 30; z < HC; z += 72) {
        const y = BASE - z;
        if (y > groundY(x) - 10) continue;
        const [u, w] = vel(x, z);
        const sp = Math.hypot(u, w); if (sp < 4) continue;
        const k = Math.min(1, 46 / sp) * 0.75;
        arrow(ctx, x - u * k / 2, y + w * k / 2, u * k, -w * k, ink, 3, 11);
      }
    }

    // high and low: H always blue, T always red
    if (Math.abs(dT) > 0.6) {
      const landLow = dT > 0;
      const hl = (isLow, x, y, size) => text(ctx, t(isLow ? 's2.canvas.low' : 's2.canvas.high'), x, y, size, isLow ? D.low : D.high, 500, 'center', 'alphabetic', K.paper);
      hl(!landLow, 340, BASE - 26, 64);
      hl(landLow, 620, BASE - 40, 64);
      hl(landLow, 340, 150, 34);
      hl(!landLow, 620, 150, 34);
      if (Math.abs(dT) > 2) {
        text(ctx, t('s2.canvas.rising'), landLow ? 620 : 225, BASE - 250, 15, ink, 500, 'center');
        text(ctx, t('s2.canvas.sinking'), landLow ? 225 : 620, BASE - 250, 15, ink, 500, 'center');
      }
    }

    // temperatures
    text(ctx, t('s2.canvas.sea', fmt(Ts, 0)), 225, BASE + 58, 24, K.ink, 500, 'center');
    text(ctx, t('s2.canvas.land', fmt(Tl, 0)), 665, BASE + 52, 24, K.ink, 500, 'center');
    if (task.active) {
      ctx.fillStyle = K.ink; ctx.fillRect(W - 150, 14, 136, 40);
      text(ctx, t('s2.canvas.timer', Math.ceil(task.time)), W - 82, 42, 22, K.paper, 500, 'center');
    }
  };

  let hudT = 0;
  const frame = dt => {
    if (!view.fit()) return;
    update(dt); draw();
    hudT -= dt;
    if (hudT <= 0) {
      hudT = 0.2;
      // wind direction (arrow: right = towards the land), Beaufort, pressure difference
      const calm = Math.abs(dT) < 0.6;
      hud.dir(calm ? null : dT > 0 ? 0 : 180, t(calm ? 's2.wind.calm' : dT > 0 ? 's2.wind.sea' : 's2.wind.land'));
      hud.bft(beaufort(0.8 * Math.abs(dT)));
      hud.val('dp', t('hud.hpa', fmt(0.25 * Math.abs(dT), 1)));
    }
  };

  const grab = () => { hideBadge(); pause = RESUME_S; time = parseFloat(slider.value) % 24; };
  slider.addEventListener('input', grab);
  slider.addEventListener('pointerdown', () => { pause = RESUME_S; });
  // dev mode: sun and what the drawing shows
  const setShow = (k, on) => {
    show[k] = on;
    $(`[data-toggle="${k}"]`).setAttribute('aria-pressed', on ? 'true' : 'false');
    if (k === 'smoke' && !on) smoke.length = 0;
  };
  const setSun = on => { sunOn = on; pressToggle($('#s2sun'), on, SUN); };
  $('#s2sun').addEventListener('click', () => { hideBadge(); setSun(!sunOn); });
  $$('[data-toggle]').forEach(b => b.addEventListener('click', () => setShow(b.dataset.toggle, !show[b.dataset.toggle])));
  // leaving dev mode restores the visitor defaults: everything on
  window.addEventListener('scape:dev', e => { if (!e.detail) { setSun(true); Object.keys(show).forEach(k => setShow(k, true)); } });
  $('#s2task').addEventListener('click', () => {
    hideBadge();
    time = 5.5; slider.value = time; setSun(true);
    Tl = 11; Ts = 16; dT = Tl - Ts;
    boat.x = 160; task.active = true; task.time = 30;
    status.textContent = t('s2.tasks.go', 30);
    const dlg = $('#s2dlg'); if (dlg.open) dlg.close();   // the boat needs to be seen
  });
  Streben.stages['stufe-2'] = { frame };
})();
