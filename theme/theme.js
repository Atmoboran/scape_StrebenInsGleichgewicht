// THEME – brand and colours used from JavaScript (logo, footer, canvas
// drawings). The CSS side lives in theme.css. For another institution,
// replace the values here; the keys are what the app looks up.
window.THEME = {
  brand: {
    name: 'SCAPE°',
    // Wordmark: name with the subtitle spread over its full width.
    logoHtml:
      '<span class="logo-word">SCAPE°</span>' +
      '<span class="logo-sub" aria-hidden="true"><span>Wetter</span><span>Klima</span><span>Mensch</span></span>',
    logoLabel: 'SCAPE° – Wetter Klima Mensch',
    // The one line in every footer.
    line: 'SCAPE° – Wetter. Klima. Mensch.',
    titleSuffix: ' – SCAPE°',
    themeColor: '#F2E4BA',
    // Short mark S° for the browser tab.
    favicon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#FFF487"/><text x="16" y="23.5" text-anchor="middle" font-family="Helvetica Neue, Arial, sans-serif" font-size="19" fill="#000">S°</text></svg>'
  },

  // Typeface for canvas text (the same stack as --font in theme.css).
  font: '"Founders Grotesk","Helvetica Neue",Inter,Arial,sans-serif',

  // The SCAPE° palette by name. Drawings refer to these names.
  palette: {
    black: '#000000', white: '#FFFFFF',
    olive: '#726B1E', sand: '#D4BFA3',
    gold: '#E09F00', amber: '#F59E24', yellow: '#FFE547', yellowStrong: '#FFD500', yellowBright: '#FFED00', yellowS: '#FDC618',
    yellowPastel: '#FFF487', yellowPale: '#FDF6B7',
    rust: '#D55117', orange: '#EE7518', salmon: '#EF887F', pink: '#F8E1E6', cream: '#F2E4BA',
    red: '#E41513', red2: '#E8472E',
    purple: '#442683', purple2: '#523E91', lavender: '#E0E5F5', lilac: '#C5B8DB',
    greenStrong: '#00983A', green: '#62BA91', greenPale: '#B0D8C0', mint: '#CFE6CE', paleGreen: '#D0E8DC',
    cyan: '#0097BE', cyan2: '#44ABCC', cyan3: '#80C0DA', petrol: '#1F6C8E', teal: '#007B73', grey: '#AEC4C2',
    navy: '#28348B', blue: '#0253A0', blue2: '#3274BA', bluePale: '#98B8DD', ice: '#D4EDF8'
  },

  // Meaningful data colours, the same in every app (style guide 4.3).
  data: {
    cold: '#3274BA', neutral: '#D9D6CF', warm: '#E41513',   // temperature scale
    low: '#E41513', high: '#3274BA',                        // T (Tief) red, H (Hoch) blue
    pairA: '#E41513', pairB: '#28348B'                      // two things compared: red vs blue
  }
};

// Colour on the CD temperature scale: t = 0 (cold) … 0.5 (neutral) … 1 (warm).
THEME.tempColor = function (t) {
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const [a, b] = t < 0.5 ? [hex(THEME.data.cold), hex(THEME.data.neutral)] : [hex(THEME.data.neutral), hex(THEME.data.warm)];
  const f = Math.max(0, Math.min(1, t < 0.5 ? t * 2 : (t - 0.5) * 2));
  return 'rgb(' + a.map((v, i) => Math.round(v + (b[i] - v) * f)).join(',') + ')';
};

// ---- Streben nach Gleichgewicht: canvas colours ----
// Temperatures (particle speeds) use THEME.tempColor;
// "H" (Hoch) and "T" (Tief) use THEME.data.high / THEME.data.low.
THEME.streben = {
  ink: '#000000',              // outlines, text, the wall
  paper: '#FFFFFF',            // margins around the drawings, light text
  // Stage 1 – particle box
  box: { dichte: '#CFE6CE', waerme: '#FFFFFF' },   // box background per experiment
  particle: '#442683',         // particles (density experiment)
  // Stage 2 – sea breeze cross-section
  sky: { day: '#D4EDF8', dawn: '#F8E1E6', night: '#28348B', noSun: '#E0E5F5' },
  inkNight: '#FFFFFF',         // text and arrows on the night sky
  sun: '#FFD500', sunRay: '#E09F00', moon: '#FFF487', star: '#FFF487',
  isobar: '#523E91', isobarNight: '#C5B8DB',
  tracer: '#1F6C8E', tracerNight: '#FFF487',
  sea: '#44ABCC', beach: '#F2E4BA', land: '#62BA91',
  house: '#E8472E', roof: '#442683', window: '#D4EDF8', windowNight: '#FFF487',
  smoke: 'rgba(31,108,142,0.28)', smokeNight: 'rgba(174,196,194,0.55)',
  vane: '#EE7518', boat: '#28348B', sail: '#FFF487',
  // Stage 3 – weather map
  mapBg: '#E0E5F5',            // the map: one surface, no land/sea colours
  mapCoast: '#98B8DD',         // coastlines of Europe and the North Atlantic (backdrop only)
  mapIsobar: '#0097BE', windTrail: '#442683',
  mapCut: '#000000',           // the dashed line where the side view cuts
  // side view (x–z cross-section)
  sideSky: '#E0E5F5', sideGround: '#D0E8DC', sideAir: '#442683',
  cloud: '#FFFFFF', cloudLine: '#0097BE', rain: '#0097BE', sideSun: '#FFD500', sideSunRay: '#E09F00'
};
