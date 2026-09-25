/* ============================================================
   SJEFER  -  Overarkivar Gunhild Paragraf (Isolat og arkiv) og signaturangrep
   for alle fire sjefer. bossAttack i 20_actors.js sender alt som står i
   BOSS_MOVES hit. Forsinkelser går gjennom sjefens egen kø (B.q), så de følger
   pause og tidsfall.
   ============================================================ */
function bossDmg(B) { return 13 + (typeof dybdeStyrke === 'function' ? dybdeStyrke(B.depth) : B.depth) * 3.5; }
function bossLater(B, t, fn) { B.q.push({ t, fn: () => { if (B.alive && G.state !== 'dead') fn(); } }); }

/* ---------- tegning: Overarkivaren ---------- */
RIG.arkivar = { hip: .5, hipW: .14, neck: 1.0, shW: .3, shY: .9, armW: .13, legW: .12, handR: .09, arm: '#2e2a36', leg: '#1e1a24', hand: '#e8d0b8', shoe: 'stovel', scale: 1.45, headLag: .7 };
BOSS_ART.arkivar = {
  head: g => {
    const S = '#ecd4b8', H = '#9a9aa4', cy = -.5;
    A.cel(g, A.blob([[-.2, cy - .42], [0, cy - .52], [.24, cy - .42], [.34, cy - .1], [.26, cy + .3], [0, cy + .44], [-.26, cy + .3], [-.34, cy - .1]]), H, { sk: .75 });
    A.cel(g, A.ell(0, cy + .02, .28, .38), S);
    A.cel(g, A.blob([[-.3, cy - .12], [-.28, cy - .36], [0, cy - .44], [.28, cy - .36], [.3, cy - .12], [.14, cy - .3], [-.14, cy - .3]]), H, { sk: .75 });
    A.cel(g, A.ell(0, cy - .6, .17, .14), H, { sk: .72 }); A.line(g, [[-.28, cy - .52], [.3, cy - .7]], .035, '#d4b048'); A.dot(g, .3, cy - .7, .03, '#b3261e');
    for (const s of [-1, 1]) { A.flat(g, A.ell(s * .12, cy - .02, .09, .08), 'rgba(230,245,255,.55)', .03); A.dot(g, s * .12, cy - .01, .03); A.line(g, [[s * .22, cy - .14], [s * .04, cy - .1]], .04); }
    A.line(g, [[-.03, cy - .02], [.03, cy - .02]], .025); A.line(g, [[.2, cy - .02], [.34, cy + .1]], .012, '#d4b048');
    A.line(g, [[0, cy + .02], [.05, cy + .14], [0, cy + .16]], .03);
    A.line(g, [[-.09, cy + .26], [.09, cy + .25]], .035); A.line(g, [[-.07, cy + .29], [.07, cy + .29]], .015, '#8a5a4a');
    A.cel(g, A.rr(.26, cy - .12, .05, .3, .02), '#3a3a44', { lw: .02, hi: false });
  },
  body: g => {
    const top = -1.0, D = '#2e2a36';
    A.cel(g, A.blob([[-.6, 0], [.6, 0], [.46, top + .5], [.34, top + .06], [0, top], [-.34, top + .06], [-.46, top + .5]]), D, { sk: .75 });
    // kartotekskuffer foran på kjolen
    A.cel(g, A.rr(-.3, top + .3, .6, .56, .03), '#8a5a34', { line: '#2a1408', lw: .04 });
    for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) { const x = -.27 + c * .28, y = top + .33 + r * .18; A.cel(g, A.rr(x, y, .26, .15, .02), '#a8743e', { line: '#2a1408', lw: .025, hi: false }); A.flat(g, A.rr(x + .07, y + .03, .12, .04, .005), '#f6f0de', 0); A.dot(g, x + .13, y + .11, .02, '#d4b048'); }
    A.cel(g, A.blob([[-.2, top + .04], [0, top + .2], [.2, top + .04], [.14, top + .16], [0, top + .26], [-.14, top + .16]]), '#f4f0e6', { lw: .03 });
    A.line(g, [[-.4, top + .92], [.4, top + .92]], .05, '#1a1620');
    for (const [x, rr] of [[-.36, .2], [.4, -.15]]) { g.save(); g.translate(x, top + .96); g.rotate(rr); A.cel(g, A.rr(-.05, 0, .1, .16, .01), PAPER, { line: PAPERL, lw: .02, hi: false }); g.restore(); }
    A.flat(g, A.ell(.36, -.3, .1, .07), 'rgba(179,38,30,.6)', 0);
  }
};
WEAPON_ART.stempelboss = [.9, 1.4, .45, .1];
{ const _dw = drawWeapon; drawWeapon = id => id !== 'stempelboss' ? _dw(id) : g => {
  A.cel(g, A.ell(0, -1.2, .16, .13), '#8a5a34', { line: '#2a1408' });
  A.cel(g, A.rr(-.06, -1.1, .12, .5, .03), '#a8743e', { line: '#2a1408', lw: .035, hi: false });
  A.cel(g, A.rr(-.36, -.64, .72, .36, .04), '#6b4226', { line: '#2a1408' });
  A.cel(g, A.rr(-.38, -.3, .76, .16, .03), '#b3261e', { line: '#3a0a08', lw: .04 });
  A.flat(g, A.rr(-.26, -.54, .52, .16, .02), '#f6ead0', .02, '#2a1408'); A.line(g, [[-.18, -.46], [.18, -.46]], .03, '#b3261e');
}; }
function cagePart() {
  return Art.part('isolatvegg', 1.1, 1.5, .55, .05, g => {
    A.cel(g, A.rr(-.46, -1.3, .92, 1.3, .06), PADD, { line: PADDL, lw: .045 });
    for (let y = -1.2; y < -.1; y += .28) for (let x = -.32; x <= .32; x += .32) A.dot(g, x + (Math.round(y * 10) % 2 ? .16 : 0), y, .025, Col.dark(PADD, .6));
    A.line(g, [[-.46, -.66], [.46, -.66]], .025, Col.dark(PADD, .75));
  });
}
function stampFall(x, z) { const g = sprite(Art.part('stempelfall', 1.2, 1.4, .6, .05, CARD_ART_STAMP), x, z, { y: 3 }); addFx(g, .3, (ob, p) => ob.position.y = 3 * (1 - p * p)); }

/* ---------- isolatet: en midlertidig ring av polstrede vegger rundt pasienten ---------- */
function clearCage() { if (G.cageSprites) for (const s of G.cageSprites) R.remove(s); G.cageSprites = null; G.cage = null; }
function buildCage(cx, cz, rIn, rOut, t) {
  clearCage(); const F = G.F, set = new Set(), sprites = [];
  for (let z = Math.floor(cz - rOut - 1); z <= Math.ceil(cz + rOut + 1); z++) for (let x = Math.floor(cx - rOut - 1); x <= Math.ceil(cx + rOut + 1); x++) {
    const d = Math.hypot(x + .5 - cx, z + .5 - cz); if (d < rIn || d > rOut || solid(x, z)) continue;
    set.add(z * F.W + x); const s = propSprite(null, x + .5, z + .95, { P: cagePart() }); s.position.y = -1.4; R.dyn.add(s); sprites.push(s);
  }
  G.cage = set; G.cageSprites = sprites; G.cageT = t; G.cageT0 = t;
  Sound.play('door', .9, .8); R.shake(.3);
}
function updateCage(dt) {
  if (!G.cage) return; G.cageT -= dt;
  const up = Math.min(1, (G.cageT0 - G.cageT) / .25), down = Math.min(1, G.cageT / .3), y = -1.4 * (1 - Math.min(up, down));
  for (const s of G.cageSprites) s.position.y = y;
  if (G.cageT <= 0) { for (const s of G.cageSprites) puff(s.position.x, s.position.z, 1, .8, '#e6dcc2'); clearCage(); Sound.play('paper'); }
}

/* ---------- signaturangrepene ---------- */
const BOSS_MOVES = {
  /* Krok: kroken hekter pasienten og drar hen inn til et kutt */
  hookpull(B, dist, toP, dmg) {
    B.t = B.atkDur = 1.3; FX.bubble(B, pick(['Kom hit, pasient.', 'Til undersøkelse.', 'Nærmere, takk.']), 1.2, 'boss');
    addTele('rect', { x: B.x, z: B.z, a: toP, w: 1.0, len: 11 }, .8, o => {
      const P = G.player; beam(o.x, o.z, o.x + Math.sin(o.a) * o.len, o.z + Math.cos(o.a) * o.len, 0x6a6a70, .16, .4, .9); Sound.play('chain');
      if (!P.alive || !inShape({ shape: 'rect', o }, P.x, P.z, P.r)) return;
      if (hurt(P, dmg * .55, { type: 'boss', x: B.x, z: B.z }) <= 0) return;
      const a = Math.atan2(B.x - P.x, B.z - P.z), d = Math.hypot(B.x - P.x, B.z - P.z); P.kvx = Math.sin(a) * Math.min(15, d * 2.3); P.kvz = Math.cos(a) * Math.min(15, d * 2.3); P.stunT = Math.max(P.stunT, .35);
      numText(P.x, P.z, 'HEKTET', 'crit', 2.4);
      bossLater(B, .5, () => { const a2 = Math.atan2(P.x - B.x, P.z - B.z), o2 = { x: B.x, z: B.z, a: a2, r: 2.8, arc: 2.2 }; addTele('cone', o2, .42, () => { hitShape('cone', o2, dmg, { type: 'boss', x: B.x, z: B.z, kb: 9 }, 'enemy'); slashFx(B.x, B.z, o2.a, o2.r, o2.arc, true); Sound.play('swingHeavy', 1, .7); R.shake(.3); }, B); });
    }, B);
  },
  /* Krok: kjettingen svinges rundt ham */
  chainspin(B, dist, toP, dmg) {
    B.t = B.atkDur = 1.4; FX.bubble(B, 'Kjetting er et livssyn.', 1.2, 'boss');
    const spin = r => { const o = { x: B.x, z: B.z, r }; addTele('circle', o, .95, () => { o.x = B.x; o.z = B.z; hitShape('circle', o, dmg, { type: 'boss', x: B.x, z: B.z, kb: 10 }, 'enemy'); slashFx(B.x, B.z, 0, r, TAU - .01, true, 0xc8ccd0); Sound.play('chain'); Sound.play('swingHeavy', .8, .6); R.shake(.35); }, B); };
    spin(3.3); if (B.enraged) bossLater(B, .7, () => spin(4.3));
  },
  /* Rust: fyller rommet med vann og setter strøm på */
  flood(B, dist, toP, dmg) {
    B.t = B.atkDur = 2.1; FX.bubble(B, pick(['Tid for hydroterapi!', 'Strøm og vann. Klassisk behandling.', 'Hold pusten.']), 1.8, 'boss');
    const room = G.F.rooms[G.F.bossId], P = G.player, made = new Set();
    for (let i = 0; i < 6 + (B.enraged ? 2 : 0); i++) { const s = freeSpot(rnd(room.x + 1.5, room.x + room.w - 1.5), rnd(room.z + 1.5, room.z + room.h - 1.5), 2); const p = addPuddle(s.x, s.z, 'wet', rnd(1.1, 1.6), 9); if (p) made.add(p); }
    const pp = addPuddle(P.x + rnd(-.5, .5), P.z + rnd(-.5, .5), 'wet', 1.3, 9); if (pp) made.add(pp);
    Sound.play('splash'); for (const p of made) R.ripple(p.x, p.z);
    bossLater(B, .8, () => {
      FX.bubble(B, 'STRØM!', 1, 'boss');
      for (const p of made) addTele('circle', { x: p.x, z: p.z, r: p.r * .85, color: 0xffe25a }, .9, () => { p.elec = 2.2; Particles.spawn(p.x, .2, p.z, 8, 0xfff6a0, { speed: 4, up: 4, life: .3 }); }, B);
      bossLater(B, .9, () => { Sound.play('zap'); flashLight(B.x, B.z, 9, '#fff2a0', .3, 1.2); R.shake(.3); });
    });
  },
  /* Rust: høytrykksspyler som feier over rommet */
  jet(B, dist, toP, dmg) {
    B.t = B.atkDur = 1.7; const side = Math.random() < .5 ? -1 : 1; FX.bubble(B, 'Skyll. Gjenta.', 1.2, 'boss');
    for (let i = 0; i < 3; i++) bossLater(B, i * .3, () => {
      const a = Math.atan2(G.player.x - B.x, G.player.z - B.z) + (i - 1) * .5 * side, o = { x: B.x, z: B.z, a, w: 1.2, len: 9.5, color: 0x6ac2e0 };
      addTele('rect', o, .55, () => { hitShape('rect', o, dmg * .7, { type: 'boss', x: B.x, z: B.z, kb: 11 }, 'enemy'); beam(o.x, o.z, o.x + Math.sin(a) * o.len, o.z + Math.cos(a) * o.len, 0x9fd8f0, .5, .3, .7); for (let k = 2.5; k < o.len; k += 2.5) addPuddle(o.x + Math.sin(a) * k, o.z + Math.cos(a) * k, 'wet', .8, 8); Sound.play('splash', 1, 1.3); }, B);
    });
  },
  /* Arkivaren: stempler regner ned rundt pasienten */
  stamprain(B, dist, toP, dmg, at) {
    B.t = B.atkDur = 1.5; FX.bubble(B, pick(['AVSLÅTT.', 'Feil skjema.', 'Stemplet og arkivert.']), 1.2, 'boss');
    const P = G.player, cx = at ? at.x : P.x, cz = at ? at.z : P.z, rad = at ? at.r : 4.2, n = at ? 5 : 6 + (B.enraged ? 2 : 0);
    for (let i = 0; i < n; i++) bossLater(B, i * .13, () => {
      let x = cx, z = cz; if (i) { const a = Math.random() * TAU, d = rnd(.8, rad); x += Math.sin(a) * d; z += Math.cos(a) * d; } else if (!at) { x = P.x; z = P.z; }
      if (solid(Math.floor(x), Math.floor(z))) return;
      const o = { x, z, r: at ? 1.0 : 1.25, color: 0xb3261e };
      addTele('circle', o, .85, () => {
        hitShape('circle', o, dmg * .75, { type: 'boss', x, z, stun: .5, kb: 3 }, 'enemy');
        const dec = propSprite(null, x, z, { P: stampDecal(), flat: true }); R.dyn.add(dec); addFx(dec, 6, (ob, p) => { ob.userData.U.uAlpha.value = p > .8 ? (1 - p) * 5 : 1; });
        FX.text(x, 1.6, z, 'AVSLÅTT', 'stamp', 1); Sound.play('stamp'); puff(x, z, 3, 1); R.shake(.18);
      }, B);
      bossLater(B, .55, () => stampFall(x, z));
    });
  },
  /* Arkivaren: en virvel av løse skjemaer */
  paperstorm(B, dist, toP, dmg) {
    const waves = 3 + (B.enraged ? 1 : 0); B.t = B.atkDur = .6 + waves * .45; FX.bubble(B, 'Alt skal arkiveres!', 1.4, 'boss');
    for (let w = 0; w < waves; w++) bossLater(B, .35 + w * .45, () => {
      for (let k = 0; k < 12; k++) { const a = k / 12 * TAU + w * .26; addProj({ type: 'page', from: 'enemy', x: B.x + Math.sin(a) * .9, z: B.z + Math.cos(a) * .9, vx: Math.sin(a) * 6.2, vz: Math.cos(a) * 6.2, dmg: dmg * .42, life: 2.4, r: .28, cause: 'boss', spin: 9 }); }
      Sound.play('paper', 1, .8); puff(B.x, B.z, 2, 1.2, '#f4ecd8');
    });
  },
  /* Arkivaren: pasienten settes i isolat, og stemplene følger etter */
  isolate(B, dist, toP, dmg) {
    B.t = B.atkDur = 1.6; const P = G.player, c = { x: P.x, z: P.z, r: 2.9, color: 0x9a7ac8 };
    FX.bubble(B, pick(['Til isolatet med deg.', 'Isolasjon. For din egen del.', 'Hysj.']), 1.6, 'boss');
    addTele('circle', c, .9, () => { buildCage(c.x, c.z, 2.2, 3.1, 4.2); bossLater(B, .5, () => BOSS_MOVES.stamprain(B, dist, toP, dmg, { x: c.x, z: c.z, r: 1.9 })); }, B);
  },
  /* Journalen: sider i en spiral */
  pages(B, dist, toP, dmg) {
    const n = 24 + (B.enraged ? 8 : 0), dir = Math.random() < .5 ? 1 : -1; B.t = B.atkDur = .4 + n * .085; FX.bubble(B, pick(['Les meg.', 'Kapittel én. Kapittel to.', 'Bla om.']), 1.4, 'boss');
    for (let i = 0; i < n; i++) bossLater(B, .3 + i * .085, () => {
      const a0 = i * .33 * dir;
      for (const a of [a0, a0 + Math.PI]) addProj({ type: 'page', from: 'enemy', x: B.x + Math.sin(a) * .9, z: B.z + Math.cos(a) * .9, vx: Math.sin(a) * 6, vz: Math.cos(a) * 6, dmg: dmg * .38, life: 2.3, r: .26, cause: 'boss', spin: 10 });
      if (i % 4 === 0) Sound.play('paper', .6, 1.2);
    });
  },
  /* Journalen: signer her, i blekk som blir liggende */
  ink(B, dist, toP, dmg) {
    B.t = B.atkDur = 2.1; FX.bubble(B, 'Signer her. Og her. Og her.', 1.8, 'boss');
    for (let i = 0; i < 4; i++) bossLater(B, i * .38, () => {
      const P = G.player, o = { x: P.x, z: P.z, r: 1.35, color: 0x6b2d8c };
      addTele('circle', o, .7, () => { hitShape('circle', o, dmg * .7, { type: 'boss', x: o.x, z: o.z, kb: 4 }, 'enemy'); addPuddle(o.x, o.z, 'morb', 1.3, 14); puff(o.x, o.z, 3, 1, '#4a1a5a'); Sound.play('morb', 1, .6); }, B);
    });
  },
  /* Journalen: blar tilbake og skriver om de gamle sjefenes kapitler */
  rewrite(B, dist, toP, dmg) {
    const k = pick(['hookpull', 'flood', 'stamprain', 'isolate', 'chainspin']);
    FX.bubble(B, pick(['Jeg blar tilbake.', 'Kjenner du igjen dette kapittelet?', 'Omskrevet.']), 1.4, 'boss');
    BOSS_MOVES[k](B, dist, toP, dmg);
  }
};
