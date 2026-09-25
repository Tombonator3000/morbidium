/* ============================================================
   PRESENTASJON  -  ortografisk kamera, shadere og felles hjelpere
   1) Lysbuffer: lysplater tegnes additivt i halv oppløsning og ganges inn
      i bildet i etterbehandlingen (lamper, gnister, Morbidium, spillerens lykt).
   2) Tegnede plater (11_doll.js): blink, oppløsning med glødende kant, elitekant.
   3) Etterbehandling: fargegradering per etasje, papirkorn, vignett,
      lav helse, treff og Morbidium-forvrengning (kan slås av).
   ============================================================ */
const CAM_PITCH = 52 * Math.PI / 180;
const BILL_Y = 1 / Math.cos(CAM_PITCH);
const R = {
  renderer: null, scene: null, camera: null, level: null, dyn: null, lscene: null, geoCache: new Map(), tex: {},
  camT: { x: 0, z: 0 }, trauma: 0, shakeOn: true, flashOn: true, distortOn: true, lightsOn: true, view: 11.5,
  rt: null, lrt: null, post: null, postScene: null, postCam: null,
  fx: { hurt: 0, flash: 0, morb: 0, low: 0, blod: 0, blodFlip: 0, aarer: 0, puls: 3 },
  init(canvas) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    this.coarse = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches); this.dpr = this.dprMax = Math.min(devicePixelRatio || 1, this.coarse ? 1.5 : 2); this.renderer.setPixelRatio(1);
    canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); if (window.showErr) showErr('Grafikken gikk tom for minne eller krasjet (WebGL-konteksten ble mistet).', true); });
    this.scene = new THREE.Scene(); this.lscene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 300);
    this.dyn = new THREE.Group(); this.scene.add(this.dyn);
    this.makeTextures(); this.makePost(); this.resize();
    addEventListener('resize', () => this.resize());
  },
  resize() {
    const w = innerWidth, h = innerHeight, a = w / h, vh = Math.max(this.view, 10.5 / a), c = this.camera;
    c.left = -vh * a / 2; c.right = vh * a / 2; c.top = vh / 2; c.bottom = -vh / 2; c.updateProjectionMatrix();
    const pw = Math.round(w * this.dpr), ph = Math.round(h * this.dpr);
    this.renderer.setSize(pw, ph, false); this.renderer.domElement.style.width = w + 'px'; this.renderer.domElement.style.height = h + 'px';
    const MS = false; // multisample-mål ga hvit skjerm på enkelte mobil-GPU-er
    if (this.rt) this.rt.dispose(); if (this.lrt) this.lrt.dispose();
    this.rt = MS ? new THREE.WebGLMultisampleRenderTarget(pw, ph) : new THREE.WebGLRenderTarget(pw, ph); if (MS) this.rt.samples = 4;
    this.lrt = new THREE.WebGLRenderTarget(Math.max(2, pw >> 1), Math.max(2, ph >> 1));
    if (this.post) { this.post.uniforms.tScene.value = this.rt.texture; this.post.uniforms.tLight.value = this.lrt.texture; this.post.uniforms.uRes.value.set(pw, ph); }
  },
  makePost() {
    this.postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); this.postScene = new THREE.Scene();
    this.post = new THREE.ShaderMaterial({
      uniforms: { tScene: { value: null }, tLight: { value: null }, uRes: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 },
        uAmbient: { value: new THREE.Color(1, 1, 1) }, uLift: { value: new THREE.Color(0, 0, 0) }, uGain: { value: new THREE.Color(1, 1, 1) },
        uMorb: { value: 0 }, uHurt: { value: 0 }, uLow: { value: 0 }, uFlash: { value: 0 }, uDistort: { value: 1 }, uLights: { value: 1 }, uVig: { value: .55 }, tBloom: { value: null }, uBloom: { value: 0 },
        tBlod: { value: this.blodSkjerm() }, uBlod: { value: 0 }, uBlodFlip: { value: 0 }, uAarer: { value: 0 }, uPuls: { value: 3 },
        tUskarp: { value: null }, uTilt: { value: 0 }, uSplit: { value: 0 }, uFilm: { value: 0 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: `
        uniform sampler2D tScene, tLight, tBloom, tBlod, tUskarp; uniform vec2 uRes; uniform float uTime, uMorb, uHurt, uLow, uFlash, uDistort, uLights, uVig, uBloom, uBlod, uBlodFlip, uAarer, uPuls, uTilt, uSplit, uFilm;
        uniform vec3 uAmbient, uLift, uGain; varying vec2 vUv;
        float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
        // årer: rygger i støyen gir tynne, forgreinede linjer
        float rygg(vec2 p){ return 1.0 - abs(vn(p) * 2.0 - 1.0); }
        float aare(vec2 p){ float r = rygg(p) * 0.55 + rygg(p * 2.2 + 3.7) * 0.3 + rygg(p * 4.7 + 9.1) * 0.15; return smoothstep(0.8, 0.95, r); }
        void main(){
          vec2 uv = vUv; vec2 c = uv - 0.5; float d = length(c * vec2(uRes.x / uRes.y, 1.0));
          // blekkboiling: hele tegningen skjelver litt, åtte ganger i sekundet, som håndtegnet animasjon
          float bt = floor(uTime * 8.0);
          uv += (vec2(vn(vUv * 7.0 + bt * 1.7), vn(vUv * 7.0 + 31.0 + bt * 2.3)) - 0.5) * 2.4 / uRes * uDistort;
          float m = uMorb * uDistort;
          if (m > 0.01) { uv += vec2(sin(uv.y * 17.0 + uTime * 1.3), cos(uv.x * 13.0 + uTime * 1.07)) * 0.0022 * m * smoothstep(0.15, 0.7, d); }
          float ca = (uHurt * 0.006 + m * 0.0015) * smoothstep(0.1, 0.8, d);
          vec3 col = vec3(texture2D(tScene, uv + vec2(ca, 0.0)).r, texture2D(tScene, uv).g, texture2D(tScene, uv - vec2(ca, 0.0)).b);
          // tilt-shift (3D, høy kvalitet): topp og bunn av bildet blir litt uskarpe, som et diorama
          if (uTilt > 0.0) col = mix(col, texture2D(tUskarp, uv).rgb, smoothstep(0.2, 0.52, abs(vUv.y - 0.54)) * uTilt);
          vec3 L = texture2D(tLight, uv).rgb;
          col *= mix(vec3(1.0), uAmbient + L * 1.35, uLights);
          if (uBloom > 0.0) col += texture2D(tBloom, uv).rgb * uBloom;
          col = col * uGain + uLift;
          // fargetoning i 3D: kalde skygger og varme høylys
          if (uSplit > 0.0) { float L0 = dot(col, vec3(0.299, 0.587, 0.114)); col *= mix(vec3(1.0), vec3(0.9, 0.95, 1.12), (1.0 - smoothstep(0.0, 0.45, L0)) * uSplit); col *= mix(vec3(1.0), vec3(1.07, 1.0, 0.9), smoothstep(0.45, 1.0, L0) * uSplit); }
          float lum = dot(col, vec3(0.299, 0.587, 0.114));
          col = mix(col, vec3(lum) * vec3(1.05, 0.95, 0.9), uLow * 0.55);
          float paper = vn(vUv * uRes / 3.0) * 0.6 + vn(vUv * uRes / 11.0) * 0.4;
          float grain = h(vUv * uRes + fract(uTime * 7.0) * 100.0);
          col *= 0.94 + paper * 0.08 + (grain - 0.5) * 0.035;
          col *= 1.0 - smoothstep(0.42, 1.05, d) * uVig;
          // gammel film: svake riper og litt ustø belysning, mer jo lenger ned i bygget
          if (uFilm > 0.0) { float fr = floor(uTime * 14.0); float ripe = step(0.9993, h(vec2(floor(vUv.x * uRes.x / 3.0), fr))) * step(0.3, h(vec2(fr, 7.1))); col = mix(col, vec3(0.92, 0.88, 0.8), ripe * 0.45 * uFilm); col *= 1.0 + (h(vec2(fr, 3.3)) - 0.5) * 0.035 * uFilm; }
          col = mix(col, col * vec3(0.72, 0.52, 0.95), smoothstep(0.35, 0.95, d) * uMorb * 0.65);
          col = mix(col, vec3(0.75, 0.08, 0.05), smoothstep(0.5, 1.0, d) * (uHurt * 0.55 + uLow * (0.25 + 0.2 * sin(uTime * 5.0))));
          // årer som kryper inn fra kanten og banker i takt med hjertet når helsa er lav
          if (uAarer > 0.0) {
            vec2 q = vUv * vec2(uRes.x / uRes.y, 1.0) * 3.2 + vec2(uTime * 0.012, 0.0);
            float v = aare(q + vec2(3.1, 1.7));
            float kant = smoothstep(0.6 - uAarer * 0.24, 1.0, d), puls = 0.6 + 0.4 * pow(abs(sin(uTime * uPuls)), 6.0);
            col = mix(col, vec3(0.2, 0.0, 0.03), v * kant * min(1.0, uAarer * 1.4) * puls * 0.92);
            col += vec3(0.25, 0.02, 0.02) * aare(q + vec2(3.1, 1.705)) * (1.0 - v) * kant * uAarer * puls * 0.3;
          }
          // blod på skjermen etter treff: sprut langs kantene som sklir litt nedover mens det blekner
          if (uBlod > 0.0) {
            vec2 bu = vec2(mix(vUv.x, 1.0 - vUv.x, uBlodFlip), vUv.y + (1.0 - uBlod) * 0.05);
            vec4 b = texture2D(tBlod, bu);
            float m = smoothstep(0.78 - uBlod * 0.5, 1.08, d);  // små treff viser bare det ytterste, store treff kryper lenger inn
            col = mix(col, b.rgb, b.a * m * smoothstep(0.0, 0.3, uBlod) * 0.85);
          }
          col = mix(col, vec3(1.0, 0.98, 0.9), uFlash);
          gl_FragColor = vec4(col, 1.0);
        }`,
      depthTest: false, depthWrite: false
    });
    const q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.post); q.frustumCulled = false; this.postScene.add(q);
  },
  /* blod på skjermen: malt én gang, sprut langs kantene og dråper som renner fra toppen */
  blodSkjerm() {
    return this.canvasTex(512, 512, g => {
      const rng = mulberry32(1923), klatt = (cx, cy, r, n = 16, uj = .5) => { g.beginPath(); for (let i = 0; i <= n; i++) { const a = i / n * TAU, rr = r * (1 - uj / 2 + rng() * uj); g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } g.closePath(); g.fill(); };
      const sprut = (cx, cy, r) => {
        g.fillStyle = 'rgba(90,4,6,.92)'; klatt(cx, cy, r, 18, .55);
        for (let i = 0; i < 10; i++) { const a = rng() * TAU, d = r * (.9 + rng() * .9), s = 2 + rng() * r * .18; g.beginPath(); g.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, s, 0, TAU); g.fill(); }
        g.fillStyle = 'rgba(130,10,12,.95)'; klatt(cx - r * .1, cy - r * .1, r * .55, 12, .5);
        g.fillStyle = 'rgba(255,190,190,.4)'; g.beginPath(); g.ellipse(cx - r * .25, cy - r * .25, r * .16, r * .07, -.6, 0, TAU); g.fill();
      };
      // mest i hjørnene, litt langs kantene
      for (const [cx, cy] of [[0, 0], [512, 0], [0, 512], [512, 512]]) for (let k = 0; k < 3; k++) sprut(cx + (cx ? -1 : 1) * rng() * 70, cy + (cy ? -1 : 1) * rng() * 70, 20 + rng() * 34);
      for (let k = 0; k < 4; k++) sprut(80 + rng() * 352, rng() * 30, 12 + rng() * 22);
      for (let k = 0; k < 3; k++) sprut(rng() * 30, 90 + rng() * 330, 12 + rng() * 20);
      for (let k = 0; k < 3; k++) sprut(512 - rng() * 30, 90 + rng() * 330, 12 + rng() * 20);
      // dråper som renner ned fra toppen
      g.strokeStyle = 'rgba(100,6,8,.9)'; g.fillStyle = 'rgba(100,6,8,.9)'; g.lineCap = 'round';
      for (let k = 0; k < 7; k++) { const x = 20 + rng() * 472, y0 = 10 + rng() * 25, len = 30 + rng() * 110; g.lineWidth = 3 + rng() * 4; g.beginPath(); g.moveTo(x, y0); g.lineTo(x + (rng() - .5) * 6, y0 + len); g.stroke(); g.beginPath(); g.arc(x, y0 + len + 3, 4 + rng() * 3, 0, TAU); g.fill(); }
    });
  },
  setGrade(th) {
    const u = this.post.uniforms, g = th.grade || {};
    u.uAmbient.value.set(g.amb || '#ffffff'); u.uLift.value.set(g.lift || '#000000'); u.uGain.value.set(g.gain || '#ffffff'); u.uVig.value = g.vig || .55;
    this.clear = th.fog;
  },
  safe: false, checkN: 0,
  render(dt) {
    if (this.safe) { const r = this.renderer; this.fx.hurt = Math.max(0, this.fx.hurt - dt * 2.5); this.fx.flash = Math.max(0, this.fx.flash - dt * 5); r.setRenderTarget(null); r.setClearColor(this.clear || 0x16130c, 1); r.clear(); r.render(this.scene, this.camera); return; }
    this.renderPost(dt);
    // selvtest: blir bildet helt hvitt eller helt tomt, byttes det til enkel grafikk
    if (this.checkN < 3 && (++this.frameN || (this.frameN = 1)) % 20 === 0) {
      this.checkN++;
      try {
        const gl = this.renderer.getContext(), w = gl.drawingBufferWidth, h = gl.drawingBufferHeight, px = new Uint8Array(4); let white = 0, blank = 0;
        for (let i = 1; i <= 3; i++) for (let j = 1; j <= 3; j++) { gl.readPixels(Math.floor(w * i / 4), Math.floor(h * j / 4), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); if (px[0] > 247 && px[1] > 247 && px[2] > 247) white++; if (px[0] + px[1] + px[2] === 0) blank++; }
        if (white >= 8 || blank >= 9 || gl.isContextLost()) { this.safe = true; this.onSafe && this.onSafe(white >= 8 ? 'hvitt bilde' : 'tomt bilde'); }
      } catch (e) { }
    }
  },
  renderPost(dt) {
    const r = this.renderer, u = this.post.uniforms;
    u.uTime.value += dt; u.uHurt.value = this.fx.hurt; u.uFlash.value = this.flashOn ? this.fx.flash : 0; u.uMorb.value = this.fx.morb; u.uLow.value = this.fx.low;
    u.uBlod.value = this.fx.blod; u.uBlodFlip.value = this.fx.blodFlip; u.uAarer.value = Math.max(0, this.fx.aarer || 0); u.uPuls.value = this.fx.puls || 3; this.fx.blod = Math.max(0, this.fx.blod - dt * .38);
    const Q = D3.on ? D3.Q() : null; u.uDistort.value = this.distortOn ? 1 : 0; u.uLights.value = this.lightsOn && !D3.on ? 1 : 0; u.uBloom.value = Q && Q.glod ? .7 : 0;
    u.uTilt.value = Q && Q.tilt ? .62 : 0; u.uSplit.value = Q ? .7 : 0; u.uFilm.value = this.distortOn ? .35 + (G.depth || 1) * .16 : 0;
    this.fx.hurt = Math.max(0, this.fx.hurt - dt * 2.5); this.fx.flash = Math.max(0, this.fx.flash - dt * 5);
    if (!D3.on) { r.setRenderTarget(this.lrt); r.setClearColor(0x000000, 1); r.clear(); r.render(this.lscene, this.camera); }
    r.setRenderTarget(this.rt); r.setClearColor(this.clear || 0x16130c, 1); r.clear(); r.render(this.scene, this.camera);
    if (Q && Q.glod) this.renderBloom();
    if (Q && Q.tilt) this.renderUskarp();
    r.setRenderTarget(null); r.render(this.postScene, this.postCam);
  },
  /* glød til 3D-prøven: lyse deler av bildet i kvart oppløsning, uskarpt to veier, lagt oppå */
  renderBloom() {
    const r = this.renderer, w = Math.max(2, this.rt.width >> 2), h = Math.max(2, this.rt.height >> 2);
    if (!this.bl || this.bl.w !== w || this.bl.h !== h) {
      if (this.bl) { this.bl.a.dispose(); this.bl.b.dispose(); }
      const vs = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
      const lys = new THREE.ShaderMaterial({ uniforms: { t: { value: null } }, vertexShader: vs, fragmentShader: 'uniform sampler2D t; varying vec2 vUv; void main(){ vec3 c = texture2D(t, vUv).rgb; float l = max(c.r, max(c.g, c.b)); gl_FragColor = vec4(c * smoothstep(0.86, 1.0, l) * 1.4, 1.0); }', depthTest: false, depthWrite: false });
      const blur = new THREE.ShaderMaterial({ uniforms: { t: { value: null }, uDir: { value: new THREE.Vector2(1, 0) } }, vertexShader: vs, depthTest: false, depthWrite: false,
        fragmentShader: 'uniform sampler2D t; uniform vec2 uDir; varying vec2 vUv; void main(){ vec3 c = texture2D(t, vUv).rgb * 0.227; c += (texture2D(t, vUv + uDir * 1.38).rgb + texture2D(t, vUv - uDir * 1.38).rgb) * 0.316; c += (texture2D(t, vUv + uDir * 3.23).rgb + texture2D(t, vUv - uDir * 3.23).rgb) * 0.070; gl_FragColor = vec4(c, 1.0); }' });
      const q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), lys), sc = new THREE.Scene(); q.frustumCulled = false; sc.add(q);
      this.bl = { w, h, a: new THREE.WebGLRenderTarget(w, h), b: new THREE.WebGLRenderTarget(w, h), lys, blur, q, sc };
    }
    const B = this.bl;
    B.q.material = B.lys; B.lys.uniforms.t.value = this.rt.texture; r.setRenderTarget(B.a); r.render(B.sc, this.postCam);
    B.q.material = B.blur;
    for (let i = 0; i < 2; i++) {
      B.blur.uniforms.t.value = B.a.texture; B.blur.uniforms.uDir.value.set((1 + i) / w, 0); r.setRenderTarget(B.b); r.render(B.sc, this.postCam);
      B.blur.uniforms.t.value = B.b.texture; B.blur.uniforms.uDir.value.set(0, (1 + i) / h); r.setRenderTarget(B.a); r.render(B.sc, this.postCam);
    }
    this.post.uniforms.tBloom.value = B.a.texture;
  },
  /* uskarp kopi av hele bildet i kvart oppløsning, til tilt-shift. Bruker glødens uskarphet-shader. */
  renderUskarp() {
    const B = this.bl; if (!B) return;
    const r = this.renderer, w = B.w, h = B.h;
    if (!this.us || this.us.w !== w || this.us.h !== h) {
      if (this.us) { this.us.a.dispose(); this.us.b.dispose(); }
      const kopi = new THREE.ShaderMaterial({ uniforms: { t: { value: null } }, vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }', fragmentShader: 'uniform sampler2D t; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(t, vUv).rgb, 1.0); }', depthTest: false, depthWrite: false });
      this.us = { w, h, a: new THREE.WebGLRenderTarget(w, h), b: new THREE.WebGLRenderTarget(w, h), kopi };
    }
    const U = this.us;
    B.q.material = U.kopi; U.kopi.uniforms.t.value = this.rt.texture; r.setRenderTarget(U.a); r.render(B.sc, this.postCam);
    B.q.material = B.blur;
    for (let i = 0; i < 2; i++) {
      B.blur.uniforms.t.value = U.a.texture; B.blur.uniforms.uDir.value.set((1 + i * 1.5) / w, 0); r.setRenderTarget(U.b); r.render(B.sc, this.postCam);
      B.blur.uniforms.t.value = U.b.texture; B.blur.uniforms.uDir.value.set(0, (1 + i * 1.5) / h); r.setRenderTarget(U.a); r.render(B.sc, this.postCam);
    }
    this.post.uniforms.tUskarp.value = U.a.texture;
  },
  /* ---------- hjelpere ---------- */

  geo(key, make) { if (!this.geoCache.has(key)) this.geoCache.set(key, make()); return this.geoCache.get(key); },
  plane1() { return this.geo('plane1', () => new THREE.PlaneGeometry(1, 1)); },
  canvasTex(w, h, draw, repeat) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
    const t = new THREE.CanvasTexture(c); t.anisotropy = 4; if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  },
  makeTextures() {
    this.tex.pool = this.canvasTex(128, 128, g => { const gr = g.createRadialGradient(64, 64, 2, 64, 64, 63); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.35, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
    this.tex.hatch = this.canvasTex(64, 64, g => { g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#fff'; g.lineWidth = 9; for (let i = -64; i < 128; i += 22) { g.beginPath(); g.moveTo(i, 64); g.lineTo(i + 64, 0); g.stroke(); } }, true);
    this.tex.puddle = this.canvasTex(64, 64, g => { g.fillStyle = '#fff'; for (const [k, al] of [[1, .4], [.86, .4], [.7, .4], [.55, .5]]) { g.globalAlpha = al; g.beginPath(); for (let i = 0; i <= 24; i++) { const a = i / 24 * TAU, rr = (26 + Math.sin(a * 3) * 3 + Math.cos(a * 5) * 2) * k; g.lineTo(32 + Math.cos(a) * rr, 32 + Math.sin(a) * rr); } g.fill(); } });
    this.tex.white = this.canvasTex(4, 4, g => { g.fillStyle = '#fff'; g.fillRect(0, 0, 4, 4); });
  },
  posterTex(text) {
    return this.canvasTex(128, 170, g => {
      g.fillStyle = '#efe4c4'; g.fillRect(4, 4, 120, 162); g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(4, 4, 120, 162);
      g.fillStyle = '#b3261e'; g.fillRect(14, 14, 100, 10); g.fillStyle = INK; g.font = 'bold 17px Georgia, serif'; g.textAlign = 'center';
      text.split('\n').forEach((l, i) => g.fillText(l, 64, 56 + i * 24)); g.fillStyle = 'rgba(90,60,20,.18)'; g.beginPath(); g.arc(94, 138, 16, 0, TAU); g.fill();
    });
  },
  /* lysplate i lysscenen, flat på gulvet */
  light(x, z, r, color, intensity = 1, parent) {
    const m = new THREE.Mesh(this.plane1(), new THREE.MeshBasicMaterial({ map: this.tex.pool, color: new THREE.Color(color).multiplyScalar(intensity), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, 0, z); m.scale.set(r * 2, r * 2, 1); m.userData.col = new THREE.Color(color); m.userData.base = intensity;
    (parent || this.lscene).add(m);
    // lyskildene huskes, så 3D-prøven kan gi de nærmeste et ekte punktlys
    const K = this.kilder || (this.kilder = []); K.push(m); if (K.length > 400) this.kilder = K.filter(k => k.parent);
    return m;
  },
  setLight(m, intensity) { m.material.color.copy(m.userData.col).multiplyScalar(Math.max(0, intensity)); },
  /* ---------- toon-vann ----------
     Tilpasset fra cortiz2894/stylized-components (MIT, Copyright (c) 2026 Christian Ortiz),
     src/components/waterFloor/shaders/fragment.ts: Voronoi F1 minus SmoothF1 gir cel-skygget
     kantmønster og harde ringer ved nedslag. Endret for Morbidium: pyttemaske med kant,
     faste parametre per væsketype, strømflimmer, GLSL for WebGL1/r128. */
  water: null,
  waterMat(kind, electric, full) {
    if (!this.water) {
      const centers = []; for (let i = 0; i < 8; i++) centers.push(new THREE.Vector2(-999, -999));
      this.water = { cache: new Map(), next: 0, u: { uTime: { value: 0 }, uRippleCenters: { value: centers }, uRippleTimes: { value: new Array(8).fill(-100) }, uRippleCount: { value: 0 } } };
    }
    const key = kind + (electric ? '!' : '') + (full ? 'F' : '');
    if (this.water.cache.has(key)) return this.water.cache.get(key);
    const P = { wet: ['#1f6f9a', '#59b4dc', '#e8fbff', .23, 1], tub: ['#2a7ea8', '#6ac2e0', '#ffffff', .3, 1], vomit: ['#5d6a1c', '#9fae3a', '#e4ec9a', .32, .9], soup: ['#8a5a14', '#d8a040', '#fff0b0', .3, .9], morb: ['#2a0a3a', '#6b2d8c', '#e0a8ff', .28, 1.4], blod: ['#3a0606', '#8a1010', '#e05050', .3, .6], mokk: ['#2e1c0a', '#6b4423', '#b08a5a', .34, .45], myr: ['#1a1c10', '#3e3e22', '#8a8a5a', .3, .35], tjern: ['#04080c', '#0e1c26', '#6a8aa0', .2, .5] }[kind] || ['#1f6f9a', '#59b4dc', '#fff', .23, 1];
    const u = this.water.u;
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uTime: u.uTime, uRippleCenters: u.uRippleCenters, uRippleTimes: u.uRippleTimes, uRippleCount: u.uRippleCount,
        uDeep: { value: new THREE.Color(P[0]) }, uMid: { value: new THREE.Color(P[1]) }, uHigh: { value: new THREE.Color(P[2]) },
        uScale: { value: P[3] * 9 }, uSpeed: { value: P[4] }, uMask: { value: full ? this.tex.white : this.tex.puddle }, uElectric: { value: electric ? 1 : 0 } },
      vertexShader: 'varying vec2 vWorldPos; varying vec2 vUv; void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position,1.0); vWorldPos = w.xz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: `
        uniform float uTime, uScale, uSpeed, uElectric; uniform vec3 uDeep, uMid, uHigh; uniform sampler2D uMask;
        uniform vec2 uRippleCenters[8]; uniform float uRippleTimes[8]; uniform int uRippleCount;
        varying vec2 vWorldPos; varying vec2 vUv;
        vec2 hash2(vec2 p){ p = vec2(dot(p, vec2(127.1,311.7)), dot(p, vec2(269.5,183.3))); return fract(sin(p)*43758.5453); }
        float smin(float a, float b, float k){ float h = max(k - abs(a-b), 0.0) / k; return min(a,b) - h*h*h*k/6.0; }
        vec2 cellPt(vec2 s){ return 0.5 + 0.5 * sin(uTime * 0.55 * uSpeed + 6.2831 * s); }
        float vF1(vec2 p){ vec2 i = floor(p), f = fract(p); float md = 8.0; for(int y=-1;y<=1;y++) for(int x=-1;x<=1;x++){ vec2 n = vec2(float(x),float(y)); md = min(md, length(n + cellPt(hash2(i+n)) - f)); } return md; }
        float vS(vec2 p){ vec2 i = floor(p), f = fract(p); float r = 8.0; for(int y=-1;y<=1;y++) for(int x=-1;x<=1;x++){ vec2 n = vec2(float(x),float(y)); r = smin(r, length(n + cellPt(hash2(i+n)) - f), 0.46); } return r; }
        void main(){
          float m = texture2D(uMask, vUv).a; if (m < 0.08) discard;
          vec2 uv = vWorldPos * uScale + vec2(0.07, -0.23) * uTime * uSpeed;
          float edge = vF1(uv) - vS(uv);
          float t = smoothstep(0.05, 0.15, edge);
          float depth = smoothstep(0.1, 0.9, m); vec3 base = mix(uMid, uDeep, depth * 0.6); vec3 col = mix(base, uHigh, t * 0.85);
          float acc = 0.0;
          for (int i = 0; i < 8; i++) {
            float on = step(float(i), float(uRippleCount) - 0.5);
            float el = max(uTime - uRippleTimes[i], 0.0); float d = length(vWorldPos - uRippleCenters[i]);
            for (int r = 0; r < 2; r++) { float re = max(el - float(r) * 0.18, 0.0); float ring = 1.0 - smoothstep(0.0, 0.07, abs(d - re * 2.4)); acc += ring * exp(-re * 3.0) * on; }
          }
          col = mix(col, uHigh, clamp(acc * 1.4, 0.0, 1.0));
          float rim = 1.0 - smoothstep(0.1, 0.3, m);
          col = mix(col, uDeep * 0.45, rim * 0.85);
          if (uElectric > 0.5) { float fl = step(0.72, fract(sin(dot(floor(vWorldPos * 7.0) + floor(uTime * 24.0), vec2(12.9898, 78.233))) * 43758.5453)); col = mix(col, vec3(1.0, 1.0, 0.65), fl * 0.85); }
          gl_FragColor = vec4(col, mix(0.78, 0.97, max(t, acc)) * smoothstep(0.08, 0.14, m));
        }`
    });
    this.water.cache.set(key, mat); return mat;
  },
  ripple(x, z) {
    if (!this.water) this.waterMat('wet');
    const u = this.water.u, i = this.water.next++ % 8;
    u.uRippleCenters.value[i].set(x, z); u.uRippleTimes.value[i] = u.uTime.value; u.uRippleCount.value = Math.min(8, this.water.next);
  },
  puddleMesh(kind, r) {
    const m = new THREE.Mesh(this.plane1(), this.waterMat(kind, false));
    m.rotation.x = -Math.PI / 2; m.rotation.z = Math.random() * TAU; m.position.y = .02 + Math.random() * .005; m.scale.set(r * 2, r * 2, 1); m.renderOrder = 1;
    this.dyn.add(m); return m;
  },
  /* ---------- varsler på gulvet ---------- */
  telegraph(shape, o) {
    const g = new THREE.Group(); g.position.set(o.x, .035 + Math.random() * .01, o.z); g.rotation.y = o.a || 0;
    const col = o.color || 0xff4a22;
    const edge = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .95, depthWrite: false });
    const ink = new THREE.MeshBasicMaterial({ color: 0x2a1a14, transparent: true, opacity: .8, depthWrite: false });
    const fillM = new THREE.MeshBasicMaterial({ color: col, map: this.tex.hatch, transparent: true, opacity: .55, depthWrite: false }); fillM.map.repeat.set(3, 3);
    const back = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .16, depthWrite: false });
    const flat = m => { m.rotation.x = -Math.PI / 2; g.add(m); return m; };
    let fill;
    if (shape === 'circle') {
      flat(new THREE.Mesh(new THREE.RingGeometry(o.r, o.r + .07, 40), ink)); flat(new THREE.Mesh(new THREE.RingGeometry(o.r - .1, o.r, 40), edge));
      flat(new THREE.Mesh(new THREE.CircleGeometry(o.r, 40), back)); fill = flat(new THREE.Mesh(new THREE.CircleGeometry(o.r, 40), fillM));
      g.userData.update = p => fill.scale.setScalar(Math.max(.01, p));
    } else if (shape === 'rect') {
      const bk = flat(new THREE.Mesh(new THREE.PlaneGeometry(o.w, o.len), back)); bk.position.z = o.len / 2;
      for (const s of [-1, 1]) { const l = flat(new THREE.Mesh(new THREE.PlaneGeometry(.14, o.len), ink)); l.position.set(s * (o.w / 2 + .03), 0, o.len / 2); const l2 = flat(new THREE.Mesh(new THREE.PlaneGeometry(.08, o.len), edge)); l2.position.set(s * o.w / 2, .001, o.len / 2); }
      const e2 = flat(new THREE.Mesh(new THREE.PlaneGeometry(o.w, .1), edge)); e2.position.z = o.len;
      fill = flat(new THREE.Mesh(new THREE.PlaneGeometry(o.w, o.len), fillM));
      g.userData.update = p => { p = Math.max(.01, p); fill.scale.y = p; fill.position.z = o.len * p / 2; };
    } else {
      const st = -Math.PI / 2 - o.arc / 2;
      flat(new THREE.Mesh(new THREE.RingGeometry(o.r, o.r + .07, 32, 1, st, o.arc), ink)); flat(new THREE.Mesh(new THREE.RingGeometry(o.r - .1, o.r, 32, 1, st, o.arc), edge));
      flat(new THREE.Mesh(new THREE.CircleGeometry(o.r, 32, st, o.arc), back)); fill = flat(new THREE.Mesh(new THREE.CircleGeometry(o.r, 32, st, o.arc), fillM));
      g.userData.update = p => fill.scale.setScalar(Math.max(.01, p));
    }
    g.userData.update(0); g.renderOrder = 3; this.dyn.add(g); return g;
  },
  /* ---------- kamera ---------- */
  updateCamera(tx, tz, dt) {
    this.camT.x = lerp(this.camT.x, tx, 1 - Math.pow(.004, dt)); this.camT.z = lerp(this.camT.z, tz, 1 - Math.pow(.004, dt));
    this.trauma = Math.max(0, this.trauma - dt * 1.9);
    const s = this.shakeOn ? this.trauma * this.trauma * .32 * (this.shakeK ?? 1) : 0, t = performance.now() * .05;
    const ox = s * (Math.sin(t * 1.3) + Math.sin(t * 2.9) * .5), oz = s * (Math.cos(t * 1.7) + Math.sin(t * 3.3) * .5), D = 60;
    this.camera.position.set(this.camT.x + ox, Math.sin(CAM_PITCH) * D, this.camT.z + oz + Math.cos(CAM_PITCH) * D);
    this.camera.lookAt(this.camT.x + ox, 0, this.camT.z + oz);
  },
  snapCamera(x, z) { this.camT.x = x; this.camT.z = z; this.updateCamera(x, z, .016); },
  shake(a) { this.trauma = Math.min(1, this.trauma + a); },
  project(x, y, z) {
    const v = new THREE.Vector3(x, y, z).project(this.camera);
    return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight, vis: v.z < 1 };
  },
  mouseToGround(mx, my) {
    if (!this._ray) { this._ray = new THREE.Raycaster(); this._ndc = new THREE.Vector2(); this._pl = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); this._hv = new THREE.Vector3(); }
    this._ndc.set(mx / innerWidth * 2 - 1, -(my / innerHeight) * 2 + 1); this._ray.setFromCamera(this._ndc, this.camera);
    this._ray.ray.intersectPlane(this._pl, this._hv); return { x: this._hv.x, z: this._hv.z };
  },
  remove(obj) { if (obj && obj.parent) obj.parent.remove(obj); }
};

/* ---------- partikler ----------
   Fast kapasitet i én InstancedMesh, med tett bytte ved fjerning: den siste levende
   partikkelen flyttes inn i hullet. Mønsteret er hentet fra
   scottstts/Threejs-Awesome-Graphics-Agent-Skills (MIT), threejs-procedural-vfx. */
const Particles = {
  max: 900, n: 0, d: [], mesh: null, dummy: null, col: null,
  init() {
    if (this.mesh) return;
    this.mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(.12, .12, .12), new THREE.MeshBasicMaterial({ color: 0xffffff }), this.max);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); this.mesh.frustumCulled = false; this.mesh.count = 0;
    this.col = new THREE.Color(); for (let i = 0; i < this.max; i++) { this.mesh.setColorAt(i, this.col.set(0xffffff)); this.d.push({}); }
    this.dummy = new THREE.Object3D(); R.scene.add(this.mesh);
  },
  spawn(x, y, z, n, color, o = {}) {
    if (!this.mesh) return;
    for (let k = 0; k < n; k++) {
      if (this.n >= this.max) break;
      const i = this.n++, p = this.d[i];
      const a = Math.random() * TAU, sp = (o.speed || 4) * (.4 + Math.random() * .8);
      p.x = x; p.y = y; p.z = z; p.vx = Math.cos(a) * sp + (o.vx || 0); p.vz = Math.sin(a) * sp + (o.vz || 0); p.vy = (o.up || 4) * (.5 + Math.random());
      p.life = p.max = (o.life || .6) * (.6 + Math.random() * .6); p.g = o.g === undefined ? 14 : o.g; p.s = (o.size || 1) * (.6 + Math.random() * .8);
      p.flat = !!o.flat; p.rx = Math.random() * 3; p.ry = Math.random() * 3; p.spin = rnd(-12, 12); p.c = color;
      this.mesh.setColorAt(i, this.col.set(color));
    }
    this.mesh.instanceColor.needsUpdate = true;
  },
  update(dt) {
    if (!this.mesh) return;
    let swapped = false;
    for (let i = this.n - 1; i >= 0; i--) {
      const p = this.d[i]; p.life -= dt;
      if (p.life <= 0) { const last = this.n - 1; if (i !== last) { const q = this.d[last]; this.d[last] = p; this.d[i] = q; this.mesh.setColorAt(i, this.col.set(q.c)); swapped = true; } this.n--; continue; }
      p.vy -= p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      if (p.y < .05) { p.y = .05; p.vy *= -.35; p.vx *= .6; p.vz *= .6; }
      p.rx += p.spin * dt; p.ry += p.spin * .7 * dt;
    }
    const D = this.dummy;
    for (let i = 0; i < this.n; i++) {
      const p = this.d[i], sc = p.s * Math.min(1, p.life / p.max * 2);
      D.position.set(p.x, p.y, p.z); D.rotation.set(p.rx, p.ry, 0);
      if (p.flat) D.scale.set(sc * 1.4, sc * .15, sc); else D.scale.setScalar(sc);
      D.updateMatrix(); this.mesh.setMatrixAt(i, D.matrix);
    }
    this.mesh.count = this.n; this.mesh.instanceMatrix.needsUpdate = true;
    if (swapped) this.mesh.instanceColor.needsUpdate = true;
  },
  clear() { this.n = 0; if (this.mesh) this.mesh.count = 0; }
};

/* ---------- flytende tekst og snakkebobler (HTML over lerretet) ---------- */
const FX = {
  items: [],
  text(x, y, z, str, cls = '', life = .9) {
    const el = document.createElement('div'); el.className = 'dmg ' + cls; el.textContent = str; $('fx').appendChild(el);
    this.items.push({ el, x, y, z, life, max: life, vy: 1.6, kind: 'text' });
  },
  bubble(target, str, life = 2.6, cls = '') {
    for (const it of this.items) if (it.target === target && it.kind === 'bubble') it.life = 0;
    const el = document.createElement('div'); el.className = 'bubble ' + cls; el.textContent = str; $('fx').appendChild(el);
    this.items.push({ el, target, life, max: life, kind: 'bubble', h: target.bubbleH || 2.6 });
  },
  update(dt) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i]; it.life -= dt;
      if (it.life <= 0 || (it.target && it.target.alive === false)) { it.el.remove(); this.items.splice(i, 1); continue; }
      let p;
      if (it.kind === 'text') { it.y += it.vy * dt; it.vy *= .96; p = R.project(it.x, it.y, it.z); it.el.style.opacity = Math.min(1, it.life / it.max * 2.5); }
      else p = R.project(it.target.x, it.h, it.target.z);
      it.el.style.left = p.x + 'px'; it.el.style.top = p.y + 'px';
    }
  },
  clear() { for (const it of this.items) it.el.remove(); this.items = []; }
};
