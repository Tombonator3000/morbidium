/* ============================================================
   MUSIKK  -  alt spilles av synth i nettleseren, uten lydfiler.
   Et lite sekvenseringsverk i lag: grunnlaget spiller alltid, kamplaget
   (trommer og drivende bass) og sjefslaget (messing og pauker) toner inn
   etter hvor ille det står til. Hvert stykke har taktart, toneart og
   akkordrekke. Melodien lages av et fast frø per takt, så den gjentar seg
   som en melodi skal, men Morbidium i blodet drar tonene skjeve.
   Stilen er en sanatoriumsgrammofon fra 1923: spilledåse, vals og orgel.
   Planlegging med lang nok forhåndsvisning (Chris Wilsons «A Tale of Two Clocks»).
   ============================================================ */
const midiHz = n => 440 * Math.pow(2, (n - 69) / 12);
const SKALA = { moll: [0, 2, 3, 5, 7, 8, 10], harm: [0, 2, 3, 5, 7, 8, 11], frygisk: [0, 1, 3, 5, 7, 8, 10], dur: [0, 2, 4, 5, 7, 9, 11] };
/* akk er trinn i skalaen (0 = grunntone), én akkord per takt */
const STYKKER = {
  tittel: { bpm: 74, takt: 3, rot: 57, skala: 'harm', akk: [0, 3, 4, 0, 5, 3, 4, 4], mel: 'spilledaase', stil: 'vals', knitr: .6, tetthet: .7 },
  e1: { bpm: 84, takt: 3, rot: 50, skala: 'moll', akk: [0, 5, 3, 4, 0, 3, 4, 0], mel: 'celesta', stil: 'vals', knitr: .15, tetthet: .55 },
  e2: { bpm: 70, takt: 4, rot: 48, skala: 'harm', akk: [0, 0, 5, 5, 3, 3, 4, 4], mel: 'orgel', stil: 'sakte', drypp: true, tetthet: .35 },
  e3: { bpm: 100, takt: 4, rot: 52, skala: 'frygisk', akk: [0, 1, 0, 6, 0, 1, 3, 4], mel: 'cembalo', stil: 'marsj', maskin: true, tetthet: .45 },
  e4: { bpm: 58, takt: 4, rot: 45, skala: 'frygisk', akk: [0, 1, 0, 1, 5, 4, 1, 0], mel: 'klokke', stil: 'kor', tetthet: .3 },
  tjeneste: { bpm: 104, takt: 3, rot: 55, skala: 'dur', akk: [0, 3, 4, 0, 0, 5, 1, 4], mel: 'spilledaase', stil: 'vals', knitr: 1, tetthet: .8, grammofon: true }
};
function frø(a) { let t = a + 0x6D2B79F5 | 0; t = Math.imul(t ^ t >>> 15, 1 | t); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; }

const Musikk = {
  navn: null, S: null, steg: 0, nesteT: 0, niva: 0, tempoK: 1, morb: 0, lag: null, bus: null, filt: null, demp: 1,
  init() {
    if (this.bus || !Sound.ready) return !!this.bus;
    const c = Sound.ctx;
    this.bus = c.createGain(); this.bus.gain.value = 0;
    this.filt = c.createBiquadFilter(); this.filt.type = 'lowpass'; this.filt.frequency.value = 18000; this.filt.Q.value = .7;
    this.hp = c.createBiquadFilter(); this.hp.type = 'highpass'; this.hp.frequency.value = 20;
    this.bus.connect(this.hp); this.hp.connect(this.filt); this.filt.connect(Sound.mus);
    this.lag = {}; for (const k of ['grunn', 'kamp', 'sjef']) { const g = c.createGain(); g.gain.value = k === 'grunn' ? 1 : 0; g.connect(this.bus); this.lag[k] = g; }
    return true;
  },
  /* bytter stykke; samme stykke fortsetter der det var */
  spill(navn) {
    if (!this.init()) { this.venter = navn; return; }
    if (this.navn === navn) return;
    const c = Sound.ctx, now = c.currentTime;
    this.navn = navn; this.S = STYKKER[navn]; this.steg = 0; this.nesteT = now + .25;
    this.bus.gain.cancelScheduledValues(now); this.bus.gain.setValueAtTime(0, now); this.bus.gain.linearRampToValueAtTime(this.demp, now + 1.2);
    const g = !!this.S.grammofon; this.filt.frequency.setTargetAtTime(g ? 2600 : 18000, now, .3); this.hp.frequency.setTargetAtTime(g ? 380 : 20, now, .3);
  },
  stopp(fade = 1) { this.navn = null; this.S = null; if (!this.bus) return; const now = Sound.ctx.currentTime; this.bus.gain.cancelScheduledValues(now); this.bus.gain.setTargetAtTime(0, now, fade / 3); },
  /* 0 utforsking, 1 kamp, 2 sjef */
  settNiva(n) {
    if (!this.lag || n === this.niva) return; this.niva = n; const now = Sound.ctx.currentTime;
    this.lag.kamp.gain.setTargetAtTime(n >= 1 ? 1 : 0, now, n >= 1 ? .4 : 1.2); this.lag.sjef.gain.setTargetAtTime(n >= 2 ? 1 : 0, now, .5);
    this.tempoK = n >= 2 ? 1.12 : n >= 1 ? 1.06 : 1;
  },
  dempet(on) { this.demp = on ? .45 : 1; if (this.bus && this.S) this.bus.gain.setTargetAtTime(this.demp, Sound.ctx.currentTime, .3); },
  tick() {
    if (this.venter && this.init()) { const v = this.venter; this.venter = null; this.spill(v); }
    if (!this.S || !Sound.ready) return;
    const c = Sound.ctx, S = this.S, ett = 60 / (S.bpm * this.tempoK) / 2;
    if (this.nesteT < c.currentTime - .5) this.nesteT = c.currentTime + .05; // etter pause eller skjult fane
    while (this.nesteT < c.currentTime + .22) { this.spillSteg(this.steg, this.nesteT, ett); this.nesteT += ett; this.steg++; }
  },
  /* ---------- noter ---------- */
  tone(trinn, okt = 0) {
    const sk = SKALA[this.S.skala], n = sk.length, i = ((trinn % n) + n) % n, o = Math.floor(trinn / n);
    let m = this.S.rot + sk[i] + 12 * (o + okt);
    if (this.morb > .3 && Math.random() < (this.morb - .3) * .35) m += Math.random() < .5 ? 1 : -1; // mørket drar tonen en halvtone skjev
    return midiHz(m) * Math.pow(2, (Math.random() - .5) * this.morb * 40 / 1200);
  },
  akkord(takt) { const d = this.S.akk[takt % this.S.akk.length]; return [d, d + 2, d + 4]; },
  spillSteg(steg, t, ett) {
    const S = this.S, per = S.takt * 2, i = steg % per, takt = Math.floor(steg / per), A = this.akkord(takt), r = frø(takt % 8 * 131 + i * 17 + S.rot);
    const G0 = this.lag.grunn, K = this.lag.kamp, J = this.lag.sjef, slag = i % 2 === 0, ny = i === 0;
    // grunnlaget
    if (S.stil === 'vals') {
      if (ny) this.ins('pizz', this.tone(A[0], -1), t, .5, .22, G0);
      if (i === 2 || i === 4) for (const n of A) this.ins('pust', this.tone(n), t, .22, .045, G0);
    } else if (S.stil === 'sakte') {
      if (ny) { this.ins('orgelbass', this.tone(A[0], -1), t, ett * per, .1, G0); for (const n of A) this.ins('orgel', this.tone(n), t, ett * per * .95, .028, G0); }
    } else if (S.stil === 'marsj') {
      if (i === 0 || i === 4) this.ins('pizz', this.tone(A[i ? 2 : 0], -1), t, .3, .2, G0);
      this.ins('cembalo', this.tone(A[[0, 1, 2, 1][i % 4]] + (i >= 4 ? 7 : 0)), t, .25, .045, G0);
    } else if (S.stil === 'kor') {
      if (ny) { for (const n of A) this.ins('kor', this.tone(n), t, ett * per * 1.1, .03, G0); if (takt % 2 === 0) this.ins('klokke', this.tone(A[0], -1), t, 3, .1, G0); }
    }
    // melodi: akkordtoner på slag, naboer mellom, pauser etter tettheten
    if (r < S.tetthet * (slag ? 1 : .55)) {
      const trinn = slag ? A[Math.floor(frø(takt * 7 + i) * 3)] + 7 : A[0] + 7 + Math.floor(frø(takt * 11 + i) * 5) - 2;
      this.ins(S.mel, this.tone(trinn), t, S.mel === 'orgel' ? ett * 3 : .9, S.mel === 'orgel' ? .05 : .13, G0);
    }
    if (S.knitr && Math.random() < S.knitr * .45) this.ins('knitr', 0, t + Math.random() * ett, .01, .02 + Math.random() * .05, G0);
    if (S.drypp && Math.random() < .05) this.ins('drypp', 900 + Math.random() * 900, t + Math.random() * ett, .08, .05, G0);
    if (S.maskin && Math.random() < .12) for (let k = 0; k < 3; k++) this.ins('klikk', 0, t + k * ett / 3, .02, .06, G0);
    if (S.maskin && i === per - 1 && takt % 4 === 3) this.ins('ding', 2600, t, .7, .05, G0);
    // kamplaget: trommer og bass i åttendeler
    if (this.niva >= 1) {
      const fjerde = S.takt === 4;
      if (i === 0 || (fjerde && i === 4)) this.ins('kick', 0, t, .2, .5, K);
      if ((fjerde && (i === 2 || i === 6)) || (!fjerde && (i === 2 || i === 4))) this.ins('skarp', 0, t, .12, fjerde ? .22 : .14, K);
      this.ins('hatt', 0, t, .04, slag ? .05 : .03, K);
      this.ins('sagbass', this.tone(i % 4 === 2 ? A[2] : A[0], -2), t, ett * .9, .1, K);
    }
    // sjefslaget: messing på hver ny akkord, pauker på slutten av frasen
    if (this.niva >= 2) {
      if (ny || i === 3) for (const n of A) this.ins('messing', this.tone(n), t, ny ? .5 : .2, .045, J);
      if (takt % 4 === 3 && i >= per - 3) this.ins('tom', 0, t, .3, .35, J);
    }
  },
  /* ---------- instrumenter ---------- */
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
  /* ---------- stikk ---------- */
  stikk(navn) {
    if (!this.init()) return; const t = Sound.ctx.currentTime + .05, ut = this.bus;
    this.bus.gain.cancelScheduledValues(t); this.bus.gain.setValueAtTime(1, t);
    if (navn === 'dod') { [69, 65, 62, 57, 53].forEach((m, i) => this.ins('orgel', midiHz(m - 12), t + i * .32, 1.4 - i * .1, .05, ut)); this.ins('klokke', midiHz(33), t + 1.7, 4, .16, ut); }
    if (navn === 'seier') { [60, 64, 67, 72, 76, 79, 84].forEach((m, i) => this.ins('spilledaase', midiHz(m), t + i * .16, 1.4, .14, ut)); this.ins('klokke', midiHz(48), t + 1.2, 3, .1, ut); }
  }
};
