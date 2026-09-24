/* ============================================================
   PASIENTEN  -  hver innleggelse settes sammen av kjønn, hode, hårfarge,
   hudtone, klær, sko og litt pynt, så to pasienter sjelden ser like ut.
   Utseendet (look) er et lite JSON-objekt som lagres med løpet, i
   dødslisten og i arkivet. Figuren, portrettene og liket bygges av det.
   Delene fra ChatGPT farges om piksel for piksel (hår, hud, kåpe).
   Kodetegnede plagg har egne nøkler (kropp_tvang_f osv.) og kan byttes
   ut med bilder på samme måte som alt annet.
   ============================================================ */
function rgbHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0;
  if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = (mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60; }
  return [h, s, l];
}
function hslRgb(h, s, l) {
  h = ((h % 360) + 360) % 360 / 360; if (!s) return [l * 255, l * 255, l * 255];
  const q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q, f = t => { t = (t + 1) % 1; return 255 * (t < 1 / 6 ? p + (q - p) * 6 * t : t < .5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p); };
  return [f(h + 1 / 3), f(h), f(h - 1 / 3)];
}
const sst = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/* hårfarger: [tone, metning, lyshet ganger, lyshet pluss] for ChatGPT-hodene, og en ferdig farge for kodehodet */
const PAS_HAR = {
  brun: { navn: 'brunt', map: null, kode: '#4a3020' },
  svart: { navn: 'svart', map: [25, .35, .5, 0], kode: '#1f1714' },
  blond: { navn: 'lyst', map: [42, .55, 1.25, .3], kode: '#d8b050' },
  rod: { navn: 'rødt', map: [16, .7, 1.3, .14], kode: '#c05a28' },
  gra: { navn: 'grått', map: [30, .05, 1.2, .28], kode: '#9a9690' },
  hvit: { navn: 'hvitt', map: [40, .06, .8, .55], kode: '#e4e0d8' }
};
/* hudtoner: [tonesleng, metning ganger, lyshet ganger, lyshet pluss] */
const PAS_HUD = [null, [23, .35, 1, .04], [5, .55, .72, 0], [3, .5, .48, 0]];
/* kåpefarger: [tone, metning ganger, lyshet ganger, lyshet pluss], null er sennepsgul som i originalen */
const PAS_KAPE = { sennep: null, vinrod: [350, .9, .8, 0], gronn: [140, .6, .75, 0], bla: [220, .7, .7, 0], rosa: [335, .6, 1, .12], lilla: [270, .45, .8, 0], brun: [25, .5, .75, 0], gra: [0, .05, 1, 0] };
const PAS_KLAER = {
  kape: { navn: 'morgenkåpe', vekt: [34, 30], farger: Object.keys(PAS_KAPE) },
  tvang: { navn: 'tvangstrøye', vekt: [18, 16], farger: ['#e4dcc4', '#d8cfa8', '#c9c7bd'] },
  skjorte: { navn: 'sykehusskjorte', vekt: [18, 16], farger: ['#a8cce0', '#b4dcc0', '#e8c0c8', '#e4dca8', '#d4d0c8'] },
  pyjamas: { navn: 'stripete pyjamas', vekt: [22, 14], farger: ['#5a7ac0', '#c05a5a', '#5a9a6a', '#8a6a9a', '#7a6a5a'] },
  serk: { navn: 'nattserk', vekt: [8, 24], farger: ['#efe6d2', '#f2f2ee', '#ead2da', '#d8e0ec'] }
};
const PAS_SKO = { tofler: ['tøfler', 35], hvit: ['sykehusklogger', 20], barfot: ['bare føtter', 18], sokk: ['ullsokker', 22], stovel: ['støvler', 5] };
/* pynt på hodet: at hode, off per visning i forhold til hodets festepunkt, face = skjules bakfra */
const PAS_PYNT = {
  nattlue: { navn: 'nattlue', w: .9, h: .72, off: { f: [.02, .86], s: [-.06, .86], b: [.02, .86] }, vekt: [10, 8], draw: col => g => {
    const hat = A.blob([[-.36, .16], [-.3, -.08], [-.06, -.2], [.2, -.16], [.34, -.02], [.4, .16], [.34, .2], [.3, .06], [.2, .02], [0, .06], [-.2, .1]]);
    A.cel(g, hat, col, { lw: .035 }); g.save(); hat(g); g.clip(); for (let i = -4; i < 5; i++) A.line(g, [[i * .1 - .05, .3], [i * .1 + .12, -.3]], .045, '#f4f0e6'); g.restore(); A.ink(g, hat, .035);
    A.cel(g, A.rr(-.4, .1, .8, .1, .04), '#f4f0e6', { lw: .03, hi: false }); A.cel(g, A.ell(.38, .24, .07, .07), '#f4f0e6', { lw: .03 });
  }, farger: ['#b3261e', '#3a5a9a', '#4a7a4a'] },
  papiljotter: { navn: 'papiljotter', w: .9, h: .4, off: { f: [0, .88], s: [-.06, .86], b: [0, .88] }, vekt: [2, 12], draw: () => g => {
    const C = ['#f2a8c8', '#9ac8e8', '#f0d878', '#f2a8c8', '#9ac8e8'];
    for (let i = 0; i < 5; i++) { const x = -.3 + i * .15, y = Math.abs(i - 2) * .05 - .02; g.save(); g.translate(x, y); g.rotate((i - 2) * .25); A.cel(g, A.rr(-.06, -.09, .12, .18, .05), C[i], { lw: .03, hi: false }); A.line(g, [[-.05, 0], [.05, 0]], .015, Col.dark(C[i], .7)); g.restore(); }
  } },
  harnett: { navn: 'hårnett', w: .9, h: .56, off: { f: [0, .8], s: [-.04, .8], b: [0, .8] }, vekt: [1, 8], draw: () => g => {
    const dome = A.blob([[-.4, .2], [-.36, -.08], [-.16, -.24], [.16, -.24], [.36, -.08], [.4, .2], [0, .12]]);
    g.save(); dome(g); g.clip(); g.globalAlpha = .7; for (let i = -6; i < 7; i++) { A.line(g, [[i * .08 - .3, .3], [i * .08 + .3, -.3]], .012, '#2a2a30'); A.line(g, [[i * .08 + .3, .3], [i * .08 - .3, -.3]], .012, '#2a2a30'); } g.restore();
    A.line(g, [[-.4, .18], [0, .12], [.4, .18]], .025, '#2a2a30');
  } },
  hjelm: { navn: 'beskyttelseshjelm', w: .96, h: .66, off: { f: [0, .8], s: [-.03, .8], b: [0, .8] }, vekt: [7, 5], draw: () => g => {
    const L = '#7a5234', dome = A.blob([[-.42, .16], [-.4, -.06], [-.2, -.2], [.2, -.2], [.4, -.06], [.42, .16], [0, .12]]);
    A.cel(g, dome, L, { lw: .04 }); g.save(); dome(g); g.clip(); for (const x of [-.2, 0, .2]) A.curve(g, [x * 1.4, .16], [x * 1.2, -.05], [x * .6, -.24], .025, Col.dark(L, .6)); g.restore();
    A.cel(g, A.rr(-.44, .08, .88, .1, .04), Col.dark(L, .8), { lw: .03, hi: false }); for (const x of [-.3, -.1, .1, .3]) A.dot(g, x, .13, .018, '#c8a040');
  } },
  rosett: { navn: 'sløyfe', w: .4, h: .28, off: { f: [.27, .8], s: [-.2, .8], b: [-.27, .8] }, vekt: [0, 12], draw: col => g => {
    for (const s of [-1, 1]) A.cel(g, A.poly([[0, 0], [s * .16, -.1], [s * .17, .1]]), col, { lw: .03, hi: false }); A.cel(g, A.ell(0, 0, .05, .05), Col.dark(col, .8), { lw: .03, hi: false });
  }, farger: ['#c8322a', '#3a6ab0', '#e8a0c0', '#1f1714'] },
  plaster: { navn: 'plaster', w: .24, h: .24, face: true, off: { f: [-.15, .66], s: [.16, .66] }, vekt: [6, 5], draw: () => g => {
    for (const r of [.7, -.7]) { g.save(); g.rotate(r); A.cel(g, A.rr(-.1, -.03, .2, .06, .02), '#e8c08a', { lw: .018, hi: false }); g.restore(); }
  } },
  sting: { navn: 'sting', w: .4, h: .16, face: true, off: { f: [.06, .7], s: [.14, .72] }, vekt: [5, 3], draw: () => g => {
    A.curve(g, [-.15, .02], [0, -.03], [.15, .02], .025, '#8a2a2a'); for (let i = 0; i < 5; i++) { const x = -.12 + i * .06; A.line(g, [[x, -.04], [x + .01, .05]], .014, '#1f1714'); }
  } }
};

/* ---------- tegning av plaggene (samme mål som kåpa fra ChatGPT: 0,67 bred, 0,87 høy over hofta) ---------- */
function pasTorso(v, bunn = 0, bred = .34) {
  const w = v === 's' ? bred * .8 : bred;
  return A.blob([[-w, bunn], [-w * .5, bunn + .02], [w * .5, bunn + .02], [w, bunn], [w * .9, -.62], [w * .92, -.74], [.12, -.84], [-.12, -.84], [-w * .92, -.74], [-w * .9, -.62]]);
}
function clipDraw(g, path, fn) { g.save(); path(g); g.clip(); fn(); g.restore(); }
function drawTvang(v, C) {
  return g => {
    const t = pasTorso(v, 0, .35), strap = '#6a4a2c', brass = '#c8a040';
    A.cel(g, t, C, { sk: .82, lw: 0 });
    clipDraw(g, t, () => {
      for (const y of [-.52, -.28]) { A.flat(g, A.rr(-.5, y - .04, 1, .08, .01), strap, 0); A.line(g, [[-.5, y - .04], [.5, y - .04]], .012, Col.dark(strap, .6)); }
      A.flat(g, A.ell(-.14, -.14, .07, .05), 'rgba(120,80,40,.3)', 0); A.flat(g, A.ell(.2, -.66, .04, .03), 'rgba(140,30,30,.35)', 0);
      for (const s of [-1, 1]) A.line(g, [[s * .3, -.7], [s * .3, -.02]], .012, Col.dark(C, .7));
    });
    A.ink(g, t, .035);
    if (v === 'b') { A.line(g, [[0, -.8], [0, -.02]], .02, Col.dark(C, .65)); for (const y of [-.52, -.28, -.1]) { A.flat(g, A.rr(-.05, y - .05, .1, .1, .015), brass, .025); A.dot(g, 0, y, .015, INK); } return; }
    for (const y of [-.52, -.28]) { const x = v === 's' ? .06 : .16; A.flat(g, A.rr(x - .045, y - .055, .09, .11, .015), brass, .025); A.line(g, [[x, y - .03], [x, y + .03]], .015, INK); }
    // løs stropp mellom beina og en ved siden
    A.line(g, [[0, -.04], [.02, .06]], .06, INK); A.line(g, [[0, -.04], [.02, .05]], .04, strap);
    if (v === 'f') { A.line(g, [[.33, -.42], [.4, -.2], [.38, -.06]], .06, INK); A.line(g, [[.33, -.42], [.4, -.2], [.38, -.06]], .04, strap); A.flat(g, A.rr(.34, -.08, .08, .07, .01), brass, .02); }
    A.cel(g, A.rr(-.14, -.86, .28, .12, .04), C, { lw: .035, hi: false });
  };
}
function drawSkjorte(v, C, hud) {
  return g => {
    const t = pasTorso(v, .02, .33), mon = Col.dark(C, .78);
    if (v !== 's') for (const s of [-1, 1]) A.cel(g, A.ell(s * .33, -.64, .09, .1, s * .5), C, { lw: .035, hi: false });
    A.cel(g, t, C, { sk: .85, lw: 0 });
    clipDraw(g, t, () => {
      for (let y = -.8; y < .05; y += .12) for (let x = -.36; x < .4; x += .12) { const o = (Math.round(y / .12) % 2) * .06; A.flat(g, A.poly([[x + o, y - .025], [x + o + .025, y], [x + o, y + .025], [x + o - .025, y]]), mon, 0); }
      if (v === 'b') {
        const gap = A.poly([[-.03, -.76], [.03, -.76], [.1, .05], [-.1, .05]]); A.flat(g, gap, hud, 0);
        A.flat(g, A.rr(-.12, -.12, .24, .2, .03), '#f4f0e8', .025); for (const [x, y] of [[-.06, -.06], [.05, -.02], [-.02, .03]]) A.dot(g, x, y, .018, '#c8322a');
        A.line(g, [[-.03, -.76], [-.1, .05]], .02, INK); A.line(g, [[.03, -.76], [.1, .05]], .02, INK);
        for (const y of [-.6, -.36]) { A.line(g, [[-.07, y], [.07, y]], .02, Col.dark(C, .6)); for (const s of [-1, 1]) A.flat(g, A.ell(s * .045, y, .035, .02), Col.light(C, .2), .014); }
      }
    });
    A.ink(g, t, .035);
    if (v === 'f') { A.curve(g, [-.12, -.78], [0, -.68], [.12, -.78], .03, Col.dark(C, .6)); A.flat(g, A.rr(-.26, -.5, .12, .09, .015), '#f4f2e8', .025); A.line(g, [[-.24, -.46], [-.16, -.46]], .014); }
  };
}
function drawPyjamas(v, C) {
  return g => {
    const t = pasTorso(v, 0, .34), W = '#eef0f2';
    A.cel(g, t, W, { sk: .86, lw: 0 });
    clipDraw(g, t, () => { for (let x = -.4; x < .45; x += .11) A.flat(g, A.rr(x, -.9, .045, 1, 0), C, 0); g.fillStyle = 'rgba(60,40,30,.12)'; g.fillRect(.08, -.9, .4, 1); });
    A.ink(g, t, .035);
    if (v === 'f') {
      for (const s of [-1, 1]) A.cel(g, A.poly([[s * .02, -.82], [s * .2, -.8], [s * .1, -.6]]), W, { lw: .03, hi: false });
      A.line(g, [[.01, -.62], [.01, -.02]], .02, Col.dark(C, .6)); for (const y of [-.5, -.34, -.18]) A.flat(g, A.ell(.05, y, .03, .03), '#f4ecd8', .018);
      A.cel(g, A.rr(-.26, -.5, .13, .12, .015), W, { lw: .025, hi: false }); A.line(g, [[-.24, -.44], [-.15, -.44]], .02, C);
    } else if (v === 's') { A.line(g, [[.2, -.62], [.22, -.02]], .02, Col.dark(C, .6)); }
    else A.cel(g, A.rr(-.16, -.84, .32, .1, .03), W, { lw: .03, hi: false });
  };
}
function drawSerk(v, C) {
  return g => {
    const w = v === 's' ? .3 : .38, t = A.blob([[-w - .04, .36], [0, .38], [w + .04, .36], [w * .95, -.62], [w * .9, -.74], [.12, -.84], [-.12, -.84], [-w * .9, -.74], [-w * .95, -.62]]);
    A.cel(g, t, C, { sk: .86, lw: 0 });
    clipDraw(g, t, () => { for (let x = -.3; x < .35; x += .1) A.line(g, [[x, -.6], [x * 1.15, .34]], .012, Col.dark(C, .82)); });
    A.ink(g, t, .035);
    for (let i = 0; i < 9; i++) { const x = -w - .02 + i * (w * 2 + .04) / 8; A.flat(g, A.ell(x, .37, .05, .035), '#fbf8f0', .018); }
    if (v !== 'b') { for (let i = 0; i < 5; i++) A.flat(g, A.ell(-.16 + i * .08, -.74 + Math.abs(i - 2) * .02, .05, .04), '#fbf8f0', .018); if (v === 'f') { for (const s of [-1, 1]) A.cel(g, A.poly([[0, -.62], [s * .08, -.67], [s * .08, -.57]]), '#e8a0b8', { lw: .02, hi: false }); A.dot(g, 0, -.62, .025, '#c87090'); } }
  };
}

/* ---------- omfarging av ChatGPT-deler ---------- */
function spriteReady(key) { if (!SPRITES[key]) return false; const im = Art.img[key]; return !!(im && im.complete && im.naturalWidth); }
function omfargPart(P, key, map) {
  if (Art.cache.has(key)) return Art.cache.get(key);
  const c = document.createElement('canvas'); c.width = P.canvas.width; c.height = P.canvas.height;
  const g = c.getContext('2d'); g.drawImage(P.canvas, 0, 0);
  try {
    const d = g.getImageData(0, 0, c.width, c.height), a = d.data;
    for (let i = 0; i < a.length; i += 4) if (a[i + 3] > 8) { const r = map(a[i], a[i + 1], a[i + 2]); if (r) { a[i] = r[0]; a[i + 1] = r[1]; a[i + 2] = r[2]; } }
    g.putImageData(d, 0, 0);
  } catch (e) { return P; }
  const Q = { key, w: P.w, h: P.h, ax: P.ax, ay: P.ay, canvas: c, tex: new THREE.CanvasTexture(c) }; Q.tex.anisotropy = 4;
  Art.cache.set(key, Q); return Q;
}
const blandRgb = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
/* hode: hud farges per piksel, hår bare der det er sammenhengende hår rundt (ellers blir skjeggstubber og skygger til prikker) */
function omfargHode(P, key, har, hud) {
  if (Art.cache.has(key)) return Art.cache.get(key);
  const W = P.canvas.width, H = P.canvas.height, c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'); g.drawImage(P.canvas, 0, 0);
  try {
    const d = g.getImageData(0, 0, W, H), a = d.data, n = W * H, HS = new Float32Array(n * 3), M = new Float32Array(n), T = new Float32Array(n), B = new Float32Array(n), r0 = 3;
    for (let i = 0; i < n; i++) { if (a[i * 4 + 3] < 8) continue; const [h, s, l] = rgbHsl(a[i * 4], a[i * 4 + 1], a[i * 4 + 2]); HS[i * 3] = h; HS[i * 3 + 1] = s; HS[i * 3 + 2] = l; if (har && h >= 5 && h <= 45) M[i] = (1 - sst(.4, .55, s)) * (1 - sst(.45, .6, l)) * sst(.05, .12, l); }
    if (har) {
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let t = 0; for (let k = -r0; k <= r0; k++) { const xx = x + k; if (xx >= 0 && xx < W) t += M[y * W + xx]; } T[y * W + x] = t / (r0 * 2 + 1); }
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let t = 0; for (let k = -r0; k <= r0; k++) { const yy = y + k; if (yy >= 0 && yy < H) t += T[yy * W + x]; } B[y * W + x] = t / (r0 * 2 + 1); }
    }
    for (let i = 0; i < n; i++) {
      if (a[i * 4 + 3] < 8) continue; const h = HS[i * 3], s = HS[i * 3 + 1], l = HS[i * 3 + 2]; let col = [a[i * 4], a[i * 4 + 1], a[i * 4 + 2]], ch = false;
      if (hud && (h <= 35 || h >= 340)) { const w = sst(.42, .55, s) * sst(.35, .48, l) * (1 - sst(.86, .92, l)); if (w > .01) { col = blandRgb(col, hslRgb(h + hud[0], s * hud[1], Math.min(.95, l * hud[2] + hud[3])), w); ch = true; } }
      if (har && M[i] > .01) { const w = M[i] * sst(.3, .55, B[i]); if (w > .01) { col = blandRgb(col, hslRgb(har[0], har[1], Math.min(.95, l * har[2] + har[3])), w); ch = true; } }
      if (ch) { a[i * 4] = col[0]; a[i * 4 + 1] = col[1]; a[i * 4 + 2] = col[2]; }
    }
    g.putImageData(d, 0, 0);
  } catch (e) { return P; }
  const Q = { key, w: P.w, h: P.h, ax: P.ax, ay: P.ay, canvas: c, tex: new THREE.CanvasTexture(c) }; Q.tex.anisotropy = 4;
  Art.cache.set(key, Q); return Q;
}
function hudMap(hud) {
  return (r, g, b) => { const [h, s, l] = rgbHsl(r, g, b); if (h > 35 && h < 340) return null; const w = sst(.42, .55, s) * sst(.35, .48, l) * (1 - sst(.86, .92, l)); return w > .01 ? blandRgb([r, g, b], hslRgb(h + hud[0], s * hud[1], Math.min(.95, l * hud[2] + hud[3])), w) : null; };
}
function klaerMap(m) {
  return (r, g, b) => { const [h, s, l] = rgbHsl(r, g, b); if (h < 28 || h > 66) return null; const w = sst(.35, .5, s) * sst(.2, .3, l); return w > .01 ? blandRgb([r, g, b], hslRgb(m[0], Math.min(1, s * m[1]), Math.min(.95, l * m[2] + m[3])), w) : null; };
}
function hexMap(hex, map) { const [r, g, b] = Col.rgb(hex), o = map(r, g, b); return o ? Col.hex(o[0], o[1], o[2]) : hex; }

const Pasient = {
  /* nytt utseende. rng er valgfri (for tester og gjentakbarhet) */
  lag(o = {}) {
    const R0 = o.rng || Math.random, p = arr => arr[Math.floor(R0() * arr.length)];
    const vekt = obj => { const ks = Object.keys(obj), ws = ks.map(k => obj[k]); let t = R0() * ws.reduce((a, b) => a + b, 0); for (let i = 0; i < ks.length; i++) { t -= ws[i]; if (t <= 0) return ks[i]; } return ks[0]; };
    const kjonn = o.kjonn || (R0() < .5 ? 'k' : 'm'), ki = kjonn === 'k' ? 1 : 0, alder = o.alder || 40;
    const harV = { brun: 30, svart: 22, blond: 16, rod: 10, gra: alder > 50 ? 30 : 5, hvit: alder > 60 ? 22 : 1 };
    const klaer = o.klaer || vekt(Object.fromEntries(Object.entries(PAS_KLAER).map(([k, K]) => [k, K.vekt[ki]])));
    const L = { v: 1, kjonn, har: vekt(harV), hud: vekt({ 0: 45, 1: 20, 2: 20, 3: 15 }) | 0, klaer, farge: p(PAS_KLAER[klaer].farger), sko: vekt(Object.fromEntries(Object.entries(PAS_SKO).map(([k, s]) => [k, s[1]]))), pynt: [] };
    if (R0() < .55) { const k = vekt(Object.fromEntries(Object.entries(PAS_PYNT).filter(([, P]) => !P.face).map(([k, P]) => [k, P.vekt[ki]]))); L.pynt.push(PAS_PYNT[k].farger ? k + ':' + p(PAS_PYNT[k].farger) : k); }
    if (R0() < .3) L.pynt.push(p(['plaster', 'sting']));
    return L;
  },
  norm(L) {
    const d = { v: 1, kjonn: 'm', har: 'brun', hud: 0, klaer: 'kape', farge: 'sennep', sko: 'tofler', pynt: [] };
    if (!L || L.v !== 1) return d;
    const o = Object.assign(d, L); if (!PAS_HAR[o.har]) o.har = 'brun'; if (!PAS_KLAER[o.klaer]) o.klaer = 'kape'; if (!PAS_SKO[o.sko]) o.sko = 'tofler'; o.hud = Math.max(0, Math.min(3, o.hud | 0));
    if (!PAS_KLAER[o.klaer].farger.includes(o.farge)) o.farge = PAS_KLAER[o.klaer].farger[0]; o.pynt = (o.pynt || []).filter(k => PAS_PYNT[k.split(':')[0]]);
    return o;
  },
  nokkel(L) { L = this.norm(L); return [L.kjonn, L.har, L.hud, L.klaer, L.farge.replace('#', ''), L.sko, L.pynt.join('+').replace(/#/g, '')].join('.'); },
  hudHex(L) { const h = PAS_HUD[L.hud]; return h ? hexMap(SKIN.pasient, hudMap(h)) : SKIN.pasient; },
  /* tekst til innleggelseskortet */
  beskriv(L) {
    L = this.norm(L); const K = PAS_KLAER[L.klaer], s = PAS_SKO[L.sko][0], py = L.pynt.map(k => PAS_PYNT[k.split(':')[0]].navn).filter(n => n !== 'sting' && n !== 'plaster');
    const ting = [K.navn, s].concat(py.slice(0, 1)), liste = ting.length > 1 ? ting.slice(0, -1).join(', ') + ' og ' + ting[ting.length - 1] : ting[0];
    return 'Iført ' + liste + '. ' + (L.har === 'hvit' || L.har === 'gra' ? 'Grått i håret.' : 'Håret er ' + PAS_HAR[L.har].navn + '.');
  },
  hode(L, v) {
    const base = L.kjonn === 'k' ? 'hode_pasient_kvinne_' + v : 'hode_pasient_' + v, H = PAS_HAR[L.har], hud = PAS_HUD[L.hud], suf = L.har + '.' + L.hud;
    if (spriteReady(base)) { const P = Art.part(base, 1.2, 1.1, .6, .1, drawPasientHead(v, { lang: L.kjonn === 'k' })); return H.map || hud ? omfargHode(P, base + '~' + suf, H.map, hud) : P; }
    return Art.part(base + '~' + suf, 1.2, 1.1, .6, .1, drawPasientHead(v, { lang: L.kjonn === 'k', har: H.kode, hud: this.hudHex(L) }));
  },
  kropp(L, v) {
    if (L.klaer === 'kape') {
      const base = (L.kjonn === 'k' ? 'kropp_pasient_kvinne_' : 'kropp_pasient_') + v, m = PAS_KAPE[L.farge];
      if (spriteReady(base)) { const P = Art.part(base, 1.3, 1.0, .65, .08, drawPasientBody(v)); return m ? omfargPart(P, base + '~' + L.farge, klaerMap(m)) : P; }
      return Art.part(base + '~' + L.farge, 1.3, 1.0, .65, .08, drawPasientBody(v, { Y: m ? hexMap('#e0a33a', klaerMap(m)) : '#e0a33a' }));
    }
    const base = 'kropp_' + L.klaer + '_' + v, serk = L.klaer === 'serk', box = serk ? [1.3, 1.3, .65, .38] : [1.3, 1.0, .65, .08];
    if (spriteReady(base)) return Art.part(base, ...box, () => { });
    const draw = { tvang: drawTvang, skjorte: drawSkjorte, pyjamas: drawPyjamas, serk: drawSerk }[L.klaer];
    return Art.part(base + '~' + L.farge.replace('#', '') + (L.klaer === 'skjorte' ? '.' + L.hud : ''), ...box, draw(v, L.farge, this.hudHex(L)));
  },
  sko(L) {
    if (L.sko !== 'barfot') return shoePart(L.sko);
    if (spriteReady('sko_barfot')) { const P = Art.part('sko_barfot', .5, .32, .25, .06, () => { }), h = PAS_HUD[L.hud]; return h ? omfargPart(P, 'sko_barfot~' + L.hud, hudMap(h)) : P; }
    return shoePart('barfot:' + this.hudHex(L));
  },
  pyntPart(k) {
    const [id, col] = k.split(':'), D = PAS_PYNT[id], key = 'pynt_' + id;
    if (spriteReady(key)) return Art.part(key, D.w, D.h, D.w / 2, D.h / 2, () => { });
    return Art.part(key + (col ? '~' + col.replace('#', '') : ''), D.w, D.h, D.w / 2, D.h / 2, D.draw(col || (D.farger && D.farger[0])));
  },
  /* alt som trengs for å tegne pasienten: deler per visning, farger på lemmer, sko og pynt */
  deler(look) {
    const L = this.norm(look), key = this.nokkel(L); this.cache = this.cache || new Map();
    if (this.cache.has(key)) return this.cache.get(key);
    const hud = this.hudHex(L), arm = { kape: L.klaer === 'kape' && PAS_KAPE[L.farge] ? hexMap('#e0a33a', klaerMap(PAS_KAPE[L.farge])) : '#e0a33a', tvang: L.farge, skjorte: hud, pyjamas: L.farge, serk: L.farge }[L.klaer];
    const D = { key, look: L, hode: {}, kropp: {}, rig: { arm, leg: L.klaer === 'pyjamas' ? L.farge : hud, hand: L.klaer === 'tvang' ? Col.dark(L.farge, .92) : hud, shoe: L.sko }, sko: this.sko(L), pynt: [] };
    for (const v of ['f', 'b', 's']) { D.hode[v] = this.hode(L, v); D.kropp[v] = this.kropp(L, v); }
    for (const k of L.pynt) { const P0 = PAS_PYNT[k.split(':')[0]]; D.pynt.push({ P: this.pyntPart(k), L: { at: 'head', off: P0.off, face: !!P0.face } }); }
    if (L.klaer === 'tvang' || L.klaer === 'serk') D.rig.armW = RIG.pasient.armW + .02;
    this.cache.set(key, D); return D;
  },
  /* liket fra ChatGPT (mann i morgenkåpe) farget som pasienten */
  likBilde(L) {
    const P = Art.part('lik', 1.6, .8, .8, .05, () => { }), H = PAS_HAR[L.har], hud = PAS_HUD[L.hud], m = PAS_KAPE[L.farge];
    let Q = H.map || hud ? omfargHode(P, 'lik~' + L.har + '.' + L.hud, H.map, hud) : P; if (m) Q = omfargPart(Q, Q.key + '~' + L.farge, klaerMap(m));
    // like stort som det sammensatte liket, med blodpøl under
    const k = 1.35; return Art.part('likb~' + L.har + '.' + L.hud + '.' + L.farge, 2.4, 1.2, 1.2, .08, g => { A.flat(g, A.ell(0, -.2, 1.05, .2), 'rgba(90,10,10,.38)', 0); g.drawImage(Q.canvas, -Q.ax * k, -(Q.h - Q.ay) * k, Q.w * k, Q.h * k); });
  },
  dukke(look, opt = {}) {
    const D = this.deler(look), d = new Doll('pasient', Object.assign({}, opt, { rig: D.rig, shoeP: D.sko }));
    d.setParts(D.hode, D.kropp); for (const p of D.pynt) d.addAddon(p.P, p.L); return d;
  }
};
