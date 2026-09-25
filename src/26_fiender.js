/* ============================================================
   NYE FIENDER  -  pasient i tvangstrøye, byråkrat, narkoselege, arkivrotter
   (kommer i flokk) og øyeblomst. Tegnet i kode, med egen oppførsel via
   Grotesk-registeret i 25_items.js.
   ============================================================ */
Object.assign(ENEMIES, {
  tvang: { name: 'Pasient i tvangstrøye', hp: 34, speed: 2.7, r: .42, dmg: 12, xp: 11, teeth: [1, 3], bubbleH: 2.2 },
  byrakrat: { name: 'Byråkrat', hp: 30, speed: 2.3, r: .42, dmg: 9, xp: 11, teeth: [2, 4], weapon: 'skjemabunke', bubbleH: 3.1 },
  narkose: { name: 'Narkoselege', hp: 38, speed: 2.0, r: .44, dmg: 8, xp: 12, teeth: [1, 3], weapon: 'gasskolbe', bubbleH: 3.1 },
  rotte: { name: 'Arkivrotte', hp: 9, speed: 5.0, r: .28, dmg: 5, xp: 3, teeth: [0, 1], bubbleH: 1.1, pack: 2 },
  oyeblomst: { name: 'Øyeblomst', hp: 52, speed: 0, r: .5, dmg: 10, xp: 14, teeth: [2, 4], morb: 2, bubbleH: 2.6, blood: 0x6b2d8c, rooted: true }
});
Object.assign(LINES, {
  tvang: ['Jeg er ikke gal! Jeg er bare bundet!', 'Klø meg på nesa!', 'HEHEHE', 'Armene mine er på ferie.', 'Se, ingen hender!'],
  byrakrat: ['Har du tatt kølapp?', 'Feil luke.', 'Dette må du søke om.', 'Skjemaet er utgått. Som deg, snart.', 'Kom tilbake i morgen. Eller aldri.'],
  narkose: ['Pust dypt.', 'Tell baklengs fra hundre.', 'Du blir bare litt trøtt.', 'Ssssss.', 'Dette kjenner du ikke. Lenge.'],
  rotte: ['*knask*', 'pip', '*gnager på skjema 4-B*'],
  oyeblomst: ['...', '*blunk*', '*stirrer*', '*vanner seg selv*']
});
Object.assign(DEATH_CAUSES, {
  tvang: ['Stanget i hjel av en mann uten armer.', 'Rullet over av en tvangstrøye.'],
  byrakrat: ['Avslått i første instans. Og andre.', 'Døde i kø.', 'Druknet i papirarbeid.'],
  narkose: ['Sovnet og glemte å våkne.', 'Talte baklengs til null.'],
  rotte: ['Spist av arkivrotter. De begynte med skjemaene.', 'Gnagd i hjel, litt om gangen.'],
  oyeblomst: ['Stirret ned av en blomst.', 'Så inn i øyet for lenge.']
});
DEPTH_ENEMIES[1].push('tvang');
DEPTH_ENEMIES[2].push('tvang');
DEPTH_ENEMIES[3].push('narkose', 'tvang');
DEPTH_ENEMIES[4].push('tvang', 'tvang', 'byrakrat', 'byrakrat', 'rotte', 'narkose');
DEPTH_ENEMIES[5].push('oyeblomst', 'oyeblomst', 'rotte', 'rotte');
DEPTH_ENEMIES[6].push('oyeblomst', 'oyeblomst', 'rotte', 'narkose', 'byrakrat');
BOSSES[4].minion = 'byrakrat';

/* ---------- tegninger ---------- */
const JAKKE = '#efe8d4', JAKKEL = '#4a4234';
Object.assign(RIG, {
  tvang: { blob: true, scale: .82, tentacles: 2, tentW: .11, tentCol: '#4a4a52', tentLen: .2, tentSpread: .24, tentWave: .04, pulse: 5 },
  rotte: { blob: true, scale: .62, tentacles: 4, tentW: .06, tentCol: '#6a6470', tentLen: .07, tentSpread: .46, tentWave: .06, pulse: 12 },
  oyeblomst: { blob: true, scale: .95, tentacles: 6, tentW: .07, tentCol: '#3a1a4a', tentLen: .12, tentSpread: .9, tentWave: .12, pulse: 2 },
  byrakrat: { hip: .5, hipW: .12, neck: .74, shW: .26, shY: .66, armW: .13, legW: .12, handR: .08, arm: '#f4f2ea', leg: '#2a2a30', hand: '#e8c8a8', shoe: 'stovel', scale: .8, headLag: 1.1 },
  narkose: { hip: .48, hipW: .14, neck: .74, shW: .28, shY: .66, armW: .14, legW: .13, handR: .09, arm: '#7fb89a', leg: '#6aa088', hand: '#f0e8d8', shoe: 'hvit', scale: .82, headLag: .9 }
});
Object.assign(BLOBS, {
  tvang: [1.1, 1.5, .55, .1, v => g => {
    const S = '#f0d0b0';
    // trøya med kryssede ermer og stropper
    A.cel(g, A.blob([[-.36, -.12], [.36, -.12], [.4, -.6], [.3, -.86], [-.3, -.86], [-.4, -.6]]), JAKKE, { line: JAKKEL, sk: .84 });
    if (v !== 'b') { A.cel(g, A.blob([[-.4, -.66], [.34, -.4], [.36, -.3], [-.38, -.54]]), '#e6dcc2', { line: JAKKEL, lw: .035 }); A.cel(g, A.blob([[.4, -.66], [-.34, -.4], [-.36, -.3], [.38, -.54]]), '#e6dcc2', { line: JAKKEL, lw: .035 }); }
    for (const y of [-.72, -.22]) { A.line(g, [[-.36, y], [.36, y]], .05, '#8a6a4a'); A.cel(g, A.rr(-.05, y - .04, .1, .08, .01), '#c8ccd0', { lw: .02, hi: false }); }
    if (v === 'b') { for (const x of [-.12, .12]) A.line(g, [[x, -.84], [x, -.16]], .04, '#8a6a4a'); }
    // hodet
    const cy = -1.12;
    A.cel(g, A.ell(0, cy, .3, .28), v === 'b' ? '#6a4a30' : S);
    A.cel(g, A.blob([[-.32, cy - .02], [-.36, cy - .24], [-.14, cy - .36], [.1, cy - .38], [.34, cy - .24], [.3, cy - .04], [.18, cy - .2], [-.2, cy - .2]]), '#6a4a30', { sk: .7 });
    for (const [x, y, dx] of [[-.16, cy - .36, -.06], [.02, cy - .4, .02], [.18, cy - .35, .08]]) A.line(g, [[x, y + .08], [x + dx, y - .06]], .04, '#6a4a30');
    if (v === 'b') return;
    const ex = v === 's' ? [.14] : [-.12, .12];
    for (const x of ex) { A.flat(g, A.ell(x, cy - .02, .09, .1), '#fbf6ea', .03); A.dot(g, x + .02, cy, .035); }
    g.beginPath(); g.moveTo(-.14 + (v === 's' ? .12 : 0), cy + .13); g.quadraticCurveTo(0 + (v === 's' ? .12 : 0), cy + .24, .16 + (v === 's' ? .1 : 0), cy + .12); g.fillStyle = '#7a1a1a'; g.fill(); A.line(g, [[-.14 + (v === 's' ? .12 : 0), cy + .13], [.16 + (v === 's' ? .1 : 0), cy + .12]], .03);
    for (let i = 0; i < 3; i++) A.flat(g, A.rr(-.08 + i * .06 + (v === 's' ? .1 : 0), cy + .12, .04, .04, .005), '#f4f0e0', 0);
  }],
  rotte: [1.1, .8, .55, .1, v => g => {
    const F = '#8a8494', FL = '#2a2630', P = '#e8a0a8';
    if (v !== 'f') { g.beginPath(); g.moveTo(-.3, -.14); g.quadraticCurveTo(-.54, -.1, -.5, -.36); g.lineWidth = .06; g.strokeStyle = FL; g.stroke(); g.lineWidth = .035; g.strokeStyle = P; g.stroke(); }
    A.cel(g, A.blob([[-.36, -.06], [-.4, -.26], [-.2, -.42], [.12, -.44], [.34, -.3], [.4, -.1], [.1, -.04]]), F, { line: FL, sk: .72 });
    for (const x of v === 's' ? [.12] : [-.16, .16]) A.cel(g, A.ell(x, -.46, .1, .09), P, { line: FL, lw: .03 });
    if (v === 'b') return;
    const hx = v === 's' ? .3 : 0;
    A.cel(g, A.ell(hx, -.28, v === 's' ? .16 : .2, .13), Col.light(F, .12), { line: FL, lw: .035 });
    for (const x of v === 's' ? [hx + .04] : [-.08, .08]) { A.dot(g, x, -.32, .035, '#1a1016'); A.dot(g, x - .012, -.335, .012, '#ffffff'); }
    A.dot(g, hx + (v === 's' ? .15 : 0), -.24, .035, P);
    for (const s of [-1, 1]) A.line(g, [[hx + s * .08, -.23], [hx + s * .26, -.26 + s * .02]], .012, FL);
    g.save(); g.translate(hx + .04, -.16); g.rotate(-.2); A.cel(g, A.rr(-.1, -.03, .2, .08, .01), '#f4ecd8', { line: '#5a4a36', lw: .02, hi: false }); g.restore();
  }],
  oyeblomst: [1.4, 1.9, .7, .1, v => g => {
    const St = '#5a3a6a', Pe = '#e8a0b0', PeL = '#5a1a2a';
    A.line(g, [[0, 0], [.04, -.5], [-.04, -.92]], .16, INK); A.line(g, [[0, 0], [.04, -.5], [-.04, -.92]], .1, St);
    for (const [x, y, r] of [[.1, -.46, .5], [-.08, -.66, -.6]]) { g.save(); g.translate(x, y); g.rotate(r); A.cel(g, A.ell(.14, 0, .16, .06), '#6a8a4a', { lw: .03 }); g.restore(); }
    const cy = -1.28;
    for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; g.save(); g.translate(Math.cos(a) * .3, cy + Math.sin(a) * .3); g.rotate(a + Math.PI / 2); A.cel(g, A.ell(0, 0, .12, .2), i % 2 ? Pe : Col.dark(Pe, .88), { line: PeL, lw: .035 }); g.restore(); }
    A.cel(g, A.ell(0, cy, .3, .3), '#f6f2e6', { line: PeL, lw: .045 });
    for (const [a, l] of [[.3, .2], [2.2, .22], [4, .18]]) A.line(g, [[Math.cos(a) * .12, cy + Math.sin(a) * .12], [Math.cos(a) * l * 1.3, cy + Math.sin(a) * l * 1.3]], .015, '#c83a3a');
    if (v === 'b') { A.flat(g, A.ell(0, cy, .2, .2), '#e8d8d0', 0); return; }
    const ox = v === 's' ? .08 : 0;
    A.cel(g, A.ell(ox, cy, .15, .15), '#7a3ab0', { lw: .035 }); A.dot(g, ox, cy, .075, '#140810'); A.dot(g, ox - .05, cy - .05, .03, '#ffffff');
  }]
});
const ENEMY_ART = {
  byrakrat: {
    head: g => {
      const S = '#e8c8a8', cy = -.36;
      A.cel(g, A.rr(-.3, cy - .26, .6, .58, .2), S);
      A.cel(g, A.blob([[-.32, cy - .02], [-.3, cy - .2], [-.2, cy - .26], [-.22, cy - .1]]), '#5a4a3a', { lw: .03 }); A.cel(g, A.blob([[.32, cy - .02], [.3, cy - .2], [.2, cy - .26], [.22, cy - .1]]), '#5a4a3a', { lw: .03 });
      for (let i = 0; i < 4; i++) A.line(g, [[-.2, cy - .22 + i * .03], [.22, cy - .28 + i * .025]], .015, '#5a4a3a');
      A.cel(g, A.blob([[-.36, cy - .2], [.36, cy - .2], [.3, cy - .08], [-.3, cy - .08]]), '#3a8a5a', { line: '#123a22', lw: .035 });
      A.flat(g, A.rr(-.3, cy - .22, .6, .05, .01), 'rgba(160,230,190,.5)', 0);
      for (const s of [-1, 1]) { A.flat(g, A.ell(s * .12, cy + .02, .08, .07), 'rgba(230,245,255,.6)', .028); A.dot(g, s * .12, cy + .03, .028); }
      A.line(g, [[-.04, cy + .02], [.04, cy + .02]], .02);
      A.cel(g, A.blob([[-.14, cy + .16], [0, cy + .12], [.14, cy + .16], [.08, cy + .19], [0, cy + .16], [-.08, cy + .19]]), '#4a3a2a', { lw: .02 });
      A.line(g, [[-.06, cy + .25], [.06, cy + .25]], .025);
      A.line(g, [[.3, cy - .06], [.4, cy - .3]], .05, '#d4b048'); A.dot(g, .4, cy - .3, .025, '#3a3a44');
    },
    body: g => {
      const top = -.74;
      A.cel(g, A.blob([[-.36, 0], [.36, 0], [.38, top + .3], [.32, top + .04], [0, top], [-.32, top + .04], [-.38, top + .3]]), '#f4f2ea', { sk: .86 });
      A.cel(g, A.blob([[-.36, 0], [-.08, 0], [-.1, top + .12], [-.3, top + .06], [-.38, top + .3]]), '#2a2a30', { lw: .035 });
      A.cel(g, A.blob([[.36, 0], [.08, 0], [.1, top + .12], [.3, top + .06], [.38, top + .3]]), '#2a2a30', { lw: .035 });
      A.cel(g, A.poly([[-.05, top + .06], [.05, top + .06], [.07, top + .5], [0, top + .58], [-.07, top + .5]]), '#b3261e', { lw: .025, hi: false });
      for (const y of [.3, .5]) A.dot(g, -.2, top + y, .02, '#d4b048');
      A.cel(g, A.rr(-.3, top + .6, .6, .1, .02), '#1a1a20', { lw: .025, hi: false });
    }
  },
  narkose: {
    head: g => {
      const S = '#f0d8c0', cy = -.36;
      A.cel(g, A.ell(0, cy, .31, .3), S);
      A.cel(g, A.blob([[-.34, cy - .02], [-.32, cy - .3], [0, cy - .4], [.32, cy - .3], [.34, cy - .02], [0, cy - .14]]), '#7fb89a', { line: '#1f4a34', sk: .8 });
      for (const s of [-1, 1]) { A.cel(g, A.ell(s * .13, cy - .06, .1, .09), '#3a4a44', { lw: .035 }); A.flat(g, A.ell(s * .13, cy - .06, .06, .05), 'rgba(170,230,210,.7)', 0); A.dot(g, s * .1, cy - .08, .02, '#ffffff'); }
      A.line(g, [[-.03, cy - .06], [.03, cy - .06]], .03, '#3a4a44');
      A.cel(g, A.ell(0, cy + .16, .17, .14), '#2a2a30', { lw: .04 }); A.cel(g, A.ell(0, cy + .16, .09, .07), '#4a4a52', { lw: .025, hi: false });
      g.beginPath(); g.moveTo(.1, cy + .26); g.quadraticCurveTo(.4, cy + .44, .3, cy + .7); g.lineWidth = .08; g.strokeStyle = INK; g.stroke(); g.lineWidth = .045; g.strokeStyle = '#4a4a52'; g.stroke();
    },
    body: g => {
      const top = -.74;
      A.cel(g, A.rr(-.42, top + .08, .2, .56, .08), '#b87333', { line: '#3a2008', lw: .035 }); A.cel(g, A.rr(.22, top + .08, .2, .56, .08), '#b87333', { line: '#3a2008', lw: .035 });
      A.cel(g, A.blob([[-.36, 0], [.36, 0], [.38, top + .3], [.32, top + .04], [0, top], [-.32, top + .04], [-.38, top + .3]]), '#7fb89a', { line: '#1f4a34', sk: .82 });
      A.cel(g, A.poly([[-.14, top + .02], [0, top + .14], [.14, top + .02]]), '#6aa088', { line: '#1f4a34', lw: .03, hi: false });
      A.line(g, [[-.2, top + .4], [.2, top + .42]], .03, '#1f4a34');
      for (const [x, y, r] of [[-.16, top + .56, .06], [.12, top + .3, .04]]) A.flat(g, A.ell(x, y, r, r * .7), 'rgba(140,20,20,.45)', 0);
    }
  }
};
{ const _cp = charPart; charPart = function (type, piece, v) { const E = ENEMY_ART[type]; if (E && (piece === 'hode' || piece === 'kropp')) { const h = piece === 'hode'; return Art.part(piece + '_' + type + '_f', h ? 1.2 : 1.3, h ? 1.1 : 1.0, h ? .6 : .65, h ? .1 : .08, h ? E.head : E.body); } return _cp(type, piece, v); }; }
Object.assign(WEAPON_ART, { skjemabunke: [.6, .7, .3, .1], gasskolbe: [.5, .9, .25, .1] });
{ const _dw = drawWeapon; drawWeapon = id => id === 'skjemabunke' ? g => {
    for (let i = 0; i < 5; i++) { g.save(); g.translate((i % 2 - .5) * .03, -.08 - i * .07); g.rotate((i % 3 - 1) * .06); A.cel(g, A.rr(-.22, -.06, .44, .08, .01), i === 2 ? '#c8b890' : PAPER, { line: PAPERL, lw: .022, hi: false, soft: false }); g.restore(); }
    A.flat(g, A.rr(-.06, -.46, .12, .04, .01), 'rgba(179,38,30,.7)', 0);
  } : id === 'gasskolbe' ? g => {
    A.cel(g, A.rr(-.14, -.62, .28, .6, .12), '#9ad0e0', { line: '#1f4a5a', lw: .04 }); A.flat(g, A.rr(-.1, -.36, .2, .3, .08), 'rgba(200,240,250,.6)', 0);
    A.cel(g, A.rr(-.06, -.78, .12, .18, .03), '#6b4226', { lw: .03 }); A.line(g, [[-.1, -.48], [.1, -.48]], .02, '#1f4a5a');
  } : _dw(id); }

/* ---------- oppførsel ---------- */
Object.assign(Grotesk.keep, { tvang: 1.0, byrakrat: 5, narkose: 3.6, rotte: .5, oyeblomst: 0 });
Grotesk.retreat = { lunge: 1, svulst: 1, byrakrat: 1, narkose: 1 };
Grotesk.talk = { lunge: 1, svulst: 1, tvang: 1, byrakrat: 1, narkose: 1, rotte: 1, oyeblomst: 1 };
Grotesk.hold = { byrakrat: 1, narkose: 1 };
Grotesk.hop = { yngel: 1, tvang: 1, rotte: 1 };
Object.assign(Grotesk.ai, {
  /* ruller seg fram som en kjegle, stanger når den er nær */
  tvang(e, T, dist, toT) {
    if (dist < 1.5) { e.state = 'wind'; e.t = .4; e.face = toT; addTele('circle', { x: e.x + Math.sin(toT) * .7, z: e.z + Math.cos(toT) * .7, r: .75 }, .4, o => { hitShape('circle', o, e.dmg, { type: 'tvang', x: e.x, z: e.z, kb: 7 }, 'enemy'); e.kvx = Math.sin(e.face) * 6; e.kvz = Math.cos(e.face) * 6; Sound.play('bonk', .7, .8); }, e); e.cd = rnd(1.2, 2); return; }
    if (dist < 7.5 && los(e.x, e.z, T.x, T.z)) {
      const len = Math.min(8, dist + 2); e.state = 'wind'; e.t = .7; e.face = toT; FX.bubble(e, pick(['HEHEHE', 'Se, ingen hender!', 'KJEGLE!']), 1);
      addTele('rect', { x: e.x, z: e.z, a: toT, w: 1.1, len }, .7, o => { e.state = 'charge'; e.chargeDir = o.a; e.chargeLeft = len; e.chargeHit = false; e.rolling = true; Sound.play('swingHeavy', .8, .8); }, e);
      e.cd = rnd(2.2, 3.4);
    }
  },
  /* kaster skjemaer i vifte, eller stempler en kø der pasienten står */
  byrakrat(e, T, dist, toT) {
    if (dist > 9.5 || !los(e.x, e.z, T.x, T.z)) return;
    e.state = 'wind'; e.face = toT;
    if (Math.random() < .6) {
      e.t = .6; addTele('rect', { x: e.x, z: e.z, a: toT, w: 1.6, len: 8 }, .6, o => { for (const da of [-.22, 0, .22]) addProj({ type: 'page', from: 'enemy', x: e.x + Math.sin(o.a + da) * .6, z: e.z + Math.cos(o.a + da) * .6, vx: Math.sin(o.a + da) * 8, vz: Math.cos(o.a + da) * 8, dmg: e.dmg, life: 1.3, r: .26, cause: 'byrakrat', spin: 12 }); Sound.play('paper', .8, 1.2); }, e);
    } else {
      e.t = 1.0; const o = { x: T.x, z: T.z, r: 1.15, color: 0xb3261e }; FX.bubble(e, 'Ta kølapp.', 1);
      addTele('circle', o, 1.0, () => { hitShape('circle', o, e.dmg * .6, { type: 'byrakrat', x: o.x, z: o.z, stun: 1.1 }, 'enemy'); FX.text(o.x, 1.4, o.z, 'VENT', 'stamp', 1); Sound.play('stamp', .8); const dec = propSprite(null, o.x, o.z, { P: stampDecal(), flat: true }); R.dyn.add(dec); addFx(dec, 4, (ob, p) => { ob.userData.U.uAlpha.value = p > .7 ? (1 - p) / .3 : 1; }); }, e);
    }
    e.cd = rnd(2.2, 3.2);
  },
  /* kaster en eterkolbe som blir en sky: pasienten blir treg og sovner litt */
  narkose(e, T, dist, toT) {
    if (dist > 8.5) return;
    e.state = 'wind'; e.t = .8; e.face = toT; const tx = T.x + rnd(-.8, .8), tz = T.z + rnd(-.8, .8);
    addTele('circle', { x: tx, z: tz, r: 1.8, color: 0x9ad0e0 }, .8, () => { }, e);
    bossLaterE(e, .3, () => addProj({ type: 'eter', from: 'enemy', x: e.x, z: e.z, tx, tz, arc: true, dur: .5, h: 2, land: p => { addGas(p.tx, p.tz, 1.8, 5); Sound.play('glass', .8, .8); } }));
    e.cd = rnd(3.2, 4.6);
  },
  rotte(e, T, dist, toT) {
    if (dist < 1.0) { e.state = 'wind'; e.t = .22; e.face = toT; addTele('circle', { x: e.x + Math.sin(toT) * .45, z: e.z + Math.cos(toT) * .45, r: .45 }, .22, o => { if (inShape({ shape: 'circle', o }, T.x, T.z, T.r)) hurt(T, e.dmg, { type: 'rotte', x: e.x, z: e.z, kb: 1 }); }, e); e.cd = rnd(.7, 1.2); }
  },
  /* står fast i gulvet og skyter langsomme Morbidium-kuler som følger etter */
  oyeblomst(e, T, dist, toT) {
    if (dist < 1.8) { e.state = 'wind'; e.t = .45; addTele('circle', { x: e.x, z: e.z, r: 1.7, color: 0xb36be0 }, .45, o => hitShape('circle', o, e.dmg, { type: 'oyeblomst', x: e.x, z: e.z, kb: 8 }, 'enemy'), e); e.cd = rnd(1.4, 2); return; }
    if (dist < 12) {
      e.state = 'wind'; e.t = .7; e.face = toT;
      addTele('circle', { x: e.x, z: e.z, r: .6, color: 0xb36be0 }, .7, () => { const a = Math.atan2(T.x - e.x, T.z - e.z); addProj({ type: 'orb', from: 'enemy', x: e.x + Math.sin(a) * .6, z: e.z + Math.cos(a) * .6, vx: Math.sin(a) * 4.6, vz: Math.cos(a) * 4.6, dmg: e.dmg, life: 4, home: 2.4, r: .3, cause: 'oyeblomst', glow: ['#b36be0', 1.4], y: 1.3 }); Sound.play('morb', .8, 1.4); }, e);
      e.cd = rnd(2.6, 3.6);
    }
  }
});
/* enkel kø for fiender, brukt av narkoselegen */
function bossLaterE(e, t, fn) { (e.q || (e.q = [])).push({ t, fn }); }
function updateEnemyQueue(e, dt) { if (!e.q || !e.q.length) return; for (let i = e.q.length - 1; i >= 0; i--) { const j = e.q[i]; j.t -= dt; if (j.t <= 0) { e.q.splice(i, 1); if (e.alive) j.fn(); } } }

/* ---------- etergass: en sky på gulvet ---------- */
function addGas(x, z, r, t) {
  const m = new THREE.Mesh(R.plane1(), new THREE.MeshBasicMaterial({ map: R.tex.pool, color: 0xbfe6d8, transparent: true, opacity: .55, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, .05, z); m.scale.set(r * 2.3, r * 2.3, 1); m.renderOrder = 2; R.dyn.add(m);
  G.zones.push({ kind: 'gas', x, z, r, t, max: t, mesh: m, puffT: 0 }); puff(x, z, 5, 1.4, '#cfeee4');
}
function updateZones(dt) {
  const P = G.player;
  for (let i = G.zones.length - 1; i >= 0; i--) {
    const zn = G.zones[i]; if (zn.kind !== 'gas') continue;
    zn.t -= dt; zn.puffT -= dt; zn.mesh.material.opacity = .55 * Math.min(1, zn.t / 1.2);
    if (zn.puffT <= 0) { zn.puffT = .45; puff(zn.x + rnd(-zn.r, zn.r) * .7, zn.z + rnd(-zn.r, zn.r) * .7, 1, 1.1, '#d8f4ea'); }
    if (P && P.alive && d2(P.x, P.z, zn.x, zn.z) < zn.r * zn.r && !Items.has('heliumlunge')) {
      P.gasT = .15; P.gasSleep = (P.gasSleep || 0) + dt;
      if (P.gasSleep > 2.2) { P.gasSleep = 0; P.stunT = Math.max(P.stunT, .7); numText(P.x, P.z, 'zzz', 'info', 2.4); FX.bubble(P, pick(['Bare fem minutter til...', 'Gjesp.', 'Hvem slo av lyset?']), 1.2); }
    }
    if (zn.t <= 0) { R.remove(zn.mesh); G.zones.splice(i, 1); }
  }
  if (P && !(P.gasT > 0)) P.gasSleep = Math.max(0, (P.gasSleep || 0) - dt);
  if (P) P.gasT = (P.gasT || 0) - dt;
}

/* ---------- rotter kommer i flokk, øyeblomsten står fast ---------- */
{ const _se = spawnEnemy; spawnEnemy = function (type, x, z, elite, depth) {
  const e = _se(type, x, z, elite, depth), D = ENEMIES[type];
  if (D.rooted) { e.anchored = true; e.kbMult = 0; }
  if (D.pack && !spawnEnemy.inPack) { spawnEnemy.inPack = true; for (let i = 0; i < D.pack; i++) { const s = freeSpot(x + rnd(-.9, .9), z + rnd(-.9, .9), 1.5); _se(type, s.x, s.z, false, depth); } spawnEnemy.inPack = false; }
  return e;
}; }
