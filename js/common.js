// Streben nach Gleichgewicht – helpers shared by all stages (window.Streben).
// Canvas views (device-pixel-ratio aware, letterboxed in fullscreen), the
// difference meter, the instrument bar (wind direction, Beaufort, Δp),
// canvas text and arrows.
(() => {
  'use strict';
  const K = THEME.streben;
  const S = (window.Streben = { stages: {} });

  S.$ = (s, el = document) => el.querySelector(s);
  S.$$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  S.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  S.rnd = (a, b) => a + Math.random() * (b - a);
  // decimal comma and a real minus sign
  S.fmt = (n, d = 0) => n.toFixed(d).replace('.', ',').replace('-', '−');

  // A canvas that draws in fixed units W × H. The drawing keeps its shape:
  // when the canvas has another aspect ratio (fullscreen) it is centred.
  S.makeView = (canvas, W, H) => {
    const ctx = canvas.getContext('2d');
    let lw = 0, lh = 0, s = 1, ox = 0, oy = 0;
    return {
      ctx, W, H, canvas,
      fit() {
        const w = canvas.clientWidth, h = canvas.clientHeight;
        if (!w || !h) return false;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        if (w !== lw || h !== lh) {
          lw = w; lh = h;
          canvas.width = Math.round(w * dpr);
          canvas.height = Math.round(h * dpr);
        }
        s = Math.min(canvas.width / W, canvas.height / H);
        ox = (canvas.width - W * s) / 2; oy = (canvas.height - H * s) / 2;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (ox > 1 || oy > 1) { ctx.fillStyle = K.paper; ctx.fillRect(0, 0, canvas.width, canvas.height); }
        ctx.setTransform(s, 0, 0, s, ox, oy);
        return true;
      },
      local(e) {
        const r = canvas.getBoundingClientRect();
        return {
          x: ((e.clientX - r.left) * canvas.width / r.width - ox) / s,
          y: ((e.clientY - r.top) * canvas.height / r.height - oy) / s
        };
      }
    };
  };

  // The difference meter (bar above a simulation).
  S.Meter = class {
    constructor(el) { this.el = el; this.val = el.querySelector('.meter-val, .v'); this.last = ''; }
    set(frac, label) {
      frac = S.clamp(frac, 0, 1);
      this.el.style.setProperty('--v', frac.toFixed(3));
      const txt = label != null ? label : t('meter.percent', Math.round(frac * 100));
      if (txt !== this.last) { this.val.textContent = txt; this.last = txt; }
      this.el.classList.toggle('is-zero', frac < 0.04);
    }
  };

  // Instrument bar above a drawing: <div class="hud"> with .hud-item[data-hud="dir|bft|dp"].
  // Values sit in fixed-width boxes with tabular figures, so nothing shifts when digits change.
  S.Hud = class {
    constructor(el) {
      this.el = el; this.last = {};
      el.querySelectorAll('.bft-bar').forEach(b => { b.innerHTML = Array.from({ length: 12 }, (_, k) => '<i style="--k:' + k + '"></i>').join(''); });
    }
    item(key) { return this.el.querySelector('[data-hud="' + key + '"]'); }
    val(key, txt) {
      if (this.last[key] === txt) return;
      this.last[key] = txt;
      this.item(key).querySelector('.hud-val').textContent = txt;
    }
    bft(n) {
      if (this.last.bftN !== n) {
        this.last.bftN = n;
        this.item('bft').querySelectorAll('.bft-bar i').forEach((i, k) => i.classList.toggle('on', k < n));
      }
      this.val('bft', t('hud.bft', n));
    }
    // deg: 0 = to the right (east), 180 = to the left; null = calm
    dir(deg, word) {
      const it = this.item('dir');
      it.classList.toggle('calm', deg == null);
      if (deg != null) it.querySelector('.hud-arrow').style.transform = 'rotate(' + deg + 'deg)';
      this.val('dir', word);
    }
  };

  // Canvas text, never smaller than 12 px on screen (SCAPE.minFont).
  // halo: draw a thin outline in that colour behind the letters.
  S.text = (ctx, str, x, y, size, color, weight = 500, align = 'left', base = 'alphabetic', halo = null) => {
    size = Math.max(size, SCAPE.minFont(ctx));
    ctx.font = weight + ' ' + size + 'px ' + THEME.font;
    ctx.textAlign = align; ctx.textBaseline = base;
    if (halo) { ctx.strokeStyle = halo; ctx.lineWidth = Math.max(2, size * 0.08); ctx.lineJoin = 'round'; ctx.strokeText(str, x, y); }
    ctx.fillStyle = color;
    ctx.fillText(str, x, y);
  };

  S.arrow = (ctx, x, y, dx, dy, color, width = 3, head = 10) => {
    const len = Math.hypot(dx, dy);
    if (len < 2) return;
    const ux = dx / len, uy = dy / len;
    const h = Math.min(head, len * 0.6);
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width; ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx - ux * h * 0.8, y + dy - uy * h * 0.8); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + dx, y + dy);
    ctx.lineTo(x + dx - ux * h - uy * h * 0.55, y + dy - uy * h + ux * h * 0.55);
    ctx.lineTo(x + dx - ux * h + uy * h * 0.55, y + dy - uy * h - ux * h * 0.55);
    ctx.closePath(); ctx.fill();
  };

  // Beaufort number from m/s
  const BFT = [0.3, 1.6, 3.4, 5.5, 8.0, 10.8, 13.9, 17.2, 20.8, 24.5, 28.5, 32.7];
  S.beaufort = ms => { let b = 0; while (b < BFT.length && ms >= BFT[b]) b++; return b; };

  // Toggle button: pressed state and, optionally, its label (text keys).
  S.pressToggle = (btn, state, keys) => {
    btn.setAttribute('aria-pressed', state ? 'true' : 'false');
    if (keys) btn.textContent = t(state ? keys[0] : keys[1]);
  };

  // First-hint badge on a simulation; returns a function that hides it for good.
  S.firstHint = (frame, key) => {
    const badge = SCAPE.badge(frame);
    badge.show(t(key));
    return () => { if (badge.shown) badge.hide(); };
  };
})();
