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
  floorTex(th) {
    const rng = mulberry32(777), T = 256;
    return R.canvasTex(T * 2, T * 2, (g) => {
      for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
        const x = i * T, y = j * T, base = (i + j) % 2 ? (th.tileB2 || th.tileB) : th.tileA;
        g.fillStyle = base; g.fillRect(x, y, T, T);
        // malte flekker
        for (let k = 0; k < 5; k++) {
          const cx = x + rng() * T, cy = y + rng() * T, r = 20 + rng() * 60, dark = rng() < .6;
          g.fillStyle = dark ? 'rgba(40,30,10,.07)' : 'rgba(255,250,220,.08)'; g.beginPath();
          for (let a = 0; a <= 10; a++) { const an = a / 10 * TAU, rr = r * (.7 + rng() * .5); g.lineTo(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr * .7); }
          g.fill();
        }
        // lys kant oppe og til venstre, skygge nede og til høyre
        g.fillStyle = Col.light(base, .22); g.fillRect(x + 6, y + 6, T - 12, 7); g.fillRect(x + 6, y + 6, 7, T - 12);
        g.fillStyle = Col.dark(base, .86); g.fillRect(x + 6, y + T - 13, T - 12, 7); g.fillRect(x + T - 13, y + 6, 7, T - 12);
      }
      g.strokeStyle = th.grout; g.lineWidth = 5; g.lineCap = 'round';
      for (let k = 0; k <= 2; k++) { this.wobble(g, k * T, 0, k * T, T * 2, 3, rng); this.wobble(g, 0, k * T, T * 2, k * T, 3, rng); }
    }, true);
  },
  /* hele gulvet males som ett lerret: fliser med skjeve blekkfuger, malte flekker,
     tegnet skygge langs veggene, rusk og en tykk blekkant der gulvet møter veggen */
  floorCanvas(F, th) {
    const W = F.W, H = F.H, T = R.lowTex ? 16 : W * H > 1800 ? (R.coarse || R.tv ? 24 : 32) : 64, rng = mulberry32((F.seed || 1) * 31 + 7);
    const c = document.createElement('canvas'); c.width = W * T; c.height = H * T; const g = c.getContext('2d');
    const isF = (x, z) => x >= 0 && z >= 0 && x < W && z < H && F.tiles[z * W + x] > 0, isC = (x, z) => isF(x, z) && F.tiles[z * W + x] === T_COR;
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
        if (sno && UTE[i]) snoPaa(g, x * T, z * T, T, { x, z });
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
    // 6) tegnet skygge langs veggene i nord og vest
    g.fillStyle = 'rgba(40,24,12,.26)';
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
      if (!isF(x, z)) continue;
      if (!isF(x, z - 1)) { g.beginPath(); g.moveTo(x * T, z * T); g.lineTo(x * T + T, z * T); g.lineTo(x * T + T, z * T + T * (.42 + Math.sin(x * 1.7) * .06)); g.quadraticCurveTo(x * T + T / 2, z * T + T * (.5 + Math.cos(x * 2.3) * .08), x * T, z * T + T * (.42 + Math.sin((x - 1) * 1.7) * .06)); g.closePath(); g.fill(); }
      if (!isF(x - 1, z)) { g.fillRect(x * T, z * T, T * .2, T); }
    }
    // 7) rusk: papirbiter, piller, støv, sprekker
    for (let i = 0; i < W * H / 6; i++) {
      const x = rng() * W, z = rng() * H; if (!isF(Math.floor(x), Math.floor(z))) continue;
      const px = x * T, py = z * T, k = rng();
      // ute: løv, kvister og småstein i stedet for papir og piller
      if (UTE[Math.floor(z) * W + Math.floor(x)]) {
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
      if (!isF(x, z - 1)) e(x, z, x + 1, z); if (!isF(x, z + 1)) e(x, z + 1, x + 1, z + 1); if (!isF(x - 1, z)) e(x, z, x, z + 1); if (!isF(x + 1, z)) e(x + 1, z, x + 1, z + 1);
    }
    const tex = new THREE.CanvasTexture(c); tex.anisotropy = 4; return tex;
  },
  wallTex(th, stil = 'panel') {
    // 2 enheter bred og like høy som veggen (128 px per enhet). v = høyde / veggens høyde
    const V = typeof VEGG === 'object' && VEGG[stil];
    if (V && V.tegn) { const hp = Math.round((V.h || 2.3) * 128); return R.canvasTex(256, hp, (g, w, h) => V.tegn(g, w, h, th, mulberry32(stil.length * 97 + 5)), true); }
    return R.canvasTex(256, 296, (g, w, h) => {
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
    }, true);
  },
  level(F, th) {
    if (R.level) { R.scene.remove(R.level); }
    // lysplatene fra forrige etasje: ut av lista over lyskilder (den vokste ellers for hver etasje) og materialene kastes (teksturen deles)
    if (R.levelL) { R.lscene.remove(R.levelL); const gml = R.levelL; gml.traverse(o => { if (o !== gml && o.material) o.material.dispose(); }); if (R.kilder) R.kilder = R.kilder.filter(k => k.parent && k.parent !== gml); }
    if (this.owned) for (const o of this.owned) try { o.dispose(); } catch (e) { }
    this.owned = []; this.opptatt = new Map(); // veggfelt med dør eller plakat, så 3D-listene holder seg unna
    const L = R.level = new THREE.Group(); R.scene.add(L); R.levelL = new THREE.Group(); R.lscene.add(R.levelL);
    const W = F.W, H = F.H, tiles = F.tiles, isF = (x, z) => x >= 0 && z >= 0 && x < W && z < H && tiles[z * W + x] > 0;
    R.setGrade(th);
    // gulv med malt skygge i hjørnene (vertexfarger)
    const pos = [], uv = [], col = [];
    const ao = (x, z) => { let n = 0; for (const [dx, dz] of [[-1, -1], [0, -1], [-1, 0], [0, 0]]) if (!isF(x + dx, z + dz)) n++; return n; };
    const northShade = (x, z) => (!isF(x, z - 1) || !isF(x - 1, z - 1)) ? .8 : 1;
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
      const t = tiles[z * W + x]; if (!t) continue;
      let c = t === T_COR ? th.corridor : 1;
      const rid = F.roomId ? F.roomId[z * W + x] : -1;
      let tint = [1, 1, 1]; if (rid >= 0 && F.rooms && F.rooms[rid].role === 'service') tint = SERVICES[F.rooms[rid].service].tint;
      const q = [[x, z], [x, z + 1], [x + 1, z + 1], [x, z], [x + 1, z + 1], [x + 1, z]];
      for (const [px, pz] of q) {
        const k = c * (1 - ao(px, pz) * .05);
        pos.push(px, 0, pz); uv.push(px / W, 1 - pz / H); col.push(k * tint[0], k * tint[1], k * tint[2]);
      }
    }
    const fg = new THREE.BufferGeometry();
    fg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); fg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); fg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    this.mesh = {};
    { const ft = this.floorCanvas(F, th), fm = new THREE.MeshBasicMaterial({ map: ft, vertexColors: true }); this.owned.push(ft, fm, fg); L.add(this.mesh.gulv = new THREE.Mesh(fg, fm)); }
    // vegger: høye bak, lave foran. Bare fronten (mot kameraet) og toppen er synlige.
    // hver veggrute får stilen til rommet (eller korridoren) den vender mot: helst sør, så nord, så sidene
    const wallH = new Float32Array(W * H), wallS = new Array(W * H);
    const stilFor = (x, z) => { for (const [dx, dz] of [[0, 1], [0, -1], [-1, 0], [1, 0], [-1, 1], [1, 1], [-1, -1], [1, -1]]) { const nx = x + dx, nz = z + dz; if (!isF(nx, nz)) continue; const rid = F.roomId ? F.roomId[nz * W + nx] : -1; return rid >= 0 && F.rooms ? (F.rooms[rid].vegg || 'panel') : ((F.korridor && F.korridor.vegg) || 'panel'); } return 'panel'; };
    const VG = typeof VEGG === 'object' ? VEGG : { panel: { h: 2.3 } };
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
      if (tiles[z * W + x]) continue;
      let near = false; for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) if (isF(x + dx, z + dz)) near = true;
      if (!near) continue;
      const st = stilFor(x, z), V = VG[st] || VG.panel; wallS[z * W + x] = VG[st] ? st : 'panel';
      wallH[z * W + x] = (isF(x - 1, z - 1) || isF(x, z - 1) || isF(x + 1, z - 1)) ? (V.lav || .42) : (V.h || 2.3);
    }
    const cp = [], cc = [], grupper = {};
    const cTopTema = new THREE.Color(th.cap || Col.dark(th.wall, .5)), cInk = new THREE.Color(INK), toppFarge = {};
    const quadC = (a, b, c, d, color) => { for (const v of [a, b, c, a, c, d]) { cp.push(v[0], v[1], v[2]); cc.push(color.r, color.g, color.b); } };
    const quadF = (st, x0, x1, z0, h) => { const G2 = grupper[st] || (grupper[st] = { fp: [], fu: [] }), hh = (VG[st] && VG[st].h) || 2.3, vs = [[x0, 0, z0, x0 * .5, 0], [x1, 0, z0, x1 * .5, 0], [x1, h, z0, x1 * .5, h / hh], [x0, 0, z0, x0 * .5, 0], [x1, h, z0, x1 * .5, h / hh], [x0, h, z0, x0 * .5, h / hh]]; for (const v of vs) { G2.fp.push(v[0], v[1], v[2]); G2.fu.push(v[3], v[4]); } };
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
      const h = wallH[z * W + x]; if (!h) continue;
      const st = wallS[z * W + x], V = VG[st] || VG.panel;
      const nh = (nx, nz) => (nx < 0 || nz < 0 || nx >= W || nz >= H) ? 0 : wallH[nz * W + nx];
      if (nh(x, z + 1) < h) quadF(st, x, x + 1, z + 1, h);
      if (V.topp === null) continue; // smijernsgjerdet har ingen topp
      const cTop = V.topp ? (toppFarge[st] || (toppFarge[st] = new THREE.Color(V.topp))) : cTopTema;
      quadC([x, h, z], [x, h, z + 1], [x + 1, h, z + 1], [x + 1, h, z], cTop);
      // blekkant rundt toppen der naboen er lavere
      const e = .07, y = h + .002;
      if (nh(x, z - 1) !== h) quadC([x, y, z], [x, y, z + e], [x + 1, y, z + e], [x + 1, y, z], cInk);
      if (nh(x, z + 1) !== h) quadC([x, y, z + 1 - e], [x, y, z + 1], [x + 1, y, z + 1], [x + 1, y, z + 1 - e], cInk);
      if (nh(x - 1, z) !== h) quadC([x, y, z], [x, y, z + 1], [x + e, y, z + 1], [x + e, y, z], cInk);
      if (nh(x + 1, z) !== h) quadC([x + 1 - e, y, z], [x + 1 - e, y, z + 1], [x + 1, y, z + 1], [x + 1, y, z], cInk);
    }
    const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.Float32BufferAttribute(cp, 3)); cg.setAttribute('color', new THREE.Float32BufferAttribute(cc, 3));
    { const cm = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }); this.owned.push(cg, cm); L.add(this.mesh.topp = new THREE.Mesh(cg, cm)); }
    // én veggmesh per stil; gjerder og ruiner er utklipp, glasset er gjennomsiktig
    this.mesh.vegger = [];
    for (const [st, G2] of Object.entries(grupper)) {
      const V = VG[st] || VG.panel, wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.Float32BufferAttribute(G2.fp, 3)); wg.setAttribute('uv', new THREE.Float32BufferAttribute(G2.fu, 2));
      const wt = this.wallTex(th, st), wm = new THREE.MeshBasicMaterial({ map: wt, side: THREE.DoubleSide, transparent: !!V.alfa, alphaTest: V.alfa && st !== 'glass' ? .4 : 0, depthWrite: st !== 'glass' });
      const m = new THREE.Mesh(wg, wm); m.userData.veggStil = st; this.owned.push(wg, wt, wm); L.add(m); this.mesh.vegger.push(m);
      if (st === 'panel' || !this.mesh.vegg) this.mesh.vegg = m;
    }
    this.wallH = wallH; this.wallS = wallS;
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
      const x = rng() * W, z = rng() * F.H, t = F.tiles[Math.floor(z) * W + Math.floor(x)]; if (!t) continue;
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
