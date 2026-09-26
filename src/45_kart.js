/* ============================================================
   DET STORE KARTET  -  hele etasjen på papir, som en plantegning.
   Åpnes med et trykk eller klikk på kartet i gullringen, med M, eller med pil
   høyre på håndkontrollen. Lukkes med M, Esc, P, B, Start eller Lukk. Spillet
   står stille mens kartet er oppe (et vanlig panel, som pausen).
   Kartet tegnes én gang når det åpnes: det malte gulvet (Paint) skalert ned,
   bare der pasienten har vært (G.seen), med rollefarger, blekkstrek, ikoner og
   en pil for pasienten. Lerretene frigjøres når det lukkes. Ingen WebGL, så
   det virker likt i 2D, i 3D og med «Enkel grafikk».
   ============================================================ */
const KART_ROLLE = { service: '#e8c890', boss: '#d88a7a', treasure: '#f0d870', risk: '#c8a0d8', cursed: '#c86a7a', offer: '#e0906a', secret: '#b8c8e8' };
// størrelsen på kartlerretet i CSS-piksler: PC, smal (stående telefon) og liggende telefon
const KART_OPPSETT = { bred: [548, 520], smal: [414, 400], lig: [392, 372] };
const KART_UT = { porten: 'Porten', vindu: 'Et åpent vindu', kloakk: 'Kloakken', kullsjakt: 'Kullsjakta', sti: 'Stien ut', utgang: 'Utgangen' };
const KART_VAER = { regn: 'regn', sno: 'snø', taake: 'tåke', ildfluer: 'ildfluer', klart: 'klart' };
const Kart = {
  zoom: 'hele', ms: 0,
  /* ringen i HUD-en er knappen. På PC ligger den der musa ofte sikter: bevegelsen sendes videre til spillet,
     høyre knapp er alltid tungt slag, og i kamp er et klikk på ringen et slag og ikke kartet */
  init() {
    const ring = $('mapring'), cv = $('game'); if (!ring || this.ring === ring) return; this.ring = ring; // ikke data-kart på ringen: journalen bytter ut alt med data-kart
    const iKamp = () => G.state === 'play' && !!G.combat && !Input.touch.active, videre = e => cv.dispatchEvent(new MouseEvent(e.type, e)); let slag = false;
    ring.addEventListener('mousemove', e => { if (!Input.touch.active) videre(e); }); // et trykk gir også musehendelser, og de skal ikke gjøre telefonen til tastatur
    ring.addEventListener('mousedown', e => { slag = e.button !== 0 || iKamp(); if (slag) { videre(e); e.preventDefault(); } });
    ring.addEventListener('contextmenu', e => e.preventDefault());
    ring.addEventListener('click', () => { if (slag) { slag = false; return; } if (G.state === 'play') this.apne(); });
  },
  aapen() { return G.state === 'panel' && !!(G.panelO && G.panelO.kart); },
  oppsett() { return innerHeight <= 500 && innerWidth > innerHeight ? 'lig' : narrow() ? 'smal' : 'bred'; },
  /* o: panelvalg, som onBack når kartet åpnes fra pausen. igjen: tegnet på nytt etter rotasjon */
  apne(o = {}, igjen) {
    const F = G.F, P = G.player; if (!F || !P || !P.alive || !G.seen || (G.state !== 'play' && G.state !== 'panel')) return;
    this.frigi();
    const lay = this.oppsett(), [cw, ch] = KART_OPPSETT[lay], M = this.merker(), dev = Input.lastDevice === 'pad' ? 'pad' : Input.touch.active ? 'touch' : 'kb';
    const navn = G.th.name.split(': '), linje = G.drom ? 'Drømmen, kapittel ' + G.drom.kap + ' av 5' : 'Etasje ' + G.depth + ' av ' + MAX_DEPTH;
    const tall = this.tall(), hint = dev === 'touch' ? '' : dev === 'pad' ? 'B eller Start lukker kartet' : 'M eller Esc lukker kartet';
    openPanel(`<div class="fit kartark paper${lay === 'bred' ? '' : ' ' + lay}" id="kartark">
      <div class="kkart"><canvas id="kCan" width="1" height="1" style="width:${cw}px;height:${ch}px" aria-label="Kart over etasjen"></canvas><svg class="kpil" id="kPil" viewBox="-15 -15 30 30" aria-hidden="true"><path d="M0-11 8 9 0 4-8 9z"/></svg><b class="nord">N</b></div>
      <div class="kside"><div class="kplan">PLANTEGNING</div>
        <div class="ktittel">${esc(navn[0])}${navn[1] ? `<small>${esc(navn[1])}</small>` : ''}</div>
        <div class="kund">${esc(linje)}</div>
        <div class="ktall">${tall.map(([a, b, c]) => `<span>${esc(a)}<b>${esc(b)}</b>${esc(c)}</span>`).join('')}</div>
        <ul class="kleg">${M.L.map(l => `<li><i data-kik="${l.ik}" data-t="${esc(l.t || '')}"></i><span>${esc(l.navn)}${l.liten ? `<small>${esc(l.liten)}</small>` : ''}</span></li>`).join('')}</ul>
        <div class="btnrow"><button class="btn" id="kZoom">Nær meg</button><button class="btn big" id="kLukk" data-close>Lukk</button></div>
        ${hint ? `<div class="khint">${hint}</div>` : ''}
      </div></div>`, Object.assign({}, o, { kart: true, refit: () => this.apne(o, true), onClose: () => this.frigi() }));
    // ikonene i tegnforklaringen først, så skaleres arket til skjermen, og så tegnes kartet i den oppløsningen arket fikk
    document.querySelectorAll('#kartark [data-kik]').forEach(el => el.replaceWith(this.ikonLerret(el.dataset.kik, el.dataset.t))); fitPanel();
    $('kZoom').onclick = () => { this.zoom = this.zoom === 'naer' ? 'hele' : 'naer'; Sound.play('paper', .6); this.tegn(); };
    this.tegn(); $('kLukk').focus({ preventScroll: true }); if (!igjen) Sound.play('paper');
  },
  /* lerretene gis tilbake med en gang, ikke først når nettleseren rydder */
  frigi() { document.querySelectorAll('#kartark canvas').forEach(c => { c.width = c.height = 0; }); },
  gulvBilde() { try { const t = Paint.mesh.gulv.material.map, b = t && t.image; return b && b.width && b.width % G.F.W === 0 ? b : null; } catch (e) { return null; } },
  tall() {
    const F = G.F, hemm = F.rooms.find(r => r.role === 'secret'), krakk = new Set(F.crack || []); let n = 0, s = 0;
    for (let i = 0; i < F.W * F.H; i++) { if (!F.tiles[i] || krakk.has(i) || (hemm && F.roomId[i] === hemm.id)) continue; n++; if (G.seen[i]) s++; }
    const ut = [['', Math.round(s / Math.max(1, n) * 100) + ' %', 'utforsket']];
    if (!G.drom) { const k = F.rooms.filter(r => r.role === 'boss' || (r.role !== 'cursed' && r.waves && r.waves.length)); ut.push(['', k.filter(r => G.rooms[r.id] && G.rooms[r.id].cleared).length + ' av ' + k.length, 'rom ryddet']); }
    if (F.vaer && KART_VAER[F.vaer]) ut.push([F.ute || G.drom ? 'Vær: ' : 'Gårdsrommene: ', KART_VAER[F.vaer], '']);
    return ut;
  },
  /* det som står på kartet (M, med plass i ruter) og i tegnforklaringen (L). Bare det pasienten har sett */
  merker() {
    const F = G.F, W = F.W, M = [], L = [{ ik: 'du', navn: 'Du er her' }], en = {};
    const idx = (x, z) => { const tx = Math.floor(x), tz = Math.floor(z); return tx < 0 || tz < 0 || tx >= W || tz >= F.H ? -1 : tz * W + tx; }, sett = (x, z) => { const i = idx(x, z); return i >= 0 && !!G.seen[i]; };
    const en1 = (k, l) => { if (!en[k]) { en[k] = l; L.push(l); } return en[k]; };
    const td = G.trapdoor;
    for (const r of F.rooms) {
      const cx = r.x + r.w / 2, cz = r.z + r.h / 2, st = G.rooms[r.id] || {}; if (!sett(cx, cz)) continue;
      if (G.drom && r.navn) M.push({ ik: 'navn', t: r.navn, x: cx, z: r.z - 1 });
      if (r.role === 'service') { const S = SERVICES[r.service], b = S.name.replace(/^(Den|Det) /, '')[0]; M.push({ ik: 'tjeneste', t: b, x: cx, z: cz, navn: S.name }); L.push({ ik: 'tjeneste', t: b, navn: S.name, liten: S.npc && !S.name.toLowerCase().includes(S.npc.toLowerCase()) ? S.npc : '' }); }
      else if (r.role === 'boss' && !G.drom) {
        const B = sjefFor(G.depth), unna = td && Math.hypot(td.x - cx, td.z - cz) < 2.5;
        M.push({ ik: 'sjef', t: st.cleared ? '1' : '', x: cx, z: unna ? r.z + 2 : cz });
        en1('sjef', { ik: 'sjef', t: st.cleared ? '1' : '', navn: st.visited ? B.name : 'Overlegen', liten: st.cleared ? 'Behandlet' : st.visited ? B.title || '' : 'Bak en låst dør' });
      }
      else if (r.role === 'treasure') { M.push({ ik: 'skatt', x: cx, z: cz }); en1('skatt', { ik: 'skatt', navn: 'Et stille rom', liten: 'Noe er glemt her' }); }
      else if (r.role === 'secret') { M.push({ ik: 'hemmelig', x: cx, z: cz }); en1('hemmelig', { ik: 'hemmelig', navn: 'Et hemmelig rom' }); }
      else if (r.role === 'cursed') { M.push({ ik: 'forbannet', x: cx, z: cz }); en1('forbannet', { ik: 'forbannet', navn: 'Et forbannet rom', liten: 'Koster blod' }); }
      else if (r.role === 'offer') { M.push({ ik: 'offer', x: cx, z: cz }); en1('offer', { ik: 'offer', navn: 'Blodofferrommet', liten: 'Et alter' }); }
      if (Mini.rom && Mini.rom[r.id] && !st.cleared) { M.push({ ik: 'mini', x: cx, z: cz }); en1('mini', { ik: 'mini', navn: 'Minisjef', liten: r.role === 'risk' ? 'Frivillig risiko' : 'Noe stort venter' }); }
    }
    if (td && sett(td.x, td.z)) { const U = UTGANGER[G.depth] || UTGANGER[MAX_DEPTH]; M.push({ ik: 'utgang', x: td.x, z: td.z }); L.push({ ik: 'utgang', navn: KART_UT[U.k] || 'Utgangen', liten: G.depth >= MAX_DEPTH ? 'Veien ut' : 'Veien videre' }); }
    const dp = G.drom && F.dromPlass && F.dromPlass.dor, aapen = !!(typeof Drom === 'object' && Drom.dor && Drom.dor.aapen);
    if (dp && sett(dp.x, dp.z + 1)) { M.push({ ik: 'dor', t: aapen ? '1' : '', x: dp.x, z: dp.z + .6 }); L.push({ ik: 'dor', t: aapen ? '1' : '', navn: 'Døra', liten: aapen ? 'Står på gløtt' : 'Lukket, ennå' }); }
    const rare = (typeof Hendelse === 'object' ? Hendelse.aktive : []).filter(h => !h.brukt && !h.ferdig && sett(h.x, h.z));
    for (const h of rare) M.push({ ik: 'rart', x: h.x, z: h.z });
    if (rare.length) L.push({ ik: 'rart', navn: 'Noe rart', liten: rare.length > 1 ? rare.length + ' steder' : '' });
    const lik = (G.corpses || []).filter(c => sett(c.x, c.z));
    for (const c of lik) M.push({ ik: 'lik', t: c.ld.name, x: c.x, z: c.z });
    if (lik.length) L.push({ ik: 'lik', navn: 'Her ligger', liten: lik.map(c => c.ld.name).join(', ') });
    const fi = G.enemies.filter(e => e.alive && sett(e.x, e.z)); if (G.boss && G.boss.alive && sett(G.boss.x, G.boss.z)) fi.push(G.boss);
    for (const e of fi) M.unshift({ ik: 'fiende', x: e.x, z: e.z });
    if (fi.length) L.push({ ik: 'fiende', navn: 'Fiender', liten: fi.length > 1 ? fi.length + ' stykker' : '' });
    return { M, L };
  },
  /* hele etasjen: det du har sett, med tre ruters marg og minst 24 ruter. Nær meg: 24 ruter rundt pasienten */
  utsnitt(cw, ch) {
    const F = G.F, P = G.player; let x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9;
    if (this.zoom !== 'naer') for (let z = 0; z < F.H; z++) for (let x = 0; x < F.W; x++) { const i = z * F.W + x; if (!F.tiles[i] || !G.seen[i]) continue; x0 = Math.min(x0, x); x1 = Math.max(x1, x + 1); z0 = Math.min(z0, z); z1 = Math.max(z1, z + 1); }
    if (x0 > x1) { x0 = x1 = P.x; z0 = z1 = P.z; } else { x0 -= 3; z0 -= 3; x1 += 3; z1 += 3; }
    const hx = Math.max(12, (x1 - x0) / 2), hz = Math.max(12, (z1 - z0) / 2), s = Math.min(cw / hx / 2, ch / hz / 2, 24);
    return { s, x: (x0 + x1) / 2 - cw / 2 / s, z: (z0 + z1) / 2 - ch / 2 / s };
  },
  tegn() {
    const c = $('kCan'), F = G.F, P = G.player; if (!c || !F || !P || !G.seen) return;
    const t0 = performance.now(), ark = $('kartark'), cw = parseFloat(c.style.width), ch = parseFloat(c.style.height), zm = +(ark && ark.style.zoom) || 1;
    const bw = clamp(Math.round(cw * zm * Math.min(devicePixelRatio || 1, 2)), 360, 1024), k = bw / cw, bh = Math.round(ch * k);
    c.width = bw; c.height = bh; const g = c.getContext('2d'), W = F.W, H = F.H;
    const V = this.utsnitt(cw, ch), s = V.s, X = x => (x - V.x) * s, Y = z => (z - V.z) * s, verden = q => q.setTransform(k * s, 0, 0, k * s, -k * s * V.x, -k * s * V.z);
    const krakk = new Set(); for (const kr of Spesial.cracks || []) if (!kr.broken) krakk.add(kr.i);
    const gulv = (x, z) => x >= 0 && z >= 0 && x < W && z < H && F.tiles[z * W + x] > 0 && !krakk.has(z * W + x);
    const ax = clamp(Math.floor(V.x), 0, W), bx = clamp(Math.ceil(V.x + cw / s), 0, W), az = clamp(Math.floor(V.z), 0, H), bz = clamp(Math.ceil(V.z + ch / s), 0, H);
    const rng = mulberry32(((F.seed || 1) >>> 0) * 7 + 3);
    // 1) papiret: gulnet pergament med flekker og et blått rutenett, tettere linje for hver åttende rute
    g.setTransform(k, 0, 0, k, 0, 0); g.fillStyle = '#eadbb0'; g.fillRect(0, 0, cw, ch);
    for (let n = 0; n < 6; n++) { const x = rng() * cw, y = rng() * ch, r = 30 + rng() * 100, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(150,105,45,.14)'); gr.addColorStop(1, 'rgba(150,105,45,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
    const steg = s >= 7 ? 1 : 2; g.lineWidth = 1;
    for (const tung of [false, true]) {
      g.beginPath();
      for (let x = Math.ceil(V.x / steg) * steg; X(x) <= cw; x += steg) if ((x % 8 === 0) === tung) { g.moveTo(X(x), 0); g.lineTo(X(x), ch); }
      for (let z = Math.ceil(V.z / steg) * steg; Y(z) <= ch; z += steg) if ((z % 8 === 0) === tung) { g.moveTo(0, Y(z)); g.lineTo(cw, Y(z)); }
      g.strokeStyle = tung ? 'rgba(60,100,170,.3)' : 'rgba(60,100,170,.13)'; g.stroke();
    }
    // kompassrose i hjørnet, trykt på papiret under gulvet, med nord mørk
    g.save(); g.translate(cw - 30, 34); g.beginPath(); for (let n = 0; n < 8; n++) { const a = n / 8 * TAU - Math.PI / 2, rr = n % 2 ? 5 : 17; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath();
    g.fillStyle = 'rgba(246,234,208,.9)'; g.fill(); g.lineWidth = 1.6; g.strokeStyle = INK; g.lineJoin = 'round'; g.stroke();
    g.beginPath(); g.moveTo(0, -17); g.lineTo(3.5, -3.5); g.lineTo(0, 0); g.lineTo(-3.5, -3.5); g.closePath(); g.fillStyle = INK; g.fill(); g.restore();
    // 2) gulvet på et eget lerret: det malte gulvet skalert ned (eller flate ruter), rollefargene, skravur over rom du bare har sett inn i,
    //    og så bare det du har sett, med myk kant mot det ukjente. Den sprukne veggen er vegg til den er slått opp.
    const o = document.createElement('canvas'); o.width = bw; o.height = bh; const q = o.getContext('2d'); verden(q);
    const bilde = this.gulvBilde();
    if (bilde && bx > ax && bz > az) { const T = bilde.width / W; q.imageSmoothingEnabled = true; q.imageSmoothingQuality = 'medium'; q.drawImage(bilde, ax * T, az * T, (bx - ax) * T, (bz - az) * T, ax, az, bx - ax, bz - az); }
    else for (const kor of [false, true]) { q.beginPath(); for (let z = az; z < bz; z++) for (let x = ax; x < bx; x++) { const t = F.tiles[z * W + x]; if (t && (t === T_COR) === kor) q.rect(x, z, 1, 1); } q.fillStyle = kor ? '#b09a6a' : '#d8c08a'; q.fill(); }
    q.globalCompositeOperation = 'multiply'; q.globalAlpha = .55;
    for (const [rolle, farge] of Object.entries(KART_ROLLE)) { let n = 0; q.beginPath(); for (const r of F.rooms) if (r.role === rolle) for (let z = r.z; z < r.z + r.h; z++) for (let x = r.x; x < r.x + r.w; x++) if (F.roomId[z * W + x] === r.id) { q.rect(x, z, 1, 1); n++; } if (n) { q.fillStyle = farge; q.fill(); } }
    q.globalCompositeOperation = 'source-over'; q.globalAlpha = 1;
    { let n = 0; q.beginPath(); for (const r of F.rooms) { const st = G.rooms[r.id]; if (!st || st.visited) continue; for (let z = r.z; z < r.z + r.h; z++) for (let x = r.x; x < r.x + r.w; x++) if (F.roomId[z * W + x] === r.id && G.seen[z * W + x]) { q.rect(x, z, 1, 1); n++; } }
      if (n) { const p = document.createElement('canvas'), d = p.width = p.height = Math.max(6, Math.round(8 * k)), pg = p.getContext('2d'); pg.strokeStyle = 'rgba(42,26,20,.3)'; pg.lineWidth = Math.max(1, k * .9); pg.beginPath(); pg.moveTo(-1, d + 1); pg.lineTo(d + 1, -1); pg.moveTo(-1, 1); pg.lineTo(1, -1); pg.moveTo(d - 1, d + 1); pg.lineTo(d + 1, d - 1); pg.stroke();
        q.save(); q.setTransform(1, 0, 0, 1, 0, 0); q.fillStyle = q.createPattern(p, 'repeat'); q.fill(); q.restore(); p.width = p.height = 0; } }
    const m = document.createElement('canvas'); m.width = W; m.height = H; const mg = m.getContext('2d'), id = mg.createImageData(W, H);
    for (let i = 0; i < W * H; i++) if (G.seen[i]) id.data[i * 4 + 3] = 255;
    mg.putImageData(id, 0, 0); q.globalCompositeOperation = 'destination-in'; q.imageSmoothingQuality = 'low'; q.drawImage(m, 0, 0, W, H);
    if (krakk.size) { q.globalCompositeOperation = 'destination-out'; q.beginPath(); for (const i of krakk) q.rect(i % W, (i / W) | 0, 1, 1); q.fill(); }
    // gulvet legges på papiret som et utklipp, med hard skygge som papiret i menyene
    g.setTransform(1, 0, 0, 1, 0, 0); g.shadowColor = 'rgba(42,26,20,.35)'; g.shadowOffsetX = 2 * k; g.shadowOffsetY = 3 * k; g.drawImage(o, 0, 0);
    g.shadowColor = 'transparent'; o.width = o.height = 0; m.width = m.height = 0;
    // 3) blekkstrek der gulvet møter veggen, litt skjelven, som tegnet for hånd
    verden(g); g.beginPath(); g.lineCap = 'round'; g.lineJoin = 'round';
    const strek = (x0, z0, x1, z1) => { const w = (((x0 * 73856093) ^ (z0 * 19349663) ^ (x1 * 83492791) ^ (z1 * 2654435)) >>> 0) % 1000 / 1000 - .5; g.moveTo(x0, z0); g.lineTo((x0 + x1) / 2 + (z1 - z0) * w * .12, (z0 + z1) / 2 + (x1 - x0) * w * .12); g.lineTo(x1, z1); };
    for (let z = az; z < bz; z++) for (let x = ax; x < bx; x++) {
      if (!G.seen[z * W + x] || !gulv(x, z)) continue;
      if (!gulv(x, z - 1)) strek(x, z, x + 1, z); if (!gulv(x, z + 1)) strek(x, z + 1, x + 1, z + 1); if (!gulv(x - 1, z)) strek(x, z, x, z + 1); if (!gulv(x + 1, z)) strek(x + 1, z, x + 1, z + 1);
    }
    g.lineWidth = 2.3 / s; g.strokeStyle = INK; g.stroke();
    // 4) rommet du står i får gullkant, låste dører røde bommer og dørene til forbannede rom torner
    const ri = F.roomId[clamp(Math.floor(P.z), 0, H - 1) * W + clamp(Math.floor(P.x), 0, W - 1)];
    if (ri >= 0) { const r = F.rooms[ri]; g.beginPath(); g.rect(r.x - .15, r.z - .15, r.w + .3, r.h + .3); g.lineWidth = 6 / s; g.strokeStyle = INK; g.stroke(); g.lineWidth = 3 / s; g.strokeStyle = '#e8b93a'; g.stroke(); }
    const bom = (dorer, rid) => { g.beginPath(); for (const i of dorer) { if (!G.seen[i]) continue; const x = i % W, z = (i / W) | 0, loddrett = F.roomId[i - 1] === rid || F.roomId[i + 1] === rid; if (loddrett) { g.moveTo(x + .5, z + .08); g.lineTo(x + .5, z + .92); } else { g.moveTo(x + .08, z + .5); g.lineTo(x + .92, z + .5); } } };
    if (G.lock && G.combat && G.combat.r) { bom(G.lock, G.combat.r.id); g.lineWidth = 7 / s; g.strokeStyle = INK; g.stroke(); g.lineWidth = 4 / s; g.strokeStyle = '#b3261e'; g.stroke(); }
    g.beginPath();
    for (const r of F.rooms) if (r.role === 'cursed') for (const i of r.doors) {
      if (!G.seen[i]) continue; const x = i % W, z = (i / W) | 0, loddrett = F.roomId[i - 1] === r.id || F.roomId[i + 1] === r.id;
      for (let t = 0; t <= 4; t++) { const u = .1 + t * .2, w = t % 2 ? .22 : -.22, px = loddrett ? x + .5 + w : x + u, pz = loddrett ? z + u : z + .5 + w; t ? g.lineTo(px, pz) : g.moveTo(px, pz); }
    }
    g.lineWidth = 2.2 / s; g.strokeStyle = '#6a0a0a'; g.stroke();
    // 5) ikonene og navnene, i CSS-piksler
    g.setTransform(k, 0, 0, k, 0, 0); const R = clamp(s * 1.05, 10, 15), { M } = this.merker();
    for (const mk of M) {
      const x = X(mk.x), y = Y(mk.z); if (x < -40 || y < -40 || x > cw + 40 || y > ch + 40) continue;
      if (mk.ik === 'navn') { this.etikett(g, mk.t, x, y, clamp(s * 1.2, 15, 22)); continue; }
      this.ikon(g, mk.ik, x, y, mk.ik === 'fiende' ? R * .7 : mk.ik === 'lik' ? R * .85 : R, mk.t);
      if (mk.ik === 'lik' && s >= 9) this.etikett(g, mk.t, x, y + R * 1.5, 15);
      if (mk.ik === 'tjeneste' && s >= 11) this.etikett(g, mk.navn, x, y + R + 12, 16);
    }
    // pasienten er en pil av papir over lerretet, så den kan pulsere uten at kartet tegnes på nytt
    const pil = $('kPil'); if (pil) { pil.style.left = (3 + X(P.x)).toFixed(1) + 'px'; pil.style.top = (3 + Y(P.z)).toFixed(1) + 'px'; pil.style.transform = 'rotate(' + (-P.face + Math.PI).toFixed(3) + 'rad)'; }
    const zb = $('kZoom'); if (zb) zb.textContent = this.zoom === 'naer' ? 'Hele etasjen' : 'Nær meg';
    this.ms = performance.now() - t0;
  },
  etikett(g, t, x, y, px) {
    g.font = `600 ${Math.round(px)}px Caveat, "Comic Sans MS", cursive`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.lineWidth = 4; g.strokeStyle = 'rgba(246,234,208,.92)'; g.strokeText(t, x, y); g.fillStyle = INK; g.fillText(t, x, y);
  },
  /* ikonene er tegnet med blekk, i samme strek som resten av spillet. t er bokstaven til tjenesten, eller '1' for behandlet sjef og åpen dør */
  ikon(g, ik, x, y, R, t) {
    const lw = Math.max(1.4, R * .2), blekk = (w = lw) => { g.lineWidth = w; g.strokeStyle = INK; g.stroke(); };
    g.save(); g.lineJoin = 'round'; g.lineCap = 'round'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const stjerne = (n, ri, ro) => { g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * TAU - Math.PI / 2, rr = i % 2 ? ri : ro; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); };
    if (ik === 'tjeneste') {
      const gr = g.createRadialGradient(x - R * .35, y - R * .35, R * .1, x, y, R); gr.addColorStop(0, '#ffe28a'); gr.addColorStop(.6, '#e8b93a'); gr.addColorStop(1, '#9a6a18');
      g.beginPath(); g.arc(x, y, R, 0, TAU); g.fillStyle = gr; g.fill(); blekk();
      g.fillStyle = INK; g.font = `${Math.round(R * 1.2)}px "Alfa Slab One", Georgia, serif`; g.fillText(t || '?', x, y + R * .08);
    } else if (ik === 'sjef') {
      g.beginPath(); g.rect(x - R * .46, y + R * .2, R * .92, R * .62); g.fillStyle = '#efe2c4'; g.fill(); blekk();
      g.beginPath(); g.arc(x, y - R * .12, R * .8, 0, TAU); g.fill(); blekk();
      g.fillStyle = INK; for (const d of [-1, 1]) { g.beginPath(); g.ellipse(x + d * R * .32, y - R * .08, R * .22, R * .26, 0, 0, TAU); g.fill(); }
      g.beginPath(); g.moveTo(x, y + R * .14); g.lineTo(x + R * .1, y + R * .32); g.lineTo(x - R * .1, y + R * .32); g.closePath(); g.fill();
      g.beginPath(); for (const d of [-.2, 0, .2]) { g.moveTo(x + d * R, y + R * .55); g.lineTo(x + d * R, y + R * .82); } blekk(lw * .6);
      if (t) { g.beginPath(); g.moveTo(x - R, y - R); g.lineTo(x + R, y + R); g.moveTo(x + R, y - R); g.lineTo(x - R, y + R); blekk(lw * 2.2); g.lineWidth = lw * 1.1; g.strokeStyle = '#b3261e'; g.stroke(); }
    } else if (ik === 'utgang') {
      g.beginPath(); g.rect(x - R * .85, y - R * .85, R * 1.7, R * 1.7); g.fillStyle = '#8a5a30'; g.fill(); blekk();
      g.beginPath(); g.moveTo(x - R * .85, y - R * .28); g.lineTo(x + R * .85, y - R * .28); g.moveTo(x - R * .85, y + R * .28); g.lineTo(x + R * .85, y + R * .28); blekk(lw * .5);
      g.beginPath(); g.moveTo(x - R * .18, y - R * .6); g.lineTo(x + R * .18, y - R * .6); g.lineTo(x + R * .18, y - R * .05); g.lineTo(x + R * .48, y - R * .05); g.lineTo(x, y + R * .62); g.lineTo(x - R * .48, y - R * .05); g.lineTo(x - R * .18, y - R * .05); g.closePath();
      g.fillStyle = '#e8b93a'; g.fill(); blekk(lw * .7);
    } else if (ik === 'dor') {
      g.beginPath(); g.moveTo(x - R * .7, y + R * .9); g.lineTo(x - R * .7, y - R * .2); g.arc(x, y - R * .2, R * .7, Math.PI, 0); g.lineTo(x + R * .7, y + R * .9); g.closePath();
      g.fillStyle = t ? '#ffe0a0' : '#7a4a2a'; g.fill(); blekk();
      g.beginPath(); g.arc(x + R * .38, y + R * .25, R * .12, 0, TAU); g.fillStyle = '#e8b93a'; g.fill(); blekk(lw * .5);
    } else if (ik === 'skatt' || ik === 'hemmelig') {
      stjerne(5, R * .45, R); g.fillStyle = ik === 'skatt' ? '#f0d060' : '#b8c8e8'; g.fill(); blekk();
    } else if (ik === 'forbannet') {
      stjerne(10, R * .78, R); g.fillStyle = '#8a1a14'; g.fill(); blekk();
      g.fillStyle = '#f6ead0'; g.font = `${Math.round(R * 1.2)}px "Alfa Slab One", Georgia, serif`; g.fillText('!', x, y + R * .06);
    } else if (ik === 'offer') {
      g.beginPath(); g.moveTo(x, y - R); g.bezierCurveTo(x + R * .3, y - R * .45, x + R * .78, y - R * .05, x + R * .78, y + R * .3); g.arc(x, y + R * .3, R * .78, 0, Math.PI); g.bezierCurveTo(x - R * .78, y - R * .05, x - R * .3, y - R * .45, x, y - R); g.closePath();
      g.fillStyle = '#b3261e'; g.fill(); blekk();
      g.beginPath(); g.ellipse(x - R * .3, y + R * .2, R * .12, R * .22, .4, 0, TAU); g.fillStyle = 'rgba(255,230,220,.8)'; g.fill();
    } else if (ik === 'mini') {
      for (const d of [-1, 1]) {
        g.save(); g.translate(x, y); g.rotate(d * Math.PI / 4);
        g.beginPath(); g.moveTo(-R * .14, R * .42); g.lineTo(-R * .14, -R * .72); g.lineTo(0, -R); g.lineTo(R * .14, -R * .72); g.lineTo(R * .14, R * .42); g.closePath(); g.fillStyle = '#e4e2d8'; g.fill(); blekk(lw * .8);
        g.beginPath(); g.rect(-R * .42, R * .38, R * .84, R * .16); g.fillStyle = '#e8b93a'; g.fill(); blekk(lw * .7);
        g.beginPath(); g.rect(-R * .1, R * .54, R * .2, R * .42); g.fillStyle = '#6a3a1a'; g.fill(); blekk(lw * .7);
        g.restore();
      }
    } else if (ik === 'rart') {
      g.font = `700 ${Math.round(R * 2.3)}px Caveat, "Comic Sans MS", cursive`; g.lineWidth = 4; g.strokeStyle = 'rgba(246,234,208,.95)'; g.strokeText('?', x, y); g.fillStyle = '#b3261e'; g.fillText('?', x, y);
    } else if (ik === 'lik') {
      g.beginPath(); g.ellipse(x, y + R * .62, R * .72, R * .26, 0, 0, TAU); g.fillStyle = '#8a6a4a'; g.fill(); blekk(lw * .7);
      g.beginPath(); g.moveTo(x, y - R * .85); g.lineTo(x, y + R * .55); g.moveTo(x - R * .42, y - R * .38); g.lineTo(x + R * .42, y - R * .38);
      g.lineWidth = lw * 3; g.strokeStyle = 'rgba(246,234,208,.9)'; g.stroke(); blekk(lw * 1.3);
    } else if (ik === 'fiende') {
      g.beginPath(); g.arc(x, y, R * .5, 0, TAU); g.fillStyle = '#b3261e'; g.fill(); blekk(lw * .7);
    } else if (ik === 'du') {
      g.beginPath(); g.moveTo(x, y - R); g.lineTo(x + R * .72, y + R * .82); g.lineTo(x, y + R * .36); g.lineTo(x - R * .72, y + R * .82); g.closePath(); g.fillStyle = '#e8b93a'; g.fill(); blekk();
    }
    g.restore();
  },
  ikonLerret(ik, t) {
    const c = document.createElement('canvas'); c.width = c.height = 60; const g = c.getContext('2d'); g.scale(2, 2); this.ikon(g, ik, 15, 15, 11, t); c.setAttribute('aria-hidden', 'true'); return c;
  }
};
