/* ============================================================
   DET SKJULTE  -  det hemmelige rommet finnes ikke før man bryter seg inn
   Generatoren merker gangen, sprekken og rommet i F.skjult, og G.skjult er den samme masken så lenge veggen står (null etterpå).
   Paint.level bygger etasjen lukket: sprekken er vanlig vegg, og gulvet og veggene bak står ferdige, men skjult (del 'aapen').
   Her gjemmes innholdet (møbler, lys, gløden og glasset), og når veggen faller, byttes det lukkede mot det åpne og lysene tennes.
   Hintene ligger i lag, så det er rettferdig uten lyd og likevel ikke opplagt:
   - en flekk nyere puss formet som en døråpning, med en hårfin sprekk som vokser for hvert slag (visnet hekk og kvist ute)
   - trekk: vinden dempet bak veggen (en klokke som tikker inne i hekken ute), og kalde drag langs gulvet innen fem ruter
   - banking: et vanlig slag mot en vegg gir et dumpt, tett slag, sprekken svarer hult (13_rom.js)
   - én boble per etasje og et tips første gang, og monokkelen gir en tydeligere flekk med lys i sprekken
   Innbruddet: stopp i slaget, bristen (sprekkveggen fra ChatGPT, inne) et femtedels sekund, veggen synker i støv, innestengt luft
   strømmer ut, lysene tennes, møblene spretter opp og tennene triller ut. Med enkel grafikk uten partikler og drag.
   ============================================================ */
const Skjult = {
  props: [], pd: [], lys: [], tenn: null, // lys: platene som tennes ved innbruddet (tingenes, glassets og fyllyset fra decorateLevel)
  info: null, vis: null, trekkE: null, // info: sprekken og flekken, vis: innbruddet mens det pågår, trekkE: draget langs gulvet
  /* rommets egne ting (fra spawnProps): usynlige, med lyset slukket og uten glød til veggen er slått inn */
  gjemTing() {
    this.props = []; this.pd = []; this.lys = []; this.tenn = null; this.info = null; this.vis = null; this.trekkE = null;
    const F = G.F, S = G.skjult; if (!F || !S) return;
    const hemm = F.rooms.find(r => r.role === 'secret'); if (!hemm) return;
    for (const o of G.props) if (o.room === hemm.id) { o.skjult = true; if (o.g) o.g.visible = false; if (o.light) this.slukk(o.light); this.props.push(o); }
    if (typeof Glod === 'object') for (let i = Glod.liste.length - 1; i >= 0; i--) { const E = Glod.liste[i]; if (E.eier && E.eier.skjult) { Glod.fjern(E); Glod.liste.splice(i, 1); } }
  },
  slukk(L) { if (!L || !L.userData || !L.userData.col) return; R.setLight(L, 0); if (!this.lys.includes(L)) this.lys.push(L); },
  /* preparatglasset eller kuriositeten i rommet (Items.onFloor) */
  gjem(pd) { if (!pd || !G.skjult) return; if (pd.g) pd.g.visible = false; this.slukk(pd.light); this.pd.push(pd); },

  /* ---------- sprekken: hvor den står og hvilken vei rommet foran ligger ---------- */
  finnInfo() {
    const F = G.F, cr = F.crack || [], S = F.skjult; if (!cr.length || !S || !Paint.wallH) return null;
    let x0 = 1e9, x1 = -1, z0 = 1e9, z1 = -1; for (const i of cr) { const x = i % F.W, z = (i / F.W) | 0; x0 = Math.min(x0, x); x1 = Math.max(x1, x + 1); z0 = Math.min(z0, z); z1 = Math.max(z1, z + 1); }
    const mid = cr[Math.floor(cr.length / 2)], mx = mid % F.W, mz = (mid / F.W) | 0, fri = (x, z) => x >= 0 && z >= 0 && x < F.W && z < F.H && F.tiles[z * F.W + x] > 0 && !S[z * F.W + x];
    // side: hvilken vegg i rommet foran sprekken er (n: nordveggen, rommet ligger sør for den), u: retningen inn i rommet
    const side = fri(mx, mz + 1) ? 'n' : fri(mx, mz - 1) ? 's' : fri(mx + 1, mz) ? 'w' : fri(mx - 1, mz) ? 'e' : null; if (!side) return null;
    const ux = side === 'w' ? 1 : side === 'e' ? -1 : 0, uz = side === 'n' ? 1 : side === 's' ? -1 : 0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    let h = 0; for (const i of cr) h = Math.max(h, Paint.wallH[i] || 0);
    const rid = F.roomId ? F.roomId[(mz + uz) * F.W + mx + ux] : -1, ute = rid >= 0 && F.rooms ? !!F.rooms[rid].ute : !!F.ute;
    return { side, ux, uz, cx, cz, x0, x1, z0, z1, ex: side === 'w' ? x1 : side === 'e' ? x0 : cx, ez: side === 'n' ? z1 : side === 's' ? z0 : cz, // e: midt på veggflaten mot rommet
      len: cr.length, h: h || 2.3, st: (Paint.wallS && Paint.wallS[mid]) || 'panel', ute, sno: ute && F.vaer === 'sno', steg: 0, kjent: false, meshes: [] };
  },
  /* flekken: én tekstur per etasje (256 x 512, i Paint.owned) med døråpningen, stripene til toppen og den lave fronten, støvet og ruskene.
     Nordvegg: en flate foran veggen som døra (Paint.door). Lav sørvegg: toppen og fronten. Øst og vest: bare toppen, som er det som synes */
  lagDekal() {
    const I = this.info = this.finnInfo(); if (!I || !R.level) return;
    const tex = I.tex = R.canvasTex(256, 512, () => { }), mat = I.mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }); Paint.owned.push(tex, mat);
    const plan = (w, h, y0, y1) => { const g = new THREE.PlaneGeometry(w, h), uv = g.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setY(k, 1 - (y1 - (y1 - y0) * uv.getY(k)) / 512); Paint.owned.push(g); return g; };
    const legg = (geo, x, y, z, flat, del) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (flat) m.rotation.set(-Math.PI / 2, 0, Math.atan2(I.ux, I.uz)); m.renderOrder = 1; m.userData.dekal = del; m.userData.y0 = y; R.level.add(m); I.meshes.push(m); return m; };
    const L = I.len - .15, h = I.h, hd = Math.min(1.95, h - .3);
    if (I.side === 'n') legg(plan(Math.min(2.6, L), hd, 0, 200), I.cx, hd / 2, I.ez + .012, false, 'flate');
    else {
      legg(plan(L, .92, 200, 240), I.side === 's' ? I.cx : I.x0 + .5, h + .004, I.side === 's' ? I.z0 + .5 : I.cz, true, 'topp');
      if (I.side === 's') legg(plan(L, h - .02, 240, 280), I.cx, h / 2, I.z1 + .012, false, 'flate');
    }
    legg(plan(2.2, .8, 280, 376), I.ex + I.ux * .42, .011, I.ez + I.uz * .42, true, 'stov');
    this.tegn();
  },
  farger(I) {
    const th = G.th || {}, V = (typeof VEGG === 'object' && VEGG[I.st]) || {}, v0 = th.wall || '#c8b890';
    const vegg = { paviljong: '#d8d0b8', fliser: '#d8d4c4', mur: '#a45a40', stein: '#848078', polstret: '#e2d8be', tre: '#86603a', tommer: '#8a6440', steinmur: '#8a8676', ruin: '#807a6c', gjerde: '#6a665e', glass: '#dfe8e4', hekk: '#6a5a2a', skog: '#5a4028' }[I.st] || v0;
    return { vegg, topp: I.sno ? '#dfe6ef' : V.topp || th.cap || Col.dark(v0, .5), ute: I.st === 'hekk' || I.st === 'skog' };
  },
  /* tegner hele teksturen på nytt: for hvert slag (steget), og når monokkelen kommer eller går. Alle tilfeldige tall trekkes likt hver gang, så formen står */
  tegn() {
    const I = this.info; if (!I || !I.tex) return;
    const g = I.tex.image.getContext('2d'), rng = mulberry32(((G.F && G.F.seed) || 1) * 13 + 5), K = this.farger(I);
    g.clearRect(0, 0, 256, 512);
    this.flekk(g, rng, 0, 200, K.vegg, I, true); this.flekk(g, rng, 200, 240, K.topp, I, false); this.flekk(g, rng, 240, 280, null, I, false); // den lave fronten er som oftest sokkelen, så den får en nøytral vask
    this.stov(g, rng, 280, 376, K); this.rusk(g, rng, 376, 476, K);
    I.tex.needsUpdate = true;
  },
  flekk(g, rng, y0, y1, farge, I, dor) {
    const st = I.st, hh = y1 - y0, x0 = dor ? 30 : 8, x1 = 256 - x0, top = y0 + (dor ? 8 : 5), bunn = y1 - (dor ? 1 : 5), j = s => (rng() - .5) * s, ute = st === 'hekk' || st === 'skog';
    // omrisset: ujevnt, med en flat bue over døråpningen
    const P = [];
    if (dor) { const bue = top + 26; for (let k = 0; k <= 6; k++) P.push([x0 + j(5), bunn - k * (bunn - bue) / 6]); for (let k = 1; k < 12; k++) { const a = Math.PI - k / 12 * Math.PI; P.push([128 + Math.cos(a) * (x1 - x0) / 2 + j(4), bue - Math.sin(a) * (bue - top) + j(3)]); } for (let k = 6; k >= 0; k--) P.push([x1 + j(5), bunn - k * (bunn - bue) / 6]); }
    else { for (let k = 0; k <= 10; k++) P.push([x0 + k * (x1 - x0) / 10 + j(3), top + j(3)]); for (let k = 10; k >= 0; k--) P.push([x0 + k * (x1 - x0) / 10 + j(3), bunn + j(3)]); }
    // hårstreken: fra gulvet opp mot overliggeren, eller langs toppen fra midten og ut. Grenene og flekkene trekkes også før noe tegnes
    const hs = [];
    if (dor) { let x = 128 + j(30); for (let k = 0; k <= 14; k++) { hs.push([x, bunn - k * (bunn - top - 14) / 14]); x += j(16); } }
    else for (let k = 0; k <= 22; k++) hs.push([x0 + 10 + k * (x1 - x0 - 20) / 22, (top + bunn) / 2 + j(hh * .26)]);
    const gren = [0, 1].map(() => ({ k: 3 + Math.floor(rng() * 9), a: j(2.4), l: 10 + rng() * 18 })), fl = [];
    for (let k = 0; k < 70; k++) fl.push([x0 + rng() * (x1 - x0), top + rng() * (bunn - top), 2 + rng() * 6, rng()]);
    const sti = () => { g.beginPath(); P.forEach(([x, y], k) => k ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); };
    // ute er det ingen kant: bladene tynnes ut mot sidene, så flekken ikke blir en firkant i hekken
    const my = (top + bunn) / 2, kant = (x, y) => clamp((1 - ((x - 128) / ((x1 - x0) / 2)) ** 2 - ((y - my) / ((bunn - top) / 2 + 2)) ** 2) * 1.8, 0, 1);
    g.save(); if (!ute) { sti(); g.clip(); }
    // visnet hekk (brune blader) og kvist i skogen. På snøen stikker bare noen få kvister opp
    const tynn = I.sno && !dor ? .45 : 1;
    if (st === 'hekk') for (const [x, y, r, v] of fl) { g.fillStyle = v < .4 ? 'rgba(104,92,46,.34)' : v < .75 ? 'rgba(116,98,52,.28)' : 'rgba(74,62,30,.32)'; g.globalAlpha = tynn * kant(x, y); g.beginPath(); g.arc(x, y, r + 1, 0, TAU); g.fill(); g.globalAlpha = 1; }
    else if (st === 'skog') { g.lineCap = 'round'; fl.forEach(([x, y, r, v], k) => { if (k % 2 && tynn < 1) return; const a = v * Math.PI, l = r * 3.4, f = tynn * kant(x, y); g.strokeStyle = v < .5 ? `rgba(96,70,42,${.5 * f})` : `rgba(60,44,24,${.55 * f})`; g.lineWidth = 1.2 + r * .25; g.beginPath(); g.moveTo(x - Math.cos(a) * l, y - Math.sin(a) * l); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }); }
    else if (st !== 'glass') {
      // ny puss: en tynn, lys vask, så mønsteret under synes gjennom. Murstein, stein og tre får minst (ny mørtel), toppen litt mer
      const mur = { mur: 1, stein: 1, steinmur: 1, ruin: 1, tre: 1, tommer: 1 }[st];
      g.globalAlpha = farge ? (dor ? (mur ? .12 : .17) : .2) : .12; g.fillStyle = farge ? Col.light(farge, .5) : '#fff6e4'; g.fillRect(0, y0, 256, hh); g.globalAlpha = 1;
      g.strokeStyle = 'rgba(255,250,240,.07)'; g.lineWidth = 6; for (let k = 0; k < 4; k++) { const [x, y, r] = fl[k]; g.beginPath(); g.arc(x, y, 16 + r * 3, .3, 2.2); g.stroke(); }
    }
    g.restore();
    if (!ute && st !== 'glass') { g.save(); g.setLineDash([16, 7, 5, 9]); g.strokeStyle = I.kjent ? 'rgba(42,26,20,.4)' : 'rgba(42,26,20,.13)'; g.lineWidth = 2; sti(); g.stroke(); g.restore(); }
    // sprekken vokser et steg for hvert slag: halvveis, nesten hele og med grener, og til slutt et hull
    const steg = Math.min(2, I.steg), n = Math.max(2, Math.round(hs.length * [.5, .8, 1][steg])), fra = dor ? 0 : Math.floor((hs.length - n) / 2), L = hs.slice(fra, fra + n);
    const mork = ute ? 'rgba(10,14,6,.5)' : st === 'glass' ? 'rgba(240,250,255,.85)' : 'rgba(42,26,20,.55)', lw = (dor ? 1.8 : 1.3) + steg * .7 + (ute ? .5 : 0);
    const strek = (S, col, b, ox = 0, oy = 0) => { g.strokeStyle = col; g.lineWidth = b; g.lineJoin = g.lineCap = 'round'; g.beginPath(); S.forEach(([x, y], k) => k ? g.lineTo(x + ox, y + oy) : g.moveTo(x + ox, y + oy)); g.stroke(); };
    if (I.kjent) strek(L, 'rgba(255,214,120,.22)', lw * 4); // monokkelen: lys gjennom sprekken
    if (!dor && !ute) strek(L, 'rgba(236,222,196,.28)', lw * .8, .9, 1.2); // en lys kant under, så streken synes på en mørk topp
    strek(L, mork, lw);
    for (let b = 0; b < steg; b++) { const G0 = gren[b], p = L[G0.k % L.length], a = dor ? -Math.PI / 2 + G0.a : G0.a + (b ? Math.PI / 2 : -Math.PI / 2); strek([p, [p[0] + Math.cos(a) * G0.l, p[1] + Math.sin(a) * G0.l * (dor ? 1 : .5)]], mork, lw * .7); }
    if (steg >= 2) { const p = L[Math.floor(L.length * .45)]; g.fillStyle = ute ? '#050804' : '#15100c'; g.beginPath(); g.ellipse(p[0], p[1], dor ? 5 : 4, dor ? 7 : 3, 0, 0, TAU); g.fill(); }
    if (I.kjent) strek(L, 'rgba(255,226,150,.9)', Math.max(1, lw * .45), -.6, -.6);
  },
  /* støvet (eller visne blader) i en vifte på gulvet ved foten av veggen. Øverst i ruta er veggen */
  stov(g, rng, y0, y1, K) {
    const hh = y1 - y0, c = Col.rgb(Col.light(K.vegg, .3));
    const gr = g.createRadialGradient(128, y0, 4, 128, y0, 80); gr.addColorStop(0, K.ute ? 'rgba(90,70,30,.18)' : 'rgba(220,210,190,.16)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, y0, 256, hh);
    for (let k = 0; k < 90; k++) {
      const a = Math.PI * (.12 + rng() * .76), r = Math.pow(rng(), 1.6) * hh * .95, x = 128 + Math.cos(a) * r * 1.3, y = y0 + 2 + Math.sin(a) * r, s = 1.5 + rng() * 3.5 * (1 - r / hh), v = rng();
      g.fillStyle = K.ute ? (v < .5 ? 'rgba(122,100,48,.45)' : 'rgba(70,52,26,.4)') : `rgba(${c[0]},${c[1]},${c[2]},${(.18 + v * .22).toFixed(2)})`;
      g.beginPath(); if (K.ute) g.ellipse(x, y, s * 1.6, s * .8, v * 3, 0, TAU); else g.arc(x, y, s, 0, TAU); g.fill();
    }
  },
  /* ruskene på terskelen etter innbruddet: pussbiter med blekkant, eller kvister og blader ute */
  rusk(g, rng, y0, y1, K) {
    const my = (y0 + y1) / 2, gr = g.createRadialGradient(128, my, 10, 128, my, 125); gr.addColorStop(0, K.ute ? 'rgba(80,64,30,.35)' : 'rgba(210,200,180,.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, y0, 256, y1 - y0);
    for (let k = 0; k < 26; k++) {
      const x = 16 + rng() * 224, y = y0 + 12 + rng() * (y1 - y0 - 24), r = 4 + rng() * 9, n = 4 + Math.floor(rng() * 3), a0 = rng() * TAU, P = [];
      for (let q = 0; q < n; q++) { const a = a0 + q / n * TAU, rr = r * (.6 + rng() * .5); P.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * .7]); }
      const v = rng(); g.fillStyle = K.ute ? (v < .5 ? '#6a5a2a' : '#3e3018') : Col.dark(K.vegg, .8 + v * .25); g.strokeStyle = 'rgba(42,26,20,.75)'; g.lineWidth = 1.6;
      g.beginPath(); P.forEach(([px, py], q) => q ? g.lineTo(px, py) : g.moveTo(px, py)); g.closePath(); g.fill(); g.stroke();
    }
  },
  /* steget i sprekken følger det svakeste feltet: 3 poeng igjen gir 0, 2 gir 1, 1 gir 2 */
  oppdaterSteg() {
    const I = this.info; if (!I) return; let hp = 3; for (const c of Spesial.cracks) if (!c.broken) hp = Math.min(hp, c.hp);
    const s = clamp(3 - hp, 0, 2); if (s !== I.steg) { I.steg = s; this.tegn(); }
  },
  /* boblene: pasienten sier det høyt (én gang per etasje, 13_rom.js) */
  ord() {
    const I = this.info;
    if (I && I.st === 'hekk') return ['Hekken er visnet akkurat her.', 'Tikker det inne i hekken?', 'Hvorfor er bare denne biten brun?'];
    if (I && I.st === 'skog') return ['Noen har lagt kvister her med vilje.', 'Det trekker fra kvisthaugen.', 'Det er luft bak der.'];
    return ['Det trekker herfra.', 'Den flekken er pusset over.', 'Hvorfor er akkurat denne biten nypusset?'];
  },

  /* ---------- trekken: lyden bak veggen og dragene langs gulvet ---------- */
  // lyden: egen sløyfe (trekk_vind, trekk_tikk), så vinden i etasjen og været ute beholder sitt eget filter
  lyd(M) {
    const I = this.info, P = G.player; if (!I || !G.skjult || !P || !P.alive || G.combat || G.drom || this.vis) return;
    let d = 99; for (const c of Spesial.cracks) if (!c.broken) d = Math.min(d, Math.hypot(c.x - P.x, c.z - P.z));
    const n = clamp((5 - d) / 3, 0, 1); if (n <= 0) return;
    const pan = clamp((I.ex - P.x) / 4, -.8, .8);
    if (I.ute) M.trekk_tikk = [.2 * n, 1600 + 900 * n, pan]; else M.trekk_vind = [.18 * n, 520 + 330 * n, pan];
  },
  // dragene: ett Points-objekt (glød av typen trekk) så lenge pasienten er innen fem ruter, åtte med monokkelen. Blåser ut av veggen
  trekk() {
    const I = this.info, P = G.player, E0 = this.trekkE, finnes = E0 && typeof Glod === 'object' && Glod.liste.includes(E0);
    const rekk = G.sprekkKjent ? 8 : 5, full = G.sprekkKjent ? 4 : 2, d = I && G.skjult && P && !this.vis ? Math.hypot(P.x - I.ex, P.z - I.ez) : 99;
    if (E0 && (!finnes || d > rekk + 1)) { if (finnes) { Glod.fjern(E0); Glod.liste.splice(Glod.liste.indexOf(E0), 1); } this.trekkE = null; }
    if (d > rekk + .5 || typeof Glod !== 'object') return;
    if (!this.trekkE) { const E = Glod.lag(I.ex + I.ux * .2, .08, I.ez + I.uz * .2, 'trekk'); if (!E) return; E.pts.rotation.y = Math.atan2(-I.uz, I.ux); this.trekkE = E; }
    this.trekkE.mat.uniforms.uStyrke.value = clamp((rekk - d) / (rekk - full), 0, 1);
  },

  /* ---------- innbruddet ---------- */
  /* siste slag: logikken skjer med en gang (kartet, maskene og alt som spør gulvSynlig ser rommet, veggkartet er det åpne), og så
     går forløpet i tick: 0 s brist og støt, 0,2 s veggen synker og luft strømmer ut, 0,25 s byttet, 0,3 til 1,3 s rommet våkner */
  aapne() {
    if (!G.skjult) return; const F = G.F;
    try { if (Paint.aapen) { Paint.wallH = Paint.aapen.wallH; Paint.wallS = Paint.aapen.wallS; } } catch (e) { }
    G.skjult = null; this.trekk();
    const hemm = F.rooms.find(r => r.role === 'secret'); if (hemm && typeof Bygg === 'object' && Bygg.ferdig) Bygg.ferdig.add(hemm.id); // møblene spretter opp når rommet våkner, ikke før
    const PM = Paint.mesh || {}, synk = [...(PM.vegger || []), ...(PM.toppEkstra || [])].filter(m => m.userData.del === 'sprekk').concat(D3.sprekkDeler || [], this.info ? this.info.meshes.filter(m => m.userData.dekal !== 'stov') : []);
    this.vis = { t: 0, F, synk, stopp: true };
    try { this.brist(); } catch (e) { console.warn('bristen i veggen feilet', e); }
  },
  brist() {
    const I = this.info, K = I ? this.farger(I) : { vegg: '#b8a888', ute: false }, V = this.vis;
    R.shake(.55); Sound.play(K.ute ? 'lovbrudd' : 'murbrudd'); Sound.play('bonk', .5, .45);
    // sprekkveggen fra ChatGPT (lys gjennom sprekken) et femtedels sekund over veggen, foran alt. Ute er det murstein, så hekken og krattet får bare blader
    if (K.ute) { V.brist = []; for (const c of Spesial.cracks) puff(c.x, c.z + .3, 2, 1.3, '#a8b878'); } // ute blir bitene (Particles) svarte i Parken, så bare blader
    else V.brist = Spesial.cracks.map(c => { const g = propSprite(null, c.x, c.z + .46, { P: propArt({ k: 'sprekk' }), shadow: false }); g.traverse(o => { if (o.material) o.material.depthTest = false; o.renderOrder = 8; }); R.dyn.add(g); return g; });
    for (const c of Spesial.cracks) puff(c.x + (I ? I.ux * .3 : 0), c.z + (I ? I.uz * .3 : 0) + .2, 2, 1, K.ute ? '#a8b878' : K.vegg);
  },
  // veggen synker (y og høyden mot null over 0,3 s) under biter i veggens farge og en sky av innestengt luft
  synk0() {
    const I = this.info; if (!I) return; const K = this.farger(I), hex = new THREE.Color(K.vegg).getHex();
    for (const c of Spesial.cracks) { if (!R.safe && !K.ute) Particles.spawn(c.x + I.ux * .3, I.side === 'n' ? 1.1 : I.h, c.z + I.uz * .3, 10, hex, { speed: 4, up: 4, life: .9 }); puff(c.x + I.ux * .5, c.z + I.uz * .5 + .2, 3, 1.1, K.ute ? '#a8b878' : K.vegg); }
    if (!R.safe && typeof Glod === 'object') { const E = Glod.lag(I.ex - I.ux * .3, .25, I.ez - I.uz * .3, 'trekk', { liv: 1.8, n: 36, str: [.3, .9], stig: .5, spre: 1.2 }); if (E) { E.pts.rotation.y = Math.atan2(-I.uz, I.ux); E.mat.uniforms.uAlfa.value = .32; E.mat.uniforms.uVind.value = 2.4; } }
    Sound.play('swingHeavy', .7, .5);
  },
  synk(k) {
    for (const m of this.vis.synk) { m.scale.y = Math.max(.001, 1 - k); if (m.userData.dekal) m.position.y = m.userData.y0 * (1 - k); else m.position.y = -.2 * k; if (k >= 1) m.visible = false; }
    if (D3.on && R.renderer) R.renderer.shadowMap.needsUpdate = true;
  },
  // byttet: det lukkede ut og det åpne inn, og maskene, kontaktskyggene og skyggekartet tegnes med det åpne rommet
  bytt() {
    const F = G.F, PM = Paint.mesh || {};
    try {
      for (const m of [...(PM.vegger || []), ...(PM.toppEkstra || [])]) { const d = m.userData.del; if (d === 'lukket') m.visible = false; else if (d === 'aapen') m.visible = true; }
      if (PM.gulvSkjult) PM.gulvSkjult.visible = true;
    } catch (e) { console.warn('det skjulte rommet ble ikke byttet', e); }
    try {
      // trærne som sto på og ved det skjulte ute
      if (typeof Landskap === 'object' && Landskap.skjulteTraer) { for (const g of Landskap.skjulteTraer) { if (!R.safe) puff(g.position.x, g.position.z, 2, 1, '#a8b878'); R.remove(g); } Landskap.skjulteTraer = []; }
      const tm = D3.taakeMask; if (tm && tm.image && tm.image.data) { for (let i = 0; i < tm.image.data.length; i++) tm.image.data[i] = F.tiles[i] > 0 ? 255 : 0; tm.needsUpdate = true; }
      const rm = typeof Regnringer === 'object' && Regnringer.mask; if (rm && rm.image && rm.image.data) { for (let z = 0; z < F.H; z++) for (let x = 0; x < F.W; x++) { const i = z * F.W + x; rm.image.data[i] = F.tiles[i] > 0 && Vaer.ute(x + .5, z + .5) ? 255 : 0; } rm.needsUpdate = true; }
      if (typeof Dybde === 'object' && Dybde.ao) { const a = Dybde.ao; R.remove(a.m); a.t.dispose(); a.m.material.dispose(); Dybde.ao = null; Dybde.kontakt(F); }
      if (D3.on && R.renderer) R.renderer.shadowMap.needsUpdate = true;
    } catch (e) { console.warn('maskene rundt det skjulte rommet ble ikke tegnet på nytt', e); }
  },
  // rommet våkner: tingene og glasset kommer, lysene tennes over et sekund, møblene spretter opp, og tennene triller ut mot pasienten
  vekk() {
    const F = G.F, P = G.player, I = this.info;
    try {
      for (const o of this.props) if (o.g) o.g.visible = true;
      for (const pd of this.pd) if (pd.g) { pd.g.visible = true; starBurst(pd.x, 1, pd.z + .1, 1.3); }
      this.tenn = { t: 0, lys: this.lys.slice() };
      if (typeof Bygg === 'object' && Bygg.ferdig && P) for (const o of this.props) if (o.byggS) Bygg.liste.push({ o, t: -Math.hypot(o.x - P.x, o.z - P.z) * .035 - Math.random() * .08 });
      // gløden fra tingene (som Effekter.onFloor)
      if (typeof Glod === 'object') for (const o of this.props) { const K = GLOD_KILDER[o.kind]; if (!K || !o.alive) continue; const z0 = (o.g && o.g.position ? o.g.position.z : o.z + .2) + .14; for (const [type, dx, h, dz, opt] of K) Glod.lag(o.x + dx, h * BILL_Y, z0 + dz, type, Object.assign({ eier: o }, opt || {})); }
      const hemm = F.rooms.find(r => r.role === 'secret');
      // tennene fra et stykke inne i gangen og ut mot åpningen (de stopper før tannmagneten tar dem), pillen blir liggende i rommet
      if (I) { const t = freeSpot(I.cx - I.ux * 3.2, I.cz - I.uz * 3.2, 2); for (let i = 0; i < 3; i++) { const k = dropPickup(t.x + rnd(-.3, .3), t.z + rnd(-.3, .3), 'tooth', 1); k.vx = I.ux * rnd(.8, 1.8) + rnd(-.4, .4); k.vz = I.uz * rnd(.8, 1.8) + rnd(-.4, .4); } }
      else if (hemm) { const t = freeSpot(hemm.x + 1.5, hemm.z + 1.5, 2); for (let i = 0; i < 3; i++) dropPickup(t.x + i * .3, t.z, 'tooth', 1); }
      if (hemm) { const t = freeSpot(hemm.x + 1.5, hemm.z + 1.5, 2); dropPickup(t.x, t.z + .4, 'cons', pick(Object.keys(PILL_COL))); }
    } catch (e) { console.warn('det skjulte rommet våknet ikke helt', e); this.nod(); }
  },
  // når noe feiler: alt synlig og tent, som før innbruddet fikk et forløp
  nod() { for (const L of this.lys) if (L.userData.col) R.setLight(L, L.userData.base || 1); for (const o of this.props) { o.skjult = false; if (o.g) o.g.visible = true; } for (const pd of this.pd) if (pd.g) pd.g.visible = true; this.tenn = null; },
  // etterpå: rusk på terskelen og pasienten som visste det hele tiden
  slutt() {
    const I = this.info, P = G.player; this.vis = null;
    if (I && I.mat && R.level) { const g = new THREE.PlaneGeometry(I.len - .1, 1.15), uv = g.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setY(k, 1 - (476 - 100 * uv.getY(k)) / 512); Paint.owned.push(g);
      const m = new THREE.Mesh(g, I.mat); m.rotation.set(-Math.PI / 2, 0, Math.atan2(I.ux, I.uz)); m.position.set(I.cx, .013, I.cz); m.renderOrder = 1; m.userData.dekal = 'rusk'; R.level.add(m); I.meshes.push(m); }
    if (P && P.alive) FX.bubble(P, 'Visste jeg det.', 1.6);
  },
  kast(g) { R.remove(g); g.traverse(o => { if (o.material) o.material.dispose(); }); },
  forlop(dt) {
    const V = this.vis; V.t += dt; const t = V.t, steg = (flagg, s, fn) => { if (!V[flagg] && t >= s) { V[flagg] = true; try { fn(); } catch (e) { console.warn('innbruddet: ' + flagg, e); if (flagg === 'vekk') this.nod(); } } };
    if (V.stopp) { V.stopp = false; G.hitstop = Math.max(G.hitstop, .12); } // etter meleeHit, som setter sitt eget stopp etter slaget
    if (V.brist && t >= .2) { for (const g of V.brist) this.kast(g); V.brist = null; }
    steg('s02', .2, () => this.synk0());
    if (t >= .2 && !V.synket) { const k = clamp((t - .2) / .3, 0, 1); this.synk(k); if (k >= 1) V.synket = true; }
    steg('bytt', .25, () => this.bytt());
    steg('vekk', .3, () => this.vekk());
    if (t >= 1.3) this.slutt();
  },
  /* per bilde (fra Spesial.update): forløpet, lysene som tennes, dragene og monokkelen */
  tick(dt) {
    if (this.vis) { if (this.vis.F !== G.F) { if (this.vis.brist) for (const g of this.vis.brist) this.kast(g); this.vis = null; } else this.forlop(dt); }
    const T = this.tenn;
    if (T) { T.t += dt; const k = Math.min(1, T.t / 1); for (const L of T.lys) if (L.parent && L.userData.col) R.setLight(L, (L.userData.base || 1) * k * k); if (k >= 1) { for (const o of this.props) o.skjult = false; this.tenn = null; } }
    const I = this.info; if (I && G.skjult && I.kjent !== !!G.sprekkKjent) { I.kjent = !!G.sprekkKjent; this.tegn(); }
    this.trekk();
  }
};

/* ---------- kaldt drag, lydene og tipset ---------- */
Object.assign(GLOD_TYPER, { trekk: { n: 8, liv: 2.6, stig: .1, spre: .5, vind: 1.1, virvel: .08, str: [.08, .22], farger: ['#e4ecf4', '#9aa8b8'], add: 0, flimmer: 0, alfa: .14 } });
// banking (fot_stein, dypt og tett), bruddet i muren og i hekken. Synthlydene under er for når de innspilte lydene er av
Object.assign(LYD_KART, {
  veggbank: { s: [['fot_stein', .34, .6, { lp: 1500 }]] },
  murbrudd: { s: [['dorslag', .8, .75], ['knas', .7, .85]], syn: .35 },
  lovbrudd: { s: [['kvist', .75, .85], ['rive', .6, .9], ['knas', .25, 1.2]], syn: .3 }
});
Object.assign(Sound.lib, { veggbank: [{ w: 'sine', f: 140, d: .09, pd: .6, v: .35 }, { n: 1, d: .05, f0: 900, f1: 200, ft: 'lowpass', v: .2 }], murbrudd: Sound.lib.slam, lovbrudd: Sound.lib.hitHeavy });
// trekken bak veggen er sin egen sløyfe av de samme opptakene som vinden og klokka
{ const _gl = Lydbank.gruppeListe; Lydbank.gruppeListe = function () { const G0 = _gl.call(this); if (G0.amb_vind && !G0.trekk_vind) G0.trekk_vind = G0.amb_vind.slice(); if (G0.klokketikk && !G0.trekk_tikk) G0.trekk_tikk = G0.klokketikk.slice(); return G0; }; }
{ const _m = Stemning.maal; Stemning.maal = function () { const M = _m.call(this); try { if (G.state === 'play' && this.etasje) Skjult.lyd(M); } catch (e) { } return M; }; }

/* ---------- koblinger ---------- */
// spawnProps er allerede pakket inn av 17_romtyper (lysene) og 38_effekter (gløden), så alt finnes når tingene gjemmes
Kroker.etter('spawnProps', () => { try { Skjult.gjemTing(); } catch (e) { console.warn('det skjulte rommet ble ikke gjemt', e); } });
// banking: sprekken spør om slaget traff en ting, og hitProps kalles rett før hitCrack i meleeHit
{ const _hp = hitProps; hitProps = function (...a) { const n = _hp.apply(this, a); Spesial.sistProps = n; return n; }; }
// hvert slag på sprekken: hårstreken vokser. Siste slag knuser veggen (c.broken, F.block og G.run.secrets som før), og så åpnes rommet
{ const _d = Spesial.damage; Spesial.damage = function (c, n) { _d.call(this, c, n); if (!G.skjult) return; if (this.cracks.length && this.cracks.every(k => k.broken)) Skjult.aapne(); else Skjult.oppdaterSteg(); }; }
{ const _u = Spesial.update; Spesial.update = function (dt) { _u.call(this, dt); Skjult.tick(dt); }; }

Object.assign(window, { Skjult, gulvSynlig, FX, slowMo, Particles }); // FX, slowMo og Particles for testdel 53 (boblene, bristbildet og bitene)
