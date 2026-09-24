/* ============================================================
   GENERATOR  -  avdelingsgraf -> rommoduler -> korridorer -> innhold -> validering
   Ren data. Ingen Three.js her, så reglene kan testes uten bilde.
   ============================================================ */
const GEN = { C: 16, GW: 4, GH: 4 };
const T_VOID = 0, T_ROOM = 1, T_COR = 2;

function generateFloor(seed, depth, opts = {}) {
  const report = [];
  for (let attempt = 0; attempt < 60; attempt++) {
    const s = (seed + attempt * 7919) >>> 0;
    const F = buildFloor(s, depth, opts);
    const v = validateFloor(F);
    if (v.ok) { F.attempts = attempt + 1; F.rejected = report; return F; }
    report.push(s + ': ' + v.reasons.join(', '));
  }
  throw new Error('Generatoren fant ikke et gyldig kart. ' + report.slice(-3).join(' | '));
}

function buildFloor(seed, depth, opts) {
  const rng = new RNG(seed);
  const { C, GW, GH } = GEN, W = GW * C, H = GH * C;
  const F = { seed, depth, W, H, tiles: new Uint8Array(W * H), roomId: new Int16Array(W * H).fill(-1), block: new Uint8Array(W * H),
    rooms: [], edges: [], adj: [], startId: 0, bossId: -1, crack: [] };
  const cellMap = new Map(), key = (i, j) => i + ',' + j;
  const addRoom = (ci, cj) => { const r = { id: F.rooms.length, ci, cj, role: 'combat', props: [], waves: [], doors: [], spawns: [] }; F.rooms.push(r); F.adj.push([]); cellMap.set(key(ci, cj), r.id); return r; };
  const link = (a, b) => { F.edges.push([a, b]); F.adj[a].push(b); F.adj[b].push(a); };

  // 1) avdelingsgraf: vokser et tre fra startcellen
  const target = rng.int(11, 13) + (depth >= 2 ? 1 : 0);
  addRoom(rng.int(0, GW - 1), rng.int(0, GH - 1));
  let guard = 0;
  while (F.rooms.length < target && guard++ < 500) {
    const from = rng.pick(F.rooms);
    for (const [di, dj] of rng.shuffle([[1, 0], [-1, 0], [0, 1], [0, -1]])) {
      const ni = from.ci + di, nj = from.cj + dj;
      if (ni < 0 || nj < 0 || ni >= GW || nj >= GH || cellMap.has(key(ni, nj))) continue;
      link(from.id, addRoom(ni, nj).id); break;
    }
  }
  // 2) avstander og sjefsrom: det fjerneste bladet
  const dist = bfs(F, 0);
  const leaves = F.rooms.filter(r => r.id !== 0 && F.adj[r.id].length === 1);
  leaves.sort((a, b) => dist[b.id] - dist[a.id] || rng.next() - .5);
  F.bossId = leaves.length ? leaves[0].id : F.rooms.length - 1;
  // 3) sløyfer: ekstra kanter mellom naboceller, aldri via sjefsrommet
  const cands = [];
  for (const r of F.rooms) for (const [di, dj] of [[1, 0], [0, 1]]) {
    const o = cellMap.get(key(r.ci + di, r.cj + dj));
    if (o === undefined || F.adj[r.id].includes(o) || r.id === F.bossId || o === F.bossId) continue;
    cands.push([r.id, o]);
  }
  rng.shuffle(cands);
  const loops = Math.min(cands.length, rng.int(1, 2));
  for (let i = 0; i < loops; i++) link(cands[i][0], cands[i][1]);
  const D = bfs(F, 0); F.dist = D;

  // 4) roller
  F.rooms[0].role = 'start'; F.rooms[F.bossId].role = 'boss';
  const free = () => F.rooms.filter(r => r.role === 'combat');
  const freeLeaves = free().filter(r => F.adj[r.id].length === 1).sort((a, b) => D[b.id] - D[a.id]);
  if (freeLeaves[0]) freeLeaves[0].role = 'treasure';
  const riskPool = free().filter(r => F.adj[r.id].length === 1);
  const risk = riskPool.length ? riskPool[0] : rng.pick(free().filter(r => D[r.id] >= 2) || []);
  if (risk) risk.role = 'risk';
  const healer = rng.pick(['kafeteria', 'medisin']);
  const others = rng.shuffle(['kafeteria', 'medisin', 'vaktmester', 'bibliotek', 'vaskeri'].filter(s => s !== healer));
  const services = ['journal', healer, others[0], others[1]];
  const bossD = D[F.bossId];
  for (const s of services) {
    let pool = free().filter(r => D[r.id] >= 1 && D[r.id] < bossD);
    if (!pool.length) pool = free();
    if (free().length <= 3) break;
    const r = rng.pick(pool); r.role = 'service'; r.service = s;
  }
  // forbannet rom i en ledig blindvei, blodofferrom i et ledig rom et stykke inne
  const curseLeaf = free().filter(r => F.adj[r.id].length === 1 && D[r.id] >= 1);
  if (curseLeaf.length && free().length > 3 && rng.chance(depth >= 2 ? .6 : .35)) rng.pick(curseLeaf).role = 'cursed';
  const offerPool = free().filter(r => D[r.id] >= 2);
  if (offerPool.length && free().length > 3 && rng.chance(depth >= 2 ? .5 : .3)) rng.pick(offerPool).role = 'offer';
  // hemmelig rom: en tom celle ved siden av et vanlig rom, uten korridor i grafen
  const parents = rng.shuffle(F.rooms.filter(r => !['boss', 'start'].includes(r.role)).slice());
  let secret = null;
  for (const par of parents) {
    const dirs = rng.shuffle([[1, 0], [-1, 0], [0, 1], [0, -1]]).filter(([di, dj]) => { const ni = par.ci + di, nj = par.cj + dj; return ni >= 0 && nj >= 0 && ni < GW && nj < GH && !cellMap.has(key(ni, nj)); });
    if (dirs.length) { const [di, dj] = dirs[0]; secret = addRoom(par.ci + di, par.cj + dj); secret.role = 'secret'; secret.parent = par.id; break; }
  }

  // 5) rommoduler i cellene
  for (const r of F.rooms) {
    let w, h;
    if (r.role === 'boss') { w = 12; h = 12; }
    else if (r.role === 'start' || r.role === 'treasure') { w = rng.int(8, 10); h = rng.int(8, 9); }
    else if (r.role === 'secret') { w = rng.int(6, 7); h = rng.int(6, 7); }
    else if (r.role === 'service') { w = rng.int(9, 11); h = rng.int(8, 10); }
    else { w = rng.int(9, 12); h = rng.int(9, 12); }
    r.w = w; r.h = h;
    r.x = r.ci * C + rng.int(2, C - 2 - w); r.z = r.cj * C + rng.int(2, C - 2 - h);
    r.cx = r.x + Math.floor(w / 2); r.cz = r.z + Math.floor(h / 2);
    for (let z = r.z; z < r.z + h; z++) for (let x = r.x; x < r.x + w; x++) { F.tiles[z * W + x] = T_ROOM; F.roomId[z * W + x] = r.id; }
  }
  // 6) korridorer, tre ruter brede, L-formet via cellegrensen
  const carve = (x0, z0, x1, z1) => {
    const [ax, bx] = x0 < x1 ? [x0, x1] : [x1, x0], [az, bz] = z0 < z1 ? [z0, z1] : [z1, z0];
    for (let z = az - 1; z <= bz + 1; z++) for (let x = ax - 1; x <= bx + 1; x++) {
      if (x < 0 || z < 0 || x >= W || z >= H) continue;
      if (z0 === z1 && (z < z0 - 1 || z > z0 + 1)) continue;
      if (x0 === x1 && (x < x0 - 1 || x > x0 + 1)) continue;
      if (F.tiles[z * W + x] === T_VOID) F.tiles[z * W + x] = T_COR;
    }
  };
  for (const [ia, ib] of F.edges) {
    let a = F.rooms[ia], b = F.rooms[ib];
    if (a.ci === b.ci) { if (a.cj > b.cj) [a, b] = [b, a]; const mz = (a.cj + 1) * C; carve(a.cx, a.cz, a.cx, mz); carve(a.cx, mz, b.cx, mz); carve(b.cx, mz, b.cx, b.cz); }
    else { if (a.ci > b.ci) [a, b] = [b, a]; const mx = (a.ci + 1) * C; carve(a.cx, a.cz, mx, a.cz); carve(mx, a.cz, mx, b.cz); carve(mx, b.cz, b.cx, b.cz); }
  }
  if (secret) {
    const before = F.tiles.slice(); let a = F.rooms[secret.parent], b = secret;
    if (a.ci === b.ci) { if (a.cj > b.cj) [a, b] = [b, a]; const mz = (a.cj + 1) * C; carve(a.cx, a.cz, a.cx, mz); carve(a.cx, mz, b.cx, mz); carve(b.cx, mz, b.cx, b.cz); }
    else { if (a.ci > b.ci) [a, b] = [b, a]; const mx = (a.ci + 1) * C; carve(a.cx, a.cz, mx, a.cz); carve(mx, a.cz, mx, b.cz); carve(mx, b.cz, b.cx, b.cz); }
    const par = F.rooms[secret.parent];
    for (let z = par.z - 1; z <= par.z + par.h; z++) for (let x = par.x - 1; x <= par.x + par.w; x++) {
      const i = z * W + x; if (F.tiles[i] !== T_COR || before[i] !== T_VOID) continue;
      const inX = x >= par.x && x < par.x + par.w, inZ = z >= par.z && z < par.z + par.h;
      if ((inX && (z === par.z - 1 || z === par.z + par.h)) || (inZ && (x === par.x - 1 || x === par.x + par.w))) { F.crack.push(i); F.block[i] = 1; }
    }
  }
  // 7) dører: korridorruter som grenser til rommet
  for (const r of F.rooms) {
    for (let z = r.z - 1; z <= r.z + r.h; z++) for (let x = r.x - 1; x <= r.x + r.w; x++) {
      const i = z * W + x; if (F.tiles[i] !== T_COR) continue;
      const inX = x >= r.x && x < r.x + r.w, inZ = z >= r.z && z < r.z + r.h;
      if ((inX && (z === r.z - 1 || z === r.z + r.h)) || (inZ && (x === r.x - 1 || x === r.x + r.w))) r.doors.push(i);
    }
  }
  // 8) innhold
  const tmplByDepth = { 1: ['venterom', 'sovesal', 'kapell', 'arkiv', 'venterom'], 2: ['bad', 'behandling', 'bad', 'kapell', 'behandling'], 3: ['isolat', 'kartotek', 'isolat', 'arkiv', 'kartotek', 'kapell'], 4: ['kjeller', 'kapell', 'arkiv', 'kjeller', 'bad'] };
  for (const r of F.rooms) {
    if (r.role === 'combat' || r.role === 'risk') r.template = rng.pick(tmplByDepth[depth] || tmplByDepth[4]);
    else if (r.role === 'start') r.template = opts.startTemplate || 'eget';
    else if (r.role === 'service') r.template = r.service;
    else r.template = r.role;
    decorateRoom(F, r, rng);
    planWaves(F, r, rng, depth, opts);
  }
  return F;
}

function bfs(F, from) {
  const d = new Array(F.rooms.length).fill(Infinity); d[from] = 0; const q = [from];
  while (q.length) { const c = q.shift(); for (const n of F.adj[c]) if (d[n] === Infinity) { d[n] = d[c] + 1; q.push(n); } }
  return d;
}

/* Dekor: planlegger rekvisitter som data. Blokkerende rekvisitter settes i F.block. */
function decorateRoom(F, r, rng) {
  const W = F.W, reserved = new Set(), doorZone = new Set();
  const inRoom = (x, z) => x >= r.x && x < r.x + r.w && z >= r.z && z < r.z + r.h;
  for (const di of r.doors) { const dx = di % W, dz = (di / W) | 0; for (let z = dz - 2; z <= dz + 2; z++) for (let x = dx - 2; x <= dx + 2; x++) if (Math.abs(x - dx) + Math.abs(z - dz) <= 3) { reserved.add(z * W + x); doorZone.add(z * W + x); } }
  const keepCenter = !['service', 'treasure', 'start', 'offer', 'cursed', 'secret'].includes(r.role) || r.template === 'begravelse';
  if (keepCenter) for (let z = r.cz - 2; z <= r.cz + 2; z++) for (let x = r.cx - 2; x <= r.cx + 2; x++) reserved.add(z * W + x);
  const used = new Set();
  const ok = (x, z) => inRoom(x, z) && !reserved.has(z * W + x) && !used.has(z * W + x);
  const put = (k, x, z, rot = 0, opt = {}) => {
    const tiles = opt.tiles || [[0, 0]];
    for (const [ox, oz] of tiles) if (!ok(x + ox, z + oz)) return null;
    for (const [ox, oz] of tiles) { used.add((z + oz) * W + x + ox); if (opt.block !== false) F.block[(z + oz) * W + x + ox] = 1; }
    let px = x + .5, pz = z + .5;
    if (tiles.length > 1) { px = x + .5 + tiles.reduce((s, t) => s + t[0], 0) / tiles.length; pz = z + .5 + tiles.reduce((s, t) => s + t[1], 0) / tiles.length; }
    const xs = tiles.map(t => t[0]), zs = tiles.map(t => t[1]);
    const p = Object.assign({ k, x: px, z: pz, rot, fw: Math.max(...xs) - Math.min(...xs) + 1, fd: Math.max(...zs) - Math.min(...zs) + 1 }, opt.data || {}); r.props.push(p); return p;
  };
  const free = (k, n, opt = {}) => { let placed = 0, g = 0; while (placed < n && g++ < 60) { const x = rng.int(r.x + 1, r.x + r.w - 2), z = rng.int(r.z + 1, r.z + r.h - 2); if (put(k, x, z, rng.range(0, TAU), opt)) placed++; } };
  // langs veggene: rot peker inn i rommet
  const wallSlots = [];
  for (let x = r.x; x < r.x + r.w; x++) { wallSlots.push([x, r.z, 0, 0, 1]); wallSlots.push([x, r.z + r.h - 1, Math.PI, 0, -1]); }
  for (let z = r.z + 1; z < r.z + r.h - 1; z++) { wallSlots.push([r.x, z, Math.PI / 2, 1, 0]); wallSlots.push([r.x + r.w - 1, z, -Math.PI / 2, -1, 0]); }
  rng.shuffle(wallSlots);
  const along = (k, n, opt = {}) => {
    let placed = 0;
    for (const [x, z, rot, ix, iz] of wallSlots) {
      if (placed >= n) break;
      if (opt.side === 'top' && !(z === r.z && iz === 1)) continue;
      const tiles = opt.long ? [[0, 0], [ix, iz]] : [[0, 0]];
      if (put(k, x, z, rot, Object.assign({}, opt, { tiles }))) placed++;
    }
  };
  const ent = (k, n, opt = {}) => free(k, n, Object.assign({ block: false }, opt));
  const drains = n => ent('drain', n);
  const T = r.template;
  const topMid = () => [r.cx, r.z];
  switch (T) {
    case 'venterom': along('chair', rng.int(6, 10), { block: false, data: { brk: 1 } }); free('plant', 2); free('pillar', rng.int(0, 2)); ent('trolley', 1); ent('lamp', 1); drains(1); break;
    case 'sovesal': along('bed', rng.int(4, 6), { long: true }); ent('lamp', 2); ent('trolley', 1); drains(1); break;
    case 'kapell': {
      for (let row = 0; row < 2; row++) for (const side of [-1, 1]) { const z = r.z + 2 + row * 2, x = r.cx + side * 3; put('pew', x - 1, z, 0, { tiles: [[0, 0], [1, 0]] }); }
      put('altar', r.cx - 1, r.z, 0, { tiles: [[0, 0], [1, 0], [2, 0]] }); ent('candles', 3); ent('lamp', 1); drains(1); break;
    }
    case 'arkiv': along('cabinet', rng.int(6, 10), { data: { brk: 2 } }); ent('crate', rng.int(1, 3)); ent('trolley', 1); ent('lamp', 1); drains(1); break;
    case 'bad': along('tub', rng.int(3, 5), { long: true, data: { dark: F.depth >= 4 } }); ent('lamp', 2, { data: { faulty: rng.chance(.6) } }); ent('puddle', rng.int(2, 3)); drains(2); ent('trolley', 1); break;
    case 'behandling': along('gurney', rng.int(3, 5), { long: true }); ent('lamp', 2); ent('trolley', 2); along('cabinet', 2, { data: { brk: 2 } }); drains(1); break;
    case 'kjeller': ent('chain', rng.int(3, 6)); ent('crate', rng.int(2, 4)); free('pillar', 2); drains(3); ent('lamp', 1, { data: { faulty: true } }); ent('puddle', 1, { data: { kind: 'morb' } }); break;
    case 'isolat': {
      // polstrede celler langs veggene, madrasser og tvangstrøyer
      for (const [ox, oz] of [[1, 1], [r.w - 3, 1], [1, r.h - 3], [r.w - 3, r.h - 3]]) if (rng.chance(.7)) put('celle', r.x + ox, r.z + oz, 0, { tiles: [[0, 0], [1, 0], [0, 1], [1, 1]] });
      ent('madrass', rng.int(2, 3)); ent('tvangstroye', rng.int(1, 2)); drains(1); ent('lamp', 1, { data: { faulty: rng.chance(.5) } }); break;
    }
    case 'kartotek': {
      // rader med arkivhyller som danner smug, papirhauger på gulvet
      for (let z = r.z + 2; z < r.z + r.h - 2; z += 3) for (let x = r.x + 1; x < r.x + r.w - 3; x += 4) put('arkivhylle', x, z, 0, { tiles: [[0, 0], [1, 0], [2, 0]] });
      free('papirhaug', rng.int(3, 5), { data: { brk: 1 } }); ent('lamp', 1); ent('trolley', 1); drains(1); break;
    }
    case 'boss': {
      for (const [ox, oz] of [[2, 2], [r.w - 3, 2], [2, r.h - 3], [r.w - 3, r.h - 3]]) put('pillar', r.x + ox, r.z + oz);
      ent('chain', 4); drains(3); break;
    }
    case 'cursed': put('forbannet', r.cx, r.cz - 1, 0, { block: false }); ent('candles', 3); ent('chain', rng.int(2, 3)); ent('puddle', 2, { data: { kind: 'blod' } }); break;
    case 'offer': put('offeralter', r.cx - 1, r.cz, 0, { tiles: [[0, 0], [1, 0], [2, 0]] }); ent('candles', 4); ent('puddle', rng.int(2, 3), { data: { kind: 'blod' } }); drains(1); break;
    case 'secret': put('lore', r.cx + 1, r.cz + 1, 0, { block: false }); ent('crate', rng.int(2, 3)); ent('candles', 1); break;
    case 'treasure': put('chest', r.cx, r.cz, 0, { block: false, data: { chest: 'treasure' } }); put('lore', r.cx + 1, r.cz + 1, 0, { block: false }); ent('crate', 3); break;
    case 'kafeteria': {
      put('counter', r.cx - 2, r.z, 0, { tiles: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]], data: { len: 5, svc: 'kafeteria' } });
      r.props.push({ k: 'npc', x: r.cx + .5, z: r.z + 1.35, rot: 0, service: 'kafeteria' });
      for (const [ox, oz] of [[-3, 2], [3, 2], [-3, -2], [3, -2]]) if (ok(r.cx + ox, r.cz + oz)) put('table', r.cx + ox, r.cz + oz);
      ent('trolley', 1, { data: { soup: true } }); ent('chair', 3, { data: { brk: 1 } }); break;
    }
    case 'medisin': put('counter', r.cx - 1, r.z, 0, { tiles: [[0, 0], [1, 0], [2, 0]], data: { len: 3, svc: 'medisin' } }); r.props.push({ k: 'npc', x: r.cx + .5, z: r.z + 1.35, rot: 0, service: 'medisin' }); along('shelf', 3); ent('trolley', 1); ent('lamp', 1); break;
    case 'vaktmester': put('counter', r.cx - 1, r.z, 0, { tiles: [[0, 0], [1, 0], [2, 0]], data: { len: 3, svc: 'vaktmester' } }); r.props.push({ k: 'npc', x: r.cx + .5, z: r.z + 1.35, rot: 0, service: 'vaktmester' }); ent('crate', 3); along('cabinet', 2, { data: { brk: 2 } }); put('locker', r.x + r.w - 2, r.z, 0); break;
    case 'journal': put('journalskap', r.cx, r.z, 0, { data: { service: 'journal' } }); r.props.push({ k: 'npc', x: r.cx + .5, z: r.z + 1.4, rot: 0, service: 'journal', invisible: true }); along('cabinet', 5, { data: { brk: 2 } }); break;
    case 'bibliotek': along('shelf', 8); put('desk', r.cx, r.cz, 0); r.props.push({ k: 'npc', x: r.cx + .5, z: r.cz + 1.4, rot: Math.PI, service: 'bibliotek' }); break;
    case 'vaskeri': put('washer', r.cx - 1, r.z, 0, { tiles: [[0, 0], [1, 0]] }); r.props.push({ k: 'npc', x: r.cx, z: r.z + 1.5, rot: 0, service: 'vaskeri', invisible: true }); ent('basket', 4); ent('puddle', 1); break;
    // oppvåkningssteder
    case 'eget': put('bed', r.cx, r.z, 0, { tiles: [[0, 0], [0, 1]] }); put('wardrobe', r.x, r.z, Math.PI / 2); ent('lamp', 1); ent('chair', 1, { data: { brk: 1 } }); break;
    case 'likhus': along('gurney', 4, { long: true }); put('drawers', r.cx - 1, r.z, 0, { tiles: [[0, 0], [1, 0], [2, 0]] }); ent('lamp', 1); drains(1); break;
    case 'toalett': for (let i = 0; i < 4; i++) put('toilet', r.x + 1 + i * 2, r.z, 0); drains(2); ent('puddle', 1); break;
    case 'soppel': ent('garbage', 6); ent('crate', 2); drains(1); break;
    case 'vask': ent('basket', 5); put('chute', r.cx, r.z, 0); ent('puddle', 1); break;
    case 'operasjon': put('optable', r.cx, r.cz, 0, { tiles: [[0, 0], [0, 1]] }); ent('lamp', 2); ent('trolley', 1); break;
    case 'begravelse': put('coffin', r.cx, r.z + 2, 0, { tiles: [[0, 0], [0, 1]] }); for (const s of [-3, 3]) put('pew', r.cx + s - 1, r.cz + 1, 0, { tiles: [[0, 0], [1, 0]] }); ent('candles', 3); break;
  }
  // gyteplasser
  const sp = [];
  for (let g = 0; g < 80 && sp.length < 10; g++) {
    const x = rng.int(r.x + 1, r.x + r.w - 2), z = rng.int(r.z + 1, r.z + r.h - 2);
    if (F.block[z * W + x] || doorZone.has(z * W + x)) continue;
    sp.push([x + .5, z + .5]);
  }
  for (const p of r.props) if (p.k === 'drain') sp.unshift([p.x, p.z]);
  r.spawns = sp;
}

/* Fiendebølger planlegges ved generering, så samme seed gir samme etasje */
function planWaves(F, r, rng, depth, opts) {
  if (!['combat', 'risk', 'start', 'cursed'].includes(r.role)) return;
  if (r.role === 'start' && !opts.startCombat) return;
  const pool = DEPTH_ENEMIES[depth] || DEPTH_ENEMIES[4];
  const bias = { kapell: 'kultist', bad: 'yngel', behandling: 'oppasser', sovesal: 'pleier', kjeller: 'yngel', isolat: 'tvang', kartotek: 'byrakrat' }[r.template];
  const d = F.dist ? F.dist[r.id] : 2;
  const nWaves = r.role === 'risk' ? 2 : r.role === 'start' || r.role === 'cursed' ? 1 : (d >= 3 && rng.chance(.55) ? 2 : 1) + (depth >= 3 && rng.chance(.3) ? 1 : 0);
  for (let w = 0; w < nWaves; w++) {
    const n = r.role === 'start' ? 2 : 2 + [0, 0, 1, 2, 2][Math.min(4, depth)] + rng.int(0, 2) + (d >= 4 ? 1 : 0) + (depth >= 4 && rng.chance(.4) ? 1 : 0);
    const wave = [];
    for (let i = 0; i < n; i++) {
      let t = bias && rng.chance(.35) ? bias : rng.pick(pool);
      if (depth === 1 && t === 'yngel') t = 'pleier';
      wave.push({ t, elite: (r.role === 'risk' && i < 1 + w) || (r.role === 'cursed' && i < 2) });
    }
    if (opts.extraPleier && depth === opts.startDepth && r.role === 'combat') wave.push({ t: 'pleier' });
    r.waves.push(wave);
  }
}

/* Validering: avviser kart som bryter kravene i designdokumentet */
function validateFloor(F) {
  const reasons = [], W = F.W;
  const boss = F.rooms[F.bossId];
  if (!boss) reasons.push('mangler sjefsrom');
  else {
    if (F.adj[F.bossId].length !== 1) reasons.push('sjefsrommet er ikke en blindvei');
    if (F.dist[F.bossId] < 3) reasons.push('sjefsrommet ligger for nær start');
  }
  if (F.edges.length < F.rooms.filter(r => r.role !== 'secret').length) reasons.push('ingen sløyfe');
  const svc = F.rooms.filter(r => r.role === 'service').map(r => r.service);
  if (!svc.includes('journal')) reasons.push('mangler journalskap');
  if (!svc.includes('kafeteria') && !svc.includes('medisin')) reasons.push('ingen helbredelse før sjefen');
  if (F.rooms.filter(r => r.role === 'combat' || r.role === 'risk').length < 3) reasons.push('for få møter');
  if (!F.rooms.some(r => r.role === 'risk')) reasons.push('ingen frivillig risiko');
  // flytfyll med rekvisitter: alle dører og romsentre må kunne nås fra start
  const s = F.rooms[0], seen = new Uint8Array(W * F.H), q = [s.cz * W + s.cx]; seen[q[0]] = 1;
  while (q.length) {
    const i = q.pop(), x = i % W, z = (i / W) | 0;
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, nz = z + dz; if (nx < 0 || nz < 0 || nx >= W || nz >= F.H) continue;
      const j = nz * W + nx; if (seen[j] || !F.tiles[j] || F.block[j]) continue; seen[j] = 1; q.push(j);
    }
  }
  const crack = new Set(F.crack || []);
  for (const r of F.rooms) { if (r.role === 'secret') { if (seen[r.cz * W + r.cx]) reasons.push('hemmelig rom kan nås uten å knuse veggen'); continue; } for (const d of r.doors) if (!seen[d] && !crack.has(d)) { reasons.push('dør i rom ' + r.id + ' er stengt av møbler'); break; } }
  if (F.rooms.some(r => r.role === 'secret') && !(F.crack || []).length) reasons.push('hemmelig rom uten sprukken vegg');
  if (boss && !seen[boss.cz * W + boss.cx]) reasons.push('sjefsrommet kan ikke nås');
  return { ok: reasons.length === 0, reasons };
}
