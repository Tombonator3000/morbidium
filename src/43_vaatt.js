/* ============================================================
   VÅTT PÅ SKJERMEN  -  blod og vann som treffer glasset og renner nedover
   En liten simulering av dråper på en flate som står på skrå foran kameraet:
   - Dråpene klistrer seg fast til de blir tunge nok. Da sklir de nedover i rykk og napp, følger ripene i
     glasset (et felt som er likt for alle dråper i etasjen), og tar med seg dråpene de møter på veien.
   - Sporet tar litt av dråpen for hver piksel den renner, så den blir mindre og stanser etter et stykke.
     Hvert punkt i sporet har sin egen bredde og alder: sporet smalner mot dråpen, toppen renner av først,
     og det gamle sporet trekker seg sammen til en rad små perler.
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
  on: true, draper: [], spor: [], W: 0, H: 0, klokke: 0, fro: 0, bilde: false, cv: null, g: null, tex: null, spr: null, styrke: 0, regnT: 0, tomT: 0, tall: { blod: 0, vann: 0, sklidd: 0, slatt: 0 },
  MAKS: 110,
  /* skala for dråpestørrelse og fart: den korteste siden, så dråpene er like store på stående mobil som på PC */
  kk() { return Math.min(this.W, this.H) / 135; },
  /* glatt støy i 0..1, og ripene i glasset: et felt i -1..1 som er likt for alle dråper i etasjen */
  hs(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); },
  st1(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return this.hs(i) * (1 - u) + this.hs(i + 1) * u; },
  flyt(x, y) {
    const i = Math.floor(x), j = Math.floor(y), ux = x - i, uy = y - j, sx = ux * ux * (3 - 2 * ux), sy = uy * uy * (3 - 2 * uy), h = (a, b) => this.hs(a * 57.3 + b * 113.9 + this.fro);
    return ((h(i, j) * (1 - sx) + h(i + 1, j) * sx) * (1 - sy) + (h(i, j + 1) * (1 - sx) + h(i + 1, j + 1) * sx) * sy) * 2 - 1;
  },
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
      const a = Math.random() * TAU, u = Math.pow(Math.random(), 1.6), d = u * (10 + 26 * s) * this.kk();
      const r = (blod ? 1.1 : 1.2) * this.kk() * (1 + (1 - u) * (2.6 * s) * Math.random() + (Math.random() < .12 ? 1.5 * s : 0));
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
    const k = this.kk(); if (kraft > .7) for (let i = 0, n = Math.round(kraft * 1.5); i < n; i++) this.ny(clamp(x + (Math.random() - .5) * .3, .03, .97) * this.W, clamp(y + (Math.random() - .5) * .4, .1, .9) * this.H, (3.2 + Math.random() * 2 * kraft) * k, true);
    if (kraft > 1.2) this.sprut(side < 0 ? .5 - Math.random() * .4 : .5 + Math.random() * .4, .15 + Math.random() * .2, 5, true, .8); // tunge treff: noe havner høyt oppe, men ikke helt i kanten
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
    if (!this.init()) return; const k = this.kk();
    this.ny(Math.random() * this.W, Math.random() * this.H * .95, (1 + Math.random() * 1.6) * k, false);
    this.tall.vann++;
  },
  tom() { this.draper = []; this.spor = []; this.styrke = 0; this.fro = Math.random() * 1000; if (R.post && R.post.uniforms.uVaatt) R.post.uniforms.uVaatt.value = 0; },
  /* ---------- per bilde ---------- */
  tick(dt) {
    if (!this.aktiv()) { if (this.styrke) this.tom(); return; }
    this.regn(dt);
    if (!this.draper.length && !this.spor.length) { if (this.styrke) this.tom(); return; }
    if (!this.init()) return;
    dt = Math.min(dt, .05); this.fysikk(dt);
    // når ingenting renner og sporene bare blekner, tegnes og lastes lerretet opp annethvert bilde
    this.bilde = !this.bilde; if (this.bilde || !this.styrke || this.draper.some(d => d.glir)) { this.tegn(); this.tex.needsUpdate = true; }
    this.styrke = 1; R.post.uniforms.uVaatt.value = 1;
  },
  fysikk(dt) {
    const D = this.draper, k = this.kk(), S = this.spor, T = (this.klokke += dt);
    // høyst seks bloddråper renner samtidig, resten blir hengende
    let blodGlir = 0; for (const d of D) if (d.glir && d.blod) blodGlir++;
    for (const d of D) {
      d.t += dt; if (d.ny > 0) d.ny -= dt;
      const grense = (d.blod ? 3.0 : 2.3) * k, bw = d.blod ? .42 : .35, wm = (d.blod ? 2.4 : 1.6) * k;
      if (!d.glir && d.r > grense && d.ny <= 0 && !(d.blod && blodGlir >= 6)) {
        d.glir = true; d.vx = 0; d.vj = 0; d.sd = Math.random() * 97; if (d.blod) blodGlir++;
        d.sporI = { p: [d.x, d.y, Math.min(d.r * bw, wm), T], blod: d.blod, id: Math.random() * 97 }; S.push(d.sporI); this.tall.sklidd++;
      }
      if (d.glir) {
        // fart etter vekt: vannet renner, blodet siger, og begge i rykk og napp (glasset er ikke like glatt overalt)
        const maal = (d.blod ? Math.min(40, 6 + 9 * (d.r / k - 2.6)) : Math.min(115, 20 + 30 * (d.r / k - 2.0))) * (.35 + .65 * this.st1(d.y / k * .12 + d.sd));
        d.vy += (maal * k - d.vy) * Math.min(1, dt * (d.blod ? 2.5 : 6));
        // til sidene: ripene i glasset, dråpens egen slingring, og litt skjelving
        const hell = this.flyt(d.x / k * .035, d.y / k * .035) * .3 + (this.st1(d.y / k * .09 + d.sd + 31) - .5) * .8;
        d.vj += ((Math.random() - .5) * (d.blod ? 16 : 48) * k - d.vj * 3) * dt; d.vx = d.vy * hell + d.vj;
        const y0 = d.y; d.x += d.vx * dt; d.y += d.vy * dt;
        // sporet tar med seg litt av dråpen for hver piksel den renner
        d.r = Math.sqrt(Math.max(0, d.r * d.r - .2 * d.r * bw * Math.max(0, d.y - y0)));
        const P = d.sporI.p; if (d.y - P[P.length - 3] > 1.6 * k) P.push(d.x, d.y, Math.min(d.r * bw, wm), T);
        if (d.y - d.py > (d.blod ? 9 : 6) * k) { d.py = d.y; if (Math.random() < (d.blod ? .25 : .4)) { const r0 = d.r * (.28 + Math.random() * .14); d.r = Math.sqrt(Math.max(0, d.r * d.r - r0 * r0)); const b = this.ny(d.x - d.vx * .02, d.y - d.r * 1.2, r0, d.blod); b.ny = .6; } }
        if (d.r < grense * .8) { d.glir = false; d.vy = 0; d.vx = 0; if (d.blod) blodGlir--; }
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
    // et spor er borte når også det nyeste punktet er gammelt (blod 8 s, vann 3,5 s)
    const bok = this.blodOk(); this.spor = S.filter(s => (bok || !s.blod) && T - s.p[s.p.length - 1] < (s.blod ? 8 : 3.5));
  },
  tegn() {
    const g = this.g, W = this.W, H = this.H, T = this.klokke, perler = [];
    // svart og helt dekkende bunn, så svakere strøk og perler faktisk blir svakere når lerretet lastes opp
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    // sporene: hver bit som et bredt, svakt strøk og en smal kjerne, så sporet får en rund rygg som lyset glinser i.
    // «lighten» tar det høyeste, så leddene og sporene som krysser hverandre ikke blir dobbelt så tykke
    g.globalCompositeOperation = 'lighten'; g.lineCap = 'round';
    for (const s of this.spor) {
      const P = s.p, liv = s.blod ? 8 : 3.5, b = s.blod ? .42 : .45, p0 = s.blod ? 2 : 1, p1 = s.blod ? 3 : 1.8;
      for (let i = 4; i < P.length; i += 4) {
        const alder = T - P[i + 3], l = clamp(1 - alder / liv, 0, 1); if (l <= .02) continue;
        const w = Math.max(.8, (P[i - 2] + P[i + 2]) / 2 * (.6 + .4 * l)), f = clamp((alder - p0) / (p1 - p0), 0, 1), a = l * b * (1 - f);
        if (a > .01) for (const [ww, aa] of [[w, .5 * a], [w * .45, a]]) {
          const c = Math.round(255 * aa); g.strokeStyle = s.blod ? `rgb(0,${c},0)` : `rgb(${c},0,0)`; g.lineWidth = Math.max(.7, ww);
          g.beginPath(); g.moveTo(P[i - 4], P[i - 3]); g.lineTo(P[i], P[i + 1]); g.stroke();
        }
        // det gamle sporet trekker seg sammen til små perler, faste steder langs sporet så de ikke flimrer
        if (f > 0) {
          const dx = P[i] - P[i - 4], dy = P[i + 1] - P[i - 3], h1 = this.hs(i * 7.31 + s.id), h2 = this.hs(i * 3.17 + s.id + 5), h3 = this.hs(i * 1.93 + s.id + 11);
          if (h1 < Math.hypot(dx, dy) / (2.5 * w)) perler.push(s.blod, P[i - 4] + dx * h3, P[i - 3] + dy * h3, w * (.45 + .35 * h2), f * l * .85);
        }
      }
    }
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < perler.length; i += 5) { const r = perler[i + 3]; g.globalAlpha = perler[i + 4]; g.drawImage(perler[i] ? this.spr.b : this.spr.v, perler[i + 1] - r, perler[i + 2] - r, r * 2, r * 2); }
    // dråpene: kupler, strukket litt i fartsretningen, med tyngden nederst
    for (const d of this.draper) {
      const spr = d.blod ? this.spr.b : this.spr.v, s = d.glir ? 1 + Math.min(.35, d.vy / (90 * this.kk())) : 1, h = d.r * 2 * s;
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
