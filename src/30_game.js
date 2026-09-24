/* ============================================================
   SPILLET  -  tittel, innleggelse, etasjer, rom, tjenester, journal, HUD, død og hovedløkke
   ============================================================ */
const META_KEY = 'morbidium_meta_v2';
function loadMeta() {
  const d = { deaths: 0, bossKills: 0, wins: 0, fragments: [], lastStart: null, lastDeath: null, settings: { vol: .7, shake: true, flash: true, distort: true, lights: true, simple: false } };
  const m = Store.get(META_KEY, null); return m ? Object.assign(d, m, { settings: Object.assign(d.settings, m.settings || {}) }) : d;
}
function saveMeta() { Store.set(META_KEY, G.meta); }
/* ---------- lagret løp: tas ved starten av hver etasje, så en lukket fane ikke koster hele løpet ---------- */
const RUN_KEY = 'morbidium_run_v1';
function saveRun(first) {
  const P = G.player, run = G.run; if (!P || !run || !P.alive) return;
  run.diag = P.diag;
  Store.set(RUN_KEY, { v: 1, depth: G.depth, first: !!first, elapsed: performance.now() - run.t0, run: Object.assign({}, run, { t0: 0 }),
    p: { stats: P.stats, weapon: P.weapon, weaponLvl: P.weaponLvl, hp: P.hp, cons: P.cons, teeth: P.teeth, morb: P.morb, xp: P.xp, level: P.level, points: P.points, diag: P.diag, counters: P.counters, dodgeMax: P.dodgeMax } });
}
function savedRun() { const s = Store.get(RUN_KEY, null); return s && s.v === 1 && s.run && s.p ? s : null; }
function clearRun() { try { localStorage.removeItem(RUN_KEY); } catch (e) { } }
function continueRun() {
  const s = savedRun(); if (!s) return;
  show('title', false); resetRun();
  G.run = s.run; G.patient = s.run.patient; G.run.t0 = performance.now() - (s.elapsed || 0);
  for (const id of Object.keys(PILL_COL)) { const k = G.run.pillKnown && G.run.pillKnown[id]; CONSUMABLES[id].name = PILL_COL[id][0] + (k ? ': ' + PILLS[k][0] : ''); CONSUMABLES[id].desc = k ? PILLS[k][1] : 'Ukjent virkning. Bare prøv.'; }
  G.restore = s.p; startFloor(s.depth, s.first);
}
function applySettings() { const s = G.meta.settings; R.safe = !!s.simple; Sound.setVolume(s.vol); R.shakeOn = s.shake; R.flashOn = s.flash; R.distortOn = s.distort; R.lightsOn = s.lights; }
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const shuf = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function toast(t, sub) { const el = $('toast'); el.innerHTML = esc(t) + (sub ? '<small>' + esc(sub) + '</small>' : ''); el.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(() => el.classList.remove('on'), 1900); }
function stampBig(t, sub) { const el = $('bigstamp'); el.innerHTML = esc(t) + (sub ? '<small>' + esc(sub) + '</small>' : ''); el.classList.add('on'); Sound.play('stamp'); clearTimeout(stampBig.h); stampBig.h = setTimeout(() => el.classList.remove('on'), 1500); }
function paLine(txt) { const el = $('pa'); el.textContent = 'Høyttaleren: ' + txt; el.classList.add('on'); Sound.play('pa', .7); clearTimeout(paLine.h); paLine.h = setTimeout(() => el.classList.remove('on'), 5200); }
function show(id, on) { $(id).classList.toggle('hidden', !on); }
function partCanvas(P, w, h, s = 1) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  const k = Math.min(w / P.canvas.width, h / P.canvas.height) * s; g.drawImage(P.canvas, (w - P.canvas.width * k) / 2, (h - P.canvas.height * k) / 2, P.canvas.width * k, P.canvas.height * k); return c;
}
function artFor(kind, id) {
  try {
    if (kind === 'card') return cardArtCanvas(id, 92);
    if (kind === 'cons') return partCanvas(bottlePart(id), 92, 92, .9);
    if (kind === 'weapon') return partCanvas(weaponPart(id), 92, 92, 1);
    if (kind === 'heart') return partCanvas(heartPart(), 92, 92, .8);
    if (kind === 'kur') return partCanvas(itemIcon(id), 92, 92, .9);
  } catch (e) { }
  return cardArtCanvas('ukjent', 92);
}

/* ---------- tittel ---------- */
function showTitle() {
  G.state = 'title'; show('hud', false); show('panel', false); show('journal', false); show('title', true);
  clearFloor(); if (G.player) { G.player.doll.dispose(); R.remove(G.player.lantern); G.player = null; }
  G.depth = 1; G.th = THEMES[1]; G.F = generateFloor(rndi(1, 1e9), 1, {}); if (!R.lowTex) decorateLevel(); else { Paint.level({ W: 1, H: 1, tiles: new Uint8Array(1), roomId: new Int16Array(1), rooms: [] }, G.th); } G.titleT = 0;
  const r = G.F.rooms[G.F.startId], cx = r.x + r.w / 2, cz = r.z + r.h / 2;
  if (!R.lowTex) G.titleDolls = [['kultist', -1.5, 0, 's'], ['pleier', 1.6, .6, 'f'], ['yngel', .2, 1.8, 'f']].map(([t, dx, dz, v]) => { const d = new Doll(t, {}); d.root.position.set(cx + dx, 0, cz + dz); d.view = v; d.flip = -1; R.scene.add(d.root); return d; });
  R.snapCamera(cx, cz);
  const m = G.meta, sv = savedRun();
  const bt = $('boot'); if (bt) bt.style.display = 'none';
  $('title').innerHTML = `<h1>MORBIDIUM</h1><div class="sub">Sanatorium for oppstyrret sinn, 1923</div>
    <div class="menu">${sv ? `<button class="btn big" id="tCont">Fortsett: ${esc(sv.run.patient.name)}, ${esc((THEMES[sv.depth] || THEMES[1]).name.split(':')[0])}</button>` : ''}<button class="btn ${sv ? '' : 'big'}" id="tNew">Ny pasient</button><button class="btn" id="tArch">Arkivet</button><button class="btn" id="tSet">Innstillinger</button></div>
    <div class="meta">${m.deaths ? `${m.deaths} pasienter er skrevet ut på den ene eller andre måten. ${m.bossKills} overleger behandlet.` : 'Ingen pasienter har ennå forlatt bygningen.'}<br>Tastatur og mus, håndkontroll eller berøring.</div>`;
  $('tNew').onclick = () => { Sound.init(); applySettings(); showIntake(); };
  if (sv) $('tCont').onclick = () => { Sound.init(); applySettings(); continueRun(); };
  $('tArch').onclick = () => { Sound.init(); showArchive(); };
  $('tSet').onclick = () => { Sound.init(); openSettings(true); };
  setTimeout(() => ($('tCont') || $('tNew')) && ($('tCont') || $('tNew')).focus(), 50);
}
function showArchive() {
  const m = G.meta, frags = m.fragments.map(i => LORE[i]).filter(Boolean);
  openPanel(`<div class="hdr">Arkivet</div><div class="list paper" style="width:min(640px,94vw);padding:16px">
    <p><b>${m.deaths}</b> dødsfall, <b>${m.bossKills}</b> overleger behandlet, <b>${m.wins}</b> utskrevet.</p>
    <p>Oppvåkningssteder: ${Object.entries(AWAKENINGS).map(([k, a]) => unlocked(k) ? esc(a.name) : '<i>låst</i>').join(', ')}.</p>
    ${m.lastDeath ? `<p>Forrige pasient, ${esc(m.lastDeath.name)}, ligger fortsatt et sted i etasje ${m.lastDeath.depth}.</p>` : ''}
    <h3 style="font-family:var(--display);font-weight:normal">Journalfragmenter (${frags.length} av ${LORE.length})</h3>
    ${frags.map(f => `<p><b>${esc(f.t)}</b><br>${esc(f.b)}</p>`).join('') || '<p>Ingen funnet ennå. De ligger på lesepulter rundt i bygget.</p>'}
    <div class="btnrow"><button class="btn" data-close>Tilbake</button></div></div>`, { back: true });
}

/* ---------- innleggelse og oppvåkning ---------- */
function unlocked(k) { const a = AWAKENINGS[k]; return !a.unlock || (a.unlock === 'bossKill' && G.meta.bossKills >= 1) || (a.unlock === 'deaths3' && G.meta.deaths >= 3); }
function showIntake() {
  show('title', false);
  G.patient = { name: pick(FIRST) + ' ' + pick(LAST), nr: rndi(1000, 9999), age: rndi(19, 74), complaint: pick(COMPLAINTS) };
  const avail = shuf(Object.keys(AWAKENINGS).filter(k => unlocked(k) && k !== G.meta.lastStart)).slice(0, 3);
  const locked = Object.keys(AWAKENINGS).filter(k => !unlocked(k)).slice(0, 1);
  const p = G.patient;
  openPanel(`<div class="hdr">Innleggelse</div><div class="pickrow">
    <div class="intake paper"><h2>${esc(p.name)}</h2><div class="who">Pasient ${p.nr}, ${p.age} år</div><canvas id="inPort" width="200" height="240"></canvas><div class="who">${esc(p.complaint)}</div></div>
    ${avail.map(k => { const a = AWAKENINGS[k]; return `<button class="pickcard paper" data-awk="${k}"><h3>Våkner: ${esc(a.name)}</h3><div class="good">${esc(a.perk)}</div><div class="bad">${esc(a.problem)}</div></button>`; }).join('')}
    ${locked.map(k => `<div class="pickcard paper locked"><h3>Låst</h3><div>${AWAKENINGS[k].unlock === 'bossKill' ? 'Behandle en overlege for å låse opp.' : 'Dø tre ganger for å låse opp.'}</div></div>`).join('')}
  </div><div class="hint" style="color:var(--parch-l)">Du våkner aldri to ganger på samme sted.</div>`, { back: true, onBack: showTitle });
  const g = $('inPort').getContext('2d'); drawDollPortrait(g, 'pasient', 100, 228, 110);
  document.querySelectorAll('[data-awk]').forEach(b => b.onclick = () => { G.panelO = null; show('panel', false); newRun(b.dataset.awk); });
  const f = document.querySelector('[data-awk]'); f && f.focus();
}
const CARD_POOL = ['due', 'lys', 'skyggehand', 'stempel', 'brekning', 'monolog', 'hydro', 'kappe', 'skjema', 'nokler', 'resept', 'benektelse'];
function owned(id) { return G.run.slots.some(c => c && c.id === id) || G.run.reserve.some(c => c.id === id); }
function giveCard(id, quiet) {
  const run = G.run, card = { id, up: null, lvl: 1 }, home = REGIONS.findIndex(r => r.id === AFFINITY[id]);
  if (home >= 0 && !run.slots[home]) run.slots[home] = card;
  else { const f = run.slots.indexOf(null); if (f >= 0) run.slots[f] = card; else run.reserve.push(card); }
  if (!quiet) { toast(ABILITIES[id].name, 'Festet i journalen'); Sound.play('paper'); }
  hudCardsKey = ''; return card;
}
function newRun(awk) {
  const run = G.run = { awk, patient: G.patient, seed: rndi(1, 2e9), stats: { helse: 2, styrke: 2, smidighet: 2, forstand: 2, fatteevne: 2 }, weapon: 'mopp', slots: [null, null, null, null], reserve: [], diag: [], teeth: 0, morb: 0, hpFrac: 1, kills: 0, rooms: 0, t0: performance.now(), price: 1 };
  Items.newRun();
  let n = 2;
  if (awk === 'eget') n = 3;
  if (awk === 'likhus') { run.weapon = 'sag'; run.teeth = 25; run.hpFrac = .6; run.price = 1.25; run.revealBoss = true; }
  if (awk === 'toalett') { run.morb = 30; run.price = 1.2; run.revealTreasure = true; }
  if (awk === 'soppel') { run.weapon = pick(['stativ', 'sag', 'bekken']); n = 3; }
  if (awk === 'vaskesjakt') run.stats.styrke++;
  if (awk === 'operasjon') run.diag.push(pick(Object.keys(DIAGNOSES)));
  if (awk === 'begravelse') run.price = .75;
  shuf(CARD_POOL.filter(id => ABILITIES[id])).slice(0, n).forEach(id => giveCard(id, true));
  if (awk === 'operasjon') { const c = run.slots.find(Boolean); if (c) c.up = 'a'; }
  G.meta.lastStart = awk; saveMeta();
  startFloor(AWAKENINGS[awk].depth || 1, true);
}

/* ---------- etasjer ---------- */
function killObj(o) { if (!o) return; if (o.doll) o.doll.dispose(); for (const k of ['g', 'mesh', 'root', 'light']) if (o[k] && o[k].isObject3D) R.remove(o[k]); }
function clearFloor() {
  for (const e of G.enemies) killObj(e); G.enemies = [];
  if (G.boss) { killObj(G.boss); if (G.boss.glow) R.remove(G.boss.glow); G.boss = null; }
  show('bossBar', false);
  for (const k of ['allies', 'projectiles', 'puddles', 'pickups', 'npcs', 'walls', 'halluc', 'zones']) { for (const o of G[k] || []) killObj(o); G[k] = []; }
  for (const t of G.tele) R.remove(t.mesh); G.tele = [];
  for (const f of G.fxl) R.remove(f.obj); G.fxl = [];
  for (const b of G.barriers) R.remove(b.g); G.barriers = [];
  if (G.titleDolls) { G.titleDolls.forEach(d => d.dispose()); G.titleDolls = null; }
  G.props = []; Items.clear(); clearVFX(); Particles.clear(); FX.clear(); G.lock = null; G.trapdoor = null; G.flow = null; G.combat = null; G.corpse = null;
}
function decorateLevel() {
  const F = G.F, rng = mulberry32(F.seed || 7);
  Paint.level(F, G.th); if (Paint.decals) Paint.decals(F, Math.round(F.W * F.H / 70)); R.setGrade(G.th);
  spawnProps();
  const isF = (x, z) => x >= 0 && z >= 0 && x < F.W && z < F.H && F.tiles[z * F.W + x] > 0;
  for (const r of F.rooms) {
    const cx = r.x + r.w / 2, cz = r.z + r.h / 2;
    R.light(cx, cz + .3, Math.max(r.w, r.h) * .62, r.role === 'boss' ? '#ff9a6a' : G.th.pool || '#ffe6a0', r.role === 'boss' ? .55 : .5, R.levelL);
    const wallOK = x => !isF(x, r.z - 1) && !isF(x + 1, r.z - 1) && !isF(x - 1, r.z - 1);
    if (r.role === 'service') { for (let x = r.x + 1; x < r.x + r.w - 2; x++) if (wallOK(x) && wallOK(x + 1)) { Paint.door(x + 1, r.z, SERVICES[r.service].name.replace(/^(Den|Det) /, '').toUpperCase().slice(0, 12)); break; } }
    else if (rng() < .7) { const x = r.x + 2 + Math.floor(rng() * Math.max(1, r.w - 4)); if (wallOK(x)) Paint.poster(POSTERS[Math.floor(rng() * POSTERS.length)], x + .5, r.z); }
  }
}
function startFloor(depth, first) {
  clearFloor();
  const run = G.run, A0 = AWAKENINGS[run.awk];
  G.depth = depth; G.th = THEMES[depth];
  const opts = first ? { startTemplate: A0.template, startCombat: ['soppel', 'operasjon', 'begravelse'].includes(run.awk), extraPleier: run.awk === 'eget', startDepth: depth } : {};
  if (window.bootStep) bootStep('Bygger etasje ' + depth); G.okFrames = 0;
  G.F = generateFloor(run.seed + depth * 7919, depth, opts);
  decorateLevel();
  const F = G.F, sr = F.rooms[F.startId];
  if (!G.player) {
    G.player = makePlayer(run); const Rs = G.restore; G.restore = null;
    if (Rs) { Object.assign(G.player, Rs, { dodge: Rs.dodgeMax || 2 }); G.player.doll.setWeapon(Rs.weapon); run.diag = G.player.diag; }
    recalcPlayer(); if (Rs) G.player.hp = clamp(Rs.hp, 1, G.player.maxHp);
    const md = $('medal'); md.innerHTML = ''; md.appendChild(portraitCanvas('pasient')); Items.clearLook(); Items.itemsKey = '';
  }
  const P = G.player, sp = freeSpot(sr.x + sr.w / 2, sr.z + sr.h / 2 + 1, 4); P.x = sp.x; P.z = sp.z; P.vx = P.vz = P.kvx = P.kvz = 0;
  P.doll.root.position.set(P.x, 0, P.z); P.coffee = false;
  Items.onFloor(); Items.updateLook();
  G.rooms = F.rooms.map(r => ({ cleared: r.role !== 'boss' && !(r.waves && r.waves.length), visited: false }));
  G.seen = new Uint8Array(F.W * F.H); G.seenT = 0; G.shops = {}; G.lore = {};
  const reveal = r => { for (let z = r.z - 1; z <= r.z + r.h; z++) for (let x = r.x - 1; x <= r.x + r.w; x++) if (x >= 0 && z >= 0 && x < F.W && z < F.H) G.seen[z * F.W + x] = 1; };
  if (run.revealBoss) reveal(F.rooms[F.bossId]);
  if (run.revealTreasure) F.rooms.filter(r => r.role === 'treasure').forEach(reveal);
  // spor etter forrige pasient
  const ld = G.meta.lastDeath;
  if (ld && ld.depth === depth && !ld.looted) {
    const cand = F.rooms.filter(r => r.role === 'combat'), r = cand.length ? pick(cand) : sr, c = freeSpot(r.x + r.w / 2, r.z + r.h / 2, 3);
    const g = propSprite('corpse', c.x, c.z, { P: propArt({ k: 'corpse' }), flat: true }); R.level.add(g); G.corpse = { x: c.x, z: c.z, g, ld };
  }
  Sound.startAmbience(depth); G.paT = rnd(18, 30);
  $('floorName').textContent = G.th.name; hudCardsKey = ''; drawWeaponCard();
  show('hud', true); show('title', false); G.state = 'play';
  R.snapCamera(P.x, P.z);
  toast(G.th.name, first ? 'Du våkner: ' + A0.name : 'Luken smeller igjen over deg');
  if (first) setTimeout(() => FX.bubble(P, pick(['Hvor er tøflene mine? Å. Der.', 'Dette er ikke rommet mitt.', 'Noen har skrevet navnet mitt feil.']), 2.4), 900);
  $('game').focus(); saveRun(first);
}
function descend() {
  const P = G.player; if (!P.alive) return;
  if (G.depth >= MAX_DEPTH) { showWin(); return; }
  Sound.play('door'); healPlayer(Math.round(P.maxHp * .25), true);
  startFloor(G.depth + 1, false);
}

/* ---------- rom: låsing, bølger, rydding ---------- */
function roomAt(x, z) { const i = tIdx(x, z); return i >= 0 ? G.F.roomId[i] : -1; }
function roomLogic(dt) {
  const P = G.player, F = G.F, rid = roomAt(P.x, P.z);
  G.seenT -= dt;
  if (G.seenT <= 0) {
    G.seenT = .2; const px = Math.floor(P.x), pz = Math.floor(P.z);
    for (let z = pz - 5; z <= pz + 5; z++) for (let x = px - 6; x <= px + 6; x++) if (x >= 0 && z >= 0 && x < F.W && z < F.H) G.seen[z * F.W + x] = 1;
    if (rid >= 0) { const r = F.rooms[rid]; for (let z = r.z - 1; z <= r.z + r.h; z++) for (let x = r.x - 1; x <= r.x + r.w; x++) if (x >= 0 && z >= 0 && x < F.W && z < F.H) G.seen[z * F.W + x] = 1; }
  }
  if (G.combat) { combatTick(dt); return; }
  if (rid < 0 || !P.alive) return;
  const r = F.rooms[rid], st = G.rooms[rid];
  if (!st.visited) { st.visited = true; if (r.role === 'service') { const S = SERVICES[r.service]; toast(S.name, S.npc ? S.npc + ' er på vakt' : ''); } if (r.role === 'treasure') toast('Et stille rom', 'Noen har glemt noe her'); }
  if (st.cleared) return;
  if (P.x < r.x + 1.3 || P.x > r.x + r.w - 1.3 || P.z < r.z + 1.3 || P.z > r.z + r.h - 1.3) return;
  lockRoom(r);
}
function lockRoom(r) {
  const F = G.F; G.lock = new Set(r.doors);
  for (const i of r.doors) {
    const x = i % F.W, z = (i / F.W) | 0, g = propSprite('barrier', x + .5, z + .95, { P: barrierArt() });
    g.position.y = -1.6; R.level.add(g); G.barriers.push({ g, t: 0, up: true });
  }
  Sound.play('door'); R.shake(.2); Items.onRoomLock();
  G.combat = { r, wave: -1, t: .7, boss: r.role === 'boss' };
  if (r.role === 'boss') { spawnBoss(G.depth, r.x + r.w / 2, r.z + r.h / 2 - 1); G.combat.t = 99; }
  else toast(r.role === 'risk' ? 'Frivillig risiko' : 'Dørene smeller igjen', r.role === 'risk' ? 'Noen her er større enn de andre' : '');
}
function combatTick(dt) {
  const C = G.combat, alive = G.enemies.filter(e => e.alive).length;
  if (C.boss) { if (!G.boss || !G.boss.alive) { if (!C.endT) C.endT = 2; C.endT -= dt; if (C.endT <= 0) finishCombat(); } return; }
  C.t -= dt; if (C.t > 0) return;
  const waves = C.r.waves || [];
  if (C.wave < waves.length - 1 && alive <= (C.wave < 0 ? 0 : 1)) { C.wave++; spawnWave(C.r, waves[C.wave]); C.t = 1.4; }
  else if (C.wave >= waves.length - 1 && alive === 0) finishCombat();
}
function spawnWave(r, wave) {
  const pts = (r.spawns && r.spawns.length ? r.spawns : [[r.x + r.w / 2, r.z + r.h / 2]]), P = G.player;
  wave.forEach((w, i) => {
    let [x, z] = pts[i % pts.length]; x += rnd(-.6, .6); z += rnd(-.6, .6);
    if (Math.hypot(x - P.x, z - P.z) < 2.5) { x = r.x + r.w - x + r.x; z = r.z + r.h - z + r.z; }
    const s = freeSpot(x, z, 2);
    setTimeout(() => { if (G.state === 'play' || G.state === 'panel') spawnEnemy(w.t, s.x, s.z, !!w.elite, G.depth); }, i * 160);
  });
}
function finishCombat() {
  const C = G.combat, r = C.r, st = G.rooms[r.id]; st.cleared = true; G.combat = null; G.lock = null; G.run.rooms++;
  for (const b of G.barriers) b.up = false;
  Sound.play('clear'); stampBig('RYDDET', r.role === 'boss' ? '' : pick(['Rommet er friskmeldt', 'Personalet er beroliget', 'Ingen klager']));
  Items.onRoomClear(r);
  if (r.role === 'risk') dropTeeth(r.x + r.w / 2, r.z + r.h / 2, 12);
  else if (Math.random() < .35) dropPickup(G.player.x, G.player.z, 'heart');
  if (G.player.points > 0) setTimeout(() => toast('Du har poeng å fordele', 'Åpne journalen (Tab)'), 1200);
}
function updateBarriers(dt) {
  for (let i = G.barriers.length - 1; i >= 0; i--) {
    const b = G.barriers[i]; b.t = Math.min(1, b.t + dt * 4);
    b.g.position.y = b.up ? lerp(-1.6, 0, b.t * b.t) : lerp(b.g.position.y, -1.8, dt * 6);
    if (!b.up) { b.gone = (b.gone || 0) + dt; if (b.gone > .6) { R.remove(b.g); G.barriers.splice(i, 1); } }
  }
}

/* ---------- samhandling ---------- */
function findInteract() {
  const P = G.player; let best = null, bd = 2.0;
  const consider = (d, o) => { if (d < bd) { bd = d; best = o; } };
  for (const n of G.npcs) consider(Math.hypot(n.x - P.x, n.z - P.z) - .3, { t: n.service === 'journal' ? 'Les i journalskapet' : n.service === 'vaskeri' ? 'Undersøk vaskemaskinen' : 'Snakk med ' + SERVICES[n.service].npc, fn: () => openService(n.service, n) });
  for (const o of G.props) {
    if (!o.alive) continue; const d = Math.hypot(o.x - P.x, o.z - P.z) - .4;
    if (o.kind === 'chest' && !o.opened) consider(d, { t: 'Åpne kisten', fn: () => openChest(o) });
    if (o.kind === 'lore' && !o.read) consider(d, { t: 'Les journalsiden', fn: () => readLore(o) });
    if (o.kind === 'locker' && !o.opened) consider(d, { t: 'Be Olsen åpne skapet', fn: () => olsenLocker(o) });
  }
  for (const pd of Items.pedestals) if (!pd.taken) consider(Math.hypot(pd.x - P.x, pd.z - P.z) - .9, { t: 'Ta ' + ITEMS[pd.id].name + Items.priceText(pd), fn: () => Items.take(pd) });
  if (G.corpse && !G.corpse.ld.looted) consider(Math.hypot(G.corpse.x - P.x, G.corpse.z - P.z) - .5, { t: 'Undersøk liket', fn: lootCorpse });
  if (G.trapdoor) consider(Math.hypot(G.trapdoor.x - P.x, G.trapdoor.z - P.z) - .6, { t: G.depth >= MAX_DEPTH ? 'Gå ut av bygget' : 'Klatre ned', fn: descend });
  for (const k of G.pickups) if (k.kind === 'weapon' || k.kind === 'card' || k.kind === 'cons') consider(Math.hypot(k.x - P.x, k.z - P.z) + .2, { t: k.kind === 'weapon' ? 'Ta ' + WEAPONS[k.val].name : k.kind === 'card' ? 'Plukk opp kortet' : 'Ta ' + CONSUMABLES[k.val].name, fn: () => takePickup(k) });
  return best;
}
function interactLogic(A) {
  const P = G.player; if (!P.alive) { show('prompt', false); return; }
  // småting plukkes opp automatisk når lomma er tom eller har samme type
  for (const k of G.pickups.slice()) if (k.kind === 'cons' && k.t > .5 && (!P.cons || P.cons.id === k.val) && Math.hypot(k.x - P.x, k.z - P.z) < .6) takePickup(k);
  const it = findInteract(), pr = $('prompt');
  if (it) { const key = A.touch ? 'Snakk' : A.pad ? 'Y' : 'E'; pr.innerHTML = `<kbd>${key}</kbd>${esc(it.t)}`; show('prompt', true); if (A.interactP) it.fn(); }
  else show('prompt', false);
}
function openChest(o) {
  o.opened = true; o.p.opened = true; R.remove(o.g); o.g = propSprite('chest', o.x, o.z + .3, { P: propArt(o.p) }); R.level.add(o.g);
  Sound.play('door', .8, 1.4); puff(o.x, o.z, 3, .8); dropTeeth(o.x, o.z, 8);
  const P = G.player, notOwned = CARD_POOL.filter(id => ABILITIES[id] && !owned(id));
  const opts = shuf([
    notOwned.length && { art: ['card', notOwned[0]], name: ABILITIES[notOwned[0]].name, desc: ABILITIES[notOwned[0]].desc, fn: () => giveCard(notOwned[0]) },
    { art: ['weapon', P.weapon], name: 'Slipestein', desc: WEAPONS[P.weapon].name + ' blir 25 % skarpere.', fn: () => { P.weaponLvl++; drawWeaponCard(); toast('Skarpere', WEAPONS[P.weapon].name); } },
    { art: ['cons', 'kamfer'], name: 'Medisinskrin', desc: 'To tilfeldige flasker til lomma.', fn: () => { for (let i = 0; i < 2; i++) dropPickup(P.x, P.z, 'cons', pick(Object.keys(CONSUMABLES))); } },
    { art: ['heart'], name: 'Sterkt hjerte', desc: 'Ett poeng i Helse, og full helse.', fn: () => { P.stats.helse = Math.min(5, P.stats.helse + 1); recalcPlayer(); healPlayer(P.maxHp, true); } }
  ].filter(Boolean)).slice(0, 3);
  choicePanel('Kisten', 'Du får ta én ting. Resten er beslaglagt.', opts);
}
function choicePanel(title, sub, opts) {
  openPanel(`<div class="hdr">${esc(title)}</div><div class="list paper" style="width:min(640px,94vw);padding:14px 16px 16px"><div class="hint">${esc(sub)}</div><div class="offers" style="margin-top:10px">${opts.map((o, i) => `<button class="offer" data-ch="${i}"><span data-art="${i}"></span><b>${esc(o.name)}</b>${esc(o.desc)}</button>`).join('')}</div></div>`);
  opts.forEach((o, i) => { document.querySelector(`[data-art="${i}"]`).replaceWith(artFor(o.art[0], o.art[1])); document.querySelector(`[data-ch="${i}"]`).onclick = () => { closePanel(); o.fn(); Sound.play('pickup'); }; });
  document.querySelector('[data-ch="0"]').focus();
}
function readLore(o) {
  o.read = true; const m = G.meta, idx = LORE.findIndex((_, i) => !m.fragments.includes(i)), i = idx >= 0 ? idx : rndi(0, LORE.length - 1);
  if (!m.fragments.includes(i)) { m.fragments.push(i); saveMeta(); }
  const f = LORE[i]; Sound.play('paper'); gainXp(15);
  openPanel(`<div class="list paper" style="width:min(560px,94vw);padding:18px 22px"><div class="jtitle">${esc(f.t)}</div><p style="font-size:18px;line-height:1.45">${esc(f.b)}</p><div class="hint">Fragment ${m.fragments.length} av ${LORE.length} er arkivert.</div><div class="btnrow"><button class="btn" data-close>Legg fra deg</button></div></div>`);
}
function olsenLocker(o) {
  o.tries = (o.tries || 0) + 1; const n = G.npcs.find(n => n.service === 'vaktmester'), line = OLSEN_LOCKER[Math.min(o.tries - 1, OLSEN_LOCKER.length - 1)];
  if (n) FX.bubble(n, line, 3); else toast(line);
  Sound.play('bonk', .8, .8);
  if (o.tries >= 4) { o.opened = true; const P = G.player; dropTeeth(o.x, o.z, 20); dropPickup(o.x, o.z, 'cons', pick(Object.keys(CONSUMABLES))); Sound.play('door'); }
}
function lootCorpse() {
  const C = G.corpse, ld = C.ld; ld.looted = true; saveMeta();
  dropTeeth(C.x, C.z, Math.max(3, Math.round((ld.teeth || 0) / 2)));
  openPanel(`<div class="list paper" style="width:min(520px,94vw);padding:18px 22px"><div class="jtitle">Her ligger ${esc(ld.name)}</div><p style="font-size:17px">Dødsårsak ifølge lappen på tåa: <b>${esc(ld.cause)}</b></p><p class="hint">Lommene er fortsatt varme. Du tar tennene. Hen hadde gjort det samme.</p><div class="btnrow"><button class="btn" data-close>Gå videre</button></div></div>`);
}
function openLearn(id, src) {
  const own = G.run.slots.concat(G.run.reserve).find(c => c && c.id === id);
  if (own) { if (own.lvl < 4) { own.lvl++; toast(ABILITIES[id].name, 'Nivå ' + own.lvl); } else { G.player.teeth += 15; toast('Kjenner den fra før', '15 gulltenner i stedet'); } Sound.play('paper'); hudCardsKey = ''; return; }
  choicePanel(ABILITIES[id].name, src || 'Et kartotekkort', [{ art: ['card', id], name: 'Fest i journalen', desc: ABILITIES[id].desc, fn: () => giveCard(id) }, { art: ['card', 'ukjent'], name: 'La det ligge', desc: 'Noen andre trenger det mer.', fn: () => { } }]);
}

/* ---------- tjenester (pergament med blått bånd, som smeden i Conan) ---------- */
function price(b) { const P = G.player; return Math.max(1, Math.ceil(b * G.run.price * (1 - (P.stats.fatteevne - 1) * .05) * (hasDiag('hovedperson') ? 1.3 : 1))); }
const SVC_WHO = { kafeteria: 'kokk', medisin: 'hansen', vaktmester: 'olsen', bibliotek: 'bibliotekar' };
function buildOffers(svc) {
  const P = G.player, C = CONSUMABLES, o = [];
  const cons = id => ({ art: ['cons', id], name: C[id].name, desc: C[id].desc, p: 15, fn: () => dropPickup(P.x, P.z, 'cons', id) });
  if (svc === 'kafeteria') o.push({ art: ['heart'], name: 'Dagens suppe', desc: 'Helbreder 40 %. Den er grå.', p: 12, fn: () => healPlayer(Math.round(P.maxHp * .4)) }, { art: ['cons', 'kamfer'], name: 'Kaffe', desc: '10 % raskere resten av etasjen.', p: 10, fn: () => { P.coffee = true; } }, cons('levertran'), { art: ['heart'], name: 'Ekstra porsjon', desc: 'Ett poeng i Helse.', p: 34, fn: () => { P.stats.helse = Math.min(5, P.stats.helse + 1); recalcPlayer(); } });
  if (svc === 'medisin') { const pl = pick(Object.keys(PILL_COL)); o.push({ art: ['cons', pl], name: 'Ukjent pille', desc: 'Søster Hansen vet heller ikke hva den gjør.', p: 7, again: true, fn: () => dropPickup(P.x, P.z, 'cons', pick(Object.keys(PILL_COL))) }); }
  if (svc === 'medisin') o.push({ art: ['heart'], name: 'Full behandling', desc: 'Helbreder alt. Søster Hansen sukker.', p: 28, fn: () => healPlayer(P.maxHp) }, { art: ['cons', 'luktesalt'], name: 'Rens for Morbidium', desc: 'Fjerner 40 metning.', p: 14, fn: () => { P.morb = Math.max(0, P.morb - 40); } }, cons('luktesalt'), cons('kamfer'), { art: ['card', 'ukjent'], name: 'Eksperimentell pille', desc: 'Gir en tilfeldig diagnose. Det er poenget.', p: 18, fn: () => { const d = shuf(Object.keys(DIAGNOSES).filter(k => !P.diag.includes(k)))[0]; if (d && P.diag.length < 4) { P.diag.push(d); stampBig('DIAGNOSE', DIAGNOSES[d].name); } } });
  if (svc === 'vaktmester') { shuf(Object.keys(WEAPONS).filter(w => w !== P.weapon)).slice(0, 2).forEach((w, i) => o.push({ art: ['weapon', w], name: WEAPONS[w].name, desc: WEAPONS[w].desc, p: 28 + i * 6, fn: () => { dropPickup(P.x, P.z, 'weapon', P.weapon); P.weapon = w; P.weaponLvl = 0; P.doll.setWeapon(w); drawWeaponCard(); } })); { const kid = Items.pickFrom('butikk'); o.push({ art: ['kur', kid], name: ITEMS[kid].name, desc: ITEMS[kid].desc, p: 48, fn: () => Items.give(kid) }); } o.push({ art: ['weapon', P.weapon], name: 'Sveis våpenet', desc: WEAPONS[P.weapon].name + ' får 25 % mer skade.', p: 24 + P.weaponLvl * 14, again: true, fn: () => { P.weaponLvl++; drawWeaponCard(); } }, cons('eter')); }
  if (svc === 'journal') {
    for (const c of G.run.slots.concat(G.run.reserve)) { if (!c) continue; const A0 = ABILITIES[c.id];
      if (!c.up && A0.up) for (const k of ['a', 'b']) o.push({ art: ['card', c.id], name: A0.name + ': ' + A0.up[k].name, desc: A0.up[k].desc, p: 22, group: c.id, fn: () => { c.up = k; hudCardsKey = ''; } });
      if (c.lvl < 4) o.push({ art: ['card', c.id], name: 'Styrk ' + A0.name, desc: 'Nivå ' + (c.lvl + 1) + ' av 4.', p: 12 + c.lvl * 8, fn: () => { c.lvl++; hudCardsKey = ''; } });
    }
    o.push({ art: ['card', 'ukjent'], name: 'Omorganiser journalen', desc: 'Flytt kort mellom områdene i hodet. Gratis.', p: 0, again: true, fn: () => { closePanel(); openJournal('ferdigheter'); } });
  }
  if (svc === 'bibliotek') { shuf(CARD_POOL.filter(id => ABILITIES[id] && !owned(id))).slice(0, 3).forEach(id => o.push({ art: ['card', id], name: ABILITIES[id].name, desc: ABILITIES[id].desc, p: 26, fn: () => giveCard(id) })); o.push({ art: ['card', 'ukjent'], name: 'Plantegning', desc: 'Hele etasjen tegnes inn på kartet.', p: 10, fn: () => G.seen.fill(1) }); }
  if (svc === 'vaskeri') o.push({ art: ['cons', 'luktesalt'], name: 'Vask kappen', desc: 'Fjerner 25 Morbidium. Første vask er gratis.', p: 0, fn: () => { P.morb = Math.max(0, P.morb - 25); } }, { art: ['card', 'ukjent'], name: 'Stikk hånden inn i trommelen', desc: 'Noe er der inne. Det kan bite.', p: 8, again: true, fn: () => { const r = Math.random(); if (r < .45) { dropPickup(P.x, P.z, 'cons', pick(Object.keys(CONSUMABLES))); toast('En flaske', 'Våt, men hel'); } else if (r < .65) { dropTeeth(P.x, P.z, 25); toast('Gulltenner', 'Noens lommer ble vasket'); } else if (r < .85) { hurt(P, 12, { type: 'self' }); dropPickup(P.x, P.z, 'weapon', pick(Object.keys(WEAPONS))); toast('Det bet', 'Men det slapp noe'); } else toast('Bare sokker', 'Ikke dine'); } });
  return o;
}
function openService(svc, npc) {
  const room = roomAt(G.player.x, G.player.z), key = svc + room;
  if (!G.shops[key]) G.shops[key] = buildOffers(svc);
  const S = SERVICES[svc], offers = G.shops[key], P = G.player;
  if (npc && npc.doll) FX.bubble(npc, pick(NPC_LINES[svc] || ['Ja?']), 2.4);
  const render = () => {
    openPanel(`<div class="shop"><div class="who paper"><span id="svcP"></span><div class="line">${esc(pick(NPC_LINES[svc] || ['...']))}</div><div style="font-weight:800;margin-top:6px">${esc(S.npc || '')}</div></div>
      <div class="list paper"><div class="ribbon2"><span>${esc(S.name)}</span><span>${P.teeth} gulltenner</span></div>
      <div class="offers">${offers.map((o, i) => { const pr = price(o.p); return `<button class="offer ${o.sold ? 'sold' : ''} ${pr > P.teeth ? 'poor' : ''}" data-of="${i}" ${o.sold ? 'disabled' : ''}><span data-oa="${i}"></span><b>${esc(o.name)}</b>${esc(o.desc)}<br><span class="price">${o.sold ? 'Solgt' : o.p ? pr + ' gulltenner' : 'Gratis'}</span></button>`; }).join('')}</div>
      <div class="btnrow"><button class="btn" data-close>Gå (Esc)</button></div></div></div>`);
    let pc; try { pc = SVC_WHO[svc] ? portraitCanvas(SVC_WHO[svc]) : cardArtCanvas(svc === 'journal' ? 'skyggehand' : 'ukjent', 128); } catch (e) { pc = cardArtCanvas('ukjent', 128); }
    $('svcP').replaceWith(pc);
    offers.forEach((o, i) => { document.querySelector(`[data-oa="${i}"]`).replaceWith(artFor(o.art[0], o.art[1])); const b = document.querySelector(`[data-of="${i}"]`); b.onclick = () => {
      const pr = price(o.p); if (o.sold) return; if (pr > P.teeth) { Sound.play('deny'); return; }
      P.teeth -= pr; o.fn(); Sound.play('tooth'); Sound.play('pickup');
      if (!o.again) o.sold = true; if (o.group) offers.forEach(x => { if (x.group === o.group) x.sold = true; });
      if (G.state === 'panel') render();
    }; });
    const f = document.querySelector('.offer:not(.sold)'); f && f.focus();
  };
  render();
}

/* ---------- paneler ---------- */
function openPanel(html, o = {}) {
  const el = $('panel'); el.innerHTML = html; show('panel', true); G.prevState = G.state === 'panel' ? G.prevState : G.state; G.state = 'panel'; G.panelO = o;
  el.querySelectorAll('[data-close]').forEach(b => b.onclick = () => closePanel());
}
function closePanel() {
  show('panel', false); const o = G.panelO || {};
  if (o.onBack) { G.panelO = null; o.onBack(); return; }
  G.state = G.prevState === 'title' ? 'title' : (G.player && G.player.alive ? 'play' : G.prevState || 'title');
  if (G.state === 'title') show('title', true);
  $('game').focus();
}
function openPause() {
  openPanel(`<div class="hdr">Pause</div><div class="list paper" id="settings" style="width:min(420px,92vw);padding:16px 18px">${settingsHtml()}<div class="btnrow"><button class="btn big" data-close>Fortsett</button><button class="btn" id="pJ">Journal</button><button class="btn" id="pQ">Avslutt til tittel</button></div><div class="hint">Løpet lagres ved starten av hver etasje.</div></div>`);
  bindSettings(); $('pJ').onclick = () => { closePanel(); openJournal(); }; $('pQ').onclick = () => { closePanel(); showTitle(); };
}
function openSettings(fromTitle) {
  show('title', false);
  openPanel(`<div class="hdr">Innstillinger</div><div class="list paper" id="settings" style="width:min(420px,92vw);padding:16px 18px">${settingsHtml()}<div class="btnrow"><button class="btn big" data-close>Ferdig</button></div></div>`, fromTitle ? { onBack: showTitle } : {});
  bindSettings();
}
function settingsHtml() {
  const s = G.meta.settings;
  return `<label>Lydstyrke <input type="range" min="0" max="1" step=".05" value="${s.vol}" id="sVol"></label>
    <label><input type="checkbox" id="sShake" ${s.shake ? 'checked' : ''}> Skjermristing</label>
    <label><input type="checkbox" id="sFlash" ${s.flash ? 'checked' : ''}> Hvite glimt ved store treff</label>
    <label><input type="checkbox" id="sDist" ${s.distort ? 'checked' : ''}> Forvrengning (blekkboiling, Morbidium-bølger, hallusinasjoner)</label>
    <label><input type="checkbox" id="sLight" ${s.lights ? 'checked' : ''}> Lys og skygge</label>
    <label><input type="checkbox" id="sSimple" ${s.simple ? 'checked' : ''}> Enkel grafikk (uten etterbehandling, for svake eller rare skjermkort)</label>`;
}
function bindSettings() {
  const s = G.meta.settings, up = () => { applySettings(); saveMeta(); };
  $('sVol').oninput = e => { s.vol = +e.target.value; up(); };
  $('sShake').onchange = e => { s.shake = e.target.checked; up(); }; $('sFlash').onchange = e => { s.flash = e.target.checked; up(); };
  $('sDist').onchange = e => { s.distort = e.target.checked; up(); }; $('sLight').onchange = e => { s.lights = e.target.checked; up(); }; $('sSimple').onchange = e => { s.simple = e.target.checked; up(); };
}

/* ============================================================
   JOURNALEN  -  Toms skisse: pasientjournal til venstre, psykisk kartlegging til høyre.
   Hodet er et frenologikart med fire områder. Kort festes med nål; et kort i sitt
   eget område får et gullprikk-nivå ekstra og kortere nedkjøling.
   ============================================================ */
const STAT_ICON = {
  helse: '<path d="M12 21C5 15.5 2 12 2 8a5 5 0 0 1 10-1 5 5 0 0 1 10 1c0 4-3 7.5-10 13z" fill="#c8322a" stroke="#2a1a14" stroke-width="2"/>',
  styrke: '<path d="M5 11V7a2 2 0 0 1 4 0V6a2 2 0 0 1 4 0 2 2 0 0 1 4 0v1a2 2 0 0 1 3 2v5c0 4-3 7-7 7s-8-3-8-7v-3z" fill="#e8c8a0" stroke="#2a1a14" stroke-width="2"/>',
  smidighet: '<path d="M7 2h6v10l6 3c2 1 2 5-1 5H5c-1 0-1-2 0-3l2-2z" fill="#6a4a2a" stroke="#2a1a14" stroke-width="2"/>',
  forstand: '<path d="M8 4a4 4 0 0 1 8 0 4 4 0 0 1 4 5 4 4 0 0 1-2 7 4 4 0 0 1-6 3 4 4 0 0 1-6-3 4 4 0 0 1-2-7 4 4 0 0 1 4-5z" fill="#e8a8b8" stroke="#2a1a14" stroke-width="2"/><path d="M12 6v13M8 10c2 0 3 1 4 2M16 10c-2 0-3 1-4 2" stroke="#2a1a14" stroke-width="1.5" fill="none"/>',
  fatteevne: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" fill="#f6f0e0" stroke="#2a1a14" stroke-width="2"/><circle cx="12" cy="12" r="3.5" fill="#2a1a14"/>'
};
const HEADMAP = { cx: [.417, .683, .442, .708], cy: [.308, .292, .592, .583] };
function drawHeadMap(c) {
  const g = c.getContext('2d'), W = c.width, s = W / 600; g.setTransform(s, 0, 0, s, 0, 0); g.clearRect(0, 0, 600, 600); g.lineJoin = 'round'; g.lineCap = 'round';
  const ink = (w, col = INK) => { g.lineWidth = w; g.strokeStyle = col; g.stroke(); };
  // profil mot venstre
  g.beginPath(); g.moveTo(440, 600); g.lineTo(452, 470); g.quadraticCurveTo(548, 400, 548, 300); g.bezierCurveTo(560, 140, 430, 40, 300, 46); g.bezierCurveTo(175, 52, 108, 150, 116, 250);
  g.lineTo(110, 300); g.lineTo(98, 330); g.lineTo(52, 396); g.quadraticCurveTo(60, 410, 98, 408); g.lineTo(90, 430); g.quadraticCurveTo(104, 440, 98, 448); g.lineTo(92, 464); g.quadraticCurveTo(100, 505, 118, 510); g.quadraticCurveTo(190, 548, 252, 520); g.lineTo(262, 600);
  g.fillStyle = '#e6d3a4'; g.fill(); ink(5);
  g.beginPath(); g.moveTo(345, 360); g.bezierCurveTo(385, 350, 392, 420, 350, 440); g.bezierCurveTo(338, 428, 356, 410, 340, 396); ink(4);
  g.beginPath(); g.moveTo(140, 322); g.quadraticCurveTo(162, 306, 186, 322); g.quadraticCurveTo(162, 338, 140, 322); ink(3.5); g.beginPath(); g.arc(160, 322, 5, 0, TAU); g.fillStyle = INK; g.fill();
  g.beginPath(); g.moveTo(132, 298); g.quadraticCurveTo(160, 286, 192, 296); ink(3.5);
  // fire hjerneområder som skyer
  const cloud = (cx, cy, rx, ry, col, seed) => {
    const rn = mulberry32(seed), pts = []; for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, k = i % 2 ? 1.12 : .96 + rn() * .04; pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
    g.beginPath(); const n = pts.length, mid = i => [(pts[i][0] + pts[(i + 1) % n][0]) / 2, (pts[i][1] + pts[(i + 1) % n][1]) / 2]; let m0 = mid(n - 1); g.moveTo(m0[0], m0[1]); for (let i = 0; i < n; i++) { const m = mid(i); g.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]); } g.closePath();
    const gr = g.createRadialGradient(cx - rx * .3, cy - ry * .3, 10, cx, cy, rx * 1.2); gr.addColorStop(0, Col.light(col, .3)); gr.addColorStop(1, Col.dark(col, .8)); g.fillStyle = gr; g.fill(); ink(4);
    g.save(); g.clip(); g.globalAlpha = .35; for (let i = 0; i < 6; i++) { g.beginPath(); const y = cy - ry + (i + .5) * ry * 2 / 6; g.moveTo(cx - rx, y); for (let x = -rx; x <= rx; x += 16) g.quadraticCurveTo(cx + x + 8, y + (rn() - .5) * 18, cx + x + 16, y); ink(2, Col.dark(col, .5)); } g.restore();
  };
  REGIONS.forEach((r, i) => cloud(HEADMAP.cx[i] * 600, HEADMAP.cy[i] * 600, 98, 84, r.color, i * 7 + 1));
  // navnet på området øverst i skyen, over kortplassen
  g.textAlign = 'center'; g.font = '26px "Alfa Slab One", Georgia, serif'; g.lineJoin = 'round';
  REGIONS.forEach((r, i) => { const x = HEADMAP.cx[i] * 600, y = HEADMAP.cy[i] * 600 - (i < 2 ? 68 : 56); g.lineWidth = 7; g.strokeStyle = '#f6ead0'; g.strokeText(r.name.toUpperCase(), x, y); g.fillStyle = Col.dark(r.dark, .8); g.fillText(r.name.toUpperCase(), x, y); });
  // ord rundt hodet med ledestreker
  g.font = '600 25px Caveat, cursive'; g.fillStyle = INK;
  const L = [['Orden', 150, 58, 0], ['Frykt', 70, 150, 0], ['Tvang', 48, 222, 0], ['Flukt', 40, 290, 0], ['Erindring', 196, 270, 0], ['Kontroll', 520, 70, 1], ['Plikt', 572, 150, 1], ['Tap', 580, 220, 1], ['Håp', 572, 280, 1], ['Drømmer', 190, 462, 2], ['Hva hvis?', 255, 560, 2], ['Stillhet', 390, 505, 3], ['Mening', 575, 390, 3], ['Tilpasning', 560, 450, 3], ['Frigjøring', 520, 510, 3]];
  for (const [w, x, y, ri] of L) {
    g.textAlign = x > 300 ? 'right' : 'left'; g.fillText(w, x, y);
    const tx = HEADMAP.cx[ri] * 600, ty = HEADMAP.cy[ri] * 600, sx = x + (x > 300 ? -g.measureText(w).width - 6 : g.measureText(w).width + 6), sy = y - 8;
    const dx = tx - sx, dy = ty - sy, dl = Math.hypot(dx, dy); if (dl < 70) continue;
    g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + dx / dl * 26, sy + dy / dl * 26); ink(1.6, 'rgba(42,26,20,.7)');
  }
}
function jCardHtml(c, ref, i) {
  if (!c) return '';
  const A0 = ABILITIES[c.id], home = REGIONS.find(r => r.id === AFFINITY[c.id]), match = ref === 's' && REGIONS[i].id === AFFINITY[c.id];
  const dots = [0, 1, 2, 3].map(k => `<i class="${k < c.lvl ? '' : 'off'}"></i>`).join('') + (match ? '<i class="bonus"></i>' : '');
  const tip = A0.name + ': ' + A0.desc + (c.up ? ' Oppgradert: ' + A0.up[c.up].name + '.' : '') + (home ? ' Hører hjemme i ' + home.name + '.' : '');
  return `<div class="jcard" data-ref="${ref}" data-i="${i}" title="${esc(tip)}" tabindex="0"><span data-jart="${c.id}"></span><div class="nm">${esc(A0.name.toUpperCase())}${c.up ? ' +' : ''}</div><div class="ft"><b style="background:${home ? home.color : '#ccc'}"></b>${dots}</div></div>`;
}
function openJournal(tab = 'ferdigheter') {
  if (!G.player) return;
  G.jtab = tab; G.jsel = null; if (G.state !== 'journal') G.jPrev = G.state; G.state = 'journal'; show('journal', true); renderJournal();
}
function closeJournal() { show('journal', false); G.state = G.jPrev === 'panel' ? 'play' : (G.jPrev || 'play'); if (G.state !== 'play') G.state = 'play'; hudCardsKey = ''; $('game').focus(); }
function renderJournal() {
  const P = G.player, run = G.run, pat = run.patient, tab = G.jtab;
  const note = (() => { const c = P.counters, top = Object.entries({ dodge: c.dodge / 30, heavy: c.heavy / 15, ability: c.ability / 20, monolog: c.monolog / 3, props: c.props / 12, hurt: c.hurt / 15 }).sort((a, b) => b[1] - a[1])[0]; return top && top[1] > .2 && JOURNAL_NOTES[top[0]] ? JOURNAL_NOTES[top[0]] : 'Fremdeles plagsom, men viser antydning til bedring.'; })();
  const left = `<div class="page l">
    <div class="jhead"><canvas id="jEmb" width="128" height="128"></canvas><div><h2>MORBIDIUM</h2><div class="s">SANATORIUM FOR OPPSTYRRET SINN</div></div><div class="jnr">JOURNAL NR.<b>${pat.nr}</b></div></div>
    <div class="jrow"><div class="mug"><canvas id="jMug" width="300" height="380"></canvas></div><div class="fields"><h3>PASIENTJOURNAL</h3>
      <div class="fld">NAVN: <span>${esc(pat.name)}</span></div><div class="fld">ALDER: <span>${pat.age} år</span></div><div class="fld">AVDELING: <span>${esc(G.th.name.split(': ')[1] || G.th.name)}</span></div>
      ${STAT_KEYS.map(k => `<div class="stat"><svg viewBox="0 0 24 24">${STAT_ICON[k]}</svg><span class="nm" title="${esc(STAT_INFO[k].desc)}">${STAT_INFO[k].name.toUpperCase()}</span><span class="dots5">${[0, 1, 2, 3, 4].map(i => `<i class="${i < P.stats[k] ? 'on' : ''}"></i>`).join('')}</span>${P.points > 0 && P.stats[k] < 5 ? `<button class="plus" data-stat="${k}" aria-label="Øk ${STAT_INFO[k].name}">+</button>` : ''}</div>`).join('')}
      ${P.points > 0 ? `<div class="hint">${P.points} poeng å fordele</div>` : `<div class="hint">Nivå ${P.level}. ${P.teeth} gulltenner.</div>`}
    </div></div>
    <div class="item"><canvas id="jWp" width="240" height="96"></canvas><div><b>${esc(WEAPONS[P.weapon].name.toUpperCase())}${P.weaponLvl ? ' +' + P.weaponLvl : ''}</b><i>«${esc(WEAPONS[P.weapon].desc)}»</i></div></div>
    <h3 style="margin:12px 0 0;font-family:var(--display);font-weight:normal;font-size:16px">DIAGNOSER:</h3>
    <div class="diags">${P.diag.length ? P.diag.map(d => `<span class="dlabel" title="${esc(DIAGNOSES[d].good + ' ' + DIAGNOSES[d].bad)}">${esc(DIAGNOSES[d].name.toUpperCase())}</span>`).join('') : '<span class="dlabel">UNDER OBSERVASJON</span>'}</div>
    <div class="note">Leges merknad: ${esc(note)}<br>Dr. H.</div>
    <div class="fstamp">${P.hp < P.maxHp * .3 ? 'IKKE FRISK' : 'FRISK NOK'}</div><div class="motto">BEDRE MENNESKER GJENNOM RUTINE</div></div>`;
  const tabs = `<div class="tabs"><button class="tab ${tab === 'utstyr' ? 'on' : ''}" data-tab="utstyr" style="background:#e8d8b0">UTSTYR</button><button class="tab ${tab === 'ferdigheter' ? 'on' : ''}" data-tab="ferdigheter" style="background:#b88ae0">FERDIGHETER</button><button class="tab ${tab === 'diagnoser' ? 'on' : ''}" data-tab="diagnoser" style="background:#9cc7a4">DIAGNOSER</button><button class="tab ${tab === 'kuriositeter' ? 'on' : ''}" data-tab="kuriositeter" style="background:#e8a0a0">KURIOSITETER</button></div>`;
  let right = '';
  if (tab === 'ferdigheter') {
    right = `<div class="jtitle">PSYKISK KARTLEGGING</div><div class="jsub">FIRE OMRÅDER. ÉN PASIENT. UENDELIGE MULIGHETER.</div><div class="quote">«Sunne hoder gjør en renere verden.»<br>M.</div>
      <div class="map"><canvas id="jHead" width="1000" height="1000"></canvas>${[0, 1, 2, 3].map(i => `<div class="slot ${run.slots[i] ? '' : 'empty'}" data-slot="${i}" style="left:${HEADMAP.cx[i] * 100}%;top:${HEADMAP.cy[i] * 100}%">${jCardHtml(run.slots[i], 's', i)}</div>`).join('')}</div>
      <div class="hint">Klikk et kort og så en plass, eller dra det. Kort i sitt eget område får gullprikk og kortere nedkjøling.</div>
      <div class="pocket" data-pocket="1">${run.reserve.map((c, i) => `<span class="pc">${jCardHtml(c, 'r', i)}</span>`).join('')}<span class="pc"><div class="jcard" style="cursor:default;opacity:.7"><span data-jart="ukjent"></span><div class="nm">?</div></div></span><div class="lbl">RESERVERT FOR FRAMTIDIGE FREMSKRITT</div></div>`;
  } else if (tab === 'kuriositeter') {
    const r = G.run, tf = Object.keys(TRANSFORMS).map(t => { const n = (r.items || []).filter(id => (ITEMS[id].tags || []).includes(t)).length; return `<div class="drow ${(r.transforms || []).includes(t) ? '' : 'unk'}"><b>${esc(TRANSFORMS[t].name)}</b> (${Math.min(3, n)} av 3)<br>${esc(TRANSFORMS[t].desc)}</div>`; }).join('');
    const pills = Object.keys(PILL_COL).filter(id => r.pillKnown && r.pillKnown[id]).map(id => `<span class="dlabel">${esc(PILL_COL[id][0])}: ${esc(PILLS[r.pillKnown[id]][0])}</span>`).join('');
    right = `<div class="jtitle">KURIOSITETER</div><div class="jsub">PASIENTENS EFFEKTER, BESLAGLAGT OG UTLEVERT</div>
      <div class="kurlist">${(r.items || []).map(id => `<div class="kur"><span data-kart="${id}"></span><div><b>${esc(ITEMS[id].name)}</b><br>${esc(ITEMS[id].desc)}</div></div>`).join('') || '<p class="hint">Ingen ennå. De står i preparatglass i skatterommene, etter sjefene og hos vaktmesteren.</p>'}</div>
      ${r.synergies && r.synergies.length ? `<div class="diags" style="margin-top:8px">${r.synergies.map(s => `<span class="dlabel">SYNERGI: ${esc(s.toUpperCase())}</span>`).join('')}</div>` : ''}
      <h3 style="margin:12px 0 4px;font-family:var(--display);font-weight:normal;font-size:16px">FORVANDLINGER</h3><div class="dlist">${tf}</div>
      ${pills ? `<h3 style="margin:12px 0 4px;font-family:var(--display);font-weight:normal;font-size:16px">KJENTE PILLER</h3><div class="diags">${pills}</div>` : ''}`;
  } else if (tab === 'utstyr') {
    right = `<div class="jtitle">UTSTYR</div><div class="jsub">DET SOM IKKE ER BESLAGLAGT</div><div class="wgrid">${Object.keys(WEAPONS).map(w => `<div class="wcell ${w === P.weapon ? 'on' : 'lock'}"><span data-wart="${w}"></span><div>${w === P.weapon ? esc(WEAPONS[w].name) : '???'}</div></div>`).join('')}</div>
      <p class="hint">Andre våpen kan kjøpes hos vaktmesteren eller finnes på gulvet.</p>
      <div class="item"><span data-cart="1"></span><div><b>LOMMA</b><i>${P.cons ? esc(CONSUMABLES[P.cons.id].name) + ' x' + P.cons.n + ': ' + esc(CONSUMABLES[P.cons.id].desc) : 'Tom. Flasker plukkes opp fra gulvet.'}</i></div></div>`;
  } else {
    right = `<div class="jtitle">DIAGNOSER</div><div class="jsub">ALLTID EN FORDEL, ALLTID ET PROBLEM</div><div class="dlist">${Object.entries(DIAGNOSES).map(([k, d]) => P.diag.includes(k) ? `<div class="drow"><b>${esc(d.name)}</b><br>Fordel: ${esc(d.good)}<br>Problem: ${esc(d.bad)}</div>` : `<div class="drow unk"><b>Ikke stilt</b><br>${esc(d.note || 'Oppstår av hvordan du oppfører deg.')}</div>`).join('')}</div>`;
  }
  $('journal').innerHTML = `<div class="book">${left}<div class="page r">${tabs}${right}<div class="hint" style="margin-top:8px">ET ROLIGERE SINN FOR EN RENERE VERDEN</div></div></div><div class="btnrow"><button class="btn big" id="jClose">Lukk journalen (Tab)</button></div>`;
  // tegninger
  const emb = $('jEmb').getContext('2d'); emb.translate(64, 64); emb.lineWidth = 5; emb.strokeStyle = INK; emb.fillStyle = '#c8b890';
  emb.beginPath(); for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, r = i % 2 ? 54 : 60; emb.lineTo(Math.cos(a) * r, Math.sin(a) * r); } emb.closePath(); emb.fill(); emb.stroke();
  emb.fillStyle = '#efe4c4'; emb.beginPath(); emb.arc(0, 0, 44, 0, TAU); emb.fill(); emb.stroke();
  emb.fillStyle = '#e8dcc8'; emb.beginPath(); emb.ellipse(0, 2, 22, 30, 0, 0, TAU); emb.fill(); emb.stroke(); emb.fillStyle = INK; emb.beginPath(); emb.ellipse(-9, -4, 6, 4, .3, 0, TAU); emb.ellipse(9, -4, 6, 4, -.3, 0, TAU); emb.fill(); emb.fillRect(-2, 6, 4, 18);
  const mg = $('jMug').getContext('2d'); mg.font = 'bold 20px Georgia, serif'; mg.fillStyle = 'rgba(42,26,20,.75)'; for (let i = 0; i < 7; i++) { mg.fillText(String(170 - i * 10), 238, 36 + i * 52); mg.fillRect(222, 30 + i * 52, 12, 3); }
  drawDollPortrait(mg, 'pasient', 130, 362, 190);
  const wp = weaponPart(P.weapon), wg = $('jWp').getContext('2d'), wk = Math.min(226 / wp.canvas.height, 92 / wp.canvas.width); wg.save(); wg.translate(120, 48); wg.rotate(-Math.PI / 2 - .12); wg.drawImage(wp.canvas, -wp.canvas.width * wk / 2, -wp.canvas.height * wk / 2, wp.canvas.width * wk, wp.canvas.height * wk); wg.restore();
  document.querySelectorAll('[data-jart]').forEach(el => el.replaceWith(cardArtCanvas(el.dataset.jart, 120)));
  document.querySelectorAll('[data-kart]').forEach(el => el.replaceWith(partCanvas(itemIcon(el.dataset.kart), 56, 56, 1)));
  document.querySelectorAll('[data-wart]').forEach(el => el.replaceWith(partCanvas(weaponPart(el.dataset.wart), 60, 80)));
  const ca = document.querySelector('[data-cart]'); if (ca) ca.replaceWith(P.cons ? partCanvas(bottlePart(P.cons.id), 60, 60) : cardArtCanvas('ukjent', 60));
  if ($('jHead')) { const draw = () => $('jHead') && drawHeadMap($('jHead')); draw(); document.fonts && Promise.all([document.fonts.load('600 25px Caveat'), document.fonts.load('26px "Alfa Slab One"')]).then(draw).catch(() => { }); }
  // hendelser
  $('jClose').onclick = closeJournal;
  document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { G.jtab = b.dataset.tab; Sound.play('paper', .6); renderJournal(); });
  document.querySelectorAll('[data-stat]').forEach(b => b.onclick = () => { const k = b.dataset.stat; if (P.points > 0 && P.stats[k] < 5) { P.stats[k]++; P.points--; recalcPlayer(); Sound.play('stamp'); renderJournal(); } });
  bindCards();
}
function jGet(r) { return r.t === 's' ? G.run.slots[r.i] : G.run.reserve[r.i]; }
function jMove(a, b) {
  const run = G.run, P = G.player;
  if (!a || !b || (a.t === b.t && a.i === b.i)) return;
  const ca = jGet(a); if (!ca) return;
  if (b.t === 'p') { if (a.t === 's') { run.reserve.push(ca); run.slots[a.i] = null; } }
  else if (b.t === 's') { const cb = run.slots[b.i]; run.slots[b.i] = ca; if (a.t === 's') run.slots[a.i] = cb; else if (cb) run.reserve[a.i] = cb; else run.reserve.splice(a.i, 1); P.cds[b.i] = Math.max(P.cds[b.i], 1.5); if (a.t === 's') P.cds[a.i] = Math.max(P.cds[a.i], 1.5); }
  else if (b.t === 'r') { const cb = run.reserve[b.i]; if (a.t === 's') { run.reserve[b.i] = ca; run.slots[a.i] = cb; P.cds[a.i] = Math.max(P.cds[a.i], 1.5); } }
  Sound.play('paper'); G.jsel = null; hudCardsKey = ''; renderJournal();
}
function refOf(el) {
  const c = el.closest('.jcard[data-ref]'); if (c) return { t: c.dataset.ref, i: +c.dataset.i };
  const s = el.closest('[data-slot]'); if (s) return { t: 's', i: +s.dataset.slot };
  if (el.closest('[data-pocket]')) return { t: 'p', i: 0 };
  return null;
}
function bindCards() {
  const book = document.querySelector('.book'); if (!book) return;
  document.querySelectorAll('.jcard[data-ref]').forEach(el => {
    el.onpointerdown = ev => {
      ev.preventDefault(); const from = refOf(el), sx = ev.clientX, sy = ev.clientY; let ghost = null, hot = null;
      const move = e => {
        if (!ghost && Math.hypot(e.clientX - sx, e.clientY - sy) > 6) { const r = el.getBoundingClientRect(); ghost = el.cloneNode(true); Object.assign(ghost.style, { position: 'fixed', width: r.width + 'px', height: r.height + 'px', left: 0, top: 0, pointerEvents: 'none', zIndex: 99, transform: 'rotate(-4deg)', opacity: .92 }); ghost.querySelectorAll('canvas').forEach((cv, k) => { const src = el.querySelectorAll('canvas')[k]; cv.getContext('2d').drawImage(src, 0, 0); }); document.body.appendChild(ghost); el.style.opacity = .35; }
        if (ghost) { ghost.style.left = e.clientX - ghost.offsetWidth / 2 + 'px'; ghost.style.top = e.clientY - ghost.offsetHeight / 2 + 'px'; const t = document.elementFromPoint(e.clientX, e.clientY), s = t && t.closest('[data-slot],[data-pocket]'); if (hot !== s) { hot && hot.classList.remove('hot'); hot = s; hot && hot.classList.add('hot'); } }
      };
      const up = e => {
        removeEventListener('pointermove', move); removeEventListener('pointerup', up);
        if (ghost) { ghost.remove(); el.style.opacity = ''; hot && hot.classList.remove('hot'); const t = document.elementFromPoint(e.clientX, e.clientY); jMove(from, t && refOf(t)); return; }
        if (G.jsel) jMove(G.jsel, from); else { G.jsel = from; el.classList.add('sel'); Sound.play('ui', .5); }
      };
      addEventListener('pointermove', move); addEventListener('pointerup', up);
    };
    el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const from = refOf(el); if (G.jsel) jMove(G.jsel, from); else { G.jsel = from; el.classList.add('sel'); } } };
  });
  document.querySelectorAll('.slot.empty,[data-pocket]').forEach(el => el.onclick = e => { if (G.jsel && !e.target.closest('.jcard[data-ref]')) jMove(G.jsel, refOf(el)); });
}

/* ---------- HUD ---------- */
const HEART = f => `<svg viewBox="0 0 24 22"><path d="M12 20.5C5 15 1.5 11.3 1.5 7.1 1.5 4 3.9 1.6 6.9 1.6c2 0 3.8 1 5.1 2.8 1.3-1.8 3.1-2.8 5.1-2.8 3 0 5.4 2.4 5.4 5.5 0 4.2-3.5 7.9-10.5 13.4z" fill="${f}" stroke="#2a1a14" stroke-width="2.4" stroke-linejoin="round"/>${f !== '#4a3a36' ? '<path d="M5 6.5c.4-1.6 1.6-2.4 3-2.4" stroke="#ffd0c8" stroke-width="1.8" fill="none" stroke-linecap="round"/>' : ''}</svg>`;
let hudKey = '', hudCardsKey = '', hudConsKey = '';
function drawWeaponCard() {
  const P = G.player; if (!P) return; const W0 = WEAPONS[P.weapon], wc = $('wpc').getContext('2d'), wp = weaponPart(P.weapon);
  wc.setTransform(1, 0, 0, 1, 0, 0); wc.clearRect(0, 0, 88, 132); wc.translate(40, 126); wc.rotate(.3); const k = Math.min(.55, 120 / wp.canvas.height);
  wc.drawImage(wp.canvas, -wp.ax * PX * k, -(wp.h - wp.ay) * PX * k, wp.canvas.width * k, wp.canvas.height * k);
  $('wname').textContent = W0.name + (P.weaponLvl ? ' +' + P.weaponLvl : ''); $('wdesc').textContent = W0.desc.split('.')[0] + '.';
}
function hudUpdate() {
  const P = G.player; if (!P) return;
  const nh = Math.ceil(P.maxHp / 10), h = [];
  for (let i = 0; i < nh; i++) { const v = clamp((P.hp - i * 10) / 10, 0, 1); h.push(HEART(v >= 1 ? '#d8322a' : v > 0 ? '#e88a6a' : '#4a3a36')); }
  const need = 40 + (P.level - 1) * 55;
  const key = h.join('') + P.teeth + Math.round(P.morb) + P.level + Math.round(P.xp) + P.dodge + P.dodgeMax + G.run.patient.name;
  if (key !== hudKey) {
    hudKey = key; $('hearts').innerHTML = h.join(''); $('teeth').textContent = P.teeth; $('morb').style.width = P.morb + '%';
    $('lvl').textContent = 'Nv ' + P.level; $('xp').style.width = clamp(P.xp / need, 0, 1) * 100 + '%';
    $('pips').innerHTML = Array.from({ length: P.dodgeMax }, (_, i) => `<i class="${i < P.dodge ? '' : 'off'}"></i>`).join('');
    $('pname').textContent = G.run.patient.name; $('pnr').textContent = 'nr. ' + G.run.patient.nr;
  }
  const ik = (G.run.items || []).join();
  if (ik !== Items.itemsKey) { Items.itemsKey = ik; const box = $('items'); box.innerHTML = ''; for (const id of G.run.items || []) { const c = partCanvas(itemIcon(id), 44, 44, 1); c.title = ITEMS[id].name + ': ' + ITEMS[id].desc; box.appendChild(c); } }
  const ck = G.run.slots.map((c, i) => c ? c.id + c.lvl + (c.up || '') : '-').join();
  if (ck !== hudCardsKey) {
    hudCardsKey = ck;
    $('cards').innerHTML = G.run.slots.map((c, i) => { if (!c) return `<div class="acard empty" id="ac${i}"><div class="nm">${REGIONS[i].name}</div><div class="k">${i + 1}</div><div class="cd hidden"></div></div>`; const m = AFFINITY[c.id] === REGIONS[i].id; return `<div class="acard ${m ? 'match' : ''}" id="ac${i}" title="${esc(ABILITIES[c.id].desc)}"><div class="dots">${[0, 1, 2, 3].map(k => `<i class="${k < c.lvl + (m ? 1 : 0) ? '' : 'off'}"></i>`).join('')}</div><span data-hart="${c.id}"></span><div class="nm">${esc(ABILITIES[c.id].name)}</div><div class="k">${i + 1}</div><div class="cd hidden"></div></div>`; }).join('');
    document.querySelectorAll('[data-hart]').forEach(el => el.replaceWith(cardArtCanvas(el.dataset.hart, 96)));
  }
  for (let i = 0; i < 4; i++) { const el = $('ac' + i); if (!el) continue; const cd = el.querySelector('.cd'), c = P.cds[i]; cd.classList.toggle('hidden', !(c > 0)); if (c > 0) cd.textContent = Math.ceil(c); }
  const cons = P.cons ? P.cons.id + P.cons.n : '-';
  if (cons !== hudConsKey) { hudConsKey = cons; const g = $('consc').getContext('2d'); g.clearRect(0, 0, 80, 104); if (P.cons) { const bp = bottlePart(P.cons.id); g.drawImage(bp.canvas, 0, 0, bp.canvas.width, bp.canvas.height, 8, 4, 64, 64 * bp.canvas.height / bp.canvas.width); } $('consn').textContent = P.cons ? CONSUMABLES[P.cons.id].name + (P.cons.n > 1 ? ' x' + P.cons.n : '') : 'Tom lomme'; }
  $('roomsign').style.visibility = G.boss && G.boss.alive ? 'hidden' : '';
  if (G.boss && G.boss.alive) $('bossFill').style.width = clamp(G.boss.hp / G.boss.max, 0, 1) * 100 + '%';
}
function drawMap() {
  const c = $('map'), g = c.getContext('2d'), F = G.F, P = G.player, s = 5.2; if (!F || !P) return;
  g.fillStyle = '#1c1410'; g.fillRect(0, 0, 200, 200); g.save(); g.translate(100 - P.x * s, 100 - P.z * s);
  const cols = { service: '#e8c890', boss: '#d88a7a', treasure: '#f0d870', risk: '#c8a0d8' };
  for (let z = 0; z < F.H; z++) for (let x = 0; x < F.W; x++) { const i = z * F.W + x; if (!F.tiles[i] || !G.seen[i]) continue; const rid = F.roomId[i]; g.fillStyle = F.tiles[i] === T_COR ? '#8a7650' : (rid >= 0 && cols[F.rooms[rid].role]) || '#d8c08a'; g.fillRect(x * s, z * s, s + .6, s + .6); }
  g.font = 'bold 11px Georgia, serif'; g.textAlign = 'center';
  for (const r of F.rooms) { const i = Math.floor(r.z + r.h / 2) * F.W + Math.floor(r.x + r.w / 2); if (!G.seen[i]) continue; const lab = r.role === 'boss' ? 'X' : r.role === 'service' ? SERVICES[r.service].name.replace(/^(Den|Det) /, '')[0] : r.role === 'treasure' ? '*' : ''; if (lab) { g.fillStyle = '#2a1a14'; g.fillText(lab, (r.x + r.w / 2) * s, (r.z + r.h / 2) * s + 4); } }
  for (const e of G.enemies) if (e.alive) { g.fillStyle = '#b3261e'; g.beginPath(); g.arc(e.x * s, e.z * s, 3, 0, TAU); g.fill(); }
  if (G.trapdoor) { g.fillStyle = '#e8b93a'; g.fillRect(G.trapdoor.x * s - 4, G.trapdoor.z * s - 4, 8, 8); }
  g.restore(); g.fillStyle = '#e8b93a'; g.strokeStyle = '#2a1a14'; g.lineWidth = 2;
  g.save(); g.translate(100, 100); g.rotate(-P.face + Math.PI); g.beginPath(); g.moveTo(0, -8); g.lineTo(6, 6); g.lineTo(-6, 6); g.closePath(); g.fill(); g.stroke(); g.restore();
}

/* ---------- død og utskrivning ---------- */
function runStats() { const P = G.player, secs = Math.round((performance.now() - G.run.t0) / 1000); return `<div class="alive">Innlagt i ${Math.floor(secs / 60)} min ${secs % 60} s, nådde etasje ${G.depth}</div><dl><dt>Lagt i seng for godt</dt><dd>${G.run.kills}</dd><dt>Rom ryddet</dt><dd>${G.run.rooms}</dd><dt>Gulltenner i lomma</dt><dd>${P.teeth}</dd>`; }
function showDeath() {
  const P = G.player; if (G.state === 'dead') return;
  const cause = pick(DEATH_CAUSES[P.lastCause] || DEATH_CAUSES.any), m = G.meta;
  m.deaths++; m.lastDeath = { depth: G.depth, name: G.run.patient.name, teeth: P.teeth, cause, looted: false }; saveMeta(); clearRun();
  G.state = 'dead'; show('hud', false); Sound.stopAmbience();
  $('panel').innerHTML = `<div class="hdr" style="font-size:clamp(44px,9vw,76px)">DU ER DØD.</div><div class="dcard"><div class="slab"><canvas id="deadc" width="300" height="118"></canvas><div class="plate">${esc(G.run.patient.name)}</div></div>${runStats()}<dt>Dødsårsak</dt><dd class="cause">${esc(cause)}</dd></dl><div class="stamp">AVDØD</div></div>
    <div class="btnrow"><button class="btn big" id="dNew">Ny pasient</button><button class="btn" id="dTitle">Til tittel</button></div>`;
  show('panel', true);
  const g = $('deadc').getContext('2d'); g.save(); g.translate(150, 58); g.rotate(-Math.PI / 2 + .06); drawDollPortrait(g, 'pasient', 0, 110, 92); g.restore();
  $('dNew').onclick = () => { show('panel', false); resetRun(); showIntake(); }; $('dTitle').onclick = () => { show('panel', false); resetRun(); showTitle(); };
  $('dNew').focus();
}
function resetRun() { Items.clearLook(); if (G.player) { G.player.doll.dispose(); R.remove(G.player.lantern); G.player = null; } }
function showWin() {
  const P = G.player; G.meta.wins++; saveMeta(); clearRun(); G.state = 'dead'; show('hud', false); Sound.play('level'); Sound.stopAmbience();
  $('panel').innerHTML = `<div class="hdr">UTSKREVET</div><div class="dcard"><div class="slab" style="background:linear-gradient(#b8c8a8,#8aa07a)"><canvas id="winc" width="300" height="118"></canvas><div class="plate">${esc(G.run.patient.name)}</div></div>${runStats()}<dt>Legens konklusjon</dt><dd class="cause">Pasienten er friskmeldt. Ingen vet helt hva det betyr lenger.</dd></dl><div class="stamp">FRISK NOK</div></div>
    <div class="btnrow"><button class="btn big" id="dNew">Ny pasient</button><button class="btn" id="dTitle">Til tittel</button></div>`;
  show('panel', true); drawDollPortrait($('winc').getContext('2d'), 'pasient', 150, 112, 58);
  $('dNew').onclick = () => { show('panel', false); resetRun(); showIntake(); }; $('dTitle').onclick = () => { show('panel', false); resetRun(); showTitle(); };
}

/* ---------- hovedløkke ---------- */
function updateNPCs(dt) {
  const P = G.player;
  for (const n of G.npcs) { if (!n.doll) continue; n.doll.update(dt, {}); n.talkT -= dt; if (P && n.talkT <= 0 && Math.hypot(n.x - P.x, n.z - P.z) < 6) { n.talkT = rnd(9, 15); FX.bubble(n, pick(NPC_LINES[n.service] || ['...']), 2.6); } }
}
let lastT = performance.now(), mapT = 0;
function loop(now) {
  requestAnimationFrame(loop);
  let dt = Math.min(.05, (now - lastT) / 1000); lastT = now;
  Input.pollGamepad(); const A = Input.actions();
  if (G.state === 'play') {
    const P = G.player;
    if (A.pauseP) openPause(); else if (A.journalP) openJournal();
    let ts = 1; if (G.hitstop > 0) { G.hitstop -= dt; ts = .06; }
    if (G.slow.t > 0) { G.slow.t -= dt; ts = Math.min(ts, G.slow.s); } else G.slow.s = 1;
    const sdt = dt * ts; G.time += sdt; if (R.water) R.water.u.uTime.value += sdt;
    updatePlayer(sdt, A);
    for (const e of G.enemies) updateEnemy(e, sdt); G.enemies = G.enemies.filter(e => !e.gone);
    if (G.boss) { updateBoss(G.boss, sdt); if (G.boss.gone) G.boss = null; }
    Items.update(sdt); updateAllies(sdt); updateProjectiles(sdt); updatePuddles(sdt); updateProps(sdt); updatePickups(sdt); updateTele(sdt); updateFx(sdt); updateVFX(sdt); updateBarriers(sdt); updateNPCs(sdt);
    if (hallucinate) hallucinate(sdt);
    G.flowT = (G.flowT || 0) - sdt; if (G.flowT <= 0 && P.alive) { G.flowT = .25; buildFlow(Math.floor(P.x), Math.floor(P.z)); }
    roomLogic(sdt); interactLogic(A);
    G.paT -= dt; if (G.paT <= 0) { G.paT = rnd(45, 75); paLine(pick(PA[G.depth] || PA[1])); }
    Sound.tick(dt, G.depth >= 2 || P.morb >= 50 || !!(G.boss && G.boss.alive), G.depth);
    R.fx.morb = clamp((P.morb - 25) / 75, 0, 1); R.fx.low = P.alive && P.hp < P.maxHp * .3 ? 1 : 0;
    if (P.lantern) { P.lantern.position.x = P.x; P.lantern.position.z = P.z; }
    let cx = P.x + Math.sin(P.face) * .9, cz = P.z + Math.cos(P.face) * .55;
    if (G.boss && G.boss.alive) { cx = lerp(cx, G.boss.x, .35); cz = lerp(cz, G.boss.z, .35); }
    if (innerHeight > innerWidth * 1.2) cz += 2.4; // stående mobil: pasienten over knappene
    R.updateCamera(cx, cz, dt);
    Particles.update(sdt); FX.update(dt);
    hudUpdate(); mapT -= dt; if (mapT <= 0) { mapT = .12; drawMap(); }
  } else if (G.state === 'title') {
    G.titleT += dt; if (R.water) R.water.u.uTime.value += dt;
    const r = G.F.rooms[G.F.startId]; R.updateCamera(r.x + r.w / 2 + Math.sin(G.titleT * .15) * 3, r.z + r.h / 2 + Math.cos(G.titleT * .11) * 1.5, dt);
    if (G.titleDolls) G.titleDolls.forEach((d, i) => d.update(dt, { raise: i === 0 && Math.sin(G.titleT) > .3, headTilt: i === 0 ? .25 : 0 }));
    Particles.update(dt); FX.update(dt);
  } else if (G.state === 'panel') {
    if (A.pauseP) closePanel();
    FX.update(dt);
  } else if (G.state === 'journal') {
    if (A.pauseP || A.journalP) closeJournal();
  }
  R.render(dt);
  Input.endFrame();
  if (G.okFrames !== null && ++G.okFrames === 90) { if (window.bootStep) bootStep('ok'); const b = $('boot'); if (b) b.remove(); G.okFrames = null; }
}
function boot() {
  const step = window.bootStep || (() => { });
  step('Starter WebGL');
  R.init($('game'));
  try { const gl = R.renderer.getContext(), ext = gl.getExtension('WEBGL_debug_renderer_info'); window.__gl = (R.renderer.capabilities.isWebGL2 ? 'WebGL2' : 'WebGL1') + ', ' + (ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)) + ', maks tekstur ' + gl.getParameter(gl.MAX_TEXTURE_SIZE) + ', dpr ' + (devicePixelRatio || 1); } catch (e) { window.__gl = 'ukjent GPU'; }
  step('Klargjør partikler og kontroller');
  Particles.init(); Input.init($('game'));
  G.meta = loadMeta();
  if (window.__recover) { G.meta.settings.simple = true; R.lowTex = true; R.dpr = 1; R.resize(); }
  try { if (localStorage.getItem('morbidium_simple') === '1') { G.meta.settings.simple = true; localStorage.removeItem('morbidium_simple'); saveMeta(); } } catch (e) { }
  if (/enkel/.test(location.hash)) G.meta.settings.simple = true;
  applySettings();
  R.onSafe = why => { G.meta.settings.simple = true; saveMeta(); toast('Enkel grafikk', 'Skjermkortet ga ' + why + ', så etterbehandlingen er slått av'); };
  $('vignette').style.display = 'none';
  addEventListener('pointerdown', () => { Sound.init(); applySettings(); }, { once: true }); addEventListener('keydown', () => { Sound.init(); applySettings(); }, { once: true });
  $('bJournal').onclick = () => openJournal(); $('bPause').onclick = () => openPause();
  window.MORBIDIUM = G; Object.assign(window, { Items, ITEMS, spawnEnemy, itemIcon, jarPart, pillPart, addonPart, shotPart, LOOKS, PILL_COL, BLOBS, R, hurt, descend, finishCombat, openService, killEntity, Art, RIG, PROPS, CARD_ART, WEAPONS, THEMES, charPart, propArt, weaponPart, shoePart, cardArtCanvas, generateFloor, CONSUMABLES, heartPart, morbPart, bottlePart, cardPart, pigeonPart, stampDecal, handPart, toothPart, starPart, puffPart, barrierArt });
  // til testene
  Object.assign(window, { freeSpot, solid, los, losWide, addPuddle, gainXp, showTitle, openJournal, closeJournal, giveCard, owned, continueRun, saveRun, savedRun, startFloor, spawnBoss, dropPickup, openChest, lockRoom, playerDie, healPlayer, recalcPlayer, useAbility, openPanel, closePanel });
  step('Pakker ut bilder');
  Art.preload().then(() => { step('Bygger tittelrommet'); setTimeout(() => { showTitle(); step('Tegner første bilde'); G.okFrames = 0; requestAnimationFrame(loop); }, 40); });
}
try { boot(); } catch (e) { if (window.showErr) showErr((e && e.message) || String(e)); throw e; }
