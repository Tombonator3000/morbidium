/* ============================================================
   BLOD OG SKREKK  -  flekker som tar lyset (våte og blanke i 3D), sprut i slagretningen,
   blod på veggene med dråper som renner ned, blodige fotspor, blodspor etter sårede fiender,
   kjøttbiter og blodsky etter tunge drap, blod på skjermen og årer i kanten ved lite helse,
   tak som drypper (vann i underetasjen, blod i Dypet) og øyne som åpner seg i veggene
   når Morbidium stiger.
   Flekkene samles i noen få InstancedMesh-er, én per tekstur, så hundrevis av flekker koster
   bare noen få tegnekall. Innstillingen «Blod og skrekkeffekter» (blod) slår av alt utover
   de vanlige flekkene på gulvet.
   ============================================================ */
Object.assign(Sound.lib, {
  splat: [{ n: 1, d: .22, f0: 900, f1: 160, ft: 'bandpass', v: .32 }, { w: 'sine', f: 85, d: .12, pd: .5, v: .22 }],
  knas: [{ n: 1, d: .05, f0: 2600, f1: 900, ft: 'bandpass', v: .3 }, { n: 1, d: .05, f0: 2200, f1: 700, ft: 'bandpass', v: .26, at: .05 }, { n: 1, d: .08, f0: 1800, f1: 400, ft: 'bandpass', v: .26, at: .1 }],
  oye: [{ n: 1, d: .35, f0: 520, f1: 180, ft: 'bandpass', v: .1 }, { w: 'sine', f: 50, d: .6, pd: .2, v: .14 }]
});
const hexOf = c => typeof c === 'number' ? '#' + c.toString(16).padStart(6, '0') : c || '#8a1010';
const Blod = {
  on: true, pools: {}, vegger: [], drypper: [], bitene: [], ferske: [], oyne: [], fall: [], takT: 1, oyeT: 3, _c: null,
  /* av: blodet på skjermen, øynene, sprutene på veggene, dryppene og kjøttbitene forsvinner med en gang. Vanlige flekker på gulvet blir liggende. */
  sett(on) {
    this.on = on !== false; if (this.on) return;
    R.fx.blod = 0; R.fx.aarer = 0; for (const o of this.oyne) this.lukk(o, true); this.oyne = [];
    for (const m of this.vegger) this.kast(m); for (const d of this.drypper) this.kast(d.m); for (const f of this.fall) R.remove(f.m);
    for (const b of this.bitene) Anim.fjern(b.h);
    this.vegger = []; this.drypper = []; this.fall = []; this.bitene = [];
  },
  /* ---------- teksturer: hvite former med alfa, fargen kommer fra hver flekk ---------- */
  tex(k) {
    if (this._tex && this._tex[k]) return this._tex[k];
    const T = this._tex || (this._tex = {}), rng = mulberry32(k.split('').reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0);
    const klatt = (g, cx, cy, r, n = 14, ujevn = .35) => { g.beginPath(); for (let i = 0; i <= n; i++) { const a = i / n * TAU, rr = r * (1 - ujevn / 2 + rng() * ujevn); g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } g.closePath(); g.fill(); };
    let t;
    if (k.startsWith('flekk')) t = R.canvasTex(128, 128, g => {
      // tykkest i midten (mørkere), tynnere ut mot kanten, små dråper rundt
      g.fillStyle = '#e6e6e6'; klatt(g, 64, 64, 30 + rng() * 8, 18, .45);
      for (let i = 0; i < 4; i++) { const a = rng() * TAU, d = 16 + rng() * 14; klatt(g, 64 + Math.cos(a) * d, 64 + Math.sin(a) * d, 10 + rng() * 10, 10, .5); }
      g.fillStyle = '#b8b8b8'; klatt(g, 60 + rng() * 8, 60 + rng() * 8, 16 + rng() * 6, 12, .5);
      g.fillStyle = '#f4f4f4';
      for (let i = 0; i < 9; i++) { const a = rng() * TAU, d = 38 + rng() * 22, r = 1.5 + rng() * 4; g.beginPath(); g.arc(64 + Math.cos(a) * d, 64 + Math.sin(a) * d, r, 0, TAU); g.fill(); }
      for (let i = 0; i < 3; i++) { const a = rng() * TAU; g.strokeStyle = '#eeeeee'; g.lineWidth = 2 + rng() * 2; g.lineCap = 'round'; g.beginPath(); g.moveTo(64 + Math.cos(a) * 30, 64 + Math.sin(a) * 30); g.lineTo(64 + Math.cos(a) * (46 + rng() * 14), 64 + Math.sin(a) * (46 + rng() * 14)); g.stroke(); }
    });
    else if (k === 'drape') t = R.canvasTex(32, 32, g => { g.fillStyle = '#dddddd'; klatt(g, 16, 16, 11, 12, .3); g.fillStyle = '#f2f2f2'; g.beginPath(); g.arc(12, 12, 3, 0, TAU); g.fill(); });
    else if (k === 'sprut') t = R.canvasTex(64, 16, g => {
      // en dråpe som har truffet gulvet i fart: tynn hale bakover, tykk ende framover (+x)
      g.fillStyle = '#e0e0e0'; g.beginPath(); g.moveTo(2, 8); g.quadraticCurveTo(30, 5, 50, 3); g.arc(52, 8, 5.5, -Math.PI / 2, Math.PI / 2); g.quadraticCurveTo(30, 11, 2, 8); g.fill();
    });
    else if (k === 'fot') t = R.canvasTex(64, 32, g => {
      g.fillStyle = '#d8d8d8'; g.beginPath(); g.ellipse(26, 16, 18, 9, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(46, 16, 9, 8, 0, 0, TAU); g.fill();
      for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(56 + (i === 0 ? 1 : 0) - Math.abs(i - 1.5) * 1.5, 7 + i * 4.5, 2 + (i === 0 ? 1 : 0), 0, TAU); g.fill(); }
    });
    else if (k.startsWith('vegg')) t = R.canvasTex(256, 256, g => {
      // sprut mot veggen: en tung klatt, stråler ut fra treffpunktet og dråper som begynner å renne
      const cx = 128 + (rng() - .5) * 30, cy = 110 + (rng() - .5) * 30;
      g.fillStyle = '#e4e4e4'; klatt(g, cx, cy, 34 + rng() * 14, 16, .5);
      g.fillStyle = '#c4c4c4'; klatt(g, cx - 4, cy + 2, 18, 12, .5);
      g.fillStyle = '#eeeeee'; g.strokeStyle = '#eeeeee'; g.lineCap = 'round';
      for (let i = 0; i < 16; i++) { const a = rng() * TAU, d0 = 30 + rng() * 10, d1 = 60 + rng() * 60; g.lineWidth = 2 + rng() * 4; g.beginPath(); g.moveTo(cx + Math.cos(a) * d0, cy + Math.sin(a) * d0 * .8); g.lineTo(cx + Math.cos(a) * d1, cy + Math.sin(a) * d1 * .8); g.stroke(); g.beginPath(); g.arc(cx + Math.cos(a) * (d1 + 6), cy + Math.sin(a) * (d1 + 6) * .8, 2 + rng() * 4, 0, TAU); g.fill(); }
      for (let i = 0; i < 4; i++) { const x = cx + (rng() - .5) * 60, y0 = cy + 10 + rng() * 20, len = 20 + rng() * 60; g.lineWidth = 4 + rng() * 3; g.beginPath(); g.moveTo(x, y0); g.lineTo(x + (rng() - .5) * 4, y0 + len); g.stroke(); g.beginPath(); g.arc(x, y0 + len + 2, 4 + rng() * 2, 0, TAU); g.fill(); }
    });
    else if (k === 'drypp') t = R.canvasTex(16, 128, g => { g.fillStyle = '#e8e8e8'; g.fillRect(5, 0, 6, 116); g.beginPath(); g.arc(8, 118, 6.5, 0, TAU); g.fill(); g.fillStyle = '#ffffff'; g.fillRect(6, 0, 2, 100); });
    return (T[k] = t);
  },
  /* ---------- flekker på gulvet: ringbuffer per tekstur ---------- */
  pool(tex, alpha) {
    const key = tex + '|' + alpha; let p = this.pools[key];
    if (p && p.mesh.parent === R.level && R.level) return p;
    const cap = tex === 'drape' || tex === 'sprut' ? 160 : 64;
    const mat = new THREE.MeshBasicMaterial({ map: this.tex(tex), transparent: true, opacity: alpha, depthWrite: false });
    const mesh = new THREE.InstancedMesh(R.plane1(), mat, cap); mesh.count = 0; mesh.frustumCulled = false; mesh.renderOrder = 1; mesh.userData.vaat = true;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const c = new THREE.Color(1, 1, 1); for (let i = 0; i < cap; i++) mesh.setColorAt(i, c);
    R.level.add(mesh);
    return (this.pools[key] = { mesh, cap, next: 0, n: 0 });
  },
  legg(tex, x, z, rot, sx, sz, col, alpha = .88, y = .013) {
    if (!R.level || !G.F) return;
    const p = this.pool(tex, alpha), d = this._d || (this._d = new THREE.Object3D()), c = this._c || (this._c = new THREE.Color()), i = p.next;
    d.position.set(x, y + (i % 24) * .00015, z); d.rotation.set(-Math.PI / 2, 0, rot); d.scale.set(sx, sz, 1); d.updateMatrix();
    p.mesh.setMatrixAt(i, d.matrix); p.mesh.setColorAt(i, c.set(col)); p.mesh.instanceMatrix.needsUpdate = true; p.mesh.instanceColor.needsUpdate = true;
    p.next = (i + 1) % p.cap; p.n = Math.min(p.cap, p.n + 1); p.mesh.count = p.n;
  },
  /* erstatter Items.splat: samme kall, men flekkene er samlet og våte */
  flekk(x, z, col, s = 1, alpha = .85) {
    const k = s * (.9 + Math.random() * .6) * 1.6, px = x + rnd(-.2, .2), pz = z + rnd(-.2, .2);
    this.legg('flekk' + rndi(0, 5), px, pz, Math.random() * TAU, k, k, col, alpha >= .75 ? .88 : .6);
    if (s >= .7 && this.on) { this.ferske.push({ x: px, z: pz, r: k * .38, t: G.time, col }); if (this.ferske.length > 60) this.ferske.shift(); }
  },
  /* dråper som spruter i slagretningen a (samme vinkel som ellers i spillet: (sin a, cos a)) */
  sprut(x, z, a, col, n = 6, kraft = 1) {
    for (let k = 0; k < n; k++) {
      const d = rnd(.25, 1.1) * (.6 + kraft * .5), b = a + rnd(-.45, .45), px = x + Math.sin(b) * d, pz = z + Math.cos(b) * d;
      if (solid(Math.floor(px), Math.floor(pz))) continue;
      const s = rnd(.14, .3) * (1.3 - d * .35);
      if (Math.random() < .55) this.legg('sprut', px, pz, b - Math.PI / 2, s * 2.4, s * .7, col); else this.legg('drape', px, pz, Math.random() * TAU, s, s, col);
    }
  },
  /* ---------- blod på veggen, med dråper som renner ned ---------- */
  veggVed(x, z) {
    const F = G.F, wh = Paint.wallH; if (!F || !wh) return null;
    const W = F.W, tx = Math.floor(x), tz = Math.floor(z), gulv = (xx, zz) => xx >= 0 && zz >= 0 && xx < W && zz < F.H && F.tiles[zz * W + xx] > 0;
    for (let k = 0; k < 2; k++) {
      const zf = tz - k; if (zf < 1 || !gulv(tx, zf)) return null;
      if (wh[(zf - 1) * W + tx] > 2) { if (Paint.opptatt && Paint.opptatt.has(tx + ',' + zf)) return null; return z - zf < 1.5 ? { zf } : null; }
      if (!gulv(tx, zf - 1)) return null;
    }
    return null;
  },
  vegg(x, z, col, s = 1) {
    const V = this.veggVed(x, z); if (!V || !R.level) return false;
    const w = (1.1 + Math.random() * .7) * s, h = w * .85, y = rnd(.75, 1.45), px = x + rnd(-.25, .25);
    const m = new THREE.Mesh(R.plane1(), new THREE.MeshBasicMaterial({ map: this.tex('vegg' + rndi(0, 3)), color: col, transparent: true, opacity: .93, depthWrite: false }));
    m.position.set(px, y, V.zf + .014 + Math.random() * .004); m.scale.set(w * (Math.random() < .5 ? -1 : 1), h, 1); m.userData.vaat = true; m.renderOrder = 1;
    R.level.add(m); this.vegger.push(m);
    const geo = R.geo('dryppgeo', () => { const g = new THREE.PlaneGeometry(1, 1); g.translate(0, -.5, 0); return g; });
    for (let k = rndi(2, 4); k > 0; k--) {
      const d = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: this.tex('drypp'), color: col, transparent: true, opacity: .9, depthWrite: false }));
      const y0 = y - h * rnd(.05, .3); d.position.set(px + rnd(-w * .28, w * .28), y0, m.position.z + .001); d.scale.set(rnd(.045, .08), .01, 1); d.userData.vaat = true; d.renderOrder = 1; R.level.add(d);
      this.drypper.push({ m: d, len: rnd(.25, Math.max(.3, y0 - .08)), sp: rnd(.06, .26) });
    }
    while (this.vegger.length > 36) this.kast(this.vegger.shift());
    while (this.drypper.length > 110) this.kast(this.drypper.shift().m);
    return true;
  },
  kast(m) { if (!m) return; R.remove(m); if (m.material && m.material.dispose) m.material.dispose(); },
  /* ---------- kjøttbiter: flyr, spretter én gang og blir liggende ---------- */
  biter(x, z, col, n, kraft = 1) {
    const tint = col && col.toLowerCase() !== '#8a1010' && col.toLowerCase() !== '#b3261e' ? Col.light(col, .35) : null;
    for (let k = 0; k < n; k++) {
      const h = Anim.lag('kjottbiter', x, z, { start: rndi(0, 5), fps: 0, y: .7, s: rnd(.85, 1.25), tint });
      if (!h) return;
      const a = Math.random() * TAU, sp = rnd(1.8, 4.6) * kraft;
      this.bitene.push({ h, x, z, y: .7, vx: Math.sin(a) * sp, vz: Math.cos(a) * sp, vy: rnd(3, 6.5), spin: rnd(-14, 14), col, tint, hopp: 0 });
    }
    let liggende = this.bitene.filter(b => b.ligger);
    while (liggende.length > 40) { const b = liggende.shift(); Anim.fjern(b.h); this.bitene.splice(this.bitene.indexOf(b), 1); }
  },
  biterTick(dt) {
    for (let i = this.bitene.length - 1; i >= 0; i--) {
      const b = this.bitene[i]; if (b.ligger) continue;
      if (!b.h.g.parent) { this.bitene.splice(i, 1); continue; }
      b.vy -= 18 * dt; const nx = b.x + b.vx * dt, nz = b.z + b.vz * dt;
      if (solid(Math.floor(nx), Math.floor(nz))) { b.vx *= -.35; b.vz *= -.35; if (Math.random() < .5) this.vegg(b.x, b.z, b.col, .45); } else { b.x = nx; b.z = nz; }
      b.y += b.vy * dt; b.h.m.rotation.z += b.spin * dt;
      if (b.y <= .08) {
        b.y = .08;
        if (b.hopp++ < 1 && b.vy < -3) { b.vy *= -.32; b.vx *= .45; b.vz *= .45; b.spin *= .5; this.legg('drape', b.x, b.z, Math.random() * TAU, .22, .22, b.col); }
        else {
          b.ligger = true; const idx = b.h.i; Anim.fjern(b.h);
          b.h = Anim.lag('kjottbiter', b.x, b.z, { start: idx, fps: 0, flat: true, y: .02, rot: Math.random() * TAU, s: rnd(.8, 1.1), tint: b.tint });
          this.legg('drape', b.x + rnd(-.1, .1), b.z + rnd(-.1, .1), Math.random() * TAU, .3, .3, b.col);
          if (b.h && D3.on) { const L = D3.lysVed(b.x, b.z, .1); b.h.U.uTint.value.copy(b.h.tint0 || b.h.U.uTint.value).multiply(L.setRGB(Math.max(.5, L.r), Math.max(.45, L.g), Math.max(.45, L.b))); }
        }
      }
      if (!b.ligger) b.h.g.position.set(b.x, b.y, b.z);
    }
  },
  /* ---------- kroker fra skade og død ---------- */
  treff(e, src, d, hp0) {
    const col = e.kind === 'player' ? '#8a1010' : hexOf(e.blood);
    const a = src.a !== undefined ? src.a : src.x !== undefined ? Math.atan2(e.x - src.x, e.z - src.z + 1e-4) : Math.random() * TAU;
    const kraft = clamp(d / Math.max(10, e.max || e.maxHp || 30) * 3, .35, 1.6);
    if (e.kind === 'player') { R.fx.blod = Math.min(1, (R.fx.blod || 0) + .4 + kraft * .25); R.fx.blodFlip = Math.random() < .5 ? 1 : 0; }
    if (e.type === 'flue' || e.type === 'rotte' && d < 4) return;
    this.sprut(e.x, e.z, a, col, Math.round(1 + kraft * 3), kraft);
    if (kraft > .9 && Math.random() < .45) this.vegg(e.x, e.z, col, .65);
  },
  dod(e, src) {
    const col = hexOf(e.blood), liten = e.type === 'flue' || e.type === 'rotte', slag = (e.raaSkade || 0) * (src.from === 'player' ? playerDmgMult() : 1), tungt = slag - (e.hpFor || 0) > (e.max || 30) * .45 || slag > (e.max || 30) * .7 || !!src.kb && src.kb >= 8;
    if (!liten) Anim.lag('blodsprut', e.x, e.z + .06, { tint: Col.light(col, .1), s: e.elite || e.mini ? 1.4 : 1 });
    this.sprut(e.x, e.z, Math.random() * TAU, col, liten ? 3 : 9, 1.2);
    if (!liten && Math.random() < .75) this.vegg(e.x, e.z, col, e.mini ? 1.3 : .9);
    if (!liten && (tungt || Math.random() < .3)) { this.biter(e.x, e.z, col, tungt ? rndi(4, 6) : rndi(2, 3), tungt ? 1.3 : 1); Sound.play('knas', .5); }
    Sound.play('splat', .6, liten ? 1.5 : 1);
  },
  sjefDod(B) {
    const col = hexOf(B.blood);
    for (let i = 0; i < 4; i++) setTimeout(() => { if (!G.F) return; Anim.lag('blodsprut', B.x + rnd(-1, 1), B.z + rnd(-.6, .6), { s: 1.8, tint: Col.light(col, .12) }); this.sprut(B.x, B.z, Math.random() * TAU, col, 12, 1.6); this.vegg(B.x + rnd(-1.5, 1.5), B.z, col, 1.4); }, i * 220);
    this.biter(B.x, B.z, col, 10, 1.6); Sound.play('knas', .8); Sound.play('splat', .9, .7);
  },
  /* ---------- per bilde ---------- */
  tick(dt) {
    const P = G.player; if (!P || !G.F) return;
    for (let i = this.drypper.length - 1; i >= 0; i--) { const d = this.drypper[i]; if (d.m.scale.y < d.len) d.m.scale.y = Math.min(d.len, d.m.scale.y + d.sp * dt * (1 - d.m.scale.y / (d.len * 1.3))); }
    this.biterTick(dt); this.fallTick(dt);
    R.fx.aarer = this.on && P.alive && P.hp < P.maxHp * .35 ? 1 - P.hp / (P.maxHp * .35) : 0;
    R.fx.puls = 2.6 + (1 - P.hp / P.maxHp) * 3.2;
    if (!this.on) return;
    this.fotspor();
    // blodspor etter sårede fiender, og etter pasienten når det står dårlig til
    const spor = (o, col, s) => { o.dryppT = (o.dryppT ?? Math.random() * .5) - dt; if (o.dryppT > 0) return; const sp = Math.hypot(o.vx || 0, o.vz || 0); o.dryppT = sp > .6 ? rnd(.18, .4) : rnd(.7, 1.4); this.legg('drape', o.x + rnd(-.18, .18), o.z + rnd(-.08, .2), Math.random() * TAU, s, s, col); };
    for (const e of G.enemies) if (e.alive && e.state !== 'spawn' && e.hp < e.max * .5 && e.type !== 'flue') spor(e, hexOf(e.blood), rnd(.12, .22));
    if (P.alive && P.hp < P.maxHp * .3) spor(P, '#8a1010', rnd(.12, .2));
    this.takTick(dt); this.oyeTick(dt);
  },
  /* tråkker pasienten i fersk blod, blir det blodige fotspor noen skritt etterpå */
  fotspor() {
    const P = G.player; if (!P.alive) return;
    for (let i = this.ferske.length - 1; i >= 0; i--) { const f = this.ferske[i]; if (G.time - f.t > 90) { this.ferske.splice(i, 1); continue; } if (d2(P.x, P.z, f.x, f.z) < f.r * f.r) { P.blodSko = 12; P.blodCol = f.col; } }
    if (!(P.blodSko > 0) || P.roll > 0) { P.fsX = P.x; P.fsZ = P.z; return; }
    if (P.fsX === undefined) { P.fsX = P.x; P.fsZ = P.z; return; }
    const dx = P.x - P.fsX, dz = P.z - P.fsZ; if (dx * dx + dz * dz < .2) return;
    const a = Math.atan2(dx, dz); P.fsSide = -(P.fsSide || 1); P.fsX = P.x; P.fsZ = P.z; P.blodSko--;
    const k = .75 + P.blodSko / 24;
    this.legg('fot', P.x + Math.cos(a) * .09 * P.fsSide, P.z - Math.sin(a) * .09 * P.fsSide, a - Math.PI / 2, .34 * k, .17 * k * P.fsSide, P.blodCol || '#8a1010', .88);
  },
  /* taket drypper: vann i underetasjen, blod under grunnmuren */
  takTick(dt) {
    const d = G.depth, P = G.player; if (!(d === 3 || d === 6) || G.state !== 'play') return; // vann i underetasjen, blod i Dypet
    this.takT -= dt; if (this.takT > 0) return; this.takT = rnd(.5, 1.6);
    const x = P.x + rnd(-7, 7), z = P.z + rnd(-4, 5); if (solid(Math.floor(x), Math.floor(z))) return;
    const blod = d === 6, mat = blod ? (this.mB || (this.mB = new THREE.MeshBasicMaterial({ color: '#5a0610' }))) : (this.mV || (this.mV = new THREE.MeshBasicMaterial({ color: '#9ad8f0', transparent: true, opacity: .8 })));
    const m = new THREE.Mesh(R.geo('takdrape', () => new THREE.SphereGeometry(.045, 6, 4)), mat); m.scale.set(1, 2.2, 1); m.position.set(x, 3.4, z); R.dyn.add(m);
    this.fall.push({ m, x, z, y: 3.4, vy: 0, blod });
  },
  fallTick(dt) {
    for (let i = this.fall.length - 1; i >= 0; i--) {
      const f = this.fall[i]; f.vy -= 22 * dt; f.y += f.vy * dt; f.m.position.y = f.y;
      if (f.y > .04) continue;
      R.remove(f.m); this.fall.splice(i, 1);
      if (f.blod) this.legg('drape', f.x, f.z, Math.random() * TAU, .16, .16, '#5a0610'); else R.ripple(f.x, f.z);
      Particles.spawn(f.x, .06, f.z, 3, f.blod ? 0x6a0a12 : 0x9ad8f0, { speed: 1.1, up: 2, life: .28, size: .45 });
      if (G.player && d2(f.x, f.z, G.player.x, G.player.z) < 25) Sound.play('drypp', .35, f.blod ? .8 : 1.1);
    }
  },
  /* ---------- øyne i veggene (Morbidium) ---------- */
  pupill() { return Art.part('pupill', .24, .24, .12, .12, g => { A.dot(g, 0, 0, .085, '#7a1414'); A.dot(g, 0, 0, .05, '#0c0406'); A.dot(g, -.025, -.025, .018, '#ffffff'); }); },
  oyeTick(dt) {
    const P = G.player, F = G.F, wh = Paint.wallH;
    const vil = R.distortOn && P.alive && (P.morb >= 50 || (hasDiag('innsikt') && P.morb >= 30));
    this.oyeT -= dt;
    if (vil && this.oyeT <= 0 && this.oyne.length < (P.morb >= 80 ? 4 : 2) && wh) {
      this.oyeT = rnd(2.5, 6);
      const kand = [];
      for (let z = Math.floor(P.z) - 6; z <= Math.floor(P.z) + 2; z++) for (let x = Math.floor(P.x) - 8; x <= Math.floor(P.x) + 8; x++) {
        if (x < 0 || z < 1 || x >= F.W || z >= F.H || !(F.tiles[z * F.W + x] > 0) || !(wh[(z - 1) * F.W + x] > 2) || (Paint.opptatt && Paint.opptatt.has(x + ',' + z))) continue;
        if (d2(x + .5, z, P.x, P.z) < 9 || this.oyne.some(o => Math.abs(o.x - x - .5) < 1.2 && Math.abs(o.z - z) < .5)) continue;
        kand.push([x, z]);
      }
      if (kand.length) {
        // øynene lyses ikke av lampene: de gløder svakt i mørket
        const [x, z] = pick(kand), px = x + .5 + rnd(-.2, .2), py = rnd(1.1, 1.7), s = rnd(1.2, 1.6), h = Anim.lag('oye', px, z + .02, { y: py, hold: true, lys: false, s });
        const pm = sprite(this.pupill(), px, z + .026, { y: py }); pm.scale.setScalar(s); pm.visible = false;
        this.oyne.push({ h, pm, x: px, y: py, z: z + .02, t: 0, liv: rnd(3.5, 7) }); Sound.play('oye', .7);
      }
    }
    for (let i = this.oyne.length - 1; i >= 0; i--) {
      const o = this.oyne[i]; o.t += dt;
      if (o.lukker) { if (!o.h.g.parent || o.h.i <= 0) { this.lukk(o, true); this.oyne.splice(i, 1); } continue; }
      const aapent = o.h.i >= 3; o.pm.visible = aapent;
      if (aapent) { const k = o.h.m.scale.x, dx = clamp((P.x - o.x) * .025, -.1, .1) * k, dy = clamp(-.03 - (P.z - o.z) * .006, -.07, .03) * k; o.pm.position.set(o.x + dx, o.y + dy * BILL_Y, o.z + .006); }
      if (o.t > o.liv || !vil || d2(P.x, P.z, o.x, o.z) < 5) this.lukk(o);
    }
  },
  lukk(o, straks) {
    if (straks) { Anim.fjern(o.h); R.remove(o.pm); return; }
    o.lukker = true; o.pm.visible = false; o.h.fart = -1.6; o.h.done = false; o.h.hold = false;
  },
  /* ---------- ny etasje ---------- */
  tom() {
    for (const k of Object.keys(this.pools)) { const p = this.pools[k]; R.remove(p.mesh); p.mesh.material.dispose(); p.mesh.dispose && p.mesh.dispose(); }
    this.pools = {};
    for (const m of this.vegger) this.kast(m); for (const d of this.drypper) this.kast(d.m); for (const f of this.fall) R.remove(f.m);
    for (const o of this.oyne) this.lukk(o, true);
    this.vegger = []; this.drypper = []; this.bitene = []; this.ferske = []; this.oyne = []; this.fall = [];
    const P = G.player; if (P) { P.blodSko = 0; P.fsX = undefined; }
  }
};
/* Items.splat og Items.clearSplats går via Blod, så alle gamle kall får de samlede, våte flekkene */
Items.splat = (x, z, col, s, alpha) => Blod.flekk(x, z, col, s, alpha);
Items.clearSplats = () => Blod.tom();
{ const _h = hurt; hurt = function (e, dmg, src = {}) {
  const hp0 = e && e.alive ? e.hp : 0;
  if (e && e.alive) { e.hpFor = hp0; e.raaSkade = dmg; }  // leses av Blod.dod, som kjøres før hurt er ferdig
  const d = _h(e, dmg, src);
  if (d > 0 && e && Blod.on && G.F) try { Blod.treff(e, src, d, hp0); } catch (err) { }
  return d;
}; }
{ const _d = enemyDie; enemyDie = function (e, src) { _d(e, src); if (Blod.on) try { Blod.dod(e, src || {}); } catch (err) { } }; }
{ const _b = bossDie; bossDie = function (B) { _b(B); if (Blod.on) try { Blod.sjefDod(B); } catch (err) { } }; }
{ const _p = playerDie; playerDie = function () { const P = G.player, levde = P && P.alive; _p(); if (levde && G.F) { Blod.flekk(P.x, P.z, '#7a0a0a', 1.6, .9); if (Blod.on) { Anim.lag('blodsprut', P.x, P.z + .05, { s: 1.2, tint: '#9a1a1a' }); Blod.sprut(P.x, P.z, Math.random() * TAU, '#8a1010', 10, 1.3); } } }; }
