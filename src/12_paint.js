/* ============================================================
   MALT NIVÅ  -  enkel 3D-geometri med håndmalte flater, uten lyssetting
   (designdokumentet kapittel 9: "Verden"). Skygger og lys er malt inn:
   mørkere gulv langs veggene, lyspøler som dekaler.
   ============================================================ */
const Paint = {
  wobble(g, x0, y0, x1, y1, amp, rng) {
    const n = 6; g.beginPath(); g.moveTo(x0, y0);
    for (let i = 1; i <= n; i++) { const t = i / n; g.lineTo(lerp(x0, x1, t) + (i < n ? (rng() - .5) * amp : 0), lerp(y0, y1, t) + (i < n ? (rng() - .5) * amp : 0)); }
    g.stroke();
  },
  /* bilde fra ChatGPT til en flate (gulv_, vegg_ og bakke_ i manifestet, DESIGN_BRIEF.md del D), eller null så koden maler som før.
     Drømmene beholder sine egne farger; bare sikksakkgulvet og forhengene, som ikke finnes andre steder, kan ha bilde der.
     Panelveggen, sjakkgulvet og plankegulvet har egne farger i Underetasjen, Kjelleren og Dypet (nøkkel_3, _4 og _6), og mangler
     det bildet, maler koden. Et bilde som ikke er ferdig pakket ut, kommer likevel tilbake (complete er false): da maler den som
     spør først, og bytter når bildet kommer (som Art.part) */
  bilde(key, F) {
    if (F && F.drom && key !== 'gulv_sikksakk' && key !== 'vegg_forheng') return null;
    const d = F && F.depth; if ((key === 'vegg_panel' || key === 'gulv_sjakk' || key === 'gulv_planker') && (d === 3 || d === 4 || d === 6)) key += '_' + d;
    if (!SPRITES[key]) return null;
    let im = Art.img[key]; if (!im) { im = Art.img[key] = new Image(); im.src = SPRITES[key]; }
    return im.complete && !im.naturalWidth ? null : im; // et bilde nettleseren ikke kan lese (WebP i en gammel Safari), males av koden
  },
  /* dagens tegning av en flate i samme målestokk som bildet ChatGPT skal levere, til referansebildene i tegnelister/
     (tools/lag_tegnelister.py --bilder): gulv og bakke er 4 x 4 ruter i 512 x 512, vegger 1,5 ganger så brede som høye, 128 px per enhet */
  referanse(key) {
    const m = /^(gulv|vegg|bakke)_([a-z]+)(?:_(\d))?$/.exec(key); if (!m) return null;
    const hva = m[1], st = m[2], th = THEMES[+m[3] || 2], c = document.createElement('canvas'), g = c.getContext('2d'); g.lineCap = 'round'; g.lineJoin = 'round';
    if (hva === 'vegg') { const V = VEGG[st] || VEGG.panel, hh = V.h || 2.3; c.width = Math.round(192 * hh); c.height = Math.round(128 * hh); if (V.tegn) V.tegn(g, c.width, c.height, th, mulberry32(st.length * 97 + 5)); else this.malPanel(g, c.width, c.height, th); return c; }
    c.width = c.height = 512;
    if (hva === 'bakke') { g.scale(2.5, 2.5); Landskap.malBakke(g, st === 'skog', false); return c; } // bakken males 256 px over 5 ruter, her 128 px per rute
    const T = 128, rng = mulberry32(7), ute = ['brostein', 'gress', 'grus', 'jord', 'mose', 'myr', 'is', 'sti'].includes(st);
    for (let z = 0; z < 4; z++) for (let x = 0; x < 4; x++) {
      if (GULV[st]) { GULV[st](g, x * T, z * T, T, { x, z, th, rom: null, ute, kant: {} }); continue; }
      g.fillStyle = st === 'planker' ? (th.corr || '#b9a878') : (x + z) % 2 ? (th.tileB2 || th.tileB) : th.tileA; g.fillRect(x * T, z * T, T, T);
    }
    // sjakk og planker males rett i floorCanvas: fuger, lys kant og plankeskjøter på samme måte
    if (st === 'planker') { g.strokeStyle = 'rgba(60,40,20,.45)'; g.lineWidth = T * .04; for (let z = 0; z < 4; z++) for (let k = 1; k < 3; k++) { g.beginPath(); g.moveTo(0, z * T + k * T / 3); g.lineTo(4 * T, z * T + k * T / 3); g.stroke(); } }
    if (st === 'sjakk') {
      g.strokeStyle = 'rgba(255,250,225,.22)'; g.lineWidth = T * .05;
      for (let z = 0; z < 4; z++) for (let x = 0; x < 4; x++) { g.beginPath(); g.moveTo(x * T + T * .12, z * T + T * .88); g.lineTo(x * T + T * .12, z * T + T * .14); g.lineTo(x * T + T * .86, z * T + T * .14); g.stroke(); }
      g.strokeStyle = th.grout; g.lineWidth = T * .07; for (let k = 0; k <= 4; k++) { this.wobble(g, k * T, 0, k * T, 4 * T, 3, rng); this.wobble(g, 0, k * T, 4 * T, k * T, 3, rng); }
    }
    return c;
  },
  /* hele gulvet males som ett lerret: fliser med skjeve blekkfuger, malte flekker,
     tegnet skygge langs veggene, rusk og en tykk blekkant der gulvet møter veggen.
     Telefoner og TV får 24 px per rute også i drømmene (de er små, men fikk 64 px: 3200 x 1664, rundt 28 MB i grafikkminnet) */
  floorCanvas(F, th, skj) {
    const W = F.W, H = F.H, T = R.lowTex ? 16 : R.coarse || R.tv ? 24 : W * H > 1800 ? 32 : 64, rng = mulberry32((F.seed || 1) * 31 + 7);
    const c = document.createElement('canvas'); c.width = W * T; c.height = H * T; const g = c.getContext('2d');
    const isF = (x, z) => x >= 0 && z >= 0 && x < W && z < H && F.tiles[z * W + x] > 0, isC = (x, z) => isF(x, z) && F.tiles[z * W + x] === T_COR;
    // kanten mellom det synlige og det skjulte males som en vegg (skygge og blekk), så gulvet i rommet foran sprekken ser helt vanlig ut. Åpnet blir den en terskel
    const kant = (x, z, nx, nz) => !isF(nx, nz) || (!!skj && skj[z * W + x] !== skj[nz * W + nx]);
    g.lineCap = 'round'; g.lineJoin = 'round';
    // gulvet i hver rute: rommets eget (romStil i generatoren), korridoren sitt, og ellers sjakk som før
    const STIL = new Array(W * H), UTE = new Uint8Array(W * H), sno = F.vaer === 'sno';
    for (let i = 0; i < W * H; i++) { if (!F.tiles[i]) continue; const rid = F.roomId[i], rom = rid >= 0 && F.rooms ? F.rooms[rid] : null; STIL[i] = rom ? (rom.gulv || 'sjakk') : F.tiles[i] === T_COR ? ((F.korridor && F.korridor.gulv) || 'planker') : 'sjakk'; UTE[i] = rom ? (rom.ute ? 1 : 0) : (F.ute ? 1 : 0); }
    const erSjakk = (x, z) => isF(x, z) && STIL[z * W + x] === 'sjakk', erPlanker = (x, z) => isF(x, z) && STIL[z * W + x] === 'planker';
    const samme = (i, x, z) => x >= 0 && z >= 0 && x < W && z < H && F.tiles[z * W + x] > 0 && F.roomId[z * W + x] === F.roomId[i];
    // 1) grunnfarge per flis, rolig sjakk med små variasjoner; andre gulv males av GULV (17_romtyper.js)
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
      if (!isF(x, z)) continue;
      const i = z * W + x, st = STIL[i];
      if (st !== 'sjakk' && st !== 'planker' && typeof GULV === 'object' && GULV[st]) {
        const rid = F.roomId[i]; GULV[st](g, x * T, z * T, T, { x, z, th, rom: rid >= 0 ? F.rooms[rid] : null, ute: !!UTE[i], kant: { n: !samme(i, x, z - 1), s: !samme(i, x, z + 1), w: !samme(i, x - 1, z), e: !samme(i, x + 1, z) } });
        continue;
      }
      let base = st === 'planker' ? (th.corr || '#b9a878') : ((x + z) % 2 ? (th.tileB2 || th.tileB) : th.tileA);
      const v = 1 + (rng() - .5) * .07; base = v > 1 ? Col.light(base, (v - 1) * 2) : Col.dark(base, v);
      g.fillStyle = base; g.fillRect(x * T, z * T, T + 1, T + 1);
    }
    g.save(); g.beginPath(); for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) if (isF(x, z)) g.rect(x * T, z * T, T, T); g.clip();
    // 2) malte flekker med blekkant på den ene siden, slik bakken er malt i Conan
    const nP = Math.round(W * H / 9);
    for (let i = 0; i < nP; i++) {
      const cx = rng() * W * T, cy = rng() * H * T, r = (.8 + rng() * 2.2) * T, dark = rng() < .55, pts = [];
      for (let a = 0; a < 11; a++) { const an = a / 11 * TAU, rr = r * (.65 + rng() * .45); pts.push([cx + Math.cos(an) * rr, cy + Math.sin(an) * rr * .72]); }
      const path = () => { g.beginPath(); const n = pts.length; const mid = k => [(pts[k][0] + pts[(k + 1) % n][0]) / 2, (pts[k][1] + pts[(k + 1) % n][1]) / 2]; let m = mid(n - 1); g.moveTo(m[0], m[1]); for (let k = 0; k < n; k++) { m = mid(k); g.quadraticCurveTo(pts[k][0], pts[k][1], m[0], m[1]); } g.closePath(); };
      path(); g.fillStyle = dark ? 'rgba(70,58,20,.10)' : 'rgba(255,250,215,.11)'; g.fill();
      if (dark && rng() < .7) { g.save(); path(); g.clip(); g.strokeStyle = 'rgba(42,26,20,.2)'; g.lineWidth = T * .06; g.translate(-T * .05, -T * .07); path(); g.stroke(); g.restore(); }
    }
    // 3) fuger: skjeve blekkstreker, med hull her og der
    g.strokeStyle = th.grout; g.lineWidth = T * .07;
    for (let z = 0; z <= H; z++) for (let x = 0; x < W; x++) if ((erSjakk(x, z) && erSjakk(x, z - 1)) && rng() > .07) { g.beginPath(); g.moveTo(x * T + rng() * 3, z * T + (rng() - .5) * 3); g.quadraticCurveTo(x * T + T / 2, z * T + (rng() - .5) * 5, x * T + T - rng() * 3, z * T + (rng() - .5) * 3); g.stroke(); }
    for (let x = 0; x <= W; x++) for (let z = 0; z < H; z++) if ((erSjakk(x, z) && erSjakk(x - 1, z)) && rng() > .07) { g.beginPath(); g.moveTo(x * T + (rng() - .5) * 3, z * T + rng() * 3); g.quadraticCurveTo(x * T + (rng() - .5) * 5, z * T + T / 2, x * T + (rng() - .5) * 3, z * T + T - rng() * 3); g.stroke(); }
    // korridor: plankegulv
    g.strokeStyle = 'rgba(60,40,20,.45)'; g.lineWidth = T * .04;
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) if (erPlanker(x, z)) for (let k = 1; k < 3; k++) { g.beginPath(); g.moveTo(x * T, z * T + k * T / 3 + (rng() - .5) * 2); g.lineTo(x * T + T, z * T + k * T / 3 + (rng() - .5) * 2); g.stroke(); }
    // 4) lys kant på flisene
    g.strokeStyle = 'rgba(255,250,225,.22)'; g.lineWidth = T * .05;
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) if (erSjakk(x, z)) { g.beginPath(); g.moveTo(x * T + T * .12, z * T + T * .88); g.lineTo(x * T + T * .12, z * T + T * .14); g.lineTo(x * T + T * .86, z * T + T * .14); g.stroke(); }
    // 5) avslåtte fliser
    for (let i = 0; i < W * H / 14; i++) {
      const x = Math.floor(rng() * W), z = Math.floor(rng() * H); if (!erSjakk(x, z)) continue;
      const cx = x * T + (rng() < .5 ? 0 : T), cy = z * T + (rng() < .5 ? 0 : T), sx = cx === x * T ? 1 : -1, sy = cy === z * T ? 1 : -1, s = T * (.25 + rng() * .25);
      g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + sx * s, cy + sy * s * .15); g.lineTo(cx + sx * s * .2, cy + sy * s); g.closePath(); g.fillStyle = 'rgba(60,50,30,.35)'; g.fill(); g.strokeStyle = 'rgba(42,26,20,.6)'; g.lineWidth = T * .035; g.stroke();
    }
    // snø: ett lag over hele uteområdet, ikke rute for rute (snoDekke). dekt svarer om et punkt ligger under snøen
    const dekt = sno ? this.snoDekke(g, F, T, UTE, STIL, isF, kant) : null;
    // 6) tegnet skygge langs veggene i nord og vest (blå på snøen)
    g.fillStyle = 'rgba(40,24,12,.26)';
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
      if (!isF(x, z)) continue;
      if (sno) g.fillStyle = UTE[z * W + x] ? 'rgba(70,88,130,.16)' : 'rgba(40,24,12,.26)';
      if (kant(x, z, x, z - 1)) { g.beginPath(); g.moveTo(x * T, z * T); g.lineTo(x * T + T, z * T); g.lineTo(x * T + T, z * T + T * (.42 + Math.sin(x * 1.7) * .06)); g.quadraticCurveTo(x * T + T / 2, z * T + T * (.5 + Math.cos(x * 2.3) * .08), x * T, z * T + T * (.42 + Math.sin((x - 1) * 1.7) * .06)); g.closePath(); g.fill(); }
      if (kant(x, z, x - 1, z)) { g.fillRect(x * T, z * T, T * .2, T); }
    }
    // 7) rusk: papirbiter, piller, støv, sprekker
    for (let i = 0; i < W * H / 6; i++) {
      const x = rng() * W, z = rng() * H; if (!isF(Math.floor(x), Math.floor(z))) continue;
      const px = x * T, py = z * T, k = rng();
      // ute: løv, kvister og småstein i stedet for papir og piller
      if (UTE[Math.floor(z) * W + Math.floor(x)]) {
        if (dekt && k < .3 && dekt(x, z)) continue; // ikke løv oppå snøen
        if (k < .3) { g.save(); g.translate(px, py); g.rotate(rng() * TAU); g.fillStyle = F.depth === 5 ? '#6a5a2a' : rng() < .5 ? '#a8622a' : '#c89a3a'; g.beginPath(); g.ellipse(0, 0, T * .08, T * .045, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(42,26,20,.5)'; g.lineWidth = T * .015; g.stroke(); g.restore(); }
        else if (k < .45) { g.strokeStyle = 'rgba(60,40,20,.7)'; g.lineWidth = T * .025; g.beginPath(); g.moveTo(px, py); g.lineTo(px + (rng() - .5) * T * .5, py + (rng() - .5) * T * .3); g.stroke(); }
        else if (k < .6) { g.fillStyle = 'rgba(120,114,100,.8)'; g.beginPath(); g.arc(px, py, T * .04, 0, TAU); g.fill(); }
        continue;
      }
      if (k < .25) { g.save(); g.translate(px, py); g.rotate(rng() * TAU); g.fillStyle = '#efe6cc'; g.strokeStyle = 'rgba(42,26,20,.7)'; g.lineWidth = T * .03; g.fillRect(-T * .12, -T * .09, T * .24, T * .18); g.strokeRect(-T * .12, -T * .09, T * .24, T * .18); g.restore(); }
      else if (k < .35) { g.save(); g.translate(px, py); g.rotate(rng() * TAU); g.fillStyle = rng() < .5 ? '#f4f0e6' : '#c86a4a'; g.beginPath(); g.ellipse(0, 0, T * .07, T * .035, 0, 0, TAU); g.fill(); g.strokeStyle = INK; g.lineWidth = T * .02; g.stroke(); g.restore(); }
      else if (k < .6) { g.fillStyle = 'rgba(42,26,20,.18)'; for (let d = 0; d < 4; d++) { g.beginPath(); g.arc(px + (rng() - .5) * T * .6, py + (rng() - .5) * T * .4, T * .025, 0, TAU); g.fill(); } }
      else if (k < .72) { g.strokeStyle = 'rgba(42,26,20,.5)'; g.lineWidth = T * .03; g.beginPath(); let cx = px, cy = py; g.moveTo(cx, cy); for (let s = 0; s < 4; s++) { cx += (rng() - .3) * T * .5; cy += (rng() - .5) * T * .4; g.lineTo(cx, cy); } g.stroke(); }
      else if (k < .78) { g.strokeStyle = 'rgba(110,70,30,.28)'; g.lineWidth = T * .05; g.beginPath(); g.ellipse(px, py, T * .3, T * .22, 0, 0, TAU * .85); g.stroke(); }
    }
    g.restore();
    // 8) tykk blekkant rundt hele gulvet
    g.strokeStyle = INK; g.lineWidth = T * .12;
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
      if (!isF(x, z)) continue;
      const e = (x0, y0, x1, y1) => { g.beginPath(); g.moveTo(x0 * T, y0 * T); g.lineTo(x1 * T, y1 * T); g.stroke(); };
      if (kant(x, z, x, z - 1)) e(x, z, x + 1, z); if (kant(x, z, x, z + 1)) e(x, z + 1, x + 1, z + 1); if (kant(x, z, x - 1, z)) e(x, z, x, z + 1); if (kant(x, z, x + 1, z)) e(x + 1, z, x + 1, z + 1);
    }
    const tex = new THREE.CanvasTexture(c); tex.anisotropy = 4; return tex;
  },
  /* vinter: snøen males som ett lag over alle uterutene og klippes til dem, så den ikke kuttes langs rutenettet (før lå fire flate
     ellipser i hver rute). Dekket er 75 til 85 %, etter lavfrekvent støy med eget frø (generatoren og rng i floorCanvas røres ikke).
     Klattene tegnes som Art.cel: blågrå skygge nede til høyre, selve snøen (aldri helt hvit) og blekk bare under. Sørpe med to
     hjulspor midt i grusgangene og stiene, smeltet rundt bål, ovner og kjeler, fonner mot veggene i nord og vest, isen blank med fonner
     i kanten, og glitter. Lette teksturer: én klatt per rute, ingen fonner og ikke glitter. Svarer med dekt(x, z) i ruter */
  snoDekke(g, F, T, UTE, STIL, isF, kant) {
    // snøbildet fra ChatGPT (gulv_sno, Toms uteflater): legges over hver uterute i verdenskoordinater (4 x 4 ruter per bilde, så det
    // ikke kuttes langs rutene), med litt av bakken under. Da dekker snøen hele uteområdet
    if (typeof uteBilde === 'function' && uteBilde('gulv_sno')) {
      const W = F.W, H = F.H; g.save(); g.globalAlpha = .88;
      for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) if (isF(x, z) && UTE[z * W + x]) uteBakkeBilde('gulv_sno', g, x * T, z * T, T, { x, z });
      g.restore();
      return (x, z) => { const tx = Math.floor(x), tz = Math.floor(z); return tx >= 0 && tz >= 0 && tx < W && tz < H && isF(tx, tz) && !!UTE[tz * W + tx]; };
    }
    const W = F.W, H = F.H, lett = R.lowTex, sk = ((F.seed || 1) * 131 + 17) | 0, rng = mulberry32((F.seed || 1) * 53 + 29);
    const ute = (x, z) => isF(x, z) && !!UTE[z * W + x], is = (x, z) => STIL[z * W + x] === 'is';
    const vn = (x, z) => { const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz, u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz), a = hRute(ix, iz, sk), b = hRute(ix + 1, iz, sk), c = hRute(ix, iz + 1, sk), d = hRute(ix + 1, iz + 1, sk); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
    const bas = (x, z) => vn(x * .22, z * .22) * .7 + vn(x * .7 + 17.3, z * .7 + 5.1) * .3;
    // terskelen: 16 % av uterutene (utenom isen) blir bare
    const ss = []; for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) if (ute(x, z) && !is(x, z)) ss.push(bas(x + .37, z + .61)); // støyen er så rolig at ett punkt per rute holder
    if (!ss.length) return null;
    ss.sort((a, b) => a - b); const thr = ss[Math.floor(ss.length * .16)];
    const ild = []; for (const r of F.rooms || []) for (const p of r.props || []) { const r0 = { baal: 1.9, vedovn: 1.3, kjele: 1.4 }[p.k]; if (r0 && ute(Math.floor(p.x), Math.floor(p.z))) ild.push([p.x, p.z, r0]); }
    // midt i gangen: en korridorrute med grus eller sti og gulv på alle åtte kanter
    const midt = new Uint8Array(W * H); let nMidt = 0;
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) { const i = z * W + x; if (F.tiles[i] !== T_COR || !UTE[i] || (STIL[i] !== 'grus' && STIL[i] !== 'sti')) continue; let ok = 1; for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) if (!isF(x + dx, z + dz)) ok = 0; if (ok) { midt[i] = 1; nMidt++; } }
    const erMidt = (x, z) => x >= 0 && z >= 0 && x < W && z < H && midt[z * W + x] === 1;
    const sorpe = (x, z) => { const tx = Math.floor(x), tz = Math.floor(z); let d = 9; for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) { const mx = tx + dx, mz = tz + dz; if (!erMidt(mx, mz)) continue; const cx = mx + .5, cz = mz + .5; d = Math.min(d, Math.hypot(x - cx, z - cz)); if (erMidt(mx + 1, mz) && x >= cx && x <= cx + 1) d = Math.min(d, Math.abs(z - cz)); if (erMidt(mx, mz + 1) && z >= cz && z <= cz + 1) d = Math.min(d, Math.abs(x - cx)); } return d; };
    const sm = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
    // over null ligger det snø: støyen, mer inntil veggene, mindre ved ilden og i sørpa
    const felt = (x, z) => {
      const tx = Math.floor(x), tz = Math.floor(z); if (!ute(tx, tz) || is(tx, tz)) return -1;
      let f = bas(x, z) - thr;
      if (kant(tx, tz, tx, tz - 1)) f += .35 * Math.max(0, 1 - (z - tz) / .7);
      if (kant(tx, tz, tx - 1, tz)) f += .3 * Math.max(0, 1 - (x - tx) / .6);
      for (const [ix, iz, r0] of ild) { const d = Math.hypot(x - ix, z - iz); if (d < r0 * 1.3) f -= .8 * sm(r0 * 1.3, r0 * .7, d); }
      if (nMidt) { const d = sorpe(x, z); if (d < .5) f -= .8 * sm(.5, .26, d); }
      return f;
    };
    // klattene: to per rute på skrå, så de ligger i et skrått rutenett, større jo dypere snøen er, så kanten blir
    // klumpete og midten tett. En rute der snøen er dyp i den og de fire naboene, blir et rektangel: bare kanten av snøen synes.
    // Hjørnene mot en skrå nabo uten dyp snø (øverst til venstre og nederst til høyre) er det bare rutas egen klatt som runder av, så den blir med.
    // Lette teksturer: én klatt midt i ruta. Hver klatt koster like mye å fylle, så de er så få som kanten tåler
    const MF = .1, klatt = new Path2D(), fonn = new Path2D(), omr = new Path2D(), pr = [], dyp = new Uint8Array(W * H), kl = lett ? [[.5, .5]] : [[.25, .25], [.75, .75]];
    const ell = (p, cx, cy, rx, ry) => { const c = .5523; p.moveTo(cx + rx, cy); p.bezierCurveTo(cx + rx, cy + ry * c, cx + rx * c, cy + ry, cx, cy + ry); p.bezierCurveTo(cx - rx * c, cy + ry, cx - rx, cy + ry * c, cx - rx, cy); p.bezierCurveTo(cx - rx, cy - ry * c, cx - rx * c, cy - ry, cx, cy - ry); p.bezierCurveTo(cx + rx * c, cy - ry, cx + rx, cy - ry * c, cx + rx, cy); };
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
      if (!ute(x, z)) continue; let d = !lett;
      for (const [a, b] of kl) { const wx = x + a + (rng() - .5) * .35, wz = z + b + (rng() - .5) * .35, j = rng(), f = felt(wx, wz); if (f < MF) d = false; if (f > 0) pr.push(x, z, wx, wz, j, f, a < .5 ? -1 : 1); }
      if (d) dyp[z * W + x] = 1;
    }
    const erDyp = (x, z) => x >= 0 && z >= 0 && x < W && z < H && dyp[z * W + x] === 1, inne = (x, z) => erDyp(x, z) && erDyp(x - 1, z) && erDyp(x + 1, z) && erDyp(x, z - 1) && erDyp(x, z + 1);
    // ruter i rad blir ett rektangel: hver bit i en sti koster like mye å fylle, stor eller liten
    const rader = (p, ok) => { for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) { if (!ok(x, z)) continue; const x0 = x; while (x + 1 < W && ok(x + 1, z)) x++; p.rect(x0 * T, z * T, (x + 1 - x0) * T, T); } };
    const inneR = new Uint8Array(W * H); for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) if (inne(x, z)) inneR[z * W + x] = 1;
    rader(klatt, (x, z) => inneR[z * W + x] === 1); rader(omr, ute);
    for (let k = 0; k < pr.length; k += 7) { const x = pr[k], z = pr[k + 1], h = pr[k + 6]; if (inneR[z * W + x] && erDyp(x + h, z + h)) continue; const f = pr[k + 5], r = T * (lett ? .75 : (.3 + .54 * Math.min(1, f / MF)) * (.85 + pr[k + 4] * .3)); ell(klatt, pr[k + 2] * T, pr[k + 3] * T, r, r * .8); }
    if (!lett) for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
      if (!ute(x, z)) continue;
      // fonner mot nord- og vestveggene (og hekkene), der skyggen males
      if (kant(x, z, x, z - 1)) for (let k = 0; k < 2; k++) { const cx = (x + (k + .5) / 2 + (hRute(x * 2 + k, z, sk + 7) - .5) * .2) * T, cy = z * T + T * (.08 + hRute(x * 2 + k, z, sk + 3) * .14), r = T * (.36 + hRute(x * 2 + k, z, sk + 4) * .16); ell(fonn, cx, cy, r, r * .75); }
      if (kant(x, z, x - 1, z)) for (let k = 0; k < 2; k++) { const cy = (z + (k + .5) / 2 + (hRute(x, z * 2 + k, sk + 8) - .5) * .2) * T, cx = x * T + T * (.02 + hRute(x, z * 2 + k, sk + 5) * .06), r = T * (.3 + hRute(x, z * 2 + k, sk + 6) * .1); ell(fonn, cx, cy, r * .5, r); }
    }
    // Art.cel for en hel sti: blekk forskjøvet ned, blågrå skygge, og snøen forskjøvet opp til venstre, så skyggen blir en sigd nede til høyre.
    // Snøen klippes ikke til skyggen (det kostet like mye som en fylling til); den blir bare et par punkter større oppe til venstre
    const cel = (p, dx, dy, blekk = true) => {
      if (blekk) { g.save(); g.translate(T * .03, T * .075); g.fillStyle = 'rgba(42,26,20,.3)'; g.fill(p); g.restore(); }
      g.fillStyle = '#b3bfd2'; g.fill(p);
      g.save(); g.translate(-dx, -dy); g.fillStyle = '#e4ebf3'; g.fill(p); g.restore();
    };
    g.save(); g.clip(omr);
    g.fillStyle = 'rgba(96,100,108,.24)'; g.fill(omr); // bakken der snøen ikke ligger, er vinterbleik
    // sørpe: grå slaps med to hjulspor, under snøen, så snøkanten ligger oppå
    if (nMidt) {
      const sp = new Path2D(), spor = new Path2D(), e = T * .14;
      for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
        if (!erMidt(x, z)) continue; const cx = (x + .5) * T, cy = (z + .5) * T;
        sp.moveTo(cx, cy); sp.lineTo(cx + .5, cy);
        if (erMidt(x + 1, z)) { sp.moveTo(cx, cy); sp.lineTo(cx + T, cy); for (const s of [-e, e]) { spor.moveTo(cx, cy + s); spor.lineTo(cx + T, cy + s); } }
        if (erMidt(x, z + 1)) { sp.moveTo(cx, cy); sp.lineTo(cx, cy + T); for (const s of [-e, e]) { spor.moveTo(cx + s, cy); spor.lineTo(cx + s, cy + T); } }
      }
      g.lineCap = 'round'; g.strokeStyle = '#8d8a80'; g.lineWidth = T * .7; g.stroke(sp); // snøkanten ligger over sørpa og gjør kanten myk
      g.strokeStyle = 'rgba(62,58,52,.55)'; g.lineWidth = T * .07; g.stroke(spor);
      g.save(); g.translate(0, -T * .035); g.strokeStyle = 'rgba(200,208,220,.25)'; g.lineWidth = T * .03; g.stroke(spor); g.restore();
    }
    // smeltet rundt ilden: våt, mørk jord i en ring
    for (const [ix, iz, r0] of ild) { g.fillStyle = 'rgba(30,24,20,.14)'; g.beginPath(); g.ellipse(ix * T, iz * T, r0 * .8 * T, r0 * .68 * T, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(38,30,26,.22)'; g.lineWidth = T * .2; g.stroke(); }
    cel(klatt, T * .05, T * .07);
    if (!lett) {
      // vindriller i snøen: tynne blå buer med et lyst streif over, samlet i to stier (hver for seg ble det tusen strøk)
      const ril = new Path2D(), lysR = new Path2D();
      for (let k = 0; k < W * H / 4; k++) {
        const x = rng() * W, z = rng() * H, r = T * (.25 + rng() * .4), b = (rng() - .5) * .5; if (felt(x, z) < .08 || felt(x - r / T, z) < .03 || felt(x + r / T, z) < .03) continue;
        const px = x * T, py = z * T; ril.moveTo(px - r, py + r * b); ril.quadraticCurveTo(px, py - r * .28, px + r, py - r * b);
        lysR.moveTo(px - r * .7, py + r * b * .7 - T * .03); lysR.quadraticCurveTo(px, py - r * .28 - T * .03, px + r * .7, py - r * b * .7 - T * .03);
      }
      g.lineWidth = Math.max(1, T * .022); g.strokeStyle = 'rgba(140,158,192,.4)'; g.stroke(ril); g.strokeStyle = 'rgba(246,248,249,.5)'; g.stroke(lysR);
      cel(fonn, T * .04, T * .06, false); // fonnene ligger oppå snøen; skyggen er kant nok
      // glitter: små prikker med blå skygge
      const s = Math.max(1, T * .025);
      const gs = new Path2D(), gl = new Path2D();
      for (let k = 0, nG = Math.round(W * H / 3); k < nG; k++) { const x = rng() * W, z = rng() * H; if (felt(x, z) <= .02) continue; const px = x * T, py = z * T; gs.rect(px + s * .7, py + s * .7, s, s); gl.rect(px, py, s, s); }
      g.fillStyle = 'rgba(110,130,175,.5)'; g.fill(gs); g.fillStyle = '#f2f6f9'; g.fill(gl);
    }
    g.restore();
    return (x, z) => felt(x, z) > 0;
  },
  /* snø på en vegg som vender mot snødekt ute: et klumpete hvitt bånd langs toppen med blå underside og blekk under, klumper på
     hekken og istapper under paviljongen, tømmeret og glasset. Utklippene (gjerdet, ruinen) får snøen der det er noe å ligge på */
  snoKant(g, w, hp, stil) {
    const V = (typeof VEGG === 'object' && VEGG[stil]) || {}, alfa = !!V.alfa && stil !== 'glass', topp = new Float32Array(w + 1), rng = mulberry32(stil.length * 53 + 11), tykk = alfa ? 7 : 26;
    if (alfa) { const d = g.getImageData(0, 0, w, hp).data; for (let x = 0; x <= w; x++) { const xx = Math.min(x, w - 1); let y = 0; while (y < hp && d[(y * w + xx) * 4 + 3] < 128) y++; topp[x] = y; } }
    // kanten under: jevne buler som møtes i samme dybde, så båndet går sømløst over kanten til neste rute
    const dyb = new Float32Array(w + 1), nb = 12, vekt = []; let sum = 0; for (let k = 0; k < nb; k++) { vekt.push(.6 + rng()); sum += vekt[k]; }
    for (let k = 0, x0 = 0; k < nb; k++) { const bw = vekt[k] / sum * w, amp = (alfa ? 1.5 : 3) + rng() * (alfa ? 2 : 7); for (let x = Math.ceil(x0); x <= Math.min(w, x0 + bw); x++) dyb[x] = tykk + Math.sin((x - x0) / bw * Math.PI) * amp; x0 += bw; }
    const sti = () => { const p = new Path2D(); p.moveTo(0, topp[0] - 1); for (let x = 2; x <= w; x += 2) p.lineTo(x, topp[x] - 1); p.lineTo(w, topp[w] - 1); for (let x = w; x >= 0; x -= 2) p.lineTo(x, topp[x] + dyb[x]); p.closePath(); return p; }, p = sti();
    g.save(); if (alfa) g.globalCompositeOperation = 'source-atop';
    g.save(); g.translate(0, alfa ? 2 : 6); g.fillStyle = 'rgba(42,26,20,.85)'; g.fill(p); g.restore();
    g.save(); g.translate(0, alfa ? 1 : 4); g.fillStyle = '#9fb0c8'; g.fill(p); g.restore();
    g.fillStyle = '#e4ebf3'; g.fill(p);
    g.restore();
    const klump = (cx, cy, rx, ry) => { const q = new Path2D(); q.ellipse(cx, cy, rx, ry, 0, Math.PI, TAU); q.quadraticCurveTo(cx + rx * .4, cy + ry * .5, cx, cy + ry * .35); q.quadraticCurveTo(cx - rx * .4, cy + ry * .5, cx - rx, cy); q.closePath(); g.save(); g.translate(1, 3); g.fillStyle = 'rgba(42,26,20,.75)'; g.fill(q); g.restore(); g.fillStyle = '#9fb0c8'; g.fill(q); g.save(); g.clip(q); g.translate(-1.5, -2.5); g.fillStyle = '#e4ebf3'; g.fill(q); g.restore(); };
    if (stil === 'hekk') for (let k = 0; k < 9; k++) klump(20 + rng() * (w - 40), 50 + rng() * hp * .35, 11 + rng() * 9, 6 + rng() * 4);
    if (stil === 'paviljong' || stil === 'tommer' || stil === 'glass') {
      // istapper: blåhvite kiler med blekkant og et lysstreif
      let x = 6 + rng() * 8;
      while (x < w - 6) { const b = 2 + rng() * 2.5, l = 6 + rng() * rng() * 24, y0 = topp[Math.round(x)] + dyb[Math.round(x)] + 2;
        g.beginPath(); g.moveTo(x - b, y0); g.quadraticCurveTo(x - b * .3, y0 + l * .6, x, y0 + l); g.quadraticCurveTo(x + b * .3, y0 + l * .6, x + b, y0); g.closePath();
        g.fillStyle = 'rgba(214,228,242,.92)'; g.fill(); g.strokeStyle = 'rgba(42,26,20,.7)'; g.lineWidth = 1.4; g.stroke();
        g.strokeStyle = 'rgba(244,247,249,.8)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - b * .35, y0 + 1); g.lineTo(x - b * .1, y0 + l * .6); g.stroke();
        x += 7 + rng() * 14; }
    }
  },
  /* fargetonen på en snøetasje: kaldere lys (uAmbient mot blåhvitt) i en kopi av temaet */
  tema(th, F) {
    if (!th || !F || F.vaer !== 'sno') return th;
    const gr = th.grade || {}; return Object.assign({}, th, { grade: Object.assign({}, gr, { amb: blandF(gr.amb || '#ffffff', '#d4dff0', .6), gain: blandF(gr.gain || '#ffffff', '#eef4ff', .5) }) });
  },
  wallTex(th, stil = 'panel', F, sno) {
    // 2 enheter bred og like høy som veggen (128 px per enhet). v = høyde / veggens høyde
    const V = typeof VEGG === 'object' && VEGG[stil], hh = (V && V.h) || 2.3;
    // bilde fra ChatGPT (vegg_<stil>): 1,5 ganger så bredt som høyt, så flekkene gjentas hver 1,5h rute og ikke annenhver.
    // Blekkstreken oppe og nede legges på her som på de malte veggene, men ikke på gjerdet og ruinen, som er utklipp.
    // Uteflatene Tom har levert (UTE_FLATER i 17_romtyper.js: hekk, steinmur, skog og ruin) er laget 2 enheter brede og uten blekkstreker,
    // så de beholder sine egne mål, og de er ikke større enn den malte veggen, så de brukes også med lette teksturer
    const key = 'vegg_' + stil, ute = typeof UTE_FLATER === 'object' && UTE_FLATER[key], bu = ute ? ute[0] : 1.5 * hh;
    const im = (!R.lowTex || ute) && stil !== 'glass' ? this.bilde(key, F) : null; let kastet = false;
    const legg = tex => {
      if (kastet || !im.naturalWidth) return tex;
      const c = tex.image, w = c.width = Math.round(128 * bu), hp = c.height = Math.round(128 * hh), g = c.getContext('2d');
      g.imageSmoothingQuality = 'high'; g.drawImage(im, 0, 0, w, hp); if (!ute && !(V && V.alfa)) { g.fillStyle = INK; g.fillRect(0, 0, w, 9); g.fillRect(0, hp - 7, w, 7); } if (sno) this.snoKant(g, w, hp, stil);
      tex.repeat.x = 2 / bu; tex.fraBilde = key; tex.needsUpdate = true; return tex;
    };
    if (im && im.complete) return legg(R.canvasTex(1, 1, () => { }, true));
    const tex = V && V.tegn ? R.canvasTex(256, Math.round(hh * 128), (g, w, h) => { V.tegn(g, w, h, th, mulberry32(stil.length * 97 + 5)); if (sno) this.snoKant(g, w, h, stil); }, true) : R.canvasTex(256, 296, (g, w, h) => { this.malPanel(g, w, h, th); if (sno) this.snoKant(g, w, h, stil); }, true);
    if (im) { im.addEventListener('load', () => legg(tex), { once: true }); tex.addEventListener('dispose', () => { kastet = true; }); } // bildet pakkes fortsatt ut: malt nå, byttet når det kommer
    return tex;
  },
  /* panelveggen: brystpanel, list og puss med flekker (2,3 enheter høy) */
  malPanel(g, w, h, th) {
    const yOf = u => h - u / 2.3 * h, rng = mulberry32(99);
    g.fillStyle = th.wall; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 32) { g.fillStyle = 'rgba(42,26,20,.06)'; g.fillRect(x + 14, 0, 6, yOf(1.02)); }
    g.fillStyle = 'rgba(90,70,40,.12)'; g.beginPath(); g.ellipse(170, yOf(1.8), 40, 26, .2, 0, TAU); g.fill();
    g.fillStyle = th.wains; g.fillRect(0, yOf(1.0), w, yOf(.14) - yOf(1.0));
    g.strokeStyle = Col.dark(th.wains, .7); g.lineWidth = 4;
    for (let x = 16; x < w; x += 32) { g.beginPath(); g.moveTo(x, yOf(.95)); g.lineTo(x + (rng() - .5) * 2, yOf(.2)); g.stroke(); }
    g.fillStyle = Col.light(th.wains, .25); for (let x = 16; x < w; x += 32) g.fillRect(x - 12, yOf(.95), 5, yOf(.2) - yOf(.95));
    g.fillStyle = Col.dark(th.wains, .6); g.fillRect(0, yOf(1.06), w, yOf(.98) - yOf(1.06));
    g.fillStyle = Col.light(th.wains, .3); g.fillRect(0, yOf(1.06), w, 4);
    g.fillStyle = th.base; g.fillRect(0, yOf(.14), w, h - yOf(.14));
    // blekkdetaljer: avflassing, sprekker, skitt nederst
    g.lineCap = 'round'; g.lineJoin = 'round';
    for (const [cx, cy, r] of [[60, yOf(1.7), 22], [200, yOf(1.35), 16]]) { g.fillStyle = Col.dark(th.wall, .88); g.beginPath(); for (let a = 0; a <= 9; a++) { const an = a / 9 * TAU, rr = r * (.6 + rng() * .5); g.lineTo(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr * .7); } g.closePath(); g.fill(); g.strokeStyle = 'rgba(42,26,20,.55)'; g.lineWidth = 2.5; g.stroke(); }
    g.strokeStyle = 'rgba(42,26,20,.5)'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(120, yOf(2.2)); g.lineTo(128, yOf(1.95)); g.lineTo(122, yOf(1.75)); g.lineTo(134, yOf(1.55)); g.stroke();
    const dg = g.createLinearGradient(0, yOf(.6), 0, yOf(.14)); dg.addColorStop(0, 'rgba(40,25,10,0)'); dg.addColorStop(1, 'rgba(40,25,10,.25)'); g.fillStyle = dg; g.fillRect(0, yOf(.6), w, yOf(.14) - yOf(.6));
    g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(0, yOf(1.06)); g.lineTo(w, yOf(1.06)); g.moveTo(0, yOf(.14)); g.lineTo(w, yOf(.14)); g.stroke();
    g.fillStyle = INK; g.fillRect(0, 0, w, 9); g.fillRect(0, h - 7, w, 7);
  },
  /* det skjulte rommet (F.skjult, 48_skjult.js) er ikke der før veggen er slått inn: gulvet der er en egen mesh som står skjult, og veggene
     bygges to ganger, lukket (der det skjulte er tomrom, så sprekken blir vanlig vegg) og åpen (som før). Feiler delingen, bygges etasjen som før */
  level(F, th) {
    const skj = F.skjult && F.skjult.length === F.W * F.H ? F.skjult : null;
    if (skj) try { return this.lagNivaa(F, th, skj); } catch (e) { console.warn('det skjulte rommet feilet, etasjen bygges som før', e); }
    return this.lagNivaa(F, th, null);
  },
  lagNivaa(F, th, skj) {
    if (R.level) { R.scene.remove(R.level); }
    // lysplatene fra forrige etasje: ut av lista over lyskilder (den vokste ellers for hver etasje) og materialene kastes (teksturen deles)
    if (R.levelL) { R.lscene.remove(R.levelL); const gml = R.levelL; gml.traverse(o => { if (o !== gml && o.material) o.material.dispose(); }); if (R.kilder) R.kilder = R.kilder.filter(k => k.parent && k.parent !== gml); }
    if (this.owned) for (const o of this.owned) try { o.dispose(); } catch (e) { }
    this.owned = []; this.opptatt = new Map(); this.skjult = false; this.aapen = null; // veggfelt med dør eller plakat, så 3D-listene holder seg unna
    const L = R.level = new THREE.Group(); R.scene.add(L); R.levelL = new THREE.Group(); R.lscene.add(R.levelL);
    const W = F.W, H = F.H, tiles = F.tiles, isF = (x, z) => x >= 0 && z >= 0 && x < W && z < H && tiles[z * W + x] > 0;
    const isFL = skj ? (x, z) => isF(x, z) && !skj[z * W + x] : isF; // det som synes før sprekken er slått inn
    R.setGrade(this.tema(th, F));
    // gulv med malt skygge i hjørnene (vertexfarger). Det skjulte gulvet får sin egen geometri med samme materiale
    const pos = [], uv = [], col = [], posS = [], uvS = [], colS = [];
    const ao = (f, x, z) => { let n = 0; for (const [dx, dz] of [[-1, -1], [0, -1], [-1, 0], [0, 0]]) if (!f(x + dx, z + dz)) n++; return n; };
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
      const t = tiles[z * W + x]; if (!t) continue;
      const skjult = skj && skj[z * W + x], f = skjult ? isF : isFL, P = skjult ? posS : pos, U = skjult ? uvS : uv, C = skjult ? colS : col;
      let c = t === T_COR ? th.corridor : 1;
      const rid = F.roomId ? F.roomId[z * W + x] : -1;
      let tint = [1, 1, 1]; if (rid >= 0 && F.rooms && F.rooms[rid].role === 'service') tint = SERVICES[F.rooms[rid].service].tint;
      const q = [[x, z], [x, z + 1], [x + 1, z + 1], [x, z], [x + 1, z + 1], [x + 1, z]];
      for (const [px, pz] of q) {
        const k = c * (1 - ao(f, px, pz) * .05);
        P.push(px, 0, pz); U.push(px / W, 1 - pz / H); C.push(k * tint[0], k * tint[1], k * tint[2]);
      }
    }
    const geo = (p, u, c) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(u, 2)); g.setAttribute('color', new THREE.Float32BufferAttribute(c, 3)); return g; };
    const fg = geo(pos, uv, col);
    this.mesh = {};
    { const ft = this.floorCanvas(F, th, skj), fm = new THREE.MeshBasicMaterial({ map: ft, vertexColors: true }); this.owned.push(ft, fm, fg); L.add(this.mesh.gulv = new THREE.Mesh(fg, fm));
      if (skj) { const gs = geo(posS, uvS, colS), m = this.mesh.gulvSkjult = new THREE.Mesh(gs, fm); m.visible = false; m.userData.del = 'aapen'; this.owned.push(gs); L.add(m); } }
    // vegger: høye bak, lave foran. Bare fronten (mot kameraet) og toppen er synlige.
    // hver veggrute får stilen til rommet (eller korridoren) den vender mot: helst sør, så nord, så sidene
    const VG = typeof VEGG === 'object' ? VEGG : { panel: { h: 2.3 } };
    const veggKart = f => {
      const wallH = new Float32Array(W * H), wallS = new Array(W * H);
      const stilFor = (x, z) => { for (const [dx, dz] of [[0, 1], [0, -1], [-1, 0], [1, 0], [-1, 1], [1, 1], [-1, -1], [1, -1]]) { const nx = x + dx, nz = z + dz; if (!f(nx, nz)) continue; const rid = F.roomId ? F.roomId[nz * W + nx] : -1; return rid >= 0 && F.rooms ? (F.rooms[rid].vegg || 'panel') : ((F.korridor && F.korridor.vegg) || 'panel'); } return 'panel'; };
      for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
        if (f(x, z)) continue;
        let near = false; for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) if (f(x + dx, z + dz)) near = true;
        if (!near) continue;
        const st = stilFor(x, z), V = VG[st] || VG.panel; wallS[z * W + x] = VG[st] ? st : 'panel';
        wallH[z * W + x] = (f(x - 1, z - 1) || f(x, z - 1) || f(x + 1, z - 1)) ? (V.lav || .42) : (V.h || 2.3);
      }
      return { wallH, wallS };
    };
    const aapen = veggKart(isF), lukket = skj ? veggKart(isFL) : aapen;
    // sonen rundt det skjulte (to ruter): bare der kan de to byggene bli ulike, for en vegg avhenger bare av 5 x 5 ruter rundt seg
    let sone = null;
    if (skj) { sone = new Uint8Array(W * H); for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) if (skj[z * W + x]) for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) { const nx = x + dx, nz = z + dz; if (nx >= 0 && nz >= 0 && nx < W && nz < H) sone[nz * W + nx] = 1; } }
    const cTopTema = new THREE.Color(th.cap || Col.dark(th.wall, .5)), cInk = new THREE.Color(INK), toppFarge = {};
    // snø: en vegg med snødekt ute rundt seg får hvit topp (#dfe6ef, litt ulik fra rute til rute) og sin egen snøtekstur (stil + '*')
    const SNO = F.vaer === 'sno', uteGulv = (x, z) => { if (!isF(x, z)) return false; const rid = F.roomId ? F.roomId[z * W + x] : -1; return rid >= 0 && F.rooms ? !!F.rooms[rid].ute : !!F.ute; };
    const snoVegg = (x, z) => { if (!SNO) return false; for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) if (uteGulv(x + dx, z + dz)) return true; return false; };
    const snoTopp = (x, z, st) => { const k = .96 + hRute(x, z, 911) * .08, c = new THREE.Color('#dfe6ef').multiplyScalar(k); return st === 'skog' ? new THREE.Color(VG.skog.topp).lerp(c, .7) : c; };
    // en rute gir en front (quadF, per stil) og en topp med blekkant (quadC). T er toppen ({cp, cc}), grp veggene per stil
    const quadC = (T, a, b, c, d, color) => { for (const v of [a, b, c, a, c, d]) { T.cp.push(v[0], v[1], v[2]); T.cc.push(color.r, color.g, color.b); } };
    const quadF = (grp, st, x0, x1, z0, h, sn) => { const G2 = grp[st + (sn ? '*' : '')] || (grp[st + (sn ? '*' : '')] = { fp: [], fu: [] }), hh = (VG[st] && VG[st].h) || 2.3, vs = [[x0, 0, z0, x0 * .5, 0], [x1, 0, z0, x1 * .5, 0], [x1, h, z0, x1 * .5, h / hh], [x0, 0, z0, x0 * .5, 0], [x1, h, z0, x1 * .5, h / hh], [x0, h, z0, x0 * .5, h / hh]]; for (const v of vs) { G2.fp.push(v[0], v[1], v[2]); G2.fu.push(v[3], v[4]); } };
    const rute = (K, x, z, T, grp) => {
      const h = K.wallH[z * W + x]; if (!h) return;
      const st = K.wallS[z * W + x], V = VG[st] || VG.panel, sn = snoVegg(x, z);
      const nh = (nx, nz) => (nx < 0 || nz < 0 || nx >= W || nz >= H) ? 0 : K.wallH[nz * W + nx];
      if (nh(x, z + 1) < h) quadF(grp, st, x, x + 1, z + 1, h, sn && !(isF(x, z + 1) && !uteGulv(x, z + 1))); // ikke snøbånd og istapper på en front inn i en paviljong
      if (V.topp === null) return; // smijernsgjerdet har ingen topp
      const cTop = sn ? snoTopp(x, z, st) : V.topp ? (toppFarge[st] || (toppFarge[st] = new THREE.Color(V.topp))) : cTopTema;
      quadC(T, [x, h, z], [x, h, z + 1], [x + 1, h, z + 1], [x + 1, h, z], cTop);
      // blekkant rundt toppen der naboen er lavere
      const e = .07, y = h + .002;
      if (nh(x, z - 1) !== h) quadC(T, [x, y, z], [x, y, z + e], [x + 1, y, z + e], [x + 1, y, z], cInk);
      if (nh(x, z + 1) !== h) quadC(T, [x, y, z + 1 - e], [x, y, z + 1], [x + 1, y, z + 1], [x + 1, y, z + 1 - e], cInk);
      if (nh(x - 1, z) !== h) quadC(T, [x, y, z], [x, y, z + 1], [x + e, y, z + 1], [x + e, y, z], cInk);
      if (nh(x + 1, z) !== h) quadC(T, [x + 1 - e, y, z], [x + 1 - e, y, z + 1], [x + 1, y, z + 1], [x + 1, y, z], cInk);
    };
    // delene: '' er felles (utenfor sonen, og der lukket og åpen blir like), 'lukket' og 'sprekk' før innbruddet, 'aapen' etter
    const DEL = {}, del = d => DEL[d] || (DEL[d] = { T: { cp: [], cc: [] }, grp: {} });
    const legg = (d, T, grp) => { const D = del(d); for (let k = 0; k < T.cp.length; k++) D.T.cp.push(T.cp[k]); for (let k = 0; k < T.cc.length; k++) D.T.cc.push(T.cc[k]); for (const [st, g] of Object.entries(grp)) { const t = D.grp[st] || (D.grp[st] = { fp: [], fu: [] }); for (const v of g.fp) t.fp.push(v); for (const v of g.fu) t.fu.push(v); } };
    const lik = (a, b) => a.length === b.length && a.every((v, k) => v === b[k]);
    const likt = (A, B) => { const ka = Object.keys(A.grp).sort(), kb = Object.keys(B.grp).sort(); return lik(A.T.cp, B.T.cp) && lik(A.T.cc, B.T.cc) && lik(ka, kb) && ka.every(k => lik(A.grp[k].fp, B.grp[k].fp) && lik(A.grp[k].fu, B.grp[k].fu)); };
    const krakk = new Set(F.crack || []), felles = del('');
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
      const i = z * W + x;
      if (!sone || !sone[i]) { rute(lukket, x, z, felles.T, felles.grp); continue; }
      const A = { T: { cp: [], cc: [] }, grp: {} }, B = { T: { cp: [], cc: [] }, grp: {} }; rute(lukket, x, z, A.T, A.grp); rute(aapen, x, z, B.T, B.grp);
      if (likt(A, B)) { legg('', A.T, A.grp); continue; }
      legg(krakk.has(i) ? 'sprekk' : 'lukket', A.T, A.grp); legg('aapen', B.T, B.grp);
    }
    // toppene: én mesh per del med vertexfarger. Den felles er Paint.mesh.topp som før, de andre ligger i toppEkstra
    this.mesh.toppEkstra = [];
    for (const [d, D] of Object.entries(DEL)) {
      if (d && !D.T.cp.length) continue;
      const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.Float32BufferAttribute(D.T.cp, 3)); cg.setAttribute('color', new THREE.Float32BufferAttribute(D.T.cc, 3));
      const cm = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }), m = new THREE.Mesh(cg, cm); m.userData.del = d; m.visible = d !== 'aapen'; this.owned.push(cg, cm); L.add(m);
      if (d) this.mesh.toppEkstra.push(m); else this.mesh.topp = m;
    }
    // én veggmesh per stil og del; gjerder og ruiner er utklipp, glasset er gjennomsiktig. Delene av samme stil deler tekstur og materiale
    this.mesh.vegger = []; const matFor = {};
    for (const [d, D] of Object.entries(DEL)) for (const [nk, G2] of Object.entries(D.grp)) {
      const sn = nk.endsWith('*'), st = sn ? nk.slice(0, -1) : nk, V = VG[st] || VG.panel, wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.Float32BufferAttribute(G2.fp, 3)); wg.setAttribute('uv', new THREE.Float32BufferAttribute(G2.fu, 2));
      let wm = matFor[nk];
      if (!wm) { const wt = this.wallTex(th, st, F, sn); wm = matFor[nk] = new THREE.MeshBasicMaterial({ map: wt, side: THREE.DoubleSide, transparent: !!V.alfa, alphaTest: V.alfa && st !== 'glass' ? .4 : 0, depthWrite: st !== 'glass' }); this.owned.push(wt, wm); }
      const m = new THREE.Mesh(wg, wm); m.userData.veggStil = st; m.userData.sno = sn; m.userData.del = d; m.visible = d !== 'aapen'; this.owned.push(wg); L.add(m); this.mesh.vegger.push(m);
      if (!d && (st === 'panel' || !this.mesh.vegg)) this.mesh.vegg = m;
    }
    this.wallH = lukket.wallH; this.wallS = lukket.wallS; if (skj) { this.aapen = aapen; this.skjult = true; }
    // ute: bakken fortsetter utenfor rommene, med trær i mørket (17_romtyper.js)
    if (F.ute && typeof Landskap === 'object') { try { Landskap.bakke(F, th, L); } catch (e) { console.warn('bakken feilet', e); } }
    return L;
  },
  decals(F, n = 26) {
    const rng = mulberry32(F.seed || 1), W = F.W;
    // teksturene lages for hver etasje og ryddes med den (Paint.owned); før ble de liggende i grafikkminnet
    const tex = [0, 1, 2, 3].map(k => R.canvasTex(128, 128, g => {
      const r2 = mulberry32(k * 7 + 3);
      if (k < 2) { g.fillStyle = k ? 'rgba(110,70,30,.22)' : 'rgba(60,70,20,.18)'; g.beginPath(); for (let a = 0; a <= 14; a++) { const an = a / 14 * TAU, rr = 38 + r2() * 22; g.lineTo(64 + Math.cos(an) * rr, 64 + Math.sin(an) * rr * .8); } g.fill(); g.fillStyle = 'rgba(60,40,20,.12)'; g.beginPath(); g.arc(64 + 20, 64 - 10, 12, 0, TAU); g.fill(); }
      else { g.strokeStyle = 'rgba(42,26,20,.55)'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); let x = 20, y = 30 + r2() * 60; g.moveTo(x, y); while (x < 110) { x += 10 + r2() * 14; y += (r2() - .5) * 26; g.lineTo(x, y); } g.stroke(); if (k === 3) { g.beginPath(); g.moveTo(60, 60); g.lineTo(70 + r2() * 20, 95); g.stroke(); } }
    })); this.owned.push(...tex);
    for (let i = 0; i < n; i++) {
      const x = rng() * W, z = rng() * F.H, t = gulvSynlig(Math.floor(z) * W + Math.floor(x)); if (!t) continue;
      const mat = new THREE.MeshBasicMaterial({ map: tex[Math.floor(rng() * 4)], transparent: true, depthWrite: false }); this.owned.push(mat);
      const m = new THREE.Mesh(R.geo('plane1', () => new THREE.PlaneGeometry(1, 1)), mat);
      m.rotation.x = -Math.PI / 2; m.rotation.z = rng() * TAU; const s = .8 + rng() * 1.4; m.scale.set(s, s, 1); m.position.set(x, .008, z); m.renderOrder = 1; R.level.add(m);
    }
  },
  poster(text, x, z) {
    const t = R.posterTex(text), mat = new THREE.MeshBasicMaterial({ map: t }); this.owned.push(t, mat);
    const m = new THREE.Mesh(R.geo('poster2', () => new THREE.PlaneGeometry(.72, .95)), mat);
    m.position.set(x, 1.62, z + .01); R.level.add(m); this.opptatt.set(Math.floor(x) + ',' + z, 'plakat'); return m;
  },
  door(x, z, label) {
    const tex = R.canvasTex(160, 260, g => {
      g.fillStyle = '#6b4a2c'; g.fillRect(10, 30, 140, 230); g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(10, 30, 140, 230);
      g.fillStyle = '#7d5834'; g.fillRect(24, 50, 50, 90); g.fillRect(86, 50, 50, 90); g.fillRect(24, 156, 50, 90); g.fillRect(86, 156, 50, 90);
      g.strokeStyle = '#3a2414'; g.lineWidth = 4; for (const [a, b] of [[24, 50], [86, 50], [24, 156], [86, 156]]) g.strokeRect(a, b, 50, 90);
      g.fillStyle = '#d4b048'; g.beginPath(); g.arc(128, 160, 7, 0, TAU); g.fill(); g.stroke();
      g.fillStyle = '#efe4c4'; g.fillRect(20, 0, 120, 30); g.strokeStyle = INK; g.lineWidth = 5; g.strokeRect(20, 0, 120, 30);
      g.fillStyle = INK; g.font = 'bold 17px Georgia, serif'; g.textAlign = 'center'; g.fillText(label, 80, 21);
    });
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true }); this.owned.push(tex, mat);
    const m = new THREE.Mesh(R.geo('door', () => new THREE.PlaneGeometry(1.1, 1.8)), mat);
    m.position.set(x, .9, z + .012); R.level.add(m); for (const tx of [Math.floor(x - .5), Math.floor(x)]) this.opptatt.set(tx + ',' + z, 'dor'); return m;
  }
};

/* gulv som synes: ikke tomrom, og ikke det skjulte rommet før veggen er slått inn (G.skjult, 48_skjult.js) */
function gulvSynlig(i) { const F = G.F; return !!F && i >= 0 && i < F.tiles.length && F.tiles[i] > 0 && !(G.skjult && G.skjult[i]); }
