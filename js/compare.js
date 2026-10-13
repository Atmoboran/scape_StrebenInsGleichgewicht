// Comparison – four things that flow: heat, water, electric current, wind.
// All four run with the same clock and start again once they are balanced.
(() => {
  'use strict';
  const { $, makeView, Meter, text, arrow } = Streben;
  const K = THEME.streben, D = THEME.data;

  const W = 300, H = 200;
  const views = ['#k1', '#k2', '#k3', '#k4'].map(s => makeView($(s), W, H));
  const meters = ['#kb1', '#kb2', '#kb3', '#kb4'].map(s => new Meter($(s)));
  let rod, hL, hR, Q, airH, airT, wait;
  const dots = Array.from({ length: 14 }, (_, i) => i / 14);
  const airDots = Array.from({ length: 60 }, () => ({ x: Math.random(), y: Math.random() }));
  const reset = () => {
    rod = Array.from({ length: 24 }, (_, i) => (i < 12 ? 1 : 0));
    hL = 0.85; hR = 0.15; Q = 1; airH = 1; airT = 0; wait = 0;
  };
  // the circuit wire: battery + → lamp → battery −
  const WIRE = [[100, 160, 50, 160], [50, 160, 50, 50], [50, 50, 250, 50], [250, 50, 250, 160], [250, 160, 200, 160]];
  const WIRE_LEN = WIRE.map(([a, b, c, d]) => Math.hypot(c - a, d - b));
  const WIRE_TOTAL = WIRE_LEN.reduce((x, y) => x + y, 0);
  const onWire = s => {
    let d = s * WIRE_TOTAL;
    for (let k = 0; k < WIRE.length; k++) {
      if (d <= WIRE_LEN[k] || k === WIRE.length - 1) { const [a, b, c, dd] = WIRE[k], f = Math.min(1, d / WIRE_LEN[k]); return [a + (c - a) * f, b + (dd - b) * f]; }
      d -= WIRE_LEN[k];
    }
    return [0, 0];
  };

  const frame = dt => {
    // physics (all with the same clock)
    const n = rod.slice();
    for (let i = 0; i < rod.length; i++) {
      const l = rod[Math.max(0, i - 1)], r = rod[Math.min(rod.length - 1, i + 1)];
      n[i] = rod[i] + 0.25 * (l + r - 2 * rod[i]) * Math.min(1, dt * 30);
    }
    rod = n;
    const flow = (hL - hR) * 0.35 * dt; hL -= flow; hR += flow;
    const I = Q * 0.35; Q -= I * dt;
    const wind = (airH - airT) * 0.35 * dt; airH -= wind; airT += wind;
    let l = 0, r = 0; for (let i = 0; i < 12; i++) { l += rod[i]; r += rod[i + 12]; }
    const diffs = [(l - r) / 12, (hL - hR) / 0.7, Q, airH - airT];
    diffs.forEach((d, i) => meters[i].set(d));
    if (diffs.every(d => d < 0.015)) { wait += dt; if (wait > 2.5) reset(); }
    const time = performance.now() / 1000;

    // 1 heat
    let v = views[0], c = v.ctx;
    if (v.fit()) {
      c.fillStyle = K.heatBg; c.fillRect(0, 0, W, H);
      const x0 = 30, w = 240, sw = w / rod.length;
      rod.forEach((tv, i) => { c.fillStyle = THEME.tempColor(tv); c.fillRect(x0 + i * sw, 84, sw + 0.5, 34); });
      c.strokeStyle = K.ink; c.lineWidth = 2; c.strokeRect(x0, 84, w, 34);
      text(c, t('cmp.heat.warm'), x0, 70, 14, K.ink); text(c, t('cmp.heat.cold'), x0 + w, 70, 14, K.ink, 500, 'right');
      const f = Math.min(1, diffs[0] * 1.6);
      if (f > 0.05) arrow(c, 110, 150, 80 * f + 10, 0, K.heatArrow, 4, 12);
    }
    // 2 water
    v = views[1]; c = v.ctx;
    if (v.fit()) {
      c.fillStyle = K.waterBg; c.fillRect(0, 0, W, H);
      const tb = 170, th = 130;
      c.fillStyle = K.basin;
      c.fillRect(40, tb - th * hL, 80, th * hL); c.fillRect(180, tb - th * hR, 80, th * hR);
      c.fillRect(120, tb - 18, 60, 18);
      c.strokeStyle = K.ink; c.lineWidth = 3;
      c.beginPath(); c.moveTo(40, tb - th); c.lineTo(40, tb); c.lineTo(260, tb); c.lineTo(260, tb - th); c.stroke();
      c.beginPath(); c.moveTo(120, tb - th); c.lineTo(120, tb - 18); c.lineTo(180, tb - 18); c.lineTo(180, tb - th); c.stroke();
      c.fillStyle = K.paper;
      const sp = diffs[1];
      for (let i = 0; i < 4; i++) { const ph = (time * sp * 1.4 + i / 4) % 1; c.fillRect(122 + ph * 52, tb - 11, 5, 5); }
      text(c, t('cmp.water.high'), 80, 22, 14, K.ink, 500, 'center'); text(c, t('cmp.water.low'), 220, 22, 14, K.ink, 500, 'center');
    }
    // 3 electric current
    v = views[2]; c = v.ctx;
    if (v.fit()) {
      c.fillStyle = K.currentBg; c.fillRect(0, 0, W, H);
      // circuit: battery at the bottom (+ left, − right), lamp at the top
      c.strokeStyle = K.ink; c.lineWidth = 3;
      c.beginPath(); c.moveTo(100, 160); c.lineTo(50, 160); c.lineTo(50, 50); c.lineTo(250, 50); c.lineTo(250, 160); c.lineTo(200, 160); c.stroke();
      c.fillStyle = K.plus; c.fillRect(100, 140, 50, 40); c.fillStyle = K.minus; c.fillRect(150, 140, 50, 40);
      c.strokeRect(100, 140, 100, 40);
      text(c, t('cmp.current.plus'), 125, 172, 30, K.paper, 500, 'center'); text(c, t('cmp.current.minus'), 175, 172, 30, K.paper, 500, 'center');
      c.fillStyle = I > 0.2 ? K.lampOn : I > 0.06 ? K.lampDim : K.lampOff;
      c.beginPath(); c.arc(150, 50, 22, 0, Math.PI * 2); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(136, 36); c.lineTo(164, 64); c.moveTo(164, 36); c.lineTo(136, 64); c.stroke();
      // charges move along the wire (conventional current + → −)
      c.fillStyle = K.charge;
      dots.forEach(d0 => { const s = (d0 + time * Q * 0.25) % 1; const [x, y] = onWire(s); if (Math.abs(x - 150) > 24 || y > 60) c.fillRect(x - 3, y - 3, 6, 6); });
    }
    // 4 wind
    v = views[3]; c = v.ctx;
    if (v.fit()) {
      c.fillStyle = K.windBg; c.fillRect(0, 0, W, H);
      c.strokeStyle = K.ink; c.lineWidth = 3;
      c.strokeRect(20, 60, 100, 110); c.strokeRect(180, 60, 100, 110);
      c.fillStyle = K.windBg; c.fillRect(118, 130, 64, 37);
      c.beginPath(); c.moveTo(120, 128); c.lineTo(180, 128); c.moveTo(120, 170); c.lineTo(180, 170); c.stroke();
      const nH = Math.round(30 + 25 * (airH - airT));
      c.fillStyle = K.air;
      for (let i = 0; i < 60; i++) {
        const d = airDots[i], left = i < nH;
        const x = (left ? 26 : 186) + d.x * 88 + Math.sin(time * 3 + i) * 2, y = 66 + d.y * 98 + Math.cos(time * 2.5 + i) * 2;
        c.fillRect(x - 2.5, y - 2.5, 5, 5);
      }
      const f = diffs[3];
      for (let i = 0; i < 3; i++) { const ph = (time * f * 1.5 + i / 3) % 1; c.fillRect(122 + ph * 54, 146, 5, 5); }
      text(c, t('cmp.wind.high'), 70, 46, 34, D.high, 500, 'center'); text(c, t('cmp.wind.low'), 230, 46, 34, D.low, 500, 'center');
      if (f > 0.05) arrow(c, 130, 110, 40, 0, K.ink, 3, 10);
    }
  };
  $('#kreset').addEventListener('click', reset);
  reset();
  Streben.stages.vergleich = { frame, enter: reset };
})();
