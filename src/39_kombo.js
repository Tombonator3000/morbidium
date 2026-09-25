/* ============================================================
   KOMBO  -  lyd og effekter langt over toppen når noe spesielt skjer
   - Treffkjeden: hvert slag som treffer, teller. Kjeden brister når du blir
     truffet eller står stille for lenge. Ved 5, 10, 20, 35, 50, 75, 100 og 150
     treff får kjeden et nytt navn, med stadig større lyd: fra et lite pling
     til orgel, kor, gong og torden. Over 15 begynner skjermkanten å brenne.
     Brister en lang kjede, spiller en trist trombone. Slutter den av seg selv,
     får du erfaring for den.
   - Flerdrap: to, tre, fire, fem eller flere drept på et øyeblikk gir
     dobbeltdrap, trippeldrap, firlinger, massakre, epidemi og pandemi.
     Fra fire slår lynet ned i den siste, fra fem klapper pasientene.
   - Overkill, miljødrap (strøm, lyn, teslaspolen, eksplosive mestere),
     perfekt unnvikelse (tidsfall), tredje slag som treffer flere, tre ulike
     evnekort på rad, sjefer som dør, og fanfare for synergier og forvandlinger.
   - Kunngjøreren er en dyp syntetisk stemme med kirkeklang som sier ordet i
     stavelser, som mumlingen personalet har ellers. Den og fanfarene kan slås
     av under Lyd. Det som blinker, følger «Hvite glimt», og det som forvrenger,
     følger «Forvrengning».
   ============================================================ */

/* ---------- stemmen: stavelser med formanter, som en pompøs overlege i en katedral ---------- */
const FORMANT = { a: [730, 1090], e: [530, 1840], i: [300, 2200], o: [520, 860], u: [320, 800], y: [300, 1800], æ: [660, 1700], ø: [430, 1450], å: [500, 820] };
Sound.stemme = function (ord, o = {}) {
  if (!this.ready || this.volume <= 0) return;
  const c = this.ctx, base = o.base || 88, fart = o.fart || .15, v = o.v ?? .5, rv = o.rv ?? .55;
  const stav = String(ord).toLowerCase().match(/[^aeiouyæøå]*[aeiouyæøå]+[^aeiouyæøå]*?(?=[^aeiouyæøå]*[aeiouyæøå]|$)/g) || [String(ord)];
  let t = c.currentTime + .02;
  stav.forEach((s, i) => {
    const vok = (s.match(/[aeiouyæøå]/) || ['a'])[0], [f1, f2] = FORMANT[vok] || FORMANT.a, sist = i === stav.length - 1;
    if (/^[sktpfhcxz]/.test(s)) this._noise({ n: 1, d: .06, f0: 5200, f1: 2800, ft: 'highpass', v: v * .5, rv }, 1, 1, t);
    const d = fart * (sist ? 2.4 : 1) * (s.length > 3 ? 1.25 : 1), f0 = base * (i === 0 ? 1.14 : sist ? .9 : 1.02);
    const osc = c.createOscillator(), g = c.createGain(), b1 = c.createBiquadFilter(), b2 = c.createBiquadFilter(), g2 = c.createGain();
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(f0, t); osc.frequency.linearRampToValueAtTime(f0 * (sist ? .82 : .94), t + d);
    b1.type = b2.type = 'bandpass'; b1.frequency.value = f1; b2.frequency.value = f2; b1.Q.value = 5; b2.Q.value = 7; g2.gain.value = .55;
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v, t + .025); g.gain.setValueAtTime(v, t + d * .7); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    osc.connect(b1); osc.connect(b2); b2.connect(g2); b1.connect(g); g2.connect(g); this._ut(g, { rv });
    osc.start(t); osc.stop(t + d + .05); t += d * .92;
  });
};

/* ---------- lydene ---------- */
{
  const orgel = (noter, d, v, at = 0) => noter.flatMap(f => [{ w: 'sine', f, d, v, atk: .02, rv: .55, at }, { w: 'sine', f: f * 2, d: d * .9, v: v * .5, atk: .02, rv: .55, at }, { w: 'sine', f: f * 3, d: d * .8, v: v * .22, atk: .02, rv: .5, at }, { w: 'square', f, d: d * .8, v: v * .1, lp: [2200, 700], atk: .02, rv: .5, at }]);
  const kor = (noter, d, v, at = 0) => noter.flatMap(f => [{ w: 'sawtooth', f, d, v, atk: .18, vib: [5.2, 14], lp: [1500, 650], rv: .75, at }, { w: 'sawtooth', f: f * 1.005, d, v: v * .8, atk: .22, vib: [4.6, 18], lp: [1300, 600], rv: .75, at }]);
  const klokke = (b, v, at = 0) => [[.5, 3.2, 1], [1, 2.6, 1.4], [1.19, 2, .8], [1.5, 1.7, .6], [2, 1.4, .6], [2.74, 1, .35]].map(([k, d, a]) => ({ w: 'sine', f: b * k, d, v: v * a * .12, rv: .6, at }));
  const gong = (v, at = 0) => [{ w: 'sine', f: 98, d: 3.2, v: v * .35, rv: .65, vib: [.8, 22], at }, { w: 'sine', f: 147.3, d: 2.6, v: v * .2, rv: .6, at }, { w: 'sine', f: 211, d: 2.2, v: v * .15, rv: .6, at }, { w: 'sine', f: 289, d: 1.6, v: v * .1, rv: .6, at }, { n: 1, d: .5, f0: 1400, f1: 200, ft: 'lowpass', v: v * .3, at }];
  const smell = (noter, v, at = 0) => noter.map(f => ({ w: 'sawtooth', f, d: .55, v, lp: [5200, 420], dist: 3, rv: .5, at })).concat([{ n: 1, d: .32, f0: 6000, f1: 700, ft: 'bandpass', v: v * 2, rv: .4, at }, { w: 'sine', f: 62, d: .75, pd: .25, v: v * 3.4, at }]);
  const torden = (v, at = 0) => [{ n: 1, d: .12, f0: 8000, f1: 2000, ft: 'highpass', v: v * .6, at }, { n: 1, d: 2.6, f0: 520, f1: 50, ft: 'lowpass', v: v * .9, atk: .05, at: at + .03 }, { w: 'sine', f: 42, d: 2.2, pd: .3, v: v * .5, atk: .1, at }, { n: 1, d: 1.2, f0: 1100, f1: 90, ft: 'lowpass', v: v * .4, at: at + .55 }];
  const pauker = (n, v, at = 0) => Array.from({ length: n }, (_, i) => ({ w: 'sine', f: 70 + (i % 2) * 3, d: .24, pd: .15, v: v * (.5 + i / n * .5), at: at + i * .055 }));
  const applaus = (n, v, lengde, at = 0) => { const L = []; for (let i = 0; i < n; i++) L.push({ n: 1, d: .025 + Math.random() * .025, f0: 2200 + Math.random() * 1800, f1: 1100, ft: 'bandpass', v: v * (.6 + Math.random() * .6), at: at + Math.random() * lengde }); L.push({ w: 'sine', f: 1700, d: .45, pd: -.35, v: v * .35, vib: [7, 70], at: at + lengde * .3 }, { w: 'sine', f: 1900, d: .5, pd: -.3, v: v * .3, vib: [6.5, 60], at: at + lengde * .6 }); return L; };
  Object.assign(Sound.lib, {
    kombo1: [{ arp: [523, 659, 784], nl: .05, w: 'triangle', v: .2, rv: .3 }],
    kombo2: [{ arp: [587, 740, 880, 1175], nl: .05, w: 'square', v: .09, rv: .35 }, { n: 1, d: .2, f0: 4000, f1: 900, ft: 'bandpass', v: .32 }],
    kombo3: [...orgel([146.8, 174.6, 220], .7, .09), { w: 'sine', f: 55, d: .5, pd: .4, v: .55 }, { n: 1, d: .25, f0: 5000, f1: 1200, ft: 'bandpass', v: .3 }],
    kombo4: [...smell([130.8, 155.6, 196], .07), ...kor([261.6, 311.1, 392], 1.2, .05, .05), ...pauker(6, .4, .1)],
    kombo5: [...smell([110, 130.8, 164.8], .08), ...kor([220, 261.6, 329.6, 440], 1.8, .05, .05), ...gong(.9, .08), ...torden(.45, .25)],
    dobbel: [{ w: 'sine', f: 880, d: .6, v: .18, rv: .4 }, { w: 'sine', f: 2376, d: .25, v: .05 }, { w: 'sine', f: 660, d: .9, v: .2, at: .12, rv: .5 }, { w: 'sine', f: 1782, d: .3, v: .05, at: .12 }, { w: 'sine', f: 60, d: .3, pd: .3, v: .4 }],
    trippel: [...orgel([196, 246.9, 293.7], .9, .08), ...kor([392, 493.9, 587.3], 1.1, .04, .05), { w: 'sine', f: 58, d: .5, pd: .35, v: .55 }],
    firling: [...smell([164.8, 196, 246.9], .07), ...klokke(392, 1, .05), ...torden(.35, .15)],
    massakre: [...smell([98, 116.5, 146.8], .09), ...gong(1, .05), ...orgel([98, 146.8, 196, 233.1], 2, .07, .1), ...kor([196, 233.1, 293.7, 392], 2.2, .045, .15), ...torden(.6, .35), ...pauker(10, .45, .05)],
    overkill: [{ w: 'sine', f: 190, d: .9, pd: .86, v: .8, dist: 8 }, { w: 'sawtooth', f: 95, d: .7, pd: .7, v: .18, lp: [3000, 150], dist: 5 }, { n: 1, d: .4, f0: 1000, f1: 80, ft: 'lowpass', v: .7 }, { n: 1, d: .12, f0: 3000, f1: 600, ft: 'bandpass', v: .5, at: .04 }],
    miljo: [{ w: 'sawtooth', f: 90, d: .35, pd: -.5, v: .22, dist: 4 }, { n: 1, d: .3, f0: 6000, f1: 2500, ft: 'highpass', v: .28 }, ...kor([220, 277.2], 1.3, .06, .12)],
    perfekt: [{ n: 1, d: .34, f0: 300, f1: 5000, ft: 'bandpass', v: .3, atk: .3 }, { w: 'sine', f: 1568, d: 1.1, v: .12, at: .3, rv: .65 }, { w: 'sine', f: 2093, d: 1, v: .08, at: .34, rv: .65 }, { w: 'sine', f: 2637, d: .9, v: .05, at: .38, rv: .65 }],
    finale: [{ n: 1, d: .22, f0: 900, f1: 3500, ft: 'bandpass', v: .3, atk: .15 }, { w: 'sine', f: 80, d: .45, pd: .6, v: .8, at: .12, dist: 2 }, { n: 1, d: .25, f0: 2500, f1: 300, ft: 'lowpass', v: .5, at: .12 }],
    kortkombo: [{ arp: [523, 659, 784, 1046, 1318, 1568, 2093], nl: .045, nd: .5, w: 'triangle', v: .12, rv: .6 }, ...klokke(784, .7, .3)],
    synergi: [...pauker(12, .35), ...orgel([130.8, 164.8, 196, 261.6], 2.2, .07, .6), ...kor([261.6, 329.6, 392, 523.3], 2.4, .045, .62), ...klokke(523.3, 1, .6), ...klokke(392, .8, 1.1), ...torden(.4, .7)],
    forvandling: [...pauker(12, .4), ...orgel([110, 130.8, 164.8, 207.7], 2.4, .075, .6), ...kor([220, 261.6, 311.1, 415.3], 2.6, .05, .62), ...gong(.9, .6), ...torden(.55, .75)],
    sjefdrap: [...smell([73.4, 87.3, 110], .1), ...gong(1.1, 0), ...orgel([73.4, 110, 146.8, 185], 3, .07, .2), ...kor([146.8, 185, 220, 293.7], 3.2, .05, .25), ...torden(.8, .5), ...klokke(293.7, 1, .9), ...klokke(220, .9, 1.6)],
    trombone: [{ w: 'sawtooth', f: 392, d: .3, v: .12, lp: [1600, 500] }, { w: 'sawtooth', f: 370, d: .3, v: .12, lp: [1600, 500], at: .32 }, { w: 'sawtooth', f: 349.2, d: .3, v: .12, lp: [1600, 500], at: .64 }, { w: 'sawtooth', f: 329.6, d: 1.2, v: .13, lp: [1500, 380], vib: [6, 35], at: .96 }],
    kasse: [{ w: 'triangle', f: 2637, d: .6, v: .15, rv: .3 }, { w: 'triangle', f: 3520, d: .7, v: .11, at: .08, rv: .3 }, { n: 1, d: .08, f0: 3000, f1: 1500, ft: 'bandpass', v: .3 }, { n: 1, d: .05, f0: 2000, f1: 900, ft: 'bandpass', v: .25, at: .09 }],
    applaus: applaus(34, .14, 1.8),
    lynslag: [{ n: 1, d: .1, f0: 9000, f1: 2500, ft: 'highpass', v: .75 }, { n: 1, d: .55, f0: 3200, f1: 180, ft: 'lowpass', v: .65, at: .02 }, { w: 'sawtooth', f: 60, d: .4, pd: .5, v: .25, dist: 6 }],
    torden: torden(1),
    gnistre: [{ n: 1, d: .03, f0: 7000, f1: 5000, ft: 'highpass', v: .35 }, { n: 1, d: .03, f0: 6500, f1: 4500, ft: 'highpass', v: .3, at: .05 }, { n: 1, d: .04, f0: 7500, f1: 5000, ft: 'highpass', v: .32, at: .1 }, { w: 'sawtooth', f: 120, d: .18, v: .1, dist: 10 }]
  });
}

/* ---------- nivåene i treffkjeden og navnene på flerdrapene ---------- */
const KOMBO_NIVA = [[5, 'Lett irritert', 1], [10, 'Blodig', 2], [20, 'Kirurgisk', 3], [35, 'Klinisk sinnssyk', 4], [50, 'Morbid', 5], [75, 'Apokalyptisk', 5], [100, 'Guddommelig inngrep', 5], [150, 'Utenfor journalen', 5]];
const FLERDRAP = { 2: ['DOBBELTDRAP', 'dobbel'], 3: ['TRIPPELDRAP', 'trippel'], 4: ['FIRLINGER', 'firling'], 5: ['MASSAKRE', 'massakre'], 6: ['EPIDEMI', 'massakre'], 7: ['PANDEMI', 'massakre'] };
const KOMBO_UNDER = ['Journalen blir lang i dag', 'Noen må vaske gulvet', 'Overlegen er underrettet', 'Pasientene klapper', 'Dette går i årsrapporten', 'Vaktmesteren gråter stille'];

const Kombo = {
  n: 0, t: 0, niva: 0, maks: 0, VINDU: 2.4, FLER: 1.1,
  drap: [], meldt: 0, flerT: 0, sist: null, perfektT: 0, overT: 0, finaleT: 0, kortL: [], kortT: 0, slag: null, hete: 0, vist: -1,
  tall: { milepael: 0, brist: 0, slutt: 0, flerdrap: 0, overkill: 0, miljo: 0, perfekt: 0, finale: 0, kort: 0, sjef: 0, fanfare: 0 }, // til testene
  lyd() { return !G.meta || !G.meta.settings || G.meta.settings.kombo !== false; },
  spill(navn, vol = 1, pitch = 1) { if (this.lyd()) Sound.play(navn, vol, pitch); },
  si(ord, o) { if (this.lyd()) Sound.stemme(ord, o); },
  el(id) { return document.getElementById(id); },
  onFloor() { this.n = 0; this.t = 0; this.niva = 0; this.drap = []; this.meldt = 0; this.flerT = 0; this.kortL = []; this.slag = null; this.hete = 0; R.fx.hete = 0; this.vis(); },
  /* ---------- treffkjeden ---------- */
  treff(e) {
    if (G.state !== 'play') return;
    this.n++; this.t = this.VINDU; if (this.n > this.maks) this.maks = this.n;
    if (G.run && this.n > (G.run.komboMaks || 0)) G.run.komboMaks = this.n;
    const N = KOMBO_NIVA.filter(x => this.n >= x[0]).length;
    if (N > this.niva) { this.niva = N; this.milepael(KOMBO_NIVA[N - 1]); }
    else if (this.n >= 200 && this.n % 50 === 0) this.milepael([this.n, 'Utenfor journalen', 5]);
    if (this.n === 50 && typeof Merknad === 'object') Merknad.gi('blodrus');
    this.vis(true);
  },
  milepael([n, navn, lvl]) {
    const P = G.player; this.tall.milepael++; this.spill('kombo' + lvl);
    if (lvl >= 3) { this.si(navn, { base: lvl >= 5 ? 76 : 86 }); this.stempel(navn.toUpperCase(), n + ' treff på rad'); R.sjokk(P.x, P.z, .45 + lvl * .15); R.fx.ca = Math.max(R.fx.ca, .4 + lvl * .18); R.shake(.15 + lvl * .06); }
    if (lvl >= 4) { slowMo(.3, .4); R.zoomStot(P.x, P.z, .35); Glod.lag(P.x, .2, P.z + .1, 'kombo', { liv: 1.8 }); }
    if (lvl >= 5) { R.negativ(.07); R.fx.lyn = Math.max(R.fx.lyn, .45); const e = nearestEnemy(P.x, P.z, 9); if (e) Lyn.slag(e.x + rnd(-2, 2), 16, e.z - 6, e.x, 0, e.z, { farge: 0xffc080, bredde: .12, liv: .3 }); }
  },
  /* kjeden brister når du blir truffet: lange kjeder får en trist trombone */
  brist() {
    if (this.n > 0) this.tall.brist++;
    if (this.n >= 10) { this.spill('trombone', .9); const P = G.player; numText(P.x, P.z, 'Kjeden brast (' + this.n + ')', 'info', 2.6); }
    this.n = 0; this.t = 0; this.niva = 0; this.vis();
  },
  /* kjeden slutter av seg selv: erfaring for den, og kassaapparatet */
  slutt() {
    const n = this.n; this.n = 0; this.niva = 0; this.vis(); this.tall.slutt++;
    if (n >= 10 && G.player && G.player.alive) { const xp = Math.round(n * .8); gainXp(xp); this.spill('kasse', .8); numText(G.player.x, G.player.z, 'Kjede ' + n + ': +' + xp + ' erfaring', 'info', 2.6); }
  },
  /* ---------- drap ---------- */
  drept(e, src, d, hp0) {
    if (G.state !== 'play' || !e) return;
    const now = G.time; this.drap = this.drap.filter(t => now - t < this.FLER); this.drap.push(now); this.sist = e; this.flerT = .35;
    if (src.from === 'player' && !src.dot && d >= Math.max(25, hp0 * 2.5) && now > this.overT) this.overkill(e, d);
    else if (src.from === 'env' && e.kind === 'enemy') this.miljo(src.type, e);
  },
  flerdrap(k, e) {
    const P = G.player, [navn, lyd] = FLERDRAP[Math.min(k, 7)]; this.tall.flerdrap++;
    if (G.run && k > (G.run.flerdrapMaks || 0)) G.run.flerdrapMaks = k;
    this.spill(lyd); if (k >= 3) setTimeout(() => this.si(navn.toLowerCase(), { base: k >= 5 ? 74 : 84 }), 120);
    this.stempel(navn, k >= 5 ? pick(KOMBO_UNDER) : k + ' på et øyeblikk');
    R.sjokk(e.x, e.z, .35 + k * .18); R.fx.ca = Math.max(R.fx.ca, .3 + k * .15); R.shake(.2 + k * .08);
    if (k >= 3) { slowMo(.25 + k * .06, .35); R.zoomStot(e.x, e.z, .3 + k * .1); }
    if (k >= 4) { R.negativ(.07); Lyn.slag(e.x + rnd(-2, 2), 16, e.z - 6, e.x, 0, e.z, { farge: 0xffd0a0, bredde: .13, liv: .32, grener: 2 }); R.fx.lyn = Math.max(R.fx.lyn, .55); }
    if (k >= 5) {
      Glod.lag(P.x, .2, P.z + .1, 'kombo', { liv: 2.2, n: 56 }); Particles.spawn(e.x, 1, e.z, 30, 0xb3261e, { speed: 7, up: 8, life: 1 });
      setTimeout(() => this.spill('applaus', .9), 500); if (typeof Merknad === 'object') Merknad.gi('massakre');
    }
  },
  overkill(e, d) {
    this.overT = G.time + .8; this.tall.overkill++; this.spill('overkill');
    numText(e.x, e.z, 'OVERKILL', 'crit', 2.9); R.sjokk(e.x, e.z, .6, { life: .55 }); R.zoomStot(e.x, e.z, .3); R.fx.ca = Math.max(R.fx.ca, .6); R.shake(.35);
    const col = typeof hexOf === 'function' ? hexOf(e.blood) : '#8a1010';
    if (typeof Blod === 'object' && Blod.on) { Blod.biter(e.x, e.z, col, rndi(5, 8), 1.6); Blod.sprut(e.x, e.z, Math.random() * TAU, col, 12, 1.6); }
    Particles.spawn(e.x, 1, e.z, 22, e.blood || 0xb3261e, { speed: 8, up: 7, life: .9 });
  },
  miljo(hva, e) {
    this.tall.miljo++; this.spill('miljo'); numText(e.x, e.z, { lyn: 'LYNNEDSLAG', spole: 'STRØMFØRT' }[hva] || 'MILJØDRAP', 'crit', 2.8);
    R.sjokk(e.x, e.z, .45); R.fx.ca = Math.max(R.fx.ca, .5);
  },
  /* ---------- stil ---------- */
  perfekt() {
    if (G.time < this.perfektT || G.state !== 'play') return; this.perfektT = G.time + 2.2;
    const P = G.player; this.tall.perfekt++; this.spill('perfekt'); slowMo(.45, .3); R.fx.ca = Math.max(R.fx.ca, .8); R.zoomStot(P.x, P.z, .22);
    numText(P.x, P.z, pick(['PÅ HÅRET', 'UNNSLUPPET', 'IKKE I DAG', 'FOR SENT, DOKTOR']), 'crit', 2.7);
    if (this.n > 0) this.t = this.VINDU; // en perfekt unnvikelse holder kjeden i live
  },
  finale(k, treff) {
    if (G.time < this.finaleT) return; this.finaleT = G.time + .5;
    const P = G.player; this.tall.finale++; this.spill('finale', .9); R.sjokk(P.x + Math.sin(P.face) * 1.2, P.z + Math.cos(P.face) * 1.2, .35 + treff * .08, { life: .5 }); R.zoomStot(P.x, P.z, .15 + treff * .04);
    if (treff >= 3) numText(P.x, P.z, k.heavy ? 'FULL SVING' : 'TREDJE SLAG', 'crit', 2.5);
  },
  kort(i) {
    const now = G.time, P = G.player; this.kortL = this.kortL.filter(k => now - k.t < 2.6); this.kortL.push({ t: now, i });
    if (this.kortL.length >= 3 && new Set(this.kortL.map(k => k.i)).size >= 3 && now > this.kortT) {
      this.kortT = now + 4; this.kortL = []; this.tall.kort++; this.spill('kortkombo'); this.stempel('LEGEKUNST', 'tre kort på rad');
      R.sjokk(P.x, P.z, .6); Glod.lag(P.x, .2, P.z + .1, 'kombo', { liv: 1.6, farger: ['#e0f0ff', '#6a8aff'] });
    }
  },
  sjef(B) {
    this.tall.sjef++; this.spill('sjefdrap'); setTimeout(() => this.si('behandlet', { base: 70, fart: .2 }), 700); setTimeout(() => this.spill('applaus', 1), 1500);
    Lyn.slag(B.x + rnd(-2, 2), 18, B.z - 8, B.x, 0, B.z, { farge: 0xffe0b0, bredde: .2, liv: .45, grener: 4 }); R.fx.lyn = Math.max(R.fx.lyn, .8);
    Glod.lag(B.x, .2, B.z + .1, 'kombo', { liv: 3, n: 70 });
  },
  fanfare(hva) {
    const P = G.player; this.tall.fanfare++; this.spill(hva); if (!P) return;
    setTimeout(() => this.si(hva, { base: 80, fart: .19 }), 650);
    R.sjokk(P.x, P.z, 1.2, { life: 1 }); R.zoomStot(P.x, P.z, .5); R.fx.ca = Math.max(R.fx.ca, 1); R.negativ(.06); slowMo(.5, .35);
    Glod.lag(P.x, .2, P.z + .1, 'kombo', { liv: 2.4, n: 56, farger: hva === 'synergi' ? ['#fff8d0', '#ffb020'] : ['#f0c0ff', '#6b2d8c'] });
    Particles.spawn(P.x, 1, P.z, 24, hva === 'synergi' ? 0xf2c230 : 0x8a3ac0, { speed: 6, up: 8, life: 1.1 });
  },
  /* ---------- på skjermen ---------- */
  stempel(ord, under) {
    const el = this.el('kstempel'); if (!el) return;
    el.innerHTML = esc(ord) + (under ? '<small>' + esc(under) + '</small>' : ''); el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
    clearTimeout(this.stH); this.stH = setTimeout(() => el.classList.remove('on'), 1500);
  },
  vis(pang) {
    const el = this.el('kombo'); if (!el) return;
    if (this.n < 2) { if (this.vist !== 0) { el.classList.remove('on', 'het', 'gal'); this.vist = 0; } return; }
    if (this.vist !== this.n) {
      this.vist = this.n; const niva = KOMBO_NIVA.filter(x => this.n >= x[0]);
      el.querySelector('b').textContent = this.n; el.querySelector('span').textContent = niva.length ? niva[niva.length - 1][1] : 'treff';
      el.classList.add('on'); el.classList.toggle('het', this.n >= 20); el.classList.toggle('gal', this.n >= 50);
      if (pang) { el.classList.remove('pang'); void el.offsetWidth; el.classList.add('pang'); }
    }
  },
  tick(dt) {
    if (this.t > 0) { this.t -= dt; if (this.t <= 0) this.slutt(); }
    if (this.flerT > 0) { this.flerT -= dt; if (this.flerT <= 0) { const k = this.drap.filter(t => G.time - t < this.FLER + .4).length; if (k >= 2 && k > this.meldt && this.sist) { this.meldt = k; this.flerdrap(k, this.sist); } } }
    if (!this.drap.length || G.time - this.drap[this.drap.length - 1] > this.FLER + .4) { this.drap = []; this.meldt = 0; }
    // blodrus: skjermkanten brenner når kjeden er lang
    const mal = this.n >= 15 ? clamp((this.n - 15) / 50, .15, 1) : 0; this.hete += (mal - this.hete) * Math.min(1, dt * 4); R.fx.hete = this.hete;
    const el = this.el('kombo');
    if (el && this.n >= 2) {
      const i = el.querySelector('i'); if (i) i.style.transform = 'scaleX(' + clamp(this.t / this.VINDU, 0, 1).toFixed(3) + ')';
      const r = R.shakeOn ? Math.min(6, this.n / 12) : 0; el.style.translate = r ? (rnd(-r, r)).toFixed(1) + 'px ' + (rnd(-r, r)).toFixed(1) + 'px' : '';
    }
  }
};

/* ---------- koblinger ---------- */
{ const _h = hurt; hurt = function (e, dmg, src = {}) {
  const levde = !!(e && e.alive), hp0 = levde ? e.hp : 0, d = _h(e, dmg, src);
  if (!levde || !e || e.kind === 'player' || e.kind === 'ally' || !(d > 0)) return d;
  if (src.from === 'player' && !src.dot) { Kombo.treff(e); if (Kombo.slag) Kombo.slag.treff++; }
  if (!e.alive) Kombo.drept(e, src, d, hp0);
  return d;
}; }
{ const _hp = hurtPlayer; hurtPlayer = function (dmg, src = {}) {
  const P = G.player, unnvik = !!(P && P.alive && P.roll > 0 && P.iframe > 0 && P.invuln <= 0 && G.state === 'play'), d = _hp(dmg, src);
  if (d > 0) Kombo.brist(); else if (unnvik) Kombo.perfekt();
  return d;
}; }
{ const _mh = meleeHit; meleeHit = function (k) { Kombo.slag = { treff: 0 }; try { _mh(k); } finally { const S = Kombo.slag; Kombo.slag = null; if (S && S.treff >= 2 && (k.combo === 2 || (k.heavy && k.charge >= .99))) Kombo.finale(k, S.treff); } }; }
{ const _ua = useAbility; useAbility = function (i) { const P = G.player, n0 = P ? P.counters.ability : 0; _ua(i); if (P && P.counters.ability > n0) Kombo.kort(i); }; }
{ const _bd = bossDie; bossDie = function (B) { _bd(B); Kombo.sjef(B); }; }
{ const _sb = stampBig; stampBig = function (t, sub) { _sb(t, sub); if (t === 'SYNERGI' || t === 'FORVANDLING') Kombo.fanfare(t === 'SYNERGI' ? 'synergi' : 'forvandling'); }; }
{ const _sf = startFloor; startFloor = function (...a) { Kombo.onFloor(); return _sf.apply(this, a); }; }
{ const _rs = runStats; runStats = function () {
  let s = _rs(); const r = G.run || {};
  if (r.komboMaks >= 5) s += `<dt>Lengste kjede</dt><dd>${r.komboMaks} treff</dd>`;
  if (r.flerdrapMaks >= 2) s += `<dt>Flest på en gang</dt><dd>${r.flerdrapMaks}</dd>`;
  return s;
}; }
Object.assign(MERKNADER, {
  blodrus: { navn: 'Blodrus', krav: 'Slå 50 ganger på rad uten å bli truffet.', gir: 'Kunngjøreren kjenner navnet ditt.' },
  massakre: { navn: 'Massakre', krav: 'Slå fem fiender i hjel på et øyeblikk.', gir: 'Applaus fra pasientene, og en side i årsrapporten.' }
});
