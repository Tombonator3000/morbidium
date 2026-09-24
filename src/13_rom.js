/* ============================================================
   ROM  -  rekvisitter for Kjelleren: Isolat og arkiv (polstret celle, arkivhylle,
   madrass, tvangstrøye, papirhaug). Tegnet i samme 3/4-stil som resten, og
   lagt inn i propArt uten å røre de gamle tegningene.
   ============================================================ */
const PADD = '#e6dcc2', PADDL = '#4a4234', PAPER = '#f4ecd8', PAPERL = '#5a4a36';
const ROM_ART = {
  celle(p) {
    return boxArt('celle', 1.9, 1.4, 1.75, PADD, PADDL, (g, w, tf, ff) => {
      // quiltet polstring: rutemønster med knapper
      g.save(); A.rr(-w / 2, -ff, w, ff, .04)(g); g.clip();
      for (let i = -6; i <= 6; i++) { A.line(g, [[-w / 2 + i * .3, -ff], [-w / 2 + i * .3 + ff * .6, 0]], .018, Col.dark(PADD, .8)); A.line(g, [[w / 2 - i * .3, -ff], [w / 2 - i * .3 - ff * .6, 0]], .018, Col.dark(PADD, .8)); }
      for (let y = -ff + .2; y < -.1; y += .3) for (let x = -w / 2 + .15; x < w / 2; x += .3) A.dot(g, x + ((y * 10) % 2 ? .15 : 0), y, .02, Col.dark(PADD, .6));
      g.restore();
      // dør med kikkeluke og bolter
      A.cel(g, A.rr(-.32, -ff + .12, .64, ff - .14, .04), '#d8ccb0', { line: PADDL, lw: .04, hi: false });
      A.flat(g, A.rr(-.16, -ff + .26, .32, .1, .02), '#15100c', .03, PADDL);
      for (const y of [-ff + .5, -.4]) { A.cel(g, A.rr(.12, y, .2, .08, .02), '#9aa0a6', { line: '#2f3a40', lw: .025, hi: false }); }
      A.flat(g, A.ell(-.2, -.25, .1, .06), 'rgba(120,90,40,.35)', 0);
    });
  },
  arkivhylle(p) {
    const fw = p.fw || 3;
    return boxArt('arkivhylle' + fw, fw * .95, .55, 2.05, P_.wood, P_.woodL, (g, w, tf, ff) => {
      const rng = mulberry32(fw * 71 + 3), cols = ['#e8dcb8', '#c8b890', '#9aa0a6', '#b8a070', '#d8c8a0', '#8a6a4a'];
      for (let row = 0; row < 4; row++) {
        const y0 = -ff + .08 + row * (ff - .12) / 4, hh = (ff - .12) / 4 - .06;
        A.line(g, [[-w / 2 + .04, y0 + hh + .03], [w / 2 - .04, y0 + hh + .03]], .04, P_.woodL);
        for (let x = -w / 2 + .1; x < w / 2 - .12;) {
          const bw = .07 + rng() * .08, lean = rng() < .12 ? .08 : 0;
          g.save(); g.translate(x + bw / 2, y0 + hh); g.rotate(lean); A.cel(g, A.rr(-bw / 2, -hh * (.75 + rng() * .25), bw, hh * (.75 + rng() * .25), .01), cols[Math.floor(rng() * cols.length)], { line: PAPERL, lw: .02, hi: false, soft: false });
          if (rng() < .5) A.flat(g, A.rr(-bw / 3, -hh * .5, bw / 1.5, .05, .005), '#f6f0de', 0); g.restore();
          x += bw + .012;
        }
        if (rng() < .6) { const px = -w / 2 + .2 + rng() * (w - .4); A.cel(g, A.poly([[px, y0 + .02], [px + .22, y0 - .04], [px + .24, y0 + .06], [px + .02, y0 + .1]]), PAPER, { line: PAPERL, lw: .02, hi: false }); }
      }
    });
  },
  madrass(p) {
    return Art.part('prop_madrass', 1.3, .7, .65, .05, g => {
      A.cel(g, A.poly([[-.58, -.02], [.58, -.02], [.46, -.42], [-.46, -.42]]), '#e8e0c8', { line: PADDL, lw: .04, sk: .88 });
      A.cel(g, A.rr(-.6, -.12, 1.2, .12, .03), '#d8ceb0', { line: PADDL, lw: .035, hi: false });
      for (const x of [-.3, 0, .3]) A.line(g, [[x, -.38], [x * 1.2, -.06]], .018, '#b8ae90');
      A.flat(g, A.ell(.14, -.26, .16, .07), 'rgba(150,110,50,.4)', 0); A.flat(g, A.ell(-.26, -.2, .08, .04), 'rgba(120,30,20,.35)', 0);
    });
  },
  tvangstroye(p) {
    return Art.part('prop_tvangstroye', .9, 1.9, .45, .05, g => {
      A.cel(g, A.ell(0, -.05, .26, .08), '#555a60', { line: STEELL, lw: .035 });
      A.line(g, [[0, -.08], [0, -1.62]], .06, STEELL); A.line(g, [[0, -.08], [0, -1.62]], .03, STEEL);
      A.line(g, [[-.2, -1.62], [.2, -1.62]], .05, STEELL);
      // trøya: lange ermer som krysser foran, med stropper og spenner
      A.cel(g, A.blob([[-.3, -1.58], [.3, -1.58], [.36, -1.2], [.3, -.7], [-.3, -.7], [-.36, -1.2]]), '#efe8d4', { line: PADDL, lw: .04, sk: .86 });
      A.cel(g, A.blob([[-.34, -1.3], [.28, -1.02], [.3, -.92], [-.3, -1.16]]), '#e6dcc2', { line: PADDL, lw: .03 });
      A.cel(g, A.blob([[.34, -1.3], [-.28, -1.02], [-.3, -.92], [.3, -1.16]]), '#e6dcc2', { line: PADDL, lw: .03 });
      for (const y of [-1.42, -.84]) { A.line(g, [[-.28, y], [.28, y]], .05, '#8a6a4a'); A.cel(g, A.rr(-.05, y - .04, .1, .08, .01), '#c8ccd0', { lw: .02, hi: false }); }
      A.line(g, [[.3, -.72], [.36, -.36]], .035, '#8a6a4a'); A.line(g, [[-.3, -.72], [-.34, -.4]], .035, '#8a6a4a');
    });
  },
  papirhaug(p) {
    return Art.part('prop_papirhaug', .9, .9, .45, .05, g => {
      const rng = mulberry32(17);
      for (let i = 0; i < 7; i++) { const y = -.06 - i * .08, x = (rng() - .5) * .12, r0 = (rng() - .5) * .2; g.save(); g.translate(x, y); g.rotate(r0); A.cel(g, A.rr(-.32, -.08, .64, .1, .01), i % 3 === 1 ? '#c8b890' : PAPER, { line: PAPERL, lw: .025, hi: false, soft: false }); g.restore(); }
      A.cel(g, A.poly([[-.1, -.62], [.18, -.7], [.22, -.6], [-.04, -.54]]), PAPER, { line: PAPERL, lw: .025 });
      A.flat(g, A.rr(.02, -.66, .12, .06, .01), 'rgba(179,38,30,.7)', 0);
    });
  }
};
{ const _pa = propArt; propArt = function (p) { return ROM_ART[p.k] ? ROM_ART[p.k](p) : _pa(p); }; }

/* ============================================================
   SPESIALROM  -  forbannet rom, hemmelig rom bak sprukken vegg, blodofferrom
   ============================================================ */
Object.assign(ROM_ART, {
  sprekk(p) {
    return boxArt('sprekkvegg', .98, .5, 1.7, '#b8a888', '#3a3024', (g, w, tf, ff) => {
      for (let row = 0; row < 6; row++) { const y = -ff + row * ff / 6; A.line(g, [[-w / 2, y], [w / 2, y]], .02, '#6a5a44'); for (let k = 0; k < 3; k++) { const x = -w / 2 + ((k + (row % 2) * .5) * w / 3); A.line(g, [[x, y], [x, y + ff / 6]], .02, '#6a5a44'); } }
      A.line(g, [[-.1, -ff + .1], [.04, -ff * .7], [-.08, -ff * .5], [.1, -ff * .28], [0, -.1]], .045, INK);
      A.line(g, [[.04, -ff * .7], [.26, -ff * .62]], .03, INK); A.line(g, [[-.08, -ff * .5], [-.3, -ff * .44]], .03, INK);
      A.flat(g, A.ell(.14, -ff * .36, .05, .03), '#15100c', 0);
    });
  },
  offeralter(p) {
    return boxArt('offeralter', 2.8, .8, 1.0, '#6a5a58', '#1a1010', (g, w, tf, ff) => {
      const top = -ff - tf;
      for (const x of [-w * .32, 0, w * .32]) A.flat(g, A.rr(x - .05, -ff + .06, .1, ff - .12, .02), 'rgba(140,16,16,.8)', 0);
      A.cel(g, A.ell(0, top + tf * .5, .34, .12), '#4a4040', { line: '#1a1010', lw: .04 }); A.flat(g, A.ell(0, top + tf * .5, .26, .08), '#8a1010', .02, '#3a0606');
      for (const x of [-w * .42, w * .42]) { A.cel(g, A.rr(x - .06, top - .1, .12, .3, .02), '#f0e8d0', { lw: .025, hi: false }); A.flat(g, A.ell(x, top - .18, .035, .07), '#ffcf5a', .02); }
      g.fillStyle = 'rgba(42,26,20,.65)'; g.font = 'bold .13px Georgia, serif'; g.textAlign = 'center'; g.fillText('GI', 0, -ff * .45);
    });
  },
  forbannet(p) {
    return Art.part('prop_forbannet', 2.2, 2.2, 1.1, 1.1, g => {
      g.strokeStyle = 'rgba(150,14,14,.85)'; g.lineWidth = .07; g.lineCap = 'round';
      g.beginPath(); g.arc(0, 0, .9, 0, TAU); g.stroke();
      g.beginPath(); for (let i = 0; i <= 5; i++) { const a = -Math.PI / 2 + i * 4 * Math.PI / 5, r = i === 3 ? .78 : .86; i ? g.lineTo(Math.cos(a) * r, Math.sin(a) * r) : g.moveTo(Math.cos(a) * r, Math.sin(a) * r); } g.stroke();
      g.fillStyle = 'rgba(150,14,14,.8)'; g.font = 'bold .16px Georgia, serif'; g.textAlign = 'center'; g.fillText('IKKE TRÅKK', 0, 1.06);
    });
  }
});
function thornArt() {
  return Art.part('torner', 1.1, 1.1, .55, .55, g => {
    for (let i = 0; i < 7; i++) { const a = i / 7 * TAU, x = Math.cos(a) * .3, y = Math.sin(a) * .3; A.line(g, [[x * .3, y * .3], [x, y], [x * 1.5 + Math.sin(a) * .1, y * 1.5 - Math.cos(a) * .1]], .05, '#3a1a10'); A.flat(g, A.poly([[x, y], [x * 1.15 + .04, y * 1.15], [x * 1.1, y * 1.1 + .06]]), '#8a1010', .015); }
    A.flat(g, A.ell(0, 0, .16, .12), 'rgba(140,16,16,.55)', 0);
  });
}
const Spesial = {
  cracks: [], dustT: 0,
  onFloor() {
    const F = G.F; this.cracks = [];
    for (const i of F.crack || []) { const x = i % F.W, z = (i / F.W) | 0, g = propSprite(null, x + .5, z + .96, { P: propArt({ k: 'sprekk' }) }); R.level.add(g); this.cracks.push({ i, x: x + .5, z: z + .5, g, hp: 3 }); }
    for (const r of F.rooms) if (r.role === 'cursed') for (const d of r.doors) { const x = d % F.W, z = (d / F.W) | 0; R.level.add(propSprite(null, x + .5, z + .5, { P: thornArt(), flat: true })); R.light(x + .5, z + .5, 1.3, '#ff3a2a', .4, R.levelL); }
    for (const r of F.rooms) if (r.role === 'secret') { const t = freeSpot(r.x + 1.5, r.z + 1.5, 2); for (let i = 0; i < 3; i++) dropPickup(t.x + i * .3, t.z, 'tooth', 1); dropPickup(t.x, t.z + .4, 'cons', pick(Object.keys(PILL_COL))); }
  },
  /* sprukken vegg: tre vanlige slag, ett tungt, eller en eksplosjon */
  hitCrack(x, z, face, range, arc, power) {
    let n = 0;
    for (const c of this.cracks) {
      if (c.broken) continue; const dx = c.x - x, dz = c.z - z, d = Math.hypot(dx, dz);
      if (d > range + .6 || (d > .8 && Math.abs(angDiff(Math.atan2(dx, dz), face)) > arc / 2)) continue;
      this.damage(c, power); n++; break;
    }
    return n;
  },
  boom(x, z, r) { for (const c of this.cracks) if (!c.broken && d2(c.x, c.z, x, z) < (r + .8) ** 2) { this.damage(c, 3); break; } },
  damage(c, n) {
    c.hp -= n; puff(c.x, c.z + .3, 2, .8, '#b8a888'); Particles.spawn(c.x, 1, c.z + .3, 6, 0xb8a888, { speed: 3, up: 3, life: .6 }); Sound.play('bonk', .8, .6); R.shake(.12);
    if (c.hp > 0) { numText(c.x, c.z, 'Det knaker', 'info', 1.9); return; }
    for (const k of this.cracks) { if (k.broken) continue; k.broken = true; G.F.block[k.i] = 0; R.remove(k.g); puff(k.x, k.z, 4, 1.2, '#b8a888'); Particles.spawn(k.x, .8, k.z, 14, 0x8a7a5a, { speed: 5, up: 5, life: .9 }); }
    Sound.play('door', 1, .7); Sound.play('clear', .6); R.shake(.4); toast('Et hemmelig rom', 'Veggen var bare kulisse'); G.run.secrets = (G.run.secrets || 0) + 1; G.flowT = 0;
  },
  update(dt) {
    const P = G.player; if (!P) return; this.dustT -= dt;
    if (this.dustT <= 0) { this.dustT = .6; for (const c of this.cracks) if (!c.broken && d2(c.x, c.z, P.x, P.z) < 30) { Particles.spawn(c.x + rnd(-.3, .3), 1.4, c.z + .4, 1, 0xd8ccb0, { speed: .6, up: .5, g: 1.5, life: 1.1, size: .6 }); if (Math.random() < .08) FX.bubble(P, pick(['Det trekker herfra.', 'Den veggen ser tynn ut.', 'Er det noen der inne?']), 1.6); break; } }
  },
  interact(consider) {
    const P = G.player;
    for (const o of G.props) if (o.alive && o.kind === 'offeralter' && !o.used) consider(Math.hypot(o.x - P.x, o.z - P.z) - 1.2, { t: 'Legg en gave på alteret', fn: () => this.offer(o) });
  },
  onEnter(r, first) {
    const P = G.player;
    if (r.role === 'cursed') {
      const d = Math.min(10, P.hp - 1);
      if (d > 0) { P.hp -= d; P.doll.flash(.12); P.doll.hit(1); R.fx.hurt = 1; numText(P.x, P.z, d, 'hurt', 1.9); Sound.play('hurt', 1, .8); Items.splat(P.x, P.z, '#8a1010', .8); }
      if (first) { toast('Et forbannet rom', 'Tornene tar blod hver gang du går inn'); FX.bubble(P, pick(['Au. Tornene.', 'Hvem planter torner i en døråpning?']), 1.6); }
    }
    if (first && r.role === 'offer') toast('Blodofferrommet', 'Alteret vil ha noe av deg');
    if (first && r.role === 'secret') toast('Et glemt rom', 'Noen gjemte ting her');
  },
  onTake(pd) {
    if (!pd.cursed) return; const r = G.F.rooms[pd.room]; if (!r || !G.rooms[r.id]) return;
    G.rooms[r.id].cleared = false; setTimeout(() => { if (G.state === 'play' || G.state === 'panel') { lockRoom(r); toast('Det var en felle', 'Forbannelsen vil ha noe tilbake'); } }, 900);
  },
  /* blodofferet: tre handler, én gave, ingen angrerett */
  offer(o) {
    const P = G.player, run = G.run, cards = run.slots.map((c, i) => c && { c, i }).filter(Boolean);
    const done = (name, fn) => () => { o.used = true; fn(); stampBig('OFRET', name); Sound.play('hurt', .8, .5); Items.splat(o.x, o.z + .8, '#8a1010', 1.2); flashLight(o.x, o.z, 3, '#ff3a2a', .5, 1.4); };
    const deals = [
      P.maxHp > 20 && { art: ['heart'], name: 'Et hjerte for en kuriositet', desc: 'Mister ett hjerte for godt. Får noe fra blodhylla.', fn: done('Et hjerte', () => { run.heartDebt = (run.heartDebt || 0) + 1; recalcPlayer(); Items.give(Items.pickFrom('blod')); }) },
      P.teeth >= 20 && { art: ['cons', 'kamfer'], name: 'Halve tennene for en kuriositet', desc: 'Gir fra deg ' + Math.floor(P.teeth / 2) + ' gulltenner.', fn: done('Tennene', () => { P.teeth -= Math.floor(P.teeth / 2); Items.give(Items.pickFrom('kabinett')); }) },
      cards.length > 1 && { art: ['card', 'ukjent'], name: 'Et evnekort for to poeng', desc: 'Alteret spiser et tilfeldig kort. Du får to poeng å fordele i journalen.', fn: done('Et kort', () => { const k = pick(cards); run.slots[k.i] = null; P.points += 2; hudCardsKey = ''; toast(ABILITIES[k.c.id].name + ' er borte', 'To poeng å fordele (Tab)'); }) },
      P.hp > 35 && { art: ['heart'], name: '30 helse for 40 gulltenner', desc: 'Alteret drikker. Tennene kommer ut av munnen på det.', fn: done('Blod', () => { P.hp -= 30; dropTeeth(o.x, o.z + 1, 40); }) },
      P.stats.styrke < 5 && { art: ['kur', 'eyeliner'], name: 'Mørke for styrke', desc: '40 Morbidium i blodet. Ett poeng i Styrke.', fn: done('Mørket', () => { addMorb(40); P.stats.styrke++; }) },
      P.weaponLvl > 0 && { art: ['weapon', P.weapon], name: 'Slipingen for et hjerte', desc: 'Våpenet mister all sliping. Du får ett hjerte tilbake.', fn: done('Slipingen', () => { P.weaponLvl = 0; drawWeaponCard(); run.pillHearts = (run.pillHearts || 0) + 1; recalcPlayer(); healPlayer(10, true); }) }
    ].filter(Boolean);
    const opts = shuf(deals).slice(0, 3); opts.push({ art: ['card', 'ukjent'], name: 'Gå din vei', desc: 'Alteret kan vente. Det har god tid.', fn: () => { } });
    choicePanel('Blodofferet', 'Alteret tar imot én gave. Det har ingen angrerett.', opts);
  }
};
