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
        # stå ved liket fra en side der det er det nærmeste som kan undersøkes (på kirkegården kan en gravstein stå nærmere)
        pr = await pg.evaluate("""async () => { const C = MORBIDIUM.corpses[0], P = MORBIDIUM.player; rolig(); let pr = '';
          for (const [dx, dz] of [[0, 1.6], [0, .9], [.9, 0], [-.9, 0], [0, -.9]]) { P.x = C.x + dx; P.z = C.z + dz; R.snapCamera(C.x, C.z); await new Promise(r => setTimeout(r, 700)); pr = document.getElementById('prompt').textContent; if (pr.includes('Undersøk liket')) break; }
          return pr; }""")
        await pg.screenshot(path='/tmp/e_19lik.png')
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
        sjekk('pasienthåndboka har ti kapitler med fiendeindeks, og alle sidene får plass', nkap == 10 and len(kap) == 18 and all(kap), kap)
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
        # det nye stykket begynner på neste taktstrek (06_musikk.js), og kamplaget på neste slag
        k = await pg.evaluate("""async () => { const vent = t => new Promise(r => setTimeout(r, t)); for (let i = 0; i < 100 && !(Musikk.navn === 'park' && Musikk.niva === 1 && Musikk.steg > 3); i++) await vent(100);
          return { navn: Musikk.navn, niva: Musikk.niva, steg: Musikk.steg }; }""")
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
        # animasjonen går i spilltid, og testnettleseren går langt under sanntid, så vi venter på at den blir ferdig (høyst 12 sekunder)
        etter = await pg.evaluate("""async () => { const G = MORBIDIUM, igjen = () => G.props.filter(o => o.room === window.__rom && o.byggS).length;
          for (let i = 0; i < 120 && igjen() > 0; i++) await new Promise(r => setTimeout(r, 100));
          return { igjen: igjen(), feil: G.props.filter(o => o.room === window.__rom && o.g.scale.y < .5 && !o.byggS && o.p.k !== 'drain').length }; }""")
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
          R.fx.blod = 0; P.hp = P.maxHp; P.iframe = P.invuln = 0; P.deny = null; hurt(P, 2, { type: 'pleier', x: P.x - 1, z: P.z }); a.skjerm = R.fx.blod > 0 || Vaatt.draper.some(d => d.blod);
          const gulv = n(); Blod.sett(false); a.av = R.fx.blod === 0 && !Blod.on && !Vaatt.draper.some(d => d.blod); a.ryddet = { vegger: Blod.vegger.length, drypp: Blod.drypper.length, biter: Blod.bitene.length, gulvIgjen: n() === gulv }; Blod.sett(true); P.hp = P.maxHp;
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
          startFloor(1, false); rolig(); Hendelse.fjern(); let h = null; const nyttFro = k => { if (k) G.run.seed = (G.run.seed + 104729) >>> 0; }; // etasjen lages av frøet, så et nytt forsøk trenger et nytt frø
          for (let k = 0; k < 6 && !h; k++) { nyttFro(k); startFloor(1, false); rolig(); Hendelse.fjern(); h = Hendelse.tving('graven'); }
          G.run.sjefSvekk = {}; Hendelse.start(h); await vent(50); Samtale.velg(2); closePanel(); const B = spawnBoss(1, P.x + 4, P.z); ut.sjef = B.hp / B.max;
          h = null; for (const d of [3, 4, 6, 2, 4, 6]) { if (h) break; startFloor(d, false); rolig(); Hendelse.fjern(); h = Hendelse.tving('hjemmebrent'); } if (h) { Hendelse.start(h); await vent(50); Samtale.velg(0); closePanel(); ut.sterk = P.kamferT > 20; await vent(3000); ut.spy = G.puddles.filter(p => p.kind === 'vomit').length; }
          startFloor(2, false); rolig(); Hendelse.fjern(); h = null; for (let k = 0; k < 6 && !h; k++) { nyttFro(k); startFloor(2, false); rolig(); Hendelse.fjern(); h = Hendelse.tving('tannfeen'); }
          if (h) { P.teeth = 20; const m0 = P.maxHp; Hendelse.start(h); await vent(50); Samtale.velg(0); closePanel(); ut.hjerte = P.maxHp - m0; ut.tenner = P.teeth; }
          startFloor(2, false); rolig(); Hendelse.fjern(); h = null; for (let k = 0; k < 6 && !h; k++) { nyttFro(k); startFloor(2, false); rolig(); Hendelse.fjern(); h = Hendelse.tving('dans'); }
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
        ep = await pg.evaluate("""async () => { const vent = t => new Promise(r => setTimeout(r, t)); showWin(); for (let i = 0; i < 40 && !document.getElementById('sisteOk'); i++) await vent(100); const siste = document.getElementById('sisteOk'); if (siste) siste.click(); await vent(400); const tekst = (document.querySelector('.samtale .stekst') || {}).innerText || ''; const knapp = document.getElementById('epOk'); if (knapp) knapp.click(); await vent(500); return { siste: !!siste, tekst: tekst.slice(0, 60), brev: !!document.querySelector('.brev') }; }""")
        sjekk('ved utskrivningen kommer siste side og slutten på historien før brevet', ep['siste'] and len(ep['tekst']) > 20 and ep['brev'], ep)
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

        # 28) Effekter og shadere: sjokkbølger, zoom, negativ og lyn i etterbehandlingen, glød fra ting, lynet, teslaspolen, regnringer og drømmesløret
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg)
        ef = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), spill = async (t, maks = 20000) => { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < t && performance.now() - t0 < maks) await vent(50); }, u = R.post.uniforms, ut = {};
          rolig(); P.hp = P.maxHp = 9999;
          // etterbehandlingen: alt slår inn neste bilde og dør ut av seg selv
          R.sjokk(P.x, P.z, 1.2); R.zoomStot(P.x, P.z, .8); R.negativ(.1); R.fx.lyn = 1; await vent(120);
          ut.paa = u.uSjokk.value[0].w > .1 && u.uZoom.value.z > .1 && u.uNeg.value > .5 && u.uLyn.value > .1;
          const avNaa = () => u.uSjokk.value[0].w === 0 && u.uZoom.value.z === 0 && u.uNeg.value === 0 && u.uLyn.value === 0 && R.sjokkL.length === 0, ge = G.time; for (let i = 0; i < 150 && !avNaa() && G.time - ge < 4; i++) await vent(100); ut.av = avNaa();
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

        # 30) Dybde: lykteskygger, kontaktskygger, varmeflimmer, speiling i vannet, lysende tåke, takstøv og kameradykk
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg)
        dy = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), spill = async (t, maks = 20000) => { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < t && performance.now() - t0 < maks) await vent(50); }, u = R.post.uniforms, ut = {};
          startFloor(2, false); rolig(); P.hp = P.maxHp = 9999; const r = G.F.rooms.find(r => r.role === 'combat' && !r.ute && r.w >= 8) || G.F.rooms[0]; P.x = r.x + r.w / 2; P.z = r.z + r.h / 2; R.snapCamera(P.x, P.z);
          // kontaktskyggene males med etasjen og byttes ut ved neste
          const ao1 = Dybde.ao; ut.ao = !!(ao1 && ao1.m.parent === R.level);
          // lykteskygger: fiendene nær lykta kaster skygge bort fra pasienten
          const fl = [[2, 0], [-1.5, 1.2], [0, -2]].map(([dx, dz]) => { const s = freeSpot(P.x + dx, P.z + dz, 2), e = spawnEnemy('pleier', s.x, s.z, false, 2); e.stun = 99; e.hp = e.max = 1e6; e.state = 'chase'; return e; });
          await vent(900); const retning = fl.every(e => { const m = Dybde.skygger.get(e); if (!m) return false; const d = Math.hypot(e.x - P.x, e.z - P.z), ux = (e.x - P.x) / d, uz = (e.z - P.z) / d, a = Math.atan2(-ux, -uz); return Math.abs(Math.atan2(Math.sin(m.rotation.z - a), Math.cos(m.rotation.z - a))) < .05 && m.material.opacity > .05; });
          ut.skygger = retning; for (const e of fl) killEntity(e, {}); await vent(300); ut.skyggerBorte = fl.every(e => !Dybde.skygger.has(e));
          R.lightsOn = false; const s2 = freeSpot(P.x + 1.5, P.z, 2), e2 = spawnEnemy('pleier', s2.x, s2.z, false, 2); e2.stun = 99; e2.state = 'chase'; await vent(400); ut.utenLys = Dybde.skygger.size === 0; R.lightsOn = true; killEntity(e2, {});
          // varmeflimmer over et bål, bare med forvrengning på
          const baal = { kind: 'baal', x: P.x + 2, z: P.z - 1, alive: true, g: { position: { z: P.z - .8 } } }; G.props.push(baal); await vent(250);
          ut.varme = (R.varmeL || []).some(h => Math.abs(h.x - baal.x) < .01) && u.uVarme.value.some(v => v.w > 0);
          R.distortOn = false; await vent(250); ut.varmeAv = u.uVarme.value.every(v => v.w === 0); R.distortOn = true; G.props.splice(G.props.indexOf(baal), 1);
          // vannet speiler lykta, og tåka lyser opp rundt lampene i 3D
          addPuddle(P.x + .8, P.z, 'wet', 1.2, 60); await vent(500); ut.speil = R.water.u.uLysF.value.some(v => v.x + v.y + v.z > 0);
          ut.taake = !D3.on || !D3.q.taake || (!!D3.taakeLys && D3.taakeLys.f.value.some(v => v.x + v.y + v.z > 0));
          // takstøv inne når det smeller, og det lander og blir borte
          Dybde.stovT = 0; R.shake(.8); ut.stov = Dybde.stov.length > 0; await spill(2.6); ut.stovBorte = Dybde.stov.length === 0;
          // kameradykk når sjefen kommer, og ikke uten skjermristing
          spawnBoss(G.depth, P.x + 3, P.z - 2); await vent(900); ut.dykk = R.camera.zoom > 1.04 && R.kam.holdT > 0;
          if (G.boss) killEntity(G.boss, {}); R.kam.hold = R.kam.kick = R.kam.holdT = 0; await vent(900); R.shakeOn = false; R.kamZoom(.2, 2); await vent(500); ut.dykkAv = Math.abs(R.camera.zoom - 1) < .01; R.shakeOn = true; R.kam.hold = R.kam.holdT = 0;
          // enkel grafikk: ingen kontaktskygger eller lykteskygger
          R.safe = true; startFloor(1, false); await vent(300); ut.enkel = !Dybde.ao && Dybde.skygger.size === 0; R.safe = false; startFloor(2, false); await vent(300); ut.aoIgjen = !!Dybde.ao && Dybde.ao !== ao1 && ao1.m.parent !== R.level && Dybde.ao.m.parent === R.level;
          return ut; }""")
        sjekk('kontaktskyggene males med etasjen, og fiendene nær lykta kaster skygge bort fra pasienten', dy['ao'] and dy['skygger'] and dy['skyggerBorte'], dy)
        sjekk('uten lys og skygge blir lykteskyggene borte, og enkel grafikk lager ingen skygger', dy['utenLys'] and dy['enkel'] and dy['aoIgjen'], dy)
        sjekk('varmeflimmer over bålet, og ikke uten forvrengning', dy['varme'] and dy['varmeAv'], dy)
        sjekk('vannet speiler lykta, og tåka lyser opp rundt lampene', dy['speil'] and dy['taake'], dy)
        sjekk('takstøv drysser ned når det smeller, og blir borte når det har landet', dy['stov'] and dy['stovBorte'], dy)
        sjekk('kameraet dykker inn når sjefen kommer, men ikke uten skjermristing', dy['dykk'] and dy['dykkAv'], dy)
        await pg.screenshot(path='/tmp/e_17dybde.png')
        sjekk('ingen konsollfeil (dybde)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 31) Historien: journalsidene før drømmene, forstanderen i Dypet, sjefenes nye replikker, personlige linjer, siste side og brevet
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg, 'eget')
        hi = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), ut = {};
          const tittel = () => (document.querySelector('#panel:not(.hidden) .samtale .stittel') || document.querySelector('.samtale .stittel') || {}).textContent || '', tekst = () => (document.querySelector('.samtale .stekst') || {}).innerText || '';
          const venteTittel = async (s, maks = 40) => { for (let i = 0; i < maks && !tittel().startsWith(s); i++) await vent(100); return tittel(); };
          // side 1 før første drøm: ingen sjef nevnt når ingen er behandlet, og «Les videre» går inn i drømmen.
          // Innleggelsen tilbyr tre tilfeldige oppvåkninger, så testen setter Eget rom (etasje 1), ellers følger kapitlene en annen startetasje.
          G.run.awk = 'eget'; startFloor(1, false); rolig(); G.run.behandlet = []; descend(); ut.side1 = await venteTittel('Journalen, side 1'); ut.tekst1 = tekst();
          ut.knapp = ((document.querySelector('[data-sv]') || {}).innerText || '').split('\\n')[0]; Samtale.velg(0); ut.intro1 = await venteTittel('Kapittel 1');
          // side 2 etter en behandlet sjef: gravskriften, sannheten om huset og forrige valg. Escape går til innledningen.
          closePanel(); Drom.hopp('tilgivelse'); await vent(400); rolig(); G.run.behandlet = [2]; const B2 = sjefFor(2); descend(); ut.side2 = await venteTittel('Journalen, side 2'); ut.tekst2 = tekst();
          ut.epitaf = ut.tekst2.startsWith(SJEF_EPITAF[B2.type]); ut.valgMerk = ut.tekst2.includes('tilgivelse') && ut.tekst2.includes('1887');
          closePanel(); ut.etterEsc = await venteTittel('Kapittel 2', 20); closePanel(); Drom.hopp('sannheten'); await vent(400);
          // kapitlene følger startetasjen, så skylda alltid kommer før sannheten
          const awk = G.run.awk; G.run.awk = 'vaskesjakt'; ut.vask = [3, 4, 5].map(f => Historie.kapittelFor(G.run.historie, f)); G.run.awk = 'eget'; ut.eget = [1, 2, 3, 4, 5].map(f => Historie.kapittelFor(G.run.historie, f)); G.run.awk = awk;
          // alle sidene blir hele setninger, og personen passer til alderen
          const run = G.run, gammel = run.historie, fro = run.seed, alder = run.patient.age, feil = []; let n = 0;
          for (let s = 1; s <= 160; s++) { run.historie = null; run.seed = s * 7919; run.patient.age = alder; const H = Drom.historie(); H.sett = s % 6; H.valg = { 1: 'tilgivelse', 2: 'flukt', 3: 'gjentakelse', 4: 'sannheten' }; run.behandlet = [1, 2, 3, 4, 5];
            for (const kap of [1, 2, 3, 4, 5]) for (const fra of [1, 2, 3, 4, 5]) { const s0 = Historie.side({ kap, fra, H }); n++; if (!s0 || /undefined|NaN|\\$\\{|\\[object|null/.test(s0.tekst + s0.tittel)) feil.push(kap + ': ' + (s0 && s0.tekst.slice(0, 80))); }
            for (const a of [19, 30, 50, 70]) { run.patient.age = a; run.historie = null; const H2 = Drom.historie(); if ((a > 45 && H2.rolle === 'bestefar') || (a > 58 && ['mor', 'far'].includes(H2.rolle)) || (a < 22 && H2.rolle === 'barn')) feil.push('alder ' + a + ' ' + H2.rolle); } }
          run.historie = gammel; run.seed = fro; run.patient.age = alder; run.behandlet = [2]; ut.sider = n; ut.feil = feil.slice(0, 4); ut.antallFeil = feil.length;
          // personlige linjer fra drømmene i høyttaleren og koret, og Olsen følger etasjen
          run.historie.sett = 4; startFloor(3, false); await vent(300); const S = Drom.ord(run.historie), navn = run.patient.name;
          ut.pa = PA[3].filter(l => l.includes(navn)).length; ut.koret = LINES.koret.some(l => l.includes(S.N)); ut.olsen3 = NPC_LINES.vaktmester.some(l => l.includes('Kjelleren var ikke der'));
          startFloor(4, false); await vent(300); ut.paBorte = PA[3].every(l => !l.includes(navn)); ut.olsen4 = NPC_LINES.vaktmester.some(l => l.includes('fjerde nøkkelen')) && !NPC_LINES.vaktmester.some(l => l.includes('Kjelleren var ikke der'));
          // forstanderen i Dypet: fire valg, du kan lese over skulderen, og pennen gjør Journalen svakere
          startFloor(6, false); rolig(); await vent(300); ut.naturlig = Hendelse.aktive.some(h => h.id === 'forstanderen');
          const h = Hendelse.aktive.find(h => h.id === 'forstanderen') || Hendelse.tving('forstanderen'); P.x = h.x; P.z = h.z + 1.2; R.snapCamera(P.x, P.z); await vent(300);
          const it = findInteract(); ut.prompt = it && it.t; it.fn(); ut.forstander = await venteTittel('Forstander'); ut.fvalg = document.querySelectorAll('[data-sv]').length;
          Samtale.velg(1); await vent(150); ut.les = tekst().includes('håndskrift'); Samtale.velg(0); await vent(100);
          Samtale.vis(h.H.samtale(h)); await vent(100); Samtale.velg(2); await vent(150); ut.penn = run.pennen === true && Merknad.har('pennen'); Samtale.velg(0); await vent(100);
          // sjefene: en ny tale ved en tredjedel helse, slengord i kampen og siste ord når de dør
          const B = G.boss || spawnBoss(6, P.x + 3, P.z); ut.pennSvak = B.hp <= B.max * .81; B.t = 0; B.state = 'chase'; await vent(100);
          B.hp = B.max * .6; bossOnHurt(B, 1); ut.tale1 = B.mono === (LINES.monolog[B.type] || LINES.monolog[6]);
          B.monoT = 0; B.phase = 'fight'; B.state = 'chase'; B.hp = B.max * .3; bossOnHurt(B, 1); ut.tale2 = B.phasesDone === 2 && B.mono === LINES.monolog2[B.type];
          const bobler = () => [...document.querySelectorAll('#fx .bubble')].map(e => e.textContent);
          ut.tale2boble = bobler().includes(LINES.monolog2[B.type][0]);
          B.state = 'chase'; B.phase = 'fight'; B.cd = 99; B.slengT = .01; for (let i = 0; i < 30 && !bobler().some(t => LINES.boss[B.type].includes(t)); i++) { B.state = 'chase'; B.cd = 99; await vent(100); }
          ut.sleng = bobler().some(t => LINES.boss[B.type].includes(t));
          hurt(B, 1e7, { from: 'player' }); for (let i = 0; i < 10 && !bobler().includes(LINES.bossDod[B.type]); i++) await vent(100); ut.sisteOrd = bobler().includes(LINES.bossDod[B.type]); ut.behandlet = run.behandlet.includes(6);
          await vent(2000);
          // slutten: siste side, Escape går videre til etterordet, og gjentakelse gir et innkallingsbrev signert av pasienten
          if (G.state === 'panel') closePanel(); run.historie.sett = 5; run.historie.valg = { 1: 'gjentakelse', 2: 'gjentakelse', 3: 'sannheten', 4: 'gjentakelse', 5: 'gjentakelse' };
          showWin(); for (let i = 0; i < 40 && !document.getElementById('sisteOk'); i++) await vent(100); ut.siste = tittel() === 'Siste side' && tekst().includes('side én');
          closePanel(); await vent(200); ut.etterord = tittel() === DROM_SLUTT.gjentakelse.navn; const k = document.getElementById('epOk'); if (k) k.click(); await vent(400);
          ut.brev = (document.querySelector('.brev h2') || {}).textContent; ut.sign = (document.querySelector('.bsign') || {}).textContent === navn; ut.stempel = (document.querySelector('.bstempel') || {}).textContent;
          ut.brevTekst = [...document.querySelectorAll('.brev p')].map(e => e.textContent).join(' ');
          return ut; }""")
        sjekk('en journalside før drømmen, uten sjef når ingen er behandlet, og «Les videre» går inn i drømmen', hi['side1'] == 'Journalen, side 1' and 'behandlet' not in hi['tekst1'] and hi['knapp'].endswith('Les videre') and hi['intro1'].startswith('Kapittel 1'), {k: hi[k] for k in ('side1', 'knapp', 'intro1')})
        sjekk('side 2 nevner sjefen som ble behandlet, grunnleggelsen og forrige valg, og Escape går til drømmen', hi['side2'] == 'Journalen, side 2' and hi['epitaf'] and hi['valgMerk'] and hi['etterEsc'].startswith('Kapittel 2'), {k: hi[k] for k in ('side2', 'epitaf', 'valgMerk', 'etterEsc')})
        sjekk('kapitlene følger startetasjen (1 4 5 fra vaskesjakten), og tusenvis av journalsider blir hele setninger', hi['vask'] == [1, 4, 5] and hi['eget'] == [1, 2, 3, 4, 5] and hi['sider'] >= 4000 and hi['antallFeil'] == 0, {k: hi[k] for k in ('vask', 'eget', 'sider', 'feil')})
        sjekk('høyttaleren og koret får linjer fra drømmene, og Olsen og personalet følger etasjen', hi['pa'] >= 2 and hi['koret'] and hi['olsen3'] and hi['paBorte'] and hi['olsen4'], {k: hi[k] for k in ('pa', 'koret', 'olsen3', 'paBorte', 'olsen4')})
        sjekk('forstanderen sitter i Dypet med fire valg, du kan lese over skulderen, og pennen svekker Journalen', hi['prompt'] and hi['forstander'].startswith('Forstander') and hi['fvalg'] == 4 and hi['les'] and hi['penn'] and hi['pennSvak'], {k: hi[k] for k in ('naturlig', 'prompt', 'forstander', 'fvalg', 'les', 'penn', 'pennSvak')})
        sjekk('sjefen holder en ny tale ved en tredjedel helse, slenger ord i kampen og får siste ord', hi['tale1'] and hi['tale2'] and hi['tale2boble'] and hi['sleng'] and hi['sisteOrd'] and hi['behandlet'], {k: hi[k] for k in ('tale1', 'tale2', 'tale2boble', 'sleng', 'sisteOrd', 'behandlet')})
        sjekk('siste side før etterordet, Escape går videre, og gjentakelse gir innkallingsbrev signert av pasienten', hi['siste'] and hi['etterord'] and hi['brev'] == 'Innkallingsbrev' and hi['sign'] and hi['stempel'] == 'INNKALT' and 'samme dag' in hi['brevTekst'] and 'forstanderens penn' in hi['brevTekst'], {k: hi[k] for k in ('siste', 'etterord', 'brev', 'sign', 'stempel')})
        hk = await pg.evaluate("""async () => { const vent = t => new Promise(r => setTimeout(r, t)); document.getElementById('bOk').click(); await vent(500);
          return { kort: (document.querySelector('.dcard .cause') || {}).textContent, stempel: (document.querySelector('.dcard .stamp') || {}).textContent, lore: LORE[LORE.length - 1].t, oye: ['krok', 'rust', 'arkivar', 'klumpen', 'hekk', 'hjort', 'journalen'].every(t => OYE_SER[t] && LINES.monolog2[t] && LINES.bossDod[t]), merk: ['klumpen', 'hekk', 'hjort', 'pennen'].every(k => MERKNADER[k]) }; }""")
        sjekk('dødskortet følger slutten, og fragmentene, øyet, talene og merknadene dekker alle sjefene', hk['kort'].startswith('Pasienten er innkalt') and hk['stempel'] == 'INNKALT' and hk['lore'] == 'Hele historien' and hk['oye'] and hk['merk'], hk)
        await pg.screenshot(path='/tmp/e_18historie.png')
        sjekk('ingen konsollfeil (historie)', not pg.errs, pg.errs[:6])
        await pg.close()
        # Avdeling Null og Venterommet: den lille legen, instrumentskrinet med kjettingene, og forstanderen som løses fra krokene
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg, 'eget')
        ny = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), ut = {};
          const spill = async (t, maks = 30000) => { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < t && performance.now() - t0 < maks) await vent(50); };
          const tekst = () => (document.querySelector('#panel:not(.hidden) .samtale .stekst') || {}).innerText || '';
          let h = null; for (const d of [4, 3, 2, 6, 4, 3]) { startFloor(d, false); rolig(); Hendelse.fjern(); h = Hendelse.tving('venterom'); if (h) break; }
          ut.venterom = !!h;
          if (h) { const s = freeSpot(h.x, h.z + 1.3, 2); P.x = s.x; P.z = s.z; R.snapCamera(P.x, P.z); await vent(300); const it = findInteract(); ut.vPrompt = it && it.t; it.fn(); await vent(150);
            ut.bak = ((document.querySelector('.samtale .baklengs') || {}).textContent || '').includes('neffaK'); ut.vValg = document.querySelectorAll('[data-sv]').length;
            Samtale.velg(2); await vent(150); ut.drommer = tekst().includes('Den som ligger under'); closePanel(); await vent(100); ut.vBorte = !!h.ferdig; }
          // instrumentskrinet: kjettingene kommer når panelet er lukket, treffer pasienten og etterlater en gave
          h = null; for (const d of [3, 4, 2, 6]) { startFloor(d, false); rolig(); Hendelse.fjern(); h = Hendelse.tving('skrin'); if (h) break; }
          ut.skrin = !!h;
          if (h) { P.hp = P.maxHp = 300; const s = freeSpot(h.x, h.z + 1.2, 2); P.x = s.x; P.z = s.z; R.snapCamera(P.x, P.z); await vent(300); findInteract().fn(); await vent(150);
            Samtale.velg(0); await vent(150); const hp0 = P.hp, n0 = G.run.items.length; ut.forLukk = Kjeder.liste.length === 0; closePanel();
            for (let i = 0; i < 200 && !Kjeder.liste.some(K => K.truffet); i++) await vent(50); ut.kjeder = Kjeder.liste.length;
            await spill(2.2); ut.skade = P.hp < hp0 && P.lastCause === 'kroker'; ut.gave = G.run.items.length > n0; ut.kjederBorte = Kjeder.liste.length === 0; }
          // forstanderen: løs ham fra krokene, og kjettingene henter ham ned
          startFloor(6, false); rolig(); await vent(300); h = Hendelse.aktive.find(x => x.id === 'forstanderen') || Hendelse.tving('forstanderen');
          P.x = h.x; P.z = h.z + 1.2; R.snapCamera(P.x, P.z); await vent(300); findInteract().fn(); await vent(150); Samtale.velg(3); await vent(150); ut.losTekst = tekst().includes('første kroken'); closePanel();
          await spill(2.4); ut.losBorte = !!h.ferdig && G.run.forstanderLos === true && Merknad.har('loslatt') && Kjeder.liste.length === 0;
          const B = spawnBoss(6, P.x + 3, P.z); ut.sterkere = B.max > sjefFor(6).hp * 1.19; killEntity(B, {}); await vent(200);
          ut.sign = Historie.brev().sign; Drom.historie(); G.run.historie.sett = 5; G.run.historie.valg = { 5: 'tilgivelse' }; ut.tomStol = Historie.siste(G.run.historie).tekst.includes('tom stol');
          // en ny etasje rydder bort kjettinger som henger igjen
          Kjeder.rundt({ x: P.x, y: 1, z: P.z }, 3, { hold: 5 }); startFloor(5, false); ut.rydda = Kjeder.liste.length === 0;
          return ut; }""")
        sjekk('Venterommet bak forhenget: den lille legen snakker baklengs, har fire valg og forteller hvem som drømmer', ny['venterom'] and ny['vPrompt'] == 'Gå gjennom forhenget' and ny['bak'] and ny['vValg'] == 4 and ny['drommer'] and ny['vBorte'], ny)
        sjekk('instrumentskrinet: kjettingene kommer først når panelet er lukket, treffer pasienten og etterlater en gave', ny['skrin'] and ny['forLukk'] and ny['kjeder'] >= 3 and ny['skade'] and ny['gave'] and ny['kjederBorte'], ny)
        sjekk('forstanderen kan løses fra krokene: kjettingene henter ham, Journalen blir sterkere, og siste side får en tom stol', ny['losTekst'] and ny['losBorte'] and ny['sterkere'] and ny['sign'] == 'M. Morbeck, tidligere forstander' and ny['tomStol'] and ny['rydda'], ny)
        await pg.screenshot(path='/tmp/e_19avdeling_null.png')
        sjekk('ingen konsollfeil (Avdeling Null og Venterommet)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 32) Lydbanken: de innspilte lydene pakkes ut, kartet oversetter spillets lydnavn, fottrinn, stemningssløyfer, stemmer og innstillingen
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await pg.goto(URL); await pg.wait_for_timeout(2000); await pg.evaluate("() => localStorage.clear()")
        await start_lop(pg)
        ut = await pg.evaluate("""async () => { const vent = t => new Promise(r => setTimeout(r, t)), G = MORBIDIUM, P = G.player, ut = {};
          for (let i = 0; i < 400 && Lydbank.klar + Lydbank.feil < Lydbank.totalt; i++) await vent(100);
          ut.klar = Lydbank.klar; ut.feil = Lydbank.feil; ut.totalt = Lydbank.totalt; ut.meta = Object.keys(LYD_META).length;
          ut.mangler = [...new Set(Object.values(LYD_KART).flatMap(K => K.s.map(s => s[0])).concat(Object.values(FOTGULV).map(f => f[0])).filter(g => !Lydbank.har(g)))];
          // sløyfepunktene ligger inne i lyden, også med stillheten nettleseren legger foran
          ut.sloyfer = Object.keys(LYD_META).filter(k => Array.isArray(LYD_META[k].sloyfe)).every(k => { const b = Lydbank.buf[k], s = LYD_META[k].sloyfe, f = Lydbank.forsink[k] || 0; return b && s[0] < s[1] && f + s[1] <= b.duration + .001; });
          const spilt = [], _s = Lydbank.spill; Lydbank.spill = function (g, o) { spilt.push(g); return _s.call(this, g, o); };
          let kast = null; try { for (const n of Object.keys(LYD_KART)) Sound.play(n, .3, 1); } catch (e) { kast = e.message; } ut.kast = kast; ut.kart = new Set(spilt).size; spilt.length = 0;
          // fottrinn etter gulvet
          for (const e of G.enemies) if (e.alive) killEntity(e, {}); P.hp = P.maxHp = 9999; Lydbank.fx = null; Lydbank.fotD = 0;
          for (let i = 0; i < 10; i++) { P.x += .5; Lydbank.fot(); } P.x -= 5;
          const lov = new Set(['fot_vann'].concat(Object.values(FOTGULV).map(f => f[0]))); ut.fot = spilt.filter(g => g.startsWith('fot_')); ut.fotRiktig = ut.fot.length >= 2 && ut.fot.every(g => lov.has(g)); spilt.length = 0;
          // og riktig lyd for gulvet der pasienten står
          Lydbank.fx = null; Lydbank.fot(); P.x += 1.5; Lydbank.fotD = 1.5; spilt.length = 0; Lydbank.fot(); const gulv = gulvUnder(P.x, P.z); ut.gulv = gulv; ut.fotHer = spilt[0]; ut.fotRiktig = ut.fotRiktig && (spilt[0] === 'fot_vann' || spilt[0] === (FOTGULV[gulv] || ['fot_stein'])[0]); P.x -= 1.5; spilt.length = 0;
          // stemningen i Dypet: havet og dronen, og regnet ute
          startFloor(6, false); for (const e of G.enemies) if (e.alive) killEntity(e, {}); for (let i = 0; i < 6; i++) { Stemning.t = 0; Stemning.tick(.25); await vent(30); }
          ut.dypet = Object.keys(Stemning.lag); ut.drone = !!Sound.drone;
          startFloor(1, false); for (const e of G.enemies) if (e.alive) killEntity(e, {}); Sound.vaer('regn'); for (let i = 0; i < 6; i++) { Stemning.t = 0; Stemning.tick(.25); await vent(30); }
          ut.regn = Object.keys(Stemning.lag).includes('amb_regn') && !Sound.vaerN; Sound.vaer(null);
          // en fiende på vei mot pasienten stønner
          const e = spawnEnemyBareTest('pleier', P.x + 3, P.z); e.state = 'chase'; e.stemT = 0; Lydbank.stemmeT = 0; spilt.length = 0; Lydbank.stemmer(.1); ut.stemme = spilt.includes('stonn');
          // innstillingen: bare synth
          G.meta.settings.opptak = false; applySettings(); spilt.length = 0; Sound.play('door'); Sound.play('hit'); ut.avSpilt = spilt.length; ut.avHar = Lydbank.har('door');
          G.meta.settings.opptak = true; applySettings(); ut.paaIgjen = Lydbank.har('door');
          Lydbank.spill = _s; return ut; }""")
        sjekk('alle de innspilte lydene pakkes ut uten feil', ut['feil'] == 0 and ut['klar'] == ut['totalt'] == ut['meta'] and ut['meta'] > 150, [ut['klar'], ut['feil'], ut['totalt'], ut['meta']])
        sjekk('kartet oversetter alle lydnavnene til opptak som finnes, og sløyfepunktene ligger inne i lydene', not ut['mangler'] and ut['sloyfer'] and ut['kast'] is None and ut['kart'] >= 40, [ut['mangler'], ut['sloyfer'], ut['kast'], ut['kart']])
        sjekk('fottrinn etter gulvet', ut['fotRiktig'], [ut['fot'], ut['gulv'], ut['fotHer']])
        sjekk('stemningssløyfer: havet og dronen i Dypet, regnet ute tar over for støyen', 'amb_hav' in ut['dypet'] and 'amb_drone' in ut['dypet'] and ut['drone'] and ut['regn'], [ut['dypet'], ut['drone'], ut['regn']])
        sjekk('en fiende på vei mot pasienten stønner', ut['stemme'])
        sjekk('«Innspilte lyder» av gir bare synth, og på igjen gir opptakene tilbake', ut['avSpilt'] == 0 and not ut['avHar'] and ut['paaIgjen'], [ut['avSpilt'], ut['avHar'], ut['paaIgjen']])
        sjekk('ingen konsollfeil (lydbanken)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 33) Musikken som iMUSE: bytte på taktstreken med bro, besetning etter rommet, kamplaget på neste slag, innslag i tonearten, roen og drømmen
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await pg.goto(URL); await pg.wait_for_timeout(2000); await pg.evaluate("() => localStorage.clear()")
        await start_lop(pg)
        ut = await pg.evaluate("""async () => { const vent = t => new Promise(r => setTimeout(r, t)), G = MORBIDIUM, P = G.player, ut = {};
          const rolig = () => { for (const e of G.enemies) if (e.alive) killEntity(e, {}); G.combat = null; G.lock = null; for (const b of G.barriers) b.up = false; G.rooms.forEach(s => s.cleared = true); };
          for (let i = 0; i < 400 && Lydbank.klar + Lydbank.feil < Lydbank.totalt; i++) await vent(100);
          // fra etasjen til Dypet: det nye stykket venter på taktstreken, og broen spilles først
          for (let i = 0; i < 60 && Musikk.navn !== stykkeFor(G.depth); i++) await vent(100);
          const n0 = Object.assign({}, Musikk.tall); startFloor(6, false); rolig(); P.hp = P.maxHp = 9999; Musikk.velg(.016);
          const O = Musikk.overgang, per = Musikk.per(); ut.venter = Musikk.navn !== 'e4' && !!O && O.til === 'e4'; ut.paaStrek = !!O && O.b % per === 0;
          for (let i = 0; i < 100 && Musikk.navn !== 'e4'; i++) await vent(100);
          ut.byttet = Musikk.navn === 'e4' && Musikk.tall.bytter > n0.bytter && Musikk.tall.broer > n0.broer;
          // besetningen følger rommet
          const rom = G.F.rooms.find(r => ROM_BESETNING[r.template] && !['combat', 'risk', 'boss'].includes(r.role)) || G.F.rooms.find(r => ROM_BESETNING[r.template]);
          if (rom) { P.x = rom.cx + .5; P.z = rom.cz + .5; ut.forventet = ROM_BESETNING[rom.template]; for (let i = 0; i < 100 && Musikk.bNavn !== ut.forventet; i++) await vent(100); ut.besetning = Musikk.bNavn; }
          // kamplaget kommer på neste slag
          const kr = G.F.rooms.find(r => r.role === 'combat'); G.rooms[G.F.rooms.indexOf(kr)].cleared = false; P.x = kr.cx + .5; P.z = kr.cz + .5; for (let i = 0; i < 60 && !G.combat; i++) await vent(100);
          ut.kamp = !!G.combat; for (let i = 0; i < 40 && Musikk.niva !== 1; i++) await vent(100); ut.niva = Musikk.niva;
          // innslag og stemte plinger
          const i0 = Musikk.tall.innslag; Sound.play('clear'); Sound.play('level'); ut.innslag = Musikk.tall.innslag - i0;
          const A = Musikk.akkord(Musikk.takt()), sk = SKALA[Musikk.S.skala], akkTone = midiHz(Musikk.S.rot + sk[A[0] % 7] + 60 - 12 * Math.floor((Musikk.S.rot + sk[A[0] % 7]) / 12));
          ut.stemAkkord = Math.abs(Musikk.stem(akkTone) - 1) < .001; ut.stemOmfang = [784, 1318, 659, 523, 1000].every(f => { const k = Musikk.stem(f); return k > .7 && k < 1.42; });
          const now = Sound.ctx.currentTime, s1 = Musikk.slag(1), s2 = Musikk.slag(2); ut.slag = s1.t >= now - .01 && s1.t < now + .4 && s2.t >= s1.t;
          // roen: uten kamp og fiender glir musikken over i stemning, og et nytt rom henter den fram igjen
          rolig(); for (const e of G.enemies) e.alive = false; Musikk.roT = 40; for (let i = 0; i < 40; i++) Musikk.velg(.5); ut.ro = +Musikk.glid.toFixed(2); ut.stemningK = +Musikk.stemningK().toFixed(2);
          Musikk.sistRom = -9; for (let i = 0; i < 10; i++) Musikk.velg(.5); ut.tilbake = +Musikk.glid.toFixed(2);
          // drømmen beholder sin musikk (før ble den byttet ut med etasjemusikken etter første bilde)
          startFloor(2, false); rolig(); descend(); const tittel = () => (document.querySelector('.samtale .stittel') || {}).textContent || '';
          for (let i = 0; i < 60 && !tittel().startsWith('Journalen'); i++) await vent(100); Samtale.velg(0); await vent(300);
          for (let i = 0; i < 40 && G.state !== 'play'; i++) { if (G.state === 'panel') closePanel(); await vent(150); }
          ut.drom = !!G.drom; for (let i = 0; i < 80 && Musikk.navn !== 'drom'; i++) await vent(100); await vent(2500); ut.dromMusikk = Musikk.navn; ut.dromBes = Musikk.bNavn; ut.dromNeste = Musikk.neste;
          return ut; }""")
        sjekk('et nytt stykke venter på taktstreken og kommer inn etter broen', ut['venter'] and ut['paaStrek'] and ut['byttet'], [ut['venter'], ut['paaStrek'], ut['byttet']])
        sjekk('besetningen følger rommet', ut.get('besetning') == ut.get('forventet') and ut.get('forventet'), [ut.get('forventet'), ut.get('besetning')])
        sjekk('kamplaget kommer inn på neste slag', ut['kamp'] and ut['niva'] == 1, [ut['kamp'], ut['niva']])
        sjekk('innslag i tonearten, stemte plinger og slaget til stemningslydene', ut['innslag'] == 2 and ut['stemAkkord'] and ut['stemOmfang'] and ut['slag'], [ut['innslag'], ut['stemAkkord'], ut['stemOmfang'], ut['slag']])
        sjekk('musikken glir over i stemning når det er rolig, og kommer tilbake i et nytt rom', ut['ro'] < .5 and ut['stemningK'] > 1.15 and ut['tilbake'] > .9, [ut['ro'], ut['stemningK'], ut['tilbake']])
        sjekk('drømmen beholder drømmemusikken og får vinglass', ut['drom'] and ut['dromMusikk'] in ('drom', 'losje') and ut['dromBes'] == 'drom' and ut['dromNeste'] is None, [ut['drom'], ut['dromMusikk'], ut['dromBes'], ut['dromNeste']])
        sjekk('ingen konsollfeil (iMUSE)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 34) Blod og vann på skjermen: dråper fra siden slaget kom fra, de renner, slår seg sammen, tørker, regn og plask, og innstillingene
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await pg.goto(URL); await pg.wait_for_timeout(2000); await pg.evaluate("() => localStorage.clear()")
        await start_lop(pg)
        ut = await pg.evaluate("""async () => { const vent = t => new Promise(r => setTimeout(r, t)), G = MORBIDIUM, P = G.player, ut = {};
          for (const e of G.enemies) if (e.alive) killEntity(e, {}); P.hp = P.maxHp = 100; P.invuln = 999; Sound.vaerType = null; Vaatt.tom(); await vent(200);
          ut.aktiv = Vaatt.aktiv(); R.fx.blod = 0;
          Blod.treff(P, { x: P.x + 2, z: P.z }, 45); await vent(300);
          const D = Vaatt.draper; ut.n = D.length; ut.blod = D.every(d => d.blod); ut.hoyre = D.filter(d => d.x > Vaatt.W / 2).length / Math.max(1, D.length); ut.gammelt = R.fx.blod;
          ut.u = R.post.uniforms.uVaatt.value; ut.tex = R.post.uniforms.tVaatt.value === Vaatt.tex;
          // de tunge renner: spol fram i fysikken
          const y0 = Math.max(...D.filter(d => d.r > 3 * Vaatt.H / 135).map(d => d.y), 0); for (let i = 0; i < 20; i++) Vaatt.fysikk(.05);
          ut.glir = Vaatt.tall.sklidd > 0 && Vaatt.spor.length > 0; ut.nedover = Vaatt.draper.some(d => d.glir && d.y > y0);
          // to dråper oppå hverandre blir én
          Vaatt.tom(); Vaatt.ny(50, 50, 2, false); Vaatt.ny(51, 50, 2, false); const s0 = Vaatt.tall.slatt; Vaatt.fysikk(.016); ut.slatt = Vaatt.tall.slatt - s0 === 1 && Vaatt.draper.length === 1;
          // noe som dør tett ved, spruter
          Vaatt.tom(); const e = spawnEnemyBareTest('pleier', P.x + 1, P.z); killEntity(e, { from: 'player', x: P.x, z: P.z }); ut.drap = Vaatt.draper.length;
          // alt tørker bort, og da er etterbehandlingen fri
          for (let i = 0; i < 700; i++) Vaatt.fysikk(.05); await vent(200); ut.torr = Vaatt.draper.length === 0 && Vaatt.spor.length === 0 && R.post.uniforms.uVaatt.value === 0;
          // regn ute og plask
          G.F.ute = true; Sound.vaerType = 'regn'; for (let i = 0; i < 60; i++) Vaatt.regn(.05); ut.regn = Vaatt.draper.filter(d => !d.blod).length; Sound.vaerType = null;
          Vaatt.tom(); Sound.play('splash'); ut.plask = Vaatt.draper.length;
          // innstillingene: uten blod ingen blodsprut på glasset, og av betyr tørt
          Vaatt.tom(); G.meta.settings.blod = false; applySettings(); Blod.treff(P, { x: P.x + 2, z: P.z }, 45); ut.utenBlod = Vaatt.draper.length; G.meta.settings.blod = true; applySettings();
          Blod.treff(P, { x: P.x - 2, z: P.z }, 45); await vent(200); G.meta.settings.vaatt = false; applySettings(); await vent(200); ut.av = Vaatt.draper.length === 0 && R.post.uniforms.uVaatt.value === 0;
          Blod.treff(P, { x: P.x - 2, z: P.z }, 45); ut.avGammelt = R.fx.blod > 0; G.meta.settings.vaatt = true; applySettings();
          return ut; }""")
        sjekk('treff gir bloddråper på glasset fra siden slaget kom fra, i stedet for det gamle blodet i kanten', ut['aktiv'] and ut['n'] >= 6 and ut['blod'] and ut['hoyre'] > .6 and ut['gammelt'] == 0 and ut['u'] == 1 and ut['tex'], ut)
        sjekk('de tunge dråpene renner nedover og legger igjen spor, og dråper som møtes, blir én', ut['glir'] and ut['nedover'] and ut['slatt'], [ut['glir'], ut['nedover'], ut['slatt']])
        sjekk('drap tett ved spruter, og alt tørker bort så etterbehandlingen blir fri', ut['drap'] > 0 and ut['torr'], [ut['drap'], ut['torr']])
        sjekk('regn ute og plask gir vann på glasset', ut['regn'] >= 5 and ut['plask'] > 0, [ut['regn'], ut['plask']])
        sjekk('uten «Blod og skrekkeffekter» kommer ikke blodet, og uten «Blod og vann på skjermen» er glasset tørt og det gamle blodet tilbake', ut['utenBlod'] == 0 and ut['av'] and ut['avGammelt'], [ut['utenBlod'], ut['av'], ut['avGammelt']])
        await pg.screenshot(path='/tmp/e_20vaatt.png')
        sjekk('ingen konsollfeil (vått på skjermen)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 35) Testmodus: måleren, tallene per etasje, «Si din mening» og «Testrapport» i pausen, rapporten ved døden og innstillingene
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await pg.goto(URL); await pg.wait_for_timeout(2000); await pg.evaluate("() => localStorage.clear()")
        await start_lop(pg, url=URL + '&testmodus')
        ut = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), ut = {};
          const hud = document.getElementById('testHud'); ut.paa = Testmodus.paa(); ut.hud = !!hud && !hud.classList.contains('hidden');
          for (let i = 0; i < 60 && !(hud.textContent || '').includes('b/s'); i++) await vent(100); ut.hudTekst = hud.textContent.includes('b/s') && hud.textContent.includes('Lyder');
          for (const e of G.enemies) if (e.alive) killEntity(e, {});
          P.hp = P.maxHp = 100; P.invuln = 0; P.iframe = 0; hurt(P, 12, { type: 'pleier', x: P.x + 1, z: P.z }); await vent(300);
          P.hp -= 5; await vent(300); healPlayer(8); await vent(200);
          const T = G.run.test; ut.skade = Object.keys(T.etasjer[0].skade).sort(); ut.skadeOk = T.etasjer[0].skade.pleier > 0 && Math.abs(T.etasjer[0].skade.annet - 5) < .01; ut.hel = T.etasjer[0].hel;
          startFloor(3, false); await vent(300); ut.etasjer = T.etasjer.length; ut.forsteFerdig = !!T.etasjer[0].ferdig && T.etasjer[0].sek > 0;
          return ut; }""")
        sjekk('testmodus med ?testmodus: måleren viser bilder i sekundet og lydene', ut['paa'] and ut['hud'] and ut['hudTekst'], ut)
        sjekk('tallene per etasje: skade etter kilde (også den som ikke går gjennom treff), helse, og ny etasje avslutter den forrige', ut['skadeOk'] and ut['hel'] == 8 and ut['etasjer'] == 2 and ut['forsteFerdig'], ut)
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(500)
        pause = await pg.evaluate("() => !!document.getElementById('pMening') && !!document.getElementById('pRapport')")
        await pg.click('#pMening'); await pg.wait_for_timeout(300)
        await pg.click('[data-m="slag"][data-i="2"]'); await pg.click('[data-m="musikk"][data-i="1"]'); await pg.click('[data-m="musikk"][data-i="1"]')
        await pg.click('[data-tf="spill"]'); await pg.wait_for_timeout(200); await pg.click('[data-m="vansk"][data-i="0"]')
        await pg.click('[data-tf="rapport"]'); await pg.wait_for_timeout(200); await pg.fill('#mFri', 'Kråkene er for mange.')
        r = await pg.evaluate("""() => { const t = document.getElementById('trTekst').value, T = MORBIDIUM.run.test;
          return { mening: T.mening, fri: T.fritekst, tekst: t.startsWith('MORBIDIUM TESTRAPPORT') && t.includes('Versjon:') && t.includes('Enhet:') && t.includes('Slagene og treffene: For høye') && t.includes('Vanskeligheten: For lett') && !t.includes('Musikken mot lydene') && t.includes('Kråkene er for mange.') && t.includes('pleier') }; }""")
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300)
        esc_ = await pg.evaluate("() => ({ apen: Testmodus.apen, pause: MORBIDIUM.state === 'panel' && !!document.getElementById('pMening') })")
        sjekk('«Si din mening» og «Testrapport» i pausen: svar med knapper (og angre), fritekst, og alt kommer med i rapporten', pause and r['mening'] == {'slag': 2, 'vansk': 0} and r['fri'] == 'Kråkene er for mange.' and r['tekst'], [pause, r])
        sjekk('Escape lukker panelet, men ikke pausen under', not esc_['apen'] and esc_['pause'], esc_)
        await pg.evaluate("() => { closePanel(); const P = MORBIDIUM.player; P.invuln = 0; P.iframe = 0; hurt(P, 9999, { type: 'kultist', x: P.x, z: P.z }); }")
        d = await pg.evaluate("""async () => { for (let i = 0; i < 80 && !document.getElementById('dTest'); i++) await new Promise(r => setTimeout(r, 100));
          const L = MORBIDIUM.meta.testrapporter || []; return { knapp: !!document.getElementById('dTest'), lagret: L.length, slutt: L.length && L[0].tekst.includes('Slutt: døde i etasje 3') && L[0].tekst.includes('Kråkene er for mange.') }; }""")
        await pg.click('#dTest'); await pg.wait_for_timeout(300)
        d['panel'] = await pg.evaluate("() => Testmodus.apen && Testmodus.fane === 'rapport' && document.getElementById('trTekst').value.includes('Slutt: døde')")
        await pg.click('#tLukk'); await pg.wait_for_timeout(200)
        sjekk('døden lagrer rapporten, og dødsskjermen får en knapp til den', d['knapp'] and d['lagret'] == 1 and d['slutt'] and d['panel'], d)
        await pg.evaluate("() => openSettings(false, null, 'data')"); await pg.wait_for_timeout(300)
        s = await pg.evaluate("() => ({ sist: !!document.getElementById('dTestSist') && !document.getElementById('dTestSist').disabled })")
        await pg.evaluate("() => { MORBIDIUM.meta.settings.testmodus = false; applySettings(); }")
        s['av'] = await pg.evaluate("() => { const h = document.getElementById('testHud'); return (!h || h.classList.contains('hidden')) && !Testmodus.paa(); }")
        sjekk('de lagrede rapportene kan kopieres fra Data-fanen, og testmodus kan slås av', s['sist'] and s['av'], s)
        await pg.screenshot(path='/tmp/e_21testmodus.png')
        sjekk('ingen konsollfeil (testmodus)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 36) Mobil: liggende og stående telefon. HUD-en overlapper ikke, døden og utskrivningen får plass, nye paneler begynner øverst,
        #     panelene kan rulles med fingeren, butikken ligger side om side, journalen og brevet er store nok, hjertene får en grense,
        #     og mistet grafikk hentes tilbake (med nedgradering bare når siden var synlig)
        UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        async def mobil(vp):
            ctx = await b.new_context(viewport=vp, has_touch=True, is_mobile=True, device_scale_factor=2, user_agent=UA)
            pg = await ctx.new_page()
            if THREE:
                await pg.route('**/three.min.js', lambda r: r.fulfill(path=THREE, content_type='application/javascript'))
                await pg.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
            pg.errs = []
            pg.on('pageerror', lambda e: pg.errs.append('PAGEERROR: ' + str(e)))
            pg.on('console', lambda m: pg.errs.append(m.type + ': ' + m.text) if m.type == 'error' else None)
            await pg.goto(URL); await pg.wait_for_timeout(2500); await pg.evaluate("() => localStorage.clear()")
            await pg.goto(URL); await pg.wait_for_timeout(2500)
            await pg.tap('#tNew'); await pg.wait_for_timeout(600); await pg.tap('[data-awk]'); await pg.wait_for_timeout(2500)
            return ctx, pg
        async def sveip(pg, x, y, dy, steg=12):
            cdp = await pg.context.new_cdp_session(pg)
            await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x, 'y': y}]})
            for i in range(1, steg + 1):
                await cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x, 'y': y + dy * i / steg}]})
                await asyncio.sleep(0.016)
            await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await pg.goto(URL); await pg.wait_for_timeout(2500)
        tit = await pg.evaluate("() => { const t = document.getElementById('title'), a = t.firstElementChild.getBoundingClientRect(), z = t.lastElementChild.getBoundingClientRect(); return { over: Math.round(a.top), under: Math.round(innerHeight - z.bottom) }; }")
        sjekk('tittelmenyen står midt på skjermen på PC', abs(tit['over'] - tit['under']) < 40 and tit['over'] > 40, tit)
        await pg.close()
        ctx, pg = await mobil({'width': 844, 'height': 390})
        await pg.evaluate("() => { MORBIDIUM.meta.tips = {}; MORBIDIUM.meta.settings.tips = true; Tips.vis('sjef'); }"); await pg.wait_for_timeout(1000)
        hud = await pg.evaluate("""() => { const r = id => { const b = document.getElementById(id).getBoundingClientRect(); return [b.left, b.top, b.right, b.bottom]; };
          const over = (a, c) => a[0] < c[2] && c[0] < a[2] && a[1] < c[3] && c[1] < a[3], k = ['badge', 'mapring', 'tools', 'cards', 'stick', 'tbtns', 'tips'].map(r), par = [];
          for (let i = 0; i < k.length; i++) for (let j = i + 1; j < k.length; j++) if (over(k[i], k[j])) par.push(i + '-' + j); return { par, skilt: getComputedStyle(document.getElementById('roomsign')).display }; }""")
        sjekk('liggende: merket, kartet, knappene i toppen, kortene, spaken, slagknappene og tipslappen overlapper ikke', not hud['par'] and hud['skilt'] == 'none', hud)
        # innstillingene er høyere enn skjermen: de kan rulles med fingeren, og neste panel begynner øverst likevel
        await pg.evaluate("() => openSettings(false, null, 'bilde')"); await pg.wait_for_timeout(500)
        await sveip(pg, 422, 280, -150); await pg.wait_for_timeout(600)
        ru = await pg.evaluate("() => { const p = document.getElementById('panel'); return { hoy: p.scrollHeight > p.clientHeight, rullet: p.scrollTop }; }")
        ru['panel'] = await pg.evaluate("""async () => { const p = document.getElementById('panel'), vent = t => new Promise(r => setTimeout(r, t)), ut = {};
          p.scrollTop = 100; openSettings(false, null, 'bilde'); await vent(200); ut.sammeBeholder = p.scrollTop;
          p.scrollTop = 999; openHandbook({}, 2, 0); await vent(300); ut.hbHoy = p.scrollHeight > p.clientHeight; ut.hbTopp = p.scrollTop;
          return ut; }""")
        sjekk('det samme panelet tegnet på nytt beholder rullingen, og et nytt panel åpnet fra et annet begynner øverst', abs(ru['panel']['sammeBeholder'] - 100) <= 2 and ru['panel']['hbHoy'] and ru['panel']['hbTopp'] == 0, ru['panel'])
        await pg.evaluate("() => { document.getElementById('panel').scrollTop = 999; closePanel(); openService('kafeteria'); }"); await pg.wait_for_timeout(600)
        ru['butikk'] = await pg.evaluate("""() => { const p = document.getElementById('panel'), w = document.querySelector('.shop .who').getBoundingClientRect(), l = document.querySelector('.shop .list').getBoundingClientRect();
          return { top: p.scrollTop, sideomside: Math.abs(w.top - l.top) < 30 && w.right <= l.left + 1, fokus: document.activeElement.classList.contains('offer') }; }""")
        sjekk('panelene kan rulles med fingeren, og et nytt panel begynner øverst selv om det forrige var rullet', ru['hoy'] and ru['rullet'] > 60 and ru['butikk']['top'] == 0 and ru['butikk']['fokus'], ru)
        sjekk('liggende: butikken har personen til venstre og varene til høyre', ru['butikk']['sideomside'], ru['butikk'])
        await pg.evaluate("() => { closePanel(); const P = MORBIDIUM.player; P.invuln = 0; P.iframe = 0; hurt(P, 9999, { type: 'kultist', x: P.x, z: P.z }); }")
        await pg.wait_for_function("() => !!document.getElementById('dNew')", timeout=20000); await pg.wait_for_timeout(300)
        dod = await pg.evaluate("""() => { const p = document.getElementById('panel'), h = document.querySelector('.dodskjerm .hdr').getBoundingClientRect(), n = document.getElementById('dNew').getBoundingClientRect();
          return { plass: p.scrollHeight <= p.clientHeight + 1, hdr: h.top >= 0, knapp: n.bottom <= innerHeight, kolonner: getComputedStyle(document.querySelector('.dodskjerm .dcard')).display }; }""")
        sjekk('liggende: dødskortet i to kolonner, med overskriften og knappene på skjermen uten rulling', dod['plass'] and dod['hdr'] and dod['knapp'] and dod['kolonner'] == 'grid', dod)
        await pg.tap('#dNew'); await pg.wait_for_timeout(800)
        await pg.evaluate("() => { document.getElementById('panel').scrollTop = 999; }"); await pg.tap('[data-awk]'); await pg.wait_for_timeout(2500)
        await pg.evaluate("() => showWin()"); await pg.wait_for_function("() => !!document.getElementById('bOk')", timeout=20000); await pg.wait_for_timeout(300)
        brev = await pg.evaluate("() => ({ top: document.getElementById('panel').scrollTop })")
        await pg.tap('#bOk'); await pg.wait_for_function("() => !!document.getElementById('dNew')", timeout=20000); await pg.wait_for_timeout(300)
        brev['utskrevet'] = await pg.evaluate("() => { const p = document.getElementById('panel'), f = p.firstElementChild; return { sh: p.scrollHeight, ch: p.clientHeight, st: p.scrollTop, hdr: Math.round(document.querySelector('.dodskjerm .hdr').getBoundingClientRect().top), zoom: f.style.zoom, h: f.offsetHeight, merk: document.querySelectorAll('.nymerk > div').length }; }")
        u = brev['utskrevet']
        sjekk('utskrivningsbrevet begynner øverst, og utskrivningen får plass liggende', brev['top'] == 0 and u['sh'] <= u['ch'] + 1 and u['hdr'] >= 0, brev)
        sjekk('ingen konsollfeil (mobil liggende)', not pg.errs, pg.errs[:6])
        await ctx.close()
        ctx, pg = await mobil({'width': 390, 'height': 844})
        st = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), ut = {};
          P.maxHp = 400; P.hp = 300; await vent(400); ut.hjerter = document.querySelectorAll('#hearts > *:not(.hplus)').length; ut.pluss = (document.querySelector('#hearts .hplus') || {}).textContent;
          openJournal(); await vent(600); const m = /scale\(([\d.]+)\)/.exec(document.querySelector('#journal .jwrap').style.transform); ut.journal = m ? +m[1] : 0;
          const q = document.querySelector('#journal .quote'); ut.sitat = q ? getComputedStyle(q).position : ''; closeJournal();
          return ut; }""")
        sjekk('stående: høyst 20 hjerter, og «+fulle/skjulte» for resten', st['hjerter'] == 20 and st['pluss'] == '+10/20', st)
        sjekk('stående: journalen får en smalere side og skaleres ikke under 0,7', st['journal'] >= .7 and st['sitat'] == 'relative', st)
        await pg.evaluate("() => showWin()"); await pg.wait_for_function("() => !!document.getElementById('bOk')", timeout=20000); await pg.wait_for_timeout(300)
        st['brev'] = await pg.evaluate("() => { const f = document.querySelector('.brev'); return { smal: f.classList.contains('smal'), zoom: +f.style.zoom }; }")
        sjekk('stående: utskrivningsbrevet er smalt og skaleres ikke under 0,7', st['brev']['smal'] and st['brev']['zoom'] >= .7, st['brev'])
        await pg.tap('#bOk'); await pg.wait_for_timeout(600)
        await pg.tap('#dNew'); await pg.wait_for_timeout(800); await pg.tap('[data-awk]'); await pg.wait_for_timeout(2500)
        # grafikkminnet: en runde gjennom fire etasjer med fiender som dør, to ganger. Den første fyller bufrene (bilder av møbler
        # og fiender), den andre skal ikke legge igjen noe. Før rettingen ble det liggende et skyggekart, teksturene til flekker,
        # plakater og dører, og strekbåndene til hver dukke for hver etasje: målt til +16 teksturer og +67 geometrier per runde,
        # mot høyst +3 og rundt 0 etter rettingen.
        mem = await pg.evaluate("""async () => { const G = MORBIDIUM, vent = t => new Promise(r => setTimeout(r, t)), info = R.renderer.info.memory;
          R.safe = false; G.meta.settings.simple = false; G.meta.settings.d3 = true; applySettings();
          const runde = async () => { for (let d = 1; d <= 4; d++) { startFloor(d, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); }
            await vent(150); const P = G.player; for (let i = 0; i < 6; i++) { const s = freeSpot(P.x + 2 + i * .3, P.z, 4), e = spawnEnemy('pleier', s.x, s.z, false, d); killEntity(e, {}); } await vent(250); } };
          await runde(); const m1 = { t: info.textures, g: info.geometries }; await runde(); const m2 = { t: info.textures, g: info.geometries };
          // skyggekartet direkte: kartet til månen i denne etasjen skal kastes når neste etasje bygges
          const kart = D3.mane && D3.mane.shadow && D3.mane.shadow.map; let kastet = false; if (kart) kart.addEventListener('dispose', () => { kastet = true; });
          startFloor(2, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } await vent(200);
          return { m1, m2, d3: D3.on, bygd: D3.bygd, kval: D3.kval(), kart: !!kart, kastet }; }""")
        sjekk('skyggekartet til månen frigjøres når neste etasje bygges', mem['kart'] and mem['kastet'], mem)
        sjekk('grafikkminnet vokser ikke når de samme etasjene bygges på nytt (flekker, plakater, dører og dukker frigjøres)', mem['d3'] and mem['bygd'] and mem['m2']['t'] - mem['m1']['t'] <= 6 and mem['m2']['g'] - mem['m1']['g'] <= 12, mem)
        tap = await pg.evaluate("""async () => { const vent = t => new Promise(r => setTimeout(r, t)), gl = R.renderer.getContext(), x = gl.getExtension('WEBGL_lose_context'), ut = {};
          const kv = () => [R.dprMax, D3.on ? D3.kval() : '2D'];
          let skjult = false; Object.defineProperty(document, 'hidden', { configurable: true, get: () => skjult });
          const synlig = v => { skjult = !v; document.dispatchEvent(new Event('visibilitychange')); };
          // i bakgrunnen: pause, ingen feilmelding, og ingen nedgradering når den kommer tilbake
          const for1 = kv(); synlig(false); x.loseContext(); await vent(500); ut.pause = MORBIDIUM.state === 'panel'; ut.skjult = R.tapSkjult;
          synlig(true); x.restoreContext(); for (let i = 0; i < 50 && R.tapt; i++) await vent(100); await vent(300);
          ut.bakgrunn = { tilbake: !R.tapt, lik: JSON.stringify(kv()) === JSON.stringify(for1), feil: !document.getElementById('err').classList.contains('hidden') };
          // synlig: tilbake med lettere grafikk
          const for2 = kv(); x.loseContext(); await vent(500); x.restoreContext(); for (let i = 0; i < 50 && R.tapt; i++) await vent(100); await vent(300);
          const etter = kv(); ut.synlig = { tilbake: !R.tapt, ned: etter[0] < for2[0] || etter[1] !== for2[1] || for2[0] === 1 && for2[1] === '2D', feil: !document.getElementById('err').classList.contains('hidden'), for: for2, etter };
          // fast kvalitet (lav): 3D blir på, og valget står
          const s = MORBIDIUM.meta.settings; s.kvalitet = 1; applySettings(); await vent(300);
          x.loseContext(); await vent(500); x.restoreContext(); for (let i = 0; i < 50 && R.tapt; i++) await vent(100); await vent(300);
          ut.fast = { on: D3.on, kval: D3.kval(), d3: s.d3 !== false, kvalitet: s.kvalitet }; s.kvalitet = 0; applySettings();
          delete document.hidden; return ut; }""")
        sjekk('mistet grafikk i bakgrunnen gir pause uten feilmelding, og kommer tilbake uten nedgradering', tap['pause'] and tap['skjult'] and tap['bakgrunn']['tilbake'] and tap['bakgrunn']['lik'] and not tap['bakgrunn']['feil'], tap)
        sjekk('mistet grafikk mens spillet synes, kommer tilbake med lettere grafikk', tap['synlig']['tilbake'] and tap['synlig']['ned'] and not tap['synlig']['feil'], tap['synlig'])
        sjekk('med fast kvalitet står spillerens valg når grafikken kommer tilbake (3D blir på)', tap['fast'] == {'on': True, 'kval': 'lav', 'd3': True, 'kvalitet': 1}, tap['fast'])
        await pg.screenshot(path='/tmp/e_22mobil.png')
        sjekk('ingen konsollfeil (mobil stående)', not [e for e in pg.errs if 'CONTEXT_LOST' not in e], pg.errs[:6])
        await ctx.close()

        # 37) Skygger og vær
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg)
        # været: bare regn, snø og ildfluer lager partikler og lyd. Klarvær, tåke og etasjer uten vær får ingenting (vakta lå i en kommentar
        # og ga 60 hvite prikker og vindsus overalt), men Vaer.F følger etasjen likevel, så ute() svarer for riktig etasje
        va = await pg.evaluate("""async () => { const G = MORBIDIUM, vent = t => new Promise(r => setTimeout(r, t)), ut = { etasjer: {} }, aktiv = v => v === 'regn' || v === 'sno' || v === 'ildfluer';
          const bygg = async d => { startFloor(d, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } rolig(); const g0 = G.time; for (let i = 0; i < 100 && G.time - g0 < .1; i++) await vent(50); };
          const tilstand = () => ({ vaer: G.F.vaer, obj: !!Vaer.obj, type: Vaer.type, F: Vaer.F === G.F, lyd: Sound.vaerType || null });
          for (let d = 1; d <= 6; d++) { await bygg(d); const s = tilstand(); s.ok = s.F && (aktiv(s.vaer) ? s.obj && s.type === s.vaer && s.lyd === (s.vaer === 'regn' ? 'regn' : 'vind') : !s.obj && s.type === null && s.lyd === null); ut.etasjer[d] = s; }
          const F = G.F, v0 = F.vaer; ut.stille = {};
          for (const v of [null, 'klart', 'taake']) { F.vaer = v; Vaer.start(F); ut.stille[v] = Vaer.obj === null && Vaer.type === null && Vaer.F === F && !Sound.vaerType && !Regnringer.obj; }
          F.vaer = 'regn'; Vaer.start(F); ut.regn = !!(Vaer.obj && Vaer.obj.isLineSegments && Vaer.obj.parent === R.scene && Vaer.type === 'regn' && Sound.vaerType === 'regn');
          F.vaer = 'sno'; Vaer.start(F); ut.sno = !!(Vaer.obj && Vaer.obj.isPoints && Vaer.type === 'sno' && Sound.vaerType === 'vind');
          R.lowTex = true; F.vaer = 'regn'; Vaer.start(F); ut.lowTex = Vaer.obj === null && Vaer.type === null && Vaer.F === F && !Sound.vaerType; R.lowTex = false;
          // fra regn i en inneetasje til klarvær i parken: ute() skal svare for parken, ikke for etasjen før
          F.vaer = 'regn'; Vaer.start(F); const F6 = F; await bygg(1); const F1 = G.F, v1 = F1.vaer;
          Vaer.start(F6); F1.vaer = 'klart'; Vaer.start(F1); let feil = 0, rom = 0, pav = 0;
          for (let z = 0; z < F1.H; z++) for (let x = 0; x < F1.W; x++) { const i = z * F1.W + x, rid = F1.tiles[i] ? F1.roomId[i] : -1, venter = rid >= 0 ? !!F1.rooms[rid].ute : true; if (rid >= 0) { if (venter) rom++; else pav++; } if (Vaer.ute(x + .5, z + .5) !== venter) feil++; }
          ut.parken = { F: Vaer.F === F1, obj: Vaer.obj, utenfor: Vaer.ute(-5, -5), feil, rom, pav };
          F1.vaer = v1; F6.vaer = v0; Vaer.start(F1); ut.tilbake = Vaer.F === F1 && !!Vaer.obj === aktiv(v1);
          return ut; }""")
        sjekk('været lager partikler og lyd bare ved regn, snø og ildfluer, og følger etasjen i alle seks', all(va['etasjer'][str(d)]['ok'] for d in range(1, 7)), va['etasjer'])
        sjekk('klarvær, tåke og etasjer uten vær gir ingen prikker, ingen vind og ingen regnringer', all(va['stille'].values()) and va['lowTex'], va)
        sjekk('regn er streker og snø er prikker, med lyden som hører til', va['regn'] and va['sno'], va)
        pk = va['parken']
        sjekk('etter regn i etasjen før svarer været riktig for parken i klarvær', pk['F'] and pk['obj'] is None and pk['utenfor'] is True and pk['feil'] == 0 and pk['rom'] > 0 and va['tilbake'], pk)
        sjekk('ingen konsollfeil (skygger og vær)', not pg.errs, pg.errs[:6])
        await pg.close()

        # lykteskygger: i samme bilde som figurene, ikke gjennom vegger, kortere mot en vegg bak og myke nær lykta (at de er borte like etter et drap, sjekker del 30)
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg)
        ly = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), spill = async (t, maks = 20000) => { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < t && performance.now() - t0 < maks) await vent(50); }, ut = {};
          // vegg mellom to punkter, målt for seg: tette prøver langs linja, og bare veggruter teller (ikke møbler)
          const vegg = (ax, az, bx, bz) => { const F = G.F; for (let i = 0; i <= 120; i++) { const t = i / 120, x = Math.floor(ax + (bx - ax) * t), z = Math.floor(az + (bz - az) * t); if (x < 0 || z < 0 || x >= F.W || z >= F.H || !F.tiles[z * F.W + x]) return true; } return false; };
          const fri = (x, z) => [[0, 0], [.45, 0], [-.45, 0], [0, .45], [0, -.45]].every(([a, c]) => !solid(Math.floor(x + a), Math.floor(z + c)));
          const rom = (x, z) => { const i = Math.floor(z) * G.F.W + Math.floor(x); return G.F.tiles[i] ? G.F.roomId[i] : -1; };
          const hoy = o => o.alive && o.g && o.g.parent && o.m && !o.g.userData.flat && o.m.userData && o.m.userData.P && o.m.userData.P.h >= 1.1;
          const fiende = (x, z) => { const e = spawnEnemy('pleier', x, z, false, 2); e.stun = 99; e.hp = e.max = 1e6; e.state = 'chase'; return e; };
          const plass = (x, z) => { P.x = x; P.z = z; P.vx = P.vz = P.kvx = P.kvz = 0; R.snapCamera(P.x, P.z); };
          const RR = () => Math.max(2.5, P.lantern.scale.x * .5 * 1.15);
          // et sted i et rom med en høy ting like ved og en fri rute bak en vegg innen tre ruter
          let S = null;
          for (const d of [2, 3, 4, 6, 1, 5]) {
            startFloor(d, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } rolig(); P.hp = P.maxHp = 9999; P.invuln = 999;
            const F = G.F, maks = Math.min(2.9, RR() - .4);
            for (const o of G.props.filter(hoy)) { const oz = o.g.position.z - .15;
              for (let k = 0; k < 24 && !S; k++) { const a = k / 24 * Math.PI * 2, r = 1.3 + (k % 3) * .4, px = o.x + Math.cos(a) * r, pz = oz + Math.sin(a) * r; if (!fri(px, pz) || rom(px, pz) !== o.room || vegg(px, pz, o.x, oz)) continue;
                for (let dz = -3; dz <= 3 && !S; dz++) for (let dx = -3; dx <= 3 && !S; dx++) { const ex = Math.floor(px) + dx + .5, ez = Math.floor(pz) + dz + .5, dd = Math.hypot(ex - px, ez - pz); if (dd > maks || dd < 1.2 || !fri(ex, ez) || !vegg(px, pz, ex, ez)) continue; S = { d, o, px, pz, ex, ez }; } }
              if (S) break; }
            if (S) break; }
          ut.funnet = !!S; if (!S) return ut;
          plass(S.px, S.pz); const e1 = fiende(S.ex, S.ez); await spill(.8);
          ut.vegg = { etasje: S.d, bak: vegg(P.x, P.z, e1.x, e1.z), avstand: +Math.hypot(e1.x - P.x, e1.z - P.z).toFixed(2), rr: +RR().toFixed(2), fiende: Dybde.skygger.has(e1), ting: Dybde.skygger.has(S.o) && Dybde.skygger.get(S.o).material.opacity > .05 };
          killEntity(e1, {}); await spill(.8);
          // en fiende rett foran en vegg, med lykta bak seg: skyggen stopper ved veggen i stedet for å gå gjennom den
          let V = null; const F = G.F;
          for (let z = 1; z < F.H - 3 && !V; z++) for (let x = 1; x < F.W - 1 && !V; x++) { const i = z * F.W + x; if (!F.tiles[i] || F.tiles[i - F.W] || !fri(x + .5, z + .5) || !fri(x + .5, z + 2.1) || vegg(x + .5, z + .5, x + .5, z + 2.1) || rom(x + .5, z + .5) < 0) continue; V = { x: x + .5, z: z + .5 }; }
          ut.veggFunnet = !!V; if (!V) return ut;
          plass(V.x, V.z + 1.6); const e = fiende(V.x, V.z); await spill(.8);
          { const m = Dybde.skygger.get(e), d = Math.hypot(e.x - P.x, e.z - P.z), ux = (e.x - P.x) / d, uz = (e.z - P.z) / d, L = .8 + d * 1.15, l = m ? m.scale.y : 0;
            ut.kort = { finnes: !!m, lengde: +l.toFixed(3), full: +L.toFixed(3), forbi: vegg(e.x, e.z, e.x + ux * L, e.z + uz * L), inni: vegg(e.x, e.z, e.x + ux * l * .97, e.z + uz * l * .97) }; }
          // samme bilde: platen står der fienden står når bildet tegnes, også mens den dyttes fram og tilbake
          { const r0 = R.render, L = { n: 0, flytt: 0, maks: 0 }; let x0 = e.x, z0 = e.z, f = 0;
            R.render = function (dt) { const m = Dybde.skygger.get(e); if (m) { L.n++; if (Math.hypot(e.x - x0, e.z - z0) > 1e-3) { L.flytt++; L.maks = Math.max(L.maks, Math.abs(m.position.x - e.x), Math.abs(m.position.z - e.z)); } } x0 = e.x; z0 = e.z; e.kvx = ++f % 12 < 6 ? 3 : -3; return r0.call(this, dt); };
            await spill(1.2); R.render = r0; e.kvx = e.kvz = 0; ut.sammeBilde = L; }
          await spill(.4);
          // nær lykta blekner skyggen jevnt bort i stedet for å klippes ved 0,35
          { const d0 = Math.hypot(e.x - P.x, e.z - P.z), ux = (e.x - P.x) / d0, uz = (e.z - P.z) / d0, ex0 = e.x, ez0 = e.z; ut.naer = [];
            for (const d of [.8, .55, .4, .3, .22]) { e.x = P.x + ux * d; e.z = P.z + uz * d; Dybde.lykt(0); const m = Dybde.skygger.get(e); ut.naer.push(m ? +m.material.opacity.toFixed(4) : -1); }
            e.x = ex0; e.z = ez0; Dybde.lykt(0);
            // gjennomsiktige og halvt oppløste figurer kaster svakere skygge
            const m = Dybde.skygger.get(e), o0 = m.material.opacity; e.doll.U.uAlpha.value = .3; Dybde.lykt(0); const o1 = m.material.opacity; e.doll.U.uAlpha.value = 1; e.doll.U.uDissolve.value = .5; Dybde.lykt(0); const o2 = m.material.opacity; e.doll.U.uDissolve.value = 0; Dybde.lykt(0);
            ut.alfa = { o0: +o0.toFixed(4), gjennomsiktig: +(o1 / o0).toFixed(4), oppløst: +(o2 / o0).toFixed(4) }; }
          return ut; }""")
        sjekk('lykta kaster ikke skygge gjennom vegger, men de høye tingene i rommet beholder sin', ly.get('funnet') and ly['vegg']['bak'] and ly['vegg']['avstand'] < ly['vegg']['rr'] and not ly['vegg']['fiende'] and ly['vegg']['ting'], ly.get('vegg', ly))
        k = ly.get('kort', {})
        sjekk('lykteskyggen stopper ved første vegg bak fienden', ly.get('veggFunnet') and k.get('finnes') and k['forbi'] and not k['inni'] and .15 < k['lengde'] < k['full'] - .8, k)
        sb = ly.get('sammeBilde', {})
        sjekk('lykteskyggen står der fienden står i samme bilde, også under et dytt', sb.get('flytt', 0) >= 5 and sb.get('maks', 1) < 1e-6, sb)
        n = ly.get('naer', [])
        sjekk('nær lykta blekner skyggen jevnt i stedet for å klippes', len(n) == 5 and all(x >= 0 for x in n) and all(n[i] > n[i + 1] for i in range(4)) and n[4] < .03 and n[0] > .3, n)
        al = ly.get('alfa', {})
        sjekk('gjennomsiktige og halvt oppløste figurer kaster svakere lykteskygge', abs(al.get('gjennomsiktig', 0) - .3) < 1e-3 and abs(al.get('oppløst', 0) - .5) < 1e-3, al)
        sjekk('ingen konsollfeil (lykteskygger)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 3D: månens skygger står stille når kameraet glir, lykta lyser fra der pasienten er i samme bilde, og telefoner får 1024 i skyggekartet
        pg = await ny_side(b, viewport={'width': 960, 'height': 540})
        await start_lop(pg, url=URL3D)
        m3 = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), spill = async (t, maks = 30000) => { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < t && performance.now() - t0 < maks) await vent(50); }, bilder = n => new Promise(r => { const f = () => --n <= 0 ? r() : requestAnimationFrame(f); requestAnimationFrame(f); }), ut = {};
          const bygg = async d => { startFloor(d, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } rolig(); P.hp = P.maxHp = 9999; P.invuln = 999; await spill(.3); };
          await bygg(2); ut.d3 = D3.on && D3.bygd;
          // seks tilfeldige små flytt av kameraet: midtpunktet ligger alltid på hele ruter i skyggekartet, med samme retning og lengde, på gulvet og nær kameraet.
          // Aksene regnes ut her fra lyset selv, slik lookAt gjør det for skyggekameraet, og ruta er bredden på kameraet delt på kartet
          const M = D3.mane, C = M.shadow.camera, z = new THREE.Vector3(-7, 16, 9).normalize(), x = new THREE.Vector3(0, 1, 0).cross(z).normalize(), B = { x, y: z.clone().cross(x), texel: (C.right - C.left) / M.shadow.mapSize.x }, A = { rute: 0, retning: 0, gulv: 0, naer: 0 };
          for (let i = 0; i < 6; i++) { R.camT.x += Math.random() - .5; R.camT.z += Math.random() - .5; D3.tick(0); const t = M.target.position, fx = t.dot(B.x) / B.texel, fy = t.dot(B.y) / B.texel;
            A.rute = Math.max(A.rute, Math.abs(fx - Math.round(fx)), Math.abs(fy - Math.round(fy))); A.retning = Math.max(A.retning, Math.abs(M.position.x - t.x + 7), Math.abs(M.position.y - t.y - 16), Math.abs(M.position.z - t.z - 9)); A.gulv = Math.max(A.gulv, Math.abs(t.y)); A.naer = Math.max(A.naer, Math.hypot(t.x - R.camT.x, t.z - R.camT.z) / B.texel); }
          ut.maane = A; ut.texel = B.texel; ut.kart = M.shadow.mapSize.x; ut.niva = D3.kval();
          // lykta: punktlyset står der pasienten står når bildet tegnes, også under et dytt
          { const r0 = R.render, L = { n: 0, flytt: 0, maks: 0 }; let x0 = P.x, z0 = P.z, f = 0;
            R.render = function (dt) { const l = D3.pool[0]; if (l && G.state === 'play') { L.n++; if (Math.hypot(P.x - x0, P.z - z0) > 1e-3) { L.flytt++; L.maks = Math.max(L.maks, Math.abs(l.position.x - P.x), Math.abs(l.position.z + .3 - P.z)); } } x0 = P.x; z0 = P.z; P.kvx = ++f % 10 < 5 ? 3 : -3; return r0.call(this, dt); };
            await spill(1.2); R.render = r0; P.kvx = P.kvz = 0; ut.lykt = L; }
          // skyggekartet tegnes ikke i pausen, bare én gang når den åpnes, og igjen når spillet går videre
          { const SM = R.renderer.shadowMap, r1 = SM.render; let n = 0; SM.render = function (...a) { if (this.enabled && (this.autoUpdate || this.needsUpdate) && a[0] && a[0].length) n++; return r1.apply(this, a); };
            await bilder(3); const spillN = n; openPause(); await bilder(2); n = 0; await bilder(4); const pauseN = n, auto = SM.autoUpdate; closePanel(); await bilder(3); ut.kartpass = { spill: spillN, pause: pauseN, auto, etter: n, autoEtter: SM.autoUpdate }; SM.render = r1; }
          // telefon (grov peker) på høy: 1024 i skyggekartet, uten at nivåene endres
          { const s = G.meta.settings, k0 = s.kvalitet; s.kvalitet = 3; R.coarse = true; applySettings(); ut.mobil = { niva: D3.kval(), skygge: D3.Q().skygge, kart: D3.mane.shadow.mapSize.x, texel: D3.maneB && D3.maneB.texel, hoy: D3.NIVA.hoy.skygge };
            R.coarse = false; applySettings(); ut.pc = { skygge: D3.Q().skygge, kart: D3.mane.shadow.mapSize.x };
            s.lights = false; applySettings(); D3.tick(0); ut.lysAv = !D3.maneB && !D3.mane.castShadow; s.lights = true; s.kvalitet = k0; applySettings(); }
          const r = G.F.rooms.find(r => r.role === 'combat' && !r.ute && r.w >= 8) || G.F.rooms[G.F.startId]; P.x = r.x + r.w / 2; P.z = r.z + r.h / 2; R.snapCamera(P.x, P.z); await spill(.6);
          return ut; }""")
        await pg.screenshot(path='/tmp/e_skygge_a.png')
        await pg.evaluate("async () => { const G = MORBIDIUM, g0 = G.time, t0 = performance.now(); G.player.x += .02; while (G.time - g0 < .8 && performance.now() - t0 < 20000) await new Promise(r => setTimeout(r, 50)); }")
        await pg.screenshot(path='/tmp/e_skygge_b.png')
        ma = m3['maane']
        sjekk('månens skyggekamera flytter seg bare i hele ruter av skyggekartet, med samme retning og lengde', m3['d3'] and ma['rute'] < 1e-3 and ma['retning'] < 1e-6 and ma['gulv'] < 1e-6 and ma['naer'] < 2, m3)
        ly3 = m3['lykt']
        sjekk('lykta i 3D lyser fra der pasienten står i samme bilde, også under et dytt', ly3['flytt'] >= 5 and ly3['maks'] < 1e-6, ly3)
        kp = m3['kartpass']
        sjekk('skyggekartet tegnes ikke på nytt i pausen, men igjen når spillet går videre', kp['spill'] >= 3 and kp['pause'] == 0 and kp['auto'] is False and kp['etter'] >= 2 and kp['autoEtter'] is True, kp)
        sjekk('telefoner får høyst 1024 i skyggekartet på høy, PC 2048, og uten lys og skygge er det ingen måneskygge', m3['mobil'] == {'niva': 'hoy', 'skygge': 1024, 'kart': 1024, 'texel': 32 / 1024, 'hoy': 2048} and m3['pc'] == {'skygge': 2048, 'kart': 2048} and m3['lysAv'], m3)
        sjekk('ingen konsollfeil (måneskygger)', not pg.errs, pg.errs[:6])
        await pg.close()

        # skyggeflekkene i 2D: kråka og koret svever og et hopp løfter tegningen, men flekken blir liggende på gulvet, mindre og lysere.
        # Fiendene settes på plass etter update (roten til y 0), så det sjekkes når bildet tegnes. Full styrke i 2D, og den blekner med figuren
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg)
        fl = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), spill = async (t, maks = 20000) => { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < t && performance.now() - t0 < maks) await vent(50); }, ut = {};
          startFloor(2, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } rolig(); P.hp = P.maxHp = 9999; P.invuln = 999;
          const fiende = (t, dx, dz) => { const s = freeSpot(P.x + dx, P.z + dz, 2), e = spawnEnemy(t, s.x, s.z, false, 2); e.stun = 99; e.hp = e.max = 1e6; return e; };
          const v = new THREE.Vector3(), y = o => o.getWorldPosition(v).y, r0 = R.render;
          const kr = fiende('kraake', 2, 0), ko = fiende('koret', -2, 0), pl = fiende('pleier', 0, 2);
          // pleieren hopper (som rottene og yngelen gjør når de løper): update får hopp, og updateEnemy setter roten på plass etterpå som ellers
          const u0 = pl.doll.update; pl.doll.update = function (dt, st) { return u0.call(this, dt, Object.assign({}, st, { hop: .5 })); };
          await spill(1.2);
          const M = { n: 0, kraake: 9, koret: 9, hopp: 9, flekk: 0 };
          R.render = function (dt) { M.n++; M.kraake = Math.min(M.kraake, y(kr.doll.plane)); M.koret = Math.min(M.koret, y(ko.doll.plane)); M.hopp = Math.min(M.hopp, y(pl.doll.plane)); for (const e of [kr, ko, pl]) M.flekk = Math.max(M.flekk, Math.abs(y(e.doll.shadow) - .012));
            const s = pl.doll.shadow; M.str = +(s.scale.x / s.userData.sx).toFixed(4); M.a = +s.material.opacity.toFixed(4); return r0.call(this, dt); };
          await spill(.5); R.render = r0; pl.doll.update = u0; ut.hoyde = M; await spill(.2); ut.full = pl.doll.shadow.material.opacity;
          // et drap: flekken følger oppløsningen (og høyden) og går aldri over full styrke, og kråka daler ned mens den løses opp
          const L = { n: 0, avvik: 0, maks: 0, kraake: 9 };
          R.render = function (dt) { for (const e of [pl, kr]) if (!e.gone) { const d = e.doll, h = Math.max(0, d.plane.position.y); L.n++; L.avvik = Math.max(L.avvik, Math.abs(d.shadow.material.opacity - (1 - d.U.uDissolve.value) * (1 - Math.min(.5, h * .4)))); L.maks = Math.max(L.maks, d.shadow.material.opacity); } if (!kr.gone) L.kraake = kr.doll.plane.position.y; return r0.call(this, dt); };
          killEntity(pl, {}); killEntity(kr, {}); await spill(.7); R.render = r0; L.borte = pl.gone && kr.gone; ut.drap = L;
          return ut; }""")
        h = fl['hoyde']
        sjekk('kråka og koret svever i spillet, men skyggeflekken ligger på gulvet', h['n'] >= 3 and h['kraake'] > .5 and h['koret'] > .2 and h['flekk'] < 1e-3, h)
        sjekk('et hopp løfter tegningen og ikke skyggeflekken, som blir mindre og lysere', h['hopp'] > .45 and abs(h['str'] - .8) < .01 and abs(h['a'] - .8) < .01, h)
        d = fl['drap']
        sjekk('i 2D har skyggeflekken full styrke, den blekner med figuren når den dør, og kråka daler ned', abs(fl['full'] - 1) < 1e-6 and d['n'] >= 4 and d['avvik'] < 1e-6 and d['maks'] <= 1 and d['kraake'] < .15 and d['borte'], fl)
        sjekk('ingen konsollfeil (skyggeflekker)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 3D: figurene kaster måneskygge etter hele tegningen, også våpen og tillegg som kommer senere. Skyggeflekken er .45 og blir der,
        # også gjennom et drap og når hjorten skjuler seg. Halvt oppløste og gjennomsiktige kaster ikke. Den åpne kista, dekalene, lys av og 3D av
        pg = await ny_side(b, viewport={'width': 960, 'height': 540})
        await start_lop(pg, url=URL3D)
        s3 = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), spill = async (t, maks = 30000) => { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < t && performance.now() - t0 < maks) await vent(50); }, bilder = n => new Promise(r => { const f = () => --n <= 0 ? r() : requestAnimationFrame(f); requestAnimationFrame(f); }), ut = {};
          const bygg = async d => { startFloor(d, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } rolig(); P.hp = P.maxHp = 9999; P.invuln = 999; await spill(.3); };
          const fiende = (t, dx, dz) => { const s = freeSpot(P.x + dx, P.z + dz, 2), e = spawnEnemy(t, s.x, s.z, false, 2); e.stun = 99; e.hp = e.max = 1e6; return e; };
          const plate = d => d.meshes.length > 0 && d.meshes.every(m => !!m.customDepthMaterial && m.castShadow), K = d => d.d3k || [], v = new THREE.Vector3(), y = o => o.getWorldPosition(v).y, r0 = R.render;
          await bygg(2); ut.d3 = D3.on && D3.bygd;
          const pd = P.doll; ut.spiller = { deler: pd.meshes.length, plate: plate(pd), baand: [pd.back.mesh, pd.front.mesh].every(m => K(pd).includes(m) && m.castShadow), flekk: +pd.shadow.material.opacity.toFixed(4) };
          // et våpen som plukkes opp midt i etasjen får skyggeplate, og det gamle våpenet frigjøres
          { let kastet = false; const gml = pd.wpMesh; if (gml) gml.material.addEventListener('dispose', () => { kastet = true; }); const w = Object.keys(WEAPONS).find(w => w !== P.weapon); P.weapon = w; pd.setWeapon(w); await bilder(3);
            ut.vaapen = { ny: pd.wpMesh !== gml, plate: !!pd.wpMesh.customDepthMaterial && pd.wpMesh.castShadow && plate(pd), kastet: !gml || kastet }; }
          // en ny fiende og en kråke: flekken er .45 i 3D (lysere når kråka svever), og et tillegg som kommer senere får skyggeplate
          const e = fiende('pleier', 2, 0), kr = fiende('kraake', -2, 0); await spill(1.2);
          ut.fiende = { flekk: +e.doll.shadow.material.opacity.toFixed(4), a: e.doll.shadowA, plate: plate(e.doll) };
          { const M = { n: 0, kraake: 9, flekk: 0 }; R.render = function (dt) { M.n++; M.kraake = Math.min(M.kraake, y(kr.doll.plane)); M.flekk = Math.max(M.flekk, Math.abs(y(kr.doll.shadow) - .012)); return r0.call(this, dt); }; await spill(.3); R.render = r0; M.a = +kr.doll.shadow.material.opacity.toFixed(4); ut.kraake = M; }
          { const m = e.doll.addAddon(weaponPart('mopp'), { at: 'head', off: { f: [0, .2] } }); await bilder(3); ut.tillegg = !!m.customDepthMaterial && m.castShadow; }
          // den gjennomsiktige mesteren kaster ikke måneskygge, og skyggen kommer tilbake når figuren er synlig igjen
          e.doll.U.uAlpha.value = .3; await bilder(3); const gj = K(e.doll).length > 3 && K(e.doll).every(m => !m.castShadow); e.doll.U.uAlpha.value = 1; await bilder(3); ut.gjennomsiktig = gj && K(e.doll).every(m => m.castShadow);
          // den skjulte hjorten (oppløst .55 og så 0 igjen): ingen måneskygge mens den er skjult, og flekken går tilbake til .45, ikke til 1
          e.doll.dissolve(.55); await bilder(3); const skjult = K(e.doll).length > 3 && K(e.doll).every(m => !m.castShadow); e.doll.dissolve(0); await bilder(3); ut.skjult = { skygge: skjult && K(e.doll).every(m => m.castShadow), flekk: +e.doll.shadow.material.opacity.toFixed(4) };
          // et drap: flekken går aldri over .45 mens figuren løses opp, måneskyggen er borte før halvveis, og skyggeplatene frigjøres med dukken
          { let kastet = false; const m0 = e.doll.meshes[0]; if (m0 && m0.customDepthMaterial) m0.customDepthMaterial.addEventListener('dispose', () => { kastet = true; });
            const M = { n: 0, maks: 0 }; R.render = function (dt) { if (!e.gone) { M.n++; M.maks = Math.max(M.maks, e.doll.shadow.material.opacity); } return r0.call(this, dt); };
            killEntity(e, {}); const g0 = G.time; await spill(.3); M.tid = +(G.time - g0).toFixed(2); M.skygge = K(e.doll).length === 0 || K(e.doll).some(m => m.castShadow); await spill(.5); R.render = r0; M.borte = e.gone; M.kastet = kastet; M.maks = +M.maks.toFixed(4); ut.drap = M; }
          // dekaler, plakater og dører er toon som gulvet (Lambert tok lykta og lampene bort i måneskyggen)
          { const lag = D3.byttet.filter(([m]) => m.userData.d3 && !m.userData.vaat).map(([m]) => m.material.type); ut.dekaler = { n: lag.length, toon: lag.every(t => t === 'MeshToonMaterial'), lambert: R.level.children.filter(c => c.material && c.material.isMeshLambertMaterial).length }; }
          // den åpne kista: ny tegning i U og m, lyses av lampene, kaster måneskygge og har ikke lenger den bakte skyggen
          { let K = null; for (const d of [2, 3, 4, 1, 6, 5]) { if (d !== G.depth) await bygg(d); K = G.props.find(o => o.kind === 'chest' && !o.opened && o.g); if (K) break; }
            if (K) { openChest(K); const t0 = D3.t; for (let i = 0; i < 300 && D3.t - t0 < .7; i++) await vent(50); const c = K.U.uTint.value; ut.kiste = { U: K.U === K.g.userData.U, m: K.m === K.g.userData.m, bakt: K.g.userData.shadow.visible, plate: !!K.m.customDepthMaterial && K.m.castShadow, r: +c.r.toFixed(3), panel: G.state }; closePanel(); await bilder(2); } }
          // lys og skygge av: tingene beholder den bakte skyggen, og flekken under figurene har full styrke. Så på igjen
          { const s = G.meta.settings; s.lights = false; applySettings(); await bilder(3); const tegnet = G.props.filter(o => o.g && o.g.userData.shadow && !o.g.userData.flat && o.g.userData.m);
            ut.lysAv = { d3: D3.on && D3.bygd, ting: tegnet.length, bakt: tegnet.every(o => o.g.userData.shadow.visible), flekk: +P.doll.shadow.material.opacity.toFixed(4) };
            s.lights = true; applySettings(); await bilder(3); ut.lysPaa = { flekk: +P.doll.shadow.material.opacity.toFixed(4), gjemt: tegnet.filter(o => !o.g.userData.shadow.visible).length, plate: plate(P.doll) }; }
          // 3D av: skyggeflekkene får full styrke igjen, og tilbake på .45 når 3D slås på
          { const s = G.meta.settings; s.d3 = false; applySettings(); await bilder(3); ut.av = { d3: D3.on, flekk: +P.doll.shadow.material.opacity.toFixed(4), a: P.doll.shadowA };
            s.d3 = true; applySettings(); await bilder(3); ut.paaIgjen = { d3: D3.on && D3.bygd, flekk: +P.doll.shadow.material.opacity.toFixed(4), plate: plate(P.doll) }; }
          // kuriositeter som vises på pasienten (Items.addons) kaster måneskygge, og materialet og skyggeplaten frigjøres når utseendet tømmes
          { const id = Object.keys(ITEMS).find(k => ITEMS[k].look); Items.give(id); Items.updateLook(); await bilder(3); const ms = Object.values(Items.addons); let kastet = 0;
            for (const m of ms) { if (m.customDepthMaterial) m.customDepthMaterial.addEventListener('dispose', () => kastet++); m.material.addEventListener('dispose', () => kastet++); }
            ut.utseende = { n: ms.length, plate: ms.length > 0 && ms.every(m => !!m.customDepthMaterial && m.castShadow) }; Items.clearLook(); ut.utseende.kastet = kastet; }
          return ut; }""")
        sp = s3['spiller']
        sjekk('i 3D kaster alle tegnede deler og strekbåndene måneskygge, og skyggeflekken er .45', s3['d3'] and sp['deler'] >= 4 and sp['plate'] and sp['baand'] and abs(sp['flekk'] - .45) < 1e-3, s3)
        sjekk('et våpen som plukkes opp og et tillegg som kommer senere, kaster måneskygge, og det gamle våpenet frigjøres', s3['vaapen'] == {'ny': True, 'plate': True, 'kastet': True} and s3['tillegg'], s3)
        fi, kr = s3['fiende'], s3['kraake']
        sjekk('en ny fiende har flekken på .45, og kråka svever i 3D med flekken på gulvet', abs(fi['flekk'] - .45) < 1e-3 and fi['a'] == .45 and fi['plate'] and kr['n'] >= 3 and kr['kraake'] > .5 and kr['flekk'] < 1e-3 and .22 < kr['a'] < .45, s3)
        sjekk('gjennomsiktige og halvt oppløste figurer kaster ikke måneskygge, og hjorten som har skjult seg får flekken tilbake på .45', s3['gjennomsiktig'] and s3['skjult']['skygge'] and abs(s3['skjult']['flekk'] - .45) < 1e-3, s3)
        dr = s3['drap']
        sjekk('under et drap går flekken aldri over .45, måneskyggen er borte etter 0,3 sekunder, og skyggeplatene frigjøres', dr['n'] >= 3 and dr['maks'] <= .46 and dr['tid'] >= .3 and not dr['skygge'] and dr['borte'] and dr['kastet'], dr)
        dk = s3['dekaler']
        sjekk('dekaler, plakater og dører er toon som gulvet, ikke Lambert', dk['n'] > 0 and dk['toon'] and dk['lambert'] == 0, dk)
        ki = s3.get('kiste')
        sjekk('den åpne kista lyses av lampene, kaster måneskygge og har ikke lenger den bakte skyggen', ki is not None and ki['U'] and ki['m'] and not ki['bakt'] and ki['plate'] and ki['r'] < .95 and ki['panel'] == 'panel', ki)
        la, lp = s3['lysAv'], s3['lysPaa']
        sjekk('uten lys og skygge beholder tingene den bakte skyggen og flekken har full styrke, og med lys igjen er alt som før', la['d3'] and la['ting'] > 5 and la['bakt'] and abs(la['flekk'] - 1) < 1e-3 and abs(lp['flekk'] - .45) < 1e-3 and lp['gjemt'] > 5 and lp['plate'], s3)
        sjekk('når 3D slås av, får skyggeflekken full styrke igjen, og .45 når det slås på', s3['av'] == {'d3': False, 'flekk': 1, 'a': 1} and s3['paaIgjen']['d3'] and abs(s3['paaIgjen']['flekk'] - .45) < 1e-3 and s3['paaIgjen']['plate'], s3)
        ut_ = s3['utseende']
        sjekk('kuriositetene på pasienten kaster måneskygge, og materialet og skyggeplaten frigjøres når utseendet tømmes', ut_['plate'] and ut_['kastet'] == 2 * ut_['n'], ut_)
        sjekk('ingen konsollfeil (skygger i 3D)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 38) Lyspuljen
        # 3D: punktlysene hopper ikke av og på når pasienten går, lykta har det første, bare ett lysglimt får lys om gangen, svarte kilder
        # får ingenting, en lampe som er mørk en kort stund beholder lyset sitt, romlyset kan settes sist i køen, og antallet følger kvaliteten.
        # D3.tick kjøres for hånd i faste steg (1/60) inne i én evaluate, så spillet ikke går imellom og maskinens fart ikke betyr noe
        pg = await ny_side(b, viewport={'width': 960, 'height': 540})
        await start_lop(pg, url=URL3D)
        lp = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), spill = async (t, maks = 30000) => { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < t && performance.now() - t0 < maks) await vent(50); }, ut = {};
          startFloor(2, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } rolig(); P.hp = P.maxHp = 9999; P.invuln = 999; await spill(.3);
          ut.d3 = D3.on && D3.bygd; const pool = D3.pool, N = pool.length, lys = m => { const c = m.material.color; return c.r + c.g + c.b >= .05; };
          // ingen flimring, intet mørke og ingen Morbidium, så bare fordelingen kan endre lysene
          const ro = () => { for (const L of D3.lamper) L.flimrer = false; D3.morkeT = 0; P.morb = 0; };
          const flytt = (x, z) => { P.x = x; P.z = z; P.lantern.position.x = x; P.lantern.position.z = z; R.camT.x = x; R.camT.z = z; };
          const steg = (n, f) => { const L = []; for (let k = 0; k < n; k++) { if (f) f(k); D3.tick(1 / 60); L.push(pool.map(l => [l.position.x, l.position.z, l.intensity])); } return L; };
          // et hopp: lyset flytter seg mer enn en halv rute mens det lyser (etter flyttet, eller mer enn ett steg i blekningen før)
          const hopp = L => { let pop = 0, maks = 0; for (let k = 1; k < L.length; k++) for (let i = 1; i < N; i++) { const [x0, z0, a] = L[k - 1][i], [x1, z1, b] = L[k][i]; maks = Math.max(maks, Math.abs(b - a)); if (Math.hypot(x1 - x0, z1 - z0) > .5 && (b > .01 || a > .2)) pop++; } return { pop, maks: +maks.toFixed(3) }; };
          const paa = m => pool.findIndex((l, i) => i > 0 && l.intensity > 0 && Math.abs(l.position.x - m.position.x) < 1e-6 && Math.abs(l.position.z - m.position.z + .3) < 1e-6);
          const kand = () => D3.kilder().filter(m => m !== P.lantern && lys(m)).length, tent = () => pool.filter((l, i) => i > 0 && l.intensity > 0).length;
          // pasienten går 12 ruter i 60 steg, fra midten av et rom og den veien flest lyskilder kommer inn blant de nærmeste
          const K0 = D3.kilder().filter(m => m !== P.lantern && lys(m)), naer = (x, z) => K0.map(m => [(m.position.x - x) ** 2 + (m.position.z - z) ** 2, m]).sort((a, b) => a[0] - b[0]).slice(0, N - 1).map(a => a[1]);
          let x0 = P.x, z0 = P.z, dir = [1, 0], mulige = -1;
          for (const r of G.F.rooms) for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ax = r.x + r.w / 2, az = r.z + r.h / 2, S = new Set(); for (let t = 0; t <= 12; t += 1) for (const m of naer(ax + dx * t, az + dz * t)) S.add(m); if (S.size > mulige) { mulige = S.size; x0 = ax; z0 = az; dir = [dx, dz]; } }
          ro(); flytt(x0, z0); steg(90);
          const sett = new Set(), nest = new Set(), L = steg(60, k => { flytt(x0 + dir[0] * .2 * (k + 1), z0 + dir[1] * .2 * (k + 1)); for (const m of naer(R.camT.x, R.camT.z)) nest.add(m); for (const l of pool.slice(1)) if (l.intensity > 0) sett.add(Math.round(l.position.x * 100) + ',' + Math.round(l.position.z * 100)); });
          ut.gange = Object.assign(hopp(L), { kilder: sett.size, naermeste: nest.size, n: N, mulige });
          steg(90); ut.hvile = { tent: tent(), kand: kand(), lykt: pool[0].userData.lykt === true && Math.abs(pool[0].position.x - P.x) < 1e-6 && Math.abs(pool[0].position.z + .3 - P.z) < 1e-6 && pool[0].intensity > 0 };
          // fem lysglimt rundt kameraet samtidig: bare ett får et punktlys, og det tennes med en gang. Når de er over, får lampene lyset tilbake
          { const cx = R.camT.x, cz = R.camT.z, fl = [], f0 = tent(); for (let k = 0; k < 5; k++) { flashLight(cx + .37 * (k - 2) + .011, cz + .23 * (k - 2) + .013, 3, '#ffd0a0', .3); fl.push(G.fxl[G.fxl.length - 1].obj); }
            D3.tick(1 / 60); const i = fl.map(paa).find(i => i > 0), maks = { n: 0 };
            ut.glimt = { lys: fl.filter(m => paa(m) > 0).length, sterk: i > 0 ? +pool[i].intensity.toFixed(3) : 0, blink: i > 0 && !!(pool[i].userData.kilde && pool[i].userData.kilde.userData.blink) };
            steg(40, () => { updateFx(1 / 60); maks.n = Math.max(maks.n, fl.filter(m => paa(m) > 0).length); });
            ut.glimt.maks = maks.n; ut.glimt.borte = fl.every(m => !m.parent) && fl.every(m => paa(m) < 0); steg(60); ut.glimt.for = f0; ut.glimt.etter = tent(); }
          // en svart kilde rett ved kameraet får aldri lys
          { const sv = R.light(R.camT.x + .123, R.camT.z + .077, 3, '#ffd89a', 0, R.levelL); steg(30); ut.svart = pool.some(l => Math.abs(l.position.x - sv.position.x) < 1e-6 && Math.abs(l.position.z - sv.position.z + .3) < 1e-6); R.remove(sv); }
          // en lampe som blir mørk ett sekund (som i mørket etter en sjef), beholder lyset og lyser med en gang den tennes igjen. Mørk i 2,5 sekunder mister den det
          { const i1 = pool.findIndex((l, i) => i > 0 && l.userData.kilde && l.userData.w === 1 && !l.userData.kilde.userData.blink && !D3.lamper.some(L => L.lp === l.userData.kilde));
            if (i1 > 0) { const m1 = pool[i1].userData.kilde, k1 = m1.material.color.clone();
              m1.material.color.setRGB(0, 0, 0); steg(60); const kort = pool[i1].userData.kilde === m1; m1.material.color.copy(k1); steg(1); const igjen = pool[i1].intensity > 0 && pool[i1].userData.w === 1;
              m1.material.color.setRGB(0, 0, 0); steg(150); const lang = pool.every(l => l.userData.kilde !== m1); m1.material.color.copy(k1); steg(30); ut.morkt = { kort, igjen, lang }; } }
          // romlyset (fyll) er merket i hvert rom, og med FYLL_SIST går punktlysene til lampene så lenge det er nok av dem
          { const fylte = D3.kilder().filter(m => m.userData.fyll), andre = D3.kilder().filter(m => !m.userData.fyll && m !== P.lantern && lys(m)).length;
            D3.FYLL_SIST = true; steg(120); ut.fyll = { n: fylte.length, rom: G.F.rooms.length, andre, sist: pool.filter(l => l.userData.kilde && l.userData.kilde.userData.fyll).length, n1: N - 1 }; D3.FYLL_SIST = false; steg(30); }
          // antallet punktlys følger kvaliteten (8, 6 og 4), og uten lys og skygge er det ingen
          { const s = G.meta.settings, k0 = s.kvalitet; ut.niva = {};
            for (const [k, n] of [[1, 'lav'], [2, 'middels'], [3, 'hoy']]) { s.kvalitet = k; applySettings(); ro(); for (let j = 0; j < 20; j++) D3.tick(1 / 60); ut.niva[n] = [D3.pool.length, D3.pool.filter(l => l.intensity > 0).length]; }
            s.lights = false; applySettings(); for (let j = 0; j < 5; j++) D3.tick(1 / 60); ut.niva.av = D3.pool.length; s.lights = true; s.kvalitet = k0; applySettings(); }
          await spill(.6); ut.spill = D3.pool.filter(l => l.intensity > 0).length;
          return ut; }""")
        ga = lp['gange']
        sjekk('punktlysene hopper ikke av og på når pasienten går 12 ruter, og de blekner jevnt', lp['d3'] and ga['naermeste'] >= ga['n'] + 2 and ga['pop'] == 0 and ga['maks'] <= .3 and ga['kilder'] >= ga['n'] + 1, ga)
        hv = lp['hvile']
        sjekk('lykta har det første punktlyset, og står pasienten stille, er ingen punktlys ledige så lenge det er kilder nok', hv['lykt'] and hv['tent'] == min(lp['gange']['n'] - 1, hv['kand']), hv)
        gl = lp['glimt']
        sjekk('fem lysglimt samtidig gir bare ett punktlys, det tennes med en gang, og lampene får lyset tilbake etterpå', gl['lys'] == 1 and gl['sterk'] > 1 and gl['blink'] and gl['maks'] == 1 and gl['borte'] and gl['etter'] == gl['for'], gl)
        sjekk('en svart lyskilde får aldri punktlys', lp['svart'] is False, lp['svart'])
        mo = lp.get('morkt')
        sjekk('en lampe som er mørk et sekund, beholder punktlyset og lyser med en gang, men mister det etter 2,5 sekunder', mo == {'kort': True, 'igjen': True, 'lang': True}, mo)
        fy = lp['fyll']
        sjekk('romlyset er merket i hvert rom, og med FYLL_SIST får lampene punktlysene', fy['n'] == fy['rom'] and fy['andre'] >= fy['n1'] and fy['sist'] == 0, fy)
        nv = lp['niva']
        sjekk('antallet punktlys følger kvaliteten, og uten lys og skygge er det ingen', nv['lav'][0] == 4 and nv['middels'][0] == 6 and nv['hoy'][0] == 8 and all(nv[k][1] >= 2 for k in ('lav', 'middels', 'hoy')) and nv['av'] == 0 and lp['spill'] >= 2, nv)
        sjekk('ingen konsollfeil (lyspuljen)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 39) Diorama
        # Glorier rundt lampene og flammene, tilt-shift også på middels med det skarpe båndet der pasienten står, og etterbehandlingen med
        # hjelpemål uten dybdebuffer som kastes når de slås av, og ingen lysbuffer i 3D. Gloriene kjøres for hånd i faste steg, og bildet
        # tegnes med R.render(0) to ganger i samme evaluate (uten og med glorier), så maskinens fart ikke betyr noe
        pg = await ny_side(b, viewport={'width': 960, 'height': 540})
        await start_lop(pg, url=URL3D)
        di = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), bilder = n => new Promise(r => { const f = () => --n <= 0 ? r() : requestAnimationFrame(f); requestAnimationFrame(f); }), ut = {}, s = G.meta.settings, u = R.post.uniforms;
            G.run.seed = 4242; startFloor(3, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } rolig(); P.hp = P.maxHp = 9999; P.invuln = 999;
            const tikk = n => { for (let i = 0; i < n; i++) Glorie.tick(1 / 60); }, antall = () => Glorie.pts && Glorie.pts.visible ? Glorie.pts.geometry.drawRange.count : 0, lyser = () => Glorie.K.filter(k => k.lys > .01).length;
            const mal = () => ({ tilt: +u.uTilt.value.toFixed(3), bl: R.bl ? [R.bl.a.depthBuffer, R.bl.b.depthBuffer] : null, us: R.us ? [R.us.a.depthBuffer, R.us.b.depthBuffer] : null, lrt: R.lrt ? R.lrt.depthBuffer : null, rt: R.rt.depthBuffer, lys: u.uLights.value });
            // etterbehandlingen per nivå: tilt-shift på høy og middels, glød og tilt i mål uten dybdebuffer som kastes når de slås av, ingen lysbuffer i 3D.
            // Antallet glorier følger taket, også mens kameraet glir over hele etasjen
            ut.niva = {}; const glc = R.renderer.getContext(); ut.maks = [(Glorie.maks || {}).value, glc.getParameter(glc.ALIASED_POINT_SIZE_RANGE)[1]];
            for (const [k, n] of [[3, 'hoy'], [2, 'middels'], [1, 'lav']]) {
              s.kvalitet = k; applySettings(); await bilder(3); tikk(30); const m = mal(); m.kval = D3.kval(); m.tak = Glorie.tak(); m.n = antall(); m.lyser = lyser();
              let maks = 0; const W = G.F.W, H = G.F.H; for (let i = 0; i <= 90; i++) { const t = i / 90; R.camT.x = W * (.1 + .8 * t); R.camT.z = H * (.2 + .6 * Math.abs(Math.sin(t * 5))); tikk(1); maks = Math.max(maks, antall()); }
              m.maks = maks; ut.niva[n] = m;
            }
            s.kvalitet = 3; applySettings(); await bilder(3);
            // uten 3D: lysbufferen uten dybdebuffer, ingen glød eller tilt, og høyst ti glorier
            s.d3 = false; applySettings(); await bilder(3); tikk(30); ut.uten3d = Object.assign(mal(), { d3: D3.on, tak: Glorie.tak(), n: antall() }); s.d3 = true; applySettings(); await bilder(3); tikk(30);
            // enkel grafikk, lette teksturer og uten lys og skygge: ingen glorier
            const av = () => [Glorie.tak(), Glorie.pts.visible, antall()];
            // enkel grafikk slått på midt i spillet kaster også hjelpemålene til glød, tilt-shift og lysbufferen
            R.safe = true; tikk(1); R.render(0); ut.safe = av(); ut.safeMal = [!!R.bl, !!R.us, !!R.lrt]; R.safe = false; R.lowTex = true; tikk(1); ut.lowTex = av(); R.lowTex = false;
            s.lights = false; applySettings(); await bilder(2); tikk(1); ut.lysAv = av(); s.lights = true; applySettings(); await bilder(3); tikk(30); ut.igjen = av();
            // lyset i gloria ved et stearinlys nær pasienten. Bildet tegnes to ganger i samme øyeblikk, med og uten glorier, og blekkstrekene
            // (under 30 uten glorier) skal holde seg mørke
            const kand = Glorie.K.filter(k => k.t === 'ting' && k.eier.kind === 'candles' && k.lys > .5);
            ut.kand = kand.length; if (!kand.length) return ut;
            const L = kand[0], o = L.eier, fs = freeSpot(o.x + 1.6, o.z + 1.2, 3); P.x = fs.x; P.z = fs.z; P.vx = P.vz = 0; R.snapCamera(P.x, P.z); D3.tick(1 / 60); tikk(40);
            const gl = R.renderer.getContext(), Wb = gl.drawingBufferWidth, Hb = gl.drawingBufferHeight, v = new THREE.Vector3(L.x, L.y, L.z).project(R.camera);
            const cx = Math.round((v.x + 1) / 2 * Wb), cy = Math.round((v.y + 1) / 2 * Hb), B = 48, px = new Uint8Array(B * B * 4), les = () => { gl.readPixels(cx - B / 2, cy - B / 2, B, B, gl.RGBA, gl.UNSIGNED_BYTE, px); return Array.from({ length: B * B }, (_, i) => .299 * px[i * 4] + .587 * px[i * 4 + 1] + .114 * px[i * 4 + 2]); };
            const info = R.renderer.info; info.autoReset = false;
            Glorie.pts.visible = false; info.reset(); R.render(0); const kall0 = info.render.calls, uten = les();
            Glorie.pts.visible = true; info.reset(); R.render(0); const kall1 = info.render.calls, med = les(); info.autoReset = true;
            const boks = a => { let sum = 0, n = 0; for (let y = 12; y < 36; y++) for (let x = 12; x < 36; x++) { sum += a[y * B + x]; n++; } return sum / n; };
            const blekk = []; for (let i = 0; i < B * B; i++) if (uten[i] < 30) blekk.push(i);
            ut.lys = { kind: o.kind, skjerm: [cx, cy, Wb, Hb], uten: +boks(uten).toFixed(1), med: +boks(med).toFixed(1), blekk: blekk.length, blekkMaks: +Math.max(0, ...blekk.map(i => med[i])).toFixed(1), blekkUten: +Math.max(0, ...blekk.map(i => uten[i])).toFixed(1), kall: [kall0, kall1] };
            // det skarpe båndet står der pasienten står
            ut.fokus = { x: +u.uFokus.value.x.toFixed(4), P: +R.uvAv(P.x, .9, P.z).y.toFixed(4), y: u.uFokus.value.y, z: u.uFokus.value.z };
            // gloriene følger lyset: mørket etter en sjef slukker dem, og et stearinlys som mister lyset (knust), blekner bort
            const sum = () => Glorie.K.filter(k => k.t === 'ting' && k.w > 0).reduce((a, k) => a + k.lys, 0), s0 = sum(); D3.morke(1.2, .08); D3.tick(1 / 60); tikk(1); const s1 = sum(); D3.morkeT = 0; D3.tick(1 / 60); tikk(1);
            ut.morke = { for: +s0.toFixed(3), under: +s1.toFixed(3), etter: +sum().toFixed(3) };
            const ly = Glorie.K.find(k => k.t === 'ting' && k.eier.kind === 'candles' && k.w === 1);
            if (ly) { R.remove(ly.eier.light); tikk(6); const w1 = ly.w; tikk(20); ut.knust = { w1: +w1.toFixed(3), w2: ly.w, lys: ly.lys }; }
            // ny etasje: den gamle gloria frigjøres og en ny lages
            const g = Glorie.pts.geometry; let kastet = false; g.addEventListener('dispose', () => { kastet = true; });
            startFloor(2, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } await bilder(2);
            ut.nyEtasje = { kastet, ny: !!Glorie.pts && Glorie.pts.geometry !== g, iScenen: !!Glorie.pts && Glorie.pts.parent === R.scene, gammel: R.scene.children.some(c => c.geometry === g) };
            return ut; }""")
        nv = di['niva']; h, m, l = nv['hoy'], nv['middels'], nv['lav']
        sjekk('tilt-shift på høy (0,7) og middels (0,45), ikke på lav, og glød og tilt har mål uten dybdebuffer som kastes når de slås av', h['tilt'] == .7 and m['tilt'] == .45 and l['tilt'] == 0 and h['bl'] == [False, False] and h['us'] == [False, False] and m['us'] == [False, False] and l['bl'] is None and l['us'] is None and all(x['rt'] and x['lrt'] is None for x in (h, m, l)), nv)
        u3 = di['uten3d']
        sjekk('uten 3D: lysbufferen uten dybdebuffer, ingen glød eller tilt, og høyst ti glorier', not u3['d3'] and u3['lrt'] is False and u3['bl'] is None and u3['us'] is None and u3['tilt'] == 0 and u3['lys'] == 1 and 0 < u3['n'] <= 10 and u3['tak'] == 10, u3)
        sjekk('gloriene holder seg under taket (32, 20 og 10) også mens kameraet glir over etasjen, og taket fylles når det er kilder nok', all(x['n'] == min(x['tak'], x['lyser']) and x['maks'] <= x['tak'] for x in (h, m, l)) and [h['tak'], m['tak'], l['tak']] == [32, 20, 10], nv)
        sjekk('enkel grafikk slått på underveis kaster målene til glød, tilt-shift og lysbufferen', di['safeMal'] == [False, False, False], di['safeMal'])
        sjekk('gloriene kan bli så store som skjermkortet tillater (de vokser i de uskarpe båndene også på store skjermer)', di['maks'][0] == di['maks'][1] and (di['maks'][0] or 0) > 160, di['maks'])
        sjekk('ingen glorier med enkel grafikk, lette teksturer eller uten lys og skygge, og de kommer tilbake', di['safe'] == [0, False, 0] and di['lowTex'] == [0, False, 0] and di['lysAv'] == [0, False, 0] and di['igjen'][1] and di['igjen'][2] > 0, [di['safe'], di['lowTex'], di['lysAv'], di['igjen']])
        ly = di.get('lys', {})
        sjekk('gloria lyser opp rundt stearinlyset, blekkstrekene holder seg mørke, og den koster ett tegnekall', di.get('kand', 0) > 0 and ly.get('med', 0) - ly.get('uten', 0) >= 8 and ly.get('blekk', 0) >= 5 and ly.get('blekkMaks', 99) < 60 and ly['kall'][1] - ly['kall'][0] == 1, ly)
        fo = di.get('fokus', {})
        sjekk('det skarpe båndet i tilt-shift står der pasienten står, bredere på liggende skjerm', abs(fo.get('x', 0) - fo.get('P', 1)) < 1e-3 and fo.get('y') == .2 and fo.get('z') == .42, fo)
        mo, kn = di.get('morke', {}), di.get('knust', {})
        sjekk('gloriene slukner i mørket etter sjefene og kommer tilbake, og et lys som blir borte, blekner bort', mo.get('under', 99) < mo.get('for', 0) * .2 and abs(mo.get('etter', 0) - mo.get('for', 0)) < .05 * mo.get('for', 1) and 0 < kn.get('w1', 0) < 1 and kn.get('w2') == 0, [mo, kn])
        ne = di.get('nyEtasje', {})
        sjekk('gloriene frigjøres når etasjen rives, og den nye etasjen får sine egne', ne == {'kastet': True, 'ny': True, 'iScenen': True, 'gammel': False}, ne)
        await pg.screenshot(path='/tmp/e_diorama_pc.png')
        sjekk('ingen konsollfeil (diorama)', not pg.errs, pg.errs[:6])
        await pg.close()

        # telefon: middels som standard, med tilt-shift og et smalere skarpt bånd stående, og bredere liggende
        pg = await ny_side(b, viewport={'width': 390, 'height': 844}, has_touch=True, is_mobile=True, device_scale_factor=2)
        await pg.goto(URL3D); await pg.wait_for_timeout(2500)
        await pg.tap('#tNew'); await pg.wait_for_timeout(500); await pg.tap('[data-awk]'); await pg.wait_for_timeout(1500)
        TLF = """async () => { const G = MORBIDIUM, P = G.player, u = R.post.uniforms, bilder = n => new Promise(r => { const f = () => --n <= 0 ? r() : requestAnimationFrame(f); requestAnimationFrame(f); });
          if (G.state === 'play') { rolig(); P.hp = P.maxHp = 9999; P.invuln = 999; } await bilder(4); R.render(0);
          return { kval: D3.on && D3.kval(), tilt: u.uTilt.value, us: R.us ? [R.us.a.depthBuffer, R.us.b.depthBuffer] : null, fokus: [+u.uFokus.value.x.toFixed(4), +R.uvAv(P.x, .9, P.z).y.toFixed(4), u.uFokus.value.y], n: Glorie.pts.geometry.drawRange.count, tak: Glorie.tak(), coarse: R.coarse }; }"""
        st = await pg.evaluate(TLF)
        await pg.screenshot(path='/tmp/e_diorama_mobil.png')
        await pg.set_viewport_size({'width': 844, 'height': 390}); await pg.wait_for_timeout(600)
        lg = await pg.evaluate(TLF)
        sjekk('telefon: middels med tilt-shift (0,45) i mål uten dybdebuffer, og høyst 20 glorier', st['coarse'] and st['kval'] == 'middels' and st['tilt'] == .45 and st['us'] == [False, False] and 0 < st['n'] <= 20 and st['tak'] == 20, st)
        sjekk('telefon: det skarpe båndet følger pasienten, smalere stående (0,14) enn liggende (0,2)', abs(st['fokus'][0] - st['fokus'][1]) < 1e-3 and st['fokus'][2] == .14 and abs(lg['fokus'][0] - lg['fokus'][1]) < 1e-3 and lg['fokus'][2] == .2, [st['fokus'], lg['fokus']])
        sjekk('ingen konsollfeil (diorama på telefon)', not pg.errs, pg.errs[:6])
        # 40) Stort kart: ringen, M, pausen og håndkontrollen åpner det, M, Esc, B og Lukk lukker det, i kamp slår et klikk på ringen,
        #     tegnforklaringen viser det du har sett, lerretene frigjøres, og det får plass stående og liggende på telefon, i 3D og i alle slags etasjer
        ramme = "const ramme = n => new Promise(r => { const f = () => --n <= 0 ? r() : requestAnimationFrame(f); requestAnimationFrame(f); });"
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await pg.goto(URL); await pg.wait_for_timeout(2000); await pg.evaluate("() => localStorage.clear()")
        await start_lop(pg)
        await pg.wait_for_function("() => MORBIDIUM.state === 'play' && MORBIDIUM.time > .3", timeout=30000)
        ring = await pg.evaluate("() => { const r = document.getElementById('mapring'); return { rolle: r.getAttribute('role'), pe: getComputedStyle(r).pointerEvents, navn: r.getAttribute('aria-label'), rad: KONTROLLER.some(k => k[0] === 'Kartet'), tips: !!TIPS.kart }; }")
        sjekk('kartringen er en knapp (rolle, navn og pekerhendelser), og kartet står i kontrollene og tipsene', ring == {'rolle': 'button', 'pe': 'auto', 'navn': 'Kartet (M)', 'rad': True, 'tips': True}, ring)
        await pg.evaluate("() => rolig()")  # noen oppvåkninger begynner i kamp, og da er et klikk på ringen et slag
        await pg.click('#mapring')
        await pg.wait_for_function("() => MORBIDIUM.state === 'panel' && !!document.querySelector('#panel .kartark')", timeout=10000)
        k1 = await pg.evaluate("""() => { const c = document.getElementById('kCan'), p = document.getElementById('kPil'), l = parseFloat(p.style.left), t = parseFloat(p.style.top);
          return { w: c.width, h: c.height, pil: l >= 3 && t >= 3 && l <= parseFloat(c.style.width) + 3 && t <= parseFloat(c.style.height) + 3, fokus: document.activeElement.id, forste: Math.round(Kart.ms), gulv: !!Kart.gulvBilde() }; }""")
        await pg.screenshot(path='/tmp/e_kart_pc.png')
        await pg.keyboard.press('m')
        await pg.wait_for_function("() => MORBIDIUM.state === 'play'", timeout=20000)
        k1['frigjort'] = await pg.evaluate("() => { const c = document.getElementById('kCan'); return !!c && c.width === 0 && c.height === 0; }")
        sjekk('et klikk på ringen åpner kartet over det malte gulvet, med pila på pasienten, og M lukker det og frigjør lerretet', k1['w'] >= 360 and k1['h'] > 300 and k1['pil'] and k1['fokus'] == 'kLukk' and k1['gulv'] and k1['frigjort'], k1)
        await pg.keyboard.press('m')
        await pg.wait_for_function("() => MORBIDIUM.state === 'panel' && !!document.querySelector('#panel .kartark')", timeout=20000)
        await pg.keyboard.press('Escape')
        await pg.wait_for_function("() => MORBIDIUM.state === 'play'", timeout=20000)
        # tegnetiden: det beste av tre nye tegninger, så en annen nettleser som går samtidig ikke gir falsk feil
        tid = await pg.evaluate("() => { Kart.apne(); const ms = []; for (let i = 0; i < 3; i++) { Kart.tegn(); ms.push(Kart.ms); } closePanel(); return { beste: Math.round(Math.min(...ms)), forste: " + str(k1['forste']) + " }; }")
        sjekk('M åpner kartet, Esc lukker det, og kartet tegnes på under 60 ms', tid['beste'] < 60, tid)
        # i kamp: et klikk på ringen er et slag, og musa sikter gjennom den
        kamp = await pg.evaluate("() => { const G = MORBIDIUM; window.__md = 0; document.getElementById('game').addEventListener('mousedown', () => window.__md++); G.combat = { r: G.F.rooms[G.F.startId], wave: 0, t: 999 }; const r = document.getElementById('mapring').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }")
        await pg.click('#mapring'); await pg.wait_for_timeout(300)
        kamp.update(await pg.evaluate("() => { const G = MORBIDIUM, ut = { state: G.state, md: window.__md, mx: Input.mouse.x, my: Input.mouse.y }; G.combat = null; return ut; }"))
        sjekk('i kamp på PC åpner ikke et klikk på ringen kartet: det blir et slag, og musa sikter videre', kamp['state'] == 'play' and kamp['md'] == 1 and abs(kamp['mx'] - kamp['x']) < 3 and abs(kamp['my'] - kamp['y']) < 3, kamp)
        # fiender fra en hendelse låser ingen dører (G.combat er tom), men et klikk på ringen er et slag da også
        await pg.evaluate("() => { const P = MORBIDIUM.player; spawnEnemyBareTest('rotte', P.x + 2, P.z); }")
        await pg.click('#mapring'); await pg.wait_for_timeout(300)
        hf = await pg.evaluate("() => { const G = MORBIDIUM, ut = { state: G.state, md: window.__md, combat: !!G.combat }; if (G.state === 'panel') closePanel(); rolig(); return ut; }")
        sjekk('fiender fra en hendelse rundt pasienten: et klikk på ringen er et slag og ikke kartet', hf == {'state': 'play', 'md': 2, 'combat': False}, hf)
        # et annet panel som tar over mens kartet er oppe (drømmen begynner), frigjør lerretet også
        byttet = await pg.evaluate("() => { Kart.apne(); const c = document.getElementById('kCan'), for_ = c.width; openPause(); const ut = { for: for_, etter: c.width, pause: !!document.getElementById('pK') }; closePanel(); return ut; }")
        sjekk('kartet som byttes ut med et annet panel, frigjør lerretet', byttet['for'] >= 360 and byttet['etter'] == 0 and byttet['pause'], byttet)
        # fra pausen og tilbake
        await pg.keyboard.press('Escape'); await pg.wait_for_function("() => MORBIDIUM.state === 'panel' && !!document.getElementById('pK')", timeout=20000)
        await pg.click('#pK'); await pg.wait_for_timeout(200)
        pa = await pg.evaluate("() => !!document.querySelector('#panel .kartark')")
        await pg.keyboard.press('Escape'); await pg.wait_for_function("() => !!document.querySelector('#panel .clip')", timeout=20000)
        await pg.click('#panel [data-close]'); await pg.wait_for_function("() => MORBIDIUM.state === 'play'", timeout=20000)
        sjekk('Kartet i pausen åpner kartet, og Esc går tilbake til pausen', pa, pa)
        # håndkontroll: pil høyre (15) åpner, pil høyre igjen lukker ikke (den skal bla i menyene), B (1) lukker
        pad = await pg.evaluate("""async () => { """ + ramme + """ const G = MORBIDIUM, ut = {};
          const p = { id: 'testpad', index: 0, connected: true, mapping: 'standard', axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) };
          Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => [p] });
          const trykk = async i => { p.buttons[i].pressed = true; p.buttons[i].value = 1; await ramme(4); p.buttons[i].pressed = false; p.buttons[i].value = 0; await ramme(4); };
          await ramme(3); await trykk(15); ut.apnet = G.state === 'panel' && Kart.aapen(); ut.hint = (document.querySelector('.khint') || {}).textContent;
          await trykk(15); ut.blir = Kart.aapen(); await trykk(1); ut.lukket = G.state === 'play';
          await trykk(9); ut.pause = G.state === 'panel' && !!document.querySelector('#panel .clip'); await trykk(1); ut.pauseB = G.state === 'play';
          Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => [] }); await ramme(3); return ut; }""")
        sjekk('håndkontrollen: pil høyre åpner kartet, B lukker det (og pausen), og pil høyre lukker det ikke', pad == {'apnet': True, 'hint': 'B eller Start lukker kartet', 'blir': True, 'lukket': True, 'pause': True, 'pauseB': True}, pad)
        # journalen bytter ut alt med data-kart med bilder av kuriositeter; ringen og minikartet skal overleve den
        jr = await pg.evaluate("() => { openJournal('kuriositeter'); closeJournal(); openJournal(); closeJournal(); const m = document.getElementById('map'); return !!m && m.parentElement.id === 'mapring' && document.getElementById('mapring').parentElement.id === 'hud'; }")
        sjekk('minikartet og ringen står igjen etter journalen', jr, jr)
        # tegnforklaringen viser det du har sett: tjenestene med navn, overlegen uten navn før du har vært der
        leg = await pg.evaluate("""() => { const G = MORBIDIUM, F = G.F; Folge.kart('alt'); Kart.apne(); const L = [...document.querySelectorAll('.kleg li')].map(l => l.textContent), tj = F.rooms.filter(r => r.role === 'service');
          const ut = { tjenester: tj.every(r => L.some(t => t.startsWith(SERVICES[r.service].name))), sjef: L.some(t => t.startsWith('Overlegen')), du: L[0] === 'Du er her', ikoner: document.querySelectorAll('.kleg canvas').length === L.length, tall: document.querySelector('.ktall').textContent };
          closePanel(); return ut; }""")
        sjekk('tegnforklaringen: tjenestene med navn, overlegen uten navn før du har vært der, og hvor mye som er utforsket', leg['tjenester'] and leg['sjef'] and leg['du'] and leg['ikoner'] and 'utforsket' in leg['tall'], leg)
        # alle slags etasjer: Parken, Nattskogen, en drøm, «Enkel grafikk» og uten det malte gulvet
        et = await pg.evaluate("""async () => { const G = MORBIDIUM, vent = t => new Promise(r => setTimeout(r, t)), ut = {};
          const prov = navn => { Kart.apne(); ut[navn] = !!document.querySelector('#panel .kartark') && Kart.merker().L.length >= 1 && document.getElementById('kCan').width >= 360; closePanel(); };
          for (const d of [1, 5]) { startFloor(d, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } await vent(200); prov('etasje' + d); }
          G.run.dromVent = 3; startFloor(3, false); await vent(300); ut.drom = !!G.drom; G.seen.fill(1); Kart.apne(); ut.dor = [...document.querySelectorAll('.kleg li')].some(l => l.textContent.startsWith('Døra')) && document.querySelector('.kund').textContent.startsWith('Drømmen'); closePanel();
          for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); }
          G.meta.settings.simple = true; applySettings(); startFloor(2, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } await vent(200); ut.safe = R.safe; prov('enkel');
          G.meta.settings.simple = false; applySettings();
          const gb = Kart.gulvBilde; Kart.gulvBilde = () => null; prov('flatt'); Kart.gulvBilde = gb;
          return ut; }""")
        sjekk('kartet virker i Parken, Nattskogen, drømmen (med døra), med «Enkel grafikk» og uten det malte gulvet', et == {'etasje1': True, 'etasje5': True, 'drom': True, 'dor': True, 'safe': True, 'enkel': True, 'flatt': True}, et)
        sjekk('ingen konsollfeil (stort kart på PC)', not pg.errs, pg.errs[:6])
        await pg.close()
        # 3D: det malte gulvet ligger under et annet materiale, men kartet finner det
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await pg.goto(URL3D); await pg.wait_for_timeout(2000); await pg.evaluate("() => localStorage.clear()")
        await start_lop(pg, url=URL3D)
        await pg.wait_for_function("() => MORBIDIUM.state === 'play' && MORBIDIUM.time > .3", timeout=60000)
        d3 = await pg.evaluate("() => { Folge.kart('alt'); Kart.apne(); const ut = { d3: D3.on && D3.bygd, kart: !!document.querySelector('#panel .kartark'), gulv: !!Kart.gulvBilde() }; return ut; }")
        await pg.wait_for_timeout(300); await pg.screenshot(path='/tmp/e_kart_3d.png')
        await pg.evaluate("() => closePanel()")
        sjekk('kartet i 3D bruker det malte gulvet', d3 == {'d3': True, 'kart': True, 'gulv': True}, d3)
        sjekk('ingen konsollfeil (stort kart i 3D)', not pg.errs, pg.errs[:6])
        await pg.close()
        # telefon: trykk på ringen stående og liggende, snu telefonen med kartet oppe, og ingenting ruller
        UA_K = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        ctx = await b.new_context(viewport={'width': 390, 'height': 844}, has_touch=True, is_mobile=True, device_scale_factor=2, user_agent=UA_K)
        pg = await ctx.new_page()
        if THREE:
            await pg.route('**/three.min.js', lambda r: r.fulfill(path=THREE, content_type='application/javascript'))
            await pg.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
        pg.errs = []
        pg.on('pageerror', lambda e: pg.errs.append('PAGEERROR: ' + str(e)))
        pg.on('console', lambda m: pg.errs.append(m.type + ': ' + m.text) if m.type == 'error' else None)
        await pg.goto(URL); await pg.wait_for_timeout(2500); await pg.evaluate("() => localStorage.clear()")
        await pg.goto(URL); await pg.wait_for_timeout(2500)
        await pg.tap('#tNew'); await pg.wait_for_timeout(600); await pg.tap('[data-awk]')
        await pg.wait_for_function("() => MORBIDIUM.state === 'play' && MORBIDIUM.time > .3", timeout=30000)
        await pg.evaluate("() => { rolig(); Folge.kart('alt'); }")
        plass = """() => { const p = document.getElementById('panel'), a = document.getElementById('kartark'), r = a.getBoundingClientRect(), l = document.getElementById('kLukk').getBoundingClientRect();
          return { lag: a.className.replace('fit kartark paper', '').trim() || 'bred', rull: p.scrollHeight > p.clientHeight + 2 || p.scrollWidth > p.clientWidth + 2, inne: r.left >= -1 && r.top >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1, lukk: l.bottom <= innerHeight && l.width > 30, zoom: +a.style.zoom, lup: getComputedStyle(document.querySelector('#mapring .kluppe')).display, hint: !!document.querySelector('.khint') }; }"""
        await pg.tap('#mapring')
        await pg.wait_for_function("() => MORBIDIUM.state === 'panel' && !!document.querySelector('#panel .kartark')", timeout=10000); await pg.wait_for_timeout(300)
        st = await pg.evaluate(plass)
        await pg.screenshot(path='/tmp/e_kart_staende.png')
        sjekk('stående telefon: et trykk på ringen åpner kartet i smalt oppsett, alt får plass uten rulling, og uten tastehint', st['lag'] == 'smal' and not st['rull'] and st['inne'] and st['lukk'] and st['zoom'] >= .75 and st['lup'] == 'block' and not st['hint'], st)
        await pg.set_viewport_size({'width': 844, 'height': 390})
        await pg.wait_for_function("() => { const a = document.getElementById('kartark'); return !!a && a.classList.contains('lig'); }", timeout=20000); await pg.wait_for_timeout(300)
        lg = await pg.evaluate(plass)
        await pg.screenshot(path='/tmp/e_kart_liggende.png')
        await pg.tap('#kLukk')
        await pg.wait_for_function("() => MORBIDIUM.state === 'play'", timeout=20000)
        lg['frigjort'] = await pg.evaluate("() => document.getElementById('kCan').width === 0")
        await pg.tap('#mapring')
        await pg.wait_for_function("() => MORBIDIUM.state === 'panel' && !!document.querySelector('#panel .kartark')", timeout=10000); await pg.wait_for_timeout(300)
        lg['igjen'] = await pg.evaluate(plass)
        await pg.tap('#kLukk'); await pg.wait_for_function("() => MORBIDIUM.state === 'play'", timeout=20000)
        sjekk('telefonen snus med kartet oppe: liggende oppsett uten rulling, Lukk frigjør lerretet, og ringen kan trykkes på liggende også', lg['lag'] == 'lig' and not lg['rull'] and lg['inne'] and lg['lukk'] and not lg['hint'] and lg['frigjort'] and lg['igjen']['lag'] == 'lig' and not lg['igjen']['rull'], lg)
        sjekk('ingen konsollfeil (stort kart på telefon)', not pg.errs, pg.errs[:6])
        await ctx.close()

        # 41) Kontroller i menyene: A, B, retningene, LB og RB på tittelen, i innleggelsen, pausen, innstillingene, journalen, butikken
        #     og dødsskjermen, piltastene i menyene, tastene i tekstene etter enheten, berøringsknappene skjules, og kontrollen på plass 1 styrer
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await pg.add_init_script("""(() => {
          window.__pad = { id: 'Testkontroll (STANDARD GAMEPAD)', index: 0, connected: true, mapping: 'standard', timestamp: 0, axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) };
          window.__pads = () => [window.__pad];
          Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => window.__pads() });
          window.__ramme = n => new Promise(r => { const f = () => --n <= 0 ? r() : requestAnimationFrame(f); requestAnimationFrame(f); });
          window.__trykk = async (i, ned = 3, opp = 3) => { const k = window.__pad.buttons[i]; k.pressed = true; k.value = 1; await window.__ramme(ned); k.pressed = false; k.value = 0; await window.__ramme(opp); };
        })()""")
        await pg.goto(URL); await pg.wait_for_timeout(2000); await pg.evaluate("() => localStorage.clear()")
        await pg.goto(URL)
        await pg.wait_for_function("() => window.MORBIDIUM && MORBIDIUM.state === 'title' && document.activeElement && document.activeElement.id === 'tNew'", timeout=30000)
        t1 = await pg.evaluate("""async () => { await __trykk(0); await __ramme(2); const f = document.activeElement, cs = getComputedStyle(f);
          return { inntak: MORBIDIUM.state === 'panel' && !!document.querySelector('#panel .intake'), fokus: f.hasAttribute('data-awk'), ring: cs.outlineStyle === 'solid' && parseFloat(cs.outlineWidth) >= 2.5, pad: document.body.classList.contains('pad'), enhet: Input.lastDevice }; }""")
        sjekk('håndkontrollen på tittelen: A trykker Ny pasient, og innleggelsen har fokus med synlig ring', t1 == {'inntak': True, 'fokus': True, 'ring': True, 'pad': True, 'enhet': 'pad'}, t1)
        await pg.evaluate("() => __trykk(0)")
        await pg.wait_for_function("() => MORBIDIUM.state === 'play' && MORBIDIUM.time > .3", timeout=30000)
        hud = await pg.evaluate("async () => { rolig(); await __ramme(3); return [...document.querySelectorAll('#cards .acard .k')].map(e => e.textContent).join(' '); }")
        sjekk('A i innleggelsen legger inn pasienten, og evnekortene viser LB RB LT RT', hud == 'LB RB LT RT', hud)
        # pausen og innstillingene: Start, pil ned til Innstillinger, A, RB bytter fane, pil ned til spaken, pil høyre og venstre endrer den
        ps = await pg.evaluate("""async () => { const G = MORBIDIUM, ut = {}; await __trykk(9); await __ramme(2);
          ut.pause = G.state === 'panel' && !!document.querySelector('#panel .clip'); ut.forste = document.activeElement.hasAttribute('data-close');
          await __trykk(13); ut.ned = document.activeElement.id;
          for (let i = 0; i < 8 && document.activeElement.id !== 'pS'; i++) await __trykk(13);
          await __trykk(0); await __ramme(2); ut.inn = !!document.getElementById('settings') && document.activeElement.dataset.tab === 'lyd';
          await __trykk(5); await __ramme(2); const on = document.querySelector('.ktab.on'); ut.fane = on.dataset.tab; ut.fanefokus = document.activeElement === on;
          await __trykk(13); const sp = document.activeElement, k = sp.dataset.s, v0 = G.meta.settings[k]; ut.spak = k;
          await __trykk(15); ut.opp = +(G.meta.settings[k] - v0).toFixed(3);
          await __trykk(14); ut.ned2 = +(G.meta.settings[k] - v0).toFixed(3);
          await __trykk(13); ut.neste = document.activeElement.dataset.s; await __trykk(12); await __trykk(12); ut.oppTilFane = document.activeElement.dataset.tab;
          return ut; }""")
        await pg.screenshot(path='/tmp/e_pad_meny.png')
        ps.update(await pg.evaluate("""async () => { const G = MORBIDIUM, ut = {}; await __trykk(4); await __ramme(2); ut.lb = document.querySelector('.ktab.on').dataset.tab;
          await __trykk(1); await __ramme(2); ut.tilbake = !!document.querySelector('#panel .clip'); await __trykk(1); await __ramme(2); ut.ute = G.state; return ut; }"""))
        sjekk('pausen og innstillingene med håndkontroll: pil ned, A, RB og LB bytter fane, spaken endres med pil høyre og venstre, B går tilbake',
              ps == {'pause': True, 'forste': True, 'ned': 'pJ', 'inn': True, 'fane': 'bilde', 'fanefokus': True, 'spak': 'kamera', 'opp': .05, 'ned2': 0, 'neste': 'shake', 'oppTilFane': 'bilde', 'lb': 'lyd', 'tilbake': True, 'ute': 'play'}, ps)
        # journalen: Select åpner, A velger et kort, retningene flytter fokus, A på en tom plass flytter kortet dit og så til lomma, RB og LB bytter fane, B slipper kortet og lukker
        jr = await pg.evaluate("""async () => { const G = MORBIDIUM, run = G.run, ut = {};
          run.slots = [null, null, null, null]; run.reserve = []; giveCard('due', true); const fra = run.slots.findIndex(Boolean), til = run.slots.findIndex(c => !c);
          await __trykk(8); await __ramme(2); ut.aapen = G.state === 'journal' && document.activeElement.matches('.jcard[data-ref]');
          document.querySelector('.jcard[data-ref="s"][data-i="' + fra + '"]').focus(); await __trykk(0); ut.valgt = !!G.jsel && !!document.querySelector('#journal .jcard.sel');
          const sett = new Set(); for (const d of [15, 13, 14, 12]) { await __trykk(d); if (document.getElementById('journal').contains(document.activeElement)) sett.add(document.activeElement); }
          ut.flyttet = sett.size >= 2;
          document.querySelector('.slot.empty[data-slot="' + til + '"]').focus(); await __trykk(0);
          const f = document.activeElement; ut.flytt = !run.slots[fra] && !!run.slots[til] && run.slots[til].id === 'due'; ut.fokus = f.classList.contains('jcard') && f.dataset.ref === 's' && +f.dataset.i === til;
          f.focus(); await __trykk(0); document.querySelector('.pocket [data-lomme]').focus(); await __trykk(0);
          ut.lomme = run.reserve.length === 1 && run.reserve[0].id === 'due' && !run.slots.some(Boolean) && !!document.activeElement.dataset.lomme;
          await __trykk(5); ut.rb = G.jtab; await __trykk(4); await __trykk(4); ut.lb = G.jtab; await __trykk(5);
          document.querySelector('.jcard[data-ref]').focus(); await __trykk(0); const v = !!G.jsel; await __trykk(1); ut.slipp = v && !G.jsel && G.state === 'journal';
          ut.knapp = document.getElementById('jClose').textContent; await __trykk(1); await __ramme(2); ut.lukket = G.state === 'play'; return ut; }""")
        sjekk('journalen med håndkontroll: A og A flytter et kort til en tom plass, retningene, RB og LB, og B slipper kortet og lukker',
              jr == {'aapen': True, 'valgt': True, 'flyttet': True, 'flytt': True, 'fokus': True, 'lomme': True, 'rb': 'diagnoser', 'lb': 'utstyr', 'slipp': True, 'knapp': 'Lukk journalen (B)', 'lukket': True}, jr)
        # butikken: knappen sier B, og B lukker
        sh = await pg.evaluate("""async () => { const G = MORBIDIUM; openService('kafeteria'); await __ramme(2); const ut = { knapp: document.querySelector('#panel [data-close]').textContent, fokus: document.activeElement.classList.contains('offer') };
          await __trykk(1); await __ramme(2); ut.ute = G.state; return ut; }""")
        sjekk('butikken med håndkontroll: Gå (B), første vare har fokus, og B lukker', sh == {'knapp': 'Gå (B)', 'fokus': True, 'ute': 'play'}, sh)
        # piltastene i pausen, og tekstene går tilbake til tastaturet
        await pg.keyboard.press('Escape'); await pg.wait_for_function("() => MORBIDIUM.state === 'panel' && !!document.querySelector('#panel .clip')", timeout=20000)
        await pg.wait_for_timeout(200)
        await pg.keyboard.press('ArrowDown'); await pg.keyboard.press('ArrowDown')
        kb = await pg.evaluate("() => ({ fokus: document.activeElement.id, pad: document.body.classList.contains('pad') })")
        await pg.keyboard.press('Escape'); await pg.wait_for_function("() => MORBIDIUM.state === 'play'", timeout=20000)
        kb['kort'] = await pg.evaluate("async () => { await __ramme(3); return [...document.querySelectorAll('#cards .acard .k')].map(e => e.textContent).join(' '); }")
        sjekk('piltastene flytter fokus i pausen, og tastaturet tar bort ringen og gir tallene tilbake', kb == {'fokus': 'pJ', 'pad': False, 'kort': '1 2 3 4'}, kb)
        # berøringsknappene skjules når håndkontrollen brukes (telefon speilet til TV med kontroll), og en kontroll på plass 1 styrer pasienten
        mv = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, ut = {};
          Input.touch.active = true; document.getElementById('touch').classList.remove('hidden'); document.body.classList.add('touch'); Input.enhet('touch');
          __pad.axes[0] = .9; await __ramme(2); __pad.axes[0] = 0; await __ramme(2);
          ut.touch = { skjult: document.getElementById('touch').classList.contains('hidden'), body: document.body.classList.contains('touch'), aktiv: Input.touch.active, pad: document.body.classList.contains('pad') };
          const r = G.F.rooms[G.F.startId]; P.x = r.x + r.w / 2; P.z = r.z + r.h / 2; __pad.index = 1; window.__pads = () => [null, __pad]; __pad.axes[0] = 1;
          const x0 = P.x, t0 = G.time; for (let i = 0; i < 600 && G.time < t0 + .4; i++) await __ramme(1); __pad.axes[0] = 0;
          ut.dx = P.x - x0 > .5; ut.index = Input.gp.index;
          window.__pads = () => [{ id: 'noe annet', index: 0, connected: true, mapping: '', timestamp: 0, axes: [0, 0], buttons: [] }, __pad]; await __ramme(2); ut.standard = Input.gp.index === 1 && Input.gp.mapping === 'standard';
          window.__pads = () => []; dispatchEvent(new Event('gamepaddisconnected')); await __ramme(2);
          ut.frakoblet = !Input.gp.connected && Input.lastDevice === 'kb' && !document.body.classList.contains('pad');
          __pad.index = 0; window.__pads = () => [__pad]; return ut; }""")
        sjekk('håndkontrollen skjuler berøringsknappene, en kontroll på plass 1 styrer pasienten, standardoppsettet velges, og frakobling rydder',
              mv == {'touch': {'skjult': True, 'body': False, 'aktiv': False, 'pad': True}, 'dx': True, 'index': 1, 'standard': True, 'frakoblet': True}, mv)
        # døden: en A som holdes gjennom dødsfallet trykker ikke på Ny pasient det første halve sekundet, så gjør A det
        await pg.evaluate("() => { __pad.buttons[0].pressed = true; __pad.buttons[0].value = 1; const P = MORBIDIUM.player; P.invuln = 0; P.iframe = 0; hurt(P, 9999, { type: 'kultist' }); }")
        await pg.wait_for_function("() => MORBIDIUM.state === 'dead' && !!document.getElementById('dNew')", timeout=30000)
        dd = await pg.evaluate("""async () => { const G = MORBIDIUM, ut = { vakt: MenyNav.ro > 0, fokus: document.activeElement.id };
          __pad.buttons[0].pressed = false; __pad.buttons[0].value = 0; await __ramme(1); await __trykk(0, 1, 1); ut.blokkert = G.state === 'dead';
          await __trykk(15); ut.hoyre = document.activeElement.id; await __trykk(14); ut.venstre = document.activeElement.id;
          for (let i = 0; i < 400 && MenyNav.ro > 0; i++) await __ramme(1);
          await __trykk(0); await __ramme(2); ut.inntak = G.state === 'panel' && !!document.querySelector('#panel .intake'); return ut; }""")
        await pg.evaluate("() => __trykk(0)")
        await pg.wait_for_function("() => MORBIDIUM.state === 'play' && MORBIDIUM.time > .2", timeout=30000)
        dd['nytt'] = await pg.evaluate("() => MORBIDIUM.player.alive && MORBIDIUM.player.hp > 0")
        sjekk('døden med håndkontroll: A holdt gjennom dødsfallet trykker ikke, retningene flytter, og A på Ny pasient legger inn en ny pasient',
              dd == {'vakt': True, 'fokus': 'dNew', 'blokkert': True, 'hoyre': 'dTitle', 'venstre': 'dNew', 'inntak': True, 'nytt': True}, dd)
        sjekk('ingen konsollfeil (kontroller i menyene)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 42) TV-modus: nettleseren i en Samsung-TV kjennes igjen, HUD-en holder seg innenfor margene uten overlapp og står midt på,
        #     middels kvalitet, tilbaketasten på fjernkontrollen og historikken, fullskjerm, håndboka, linja om kontrolleren, rapporten og innstillingen
        TVUA = 'Mozilla/5.0 (SMART-TV; LINUX; Tizen 8.0) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/7.0 Chrome/120.0.6099.5 TV Safari/537.36'
        TV_INIT = """(() => {
          window.__pad = { id: 'Testkontroll (STANDARD GAMEPAD)', index: 0, connected: true, mapping: 'standard', timestamp: 0, axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) };
          window.__pads = () => [];
          Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => window.__pads() });
          window.__ramme = n => new Promise(r => { const f = () => --n <= 0 ? r() : requestAnimationFrame(f); requestAnimationFrame(f); });
          window.__vent = async (f, n = 400) => { for (let i = 0; i < n && !f(); i++) await window.__ramme(1); return !!f(); };
          // fullskjerm uten ekte fullskjerm: nettleseren i testen kan ikke, men knappen skal be om det og teksten følge med
          window.__fs = null; const bytt = el => { window.__fs = el; setTimeout(() => document.dispatchEvent(new Event('fullscreenchange', { bubbles: true })), 0); return Promise.resolve(); };
          Object.defineProperty(Document.prototype, 'fullscreenEnabled', { configurable: true, get: () => true });
          Object.defineProperty(Document.prototype, 'fullscreenElement', { configurable: true, get: () => window.__fs });
          Element.prototype.requestFullscreen = function () { return bytt(this); }; Document.prototype.exitFullscreen = function () { return bytt(null); };
          // tilbaketasten på fjernkontrollen: Samsung sender keyCode 10009 og key XF86Back, uten code
          window.__tilbake = () => { for (const t of ['keydown', 'keyup']) { const e = new KeyboardEvent(t, { key: 'XF86Back', bubbles: true, cancelable: true }); Object.defineProperty(e, 'keyCode', { get: () => 10009 }); document.body.dispatchEvent(e); } };
        })()"""
        HUD_TV = """() => { const W = innerWidth, H = innerHeight, r = id => { const e = document.getElementById(id); if (!e || getComputedStyle(e).display === 'none') return null; const b = e.getBoundingClientRect(); return b.width ? [b.left, b.top, b.right, b.bottom] : null; };
          const navn = ['badge', 'roomsign', 'tools', 'cards', 'weapon', 'cons', 'mapring', 'tips'], k = navn.map(r), ute = [], par = [];
          const over = (a, c) => a[0] < c[2] - 1 && c[0] < a[2] - 1 && a[1] < c[3] - 1 && c[1] < a[3] - 1;
          k.forEach((a, i) => { if (a && (a[0] < W * .045 - 1 || a[1] < H * .045 - 1 || a[2] > W * .955 + 1 || a[3] > H * .955 + 1)) ute.push(navn[i]); });
          for (let i = 0; i < k.length; i++) for (let j = i + 1; j < k.length; j++) if (k[i] && k[j] && over(k[i], k[j])) par.push(navn[i] + '-' + navn[j]);
          const c = k[3], s = k[1]; return { ute, par, alle: k.filter(Boolean).length, kortMidt: Math.round((c[0] + c[2]) / 2 - W / 2), skiltMidt: Math.round((s[0] + s[2]) / 2 - W / 2), ui: getComputedStyle(document.documentElement).getPropertyValue('--ui').trim() }; }"""
        pg = await ny_side(b, viewport={'width': 1920, 'height': 1080}, user_agent=TVUA)
        await pg.add_init_script(TV_INIT)
        await pg.goto(URL)
        await pg.wait_for_function("() => window.MORBIDIUM && MORBIDIUM.state === 'title' && document.activeElement && document.activeElement.id === 'tNew'", timeout=30000)
        t = await pg.evaluate("""async () => { const cs = getComputedStyle(document.documentElement), ut = { tv: R.tv, body: document.body.classList.contains('tv'), ui: cs.getPropertyValue('--ui').trim(), kval: D3.kval(), zoom: getComputedStyle(document.querySelector('#title .tmenu')).zoom };
          await new Promise(r => setTimeout(r, 700)); ut.tittelFelle = !!(history.state && history.state.morbidium);
          // pilene på fjernkontrollen kan komme uten code, bare med key
          document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })); ut.pil = document.activeElement.id;
          const f = document.querySelector('#title [data-fs]'); ut.fs = f ? f.textContent : ''; f.click(); ut.fsBedt = window.__fs === document.documentElement;
          await __vent(() => f.textContent === 'Avslutt fullskjerm', 100); ut.fsTekst = f.textContent; f.click(); await __vent(() => f.textContent === 'Fullskjerm', 100); ut.fsAv = !window.__fs && f.textContent === 'Fullskjerm';
          return ut; }""")
        sjekk('TV-modus: nettleseren i Samsung-TV-en kjennes igjen, større HUD og tittel, middels kvalitet, og ingen felle i historikken på tittelen',
              t['tv'] and t['body'] and t['ui'] == '1.4' and t['kval'] == 'middels' and abs(float(t['zoom']) - 1.4) < .01 and not t['tittelFelle'], t)
        sjekk('TV-modus: pilene på fjernkontrollen uten code flytter i menyen, og Fullskjerm på tittelen slås av og på med teksten etter',
              t['pil'] == 'tHelp' and t['fs'] == 'Fullskjerm' and t['fsBedt'] and t['fsTekst'] == 'Avslutt fullskjerm' and t['fsAv'], t)
        await pg.click('#tNew'); await pg.wait_for_timeout(500); await pg.click('[data-awk]')
        await pg.wait_for_function("() => MORBIDIUM.state === 'play' && MORBIDIUM.time > .3", timeout=30000)
        await pg.evaluate("() => { rolig(); MORBIDIUM.run.patient.name = 'Alf Nygaard'; MORBIDIUM.meta.tips = {}; MORBIDIUM.meta.settings.tips = true; Tips.vis('sjef'); }")
        await pg.wait_for_function("() => { const t = document.getElementById('tips'); return t && t.classList.contains('inn') && getComputedStyle(t).opacity === '1'; }", timeout=20000)
        h = await pg.evaluate(HUD_TV)
        await pg.screenshot(path='/tmp/e_tv_hud.png')
        # berøringsknappene vises ikke på TV, selv om noe skulle sende en berøring
        h['touch'] = await pg.evaluate("() => { Input.touch.active = true; const t = document.getElementById('touch'); t.classList.remove('hidden'); const d = getComputedStyle(t).display; t.classList.add('hidden'); Input.touch.active = false; return d; }")
        # største skjermtekst: taket på 1,6 holder kortene klar av apparatet
        await pg.evaluate("() => { const s = MORBIDIUM.meta.settings; s.ui = 1.3; applySettings(); }"); await pg.wait_for_timeout(300)
        h2 = await pg.evaluate(HUD_TV)
        await pg.evaluate("() => { const s = MORBIDIUM.meta.settings; s.ui = 1; applySettings(); }")
        sjekk('TV-modus: HUD-en holder seg innenfor 4,5 prosent av kanten uten overlapp, kort og skilt står midt på, og berøringsknappene er skjult',
              not h['ute'] and not h['par'] and h['alle'] == 8 and abs(h['kortMidt']) <= 3 and abs(h['skiltMidt']) <= 3 and h['touch'] == 'none' and h['ui'] == '1.4', h)
        sjekk('TV-modus med største skjermtekst: taket på 1,6, og fortsatt innenfor margene uten overlapp', h2['ui'] == '1.6' and not h2['ute'] and not h2['par'], h2)
        # tilbaketasten og historikken: et ekstra steg i spillet, tilbake åpner og lukker pausen, og tasten og steget sammen gjør det bare én gang
        tb = await pg.evaluate("""async () => { const G = MORBIDIUM, ut = {}, felle = () => !!(history.state && history.state.morbidium);
          ut.felle = await __vent(felle, 200);
          __tilbake(); ut.tastPause = await __vent(() => G.state === 'panel' && !!document.getElementById('pS')); ut.fsPause = !!document.querySelector('#panel .pmenu [data-fs]');
          ut.zoom = +document.querySelector('#panel .fit').style.zoom;
          __tilbake(); ut.tastLukk = await __vent(() => G.state === 'play');
          // en nettleser som bare går tilbake i historikken, uten tastetrykk: tiden siden forrige tast nullstilles, ellers ville en rask maskin
          // tatt steget for en del av tasten over (samme trykk)
          Input.tilbakeT = -1e9; history.back(); ut.histPause = await __vent(() => G.state === 'panel' && !!document.getElementById('pS')); ut.igjen = await __vent(felle, 200);
          Input.tilbakeT = -1e9; history.back(); ut.histLukk = await __vent(() => G.state === 'play'); ut.igjen2 = await __vent(felle, 200);
          // Samsung kan sende både tastetrykket og steget tilbake i historikken for samme trykk: da skal pausen åpnes, ikke åpnes og lukkes
          const n0 = TvTilbake.n; __tilbake(); history.back(); ut.tatt = await __vent(() => TvTilbake.n > n0 && G.state === 'panel', 600); await __ramme(10);
          ut.begge = G.state === 'panel' && !!document.getElementById('pS'); ut.igjen3 = await __vent(felle, 200);
          return ut; }""")
        sjekk('TV-modus: tilbake på fjernkontrollen åpner og lukker pausen, også som steg i historikken, og steget legges inn igjen',
              tb == {'felle': True, 'tastPause': True, 'fsPause': True, 'zoom': tb['zoom'], 'tastLukk': True, 'histPause': True, 'igjen': True, 'histLukk': True, 'igjen2': True, 'tatt': True, 'begge': True, 'igjen3': True} and tb['zoom'] > 1.15, tb)
        # testpanelet over pausen (?testmodus på TV-en): ett trykk på tilbake, som tast og som steg i historikken, lukker bare testpanelet
        tp = await pg.evaluate("""async () => { const G = MORBIDIUM, ut = {}; Testmodus.apne('lyd'); await __ramme(3); ut.apen = Testmodus.apen;
          const n0 = TvTilbake.n; __tilbake(); history.back(); ut.tatt = await __vent(() => TvTilbake.n > n0, 600); await __ramme(10);
          ut.lukket = !Testmodus.apen; ut.pause = G.state === 'panel' && !!document.getElementById('pS'); ut.igjen = await __vent(() => !!(history.state && history.state.morbidium), 200); return ut; }""")
        sjekk('TV-modus: tilbake med testpanelet over pausen lukker bare testpanelet, også når steget i historikken kommer i tillegg',
              tp == {'apen': True, 'tatt': True, 'lukket': True, 'pause': True, 'igjen': True}, tp)
        # rapporten og linja om kontrolleren i Innstillinger, Styring (kontrolleren dukker først opp etter et knappetrykk)
        rp = await pg.evaluate("""async () => { const ut = {}; ut.uten = Testmodus.enhet(); openSettings(false, null, 'styring'); await __ramme(2); ut.ingen = document.getElementById('kStatus').textContent;
          window.__pads = () => [window.__pad]; __pad.buttons[3].pressed = true; await __ramme(3); __pad.buttons[3].pressed = false; await __vent(() => document.getElementById('kStatus').textContent.startsWith('Kontroller funnet'), 100);
          ut.funnet = document.getElementById('kStatus').textContent; ut.med = Testmodus.enhet(); closePanel(); await __ramme(2);
          openSettings(false, null, 'spill'); await __ramme(2); ut.fane = document.querySelector('[data-s="tv"]').parentNode.querySelector('em').textContent; closePanel();
          openHandbook({}, 1, 1); await __ramme(2); ut.sider = hbSider(HANDBOK[1]); ut.side = document.querySelector('.hpage h2').textContent + ': ' + (document.querySelector('.htext .hunder') || {}).textContent; return ut; }""")
        rp['plass'] = await pg.evaluate(HB_PLASS)
        await pg.screenshot(path='/tmp/e_tv_handbok.png')
        sjekk('TV-modus: testrapporten nevner Samsung-TV-en, kontrolleren, TV-modus og fullskjerm, og Styring sier om kontrolleren er funnet',
              'Samsung-TV (Tizen 8.0, Chromium 120)' in rp['uten'] and 'ingen kontroller funnet' in rp['uten'] and 'TV-modus på' in rp['uten'] and 'fullskjerm nei' in rp['uten']
              and rp['ingen'].startswith('Ingen kontroller funnet') and rp['funnet'] == 'Kontroller funnet: Testkontroll (STANDARD GAMEPAD).' and 'kontroller Testkontroll (STANDARD GAMEPAD) (standard oppsett, 17 knapper, 4 akser)' in rp['med'] and rp['fane'] == 'automatisk (på)', rp)
        sjekk('håndboka: Styring har en side til, «Spille på TV», som får plass', rp['sider'] == 2 and rp['side'] == 'Styring: Spille på TV' and rp['plass'], rp)
        # journalen er større på TV, men innenfor margene
        await pg.evaluate("() => { closePanel(); openJournal(); }"); await pg.wait_for_timeout(600)
        jr = await pg.evaluate("() => { const r = document.querySelector('#journal .jwrap').getBoundingClientRect(), m = /scale\\(([\\d.]+)\\)/.exec(document.querySelector('#journal .jwrap').style.transform); closeJournal(); return { s: m ? +m[1] : 0, inne: r.left >= innerWidth * .045 - 1 && r.top >= innerHeight * .045 - 1 && r.right <= innerWidth * .955 + 1 && r.bottom <= innerHeight * .955 + 1 }; }")
        # innstillingen: av (2) slår TV-modus av også i TV-en, og automatisk (0) slår den på igjen
        av = await pg.evaluate("() => { const s = MORBIDIUM.meta.settings; s.tv = 2; applySettings(); const ut = { tv: R.tv, body: document.body.classList.contains('tv'), ui: getComputedStyle(document.documentElement).getPropertyValue('--ui').trim(), kval: D3.kval() }; s.tv = 0; applySettings(); ut.igjen = R.tv && document.body.classList.contains('tv'); return ut; }")
        sjekk('TV-modus: journalen skaleres innenfor margene, og innstillingen «av» slår TV-modus av (automatisk på igjen)',
              jr['inne'] and jr['s'] > 1 and av == {'tv': False, 'body': False, 'ui': '1', 'kval': 'hoy', 'igjen': True}, [jr, av])
        # tilbake til tittelen: steget som er igjen, tar tilbake med seg ut av spillet, slik tilbake på tittelen skal,
        # også når tasten kommer fram i tillegg (Samsung). Uten tastetrykk sjekkes det i 3D-delen under
        await pg.evaluate("() => showTitle()"); await pg.wait_for_timeout(300)
        sjekk('ingen konsollfeil (TV-modus)', not pg.errs, pg.errs[:6])
        await pg.evaluate("() => { __tilbake(); history.back(); }")
        for i in range(100):
            if pg.url == 'about:blank': break
            await pg.wait_for_timeout(100)
        sjekk('TV-modus: tilbake på tittelen går ut av spillet, også når steget fra spillet er igjen og tasten kommer fram', pg.url == 'about:blank', pg.url)
        await pg.close()
        # vanlig nettleser: TV-modus er av, ingen felle i historikken, lappen om TV-modus med håndkontroll på stor skjerm, og «på» slår den på
        pg = await ny_side(b, viewport={'width': 1920, 'height': 1080})
        await pg.add_init_script(TV_INIT)
        await start_lop(pg)
        pc = await pg.evaluate("""async () => { const G = MORBIDIUM, ut = { tv: R.tv, body: document.body.classList.contains('tv'), kval: D3.kval() }; await new Promise(r => setTimeout(r, 700)); ut.felle = !!(history.state && history.state.morbidium);
          rolig(); G.meta.tips = {}; G.meta.settings.tips = true; Input.enhet('pad'); const t0 = G.time; await __vent(() => G.meta.tips.tv || G.time > t0 + 2, 600); ut.tips = !!G.meta.tips.tv;
          Input.enhet('kb'); G.meta.settings.tv = 1; applySettings(); ut.paa = R.tv && document.body.classList.contains('tv') && D3.kval() === 'middels'; G.meta.settings.tv = 0; applySettings(); return ut; }""")
        sjekk('vanlig nettleser: TV-modus er av uten felle i historikken, lappen om TV-modus kommer med håndkontroll på stor skjerm, og «på» slår den på',
              pc == {'tv': False, 'body': False, 'kval': 'hoy', 'felle': False, 'tips': True, 'paa': True}, pc)
        sjekk('ingen konsollfeil (TV-modus av)', not pg.errs, pg.errs[:6])
        await pg.close()
        # 3D og «Enkel grafikk» på TV-en: 3D starter på middels, og enkel grafikk slår det av uten feil
        pg = await ny_side(b, viewport={'width': 1920, 'height': 1080}, user_agent=TVUA)
        await pg.add_init_script(TV_INIT)
        await pg.goto(URL3D); await pg.wait_for_function("() => window.MORBIDIUM && MORBIDIUM.state === 'title'", timeout=30000)
        # klikk i siden i stedet for med musa: 3D i 1920 x 1080 med programvaregrafikk tegner så sakte at et museklikk kan gå ut på tid når maskinen har mye å gjøre
        await pg.evaluate("() => document.getElementById('tNew').click()"); await pg.wait_for_selector('[data-awk]', timeout=30000); await pg.evaluate("() => document.querySelector('[data-awk]').click()")
        await pg.wait_for_function("() => MORBIDIUM.state === 'play' && MORBIDIUM.time > .2", timeout=60000)
        d3 = await pg.evaluate("""async () => { const ut = { on: D3.on, bygd: D3.bygd, kval: D3.kval(), skygge: D3.Q().skygge };
          const s = MORBIDIUM.meta.settings; s.simple = true; applySettings(); await __ramme(5); ut.enkel = !D3.on && R.safe && document.body.classList.contains('tv'); return ut; }""")
        await pg.screenshot(path='/tmp/e_tv_enkel.png')
        sjekk('TV-modus i 3D: starter på middels, og «Enkel grafikk» virker', d3 == {'on': True, 'bygd': True, 'kval': 'middels', 'skygge': 1024, 'enkel': True}, d3)
        sjekk('ingen konsollfeil (TV-modus i 3D)', not pg.errs, pg.errs[:6])
        # nettleserens egen tilbakeknapp (ingen tast): på tittelen tar steget fra spillet tilbake med seg ut av spillet
        await pg.wait_for_function("() => TvTilbake.fanget", timeout=10000)
        await pg.evaluate("() => { showTitle(); history.back(); }")
        for i in range(100):
            if pg.url == 'about:blank': break
            await pg.wait_for_timeout(100)
        sjekk('TV-modus: tilbake uten tastetrykk på tittelen går ut av spillet, også når steget fra spillet er igjen', pg.url == 'about:blank', pg.url)
        await pg.close()

        await b.close()
    print('\n' + ('Alt gikk bra.' if not feil else 'Feilet: ' + ', '.join(feil)))
    sys.exit(1 if feil else 0)

asyncio.run(main())
