/* ============================================================
   SNØEN  -  snøfall i tre lag som regnes ut på skjermkortet
   - Tre lag med fnugg: fjerne og små nær bakken (under bakketåka), de vanlige midt i lufta (Vaer.obj), og noen få store
     nær glasset som tegnes rett på skjermen, beveger seg litt fortere enn bakken (dybde) og viker unna pasienten.
   - All bevegelse regnes ut i vertex-shaderen fra tiden, som går med spilltiden (pausen og treffstansen fryser snøen).
     Hvert fnugg har fire faste tilfeldige tall. Prosessoren gjør ingenting per fnugg.
   - Boksen fnuggene faller i, følger kameraet (bredde, høyde, zoom og vinkelen på 52 grader) og brettes med mod(), så en
     stående telefon og Kameraavstand 1,25 blir dekket helt ut i kantene. Fnuggene ligger fast i verden og brettes bare utenfor bildet.
   - Utseendet: et atlas på 128 punkter tegnet i kode, med en myk klump, en klump med cel-skygge og en svak blekkant, en krystall
     med seks armer i blekk (bare de nære) og en uskarp skive. Aldri helt hvitt. En maske over uterommene holder snøen ute av paviljongene.
   - Lys: i 3D får fnuggene lyset fra lampene (D3.pool), varmt under gasslyktene og blågrått i mørket. I 2D lyser lysbufferen dem.
   - Vind fra etasjens frø, med kast hvert 8. til 20. sekund som får fnuggene til å slenge mer og vindsuset til å øke.
   - Mengden går langsomt opp og ned over et par minutter, og er full i kastene.
   - Snø i lyset fra gasslyktene i stedet for møll, og ingen sirisser mens det snør.
   Enkel grafikk: ingen snø på skjermkortet, bare de gamle prikkene, men runde og i en boks som følger kameraet.
   Lette teksturer (R.lowTex): ingen snø, som før.
   ============================================================ */
const SNO_VS = `
  const float SINP = 0.7880108;
  uniform float uTid, uPx, uMin, uMaks, uYtop, uFall0, uFall1, uStr0, uStr1, uParal, uKast, uAlfa, uTett, uNaer, uUte;
  uniform vec2 uCam, uVind, uBoksMin, uBoks, uCelle, uSkjerm; uniform vec3 uFokus, uAmb, uFarge;
  uniform vec4 uLysP[8]; uniform vec3 uLysF[8];
  attribute vec4 aFro;
  varying vec4 vF; varying vec2 vXZ; varying vec2 vRot; varying float vCelle;
  float h1(float n){ return fract(sin(n) * 43758.5453); }
  void main(){
    float r1 = h1(aFro.x * 91.7 + aFro.y * 13.1), r2 = h1(aFro.z * 47.3 + aFro.w * 7.7), r3 = h1(aFro.w * 63.1 + aFro.x * 3.3), r4 = h1(aFro.y * 29.9 + aFro.z * 5.1), r5 = h1(aFro.w * 17.3 + aFro.y * 71.9);
    float fall = mix(uFall0, uFall1, r1), str = mix(uStr0, uStr1, r2);
    // hvert fnugg slenger i sin egen takt, og mer i vindkastene
    float frek = 0.5 + r3, amp = (0.15 + 0.3 * r4) * (1.0 + 1.5 * uKast), fase = r2 * 6.2831;
    vec2 sway = vec2(sin(uTid * frek + fase), cos(uTid * frek * 0.83 + fase * 1.7) * 0.6) * amp;
    vCelle = r5 < 0.5 ? uCelle.x : uCelle.y;
    // krystallene snurrer, klumpene vugger bare litt (skyggen på dem skal ligge nede til høyre)
    float rot = vCelle > 1.5 && vCelle < 2.5 ? (r4 * 2.0 - 1.0) * uTid + r1 * 6.2831 : sin(uTid * frek * 0.7 + fase) * 0.25;
    vRot = vec2(cos(rot), sin(rot));
    // mengden: bare fnuggene under tettheten vises, og de glir inn og ut i stedet for å dukke opp
    float a = uAlfa * smoothstep(r5 * 0.94, r5 * 0.94 + 0.06, uTett);
    if (uNaer < 0.5) {
      // i verden: faller fra uYtop til bakken, og kommer tilbake et nytt sted i boksen for hver runde
      float s = aFro.y - uTid * fall / uYtop, runde = floor(s), y = uYtop * (s - runde);
      vec2 hopp = vec2(h1(runde * 1.7 + aFro.x * 31.0), h1(runde * 2.3 + aFro.z * 17.0));
      vec2 p = (aFro.xz + hopp) * uBoks + uVind * (0.8 + 0.4 * r2) + sway - uCam * (uParal - 1.0);
      vec2 rel = mod(p - uCam - uBoksMin, uBoks) + uBoksMin;
      vec3 w = vec3(uCam.x + rel.x, y, uCam.y + rel.y); vXZ = w.xz;
      a *= (1.0 - smoothstep(uYtop * 0.82, uYtop, y)) * smoothstep(0.0, 0.25, y); // smoothstep med kantene baklengs er udefinert i GLSL
      vec3 lys = uAmb;
      for (int i = 0; i < 8; i++) { float k = max(0.0, 1.0 - length(uLysP[i].xyz - w) / max(uLysP[i].w, 0.001)); lys += uLysF[i] * k * k; }
      vF = vec4(uFarge * min(lys, vec3(1.3)), a);
      gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.0);
    } else {
      // nær glasset: rett på skjermen, i skjermenheter, og alt flytter seg uParal ganger så fort som bakken
      vec2 v = (uVind - uCam) * uParal, p = aFro.xy * uBoks + vec2(v.x, -v.y * SINP) + sway * uParal;
      p.y -= uTid * fall;
      float runde = floor((p.y - uBoksMin.y) / uBoks.y); p.x += h1(runde * 1.3 + aFro.z * 11.0) * uBoks.x;
      vec2 rel = mod(p - uBoksMin, uBoks) + uBoksMin, ndc = rel / uSkjerm;
      // de viker unna pasienten, og er borte inne i paviljongene
      vec2 q = (ndc * 0.5 + 0.5 - uFokus.xy) * vec2(uFokus.z, 1.0);
      a *= mix(0.06, 1.0, smoothstep(0.08, 0.22, length(q))) * uUte;
      vF = vec4(uFarge * uAmb, a); vXZ = vec2(0.0);
      gl_Position = vec4(ndc, 0.0, 1.0);
    }
    if (a < 0.004) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); gl_PointSize = 0.0; return; }
    gl_PointSize = clamp(str * uPx, uMin, uMaks);
  }`;
const SNO_FS = `
  uniform sampler2D uAtlas, uMask; uniform vec2 uSize; uniform float uUteF, uNaer;
  varying vec4 vF; varying vec2 vXZ; varying vec2 vRot; varying float vCelle;
  void main(){
    vec2 p = vec2(gl_PointCoord.x - 0.5, 0.5 - gl_PointCoord.y);
    p = vec2(vRot.x * p.x - vRot.y * p.y, vRot.y * p.x + vRot.x * p.y);
    vec4 t = texture2D(uAtlas, (p + 0.5) * 0.5 + vec2(mod(vCelle, 2.0) * 0.5, 0.5 - floor(vCelle * 0.5) * 0.5));
    // masken over uterommene (i verdensrutene), og etasjens eget svar utenfor kartet
    vec2 u = vXZ / uSize; float inne = step(0.0, u.x) * step(0.0, u.y) * step(u.x, 1.0) * step(u.y, 1.0);
    float m = uNaer > 0.5 ? 1.0 : mix(uUteF, texture2D(uMask, clamp(u, 0.0, 1.0)).r, inne);
    float a = vF.a * m;
    if (dot(p, p) > 0.25 || t.a * a < 0.01) discard;
    gl_FragColor = vec4(t.rgb * vF.rgb * a, t.a * a); // atlaset er forhåndsmultiplisert
  }`;
/* lagene: høyden fnuggene faller fra, størrelse og fart (verdensenheter, for de nære skjermenheter), minste størrelse i CSS-punkter,
   hvilke to ruter i atlaset, og hvor mye de flytter seg i forhold til bakken */
const SNO_LAG = [
  { navn: 'fjern', ytop: 2.5, str: [.07, .1], fall: [.45, .7], ro: 6, min: 2.2, alfa: .8, celle: [0, 0], paral: 1 },
  { navn: 'midt', ytop: 6, str: [.12, .19], fall: [.8, 1.3], ro: 11, min: 3.5, alfa: .95, celle: [1, 0], paral: 1.06 },
  { navn: 'naer', str: [.3, .46], fall: [1.6, 2.2], ro: 21, min: 7, alfa: .85, celle: [2, 3], paral: 1.4, naer: true }
];
/* fnugg per lag (fjern, midt, nær): 3D etter kvalitet, 2D, og 2D på berøringsskjerm. Bufferne lages for høy, og et lavere nivå tegner færre */
const SNO_BUDSJETT = { hoy: [700, 380, 120], middels: [420, 220, 60], lav: [240, 110, 0], d2: [300, 160, 40], d2touch: [200, 110, 40] };
/* snø som faller i lyset fra gasslyktene (Glød, 38_effekter.js): faller fra lampehodet og blekner under lyset */
GLOD_TYPER.lyssno = { n: 22, liv: 2.6, stig: -2.2, spre: .9, vind: .35, virvel: .25, str: [.09, .07], farger: ['#fff4dc', '#ffd9a0'], add: 1, flimmer: 0, alfa: .75 };
const SNO_LYKT = [['lyssno', 0, 2.72, 0]];

const Sno = {
  lag: [], mask: null, kast: 0, vind: { x: 0, z: 0 }, fart: { x: 0, z: 0 }, uteK: 1,
  U: null, // delte uniforms
  /* hvor mange fnugg hvert lag har råd til akkurat nå */
  budsjett() {
    if (R.safe || R.lowTex) return [0, 0, 0];
    if (!D3.on) return SNO_BUDSJETT[R.coarse ? 'd2touch' : 'd2'];
    return SNO_BUDSJETT[D3.kval()] || SNO_BUDSJETT.middels;
  },
  /* atlaset: fire ruter på 64 punkter, tegnet én gang for hele spillet */
  atlas() {
    if (this._atlas) return this._atlas;
    const t = R.canvasTex(128, 128, g => {
      const INK = 'rgba(42,26,20,', LYS = '#f1f4f9', SKYGGE = '#c3cddc';
      // 0: myk klump (de fjerne)
      let gr = g.createRadialGradient(32, 32, 0, 32, 32, 27); gr.addColorStop(0, 'rgba(244,247,252,1)'); gr.addColorStop(.55, 'rgba(240,244,251,.9)'); gr.addColorStop(1, 'rgba(232,238,248,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
      // 1: klump med cel-skygge nede til høyre og en svak blekkant
      const klump = (cx, cy, r) => { g.beginPath(); for (let i = 0; i <= 28; i++) { const a = i / 28 * TAU, k = r * (1 + .13 * Math.sin(a * 3 + 1) + .07 * Math.sin(a * 5 + 2)), x = cx + Math.cos(a) * k, y = cy + Math.sin(a) * k; if (i) g.lineTo(x, y); else g.moveTo(x, y); } g.closePath(); };
      g.save(); klump(96, 32, 24); g.fillStyle = SKYGGE; g.fill(); g.clip(); klump(92.5, 28.5, 22); g.fillStyle = LYS; g.fill(); g.restore();
      klump(96, 32, 24); g.strokeStyle = INK + '.28)'; g.lineWidth = 2.2; g.stroke();
      // 2: krystall med seks armer, blekk under og lys oppå (bare de nære)
      const armer = (lw, farge) => {
        g.strokeStyle = farge; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = i / 6 * TAU + .26, c = Math.cos(a), s = Math.sin(a); g.moveTo(32, 96); g.lineTo(32 + c * 25, 96 + s * 25);
          for (const [r, l] of [[11, 7.5], [18, 5]]) for (const sd of [-1, 1]) { const b = a + sd * .95; g.moveTo(32 + c * r, 96 + s * r); g.lineTo(32 + c * r + Math.cos(b) * l, 96 + s * r + Math.sin(b) * l); }
        }
        g.stroke();
      };
      armer(6, INK + '.3)'); armer(3.6, LYS); g.fillStyle = LYS; g.beginPath(); g.arc(32, 96, 4.6, 0, TAU); g.fill();
      // 3: nære fnugg ute av fokus: en myk, uskarp klump uten lys kant (med kant så de ut som såpebobler)
      gr = g.createRadialGradient(96, 96, 0, 96, 96, 27); gr.addColorStop(0, 'rgba(242,246,252,.78)'); gr.addColorStop(.45, 'rgba(240,244,251,.62)'); gr.addColorStop(.8, 'rgba(236,241,249,.2)'); gr.addColorStop(1, 'rgba(236,241,249,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(96, 96, 27, 0, TAU); g.fill();
    });
    t.premultiplyAlpha = true; return this._atlas = t;
  },
  /* en rund prikk til de gamle fnuggene i enkel grafikk */
  prikk() { return this._prikk || (this._prikk = R.canvasTex(16, 16, g => { const gr = g.createRadialGradient(8, 8, 0, 8, 8, 8); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.55, 'rgba(255,255,255,.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 16, 16); })); },
  /* boksen i verden (xz, i forhold til kameramålet) som dekker det som synes fra bakken opp til høyden ytop, med margen m */
  boksFor(ytop, m = 1.5) {
    const c = R.camera, z = c.zoom || 1, hw = (c.right - c.left) / 2 / z, hh = (c.top - c.bottom) / 2 / z;
    return { x0: -hw - m, z0: -hh / SINP - m, bx: 2 * (hw + m), bz: (2 * hh + ytop * COSP) / SINP + 2 * m, hw, hh };
  },
  /* speilet av boksen slik shaderen bruker den (midtlaget), i verdenskoordinater. Til testene */
  boks() { const L = this.lag.find(L => L.def.navn === 'midt'); if (!L) return null; const u = L.mat.uniforms, c = this.U.uCam.value; return { x0: c.x + u.uBoksMin.value.x, x1: c.x + u.uBoksMin.value.x + u.uBoks.value.x, z0: c.y + u.uBoksMin.value.y, z1: c.y + u.uBoksMin.value.y + u.uBoks.value.y, ytop: u.uYtop.value }; },
  start(F) {
    this.stopp(); if (R.safe || R.lowTex || !R.scene || !F) return null;
    // masken: 1 der det snør (uterommene og alt ute i en uteetasje), 0 inne i paviljongene og husene
    const data = new Uint8Array(F.W * F.H);
    for (let z = 0; z < F.H; z++) for (let x = 0; x < F.W; x++) data[z * F.W + x] = Vaer.ute(x + .5, z + .5) ? 255 : 0;
    const mask = this.mask = new THREE.DataTexture(data, F.W, F.H, THREE.LuminanceFormat); mask.magFilter = mask.minFilter = THREE.LinearFilter; mask.generateMipmaps = false; mask.needsUpdate = true;
    const gl = R.renderer.getContext(), pr = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE);
    // vinden kommer fra samme kant hele etasjen, bestemt av frøet
    const a = (((F.seed || 0) * .6180339) % 1) * TAU; this.dir = { x: Math.cos(a), z: Math.sin(a) * .7 };
    this.vind = { x: 0, z: 0 }; this.kast = 0; this.kastFase = 0; this.kastT = rnd(8, 20); this.kastS = 1; this.syklus = rnd(90, 150); this.uteK = 1;
    const V2 = () => new THREE.Vector2(), V3 = () => new THREE.Vector3();
    this.U = { uTid: { value: 0 }, uPx: { value: 100 }, uMaks: { value: pr && pr[1] >= 1 ? pr[1] : 64 }, uKast: { value: 0 }, uTett: { value: 1 }, uUte: { value: 1 },
      uCam: { value: V2() }, uVind: { value: V2() }, uSkjerm: { value: V2() }, uFokus: { value: new THREE.Vector3(.5, .5, 1) }, uAmb: { value: new THREE.Vector3(1, 1, 1) }, uFarge: { value: new THREE.Vector3(.9, .93, .97) },
      uLysP: { value: [0, 1, 2, 3, 4, 5, 6, 7].map(() => new THREE.Vector4(0, -99, 0, .001)) }, uLysF: { value: [0, 1, 2, 3, 4, 5, 6, 7].map(V3) },
      uAtlas: { value: this.atlas() }, uMask: { value: mask }, uSize: { value: new THREE.Vector2(F.W, F.H) }, uUteF: { value: F.ute ? 1 : 0 } };
    const B = SNO_BUDSJETT.hoy, lav = this.budsjett()[2] === 0 && D3.on;
    SNO_LAG.forEach((def, j) => {
      if (def.naer && lav) return; // på lav kvalitet blir det bare to lag
      const N = B[j], fro = new Float32Array(N * 4); for (let i = 0; i < fro.length; i++) fro[i] = Math.random();
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3)); geo.setAttribute('aFro', new THREE.BufferAttribute(fro, 4));
      const mat = new THREE.ShaderMaterial({
        uniforms: Object.assign({}, this.U, { uYtop: { value: def.ytop || 1 }, uFall0: { value: def.fall[0] }, uFall1: { value: def.fall[1] }, uStr0: { value: def.str[0] }, uStr1: { value: def.str[1] }, uParal: { value: def.paral },
          uAlfa: { value: def.alfa }, uCelle: { value: new THREE.Vector2(def.celle[0], def.celle[1]) }, uNaer: { value: def.naer ? 1 : 0 }, uMin: { value: def.min }, uBoksMin: { value: V2() }, uBoks: { value: new THREE.Vector2(1, 1) } }),
        vertexShader: SNO_VS, fragmentShader: SNO_FS, transparent: true, depthWrite: false, depthTest: !def.naer, premultipliedAlpha: true, blending: THREE.NormalBlending
      });
      const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; pts.renderOrder = def.ro; pts.userData.sno = def.navn; R.scene.add(pts);
      this.lag.push({ def, j, pts, geo, mat });
    });
    this.ramme();
    return (this.lag.find(L => L.def.navn === 'midt') || {}).pts || null;
  },
  stopp() {
    for (const L of this.lag) { R.scene.remove(L.pts); L.geo.dispose(); L.mat.dispose(); }
    if (this.mask) this.mask.dispose(); this.lag = []; this.mask = null; this.U = null; this.kast = 0;
  },
  /* vinden og kastene: et kast bygger seg opp på 0,8 s, holder 1 til 3 s og slipper på 1,5 s, opptil to og en halv gang grunnvinden */
  vaer(dt) {
    this.kastT -= dt;
    if (this.kastFase === 0 && this.kastT <= 0) { this.kastFase = 1; this.kastT = .8; this.kastS = rnd(.6, 1); }
    else if (this.kastFase === 1) { this.kast = this.kastS * clamp(1 - this.kastT / .8, 0, 1); if (this.kastT <= 0) { this.kastFase = 2; this.kastT = rnd(1, 3); } }
    else if (this.kastFase === 2) { this.kast = this.kastS; if (this.kastT <= 0) { this.kastFase = 3; this.kastT = 1.5; } }
    else if (this.kastFase === 3) { this.kast = this.kastS * clamp(this.kastT / 1.5, 0, 1); if (this.kastT <= 0) { this.kastFase = 0; this.kast = 0; this.kastT = rnd(8, 20); } }
    const d = this.dir || { x: 1, z: 0 }, f = .3 * (1 + 1.5 * this.kast);
    this.fart.x = d.x * f; this.fart.z = d.z * f;
    this.vind.x += this.fart.x * dt; this.vind.z += this.fart.z * dt;
    if (Math.abs(this.vind.x) > 1e4) this.vind.x = 0; if (Math.abs(this.vind.z) > 1e4) this.vind.z = 0;
  },
  /* spilltiden: fnuggene faller, vinden blåser og de nære blekner når pasienten går inn */
  tick(dt) {
    if (!this.U) return;
    this.vaer(dt); const U = this.U; U.uTid.value += dt; U.uKast.value = this.kast; U.uVind.value.set(this.vind.x, this.vind.z);
    const P = G.player, ute = P && Vaer.ute(P.x, P.z) ? 1 : 0; this.uteK += (ute - this.uteK) * Math.min(1, dt * 2.5); U.uUte.value = this.uteK;
    // mengden går opp og ned over et par minutter, og er full i kastene
    const s = .5 + .5 * Math.sin(U.uTid.value / this.syklus * TAU); U.uTett.value = Math.max(.5 + .5 * s, this.kast);
  },
  /* hvert bilde, etter kameraet og lysene (D3.tick): boksen, størrelsen, lyset og hvor mange som tegnes */
  ramme() {
    const U = this.U; if (!U || !R.camera) return;
    const c = R.camera, z = c.zoom || 1, n = this.budsjett(), vis = !R.safe && !R.lowTex;
    U.uCam.value.set(R.camT.x, R.camT.z); U.uPx.value = R.renderer.domElement.height / Math.max(.001, c.top - c.bottom) * z;
    for (const L of this.lag) {
      const u = L.mat.uniforms, d = L.def; L.pts.visible = vis && n[L.j] > 0; L.geo.setDrawRange(0, Math.min(n[L.j], L.geo.attributes.aFro.count));
      u.uMin.value = d.min * (R.dpr || 1);
      if (d.naer) { const b = this.boksFor(0, .6); u.uBoksMin.value.set(-b.hw - .6, -b.hh - .6); u.uBoks.value.set(2 * (b.hw + .6), 2 * (b.hh + .6)); U.uSkjerm.value.set(b.hw, b.hh); }
      else { const b = this.boksFor(d.ytop); u.uBoksMin.value.set(b.x0, b.z0); u.uBoks.value.set(b.bx, b.bz); }
    }
    const P = G.player; if (P && G.state !== 'title') { const q = R.uvAv(P.x, .9, P.z); U.uFokus.value.set(q.x, q.y, (c.right - c.left) / Math.max(.001, c.top - c.bottom)); }
    // lyset: i 3D lampene i nærheten (samme pulje som figurene), ellers lyser lysbufferen bildet etterpå
    const LP = U.uLysP.value, LF = U.uLysF.value;
    if (D3.on && D3.bygd && D3.q && !D3.q.flat) {
      U.uAmb.value.set(.8, .85, .95);
      for (let i = 0; i < 8; i++) { const l = D3.pool[i]; if (!l || l.intensity <= 0) { LF[i].set(0, 0, 0); continue; } LP[i].set(l.position.x, l.position.y, l.position.z, l.distance * 1.1); LF[i].set(l.color.r, l.color.g, l.color.b).multiplyScalar(l.intensity * .6); }
    } else { U.uAmb.value.set(D3.on ? .92 : .96, D3.on ? .92 : .97, D3.on ? .92 : 1); for (let i = 0; i < 8; i++) LF[i].set(0, 0, 0); }
  },
  /* enkel grafikk: de gamle prikkene, men runde, litt større og i en boks som følger kameraet */
  gammel(V) {
    const m = V.obj.material; m.map = this.prikk(); m.size = 4.5; m.needsUpdate = true;
    const b = this.boksFor(8); for (let i = 0; i < V.n; i++) this.gammelPlasser(V, i, b, true);
    this.dir = { x: 1, z: 0 }; this.kastT = rnd(8, 20); this.kastFase = 0; this.kast = 0; this.vind = { x: 0, z: 0 }; this.syklus = 120;
    V.obj.geometry.attributes.position.array.set(V.p); V.obj.geometry.attributes.position.needsUpdate = true;
  },
  /* et nytt fnugg: et sted på skjermen (litt over toppen når det kommer ovenfra), og så bakken under det i den høyden */
  gammelPlasser(V, i, b, forste) {
    const cx = R.camT.x, cz = R.camT.z;
    for (let k = 0; k < 4; k++) {
      const y = forste ? Math.random() * 7 : 6 + Math.random() * 2, sy = -b.hh + Math.random() * (2 * b.hh + 1), x = cx - b.hw - 1 + Math.random() * (2 * b.hw + 2), z = cz + (y * COSP - sy) / SINP;
      if (!Vaer.ute(x, z)) continue;
      V.p[i * 3] = x; V.p[i * 3 + 1] = y; V.p[i * 3 + 2] = z; V.v[i] = .7 + Math.random() * .6; return;
    }
    V.p[i * 3 + 1] = -50;
  },
  gammelTick(V, dt) {
    this.vaer(dt); this.tid = (this.tid || 0) + dt;
    const N = V.n, p = V.p, t = this.tid, b = this.boksFor(8), cx = R.camT.x, cz = R.camT.z, fx = this.fart.x, fz = this.fart.z, amp = 1 + 1.5 * this.kast;
    for (let i = 0; i < N; i++) {
      const o = i * 3;
      if (p[o + 1] < -40) { if (Math.random() < dt * 2) this.gammelPlasser(V, i, b); continue; }
      p[o + 1] -= V.v[i] * dt; p[o] += (Math.sin(t * (.55 + (i % 7) * .14) + i) * .5 * amp + fx) * dt; p[o + 2] += (Math.cos(t * (.5 + (i % 5) * .12) + i * .7) * .3 * amp + fz) * dt;
      // ute av bildet (under kanten, til siden eller langt over) eller nede på bakken: kommer tilbake ovenfra
      const x = p[o] - cx, sy = p[o + 1] * COSP - (p[o + 2] - cz) * SINP;
      if (p[o + 1] < 0 || sy < -b.hh - 1 || sy > b.hh + 6 || Math.abs(x) > b.hw + 1.5) this.gammelPlasser(V, i, b);
    }
    V.pos.set(p); V.obj.geometry.attributes.position.needsUpdate = true;
  }
};

/* ---------- koblinger ---------- */
{
  const _st = Vaer.start, _so = Vaer.stopp, _ti = Vaer.tick;
  Vaer.start = function (F) {
    if (F && F.vaer === 'sno' && !R.lowTex && !R.safe && R.scene) {
      this.stopp(); this.F = F;
      try { this.obj = Sno.start(F); } catch (e) { console.warn('snøen feilet', e); Sno.stopp(); this.obj = null; }
      if (this.obj) { this.type = 'sno'; Sound.vaer && Sound.vaer('vind'); return; }
    }
    _st.call(this, F);
    if (this.type === 'sno' && this.obj) Sno.gammel(this);
  };
  Vaer.stopp = function () { if (Sno.lag.length || Sno.U) { Sno.stopp(); this.obj = null; } _so.call(this); };
  Vaer.tick = function (dt) { if (this.type !== 'sno' || !this.obj) return _ti.call(this, dt); if (Sno.U) Sno.tick(dt); else Sno.gammelTick(this, dt); };
}
// boksen og lyset følger kameraet og lampene i samme bilde (D3.tick kalles hvert bilde, også uten 3D)
{ const _dt = D3.tick; D3.tick = function (dt) { _dt.call(this, dt); if (Sno.U) Sno.ramme(); }; }
// gasslyktene: snø i lyset i stedet for møll. Etasjen leses fra G.F, for tingene lages før været starter
{ const _of = Effekter.onFloor; Effekter.onFloor = function () { const K = GLOD_KILDER.lyktestolpe, vinter = G.F && G.F.vaer === 'sno'; if (vinter) GLOD_KILDER.lyktestolpe = SNO_LYKT; try { _of.call(this); } finally { GLOD_KILDER.lyktestolpe = K; } }; }
// lyden: ingen sirisser i snøværet, og vindsuset øker med kastene
{ const _m = Stemning.maal; Stemning.maal = function () { const M = _m.call(this); if (Vaer.type === 'sno' || (G.F && G.F.vaer === 'sno' && !G.drom)) { delete M.amb_natt; if (M.amb_vind) M.amb_vind[0] *= 1 + .8 * Sno.kast; } return M; }; }
Object.assign(window, { Sno, SNO_LAG, SNO_BUDSJETT }); // til testene
