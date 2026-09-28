"""Fiendene: de nye, minisjefene, ute-fiendene, grunnarbeidet, Skinnlauget, havet, draugen og Holdningssøsteren.

Testdeler fra test_ekstra.py. Kjøres med python3 tools/test_ekstra.py --system fiender eller --del N.
"""
from .felles import sjekk, ny_side, start_lop, URL, URL3D, HB_PLASS, FAST


async def del_5(b):
    # 5) de nye fiendene i aksjon
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg)
    await pg.evaluate("""() => { const G = MORBIDIUM; G.run.seed = 5; startFloor(3, false); G.rooms.forEach(s => s.cleared = true); const P = G.player; P.hp = P.maxHp = 400;
          const r = G.F.rooms.filter(r => r.role === 'combat').sort((a, b) => b.w * b.h - a.w * a.h)[0]; const c = freeSpot(r.x + r.w / 2, r.z + r.h / 2, 3); P.x = c.x; P.z = c.z; R.snapCamera(P.x, P.z);
          const types = ['tvang', 'byrakrat', 'narkose', 'rotte', 'oyeblomst']; types.forEach((t, i) => { const a = i / types.length * Math.PI * 2, s = freeSpot(P.x + Math.sin(a) * 3.2, P.z + Math.cos(a) * 3.2, 2); spawnEnemy(t, s.x, s.z, false, 3); }); }""")
    await pg.wait_for_timeout(1400); await pg.screenshot(path='/tmp/e_8fiender.png')
    # til fiendene har rukket å slå: spilletid og ikke sanntid, for programvaregrafikken på en travel maskin kan gå på en åttendedel av full fart
    await pg.evaluate("async () => { const G = MORBIDIUM, g0 = G.time, t0 = performance.now(); while (G.time - g0 < 6 && G.player.hp >= 400 && performance.now() - t0 < 90000) await new Promise(r => setTimeout(r, 100)); }")
    await pg.screenshot(path='/tmp/e_9fiender_kamp.png')
    st = await pg.evaluate("() => ({ n: MORBIDIUM.enemies.filter(e => e.alive).length, types: [...new Set(MORBIDIUM.enemies.map(e => e.type))], hp: Math.round(MORBIDIUM.player.hp), gas: MORBIDIUM.zones.filter(z => z.kind === 'gas').length })")
    sjekk('nye fiender lever og rotter kom i flokk', st['n'] >= 7 and len(st['types']) == 5, st)
    sjekk('fiendene gjorde skade', st['hp'] < 400, st['hp'])
    await pg.evaluate("() => { for (const e of MORBIDIUM.enemies) if (e.alive) hurt(e, 9999, { from: 'player' }); }")
    await pg.wait_for_timeout(800)
    sjekk('ingen konsollfeil (nye fiender)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_19(b):
    # 19) de nye fiendene: Kasteren kaster, Trillepasienten ruller, Speilpasienten gir sju års ulykke, klumpungen lever.
    #     e.t = 0 avslutter oppstigningen med en gang. Settes state rett til 'chase', blir dukken stående i skala 0,01.
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg)
    await pg.evaluate("""() => { rolig(); const G = MORBIDIUM, P = G.player, r = G.F.rooms.filter(r => r.role === 'combat')[0]; P.x = r.x + r.w / 2; P.z = r.z + r.h / 2; P.hp = P.maxHp = 9999; Bygg.alt();
          window._nye = ['kasteren', 'trille', 'speil', 'klumpunge'].map((t, i) => { const e = spawnEnemy(t, P.x - 3 + i * 2, P.z - 2.5, false, 1); e.t = 0; e.sleep = 0; e.cd = 0; return e; }); window._luck0 = Items.stat('luck'); }""")
    # programvaregrafikken er treg, så vi venter i spilltid til Kasteren har kastet og noen har truffet (høyst 25 sekunder spilltid)
    await pg.evaluate("""async () => { const G = MORBIDIUM, g0 = G.time, ferdig = () => (G.puddles.some(p => p.kind === 'mokk') || G.projectiles.some(p => p.type === 'klump')) && G.player.hp < 9999;
          for (let i = 0; i < 2400 && !ferdig() && G.time - g0 < 25; i++) await new Promise(r => setTimeout(r, 100)); }""")
    ny_ = await pg.evaluate("""() => { const G = MORBIDIUM, [k, t, s, u] = window._nye;
          const a = { typer: window._nye.map(e => e.type), levende: window._nye.filter(e => e.alive).length, hjul: !!t.doll.hjul, kastet: G.puddles.some(p => p.kind === 'mokk') || G.projectiles.some(p => p.type === 'klump'), skadet: G.player.hp < 9999 };
          hurt(s, 99999, { from: 'player', x: G.player.x, z: G.player.z }); a.ulykke = (G.run.buffs || {}).ulykke || 0; a.luck = window._luck0 - Items.stat('luck');
          return a; }""")
    await pg.screenshot(path='/tmp/e_8nye_fiender.png')
    sjekk('Kasteren, Trillepasienten, Speilpasienten og klumpungen lever og gjør skade, rullestolen har hjul, og Kasteren kaster',
          ny_['typer'] == ['kasteren', 'trille', 'speil', 'klumpunge'] and ny_['levende'] >= 3 and ny_['hjul'] and ny_['kastet'] and ny_['skadet'], ny_)
    sjekk('Speilpasienten knust gir sju års ulykke (mindre flaks)', ny_['ulykke'] == 1 and ny_['luck'] == 6, ny_)
    sjekk('ingen konsollfeil (nye fiender fra ChatGPT)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_20(b):
    # 20) minisjefer: kommer i risikorommet med egen helsestang, og legger igjen preparatglass og hjerte
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg)
    await pg.evaluate("() => { rolig(); const P = MORBIDIUM.player; P.hp = P.maxHp = 9999; }")
    mi = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player; for (const e of G.enemies) if (e.alive) killEntity(e, {});
          const a = { rom: [] };
          for (let d = 1; d <= 3; d++) { startFloor(d, false); const risk = G.F.rooms.find(r => r.role === 'risk'); a.rom.push(!risk || Mini.rom[risk.id] !== undefined); }
          const risk = G.F.rooms.find(r => r.role === 'risk') || G.F.rooms.find(r => r.role === 'combat'); if (!Mini.rom[risk.id]) Mini.rom[risk.id] = 'tannlege';
          G.rooms.forEach(s => s.cleared = true); P.x = risk.x + risk.w / 2; P.z = risk.z + 1.2;
          const hjerter = () => G.pickups.filter(k => k.kind === 'heart').length, ped0 = Items.pedestals.length, m0 = G.meta.minisjefer || 0, h0 = hjerter();
          const e = Mini.kom({ r: risk }); e.cd = 99; Mini.tick(); a.type = e.type; a.mini = !!e.mini; a.stang = !document.getElementById('miniBar').classList.contains('hidden');
          a.navn = document.getElementById('miniName').textContent;
          hurt(e, 99999, { from: 'player', x: P.x, z: P.z }); await new Promise(r => setTimeout(r, 400)); Mini.tick();
          a.glass = Items.pedestals.length - ped0; a.hjerte = hjerter() > h0; a.teller = (G.meta.minisjefer || 0) - m0; a.borte = document.getElementById('miniBar').classList.contains('hidden');
          return a; }""")
    sjekk('minisjefene er fordelt på risikorommene, får helsestang og navn, og gir preparatglass og hjerte',
          all(mi['rom']) and mi['mini'] and mi['stang'] and len(mi['navn']) > 3 and mi['glass'] == 1 and mi['hjerte'] and mi['teller'] == 1 and mi['borte'], mi)
    for t in ['koret', 'tannlege', 'portier']:
        await pg.evaluate("""(t) => { const G = MORBIDIUM, P = G.player; for (const e of G.enemies) if (e.alive) killEntity(e, {}); const e = spawnEnemy(t, P.x + 2.5, P.z, false, G.depth); e.t = 0; e.sleep = 0; }""", t)
        await pg.wait_for_timeout(5000)
        if t == 'koret': await pg.screenshot(path='/tmp/e_9koret.png')
    sjekk('Hviskekoret, Tannlegen og portieren slåss uten feil', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_27(b):
    # 27) Parken og Nattskogen: gartnere, kråker, Huldra, Vedkubbemannen, Nøkken og kålhoder slåss, med hver sine særtrekk
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg)
    uf = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), ut = { sett: {} };
          for (const [d, typer] of [[1, ['gartner', 'kraake', 'kaalhode']], [5, ['huldra', 'vedkubbe', 'nokken']]]) {
            startFloor(d, false); rolig(); P.hp = P.maxHp = 9999; const r = G.F.rooms.find(r => r.role === 'combat') || G.F.rooms[0]; P.x = r.x + r.w / 2; P.z = r.z + r.h / 2;
            const fl = typer.map((t, i) => { const a = i / typer.length * Math.PI * 2, s = freeSpot(P.x + Math.sin(a) * 3.5, P.z + Math.cos(a) * 3.5, 3), e = spawnEnemy(t, s.x, s.z, false, d); e.t = 0; return e; });
            for (let k = 0; k < 44; k++) { await vent(250); P.hp = 9999; for (const e of fl) { const S = ut.sett[e.type] || (ut.sett[e.type] = {}); S[e.state] = 1; if (e.lokker > 0) S.lokker = 1; if (e.dukket) S.nede = 1; if (e.dukket === false) S.oppe = 1; } }
            ut['levende' + d] = fl.filter(e => e.alive).length;
            if (d === 5) { for (const e of fl) if (e.type === 'vedkubbe') hurt(e, 99999, { from: 'player' }); for (const e of fl) if (e.type === 'nokken') { e.cd = 99; e.stille = 99; } await vent(300); const h = fl.find(e => e.type === 'huldra'), sp = freeSpot(P.x + 4, P.z, 3); h.x = sp.x; h.z = sp.z; h.stille = 99; h.cd = 99; h.state = 'chase'; const x0 = Math.hypot(P.x - h.x, P.z - h.z); h.lokker = 1.5; const gl = G.time; for (let i = 0; i < 100 && G.time - gl < .7 && !(Math.hypot(P.x - h.x, P.z - h.z) < x0 - .3); i++) await vent(100); ut.dratt = x0 > 1.5 && Math.hypot(P.x - h.x, P.z - h.z) < x0 - .3; h.stille = 0; for (const e of fl) if (e.type === 'nokken') { e.cd = 0; e.stille = 0; } const n = fl.find(e => e.type === 'nokken'); n.dukket = true; const h0 = n.hp; hurt(n, 30, { from: 'player' }); ut.nokkenUrort = n.hp === h0; n.dukket = false; hurt(n, 30, { from: 'player' }); ut.nokkenTruffet = n.hp < h0; }
            for (const e of fl) hurt(e, 99999, { from: 'player' });
          }
          ut.indeks = ['gartner', 'kraake', 'kaalhode', 'huldra', 'vedkubbe', 'nokken', 'hekk', 'hjort'].every(t => (FIENDE_INFO[t] || [])[0]) && SJEF_PULJE.includes('hekk') && SJEF_PULJE.includes('hjort');
          return ut; }""")
    S = uf['sett']
    sjekk('gartnere, kråker og kålhoder i Parken, Huldra, Vedkubbemannen og Nøkken i Nattskogen går til angrep', all('wind' in S.get(t, {}) for t in ['gartner', 'kraake', 'kaalhode', 'huldra', 'vedkubbe', 'nokken']) and uf['levende1'] == 3 and uf['levende5'] == 3, uf)
    sjekk('kråka stuper, Huldras sang drar deg mot henne, og Nøkken går under og kommer opp igjen', 'charge' in S.get('kraake', {}) and uf.get('dratt') and 'nede' in S.get('nokken', {}) and 'oppe' in S.get('nokken', {}), uf)
    sjekk('Nøkken kan ikke treffes under vannet, men når han er oppe', uf['nokkenUrort'] and uf['nokkenTruffet'], uf)
    sjekk('de nye fiendene og sjefene står i fiendeindeksen og sjefpuljen', uf['indeks'], uf)
    await pg.screenshot(path='/tmp/e_14ute.png')
    sjekk('ingen konsollfeil (Parken og Nattskogen)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_58(b):
    # 58) Grunnarbeid for nye fiender: den som ligger under vann (e.dukket), kan ikke treffes eller siktes på, Journalen låner ikke
    #     trekk som bare virker hos sjefen selv, strekbåndene sender bare det som er tegnet, og statusordene legger seg ikke oppå hverandre
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg)
    gr = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), ut = {},
            til = async (f, t = 4, maks = 30000) => { const g0 = G.time, t0 = performance.now(); while (!f() && G.time - g0 < t && performance.now() - t0 < maks) await vent(50); return !!f(); },
            spill = async (t, maks = 20000) => { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < t && performance.now() - t0 < maks) await vent(50); },
            bilder = n => new Promise(r => { const f = () => --n <= 0 ? r() : requestAnimationFrame(f); requestAnimationFrame(f); }),
            iKastere = e => Dybde.kastere().some(k => k.k === e);
          startFloor(5, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } rolig(); P.hp = P.maxHp = 9999; P.invuln = 999;
          const r = G.F.rooms.find(r => r.role === 'combat' && r.w >= 7 && r.h >= 7) || G.F.rooms[0]; P.x = r.x + r.w / 2; P.z = r.z + r.h / 2; P.face = 0;
          // Nøkken under vannet: ingen lykteskygge, ikke nærmest, og nærkampslaget går rett gjennom (spion på Items.onHit, som kalles for hver fiende slaget treffer)
          const s = freeSpot(P.x + 2.5, P.z, 3), n = spawnEnemy('nokken', s.x, s.z, false, 5); n.cd = 99; n.stille = 99; n.hp = n.max = 1e6;
          ut.nede = await til(() => n.dukket === true && !n.doll.root.visible);
          const slag = () => { n.x = P.x + Math.sin(P.face) * .9; n.z = P.z + Math.cos(P.face) * .9; const oh = Items.onHit, rammet = []; Items.onHit = function (e) { rammet.push(e); return oh.apply(Items, arguments); }; const h0 = n.hp; try { meleeHit({ combo: 0, heavy: false, charge: 0 }); } finally { Items.onHit = oh; } return { rammet: rammet.includes(n), skade: n.hp < h0 }; };
          ut.under = { skygge: iKastere(n), naermest: nearestEnemy(n.x, n.z, 99) === n, medFilter: nearestEnemy(n.x, n.z, 99, e => e.type === 'nokken') === n, slag: slag() };
          // kontroll: oppe av vannet er han med overalt igjen
          n.dukket = false; n.opp = 99; ut.oppe = await til(() => n.doll.root.visible);
          ut.over = { skygge: iKastere(n), naermest: nearestEnemy(n.x, n.z, 99) === n, slag: slag() };
          killEntity(n, {});
          // hvilken som helst fiende, ikke bare Nøkken: hurt gir 0, uten treffkjede eller blod, og strøm i pytten og snubletråd biter ikke
          const s2 = freeSpot(P.x - 2.5, P.z, 3), p = spawnEnemy('pleier', s2.x, s2.z, false, 5); p.stun = 99; p.hp = p.max = 1e6; await til(() => p.state !== 'spawn');
          const bt = Blod.treff, blod = []; Blod.treff = function (e) { blod.push(e); return bt.apply(Blod, arguments); };
          p.dukket = true; let k0 = Kombo.n; const h0 = p.hp; ut.pleierUnder = { skade: hurt(p, 30, { from: 'player' }), hp: p.hp === h0, kjede: Kombo.n === k0, blod: blod.includes(p), naermest: nearestEnemy(p.x, p.z, 99) === p };
          const pud = addPuddle(p.x, p.z, 'wet', 1.6, 30), trad = { kind: 'trip', x0: p.x - 1.5, z0: p.z, x1: p.x + 1.5, z1: p.z, t: 30 }; if (pud) pud.elec = 30; G.zones.push(trad); p.zapT = undefined; p.slip = 0;
          let rort = false; { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < 1.2 && performance.now() - t0 < 20000) { if (p.zapT !== undefined || p.slip > 0) rort = true; await vent(50); } }
          Object.assign(ut.pleierUnder, { rort, hp2: p.hp === h0, pytt: !!pud });
          // skudd og kast går over vannet: de stopper ikke der han ligger (før forsvant de i tomt vann), men oppe treffer de
          const skudd = () => { const sh = Items.fire(p.x, p.z - .05, 0, 1), pr = addProj({ type: 'pill', from: 'player', x: p.x, z: p.z - .05, vx: 0, vz: .1, life: 1, dmg: 1 }); const hs = p.hp; Items.updateShots(1 / 60); updateProjectiles(1 / 60);
            const r = { skudd: !Items.shots.includes(sh) || sh.hit.has(p), kast: !pr.alive, skade: p.hp < hs }; if (Items.shots.includes(sh)) Items.popShot(sh, Items.shots.indexOf(sh)); pr.alive = false; return r; };
          ut.pleierUnder.skudd = skudd();
          p.dukket = false; k0 = Kombo.n; ut.pleierOppe = { skade: hurt(p, 30, { from: 'player' }) > 0, kjede: Kombo.n > k0, blod: blod.includes(p) }; ut.pleierOppe.skudd = skudd(); ut.pleierOppe.zapp = await til(() => p.zapT !== undefined, 1.5); ut.pleierOppe.skli = await til(() => p.slip > 0, 1.5);
          Blod.treff = bt; if (pud) pud.elec = 0; G.zones.splice(G.zones.indexOf(trad), 1); killEntity(p, {});
          // Journalen låner ikke rull, storm eller dypdykk: alle sjefene i puljen er møtt, pluss en prøvesjef med et eget trekk som Krakens dypdykk
          const BM = BOSS_MOVES, orig = {}, valgt = {}, tell = k => () => { valgt[k] = (valgt[k] || 0) + 1; };
          for (const k of Object.keys(BM)) if (k !== 'rewrite') { orig[k] = BM[k]; BM[k] = tell(k); }
          BM.dypdykk = tell('dypdykk'); BM.favn = tell('favn'); SJEF_DATA.provesjef = { attacks: ['dypdykk', 'favn', 'favn', 'favn'], egne: ['dypdykk'] };
          const s0 = G.run.sjefer; G.run.sjefer = { 1: 'krok', 2: 'rust', 3: 'arkivar', 4: 'klumpen', 5: 'hjort', 6: 'journalen', 7: 'hekk', 8: 'provesjef' };
          const liste = typeof laanbareTrekk === 'function' ? laanbareTrekk() : null, J = { x: P.x, z: P.z, alive: true, bubbleH: 3 };
          try { for (let i = 0; i < 200; i++) BM.rewrite(J, 3, 0, 10); } finally { for (const k in orig) BM[k] = orig[k]; delete BM.dypdykk; delete BM.favn; delete SJEF_DATA.provesjef; G.run.sjefer = s0; J.alive = false; }
          ut.laan = { valgt, liste: liste && !liste.some(k => ['rull', 'storm', 'dypdykk'].includes(k)) && ['favn', 'gevir', 'klem', 'hookpull', 'saks', 'isolate', 'jet'].every(k => liste.includes(k)) };
          // strekbåndene: bare det som er tegnet, sendes, og et tomt bånd sendes ikke
          const d = new Doll('pleier', {}); d.update(1 / 60, { speed: 2 }); const Af = d.front.geo.attributes, Ab = d.back.geo.attributes;
          ut.baand = { n: d.front.n, omraade: d.front.n > 0 && Af.position.updateRange.count === d.front.n * 3 && Af.color.updateRange.count === d.front.n * 3 && Ab.position.updateRange.count === d.back.n * 3 && Ab.color.updateRange.count === d.back.n * 3 };
          const v0 = Af.position.version; d.update(1 / 60, { speed: 2 }); ut.baand.sendes = Af.position.version === v0 + 1; d.dispose();
          const bl = new Doll('yngel', {}); bl.update(1 / 60, {}); const bf = bl.front.geo.attributes, bv = [bf.position.version, bf.color.version], bb = bl.back.geo.attributes.position.version;
          for (let i = 0; i < 10; i++) bl.update(1 / 60, {}); ut.baand.tomt = bl.front.n === 0 && bf.position.version === bv[0] && bf.color.version === bv[1]; ut.baand.bakSendes = bl.back.n > 0 && bl.back.geo.attributes.position.version === bb + 10; bl.dispose();
          // det samme i spillet, over ti bilder: yngelen (en blob) sender ikke det tomme båndet, pleieren sender sine
          const s3 = freeSpot(P.x, P.z + 2.5, 3), y = spawnEnemy('yngel', s3.x, s3.z, false, 5), pl = spawnEnemy('pleier', s3.x + 1, s3.z, false, 5); for (const e of [y, pl]) { e.stun = 99; e.hp = e.max = 1e6; }
          await til(() => y.state !== 'spawn' && pl.state !== 'spawn'); await bilder(2); const yv = y.doll.front.geo.attributes.position.version, pv = pl.doll.front.geo.attributes.position.version, gt = G.time;
          await bilder(10); ut.baand.spill = { tomt: y.doll.front.geo.attributes.position.version === yv, pleier: pl.doll.front.geo.attributes.position.version > pv, tid: G.time > gt };
          killEntity(y, {}); killEntity(pl, {}); await spill(.8);
          // statusord: samme ord over samme figur høyst én gang per cd sekunder, et annet ord løftes over det første, og etter cd kommer ordet igjen
          const ord = t => [...document.querySelectorAll('#fx .dmg')].filter(el => el.textContent.startsWith(t));
          if (typeof statusOrd === 'function') {
            const a = statusOrd(P, 'GREPET'), a2 = statusOrd(P, 'GREPET'), c = statusOrd(P, 'DØPT'); await bilder(2);
            const rg = ord('GREPET')[0], rd = ord('DØPT')[0], mid = el => { const q = el.getBoundingClientRect(); return (q.top + q.bottom) / 2; };
            ut.ord = { a, a2, c, grepet: ord('GREPET').length, dopt: ord('DØPT').length, crit: !!rg && rg.classList.contains('crit'), over: rg && rd ? Math.round(mid(rg) - mid(rd)) : null };
            await spill(1.3); ut.ord.igjen = statusOrd(P, 'GREPET');
          }
          // en sjef som dykker (som Kraken skal): heller ingen skade, skygge eller sikte
          const B = spawnBoss(5, P.x + 3, P.z - 2); await til(() => !!B.doll); B.dukket = true; const bh = B.hp;
          ut.sjef = { skade: hurt(B, 50, { from: 'player' }), hp: B.hp === bh, skygge: iKastere(B), naermest: nearestEnemy(B.x, B.z, 99) === B };
          B.dukket = false; ut.sjefOppe = { skygge: iKastere(B), naermest: nearestEnemy(B.x, B.z, 99) === B }; killEntity(B, {});
          return ut; }""")
    u, o = gr['under'], gr['over']
    sjekk('Nøkken under vannet kaster ingen lykteskygge, er ikke nærmeste fiende (heller ikke med filter), og nærkampslaget går gjennom ham', gr['nede'] and not u['skygge'] and not u['naermest'] and not u['medFilter'] and not u['slag']['rammet'] and not u['slag']['skade'], [gr['nede'], u])
    sjekk('oppe av vannet kaster han skygge, er nærmest og blir truffet (kontroll)', gr['oppe'] and o['skygge'] and o['naermest'] and o['slag']['rammet'] and o['slag']['skade'], o)
    pu, po = gr['pleierUnder'], gr['pleierOppe']
    sjekk('en hvilken som helst fiende under vann tar ingen skade, gir ingen treffkjede eller blod, siktes ikke på, verken strøm i pytten eller snubletråd biter, og skudd og kast går over ham', pu['skade'] == 0 and pu['hp'] and pu['kjede'] and not pu['blod'] and not pu['naermest'] and pu['pytt'] and not pu['rort'] and pu['hp2'] and not any(pu['skudd'].values()), pu)
    sjekk('oppe av vannet gir slaget skade, treffkjede og blod, strømmen og snubletråden biter, og skudd og kast treffer (kontroll)', po['skade'] and po['kjede'] and po['blod'] and po['zapp'] and po['skli'] and all(po['skudd'].values()), po)
    sjekk('en sjef under vann tar ingen skade, kaster ingen skygge og siktes ikke på, men oppe gjør han det', gr['sjef']['skade'] == 0 and gr['sjef']['hp'] and not gr['sjef']['skygge'] and not gr['sjef']['naermest'] and gr['sjefOppe']['skygge'] and gr['sjefOppe']['naermest'], [gr['sjef'], gr['sjefOppe']])
    v = gr['laan']['valgt']
    sjekk('Journalen låner aldri rull, storm eller dypdykk på 200 forsøk, men de andre trekkene til de samme sjefene', not any(k in v for k in ['rull', 'storm', 'dypdykk']) and all(v.get(k, 0) > 0 for k in ['favn', 'gevir', 'klem']) and sum(v.values()) == 200 and gr['laan']['liste'], gr['laan'])
    ba = gr['baand']
    sjekk('strekbåndene sender bare den tegnede delen (updateRange er n * 3), og et tomt bånd sendes ikke, heller ikke i spillet over ti bilder', ba['omraade'] and ba['sendes'] and ba['tomt'] and ba['bakSendes'] and ba['spill']['tomt'] and ba['spill']['pleier'] and ba['spill']['tid'], ba)
    od = gr.get('ord') or {}
    sjekk('statusord: samme ord vises én gang innen cd, et nytt ord løftes over det forrige, og etter cd kommer ordet igjen', od.get('a') is True and od.get('a2') is False and od.get('c') is True and od.get('grepet') == 1 and od.get('dopt') == 1 and od.get('crit') and (od.get('over') or 0) >= 15 and od.get('igjen') is True, od)
    await pg.screenshot(path='/tmp/e_58_grunnarbeid.png')
    sjekk('ingen konsollfeil (grunnarbeid for nye fiender)', not pg.errs, pg.errs[:6])
    await pg.close()
    # 3D: Nøkken under vannet mister lykteskyggen også der, og strekbåndene tegnes som før (én runde, 3D er tungt i programvaregrafikk)
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg, url=URL3D)
    d3 = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), ut = {},
            til = async (f, t = 4, maks = 60000) => { const g0 = G.time, t0 = performance.now(); while (!f() && G.time - g0 < t && performance.now() - t0 < maks) await vent(100); return !!f(); };
          startFloor(5, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } rolig(); P.hp = P.maxHp = 9999; P.invuln = 999; ut.d3 = D3.on;
          const r = G.F.rooms.find(r => r.role === 'combat' && r.w >= 7 && r.h >= 7) || G.F.rooms[0]; P.x = r.x + r.w / 2; P.z = r.z + r.h / 2; R.snapCamera(P.x, P.z);
          const s = freeSpot(P.x + 1.8, P.z + .6, 3), n = spawnEnemy('nokken', s.x, s.z, false, 5); n.cd = 99; n.stille = 99;
          const s2 = freeSpot(P.x - 1.8, P.z + .4, 3), p = spawnEnemy('pleier', s2.x, s2.z, false, 5); p.stun = 99; p.hp = p.max = 1e6;
          ut.nede = await til(() => n.dukket === true && !n.doll.root.visible && p.state !== 'spawn'); await til(() => false, .6);
          ut.skyggeNede = Dybde.skygger.has(n); ut.skyggePleier = Dybde.skygger.has(p); ut.baand = p.doll.front.n > 0;
          return ut; }""")
    sjekk('i 3D kaster Nøkken under vannet ingen lykteskygge, mens pleieren ved siden av gjør det', d3['d3'] and d3['nede'] and not d3['skyggeNede'] and d3['skyggePleier'] and d3['baand'], d3)
    await pg.screenshot(path='/tmp/e_58_grunnarbeid_3d.png')
    sjekk('ingen konsollfeil (grunnarbeid i 3D)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_59(b):
    # 59) Skinnlauget: Lærlingen og Klokkeren går til angrep på tre etasjer, laugets stans deler én nedkjøling, bjella treffer i sølvringen
    #     og ikke utenfor, høyst ti kjettinger samtidig, én klokker per rom, fiendeindeksen og Enkel grafikk.
    #     Med testklokka og faste etasjer (felles.FAST): samme etasje, samme plasser og samme tallrekke hver gang, og all venting er spilltid.
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg)
    la = await pg.evaluate(FAST + """(async () => { const G = MORBIDIUM, P = G.player, ut = { etasjer: {} },
            til = async (f, t = 4) => { if (!f()) Klokke.til(f, t); return !!f(); }, spill = async t => { Klokke.spol(t); };
          if (typeof Laug !== 'object') return { mangler: true };
          // alle treff fra lauget går gjennom Laug.treff, som gir true når pasienten tok skade
          const skade = {}, _lt = Laug.treff; Laug.treff = function (shape, o, dmg, src) { const r = _lt.apply(Laug, arguments); if (r && src) skade[src.type] = (skade[src.type] || 0) + 1; return r; };
          let R0 = null; const rom = () => { P.x = R0.cx + .5; P.z = R0.cz + .5; return R0; }, midt = (dx, dz) => plass(R0, R0.cx + .5 + dx, R0.cz + .5 + dz);
          // stedene fiendene settes, sett fra midten av rommet: de må være frie i etasjen som velges
          const STEDER = [[2.4, 0], [-4.5, 1], [-5, 0], ...[0, 1, 2, 3, 4].map(i => [Math.sin(i / 5 * Math.PI * 2) * 4.5, Math.cos(i / 5 * Math.PI * 2) * 4.5])];
          const ved = (dx, dz) => freeSpot(P.x + dx, P.z + dz, 3), mot = e => [Math.hypot(P.x - e.x, P.z - e.z), Math.atan2(P.x - e.x, P.z - e.z)];
          try {
            // hver type, på etasje 3, 4 og 6: legger an innen 6 sekunder spilltid og skader en pasient med 400 i helse innen 20
            for (const d of [3, 4, 6]) {
              R0 = fastEtasje(d, undefined, [11, 11], STEDER); ut.etasjer[d] = { frø: G.run.seed, rom: R0.id }; P.hp = P.maxHp = 400; P.invuln = 0; for (const k in skade) delete skade[k];
              const s1 = midt(2.4, 0), l = spawnEnemy('laerling', s1.x, s1.z, false, d), s2 = midt(-4.5, 1), k = spawnEnemy('klokker', s2.x, s2.z, false, d); k.kallT = 1e9;
              const g0 = G.time, E = { l: {}, k: {} };
              Klokke.til(() => { const t = G.time - g0; if (P.hp < 150) P.hp = 400;
                if (l.state === 'wind' && E.l.wind === undefined) E.l.wind = t; if (k.state === 'wind' && E.k.wind === undefined) E.k.wind = t;
                if (skade.laerling && E.l.skade === undefined) E.l.skade = t; if (skade.klokker && E.k.skade === undefined) E.k.skade = t;
                return E.l.skade !== undefined && E.k.skade !== undefined; }, 20);
              Object.assign(ut.etasjer[d], E); for (const e of [l, k]) if (e.alive) killEntity(e, {}); await spill(.3);
            }
            rolig(); rom(); P.hp = P.maxHp = 9999; P.invuln = 0;
            // laugets stans: av tre på under to sekunder får pasienten bare den første, og etter nedkjølingen kommer den igjen
            const o = { x: P.x, z: P.z, r: 1 }, stans = []; G.laugStunT = 0; // en stans fra kampene over kan ligge under to sekunder bak
            for (let i = 0; i < 3; i++) { P.invuln = 0; P.iframe = 0; P.stunT = 0; Laug.treff('circle', o, 1, { type: 'laerling', x: P.x, z: P.z }, .6, 'SPENT FAST'); stans.push(P.stunT > 0); await spill(.3); }
            await spill(2.2); P.invuln = 0; P.stunT = 0; Laug.treff('circle', o, 1, { type: 'klokker', x: P.x, z: P.z }, .35, 'HEKTET'); stans.push(P.stunT > 0); ut.stans = stans;
            // bjella: lyden kommer først, sølvringen treffer den som står i den, og ikke den som har gått to ruter ut av den
            const s3 = midt(-5, 0), k = spawnEnemy('klokker', s3.x, s3.z, false, 4); k.kallT = 1e9; await til(() => k.state !== 'spawn');
            const sp = Sound.play, lyder = []; Sound.play = function (n) { lyder.push(n); return sp.apply(Sound, arguments); };
            const ring = async utenfor => {
              await spill(.8); k.state = 'chase'; k.ringT = 0; k.stun = 0; P.invuln = 0; P.iframe = 0; skade.klokker = 0; lyder.length = 0; const [dist, a] = mot(k);
              Grotesk.ai.klokker(k, P, dist, a); k.cd = 99; const t = k.teles[k.teles.length - 1]; if (!t) return { varsel: false };
              const r = { varsel: true, lenke: t.o.type === 'lenke', r: t.o.r, forst: lyder[0] === 'bjelle' };
              if (utenfor) { for (let i = 0; i < 16; i++) { const v = i / 16 * Math.PI * 2, x = t.o.x + Math.sin(v) * (t.o.r + 2), z = t.o.z + Math.cos(v) * (t.o.r + 2); if (!solid(Math.floor(x), Math.floor(z))) { P.x = x; P.z = z; break; } } r.avstand = Math.hypot(P.x - t.o.x, P.z - t.o.z); }
              await til(() => !G.tele.includes(t), 3); await spill(.1); r.skade = skade.klokker; r.kjeder = Kjeder.liste.length; return r; };
            ut.inne = await ring(false); rom(); ut.ute = await ring(true); rom(); Sound.play = sp;
            killEntity(k, {}); await spill(.8);
            // høyst én klokker i rommet: en til blir en lærling
            const a1 = spawnEnemy('klokker', ved(4, 3).x, ved(4, 3).z, false, 4), a2 = spawnEnemy('klokker', ved(-4, 3).x, ved(-4, 3).z, false, 4); ut.enKlokker = [a1.type, a2.type]; killEntity(a1, {}); killEntity(a2, {});
            // fem klokkere som ringer stort samtidig vil ha 25 kjettinger, men det blir aldri flere enn ti
            Laug.flereKlokkere = true; const kl = [];
            for (let i = 0; i < 5; i++) { const v = i / 5 * Math.PI * 2, s = midt(Math.sin(v) * 4.5, Math.cos(v) * 4.5), e = spawnEnemy('klokker', s.x, s.z, false, 4); e.kallT = 1e9; kl.push(e); }
            Laug.flereKlokkere = false; await til(() => kl.every(e => e.state !== 'spawn'));
            for (const e of kl) { e.ringN = 2; e.ringT = 0; e.state = 'chase'; const [dist, a] = mot(e); Grotesk.ai.klokker(e, P, dist, a); e.cd = 99; }
            let maks = 0; Klokke.til(() => { maks = Math.max(maks, Kjeder.liste.length); return false; }, 2.2);
            ut.kjeder = maks; for (const e of kl) killEntity(e, {}); await spill(1);
            // Enkel grafikk: ingen kjettinger tegnes, men treffet og skaden kommer som før
            R.safe = true; const s4 = midt(-5, 0), ks = spawnEnemy('klokker', s4.x, s4.z, false, 4); ks.kallT = 1e9; await til(() => ks.state !== 'spawn'); rom();
            Laug.sistTreff = -1; ks.ringN = 2; ks.ringT = 0; ks.state = 'chase'; P.invuln = 0; skade.klokker = 0; { const [dist, a] = mot(ks); Grotesk.ai.klokker(ks, P, dist, a); } ks.cd = 99;
            let kjS = 0; Klokke.til(() => { kjS = Math.max(kjS, Kjeder.liste.length); return false; }, 1.6);
            ut.safe = { kjeder: kjS, treff: Laug.sistTreff > 0, skade: skade.klokker > 0 }; R.safe = false; killEntity(ks, {});
          } finally { Laug.treff = _lt; R.safe = false; Laug.flereKlokkere = false; Klokke.slipp(); }
          ut.info = ['laerling', 'klokker'].every(t => (FIENDE_INFO[t] || [])[0] && FIENDE_INFO[t][1] && FIENDE_REKKE.includes(t) && MESTER_TITTEL[t] && FIENDESTEMME[t] && LINES[t] && DEATH_CAUSES[t]) && !ROLLER.laerling && !ROLLER.klokker;
          ut.bilde = ['laerling', 'klokker'].map(t => { const c = fiendeBilde(t, 160, 190), d = c.getContext('2d').getImageData(0, 0, 160, 190).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 100) n++; return n / (160 * 190); });
          ut.pulje = { 3: DEPTH_ENEMIES[3].filter(t => t === 'laerling').length, 4: [DEPTH_ENEMIES[4].filter(t => t === 'laerling').length, DEPTH_ENEMIES[4].filter(t => t === 'klokker').length], 6: [DEPTH_ENEMIES[6].filter(t => t === 'laerling').length, DEPTH_ENEMIES[6].filter(t => t === 'klokker').length] };
          return ut; })()""")
    sjekk('Skinnlauget finnes (Laug i 50_skinnlauget.js)', not la.get('mangler'), la.get('mangler', ''))
    if not la.get('mangler'):
        E = la['etasjer']
        sjekk('Lærlingen og Klokkeren legger an innen 6 sekunder spilltid på etasje 3, 4 og 6', all(E[d][t].get('wind') is not None and E[d][t]['wind'] <= 6 for d in ['3', '4', '6'] for t in ['l', 'k']), E)
        sjekk('begge skader en pasient med 400 i helse innen 20 sekunder spilltid på etasje 3, 4 og 6', all(E[d][t].get('skade') is not None and E[d][t]['skade'] <= 20 for d in ['3', '4', '6'] for t in ['l', 'k']), E)
        sjekk('laugets stans deler én nedkjøling: av tre på under to sekunder slår bare den første inn, og etterpå kommer den igjen', la['stans'] == [True, False, False, True], la['stans'])
        sjekk('bjella ringer før sølvringen (lenke), og ringen treffer den som står i den', la['inne'].get('varsel') and la['inne']['lenke'] and la['inne']['forst'] and la['inne']['skade'] > 0, la['inne'])
        sjekk('bjella treffer ikke den som står to ruter utenfor ringen', la['ute'].get('varsel') and la['ute'].get('avstand', 0) > la['ute']['r'] + 1.9 and la['ute']['skade'] == 0, la['ute'])
        sjekk('høyst én klokker i rommet, en til blir lærling', la['enKlokker'] == ['klokker', 'laerling'], la['enKlokker'])
        sjekk('fem store ringer samtidig gir høyst ti kjettinger, men kjettinger kommer', 6 <= la['kjeder'] <= 10, la['kjeder'])
        sjekk('i Enkel grafikk tegnes ingen kjettinger, men treffet og skaden kommer', la['safe'] == {'kjeder': 0, 'treff': True, 'skade': True}, la['safe'])
        sjekk('fiendeindeksen, replikker, stemmer, dødsårsaker og mestertitler for begge, og ingen av dem i ROLLER', la['info'], la)
        sjekk('fiendeBilde tegner begge', all(x > .08 for x in la['bilde']), la['bilde'])
        sjekk('Lærlingen i Underetasjen, Kjelleren (to) og Dypet (to), Klokkeren i Kjelleren og Dypet', la['pulje'] == {'3': 1, '4': [2, 1], '6': [2, 1]}, la['pulje'])
    await pg.screenshot(path='/tmp/e_59_laug.png')
    sjekk('ingen konsollfeil (Skinnlauget)', not pg.errs, pg.errs[:6])
    # håndbokssiden med begge: får plass, og kortene har bilde
    # tittelen kommer når bildene er lastet og ville lukket håndboka (og bildet viste tittelen), så vent på den først
    await pg.goto(URL); await pg.wait_for_function("() => window.MORBIDIUM && MORBIDIUM.state === 'title'", timeout=60000); await pg.wait_for_timeout(500)
    hb = await pg.evaluate("""() => { if (!FIENDE_REKKE.includes('laerling')) return { mangler: true }; const kap = HANDBOK.findIndex(h => h.id === 'fiender'), per = document.body.clientWidth <= 700 ? 2 : 4; openHandbook({}, kap, Math.floor(FIENDE_REKKE.indexOf('laerling') / per));
          return { navn: [...document.querySelectorAll('.fkort .fnavn')].map(e => e.textContent) }; }""")
    await pg.wait_for_timeout(300)
    hb['plass'] = await pg.evaluate(HB_PLASS) if not hb.get('mangler') else False
    sjekk('håndboka har en side med Lærlingen og Klokkeren, og den får plass', 'Lærlingen' in hb.get('navn', []) and 'Klokkeren' in hb.get('navn', []) and hb['plass'], hb)
    await pg.screenshot(path='/tmp/e_59_handbok.png')
    sjekk('ingen konsollfeil (Skinnlauget i håndboka)', not pg.errs, pg.errs[:6])
    await pg.close()
    # 3D: begge i kamp, med kjettinger fra mørket. Testklokka står når vilkåret er nådd, så skjermbildet viser kjettingene
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg, url=URL3D)
    d3 = await pg.evaluate(FAST + """(() => { const G = MORBIDIUM, P = G.player, ut = {};
          if (typeof Laug !== 'object') return { mangler: true };
          const r = fastEtasje(4, undefined, [11, 11], [[2.2, .3], [-3.8, -1.2]]); P.hp = P.maxHp = 9999; ut.d3 = D3.on;
          const s1 = plass(r, P.x + 2.2, P.z + .3), l = spawnEnemy('laerling', s1.x, s1.z, false, 4), s2 = plass(r, P.x - 3.8, P.z - 1.2), k = spawnEnemy('klokker', s2.x, s2.z, false, 4); k.kallT = 1e9;
          const S = { l: {}, k: {} }; let kj = 0;
          Klokke.til(() => { P.hp = 9999; S.l[l.state] = 1; S.k[k.state] = 1; kj = Math.max(kj, Kjeder.liste.length); return S.l.wind && S.k.wind && kj && k.state === 'wind' && Kjeder.liste.length; }, 14);
          ut.S = S; ut.kjeder = kj; return ut; })()""")
    sjekk('i 3D legger begge an, og krokene kommer fra mørket', not d3.get('mangler') and d3.get('d3') and d3['S']['l'].get('wind') and d3['S']['k'].get('wind') and d3['kjeder'] > 0, d3)
    await pg.wait_for_timeout(300)
    await pg.screenshot(path='/tmp/e_59_laug_3d.png')
    sjekk('ingen konsollfeil (Skinnlauget i 3D)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_60(b):
    # 60) Havet under huset: Avløpsarmen ligger under risten og kan ikke treffes der, er aldri lenge under når pasienten står nær,
    #     det er aldri mer enn tre av dem, grepet drar pasienten til risten, og Kapellanens preken, avbrutte preken, kall og død.
    #     Med testklokka og faste etasjer (felles.FAST): samme etasje, samme plasser og samme tallrekke hver gang, og all venting er spilltid.
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg)
    hv = await pg.evaluate(FAST + """(async () => { const G = MORBIDIUM, P = G.player, ut = { etasjer: {}, frø: {} },
            til = async (f, t = 4) => { if (!f()) Klokke.til(f, t); return !!f(); }, spill = async t => { Klokke.spol(t); },
            iKastere = e => Dybde.kastere().some(k => k.k === e), sluk = r => G.props.filter(p => p.kind === 'drain' && p.room === r.id);
          if (typeof Havet !== 'object') return { mangler: true };
          const skade = {}, _ht = Havet.treff; Havet.treff = function (shape, o, dmg, src) { const r = _ht.apply(Havet, arguments); if (r && src) skade[src.type] = (skade[src.type] || 0) + 1; return r; };
          // et fritt sted i samme rom et stykke unna risten, med sikt (null når det ikke finnes)
          const ved = (s, d) => { const rid = G.F.roomId[Math.floor(s.z) * G.F.W + Math.floor(s.x)]; for (let i = 0; i < 24; i++) { const v = i / 24 * Math.PI * 2, x = s.x + Math.sin(v) * d, z = s.z + Math.cos(v) * d; if (!solid(Math.floor(x), Math.floor(z)) && !solid(Math.floor(x + .3), Math.floor(z)) && !solid(Math.floor(x - .3), Math.floor(z)) && G.F.roomId[Math.floor(z) * G.F.W + Math.floor(x)] === rid && los(s.x, s.z, x, z)) return { x, z }; } return null; };
          // en fast etasje med et kamprom med rist, der alle stedene testen bruker rundt risten, finnes (felles.FAST)
          const harSluk = r => r.props.some(p => p.k === 'drain'), stederOk = r => { const s = sluk(r)[0]; return !!s && [2.4, 2.5, 3, 4, 5].every(d => ved(s, d)); };
          const etasje = d => fastEtasje(d, harSluk, [7, 7], [], stederOk);
          const mot = e => [Math.hypot(P.x - e.x, P.z - e.z), Math.atan2(P.x - e.x, P.z - e.z)];
          try {
            // hver type der den hører hjemme: legger an innen 6 sekunder spilltid og skader en pasient med 400 i helse innen 20
            for (const d of [3, 4, 6]) {
              const r = etasje(d), s = sluk(r)[0]; ut.frø[d] = G.run.seed; if (!s) { ut.etasjer[d] = { utenSluk: true }; continue; }
              P.hp = P.maxHp = 400; P.invuln = 0; for (const k in skade) delete skade[k];
              const a = spawnEnemy('avlopsarm', s.x, s.z, false, d), p0 = ved(s, 2.4); P.x = p0.x; P.z = p0.z;
              let k = null; if (d >= 4) { const ks = ved(s, 5); k = spawnEnemy('kapellan', ks.x, ks.z, false, d); k.kallT = 1e9; }
              const g0 = G.time, E = { a: {}, k: {} };
              Klokke.til(() => { const t = G.time - g0; if (P.hp < 150) P.hp = 400; P.x = p0.x; P.z = p0.z;
                if (a.state === 'wind' && E.a.wind === undefined) E.a.wind = t; if (skade.avlopsarm && E.a.skade === undefined) E.a.skade = t;
                if (k) { if (k.state === 'wind' && E.k.wind === undefined) E.k.wind = t; if (skade.kapellan && E.k.skade === undefined) E.k.skade = t; }
                return E.a.skade !== undefined && (!k || E.k.skade !== undefined); }, 20);
              if (!k) delete E.k; ut.etasjer[d] = E; for (const e of [a, k]) if (e && e.alive) killEntity(e, {}); await spill(.3);
            }
            const r = etasje(4), s = sluk(r)[0]; P.hp = P.maxHp = 1e6;
            // under risten: ingen skade, ingen lykteskygge, ikke nærmest. Pasienten langt unna, så den blir liggende
            P.x = s.x + 30; P.z = s.z + 30; const a = spawnEnemy('avlopsarm', s.x, s.z, false, 4); a.hp = a.max = 1e6; await til(() => a.state !== 'spawn');
            const hu = a.hp; ut.under = { dukket: a.dukket === true, skjult: !a.doll.root.visible, skade: hurt(a, 30, { from: 'player' }), hp: a.hp === hu, skygge: iKastere(a), naermest: nearestEnemy(a.x, a.z, 99) === a, iSluk: Math.hypot(a.x - s.x, a.z - s.z) < .05 };
            // pasienten kommer nær: opp innen litt over et halvt sekund, og da biter slagene
            const p1 = ved(s, 2.5); P.x = p1.x; P.z = p1.z; P.invuln = 999; const tOpp = G.time; ut.oppe = { kom: await til(() => !a.dukket, 3) }; ut.oppe.tid = G.time - tOpp;
            await til(() => false, .2); Object.assign(ut.oppe, { skade: hurt(a, 30, { from: 'player' }) > 0, skygge: iKastere(a), naermest: nearestEnemy(a.x, a.z, 99) === a, synlig: a.doll.root.visible, baand: [a.doll.back.n, a.doll.front.n] });
            // armen lever: tuppen flytter seg selv når armen står stille
            a.cd = 99; await til(() => !a.anim && a.state === 'chase', 3); const tp = a.doll.deler[0].m.position, t1 = [tp.x, tp.y]; await spill(.4); ut.oppe.lever = Math.hypot(tp.x - t1[0], tp.y - t1[1]);
            // med pasienten innen fem ruter er den aldri under lenger enn 2,6 sekunder spilltid, og den dykker og kommer opp igjen
            a.cd = 0; let under = 0, maksUnder = 0, dykk = 0, sist = a.dukket; { let gt = G.time;
              Klokke.til(() => { const dt = G.time - gt; gt = G.time; P.x = p1.x; P.z = p1.z; P.hp = 1e6;
                if (a.dukket) { under += dt; maksUnder = Math.max(maksUnder, under); } else under = 0; if (a.dukket && !sist) dykk++; sist = a.dukket; return false; }, 14); }
            ut.rettferdig = { maksUnder, dykk, avstand: Math.hypot(p1.x - s.x, p1.z - s.z) };
            // grepet: armen oppe, pasienten fem ruter unna med sikt, og etter treffet er pasienten nærmere risten
            await til(() => !a.dukket && a.fase === 'opp' && a.state !== 'wind', 4); a.faseT = .5; a.cd = 99; const hj = a.hjem, p2 = ved(hj, 5); P.x = p2.x; P.z = p2.z; P.invuln = 0; P.iframe = 0; P.hp = 1e6; skade.avlopsarm = 0;
            const [dist, vinkel] = mot(a); Havet.grip(a, vinkel); const t = a.teles[a.teles.length - 1], d0 = Math.hypot(P.x - hj.x, P.z - hj.z);
            await til(() => !G.tele.includes(t), 3); await spill(.6); ut.grep = { varsel: !!t, rect: t && t.shape === 'rect', traff: skade.avlopsarm > 0, d0, d1: Math.hypot(P.x - hj.x, P.z - hj.z), ord: !!(P.statusT && P.statusT.GREPET !== undefined) };
            killEntity(a, {}); await spill(.8);
            // høyst tre armer: seks forsøk gir tre armer (hver på sitt sted) og yngel for resten
            P.x = s.x + 30; P.z = s.z + 30; const seks = []; for (let i = 0; i < 6; i++) seks.push(spawnEnemy('avlopsarm', s.x + (i % 2) * .5, s.z, false, 4));
            const armer = seks.filter(e => e.type === 'avlopsarm'); ut.maks = { armer: armer.length, levende: G.enemies.filter(e => e.alive && e.type === 'avlopsarm').length, yngel: seks.filter(e => e.type === 'yngel').length,
              steder: new Set(armer.map(e => e.hjem.x.toFixed(2) + ',' + e.hjem.z.toFixed(2))).size };
            for (const e of seks) killEntity(e, {}); await spill(.8);
            // uten ledig rist: armen tar en vegg (med sprekk) eller slår hull i gulvet, og hullet eller sprekken er borte når den dør
            //  (en rist halvannen rute unna i et annet rom teller ikke: dørene er stengt, og armen der kunne ikke nås)
            const props = G.props; G.props = props.filter(p => p.kind !== 'drain').concat([{ kind: 'drain', x: s.x + 1.5, z: s.z, room: -99 }]); let ah; try { ah = spawnEnemy('avlopsarm', s.x, s.z, false, 4); } finally { G.props = props; }
            const hull = ah.hull, sprekk = ah.mesh; ut.uten = { sted: ah.sted, hull: !!hull && G.puddles.includes(hull), sprekk: !!sprekk && !!sprekk.parent, fremmed: Math.hypot(ah.x - s.x - 1.5, ah.z - s.z) < .05 };
            killEntity(ah, {}); ut.uten.ryddet = (!hull || !G.puddles.includes(hull)) && (!sprekk || !sprekk.parent); await spill(.8);
            // Kapellanen preker for en pleier: farten ganges med 1,2 og kommer nøyaktig tilbake etter seks sekunder, og en ny velsignelse ganger ikke to ganger
            const s1 = ved(s, 3), k = spawnEnemy('kapellan', s1.x, s1.z, false, 4), s2 = freeSpot(s1.x + 1.5, s1.z, 2), pl = spawnEnemy('pleier', s2.x, s2.z, false, 4);
            P.x = s.x + 30; P.z = s.z + 30; k.kallT = 1e9; k.hp = k.max = 100; pl.stun = 99; pl.hp = pl.max = 1e6; await til(() => k.state !== 'spawn' && pl.state !== 'spawn');
            const sp0 = pl.sp; k.state = 'chase'; Havet.preken(k); k.prekenT = 1e9; ut.preken = { kanal: k.state === 'wind' && !!k.preken };
            ut.preken.underveis = pl.velsignet ? 'for tidlig' : 'ok'; await til(() => !!pl.velsignet, 3); await spill(.1);
            ut.preken.fart = pl.sp / sp0; Havet.velsign(k); ut.preken.toGanger = pl.sp / sp0; k.cd = 99;
            await til(() => !pl.velsignet, 7.5); ut.preken.tilbake = pl.sp - sp0; ut.preken.flagg = !pl.velsignet;
            // treghet (frost, surkål) og velsignelse om hverandre: begge virker samtidig, og farten er tilbake når begge har gått ut
            const frost = async forst => { k.x = pl.x + 1; k.z = pl.z; if (forst) { pl.slowT = 3; await spill(.2); Havet.velsign(k); } else { Havet.velsign(k); await spill(.2); pl.slowT = 3; }
              await spill(.3); const midt = pl.sp / sp0; await til(() => !pl.velsignet && !(pl.slowT > 0) && !pl.baseSp, 9); await spill(.2); const slutt = pl.sp - sp0; pl.sp = sp0; return { midt, slutt }; };
            ut.frost = { velsignetForst: await frost(false), tregForst: await frost(true) };
            // avbrutt preken: 20 prosent av helsa midt i gir «Amen?!» og ingen velsignelse
            k.state = 'chase'; k.stun = 0; Havet.preken(k); k.prekenT = 1e9; await spill(.5); hurt(k, 20, { from: 'player' }); await spill(.25);
            const amen = [...document.querySelectorAll('#fx .bubble')].some(b => b.textContent === 'Amen?!') && k.preken === null;
            await spill(2); ut.avbrutt = { fart: pl.sp - sp0, flagg: !!pl.velsignet, amen };
            killEntity(pl, {});
            // kall fra dypet: ringen på risten, og så kommer en arm opp der
            // (han har gått mot pasienten langt unna, så han settes tilbake ved risten)
            const kultS = freeSpot(k.x + 1.2, k.z + 1, 2), kult = spawnEnemy('kultist', kultS.x, kultS.z, false, 4); kult.cd = 99; kult.speechT = 1e9;
            await til(() => kult.state !== 'spawn'); P.x = s.x + 30; P.z = s.z + 30; k.state = 'chase'; k.stun = 0; k.cd = 99; k.kallT = 0; k.prekenT = 1e9; k.x = s1.x; k.z = s1.z;
            const fri = Havet.slukNaer(k.x, k.z, 8, null, G.F.roomId[Math.floor(k.z) * G.F.W + Math.floor(k.x)]); { const [dist, v] = mot(k); Grotesk.ai.kapellan(k, P, dist, v); } const kt = k.teles[k.teles.length - 1];
            ut.kall = { fri: !!fri, varsel: !!kt && kt.shape === 'circle' && fri && Math.hypot(kt.o.x - fri.x, kt.o.z - fri.z) < .05 };
            await til(() => G.enemies.some(e => e.alive && e.type === 'avlopsarm'), 3); const ny = G.enemies.find(e => e.alive && e.type === 'avlopsarm');
            ut.kall.arm = !!ny && !!fri && Math.hypot(ny.x - fri.x, ny.z - fri.z) < .05; ut.kall.oppe = !!ny && ny.fase === 'opp' && !ny.dukket;
            if (ny) killEntity(ny, {});
            // døden: kultisten ved siden av står og ser etter ham (pose tar dobbel skade)
            const kd = freeSpot(k.x + 1, k.z, 2); kult.x = kd.x; kult.z = kd.z; kult.state = 'chase'; await spill(.1); killEntity(k, {}); ut.dod = { pose: kult.state === 'pose' && kult.pose > 0 }; killEntity(kult, {}); await spill(.8);
            // Enkel grafikk: arm og kapellan i kamp uten feil
            R.safe = true; const sa = spawnEnemy('avlopsarm', s.x, s.z, false, 4), sk = spawnEnemy('kapellan', ved(s, 4).x, ved(s, 4).z, false, 4); const p3 = ved(s, 2.4); P.x = p3.x; P.z = p3.z; P.hp = 1e6; P.invuln = 999;
            const S = {}; Klokke.til(() => { S[sa.state] = 1; S['k' + sk.state] = 1; return false; }, 5); ut.safe = S; R.safe = false;
            for (const e of [sa, sk]) if (e.alive) killEntity(e, {});
          } finally { Havet.treff = _ht; R.safe = false; Klokke.slipp(); }
          ut.info = ['avlopsarm', 'kapellan'].every(t => (FIENDE_INFO[t] || [])[0] && FIENDE_INFO[t][1] && FIENDE_REKKE.includes(t) && MESTER_TITTEL[t] && FIENDESTEMME[t] && LINES[t] && DEATH_CAUSES[t]) && !ROLLER.avlopsarm && !ROLLER.kapellan;
          ut.bilde = ['avlopsarm', 'kapellan'].map(t => { const c = fiendeBilde(t, 160, 190), d = c.getContext('2d').getImageData(0, 0, 160, 190).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 100) n++; return n / (160 * 190); });
          const tell = (d, t) => DEPTH_ENEMIES[d].filter(x => x === t).length;
          ut.pulje = { 3: [tell(3, 'avlopsarm'), tell(3, 'kapellan')], 4: [tell(4, 'avlopsarm'), tell(4, 'kapellan')], 6: [tell(6, 'avlopsarm'), tell(6, 'kapellan')] };
          return ut; })()""")
    sjekk('Havet under huset finnes (Havet i 49_havet.js)', not hv.get('mangler'), hv.get('mangler', ''))
    if not hv.get('mangler'):
        E = hv['etasjer']
        sjekk('Avløpsarmen legger an innen 6 og skader innen 20 sekunder spilltid på etasje 3, 4 og 6, Kapellanen på 4 og 6', all(not E[d].get('utenSluk') and all(E[d][t].get('wind') is not None and E[d][t]['wind'] <= 6 and E[d][t].get('skade') is not None and E[d][t]['skade'] <= 20 for t in E[d]) for d in ['3', '4', '6']) and 'k' in E['4'] and 'k' in E['6'], E)
        u, o = hv['under'], hv['oppe']
        sjekk('under risten er armen skjult, tar ingen skade, kaster ingen lykteskygge og er ikke nærmest', u['dukket'] and u['skjult'] and u['skade'] == 0 and u['hp'] and not u['skygge'] and not u['naermest'] and u['iSluk'], u)
        sjekk('når pasienten kommer nær, er armen oppe innen et sekund, og da tar den skade, kaster skygge og er nærmest', o['kom'] and o['tid'] <= 1.0 and o['skade'] and o['skygge'] and o['naermest'] and o['synlig'], o)
        sjekk('tentakkelen tegnes i begge strekbåndene innenfor plassen, og tuppen beveger seg selv når armen står stille', 0 < o['baand'][0] < 3200 and 0 < o['baand'][1] < 3200 and o['lever'] > .01, o)
        rf = hv['rettferdig']
        sjekk('med pasienten innen fem ruter er armen aldri under lenger enn 2,6 sekunder spilltid, og den dykker og kommer opp igjen', rf['avstand'] <= 5 and rf['dykk'] >= 1 and rf['maksUnder'] <= 2.6, rf)
        g = hv['grep']
        sjekk('grepet (en smal stripe) treffer og drar pasienten minst en rute nærmere risten, med GREPET', g['varsel'] and g['rect'] and g['traff'] and g['d1'] < g['d0'] - 1 and g['ord'], g)
        m = hv['maks']
        sjekk('seks forsøk gir høyst tre armer, hver på sitt sted, og resten blir yngel', m['armer'] == 3 and m['levende'] == 3 and m['yngel'] == 3 and m['steder'] == 3, m)
        ue = hv['uten']
        sjekk('uten ledig rist tar armen en vegg med sprekk eller slår hull i gulvet, og det er ryddet bort når den dør', (ue['sted'] == 'vegg' and ue['sprekk']) or (ue['sted'] == 'gulv' and ue['hull']), ue)
        sjekk('sprekken eller hullet etter armen er borte når den dør', ue['ryddet'], ue)
        sjekk('armen tar aldri en rist i et annet rom', not ue['fremmed'], ue)
        pk = hv['preken']
        sjekk('en fullført preken gir pleieren 1,2 ganger farten, en ny velsignelse ganger ikke to ganger, og etter seks sekunder er farten nøyaktig tilbake', pk['kanal'] and pk['underveis'] == 'ok' and abs(pk['fart'] - 1.2) < 1e-6 and abs(pk['toGanger'] - 1.2) < 1e-6 and abs(pk['tilbake']) < 1e-6 and pk['flagg'], pk)
        sjekk('treghet og velsignelse om hverandre: 0,55 ganger 1,2 mens begge virker, og farten nøyaktig tilbake etterpå (uansett hvem som kom først)', all(abs(x['midt'] - .66) < 1e-6 and abs(x['slutt']) < 1e-6 for x in hv['frost'].values()), hv['frost'])
        sjekk('en preken som blir avbrutt av 20 prosent skade, gir ingen velsignelse', hv['avbrutt']['fart'] == 0 and not hv['avbrutt']['flagg'] and hv['avbrutt']['amen'], hv['avbrutt'])
        sjekk('kall fra dypet: ringen på en ledig rist, og så kommer en arm opp akkurat der', hv['kall']['fri'] and hv['kall']['varsel'] and hv['kall']['arm'] and hv['kall']['oppe'], hv['kall'])
        sjekk('når Kapellanen dør, står kultisten ved siden av og ser etter ham', hv['dod']['pose'], hv['dod'])
        sjekk('i Enkel grafikk kjemper begge uten feil (armen legger an)', hv['safe'].get('wind') == 1, hv['safe'])
        sjekk('fiendeindeksen, replikker, stemmer, dødsårsaker og mestertitler for begge, og ingen av dem i ROLLER', hv['info'], hv)
        sjekk('fiendeBilde tegner begge', all(x > .06 for x in hv['bilde']), hv['bilde'])
        sjekk('Avløpsarmen i Underetasjen (to), Kjelleren og Dypet (to), Kapellanen i Kjelleren og Dypet', hv['pulje'] == {'3': [2, 0], '4': [1, 1], '6': [2, 1]}, hv['pulje'])
    await pg.screenshot(path='/tmp/e_60_havet.png')
    sjekk('ingen konsollfeil (Havet under huset)', not pg.errs, pg.errs[:6])
    # håndbokssiden med begge: får plass, og kortene har bilde (vent på tittelen, ellers lukker den håndboka)
    await pg.goto(URL); await pg.wait_for_function("() => window.MORBIDIUM && MORBIDIUM.state === 'title'", timeout=60000); await pg.wait_for_timeout(500)
    hb = await pg.evaluate("""() => { if (!FIENDE_REKKE.includes('avlopsarm')) return { mangler: true }; const kap = HANDBOK.findIndex(h => h.id === 'fiender'), per = document.body.clientWidth <= 700 ? 2 : 4; openHandbook({}, kap, Math.floor(FIENDE_REKKE.indexOf('avlopsarm') / per));
          return { navn: [...document.querySelectorAll('.fkort .fnavn')].map(e => e.textContent) }; }""")
    await pg.wait_for_timeout(300)
    hb['plass'] = await pg.evaluate(HB_PLASS) if not hb.get('mangler') else False
    sjekk('håndboka har en side med Avløpsarmen og Kapellanen, og den får plass', 'Avløpsarmen' in hb.get('navn', []) and 'Kapellanen' in hb.get('navn', []) and hb['plass'], hb)
    await pg.screenshot(path='/tmp/e_60_handbok.png')
    sjekk('ingen konsollfeil (Havet i håndboka)', not pg.errs, pg.errs[:6])
    await pg.close()
    # 3D: armen kommer opp av risten og legger an, og Kapellanen preker. Testklokka står når vilkåret er nådd, så skjermbildet viser det
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg, url=URL3D)
    d3 = await pg.evaluate(FAST + """(() => { const G = MORBIDIUM, P = G.player, ut = {};
          if (typeof Havet !== 'object') return { mangler: true };
          const sluk = r => G.props.filter(p => p.kind === 'drain' && p.room === r.id);
          const ved = (s, d) => { const rid = G.F.roomId[Math.floor(s.z) * G.F.W + Math.floor(s.x)]; for (let i = 0; i < 24; i++) { const v = i / 24 * Math.PI * 2, x = s.x + Math.sin(v) * d, z = s.z + Math.cos(v) * d; if (!solid(Math.floor(x), Math.floor(z)) && !solid(Math.floor(x + .3), Math.floor(z)) && !solid(Math.floor(x - .3), Math.floor(z)) && G.F.roomId[Math.floor(z) * G.F.W + Math.floor(x)] === rid && los(s.x, s.z, x, z)) return { x, z }; } return null; };
          const r = fastEtasje(4, r => r.props.some(p => p.k === 'drain'), [7, 7], [], r => { const s = sluk(r)[0]; return !!s && !!ved(s, 2.2) && !!ved(s, 3.9); }), s = sluk(r)[0];
          P.hp = P.maxHp = 1e6; ut.d3 = D3.on;
          const p0 = ved(s, 2.2); P.x = p0.x; P.z = p0.z; R.snapCamera(P.x, P.z);
          const a = spawnEnemy('avlopsarm', s.x, s.z, false, 4), ks = ved(s, 3.9), k = spawnEnemy('kapellan', ks.x, ks.z, false, 4); k.kallT = 1e9;
          const S = { a: {}, k: {} }; let baand = 0;
          Klokke.til(() => { P.hp = 1e6; P.invuln = 999; S.a[a.fase + ':' + a.state] = 1; if (k.preken) S.k.preken = 1; baand = Math.max(baand, a.doll.back.n); return S.a['opp:wind'] && S.k.preken; }, 14);
          ut.S = S; ut.baand = baand; return ut; })()""")
    sjekk('i 3D kommer armen opp av risten og legger an, og Kapellanen preker', not d3.get('mangler') and d3.get('d3') and d3['S']['a'].get('opp:wind') and d3['S']['k'].get('preken') and 0 < d3['baand'] < 3200, d3)
    await pg.screenshot(path='/tmp/e_60_havet_3d.png')
    sjekk('ingen konsollfeil (Havet under huset i 3D)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_61(b):
    # 61) Draugen og Holdningssøsteren: begge går til angrep der de hører hjemme, draugen blir friskere bare i vann (høyst halve helsa,
    #     ikke i strøm), froskehoppet lander på et fritt sted, bekkenet gjør deg VÅT, snøringen varer til du ruller deg løs,
    #     lauget slår hardere mens du er snørt (og nøyaktig tilbake etterpå), og hun snører aldri en pasient som er slått ut
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg)
    ds = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), ut = { etasjer: {} },
            til = async (f, t = 4, maks = 60000) => { const g0 = G.time, t0 = performance.now(); while (!f() && G.time - g0 < t && performance.now() - t0 < maks) await vent(40); return !!f(); },
            spill = async (t, maks = 40000) => { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < t && performance.now() - t0 < maks) await vent(40); };
          if (typeof Havet !== 'object' || typeof Laug !== 'object' || !ENEMIES.draug || !ENEMIES.holdning) return { mangler: true };
          const skade = {}, _ht = Havet.treff, _lt = Laug.treff;
          Havet.treff = function (shape, o, dmg, src) { const r = _ht.apply(Havet, arguments); if (r && src) skade[src.type] = (skade[src.type] || 0) + 1; return r; };
          Laug.treff = function (shape, o, dmg, src) { const r = _lt.apply(Laug, arguments); if (r && src) skade[src.type] = (skade[src.type] || 0) + 1; return r; };
          const rom = () => { const r = G.F.rooms.find(r => r.role === 'combat' && r.w >= 9 && r.h >= 9) || G.F.rooms.find(r => r.role === 'combat' && r.w >= 7 && r.h >= 7) || G.F.rooms.find(r => r.role === 'combat') || G.F.rooms[0]; P.x = r.x + r.w / 2; P.z = r.z + r.h / 2; return r; };
          // et fritt sted d ruter fra pasienten, med fri sikt
          const ved = d => { for (let i = 0; i < 32; i++) { const v = i / 32 * Math.PI * 2, x = P.x + Math.sin(v) * d, z = P.z + Math.cos(v) * d; if (!solid(Math.floor(x), Math.floor(z)) && !solid(Math.floor(x + .45), Math.floor(z)) && !solid(Math.floor(x - .45), Math.floor(z)) && !solid(Math.floor(x), Math.floor(z + .45)) && !solid(Math.floor(x), Math.floor(z - .45)) && los(P.x, P.z, x, z)) return { x, z }; } return freeSpot(P.x + d, P.z, 3); };
          const mot = e => [Math.hypot(P.x - e.x, P.z - e.z), Math.atan2(P.x - e.x, P.z - e.z)], nullstill = () => { P.invuln = 0; P.iframe = 0; P.stunT = 0; P.snortT = 0; P.mokkT = 0; P.roll = 0; P.statusT = {}; };
          try {
            // hver type der den hører hjemme: legger an innen 6 sekunder spilltid og skader en pasient med 400 i helse innen 20
            for (const [d, typer] of [[3, ['draug']], [4, ['holdning']], [5, ['draug']], [6, ['draug', 'holdning']]]) {
              startFloor(d, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } rolig(); rom(); P.hp = P.maxHp = 400; nullstill(); for (const k in skade) delete skade[k];
              const fi = typer.map((t, i) => { const s = ved(i ? 5 : 3.5); return spawnEnemy(t, s.x, s.z, false, d); }), E = {}; typer.forEach(t => E[t] = {});
              const g0 = G.time, t0 = performance.now();
              while (G.time - g0 < 20 && performance.now() - t0 < 120000) { await vent(60); const t = G.time - g0; if (P.hp < 150) P.hp = 400;
                fi.forEach((e, i) => { const T = typer[i]; if (e.state === 'wind' && E[T].wind === undefined) E[T].wind = t; if (skade[T] && E[T].skade === undefined) E[T].skade = t; });
                if (typer.every(T => E[T].skade !== undefined)) break; }
              ut.etasjer[d] = E; for (const e of fi) if (e.alive) killEntity(e, {}); await spill(.3);
            }
            rolig(); rom(); P.hp = P.maxHp = 1e6; nullstill();
            // draugen i vann: ingenting på tørt gulv, to i sekundet i en pytt, ingenting når det går strøm i den, og aldri mer enn halve helsa per liv
            const sd = ved(4.5), dr = spawnEnemy('draug', sd.x, sd.z, false, 6); await til(() => dr.state !== 'spawn'); dr.stun = 1e9; dr.cd = 1e9; dr.max = 1e4; // mye helse, så strømmen ikke tar livet av den
            for (const p of G.puddles.slice()) if (Math.hypot(p.x - dr.x, p.z - dr.z) < p.r + 1.5) { R.remove(p.mesh); G.puddles.splice(G.puddles.indexOf(p), 1); }
            dr.hp = 3000; let h0 = dr.hp; await spill(2); const torr = dr.hp - h0;
            const pytt = addPuddle(dr.x, dr.z, 'wet', 1.3, 60); h0 = dr.hp; let g0 = G.time; await spill(2); const vaat = (dr.hp - h0) / (G.time - g0);
            pytt.elec = 6; const helt0 = dr.helt; await spill(1.5); const strom = { helt: dr.helt - helt0, zapp: dr.hp < h0 + vaat * 2 }; pytt.elec = 0;
            await spill(.3); dr.helt = dr.max * .5 - 1; dr.hp = 10; await spill(2.5); const tak = { etter: dr.hp - 10, helt: dr.helt / dr.max };
            ut.lege = { torr, vaat, strom, tak, max: dr.max }; killEntity(dr, {}); await spill(.8);
            // froskehoppet: ring på 1,3 ved pasienten, dukken letter, kroppen står stille i sammenkrøkingen og lander der ringen var, i et nytt tjern
            rolig(); rom(); nullstill(); const sh = ved(5.5), dh = spawnEnemy('draug', sh.x, sh.z, false, 6); await til(() => dh.state !== 'spawn'); dh.cd = 1e9;
            { dh.state = 'chase'; const [dist, a] = mot(dh); const x0 = dh.x, z0 = dh.z; skade.draug = 0; const p0 = { x: P.x, z: P.z }; Havet.hopp(dh, P, a); const t = dh.teles[dh.teles.length - 1], mal = { x: t.o.x, z: t.o.z };
              let maksY = 0, stilleVed = null; const g1 = G.time, t1 = performance.now();
              while (G.tele.includes(t) && performance.now() - t1 < 60000) { await vent(25); maksY = Math.max(maksY, dh.doll.plane.position.y); if (G.time - g1 > .6 && stilleVed === null) stilleVed = Math.hypot(dh.x - x0, dh.z - z0); }
              await spill(.1); const tj = G.puddles.find(p => p.kind === 'tjern' && Math.hypot(p.x - mal.x, p.z - mal.z) < .3);
              ut.hopp = { sirkel: t.shape === 'circle' && t.o.r === 1.3, naerPas: Math.hypot(mal.x - p0.x, mal.z - p0.z) < 1.2, positur: true, maksY, stilleVed, fra: Math.hypot(dh.x - mal.x, dh.z - mal.z), start: Math.hypot(x0 - mal.x, z0 - mal.z), fritt: !solid(Math.floor(dh.x), Math.floor(dh.z)), tjern: !!tj && tj.r >= 1.2, traff: skade.draug > 0 }; }
            // hoppet mot en vegg: draugen stopper ved veggen og står aldri inne i den
            { await spill(.8); dh.state = 'chase'; dh.cd = 1e9; const r = rom(), vx = r.x + r.w; let zc = Math.floor(r.z + r.h / 2); for (let z = r.z + 1; z < r.z + r.h - 1; z++) if (solid(vx, z) && solid(vx, z - 1) && solid(vx, z + 1) && !solid(vx - 1, z) && !solid(vx - 3, z)) { zc = z; break; }
              const T = { x: vx + 3, z: zc + .5 }; dh.x = vx - 2.5; dh.z = zc + .5; P.x = r.x + 1.5; P.z = zc + .5; P.invuln = 999;
              Havet.hopp(dh, T, Math.atan2(T.x - dh.x, T.z - dh.z)); const t = dh.teles[dh.teles.length - 1]; await til(() => !G.tele.includes(t), 3); await spill(.1);
              ut.vegg = { fritt: !solid(Math.floor(dh.x), Math.floor(dh.z)) && !solid(Math.floor(dh.x + dh.r * .9), Math.floor(dh.z)), x: dh.x - vx, mal: t.o.x - vx, veggFunnet: solid(vx, zc) }; }
            // bekkenet: en kjegle som gjør pasienten VÅT (treg en stund) og legger en pytt der han står
            { rom(); nullstill(); await spill(.8); const s = ved(3); dh.x = s.x; dh.z = s.z; dh.state = 'chase'; dh.stun = 0; await spill(.1); dh.x = s.x; dh.z = s.z; P.invuln = 0; skade.draug = 0;
              const [dist, a] = mot(dh); Havet.skvett(dh, P, a); const t = dh.teles[dh.teles.length - 1]; await til(() => !G.tele.includes(t), 3);
              ut.skvett = { kjegle: t.shape === 'cone' && t.o.r === 3.2, traff: skade.draug > 0, vaat: P.vaatT, ord: !!(P.statusT && P.statusT['VÅT'] !== undefined), pytt: G.puddles.some(p => p.kind === 'wet' && Math.hypot(p.x - P.x, p.z - P.z) < 1.5) };
              await spill(.7); ut.skvett.varer = { vaat: P.vaatT, mokk: P.mokkT }; }
            killEntity(dh, {}); await spill(.8);
            // Holdningssøsteren snører: SNØRT varer (selv om myra bare gir et øyeblikk), lauget slår 25 prosent hardere i fire sekunder og nøyaktig tilbake etterpå
            // pyttene fra draugen tas bort først, ellers kan søsteren skli i dem og miste snøringen (enemySlip avbryter varselet)
            rolig(); rom(); nullstill(); for (const p of G.puddles.splice(0)) R.remove(p.mesh); const s1 = ved(4.5), hs = spawnEnemy('holdning', s1.x, s1.z, false, 4), s2 = freeSpot(s1.x + 1.2, s1.z + .8, 2), la = spawnEnemy('laerling', s2.x, s2.z, false, 4), s3 = ved(-1), pl = spawnEnemy('pleier', P.x + 30, P.z + 30, false, 4);
            await til(() => hs.state !== 'spawn' && la.state !== 'spawn'); la.stun = 1e9; pl.stun = 1e9; hs.cd = 1e9;
            const d0 = { hs: hs.dmg, la: la.dmg, pl: pl.dmg }, sp = Sound.play; let reimer = 0; const _rm = Laug.reimer; Laug.reimer = function () { const n = _rm.apply(Laug, arguments); reimer += n; return n; };
            { hs.state = 'chase'; const [dist, a] = mot(hs); Laug.snor(hs, P, a); const t = hs.teles[hs.teles.length - 1]; await til(() => !G.tele.includes(t), 3); await spill(.05);
              ut.snor = { sirkel: t.shape === 'circle' && t.o.r === 1.25, snort: P.snortT, ord: !!(P.statusT && P.statusT['SNØRT'] !== undefined), la: la.dmg / d0.la, hs: hs.dmg / d0.hs, pl: pl.dmg / d0.pl, reimer, reimTegnet: Kjeder.liste.filter(K => K.reim).length, tilstand: [hs.state, +(hs.slip > 0), +(hs.stun > 0), +(hs.sleep > 0)], pytter: G.puddles.length };
              const stramme = () => Kjeder.liste.filter(K => K.reim && K.t >= K.inn && K.t < K.inn + K.hold).length;
              await spill(1.2); ut.snor.varer = { snort: P.snortT, mokk: P.mokkT, stramme: stramme() };
              // en rulle løser snøret med en gang
              P.roll = .34; P.rollA = 0; await spill(.05); ut.snor.rulle = { snort: P.snortT, mokk: P.mokkT, ord: !!P.statusT['LØS'], stramme: stramme() };
              await spill(.5); ut.snor.rulle.reimIgjen = Kjeder.liste.filter(K => K.reim).length;
              await til(() => !la.rettet && !hs.rettet, 5); await spill(.1); ut.snor.tilbake = { la: la.dmg - d0.la, hs: hs.dmg - d0.hs, flagg: !la.rettet && !hs.rettet }; }
            // aldri på en pasient som er slått ut: ingen snøring når han er slått ut, og en som blir slått ut før ringen går av, blir ikke snørt
            { nullstill(); P.stunT = 3; let brune = 0; for (let i = 0; i < 12; i++) { hs.state = 'chase'; hs.stun = 0; const n0 = hs.teles.length, [dist, a] = mot(hs); Grotesk.ai.holdning(hs, P, dist, a); brune += hs.teles.slice(n0).filter(t => t.shape === 'circle').length; hs.state = 'chase'; }
              ut.slaatt = { brune, snort: P.snortT }; nullstill(); await spill(.3); hs.state = 'chase'; hs.stun = 0; const [dist, a] = mot(hs); Laug.snor(hs, P, a); const t = hs.teles[hs.teles.length - 1];
              await spill(.6); P.stunT = 1; await til(() => !G.tele.includes(t), 3); await spill(.05); ut.slaatt.underveis = P.snortT; }
            // tommestokken på kloss hold: en kjegle på 2,2 som treffer
            { nullstill(); await spill(.8); const s = ved(1.5); hs.x = s.x; hs.z = s.z; hs.state = 'chase'; hs.stun = 0; skade.holdning = 0; const n0 = hs.teles.length, [dist, a] = mot(hs); Grotesk.ai.holdning(hs, P, dist, a);
              const t = hs.teles[n0]; if (t) await til(() => !G.tele.includes(t), 3); await spill(.05); ut.linjal = { kjegle: !!t && t.shape === 'cone' && t.o.r === 2.2, traff: skade.holdning > 0 }; }
            // Enkel grafikk: ingen reimer tegnes, men snøringen virker
            { nullstill(); await spill(.8); R.safe = true; const s = ved(4.5); hs.x = s.x; hs.z = s.z; hs.state = 'chase'; hs.stun = 0; reimer = 0; const k0 = Kjeder.liste.length, [dist, a] = mot(hs); Laug.snor(hs, P, a); const t = hs.teles[hs.teles.length - 1];
              let kj = 0; { const g2 = G.time, t2 = performance.now(); while (G.tele.includes(t) && performance.now() - t2 < 30000) { kj = Math.max(kj, Kjeder.liste.length - k0); await vent(30); } } await spill(.05);
              ut.safe = { reimer, kjeder: kj, snort: P.snortT > 2 }; R.safe = false; }
            Laug.reimer = _rm; for (const e of [hs, la, pl]) if (e.alive) killEntity(e, {});
          } finally { Havet.treff = _ht; Laug.treff = _lt; R.safe = false; }
          ut.info = ['draug', 'holdning'].every(t => (FIENDE_INFO[t] || [])[0] && FIENDE_INFO[t][1] && FIENDE_REKKE.includes(t) && MESTER_TITTEL[t] && FIENDESTEMME[t] && LINES[t] && DEATH_CAUSES[t]) && !ROLLER.draug && !ROLLER.holdning;
          ut.bilde = ['draug', 'holdning'].map(t => { const c = fiendeBilde(t, 160, 190), d = c.getContext('2d').getImageData(0, 0, 160, 190).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 100) n++; return n / (160 * 190); });
          const tell = (d, t) => DEPTH_ENEMIES[d].filter(x => x === t).length;
          ut.pulje = { draug: [3, 4, 5, 6].map(d => tell(d, 'draug')), holdning: [3, 4, 5, 6].map(d => tell(d, 'holdning')) };
          return ut; }""")
    sjekk('Draugpleieren og Holdningssøsteren finnes (ENEMIES, Havet og Laug)', not ds.get('mangler'), ds.get('mangler', ''))
    if not ds.get('mangler'):
        E = ds['etasjer']
        sjekk('begge legger an innen 6 og skader innen 20 sekunder spilltid der de hører hjemme (draugen på 3, 5 og 6, søsteren på 4 og 6)', all(E[d][t].get('wind') is not None and E[d][t]['wind'] <= 6 and E[d][t].get('skade') is not None and E[d][t]['skade'] <= 20 for d in E for t in E[d]), E)
        lg = ds['lege']
        sjekk('draugen blir ikke friskere på tørt gulv, men omtrent to i sekundet i en pytt', abs(lg['torr']) < 1e-9 and 1.6 < lg['vaat'] < 2.4, lg)
        sjekk('draugen blir ikke friskere når det går strøm i vannet', lg['strom']['helt'] == 0 and lg['strom']['zapp'], lg)
        sjekk('draugen blir aldri friskere enn halve helsa per liv', 0 < lg['tak']['etter'] <= 1.0001 and abs(lg['tak']['helt'] - .5) < 1e-6, lg)
        h = ds['hopp']
        sjekk('froskehoppet: ring på 1,3 ved pasienten, dukken letter over en halv rute, og kroppen står stille mens den krøker seg sammen', h['sirkel'] and h['naerPas'] and h['maksY'] > .5 and h['stilleVed'] is not None and h['stilleVed'] < .5 and h['start'] > 3, h)
        sjekk('froskehoppet lander der ringen var, på fritt gulv, i et nytt tjern, og treffer pasienten', h['fra'] < .6 and h['fritt'] and h['tjern'] and h['traff'], h)
        sjekk('hopper draugen mot en vegg, stopper den ved veggen og står aldri inne i den', ds['vegg']['veggFunnet'] and ds['vegg']['fritt'] and ds['vegg']['x'] < .2 and ds['vegg']['mal'] > 1, ds['vegg'])
        sk = ds['skvett']
        sjekk('bekkenet (en kjegle på 3,2) gjør pasienten VÅT: treg en stund, med en pytt der han står', sk['kjegle'] and sk['traff'] and 1 < sk['vaat'] <= 1.2 and sk['varer']['vaat'] > .2 and sk['varer']['mokk'] > 0 and sk['ord'] and sk['pytt'], sk)
        sn = ds['snor']
        sjekk('snøringen (ring på 1,25) gir SNØRT i 2,5 sekunder, og to lærreimer fra hendene hennes', sn['sirkel'] and 2.2 < sn['snort'] <= 2.5 and sn['ord'] and sn['reimer'] == 2 and sn['reimTegnet'] == 2, sn)
        sjekk('mens pasienten er snørt, slår lauget innen åtte ruter 25 prosent hardere, men ikke pleieren utenfor lauget', abs(sn['la'] - 1.25) < 1e-9 and abs(sn['hs'] - 1.25) < 1e-9 and sn['pl'] == 1, sn)
        sjekk('snøret varer: over et sekund senere er pasienten fortsatt treg, og de to reimene holder ham fortsatt', sn['varer']['snort'] > .8 and sn['varer']['mokk'] > 0 and sn['varer']['stramme'] == 2, sn['varer'])
        sjekk('en rulle løser snøret med en gang (LØS), og reimene slipper og er borte et halvt sekund etter', sn['rulle']['snort'] == 0 and sn['rulle']['mokk'] <= 0 and sn['rulle']['ord'] and sn['rulle']['stramme'] == 0 and sn['rulle']['reimIgjen'] == 0, sn['rulle'])
        sjekk('etter fire sekunder er laugets skade nøyaktig tilbake', abs(sn['tilbake']['la']) < 1e-9 and abs(sn['tilbake']['hs']) < 1e-9 and sn['tilbake']['flagg'], sn['tilbake'])
        sjekk('hun snører aldri en pasient som er slått ut, heller ikke når han blir slått ut før ringen går av', ds['slaatt']['brune'] == 0 and not ds['slaatt']['snort'] and not ds['slaatt']['underveis'], ds['slaatt'])
        sjekk('tommestokken på kloss hold: en kjegle på 2,2 som treffer', ds['linjal']['kjegle'] and ds['linjal']['traff'], ds['linjal'])
        sjekk('i Enkel grafikk tegnes ingen reimer, men snøringen virker', ds['safe'] == {'reimer': 0, 'kjeder': 0, 'snort': True}, ds['safe'])
        sjekk('fiendeindeksen, replikker, stemmer, dødsårsaker og mestertitler for begge, og ingen av dem i ROLLER', ds['info'], ds)
        sjekk('fiendeBilde tegner begge', all(x > .06 for x in ds['bilde']), ds['bilde'])
        sjekk('draugen i Underetasjen, Nattskogen og Dypet (to), søsteren i Kjelleren og Dypet', ds['pulje'] == {'draug': [1, 0, 1, 2], 'holdning': [0, 1, 0, 1]}, ds['pulje'])
    await pg.screenshot(path='/tmp/e_61_draug_soster.png')
    sjekk('ingen konsollfeil (Draugen og Holdningssøsteren)', not pg.errs, pg.errs[:6])
    # håndbokssidene med begge: får plass, og kortene har bilde (vent på tittelen, ellers lukker den håndboka)
    await pg.goto(URL); await pg.wait_for_function("() => window.MORBIDIUM && MORBIDIUM.state === 'title'", timeout=60000); await pg.wait_for_timeout(500)
    hbs = []
    for t in ['draug', 'holdning']:
        hb = await pg.evaluate("""t => { if (!FIENDE_REKKE.includes(t)) return { mangler: true }; const kap = HANDBOK.findIndex(h => h.id === 'fiender'), per = document.body.clientWidth <= 700 ? 2 : 4; openHandbook({}, kap, Math.floor(FIENDE_REKKE.indexOf(t) / per));
              return { navn: [...document.querySelectorAll('.fkort .fnavn')].map(e => e.textContent) }; }""", t)
        await pg.wait_for_timeout(300)
        hb['plass'] = await pg.evaluate(HB_PLASS) if not hb.get('mangler') else False
        hbs.append(hb)
        await pg.screenshot(path=f'/tmp/e_61_handbok_{t}.png')
    sjekk('håndboka har Draugpleieren og Holdningssøsteren, og sidene får plass', 'Draugpleieren' in hbs[0].get('navn', []) and 'Holdningssøsteren' in hbs[1].get('navn', []) and hbs[0]['plass'] and hbs[1]['plass'], hbs)
    sjekk('ingen konsollfeil (Draugen og Holdningssøsteren i håndboka)', not pg.errs, pg.errs[:6])
    await pg.close()
    # 3D: draugen hopper og søsteren snører med reimene, i samme øyeblikk (bildet til Tom)
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg, url=URL3D)
    d3 = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), ut = {};
          if (!ENEMIES.draug || !ENEMIES.holdning) return { mangler: true };
          startFloor(4, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } rolig(); P.hp = P.maxHp = 1e6; P.invuln = 999; ut.d3 = D3.on;
          const r = G.F.rooms.find(r => r.role === 'combat' && r.w >= 10 && r.h >= 8) || G.F.rooms.find(r => r.role === 'combat') || G.F.rooms[0]; P.x = r.x + r.w / 2 + .5; P.z = r.z + r.h / 2 + .5; R.snapCamera(P.x, P.z);
          const s1 = freeSpot(P.x + 4.2, P.z - 1.2, 2), dr = spawnEnemy('draug', s1.x, s1.z, false, 4), s2 = freeSpot(P.x - 3.8, P.z + .4, 2), hs = spawnEnemy('holdning', s2.x, s2.z, false, 4);
          const s3 = freeSpot(P.x - 2.2, P.z - 1.8, 2), la = spawnEnemy('laerling', s3.x, s3.z, false, 4); dr.cd = hs.cd = la.cd = 1e9;
          { const g0 = G.time, t0 = performance.now(); while ((dr.state === 'spawn' || hs.state === 'spawn' || la.state === 'spawn') && performance.now() - t0 < 60000) await vent(50); }
          await vent(300); dr.state = hs.state = 'chase';
          Havet.hopp(dr, P, Math.atan2(P.x - dr.x, P.z - dr.z)); Laug.snor(hs, P, Math.atan2(P.x - hs.x, P.z - hs.z));
          const g0 = G.time, t0 = performance.now(); let maksY = 0, reimer = 0;
          while (G.time - g0 < .98 && performance.now() - t0 < 60000) { await vent(15); maksY = Math.max(maksY, dr.doll.plane.position.y); reimer = Math.max(reimer, Kjeder.liste.filter(K => K.reim).length); }
          G.hitstop = 30; // nesten stillstand mens bildet tas
          ut.maksY = maksY; ut.reimer = Kjeder.liste.filter(K => K.reim && K.m.visible).length; ut.y = dr.doll.plane.position.y; return ut; }""")
    await pg.wait_for_timeout(200)
    await pg.screenshot(path='/tmp/e_61_draug_soster_3d.png')
    sjekk('i 3D letter draugen i hoppet og søsterens to reimer er i lufta samtidig', not d3.get('mangler') and d3.get('d3') and d3['y'] > .5 and d3['reimer'] == 2, d3)
    await pg.evaluate("() => { MORBIDIUM.hitstop = 0; }")
    sjekk('ingen konsollfeil (Draugen og Holdningssøsteren i 3D)', not pg.errs, pg.errs[:6])
    await pg.close()


DELER = {5: del_5, 19: del_19, 20: del_20, 27: del_27, 58: del_58, 59: del_59, 60: del_60, 61: del_61}
