/* ============================================================
   UTSTYR  -  aktive apparater og lommerusk, som i Isaac
   Apparater: én plass, lades ett streik per ryddet rom (sjefen gir to), brukes
   med V, D-pad opp eller Aktiv-knappen. Et nytt apparat bytter ut det gamle,
   som blir stående igjen i et glass.
   Lommerusk: én plass, små varige virkninger. Plukkes fra gulvet og byttes.
   ============================================================ */
const AKTIVE = {
  defib: { name: 'Bærbar defibrillator', desc: 'Et elektrisk støt rundt deg. Alle i nærheten tar skade og blir stående. Pytter får strøm.', max: 3, ico: [['r', -.3, -.2, .6, .44, '#c8322a'], ['r', -.22, -.12, .44, .12, '#f4f0e6'], ['p', [[.02, -.1], [-.08, .06], [.02, .06], [-.04, .2], [.1, .02], [0, .02]], '#ffd23a'], ['l', [[-.3, .24], [-.42, .36]], .05, '#2a2a2a'], ['l', [[.3, .24], [.42, .36]], .05, '#2a2a2a']] },
  bor: { name: 'Tannlegebor', desc: 'Du snurrer med boret i to sekunder. Alt rundt deg tar skade og mister tenner.', max: 2, ico: [['r', -.08, -.4, .16, .42, '#c8ccd0'], ['p', [[-.08, .02], [.08, .02], [0, .36]], '#e8e8ec'], ['r', -.14, -.46, .28, .14, '#6b4226']] },
  stempelpute: { name: 'Stempelpute', desc: 'AVSLÅTT på alle i rommet. De tar skade og står og venter i to sekunder.', max: 2, ico: [['r', -.32, -.06, .64, .3, '#3a3a44'], ['r', -.26, -.02, .52, .18, '#b3261e'], ['e', 0, -.24, .12, .1, '#8a5a34']] },
  adrenalin: { name: 'Adrenalinsprøyte', desc: 'Seks sekunder med fart og kraft, og et lite plaster på såret.', max: 2, ico: [['r', -.1, -.34, .2, .52, '#e4f2f6'], ['r', -.07, -.14, .14, .28, '#d8322a'], ['l', [[0, -.34], [0, -.48]], .04, '#8a8a8a'], ['l', [[-.18, .2], [.18, .2]], .06, '#8a8a8a']] },
  blodpose: { name: 'Blodpose', desc: 'Fyller på 40 prosent helse. Gruppe ukjent.', max: 4, ico: [['r', -.24, -.34, .48, .56, '#b3261e'], ['r', -.18, -.28, .36, .16, '#f4f0e6'], ['l', [[0, .22], [0, .42]], .05, '#c8ccd0']] },
  blits: { name: 'Kamera med magnesiumblits', desc: 'SI APPELSIN. Alle fiender du ser, blir blendet. Sjefer myser.', max: 3, ico: [['r', -.34, -.16, .68, .42, '#3a3a44'], ['e', 0, .04, .15, .15, '#9ad0e0'], ['r', -.3, -.32, .22, .14, '#e8e4dc'], ['p', [[.18, -.44], [.3, -.28], [.22, -.28], [.3, -.14], [.12, -.32], [.2, -.32]], '#ffe25a']] },
  stoppeklokke: { name: 'Forstanderens stoppeklokke', desc: 'Fiendene går i sakte film i fem sekunder. Du gjør ikke det.', max: 4, ico: [['e', 0, .04, .3, .3, '#e8c040'], ['e', 0, .04, .22, .22, '#f6f0de'], ['l', [[0, .04], [0, -.12]], .04, '#1a1a1a'], ['l', [[0, .04], [.12, .1]], .03, '#1a1a1a'], ['r', -.06, -.38, .12, .1, '#e8c040']] },
  duebur: { name: 'Duebur', desc: 'Slipper ut fire duer som kjemper for deg en stund.', max: 3, ico: [['r', -.3, -.3, .6, .56, '#c8a060'], ['l', [[-.18, -.3], [-.18, .26]], .03, '#6a4a20'], ['l', [[0, -.3], [0, .26]], .03, '#6a4a20'], ['l', [[.18, -.3], [.18, .26]], .03, '#6a4a20'], ['e', .02, .02, .12, .09, '#8a8f98']] },
  meisel: { name: 'Vaktmesterens meisel', desc: 'Tegner hele etasjen på kartet, med det hemmelige rommet, og knuser sprekker i nærheten.', max: 2, ico: [['r', -.05, -.42, .1, .5, '#c8ccd0'], ['p', [[-.05, .08], [.05, .08], [0, .2]], '#e8e8ec'], ['r', -.1, -.46, .2, .16, '#6b4226']] },
  grammofon: { name: 'Grammofon med vuggevise', desc: 'Alle i nærheten sovner. Musikken er ikke god.', max: 3, ico: [['r', -.3, .04, .6, .3, '#6b4226'], ['e', -.04, .02, .24, .06, '#1a1a1a'], ['p', [[.06, -.02], [.36, -.42], [.42, -.3], [.12, 0]], '#d4b048']] }
};
const LOMMERUSK = {
  hestesko: { name: 'Hestesko', desc: 'Flere kritiske treff.', ico: [['l', [[-.24, .28], [-.28, -.06], [0, -.3], [.28, -.06], [.24, .28]], .12, '#9aa0a6']] },
  tannspeil: { name: 'Tannlegespeil', desc: 'Tenner og hjerter trekkes til deg fra dobbelt så langt unna.', ico: [['l', [[-.28, .3], [.08, -.06]], .05, '#9aa0a6'], ['e', .16, -.14, .14, .14, '#b8d8e8']] },
  knappenal: { name: 'Knappenål i fôret', desc: '10 prosent mer skade når du har full helse.', ico: [['l', [[-.2, .26], [.18, -.2]], .04, '#c8ccd0'], ['e', .2, -.22, .07, .07, '#c8322a']] },
  lanekort: { name: 'Lånekort med stempel', desc: 'Alt koster 15 prosent mindre. Ingen sjekker datoen.', ico: [['r', -.3, -.2, .6, .4, '#f4ecd8'], ['l', [[-.2, -.08], [.14, -.08]], .03, '#6a5a4a'], ['e', .14, .08, .08, .06, '#b3261e']] },
  batteri: { name: 'Lekkende batteri', desc: 'Apparatet ditt lades dobbelt så fort.', ico: [['r', -.16, -.3, .32, .56, '#3a6ac8'], ['r', -.06, -.38, .12, .08, '#c8ccd0'], ['p', [[.02, -.16], [-.08, .02], [.02, .02], [-.04, .16], [.1, -.02], [0, -.02]], '#ffd23a']] },
  kaninpote: { name: 'Kaninpote fra tøffelen', desc: 'Rullingen lades 25 prosent raskere. Tøffelen savner den.', ico: [['e', 0, .04, .18, .26, '#f2a8c8'], ['e', -.08, -.18, .06, .06, '#f8d0e0'], ['e', .08, -.18, .06, .06, '#f8d0e0']] },
  morfin: { name: 'Morfindråpe', desc: 'Tre helse hver gang et rom er ryddet.', ico: [['p', [[0, -.34], [.18, .02], [.14, .2], [-.14, .2], [-.18, .02]], '#9ad0e0'], ['e', -.04, .04, .05, .04, '#ffffff']] },
  monokkel: { name: 'Sprukket monokkel', desc: 'Du ser straks hvor den sprukne veggen er i hver etasje.', ico: [['e', 0, 0, .24, .24, '#e8f4f8'], ['l', [[-.1, -.12], [.04, .04], [-.04, .14]], .02, '#1a1a1a'], ['l', [[.24, 0], [.36, .34]], .02, '#d4b048']] },
  skalpell: { name: 'Rusten skalpell', desc: 'Slag gir ofte blødning. Stivkrampevaksinen er utgått.', ico: [['r', -.3, -.04, .42, .1, '#a8743a'], ['p', [[.12, -.04], [.36, 0], [.12, .06]], '#c8ccd0']] },
  frosk: { name: 'Tørket frosk', desc: 'Én gang per etasje tar frosken et dødelig slag for deg.', ico: [['e', 0, .06, .26, .18, '#8aa84a'], ['e', -.12, -.1, .07, .07, '#c8d060'], ['e', .12, -.1, .07, .07, '#c8d060'], ['d', -.12, -.1, .03, '#1a1a1a'], ['d', .12, -.1, .03, '#1a1a1a']] },
  kolapp: { name: 'Kølapp nummer 1', desc: 'Første treff på hver fiende gjør 50 prosent mer skade. Du var først.', ico: [['r', -.24, -.28, .48, .56, '#f4ecd8'], ['l', [[-.04, -.12], [.04, -.16], [.04, .16]], .05, '#1a1a1a']] },
  pastill: { name: 'Halspastill', desc: 'Morbidium stiger 30 prosent saktere. Smaker mint og angst.', ico: [['e', 0, 0, .24, .2, '#e8f0c0'], ['e', -.06, -.06, .08, .05, '#ffffff']] }
};
function icoPart(key, ico) {
  return Art.part(key, 1, 1, .5, .5, g => {
    for (const o of ico || []) {
      const t = o[0];
      if (t === 'e') A.cel(g, A.ell(o[1], o[2], o[3], o[4]), o[5], { lw: .045 });
      else if (t === 'r') A.cel(g, A.rr(o[1], o[2], o[3], o[4], Math.min(o[3], o[4]) * .25), o[5], { lw: .045 });
      else if (t === 'p') A.cel(g, A.blob(o[1]), o[2], { lw: .045 });
      else if (t === 'l') { A.line(g, o[1], o[2] + .05, INK); A.line(g, o[1], o[2], o[3]); }
      else if (t === 'd') A.dot(g, o[1], o[2], o[3], o[4]);
    }
  });
}
function aktIcon(id) { return icoPart('akt_' + id, (AKTIVE[id] || {}).ico); }
function lommeIcon(id) { return icoPart('lomme_' + id, (LOMMERUSK[id] || {}).ico); }
function aktJarPart(id) {
  const img = Art.img && Art.img.glass_tomt;
  return Art.part('glassakt_' + id, 1, 1.5, .5, .05, g => {
    A.flat(g, A.rr(-.31, -.98, .62, .74, .1), 'rgba(170,190,230,.34)', 0);
    g.save(); g.translate(0, -.62); g.scale(.56, .56); g.drawImage(aktIcon(id).canvas, -.5, -.5, 1, 1); g.restore();
    if (img && img.complete && img.naturalWidth) g.drawImage(img, -.5, -1.45, 1, 1.5);
    else { A.flat(g, A.rr(-.32, -1.2, .64, 1.02, .12), 'rgba(170,220,190,.25)', .045, '#2f4a3a'); A.cel(g, A.rr(-.38, -.18, .76, .18, .04), '#5a4a3a', { line: '#2a1a10' }); }
  });
}
function lommePart(id) { return Art.part('lommeplukk_' + id, .6, .6, .3, .1, g => { g.save(); g.translate(0, -.26); g.scale(.5, .5); g.drawImage(lommeIcon(id).canvas, -.5, -.5, 1, 1); g.restore(); }); }

const Lomme = {
  has(id) { return !!(G.run && G.run.trinket === id); },
  give(id) {
    const P = G.player, old = G.run.trinket;
    if (old) dropPickup(P.x, P.z, 'trinket', old);
    G.run.trinket = id; toast(LOMMERUSK[id].name, LOMMERUSK[id].desc); Sound.play('pickup'); Items.itemsKey = '';
    if (id === 'monokkel') this.onFloor();
  },
  pick() { const c = Object.keys(LOMMERUSK).filter(k => k !== (G.run && G.run.trinket)); return pick(c); },
  onFloor() {
    if (G.run) G.run.froskBrukt = false;
    if (this.has('monokkel') && G.F) for (const i of G.F.crack || []) { const x = i % G.F.W, z = (i / G.F.W) | 0; for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) { const j = (z + dz) * G.F.W + x + dx; if (j >= 0 && j < G.seen.length) G.seen[j] = 1; } }
  },
  onRoomClear() { if (this.has('morfin')) healPlayer(3); },
  /* kalles fra hurtPlayer når slaget ville drept */
  saveFromDeath() {
    const P = G.player; if (!this.has('frosk') || G.run.froskBrukt) return false;
    G.run.froskBrukt = true; P.hp = 1; P.invuln = 1.2; stampBig('FROSKEN', 'tok støyten'); Sound.play('coo', 1, .5); puff(P.x, P.z, 4, 1, '#8aa84a'); return true;
  }
};

const Aktiv = {
  get() { return G.run && G.run.akt; },
  give(id, charge) {
    const P = G.player, old = this.get();
    if (old) this.spawnJar(P.x + .8, P.z, old.id, old.charge);
    const A0 = AKTIVE[id]; G.run.akt = { id, charge: charge ?? A0.max, max: A0.max };
    toast(A0.name, A0.desc); Sound.play('level'); Sound.play('pickup'); this.key = '';
    Items.liftT = 1.1; if (Items.liftG) R.remove(Items.liftG); Items.liftG = sprite(aktIcon(id), P.x, P.z, {}); Items.liftG.scale.setScalar(.8);
  },
  spawnJar(x, z, id, charge, price) { const pd = Items.spawnPedestal(x, z, null, price); pd.akt = id; pd.charge = charge ?? AKTIVE[id].max; R.remove(pd.g); pd.g = propSprite(null, pd.x, pd.z, { P: aktJarPart(id) }); R.level.add(pd.g); return pd; },
  pick() { const c = Object.keys(AKTIVE).filter(k => !(this.get() && this.get().id === k) && !Items.pedestals.some(p => p.akt === k && !p.taken)); return pick(c.length ? c : Object.keys(AKTIVE)); },
  onRoomClear(r) { const a = this.get(); if (!a || a.charge >= a.max) return; a.charge = Math.min(a.max, a.charge + (r && r.role === 'boss' ? 2 : 1) * (Lomme.has('batteri') ? 2 : 1)); if (a.charge >= a.max) { Sound.play('spark', .8); toast(AKTIVE[a.id].name, 'Ladet og klar (V)'); } },
  use() {
    const a = this.get(), P = G.player; if (!a) return;
    if (a.charge < a.max) { Sound.play('deny', .6); numText(P.x, P.z, 'Ikke ladet', 'info', 2.2); return; }
    a.charge = 0; P.counters.ability++; (this.fx[a.id] || (() => { }))(P);
  },
  fx: {
    defib(P) {
      Sound.play('zap'); Sound.play('slam', .7, 1.4); flashLight(P.x, P.z, 6, '#fff6a0', .4, 1.8); R.shake(.5); if (R.fx) R.fx.flash = .5;
      slashFx(P.x, P.z, 0, 4, TAU - .01, true, 0xfff6a0); Particles.spawn(P.x, .8, P.z, 30, 0xfff6a0, { speed: 8, up: 4, life: .4 });
      hitShape('circle', { x: P.x, z: P.z, r: 4 }, 40, { from: 'player', x: P.x, z: P.z, kb: 8, stun: 1.5 }, 'player');
      for (const p of G.puddles) if (CONDUCTIVE[p.kind] && d2(p.x, p.z, P.x, P.z) < 49) p.elec = 3;
    },
    bor(P) { P.drillT = 2; Sound.play('zap', .6, 2.4); FX.bubble(P, pick(['Gap opp.', 'Dette kjenner du bare litt.']), 1.4); },
    stempelpute(P) {
      const r = roomAt(P.x, P.z), all = G.boss && G.boss.alive ? G.enemies.concat([G.boss]) : G.enemies; let n = 0;
      for (const e of all) if (e.alive && (roomAt(e.x, e.z) === r || d2(e.x, e.z, P.x, P.z) < 100)) { const x = e.x, z = e.z; setTimeout(() => { if (!e.alive) return; hurt(e, 20, { from: 'player', x, z, stun: 2 }); FX.text(x, 1.6, z, 'AVSLÅTT', 'stamp', 1); stampFall(x, z); }, n++ * 120); }
      Sound.play('stamp'); R.shake(.3);
    },
    adrenalin(P) { P.adrenT = 6; P.invuln = 1; healPlayer(10); Sound.play('level'); FX.bubble(P, pick(['HJERTET MITT!', 'Jeg ser lyder.']), 1.4); },
    blodpose(P) { healPlayer(Math.round(P.maxHp * .4)); P.counters.heal++; Sound.play('glass'); FX.bubble(P, 'Smaker jern.', 1.2); },
    blits(P) {
      Sound.play('spark'); Sound.play('stamp', .6, 2); if (R.fx) R.fx.flash = 1; flashLight(P.x, P.z, 12, '#ffffff', .4, 2);
      for (const e of G.enemies) if (e.alive && d2(e.x, e.z, P.x, P.z) < 196) { e.stun = Math.max(e.stun || 0, 2.5); cancelTeles(e); numText(e.x, e.z, 'BLENDET', 'info', 2.4); }
      if (G.boss && G.boss.alive) G.boss.slowT = 3; FX.bubble(P, 'SI APPELSIN!', 1.2);
    },
    stoppeklokke(P) { G.slowEnemies = 5; Sound.play('pa', .8, .5); FX.bubble(P, 'Tikk. Takk.', 1.2); },
    duebur(P) { for (let k = 0; k < 4; k++) spawnAlly('due', P.x + rnd(-.8, .8), P.z + rnd(-.8, .8), { hp: 25, dmg: 6 * abilityPower(), life: 14 }); Sound.play('coo'); },
    meisel(P) {
      G.seen.fill(1); let best = null, bd = 64; for (const c of Spesial.cracks) if (!c.broken && d2(c.x, c.z, P.x, P.z) < bd) { bd = d2(c.x, c.z, P.x, P.z); best = c; }
      if (best) Spesial.damage(best, 9); toast('Plantegningen', 'Olsen tegnet alt, også det han ikke skulle'); Sound.play('paper');
    },
    grammofon(P) {
      Sound.mumble(10, 260); FX.bubble(P, pick(['♪ Ro, ro til fiskeskjær ♪', '♪ Byssan lull ♪']), 2.2);
      for (const e of G.enemies) if (e.alive && d2(e.x, e.z, P.x, P.z) < 81) { e.sleep = 3.5; cancelTeles(e); numText(e.x, e.z, 'zzz', 'info', 2.4); }
      if (G.boss && G.boss.alive && d2(G.boss.x, G.boss.z, P.x, P.z) < 81) G.boss.slowT = 3;
    }
  },
  /* per bilde: boret og adrenalinet */
  update(dt) {
    const P = G.player; if (!P || !P.alive) return;
    if (P.adrenT > 0) P.adrenT -= dt;
    if (P.drillT > 0) {
      P.drillT -= dt; P.drillHit = (P.drillHit || 0) - dt;
      if (Math.random() < dt * 20) Particles.spawn(P.x, .9, P.z, 2, 0xe8e8ec, { speed: 5, up: 2, life: .3 });
      if (P.drillHit <= 0) { P.drillHit = .2; slashFx(P.x, P.z, G.time * 9, 2.3, 2.2, false, 0xe8e8ec); for (const e of hitShape('circle', { x: P.x, z: P.z, r: 2.3 }, 7, { from: 'player', x: P.x, z: P.z, kb: 2 }, 'player')) if (Math.random() < .35) dropTeeth(e.x, e.z, 1); Sound.play('spark', .4, .6); }
    }
    if (G.slowEnemies > 0) G.slowEnemies -= dt;
  }
};
