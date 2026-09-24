/* ============================================================
   ROM I 3D (PRØVE)  -  bare rommene, gulvet og effektene er 3D. Figurene og
   tingene er de samme 2D-tegningene som ellers, men de lyses av lampene og
   kaster ekte skygge etter tegningen. Mørk natt, varme punktlys fra lamper
   og stearinlys, måneskinn gjennom vinduene, lister og pilastre som stikker
   ut av veggene, relieff i gulvflisene, støv i lyset og glød.
   Slås på i innstillingene (Bilde) eller med #3d. Alt legges oppå den
   vanlige etasjen og kan tas bort igjen uten å bygge etasjen på nytt.
   ============================================================ */
const D3 = {
  on: false, bygd: false, ting: [], byttet: [], egne: [], gjemt: [], pool: [], dukker: new Set(), t: 0,
  POOL: 8, BUMP: .7,
  gradient() {
    if (this.grad) return this.grad;
    const d = new Uint8Array([60, 60, 60, 255, 118, 118, 118, 255, 178, 178, 178, 255, 222, 222, 222, 255]);
    const t = new THREE.DataTexture(d, 4, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true;
    return this.grad = t;
  },
  toon(o) { const m = new THREE.MeshToonMaterial(Object.assign({ gradientMap: this.gradient() }, o)); return m; },
  sett(on) {
    on = !!on && !R.safe; if (on === this.on) return; this.on = on;
    R.renderer.shadowMap.enabled = true; R.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if (on) this.onFloor(); else this.riv();
  },
  /* kalles når en etasje (eller tittelen) er ferdig bygd */
  onFloor() { this.riv(); if (!this.on || !R.level || !G.F) return; try { this.bygg(); } catch (e) { console.warn('3D-prøven feilet', e); this.riv(); } },
  bygg() {
    const sc = R.scene, F = G.F, th = G.th || THEMES[1];
    // himmel og måne
    const amb = new THREE.AmbientLight(new THREE.Color(th.fog || '#1a1622').lerp(new THREE.Color('#3a3450'), .6), .32);
    const hemi = new THREE.HemisphereLight('#8a90c8', '#2a1a14', .16);
    const mane = new THREE.DirectionalLight('#9aaee8', .42); mane.castShadow = true;
    mane.shadow.mapSize.set(2048, 2048); const sc2 = mane.shadow.camera; sc2.left = -16; sc2.right = 16; sc2.top = 16; sc2.bottom = -16; sc2.near = 1; sc2.far = 60; mane.shadow.bias = -.0015; mane.shadow.normalBias = .02;
    sc.add(amb, hemi, mane, mane.target); this.mane = mane; this.ting.push(amb, hemi, mane, mane.target);
    this.pool = []; for (let i = 0; i < this.POOL; i++) { const l = new THREE.PointLight('#ffd89a', 0, 6, 2); l.position.set(0, -50, 0); sc.add(l); this.pool.push(l); this.ting.push(l); }
    // nivået: materialene byttes til tegneseriebelyste varianter
    const bytt = (mesh, ny) => { this.byttet.push([mesh, mesh.material]); mesh.material = ny; };
    const PM = Paint.mesh || {};
    for (const m of [PM.gulv, PM.topp, PM.vegg]) if (m && !m.geometry.attributes.normal) m.geometry.computeVertexNormals(); // den malte stilen trenger ikke normaler, lys gjør det
    if (PM.gulv) { bytt(PM.gulv, this.toon({ map: PM.gulv.material.map, bumpMap: PM.gulv.material.map, bumpScale: this.BUMP, vertexColors: true })); PM.gulv.receiveShadow = true; }
    if (PM.topp) { bytt(PM.topp, this.toon({ vertexColors: true, side: THREE.DoubleSide })); PM.topp.castShadow = true; }
    if (PM.vegg) { bytt(PM.vegg, this.toon({ map: PM.vegg.material.map, side: THREE.DoubleSide })); PM.vegg.castShadow = true; PM.vegg.receiveShadow = true; }
    this.lysLag();
    this.vegglamper(F, th); this.arkitektur(F, th); this.stov();
    for (const o of G.props) { o.d3 = true; this.moble(o); }
    R.post.uniforms.uLights.value = 0;
    this.bygd = true; this.t = 0;
  },
  riv() {
    for (const o of this.ting) R.remove(o); this.ting = []; this.pool = [];
    for (const [m, mat] of this.byttet) { if (m.material !== mat) m.material.dispose(); m.material = mat; m.castShadow = m.receiveShadow = false; } this.byttet = [];
    for (const s of this.gjemt) s.visible = true; this.gjemt = []; this.stovP = null;
    for (const o of this.egne) o.dispose(); this.egne = [];
    for (const d of this.dukker) if (d.U && d.U.tint0) d.U.uTint.value.copy(d.U.tint0); this.dukker.clear();
    if (G.props) for (const o of G.props) { o.d3 = false; if (o.U && o.U.tint0) o.U.uTint.value.copy(o.U.tint0); }
    if (R.post) R.post.uniforms.uLights.value = R.lightsOn ? 1 : 0;
    this.bygd = false;
  },
  /* vanlige materialer i nivået (dekaler, plakater, dører) blir lyssatt, ellers lyser de i mørket */
  lysLag() {
    if (!R.level) return;
    for (const c of R.level.children) {
      if (c.userData.d3 || !c.isMesh || !c.material || !c.material.isMeshBasicMaterial || c.material.blending === THREE.AdditiveBlending) continue;
      const b = c.material; c.userData.d3 = true;
      const ny = new THREE.MeshLambertMaterial({ map: b.map, color: b.color, transparent: b.transparent, opacity: b.opacity, depthWrite: b.depthWrite, side: b.side, vertexColors: b.vertexColors });
      this.byttet.push([c, b]); c.material = ny; c.receiveShadow = true;
    }
  },
  /* vegglamper og vinduer med måneskinn på nordveggene i hvert rom */
  vegglamper(F, th) {
    const isF = (x, z) => x >= 0 && z >= 0 && x < F.W && z < F.H && F.tiles[z * F.W + x] > 0, wh = Paint.wallH || [];
    const ink = new THREE.MeshBasicMaterial({ color: INK }), messing = this.toon({ color: '#b08a3a' }), glod = new THREE.MeshBasicMaterial({ color: '#ffd89a' });
    const glass = new THREE.MeshBasicMaterial({ color: '#5a70b8' }), ramme = this.toon({ color: '#4a3524' });
    for (const r of F.rooms) {
      if (r.role === 'secret') continue;
      const z = r.z; let n = 0;
      for (let x = r.x + 1; x < r.x + r.w - 1; x += 3) {
        if (!isF(x, z) || isF(x, z - 1) || !(wh[(z - 1) * F.W + x] > 2) || (Paint.opptatt && Paint.opptatt.has(x + ',' + z))) continue;
        const g = new THREE.Group(); g.position.set(x + .5, 0, z + .03); R.level.add(g); this.ting.push(g);
        if (n % 2 === 0) {
          // vegglampe: brakett, skjerm og pære som gløder
          const b = new THREE.Mesh(R.geo('d3brak', () => new THREE.BoxGeometry(.08, .08, .3)), messing); b.position.set(0, 1.55, .15); g.add(b);
          const sk = new THREE.Mesh(R.geo('d3skj', () => new THREE.ConeGeometry(.2, .22, 8, 1, true)), this.toon({ color: '#c8a060', side: THREE.DoubleSide })); sk.position.set(0, 1.62, .3); g.add(sk);
          const p = new THREE.Mesh(R.geo('d3pare', () => new THREE.SphereGeometry(.08, 8, 6)), glod); p.position.set(0, 1.5, .3); g.add(p);
          const lp = R.light(x + .5, z + 1.2, 3.2, th.pool || '#ffd89a', .45, R.levelL); lp.userData.y = 1.5; this.ting.push(lp);
        } else {
          // vindu: ramme, glass i månelys og en lysstripe ned på gulvet
          const fr = new THREE.Mesh(R.geo('d3vr', () => new THREE.BoxGeometry(.9, 1.0, .06)), ramme); fr.position.set(0, 1.45, 0); g.add(fr);
          for (const [dx, dy] of [[-.2, .22], [.2, .22], [-.2, -.2], [.2, -.2]]) { const q = new THREE.Mesh(R.geo('d3vg', () => new THREE.PlaneGeometry(.34, .36)), glass); q.position.set(dx, 1.45 + dy, .035); g.add(q); }
          const sj = new THREE.Mesh(R.geo('d3sj', () => { const s = new THREE.PlaneGeometry(1, 1); s.translate(0, .5, 0); return s; }), new THREE.MeshBasicMaterial({ map: this.stripeTex(), color: '#7a8ad0', transparent: true, opacity: .22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
          sj.position.set(0, 0, 0); sj.rotation.x = -1.05; sj.scale.set(1.1, 2.6, 1); g.add(sj);
          const lv = R.light(x + .5, z + 1.6, 2.6, '#8a9ae0', .4, R.levelL); lv.userData.y = 1.9; this.ting.push(lv);
        }
        n++;
      }
    }
  },
  stripeTex() { return this._st || (this._st = R.canvasTex(32, 128, g => { const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.3, 'rgba(255,255,255,.8)'); gr.addColorStop(1, 'rgba(255,255,255,1)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 128); })); },
  /* ---------- rommets egen dybde ---------- */
  /* fotlist, brystlist og taklist langs de høye veggene, og pilastre mellom lampene og vinduene.
     Listene ligger der veggtegningen allerede har dem, så de bare løfter seg ut av veggen. */
  arkitektur(F, th) {
    const W = F.W, wh = Paint.wallH || [], isF = (x, z) => x >= 0 && z >= 0 && x < W && z < F.H && F.tiles[z * W + x] > 0;
    const opp = (x, z) => (Paint.opptatt && Paint.opptatt.get(x + ',' + z)) || '';
    const front = []; for (let z = 0; z < F.H; z++) for (let x = 0; x < W; x++) if (wh[z * W + x] > 2 && isF(x, z + 1)) front.push([x, z + 1, opp(x, z + 1)]);
    const piler = [];
    for (const r of F.rooms) {
      if (r.role === 'secret') continue;
      for (let x = r.x + 3; x < r.x + r.w - 1; x += 3) if (wh[(r.z - 1) * W + x - 1] > 2 && wh[(r.z - 1) * W + x] > 2 && isF(x - 1, r.z) && isF(x, r.z) && !opp(x - 1, r.z) && !opp(x, r.z)) piler.push([x, r.z]);
    }
    // hver del er en kasse, og en litt større blekkasse rett bak den gir strek på sidene og under
    const mx = new THREE.Matrix4(), kasse = (w, h, d) => R.geo('d3k' + [w, h, d].join(','), () => new THREE.BoxGeometry(w, h, d));
    const rad = (w, h, d, mat, pos, k = .02) => {
      if (!pos.length) return;
      const lag = (geo, m, dy, dz) => { const im = new THREE.InstancedMesh(geo, m, pos.length); pos.forEach((p, i) => im.setMatrixAt(i, mx.makeTranslation(p[0], p[1] + dy, p[2] + d / 2 + dz))); im.userData.d3 = true; R.level.add(im); this.ting.push(im); return im; };
      const im = lag(kasse(w, h, d), mat, 0, 0); im.castShadow = im.receiveShadow = true; this.egne.push(mat);
      lag(kasse(w + 2 * k, h + k - .004, d - .004), this.blekk(), -k / 2 - .002, -.002);
    };
    const fot = this.toon({ color: Col.dark(th.base, .9) }), bryst = this.toon({ color: Col.dark(th.wains, .8) }), tak = this.toon({ color: Col.light(th.wall, .08) }), pil = this.toon({ color: Col.light(th.wall, .12) });
    rad(1, .16, .07, fot, front.filter(f => f[2] !== 'dor').map(([x, z]) => [x + .5, .08, z]), .016);
    rad(1, .08, .09, bryst, front.filter(f => !f[2]).map(([x, z]) => [x + .5, 1.02, z]), .016);
    rad(1, .12, .16, tak, front.map(([x, z]) => [x + .5, 2.2, z]));
    rad(.3, 2.1, .13, pil, piler.map(([x, z]) => [x, 1.12, z]));
    rad(.42, .2, .19, fot, piler.map(([x, z]) => [x, .1, z]), .016);
    rad(.44, .12, .21, tak, piler.map(([x, z]) => [x, 2.12, z]));
  },
  blekk() { return this._blekk || (this._blekk = new THREE.MeshBasicMaterial({ color: INK })); },
  /* støv som svever i lyset: hvert korn hører til ett av punktlysene og driver rundt i lyskjeglen */
  stov() {
    const N = 192, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), off = new Float32Array(N * 3), fase = new Float32Array(N);
    for (let i = 0; i < N; i++) { this.nyttKorn(off, i); fase[i] = Math.random() * TAU; }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const tex = this._prikk || (this._prikk = R.canvasTex(16, 16, g => { const gr = g.createRadialGradient(8, 8, 0, 8, 8, 8); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 16, 16); }));
    const mat = new THREE.PointsMaterial({ size: 4.2, sizeAttenuation: false, map: tex, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; R.scene.add(pts); this.ting.push(pts); this.egne.push(geo, mat);
    this.stovP = { pos, col, off, fase, N, geo };
  },
  STOV_R: 1.7,
  nyttKorn(off, i) { const r = this.STOV_R * Math.cbrt(Math.random()), a = Math.random() * TAU, b = Math.acos(2 * Math.random() - 1); off[i * 3] = r * Math.sin(b) * Math.cos(a); off[i * 3 + 1] = r * Math.cos(b) * .7 - .4; off[i * 3 + 2] = r * Math.sin(b) * Math.sin(a); },
  stovTick(dt) {
    const S = this.stovP; if (!S || !this.pool.length) return;
    const t = this.t, { pos, col, off, fase } = S, Rr = this.STOV_R;
    for (let i = 0; i < S.N; i++) {
      const j = i * 3, L = this.pool[i % this.pool.length], f = fase[i];
      off[j] += Math.sin(t * .3 + f) * dt * .12; off[j + 1] += Math.sin(t * .5 + f * 2) * dt * .05 - dt * .02; off[j + 2] += Math.cos(t * .23 + f) * dt * .1;
      let d = Math.hypot(off[j], off[j + 1], off[j + 2]); if (d > Rr) { this.nyttKorn(off, i); d = Math.hypot(off[j], off[j + 1], off[j + 2]); }
      pos[j] = L.position.x + off[j]; pos[j + 1] = Math.max(.08, L.position.y + off[j + 1]); pos[j + 2] = L.position.z + off[j + 2];
      const k = L.intensity > 0 ? (1 - d / Rr) ** 2 * L.intensity * (.45 + .55 * Math.sin(t * 1.3 + f * 3) ** 2) * 2.4 : 0;
      col[j] = L.color.r * k; col[j + 1] = L.color.g * k; col[j + 2] = L.color.b * k;
    }
    S.geo.attributes.position.needsUpdate = S.geo.attributes.color.needsUpdate = true;
  },
  /* tingene i rommet er de samme tegningene som ellers: de lyses av lampene og kaster skygge etter tegningen */
  moble(o) {
    if (!o.g || !o.p || o.g.userData.flat || !o.g.userData.m) return;
    this.skyggePlate(o.g.userData.m); if (o.g.userData.shadow) { o.g.userData.shadow.visible = false; this.gjemt.push(o.g.userData.shadow); }
  },
  /* tegnede plater kaster skygge etter tegningen (alfa), ikke som firkanter */
  skyggePlate(m) {
    if (!m || !m.material || !m.material.uniforms || m.customDepthMaterial) return;
    m.castShadow = true; m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: m.material.uniforms.map.value, alphaTest: .5, side: THREE.DoubleSide });
  },
  dukke(d) {
    if (!d || this.dukker.has(d)) return; this.dukker.add(d);
    if (d.U && !d.U.tint0) d.U.tint0 = d.U.uTint.value.clone();
    for (const m of d.meshes || []) this.skyggePlate(m);
    for (const r of [d.back, d.front]) if (r && r.mesh) r.mesh.castShadow = true;
    if (d.shadow) d.shadow.material.opacity = .45;
  },
  /* ---------- hvert bilde ---------- */
  kilder() { return (R.kilder || []).filter(m => m.parent && (m.parent === R.lscene || m.parent === R.levelL) && (m.parent !== R.levelL || R.levelL.parent)); },
  lysVed(x, z, y = .9) {
    const c = this._c || (this._c = new THREE.Color()); c.setRGB(.26, .25, .34);
    for (const l of this.pool) { if (l.intensity <= 0) continue; const dx = l.position.x - x, dz = l.position.z - z, dy = l.position.y - y, d = Math.sqrt(dx * dx + dz * dz + dy * dy), k = Math.max(0, 1 - d / l.distance); if (k > 0) { const f = k * k * l.intensity * .55; c.r += l.color.r * f; c.g += l.color.g * f; c.b += l.color.b * f; } }
    c.r = Math.min(1.5, c.r); c.g = Math.min(1.5, c.g); c.b = Math.min(1.5, c.b); return c;
  },
  tick(dt) {
    if (!this.on || !this.bygd || !G.F) return;
    this.t += dt; const cx = R.camT.x, cz = R.camT.z;
    this.mane.position.set(cx - 7, 16, cz + 9); this.mane.target.position.set(cx, 0, cz); this.mane.target.updateMatrixWorld();
    // de nærmeste lyskildene får punktlysene; spillerens lykt først
    const K = this.kilder(), P = G.player;
    K.sort((a, b) => (a === (P && P.lantern) ? -1 : b === (P && P.lantern) ? 1 : 0) || ((a.position.x - cx) ** 2 + (a.position.z - cz) ** 2) - ((b.position.x - cx) ** 2 + (b.position.z - cz) ** 2));
    for (let i = 0; i < this.pool.length; i++) {
      const l = this.pool[i], m = K[i];
      if (!m) { l.intensity = 0; continue; }
      const base = m.userData.col, cur = m.material.color, k = Math.max(cur.r, cur.g, cur.b) / Math.max(.001, Math.max(base.r, base.g, base.b));
      l.color.copy(base); l.intensity = k * (m === (P && P.lantern) ? 1.2 : 1.5); l.distance = m.scale.x * .55 + 1;
      l.position.set(m.position.x, m.userData.y || (m === (P && P.lantern) ? 1.8 : 1.6), m.position.z - .3);
    }
    // tegnede figurer og plater lyses av de samme lampene
    const alle = []; if (P && P.doll) alle.push(P.doll); for (const e of G.enemies || []) if (e.doll) alle.push(e.doll);
    if (G.boss && G.boss.doll) alle.push(G.boss.doll); for (const n of G.npcs || []) if (n.doll) alle.push(n.doll); for (const d of G.titleDolls || []) alle.push(d);
    for (const d of alle) { this.dukke(d); const p = d.root.position, c = this.lysVed(p.x, p.z); d.U.uTint.value.copy(d.U.tint0).multiply(c); }
    if ((this.nyT = (this.nyT || 0) - dt) <= 0) { this.nyT = .5; this.lysLag(); for (const o of G.props) if (o.g && !o.d3) { o.d3 = true; this.moble(o); } }
    this.stovTick(dt);
    for (const o of G.props) { if (!o.U || !o.g || !o.g.visible) continue; if (!o.U.tint0) o.U.tint0 = o.U.uTint.value.clone(); const c = this.lysVed(o.x, o.z, 1); o.U.uTint.value.copy(o.U.tint0).multiply(c); }
  }
};
