/* ============================================================
   PAPIRDUKKE  -  designdokumentet kapittel 9
   Hode og kropp er illustrerte flater, armer og bein er tykke,
   litt skjeve streker som bygges hvert bilde mellom festepunkter.
   Rekkefølge: kappe, bakre arm, bein, sko, kropp, våpen, fremre arm, hode.
   Hele dukken står loddrett på gulvet og strekkes 1/cos(helning)
   slik at tegningen får riktige proporsjoner i det faste kameraet.
   ============================================================ */
/* ---------- sprite-shader for tegnede plater ----------
   Én felles shader for figurdeler, rekvisitter, plukk og effekter:
   uFlash gir hvitt treffblink, uDissolve spiser tegningen bort med støy og en
   lilla glødekant (død, knust møbel), uOutline tegner en farget kant rundt
   silhuetten ved å se på alfa i åtte retninger (elitefiender, valgt ting). */
const SHADER_NOISE = 'float h1(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); } float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(h1(i), h1(i+vec2(1,0)), f.x), mix(h1(i+vec2(0,1)), h1(i+vec2(1,1)), f.x), f.y); }';
const SPRITE_VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
const SPRITE_FS = `uniform sampler2D map; uniform float uFlash, uDissolve, uOutline, uAlpha, uDyeOn; uniform vec3 uOutlineCol, uTint, uDye; uniform vec2 uTexel; varying vec2 vUv;
  ${SHADER_NOISE}
  void main(){
    vec4 c = texture2D(map, vUv); float a = c.a;
    // farging: grå og hvite flater (lav metning, ikke blekk) får klesfargen, hud og metall beholder sin
    if (uDyeOn > 0.5) { float mx = max(c.r, max(c.g, c.b)), mn = min(c.r, min(c.g, c.b)), l = dot(c.rgb, vec3(0.299, 0.587, 0.114)); float k = (1.0 - smoothstep(0.07, 0.17, mx - mn)) * smoothstep(0.14, 0.32, l); c.rgb = mix(c.rgb, uDye * (0.45 + l * 0.6), k); }
    c.rgb *= uTint;
    if (uOutline > 0.0) { float o = 0.0; for (int i = 0; i < 8; i++) { float an = float(i) * 0.7854; o = max(o, texture2D(map, vUv + vec2(cos(an), sin(an)) * uTexel * 5.0).a); } float e = clamp(o - a, 0.0, 1.0); c.rgb = mix(c.rgb, uOutlineCol, e); a = max(a, e * uOutline); }
    if (uDissolve > 0.0) { float n = vn(vUv * 9.0) * 0.7 + vn(vUv * 27.0) * 0.3; if (n < uDissolve) discard; float e = 1.0 - smoothstep(uDissolve, uDissolve + 0.08, n); c.rgb = mix(c.rgb, vec3(0.8, 0.45, 1.0), e); }
    c.rgb = mix(c.rgb, vec3(1.0, 0.99, 0.94), uFlash * step(0.3, a));
    a *= uAlpha; if (a < 0.04) discard;
    gl_FragColor = vec4(c.rgb, a);
  }`;
const RIB_VS = 'varying vec3 vCol; varying vec2 vP; void main(){ vCol = color; vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
const RIB_FS = `uniform float uFlash, uDissolve; uniform vec3 uTint; varying vec3 vCol; varying vec2 vP; ${SHADER_NOISE}
  void main(){ if (uDissolve > 0.0) { float n = vn(vP * 7.0 + 3.0); if (n < uDissolve) discard; } gl_FragColor = vec4(mix(vCol * uTint, vec3(1.0, 0.99, 0.94), uFlash), 1.0); }`;
function makeU(o = {}) { return { uFlash: { value: 0 }, uDissolve: { value: 0 }, uOutline: { value: o.outline || 0 }, uOutlineCol: { value: new THREE.Color(o.outlineCol || '#b36be0') }, uTint: { value: new THREE.Color(o.tint || '#ffffff') }, uAlpha: { value: 1 }, uDye: { value: new THREE.Color(o.dye || '#ffffff') }, uDyeOn: { value: o.dye ? 1 : 0 } }; }
function spriteMat(tex, U, o = {}) {
  const img = tex.image || { width: 64, height: 64 };
  return new THREE.ShaderMaterial({ uniforms: { map: { value: tex }, uTexel: { value: new THREE.Vector2(1 / img.width, 1 / img.height) }, uFlash: U.uFlash, uDissolve: U.uDissolve, uOutline: U.uOutline, uOutlineCol: U.uOutlineCol, uTint: U.uTint, uAlpha: U.uAlpha, uDye: U.uDye || { value: new THREE.Color(1, 1, 1) }, uDyeOn: U.uDyeOn || { value: 0 } },
    vertexShader: SPRITE_VS, fragmentShader: SPRITE_FS, transparent: true, side: THREE.DoubleSide, depthWrite: o.depthWrite !== false });
}

/* bånd-mesh: kontur først, så fyll, i samme tegnekall */
class Ribbon {
  constructor(cap = 900, U) {
    this.pos = new Float32Array(cap * 3); this.col = new Float32Array(cap * 3); this.n = 0; this.cap = cap;
    this.geo = new THREE.BufferGeometry();
    this.geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    this.geo.setAttribute('color', new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage));
    this.mesh = new THREE.Mesh(this.geo, U ? new THREE.ShaderMaterial({ uniforms: { uFlash: U.uFlash, uDissolve: U.uDissolve, uTint: U.uTint }, vertexShader: RIB_VS, fragmentShader: RIB_FS, vertexColors: true, side: THREE.DoubleSide }) : new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }));
    this.mesh.frustumCulled = false; this.c = new THREE.Color(); this.strokes = [];
  }
  begin() { this.strokes.length = 0; }
  add(pts, w, color, z = 0) { this.strokes.push({ pts, w, color, z }); }
  circle(x, y, r, color, z = 0) { this.strokes.push({ circle: true, x, y, r, color, z }); }
  v(x, y, z) { if (this.n >= this.cap) return; const i = this.n * 3; this.pos[i] = x; this.pos[i + 1] = y; this.pos[i + 2] = z; this.col[i] = this.c.r; this.col[i + 1] = this.c.g; this.col[i + 2] = this.c.b; this.n++; }
  disc(x, y, r, z) { const k = 12; for (let i = 0; i < k; i++) { const a = i / k * TAU, b = (i + 1) / k * TAU; this.v(x, y, z); this.v(x + Math.cos(a) * r, y + Math.sin(a) * r, z); this.v(x + Math.cos(b) * r, y + Math.sin(b) * r, z); } }
  strip(p, w, z) {
    for (let i = 0; i < p.length - 1; i++) {
      const [ax, ay] = p[i], [bx, by] = p[i + 1]; let nx = -(by - ay), ny = bx - ax; const L = Math.hypot(nx, ny) || 1; nx = nx / L * w / 2; ny = ny / L * w / 2;
      this.v(ax + nx, ay + ny, z); this.v(ax - nx, ay - ny, z); this.v(bx + nx, by + ny, z);
      this.v(bx + nx, by + ny, z); this.v(ax - nx, ay - ny, z); this.v(bx - nx, by - ny, z);
      this.disc(bx, by, w / 2, z);
    }
    this.disc(p[0][0], p[0][1], w / 2, z);
  }
  end(outline = .05) {
    this.n = 0;
    this.c.set(INK);
    for (const s of this.strokes) { if (s.circle) this.disc(s.x, s.y, s.r + outline, s.z); else this.strip(s.pts, s.w + outline * 2, s.z); }
    for (const s of this.strokes) { this.c.set(s.color); if (s.circle) this.disc(s.x, s.y, s.r, s.z + .001); else this.strip(s.pts, s.w, s.z + .001); }
    this.geo.setDrawRange(0, this.n); this.geo.attributes.position.needsUpdate = true; this.geo.attributes.color.needsUpdate = true;
  }
}
/* bøyd lem: kvadratisk kurve fra a til b med albue/kne forskjøvet sideveis */
function limb(ax, ay, bx, by, bend, n = 6) {
  const mx = (ax + bx) / 2, my = (ay + by) / 2, dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1;
  const cx = mx - dy / L * bend, cy = my + dx / L * bend, pts = [];
  for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; pts.push([u * u * ax + 2 * u * t * cx + t * t * bx, u * u * ay + 2 * u * t * cy + t * t * by]); }
  return pts;
}

const Q_GEO = new Map();
function quadGeo(P) {
  const k = P.w + ':' + P.h + ':' + P.ax + ':' + P.ay;
  if (!Q_GEO.has(k)) { const g = new THREE.PlaneGeometry(P.w, P.h); g.translate(P.w / 2 - P.ax, P.h / 2 - P.ay, 0); Q_GEO.set(k, g); }
  return Q_GEO.get(k);
}
function partMesh(P, U) {
  const m = new THREE.Mesh(quadGeo(P), spriteMat(P.tex, U || makeU()));
  m.userData.P = P; return m;
}
function setPart(m, P) { if (m.userData.P === P) return; m.userData.P = P; m.geometry = quadGeo(P); m.material.uniforms.map.value = P.tex; m.material.uniforms.uTexel.value.set(1 / P.canvas.width, 1 / P.canvas.height); if (m.customDepthMaterial) m.customDepthMaterial.map = P.tex; }

class Doll {
  constructor(type, opt = {}) {
    this.type = type; this.rig = opt.rig ? Object.assign({}, RIG[type] || RIG.pasient, opt.rig) : RIG[type] || RIG.pasient; this.opt = opt;
    this.root = new THREE.Group(); this.plane = new THREE.Group(); this.root.add(this.plane);
    this.U = makeU({ outline: opt.elite ? 1 : 0, outlineCol: opt.outlineCol, tint: opt.tint });
    this.sc = (opt.scale || 1) * this.rig.scale; this.plane.scale.set(this.sc, this.sc * BILL_Y, this.sc);
    this.view = 'f'; this.flip = 1; this.phase = 0; this.speed = 0; this.t = 0;
    this.headOff = { x: 0, y: 0, vx: 0, vy: 0 }; this.squash = 0; this.lean = 0; this.spin = 0;
    this.attack = null; this.flashT = 0; this.wpId = opt.weapon || null;
    this.shadow = Doll.blob(opt.shadow || .42); if (!opt.noShadow) this.root.add(this.shadow);
    this.back = new Ribbon(3200, this.U); this.front = new Ribbon(3200, this.U); this.plane.add(this.back.mesh); this.plane.add(this.front.mesh);
    if (this.rig.blob) { this.body = partMesh(charPart(type, 'blob', 'f'), this.U); this.plane.add(this.body); }
    else {
      if (this.rig.cape) { this.cape = partMesh(charPart(type, 'kappe', 'f'), this.U); this.plane.add(this.cape); }
      this.body = partMesh(charPart(type, 'kropp', 'f'), this.U); this.head = partMesh(charPart(type, 'hode', 'f'), this.U);
      this.shoeL = partMesh(opt.shoeP || shoePart(this.rig.shoe), this.U); this.shoeR = partMesh(opt.shoeP || shoePart(this.rig.shoe), this.U);
      this.plane.add(this.body, this.head, this.shoeL, this.shoeR);
      this.wp = new THREE.Group(); this.plane.add(this.wp);
      if (this.wpId) this.setWeapon(this.wpId);
    }
    this.meshes = []; this.plane.traverse(o => { if (o.isMesh && o.material.map) this.meshes.push(o); });
  }
  static blob(r) {
    if (!Doll.blobTex) Doll.blobTex = R.canvasTex(64, 64, g => { const gr = g.createRadialGradient(32, 32, 4, 32, 32, 31); gr.addColorStop(0, 'rgba(42,26,20,.42)'); gr.addColorStop(.8, 'rgba(42,26,20,.38)'); gr.addColorStop(.93, 'rgba(42,26,20,.08)'); gr.addColorStop(1, 'rgba(42,26,20,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
    const m = new THREE.Mesh(R.plane1(), new THREE.MeshBasicMaterial({ map: Doll.blobTex, transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.scale.set(r * 2.2, r * 1.5, 1); m.position.y = .012; m.renderOrder = 1; return m;
  }
  setWeapon(id) {
    this.wpId = id; this.wp.children.slice().forEach(c => this.wp.remove(c));
    if (!id) return; const m = partMesh(weaponPart(id), this.U); this.wp.add(m); this.wpMesh = m;
    this.meshes = []; this.plane.traverse(o => { if (o.isMesh && o.material.map) this.meshes.push(o); });
  }
  /* oppskrifter: egne hode- og kroppsdeler per visning, tillegg som følger hode eller kropp, farget kropp */
  setParts(head, body) { this.headOv = head || null; this.bodyOv = body || null; }
  addAddon(P, L, dye) { const U = dye ? Object.assign({}, this.U, { uDye: { value: new THREE.Color(dye) }, uDyeOn: { value: 1 } }) : this.U, m = partMesh(P, U); this.plane.add(m); (this.addons || (this.addons = [])).push({ m, L, P }); this.meshes.push(m); return m; }
  setDye(col) { if (!this.body) return; const U = Object.assign({}, this.U, { uDye: { value: new THREE.Color(col) }, uDyeOn: { value: 1 } }); this.body.material = spriteMat(this.body.userData.P.tex, U); this.body.userData.P = null; }
  placeAddons(v) {
    for (const a of this.addons || []) {
      const base = a.L.at === 'body' || !this.head ? this.body : this.head, off = a.L.off[v] || a.L.off.f;
      if (a.L.views) { const P = a.L.views[v] || a.L.views.f; if (P) setPart(a.m, P); a.m.visible = !!(a.L.views[v] || (v !== 'b' && a.L.views.f)); } else a.m.visible = !(a.L.face && v === 'b');
      a.m.position.set(base.position.x + off[0], base.position.y + off[1], base.position.z + (a.L.behind ? -.004 : .004)); a.m.rotation.z = base.rotation.z;
    }
  }
  flash(t = .09) { this.flashT = t; }
  hit(dir = 1) { this.squash = 1; this.headOff.vx += dir * 1.2; }
  /* face: vinkel i verden, der (sin a, cos a) er retningen */
  setFacing(a) {
    if (this.opt.fixedView) { this.view = this.opt.fixedView; this.flip = Math.sin(a) < -.3 ? -1 : Math.sin(a) > .3 ? 1 : this.flip; return; }
    const sx = Math.sin(a), cz = Math.cos(a);
    if (Math.abs(sx) > .5) { this.view = 's'; this.flip = sx < 0 ? -1 : 1; }
    else { this.view = cz >= 0 ? 'f' : 'b'; this.flip = 1; }
  }
  update(dt, st = {}) {
    this.t += dt; const R0 = this.rig, v = this.view;
    this.speed = lerp(this.speed, st.speed || 0, 1 - Math.pow(.001, dt));
    const moving = this.speed > .4;
    this.phase += dt * (moving ? 3.2 + this.speed * 1.4 : 0);
    if (!moving) this.phase = lerp(this.phase, Math.round(this.phase / Math.PI) * Math.PI, dt * 8);
    const sp = Math.sin(this.phase), bob = moving ? Math.abs(Math.sin(this.phase)) * .06 : Math.sin(this.t * 2.2) * .012;
    this.squash = Math.max(0, this.squash - dt * 6);
    const sq = Math.sin(this.squash * Math.PI) * .18 * (this.squash > 0 ? 1 : 0);
    const flipX = this.flip;
    this.plane.scale.set(this.sc * flipX * (1 + sq), this.sc * BILL_Y * (1 - sq * .8), this.sc);
    // rulling og velt
    this.plane.rotation.z = st.spin ? -st.spin * flipX : lerp(this.plane.rotation.z, (st.lean || 0) * -.12 * flipX, dt * 10);
    if (st.down) this.plane.rotation.z = lerp(this.plane.rotation.z, -1.35 * flipX, dt * 10);
    this.root.position.y = st.hop || 0;
    // bytt tegninger etter retning
    if (this.rig.blob) {
      setPart(this.body, charPart(this.type, 'blob', v === 'b' ? 'b' : v === 's' ? 's' : 'f'));
      const pul = 1 + Math.sin(this.t * (this.rig.pulse || 7)) * .04; this.body.scale.set(pul, 2 - pul, 1); this.body.position.y = this.rig.float ? .5 + Math.sin(this.t * 2) * .12 : 0;
      this.back.begin();
      const nt = this.rig.tentacles || 5, tw = this.rig.tentW || .09, tc = this.rig.tentCol || '#3a1a4a', y0 = this.body.position.y + .12;
      for (let i = 0; i < nt; i++) { const x = (-.5 + i / Math.max(1, nt - 1)) * (this.rig.tentSpread || .64), w = Math.sin(this.t * 9 + i * 1.7) * (this.rig.tentWave || .1) + (moving ? sp * .12 * (i % 2 ? 1 : -1) : 0); this.back.add(limb(x, y0, x + w * 1.4, y0 - (this.rig.tentLen || .14), w, 4), tw, tc, -.02); }
      this.back.end(.04); this.front.begin(); this.front.end(); this.placeAddons(v === 'b' ? 'b' : v === 's' ? 's' : 'f'); this.applyFlash(dt); return;
    }
    setPart(this.head, this.headOv ? this.headOv[v] || this.headOv.f : charPart(this.type, 'hode', v)); setPart(this.body, this.bodyOv ? this.bodyOv[v] || this.bodyOv.f : charPart(this.type, 'kropp', v));
    if (this.cape) setPart(this.cape, charPart(this.type, 'kappe', v === 'b' ? 'b' : 'f'));
    const hipY = R0.hip + bob, neckY = hipY + R0.neck, shY = hipY + R0.shY;
    // hodet henger litt etter (fjær)
    const ho = this.headOff, k = 60 * (R0.headLag || 1);
    ho.vx += (-ho.x * k - ho.vx * 9) * dt; ho.vy += (-ho.y * k - ho.vy * 9) * dt + (moving ? Math.cos(this.phase * 2) * dt * .6 : 0);
    ho.x += ho.vx * dt; ho.y += ho.vy * dt;
    const L = [], z = { cape: -.06, backArm: -.04, legs: -.02, shoes: 0, body: .02, wpBack: .01, wp: .035, frontArm: .05, head: .07 };
    this.body.position.set(0, hipY, z.body); this.body.rotation.z = (st.lean || 0) * -.05;
    this.head.position.set(ho.x * .3, neckY + ho.y * .3 - .02, z.head); this.head.rotation.z = ho.x * .25 + (st.headTilt || 0);
    if (this.cape) { this.cape.position.set(v === 's' ? -.08 : 0, shY - .88, v === 'b' ? z.head + .01 : z.cape); this.cape.rotation.z = (v === 's' ? .18 + Math.min(.5, this.speed * .07) : 0) + Math.sin(this.t * 3) * .04; }
    // bein og sko
    const legW = R0.legW, hw = R0.hipW;
    this.back.begin(); this.front.begin();
    let fL, fR;
    if (v === 's') { fL = [-.02 + sp * .2, Math.max(0, -Math.cos(this.phase)) * .1]; fR = [.02 - sp * .2, Math.max(0, Math.cos(this.phase)) * .1]; }
    else { fL = [-hw - .03, Math.max(0, sp) * .12]; fR = [hw + .03, Math.max(0, -sp) * .12]; }
    if (!moving) { fL[1] = fR[1] = 0; }
    const hipL = v === 's' ? [-.03, hipY + .04] : [-hw, hipY + .04], hipR = v === 's' ? [.03, hipY + .04] : [hw, hipY + .04];
    this.back.add(limb(hipL[0], hipL[1], fL[0], fL[1] + .07, v === 's' ? .05 : -.03), legW, R0.leg, z.legs);
    this.back.add(limb(hipR[0], hipR[1], fR[0], fR[1] + .07, v === 's' ? .05 : .03), legW, R0.leg, z.legs);
    this.shoeL.position.set(fL[0], fL[1], z.shoes + (v === 's' ? .004 : 0)); this.shoeR.position.set(fR[0], fR[1], z.shoes);
    this.shoeL.scale.x = this.shoeR.scale.x = 1; if (v === 's') { this.shoeL.scale.x = this.shoeR.scale.x = 1.1; }
    // armer
    const shL = [v === 's' ? -.02 : -R0.shW, shY], shR = [v === 's' ? .06 : R0.shW, shY];
    const armLen = .38 + R0.armW * .5;
    let hL = [shL[0] - .06 - sp * (v === 's' ? -.18 : .02), shL[1] - armLen + Math.max(0, -sp) * .05];
    let hR = [shR[0] + .06 + (v === 's' ? sp * .2 : 0), shR[1] - armLen + Math.max(0, sp) * .05];
    let wpAngle = v === 's' ? -.55 : v === 'b' ? .3 : -.3, wpBehind = v === 'b';
    const atk = st.attack;
    if (atk) {
      // svingbue rundt skulderen: fra hevet bak til ned foran
      const p = atk.p, heavy = atk.heavy, combo = atk.combo || 0;
      let a0, a1;
      if (combo === 1) { a0 = 2.6; a1 = -.4; } else { a0 = -1.6; a1 = 2.2; }
      if (heavy) { a0 = -2.6; a1 = 1.9; }
      const e = atk.charge ? a0 : p < .35 ? lerp(a0 + (heavy ? -.6 : -.3), a0, p / .35) : lerp(a0, a1, Math.min(1, (p - .35) / .3));
      const reach = armLen + .05;
      hR = [shR[0] + Math.sin(e) * reach, shR[1] + Math.cos(e) * reach * .9];
      wpAngle = -e; wpBehind = false;
      if (v === 'b') wpBehind = p < .4;
    } else if (st.hold) { hR = [shR[0] + .2, shR[1] - .12]; wpAngle = -1.25; }
    if (st.raise) { hL = [shL[0] - .15, shL[1] + .3]; hR = [shR[0] + .15, shR[1] + .3]; }
    const back = v === 's';
    (back ? this.back : this.front).add(limb(shL[0], shL[1], hL[0], hL[1], v === 's' ? -.06 : .07), R0.armW, R0.arm, back ? z.backArm : z.frontArm);
    (back ? this.back : this.front).circle(hL[0], hL[1], R0.handR, R0.hand, back ? z.backArm : z.frontArm);
    this.front.add(limb(shR[0], shR[1], hR[0], hR[1], v === 's' ? .08 : -.07), R0.armW, R0.arm, z.frontArm);
    this.front.circle(hR[0], hR[1], R0.handR, R0.hand, z.frontArm + .002);
    this.back.end(.045); this.front.end(.045);
    if (this.wpId) { this.wp.position.set(hR[0], hR[1], wpBehind ? z.wpBack : z.wp); this.wp.rotation.z = wpAngle; }
    this.placeAddons(v); this.applyFlash(dt);
  }
  applyFlash(dt) { this.flashT -= dt; this.U.uFlash.value = this.flashT > 0 && R.flashOn ? 1 : 0; }
  dissolve(p) { this.U.uDissolve.value = p; this.shadow.material.opacity = 1 - p; }
  dispose() { R.remove(this.root); }
}

/* rekvisitt som stående illustrasjon, festet i forkant */
function propSprite(k, x, z, opt = {}) {
  const P = opt.P || propPart(k), U = makeU(opt), m = partMesh(P, U);
  if (opt.flat) { m.rotation.x = -Math.PI / 2; m.position.set(x, .014, z); m.scale.set(1, 1 / Math.sin(CAM_PITCH), 1); m.material.depthWrite = false; m.renderOrder = 1; m.userData.U = U; return m; }
  const g = new THREE.Group(); g.add(m); m.scale.set(opt.flip ? -1 : 1, BILL_Y, 1); g.position.set(x, opt.y || 0, z); g.userData.U = U; g.userData.m = m;
  if (opt.shadow !== false) {
    if (!propSprite.tex) propSprite.tex = R.canvasTex(64, 64, g2 => { g2.fillStyle = 'rgba(40,24,12,.34)'; g2.beginPath(); g2.moveTo(8, 12); g2.lineTo(40, 6); g2.quadraticCurveTo(62, 30, 56, 58); g2.lineTo(14, 56); g2.quadraticCurveTo(2, 34, 8, 12); g2.fill(); });
    const s = new THREE.Mesh(R.plane1(), new THREE.MeshBasicMaterial({ map: propSprite.tex, transparent: true, depthWrite: false })); g.userData.shadow = s;
    s.rotation.x = -Math.PI / 2; s.scale.set(P.w * 1.15, Math.min(1.4, P.h * .45), 1); s.position.set(P.w * .18, .011, -Math.min(1.4, P.h * .45) / 2 + .15); s.renderOrder = 1; g.add(s);
  }
  return g;
}
