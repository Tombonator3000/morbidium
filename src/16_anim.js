/* ============================================================
   ANIMASJON  -  2D-objekter som spilles av bilde for bilde, og positurer for dukkene.
   1) Spriteark: ett bilde med like store ruter (anim_<navn>.png i gpt-grafikk/), lest fra
      venstre mot høyre og ovenfra. Hver rute har samme festepunkt, så figuren står stille
      mens bildene skifter. ANIM_ARK (lagt inn av build.py fra manifestet) sier hvor mange
      ruter arket har. Mangler arket, tegner koden hver rute selv (tegn(g, i, n)).
   2) Avspilling: Anim.lag(navn, x, z, o) setter opp en plate som står (eller ligger flat) og
      spiller animasjonen. Den kan gå i løkke, stoppe på siste bilde eller forsvinne når den
      er ferdig. Anim.bilde(navn, i) gir én rute, for eksempel én av kjøttbitene.
   3) Positurer: nøkkelbilder for dukkenes hender, lening, hode og klem (POSER).
      Doll.update tar st.pose = { navn, p }, der p går fra 0 til 1.
   ============================================================ */
const ANIM = {
  /* Kasterens klump: snurrer i lufta */
  kasteklump: { n: 4, fps: 14, loop: true, w: .7, h: .7, ax: .35, ay: .35, tegn: (g, i) => {
    g.rotate(i * Math.PI / 2 + .2);
    A.cel(g, A.blob([[-.2, .1], [-.24, -.04], [-.12, -.18], [.04, -.2], [.2, -.12], [.23, .06], [.1, .19], [-.08, .2]]), '#6b4423', { line: '#2a1408', lw: .04, sk: .7 });
    A.line(g, [[-.13, -.02], [-.02, -.08], [.1, -.03]], .025, '#3a2210');
    A.flat(g, A.ell(-.07, -.1, .05, .03), 'rgba(255,230,190,.45)', 0);
    for (const [x, y] of [[.16, .1], [-.18, .12]]) A.dot(g, x, y, .025, '#4a2c14');
  } },
  /* Treffet: en brun sprut som reiser seg og faller */
  kastesprut: { n: 4, fps: 11, w: 1.8, h: 1.2, ax: .9, ay: .12, tegn: (g, i) => {
    const B = '#6b4423', L = '#2a1408', rng = mulberry32(71);
    const k = [.45, .85, 1, 1.05][i], opp = [.2, .55, .7, .3][i];
    A.cel(g, A.blob([[-.7 * k, 0], [-.5 * k, -.08], [-.2 * k, -.12], [.2 * k, -.11], [.55 * k, -.07], [.72 * k, 0], [.4 * k, .05], [-.4 * k, .05]]), B, { line: L, lw: .04, sk: .72 });
    for (let d = 0; d < 7; d++) {
      const a = -Math.PI / 2 + (rng() - .5) * 2.4, r = (.25 + rng() * .5) * k, y = -opp * (.5 + rng() * .8) + (i === 3 ? .25 : 0);
      if (i === 0 && d > 2) continue;
      A.cel(g, A.ell(Math.cos(a) * r, y, .06 + rng() * .05, .05 + rng() * .04), B, { line: L, lw: .03, hi: false });
    }
    if (i >= 1) A.flat(g, A.ell(-.1 * k, -.07, .18 * k, .03), 'rgba(255,230,190,.35)', 0);
  } },
  /* Blodsprut når noe dør: en sky av dråper som eksploderer ut og faller */
  /* tegnet lys og nøytral, så den kan farges etter blodet (rødt, lilla slim, gult puss) */
  blodsprut: { n: 6, fps: 22, w: 1.8, h: 1.6, ax: .9, ay: .1, noytral: true, tegn: (g, i, n) => {
    const rng = mulberry32(19), p = i / (n - 1), R0 = '#f2eaea', RL = '#4a3434';
    if (i < 2) A.cel(g, A.ell(0, -.7, .22 + i * .18, .2 + i * .16), R0, { line: RL, lw: .04, sk: .7 });
    for (let d = 0; d < 16; d++) {
      const a = rng() * TAU, sp = .3 + rng() * .6, r = sp * (.25 + p * .9), fall = p * p * .55;
      const x = Math.cos(a) * r, y = -.7 + Math.sin(a) * r * .8 + fall, s = (.045 + rng() * .06) * (1 - p * .45);
      if (y > -.02) continue;
      A.cel(g, A.ell(x, y, s * 1.2, s), rng() < .3 ? '#ffffff' : R0, { line: RL, lw: .025, hi: false });
    }
  } },
  /* Øye som åpner seg i veggen (Morbidium) */
  oye: { n: 5, fps: 9, w: 1.0, h: .7, ax: .5, ay: .35, tegn: (g, i) => {
    const aapen = [0, .18, .45, .8, 1][i], W = .36, Hh = .2 * aapen;
    A.line(g, [[-W - .06, .02], [-W * .5, -.03], [0, 0], [W * .6, -.04], [W + .06, .02]], .05, '#1a0c10');
    if (aapen > 0) {
      const lokk = g2 => { g2.beginPath(); g2.moveTo(-W, 0); g2.quadraticCurveTo(0, -Hh * 2, W, 0); g2.quadraticCurveTo(0, Hh * 2, -W, 0); g2.closePath(); };
      A.cel(g, lokk, '#f0e2d0', { line: '#3a0c14', lw: .04, sk: .82 });
      for (const [a, l] of [[.3, .2], [2.6, .22], [3.6, .17], [5.9, .2]]) A.line(g, [[Math.cos(a) * .06, Math.sin(a) * .03], [Math.cos(a) * l, Math.sin(a) * l * .45]], .012, '#c02a2a');
    }
    for (const s of [-1, 1]) A.line(g, [[s * (W + .02), 0], [s * (W + .14), s * .06 - .08]], .025, '#1a0c10');
  } },
  /* Kjøttbiter etter tunge drap. Hver rute er én bit, ikke en animasjon. */
  kjottbiter: { n: 6, fps: 0, w: .5, h: .5, ax: .25, ay: .25, tegn: (g, i) => {
    const K = '#b8484a', KL = '#3a0808', BN = '#efe4c4';
    if (i === 0) { A.cel(g, A.blob([[-.16, .06], [-.12, -.1], [.04, -.14], [.17, -.04], [.12, .1], [-.04, .13]]), K, { line: KL, lw: .035, sk: .7 }); A.line(g, [[-.06, -.04], [.06, .02]], .02, '#7a1818'); }
    else if (i === 1) { A.cel(g, A.rr(-.17, -.04, .34, .08, .04), BN, { line: '#4a3a24', lw: .03 }); for (const s of [-1, 1]) { A.cel(g, A.ell(s * .18, -.04, .05, .05), BN, { line: '#4a3a24', lw: .025, hi: false }); A.cel(g, A.ell(s * .18, .04, .05, .05), BN, { line: '#4a3a24', lw: .025, hi: false }); } }
    else if (i === 2) { A.cel(g, A.ell(0, 0, .12, .12), '#f4efe4', { line: '#3a1a1a', lw: .03 }); A.dot(g, .03, -.01, .055, '#3a6a9a'); A.dot(g, .03, -.01, .025); A.line(g, [[-.12, .03], [-.2, .1], [-.24, .06]], .03, '#a83232'); }
    else if (i === 3) { A.cel(g, A.blob([[-.07, .12], [-.08, -.02], [-.03, -.14], [.04, -.13], [.08, -.02], [.06, .12]]), '#f4dc7a', { line: '#5a4418', lw: .03 }); }
    else if (i === 4) { A.cel(g, A.blob([[-.2, .02], [-.16, -.08], [.06, -.1], [.2, -.04], [.18, .06], [-.02, .08]]), '#e0a090', { line: KL, lw: .03, sk: .75 }); A.cel(g, A.ell(.16, -.02, .05, .04), '#f0e8d8', { line: KL, lw: .02, hi: false }); }
    else { A.cel(g, A.blob([[-.15, .1], [-.18, -.04], [-.05, -.12], [.12, -.1], [.16, .04], [.04, .13]]), '#7a1c24', { line: '#2a0406', lw: .035, sk: .6 }); A.flat(g, A.ell(-.04, -.04, .05, .03), 'rgba(255,200,200,.4)', 0); }
  } }
};
/* nøkkelbilder for dukkene: hver linje er [tid, verdier ...]. hR og hL er hendene i forhold til skuldrene,
   lean og hode er vinkler, klem er sammenklemming av kroppen (positiv = lav og bred), hopp løfter hele dukken. */
const POSER = {
  kast: { hR: [[0, .12, -.36], [.45, -.24, .44], [.6, .06, .52], [.72, .44, .14], [1, .22, -.3]], hL: [[0, -.1, -.34], [.45, .2, -.06], [.72, -.16, -.3], [1, -.08, -.34]],
    lean: [[0, 0], [.45, -.7], [.62, .9], [1, 0]], hode: [[0, 0], [.45, -.14], [.65, .18], [1, 0]], klem: [[0, 0], [.4, .12], [.6, -.1], [.8, 0]] },
  brol: { hR: [[0, .06, -.38], [.25, .3, .32], [1, .32, .34]], hL: [[0, -.06, -.38], [.25, -.3, .32], [1, -.32, .34]], hode: [[0, 0], [.25, -.3], [1, -.3]], klem: [[0, 0], [.2, .18], [.4, -.12], [.6, 0]] },
  greip: { hR: [[0, .1, -.3], [.4, -.1, .1], [.55, .55, .02], [.8, .5, 0], [1, .15, -.3]], hL: [[0, -.1, -.3], [.55, .1, -.1], [1, -.1, -.3]], lean: [[0, 0], [.4, -.4], [.55, .7], [1, 0]] },
  sving: { hR: [[0, .2, .1], [.5, -.3, .2], [1, .2, .1]], hL: [[0, -.2, .1], [.5, .3, .2], [1, -.2, .1]], lean: [[0, -.4], [.5, .4], [1, -.4]] }
};
function posVerdi(spor, p) {
  if (!spor || !spor.length) return null;
  if (p <= spor[0][0]) return spor[0].slice(1);
  for (let i = 1; i < spor.length; i++) {
    const a = spor[i - 1], b = spor[i]; if (p > b[0]) continue;
    let k = (p - a[0]) / Math.max(1e-4, b[0] - a[0]); k = k * k * (3 - 2 * k);
    return a.slice(1).map((v, j) => v + (b[j + 1] - v) * k);
  }
  return spor[spor.length - 1].slice(1);
}
/* alle verdiene i en positur på tidspunkt p, eller null */
function posStat(pose) {
  const K = pose && POSER[pose.navn]; if (!K) return null;
  const p = clamp(pose.p || 0, 0, 1), o = {};
  for (const k of Object.keys(K)) o[k] = posVerdi(K[k], p);
  return o;
}
const Anim = {
  aktive: [], cache: {},
  /* rutene til en animasjon: fra spriteark når bildet finnes, ellers tegnet av koden */
  def(navn) {
    const D = ANIM[navn], ark = typeof ANIM_ARK === 'object' ? ANIM_ARK['anim_' + navn] : null, img = Art.img && Art.img['anim_' + navn];
    if (!D) return null;
    if (ark && img && img.complete && img.naturalWidth) return Object.assign({}, D, { w: ark.w, h: ark.h, ax: ark.ax, ay: ark.ay, n: ark.n || ark.ruter[0] * ark.ruter[1], fps: ark.fps ?? D.fps, ark, img });
    return D;
  },
  rammer(navn) {
    if (this.cache[navn]) return this.cache[navn];
    const D = this.def(navn); if (!D) return null;
    const out = [];
    if (D.img) {
      const [kol, rad] = D.ark.ruter, cw = D.img.naturalWidth / kol, ch = D.img.naturalHeight / rad;
      for (let i = 0; i < D.n; i++) {
        const c = document.createElement('canvas'); c.width = Math.ceil(D.w * PX); c.height = Math.ceil(D.h * PX);
        const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(D.img, (i % kol) * cw, Math.floor(i / kol) * ch, cw, ch, 0, 0, c.width, c.height);
        const P = { key: 'animr_' + navn + '_' + i, w: D.w, h: D.h, ax: D.ax, ay: D.ay, canvas: c, tex: new THREE.CanvasTexture(c) }; P.tex.anisotropy = 4; out.push(P);
      }
    } else for (let i = 0; i < D.n; i++) out.push(Art.part('animr_' + navn + '_' + i, D.w, D.h, D.ax, D.ay, g => D.tegn(g, i, D.n)));
    return (this.cache[navn] = out);
  },
  bilde(navn, i) { const R0 = this.rammer(navn); return R0 ? R0[((i % R0.length) + R0.length) % R0.length] : null; },
  fps(navn) { const D = this.def(navn); return D ? D.fps : 10; },
  /* o: flat, y, s (skala), flip, fps, loop, hold (bli stående på siste bilde), fart, tint, parent, onEnd, start (første bilde) */
  lag(navn, x, z, o = {}) {
    const R0 = this.rammer(navn); if (!R0) return null;
    const D = ANIM[navn], U = makeU({ tint: o.tint }), i0 = o.start || 0, m = partMesh(R0[i0 % R0.length], U), s = o.s || 1;
    let g;
    if (o.flat) { m.rotation.x = -Math.PI / 2; m.rotation.z = o.rot || 0; m.position.set(x, o.y ?? .02, z); m.scale.set(s, s / Math.sin(CAM_PITCH), 1); m.material.depthWrite = false; m.renderOrder = o.ro || 2; g = m; }
    else { g = new THREE.Group(); m.scale.set((o.flip ? -1 : 1) * s, BILL_Y * s, 1); if (o.rot) m.rotation.z = o.rot; g.add(m); g.position.set(x, o.y || 0, z); if (o.depthWrite === false) m.material.depthWrite = false; }
    (o.parent || R.dyn).add(g);
    const h = { navn, g, m, U, rammer: R0, t: i0 / Math.max(1, o.fps || this.fps(navn)), i: i0, fps: o.fps ?? this.fps(navn), loop: o.loop ?? !!D.loop, hold: !!o.hold, fart: o.fart || 1, done: false, onEnd: o.onEnd };
    // i 3D lyses platen av lampene rundt, som alt annet som er tegnet (lys: false for ting som gløder selv)
    if (o.lys !== false && typeof D3 === 'object' && D3.on) { h.tint0 = U.uTint.value.clone(); h.folgLys = !!o.folgLys; U.uTint.value.multiply(D3.lysVed(x, z, (o.y || 0) + .5)); }
    this.aktive.push(h); return h;
  },
  tick(dt) {
    for (let k = this.aktive.length - 1; k >= 0; k--) {
      const h = this.aktive[k];
      if (h.dead || !h.g.parent) { if (h.g.parent) R.remove(h.g); this.aktive.splice(k, 1); continue; }
      if (!h.fps) continue;
      h.t += dt * h.fart; let i = Math.floor(h.t * h.fps); const n = h.rammer.length;
      // baklengs (fart under null) ender på første bilde, forlengs på det siste
      if (i >= n || i < 0) {
        if (h.loop) i = ((i % n) + n) % n;
        else { i = i < 0 ? 0 : n - 1; if (!h.done) { h.done = true; if (h.onEnd) h.onEnd(h); if (!h.hold) { R.remove(h.g); this.aktive.splice(k, 1); continue; } } }
      }
      if (i !== h.i) { h.i = i; setPart(h.m, h.rammer[i]); }
      if (h.folgLys && D3.on) { const p = h.g.position; h.U.uTint.value.copy(h.tint0).multiply(D3.lysVed(p.x, p.z, p.y + .3)); }
    }
  },
  fjern(h) { if (!h) return; h.dead = true; R.remove(h.g); },
  clear() { for (const h of this.aktive) R.remove(h.g); this.aktive = []; }
};
