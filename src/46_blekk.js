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
    vec2 rundt = vec2(cos(u * 6.28318), sin(u * 6.28318)); // går rundt uten skjøt der omrisset begynner
    if (uKval > 0.5) rimW *= 0.8 + 0.55 * sto(rundt * 6.0 + fro * 9.0);
    if (uKval > 1.5) dr += (sto(W * 2.2 + fro * 17.0) - 0.5) * 0.04;
    if (abs(typ - 2.0) < 0.5) dr += (h1(floor(u * 60.0) + floor(t * 16.0) * 7.0 + fro) - 0.5) * 0.08;
    else if (typ > 2.5 && typ < 4.5) dr += sin(u * 6.28318 * 14.0 + t * 5.0) * 0.015;
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
      lag(col, inn * (0.15 + 0.1 * puls + 0.12 * las));
      // feid område bak fronten
      float feid = inn * (1.0 - smoothstep(p - 0.015, p, f)); vec3 skr = mix(mix(col, vTint, 0.3), blekk, 0.12);
      if (uKval > 0.5) {
        float sp = 0.3, q1 = abs(fract((W.x + W.y) * 0.7071 / sp) - 0.5) * sp, q2 = abs(fract((W.x - W.y) * 0.7071 / sp) - 0.5) * sp;
        float s1 = 1.0 - smoothstep(0.03, 0.03 + px * 1.5, q1), s2 = (1.0 - smoothstep(0.03, 0.03 + px * 1.5, q2)) * smoothstep(0.6, 0.75, p);
        lag(skr, feid * (0.2 + 0.55 * max(s1, s2)));
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
    try { const q = R.renderer.properties.get(this.mat), pr = q.currentProgram || q.program; if (pr && pr.diagnostics && !pr.diagnostics.runnable) this.knekk(); } catch (e) { }
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
      const sty = s.state === 1 ? .6 * (1 - Math.min(1, t / .18)) : .1 + .12 * puls + .3 * las;
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

/* ============================================================
   NEDSLAG  -  angrepet lander med tyngde
   Når et varsel går av (R.kastTele med 'fyr', ikke o.stille), sprutes blekkpartikler langs omrisset etter skadetypen:
   støv og gulvflis (fysisk), gnister og korte lyn på kanten (strøm), en blå sky (gass og vann), fiolette gløder som stiger
   (morb), gløder og røyk (ild), papirbiter (papir) og så videre. Antallet følger arealet og Glod.kvote(), som er 0 med
   enkel grafikk og lav tekstur. Store angrep (r 2,2 eller mer, eller en sjef) setter et merke i gulvet (sprekk, svimerke
   eller blekksøl, 12 plasser i én InstancedMesh som blekner over 5 s), en sjokkbølge (følger Forvrengning) og rister
   skjermen etter avstanden til spilleren. Et løp (fienden stormer langs banen) gir støv bakover og skrensemerker,
   en prosjektilbane bare et lite munningsblaff. Tunge treff på spilleren (over 15 % av livet) fryser bildet 0,05 s og
   viser treffstjerna. Prosjektilene får en liten skygge på gulvet, så kast i bue viser hvor de lander.
   Alt lages én gang og blir liggende (arket, meshen for merkene og skyggene), ingenting per nedslag.
   ============================================================ */
/* partiklene per type: [form, farge, andel, fart ut, opp, tyngde, liv, størrelse] */
const NED_TYPE = {
  fysisk: [['stov', 0xcbbba2, .6, 2.4, 1.4, 1.2, .9, 1.4], ['papir', 0x4a3a2c, .4, 4.6, 5, 16, .7, .55]],
  strom: [['gnist', 0xffd23a, .85, 6.5, 3.5, 9, .4, 1.05], ['stov', 0xd8e4f0, .15, 1.6, 1, 0, .6, 1]],
  gass: [['stov', 0x9fdcec, 1, 1.8, 1.2, -1.2, 1.1, 1.8]],
  vann: [['drape', 0x7ec4f2, .55, 4, 4.5, 14, .6, .8], ['stov', 0xbfe2f4, .45, 1.8, 1, 0, .9, 1.5]],
  gift: [['drape', 0x9fcf3a, .6, 3.6, 4, 13, .6, .8], ['stov', 0xb8d890, .4, 1.6, 1, -.5, 1, 1.5]],
  morb: [['gnist', 0xc88af0, .7, 1.4, 2.2, -3, 1.1, .7], ['stov', 0x8a5aa8, .3, 1.4, 1, -.8, 1, 1.4]],
  ild: [['gnist', 0xffa040, .6, 2.6, 3.5, -2, .9, .7], ['stov', 0x3a3230, .4, 1.2, 1.6, -1.5, 1.2, 1.6]],
  lys: [['gnist', 0xfff8e0, .8, 5, 3, 6, .4, .7], ['stov', 0xf4ecd8, .2, 1.6, 1, -.5, .8, 1.4]],
  papir: [['papir', 0xefe4c4, .75, 3.4, 5, 5, 1.1, .9], ['stov', 0xd8ccb0, .25, 1.8, 1, 1, .8, 1.3]],
  natur: [['papir', 0x8fb85a, .5, 3, 4.5, 6, 1, .8], ['stov', 0xb8a888, .5, 2, 1.4, 1, .9, 1.4]],
  lenke: [['gnist', 0xeef2fa, .6, 5.5, 3.5, 12, .35, .6], ['stov', 0xc8ccd8, .4, 2, 1.2, 1, .8, 1.3]]
};
/* merket i gulvet per type: 0 sprekk, 1 svimerke, 2 blekksøl (3 er skrensemerker etter et løp) */
const NED_MERKE = { fysisk: 0, papir: 0, natur: 0, lenke: 0, ild: 1, strom: 1, lys: 1, morb: 2, gass: 2, vann: 2, gift: 2 };
const NED_VS = `attribute vec2 aDek; varying vec2 vUv; varying vec3 vCol; varying float vA;
void main() {
  float f = aDek.x; vUv = vec2(mod(f, 2.0), 1.0 - floor(f / 2.0)) * 0.5 + uv * 0.5;
  #ifdef USE_INSTANCING_COLOR
  vCol = instanceColor;
  #else
  vCol = vec3(1.0);
  #endif
  vA = aDek.y; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
}`;
const NED_FS = `uniform sampler2D uArk; uniform vec3 uBlekk; varying vec2 vUv; varying vec3 vCol; varying float vA;
void main() {
  vec3 t = texture2D(uArk, vUv).rgb; float dekk = max(t.r, t.g), a = dekk * vA; if (a < 0.02) discard;
  gl_FragColor = vec4(mix(vCol, uBlekk, t.g / max(dekk, 0.001)), a);
}`;
const Nedslag = {
  N: 12, M: [], mesh: null, aDek: null, skygger: null, ko: [], tall: { land: 0, partikler: 0, merker: 0, gjenbruk: 0, sjokk: 0, lyn: 0, tunge: 0, lop: 0, baner: 0 },
  /* hvor mange merker som synes nå */
  get levende() { let n = 0; for (const m of this.M) if (m.t < m.liv) n++; return n; },
  kan() { return !R.safe && !!R.scene && !!Particles.mesh; },
  /* meshen for merkene og arket med de fire tegningene lages første gang et stort angrep lander, og blir liggende */
  init() {
    if (this.mesh) return true; if (this.brutt) return false;
    try {
      const N = this.N, g = new THREE.PlaneGeometry(1, 1), a = this.aDek = new THREE.InstancedBufferAttribute(new Float32Array(N * 2), 2); a.setUsage(THREE.DynamicDrawUsage); g.setAttribute('aDek', a);
      const mat = new THREE.ShaderMaterial({ name: 'Nedslagsmerker', uniforms: { uArk: { value: this.ark() }, uBlekk: { value: new THREE.Color(0x1c1410) } }, vertexShader: NED_VS, fragmentShader: NED_FS, transparent: true, depthWrite: false });
      const m = this.mesh = new THREE.InstancedMesh(g, mat, N); m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(N * 3), 3); m.instanceColor.setUsage(THREE.DynamicDrawUsage);
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; m.renderOrder = 1; m.count = 0; R.scene.add(m);
      for (let i = 0; i < N; i++) this.M.push({ i, t: 99, liv: 0 });
      this.dummy = new THREE.Object3D(); this.c = new THREE.Color();
    } catch (e) { this.brutt = true; return false; }
    return true;
  },
  /* arket på 256 x 256: rødt er fyll (får typefargen), grønt er blekk. Sprekk, svimerke, blekksøl og skrensemerker */
  ark() {
    const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); let fro = 7;
    const rng = () => (fro = (fro * 16807) % 2147483647) / 2147483647, celle = (i, f) => { x.save(); x.translate((i % 2) * 128 + 64, (i >> 1) * 128 + 64); f(); x.restore(); };
    x.fillStyle = '#000'; x.fillRect(0, 0, 256, 256); x.globalCompositeOperation = 'lighter'; x.lineJoin = x.lineCap = 'round';
    const sky = (r, rgb, a0) => { const g = x.createRadialGradient(0, 0, 0, 0, 0, r); g.addColorStop(0, `rgba(${rgb},${a0})`); g.addColorStop(.6, `rgba(${rgb},${a0 * .5})`); g.addColorStop(1, `rgba(${rgb},0)`); x.fillStyle = g; x.beginPath(); x.arc(0, 0, r, 0, TAU); x.fill(); };
    const rift = (r0, r1, a, w, gren) => { let r = r0, v = a; x.beginPath(); x.moveTo(Math.cos(v) * r, Math.sin(v) * r); while (r < r1) { r += 5 + rng() * 7; v += (rng() - .5) * .5; x.lineTo(Math.cos(v) * r, Math.sin(v) * r); if (gren && rng() < .25) { const s = x.lineWidth; x.stroke(); x.lineWidth = s * .55; x.beginPath(); x.moveTo(Math.cos(v) * r, Math.sin(v) * r); x.lineTo(Math.cos(v + .5) * (r + 12), Math.sin(v + .5) * (r + 12)); x.stroke(); x.lineWidth = s; x.beginPath(); x.moveTo(Math.cos(v) * r, Math.sin(v) * r); } } x.stroke(); };
    // sprekk: støvring med typefargen, knust midte og sprekker med greiner i blekk
    celle(0, () => {
      sky(60, '255,0,0', .35); x.strokeStyle = 'rgb(0,255,0)';
      for (let k = 0; k < 9; k++) { x.lineWidth = 1.8 + rng() * 1.3; rift(6 + rng() * 6, 40 + rng() * 20, k / 9 * TAU + rng() * .4, 0, true); }
      x.lineWidth = 1.6; x.beginPath(); for (let k = 0; k <= 12; k++) { const v = k / 12 * TAU, r = 13 + rng() * 5; k ? x.lineTo(Math.cos(v) * r, Math.sin(v) * r) : x.moveTo(Math.cos(v) * r, Math.sin(v) * r); } x.stroke();
      x.fillStyle = 'rgb(0,200,0)'; for (let k = 0; k < 14; k++) { const v = rng() * TAU, r = 18 + rng() * 40; x.beginPath(); x.arc(Math.cos(v) * r, Math.sin(v) * r, .8 + rng() * 1.6, 0, TAU); x.fill(); }
    });
    // svimerke: sot i midten, glør i typefargen rundt og korte svidde stråler
    celle(1, () => {
      sky(58, '255,0,0', .5); sky(40, '0,255,0', .85); x.strokeStyle = 'rgb(0,200,0)';
      for (let k = 0; k < 16; k++) { x.lineWidth = 1.2 + rng() * 2; rift(24 + rng() * 8, 46 + rng() * 14, rng() * TAU, 0, false); }
      x.fillStyle = 'rgb(255,0,0)'; for (let k = 0; k < 10; k++) { const v = rng() * TAU, r = 30 + rng() * 22; x.beginPath(); x.arc(Math.cos(v) * r, Math.sin(v) * r, 1 + rng() * 2, 0, TAU); x.fill(); }
    });
    // blekksøl: en klatt i typefargen med blekkomriss, sprut og noen dråper utenfor
    celle(2, () => {
      x.beginPath(); for (let k = 0; k <= 24; k++) { const v = k / 24 * TAU, r = 30 + rng() * 14 + (k % 5 === 0 ? 10 : 0); k ? x.lineTo(Math.cos(v) * r, Math.sin(v) * r) : x.moveTo(Math.cos(v) * r, Math.sin(v) * r); } x.closePath();
      x.fillStyle = 'rgba(255,0,0,.85)'; x.fill(); x.strokeStyle = 'rgb(0,255,0)'; x.lineWidth = 3; x.stroke();
      for (let k = 0; k < 12; k++) { const v = rng() * TAU, r = 46 + rng() * 14, s = 1.5 + rng() * 3.5; x.beginPath(); x.arc(Math.cos(v) * r, Math.sin(v) * r, s, 0, TAU); x.fillStyle = 'rgb(255,0,0)'; x.fill(); x.lineWidth = 1.2; x.stroke(); }
      x.fillStyle = 'rgb(0,110,0)'; x.beginPath(); x.arc(-8, -6, 9, 0, TAU); x.fill();
    });
    // skrensemerker: to svarte gummistriper som blir tynnere bakover, og litt støv
    celle(3, () => {
      sky(52, '255,0,0', .22);
      for (const s of [-20, 20]) { for (let k = 0; k < 3; k++) { x.strokeStyle = `rgba(0,255,0,${.75 - k * .15})`; x.lineWidth = 13 - k * 3.5; x.beginPath(); x.moveTo(s + (rng() - .5) * 3, 58); x.quadraticCurveTo(s + (rng() - .5) * 8, 0, s * .8 + (rng() - .5) * 4, -56); x.stroke(); } }
    });
    const t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearMipmapLinearFilter; return t;
  },
  /* et punkt på omrisset til varselet: u fra 0 til 1 rundt, med normalen ut */
  kant(sh, o, u) {
    const a = o.a || 0, fx = Math.sin(a), fz = Math.cos(a);
    if (sh === 'rect') {
      const L = 2 * o.len + o.w, s = u * L, w2 = o.w / 2;
      if (s < o.len) return { x: o.x + fx * s - fz * w2, z: o.z + fz * s + fx * w2, nx: -fz, nz: fx };
      if (s < o.len + o.w) { const q = s - o.len - w2; return { x: o.x + fx * o.len + fz * q, z: o.z + fz * o.len - fx * q, nx: fx, nz: fz }; }
      const q = o.len - (s - o.len - o.w); return { x: o.x + fx * q + fz * w2, z: o.z + fz * q - fx * w2, nx: fz, nz: -fx };
    }
    if (sh === 'cone' && o.arc < TAU - .05) {
      const buen = o.r * o.arc, L = 2 * o.r + buen, s = u * L, h = o.arc / 2;
      if (s < buen) { const v = a - h + s / o.r; return { x: o.x + Math.sin(v) * o.r, z: o.z + Math.cos(v) * o.r, nx: Math.sin(v), nz: Math.cos(v) }; }
      const side = s < buen + o.r ? -1 : 1, d = side < 0 ? s - buen : s - buen - o.r, v = a + side * h;
      return { x: o.x + Math.sin(v) * d, z: o.z + Math.cos(v) * d, nx: Math.sin(v + side * Math.PI / 2), nz: Math.cos(v + side * Math.PI / 2) };
    }
    const v = u * TAU; return { x: o.x + Math.sin(v) * o.r, z: o.z + Math.cos(v) * o.r, nx: Math.sin(v), nz: Math.cos(v) };
  },
  /* et tilfeldig punkt inne i formen */
  inne(sh, o) {
    const a = o.a || 0;
    if (sh === 'rect') { const l = Math.random() * o.len, q = (Math.random() - .5) * o.w; return { x: o.x + Math.sin(a) * l + Math.cos(a) * q, z: o.z + Math.cos(a) * l - Math.sin(a) * q }; }
    const d = Math.sqrt(Math.random()) * o.r, v = sh === 'cone' && o.arc < TAU - .05 ? a + (Math.random() - .5) * o.arc : Math.random() * TAU;
    return { x: o.x + Math.sin(v) * d, z: o.z + Math.cos(v) * d };
  },
  areal(sh, o) { return sh === 'rect' ? o.w * o.len : sh === 'cone' ? .5 * Math.min(TAU, o.arc) * o.r * o.r : Math.PI * o.r * o.r; },
  /* én partikkel av typen, med retningen ut (nx, nz) */
  sprut(x, z, nx, nz, def, fart = 1) {
    const [form, farge, , v, opp, g, liv, str] = def, k = v * fart * (.55 + Math.random() * .7);
    Particles.spawn(x, .12, z, 1, farge, { form, speed: .01, vx: nx * k, vz: nz * k, up: Math.max(.05, opp), g, life: liv, size: str });
  },
  velg(D) { let r = Math.random(); for (const d of D) { r -= d[2]; if (r <= 0) return d; } return D[D.length - 1]; },
  /* R.kastTele med 'fyr': nedslaget tas etter at fire har gått (da vet vi om fienden stormer) */
  land(t) { if (t && t.o && !t.o.stille && this.ko.length < 64) this.ko.push(t); },
  tick(dt) {
    if (this.ko.length) { const K = this.ko; this.ko = []; for (const t of K) { try { this.slag(t); } catch (e) { this.feil = String(e && e.stack || e); } } }
    if (!this.mesh) return;
    const vis = !R.safe; this.mesh.visible = vis; if (!vis) return;
    let maks = -1; const D = this.aDek.array;
    for (const m of this.M) {
      if (m.t >= m.liv) { if (D[m.i * 2 + 1]) D[m.i * 2 + 1] = 0; continue; }
      m.t += dt; const p = m.t / m.liv, inn = Math.min(1, m.t / .08);
      D[m.i * 2 + 1] = m.a0 * (p < .35 ? 1 : Math.max(0, 1 - (p - .35) / .65)) * inn; maks = m.i;
      if (m.t < .12) this.plasser(m, .82 + .18 * Math.min(1, m.t / .1));
    }
    this.mesh.count = maks + 1; this.aDek.needsUpdate = true;
  },
  /* merket skaleres litt opp de første hundredelene, som et stempel som treffer */
  plasser(m, k) {
    const M = this.dummy; M.position.set(m.x, .018 + m.i * .0004, m.z); M.rotation.set(-Math.PI / 2, 0, m.rot); M.scale.set(m.sx * k, m.sz * k, 1); M.updateMatrix();
    this.mesh.setMatrixAt(m.i, M.matrix); this.mesh.instanceMatrix.needsUpdate = true;
  },
  /* et merke i gulvet: en som har bleknet helt brukes først, ellers den eldste */
  merke(x, z, celle, farge, sx, sz, rot, a0 = .9) {
    if (!this.init()) return null;
    let m = this.M.find(m => m.t >= m.liv);
    if (m) { if (m.brukt) this.tall.gjenbruk++; } else m = this.M.reduce((a, b) => (b.t / b.liv > a.t / a.liv ? b : a));
    Object.assign(m, { x, z, sx, sz, rot, t: 0, liv: 5, a0, brukt: true });
    this.aDek.array[m.i * 2] = celle; this.aDek.array[m.i * 2 + 1] = 0; this.plasser(m, .82);
    this.mesh.setColorAt(m.i, this.c.set(farge)); this.mesh.instanceColor.needsUpdate = true; this.tall.merker++;
    return m;
  },
  slag(t) {
    const o = t.o, sh = t.shape, eier = t.owner, P = G.player; if (!o || o.x == null) return;
    this.tall.land++;
    const typ = teleType(o, eier), D = NED_TYPE[typ] || NED_TYPE.fysisk, kv = this.kan() ? Glod.kvote() : 0, T = TELE_TYPE[typ];
    const stor = (o.r || 0) >= 2.2 || !!(eier && (eier.kind === 'boss' || eier.mini)), a = o.a || 0, fx = Math.sin(a), fz = Math.cos(a);
    const lop = sh === 'rect' && eier && eier.state === 'charge', bane = sh === 'rect' && !lop && o.w < .6;
    const n0 = Particles.n;
    if (bane) { // en prosjektilbane: bare et lite blaff der skuddet går ut
      this.tall.baner++;
      for (let i = 0, n = Math.round(7 * kv); i < n; i++) { const q = (Math.random() - .5) * 1.1; this.sprut(o.x + fx * .5, o.z + fz * .5, fx * Math.cos(q) + fz * Math.sin(q), fz * Math.cos(q) - fx * Math.sin(q), D[0], .7); }
      this.tall.partikler += Particles.n - n0; return;
    }
    const ar = this.areal(sh, o), n = Math.round(Math.min(60, 8 + ar * 2.4) * kv);
    if (lop) { // fienden stormer: støv som sparkes bakover og ut til sidene, og skrensemerker der den tok sats
      this.tall.lop++; const st = NED_TYPE.fysisk[0];
      for (let i = 0, m = Math.round(Math.min(16, n * .5)); i < m; i++) { const q = (Math.random() - .5) * 2.2; this.sprut(o.x + fx * .3 + (Math.random() - .5) * o.w * .6, o.z + fz * .3, -fx * Math.cos(q) + fz * Math.sin(q), -fz * Math.cos(q) - fx * Math.sin(q), st, 1.1); }
      const del = .6 * o.len / (2 * o.len + o.w); // de første 60 prosentene av sidene, fra der den tar sats
      for (let i = 0, m = Math.round(n * .45); i < m; i++) { const u = Math.random() * del, p = this.kant(sh, o, Math.random() < .5 ? u : 1 - u); this.sprut(p.x, p.z, p.nx + fx * .6, p.nz + fz * .6, this.velg(D), .8); }
      if (this.kan()) { const k = Math.min(2.6, o.len * .4); this.merke(o.x + fx * (k * .5 + .1), o.z + fz * (k * .5 + .1), 3, 0x8a7a64, Math.max(1.1, o.w), k, a, .9); }
      this.rist(o.x, o.z, .12, 0); this.tall.partikler += Particles.n - n0; return;
    }
    // langs omrisset, og noen inne i formen på store angrep
    const inni = stor ? .22 : .08;
    for (let i = 0; i < n; i++) {
      const d = this.velg(D);
      if (Math.random() < inni) { const p = this.inne(sh, o), v = Math.random() * TAU; this.sprut(p.x, p.z, Math.sin(v) * .35, Math.cos(v) * .35, d, .8); }
      else { const p = this.kant(sh, o, Math.random()); this.sprut(p.x, p.z, p.nx, p.nz, d, 1); }
    }
    this.tall.partikler += Particles.n - n0;
    // strøm: to eller tre korte buer på kanten
    if (typ === 'strom' && kv > 0 && typeof Lyn === 'object') {
      for (let k = 0, m = 2 + (Math.random() < .5 ? 1 : 0); k < m; k++) {
        const u = Math.random(), p1 = this.kant(sh, o, u), p2 = this.kant(sh, o, (u + .05 + Math.random() * .06) % 1);
        if (Lyn.slag(p1.x, .08, p1.z, p2.x, .25 + Math.random() * .3, p2.z, { farge: 0xfff2a0, bredde: .05, liv: .2, grener: 1, amp: .3 })) this.tall.lyn++;
      }
    }
    // store angrep (ikke smale baner, som krokene til sjefen): et merke i gulvet, sjokkbølge og risting etter avstanden til spilleren
    if (!stor || (sh === 'rect' && o.w < 1.2)) { if (stor) this.rist(o.x, o.z, .12, 0); return; }
    if (this.kan()) {
      const cel = NED_MERKE[typ] ?? 0, fc = new THREE.Color(T.farge), farge = cel === 1 ? fc.clone().lerp(new THREE.Color(0xff7a2a), .4).getHex() : cel === 0 ? fc.clone().lerp(new THREE.Color(0x8a7a64), .55).getHex() : T.farge;
      if (sh === 'rect') this.merke(o.x + fx * o.len / 2, o.z + fz * o.len / 2, cel, farge, o.w + .5, o.len * .95, a, .8);
      else if (sh === 'cone' && o.arc < TAU - .05) { const r = o.r * .55; this.merke(o.x + fx * r, o.z + fz * r, cel, farge, o.r * 1.2, o.r * 1.2, Math.random() * TAU); }
      else this.merke(o.x, o.z, cel, farge, o.r * 2.1, o.r * 2.1, Math.random() * TAU, cel ? .9 : .8);
    }
    const R0 = sh === 'rect' ? Math.max(o.w, o.len * .4) : o.r;
    if (!R.safe) { R.sjokk(o.x, o.z, .35 + .25 * clamp((R0 - 2.2) / 4, 0, 1), { y: .1 }); this.tall.sjokk++; }
    this.rist(o.x, o.z, .3 + .15 * clamp((R0 - 2.2) / 4, 0, 1), R0);
  },
  /* skjermristing som dør ut med avstanden fra kanten av angrepet til spilleren (ingenting over 14 skritt) */
  rist(x, z, k, r) {
    const P = G.player; if (!P) return; const d = Math.max(0, Math.hypot(P.x - x, P.z - z) - r), f = Math.max(0, 1 - d / 14);
    if (f > 0) R.trauma = Math.min(1, Math.max(R.trauma, k * f));
  },
  /* tunge treff på spilleren: bildet fryser et øyeblikk og treffstjerna kommer */
  tungt(d) {
    const P = G.player; if (!P || !(d > .15 * P.maxHp)) return;
    G.hitstop = Math.max(G.hitstop, .05); this.tall.tunge++;
    if (typeof starBurst === 'function') starBurst(P.x, 1.4, P.z + .1, 1.35);
  },
  /* skyggene under prosjektilene: én flekk per prosjektil som krymper og blekner med høyden */
  skygge() {
    const S = this.skygger, L = G.projectiles || [];
    if (R.safe || !R.scene || !L.length) { if (S) S.count = 0; return; }
    if (!S) {
      if (this.skyggeBrutt) return;
      try {
        const tex = R.canvasTex(32, 32, g => { const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(.55, 'rgba(0,0,0,.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); });
        const m = this.skygger = new THREE.InstancedMesh(R.plane1(), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, color: new THREE.Color(0x1c1410) }), 64);
        m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; m.renderOrder = 1; m.count = 0; R.scene.add(m); this.sd = new THREE.Object3D();
      } catch (e) { this.skyggeBrutt = true; return; }
      return this.skygge();
    }
    let k = 0; const M = this.sd;
    for (const p of L) {
      if (k >= 64) break; if (!p.alive || !p.mesh) continue;
      const h = Math.max(0, (p.y ?? .9) - .5), s = (p.r || .22) * 2.6 * Math.max(.45, 1 - h * .18);
      M.position.set(p.x, .017, p.z); M.rotation.set(-Math.PI / 2, 0, 0); M.scale.set(s, s * .8, 1); M.updateMatrix(); S.setMatrixAt(k++, M.matrix);
    }
    S.count = k; S.instanceMatrix.needsUpdate = true;
  },
  tom() { this.ko = []; for (const m of this.M) m.t = m.liv; if (this.mesh) { this.mesh.count = 0; this.aDek.array.fill(0); this.aDek.needsUpdate = true; } if (this.skygger) this.skygger.count = 0; }
};
{
  const _kast = R.kastTele;
  R.kastTele = function (g, how, t) {
    const ny = !!g && !(g.isBlekk ? g.kastet : g.userData && g.userData.kastet), r = _kast.call(this, g, how, t);
    if (ny && how === 'fyr') Nedslag.land(t);
    return r;
  };
  const _ut = updateTele; updateTele = function (dt) { _ut(dt); Nedslag.tick(dt); };
  const _up = updateProjectiles; updateProjectiles = function (dt) { _up(dt); Nedslag.skygge(); };
  const _cf = clearFloor; clearFloor = function () { const r = _cf.apply(this, arguments); Nedslag.tom(); return r; };
  const _hp = hurtPlayer; hurtPlayer = function (dmg, src) { const d = _hp.apply(this, arguments); Nedslag.tungt(d); return d; };
  // lynet i regnværet har sitt eget nedslag (38_effekter.js)
  if (typeof Uvaer === 'object') { const _uv = Uvaer.varsel; Uvaer.varsel = function (x, z) { const n = G.tele.length; _uv.call(this, x, z); if (G.tele.length > n) G.tele[G.tele.length - 1].o.stille = true; }; }
}

Object.assign(window, { addTele, cancelTeles, updateTele, inShape, slashFx, VFX, Blekk, TELE_TYPE, TELE_FARGE, teleType, Particles, PART_FORM, Nedslag, NED_TYPE, addProj }); // til testene
