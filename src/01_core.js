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
  mouse: { x: 0, y: 0, l: false, r: false, lp: false, rp: false, lr: false, rr: false, moved: false, movedT: -1e9 },
  gp: { connected: false, prev: [], cur: [], lx: 0, ly: 0, rx: 0, ry: 0, id: '', mapping: '', index: -1, aT: -1e9 },
  touch: { active: false, mx: 0, mz: 0, btn: {}, pressed: {}, released: {} },
  lastDevice: 'kb',
  /* siste enhet styrer tekstene (Esc eller B) og fokusringen i menyene (body.pad) */
  enhet(d) { if (this.lastDevice === d) return; this.lastDevice = d; document.body.classList.toggle('pad', d === 'pad'); },
  // tastatur eller håndkontroll: berøringsknappene skjules til neste berøring
  skjulTouch() { if (this.touch.active) { this.touch.active = false; $('touch').classList.add('hidden'); document.body.classList.remove('touch'); } },
  /* tastene som står i tekstene, etter enheten: tastatur, håndkontroll og berøring (tom: ingen tast å vise) */
  TAST: { pause: ['Esc', 'Start', ''], journal: ['Tab', 'Select', ''], lukkJ: ['Tab', 'B', ''], tilbake: ['Esc', 'B', ''], kort: ['1 2 3 4', 'LB RB LT RT', '1 2 3 4'] },
  tast(h, i) { const d = this.lastDevice === 'pad' ? 1 : this.lastDevice === 'touch' ? 2 : 0, t = (this.TAST[h] || [])[d] || ''; return i === undefined ? t : t.split(' ')[i] || ''; },
  parentes(h) { const t = this.tast(h); return t ? ' (' + t + ')' : ''; },
  init(canvas) {
    const block = ['Space', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    addEventListener('keydown', e => {
      if (block.includes(e.code) && !(e.target && e.target.tagName === 'INPUT')) e.preventDefault();
      if (!this.keys[e.code]) this.pressed[e.code] = true;
      this.keys[e.code] = true; this.enhet('kb');
    });
    addEventListener('keyup', e => { this.keys[e.code] = false; this.released[e.code] = true; });
    addEventListener('blur', () => { this.keys = {}; this.mouse.l = this.mouse.r = false; });
    canvas.addEventListener('mousemove', e => { if (Math.hypot(e.clientX - this.mouse.x, e.clientY - this.mouse.y) > 2) this.mouse.movedT = performance.now(); this.mouse.x = e.clientX; this.mouse.y = e.clientY; this.mouse.moved = true; this.enhet('kb'); });
    canvas.addEventListener('mousedown', e => {
      canvas.focus();
      if (e.button === 0) { this.mouse.l = true; this.mouse.lp = true; }
      if (e.button === 2) { this.mouse.r = true; this.mouse.rp = true; }
      this.enhet('kb');
    });
    // musa i menyene (panelene ligger over lerretet) tar bort fokusringen for håndkontrollen
    addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') this.enhet('kb'); });
    addEventListener('mouseup', e => {
      if (e.button === 0) { this.mouse.l = false; this.mouse.lr = true; }
      if (e.button === 2) { this.mouse.r = false; this.mouse.rr = true; }
    });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    addEventListener('gamepadconnected', () => { this.gp.connected = true; });
    // koblet fra: ingen knapper blir hengende, og tekstene går tilbake til tastaturet
    addEventListener('gamepaddisconnected', () => { const g = this.gp; g.cur = []; g.prev = []; g.lx = g.ly = g.rx = g.ry = 0; if (this.lastDevice === 'pad') this.enhet('kb'); });
    this.initTouch();
  },
  initTouch() {
    const stick = $('stick'), knob = stick.querySelector('i');
    let sid = null, cx = 0, cy = 0;
    const show = () => { if (!this.touch.active) { this.touch.active = true; $('touch').classList.remove('hidden'); document.body.classList.add('touch'); } this.enhet('touch'); };
    addEventListener('touchstart', show, { passive: true });
    // et ekte tastetrykk betyr tastatur: da skjules berøringsknappene til neste berøring
    addEventListener('keydown', () => this.skjulTouch());
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
  /* den første håndkontrollen med standardoppsett, ellers den første som finnes. Etter en ny tilkobling
     kan den ligge på plass 1 eller senere, og plass 0 kan være tom eller noe annet enn en håndkontroll */
  pollGamepad() {
    let p = null; try { const pads = navigator.getGamepads ? navigator.getGamepads() : []; for (let i = 0; i < (pads ? pads.length : 0); i++) { const q = pads[i]; if (q && q.connected !== false && (!p || (q.mapping === 'standard' && p.mapping !== 'standard'))) p = q; } } catch (e) { }
    const g = this.gp; g.prev = g.cur;
    if (!p) { g.cur = []; g.connected = false; g.lx = g.ly = g.rx = g.ry = 0; return; }
    g.connected = true; g.id = p.id; g.mapping = p.mapping; g.index = p.index;
    g.cur = p.buttons.map(b => b.pressed || b.value > 0.5);
    const dz = v => Math.abs(v) < 0.2 ? 0 : v;
    g.lx = dz(p.axes[0] || 0); g.ly = dz(p.axes[1] || 0);
    g.rx = dz(p.axes[2] || 0); g.ry = dz(p.axes[3] || 0);
    if (g.cur[0] && !g.prev[0]) g.aT = performance.now(); // menyene trykker ikke på noe med en A som ble hamret på i kampen
    if (g.cur.some(Boolean) || g.lx || g.ly || g.rx || g.ry) { this.enhet('pad'); this.skjulTouch(); }
  },
  gpDown(i) { return !!this.gp.cur[i]; },
  gpPressed(i) { return !!this.gp.cur[i] && !this.gp.prev[i]; },
  gpReleased(i) { return !this.gp.cur[i] && !!this.gp.prev[i]; },
  /* Samler alle enheter til ett handlingssett per bilde */
  actions() {
    const K = this.keys, P = this.pressed, M = this.mouse, T = this.touch;
    const a = { mx: 0, mz: 0, attackP: false, attackD: false, heavyD: false, heavyP: false, heavyR: false,
      dodgeP: false, interactP: false, abP: [false, false, false, false], useP: false, aktP: false, pauseP: false, journalP: false, kartP: false, tilbakeP: false,
      aimStickX: 0, aimStickZ: 0, pad: false, touch: T.active && this.lastDevice === 'touch' };
    if (K.KeyW || K.ArrowUp) a.mz -= 1; if (K.KeyS || K.ArrowDown) a.mz += 1;
    if (K.KeyA || K.ArrowLeft) a.mx -= 1; if (K.KeyD || K.ArrowRight) a.mx += 1;
    a.attackP = M.lp || P.KeyJ; a.attackD = M.l || K.KeyJ;
    a.heavyD = M.r || K.KeyK; a.heavyP = M.rp || P.KeyK; a.heavyR = M.rr || this.released.KeyK;
    a.dodgeP = P.Space || P.ShiftLeft; a.interactP = P.KeyE;
    a.abP = [!!(P.Digit1 || P.KeyQ), !!(P.Digit2 || P.KeyR), !!(P.Digit3 || P.KeyT), !!(P.Digit4 || P.KeyC)];
    a.useP = P.KeyF || P.KeyG; a.aktP = !!(P.KeyV || P.KeyX); a.pauseP = P.Escape || P.KeyP; a.journalP = !!(P.Tab || P.KeyI); a.kartP = !!P.KeyM;
    // håndkontroll
    if (this.gp.connected) {
      if (this.gp.lx || this.gp.ly) { a.mx += this.gp.lx; a.mz += this.gp.ly; }
      a.aimStickX = this.gp.rx; a.aimStickZ = this.gp.ry;
      if (this.gpPressed(0)) a.attackP = true; if (this.gpDown(0)) a.attackD = true;
      if (this.gpDown(2)) a.heavyD = true; if (this.gpPressed(2)) a.heavyP = true; if (this.gpReleased(2)) a.heavyR = true;
      if (this.gpPressed(1)) a.dodgeP = true; if (this.gpPressed(3)) a.interactP = true;
      if (this.gpPressed(4)) a.abP[0] = true; if (this.gpPressed(5)) a.abP[1] = true;
      if (this.gpPressed(6)) a.abP[2] = true; if (this.gpPressed(7)) a.abP[3] = true;
      if (this.gpPressed(13)) a.useP = true; if (this.gpPressed(12)) a.aktP = true; if (this.gpPressed(9)) a.pauseP = true; if (this.gpPressed(8)) a.journalP = true;
      if (this.gpPressed(15)) a.kartP = true; if (this.gpPressed(1)) a.tilbakeP = true; // pil høyre åpner kartet, B er tilbake i panelene
      a.pad = this.lastDevice === 'pad';
    }
    // touch
    if (T.active) {
      a.mx += T.mx; a.mz += T.mz;
      if (T.pressed.attack) a.attackP = true; if (T.btn.attack) a.attackD = true;
      if (T.btn.heavy) a.heavyD = true; if (T.pressed.heavy) a.heavyP = true; if (T.released.heavy) a.heavyR = true;
      if (T.pressed.dodge) a.dodgeP = true; if (T.pressed.interact) a.interactP = true; if (T.pressed.use) a.useP = true; if (T.pressed.active) a.aktP = true;
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
   Utvidet med flerlags-lyder, romklang-lignende hale og en ambient drone per etasje.
   Lagene kan også ha: rv (hvor mye som sendes til kirkeklangen), vib ([fart, cent]), dist (forvrengning),
   lp ([fra, til] lavpass som sveiper), atk (anslag i sekunder). Lange støylag går i sløyfe.
   En mild kompressor på hovedutgangen tar toppene når mange lyder slår inn samtidig (39_kombo.js). */
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
    clear: [{ arp: [392, 523, 659, 784, 1046], nl: .07, w: 'triangle', v: .22 }],
    // stemningslyder og hjerteslag (etappe 7)
    hjerte: [{ w: 'sine', f: 64, d: .14, pd: .35, v: .55 }, { w: 'sine', f: 56, d: .18, pd: .35, v: .42, at: .2 }],
    drypp: [{ w: 'sine', f: 1300, d: .09, pd: -.9, v: .1 }],
    klokke: [{ w: 'sine', f: 392, d: 2.4, v: .08 }, { w: 'sine', f: 1082, d: 1.2, v: .03 }],
    knirk: [{ w: 'sawtooth', f: 170, d: .6, pd: -.35, v: .05 }, { n: 1, d: .6, f0: 800, f1: 1500, ft: 'bandpass', v: .07 }],
    skrik: [{ w: 'sawtooth', f: 540, d: 1.1, pd: .4, v: .035 }, { w: 'sine', f: 800, d: 1, pd: .35, v: .025 }],
    ror: [{ w: 'sawtooth', f: 68, d: 1.7, pd: .18, v: .05 }, { w: 'sawtooth', f: 102, d: 1.2, pd: .25, v: .025, at: .3 }],
    skrivemaskin: [{ n: 1, d: .02, f0: 3200, f1: 3000, ft: 'highpass', v: .22 }, { n: 1, d: .02, f0: 3200, f1: 3000, ft: 'highpass', v: .2, at: .09 }, { n: 1, d: .02, f0: 3200, f1: 3000, ft: 'highpass', v: .22, at: .16 }, { n: 1, d: .02, f0: 3200, f1: 3000, ft: 'highpass', v: .18, at: .27 }, { w: 'sine', f: 2600, d: .6, v: .05, at: .42 }],
    rotte: [{ arp: [2400, 2900, 2500], nl: .04, w: 'sine', v: .06 }],
    // ute om natta: ugle, kråke, kvist som knekker, og en hund et sted langt borte
    ugle: [{ w: 'sine', f: 392, d: .35, pd: -.08, v: .07 }, { w: 'sine', f: 370, d: .55, pd: -.1, v: .06, at: .5 }],
    kraake: [{ w: 'sawtooth', f: 620, d: .22, pd: .35, v: .05 }, { n: 1, d: .2, f0: 1400, f1: 900, ft: 'bandpass', v: .06 }, { w: 'sawtooth', f: 600, d: .2, pd: .35, v: .04, at: .3 }],
    kvist: [{ n: 1, d: .05, f0: 3500, f1: 1200, ft: 'bandpass', v: .25 }],
    hund: [{ w: 'sawtooth', f: 330, d: .16, pd: .4, v: .03 }, { w: 'sawtooth', f: 310, d: .16, pd: .4, v: .025, at: .4 }]
  },
  init() {
    if (this.ready) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    try {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
      this.ctx = new C();
      this.master = this.ctx.createGain(); this.master.gain.value = this.volume;
      const komp = this.ctx.createDynamicsCompressor(); komp.threshold.value = -12; komp.knee.value = 10; komp.ratio.value = 4; komp.attack.value = .004; komp.release.value = .22;
      this.master.connect(komp); komp.connect(this.ctx.destination);
      this.sfx = this.ctx.createGain(); this.sfx.gain.value = .8; this.sfx.connect(this.master);
      this.amb = this.ctx.createGain(); this.amb.gain.value = .35; this.amb.connect(this.master);
      this.mus = this.ctx.createGain(); this.mus.gain.value = .8; this.mus.connect(this.master); if (this.mix) this.setMix(...this.mix);
      const len = this.ctx.sampleRate; this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      // brun stoy (tilfeldig gange), som i The Deep Ones sin Soundscape
      this.brownBuf = this.ctx.createBuffer(1, len * 4, this.ctx.sampleRate); const b = this.brownBuf.getChannelData(0); let v = 0;
      for (let i = 0; i < b.length; i++) { v = (v + Math.random() * .035 - .0175) * .98; b[i] = v * 3; }
      // kirkeklang: en impulsrespons av støy som dør ut over tre sekunder, litt ulik i hvert øre
      const ir = this.ctx.createBuffer(2, Math.floor(len * 3), this.ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) { const c = ir.getChannelData(ch); for (let i = 0; i < c.length; i++) c[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / c.length, 3.2) * (i < 90 ? i / 90 : 1); }
      this.hall = this.ctx.createGain(); this.hall.gain.value = .5; const kl = this.ctx.createConvolver(); kl.buffer = ir; this.hall.connect(kl); kl.connect(this.sfx);
      this.ready = true;
    } catch (e) { this.ready = false; }
  },
  setVolume(v) { this.volume = v; if (this.master) this.master.gain.value = v; },
  setMix(sfx = 1, amb = 1, mus = .8) { this.mix = [sfx, amb, mus]; if (this.sfx) this.sfx.gain.value = .8 * sfx; if (this.amb) this.amb.gain.value = .35 * amb; if (this.mus) this.mus.gain.value = mus; },
  play(name, vol = 1, pitch = 1) {
    if (!this.ready || this.volume <= 0) return;
    const layers = this.lib[name]; if (!layers) return;
    const now = this.ctx.currentTime;
    for (const L of layers) {
      const t = now + (L.at || 0);
      if (L.arp) this._arp(L, vol, pitch, t);
      else if (L.n) this._noise(L, vol, pitch, t);
      else this._synth(L, vol, pitch, t);
    }
  },
  _synth(s, vol, pitch, now) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = s.w; const f = s.f * pitch * (0.97 + Math.random() * 0.06);
    o.frequency.setValueAtTime(f, now);
    if (s.pd) o.frequency.exponentialRampToValueAtTime(Math.max(20, f * (1 - s.pd)), now + s.d);
    if (s.vib) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = s.vib[0]; lg.gain.value = s.vib[1]; l.connect(lg); lg.connect(o.detune); l.start(now); l.stop(now + s.d + .02); }
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(s.v * vol, now + (s.atk || 0.008));
    g.gain.exponentialRampToValueAtTime(0.0001, now + s.d);
    let ut = o;
    if (s.dist) { const w = c.createWaveShaper(); w.curve = this.kurve(s.dist); ut.connect(w); ut = w; }
    if (s.lp) { const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 2; lp.frequency.setValueAtTime(s.lp[0], now); lp.frequency.exponentialRampToValueAtTime(Math.max(30, s.lp[1]), now + s.d); ut.connect(lp); ut = lp; }
    ut.connect(g); this._ut(g, s); o.start(now); o.stop(now + s.d + 0.02);
  },
  /* lyden ut: rett i effektbussen, og en del i kirkeklangen når laget ber om det */
  _ut(g, s) { g.connect(this.sfx); if (s.rv && this.hall) { const r = this.ctx.createGain(); r.gain.value = s.rv; g.connect(r); r.connect(this.hall); } },
  kurve(k) { const n = 512, a = new Float32Array(n); for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; a[i] = (1 + k) * x / (1 + k * Math.abs(x)); } return a; },
  _noise(s, vol, pitch, now) {
    const src = this.ctx.createBufferSource(); src.buffer = this.noiseBuf; src.playbackRate.value = pitch;
    const f = this.ctx.createBiquadFilter(); f.type = s.ft || 'lowpass'; f.Q.value = s.ft === 'bandpass' ? 1.4 : 0.7;
    f.frequency.setValueAtTime(s.f0, now); f.frequency.exponentialRampToValueAtTime(Math.max(30, s.f1), now + s.d);
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(s.v * vol, now + (s.atk || 0.01)); g.gain.exponentialRampToValueAtTime(0.0001, now + s.d);
    src.connect(f); f.connect(g); this._ut(g, s);
    if (s.d > .45) src.loop = true; // støybufferen er ett sekund; lange drønn og applaus går i sløyfe
    const off = Math.random() * 0.5; src.start(now, off, s.d + 0.05);
  },
  _arp(s, vol, pitch, now) {
    s.arp.forEach((fr, i) => this._synth({ w: s.w, f: fr, d: s.nd || s.nl * 1.8, v: s.v, rv: s.rv, vib: s.vib, atk: s.atk }, vol, pitch, now + i * s.nl));
  },
  /* mumlende monolog: tilfeldige lave toner, som en pompos stemme gjennom en vegg */
  mumble(n = 6, base = 150) {
    if (!this.ready) return; const now = this.ctx.currentTime;
    for (let i = 0; i < n; i++) this._synth({ w: 'sawtooth', f: base * (0.8 + Math.random() * 0.5), d: .12, pd: .1, v: .07 }, 1, 1, now + i * .11);
  },
  /* etasjene i dronen og stemningslydene: seks etasjer, men lyden følger de gamle fire (Parken og Nattskogen er ute) */
  lydDybde(depth) { return { 1: 1, 2: 1, 3: 2, 4: 3, 5: 3, 6: 4 }[depth] || depth; },
  startAmbience(depth0) {
    const ute = depth0 === 1 || depth0 === 5, depth = this.lydDybde(depth0);
    this.stopAmbience(); if (!this.ready) return;
    const now = this.ctx.currentTime, base = [55, 55, 46, 41.2, 36.7][depth] || 36.7;
    const lp = this.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = depth >= 3 ? 220 : 320; lp.Q.value = 3;
    const lfo = this.ctx.createOscillator(), lfoG = this.ctx.createGain(); lfo.frequency.value = 0.07; lfoG.gain.value = 90;
    lfo.connect(lfoG); lfoG.connect(lp.frequency); lfo.start(now);
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime((ute ? .22 : .5) * (this.droneNiva ?? 1), now + 3);
    lp.connect(g); g.connect(this.amb);
    const oscs = [base, base * 1.006, base * 1.5 * (depth >= 3 ? 1.06 : 1)].map(fr => {
      const o = this.ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = fr;
      const og = this.ctx.createGain(); og.gain.value = .18; o.connect(og); og.connect(lp); o.start(now); return o;
    });
    const n = this.ctx.createBufferSource(); n.buffer = this.brownBuf || this.noiseBuf; n.loop = true;
    const nf = this.ctx.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = depth >= 2 ? 500 : 900; nf.Q.value = .8;
    const ng = this.ctx.createGain(); ng.gain.value = depth >= 2 ? .1 : .05; n.connect(nf); nf.connect(ng); ng.connect(g); n.start(now);
    this.ambNodes = [...oscs, lfo, n, g]; this.drone = { oscs, k: [1, 1.006, 1.5 * (depth >= 3 ? 1.06 : 1)] };
  },
  /* musikken stemmer dronen etter grunntonen i stykket som spilles (06_musikk.js), så suset i veggene og musikken går i hop */
  stemDrone(hz) {
    if (!this.drone || !this.ready) return; let f = hz; while (f > 70) f /= 2; while (f < 35) f *= 2;
    this.drone.oscs.forEach((o, i) => o.frequency.setTargetAtTime(f * this.drone.k[i], this.ctx.currentTime, 2.5));
  },
  /* Stemningslyder: en tilfeldig lyd fra etasjen hvert tiende til tjuende sekund.
     Tonerekka fra the-deep-ones er erstattet av musikken i 06_musikk.js. */
  evT: 8,
  tick(dt, unsettled, depth0) {
    if (!this.ready || this.volume <= 0) return;
    this.evT -= dt; if (this.evT > 0) return; this.evT = 10 + Math.random() * 12 - (unsettled ? 4 : 0);
    const depth = this.lydDybde(depth0), valg = depth0 === 1 ? ['ugle', 'kraake', 'klokke', 'hund', 'kvist'] : depth0 === 5 ? ['ugle', 'ugle', 'kvist', 'skrik', 'klokke'] : { 1: ['klokke', 'knirk', 'knirk', 'skrik'], 2: ['drypp', 'drypp', 'ror', 'knirk'], 3: ['skrivemaskin', 'skrivemaskin', 'knirk', 'rotte'], 4: ['skrik', 'hjerte', 'klokke', 'ror'] }[depth] || ['knirk'];
    const k = valg[Math.floor(Math.random() * valg.length)], n = k === 'drypp' ? 3 : 1;
    for (let i = 0; i < n; i++) setTimeout(() => this.play(k, .7, (k === 'klokke' && depth >= 4 ? .5 : .85) + Math.random() * .3), i * (300 + Math.random() * 500));
  },
  /* regn eller vind som en støysløyfe under stemningen (17_romtyper.js, Vaer) */
  vaer(type) {
    if (this.vaerN) { try { this.vaerN.stop(); } catch (e) { } this.vaerN = null; }
    if (!type || !this.ready) return;
    const c = this.ctx, n = c.createBufferSource(); n.buffer = this.noiseBuf; n.loop = true;
    const f = c.createBiquadFilter(); f.type = type === 'regn' ? 'bandpass' : 'lowpass'; f.frequency.value = type === 'regn' ? 1600 : 420; f.Q.value = .6;
    const g = c.createGain(); g.gain.setValueAtTime(0, c.currentTime); g.gain.linearRampToValueAtTime(type === 'regn' ? .06 : .045, c.currentTime + 2);
    if (type === 'vind') { const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = .09; lg.gain.value = 180; lfo.connect(lg); lg.connect(f.frequency); lfo.start(); }
    n.connect(f); f.connect(g); g.connect(this.amb); n.start(); this.vaerN = n;
  },
  stopAmbience() {
    for (const n of this.ambNodes) { try { if (n.stop) n.stop(); else n.disconnect(); } catch (e) { } }
    this.ambNodes = []; this.drone = null;
  }
};
