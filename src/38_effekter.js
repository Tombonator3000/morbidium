/* ============================================================
   EFFEKTER  -  flere shadere og partikler som regnes ut på skjermkortet
   - Glød: partikkelskyer der posisjonen er en funksjon av tiden i vertex-
     shaderen, så hundrevis av gnister koster nesten ingenting for prosessoren.
     Gnister og røyk fra bålet, glør og røyk fra vedovnen, damp fra kjeler og
     gryter, sporer fra kjempeplanten, Morbidium som stiger fra lilla pytter,
     og møll som flyr rundt lyktestolpene i parken.
   - Lyn: taggete lysbånd som vender mot kameraet. I regnvær ute slår lynet
     ned med et varsel på bakken først, og det treffer det som står der,
     også deg. Teslaspolen slår buer mot fiender som kommer for nær.
   - Regnringer: små ringer som sprer seg på bakken der det regner.
   - Drømmesløret mellom etasjene, og sjokkbølger og zoomslag på eksplosjoner,
     nytt nivå og sjefer som dør (selve shaderne ligger i 04_render.js).
   - Glorier: et mykt lys rundt lampene, flammene og pærene, og et lite lys
     som følger pasienten, som i et diorama.
   Enkel grafikk slår alt av. Antallet partikler følger kvaliteten i 3D.
   ============================================================ */
const GLOD_VS = `
  uniform float uTid, uFase, uLiv, uStig, uSpre, uVind, uVirvel, uPx, uS0, uS1, uFlim, uBane, uR, uH;
  attribute vec4 aFro; varying float vA; varying float vT;
  void main(){
    float t = fract((uTid + uFase) / uLiv * (0.75 + aFro.w * 0.5) + aFro.x);
    vec3 p;
    if (uBane > 0.5) {
      // møll: flakser i en skjev bane rundt lampen
      float a = (uTid + uFase) * (2.4 + aFro.y * 2.2) + aFro.x * 6.2831;
      float r = uR * (0.55 + aFro.z * 0.6);
      p = vec3(cos(a) * r, uH + sin(a * 2.3 + aFro.w * 5.0) * 0.3, sin(a) * r * 0.55);
      vA = 1.0; t = 0.5;
    } else {
      float a = aFro.y * 6.2831, r = sqrt(aFro.z) * uSpre;
      p = vec3(cos(a) * r, t * uStig * (0.7 + aFro.w * 0.6), sin(a) * r * 0.6);
      p.x += sin(uTid * 1.9 + aFro.w * 17.0) * uVirvel * t + uVind * t * t;
      p.z += cos(uTid * 1.4 + aFro.y * 13.0) * uVirvel * t * 0.5;
      vA = smoothstep(0.0, 0.08, t) * (1.0 - smoothstep(0.55, 1.0, t));
      vA *= 1.0 - uFlim * 0.55 * step(0.5, fract(sin(floor(uTid * 14.0) + aFro.x * 91.0) * 43758.5453));
    }
    vT = t;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position + p, 1.0);
    gl_PointSize = max(1.5, mix(uS0, uS1, t) * uPx);
  }`;
const GLOD_FS = `
  uniform vec3 uF0, uF1; uniform float uAlfa, uStyrke; varying float vA; varying float vT;
  void main(){
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.12, d) * vA * uAlfa * uStyrke;
    if (a < 0.01) discard;
    gl_FragColor = vec4(mix(uF0, uF1, vT), a);
  }`;
/* n: antall på høy kvalitet, liv: sekunder per runde, stig: høyde, spre: radius ved kilden, str: størrelse fra og til (verdensenheter) */
const GLOD_TYPER = {
  gnister: { n: 30, liv: 1.5, stig: 2.4, spre: .32, vind: .25, virvel: .3, str: [.15, .05], farger: ['#ffe07a', '#ff3a0a'], add: 1, flimmer: 1, alfa: 1 },
  glor: { n: 8, liv: 1.1, stig: .9, spre: .18, vind: .1, virvel: .12, str: [.11, .04], farger: ['#ffd070', '#ff4a10'], add: 1, flimmer: 1, alfa: 1 },
  damp: { n: 12, liv: 3.4, stig: 1.6, spre: .2, vind: .35, virvel: .3, str: [.34, 1.05], farger: ['#f2eee6', '#b8b4ac'], add: 0, flimmer: 0, alfa: .32 },
  roy: { n: 14, liv: 4.2, stig: 2.6, spre: .12, vind: .7, virvel: .3, str: [.28, 1.2], farger: ['#6a6660', '#2a2826'], add: 0, flimmer: 0, alfa: .36 },
  sporer: { n: 16, liv: 5, stig: .8, spre: .55, vind: .05, virvel: .45, str: [.1, .07], farger: ['#fff28a', '#c8a020'], add: 1, flimmer: .5, alfa: .9 },
  morb: { n: 10, liv: 2.6, stig: 1.3, spre: .45, vind: 0, virvel: .3, str: [.13, .06], farger: ['#e8b8ff', '#6b2d8c'], add: 1, flimmer: .7, alfa: 1 },
  moll: { n: 5, bane: 1, r: .75, h: 2.7, liv: 1, str: [.09, .09], farger: ['#4a3a2c', '#4a3a2c'], add: 0, flimmer: 0, alfa: .95 },
  kombo: { n: 40, liv: 1.2, stig: 3.2, spre: .7, vind: 0, virvel: .6, str: [.2, .06], farger: ['#fff2c0', '#ff2a10'], add: 1, flimmer: 1, alfa: 1 }
};
const Glod = {
  liste: [], tid: { value: 0 }, px: { value: 100 },
  /* hvor mye av hvert utslipp vi har råd til: null med enkel grafikk, mindre på lav kvalitet og uten 3D */
  kvote() { if (R.safe || R.lowTex) return 0; if (!D3.on) return .6; return { hoy: 1, middels: .65, lav: .35 }[D3.kval()] ?? .6; },
  lag(x, y, z, type, o = {}) {
    const T = GLOD_TYPER[type], k = this.kvote(); if (!T || !k || !R.scene) return null;
    const n = Math.max(2, Math.round((o.n || T.n) * k)), fro = new Float32Array(n * 4);
    for (let i = 0; i < n * 4; i++) fro[i] = Math.random();
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); geo.setAttribute('aFro', new THREE.BufferAttribute(fro, 4));
    const f = o.farger || T.farger, str = o.str || T.str;
    const mat = new THREE.ShaderMaterial({
      uniforms: { uTid: this.tid, uPx: this.px, uFase: { value: Math.random() * 50 }, uLiv: { value: o.liv0 || T.liv }, uStig: { value: o.stig || T.stig || 0 }, uSpre: { value: o.spre || T.spre || 0 },
        uVind: { value: T.vind || 0 }, uVirvel: { value: T.virvel || 0 }, uS0: { value: str[0] }, uS1: { value: str[1] }, uFlim: { value: T.flimmer }, uBane: { value: T.bane || 0 },
        uR: { value: T.r || 0 }, uH: { value: o.h || T.h || 0 }, uF0: { value: new THREE.Color(f[0]) }, uF1: { value: new THREE.Color(f[1]) }, uAlfa: { value: T.alfa }, uStyrke: { value: 1 } },
      vertexShader: GLOD_VS, fragmentShader: GLOD_FS, transparent: true, depthWrite: false, blending: T.add ? THREE.AdditiveBlending : THREE.NormalBlending
    });
    const pts = new THREE.Points(geo, mat); pts.position.set(x, y, z); pts.frustumCulled = false; pts.renderOrder = 6; R.scene.add(pts);
    const E = { pts, geo, mat, type, liv: o.liv || 0, t: 0, eier: o.eier || null }; this.liste.push(E); return E;
  },
  fjern(E) { R.scene.remove(E.pts); E.geo.dispose(); E.mat.dispose(); },
  borte(E) { const e = E.eier; return !!e && (e.alive === false || (e.mesh && !e.mesh.parent) || (e.g && !e.g.parent)); },
  tick(dt) {
    this.tid.value += dt;
    const c = R.camera; if (c) this.px.value = R.renderer.domElement.height / Math.max(.001, c.top - c.bottom);
    for (let i = this.liste.length - 1; i >= 0; i--) {
      const E = this.liste[i]; E.t += dt;
      if (E.liv) E.mat.uniforms.uStyrke.value = clamp((E.liv - E.t) / 1.2, 0, 1);
      if ((E.liv && E.t >= E.liv) || this.borte(E)) { this.fjern(E); this.liste.splice(i, 1); }
    }
  },
  tom() { for (const E of this.liste) this.fjern(E); this.liste = []; }
};
/* hvor på tingene det gløder og ryker: [type, x, høyde i tegningen, z, valg]. Høyden ganges med BILL_Y, som tegningene. */
const GLOD_KILDER = {
  baal: [['gnister', 0, .35, 0], ['roy', 0, 1.35, 0, { n: 10 }]],
  vedovn: [['glor', 0, .5, .05], ['roy', 0, 2.5, 0, { n: 9 }]],
  kjele: [['damp', 0, 2.3, 0], ['glor', 0, .45, .05, { n: 6 }]],
  komfyr: [['damp', .2, 1.05, 0, { n: 8 }]],
  gryte: [['damp', 0, .95, 0, { n: 8 }]],
  candles: [['glor', 0, .45, 0, { n: 3, stig: .6 }]],
  kjempeplante: [['sporer', 0, 1.1, 0]],
  lyktestolpe: [['moll', 0, 0, 0, { h: 2.8 * BILL_Y }]]
};

/* ---------- glorier: et mykt lys rundt lampene, flammene og pærene, og et lite lys ved pasienten ----------
   Ett Points-objekt per etasje. Gloria ganges inn i det som ligger under (bildet blir bildet ganger 1 pluss gloria), i stedet for
   å legges oppå: flammene, lampeglasset og det som står rundt lyser opp og kan ta gløden i 3D, mens blekkstrekene holder seg like
   mørke i forhold til det rundt, så de blir like skarpe. Lagt oppå ble det enten for svakt til å synes eller grå strek.
   Hver glorie følger lysplaten sin (flimring, en lampe som faller, mørket etter sjefene) og står halvannen enhet nærmere kameraet
   enn det som lyser, så den ikke går inn i veggen bak. Bildet er ortografisk, så den står likevel på samme sted på skjermen.
   Størrelsen er i verdensenheter og følger kamerazoomen. I de uskarpe båndene fra tilt-shift blir glorien større og svakere, som et
   lys ute av fokus. Høyst 32, 20 og 10 (høy, middels, og lav og 2D), de nærmeste kameraet. En som faller utenfor, blekner, og den
   neste tennes først når det er plass. Ingen med enkel grafikk, lette teksturer eller uten lys og skygge. Uten 3D er tegningene
   ikke mørklagt av natta, og bildet ganges med lysbufferen etterpå, så gloriene er svakere der. */
const GLORIE_VS = `
  uniform float uPx, uTilt; uniform vec3 uFokus; attribute vec3 aFarge; attribute float aStr; varying vec3 vF;
  void main(){
    vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    float k = 1.0 + smoothstep(uFokus.y, uFokus.z, abs(p.y / p.w * 0.5 + 0.5 - uFokus.x)) * uTilt * 1.5;
    gl_Position = p; gl_PointSize = min(160.0, aStr * uPx * k); vF = aFarge / (k * sqrt(k)); // større, men ikke lysere til sammen
  }`;
const GLORIE_FS = `
  varying vec3 vF;
  void main(){ float d = length(gl_PointCoord - 0.5) * 2.0; if (d >= 1.0) discard; gl_FragColor = vec4(vF * exp(-d * d * 4.5) * (1.0 - d * d), 1.0); }`;
/* hvor på tingene det lyser: [x, høyde i tegningen, størrelse (verdensenheter), styrke, farge (ellers lysets egen)]. Høyden ganges med BILL_Y.
   Lampen, stearinlysene, journalskapet, offeralteret og alteret med tre ruter er bilder fra ChatGPT, og der er stedet målt i bildet */
const GLORIE_KILDER = {
  lamp: [[.24, 1.4, 1.4, .65]], // skjermen er lys fra før, så den får mindre
  candles: [[0, .47, 1.25, .9]],
  altar: o => { const fw = (o.p && o.p.fw) || 1, b = !!SPRITES['alter' + fw], x = b ? .97 : fw * .95 / 2 - .25, h = b ? 1.34 : 1.49; return [[-x, h, .85, .9, '#ffcf5a'], [x, h, .85, .9, '#ffcf5a']]; },
  offeralter: [[-.71, 1.26, 1.25, .8, '#ffb24a'], [.71, 1.26, 1.25, .8, '#ffb24a']],
  journalskap: [[0, .87, 1.5, .7]],
  lyktestolpe: [[0, 2.72, 2.2, 1]],
  baal: [[0, .6, 3.2, .8]],
  vedovn: [[0, .5, 1.5, .8]],
  kjele: [[0, .37, 1.8, .7]],
  komfyr: [[0, .28, .7, .6, '#ff7a3a']],
  spole: [[0, 1.95, 1.7, .8]],
  lysskjerm: [[0, 1.32, 1.9, .45]],
  kjempeplante: [[0, 2.1, 1.5, .5]]
};
const Glorie = {
  pts: null, K: [], MAKS: 32, px: { value: 100 }, STYRKE: 1.6, UTEN_3D: .45, INN: .25, UT: .2, FRAM: 1.5,
  tak() { if (R.safe || R.lowTex || !R.lightsOn) return 0; return D3.on ? { hoy: 32, middels: 20, lav: 10 }[D3.kval()] || 10 : 10; },
  lag() {
    this.tom(); if (!R.scene || !R.post) return;
    const N = this.MAKS, geo = new THREE.BufferGeometry(), u = R.post.uniforms;
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3)); geo.setAttribute('aFarge', new THREE.BufferAttribute(new Float32Array(N * 3), 3)); geo.setAttribute('aStr', new THREE.BufferAttribute(new Float32Array(N), 1)); geo.setDrawRange(0, 0);
    const mat = new THREE.ShaderMaterial({ uniforms: { uPx: this.px, uTilt: u.uTilt, uFokus: u.uFokus }, vertexShader: GLORIE_VS, fragmentShader: GLORIE_FS, transparent: true, depthWrite: false,
      blending: THREE.CustomBlending, blendSrc: THREE.DstColorFactor, blendDst: THREE.OneFactor }); // bildet ganger (1 + gloria)
    this.pts = new THREE.Points(geo, mat); this.pts.frustumCulled = false; this.pts.renderOrder = 7; R.scene.add(this.pts); this.ny = true;
  },
  tom() { if (this.pts) { R.scene.remove(this.pts); this.pts.geometry.dispose(); this.pts.material.dispose(); } this.pts = null; this.K = []; this.sig = null; },
  /* kildene: tingene i GLORIE_KILDER, pærene i vegglampene (bare i 3D) og lyset ved pasienten. Samles på nytt når etasjen, tingene,
     vegglampene eller pasienten endrer seg, og en glorie som fantes før, beholder styrken sin */
  samle(lam, P) {
    const gml = new Map(); for (const k of this.K) gml.set(k.eier, (gml.get(k.eier) || []).concat(k));
    const K = [], legg = (eier, t, o) => { const g = gml.get(eier), j = K.filter(k => k.eier === eier).length; K.push(Object.assign({ eier, t, w: g && g[j] ? g[j].w : 0, lys: 0, x: 0, y: 0, z: 0 }, o)); };
    for (const o of G.props || []) { let E = GLORIE_KILDER[o.kind]; if (!E || !o.g || !o.g.position) continue; if (typeof E === 'function') E = E(o);
      for (const [dx, h, s, k, f] of E) legg(o, 'ting', { dx, h, s, k, z0: o.g.position.z + .1, f: f ? new THREE.Color(f) : null }); }
    for (const L of lam || []) if (L.p && L.p.parent) legg(L, 'pare', { x: L.p.parent.position.x + L.p.position.x, y: L.p.position.y, z: L.p.parent.position.z + L.p.position.z, s: 1.3, k: .55, f: null }); // pæra og veggen rundt er lyse fra før
    if (P && P.lantern) legg(P, 'lykt', { s: 1.1, k: .45, f: null, x: P.x, z: P.z });
    this.K = K; this.sig = [G.F, (G.props || []).length, lam, P];
  },
  /* lyset i platen i forhold til det den ble laget med: flimring, en lampe som faller eller slukker */
  styrke(L) { if (!L || !L.parent) return 0; const c = L.material.color, b = L.userData.col; return clamp(Math.max(c.r, c.g, c.b) / Math.max(.001, Math.max(b.r, b.g, b.b) * (L.userData.base || 1)), 0, 1.3); },
  oppdater(k, dt, mf) {
    if (k.t === 'ting') {
      const o = k.eier, L = o.light; if (o.alive === false || !o.g.parent || !o.g.visible || (L && !L.parent)) { k.lys = 0; return; }
      const sy = clamp(o.g.scale.y, 0, 1); k.lys = (L ? this.styrke(L) : .92 + Math.sin(G.time * 7 + o.x * 3) * .08) * sy * mf; // byggeanimasjonen: gloria vokser med tingen
      if (o.fallen && L) { k.x = L.position.x; k.y = .35; k.z = L.position.z - .3; } else { k.x = o.x + k.dx; k.y = k.h * BILL_Y * sy; k.z = k.z0; }
      if (!k.c) k.c = k.f || (L ? L.userData.col : new THREE.Color('#ffd89a'));
    } else if (k.t === 'pare') { const L = k.eier.lp; k.lys = this.styrke(L); if (!k.c) k.c = L.userData.col; } // mørket er allerede i platen (D3.tick)
    else {
      // lyset ved pasienten: i hoftehøyde på siden bak figuren, så det ikke ligger over ansiktet eller våpenet, og det glir etter når figuren snur seg
      const P = k.eier, L = P.lantern; k.lys = P.alive && L && L.parent ? this.styrke(L) * Math.max(.6, mf) : 0; if (!k.c) k.c = L ? L.userData.col : new THREE.Color('#ffe2b0');
      const tx = P.x - .42 * ((P.doll && P.doll.flip) || 1), ty = .8 + Math.sin(G.time * 2.1) * .04, tz = P.z + .12, a = k.plassert ? Math.min(1, dt * 9) : 1;
      k.x += (tx - k.x) * a; k.y += (ty - k.y) * a; k.z += (tz - k.z) * a; k.plassert = true;
    }
  },
  tick(dt) {
    const pts = this.pts; if (!pts) return; const N = this.tak(); pts.visible = N > 0; if (!N) return;
    const P = G.player, lam = D3.on && D3.bygd ? D3.lamper : null, S = this.sig;
    if (!S || S[0] !== G.F || S[1] !== (G.props || []).length || S[2] !== lam || S[3] !== P) this.samle(lam, P);
    const c = R.camera; this.px.value = R.renderer.domElement.height / Math.max(.001, c.top - c.bottom) * c.zoom;
    const K = this.K, cx = R.camT.x, cz = R.camT.z, mf = D3.on ? D3.mf ?? 1 : 1;
    for (const k of K) { this.oppdater(k, dt, mf); k.d2 = (k.x - cx) ** 2 + (k.z - cz) ** 2 + (k.lys > .01 ? 0 : 1e6); }
    K.sort((a, b) => a.d2 - b.d2);
    let n = 0; for (let i = 0; i < K.length; i++) { const k = K[i]; k.vil = i < N && k.lys > .01; if (!k.vil) k.w = Math.max(0, k.w - dt / this.UT); if (k.w > 0) n++; }
    for (const k of K) if (k.vil && (k.w > 0 || n < N)) { if (k.w <= 0) n++; k.w = this.ny ? 1 : Math.min(1, k.w + dt / this.INN); }
    this.ny = false;
    const A = pts.geometry.attributes, pos = A.position.array, col = A.aFarge.array, str = A.aStr.array, sk = this.STYRKE * (D3.on ? 1 : this.UTEN_3D), fy = this.FRAM * SINP, fz = this.FRAM * COSP;
    let j = 0;
    for (const k of K) {
      if (k.w <= 0 || j >= N) continue; const f = k.lys * k.w * k.k * sk, i = j * 3;
      pos[i] = k.x; pos[i + 1] = k.y + fy; pos[i + 2] = k.z + fz; col[i] = k.c.r * f; col[i + 1] = k.c.g * f; col[i + 2] = k.c.b * f; str[j++] = k.s;
    }
    pts.geometry.setDrawRange(0, j); A.position.needsUpdate = A.aFarge.needsUpdate = A.aStr.needsUpdate = true;
  }
};

/* ---------- lyn: taggete bånd som alltid vender mot kameraet ---------- */
const Lyn = {
  liste: [],
  sti(a, b, amp, n) {
    const P = [], dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
    for (let i = 0; i <= n; i++) {
      const t = i / n, k = i === 0 || i === n ? 0 : amp * Math.sin(Math.PI * t) * (.5 + Math.random() * .8);
      P.push(new THREE.Vector3(a.x + dx * t + (Math.random() - .5) * 2 * k, a.y + dy * t + (Math.random() - .5) * k * .6, a.z + dz * t + (Math.random() - .5) * 2 * k * .6));
    }
    return P;
  },
  /* bånd langs en sti, like bredt hele veien, lagt på tvers av synslinja */
  baand(P, w) {
    const inn = new THREE.Vector3(0, -Math.sin(CAM_PITCH), -Math.cos(CAM_PITCH)), s = new THREE.Vector3(), t = new THREE.Vector3(), pos = [], idx = [];
    P.forEach((p, i) => {
      t.subVectors(P[Math.min(P.length - 1, i + 1)], P[Math.max(0, i - 1)]).normalize(); s.crossVectors(t, inn).normalize().multiplyScalar(w / 2);
      pos.push(p.x - s.x, p.y - s.y, p.z - s.z, p.x + s.x, p.y + s.y, p.z + s.z);
      if (i) { const j = i * 2; idx.push(j - 2, j - 1, j, j - 1, j + 1, j); }
    });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); return g;
  },
  slag(x0, y0, z0, x1, y1, z1, o = {}) {
    if (R.safe || !R.scene) return null;
    const grp = new THREE.Group(); grp.renderOrder = 20; R.scene.add(grp);
    const mat = (farge, op) => new THREE.MeshBasicMaterial({ color: farge, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, side: THREE.DoubleSide });
    const L = { grp, a: { x: x0, y: y0, z: z0 }, b: { x: x1, y: y1, z: z1 }, t: 0, liv: o.liv || .3, nyT: 0, o, kjerne: mat(0xffffff, 1), glod: mat(o.farge || 0xcfe0ff, .32) };
    this.bygg(L); this.liste.push(L); return L;
  },
  bygg(L) {
    for (const c of L.grp.children.slice()) { L.grp.remove(c); c.geometry.dispose(); }
    const o = L.o, lang = Math.hypot(L.b.x - L.a.x, L.b.y - L.a.y, L.b.z - L.a.z), n = Math.max(6, Math.round(lang * 2.2)), amp = o.amp ?? Math.min(.9, lang * .06);
    const P = this.sti(L.a, L.b, amp, n), w = o.bredde || .1;
    const legg = (geo, m) => { const me = new THREE.Mesh(geo, m); me.renderOrder = 20; me.frustumCulled = false; L.grp.add(me); };
    legg(this.baand(P, w * 4.5), L.glod); legg(this.baand(P, w), L.kjerne);
    // greiner: korte sidelyn fra et tilfeldig punkt, som dør ut
    for (let k = 0; k < (o.grener ?? 2); k++) {
      const i = 1 + Math.floor(Math.random() * (P.length - 2)), p = P[i], a = Math.random() * TAU, l = lang * (.12 + Math.random() * .16);
      const B = this.sti(p, { x: p.x + Math.sin(a) * l, y: Math.max(.05, p.y - l * .6), z: p.z + Math.cos(a) * l * .6 }, amp * .5, 4);
      legg(this.baand(B, w * 2.6), L.glod); legg(this.baand(B, w * .55), L.kjerne);
    }
  },
  tick(dt) {
    for (let i = this.liste.length - 1; i >= 0; i--) {
      const L = this.liste[i]; L.t += dt; L.nyT -= dt;
      if (L.t >= L.liv) { R.scene.remove(L.grp); for (const c of L.grp.children) c.geometry.dispose(); L.kjerne.dispose(); L.glod.dispose(); this.liste.splice(i, 1); continue; }
      if (L.nyT <= 0) { L.nyT = .055; this.bygg(L); }
      const p = L.t / L.liv, fl = Math.random() < .25 ? .35 : 1;
      L.kjerne.opacity = (1 - p * p) * fl; L.glod.opacity = .32 * (1 - p) * fl;
    }
  },
  tom() { for (const L of this.liste) { R.scene.remove(L.grp); for (const c of L.grp.children) c.geometry.dispose(); L.kjerne.dispose(); L.glod.dispose(); } this.liste = []; }
};

/* ---------- uvær: lynet slår ned ute når det regner ---------- */
const Uvaer = {
  t: 9,
  tick(dt) {
    const P = G.player; if (Vaer.type !== 'regn' || G.state !== 'play' || !P || !P.alive || G.drom && G.drom.kap === 5) return;
    this.t -= dt; if (this.t > 0) return; this.t = rnd(11, 26);
    if (!Vaer.ute(P.x, P.z)) { this.t = 5; return; }
    // halvparten av gangene går det mot en fiende ute, ellers et sted tre til åtte skritt unna deg
    const kand = G.enemies.filter(e => e.alive && e.state !== 'spawn' && Vaer.ute(e.x, e.z) && d2(e.x, e.z, P.x, P.z) < 110 && d2(e.x, e.z, P.x, P.z) > 4);
    let x, z;
    if (kand.length && Math.random() < .5) { const e = pick(kand); x = e.x; z = e.z; }
    else for (let k = 0; k < 10; k++) { const a = Math.random() * TAU, r = rnd(3, 8), xx = P.x + Math.sin(a) * r, zz = P.z + Math.cos(a) * r; if (Vaer.ute(xx, zz) && tIdx(xx, zz) >= 0 && G.F.tiles[tIdx(xx, zz)]) { x = xx; z = zz; break; } }
    if (x === undefined) return;
    this.varsel(x, z);
  },
  /* det knitrer og lyser i bakken et øyeblikk før lynet kommer, så det går an å komme seg unna */
  varsel(x, z) {
    const o = { x, z, r: 1.5, color: 0xcfe0ff };
    Sound.play('gnistre', .5, .7); Particles.spawn(x, .1, z, 6, 0xcfe0ff, { speed: 1.5, up: 3, life: .4, size: .5 });
    addTele('circle', o, .85, () => this.nedslag(x, z, o));
  },
  nedslag(x, z, o) {
    Lyn.slag(x + rnd(-2.5, 2.5), 17, z - 7, x, 0, z, { farge: 0xcfe0ff, bredde: .15, liv: .34, grener: 3 });
    R.fx.lyn = 1; setTimeout(() => { R.fx.lyn = Math.max(R.fx.lyn, .7); }, 140);
    R.sjokk(x, z, .9); R.shake(.5); flashLight(x, z, 6, '#cfe0ff', .5, 2.2);
    Sound.play('lynslag'); const avst = Math.hypot(x - G.player.x, z - G.player.z); setTimeout(() => Sound.play('torden', 1, rnd(.85, 1.1)), 120 + avst * 60);
    Effekter.brennmerke(x, z); Glod.lag(x, .1, z + .1, 'gnister', { liv: 5, n: 18 }); Glod.lag(x, .3, z + .1, 'roy', { liv: 6, n: 8 });
    Particles.spawn(x, .3, z, 18, 0xfff2c0, { speed: 7, up: 7, life: .5, size: .7 });
    for (const e of G.enemies.slice()) if (e.alive && inShape({ shape: 'circle', o }, e.x, e.z, e.r * .7)) { hurt(e, 45, { from: 'env', type: 'lyn', x, z, kb: 7, stun: 1 }); if (e.alive) numText(e.x, e.z, 'LYNNEDSLAG', 'crit', 2.6); }
    if (G.boss && G.boss.alive && inShape({ shape: 'circle', o }, G.boss.x, G.boss.z, G.boss.r * .7)) hurt(G.boss, 30, { from: 'env', type: 'lyn', x, z });
    const P = G.player; if (P.alive && inShape({ shape: 'circle', o }, P.x, P.z, P.r * .7)) hurt(P, 10, { type: 'lyn', x, z, kb: 6, stun: .4 });
  }
};

/* ---------- regnringer: små ringer på bakken der det regner (uteflisene får en maske) ---------- */
const Regnringer = {
  obj: null, mask: null,
  start(F) {
    this.stopp(); if (R.safe || R.lowTex || !F) return;
    const data = new Uint8Array(F.W * F.H);
    for (let z = 0; z < F.H; z++) for (let x = 0; x < F.W; x++) { const i = z * F.W + x; data[i] = F.tiles[i] > 0 && Vaer.ute(x + .5, z + .5) ? 255 : 0; }
    const mask = this.mask = new THREE.DataTexture(data, F.W, F.H, THREE.LuminanceFormat); mask.magFilter = mask.minFilter = THREE.LinearFilter; mask.generateMipmaps = false; mask.needsUpdate = true;
    const mat = new THREE.ShaderMaterial({
      uniforms: { uTid: Glod.tid, uMask: { value: mask }, uSize: { value: new THREE.Vector2(F.W, F.H) } },
      vertexShader: 'varying vec2 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: `uniform float uTid; uniform sampler2D uMask; uniform vec2 uSize; varying vec2 vW;
        float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        void main(){
          float m = texture2D(uMask, vW / uSize).r; if (m < 0.5) discard;
          vec2 g = vW * 1.7, id = floor(g), f = fract(g); float a = 0.0;
          for (int k = 0; k < 2; k++) {
            vec2 s = id + float(k) * 17.3; float ph = h(s), fart = 0.9 + ph * 0.7, runde = uTid * fart + ph * 7.0, t = fract(runde);
            vec2 c = vec2(h(s + 3.1 + floor(runde)), h(s + 5.7 + floor(runde))) * 0.6 + 0.2;
            float d = length(f - c), r = t * 0.42;
            a += (1.0 - smoothstep(0.0, 0.03, abs(d - r))) * (1.0 - t) * step(0.35, h(s + floor(runde) * 1.3));
          }
          gl_FragColor = vec4(0.78, 0.85, 0.98, a * 0.34 * m);
        }`,
      transparent: true, depthWrite: false
    });
    const t = this.obj = new THREE.Mesh(R.plane1(), mat); t.rotation.x = -Math.PI / 2; t.position.set(F.W / 2, .026, F.H / 2); t.scale.set(F.W, F.H, 1); t.renderOrder = 1; t.frustumCulled = false; R.scene.add(t);
  },
  stopp() { if (this.obj) { R.scene.remove(this.obj); this.obj.material.dispose(); } if (this.mask) this.mask.dispose(); this.obj = this.mask = null; }
};

const Effekter = {
  /* et svidd merke etter lynet, som blekner over tjue sekunder */
  brennmerke(x, z) {
    if (!R.level) return;
    const tex = this._bm || (this._bm = R.canvasTex(128, 128, g => {
      const gr = g.createRadialGradient(64, 64, 4, 64, 64, 60); gr.addColorStop(0, 'rgba(10,6,4,.95)'); gr.addColorStop(.5, 'rgba(30,18,10,.6)'); gr.addColorStop(1, 'rgba(30,18,10,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
      g.strokeStyle = 'rgba(8,4,2,.8)'; g.lineWidth = 3; for (let i = 0; i < 7; i++) { let a = i / 7 * TAU + Math.random() * .4, r = 10; g.beginPath(); g.moveTo(64, 64); while (r < 58) { r += 6 + Math.random() * 8; a += (Math.random() - .5) * .6; g.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r); } g.stroke(); }
    }));
    const m = new THREE.Mesh(R.plane1(), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.rotation.z = Math.random() * TAU; m.position.set(x, .021, z); m.scale.set(2.2, 2.2, 1); m.renderOrder = 1; R.level.add(m);
    addFx(m, 20, (o, p) => { o.material.opacity = p < .7 ? 1 : (1 - p) / .3; });
  },
  /* teslaspolen slår en bue mot den nærmeste fienden, eller ut i lufta, med et par sekunders mellomrom */
  spoler(dt) {
    const P = G.player; if (!P) return;
    for (const o of G.props) {
      if (o.kind !== 'spole' || o.alive === false || !o.g) continue;
      o.buT = (o.buT ?? rnd(1, 3)) - dt; if (o.buT > 0) continue; o.buT = rnd(1.4, 3.4);
      if (d2(o.x, o.z, P.x, P.z) > 196) continue;
      const tx = o.x, ty = 2.25 * BILL_Y, tz = o.g.position.z + .12;
      let mal = null, bd = 3.6 * 3.6; for (const e of G.enemies) { if (!e.alive || e.state === 'spawn') continue; const d = d2(e.x, e.z, o.x, o.z); if (d < bd) { bd = d; mal = e; } }
      let x1, z1; if (mal) { x1 = mal.x; z1 = mal.z; } else { const a = Math.random() * TAU, r = rnd(1.2, 2.4); x1 = o.x + Math.sin(a) * r; z1 = o.z + Math.cos(a) * r; }
      Lyn.slag(tx, ty, tz, x1, mal ? .9 : 0, z1, { farge: 0x9ad8ff, bredde: .06, liv: .2, grener: 1, amp: .35 });
      Sound.play('gnistre', mal ? .9 : .45); flashLight(x1, z1, 2.4, '#9ad8ff', .2, 1.4); Particles.spawn(x1, .4, z1, 6, 0xcfefff, { speed: 4, up: 4, life: .3, size: .5 });
      if (mal) { hurt(mal, 14, { from: 'env', type: 'spole', x: o.x, z: o.z, kb: 3, stun: .5 }); if (mal.alive) numText(mal.x, mal.z, 'ZAPP', 'crit', 2.2); } // dør den, teller det som miljødrap (39_kombo.js)
    }
  },
  onFloor() {
    Glod.tom(); Lyn.tom(); Glorie.lag(); Uvaer.t = rnd(6, 12);
    // lilla pytter som ble lagt ut sammen med etasjen, får gløden sin tilbake
    for (const p of G.puddles || []) if (p.kind === 'morb') p.glod = Glod.lag(p.x, .08, p.z, 'morb', { eier: p }) || true;
    for (const o of G.props || []) {
      const K = GLOD_KILDER[o.kind]; if (!K) continue;
      const z0 = (o.g && o.g.position ? o.g.position.z : o.z + .2) + .14;
      for (const [type, dx, h, dz, opt] of K) Glod.lag(o.x + dx, h * BILL_Y, z0 + dz, type, Object.assign({ eier: o }, opt || {}));
    }
  },
  tick(dt) {
    Glod.tick(dt); Lyn.tick(dt);
    // drømmesløret glir inn og ut
    const mal = G.drom && G.state !== 'title' ? 1 : 0; R.fx.drom += (mal - R.fx.drom) * Math.min(1, dt * 1.5);
    if (G.state === 'play') { Uvaer.tick(dt); this.spoler(dt); }
    else if (typeof Kombo === 'object' && Kombo.hete > 0) { Kombo.hete = Math.max(0, Kombo.hete - dt * 2); R.fx.hete = Kombo.hete; } // blodrusen slukner utenfor spillet
  }
};

/* ---------- koblinger ---------- */
{ const _sp = spawnProps; spawnProps = function () { _sp(); try { Effekter.onFloor(); } catch (e) { console.warn('glød feilet', e); } }; }
{ const _cf = clearFloor; clearFloor = function () { Glod.tom(); Lyn.tom(); Glorie.tom(); Regnringer.stopp(); _cf(); }; }
{ const _st = Vaer.start, _so = Vaer.stopp; Vaer.start = function (F) { _st.call(this, F); if (this.type === 'regn') try { Regnringer.start(F); } catch (e) { console.warn('regnringer feilet', e); } }; Vaer.stopp = function () { Regnringer.stopp(); _so.call(this); }; }
// Morbidium stiger fra de lilla pyttene
{ const _ap = addPuddle; addPuddle = function (x, z, kind, r, life) { const p = _ap(x, z, kind, r, life); if (p && kind === 'morb' && !p.glod) p.glod = Glod.lag(p.x, .08, p.z, 'morb', { eier: p }) || true; return p; }; }
// store øyeblikk får sjokkbølge: eksplosjoner fra kuriositetene og sjefer som dør
{ const _b = Items.boom; Items.boom = function (x, z, dmg) { _b.call(this, x, z, dmg); R.sjokk(x, z, .4, { life: .5 }); }; }
{ const _bd = bossDie; bossDie = function (B) { _bd(B); R.sjokk(B.x, B.z, 1.6, { life: 1.1, fart: 1 }); R.zoomStot(B.x, B.z, .9); R.negativ(.12); R.fx.ca = 1.2; }; }
// nytt nivå: en myk ring ut fra pasienten
{ const _gx = gainXp; gainXp = function (v) { const P = G.player, l0 = P ? P.level : 0; _gx(v); if (P && P.level > l0) { R.sjokk(P.x, P.z, .55, { life: .8 }); Glod.lag(P.x, .2, P.z + .1, 'kombo', { liv: 1.6, n: 24, farger: ['#fff8d0', '#ffd24a'] }); } }; }
// dødsårsaken når lynet tar deg
if (typeof DEATH_CAUSES === 'object') DEATH_CAUSES.lyn = ['Truffet av lynet. Det slår visst ned to ganger.', 'Stod ute i tordenvær. Journalen sier «uforsiktig».', 'Lynet fant deg før sykepleieren gjorde det.'];
Object.assign(window, { Glorie, GLORIE_KILDER }); // til testene
