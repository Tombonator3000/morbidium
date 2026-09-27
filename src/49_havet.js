/* ============================================================
   HAVET UNDER HUSET  -  tentakler og det som bor i sluket
   Avløpsarmen, Kapellanen, Draugpleieren og Kraken, og det de trenger (dukket under vann,
   tentakkelbånd). Spor C fyller fila i runde 5.
   ============================================================ */

/* ---------- grunnarbeid: under vann (e.dukket) ----------
   En fiende eller sjef med e.dukket ligger under vann og kan verken treffes eller siktes på. Nøkken (37_utefiender.js) var først,
   og Avløpsarmen og Krakens dykk skal bruke det samme. Fila ligger etter 39_kombo og 34_blod, så slag i vannet teller ikke i treffkjeden
   og gir ikke blod. Nærkampslaget hopper over dem (20_actors.js), skudd og kast går over dem (Items.updateShots og updateProjectiles),
   og lykta gir dem ingen skygge (Dybde.kastere, 40_dybde.js). */
{ const _h = hurt; hurt = function (e, dmg, src) { if (e && e.dukket && e.kind !== 'player') return 0; return _h(e, dmg, src); }; }
// siktet på berøring og håndkontroll, evnene, duene og lynet i treffkjeden finner ikke den som ligger under
{ const _ne = nearestEnemy; nearestEnemy = function (x, z, maxD, filter) { return _ne(x, z, maxD, e => !e.dukket && (!filter || filter(e))); }; }
// strøm i pytten, skli og snubletråd biter ikke under overflaten. Før røpet ZAPP og SKLI! over tomt vann hvor Nøkken lå
{ const _ge = groundEffects; groundEffects = function (e, dt, speed) { if (e && e.dukket && e.kind !== 'player') return; return _ge(e, dt, speed); }; }
{ const _es = enemySlip; enemySlip = function (e) { if (e && e.dukket) return; return _es(e); }; }

/* ---------- trekk Journalen ikke låner (laanbareTrekk i 31_sjefpulje.js) ----------
   Stormen flyttes bare av hjortens egen tick, så hos Journalen ble den et varsel på elleve ruter, et brøl og ingenting mer */
SJEF_DATA.hjort.egne = ['storm'];

/* ---------- statusord ----------
   GREPET, SNØRT, SPENT FAST, HEKTET, DØPT og de andre ordene som sier hva som skjedde med den som ble rammet.
   Samme ord over samme figur vises høyst én gang per cd sekunder, og et nytt ord mens et annet ennå står, løftes over det
   (omtrent en tekstlinje per ord), så de ikke legger seg oppå hverandre som «IKKBONKG». Gir true når ordet ble vist. */
function statusOrd(e, ord, cd = 1.2) {
  if (!e) return false;
  const S = e.statusT || (e.statusT = {}), t = G.time, sist = S[ord];
  if (sist !== undefined && t >= sist && t - sist < cd) return false;
  let over = 0; for (const k in S) if (k !== ord && t >= S[k] && t - S[k] < .6) over++;
  S[ord] = t; numText(e.x, e.z, ord, 'crit', (e.kind === 'boss' ? 3.4 : 2.4) + Math.min(2, over));
  return true;
}

/* ============================================================
   AVLØPSARMEN OG KAPELLANEN
   Det som sover under huset rekker opp gjennom de samme rørene som Morbidium stiger i (41_historie.js).
   - Avløpsarmen ligger under risten (e.dukket), bobler og gurgler, og kommer opp når pasienten er nær eller etter tre sekunder.
     Oppe i fire og et halvt sekund feier, slår og griper den, og så dykker den og kommer opp igjen ved risten nærmest pasienten.
     Den er aldri lenge under mens pasienten står nær, og det er aldri mer enn tre av dem (flere blir yngel).
   - Kapellanen er en knehøy hjelpeprest med blekksprutkuppel og tentakkelskjegg over prestekragen. Han preker for de andre
     (raskere og ivrigere i seks sekunder), døper deg i sjøvann og kaller armer opp av avløpet. Slå ham midt i preken.
   Tegningene kan byttes med bilder fra ChatGPT (avlopsarm_tupp, hode_kapellan_f, kropp_kapellan_s, vaapen_avgud ...).
   ============================================================ */
Object.assign(Sound.lib, {
  // gurgling i risten: lav støy som synker, og en tone som vugger
  sluk: [{ n: 1, d: .55, f0: 520, f1: 160, ft: 'bandpass', v: .3 }, { w: 'sine', f: 130, d: .45, pd: .45, v: .18, vib: [11, 70] }],
  rive: [{ n: 1, d: .38, f0: 2600, f1: 700, ft: 'bandpass', v: .4 }, { n: 1, d: .2, f0: 900, f1: 300, ft: 'lowpass', v: .3, at: .08 }],
  // salme nummer null: et dypt orgel i moll med kirkeklang
  salme: [{ w: 'triangle', f: 98, d: 1.8, v: .1, atk: .3, rv: .6 }, { w: 'sine', f: 147, d: 1.7, v: .08, atk: .35, rv: .6 }, { w: 'sine', f: 233, d: 1.6, v: .06, atk: .4, rv: .7 }, { n: 1, d: 1.2, f0: 1800, f1: 900, ft: 'bandpass', v: .04, at: .2 }]
});
Object.assign(LYD_KART, {
  sluk: { s: [['sluk', .6]], syn: .25 },
  rive: { s: [['rive', .65]], syn: .2 },
  salme: { s: [['ins_orgel', .32, .5, { rv: .6 }], ['hvisk', .3, .8, { rv: .5 }]], syn: .3 }
});
Object.assign(FIENDESTEMME, { avlopsarm: ['sluk', 1], kapellan: ['hvisk', .8] });

Object.assign(ENEMIES, {
  avlopsarm: { name: 'Avløpsarmen', hp: 30, speed: 0, r: .45, dmg: 11, xp: 12, teeth: [1, 3], morb: 1, bubbleH: 2.9, blood: 0x1e2430, rooted: true, skygge: .55 },
  kapellan: { name: 'Kapellanen', hp: 26, speed: 2.0, r: .38, dmg: 9, xp: 16, teeth: [3, 6], morb: 2, bubbleH: 2.5, weapon: 'avgud', blood: 0x2a1a44 }
});
Object.assign(LINES, {
  avlopsarm: ['Blubb.', '...', 'Blubb blubb.'],
  kapellan: ['Kjell, rett kappen. Vi har besøk.', 'Kollekten går rundt. Gi tenner.', 'Har De tenkt på dåp? Vi har sjøvann.', 'Søndagsskolen er i kjelleren. Ta med håndkle.',
    'Jeg var kapellan i Bodø. Så hørte jeg havet.', 'Salmeboka har ingen sider. Vi synger etter gehør.', 'Den som sover, har ikke glemt Dem.', 'Ungdomsarbeid er et kall. Kjell, ikke bit.']
});
Object.assign(DEATH_CAUSES, {
  avlopsarm: ['Dratt ned i avløpet. Rørleggeren er varslet.', 'Grepet av en arm uten eier. Eieren sover.', 'Druknet i fire centimeter vann og én arm.'],
  kapellan: ['Døpt i sjøvann, grundig og med hodet først.', 'Hørte hele preken. Det var for mye.', 'Salme nummer null, alle vers.']
});
DEPTH_ENEMIES[3].push('avlopsarm', 'avlopsarm');
DEPTH_ENEMIES[4].push('avlopsarm', 'kapellan');
DEPTH_ENEMIES[6].push('avlopsarm', 'avlopsarm', 'kapellan');
Object.assign(MESTER_TITTEL, { avlopsarm: 'Armen', kapellan: 'Pastor' });
PA[3].push('Pasienter bes ikke holde i hånden til det som stikker opp av avløpet. Det er ikke en hånd.');
PA[6].push('Gudstjenesten i kjelleren begynner når vannet når knærne. Kapellanen ber om stillhet og tenner.');

/* ============================================================
   TENTAKKELEN: delt med Kraken
   tentakelLinje gir n punkter fra roten (x0, y0) og oppover. Vinkelen fra loddrett er lean ved roten og vokser mot tuppen,
   krok krummer tuppen (positiv mot siden figuren ser), og en bølge går fra roten ut mot tuppen, så armen aldri står helt stille.
   tentakel tegner den i to strekbånd: fire strøk som smalner av (det nederste i den våte fargen), en lys buk og en glans
   inni omrisset, og bleke sugekopper på buksiden i båndet foran.
   ============================================================ */
const HAV = { arm: '#58707e', armV: '#3e5260', buk: '#b89ca0', glans: '#9cb8c2', sug: '#e0b0a8', sugI: '#8a5a5e', vann: '#2e5262', skum: '#e8f2f0', oye: '#f0d850',
  sten: '#6a8a6a', stenM: '#3a5a3a', stenL: '#94b094', kjole: '#262230', kjoleL: '#40384c', krage: '#f6f2e8', kuppel: '#8a7294', kuppelM: '#5e4a6e', kuppelL: '#b8a2c4' };
function tentakelLinje(x0, y0, L, o = {}, n = 11) {
  const lean = o.lean || 0, krok = o.krok || 0, amp = o.amp ?? .16, t = o.t || 0, fart = o.fart || 2.4, sk = o.skjelv || 0, fase = o.fase || 0, pts = [], vinkel = [];
  let x = x0, y = y0; const ds = L / (n - 1);
  for (let i = 0; i < n; i++) {
    const s = i / (n - 1), a = lean * Math.pow(s, 1.15) + krok * Math.pow(s, 2.2) + amp * Math.sin(t * fart - s * 5.5 + fase) * (.25 + s) + sk * Math.sin(t * 31 + s * 9 + fase) * s;
    if (i) { x += Math.sin(a) * ds; y += Math.cos(a) * ds; }
    pts.push([x, y]); vinkel.push(a);
  }
  pts.vinkel = vinkel; return pts;
}
function tentakel(bak, foran, pts, o = {}) {
  const n = pts.length, w0 = o.w || .46, z = o.z || 0, zf = o.zf ?? .01, W = s => w0 * (1 - .6 * s), side = o.side || 1;
  const nrm = i => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; return [dy / L * side, -dx / L * side]; };
  const forskj = (i, k) => { const [nx, ny] = nrm(i), w = W(i / (n - 1)); return [pts[i][0] + nx * w * k, pts[i][1] + ny * w * k]; };
  for (let k = 0; k < 4; k++) { const a = Math.round(k * (n - 1) / 4), b = Math.round((k + 1) * (n - 1) / 4); bak.add(pts.slice(a, b + 1), W(a / (n - 1)), k ? (o.col || HAV.arm) : (o.colV || HAV.armV), z); }
  // buken på sugesiden og glansen på ryggen, inni omrisset (blekket deres ligger under fyllet til strøkene over)
  const buk = [], glans = []; for (let i = 1; i <= Math.min(n - 2, 5); i++) buk.push(forskj(i, .2)); for (let i = 2; i <= Math.min(n - 3, 5); i++) glans.push(forskj(i, -.24));
  bak.add(buk, w0 * .3, o.buk || HAV.buk, z); bak.add(glans, w0 * .1, o.glans || HAV.glans, z);
  if (!foran) return;
  for (let i = 2; i <= n - 3; i++) { const s = i / (n - 1), r = W(s) * .17, [x, y] = forskj(i, .34); foran.circle(x, y, r, o.sug || HAV.sug, z + zf); if (r > .045) foran.circle(x, y, r * .42, HAV.sugI, z + zf + .001); }
}
/* håndbokportrettet: den samme armen på lerretet, fra risten opp til tuppen med øyet (delen tegnes over, i x .3 og y 2) */
function tentakelPortrett(g, S, cx, cy, pts, w0) {
  const n = pts.length, W = s => w0 * (1 - .6 * s), P = p => [cx + p[0] * S, cy - p[1] * S];
  const strok = (a, b, w, col) => { g.beginPath(); for (let i = a; i <= b; i++) { const [x, y] = P(pts[i]); i === a ? g.moveTo(x, y) : g.lineTo(x, y); } g.lineWidth = w * S; g.strokeStyle = col; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); };
  for (let pass = 0; pass < 2; pass++) for (let k = 0; k < 4; k++) { const a = Math.round(k * (n - 1) / 4), b = Math.round((k + 1) * (n - 1) / 4), w = W(a / (n - 1)); strok(a, b, pass ? w : w + .07, pass ? (k ? HAV.arm : HAV.armV) : INK); }
  for (let i = 2; i <= n - 3; i++) {
    const s = i / (n - 1), a = pts[i - 1], b = pts[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, w = W(s), x = pts[i][0] + dy / L * w * .34, y = pts[i][1] - dx / L * w * .34, [px, py] = P([x, y]);
    for (const [r, c] of [[w * .17 + .03, INK], [w * .17, HAV.sug], [w * .07, HAV.sugI]]) { g.beginPath(); g.arc(px, py, r * S, 0, TAU); g.fillStyle = c; g.fill(); }
  }
}

/* ---------- Avløpsarmen: tuppen med det ene lokkløse øyet ---------- */
const armTupp = () => Art.part('avlopsarm_tupp', .7, .8, .35, .08, g => {
  // en kølle ytterst på armen, som på en blekksprut, med tuppen krøllet innover
  A.cel(g, A.blob([[-.1, .06], [-.15, -.1], [-.2, -.28], [-.17, -.45], [-.08, -.58], [.04, -.65], [.14, -.62], [.16, -.53], [.09, -.51], [.04, -.55], [.14, -.45], [.2, -.28], [.16, -.1], [.1, .06]]), HAV.arm, { sk: .7 });
  A.curve(g, [-.1, -.1], [-.14, -.3], [-.08, -.48], .025, HAV.glans);
  for (const [x, y, r] of [[.11, -.14, .03], [.14, -.24, .032], [.14, -.36, .028], [.1, -.46, .022]]) { A.flat(g, A.ell(x, y, r, r), HAV.sug, .018); A.dot(g, x, y, r * .42, HAV.sugI); }
  // øyet: gult, uten lokk, med en vannrett pupill som en geit, og røde årer
  for (const [a, b] of [[[-.11, -.24], [-.06, -.27]], [[-.1, -.37], [-.05, -.33]], [[.05, -.2], [.02, -.25]]]) A.line(g, [a, b], .012, '#a83a3a');
  A.flat(g, A.ell(-.01, -.3, .11, .095), HAV.oye, .03);
  A.flat(g, A.ell(-.01, -.3, .06, .052), '#d8a830', 0);
  A.flat(g, A.rr(-.085, -.318, .15, .036, .016), INK, 0);
  A.dot(g, .025, -.335, .018, '#ffffff'); A.dot(g, -.045, -.27, .008, 'rgba(255,255,255,.7)');
});
const ARM_HVILE = { h: 1, lean: .05, krok: .6, L: 1.75, amp: .2, skjelv: 0, rate: 5 };
LAGDUKKE.avlopsarm = {
  scale: 1, skygge: .55,
  deler: [{ P: armTupp, x: .3, y: 2.0, z: .03 }],
  /* armen bygges hvert bilde: målene (armMal) settes av oppførselen, og armen glir mot dem. Høyden fjærer, så armen skyter opp og vipper over */
  lemmer(dd, S) {
    const A0 = dd.arm || (dd.arm = { h: 0, hv: 0, lean: 0, krok: 2, L: 1.7, amp: .17, skjelv: 0, t: S.t, fase: Math.random() * 6 }), M = dd.armMal || ARM_HVILE;
    const dt = Math.min(.05, Math.max(0, S.t - A0.t)); A0.t = S.t;
    const k = 1 - Math.exp(-(M.rate || 5) * dt);
    for (const q of ['lean', 'krok', 'L', 'amp', 'skjelv']) A0[q] += ((M[q] ?? ARM_HVILE[q]) - A0[q]) * k;
    A0.hv += ((M.h ?? 1) - A0.h) * 110 * dt - A0.hv * 12 * dt; A0.h = clamp(A0.h + A0.hv * dt, 0, 1.2);
    const h = A0.h, pts = tentakelLinje(0, .02, A0.L * Math.max(.05, h), { lean: A0.lean, krok: A0.krok, amp: A0.amp, t: S.t, skjelv: A0.skjelv, fase: A0.fase });
    tentakel(dd.back, dd.front, pts, { w: .5 * Math.min(1, .45 + h * .55) });
    const tupp = dd.deler[0].m, e = pts[pts.length - 1], sk = clamp(h, .02, 1.05);
    tupp.position.set(e[0], e[1] - .04 * sk, .03); tupp.rotation.z = -pts.vinkel[pts.length - 1]; tupp.scale.set(sk, sk, 1);
    // vannet rundt roten, eller murpuss og gulvbord der armen kom gjennom veggen eller gulvet
    const sted = dd.sted || 'sluk', F = dd.front, b = Math.sin(S.t * 3) * .015;
    if (sted !== 'vegg') { F.add([[-.44, .04 + b], [-.2, .08], [.2, .08 - b], [.44, .04]], .08, HAV.vann, .02); for (const [x, y, r, f] of [[-.32, .1, .045, 0], [.3, .12, .05, 2], [-.1, .15, .035, 4], [.14, .16, .03, 1]]) F.circle(x, y + Math.sin(S.t * 4 + f) * .02, r, HAV.skum, .021); }
    if (sted !== 'sluk') for (const [x, y, r, c] of [[-.36, .06, .06, '#8a8478'], [.34, .05, .05, '#9a9282'], [-.18, .03, .04, '#7a7468'], [.22, .02, .035, '#a89a80']]) F.circle(x, y, r, c, .022);
  },
  portrett(g, S, cx, cy, lag) {
    if (lag !== 'bak') return;
    // risten og vannet
    g.save(); g.translate(cx, cy - .06 * S); g.scale(1, .32);
    for (const [r, c] of [[.5, INK], [.46, '#3a3632'], [.36, HAV.vann]]) { g.beginPath(); g.arc(0, 0, r * S, 0, TAU); g.fillStyle = c; g.fill(); }
    g.restore();
    const pts = tentakelLinje(0, .06, 2, { lean: 1.2, krok: -1.25, amp: .12, t: 1.1 }), e = pts[pts.length - 1];
    for (let i = 0; i < pts.length; i++) { const s = i / (pts.length - 1); pts[i][0] += (.3 - e[0]) * s; pts[i][1] = .06 + (pts[i][1] - .06) * (1.96 - .06) / (e[1] - .06); }
    tentakelPortrett(g, S, cx, cy, pts, .46);
  }
};
RIG.avlopsarm = { blob: true, scale: 1 };

/* ---------- Kapellanen: knehøy, med blekksprutkuppel, tentakkelskjegg over prestekragen og en avgud i kleberstein ---------- */
RIG.kapellan = { hip: .36, hipW: .08, neck: .5, shW: .2, shY: .44, armW: .1, legW: .08, handR: .07, arm: HAV.kjole, leg: HAV.kjole, hand: '#b8aac4', shoe: 'stovel', scale: .72, headLag: 1.2 };
// ett skjeggstrå: tykk blekkstrek, så fargen, en krøll ytterst og bleke sugekopper
const skjegg = (g, a, c, b, w = .055, krok = 1) => {
  A.curve(g, a, c, b, w + .035); A.curve(g, a, c, b, w, HAV.kuppel);
  A.curve(g, b, [b[0] + .05 * krok, b[1] + .04], [b[0] + .05 * krok, b[1] - .02], w * .6 + .03); A.curve(g, b, [b[0] + .05 * krok, b[1] + .04], [b[0] + .05 * krok, b[1] - .02], w * .6, HAV.kuppel);
  for (let i = 1; i <= 2; i++) { const t = i / 3, u = 1 - t, x = u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], y = u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]; A.dot(g, x + .014 * krok, y, .013, HAV.sug); }
};
const flekker = (g, pts) => { for (const [x, y, r] of pts) A.flat(g, A.ell(x, y, r, r * .8), HAV.kuppelM, 0); };
MONSTER_ART.kapellan = {
  box: { hode: [1.0, 1.45, .5, .42], kropp: [1.2, 1.3, .6, .44] },
  hode: v => g => {
    const K = HAV.kuppel;
    if (v === 'b') {
      for (const s of [-1, 1]) skjegg(g, [s * .12, -.2], [s * .2, -.02], [s * .2, .12], .05, s);
      A.cel(g, A.blob([[-.26, -.2], [-.32, -.44], [-.29, -.68], [-.18, -.86], [0, -.94], [.18, -.86], [.29, -.68], [.32, -.44], [.26, -.2], [0, -.14]]), K, { sk: .72 });
      flekker(g, [[-.12, -.6, .05], [.1, -.44, .06], [.14, -.72, .035], [-.16, -.34, .04], [.02, -.3, .03]]);
      A.cel(g, A.ell(0, -.9, .13, .055), '#1a1820', { lw: .025, hi: false });
      return;
    }
    if (v === 's') {
      // kuppelen henger bakover som en våt sekk
      A.cel(g, A.blob([[.18, -.18], [.24, -.36], [.16, -.58], [-.02, -.8], [-.24, -.9], [-.36, -.78], [-.32, -.56], [-.2, -.34], [-.1, -.18]]), K, { sk: .72 });
      flekker(g, [[-.2, -.72, .05], [-.06, -.62, .04], [-.24, -.52, .03]]);
      A.cel(g, A.ell(-.2, -.86, .11, .045, -.5), '#1a1820', { lw: .022, hi: false });
      A.cel(g, A.blob([[.02, -.44], [.12, -.47], [.2, -.43], [.18, -.36], [.06, -.36]]), HAV.kuppelM, { lw: .02, hi: false }); // tungt øyelokk
      A.flat(g, A.ell(.13, -.37, .07, .06), HAV.oye, .025); A.flat(g, A.rr(.08, -.38, .1, .024, .01), INK, 0); A.dot(g, .16, -.39, .012, '#ffffff');
      for (const [a, c, b, kk] of [[[.12, -.24], [.24, -.1], [.22, .08], 1], [[.04, -.22], [.12, -.02], [.08, .14], 1], [[.18, -.26], [.3, -.18], [.33, -.02], -1]]) skjegg(g, a, c, b, .05, kk);
      return;
    }
    // forfra: skjegget først (det henger bak kuppelens underkant), så kuppelen og det triste ansiktet
    const str = [[[-.14, -.24], [-.21, -.06], [-.23, .1], -1], [[-.07, -.22], [-.11, 0], [-.09, .17], -1], [[0, -.21], [.02, .02], [0, .2], 1], [[.07, -.22], [.11, 0], [.09, .16], 1], [[.14, -.24], [.21, -.06], [.24, .1], 1]];
    for (const [a, c, b, kk] of str) skjegg(g, a, c, b, .052, kk);
    A.cel(g, A.blob([[-.24, -.2], [-.31, -.42], [-.3, -.66], [-.2, -.85], [-.03, -.94], [.13, -.91], [.25, -.78], [.32, -.58], [.31, -.38], [.24, -.2], [.1, -.15], [-.1, -.15]]), K, { sk: .72 });
    flekker(g, [[-.14, -.74, .05], [.12, -.68, .04], [-.02, -.84, .03], [.2, -.5, .03], [-.22, -.5, .035]]);
    for (const [x, y] of [[-.06, -.62], [.05, -.78], [.18, -.62], [-.2, -.62]]) A.dot(g, x, y, .012, HAV.kuppelL);
    A.cel(g, A.ell(.01, -.9, .13, .05), '#1a1820', { lw: .025, hi: false }); A.dot(g, .01, -.95, .02, '#1a1820'); // kalotten
    // store, triste øyne med vannrett pupill og tunge lokk
    for (const s of [-1, 1]) {
      const x = s * .12;
      A.flat(g, A.ell(x, -.4, .085, .075), HAV.oye, .026); A.flat(g, A.ell(x, -.4, .045, .04), '#d8a830', 0);
      A.flat(g, A.rr(x - .065, -.416, .13, .034, .014), INK, 0); A.dot(g, x + .03, -.43, .014, '#ffffff');
      A.cel(g, A.blob([[x - .1, -.43], [x - .04, -.49], [x + .06, -.49], [x + .1, -.44], [x + .02, -.45]]), HAV.kuppelM, { lw: .02, hi: false });
      A.curve(g, [x - s * .09, -.5], [x, -.56], [x + s * .08, -.54], .02, '#3a2a48'); // brynene går opp på midten: bekymret
      A.curve(g, [x - .06, -.31], [x, -.29], [x + .06, -.31], .012, HAV.kuppelM);
    }
    A.flat(g, A.ell(-.2, -.3, .04, .025), 'rgba(230,140,170,.35)', 0); A.flat(g, A.ell(.2, -.3, .04, .025), 'rgba(230,140,170,.35)', 0);
  },
  kropp: v => g => {
    const top = -.5, Kj = HAV.kjole, KL = HAV.kjoleL;
    // prestekragen: en hvit møllesteinskrage med bølgete, plissert kant rundt halsen, bred nok til å stikke fram på begge sider av skjegget
    const krage = (cx, cy, rx, ry) => {
      const n = 24, kant = []; for (let i = 0; i < n; i++) { const a = i / n * TAU, k = i % 2 ? .9 : 1; kant.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
      A.cel(g, A.blob(kant), HAV.krage, { lw: .032, sk: .86 });
      for (let i = 0; i < n; i += 2) { const a = (i + 1) / n * TAU, c = Math.cos(a), s = Math.sin(a); A.line(g, [[cx + c * rx * .36, cy + s * ry * .36], [cx + c * rx * .86, cy + s * ry * .86]], .012, '#a8a090'); }
      A.flat(g, A.ell(cx, cy - ry * .15, rx * .32, ry * .32), '#d8d0c0', .015);
    };
    if (v === 'b') {
      A.cel(g, A.blob([[-.2, top + .06], [-.26, top + .22], [-.3, 0], [-.38, .34], [0, .37], [.38, .34], [.3, 0], [.26, top + .22], [.2, top + .06], [0, top]]), Kj, { line: '#0e0a14', sk: .75 });
      A.line(g, [[0, top + .1], [0, .34]], .014, KL); A.curve(g, [-.2, .02], [-.24, .2], [-.3, .32], .012, KL); A.curve(g, [.18, .04], [.22, .2], [.28, .32], .012, KL);
      A.line(g, [[-.18, top + .12], [.2, .0]], .03, '#5a3a20');
      krage(0, top + .03, .4, .14);
      return;
    }
    if (v === 's') {
      A.cel(g, A.blob([[-.14, top + .06], [-.2, top + .24], [-.22, 0], [-.3, .34], [.28, .36], [.2, 0], [.16, top + .22], [.1, top + .06]]), Kj, { line: '#0e0a14', sk: .75 });
      for (let i = 0; i < 5; i++) A.dot(g, .15, top + .16 + i * .09, .016, KL);
      A.line(g, [[.08, top + .12], [-.12, .02]], .03, '#5a3a20');
      A.cel(g, A.rr(-.26, -.04, .14, .13, .02), '#7a4a28', { lw: .022, hi: false }); A.line(g, [[-.22, -.01], [-.16, -.01]], .016, '#d4a83a'); // kollektbøssa
      krage(0, top + .03, .32, .11);
      return;
    }
    A.cel(g, A.blob([[-.2, top + .06], [-.26, top + .22], [-.3, 0], [-.38, .34], [-.2, .37], [0, .35], [.2, .37], [.38, .34], [.3, 0], [.26, top + .22], [.2, top + .06], [0, top]]), Kj, { line: '#0e0a14', sk: .75 });
    // for lang kjole: den ligger i folder over skoene
    A.curve(g, [-.14, .02], [-.2, .2], [-.24, .34], .014, KL); A.curve(g, [.14, .04], [.2, .2], [.26, .33], .014, KL); A.curve(g, [-.3, .33], [-.1, .3], [.1, .34], .012, KL);
    for (let i = 0; i < 6; i++) A.dot(g, 0, top + .16 + i * .075, .017, KL);
    // medaljongen: en liten rist i sølv i stedet for et kors
    A.flat(g, A.ell(.1, top + .24, .055, .055), '#a8acb4', .022); for (const dx of [-.025, 0, .025]) A.line(g, [[.1 + dx, top + .2], [.1 + dx, top + .28]], .01, '#4a4e56');
    // kollektbøssa i en reim over brystet
    A.line(g, [[.18, top + .12], [-.18, -.02]], .03, '#5a3a20');
    A.cel(g, A.rr(-.3, -.06, .16, .14, .02), '#7a4a28', { lw: .024, hi: false }); A.line(g, [[-.26, -.03], [-.18, -.03]], .016, '#d4a83a'); A.flat(g, A.rr(-.3, .04, .16, .025, .005), '#d4a83a', .01);
    krage(0, top + .03, .45, .15);
  }
};
WEAPON_ART.avgud = [.5, .8, .25, .1];
{ const _dw = drawWeapon; drawWeapon = id => id !== 'avgud' ? _dw(id) : g => {
  // den sovende, nr. 0: en liten, tykk figur i grønn kleberstein med blekkspruthode og foldede vinger, på en sokkel
  const S = HAV.sten, M = HAV.stenM;
  for (const s of [-1, 1]) A.cel(g, A.blob([[s * .08, -.34], [s * .2, -.56], [s * .22, -.44], [s * .16, -.3]]), Col.dark(S, .8), { line: '#1a2a1a', lw: .025, hi: false });
  A.cel(g, A.rr(-.15, -.13, .3, .12, .02), '#5a7a5a', { line: '#1a2a1a', lw: .028 });
  A.flat(g, A.ell(0, -.07, .022, .032), null, .012, M);
  A.cel(g, A.blob([[-.14, -.13], [-.16, -.26], [-.1, -.36], [.1, -.36], [.16, -.26], [.14, -.13]]), S, { line: '#1a2a1a', lw: .028, sk: .75 });
  for (const s of [-1, 1]) A.cel(g, A.ell(s * .07, -.15, .05, .03), S, { line: '#1a2a1a', lw: .018, hi: false }); // knærne
  A.cel(g, A.ell(0, -.46, .1, .12), S, { line: '#1a2a1a', lw: .026, sk: .75 });
  for (const s of [-1, 1]) { A.dot(g, s * .04, -.44, .016, '#1a2a1a'); }
  for (let i = 0; i < 4; i++) { const x = -.045 + i * .03; A.curve(g, [x, -.38], [x + (i % 2 ? .02 : -.02), -.32], [x, -.26], .02, M); }
  for (const [x, y] of [[-.06, -.2], [.08, -.28], [-.02, -.52], [.05, -.1]]) A.dot(g, x, y, .01, HAV.stenL);
  A.line(g, [[-.07, -.52], [-.05, -.4]], .014, 'rgba(255,255,255,.35)');
}; }

/* ============================================================
   OPPFØRSEL
   ============================================================ */
Object.assign(Grotesk.keep, { avlopsarm: 0, kapellan: 6 });
Object.assign(Grotesk.retreat, { kapellan: 1 });
Object.assign(Grotesk.talk, { kapellan: 1 });
Object.assign(Grotesk.hold, { kapellan: 1 });
const Havet = {
  MAKS_ARMER: 3, OPPE: 4.5, NAER: 5.5, flereArmer: false,
  PREKEN: ['Kjære menighet. Kjære deg.', 'Salme nummer null, alle vers.', 'Den som sover, drømmer oss alle.', 'La oss be. Nedover.', 'Styrmann G. J. så en by stige av havet ved Røst. Amen.', 'Salige er de våte, for de skal arve avløpet.', 'Syng med, Kjell. Nei, lavere.'],
  armer() { return G.enemies.filter(e => e.alive && e.type === 'avlopsarm').length; },
  /* en rist uten arm i: ingen annen levende arm har den som hjem */
  ledig(p, selv) { return !G.enemies.some(e => e !== selv && e.alive && e.type === 'avlopsarm' && e.hjem && d2(e.hjem.x, e.hjem.z, p.x, p.z) < .36); },
  slukNaer(x, z, maks, selv, rom, sikt) {
    let best = null, bd = maks * maks;
    for (const p of G.props) if (p.kind === 'drain' && (rom === undefined || p.room === rom) && this.ledig(p, selv) && (!sikt || los(x, z, p.x, p.z))) { const d = d2(p.x, p.z, x, z); if (d < bd) { bd = d; best = p; } }
    return best;
  },
  /* armen finner sitt sted: risten nærmest i rommet, ellers en rute under en høy vegg (med en sprekk), ellers slår den hull i gulvet.
     Aldri en rist i et annet rom: dørene er stengt under kampen, og en arm bak veggen kan ikke nås (rommet blir aldri ryddet) */
  plasser(e) {
    const rom = roomAt(e.x, e.z), s = rom >= 0 ? this.slukNaer(e.x, e.z, 14, e, rom) : this.slukNaer(e.x, e.z, 5, e, undefined, true);
    if (s) { e.x = s.x; e.z = s.z; e.hjem = { x: s.x, z: s.z }; e.sted = 'sluk'; }
    else {
      const v = this.vegg(e, rom);
      if (v) { e.x = v.x; e.z = v.z; e.hjem = v; e.sted = 'vegg'; try { const g = propSprite(null, v.x, v.vz + .03, { P: propArt({ k: 'sprekk' }), shadow: false }); R.level.add(g); e.mesh = g; } catch (err) { } }
      else {
        let f = { x: e.x, z: e.z }; // et sted på gulvet minst en rute fra de andre armene
        ut: for (let r = 0; r <= 3; r += .5) for (let k = 0; k < 12; k++) { const x = e.x + Math.cos(k / 12 * TAU) * r, z = e.z + Math.sin(k / 12 * TAU) * r; if (!solid(Math.floor(x), Math.floor(z)) && !G.enemies.some(o => o !== e && o.alive && o.type === 'avlopsarm' && o.hjem && d2(o.hjem.x, o.hjem.z, x, z) < 1)) { f = { x, z }; break ut; } if (!r) break; }
        // står den i et tjern fra før, slår den ikke nytt hull (addPuddle ville slått dem sammen, og tjernet ble borte da armen døde)
        e.x = f.x; e.z = f.z; e.hjem = f; e.sted = 'gulv'; e.hull = G.puddles.some(p => p.kind === 'tjern' && d2(p.x, p.z, f.x, f.z) < p.r * p.r) ? null : addPuddle(e.x, e.z, 'tjern', .8, 1e9);
      }
    }
    e.doll.sted = e.sted; e.doll.root.position.set(e.x, 0, e.z);
  },
  vegg(e, rom) {
    const F = G.F, W = F.W, wh = typeof Paint === 'object' && Paint.wallH; if (!wh || rom < 0) return null;
    let best = null, bd = 49;
    for (let z = 1; z < F.H - 1; z++) for (let x = 1; x < W - 1; x++) {
      const i = z * W + x; if (F.roomId[i] !== rom || solid(x, z) || !(wh[i - W] > 2) || (typeof D3 === 'object' && D3.inneVegg && !D3.inneVegg(i - W))) continue;
      const px = x + .5, pz = z + .45, d = d2(px, pz, e.x, e.z); if (d >= bd || !this.ledig({ x: px, z: pz }, e)) continue; bd = d; best = { x: px, z: pz, vz: z };
    }
    return best;
  },
  /* etter et dykk: opp igjen ved risten nærmest pasienten, i samme rom eller i nærheten */
  flytt(e) {
    if (e.sted !== 'sluk') return; const P = G.player, rom = roomAt(e.hjem.x, e.hjem.z);
    let best = null, bd = 1e9;
    for (const p of G.props) if (p.kind === 'drain' && (rom >= 0 ? p.room === rom : d2(p.x, p.z, e.x, e.z) < 100) && this.ledig(p, e)) { const d = d2(p.x, p.z, P.x, P.z); if (d < bd) { bd = d; best = p; } }
    if (best) { e.x = best.x; e.z = best.z; e.hjem = { x: best.x, z: best.z }; }
  },
  start(e) {
    if (!e.hjem) this.plasser(e);
    e.fase0 = Math.random() * 6; e.faseT = 0; e.underT = 0; e.boble = 0; e.gurgle = rnd(.5, 2);
    if (e.kalt) { e.fase = 'opp'; e.dukket = false; e.oppHp = e.hp; e.doll.root.visible = true; }
    else { e.fase = 'under'; e.dukket = true; e.doll.root.visible = false; }
  },
  /* treff fra havet i en form: allierte og pasienten. Gir true når pasienten tok skade */
  treff(shape, o, dmg, src) {
    const P = G.player, t = { shape, o }; let traff = false;
    for (const a of G.allies) if (a && a.alive && inShape(t, a.x, a.z, (a.r || .4) * .7)) hurt(a, dmg, src);
    if (P && P.alive && inShape(t, P.x, P.z, P.r * .7) && hurt(P, dmg, src) > 0) traff = true;
    return traff;
  },
  opp(e) {
    e.fase = 'reiser'; e.faseT = 0; const o = { x: e.x, z: e.z, r: .9, color: 0x2a6a7a, type: 'vann' };
    addTele('circle', o, .6, () => { if (this.treff('circle', o, e.dmg * .6, { type: 'avlopsarm', x: o.x, z: o.z, kb: 5 })) statusOrd(G.player, 'SPRUT'); }, e);
    Lydbank.ved('sluk', e.x, e.z, { vol: .6, pitch: .8, maks: 12 });
  },
  dykk(e) { e.fase = 'dykker'; e.faseT = 0; e.anim = null; Sound.play('sluk', .5, 1.1); R.ripple(e.x, e.z); Particles.spawn(e.x, .3, e.z, 5, 0x9ad0e0, { speed: 2, up: 3, life: .4 }); },
  /* feiing: armen trekkes bakover og slår over alt foran seg */
  feie(e, toT) {
    const tid = .7, o = { x: e.x, z: e.z, a: toT, r: 3.2, arc: 2.2, color: 0x2a6a7a, type: 'vann' };
    e.state = 'wind'; e.t = tid + .35; e.face = toT; e.anim = { navn: 'feie', t0: G.time, dur: tid }; Sound.play('slim', .5, .7);
    addTele('cone', o, tid, () => { this.treff('cone', o, e.dmg, { type: 'avlopsarm', x: e.x, z: e.z, kb: 8 }); Sound.play('swingHeavy', .9, .7); Sound.play('slim', .6, .9); slashFx(e.x, e.z, o.a, 3.2, 2.2, true, 0x9ad0e0); R.shake(.15); }, e);
    e.cd = rnd(1.2, 1.8);
  },
  /* slaget: armen reiser seg høyt og faller over pasienten, og etterlater to pytter som leder strøm */
  slag(e, toT, dist) {
    const tid = .75, len = Math.min(6, dist + 1), o = { x: e.x, z: e.z, a: toT, w: 1.1, len, color: 0x1e2430, type: 'vann' };
    e.state = 'wind'; e.t = tid + .5; e.face = toT; e.anim = { navn: 'slag', t0: G.time, dur: tid, len }; Sound.play('sluk', .5, .7);
    addTele('rect', o, tid, () => {
      this.treff('rect', o, e.dmg * 1.1, { type: 'avlopsarm', x: e.x, z: e.z, kb: 6 }); Sound.play('slam', .8, .9); Sound.play('splash', .7, .9); R.shake(.25);
      for (const k of [.45, .85]) { const x = o.x + Math.sin(o.a) * len * k, z = o.z + Math.cos(o.a) * len * k; if (!solid(Math.floor(x), Math.floor(z))) addPuddle(x, z, 'wet', .8, 10); Particles.spawn(x, .3, z, 6, 0x9ad0e0, { speed: 3, up: 4, life: .5 }); }
    }, e);
    e.cd = rnd(1.6, 2.2);
  },
  /* grepet: armen strekker seg langt, og den som blir truffet, dras inn til risten */
  grip(e, toT) {
    const tid = .85, o = { x: e.x, z: e.z, a: toT, w: .7, len: 6.5, color: 0x2a6a7a, type: 'vann' };
    e.state = 'wind'; e.t = tid + .5; e.face = toT; e.anim = { navn: 'grip', t0: G.time, dur: tid }; Sound.play('slim', .5, 1.2);
    addTele('rect', o, tid, () => {
      const P = G.player; Sound.play('slim', .8, .7);
      if (!this.treff('rect', o, e.dmg * .5, { type: 'avlopsarm', x: e.x, z: e.z })) return;
      const a = Math.atan2(e.x - P.x, e.z - P.z), d = Math.hypot(e.x - P.x, e.z - P.z); P.kvx = Math.sin(a) * Math.min(11, d * 2); P.kvz = Math.cos(a) * Math.min(11, d * 2);
      statusOrd(P, 'GREPET'); Sound.play('sluk', .7, .9);
    }, e);
    e.cd = rnd(1.8, 2.4);
  },
  /* målene for armens form, ut fra fasen og angrepet den er midt i */
  form(e) {
    const t = G.time, M = Object.assign({}, ARM_HVILE), A0 = e.anim;
    M.lean = .05 + Math.sin(t * .8 + e.fase0) * .16; M.krok = .6 + Math.sin(t * 1.2 + e.fase0) * .35;
    if (e.fase === 'under' || e.fase === 'reiser') { M.h = 0; M.krok = 2.4; }
    else if (e.fase === 'dykker') { M.h = 0; M.krok = 2.6; M.rate = 9; }
    else if (A0) {
      const q = t - A0.t0 - A0.dur;
      if (q < 0 && e.state !== 'wind') e.anim = null; // avbrutt
      else if (A0.navn === 'feie') Object.assign(M, q < 0 ? { lean: -.6, krok: -1.2, L: 1.8, amp: .03, skjelv: .05, rate: 6 } : q < .4 ? { lean: 1.5, krok: 1.2, L: 2.2, amp: 0, rate: 24 } : {});
      else if (A0.navn === 'slag') Object.assign(M, q < 0 ? { lean: -.5, krok: -.45, L: 2.3, amp: .02, skjelv: .04, rate: 5 } : q < .55 ? { lean: 1.55, krok: .12, L: Math.min(3.4, A0.len * .62), amp: 0, rate: 26 } : {});
      else if (A0.navn === 'grip') Object.assign(M, q < 0 ? { lean: .45, krok: 2.3, L: 1.9, amp: .08, skjelv: .02, rate: 5 } : q < .18 ? { lean: 1.4, krok: .5, L: 3.6, amp: 0, rate: 30 } : q < .6 ? { lean: -.25, krok: 2.5, L: 1.5, rate: 12 } : {});
      if (q > .7) e.anim = null;
    }
    e.doll.armMal = M;
  },
  /* ---------- Kapellanen ---------- */
  preken(e) {
    const tid = 1.8; e.state = 'wind'; e.t = tid + .2; e.raise = true; e.preken = { hp0: e.hp, id: G.time }; e.prekenT = G.time + rnd(7, 10);
    FX.bubble(e, pick(this.PREKEN), tid); Sound.play('salme', .7);
    const id = e.preken.id; bossLaterE(e, tid, () => { if (e.preken && e.preken.id === id && e.state === 'wind') { e.preken = null; this.velsign(e); } });
  },
  /* de som hørte preken (innen seks ruter), blir raskere og ivrigere i seks sekunder. Farten lagres og settes tilbake nøyaktig */
  velsign(e) {
    let n = 0;
    for (const f of G.enemies) if (f !== e && f.alive && d2(f.x, f.z, e.x, e.z) < 36) {
      // baseSp er farten under treghet (frost, surkål i 25_items.js), som settes tilbake når tregheten går ut: den får samme faktor
      if (!f.velsignet) { f.velsignet = { sp: f.sp, satt: f.sp * 1.2 }; f.sp = f.velsignet.satt; if (f.baseSp) f.baseSp *= 1.2; }
      f.velsignetT = 6; n++; Particles.spawn(f.x, 1.2, f.z, 6, 0x3a8a7a, { speed: 1.2, up: 3, g: 0, life: .9, size: .8 });
    }
    if (n) { FX.bubble(e, pick(['Amen.', 'Gå i fred. Og bit.', 'Velsignet være dere, våte og tørre.']), 1.2); Sound.play('hvisk', .5, .7); }
    return n;
  },
  avbrytPreken(e, hoyt) { e.preken = null; e.raise = false; if (e.state === 'wind') { e.state = 'recover'; e.t = .6; } if (hoyt) { FX.bubble(e, 'Amen?!', 1.2); Sound.play('bonk', .4, 1.3); } },
  /* dåpen: en bue med sjøvann som lander i en ring der pasienten står */
  daap(e, T, toT) {
    const tid = .9, o = { x: T.x, z: T.z, r: 1.3, color: 0x3a8a7a, type: 'vann' };
    e.state = 'wind'; e.t = tid + .25; e.face = toT; e.positur = { navn: 'kast', t: 0, dur: .6 };
    if (Math.random() < .35) FX.bubble(e, pick(['I havets navn.', 'Hold pusten, vennen.', 'Salt vann. Det renser.']), 1.1);
    addTele('circle', o, tid, () => {
      Sound.play('splash', .9, 1.1); Particles.spawn(o.x, .4, o.z, 10, 0x9ad0e0, { speed: 3.5, up: 5, life: .6 }); addPuddle(o.x, o.z, 'wet', 1.1, 9);
      if (this.treff('circle', o, e.dmg * .8, { type: 'kapellan', x: o.x, z: o.z, kb: 3 })) { addMorb(6); statusOrd(G.player, 'DØPT'); }
    }, e);
    bossLaterE(e, tid - .5, () => {
      if (e.state !== 'wind' || e.stun > 0) return; const m = propSprite(null, e.x, e.z, { P: daapPart(), shadow: false, y: 1.2 }); R.dyn.add(m);
      addProj({ type: 'daap', from: 'enemy', x: e.x, z: e.z, tx: o.x, tz: o.z, arc: true, dur: .5, h: 2.2, mesh: m }); Sound.play('kast', .5, 1.2);
    });
    e.cd = rnd(2.4, 3.4);
  },
  /* kall fra dypet: en ring på en ledig rist, og så kommer en arm opp der */
  kall(e, s) {
    e.kallT = G.time + rnd(7, 9); e.state = 'wind'; e.t = 1.4; e.raise = true; FX.bubble(e, pick(['Stå opp fra ristene!', 'Kom opp, kom opp!', 'Menigheten trenger en arm.', 'Dypet, vi har gjester.']), 1.3); Sound.play('sluk', .6, .8);
    const o = { x: s.x, z: s.z, r: .9, color: 0x2a6a7a, type: 'vann' };
    addTele('circle', o, 1.2, () => {
      if (this.armer() >= this.MAKS_ARMER || G.enemies.filter(f => f.alive).length >= 14) return;
      spawnEnemy.kalt = true; let a; try { a = spawnEnemy('avlopsarm', s.x, s.z, false, G.depth); } finally { spawnEnemy.kalt = false; }
      Sound.play('splash', .9, .8); R.ripple(s.x, s.z); Particles.spawn(s.x, .3, s.z, 10, 0x9ad0e0, { speed: 3, up: 6, life: .6 });
      this.treff('circle', o, e.dmg * .6, { type: 'avlopsarm', x: o.x, z: o.z, kb: 5 });
      return a;
    }, e);
  },
  /* Kapellanen dør: «Amen.», avguden sprekker, og kultistene står og ser etter ham (da tar de dobbel skade) */
  dod(e) {
    if (e.type === 'avlopsarm') {
      Sound.play('rive', .7, rnd(.9, 1.1)); if (e.sted !== 'vegg') { R.ripple(e.x, e.z); Particles.spawn(e.x, .3, e.z, 8, 0x1e2430, { speed: 2.5, up: 3, life: .6 }); }
      if (e.hull) { const i = G.puddles.indexOf(e.hull); if (i >= 0) { R.remove(e.hull.mesh); G.puddles.splice(i, 1); } e.hull = null; }
      if (e.mesh) { R.remove(e.mesh); e.mesh = null; }
      return;
    }
    if (e.type !== 'kapellan') return;
    e.preken = null; FX.bubble({ x: e.x, z: e.z, bubbleH: e.bubbleH, alive: true }, 'Amen.', 1.4);
    Sound.play('knas', .8, .8); Particles.spawn(e.x, 1, e.z, 10, 0x6a8a6a, { speed: 3, up: 4, life: .8 });
    for (const f of G.enemies) if (f.alive && f.type === 'kultist' && d2(f.x, f.z, e.x, e.z) < 49) { cancelTeles(f); f.state = 'pose'; f.t = 1.6; f.pose = 1.6; f.raise = false; FX.bubble(f, pick(['Pastor?!', 'Nei! Pastor!', 'Hvem skal nå døpe oss?']), 1.4); }
  }
};
const daapPart = () => Art.part('daapvann', .5, .5, .25, .25, g => {
  A.cel(g, A.blob([[0, -.2], [.1, -.04], [.13, .08], [.06, .15], [-.06, .15], [-.13, .08], [-.1, -.04]]), '#8ac8d8', { line: '#1e3a4a', lw: .03 });
  A.dot(g, -.04, .02, .025, 'rgba(255,255,255,.8)'); A.dot(g, .14, -.12, .025, '#8ac8d8'); A.dot(g, -.15, -.1, .02, '#8ac8d8');
});
Object.assign(Grotesk.ai, {
  /* oppe: feier nær, slår eller griper lenger unna. Under vann gjør den ingenting */
  avlopsarm(e, T, dist, toT) {
    if (e.fase !== 'opp' || e.dukket || e.faseT < .35 || e.faseT > Havet.OPPE - .45) { e.cd = .15; return; }
    if (dist < 3.2) { Havet.feie(e, toT); return; }
    if (dist < 6.5 && los(e.x, e.z, T.x, T.z)) { if (Math.random() < .6) Havet.slag(e, toT, dist); else Havet.grip(e, toT); return; }
    e.cd = .3;
  },
  /* kaller armer, preker for de andre, eller døper pasienten */
  kapellan(e, T, dist, toT) {
    if (G.time >= (e.kallT || 0) && Havet.armer() < Havet.MAKS_ARMER && G.enemies.filter(f => f.alive).length < 14) { const s = Havet.slukNaer(e.x, e.z, 8, null, roomAt(e.x, e.z)); if (s) { Havet.kall(e, s); return; } }
    if (G.time >= (e.prekenT || 0) && G.enemies.some(f => f !== e && f.alive && d2(f.x, f.z, e.x, e.z) < 36)) { Havet.preken(e); return; }
    if (dist < 9) { Havet.daap(e, T, toT); return; }
    e.cd = .4;
  }
});
Object.assign(Grotesk.tick, {
  /* under, på vei opp, oppe og på vei ned. Aldri lenge under når pasienten er nær, og aldri ned midt i et angrep */
  avlopsarm(e, dt) {
    if (!e.fase) Havet.start(e);
    const P = G.player, naer = P && P.alive && d2(P.x, P.z, e.x, e.z) < Havet.NAER * Havet.NAER;
    e.faseT += dt; e.underT = e.dukket ? e.underT + dt : 0;
    if (e.fase === 'under') {
      e.dukket = true; e.doll.root.visible = false;
      e.boble -= dt; if (e.boble <= 0) { e.boble = .5; if (e.sted !== 'vegg') { Particles.spawn(e.x + rnd(-.2, .2), .08, e.z + rnd(-.2, .2), 2, 0x9ad0e0, { speed: .4, up: 1.6, g: 0, life: .7, size: .7 }); if (Math.random() < .5) R.ripple(e.x, e.z); } else puff(e.x, e.z, 1, .4, '#8a8478'); }
      e.gurgle -= dt; if (e.gurgle <= 0) { e.gurgle = rnd(2.2, 3.6); try { Lydbank.ved('sluk', e.x, e.z, { vol: .4, pitch: rnd(.8, 1.1), maks: 9 }); } catch (err) { } }
      if (e.etterDykk ? e.faseT >= .8 : naer || e.faseT >= 3) { if (e.etterDykk) Havet.flytt(e); e.etterDykk = false; Havet.opp(e); }
    } else if (e.fase === 'reiser') {
      if (e.faseT >= .6) {
        e.fase = 'opp'; e.faseT = 0; e.dukket = false; e.oppHp = e.hp; e.doll.root.visible = true; e.doll.arm && (e.doll.arm.h = 0);
        Sound.play('splash', .8, .8); R.ripple(e.x, e.z); if (e.sted !== 'vegg') Particles.spawn(e.x, .3, e.z, 10, 0x9ad0e0, { speed: 3, up: 6, life: .6 }); else puff(e.x, e.z, 3, .8, '#8a8478');
      }
    } else if (e.fase === 'opp') {
      e.doll.root.visible = true;
      if ((e.faseT >= Havet.OPPE || e.hp <= e.oppHp - .45 * e.max) && e.state !== 'wind' && !(e.stun > 0) && !(e.sleep > 0)) Havet.dykk(e);
    } else if (e.fase === 'dykker') {
      if (e.faseT >= .35) { e.fase = 'under'; e.faseT = 0; e.dukket = true; e.etterDykk = true; e.doll.root.visible = false; cancelTeles(e); e.state = 'chase'; }
    }
    Havet.form(e); e.doll.sted = e.sted;
    return null;
  },
  /* preken avbrytes når han blir slått (15 prosent av helsa) eller mister pusten */
  kapellan(e) {
    if (!e.preken) return null;
    if (e.hp <= e.preken.hp0 - .15 * e.max) Havet.avbrytPreken(e, true); // før staten: et slag som også slår ham ut av preken, gir «Amen?!»
    else if (e.state !== 'wind') Havet.avbrytPreken(e, false);
    else if (Math.random() < .25) for (const f of G.enemies) if (f !== e && f.alive && d2(f.x, f.z, e.x, e.z) < 36) Particles.spawn(f.x + rnd(-.3, .3), .3, f.z + rnd(-.3, .3), 1, 0x3a8a7a, { speed: .3, up: 2.2, g: 0, life: .8, size: .8 });
    return null;
  }
});
/* høyst tre armer (flere blir yngel), og de nye finner sitt sted. Kapellanen venter litt før han kaller første gang */
{ const _se = spawnEnemy; spawnEnemy = function (type, x, z, elite, depth) {
  if (type === 'avlopsarm' && !Havet.flereArmer && Havet.armer() >= Havet.MAKS_ARMER) type = 'yngel';
  const e = _se(type, x, z, elite, depth);
  if (e && e.type === 'avlopsarm') { e.kalt = !!spawnEnemy.kalt; Havet.start(e); }
  if (e && e.type === 'kapellan') { e.kallT = G.time + rnd(3, 5); e.prekenT = G.time + rnd(1.5, 3); }
  return e;
}; }
/* velsignelsen går ut (farten tilbake nøyaktig) og gjør nedkjølingen halvannen gang så rask. Armen står fast i risten sin */
{ const _ue = updateEnemy; updateEnemy = function (e, dt) {
  if (e.velsignet) {
    e.velsignetT -= dt; if (e.alive) e.cd -= dt * .5;
    // nøyaktig tilbake når ingen andre har rørt farten; ble den treg (eller fri fra treghet) underveis, tas faktoren ut av det som står
    if (e.velsignetT <= 0 || !e.alive) { const V = e.velsignet; e.sp = e.sp === V.satt ? V.sp : e.sp / 1.2; if (e.baseSp) e.baseSp /= 1.2; e.velsignet = null; }
    else if (Math.random() < dt * 2.5) Particles.spawn(e.x + rnd(-.3, .3), 1.4, e.z + rnd(-.3, .3), 1, 0x3a8a7a, { speed: .3, up: 1.5, g: 0, life: .7, size: .7 });
  }
  const r = _ue(e, dt);
  if (e.type === 'avlopsarm' && e.hjem && e.alive) { e.x = e.hjem.x; e.z = e.hjem.z; e.vx = e.vz = 0; e.doll.root.position.set(e.x, 0, e.z); }
  return r;
}; }
// armen har ingen føtter å skli på, selv i sin egen pytt
{ const _es = enemySlip; enemySlip = function (e) { if (e && e.type === 'avlopsarm') return; return _es(e); }; }
{ const _d = enemyDie; enemyDie = function (e, src) { _d(e, src); try { Havet.dod(e); } catch (err) { } }; }

/* ============================================================
   DRAUGPLEIEREN
   En pleier på nattevakta i 1887 gikk ned i kjelleren for å hente en pasient og kom opp igjen våtere. Halvt draug, halvt
   noe med gjeller. Biter på kloss hold, skvetter med bekkenet på mellomhold (VÅT: du går tregere) og hopper som en frosk
   når du holder avstand. I vann (pytter, tjern, suppe og myr) blir den friskere, to i sekundet og høyst halve helsa per liv,
   men strøm i vannet biter godt på den.
   ============================================================ */
Object.assign(FIENDESTEMME, { draug: ['stonn', .65] });
Object.assign(ENEMIES, { draug: { name: 'Draugpleieren', hp: 44, speed: 2.2, r: .46, dmg: 12, xp: 14, teeth: [1, 4], bubbleH: 3.1, weapon: 'bekken', blood: 0x2a4a44 } });
Object.assign(LINES, { draug: ['Tid for bad.', 'Vannet er godt i dag. Salt.', 'Har De tømt bekkenet? Jeg har.', 'Vi gikk ned for å hente en pasient i 1887.', 'Blubb.', 'Hold pusten, vennen. Lenge.', 'Nattevakta er ikke over. Den blir aldri over.', 'Jeg har rent tøy til Dem. Det er vått, men det er rent.'] });
Object.assign(DEATH_CAUSES, { draug: ['Badet av en pleier som ikke lenger trenger luft.', 'Fikk bekkenet over seg. Det var ikke tomt.', 'Druknet på tørt land. Det krever innsats.'] });
DEPTH_ENEMIES[3].push('draug'); DEPTH_ENEMIES[5].push('draug'); DEPTH_ENEMIES[6].push('draug', 'draug');
Object.assign(MESTER_TITTEL, { draug: 'Pleier' });
if (NPC_DYP.vaktmester && NPC_DYP.vaktmester[3]) NPC_DYP.vaktmester[3].push('Nattevakta i 1887 gikk ned i kjelleren. Tre kom opp. Én av dem var tørr.');
PA[3].push('Nattevakten minner om at bekkenet skal tømmes i sluket, ikke i pasienten.');
// grønne tall når den blir friskere i vannet
{ const st = document.createElement('style'); st.textContent = '.dmg.lege{ color:#8fd8a8; font-size:22px; }'; document.head.appendChild(st); }

/* froskehoppet: dukken klemmer seg sammen, strekker seg og letter, og faller ned der varselet er. Kroppen flytter seg i den siste delen (Havet.hoppTick) */
Object.assign(POSER, {
  froskehopp: { hR: [[0, .1, -.3], [.5, .28, -.44], [.66, .3, .3], [.82, .34, .36], [1, .2, -.3]], hL: [[0, -.1, -.3], [.5, -.28, -.44], [.66, -.3, .3], [.82, -.34, .36], [1, -.2, -.3]],
    lean: [[0, 0], [.5, 1.4], [.7, -.6], [.9, .8], [1, 0]], hode: [[0, 0], [.5, .25], [.72, -.3], [1, 0]], klem: [[0, 0], [.5, .36], [.64, .4], [.72, -.28], [.9, -.1], [.97, .32], [1, .1]], hopp: [[0, 0], [.64, 0], [.82, 1.4], [.98, 0], [1, 0]] },
  skvett: { hR: [[0, .1, -.3], [.55, -.2, -.1], [.75, .5, .2], [1, .3, -.2]], hL: [[0, -.1, -.34], [.55, .2, -.2], [1, -.1, -.34]], lean: [[0, 0], [.55, -.8], [.75, 1], [1, 0]], klem: [[0, 0], [.55, .15], [.75, -.1], [1, 0]] }
});

/* ---------- tegningen: fiskefrosk i våt pleieruniform, med skrukkete lue og tang ---------- */
const DRAUG = { hud: '#9ab8b0', hudM: '#6a8a82', hudL: '#c8dcd0', uni: '#6e847a', uniM: '#4a5e56', uniL: '#90a69a', tang: '#3e5a34', tangL: '#5e7a44', lue: '#e0dccc', kors: '#c89a94', drope: '#a8d8e8' };
RIG.draug = { hip: .46, hipW: .15, neck: .72, shW: .28, shY: .6, armW: .15, legW: .12, handR: .1, arm: DRAUG.uni, leg: DRAUG.hud, hand: DRAUG.hud, shoe: 'barfot:' + DRAUG.hud, scale: .9, headLag: 1.3 };
const draape = (g, x, y, s = 1) => A.flat(g, A.blob([[x, y - .04 * s], [x + .022 * s, y + .01 * s], [x, y + .03 * s], [x - .022 * s, y + .01 * s]]), DRAUG.drope, .012, '#2a4a5a');
const tangStraa = (g, a, c, b) => { A.curve(g, a, c, b, .05); A.curve(g, a, c, b, .028, DRAUG.tang); A.curve(g, [a[0] + .01, a[1]], [c[0] + .01, c[1]], [b[0] + .01, b[1] - .03], .01, DRAUG.tangL); };
MONSTER_ART.draug = {
  box: { hode: [1.3, 1.15, .65, .1], kropp: [1.3, 1.3, .65, .44] },
  hode: v => g => {
    const S = DRAUG.hud, cy = -.44;
    // den krøllete pleierlua med et falmet kors: sitter skjevt, våt
    const lue = (x, rot, kors) => { g.save(); g.translate(x, cy - .28); g.rotate(rot); A.cel(g, A.blob([[-.2, .06], [-.22, -.04], [-.14, -.12], [-.02, -.1], [.06, -.15], [.18, -.1], [.22, 0], [.2, .07], [0, .09]]), DRAUG.lue, { sk: .8 }); A.line(g, [[-.18, .04], [.18, .05]], .014, '#a8a490'); if (kors) { A.line(g, [[0, -.08], [0, .02]], .03, DRAUG.kors); A.line(g, [[-.05, -.03], [.05, -.03]], .03, DRAUG.kors); } A.flat(g, A.ell(.1, -.02, .05, .03), 'rgba(90,110,100,.35)', 0); g.restore(); };
    if (v === 'b') {
      for (const s of [-1, 1]) tangStraa(g, [s * .18, cy - .1], [s * .3, cy + .1], [s * .26, cy + .34]);
      A.cel(g, A.ell(0, cy + .02, .34, .3), S, { sk: .72 });
      // finnekammen opp gjennom nakken
      A.cel(g, A.blob([[-.04, cy + .3], [-.06, cy + .1], [-.1, cy - .02], [-.05, cy - .06], [-.07, cy - .16], [0, cy - .2], [.06, cy - .14], [.05, cy - .04], [.08, cy + .04], [.05, cy + .14], [.04, cy + .3]]), DRAUG.hudM, { lw: .025, hi: false });
      for (const y of [-.1, .02, .14]) A.line(g, [[-.04, cy + y], [.04, cy + y + .02]], .01, DRAUG.hudL);
      tangStraa(g, [0, cy - .22], [-.06, cy - .02], [-.02, cy + .22]);
      lue(0, .08, false); draape(g, .2, cy + .32);
      return;
    }
    if (v === 's') {
      tangStraa(g, [-.14, cy - .16], [-.3, cy + .04], [-.24, cy + .3]);
      // flatt hode med kjeven som stikker fram
      A.cel(g, A.blob([[-.28, cy + .12], [-.3, cy - .1], [-.16, cy - .26], [.08, cy - .26], [.26, cy - .14], [.36, cy + .02], [.38, cy + .12], [.3, cy + .2], [.04, cy + .24], [-.18, cy + .22]]), S, { sk: .72 });
      A.cel(g, A.blob([[.02, cy + .14], [.38, cy + .1], [.34, cy + .22], [.1, cy + .26]]), DRAUG.hudL, { lw: .02, hi: false });
      A.line(g, [[.04, cy + .13], [.38, cy + .1]], .024); for (let i = 0; i < 5; i++) { const x = .1 + i * .055; A.flat(g, A.poly([[x, cy + .12], [x + .02, cy + .12], [x + .01, cy + .17]]), '#f4f0e0', 0); }
      for (let i = 0; i < 3; i++) A.curve(g, [-.06 + i * .05, cy + .02], [-.08 + i * .05, cy + .08], [-.05 + i * .05, cy + .14], .016, DRAUG.hudM); // gjellene
      A.flat(g, A.ell(.16, cy - .1, .1, .1), '#f0ecd0', .028); A.dot(g, .19, cy - .1, .04); A.dot(g, .2, cy - .115, .012, '#ffffff');
      A.curve(g, [.06, cy - .18], [.16, cy - .23], [.26, cy - .17], .02, DRAUG.hudM);
      A.dot(g, .33, cy - .02, .012);
      lue(-.06, -.2, true); draape(g, .36, cy + .3); draape(g, -.26, cy + .34, .8);
      return;
    }
    for (const s of [-1, 1]) { tangStraa(g, [s * .2, cy - .14], [s * .36, cy + .04], [s * .32, cy + .3]); tangStraa(g, [s * .1, cy - .2], [s * .2, cy - .02], [s * .16, cy + .14]); }
    // bredt, flatt hode, blekt og grønt, med lys strupe
    A.cel(g, A.blob([[-.34, cy + .06], [-.32, cy - .14], [-.2, cy - .26], [0, cy - .28], [.2, cy - .26], [.32, cy - .14], [.34, cy + .06], [.26, cy + .22], [0, cy + .28], [-.26, cy + .22]]), S, { sk: .72 });
    A.flat(g, A.blob([[-.22, cy + .12], [.22, cy + .12], [.16, cy + .24], [0, cy + .27], [-.16, cy + .24]]), DRAUG.hudL, 0);
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) A.curve(g, [s * (.25 + i * .025), cy + .02 + i * .05], [s * (.3 + i * .025), cy + .05 + i * .05], [s * (.27 + i * .025), cy + .09 + i * .05], .014, DRAUG.hudM); // tre gjellespalter på hver side
    // store øyne langt ute på sidene, som ser hver sin vei
    for (const s of [-1, 1]) {
      A.flat(g, A.ell(s * .2, cy - .08, .12, .115), '#f0ecd0', .03); A.dot(g, s * .25, cy - .07, .045); A.dot(g, s * .235, cy - .09, .014, '#ffffff');
      A.curve(g, [s * .09, cy - .17], [s * .2, cy - .23], [s * .31, cy - .16], .024, DRAUG.hudM); // tunge lokk
      A.flat(g, A.ell(s * .2, cy + .02, .07, .02), 'rgba(60,90,80,.35)', 0);
    }
    for (const s of [-1, 1]) A.dot(g, s * .03, cy + .05, .012, '#3a524c');
    // leppeløs munn fra side til side, med nåletenner
    A.curve(g, [-.22, cy + .15], [0, cy + .2], [.22, cy + .15], .026);
    for (let i = 0; i < 8; i++) { const x = -.17 + i * .049, y = cy + .16 + Math.sin((i + .5) / 8 * Math.PI) * .035; A.flat(g, A.poly([[x - .012, y - .004], [x + .012, y - .004], [x, y + .045]]), '#f4f0e0', .006); }
    lue(.02, -.12, true);
    draape(g, -.08, cy + .34); draape(g, .22, cy + .3, .8); draape(g, .3, cy - .3, .7);
  },
  kropp: v => g => {
    const top = -.72, U = DRAUG.uni, UM = DRAUG.uniM;
    const flekker = pts => { for (const [x, y, rx, ry] of pts) A.flat(g, A.ell(x, y, rx, ry), 'rgba(50,70,62,.45)', 0); };
    const rur = (x, y, s = 1) => { A.cel(g, A.blob([[x - .035 * s, y + .02 * s], [x - .02 * s, y - .03 * s], [x + .02 * s, y - .03 * s], [x + .035 * s, y + .02 * s]]), '#d8d0bc', { lw: .014, hi: false }); A.dot(g, x, y - .015 * s, .008 * s, '#6a6458'); };
    const fald = y => { A.line(g, [[-.3, y], [-.2, y + .03], [-.08, y - .01], [.06, y + .03], [.2, y], [.3, y + .03]], .014, UM); for (const [x, s] of [[-.22, 1], [0, .8], [.18, 1.1]]) draape(g, x, y + .08, s); };
    if (v === 'b') {
      A.cel(g, A.blob([[-.32, .32], [.32, .32], [.3, 0], [.3, top + .2], [.18, top + .04], [0, top - .02], [-.18, top + .04], [-.3, top + .2], [-.3, 0]]), U, { line: '#1a2420', sk: .75 });
      A.cel(g, A.blob([[-.04, top + .02], [-.08, top + .2], [-.05, top + .4], [0, top + .5], [.05, top + .4], [.08, top + .2], [.04, top + .02]]), DRAUG.hudM, { lw: .022, hi: false }); // finnen gjennom sømmen
      A.line(g, [[0, top + .5], [0, .3]], .014, UM);
      flekker([[-.16, top + .3, .08, .12], [.18, -.1, .07, .1]]); for (const [x, y] of [[.2, top + .12], [.24, top + .18], [.15, top + .16]]) rur(x, y);
      fald(.3);
      return;
    }
    if (v === 's') {
      A.cel(g, A.blob([[-.24, .32], [.24, .32], [.2, 0], [.24, top + .26], [.14, top + .06], [-.04, top], [-.2, top + .12], [-.26, top + .32], [-.24, 0]]), U, { line: '#1a2420', sk: .75 }); // krum rygg
      A.cel(g, A.blob([[-.12, top + .04], [-.24, top + .12], [-.28, top + .22], [-.2, top + .18]]), DRAUG.hudM, { lw: .02, hi: false });
      A.cel(g, A.rr(.08, top + .24, .12, .08, .01), '#f0ecd8', { lw: .014, hi: false });
      g.save(); g.fillStyle = '#3a4a44'; g.font = 'bold .06px Georgia'; g.textAlign = 'center'; g.fillText('1887', .14, top + .3); g.restore();
      flekker([[.04, top + .4, .08, .12], [-.1, -.04, .07, .1]]); for (const [x, y] of [[-.1, top + .06], [-.05, top + .1]]) rur(x, y);
      fald(.3);
      return;
    }
    A.cel(g, A.blob([[-.34, .32], [.34, .32], [.32, 0], [.32, top + .18], [.2, top + .03], [.08, top], [0, top + .1], [-.08, top], [-.2, top + .03], [-.32, top + .18], [-.32, 0]]), U, { line: '#1a2420', sk: .75 });
    A.cel(g, A.poly([[-.1, top + .01], [0, top + .14], [.1, top + .01]]), DRAUG.hudL, { lw: .02, hi: false }); // halsen i v-en
    A.line(g, [[0, top + .14], [0, .3]], .014, UM);
    for (let i = 0; i < 3; i++) A.dot(g, .04, top + .22 + i * .12, .016, '#d8d4c4');
    // navnelapp med årstallet, og ruren på skulderen
    A.cel(g, A.rr(-.26, top + .22, .16, .08, .01), '#f0ecd8', { lw: .014, hi: false });
    g.save(); g.fillStyle = '#3a4a44'; g.font = 'bold .06px Georgia'; g.textAlign = 'center'; g.fillText('1887', -.18, top + .285); g.restore();
    for (const [x, y, s] of [[.22, top + .1, 1], [.27, top + .15, .9], [.18, top + .15, .8], [.26, top + .08, .7]]) rur(x, y, s);
    // våte flekker, lommer og en tangdott i lomma
    flekker([[-.14, top + .46, .1, .14], [.18, -.06, .08, .12], [.02, top + .3, .05, .06]]);
    A.cel(g, A.rr(.08, -.02, .16, .12, .02), Col.dark(U, .9), { lw: .02, hi: false }); tangStraa(g, [.14, -.02], [.1, .08], [.14, .16]);
    A.line(g, [[-.32, -.06], [.32, -.06]], .016, UM);
    fald(.3);
  }
};

const VAATT = { wet: 1, tjern: 1, soup: 1, myr: 1 };
Object.assign(Havet, {
  LEGE: 2, LEGE_TAK: .5, VAAT_T: 1.2,
  /* vann under draugen: en pytt med vann (ikke strøm i den) eller myr i Nattskogen */
  vannUnder(e) { const p = puddleAt(e.x, e.z); if (p) return VAATT[p.kind] && !(p.elec > 0) ? p : null; return typeof gulvUnder === 'function' && gulvUnder(e.x, e.z) === 'myr' ? { kind: 'myr' } : null; },
  /* biter på kloss hold */
  bitt(e, toT) {
    const tid = .45, o = { x: e.x + Math.sin(toT) * .8, z: e.z + Math.cos(toT) * .8, r: .8, color: 0x2a6a7a, type: 'vann' };
    e.state = 'wind'; e.t = tid + .3; e.face = toT; Sound.play('slim', .4, 1.1);
    addTele('circle', o, tid, () => { e.positur = { navn: 'greip', t: 0, dur: .3 }; Sound.play('slim', .8, .8); this.treff('circle', o, e.dmg, { type: 'draug', x: e.x, z: e.z, kb: 5 }); }, e);
    e.cd = rnd(1.1, 1.6);
  },
  /* skvetter med bekkenet: en vid kjegle, en pytt der pasienten står, og VÅT (tregere en stund) */
  skvett(e, T, toT) {
    const tid = .65, o = { x: e.x, z: e.z, a: toT, r: 3.2, arc: 1.3, color: 0x3a8a7a, type: 'vann' }, d = Math.min(3, Math.hypot(T.x - e.x, T.z - e.z));
    e.state = 'wind'; e.t = tid + .35; e.face = toT; e.positur = { navn: 'skvett', t: 0, dur: tid + .2 };
    if (Math.random() < .35) FX.bubble(e, pick(['Tid for bad.', 'Bekkenet, vennen.', 'Litt kaldt først.']), 1.1);
    addTele('cone', o, tid, () => {
      Sound.play('splash', .9, 1.2); const px = o.x + Math.sin(o.a) * d, pz = o.z + Math.cos(o.a) * d;
      if (!solid(Math.floor(px), Math.floor(pz))) addPuddle(px, pz, 'wet', 1, 10);
      Particles.spawn(px, .5, pz, 10, 0x9ad0e0, { speed: 3.5, up: 4, life: .5 }); slashFx(e.x, e.z, o.a, 3.2, 1.3, false, 0x9ad0e0);
      if (this.treff('cone', o, e.dmg * .8, { type: 'draug', x: e.x, z: e.z, kb: 2 })) { const P = G.player; P.vaatT = Math.max(P.vaatT || 0, this.VAAT_T); P.mokkT = Math.max(P.mokkT || 0, .05); statusOrd(P, 'VÅT'); }
    }, e);
    e.cd = rnd(1.8, 2.5);
  },
  /* froskehoppet: en ring ved pasienten, dukken klemmer seg sammen og letter, og kroppen flyttes i steg med moveEnt de siste
     0,45 sekundene (hoppTick), så den aldri lander i en vegg. Nedslaget etterlater et tjern som leder strøm */
  HOPP: 1.25, HOPP_FLYT: .45,
  hopp(e, T, toT) {
    const s = freeSpot(T.x - Math.sin(toT) * .5, T.z - Math.cos(toT) * .5, 1.5), tid = this.HOPP, o = { x: s.x, z: s.z, r: 1.3, color: 0x3a8a7a, type: 'vann' };
    e.state = 'wind'; e.t = tid + .35; e.face = toT; e.positur = { navn: 'froskehopp', t: 0, dur: tid };
    e.hopp = { t: 0, fra: { x: e.x, z: e.z }, til: { x: s.x, z: s.z } };
    Sound.play('slim', .45, .6); if (Math.random() < .4) FX.bubble(e, pick(['Hopp i havet!', 'Blubb!', 'Nå kommer pleieren.']), 1);
    addTele('circle', o, tid, () => this.landing(e, o), e);
    e.cd = rnd(2.2, 3);
  },
  hoppTick(e, dt) {
    const H = e.hopp; if (!H) return;
    if (e.state !== 'wind' || !e.alive) { e.hopp = null; if (e.positur && e.positur.navn === 'froskehopp') e.positur = null; return; }
    H.t += dt; const k = clamp((H.t - (this.HOPP - this.HOPP_FLYT)) / this.HOPP_FLYT, 0, 1);
    if (k > 0) moveEnt(e, lerp(H.fra.x, H.til.x, k) - e.x, lerp(H.fra.z, H.til.z, k) - e.z);
    if (k > 0 && !H.lettet) { H.lettet = true; Sound.play('swing', .5, .6); puff(e.x, e.z, 2, .6); }
  },
  landing(e, o) {
    if (e.hopp) { moveEnt(e, e.hopp.til.x - e.x, e.hopp.til.z - e.z); e.hopp = null; }
    Sound.play('splash', 1, .8); Sound.play('slam', .7, 1.1); R.shake(.18); R.ripple(o.x, o.z);
    Particles.spawn(o.x, .3, o.z, 12, 0x9ad0e0, { speed: 4, up: 5, life: .6 });
    if (!solid(Math.floor(o.x), Math.floor(o.z))) addPuddle(o.x, o.z, 'tjern', 1.2, 10);
    this.treff('circle', o, e.dmg * 1.1, { type: 'draug', x: o.x, z: o.z, kb: 7 });
  },
  /* i vann blir den friskere: to i sekundet, høyst halve helsa per liv. Grønne tall og en slurk av og til */
  lege(e, dt) {
    if (!e.alive || e.hp >= e.max || e.hopp) return 0;
    const tak = this.LEGE_TAK * e.max - (e.helt || 0); if (tak <= 0 || !this.vannUnder(e)) return 0;
    const h = Math.min(this.LEGE * dt, e.max - e.hp, tak); e.hp += h; e.helt = (e.helt || 0) + h; e.legeVis = (e.legeVis || 0) + h;
    if (e.legeVis >= 2) { numText(e.x, e.z, '+' + Math.round(e.legeVis), 'lege', 2.2); e.legeVis = 0; if (Math.random() < .4) Sound.play('sluk', .25, 1.5); if (Math.random() < .5) Particles.spawn(e.x, .2, e.z, 3, 0x8fd8a8, { speed: .5, up: 2, g: 0, life: .6, size: .7 }); }
    return h;
  }
});
Object.assign(Grotesk.keep, { draug: 1.2 });
Object.assign(Grotesk.talk, { draug: 1 });
Object.assign(Grotesk.hold, { draug: 1 });
Object.assign(Grotesk.ai, {
  /* biter nær, hopper når du holder avstand, skvetter med bekkenet imellom */
  draug(e, T, dist, toT) {
    const sikt = los(e.x, e.z, T.x, T.z);
    if (dist < 1.6) { Havet.bitt(e, toT); return; }
    if (dist >= 3.5 && dist < 7.5 && sikt && Math.random() < .55) { Havet.hopp(e, T, toT); return; }
    if (dist < 4.2 && sikt) { Havet.skvett(e, T, toT); return; }
    e.cd = .3;
  }
});
Object.assign(Grotesk.tick, { draug(e, dt) { Havet.hoppTick(e, dt); Havet.lege(e, dt); return null; } });
/* VÅT: pasienten går tregere (P.mokkT, som myr) så lenge P.vaatT varer. En egen klokke, fordi pyttene setter P.mokkT rett
   (et tjern gir 0,35 sekunder) og ellers ville kortet ned tregheten fra bekkenet */
{ const _up = updatePlayer; updatePlayer = function (dt, A) {
  const P = G.player;
  if (P && P.vaatT > 0) { P.vaatT -= dt; if (P.vaatT > 0 && P.alive) P.mokkT = Math.max(P.mokkT || 0, dt + .02); else P.vaatT = 0; }
  return _up(dt, A);
}; }
// draugen sklir ikke i sitt eget element (snubletråden på tørt gulv tar den fortsatt)
{ const _es = enemySlip; enemySlip = function (e) { if (e && e.type === 'draug' && (e.hopp || Havet.vannUnder(e))) return; return _es(e); }; }

/* ---------- fiendeindeksen ---------- */
FIENDE_REKKE.push('avlopsarm', 'kapellan', 'draug');
Object.assign(FIENDE_INFO, {
  avlopsarm: ['En arm fra havet under huset, opp gjennom risten, med ett gult øye ytterst. Feier, slår og griper, og dykker når den har fått nok.', 'Se etter boblene i risten. Under vann biter ingenting på den.'],
  kapellan: ['En knehøy kapellan med blekksprutkuppel og tentakkelskjegg over prestekragen. Preker, døper deg i sjøvann og kaller opp armer.', 'Slå ham midt i preken, så står menigheten uten velsignelse.'],
  draug: ['En pleier som gikk ned i kjelleren i 1887 for å hente en pasient, og kom opp igjen våtere. Hopper som en frosk og skvetter med bekkenet.', 'Slåss på tørt gulv. I vann blir den friskere, men strøm i vannet biter godt på den.']
});

Object.assign(window, { nearestEnemy, statusOrd, puddleAt, moveEnt, BOSS_MOVES, laanbareTrekk, addProj, updateProjectiles, Havet, tentakel, tentakelLinje }); // til testene
