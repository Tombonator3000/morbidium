/* ============================================================
   FIGURER  -  spiller, fiender, bosser, allierte og evner
   ============================================================ */
const STAT_KEYS = ['helse', 'styrke', 'smidighet', 'forstand', 'fatteevne'];
const STAT_INFO = {
  helse: { name: 'Helse', desc: 'Ti ekstra helse per prikk, og litt tykkere hud.' },
  styrke: { name: 'Styrke', desc: 'Mer skade med våpen.' },
  smidighet: { name: 'Smidighet', desc: 'Fart og raskere rulling.' },
  forstand: { name: 'Forstand', desc: 'Kortere nedkjøling og sterkere evner.' },
  fatteevne: { name: 'Fatteevne', desc: 'Flere kritiske treff, lavere priser, mer lærdom.' }
};
function hasDiag(id) { return G.player && G.player.diag.includes(id); }
function playerDmgMult() {
  const P = G.player; let m = 1 + (P.stats.styrke - 1) * .1 + P.weaponLvl * .25;
  if (P.kamferT > 0) m *= 1.5;
  if (hasDiag('hovedperson') && P.hp < P.maxHp / 2) m *= 1.25;
  m *= 1 + Math.min(.3, P.morb * .003);
  m *= Items.stat('dmg');
  return m;
}
function slotEff(i) {
  const P = G.player, c = P.slots[i]; if (!c) return null;
  const match = AFFINITY[c.id] === REGIONS[i].id;
  return { id: c.id, up: c.up, lvl: c.lvl + (match ? 1 : 0), match, pow: (1 + (P.stats.forstand - 1) * .12) * (1 + (c.lvl + (match ? 1 : 0) - 1) * .15) };
}
function abilityPower() { return 1 + (G.player.stats.forstand - 1) * .12; }
function addMorb(v) {
  const P = G.player; if (!P) return;
  P.morb = clamp(P.morb + v * (hasDiag('hovedperson') ? 1.3 : 1) * (1 - (P.stats.fatteevne - 1) * .05), 0, 100);
}
function healPlayer(v, silent) {
  const P = G.player; const h = Math.min(P.maxHp - P.hp, v * (hasDiag('hypokonder') ? 1.4 : 1)); if (h <= 0) return;
  P.hp += h; if (!silent) { numText(P.x, P.z, '+' + Math.round(h), 'info', 2.2); Sound.play('heal'); Particles.spawn(P.x, 1.2, P.z, 8, 0x9cc7a4, { speed: 2, up: 4, g: 2 }); }
}

/* ---------- effekter: støvsky, stjerne, hugg ---------- */
const VFX = { puffs: [], stars: [], slashes: [] };
function sprite(P, x, z, o = {}) { const g = propSprite(null, x, z, Object.assign({ P, shadow: false, depthWrite: false }, o)); R.dyn.add(g); return g; }
function puff(x, z, n = 3, s = 1, col) {
  for (let i = 0; i < n; i++) { const g = sprite(puffPart(i % 3), x + rnd(-.35, .35) * s, z + rnd(-.2, .25) * s); if (col) g.userData.U.uTint.value.set(col); VFX.puffs.push({ g, t: 0, life: rnd(.45, .7), s: rnd(.5, .8) * s, vx: rnd(-1, 1), vy: rnd(.3, 1.2) }); }
}
function starBurst(x, y, z, s = 1) { const g = sprite(starPart(), x, z, { y }); g.scale.setScalar(.2); VFX.stars.push({ g, t: 0, s }); }
function slashFx(x, z, a, r, arc, heavy, col = 0xfffbea) {
  const st = -Math.PI / 2 - arc / 2;
  const m = new THREE.Mesh(new THREE.RingGeometry(r * .68, r, 28, 1, st, arc), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .85, depthWrite: false, side: THREE.DoubleSide }));
  m.rotation.x = -Math.PI / 2; const g = new THREE.Group(); g.add(m); g.position.set(x, .06, z); g.rotation.y = a; g.renderOrder = 4; R.dyn.add(g);
  VFX.slashes.push({ g, m, t: 0, life: heavy ? .26 : .18 });
}
function flashLight(x, z, r, col, t = .25, k = 1.2) { const l = R.light(x, z, r, col, k); addFx(l, t, (o, p) => R.setLight(o, k * (1 - p))); }
function updateVFX(dt) {
  for (let i = VFX.puffs.length - 1; i >= 0; i--) { const p = VFX.puffs[i]; p.t += dt; const k = p.t / p.life; p.g.scale.setScalar(p.s * (.6 + k * .7)); p.g.position.x += p.vx * dt; p.g.position.y += p.vy * dt * .5; p.g.userData.U.uAlpha.value = 1 - k * k; if (k >= 1) { R.remove(p.g); VFX.puffs.splice(i, 1); } }
  for (let i = VFX.stars.length - 1; i >= 0; i--) { const s = VFX.stars[i]; s.t += dt; const k = s.t / .14; s.g.scale.setScalar(s.s * (k < .5 ? k * 2 : 2 - k * 2) * .9); if (k >= 1) { R.remove(s.g); VFX.stars.splice(i, 1); } }
  for (let i = VFX.slashes.length - 1; i >= 0; i--) { const s = VFX.slashes[i]; s.t += dt; const k = s.t / s.life; s.m.material.opacity = .85 * (1 - k); s.g.scale.setScalar(1 + k * .15); if (k >= 1) { R.remove(s.g); VFX.slashes.splice(i, 1); } }
}
function clearVFX() { for (const k of ['puffs', 'stars', 'slashes']) { for (const v of VFX[k]) R.remove(v.g); VFX[k] = []; } }

/* ============================================================
   SPILLEREN
   ============================================================ */
function makePlayer(run) {
  const P = {
    kind: 'player', x: 0, z: 0, r: .36, face: Math.PI, vx: 0, vz: 0, kvx: 0, kvz: 0, alive: true, bubbleH: 2.8,
    doll: new Doll('pasient', { weapon: run.weapon }), stats: Object.assign({}, run.stats), weapon: run.weapon, weaponLvl: 0,
    hp: 0, maxHp: 0, cons: null, slots: run.slots, reserve: run.reserve, cds: [0, 0, 0, 0],
    dodge: 2, dodgeMax: 2, dodgeT: 0, roll: 0, rollA: 0, iframe: 0, invuln: 0, atk: null, combo: 0, chain: 0, queued: false, chargeT: -1, charging: false,
    deny: null, denied: [], fastT: 0, kamferT: 0, stunT: 0, coffee: false, diag: run.diag || [], counters: { dodge: 0, heavy: 0, ability: 0, monolog: 0, props: 0, hurt: 0, heal: 0, kills: 0 },
    teeth: run.teeth || 0, morb: run.morb || 0, xp: 0, level: 1, points: 0, lastCause: 'any', hicT: rnd(6, 10), lanternT: 0
  };
  P.maxHp = 30 + P.stats.helse * 10; P.hp = Math.round(P.maxHp * (run.hpFrac || 1));
  R.scene.add(P.doll.root);
  P.lantern = R.light(0, 0, 4.2, '#ffe2b0', .35);
  return P;
}
function recalcPlayer() { const P = G.player, old = P.maxHp; P.maxHp = Math.max(10, 30 + P.stats.helse * 10 + Items.hearts() * 10); if (P.maxHp > old) P.hp += P.maxHp - old; P.hp = Math.min(P.hp, P.maxHp); }
function weaponStats() { return WEAPONS[G.player.weapon] || WEAPONS.stativ; }
function updatePlayer(dt, A) {
  const P = G.player;
  if (!P.alive) { P.doll.update(dt, { down: true }); return; }
  P.iframe -= dt; P.invuln -= dt; P.fastT -= dt; P.kamferT -= dt; P.stunT -= dt; P.dodgeText = false;
  for (let i = 0; i < 4; i++) P.cds[i] = Math.max(0, P.cds[i] - dt);
  // utsatt skade fra benektelse
  for (let i = P.denied.length - 1; i >= 0; i--) { const d = P.denied[i]; d.t -= dt; if (d.t <= 0) { P.denied.splice(i, 1); P.hp -= d.d; numText(P.x, P.z, Math.round(d.d), 'hurt', 2); FX.bubble(P, 'Å ja, der kom den.', 1.4); Sound.play('hurt', .7); if (P.hp <= 0) { P.lastCause = d.cause || 'self'; playerDie(); return; } } }
  // sikte
  let aim = null;
  if (A.pad && Math.hypot(A.aimStickX, A.aimStickZ) > .3) aim = Math.atan2(A.aimStickX, A.aimStickZ);
  else if (Input.lastDevice === 'kb' && Input.mouse.moved) { const g = R.mouseToGround(Input.mouse.x, Input.mouse.y); aim = Math.atan2(g.x - P.x, g.z - P.z); P.aimX = g.x; P.aimZ = g.z; }
  else if (A.touch) { const t = nearestEnemy(P.x, P.z, 8); aim = t ? Math.atan2(t.x - P.x, t.z - P.z) : null; }
  if (aim === null && (A.mx || A.mz)) aim = Math.atan2(A.mx, A.mz);
  if (Input.lastDevice !== 'kb' || !Input.mouse.moved) { const t = nearestEnemy(P.x, P.z, 7); P.aimX = t ? t.x : P.x + Math.sin(P.face) * 4; P.aimZ = t ? t.z : P.z + Math.cos(P.face) * 4; }
  const busy = P.atk || P.roll > 0;
  if (aim !== null && !busy) P.face = aim;
  const stunned = P.stunT > 0;
  // rulle
  const rech = (1.6 - (P.stats.smidighet - 1) * .1) * (hasDiag('rulling') ? .7 : 1);
  if (P.dodge < P.dodgeMax) { P.dodgeT += dt; if (P.dodgeT >= rech) { P.dodge++; P.dodgeT = 0; } }
  if (!stunned && A.dodgeP && P.dodge > 0 && P.roll <= 0) {
    P.dodge--; P.dodgeT = 0; P.roll = .34; P.iframe = .3; P.atk = null; P.chargeT = -1; P.charging = false; P.counters.dodge++; Items.onDodge();
    P.rollA = (A.mx || A.mz) ? Math.atan2(A.mx, A.mz) : P.face; P.face = P.rollA; Sound.play('dodge'); puff(P.x, P.z, 2, .7);
    if (hasDiag('rulling') && P.teeth > 0 && Math.random() < .08) { P.teeth--; dropPickup(P.x, P.z, 'tooth'); numText(P.x, P.z, 'En tann falt ut', 'info', 2.3); }
  }
  // angrep
  if (!stunned && P.roll <= 0) {
    if (A.heavyP && !P.atk) { P.chargeT = 0; P.charging = true; }
    if (P.charging) { P.chargeT += dt; if (!A.heavyD || P.chargeT > 1.1) { startSwing(true, Math.min(1, P.chargeT / .6)); P.chargeT = -1; P.charging = false; } }
    else if (A.attackP) { if (!P.atk) startSwing(false); else P.queued = true; }
    for (let i = 0; i < 4; i++) if (A.abP[i]) useAbility(i);
    if (A.useP) useConsumable();
  }
  if (P.atk) {
    const k = P.atk; k.t += dt; k.p = k.t / k.dur;
    if (!k.hit && k.p >= .45) { k.hit = true; meleeHit(k); }
    if (k.p >= 1) { P.atk = null; if (P.queued) { P.queued = false; startSwing(false); } else P.chain = .3; }
  } else if (P.chain > 0) { P.chain -= dt; if (P.chain <= 0) P.combo = 0; }
  // bevegelse
  let spd = (5 + P.stats.smidighet * .15) * (P.gasT > 0 ? .6 : 1) * (hasDiag('ruging') ? .9 : 1) * (P.fastT > 0 ? 1.4 : 1) * (P.coffee ? 1.1 : 1) * Items.stat('speed'), mx = stunned ? 0 : A.mx, mz = stunned ? 0 : A.mz;
  if (P.roll > 0) { P.roll -= dt; mx = Math.sin(P.rollA); mz = Math.cos(P.rollA); spd = 11 + P.stats.smidighet * .3; if (Math.random() < dt * 20) puff(P.x, P.z, 1, .45); }
  else if (P.atk) spd *= .3; else if (P.charging) spd *= .4;
  P.vx = lerp(P.vx, mx * spd, 1 - Math.exp(-dt * 16)); P.vz = lerp(P.vz, mz * spd, 1 - Math.exp(-dt * 16));
  moveEnt(P, (P.vx + P.kvx) * dt, (P.vz + P.kvz) * dt); P.kvx *= Math.pow(.02, dt); P.kvz *= Math.pow(.02, dt);
  const speed = Math.hypot(P.vx, P.vz);
  if (!Items.has('heliumlunge')) groundEffects(P, dt, speed);
  // Morbidium: hikke over 60, lekker helse på 100
  P.morb = Math.max(0, P.morb - dt * .2);
  if (P.morb >= 60) { P.hicT -= dt; if (P.hicT <= 0) { P.hicT = rnd(6, 11); const a = Math.random() * TAU; P.kvx = Math.sin(a) * 6; P.kvz = Math.cos(a) * 6; numText(P.x, P.z, 'hikk', 'info', 2.4); Sound.play('morb', .6, 1.5); } }
  if (P.morb >= 100) { P.hp -= dt; if (P.hp <= 0) { P.lastCause = 'morb'; playerDie(); return; } }
  if (Math.random() < dt * .4 && P.morb > 55) whisper();
  P.doll.setFacing(P.face);
  P.doll.update(dt, { speed, lean: speed > 1 ? .6 : 0, spin: P.roll > 0 ? (1 - P.roll / .34) * TAU : 0, attack: P.charging ? { p: 0, heavy: true, charge: true } : P.atk ? { p: P.atk.p, combo: P.atk.combo, heavy: P.atk.heavy } : null });
  P.doll.root.position.set(P.x, 0, P.z);
  P.lantern.position.set(P.x, 0, P.z + .3);
  R.fx.morb = clamp((P.morb - 30) / 70, 0, 1); R.fx.low = P.hp < P.maxHp * .3 ? 1 - P.hp / (P.maxHp * .3) : 0;
}
function startSwing(heavy, charge = 0) {
  const P = G.player, W0 = weaponStats();
  if (!heavy) P.combo = P.chain > 0 || P.queued ? (P.combo + 1) % 3 : 0; else P.counters.heavy++;
  P.atk = { t: 0, p: 0, dur: (heavy ? W0.time + .14 : P.combo === 2 ? W0.time * 1.25 : W0.time) / Items.stat('rate'), combo: heavy ? 0 : P.combo, heavy, charge, hit: false }; P.chain = 0;
  Sound.play(heavy ? 'swingHeavy' : 'swing', 1, heavy ? .8 : 1 + P.combo * .08);
}
function meleeHit(k) {
  const P = G.player, W0 = weaponStats();
  const range = W0.range * (k.heavy ? 1.25 : 1) * Items.stat('range'), arc = k.heavy && Items.tf('kirurg') ? TAU : k.heavy ? Math.min(3.6, W0.arc * 1.35) : k.combo === 2 ? W0.arc * 1.2 : W0.arc;
  let dmg = W0.dmg * (k.heavy ? 1.4 + .8 * k.charge : k.combo === 2 ? 1.5 : 1);
  if (k.heavy && hasDiag('ruging')) dmg *= 1.35;
  slashFx(P.x, P.z, P.face, range, arc, k.heavy);
  Items.onSwing(k);
  let hits = 0;
  const all = G.boss && G.boss.alive ? G.enemies.concat([G.boss]) : G.enemies;
  for (const e of all) {
    if (!e.alive || e.state === 'spawn') continue;
    const dx = e.x - P.x, dz = e.z - P.z, d = Math.hypot(dx, dz);
    if (d > range + e.r) continue;
    if (d > .8 && Math.abs(angDiff(Math.atan2(dx, dz), P.face)) > arc / 2) continue;
    hurt(e, dmg, { from: 'player', x: P.x, z: P.z, a: Math.atan2(dx, dz), kb: W0.knock * (k.heavy || k.combo === 2 ? 1.6 : 1), stun: W0.id === 'bekken' && Math.random() < .3 ? .8 : .22, bleed: W0.bleed && Math.random() < W0.bleed });
    starBurst(e.x, 1.2, e.z + .1, k.heavy ? 1.4 : 1);
    Items.onHit(e, k, dmg);
    if (W0.wet && Math.random() < W0.wet) addPuddle(e.x, e.z, 'wet', .9, 14);
    hits++;
  }
  hits += hitProps(P.x, P.z, P.face, range, arc, dmg, 12) + Spesial.hitCrack(P.x, P.z, P.face, range, arc, k.heavy ? 3 : 1);
  if (hits) { G.hitstop = k.heavy || k.combo === 2 ? .085 : .045; R.shake(k.heavy ? .45 : .2); Sound.play(W0.sound, 1, 1 + rnd(-.1, .1)); }
}
function useConsumable() {
  const P = G.player; if (!P.cons || P.cons.n <= 0) { Sound.play('deny'); return; }
  const id = P.cons.id; P.cons.n--; if (P.cons.n <= 0) P.cons = null;
  if (id.startsWith('pille_')) { Items.usePill(id); return; }
  if (id === 'levertran') { healPlayer(30); P.counters.heal++; FX.bubble(P, 'Smaker som straff.', 1.4); }
  else if (id === 'luktesalt') { P.stunT = 0; P.fastT = 4; Sound.play('glass'); FX.bubble(P, 'AAH. Våken.', 1.2); }
  else if (id === 'kamfer') { P.kamferT = 5; Sound.play('level'); FX.bubble(P, 'Det brenner i nesen. Bra.', 1.4); }
  else if (id === 'eter') { const tx = P.aimX ?? P.x, tz = P.aimZ ?? P.z; addProj({ type: 'eter', from: 'player', x: P.x, z: P.z, tx, tz, arc: true, dur: .5, h: 2, land: p => { puff(p.tx, p.tz, 6, 1.6, '#cfe8ef'); for (const e of G.enemies) if (e.alive && d2(e.x, e.z, p.tx, p.tz) < 7) { e.sleep = 4; cancelTeles(e); numText(e.x, e.z, 'zzz', 'info', 2.4); } if (G.boss && G.boss.alive && d2(G.boss.x, G.boss.z, p.tx, p.tz) < 9) G.boss.slowT = 3; Sound.play('glass'); } }); }
}
function playerDie() {
  const P = G.player; if (!P.alive) return;
  P.alive = false; P.hp = 0; Sound.play('die', 1, .7); R.shake(.7); puff(P.x, P.z, 5); slowMo(1.2, .25);
  setTimeout(() => showDeath(), 1600);
}
function gainXp(v) {
  const P = G.player; P.xp += v * (1 + (P.stats.fatteevne - 1) * .1);
  const need = () => 40 + (P.level - 1) * 55;
  while (P.xp >= need()) { P.xp -= need(); P.level++; P.points++; Sound.play('level'); toast('Nytt nivå', 'Et poeng å fordele i journalen (Tab)'); numText(P.x, P.z, 'NIVÅ ' + P.level, 'crit', 2.8); }
}
function checkDiagnoses() {
  const P = G.player, c = P.counters; if (P.diag.length >= 3) return;
  const tests = [['rulling', c.dodge >= 45], ['ruging', c.heavy >= 22], ['hovedperson', c.monolog >= 4 || P.morb >= 85], ['nysgjerrighet', c.props >= 18], ['innsikt', c.ability >= 30], ['hypokonder', c.heal >= 4]];
  for (const [id, ok] of tests) if (ok && !P.diag.includes(id) && DIAGNOSES[id]) { P.diag.push(id); stampBig('DIAGNOSE', DIAGNOSES[id].name); Sound.play('stamp'); return; }
}

/* ---------- Morbidium: hvisking og hallusinasjoner (modell fra the-deep-ones) ---------- */
const WHISPERS = ['kom dypere', 'journalen ser deg', 'skriv under her', 'du har vært her før', 'kappen kler deg', 'vi har plass i kjelleren', 'ikke snu deg', 'hvem skrev deg inn?'];
function whisper() {
  if (!R.distortOn) return;
  const el = document.createElement('div'); el.className = 'whisper'; el.textContent = pick(WHISPERS);
  el.style.left = rnd(10, 80) + '%'; el.style.top = rnd(15, 75) + '%'; $('fx').appendChild(el); setTimeout(() => el.remove(), 2600);
}
function hallucinate(dt) {
  const P = G.player; if (!R.distortOn || !P || !P.alive) return;
  const want = P.morb >= 75 || (hasDiag('innsikt') && P.morb >= 40);
  if (want && G.halluc.length < 2 && Math.random() < dt * .3) {
    const a = Math.random() * TAU, d = rnd(5, 7), x = P.x + Math.sin(a) * d, z = P.z + Math.cos(a) * d;
    if (!solid(Math.floor(x), Math.floor(z))) { const doll = new Doll(pick(['kultist', 'pleier']), { tint: '#3a2250', noShadow: true }); doll.root.position.set(x, 0, z); R.scene.add(doll.root); G.halluc.push({ doll, x, z, t: 0 }); }
  }
  for (let i = G.halluc.length - 1; i >= 0; i--) {
    const h = G.halluc[i]; h.t += dt; h.doll.setFacing(Math.atan2(P.x - h.x, P.z - h.z)); h.doll.update(dt, {});
    h.doll.U.uAlpha.value = Math.min(.55, h.t) * (d2(P.x, P.z, h.x, h.z) < 9 ? .3 : 1);
    if (h.t > 3 || d2(P.x, P.z, h.x, h.z) < 4) { h.doll.dispose(); G.halluc.splice(i, 1); }
  }
}

/* ============================================================
   EVNER. Fire plasser = fire hjerneområder. Et kort i sitt eget område
   får et ekstra nivå og 20 prosent kortere nedkjøling.
   ============================================================ */
function useAbility(i) {
  const P = G.player, e = slotEff(i);
  if (!e) { Sound.play('deny'); return; }
  if (P.cds[i] > 0) { Sound.play('deny', .5); return; }
  const def = ABILITIES[e.id]; if (!ABIL[e.id]) return;
  const ok = ABIL[e.id](P, e); if (ok === false) return;
  P.cds[i] = def.cd * (1 - (P.stats.forstand - 1) * .07) * (e.match ? .8 : 1) * (hasDiag('innsikt') ? .8 : 1) * (P.morb >= 75 ? .85 : 1);
  P.counters.ability++; checkDiagnoses();
}
function dirFace(P) { return { fx: Math.sin(P.face), fz: Math.cos(P.face) }; }
function inFront(P, r, arc, cb) { const all = G.boss && G.boss.alive ? G.enemies.concat([G.boss]) : G.enemies; for (const e of all) { if (!e.alive) continue; const dx = e.x - P.x, dz = e.z - P.z, d = Math.hypot(dx, dz); if (d > r + e.r) continue; if (d > .7 && Math.abs(angDiff(Math.atan2(dx, dz), P.face)) > arc / 2) continue; cb(e, d); } }
const ABIL = {
  due(P, e) {
    const n = e.up === 'a' ? 3 : 1;
    for (let k = 0; k < n; k++) spawnAlly('due', P.x + rnd(-.6, .6), P.z + rnd(-.6, .6), { hp: e.up === 'b' ? 60 : e.up === 'a' ? 15 : 30, dmg: (e.up === 'a' ? 4 : 6) * e.pow, taunt: e.up === 'b', life: 10 + e.lvl * 2 });
    Sound.play('coo'); return true;
  },
  lys(P, e) {
    const r = 5.5 * (e.up === 'a' ? 1.25 : 1), arc = 1.1 * (e.up === 'a' ? 1.4 : 1), t = 1.6 * (e.up === 'a' ? 1.5 : 1) + e.lvl * .15;
    const cone = new THREE.Mesh(new THREE.CircleGeometry(r, 24, -Math.PI / 2 - arc / 2, arc), new THREE.MeshBasicMaterial({ color: 0xfff3b0, transparent: true, opacity: .45, depthWrite: false }));
    cone.rotation.x = -Math.PI / 2; const g = new THREE.Group(); g.add(cone); g.position.set(P.x, .05, P.z); g.rotation.y = P.face; R.dyn.add(g); addFx(g, .5, fadeFx);
    flashLight(P.x + Math.sin(P.face) * r * .5, P.z + Math.cos(P.face) * r * .5, r, '#fff2c0', .6, 1.6); Sound.play('zap', .6, 1.6);
    inFront(P, r, arc, en => { if (en.kind === 'boss') { en.slowT = 2; numText(en.x, en.z, 'myser', 'info', 3.4); return; } en.stun = Math.max(en.stun || 0, t); cancelTeles(en); if (e.up === 'b') en.exposed = t + 2; numText(en.x, en.z, 'BLENDET', 'info', 2.4); });
    return true;
  },
  skyggehand(P, e) {
    const { fx, fz } = dirFace(P), sp = 15, range = e.up === 'a' ? 15 : 8;
    addProj({ type: 'hand', from: 'player', x: P.x + fx * .5, z: P.z + fz * .5, vx: fx * sp, vz: fz * sp, life: range / sp, r: .4, glow: ['#b36be0', 1.8], onHit: (p, en) => {
      hurt(en, (e.up === 'b' ? 20 : 10) * e.pow, { from: 'player', x: P.x, z: P.z, stun: .8 });
      if (en.kind !== 'boss') { const tx = P.x + Math.sin(P.face) * 1.2, tz = P.z + Math.cos(P.face) * 1.2, dx = tx - en.x, dz = tz - en.z; en.kvx = dx * 5; en.kvz = dz * 5; }
      if (e.up === 'b') addMorb(-4);
      beam(P.x, P.z, en.x, en.z, 0x7b3aa6, .14, .3); Sound.play('chain');
    } });
    addMorb(2); Sound.play('morb', .8, .7); return true;
  },
  stempel(P, e) {
    const tx0 = P.aimX ?? P.x + Math.sin(P.face) * 3, tz0 = P.aimZ ?? P.z + Math.cos(P.face) * 3;
    const d = Math.min(7, Math.hypot(tx0 - P.x, tz0 - P.z)), a = Math.atan2(tx0 - P.x, tz0 - P.z);
    const spots = e.up === 'a' ? [.55, .8, 1.05].map(k => [P.x + Math.sin(a) * d * k, P.z + Math.cos(a) * d * k, 1.0]) : [[P.x + Math.sin(a) * d, P.z + Math.cos(a) * d, 1.5]];
    spots.forEach(([x, z, r], i) => setTimeout(() => stampDrop(x, z, r * (1 + (e.lvl - 1) * .08), 22 * e.pow * (spots.length > 1 ? .6 : 1), e.up === 'b'), i * 160));
    return true;
  },
  brekning(P, e) {
    Sound.play('vomit'); FX.bubble(P, pick(['Unnskyld.', 'Det var suppen.', 'Taktisk.']), 1.2);
    if (e.up === 'a') { const tx = P.aimX ?? P.x + Math.sin(P.face) * 5, tz = P.aimZ ?? P.z + Math.cos(P.face) * 5; addProj({ type: 'glob', from: 'player', x: P.x, z: P.z, tx, tz, arc: true, dur: .55, h: 2.2, land: p => { addPuddle(p.tx, p.tz, 'vomit', 1.6, 16); for (const en of G.enemies) if (en.alive && d2(en.x, en.z, p.tx, p.tz) < 2.2) hurt(en, 18 * e.pow, { from: 'player', x: p.tx, z: p.tz, kb: 5 }); Sound.play('splash'); } }); return true; }
    if (e.up === 'b') { for (let k = 0; k < 6; k++) addPuddle(P.x + Math.cos(k / 6 * TAU) * 1.7, P.z + Math.sin(k / 6 * TAU) * 1.7, 'vomit', .9, 14); for (const en of G.enemies) if (en.alive && d2(en.x, en.z, P.x, P.z) < 9) { const a = Math.atan2(en.x - P.x, en.z - P.z); en.kvx = Math.sin(a) * 9; en.kvz = Math.cos(a) * 9; } return true; }
    for (let k = 1; k <= 3; k++) { const x = P.x + Math.sin(P.face) * k * 1.1, z = P.z + Math.cos(P.face) * k * 1.1; if (solid(Math.floor(x), Math.floor(z))) break; addPuddle(x, z, 'vomit', .75 + k * .12 + e.lvl * .05, 14); Particles.spawn(x, .4, z, 5, 0x9fae3a, { speed: 2, up: 3 }); }
    return true;
  },
  benektelse(P, e) { P.deny = { up: e.up }; P.denyT = 6; FX.bubble(P, pick(['Det skjedde ikke.', 'Hvilken skade?', 'Jeg har det helt fint.']), 1.6); Sound.play('paper'); return true; },
  skjema(P, e) {
    const { fx, fz } = dirFace(P), w = { x: P.x + fx * 1.6, z: P.z + fz * 1.6, a: P.face, w: 3 + e.lvl * .3, t: 6, alive: true, up: e.up };
    const P2 = Art.part('skjemavegg', 3.2, 1.4, 1.6, .05, g => { for (let i = 0; i < 5; i++) { g.save(); g.translate(-1.2 + i * .6, -.6 + (i % 2) * .08); g.rotate((i % 3 - 1) * .08); A.cel(g, A.rr(-.3, -.5, .6, .9, .02), '#f6ead0', { lw: .035, sk: .9 }); for (let l = 0; l < 5; l++) A.line(g, [[-.22, -.38 + l * .14], [.2, -.38 + l * .14]], .015, '#8a6a4a'); A.flat(g, A.ell(.12, .22, .1, .06), 'rgba(179,38,30,.7)', 0); g.restore(); } });
    w.g = propSprite(null, w.x, w.z, { P: P2, shadow: false }); w.g.rotation.y = 0; w.g.userData.m.scale.x = w.w / 3; R.dyn.add(w.g); G.walls.push(w); Sound.play('paper'); puff(w.x, w.z, 3, 1, '#f6ead0'); return true;
  },
  hydro(P, e) {
    Sound.play('splash'); const { fx, fz } = dirFace(P);
    if (e.up === 'a') { const len = 9; beam(P.x, P.z, P.x + fx * len, P.z + fz * len, 0x9fd8f0, .35, .3, .6); hitShape('rect', { x: P.x, z: P.z, a: P.face, w: .9, len }, 22 * e.pow, { from: 'player', x: P.x, z: P.z, kb: 4 }, 'player'); for (let k = 2; k < len; k += 2.5) addPuddle(P.x + fx * k, P.z + fz * k, 'wet', .8, 14); return true; }
    if (e.up === 'b') { for (let k = 0; k < 5; k++) addPuddle(P.x + rnd(-2.5, 2.5), P.z + rnd(-2.5, 2.5), 'wet', 1.2, 16); for (const en of G.enemies) if (en.alive && d2(en.x, en.z, P.x, P.z) < 12) { const a = Math.atan2(en.x - P.x, en.z - P.z); en.kvx = Math.sin(a) * 5; en.kvz = Math.cos(a) * 5; } return true; }
    inFront(P, 5, .8, en => { hurt(en, 6 * e.pow, { from: 'player', x: P.x, z: P.z, kb: 10 }); });
    for (let k = 1.5; k < 5; k += 1.4) addPuddle(P.x + fx * k, P.z + fz * k, 'wet', .9, 14);
    for (let k = 0; k < 14; k++) Particles.spawn(P.x + fx, .8, P.z + fz, 1, 0x9fd8f0, { speed: 2, up: 2, vx: fx * 9, vz: fz * 9, life: .4 });
    return true;
  },
  monolog(P, e) {
    const r = e.up === 'a' ? 9 : 6, t = (e.up === 'a' ? 2.8 : 1.6) + e.lvl * .15;
    FX.bubble(P, pick(LINES.playerMonolog), 2.8); Sound.mumble(8, 170); addMorb(5); P.counters.monolog++;
    for (const en of G.enemies) if (en.alive && d2(en.x, en.z, P.x, P.z) < r * r) { en.stun = Math.max(en.stun || 0, t); cancelTeles(en); numText(en.x, en.z, 'lytter', 'info', 2.4); }
    const B = G.boss; if (B && B.alive && d2(B.x, B.z, P.x, P.z) < r * r * 1.6) { if (B.phase === 'monolog' && e.up === 'b') bossInterrupt(B); if (e.up === 'b') hurt(B, 15 * e.pow, { from: 'player' }); }
    return true;
  },
  kappe(P, e) {
    const sx = P.x, sz = P.z, { fx, fz } = dirFace(P); P.iframe = .3; P.invuln = .3;
    const hitSet = new Set();
    for (let k = 0; k < 9; k++) { moveEnt(P, fx * .5, fz * .5); for (const en of G.enemies) if (en.alive && !hitSet.has(en) && d2(en.x, en.z, P.x, P.z) < (en.r + .7) ** 2) { hitSet.add(en); hurt(en, 10 * e.pow, { from: 'player', x: P.x, z: P.z, kb: 6 }); } }
    puff(sx, sz, 3, 1, '#4a0f2a'); numText(P.x, P.z, 'dramatisk positur', 'info', 2.5); Sound.play('dodge', 1, .7);
    if (e.up === 'a') spawnAlly('decoy', sx, sz, { hp: 40, life: 5, taunt: true });
    if (e.up === 'b') { G.zones.push({ kind: 'trip', x0: sx, z0: sz, x1: P.x, z1: P.z, t: 6 }); beam(sx, sz, P.x, P.z, 0x6b2d8c, .06, 6, .15); }
    return true;
  },
  nokler(P, e) {
    Sound.play('chain');
    if (e.up === 'a') { slashFx(P.x, P.z, 0, 2.6, TAU - .01, true, 0xd4b048); for (const en of G.enemies) if (en.alive && d2(en.x, en.z, P.x, P.z) < 7.3) hurt(en, 14 * e.pow, { from: 'player', x: P.x, z: P.z, kb: 7 }); return true; }
    if (e.up === 'b') { inFront(P, 7, 1.2, en => { if (en.kind === 'boss') return; const dx = P.x + Math.sin(P.face) - en.x, dz = P.z + Math.cos(P.face) - en.z; en.kvx = dx * 4; en.kvz = dz * 4; en.stun = .6; hurt(en, 6 * e.pow, { from: 'player' }); }); return true; }
    const { fx, fz } = dirFace(P);
    addProj({ type: 'keys', from: 'player', x: P.x, z: P.z, vx: fx * 16, vz: fz * 16, life: .45, spin: 20, onHit: (p, en) => { hurt(en, 8 * e.pow, { from: 'player', stun: .6 }); if (en.kind !== 'boss') { const dx = P.x + fx * 1.1 - en.x, dz = P.z + fz * 1.1 - en.z; en.kvx = dx * 5; en.kvz = dz * 5; } beam(P.x, P.z, en.x, en.z, 0xd4b048, .06, .25); } });
    return true;
  },
  resept(P, e) {
    const t = nearestEnemy(P.x, P.z, 9, en => Math.abs(angDiff(Math.atan2(en.x - P.x, en.z - P.z), P.face)) < 1.1) || nearestEnemy(P.x, P.z, 9);
    if (!t) { numText(P.x, P.z, 'Ingen pasienter', 'info', 2.2); return false; }
    const a = Math.atan2(t.x - P.x, t.z - P.z);
    addProj({ type: 'pill', from: 'player', x: P.x, z: P.z, vx: Math.sin(a) * 13, vz: Math.cos(a) * 13, life: 1, onHit: (p, en) => {
      const outcomes = ['sove', 'forvirret', 'eksplosjon', 'krymp', 'oppblåst', 'frisk'];
      let o = pick(outcomes); if (e.up === 'a' && o === 'frisk') o = pick(outcomes.slice(0, 5));
      const targets = e.up === 'b' ? G.enemies.filter(x => x.alive && d2(x.x, x.z, en.x, en.z) < 6.3) : [en];
      for (const x of targets) applyPill(x, o, e.pow);
    } });
    Sound.play('pickup'); return true;
  }
};
function applyPill(en, o, pow) {
  if (en.kind === 'boss') { hurt(en, 12 * pow, { from: 'player' }); return; }
  const txt = { sove: 'sovner', forvirret: 'forvirret', eksplosjon: 'BUM', krymp: 'krymper', 'oppblåst': 'oppblåst', frisk: 'føler seg bedre' }[o];
  numText(en.x, en.z, txt, o === 'eksplosjon' ? 'crit' : 'info', 2.5);
  if (o === 'sove') { en.sleep = 4; cancelTeles(en); }
  else if (o === 'forvirret') en.confused = 5;
  else if (o === 'eksplosjon') { Spesial.boom(en.x, en.z, 3); puff(en.x, en.z, 5, 1.3, '#f0c080'); flashLight(en.x, en.z, 3, '#ffb060', .3); for (const x of G.enemies) if (x.alive && d2(x.x, x.z, en.x, en.z) < 3.3) hurt(x, 25 * pow, { from: 'player', x: en.x, z: en.z, kb: 8 }); Sound.play('slam'); }
  else if (o === 'krymp') { en.shrink = 8; en.doll.sc *= .6; }
  else if (o === 'oppblåst') { en.bloat = 6; en.doll.sc *= 1.25; }
  else en.hp = Math.min(en.max, en.hp + 20);
}
function stampDrop(x, z, r, dmg, heal) {
  const t = addTele('circle', { x, z, r, color: 0xb3261e }, .28, o => {
    let n = 0; for (const e of (G.boss && G.boss.alive ? G.enemies.concat([G.boss]) : G.enemies)) if (e.alive && d2(e.x, e.z, x, z) < (r + e.r) ** 2) { hurt(e, dmg, { from: 'player', x, z, stun: .8, kb: 3 }); n++; }
    if (heal && n) healPlayer(3 * n); Spesial.boom(x, z, r);
    const dec = propSprite(null, x, z, { P: stampDecal(), flat: true }); R.dyn.add(dec); addFx(dec, 8, (ob, p) => { ob.userData.U.uAlpha.value = p > .8 ? (1 - p) * 5 : 1; });
    FX.text(x, 1.6, z, 'AVSLÅTT', 'stamp', 1); R.shake(.35); Sound.play('stamp'); puff(x, z, 4, 1.2); flashLight(x, z, 2.5, '#ffd0a0', .25);
  });
  const g = sprite(Art.part('stempelfall', 1.2, 1.4, .6, .05, CARD_ART_STAMP), x, z, { y: 3 }); addFx(g, .3, (ob, p) => ob.position.y = 3 * (1 - p * p));
}
const CARD_ART_STAMP = g => { g.translate(0, -.7); g.scale(1.4, 1.4); CARD_ART.stempel(g); };

/* ---------- allierte: duer og lokkedue ---------- */
function spawnAlly(type, x, z, o) {
  const P = type === 'due' ? pigeonPart() : Art.part('lokkedue', 1.2, 1.4, .6, .05, g => { A.line(g, [[0, 0], [0, -1.1]], .05, WOODL); A.line(g, [[-.4, -1.05], [.4, -1.05]], .05, WOODL); A.cel(g, A.poly([[-.4, -1.05], [.4, -1.05], [.5, -.2], [.3, -.3], [.1, -.15], [-.1, -.3], [-.3, -.18], [-.5, -.25]]), '#4a0f2a', { lw: .04 }); });
  const g = propSprite(null, x, z, { P, shadow: true }); R.dyn.add(g);
  const a = Object.assign({ kind: 'ally', type, x, z, r: .3, alive: true, g, max: o.hp, t: 0, peckT: 0, flying: type === 'due', bubbleH: 1.4 }, o); a.hp = o.hp;
  G.allies.push(a); if (type === 'due') FX.bubble(a, pick(LINES.pigeon), 1.8); return a;
}
function updateAllies(dt) {
  for (let i = G.allies.length - 1; i >= 0; i--) {
    const a = G.allies[i]; a.t += dt; a.life -= dt;
    if (!a.alive || a.life <= 0) { if (a.alive) { a.alive = false; puff(a.x, a.z, 2, .6); } R.remove(a.g); G.allies.splice(i, 1); continue; }
    if (a.type === 'due') {
      const t = nearestEnemy(a.x, a.z, 12);
      if (t) { const dx = t.x - a.x, dz = t.z - a.z, d = Math.hypot(dx, dz); if (d > .8) { a.x += dx / d * 6 * dt; a.z += dz / d * 6 * dt; } else { a.peckT -= dt; if (a.peckT <= 0) { a.peckT = .5; hurt(t, a.dmg, { from: 'player' }); Sound.play('coo', .4, 1.3); } } a.g.userData.m.scale.x = dx < 0 ? -1 : 1; }
      a.g.position.set(a.x, .3 + Math.abs(Math.sin(a.t * 12)) * .25, a.z);
      if (Math.random() < dt * .15) FX.bubble(a, pick(LINES.pigeon), 1.6);
    } else a.g.position.set(a.x, 0, a.z);
  }
}
function enemyTarget(e) {
  if (e.confused > 0) { const o = nearestEnemy(e.x, e.z, 10, x => x !== e); if (o) return o; }
  let best = null, bd = 1e9;
  for (const a of G.allies) if (a.alive && a.taunt) { const d = d2(a.x, a.z, e.x, e.z); if (d < bd && d < 144) { bd = d; best = a; } }
  return best || G.player;
}

/* ============================================================
   FIENDER
   ============================================================ */
function spawnEnemy(type, x, z, elite, depth) {
  const D = ENEMIES[type], hpK = 1 + (depth - 1) * .3;
  const doll = new Doll(type, { elite, weapon: type === 'oppasser' ? 'sproyte' : D.weapon || null, shadow: type === 'pleier' ? .55 : D.r > .45 ? .5 : .42, scale: elite ? 1.2 : 1 });
  R.scene.add(doll.root); doll.root.position.set(x, 0, z); doll.root.scale.setScalar(.01);
  const e = { kind: 'enemy', type, x, z, r: D.r * (elite ? 1.15 : 1), face: 0, vx: 0, vz: 0, kvx: 0, kvz: 0, doll, alive: true, elite, hp: D.hp * hpK * (elite ? 2.2 : 1), dmg: D.dmg * (1 + (depth - 1) * .17) * (elite ? 1.3 : 1), sp: D.speed, state: 'spawn', t: .5, cd: rnd(.8, 2), stun: 0, slip: 0, sleep: 0, speechT: rnd(3, 8), teles: [], bubbleH: D.bubbleH || (type === 'yngel' ? 1.7 : type === 'pleier' ? 3.3 : 3.1), blood: D.blood || (type === 'yngel' ? 0x6b2d8c : 0xb3261e), depth };
  e.max = e.hp; G.enemies.push(e); puff(x, z, 2, .8, type === 'yngel' ? '#6b3a82' : null);
  if (type === 'yngel') Particles.spawn(x, .2, z, 8, 0x6b2d8c, { speed: 2, up: 5 });
  return e;
}
function enemySlip(e) { if (e.slip > 0 || e.kind === 'boss') return; e.slip = 1.2; cancelTeles(e); e.state = 'recover'; e.t = 1.2; numText(e.x, e.z, 'SKLI!', 'info', 2.4); Sound.play('bonk', .6, .7); }
function enemyDie(e, src) {
  const P = G.player; P.counters.kills++; G.run.kills++;
  e.deadT = .5; puff(e.x, e.z, 5, 1.2); Sound.play('die'); R.shake(.25); G.hitstop = Math.max(G.hitstop, .06);
  const D = ENEMIES[e.type]; dropTeeth(e.x, e.z, rndi(D.teeth[0], D.teeth[1]) * (e.elite ? 3 : 1));
  if (Math.random() < (e.elite ? .5 : .08)) dropPickup(e.x, e.z, 'heart');
  if (e.elite && Math.random() < .5) dropPickup(e.x, e.z, 'cons', pick(Object.keys(CONSUMABLES)));
  if (D.morb) { for (let i = 0; i < D.morb; i++) dropPickup(e.x, e.z, 'morb'); addPuddle(e.x, e.z, 'morb', .8, 24); }
  gainXp(D.xp * (e.elite ? 2.5 : 1)); checkDiagnoses(); Items.onKill(e);
}
function updateEnemy(e, dt) {
  const P = G.player;
  if (!e.alive) { e.deadT -= dt; e.doll.update(dt, { down: true }); e.doll.dissolve(1 - Math.max(0, e.deadT) / .5); if (e.deadT <= 0 && !e.gone) { e.gone = true; e.doll.dispose(); } return; }
  updateEnemyQueue(e, dt);
  e.t -= dt; e.cd -= dt; e.stun -= dt; e.slip -= dt; e.sleep -= dt; e.speechT -= dt; e.confused -= dt || 0; e.exposed -= dt; e.shrink -= dt; e.bloat -= dt;
  if (e.bleed > 0) { e.bleed -= dt; e.bleedT = (e.bleedT || 0) - dt; if (e.bleedT <= 0) { e.bleedT = .5; hurt(e, 2, { from: 'player' }); } }
  const T = enemyTarget(e), dx = T.x - e.x, dz = T.z - e.z, dist = Math.hypot(dx, dz), toT = Math.atan2(dx, dz);
  let mv = 0, want = e.face, speedMul = 1;
  if (e.state === 'spawn') { e.doll.root.scale.setScalar(Math.min(1, 1 - e.t / .5)); if (e.t <= 0) { e.state = 'chase'; e.doll.root.scale.setScalar(1); } }
  else if (e.stun > 0 || e.slip > 0 || e.sleep > 0) { if (e.state === 'wind') { cancelTeles(e); e.state = 'recover'; e.t = .3; } }
  else if (e.state === 'charge') {
    const W0 = e.chargeDir; mv = 0; want = W0;
    const wall = moveEnt(e, Math.sin(W0) * 13 * dt, Math.cos(W0) * 13 * dt); e.chargeLeft -= 13 * dt;
    if (d2(e.x, e.z, P.x, P.z) < (e.r + P.r + .2) ** 2 && !e.chargeHit) { e.chargeHit = true; hurt(P, e.dmg * 1.2, { type: e.type, x: e.x, z: e.z, kb: 10 }); }
    if (wall || e.chargeLeft <= 0) e.rolling = false;
    if (wall) { e.state = 'recover'; e.t = 1; e.stun = 1; numText(e.x, e.z, 'BONK', 'crit', 2.6); Sound.play('bonk'); R.shake(.2); puff(e.x, e.z, 3); }
    else if (e.chargeLeft <= 0) { e.state = 'recover'; e.t = .8; }
    if (Math.random() < dt * 20) puff(e.x, e.z, 1, .5);
  }
  else if (e.state === 'chase') {
    want = toT;
    const keep = { pleier: 1.3, kultist: 3.6, oppasser: 5, yngel: 1.0 }[e.type] ?? Grotesk.keep[e.type] ?? 1.2;
    if (dist > keep) mv = 1; else if (dist < keep - 1.3 && (e.type === 'kultist' || e.type === 'oppasser' || Grotesk.retreat[e.type])) mv = -.7;
    const canHit = T === P ? P.alive : true;
    if (e.cd <= 0 && canHit) {
      if (e.type === 'pleier') {
        if (dist < 2.0) { e.state = 'wind'; e.t = .55; e.face = toT; addTele('cone', { x: e.x, z: e.z, a: toT, r: 2.0, arc: 1.9 }, .55, o => { hitShape('cone', o, e.dmg, { type: 'pleier', x: e.x, z: e.z, kb: 7 }, 'enemy'); Sound.play('slam', .6); R.shake(.2); puff(e.x + Math.sin(o.a), e.z + Math.cos(o.a), 2, .6); }, e); }
        else if (dist < 7 && Math.random() < .5 && los(e.x, e.z, T.x, T.z)) { e.state = 'wind'; e.t = .75; e.face = toT; addTele('rect', { x: e.x, z: e.z, a: toT, w: 1.3, len: 7 }, .75, o => { e.state = 'charge'; e.chargeDir = o.a; e.chargeLeft = 7; e.chargeHit = false; Sound.play('swingHeavy', 1, .6); }, e); }
      }
      else if (e.type === 'kultist' && dist < 7.5) {
        e.state = 'wind'; e.t = 1.0; const o = { x: T.x, z: T.z, r: 1.55, color: 0xb36be0 };
        addTele('circle', o, 1.0, o => { hitShape('circle', o, e.dmg, { type: 'kultist', friendly: true, owner: e, x: o.x, z: o.z, kb: 4 }, 'enemy'); for (const f of G.enemies) if (f !== e && f.alive && inShape({ shape: 'circle', o }, f.x, f.z)) hurt(f, e.dmg, { from: 'env', x: o.x, z: o.z, kb: 4 }); Particles.spawn(o.x, .3, o.z, 14, 0xb36be0, { speed: 5, up: 6 }); flashLight(o.x, o.z, 2.6, '#b36be0', .35); Sound.play('morb', 1, .7); R.shake(.2); }, e); e.raise = true;
      }
      else if (e.type === 'oppasser' && dist < 10 && los(e.x, e.z, T.x, T.z)) { e.state = 'wind'; e.t = .6; e.face = toT; addTele('rect', { x: e.x, z: e.z, a: toT, w: .35, len: 10 }, .6, o => { addProj({ type: 'syringe', from: 'enemy', x: e.x + Math.sin(o.a) * .6, z: e.z + Math.cos(o.a) * .6, vx: Math.sin(o.a) * 12, vz: Math.cos(o.a) * 12, dmg: e.dmg, life: 1.4, cause: 'oppasser' }); Sound.play('shoot'); }, e); }
      else if (e.type === 'yngel' && dist < 1.9) { e.state = 'wind'; e.t = .3; e.face = toT; addTele('circle', { x: e.x + Math.sin(toT) * .9, z: e.z + Math.cos(toT) * .9, r: .8 }, .3, o => { e.kvx = Math.sin(e.face) * 9; e.kvz = Math.cos(e.face) * 9; hitShape('circle', o, e.dmg, { type: 'yngel', x: e.x, z: e.z }, 'enemy'); }, e); }
      else if (Grotesk.ai[e.type]) Grotesk.ai[e.type](e, T, dist, toT);
    }
    if (e.type === 'kultist' && e.speechT <= 0) { e.speechT = rnd(6, 11); if (Math.random() < .45) { e.state = 'pose'; e.t = 1.6; e.pose = 1.6; FX.bubble(e, pick(LINES.pose), 1.8); } else FX.bubble(e, pick(LINES.kultist), 3); }
    if (e.type === 'pleier' && e.speechT <= 0) { e.speechT = rnd(9, 15); FX.bubble(e, pick(LINES.pleier), 2.4); }
    if (Grotesk.talk[e.type] && e.speechT <= 0) { e.speechT = rnd(7, 12); if (Math.random() < .6) FX.bubble(e, pick(LINES[e.type]), 1.6); }
    if (e.type === 'yngel' && e.speechT <= 0) { e.speechT = rnd(6, 12); FX.bubble(e, pick(LINES.yngel), 1.2); }
  } else if (e.state === 'wind') { want = e.type === 'kultist' ? toT : e.face; if (e.t <= 0) { e.state = 'recover'; e.t = .45; e.raise = false; e.cd = rnd(1.3, 2.4) * (e.elite ? .75 : 1); } }
  else if (e.state === 'recover' || e.state === 'pose') { e.pose -= dt; if (e.t <= 0) { e.state = 'chase'; e.raise = false; e.pose = 0; } }
  // bevegelse: strømningsfelt rundt møbler, rett mot målet på kort hold
  let vx = 0, vz = 0;
  if (mv) {
    let fx = Math.sin(toT), fz = Math.cos(toT);
    // rundt møbler: strømningsfeltet når sikten er blokkert for kroppen (ikke bare midtpunktet), eller når fienden står fast
    if (mv > 0 && dist > 1.6 && (e.stuckT > 0 || !losWide(e.x, e.z, T.x, T.z, e.r))) {
      const f = T === P ? flowDir(e) : null;
      if (f) { fx = f.x; fz = f.z; } else if (e.stuckT > 0) { const a = toT + e.sideSign * 1.35; fx = Math.sin(a); fz = Math.cos(a); }
    }
    const sp = e.sp * (e.shrink > 0 ? 1.2 : 1) * (e.bloat > 0 ? .7 : 1);
    vx = fx * sp * mv; vz = fz * sp * mv;
  }
  for (const o of G.enemies) if (o !== e && o.alive) { const d = Math.hypot(e.x - o.x, e.z - o.z), m = e.r + o.r; if (d < m && d > 0) { vx += (e.x - o.x) / d * (m - d) * 8; vz += (e.z - o.z) / d * (m - d) * 8; } }
  if (P.alive) { const d = Math.hypot(e.x - P.x, e.z - P.z), m = e.r + P.r; if (d < m && d > 0) { vx += (e.x - P.x) / d * (m - d) * 6; vz += (e.z - P.z) / d * (m - d) * 6; } }
  e.vx = lerp(e.vx, vx, 1 - Math.exp(-dt * 10)); e.vz = lerp(e.vz, vz, 1 - Math.exp(-dt * 10));
  moveEnt(e, (e.vx + e.kvx) * dt, (e.vz + e.kvz) * dt); const kb = Math.hypot(e.kvx, e.kvz); e.kvx *= Math.pow(.015, dt); e.kvz *= Math.pow(.015, dt);
  // står fienden fast mens den vil fram, prøver den en annen vei en stund
  e.stuckT = (e.stuckT || 0) - dt; e.progT = (e.progT || 0) + dt;
  if (e.progT > .5) { if (mv > 0 && e.state === 'chase' && dist > 1.8 && Math.hypot(e.x - (e.px0 ?? e.x), e.z - (e.pz0 ?? e.z)) < .22) { e.stuckT = 1.4; e.sideSign = Math.random() < .5 ? -1 : 1; } e.px0 = e.x; e.pz0 = e.z; e.progT = 0; }
  e.face = e.face + angDiff(want, e.face) * Math.min(1, dt * 10);
  groundEffects(e, dt, Math.hypot(e.vx, e.vz) + kb);
  for (const w of G.walls) if (w.alive && w.up === 'b' && d2(e.x, e.z, w.x, w.z) < (w.w / 2) ** 2 && e.stun <= 0) { e.stun = 2.5; numText(e.x, e.z, 'venter på stempel', 'info', 2.5); }
  for (const zn of G.zones) if (zn.kind === 'trip' && e.slip <= 0) { const t = clamp(((e.x - zn.x0) * (zn.x1 - zn.x0) + (e.z - zn.z0) * (zn.z1 - zn.z0)) / (d2(zn.x0, zn.z0, zn.x1, zn.z1) || 1), 0, 1); if (d2(e.x, e.z, lerp(zn.x0, zn.x1, t), lerp(zn.z0, zn.z1, t)) < .25) enemySlip(e); }
  e.doll.setFacing(e.face);
  const sp = Math.hypot(e.vx, e.vz);
  e.doll.update(dt, { speed: sp, down: e.slip > 0 || e.sleep > 0, raise: e.raise || e.state === 'pose', headTilt: e.state === 'pose' ? .25 : 0, hop: Grotesk.hop[e.type] && sp > 1 ? Math.abs(Math.sin(G.time * (e.type === 'rotte' ? 20 : 14))) * (e.type === 'tvang' ? .25 : .15) : 0, spin: e.rolling && e.state === 'charge' ? (G.time * 16) % TAU : 0,
    attack: e.type === 'oppasser' && e.state === 'wind' ? { p: .1, combo: 0 } : e.type === 'pleier' && e.state === 'wind' ? { p: .2 + (1 - e.t / .55) * .2, combo: 0 } : null, hold: e.type === 'oppasser' || Grotesk.hold[e.type] });
  e.doll.root.position.set(e.x, 0, e.z);
  if ((e.stun > 0 || e.sleep > 0) && Math.random() < dt * 3) Particles.spawn(e.x, 2.3, e.z, 1, e.sleep > 0 ? 0xcfe8ef : 0xfff6c8, { speed: 1, up: 1, g: 0, life: .5, size: .8 });
}

/* ============================================================
   BOSSER: slag, kroker/tentakler, innkalling, feiing og monologfaser.
   Ved 66 og 33 prosent holder bossen tale. Da tar den 50 prosent mer skade,
   og 12 prosent skade eller Våpenisert monolog (b) avbryter talen.
   ============================================================ */
function spawnBoss(depth, x, z) {
  const B0 = BOSSES[depth] || BOSSES[MAX_DEPTH], type = B0.type, tome = type === 'journalen';
  const doll = new Doll(type, { fixedView: 'f', weapon: B0.weapon, shadow: 1, scale: 1 });
  R.scene.add(doll.root); doll.root.position.set(x, 0, z);
  const B = { kind: 'boss', type, depth, name: B0.name, x, z, r: tome ? 1.1 : .9, face: 0, vx: 0, vz: 0, kvx: 0, kvz: 0, doll, alive: true, hp: B0.hp, max: B0.hp, B0, state: 'intro', t: 2.6, cd: 1.5, phase: 'fight', phasesDone: 0, stagger: 0, slowT: 0, teles: [], bubbleH: tome ? 4.2 : 4.6, enraged: false, anchored: true, blood: tome ? 0x6b2d8c : 0xb3261e, q: [] };
  B.glow = R.light(x, z, 5, tome ? '#b36be0' : type === 'arkivar' ? '#ffe0b0' : '#ffcc88', .3);
  G.boss = B; FX.bubble(B, pick(LINES.bossIntro[depth]), 2.6, 'boss');
  $('bossName').textContent = B0.name; $('bossTitle').textContent = B0.title; $('bossBar').classList.remove('hidden');
  Sound.play('boss'); return B;
}
function bossOnHurt(B, d) {
  if (B.phase === 'monolog') { B.monoDmg += d; if (B.monoDmg > B.max * .12) bossInterrupt(B); }
  const th = [.66, .33][B.phasesDone];
  if (th && B.hp / B.max < th && B.phase !== 'monolog') {
    B.phasesDone++; B.phase = 'monolog'; B.monoT = 6; B.monoDmg = 0; B.monoLine = 0; cancelTeles(B); B.state = 'talk';
    FX.bubble(B, LINES.monolog[B.depth][0], 2, 'boss'); toast('Bossen holder tale', 'Slå hardt for å avbryte, eller svar med monolog');
  }
}
function bossInterrupt(B) { B.phase = 'fight'; B.state = 'stagger'; B.t = 2.5; B.stagger = 2.5; FX.bubble(B, pick(LINES.interrupted), 1.8, 'boss'); Sound.play('stamp'); R.shake(.4); numText(B.x, B.z, 'AVBRUTT', 'crit', 4); }
function bossDie(B) {
  B.deadT = 1.6; cancelTeles(B); slowMo(1.2, .2); R.shake(.8); R.fx.flash = .6; Sound.play('clear'); Sound.play('die', 1, .5);
  for (let i = 0; i < 8; i++) setTimeout(() => puff(B.x + rnd(-1, 1), B.z + rnd(-1, 1), 3, 1.5), i * 90);
  dropTeeth(B.x, B.z, 25 + B.depth * 10); for (let i = 0; i < 2; i++) dropPickup(B.x, B.z, 'heart'); dropPickup(B.x, B.z, 'card', pick(ABILITY_IDS));
  G.meta.bossKills++; saveMeta(); gainXp(80 * B.depth);
  $('bossBar').classList.add('hidden'); stampBig('BEHANDLET', B.name); clearCage();
  for (const e of G.enemies) if (e.alive) { e.hp = 0; killEntity(e, {}); }
  setTimeout(openTrapdoor, 1400);
}
function updateBoss(B, dt) {
  const P = G.player;
  if (!B.alive) { B.deadT -= dt; B.doll.update(dt, { down: B.type !== 'journalen' }); B.doll.dissolve(1 - Math.max(0, B.deadT) / 1.6); if (B.glow) R.setLight(B.glow, B.deadT); if (B.deadT <= 0 && !B.gone) { B.gone = true; B.doll.dispose(); if (B.glow) R.remove(B.glow); } return; }
  const sl = B.slowT > 0 ? .6 : 1; dt *= sl; B.slowT -= dt;
  for (let i = B.q.length - 1; i >= 0; i--) { const j = B.q[i]; j.t -= dt; if (j.t <= 0) { B.q.splice(i, 1); j.fn(); } }
  B.t -= dt; B.cd -= dt; B.stagger -= dt;
  const dx = P.x - B.x, dz = P.z - B.z, dist = Math.hypot(dx, dz), toP = Math.atan2(dx, dz);
  let mv = 0;
  if (B.state === 'intro') { if (B.t <= 0) B.state = 'chase'; }
  else if (B.state === 'talk') {
    B.monoT -= dt;
    const lines = LINES.monolog[B.depth], li = Math.floor((6 - B.monoT) / 2);
    if (li !== B.monoLine && li < lines.length) { B.monoLine = li; FX.bubble(B, lines[li], 2, 'boss'); Sound.mumble(6, 110); }
    if (B.monoT <= 0) { B.phase = 'fight'; B.state = 'chase'; B.enraged = true; toast('Talen er over', 'Bossen er rasende'); B.cd = .5; }
  }
  else if (B.state === 'stagger') { if (B.t <= 0) B.state = 'chase'; }
  else if (B.state === 'act') { if (B.t <= 0) { B.state = 'chase'; B.cd = rnd(.9, 1.6) * (B.enraged ? .65 : 1); } }
  else if (B.state === 'chase') {
    if (dist > 2.2) mv = 1;
    if (B.cd <= 0 && P.alive) bossAttack(B, pick(B.B0.attacks), dist, toP);
  }
  if (mv) { const sp = (B.type === 'journalen' ? 2.3 : B.type === 'arkivar' ? 2.1 : 1.9) * (B.enraged ? 1.3 : 1); B.vx = lerp(B.vx, Math.sin(toP) * sp, dt * 4); B.vz = lerp(B.vz, Math.cos(toP) * sp, dt * 4); } else { B.vx *= Math.pow(.02, dt); B.vz *= Math.pow(.02, dt); }
  moveEnt(B, B.vx * dt, B.vz * dt);
  if (P.alive && d2(P.x, P.z, B.x, B.z) < (B.r + P.r) ** 2) { const a = Math.atan2(P.x - B.x, P.z - B.z); P.kvx = Math.sin(a) * 5; P.kvz = Math.cos(a) * 5; }
  B.face = toP; B.doll.setFacing(toP);
  B.doll.update(dt, { speed: Math.hypot(B.vx, B.vz), raise: B.state === 'talk', attack: B.state === 'act' && B.atkAnim ? { p: 1 - Math.max(0, B.t) / B.atkDur, combo: 0, heavy: true } : null, headTilt: B.state === 'stagger' ? .3 : 0 });
  B.doll.root.position.set(B.x, B.hop || 0, B.z);
  if (B.glow) { B.glow.position.set(B.x, 0, B.z + .5); R.setLight(B.glow, B.state === 'talk' ? .7 + Math.sin(G.time * 8) * .2 : .3); }
  if (B.stagger > 0 && Math.random() < dt * 4) Particles.spawn(B.x, 3.6, B.z, 1, 0xfff6c8, { speed: 1, up: 1, g: 0, life: .5 });
  $('bossFill').style.width = (B.hp / B.max * 100) + '%';
}
function bossAttack(B, kind, dist, toP) {
  const P = G.player, d = B.depth, dmg = bossDmg(B), puddle = B.B0.puddle, tome = B.type === 'journalen';
  B.state = 'act'; B.atkAnim = true;
  if (BOSS_MOVES[kind]) { BOSS_MOVES[kind](B, dist, toP, dmg); return; }
  if (kind === 'slam') {
    const o = { x: P.x, z: P.z, r: 2.4 }; B.t = B.atkDur = 1.1;
    addTele('circle', o, .95, () => {
      B.x = clamp(o.x, B.x - 6, B.x + 6); B.z = clamp(o.z, B.z - 6, B.z + 6); collide(B);
      hitShape('circle', o, dmg, { type: 'boss', x: o.x, z: o.z, kb: 10 }, 'enemy'); R.shake(.6); Sound.play('slam'); puff(o.x, o.z, 6, 1.8); flashLight(o.x, o.z, 3.5, '#ffd0a0', .3);
      if (puddle) addPuddle(o.x, o.z, puddle, 1.8, 20);
    }, B);
    addFx(B.doll.root, 0, null);
    FX.bubble(B, tome ? 'SIDE ÉN.' : B.type === 'arkivar' ? 'Stille, takk.' : 'Hold stille, dette gjør vondt.', 1.2, 'boss');
  } else if (kind === 'hooks') {
    const n = d === 1 ? 3 : 5; B.t = B.atkDur = 1.1;
    for (let i = 0; i < n; i++) { const a = toP + (i - (n - 1) / 2) * .38; addTele('rect', { x: B.x, z: B.z, a, w: .8, len: 10 }, .85, o => { hitShape('rect', o, dmg * .8, { type: 'boss', x: B.x, z: B.z, kb: 6 }, 'enemy'); beam(o.x, o.z, o.x + Math.sin(o.a) * o.len, o.z + Math.cos(o.a) * o.len, tome ? 0x3a1a4a : 0x6a6a70, .18, .35, .9); Sound.play('chain'); }, B); }
  } else if (kind === 'summon') {
    B.t = B.atkDur = .9; FX.bubble(B, pick(['Mine studenter!', 'Personalet, til meg!', 'Kom, små sider.']), 1.6, 'boss');
    const room = G.F.rooms[G.F.bossId];
    for (let i = 0; i < B.B0.minions + (B.enraged ? 1 : 0); i++) { const sp = room.spawns[i % room.spawns.length] || [B.x + rnd(-3, 3), B.z + rnd(-3, 3)]; const f = freeSpot(sp[0], sp[1]); setTimeout(() => { if (B.alive) spawnEnemy(B.B0.minion, f.x, f.z, false, d); }, i * 250); }
  } else if (kind === 'sweep') {
    B.t = B.atkDur = 1.0; const o = { x: B.x, z: B.z, a: toP, r: 4.4, arc: 2.6 };
    addTele('cone', o, .8, () => { hitShape('cone', o, dmg, { type: 'boss', x: B.x, z: B.z, kb: 9 }, 'enemy'); slashFx(B.x, B.z, o.a, o.r, o.arc, true, tome ? 0xb36be0 : 0xfff2d0); Sound.play('swingHeavy', 1, .6); R.shake(.3); if (puddle) for (let k = 0; k < 3; k++) addPuddle(B.x + Math.sin(o.a + (k - 1) * .6) * 3, B.z + Math.cos(o.a + (k - 1) * .6) * 3, puddle, 1, 14); }, B);
  }
}
function openTrapdoor() {
  const room = G.F.rooms[G.F.bossId], x = room.cx + .5, z = room.cz + .5;
  const p = { k: 'trapdoor', x, z, rot: 0, opened: true }, g = propSprite('trapdoor', x, z, { P: propArt(p), flat: true }); R.level.add(g);
  G.trapdoor = { x, z }; R.light(x, z, 2.5, '#ffe2a0', .5, R.levelL);
  toast(G.depth >= MAX_DEPTH ? 'Utgangen er åpen' : 'En luke åpner seg', G.depth >= MAX_DEPTH ? 'Gå til luken for å bli skrevet ut' : 'Den fører ned');
}
