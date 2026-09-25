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
  // 5b) former: noen vanlige rom får L-form eller avskårne hjørner (rotunde). Midten og rommet med den hemmelige døra røres ikke.
  for (const r of F.rooms) {
    if (!['combat', 'risk'].includes(r.role) || r.w < 10 || r.h < 10 || (secret && secret.parent === r.id)) continue;
    const k = rng.next(), tom = (x, z) => { const i = z * W + x; F.tiles[i] = T_VOID; F.roomId[i] = -1; };
    if (k < .24) {
      const cw = rng.int(3, Math.floor(r.w / 2) - 1), ch = rng.int(3, Math.floor(r.h / 2) - 1), vx = rng.chance(.5), vz = rng.chance(.5);
      const x0 = vx ? r.x : r.x + r.w - cw, z0 = vz ? r.z : r.z + r.h - ch;
      for (let z = z0; z < z0 + ch; z++) for (let x = x0; x < x0 + cw; x++) tom(x, z);
      r.form = 'L';
    } else if (k < .4) {
      const c = rng.int(2, 3);
      for (let d = 0; d < c; d++) for (let e = 0; e < c - d; e++) { tom(r.x + e, r.z + d); tom(r.x + r.w - 1 - e, r.z + d); tom(r.x + e, r.z + r.h - 1 - d); tom(r.x + r.w - 1 - e, r.z + r.h - 1 - d); }
      r.form = 'rund';
    }
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
      if (x < 0 || z < 0 || x >= W || z >= H) continue;
      const i = z * W + x; if (F.tiles[i] !== T_COR) continue;
      if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => { const nx = x + dx, nz = z + dz; return nx >= 0 && nz >= 0 && nx < W && nz < H && F.roomId[nz * W + nx] === r.id; })) r.doors.push(i);
    }
  }
  // 8) innhold
  // etasjen skal leve opp til navnet: Isolat og arkiv får alltid minst ett isolat eller kartotek
  const kamp = F.rooms.filter(r => r.role === 'combat' || r.role === 'risk'), sist = kamp[kamp.length - 1], tema = { 4: ['isolat', 'kartotek'] }[depth];
  const sekk = [], trekk = () => { if (!sekk.length) sekk.push(...rng.shuffle((ROMTYPER[depth] || ROMTYPER[6]).slice())); return sekk.pop(); };
  let harTema = false;
  F.ute = !!(typeof THEMES === 'object' && THEMES[depth] && THEMES[depth].ute);
  F.korridor = F.ute ? (depth === 5 ? { gulv: 'sti', vegg: 'skog' } : { gulv: 'grus', vegg: 'hekk' }) : { gulv: 'planker', vegg: 'panel' };
  for (const r of F.rooms) {
    if (r.role === 'combat' || r.role === 'risk') { r.template = trekk(); if (tema) { if (tema.includes(r.template)) harTema = true; else if (r === sist && !harTema) r.template = tema[0]; } }
    else if (r.role === 'start') r.template = opts.startTemplate || 'eget';
    else if (r.role === 'service') r.template = r.service;
    else r.template = r.role;
    romStil(F, r);
    decorateRoom(F, r, rng);
    planWaves(F, r, rng, depth, opts);
  }
  // været: ute i parken og skogen, og i gårdsrommene i inneetasjene
  F.vaer = F.ute ? rng.pick(depth === 5 ? ['sno', 'ildfluer', 'taake', 'ildfluer'] : ['regn', 'regn', 'sno', 'taake', 'klart']) : F.rooms.some(r => r.ute) ? rng.pick(['regn', 'regn', 'klart']) : null;
  return F;
}

/* Romtyper for kamprom i hver etasje. Parken og Nattskogen er ute; de andre har et par uterom hver. */
const ROMTYPER = {
  1: ['hage', 'lysthus', 'kirkegard', 'fontene', 'isdam', 'liggehall', 'gardsplass', 'hage', 'drivhus'],
  2: ['venterom', 'sovesal', 'kapell', 'arkiv', 'spisesal', 'dagligstue', 'gardsrom', 'frisor', 'direktor', 'venterom'],
  3: ['bad', 'behandling', 'kapell', 'elektro', 'tannlege', 'lysgard', 'rontgen', 'kjokken', 'bad'],
  4: ['isolat', 'kartotek', 'isolat', 'arkiv', 'kartotek', 'kapell', 'fyrrom', 'likkapell'],
  5: ['bjorkeskog', 'lysning', 'myr', 'tjern', 'bjorkeskog', 'ruin', 'koie', 'lysning'],
  6: ['kjeller', 'kapell', 'arkiv', 'kjeller', 'bad', 'likkapell', 'fyrrom']
};
/* gulv, vegg og om rommet er ute (1). Maling og vegger står i 17_romtyper.js. */
const ROMSTIL = {
  venterom: ['sjakk', 'panel'], sovesal: ['tre', 'tapet'], kapell: ['teppe', 'stein'], arkiv: ['parkett', 'panel'], bad: ['sekskant', 'fliser'],
  behandling: ['linoleum', 'fliser'], kjeller: ['stein', 'mur'], isolat: ['linoleum', 'polstret'], kartotek: ['parkett', 'panel'],
  spisesal: ['tre', 'panel'], dagligstue: ['teppe', 'tapet'], elektro: ['linoleum', 'fliser'], tannlege: ['sjakk', 'fliser'], fyrrom: ['stein', 'mur'],
  kjokken: ['fliser', 'fliser'], likkapell: ['betong', 'stein'], direktor: ['parkett', 'tapet'], rontgen: ['linoleum', 'fliser'], frisor: ['sjakk', 'fliser'],
  kafeteria: ['sjakk', 'panel'], medisin: ['linoleum', 'fliser'], vaktmester: ['betong', 'tre'], journal: ['parkett', 'panel'], bibliotek: ['tre', 'tapet'], vaskeri: ['fliser', 'fliser'],
  eget: ['tre', 'tapet'], likhus: ['betong', 'fliser'], toalett: ['sekskant', 'fliser'], soppel: ['betong', 'mur'], vask: ['betong', 'fliser'], operasjon: ['fliser', 'fliser'], vaktbod: ['tre', 'tre'], begravelse: ['teppe', 'stein'],
  boss: ['sjakk', 'panel'], treasure: ['parkett', 'tapet'], secret: ['stein', 'mur'], cursed: ['stein', 'stein'], offer: ['stein', 'stein'],
  gardsrom: ['brostein', 'mur', 1], lysgard: ['stein', 'mur', 1], drivhus: ['jord', 'glass', 1],
  hage: ['gress', 'hekk', 1], lysthus: ['gress', 'hekk', 1], kirkegard: ['gress', 'steinmur', 1], fontene: ['grus', 'hekk', 1], isdam: ['is', 'hekk', 1], liggehall: ['tre', 'gjerde', 1], gardsplass: ['grus', 'steinmur', 1],
  bjorkeskog: ['mose', 'skog', 1], lysning: ['gress', 'skog', 1], myr: ['myr', 'skog', 1], tjern: ['mose', 'skog', 1], ruin: ['stein', 'ruin', 1], koie: ['tre', 'tommer']
};
function romStil(F, r) {
  let st = ROMSTIL[r.template] || ['sjakk', 'panel'];
  // ute-etasjene: sjefen venter ute, og alt som ikke er kamprom, ligger i små paviljonger (i skogen: koier)
  if (F.ute && r.role === 'boss') st = F.depth === 5 ? ['gress', 'skog', 1] : ['grus', 'hekk', 1];
  else if (F.ute && !st[2] && r.template !== 'koie') st = F.depth === 5 ? ['tre', 'tommer'] : [st[0], 'paviljong'];
  r.gulv = st[0]; r.vegg = st[1]; r.ute = !!st[2];
}

function bfs(F, from) {
  const d = new Array(F.rooms.length).fill(Infinity); d[from] = 0; const q = [from];
  while (q.length) { const c = q.shift(); for (const n of F.adj[c]) if (d[n] === Infinity) { d[n] = d[c] + 1; q.push(n); } }
  return d;
}

/* Dekor: planlegger rekvisitter som data. Blokkerende rekvisitter settes i F.block. */
function decorateRoom(F, r, rng) {
  const W = F.W, reserved = new Set(), doorZone = new Set();
  const inRoom = (x, z) => x >= r.x && x < r.x + r.w && z >= r.z && z < r.z + r.h && F.roomId[z * W + x] === r.id;
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
  /* hovedrekvisitten i et tjenesterom: prøver fra midten av overveggen og utover (en dør i veggen skal ikke stoppe den),
     så nederst. row 1 = disk på rad to med personalet bak, mot veggen; row 0 = rett mot veggen, samhandling foran. */
  const desk = (k, len, svc, o = {}) => {
    const row0 = o.row ?? 1, xs = [];
    for (let d = 0; d < r.w; d++) for (const s of d ? [-1, 1] : [1]) { const x = Math.floor(r.cx - len / 2 + .5) + s * d; if (x >= r.x && x + len <= r.x + r.w && !xs.includes(x)) xs.push(x); }
    const rows = [[r.z + row0, r.z + row0 - .45, r.z + row0 + 1.35], [r.z + row0 + 1, r.z + row0 + .55, r.z + row0 + 2.35], [r.z + r.h - 1 - row0, r.z + r.h - row0 + .55, r.z + r.h - 1 - row0 - .4]];
    for (let L = len; L >= (o.min || Math.min(len, 2)); L--) for (const [z, behind, front] of rows) for (const x0 of xs) {
      const x = Math.min(x0, r.x + r.w - L), p = put(k, x, z, 0, { tiles: Array.from({ length: L }, (_, i) => [i, 0]), data: Object.assign({ len: L, svc, service: svc }, o.data || {}) });
      if (!p) continue;
      r.props.push({ k: 'npc', x: x + L / 2, z: o.invisible || !row0 ? front : behind, rot: 0, service: svc, invisible: !!o.invisible });
      r.desk = true; return p;
    }
    return null;
  };
  const drains = n => { if (!r.ute) ent('drain', n); };
  // store ting: helst inntil den øvre veggen fra midten og utover, ellers raden under, så nede, og til slutt et ledig sted inne i rommet
  const topp = (k, len, opt = {}) => {
    const tiles = opt.tiles || Array.from({ length: len }, (_, i) => [i, 0]), tw = Math.max(...tiles.map(t => t[0])) + 1, th = Math.max(...tiles.map(t => t[1])) + 1, o = Object.assign({}, opt, { tiles });
    for (const z of [r.z, r.z + 1, r.z + r.h - th, r.z + r.h - th - 1]) for (let d = 0; d < r.w; d++) for (const sgn of d ? [-1, 1] : [1]) { const x = Math.floor(r.cx - tw / 2 + .5) + sgn * d; if (put(k, x, z, 0, o)) return true; }
    for (let g = 0; g < 60; g++) if (put(k, rng.int(r.x + 1, Math.max(r.x + 1, r.x + r.w - 1 - tw)), rng.int(r.z + 1, Math.max(r.z + 1, r.z + r.h - 1 - th)), 0, o)) return true;
    return false;
  };
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
    case 'bad': along('tub', rng.int(3, 5), { long: true, data: { dark: F.depth >= 6 } }); ent('lamp', 2, { data: { faulty: rng.chance(.6) } }); ent('puddle', rng.int(2, 3)); drains(2); ent('trolley', 1); break;
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
    // tjenesterom: hovedrekvisitten (disk, vaskemaskin, journalskap) langs overveggen med personalet bak
    case 'kafeteria': {
      desk('counter', r.w >= 10 ? 5 : 4, 'kafeteria', { min: 3 });
      for (const [ox, oz] of [[-3, 2], [3, 2], [-3, -1], [3, -1]]) if (put('table', r.cx + ox, r.cz + oz)) { for (const [cx, cz, rot] of [[-1, 0, Math.PI / 2], [1, 0, -Math.PI / 2]]) put('chair', r.cx + ox + cx, r.cz + oz + cz, rot, { block: false, data: { brk: 1 } }); }
      ent('menytavle', 1); ent('trolley', 1, { data: { soup: true } }); ent('botte', 1); break;
    }
    case 'medisin': desk('counter', 3, 'medisin'); along('medisinskap', 3); ent('vekt', 1); along('bed', 1, { long: true }); ent('trolley', 1); ent('lamp', 1); break;
    case 'vaktmester': desk('counter', 3, 'vaktmester'); along('verktoytavle', 2, { long: true }); put('locker', r.x + r.w - 2, r.z, 0); ent('botte', 2); ent('crate', 2, { data: { brk: 2 } }); break;
    case 'journal': desk('journalskap', 1, 'journal', { row: 0, invisible: true }); along('cabinet', 5, { data: { brk: 2 } }); ent('candles', 2); ent('papirhaug', 2, { block: true, data: { brk: 1 } }); break;
    case 'bibliotek': {
      along('shelf', 8);
      for (let dz = -1; dz < 3 && !r.desk; dz++) for (const dx of [0, -2, 2, -3, 3]) { if (put('desk', r.cx - 1 + dx, r.cz + dz, 0, { tiles: [[0, 0], [1, 0]] })) { r.props.push({ k: 'npc', x: r.cx + dx, z: r.cz + dz - .45, rot: 0, service: 'bibliotek' }); r.desk = true; break; } }
      if (!r.desk) desk('desk', 2, 'bibliotek');
      ent('lesestol', 2); ent('bokstabel', 3, { block: true, data: { brk: 1 } }); ent('lamp', 1); break;
    }
    case 'vaskeri': desk('washer', r.w >= 10 ? 3 : 2, 'vaskeri', { row: 0, invisible: true }); ent('basket', 3); ent('linhaug', 2, { block: true, data: { brk: 1 } }); free('torkesnor', 1, { tiles: [[0, 0], [1, 0], [2, 0]], block: false }); ent('strykebrett', 1); ent('botte', 1); ent('puddle', 2); break;
    // oppvåkningssteder
    case 'eget': put('bed', r.cx, r.z, 0, { tiles: [[0, 0], [0, 1]] }); put('wardrobe', r.x, r.z, Math.PI / 2); ent('lamp', 1); ent('chair', 1, { data: { brk: 1 } }); break;
    case 'likhus': along('gurney', 4, { long: true }); put('drawers', r.cx - 1, r.z, 0, { tiles: [[0, 0], [1, 0], [2, 0]] }); ent('lamp', 1); drains(1); break;
    case 'toalett': for (let i = 0; i < 4; i++) put('toilet', r.x + 1 + i * 2, r.z, 0); drains(2); ent('puddle', 1); break;
    case 'soppel': ent('garbage', 6); ent('crate', 2); drains(1); break;
    case 'vask': ent('basket', 5); put('chute', r.cx, r.z, 0); ent('puddle', 1); break;
    case 'operasjon': put('optable', r.cx, r.cz, 0, { tiles: [[0, 0], [0, 1]] }); ent('lamp', 2); ent('trolley', 1); break;
    case 'vaktbod': along('verktoytavle', 2, { long: true }); put('locker', r.x + r.w - 2, r.z, 0); ent('botte', 2); ent('crate', 3, { data: { brk: 2 } }); drains(1); break;
    case 'begravelse': put('coffin', r.cx, r.z + 2, 0, { tiles: [[0, 0], [0, 1]] }); for (const s of [-3, 3]) put('pew', r.cx + s - 1, r.cz + 1, 0, { tiles: [[0, 0], [1, 0]] }); ent('candles', 3); break;
    // ---------- nye rom inne ----------
    case 'spisesal': {
      for (let z = r.z + 2; z < r.z + r.h - 2; z += 4) for (const x0 of [r.x + 1, r.x + r.w - 5]) if (put('langbord', x0, z, 0, { tiles: [[0, 0], [1, 0], [2, 0], [3, 0]] })) for (let i = 0; i < 4; i++) { put('chair', x0 + i, z - 1, 0, { block: false, data: { brk: 1 } }); put('chair', x0 + i, z + 1, Math.PI, { block: false, data: { brk: 1 } }); }
      ent('menytavle', 1); ent('trolley', 1, { data: { soup: true } }); drains(1); break;
    }
    case 'dagligstue': topp('piano', 2); along('grammofon', 1); free('lenestol', rng.int(2, 4)); free('kortbord', 1); free('plant', 2); ent('lamp', 1); break;
    case 'elektro': along('elektrostol', rng.int(2, 3)); free('spole', 2); along('cabinet', 2, { data: { brk: 2 } }); ent('lamp', 1, { data: { faulty: true } }); ent('puddle', 1); drains(1); break;
    case 'tannlege': free('tannlegestol', 1); ent('instrumentbord', 2); ent('spyttkum', 1); ent('tannglass', 2); along('cabinet', 2, { data: { brk: 2 } }); ent('lamp', 1); drains(1); break;
    case 'rontgen': topp('rontgen', 2); along('lysskjerm', 2); along('gurney', 1, { long: true }); ent('lamp', 1, { data: { faulty: rng.chance(.5) } }); drains(1); break;
    case 'frisor': for (let i = 0; i < 3; i++) along('frisorstol', 1, { side: 'top' }); ent('harhaug', rng.int(3, 5)); ent('botte', 1); ent('lamp', 1); drains(1); break;
    case 'direktor': free('desk', 1, { tiles: [[0, 0], [1, 0]] }); along('shelf', 4); free('bjorn', 1); ent('globus', 1); free('lenestol', 2); ent('lamp', 1); break;
    case 'kjokken': topp('komfyr', 2); along('komfyr', 1); free('gryte', 1); along('kjottkrok', rng.int(2, 4)); free('table', 1); ent('botte', 2); ent('puddle', 2, { data: { kind: 'blod' } }); drains(2); break;
    case 'fyrrom': topp('kjele', 2, { data: { glo: true } }); free('kullhaug', rng.int(2, 3), { data: { brk: 2 } }); along('ror', rng.int(3, 5), { block: false }); ent('crate', 2); ent('lamp', 1, { data: { faulty: true } }); drains(2); break;
    case 'likkapell': for (const s of [-2, 2]) put('coffin', r.cx + s, r.z + 2, 0, { tiles: [[0, 0], [0, 1]] }); topp('kors', 1); for (const s of [-3, 3]) put('pew', r.cx + s - 1, r.cz + 2, 0, { tiles: [[0, 0], [1, 0]] }); ent('candles', 4); drains(1); break;
    // ---------- uterom i inneetasjene ----------
    case 'gardsrom': free('bronn', 1, { tiles: [[0, 0], [1, 0]] }); free('tre', rng.int(1, 2)); free('pew', 1, { tiles: [[0, 0], [1, 0]] }); ent('lyktestolpe', 2); ent('puddle', 2); break;
    case 'lysgard': along('ror', 3, { block: false }); ent('botte', 2); free('plant', 3); ent('lyktestolpe', 1); ent('puddle', 3); break;
    case 'drivhus': for (let i = 0; i < 4; i++) free('plantebord', 1, { tiles: [[0, 0], [1, 0]] }); free('kjempeplante', 1); ent('vannkanne', 2); free('plant', 3); ent('lamp', 1); break;
    // ---------- parken ----------
    case 'hage': free('busk', rng.int(3, 5)); free('blomsterbed', 2, { tiles: [[0, 0], [1, 0]] }); ent('hagenisse', rng.int(1, 3)); free('fuglebad', 1); ent('lyktestolpe', 2); free('pew', 1, { tiles: [[0, 0], [1, 0]] }); break;
    case 'lysthus': topp('lysthus', 3, { tiles: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]] }); free('busk', 3); free('pew', 2, { tiles: [[0, 0], [1, 0]] }); ent('lyktestolpe', 2); break;
    case 'kirkegard': {
      for (let z = r.z + 1; z < r.z + r.h - 1; z += 3) for (let x = r.x + 1; x < r.x + r.w - 1; x += 2) if (rng.chance(.55)) put('gravstein', x, z, 0, { data: { navn: rng.int(0, 99) } });
      free('engel', 1); ent('kors', 2); free('tre', 1); ent('grav', 1, { data: { apen: true } }); ent('candles', 2); break;
    }
    case 'fontene': put('fontene', r.cx - 1, r.cz - 3, 0, { tiles: [[0, 0], [1, 0], [0, 1], [1, 1]] }) || free('fontene', 1, { tiles: [[0, 0], [1, 0], [0, 1], [1, 1]] }); free('pew', 2, { tiles: [[0, 0], [1, 0]] }); free('statue', 2); ent('lyktestolpe', 2); ent('puddle', 2); break;
    case 'isdam': ent('siv', rng.int(4, 6)); free('snomann', 1); ent('vak', rng.int(1, 2)); free('pew', 1, { tiles: [[0, 0], [1, 0]] }); ent('lyktestolpe', 1); break;
    case 'liggehall': for (let i = 0; i < 6; i++) along('liggestol', 1, { side: 'top', long: false }); ent('teppe', 2); ent('lamp', 1); break;
    case 'gardsplass': free('bronn', 1, { tiles: [[0, 0], [1, 0]] }); free('kjerre', 1, { tiles: [[0, 0], [1, 0]] }); along('vedstabel', 2, { long: true }); free('tre', 1); ent('lyktestolpe', 2); break;
    // ---------- Nattskogen ----------
    case 'bjorkeskog': free('bjork', rng.int(6, 10)); ent('stubbe', 2); ent('sopp', rng.int(2, 4)); free('stein', 2); break;
    case 'lysning': put('baal', r.cx, r.cz - 3, 0) || free('baal', 1); free('stubbe', 3); along('vedstabel', 1, { long: true }); free('bjork', 3); ent('sopp', 2); break;
    case 'myr': ent('siv', rng.int(5, 8)); free('bjork', 2, { data: { dod: true } }); ent('puddle', rng.int(3, 4), { data: { kind: 'myr' } }); free('stein', 1); break;
    case 'tjern': { const vann = { k: 'puddle', kind: 'tjern', x: r.cx + .5, z: r.cz + .5, r: Math.min(r.w, r.h) * .26 }; r.props.push(vann); ent('siv', rng.int(5, 7)); free('robat', 1, { tiles: [[0, 0], [1, 0]] }); free('bjork', 2); break; }
    case 'ruin': along('ruinmur', rng.int(3, 5), { long: true }); free('pillar', 2); topp('kors', 1); ent('candles', 2); ent('sopp', 2); break;
    case 'koie': topp('vedovn', 1, { data: { glo: true } }); along('koiesong', 1, { long: true }); free('table', 1); ent('chair', 2, { data: { brk: 1 } }); topp('gevir', 1); ent('lamp', 1); break;
  }
  // sjefen ute: busker eller bjørker i hjørnene i stedet for søyler
  if (T === 'boss' && r.ute) { for (const p of r.props) if (p.k === 'pillar') p.k = F.depth === 5 ? 'bjork' : 'busk'; r.props = r.props.filter(p => p.k !== 'chain'); }
  // gyteplasser
  const sp = [];
  for (let g = 0; g < 80 && sp.length < 10; g++) {
    const x = rng.int(r.x + 1, r.x + r.w - 2), z = rng.int(r.z + 1, r.z + r.h - 2);
    if (F.block[z * W + x] || doorZone.has(z * W + x) || F.roomId[z * W + x] !== r.id) continue;
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
  const bias = { kapell: 'kultist', bad: 'yngel', behandling: 'oppasser', sovesal: 'pleier', kjeller: 'yngel', isolat: 'tvang', kartotek: 'byrakrat',
    spisesal: 'pleier', dagligstue: 'kasteren', elektro: 'oppasser', tannlege: 'oppasser', kjokken: 'svulst', fyrrom: 'yngel', likkapell: 'kultist', frisor: 'tvang',
    liggehall: 'trille', kirkegard: 'kultist', hage: 'pleier', isdam: 'trille', myr: 'yngel', tjern: 'yngel', ruin: 'kultist' }[r.template];
  const d = F.dist ? F.dist[r.id] : 2, eff = Math.round(typeof dybdeStyrke === 'function' ? dybdeStyrke(depth) : depth);
  const nWaves = r.role === 'risk' ? 2 : r.role === 'start' || r.role === 'cursed' ? 1 : (d >= 3 && rng.chance(.55) ? 2 : 1) + (eff >= 3 && rng.chance(.3) ? 1 : 0);
  for (let w = 0; w < nWaves; w++) {
    const n = r.role === 'start' ? 2 : 2 + [0, 0, 1, 2, 2][Math.min(4, eff)] + rng.int(0, 2) + (d >= 4 ? 1 : 0) + (eff >= 4 && rng.chance(.4) ? 1 : 0);
    const wave = [];
    for (let i = 0; i < n; i++) {
      let t = bias && rng.chance(.35) ? bias : rng.pick(pool);
      if (depth <= 2 && t === 'yngel') t = 'pleier';
      if (typeof ENEMIES === 'object' && !ENEMIES[t]) t = rng.pick(pool);
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
  for (const r of F.rooms) if (r.role === 'service' && !r.desk) reasons.push('tjenesterommet ' + r.service + ' fikk ikke plass til disken');
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
