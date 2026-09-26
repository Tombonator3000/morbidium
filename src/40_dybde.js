/* ============================================================
   DYBDE  -  mer 3D i den skrå ovenfra-visningen
   - Lykteskygger: fiender, personale og høye ting nær pasienten kaster
     lange, myke skygger bort fra lykta, som i en mørk gang med en
     parafinlampe. Skyggene er flate plater på gulvet som snus og strekkes
     hvert bilde (ekte punktlysskygger passer dårlig til tegningene, som er
     strukket i høyden for å se riktige ut fra kameraet). Lykta lyser ikke
     gjennom vegger, og skyggen stopper ved første vegg bak kasteren.
   - Kontaktskygger: gulvet mørkner inn mot veggene og i hjørnene, mest under
     de høye veggene bak. Males én gang per etasje.
   - Varmeflimmer over bål, ovner, kjeler og gryter (shaderen ligger i 04_render.js).
   - Pytter og vann speiler lampene og lykta i nærheten (vannshaderen i 04_render.js),
     og tåka lyser opp rundt lampene i 3D (15_rom3d.js).
   - Kameradykk: kameraet går nærmere når en sjef dukker opp, når pasienten
     dør, og på de store øyeblikkene i kombosystemet.
   Enkel grafikk slår alt av. Skygger og speiling følger «Lys og skygge»,
   flimmeret følger «Forvrengning» og kameradykkene følger «Skjermristing».
   ============================================================ */
const Dybde = {
  skygger: new Map(), ledige: [], sikt: new WeakMap(), lt: 0, tex: null, ao: null,
  /* ---------- lykteskygger ---------- */
  skyggeTex() {
    // mørkest ved føttene, blekner utover, med avrundet ende
    return this.tex || (this.tex = R.canvasTex(64, 128, g => {
      const gr = g.createLinearGradient(0, 128, 0, 0); gr.addColorStop(0, 'rgba(12,6,10,.9)'); gr.addColorStop(.35, 'rgba(12,6,10,.55)'); gr.addColorStop(1, 'rgba(12,6,10,0)');
      g.fillStyle = gr; g.beginPath(); g.moveTo(14, 128); g.lineTo(50, 128); g.quadraticCurveTo(64, 70, 56, 10); g.quadraticCurveTo(32, -8, 8, 10); g.quadraticCurveTo(0, 70, 14, 128); g.fill();
    }));
  },
  skyggeGeo() { return R.geo('lykteskygge', () => { const g = new THREE.PlaneGeometry(1, 1); g.translate(0, .5, 0); return g; }); },
  /* hvem som kaster skygge: figurer (fiender, sjefen, personale, dukker i hendelser) og høye ting.
     U er figurens uniformer, så gjennomsiktige og halvt oppløste figurer kaster svakere skygge. De døde mister skyggen i første bilde
     etter drapet: testdel 30 venter at den er borte etter 0,3 sekunder, og på en treg maskin kan det bildet alene ta så lang tid */
  kastere() {
    const L = [];
    for (const e of G.enemies || []) if (e.alive && e.doll && e.state !== 'spawn') L.push({ k: e, x: e.x, z: e.z, b: e.r * 2.2, h: 1, U: e.doll.U });
    if (G.boss && G.boss.alive && G.boss.doll) L.push({ k: G.boss, x: G.boss.x, z: G.boss.z, b: 2, h: 1.4, U: G.boss.doll.U });
    for (const n of G.npcs || []) if (n.doll) L.push({ k: n, x: n.x, z: n.z, b: .9, h: 1, U: n.doll.U });
    for (const d of G.ekstraDukker || []) if (d.root && d.root.parent && d.root.visible) L.push({ k: d, x: d.root.position.x, z: d.root.position.z, b: .9, h: 1, U: d.U });
    for (const o of G.props || []) {
      const P0 = o.alive && o.g && o.g.parent && o.m && !o.g.userData.flat && o.m.userData && o.m.userData.P; // tegningen med bredde og høyde
      if (P0 && P0.h >= 1.1) L.push({ k: o, x: o.x, z: o.g.position.z - .15, b: Math.min(1.6, P0.w * .8), h: Math.min(1.5, P0.h / 1.6), U: o.U });
    }
    return L;
  },
  /* vegger for lykta: bare veggruter og en sprukken vegg som står. Ikke solid(): møbler merker sin egen rute som blokkert,
     og da ville bordene stengt lyset og de høye tingene mistet skyggen sin */
  veggRute(tx, tz) { const F = G.F; if (tx < 0 || tz < 0 || tx >= F.W || tz >= F.H) return true; const i = tz * F.W + tx; return !F.tiles[i] || (F.block[i] === 1 && !!F.crack && F.crack.includes(i)); },
  /* hvor langt fra (x, z) i retning (ux, uz) til første vegg, rute for rute (høyst maks) */
  tilVegg(x, z, ux, uz, maks) {
    ux = ux || 1e-9; uz = uz || 1e-9;
    let tx = Math.floor(x), tz = Math.floor(z), t = 0; const sx = ux > 0 ? 1 : -1, sz = uz > 0 ? 1 : -1, dX = Math.abs(1 / ux), dZ = Math.abs(1 / uz);
    let nX = (ux > 0 ? tx + 1 - x : x - tx) * dX, nZ = (uz > 0 ? tz + 1 - z : z - tz) * dZ;
    while (t < maks) { if (this.veggRute(tx, tz)) return t; if (nX < nZ) { t = nX; nX += dX; tx += sx; } else { t = nZ; nZ += dZ; tz += sz; } }
    return maks;
  },
  plate() {
    const m = this.ledige.pop() || new THREE.Mesh(this.skyggeGeo(), new THREE.MeshBasicMaterial({ map: this.skyggeTex(), transparent: true, depthWrite: false, opacity: 0 }));
    m.rotation.x = -Math.PI / 2; m.renderOrder = 1; m.visible = true; m.userData = { s: 0 }; if (!m.parent) R.scene.add(m); return m;
  },
  // platene legges til side og brukes om igjen, i stedet for et nytt materiale hver gang noen kommer inn i lyset
  slipp(m) { if (this.ledige.length < 16) { m.visible = false; this.ledige.push(m); } else { R.scene.remove(m); m.material.dispose(); } },
  lykt(dt) {
    const P = G.player, lykt = P && P.alive && P.lantern && P.lantern.parent;
    if (!lykt || R.safe || !R.lightsOn || G.state === 'title') { this.tomSkygger(); return; }
    // styrken i forhold til den vanlige lykta (0,35), så skyggene flakker og blekner når lykta gjør det
    const c = P.lantern.material.color, b0 = P.lantern.userData.col, k = clamp(Math.max(c.r, c.g, c.b) / Math.max(.001, Math.max(b0.r, b0.g, b0.b) * .35), 0, 1.3), RR = Math.max(2.5, P.lantern.scale.x * .5 * 1.15), ok = new Set();
    this.lt += dt;
    for (const K of this.kastere()) {
      const dx = K.x - P.x, dz = K.z - P.z, d = Math.hypot(dx, dz); if (d > RR || d < .2) continue;
      const ux = dx / d, uz = dz / d;
      // står det en vegg mellom lykta og kasteren? Sjekkes hvert 0,2 sekund, fram til litt foran kasteren, så ting inntil en vegg ikke skygges av den
      let S = this.sikt.get(K.k); if (!S || this.lt >= S.t) { S = { t: this.lt + .2, v: this.tilVegg(P.x, P.z, ux, uz, d) >= d - .3 }; this.sikt.set(K.k, S); }
      let m = this.skygger.get(K.k);
      if (!m) { if (!S.v) continue; m = this.plate(); this.skygger.set(K.k, m); }
      // skyggen glir inn og ut bak hjørner på 0,15 sekunder
      const u = m.userData; u.s = clamp(u.s + (S.v ? dt : -dt) / .15, 0, 1); if (!S.v && u.s <= 0) continue;
      // lengden stopper ved første vegg bak kasteren, og nær lykta blekner den bort i stedet for å bli klippet
      const L = (.8 + d * 1.15) * K.h, lang = Math.max(.05, Math.min(L, this.tilVegg(K.x, K.z, ux, uz, L))), n = 1 - d / RR, q = clamp((d - .2) / .4, 0, 1), a = K.U && K.U.uAlpha ? K.U.uAlpha.value * (1 - K.U.uDissolve.value) : 1;
      m.position.set(K.x, .014, K.z); m.rotation.z = Math.atan2(-ux, -uz);
      m.scale.set(K.b, lang, 1); m.material.opacity = Math.min(.85, n * 1.8) * Math.min(1, k) * q * q * (3 - 2 * q) * clamp(a, 0, 1) * u.s; ok.add(K.k);
    }
    for (const [key, m] of this.skygger) if (!ok.has(key)) { this.slipp(m); this.skygger.delete(key); }
  },
  tomSkygger() { for (const m of this.skygger.values()) this.slipp(m); this.skygger.clear(); },
  /* ---------- kontaktskygger langs veggene ---------- */
  kontakt(F) {
    if (R.safe || !F || !R.level || !Paint.wallH) return;
    const W = F.W, H = F.H, PX = 8, c = document.createElement('canvas'); c.width = W * PX; c.height = H * PX;
    const g = c.getContext('2d'), wh = Paint.wallH, VG = typeof VEGG === 'object' ? VEGG : {};
    const gulv = (x, z) => x >= 0 && z >= 0 && x < W && z < H && F.tiles[z * W + x] > 0;
    const vegg = (x, z) => { if (x < 0 || z < 0 || x >= W || z >= H) return 0; const h = wh[z * W + x]; if (!h) return 0; const st = Paint.wallS && Paint.wallS[z * W + x], V = VG[st] || {}; return V.alfa ? .35 : 1; };
    const strek = (x0, y0, x1, y1, a) => { const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; };
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
      if (!gulv(x, z)) continue; const X = x * PX, Z = z * PX;
      const n = vegg(x, z - 1), s = vegg(x, z + 1), w = vegg(x - 1, z), e = vegg(x + 1, z);
      if (n) { strek(0, Z, 0, Z + PX, .62 * n); g.fillRect(X, Z, PX, PX); }       // de høye veggene bak
      if (w) { strek(X, 0, X + PX * .6, 0, .45 * w); g.fillRect(X, Z, PX * .6, PX); }
      if (e) { strek(X + PX, 0, X + PX * .4, 0, .45 * e); g.fillRect(X + PX * .4, Z, PX * .6, PX); }
      if (s) { strek(0, Z + PX, 0, Z + PX * .7, .25 * s); g.fillRect(X, Z + PX * .7, PX, PX * .3); } // de lave veggene foran
      // indre hjørner der to vegger møtes blir ekstra mørke
      if (n && w) { const gr = g.createRadialGradient(X, Z, 0, X, Z, PX * .8); gr.addColorStop(0, 'rgba(0,0,0,.28)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(X, Z, PX, PX); }
      if (n && e) { const gr = g.createRadialGradient(X + PX, Z, 0, X + PX, Z, PX * .8); gr.addColorStop(0, 'rgba(0,0,0,.28)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(X, Z, PX, PX); }
    }
    const t = new THREE.CanvasTexture(c); t.anisotropy = 4;
    const m = new THREE.Mesh(R.plane1(), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, opacity: F.ute ? .6 : .9 }));
    m.rotation.x = -Math.PI / 2; m.position.set(W / 2, .011, H / 2); m.scale.set(W, H, 1); m.renderOrder = .5; m.frustumCulled = false; m.userData.d3 = true; R.level.add(m);
    this.ao = { m, t }; // tekstur og materiale ryddes med etasjen (se clearFloor under)
  },
  /* ---------- takstøv: stein og puss drysser ned fra taket når det smeller, og skyggen på gulvet vokser mens det faller ---------- */
  stov: [], stovMesh: null, stovSkygge: null, stovT: 0, MAKS: 64,
  stovInit() {
    if (this.stovMesh || !R.scene) return;
    const n = this.MAKS, m = new THREE.InstancedMesh(new THREE.BoxGeometry(.09, .07, .09), new THREE.MeshBasicMaterial({ color: 0x6a6258 }), n);
    const sk = new THREE.InstancedMesh(R.plane1(), new THREE.MeshBasicMaterial({ map: Doll.blobTex || Doll.blob(.3).material.map, transparent: true, depthWrite: false, opacity: .8 }), n);
    for (const x of [m, sk]) { x.instanceMatrix.setUsage(THREE.DynamicDrawUsage); x.count = 0; x.frustumCulled = false; R.scene.add(x); }
    sk.renderOrder = 1; this.stovMesh = m; this.stovSkygge = sk; this.dummy = new THREE.Object3D();
  },
  takstov(x, z, n = 14, r = 3) {
    if (R.safe || !G.F || Vaer.ute(x, z)) return; // ute er det ikke noe tak
    this.stovInit(); if (!this.stovMesh) return;
    for (let i = 0; i < n && this.stov.length < this.MAKS; i++) {
      const a = Math.random() * TAU, d = Math.sqrt(Math.random()) * r, px = x + Math.sin(a) * d, pz = z + Math.cos(a) * d;
      if (tIdx(px, pz) < 0 || !G.F.tiles[tIdx(px, pz)]) continue;
      this.stov.push({ x: px, z: pz, y: rnd(4.5, 7.5), vy: -rnd(0, 2), s: rnd(.6, 1.5), spin: rnd(-8, 8), a: Math.random() * TAU, landet: 0 });
    }
    Sound.play('knirk', .5, rnd(.7, .9));
  },
  stovTick(dt) {
    if (!this.stovMesh) return; const D = this.dummy, L = this.stov;
    for (let i = L.length - 1; i >= 0; i--) {
      const s = L[i];
      if (s.landet) { s.landet += dt; if (s.landet > 1.6) L.splice(i, 1); continue; }
      s.vy -= 16 * dt; s.y += s.vy * dt; s.a += s.spin * dt;
      if (s.y <= .04) { s.y = .04; s.landet = .001; puff(s.x, s.z, 1, .35, '#b8b0a0'); if (Math.random() < .25) Sound.play('kvist', .25, rnd(1.4, 2)); }
    }
    let n = 0;
    for (const s of L) {
      D.position.set(s.x, s.y, s.z); D.rotation.set(s.a, s.a * .7, 0); D.scale.setScalar(s.s * (s.landet ? Math.max(0, 1 - s.landet / 1.6) : 1)); D.updateMatrix(); this.stovMesh.setMatrixAt(n, D.matrix);
      // skyggen: liten og skarp når steinen er nær gulvet, stor og svak høyt oppe
      const h = Math.min(1, s.y / 7), k = s.landet ? 0 : (.12 + .3 * (1 - h)) * s.s;
      D.position.set(s.x + .08, .015, s.z + .05); D.rotation.set(-Math.PI / 2, 0, 0); D.scale.set(k * (1 + h * 2.5), k * (1 + h * 2.5), 1); D.updateMatrix(); this.stovSkygge.setMatrixAt(n, D.matrix); n++;
    }
    this.stovMesh.count = this.stovSkygge.count = n; this.stovMesh.instanceMatrix.needsUpdate = this.stovSkygge.instanceMatrix.needsUpdate = true;
  },
  /* ---------- varme og speiling ---------- */
  VARME: { baal: [1.25, .9, 1.4], vedovn: [1.0, .5, .9], kjele: [2.0, .6, 1.1], komfyr: [1.0, .4, .8], gryte: [.9, .3, .7] },
  varme() {
    const L = []; if (R.safe || !G.props) { R.varmeL = L; return; }
    const cx = R.camT.x, cz = R.camT.z, viewH = (R.camera.top - R.camera.bottom) / (R.camera.zoom || 1);
    for (const o of G.props) { const V = this.VARME[o.kind]; if (!V || o.alive === false || !o.g) continue; const d = (o.x - cx) ** 2 + (o.z - cz) ** 2; if (d > 196) continue; L.push({ d, x: o.x, y: V[0] * BILL_Y, z: o.g.position.z + .1, r: V[2] / viewH, s: V[1] }); }
    L.sort((a, b) => a.d - b.d); R.varmeL = L.slice(0, 4);
  },
  speil() {
    if (!R.water) return; const P = R.water.u.uLysP.value, Fv = R.water.u.uLysF.value;
    const K = R.safe || !R.lightsOn ? [] : D3.kilder(), cx = R.camT.x, cz = R.camT.z, best = [];
    for (const m of K) { const c = m.material.color; if (c.r + c.g + c.b < .05) continue; const d = (m.position.x - cx) ** 2 + (m.position.z - cz) ** 2; if (d > 256) continue; best.push([d, m]); }
    best.sort((a, b) => a[0] - b[0]);
    for (let i = 0; i < 6; i++) { const b = best[i]; if (!b) { Fv[i].set(0, 0, 0); continue; } const m = b[1], c = m.material.color; P[i].set(m.position.x, m.scale.x * .5 * 1.1, m.position.z); Fv[i].set(c.r * .55, c.g * .55, c.b * .55); }
  },
  tick(dt) {
    this.lykt(dt); this.varme(); this.stovTick(dt); this.stovT -= dt;
    if ((this.speilT = (this.speilT || 0) - dt) <= 0) { this.speilT = .1; this.speil(); }
  },
  tom() { this.tomSkygger(); for (const m of this.ledige) { R.scene.remove(m); m.material.dispose(); } this.ledige = []; this.stov = []; if (this.stovMesh) this.stovMesh.count = this.stovSkygge.count = 0; if (this.ao) { this.ao.t.dispose(); this.ao.m.material.dispose(); this.ao = null; } R.varmeL = []; R.kam.hold = R.kam.kick = R.kam.holdT = 0; }
};

/* ---------- koblinger ---------- */
{ const _dl = decorateLevel; decorateLevel = function () { _dl(); try { Dybde.kontakt(G.F); } catch (e) { console.warn('kontaktskyggene feilet', e); } }; }
{ const _cf = clearFloor; clearFloor = function () { Dybde.tom(); _cf(); }; }
// takstøv når det smeller hardt: sjefenes slag, eksplosjoner, lynet og massakrer (høyst hvert 1,2 sekund)
{ const _sh = R.shake.bind(R); R.shake = function (a) { _sh(a); if (a >= .5 && Dybde.stovT <= 0 && G.state === 'play') { Dybde.stovT = 1.2; Dybde.takstov(R.camT.x + rnd(-2, 2), R.camT.z + rnd(-1.5, 1.5), Math.round(8 + a * 14), 3.5 + a * 2); } }; }
// kameradykk på de store øyeblikkene
{ const _sb = spawnBoss; spawnBoss = function (...a) { const B = _sb.apply(this, a); R.kamZoom(.12, 2.4); return B; }; }
{ const _pd = playerDie; playerDie = function () { const levde = G.player && G.player.alive; _pd(); if (levde) R.kamZoom(.22, 3); }; }
{ const _f = Kombo.flerdrap; Kombo.flerdrap = function (k, e) { _f.call(this, k, e); if (k >= 3) R.kamZoom(.04 + k * .016); }; }
{ const _s = Kombo.sjef; Kombo.sjef = function (B) { _s.call(this, B); R.kamZoom(.16, 1.2); }; }
{ const _fa = Kombo.fanfare; Kombo.fanfare = function (hva) { _fa.call(this, hva); R.kamZoom(.1, .7); }; }
{ const _m = Kombo.milepael; Kombo.milepael = function (N) { _m.call(this, N); if (N[2] >= 4) R.kamZoom(.03 + N[2] * .012); }; }
