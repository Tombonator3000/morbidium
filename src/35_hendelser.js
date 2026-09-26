/* ============================================================
   HENDELSER  -  absurde, tilfeldige hendelser (UTVIDELSE.md, trinn 2)
   To til fire per etasje, trukket fra puljen og aldri den samme to ganger i ett
   løp. Hver har en liten scene i etasjen, en samtale med valg (Samtale) og en
   følge. Noen husker deg fra tidligere løp (G.meta.hendelser).
   Tonen er David Lynch på et norsk sanatorium i 1923: det hverdagslige blir
   uhyggelig, folk snakker forbi hverandre, og humoren er kroppslig, men aldri
   eksplisitt.
   ============================================================ */

/* ---------- samtalepanelet: bilde, tekst og valg (1 til 4 på tastaturet) ---------- */
const Samtale = {
  aktiv: null,
  vis(o) {
    const avsnitt = String(o.tekst || '').split('\n').filter(Boolean).map(t => `<p>${esc(t)}</p>`).join('');
    const bak = o.baklengs ? `<p class="baklengs">${esc(o.baklengs)}</p>` : '';
    const valg = o.valg && o.valg.length ? o.valg : [{ tekst: 'Gå videre' }];
    openPanel(`<div class="paper samtale"><div class="sbilde"></div><div class="sinnhold"><div class="stittel">${esc(o.tittel || '')}</div><div class="stekst">${bak}${avsnitt}</div>
      <div class="svalg">${valg.map((v, i) => `<button data-sv="${i}" ${v.kan && !v.kan() ? 'disabled' : ''}><b>${i + 1}</b> ${esc(v.tekst)}${v.hint ? `<small>${esc(v.hint)}</small>` : ''}</button>`).join('')}</div></div></div>`, { samtale: true });
    $('panel').scrollTop = 0; // hvert steg i samtalen begynner øverst
    try { const b = typeof o.bilde === 'function' ? o.bilde() : o.bilde; if (b) document.querySelector('.samtale .sbilde').appendChild(b); } catch (e) { }
    this.aktiv = { o, valg };
    document.querySelectorAll('[data-sv]').forEach(b => b.onclick = () => this.velg(+b.dataset.sv));
    const f = document.querySelector('[data-sv]:not([disabled])'); if (f) f.focus({ preventScroll: true });
  },
  velg(i) {
    const A0 = this.aktiv; if (!A0) return; const v = A0.valg[i]; if (!v || (v.kan && !v.kan())) return;
    Sound.play('paper'); this.aktiv = null;
    let neste = null; try { neste = v.gjor ? v.gjor() : null; } catch (e) { console.warn('samtale', e); }
    if (neste) this.vis(Object.assign({ tittel: A0.o.tittel, bilde: A0.o.bilde }, neste)); else closePanel();
  }
};
addEventListener('keydown', e => {
  if (!Samtale.aktiv || G.state !== 'panel' || !(G.panelO && G.panelO.samtale)) return;
  const n = parseInt(e.key, 10); if (n >= 1 && n <= Samtale.aktiv.valg.length) { e.preventDefault(); e.stopPropagation(); Samtale.velg(n - 1); }
}, true);

/* ---------- små følger av valgene ---------- */
const Folge = {
  tenner(n) { const P = G.player; P.teeth = Math.max(0, P.teeth + n); if (n > 0) Sound.play('tooth'); },
  hel(n) { healPlayer(n, true); Sound.play('heal'); },
  skade(n, type) { const P = G.player; P.iframe = P.invuln = 0; hurt(P, n, { type: type || 'any' }); },
  morb(n) { const P = G.player; if (n > 0) addMorb(n); else P.morb = Math.max(0, P.morb + n); },
  xp(n) { gainXp(n); },
  visRom(r) { const F = G.F; for (let z = r.z - 1; z <= r.z + r.h; z++) for (let x = r.x - 1; x <= r.x + r.w; x++) if (x >= 0 && z >= 0 && x < F.W && z < F.H) G.seen[z * F.W + x] = 1; },
  kart(hva) { const F = G.F; for (const r of F.rooms) if (hva === 'alt' ? r.role !== 'secret' : hva === 'sjef' ? r.role === 'boss' : r.role === 'treasure' || r.role === 'secret') this.visRom(r); mapT = 0; },
  kuriositet(pulje = 'kabinett') { const id = Items.pickFrom(pulje); if (id) Items.give(id); },
  lomme() { const l = Lomme.pick(); if (l) Lomme.give(l); },
  flaske(id) { const P = G.player; dropPickup(P.x, P.z, 'cons', id || pick(Object.keys(CONSUMABLES))); },
  fiender(type, n, elite) { const P = G.player; for (let i = 0; i < n; i++) { const a = Math.random() * TAU, s = freeSpot(P.x + Math.sin(a) * 3.2, P.z + Math.cos(a) * 3.2, 2); spawnEnemy(type, s.x, s.z, !!elite, G.depth); } },
  fornavn() { const n = (G.run && G.run.patient && G.run.patient.name) || 'Pasient'; return n.split(' ')[0]; },
  hjerte() { G.run.pillHearts = (G.run.pillHearts || 0) + 1; recalcPlayer(); Sound.play('hjerte'); },
  naerRom(x, z, r) { for (const rm of G.F.rooms) if (rm.role !== 'secret' && d2(rm.cx, rm.cz, x, z) < r * r) this.visRom(rm); mapT = 0; },
  ganger(id) { return ((G.meta.hendelser || {})[id] || 0); } // teller med denne gangen
};

/* dukker utenfor fiendene og tjenestene, som 3D likevel skal lyse opp (G.ekstraDukker tømmes ved ny etasje) */
function ekstraDukke(d) { (G.ekstraDukker || (G.ekstraDukker = [])).push(d); return d; }

/* ---------- bilder til panelet ---------- */
function hendBilde(P, bak = '#15100c', skala = 1) {
  const c = document.createElement('canvas'); c.width = c.height = 400; const g = c.getContext('2d');
  g.fillStyle = bak; g.fillRect(0, 0, 400, 400);
  const v = g.createRadialGradient(200, 220, 60, 200, 220, 260); v.addColorStop(0, 'rgba(255,230,180,.12)'); v.addColorStop(1, 'rgba(0,0,0,.6)'); g.fillStyle = v; g.fillRect(0, 0, 400, 400);
  if (P && P.canvas) { const K = P.canvas, [x0, y0, w0, h0] = innhold(K), s = Math.min(370 * skala / w0, 300 * skala / h0); g.drawImage(K, x0, y0, w0, h0, 200 - w0 * s / 2, 372 - h0 * s, w0 * s, h0 * s); }
  return c;
}
/* rammen rundt det som faktisk er tegnet på et lerret (tingene har mye luft rundt seg) */
function innhold(K) {
  try {
    // leses fra en liten kopi, så selve tegningen aldri leses tilbake fra
    const W = Math.ceil(K.width / 2), H = Math.ceil(K.height / 2), t = document.createElement('canvas'); t.width = W; t.height = H;
    const tg = t.getContext('2d', { willReadFrequently: true }); tg.drawImage(K, 0, 0, W, H); const d = tg.getImageData(0, 0, W, H).data; let x0 = W, y0 = H, x1 = -1, y1 = -1;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3] > 24) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 > x0 && y1 > y0) { const a = Math.max(0, x0 * 2 - 6), b = Math.max(0, y0 * 2 - 6); return [a, b, Math.min(K.width, x1 * 2 + 10) - a, Math.min(K.height, y1 * 2 + 10) - b]; }
  } catch (e) { }
  return [0, 0, K.width, K.height];
}
function hendFigur(type) { try { const c = fiendeBilde(type, 400, 400), g = c.getContext('2d'); g.globalCompositeOperation = 'destination-over'; g.fillStyle = '#15100c'; g.fillRect(0, 0, 400, 400); return c; } catch (e) { return hendBilde(null); } }
/* øyet i sprekken, tett på */
function oyeBilde(aapent = 1) {
  const c = document.createElement('canvas'); c.width = c.height = 400; const g = c.getContext('2d');
  g.fillStyle = '#c8bca0'; g.fillRect(0, 0, 400, 400);
  const rng = mulberry32(7); g.fillStyle = 'rgba(90,70,40,.18)'; for (let i = 0; i < 40; i++) { g.beginPath(); g.arc(rng() * 400, rng() * 400, 6 + rng() * 30, 0, TAU); g.fill(); }
  g.fillStyle = '#0a0604'; g.beginPath(); g.moveTo(40, 210); for (let x = 60; x <= 360; x += 30) g.lineTo(x, 200 - (x > 120 && x < 290 ? 70 * aapent : 12) + rng() * 10); g.lineTo(360, 210); for (let x = 360; x >= 40; x -= 30) g.lineTo(x, 214 + (x > 120 && x < 290 ? 62 * aapent : 12) + rng() * 10); g.closePath(); g.fill();
  if (aapent > .2) {
    g.save(); g.beginPath(); g.ellipse(205, 207, 85, 58 * aapent, 0, 0, TAU); g.clip();
    g.fillStyle = '#f2e8d8'; g.fillRect(100, 130, 220, 160);
    g.strokeStyle = 'rgba(180,30,30,.6)'; g.lineWidth = 2; for (let i = 0; i < 12; i++) { g.beginPath(); const a = rng() * TAU; g.moveTo(205 + Math.cos(a) * 80, 207 + Math.sin(a) * 50); g.quadraticCurveTo(205 + Math.cos(a) * 55, 207 + Math.sin(a + .5) * 36, 205 + Math.cos(a) * 40, 207 + Math.sin(a) * 25); g.stroke(); }
    g.fillStyle = '#4a6a3a'; g.beginPath(); g.arc(215, 210, 36, 0, TAU); g.fill(); g.fillStyle = '#0a0604'; g.beginPath(); g.arc(218, 212, 18, 0, TAU); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(205, 200, 7, 0, TAU); g.fill();
    g.restore();
    g.strokeStyle = '#6a1a1a'; g.lineWidth = 5; g.beginPath(); g.ellipse(205, 207, 85, 58 * aapent, 0, 0, TAU); g.stroke();
  }
  g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(40, 210); g.lineTo(10, 180); g.moveTo(360, 210); g.lineTo(395, 240); g.moveTo(200, 120); g.lineTo(215, 60); g.lineTo(200, 20); g.stroke();
  return c;
}

/* ---------- nye figurer og ting til hendelsene ---------- */
RIG.baklengs = { hip: .5, hipW: .12, neck: .8, shW: .26, shY: .72, armW: .1, legW: .1, handR: .075, arm: '#1a1a1e', leg: '#1a1a1e', hand: '#e8dcc8', shoe: 'stovel', scale: 1.02, headLag: .4 };
MONSTER_ART.baklengs = {
  hode: v => g => {
    const cy = -.5, S = '#e8dcc8';
    if (v === 'b') { A.cel(g, A.ell(0, cy, .3, .34), '#1a1410', { sk: .7 }); A.line(g, [[-.2, cy - .1], [.2, cy - .12]], .02, '#4a3a2a'); return; }
    if (v === 's') { A.cel(g, A.ell(.02, cy, .28, .34), S); A.cel(g, A.blob([[-.28, cy - .05], [-.2, cy - .32], [.2, cy - .34], [.3, cy - .2], [.1, cy - .22]]), '#1a1410', { lw: .03, hi: false }); A.line(g, [[.16, cy - .02], [.26, cy - .02]], .025); A.line(g, [[.18, cy + .18], [.26, cy + .16]], .02); return; }
    A.cel(g, A.ell(0, cy, .29, .35), S);
    A.cel(g, A.blob([[-.3, cy - .02], [-.26, cy - .3], [0, cy - .38], [.26, cy - .3], [.3, cy - .02], [.14, cy - .24], [-.14, cy - .24]]), '#1a1410', { lw: .03, hi: false });
    for (const s of [-1, 1]) A.curve(g, [s * .08, cy], [s * .13, cy + .04], [s * .19, cy], .025); // lukkede øyne
    A.line(g, [[0, cy + .04], [-.02, cy + .14], [.02, cy + .15]], .02, '#b89a80');
    A.curve(g, [-.08, cy + .22], [0, cy + .25], [.08, cy + .21], .02); // et lite smil
  },
  kropp: v => g => {
    const top = -.72, w0 = v === 's' ? .2 : .28, w1 = v === 's' ? .18 : .25;
    A.cel(g, A.blob([[-w0, 0], [w0, 0], [w1 + .02, top + .12], [0, top - .02], [-w1 - .02, top + .12]]), '#1e1e24', { sk: .7 });
    if (v !== 'b') { A.cel(g, A.poly([[-.08, top + .02], [0, top + .3], [.08, top + .02]]), '#f4f0e8', { lw: .025, hi: false }); A.cel(g, A.poly([[-.03, top + .04], [.03, top + .04], [.04, top + .36], [0, top + .42], [-.04, top + .36]]), '#0a0a0c', { lw: .02, hi: false }); for (const y of [top + .45, top + .6]) A.dot(g, .03, y, .018, '#8a8a90'); }
  }
};
const HEND_ART = {
  telefon: () => Art.part('prop_telefon', .8, 1.1, .4, .05, g => { A.cel(g, A.rr(-.26, -.9, .52, .8, .06), '#5a3a22', { line: WOODL }); A.flat(g, A.ell(0, -.55, .14, .14), '#1a1a1a', .03); for (let i = 0; i < 8; i++) A.dot(g, Math.cos(i / 8 * TAU) * .09, -.55 + Math.sin(i / 8 * TAU) * .09, .02, '#e8e0c8'); A.cel(g, A.rr(-.3, -1.02, .6, .14, .06), '#1a1a1a', { lw: .03 }); A.line(g, [[.26, -.4], [.36, -.2], [.3, -.05]], .02, '#1a1a1a'); A.flat(g, A.rr(.2, -.2, .06, .12, .02), '#c8a048', .015); }),
  kaffebord: () => bordArt('prop_kaffebord', .9, .8, .72, '#6a4a2c', WOODL, (g, w, tf, ff) => { const top = -ff - tf; A.flat(g, A.ell(-.15, top + tf * .55, .14, .06), HVIT, .02); A.cel(g, A.rr(-.24, top + tf * .55 - .16, .18, .16, .03), HVIT, { lw: .025, hi: false }); A.flat(g, A.ell(-.15, top + tf * .55 - .16, .08, .03), '#1a0e06', .015); A.curve(g, [-.18, top - .05], [-.1, top - .25], [-.2, top - .4], .02, 'rgba(240,240,230,.6)'); A.flat(g, A.poly([[.05, top + tf * .6], [.3, top + tf * .6], [.25, top + tf * .6 - .18], [.08, top + tf * .6 - .18]]), '#f4ecd8', .02); A.flat(g, A.rr(.08, top + tf * .6 - .2, .17, .05, .02), '#f0e0e0', .015); A.dot(g, .16, top + tf * .6 - .24, .035, '#c8262a'); }),
  ku: () => Art.part('prop_ku', 2.4, 1.9, 1.2, .05, g => {
    for (const x of [-.7, -.45, .5, .72]) A.cel(g, A.rr(x, -.62, .12, .62, .03), '#8a3a26', { line: '#2a0e06', lw: .035, hi: false });
    A.cel(g, A.blob([[-.95, -.6], [.9, -.62], [.95, -1.25], [.4, -1.4], [-.6, -1.38], [-1.0, -1.1]]), '#9a4228', { line: '#2a0e06' });
    for (const [x, y, r] of [[-.4, -1.0, .2], [.3, -.85, .16], [.6, -1.15, .12]]) A.flat(g, A.blob([[x - r, y], [x, y - r * .8], [x + r, y - r * .1], [x + r * .5, y + r * .6], [x - r * .6, y + r * .5]]), '#f0ece0', 0);
    A.cel(g, A.blob([[.85, -1.1], [1.1, -1.35], [1.18, -.9], [1.0, -.75]]), '#9a4228', { line: '#2a0e06' });
    A.flat(g, A.ell(1.1, -.88, .12, .09), '#e8b0a0', .03); A.dot(g, 1.07, -.9, .02); A.dot(g, 1.14, -.88, .02);
    A.dot(g, 1.0, -1.1, .04, INK); A.dot(g, .99, -1.11, .012, '#ffffff'); A.line(g, [[.92, -1.32], [.86, -1.46]], .04, '#e8dcc0');
    A.line(g, [[-.95, -1.1], [-1.1, -.6]], .04, '#2a0e06'); A.flat(g, A.ell(-1.1, -.58, .05, .08), '#2a0e06', 0);
    A.flat(g, A.rr(.82, -.78, .12, .16, .03), MESS, .02, MESSL); A.flat(g, A.ell(-.1, -.58, .12, .06), '#f0c8c0', .02);
  }),
  brennevin: () => Art.part('prop_brennevin', 2.2, 1.9, 1.1, .05, g => {
    A.cel(g, A.rr(.3, -.5, .6, .5, .05), '#6a5a44', { line: WOODL }); A.cel(g, A.poly([[.35, -.5], [.85, -.5], [.8, -1.05], [.4, -1.05]]), '#c87a3a', { line: '#4a2a0a' }); A.flat(g, A.ell(.6, -1.05, .2, .06), '#a86a2a', .03); A.line(g, [[.6, -1.1], [.6, -1.3], [.1, -1.3], [0, -.9]], .05, '#c87a3a'); A.cel(g, A.poly([[-.12, -.2], [.1, -.2], [.12, -.62], [-.14, -.62]]), 'rgba(220,230,210,.6)', { line: '#3a4a3a' }); A.flat(g, A.rr(-.1, -.4, .2, .18, .02), 'rgba(230,220,160,.8)', 0); A.dot(g, .55, -.2, .06, '#ff8a3a');
    A.cel(g, A.rr(-.95, -.45, .5, .45, .04), '#7a5a3a', { line: WOODL, hi: false }); A.cel(g, A.ell(-.7, -1.05, .2, .22), '#e8c8a8'); A.cel(g, A.rr(-.9, -.9, .4, .45, .1), '#f0ece0', { lw: .035 }); A.flat(g, A.rr(-.9, -.55, .4, .12, .03), '#e8e0d0', .025); A.line(g, [[-.82, -1.08], [-.76, -1.06]], .02); A.line(g, [[-.66, -1.08], [-.6, -1.06]], .02); A.curve(g, [-.78, -.96], [-.7, -.92], [-.62, -.97], .02); A.flat(g, A.ell(-.62, -.72, .06, .05), 'rgba(160,110,70,.4)', 0);
  }),
  badekar: () => Art.part('prop_badekarmann', 2.2, 1.8, 1.1, .05, g => {
    A.cel(g, A.ell(-.1, -1.15, .18, .2), '#e8c8a8'); A.cel(g, A.rr(-.32, -1.4, .44, .14, .04), '#2a2a2e', { lw: .03 }); A.cel(g, A.rr(-.26, -1.52, .32, .16, .05), '#2a2a2e', { lw: .03 }); A.dot(g, -.16, -1.16, .02); A.dot(g, -.04, -1.16, .02); A.line(g, [[-.14, -1.05], [-.06, -1.05]], .02);
    A.cel(g, A.rr(.05, -1.25, .55, .5, .02), '#e8e4d8', { lw: .03, hi: false }); for (let i = 0; i < 5; i++) A.line(g, [[.1, -1.18 + i * .08], [.52, -1.18 + i * .08]], .015, '#6a6a60'); A.flat(g, A.rr(.12, -1.2, .16, .12, .01), '#4a4a44', 0);
    A.cel(g, A.blob([[-1.0, -.3], [-.95, -.8], [.95, -.8], [1.0, -.3], [.8, 0], [-.8, 0]]), '#f2f0ea', { line: '#2f3a40' }); A.flat(g, A.ell(0, -.78, .88, .14), '#6a7060', .03, '#2f3a40'); A.flat(g, A.ell(-.2, -.8, .3, .05), 'rgba(200,210,190,.5)', 0);
    for (const x of [-.8, .8]) A.cel(g, A.ell(x, -.02, .08, .05), MESS, { lw: .02, hi: false });
  }),
  heis: () => Art.part('prop_heis', 1.8, 2.75, .9, .05, g => {
    A.cel(g, A.rr(-.8, -2.4, 1.6, 2.4, .04), '#3a3230', { line: INK }); A.flat(g, A.rr(-.68, -2.25, 1.36, 2.2, .02), '#141010', .03);
    A.cel(g, A.ell(0, -1.55, .2, .23), '#e8dcc8'); A.cel(g, A.rr(-.26, -1.95, .52, .12, .04), '#6a1a1a', { lw: .03 }); A.cel(g, A.rr(-.18, -2.05, .36, .12, .04), '#6a1a1a', { lw: .03 });
    A.cel(g, A.rr(-.32, -1.3, .64, 1.25, .08), '#6a1a1a', { lw: .035 }); for (const y of [-1.1, -.9, -.7]) A.dot(g, 0, y, .03, MESS);
    for (let x = -.66; x <= .66; x += .12) A.line(g, [[x, -2.25], [x + .02, -.05]], .02, '#8a8070');
    for (const y of [-2.2, -1.1, -.1]) A.line(g, [[-.68, y], [.68, y]], .025, '#8a8070');
    A.cel(g, A.rr(-.3, -2.62, .6, .2, .03), '#c8a048', { line: MESSL }); g.save(); g.fillStyle = INK; g.font = 'bold .14px Georgia, serif'; g.textAlign = 'center'; g.fillText('NED', 0, -2.47); g.restore();
  }),
  rotter: () => Art.part('prop_rotter', 1.8, 1.2, .9, .6, g => {
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .3, x = Math.cos(a) * .6, y = Math.sin(a) * .28 - .1; A.cel(g, A.ell(x, y, .14, .09), '#6a5a54', { line: '#1a1210', lw: .03 }); A.dot(g, x + Math.cos(a + Math.PI) * .12, y - .04, .02, '#ff6a6a'); A.curve(g, [x - Math.cos(a + Math.PI) * .1, y], [x - Math.cos(a + Math.PI) * .25, y + .08], [x - Math.cos(a + Math.PI) * .3, y - .04], .02, '#c89a9a'); if (i === 1) A.flat(g, A.ell(x, y - .1, .1, .07), '#f0ece0', .02); }
    A.cel(g, A.rr(-.04, -.32, .08, .22, .02), '#f0e8d0', { lw: .02, hi: false }); A.flat(g, A.blob([[-.04, -.32], [0, -.46], [.04, -.32]]), '#ffc84a', 0);
  }),
  radio: () => bordArt('prop_radiobord', 1.0, .7, .7, WOOD, WOODL, (g, w, tf, ff) => { const top = -ff - tf; A.cel(g, A.poly([[-.36, top + tf * .6], [.36, top + tf * .6], [.34, top - .45], [0, top - .6], [-.34, top - .45]]), '#6a3a1e', { line: '#1a0a04' }); A.flat(g, A.blob([[-.24, top + tf * .4], [.24, top + tf * .4], [.22, top - .35], [0, top - .46], [-.22, top - .35]]), '#c8a868', .02); for (let i = 0; i < 5; i++) A.line(g, [[-.18 + i * .09, top - .3], [-.18 + i * .09, top + tf * .3]], .02, '#6a3a1e'); A.dot(g, -.2, top + tf * .52, .04, '#e8d8a8'); A.dot(g, .2, top + tf * .52, .04, '#e8d8a8'); }),
  damer: () => Art.part('prop_damer', 3.5, 2.0, 1.7, .05, g => {
    for (const [x, kjole, hale] of [[-.95, '#2a3a6a', false], [0, '#6a1a1a', false], [.95, '#1a3a2a', true]]) {
      A.cel(g, A.poly([[x - .25, 0], [x + .25, 0], [x + .2, -.4], [x - .2, -.4]]), '#5a4028', { line: '#140c04' });
      A.cel(g, A.blob([[x - .32, -.35], [x + .32, -.35], [x + .24, -1.0], [x - .24, -1.0]]), kjole, { lw: .04 });
      A.flat(g, A.rr(x - .22, -.9, .44, .1, .02), '#c8a048', .02); A.flat(g, A.rr(x - .2, -.65, .4, .25, .03), '#f0ece0', .02);
      A.cel(g, A.ell(x, -1.2, .19, .21), '#e8c8a8'); A.cel(g, A.blob([[x - .22, -1.24], [x, -1.46], [x + .22, -1.24], [x, -1.32]]), '#d8d4c8', { lw: .03, hi: false });
      A.line(g, [[x - .08, -1.22], [x - .04, -1.22]], .02); A.line(g, [[x + .04, -1.22], [x + .08, -1.22]], .02); A.curve(g, [x - .06, -1.1], [x, -1.08], [x + .06, -1.1], .02);
      A.flat(g, A.ell(x + .2, -.62, .08, .04), HVIT, .02); A.flat(g, A.ell(x + .2, -.64, .05, .02), '#3a1a0a', 0);
      if (hale) { A.curve(g, [x + .28, -.3], [x + .7, -.2], [x + .65, -.7], .05, '#9a4228'); A.flat(g, A.ell(x + .64, -.76, .06, .09), '#2a0e06', 0); }
    }
  }),
  /* kona med kubben: sjal, grå knute, briller, og en vedkubbe hun holder som et spedbarn */
  kubbekona: () => Art.part('prop_kubbekona', 1.4, 2.3, .7, .05, g => {
    A.cel(g, A.poly([[-.42, 0], [.42, 0], [.3, -1.12], [-.3, -1.12]]), '#2a2420', { line: '#0a0806' });
    A.flat(g, A.ell(-.14, -.02, .1, .05), '#0a0806', 0); A.flat(g, A.ell(.14, -.02, .1, .05), '#0a0806', 0);
    A.cel(g, A.blob([[-.36, -1.05], [-.3, -1.46], [0, -1.52], [.3, -1.46], [.36, -1.05], [0, -1.18]]), '#6a3a2a', { line: '#1a0a06' });
    for (let i = 0; i < 5; i++) A.line(g, [[-.3 + i * .15, -1.08 + Math.abs(i - 2) * .02], [-.28 + i * .15, -.98]], .02, '#8a5a3a');
    A.cel(g, A.ell(0, -1.68, .19, .22), '#e0c4a8');
    A.cel(g, A.blob([[-.2, -1.72], [-.16, -1.88], [0, -1.92], [.16, -1.88], [.2, -1.72], [0, -1.8]]), '#b8b4a8', { lw: .025, hi: false }); A.cel(g, A.ell(0, -1.93, .09, .06), '#b8b4a8', { lw: .025, hi: false });
    for (const x of [-.08, .08]) { A.flat(g, A.ell(x, -1.68, .055, .045), 'rgba(220,235,240,.5)', .018); A.dot(g, x, -1.68, .016); }
    A.line(g, [[-.03, -1.68], [.03, -1.68]], .015); A.curve(g, [-.06, -1.56], [0, -1.58], [.06, -1.56], .018);
    A.cel(g, A.rr(-.38, -1.3, .76, .24, .1), '#8a6a44', { line: WOODL }); for (const x of [-.3, -.1, .12]) A.line(g, [[x, -1.28], [x + .06, -1.08]], .015, WOODL);
    A.flat(g, A.ell(.38, -1.18, .07, .12), '#c8a070', .025, WOODL); A.flat(g, A.ell(.38, -1.18, .035, .06), 'rgba(90,60,30,.5)', 0);
    A.dot(g, -.36, -1.12, .07, '#e0c4a8'); A.dot(g, .26, -1.08, .07, '#e0c4a8');
  }),
  /* kjempen: smoking og sløyfe, så høy at hodet nesten forsvinner */
  kjempe: () => Art.part('prop_kjempe', 1.7, 3.8, .85, .05, g => {
    for (const x of [-.24, .06]) A.cel(g, A.rr(x, -1.5, .18, 1.46, .04), '#141418', { line: '#000000', hi: false });
    for (const x of [-.18, .16]) A.flat(g, A.ell(x, -.03, .16, .06), '#050505', .02);
    for (const s of [-1, 1]) { A.line(g, [[s * .4, -2.72], [s * .52, -2.0], [s * .5, -1.35]], .13, '#000000'); A.line(g, [[s * .4, -2.72], [s * .52, -2.0], [s * .5, -1.35]], .09, '#1a1a20'); A.dot(g, s * .5, -1.3, .07, '#e8d8c4'); }
    A.cel(g, A.poly([[-.36, -1.38], [.36, -1.38], [.44, -2.72], [0, -2.9], [-.44, -2.72]]), '#1a1a20', { line: '#000000' });
    A.flat(g, A.poly([[-.12, -2.82], [0, -2.3], [.12, -2.82]]), '#f4f0e8', .015);
    A.flat(g, A.poly([[-.12, -2.8], [0, -2.74], [-.12, -2.68]]), '#0a0a0c', 0); A.flat(g, A.poly([[.12, -2.8], [0, -2.74], [.12, -2.68]]), '#0a0a0c', 0);
    for (const y of [-2.2, -1.9]) A.dot(g, 0, y, .02, '#8a8a90');
    A.cel(g, A.rr(-.06, -3.02, .12, .14, .03), '#e8d8c4', { lw: .025, hi: false });
    A.cel(g, A.ell(0, -3.3, .21, .3), '#e8d8c4');
    for (const s of [-1, 1]) A.flat(g, A.blob([[s * .2, -3.3], [s * .22, -3.46], [s * .14, -3.5], [s * .16, -3.38]]), '#c8c4bc', .02);
    for (const x of [-.08, .08]) A.dot(g, x, -3.32, .025); A.line(g, [[-.06, -3.16], [.06, -3.16]], .02);
  }),
  /* tannfeen under senga: nattkjole, møllvinger og en haug med tenner */
  tannfe: () => Art.part('prop_tannfe', 2.4, 1.8, 1.2, .05, g => {
    for (const x of [-1.05, 1.0]) A.line(g, [[x, 0], [x, -1.0]], .06, '#8a8a84');
    A.cel(g, A.blob([[-.95, -.36], [-.6, -.62], [-.2, -.5], [-.35, -.3]]), '#b8a888', { line: '#3a3020', lw: .03, hi: false });
    A.cel(g, A.blob([[-.95, -.2], [-.55, -.5], [-.15, -.4], [-.3, -.18]]), '#a89878', { line: '#3a3020', lw: .03, hi: false });
    for (const [x, y] of [[-.6, -.48], [-.4, -.36], [-.7, -.3]]) A.dot(g, x, y, .04, '#4a3a2a');
    A.cel(g, A.blob([[-.8, -.02], [-.7, -.3], [.1, -.3], [.18, -.02]]), '#e8e0d0', { line: INK, lw: .03 });
    A.cel(g, A.ell(.3, -.2, .16, .15), '#e0c4a8');
    A.cel(g, A.blob([[.14, -.2], [.18, -.4], [.36, -.42], [.5, -.3], [.46, -.18], [.3, -.3]]), '#c8c0b0', { lw: .025, hi: false });
    A.dot(g, .28, -.2, .02); A.dot(g, .38, -.2, .02); A.curve(g, [.26, -.1], [.33, -.08], [.4, -.12], .02);
    for (let i = 0; i < 9; i++) A.dot(g, .62 + (i % 4) * .07, -.03 - Math.floor(i / 4) * .05, .03, i % 3 ? '#f4f0e0' : '#e8c048');
    A.cel(g, A.rr(-1.12, -1.18, 2.24, .22, .06), '#f2f0ea', { line: '#3a3a36' }); A.cel(g, A.rr(-1.1, -.98, 2.2, .08, .02), '#8a8a84', { lw: .03, hi: false });
    A.cel(g, A.rr(-1.0, -1.34, .5, .2, .08), '#f8f6f0', { lw: .03, hi: false }); A.flat(g, A.rr(-.4, -1.24, 1.4, .12, .04), 'rgba(160,170,190,.35)', 0);
  }),
  /* mannen som er en lampe: stripete pyjamas, lampeskjerm, snor og ledning inn i veggen */
  lampemann: paa => Art.part('prop_lampemann' + (paa ? '_paa' : ''), 1.4, 2.6, .7, .05, g => {
    if (paa) { const r = g.createRadialGradient(0, -1.95, .05, 0, -1.95, .7); r.addColorStop(0, 'rgba(255,230,150,.55)'); r.addColorStop(1, 'rgba(255,230,150,0)'); g.fillStyle = r; g.fillRect(-.7, -2.55, 1.4, 1.3); }
    A.curve(g, [-.36, -.95], [-.62, -.6], [-.55, -.02], .03, '#2a2a2a'); A.cel(g, A.rr(-.62, -.1, .14, .1, .02), '#6a6a66', { lw: .02, hi: false });
    for (const x of [-.24, .04]) A.cel(g, A.rr(x, -.62, .2, .58, .04), '#c8d0c8', { line: '#3a4a3a', hi: false });
    for (const x of [-.14, .14]) A.flat(g, A.ell(x, -.03, .14, .06), '#6a3a3a', .02);
    A.cel(g, A.rr(-.3, -1.52, .6, .96, .1), '#c8d0c8', { line: '#3a4a3a' }); for (let i = 0; i < 5; i++) A.line(g, [[-.24 + i * .12, -1.48], [-.24 + i * .12, -.6]], .025, '#7a9a8a');
    for (const s of [-1, 1]) { A.line(g, [[s * .28, -1.42], [s * .36, -.96]], .11, '#3a4a3a'); A.line(g, [[s * .28, -1.42], [s * .36, -.96]], .07, '#c8d0c8'); A.dot(g, s * .36, -.92, .06, '#e0c4a8'); }
    A.cel(g, A.ell(0, -1.68, .17, .18), '#e0c4a8'); A.curve(g, [-.06, -1.58], [0, -1.55], [.06, -1.58], .018);
    A.cel(g, A.poly([[-.36, -1.7], [.36, -1.7], [.22, -2.22], [-.22, -2.22]]), paa ? '#fff0b0' : '#d8b868', { line: '#5a4020' });
    for (let i = 1; i < 6; i++) A.line(g, [[-.36 + i * .12, -1.7], [-.22 + i * .075, -2.22]], .015, paa ? 'rgba(200,150,60,.5)' : 'rgba(90,60,20,.4)');
    A.line(g, [[.2, -1.72], [.24, -1.42]], .015, '#5a4020'); A.dot(g, .24, -1.4, .03, '#c8a048');
  }),
  utedo: () => Art.part('prop_utedo', 1.4, 2.6, .7, .05, g => { A.cel(g, A.rr(-.55, -2.0, 1.1, 2.0, .03), '#7a5a3a', { line: WOODL }); for (let i = 1; i < 5; i++) A.line(g, [[-.55 + i * .22, -2.0], [-.55 + i * .22, 0]], .02, WOODL); A.cel(g, A.poly([[-.7, -2.0], [.7, -2.0], [.6, -2.35], [-.6, -2.35]]), '#4a3a2a', { line: WOODL }); A.flat(g, A.rr(-.4, -1.85, .8, 1.8, .02), '#6a4a2a', .03); g.save(); g.translate(0, -1.55); g.scale(.12, .12); g.beginPath(); g.moveTo(0, .3); g.bezierCurveTo(-1, -.5, -.5, -1.2, 0, -.6); g.bezierCurveTo(.5, -1.2, 1, -.5, 0, .3); g.fillStyle = '#0a0604'; g.fill(); g.restore(); A.dot(g, .3, -.95, .04, MESS); })
};

/* lyder til hendelsene: kua og telefonklokka */
Object.assign(Sound.lib, {
  mo: [{ w: 'sawtooth', f: 140, d: 1.1, pd: .3, v: .09 }, { w: 'sine', f: 70, d: 1.1, pd: .25, v: .16 }],
  ring: [{ arp: [1320, 1580, 1320, 1580, 1320, 1580, 1320, 1580, 1320, 1580, 1320, 1580], nl: .04, w: 'square', v: .03 }]
});

/* ============================================================
   HENDELSENE. plass: 'vegg' (en høy innevegg), 'gang' (en bred korridor),
   'rom:a,b' (et kamprom av disse typene, nås når det er ryddet).
   lag(h) bygger scenen, samtale(h) gir første samtaleside.
   ============================================================ */
/* hva øyet i sprekken ser: sjefen i denne etasjen, med riktig pronomen */
const OYE_SER = {
  krok: 'Jeg ser hvor overlegen sitter. Han plukker nesen og tørker det under stolen.',
  rust: 'Jeg ser hvor hydroterapeuten sitter. Han plukker nesen og skyller det ned i sluket.',
  arkivar: 'Jeg ser hvor overarkivaren sitter. Hun plukker nesen og arkiverer det under P.',
  klumpen: 'Jeg ser hvor Klumpen ligger. De plukker nesen, alle sammen, i hverandres neser.',
  hekk: 'Jeg ser hvor overgartneren sitter. Han plukker nesen og gjødsler rosene med det.',
  hjort: 'Jeg ser hvor hjorten står. Den har ikke nese. Den har et ansikt den har lånt.',
  journalen: 'Jeg ser hvor Journalen ligger. Den blar i seg selv og leser om deg, høyt.'
};
const HENDELSER = {
  oyet: {
    navn: 'Øyet i sprekken', dybder: [2, 3, 4, 6], plass: 'vegg', vekt: 3, prompt: 'Se inn i sprekken',
    lag(h) {
      const y = 1.25, g = propSprite(null, h.x, h.sted.vz + .03, { P: propArt({ k: 'sprekk' }), shadow: false }); R.level.add(g); h.obj.push(g);
      h.oye = Anim.lag('oye', h.x, h.sted.vz + .05, { y, hold: true, lys: false, s: 1.4, fps: 8 }); h.oye.fart = 0; h.oye.t = 0;
      h.pm = sprite(Blod.pupill(), h.x, h.sted.vz + .056, { y }); h.pm.scale.setScalar(1.4); h.pm.visible = false; h.obj.push(h.pm); h.y = y;
    },
    tick(h, dt) {
      const P = G.player, naer = !h.brukt && d2(P.x, P.z, h.x, h.z) < 30, o = h.oye; if (!o || !o.g.parent) return;
      o.fart = naer ? 1 : -1; o.t = clamp(o.t, 0, (o.rammer.length - .01) / o.fps);
      const aapent = o.i >= 3; h.pm.visible = aapent;
      if (aapent) { const dx = clamp((P.x - h.x) * .025, -.1, .1) * 1.4, dy = clamp(-.03 - (P.z - h.sted.vz) * .006, -.07, .03) * 1.4; h.pm.position.set(h.x + dx, h.y + dy * BILL_Y, h.sted.vz + .056); }
    },
    samtale(h) {
      const m = G.meta, n = (m.hendelser || {}).oyet || 0, forrige = m.oyetHusker;
      const intro = n <= 1 ? 'Det er en sprekk i veggen. Noe blunker i den: et øye, fuktig og rødkantet, som ser rett på deg.\n«Du står på foten min,» sier det. Du står ikke på noen fot.'
        : `«Du igjen,» sier øyet. «Forrige gang var du ${forrige || 'en annen'}. Jeg husker alle som går forbi. Jeg har ingenting annet å gjøre.»`;
      m.oyetHusker = `${Folge.fornavn()}, med ${(G.run.look && G.run.look.klaer) === 'tvang' ? 'tvangstrøye' : 'morgenkåpe'}`;
      return { tittel: 'Øyet i sprekken', bilde: () => oyeBilde(1), tekst: intro, valg: [
        { tekst: 'Spør hva det ser', gjor: () => ({ tekst: `«Jeg ser alt bak veggene. ${OYE_SER[(typeof sjefFor === 'function' ? sjefFor(G.depth) : {}).type] || OYE_SER.krok}»\n«For ti tenner kan du se det samme.»`, valg: [
          { tekst: 'Betal ti gulltenner', hint: 'Viser hele etasjen på kartet', kan: () => G.player.teeth >= 10, gjor: () => { h.brukt = true; Folge.tenner(-10); Folge.kart('alt'); return { tekst: 'Øyet blunker to ganger. Plutselig vet du hvor alt er. Det er ikke en god følelse, men det er praktisk.' }; } },
          { tekst: 'Nei takk', gjor: () => ({ tekst: '«Gjerrigknark,» sier øyet, og ruller seg bort.' }) }] }) },
        { tekst: 'Stikk fingeren inn', hint: 'Det kan gå begge veier', gjor: () => { h.brukt = true; const r = Math.random(); if (r < .45) { Folge.tenner(15); return { tekst: 'Det er varmt og vått der inne. Noe suger forsiktig på fingeren. Når du drar den ut, har den fått femten gulltenner rundt seg, som ringer.' }; } if (r < .75) { Folge.skade(6, 'self'); return { tekst: 'Øyet har tenner. Det visste du ikke. Nå vet du det.' }; } Folge.morb(15); Folge.kuriositet(); return { tekst: 'Du får fingeren tilbake. Det er ikke din finger. Den er litt lengre, og den har en ring. Den fungerer helt fint.' }; } },
        { tekst: 'Blunk tilbake', gjor: () => { h.brukt = true; Folge.hel(12); Folge.morb(-12); Folge.xp(12); return { tekst: 'Øyet blunker. Du blunker. Dere blunker i takt en god stund. Det er det fineste som har skjedd deg på lenge.' }; } },
        { tekst: 'Gå din vei', gjor: () => ({ tekst: '«Alle går,» sier øyet. «Ingen blir. Bortsett fra meg.»' }) }] };
    }
  },
  baklengs: {
    navn: 'Mannen som går baklengs', dybder: [2, 3, 4, 5, 6], plass: 'gang', vekt: 2, prompt: 'Snakk med mannen',
    lag(h) { const d = new Doll('baklengs', { shadow: .45 }); d.root.position.set(h.x, 0, h.z); R.scene.add(d.root); h.dukke = d; ekstraDukke(d); h.data.t = 0; h.data.dir = 1; h.data.x0 = h.x; },
    tick(h, dt) {
      const d = h.dukke; if (!d) return; const P = G.player, naer = d2(P.x, P.z, h.x, h.z) < 9;
      let fart = 0;
      if (!naer && !h.data.borte) { const ax = h.sted.akse || 'x', nx = (ax === 'x' ? h.x : h.z) + h.data.dir * dt * .7, tx = ax === 'x' ? nx : h.x, tz = ax === 'z' ? nx : h.z; if (!solid(Math.floor(tx), Math.floor(tz)) && Math.abs(nx - (ax === 'x' ? h.data.x0 : h.sted.z0 || h.z)) < 3) { if (ax === 'x') h.x = nx; else h.z = nx; fart = .7; } else h.data.dir *= -1; }
      // han ser alltid motsatt vei av den han går
      d.setFacing(h.sted.akse === 'z' ? (h.data.dir > 0 ? Math.PI : 0) : (h.data.dir > 0 ? -Math.PI / 2 : Math.PI / 2)); if (naer) d.setFacing(Math.atan2(P.x - h.x, P.z - h.z));
      d.root.position.set(h.x, 0, h.z); d.update(dt, { speed: fart * 2.4 });
      if (h.data.borte) { h.data.borte -= dt; d.root.scale.setScalar(clamp(h.data.borte, .01, 1)); if (h.data.borte <= 0) { d.dispose(); h.dukke = null; h.ferdig = true; } }
    },
    samtale(h) {
      const linjer = ['Kaffen er bedre på den andre siden.', 'Jeg har vært her før du kom. Jeg går baklengs for å komme tidligere.', 'Uglene er ikke det de ser ut som. De ser ut som ugler.', 'Hun som var her før deg, gikk forlengs. Se hvordan det gikk.'];
      const l = pick(linjer), bak = l.split('').reverse().join('');
      return { tittel: 'Mannen som går baklengs', bilde: () => hendFigur('baklengs'), baklengs: '«' + bak + '»', tekst: 'Han snakker baklengs. Merkelig nok forstår du ham. Han har et lite smil og øynene lukket.', valg: [
        { tekst: 'Følg etter ham', gjor: () => { h.data.borte = 1; const c = Spesial.cracks.find(c => !c.broken); if (c) { Spesial.damage(c, 3); return { tekst: 'Han går baklengs rett inn i veggen, og veggen lar ham gjøre det. Der han gikk, er det nå en åpning. Den har vært der hele tiden, sier du til deg selv.' }; } Folge.kart('skatt'); Folge.tenner(10); return { tekst: 'Han går baklengs rundt et hjørne som ikke var der. Du følger etter og finner bare ti gulltenner på gulvet, lagt i en ring. Og du vet plutselig hvor skatten i etasjen er.' }; } },
        { tekst: 'Svar ham baklengs', gjor: () => { h.brukt = true; h.data.borte = 1.6; Folge.flaske(); Folge.xp(15); return { tekst: '«' + 'Takk skal du ha'.split('').reverse().join('') + '», sier du, og det føles som å snakke med munnen full av grøt. Han nikker langsomt og legger noe i hånden din fra brystlomma.' }; } },
        { tekst: 'Gå videre, forlengs', gjor: () => null }] };
    }
  },
  telefon: {
    navn: 'Telefonen som ringer', dybder: [2, 3, 4, 6], plass: 'vegg', vekt: 2, prompt: 'Ta telefonen',
    lag(h) { const g = propSprite(null, h.x, h.sted.vz + .08, { P: HEND_ART.telefon(), shadow: false, y: .9 }); R.level.add(g); h.obj.push(g); h.data.ringT = 2; },
    tick(h, dt) { if (h.brukt) return; h.data.ringT -= dt; if (h.data.ringT <= 0 && d2(G.player.x, G.player.z, h.x, h.z) < 90) { h.data.ringT = 3.2; Sound.play('ring', .8); setTimeout(() => Sound.play('ring', .8), 700); numText(h.x, h.sted.vz + .3, 'RRRING', 'info', 2.2); } },
    samtale(h) {
      h.brukt = true; const r = h.data.variant ?? (h.data.variant = Math.floor(Math.random() * 4)), bilde = () => hendBilde(HEND_ART.telefon());
      if (r === 0) return { tittel: 'Telefonen', bilde, tekst: '«Hallo? Er det deg? Har du spist?» Det er mor. Hun sier hun har vært død i mange år, men hun har satt maten i ovnen likevel.' + (Folge.ganger('telefon') > 1 ? ' «Du ringte ikke tilbake sist,» sier hun. «Du gjør aldri det.»' : ''), valg: [
        { tekst: '«Ja, mor»', gjor: () => { Folge.hel(25); return { tekst: 'Du kjenner smaken av kjøttkaker og brun saus. Du har ikke spist noe. Du er mett.' }; } },
        { tekst: '«Mor, du er død»', gjor: () => { Folge.morb(-15); Folge.xp(10); return { tekst: '«Ja, vennen. Det er ingen grunn til å ikke spise for det.» Så legger hun på.' }; } },
        { tekst: 'Legg på', gjor: () => null }] };
      if (r === 1) return { tittel: 'Telefonen', bilde, tekst: '«Er Gunhild der? Si til henne at kjelleren er åpen. Si at den har vært åpen hele tiden. Hun vet hva det betyr.»', valg: [
        { tekst: '«Hvem er dette?»', gjor: () => { Folge.kart('sjef'); return { tekst: '«Det er deg,» sier stemmen. «Om en stund.» Du vet plutselig hvor overlegen i denne etasjen venter.' }; } },
        { tekst: 'Legg på', gjor: () => null }] };
      if (r === 2) return { tittel: 'Telefonen', bilde, tekst: 'Noen puster i røret. Lenge. Så hører du din egen stemme, veldig rolig: «Ikke spis kaka.»', valg: [
        { tekst: '«Hvilken kake?»', gjor: () => { Folge.morb(8); Folge.xp(10); return { tekst: 'Det klikker. Du får en følelse av at du kommer til å møte en kake.' }; } },
        { tekst: 'Pust tilbake', gjor: () => { Folge.xp(15); return { tekst: 'Dere puster sammen en stund. Det er intimt på en måte du ikke liker.' }; } }] };
      return { tittel: 'Telefonen', bilde, tekst: '«Er dette fiskebutikken? Jeg har en torsk her som har sagt noe om deg. Noe stygt.»', valg: [
        { tekst: '«Hva sa torsken?»', gjor: () => { Folge.flaske('levertran'); return { tekst: '«Det kan jeg ikke si i telefonen.» Det dunker i sjakta, og en flaske levertran ruller ut av veggen.' }; } },
        { tekst: '«Feil nummer»', gjor: () => ({ tekst: '«Det sier alle,» sukker stemmen.' }) }] };
    }
  },
  kaffe: {
    navn: 'Kaffe og kake', dybder: [1, 2, 3, 4, 5, 6], plass: 'gang', vekt: 2, prompt: 'Se på bordet',
    lag(h) { const g = propSprite(null, h.x, h.z + .3, { P: HEND_ART.kaffebord() }); R.level.add(g); h.obj.push(g); h.lys = R.light(h.x, h.z + .3, 1.6, '#ffd8a0', .35, R.levelL); h.obj.push(h.lys); },
    samtale(h) {
      const bilde = () => hendBilde(HEND_ART.kaffebord());
      return { tittel: 'Kaffe og kake', bilde, tekst: 'Et lite bord midt i gangen. En kopp kaffe, fortsatt varm. Et stykke bløtkake med ett kirsebær. Ingen i nærheten.\nKaffen er svart som en vinternatt over Mjøsa.', valg: [
        { tekst: 'Drikk kaffen', gjor: () => { h.brukt = true; Folge.hel(15); G.player.coffee = true; return { tekst: 'Det er en forbasket god kopp kaffe. Du går litt fortere resten av etasjen.' }; } },
        { tekst: 'Spis kaka', gjor: () => { h.brukt = true; if (Math.random() < .5) { Folge.tenner(12); return { tekst: 'Det er en tann i kaka. Den er ikke din. Nå er den det, sammen med elleve venner.' }; } Folge.morb(10); Folge.hel(5); return { tekst: 'Kaka smaker av sjampo og sorg. Du spiser den likevel. Det er det man gjør med kake.' }; } },
        { tekst: 'Begge deler', gjor: () => { h.brukt = true; Folge.hel(20); G.player.coffee = true; Folge.morb(6); return { tekst: 'Du spiser og drikker. Fra rommet ved siden av sier en mann med rolig stemme: «Og så kirsebærpai. Det er det neste.» Det er ingen der.' }; } },
        { tekst: 'La det stå', gjor: () => ({ tekst: 'Noen kommer til å bli skuffet. Du vet ikke hvem, men du kjenner det i magen.' }) }] };
    }
  },
  ku: {
    navn: 'Kua i kapellet', dybder: [1, 2, 3, 4, 6], plass: 'rom:kapell,likkapell,hage,gardsplass,liggehall', vekt: 2, prompt: 'Hils på kua',
    lag(h) { const g = propSprite(null, h.x, h.z + .3, { P: HEND_ART.ku() }); R.level.add(g); h.obj.push(g); h.g = g; h.data.t = 0; },
    tick(h, dt) { h.data.t += dt; const m = h.g.userData.m; if (m) m.rotation.z = Math.sin(h.data.t * 1.3) * .015; if (Math.random() < dt * .08 && d2(G.player.x, G.player.z, h.x, h.z) < 60) { Sound.play('mo', .7); numText(h.x, h.z, 'Mø', 'info', 2.2); } },
    samtale(h) {
      const navn = Folge.fornavn();
      const sparket = G.meta.kuSpark && Folge.ganger('ku') > 1;
      return { tittel: 'Kua', bilde: () => hendBilde(HEND_ART.ku()), tekst: sparket ? `Det er den samme kua. Hun ser på deg lenge. «Du sparket meg,» sier hun. «Det var en annen pasient, men det var deg.» Så sier hun «${navn}», og så «mø».` : `Det står ei ku her. Ingen vet hvordan hun kom seg inn. Hun ser på deg med store, våte øyne og sier: «${navn}.» Så sier hun «mø».`, valg: [
        { tekst: 'Melk henne', gjor: () => { h.brukt = true; Folge.hel(20); return { tekst: 'Melken er varm og smaker gress og gamle søndager. Kua ser vennlig bort mens du drikker. Det er det høfligste noen har gjort for deg her.' }; } },
        { tekst: 'Klapp henne', gjor: () => { h.brukt = true; Folge.morb(-20); Folge.xp(15); return { tekst: 'Hun lukter fjøs og noe du husker fra da du var liten. Du gråter litt. Kua sier ingenting om det.' }; } },
        { tekst: 'Spør hvorfor hun er her', gjor: () => ({ tekst: '«Jeg er her for deg,» sier kua. «Og for høyet. Mest for høyet.» Så løfter hun halen, og det kommer en kake. Ikke den typen kake.' }) },
        { tekst: 'Gi henne et spark', gjor: () => { h.brukt = true; G.meta.kuSpark = true; saveMeta(); Folge.skade(8, 'self'); return { tekst: 'Kua sparker tilbake. Hardere. Så ser hun skuffet på deg, og det er verre enn sparket.' }; } }] };
    }
  },
  hjemmebrent: {
    navn: 'Hjemmebrentapparatet', dybder: [2, 3, 4, 5, 6], plass: 'rom:vaskeri,fyrrom,kjeller,koie,kjokken,likkapell,arkiv', vekt: 2, prompt: 'Hils på brenneren',
    lag(h) { const g = propSprite(null, h.x, h.z + .3, { P: HEND_ART.brennevin() }); R.level.add(g); h.obj.push(g); h.obj.push(R.light(h.x + .5, h.z + .3, 1.4, '#ff8a3a', .35, R.levelL)); },
    samtale(h) {
      return { tittel: 'Hjemmebrentapparatet', bilde: () => hendBilde(HEND_ART.brennevin()), tekst: 'En pasient i ullundertøy passer et kobberapparat som putrer og plystrer. «Laget på lutefisk og fotsopp,» sier han stolt. «Og litt formalin. For smakens skyld.»', valg: [
        { tekst: 'Ta en slurk', hint: 'Sterkere en stund, og du spyr', gjor: () => { h.brukt = true; const P = G.player; P.kamferT = 25; Folge.morb(10); G.run.fyllT = 25; return { tekst: 'Det brenner hele veien ned og et stykke tilbake. Du føler deg sterk som en hest. Du lukter som en hest. Om litt kommer du til å spy, og det kommer til å bli et våpen.' }; } },
        { tekst: 'Kjøp en flaske', hint: 'Åtte gulltenner', kan: () => G.player.teeth >= 8, gjor: () => { h.brukt = true; Folge.tenner(-8); Folge.flaske('kamfer'); return { tekst: '«Klok mann,» sier han, selv om du ikke er det. Flasken har en etikett der det står MEDISIN med blyant.' }; } },
        { tekst: 'Tyst på ham', gjor: () => { h.brukt = true; Folge.fiender('pleier', 2); return { tekst: '«TYSTER!» roper han, så høyt at hele etasjen hører det. To pleiere kommer løpende. De er ikke ute etter ham.' }; } },
        { tekst: 'Gå', gjor: () => ({ tekst: '«Du kommer tilbake,» sier han. «Alle kommer tilbake.»' }) }] };
    }
  },
  doet: {
    navn: 'Doet som snakker', dybder: [1, 2, 3, 4, 6], plass: 'gang', vekt: 2, prompt: 'Lytt til doet',
    lag(h) { const ute = G.F.ute, P = ute ? HEND_ART.utedo() : propArt({ k: 'toilet' }), g = propSprite(null, h.x, h.z + .3, { P }); R.level.add(g); h.obj.push(g); h.data.ute = ute; },
    tick(h, dt) { if (!h.brukt && Math.random() < dt * .25 && d2(G.player.x, G.player.z, h.x, h.z) < 40) { Sound.play('splash', .4, .6); numText(h.x, h.z, 'blubb', 'info', 2); } },
    samtale(h) {
      const lik = (G.meta.lik || []).filter(l => l.depth === G.depth), bilde = () => hendBilde(h.data.ute ? HEND_ART.utedo() : propArt({ k: 'toilet' }));
      return { tittel: h.data.ute ? 'Utedoet' : 'Doet', bilde, tekst: 'Det gurgler i avløpet. Så sier det, med en stemme som har vært gjennom mange rør: «Gi meg noe. Så gir jeg deg noe tilbake. Det er sånn rør fungerer.»', valg: [
        { tekst: 'Skyll ned ti gulltenner', kan: () => G.player.teeth >= 10, gjor: () => { h.brukt = true; Folge.tenner(-10); Folge.lomme(); return { tekst: 'Det skyller. Det rapper. Så spytter doet opp noe lite og blankt, og sier «unnskyld».' }; } },
        { tekst: 'Stikk hånden ned', gjor: () => { h.brukt = true; if (lik.length && Math.random() < .6) { const l = pick(lik); Folge.tenner(Math.max(8, Math.round((l.teeth || 10) * .5))); return { tekst: `Du finner en tøffel med navnelapp: ${l.name}. Inni tøffelen er det gulltenner. ${l.name.split(' ')[0]} trenger dem ikke lenger.` }; } if (Math.random() < .5) { Folge.kuriositet(); return { tekst: 'Noe i dypet tar hånden din og hilser. Fast håndtrykk. Når du drar den opp, holder du noe du ikke kan forklare.' }; } Folge.skade(5, 'self'); Folge.morb(8); return { tekst: 'Noe biter. Det var ikke personlig, sier doet etterpå.' }; } },
        { tekst: 'Tiss i det', gjor: () => { h.brukt = true; Folge.hel(8); return { tekst: 'Det føles riktig. Doet takker høflig. Det er første gang på lenge noen har brukt det til det det er laget for.' }; } },
        { tekst: 'Trekk ned og gå', gjor: () => ({ tekst: 'Doet synger en liten sang mens det renner. Den handler om deg.' }) }] };
    }
  },
  badekar: {
    navn: 'Mannen i badekaret', dybder: [3, 6], plass: 'rom:bad,lysgard', vekt: 3, prompt: 'Snakk med mannen i karet',
    lag(h) { const g = propSprite(null, h.x, h.z + .3, { P: HEND_ART.badekar() }); R.level.add(g); h.obj.push(g); },
    samtale(h) {
      const a = pick(DEATH_CAUSES[pick(Object.keys(DEATH_CAUSES).filter(k => k !== 'boss'))] || DEATH_CAUSES.any);
      return { tittel: 'Mannen i badekaret', bilde: () => hendBilde(HEND_ART.badekar()), tekst: 'En mann sitter i badekaret med dress og hatt og leser avisen. Vannet er grått og lunkent. «Vannet er fint,» sier han uten å se opp. «Det er deg det er noe galt med.»' + (Folge.ganger('badekar') > 1 ? '\n«Avisen hadde rett forrige gang, forresten,» sier han. «Den har alltid rett. Det er det som er så trist med den.»' : ''), valg: [
        { tekst: 'Les over skulderen hans', gjor: () => { h.brukt = true; Folge.xp(20); G.player.kamferT = Math.max(G.player.kamferT, 8); return { tekst: `Det er morgendagens avis. På side fire står en liten notis om deg: «${a}» Du vet nå hvordan du dør. Det gjør deg modig en liten stund.` }; } },
        { tekst: 'Hopp oppi', gjor: () => { h.brukt = true; Folge.hel(999); Folge.morb(20); return { tekst: 'Vannet er varmt. Det er ikke bare vann. Du blir sittende en stund med mannen. Han blar om. Du er helt frisk og litt skitnere enn før.' }; } },
        { tekst: 'Trekk ut proppen', gjor: () => { h.brukt = true; Folge.tenner(20); return { tekst: 'Mannen synker langsomt ned i sluket, fortsatt lesende. «Takk,» sier han. «Endelig.» Igjen ligger hatten, full av gulltenner.' }; } }] };
    }
  },
  heis: {
    navn: 'Heisen som bare går ned', dybder: [2, 3, 4], plass: 'vegg', vekt: 1, prompt: 'Gå inn i heisen',
    lag(h) { const g = propSprite(null, h.x, h.sted.vz + .06, { P: HEND_ART.heis(), shadow: false }); R.level.add(g); h.obj.push(g); h.obj.push(R.light(h.x, h.sted.vz + .4, 2, '#ffcf8a', .4, R.levelL)); },
    samtale(h) {
      return { tittel: 'Heisen', bilde: () => hendBilde(HEND_ART.heis()), tekst: 'En heis du ikke har sett før. Grinden står åpen. Heisføreren har uniform og lue, men ikke ansikt.\n«Ned?» spør han. Det er den eneste retningen.', valg: [
        { tekst: '«Ned»', hint: 'Fem gulltenner i drikkepenger', kan: () => G.player.teeth >= 5, gjor: () => { h.brukt = true; Folge.tenner(-5); const F = G.F, b = F.rooms[F.bossId], n = F.rooms.find(r => F.adj[F.bossId].includes(r.id)) || b, s = freeSpot(n.x + n.w / 2, n.z + n.h / 2, 3); const P = G.player; P.x = s.x; P.z = s.z; R.snapCamera(P.x, P.z); Folge.visRom(n); return { tekst: 'Heisen går ned. Og ned. Og litt til siden. Når grinden går opp, står du et sted du ikke har vært, like ved døra til overlegen.' }; } },
        { tekst: 'Spør hvor ansiktet hans er', gjor: () => ({ tekst: '«I heisen,» sier han. «Et sted mellom tredje og fjerde. Den stopper ikke der lenger.»' }) },
        { tekst: 'Nei takk', gjor: () => null }] };
    }
  },
  rotter: {
    navn: 'Rotteparlamentet', dybder: [3, 4, 5], plass: 'gang', vekt: 1, prompt: 'Hør på rottene',
    lag(h) { const g = propSprite(null, h.x, h.z, { P: HEND_ART.rotter(), shadow: false }); R.level.add(g); h.obj.push(g); h.obj.push(R.light(h.x, h.z, 1.2, '#ffc84a', .3, R.levelL)); },
    tick(h, dt) { if (!h.brukt && Math.random() < dt * .3 && d2(G.player.x, G.player.z, h.x, h.z) < 36) Sound.play('rotte', .6); },
    samtale(h) {
      const tale = owned('monolog') || G.player.stats.forstand >= 3;
      return { tittel: 'Rotteparlamentet', bilde: () => hendBilde(HEND_ART.rotter()), tekst: 'Seks rotter sitter i ring rundt en stearinlysstump. Den største har parykk. «Parlamentet er satt,» piper den. «Saken gjelder deg. Skal du få gå forbi?»', valg: [
        { tekst: 'Bestikk dem', hint: 'Åtte gulltenner', kan: () => G.player.teeth >= 8, gjor: () => { h.brukt = true; Folge.tenner(-8); Folge.kart('alt'); return { tekst: 'Enstemmig vedtatt. Rottene klapper med halene. Etterpå forteller de deg hvor alt i etasjen er, for rotter vet sånt.' }; } },
        { tekst: 'Hold en tale', hint: tale ? 'Du er god til sånt' : 'Du er ikke god til sånt', gjor: () => { h.brukt = true; if (tale) { Folge.xp(30); Folge.kuriositet(); return { tekst: 'Talen din er så lang at to av rottene dør av alderdom. Resten gir seg og gir deg sitt kjæreste eie.' }; } Folge.fiender('rotte', 3); return { tekst: 'Rottene buer. Én kaster en ertestuing. Så kaster resten seg over deg.' }; } },
        { tekst: 'Tråkk på lyset', gjor: () => { h.brukt = true; Folge.fiender('rotte', 5); return { tekst: 'Mørke. Så hører du seksti små føtter.' }; } }] };
    }
  },
  graven: {
    navn: 'Graven med navnet ditt', dybder: [1], plass: 'rom:kirkegard,hage', vekt: 4, prompt: 'Les gravsteinen',
    lag(h) { const navn = (G.run.patient && G.run.patient.name) || 'Pasient', p = { k: 'gravstein', navn: 7 }, P = Art.part('prop_gravstein_din_' + navn.replace(/\W/g, '').slice(0, 20), 1.0, 1.4, .5, .05, g => { A.cel(g, A.poly([[-.36, 0], [.36, 0], [.36, -.88], [0, -1.18], [-.36, -.88]]), '#9a9a90', { line: INK }); g.save(); g.fillStyle = '#2a2a24'; g.textAlign = 'center'; g.font = 'bold .12px Georgia, serif'; g.fillText(navn.split(' ')[0].toUpperCase().slice(0, 10), 0, -.72); g.fillText((navn.split(' ')[1] || '').toUpperCase().slice(0, 10), 0, -.56); g.font = '.1px Georgia, serif'; g.fillText('I DAG', 0, -.36); g.restore(); });
      const g = propSprite(null, h.x, h.z - .2, { P }); R.level.add(g); h.obj.push(g); h.P = P; const gr = propSprite(null, h.x, h.z + .8, { P: ROM_ART.grav(), flat: true }); R.level.add(gr); h.obj.push(gr); },
    samtale(h) {
      const navn = (G.run.patient && G.run.patient.name) || 'deg', B = typeof sjefFor === 'function' ? sjefFor(G.depth) : null;
      const dode = (G.meta.historie || []).filter(x => !x.utskrevet && x.name), forrige = dode.length ? dode[dode.length - 1].name : null;
      return { tittel: 'Graven', bilde: () => hendBilde(h.P), tekst: `En gravstein med navnet ditt: ${navn}. Datoen er i dag. Graven er gravd, og spaden står ved siden av, som om noen håpet du ville gjøre resten selv.` + (forrige ? `\nVed siden av står en eldre stein der det står ${forrige}. Den graven er tom.` : ''), valg: [
        { tekst: 'Grav videre', gjor: () => { h.brukt = true; const lik = G.meta.lik || []; if (lik.length) { const l = pick(lik); Folge.tenner(Math.max(10, Math.round((l.teeth || 10) * .4))); Folge.flaske(); return { tekst: `Du finner tøflene til ${l.name}. I den ene ligger gulltenner, i den andre en lapp: «Det er ikke meg som ligger her heller.»` }; } Folge.kuriositet(); return { tekst: 'Spaden treffer noe hardt. Det er en boks. I boksen er det noe som var ment for deg.' }; } },
        { tekst: 'Legg deg ned i graven', gjor: () => { h.brukt = true; Folge.hel(999); Folge.morb(20); return { tekst: 'Det er overraskende behagelig. Du sover litt. Når du våkner, har noen strødd hvitveis over deg. Du er helt frisk. Du er litt mindre deg.' }; } },
        { tekst: 'Skriv et annet navn på steinen', gjor: () => { h.brukt = true; (G.run.sjefSvekk || (G.run.sjefSvekk = {}))[G.depth] = .2; return { tekst: `Du skraper ut navnet ditt og skriver ${B ? B.name.toUpperCase() : 'OVERLEGEN'} i stedet. Et sted i parken hører du noen hoste stygt.` }; } }] };
    }
  },
  dans: {
    navn: 'Den dansende pleieren', dybder: [2, 3, 4], plass: 'rom:dagligstue,spisesal,venterom,sovesal,kapell,behandling', vekt: 2, prompt: 'Se på pleieren',
    lag(h) { const d = new Doll('pleier', { shadow: .5 }); d.root.position.set(h.x, 0, h.z); R.scene.add(d.root); h.dukke = d; ekstraDukke(d); h.data.t = 0; const g = propSprite(null, h.x + 1.3, h.z - .2, { P: ROM_ART.grammofon() }); R.level.add(g); h.obj.push(g); },
    tick(h, dt) {
      const d = h.dukke; if (!d || h.data.frosset) return; h.data.t += dt; const P = G.player;
      if (h.data.dans > 0) { h.data.dans -= dt; if (Math.hypot(P.vx, P.vz) > 1.2) { h.data.dans = 0; this.sint(h); return; } if (h.data.dans <= 0) { h.brukt = true; Folge.kuriositet(); Folge.hel(15); toast('Platen er ferdig', 'Hun kysser deg på pannen og legger noe i lomma di'); d.dispose(); h.dukke = null; h.ferdig = true; return; } }
      d.setFacing(h.data.t * 1.2); d.update(dt, { speed: .4, hop: Math.abs(Math.sin(h.data.t * 2.2)) * .05 }); d.root.position.set(h.x + Math.sin(h.data.t * .7) * .25, 0, h.z + Math.cos(h.data.t * .7) * .15);
      if (Math.random() < dt * .6) Sound.play('coo', .25, .8 + Math.random() * .4);
    },
    sint(h) { h.brukt = true; if (h.dukke) { h.dukke.dispose(); h.dukke = null; } h.ferdig = true; const e = spawnEnemy('pleier', h.x, h.z, true, G.depth); e.t = 0; FX.bubble(e, 'Det var ikke en forestilling.', 1.6); },
    samtale(h) {
      return { tittel: 'Den dansende pleieren', bilde: () => hendFigur('pleier'), tekst: 'En pleier danser alene til en grammofon som går for sakte. Hun har øynene lukket. «Ikke se på meg,» sier hun. «Dans med meg.»', valg: [
        { tekst: 'Dans', hint: 'Stå helt stille til platen er ferdig', gjor: () => { h.data.dans = 5; setTimeout(() => toast('Du danser', 'Ikke rør deg. Hun leder.'), 50); return null; } },
        { tekst: 'Klapp', gjor: () => { this.sint(h); return { tekst: 'Hun åpner øynene. De er helt svarte. «Det var ikke en forestilling,» sier hun.' }; } },
        { tekst: 'Løft av nåla', gjor: () => { h.brukt = true; Folge.xp(20); h.data.frosset = true; if (h.dukke) h.dukke.root.visible = true; h.ferdig = true; return { tekst: 'Musikken stopper. Pleieren stopper midt i en piruett og blir stående sånn, med den ene foten i lufta. Hun står der sikkert fortsatt.' }; } }] };
    }
  },
  radio: {
    navn: 'Radioen', dybder: [2, 3, 4, 6], plass: 'rom:dagligstue,spisesal,venterom,direktor,arkiv,kartotek,behandling', vekt: 2, prompt: 'Lytt til radioen',
    lag(h) { const g = propSprite(null, h.x, h.z + .3, { P: HEND_ART.radio() }); R.level.add(g); h.obj.push(g); },
    tick(h, dt) { if (!h.brukt && Math.random() < dt * .2 && d2(G.player.x, G.player.z, h.x, h.z) < 30) Sound.mumble(3, 190); },
    samtale(h) {
      const B = typeof sjefFor === 'function' ? sjefFor(G.depth) : null, nr = (G.run.patient && G.run.patient.nr) || 0;
      return { tittel: 'Radioen', bilde: () => hendBilde(HEND_ART.radio()), tekst: `Et hørespill på prøvesendingen. «...og så gikk pasient nummer ${nr} inn i rommet med søylene, og der ventet ${B ? B.name : 'overlegen'}. Pasienten hadde ${pick(['glemt tøflene', 'en tann for mye', 'ingen plan', 'en mopp og god tid'])}...»`, valg: [
        { tekst: 'Skru opp', gjor: () => { h.brukt = true; Folge.kart('sjef'); Folge.xp(10); return { tekst: 'Fortelleren beskriver veien til overlegen så nøyaktig at du kunne gått den med lukkede øyne. Så kommer reklame for levertran.' }; } },
        { tekst: 'Bytt kanal', gjor: () => { h.brukt = true; Folge.hel(6); Folge.morb(5); return { tekst: 'En mann leser opp oppskriften på lutefisk, veldig langsomt. Du blir sulten og kvalm på samme tid, og det er en slags helse.' }; } },
        { tekst: 'Skru av', gjor: () => ({ tekst: 'Det blir stille. Så hører du hørespillet fortsette inni hodet ditt.' }) }] };
    }
  },
  kaffeselskap: {
    navn: 'Kaffeselskapet i lysningen', dybder: [5], plass: 'rom:lysning,bjorkeskog,tjern', vekt: 4, prompt: 'Hils på damene',
    lag(h) { const g = propSprite(null, h.x, h.z + .3, { P: HEND_ART.damer() }); R.level.add(g); h.obj.push(g); h.obj.push(R.light(h.x, h.z + .5, 3, '#ffb070', .45, R.levelL)); },
    samtale(h) {
      return { tittel: 'Kaffeselskapet', bilde: () => hendBilde(HEND_ART.damer()), tekst: 'Tre gamle damer i bunad sitter på stubber og drikker kaffe av kopper med gullkant. Det er midt på natta, under grunnmuren, i en skog som ikke finnes.\n«Sett deg, vennen,» sier den ene. «Vi har sveler.» Den tredje har kuhale. Ingen nevner det.', valg: [
        { tekst: 'Ta en svele', gjor: () => { h.brukt = true; Folge.hel(30); return { tekst: 'Svelen er god. Den er laget med brunost og noe som beveger seg litt.' }; } },
        { tekst: 'Spør om veien ut', gjor: () => { Folge.kart('sjef'); return { tekst: '«Ut?» De ler lenge og hjertelig. «Det finnes ingen ut, vennen. Bare kaffe.» Så peker de, alle tre, samme vei.' }; } },
        { tekst: 'Nevn kuhalen', gjor: () => { h.brukt = true; Folge.fiender('kultist', 2, true); return { tekst: 'Det blir helt stille. Så reiser hun seg. Hun er mye høyere enn du trodde, og hun har med seg venner.' }; } }] };
    }
  },
  kubbekona: {
    navn: 'Kona med kubben', dybder: [1, 5], plass: 'gang', vekt: 3, prompt: 'Snakk med kona',
    lag(h) { const g = propSprite(null, h.x, h.z + .3, { P: HEND_ART.kubbekona() }); R.level.add(g); h.obj.push(g); },
    samtale(h) {
      const B = typeof sjefFor === 'function' ? sjefFor(Math.min(MAX_DEPTH, G.depth + 1)) : null, n = B ? B.name : 'noen';
      const igjen = Folge.ganger('kubbekona') > 1 ? '«Kubben husker deg,» sier kona før du rekker å si noe. «Den sier du har blitt tynnere.»\n' : '';
      return { tittel: 'Kona med kubben', bilde: () => hendBilde(HEND_ART.kubbekona()), tekst: igjen + 'En gammel kone i sjal står på stien og holder en vedkubbe i armene, slik man holder et spedbarn. «Kubben min har sett noe,» sier hun. «Den vil at jeg skal si det til deg. Jeg liker det ikke.»', valg: [
        { tekst: '«Hva har den sett?»', gjor: () => { h.brukt = true; Folge.xp(15); Folge.kart('sjef'); return { tekst: `Hun legger øret mot kubben og lytter lenge. «Den sier at ${n} venter lenger nede. Den sier at ${n} har kalde hender og varm kaffe.»\nHun ser opp. «Den sier at det er vann under grunnmuren, og at vannet drømmer. Kubber vet sånt. De har røtter.»\n«Og den sier at du skal passe deg for kaka. Den sier ikke hvilken kake. Det gjør den aldri.»` }; } },
        { tekst: 'Be om å få holde kubben', gjor: () => { h.brukt = true; Folge.hel(20); Folge.morb(-15); return { tekst: 'Kubben er tung og varm, som om den har ligget i sola hele dagen. Du vugger den litt. Kona ser på deg som på et barnebarn hun ikke har bestemt seg for om hun liker. Du føler deg bedre enn du har gjort på lenge.' }; } },
        { tekst: 'Spør om du kan fyre med den', gjor: () => { h.brukt = true; Folge.skade(6, 'self'); Folge.morb(15); return { tekst: '«FYRE?» Hun slår deg i hodet med kubben, to ganger. Kubben sier ingenting, men du kjenner at den er skuffet over deg.' }; } }] };
    }
  },
  kjempen: {
    navn: 'Kjempen', dybder: [2, 3, 4, 6], plass: 'rom:*', vekt: 2, prompt: 'Se opp',
    lag(h) { const g = propSprite(null, h.x, h.z + .3, { P: HEND_ART.kjempe() }); R.level.add(g); h.obj.push(g); h.obj.push(R.light(h.x, h.z + .3, 1.8, '#c8d8ff', .3, R.levelL)); },
    samtale(h) {
      const B = typeof sjefFor === 'function' ? sjefFor(G.depth) : null;
      const sant = pick([`Overlegen her heter ${B ? B.name : 'noe med O'}.`, 'Skatten ligger der du ikke har vært.', 'Den som ringer, er ikke den du tror.']);
      const tull = shuf(['Uglene har flyttet inn i veggene.', 'Kaffen i kanna er kald, men den husker at den var varm.', 'Det står en hest i kjelleren. Ikke spør meg hvordan.', 'Mannen som går baklengs, er ikke født ennå.', 'Tannfeen ligger etter med arbeidet.', 'Det er et hav under kjelleren. Det har lav puls.', 'Bjella du hører om natten, er ikke til deg. Ennå.']).slice(0, 2);
      const tre = shuf([sant, ...tull]);
      return { tittel: 'Kjempen', bilde: () => hendBilde(HEND_ART.kjempe()), tekst: 'En mann i smoking står midt i rommet. Han er så høy at hodet nesten forsvinner i mørket under taket. Han bøyer seg ikke ned. Stemmen kommer langt ovenfra og veldig langsomt.\n«Jeg skal si deg tre ting,» sier han. «To av dem er sanne.»', valg: [
        { tekst: 'Lytt', gjor: () => { h.brukt = true; Folge.xp(20); Folge.kart('skatt'); Hendelse.borte(h); return { tekst: `«Én: ${tre[0]}»\n«To: ${tre[1]}»\n«Tre: ${tre[2]}»\nSå promper han, langt der oppe. Det tar en god stund før lukten når ned til deg, og da er han borte.` }; } },
        { tekst: 'Gi ham ti gulltenner', hint: 'Han ser ut som han trenger dem', kan: () => G.player.teeth >= 10, gjor: () => { h.brukt = true; Folge.tenner(-10); Folge.kuriositet(); Hendelse.borte(h); return { tekst: 'Han tar imot tennene uten å bøye seg. Du vet ikke hvordan. Til gjengjeld slipper han noe ned fra høyden. Det lander i hånden din, og det er varmt.' }; } },
        { tekst: 'Spør hva han heter', gjor: () => ({ tekst: '«Jeg har ikke noe navn,» sier han. «Men jeg har en hatt.» Han har ingen hatt.' }) }] };
    }
  },
  tannfeen: {
    navn: 'Tannfeen', dybder: [2, 3], plass: 'rom:sovesal,eget,venterom,dagligstue,isolat', vekt: 2, prompt: 'Se under senga',
    lag(h) { const g = propSprite(null, h.x, h.z + .3, { P: HEND_ART.tannfe() }); R.level.add(g); h.obj.push(g); },
    tick(h, dt) { if (!h.brukt && Math.random() < dt * .15 && d2(G.player.x, G.player.z, h.x, h.z) < 30) Sound.play('tooth', .25, .7); },
    samtale(h) {
      return { tittel: 'Tannfeen', bilde: () => hendBilde(HEND_ART.tannfe()), tekst: 'Under en av sengene ligger en voksen dame i nattkjole, med møllvinger på ryggen. Hun teller tenner i en liten haug og klør seg i håret. Noe i håret klør tilbake.\n«Én for hvert år du ikke har vært snill,» sier hun uten å se opp. «Du har mange.»', valg: [
        { tekst: 'Selg henne femten gulltenner', hint: 'Hun betaler med et hjerte', kan: () => G.player.teeth >= 15, gjor: () => { h.brukt = true; Folge.tenner(-15); Folge.hjerte(); return { tekst: 'Hun biter i hver eneste tann for å se om den er ekte. Så gir hun deg et lite, varmt hjerte fra en boks under senga. Du spør ikke hvem det har tilhørt.' }; } },
        { tekst: 'Gi henne en av dine egne', hint: 'Det gjør vondt', gjor: () => { h.brukt = true; Folge.skade(5, 'self'); Folge.flaske(); Folge.xp(10); return { tekst: 'Hun har en tang i ermet. Det går fort. Til gjengjeld får du en flaske som lukter munnvann og natt, og en følelse av at du har gjort noe riktig for første gang på lenge.' }; } },
        { tekst: 'Tråkk på vingene', gjor: () => { h.brukt = true; Folge.fiender('flue', 4); return { tekst: 'Møllvingene knaser som gammelt papir. Hun ser opp på deg, veldig lenge. Så åpner hun munnen, og ut kommer fluer.' }; } }] };
    }
  },
  lampemann: {
    navn: 'Mannen som er en lampe', dybder: [2, 3, 4, 6], plass: 'vegg', vekt: 2, prompt: 'Snakk med lampen',
    lag(h) { h.g = propSprite(null, h.x, h.sted.vz + .35, { P: HEND_ART.lampemann(true) }); R.level.add(h.g); h.obj.push(h.g); h.lys = R.light(h.x, h.sted.vz + .6, 2.2, '#ffd890', .35, R.levelL); h.obj.push(h.lys); h.data.t = 0; },
    tick(h, dt) { if (!h.lys || !h.lys.parent) return; h.data.t += dt; if (!h.data.opp) R.setLight(h.lys, .3 + Math.sin(h.data.t * 9) * .05 + (Math.random() < .02 ? -.25 : 0)); },
    samtale(h) {
      return { tittel: 'Lampen', bilde: () => hendBilde(HEND_ART.lampemann(!h.data.av)), tekst: 'En pasient står helt stille inntil veggen med en lampeskjerm på hodet. Skjermen lyser svakt. En ledning går ut av ermet og inn i veggen.\n«Jeg er en lampe,» sier han. «Vær så snill, ikke si noe annet.»', valg: [
        { tekst: 'Skru ham opp', gjor: () => { h.brukt = true; h.data.opp = true; R.remove(h.lys); h.lys = R.light(h.x, h.sted.vz + .8, 6, '#ffe4a8', .8, R.levelL); h.obj.push(h.lys); Folge.naerRom(h.x, h.z, 24); Folge.xp(10); return { tekst: 'Du drar i snora. Det klikker et sted inni ham, og skjermen blir sterk og gul. Nå ser du rommene rundt, helt inn i krokene. Han smiler så bredt at skjermen vipper.\n«Takk,» hvisker han. «Det er lenge siden noen så meg ordentlig.»' }; } },
        { tekst: 'Slå ham av', gjor: () => { h.brukt = true; h.data.av = true; R.remove(h.lys); R.remove(h.g); h.g = propSprite(null, h.x, h.sted.vz + .35, { P: HEND_ART.lampemann(false) }); R.level.add(h.g); h.obj.push(h.g); Folge.hel(15); return { tekst: '«Endelig,» sier han i mørket, og sovner stående. Fra lomma hans faller en halv brødskive med sirup. Den er god, og bare litt lodden.' }; } },
        { tekst: 'Si at han ikke er en lampe', gjor: () => { h.brukt = true; Folge.morb(10); Hendelse.borte(h); Folge.fiender('tvang', 1, true); return { tekst: 'Han ser lenge på deg under skjermen. Så går pæra. Det smeller, og det lukter svidd hår. Når røyken letter, står det noen andre der, og han er mye sintere.' }; } }] };
    }
  }
};

/* ============================================================
   PLASSERING OG STYRING
   ============================================================ */
const Hendelse = {
  aktive: [],
  onFloor() {
    this.fjern(); const F = G.F, run = G.run; if (!F || !run || G.drom) return;
    const rng = mulberry32(((F.seed >>> 0) * 3 + 97) >>> 0), brukt = run.hendelser || (run.hendelser = []), forrige = run.hendForrige || [];
    const passer = id => HENDELSER[id].dybder.includes(G.depth);
    let antall = 2 + (rng() < .5 ? 1 : 0) + (G.depth >= 3 && rng() < .3 ? 1 : 0), vakt = 0;
    // nye hendelser først. Blir puljen for liten, kan en fra tidligere i løpet komme igjen, men aldri en fra etasjen over
    const kand = Object.keys(HENDELSER).filter(id => passer(id) && !brukt.includes(id));
    if (kand.length < antall + 1) for (const id of Object.keys(HENDELSER)) if (passer(id) && brukt.includes(id) && !forrige.includes(id)) kand.push(id);
    const vekt = id => (HENDELSER[id].vekt || 1) * (brukt.includes(id) ? .3 : 1), her = [];
    while (antall > 0 && kand.length && vakt++ < 30) {
      const tot = kand.reduce((a, id) => a + vekt(id), 0); let r = rng() * tot, i = 0;
      for (; i < kand.length - 1; i++) { r -= vekt(kand[i]); if (r <= 0) break; }
      const id = kand.splice(i, 1)[0], H = HENDELSER[id], sted = this.finnSted(H.plass, rng); if (!sted) continue;
      const h = { id, H, x: sted.x, z: sted.z, sted, obj: [], data: {} };
      try { H.lag(h); this.aktive.push(h); if (!brukt.includes(id)) brukt.push(id); her.push(id); antall--; } catch (e) { console.warn('hendelse', id, e); for (const o of h.obj) R.remove(o); }
    }
    run.hendForrige = her;
  },
  /* et ledig sted for hendelsen, minst seks ruter fra de andre */
  finnSted(plass, rng) {
    const F = G.F, W = F.W, wh = Paint.wallH || [], ledig = (x, z) => x > 0 && z > 0 && x < W - 1 && z < F.H - 1 && F.tiles[z * W + x] && !F.block[z * W + x];
    const langtFra = (x, z) => this.aktive.every(h => d2(h.x, h.z, x, z) > 36) && !(G.F.rooms[F.startId] && d2(F.rooms[F.startId].cx, F.rooms[F.startId].cz, x, z) < 16);
    const naerDor = (x, z) => F.rooms.some(r => r.doors.some(d => Math.abs(d % W - x) + Math.abs(((d / W) | 0) - z) <= 2));
    const romOK = rid => rid < 0 || !['start', 'boss', 'service', 'secret', 'treasure', 'offer', 'cursed'].includes(F.rooms[rid].role);
    const kand = [];
    if (plass === 'vegg') {
      for (let z = 1; z < F.H; z++) for (let x = 1; x < W - 1; x++) {
        if (!ledig(x, z) || !(wh[(z - 1) * W + x] > 2) || !D3.inneVegg((z - 1) * W + x) || (Paint.opptatt && Paint.opptatt.has(x + ',' + z))) continue;
        if (!romOK(F.roomId[z * W + x]) || naerDor(x, z) || !langtFra(x + .5, z + .5)) continue;
        kand.push({ x: x + .5, z: z + .7, vz: z });
      }
    } else if (plass === 'gang') {
      for (let z = 2; z < F.H - 2; z++) for (let x = 2; x < W - 2; x++) {
        if (F.tiles[z * W + x] !== T_COR || F.roomId[z * W + x] >= 0) continue;
        let ok = true; for (let dz = -1; dz <= 1 && ok; dz++) for (let dx = -1; dx <= 1 && ok; dx++) if (!ledig(x + dx, z + dz)) ok = false;
        if (!ok || naerDor(x, z) || !langtFra(x + .5, z + .5)) continue;
        const akse = ledig(x + 2, z) && ledig(x - 2, z) ? 'x' : 'z';
        kand.push({ x: x + .5, z: z + .5, akse, z0: z + .5 });
      }
    } else if (plass.startsWith('rom:')) {
      const typer = plass.slice(4).split(','), alle = typer[0] === '*';
      for (const r of F.rooms) {
        if ((!alle && !typer.includes(r.template)) || !['combat', 'risk'].includes(r.role)) continue;
        for (let g = 0; g < 20; g++) { const x = Math.floor(r.cx + (rng() - .5) * (r.w - 4)), z = Math.floor(r.cz + (rng() - .5) * (r.h - 4)); if (!ledig(x, z) || F.roomId[z * W + x] !== r.id || naerDor(x, z) || !langtFra(x + .5, z + .5)) continue; kand.push({ x: x + .5, z: z + .5, rom: r.id }); break; }
      }
    }
    return kand.length ? kand[Math.floor(rng() * kand.length)] : null;
  },
  /* for testene: legg en bestemt hendelse i etasjen, uansett dybde og hva som er brukt */
  tving(id) {
    const H = HENDELSER[id], sted = H && this.finnSted(H.plass, Math.random); if (!sted) return null;
    const h = { id, H, x: sted.x, z: sted.z, sted, obj: [], data: {} }; H.lag(h); this.aktive.push(h); return h;
  },
  interact(consider) {
    const P = G.player; if (!P) return;
    for (const h of this.aktive) { if (h.brukt || h.ferdig) continue; const rid = h.sted.rom; if (rid !== undefined && G.rooms[rid] && !G.rooms[rid].cleared) continue; consider(Math.hypot(h.x - P.x, h.z - P.z) - .7, { t: h.H.prompt || 'Undersøk', fn: () => this.start(h) }); }
  },
  start(h) {
    const m = G.meta, H = m.hendelser || (m.hendelser = {}); H[h.id] = (H[h.id] || 0) + 1; saveMeta();
    Samtale.vis(h.H.samtale(h));
  },
  tick(dt) {
    if (!this.aktive.length || !G.player) return;
    for (const h of this.aktive) if (h.H.tick) try { h.H.tick(h, dt); } catch (e) { }
    // hjemmebrent: du spyr et spor av slim som fiendene sklir i
    const run = G.run, P = G.player;
    if (run && run.fyllT > 0) { run.fyllT -= dt; run.spyT = (run.spyT || 0) - dt; if (run.spyT <= 0) { run.spyT = 1.3; addPuddle(P.x, P.z, 'vomit', .85, 14); Sound.play('vomit', .5); } }
  },
  borte(h) { for (const o of h.obj) R.remove(o); h.obj = []; if (h.oye) Anim.fjern(h.oye); if (h.dukke) { h.dukke.dispose(); h.dukke = null; } h.ferdig = true; },
  fjern() {
    for (const h of this.aktive) { for (const o of h.obj) R.remove(o); if (h.oye) Anim.fjern(h.oye); if (h.dukke) h.dukke.dispose(); }
    this.aktive = [];
  }
};

/* kroker: ny etasje, rydding, sjefen svekket fra graven, spyttet fra hjemmebrent stopper ved ny etasje */
{ const _sf = startFloor; startFloor = function (depth, first) { _sf(depth, first); try { Hendelse.onFloor(); } catch (e) { console.warn('hendelser', e); } }; }
{ const _cf = clearFloor; clearFloor = function () { Hendelse.fjern(); G.ekstraDukker = []; if (G.run) G.run.fyllT = 0; _cf(); }; }
{ const _sb = spawnBoss; spawnBoss = function (depth, x, z) { const B = _sb(depth, x, z), sv = G.run && G.run.sjefSvekk && G.run.sjefSvekk[depth]; if (B && sv) { B.hp *= 1 - sv; FX.bubble(B, 'Hvem skrev navnet mitt på den steinen?', 1.8, 'boss'); } return B; }; }
