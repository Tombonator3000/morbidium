"""Tester enkeltfunksjoner i Morbidium i headless Chromium: lagring og fortsettelse,
berøringsoppsett på stående mobil, journalen og nyere systemer.

Bruk:  python3 tools/test_ekstra.py [--three STI]   (samme valg som test_spill.py)
Skjermbilder havner i /tmp/e_*.png. Skriptet avslutter med kode 1 hvis noe feiler.
"""
import pathlib, os, sys, asyncio
from playwright.async_api import async_playwright
THREE = os.environ.get('MORBIDIUM_THREE') or (sys.argv[sys.argv.index('--three') + 1] if '--three' in sys.argv else None)
URL = (pathlib.Path(__file__).resolve().parent.parent / 'dist' / 'morbidium.html').as_uri()
feil = []

def sjekk(navn, ok, info=''):
    print(('OK    ' if ok else 'FEIL  ') + navn + (': ' + str(info) if info != '' else ''))
    if not ok: feil.append(navn)

async def ny_side(b, **kw):
    pg = await b.new_page(**kw)
    if THREE:
        await pg.route('**/three.min.js', lambda r: r.fulfill(path=THREE, content_type='application/javascript'))
        await pg.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
    pg.errs = []
    pg.on('pageerror', lambda e: pg.errs.append('PAGEERROR: ' + str(e)))
    pg.on('console', lambda m: pg.errs.append(m.type + ': ' + m.text) if m.type == 'error' else None)
    return pg

async def start_lop(pg, awk=None):
    await pg.goto(URL); await pg.wait_for_timeout(2500)
    await pg.click('#tNew'); await pg.wait_for_timeout(500)
    sel = f'[data-awk="{awk}"]' if awk else '[data-awk]'
    if awk and not await pg.query_selector(sel): sel = '[data-awk]'
    await pg.click(sel); await pg.wait_for_timeout(1500)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])

        # 1) lagring og fortsettelse
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await pg.goto(URL); await pg.wait_for_timeout(2000)
        await pg.evaluate("() => localStorage.clear()")
        await start_lop(pg)
        await pg.evaluate("""() => { const G = MORBIDIUM; Items.give('bart'); Items.give('magnet'); G.player.teeth = 77; G.player.weaponLvl = 2; descend(); }""")
        await pg.wait_for_timeout(1500)
        for_ = await pg.evaluate("() => ({ d: MORBIDIUM.depth, items: MORBIDIUM.run.items.slice(), teeth: MORBIDIUM.player.teeth, name: MORBIDIUM.run.patient.name, look: JSON.stringify(MORBIDIUM.run.look) })")
        await pg.evaluate("() => showTitle()"); await pg.wait_for_timeout(800)
        har = await pg.query_selector('#tCont')
        sjekk('Fortsett-knapp på tittelen', har is not None)
        if har:
            await pg.click('#tCont'); await pg.wait_for_timeout(1500)
            etter = await pg.evaluate("() => ({ d: MORBIDIUM.depth, items: MORBIDIUM.run.items.slice(), teeth: MORBIDIUM.player.teeth, name: MORBIDIUM.run.patient.name, lvl: MORBIDIUM.player.weaponLvl, state: MORBIDIUM.state, look: JSON.stringify(MORBIDIUM.run.look) })")
            sjekk('fortsatt løp har samme etasje, tenner og kuriositeter', etter['d'] == for_['d'] and etter['items'] == for_['items'] and etter['teeth'] == for_['teeth'] and etter['name'] == for_['name'] and etter['lvl'] == 2 and etter['state'] == 'play', etter)
            sjekk('fortsatt løp har samme utseende', etter['look'] == for_['look'] and '"v":1' in for_['look'], for_['look'])
        await pg.evaluate("() => { const P = MORBIDIUM.player; P.invuln = 0; P.iframe = 0; hurt(P, 9999, { type: 'kultist' }); }")
        await pg.wait_for_timeout(2400)
        sjekk('død sletter det lagrede løpet', await pg.evaluate("() => !localStorage.getItem('morbidium_run_v1')"))
        await pg.screenshot(path='/tmp/e_1dod.png')
        sjekk('ingen konsollfeil (lagring)', not pg.errs, pg.errs[:5])
        await pg.close()

        # 2) stående mobil med berøring
        ctx = await b.new_context(viewport={'width': 390, 'height': 844}, has_touch=True, is_mobile=True, device_scale_factor=2)
        pg = await ctx.new_page()
        if THREE:
            await pg.route('**/three.min.js', lambda r: r.fulfill(path=THREE, content_type='application/javascript'))
            await pg.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
        pg.errs = []
        pg.on('pageerror', lambda e: pg.errs.append('PAGEERROR: ' + str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(2500)
        await pg.evaluate("() => localStorage.clear()")
        await pg.tap('#tNew'); await pg.wait_for_timeout(500); await pg.tap('[data-awk]'); await pg.wait_for_timeout(1500)
        await pg.evaluate("() => { MORBIDIUM.run.slots[0] || giveCard('due', true); }")
        await pg.wait_for_timeout(400)
        await pg.screenshot(path='/tmp/e_2mobil.png')
        dekning = await pg.evaluate("""() => { let top = innerHeight; for (const el of document.querySelectorAll('#stick, #tbtns button, #cards .acard')) { const r = el.getBoundingClientRect(); if (r.width) top = Math.min(top, r.top); } return 1 - top / innerHeight; }""")
        sjekk('berøringsknappene dekker under 40 % av høyden', dekning < .4, round(dekning, 2))
        # trykk på første evnekort
        cd0 = await pg.evaluate("() => MORBIDIUM.player.cds.slice()")
        idx = await pg.evaluate("() => MORBIDIUM.run.slots.findIndex(Boolean)")
        await pg.tap(f'#ac{idx}'); await pg.wait_for_timeout(200)
        cd1 = await pg.evaluate("() => MORBIDIUM.player.cds.slice()")
        sjekk('evnekortet kan trykkes på som knapp', cd1[idx] > cd0[idx], cd1)
        await pg.evaluate("() => openJournal()"); await pg.wait_for_timeout(900)
        await pg.screenshot(path='/tmp/e_3journal_mobil.png', full_page=True)
        sjekk('ingen konsollfeil (mobil)', not pg.errs, pg.errs[:5])
        await ctx.close()

        # 3) journalen på stor skjerm
        pg = await ny_side(b, viewport={'width': 1280, 'height': 800})
        await start_lop(pg)
        await pg.evaluate("() => { for (const id of ['due','lys','stempel','hydro']) if (!owned(id)) giveCard(id, true); openJournal(); }")
        await pg.wait_for_timeout(1200)
        await pg.screenshot(path='/tmp/e_4journal.png')
        sjekk('ingen konsollfeil (journal)', not pg.errs, pg.errs[:5])
        await pg.close()

        # 5) de nye fiendene i aksjon
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg)
        await pg.evaluate("""() => { const G = MORBIDIUM; G.run.seed = 5; startFloor(3, false); G.rooms.forEach(s => s.cleared = true); const P = G.player; P.hp = P.maxHp = 400;
          const r = G.F.rooms.filter(r => r.role === 'combat').sort((a, b) => b.w * b.h - a.w * a.h)[0]; const c = freeSpot(r.x + r.w / 2, r.z + r.h / 2, 3); P.x = c.x; P.z = c.z; R.snapCamera(P.x, P.z);
          const types = ['tvang', 'byrakrat', 'narkose', 'rotte', 'oyeblomst']; types.forEach((t, i) => { const a = i / types.length * Math.PI * 2, s = freeSpot(P.x + Math.sin(a) * 3.2, P.z + Math.cos(a) * 3.2, 2); spawnEnemy(t, s.x, s.z, false, 3); }); }""")
        await pg.wait_for_timeout(1400); await pg.screenshot(path='/tmp/e_8fiender.png')
        await pg.wait_for_timeout(5000); await pg.screenshot(path='/tmp/e_9fiender_kamp.png')
        st = await pg.evaluate("() => ({ n: MORBIDIUM.enemies.filter(e => e.alive).length, types: [...new Set(MORBIDIUM.enemies.map(e => e.type))], hp: Math.round(MORBIDIUM.player.hp), gas: MORBIDIUM.zones.filter(z => z.kind === 'gas').length })")
        sjekk('nye fiender lever og rotter kom i flokk', st['n'] >= 7 and len(st['types']) == 5, st)
        sjekk('fiendene gjorde skade', st['hp'] < 400, st['hp'])
        await pg.evaluate("() => { for (const e of MORBIDIUM.enemies) if (e.alive) hurt(e, 9999, { from: 'player' }); }")
        await pg.wait_for_timeout(800)
        sjekk('ingen konsollfeil (nye fiender)', not pg.errs, pg.errs[:6])
        await pg.close()

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
        await pg.evaluate("() => { const P = MORBIDIUM.player; const c = Spesial.cracks[0]; startSwing(true, 1); }")
        await pg.wait_for_timeout(900)
        brutt = await pg.evaluate("() => ({ broken: Spesial.cracks.every(c => c.broken), block: Spesial.cracks.map(c => MORBIDIUM.F.block[c.i]), secrets: MORBIDIUM.run.secrets || 0 })")
        sjekk('tungt slag knuser den sprukne veggen', brutt['broken'] and brutt['secrets'] == 1 and not any(brutt['block']), brutt)
        # b) forbannet rom: gå inn, ta glasset, overlev bakholdet
        cur = await pg.evaluate("""() => { const G = MORBIDIUM, F = G.F, P = G.player; P.hp = P.maxHp; const r = F.rooms.find(r => r.role === 'cursed'); const h0 = P.hp; const d = r.doors[0]; P.x = d % F.W + .5; P.z = ((d / F.W) | 0) + .5; return { h0, id: r.id }; }""")
        await pg.evaluate("""(id) => { const G = MORBIDIUM, r = G.F.rooms[id], P = G.player; P.x = r.x + r.w / 2; P.z = r.z + r.h / 2 + 1.5; R.snapCamera(P.x, P.z); }""", cur['id'])
        await pg.wait_for_timeout(700); await pg.screenshot(path='/tmp/e_11forbannet.png')
        etter = await pg.evaluate("() => MORBIDIUM.player.hp")
        sjekk('tornene tar et hjerte ved inngangen', cur['h0'] - etter >= 9.9, (cur['h0'], etter))
        await pg.evaluate("() => { const pd = Items.pedestals.find(p => p.cursed); Items.take(pd); }")
        await pg.wait_for_timeout(2600)
        kamp = await pg.evaluate("() => ({ combat: !!MORBIDIUM.combat, n: MORBIDIUM.enemies.filter(e => e.alive).length, items: MORBIDIUM.run.items.length })")
        sjekk('kuriositeten utløser bakhold', kamp['combat'] and kamp['n'] > 0 and kamp['items'] == 1, kamp)
        await pg.screenshot(path='/tmp/e_12bakhold.png')
        for _ in range(3):
            await pg.evaluate("() => { for (const e of MORBIDIUM.enemies) if (e.alive) hurt(e, 9999, { from: 'player' }); }"); await pg.wait_for_timeout(1700)
        sjekk('bakholdet kan ryddes', await pg.evaluate("() => !MORBIDIUM.combat"))
        # c) blodoffer
        await pg.evaluate("""() => { const G = MORBIDIUM, P = G.player; P.teeth = 60; P.hp = P.maxHp; const o = G.props.find(o => o.kind === 'offeralter'); P.x = o.x; P.z = o.z + 1.6; R.snapCamera(P.x, P.z); Spesial.offer(o); }""")
        await pg.wait_for_timeout(700); await pg.screenshot(path='/tmp/e_13offer.png')
        await pg.click('[data-ch="0"]'); await pg.wait_for_timeout(600)
        sjekk('alteret tar imot én gave', await pg.evaluate("() => MORBIDIUM.props.find(o => o.kind === 'offeralter').used === true && MORBIDIUM.state === 'play'"))
        sjekk('ingen konsollfeil (spesialrom)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 7) apparater og lommerusk
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg)
        await pg.evaluate("""() => { const G = MORBIDIUM, P = G.player; rolig(); Aktiv.give('defib'); Lomme.give('frosk');
          for (let i = 0; i < 3; i++) { const s = freeSpot(P.x + Math.sin(i * 2) * 2.2, P.z + Math.cos(i * 2) * 2.2, 2); const e = spawnEnemyBareTest('pleier', s.x, s.z); e.cd = 99; } }""")
        await pg.wait_for_timeout(900)
        hp0 = await pg.evaluate("() => MORBIDIUM.enemies.filter(e => e.alive).map(e => e.hp)")
        await pg.keyboard.press('KeyV'); await pg.wait_for_timeout(300)
        await pg.screenshot(path='/tmp/e_14defib.png')
        st = await pg.evaluate("() => ({ hp: MORBIDIUM.enemies.filter(e => e.alive).map(e => e.hp), charge: MORBIDIUM.run.akt.charge })")
        sjekk('defibrillatoren skader og tømmer ladningen', st['charge'] == 0 and (len(st['hp']) < len(hp0) or all(a < b for a, b in zip(st['hp'], hp0))), st)
        await pg.evaluate("() => { const G = MORBIDIUM, r = G.F.rooms.find(r => r.role === 'combat'); G.combat = { r, wave: 99, t: 0 }; finishCombat(); }")
        sjekk('ett streik per ryddet rom', await pg.evaluate("() => MORBIDIUM.run.akt.charge") == 1)
        await pg.evaluate("() => { const P = MORBIDIUM.player; const pd = Aktiv.spawnJar(P.x + 1, P.z, 'stoppeklokke'); Items.take(pd); }")
        byt = await pg.evaluate("() => ({ id: MORBIDIUM.run.akt.id, gammel: Items.pedestals.some(p => p.akt === 'defib' && !p.taken) })")
        sjekk('nytt apparat bytter ut det gamle, som blir stående i et glass', byt['id'] == 'stoppeklokke' and byt['gammel'], byt)
        await pg.evaluate("() => { const P = MORBIDIUM.player; P.invuln = 0; P.iframe = 0; hurt(P, 9999, { type: 'kultist' }); }")
        await pg.wait_for_timeout(300)
        sjekk('frosken tar det dødelige slaget', await pg.evaluate("() => MORBIDIUM.player.alive && MORBIDIUM.player.hp <= 21 && MORBIDIUM.run.froskBrukt"))
        await pg.evaluate("() => { const P = MORBIDIUM.player; P.hp = P.maxHp; dropPickup(P.x + .5, P.z, 'trinket', 'hestesko'); }")
        await pg.wait_for_timeout(900)
        await pg.evaluate("() => { const k = MORBIDIUM.pickups.find(k => k.kind === 'trinket'); takePickupTest(k); }")
        sjekk('lommerusk byttes, og det gamle havner på gulvet', await pg.evaluate("() => MORBIDIUM.run.trinket === 'hestesko' && MORBIDIUM.pickups.some(k => k.kind === 'trinket' && k.val === 'frosk')"))
        await pg.screenshot(path='/tmp/e_15hud.png')
        await pg.evaluate("() => { saveRun(false); showTitle(); }"); await pg.wait_for_timeout(600); await pg.click('#tCont'); await pg.wait_for_timeout(1400)
        sjekk('apparat og lommerusk overlever lagring', await pg.evaluate("() => MORBIDIUM.run.akt && MORBIDIUM.run.akt.id === 'stoppeklokke' && MORBIDIUM.run.trinket === 'hestesko'"))
        await pg.evaluate("() => openJournal('kuriositeter')"); await pg.wait_for_timeout(700); await pg.screenshot(path='/tmp/e_16journal_utstyr.png')
        sjekk('ingen konsollfeil (utstyr)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 8) oppskrifter og mestere
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg)
        info = await pg.evaluate("""() => { const G = MORBIDIUM, P = G.player; G.rooms.forEach(s => s.cleared = true); P.hp = P.maxHp = 500; P.teeth = 10; R.view = 15; R.resize();
          const keys = Object.keys(MESTER), out = [];
          keys.forEach((k, i) => { const a = i / keys.length * Math.PI * 2, s = freeSpot(P.x + Math.sin(a) * 4, P.z + Math.cos(a) * 4, 2); const e = spawnEnemy(['pleier', 'kultist', 'byrakrat', 'tvang', 'rotte', 'oppasser'][i % 6], s.x, s.z, false, 2); if (!e.mester) Oppskrift.mester(e, k); else { e.mester = k; } out.push(e.mesterNavn); });
          return { navn: out, labels: document.querySelectorAll('.mester').length }; }""")
        sjekk('mestere får navn og navneskilt', info['labels'] >= 11 and all(info['navn']), info)
        await pg.wait_for_timeout(2500); await pg.screenshot(path='/tmp/e_17mestere.png')
        for_ = await pg.evaluate("() => ({ n: MORBIDIUM.enemies.filter(e => e.alive).length, teeth: MORBIDIUM.player.teeth })")
        await pg.evaluate("() => { for (const e of MORBIDIUM.enemies) if (e.alive && e.mester === 'lommetyv') e.stolen = 5; for (const e of MORBIDIUM.enemies.slice()) if (e.alive && e.mester) hurt(e, 99999, { from: 'player' }); }")
        await pg.wait_for_timeout(150)
        tele = await pg.evaluate("() => Oppskrift.tall.smell")
        await pg.wait_for_timeout(1000)
        etter = await pg.evaluate("() => ({ n: MORBIDIUM.enemies.filter(e => e.alive).length, split: Oppskrift.tall.delt, hp: MORBIDIUM.player.hp })")
        etter['tele'] = tele
        sjekk('todelt mester deler seg i to', etter['split'] >= 2, etter)
        sjekk('eksplosiv mester varsler en eksplosjon når den dør', etter['tele'] > 0, etter)
        await pg.evaluate("() => { for (const e of MORBIDIUM.enemies) if (e.alive) hurt(e, 99999, { from: 'player' }); }")
        await pg.wait_for_timeout(1500)
        # farging og tilbehør på vanlige fiender
        await pg.evaluate("""() => { const G = MORBIDIUM, P = G.player; const cols = ['#6a94c8', '#d880a0', '#7ab888', '#d8b850'];
          for (let i = 0; i < 6; i++) { const s = freeSpot(P.x - 3 + i * 1.3, P.z - 2.2, 2); const e = spawnEnemyBareTest('pleier', s.x, s.z); e.cd = 99; if (i < 4) e.doll.setDye(cols[i]); if (i >= 2) e.doll.addAddon(addonPart(['bart', 'eyeliner', 'glassoye', 'bandasje'][i - 2]), Object.assign({}, LOOKS[['bart', 'eyeliner', 'glassoye', 'bandasje'][i - 2]], { off: Object.fromEntries(Object.entries(LOOKS[['bart', 'eyeliner', 'glassoye', 'bandasje'][i - 2]].off).map(([v, o]) => [v, [o[0], o[1] - .12]])) })); } }""")
        await pg.wait_for_timeout(1500); await pg.screenshot(path='/tmp/e_18farget.png')
        sjekk('ingen konsollfeil (oppskrifter)', not pg.errs, pg.errs[:6])
        await pg.close()

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
        await pg.evaluate("() => { const C = MORBIDIUM.corpses[0], P = MORBIDIUM.player; rolig(); P.x = C.x; P.z = C.z + 1.6; R.snapCamera(C.x, C.z); }")
        await pg.wait_for_timeout(1000); await pg.screenshot(path='/tmp/e_19lik.png')
        pr = await pg.evaluate("() => document.getElementById('prompt').textContent")
        sjekk('liket kan undersøkes', 'Undersøk liket' in pr, pr)
        sjekk('likene husker utseendet', await pg.evaluate("() => MORBIDIUM.meta.lik.every(l => l.look && l.look.v === 1)"))
        sjekk('ingen konsollfeil (lik)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 10) pasientene settes sammen av kjønn, hår, hud, klær, sko og pynt
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await pg.goto(URL); await pg.wait_for_timeout(2000); await pg.evaluate("() => localStorage.clear()")
        v = await pg.evaluate("""() => { const L = Array.from({ length: 300 }, () => Pasient.lag()), c = k => new Set(L.map(l => typeof l[k] === 'object' ? l[k].join() : l[k])).size;
          return { kjonn: c('kjonn'), klaer: c('klaer'), har: c('har'), hud: c('hud'), sko: c('sko'), pynt: L.filter(l => l.pynt.length).length, unike: new Set(L.map(l => Pasient.nokkel(l))).size }; }""")
        sjekk('300 nye pasienter har begge kjønn, alle fem plagg og mange varianter', v['kjonn'] == 2 and v['klaer'] == 5 and v['har'] >= 5 and v['hud'] == 4 and v['sko'] >= 4 and v['pynt'] > 60 and v['unike'] > 250, v)
        navn = []
        for i in range(8):
            await pg.evaluate("() => showIntake()"); await pg.wait_for_timeout(250)
            navn.append(await pg.evaluate("() => { const p = MORBIDIUM.patient; return [p.name.split(' ')[0], p.look.kjonn, (p.look.kjonn === 'k' ? FIRST_K : FIRST_M).includes(p.name.split(' ')[0]), document.querySelector('.intake').textContent.includes('Iført')]; }"))
        sjekk('fornavnet passer kjønnet, og kortet sier hva pasienten har på seg', all(n[2] and n[3] for n in navn), navn)
        await pg.click('[data-awk]'); await pg.wait_for_timeout(1500)
        d = await pg.evaluate("() => { const G = MORBIDIUM, D = Pasient.deler(G.run.look), dl = G.player.doll; return { hode: dl.headOv === D.hode, kropp: dl.bodyOv === D.kropp, arm: dl.rig.arm === D.rig.arm, pynt: (dl.addons || []).length === D.pynt.length, medalje: !!document.querySelector('#medal canvas') }; }")
        sjekk('spillerfiguren bruker pasientens hode, klær, farger og pynt', all(d.values()), d)
        g = await pg.evaluate("() => { try { Pasient.dukke(undefined).dispose(); corpseArt(null); corpseArt({ v: 1, klaer: 'ukjent', har: 'lilla' }); return Pasient.norm({ v: 1, klaer: 'ukjent' }).klaer; } catch (e) { return String(e); } }")
        sjekk('gamle lagringer uten utseende og ugyldige verdier gir standardpasienten', g == 'kape', g)
        rib = await pg.evaluate("() => { const dl = MORBIDIUM.player.doll; return [dl.front.n, dl.back.n, dl.front.cap]; }")
        sjekk('armer og bein får plass til både kontur og farge', rib[0] < rib[2] and rib[1] < rib[2], rib)
        await pg.evaluate("() => { rolig(); R.view = 5; R.resize(); }"); await pg.wait_for_timeout(600); await pg.screenshot(path='/tmp/e_20pasient.png')
        sjekk('ingen konsollfeil (pasienter)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 11) menyene: innstillinger, pasienthåndboka, arkivet og pausen
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await pg.goto(URL); await pg.wait_for_timeout(2000)
        await pg.evaluate("() => { localStorage.clear(); localStorage.setItem('morbidium_meta_v2', JSON.stringify({ deaths: 2, bossKills: 0, wins: 0, fragments: [1], historie: [{ name: 'Ola Test', nr: 1, age: 30, depth: 2, cause: 'test', kills: 3, rooms: 2, look: null, utskrevet: false }], settings: { vol: .5, shake: false } })); }")
        await pg.goto(URL); await pg.wait_for_timeout(2000)
        m = await pg.evaluate("() => { const s = MORBIDIUM.meta.settings; return { shake: s.shake, vol: s.vol, kamera: s.kamera, tall: s.tall }; }")
        sjekk('gamle innstillinger flyttes over (ristingen var av/på)', m == {'shake': 0, 'vol': .5, 'kamera': 1, 'tall': True}, m)
        await pg.click('#tSet'); await pg.wait_for_timeout(300)
        faner = []
        for t in ['lyd', 'bilde', 'spill', 'styring', 'data']:
            await pg.click(f'[data-tab="{t}"]'); await pg.wait_for_timeout(150)
            faner.append(await pg.evaluate("() => { const f = document.querySelector('#panel .fit'), r = f.getBoundingClientRect(); return r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1 && r.top >= -1; }"))
        sjekk('alle fem fanene i innstillingene får plass uten rulling', all(faner), faner)
        await pg.click('[data-tab="bilde"]'); await pg.wait_for_timeout(150)
        await pg.evaluate("() => { const i = document.querySelector('[data-s=kamera]'); i.value = 1.2; i.dispatchEvent(new Event('input')); }")
        await pg.click('[data-tab="spill"]'); await pg.wait_for_timeout(150)
        await pg.click('[data-s=tall]'); await pg.wait_for_timeout(100)
        v = await pg.evaluate("() => ({ view: R.view, tall: document.body.classList.contains('uten-tall'), lagret: JSON.parse(localStorage.getItem('morbidium_meta_v2')).settings.kamera })")
        sjekk('kameraavstand og skadetall virker og lagres', abs(v['view'] - 13.8) < .01 and v['tall'] and v['lagret'] == 1.2, v)
        await pg.click('[data-close]'); await pg.wait_for_timeout(300)
        await pg.click('#tHelp'); await pg.wait_for_timeout(300)
        kap = []
        for k in range(await pg.evaluate("() => HANDBOK.length")):
            await pg.click(f'[data-kap="{k}"]'); await pg.wait_for_timeout(120)
            kap.append(await pg.evaluate("() => { const f = document.querySelector('#panel .fit'), r = f.getBoundingClientRect(), t = document.querySelector('.htext'); return r.bottom <= innerHeight + 1 && t.scrollHeight <= t.clientHeight + 2 && document.querySelector('.hpage h2').textContent.length > 2; }"))
        sjekk('pasienthåndboka har åtte kapitler som alle får plass', len(kap) == 8 and all(kap), kap)
        await pg.click('[data-close]'); await pg.wait_for_timeout(300)
        await pg.click('#tArch'); await pg.wait_for_timeout(400)
        a = await pg.evaluate("() => ({ mapper: document.querySelectorAll('.mappe').length, portrett: document.querySelectorAll('.mappe canvas').length })")
        for sk in ['fragmenter', 'rapport']:
            await pg.click(f'[data-sk="{sk}"]'); await pg.wait_for_timeout(200)
        a['rapport'] = await pg.evaluate("() => !!document.querySelector('.rapport')")
        sjekk('arkivet viser mapper med portrett, fragmenter og årsrapport', a == {'mapper': 1, 'portrett': 1, 'rapport': True}, a)
        await pg.click('[data-close]'); await pg.wait_for_timeout(300)
        await pg.click('#tNew'); await pg.wait_for_timeout(400); await pg.click('[data-awk]'); await pg.wait_for_timeout(1400)
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(400)
        p1 = await pg.evaluate("() => ({ state: MORBIDIUM.state, clip: !!document.querySelector('.clip'), port: !!document.querySelector('.pport') })")
        await pg.click('#pS'); await pg.wait_for_timeout(300); await pg.click('[data-close]'); await pg.wait_for_timeout(300)
        p1['tilbake'] = await pg.evaluate("() => !!document.querySelector('.clip')")
        await pg.click('[data-close]'); await pg.wait_for_timeout(300)
        p1['spill'] = await pg.evaluate("() => MORBIDIUM.state")
        sjekk('pausen åpner, innstillinger går tilbake til pausen, og spillet fortsetter', p1 == {'state': 'panel', 'clip': True, 'port': True, 'tilbake': True, 'spill': 'play'}, p1)
        sjekk('ingen konsollfeil (menyer)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 12) musikken følger situasjonen
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await pg.goto(URL); await pg.wait_for_timeout(2000); await pg.evaluate("() => localStorage.clear()")
        await pg.mouse.click(5, 5); await pg.wait_for_timeout(600)
        t = await pg.evaluate("() => ({ navn: Musikk.navn, klar: Sound.ready })")
        await start_lop(pg)
        await pg.evaluate("() => { startFloor(1, false); const G = MORBIDIUM, P = G.player, r = G.F.rooms.find(r => r.role === 'combat'); P.hp = P.maxHp = 9999; P.x = r.x + r.w / 2; P.z = r.z + r.h / 2; }")
        await pg.wait_for_timeout(2500)
        k = await pg.evaluate("() => ({ navn: Musikk.navn, niva: Musikk.niva, steg: Musikk.steg })")
        await pg.evaluate("() => { const P = MORBIDIUM.player; P.invuln = 0; P.iframe = 0; hurt(P, 99999, { type: 'kultist' }); }"); await pg.wait_for_timeout(2600)
        d = await pg.evaluate("() => Musikk.navn")
        sjekk('musikken spiller på tittelen, går over i kamp og stopper ved død', t == {'navn': 'tittel', 'klar': True} and k['navn'] == 'e1' and k['niva'] == 1 and k['steg'] > 3 and d is None, [t, k, d])
        sjekk('ingen konsollfeil (musikk)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 13) merknader, utskrivningsbrev og gjeninnleggelse
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await pg.goto(URL); await pg.wait_for_timeout(2000); await pg.evaluate("() => localStorage.clear()"); await pg.goto(URL); await pg.wait_for_timeout(2000)
        await start_lop(pg)
        l = await pg.evaluate("""() => { const ut = new Set(); for (let i = 0; i < 300; i++) for (const p of ['kabinett', 'sjef', 'blod', 'butikk']) ut.add(Items.pickFrom(p)); const laast = [...ut].filter(id => Merknad.laast(id));
          const før = Merknad.laast('speil'), kapell = unlocked('kapell'); Merknad.gi('dod1'); Merknad.gi('rust'); return { laast, før, etter: Merknad.laast('speil'), kapell, kapell2: unlocked('kapell') }; }""")
        sjekk('låste kuriositeter dukker ikke opp før merknaden er fortjent', l == {'laast': [], 'før': True, 'etter': False, 'kapell': False, 'kapell2': True}, l)
        await pg.evaluate("() => { rolig(); MORBIDIUM.run.kills = 12; showWin(); }"); await pg.wait_for_timeout(1500)
        brev = await pg.evaluate("() => ({ brev: !!document.querySelector('.brev'), ps: !!document.querySelector('.bps') })")
        await pg.click('#bOk'); await pg.wait_for_timeout(600)
        etter = await pg.evaluate("() => ({ wins: MORBIDIUM.meta.wins, merk: Merknad.har('utskrevet'), kort: !!document.getElementById('winc') })")
        sjekk('utskrivningsbrevet kommer før kortet, og utskrivningen gir merknad', brev == {'brev': True, 'ps': True} and etter == {'wins': 1, 'merk': True, 'kort': True}, [brev, etter])
        await pg.click('#dNew'); await pg.wait_for_timeout(600)
        har = await pg.query_selector('#inGjen')
        sjekk('innleggelsen tilbyr gjeninnleggelse etter første utskrivning', har is not None)
        if har:
            await pg.click('#inGjen'); await pg.click('[data-awk]'); await pg.wait_for_timeout(1500)
            g = await pg.evaluate("() => { const e = spawnEnemyBareTest('pleier', MORBIDIUM.player.x + 3, MORBIDIUM.player.z); return { gjen: MORBIDIUM.run.gjen, hp: Math.round(e.hp), valg: MORBIDIUM.meta.gjenValg }; }")
            sjekk('gjeninnleggelse gir sterkere fiender', g['gjen'] is True and g['valg'] is True and g['hp'] >= 54, g)
            sp = await pg.evaluate("() => { startFloor(1, false); rolig(); const s = Spor.liste[0]; if (!s) return null; const P = MORBIDIUM.player; P.x = s.x; P.z = s.z + .6; return { n: Spor.liste.length, navn: s.h.name, tekst: s.tekst }; }")
            await pg.wait_for_timeout(500)
            pr = await pg.evaluate("() => document.getElementById('prompt').textContent")
            sjekk('tidligere pasienter har rablet på gulvet, og rablingen kan leses', sp is not None and sp['n'] >= 1 and 'Les rablingen' in pr, [sp, pr])
        sjekk('ingen konsollfeil (merknader)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 14) byggeanimasjon og tips for nye pasienter
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await pg.goto(URL); await pg.wait_for_timeout(2000); await pg.evaluate("() => localStorage.clear()")
        await start_lop(pg)
        await pg.wait_for_timeout(1500)
        t1 = await pg.evaluate("() => ({ tips: !!document.querySelector('#tips.inn'), tekst: (document.querySelector('#tips') || {}).textContent || '' })")
        r = await pg.evaluate("""() => { const G = MORBIDIUM, P = G.player; P.hp = P.maxHp = 9999; const r = G.F.rooms.find(r => r.id !== G.F.startId && G.props.some(o => o.room === r.id && o.byggS));
          if (!r) return null; const f = G.props.filter(o => o.room === r.id && o.byggS).length; P.x = r.x + r.w / 2; P.z = r.z + r.h / 2; window.__rom = r.id; return { rom: r.id, skjult: f }; }""")
        await pg.wait_for_timeout(250)
        midt = await pg.evaluate("() => MORBIDIUM.props.filter(o => o.room === window.__rom && o.byggS).length")
        await pg.wait_for_timeout(1500)
        etter = await pg.evaluate("() => ({ igjen: MORBIDIUM.props.filter(o => o.room === window.__rom && o.byggS).length, feil: MORBIDIUM.props.filter(o => o.room === window.__rom && o.g.scale.y < .5 && !o.byggS && o.p.k !== 'drain').length })")
        sjekk('møblene i et rom bygges opp når pasienten kommer inn', r is not None and r['skjult'] > 0 and etter == {'igjen': 0, 'feil': 0}, [r, midt, etter])
        sjekk('første tips vises som lapp', t1['tips'] and len(t1['tekst']) > 10, t1)
        await pg.evaluate("() => rolig()")
        await pg.mouse.move(1150, 360); await pg.wait_for_timeout(1600)
        await pg.keyboard.down('KeyA'); await pg.wait_for_timeout(500)
        gaar = await pg.evaluate("() => [MORBIDIUM.player.doll.view, MORBIDIUM.player.doll.flip]")
        await pg.mouse.move(1160, 380); await pg.wait_for_timeout(300)
        sikter = await pg.evaluate("() => [MORBIDIUM.player.doll.view, MORBIDIUM.player.doll.flip]")
        await pg.keyboard.up('KeyA')
        sjekk('figuren ser dit den går når musa ligger i ro, og mot musa når den brukes', gaar == ['s', -1] and sikter == ['s', 1], [gaar, sikter])
        sjekk('ingen konsollfeil (bygging og tips)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 15) rom i 3D (prøve): kan slås på og av, og følger med til neste etasje
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await pg.goto(URL); await pg.wait_for_timeout(2000); await pg.evaluate("() => localStorage.clear()")
        await start_lop(pg)
        d3 = await pg.evaluate("""async () => { rolig(); MORBIDIUM.meta.settings.d3 = true; applySettings(); await new Promise(r => setTimeout(r, 800));
          const a = { on: D3.on, modeller: D3.modeller.length, lys: D3.pool.filter(l => l.intensity > 0).length, gulv: Paint.mesh.gulv.material.type, glod: R.post.uniforms.uBloom.value > 0 };
          startFloor(2, false); rolig(); await new Promise(r => setTimeout(r, 800)); a.etasje2 = D3.modeller.length > 0 && Paint.mesh.gulv.material.type === 'MeshToonMaterial';
          MORBIDIUM.meta.settings.d3 = false; applySettings(); await new Promise(r => setTimeout(r, 300));
          a.av = { gulv: Paint.mesh.gulv.material.type, lys: R.post.uniforms.uLights.value, modeller: D3.modeller.length, synlig: MORBIDIUM.props.every(o => !o.g || !o.g.userData.m || o.g.userData.m.visible) }; return a; }""")
        sjekk('rom i 3D slås på med modeller, punktlys og glød, følger med til neste etasje og kan slås av igjen', d3['on'] and d3['modeller'] > 5 and d3['lys'] > 0 and d3['gulv'] == 'MeshToonMaterial' and d3['glod'] and d3['etasje2'] and d3['av'] == {'gulv': 'MeshBasicMaterial', 'lys': 1, 'modeller': 0, 'synlig': True}, d3)
        sjekk('ingen konsollfeil (3D)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 4) alle fire sjefer med alle angrep, og rommene i Isolat og arkiv
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg)
        for depth in [1, 2, 3, 4]:
            info = await pg.evaluate("""(d) => { const G = MORBIDIUM; G.player.hp = G.player.maxHp = 9999; startFloor(d, false); const r = G.F.rooms[G.F.bossId]; G.player.x = r.x + r.w / 2; G.player.z = r.z + r.h - 2; return { theme: G.th.name, tpl: G.F.rooms.map(r => r.template) }; }""", depth)
            if depth == 3:
                sjekk('Isolat og arkiv har egne rom', 'isolat' in info['tpl'] or 'kartotek' in info['tpl'], info['tpl'])
                await pg.evaluate("""() => { const G = MORBIDIUM, r = G.F.rooms.find(r => r.template === 'kartotek') || G.F.rooms.find(r => r.template === 'isolat'); if (r) { G.player.x = r.x + r.w / 2; G.player.z = r.z + r.h / 2; G.rooms[r.id].cleared = true; } }""")
                await pg.wait_for_timeout(1200); await pg.screenshot(path='/tmp/e_5arkiv.png')
                await pg.evaluate("""() => { const G = MORBIDIUM, r = G.F.rooms.find(r => r.template === 'isolat'); if (r) { G.player.x = r.x + r.w / 2; G.player.z = r.z + r.h / 2; G.rooms[r.id].cleared = true; } }""")
                await pg.wait_for_timeout(1000); await pg.screenshot(path='/tmp/e_6isolat.png')
                await pg.evaluate("""() => { const G = MORBIDIUM, r = G.F.rooms[G.F.bossId]; G.player.x = r.x + r.w / 2; G.player.z = r.z + r.h - 2; }""")
            await pg.wait_for_timeout(3500)
            bnavn = await pg.evaluate("() => MORBIDIUM.boss && MORBIDIUM.boss.type")
            sjekk(f'sjef i etasje {depth}', bnavn is not None, bnavn)
            kinds = await pg.evaluate("() => MORBIDIUM.boss ? [...new Set(MORBIDIUM.boss.B0.attacks)] : []")
            for k in kinds:
                await pg.evaluate("(k) => { const B = MORBIDIUM.boss, P = MORBIDIUM.player; if (!B) return; B.state = 'chase'; B.cd = 99; P.hp = P.maxHp; bossAttackTest(B, k); }", k)
                await pg.wait_for_timeout(1700)
                if (depth, k) in [(3, 'isolate'), (4, 'pages'), (2, 'flood'), (1, 'hookpull')]:
                    await pg.screenshot(path=f'/tmp/e_7sjef_{depth}_{k}.png')
            await pg.evaluate("() => { const B = MORBIDIUM.boss; if (B) hurt(B, 99999, { from: 'player' }); }")
            await pg.wait_for_timeout(2500)
            sjekk(f'luken åpner seg i etasje {depth}', await pg.evaluate("() => !!MORBIDIUM.trapdoor"))
        sjekk('ingen konsollfeil (sjefer)', not pg.errs, pg.errs[:6])
        await pg.close()

        await b.close()
    print('\n' + ('Alt gikk bra.' if not feil else 'Feilet: ' + ', '.join(feil)))
    sys.exit(1 if feil else 0)

asyncio.run(main())
