"""Rommene og etasjene: spesialrom, likene, 3D-rommene, seks etasjer, det skjulte rommet, tomrom og ganger.

Testdeler fra test_ekstra.py. Kjøres med python3 tools/test_ekstra.py --system rom_og_etasjer eller --del N.
"""
from .felles import sjekk, ny_side, start_lop, URL, URL3D


async def del_6(b):
    # 6) spesialrom: sprukken vegg, forbannet rom, blodoffer
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg)
    funnet = await pg.evaluate("""() => { const G = MORBIDIUM; for (let s = 1; s < 400; s++) { const F = generateFloor(s * 7919, 2, {}); if (F.rooms.some(r => r.role === 'cursed') && F.rooms.some(r => r.role === 'offer')) { G.run.seed = s * 7919 - 2 * 7919; startFloor(2, false); return { seed: s, roles: G.F.rooms.map(r => r.role) }; } } return null; }""")
    sjekk('fant en etasje med forbannet rom og blodoffer', funnet is not None and 'cursed' in funnet['roles'] and 'offer' in funnet['roles'] and 'secret' in funnet['roles'], funnet)
    # a) hemmelig rom: stå innenfor den sprukne veggen og slå tungt
    r = await pg.evaluate("""() => { const G = MORBIDIUM, F = G.F, P = G.player; G.rooms.forEach(s => s.cleared = true); const c = Spesial.cracks[Math.floor(Spesial.cracks.length / 2)]; const par = F.rooms.find(r => r.role === 'secret'); const parent = F.rooms[par.parent];
            const tx = Math.floor(c.x), tz = Math.floor(c.z); let ix = tx, iz = tz; if (tz === parent.z - 1) iz = tz + 1; else if (tz === parent.z + parent.h) iz = tz - 1; else if (tx === parent.x - 1) ix = tx + 1; else ix = tx - 1;
            P.x = ix + .5; P.z = iz + .5; P.face = Math.atan2(c.x - P.x, c.z - P.z); R.snapCamera(P.x, P.z); return { hp: c.hp, secretReach: false }; }""")
    await pg.wait_for_timeout(600); await pg.screenshot(path='/tmp/e_10sprekk.png')
    # det tunge slaget tar litt spilltid, og testnettleseren går langt under sanntid, så vi venter på spilltiden (høyst fem sekunder spilltid)
    brutt = await pg.evaluate("""async () => { const G = MORBIDIUM, g0 = G.time; startSwing(true, 1);
          for (let i = 0; i < 400 && !Spesial.cracks.every(c => c.broken) && G.time - g0 < 5; i++) await new Promise(r => setTimeout(r, 100));
          return { broken: Spesial.cracks.every(c => c.broken), block: Spesial.cracks.map(c => G.F.block[c.i]), secrets: G.run.secrets || 0 }; }""")
    sjekk('tungt slag knuser den sprukne veggen', brutt['broken'] and brutt['secrets'] == 1 and not any(brutt['block']), brutt)
    # b) forbannet rom: gå inn, ta glasset, overlev bakholdet
    cur = await pg.evaluate("""() => { const G = MORBIDIUM, F = G.F, P = G.player; P.hp = P.maxHp; const r = F.rooms.find(r => r.role === 'cursed'); const h0 = P.hp; const d = r.doors[0]; P.x = d % F.W + .5; P.z = ((d / F.W) | 0) + .5; return { h0, id: r.id }; }""")
    await pg.evaluate("""(id) => { const G = MORBIDIUM, r = G.F.rooms[id], P = G.player; P.x = r.x + r.w / 2; P.z = r.z + r.h / 2 + 1.5; R.snapCamera(P.x, P.z); }""", cur['id'])
    await pg.wait_for_timeout(700); await pg.screenshot(path='/tmp/e_11forbannet.png')
    etter = await pg.evaluate("() => MORBIDIUM.player.hp")
    sjekk('tornene tar et hjerte ved inngangen', cur['h0'] - etter >= 9.9, (cur['h0'], etter))
    await pg.evaluate("() => { const pd = Items.pedestals.find(p => p.cursed); Items.take(pd); }")
    # bakholdet kommer 0,9 sekunder etter at glasset er tatt, og første bølge 0,7 sekunder spilltid etter det; testnettleseren går sakte, så vi venter på spilltiden
    kamp = await pg.evaluate("async () => { for (let i = 0; i < 120 && !MORBIDIUM.enemies.some(e => e.alive); i++) await new Promise(r => setTimeout(r, 100)); return { combat: !!MORBIDIUM.combat, n: MORBIDIUM.enemies.filter(e => e.alive).length, items: MORBIDIUM.run.items.length }; }")
    sjekk('kuriositeten utløser bakhold', kamp['combat'] and kamp['n'] > 0 and kamp['items'] == 1, kamp)
    await pg.screenshot(path='/tmp/e_12bakhold.png')
    # bølgene kommer etter hverandre i spilltid: drep det som lever til kampen er over (høyst 30 sekunder spilltid)
    ryddet = await pg.evaluate("""async () => { const G = MORBIDIUM, g0 = G.time;
          for (let i = 0; i < 1500 && G.combat && G.time - g0 < 30; i++) { for (const e of G.enemies) if (e.alive) hurt(e, 9999, { from: 'player' }); await new Promise(r => setTimeout(r, 100)); }
          return { kamp: !!G.combat, spilltid: +(G.time - g0).toFixed(1) }; }""")
    sjekk('bakholdet kan ryddes', not ryddet['kamp'], ryddet)
    # c) blodoffer
    await pg.evaluate("""() => { const G = MORBIDIUM, P = G.player; P.teeth = 60; P.hp = P.maxHp; const o = G.props.find(o => o.kind === 'offeralter'); P.x = o.x; P.z = o.z + 1.6; R.snapCamera(P.x, P.z); Spesial.offer(o); }""")
    await pg.wait_for_timeout(700); await pg.screenshot(path='/tmp/e_13offer.png')
    await pg.click('[data-ch="0"]'); await pg.wait_for_timeout(600)
    sjekk('alteret tar imot én gave', await pg.evaluate("() => MORBIDIUM.props.find(o => o.kind === 'offeralter').used === true && MORBIDIUM.state === 'play'"))
    sjekk('ingen konsollfeil (spesialrom)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_9(b):
    # 9) likene ligger der pasienten døde, flere i samme etasje
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await pg.goto(URL); await pg.wait_for_timeout(2000); await pg.evaluate("() => localStorage.clear()")
    posisjoner = []
    for i in range(2):
        await start_lop(pg)
        pos = await pg.evaluate("""(i) => { if (MORBIDIUM.depth !== 1) startFloor(1, false); rolig(); const G = MORBIDIUM, P = G.player, r = G.F.rooms.filter(r => r.role === 'combat')[i] || G.F.rooms[1]; const s = freeSpot(r.x + 2.5, r.z + 2.5, 2); P.x = s.x; P.z = s.z; P.invuln = 0; P.iframe = 0; hurt(P, 9999, { type: 'pleier' }); return { x: P.x, z: P.z, d: G.depth }; }""", i)
        posisjoner.append(pos); await pg.wait_for_timeout(2600)
    lik = await pg.evaluate("() => MORBIDIUM.meta.lik.map(l => [l.depth, l.x, l.z])")
    sjekk('hvert dødsfall lagres med posisjon', len(lik) == 2 and all(l[1] > 0 for l in lik), lik)
    await pg.click('#dNew'); await pg.wait_for_timeout(500); await pg.click('[data-awk]'); await pg.wait_for_timeout(1400)
    await pg.evaluate("(d) => { if (MORBIDIUM.depth !== d) startFloor(d, false); }", posisjoner[0]['d'])
    cs = await pg.evaluate("() => MORBIDIUM.corpses.map(c => ({ x: +c.x.toFixed(1), z: +c.z.toFixed(1), name: c.ld.name }))")
    sjekk('begge likene ligger i etasjen', len(cs) == 2, cs)
    # stå ved liket fra en side der det er det nærmeste som kan undersøkes (på kirkegården kan en gravstein stå nærmere)
    pr = await pg.evaluate("""async () => { const C = MORBIDIUM.corpses[0], P = MORBIDIUM.player; rolig(); let pr = '';
          for (const [dx, dz] of [[0, 1.6], [0, .9], [.9, 0], [-.9, 0], [0, -.9]]) { P.x = C.x + dx; P.z = C.z + dz; R.snapCamera(C.x, C.z); await new Promise(r => setTimeout(r, 700)); pr = document.getElementById('prompt').textContent; if (pr.includes('Undersøk liket')) break; }
          return pr; }""")
    await pg.screenshot(path='/tmp/e_19lik.png')
    sjekk('liket kan undersøkes', 'Undersøk liket' in pr, pr)
    sjekk('likene husker utseendet', await pg.evaluate("() => MORBIDIUM.meta.lik.every(l => l.look && l.look.v === 1)"))
    sjekk('ingen konsollfeil (lik)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_15(b):
    # 15) rom i 3D (prøve): kan slås på og av, og følger med til neste etasje
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await pg.goto(URL); await pg.wait_for_timeout(2000); await pg.evaluate("() => localStorage.clear()")
    await start_lop(pg)
    d3 = await pg.evaluate("""async () => { rolig(); MORBIDIUM.meta.settings.d3 = true; applySettings(); await new Promise(r => setTimeout(r, 800));
          const G = MORBIDIUM, tegnet = () => G.props.filter(o => o.g && o.g.userData.m), inst = () => D3.ting.filter(o => o.isInstancedMesh).length;
          const a = { on: D3.on, lister: inst(), lys: D3.pool.filter(l => l.intensity > 0).length, gulv: Paint.mesh.gulv.material.type, glod: R.post.uniforms.uBloom.value > 0, stov: !!D3.stovP,
            skygge: tegnet().filter(o => o.g.userData.m.castShadow).length, synlige: tegnet().every(o => o.g.userData.m.visible), modeller: 'modell' in D3 };
          startFloor(2, false); rolig(); await new Promise(r => setTimeout(r, 800)); a.etasje2 = inst() > 0 && Paint.mesh.gulv.material.type === 'MeshToonMaterial' && tegnet().every(o => o.g.userData.m.visible);
          G.meta.settings.d3 = false; applySettings(); await new Promise(r => setTimeout(r, 300));
          a.av = { gulv: Paint.mesh.gulv.material.type, lys: R.post.uniforms.uLights.value, lister: inst() + R.level.children.filter(o => o.isInstancedMesh).length, synlig: tegnet().every(o => o.g.userData.m.visible), skygger: G.props.every(o => !o.g || !o.g.userData.shadow || o.g.userData.shadow.visible) }; return a; }""")
    sjekk('rom i 3D: lister og pilastre, punktlys, støv og glød, tingene er fortsatt tegningene og kaster skygge, følger med til neste etasje og kan slås av igjen',
          d3['on'] and d3['lister'] > 5 and d3['lys'] > 0 and d3['gulv'] == 'MeshToonMaterial' and d3['glod'] and d3['stov'] and d3['skygge'] > 5 and d3['synlige'] and not d3['modeller'] and d3['etasje2']
          and d3['av'] == {'gulv': 'MeshBasicMaterial', 'lys': 1, 'lister': 0, 'synlig': True, 'skygger': True}, d3)
    sjekk('ingen konsollfeil (3D)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_24(b):
    # 24) seks etasjer: Parken og Nattskogen er ute med hekker, trevegger, bakke og vær; alle rom har gulv og vegg; utgangene fører videre
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg, url=URL3D)
    et = await pg.evaluate("""async () => { const G = MORBIDIUM, ut = {};
          for (let d = 1; d <= 6; d++) {
            startFloor(d, false); rolig(); await new Promise(r => setTimeout(r, 250));
            const F = G.F, stiler = new Set(Paint.mesh.vegger.map(m => m.userData.veggStil));
            ut[d] = { ute: !!F.ute, bakke: !!Paint.mesh.bakke, hekk: stiler.has('hekk'), skog: stiler.has('skog'), stiler: stiler.size, gulv: new Set(F.rooms.map(r => r.gulv)).size, alleHarStil: F.rooms.every(r => r.gulv && r.vegg), vaer: F.vaer, vaerAktiv: Vaer.type, lykter: G.props.filter(o => o.kind === 'lyktestolpe' && o.light).length, navn: G.th.name };
            openTrapdoor(); const P = G.player; P.x = G.trapdoor.x + .5; P.z = G.trapdoor.z + .5; const it = findInteract(); ut[d].utgang = it && it.t === UTGANGER[d].tekst;
            if (d < 6) { descend(); await new Promise(r => setTimeout(r, 200)); if (G.drom) Drom.hopp(); await new Promise(r => setTimeout(r, 100)); ut[d].videre = G.depth === d + 1 && document.getElementById('toast').textContent.includes(UTGANGER[d].ankomst.slice(0, 12)); }
          }
          return ut; }""")
    ok_ute = all(et[str(d)]['ute'] == (d in (1, 5)) and et[str(d)]['bakke'] == (d in (1, 5)) for d in range(1, 7))
    sjekk('Parken og Nattskogen er ute med bakke rundt, de fire andre er inne', ok_ute, et)
    sjekk('parken har hekker og skogen har trær som vegger, og alle rom har eget gulv og egen vegg', et['1']['hekk'] and et['5']['skog'] and all(et[str(d)]['alleHarStil'] and et[str(d)]['gulv'] >= 3 and et[str(d)]['stiler'] >= 2 for d in range(1, 7)), et)
    sjekk('været i parken og skogen, og gasslyktene i parken lyser', et['1']['vaer'] in ('regn', 'sno', 'taake', 'klart') and et['5']['vaer'] in ('sno', 'ildfluer', 'taake') and et['1']['lykter'] > 0, et)
    sjekk('hver etasje har sin utgang (porten, vinduet, kloakken, kullsjakta, stien, utskrivningen), og den fører videre', all(et[str(d)]['utgang'] for d in range(1, 7)) and all(et[str(d)]['videre'] for d in range(1, 6)), et)
    is_ = await pg.evaluate("""() => { const G = MORBIDIUM; startFloor(1, false); rolig(); const F = G.F, r = F.rooms.find(r => r.gulv === 'is') || F.rooms.find(r => r.ute); return { gulv: gulvUnder(r.x + r.w / 2, r.z + r.h / 2), ute: Vaer.ute(r.x + r.w / 2, r.z + r.h / 2) }; }""")
    sjekk('gulvet under føttene kan leses (is og myr endrer gangen), og været vet hva som er ute', is_['gulv'] is not None and is_['ute'] is True, is_)
    await pg.screenshot(path='/tmp/e_11parken.png')
    sjekk('ingen konsollfeil (seks etasjer)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_51(b):
    # 51) Det skjulte rommet
    #     Gangen og rommet bak den sprukne veggen er ikke der før veggen er slått inn: sprekken er vanlig vegg, gulvet, lysene og tingene
    #     bak står skjult, kartet viser det ikke gjennom veggen, og hendelser, dekaler og lyn havner ikke der. Et tungt slag åpner det
    SKJ51 = """() => { const G = MORBIDIUM; let s0 = null;
          for (let s = 1; s < 400; s++) { const F = generateFloor(s * 7919, 2, {}); if (F.rooms.some(r => r.role === 'cursed') && F.rooms.some(r => r.role === 'offer')) { s0 = s; G.run.seed = s * 7919 - 2 * 7919; startFloor(2, false); break; } }
          const F = G.F, P = G.player; for (const e of G.enemies) if (e.alive) killEntity(e, {}); G.combat = null; G.lock = null; G.rooms.forEach(s => s.cleared = true); Bygg.alt();
          const c = Spesial.cracks[Math.floor(Spesial.cracks.length / 2)], hemm = F.rooms.find(r => r.role === 'secret'), par = F.rooms[hemm.parent];
          const tx = Math.floor(c.x), tz = Math.floor(c.z); let ix = tx, iz = tz; if (tz === par.z - 1) iz = tz + 1; else if (tz === par.z + par.h) iz = tz - 1; else if (tx === par.x - 1) ix = tx + 1; else ix = tx - 1;
          P.x = ix + .5; P.z = iz + .5; P.face = Math.atan2(c.x - P.x, c.z - P.z); P.hp = P.maxHp; R.snapCamera(P.x, P.z); G.seen.fill(0); return s0; }"""
    # tilstanden: hva som synes, lysene i rommet, tellingen av firkanter per del og kartet
    TILST51 = """() => { const G = MORBIDIUM, F = G.F, PM = Paint.mesh, hemm = F.rooms.find(r => r.role === 'secret'), S = F.skjult;
          const del = d => [...(PM.vegger || []), ...(PM.toppEkstra || [])].filter(m => m.userData.del === d);
          const lysSum = L => { const c = L.material.color; return c.r + c.g + c.b; };
          const ting = G.props.filter(o => o.room === hemm.id), pd = Items.pedestals.filter(p => Math.floor(p.x) >= hemm.x && Math.floor(p.x) < hemm.x + hemm.w && Math.floor(p.z) >= hemm.z && Math.floor(p.z) < hemm.z + hemm.h);
          const fyll = R.levelL.children.filter(L => L.userData.fyll && Math.floor(L.position.x) >= hemm.x && Math.floor(L.position.x) < hemm.x + hemm.w && Math.floor(L.position.z - .3) >= hemm.z && Math.floor(L.position.z - .3) < hemm.z + hemm.h);
          const lys = [...ting.filter(o => o.light).map(o => o.light), ...pd.filter(p => p.light).map(p => p.light), ...fyll];
          let synlige = 0, skjulte = 0; for (let i = 0; i < F.tiles.length; i++) if (F.tiles[i]) { if (S && S[i]) skjulte++; else synlige++; }
          let iSett = 0; if (S) for (let i = 0; i < S.length; i++) if (S[i] && G.seen[i]) iSett++;
          return { harSkjult: !!S, gSkjult: !!G.skjult, gulvSkjult: PM.gulvSkjult ? PM.gulvSkjult.visible : null, gulvFirk: PM.gulv.geometry.attributes.position.count / 6, synlige, skjulte,
            aapen: del('aapen').map(m => m.visible), lukket: del('lukket').concat(del('sprekk')).map(m => m.visible), nSprekk: del('sprekk').length,
            veggPaaSprekk: F.crack.every(i => Paint.wallH[i] > 0), ting: ting.length, tingSynlig: ting.filter(o => o.g.visible).length, pd: pd.length, pdSynlig: pd.filter(p => p.g.visible).length,
            lys: lys.length, lysSum: +lys.reduce((a, L) => a + lysSum(L), 0).toFixed(3), lysMin: lys.length ? +Math.min(...lys.map(lysSum)).toFixed(3) : 0, iSett, secrets: G.run.secrets || 0,
            block: F.crack.map(i => F.block[i]), brutt: Spesial.cracks.every(c => c.broken), gTid: +G.time.toFixed(2) }; }"""
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg)
    s51 = await pg.evaluate(SKJ51)
    await pg.wait_for_timeout(600)
    t0 = await pg.evaluate(TILST51)
    sjekk('det skjulte: generatoren merker gangen og rommet, og etasjen bygges lukket (skjult gulv, åpne deler skjult, sprekken er vegg)', s51 is not None and t0['harSkjult'] and t0['gSkjult'] and t0['gulvSkjult'] is False and t0['aapen'] and not any(t0['aapen']) and t0['lukket'] and all(t0['lukket']) and t0['nSprekk'] >= 1 and t0['veggPaaSprekk'], t0)
    sjekk('det skjulte: hovedgulvet har bare de synlige rutene', t0['gulvFirk'] == t0['synlige'] and t0['skjulte'] > 20, (t0['gulvFirk'], t0['synlige'], t0['skjulte']))
    sjekk('det skjulte: tingene og glasset i rommet synes ikke, og lysene der er slukket', t0['ting'] > 0 and t0['tingSynlig'] == 0 and t0['pdSynlig'] == 0 and t0['lys'] >= 2 and t0['lysSum'] == 0, t0)
    # to sekunder spilltid ved sprekken: ingen skjult rute kommer på kartet
    sett = await pg.evaluate("""async () => { const G = MORBIDIUM, g0 = G.time, t0 = performance.now(); while (G.time - g0 < 2 && performance.now() - t0 < 30000) await new Promise(r => setTimeout(r, 50));
          let n = 0; for (let i = 0; i < G.skjult.length; i++) if (G.skjult[i] && G.seen[i]) n++; let naer = 0; for (let i = 0; i < G.seen.length; i++) if (G.seen[i]) naer++; return { n, naer, tid: +(G.time - g0).toFixed(2) }; }""")
    sjekk('det skjulte: står du ved sprekken i to sekunder, kommer ingenting bak veggen på kartet', sett['n'] == 0 and sett['naer'] > 40 and sett['tid'] >= 2, sett)
    steder = await pg.evaluate("""() => { const G = MORBIDIUM, F = G.F, S = G.skjult, ut = { gang: 0, vegg: 0, iSkjult: 0 }; const akt = Hendelse.aktive; Hendelse.aktive = [];
          for (const pl of ['gang', 'vegg']) for (let k = 0; k < 50; k++) { const st = Hendelse.finnSted(pl, () => (k + .5) / 50); if (!st) continue; ut[pl]++; const tz = Math.floor(pl === 'vegg' ? st.vz : st.z), i = tz * F.W + Math.floor(st.x); if (S[i] || (pl === 'vegg' && S[i - F.W])) ut.iSkjult++; }
          Hendelse.aktive = akt; let lyn = 0; for (let k = 0; k < 400; k++) { const i = Math.floor(Math.random() * F.tiles.length); if (S[i] && gulvSynlig(i)) lyn++; }
          const st0 = Dybde.stov.length; Dybde.takstov(F.crack[0] % F.W + .5, (F.crack[0] / F.W | 0) + .5, 40, 4); const stov = Dybde.stov.slice(st0), stovSkjult = stov.filter(k => S[Math.floor(k.z) * F.W + Math.floor(k.x)]).length;
          return Object.assign(ut, { lyn, stov: stov.length, stovSkjult, pytt: !!addPuddle(F.crack[0] % F.W + .5, (F.crack[0] / F.W | 0) + .5, 'wet', 1, 5) }); }""")
    sjekk('det skjulte: hendelser (også ikke på sprekken), lyn, takstøv og pytter havner ikke bak veggen', steder['gang'] + steder['vegg'] > 0 and steder['iSkjult'] == 0 and steder['lyn'] == 0 and steder['stov'] > 0 and steder['stovSkjult'] == 0 and not steder['pytt'], steder)
    kart = await pg.evaluate("""() => { const G = MORBIDIUM; visHeleKartet(); const t = Kart.tall()[0][1]; let n = 0; for (let i = 0; i < G.skjult.length; i++) if (G.skjult[i] && G.seen[i]) n++; const a = G.kartAnelse; Kart.apne(); const leg = [...document.querySelectorAll('#kartark .kleg li')].map(l => l.textContent); closePanel(); G.seen.fill(0); return { t, n, a, leg }; }""")
    sjekk('det skjulte: hele kartet (kartpillen, plantegningen) gir 100 % uten rommet bak veggen, bare en anelse', kart['t'] == '100 %' and kart['n'] == 0 and kart['a'] and any('visket ut' in l for l in kart['leg']), kart)
    await pg.evaluate("() => { const G = MORBIDIUM; G.kartAnelse = false; R.snapCamera(G.player.x, G.player.z); }")
    await pg.wait_for_timeout(500); await pg.screenshot(path='/tmp/e_51_skjult_for.png')
    # et tungt slag som i del 6: veggen faller, og innen halvannet sekund spilltid er rommet der, med lys
    await pg.evaluate("""async () => { const G = MORBIDIUM, g0 = G.time; startSwing(true, 1); for (let i = 0; i < 400 && !Spesial.cracks.every(c => c.broken) && G.time - g0 < 5; i++) await new Promise(r => setTimeout(r, 50)); }""")
    t1 = await pg.evaluate(TILST51)
    await pg.evaluate("async () => { const G = MORBIDIUM, g0 = G.time, t0 = performance.now(); while (G.time - g0 < 1.5 && performance.now() - t0 < 30000) await new Promise(r => setTimeout(r, 50)); }")
    t2 = await pg.evaluate(TILST51)
    sjekk('det skjulte: et tungt slag knuser veggen med en gang (c.broken, F.block, G.run.secrets)', t1['brutt'] and t1['secrets'] == 1 and not any(t1['block']) and not t1['gSkjult'], t1)
    sjekk('det skjulte: etter innbruddet er gulvet, de åpne delene, tingene og glasset der, og lysene tent', t2['gulvSkjult'] is True and all(t2['aapen']) and not any(t2['lukket']) and t2['tingSynlig'] == t2['ting'] and t2['pdSynlig'] == t2['pd'] and t2['lysMin'] > 0, t2)
    tenner = await pg.evaluate("() => MORBIDIUM.pickups.filter(k => k.kind === 'tooth' || k.kind === 'cons').length")
    sjekk('det skjulte: tennene og pillen ligger der inne etter innbruddet', tenner >= 4, tenner)
    await pg.wait_for_timeout(500); await pg.screenshot(path='/tmp/e_51_skjult_etter.png')
    # firkantene: felles pluss lukket er det samme som et vanlig bygg der det skjulte er tomrom, og felles pluss åpen det samme som et bygg uten skjul
    firk = await pg.evaluate("""() => { const G = MORBIDIUM, F = G.F, PM = () => Paint.mesh, n = m => m.geometry.attributes.position.count / 6;
          const tell = () => { const d = {}; for (const m of [PM().topp, ...(PM().toppEkstra || []), ...PM().vegger]) { const k = m.userData.del || ''; d[k] = (d[k] || 0) + n(m); } return d; };
          const delt = tell(); const S = F.skjult;
          const Fl = Object.assign({}, F, { tiles: F.tiles.map((t, i) => S[i] ? 0 : t), skjult: null }); Paint.level(Fl, G.th); const lukket = tell()[''];
          const Fa = Object.assign({}, F, { skjult: null }); Paint.level(Fa, G.th); const aapen = tell()[''];
          Paint.level(F, G.th); return { delt, lukket, aapen }; }""")
    d = firk['delt']
    sjekk('det skjulte: felles pluss lukket og felles pluss åpen gir like mange vegg- og toppfirkanter som vanlige bygg av hver', d.get('', 0) + d.get('lukket', 0) + d.get('sprekk', 0) == firk['lukket'] and d.get('', 0) + d.get('aapen', 0) == firk['aapen'] and d.get('aapen', 0) > 0, firk)
    sjekk('ingen konsollfeil (det skjulte, 2D)', not pg.errs, pg.errs[:6])
    await pg.close()
    # 3D: listene på sprekken er egne og forsvinner, tåka ligger ikke over det skjulte, og gulvet der blir toon som resten
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg, url=URL3D)
    await pg.evaluate(SKJ51)
    await pg.wait_for_timeout(1500)
    d3a = await pg.evaluate("""() => { const G = MORBIDIUM, S = G.skjult, PM = Paint.mesh, tm = D3.taakeMask; let taake = 0; if (tm) for (let i = 0; i < S.length; i++) if (S[i] && tm.image.data[i]) taake++;
          return { on: D3.on, gulv: PM.gulvSkjult.material.type, synlig: PM.gulvSkjult.visible, taake, harTaake: !!tm, lister: (D3.sprekkDeler || []).length, listerSynlig: (D3.sprekkDeler || []).filter(m => m.visible).length }; }""")
    await pg.screenshot(path='/tmp/e_51_skjult_for3d.png')
    await pg.evaluate("""async () => { const G = MORBIDIUM, g0 = G.time; startSwing(true, 1); for (let i = 0; i < 600 && !Spesial.cracks.every(c => c.broken) && G.time - g0 < 5; i++) await new Promise(r => setTimeout(r, 50));
          const g1 = G.time, t0 = performance.now(); while (G.time - g1 < 1.5 && performance.now() - t0 < 40000) await new Promise(r => setTimeout(r, 50)); }""")
    d3b = await pg.evaluate("""() => { const G = MORBIDIUM, F = G.F, PM = Paint.mesh, tm = D3.taakeMask; let taake = 0; if (tm) for (let i = 0; i < F.tiles.length; i++) if (F.skjult[i] && tm.image.data[i]) taake++;
          return { skjult: !!G.skjult, synlig: PM.gulvSkjult.visible, taake, listerSynlig: (D3.sprekkDeler || []).filter(m => m.visible).length, secrets: G.run.secrets || 0 }; }""")
    await pg.screenshot(path='/tmp/e_51_skjult_etter3d.png')
    sjekk('det skjulte i 3D: gulvet bak er toon og skjult, tåka ligger ikke der, og listene på sprekken er egne', d3a['on'] and d3a['gulv'] == 'MeshToonMaterial' and d3a['synlig'] is False and d3a['taake'] == 0 and d3a['lister'] == d3a['listerSynlig'], d3a)
    sjekk('det skjulte i 3D: etter innbruddet er gulvet der, tåka dekker det, og listene på sprekken er borte', not d3b['skjult'] and d3b['synlig'] and d3b['listerSynlig'] == 0 and d3b['secrets'] == 1 and (not d3a['harTaake'] or d3b['taake'] > 0), d3b)
    # en sprekk i en nordvegg: listene langs veggen fortsetter over sprekken i egne InstancedMesh, og de er borte når veggen faller
    nord = await pg.evaluate("""async () => { const G = MORBIDIUM; let s0 = null;
          for (let s = 1; s < 300 && s0 === null; s++) { const F = generateFloor(s * 7919 + 2 * 7919, 2, {}), h = F.rooms.find(r => r.role === 'secret'), p = F.rooms[h.parent]; if (F.crack.every(i => ((i / F.W) | 0) === p.z - 1) && ['panel', 'tapet', 'paviljong'].includes(p.vegg)) s0 = s; }
          if (s0 === null) return null; G.run.seed = s0 * 7919; startFloor(2, false); await new Promise(r => setTimeout(r, 300));
          const F = G.F, c = Spesial.cracks[1], lister = (D3.sprekkDeler || []).length, synlig = (D3.sprekkDeler || []).filter(m => m.visible).length, pos = new THREE.Vector3(), mx = new THREE.Matrix4();
          const paaSprekk = (D3.sprekkDeler || []).every(im => { for (let k = 0; k < im.count; k++) { im.getMatrixAt(k, mx); pos.setFromMatrixPosition(mx); if (!F.crack.includes(Math.floor(pos.z - 1) * F.W + Math.floor(pos.x))) return false; } return true; });
          Spesial.damage(c, 9); const skjult = !!G.skjult, g0 = G.time, t0 = performance.now(); while (Skjult.vis && G.time - g0 < 2 && performance.now() - t0 < 40000) await new Promise(r => setTimeout(r, 50)); // innbruddet senker listene med veggen (B4)
          return { s0, lister, synlig, paaSprekk, etter: (D3.sprekkDeler || []).filter(m => m.visible).length, skjult }; }""")
    sjekk('det skjulte i 3D: listene på en sprukken nordvegg er egne, ligger bare på sprekken og forsvinner ved innbruddet', nord is not None and nord['lister'] > 0 and nord['synlig'] == nord['lister'] and nord['paaSprekk'] and nord['etter'] == 0 and not nord['skjult'], nord)
    sjekk('ingen konsollfeil (det skjulte, 3D)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_55(b):
    # 55) Tomrom og ganger
    #     Inne er en veggfront som vender mot tomrom (ikke gulv og ingen vegg), mur i toppfargen og ikke puss med brystpanel, så tomrommet
    #     ikke ser ut som et mørkt rom (9.webp) og det skjulte ikke skiller seg ut. Ute beholder hekkene frontene sine. I 3D har gangene
    #     inne små taklamper, faste fra gang til gang, ikke i døråpningene og ikke i det skjulte, og de får punktlys når man står der
    FRONT55 = """() => { const G = MORBIDIUM, F = G.F, W = F.W, PM = Paint.mesh, tom = (x, z) => { if (x < 0 || z < 0 || x >= W || z >= F.H) return true; const i = z * W + x; return !gulvSynlig(i) && !(Paint.wallH[i] > 0); };
          let puss = 0, mot = 0, mur = 0, murSkjult = 0, murFeil = 0;
          for (const m of PM.vegger) { if (!m.visible) continue; const p = m.geometry.attributes.position.array; for (let k = 0; k < p.length; k += 18) { if (tom(Math.floor(Math.min(p[k], p[k + 3]) + .01), Math.round(p[k + 2]))) puss++; else mot++; } }
          for (const m of [PM.topp, ...(PM.toppEkstra || [])]) { if (!m || !m.visible) continue; const p = m.geometry.attributes.position.array;
            for (let k = 0; k < p.length; k += 18) if (p[k + 1] === 0 && p[k + 4] === 0 && p[k + 7] > 0 && p[k + 2] === p[k + 8]) { mur++; const x = Math.floor(p[k] + .01), z = Math.round(p[k + 2]); if (!tom(x, z)) murFeil++; if (G.skjult && G.skjult[z * W + x]) murSkjult++; } }
          return { puss, mot, mur, murSkjult, murFeil, ute: !!F.ute, skjult: !!G.skjult }; }"""
    ETG55 = """async (o) => { const G = MORBIDIUM, vent = t => new Promise(r => setTimeout(r, t)); G.run.seed = o.s; G.run.dromVent = 0; startFloor(o.d, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } await vent(200); rolig(); }"""
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg)
    await pg.evaluate(ETG55, {'s': 180 * 7919, 'd': 2})
    inne = await pg.evaluate(FRONT55)
    sjekk('tomrom inne: ingen puss eller brystpanel mot tomrom, frontene der er mur i toppmeshen, og frontene mot gulvet har puss', inne['puss'] == 0 and inne['mur'] > 10 and inne['murFeil'] == 0 and inne['mot'] > 40 and not inne['ute'], inne)
    # det skjulte (lukket) ser ut som annet tomrom: en sprekk i sørveggen har murfront mot gangen bak, som resten av sørveggen, og ingen puss
    sk = await pg.evaluate("""async (o) => { const G = MORBIDIUM, vent = t => new Promise(r => setTimeout(r, t)); for (let s = 1; s < 400; s++) { const F = generateFloor(s * 7919 + 2 * 7919, 2, {}), h = F.rooms.find(r => r.role === 'secret'); if (!F.skjult || !h) continue; const p = F.rooms[h.parent];
            if (p.ute || !F.crack.every(i => ((i / F.W) | 0) === p.z + p.h)) continue; G.run.seed = s * 7919; G.run.dromVent = 0; startFloor(2, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } return s; } return null; }""")
    skj = await pg.evaluate(FRONT55)
    sjekk('tomrom inne: det skjulte bak sprekken har murfronter som annet tomrom, og ingen puss', sk is not None and skj['skjult'] and skj['puss'] == 0 and skj['murSkjult'] > 0 and skj['murFeil'] == 0, (sk, skj))
    await pg.evaluate(ETG55, {'s': 180 * 7919, 'd': 1})
    ute = await pg.evaluate(FRONT55)
    sjekk('tomrom ute: hekkene og trærne beholder frontene sine (landskapet fortsetter), ingen murfronter', ute['ute'] and ute['puss'] > 0 and ute['mur'] == 0, ute)
    sjekk('ingen konsollfeil (tomrom, 2D)', not pg.errs, pg.errs[:6])
    await pg.close()
    # 3D: taklampene i gangene
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg, url=URL3D)
    GANG55 = """() => { const G = MORBIDIUM, F = G.F, W = F.W, L = D3.kilder().filter(m => m.userData.gang), rom = i => F.roomId[i] >= 0;
          let feil = 0, naerRom = 0, tett = 0; const pos = L.map(m => [Math.floor(m.position.x), Math.floor(m.position.z - .3)]);
          for (const [x, z] of pos) { const i = z * W + x; if (F.tiles[i] !== 2 || rom(i) || !gulvSynlig(i)) feil++; for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) if (rom((z + dz) * W + x + dx)) naerRom++; }
          for (let a = 0; a < pos.length; a++) for (let c = a + 1; c < pos.length; c++) if (Math.hypot(pos[a][0] - pos[c][0], pos[a][1] - pos[c][1]) < 5) tett++;
          const topp = Paint.mesh.topp, p = topp.geometry.attributes.position.array, n = topp.geometry.attributes.normal ? topp.geometry.attributes.normal.array : null; let murN = 0, murNok = 0;
          if (n) for (let k = 0; k < p.length; k += 18) if (p[k + 1] === 0 && p[k + 4] === 0 && p[k + 7] > 0) { murN++; if (n[k + 2] > .9) murNok++; }
          return { on: D3.on && D3.bygd, n: L.length, gangLys: D3.gangLys, feil, naerRom, tett, pos: pos.slice(0, 4), toon: topp.material.type, murN, murNok, kilder: D3.kilder().length }; }"""
    await pg.evaluate(ETG55, {'s': 180 * 7919, 'd': 2})
    g1 = await pg.evaluate(GANG55)
    sjekk('ganger i 3D: taklamper i gangene inne, på gangruter, ikke i døråpningene og minst fem ruter fra hverandre', g1['on'] and g1['n'] >= 3 and g1['n'] == g1['gangLys'] and g1['feil'] == 0 and g1['naerRom'] == 0 and g1['tett'] == 0, g1)
    sjekk('tomrom i 3D: murfrontene er tegneserielyst som toppene og vender mot kameraet', g1['toon'] == 'MeshToonMaterial' and g1['murN'] > 10 and g1['murNok'] == g1['murN'], g1)
    # står man under en lampe, får den et punktlys (D3.tick i faste steg, så maskinens fart ikke betyr noe)
    pl = await pg.evaluate("""() => { const G = MORBIDIUM, P = G.player, m = D3.kilder().find(k => k.userData.gang); if (!m) return { lys: false, styrke: 0, y: 0 }; const x = m.position.x, z = m.position.z;
          P.x = x; P.z = z - .3; if (P.lantern) { P.lantern.position.x = P.x; P.lantern.position.z = P.z; } R.camT.x = x; R.camT.z = z; for (let k = 0; k < 120; k++) D3.tick(1 / 60);
          const l = D3.pool.find((l, i) => i > 0 && l.intensity > 0 && Math.abs(l.position.x - x) < 1e-6 && Math.abs(l.position.z - (z - .3)) < 1e-6); return { lys: !!l, styrke: l ? +l.intensity.toFixed(3) : 0, y: l ? l.position.y : 0 }; }""")
    sjekk('ganger i 3D: under en taklampe får den et punktlys oppe under taket', pl['lys'] and pl['styrke'] > .2 and pl['y'] > 1.8, pl)
    await pg.wait_for_timeout(400); await pg.screenshot(path='/tmp/e_55_gang_3d.png')
    # ute har gangene ingen taklamper, og en ny etasje rydder de gamle; tilbake i samme etasje står lampene på de samme stedene
    await pg.evaluate(ETG55, {'s': 180 * 7919, 'd': 1})
    g2 = await pg.evaluate(GANG55)
    await pg.evaluate(ETG55, {'s': 180 * 7919, 'd': 2})
    g3 = await pg.evaluate(GANG55)
    sjekk('ganger i 3D: ingen taklamper ute, de gamle ryddes med etasjen, og de står likt neste gang', g2['n'] == 0 and g2['gangLys'] == 0 and g3['n'] == g1['n'] and g3['pos'] == g1['pos'], (g1, g2, g3))
    sjekk('ingen konsollfeil (tomrom og ganger, 3D)', not pg.errs, pg.errs[:6])
    await pg.close()


DELER = {6: del_6, 9: del_9, 15: del_15, 24: del_24, 51: del_51, 55: del_55}
