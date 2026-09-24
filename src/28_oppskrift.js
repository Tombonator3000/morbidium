/* ============================================================
   OPPSKRIFTER  -  fiender satt sammen av rolle, deler, farging og egenskaper
   (DESIGN_BRIEF.md, «Oppskriftssystemet»).
   - Rolle: fiendetypen, som bestemmer oppførsel og hvilke deler som er lov.
   - Deler: hode og kropp fra ChatGPTs delark (assets/deler/, DELER_META) når de finnes,
     ellers kodetegningene. Hatter, frisyrer og tilbehør legges oppå hodet.
   - Farging: lyse, grå klær farges i shaderen (uDye). Hud og metall beholder fargen.
   - Mestere: sjeldne, navngitte fiender med en egenskap (tykkhudet, eksplosiv, todelt ...).
   Alt trekkes fra etasjens frø, så samme etasje gir de samme fiendene.
   ============================================================ */
const MESTER = {
  tykkhudet: { adj: 'tykkhudet', tint: '#bcc8ac', hp: 2.2, sp: .85, scale: 1.12 },
  oppjaget: { adj: 'oppjaget', tint: '#fff0b0', sp: 1.45, cd: 1.6 },
  eksplosiv: { adj: 'eksplosiv', tint: '#ffc090', hp: 1.3 },
  todelt: { adj: 'todelt', tint: '#e4bcf4', hp: 1.4 },
  blodsuger: { adj: 'blodsuger', tint: '#f4a8a8', hp: 1.4 },
  pestbaerer: { adj: 'pestbærer', tint: '#c4e4a4', hp: 1.5 },
  oppblast: { adj: 'oppblåst', tint: '#ffdcd4', hp: 2.6, dmg: 1.3, sp: .8, scale: 1.4 },
  krympet: { adj: 'krympet', tint: '#dce8ff', hp: .7, sp: 1.35, scale: .68 },
  gjennomsiktig: { adj: 'gjennomsiktig', tint: '#eef4ff', hp: 1.4 },
  lommetyv: { adj: 'lommetyv', tint: '#f4e4a4', hp: 1.4, sp: 1.2 },
  pansret: { adj: 'pansret', tint: '#c4ccdc', hp: 1.6, armor: .75 }
};
const MESTER_TITTEL = { pleier: 'Søster', oppasser: 'Oppasser', kultist: '', byrakrat: 'Fullmektig', narkose: 'Dr.', tvang: 'Pasient', flue: 'Flua', svulst: 'Svulsten', lunge: 'Lunga', yngel: 'Yngelen', rotte: 'Rotta', oyeblomst: 'Blomsten' };
/* rollene: hvilke farger klærne kan få, hvilke delserier fra ChatGPT som passer, og hvor ansiktet sitter */
const ROLLER = {
  pleier: { farger: ['#6a94c8', '#d880a0', '#7ab888', '#d8b850', '#a888d0'], serier: ['personale'], kropper: ['uniformer'], ansikt: -.12 },
  oppasser: { farger: [], serier: ['personale'], kropper: ['uniformer'], ansikt: -.08 },
  kultist: { farger: [], serier: ['kultister'], ansikt: -.06 },
  byrakrat: { farger: ['#d89a9a', '#9ab4d8', '#d8c888'], serier: ['personale'], ansikt: -.1 },
  narkose: { farger: [], serier: ['personale'], ansikt: -.1 },
  tvang: { farger: ['#d89090', '#90acd8', '#c8b878'], serier: ['pasienter'], ansikt: 0 }
};
const HODEBYTTE = { pleier: 'pasient', oppasser: 'pleier', kultist: 'pasient' };
const TILBEHOR_KODE = ['bart', 'eyeliner', 'glassoye', 'bandasje'];

const Oppskrift = {
  rng: null, tall: { delt: 0, smell: 0 },
  onFloor() { this.rng = new RNG(((G.F && G.F.seed) || 1) * 31 + 977); },
  r() { return (this.rng || (this.rng = new RNG(1))).next(); },
  p(arr) { return arr[Math.floor(this.r() * arr.length)]; },
  /* delene fra ChatGPT, samlet per kategori og serie: { hode: { personale: { 1: { f: nøkkel, b: nøkkel, s: nøkkel } } } }.
     Hoder og kropper tilpasses samme boks som spillets egne deler; hatter, hår og tilbehør tilpasses hodet de havner på. */
  deler() {
    if (this._deler) return this._deler; const out = {};
    for (const [k, m] of Object.entries(typeof DELER_META === 'object' ? DELER_META : {})) ((out[m.kategori] = out[m.kategori] || {})[m.serie] = out[m.kategori][m.serie] || {})[m.del] = Object.assign(out[m.kategori][m.serie][m.del] || {}, { [m.visning]: k });
    return (this._deler = out);
  },
  delPart(k, kind, head) {
    const m = DELER_META[k], img = Art.img[k]; if (!m || !img) return null;
    const draw = (s, W, H, ax, ay) => { const P = Art.part('del_' + kind + '_' + k + (head ? '_' + head.key : ''), W, H, ax, ay, g => g.drawImage(img, -m.bw * s / 2, -m.bh * s, m.bw * s, m.bh * s)); P.dw = m.bw * s; P.dh = m.bh * s; return P; };
    if (kind === 'hode') return draw(Math.min(1.08 / m.bw, .92 / m.bh), 1.2, 1.1, .6, .1);
    if (kind === 'kropp') return draw(Math.min(1.24 / m.bw, .86 / m.bh), 1.3, 1.0, .65, .08);
    const hw = head ? head.dw : .85, s = (kind === 'har' ? 1.02 : kind === 'tilbehor' ? .62 : .74) * hw / m.bw;
    return draw(s, m.bw * s + .1, m.bh * s + .1, (m.bw * s + .1) / 2, .05);
  },
  /* setter delene på dukken: hode og kropp per visning, hatt/hår/tilbehør som tillegg som følger hodet */
  kleDeler(d, hode, kropp, topp, topKind, tb) {
    const H = hode ? Object.fromEntries(Object.entries(hode).map(([v, k]) => [v, this.delPart(k, 'hode')])) : null;
    const B = kropp ? Object.fromEntries(Object.entries(kropp).map(([v, k]) => [v, this.delPart(k, 'kropp')])) : null;
    if (H || B) d.setParts(H, B);
    const ref = H ? (H.f || H.s) : null;
    for (const [set, kind] of [[topp, topKind], [tb, 'tilbehor']]) {
      if (!set) continue; const views = {}, off = {};
      for (const v of ['f', 'b', 's']) { if (!set[v]) continue; const hv = (H && (H[v] || H.f)) || ref; views[v] = this.delPart(set[v], kind, hv); const hh = hv ? hv.dh : .9; off[v] = [0, kind === 'tilbehor' ? hh * .38 : hh * (kind === 'har' ? .6 : .74)]; }
      const first = views.f || views.s || views.b; if (first) d.addAddon(first, { at: 'head', off: Object.assign({ f: off.f || [0, .6] }, off), views });
    }
  },
  velgDel(kat, serier) {
    const D = this.deler()[kat]; if (!D) return null;
    const muligheter = []; for (const s of serier) if (D[s]) for (const n of Object.keys(D[s])) muligheter.push(D[s][n]);
    return muligheter.length ? this.p(muligheter) : null;
  },
  navn(e, key) { const t = MESTER_TITTEL[e.type] ?? ''; return (t ? t + ' ' : '') + this.p(FIRST) + ', ' + MESTER[key].adj; },
  /* kalles for hver fiende som lages */
  apply(e) {
    if (e.kind !== 'enemy' || e.noRecipe) return;
    const rolle = ROLLER[e.type], d = e.doll, humanoid = !RIG[e.type] || !RIG[e.type].blob;
    if (rolle && humanoid) {
      // deler fra ChatGPT når de finnes: hode, kropp, og hatt eller frisyre oppå
      const hode = this.r() < .7 && this.velgDel('hode', rolle.serier), kropp = this.r() < .6 && this.velgDel('kropp', rolle.kropper || rolle.serier);
      const topKind = this.r() < .5 ? 'hatt' : 'har', topp = hode && this.r() < .65 && this.velgDel(topKind, rolle.serier);
      const tb = hode && this.r() < .35 && this.velgDel('tilbehor', rolle.serier.concat(['ansikt']));
      if (hode || kropp) this.kleDeler(d, hode, kropp, topp, topKind, tb);
      // uten deler: av og til et hodebytte som spøk, og tilbehør i ansiktet
      if (!hode && HODEBYTTE[e.type] && this.r() < .05) { const h = HODEBYTTE[e.type]; d.setParts({ f: charPart(h, 'hode', 'f'), b: charPart(h, 'hode', 'b'), s: charPart(h, 'hode', 's') }, null); e.speechT = .5; e.forkledd = true; }
      if (!tb && this.r() < .18) { const k = this.p(TILBEHOR_KODE), L = LOOKS[k], dy = e.forkledd ? 0 : rolle.ansikt; d.addAddon(addonPart(k), Object.assign({}, L, { off: Object.fromEntries(Object.entries(L.off).map(([v, o]) => [v, [o[0], o[1] + dy]])) })); }
      if (rolle.farger.length && this.r() < .45) d.setDye(this.p(rolle.farger));
    } else if (rolle && rolle.farger.length && this.r() < .4) d.setDye(this.p(rolle.farger));
    // størrelse: litt forskjell på alle
    const k = .92 + this.r() * .16; d.sc *= k;
    // mester?
    const sjanse = .03 + G.depth * .025 + (e.elite ? .1 : 0);
    if (!e.split && this.r() < sjanse) this.mester(e, this.p(Object.keys(MESTER)));
  },
  mester(e, key) {
    const M = MESTER[key], d = e.doll; e.mester = key;
    e.hp *= M.hp || 1; e.max = e.hp; e.sp *= M.sp || 1; e.dmg *= M.dmg || 1; e.cdMul = M.cd || 1; e.mArmor = M.armor || 1; e.stolen = 0;
    if (M.scale) { d.sc *= M.scale; e.r *= M.scale; }
    if (key === 'pansret') { e.anchored = true; e.steady = true; }
    d.U.uTint.value.set(M.tint); d.U.uOutline.value = 1; d.U.uOutlineCol.value.set('#f2c230');
    e.mesterNavn = this.navn(e, key); FX.label(e, e.mesterNavn);
  },
  update(dt) {
    for (const e of G.enemies) {
      if (!e.alive || !e.mester) continue;
      if (e.cdMul > 1) e.cd -= dt * (e.cdMul - 1);
      if (e.mester === 'gjennomsiktig') e.doll.U.uAlpha.value = .3 + .22 * Math.sin(G.time * 3 + e.x);
      if (e.mester === 'pestbaerer') { e.pestT = (e.pestT || 0) - dt; if (e.pestT <= 0 && Math.hypot(e.vx, e.vz) > .5) { e.pestT = .5; addPuddle(e.x, e.z, 'morb', .7, 8); } }
    }
  },
  onDie(e) {
    if (!e.mester) return; const D = ENEMIES[e.type];
    dropTeeth(e.x, e.z, (D.teeth[1] + 2) * 2); if (Math.random() < .25) dropPickup(e.x, e.z, 'heart'); if (Math.random() < .1) dropPickup(e.x, e.z, 'trinket', Lomme.pick()); gainXp(D.xp);
    if (e.mester === 'lommetyv' && e.stolen) { dropTeeth(e.x, e.z, e.stolen * 2); numText(e.x, e.z, 'Tennene tilbake, med renter', 'info', 2.4); }
    if (e.mester === 'eksplosiv') { this.tall.smell++; const o = { x: e.x, z: e.z, r: 2.2, color: 0xff7a2a }; addTele('circle', o, .6, () => { hitShape('circle', o, 18, { from: 'env', type: e.type, x: o.x, z: o.z, kb: 8 }, 'all'); Items.boom(o.x, o.z, 0); puff(o.x, o.z, 6, 1.6, '#6a5a4a'); R.shake(.4); }); }
    if (e.mester === 'todelt') for (let i = 0; i < 2; i++) {
      spawnEnemy.inPack = true; setTimeout(() => { spawnEnemy.inPack = false; }, 0); this.tall.delt++; const s = freeSpot(e.x + (i ? .6 : -.6), e.z, 1.5); const c = spawnEnemyBare(e.type, s.x, s.z, false, G.depth); c.split = true; c.hp *= .35; c.max = c.hp; c.doll.sc *= .62; c.r *= .7; c.sp *= 1.2; }
  },
  /* kalles når pasienten tar skade: blodsugere og lommetyver i nærheten får sitt */
  onPlayerHurt(d, src) {
    const P = G.player; let best = null, bd = 12.25;
    for (const e of G.enemies) if (e.alive && (e.mester === 'blodsuger' || e.mester === 'lommetyv') && (!src.type || src.type === e.type)) { const q = d2(e.x, e.z, P.x, P.z); if (q < bd) { bd = q; best = e; } }
    if (!best) return;
    if (best.mester === 'blodsuger') { const h = Math.min(best.max - best.hp, d * 1.5); if (h > 0) { best.hp += h; numText(best.x, best.z, '+' + Math.round(h), 'info', 2.4); Particles.spawn(best.x, 1.2, best.z, 6, 0xc8322a, { speed: 2, up: 3 }); } }
    else { const n = Math.min(P.teeth, 3); if (n) { P.teeth -= n; best.stolen += n; numText(P.x, P.z, '-' + n + ' tenner', 'info', 2.2); Sound.play('tooth', .8, .6); } }
  }
};
/* flytende navneskilt over mestere */
FX.label = function (target, str, cls = '') {
  const el = document.createElement('div'); el.className = 'mester ' + cls; el.textContent = str; $('fx').appendChild(el);
  this.items.push({ el, target, life: 1e9, max: 1e9, kind: 'label', h: (target.bubbleH || 2.6) * (target.doll ? target.doll.sc / (target.doll.rig.scale || 1) : 1) * .92 });
};
/* alle fiender går gjennom oppskriften; spawnEnemyBare lager en uten */
const spawnEnemyBare = spawnEnemy;
{ const _se = spawnEnemy; spawnEnemy = function (type, x, z, elite, depth) { const e = _se(type, x, z, elite, depth); try { Oppskrift.apply(e); } catch (err) { } return e; }; }
