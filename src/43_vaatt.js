/* ============================================================
   VÅTT PÅ SKJERMEN  -  blod og vann som treffer glasset og renner nedover
   En liten simulering av dråper på en flate som står på skrå foran kameraet:
   - Dråpene klistrer seg fast til de blir tunge nok. Da sklir de nedover, vingler litt til sidene,
     legger igjen et spor og små dråper bak seg, og tar med seg dråpene de møter på veien.
   - Blodet er seigt: det sklir sakte, legger igjen tykke, mørke spor og blir lenge. Vannet renner fort
     og tørker på noen sekunder.
   - Hver dråpe tegnes som en liten kuppel i en høydekart-tekstur (rødt er vann, grønt er blod).
     Etterbehandlingen (04_render.js) bryter bildet gjennom kuplene, gjør kantene mørke, legger på et
     høylys fra øvre venstre hjørne, og farger gjennom blodet (tynt blod er klart rødt, tykt blod nesten svart).
   Blod kommer når pasienten blir truffet (fra siden slaget kom fra) og når noe dør tett ved; vann fra
   regnet ute, plask og pytter. Blodet følger «Blod og skrekkeffekter», alt følger «Blod og vann på skjermen».
   Enkel grafikk har ingen etterbehandling, og da er det heller ikke noe vått.
   ============================================================ */
const Vaatt = {
  on: true, draper: [], spor: [], W: 0, H: 0, cv: null, g: null, tex: null, spr: null, styrke: 0, regnT: 0, tomT: 0, tall: { blod: 0, vann: 0, sklidd: 0, slatt: 0 },
  MAKS: 110,
  sett(on) { this.on = on !== false; if (!this.on) this.tom(); },
  aktiv() { return this.on && !R.safe && !!R.post; },
  blodOk() { return typeof Blod !== 'object' || Blod.on; },
  /* ---------- oppsett ---------- */
  init() {
    const L = 384, a = (innerWidth || 16) / (innerHeight || 9), W = a >= 1 ? L : Math.max(160, Math.round(L * a)), H = a >= 1 ? Math.max(160, Math.round(L / a)) : L;
    if (this.cv && W === this.W && H === this.H) return true;
    if (!R.post || typeof THREE === 'undefined') return false;
    const sx = this.W ? W / this.W : 1, sy = this.H ? H / this.H : 1; for (const d of this.draper) { d.x *= sx; d.y *= sy; } this.spor = [];
    this.W = W; this.H = H;
    if (!this.cv) { this.cv = document.createElement('canvas'); this.spr = { v: this.kuppel(0), b: this.kuppel(1) }; }
    this.cv.width = W; this.cv.height = H; this.g = this.cv.getContext('2d');
    if (this.tex) this.tex.dispose();
    this.tex = new THREE.CanvasTexture(this.cv); this.tex.generateMipmaps = false; this.tex.minFilter = this.tex.magFilter = THREE.LinearFilter; this.tex.wrapS = this.tex.wrapT = THREE.ClampToEdgeWrapping;
    const u = R.post.uniforms; u.tVaatt.value = this.tex; u.uVaattPx.value.set(1 / W, 1 / H);
    return true;
  },
  /* en kuppel i én fargekanal: høyden er sqrt(1 - r²), litt flatere på toppen, som en dråpe på glass */
  kuppel(kanal) {
    const n = 48, c = document.createElement('canvas'); c.width = c.height = n; const g = c.getContext('2d'), id = g.createImageData(n, n), d = id.data;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const dx = (x + .5) / n * 2 - 1, dy = (y + .5) / n * 2 - 1, r2 = dx * dx + dy * dy, i = (y * n + x) * 4; if (r2 >= 1) continue;
      const h = Math.pow(1 - r2, .55); d[i + kanal] = Math.round(255 * h); d[i + 3] = 255;
    }
    g.putImageData(id, 0, 0); return c;
  },
  /* ---------- nye dråper ---------- */
  ny(x, y, r, blod, o = {}) {
    if (this.draper.length >= this.MAKS) { let mi = 0; for (let i = 1; i < this.draper.length; i++) if (this.draper[i].r < this.draper[mi].r) mi = i; this.draper.splice(mi, 1); }
    const d = { x, y, r, blod, vx: 0, vy: o.vy || 0, glir: false, t: 0, sporI: null, py: y, liv: o.liv || 0, ny: .12 };
    this.draper.push(d); return d;
  },
  /* sprut: en klatt og dråper rundt, størst nær midten. x0 og y0 er 0..1 over skjermen */
  sprut(x0, y0, n, blod, s = 1) {
    if (!this.aktiv() || !this.init()) return;
    const W = this.W, H = this.H, cx = x0 * W, cy = y0 * H;
    if (blod) this.tall.blod++; else this.tall.vann++;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU, u = Math.pow(Math.random(), 1.6), d = u * (10 + 26 * s) * (H / 135);
      const r = (blod ? 1.1 : 1.2) * (H / 135) * (1 + (1 - u) * (2.6 * s) * Math.random() + (Math.random() < .12 ? 1.5 * s : 0));
      this.ny(cx + Math.cos(a) * d * 1.3, cy + Math.sin(a) * d, r, blod);
    }
  },
  /* pasienten er truffet: blod fra siden slaget kom fra, mer jo hardere */
  treff(kraft, src) {
    if (!this.aktiv() || !this.blodOk()) return;
    const P = G.player; let side = Math.random() < .5 ? -1 : 1;
    if (src && src.x !== undefined && P) side = src.x < P.x ? -1 : 1;
    const x = side < 0 ? .06 + Math.random() * .3 : .64 + Math.random() * .3, y = .12 + Math.random() * .6;
    this.sprut(x, y, Math.round(4 + kraft * 8), true, .6 + kraft * .45);
    // og noen store som blir tunge nok til å renne med en gang
    const k = this.H / 135; if (kraft > .7) for (let i = 0, n = Math.round(kraft * 1.5); i < n; i++) this.ny(clamp(x + (Math.random() - .5) * .3, .03, .97) * this.W, clamp(y + (Math.random() - .5) * .4, .03, .9) * this.H, (3.2 + Math.random() * 2 * kraft) * k, true);
    if (kraft > 1.2) this.sprut(side < 0 ? .5 - Math.random() * .4 : .5 + Math.random() * .4, .04 + Math.random() * .12, 5, true, .8); // tunge treff: noe når toppen og renner lenge
  },
  /* noe døde tett ved pasienten */
  naert(x, z, mengde = 1) {
    if (!this.aktiv() || !this.blodOk()) return; const P = G.player; if (!P) return;
    const d = Math.hypot(x - P.x, z - P.z); if (d > 3.2) return;
    const n = 1 - d / 3.2, p = R.uvAv(x, 1, z);
    this.sprut(clamp(p.x + (Math.random() - .5) * .3, .05, .95), clamp(1 - p.y + (Math.random() - .5) * .3, .08, .9), Math.round(3 + 9 * n * mengde), true, .5 + .5 * n * mengde);
  },
  /* vann: plask nedenfra, fra pytter og fontener */
  plask(mengde = .3, blod = false) {
    if (!this.aktiv() || (blod && !this.blodOk())) return;
    this.sprut(.2 + Math.random() * .6, .78 + Math.random() * .16, Math.round(3 + mengde * 14), blod, .5 + mengde);
  },
  /* regnet ute: små dråper som treffer og samler seg */
  regn(dt) {
    const P = G.player; if (!P || !G.F || G.state !== 'play' || Sound.vaerType !== 'regn') return;
    const rr = typeof roomAt === 'function' ? roomAt(P.x, P.z) : -1, rom = rr >= 0 ? G.F.rooms[rr] : null;
    if (!(G.F.ute || (rom && rom.ute))) return;
    this.regnT -= dt; if (this.regnT > 0) return; this.regnT = .08 + Math.random() * .2;
    if (!this.init()) return; const k = this.H / 135;
    this.ny(Math.random() * this.W, Math.random() * this.H * .95, (1 + Math.random() * 1.6) * k, false);
    this.tall.vann++;
  },
  tom() { this.draper = []; this.spor = []; this.styrke = 0; if (R.post && R.post.uniforms.uVaatt) R.post.uniforms.uVaatt.value = 0; },
  /* ---------- per bilde ---------- */
  tick(dt) {
    if (!this.aktiv()) { if (this.styrke) this.tom(); return; }
    this.regn(dt);
    if (!this.draper.length && !this.spor.length) { if (this.styrke) this.tom(); return; }
    if (!this.init()) return;
    dt = Math.min(dt, .05); this.fysikk(dt); this.tegn(dt);
    this.styrke = 1; R.post.uniforms.uVaatt.value = 1; this.tex.needsUpdate = true;
  },
  fysikk(dt) {
    const D = this.draper, k = this.H / 135, S = this.spor;
    for (const d of D) {
      d.t += dt; if (d.ny > 0) d.ny -= dt;
      const grense = (d.blod ? 3.0 : 2.3) * k;
      if (!d.glir && d.r > grense && d.ny <= 0) { d.glir = true; d.sporI = { p: [d.x, d.y], blod: d.blod, w: Math.min(d.r * (d.blod ? .42 : .35), (d.blod ? 2.4 : 1.6) * k), t: 0 }; S.push(d.sporI); this.tall.sklidd++; }
      if (d.glir) {
        // fart etter vekt: vannet renner, blodet siger
        const maal = d.blod ? Math.min(40, 6 + 9 * (d.r / k - 2.6)) : Math.min(115, 20 + 30 * (d.r / k - 2.0));
        d.vy += (maal * k - d.vy) * Math.min(1, dt * (d.blod ? 2.5 : 6));
        d.vx += ((Math.random() - .5) * (d.blod ? 16 : 48) * k - d.vx * 3) * dt;
        d.x += d.vx * dt; d.y += d.vy * dt;
        // sporet, og små dråper som blir liggende bak
        const P = d.sporI.p; if (d.y - P[P.length - 1] > 1.6 * k) { P.push(d.x, d.y); d.sporI.t = 0; }
        if (d.y - d.py > (d.blod ? 9 : 6) * k) { d.py = d.y; if (Math.random() < (d.blod ? .25 : .4)) { const r0 = d.r * (.28 + Math.random() * .14); d.r = Math.sqrt(Math.max(0, d.r * d.r - r0 * r0)); const b = this.ny(d.x - d.vx * .02, d.y - d.r * 1.2, r0, d.blod); b.ny = .6; } }
        if (d.r < grense * .8) { d.glir = false; d.vy = 0; d.vx = 0; }
      } else {
        // tørker: vannet på noen sekunder, blodet blir hengende en stund og forsvinner så
        d.r -= dt * (d.blod ? (d.t > 8 ? .3 : .03) : (d.t > 5 ? .3 : .1)) * k;
      }
    }
    // dråper som møtes, blir én (den største tar over), og bare det som fortsatt er på skjermen blir igjen
    for (let i = 0; i < D.length; i++) {
      const a = D[i]; if (a.r <= 0) continue;
      for (let j = i + 1; j < D.length; j++) {
        const b = D[j]; if (b.r <= 0) continue; const dx = a.x - b.x, dy = a.y - b.y, rr = (a.r + b.r) * .78;
        if (dx * dx + dy * dy > rr * rr) continue;
        const [s, l] = a.r >= b.r ? [a, b] : [b, a], A = s.r * s.r, B = l.r * l.r;
        s.x = (s.x * A + l.x * B) / (A + B); s.y = Math.max(s.y, (s.y * A + l.y * B) / (A + B)); s.r = Math.min(Math.sqrt(A + B), (s.blod ? 6.5 : 5) * k); s.blod = s.blod || (l.blod && B > A * .5); l.r = 0; this.tall.slatt++;
      }
    }
    this.draper = D.filter(d => d.r > .45 * k && d.y - d.r < this.H);
    for (const s of S) { s.t += dt; if (s.blod && !this.blodOk()) s.t = 99; }
    this.spor = S.filter(s => s.t < (s.blod ? 12 : 3.5));
  },
  tegn() {
    const g = this.g, W = this.W, H = this.H; g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, W, H);
    g.globalCompositeOperation = 'lighter'; g.lineCap = g.lineJoin = 'round';
    // sporene: et tynt lag som blir tynnere med alderen
    for (const s of this.spor) {
      const P = s.p; if (P.length < 4) continue; const liv = s.blod ? 12 : 3.5, a = clamp(1 - s.t / liv, 0, 1) * (s.blod ? .42 : .45);
      g.strokeStyle = s.blod ? `rgba(0,${Math.round(255 * a)},0,1)` : `rgba(${Math.round(255 * a)},0,0,1)`; g.lineWidth = Math.max(.8, s.w);
      g.beginPath(); g.moveTo(P[0], P[1]); for (let i = 2; i < P.length; i += 2) g.lineTo(P[i], P[i + 1]); g.stroke();
    }
    // dråpene: kupler, strukket litt i fartsretningen, med tyngden nederst
    for (const d of this.draper) {
      const spr = d.blod ? this.spr.b : this.spr.v, s = d.glir ? 1 + Math.min(.35, d.vy / (90 * H / 135)) : 1, h = d.r * 2 * s;
      g.globalAlpha = d.blod ? 1 : clamp(d.r * 1.4, 0, 1);
      g.drawImage(spr, d.x - d.r, d.y + d.r - h, d.r * 2, h);
    }
    g.globalAlpha = 1;
  }
};

/* ---------- koblingene ---------- */
{
  const _play = Sound.play;
  // plask i nærheten gir vann på skjermen
  Sound.play = function (navn, vol = 1, pitch = 1) { _play.call(Sound, navn, vol, pitch); if (navn === 'splash' && G.state === 'play') Vaatt.plask(.25 * Math.min(1, vol)); };
  // treff på pasienten: dråper i stedet for det gamle, ferdigmalte blodet i kanten
  const _treff = Blod.treff;
  Blod.treff = function (e, src, d, hp0) {
    const f = R.fx.blod, ff = R.fx.blodFlip; _treff.call(Blod, e, src, d, hp0);
    if (e && e.kind === 'player' && Vaatt.aktiv() && Vaatt.blodOk()) { R.fx.blod = f; R.fx.blodFlip = ff; Vaatt.treff(clamp(d / Math.max(10, e.maxHp || 30) * 3, .35, 1.6), src); }
  };
  // slås blod og skrekk av, forsvinner blodet på glasset med en gang (vannet blir)
  const _sett = Blod.sett;
  Blod.sett = function (on) { _sett.call(Blod, on); if (!Blod.on) { Vaatt.draper = Vaatt.draper.filter(d => !d.blod); Vaatt.spor = Vaatt.spor.filter(s => !s.blod); } };
  const _dod = Blod.dod;
  Blod.dod = function (e, src) { _dod.call(Blod, e, src); if (e && e.type !== 'flue') Vaatt.naert(e.x, e.z, e.type === 'rotte' ? .3 : 1); };
  const _sjef = Blod.sjefDod;
  Blod.sjefDod = function (B) { _sjef.call(Blod, B); Vaatt.naert(B.x, B.z, 2); };
  const _sf = startFloor;
  startFloor = function (...a) { Vaatt.tom(); return _sf.apply(this, a); };
}
