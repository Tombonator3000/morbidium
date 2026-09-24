/* ============================================================
   ROM I 3D (PRØVE)  -  planen fra 24.9. kl. 14:43: mørk natt, varme punktlys fra
   lamper og stearinlys, måneskinn og skygger, glød, og lavpoly-møbler med
   tegneseriestrek. Figurene er fortsatt 2D, men lyses av de samme lampene
   og kaster ekte skygge. Slås på i innstillingene (Bilde) eller med #3d.
   Alt bygges oppå den vanlige etasjen og kan tas bort igjen uten å bygge
   etasjen på nytt: materialer byttes og tilbakestilles, modeller henges på
   rekvisittene, og lysene fordeles på de nærmeste lyskildene hvert bilde.
   ============================================================ */
const D3 = {
  on: false, bygd: false, ting: [], byttet: [], modeller: [], pool: [], dukker: new Set(), t: 0,
  POOL: 8,
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
    if (PM.gulv) { bytt(PM.gulv, this.toon({ map: PM.gulv.material.map, vertexColors: true })); PM.gulv.receiveShadow = true; }
    if (PM.topp) { bytt(PM.topp, this.toon({ vertexColors: true, side: THREE.DoubleSide })); PM.topp.castShadow = true; }
    if (PM.vegg) { bytt(PM.vegg, this.toon({ map: PM.vegg.material.map, side: THREE.DoubleSide })); PM.vegg.castShadow = true; PM.vegg.receiveShadow = true; }
    this.lysLag();
    this.vegglamper(F, th);
    // møbler: lavpoly der vi har en modell, ellers lyssatt plate som kaster skygge
    for (const o of G.props) { o.d3 = true; this.moble(o); }
    R.post.uniforms.uLights.value = 0;
    this.bygd = true; this.t = 0;
  },
  riv() {
    for (const o of this.ting) R.remove(o); this.ting = []; this.pool = [];
    for (const [m, mat] of this.byttet) { m.material = mat; m.castShadow = m.receiveShadow = false; } this.byttet = [];
    for (const md of this.modeller) { R.remove(md.grp); if (md.o && md.o.g) { if (md.o.g.userData.m) md.o.g.userData.m.visible = true; if (md.o.g.userData.shadow) md.o.g.userData.shadow.visible = true; } } this.modeller = [];
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
        if (!isF(x, z) || isF(x, z - 1) || !(wh[(z - 1) * F.W + x] > 2)) continue;
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
  /* ---------- lavpoly-møbler ---------- */
  inkBack: null,
  kant(mesh, t = .06) {
    if (!this.inkBack) this.inkBack = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });
    const p = mesh.geometry.parameters || {}, w = p.width || (p.radiusTop || p.radius || .3) * 2, h = p.height || .3, d = p.depth || w;
    const o = new THREE.Mesh(mesh.geometry, this.inkBack); o.scale.set(1 + t / w, 1 + t / h, 1 + t / d); mesh.add(o); return mesh;
  },
  box(w, h, d, mat, x = 0, y = 0, z = 0, kant = true) { const m = new THREE.Mesh(R.geo('b' + [w, h, d].join(','), () => new THREE.BoxGeometry(w, h, d)), mat); m.position.set(x, y + h / 2, z); m.castShadow = m.receiveShadow = true; if (kant) this.kant(m); return m; },
  cyl(rt, rb, h, mat, x = 0, y = 0, z = 0, seg = 10) { const m = new THREE.Mesh(R.geo('c' + [rt, rb, h, seg].join(','), () => new THREE.CylinderGeometry(rt, rb, h, seg)), mat); m.position.set(x, y + h / 2, z); m.castShadow = m.receiveShadow = true; this.kant(m, .05); return m; },
  mats: null,
  mat(k) {
    if (!this.mats) {
      const tre = R.canvasTex(64, 64, g => { g.fillStyle = '#8a5a34'; g.fillRect(0, 0, 64, 64); g.strokeStyle = 'rgba(42,20,8,.45)'; g.lineWidth = 2; for (let y = 8; y < 64; y += 16) { g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(20, y - 3, 40, y + 3, 64, y); g.stroke(); } g.fillStyle = 'rgba(42,20,8,.8)'; g.fillRect(0, 0, 64, 2); }, true);
      const skuff = R.canvasTex(64, 64, g => { g.fillStyle = '#fff'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#2a1a14'; g.lineWidth = 3; for (let i = 0; i < 3; i++) { g.strokeRect(6, 6 + i * 19, 52, 15); g.fillStyle = '#d4b048'; g.fillRect(27, 11 + i * 19, 10, 5); } });
      const boker = R.canvasTex(64, 64, g => { g.fillStyle = '#6a4424'; g.fillRect(0, 0, 64, 64); const C = ['#b3261e', '#3f5f8e', '#6f8a55', '#d4b048', '#5a3a6a', '#e8e0c8']; for (let r = 0; r < 3; r++) { let x = 4; while (x < 58) { const w = 4 + (x * 7 + r * 13) % 5; g.fillStyle = C[(x + r * 3) % C.length]; g.fillRect(x, 4 + r * 20, w, 16 - (x % 3)); x += w + 1; } g.fillStyle = '#3a2414'; g.fillRect(0, 20 + r * 20, 64, 3); } });
      this.mats = {
        tre: this.toon({ map: tre }), treL: this.toon({ color: '#b07a4a' }), treM: this.toon({ color: '#5a3a22' }), stal: this.toon({ color: '#b4bcc2' }), stalM: this.toon({ color: '#6a7278' }),
        hvit: this.toon({ color: '#f2efe4' }), gronn: this.toon({ color: '#6f8a55' }), stein: this.toon({ color: '#d8cfb0' }), lilla: this.toon({ color: '#5a2a6a' }), messing: this.toon({ color: '#c8a040' }),
        skuffer: this.toon({ map: skuff, color: '#8a5a34' }), skufferG: this.toon({ map: skuff, color: '#6f8a55' }), skufferS: this.toon({ map: skuff, color: '#8a969c' }), hyller: this.toon({ map: boker }),
        madrass: this.toon({ color: '#e8e2d0' }), teppe: this.toon({ color: '#5a70a8' }), vann: new THREE.MeshBasicMaterial({ color: '#2a5a7a' }), glod: new THREE.MeshBasicMaterial({ color: '#ffe0a0' }), flamme: new THREE.MeshBasicMaterial({ color: '#ffb24a' }),
        sopp: this.toon({ color: '#6a7a6a' }), rod: this.toon({ color: '#b3261e' }), suppe: this.toon({ color: '#d8a040' }), kurv: this.toon({ color: '#b8904a' }), kiste: this.toon({ color: '#6b4226' })
      };
    }
    return this.mats[k];
  },
  modell(p) {
    const k = p.k, fw = p.fw || 1, fd = p.fd || 1, M = n => this.mat(n), g = new THREE.Group();
    const legs = (w, d, h, mat, t = .07) => { for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(this.box(t, h, t, mat, sx * (w / 2 - t), 0, sz * (d / 2 - t), false)); };
    switch (k) {
      case 'crate': g.add(this.box(.78, .72, .78, M('tre'))); g.add(this.box(.82, .1, .1, M('treM'), 0, .31, .36, false)); break;
      case 'table': g.add(this.box(1.0, .07, .8, M('tre'), 0, .7)); g.add(this.box(1.06, .03, .86, M('hvit'), 0, .77, 0, false)); g.add(this.cyl(.12, .1, .03, M('rod'), 0, .8, 0, 10)); legs(.95, .75, .7, M('treM')); break;
      case 'desk': g.add(this.box(fw * .95, .08, .75, M('tre'), 0, .78)); g.add(this.box(fw * .38, .78, .7, M('skuffer'), -fw * .26, 0)); legs(fw * .95, .7, .78, M('treM')); break;
      case 'chair': g.add(this.box(.5, .07, .48, M('tre'), 0, .45)); legs(.5, .48, .45, M('treM'), .06); g.add(this.box(.5, .5, .06, M('tre'), 0, .52, -.21)); break;
      case 'bench': case 'pew': { const w = Math.max(fw, 1) * .92; g.add(this.box(w, .08, .45, M('tre'), 0, .44)); g.add(this.box(w, .45, .07, M('tre'), 0, .52, -.2)); legs(w, .45, .44, M('treM')); break; }
      case 'bed': case 'gurney': case 'optable': case 'tub': {
        const lang = fd > fw, L = Math.max(fw, fd) * .92, B = Math.min(fw, fd) * .8, gg = new THREE.Group();
        if (k === 'bed') { gg.add(this.box(B, .12, L, M('stalM'), 0, .38)); gg.add(this.box(B * .96, .16, L * .96, M('madrass'), 0, .5)); gg.add(this.box(B * .98, .08, L * .62, M('teppe'), 0, .66, L * .17)); gg.add(this.box(B * .6, .1, .3, M('hvit'), 0, .66, -L / 2 + .25)); gg.add(this.box(B, .7, .06, M('stal'), 0, .2, -L / 2)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) gg.add(this.box(.06, .4, .06, M('stalM'), sx * (B / 2 - .04), 0, sz * (L / 2 - .04), false)); }
        else if (k === 'tub') { gg.add(this.box(B, .6, L, M('hvit'))); gg.add(this.box(B * .8, .02, L * .85, M('vann'), 0, .56, 0, false)); }
        else { gg.add(this.box(B, .08, L, M('stal'), 0, .8)); gg.add(this.box(B * .9, .06, L * .9, k === 'gurney' ? M('madrass') : M('stalM'), 0, .88)); gg.add(this.cyl(.12, .2, .8, M('stalM'))); }
        if (!lang) gg.rotation.y = Math.PI / 2; g.add(gg); break;
      }
      case 'cabinet': g.add(this.box(fw * .85, 1.6, fd * .6, M('skufferG'))); break;
      case 'drawers': g.add(this.box(fw * .85, 1.0, fd * .55, M('skuffer'))); break;
      case 'shelf': g.add(this.box(fw * .9, 2.0, fd * .5, M('hyller'))); break;
      case 'wardrobe': g.add(this.box(fw * .88, 2.1, fd * .65, M('tre'))); g.add(this.box(.04, 1.9, .02, M('treM'), 0, .1, fd * .33, false)); break;
      case 'locker': g.add(this.box(fw * .72, 1.9, fd * .55, M('skufferS'))); break;
      case 'journalskap': g.add(this.box(.9, 1.8, .6, this.toon({ map: this.mat('skuffer').map, color: '#3f4f3a' }))); g.add(this.box(.3, .12, .05, this.mat('glod'), 0, .95, .31, false)); break;
      case 'counter': {
        const len = p.len || fw, svc = p.svc || 'kafeteria', kropp = svc === 'medisin' ? M('hvit') : svc === 'vaktmester' ? M('treM') : M('tre');
        g.add(this.box(len * .98, 1.0, .75, kropp)); g.add(this.box(len, .08, .85, svc === 'medisin' ? M('stal') : M('treL'), 0, 1.0));
        if (svc === 'kafeteria') for (let i = 0; i < Math.min(3, len); i++) { const x = -len / 2 + .6 + i * 1.4; g.add(this.cyl(.24, .22, .3, M('stal'), x, 1.08)); g.add(this.cyl(.21, .21, .02, M('suppe'), x, 1.37, 0, 12)); }
        if (svc === 'medisin') { g.add(this.box(.12, .42, .02, M('rod'), 0, .3, .38, false)); g.add(this.box(.42, .12, .02, M('rod'), 0, .45, .38, false)); for (let i = 0; i < 5; i++) g.add(this.cyl(.05, .05, .2, [M('rod'), M('gronn'), M('hvit')][i % 3], -len / 2 + .4 + i * .3, 1.08, 0, 6)); }
        if (svc === 'vaktmester') { g.add(this.box(.4, .22, .3, M('stalM'), -len / 2 + .5, 1.08)); g.add(this.box(.5, .06, .12, M('stal'), .3, 1.08)); g.add(this.box(.08, .06, .5, M('rod'), .9, 1.08, 0, false)); }
        break;
      }
      case 'pillar': g.add(this.box(.7, .2, .7, M('stein'))); g.add(this.cyl(.26, .28, 2.2, M('stein'), 0, .2, 0, 12)); g.add(this.box(.7, .2, .7, M('stein'), 0, 2.35)); break;
      case 'garbage': g.add(this.cyl(.3, .26, .62, M('sopp'))); g.add(this.cyl(.33, .33, .06, M('stalM'), 0, .62)); break;
      case 'basket': g.add(this.cyl(.36, .3, .45, M('kurv'))); g.add(this.cyl(.32, .32, .06, M('hvit'), 0, .42)); break;
      case 'coffin': g.add(this.box(fw * .75, .45, fd * .85, M('kiste'))); g.add(this.box(fw * .78, .08, fd * .88, M('treL'), 0, .45)); break;
      case 'altar': g.add(this.box(fw * .95, .9, .8, M('lilla'))); g.add(this.box(fw * .98, .06, .84, M('messing'), 0, .9)); break;
      case 'washer': { const n = Math.max(1, fw); for (let i = 0; i < n; i++) { const x = -n / 2 + i + .5; g.add(this.box(.92, 1.1, .8, M('hvit'), x)); const d = this.cyl(.26, .26, .05, M('stalM'), x, .55, .4, 16); d.rotation.x = Math.PI / 2; d.position.y = .55; g.add(d); } break; }
      case 'trolley': for (const y of [.3, .8]) g.add(this.box(.9, .05, .5, M('stal'), 0, y)); legs(.9, .5, .85, M('stalM'), .04); break;
      case 'lamp': g.add(this.cyl(.25, .28, .06, M('stalM'))); g.add(this.cyl(.03, .03, 1.5, M('stal'), 0, .05, 0, 6)); { const sk = this.cyl(.08, .26, .24, M('gronn'), .1, 1.45, 0, 10); g.add(sk); const b = new THREE.Mesh(R.geo('d3pare2', () => new THREE.SphereGeometry(.12, 8, 6)), M('glod')); b.position.set(.1, 1.36, .05); g.add(b); } break;
      case 'candles': for (const [x, h] of [[-.12, .3], [0, .45], [.12, .22]]) { g.add(this.cyl(.04, .045, h, M('hvit'), x, 0, 0, 6)); const f = new THREE.Mesh(R.geo('d3fl', () => new THREE.SphereGeometry(.035, 6, 4)), M('flamme')); f.position.set(x, h + .05, 0); f.scale.y = 1.6; g.add(f); } break;
      case 'chest': g.add(this.box(.72, .45, .5, M('tre'))); g.add(this.box(.74, .14, .52, M('treL'), 0, .45)); g.add(this.box(.1, .12, .04, M('messing'), 0, .38, .26, false)); break;
      default: return null;
    }
    return g;
  },
  moble(o) {
    if (!o.g || !o.p || o.g.userData.flat) return;
    const md = o.alive !== false ? this.modell(o.p) : null;
    if (md) {
      md.position.set(0, 0, o.p.z - o.g.position.z); md.rotation.y = o.p.k === 'bed' || o.p.k === 'gurney' || o.p.k === 'optable' || o.p.k === 'tub' ? 0 : (o.p.rot || 0);
      o.g.add(md); if (o.g.userData.m) o.g.userData.m.visible = false; if (o.g.userData.shadow) o.g.userData.shadow.visible = false;
      this.modeller.push({ grp: md, o });
    } else if (o.g.userData.m) { this.skyggePlate(o.g.userData.m); if (o.g.userData.shadow) o.g.userData.shadow.visible = false; }
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
    if ((this.nyT = (this.nyT || 0) - dt) <= 0) { this.nyT = .5; this.lysLag(); for (const o of G.props) if (o.g && !o.d3) { o.d3 = true; if (!this.modeller.some(md => md.o === o)) this.moble(o); } }
    for (const o of G.props) { if (!o.U || !o.g || !o.g.visible) continue; if (!o.U.tint0) o.U.tint0 = o.U.uTint.value.clone(); const c = this.lysVed(o.x, o.z, 1); o.U.uTint.value.copy(o.U.tint0).multiply(c); }
  }
};
