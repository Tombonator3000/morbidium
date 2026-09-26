/* ============================================================
   ROM I 3D  -  bare rommene, gulvet og effektene er 3D. Figurene og
   tingene er de samme 2D-tegningene som ellers, men de lyses av lampene og
   kaster ekte skygge etter tegningen. Mørk natt, varme punktlys fra lamper
   og stearinlys, måneskinn gjennom vinduene, lister og pilastre som stikker
   ut av veggene, relieff i gulvflisene, støv i lyset og glød.
   Standard fra 25.9. Slås av i innstillingene (Bilde) eller med #2d, og
   enkel grafikk slår det alltid av. Alt legges oppå den vanlige etasjen og
   kan tas bort igjen uten å bygge etasjen på nytt.
   Kvalitet: høy, middels eller lav, valgt i innstillingene eller automatisk.
   Automatisk starter på høy (middels på berøringsskjerm) og går ned et trinn
   når bildefrekvensen holder seg lav, til slutt slås 3D av.
   ============================================================ */
const D3 = {
  on: false, bygd: false, ting: [], byttet: [], egne: [], gjemt: [], pool: [], dukker: new Set(), t: 0,
  BUMP: .7,
  NIVA: {
    hoy: { navn: 'høy', skygge: 2048, lys: 8, glod: true, stov: 192, straaler: true, taake: true, tilt: .7, kant: true, dpr: 2 },
    middels: { navn: 'middels', skygge: 1024, lys: 6, glod: true, stov: 96, straaler: true, taake: true, tilt: .45, kant: true, dpr: 1.5 },
    lav: { navn: 'lav', skygge: 512, lys: 4, glod: false, stov: 0, straaler: false, taake: false, tilt: 0, kant: false, dpr: 1 }
  }, // tilt: hvor uskarpt det blir over og under pasienten (04_render.js), også på telefon (middels)
  /* valgt nivå: fast i innstillingene (1 lav, 2 middels, 3 høy) eller automatisk (0) */
  kval() { const s = (G.meta && G.meta.settings) || {}, fast = ['', 'lav', 'middels', 'hoy'][s.kvalitet | 0]; return fast || (this.NIVA[s.kvAuto] ? s.kvAuto : R.coarse ? 'middels' : 'hoy'); },
  /* «Lys og skygge» av (R.lightsOn) gir et jevnt opplyst rom: ingen punktlys, skygger, lysstråler eller kantlys.
     Telefoner og TV får høyst 1024 i skyggekartet, også på høy: 2048 med dybdebuffer tar rundt 24 MB mer grafikkminne, og telefoner har mistet WebGL av mindre */
  Q() { let q = this.NIVA[this.kval()] || this.NIVA.hoy; if ((R.coarse || R.tv) && q.skygge > 1024) q = Object.assign({}, q, { skygge: 1024 }); return R.lightsOn ? q : Object.assign({}, q, { lys: 0, skygge: 0, straaler: false, kant: false, flat: true }); },
  /* oppløsningen følger nivået når 3D er på; uten 3D brukes det skjermen tåler */
  dpr() { const k = this.on ? Math.min(R.dprMax || 1, this.Q().dpr) : (R.dprMax || 1); if (Math.abs(k - R.dpr) > .01) { R.dpr = k; R.resize(); } },
  /* kalles fra applySettings: nytt nivå bygger 3D-laget på nytt */
  nokkel() { return this.kval() + (R.lightsOn ? '' : '-flat') + (R.coarse || R.tv ? '-mob' : ''); },
  kvalitet() { const k = this.nokkel(); if (k === this.kSist) return; this.kSist = k; if (this.on) { this.dpr(); this.onFloor(); } },
  /* automatisk kvalitet: måler bildefrekvensen i spill, to sekunder om gangen. To lave målinger på rad gir et trinn ned.
     Hopper over fanebytter og automatiske testnettlesere, som bare har programvaregrafikk. */
  maal(dt) {
    const s = G.meta && G.meta.settings; if (!this.on || !this.bygd || !s || (s.kvalitet | 0) || (navigator.webdriver && !this.tvingMaal)) return;
    if (dt > .25) { this.mT = this.mN = 0; return; }
    this.mT = (this.mT || 0) + dt; this.mN = (this.mN || 0) + 1; if (this.mT < 2) return;
    const fps = this.mN / this.mT, niva = this.kval(); this.mT = this.mN = 0;
    this.lave = fps < { hoy: 40, middels: 30, lav: 22 }[niva] ? (this.lave || 0) + 1 : 0;
    if (this.lave >= 2) { this.lave = 0; this.nedgrader(niva, fps); }
  },
  nedgrader(niva, fps) {
    const s = G.meta.settings, neste = { hoy: 'middels', middels: 'lav' }[niva || this.kval()], f = fps ? ' (' + Math.round(fps) + ' bilder i sekundet)' : '';
    if (neste) { s.kvAuto = neste; toast('Grafikken er justert', 'Kvaliteten er satt til ' + this.NIVA[neste].navn + f); }
    else { s.d3 = false; toast('3D er slått av', 'Bildet hakket også på lav kvalitet' + f + '. Det kan slås på igjen under Bilde.'); }
    saveMeta(); applySettings(); return neste || 'av';
  },
  gradient() {
    if (this.grad) return this.grad;
    const d = new Uint8Array([60, 60, 60, 255, 118, 118, 118, 255, 178, 178, 178, 255, 222, 222, 222, 255]);
    const t = new THREE.DataTexture(d, 4, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true;
    return this.grad = t;
  },
  toon(o) { const m = new THREE.MeshToonMaterial(Object.assign({ gradientMap: this.gradient() }, o)); return m; },
  sett(on) {
    on = !!on && !R.safe; if (on === this.on) return; this.on = on; this.kSist = this.nokkel();
    R.renderer.shadowMap.enabled = true; R.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.dpr(); if (on) this.onFloor(); else this.riv();
  },
  /* kalles når en etasje (eller tittelen) er ferdig bygd */
  onFloor() { this.riv(); if (!this.on || !R.level || !G.F) return; try { this.bygg(); } catch (e) { console.warn('3D-prøven feilet', e); this.riv(); } },
  bygg() {
    const sc = R.scene, F = G.F, th = G.th || THEMES[1];
    // himmel og måne
    const Q = this.Q(); this.q = Q;
    const amb = new THREE.AmbientLight(new THREE.Color(th.fog || '#1a1622').lerp(new THREE.Color('#3a3450'), .6), Q.flat ? .95 : .32);
    const hemi = new THREE.HemisphereLight('#8a90c8', '#2a1a14', Q.flat ? .45 : .16);
    const mane = new THREE.DirectionalLight('#9aaee8', .42); mane.castShadow = Q.skygge > 0;
    if (Q.skygge) mane.shadow.mapSize.set(Q.skygge, Q.skygge); const sc2 = mane.shadow.camera; sc2.left = -16; sc2.right = 16; sc2.top = 16; sc2.bottom = -16; sc2.near = 1; sc2.far = 60; mane.shadow.bias = -.0015; mane.shadow.normalBias = .02;
    // skyggekameraet følger kameraet, men bare i hele ruter av skyggekartet (se tick), ellers kryper kantene på alle faste skygger
    // når kameraet glir. Aksene er de samme som lookAt gir skyggekameraet: z mot månen, x vannrett, y oppover i kartet
    this.maneB = null; if (Q.skygge) { const off = new THREE.Vector3(-7, 16, 9), z = off.clone().normalize(), x = new THREE.Vector3(0, 1, 0).cross(z).normalize(); this.maneB = { off, x, y: z.clone().cross(x), z, texel: (sc2.right - sc2.left) / Q.skygge, t: new THREE.Vector3() }; }
    if (F.ute) { mane.intensity = .78; mane.color.set('#a8bce8'); } // ute lyser månen sterkere
    this.maneI = mane.intensity; // lynet (38_effekter.js) løfter månelyset et øyeblikk, så alt kaster skarp skygge
    sc.add(amb, hemi, mane, mane.target); this.mane = mane; this.ting.push(amb, hemi, mane, mane.target);
    this.pool = []; this.nyPool = true; for (let i = 0; i < Q.lys; i++) { const l = new THREE.PointLight('#ffd89a', 0, 6, 2); l.position.set(0, -50, 0); sc.add(l); this.pool.push(l); this.ting.push(l); } // i en ny etasje tennes lysene med en gang (fordel)
    // nivået: materialene byttes til tegneseriebelyste varianter
    const bytt = (mesh, ny) => { this.byttet.push([mesh, mesh.material]); mesh.material = ny; };
    const PM = Paint.mesh || {};
    const vegger = PM.vegger && PM.vegger.length ? PM.vegger : PM.vegg ? [PM.vegg] : [];
    for (const m of [PM.gulv, PM.topp, PM.bakke, ...vegger]) if (m && !m.geometry.attributes.normal) m.geometry.computeVertexNormals(); // den malte stilen trenger ikke normaler, lys gjør det
    if (PM.gulv) { bytt(PM.gulv, this.toon({ map: PM.gulv.material.map, bumpMap: PM.gulv.material.map, bumpScale: this.BUMP, vertexColors: true })); PM.gulv.receiveShadow = true; }
    if (PM.topp) { bytt(PM.topp, this.toon({ vertexColors: true, side: THREE.DoubleSide })); PM.topp.castShadow = true; }
    // én mesh per veggstil (17_romtyper.js); gjerder og ruiner er utklipp og kaster ikke skygge som en mur
    for (const v of vegger) { const b = v.material; bytt(v, this.toon({ map: b.map, side: THREE.DoubleSide, transparent: b.transparent, alphaTest: b.alphaTest, depthWrite: b.depthWrite })); v.castShadow = !b.transparent; v.receiveShadow = true; }
    if (PM.bakke) { bytt(PM.bakke, this.toon({ map: PM.bakke.material.map, color: PM.bakke.material.color })); PM.bakke.receiveShadow = true; }
    this.lysLag();
    this.lamper = []; this.tidU = this.tidU || { value: 0 };
    this.vegglamper(F, th); this.arkitektur(F, th); if (Q.stov) this.stov(Q.stov); if (Q.taake) this.taake(F, th);
    for (const o of G.props) { o.d3 = true; this.moble(o); }
    R.post.uniforms.uLights.value = 0; R.renderer.shadowMap.needsUpdate = true;
    this.bygd = true; this.t = 0;
  },
  riv() {
    // lysene må også kastes: R.remove kobler bare løs, og skyggekartet til månen (1024 x 1024 på mobil, med dybdebuffer)
    // ble liggende i grafikkminnet for hver etasje. Det var nok til at mobilene mistet WebGL etter noen etasjer.
    for (const o of this.ting) { R.remove(o); if (o.isLight && o.dispose) o.dispose(); } this.ting = []; this.pool = [];
    for (const [m, mat] of this.byttet) { if (m.material !== mat) m.material.dispose(); m.material = mat; m.castShadow = m.receiveShadow = false; } this.byttet = [];
    for (const s of this.gjemt) s.visible = true; this.gjemt = []; this.stovP = null;
    for (const o of this.egne) o.dispose(); this.egne = [];
    const utenKant = U => { if (U && U.uRimCol) U.uRimCol.value.setRGB(0, 0, 0); };
    // skyggeflekkene får full styrke igjen i 2D, der de er den eneste skyggen figurene har
    for (const d of this.dukker) { if (d.U && d.U.tint0) d.U.uTint.value.copy(d.U.tint0); utenKant(d.U); if (d.shadow) { d.shadowA = 1; Doll.bakke(d); } } this.dukker.clear();
    if (G.props) for (const o of G.props) { o.d3 = false; if (o.U && o.U.tint0) o.U.uTint.value.copy(o.U.tint0); utenKant(o.U); }
    this.lamper = []; this.morkeT = 0; this.mf = 1; this.taakeLys = null;
    if (R.post) R.post.uniforms.uLights.value = R.lightsOn ? 1 : 0;
    if (R.renderer) R.renderer.shadowMap.autoUpdate = true;
    this.bygd = false;
  },
  /* veggstiler: lamper henger bare på innevegger, og lister og pilastre bare på pussede vegger */
  inneVegg(i) { const st = Paint.wallS && Paint.wallS[i]; return !st || !{ hekk: 1, gjerde: 1, steinmur: 1, skog: 1, ruin: 1, glass: 1 }[st]; },
  listeVegg(i) { const st = Paint.wallS && Paint.wallS[i]; return !st || !!{ panel: 1, tapet: 1, paviljong: 1 }[st]; },
  /* vanlige materialer i nivået (dekaler, plakater, dører) blir lyssatt, ellers lyser de i mørket. Toon som gulvet, ikke Lambert:
     Lambert ganger alt lyset med måneskyggen, så en flekk i skyggen av en vegg mistet lykta og lampene også og ble en mørk flekk */
  lysLag() {
    if (!R.level) return;
    for (const c of R.level.children) {
      if (c.userData.d3 || !c.isMesh || !c.material || !c.material.isMeshBasicMaterial || c.material.blending === THREE.AdditiveBlending) continue;
      const b = c.material; c.userData.d3 = true;
      // blod og andre våte flekker blir blanke og fanger lampene
      const ny = c.userData.vaat ? new THREE.MeshPhongMaterial({ map: b.map, color: b.color.clone().multiplyScalar(1.45), emissive: new THREE.Color('#1a0808'), transparent: b.transparent, opacity: b.opacity, depthWrite: b.depthWrite, side: b.side, shininess: 70, specular: new THREE.Color('#8a6060') })
        : this.toon({ map: b.map, color: b.color, transparent: b.transparent, opacity: b.opacity, depthWrite: b.depthWrite, side: b.side, vertexColors: b.vertexColors });
      // blodet lyser litt av seg selv, som gulvets laveste tegneserietrinn, ellers blir det svart i mørke hjørner
      if (c.userData.vaat) ny.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\n\ttotalEmissiveRadiance += diffuseColor.rgb * 0.34;'); };
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
        if (!isF(x, z) || isF(x, z - 1) || !(wh[(z - 1) * F.W + x] > 2) || !this.inneVegg((z - 1) * F.W + x) || (Paint.opptatt && Paint.opptatt.has(x + ',' + z))) continue;
        const g = new THREE.Group(); g.position.set(x + .5, 0, z + .03); R.level.add(g); this.ting.push(g);
        if (n % 2 === 0) {
          // vegglampe: brakett, skjerm og pære som gløder
          const b = new THREE.Mesh(R.geo('d3brak', () => new THREE.BoxGeometry(.08, .08, .3)), messing); b.position.set(0, 1.55, .15); g.add(b);
          const sk = new THREE.Mesh(R.geo('d3skj', () => new THREE.ConeGeometry(.2, .22, 8, 1, true)), this.toon({ color: '#c8a060', side: THREE.DoubleSide })); sk.position.set(0, 1.62, .3); g.add(sk);
          const pm = glod.clone(); this.egne.push(pm);
          const p = new THREE.Mesh(R.geo('d3pare', () => new THREE.SphereGeometry(.08, 8, 6)), pm); p.position.set(0, 1.5, .3); g.add(p);
          const lp = R.light(x + .5, z + 1.2, 3.2, th.pool || '#ffd89a', .45, R.levelL); lp.userData.y = 1.5; this.ting.push(lp);
          // en svak lyskjegle fra skjermen ned mot gulvet
          let kj = null;
          if (this.q.straaler) { kj = new THREE.Mesh(this.kjegleGeo(), this.straaleMat(th.pool || '#ffd89a', .22)); kj.position.set(0, 0, .3); kj.renderOrder = 5; g.add(kj); this.egne.push(kj.material); }
          // noen lamper flimrer, flere jo lenger ned i bygget
          this.lamper.push({ lp, pm, p, kj, base: .45, farge: new THREE.Color('#ffd89a'), flimrer: Math.random() < .12 + dybdeStyrke(G.depth) * .07, t: Math.random() * 10, burst: 0 });
        } else if ((Paint.wallS && Paint.wallS[(z - 1) * F.W + x]) !== 'forheng') { // ingen vinduer i de røde forhengene
          // vindu: ramme, glass i månelys og en lysstripe ned på gulvet
          const fr = new THREE.Mesh(R.geo('d3vr', () => new THREE.BoxGeometry(.9, 1.0, .06)), ramme); fr.position.set(0, 1.45, 0); g.add(fr);
          for (const [dx, dy] of [[-.2, .22], [.2, .22], [-.2, -.2], [.2, -.2]]) { const q = new THREE.Mesh(R.geo('d3vg', () => new THREE.PlaneGeometry(.34, .36)), glass); q.position.set(dx, 1.45 + dy, .035); g.add(q); }
          if (this.q.straaler) {
            // lysstråle fra vinduet ned på gulvet, med sprossen som en mørk stripe og støv som driver i lyset
            const sj = new THREE.Mesh(this.straaleGeo(), this.straaleMat('#8a9ae0', .34, true)); sj.renderOrder = 5; g.add(sj); this.egne.push(sj.material);
            // og vinduet tegnet i lys på gulvet der strålen treffer
            const fl = new THREE.Mesh(R.plane1(), new THREE.MeshBasicMaterial({ map: this.vindusLys(), color: '#6a7ac0', transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false }));
            fl.rotation.x = -Math.PI / 2; fl.position.set(.05, .018, 2.05); fl.scale.set(1.25, 1.2, 1); fl.renderOrder = 2; g.add(fl); this.egne.push(fl.material);
          } else {
            const sj = new THREE.Mesh(R.geo('d3sj', () => { const s = new THREE.PlaneGeometry(1, 1); s.translate(0, .5, 0); return s; }), new THREE.MeshBasicMaterial({ map: this.stripeTex(), color: '#7a8ad0', transparent: true, opacity: .22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
            sj.position.set(0, 0, 0); sj.rotation.x = -1.05; sj.scale.set(1.1, 2.6, 1); g.add(sj);
          }
          const lv = R.light(x + .5, z + 1.6, 2.6, '#8a9ae0', .4, R.levelL); lv.userData.y = 1.9; this.ting.push(lv);
        }
        n++;
      }
    }
  },
  /* ---------- lys i lufta: stråler fra vinduene og kjegler under lampene ---------- */
  straaleGeo() {
    return R.geo('d3straale', () => {
      // fra vinduet (øverst, v = 1) på skrå ned til gulvet inne i rommet (v = 0)
      const g = new THREE.BufferGeometry(), P = [-.42, 1.92, .04, .42, 1.92, .04, .62, .01, 2.35, -.62, .01, 2.35], U = [0, 1, 1, 1, 1, 0, 0, 0];
      g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.setIndex([0, 3, 1, 1, 3, 2]); return g;
    });
  },
  kjegleGeo() {
    return R.geo('d3kjegle', () => {
      const g = new THREE.BufferGeometry(), P = [-.16, 1.5, 0, .16, 1.5, 0, .75, .01, .95, -.75, .01, .95], U = [0, 1, 1, 1, 1, 0, 0, 0];
      g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.setIndex([0, 3, 1, 1, 3, 2]); return g;
    });
  },
  straaleMat(farge, styrke, sprosse) {
    return new THREE.ShaderMaterial({
      uniforms: { uTid: this.tidU, uFarge: { value: new THREE.Color(farge) }, uStyrke: { value: styrke }, uSprosse: { value: sprosse ? 1 : 0 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform float uTid, uStyrke, uSprosse; uniform vec3 uFarge; varying vec2 vUv; ${SHADER_NOISE}
        void main(){
          float side = smoothstep(0.0, 0.22, vUv.x) * smoothstep(1.0, 0.78, vUv.x);
          float lengde = smoothstep(0.0, 0.25, vUv.y) * (0.45 + 0.55 * vUv.y) * smoothstep(1.0, 0.94, vUv.y);
          float sprosse = 1.0 - uSprosse * 0.6 * (1.0 - smoothstep(0.02, 0.06, abs(vUv.x - 0.5)));
          float stov = 0.7 + 0.3 * vn(vec2(vUv.x * 7.0 + uTid * 0.07, vUv.y * 4.0 - uTid * 0.18));
          gl_FragColor = vec4(uFarge * side * lengde * sprosse * stov * uStyrke, 1.0);
        }`,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
    });
  },
  /* fire ruter lys med et mørkt kors, myke kanter: vinduet slik det faller på gulvet */
  vindusLys() {
    return this._vl || (this._vl = R.canvasTex(128, 128, g => {
      g.filter = 'blur(5px)'; g.fillStyle = '#ffffff';
      for (const [x, y] of [[18, 16], [68, 16], [18, 66], [68, 66]]) { g.beginPath(); g.moveTo(x + 6, y); g.lineTo(x + 44, y); g.lineTo(x + 40, y + 44); g.lineTo(x + 2, y + 44); g.closePath(); g.fill(); }
      g.filter = 'none';
    }));
  },
  /* ---------- bakketåke: to lag støy over gulvet, bare der det er gulv ---------- */
  taake(F, th) {
    const cfg = (F.taake || { 1: [.3, '#a8b8d0'], 2: [.1, '#e8dcc0'], 3: [.26, '#d4ece6'], 4: [.14, '#dccfb4'], 5: [.42, '#7a8ab8'], 6: [.34, '#9a7ab8'] }[G.depth] || [.12, '#dddddd']).slice(); // F.taake: drømmene har sin egen
    if (F.vaer === 'taake') cfg[0] += .22;
    const data = new Uint8Array(F.W * F.H); for (let i = 0; i < data.length; i++) data[i] = F.tiles[i] > 0 ? 255 : 0;
    const mask = new THREE.DataTexture(data, F.W, F.H, THREE.LuminanceFormat); mask.magFilter = mask.minFilter = THREE.LinearFilter; mask.generateMipmaps = false; mask.needsUpdate = true; this.egne.push(mask);
    // punktlysene lyser opp tåka rundt seg (settes hvert bilde i tick): xz og radius i p, farge ganget med styrke i f
    const TL = this.taakeLys = { p: { value: [0, 1, 2, 3, 4, 5, 6, 7].map(() => new THREE.Vector4()) }, f: { value: [0, 1, 2, 3, 4, 5, 6, 7].map(() => new THREE.Vector3()) } };
    for (const [y, k, fart] of [[.16, 1, 1], [.48, .6, -.7]]) {
      const mat = new THREE.ShaderMaterial({
        uniforms: { uTid: this.tidU, uMask: { value: mask }, uFarge: { value: new THREE.Color(cfg[1]) }, uStyrke: { value: cfg[0] * k }, uSize: { value: new THREE.Vector2(F.W, F.H) }, uFart: { value: fart }, uLysP: TL.p, uLysF: TL.f },
        vertexShader: 'varying vec2 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xz; gl_Position = projectionMatrix * viewMatrix * w; }',
        fragmentShader: `uniform float uTid, uStyrke, uFart; uniform vec3 uFarge; uniform sampler2D uMask; uniform vec2 uSize; uniform vec4 uLysP[8]; uniform vec3 uLysF[8]; varying vec2 vW; ${SHADER_NOISE}
          void main(){
            float m = texture2D(uMask, vW / uSize).r;
            vec2 p = vW * 0.33 + vec2(uTid * 0.05, uTid * 0.021) * uFart;
            float n = vn(p) * 0.55 + vn(p * 2.1 + 5.3) * 0.3 + vn(p * 4.3 - uTid * 0.04) * 0.15;
            // lampene, lykta og bålene lyser gjennom tåka: glorie rundt hver kilde
            vec3 lys = vec3(0.0);
            for (int i = 0; i < 8; i++) { float d = length(vW - uLysP[i].xz); lys += uLysF[i] * pow(max(0.0, 1.0 - d / max(uLysP[i].w, 0.001)), 2.0); }
            float l = min(1.5, dot(lys, vec3(0.333)));
            gl_FragColor = vec4(uFarge * (1.0 - l * 0.25) + lys * 0.85, m * uStyrke * smoothstep(0.32, 0.78, n) * (1.0 + l * 1.4));
          }`,
        transparent: true, depthWrite: false
      });
      const t = new THREE.Mesh(R.plane1(), mat); t.rotation.x = -Math.PI / 2; t.position.set(F.W / 2, y, F.H / 2); t.scale.set(F.W, F.H, 1); t.renderOrder = 10; t.frustumCulled = false;
      R.scene.add(t); this.ting.push(t); this.egne.push(mat);
    }
  },
  /* ---------- mørke: lampene slukner og flimrer tilbake (sjefer, minisjefer, mye Morbidium) ---------- */
  morke(t = 1.2, dyp = .08) { this.morkeT = Math.max(this.morkeT || 0, t); this.morke0 = Math.max(this.morkeT, this.morke0 || 0); this.morkeDyp = dyp; },
  morkeFaktor(dt) {
    if (!(this.morkeT > 0)) return 1;
    this.morkeT -= dt; const p = 1 - this.morkeT / (this.morke0 || 1);
    if (this.morkeT <= 0) { this.morke0 = 0; return 1; }
    // helt mørkt først, så flimrer det tilbake
    return p < .45 ? this.morkeDyp : Math.random() < (p - .45) * 1.8 ? 1 : this.morkeDyp + Math.random() * .25;
  },
  stripeTex() { return this._st || (this._st = R.canvasTex(32, 128, g => { const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.3, 'rgba(255,255,255,.8)'); gr.addColorStop(1, 'rgba(255,255,255,1)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 128); })); },
  /* ---------- rommets egen dybde ---------- */
  /* fotlist, brystlist og taklist langs de høye veggene, og pilastre mellom lampene og vinduene.
     Listene ligger der veggtegningen allerede har dem, så de bare løfter seg ut av veggen. */
  arkitektur(F, th) {
    const W = F.W, wh = Paint.wallH || [], isF = (x, z) => x >= 0 && z >= 0 && x < W && z < F.H && F.tiles[z * W + x] > 0;
    const opp = (x, z) => (Paint.opptatt && Paint.opptatt.get(x + ',' + z)) || '';
    const front = []; for (let z = 0; z < F.H; z++) for (let x = 0; x < W; x++) if (wh[z * W + x] > 2 && this.listeVegg(z * W + x) && isF(x, z + 1)) front.push([x, z + 1, opp(x, z + 1)]);
    const piler = [];
    for (const r of F.rooms) {
      if (r.role === 'secret') continue;
      for (let x = r.x + 3; x < r.x + r.w - 1; x += 3) if (wh[(r.z - 1) * W + x - 1] > 2 && wh[(r.z - 1) * W + x] > 2 && this.listeVegg((r.z - 1) * W + x) && isF(x - 1, r.z) && isF(x, r.z) && !opp(x - 1, r.z) && !opp(x, r.z)) piler.push([x, r.z]);
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
  stov(N = 192) {
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), off = new Float32Array(N * 3), fase = new Float32Array(N);
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
    if (!this.q || !this.q.skygge || !o.g || !o.p || o.g.userData.flat || !o.g.userData.m) return; // uten skyggekart (lys og skygge av) beholder tingene den bakte skyggen
    this.skyggePlate(o.g.userData.m); if (o.g.userData.shadow) { o.g.userData.shadow.visible = false; this.gjemt.push(o.g.userData.shadow); }
  },
  /* tegnede plater kaster skygge etter tegningen (alfa), ikke som firkanter */
  skyggePlate(m) {
    if (!m || !m.material || !m.material.uniforms || !m.material.uniforms.map || m.customDepthMaterial) return;
    m.castShadow = true; m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: m.material.uniforms.map.value, alphaTest: .5, side: THREE.DoubleSide });
  },
  /* dukkene kaster skygge etter tegningen: alle tegnede deler og strekbåndene. Et våpen som plukkes opp, tillegg og pynt som kommer til
     senere, får skyggeplate når delene endrer seg (ny liste i d.meshes, eller flere eller færre deler). Skyggeflekken under blir svakere
     når månen kaster skygge også (shadowA, se Doll.bakke). Uten skyggekart (lys og skygge av) er flekken den eneste skyggen og beholder full styrke */
  dukke(d) {
    if (!d || !d.plane) return; const ny = !this.dukker.has(d), sk = !!(this.q && this.q.skygge), n = (d.meshes ? d.meshes.length : 0) * 256 + d.plane.children.length;
    if (ny) { this.dukker.add(d); if (d.U && !d.U.tint0) d.U.tint0 = d.U.uTint.value.clone(); if (d.shadow) { d.shadowA = sk ? .45 : 1; Doll.bakke(d); } }
    if (!ny && d.d3m === d.meshes && d.d3n === n) return;
    d.d3m = d.meshes; d.d3n = n; d.d3vis = null; const K = d.d3k = [], baand = [d.back && d.back.mesh, d.front && d.front.mesh]; if (!sk) return;
    d.plane.traverse(o => { if (!o.isMesh) return; this.skyggePlate(o); if (o.customDepthMaterial || baand.includes(o)) K.push(o); });
  },
  /* halvt oppløste og gjennomsiktige figurer kaster ikke måneskygge (dybdematerialet vet ikke om oppløsningen), så de døde ikke har full skygge
     til de blir borte. Grensen .6 holder den gjennomsiktige mesteren (.08 til .52) ute hele tiden i stedet for at skyggen blinker */
  dukkeVis(d) { const vis = d.U.uDissolve.value < .5 && d.U.uAlpha.value > .6; if (vis === d.d3vis) return; d.d3vis = vis; for (const m of d.d3k) m.castShadow = vis; },
  /* ---------- hvert bilde ---------- */
  /* punktlysene deles ut uten at lyset hopper av og på rundt pasienten. Lykta har det første for seg selv. Resten går til de nærmeste
     kildene, men en kilde som har et punktlys, beholder det så lenge den er blant de N+2 nærmeste og ingen kilde uten lys er 1,5 nærmere
     enn den lengst unna. Den som mister lyset, blekner bort på 0,2 sekunder, og først da tennes den neste, på 0,25. Et lysglimt (blink) får
     lyset med en gang, fra den som er lengst unna, men bare ett om gangen. Svarte kilder (en lampe som har falt ned) får aldri punktlys, og
     en som blir svart, beholder sitt i to sekunder, så lampene har lyset sitt igjen når mørket etter sjefene er over. Kilder som er borte,
     slukner med en gang. FYLL_SIST setter romlyset midt i hvert rom (fyll) sist i køen, så lampene får lysene i stedet */
  FYLL_SIST: false, INN: .25, UT: .2,
  fordel(dt, cx, cz, P) {
    const pool = this.pool, S = pool.map(l => l.userData), LY = P && P.lantern && P.lantern.parent ? P.lantern : null, f0 = LY ? 1 : 0, N = pool.length - f0, ny = this.nyPool;
    this.nyPool = false; if (!pool.length) return;
    if (LY) Object.assign(S[0], { kilde: LY, w: 1, vil: true, lykt: true, svart: 0 });
    const eie = new Map(); for (let i = f0; i < pool.length; i++) { S[i].lykt = false; if (S[i].kilde) eie.set(S[i].kilde, S[i]); }
    const d2 = m => (m.position.x - cx) ** 2 + (m.position.z - cz) ** 2 + (this.FYLL_SIST && m.userData.fyll ? 1e4 : 0), blink = m => !!m.userData.blink;
    const C = []; for (const m of this.kilder()) { if (m === LY) continue; const s = eie.get(m), c = m.material.color; if (s ? s.svart > 2 : c.r + c.g + c.b < .05) continue; m.userData.d2 = d2(m); C.push(m); }
    C.sort((a, b) => a.userData.d2 - b.userData.d2);
    // bare ett lysglimt i køen: det som har lys, ellers det nærmeste
    let harB = C.some(m => blink(m) && eie.has(m)); const K = C.filter(m => !blink(m) || eie.has(m) || (!harB && (harB = true)));
    K.forEach((m, i) => { m.userData.rang = i; });
    // de som har lys: kilder som er borte, slukner, og de som har kommet for langt unna, blekner
    let verst = null;
    for (let i = f0; i < pool.length; i++) { const s = S[i], m = s.kilde; if (!m) continue; if (K[m.userData.rang] !== m) { s.kilde = null; s.w = 0; continue; } s.vil = m.userData.rang < N + 2; if (s.vil && !blink(m) && (!verst || m.userData.d2 > verst.kilde.userData.d2)) verst = s; }
    const venter = K.filter((m, i) => i < N && !eie.has(m)), vl = venter.find(m => !blink(m)), vb = venter.find(blink);
    if (verst && vl && Math.sqrt(vl.userData.d2) + 1.5 < Math.sqrt(verst.kilde.userData.d2)) verst.vil = false;
    // lysglimtet tar en ledig plass, ellers den som er på vei ut, ellers den lengst unna, og tennes med en gang
    if (vb) { let s = null, sd = -1; for (let i = f0; i < pool.length; i++) { const t = S[i], d = !t.kilde ? 1e9 : (t.vil ? 0 : 1e8) + t.kilde.userData.d2; if (!(t.kilde && blink(t.kilde)) && d > sd) { sd = d; s = t; } }
      if (s) { Object.assign(s, { kilde: vb, w: 1, vil: true, svart: 0 }); venter.splice(venter.indexOf(vb), 1); } }
    for (let i = f0; i < pool.length; i++) {
      const s = S[i];
      if (s.kilde) { s.w = s.vil ? Math.min(1, s.w + dt / this.INN) : Math.max(0, s.w - dt / this.UT); if (!s.vil && s.w <= 0) s.kilde = null; }
      if (!s.kilde) { const m = venter.find(m => !blink(m)); if (m) { venter.splice(venter.indexOf(m), 1); Object.assign(s, { kilde: m, w: ny ? 1 : 0, vil: true, svart: 0 }); } else s.w = 0; }
      if (s.kilde) { const c = s.kilde.material.color; s.svart = c.r + c.g + c.b < .05 ? s.svart + dt : 0; }
    }
  },
  kilder() { return (R.kilder || []).filter(m => m.parent && (m.parent === R.lscene || m.parent === R.levelL) && (m.parent !== R.levelL || R.levelL.parent)); },
  /* lyset ved et punkt: en farge å gange tegningen med, og (valgfritt i K) den sterkeste lampen, som gir kantlys */
  lysVed(x, z, y = .9, K) {
    const c = this._c || (this._c = new THREE.Color());
    if (this.q && this.q.flat) { c.setRGB(.95, .93, .9); if (K) { K.l = null; K.f = 0; } return c; }
    c.setRGB(.26, .25, .34); let best = 0, bl = null;
    for (const l of this.pool) { if (l.intensity <= 0) continue; const dx = l.position.x - x, dz = l.position.z - z, dy = l.position.y - y, d = Math.sqrt(dx * dx + dz * dz + dy * dy), k = Math.max(0, 1 - d / l.distance); if (k > 0) { const f = k * k * l.intensity * .55; c.r += l.color.r * f; c.g += l.color.g * f; c.b += l.color.b * f; if (f > best) { best = f; bl = l; } } }
    c.r = Math.min(1.5, c.r); c.g = Math.min(1.5, c.g); c.b = Math.min(1.5, c.b); if (K) { K.l = bl; K.f = best; } return c;
  },
  /* kantlys: retningen til lampen slik den ser ut på skjermen, i tegningens egne koordinater (speilet når figuren snur) */
  settKant(U, K, x, y, z, flip) {
    if (!U || !U.uRimCol) return;
    if (!this.q || !this.q.kant || !K.l || K.f < .035) { U.uRimCol.value.setRGB(0, 0, 0); return; }
    const l = K.l, dx = l.position.x - x, dy = l.position.y - y, dz = l.position.z - z, sx = dx * flip, sy = dy * COSP - dz * SINP, n = Math.hypot(sx, sy) || 1;
    U.uRimDir.value.set(sx / n, sy / n); U.uRimCol.value.copy(l.color).multiplyScalar(Math.min(.8, K.f * 1.5));
  },
  tick(dt) {
    if (!this.on || !this.bygd || !G.F) return;
    this.t += dt; if (this.tidU) this.tidU.value += dt; const cx = R.camT.x, cz = R.camT.z, P = G.player, B = this.maneB;
    // månen: samme retning og lengde som før, men midtpunktet rundes av til en hel rute i skyggekartet på tvers av lyset,
    // og skyves langs lyset ned på gulvet igjen. Da ligger rutene fast i verden, og kantene står stille når kameraet glir
    if (B) { const t = B.t.set(cx, 0, cz), s = B.texel, u = Math.round(t.dot(B.x) / s) * s, v = Math.round(t.dot(B.y) / s) * s; t.copy(B.x).multiplyScalar(u).addScaledVector(B.y, v); t.addScaledVector(B.z, -t.y / B.z.y); this.mane.target.position.copy(t); this.mane.position.copy(t).add(B.off); }
    else { this.mane.position.set(cx - 7, 16, cz + 9); this.mane.target.position.set(cx, 0, cz); }
    this.mane.target.updateMatrixWorld();
    // skyggekartet tegnes bare når noe kan flytte seg (spill og tittel), og én gang til hver gang tilstanden skifter.
    // I pausen, panelene og journalen står det stille, så telefonen slipper skyggepasset
    const SM = R.renderer.shadowMap; SM.autoUpdate = G.state === 'play' || G.state === 'title'; if (G.state !== this.stSist) { this.stSist = G.state; SM.needsUpdate = true; }
    this.mane.intensity = (this.maneI || .42) + (R.flashOn ? R.fx.lyn || 0 : 0) * 2.8;
    // mye Morbidium: av og til slukner lyset
    if (P && P.alive && P.morb >= 70 && R.distortOn && G.state === 'play') { this.morkeR = (this.morkeR ?? rnd(8, 20)) - dt; if (this.morkeR <= 0) { this.morkeR = rnd(15, 35); this.morke(rnd(.7, 1.3), .12); } }
    const mf = this.mf = this.morkeFaktor(dt); // gloriene (38_effekter.js) slukner med
    // vegglampene: noen flimrer i korte støt, og alle slukner i mørket
    for (const L of this.lamper || []) {
      let f = 1;
      if (L.flimrer) { L.t -= dt; if (L.burst > 0) { L.burst -= dt; f = Math.random() < .55 ? .12 + Math.random() * .3 : 1; if (L.burst <= 0) L.t = rnd(2, 9); } else if (L.t <= 0) L.burst = rnd(.25, 1.1); }
      f *= mf; R.setLight(L.lp, L.base * f); L.pm.color.copy(L.farge).multiplyScalar(.2 + .8 * f); if (L.kj) L.kj.material.uniforms.uStyrke.value = .22 * f;
    }
    // punktlysene går til spillerens lykt og de nærmeste lyskildene, uten at lyset hopper (se fordel), og følger kilden sin
    this.fordel(dt, cx, cz, P);
    for (let i = 0; i < this.pool.length; i++) {
      const l = this.pool[i], s = l.userData, m = s.kilde;
      if (!m) { l.intensity = 0; continue; } // en ny kilde får lyset flyttet til seg mens det er slukket (w 0), så det ikke hopper
      const base = m.userData.col, cur = m.material.color, k = Math.max(cur.r, cur.g, cur.b) / Math.max(.001, Math.max(base.r, base.g, base.b)), lykt = s.lykt;
      l.color.copy(base); l.intensity = k * (lykt ? 1.2 : 1.5) * (lykt ? Math.max(.6, mf) : mf) * s.w; l.distance = m.scale.x * .55 + 1;
      l.position.set(m.position.x, m.userData.y || (lykt ? 1.8 : 1.6), m.position.z - .3);
    }
    // tåka får vite hvor lyset er, så den gløder rundt lampene
    if (this.taakeLys) { const TP = this.taakeLys.p.value, TF = this.taakeLys.f.value; for (let i = 0; i < 8; i++) { const l = this.pool[i]; if (!l || l.intensity <= 0) { TF[i].set(0, 0, 0); continue; } TP[i].set(l.position.x, 0, l.position.z, l.distance * .8); TF[i].set(l.color.r * l.intensity * .5, l.color.g * l.intensity * .5, l.color.b * l.intensity * .5); } }
    // tegnede figurer og plater lyses av de samme lampene, med kantlys fra den sterkeste
    const alle = []; if (P && P.doll) alle.push(P.doll); for (const e of G.enemies || []) if (e.doll) alle.push(e.doll);
    if (G.boss && G.boss.doll) alle.push(G.boss.doll); for (const n of G.npcs || []) if (n.doll) alle.push(n.doll); for (const d of G.titleDolls || []) alle.push(d); for (const d of G.ekstraDukker || []) if (d.root.parent) alle.push(d); // figurer i hendelser og drømmer
    const KL = this._kl || (this._kl = {});
    for (const d of alle) { this.dukke(d); this.dukkeVis(d); const p = d.root.position, hy = .9 + p.y + d.plane.position.y, c = this.lysVed(p.x, p.z, hy, KL); d.U.uTint.value.copy(d.U.tint0).multiply(c); this.settKant(d.U, KL, p.x, hy, p.z, d.flip || 1); } // hy: midt på tegningen, også når den svever
    if ((this.nyT = (this.nyT || 0) - dt) <= 0) { this.nyT = .5; this.lysLag(); for (const o of G.props) if (o.g && !o.d3) { o.d3 = true; this.moble(o); } }
    this.stovTick(dt);
    for (const o of G.props) { if (!o.U || !o.g || !o.g.visible) continue; if (!o.U.tint0) o.U.tint0 = o.U.uTint.value.clone(); const c = this.lysVed(o.x, o.z, 1, KL); o.U.uTint.value.copy(o.U.tint0).multiply(c); this.settKant(o.U, KL, o.x, .8, o.z, o.g.userData.m && o.g.userData.m.scale.x < 0 ? -1 : 1); }
  }
};
