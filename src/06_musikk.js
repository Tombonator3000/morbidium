/* ============================================================
   MUSIKK  -  et lite iMUSE i nettleseren
   Stykkene er skrevet som data (taktart, toneart, akkordrekke og stil), og melodien lages av et
   fast frø per takt, så den gjentar seg som en melodi skal. Morbidium i blodet drar tonene skjeve.
   Stilen er en sanatoriumsgrammofon fra 1923: spilledåse, vals, orgel og klokker.

   Som iMUSE hos LucasArts (Monkey Island 2) glir alt over i hverandre i takt:
   - Et nytt stykke begynner på neste taktstrek. Den siste takten før byttet får en bro: en harpe
     løper opp dominanten i den nye tonearten, og et bekken svulmer inn i første slag, der paukene
     slår den nye grunntonen. Ingenting starter på nytt fra stillhet.
   - Besetningen følger rommet: samme stykke spilles på orgel i kapellet, piano i spisesalen,
     vibrafon med drypp på badet, cembalo og skrivemaskin i arkivet og saksofon i Venterommet.
     Byttet skjer på taktstreken, så melodien bare går over i et nytt instrument.
   - Kamplaget og sjefslaget kommer inn på neste slag med et bekkenslag, og går ut på neste taktstrek.
   - Innslag i samme toneart på neste slag: rommet er ryddet, et nytt nivå, sjefen kommer.
     Lydeffekter som plinger (tenner, helse, høyttaleren) stemmes etter akkorden som spilles, og
     stemningslyder som drypper, tikker og ringer, legges på slaget (42_lyd.js).
   - Når det har vært rolig en stund, trekker musikken seg tilbake og stemningen kommer fram, med
     bare en og annen tone. Når noe skjer, er den der igjen.
   - Dronen i veggene stemmes etter grunntonen i stykket (Sound.stemDrone).
   Instrumentene er ekte opptak fra lydbanken (VCSL, CC0) når de er pakket ut, ellers synth.
   Planlegging med forhåndsvisning (Chris Wilsons «A Tale of Two Clocks»).
   ============================================================ */
const midiHz = n => 440 * Math.pow(2, (n - 69) / 12);
const hzMidi = f => 69 + 12 * Math.log2(f / 440);
const SKALA = { moll: [0, 2, 3, 5, 7, 8, 10], harm: [0, 2, 3, 5, 7, 8, 11], frygisk: [0, 1, 3, 5, 7, 8, 10], dur: [0, 2, 4, 5, 7, 9, 11] };
/* akk er trinn i skalaen (0 = grunntone), én akkord per takt */
const STYKKER = {
  tittel: { bpm: 74, takt: 3, rot: 57, skala: 'harm', akk: [0, 3, 4, 0, 5, 3, 4, 4], mel: 'spilledaase', stil: 'vals', knitr: .6, tetthet: .7 },
  e1: { bpm: 84, takt: 3, rot: 50, skala: 'moll', akk: [0, 5, 3, 4, 0, 3, 4, 0], mel: 'celesta', stil: 'vals', knitr: .15, tetthet: .55 },
  e2: { bpm: 70, takt: 4, rot: 48, skala: 'harm', akk: [0, 0, 5, 5, 3, 3, 4, 4], mel: 'orgel', stil: 'sakte', drypp: true, tetthet: .35 },
  e3: { bpm: 100, takt: 4, rot: 52, skala: 'frygisk', akk: [0, 1, 0, 6, 0, 1, 3, 4], mel: 'cembalo', stil: 'marsj', maskin: true, tetthet: .45 },
  e4: { bpm: 58, takt: 4, rot: 45, skala: 'frygisk', akk: [0, 1, 0, 1, 5, 4, 1, 0], mel: 'klokke', stil: 'kor', tetthet: .3 },
  tjeneste: { bpm: 104, takt: 3, rot: 55, skala: 'dur', akk: [0, 3, 4, 0, 0, 5, 1, 4], mel: 'spilledaase', stil: 'vals', knitr: 1, tetthet: .8, grammofon: true },
  // Parken: en vals fra musikkpaviljongen, langt borte og litt falsk
  park: { bpm: 78, takt: 3, rot: 53, skala: 'moll', akk: [0, 3, 4, 0, 5, 3, 1, 4], mel: 'celesta', stil: 'vals', knitr: .25, tetthet: .42, grammofon: true },
  // Nattskogen: langsomt og drømmende, klokker som en vibrafon i tåka
  skog: { bpm: 54, takt: 4, rot: 45, skala: 'harm', akk: [0, 5, 3, 4, 0, 5, 6, 4], mel: 'klokke', stil: 'sakte', tetthet: .26 }
};
/* stykket for hver etasje: to uteetasjer med egne stykker, de fire gamle beholder sine */
const stykkeFor = d => ({ 1: 'park', 2: 'e1', 3: 'e2', 4: 'e3', 5: 'skog', 6: 'e4' }[d] || 'e4');
function frø(a) { let t = a + 0x6D2B79F5 | 0; t = Math.imul(t ^ t >>> 15, 1 | t); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; }

/* besetningene: hvem spiller melodien (mel), akkordene (akk) og bassen (bass), hvor mye klang (rv),
   pynt (klokke eller glockenspiel innimellom), drypp, skrivemaskin (maskin), visper (borste) og grammofon */
const BESETNING = {
  kapell: { mel: 'orgel', akk: 'orgel', bass: 'orgelbass', rv: .55, pynt: 'klokke' },
  kafe: { mel: 'piano', akk: 'piano', bass: 'piano', rv: .15, grammofon: true },
  bad: { mel: 'vibrafon', akk: 'vibrafon', bass: 'harpe', rv: .6, drypp: .35 },
  arkiv: { mel: 'cembalo', akk: 'cembalo', bass: 'cembalo', rv: .2, maskin: .5 },
  kjeller: { mel: 'psalter', akk: 'orgel', bass: 'orgelbass', rv: .5, drypp: .12 },
  venterom: { mel: 'saks', akk: 'vibrafon', bass: 'pizz', rv: .35, borste: 1 },
  behandling: { mel: 'klokke', akk: 'vibrafon', bass: 'pizz', rv: .4 },
  hage: { mel: 'harpe', akk: 'harpe', bass: 'pizz', rv: .3, pynt: 'glock' },
  skog: { mel: 'glock', akk: 'harpe', bass: 'pizz', rv: .55 },
  drom: { mel: 'vinglass', akk: 'glock', bass: 'harpe', rv: .7 }
};
/* romtype -> besetning. Rommene som ikke står her, får stykkets egne instrumenter. */
const ROM_BESETNING = {
  kapell: 'kapell', likkapell: 'kapell', begravelse: 'kapell', offer: 'kapell',
  spisesal: 'kafe', kafeteria: 'kafe', dagligstue: 'kafe', kjokken: 'kafe',
  bad: 'bad', toalett: 'bad', vaskeri: 'bad', vask: 'bad', tjern: 'bad', fontene: 'bad',
  arkiv: 'arkiv', kartotek: 'arkiv', journal: 'arkiv', bibliotek: 'arkiv', direktor: 'arkiv',
  kjeller: 'kjeller', fyrrom: 'kjeller', likhus: 'kjeller', secret: 'kjeller', cursed: 'kjeller',
  venterom: 'venterom', frisor: 'venterom', medisin: 'behandling',
  behandling: 'behandling', tannlege: 'behandling', rontgen: 'behandling', elektro: 'behandling', operasjon: 'behandling', isolat: 'behandling',
  hage: 'hage', lysthus: 'hage', kirkegard: 'hage', gardsplass: 'hage', drivhus: 'hage', isdam: 'hage', liggehall: 'hage', gardsrom: 'hage', lysgard: 'hage',
  bjorkeskog: 'skog', lysning: 'skog', myr: 'skog', ruin: 'skog', koie: 'skog'
};
/* instrumentene i lydbanken: gruppe (p), oktavflytt (okt), holdt tone med sløyfe, styrke mot synthstemmene (k,
   målt fra lydnivået i opptakene) og reserve i synth når opptaket ikke er klart */
const MUS_INS = {
  orgel: { p: 'ins_orgel', holdt: 1, k: 2, rel: .25, syn: 'orgel' }, orgelbass: { p: 'ins_orgelbass', holdt: 1, k: 2.6, rel: .3, syn: 'orgelbass' },
  piano: { p: 'ins_piano', k: 2.8, rel: .3, syn: 'celesta' }, glock: { p: 'ins_glock', k: 2.4, syn: 'spilledaase' }, vibrafon: { p: 'ins_vibrafon', k: 1.3, syn: 'celesta' },
  klokke: { p: 'ins_klokker', k: 2.6, syn: 'klokke' }, harpe: { p: 'ins_harpe', k: 2.5, syn: 'pizz' }, cembalo: { p: 'ins_cembalo', k: 2.4, rel: .15, syn: 'cembalo' },
  vinglass: { p: 'ins_vinglass', holdt: 1, k: 1.9, rel: .4, syn: 'orgel' }, psalter: { p: 'ins_psalter', holdt: 1, k: 3.4, rel: .35, syn: 'orgel' },
  saks: { p: 'ins_saks', holdt: 1, k: 1.8, rel: .2, syn: 'messing' }, pauke: { p: 'ins_pauke', k: 3.4, syn: 'tom' },
  // spilledåsen er et glockenspiel en oktav opp, celestaen en vibrafon, og pizzicato en harpe
  spilledaase: { p: 'ins_glock', okt: 12, k: 1.9, syn: 'spilledaase' }, celesta: { p: 'ins_vibrafon', okt: 12, k: 1.1, syn: 'celesta' }, pizz: { p: 'ins_harpe', k: 2.6, d: .6, syn: 'pizz' }
};

const Musikk = {
  navn: null, S: null, steg: 0, nesteT: 0, niva: 0, nivaMaal: 0, tempoK: 1, morb: 0, lag: null, bus: null, filt: null, demp: 1,
  neste: null, overgang: null, B: null, bNavn: null, bNeste: undefined, glid: 1, glidMaal: 1, roT: 0, sistRom: -2, innslagK: [], tall: { bytter: 0, broer: 0, besetninger: 0, innslag: 0, nivaer: 0 },
  init() {
    if (this.bus || !Sound.ready) return !!this.bus;
    const c = Sound.ctx;
    this.bus = c.createGain(); this.bus.gain.value = 0;
    this.dukkG = c.createGain();
    this.filt = c.createBiquadFilter(); this.filt.type = 'lowpass'; this.filt.frequency.value = 18000; this.filt.Q.value = .7;
    this.hp = c.createBiquadFilter(); this.hp.type = 'highpass'; this.hp.frequency.value = 20;
    this.bus.connect(this.dukkG); this.dukkG.connect(this.hp); this.hp.connect(this.filt); this.filt.connect(Sound.mus);
    // klang til musikken: egen impulsrespons på 2,4 sekunder, mer i kapellet og på badet
    this.rv = c.createGain(); this.rv.gain.value = .2; const k = c.createConvolver(), n = Math.floor(c.sampleRate * 2.4), ir = c.createBuffer(2, n, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.8) * (i < 60 ? i / 60 : 1); }
    k.buffer = ir; this.bus.connect(this.rv); this.rv.connect(k); k.connect(this.dukkG);
    this.lag = {}; for (const navn of ['grunn', 'mel', 'kamp', 'sjef', 'pynt']) { const g = c.createGain(); g.gain.value = navn === 'kamp' || navn === 'sjef' ? 0 : 1; g.connect(this.bus); this.lag[navn] = g; }
    return true;
  },
  aktiv() { return !!(this.S && this.bus && Sound.ready); },
  /* bytter stykke på neste taktstrek, med bro. straks: på neste slag (sjefen) */
  spill(navn, straks) {
    if (!STYKKER[navn]) return;
    if (!this.init()) { this.venter = navn; return; }
    if (!this.S) { this.start(navn); return; }
    if (this.navn === navn) { if (this.neste) { this.neste = null; this.overgang = null; } return; }
    if (this.neste === navn) return;
    this.neste = navn; this.planlegg(!!straks);
  },
  /* fra stillhet: tittelen, etter døden, første gang */
  start(navn) {
    const c = Sound.ctx, now = c.currentTime; this.navn = navn; this.S = STYKKER[navn]; this.steg = 0; this.nesteT = now + .15; this.neste = null; this.overgang = null;
    this.bus.gain.cancelScheduledValues(now); this.bus.gain.setValueAtTime(0, now); this.bus.gain.linearRampToValueAtTime(this.demp, now + 1.2);
    this.klang(now + .15);
  },
  ett() { return 60 / (this.S.bpm * this.tempoK) / 2; },
  per() { return this.S.takt * 2; },
  /* når skjer byttet: neste taktstrek med minst ett helt slag til broen, eller neste slag */
  planlegg(straks) {
    const per = this.per(), s = this.steg; let b;
    if (straks) b = s + (s % 2 === 0 ? 2 : 1);
    else { b = Math.ceil(s / per) * per; if (b - s < 2) b += per; }
    const T = this.nesteT + (b - s) * this.ett();
    this.overgang = { til: this.neste, b, T, straks };
    // bekkenet svulmer inn mot første slag i det nye stykket; starter midt i lyden hvis det er kort tid igjen
    if (!straks) this.svulm(T, .22);
  },
  svulm(T, v) {
    if (typeof Lydbank !== 'object' || !Lydbank.har('ins_bekken')) return;
    const k = 'ins_bekken_1'; if (!Lydbank.buf[k]) return;
    if (this.toppT === undefined) { const d = Lydbank.buf[k].getChannelData(0), sr = Lydbank.buf[k].sampleRate; let best = 0, bi = 0, s = 0; const w = Math.floor(sr * .02); for (let i = 0; i < d.length; i++) { s += d[i] * d[i]; if (i >= w) s -= d[i - w] * d[i - w]; if (s > best) { best = s; bi = i; } } this.toppT = bi / sr - (Lydbank.forsink[k] || 0); }
    const now = Sound.ctx.currentTime, t0 = Math.max(now + .02, T - this.toppT), fra = Math.max(0, this.toppT - (T - t0));
    if (T - t0 < .25) return;
    Lydbank.spillFil(k, { vol: v, fra, ut: this.lag.pynt, d: T - t0 + .5, rel: .45 }, t0);
  },
  bytt(t) {
    const o = this.overgang, fra = this.S; this.overgang = null; this.neste = null; this.tall.bytter++;
    this.navn = o.til; this.S = STYKKER[o.til]; this.steg = 0;
    // første slag i det nye stykket: pauke på grunntonen og et lite bekkenslag
    this.note('pauke', this.S.rot - 12, t, 1.2, o.straks ? .22 : .14, this.lag.pynt);
    if (o.straks) this.slagverk('gong', t, .3); else this.slagverk('bekken', t, .06);
    if (fra.bpm !== this.S.bpm) this.tall.tempo = (this.tall.tempo || 0) + 1;
    this.klang(t);
  },
  /* filter, klang og drone etter stykket og besetningen */
  klang(t) {
    const B = this.B, g = !!(this.S && this.S.grammofon) || !!(B && B.grammofon), c = Sound.ctx, n = Math.max(t, c.currentTime);
    this.filt.frequency.setTargetAtTime(g ? 2600 : 18000, n, .3); this.hp.frequency.setTargetAtTime(g ? 380 : 20, n, .3);
    this.rv.gain.setTargetAtTime(B ? B.rv ?? .2 : this.S && this.S.stil === 'kor' ? .45 : .2, n, .5);
    if (this.S) Sound.stemDrone && Sound.stemDrone(midiHz(this.S.rot - 24));
  },
  /* besetningen følger rommet; byttes på neste taktstrek */
  besett(navn) {
    navn = navn && BESETNING[navn] ? navn : null;
    if (this.bNeste === undefined ? navn === this.bNavn : navn === this.bNeste) return;
    this.bNeste = navn === this.bNavn ? undefined : navn;
    if (!this.S) { this.bNavn = navn; this.B = navn ? BESETNING[navn] : null; this.bNeste = undefined; }
  },
  byttBesetning(t) { this.bNavn = this.bNeste; this.B = this.bNavn ? BESETNING[this.bNavn] : null; this.bNeste = undefined; this.tall.besetninger++; this.klang(t); },
  stopp(fade = 1) {
    this.navn = null; this.S = null; this.neste = null; this.overgang = null; this.innslagK = [];
    if (!this.bus) return; const now = Sound.ctx.currentTime; this.bus.gain.cancelScheduledValues(now); this.bus.gain.setTargetAtTime(0, now, fade / 3);
  },
  /* 0 utforsking, 1 kamp, 2 sjef. Opp på neste slag, ned på neste taktstrek */
  settNiva(n) {
    this.nivaMaal = n;
    if (!this.lag || !this.S) { if (this.lag && n !== this.niva) this.byttNiva(Sound.ctx.currentTime); return; }
  },
  byttNiva(t) {
    const n = this.nivaMaal, opp = n > this.niva, ett = this.S ? this.ett() : .3, per = this.S ? this.per() : 6; this.niva = n; this.tall.nivaer++;
    this.lag.kamp.gain.setTargetAtTime(n >= 1 ? 1 : 0, t, opp ? .03 : ett * per / 3); this.lag.sjef.gain.setTargetAtTime(n >= 2 ? 1 : 0, t, opp ? .03 : ett * 2);
    this.tempoK = n >= 2 ? 1.12 : n >= 1 ? 1.06 : 1;
    if (opp && this.S) { this.slagverk('bekken', t, .12); this.note('pauke', this.S.rot - 12, t, 1, .16, this.lag.pynt); }
  },
  dempet(on) { const d = on ? .45 : 1; if (d === this.demp) return; this.demp = d; if (this.bus && this.S) this.bus.gain.setTargetAtTime(this.demp, Sound.ctx.currentTime, .3); },
  /* store smell: musikken dukker unna et øyeblikk */
  dukk(m = .5, t = .35) { if (!this.dukkG) return; const now = Sound.ctx.currentTime; this.dukkG.gain.cancelScheduledValues(now); this.dukkG.gain.setTargetAtTime(1 - m, now, .015); this.dukkG.gain.setTargetAtTime(1, now + t, .35); },
  /* hvor mye stemningen skal fram når musikken trekker seg tilbake (42_lyd.js) */
  stemningK() { return 1.3 - .3 * this.glid; },
  /* dirigenten (fra hovedløkka): stykke, besetning, lag og hvor mye musikk det skal være */
  velg(dt) {
    const P = G.player; if (!P) return;
    const rr = typeof roomAt === 'function' ? roomAt(P.x, P.z) : -1, rom = rr >= 0 && G.F ? G.F.rooms[rr] : null, sjef = !!(G.boss && G.boss.alive && G.combat && G.combat.boss);
    this.spill(G.drom ? G.drom.musikk : !G.combat && rom && rom.role === 'service' ? 'tjeneste' : stykkeFor(G.depth));
    this.besett(G.drom ? 'drom' : sjef ? null : rom ? ROM_BESETNING[rom.template] || (rom.role === 'service' ? ROM_BESETNING[rom.service] : null) || null : null);
    this.settNiva(sjef ? 2 : G.combat ? (typeof Kombo === 'object' && Kombo.n >= 35 ? 2 : 1) : 0);
    // roen: nytt rom, kamp eller fiender i nærheten gir full musikk; etter en halv time uten (i spilltid: et halvt minutt) glir den over i stemning
    if (rr !== this.sistRom) { this.sistRom = rr; this.roT = Math.min(this.roT, 6); }
    const naer = G.enemies && G.enemies.some(e => e.alive && d2(e.x, e.z, P.x, P.z) < 64);
    if (G.combat || naer || G.drom || (rom && rom.role === 'service')) this.roT = 0; else this.roT += dt;
    this.glidMaal = this.roT < 20 ? 1 : this.roT < 32 ? 1 - (this.roT - 20) / 12 * .65 : .35;
    this.glid += (this.glidMaal - this.glid) * (1 - Math.exp(-dt / (this.glidMaal > this.glid ? 1.2 : 5)));
    if (this.lag && Math.abs(this.glid - (this.glidSatt ?? -1)) > .01) { const now = Sound.ctx.currentTime; this.glidSatt = this.glid; this.lag.grunn.gain.setTargetAtTime(.45 + .55 * this.glid, now, .5); this.lag.mel.gain.setTargetAtTime(.3 + .7 * this.glid, now, .5); }
  },
  tick() {
    if (this.venter && this.init()) { const v = this.venter; this.venter = null; this.spill(v); }
    if (!this.S || !Sound.ready) return;
    const c = Sound.ctx;
    if (this.nesteT < c.currentTime - .5) { this.nesteT = c.currentTime + .05; if (this.overgang) { this.overgang.b = this.steg; } } // etter pause eller skjult fane
    while (this.nesteT < c.currentTime + .25) {
      const t = this.nesteT;
      if (this.overgang && this.steg >= this.overgang.b) this.bytt(t);
      const per = this.per(), i = this.steg % per;
      if (this.bNeste !== undefined && i === 0) this.byttBesetning(t);
      if (this.nivaMaal !== this.niva && ((this.nivaMaal > this.niva && i % 2 === 0) || i === 0)) this.byttNiva(t);
      const ett = this.ett(); this.spillSteg(this.steg, t, ett); this.nesteT += ett; this.steg++;
    }
  },
  /* ---------- noter ---------- */
  /* tone i skalaen som MIDI-nummer med desimaler; mørket drar den skjev */
  tone(trinn, okt = 0) {
    const sk = SKALA[this.S.skala], n = sk.length, i = ((trinn % n) + n) % n, o = Math.floor(trinn / n);
    let m = this.S.rot + sk[i] + 12 * (o + okt);
    if (this.morb > .3 && Math.random() < (this.morb - .3) * .35) m += Math.random() < .5 ? 1 : -1; // mørket drar tonen en halvtone skjev
    return m + (Math.random() - .5) * this.morb * .4;
  },
  akkord(takt) { const d = this.S.akk[((takt % this.S.akk.length) + this.S.akk.length) % this.S.akk.length]; return [d, d + 2, d + 4]; },
  takt() { return Math.floor(this.steg / this.per()); },
  /* én tone: opptak når det er klart, ellers synth. f er MIDI-nummer (med desimaler) */
  note(navn, m, t, d, v, ut) {
    const I = MUS_INS[navn];
    if (I && typeof Lydbank === 'object' && Lydbank.har(I.p)) {
      const mm = m + (I.okt || 0), L = Lydbank.gruppeListe()[I.p]; let best = null, bd = 99;
      for (const k of L) { const r = LYD_META[k].rot; if (!Lydbank.buf[k] || r == null) continue; const dd = Math.abs(mm - r); if (dd < bd) { bd = dd; best = k; } }
      if (best) {
        const dur = I.d ? Math.min(d, I.d) : d;
        Lydbank.spillFil(best, { vol: v * I.k, pitch: Math.pow(2, (mm - LYD_META[best].rot) / 12), ut, loop: !!I.holdt, d: I.holdt ? Math.max(.2, dur) : Math.max(dur + (I.rel || .6), .25), rel: I.holdt ? I.rel || .2 : I.rel || .6, a: I.holdt ? .02 : 0 }, t);
        return;
      }
    }
    this.ins(I ? I.syn : navn, midiHz(m), t, d, v, ut);
  },
  /* slagverk uten tone: bekken, gong, virvel, skarptromme og stortromme fra lydbanken */
  slagverk(navn, t, v, pitch = 1, ut = this.lag.pynt) {
    const g = { bekken: 'ins_bekken_2', svulm: 'ins_bekken_1', gong: 'ins_gong', virvel: 'ins_paukevirvel', skarp: 'ins_skarp', kick: 'ins_stortromme', triangel: 'ins_triangel', blokk: 'ins_treblokk' }[navn];
    // synthtrommene hadde mer trykk enn opptakene ved samme tall
    if (typeof Lydbank !== 'object' || !Lydbank.har(g.replace(/_\d$/, ''))) { if (navn === 'kick' || navn === 'skarp') this.ins(navn, 0, t, navn === 'kick' ? .2 : .12, v, ut); return; }
    const k = /_\d$/.test(g) ? g : null, vol = v * (navn === 'kick' ? 2.4 : navn === 'skarp' ? 1.8 : 1); if (k && !Lydbank.buf[k]) return;
    if (k) Lydbank.spillFil(k, { vol, pitch, ut }, t); else Lydbank.spill(g, { vol, pitch, ut, t });
  },
  spillSteg(steg, t, ett) {
    const S = this.S, B = this.B || {}, per = S.takt * 2, i = steg % per, takt = Math.floor(steg / per), A = this.akkord(takt), r = frø(takt % 8 * 131 + i * 17 + S.rot);
    const G0 = this.lag.grunn, M = this.lag.mel, K = this.lag.kamp, J = this.lag.sjef, P0 = this.lag.pynt, slag = i % 2 === 0, ny = i === 0;
    const mel = B.mel || S.mel, akk = B.akk, bass = B.bass, O = this.overgang;
    // innslagene kommer på neste slag
    if (slag && this.innslagK.length) { for (const k of this.innslagK.splice(0)) this.spillInnslag(k, t, ett); }
    // broen: det siste slaget før et nytt stykke. Det gamle klinger ut, og harpa løper opp dominanten i den nye tonearten
    if (O && !O.straks && steg >= O.b - 2) { if (steg === O.b - 2) this.bro(O, t, ett); return; }
    if (O && O.straks && steg === O.b - 1) { this.slagverk('virvel', t, .3); }
    // grunnlaget
    if (S.stil === 'vals') {
      if (ny) this.note(bass || 'pizz', this.tone(A[0], -1), t, .5, .22, G0);
      if (i === 2 || i === 4) for (const n of A) akk ? this.note(akk, this.tone(n), t, .3, .03, G0) : this.ins('pust', midiHz(this.tone(n)), t, .22, .045, G0);
    } else if (S.stil === 'sakte') {
      if (ny) { this.note(bass || 'orgelbass', this.tone(A[0], -1), t, ett * per, .1, G0); for (const n of A) this.note(akk || 'orgel', this.tone(n), t, ett * per * .95, .028, G0); }
    } else if (S.stil === 'marsj') {
      if (i === 0 || i === 4) this.note(bass || 'pizz', this.tone(A[i ? 2 : 0], -1), t, .3, .2, G0);
      this.note(akk || 'cembalo', this.tone(A[[0, 1, 2, 1][i % 4]] + (i >= 4 ? 7 : 0)), t, .25, .045, G0);
    } else if (S.stil === 'kor') {
      if (ny) { for (const n of A) akk ? this.note(akk, this.tone(n), t, ett * per * 1.05, .028, G0) : this.ins('kor', midiHz(this.tone(n)), t, ett * per * 1.1, .03, G0); if (takt % 2 === 0) this.note('klokke', this.tone(A[0]), t, 3, .1, G0); }
    }
    // melodi: akkordtoner på slag, naboer mellom, pauser etter tettheten (og færre når musikken har trukket seg tilbake)
    if (r < S.tetthet * (slag ? 1 : .55) * (.25 + .75 * this.glid)) {
      const trinn = slag ? A[Math.floor(frø(takt * 7 + i) * 3)] + 7 : A[0] + 7 + Math.floor(frø(takt * 11 + i) * 5) - 2, lang = mel === 'orgel' || mel === 'psalter' || mel === 'vinglass' || mel === 'saks';
      this.note(mel, this.tone(trinn), t, lang ? ett * 3 : .9, lang ? .05 : .13, M);
    }
    // pynt og lyder fra rommet, stemt og på slaget
    if ((S.knitr || B.grammofon) && Math.random() < (S.knitr || .5) * .45) this.ins('knitr', 0, t + Math.random() * ett, .01, .02 + Math.random() * .05, G0);
    if ((S.drypp || B.drypp) && Math.random() < (B.drypp || .05)) this.drypp(this.tone(A[Math.floor(Math.random() * 3)] + 7), t + (Math.random() < .5 ? 0 : ett / 2), G0);
    if ((S.maskin || B.maskin) && Math.random() < (B.maskin ? .18 : .12)) this.maskin(t, ett, G0);
    if ((S.maskin || B.maskin) && i === per - 1 && takt % 4 === 3) this.ding(t, G0);
    if (B.borste && slag && i !== 0) this.stoy({ t, d: .14, v: .025, ut: G0, ft: 'bandpass', ff: 3200, q: .6 });
    if (B.pynt && ny && takt % 4 === 0) this.note(B.pynt, this.tone(A[0], B.pynt === 'glock' ? 2 : 0), t, 3, .08, P0);
    // kamplaget: trommer og bass i åttendeler
    if (this.niva >= 1) {
      const fjerde = S.takt === 4;
      if (i === 0 || (fjerde && i === 4)) this.slagverk('kick', t, .5, 1, K);
      if ((fjerde && (i === 2 || i === 6)) || (!fjerde && (i === 2 || i === 4))) this.slagverk('skarp', t, fjerde ? .22 : .14, .95 + Math.random() * .1, K);
      this.ins('hatt', 0, t, .04, slag ? .05 : .03, K);
      this.ins('sagbass', midiHz(this.tone(i % 4 === 2 ? A[2] : A[0], -2)), t, ett * .9, .1, K);
    }
    // sjefslaget: messing på hver ny akkord, pauker på grunntonen og en virvel på slutten av frasen
    if (this.niva >= 2) {
      if (ny || i === 3) for (const n of A) this.ins('messing', midiHz(this.tone(n)), t, ny ? .5 : .2, .045, J);
      if (ny) this.note('pauke', this.tone(A[0], -2), t, 1, .2, J);
      if (takt % 4 === 3 && i >= per - 3) this.note('pauke', this.tone(A[0], -2) + (i === per - 1 ? 7 : 0), t, .4, .16, J);
    }
  },
  /* broen til et nytt stykke: harpa løper opp dominanten (V) i den nye tonearten, og bassen står på den */
  bro(O, t, ett) {
    const N = STYKKER[O.til], sk = SKALA[N.skala], trinn = [4, 6, 8, 11, 13], tone = s => N.rot + sk[((s % 7) + 7) % 7] + 12 * Math.floor(s / 7);
    const steg = ett * 2 / trinn.length; this.tall.broer++;
    trinn.forEach((s, k) => this.note('harpe', tone(s), t + k * steg, .8, .09, this.lag.pynt));
    this.note('pizz', tone(4) - 12, t, ett * 2, .18, this.lag.pynt);
  },
  drypp(m, t, ut) {
    if (typeof Lydbank === 'object' && Lydbank.har('drypp')) { Lydbank.spill('drypp', { vol: .35, pitch: Math.pow(2, (m - 84) / 12 / 2), t, ut, rv: .3 }); return; }
    this.ins('drypp', midiHz(m), t, .08, .05, ut);
  },
  maskin(t, ett, ut) {
    const har = typeof Lydbank === 'object' && Lydbank.buf.skrivemaskin;
    for (let k = 0; k < 3; k++) { if (har) Lydbank.spillFil('skrivemaskin', { vol: .12, pitch: .95 + Math.random() * .1, ut, d: .12 }, t + k * ett / 3); else this.ins('klikk', 0, t + k * ett / 3, .02, .06, ut); }
  },
  ding(t, ut) { if (typeof Lydbank === 'object' && Lydbank.buf.skrivemaskin_2) Lydbank.spillFil('skrivemaskin_2', { vol: .18, ut, fra: .25 }, t); else this.ins('ding', 2600, t, .7, .05, ut); },
  /* ---------- innslag og plasseringen av lydeffekter ---------- */
  innslag(type) { if (!this.aktiv()) return false; if (this.innslagK.length < 3) this.innslagK.push(type); this.tall.innslag++; return true; },
  spillInnslag(type, t, ett) {
    const A = this.akkord(this.takt()), P0 = this.lag.pynt;
    if (type === 'ryddet') {
      [0, 1, 2, 3, 4, 5].forEach(k => this.note('harpe', this.tone(A[k % 3] + 7 * Math.floor(k / 3)), t + k * ett / 3, 1.2, .1, P0));
      this.note('klokke', this.tone(A[0]), t + ett * 2, 3, .09, P0); this.slagverk('triangel', t + ett * 2, .25);
    } else if (type === 'niva') {
      for (let k = 0; k < 8; k++) this.note('harpe', this.tone(k + 7), t + k * ett / 4, 1, .09, P0);
      this.note('glock', this.tone(A[0] + 14), t + ett * 2, 1.5, .1, P0); this.slagverk('triangel', t + ett * 2, .3);
    } else if (type === 'hel') {
      [0, 1, 2].forEach(k => this.note('vibrafon', this.tone(A[k] + 7), t + k * ett / 2, 1.4, .08, P0));
    } else if (type === 'sjef') {
      this.slagverk('gong', t, .5); this.slagverk('virvel', t, .35);
      this.note('orgelbass', this.tone(0, -2), t, 3, .12, P0); this.note('orgel', this.tone(0), t, 2.6, .05, P0); this.note('orgel', this.tone(0) + 1, t, 2.6, .04, P0);
    }
  },
  /* neste åttendel eller neste taktstrek, i lydkortets tid, og en tonehøyde i akkorden (for drypp og tikk) */
  slag(kvant) {
    if (!this.aktiv()) return null;
    const ett = this.ett(), per = this.per(), til = kvant === 2 ? (per - this.steg % per) % per : 0, A = this.akkord(this.takt());
    const sk = SKALA[this.S.skala], trinn = A[Math.floor(Math.random() * 3)], halv = sk[((trinn % 7) + 7) % 7] - sk[A[0] % 7];
    return { t: this.nesteT + til * ett, stem: Math.pow(2, (((halv % 12) + 12) % 12 - 5) / 12) };
  },
  /* en tone fra lydeffektene (Hz) flyttes til nærmeste tone i akkorden som spilles */
  stem(hz) {
    if (!this.aktiv()) return 1;
    const m = hzMidi(hz), A = this.akkord(this.takt()), sk = SKALA[this.S.skala], pcs = A.map(s => (this.S.rot + sk[((s % 7) + 7) % 7]) % 12);
    let best = m, bd = 99; for (const pc of pcs) for (const o of [-1, 0, 1]) { const c0 = Math.round((m - pc) / 12 + o) * 12 + pc, dd = Math.abs(c0 - m); if (dd < bd) { bd = dd; best = c0; } }
    return Math.pow(2, (best - m) / 12);
  },
  /* en tone fra et instrument på neste slag eller taktstrek, på grunntonen i akkorden (klokka som slår i det fjerne) */
  pynt(navn, vol = 1, kvant = 2) {
    if (!this.aktiv()) return false; const q = this.slag(kvant), A = this.akkord(this.takt() + (kvant === 2 ? 1 : 0));
    this.note(navn, this.tone(A[0], navn === 'klokke' ? 0 : 1), q.t, 3, .09 * vol, this.lag.pynt); return true;
  },
  /* ---------- synthstemmene (reserve og det som ikke finnes som opptak) ---------- */
  stemme(o) {
    const c = Sound.ctx, os = c.createOscillator(), g = c.createGain(); let ut = os;
    os.type = o.w; os.frequency.setValueAtTime(o.f, o.t); if (o.f1) os.frequency.exponentialRampToValueAtTime(o.f1, o.t + (o.fd || o.d));
    if (o.lp) { const f = c.createBiquadFilter(); f.type = o.bp ? 'bandpass' : 'lowpass'; f.Q.value = o.q || .8; f.frequency.setValueAtTime(o.lp, o.t); if (o.lp1) f.frequency.exponentialRampToValueAtTime(o.lp1, o.t + (o.lpd || o.d)); os.connect(f); ut = f; }
    if (o.vib) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = o.vib; lg.gain.value = o.vibD || 6; l.connect(lg); lg.connect(os.detune); l.start(o.t); l.stop(o.t + o.d + .6); }
    const a = o.a || .004; g.gain.setValueAtTime(.0001, o.t); g.gain.linearRampToValueAtTime(o.v, o.t + a);
    if (o.hold) { g.gain.setValueAtTime(o.v, o.t + Math.max(a, o.d - (o.rel || .2))); g.gain.linearRampToValueAtTime(.0001, o.t + o.d); }
    else g.gain.exponentialRampToValueAtTime(.0001, o.t + o.d);
    ut.connect(g); g.connect(o.ut); os.start(o.t); os.stop(o.t + o.d + .05);
  },
  stoy(o) {
    const c = Sound.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = Sound.noiseBuf; f.type = o.ft; f.frequency.value = o.ff; f.Q.value = o.q || .8;
    g.gain.setValueAtTime(o.v, o.t); g.gain.exponentialRampToValueAtTime(.0001, o.t + o.d);
    s.connect(f); f.connect(g); g.connect(o.ut); s.start(o.t, Math.random() * .5, o.d + .05);
  },
  ins(navn, f, t, d, v, ut) {
    const s = (o) => this.stemme(Object.assign({ t, d, v, ut, f }, o)), n = (o) => this.stoy(Object.assign({ t, d, v, ut }, o));
    switch (navn) {
      case 'spilledaase': s({ w: 'sine', d: 1.3 }); s({ w: 'sine', f: f * 2, d: .45, v: v * .35 }); s({ w: 'triangle', f: f * 4, d: .08, v: v * .15 }); break;
      case 'celesta': s({ w: 'triangle', d: 1 }); s({ w: 'sine', f: f * 4.01, d: .18, v: v * .25 }); break;
      case 'orgel': s({ w: 'square', f: f * 1.004, a: .09, hold: true, rel: .2, lp: 1500, q: .5 }); s({ w: 'square', f: f * .996, a: .09, hold: true, rel: .2, lp: 1500, q: .5, v: v * .8 }); break;
      case 'orgelbass': s({ w: 'sawtooth', a: .06, hold: true, rel: .3, lp: 320 }); break;
      case 'cembalo': s({ w: 'sawtooth', a: .001, lp: 3200, lp1: 700, lpd: .25 }); break;
      case 'klokke': s({ w: 'sine' }); s({ w: 'sine', f: f * 2.76, v: v * .4, d: d * .6 }); s({ w: 'sine', f: f * 5.4, v: v * .2, d: d * .3 }); break;
      case 'kor': s({ w: 'sawtooth', a: .7, hold: true, rel: .8, lp: 850, bp: true, q: 2.2, vib: 5, vibD: 9 }); s({ w: 'sawtooth', f: f * 1.006, a: .8, hold: true, rel: .8, lp: 1300, bp: true, q: 2, vib: 4.3, vibD: 7, v: v * .8 }); break;
      case 'pizz': s({ w: 'triangle', a: .003, lp: 900 }); break;
      case 'pust': s({ w: 'triangle', f: f * 2, a: .01 }); break;
      case 'sagbass': s({ w: 'sawtooth', a: .005, lp: 700, lp1: 180, lpd: d }); break;
      case 'messing': s({ w: 'sawtooth', a: .03, lp: 500, lp1: 2200, lpd: .06, hold: true, rel: .12 }); s({ w: 'sawtooth', f: f * 1.007, a: .03, lp: 500, lp1: 2000, lpd: .06, hold: true, rel: .12, v: v * .8 }); break;
      case 'kick': s({ w: 'sine', f: 120, f1: 38, fd: .16 }); break;
      case 'tom': s({ w: 'sine', f: 150, f1: 80, fd: .25 }); n({ ft: 'lowpass', ff: 900, v: v * .3, d: .08 }); break;
      case 'skarp': n({ ft: 'bandpass', ff: 1900, q: .9 }); s({ w: 'triangle', f: 190, d: .07, v: v * .5 }); break;
      case 'hatt': n({ ft: 'highpass', ff: 7200 }); break;
      case 'knitr': n({ ft: 'highpass', ff: 2500, d: .012 }); break;
      case 'klikk': n({ ft: 'highpass', ff: 3200, d: .018 }); break;
      case 'ding': s({ w: 'sine' }); break;
      case 'drypp': s({ w: 'sine', f1: f * 2.2, fd: .05 }); break;
    }
  },
  /* ---------- stikk ved døden og utskrivningen ---------- */
  stikk(navn) {
    if (!this.init()) return; const t = Sound.ctx.currentTime + .05, ut = this.bus;
    this.bus.gain.cancelScheduledValues(t); this.bus.gain.setValueAtTime(1, t);
    if (navn === 'dod') { [69, 65, 62, 57, 53].forEach((m, i) => this.note('orgel', m, t + i * .32, 1.4 - i * .1, .05, ut)); this.note('orgelbass', 41, t + 1.28, 2.6, .1, ut); this.note('klokke', 45, t + 1.7, 4, .16, ut); this.slagverk('gong', t + 1.7, .25, 1, ut); }
    if (navn === 'seier') { [60, 64, 67, 72, 76, 79, 84].forEach((m, i) => this.note('spilledaase', m, t + i * .16, 1.4, .14, ut)); this.note('klokke', 60, t + 1.2, 3, .1, ut); this.note('harpe', 48, t + 1.2, 2, .12, ut); }
  }
};
