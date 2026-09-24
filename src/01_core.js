'use strict';
/* ============================================================
   MORBIDIUM  -  kjerne: matte, RNG, lagring, input, lyd
   ============================================================ */
const TAU = Math.PI * 2;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const d2 = (ax, az, bx, bz) => { const dx = ax - bx, dz = az - bz; return dx * dx + dz * dz; };
const angDiff = (a, b) => { let d = (a - b) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };
const $ = id => document.getElementById(id);

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
class RNG {
  constructor(seed) { this.seed = seed >>> 0; this.r = mulberry32(this.seed); }
  next() { return this.r(); }
  range(a, b) { return a + (b - a) * this.r(); }
  int(a, b) { return Math.floor(this.range(a, b + 1)); }
  pick(arr) { return arr[Math.floor(this.r() * arr.length)]; }
  chance(p) { return this.r() < p; }
  shuffle(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(this.r() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }
}
const rnd = (a, b) => a + (b - a) * Math.random();
const rndi = (a, b) => Math.floor(rnd(a, b + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

/* ---------- lagring (try/catch, siden lagring kan mangle) ---------- */
const Store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* lagring utilgjengelig */ } }
};

/* ---------- input ---------- */
const Input = {
  keys: {}, pressed: {}, released: {},
  mouse: { x: 0, y: 0, l: false, r: false, lp: false, rp: false, lr: false, rr: false, moved: false },
  gp: { connected: false, prev: [], cur: [], lx: 0, ly: 0, rx: 0, ry: 0 },
  touch: { active: false, mx: 0, mz: 0, btn: {}, pressed: {}, released: {} },
  lastDevice: 'kb',
  init(canvas) {
    const block = ['Space', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    addEventListener('keydown', e => {
      if (block.includes(e.code) && !(e.target && e.target.tagName === 'INPUT')) e.preventDefault();
      if (!this.keys[e.code]) this.pressed[e.code] = true;
      this.keys[e.code] = true; this.lastDevice = 'kb';
    });
    addEventListener('keyup', e => { this.keys[e.code] = false; this.released[e.code] = true; });
    addEventListener('blur', () => { this.keys = {}; this.mouse.l = this.mouse.r = false; });
    canvas.addEventListener('mousemove', e => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; this.mouse.moved = true; this.lastDevice = 'kb'; });
    canvas.addEventListener('mousedown', e => {
      canvas.focus();
      if (e.button === 0) { this.mouse.l = true; this.mouse.lp = true; }
      if (e.button === 2) { this.mouse.r = true; this.mouse.rp = true; }
      this.lastDevice = 'kb';
    });
    addEventListener('mouseup', e => {
      if (e.button === 0) { this.mouse.l = false; this.mouse.lr = true; }
      if (e.button === 2) { this.mouse.r = false; this.mouse.rr = true; }
    });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    addEventListener('gamepadconnected', () => { this.gp.connected = true; });
    this.initTouch();
  },
  initTouch() {
    const stick = $('stick'), knob = stick.querySelector('i');
    let sid = null, cx = 0, cy = 0;
    const show = () => { if (!this.touch.active) { this.touch.active = true; $('touch').classList.remove('hidden'); document.body.classList.add('touch'); } this.lastDevice = 'touch'; };
    addEventListener('touchstart', show, { passive: true });
    // et ekte tastetrykk betyr tastatur: da skjules berøringsknappene til neste berøring
    addEventListener('keydown', () => { if (this.touch.active) { this.touch.active = false; $('touch').classList.add('hidden'); document.body.classList.remove('touch'); } });
    // evnekortene i HUD-en er selve knappene på berøringsskjerm
    $('cards').addEventListener('touchstart', e => { const c = e.target.closest('.acard'); if (!c) return; const i = +c.id.slice(2); this.touch.pressed['ab' + i] = true; c.classList.add('tap'); setTimeout(() => c.classList.remove('tap'), 120); e.preventDefault(); }, { passive: false });
    stick.addEventListener('touchstart', e => {
      const t = e.changedTouches[0]; sid = t.identifier;
      const r = stick.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; e.preventDefault();
    }, { passive: false });
    stick.addEventListener('touchmove', e => {
      for (const t of e.changedTouches) if (t.identifier === sid) {
        let dx = t.clientX - cx, dy = t.clientY - cy; const L = Math.hypot(dx, dy), m = 55;
        if (L > m) { dx *= m / L; dy *= m / L; }
        knob.style.transform = `translate(${dx}px,${dy}px)`;
        this.touch.mx = dx / m; this.touch.mz = dy / m;
      }
      e.preventDefault();
    }, { passive: false });
    const end = e => { for (const t of e.changedTouches) if (t.identifier === sid) { sid = null; knob.style.transform = ''; this.touch.mx = this.touch.mz = 0; } };
    stick.addEventListener('touchend', end); stick.addEventListener('touchcancel', end);
    this.bindTouchButtons();
  },
  bindTouchButtons() {
    document.querySelectorAll('#tbtns button:not([data-bound])').forEach(b => {
      b.dataset.bound = 1;
      const k = b.dataset.t;
      b.addEventListener('touchstart', e => { this.touch.btn[k] = true; this.touch.pressed[k] = true; e.preventDefault(); }, { passive: false });
      b.addEventListener('touchend', e => { this.touch.btn[k] = false; this.touch.released[k] = true; e.preventDefault(); }, { passive: false });
    });
  },
  pollGamepad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const p = pads && pads[0];
    this.gp.prev = this.gp.cur;
    if (!p) { this.gp.cur = []; this.gp.connected = false; return; }
    this.gp.connected = true;
    this.gp.cur = p.buttons.map(b => b.pressed || b.value > 0.5);
    const dz = v => Math.abs(v) < 0.2 ? 0 : v;
    this.gp.lx = dz(p.axes[0] || 0); this.gp.ly = dz(p.axes[1] || 0);
    this.gp.rx = dz(p.axes[2] || 0); this.gp.ry = dz(p.axes[3] || 0);
    if (this.gp.cur.some(Boolean) || this.gp.lx || this.gp.ly || this.gp.rx || this.gp.ry) this.lastDevice = 'pad';
  },
  gpDown(i) { return !!this.gp.cur[i]; },
  gpPressed(i) { return !!this.gp.cur[i] && !this.gp.prev[i]; },
  gpReleased(i) { return !this.gp.cur[i] && !!this.gp.prev[i]; },
  /* Samler alle enheter til ett handlingssett per bilde */
  actions() {
    const K = this.keys, P = this.pressed, M = this.mouse, T = this.touch;
    const a = { mx: 0, mz: 0, attackP: false, attackD: false, heavyD: false, heavyP: false, heavyR: false,
      dodgeP: false, interactP: false, abP: [false, false, false, false], useP: false, pauseP: false, journalP: false,
      aimStickX: 0, aimStickZ: 0, pad: false, touch: T.active && this.lastDevice === 'touch' };
    if (K.KeyW || K.ArrowUp) a.mz -= 1; if (K.KeyS || K.ArrowDown) a.mz += 1;
    if (K.KeyA || K.ArrowLeft) a.mx -= 1; if (K.KeyD || K.ArrowRight) a.mx += 1;
    a.attackP = M.lp || P.KeyJ; a.attackD = M.l || K.KeyJ;
    a.heavyD = M.r || K.KeyK; a.heavyP = M.rp || P.KeyK; a.heavyR = M.rr || this.released.KeyK;
    a.dodgeP = P.Space || P.ShiftLeft; a.interactP = P.KeyE;
    a.abP = [!!(P.Digit1 || P.KeyQ), !!(P.Digit2 || P.KeyR), !!(P.Digit3 || P.KeyT), !!(P.Digit4 || P.KeyC)];
    a.useP = P.KeyF || P.KeyG; a.pauseP = P.Escape || P.KeyP; a.journalP = !!(P.Tab || P.KeyI);
    // håndkontroll
    if (this.gp.connected) {
      if (this.gp.lx || this.gp.ly) { a.mx += this.gp.lx; a.mz += this.gp.ly; }
      a.aimStickX = this.gp.rx; a.aimStickZ = this.gp.ry;
      if (this.gpPressed(0)) a.attackP = true; if (this.gpDown(0)) a.attackD = true;
      if (this.gpDown(2)) a.heavyD = true; if (this.gpPressed(2)) a.heavyP = true; if (this.gpReleased(2)) a.heavyR = true;
      if (this.gpPressed(1)) a.dodgeP = true; if (this.gpPressed(3)) a.interactP = true;
      if (this.gpPressed(4)) a.abP[0] = true; if (this.gpPressed(5)) a.abP[1] = true;
      if (this.gpPressed(6)) a.abP[2] = true; if (this.gpPressed(7)) a.abP[3] = true;
      if (this.gpPressed(13)) a.useP = true; if (this.gpPressed(9)) a.pauseP = true; if (this.gpPressed(8)) a.journalP = true;
      a.pad = this.lastDevice === 'pad';
    }
    // touch
    if (T.active) {
      a.mx += T.mx; a.mz += T.mz;
      if (T.pressed.attack) a.attackP = true; if (T.btn.attack) a.attackD = true;
      if (T.btn.heavy) a.heavyD = true; if (T.pressed.heavy) a.heavyP = true; if (T.released.heavy) a.heavyR = true;
      if (T.pressed.dodge) a.dodgeP = true; if (T.pressed.interact) a.interactP = true; if (T.pressed.use) a.useP = true;
      for (let i = 0; i < 4; i++) if (T.pressed['ab' + i]) a.abP[i] = true;
    }
    const L = Math.hypot(a.mx, a.mz); if (L > 1) { a.mx /= L; a.mz /= L; }
    return a;
  },
  endFrame() {
    this.pressed = {}; this.released = {};
    this.mouse.lp = this.mouse.rp = this.mouse.lr = this.mouse.rr = false;
    this.touch.pressed = {}; this.touch.released = {};
  }
};

/* ---------- lyd ----------
   Tilpasset fra Geometry 3044 sin SoundSystem (Tombonator3000/3044, MIT):
   prosedyriske synth-lyder med pitch-envelope, filtrert stoy og arpeggio.
   Utvidet med flerlags-lyder, romklang-lignende hale og en ambient drone per etasje. */
const Sound = {
  ctx: null, master: null, sfx: null, amb: null, noiseBuf: null, ready: false, volume: 0.8, ambNodes: [],
  lib: {
    swing: [{ n: 1, d: .13, f0: 2200, f1: 700, ft: 'bandpass', v: .28 }],
    swingHeavy: [{ n: 1, d: .3, f0: 1200, f1: 200, ft: 'bandpass', v: .4 }, { w: 'square', f: 90, d: .25, pd: .5, v: .12 }],
    hit: [{ w: 'sine', f: 170, d: .14, pd: .65, v: .7 }, { n: 1, d: .07, f0: 3000, f1: 400, ft: 'lowpass', v: .45 }],
    hitHeavy: [{ w: 'sine', f: 110, d: .25, pd: .7, v: .9 }, { n: 1, d: .16, f0: 2400, f1: 150, ft: 'lowpass', v: .6 }],
    bonk: [{ w: 'triangle', f: 620, d: .22, pd: .55, v: .5 }, { w: 'sine', f: 930, d: .16, pd: .5, v: .25 }],
    dodge: [{ n: 1, d: .16, f0: 400, f1: 2600, ft: 'highpass', v: .18 }],
    hurt: [{ w: 'sawtooth', f: 240, d: .26, pd: .55, v: .32 }, { n: 1, d: .1, f0: 1800, f1: 300, ft: 'lowpass', v: .3 }],
    die: [{ w: 'square', f: 330, d: .34, pd: .85, v: .2 }, { n: 1, d: .25, f0: 1400, f1: 120, ft: 'lowpass', v: .4 }],
    tooth: [{ arp: [1318, 1760], nl: .045, w: 'sine', v: .22 }],
    morb: [{ w: 'sine', f: 160, d: .35, pd: -1.2, v: .25 }],
    tele: [{ w: 'square', f: 880, d: .05, v: .07 }],
    door: [{ n: 1, d: .35, f0: 500, f1: 60, ft: 'lowpass', v: .6 }, { w: 'sine', f: 55, d: .3, pd: .3, v: .5 }],
    stamp: [{ n: 1, d: .08, f0: 3000, f1: 800, ft: 'lowpass', v: .5 }, { w: 'sine', f: 120, d: .12, pd: .5, v: .6 }],
    pa: [{ arp: [659, 523, 392], nl: .2, w: 'sine', v: .22 }],
    level: [{ arp: [523, 659, 784, 1046], nl: .08, w: 'triangle', v: .25 }],
    spark: [{ n: 1, d: .09, f0: 4000, f1: 6000, ft: 'highpass', v: .3 }],
    zap: [{ w: 'sawtooth', f: 90, d: .3, pd: -.4, v: .25 }, { n: 1, d: .3, f0: 5000, f1: 2000, ft: 'highpass', v: .3 }],
    splash: [{ n: 1, d: .35, f0: 1400, f1: 300, ft: 'bandpass', v: .4 }],
    vomit: [{ n: 1, d: .4, f0: 700, f1: 200, ft: 'bandpass', v: .45 }, { w: 'sawtooth', f: 140, d: .35, pd: .4, v: .12 }],
    boss: [{ w: 'sawtooth', f: 65, d: 1.3, pd: .35, v: .35 }, { n: 1, d: 1, f0: 800, f1: 60, ft: 'lowpass', v: .4 }],
    coo: [{ arp: [420, 380, 430], nl: .09, w: 'sine', v: .2 }],
    pickup: [{ arp: [784, 1175], nl: .06, w: 'triangle', v: .25 }],
    ui: [{ w: 'triangle', f: 660, d: .06, v: .15 }],
    deny: [{ w: 'square', f: 180, d: .16, pd: -.2, v: .15 }],
    slam: [{ w: 'sine', f: 70, d: .5, pd: .6, v: .9 }, { n: 1, d: .4, f0: 1500, f1: 80, ft: 'lowpass', v: .7 }],
    chain: [{ n: 1, d: .18, f0: 5000, f1: 1500, ft: 'bandpass', v: .3 }, { w: 'triangle', f: 1400, d: .1, pd: .2, v: .08 }],
    shoot: [{ w: 'square', f: 700, d: .08, pd: .5, v: .12 }],
    paper: [{ n: 1, d: .12, f0: 6000, f1: 2500, ft: 'highpass', v: .25 }],
    glass: [{ arp: [2100, 2600, 1900], nl: .03, w: 'triangle', v: .15 }, { n: 1, d: .15, f0: 7000, f1: 3000, ft: 'highpass', v: .2 }],
    heal: [{ arp: [392, 523, 659], nl: .09, w: 'sine', v: .22 }],
    clear: [{ arp: [392, 523, 659, 784, 1046], nl: .07, w: 'triangle', v: .22 }]
  },
  init() {
    if (this.ready) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    try {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
      this.ctx = new C();
      this.master = this.ctx.createGain(); this.master.gain.value = this.volume; this.master.connect(this.ctx.destination);
      this.sfx = this.ctx.createGain(); this.sfx.gain.value = .8; this.sfx.connect(this.master);
      this.amb = this.ctx.createGain(); this.amb.gain.value = .35; this.amb.connect(this.master);
      const len = this.ctx.sampleRate; this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      // brun stoy (tilfeldig gange), som i The Deep Ones sin Soundscape
      this.brownBuf = this.ctx.createBuffer(1, len * 4, this.ctx.sampleRate); const b = this.brownBuf.getChannelData(0); let v = 0;
      for (let i = 0; i < b.length; i++) { v = (v + Math.random() * .035 - .0175) * .98; b[i] = v * 3; }
      this.ready = true;
    } catch (e) { this.ready = false; }
  },
  setVolume(v) { this.volume = v; if (this.master) this.master.gain.value = v; },
  play(name, vol = 1, pitch = 1) {
    if (!this.ready || this.volume <= 0) return;
    const layers = this.lib[name]; if (!layers) return;
    const now = this.ctx.currentTime;
    for (const L of layers) {
      if (L.arp) this._arp(L, vol, pitch, now);
      else if (L.n) this._noise(L, vol, pitch, now);
      else this._synth(L, vol, pitch, now);
    }
  },
  _synth(s, vol, pitch, now) {
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = s.w; const f = s.f * pitch * (0.97 + Math.random() * 0.06);
    o.frequency.setValueAtTime(f, now);
    if (s.pd) o.frequency.exponentialRampToValueAtTime(Math.max(20, f * (1 - s.pd)), now + s.d);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(s.v * vol, now + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, now + s.d);
    o.connect(g); g.connect(this.sfx); o.start(now); o.stop(now + s.d + 0.02);
  },
  _noise(s, vol, pitch, now) {
    const src = this.ctx.createBufferSource(); src.buffer = this.noiseBuf; src.playbackRate.value = pitch;
    const f = this.ctx.createBiquadFilter(); f.type = s.ft || 'lowpass'; f.Q.value = s.ft === 'bandpass' ? 1.4 : 0.7;
    f.frequency.setValueAtTime(s.f0, now); f.frequency.exponentialRampToValueAtTime(Math.max(30, s.f1), now + s.d);
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(s.v * vol, now + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, now + s.d);
    src.connect(f); f.connect(g); g.connect(this.sfx);
    const off = Math.random() * 0.5; src.start(now, off, s.d + 0.05);
  },
  _arp(s, vol, pitch, now) {
    s.arp.forEach((fr, i) => this._synth({ w: s.w, f: fr, d: s.nl * 1.8, v: s.v }, vol, pitch, now + i * s.nl));
  },
  /* mumlende monolog: tilfeldige lave toner, som en pompos stemme gjennom en vegg */
  mumble(n = 6, base = 150) {
    if (!this.ready) return; const now = this.ctx.currentTime;
    for (let i = 0; i < n; i++) this._synth({ w: 'sawtooth', f: base * (0.8 + Math.random() * 0.5), d: .12, pd: .1, v: .07 }, 1, 1, now + i * .11);
  },
  startAmbience(depth) {
    this.stopAmbience(); if (!this.ready) return;
    const now = this.ctx.currentTime, base = [55, 55, 46, 36.7][depth] || 36.7;
    const lp = this.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = depth >= 3 ? 220 : 320; lp.Q.value = 3;
    const lfo = this.ctx.createOscillator(), lfoG = this.ctx.createGain(); lfo.frequency.value = 0.07; lfoG.gain.value = 90;
    lfo.connect(lfoG); lfoG.connect(lp.frequency); lfo.start(now);
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(.5, now + 3);
    lp.connect(g); g.connect(this.amb);
    const oscs = [base, base * 1.006, base * 1.5 * (depth >= 3 ? 1.06 : 1)].map(fr => {
      const o = this.ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = fr;
      const og = this.ctx.createGain(); og.gain.value = .18; o.connect(og); og.connect(lp); o.start(now); return o;
    });
    const n = this.ctx.createBufferSource(); n.buffer = this.brownBuf || this.noiseBuf; n.loop = true;
    const nf = this.ctx.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = depth >= 2 ? 500 : 900; nf.Q.value = .8;
    const ng = this.ctx.createGain(); ng.gain.value = depth >= 2 ? .1 : .05; n.connect(nf); nf.connect(ng); ng.connect(g); n.start(now);
    this.ambNodes = [...oscs, lfo, n, g];
  },
  /* Generativ tonerekke, tilpasset fra Tombonator3000/the-deep-ones v2/audio.js (Soundscape.tick):
     én lang tone hvert 3,6 sekund fra en rolig eller en urolig skala. Her styres uroen av
     dybde, Morbidium-metning og sjefskamp i stedet for natt og sanity. */
  noteT: 0, noteI: 0,
  tick(dt, unsettled, depth) {
    if (!this.ready || this.volume <= 0) return;
    this.noteT -= dt; if (this.noteT > 0) return; this.noteT = 3.6;
    const day = [146.83, 220, 293.66, 329.63, 220, 196, 293.66, 440], dark = [146.83, 155.56, 220, 293.66, 207.65, 146.83, 311.13, 220];
    const f = (unsettled ? dark : day)[this.noteI++ % 8] * (depth >= 3 ? .5 : 1), now = this.ctx.currentTime;
    const note = (fr, d, v) => { const o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.type = 'triangle'; o.frequency.value = fr; g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(v, now + .012); g.gain.exponentialRampToValueAtTime(.001, now + d); o.connect(g); g.connect(this.amb); o.start(now); o.stop(now + d + .05); };
    note(f, 3.2, .09); note(f * 2, 2, .035);
  },
  stopAmbience() {
    for (const n of this.ambNodes) { try { if (n.stop) n.stop(); else n.disconnect(); } catch (e) { } }
    this.ambNodes = [];
  }
};
