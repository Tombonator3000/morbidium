/* ============================================================
   LYDBANKEN  -  innspilte lyder oppå synthlydene
   build.py bygger inn assets/lyd/*.mp3 som base64 (LYDFILER) og metadata (LYD_META) rett etter
   01_core.js. Alt er fri bruk (CC0): lydeffekter fra Freesound og instrumenter fra Versilian
   Community Sample Library. Hvem som har spilt inn hva, står i assets/lyd/KILDER.md.
   - Lydene pakkes ut i bakgrunnen når lyden slås på (første trykk): effektene først, så
     instrumentene og til slutt stemningssløyfene. Til en lyd er klar, spilles synthlyden.
   - Sound.play(navn) slår opp i LYD_KART: hvilke opptak som spilles (en tilfeldig variant, aldri
     den samme to ganger på rad, og litt ulik tonehøyde hver gang) og hvor mye av den gamle
     synthlyden som skal ligge under. Navn som ikke står i kartet, spilles som før.
   - Stemningslydene som drypper og tikker, legges på slaget i musikken og stemmes etter den (06_musikk.js).
   - Fottrinn etter gulvet og pyttene, stemningssløyfer per etasje, rom og vær, knitring fra bål og
     ovner i nærheten, og stønn og hvisking fra fiender som er på vei mot deg.
   - MP3 har litt stillhet foran (koderens forsinkelse), og nettleserne tar den bort i ulik grad.
     Den måles i hver lyd, og sløyfene har litt ekstra på hver side (tools/lag_lyd.py), så de tåler
     at målingen bommer litt.
   - «Innspilte lyder» under Lyd slår det hele av (da er det bare synth, og ingenting pakkes ut).
   ============================================================ */
const LYD_KART = {
  // slag og kamp
  swing: { s: [['swing', .5]], syn: .3 },
  swingHeavy: { s: [['swingHeavy', .65]], syn: .3 },
  hit: { s: [['hit', .75]], syn: .3 },
  hitHeavy: { s: [['hitHeavy', .85], ['knas', .22, 1.1]], syn: .3 },
  bonk: { s: [['bonk', .7]], syn: .25 },
  dodge: { s: [['dodge', .55]] },
  hurt: { s: [['hitHeavy', .7, .9], ['splat', .45]], syn: .35 },
  die: { s: [['gore', .55], ['die', .45]], syn: .2 },
  splat: { s: [['splat', .7]], syn: .15 },
  knas: { s: [['knas', .7]] },
  bitt: { s: [['stikk', .55, 1.2]], syn: .4 },
  kast: { s: [['swing', .45, .85]] },
  slam: { s: [['slam', .85], ['ins_stortromme', .45]], syn: .3 },
  stamp: { s: [['stamp', .75]], syn: .2 },
  // dører, ting og papir
  door: { s: [['door', .55]], syn: .3 },
  paper: { s: [['paper', .6]] },
  glass: { s: [['glass', .5]], syn: .2 },
  glassknus: { s: [['glass', .85]], syn: .25 },
  chain: { s: [['chain', .55]] },
  kjetting: { s: [['kjetting', .75]] },
  splash: { s: [['splash', .6]] },
  vomit: { s: [['vomit', .75]] },
  spark: { s: [['spark', .45]] },
  gnistre: { s: [['spark', .5, 1.2]], syn: .4 },
  zap: { s: [['zap', .6]], syn: .35 },
  torden: { s: [['torden', .9]], syn: .25 },
  lynslag: { s: [['torden', .75, 1.1]], syn: .7 },
  hjerte: { s: [['hjerte', .75]] },
  bjelle: { s: [['ins_handbjelle', .45, 1, { rv: .6 }], ['bjelle', .3, 1, { rv: .5 }]] },
  boss: { s: [['ins_gong', .5, 1, { rv: .4 }], ['ins_paukevirvel', .45]], syn: .6 },
  mo: { s: [['ku', .6]] },
  tooth: { s: [['tooth', .3]], syn: .7 },
  // stemningslyder (Sound.tick) og dyr. kvant: 1 legges på neste åttendel, 2 på neste takt, og stemmes etter musikken
  drypp: { s: [['drypp', .45, 1, { rv: .45 }]], kvant: 1 },
  knirk: { s: [['knirk', .4, 1, { lp: 3000 }]] },
  skrik: { s: [['skrik', .28, 1, { lp: 1600, rv: .7 }]] },
  ror: { s: [['ror', .45, 1, { rv: .35, lp: 2200 }]] },
  skrivemaskin: { s: [['skrivemaskin', .5, 1, { lp: 5000 }]], kvant: 1 },
  rotte: { s: [['rotte', .4]] },
  ugle: { s: [['ugle', .4, 1, { rv: .4, lp: 3500 }]] },
  kraake: { s: [['kraake', .45, 1, { rv: .3 }]] },
  kra: { s: [['kraake', .65]] },
  kvist: { s: [['kvist', .6]] },
  hund: { s: [['hund', .3, 1, { lp: 1500, rv: .5 }]] },
  klokke: { s: [['ins_klokker', .28, 1, { rv: .75, lp: 2500 }]], mus: 'klokke' },
  hvisk: { s: [['hvisk', .5, 1, { rv: .45 }]] },
  korskrik: { s: [['skrik', .5, .85, { rv: .5 }], ['hvisk', .4]], syn: .5 },
  vinge: { s: [['dodge', .35, 1.4]] },
  flis: { s: [['kvist', .55, 1.25]] }
};
/* iMUSE (06_musikk.js): innslag i musikken i stedet for synthlyden, plinger som stemmes etter akkorden
   (grunntonen i Hz står her), og store smell som får musikken til å dukke unna [hvor mye, hvor lenge] */
const LYD_INNSLAG = { clear: 'ryddet', level: 'niva', heal: 'hel' };
const LYD_STEMT = { pickup: 784, tooth: 1318, pa: 659, lokk: 523, fele: 659, kombo1: 523, kortkombo: 523 };
const LYD_DUKK = { slam: [.45, .3], boss: [.5, .6], torden: [.5, .8], lynslag: [.55, .6], hurt: [.3, .25], hitHeavy: [.2, .15], overkill: [.4, .4], sjefdrap: [.6, 1.2], massakre: [.5, .8], die: [.25, .3] };
/* fottrinn: gulvtype -> [lyd, styrke, tonehøyde, lavpass] */
const FOTGULV = {
  tre: ['fot_tre', .32, 1], parkett: ['fot_tre', .3, 1.05], planker: ['fot_tre', .34, .95], sjakk: ['fot_stein', .3, 1.05], teppe: ['fot_tre', .16, .9, 900],
  sekskant: ['fot_stein', .3, 1.08], linoleum: ['fot_stein', .26, 1.12, 5000], fliser: ['fot_stein', .32, 1.1], stein: ['fot_stein', .34, .95], betong: ['fot_stein', .32, .9],
  brostein: ['fot_stein', .36, .9], gress: ['fot_gress', .34, 1], mose: ['fot_gress', .26, .9, 2500], jord: ['fot_gress', .3, .85, 3000], sti: ['fot_gress', .3, .95],
  grus: ['fot_gress', .34, 1.15], myr: ['fot_vann', .38, .85], is: ['fot_stein', .24, 1.3]
};
/* stemningssløyfer: etasjene, rommene (etter romtype) og drømmen */
const STEMNING_ETASJE = {
  1: [['amb_natt', .55], ['amb_vind', .3]], 2: [['amb_brum', .4], ['klokketikk', .1]], 3: [['amb_drypp', .45], ['amb_brum', .25]],
  4: [['amb_brum', .35], ['klokketikk', .14]], 5: [['amb_natt', .4], ['amb_vind', .5]], 6: [['amb_hav', .55], ['amb_drone', .45]]
};
const STEMNING_ROM = {
  bad: [['amb_drypp', .55]], vaskeri: [['amb_drypp', .4]], toalett: [['amb_drypp', .45]], vask: [['amb_drypp', .35]], kjokken: [['amb_baal', .2]],
  fyrrom: [['amb_baal', .5], ['amb_brum', .45]], elektro: [['summ', .35]], rontgen: [['summ', .28]], tannlege: [['summ', .14]],
  kapell: [['amb_drone', .22]], likkapell: [['amb_drone', .35]], likhus: [['amb_drone', .3]], begravelse: [['amb_drone', .25]],
  arkiv: [['klokketikk', .3]], kartotek: [['klokketikk', .25]], direktor: [['klokketikk', .45]], venterom: [['klokketikk', .4]], dagligstue: [['klokketikk', .3]],
  journal: [['klokketikk', .3]], bibliotek: [['klokketikk', .25]], koie: [['amb_baal', .45]], kjeller: [['amb_drypp', .3], ['amb_drone', .2]], isolat: [['amb_brum', .5, 600]],
  tjern: [['amb_drypp', .2]], myr: [['amb_drypp', .15]], fontene: [['amb_drypp', .3]], secret: [['amb_drone', .3]], offer: [['amb_drone', .4]], cursed: [['amb_drone', .4]]
};
const STEMNING_DROM = [['amb_hav', .3, 700], ['amb_drone', .16]];
/* fiender som stønner eller hvisker når de kommer mot deg: [lyd, tonehøyde] */
const FIENDESTEMME = {
  pleier: ['stonn', 1], kultist: ['stonn', 1.1], oppasser: ['stonn', 1.05], tvang: ['stonn', .95], byrakrat: ['stonn', 1.15], narkose: ['stonn', .9], kasteren: ['stonn', .75],
  trille: ['stonn', .85], speil: ['stonn', 1.2], svulst: ['slim', .8], klumpunge: ['slim', 1.3], koret: ['hvisk', 1], tannlege: ['stonn', .95], portier: ['stonn', .7],
  gartner: ['stonn', .9], vedkubbe: ['stonn', .65], nokken: ['stonn', .8], huldra: ['hvisk', 1.25], rotte: ['rotte', 1], kraake: ['kraake', 1], kaalhode: ['slim', .9]
};
/* bål og ovner: knitring etter avstand */
const BAAL_KNITR = { baal: 1, vedovn: .7, komfyr: .35, gryte: .2 };

const Lydbank = {
  buf: {}, forsink: {}, grupper: null, sist: {}, startet: false, klar: 0, totalt: 0, feil: 0, paa: true, aktive: {}, dek: {},
  gruppeListe() {
    if (this.grupper) return this.grupper;
    const G0 = this.grupper = {};
    if (typeof LYD_META === 'object') for (const k in LYD_META) (G0[LYD_META[k].gruppe] || (G0[LYD_META[k].gruppe] = [])).push(k);
    return G0;
  },
  /* av og på (innstillingen «Innspilte lyder») */
  sett(on) { this.paa = on !== false; if (this.paa && Sound.ready) this.start(); if (!this.paa) Stemning.stoppAlle(.3); },
  /* pakker ut alle lydene, fire om gangen, effektene først */
  start() {
    if (this.startet || !this.paa || !Sound.ready || typeof LYDFILER !== 'object') return;
    if (G.meta && G.meta.settings && G.meta.settings.opptak === false) { this.paa = false; return; }
    this.startet = true; this.startT = performance.now(); this.gruppeListe();
    const pri = k => ({ sfx: 0, ins: 1, amb: 2 }[LYD_META[k] && LYD_META[k].type] ?? 3), navn = Object.keys(LYDFILER).sort((a, b) => pri(a) - pri(b));
    this.totalt = navn.length; let i = 0, aktive = 0;
    const neste = () => { while (aktive < 4 && i < navn.length) { const k = navn[i++]; aktive++; this.pakkUt(k).then(() => { aktive--; neste(); }); } };
    neste();
  },
  /* lydene pakkes ut i sin egen samplingsfrekvens (lag_lyd.py: 32 kHz, stemningen 24 kHz). Det sparer
     omtrent en tredel av minnet mot å pakke dem ut i lydkortets 48 kHz. Nettleseren omsampler når de spilles. */
  dekoder(m) {
    const sr = m && m.type === 'amb' ? 24000 : 32000; if (this.dek[sr] !== undefined) return this.dek[sr];
    try { const O = window.OfflineAudioContext || window.webkitOfflineAudioContext; this.dek[sr] = O ? new O(1, 1, sr) : null; } catch (e) { this.dek[sr] = null; }
    return this.dek[sr];
  },
  pakkUt(k) {
    return new Promise(ferdig => {
      let ab; try { const s = atob(LYDFILER[k]), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); ab = u.buffer; } catch (e) { this.feil++; ferdig(); return; }
      const m = LYD_META[k] || {}, kopi = ab.slice(0);
      // base64-teksten slippes når lyden er pakket ut, så den ikke ligger i minnet to ganger
      const ok = b => { if (b && b.length) { this.buf[k] = b; this.forsink[k] = this.maalForsinkelse(b); this.klar++; LYDFILER[k] = null; } else this.feil++; ferdig(); };
      const dekod = (ctx, data, feil) => { try { const p = ctx.decodeAudioData(data, ok, feil); if (p && p.catch) p.catch(() => { }); } catch (e) { feil(); } };
      const d = this.dekoder(m), igjen = () => dekod(Sound.ctx, kopi, () => ok(null));
      if (d) dekod(d, ab, igjen); else igjen();
    });
  },
  /* stillheten foran: første prøve over en prosent av toppen i starten, minus litt til anslaget */
  maalForsinkelse(b) {
    const d = b.getChannelData(0), n = Math.min(d.length, Math.floor(b.sampleRate * .5)); let topp = 0;
    for (let i = 0; i < n; i++) { const a = Math.abs(d[i]); if (a > topp) topp = a; }
    const terskel = Math.max(.0008, topp * .01), maks = Math.min(n, Math.floor(b.sampleRate * .12));
    for (let i = 0; i < maks; i++) if (Math.abs(d[i]) > terskel) return Math.max(0, i - Math.floor(b.sampleRate * .0015)) / b.sampleRate;
    return 0;
  },
  har(gruppe) { if (!this.paa || !Sound.ready) return false; const L = this.gruppeListe()[gruppe]; return !!L && L.some(k => this.buf[k]); },
  /* én lyd fra en gruppe. o: vol, pitch, t (når, i lydkortets tid), ut (buss), rv (kirkeklang), hall (egen klangbuss),
     pan, lp, hp, loop, d (lengde, med rel som uttoning), a (inntoning), fra (sekunder inn i lyden), navn (bestemt variant) */
  spill(gruppe, o = {}) {
    if (!this.paa || !Sound.ready || Sound.volume <= 0) return null;
    const L = this.gruppeListe()[gruppe]; if (!L) return null;
    const klare = L.filter(k => this.buf[k]); if (!klare.length) return null;
    let k = o.navn && this.buf[o.navn] ? o.navn : klare[Math.floor(Math.random() * klare.length)];
    if (!o.navn && klare.length > 1 && k === this.sist[gruppe]) k = klare[(klare.indexOf(k) + 1) % klare.length];
    this.sist[gruppe] = k;
    // mange like lyder på en gang (tjue blodsprut i samme bilde) blir bare høyere og grøtete: høyst fem per gruppe på 80 ms
    const c = Sound.ctx, t = Math.max(c.currentTime, o.t || 0), A = this.aktive[gruppe] || (this.aktive[gruppe] = []);
    while (A.length && A[0] < t - .08) A.shift();
    if (!o.loop && A.length >= 5) return null; A.push(t);
    return this.spillFil(k, o, t);
  },
  spillFil(k, o, t) {
    const c = Sound.ctx, b = this.buf[k], m = LYD_META[k] || {}, fs = this.forsink[k] || 0, sl = Array.isArray(m.sloyfe) ? m.sloyfe : null;
    const src = c.createBufferSource(); src.buffer = b; src.playbackRate.value = o.pitch || 1;
    let ut = src, lp = null, pan = null;
    if (o.lp) { lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = o.lp; lp.Q.value = .5; ut.connect(lp); ut = lp; }
    if (o.hp) { const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = o.hp; f.Q.value = .5; ut.connect(f); ut = f; }
    const g = c.createGain(); ut.connect(g); ut = g;
    if (o.pan !== undefined && c.createStereoPanner) { pan = c.createStereoPanner(); pan.pan.value = clamp(o.pan, -1, 1); g.connect(pan); ut = pan; }
    ut.connect(o.ut || Sound.sfx);
    const hall = o.hall || Sound.hall; if (o.rv && hall) { const r = c.createGain(); r.gain.value = o.rv; ut.connect(r); r.connect(hall); }
    const v = o.vol ?? 1, a = o.a || 0;
    if (a > 0) { g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(Math.max(.0001, v), t + a); } else g.gain.setValueAtTime(v, t);
    let fra = fs + (o.fra || 0);
    if (o.loop && sl) { src.loop = true; src.loopStart = fs + sl[0]; src.loopEnd = fs + sl[1]; if (o.tilfeldig) fra = fs + sl[0] + Math.random() * (sl[1] - sl[0]); } // stemningen starter et tilfeldig sted i sløyfa
    else if (o.loop) src.loop = true;
    src.start(t, Math.min(fra, b.duration - .01));
    if (o.d) { const rel = Math.min(o.rel ?? .15, o.d * .5); g.gain.setValueAtTime(Math.max(.0001, v), t + Math.max(a, o.d - rel)); g.gain.linearRampToValueAtTime(.0001, t + o.d); src.stop(t + o.d + .03); }
    src.onended = () => { try { g.disconnect(); if (pan) pan.disconnect(); } catch (e) { } };
    const H = { src, g, lp, pan, k, stopp(fade = .3) { const n = c.currentTime; try { g.gain.cancelScheduledValues(n); g.gain.setValueAtTime(g.gain.value, n); g.gain.linearRampToValueAtTime(.0001, n + fade); src.stop(n + fade + .05); } catch (e) { } } };
    return H;
  },
  /* en lyd fra et sted i verden: svakere og mørkere jo lenger unna pasienten, og til siden den kommer fra */
  ved(gruppe, x, z, o = {}) {
    const P = G.player, cx = P ? P.x : R.camT.x, cz = P ? P.z : R.camT.z, d = Math.hypot(x - cx, z - cz), maks = o.maks || 12;
    if (d > maks) return null; const n = 1 - d / maks;
    return this.spill(gruppe, Object.assign({}, o, { vol: (o.vol ?? 1) * n * n, pan: clamp((x - cx) / 9, -.85, .85), lp: Math.min(o.lp || 20000, 700 + 15000 * n * n) }));
  },
  /* kartet: Sound.play(navn) -> opptak, med synthlyden under når kartet ber om det */
  kart(K, navn, vol, pitch) {
    let t = 0, stem = 1;
    if (K.kvant && typeof Musikk === 'object' && Musikk.slag) { const q = Musikk.slag(K.kvant); if (q) { t = q.t; stem = q.stem || 1; } }
    const jit = K.jit ?? (t ? 0 : .05);
    for (const [gr, v, p = 1, o] of K.s) this.spill(gr, Object.assign({}, o, { vol: vol * v, pitch: pitch * p * stem * (1 + (Math.random() * 2 - 1) * jit), t }));
  },
  /* ---------- per bilde ---------- */
  tick(dt) {
    if (!Sound.ready) return;
    Stemning.tick(dt);
    if (!this.paa || G.state !== 'play') return;
    this.fot(dt); this.stemmer(dt);
  },
  fotD: 0, fx: null, fz: null,
  fot() {
    const P = G.player; if (!P || !P.alive) { this.fx = null; return; }
    if (this.fx === null) { this.fx = P.x; this.fz = P.z; return; }
    const d = Math.hypot(P.x - this.fx, P.z - this.fz); this.fx = P.x; this.fz = P.z;
    if (d > 2 || P.roll > 0 || Items.has && Items.has('heliumlunge')) { this.fotD = 0; return; }
    this.fotD += d; if (this.fotD < 1.45) return; this.fotD = 0;
    const pytt = typeof puddleAt === 'function' ? puddleAt(P.x, P.z) : null, gulv = typeof gulvUnder === 'function' ? gulvUnder(P.x, P.z) : null;
    const [gr, v, p, lp] = pytt ? ['fot_vann', .34, pytt.kind === 'blod' ? .85 : 1] : FOTGULV[gulv] || ['fot_stein', .3, 1];
    this.spill(gr, { vol: v * (.8 + Math.random() * .3), pitch: p * (.92 + Math.random() * .16), lp });
    if (pytt && Math.random() < .5 && typeof Vaatt === 'object') Vaatt.plask(.25, pytt.kind === 'blod');
  },
  stemmeT: 1,
  stemmer(dt) {
    this.stemmeT -= dt; if (this.stemmeT > 0) return; this.stemmeT = .45;
    const P = G.player; if (!P || !P.alive || !G.enemies) return;
    let best = null, bd = 1e9;
    for (const e of G.enemies) {
      if (!e.alive || e.state === 'spawn' || e.sleep > 0 || !FIENDESTEMME[e.type]) continue;
      e.stemT = (e.stemT ?? Math.random() * 4) - .45; if (e.stemT > 0) continue;
      const d = d2(e.x, e.z, P.x, P.z); if (d < bd && d < 110) { bd = d; best = e; }
    }
    if (!best) return;
    best.stemT = 4 + Math.random() * 6; const [gr, p] = FIENDESTEMME[best.type];
    this.ved(gr, best.x, best.z, { vol: gr === 'hvisk' ? .55 : .5, pitch: p * (.93 + Math.random() * .14), maks: 11, rv: .2 });
  }
};

/* ---------- stemningen: sløyfer som glir inn og ut etter etasje, rom, vær og bål i nærheten ---------- */
const Stemning = {
  lag: {}, etasje: 0, t: 0, droneNiva: .55,
  start(depth) { this.etasje = depth; this.t = 0; },
  stopp() { this.etasje = 0; this.stoppAlle(1.5); },
  stoppAlle(fade = 1) { for (const k in this.lag) { this.lag[k].h.stopp(fade); } this.lag = {}; },
  /* målet for hver sløyfe akkurat nå: navn -> [styrke, lavpass, panorering] */
  maal() {
    const M = {}, legg = (L, k = 1) => { for (const [n, v, lp] of L) { const m = M[n] || (M[n] = [0, lp || 20000, 0]); m[0] = Math.max(m[0], v * k); if (lp) m[1] = Math.min(m[1], lp); } };
    if (G.state === 'title' || G.state === 'dead') return M;
    if (G.drom) { legg(STEMNING_DROM); return M; } // drømmen stopper dronen (36_drom.js), men havet under huset høres
    if (!this.etasje) return M;
    legg(STEMNING_ETASJE[this.etasje] || []);
    const P = G.player; if (!P || !G.F) return M;
    const rr = typeof roomAt === 'function' ? roomAt(P.x, P.z) : -1, rom = rr >= 0 ? G.F.rooms[rr] : null;
    if (rom && STEMNING_ROM[rom.template]) legg(STEMNING_ROM[rom.template]);
    // været: fullt ute, dempet og mørkt inne (regnet på taket)
    const vt = Sound.vaerType; if (vt) { const ute = G.F.ute || (rom && rom.ute); legg([[vt === 'regn' ? 'amb_regn' : 'amb_vind', ute ? .55 : .2, ute ? 0 : 700]]); }
    // bål og ovner: nærmeste innen åtte ruter
    if (G.props) {
      let best = null, bd = 64;
      for (const o of G.props) { const k = BAAL_KNITR[o.kind]; if (!k || o.alive === false) continue; const d = d2(o.x, o.z, P.x, P.z) / k; if (d < bd) { bd = d; best = o; } }
      if (best) { const n = 1 - Math.sqrt(bd) / 8, m = M.amb_baal || (M.amb_baal = [0, 20000, 0]); m[0] = Math.max(m[0], .75 * n * n); m[2] = clamp((best.x - P.x) / 6, -.7, .7); }
    }
    return M;
  },
  tick(dt) {
    this.t -= dt; if (this.t > 0) return; this.t = .25;
    const c = Sound.ctx, now = c.currentTime, M = Lydbank.paa ? this.maal() : {}, mk = typeof Musikk === 'object' && Musikk.aktiv() ? Musikk.stemningK() : 1;
    for (const n in M) {
      const [v0, lp, pan] = M[n], v = v0 * mk; if (v <= .001) continue;
      let L = this.lag[n];
      if (!L) { if (!Lydbank.har(n)) continue; const h = Lydbank.spill(n, { loop: true, tilfeldig: true, vol: .0001, ut: Sound.amb, lp: 20000, pan: 0 }); if (!h) continue; L = this.lag[n] = { h }; }
      L.h.g.gain.setTargetAtTime(v, now, 1.1); if (L.h.lp) L.h.lp.frequency.setTargetAtTime(lp, now, .8); if (L.h.pan) L.h.pan.pan.setTargetAtTime(pan, now, .5);
      L.av = 0;
    }
    for (const n in this.lag) {
      if (M[n] && M[n][0] > .001) continue; const L = this.lag[n];
      L.h.g.gain.setTargetAtTime(.0001, now, 1.1); L.av = (L.av || 0) + .25;
      if (L.av > 5) { L.h.stopp(.2); delete this.lag[n]; }
    }
    // regnet og vinden: sløyfen tar over for støyen når den er klar
    if (Sound.vaerType && Sound.vaerN && Lydbank.har(Sound.vaerType === 'regn' ? 'amb_regn' : 'amb_vind')) { try { Sound.vaerN.stop(); } catch (e) { } Sound.vaerN = null; }
  }
};

/* ---------- koblingene inn i lydmotoren (01_core.js) ---------- */
{
  const _init = Sound.init, _play = Sound.play, _start = Sound.startAmbience, _stopp = Sound.stopAmbience, _vaer = Sound.vaer;
  Sound.init = function () { _init.call(Sound); if (Sound.ready) Lydbank.start(); };
  Sound.play = function (navn, vol = 1, pitch = 1) {
    if (!Sound.ready || Sound.volume <= 0) return;
    const M = typeof Musikk === 'object' && Musikk.aktiv() ? Musikk : null;
    if (M && LYD_INNSLAG[navn] && M.innslag(LYD_INNSLAG[navn])) return;
    if (M && LYD_STEMT[navn]) pitch *= M.stem(LYD_STEMT[navn] * pitch);
    if (M && LYD_DUKK[navn]) M.dukk(LYD_DUKK[navn][0] * Math.min(1, vol), LYD_DUKK[navn][1]);
    const K = LYD_KART[navn];
    if (K && K.mus && M && Lydbank.har(K.s[0][0]) && M.pynt(K.mus, vol)) return;
    if (K && Lydbank.har(K.s[0][0])) { Lydbank.kart(K, navn, vol, pitch); if (K.syn) _play.call(Sound, navn, vol * K.syn, pitch); return; }
    _play.call(Sound, navn, vol, pitch);
  };
  // dronen fra synthen ligger under sløyfene, svakere når de er klare
  Sound.startAmbience = function (depth) {
    Sound.droneNiva = Lydbank.paa && typeof LYDFILER === 'object' ? Stemning.droneNiva : 1; _start.call(Sound, depth); Stemning.start(depth);
    // den nye dronen stemmes med en gang etter stykket som spiller (eller som kommer på neste taktstrek)
    if (typeof Musikk === 'object' && Musikk.S) { const S = STYKKER[Musikk.neste] || Musikk.S; Sound.stemDrone(midiHz(S.rot - 24)); }
  };
  Sound.stopAmbience = function () { _stopp.call(Sound); Stemning.stopp(); };
  Sound.vaer = function (type) { Sound.vaerType = type || null; if (type && Lydbank.har(type === 'regn' ? 'amb_regn' : 'amb_vind')) { _vaer.call(Sound, null); return; } _vaer.call(Sound, type); };
}
