/* ============================================================
   BLEKKVARSEL  -  angrepsvarsler, treff og nedslag i blekk og papir
   Alle varsler (telegrafer) tegnes her med én blekkshader, fargen følger skadetypen, og
   angrepet lander med støv, gnister, sprekker og skrens. Spor A fyller fila i runde 5.

   Varslene: ett InstancedBufferGeometry med 48 plasser og én ShaderMaterial, lagt i R.scene én gang
   (som Particles.mesh), så alle varsler koster ett tegnekall og ingenting lages per varsel.
   Formene regnes som avstandsfelt i shaderen og er de samme som inShape (05_world.js): sirkel, boks fra 0
   til len og kjegle (kakestykke pluss en skive på 0,6). Lagene, fra papiret og opp:
   papirkant utenfor streken (leses på mørke gulv), grunnfarge, skravur i verdensrom bak fronten (kryss etter
   p 0,6), glød innenfra kanten som pulserer fortere mot slutten, vinkler som ruller i angrepsretningen
   (streker for prosjektilbaner), sigillring og sprekker på store angrep, lys front, blekkstreken som tegner seg
   selv den første fjerdedelen og låsen de siste 0,12 sekundene. Når angrepet går av, blir et hvitglødende
   etterbilde liggende 0,18 s. Stanses eieren, løses varselet opp i grått (0,15 s), så spilleren ser at det virket.
   Kvalitet (uKval): 0 (lav, R.lowTex) kant, fyll, front og puls. 1 (middels, telefon, 2D) også inntegning,
   skravur og vinkler. 2 (høy) også blekk som flyter, sigiller og sprekker.
   Reserve: den gamle R.telegraph (04_render.js) med enkel grafikk (R.safe), uten instansiering, når shaderen
   ikke lenker, og når alle 48 plassene er i bruk. Uten 3D lyser varslene opp gulvet med lysplater i lysscenen.
   ============================================================ */

/* skadetypene og fargene deres: alle er lyse nok til å leses på mørke gulv (luminans minst 0,35) */
const TELE_TYPE = {
  fysisk: { i: 0, farge: 0xe0452a }, morb: { i: 1, farge: 0xb36be0 }, strom: { i: 2, farge: 0xffe25a }, gass: { i: 3, farge: 0x8fd6ea }, vann: { i: 4, farge: 0x7ec4f2 }, gift: { i: 5, farge: 0x9fcf3a },
  ild: { i: 6, farge: 0xff7a2a }, lys: { i: 7, farge: 0xe8f4ff }, papir: { i: 8, farge: 0xd94a5c }, natur: { i: 9, farge: 0x8fb85a }, lenke: { i: 10, farge: 0xc8ccd8 }
};
/* alle fargene som står i koden (color: 0x...), oversatt til en skadetype. Mørke farger får en lesbar type */
const TELE_FARGE = {
  0xb3261e: 'fysisk', 0xff4a22: 'fysisk', 0xb8b8b8: 'fysisk', 0x9aa0a6: 'fysisk', 0x8a6a3a: 'fysisk', 0xe9e4d8: 'fysisk', 0x6a5a3a: 'fysisk', 0x8a5a2a: 'fysisk', 0xd49a8a: 'fysisk',
  0xc83a4a: 'fysisk', 0xc86a5a: 'fysisk', 0x3a3a4a: 'fysisk', 0xff3a3a: 'fysisk', 0x6a6258: 'fysisk',
  0xb36be0: 'morb', 0x6b2d8c: 'morb', 0x9a7ac8: 'morb', 0x2a1a30: 'morb', 0x4a2d5a: 'morb', 0xe8a0c0: 'morb',
  0xffe25a: 'strom', 0xcfe0ff: 'strom',
  0x9ad0e0: 'gass', 0xbfe6d8: 'gass', 0x3a2a44: 'gass',
  0x6ac2e0: 'vann', 0x9cc7b4: 'vann', 0x7aa0c0: 'vann', 0x9ab4d8: 'vann', 0x3a6a5a: 'vann',
  0xe8a0a0: 'gift', 0x9cc7a4: 'gift',
  0xff7a2a: 'ild', 0xe07a3a: 'ild',
  0xe8f4ff: 'lys', 0xb8d0e8: 'lys', 0xfff3b0: 'lys', 0xffffff: 'lys', 0xe8e4dc: 'lys', 0xe8dcc0: 'lys',
  0x3a3440: 'papir', 0xcfae6b: 'papir', 0x5a3a2a: 'papir',
  0x6a9a4a: 'natur', 0x3a6a2a: 'natur', 0x6a5038: 'natur', 0xb8c8a8: 'natur', 0x6a4a1a: 'natur',
  0xe8e2d0: 'lenke'
};
/* varsler uten farge tar typen fra eieren */
const TELE_EIER = { kultist: 'morb', yngel: 'morb', oyeblomst: 'morb', journalen: 'morb', oppasser: 'gift', narkose: 'gass', byrakrat: 'papir', stempelboss: 'papir', krok: 'lenke', portier: 'lenke', rust: 'vann' };
/* en farge som ikke står i lista (nye fiender), gjettes fra fargetonen */
function fargeType(hex) {
  const c = new THREE.Color(hex), h = { h: 0, s: 0, l: 0 }; c.getHSL(h); const g = h.h * 360;
  if (h.s < .15) return h.l > .75 ? 'lys' : 'fysisk';
  return g < 20 || g >= 335 ? 'fysisk' : g < 45 ? 'ild' : g < 70 ? 'strom' : g < 160 ? 'natur' : g < 200 ? 'gass' : g < 250 ? 'vann' : 'morb';
}
/* skadetypen til et varsel: o.type, så fargen, så eieren, så fargetonen, ellers fysisk */
function teleType(o, eier) {
  if (o.type && TELE_TYPE[o.type]) return o.type;
  const hex = o.color != null ? new THREE.Color(o.color).getHex() : null;
  if (hex != null && TELE_FARGE[hex]) return TELE_FARGE[hex];
  if (eier && TELE_EIER[eier.type]) return TELE_EIER[eier.type];
  return hex != null ? fargeType(hex) : 'fysisk';
}

const BLEKK_VS = `
  attribute vec4 aA; attribute vec4 aB; attribute vec4 aC; attribute vec4 aD; attribute vec3 aCol; attribute vec3 aTint;
  uniform float uPx;
  varying vec4 vL; varying vec4 vB; varying vec4 vC; varying vec4 vD; varying vec3 vCol; varying vec3 vTint;
  void main() {
    vB = aB; vC = aC; vD = vec4(aD.xyz, aA.w); vCol = aCol; vTint = aTint; vL = vec4(0.0);
    if (aA.w < -0.5) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; } // ledig plass
    // rammen rundt formen i formens eget rom (x til siden, y forover), med plass til papirkanten og etterbildet
    float m = 0.1 + 9.0 * uPx, g = 1.07, r = aB.x; vec2 lo, hi;
    if (aA.w > 0.5 && aA.w < 1.5) { lo = vec2(-r * 0.5 * g - m, -aB.y * 0.04 - m); hi = vec2(r * 0.5 * g + m, aB.y * 1.04 + m); }
    else if (aA.w > 1.5) { float h = min(aB.z * 0.5, 3.14159), d0 = min(0.6, r); lo = vec2(-(h >= 1.5708 ? r : max(d0, r * sin(h))), min(-d0, r * cos(h))) * g - m; hi = vec2(-lo.x, r * g + m); }
    else { lo = vec2(-r * g - m); hi = -lo; }
    vec2 L = mix(lo, hi, position.xy + 0.5);
    float s = sin(aA.z), c = cos(aA.z);
    vec3 W = vec3(aA.x + L.x * c + L.y * s, aD.z, aA.y - L.x * s + L.y * c);
    vL = vec4(L, W.xz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(W, 1.0);
  }`;
const BLEKK_FS = `
  uniform float uPx, uKval;
  varying vec4 vL; varying vec4 vB; varying vec4 vC; varying vec4 vD; varying vec3 vCol; varying vec3 vTint;
  float h1(float n) { return fract(sin(n) * 43758.5453); }
  float h2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float sto(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h2(i), h2(i + vec2(1.0, 0.0)), f.x), mix(h2(i + vec2(0.0, 1.0)), h2(i + vec2(1.0, 1.0)), f.x), f.y); }
  // kakestykke med halv åpning h og radius r, spissen i origo og midten langs +y (Inigo Quilez, sdPie)
  float pai(vec2 p, float h, float r) { vec2 c = vec2(sin(h), cos(h)); p.x = abs(p.x); float l = length(p) - r, m = length(p - c * clamp(dot(p, c), 0.0, r)); return max(l, m * sign(c.y * p.x - c.x * p.y)); }
  vec3 Cp; float A;
  void lag(vec3 c, float a) { a = clamp(a, 0.0, 1.0); Cp = c * a + Cp * (1.0 - a); A = a + A * (1.0 - a); }
  void main() {
    Cp = vec3(0.0); A = 0.0;
    float form = vD.w, st = vC.z, t = vC.y, p = vC.x, fro = vC.w, typ = vB.w, px = uPx, stor = vD.y, dur = max(vD.x, 0.05);
    float k1 = (st > 0.5 && st < 1.5) ? clamp(t / 0.18, 0.0, 1.0) : 0.0, k2 = st > 1.5 ? clamp(t / 0.15, 0.0, 1.0) : 0.0, sk = 1.0 + 0.06 * k1;
    vec2 L = vL.xy / sk, W = vL.zw;
    float R0 = vB.x, len = max(vB.y, 0.01), h = min(vB.z * 0.5, 3.14159), rad = length(L), ang = atan(L.x, L.y);
    // d: avstand til kanten (negativ inne), f: hvor langt fronten har kommet (0 til 1), u: hvor på omrisset (0 til 1), df: avstand til fronten
    float d, f, u, df;
    if (form < 0.5) { d = rad - R0; f = rad / R0; u = fract(ang / 6.28318 + 0.5 + fro); df = rad - p * R0; }
    else if (form < 1.5) { vec2 q = abs(L - vec2(0.0, len * 0.5)) - vec2(R0 * 0.5, len * 0.5); d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0); f = L.y / len; u = clamp(f, 0.0, 1.0); df = L.y - p * len; }
    else { d = min(pai(L, h, R0), rad - min(0.6, R0)); f = rad / R0; u = rad < R0 - 0.2 ? 0.5 * rad / R0 : 0.5 + 0.5 * (1.0 - clamp(abs(ang) / max(h, 0.01), 0.0, 1.0)); df = rad - p * R0; }
    d *= sk;
    float rimW = px * 3.0;
    if (d > rimW + px * 7.0) discard; // tidlig ut utenfor papirkanten
    // streken: litt ujevn bredde som en penn, blekket flyter ut på høy kvalitet, taggete for strøm og boblende for gass og vann
    float dr = d;
    if (uKval > 0.5) rimW *= 0.8 + 0.55 * sto(vec2(u * 38.0, fro * 9.0));
    if (uKval > 1.5) dr += (sto(W * 2.2 + fro * 17.0) - 0.5) * 0.04;
    if (abs(typ - 2.0) < 0.5) dr += (h1(floor(u * 60.0) + floor(t * 16.0) * 7.0 + fro) - 0.5) * 0.08;
    else if (typ > 2.5 && typ < 4.5) dr += sin(u * 90.0 + t * 5.0) * 0.022;
    float inn = 1.0 - smoothstep(-px, px, d), ink = 1.0 - smoothstep(rimW * 0.5, rimW * 0.5 + px * 1.2, abs(dr));
    vec3 blekk = vec3(0.09, 0.055, 0.045), papir = vec3(0.97, 0.93, 0.84), hvit = vec3(1.0, 0.97, 0.88), col = vCol;
    float halo = (1.0 - smoothstep(rimW * 0.5 + px, rimW * 0.5 + px * 5.0, dr)) * step(0.0, dr);
    if (st > 1.5) { // stanset: løses opp i grått
      float n = sto(W * 4.5 + fro * 11.0), grense = k2 * 1.15;
      if (n < grense) discard;
      float brenn = (1.0 - smoothstep(0.0, 0.1, n - grense)) * step(0.02, k2); vec3 gra = vec3(0.55, 0.53, 0.5);
      lag(papir, halo * 0.4 * (1.0 - k2)); lag(gra, inn * 0.25); lag(gra, ink * 0.9); lag(blekk, brenn * max(inn, ink) * 0.85);
    } else if (st > 0.5) { // gikk av: hvitglødende etterbilde som vokser litt og blekner til typefargen
      float e = 1.0 - k1;
      lag(papir, halo * 0.5 * e); lag(mix(hvit, col, k1), inn * (0.28 + 0.45 * exp(d / 0.18)) * e); lag(mix(hvit, col, k1 * 0.6), ink * e);
    } else {
      float fase = 6.28318 * (5.0 * t + 17.0 * t * t * t / (3.0 * dur * dur)), puls = 0.5 + 0.5 * sin(fase);
      float rest = (1.0 - p) * dur, las = 1.0 - smoothstep(0.0, 0.12, rest), blink = step(0.5, fract(t * 24.0));
      lag(papir, halo * 0.6);
      lag(col, inn * (0.13 + 0.1 * puls + 0.12 * las));
      // feid område bak fronten
      float feid = inn * (1.0 - smoothstep(p - 0.015, p, f)); vec3 skr = mix(mix(col, vTint, 0.3), blekk, 0.12);
      if (uKval > 0.5) {
        float sp = 0.3, q1 = abs(fract((W.x + W.y) * 0.7071 / sp) - 0.5) * sp, q2 = abs(fract((W.x - W.y) * 0.7071 / sp) - 0.5) * sp;
        float s1 = 1.0 - smoothstep(0.03, 0.03 + px * 1.5, q1), s2 = (1.0 - smoothstep(0.03, 0.03 + px * 1.5, q2)) * smoothstep(0.6, 0.75, p);
        lag(skr, feid * (0.14 + 0.5 * max(s1, s2)));
      } else lag(skr, feid * 0.3);
      // glød innenfra kanten
      float glo = inn * exp(d / (0.18 + 0.12 * stor));
      if (abs(typ - 6.0) < 0.5) glo *= 0.75 + 0.5 * sto(vec2(t * 9.0, u * 8.0));
      lag(mix(col, hvit, 0.2 * puls + 0.55 * las), glo * (0.3 + 0.35 * puls + 0.35 * las));
      // rektangler: vinkler som ruller mot målet, tynne streker i prosjektilbaner, og en pil ytterst
      if (form > 0.5 && form < 1.5) {
        float w2 = R0 * 0.5, ax = abs(L.x);
        if (uKval > 0.5) {
          if (R0 >= 0.6) { float cs = max(0.6, R0 * 0.6), b = fract((L.y - ax * 0.9) / cs - t * 2.4); lag(mix(col, hvit, 0.45), smoothstep(0.0, 0.06, b) * (1.0 - smoothstep(0.2, 0.26, b)) * (1.0 - smoothstep(w2 * 0.7, w2 * 0.78, ax)) * inn * (0.45 + 0.3 * puls)); }
          else lag(mix(col, hvit, 0.6), step(fract(L.y / 0.7 - t * 3.5), 0.5) * (1.0 - smoothstep(w2 * 0.3, w2 * 0.3 + px, ax)) * inn * 0.85);
        }
        float sl = min(len * 0.3, max(0.5, R0 * 0.9)), rom = len - L.y;
        lag(mix(col, hvit, 0.5), step(0.0, rom) * step(rom, sl) * (1.0 - smoothstep(rom * 0.55 - px, rom * 0.55 + px, ax)) * inn * 0.55);
      }
      // store angrep: sigillring som dreier sakte, og sprekker som vokser fra midten
      if (stor > 0.5 && uKval > 1.5 && (form < 0.5 || form > 1.5)) {
        float rr = rad / R0, a2 = ang + t * 0.35 * (fro > 0.5 ? 1.0 : -1.0), seg = floor(R0 * 14.0), sa = (a2 / 6.28318 + 0.5) * seg, cell = floor(sa);
        float cw = 6.28318 * rad / seg, bw = 0.1 * R0, X = (fract(sa) - 0.5) * cw, Y = (rr - 0.85) * R0, lw = px * 1.3, g = h1(cell * 3.1 + fro * 40.0), gy = 0.0;
        if (abs(Y) < bw * 0.5) {
          if (g < 0.3) gy = 1.0 - smoothstep(lw, lw + px, abs(X));
          else if (g < 0.55) gy = 1.0 - smoothstep(lw, lw + px, min(abs(X - Y), abs(X + Y)) * 0.7071);
          else if (g < 0.8) gy = 1.0 - smoothstep(lw, lw + px, abs(length(vec2(X, Y)) - bw * 0.3));
          else gy = (1.0 - smoothstep(lw, lw + px, abs(Y))) * step(abs(X), cw * 0.3);
        }
        float ringer = 1.0 - smoothstep(lw, lw + px, min(abs(rad - 0.8 * R0), abs(rad - 0.9 * R0))), fram = smoothstep(0.0, 0.3, p);
        lag(blekk, ringer * inn * 0.6 * fram); lag(mix(col, hvit, 0.3 * puls), gy * inn * 0.8 * fram);
        float ns = 9.0, kk = floor((ang / 6.28318 + 0.5) * ns), ai = ((kk + 0.5 + (h1(kk + fro * 7.0) - 0.5) * 0.7) / ns - 0.5) * 6.28318;
        float off = abs((ang - ai) * rad + (sto(vec2(rad * 2.5, kk * 3.0 + fro * 5.0)) - 0.5) * 0.3), sprekk = step(rad, p * R0 * 0.95) * smoothstep(0.15, 0.3, rad) * inn;
        lag(blekk, (1.0 - smoothstep(px * 1.2, px * 2.4, off)) * sprekk * 0.85); lag(mix(col, hvit, 0.6), (1.0 - smoothstep(px * 0.3, px * 0.9, off)) * sprekk * (0.4 + 0.5 * puls));
      }
      // fronten: en lys linje der fyllet er kommet
      float ok = step(0.01, p) * step(p, 0.995);
      lag(col, inn * exp(-abs(df) / 0.1) * 0.25 * ok);
      lag(mix(col, hvit, 0.65), (1.0 - smoothstep(px, px * 3.0, abs(df))) * inn * ok * 0.95);
      // fargekanten innenfor streken er med fra start, så formen leses med en gang
      float e = -dr - rimW * 0.5;
      lag(mix(col, hvit, 0.15 + 0.45 * las * blink), smoothstep(-px, 0.0, e) * (1.0 - smoothstep(px * 4.0, px * 5.0, e)) * 0.95);
      if (abs(typ - 8.0) < 0.5) lag(col, (1.0 - smoothstep(rimW * 0.4, rimW * 0.4 + px, abs(dr + 0.16))) * 0.9); // papir: dobbel stempelring
      // blekkstreken tegner seg selv den første fjerdedelen
      float tegn = uKval > 0.5 ? clamp(p / 0.25, 0.0, 1.0) : 1.0, tegnet = tegn >= 1.0 ? 1.0 : 1.0 - smoothstep(tegn - 0.03, tegn, u);
      float ledd = abs(typ - 10.0) < 0.5 ? 0.3 + 0.7 * step(0.18, abs(fract(u * (form > 0.5 && form < 1.5 ? len : 6.28318 * R0) / 0.34) - 0.5)) : 1.0; // lenke: kjettingledd
      lag(mix(blekk, hvit, las * blink), ink * tegnet * ledd * 0.95);
      if (abs(typ - 7.0) < 0.5) lag(hvit, pow(max(0.0, sin(u * 44.0 + t * 3.0)), 30.0) * (1.0 - smoothstep(rimW, rimW * 2.5, abs(dr)))); // lys: glimt i kanten
      lag(hvit, inn * las * (0.16 + 0.2 * blink)); // låsen
    }
    if (A < 0.004) discard;
    gl_FragColor = vec4(Cp / A, A);
  }`;

const Blekk = {
  N: 48, S: [], mesh: null, geo: null, mat: null, lys: null, av: false, brutt: false, sjekket: false,
  u: { uPx: { value: .02 }, uKval: { value: 1 } },
  FORM: { circle: 0, rect: 1, cone: 2 },
  get ledige() { let n = this.mesh ? 0 : this.N; for (const s of this.S) if (!s.bruk) n++; return n; },
  kval() { if (R.lowTex) return 0; if (!D3.on) return 1; const k = D3.kval(); return k === 'lav' ? 0 : k === 'hoy' && !R.coarse && !R.tv ? 2 : 1; },
  /* kan varslene tegnes her? Ikke med enkel grafikk, uten instansiering eller når shaderen ikke lenket */
  kan() {
    if (this.av || this.brutt || R.safe || !R.renderer || !R.scene) return false;
    if (this.inst === undefined) { const r = R.renderer; this.inst = !!(r.capabilities.isWebGL2 || r.extensions.get('ANGLE_instanced_arrays')); }
    return this.inst && this.init();
  },
  /* lages én gang, første gang et varsel trengs, og blir liggende (som partiklene) */
  init() {
    if (this.mesh) return true;
    try {
      const N = this.N, g = this.geo = new THREE.InstancedBufferGeometry(), P = new THREE.PlaneGeometry(1, 1);
      g.setIndex(P.index); g.setAttribute('position', P.attributes.position);
      const at = (navn, k) => { const a = new THREE.InstancedBufferAttribute(new Float32Array(N * k), k); a.setUsage(THREE.DynamicDrawUsage); g.setAttribute(navn, a); return a; };
      this.aA = at('aA', 4); this.aB = at('aB', 4); this.aC = at('aC', 4); this.aD = at('aD', 4); this.aCol = at('aCol', 3); this.aTint = at('aTint', 3);
      for (let i = 0; i < N; i++) { this.aA.array[i * 4 + 3] = -1; this.S.push({ i, bruk: false }); }
      g.instanceCount = 0;
      this.mat = new THREE.ShaderMaterial({ name: 'Blekkvarsel', uniforms: this.u, vertexShader: BLEKK_VS, fragmentShader: BLEKK_FS, transparent: true, depthWrite: false, side: THREE.DoubleSide });
      const m = this.mesh = new THREE.Mesh(g, this.mat); m.frustumCulled = false; m.renderOrder = 3; m.visible = false; m.onAfterRender = () => this.sjekk(); R.scene.add(m);
      // lysplatene uten 3D: varslene lyser opp gulvet i stedet for å bli mørklagt av lyset. Ikke i R.kilder (3D-lysene)
      const L = this.lys = new THREE.InstancedMesh(R.plane1(), new THREE.MeshBasicMaterial({ map: R.tex.pool, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false }), N);
      L.instanceMatrix.setUsage(THREE.DynamicDrawUsage); L.frustumCulled = false; L.count = 0; L.visible = false; this.lc = new THREE.Color(0); for (let i = 0; i < N; i++) L.setColorAt(i, this.lc);
      this.dummy = new THREE.Object3D(); R.lscene.add(L);
    } catch (e) { this.brutt = true; return false; }
    return true;
  },
  /* lenket shaderen? Sjekkes etter første tegning; ellers tar den gamle tegningen over */
  sjekk() {
    if (this.sjekket) return; this.sjekket = true;
    try { const pr = R.renderer.properties.get(this.mat).program; if (pr && pr.diagnostics && !pr.diagnostics.runnable) this.knekk(); } catch (e) { }
  },
  knekk() { this.brutt = true; if (this.mesh) this.mesh.visible = false; if (this.lys) this.lys.visible = false; },
  /* en plass til et nytt varsel, eller null (da tegnes det på den gamle måten) */
  ta(shape, o, dur, eier) {
    if (this.FORM[shape] === undefined || !this.kan()) return null;
    const s = this.S.find(s => !s.bruk); if (!s) return null;
    const typ = teleType(o, eier), T = TELE_TYPE[typ], i = s.i;
    Object.assign(s, { bruk: true, shape, o, eier, dur: dur || 1, p: 0, t: 0, state: 0, typ, fro: Math.random(), stor: (o.r || 0) >= 2.2 || !!(eier && (eier.kind === 'boss' || eier.mini)), logg: null });
    const B = this.aB.array, D = this.aD.array, c = this.lc.set(T.farge), tint = o.color != null ? new THREE.Color(o.color) : c;
    B[i * 4] = shape === 'rect' ? o.w : o.r; B[i * 4 + 1] = o.len || 0; B[i * 4 + 2] = o.arc || 0; B[i * 4 + 3] = T.i;
    D[i * 4] = s.dur; D[i * 4 + 1] = s.stor ? 1 : 0; D[i * 4 + 2] = .036 + (i % 8) * .001; D[i * 4 + 3] = 0;
    this.aCol.setXYZ(i, c.r, c.g, c.b); this.aTint.setXYZ(i, tint.r, tint.g, tint.b);
    for (const a of [this.aB, this.aD, this.aCol, this.aTint]) { a.updateRange.count = -1; a.needsUpdate = true; }
    const h = { isBlekk: true, s, g: null, kastet: false, userData: {} }; h.userData.update = p => this.oppdater(h, p); s.h = h;
    this.skriv(s); this.vis(); return h;
  },
  oppdater(h, p) {
    if (h.g) return h.g.userData.update(p);
    const s = h.s; if (!s || s.h !== h) return;
    if (!this.kan()) { this.tilGammel(h); return h.g && h.g.userData.update(p); } // enkel grafikk ble slått på, eller shaderen lenket ikke
    s.p = p;
  },
  /* varselet flyttes over til den gamle tegningen */
  tilGammel(h) { const s = h.s; if (!s) return; const shape = s.shape, o = s.o, eier = s.eier; this.fri(s); h.s = null; h.g = gammelTele(shape, o, eier); },
  /* varselet er ferdig: etterbilde når det går av, grå oppløsning når det avbrytes, rett ut når etasjen ryddes */
  slipp(h, how) {
    const s = h.s; h.s = null; if (!s || s.h !== h) return;
    if (how === 'fyr' && this.mesh.visible) { s.state = 1; s.t = 0; s.p = 1; }
    else if (how === 'avbryt' && this.mesh.visible) { s.state = 2; s.t = 0; }
    else this.fri(s);
    s.h = null;
  },
  fri(s, dt = 0) { if (!s.bruk) return; s.logg = { state: s.state, t: s.t, dt }; s.bruk = false; s.h = null; s.o = s.eier = null; this.aA.array[s.i * 4 + 3] = -1; },
  tom() { for (const s of this.S) this.fri(s); this.vis(); },
  skriv(s) {
    const i = s.i * 4, o = s.o, A = this.aA.array, C = this.aC.array;
    A[i] = s.x = o.x; A[i + 1] = s.z = o.z; A[i + 2] = s.shape === 'circle' ? 0 : (o.a || 0); A[i + 3] = this.FORM[s.shape];
    C[i] = s.p; C[i + 1] = s.t; C[i + 2] = s.state; C[i + 3] = s.fro;
  },
  tick(dt) {
    if (!this.mesh) return;
    if (this.brutt || R.safe) { for (const s of this.S) if (s.bruk && !s.h) this.fri(s); } // etterbilder og oppløsninger forsvinner med shaderen
    for (const s of this.S) {
      if (!s.bruk) continue; s.t += dt;
      if ((s.state === 1 && s.t >= .18) || (s.state === 2 && s.t >= .15)) { this.fri(s, dt); continue; }
      this.skriv(s);
    }
    this.vis();
  },
  /* sender det som er endret til skjermkortet, og lysplatene uten 3D */
  vis() {
    if (!this.mesh) return;
    let maks = -1; for (const s of this.S) if (s.bruk) maks = s.i;
    const n = maks + 1, synlig = n > 0 && !R.safe && !this.brutt;
    this.geo.instanceCount = n; this.mesh.visible = synlig;
    for (const a of [this.aA, this.aC]) { a.updateRange.offset = 0; a.updateRange.count = n * a.itemSize; a.needsUpdate = true; }
    const c = R.camera; this.u.uPx.value = (c.top - c.bottom) / Math.max(.001, c.zoom) / Math.max(1, R.renderer.domElement.height); this.u.uKval.value = this.kval();
    const L = this.lys, lysPa = synlig && !D3.on && R.lightsOn; L.visible = lysPa; if (!lysPa) { L.count = 0; return; }
    let k = 0; const M = this.dummy;
    for (const s of this.S) {
      if (!s.bruk || s.state === 2) continue;
      const o = s.o, a = s.shape === 'circle' ? 0 : (o.a || 0), fx = Math.sin(a), fz = Math.cos(a), t = s.t, d = Math.max(.05, s.dur);
      const puls = .5 + .5 * Math.sin(TAU * (5 * t + 17 * t * t * t / (3 * d * d))), las = s.state ? 0 : 1 - clamp((1 - s.p) * d / .12, 0, 1);
      const sty = s.state === 1 ? .9 * (1 - Math.min(1, t / .18)) : .22 + .22 * puls + .4 * las;
      if (s.shape === 'rect') { M.position.set(s.x + fx * o.len / 2, 0, s.z + fz * o.len / 2); M.scale.set(o.w + 1, o.len + 1, 1); }
      else if (s.shape === 'cone') { M.position.set(s.x + fx * o.r * .45, 0, s.z + fz * o.r * .45); M.scale.set(o.r * 2.2, o.r * 2.2, 1); }
      else { M.position.set(s.x, 0, s.z); M.scale.set(o.r * 2.5, o.r * 2.5, 1); }
      M.rotation.set(-Math.PI / 2, 0, a); M.updateMatrix(); L.setMatrixAt(k, M.matrix);
      L.setColorAt(k, this.lc.set(TELE_TYPE[s.typ].farge).multiplyScalar(sty)); k++;
    }
    L.count = k; L.instanceMatrix.needsUpdate = true; if (L.instanceColor) L.instanceColor.needsUpdate = true;
  },
  /* plassen til et varsel (t fra addTele), til testene */
  finn(t) { const h = t && t.mesh; return h && h.isBlekk ? h.s : null; },
  /* formen slik shaderen tegner den (uten blekkets ujevnheter): negativ inne. Speiler inShape */
  avstand(s, x, z) {
    const o = s.o, a = s.shape === 'circle' ? 0 : (o.a || 0), dx = x - s.x, dz = z - s.z, fx = Math.sin(a), fz = Math.cos(a), y = dx * fx + dz * fz, xs = dx * fz - dz * fx, rad = Math.hypot(xs, y);
    if (s.shape === 'circle') return rad - o.r;
    if (s.shape === 'rect') { const qx = Math.abs(xs) - o.w / 2, qy = Math.abs(y - o.len / 2) - o.len / 2; return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0); }
    const h = Math.min(o.arc / 2, Math.PI), cx = Math.sin(h), cy = Math.cos(h), px = Math.abs(xs), l = rad - o.r, dp = clamp(px * cx + y * cy, 0, o.r), m = Math.hypot(px - cx * dp, y - cy * dp);
    return Math.min(Math.max(l, m * Math.sign(cy * px - cx * y)), rad - Math.min(.6, o.r));
  },
  inni(s, x, z) { return this.avstand(s, x, z) < 0; }
};

/* den gamle tegningen (04_render.js), med typefargen og uten å miste eieren av syne */
const _gammelTele = R.telegraph;
function gammelTele(shape, o, eier) {
  const g = _gammelTele.call(R, shape, Object.assign({}, o, { color: TELE_TYPE[teleType(o, eier)].farge }));
  if (o.folg) { const u = g.userData.update; g.userData.update = p => { g.position.x = o.x; g.position.z = o.z; u(p); }; }
  return g;
}
R.telegraph = function (shape, o, dur, eier) { return Blekk.ta(shape, o, dur, eier) || gammelTele(shape, o, eier); };
{
  const _kast = R.kastTele;
  R.kastTele = function (g, how, t) {
    if (g && g.isBlekk) { if (g.kastet) return; g.kastet = true; if (g.g) _kast.call(R, g.g, how, t); else Blekk.slipp(g, how); return; }
    return _kast.call(this, g, how, t);
  };
  const _ut = updateTele; updateTele = function (dt) { _ut(dt); Blekk.tick(dt); };
  const _cf = clearFloor; clearFloor = function () { const r = _cf.apply(this, arguments); Blekk.tom(); return r; };
}

Object.assign(window, { addTele, cancelTeles, updateTele, inShape, slashFx, VFX, Blekk, TELE_TYPE, TELE_FARGE, teleType }); // til testene
