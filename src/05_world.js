/* ============================================================
   VERDEN  -  kollisjon, skade, pytter, rekvisitter, plukk, prosjektiler, varsler
   ============================================================ */
const G = {
  state: 'boot', meta: null, settings: null, run: null, F: null, th: null, depth: 1,
  player: null, enemies: [], boss: null, projectiles: [], puddles: [], props: [], pickups: [], allies: [], zones: [], walls: [], tele: [], fxl: [], npcs: [], halluc: [],
  lock: null, barriers: [], room: null, time: 0, hitstop: 0, slow: { t: 0, s: 1 }, seen: null, flow: null, flowT: 0, paT: 25, elecT: 0
};

/* ---------- ruter og kollisjon ---------- */
function tIdx(x, z) { const F = G.F, tx = Math.floor(x), tz = Math.floor(z); if (tx < 0 || tz < 0 || tx >= F.W || tz >= F.H) return -1; return tz * F.W + tx; }
function solid(tx, tz) {
  const F = G.F; if (tx < 0 || tz < 0 || tx >= F.W || tz >= F.H) return true;
  const i = tz * F.W + tx; return !F.tiles[i] || F.block[i] === 1 || (G.lock !== null && G.lock.has(i)) || (!!G.cage && G.cage.has(i));
}
function collide(e) {
  const r = e.r; let any = false;
  for (let it = 0; it < 3; it++) {
    let hit = false;
    const x0 = Math.floor(e.x - r), x1 = Math.floor(e.x + r), z0 = Math.floor(e.z - r), z1 = Math.floor(e.z + r);
    for (let tz = z0; tz <= z1; tz++) for (let tx = x0; tx <= x1; tx++) {
      if (!solid(tx, tz)) continue;
      const cx = clamp(e.x, tx, tx + 1), cz = clamp(e.z, tz, tz + 1), dx = e.x - cx, dz = e.z - cz, d = Math.hypot(dx, dz);
      if (d >= r) continue;
      if (d < 1e-5) {
        const l = e.x - tx, rr = tx + 1 - e.x, u = e.z - tz, dd = tz + 1 - e.z, m = Math.min(l, rr, u, dd);
        if (m === l) e.x = tx - r; else if (m === rr) e.x = tx + 1 + r; else if (m === u) e.z = tz - r; else e.z = tz + 1 + r;
      } else { const p = (r - d) / d; e.x += dx * p; e.z += dz * p; }
      hit = true;
    }
    if (!hit) break; any = true;
  }
  return any;
}
function moveEnt(e, dx, dz) {
  const L = Math.hypot(dx, dz), n = Math.max(1, Math.ceil(L / .25)); let wall = false;
  for (let i = 0; i < n; i++) { e.x += dx / n; e.z += dz / n; if (collide(e)) wall = true; }
  return wall;
}
function los(ax, az, bx, bz) {
  const L = Math.hypot(bx - ax, bz - az), n = Math.ceil(L / .3);
  for (let i = 1; i < n; i++) { const t = i / n; if (solid(Math.floor(lerp(ax, bx, t)), Math.floor(lerp(az, bz, t)))) return false; }
  return true;
}
/* sikt for en kropp med radius r: midtlinjen og begge sidelinjene må være frie */
function losWide(ax, az, bx, bz, r) {
  if (!los(ax, az, bx, bz)) return false;
  const L = Math.hypot(bx - ax, bz - az) || 1, nx = -(bz - az) / L * r * .9, nz = (bx - ax) / L * r * .9;
  return los(ax + nx, az + nz, bx + nx, bz + nz) && los(ax - nx, az - nz, bx - nx, bz - nz);
}
function freeSpot(x, z, rad = 3) {
  for (let r = 0; r <= rad; r += .5) for (let k = 0; k < 12; k++) {
    const a = k / 12 * TAU, px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r;
    if (!solid(Math.floor(px), Math.floor(pz)) && !solid(Math.floor(px + .4), Math.floor(pz)) && !solid(Math.floor(px - .4), Math.floor(pz)) && !solid(Math.floor(px), Math.floor(pz + .4)) && !solid(Math.floor(px), Math.floor(pz - .4))) return { x: px, z: pz };
    if (r === 0) break;
  }
  return { x, z };
}
/* strømningsfelt fra spilleren: fiender følger laveste avstand rundt møbler */
function buildFlow(tx, tz) {
  const F = G.F, W = F.W; if (!G.flow) G.flow = new Int16Array(W * F.H);
  const D = G.flow; D.fill(-1); const q = new Int32Array(W * F.H); let h = 0, t = 0;
  if (solid(tx, tz)) return; D[tz * W + tx] = 0; q[t++] = tz * W + tx;
  while (h < t) {
    const i = q[h++], x = i % W, z = (i / W) | 0, d = D[i];
    if (d > 40) continue;
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, nz = z + dz; if (solid(nx, nz)) continue; const j = nz * W + nx; if (D[j] >= 0) continue; D[j] = d + 1; q[t++] = j;
    }
  }
}
function flowDir(e) {
  const F = G.F, W = F.W, tx = Math.floor(e.x), tz = Math.floor(e.z); if (!G.flow) return null;
  const here = G.flow[tz * W + tx]; if (here < 0) return null;
  let best = here, bx = 0, bz = 0;
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    const nx = tx + dx, nz = tz + dz; if (solid(nx, nz)) continue;
    if (dx && dz && (solid(tx + dx, tz) || solid(tx, tz + dz))) continue;
    const v = G.flow[nz * W + nx]; if (v >= 0 && v < best) { best = v; bx = nx + .5 - e.x; bz = nz + .5 - e.z; }
  }
  if (best === here) return null; const L = Math.hypot(bx, bz) || 1; return { x: bx / L, z: bz / L };
}

/* ---------- spesialeffekter med levetid (sverdbuer, lenker, stråler) ---------- */
function addFx(obj, life, fn) { G.fxl.push({ obj, life, max: life, fn }); return obj; }
function updateFx(dt) {
  for (let i = G.fxl.length - 1; i >= 0; i--) {
    const f = G.fxl[i]; f.life -= dt; const p = 1 - Math.max(0, f.life) / f.max;
    if (f.fn) f.fn(f.obj, p);
    if (f.life <= 0) { R.remove(f.obj); G.fxl.splice(i, 1); }
  }
}
function fadeFx(o, p) { o.traverse(c => { if (c.material && c.material.transparent) c.material.opacity = (c.userData.op0 === undefined ? (c.userData.op0 = c.material.opacity) : c.userData.op0) * (1 - p); }); }
function beam(x0, z0, x1, z1, color, w = .12, life = .2, y = .8) {
  const L = Math.hypot(x1 - x0, z1 - z0), m = new THREE.Mesh(R.geo('bx1', () => new THREE.BoxGeometry(1, 1, 1)), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .9 })); m.scale.set(w, w, 1);
  m.scale.z = L; m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); m.rotation.y = Math.atan2(x1 - x0, z1 - z0); R.dyn.add(m);
  return addFx(m, life, fadeFx);
}

/* ---------- varsler (telegrafer) ---------- */
function addTele(shape, o, dur, fire, owner) {
  const mesh = R.telegraph(shape, o), t = { mesh, t: dur, max: dur, fire, owner, o, shape };
  G.tele.push(t); if (owner) (owner.teles || (owner.teles = [])).push(t);
  Sound.play('tele', .6); return t;
}
function cancelTeles(owner) { if (!owner || !owner.teles) return; for (const t of owner.teles) { t.dead = true; R.remove(t.mesh); } owner.teles = []; }
function updateTele(dt) {
  for (let i = G.tele.length - 1; i >= 0; i--) {
    const t = G.tele[i];
    if (t.dead) { G.tele.splice(i, 1); continue; }
    t.t -= dt; t.mesh.userData.update(1 - Math.max(0, t.t) / t.max);
    if (t.t <= 0) {
      R.remove(t.mesh); G.tele.splice(i, 1);
      if (t.owner && t.owner.teles) t.owner.teles = t.owner.teles.filter(x => x !== t);
      if (t.owner && (!t.owner.alive || t.owner.stun > 0 || t.owner.sleep > 0)) continue;
      t.fire && t.fire(t.o);
    }
  }
}
function inShape(t, x, z, r = 0) {
  const o = t.o || t;
  if (t.shape === 'circle') return d2(x, z, o.x, o.z) < (o.r + r) * (o.r + r);
  const dx = x - o.x, dz = z - o.z, fa = o.a || 0, fx = Math.sin(fa), fz = Math.cos(fa);
  if (t.shape === 'rect') { const along = dx * fx + dz * fz, side = dx * fz - dz * fx; return along > -r && along < o.len + r && Math.abs(side) < o.w / 2 + r; }
  if (t.shape === 'cone') { const d = Math.hypot(dx, dz); if (d > o.r + r) return false; if (d < .6) return true; return Math.abs(angDiff(Math.atan2(dx, dz), fa)) < o.arc / 2; }
  return false;
}
/* treffer alle i en form. side: 'enemy' treffer spilleren og allierte, 'player' treffer fiender, 'all' treffer alle */
function hitShape(shape, o, dmg, src, side) {
  const t = { shape, o }, hits = [];
  const tryHit = e => { if (e && e.alive && inShape(t, e.x, e.z, e.r * .7)) { hurt(e, dmg, src); hits.push(e); } };
  if (side !== 'player') { tryHit(G.player); for (const a of G.allies) tryHit(a); }
  if (side !== 'enemy') { for (const e of G.enemies) tryHit(e); tryHit(G.boss); }
  else if (side === 'enemy' && src.friendly) { for (const e of G.enemies) if (e !== src.owner) tryHit(e); }
  return hits;
}

/* ---------- skade ---------- */
function numText(x, z, v, cls, y = 1.6) { FX.text(x + rnd(-.3, .3), y, z + rnd(-.2, .2), typeof v === 'number' ? String(Math.max(1, Math.round(v))) : v, cls); }
function hurt(e, dmg, src = {}) {
  if (!e || !e.alive) return 0;
  const P = G.player;
  if (e.kind === 'player') return hurtPlayer(dmg, src);
  let mult = 1;
  if (e.pose > 0) mult *= 2;
  if (e.slip > 0) mult *= 1.5;
  if (e.bloat > 0) mult *= 1.5;
  if (e.kind === 'boss' && e.phase === 'monolog') mult *= 1.5;
  if (e.kind === 'boss' && e.stagger > 0) mult *= 2;
  let d = dmg * mult, crit = false;
  if (src.from === 'player') {
    d *= playerDmgMult();
    if (Math.random() < .06 + (P.stats.fatteevne - 1) * .025 + Items.stat('luck') * .01) { d *= 1.6; crit = true; }
  }
  if (src.shrunk) d *= .5;
  if (e.mArmor) d *= e.mArmor;
  if (src.from === 'player' && !e.hitOnce) { e.hitOnce = true; if (Lomme.has('kolapp')) d *= 1.5; }
  if (!isFinite(d)) d = dmg > 0 && isFinite(dmg) ? dmg : 1;
  e.hp -= d; e.lastHit = src.from; e.hitsTaken = (e.hitsTaken || 0) + 1;
  if (!isFinite(e.hp)) e.hp = 0;
  if (e.doll) { const ha = src.a !== undefined ? src.a : Math.atan2(e.x - (src.x ?? e.x), e.z - (src.z ?? e.z) + 1e-4); e.doll.flash(.09); e.doll.hit(Math.sin(ha) >= 0 ? 1 : -1); }
  if (src.from === 'player' && typeof starBurst === 'function') starBurst(e.x, e.kind === 'boss' ? 2 : 1.2, e.z + .1, crit ? 1.4 : 1);
  numText(e.x, e.z, d, crit ? 'crit' : '', e.kind === 'boss' ? 3.2 : 1.7);
  if (src.kb && e.kind !== 'boss' && !e.anchored) {
    const a = src.a !== undefined ? src.a : Math.atan2(e.x - (src.x ?? e.x), e.z - (src.z ?? e.z) + 1e-4), k = src.kb * (e.elite ? .6 : 1) * (e.kbMult || 1);
    e.kvx = Math.sin(a) * k; e.kvz = Math.cos(a) * k;
  }
  if (src.stun && e.kind !== 'boss' && !e.steady) { e.stun = Math.max(e.stun || 0, src.stun); cancelTeles(e); }
  if (src.bleed) e.bleed = Math.max(e.bleed || 0, 2.5);
  if (e.kind === 'enemy' && e.sleep > 0) e.sleep = 0;
  if (e.kind === 'boss') bossOnHurt(e, d);
  Particles.spawn(e.x, 1, e.z, crit ? 7 : 4, e.blood || 0xb3261e, { speed: 4, up: 4 });
  if (e.hp <= 0) killEntity(e, src);
  return d;
}
function killEntity(e, src) {
  e.alive = false; e.hp = 0; cancelTeles(e);
  if (e.kind === 'enemy') enemyDie(e, src);
  else if (e.kind === 'boss') bossDie(e);
  else if (e.kind === 'ally') { Particles.spawn(e.x, 1, e.z, 10, 0x8a8f98, { flat: true, speed: 3, g: 4, life: 1.2 }); if (e.doll) e.doll.dispose(); else if (e.g) R.remove(e.g); }
}
function hurtPlayer(dmg, src) {
  const P = G.player; if (!P.alive || G.state !== 'play') return 0;
  if (P.iframe > 0 || P.invuln > 0) { if (P.iframe > 0 && !P.dodgeText) { numText(P.x, P.z, 'bom', 'info'); P.dodgeText = true; } return 0; }
  let d = dmg * (1 - Math.min(.3, (P.stats.helse - 1) * .03)) * (G.depth >= 2 ? 1 : .9);
  if (P.deny) {
    const up = P.deny.up; Sound.play('paper');
    if (up === 'b') {
      const t = nearestEnemy(P.x, P.z, 12); if (t) { hurt(t, d * 2 * abilityPower(), { from: 'player', x: P.x, z: P.z, kb: 4 }); numText(P.x, P.z, 'Ikke mitt ansvar', 'info', 2.2); beam(P.x, P.z, t.x, t.z, 0xefe4c4, .08, .25, 1.1); }
    } else { P.denied.push({ d: d * (up === 'a' ? .3 : .5), t: up === 'a' ? 30 : 3, cause: src.type, clear: up === 'a' }); numText(P.x, P.z, up === 'a' ? 'Bortforklart' : 'Benektet', 'info', 2.2); }
    P.deny = null; P.invuln = .35; return 0;
  }
  P.hp -= d; P.doll.flash(.12); P.doll.hit(1); R.fx.hurt = 1; P.invuln = .45; P.counters.hurt++; Items.onHurt(src); Oppskrift.onPlayerHurt(d, src);
  if (P.charging) { P.charging = false; P.chargeT = 0; numText(P.x, P.z, 'Avbrutt', 'info', 2.2); }
  numText(P.x, P.z, d, 'hurt', 1.9);
  Sound.play('hurt'); R.shake(.35); $('vignette').style.opacity = .9; P.vigT = .35;
  if (src.kb) { const a = Math.atan2(P.x - (src.x ?? P.x), P.z - (src.z ?? P.z) + 1e-4); P.kvx = Math.sin(a) * src.kb; P.kvz = Math.cos(a) * src.kb; }
  if (src.stun) P.stunT = Math.max(P.stunT, src.stun * .6);
  P.lastCause = src.type || 'any';
  if (P.hp <= 0 && !Lomme.saveFromDeath()) playerDie();
  return d;
}
function nearestEnemy(x, z, maxD = 99, filter) {
  let best = null, bd = maxD * maxD;
  const all = G.boss && G.boss.alive ? G.enemies.concat([G.boss]) : G.enemies;
  for (const e of all) { if (!e.alive || (filter && !filter(e))) continue; const d = d2(x, z, e.x, e.z); if (d < bd) { bd = d; best = e; } }
  return best;
}
function slowMo(t, s) {
  // SlowMotionSystem-ideen fra Geometry 3044: korte tidsfall på store øyeblikk
  G.slow.t = Math.max(G.slow.t, t); G.slow.s = Math.min(G.slow.t > 0 ? G.slow.s : 1, s);
}

/* ---------- pytter og strøm ---------- */
const CONDUCTIVE = { wet: 1, soup: 1, vomit: 1, blod: 1, mokk: 1 };
function addPuddle(x, z, kind, r = 1, life = 16) {
  if (tIdx(x, z) < 0 || !G.F.tiles[tIdx(x, z)]) return null;
  for (const p of G.puddles) if (p.kind === kind && d2(p.x, p.z, x, z) < (p.r * .7) * (p.r * .7)) { p.r = Math.min(2.6, Math.max(p.r, r) + .15); p.life = Math.max(p.life, life); p.mesh.scale.set(p.r * 2, p.r * 2, 1); return p; }
  if (G.puddles.length > 46) { const old = G.puddles.shift(); R.remove(old.mesh); }
  const p = { x, z, kind, r, life, max: life, elec: 0, mesh: R.puddleMesh(kind, r) };
  p.mesh.position.x = x; p.mesh.position.z = z; G.puddles.push(p); return p;
}
function puddleAt(x, z, pad = 0) { for (const p of G.puddles) if (d2(x, z, p.x, p.z) < (p.r * .85 + pad) * (p.r * .85 + pad)) return p; return null; }
function updatePuddles(dt) {
  G.elecT -= dt;
  if (G.elecT <= 0) {
    G.elecT = .1;
    // kilder: gnistrende lamper
    for (const p of G.puddles) p.src = 0;
    for (const L of G.props) if (L.kind === 'lamp' && L.spark > 0) {
      const lx = L.fallen ? L.x + Math.sin(L.fallA) * 1.3 : L.x, lz = L.fallen ? L.z + Math.cos(L.fallA) * 1.3 : L.z;
      for (const p of G.puddles) if (CONDUCTIVE[p.kind] && d2(lx, lz, p.x, p.z) < (p.r + (L.fallen ? .9 : .5)) ** 2) p.src = 1;
    }
    for (const p of G.puddles) if (p.src) p.elec = .35;
    // spres gjennom pytter som overlapper
    for (let pass = 0; pass < 3; pass++) for (const a of G.puddles) if (a.elec > 0) for (const b of G.puddles) if (b !== a && b.elec <= 0 && CONDUCTIVE[b.kind] && d2(a.x, a.z, b.x, b.z) < (a.r + b.r) * (a.r + b.r) * .8) b.elec = .35;
  }
  for (let i = G.puddles.length - 1; i >= 0; i--) {
    const p = G.puddles[i]; p.life -= dt;
    const on = p.elec > 0; p.elec -= dt;
    if (on !== (p.elec > 0) || p.mesh.material.uniforms.uElectric.value !== (p.elec > 0 ? 1 : 0)) p.mesh.material = R.waterMat(p.kind === 'tub' ? 'wet' : p.kind, p.elec > 0);
    if (p.elec > 0 && Math.random() < dt * 8) { Particles.spawn(p.x + rnd(-p.r, p.r) * .6, .1, p.z + rnd(-p.r, p.r) * .6, 2, 0xfff6a0, { speed: 2, up: 3, life: .25, size: .6 }); if (Math.random() < .1) Sound.play('spark', .4); }
    if (p.life < 2) { const s = Math.max(.01, p.life / 2) * p.r * 2; p.mesh.scale.set(s, s, 1); }
    if (p.life <= 0) { R.remove(p.mesh); G.puddles.splice(i, 1); }
  }
}
/* påvirkning fra underlaget for en figur, kalles hvert bilde */
function groundEffects(e, dt, speed) {
  const p = puddleAt(e.x, e.z); if (!p) { e.inPud = null; return; }
  const entered = e.inPud !== p; e.inPud = p;
  if (entered && speed > 1) R.ripple(e.x, e.z);
  if (p.elec > 0 && !e.flying) {
    e.zapT = (e.zapT || 0) - dt;
    if (e.zapT <= 0) {
      e.zapT = .5; Sound.play('zap', .7); Particles.spawn(e.x, .6, e.z, 8, 0xfff6a0, { speed: 5, up: 5, life: .3 });
      if (e.kind === 'player') hurt(e, 8, { type: 'zap', stun: .5 }); else hurt(e, 12, { from: 'env', stun: .6 });
      if (e.kind === 'enemy' && e.alive) numText(e.x, e.z, 'ZAPP', 'crit', 2.2);
    }
  }
  if (p.kind === 'mokk' && e.kind === 'player') e.mokkT = .2;
  if (p.kind === 'morb') {
    if (e.kind === 'player') addMorb(dt * 3.2);
    else if (e.type === 'yngel' && e.hp < e.max) e.hp = Math.min(e.max, e.hp + dt * 4);
  }
  if (e.kind === 'enemy' && e.slip <= 0 && e.state !== 'spawn' && p.kind !== 'morb') {
    const chance = speed > 5 ? 1 : (p.kind === 'wet' ? .25 : .7) * dt * speed * .6;
    if ((entered && speed > 3.2) || Math.random() < chance * dt * 6) enemySlip(e);
  }
}

/* ---------- rekvisitter i drift ---------- */
const BREAK = { chair: 1, cabinet: 2, crate: 2, garbage: 1, basket: 1, plant: 1, candles: 1, table: 2, papirhaug: 1, bokstabel: 1, linhaug: 1 };
function spawnProps() {
  G.props = []; G.npcs = [];
  const F = G.F, th = G.th;
  for (const r of F.rooms) for (const p of r.props) {
    if (p.k === 'puddle') { addPuddle(p.x, p.z, p.kind || 'wet', rnd(.9, 1.4), 1e9); continue; }
    if (p.k === 'npc') { spawnNPC(p, r); continue; }
    const P = propArt(p), flat = p.k === 'drain' || p.k === 'trapdoor' || p.k === 'forbannet';
    const blocking = F.block[Math.floor(p.z) * F.W + Math.floor(p.x)] === 1 || (p.fd || 1) > 1 || (p.fw || 1) > 1;
    const zf = flat ? p.z : blocking ? p.z + (p.fd || 1) / 2 - .04 : p.z + .2;
    const rr = ((p.rot || 0) % TAU + TAU) % TAU, side = rr > .5 && rr < TAU - .5 && Math.abs(rr - Math.PI) > .5;
    const g = propSprite(p.k, p.x, zf, { P, flat, flip: p.k === 'chair' && side && rr > Math.PI });
    R.level.add(g);
    const o = { p, g, U: g.userData.U, m: g.userData.m || g, kind: p.k, x: p.x, z: p.z, room: r.id, alive: true };
    if (BREAK[p.k]) { o.hp = p.brk || BREAK[p.k]; o.brk = true; }
    if (p.k === 'lamp') { o.faulty = !!p.faulty || (F.depth >= 3 && Math.random() < .5); o.spark = 0; o.sparkT = rnd(2, 6); o.hp = 1; o.light = R.light(p.x + .2, p.z + .5, 3.4, th.pool, .7, R.levelL); }
    if (p.k === 'candles') o.light = R.light(p.x, p.z + .2, 1.8, '#ffb24a', .6, R.levelL);
    if (p.k === 'journalskap') o.light = R.light(p.x, p.z + .8, 2.6, '#b36be0', .7, R.levelL);
    if (p.k === 'altar') o.light = R.light(p.x, p.z + .6, 3, '#9a4ac8', .5, R.levelL);
    if (p.k === 'offeralter') o.light = R.light(p.x, p.z + .6, 3.4, '#ff4a3a', .55, R.levelL);
    if (p.k === 'forbannet') o.light = R.light(p.x, p.z, 2.6, '#ff2a1a', .45, R.levelL);
    if (p.k === 'chest' || p.k === 'lore') o.light = R.light(p.x, p.z + .3, 1.6, '#ffd070', .45, R.levelL);
    if (p.k === 'trolley') { o.r = .45; o.vx = 0; o.vz = 0; o.soup = !!p.soup; }
    if (p.k === 'chest') o.chest = p.chest || 'treasure';
    if (p.k === 'lore') o.lore = true;
    G.props.push(o);
  }
}
function spawnNPC(p, r) {
  const who = { kafeteria: 'kokk', medisin: 'hansen', vaktmester: 'olsen', bibliotek: 'bibliotekar' }[p.service];
  const n = { kind: 'npc', service: p.service, x: p.x, z: p.z, r: .5, alive: true, face: 0, room: r.id, invisible: p.invisible || !who, bubbleH: 2.9, talkT: rnd(4, 9) };
  if (!n.invisible) { n.doll = new Doll(who, { fixedView: 'f' }); n.doll.root.position.set(p.x, 0, p.z); R.level.add(n.doll.root); FX.label(n, SERVICES[p.service].npc, 'npc'); }
  G.npcs.push(n);
}
function propTiles(o) { return [tIdx(o.x, o.z)]; }
function breakProp(o, src) {
  o.alive = false; const P = G.player; P.counters.props++;
  const colors = { chair: 0x7a5a3a, cabinet: 0x6f7a55, crate: 0x9a7040, garbage: 0x5a5040, basket: 0xb8904a, plant: 0x4f7a3a, candles: 0xf0e8d0, table: 0xf0ece0, papirhaug: 0xf4ecd8, bokstabel: 0x8a2a1a, linhaug: 0xeef0f2 };
  Particles.spawn(o.x, .6, o.z, 10, colors[o.kind] || 0x7a5a3a, { speed: 5, up: 5, life: .8 });
  Particles.spawn(o.x, .6, o.z, 5, 0xefe4c4, { flat: true, speed: 3, up: 4, g: 5, life: 1.4 });
  Sound.play(o.kind === 'cabinet' || o.kind === 'papirhaug' ? 'paper' : 'bonk', .8, .7);
  o.dying = .4; if (o.light) R.remove(o.light);
  for (const i of propTiles(o)) if (i >= 0) G.F.block[i] = 0;
  const nys = hasDiag('nysgjerrighet');
  if (Math.random() < (nys ? .7 : .35)) dropTeeth(o.x, o.z, rndi(1, 2) * (nys ? 2 : 1));
  if (Math.random() < .06) dropPickup(o.x, o.z, 'heart');
  if (Math.random() < .015) dropPickup(o.x, o.z, 'trinket', Lomme.pick());
}
function hitProps(x, z, face, range, arc, dmg, kb) {
  let n = 0;
  for (const o of G.props) {
    if (!o.alive) continue;
    const dx = o.x - x, dz = o.z - z, d = Math.hypot(dx, dz);
    if (d > range + .45) continue;
    if (d > .7 && Math.abs(angDiff(Math.atan2(dx, dz), face)) > arc / 2) continue;
    if (o.brk) { o.hp--; o.flashT = .09; o.g.position.x += dx / (d || 1) * .06; if (o.hp <= 0) breakProp(o); n++; }
    else if (o.kind === 'lamp' && !o.fallen) { knockLamp(o, Math.atan2(dx, dz)); n++; }
    else if (o.kind === 'trolley') { const a = Math.atan2(dx, dz); o.vx = Math.sin(a) * kb; o.vz = Math.cos(a) * kb; Sound.play('bonk', .6, 1.4); n++; }
  }
  return n;
}
function knockLamp(o, a) {
  o.fallen = true; o.fallA = a; o.spark = 7 + (hasDiag('nysgjerrighet') ? 4 : 0); o.fallT = 0; Sound.play('glass'); Sound.play('spark');
  numText(o.x, o.z, 'Lampen velter', 'info', 2);
}
function updateProps(dt) {
  const P = G.player;
  for (const o of G.props) {
    if (o.dying !== undefined) { o.dying -= dt; if (o.U) o.U.uDissolve.value = 1 - Math.max(0, o.dying) / .4; if (o.dying <= 0 && o.g.parent) R.remove(o.g); continue; }
    if (!o.alive) continue;
    if (o.flashT > 0) { o.flashT -= dt; o.U.uFlash.value = o.flashT > 0 ? 1 : 0; }
    if (o.kind === 'lamp') {
      const side = Math.sin(o.fallA || 0) >= 0 ? 1 : -1;
      if (o.fallen && o.fallT < 1) { o.fallT = Math.min(1, o.fallT + dt * 4); o.m.rotation.z = -side * o.fallT * 1.35; }
      if (o.faulty && !o.fallen) { o.sparkT -= dt; if (o.sparkT <= 0) { o.spark = .9 * (hasDiag('nysgjerrighet') && d2(o.x, o.z, P.x, P.z) < 25 ? 2.5 : 1); o.sparkT = rnd(3, 7); Sound.play('spark', .5); } }
      const hx = o.fallen ? o.x + side * 1.3 : o.x + .25, hz = o.fallen ? o.z + .1 : o.z;
      if (o.spark > 0) {
        o.spark -= dt;
        if (Math.random() < dt * 14) Particles.spawn(hx, o.fallen ? .3 : 1.5, hz, 2, 0xfff6a0, { speed: 3, up: 3, life: .3, size: .5 });
        if (o.light) { o.light.position.set(hx, 0, hz + .3); R.setLight(o.light, Math.random() < .5 ? 1.1 : .2); o.light.material.color.lerp(new THREE.Color('#bfe8ff'), .5); }
        if (o.spark <= 0 && o.fallen) { o.dead = true; if (o.light) R.setLight(o.light, 0); }
      } else if (o.light && !o.dead) { const fl = o.faulty ? (Math.random() < .03 ? .2 : .7) : .7 + Math.sin(G.time * 2 + o.x) * .03; R.setLight(o.light, o.fallen ? 0 : fl); }
    }
    if (o.kind === 'candles' && o.light) R.setLight(o.light, .55 + Math.sin(G.time * 9 + o.x * 3) * .08 + Math.random() * .05);
    if (o.kind === 'trolley') {
      const sp = Math.hypot(o.vx, o.vz);
      if (sp > .05) {
        const wall = moveEnt(o, o.vx * dt, o.vz * dt);
        o.g.position.set(o.x, 0, o.z + .2); o.m.rotation.z = Math.sin(G.time * 30) * .03 * Math.min(1, sp / 5);
        if (o.soup && sp > 3 && Math.random() < dt * 10) addPuddle(o.x - o.vx * .05, o.z - o.vz * .05, 'soup', .7, 18);
        if (sp > 4) for (const e of G.enemies) if (e.alive && d2(e.x, e.z, o.x, o.z) < (e.r + .6) ** 2 && !(o.hitSet && o.hitSet.has(e))) {
          (o.hitSet || (o.hitSet = new Set())).add(e); hurt(e, 20 + sp * 1.5, { from: 'player', x: o.x, z: o.z, kb: 9, stun: .5 }); Sound.play('hitHeavy'); R.shake(.2); numText(e.x, e.z, 'TRALLE', 'crit', 2.6);
        }
        if (wall && sp > 3) { Sound.play('bonk', .9, .6); R.shake(.15); if (o.soup) { addPuddle(o.x, o.z, 'soup', 1.4, 20); Sound.play('splash'); } o.vx *= -.3; o.vz *= -.3; o.hitSet = null; }
        const f = Math.pow(.25, dt); o.vx *= f; o.vz *= f; if (sp < .3) { o.vx = o.vz = 0; o.hitSet = null; }
      }
    }
    if (o.kind === 'washer') o.m.rotation.z = Math.sin(G.time * 20) * .01;
    if (o.light && (o.kind === 'journalskap' || o.kind === 'altar')) R.setLight(o.light, .55 + Math.sin(G.time * 2.4) * .15);
  }
}

/* ---------- plukk ---------- */
function dropTeeth(x, z, n) {
  n = Math.round(n * (1 + (G.player.stats.fatteevne - 1) * .08) * (G.run && G.run.gjen ? 1.25 : 1) * (hasDiag('gradig') ? 1.2 : 1));
  for (let i = 0; i < n; i++) dropPickup(x, z, 'tooth', 1);
}
function dropPickup(x, z, kind, val, extra) {
  const P = kind === 'tooth' ? toothPart() : kind === 'morb' ? morbPart() : kind === 'heart' ? heartPart() : kind === 'cons' ? bottlePart(val) : kind === 'weapon' ? weaponPart(val) : kind === 'trinket' ? lommePart(val) : cardPart();
  const g = propSprite(null, x, z, { P, shadow: false, depthWrite: true });
  if (kind === 'weapon') { g.userData.m.rotation.z = -1.1; g.userData.m.scale.multiplyScalar(.7); g.userData.m.position.y = .3; }
  if (kind === 'card' || kind === 'weapon' || kind === 'cons' || kind === 'trinket') g.userData.U.uOutline.value = 1, g.userData.U.uOutlineCol.value.set('#fff2b0');
  const a = Math.random() * TAU, sp = kind === 'tooth' || kind === 'morb' ? rnd(1.5, 4) : 1.2;
  const pk = { kind, val, extra, x, z, y: .6, vx: Math.cos(a) * sp, vz: Math.sin(a) * sp, vy: rnd(3, 5), mesh: g, t: 0, r: .25, alive: true };
  R.dyn.add(g); G.pickups.push(pk); return pk;
}
function updatePickups(dt) {
  const P = G.player;
  for (let i = G.pickups.length - 1; i >= 0; i--) {
    const k = G.pickups[i]; k.t += dt;
    if (k.y > .25 || k.vy > 0) { k.vy -= 16 * dt; k.y += k.vy * dt; k.x += k.vx * dt; k.z += k.vz * dt; if (solid(Math.floor(k.x), Math.floor(k.z))) { k.x -= k.vx * dt; k.z -= k.vz * dt; k.vx *= -.5; k.vz *= -.5; } if (k.y < .25) { k.y = .25; k.vy = Math.abs(k.vy) > 2 ? -k.vy * .35 : 0; k.vx *= .5; k.vz *= .5; } }
    const auto = k.kind === 'tooth' || k.kind === 'morb' || k.kind === 'heart';
    const d = Math.hypot(P.x - k.x, P.z - k.z);
    const mag = Lomme.has('tannspeil') ? 5.2 : 2.6;
    if (auto && P.alive && k.t > .35 && d < mag && (k.kind !== 'heart' || P.hp < P.maxHp)) { const s = (1 - d / mag) * 14 + 3; k.x += (P.x - k.x) / (d || 1) * s * dt; k.z += (P.z - k.z) / (d || 1) * s * dt; }
    k.mesh.position.set(k.x, k.y + Math.abs(Math.sin(k.t * 4)) * .08, k.z); k.mesh.userData.m.rotation.z = (k.kind === 'weapon' ? -1.1 : 0) + Math.sin(k.t * 3) * .12;
    if (auto && P.alive && k.t > .35 && d < .55 && (k.kind !== 'heart' || P.hp < P.maxHp)) {
      if (k.kind === 'tooth') { P.teeth += k.val || 1; Sound.play('tooth', .7, 1 + Math.random() * .2); }
      else if (k.kind === 'morb') { addMorb(3); Sound.play('morb', .6); }
      else if (k.kind === 'heart') { healPlayer(10); }
      R.remove(k.mesh); G.pickups.splice(i, 1);
    }
  }
}
function takePickup(k) {
  const P = G.player;
  if (k.kind === 'cons') {
    if (P.cons && P.cons.id !== k.val && P.cons.n > 0) dropPickup(P.x, P.z, 'cons', P.cons.id);
    if (P.cons && P.cons.id === k.val) P.cons.n = Math.min(3, P.cons.n + 1); else P.cons = { id: k.val, n: 1 };
    toast(CONSUMABLES[k.val].name, CONSUMABLES[k.val].desc); Sound.play('pickup');
  } else if (k.kind === 'weapon') {
    const old = P.weapon; P.weapon = k.val; P.weaponLvl = 0; P.doll.setWeapon(P.weapon);
    dropPickup(P.x, P.z, 'weapon', old); toast(WEAPONS[k.val].name, WEAPONS[k.val].desc); Sound.play('pickup');
  } else if (k.kind === 'card') { openLearn(k.val, 'Et kartotekkort fra gulvet'); }
  else if (k.kind === 'trinket') { Lomme.give(k.val); }
  R.remove(k.mesh); G.pickups.splice(G.pickups.indexOf(k), 1);
}

/* ---------- prosjektiler ---------- */
function addProj(o) {
  const p = Object.assign({ r: .22, life: 3, alive: true, y: .9 }, o);
  if (!p.mesh) {
    const P = p.type === 'syringe' ? weaponPart('sproyte') : p.type === 'hand' ? handPart() : p.type === 'pill' ? Art.part('pille', .3, .3, .15, .15, g => { A.cel(g, A.rr(-.12, -.05, .24, .1, .05), '#f4f0e6', { lw: .025, hi: false }); A.flat(g, A.rr(0, -.05, .12, .1, .05), '#b3261e', .025); }) : p.type === 'keys' ? Art.part('nokler_p', .4, .4, .2, .2, g => { A.flat(g, A.ell(0, 0, .1, .1), null, .04, '#d4b048'); A.line(g, [[.07, .07], [.16, .16]], .04, '#d4b048'); }) : p.type === 'eter' ? bottlePart('eter') : p.type === 'glob' ? Art.part('klyse', .5, .5, .25, .25, g => A.cel(g, A.blob([[-.18, 0], [0, -.16], [.2, -.04], [.12, .14], [-.1, .14]]), '#9fae3a', { lw: .035 })) : p.type === 'page' ? cardPart() : morbPart();
    p.mesh = propSprite(null, p.x, p.z, { P, shadow: false, y: p.y }); R.dyn.add(p.mesh);
    if (p.type === 'syringe' || p.type === 'hand') { const sx = Math.sin(Math.atan2(p.vx || 0, p.vz || 1)), sy = -Math.cos(Math.atan2(p.vx || 0, p.vz || 1)) * Math.sin(CAM_PITCH); p.mesh.userData.m.rotation.z = Math.atan2(-sx, sy); }
    if (p.glow) p.light = R.light(p.x, p.z, p.glow[1], p.glow[0], .8);
  }
  if (p.arc) { p.sx = p.x; p.sz = p.z; p.t = 0; }
  G.projectiles.push(p); return p;
}
function updateProjectiles(dt) {
  const P = G.player;
  for (let i = G.projectiles.length - 1; i >= 0; i--) {
    const p = G.projectiles[i];
    if (!p.alive) { R.remove(p.mesh); if (p.light) R.remove(p.light); G.projectiles.splice(i, 1); continue; }
    if (p.light) p.light.position.set(p.x, 0, p.z);
    p.life -= dt;
    if (p.arc) {
      p.t += dt / p.dur; const t = Math.min(1, p.t);
      p.x = lerp(p.sx, p.tx, t); p.z = lerp(p.sz, p.tz, t); p.y = .6 + Math.sin(t * Math.PI) * p.h;
      p.mesh.position.set(p.x, p.y, p.z); p.mesh.userData.m.rotation.z += dt * 10;
      if (t >= 1) { p.alive = false; p.land && p.land(p); }
      continue;
    }
    if (p.home > 0 && p.from === 'enemy' && P.alive) { p.home -= dt; const cur = Math.atan2(p.vx, p.vz), sp = Math.hypot(p.vx, p.vz), na = cur + angDiff(Math.atan2(P.x - p.x, P.z - p.z), cur) * Math.min(1, dt * 2.4); p.vx = Math.sin(na) * sp; p.vz = Math.cos(na) * sp; }
    const ox = p.x, oz = p.z; p.x += p.vx * dt; p.z += p.vz * dt;
    p.mesh.position.set(p.x, p.y, p.z); if (p.spin) p.mesh.userData.m.rotation.z += dt * p.spin;
    if (p.life <= 0 || solid(Math.floor(p.x), Math.floor(p.z))) { p.alive = false; Particles.spawn(ox, p.y, oz, 4, 0xdfeff0, { speed: 2, up: 2, life: .3 }); if (p.wallHit) p.wallHit(p); continue; }
    // papirvegger
    let blocked = false;
    for (const w of G.walls) {
      if (!w.alive) continue;
      const dx = p.x - w.x, dz = p.z - w.z, along = dx * Math.sin(w.a) + dz * Math.cos(w.a), side = dx * Math.cos(w.a) - dz * Math.sin(w.a);
      if (Math.abs(along) < .35 && Math.abs(side) < w.w / 2 && p.from === 'enemy') {
        blocked = true; Sound.play('paper'); Particles.spawn(p.x, p.y, p.z, 5, 0xefe4c4, { flat: true, speed: 3, g: 5, life: 1 });
        if (w.up === 'a') { p.from = 'player'; p.vx *= -1.3; p.vz *= -1.3; p.dmg *= 1.5; p.life = 2; numText(p.x, p.z, 'Returnert', 'info', 1.8); }
        else p.alive = false;
        break;
      }
    }
    if (blocked) continue;
    if (p.from === 'enemy') {
      const targets = [P, ...G.allies];
      for (const t of targets) if (t.alive && !t.flying && d2(p.x, p.z, t.x, t.z) < (p.r + t.r) ** 2) { hurt(t, p.dmg, { type: p.cause || 'oppasser', x: ox, z: oz, kb: 3 }); p.alive = false; break; }
    } else {
      const all = G.boss && G.boss.alive ? G.enemies.concat([G.boss]) : G.enemies;
      for (const e of all) if (e.alive && !(p.hitSet && p.hitSet.has(e)) && d2(p.x, p.z, e.x, e.z) < (p.r + e.r) ** 2) {
        if (p.onHit) { p.onHit(p, e); if (!p.pierce) { p.alive = false; break; } (p.hitSet || (p.hitSet = new Set())).add(e); }
        else { hurt(e, p.dmg, { from: 'player', x: ox, z: oz, kb: 4 }); p.alive = false; break; }
      }
    }
  }
}
