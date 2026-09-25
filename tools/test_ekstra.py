"""Tester enkeltfunksjoner i Morbidium i headless Chromium: lagring og fortsettelse,
berøringsoppsett på stående mobil, journalen og nyere systemer.

Bruk:  python3 tools/test_ekstra.py [--three STI]   (samme valg som test_spill.py)
Skjermbilder havner i /tmp/e_*.png. Skriptet avslutter med kode 1 hvis noe feiler.
"""
import pathlib, os, sys, asyncio
from playwright.async_api import async_playwright
THREE = os.environ.get('MORBIDIUM_THREE') or (sys.argv[sys.argv.index('--three') + 1] if '--three' in sys.argv else None)
# Rommene er 3D som standard, men programvaregrafikken i testnettleseren er så treg i 3D at tidsfølsomme
# tester bommer. Derfor går de fleste testene i 2D (?2d), som før. Testene for 3D bruker URL3D eller slår det på selv.
# Spørsmålstegn og ikke #, fordi en ny goto til samme adresse med # bare hopper i siden i stedet for å laste den på nytt.
URL3D = (pathlib.Path(__file__).resolve().parent.parent / 'dist' / 'morbidium.html').as_uri()
URL = URL3D + '?2d'
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

async def start_lop(pg, awk=None, url=None):
    await pg.goto(url or URL); await pg.wait_for_timeout(2500)
    await pg.click('#tNew'); await pg.wait_for_timeout(500)
    sel = f'[data-awk="{awk}"]' if awk else '[data-awk]'
    if awk and not await pg.query_selector(sel): sel = '[data-awk]'
    await pg.click(sel); await pg.wait_for_timeout(1500)

# en side i pasienthåndboka får plass: panelet er innenfor skjermen, teksten eller fiendekortene flyter ikke over, og hvert fiendekort har bilde
HB_PLASS = """() => { const f = document.querySelector('#panel .fit'), r = f.getBoundingClientRect(), t = document.querySelector('.htext') || document.querySelector('.findeks'), kort = [...document.querySelectorAll('.fkort')];
  return r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1 && t.scrollHeight <= t.clientHeight + 2 && kort.every(k => k.scrollHeight <= k.clientHeight + 2 && !!k.querySelector('canvas')) && document.querySelector('.hpage h2').textContent.length > 2; }"""

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
        for_ = await pg.evaluate("() => ({ d: MORBIDIUM.depth, items: MORBIDIUM.run.items.slice(), teeth: MORBIDIUM.player.teeth, name: MORBIDIUM.run.patient.name, look: JSON.stringify(MORBIDIUM.run.look), drom: !!MORBIDIUM.drom })")
        await pg.evaluate("() => showTitle()"); await pg.wait_for_timeout(800)
        har = await pg.query_selector('#tCont')
        sjekk('Fortsett-knapp på tittelen', har is not None)
        if har:
            await pg.click('#tCont'); await pg.wait_for_timeout(1500)
            igjen = await pg.evaluate("() => !!MORBIDIUM.drom")
            sjekk('drømmen mellom etasjene kommer før neste etasje, og spilles på nytt etter Fortsett', for_['drom'] and igjen, (for_['drom'], igjen))
            await pg.evaluate("() => Drom.hopp()"); await pg.wait_for_timeout(800)
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
        # bakholdet kommer 0,9 sekunder etter at glasset er tatt, og første bølge 0,7 sekunder spilltid etter det; testnettleseren går sakte, så vi venter på spilltiden
        kamp = await pg.evaluate("async () => { for (let i = 0; i < 120 && !MORBIDIUM.enemies.some(e => e.alive); i++) await new Promise(r => setTimeout(r, 100)); return { combat: !!MORBIDIUM.combat, n: MORBIDIUM.enemies.filter(e => e.alive).length, items: MORBIDIUM.run.items.length }; }")
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
        st = await pg.evaluate("""async () => { const dl = MORBIDIUM.player.doll, s = MORBIDIUM.meta.settings, bein = () => dl.back.strokes.filter(k => !k.circle).map(k => [k.w, k.color]), vent = () => new Promise(r => setTimeout(r, 1200));
          const a = { standard: s.lemmer, tynn: bein() }; s.lemmer = 'tykke'; applySettings(); await vent(); a.tykk = bein(); s.lemmer = 'tynne'; applySettings(); await vent(); a.tilbake = bein(); a.rig = [dl.rig.legW, dl.rig.leg]; a.strek = [STREK.ben, STREK.farge]; return a; }""")
        sjekk('armer og bein er tynne blekkstreker som standard og kan byttes til tykke i innstillingene', st['standard'] == 'tynne' and st['tynn'] and all(k == st['strek'] for k in st['tynn']) and all(k == st['rig'] for k in st['tykk']) and st['tilbake'] == st['tynn'], st)
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
        kap, nkap = [], await pg.evaluate("() => HANDBOK.length")
        for k in range(nkap):
            await pg.click(f'[data-kap="{k}"]'); await pg.wait_for_timeout(120)
            for side in range(await pg.evaluate("(k) => hbSider(HANDBOK[k])", k)):
                if side: await pg.click('#hNext'); await pg.wait_for_timeout(150)
                kap.append(await pg.evaluate(HB_PLASS))
        sjekk('pasienthåndboka har ti kapitler med fiendeindeks, og alle sidene får plass', nkap == 10 and len(kap) == 17 and all(kap), kap)
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
        sjekk('musikken spiller på tittelen, går over i kamp og stopper ved død', t == {'navn': 'tittel', 'klar': True} and k['navn'] == 'park' and k['niva'] == 1 and k['steg'] > 3 and d is None, [t, k, d])
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

        # 4) alle fire sjefer med alle angrep, og rommene i Isolat og arkiv
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg)
        # sjefene trekkes tilfeldig per løp, så her velges hver av dem med vilje, også Den Store Klumpen
        for depth, sjef in [(1, 'krok'), (2, 'rust'), (4, 'arkivar'), (3, 'klumpen'), (1, 'hekk'), (5, 'hjort'), (6, 'journalen')]:
            info = await pg.evaluate("""([d, s]) => { const G = MORBIDIUM; G.player.hp = G.player.maxHp = 9999; G.run.sjefer[d] = s; startFloor(d, false); const r = G.F.rooms[G.F.bossId]; G.player.x = r.x + r.w / 2; G.player.z = r.z + r.h - 2; return { theme: G.th.name, tpl: G.F.rooms.map(r => r.template) }; }""", [depth, sjef])
            if depth == 4:
                sjekk('Isolat og arkiv har egne rom', 'isolat' in info['tpl'] or 'kartotek' in info['tpl'], info['tpl'])
                await pg.evaluate("""() => { const G = MORBIDIUM, r = G.F.rooms.find(r => r.template === 'kartotek') || G.F.rooms.find(r => r.template === 'isolat'); if (r) { G.player.x = r.x + r.w / 2; G.player.z = r.z + r.h / 2; G.rooms[r.id].cleared = true; } }""")
                await pg.wait_for_timeout(1200); await pg.screenshot(path='/tmp/e_5arkiv.png')
                await pg.evaluate("""() => { const G = MORBIDIUM, r = G.F.rooms.find(r => r.template === 'isolat'); if (r) { G.player.x = r.x + r.w / 2; G.player.z = r.z + r.h / 2; G.rooms[r.id].cleared = true; } }""")
                await pg.wait_for_timeout(1000); await pg.screenshot(path='/tmp/e_6isolat.png')
                await pg.evaluate("""() => { const G = MORBIDIUM, r = G.F.rooms[G.F.bossId]; G.player.x = r.x + r.w / 2; G.player.z = r.z + r.h - 2; }""")
            await pg.wait_for_timeout(3500)
            bnavn = await pg.evaluate("() => MORBIDIUM.boss && MORBIDIUM.boss.type")
            sjekk(f'{sjef} er sjef i etasje {depth}', bnavn == sjef, bnavn)
            kinds = await pg.evaluate("() => MORBIDIUM.boss ? [...new Set(MORBIDIUM.boss.B0.attacks)] : []")
            for k in kinds:
                await pg.evaluate("(k) => { const B = MORBIDIUM.boss, P = MORBIDIUM.player; if (!B) return; B.state = 'chase'; B.cd = 99; P.hp = P.maxHp; bossAttackTest(B, k); }", k)
                await pg.wait_for_timeout(1700)
                if (depth, k) in [(4, 'isolate'), (6, 'pages'), (2, 'flood'), (1, 'hookpull'), (3, 'rull'), (1, 'hekkring'), (5, 'maane')]:
                    await pg.screenshot(path=f'/tmp/e_7sjef_{depth}_{k}.png')
            await pg.evaluate("() => { const B = MORBIDIUM.boss; if (B) hurt(B, 99999, { from: 'player' }); }")
            await pg.wait_for_timeout(2500)
            sjekk(f'luken åpner seg etter {sjef} i etasje {depth}', await pg.evaluate("() => !!MORBIDIUM.trapdoor"))
        sjekk('ingen konsollfeil (sjefer)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 16) 3D er standard: gamle lagringer slås over én gang, et nytt valg huskes, og kvaliteten går ned ett trinn om gangen til 3D slås av
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await pg.goto(URL3D); await pg.wait_for_timeout(2000)
        await pg.evaluate("() => { localStorage.clear(); localStorage.setItem('morbidium_meta_v2', JSON.stringify({ deaths: 1, settings: { d3: false, vol: .5 } })); }")
        await pg.reload(); await pg.wait_for_timeout(2000)
        m1 = await pg.evaluate("() => { const s = MORBIDIUM.meta.settings, a = { d3: s.d3, sv: s.sv, kvalitet: s.kvalitet }; s.d3 = false; saveMeta(); return a; }")
        await pg.reload(); await pg.wait_for_timeout(2000)
        m1['huskes'] = await pg.evaluate("() => MORBIDIUM.meta.settings.d3")
        sjekk('3D slås på for gamle lagringer, og et nytt valg om å slå det av huskes', m1 == {'d3': True, 'sv': 2, 'kvalitet': 0, 'huskes': False}, m1)
        await pg.evaluate("() => localStorage.clear()")
        await start_lop(pg, url=URL3D)
        q = await pg.evaluate("""async () => { rolig(); await new Promise(r => setTimeout(r, 600)); const s = MORBIDIUM.meta.settings, a = { d3: s.d3, on: D3.on, niva: D3.kval() };
          a.trinn = [D3.nedgrader(), D3.nedgrader(), D3.nedgrader()]; await new Promise(r => setTimeout(r, 300));
          a.etter = { d3: s.d3, on: D3.on, lagret: JSON.parse(localStorage.getItem('morbidium_meta_v2')).settings.d3 };
          s.kvAuto = null; s.d3 = true; applySettings(); await new Promise(r => setTimeout(r, 600));
          D3.tvingMaal = true; for (let i = 0; i < 45; i++) D3.maal(.1); D3.tvingMaal = false; a.maalt = D3.kval();
          s.kvalitet = 1; applySettings(); a.fast = D3.kval(); a.lavGlod = D3.Q().glod; s.kvalitet = 0; s.kvAuto = null; applySettings();
          s.lights = false; applySettings(); await new Promise(r => setTimeout(r, 400)); a.lysAv = { flat: !!D3.q.flat, lys: D3.pool.length, skygge: D3.mane.castShadow };
          s.lights = true; applySettings(); await new Promise(r => setTimeout(r, 400)); a.lysPaa = { flat: !!D3.q.flat, lys: D3.pool.length > 0, skygge: D3.mane.castShadow };
          return a; }""")
        sjekk('3D er på fra start, og kvaliteten går fra høy til middels til lav før 3D slås av og lagres av',
              q['d3'] and q['on'] and q['niva'] == 'hoy' and q['trinn'] == ['middels', 'lav', 'av'] and q['etter'] == {'d3': False, 'on': False, 'lagret': False}, q)
        sjekk('lav bildefrekvens måles og gir et trinn ned, og fast kvalitet i innstillingene overstyrer', q['maalt'] == 'middels' and q['fast'] == 'lav' and q['lavGlod'] is False, q)
        sjekk('«Lys og skygge» av gir jevnt lys i 3D uten punktlys og skygger, og på igjen gir dem tilbake', q['lysAv'] == {'flat': True, 'lys': 0, 'skygge': False} and q['lysPaa'] == {'flat': False, 'lys': True, 'skygge': True}, q)
        sjekk('ingen konsollfeil (3D som standard)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 17) animasjonssystemet: tegnede ruter når arket mangler, spilles av og forsvinner, går i ring, baklengs og blir stående
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg)
        an = await pg.evaluate("""() => { rolig(); const P = MORBIDIUM.player, a = {};
          a.ruter = Object.keys(ANIM).map(k => [k, Anim.rammer(k).length]);
          const h = Anim.lag('kastesprut', P.x, P.z, { fps: 20 }); a.lagd = Anim.aktive.includes(h);
          for (let i = 0; i < 12; i++) Anim.tick(.05); a.ferdig = h.done && !Anim.aktive.includes(h);
          const l = Anim.lag('oye', P.x + 1, P.z, { loop: true, fps: 10 }); for (let i = 0; i < 30; i++) Anim.tick(.05); a.ring = !l.done && Anim.aktive.includes(l); Anim.fjern(l); Anim.tick(.01); a.fjernet = !Anim.aktive.includes(l);
          const r = Anim.lag('oye', P.x - 1, P.z, { fps: 10, fart: -1, start: 4 }); a.start = r.i; for (let i = 0; i < 20; i++) Anim.tick(.05); a.baklengs = r.i === 0 && r.done;
          const s = Anim.lag('blodsprut', P.x, P.z, { hold: true, fps: 30 }); for (let i = 0; i < 20; i++) Anim.tick(.05); a.hold = s.done && Anim.aktive.includes(s) && s.i === s.rammer.length - 1; Anim.fjern(s);
          const k = posStat({ navn: 'kast', p: .5 }); a.pose = !!k && Object.values(k).every(v => Array.isArray(v) && v.every(Number.isFinite)); a.ukjent = posStat({ navn: 'finnesikke', p: .5 }) === null;
          return a; }""")
        sjekk('animasjonene har ruter (tegnet når arket mangler), spilles av og forsvinner, går i ring, baklengs og blir stående',
              all(n > 1 for k, n in an['ruter']) and an['lagd'] and an['ferdig'] and an['ring'] and an['fjernet'] and an['start'] == 4 and an['baklengs'] and an['hold'], an)
        sjekk('posituren «kast» gir tall til dukken, og en ukjent positur gir ingenting', an['pose'] and an['ukjent'], an)

        # 18) blod: flekker, sprut på veggen, kjøttbiter ved tunge slag, blod på skjermen når pasienten skades, og det kan slås av
        bl = await pg.evaluate("""async () => { startFloor(2, false); rolig(); const G = MORBIDIUM, P = G.player, r = G.F.rooms.find(r => r.role === 'combat'), n = () => Object.values(Blod.pools).reduce((a, p) => a + p.n, 0);
          P.x = r.x + r.w / 2; P.z = r.z + r.h / 2; Bygg.alt(); const a = {}, n0 = n();
          const e = spawnEnemy('pleier', P.x + 1.5, P.z, false, 1); e.state = 'chase'; e.cd = 99; hurt(e, 9999, { from: 'player', x: P.x, z: P.z, kb: 9 });
          await new Promise(r => setTimeout(r, 300)); a.flekker = n() - n0; a.biter = Blod.bitene.length;
          let vegg = false; for (let x = r.x + 1; x < r.x + r.w - 1 && !vegg; x++) for (let z = r.z + .4; z < r.z + 2.5 && !vegg; z += .3) vegg = Blod.vegg(x + .5, z, '#8a1010', 1);
          a.vegg = vegg && Blod.vegger.length > 0 && Blod.drypper.length > 0;
          R.fx.blod = 0; P.hp = P.maxHp; P.iframe = P.invuln = 0; P.deny = null; hurt(P, 2, { type: 'pleier', x: P.x - 1, z: P.z }); a.skjerm = R.fx.blod > 0;
          const gulv = n(); Blod.sett(false); a.av = R.fx.blod === 0 && !Blod.on; a.ryddet = { vegger: Blod.vegger.length, drypp: Blod.drypper.length, biter: Blod.bitene.length, gulvIgjen: n() === gulv }; Blod.sett(true); P.hp = P.maxHp;
          return a; }""")
        sjekk('blod: flekker og kjøttbiter når en fiende knuses, sprut med drypp på veggen og blod på skjermen', bl['flekker'] > 3 and bl['biter'] >= 4 and bl['vegg'] and bl['skjerm'] and bl['av'], bl)
        sjekk('slås blod og skrekk av, forsvinner sprut på veggene, drypp og kjøttbiter, mens flekkene på gulvet blir liggende', bl['ryddet'] == {'vegger': 0, 'drypp': 0, 'biter': 0, 'gulvIgjen': True}, bl)
        sjekk('ingen konsollfeil (animasjon og blod)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 19) de nye fiendene: Kasteren kaster, Trillepasienten ruller, Speilpasienten gir sju års ulykke, klumpungen lever.
        #     e.t = 0 avslutter oppstigningen med en gang. Settes state rett til 'chase', blir dukken stående i skala 0,01.
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg)
        await pg.evaluate("""() => { rolig(); const G = MORBIDIUM, P = G.player, r = G.F.rooms.filter(r => r.role === 'combat')[0]; P.x = r.x + r.w / 2; P.z = r.z + r.h / 2; P.hp = P.maxHp = 9999; Bygg.alt();
          window._nye = ['kasteren', 'trille', 'speil', 'klumpunge'].map((t, i) => { const e = spawnEnemy(t, P.x - 3 + i * 2, P.z - 2.5, false, 1); e.t = 0; e.sleep = 0; e.cd = 0; return e; }); window._luck0 = Items.stat('luck'); }""")
        # programvaregrafikken er treg, så vi venter til Kasteren har kastet og noen har truffet (høyst 30 sekunder)
        for _ in range(30):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("() => { const G = MORBIDIUM; return (G.puddles.some(p => p.kind === 'mokk') || G.projectiles.some(p => p.type === 'klump')) && G.player.hp < 9999; }"): break
        ny_ = await pg.evaluate("""() => { const G = MORBIDIUM, [k, t, s, u] = window._nye;
          const a = { typer: window._nye.map(e => e.type), levende: window._nye.filter(e => e.alive).length, hjul: !!t.doll.hjul, kastet: G.puddles.some(p => p.kind === 'mokk') || G.projectiles.some(p => p.type === 'klump'), skadet: G.player.hp < 9999 };
          hurt(s, 99999, { from: 'player', x: G.player.x, z: G.player.z }); a.ulykke = (G.run.buffs || {}).ulykke || 0; a.luck = window._luck0 - Items.stat('luck');
          return a; }""")
        await pg.screenshot(path='/tmp/e_8nye_fiender.png')
        sjekk('Kasteren, Trillepasienten, Speilpasienten og klumpungen lever og gjør skade, rullestolen har hjul, og Kasteren kaster',
              ny_['typer'] == ['kasteren', 'trille', 'speil', 'klumpunge'] and ny_['levende'] >= 3 and ny_['hjul'] and ny_['kastet'] and ny_['skadet'], ny_)
        sjekk('Speilpasienten knust gir sju års ulykke (mindre flaks)', ny_['ulykke'] == 1 and ny_['luck'] == 6, ny_)
        sjekk('ingen konsollfeil (nye fiender fra ChatGPT)', not pg.errs, pg.errs[:6])

        # 20) minisjefer: kommer i risikorommet med egen helsestang, og legger igjen preparatglass og hjerte
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

        # 21) sjefene trekkes fra frøet: samme frø gir samme sjefer, ulike frø gir variasjon, og Journalen er alltid sist
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await pg.goto(URL); await pg.wait_for_timeout(2000)
        tr = await pg.evaluate("""() => { const a = JSON.stringify(trekkSjefer(4242)) === JSON.stringify(trekkSjefer(4242)), sett = new Set(), alle = new Set(); let sist = true;
          for (let s = 1; s < 80; s++) { const t = trekkSjefer(s), fem = [1, 2, 3, 4, 5].map(d => t[d]); sett.add(fem.join()); fem.forEach(x => alle.add(x)); sist = sist && t[MAX_DEPTH] === 'journalen' && new Set(fem).size === Math.min(5, SJEF_PULJE.length) && fem.every(x => SJEF_PULJE.includes(x)); }
          return { lik: a, varianter: sett.size, alle: [...alle].sort(), pulje: SJEF_PULJE.slice().sort(), sist, dybde: MAX_DEPTH }; }""")
        sjekk('sjefene i etasje 1 til 5 trekkes fra frøet, hele puljen dukker opp, og Journalen er alltid nederst i etasje 6', tr['lik'] and tr['varianter'] >= 10 and tr['alle'] == tr['pulje'] and tr['sist'] and tr['dybde'] == 6, tr)
        lagret = await pg.evaluate("() => { Merknad.onBoss({ type: 'klumpen' }); return (JSON.parse(localStorage.getItem('morbidium_meta_v2')).sjefDrap || {}).klumpen; }")
        sjekk('en slått sjef lagres med en gang (til fiendeindeksen)', lagret == 1, lagret)

        # 22) UI-settet fra ChatGPT: uten bilder tegner CSS-en som før, med bilder byttes rammer, ringer, hjerter og ikoner inn uten at boksene endrer størrelse
        await start_lop(pg)
        ui = await pg.evaluate("""async () => { rolig(); const a = {}, px = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
          const P = MORBIDIUM.player; P.cds[1] = 4.6; (P.cdMax || (P.cdMax = [1, 1, 1, 1]))[1] = 8; await new Promise(r => setTimeout(r, 500));
          const cd = document.querySelector('#ac1 .cd'); a.nedtelling = cd && !cd.classList.contains('hidden') ? cd.textContent : null; a.sektor = cd ? +cd.style.getPropertyValue('--p') : -1;
          a.uten = brukUIsett().length === 0 && !document.body.classList.contains('ui-sett'); a.kodehjerte = !hjerteHtml(1, c => '<i style="color:' + c + '"></i>').includes('uihjerte');
          const boks = () => { const r = document.getElementById('plate').getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; }, f0 = boks();
          for (const k of ['ui_panel', 'ui_kort', 'ui_ring_kart', 'ui_hjerte_full', 'ui_hjerte_halv', 'ui_ikon_pause']) SPRITES[k] = px;
          a.halvtSett = hjerteHtml(1, c => '').includes('uihjerte'); SPRITES.ui_hjerte_tom = px;
          a.brukt = brukUIsett(); a.css = (document.getElementById('uiSett') || { textContent: '' }).textContent.includes('border-image'); a.ikon = !!document.querySelector('#bPause img');
          a.hjerte = hjerteHtml(.5, c => '').includes('uihjerte'); const f1 = boks(); a.boks = Math.abs(f1[0] - f0[0]) <= 2 && Math.abs(f1[1] - f0[1]) <= 2;
          return a; }""")
        sjekk('kortet viser nedtellingen i sekunder og en sektor som krymper', ui['nedtelling'] in ('4s', '5s') and 0.3 < ui['sektor'] < 0.65, ui)
        sjekk('UI-settet: CSS-en tegner når bildene mangler, og ChatGPTs bilder tas i bruk uten å endre størrelsen på boksene',
              ui['uten'] and ui['kodehjerte'] and not ui['halvtSett'] and ui['brukt'] == ['ui_panel', 'ui_kort', 'ui_ring_kart', 'ui_ikon_pause'] and ui['css'] and ui['ikon'] and ui['hjerte'] and ui['boks'], ui)
        sjekk('ingen konsollfeil (sjefpulje og UI-sett)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 23) fiendeindeksen i håndboka får plass også på smal skjerm
        pg = await ny_side(b, viewport={'width': 400, 'height': 800})
        await pg.goto(URL); await pg.wait_for_timeout(2000)
        await pg.evaluate("() => localStorage.clear()")
        await pg.click('#tHelp'); await pg.wait_for_timeout(300)
        smal = []
        for k in [8, 9]:
            await pg.click(f'[data-kap="{k}"]'); await pg.wait_for_timeout(150)
            for side in range(await pg.evaluate("(k) => hbSider(HANDBOK[k])", k)):
                if side: await pg.click('#hNext'); await pg.wait_for_timeout(150)
                smal.append(await pg.evaluate(HB_PLASS))
        await pg.screenshot(path='/tmp/e_10indeks_smal.png')
        sjekk('fiendeindeksen får plass på smal skjerm, to kort per side', len(smal) == 16 and all(smal), smal)
        sjekk('ingen konsollfeil (smal indeks)', not pg.errs, pg.errs[:6])
        await pg.close()

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

        # 25) hendelsene: to til fire per etasje, ingen fra etasjen over, samtale med valg, minne på tvers av løp og følgene
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg)
        fo = await pg.evaluate("""() => { const G = MORBIDIUM, runder = [];
          for (let k = 0; k < 3; k++) { G.run.hendelser = []; G.run.hendForrige = []; const ut = [];
            for (let d = 1; d <= 6; d++) { startFloor(d, false); rolig(); ut.push(Hendelse.aktive.map(h => h.id)); }
            runder.push({ antall: ut.map(l => l.length), gyldig: ut.every((l, i) => l.every(id => HENDELSER[id].dybder.includes(i + 1))), naboer: ut.every((l, i) => i === 0 || !l.some(id => ut[i - 1].includes(id))), unike: new Set(ut.flat()).size }); }
          return { runder, totalt: Object.keys(HENDELSER).length }; }""")
        sjekk('hver etasje får to til fire hendelser som passer dybden, aldri den samme som i etasjen over', fo['totalt'] >= 18 and all(all(2 <= n <= 4 for n in r['antall']) and r['gyldig'] and r['naboer'] and r['unike'] >= 11 for r in fo['runder']), fo)
        oy = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t));
          startFloor(2, false); rolig(); Hendelse.fjern(); const h = Hendelse.tving('oyet'); if (!h) return null;
          const s = freeSpot(h.x, h.z + 1.2, 2); P.x = s.x; P.z = s.z; R.snapCamera(P.x, P.z); for (let i = 0; i < 100 && !(h.oye.i >= 3 && h.pm.visible); i++) await vent(100); // øyet åpner seg på 0,375 s spilltid, og testnettleseren går sakte
          const aapent = h.oye.i >= 3 && h.pm.visible, it = findInteract(), prompt = it && it.t;
          P.teeth = 0; P.hp = P.maxHp - 25; it.fn(); await vent(80);
          const panel = !!document.querySelector('.samtale'), fire = document.querySelectorAll('[data-sv]').length === 4, bilde = !!document.querySelector('.samtale .sbilde canvas');
          Samtale.velg(0); await vent(50); const sperret = document.querySelector('[data-sv="0"]').disabled; Samtale.velg(0); await vent(50);
          const fortsatt = !!document.querySelector('.samtale') && P.teeth === 0; Samtale.velg(1); await vent(50); closePanel();
          const hp0 = P.hp, m0 = P.morb; Hendelse.start(h); await vent(80); const husker = document.querySelector('.samtale .stekst').innerText.includes('Du igjen');
          Samtale.velg(2); await vent(50); const bedre = P.hp > hp0, brukt = h.brukt; closePanel(); await vent(1600);
          const lagret = (JSON.parse(localStorage.getItem('morbidium_meta_v2')) || {}).hendelser || {};
          return { aapent, prompt, panel, fire, bilde, sperret, fortsatt, bedre, brukt, lukket: h.oye.i < 3, husker, teller: lagret.oyet, igjen: !findInteract() || findInteract().t !== 'Se inn i sprekken' }; }""")
        sjekk('øyet i sprekken åpner seg når du kommer nær, og samtalen har bilde og fire valg', bool(oy) and oy['aapent'] and oy['prompt'] == 'Se inn i sprekken' and oy['panel'] and oy['fire'] and oy['bilde'], oy)
        sjekk('et valg du ikke har råd til er sperret og gjør ingenting', bool(oy) and oy['sperret'] and oy['fortsatt'], oy)
        sjekk('øyet husker deg andre gang, og tellingen lagres', bool(oy) and oy['husker'] and (oy['teller'] or 0) >= 2, oy)
        sjekk('etter en belønning lukker øyet seg og kan ikke brukes igjen', bool(oy) and oy['bedre'] and oy['brukt'] and oy['lukket'] and oy['igjen'], oy)
        tast = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t));
          startFloor(3, false); rolig(); Hendelse.fjern(); const h = Hendelse.tving('kaffe'); P.coffee = false; Hendelse.start(h); await vent(80);
          document.dispatchEvent(new KeyboardEvent('keydown', { key: '1', code: 'Digit1', bubbles: true })); await vent(80);
          const r = { kaffe: P.coffee === true, svar: !!document.querySelector('.samtale') && document.querySelector('.samtale .stekst').innerText.includes('kaffe') }; closePanel(); return r; }""")
        sjekk('tallene på tastaturet velger i samtalen', tast['kaffe'] and tast['svar'], tast)
        rom = await pg.evaluate("""() => { const G = MORBIDIUM, P = G.player; for (let k = 0; k < 6; k++) { startFloor(1, false); Hendelse.fjern(); const h = Hendelse.tving('ku'); if (!h) continue;
            for (const e of G.enemies) if (e.alive) killEntity(e, {}); G.combat = null; G.lock = null; const st = G.rooms[h.sted.rom]; st.cleared = false;
            P.x = h.x; P.z = h.z + 1; const for_ = findInteract(); st.cleared = true; const etter = findInteract();
            return { for: for_ ? for_.t : null, etter: etter ? etter.t : null }; } return null; }""")
        sjekk('en hendelse i et kamprom kan først brukes når rommet er ryddet', bool(rom) and rom['for'] != 'Hils på kua' and rom['etter'] == 'Hils på kua', rom)
        fl = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), ut = {};
          startFloor(1, false); rolig(); Hendelse.fjern(); let h = null; for (let k = 0; k < 6 && !h; k++) { startFloor(1, false); rolig(); Hendelse.fjern(); h = Hendelse.tving('graven'); }
          G.run.sjefSvekk = {}; Hendelse.start(h); await vent(50); Samtale.velg(2); closePanel(); const B = spawnBoss(1, P.x + 4, P.z); ut.sjef = B.hp / B.max;
          h = null; for (const d of [3, 4, 6, 2, 4, 6]) { if (h) break; startFloor(d, false); rolig(); Hendelse.fjern(); h = Hendelse.tving('hjemmebrent'); } if (h) { Hendelse.start(h); await vent(50); Samtale.velg(0); closePanel(); ut.sterk = P.kamferT > 20; await vent(3000); ut.spy = G.puddles.filter(p => p.kind === 'vomit').length; }
          startFloor(2, false); rolig(); Hendelse.fjern(); h = null; for (let k = 0; k < 6 && !h; k++) { startFloor(2, false); rolig(); Hendelse.fjern(); h = Hendelse.tving('tannfeen'); }
          if (h) { P.teeth = 20; const m0 = P.maxHp; Hendelse.start(h); await vent(50); Samtale.velg(0); closePanel(); ut.hjerte = P.maxHp - m0; ut.tenner = P.teeth; }
          startFloor(2, false); rolig(); Hendelse.fjern(); h = null; for (let k = 0; k < 6 && !h; k++) { startFloor(2, false); rolig(); Hendelse.fjern(); h = Hendelse.tving('dans'); }
          if (h) { P.x = h.x + 1.5; P.z = h.z + 1.5; P.vx = P.vz = 0; Hendelse.start(h); await vent(50); Samtale.velg(0); for (let t = 0; t < 40 && !h.ferdig; t++) { P.vx = P.vz = 0; await vent(500); } ut.dans = h.ferdig === true && h.brukt === true && !h.dukke; ut.dansIgjen = h.data.dans; }
          const gamle = Hendelse.aktive.flatMap(x => x.obj); startFloor(3, false); rolig(); ut.ryddet = gamle.every(o => !o.parent);
          return ut; }""")
        sjekk('graven svekker sjefen, hjemmebrent gir styrke og et spor av spy, tannfeen gir et hjerte og dansen gir noe når du står stille', fl.get('sjef', 1) < .85 and fl.get('sterk') and fl.get('spy', 0) >= 1 and fl.get('hjerte') == 10 and fl.get('tenner') == 5 and fl.get('dans'), fl)
        sjekk('hendelsene ryddes bort når du går til neste etasje', fl.get('ryddet'), fl)
        await pg.screenshot(path='/tmp/e_12hendelser.png')
        sjekk('ingen konsollfeil (hendelser)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 26) drømmene: historien fra frøet, fem kapitler, minnene, skyggen, døra, valgene, slutten og pasientmappa
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg)
        tk = await pg.evaluate("""() => { const run = MORBIDIUM.run, gammel = run.historie, fro = run.seed, feil = [], hjem = new Set(), like = []; let n = 0;
          for (let s = 1; s <= 240; s++) { run.historie = null; run.seed = s * 7919; const H = Drom.historie(), S = Drom.ord(H), tekster = []; hjem.add(H.hjem);
            if (s <= 3) { run.historie = null; like.push(JSON.stringify(Drom.historie()) === JSON.stringify(H)); }
            for (const k of [1, 2, 3, 4, 5]) { const K = DROM_KAP[k], v = K.valg(S); tekster.push(K.intro(S), ...K.minner(S).map(m => m.tittel + ' ' + m.tekst), ...K.figurer(S), v.tekst, v.baklengs || '', ...v.valg.map(o => o.tekst + ' ' + o.svar)); }
            for (const k of Object.keys(DROM_SLUTT)) tekster.push(DROM_SLUTT[k].tekst(S)); tekster.push(...S.skyld.jeg(S));
            for (const t of tekster) { n++; if (/undefined|NaN|\$\{|\[object|null/.test(t)) feil.push(s + ': ' + t.slice(0, 90)); } }
          run.historie = gammel; run.seed = fro; return { n, feil: feil.slice(0, 4), antall: feil.length, hjem: hjem.size, like }; }""")
        sjekk('historien trekkes likt fra frøet, og alle tekstene i fem kapitler blir hele setninger', tk['antall'] == 0 and tk['n'] > 5000 and tk['hjem'] == 7 and all(tk['like']), tk)
        dr = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), ut = {};
          startFloor(1, false); rolig(); descend(); await vent(500);
          ut.drom = !!G.drom && G.drom.kap === 1 && G.depth === 2 && !!document.querySelector('.samtale'); ut.fiender = G.enemies.length; closePanel();
          const m0 = Drom.minner[0]; P.x = m0.x; P.z = m0.z + 1.1; const it = findInteract(); ut.prompt = it && it.t; it.fn(); await vent(80); ut.panel = !!document.querySelector('.samtale'); closePanel();
          ut.skygge = Drom.skygge.aktiv && Drom.skygge.doll.root.visible; ut.dorLukket = !Drom.dor.aapen;
          for (const m of Drom.minner.slice(1)) { P.x = m.x; P.z = m.z + 1.1; findInteract().fn(); await vent(60); closePanel(); }
          ut.dorAapen = Drom.dor.aapen; P.x = Drom.dor.x; P.z = Drom.dor.z + .6; const d = findInteract(); ut.dorPrompt = d && d.t; d.fn(); await vent(80);
          ut.valg = document.querySelectorAll('[data-sv]').length; Samtale.velg(1); await vent(60); Samtale.velg(0); await vent(2600);
          ut.vaaken = !G.drom && G.depth === 2 && G.state === 'play' && document.getElementById('toast').textContent.includes(UTGANGER[1].ankomst.slice(0, 10)); ut.husket = G.run.historie.valg[1];
          // skyggen tar deg igjen: du våkner for tidlig med Morbidium i blodet
          startFloor(2, false); rolig(); descend(); await vent(500); closePanel(); const m1 = Drom.minner[0]; P.x = m1.x; P.z = m1.z + 1.1; findInteract().fn(); await vent(60); closePanel();
          const mb = P.morb, s = Drom.skygge; s.x = P.x + .5; s.z = P.z; await vent(2600); ut.tatt = !G.drom && G.depth === 3 && G.run.historie.valg[2] === 'flukt' && P.morb > mb;
          // kapittel 5 etter skogen: det røde rommet, og skyggen snur seg når minnene er funnet
          startFloor(5, false); rolig(); descend(); await vent(500); closePanel(); ut.kap5 = G.drom && G.drom.kap === 5 && G.F.rooms.every(r => r.gulv === 'sikksakk' && r.vegg === 'forheng');
          for (const m of Drom.minner) { P.x = m.x; P.z = m.z + 1.1; findInteract().fn(); await vent(60); closePanel(); }
          ut.snudd = !!Drom.skygge.snudd; Drom.hopp('tilgivelse'); await vent(300); ut.dypet = G.depth === 6 && !G.drom;
          G.run.historie.valg = { 1: 'sannheten', 2: 'gjentakelse', 3: 'gjentakelse', 4: 'sannheten', 5: 'sannheten' }; ut.slutt = Drom.slutt();
          G.run.historie.valg = { 1: 'tilgivelse', 2: 'tilgivelse', 3: 'flukt', 4: 'flukt', 5: 'flukt' }; ut.slutt2 = Drom.slutt();
          G.run.historie.sett = 5; ut.mappe = Drom.mappe(true);
          return ut; }""")
        sjekk('utgangen fører inn i en drøm uten fiender, med tre minner, en skygge som våkner og en dør som åpner seg', dr['drom'] and dr['fiender'] == 0 and (dr['prompt'] or '').startswith('Husk') and dr['panel'] and dr['skygge'] and dr['dorLukket'] and dr['dorAapen'] and dr['dorPrompt'] == 'Gå mot døra', dr)
        sjekk('valget ved døra huskes, og du våkner i neste etasje', dr['valg'] >= 3 and dr['vaaken'] and dr['husket'] == 'sannheten', dr)
        sjekk('skyggen kan ta deg igjen, og da våkner du for tidlig med Morbidium i blodet', dr['tatt'], dr)
        sjekk('kapittel 5 er det røde rommet, og skyggen snur seg', dr['kap5'] and dr['snudd'] and dr['dypet'], dr)
        sjekk('slutten følger valgene (kapittel 5 teller dobbelt), og pasientmappa får historien', dr['slutt'] == 'sannheten' and dr['slutt2'] == 'fornektelse' and dr['mappe'] and 'Fra ' in dr['mappe']['tekst'] and dr['mappe']['tekst'].endswith('.'), dr)
        ep = await pg.evaluate("""async () => { const vent = t => new Promise(r => setTimeout(r, t)); showWin(); await vent(1500); const tekst = (document.querySelector('.samtale .stekst') || {}).innerText || ''; const knapp = document.getElementById('epOk'); if (knapp) knapp.click(); await vent(500); return { tekst: tekst.slice(0, 60), brev: !!document.querySelector('.brev') }; }""")
        sjekk('ved utskrivningen kommer slutten på historien før brevet', len(ep['tekst']) > 20 and ep['brev'], ep)
        await pg.screenshot(path='/tmp/e_13drom.png')
        sjekk('ingen konsollfeil (drømmer)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 27) Parken og Nattskogen: gartnere, kråker, Huldra, Vedkubbemannen, Nøkken og kålhoder slåss, med hver sine særtrekk
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg)
        uf = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), ut = { sett: {} };
          for (const [d, typer] of [[1, ['gartner', 'kraake', 'kaalhode']], [5, ['huldra', 'vedkubbe', 'nokken']]]) {
            startFloor(d, false); rolig(); P.hp = P.maxHp = 9999; const r = G.F.rooms.find(r => r.role === 'combat') || G.F.rooms[0]; P.x = r.x + r.w / 2; P.z = r.z + r.h / 2;
            const fl = typer.map((t, i) => { const a = i / typer.length * Math.PI * 2, s = freeSpot(P.x + Math.sin(a) * 3.5, P.z + Math.cos(a) * 3.5, 3), e = spawnEnemy(t, s.x, s.z, false, d); e.t = 0; return e; });
            for (let k = 0; k < 44; k++) { await vent(250); P.hp = 9999; for (const e of fl) { const S = ut.sett[e.type] || (ut.sett[e.type] = {}); S[e.state] = 1; if (e.lokker > 0) S.lokker = 1; if (e.dukket) S.nede = 1; if (e.dukket === false) S.oppe = 1; } }
            ut['levende' + d] = fl.filter(e => e.alive).length;
            if (d === 5) { for (const e of fl) if (e.type === 'vedkubbe') hurt(e, 99999, { from: 'player' }); for (const e of fl) if (e.type === 'nokken') { e.cd = 99; e.stille = 99; } await vent(300); const h = fl.find(e => e.type === 'huldra'), sp = freeSpot(P.x + 4, P.z, 3); h.x = sp.x; h.z = sp.z; h.stille = 99; h.cd = 99; h.state = 'chase'; const x0 = Math.hypot(P.x - h.x, P.z - h.z); h.lokker = 1.5; await vent(700); ut.dratt = x0 > 1.5 && Math.hypot(P.x - h.x, P.z - h.z) < x0 - .3; h.stille = 0; for (const e of fl) if (e.type === 'nokken') { e.cd = 0; e.stille = 0; } const n = fl.find(e => e.type === 'nokken'); n.dukket = true; const h0 = n.hp; hurt(n, 30, { from: 'player' }); ut.nokkenUrort = n.hp === h0; n.dukket = false; hurt(n, 30, { from: 'player' }); ut.nokkenTruffet = n.hp < h0; }
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

        # 28) Effekter og shadere: sjokkbølger, zoom, negativ og lyn i etterbehandlingen, glød fra ting, lynet, teslaspolen, regnringer og drømmesløret
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg)
        ef = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), spill = async (t, maks = 20000) => { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < t && performance.now() - t0 < maks) await vent(50); }, u = R.post.uniforms, ut = {};
          rolig(); P.hp = P.maxHp = 9999;
          // etterbehandlingen: alt slår inn neste bilde og dør ut av seg selv
          R.sjokk(P.x, P.z, 1.2); R.zoomStot(P.x, P.z, .8); R.negativ(.1); R.fx.lyn = 1; await vent(120);
          ut.paa = u.uSjokk.value[0].w > .1 && u.uZoom.value.z > .1 && u.uNeg.value > .5 && u.uLyn.value > .1;
          await vent(1800); ut.av = u.uSjokk.value[0].w === 0 && u.uZoom.value.z === 0 && u.uNeg.value === 0 && u.uLyn.value === 0 && R.sjokkL.length === 0;
          // uten forvrengning og uten glimt blir de borte
          R.distortOn = false; R.flashOn = false; R.sjokk(P.x, P.z, 1); R.zoomStot(P.x, P.z, 1); R.negativ(); R.fx.lyn = 1; await vent(120);
          ut.skaansom = u.uSjokk.value[0].w === 0 && u.uZoom.value.z === 0 && u.uNeg.value === 0 && u.uLyn.value === 0; R.distortOn = true; R.flashOn = true; await vent(900);
          // glød: alle typene lages, og tingene med ild, damp eller lys får sine når etasjen bygges
          ut.typer = Object.keys(GLOD_TYPER).filter(t => { const E = Glod.lag(P.x, .3, P.z, t, { liv: 1 }); return E && E.pts.parent; });
          const sett = new Set(); let kilder = 0, dekket = 0;
          for (let d = 1; d <= 6; d++) { startFloor(d, false); await vent(80); for (const E of Glod.liste) sett.add(E.type); for (const o of G.props) if (['baal', 'vedovn', 'kjele', 'komfyr', 'gryte', 'candles', 'kjempeplante', 'lyktestolpe'].includes(o.kind)) { kilder++; if (Glod.liste.some(E => E.eier === o)) dekket++; } ut['glod' + d] = Glod.liste.every(E => !E.eier || G.props.includes(E.eier) || G.puddles.includes(E.eier)); }
          ut.sett = [...sett]; ut.kilder = kilder; ut.dekket = dekket;
          const p = addPuddle(P.x, P.z, 'morb', 1, 3); ut.morbPytt = !!(p && p.glod && p.glod.pts); await spill(3.6); await vent(300); ut.morbBorte = !Glod.liste.includes(p.glod);
          R.safe = true; ut.enkel = Glod.lag(P.x, 0, P.z, 'gnister') === null && Lyn.slag(0, 0, 0, 1, 0, 1) === null; R.safe = false;
          // lynet: varsel på bakken, så nedslag som treffer fienden der, og deg om du står der
          startFloor(1, false); rolig(); P.hp = P.maxHp = 9999; const r = G.F.rooms.find(r => r.role === 'combat') || G.F.rooms[0]; P.x = r.x + r.w / 2; P.z = r.z + r.h / 2;
          const s1 = freeSpot(P.x + 3, P.z, 3), e = spawnEnemy('pleier', s1.x, s1.z, false, 1); e.hp = e.max = 500; e.stun = 99;
          let lyn = 0; const _sl = Lyn.slag; Lyn.slag = function () { lyn++; return _sl.apply(this, arguments); };
          const hp0 = P.hp; Uvaer.varsel(e.x, e.z); Uvaer.varsel(P.x, P.z); await spill(1.3);
          ut.lyn = lyn >= 2 && e.hp <= 455 && P.hp < hp0 - 5 && G.fxl.some(f => f.max === 20); ut.lynInfo = [lyn, Math.round(e.hp), Math.round(hp0 - P.hp), G.fxl.length];
          // teslaspolen slår mot fienden som står nær
          const spole = { kind: 'spole', x: e.x + 1.5, z: e.z, g: { position: { z: e.z + .2 } }, alive: true, buT: 0 }; G.props.push(spole); const h1 = e.hp; Effekter.spoler(.1); G.props.splice(G.props.indexOf(spole), 1);
          ut.spole = e.hp < h1 && lyn >= 3; Lyn.slag = _sl;
          // regnringer der det regner, og bort igjen
          const v0 = G.F.vaer; G.F.vaer = 'regn'; Vaer.start(G.F); ut.regn = !!(Regnringer.obj && Regnringer.obj.parent); Vaer.stopp(); ut.regnBorte = !Regnringer.obj; G.F.vaer = v0; Vaer.start(G.F);
          // drømmesløret: glir inn i drømmen og ut igjen etterpå
          G.drom = G.drom || null; descend(); for (let i = 0; i < 80 && !G.drom; i++) await vent(100); for (let i = 0; i < 80 && R.fx.drom <= .6; i++) await vent(100); await vent(200); ut.drom = R.fx.drom > .6 && u.uDrom.value > .5; ut.dromInfo = [!!G.drom, G.state, +R.fx.drom.toFixed(2)];
          Drom.hopp(); for (let i = 0; i < 80 && G.drom; i++) await vent(100); for (let i = 0; i < 80 && R.fx.drom >= .2; i++) await vent(100); ut.dromUt = R.fx.drom < .2;
          return ut; }""")
        sjekk('sjokkbølge, zoomslag, negativ og lynblink slår inn i etterbehandlingen og dør ut av seg selv', ef['paa'] and ef['av'], ef)
        sjekk('uten forvrengning og hvite glimt blir sjokkbølger, zoom, negativ og lynblink borte', ef['skaansom'], ef)
        sjekk('alle typene glød (gnister, glør, damp, røyk, sporer, Morbidium, møll og kombo) lages på skjermkortet', len(ef['typer']) == 8, ef['typer'])
        sjekk('bål, ovner, kjeler, gryter, stearinlys, kjempeplanter og lyktestolper gløder og ryker, og gløden følger etasjen', ef['kilder'] > 0 and ef['dekket'] == ef['kilder'] and all(ef['glod%d' % d] for d in range(1, 7)), ef)
        sjekk('Morbidium stiger fra lilla pytter og forsvinner med pytten, og enkel grafikk lager ingen glød eller lyn', ef['morbPytt'] and ef['morbBorte'] and ef['enkel'], ef)
        sjekk('lynet varsler på bakken, slår ned og treffer fienden og pasienten som står der, og svir gulvet', ef['lyn'], ef)
        sjekk('teslaspolen slår en bue mot fienden som står nær', ef['spole'], ef)
        sjekk('regnringer på bakken når det regner, og de forsvinner med regnet', ef['regn'] and ef['regnBorte'], ef)
        sjekk('drømmesløret glir inn i drømmen og ut igjen etterpå', ef['drom'] and ef['dromUt'], ef)
        await pg.screenshot(path='/tmp/e_15fx.png')
        sjekk('ingen konsollfeil (effekter og shadere)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 29) Kombo: treffkjeden med nivåer, flerdrap, overkill, miljødrap, perfekt unnvikelse, tredje slag, kortkjede, sjefdrap og fanfarer
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg, url=URL + '?2d')
        ko = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), spill = async (t, maks = 20000) => { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < t && performance.now() - t0 < maks) await vent(50); }, T = Kombo.tall, ut = {};
          Sound.init(); rolig(); P.hp = P.maxHp = 9999; const r = G.F.rooms.find(r => r.role === 'combat') || G.F.rooms[0]; P.x = r.x + r.w / 2; P.z = r.z + r.h / 2; P.face = 0;
          const lag = (dx, dz, hp = 1e6) => { const s = freeSpot(P.x + dx, P.z + dz, 2), e = spawnEnemy('pleier', s.x, s.z, false, 1); e.hp = e.max = hp; e.stun = 99; e.state = 'chase'; return e; };
          // treffkjeden: 22 treff gir tredje nivå, telleren og den brennende kanten
          const a = lag(2, 0), xp0 = P.xp + P.level * 1000;
          for (let i = 0; i < 22; i++) hurt(a, 1, { from: 'player', x: P.x, z: P.z }); hurt(a, 1, { from: 'player', dot: true });
          const el = document.getElementById('kombo'); await vent(400);
          ut.kjede = Kombo.n === 22 && Kombo.niva === 3 && T.milepael === 3 && el.classList.contains('on') && el.querySelector('b').textContent === '22' && el.querySelector('span').textContent === 'Kirurgisk' && el.classList.contains('het');
          ut.hete = R.fx.hete > 0 && R.post.uniforms.uHete.value > 0; ut.stempel = document.getElementById('kstempel').textContent.startsWith('KIRURGISK');
          // kjeden slutter av seg selv og gir erfaring
          await spill(Kombo.VINDU + .3); ut.slutt = Kombo.n === 0 && T.slutt === 1 && P.xp + P.level * 1000 > xp0 && !el.classList.contains('on');
          // og brister når du blir truffet
          for (let i = 0; i < 12; i++) hurt(a, 1, { from: 'player', x: P.x, z: P.z }); P.invuln = P.iframe = 0; P.roll = 0; hurt(P, 3, { type: 'test' }); ut.brist = Kombo.n === 0 && T.brist === 1;
          // perfekt unnvikelse: truffet midt i rullingen
          P.invuln = 0; P.roll = .3; P.iframe = .3; hurt(P, 3, { type: 'test' }); ut.perfekt = T.perfekt === 1 && G.slow.t > 0; P.roll = 0; P.iframe = 0;
          // flerdrap: fem på et øyeblikk er en massakre, med merknad
          killEntity(a, {}); await spill(.3); const fem = [0, 1, 2, 3, 4].map(i => lag(-2 + i, 2, 20));
          for (const e of fem) hurt(e, 9999, { from: 'player', x: P.x, z: P.z }); await spill(.6);
          ut.massakre = G.run.flerdrapMaks === 5 && T.flerdrap >= 1 && T.overkill >= 1 && !!(G.meta.merk || {}).massakre;
          // miljødrap: strøm, lyn og spolen
          await spill(1.6); const m = lag(2, -1, 5); hurt(m, 50, { from: 'env', type: 'lyn' }); ut.miljo = T.miljo === 1;
          // tredje slag som treffer to
          const b1 = lag(-.35, 1), b2 = lag(.35, 1); P.face = 0; meleeHit({ combo: 2, heavy: false, charge: 0 }); ut.finale = T.finale === 1;
          killEntity(b1, {}); killEntity(b2, {});
          // tre ulike kort på rad
          Kombo.kort(0); Kombo.kort(1); Kombo.kort(2); ut.kort = T.kort === 1 && document.getElementById('kstempel').textContent.startsWith('LEGEKUNST');
          // fanfare for synergi og forvandling, og sjefdrap
          stampBig('SYNERGI', 'Test'); stampBig('FORVANDLING', 'Test'); ut.fanfare = T.fanfare === 2;
          const B = spawnBoss(1, P.x + 3, P.z); G.boss = G.boss || B; hurt(G.boss, 1e9, { from: 'player', x: P.x, z: P.z }); ut.sjef = T.sjef === 1;
          // lydene og stemmen lages uten feil
          let lydfeil = ''; try { for (const k of ['kombo1', 'kombo2', 'kombo3', 'kombo4', 'kombo5', 'dobbel', 'trippel', 'firling', 'massakre', 'overkill', 'miljo', 'perfekt', 'finale', 'kortkombo', 'synergi', 'forvandling', 'sjefdrap', 'trombone', 'kasse', 'applaus', 'lynslag', 'torden', 'gnistre']) { if (!Sound.lib[k]) lydfeil += k + ' mangler '; else Sound.play(k, .01); } for (const o of ['massakre', 'Klinisk sinnssyk', 'behandlet', 'xyz']) Sound.stemme(o, { v: .01 }); } catch (e) { lydfeil += e.message; }
          ut.lyd = lydfeil || 'ok';
          // bryteren i innstillingene, og kjeden på dødskortet
          G.meta.settings.kombo = false; ut.av = !Kombo.lyd(); G.meta.settings.kombo = true;
          ut.stats = runStats().includes('Lengste kjede') && runStats().includes('Flest på en gang');
          return ut; }""")
        sjekk('treffkjeden teller, får navn ved 5, 10 og 20 treff og vises til høyre, men blødning og gift teller ikke', ko['kjede'] and ko['stempel'], ko)
        sjekk('lange kjeder får skjermkanten til å brenne', ko['hete'], ko)
        sjekk('kjeden slutter av seg selv og gir erfaring, og brister når du blir truffet', ko['slutt'] and ko['brist'], ko)
        sjekk('perfekt unnvikelse gir tidsfall', ko['perfekt'], ko)
        sjekk('fem drept på et øyeblikk er en massakre, med overkill og merknaden Massakre', ko['massakre'], ko)
        sjekk('miljødrap, tredje slag som treffer to, og tre ulike kort på rad', ko['miljo'] and ko['finale'] and ko['kort'], ko)
        sjekk('fanfare for synergi og forvandling, og sjefdrap med lyn og applaus', ko['fanfare'] and ko['sjef'], ko)
        sjekk('alle kombolydene og kunngjørerstemmen lages uten feil', ko['lyd'] == 'ok', ko['lyd'])
        sjekk('kunngjøreren kan slås av, og lengste kjede og flest på en gang står på dødskortet', ko['av'] and ko['stats'], ko)
        await pg.wait_for_timeout(300)
        await pg.screenshot(path='/tmp/e_16kombo.png')
        sjekk('ingen konsollfeil (kombo)', not pg.errs, pg.errs[:6])
        await pg.close()

        await b.close()
    print('\n' + ('Alt gikk bra.' if not feil else 'Feilet: ' + ', '.join(feil)))
    sys.exit(1 if feil else 0)

asyncio.run(main())
