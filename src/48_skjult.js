/* ============================================================
   DET SKJULTE  -  det hemmelige rommet finnes ikke før man bryter seg inn
   Hint (trekk, lyd, banking) og innbruddet med støv og lys. Spor B fyller fila i runde 5.
   Generatoren merker gangen, sprekken og rommet i F.skjult, og G.skjult er den samme masken så lenge veggen står (null etterpå).
   Paint.level bygger etasjen lukket: sprekken er vanlig vegg, og gulvet og veggene bak står ferdige, men skjult (del 'aapen').
   Her gjemmes innholdet (møbler, lys, gløden og glasset), og når veggen faller, byttes det lukkede mot det åpne og lysene tennes.
   ============================================================ */
const Skjult = {
  props: [], pd: [], lys: [], tenn: null,
  /* rommets egne ting (fra spawnProps): usynlige, med lyset slukket og uten glød til veggen er slått inn */
  gjemTing() {
    this.props = []; this.pd = []; this.lys = []; this.tenn = null;
    const F = G.F, S = G.skjult; if (!F || !S) return;
    const hemm = F.rooms.find(r => r.role === 'secret'); if (!hemm) return;
    for (const o of G.props) if (o.room === hemm.id) { o.skjult = true; if (o.g) o.g.visible = false; if (o.light) this.slukk(o.light); this.props.push(o); }
    // fyllyset fra decorateLevel står slukket fra før (userData.skjult)
    if (R.levelL) for (const L of R.levelL.children) if (L.userData.skjult && !this.lys.includes(L)) this.lys.push(L);
    if (typeof Glod === 'object') for (let i = Glod.liste.length - 1; i >= 0; i--) { const E = Glod.liste[i]; if (E.eier && E.eier.skjult) { Glod.fjern(E); Glod.liste.splice(i, 1); } }
  },
  slukk(L) { if (!L || !L.userData || !L.userData.col) return; R.setLight(L, 0); if (!this.lys.includes(L)) this.lys.push(L); },
  /* preparatglasset eller kuriositeten i rommet (Items.onFloor) */
  gjem(pd) { if (!pd || !G.skjult) return; if (pd.g) pd.g.visible = false; this.slukk(pd.light); this.pd.push(pd); },
  /* veggen er slått inn: det lukkede byttes mot det åpne, og rommet våkner. Feiler noe her, blir det liggende som før (alt synlig) */
  aapne() {
    if (!G.skjult) return; const F = G.F, PM = Paint.mesh || {};
    try {
      for (const m of [...(PM.vegger || []), ...(PM.toppEkstra || [])]) { const d = m.userData.del; if (d === 'lukket' || d === 'sprekk') m.visible = false; else if (d === 'aapen') m.visible = true; }
      if (PM.gulvSkjult) PM.gulvSkjult.visible = true;
      for (const im of D3.sprekkDeler || []) im.visible = false;
      if (Paint.aapen) { Paint.wallH = Paint.aapen.wallH; Paint.wallS = Paint.aapen.wallS; }
    } catch (e) { console.warn('det skjulte rommet ble ikke byttet', e); }
    G.skjult = null;
    try {
      for (const o of this.props) if (o.g) o.g.visible = true;
      for (const pd of this.pd) if (pd.g) pd.g.visible = true;
      this.tenn = { t: 0, lys: this.lys.slice() };
      // gløden fra tingene (som Effekter.onFloor), og tennene og pillen som lå der inne
      if (typeof Glod === 'object') for (const o of this.props) { const K = GLOD_KILDER[o.kind]; if (!K || !o.alive) continue; const z0 = (o.g && o.g.position ? o.g.position.z : o.z + .2) + .14; for (const [type, dx, h, dz, opt] of K) Glod.lag(o.x + dx, h * BILL_Y, z0 + dz, type, Object.assign({ eier: o }, opt || {})); }
      const hemm = F.rooms.find(r => r.role === 'secret');
      if (hemm) { const t = freeSpot(hemm.x + 1.5, hemm.z + 1.5, 2); for (let i = 0; i < 3; i++) dropPickup(t.x + i * .3, t.z, 'tooth', 1); dropPickup(t.x, t.z + .4, 'cons', pick(Object.keys(PILL_COL))); }
      // trærne som sto på og ved det skjulte ute
      if (typeof Landskap === 'object' && Landskap.skjulteTraer) { for (const g of Landskap.skjulteTraer) { if (!R.safe) puff(g.position.x, g.position.z, 2, 1, '#4a6a3a'); R.remove(g); } Landskap.skjulteTraer = []; }
      // maskene til tåka og regnringene, kontaktskyggene og skyggekartet tegnes med det åpne rommet
      const tm = D3.taakeMask; if (tm && tm.image && tm.image.data) { for (let i = 0; i < tm.image.data.length; i++) tm.image.data[i] = F.tiles[i] > 0 ? 255 : 0; tm.needsUpdate = true; }
      const rm = typeof Regnringer === 'object' && Regnringer.mask; if (rm && rm.image && rm.image.data) { for (let z = 0; z < F.H; z++) for (let x = 0; x < F.W; x++) { const i = z * F.W + x; rm.image.data[i] = F.tiles[i] > 0 && Vaer.ute(x + .5, z + .5) ? 255 : 0; } rm.needsUpdate = true; }
      if (typeof Dybde === 'object' && Dybde.ao) { const a = Dybde.ao; R.remove(a.m); a.t.dispose(); a.m.material.dispose(); Dybde.ao = null; Dybde.kontakt(F); }
      if (D3.on && R.renderer) R.renderer.shadowMap.needsUpdate = true;
    } catch (e) { console.warn('det skjulte rommet våknet ikke helt', e); for (const L of this.lys) if (L.userData.col) R.setLight(L, L.userData.base || 1); for (const o of this.props) o.skjult = false; this.tenn = null; }
  },
  /* lysene i rommet tennes over et sekund (spilltid), og så overtar flimringen i updateProps */
  tick(dt) {
    const T = this.tenn; if (!T) return; T.t += dt; const k = Math.min(1, T.t / 1);
    for (const L of T.lys) if (L.parent && L.userData.col) R.setLight(L, (L.userData.base || 1) * k * k);
    if (k >= 1) { for (const o of this.props) o.skjult = false; this.tenn = null; }
  }
};

/* ---------- koblinger ---------- */
// spawnProps er allerede pakket inn av 17_romtyper (lysene) og 38_effekter (gløden), så alt finnes når tingene gjemmes
{ const _sp = spawnProps; spawnProps = function () { _sp(); try { Skjult.gjemTing(); } catch (e) { console.warn('det skjulte rommet ble ikke gjemt', e); } }; }
// siste slag på sprekken: Spesial.damage knuser veggen (c.broken, F.block og G.run.secrets som før), og så åpnes rommet
{ const _d = Spesial.damage; Spesial.damage = function (c, n) { _d.call(this, c, n); if (G.skjult && this.cracks.length && this.cracks.every(k => k.broken)) Skjult.aapne(); }; }
{ const _u = Spesial.update; Spesial.update = function (dt) { _u.call(this, dt); Skjult.tick(dt); }; }

Object.assign(window, { Skjult, gulvSynlig });
