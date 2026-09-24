/* ============================================================
   TEGNING  -  illustrerte deler tegnet i kode (Canvas 2D)
   Alt tegnes i "skjermenheter" med origo i festepunktet og y nedover.
   Tykk mørk kontur, flat farge, én skyggetone nederst til høyre og
   et lite lys øverst til venstre. Hver del kan erstattes av en PNG
   via SPRITES (samme festepunkt), ellers brukes tegningen her.
   ============================================================ */
const PX = 128;
const INK = '#2a1a14';
const SPRITES = {}; // f.eks. SPRITES['hode_pasient_f'] = 'sprites/hode_pasient_f.png'

const Col = {
  rgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; },
  hex(r, g, b) { return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); },
  dark(h, k = .78) { const [r, g, b] = this.rgb(h); return this.hex(r * k, g * k * .98, b * k * 1.02); },
  light(h, k = .35) { const [r, g, b] = this.rgb(h); return this.hex(r + (255 - r) * k, g + (255 - g) * k, b + (255 - b) * k); }
};

const Art = {
  cache: new Map(),
  part(key, w, h, ax, ay, draw) {
    if (this.cache.has(key)) return this.cache.get(key);
    const c = document.createElement('canvas'); c.width = Math.ceil(w * PX); c.height = Math.ceil(h * PX);
    const g = c.getContext('2d');
    g.setTransform(PX, 0, 0, PX, ax * PX, (h - ay) * PX); g.lineJoin = 'round'; g.lineCap = 'round';
    draw(g);
    const P = { key, w, h, ax, ay, canvas: c, tex: new THREE.CanvasTexture(c) };
    P.tex.anisotropy = 4;
    if (SPRITES[key]) { const img = new Image(); img.onload = () => { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, c.width, c.height); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(img, 0, 0, c.width, c.height); P.tex.needsUpdate = true; }; img.src = SPRITES[key]; }
    this.cache.set(key, P); return P;
  },
  /* flat farge + skyggemåne + lys kant + kontur */
  cel(g, path, base, o = {}) {
    const lw = o.lw === undefined ? .05 : o.lw, dx = o.dx === undefined ? .06 : o.dx, dy = o.dy === undefined ? .07 : o.dy;
    g.save(); path(g); g.fillStyle = o.shadeCol || Col.dark(base, o.sk || .8); g.fill();
    g.clip();
    g.save(); g.translate(-dx, -dy); path(g); g.fillStyle = base; g.fill(); g.restore();
    // myk malt toning oppå cel-skyggen, som i Toms skisse
    if (o.soft !== false) { const gr = g.createLinearGradient(0, -1.4, 0, .15); gr.addColorStop(0, 'rgba(255,246,220,.12)'); gr.addColorStop(1, 'rgba(60,30,12,.16)'); g.fillStyle = gr; g.fillRect(-4, -4, 8, 8); }
    if (o.hi !== false) { g.save(); g.translate(dx * .9 + .012, dy * .9 + .012); path(g); g.lineWidth = o.hiW || .035; g.strokeStyle = Col.light(base, .45); g.globalAlpha = .6; g.stroke(); g.restore(); }
    g.restore();
    if (lw > 0) this.ink(g, path, lw, o.line || INK);
  },
  /* blekkstrek med tyngde: en ekstra, forskjøvet strek nederst til høyre */
  ink(g, path, lw, col = INK) {
    path(g); g.lineWidth = lw; g.strokeStyle = col; g.stroke();
    g.save(); g.translate(lw * .3, lw * .38); path(g); g.lineWidth = lw * .7; g.strokeStyle = col; g.stroke(); g.restore();
  },
  flat(g, path, fill, lw = .05, line = INK) { path(g); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) this.ink(g, path, lw, line); },
  /* litt skjeve ellipser, så ingenting ser passert ut */
  ell(x, y, rx, ry, rot = 0) {
    const n = 18, rng = mulberry32(Math.abs(Math.round(x * 9173 + y * 5171 + rx * 3137 + ry * 1931)) + 1), pts = [], c = Math.cos(rot), s = Math.sin(rot);
    for (let i = 0; i < n; i++) { const a = i / n * TAU, k = 1.045 + (rng() - .5) * .07, px = Math.cos(a) * rx * k, py = Math.sin(a) * ry * k; pts.push([x + px * c - py * s, y + px * s + py * c]); }
    return this.blob(pts);
  },
  poly(pts, close = true) { return g => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); if (close) g.closePath(); }; },
  /* glatt lukket form gjennom punkter (kvadratiske kurver mellom midtpunkter) */
  blob(pts) {
    return g => {
      g.beginPath(); const n = pts.length, mid = i => [(pts[i][0] + pts[(i + 1) % n][0]) / 2, (pts[i][1] + pts[(i + 1) % n][1]) / 2];
      const m0 = mid(n - 1); g.moveTo(m0[0], m0[1]);
      for (let i = 0; i < n; i++) { const m = mid(i); g.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]); }
      g.closePath();
    };
  },
  rr(x, y, w, h, r) { return g => { g.beginPath(); g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r); g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h); g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r); g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath(); }; },
  line(g, pts, w = .04, col = INK) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.lineWidth = w; g.strokeStyle = col; g.stroke(); },
  curve(g, a, c, b, w = .04, col = INK) { g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(c[0], c[1], b[0], b[1]); g.lineWidth = w; g.strokeStyle = col; g.stroke(); },
  dot(g, x, y, r, col = INK) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = col; g.fill(); },
  spikes(cx, cy, r, a0, a1, n, len, jit = 0) {
    const pts = []; const rng = mulberry32(n * 97 + Math.round(r * 100));
    for (let i = 0; i <= n; i++) {
      const a = lerp(a0, a1, i / n), a2 = lerp(a0, a1, (i + .5) / n);
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      if (i < n) { const L = r + len * (.7 + rng() * .6); pts.push([cx + Math.cos(a2) * L + (rng() - .5) * jit, cy + Math.sin(a2) * L]); }
    }
    return pts;
  }
};
const A = Art;

/* ============================================================
   FIGURER. Hver figur: hode (f/b/s), kropp (f/b/s), farger for strek-lemmer,
   hender og sko. s = sett fra siden, vendt mot høyre (speiles for venstre).
   Festepunkter oppgis i RIG og brukes av papirdukken.
   ============================================================ */
const SKIN = { pasient: '#f4cfa4', pleier: '#e9b48a', kultist: '#e6dccf', oppasser: '#dcb48e' };

const RIG = {
  pasient: { hip: .46, hipW: .13, neck: .56, shW: .25, shY: .47, armW: .15, legW: .13, handR: .085, arm: '#e0a33a', leg: SKIN.pasient, hand: SKIN.pasient, shoe: 'tofler', scale: .8, headLag: 1 },
  pleier: { hip: .42, hipW: .2, neck: .76, shW: .44, shY: .66, armW: .2, legW: .16, handR: .12, arm: '#f1eee4', leg: '#3a3432', hand: SKIN.pleier, shoe: 'klogg', scale: .86, headLag: .6 },
  kultist: { hip: .5, hipW: .1, neck: .7, shW: .22, shY: .62, armW: .12, legW: .11, handR: .075, arm: '#231a2c', leg: '#1c1622', hand: SKIN.kultist, shoe: 'stovel', scale: .8, cape: true, headLag: 1.2 },
  oppasser: { hip: .56, hipW: .12, neck: .8, shW: .23, shY: .72, armW: .12, legW: .12, handR: .08, arm: '#6fa88a', leg: '#5f9479', hand: '#bfe0ee', shoe: 'hvit', scale: .8, headLag: 1 }
};

/* ---------- pasienten (fra Toms journalskisse) ---------- */
function drawPasientHead(v) {
  return g => {
    const S = SKIN.pasient, HAIR = '#1f1714', cy = -.46, r = .4;
    if (v === 'b') {
      A.cel(g, A.ell(-.39, cy + .02, .07, .09), S); A.cel(g, A.ell(.39, cy + .02, .07, .09), S);
      A.cel(g, A.blob(A.spikes(0, cy, r * 1.02, Math.PI * .95, Math.PI * 2.05, 9, .13, .05).concat([[.3, cy + .3], [0, cy + .38], [-.3, cy + .3]])), HAIR, { sk: .6 });
      A.cel(g, A.ell(0, cy + .06, r * .92, r * .88), HAIR, { sk: .6, lw: 0, hi: false });
      A.line(g, [[-.1, cy - .2], [.02, cy - .05], [.12, cy - .22]], .025, '#3b2e28');
      return;
    }
    if (v === 's') {
      A.cel(g, A.ell(.02, cy, r, r * .97), S);
      A.cel(g, A.ell(.45, cy + .02, .06, .05), S, { hi: false });
      A.cel(g, A.blob(A.spikes(-.02, cy - .02, r * 1.02, Math.PI * .72, Math.PI * 1.85, 8, .14, .05).concat([[-.05, cy + .05], [-.12, cy - .1]])), HAIR, { sk: .6 });
      A.cel(g, A.ell(-.08, cy + .04, .07, .09), S);
      A.flat(g, A.ell(.26, cy + .02, .13, .13), '#f6f6ee', .04);
      A.dot(g, .31, cy + .03, .045);
      A.line(g, [[.13, cy + .01], [.03, cy - .02]], .035);
      A.flat(g, A.ell(.25, cy + .16, .07, .045), 'rgba(236,120,130,.55)', 0);
      A.curve(g, [.28, cy + .24], [.33, cy + .28], [.37, cy + .23], .03);
      A.curve(g, [.16, cy - .17], [.26, cy - .2], [.34, cy - .15], .03);
      return;
    }
    A.cel(g, A.ell(-.39, cy + .02, .07, .09), S); A.cel(g, A.ell(.39, cy + .02, .07, .09), S);
    A.cel(g, A.blob(A.spikes(0, cy - .02, r * 1.0, Math.PI * .95, Math.PI * 2.05, 10, .15, .06).concat([[.34, cy], [-.34, cy]])), HAIR, { sk: .6 });
    A.cel(g, A.ell(0, cy + .03, r * .93, r * .9), S);
    // lugg
    A.cel(g, A.poly([[-.36, cy - .1], [-.3, cy - .3], [-.1, cy - .38], [.12, cy - .37], [.32, cy - .28], [.37, cy - .08], [.25, cy - .2], [.18, cy - .06], [.08, cy - .22], [-.02, cy - .08], [-.12, cy - .24], [-.2, cy - .07], [-.27, cy - .2]]), HAIR, { sk: .6, dx: .03, dy: .04 });
    // briller
    for (const s of [-1, 1]) { A.flat(g, A.ell(s * .16, cy + .06, .135, .135), '#f6f6ee', .042); if (v === 'x') { A.line(g, [[s * .16 - .06, cy], [s * .16 + .06, cy + .12]], .035); A.line(g, [[s * .16 + .06, cy], [s * .16 - .06, cy + .12]], .035); } else A.dot(g, s * .16 + .015, cy + .08, .045); A.curve(g, [s * .16 - .07, cy - .02], [s * .16 - .05, cy - .05], [s * .16 - .02, cy - .06], .02, '#ffffff'); }
    A.line(g, [[-.03, cy + .04], [.03, cy + .04]], .035);
    for (const s of [-1, 1]) A.curve(g, [s * .08, cy - .12], [s * .16, cy - .16], [s * .25, cy - .12], .03);
    for (const s of [-1, 1]) A.flat(g, A.ell(s * .25, cy + .2, .075, .045), 'rgba(236,120,130,.55)', 0);
    A.flat(g, A.ell(0, cy + .25, .045, .035), '#8a3a32', .025);
  };
}
function drawPasientBody(v) {
  return g => {
    const Y = '#e0a33a', B = '#8a5427';
    const w0 = v === 's' ? .24 : .37, w1 = v === 's' ? .2 : .28, top = -.56;
    const robe = A.blob([[-w0, 0], [-w0 * .5, .03], [w0 * .5, .03], [w0, 0], [w1 + .03, top + .15], [w1 - .02, top + .01], [0, top - .02], [-w1 + .02, top + .01], [-w1 - .03, top + .15]]);
    A.cel(g, robe, Y);
    if (v === 'f') {
      A.cel(g, A.poly([[-.13, top + .01], [0, top + .24], [.13, top + .01], [.07, top - .01], [0, top + .1], [-.07, top - .01]]), Col.light(Y, .25), { lw: .035, hi: false });
      A.line(g, [[0, top + .24], [0, -.02]], .03, Col.dark(Y, .6));
      A.flat(g, A.rr(-.23, top + .13, .12, .09, .015), '#f4f2e8', .03); A.line(g, [[-.21, top + .16], [-.13, top + .16]], .015);
    }
    if (v === 's') A.line(g, [[.05, top + .05], [.12, top + .25]], .03, Col.dark(Y, .6));
    // belte
    A.cel(g, A.rr(-w0 + .02, -.28, (w0 - .02) * 2, .08, .03), B, { lw: .035, hi: false, dx: .02, dy: .03 });
    if (v !== 'b') { A.cel(g, A.ell(v === 's' ? .12 : .04, -.24, .05, .04), B, { lw: .03, hi: false }); A.line(g, [[v === 's' ? .12 : .04, -.22], [v === 's' ? .08 : .0, -.1]], .035, B); }
    else A.cel(g, A.ell(0, -.24, .07, .045), B, { lw: .03, hi: false });
    A.line(g, [[-w0 * .8, -.05], [-w0 * .6, -.04]], .02, Col.dark(Y, .6));
  };
}
/* ---------- pleier: firkantet og tung ---------- */
function drawPleierHead(v) {
  return g => {
    const S = SKIN.pleier, H = '#5a3a26', cy = -.34;
    if (v === 'b') { A.cel(g, A.rr(-.33, cy - .3, .66, .58, .16), H, { sk: .7 }); A.cel(g, A.ell(0, cy - .34, .15, .12), H, { sk: .7 }); A.cel(g, A.rr(-.24, cy - .42, .48, .14, .04), '#ffffff'); return; }
    if (v === 's') {
      A.cel(g, A.rr(-.28, cy - .28, .6, .56, .15), S);
      A.cel(g, A.blob([[-.3, cy - .1], [-.28, cy - .3], [.1, cy - .33], [.24, cy - .22], [0, cy - .18], [-.14, cy + .06]]), H, { sk: .7 });
      A.cel(g, A.ell(-.28, cy - .28, .12, .1), H, { sk: .7 });
      A.cel(g, A.rr(-.24, cy - .42, .5, .14, .04), '#ffffff'); A.flat(g, A.rr(.06, cy - .4, .1, .1, .01), '#b3261e', 0);
      A.cel(g, A.ell(.33, cy + .02, .07, .08), Col.dark(S, .9), { hi: false });
      A.dot(g, .2, cy - .02, .035); A.line(g, [[.12, cy - .12], [.28, cy - .08]], .05);
      A.line(g, [[.16, cy + .15], [.28, cy + .16]], .035);
      return;
    }
    A.cel(g, A.rr(-.33, cy - .28, .66, .6, .16), S);
    A.cel(g, A.blob([[-.34, cy - .02], [-.32, cy - .3], [0, cy - .36], [.32, cy - .3], [.34, cy - .02], [.22, cy - .2], [0, cy - .22], [-.22, cy - .2]]), H, { sk: .7 });
    A.cel(g, A.ell(0, cy - .36, .14, .1), H, { sk: .7 });
    A.cel(g, A.rr(-.26, cy - .46, .52, .15, .04), '#ffffff'); A.flat(g, A.rr(-.05, cy - .44, .1, .11, .01), '#b3261e', 0); A.flat(g, A.rr(-.11, cy - .41, .22, .05, .01), '#b3261e', 0);
    for (const s of [-1, 1]) { A.dot(g, s * .13, cy - .02, .04); A.line(g, [[s * .06, cy - .1], [s * .22, cy - .15]], .055); }
    A.cel(g, A.ell(0, cy + .07, .06, .06), Col.dark(S, .9), { hi: false, lw: .035 });
    A.curve(g, [-.12, cy + .2], [0, cy + .15], [.12, cy + .2], .04);
    A.curve(g, [-.12, cy + .3], [0, cy + .33], [.12, cy + .3], .025, Col.dark(S, .7));
  };
}
function drawPleierBody(v) {
  return g => {
    const W = '#f1eee4', top = -.78, w = v === 's' ? .3 : .48;
    A.cel(g, A.blob([[-w, 0], [w, 0], [w + .04, top + .3], [w - .04, top + .04], [0, top], [-w + .04, top + .04], [-w - .04, top + .3]]), W, { sk: .82 });
    if (v === 'f') {
      A.cel(g, A.rr(-.3, top + .3, .6, .44, .06), '#ffffff', { sk: .86, lw: .035 });
      A.flat(g, A.rr(-.05, top + .38, .1, .22, .01), '#b3261e', 0); A.flat(g, A.rr(-.12, top + .45, .24, .08, .01), '#b3261e', 0);
      A.cel(g, A.poly([[-.16, top + .02], [0, top + .16], [.16, top + .02]]), '#dcd8cc', { lw: .035, hi: false });
      for (const y of [.26, .7]) A.dot(g, 0, top + y, .025);
    }
    if (v === 's') { A.cel(g, A.rr(-.05, top + .3, .35, .44, .06), '#ffffff', { sk: .86, lw: .035 }); }
    if (v === 'b') { A.line(g, [[-.2, top + .45], [.2, top + .45]], .05, '#dcd8cc'); A.cel(g, A.ell(0, top + .46, .08, .05), '#ffffff', { lw: .03 }); }
  };
}
/* ---------- kultist: kappe, fire belter, dårlig holdning ---------- */
function drawKultistHead(v) {
  return g => {
    const S = SKIN.kultist, HD = '#2a1f33', cy = -.4;
    const hood = A.blob([[-.36, cy + .26], [-.4, cy - .1], [-.22, cy - .42], [.06, cy - .5], [.28, cy - .36], [.4, cy - .06], [.36, cy + .26], [0, cy + .32]]);
    if (v === 'b') { A.cel(g, hood, HD, { sk: .65 }); A.line(g, [[0, cy - .45], [.02, cy + .2]], .03, '#1a1220'); return; }
    if (v === 's') {
      A.cel(g, hood, HD, { sk: .65 });
      A.cel(g, A.ell(.12, cy + .02, .22, .27), S);
      A.cel(g, A.blob([[-.1, cy - .28], [.24, cy - .3], [.36, cy - .12], [.1, cy - .16]]), HD, { sk: .65, lw: .03 });
      A.flat(g, A.ell(.2, cy + .01, .08, .06), '#241a2a', 0); A.dot(g, .22, cy + .01, .02, '#f4f0e6');
      A.line(g, [[.14, cy + .16], [.26, cy + .15]], .03);
      A.line(g, [[.2, cy + .05], [.19, cy + .12]], .018, '#5a5a6a');
      return;
    }
    A.cel(g, hood, HD, { sk: .65 });
    A.cel(g, A.ell(0, cy + .02, .24, .28), S);
    A.cel(g, A.blob([[-.27, cy - .08], [-.2, cy - .3], [.2, cy - .3], [.27, cy - .08], [.12, cy - .18], [-.12, cy - .18]]), HD, { sk: .65, lw: .03 });
    for (const s of [-1, 1]) { A.flat(g, A.ell(s * .1, cy + .01, .085, .07), '#241a2a', 0); A.dot(g, s * .1, cy + .02, .022, '#f4f0e6'); A.dot(g, s * .1, cy + .02, .01, '#b3261e'); }
    A.curve(g, [-.08, cy + .18], [0, cy + .14], [.08, cy + .18], .03);
    A.line(g, [[.1, cy + .08], [.11, cy + .15]], .018, '#5a5a6a');
  };
}
function drawKultistBody(v) {
  return g => {
    const R0 = '#231a2c', top = -.72, w = v === 's' ? .18 : .24;
    A.cel(g, A.blob([[-w - .06, 0], [w + .06, 0], [w + .02, top + .4], [w, top + .04], [0, top], [-w, top + .04], [-w - .02, top + .4]]), R0, { sk: .6 });
    const belts = [[-.2, .1], [-.32, -.12], [-.44, .14], [-.58, -.08]];
    belts.forEach(([y, tilt], i) => {
      g.save(); g.translate(0, y); g.rotate(tilt);
      A.cel(g, A.rr(-w - .04, -.03, (w + .04) * 2, .06, .02), '#5a3a22', { lw: .03, hi: false, dx: .01, dy: .02 });
      if (v !== 'b') A.flat(g, A.rr(-.04 + (i % 2 ? .06 : -.06), -.04, .08, .08, .01), '#d8b040', .025);
      g.restore();
    });
    if (v !== 'b') { A.curve(g, [-.12, top + .06], [0, top + .22], [.12, top + .06], .025, '#b8b8c4'); A.cel(g, A.ell(0, top + .24, .05, .06), '#e8e4dc', { lw: .025, hi: false }); A.dot(g, -.017, top + .235, .012); A.dot(g, .017, top + .235, .012); }
  };
}
function drawKultistCape(v) {
  return g => {
    const C = '#4a0f2a', L = '#6b2d8c';
    const pts = [[-.3, -.95], [.3, -.95], [.44, -.3], [.52, .02], [.36, -.08], [.24, .06], [.1, -.06], [-.04, .06], [-.18, -.06], [-.32, .06], [-.44, -.06], [-.5, .02]];
    if (v === 'b') { A.cel(g, A.poly(pts), C, { sk: .7 }); A.line(g, [[-.12, -.8], [-.2, -.2]], .025, Col.dark(C, .6)); A.line(g, [[.14, -.8], [.22, -.2]], .025, Col.dark(C, .6)); return; }
    A.cel(g, A.poly(pts), L, { sk: .7 });
    A.cel(g, A.poly([[-.24, -.95], [.24, -.95], [.34, -.2], [.18, -.12], [0, -.2], [-.18, -.12], [-.34, -.2]]), C, { sk: .7, lw: .03 });
  };
}
/* ---------- oppasser: lang, grønn, maske ---------- */
function drawOppasserHead(v) {
  return g => {
    const S = SKIN.oppasser, M = '#6fa88a', cy = -.38;
    if (v === 'b') { A.cel(g, A.ell(0, cy, .3, .33), S); A.cel(g, A.blob([[-.32, cy + .02], [-.3, cy - .28], [0, cy - .4], [.3, cy - .28], [.32, cy + .02], [0, cy - .04]]), M); A.line(g, [[-.28, cy + .06], [.28, cy + .06]], .025, '#e8e8e8'); return; }
    if (v === 's') {
      A.cel(g, A.ell(.02, cy, .29, .33), S);
      A.cel(g, A.blob([[-.28, cy + .02], [-.26, cy - .28], [.04, cy - .4], [.3, cy - .26], [.31, cy - .1], [0, cy - .12]]), M);
      A.cel(g, A.poly([[.08, cy + .02], [.34, cy + .02], [.34, cy + .22], [.1, cy + .24]]), '#f2f4f2', { lw: .035, hi: false });
      A.line(g, [[.08, cy + .08], [-.12, cy + .02]], .018, '#c8c8c8');
      A.flat(g, A.ell(.2, cy - .06, .05, .025), '#f4f0e6', .025); A.dot(g, .22, cy - .06, .018);
      return;
    }
    A.cel(g, A.ell(0, cy, .3, .34), S);
    A.cel(g, A.blob([[-.32, cy - .02], [-.3, cy - .3], [0, cy - .42], [.3, cy - .3], [.32, cy - .02], [0, cy - .12]]), M);
    A.cel(g, A.rr(-.25, cy + .02, .5, .24, .06), '#f2f4f2', { lw: .035, hi: false });
    for (const y of [.08, .14, .2]) A.line(g, [[-.18, cy + y], [.18, cy + y]], .012, '#c8ccc8');
    for (const s of [-1, 1]) { A.flat(g, A.ell(s * .11, cy - .06, .06, .03), '#f4f0e6', .025); A.dot(g, s * .11, cy - .06, .018); A.line(g, [[s * .05, cy - .14], [s * .17, cy - .12]], .03); A.curve(g, [s * .06, cy - .01], [s * .11, cy + .01], [s * .16, cy - .01], .015, '#8a6a5a'); }
  };
}
function drawOppasserBody(v) {
  return g => {
    const M = '#6fa88a', top = -.84, w = v === 's' ? .2 : .27;
    A.cel(g, A.blob([[-w, 0], [w, 0], [w + .02, top + .3], [w - .02, top + .04], [0, top], [-w + .02, top + .04], [-w - .02, top + .3]]), M);
    if (v === 'f') { A.line(g, [[-.12, top + .03], [0, top + .2], [.12, top + .03]], .03, Col.dark(M, .55)); A.cel(g, A.rr(.06, top + .3, .14, .14, .02), Col.dark(M, .9), { lw: .03, hi: false }); A.line(g, [[.1, top + .3], [.1, top + .22]], .025, '#2a4a8a'); A.line(g, [[.15, top + .3], [.16, top + .24]], .025, '#b3261e'); }
    A.line(g, [[-w + .04, -.02], [-w + .06, -.2]], .02, Col.dark(M, .6));
  };
}
/* ---------- avløpsyngel: hele figuren i én del, tentakler legges på i sanntid ---------- */
function drawYngel(v) {
  return g => {
    const B = '#3a1a4a', L = '#6b3a82';
    A.cel(g, A.blob([[-.46, -.06], [-.48, -.36], [-.3, -.6], [0, -.66], [.32, -.58], [.5, -.32], [.46, -.04], [0, .02]]), B, { sk: .62 });
    A.cel(g, A.ell(0, -.18, .3, .14), L, { lw: .03, hi: false });
    if (v === 'b') { for (const [x, y] of [[-.2, -.4], [.1, -.5], [.25, -.3]]) A.flat(g, A.ell(x, y, .05, .04), L, .025); return; }
    const eyes = v === 's' ? [[.18, -.44, .11], [.34, -.32, .08], [.02, -.52, .07]] : [[-.18, -.42, .12], [.14, -.46, .1], [.3, -.3, .07], [-.02, -.56, .06]];
    for (const [x, y, r] of eyes) { A.flat(g, A.ell(x, y, r, r), '#f4f0e0', .035); A.dot(g, x + r * .2, y + r * .1, r * .45); A.dot(g, x - r * .15, y - r * .2, r * .18, '#ffffff'); }
    g.beginPath(); g.moveTo(-.22, -.22); g.quadraticCurveTo(0, -.08, .24, -.22); g.quadraticCurveTo(0, -.14, -.22, -.22); g.fillStyle = '#1a0a22'; g.fill(); g.lineWidth = .03; g.strokeStyle = INK; g.stroke();
    for (let i = 0; i < 5; i++) { const x = -.16 + i * .08; A.flat(g, A.poly([[x - .03, -.2 + Math.abs(i - 2) * .012], [x + .03, -.2 + Math.abs(i - 2) * .012], [x, -.15]]), '#f4f0e0', .015); }
  };
}
/* ---------- sko ---------- */
function drawShoe(kind) {
  return g => {
    if (kind === 'tofler') {
      const P = '#f2a8c8';
      A.cel(g, A.ell(-.07, -.1, .045, .1, -.3), P, { lw: .035, hi: false }); A.cel(g, A.ell(.07, -.1, .045, .1, .3), P, { lw: .035, hi: false });
      A.cel(g, A.ell(0, -.04, .16, .08), P, { lw: .04 });
      A.dot(g, -.05, -.06, .016); A.dot(g, .05, -.06, .016); A.dot(g, 0, -.03, .014, '#b3261e');
    } else if (kind === 'klogg') { A.cel(g, A.blob([[-.14, 0], [.16, 0], [.16, -.1], [.06, -.12], [-.14, -.1]]), '#2a2624', { lw: .04 }); }
    else if (kind === 'stovel') { A.cel(g, A.blob([[-.1, 0], [.2, 0], [.24, -.04], [.08, -.08], [.06, -.18], [-.1, -.18]]), '#16121a', { lw: .04 }); }
    else { A.cel(g, A.blob([[-.13, 0], [.15, 0], [.15, -.08], [-.13, -.1]]), '#f2f2ee', { lw: .04 }); }
  };
}
/* ---------- våpen: tegnet med grepet i origo, pekende oppover (negativ y) ---------- */
function drawWeapon(id) {
  return g => {
    if (id === 'mopp') {
      A.cel(g, A.rr(-.035, -1.05, .07, 1.2, .03), '#a8743a', { lw: .035, hi: false, dx: .015, dy: 0 });
      A.cel(g, A.rr(-.12, -1.14, .24, .12, .03), '#9aa0a6', { lw: .035 });
      const st = [[-.2, -1.35], [-.14, -1.42], [-.05, -1.38], [.04, -1.45], [.12, -1.38], [.2, -1.4], [.22, -1.2], [-.22, -1.18]];
      A.cel(g, A.blob(st), '#e8dcc0', { lw: .04 });
      for (let i = 0; i < 5; i++) A.line(g, [[-.14 + i * .07, -1.18], [-.16 + i * .08, -1.36]], .018, '#b8a888');
      for (const [x, y] of [[-.12, -1.42], [.08, -1.46], [.18, -1.36]]) A.flat(g, A.ell(x, y, .035, .05), '#9a4ac8', .02);
    } else if (id === 'stativ') {
      A.cel(g, A.rr(-.03, -1.3, .06, 1.45, .03), '#c8ccd0', { lw: .035, hi: false, dx: .015, dy: 0 });
      A.line(g, [[-.18, -1.3], [.18, -1.3]], .04); A.cel(g, A.rr(.04, -1.28, .18, .26, .06), '#e8f0c8', { lw: .03 });
    } else if (id === 'sag') {
      A.cel(g, A.rr(-.06, -.2, .12, .28, .04), '#6b4226', { lw: .035 });
      A.cel(g, A.poly([[-.06, -.2], [.1, -.2], [.1, -.85], [-.06, -.78]]), '#c8ccd0', { lw: .035 });
      for (let i = 0; i < 7; i++) A.line(g, [[-.06, -.25 - i * .08], [-.1, -.29 - i * .08]], .025);
    } else if (id === 'bekken') {
      A.cel(g, A.rr(-.04, -.4, .08, .45, .03), '#e9e4d8', { lw: .035 });
      A.cel(g, A.ell(0, -.58, .26, .2), '#e9e4d8', { lw: .04 }); A.flat(g, A.ell(0, -.58, .17, .12), '#cfc8b8', .025);
    } else if (id === 'krok') {
      A.cel(g, A.rr(-.05, -.3, .1, .34, .03), '#3a3a44', { lw: .035 });
      g.beginPath(); g.moveTo(0, -.3); g.lineTo(0, -.72); g.quadraticCurveTo(0, -1.0, .24, -.98); g.quadraticCurveTo(.4, -.92, .34, -.74); g.lineWidth = .13; g.strokeStyle = INK; g.stroke(); g.lineWidth = .07; g.strokeStyle = '#c8ccd0'; g.stroke();
    } else if (id === 'slange') {
      A.cel(g, A.rr(-.07, -.55, .14, .6, .04), '#b87333', { lw: .04 }); A.cel(g, A.rr(-.1, -.72, .2, .2, .04), '#8a5a2a', { lw: .04 }); A.flat(g, A.ell(0, -.76, .08, .04), '#15100c', .02);
    } else if (id === 'sproyte') {
      A.cel(g, A.rr(-.06, -.55, .12, .5, .03), '#dff0f4', { lw: .035 }); A.flat(g, A.rr(-.04, -.4, .08, .3, .02), '#9ad06a', 0);
      A.line(g, [[0, -.55], [0, -.82]], .025); A.line(g, [[-.1, -.03], [.1, -.03]], .04);
    }
  };
}
const WEAPON_ART = { mopp: [.7, 1.65, .35, .12], stativ: [.6, 1.5, .3, .12], sag: [.4, 1.0, .2, .15], bekken: [.7, .95, .35, .12], sproyte: [.4, 1.0, .2, .15], krok: [.7, 1.2, .3, .1], slange: [.4, 1.0, .2, .1] };
function weaponPart(id) { const d = WEAPON_ART[id]; return Art.part('vaapen_' + id, d[0], d[1], d[2], d[3], drawWeapon(id)); }

/* ---------- delregister ---------- */
function charPart(type, piece, v) {
  const extra = NPC_ART[type] || BOSS_ART[type];
  if (extra && piece !== 'kappe') v = 'f';
  const key = piece + '_' + type + '_' + v;
  if (Art.cache.has(key)) return Art.cache.get(key);
  const H = { pasient: drawPasientHead, pleier: drawPleierHead, kultist: drawKultistHead, oppasser: drawOppasserHead }[type];
  const B = { pasient: drawPasientBody, pleier: drawPleierBody, kultist: drawKultistBody, oppasser: drawOppasserBody }[type];
  const big = BOSS_ART[type] ? 1.5 : 1;
  if (piece === 'hode') return Art.part(key, 1.2 * big, 1.1 * big, .6 * big, .1, extra ? extra.head : H(v));
  if (piece === 'kropp') return Art.part(key, 1.3 * big, 1.0 * big, .65 * big, .08, extra ? extra.body : B(v));
  if (piece === 'kappe') return Art.part(key, 1.2, 1.1, .6, .08, drawKultistCape(v));
  if (piece === 'blob') return type === 'journalen' ? Art.part(key, 1.6, 1.1, .8, .15, drawJournalen(v)) : Art.part(key, 1.2, .8, .6, .08, drawYngel(v));
}
function shoePart(kind) { return Art.part('sko_' + kind, .5, .32, .25, .06, drawShoe(kind)); }

/* ============================================================
   REKVISITTER: tegnet i 3/4-perspektiv, festet i forkant midt på.
   Farget kontur per materiale, slik Conan Chop Chop gjør det.
   ============================================================ */
const WOOD = '#8a5a34', WOODL = '#3a2414', STEEL = '#b4bcc2', STEELL = '#2f3a40';
const PROPS = {
  chair: [.8, 1.15, .4, .05, g => {
    for (const x of [-.26, .2]) A.cel(g, A.rr(x, -.42, .07, .42, .02), Col.dark(WOOD, .85), { line: WOODL, lw: .04, hi: false });
    A.cel(g, A.rr(-.3, -1.05, .6, .42, .06), WOOD, { line: WOODL });
    for (const x of [-.14, 0, .14]) A.line(g, [[x, -1.0], [x, -.68]], .025, Col.dark(WOOD, .6));
    A.cel(g, A.poly([[-.32, -.46], [.32, -.46], [.28, -.68], [-.28, -.68]]), Col.light(WOOD, .15), { line: WOODL });
    A.cel(g, A.rr(-.32, -.48, .64, .08, .02), Col.dark(WOOD, .8), { line: WOODL, lw: .04, hi: false });
  }],
  bench: [2.0, 1.1, 1.0, .05, g => {
    for (const x of [-.85, .78]) A.cel(g, A.rr(x, -.42, .08, .42, .02), Col.dark(WOOD, .85), { line: WOODL, lw: .04, hi: false });
    A.cel(g, A.rr(-.92, -1.0, 1.84, .34, .06), WOOD, { line: WOODL });
    A.cel(g, A.poly([[-.94, -.46], [.94, -.46], [.9, -.66], [-.9, -.66]]), Col.light(WOOD, .15), { line: WOODL });
    A.cel(g, A.rr(-.94, -.48, 1.88, .08, .02), Col.dark(WOOD, .8), { line: WOODL, lw: .04, hi: false });
  }],
  plant: [1.1, 1.7, .55, .05, g => {
    const G1 = '#5f8a3a', GL = '#243a14';
    for (const [a, l] of [[-2.2, .7], [-1.7, .8], [-1.2, .75], [-.9, .6], [-2.6, .55], [-1.45, .5]]) {
      g.save(); g.translate(0, -.5); g.rotate(a + Math.PI / 2);
      A.cel(g, A.blob([[0, 0], [.12, -l * .4], [.02, -l], [-.1, -l * .45]]), G1, { line: GL, lw: .035 }); A.line(g, [[0, 0], [.01, -l * .9]], .02, GL); g.restore();
    }
    A.cel(g, A.poly([[-.24, 0], [.24, 0], [.3, -.46], [-.3, -.46]]), '#b0582a', { line: '#4a1a0a' });
    A.cel(g, A.rr(-.33, -.54, .66, .1, .03), '#c8703a', { line: '#4a1a0a', lw: .04, hi: false });
  }],
  trolley: [1.1, 1.3, .55, .05, g => {
    for (const x of [-.4, .36]) { A.line(g, [[x, -.1], [x + .02, -.9]], .05, STEELL); A.line(g, [[x, -.1], [x + .02, -.9]], .025, STEEL); A.dot(g, x, -.06, .07, '#2a2a2a'); }
    A.cel(g, A.poly([[-.48, -.3], [.48, -.3], [.44, -.5], [-.44, -.5]]), STEEL, { line: STEELL });
    A.cel(g, A.poly([[-.5, -.84], [.5, -.84], [.44, -1.08], [-.44, -1.08]]), Col.light(STEEL, .2), { line: STEELL });
    A.cel(g, A.rr(-.5, -.86, 1, .07, .02), STEEL, { line: STEELL, lw: .035, hi: false });
    A.cel(g, A.rr(-.3, -1.22, .1, .3, .03), '#6aa06a', { line: '#1a3a1a', lw: .035 }); A.cel(g, A.rr(-.12, -1.18, .1, .24, .03), '#a06a3a', { line: '#3a1a0a', lw: .035 });
    A.cel(g, A.rr(.08, -1.08, .28, .14, .02), '#f2efe4', { line: INK, lw: .035 });
  }],
  soup: [1.1, 1.4, .55, .05, g => {
    PROPS.trolley[4](g);
    A.cel(g, A.rr(-.28, -1.34, .5, .36, .08), '#9aa0a6', { line: STEELL }); A.flat(g, A.ell(-.03, -1.32, .24, .07), '#d8a040', .035, STEELL);
  }],
  lamp: [.9, 2.0, .45, .05, g => {
    A.cel(g, A.ell(0, -.05, .3, .09), '#555a60', { line: STEELL });
    A.line(g, [[0, -.08], [.02, -1.5]], .06, STEELL); A.line(g, [[0, -.08], [.02, -1.5]], .03, STEEL);
    A.line(g, [[.02, -1.5], [.18, -1.62]], .05, STEELL);
    A.cel(g, A.blob([[-.08, -1.5], [.12, -1.8], [.42, -1.72], [.4, -1.5], [.2, -1.42]]), '#8fa89a', { line: '#1f2f28' });
    A.flat(g, A.ell(.28, -1.5, .1, .05, -.3), '#fff3b0', .03, '#6a5a20');
  }],
  cabinet: [1.0, 1.7, .5, .05, g => {
    const C = '#6f8a55', L = '#23301a';
    A.cel(g, A.rr(-.42, -1.4, .84, 1.4, .04), C, { line: L });
    A.cel(g, A.poly([[-.42, -1.4], [.42, -1.4], [.36, -1.62], [-.36, -1.62]]), Col.light(C, .2), { line: L });
    for (let i = 0; i < 3; i++) { A.cel(g, A.rr(-.34, -1.32 + i * .44, .68, .38, .03), Col.dark(C, .92), { line: L, lw: .035, hi: false }); A.flat(g, A.rr(-.08, -1.2 + i * .44, .16, .05, .02), '#d4b048', .025, L); A.flat(g, A.rr(-.1, -1.28 + i * .44, .2, .06, .01), '#efe4c4', .02, L); }
  }],
  bed: [1.2, 2.4, .6, .05, g => {
    const I = '#dfe4e2', IL = '#2f3a40';
    A.line(g, [[-.5, -1.55], [-.5, -2.25]], .06, IL); A.line(g, [[.5, -1.55], [.5, -2.25]], .06, IL);
    A.cel(g, A.rr(-.5, -2.3, 1, .18, .06), I, { line: IL, lw: .04 });
    for (const x of [-.25, 0, .25]) A.line(g, [[x, -2.12], [x, -1.7]], .035, IL);
    A.cel(g, A.poly([[-.5, -.35], [.5, -.35], [.46, -1.78], [-.46, -1.78]]), '#f4f2ea', { line: IL, sk: .85 });
    A.cel(g, A.rr(-.3, -1.78, .6, .3, .1), '#ffffff', { line: IL, lw: .04, sk: .86 });
    A.cel(g, A.poly([[-.52, -.3], [.52, -.3], [.48, -1.2], [-.48, -1.2]]), '#7a9ab8', { line: '#1f2f40', sk: .8 });
    A.line(g, [[-.48, -1.12], [.48, -1.12]], .05, '#f4f2ea');
    A.cel(g, A.rr(-.52, -.35, 1.04, .33, .04), I, { line: IL, lw: .04 });
    for (const x of [-.44, .44]) A.dot(g, x, -.03, .06, '#2a2a2a');
  }],
  tub: [1.2, 2.2, .6, .05, g => {
    A.cel(g, A.rr(-.52, -2.05, 1.04, 2.05, .3), '#f2f0ea', { line: '#2f3a40', sk: .85 });
    A.cel(g, A.rr(-.4, -1.9, .8, 1.5, .24), '#cfd8d6', { line: '#2f3a40', lw: .035, hi: false });
    for (const x of [-.4, .4]) A.cel(g, A.ell(x, -.03, .07, .05), '#d4b048', { line: '#4a3a10', lw: .03 });
  }],
  drain: [1.0, .6, .5, .3, g => {
    A.flat(g, A.ell(0, 0, .36, .24), '#15100c', .04, '#4a4a4a');
    for (let i = -2; i <= 2; i++) A.line(g, [[i * .1, -.18], [i * .1, .18]], .035, '#6a6a6a');
  }],
  crate: [1.0, 1.2, .5, .05, g => {
    const C = '#a8763e', L = '#3a2410';
    A.cel(g, A.rr(-.4, -.7, .8, .7, .03), C, { line: L });
    A.cel(g, A.poly([[-.4, -.7], [.4, -.7], [.34, -.96], [-.34, -.96]]), Col.light(C, .2), { line: L });
    A.line(g, [[-.4, -.7], [.4, 0]], .05, L); A.line(g, [[-.34, -.73], [.36, -.03]], .03, Col.light(C, .1));
  }]
};
function propPart(k) { const d = PROPS[k]; return Art.part('prop_' + k, d[0], d[1], d[2], d[3], d[4]); }

/* portrett til HUD: hodet i front-visning, beskåret */
function portraitCanvas(type) {
  const P = charPart(type, 'hode', 'f'), c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), s = .94, w = P.canvas.width * s, h = P.canvas.height * s; g.drawImage(P.canvas, (128 - w) / 2, 8, w, h); return c;
}

/* effekter: støvsky (Castle Crashers), tann, treffstjerne */
function puffPart(i = 0) {
  return Art.part('puff' + i, 1.1, 1.0, .55, .1, g => {
    const rng = mulberry32(31 + i * 17), pts = [];
    for (let k = 0; k < 9; k++) { const a = k / 9 * TAU, r = .34 + rng() * .1; pts.push([Math.cos(a) * r * 1.2, -.42 + Math.sin(a) * r]); }
    A.cel(g, A.blob(pts), '#d9c4a0', { line: '#6b5238', lw: .045, sk: .82, dx: .08, dy: .09 });
    for (let k = 0; k < 3; k++) A.flat(g, A.ell(-.2 + k * .2, -.52 + (k % 2) * .08, .1, .06), 'rgba(255,248,230,.55)', 0);
  });
}
function toothPart() { return Art.part('tann', .34, .4, .17, .05, g => { A.cel(g, A.blob([[-.12, -.3], [-.04, -.33], [0, -.28], [.04, -.33], [.12, -.3], [.12, -.18], [.07, -.02], [.03, -.05], [0, -.12], [-.03, -.05], [-.07, -.02], [-.12, -.18]]), '#f4dc7a', { lw: .035, dx: .03, dy: .03 }); }); }
function starPart() { return Art.part('stjerne', 1, 1, .5, .5, g => { const pts = []; for (let k = 0; k < 16; k++) { const a = k / 16 * TAU, r = k % 2 ? .16 : .42; pts.push([Math.cos(a) * r, Math.sin(a) * r]); } A.flat(g, A.poly(pts), '#fff6c8', .04); A.flat(g, A.ell(0, 0, .12, .12), '#ffffff', 0); }); }

/* ============================================================
   KORTILLUSTRASJONER til evnene (journalen og HUD). 1 x 1 enhet, origo i midten.
   ============================================================ */
const CARD_ART = {
  due: g => {
    A.cel(g, A.blob([[-.36, .12], [-.3, -.08], [-.05, -.16], [.16, -.1], [.28, .02], [.18, .18], [-.1, .22]]), '#8a93a6', { lw: .04 });
    A.cel(g, A.blob([[-.36, .1], [-.46, .02], [-.44, .16]]), '#6a7388', { lw: .035, hi: false });
    A.cel(g, A.ell(.22, -.2, .12, .12), '#7d8aa2', { lw: .04 });
    A.cel(g, A.blob([[.12, -.12], [.26, -.06], [.22, .04], [.08, 0]]), '#6f9a8a', { lw: .025, hi: false });
    A.flat(g, A.poly([[.32, -.22], [.44, -.18], [.32, -.15]]), '#e8b93a', .025);
    A.dot(g, .25, -.23, .028, '#b3261e'); A.dot(g, .25, -.23, .012);
    A.cel(g, A.blob([[-.2, -.02], [0, -.08], [.1, .06], [-.12, .1]]), '#737c90', { lw: .03, hi: false });
    A.line(g, [[-.02, .2], [-.04, .34], [-.1, .36]], .03, '#b3261e'); A.line(g, [[.06, .2], [.07, .34], [.12, .36]], .03, '#b3261e');
  },
  lys: g => {
    const gr = g.createRadialGradient(.1, .05, .02, .1, .05, .45); gr.addColorStop(0, 'rgba(255,240,160,.95)'); gr.addColorStop(1, 'rgba(255,200,80,0)'); g.fillStyle = gr; g.beginPath(); g.arc(.1, .05, .45, 0, TAU); g.fill();
    A.line(g, [[-.34, .38], [-.2, .08], [-.28, -.18], [-.12, -.3]], .05, '#2f3a40'); A.line(g, [[-.34, .38], [-.2, .08], [-.28, -.18], [-.12, -.3]], .025, '#8a9096');
    A.cel(g, A.blob([[-.22, -.32], [.02, -.42], [.26, -.2], [.18, .06], [-.06, -.04]]), '#3f4a4a', { lw: .04 });
    A.cel(g, A.ell(.1, -.08, .15, .13, -.6), '#fff3b0', { lw: .035, hi: false });
    for (let i = 0; i < 6; i++) { const a = -.2 + i * .35; A.line(g, [[.1 + Math.cos(a) * .22, -.08 + Math.sin(a) * .22], [.1 + Math.cos(a) * .34, -.08 + Math.sin(a) * .34]], .025, '#c89a20'); }
  },
  skyggehand: g => {
    for (let k = 0; k < 7; k++) A.flat(g, A.ell(-.3 + k * .1, .3 - (k % 2) * .04, .08, .05), 'rgba(123,58,166,.45)', 0);
    A.cel(g, A.blob([[-.3, .3], [-.24, .02], [-.28, -.22], [-.2, -.26], [-.12, -.06], [-.1, -.36], [-.02, -.38], [0, -.1], [.06, -.4], [.14, -.38], [.12, -.08], [.2, -.3], [.28, -.26], [.2, .02], [.34, -.06], [.36, .02], [.18, .22], [.1, .34]]), '#5a2a7a', { lw: .045, sk: .7 });
    A.line(g, [[-.06, .08], [.08, .06]], .02, '#3a1450'); A.line(g, [[-.02, .16], [.1, .14]], .02, '#3a1450');
  },
  stempel: g => {
    for (let i = 0; i < 5; i++) { const a = -2.6 + i * .5; A.line(g, [[Math.cos(a) * .2, .2 + Math.sin(a) * .08], [Math.cos(a) * .42, .2 + Math.sin(a) * .2]], .03, '#b3261e'); }
    A.flat(g, A.ell(0, .28, .3, .08), 'rgba(179,38,30,.8)', .03, '#6a1410');
    A.cel(g, A.rr(-.2, .06, .4, .14, .03), '#6a2a1a', { lw: .04 });
    A.cel(g, A.rr(-.06, -.2, .12, .28, .04), '#b3261e', { lw: .04 });
    A.cel(g, A.ell(0, -.3, .15, .12), '#b3261e', { lw: .045 });
  },
  brekning: g => {
    A.cel(g, A.ell(-.1, -.14, .22, .22), '#f4cfa4', { lw: .04 });
    A.flat(g, A.ell(-.02, -.08, .07, .05), '#2a1a14', .02);
    A.cel(g, A.blob([[-.02, -.06], [.22, 0], [.36, .18], [.28, .34], [.04, .36], [-.1, .28], [.06, .14]]), '#9fae3a', { lw: .035 });
    for (const [x, y] of [[.3, .1], [.14, .3], [.36, .3]]) A.flat(g, A.ell(x, y, .04, .03), '#c8d46a', .02);
  },
  monolog: g => {
    A.cel(g, A.blob([[-.4, -.3], [.4, -.32], [.42, .12], [.02, .14], [-.2, .34], [-.14, .14], [-.4, .12]]), '#f6ead0', { lw: .045 });
    for (let i = 0; i < 3; i++) A.line(g, [[-.28, -.18 + i * .1], [.28 - i * .1, -.18 + i * .1]], .03, '#6b4a2c');
  },
  ukjent: g => {
    A.flat(g, A.ell(0, -.18, .16, .18), '#3a3a40', 0); A.flat(g, A.blob([[-.3, .38], [-.26, .06], [0, -.02], [.26, .06], [.3, .38]]), '#3a3a40', 0);
    g.fillStyle = '#efe4c4'; g.font = 'bold .34px Georgia, serif'; g.textAlign = 'center'; g.fillText('?', 0, -.06);
  }
};
function cardArtCanvas(id, size = 120) {
  const P = Art.part('kort_' + id, 1, 1, .5, .5, CARD_ART[id] || CARD_ART.ukjent);
  const c = document.createElement('canvas'); c.width = c.height = size; c.getContext('2d').drawImage(P.canvas, 0, 0, size, size); return c;
}
/* hel figur til portrett (journal og dødskort): lemmer som blekkstreker */
function drawDollPortrait(g, type, cx, cy, S) {
  const R0 = RIG[type], L = (a, b, w, col) => { for (const [ww, cc] of [[w + .09, INK], [w, col]]) { g.beginPath(); g.moveTo(cx + a[0] * S, cy - a[1] * S); g.quadraticCurveTo(cx + (a[0] + b[0]) / 2 * S + 3, cy - (a[1] + b[1]) / 2 * S, cx + b[0] * S, cy - b[1] * S); g.lineWidth = ww * S; g.strokeStyle = cc; g.lineCap = 'round'; g.stroke(); } };
  const img = (P, x, y) => g.drawImage(P.canvas, cx + (x - P.ax) * S, cy - (y + P.h - P.ay) * S, P.w * S, P.h * S);
  const hip = R0.hip, sh = hip + R0.shY, neck = hip + R0.neck, hw = R0.hipW;
  L([-hw, hip + .04], [-hw - .04, .08], R0.legW, R0.leg); L([hw, hip + .04], [hw + .04, .08], R0.legW, R0.leg);
  img(shoePart(R0.shoe), -hw - .05, 0); img(shoePart(R0.shoe), hw + .05, 0);
  img(charPart(type, 'kropp', 'f'), 0, hip);
  for (const s of [-1, 1]) { L([s * R0.shW, sh], [s * (R0.shW + .08), sh - .4], R0.armW, R0.arm); g.beginPath(); g.arc(cx + s * (R0.shW + .08) * S, cy - (sh - .4) * S, (R0.handR + .045) * S, 0, TAU); g.fillStyle = INK; g.fill(); g.beginPath(); g.arc(cx + s * (R0.shW + .08) * S, cy - (sh - .4) * S, R0.handR * S, 0, TAU); g.fillStyle = R0.hand; g.fill(); }
  img(charPart(type, 'hode', 'f'), 0, neck - .02);
}

/* ============================================================
   MØBLER: ortografisk kamera rett langs z gjør en kasse til to rektangler,
   toppen (dybde * sin) over fronten (høyde * cos). Detaljer tegnes oppå.
   ============================================================ */
const SINP = Math.sin(CAM_PITCH), COSP = Math.cos(CAM_PITCH);
function boxArt(key, w, d, hgt, col, line, detail) {
  const tf = d * SINP, ff = hgt * COSP;
  return Art.part(key, w + .3, tf + ff + .35, (w + .3) / 2, .12, g => {
    A.cel(g, A.rr(-w / 2, -ff, w, ff, .04), col, { line, lw: .045, hi: false });
    A.cel(g, A.rr(-w / 2, -ff - tf, w, tf + .02, .04), Col.light(col, .18), { line, lw: .045, sk: .9 });
    if (detail) detail(g, w, tf, ff);
  });
}
const P_ = { wood: '#8a5a34', woodL: '#3a2414', steel: '#b4bcc2', steelL: '#2f3a40', green: '#6f8a55', greenL: '#23301a' };
function drawers(g, w, ff, n, col, line) { for (let i = 0; i < n; i++) { const y = -ff + .06 + i * (ff - .1) / n, hh = (ff - .1) / n - .05; A.cel(g, A.rr(-w / 2 + .08, y, w - .16, hh, .03), Col.dark(col, .92), { line, lw: .03, hi: false, soft: false }); A.flat(g, A.rr(-.07, y + hh / 2 - .025, .14, .05, .02), '#d4b048', .02, line); } }
function bedArt(style, fw, fd, head) {
  const S = { bed: ['#dfe4e2', '#2f3a40', '#f4f2ea', '#7a9ab8', .55], gurney: ['#b4bcc2', '#2f3a40', '#f4f2ea', '#e8e4da', .7], optable: ['#9aa4a8', '#2f3a40', '#dfeee4', '#6f9a7a', .8], tub: ['#f2f0ea', '#2f3a40', '#9fd0e4', '#6ab0d0', .6] }[style];
  const key = 'seng_' + style + fw + fd + head;
  return boxArt(key, fw * .9, fd * .9, S[4], S[0], S[1], (g, w, tf, ff) => {
    const top = -ff - tf;
    if (style === 'tub') { A.cel(g, A.rr(-w / 2 + .1, top + .08, w - .2, tf - .1, .2), S[2], { line: S[1], lw: .035, soft: false }); A.line(g, [[-w / 4, top + tf * .4], [w / 6, top + tf * .45]], .03, '#e8fbff'); A.line(g, [[-w / 8, top + tf * .6], [w / 4, top + tf * .62]], .025, '#e8fbff'); return; }
    A.cel(g, A.rr(-w / 2 + .06, top + .05, w - .12, tf - .06, .06), S[2], { line: S[1], lw: .035, sk: .88 });
    const along = fd > fw, blanket = S[3];
    if (along) {
      const hy = head === 'n' ? top + .08 : -ff - .32, by = head === 'n' ? top + tf * .45 : top + .06, bh = tf * .5;
      A.cel(g, A.rr(-w / 2 + .06, by, w - .12, bh, .06), blanket, { line: S[1], lw: .035 });
      A.cel(g, A.rr(-w * .3, hy, w * .6, .24, .08), '#ffffff', { line: S[1], lw: .035, sk: .88 });
    } else {
      const hx = head === 'w' ? -w / 2 + .1 : w / 2 - .42, bx = head === 'w' ? -w * .05 : -w / 2 + .06;
      A.cel(g, A.rr(bx, top + .05, w * .55, tf - .08, .06), blanket, { line: S[1], lw: .035 });
      A.cel(g, A.rr(hx, top + .1, .32, tf - .2, .08), '#ffffff', { line: S[1], lw: .035, sk: .88 });
    }
    if (style === 'bed') { const hx = head === 'w' ? -w / 2 : head === 'e' ? w / 2 : 0; if (head === 'n') { A.cel(g, A.rr(-w / 2, top - .3, w, .14, .05), S[0], { line: S[1], lw: .04 }); for (const x of [-w / 4, 0, w / 4]) A.line(g, [[x, top - .18], [x, top + .02]], .035, S[1]); } else if (head !== 's') { A.line(g, [[hx, top - .25], [hx, -ff]], .07, S[1]); } else { A.cel(g, A.rr(-w / 2, -ff - .28, w, .3, .05), S[0], { line: S[1], lw: .04 }); } }
    if (style === 'gurney' || style === 'optable') for (const x of [-w / 2 + .1, w / 2 - .1]) A.dot(g, x, .02, .07, '#2a2a2a');
    if (style === 'optable') A.flat(g, A.ell(0, top + tf * .5, .12, .08), 'rgba(160,30,30,.5)', 0);
  });
}
function propArt(p) {
  const k = p.k, fw = p.fw || 1, fd = p.fd || 1, r = ((p.rot || 0) % TAU + TAU) % TAU;
  const facing = r < .5 || r > TAU - .5 ? 'f' : Math.abs(r - Math.PI) < .5 ? 'b' : 's';
  const head = fd > fw ? (Math.abs(r - Math.PI) < .5 ? 's' : 'n') : (r > 0 && r < Math.PI ? 'w' : 'e');
  switch (k) {
    case 'chair': return facing === 'b' ? Art.part('prop_chair_b', .8, 1.15, .4, .05, g => { for (const x of [-.26, .2]) A.cel(g, A.rr(x, -.42, .07, .42, .02), Col.dark(WOOD, .85), { line: WOODL, lw: .04, hi: false }); A.cel(g, A.poly([[-.32, -.46], [.32, -.46], [.28, -.68], [-.28, -.68]]), Col.light(WOOD, .15), { line: WOODL }); A.cel(g, A.rr(-.3, -.72, .6, .34, .05), Col.dark(WOOD, .9), { line: WOODL }); }) : propPart('chair');
    case 'pew': return fw >= 2 ? propPart('bench') : propPart('chair');
    case 'bed': case 'gurney': case 'optable': case 'tub': return bedArt(k, fw, fd, head);
    case 'pillar': return Art.part('prop_pillar', 1.0, 2.6, .5, .05, g => { const C = '#d8cfb0', L = '#3a3224'; A.cel(g, A.rr(-.3, -2.2, .6, 2.1, .05), C, { line: L }); for (const x of [-.14, 0, .14]) A.line(g, [[x, -2.1], [x, -.2]], .025, Col.dark(C, .75)); A.cel(g, A.rr(-.42, -2.42, .84, .24, .05), Col.light(C, .1), { line: L }); A.cel(g, A.rr(-.4, -.2, .8, .2, .05), Col.dark(C, .9), { line: L }); });
    case 'cabinet': return boxArt('skap' + facing + fw + fd, fw * .88, fd * .7, 1.6, P_.green, P_.greenL, (g, w, tf, ff) => { if (facing === 'f') drawers(g, w, ff, 3, P_.green, P_.greenL); });
    case 'shelf': return boxArt('hylle' + facing + fw + fd, fw * .9, fd * .6, 2.0, P_.wood, P_.woodL, (g, w, tf, ff) => { if (facing !== 'f') return; const cols = ['#b3261e', '#3f5f8e', '#6f8a55', '#d4b048', '#6b2d8c', '#8a5a34']; for (let row = 0; row < 3; row++) { const y = -ff + .08 + row * (ff - .1) / 3, hh = (ff - .1) / 3 - .06; A.line(g, [[-w / 2 + .06, y + hh + .02], [w / 2 - .06, y + hh + .02]], .04, P_.woodL); for (let b = 0; b < 6; b++) A.flat(g, A.rr(-w / 2 + .1 + b * (w - .2) / 6, y + (b % 3) * .02, (w - .2) / 6 - .02, hh - (b % 3) * .02, .01), cols[(b + row * 2) % 6], .02, P_.woodL); } });
    case 'wardrobe': return boxArt('garderobe' + facing, fw * .9, fd * .7, 2.1, '#6b4a2c', '#2a1a0c', (g, w, tf, ff) => { if (facing !== 'f') return; A.line(g, [[0, -ff + .05], [0, -.05]], .03, '#2a1a0c'); for (const s of [-1, 1]) { A.cel(g, A.rr(s < 0 ? -w / 2 + .08 : .06, -ff + .1, w / 2 - .14, ff - .2, .04), '#7d5834', { line: '#2a1a0c', lw: .03, hi: false }); A.dot(g, s * .06, -ff / 2, .03, '#d4b048'); } });
    case 'drawers': return boxArt('kommode' + facing, fw * .85, fd * .6, 1.0, P_.wood, P_.woodL, (g, w, tf, ff) => { if (facing === 'f') drawers(g, w, ff, 3, P_.wood, P_.woodL); });
    case 'locker': return boxArt('olsenskap', fw * .75, fd * .6, 1.9, '#8a969c', '#26302f', (g, w, tf, ff) => { for (let i = 0; i < 4; i++) A.line(g, [[-w / 2 + .12, -ff + .15 + i * .07], [w / 2 - .12, -ff + .15 + i * .07]], .025, '#26302f'); A.flat(g, A.rr(-.2, -ff * .55, .4, .12, .02), '#efe4c4', .025, '#26302f'); g.fillStyle = INK; g.font = 'bold .09px Georgia, serif'; g.textAlign = 'center'; g.fillText('OLSEN', 0, -ff * .55 + .09); A.flat(g, A.ell(w / 2 - .14, -ff * .4, .04, .08), '#d4b048', .02); A.line(g, [[-.1, -ff * .3], [.02, -ff * .25], [-.05, -ff * .18]], .02, '#26302f'); });
    case 'journalskap': return boxArt('journalskap', .9, .6, 1.8, '#3f4f3a', '#141a10', (g, w, tf, ff) => { drawers(g, w, ff, 4, '#3f4f3a', '#141a10'); A.flat(g, A.rr(-w / 2 + .06, -ff * .52, w - .12, .03, .01), '#c890ff', 0); A.flat(g, A.rr(-.22, -ff - tf + .1, .44, .1, .02), '#d4b048', .025, '#141a10'); });
    case 'desk': return boxArt('pult', fw * .95, fd * .7, .85, P_.wood, P_.woodL, (g, w, tf, ff) => { drawers(g, w * .4, ff, 2, P_.wood, P_.woodL); const top = -ff - tf; for (const [x, y, rr] of [[-.2, .1, .2], [.1, .2, -.3]]) { g.save(); g.translate(x, top + y); g.rotate(rr); A.flat(g, A.rr(-.14, -.1, .28, .2, .01), '#f4f0e0', .025); g.restore(); } A.cel(g, A.ell(.28, top + .12, .07, .05), '#e8e4dc', { lw: .025, hi: false }); });
    case 'table': return Art.part('prop_bord', 1.2, 1.2, .6, .05, g => { for (const x of [-.4, .34]) A.cel(g, A.rr(x, -.55, .07, .55, .02), Col.dark(WOOD, .85), { line: WOODL, lw: .04, hi: false }); A.cel(g, A.rr(-.5, -1.0, 1.0, .46, .05), '#f2eee0', { line: WOODL }); A.flat(g, A.poly([[-.5, -.6], [.5, -.6], [.42, -.46], [.3, -.52], [.1, -.44], [-.12, -.52], [-.32, -.44], [-.5, -.5]]), '#f2eee0', .035, WOODL); A.cel(g, A.ell(0, -.8, .12, .07), '#b3261e', { lw: .03, hi: false }); });
    case 'counter': { const svc = p.svc || 'kafeteria', len = p.len || fw; const C = { kafeteria: ['#8a5a34', '#3a2414'], medisin: ['#f2f0ea', '#2f3a40'], vaktmester: ['#6b5a44', '#2a2014'] }[svc] || ['#8a5a34', '#3a2414'];
      return boxArt('disk_' + svc + len, len * .98, .8, 1.05, C[0], C[1], (g, w, tf, ff) => { const top = -ff - tf;
        if (svc === 'kafeteria') { for (let i = 0; i < len; i++) A.line(g, [[-w / 2 + (i + .5) * w / len, -ff + .06], [-w / 2 + (i + .5) * w / len, -.06]], .03, C[1]); for (let i = 0; i < len; i += 2) { A.cel(g, A.rr(-w / 2 + i + .15, top + .12, .6, .36, .06), '#9aa0a6', { line: '#2f3a40', lw: .035 }); A.flat(g, A.ell(-w / 2 + i + .45, top + .2, .24, .08), '#d8a040', .03, '#6a4a14'); } }
        else if (svc === 'medisin') { A.flat(g, A.rr(-.08, -ff * .8, .16, .5, .01), '#b3261e', 0); A.flat(g, A.rr(-.22, -ff * .65, .44, .16, .01), '#b3261e', 0); for (let i = 0; i < 5; i++) A.cel(g, A.rr(-w / 2 + .2 + i * .5, top + .06, .14, .3, .04), ['#6aa06a', '#a06a3a', '#6a8ac0', '#c8c8d8', '#b36be0'][i], { line: INK, lw: .03 }); }
        else { A.cel(g, A.rr(-w / 2 + .2, top + .1, .5, .22, .03), '#555a60', { line: '#1a1a1a', lw: .035 }); for (let i = 0; i < 3; i++) A.line(g, [[.1 + i * .35, top + .12], [.3 + i * .35, top + .4]], .06, ['#b3261e', '#6a4a2a', '#9aa0a6'][i]); } }); }
    case 'altar': return boxArt('alter' + fw, fw * .95, .8, 1.0, '#3a1a4a', '#140818', (g, w, tf, ff) => { const top = -ff - tf; A.flat(g, A.poly([[-w / 2, -ff], [w / 2, -ff], [w / 2 - .1, -ff * .3], [w / 4, -ff * .45], [0, -ff * .25], [-w / 4, -ff * .45], [-w / 2 + .1, -ff * .3]]), '#6b2d8c', .035, '#140818'); A.cel(g, A.rr(-.3, top + .08, .6, .38, .04), '#5a2a1a', { line: INK, lw: .035 }); A.dot(g, 0, top + .27, .06, '#e0a8ff'); for (const x of [-w / 2 + .25, w / 2 - .25]) { A.cel(g, A.rr(x - .05, top - .18, .1, .3, .02), '#f0e8d0', { lw: .03, hi: false }); A.flat(g, A.ell(x, top - .24, .04, .07), '#ffcf5a', .02); } });
    case 'coffin': return boxArt('kiste' + fw + fd, fw * .8, fd * .9, .6, '#6b4226', '#2a1408', (g, w, tf, ff) => { const top = -ff - tf; A.cel(g, A.poly([[-w * .35, top + .05], [w * .35, top + .05], [w * .45, top + tf * .3], [w * .3, top + tf - .05], [-w * .3, top + tf - .05], [-w * .45, top + tf * .3]]), '#7d5834', { line: '#2a1408', lw: .035 }); A.flat(g, A.rr(-.15, top + tf * .4, .3, .12, .02), '#d4b048', .025, '#2a1408'); });
    case 'washer': return boxArt('vaskemaskin' + fw, fw * .92, .8, 1.15, '#e8e6dc', '#2f3a40', (g, w, tf, ff) => { const n = Math.max(1, fw); for (let i = 0; i < n; i++) { const cx = -w / 2 + (i + .5) * w / n; A.cel(g, A.ell(cx, -ff / 2, .26, .24), '#9aa0a6', { line: '#2f3a40', lw: .04 }); A.flat(g, A.ell(cx, -ff / 2, .18, .16), '#6ab0d0', .03, '#2f3a40'); A.line(g, [[cx - .08, -ff / 2 - .05], [cx + .02, -ff / 2 - .1]], .025, '#e8fbff'); } });
    case 'toilet': return Art.part('prop_do', .8, 1.2, .4, .05, g => { A.cel(g, A.rr(-.26, -1.05, .52, .4, .06), '#f2f0ea', { line: '#2f3a40' }); A.cel(g, A.poly([[-.2, 0], [.2, 0], [.26, -.4], [-.26, -.4]]), '#f2f0ea', { line: '#2f3a40' }); A.cel(g, A.ell(0, -.5, .3, .16), '#f2f0ea', { line: '#2f3a40' }); A.flat(g, A.ell(0, -.5, .18, .08), '#9fd0e4', .03, '#2f3a40'); A.flat(g, A.rr(.12, -1.0, .1, .05, .02), '#9aa0a6', .02); });
    case 'chute': return boxArt('sjakt', .9, .5, 1.5, '#9aa0a6', '#26302f', (g, w, tf, ff) => { A.cel(g, A.rr(-.3, -ff * .8, .6, .45, .04), '#6a7074', { line: '#26302f', lw: .035 }); A.flat(g, A.rr(-.22, -ff * .75, .44, .3, .03), '#15100c', .03); A.line(g, [[-.22, -ff * .45], [.22, -ff * .45]], .05, '#d4b048'); });
    case 'crate': return propPart('crate');
    case 'garbage': return Art.part('prop_soppel', .8, 1.0, .4, .05, g => { A.cel(g, A.poly([[-.26, 0], [.26, 0], [.3, -.62], [-.3, -.62]]), '#6a7a6a', { line: '#1a241a' }); for (const x of [-.14, 0, .14]) A.line(g, [[x, -.05], [x * 1.1, -.55]], .025, '#3a4a3a'); A.cel(g, A.ell(0, -.66, .34, .1), '#7a8a7a', { line: '#1a241a' }); A.flat(g, A.blob([[-.2, -.74], [.1, -.86], [.24, -.72], [0, -.7]]), '#efe6cc', .025); });
    case 'basket': return Art.part('prop_kurv', .9, .9, .45, .05, g => { A.cel(g, A.poly([[-.3, 0], [.3, 0], [.36, -.46], [-.36, -.46]]), '#b8904a', { line: '#4a3010' }); for (let i = 0; i < 4; i++) A.line(g, [[-.34, -.08 - i * .1], [.34, -.08 - i * .1]], .02, '#7a5a20'); A.cel(g, A.blob([[-.34, -.46], [-.2, -.62], [0, -.56], [.2, -.66], [.34, -.46]]), '#f2eee0', { line: '#4a3010', lw: .035 }); A.flat(g, A.ell(.1, -.56, .08, .05), '#7fa6d6', .02); });
    case 'candles': return Art.part('prop_lys', .7, .8, .35, .05, g => { for (const [x, h] of [[-.14, .34], [0, .5], [.14, .26]]) { A.cel(g, A.rr(x - .05, -h, .1, h, .02), '#f0e8d0', { lw: .03, hi: false }); A.flat(g, A.ell(x, -h - .08, .035, .07), '#ffcf5a', .02); } A.flat(g, A.blob([[-.24, 0], [.24, 0], [.2, -.06], [-.2, -.05]]), '#e8dcc0', .025); });
    case 'chain': return Art.part('prop_kjetting', .5, 2.4, .25, 0, g => { for (let i = 0; i < 12; i++) A.flat(g, A.ell(0, -2.3 + i * .16, .05, .09), null, .035, '#4a4a50'); A.line(g, [[0, -.4], [0, -.2], [.12, -.08], [.08, 0]], .06, '#3a3a40'); A.line(g, [[0, -.4], [0, -.2], [.12, -.08], [.08, 0]], .03, '#8a8a90'); });
    case 'lore': return Art.part('prop_side', .8, 1.2, .4, .05, g => { A.line(g, [[0, 0], [0, -.6]], .06, P_.woodL); A.line(g, [[-.18, 0], [.18, 0]], .06, P_.woodL); g.save(); g.translate(0, -.75); g.rotate(-.1); A.cel(g, A.rr(-.26, -.2, .52, .36, .02), '#f4ecd0', { lw: .035 }); for (let i = 0; i < 4; i++) A.line(g, [[-.18, -.12 + i * .07], [.16, -.12 + i * .07]], .015, '#6b4a2c'); g.restore(); });
    case 'chest': return chestArt(!!p.opened);
    case 'trapdoor': return Art.part(p.opened ? 'prop_luke_open' : 'prop_luke', 1.6, 1.6, .8, .8, g => { if (p.opened) { A.flat(g, A.rr(-.6, -.45, 1.2, .9, .05), '#0c0806', .05); for (let i = 0; i < 4; i++) A.line(g, [[-.25, -.35 + i * .22], [.25, -.35 + i * .22]], .05, '#6b4a2c'); A.line(g, [[-.25, -.4], [-.25, .45]], .05, '#6b4a2c'); A.line(g, [[.25, -.4], [.25, .45]], .05, '#6b4a2c'); } else { A.cel(g, A.rr(-.6, -.45, 1.2, .9, .05), '#6b4a2c', { line: WOODL }); for (const x of [-.2, .2]) A.line(g, [[x, -.42], [x, .42]], .03, WOODL); A.flat(g, A.ell(.4, 0, .06, .06), null, .03, '#d4b048'); } });
    case 'drain': return propPart('drain');
    case 'corpse': return corpseArt();
    default: return PROPS[k] ? propPart(k) : propPart('crate');
  }
}
function chestArt(open) {
  return Art.part(open ? 'kiste_open' : 'kiste_lukket', 1.0, 1.0, .5, .05, g => {
    const W0 = '#8a5a34', L = '#2a1408';
    if (open) { A.cel(g, A.rr(-.36, -.92, .72, .34, .05), Col.dark(W0, .8), { line: L }); const gr = g.createRadialGradient(0, -.5, .02, 0, -.5, .35); gr.addColorStop(0, 'rgba(255,230,140,.95)'); gr.addColorStop(1, 'rgba(255,200,80,0)'); g.fillStyle = gr; g.fillRect(-.5, -.9, 1, .6); }
    A.cel(g, A.rr(-.38, -.5, .76, .5, .05), W0, { line: L });
    if (!open) A.cel(g, A.blob([[-.38, -.5], [-.3, -.72], [0, -.78], [.3, -.72], [.38, -.5]]), Col.light(W0, .12), { line: L });
    for (const x of [-.24, .24]) A.line(g, [[x, -.02], [x, open ? -.5 : -.74]], .05, '#d4b048');
    A.flat(g, A.rr(-.07, -.52, .14, .14, .02), '#d4b048', .03, L);
  });
}
function corpseArt() {
  return Art.part('lik', 1.6, .8, .8, .05, g => {
    g.save(); g.rotate(-Math.PI / 2 + .1); g.scale(.62, .62);
    const draw = (P, x, y) => g.drawImage(P.canvas, x - P.ax, y - (P.h - P.ay), P.w, P.h);
    draw(shoePart('tofler'), -.2, -.05); draw(shoePart('tofler'), .18, -.05); draw(charPart('pasient', 'kropp', 'f'), 0, -.5); draw(Art.part('hode_pasient_x', 1.2, 1.1, .6, .1, drawPasientHead('x')), 0, -1.05);
    g.restore(); A.flat(g, A.ell(.5, -.1, .18, .06), 'rgba(179,38,30,.4)', 0);
  });
}
function barrierArt() {
  return Art.part('sperre', 1.1, 1.2, .55, .05, g => {
    for (const x of [-.4, .34]) A.cel(g, A.poly([[x, 0], [x + .08, 0], [x + .14, -.7], [x + .06, -.7]]), '#6b4a2c', { line: WOODL, lw: .04, hi: false });
    g.save(); g.translate(0, -.72); g.rotate(-.04);
    A.cel(g, A.rr(-.52, -.12, 1.04, .24, .04), '#f2eee2', { line: INK });
    g.save(); A.rr(-.52, -.12, 1.04, .24, .04)(g); g.clip(); g.fillStyle = '#b3261e'; for (let i = -6; i < 6; i++) { g.beginPath(); g.moveTo(i * .2, .14); g.lineTo(i * .2 + .1, .14); g.lineTo(i * .2 + .22, -.14); g.lineTo(i * .2 + .12, -.14); g.fill(); } g.restore();
    A.ink(g, A.rr(-.52, -.12, 1.04, .24, .04), .045);
    g.restore(); A.cel(g, A.rr(-.16, -.5, .32, .24, .02), '#efe4c4', { lw: .03 }); A.line(g, [[-.1, -.42], [.1, -.42]], .015); A.line(g, [[-.1, -.36], [.06, -.36]], .015);
  });
}
/* plukk og småting */
function heartPart() { return Art.part('hjerte', .5, .5, .25, .05, g => { A.cel(g, g2 => { g2.beginPath(); g2.moveTo(0, -.04); g2.bezierCurveTo(-.3, -.2, -.22, -.44, 0, -.32); g2.bezierCurveTo(.22, -.44, .3, -.2, 0, -.04); g2.closePath(); }, '#d8322a', { lw: .04 }); }); }
function morbPart() { return Art.part('morbdrape', .4, .5, .2, .05, g => { A.cel(g, A.blob([[0, -.42], [.13, -.16], [.1, -.04], [-.1, -.04], [-.13, -.16]]), '#8a3ac0', { lw: .035 }); A.dot(g, -.03, -.16, .025, '#e0a8ff'); }); }
function bottlePart(id) { const col = { levertran: '#c8a040', luktesalt: '#e8e8f0', eter: '#9ad0e0', kamfer: '#d06a3a' }[id] || '#fff'; return Art.part('flaske_' + id, .5, .7, .25, .05, g => { A.cel(g, A.rr(-.13, -.42, .26, .42, .06), col, { lw: .035 }); A.cel(g, A.rr(-.06, -.56, .12, .16, .02), col, { lw: .03, hi: false }); A.flat(g, A.rr(-.07, -.62, .14, .07, .02), '#5a3a22', .025); A.flat(g, A.rr(-.1, -.3, .2, .12, .01), '#efe4c4', .02); }); }
function cardPart() { return Art.part('kortplukk', .6, .8, .3, .05, g => { g.rotate(-.12); A.cel(g, A.rr(-.22, -.66, .44, .6, .03), '#f6ead0', { lw: .035, sk: .9 }); A.flat(g, A.rr(-.16, -.6, .32, .08, .01), '#6b2d8c', 0); A.dot(g, 0, -.68, .05, '#e8b93a'); }); }
function pigeonPart() { return Art.part('due_figur', .8, .7, .4, .05, g => { g.translate(0, -.36); g.scale(1.1, 1.1); CARD_ART.due(g); }); }
function stampDecal() { return Art.part('stempelmerke', 1.6, 1.0, .8, .5, g => { g.rotate(-.12); g.strokeStyle = 'rgba(179,38,30,.85)'; g.lineWidth = .06; g.strokeRect(-.66, -.26, 1.32, .52); g.fillStyle = 'rgba(179,38,30,.85)'; g.font = 'bold .3px Georgia, serif'; g.textAlign = 'center'; g.fillText('AVSLÅTT', 0, .1); }); }
function handPart() { return Art.part('skyggehand_p', .8, .8, .4, .4, g => { g.scale(1.3, 1.3); CARD_ART.skyggehand(g); }); }

/* ============================================================
   TJENESTEFOLK (bare forfra, de står stille bak disken)
   ============================================================ */
RIG.kokk = { hip: .42, hipW: .17, neck: .72, shW: .38, shY: .62, armW: .19, legW: .15, handR: .11, arm: '#f2efe4', leg: '#3a3432', hand: '#f0bf98', shoe: 'klogg', scale: .86, headLag: .8 };
RIG.olsen = { hip: .44, hipW: .15, neck: .7, shW: .32, shY: .6, armW: .17, legW: .15, handR: .1, arm: '#5a6a7a', leg: '#4a5a6a', hand: '#dcae88', shoe: 'klogg', scale: .84, headLag: 1 };
RIG.bibliotekar = { hip: .52, hipW: .11, neck: .76, shW: .22, shY: .68, armW: .12, legW: .11, handR: .075, arm: '#7a5a8a', leg: '#3a3044', hand: '#ecd0b0', shoe: 'stovel', scale: .8, headLag: 1.3 };
RIG.hansen = { hip: .44, hipW: .15, neck: .72, shW: .3, shY: .64, armW: .16, legW: .13, handR: .09, arm: '#f1eee4', leg: '#e8e4dc', hand: '#f0c8a4', shoe: 'hvit', scale: .82, headLag: .9 };
const NPC_ART = {
  kokk: { head: g => { const S = '#f0bf98', cy = -.36; A.cel(g, A.ell(0, cy, .34, .32), S); A.cel(g, A.blob([[-.34, cy - .06], [-.3, cy - .3], [0, cy - .42], [.3, cy - .3], [.34, cy - .06], [0, cy - .18]]), '#e8e4e8', { sk: .85 }); for (let i = -2; i <= 2; i++) A.line(g, [[i * .1, cy - .38], [i * .12, cy - .12]], .012, '#b8b0c0'); for (const s of [-1, 1]) { A.dot(g, s * .12, cy - .02, .035); A.flat(g, A.ell(s * .2, cy + .1, .08, .05), 'rgba(236,110,110,.55)', 0); } A.curve(g, [-.12, cy + .14], [0, cy + .22], [.12, cy + .14], .035); A.dot(g, .24, cy - .16, .025, '#6b4a2c'); },
    body: g => { const top = -.72; A.cel(g, A.blob([[-.46, 0], [.46, 0], [.48, top + .3], [.4, top + .04], [0, top], [-.4, top + .04], [-.48, top + .3]]), '#e8a0a0'); A.cel(g, A.rr(-.3, top + .18, .6, .56, .06), '#f6f4ee', { sk: .86, lw: .035 }); for (const [x, y] of [[-.1, top + .4], [.14, top + .56]]) A.flat(g, A.ell(x, y, .06, .04), 'rgba(200,120,40,.5)', 0); A.line(g, [[-.3, top + .22], [-.4, top + .02]], .025); A.line(g, [[.3, top + .22], [.4, top + .02]], .025); } },
  olsen: { head: g => { const S = '#dcae88', cy = -.36; A.cel(g, A.rr(-.3, cy - .28, .6, .58, .16), S); A.cel(g, A.blob([[-.36, cy - .12], [-.3, cy - .34], [0, cy - .4], [.3, cy - .34], [.36, cy - .12], [.44, cy - .08], [-.44, cy - .08]]), '#3f5a6a', { sk: .75 }); for (const s of [-1, 1]) { A.dot(g, s * .12, cy - .02, .035); A.line(g, [[s * .06, cy - .1], [s * .2, cy - .1]], .04); } A.cel(g, A.blob([[-.22, cy + .12], [-.08, cy + .06], [0, cy + .1], [.08, cy + .06], [.22, cy + .12], [.12, cy + .18], [0, cy + .14], [-.12, cy + .18]]), '#8a8a8a', { lw: .03, hi: false }); A.cel(g, A.ell(0, cy + .04, .06, .05), Col.dark(S, .9), { hi: false, lw: .03 }); },
    body: g => { const top = -.7; A.cel(g, A.blob([[-.38, 0], [.38, 0], [.4, top + .3], [.34, top + .04], [0, top], [-.34, top + .04], [-.4, top + .3]]), '#6a7a8a'); A.cel(g, A.rr(-.26, top + .1, .52, .6, .05), '#5a6a7a', { lw: .035, hi: false }); for (const x of [-.18, .18]) A.line(g, [[x, top + .12], [x * .8, top - .02]], .04, '#3a4a5a'); A.flat(g, A.rr(.06, top + .22, .14, .16, .02), '#4a5a6a', .03); A.line(g, [[.1, top + .22], [.1, top + .12]], .03, '#d4b048'); } },
  bibliotekar: { head: g => { const S = '#ecd0b0', cy = -.42; A.cel(g, A.ell(0, cy, .26, .34), S); A.cel(g, A.blob([[-.28, cy + .04], [-.26, cy - .26], [0, cy - .38], [.26, cy - .26], [.28, cy + .04], [.2, cy - .18], [-.2, cy - .18]]), '#9a9aa0', { sk: .8 }); A.cel(g, A.ell(0, cy - .44, .12, .1), '#9a9aa0', { sk: .8 }); for (const s of [-1, 1]) { A.flat(g, A.ell(s * .1, cy, .08, .06), '#f6f6ee', .03); A.dot(g, s * .1, cy + .01, .025); } A.line(g, [[-.02, cy], [.02, cy]], .025); A.line(g, [[-.08, cy + .18], [.08, cy + .18]], .03); },
    body: g => { const top = -.76; A.cel(g, A.blob([[-.26, 0], [.26, 0], [.26, top + .3], [.2, top + .04], [0, top], [-.2, top + .04], [-.26, top + .3]]), '#7a5a8a'); for (let i = 0; i < 4; i++) A.dot(g, 0, top + .18 + i * .14, .025, '#d4b048'); A.flat(g, A.rr(-.2, top + .02, .4, .06, .02), '#e8e4dc', .025); } },
  hansen: { head: g => { const S = '#f0c8a4', cy = -.36; A.cel(g, A.ell(0, cy, .3, .32), S); A.cel(g, A.blob([[-.32, cy + .06], [-.3, cy - .26], [0, cy - .38], [.3, cy - .26], [.32, cy + .06], [.22, cy - .16], [-.22, cy - .16]]), '#d8b060', { sk: .8 }); A.cel(g, A.rr(-.24, cy - .46, .48, .14, .04), '#ffffff'); A.flat(g, A.rr(-.04, cy - .44, .08, .1, .01), '#b3261e', 0); for (const s of [-1, 1]) { A.curve(g, [s * .16, cy], [s * .1, cy - .04], [s * .04, cy], .03); A.flat(g, A.ell(s * .2, cy + .1, .06, .04), 'rgba(236,110,110,.5)', 0); } A.curve(g, [-.1, cy + .14], [0, cy + .2], [.1, cy + .14], .03); },
    body: g => { const top = -.72; A.cel(g, A.blob([[-.36, 0], [.36, 0], [.38, top + .3], [.3, top + .04], [0, top], [-.3, top + .04], [-.38, top + .3]]), '#f1eee4', { sk: .84 }); A.flat(g, A.rr(.06, top + .2, .16, .12, .02), '#b3261e', 0); A.line(g, [[-.2, top + .3], [-.1, top + .3]], .03, '#3f5f8e'); } }
};
/* ============================================================
   BOSSER
   ============================================================ */
RIG.krok = { hip: .5, hipW: .2, neck: .92, shW: .46, shY: .82, armW: .2, legW: .17, handR: .12, arm: '#f4f2ea', leg: '#2a2624', hand: '#9aa0a6', shoe: 'klogg', scale: 1.45, headLag: .5 };
RIG.rust = { hip: .5, hipW: .22, neck: .86, shW: .5, shY: .78, armW: .24, legW: .2, handR: .14, arm: '#3f5a4a', leg: '#2a3a30', hand: '#6a4a2a', shoe: 'klogg', scale: 1.45, headLag: .4 };
RIG.yngel = { blob: true, scale: .8, tentacles: 5, tentW: .09 };
RIG.journalen = { blob: true, float: true, scale: 1.7, tentacles: 7, tentW: .08, tentCol: '#2a0a3a', tentLen: .5, tentSpread: .9, tentWave: .2, pulse: 3 };
const BOSS_ART = {
  krok: { head: g => { const S = '#e8c09a', cy = -.44; A.cel(g, A.ell(0, cy, .4, .42), S); A.cel(g, A.blob([[-.42, cy + .04], [-.38, cy - .2], [-.3, cy - .1], [-.3, cy + .1]]), '#e8e4dc', { lw: .035 }); A.cel(g, A.blob([[.42, cy + .04], [.38, cy - .2], [.3, cy - .1], [.3, cy + .1]]), '#e8e4dc', { lw: .035 });
      A.cel(g, A.ell(-.16, cy - .36, .16, .12), '#d4d8dc', { lw: .035 }); A.flat(g, A.ell(-.16, cy - .36, .08, .06), '#fff6c8', .025);
      A.line(g, [[-.22, cy - .08], [-.06, cy - .02]], .05); A.line(g, [[.22, cy - .08], [.06, cy - .02]], .05); A.dot(g, -.13, cy + .04, .04); A.flat(g, A.ell(.13, cy + .04, .09, .09), '#f6f6ee', .035); A.dot(g, .13, cy + .05, .035); A.line(g, [[.22, cy + .08], [.3, cy + .4]], .015, '#d4b048');
      A.cel(g, A.blob([[-.36, cy + .24], [-.18, cy + .12], [0, cy + .18], [.18, cy + .12], [.36, cy + .24], [.2, cy + .3], [0, cy + .24], [-.2, cy + .3]]), '#5a4030', { lw: .035 }); A.line(g, [[-.08, cy + .36], [.08, cy + .36]], .035); },
    body: g => { const top = -.92; A.cel(g, A.blob([[-.56, 0], [.56, 0], [.56, top + .4], [.46, top + .04], [0, top], [-.46, top + .04], [-.56, top + .4]]), '#f4f2ea', { sk: .82 }); A.line(g, [[0, top + .1], [0, -.04]], .035, '#b8b4a8'); A.cel(g, A.poly([[-.18, top + .02], [0, top + .3], [.18, top + .02]]), '#3a3a44', { lw: .035, hi: false });
      for (const [x, y, r] of [[-.3, top + .5, .09], [.2, top + .7, .12], [-.1, top + .8, .06]]) A.flat(g, A.ell(x, y, r, r * .8), 'rgba(140,20,20,.55)', 0); A.curve(g, [-.2, top + .06], [-.34, top + .4], [-.12, top + .5], .035, '#4a4a50'); A.dot(g, -.12, top + .5, .05, '#9aa0a6'); } },
  rust: { head: g => { const C = '#b87333', cy = -.48; A.cel(g, A.ell(0, cy, .46, .46), C, { sk: .7 }); A.cel(g, A.ell(0, cy + .02, .26, .24), '#2a3a3a', { lw: .05 }); A.flat(g, A.ell(-.06, cy - .04, .07, .05), 'rgba(220,255,250,.45)', 0); for (const s of [-1, 1]) { A.dot(g, s * .08, cy + .04, .04, '#f4f0e0'); A.dot(g, s * .08, cy + .05, .02); } for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; A.dot(g, Math.cos(a) * .33, cy + .02 + Math.sin(a) * .31, .03, '#e8c090'); } for (const s of [-1, 1]) A.cel(g, A.ell(s * .4, cy + .12, .08, .12), Col.dark(C, .85), { lw: .035 }); A.flat(g, A.rr(-.08, cy - .56, .16, .12, .03), C, .035); },
    body: g => { const top = -.86; A.cel(g, A.blob([[-.6, 0], [.6, 0], [.62, top + .4], [.5, top + .04], [0, top], [-.5, top + .04], [-.62, top + .4]]), '#3f5a4a', { sk: .7 }); A.cel(g, A.rr(-.38, top + .16, .76, .74, .08), '#2a3a30', { lw: .04 }); for (const y of [.3, .5]) A.line(g, [[-.3, top + y], [.3, top + y + .02]], .03, '#1a2a20'); A.cel(g, A.rr(-.5, top + .42, 1.0, .1, .03), '#6a4a2a', { lw: .035, hi: false }); A.cel(g, A.rr(-.08, top + .38, .16, .16, .02), '#b87333', { lw: .03 }); } }
};
function drawJournalen(v) {
  return g => {
    const B = '#4a1a2a', P = '#efe4c4';
    A.cel(g, A.poly([[-.62, -.3], [0, -.42], [.62, -.3], [.6, .02], [0, -.1], [-.6, .02]]), P, { lw: .05, sk: .85 });
    for (let i = 0; i < 5; i++) { A.line(g, [[-.5, -.28 + i * .06], [-.06, -.36 + i * .06]], .012, '#8a6a4a'); A.line(g, [[.06, -.36 + i * .06], [.5, -.28 + i * .06]], .012, '#8a6a4a'); }
    A.cel(g, A.poly([[-.68, -.26], [-.64, .08], [0, -.04], [.64, .08], [.68, -.26], [.62, -.02], [0, -.14], [-.62, -.02]]), B, { lw: .05, sk: .65 });
    A.cel(g, A.ell(0, -.62, .3, .24), '#f4f0e0', { lw: .05 });
    A.cel(g, A.ell(0, -.62, .15, .15), '#b3261e', { lw: .035, sk: .6 }); A.dot(g, 0, -.62, .07); A.dot(g, -.05, -.67, .03, '#ffffff');
    for (const s of [-1, 1]) A.line(g, [[s * .3, -.62], [s * .4, -.66]], .03);
    A.flat(g, A.blob([[-.08, -.9], [.08, -.9], [.06, -.86], [-.06, -.86]]), B, .03);
  };
}

/* kort som manglet tegning */
Object.assign(CARD_ART, {
  nokler: g => {
    A.flat(g, A.ell(-.08, -.12, .2, .2), null, .06, '#8a7020'); A.flat(g, A.ell(-.08, -.12, .2, .2), null, .03, '#e8c040');
    const key = (a, len) => { g.save(); g.translate(-.08, -.12); g.rotate(a); A.cel(g, A.rr(-.035, .14, .07, len, .02), '#d4b048', { lw: .03, hi: false }); A.cel(g, A.ell(0, .12, .07, .07), '#d4b048', { lw: .03, hi: false }); A.cel(g, A.rr(-.035, .14 + len - .06, .12, .05, .01), '#d4b048', { lw: .025, hi: false }); g.restore(); };
    key(-.5, .34); key(.2, .4); key(.9, .3);
  },
  hydro: g => {
    for (let i = 0; i < 9; i++) { const a = -.5 + i * .12, r = .2 + (i % 3) * .08; A.flat(g, A.ell(.1 + Math.cos(a) * r, -.1 + Math.sin(a) * r * .8, .05, .035), '#8ad0f0', .02, '#1f5f8a'); }
    A.cel(g, A.poly([[-.42, .3], [-.2, .02], [-.08, .1], [-.3, .38]]), '#8a5a3a', { lw: .035 });
    A.cel(g, A.poly([[-.2, .02], [.02, -.12], [.08, -.02], [-.08, .1]]), '#d4b048', { lw: .035 });
  },
  kappe: g => {
    A.cel(g, A.blob([[-.1, -.4], [.12, -.38], [.3, -.1], [.42, .32], [.2, .2], [.06, .36], [-.08, .2], [-.26, .34], [-.4, .3], [-.22, -.1]]), '#231a2c', { lw: .045, sk: .6 });
    A.cel(g, A.blob([[-.04, -.34], [.08, -.33], [.16, -.1], [.02, .2], [-.12, -.08]]), '#6b2d8c', { lw: .03, hi: false });
    A.cel(g, A.ell(0, -.4, .09, .07), '#d8b040', { lw: .03 });
  },
  skjema: g => {
    A.cel(g, A.poly([[-.3, -.4], [.24, -.42], [.32, .38], [-.26, .4]]), '#f6f0de', { lw: .04, sk: .9 });
    g.fillStyle = INK; g.font = 'bold .1px Georgia, serif'; g.fillText('SKJEMA 13-B', -.22, -.26);
    for (let i = 0; i < 5; i++) A.line(g, [[-.2, -.14 + i * .09], [.2, -.15 + i * .09]], .015, '#8a7a5a');
    A.flat(g, A.rr(.02, .18, .2, .14, .02), null, .025, '#b3261e');
  },
  resept: g => {
    A.cel(g, A.poly([[-.36, -.3], [.18, -.36], [.24, .3], [-.3, .34]]), '#f6f0de', { lw: .035, sk: .9 });
    g.fillStyle = INK; g.font = 'italic bold .2px Georgia, serif'; g.fillText('Rx', -.26, -.08);
    g.save(); g.translate(.14, .12); g.rotate(-.6); A.cel(g, A.rr(-.2, -.07, .2, .14, .07), '#ffffff', { lw: .035 }); A.cel(g, A.rr(0, -.07, .2, .14, .07), '#b3261e', { lw: .035 }); g.restore();
  },
  benektelse: g => {
    A.cel(g, A.blob([[-.38, -.28], [.38, -.3], [.4, .12], [.06, .14], [-.14, .32], [-.1, .14], [-.4, .12]]), '#f6ead0', { lw: .045 });
    g.fillStyle = '#b3261e'; g.font = 'bold .22px Georgia, serif'; g.textAlign = 'center'; g.fillText('NEI.', 0, -.02);
  }
});
