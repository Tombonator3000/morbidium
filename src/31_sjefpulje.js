/* ============================================================
   SJEFPULJE OG MINISJEFER
   - Tilfeldige sjefer: overlegene i etasje 1 til 5 trekkes fra en pulje for hvert løp
     (Krok, Rust, Overarkivaren og Den Store Klumpen). Journalen venter alltid nederst, i etasje 6.
     Helsa følger etasjen, ikke sjefen, så alle passer overalt. Trekningen lagres med løpet.
   - Den Store Klumpen: alle pasientene som ble til én. Klemmer seg sammen og spruter,
     slår med armene sine, spytter ut klumpunger og ruller etter deg.
   - Minisjefer: Hviskekoret, Tannlegen eller Den hodeløse portieren kommer til slutt i
     rommet med frivillig risiko, og av og til i et kamprom lenger inne (fra underetasjen).
     De har egen helsestang og legger alltid igjen et preparatglass.
   ============================================================ */
const SJEF_HP = { 1: 550, 2: 700, 3: 950, 4: 1150, 5: 1350, 6: 1500 };
const SJEF_PULJE = ['krok', 'rust', 'arkivar', 'klumpen'];
const SJEF_DATA = { krok: BOSSES[2], rust: BOSSES[3], arkivar: BOSSES[4], journalen: BOSSES[6] };
SJEF_DATA.klumpen = { type: 'klumpen', weapon: null, name: 'Den Store Klumpen', title: 'Alle pasientene som ble til én', hp: 1000, minion: 'klumpunge', minions: 3, attacks: ['klem', 'armslag', 'spytt', 'rull', 'armslag', 'klem', 'summon'], puddle: 'blod', r: 1.45, fart: 1.45, skygge: 1.7 };
/* sjefen i en etasje for dette løpet. Eldre lagrede løp uten trekning får de faste sjefene. */
function sjefFor(depth) {
  const fast = BOSSES[depth] || BOSSES[MAX_DEPTH], type = (G.run && G.run.sjefer && G.run.sjefer[depth]) || fast.type, D = SJEF_DATA[type] || fast;
  return Object.assign({}, D, { hp: SJEF_HP[depth] || D.hp });
}
/* etasje 1 til 5 fra puljen uten gjentakelse så langt puljen rekker, Journalen alltid sist */
function trekkSjefer(seed) { const p = new RNG((seed >>> 0) * 7 + 13).shuffle(SJEF_PULJE.slice()), ut = {}; for (let d = 1; d < MAX_DEPTH; d++) ut[d] = p[(d - 1) % p.length]; ut[MAX_DEPTH] = 'journalen'; return ut; }
Object.assign(LINES.bossIntro, { krok: LINES.bossIntro[1], rust: LINES.bossIntro[2], arkivar: LINES.bossIntro[3], journalen: LINES.bossIntro[4], klumpen: ['Vi har ventet på deg. Alle sammen.', 'Det er plass til én til.', 'Kom inn i varmen.'] });
Object.assign(LINES.monolog, { krok: LINES.monolog[1], rust: LINES.monolog[2], arkivar: LINES.monolog[3], journalen: LINES.monolog[4], klumpen: ['Vi var mange en gang.', 'Så ble det trangt i kjelleren...', '...og nå er vi én. Det er mye lettere å holde varmen.'] });
Object.assign(LINES.boss, { klumpen: ['Bli med oss!', 'Varmt og trangt!', 'Ikke dytt!', 'VI!'] });
Object.assign(DEATH_CAUSES, { boss_klumpen: ['Ble en del av noe større. Bokstavelig talt.', 'Absorbert. Sitter nå mellom Olga og en ukjent mann.', 'Klemt i hjel av alle på en gang.'] });
POSER.klemme = { klem: [[0, 0], [.55, .42], [.7, -.3], [.85, .06], [1, 0]] };
POSER.rulle = { klem: [[0, 0], [.2, .2], [.5, -.1], [.8, .15], [1, 0]] };

/* ---------- Den Store Klumpen: tegnede deler ---------- */
const KLUMP = { a: '#d49a8a', b: '#e8b89a', c: '#b88070', d: '#f0c8a8', L: '#4a1a1a' };
function klumpDel(k, w, h, ax, ay, draw) { return () => Art.part('klumpen_' + k, w, h, ax, ay, draw); }
const KLUMP_DELER = {
  kropp: klumpDel('kropp', 3.6, 3.0, 1.8, .1, g => {
    // en haug av sammenvokste pasienter i ulike hudfarger, med rester av klær, bandasjer og sting
    const lapp = (pts, col, sk = .74) => A.cel(g, A.blob(pts), col, { line: KLUMP.L, sk, lw: .05 });
    lapp([[-1.6, 0], [-1.7, -.8], [-1.3, -1.7], [-.6, -2.4], [.2, -2.6], [1.0, -2.3], [1.5, -1.6], [1.7, -.7], [1.55, 0]], KLUMP.a, .7);
    lapp([[-1.4, -.1], [-1.5, -.8], [-1.0, -1.3], [-.5, -1.0], [-.6, -.3]], KLUMP.b);
    lapp([[.5, -.2], [.4, -1.1], [.9, -1.5], [1.4, -1.1], [1.4, -.3]], KLUMP.c);
    lapp([[-.5, -1.6], [-.2, -2.3], [.5, -2.35], [.7, -1.8], [.2, -1.5]], KLUMP.d);
    // en gul kåpeflik og en stripete pyjamaslapp som har vokst fast
    A.cel(g, A.poly([[-1.2, -.9], [-.8, -1.1], [-.7, -.6], [-1.1, -.5]]), '#e0a33a', { lw: .035, sk: .8 });
    A.cel(g, A.poly([[.9, -.5], [1.3, -.6], [1.35, -.2], [.95, -.15]]), '#f2f0ea', { lw: .035, sk: .85 }); for (let i = 0; i < 3; i++) A.line(g, [[.97 + i * .12, -.52], [1.0 + i * .12, -.17]], .03, '#4a6ab0');
    // sting og bandasjer
    for (const [x0, y0, x1, y1] of [[-.3, -.6, .3, -.9], [-1.0, -1.9, -.6, -1.5], [.8, -2.0, 1.2, -1.7]]) { A.line(g, [[x0, y0], [x1, y1]], .025, '#6a2a2a'); for (let k = 1; k < 6; k++) { const t = k / 6, x = lerp(x0, x1, t), y = lerp(y0, y1, t); A.line(g, [[x - .04, y - .05], [x + .04, y + .05]], .018, INK); } }
    A.cel(g, A.rr(-.2, -1.15, .8, .16, .06), '#f2eee4', { lw: .03, sk: .85 }); A.flat(g, A.ell(.3, -1.07, .06, .04), 'rgba(170,40,40,.6)', 0);
    // en infusjonsnål som sitter fast, med slange
    A.line(g, [[1.1, -1.25], [1.35, -1.55]], .03, '#8a9096'); g.beginPath(); g.moveTo(1.35, -1.55); g.quadraticCurveTo(1.7, -1.9, 1.55, -2.4); g.lineWidth = .03; g.strokeStyle = '#c8d8e0'; g.stroke();
    for (const [x, y] of [[-1.3, -.35], [.2, -.25], [1.3, -.95], [-.9, -2.1]]) A.flat(g, A.ell(x, y, .08, .05), 'rgba(140,40,40,.4)', 0);
  }),
  ansikt: i => klumpDel('ansikt' + i, .8, .8, .4, .4, g => {
    const S = [KLUMP.b, KLUMP.d, KLUMP.a, KLUMP.b][i];
    A.cel(g, A.ell(0, 0, .3, .32), S, { line: KLUMP.L, lw: .04, sk: .78 });
    if (i === 0) { for (const s of [-1, 1]) A.line(g, [[s * .16, -.08], [s * .06, -.04], [s * .16, -.02]], .03); A.cel(g, A.ell(0, .14, .12, .12), '#3a0a10', { lw: .03, hi: false }); A.flat(g, A.rr(-.08, .04, .16, .04, .01), '#f4ecd0', .01); }
    else if (i === 1) { for (const s of [-1, 1]) A.curve(g, [s * .17, -.05], [s * .11, -.01], [s * .05, -.05], .025); A.line(g, [[-.06, .13], [.06, .13]], .025); A.flat(g, A.ell(.08, .22, .03, .06), 'rgba(200,230,250,.8)', .012); }
    else if (i === 2) { for (const s of [-1, 1]) { A.flat(g, A.ell(s * .11, -.05, .06, .065), '#fbf6ea', .02); A.dot(g, s * .11, -.04, .03); } A.cel(g, A.blob([[-.18, .08], [.18, .08], [.12, .2], [0, .23], [-.12, .2]]), '#5a1414', { lw: .025, hi: false }); for (let k = 0; k < 5; k++) A.flat(g, A.rr(-.15 + k * .062, .08, .05, .045, .008), '#f4ecd0', .01); }
    else { for (const s of [-1, 1]) { A.flat(g, A.ell(s * .12, -.03, .1, .1), '#f6f6ee', .035); A.dot(g, s * .12 + .01, -.02, .035); A.line(g, [[s * .2, -.18], [s * .06, -.13]], .025); } A.line(g, [[-.03, -.03], [.03, -.03]], .03); A.curve(g, [-.08, .17], [0, .12], [.08, .17], .025); }
  }),
  oye: klumpDel('oye', .36, .36, .18, .18, g => { A.cel(g, A.ell(0, 0, .13, .12), '#f4efe4', { lw: .03, line: KLUMP.L }); A.dot(g, .02, 0, .06, '#6a8a3a'); A.dot(g, .02, 0, .03); A.line(g, [[-.12, .02], [-.05, .01]], .012, '#c02a2a'); }),
  lue: klumpDel('lue', 1.1, .9, .55, .1, g => {
    A.cel(g, A.blob([[-.42, 0], [.42, 0], [.3, -.3], [.1, -.55], [-.3, -.7], [-.5, -.62], [-.2, -.4]]), '#c83232', { lw: .04, sk: .75 });
    for (const [x0, y0, x1, y1] of [[-.3, -.02, -.1, -.4], [.0, -.02, .05, -.45], [.28, -.03, .2, -.3]]) A.line(g, [[x0, y0], [x1, y1]], .06, '#f2eee4');
    A.cel(g, A.ell(-.48, -.66, .1, .1), '#f2eee4', { lw: .03 }); A.cel(g, A.rr(-.46, -.06, .92, .12, .05), '#f2eee4', { lw: .035, hi: false });
  })
};
LAGDUKKE.klumpen = {
  scale: 1, skygge: 1.7, puls: 2.4,
  deler: [
    { P: KLUMP_DELER.kropp, x: 0, y: 0, z: 0 },
    ...[[-.72, 1.55, 0], [.62, 1.05, 1], [.1, 1.9, 2], [-.2, .72, 3]].map(([x, y, i], k) => ({ P: () => KLUMP_DELER.ansikt(i)(), x, y, z: .02 + k * .003,
      anim: (d, S) => { const skrik = S.aapen || S.kl > .2 ? 1 : 0; d.m.position.set(x + Math.sin(S.t * 1.7 + k) * .03, y + Math.sin(S.t * 2.3 + k * 2) * .04, d.z); d.m.scale.set(1 + skrik * .15, 1 + skrik * .2 + Math.sin(S.t * 3 + k) * .03, 1); } })),
    ...[[-1.05, 1.9], [1.1, 1.8], [.7, .45], [-.95, .5], [.45, 2.3]].map(([x, y], k) => ({ P: KLUMP_DELER.oye, x, y, z: .03,
      anim: (d, S) => { const b = Math.sin(S.t * (1.3 + k * .4) + k * 7) > .96 ? .1 : 1; d.m.scale.set(1, b, 1); } })),
    { P: KLUMP_DELER.lue, x: .15, y: 2.52, z: .01, anim: (d, S) => { d.m.rotation.z = -.15 + Math.sin(S.t * 2) * .05; } }
  ],
  /* armer som stikker ut av haugen og vifter, og løftes når Klumpen angriper */
  lemmer(dd, S) {
    const hud = [KLUMP.b, KLUMP.c, KLUMP.d, KLUMP.a, KLUMP.b, KLUMP.c], strek = STREK.tynn;
    [[-1.5, .9, -1], [1.5, 1.0, 1], [-1.25, 1.7, -1], [1.35, 1.6, 1], [-1.6, .3, -1], [1.62, .35, 1]].forEach(([x, y, s], k) => {
      const opp = (S.aapen ? .9 : 0) + (S.kl > .2 ? .6 : 0), v = Math.sin(S.t * (2 + k * .3) + k * 1.9) * .25, len = .75 + (k % 3) * .12;
      const ex = x + s * (len * .8 + .1 * Math.cos(S.t * 3 + k)), ey = y + v + opp * (.5 + (k % 2) * .3);
      (k % 2 ? dd.front : dd.back).add(limb(x, y, ex, ey, s * .12, 5), strek ? .09 : .16, strek ? STREK.farge : hud[k], k % 2 ? .015 : -.02);
      (k % 2 ? dd.front : dd.back).circle(ex, ey, .1, hud[k], k % 2 ? .016 : -.019);
    });
  },
  portrett(g, S, cx, cy, lag) {
    if (lag !== 'bak') return;
    for (const [x, y, s, a] of [[-1.5, .9, -1, .3], [1.5, 1.0, 1, -.2], [-1.25, 1.7, -1, .5], [1.35, 1.6, 1, .4]]) {
      const ex = x + s * .8, ey = y + a; g.lineCap = 'round';
      for (const [w, c] of [[.13, INK], [.09, STREK.tynn ? STREK.farge : KLUMP.b]]) { g.beginPath(); g.moveTo(cx + x * S, cy - y * S); g.lineTo(cx + ex * S, cy - ey * S); g.lineWidth = w * S; g.strokeStyle = c; g.stroke(); }
      g.beginPath(); g.arc(cx + ex * S, cy - ey * S, .12 * S, 0, TAU); g.fillStyle = INK; g.fill(); g.beginPath(); g.arc(cx + ex * S, cy - ey * S, .09 * S, 0, TAU); g.fillStyle = KLUMP.b; g.fill();
    }
  }
};
RIG.klumpen = { blob: true, scale: 1 };

/* ---------- Klumpens angrep ---------- */
Object.assign(BOSS_MOVES, {
  /* klemmer seg sammen, så spruter alt ut igjen: slag rundt seg og puss i alle retninger */
  klem(B, dist, toP, dmg) {
    B.t = B.atkDur = 1.7; B.atkAnim = false; B.positur = { navn: 'klemme', t: 0, dur: 1.45 }; FX.bubble(B, pick(['Ikke dytt!', 'Trangt!', 'Alle sammen, NÅ!']), 1.2, 'boss');
    const o = { x: B.x, z: B.z, r: 3.5, color: 0xd49a8a };
    addTele('circle', o, 1.0, () => {
      o.x = B.x; o.z = B.z; hitShape('circle', o, dmg, { type: 'boss', x: B.x, z: B.z, kb: 11 }, 'enemy'); R.shake(.55); Sound.play('slam'); Sound.play('splat', 1, .7);
      for (let k = 0; k < 14; k++) { const a = k / 14 * TAU + Math.random() * .2; Items.enemyShot({ x: B.x, z: B.z, type: 'boss' }, a, dmg * .45); }
      if (typeof Blod === 'object' && Blod.on) { Blod.sprut(B.x, B.z, Math.random() * TAU, '#a0303a', 14, 1.6); Blod.vegg(B.x, B.z, '#a0303a', 1.3); }
      addPuddle(B.x, B.z, 'blod', 2.2, 16);
    }, B);
  },
  /* armene strekker seg ut og slår ned der du står, tre ganger */
  armslag(B, dist, toP, dmg) {
    const n = B.enraged ? 4 : 3; B.t = B.atkDur = .7 + n * .3; B.aapen = 1; FX.bubble(B, pick(['VI!', 'Kom hit!', 'Bli med oss!']), 1, 'boss');
    for (let i = 0; i < n; i++) bossLater(B, i * .28, () => {
      const P = G.player, a = Math.random() * TAU, d = i ? rnd(.4, 1.4) : 0, o = { x: P.x + Math.sin(a) * d, z: P.z + Math.cos(a) * d, r: 1.3, color: 0xc86a5a };
      addTele('circle', o, .75, () => {
        hitShape('circle', o, dmg * .8, { type: 'boss', x: o.x, z: o.z, kb: 6 }, 'enemy'); beam(B.x, B.z, o.x, o.z, 0xd49a8a, .35, .25, 1.1);
        puff(o.x, o.z, 3, 1.1); Sound.play('slam', .8, 1.2); R.shake(.25); if (typeof Blod === 'object') Blod.flekk(o.x, o.z, '#9a2a2a', .9, .88);
      }, B);
    });
    bossLater(B, .7 + n * .3, () => { B.aapen = 0; });
  },
  /* spytter ut små klumper som lander rundt deg og blir til klumpunger */
  spytt(B, dist, toP, dmg) {
    const n = 2 + (B.enraged ? 2 : 1); B.t = B.atkDur = 1.3; B.aapen = 1; FX.bubble(B, 'Barna våre!', 1.2, 'boss');
    for (let i = 0; i < n; i++) bossLater(B, .3 + i * .18, () => {
      const P = G.player, a = Math.random() * TAU, d = rnd(1.5, 3.2), s = freeSpot(P.x + Math.sin(a) * d, P.z + Math.cos(a) * d, 2);
      addTele('circle', { x: s.x, z: s.z, r: .8, color: 0xd49a8a }, .6, () => { }, B);
      const m = propSprite(null, B.x, B.z, { P: charPart('klumpunge', 'blob', 'f'), shadow: false, y: 2 }); R.dyn.add(m);
      addProj({ type: 'unge', from: 'enemy', x: B.x, z: B.z, tx: s.x, tz: s.z, arc: true, dur: .6, h: 3, mesh: m, land: () => { if (G.enemies.filter(e => e.alive).length < 14) spawnEnemy('klumpunge', s.x, s.z, false, B.depth); Sound.play('splat', .7, 1.2); if (typeof Blod === 'object') Blod.flekk(s.x, s.z, '#a0303a', .6, .88); } });
    });
    bossLater(B, 1.2, () => { B.aapen = 0; });
  },
  /* ruller etter deg og etterlater et blodspor. Treffer den veggen, blir den liggende et øyeblikk. */
  rull(B, dist, toP, dmg) {
    B.t = B.atkDur = 2.6; const o = { x: B.x, z: B.z, a: toP, w: 2.8, len: 10 }; FX.bubble(B, 'RULL!', 1, 'boss');
    addTele('rect', o, .9, () => { B.rull = { a: o.a, igjen: 10, traff: false }; B.positur = { navn: 'rulle', t: 0, dur: 1.2 }; Sound.play('swingHeavy', 1, .5); }, B);
  }
});
SJEF_DATA.klumpen.tick = (B, dt) => {
  const R0 = B.rull; if (!R0) return;
  const sp = 10.5, P = G.player, st = sp * dt, wall = moveEnt(B, Math.sin(R0.a) * st, Math.cos(R0.a) * st); R0.igjen -= st;
  if (typeof Blod === 'object' && Math.random() < dt * 14) Blod.legg('drape', B.x + rnd(-.8, .8), B.z + rnd(-.5, .5), Math.random() * TAU, .35, .35, '#8a2a2a');
  if (!R0.traff && P.alive && d2(B.x, B.z, P.x, P.z) < (B.r + P.r + .3) ** 2) { R0.traff = true; hurt(P, bossDmg(B) * 1.1, { type: 'boss', x: B.x, z: B.z, kb: 12 }); }
  if (wall || R0.igjen <= 0) { B.rull = null; if (wall) { B.state = 'stagger'; B.t = 1.6; B.stagger = 1.6; R.shake(.5); Sound.play('bonk', 1, .5); numText(B.x, B.z, 'BONK', 'crit', 4); puff(B.x, B.z, 6, 1.8); } }
};
/* Journalen skriver om kapitlene til sjefene du faktisk har møtt i dette løpet */
BOSS_MOVES.rewrite = function (B, dist, toP, dmg) {
  const moter = Object.values((G.run && G.run.sjefer) || { 1: 'krok', 2: 'rust', 3: 'arkivar' }).filter(t => t !== 'journalen');
  const valg = moter.flatMap(t => ((SJEF_DATA[t] || {}).attacks || []).filter(k => BOSS_MOVES[k] && k !== 'rewrite' && k !== 'rull'));
  const k = pick(valg.length ? valg : ['hookpull', 'flood', 'stamprain']);
  FX.bubble(B, pick(['Jeg blar tilbake.', 'Kjenner du igjen dette kapittelet?', 'Omskrevet.']), 1.4, 'boss');
  BOSS_MOVES[k](B, dist, toP, dmg);
};
{ const _sb = spawnBoss; spawnBoss = function (depth, x, z) { const B = _sb(depth, x, z); if (D3.on) D3.morke(1.3, .05); if (B.type === 'klumpen') B.glow && R.setLight(B.glow, .25); return B; }; }

/* ============================================================
   MINISJEFER
   ============================================================ */
const MINISJEFER = ['koret', 'tannlege', 'portier'];
const Mini = {
  rom: {},
  /* hvilke rom får minisjef i denne etasjen: rommet med frivillig risiko, og av og til et kamprom lenger inne */
  onFloor() {
    const F = G.F; this.rom = {}; if (!F) return;
    const rng = new RNG(((F.seed || 1) >>> 0) * 13 + 71), risk = F.rooms.find(r => r.role === 'risk');
    if (risk) this.rom[risk.id] = rng.pick(MINISJEFER);
    if (G.depth >= 2 && rng.chance(.35)) { const k = F.rooms.filter(r => r.role === 'combat' && r.waves && r.waves.length && (!F.dist || F.dist[r.id] >= 2)); if (k.length) this.rom[rng.pick(k).id] = rng.pick(MINISJEFER); }
    this.vis(null);
  },
  kom(C) {
    const r = C.r, type = this.rom[r.id], s = freeSpot(r.x + r.w / 2, r.z + r.h / 2, 3);
    const e = spawnEnemy(type, s.x, s.z, false, G.depth); C.mini = e;
    if (D3.on) D3.morke(1.1, .06); Sound.play('boss', .6, 1.4); R.shake(.3);
    stampBig('MINISJEF', ENEMIES[type].name); setTimeout(() => { if (e.alive) FX.bubble(e, pick(LINES[type]), 2.2); }, 700);
    return e;
  },
  vis(e) {
    const bar = $('miniBar'); if (!bar) return;
    if (!e) { bar.classList.add('hidden'); this.sist = null; return; }
    if (this.sist !== e) { this.sist = e; $('miniName').textContent = e.mesterNavn || ENEMIES[e.type].name; $('miniTitle').textContent = ENEMIES[e.type].tittel || 'Minisjef'; bar.classList.remove('hidden'); }
    $('miniFill').style.width = clamp(e.hp / e.max, 0, 1) * 100 + '%';
  },
  tick() {
    const e = G.enemies.find(x => x.mini && x.alive);
    this.vis(e && !(G.boss && G.boss.alive) ? e : null);
  },
  /* belønning: alltid et preparatglass, et hjerte og en stempling */
  dod(e) {
    Items.spawnPedestal(e.x, e.z, Items.pickFrom('kabinett')); dropPickup(e.x, e.z, 'heart');
    stampBig('BEHANDLET', ENEMIES[e.type].name); slowMo(.6, .3); R.shake(.5);
    G.meta.minisjefer = (G.meta.minisjefer || 0) + 1; saveMeta();
  }
};
{ const _ct = combatTick; combatTick = function (dt) {
  const C = G.combat;
  if (C && !C.boss && !C.mini && Mini.rom[C.r.id] && C.t - dt <= 0) {
    const waves = C.r.waves || [], alive = G.enemies.filter(e => e.alive).length;
    if (C.wave >= waves.length - 1 && alive === 0) { Mini.kom(C); C.t = 1.2; return; }
  }
  _ct(dt);
}; }
{ const _d = enemyDie; enemyDie = function (e, src) { _d(e, src); if (e.mini) try { Mini.dod(e); } catch (err) { } }; }
