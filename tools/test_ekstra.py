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

# et vanlig klikk først; svarer ikke siden (en 3D-side i programvaregrafikk på en travel maskin kan bruke sekunder per bilde),
# trykkes knappen fra siden selv, så testen prøver spillet og ikke hvor rask maskinen er. Klikket kan ha gått gjennom selv om svaret
# kom for sent: da er knappen skjult (tittelen eller innleggelsen er borte), og den trykkes ikke en gang til
async def klikk(pg, sel):
    try: await pg.click(sel, timeout=15000); return
    except Exception: pass
    await pg.wait_for_selector(sel, state='attached', timeout=30000)
    await pg.evaluate("s => { const e = document.querySelector(s), r = e.getBoundingClientRect(); if (r.width && r.height && !e.closest('.hidden')) e.click(); }", sel)

async def start_lop(pg, awk=None, url=None):
    await pg.goto(url or URL); await pg.wait_for_timeout(2500)
    await klikk(pg, '#tNew'); await pg.wait_for_timeout(500)
    sel = f'[data-awk="{awk}"]' if awk else '[data-awk]'
    if awk and not await pg.query_selector(sel): sel = '[data-awk]'
    await klikk(pg, sel); await pg.wait_for_timeout(1500)

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

        # 22) UI-settet fra ChatGPT: uten bilder tegner CSS-en som før, med bilder byttes rammer, ringer, hjerter og ikoner inn uten at boksene endrer størrelse.
        #     Alle UI-bildene er levert nå, så de tas ut av SPRITES mens sjekken går, og legges tilbake etterpå
        await start_lop(pg)
        ui = await pg.evaluate("""async () => { rolig(); const a = {}, px = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
          const P = MORBIDIUM.player; P.cds[1] = 4.6; (P.cdMax || (P.cdMax = [1, 1, 1, 1]))[1] = 8; await new Promise(r => setTimeout(r, 500));
          const cd = document.querySelector('#ac1 .cd'); a.nedtelling = cd && !cd.classList.contains('hidden') ? cd.textContent : null; a.sektor = cd ? +cd.style.getPropertyValue('--p') : -1;
          const ekte = {}; for (const k of Object.keys(SPRITES)) if (k.startsWith('ui_')) { ekte[k] = SPRITES[k]; delete SPRITES[k]; }
          a.uten = brukUIsett().length === 0 && !document.body.classList.contains('ui-sett'); a.kodehjerte = !hjerteHtml(1, c => '<i style="color:' + c + '"></i>').includes('uihjerte');
          const boks = () => { const r = document.getElementById('plate').getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; }, f0 = boks();
          for (const k of ['ui_panel', 'ui_kort', 'ui_ring_kart', 'ui_hjerte_full', 'ui_hjerte_halv', 'ui_ikon_pause']) SPRITES[k] = px;
          a.halvtSett = hjerteHtml(1, c => '').includes('uihjerte'); SPRITES.ui_hjerte_tom = px;
          a.brukt = brukUIsett(); a.css = (document.getElementById('uiSett') || { textContent: '' }).textContent.includes('border-image'); a.ikon = !!document.querySelector('#bPause img');
          a.hjerte = hjerteHtml(.5, c => '').includes('uihjerte'); const f1 = boks(); a.boks = Math.abs(f1[0] - f0[0]) <= 2 && Math.abs(f1[1] - f0[1]) <= 2;
          for (const k of Object.keys(SPRITES)) if (k.startsWith('ui_')) delete SPRITES[k]; Object.assign(SPRITES, ekte); brukUIsett(); // de leverte bildene tilbake
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
        forvent = await pg.evaluate("() => [8, 9].reduce((a, k) => a + Math.ceil(HANDBOK[k].indeks.length / 2), 0)")  # vokser når nye fiender kommer i indeksen
        sjekk('fiendeindeksen får plass på smal skjerm, to kort per side', len(smal) == forvent and forvent >= 16 and all(smal), (forvent, smal))
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
        ef = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), spill = async (t, maks = 60000) => { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < t && performance.now() - t0 < maks) await vent(50); }, u = R.post.uniforms, ut = {};
          rolig(); P.hp = P.maxHp = 9999;
          // etterbehandlingen: alt slår inn neste bilde og dør ut av seg selv
          R.sjokk(P.x, P.z, 1.2); R.zoomStot(P.x, P.z, .8); R.negativ(.1); R.fx.lyn = 1; await vent(120);
          ut.paa = u.uSjokk.value[0].w > .1 && u.uZoom.value.z > .1 && u.uNeg.value > .5 && u.uLyn.value > .1;
          const avNaa = () => u.uSjokk.value[0].w === 0 && u.uZoom.value.z === 0 && u.uNeg.value === 0 && u.uLyn.value === 0 && R.sjokkL.length === 0, ge = G.time; for (let i = 0; i < 150 && !avNaa() && G.time - ge < 4; i++) await vent(100); ut.av = avNaa();
          // uten forvrengning og uten glimt blir de borte
          R.distortOn = false; R.flashOn = false; R.sjokk(P.x, P.z, 1); R.zoomStot(P.x, P.z, 1); R.negativ(); R.fx.lyn = 1; await vent(120);
          ut.skaansom = u.uSjokk.value[0].w === 0 && u.uZoom.value.z === 0 && u.uNeg.value === 0 && u.uLyn.value === 0; R.distortOn = true; R.flashOn = true; await vent(900);
          // glød: alle typene lages, og tingene med ild, damp eller lys får sine når etasjen bygges
          ut.typer = Object.keys(GLOD_TYPER).filter(t => { const E = Glod.lag(P.x, .3, P.z, t, { liv: 1 }); return E && E.pts.parent; }); ut.antall = Object.keys(GLOD_TYPER).length;
          const sett = new Set(); let kilder = 0, dekket = 0;
          for (let d = 1; d <= 6; d++) { startFloor(d, false); await vent(80); for (const E of Glod.liste) sett.add(E.type); for (const o of G.props) if (['baal', 'vedovn', 'kjele', 'komfyr', 'gryte', 'candles', 'kjempeplante', 'lyktestolpe'].includes(o.kind)) { kilder++; if (Glod.liste.some(E => E.eier === o)) dekket++; } ut['glod' + d] = Glod.liste.every(E => !E.eier || G.props.includes(E.eier) || G.puddles.includes(E.eier)); }
          ut.sett = [...sett]; ut.kilder = kilder; ut.dekket = dekket;
          // addPuddle slår sammen med en lilla pytt i nærheten og beholder den lengste levetiden, så testpytten får kort liv selv,
          // og vi venter til både pytten og gløden er borte (høyst 8 s spilltid), i stedet for en fast ventetid
          const p = addPuddle(P.x, P.z, 'morb', 1, 3); ut.morbPytt = !!(p && p.glod && p.glod.pts); if (p) p.life = Math.min(p.life, 3);
          { const gm0 = G.time, rt0 = performance.now(); while (p && (G.puddles.includes(p) || Glod.liste.includes(p.glod)) && G.time - gm0 < 8 && performance.now() - rt0 < 120000) await vent(50);
            ut.morbBorte = !!p && !G.puddles.includes(p) && !Glod.liste.includes(p.glod); if (!ut.morbBorte) ut.morbInfo = { spilltid: +(G.time - gm0).toFixed(2), liv: p && +p.life.toFixed(2), iPytter: !!p && G.puddles.includes(p), iGlod: !!p && Glod.liste.includes(p.glod), state: G.state }; }
          R.safe = true; ut.enkel = Glod.lag(P.x, 0, P.z, 'gnister') === null && Lyn.slag(0, 0, 0, 1, 0, 1) === null; R.safe = false;
          // lynet: varsel på bakken, så nedslag som treffer fienden der, og deg om du står der
          startFloor(1, false); rolig(); P.hp = P.maxHp = 9999; const r = G.F.rooms.find(r => r.role === 'combat') || G.F.rooms[0]; P.x = r.x + r.w / 2; P.z = r.z + r.h / 2;
          const s1 = freeSpot(P.x + 3, P.z, 3), e = spawnEnemy('pleier', s1.x, s1.z, false, 1); e.hp = e.max = 500; e.stun = 99; e.mArmor = 1; // av og til blir den en pansret mester (Oppskrift.mester) og tar da 34 og ikke 45
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
        sjekk('alle typene glød (gnister, glør, damp, røyk, sporer, Morbidium, møll, kombo og de som kommer til) lages på skjermkortet', len(ef['typer']) == ef['antall'] >= 8, ef['typer'])
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
        ko = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), spill = async (t, maks = 60000) => { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < t && performance.now() - t0 < maks) await vent(50); }, T = Kombo.tall, ut = {};
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
          Dybde.stovT = 0; R.shake(.8); ut.stov = Dybde.stov.length > 0; await spill(3.2); ut.stovBorte = Dybde.stov.length === 0;
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
          // tre runder: de to første fyller bufrene (bilder som lages første gang noe dukker opp, og det varierer litt), den tredje skal ikke legge igjen noe
          await runde(); await runde(); const m1 = { t: info.textures, g: info.geometries }; await runde(); const m2 = { t: info.textures, g: info.geometries };
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

        # 43) Etter flettingen av sporene: lista over lyskilder vokser ikke med etasjene, B (rull) i kampen lukker ikke et panel som
        #     akkurat åpnet seg, og merkene for flaska og apparatet viser knappen for det du spiller med
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await pg.add_init_script("""(() => {
          window.__pad = { id: 'Testkontroll (STANDARD GAMEPAD)', index: 0, connected: true, mapping: 'standard', timestamp: 0, axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) };
          Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => [window.__pad] });
          window.__ramme = n => new Promise(r => { const f = () => --n <= 0 ? r() : requestAnimationFrame(f); requestAnimationFrame(f); });
          window.__trykk = async (i, ned = 3, opp = 3) => { const k = window.__pad.buttons[i]; k.pressed = true; k.value = 1; await window.__ramme(ned); k.pressed = false; k.value = 0; await window.__ramme(opp); };
        })()""")
        await pg.goto(URL); await pg.wait_for_timeout(2000); await pg.evaluate("() => localStorage.clear()")
        await start_lop(pg)
        kl = await pg.evaluate("""async () => { const G = MORBIDIUM, vent = t => new Promise(r => setTimeout(r, t)), n = [];
          for (const d of [1, 2, 3, 4, 5, 6, 1, 2, 3]) { startFloor(d, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } await vent(80); n.push(R.kilder.length); }
          return { n, festet: R.kilder.every(k => k.parent && (k.parent === R.lscene || !!k.parent.parent)) }; }""")
        sjekk('lista over lyskilder vokser ikke når etasjene bygges på nytt, og alle i den henger i scenen', abs(kl['n'][6] - kl['n'][0]) <= 12 and max(kl['n']) < 300 and kl['festet'], kl)
        bv = await pg.evaluate("""async () => { const G = MORBIDIUM, ut = {}; rolig(); await __ramme(3);
          // B som rull i spillet, og et panel som dukker opp rett etterpå
          // B holdes inne idet panelet åpnes (som når den hamres på i kampen), så testen ikke avhenger av hvor fort nettleseren tegner
          const k = __pad.buttons[1]; k.pressed = true; k.value = 1; await __ramme(2); openPanel('<div class="paper" style="padding:20px"><button data-close>Lukk</button></div>'); await __ramme(1);
          k.pressed = false; k.value = 0; await __ramme(1); await __trykk(1, 1, 1); ut.bliver = G.state === 'panel';
          for (let i = 0; i < 120 && MenyNav.roB > 0; i++) await __ramme(1);
          await __trykk(1); await __ramme(2); ut.lukker = G.state === 'play';
          return ut; }""")
        sjekk('B som ble trykket for å rulle, lukker ikke et panel som akkurat åpnet seg, men gjør det etter et halvt sekund', bv == {'bliver': True, 'lukker': True}, bv)
        mk = await pg.evaluate("""async () => { await __trykk(3); await __ramme(3); return { pad: document.getElementById('consk').textContent, apparat: document.querySelector('#akt .n').textContent }; }""")
        await pg.keyboard.press('KeyW'); await pg.wait_for_timeout(400)
        mk.update(await pg.evaluate("() => ({ kb: document.getElementById('consk').textContent, apparatKb: document.querySelector('#akt .n').textContent })"))
        sjekk('merkene for flaska og apparatet viser Ned og Opp med håndkontroll og F og V med tastatur', mk == {'pad': 'Ned', 'apparat': 'Opp', 'kb': 'F', 'apparatKb': 'V'}, mk)
        # funnene fra gjennomgangen: gloria til en ting som dør mens den blekner, krasjer ikke; et panel som er åpent når etasjen byttes,
        # lukkes; og lappen for å snakke ligger over kortene også med TV-modus og stor skjermtekst
        gj = await pg.evaluate("""async () => { const G = MORBIDIUM, vent = t => new Promise(r => setTimeout(r, t)), ut = {};
          let o = null; for (const d of [1, 2, 3, 4, 5, 6]) { startFloor(d, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } await vent(150); o = G.props.find(p => GLORIE_KILDER[p.kind] && p.g); if (o) break; }
          ut.ting = !!o; if (o) { Glorie.tick(1 / 60); o.alive = false; for (const k of Glorie.K) if (k.eier === o) { k.w = 1; delete k.c; }
            try { for (let i = 0; i < 4; i++) Glorie.tick(1 / 60); ut.glorie = 'ok'; } catch (e) { ut.glorie = String(e); } }
          // kartet åpent idet etasjen byttes (som når drømmen blekner): panelet lukkes og lerretet frigjøres
          rolig(); Kart.apne(); await vent(200); ut.kart = Kart.aapen(); startFloor(G.depth, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } await vent(150);
          const c = document.getElementById('kCan'); ut.lukket = G.state === 'play' && document.getElementById('panel').classList.contains('hidden') && (!c || c.width === 0);
          // TV-modus: lappen over kortene
          const s = G.meta.settings, tv0 = s.tv; s.tv = 1; applySettings(); await vent(300); const pr = document.getElementById('prompt'); pr.innerHTML = '<kbd>Y</kbd> Snakk'; pr.classList.remove('hidden');
          // målt med en gang: spillet skjuler lappen i neste bilde når det ikke er noe å snakke med
          const a = pr.getBoundingClientRect(), b = document.getElementById('cards').getBoundingClientRect(); ut.lapp = { over: a.height > 10 && a.bottom <= b.top + 1, a: [Math.round(a.top), Math.round(a.bottom)], kort: Math.round(b.top) };
          pr.classList.add('hidden'); s.tv = tv0; applySettings(); return ut; }""")
        sjekk('gloria til en ting som dør mens den blekner, krasjer ikke spillet', gj['ting'] and gj['glorie'] == 'ok', gj)
        sjekk('et panel som er åpent når etasjen byttes, lukkes, og kartets lerret frigjøres', gj['kart'] and gj['lukket'], gj)
        sjekk('lappen for å snakke ligger over kortene i TV-modus', gj['lapp']['over'], gj['lapp'])
        sjekk('ingen konsollfeil (etter flettingen)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 44) Varsler og slag uten lekkasje
        #     Varsler som går av, avbrytes eller ryddes bort når etasjen byttes, og hugg legger ikke igjen geometri på skjermkortet,
        #     shaderne bygges ikke på nytt for hvert angrep, og R.kastTele får vite hvorfor varselet kastes.
        #     Før rettingen: +1500 geometrier for 300 varsler, +101 for 20 avbrutte og +60 for 60 hugg.
        VL_HJELP = """const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)),
            spill = async (t, maks = 30000) => { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < t && performance.now() - t0 < maks) await vent(50); },
            // til ingen varsler eller hugg er igjen: spillet må gå, men taket i sanntid er romslig, for mange varsler samtidig er tungt i programvaregrafikk
            tomt = async () => { const t0 = performance.now(); while ((G.tele.length || VFX.slashes.length) && performance.now() - t0 < 120000) await vent(50); await spill(.1); },
            ramme = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))),
            info = R.renderer.info.memory, former = ['circle', 'rect', 'cone'], buer = [1.2, 1.6, 2.2, Math.PI * 2 - .01], ut = {};
          // blekkvarslene (del 46) lager ingen geometri per varsel, så her måles den gamle tegningen, som enkel grafikk og overløpet fortsatt bruker
          Blekk.av = true; rolig(); P.hp = P.maxHp = 1e6; P.invuln = 999; await spill(.3);
          // oppvarming: ett varsel av hver form og ett hugg per bue, så det som lages én gang (ringene til huggene og shaderne), er laget
          for (let i = 0; i < 4; i++) { addTele(former[i % 3], { x: P.x + 2, z: P.z, r: 1.2, w: .6, len: 3, a: i, arc: 1.4 }, .2, null, null); slashFx(P.x, P.z, i, 1.4, buer[i], i % 2 === 0); }
          await tomt();"""
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg)
        vl = await pg.evaluate("""async () => { """ + VL_HJELP + """
          // shaderne telles rett på WebGL: et materiale som kastes, tar shaderen med seg når ingen andre bruker den, og da bygges den på nytt neste gang
          const gl = R.renderer.getContext(), lp = gl.linkProgram; let lenk = 0; gl.linkProgram = function (p) { lenk++; return lp.call(this, p); };
          // 300 varsler som går av: sirkel, rektangel og kjegle om hverandre. Toppen viser at de faktisk kom på skjermkortet
          const g0 = info.geometries;
          for (let i = 0; i < 300; i++) { const a = i * .37; addTele(former[i % 3], { x: P.x + Math.sin(a) * 2, z: P.z + Math.cos(a) * 2, r: 1 + (i % 5) * .3, w: .6, len: 4, a, arc: 1.4, color: [0xff4a22, 0x9ad0e0, 0xb36be0][i % 3] }, .3, null, null); }
          await ramme(); const topp = info.geometries - g0; await tomt(); await spill(.5);
          ut.fyr = { topp, dg: info.geometries - g0, igjen: G.tele.length };
          // 20 varsler på én eier, som så stanses: de går ikke av og frigjøres
          const g1 = info.geometries, eier = { alive: true, stun: 0, sleep: 0 }; let fyrt = 0;
          for (let i = 0; i < 20; i++) addTele(former[i % 3], { x: P.x + 1, z: P.z + (i % 4) * .5, r: 1.2, w: .6, len: 3, a: i, arc: 1.2 }, 5, () => fyrt++, eier);
          await ramme(); const midt = info.geometries - g1; cancelTeles(eier); await spill(.3);
          ut.avbrutt = { midt, dg: info.geometries - g1, igjen: G.tele.length, eier: eier.teles.length, fyrt };
          // 60 hugg: ringen deles av alle hugg med samme bue, og materialene brukes om igjen
          const g2 = info.geometries;
          for (let i = 0; i < 60; i++) { slashFx(P.x + (i % 3) - 1, P.z, i * .3, 1 + (i % 5) * .4, buer[i % 4], i % 2 === 0); if (i % 10 === 9) await ramme(); }
          await tomt(); ut.hugg = { dg: info.geometries - g2, igjen: VFX.slashes.length };
          // ringen er like stor som før: indre radius 0,68 r, ytre r, buen rundet til 0,05 (helt rundt som før) og midt foran
          slashFx(P.x, P.z, 0, 2, 1.62, false); slashFx(P.x, P.z, 1, 3, 1.6, false); slashFx(P.x, P.z, 2, 3.8, Math.PI * 2 - .01, true);
          const S = VFX.slashes.slice(-3), maal = s => { const q = s.m.geometry.parameters, k = s.m.scale.x; return [q.innerRadius * k, q.outerRadius * k, q.thetaLength, q.thetaStart + q.thetaLength / 2].map(v => +v.toFixed(3)); };
          ut.maal = { a: maal(S[0]), b: maal(S[1]), c: maal(S[2]), delt: S[0].m.geometry === S[1].m.geometry }; await tomt();
          // hugg og varsler én og én, hvert ferdig før det neste kommer: ingen shader bygges på nytt
          lenk = 0;
          for (let i = 0; i < 8; i++) { slashFx(P.x, P.z, i, 1.5, buer[i % 4], i % 2 === 0); await tomt(); }
          for (let i = 0; i < 6; i++) { addTele(former[i % 3], { x: P.x + 2, z: P.z, r: 1.3, w: .6, len: 3, a: i, arc: 1.4, color: 0x9ad0e0 }, .2, null, null); await tomt(); }
          ut.lenk = lenk;
          // hvorfor varselet kastes: 'fyr' når angrepet går av, 'avbryt' når eieren er stanset eller stoppes, og 'rydd' når etasjen byttes
          const hvorfor = [], _k = R.kastTele; R.kastTele = function (g, how) { hvorfor.push(how); return _k.apply(this, arguments); };
          const e1 = { alive: true, stun: 0, sleep: 0 }, e2 = { alive: true, stun: 0, sleep: 0 }, e3 = { alive: true, stun: 0, sleep: 0 }, gikk = [];
          addTele('circle', { x: P.x + 2, z: P.z, r: 1 }, .2, () => gikk.push(1), e1); addTele('circle', { x: P.x - 2, z: P.z, r: 1 }, .2, () => gikk.push(2), e2); e2.stun = 5;
          addTele('rect', { x: P.x, z: P.z + 1, a: 0, w: .6, len: 3 }, 5, () => gikk.push(3), e3); await ramme(); cancelTeles(e3); await tomt();
          ut.hvorfor = { liste: hvorfor.slice().sort(), gikk }; hvorfor.length = 0;
          // etasjen byttes med varsler og hugg i lufta: alt tas ut, og geometrien til varselet frigjøres
          const t = addTele('circle', { x: P.x, z: P.z + 2, r: 1.5 }, 5, null, null); for (let i = 0; i < 5; i++) slashFx(P.x, P.z, i, 1.5, 1.6, true); await ramme();
          let n = 0, kastet = 0; t.mesh.traverse(o => { if (o.geometry) { n++; o.geometry.addEventListener('dispose', () => kastet++); } });
          startFloor(G.depth, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } await vent(200);
          ut.rydd = { hvorfor: hvorfor.slice(), n, kastet, ute: !t.mesh.parent, tele: G.tele.length, hugg: VFX.slashes.length };
          R.kastTele = _k; gl.linkProgram = lp;
          return ut; }""")
        sjekk('300 varsler som går av, legger ikke igjen geometri på skjermkortet', vl['fyr']['topp'] >= 1000 and vl['fyr']['dg'] <= 2 and vl['fyr']['igjen'] == 0, vl['fyr'])
        sjekk('20 varsler på en eier som stanses, går ikke av og legger ikke igjen geometri', vl['avbrutt']['midt'] >= 60 and vl['avbrutt']['dg'] <= 2 and vl['avbrutt']['igjen'] == 0 and vl['avbrutt']['eier'] == 0 and vl['avbrutt']['fyrt'] == 0, vl['avbrutt'])
        naer = lambda a, b: len(a) == len(b) and all(abs(x - y) < .002 for x, y in zip(a, b))
        m = vl['maal']
        sjekk('60 hugg legger høyst igjen to geometrier, og ringen deles og er like stor som før', vl['hugg']['dg'] <= 2 and vl['hugg']['igjen'] == 0 and m['delt'] and naer(m['a'], [1.36, 2, 1.6, -1.571]) and naer(m['b'], [2.04, 3, 1.6, -1.571]) and naer(m['c'], [2.584, 3.8, 6.273, -1.571]), {'hugg': vl['hugg'], 'maal': m})
        sjekk('shaderne til varsler og hugg bygges ikke på nytt for hvert angrep', vl['lenk'] <= 2, vl['lenk'])
        r_ = vl['rydd']
        sjekk('varselet kastes med fyr, avbryt (stanset eier og cancelTeles) og rydd når etasjen byttes, og bare det som går av, treffer', vl['hvorfor'] == {'liste': ['avbryt', 'avbryt', 'fyr'], 'gikk': [1]} and 'rydd' in r_['hvorfor'] and r_['n'] == 4 and r_['kastet'] == 4 and r_['ute'] and r_['tele'] == 0 and r_['hugg'] == 0, {'hvorfor': vl['hvorfor'], 'rydd': r_})
        sjekk('ingen konsollfeil (varsler og hugg i 2D)', not pg.errs, pg.errs[:6])
        await pg.close()
        # én runde i 3D
        pg = await ny_side(b, viewport={'width': 960, 'height': 540})
        await start_lop(pg, url=URL3D)
        v3 = await pg.evaluate("""async () => { """ + VL_HJELP + """
          ut.d3 = D3.on; const g0 = info.geometries;
          for (let i = 0; i < 60; i++) { const a = i * .41; addTele(former[i % 3], { x: P.x + Math.sin(a) * 2, z: P.z + Math.cos(a) * 2, r: 1 + (i % 4) * .3, w: .6, len: 4, a, arc: 1.4 }, .4, null, null); if (i % 3 === 0) slashFx(P.x, P.z, a, 1.6, buer[i % 4], i % 2 === 0); }
          await ramme(); ut.topp = info.geometries - g0; await tomt(); await spill(.5); ut.dg = info.geometries - g0;
          return ut; }""")
        sjekk('3D: 60 varsler og 20 hugg legger ikke igjen geometri', v3['d3'] and v3['topp'] >= 200 and v3['dg'] <= 2, v3)
        sjekk('ingen konsollfeil (varsler og hugg i 3D)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 45) Tekster og stempler
        #     Flytende tekster legger seg ikke oppå hverandre eller over snakkebobler (IKKE I DAG, BONK og bom i 6.png), sju like ord
        #     blir ett med ×7, «bom» forsvinner når den perfekte unnvikelsen har sitt eget ord, høyst tre store ord lever samtidig,
        #     og det store stempelet, kombostempelet og lappen står under hverandre og i kø. PC (1280x720) og liggende telefon (844x390).
        HJELP45 = """const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), ramme = n => new Promise(r => { const f = () => --n <= 0 ? r() : requestAnimationFrame(f); requestAnimationFrame(f); }), ut = {};
          const rute = e => { const b = e.getBoundingClientRect(); return { s: e.id || e.textContent, x0: b.left, y0: b.top, x1: b.right, y1: b.bottom }; };
          const tekster = () => [...document.querySelectorAll('#fx .dmg')].filter(e => getComputedStyle(e).display !== 'none').map(rute);
          const kryss = L => { const p = []; for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) { const a = L[i], c = L[j]; if (a.x0 < c.x1 - 1 && c.x0 < a.x1 - 1 && a.y0 < c.y1 - 1 && c.y0 < a.y1 - 1) p.push(a.s + ' / ' + c.s); } return p; };
          const inni = L => L.every(a => a.x0 >= -1 && a.y0 >= -1 && a.x1 <= innerWidth + 1 && a.y1 <= innerHeight + 1), kort = L => L.map(a => [a.s, Math.round(a.x0), Math.round(a.y0), Math.round(a.x1), Math.round(a.y1)]);
          const klar = async () => { rolig(); G.meta.settings.tips = false; P.hp = P.maxHp = 9999; P.roll = P.iframe = P.invuln = 0; const r = G.F.rooms.find(r => r.role === 'combat') || G.F.rooms[0]; P.x = r.x + r.w / 2; P.z = r.z + r.h / 2; await ramme(4); FX.clear(); };"""
        TRE45 = """async () => { """ + HJELP45 + """
          await klar(); FX.text(P.x, 2.7, P.z, 'IKKE I DAG', 'crit', 4); FX.text(P.x + .3, 2.6, P.z, 'BONK', 'crit', 4); FX.text(P.x, 1.6, P.z, 'bom', 'info', 4);
          await ramme(20); const L = tekster(); return { n: L.length, kryss: kryss(L), inni: inni(L), transform: [...document.querySelectorAll('#fx .dmg')].every(e => e.style.transform.startsWith('translate3d') && !e.style.left), L: kort(L) }; }"""
        TEKST45 = """async () => { """ + HJELP45 + """
          await klar(); ut.tre = await (""" + TRE45 + """)();
          // sju AVSLÅTT på ett bilde blir én tekst
          FX.clear(); for (let i = 0; i < 7; i++) FX.text(P.x + (i % 3) * .2, 1.6, P.z, 'AVSLÅTT', 'stamp', 1);
          await ramme(2); ut.sju = [...document.querySelectorAll('#fx .dmg')].filter(e => e.textContent.startsWith('AVSLÅTT')).map(e => e.textContent);
          // perfekt unnvikelse: ordet til kunngjøreren, og ingen «bom» fra den samme unnvikelsen
          FX.clear(); const n0 = Kombo.tall.perfekt, PERF = ['PÅ HÅRET', 'UNNSLUPPET', 'IKKE I DAG', 'FOR SENT, DOKTOR'];
          Kombo.perfektT = 0; P.invuln = 0; P.roll = .3; P.iframe = .3; hurt(P, 3, { type: 'test' }); await ramme(2);
          let ord = [...document.querySelectorAll('#fx .dmg')].map(e => e.textContent); ut.perfekt = { ord, kjort: Kombo.tall.perfekt === n0 + 1, bom: ord.some(s => s.startsWith('bom')), ordet: ord.some(s => PERF.includes(s)) };
          // mens kunngjøreren hviler (2,2 s), er «bom» det eneste ordet, og da blir det stående
          P.invuln = 0; P.roll = .3; P.iframe = .3; hurt(P, 3, { type: 'test' }); await ramme(1); ut.perfekt.bomIgjen = [...document.querySelectorAll('#fx .dmg')].some(e => e.textContent.startsWith('bom')); P.roll = P.iframe = 0;
          // høyst tre store ord: de to eldste av fem blekner og blir borte, de tre nyeste står
          FX.clear(); for (let i = 0; i < 5; i++) FX.text(P.x - 3 + i * 1.5, 2.4, P.z + (i % 2) * 2.5, 'ORD ' + i, 'crit', 4);
          for (let i = 0; i < 90 && document.querySelectorAll('#fx .dmg.crit').length > 3; i++) await ramme(1);
          ut.tak = [...document.querySelectorAll('#fx .dmg.crit')].map(e => e.textContent);
          // tall som er skjult (Vis tall av), tar ikke plass fra en info-tekst på samme sted
          FX.clear(); document.body.classList.add('uten-tall'); FX.text(P.x, 1.6, P.z, '12', '', 3); FX.text(P.x, 1.6, P.z, 'Benektet', 'info', 3); await ramme(3);
          const inf = FX.items.find(it => it.str === 'Benektet'); ut.utenTall = !!inf && Math.abs(inf.mx) < 1 && Math.abs(inf.my) < 1; document.body.classList.remove('uten-tall');
          // en tekst legger seg ikke over en snakkeboble
          FX.clear(); FX.bubble(P, 'Jeg har det helt fint, takk.', 4); FX.text(P.x, P.bubbleH, P.z, 'HER', 'crit', 4); await ramme(8);
          const bob = [...document.querySelectorAll('#fx .bubble')].map(rute), her = tekster().filter(a => a.s === 'HER'); ut.boble = { kryss: kryss(bob.concat(her)), n: bob.length + her.length };
          FX.clear(); return ut; }"""
        STEMPEL45 = """async () => { """ + HJELP45 + """
          const $ = id => document.getElementById(id), k = $('kstempel'), b = $('bigstamp'), t = $('toast'), borte = async () => { for (let i = 0; i < 120 && (b.classList.contains('on') || k.classList.contains('on') || Stempel.ko.length); i++) await vent(50); };
          await klar(); await borte();
          // alle tre på en gang: det store stempelet, kombostempelet og lappen står under hverandre (målt når kombostempelet har landet)
          stampBig('RYDDET', 'Rommet er friskmeldt'); Kombo.stempel('KIRURGISK', '20 treff på rad'); toast('Test', 'Lappen'); ut.lappStraks = t.textContent === 'TestLappen';
          for (let i = 0; i < 80; i++) { if (k.getAnimations().every(a => a.currentTime >= 350) && !b.getAnimations().length) break; await vent(25); }
          const S = [t, k, b].map(rute), kt = $('cards').getBoundingClientRect().top; ut.tre = { kryss: kryss(S), inni: inni(S), lav: t.classList.contains('lav'), overKort: S.every(a => a.y1 <= kt + 1), kortTopp: Math.round(kt), S: kort(S) };
          // køen: RYDDET står, DIAGNOSE venter til RYDDET har stått i 0,7 sekunder
          await borte(); const t0 = performance.now(); stampBig('RYDDET'); stampBig('DIAGNOSE', 'Hypokondri'); const straks = b.textContent;
          for (let i = 0; i < 400 && !b.textContent.startsWith('DIAGNOSE'); i++) await vent(20);
          const t1 = performance.now(), diag = b.textContent; for (let i = 0; i < 400 && b.classList.contains('on'); i++) await vent(20);
          ut.ko = { straks, diag, ryddet: Math.round(t1 - t0), diagnose: Math.round(performance.now() - t1) };
          // like stempler hoppes over, og høyst tre venter
          await borte(); stampBig('A'); stampBig('B'); stampBig('B'); stampBig('C'); stampBig('A'); stampBig('D'); stampBig('E'); ut.koen = Stempel.ko.map(q => q[0]);
          await borte(); toast('Uten stempel', ''); ut.lappOppe = !t.classList.contains('lav') && !t.style.top;
          return ut; }"""
        UA45 = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        for navn, kw in (('PC', {'viewport': {'width': 1280, 'height': 720}}), ('liggende telefon', {'viewport': {'width': 844, 'height': 390}, 'has_touch': True, 'is_mobile': True, 'device_scale_factor': 2, 'user_agent': UA45})):
            pg = await ny_side(b, **kw)
            await start_lop(pg)
            tk = await pg.evaluate(TEKST45)
            tre = tk['tre']
            sjekk(f'{navn}: IKKE I DAG, BONK og bom på samme sted legger seg ved siden av hverandre, innenfor skjermen og med transform', tre['n'] == 3 and not tre['kryss'] and tre['inni'] and tre['transform'], tre)
            sjekk(f'{navn}: sju AVSLÅTT på ett bilde blir én tekst, «AVSLÅTT ×7»', tk['sju'] == ['AVSLÅTT ×7'], tk['sju'])
            sjekk(f'{navn}: perfekt unnvikelse viser kunngjørerens ord uten «bom», og «bom» står når kunngjøreren hviler', tk['perfekt']['kjort'] and tk['perfekt']['ordet'] and not tk['perfekt']['bom'] and tk['perfekt']['bomIgjen'], tk['perfekt'])
            sjekk(f'{navn}: høyst tre store ord samtidig, og det er de nyeste som står', tk['tak'] == ['ORD 2', 'ORD 3', 'ORD 4'], tk['tak'])
            sjekk(f'{navn}: skjulte tall tar ikke plass, og en tekst legger seg ikke over en snakkeboble', tk['utenTall'] and tk['boble']['n'] == 2 and not tk['boble']['kryss'], (tk['utenTall'], tk['boble']))
            if navn == 'PC':
                await pg.evaluate(TRE45); await pg.screenshot(path='/tmp/e_45_tekst.png')
            st = await pg.evaluate(STEMPEL45)
            sjekk(f'{navn}: det store stempelet, kombostempelet og lappen står under hverandre uten å overlappe og over evnekortene, og lappen får teksten med en gang', st['lappStraks'] and not st['tre']['kryss'] and st['tre']['inni'] and st['tre']['lav'] and st['tre']['overKort'], st['tre'])
            ko = st['ko']
            sjekk(f'{navn}: et nytt stort stempel venter til det forrige har stått i 0,7 sekunder, og står selv minst like lenge', ko['straks'] == 'RYDDET' and ko['diag'] == 'DIAGNOSEHypokondri' and 680 <= ko['ryddet'] < 8000 and ko['diagnose'] >= 700, ko)
            sjekk(f'{navn}: like stempler hoppes over, høyst tre venter, og lappen er tilbake oppe når stemplene er borte', st['koen'] == ['B', 'C', 'D'] and st['lappOppe'], (st['koen'], st['lappOppe']))
            sjekk(f'ingen konsollfeil (tekster og stempler, {navn})', not pg.errs, pg.errs[:6])
            await pg.close()
        # og en gang i 3D
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg, url=URL3D)
        tre = await pg.evaluate(TRE45)
        sjekk('3D: IKKE I DAG, BONK og bom legger seg ved siden av hverandre', tre['n'] == 3 and not tre['kryss'] and tre['inni'], tre)
        sjekk('ingen konsollfeil (tekster og stempler i 3D)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 46) Blekkvarsel
        #     Alle angrepsvarsler tegnes av én blekkshader (46_blekk.js): 30 varsler koster høyst to tegnekall (varslene og lysplatene),
        #     ingen geometri per varsel, plassene er frie etter bruk og etter etasjebytte, formen i shaderen er den samme som inShape,
        #     sonen er tegnet inne i sirkelen og ikke utenfor, varselet følger eieren, etterbildet og den grå oppløsningen varer som de skal,
        #     alle fargene i koden har en skadetype som leses på mørkt gulv, og enkel grafikk tegner på den gamle måten.
        import re as _re, io as _io
        from PIL import Image as _Img
        import urllib.parse as _up
        _src = pathlib.Path(_up.unquote(URL3D[len('file://'):])).parent.parent / 'src'
        farger = {}
        for _f in sorted(_src.glob('*.js')):
            for _m in _re.findall(r'color: 0x([0-9a-fA-F]+)', _f.read_text(encoding='utf-8')): farger.setdefault(int(_m, 16), set()).add(_f.name)
        # nye fiender i spor C (49 og 50) kan bruke gjettingen fra fargetonen, resten skal stå i TELE_FARGE
        maa_sta = [c for c, fs in farger.items() if any(not (f.startswith('49_') or f.startswith('50_')) for f in fs)]
        BK_HJELP = """const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)),
            spill = async (t, maks = 30000) => { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < t && performance.now() - t0 < maks) await vent(50); },
            tomt = async () => { const t0 = performance.now(); while (G.tele.length && performance.now() - t0 < 120000) await vent(50); await spill(.4); },
            rydd = () => { for (const t of G.tele) R.kastTele(t.mesh, 'rydd', t); G.tele = []; Blekk.tom(); },
            kall = () => { const i = R.renderer.info; i.autoReset = false; i.reset(); R.render(0); const n = i.render.calls; i.autoReset = true; return n; },
            eier = () => ({ alive: true, stun: 0, sleep: 0 }), ut = {};"""
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg)
        bk = await pg.evaluate("""async () => { """ + BK_HJELP + """
          rolig(); P.hp = P.maxHp = 1e6; P.invuln = 999; await spill(.3); rydd();
          // tegnekall: 30 varsler samtidig mot ingen
          addTele('circle', { x: P.x, z: P.z + 2, r: 1 }, .1, null, null); await tomt(); const k0 = kall(), E = eier(), former = ['circle', 'rect', 'cone'];
          for (let i = 0; i < 30; i++) { const a = i * .41; addTele(former[i % 3], { x: P.x + Math.sin(a) * 3, z: P.z + Math.cos(a) * 3, r: 1 + (i % 4) * .4, w: .3 + (i % 3) * .5, len: 4, a, arc: 1.4, color: [0xb3261e, 0x9ad0e0, 0xb36be0, 0xffe25a][i % 4] }, 30, null, E); }
          await spill(.05); ut.kall = { k0, k1: kall(), blekk: G.tele.filter(t => t.mesh.isBlekk).length, kval: Blekk.kval() }; cancelTeles(E); await tomt();
          // 300 varsler: 48 i blekk, resten på den gamle måten, og ingenting blir liggende
          const info = R.renderer.info.memory, g0 = info.geometries;
          for (let i = 0; i < 300; i++) { const a = i * .37; addTele(former[i % 3], { x: P.x + Math.sin(a) * 2, z: P.z + Math.cos(a) * 2, r: 1 + (i % 5) * .3, w: .6, len: 4, a, arc: 1.4 }, .3, null, null); }
          ut.pool = { blekk: G.tele.filter(t => t.mesh.isBlekk).length, gamle: G.tele.filter(t => t.mesh.isGroup).length, fulle: Blekk.ledige };
          await tomt(); ut.pool.dg = info.geometries - g0; ut.pool.ledige = Blekk.ledige;
          for (let i = 0; i < 10; i++) addTele(former[i % 3], { x: P.x + i * .3, z: P.z, r: 1.2, w: .6, len: 3, a: i, arc: 1.2 }, 5, null, null);
          await spill(.05); ut.pool.for = Blekk.ledige; startFloor(G.depth, false); ut.pool.etter = Blekk.ledige;
          for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } await vent(200); rolig(); P.hp = P.maxHp = 1e6; P.invuln = 999; await spill(.2);
          // formen: speilet i JS av avstandsfeltet i shaderen mot inShape, 2000 punkter per form (ikke de nærmere kanten enn 0,05)
          const S = [['circle', { r: 1.7 }], ['circle', { r: .5 }], ['rect', { w: .35, len: 10, a: .66 }], ['rect', { w: 2.4, len: 6, a: -2.1 }], ['cone', { r: 2.2, arc: 1.6, a: .4 }],
            ['cone', { r: 2.8, arc: 2.2, a: 3 }], ['cone', { r: .5, arc: 1.9, a: 1 }], ['cone', { r: 3, arc: 4.2, a: -1 }], ['cone', { r: 2, arc: Math.PI * 2 - .01, a: 2 }]];
          ut.form = { n: 0, naer: 0, feil: [], inne: 0 };
          for (const [f, o0] of S) {
            const o = Object.assign({ x: P.x + .3, z: P.z - .2 }, o0), t = addTele(f, o, 30, null, null); await spill(.02); const s = Blekk.finn(t), R_ = (o.len || o.r) + 1;
            let feil = 0; for (let k = 0; k < 2000; k++) { const x = o.x + (Math.random() * 2 - 1) * R_, z = o.z + (Math.random() * 2 - 1) * R_, d = Blekk.avstand(s, x, z); if (Math.abs(d) < .05) { ut.form.naer++; continue; } ut.form.n++; if (d < 0) ut.form.inne++; if ((d < 0) !== inShape(t, x, z)) feil++; }
            if (feil) ut.form.feil.push(f + ' ' + JSON.stringify(o0) + ': ' + feil); rydd();
          }
          // følger eieren: blekk og den gamle tegningen
          const B = Object.assign(eier(), { x: P.x + 1, z: P.z }), tf = addTele('circle', { x: B.x, z: B.z, r: 3, folg: B }, 5, null, B); await spill(.05); B.x += 2; B.z += .5; await spill(.1);
          const sf = Blekk.finn(tf); ut.folg = { sx: sf.x, sz: sf.z, bx: B.x, bz: B.z }; rydd();
          Blekk.av = true; const B2 = Object.assign(eier(), { x: P.x - 1, z: P.z }), tg = addTele('circle', { x: B2.x, z: B2.z, r: 2, folg: B2 }, 5, null, B2); await spill(.05); B2.x -= 2; await spill(.1);
          ut.folg.gammel = { gx: tg.mesh.position.x, bx: B2.x, gruppe: !!tg.mesh.isGroup }; Blekk.av = false; rydd();
          // etterbildet når angrepet går av, grå oppløsning når eieren stanses
          const t1 = addTele('circle', { x: P.x + 2, z: P.z, r: 1 }, .3, null, null), s1 = Blekk.finn(t1), E2 = eier(), t2 = addTele('circle', { x: P.x - 2, z: P.z, r: 1 }, 5, null, E2), s2 = Blekk.finn(t2);
          await spill(.05); cancelTeles(E2); ut.slutt = { st2: s2.state }; const t0 = performance.now(); let st1 = 0;
          while ((s1.bruk || s2.bruk) && performance.now() - t0 < 60000) { if (s1.bruk && s1.state === 1) st1 = 1; await vent(10); }
          Object.assign(ut.slutt, { st1, l1: s1.logg, l2: s2.logg, ledige: Blekk.ledige });
          // enkel grafikk: den gamle tegningen, også for et blekkvarsel som allerede er ute
          const tb = addTele('circle', { x: P.x, z: P.z + 2, r: 1.2 }, 5, null, null); await spill(.05); const varBlekk = !!tb.mesh.isBlekk;
          R.safe = true; const ts = [addTele('circle', { x: P.x, z: P.z, r: 1 }, 5, null, null), addTele('rect', { x: P.x, z: P.z, w: .6, len: 3, a: 1 }, 5, null, null), addTele('cone', { x: P.x, z: P.z, r: 2, arc: 1.4, a: 2 }, 5, null, null)];
          await spill(.1); ut.safe = { gruppe: ts.every(t => t.mesh instanceof THREE.Group), varBlekk, over: !!(tb.mesh.g && tb.mesh.g.isGroup), ledige: Blekk.ledige, synlig: Blekk.mesh.visible };
          rydd(); R.safe = false; await spill(.1);
          // skadetypene: fra o.type, fargen og eieren
          ut.typer = [teleType({ type: 'strom', color: 0xb3261e }), teleType({ color: 0x3a2a44 }), teleType({}, { type: 'oppasser' }), teleType({}, { type: 'kultist' }), teleType({}), teleType({ color: 0x123456 })];
          return ut; }""")
        k = bk['kall']
        sjekk('30 varsler samtidig koster høyst to tegnekall (varslene og lysplatene)', k['blekk'] == 30 and k['k1'] - k['k0'] <= 2 and k['kval'] == 1, k)
        po = bk['pool']
        sjekk('300 varsler: 48 plasser i blekk, resten på den gamle måten, ingen geometri blir liggende og plassene er frie etterpå og etter etasjebytte', po['blekk'] == 48 and po['gamle'] == 252 and po['fulle'] == 0 and po['dg'] <= 2 and po['ledige'] == 48 and po['for'] == 38 and po['etter'] == 48, po)
        fo = bk['form']
        sjekk('formen i shaderen er den samme som inShape (2000 punkter per form, ni former)', not fo['feil'] and fo['n'] > 15000 and fo['inne'] > 2000, fo)
        f_ = bk['folg']
        sjekk('varselet følger eieren (o.folg), også på den gamle måten', abs(f_['sx'] - f_['bx']) < 1e-6 and abs(f_['sz'] - f_['bz']) < 1e-6 and f_['gammel']['gruppe'] and abs(f_['gammel']['gx'] - f_['gammel']['bx']) < 1e-6, f_)
        sl = bk['slutt']; l1, l2 = sl['l1'] or {}, sl['l2'] or {}
        sjekk('etterbildet ligger høyst 0,18 s (fritt første bilde etter), den grå oppløsningen høyst 0,15 s, og plassene er frie',
              sl['st1'] == 1 and l1.get('state') == 1 and l1['t'] >= .18 and l1['t'] - l1['dt'] < .18 + 1e-6 and sl['st2'] == 2 and l2.get('state') == 2 and l2['t'] >= .15 and l2['t'] - l2['dt'] < .15 + 1e-6 and sl['ledige'] == 48, sl)
        sa = bk['safe']
        sjekk('enkel grafikk: alle varsler tegnes på den gamle måten, og et blekkvarsel som er ute, går over til den', sa['gruppe'] and sa['varBlekk'] and sa['over'] and sa['ledige'] == 48, sa)
        sjekk('skadetypen kommer fra o.type, så fargen, så eieren', bk['typer'][:5] == ['strom', 'gass', 'gift', 'morb', 'fysisk'] and bk['typer'][5] in ('vann', 'gass', 'morb'), bk['typer'])
        fa = await pg.evaluate("""(fs) => { const ut = { mangler: [], ukjent: [], lum: {} };
          for (const c of fs.alle) if (!TELE_TYPE[teleType({ color: c })]) ut.ukjent.push(c.toString(16));
          for (const c of fs.maa) if (!TELE_FARGE[c]) ut.mangler.push(c.toString(16));
          for (const [k, T] of Object.entries(TELE_TYPE)) { const c = new THREE.Color(T.farge); ut.lum[k] = +(.2126 * c.r + .7152 * c.g + .0722 * c.b).toFixed(3); }
          return ut; }""", {'alle': list(farger), 'maa': maa_sta})
        sjekk('alle %d fargene i koden har en skadetype, og hver type er lys nok (luminans minst 0,35)' % len(farger), len(farger) >= 48 and not fa['mangler'] and not fa['ukjent'] and len(fa['lum']) == 11 and min(fa['lum'].values()) >= .35, fa)
        # pikslene: sonen er tegnet inne i sirkelen og ikke utenfor (snitt over 9 x 9 punkter, før og etter)
        pos = await pg.evaluate("""async () => { """ + BK_HJELP + """
          // innendørs (ingen regn som endrer pikslene), i det største rommet
          G.run.seed = 11; startFloor(2, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } await vent(200);
          const inne = r => !Vaer.ute(r.x + r.w / 2, r.z + r.h / 2), rr = G.F.rooms.filter(inne);
          rolig(); R.shakeOn = false; rydd(); const r = (rr.length ? rr : G.F.rooms).slice().sort((a, b) => b.w * b.h - a.w * a.h)[0], c = freeSpot(r.x + r.w / 2 - .4, r.z + r.h / 2, 3);
          P.x = c.x; P.z = c.z; P.vx = P.vz = 0; R.snapCamera(P.x, P.z); await spill(.6);
          const q = (x, z) => { const s = R.project(x, 0, z); return [Math.round(s.x), Math.round(s.y)]; };
          return { inne: q(P.x + 3 + .75, P.z), ute: q(P.x + 3 + 2.1, P.z), rinne: q(P.x - 1.2, P.z - 2.5), rute: q(P.x - 2.3, P.z - 2.5) }; }""")
        def flekk(png, xy):
            im = _Img.open(_io.BytesIO(png)).convert('RGB'); x0, y0 = xy
            px = [im.getpixel((x0 + i, y0 + j)) for i in range(-4, 5) for j in range(-4, 5)]
            return [sum(p[k] for p in px) / len(px) for k in range(3)]
        for_ = await pg.screenshot()
        await pg.evaluate("""async () => { """ + BK_HJELP + """
          const t = addTele('circle', { x: P.x + 3, z: P.z, r: 1.5 }, 30, null, null); t.t = 3; const u = addTele('rect', { x: P.x - 1.2, z: P.z - .5, a: Math.PI, w: .8, len: 4 }, 30, null, null); u.t = 3; await spill(.15); }""")
        etter = await pg.screenshot()
        await pg.screenshot(path='/tmp/e_46_piksler.png')
        dlt = lambda xy: sum(abs(a - b) for a, b in zip(flekk(for_, xy), flekk(etter, xy))) / 3
        px_ = {k: round(dlt(v), 1) for k, v in pos.items()}
        sjekk('pikslene: sirkelen er fylt inne (endring over 25, banen over 15) og urørt utenfor (under 8)', px_['inne'] > 25 and px_['ute'] < 8 and px_['rinne'] > 15 and px_['rute'] < 8, px_)
        sjekk('ingen konsollfeil (blekkvarsel i 2D)', not pg.errs, pg.errs[:6])
        await pg.close()
        # én runde i 3D: shaderen lenker, høy kvalitet, ett tegnekall, og ingen geometri blir liggende
        pg = await ny_side(b, viewport={'width': 960, 'height': 540})
        await start_lop(pg, url=URL3D)
        b3 = await pg.evaluate("""async () => { """ + BK_HJELP + """
          rolig(); P.hp = P.maxHp = 1e6; P.invuln = 999; await spill(.3); rydd(); ut.d3 = D3.on;
          addTele('circle', { x: P.x, z: P.z + 2, r: 1 }, .1, null, null); await tomt(); const k0 = kall(), g0 = R.renderer.info.memory.geometries, former = ['circle', 'rect', 'cone'], B = Object.assign(eier(), { kind: 'boss', type: 'krok' });
          for (let i = 0; i < 24; i++) { const a = i * .5; addTele(former[i % 3], { x: P.x + Math.sin(a) * 2.5, z: P.z + Math.cos(a) * 2.5, r: 1 + (i % 4) * .6, w: .4 + (i % 3) * .6, len: 5, a, arc: 1.6, color: [0xb3261e, 0x9ad0e0, 0xffe25a, 0x3a2a44][i % 4], stille: true }, 1.2, null, i % 5 ? null : B); } // stille: nedslagene (merkene og lynene) prøves i del 49
          await spill(.3); const q = R.renderer.properties.get(Blekk.mat), pr = q.currentProgram || q.program;
          const k2 = kall(); Blekk.mesh.visible = false; const k3 = kall(); Blekk.mesh.visible = true;
          Object.assign(ut, { k: k2 - k0, egne: k2 - k3, blekk: G.tele.filter(t => t.mesh.isBlekk).length, kval: Blekk.kval(), lenket: !!pr && !(pr.diagnostics && !pr.diagnostics.runnable) && !Blekk.brutt, lys: Blekk.lys.visible });
          await tomt(); ut.dg = R.renderer.info.memory.geometries - g0; ut.ledige = Blekk.ledige; return ut; }""")
        await pg.screenshot(path='/tmp/e_46_3d.png')
        sjekk('3D: shaderen lenker, høy kvalitet, 24 varsler koster høyst to tegnekall, ingen lysplater, og ingenting blir liggende', b3['d3'] and b3['lenket'] and b3['blekk'] == 24 and b3['k'] <= 2 and b3['egne'] == 1 and b3['kval'] == 2 and not b3['lys'] and b3['dg'] <= 1 and b3['ledige'] == 48, b3)
        sjekk('ingen konsollfeil (blekkvarsel i 3D)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 47) Blod som renner
        #     Blodet på glasset renner som ekte blod (10.png): ingen lange, rette streker fra toppen, sporene smalner og slingrer, en dråpe
        #     renner et stykke og stanser, høyst seks bloddråper renner samtidig, og lerretet lastes opp annethvert bilde når ingenting renner.
        RENN47 = """async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), ramme = n => new Promise(r => { const f = () => --n <= 0 ? r() : requestAnimationFrame(f); requestAnimationFrame(f); }), ut = {};
          for (const e of G.enemies) if (e.alive) killEntity(e, {}); P.hp = P.maxHp = 100; P.invuln = 999; Sound.vaerType = null; G.F.ute = false; Vaatt.tom(); await vent(200);
          const V = Vaatt, mr = Math.random; let fr = 4747; Math.random = () => { fr |= 0; fr = fr + 0x6D2B79F5 | 0; let t = Math.imul(fr ^ fr >>> 15, 1 | fr); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
          try {
            // tolv tunge treff med hvert sitt frø og 8 sekunder etter hvert: den lengste loddrette stripen med blod i en kolonne av lerretet, målt hvert sekund.
            // Ett treff alene gir en håndfull spor, og hvor mange av dem som slingrer og smalner, avhenger av frøet og av hvor mye Blod.treff trakk fra Math.random før
            // (etasjen), så ett treff med «alle sporene» feilet omtrent hver tredje gang. Andelene over tolv treff er stabile.
            V.tom(); V.init(); const k = V.kk(), W = V.W, H = V.H, alle = new Set(); let stripe = 0, maksGlir = 0;
            for (let h = 0; h < 12; h++) {
              fr = 4747 + 131 * h; V.tom(); Blod.treff(P, { x: P.x + 2, z: P.z }, 80);
              for (let i = 1; i <= 160; i++) {
                V.fysikk(.05); for (const s of V.spor) if (s.blod) alle.add(s); maksGlir = Math.max(maksGlir, V.draper.filter(d => d.glir && d.blod).length);
                if (i % 20 === 0) { V.tegn(); const D = V.g.getImageData(0, 0, W, H).data; for (let x = 0; x < W; x++) { let n = 0; for (let y = 0; y < H; y++) { n = D[(y * W + x) * 4 + 1] > 20 ? n + 1 : 0; if (n > stripe) stripe = n; } } }
              }
            }
            // sporene med minst seks punkter: smalere nederst enn øverst, og de slingrer (andelen av alle sporene, og hvor mye de smalner i midten)
            const lange = [...alle].filter(s => s.p.length >= 24).map(s => { const p = s.p, xs = p.filter((_, i) => i % 4 === 0); return { forst: p[2], sist: p[p.length - 2], bredde: Math.max(...xs) - Math.min(...xs) }; }), n = Math.max(1, lange.length), fh = lange.map(s => s.sist / s.forst).sort((a, b) => a - b);
            ut.tungt = { stripe, H, maksGlir, spor: alle.size, lange: lange.length, smalner: +(lange.filter(s => s.sist <= .8 * s.forst).length / n).toFixed(2), slingrer: +(lange.filter(s => s.bredde >= 1.5 * k).length / n).toFixed(2), forhold: +(fh[fh.length >> 1] || 1).toFixed(2), punkter: [...alle].every(s => s.p.length % 4 === 0) };
            // 30 enkeltdråper på r = 3,5 k: hvor langt de renner før de stanser
            const L = []; for (let n = 0; n < 30; n++) { V.tom(); const d = V.ny(W * (.1 + .8 * n / 29), H * .2, 3.5 * k, true); d.ny = 0; const y0 = d.y; for (let i = 0; i < 400 && (i < 3 || d.glir); i++) V.fysikk(.05); L.push(d.y - y0); }
            L.sort((a, b) => a - b); ut.enkle = { median: +((L[14] + L[15]) / 2).toFixed(1), maks: +L[29].toFixed(1), min: +L[0].toFixed(1), H, stanset: L.length === 30 };
          } finally { Math.random = mr; }
          // opplastingen: annethvert bilde når sporene bare blekner, hvert bilde når noe renner
          V.tom(); await ramme(3); const t0 = V.tick; let n = 0; V.tick = function (dt) { n++; return t0.call(this, dt); };
          try {
            V.spor.push({ p: [50, 20, 3, V.klokke, 52, 60, 3, V.klokke], blod: true, id: 1 }); await ramme(2); n = 0; let v0 = V.tex.version; await ramme(24); ut.blekner = +((V.tex.version - v0) / Math.max(1, n)).toFixed(2);
            const d = V.ny(V.W * .5, V.H * .1, 6 * V.kk(), true); d.ny = 0; await ramme(3); n = 0; v0 = V.tex.version; await ramme(12); ut.renner = +((V.tex.version - v0) / Math.max(1, n)).toFixed(2); ut.glir = d.glir;
          } finally { V.tick = t0; }
          V.tom(); return ut; }"""
        UA47 = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        for navn, kw in (('PC', {'viewport': {'width': 1280, 'height': 720}}), ('stående telefon', {'viewport': {'width': 390, 'height': 844}, 'has_touch': True, 'is_mobile': True, 'device_scale_factor': 2, 'user_agent': UA47})):
            pg = await ny_side(b, **kw)
            await start_lop(pg)
            ut = await pg.evaluate(RENN47)
            t = ut['tungt']
            sjekk(f'{navn}: tunge treff gir ingen lange, rette streker på glasset (lengste stripe under halve høyden)', t['stripe'] < .5 * t['H'] and t['spor'] > 0, t)
            sjekk(f'{navn}: minst tre av fire spor smalner mot dråpen og slingrer, punktene har bredde og alder, og høyst seks bloddråper renner samtidig', t['lange'] >= 20 and t['smalner'] >= .75 and t['slingrer'] >= .75 and t['forhold'] <= .8 and t['punkter'] and 0 < t['maksGlir'] <= 6, t)
            e = ut['enkle']
            if navn == 'PC':
                sjekk('en enkelt dråpe renner et stykke og stanser (median 25 til 60 punkter, ingen over 0,6 av høyden)', e['stanset'] and 25 <= e['median'] <= 60 and e['maks'] < .6 * e['H'], e)
            else:
                sjekk(f'{navn}: en enkelt dråpe renner et stykke og stanser (ingen over 0,6 av høyden)', e['stanset'] and e['min'] > 0 and e['maks'] < .6 * e['H'], e)
            sjekk(f'{navn}: lerretet lastes opp annethvert bilde når sporene bare blekner, og hvert bilde når noe renner', .3 <= ut['blekner'] <= .7 and ut['renner'] >= .9 and ut['glir'], [ut['blekner'], ut['renner'], ut['glir']])
            sjekk(f'ingen konsollfeil (blod som renner, {navn})', not pg.errs, pg.errs[:6])
            await pg.close()
        # og en gang i 3D: et tungt treff og 3 sekunder spilltid
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg, url=URL3D)
        ut = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t));
          rolig(); P.hp = P.maxHp = 100; P.invuln = 999; Sound.vaerType = null; Vaatt.tom(); await vent(200); Blod.treff(P, { x: P.x + 2, z: P.z }, 80);
          const g0 = G.time, t0 = performance.now(); while (G.time - g0 < 3 && performance.now() - t0 < 60000) await vent(50);
          return { u: R.post.uniforms.uVaatt.value, spor: Vaatt.spor.length, draper: Vaatt.draper.length, tid: +(G.time - g0).toFixed(2) }; }""")
        await pg.screenshot(path='/tmp/e_47_blod.png')
        sjekk('3D: blodet ligger på glasset etter et tungt treff og 3 sekunder', ut['u'] == 1 and ut['draper'] > 0, ut)
        sjekk('ingen konsollfeil (blod som renner i 3D)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 48) Blekkpartikler
        #     Partiklene er flater i blekk og papir som vender mot kameraet, med fire tegninger fra ett ark (gnist, dråpe, papirbit og støv),
        #     ikke klosser: 900 partikler koster ett tegnekall, fargene kommer fram (før var alle svarte, fordi fargelista ble laget tom),
        #     gnistene strekkes ut langs farten, formen gjettes fra fargen, enkel grafikk gir klossene tilbake uten å legge igjen geometri,
        #     og alt er borte etterpå.
        import io as _io48
        from PIL import Image as _Img48
        PT_HJELP = """const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)),
            spill = async (t, maks = 30000) => { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < t && performance.now() - t0 < maks) await vent(50); },
            tomt = async () => { const t0 = performance.now(); while (Particles.n && performance.now() - t0 < 60000) await vent(50); },
            kall = () => { const i = R.renderer.info; i.autoReset = false; i.reset(); R.render(0); const n = i.render.calls; i.autoReset = true; return n; },
            lenket = () => { const q = R.renderer.properties.get(Particles.mesh.material), pr = q.currentProgram || q.program; return !!pr && !(pr.diagnostics && !pr.diagnostics.runnable) && !Particles.brutt; },
            M = () => Particles.mesh, ut = {};"""
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg)
        pt = await pg.evaluate("""async () => { """ + PT_HJELP + """
          rolig(); P.hp = P.maxHp = 1e6; P.invuln = 999; await spill(.3); Particles.clear(); await spill(.05);
          const g = M().geometry, info = R.renderer.info.memory;
          ut.form = { geo: g.type, aForm: !!g.attributes.aForm, mat: M().material.type, farger: M().instanceColor ? M().instanceColor.array.length : 0 };
          // 900 samtidig (og 100 til, som ikke får plass) koster ett tegnekall
          Particles.spawn(P.x, 1, P.z, 1000, 0xb3261e, { speed: 5, up: 4, life: 20, g: 0 }); await spill(.05);
          const k1 = kall(); M().visible = false; const k0 = kall(); M().visible = true;
          ut.kall = { n: Particles.n, k: k1 - k0, lenket: lenket() };
          const c = M().instanceColor.array; ut.farge = [c[0], c[1], c[2], c[899 * 3]].map(v => +(v ?? -1).toFixed(3));
          Particles.clear(); await spill(.05); ut.kall.tom = M().count;
          // formen gjettes fra fargen: blod og vann er dråper, hvitt og gult er gnister, o.flat er papir, grått og brunt er støv, o.form vinner
          const f = (col, o = {}) => { Particles.spawn(P.x, 1, P.z, 1, col, Object.assign({ life: 5 }, o)); return Particles.d[Particles.n - 1].f; };
          ut.gjett = [f(0xb3261e, { speed: 8 }), f(0x9fd8f0, { speed: 2 }), f(0xfff6a0, { speed: 5 }), f(0xffa040, { speed: 6 }), f(0xefe4c4, { flat: true }), f(0xb8a888, { speed: 3 }), f(0x2a1a1a), f(0xb3261e, { form: 'papir' }), f(0xfff6a0, { form: 'stov' })];
          Particles.clear();
          // en gnist som flyr mot høyre på skjermen: strukket langs farten, flaten vender mot kameraet
          Particles.spawn(P.x, 1, P.z, 1, 0xfff6a0, { speed: .001, up: .001, vx: 9, g: 0, life: 5 }); await spill(.05);
          const A = M().instanceMatrix.array, len = o => Math.hypot(A[o], A[o + 1], A[o + 2]);
          ut.gnist = { x: +len(0).toFixed(3), y: +len(4).toFixed(3), retning: +(A[0] / len(0)).toFixed(3), mot: [A[8], A[9], A[10]].map(v => +v.toFixed(3)), sp: +Math.sin(52 * Math.PI / 180).toFixed(3), cp: +Math.cos(52 * Math.PI / 180).toFixed(3) };
          Particles.clear();
          // de lever ut livet sitt og blir borte
          Particles.spawn(P.x, 1, P.z, 900, 0xfff6a0, { speed: 6, up: 5, life: .4 }); ut.liv = { n0: Particles.n }; await tomt(); await spill(.1); ut.liv.n = Particles.n; ut.liv.count = M().count;
          // enkel grafikk: klossene tilbake på neste bilde, og tilbake til blekk igjen, uten at geometri blir liggende
          const g0 = info.geometries, t0 = info.textures;
          // hver meshen som byttes ut, må kastes (geometri og materiale); det globale tallet tåler én geometri fra noe annet som lages første gang i samme stund
          const kast = [], folg = m => { const k = { g: false, m: false }; m.geometry.addEventListener('dispose', () => k.g = true); m.material.addEventListener('dispose', () => k.m = true); kast.push(k); };
          for (let i = 0; i < 3; i++) { folg(M()); R.safe = true; await spill(.05); if (!i) ut.safe = { geo: M().geometry.type, mat: M().material.type }; Particles.spawn(P.x, 1, P.z, 20, 0xb3261e, { life: 5 }); folg(M()); R.safe = false; await spill(.05); }
          ut.safe.tilbake = M().geometry.type; ut.safe.n = Particles.n; ut.safe.dg = info.geometries - g0; ut.safe.dt = info.textures - t0; ut.safe.kastet = kast.filter(k => k.g && k.m).length + '/' + kast.length;
          const cc = M().instanceColor.array; ut.safe.farge = [cc[0], cc[1], cc[2]].map(v => +v.toFixed(3));
          // enkel grafikk før init (som ved oppstart med innstillingen på) gir klosser fra første bilde, og blekket etterpå
          Particles.clear(); const gm = M(); R.scene.remove(gm); gm.geometry.dispose(); gm.material.dispose(); Particles.mesh = null; Particles.d.length = 0;
          R.safe = true; Particles.init(); ut.safe.init = M().geometry.type; R.safe = false; await spill(.05); ut.safe.initEtter = M().geometry.type; ut.safe.d = Particles.d.length;
          Particles.clear(); rolig();
          return ut; }""")
        fo = pt['form']
        sjekk('partiklene er flater med formattributt og egen shader, ikke klosser, og fargelista har plass til alle 900', fo == {'geo': 'PlaneGeometry', 'aForm': True, 'mat': 'ShaderMaterial', 'farger': 2700}, fo)
        k = pt['kall']
        sjekk('900 partikler koster ett tegnekall, shaderen lenker, og count går til 0 etter clear', k['n'] == 900 and k['k'] == 1 and k['lenket'] and k['tom'] == 0, k)
        sjekk('fargen kommer fram (blodrødt, ikke svart)', pt['farge'] == [0.702, 0.149, 0.118, 0.702], pt['farge'])
        sjekk('formen gjettes fra fargen (dråpe, dråpe, gnist, gnist, papir, støv, dråpe) og o.form vinner', pt['gjett'] == [1, 1, 0, 0, 2, 3, 1, 2, 3], pt['gjett'])
        gn = pt['gnist']
        sjekk('gnisten strekkes ut langs farten og flaten vender mot kameraet', gn['x'] > gn['y'] * 1.8 and gn['retning'] > .99 and abs(gn['mot'][1] - gn['sp']) < .002 and abs(gn['mot'][2] - gn['cp']) < .002 and abs(gn['mot'][0]) < .002, gn)
        sjekk('900 partikler lever ut og er borte', pt['liv'] == {'n0': 900, 'n': 0, 'count': 0}, pt['liv'])
        sa = pt['safe']
        sjekk('enkel grafikk gir klosser, blekket kommer tilbake, fargene og partiklene følger med, og ingen geometri eller tekstur blir liggende', sa['geo'] == 'BoxGeometry' and sa['mat'] == 'MeshBasicMaterial' and sa['tilbake'] == 'PlaneGeometry' and sa['n'] == 60 and sa['kastet'] == '6/6' and sa['dg'] <= 1 and sa['dt'] <= 0 and sa['farge'] == [0.702, 0.149, 0.118], sa)
        sjekk('enkel grafikk satt før init gir klosser, og blekket kommer når den slås av', sa['init'] == 'BoxGeometry' and sa['initEtter'] == 'PlaneGeometry' and sa['d'] == 900, sa)
        # pikslene: en klump blodpartikler som står stille, blir rød på skjermen (snitt over 9 x 9 punkter, før og etter)
        xy = await pg.evaluate("""async () => { """ + PT_HJELP + """
          R.shakeOn = false; P.vx = P.vz = 0; R.snapCamera(P.x, P.z); await spill(.3);
          const s = R.project(P.x + 2.5, 1, P.z + .5); return [Math.round(s.x), Math.round(s.y)]; }""")
        def flekk48(png, xy):
            im = _Img48.open(_io48.BytesIO(png)).convert('RGB'); x0, y0 = xy
            px = [im.getpixel((x0 + i, y0 + j)) for i in range(-4, 5) for j in range(-4, 5)]
            return [sum(q[k] for q in px) / len(px) for k in range(3)]
        for48 = await pg.screenshot()
        await pg.evaluate("""async () => { """ + PT_HJELP + """
          Particles.spawn(P.x + 2.5, 1, P.z + .5, 40, 0xb3261e, { speed: .001, up: .001, g: 0, life: 30, size: 1.3 }); await spill(.15); }""")
        etter48 = await pg.screenshot()
        a_, e_ = flekk48(for48, xy), flekk48(etter48, xy)
        sjekk('pikslene: blodpartiklene er røde på skjermen (rødt over grønt med minst 50, og endret)', e_[0] - e_[1] > 50 and abs(e_[0] - a_[0]) + abs(e_[1] - a_[1]) > 40, {'for': [round(v) for v in a_], 'etter': [round(v) for v in e_]})
        # fem drap i et rolig rom, til gjennomsyn
        await pg.evaluate("""async () => { """ + PT_HJELP + """
          Particles.clear(); const E = [], typer = ['pleier', 'oppasser', 'kultist', 'yngel', 'pleier'];
          for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 + .3, f = freeSpot(P.x + Math.sin(a) * 2.6, P.z + Math.cos(a) * 2.2, 2); E.push(spawnEnemy(typer[i], f.x, f.z, false, 2)); }
          await spill(.7); for (const e of E) if (e && e.alive) { e.stun = 5; hurt(e, 1e6, { from: 'player', x: P.x, z: P.z }); } await spill(.12); }""")
        await pg.screenshot(path='/tmp/e_48_partikler.png')
        sjekk('ingen konsollfeil (blekkpartikler i 2D)', not pg.errs, pg.errs[:6])
        await pg.close()
        # én runde i 3D: flatene, shaderen lenker og ett tegnekall
        pg = await ny_side(b, viewport={'width': 960, 'height': 540})
        await start_lop(pg, url=URL3D)
        p3 = await pg.evaluate("""async () => { """ + PT_HJELP + """
          rolig(); await spill(.3); Particles.clear(); ut.d3 = D3.on;
          Particles.spawn(P.x, 1, P.z, 900, 0xfff6a0, { speed: 6, up: 5, life: 20, g: 0 }); Particles.spawn(P.x, 1, P.z, 5, 0xb3261e, {}); await spill(.1);
          const k1 = kall(); M().visible = false; const k0 = kall(); M().visible = true;
          Object.assign(ut, { geo: M().geometry.type, n: Particles.n, k: k1 - k0, lenket: lenket() }); Particles.clear(); return ut; }""")
        sjekk('3D: flater, shaderen lenker og 900 partikler koster ett tegnekall', p3 == {'d3': True, 'geo': 'PlaneGeometry', 'n': 900, 'k': 1, 'lenket': True}, p3)
        sjekk('ingen konsollfeil (blekkpartikler i 3D)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 49) Nedslag
        #     Angrepene lander med tyngde (Nedslag i 46_blekk.js): partikler langs omrisset når et varsel går av (ikke når det avbrytes
        #     eller har o.stille), korte lyn på kanten for strøm, merker i gulvet på store angrep (høyst 12, de som har bleknet brukes
        #     om igjen), skrensemerker når en fiende stormer, bare et blaff for prosjektilbaner, partiklene er borte innen 5 s,
        #     ingen ny geometri per nedslag, ingenting med enkel grafikk, tunge treff på spilleren fryser bildet, lynet i regnværet
        #     beholder sitt eget nedslag, og prosjektilene har en skygge på gulvet.
        import io as _io49
        from PIL import Image as _Img49
        NS_HJELP = """const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)),
            spill = async (t, maks = 30000) => { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < t && performance.now() - t0 < maks) await vent(50); },
            tomt = async () => { const t0 = performance.now(); while (G.tele.length && performance.now() - t0 < 120000) await vent(50); await spill(.1); },
            rydd = () => { for (const t of G.tele) R.kastTele(t.mesh, 'rydd', t); G.tele = []; Blekk.tom(); },
            kall = () => { const i = R.renderer.info; i.autoReset = false; i.reset(); R.render(0); const n = i.render.calls; i.autoReset = true; return n; },
            eier = (o = {}) => Object.assign({ alive: true, stun: 0, sleep: 0 }, o), T = () => Object.assign({}, Nedslag.tall), ut = {};"""
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg)
        ns = await pg.evaluate("""async () => { """ + NS_HJELP + """
          rolig(); P.hp = P.maxHp = 1e6; P.invuln = 999; await spill(.3); rydd(); Particles.clear(); Nedslag.tom();
          // går av: partikler langs omrisset. Avbrutt eller o.stille: ingenting
          let t0 = T(), n0 = Particles.n; const E = eier();
          addTele('circle', { x: P.x + 2, z: P.z, r: 1.4 }, .1, null, null); addTele('circle', { x: P.x - 2, z: P.z, r: 1.4 }, 5, null, E); addTele('circle', { x: P.x, z: P.z + 2, r: 1.4, stille: true }, .1, null, null);
          await spill(.02); cancelTeles(E); await tomt(); let t1 = T();
          ut.land = { d: t1.land - t0.land, part: t1.partikler - t0.partikler, kvote: Glod.kvote(), merker: t1.merker - t0.merker };
          // strøm: gnister og to eller tre lyn på kanten
          t0 = T(); addTele('circle', { x: P.x + 2, z: P.z, r: 1.8, color: 0xffe25a }, .1, null, null); await tomt(); t1 = T(); ut.strom = { lyn: t1.lyn - t0.lyn, part: t1.partikler - t0.partikler };
          // en prosjektilbane: bare et lite blaff og ingen merker. Et løp: skrensemerker
          t0 = T(); addTele('rect', { x: P.x, z: P.z, a: 1, w: .35, len: 10 }, .1, null, eier()); await tomt(); t1 = T(); ut.bane = { baner: t1.baner - t0.baner, part: t1.partikler - t0.partikler, merker: t1.merker - t0.merker };
          const L = eier({ state: 'wind' }); t0 = T(); addTele('rect', { x: P.x, z: P.z, a: 2, w: 1.3, len: 7 }, .1, () => { L.state = 'charge'; }, L); await tomt(); t1 = T();
          const sk = Nedslag.M.filter(m => m.t < m.liv).map(m => Nedslag.aDek.array[m.i * 2]);
          ut.lop = { lop: t1.lop - t0.lop, merker: t1.merker - t0.merker, skrens: sk.includes(3), part: t1.partikler - t0.partikler };
          Nedslag.tom();
          // korskriket (r 6,2) når forbi rommet: ingen partikler inne i veggen eller ute i mørket, og merket blir høyst 6,5 skritt
          { const K = { x: P.x, z: P.z, r: 6.2 }; let vegg = 0; for (let i = 0; i < 64; i++) { const q = Nedslag.kant('circle', K, i / 64); if (solid(Math.floor(q.x), Math.floor(q.z))) vegg++; }
            const sp0 = Particles.spawn; let iVegg = 0, nSp = 0; Particles.spawn = function (x, y, z) { nSp++; if (solid(Math.floor(x), Math.floor(z))) iVegg++; return sp0.apply(this, arguments); };
            try { addTele('circle', K, .05, null, eier({ kind: 'boss' })); await tomt(); } finally { Particles.spawn = sp0; }
            const m = Nedslag.M.filter(m => m.t < m.liv); ut.kor = { vegg, iVegg, nSp, merker: m.length, str: m.length ? Math.max(m[0].sx, m[0].sz) : 0 }; Nedslag.tom(); }
          // 40 store angrep av alle typene: høyst 12 merker, de som har bleknet brukes om igjen, ingen geometri blir liggende, partiklene er borte innen 5 s
          const info = R.renderer.info.memory, g0 = info.geometries, typer = Object.keys(TELE_TYPE); let maks = 0; t0 = T(); n0 = Particles.n;
          for (let i = 0; i < 40; i++) { const a = i * .9; addTele('circle', { x: P.x + Math.sin(a) * 3, z: P.z + Math.cos(a) * 3, r: 2.2 + (i % 3) * .6, type: typer[i % typer.length] }, .05 + (i % 10) * .02, null, i % 4 ? null : eier({ kind: 'boss' })); if (i % 10 === 9) { await tomt(); maks = Math.max(maks, Nedslag.levende); } }
          t1 = T(); const nTopp = Particles.n; await spill(5.3, 240000);
          ut.stor = { merker: t1.merker - t0.merker, maks, sjokk: t1.sjokk - t0.sjokk, nTopp, n5: Particles.n, n0, levende: Nedslag.levende, dg: info.geometries - g0 };
          t0 = T(); addTele('circle', { x: P.x + 3, z: P.z, r: 2.5 }, .05, null, null); await tomt(); t1 = T(); ut.stor.gjenbruk = t1.gjenbruk - t0.gjenbruk; ut.stor.dg2 = info.geometries - g0;
          const k1 = kall(); Nedslag.mesh.visible = false; const k0 = kall(); Nedslag.mesh.visible = true; ut.stor.kall = k1 - k0; Nedslag.tom(); await spill(.1);
          // enkel grafikk: ingen partikler og ingen merker, og meshen vises ikke
          Particles.clear(); R.safe = true; await spill(.05); t0 = T(); n0 = Particles.n;
          addTele('circle', { x: P.x + 2, z: P.z, r: 3, color: 0xffe25a }, .05, null, eier({ kind: 'boss' })); addTele('rect', { x: P.x, z: P.z, a: 2, w: .35, len: 6 }, .05, null, null); await tomt(); t1 = T();
          ut.safe = { land: t1.land - t0.land, part: t1.partikler - t0.partikler, merker: t1.merker - t0.merker, lyn: t1.lyn - t0.lyn, synlig: Nedslag.mesh.visible, sjokk: t1.sjokk - t0.sjokk };
          R.safe = false; await spill(.1);
          // tunge treff: over 15 % av livet fryser bildet og viser treffstjerna, et lite treff gjør det ikke
          P.hp = P.maxHp = 100; P.invuln = 0; P.iframe = 0; G.hitstop = 0; const s0 = VFX.stars.length; t0 = T(); const d1 = hurt(P, 20, { type: 'test' }); const hs1 = G.hitstop, st1 = VFX.stars.length - s0;
          P.invuln = 0; P.iframe = 0; G.hitstop = 0; const d2_ = hurt(P, 5, { type: 'test' }); const hs2 = G.hitstop;
          ut.tungt = { d1, hs1, st1, d2: d2_, hs2, tunge: T().tunge - t0.tunge }; P.hp = P.maxHp = 1e6; P.invuln = 999; await spill(.1);
          // lynet i regnværet har sitt eget nedslag
          const nT = G.tele.length; Uvaer.varsel(P.x + 4, P.z); ut.lyn = { stille: G.tele.length > nT && !!G.tele[G.tele.length - 1].o.stille }; rydd();
          // skygge under prosjektilene, også en som går i bue
          const pr = addProj({ type: 'glob', from: 'enemy', x: P.x + 3, z: P.z, arc: true, tx: P.x + 6, tz: P.z, dur: 20, h: 3, dmg: 0 }); await spill(.1);
          ut.skygge = { n: Nedslag.skygger ? Nedslag.skygger.count : -1 }; pr.alive = false; await spill(.1); ut.skygge.etter = Nedslag.skygger.count;
          return ut; }""")
        la = ns['land']
        sjekk('et varsel som går av, gir et nedslag med partikler langs omrisset, men ikke et som avbrytes eller har o.stille', la['d'] == 1 and la['part'] >= 8 and la['kvote'] > 0 and la['merker'] == 0, la)
        sjekk('strøm gir gnister og to eller tre korte lyn på kanten', 2 <= ns['strom']['lyn'] <= 3 and ns['strom']['part'] >= 8, ns['strom'])
        sjekk('en prosjektilbane gir bare et lite blaff, et løp gir skrensemerker', ns['bane']['baner'] == 1 and 1 <= ns['bane']['part'] <= 8 and ns['bane']['merker'] == 0 and ns['lop']['lop'] == 1 and ns['lop']['merker'] == 1 and ns['lop']['skrens'] and ns['lop']['part'] >= 4, [ns['bane'], ns['lop']])
        sjekk('et stort angrep som når inn i veggen (korskriket, r 6,2): ingen partikler i veggen, og merket blir høyst 6,5 skritt', ns['kor']['vegg'] > 0 and ns['kor']['iVegg'] == 0 and ns['kor']['nSp'] >= 8 and ns['kor']['merker'] == 1 and 0 < ns['kor']['str'] <= 6.5, ns['kor'])
        st = ns['stor']
        sjekk('40 store angrep: høyst 12 merker (ett tegnekall), sjokkbølger, merker som har bleknet brukes om igjen, partiklene er borte innen 5 s og geometrien vokser høyst 2',
              st['merker'] == 40 and st['maks'] == 12 and st['sjokk'] >= 40 and st['nTopp'] > 100 and st['n5'] <= st['n0'] and st['levende'] == 0 and st['gjenbruk'] == 1 and st['dg'] <= 2 and st['dg2'] <= 2 and st['kall'] == 1, st)
        sa = ns['safe']
        sjekk('enkel grafikk: nedslaget telles, men ingen partikler, lyn, merker eller sjokkbølger', sa['land'] == 2 and sa['part'] == 0 and sa['merker'] == 0 and sa['lyn'] == 0 and not sa['synlig'] and sa['sjokk'] == 0, sa)
        tu = ns['tungt']
        sjekk('et tungt treff (over 15 % av livet) fryser bildet minst 0,04 s og viser treffstjerna, et lite gjør det ikke', tu['d1'] > 15 and tu['hs1'] >= .04 and tu['st1'] == 1 and tu['tunge'] == 1 and tu['d2'] > 0 and tu['hs2'] == 0, tu)
        sjekk('lynet i regnværet beholder sitt eget nedslag (o.stille)', ns['lyn']['stille'], ns['lyn'])
        sjekk('prosjektilene har en skygge på gulvet, også i bue, og den er borte med prosjektilet', ns['skygge'] == {'n': 1, 'etter': 0}, ns['skygge'])
        # pikslene: blekksølet etter et stort angrep synes i gulvet midt i sirkelen og ikke utenfor (snitt over 9 x 9 punkter, før og etter)
        pos = await pg.evaluate("""async () => { """ + NS_HJELP + """
          G.run.seed = 11; startFloor(2, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } await vent(200);
          const inne = r => !Vaer.ute(r.x + r.w / 2, r.z + r.h / 2), rr = G.F.rooms.filter(inne);
          rolig(); R.shakeOn = false; rydd(); P.hp = P.maxHp = 1e6; P.invuln = 999; const r = (rr.length ? rr : G.F.rooms).slice().sort((a, b) => b.w * b.h - a.w * a.h)[0], c = freeSpot(r.x + r.w / 2 - .4, r.z + r.h / 2, 3);
          P.x = c.x; P.z = c.z; P.vx = P.vz = 0; R.snapCamera(P.x, P.z); await spill(.6); Particles.clear();
          const q = (x, z) => { const s = R.project(x, 0, z); return [Math.round(s.x), Math.round(s.y)]; };
          return { midt: q(P.x + 3.2, P.z), ute: q(P.x + 3.2 + 4.3, P.z) }; }""")
        def flekk49(png, xy):
            im = _Img49.open(_io49.BytesIO(png)).convert('RGB'); x0, y0 = xy
            px = [im.getpixel((x0 + i, y0 + j)) for i in range(-4, 5) for j in range(-4, 5)]
            return [sum(q[k] for q in px) / len(px) for k in range(3)]
        for49 = await pg.screenshot()
        await pg.evaluate("""async () => { """ + NS_HJELP + """
          addTele('circle', { x: P.x + 3.2, z: P.z, r: 2.4, color: 0xb36be0 }, .05, null, null); await tomt(); await spill(1.4); }""")
        etter49 = await pg.screenshot()
        await pg.screenshot(path='/tmp/e_49_merke.png')
        dl49 = lambda xy: round(sum(abs(a - b) for a, b in zip(flekk49(for49, xy), flekk49(etter49, xy))) / 3, 1)
        px49 = {k: dl49(v) for k, v in pos.items()}
        sjekk('pikslene: merket synes midt i sirkelen (endring over 25) og ikke utenfor (under 8)', px49['midt'] > 25 and px49['ute'] < 8, px49)
        sjekk('ingen konsollfeil (nedslag i 2D)', not pg.errs, pg.errs[:6])
        await pg.close()
        # én runde i 3D: merkene lenker, ett tegnekall for 12 merker, og ingenting blir liggende
        pg = await ny_side(b, viewport={'width': 960, 'height': 540})
        await start_lop(pg, url=URL3D)
        n3 = await pg.evaluate("""async () => { """ + NS_HJELP + """
          rolig(); P.hp = P.maxHp = 1e6; P.invuln = 999; await spill(.3); rydd(); ut.d3 = D3.on;
          addTele('circle', { x: P.x + 2, z: P.z, r: 2.4 }, .05, null, null); await tomt(); await spill(.5); Nedslag.tom(); const g0 = R.renderer.info.memory.geometries, t0 = T(); // første gang lages varslene og merkene
          for (let i = 0; i < 14; i++) { const a = i * .45; addTele(i % 5 ? 'circle' : 'cone', { x: P.x + Math.sin(a) * 3, z: P.z + Math.cos(a) * 3, r: 2.4, a, arc: 1.6, type: Object.keys(TELE_TYPE)[i % 11] }, .1 + (i % 7) * .03, null, null); }
          await tomt(); const q = R.renderer.properties.get(Nedslag.mesh.material), pr = q.currentProgram || q.program;
          const k1 = kall(); Nedslag.mesh.visible = false; const k0 = kall(); Nedslag.mesh.visible = true;
          Object.assign(ut, { merker: T().merker - t0.merker, levende: Nedslag.levende, kall: k1 - k0, lenket: !!pr && !(pr.diagnostics && !pr.diagnostics.runnable) });
          await spill(5.3, 240000); ut.dg = R.renderer.info.memory.geometries - g0; ut.etter = Nedslag.levende; return ut; }""")
        await pg.screenshot(path='/tmp/e_49_3d.png')
        sjekk('3D: merkene lenker, 12 merker koster ett tegnekall, de blekner, og geometrien vokser høyst 2', n3['d3'] and n3['lenket'] and n3['merker'] == 14 and n3['levende'] == 12 and n3['kall'] == 1 and n3['etter'] == 0 and n3['dg'] <= 2, n3)
        sjekk('ingen konsollfeil (nedslag i 3D)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 50) Teksturer fra ChatGPT
        #     Bildeløpet for teksturer (ren Python), veggene og bakken ute tar bildet når det finnes og maler ellers som før,
        #     drømmegulvet er mindre på telefon, og tegneliste 11 og 12 har alle teksturene som mangler
        import base64, io, json, re, tempfile
        from urllib.parse import unquote, urlparse
        from PIL import Image
        ROT50 = pathlib.Path(unquote(urlparse(URL3D).path)).parent.parent  # roten til bygget som testes
        sys.path.insert(0, str(ROT50 / 'tools')); import behandle_bilder as BB
        man = json.loads((ROT50 / 'assets' / 'manifest.json').read_text(encoding='utf-8'))
        def proveflate(w, h, farger, hard=True):
            """en syntetisk tekstur: striper i farger, med en hard søm (venstre halvdel mørk, høyre lys) og litt gjennomsiktighet"""
            im = Image.new('RGBA', (w, h), farger[0] + (255,)); px = im.load()
            for y in range(h):
                for x in range(w):
                    c = farger[(y * len(farger)) // h]; k = (.55 + .45 * x / w) if hard else 1; s = ((x // 24 + y // 24) % 2) * 14
                    px[x, y] = (min(255, int(c[0] * k) + s), min(255, int(c[1] * k) + s), min(255, int(c[2] * k) + s), 255)
            for y in range(40, 90):
                for x in range(40, 90): px[x, y] = (0, 0, 0, 0)
            return im
        with tempfile.TemporaryDirectory() as tmp:
            sti = pathlib.Path(tmp) / 'bakke_park.png'; rå = proveflate(1024, 1024, [(40, 70, 30), (60, 100, 40), (30, 60, 24)]); rå.save(sti)
            ut = BB.behandle(sti, man['bakke_park']); for_ = BB.saum(rå.convert('RGB').resize((512, 512), Image.LANCZOS), 'x')[0]; etter = BB.saum(ut, 'x')[0]
            sjekk('bildeløpet: en bakke med hard søm blir 512 x 512 uten gjennomsiktighet, og sømmen minst halvert', ut.size == (512, 512) and ut.mode == 'RGB' and etter <= for_ * .5, (ut.size, ut.mode, round(for_, 1), round(etter, 1)))
            sti = pathlib.Path(tmp) / 'vegg_panel.png'; proveflate(1536, 1024, [(220, 212, 173)] * 5 + [(111, 138, 85)] * 4 + [(59, 51, 34)], False).save(sti)
            vut = BB.behandle(sti, man['vegg_panel'])
            sjekk('bildeløpet: en vegg på 1536 x 1024 til en vegg på 2,3 meter blir 442 x 294', vut.size == (442, 294), vut.size)
            def data_url(im):
                b = io.BytesIO(); im.save(b, 'WEBP', quality=85); return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()
            panel_url, bakke_url = data_url(vut), data_url(ut)
        # de genererte listene: alle teksturer som ikke er levert, står i liste 11 og 12, med filnavn, nøkkel, referanse og prompt
        tl = ROT50 / 'tegnelister'; teks = [k for k, m in man.items() if m.get('flis')]
        levert = {p.stem for p in (ROT50 / 'assets' / 'ferdig').glob('*.*')} if (ROT50 / 'assets' / 'ferdig').exists() else set()
        tekst = ''.join((tl / f).read_text(encoding='utf-8') for f in ('11_vegger_og_bakken.md', '12_gulv.md') if (tl / f).exists())
        poster = re.findall(r'(?m)^## (1[12][a-z])\. .*\n\nFilnavn: `([a-z0-9_]+)\.png`\n\nGir: `([a-z0-9_]+)`\n\nBrukes i: .*\n\nReferanse \(last opp sammen med prompten\): `tegnelister/referanse/ref_\2\.png`\n\n!\[[^\]]*\]\(referanse/ref_\2\.png\)\n\n```text\n(?:FLOOR|WALL|GROUND) texture \2: ', tekst)
        mangler = sorted(set(teks) - levert)
        sjekk('tegneliste 11 og 12 har hver tekstur som mangler, med filnavn, nøkkel, referansebilde og prompt', len(teks) == 44 and sorted(p[1] for p in poster) == mangler and all(p[1] == p[2] and (tl / 'referanse' / f'ref_{p[1]}.png').exists() for p in poster), (len(teks), len(poster), len(mangler)))
        stil = re.search(r'## Stilblokk for teksturer.*?```text\n(.*?)\n```', tekst, re.S)
        sjekk('stilblokken for teksturer ber om et helt dekket bilde, ikke gjennomsiktig bakgrunn', bool(stil) and 'OPAQUE' in stil.group(1) and 'TRANSPARENT background' not in stil.group(1))
        les = (tl / 'LESMEG.md').read_text(encoding='utf-8'); csvn = [r for r in (tl / 'tegneliste.csv').read_text(encoding='utf-8').splitlines()[1:] if r.split(';')[2:3] == ['tekstur']]
        sjekk('LESMEG og regnearket har liste 11 og 12', '11_vegger_og_bakken.md' in les and '12_gulv.md' in les and len(csvn) == len(mangler), len(csvn))

        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await pg.goto(URL); await pg.wait_for_timeout(2000); await pg.evaluate("() => localStorage.clear()")
        await start_lop(pg)
        tk = await pg.evaluate("""async ([panel, bakke]) => { const G = MORBIDIUM, vent = t => new Promise(r => setTimeout(r, t)), ut = {};
          const bygg = async d => { G.run.dromVent = 0; startFloor(d, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } await vent(150); };
          const vegg = st => { const m = Paint.mesh.vegger.find(v => v.userData.veggStil === st); return m && m.material.map; }, mål = t => t && [t.image.width, t.image.height, t.fraBilde || ''];
          const last = (k, src) => new Promise(r => { SPRITES[k] = src; const im = Art.img[k] = new Image(); im.onload = im.onerror = () => r(im.naturalWidth); im.src = src; });
          await bygg(2); ut.malt = mål(vegg('panel')); await bygg(1); ut.maltBakke = mål(Paint.mesh.bakke.material.map);
          ut.lastet = [await last('vegg_panel', panel), await last('bakke_park', bakke)];
          await bygg(2); const t = vegg('panel'); ut.panel = mål(t); ut.rep = t && +t.repeat.x.toFixed(4);
          await bygg(3); ut.panel3 = mål(vegg('panel')); // Underetasjen har egne farger (vegg_panel_3), og uten det bildet maler koden
          await bygg(1); const bk = Paint.mesh.bakke.material.map; ut.bakke = mål(bk); ut.bakkeRep = +(bk.repeat.x * 4 - G.F.W).toFixed(2);
          const c0 = R.coarse; R.coarse = true; await bygg(1); ut.bakkeTlf = mål(Paint.mesh.bakke.material.map);
          // en drøm på telefon: gulvet er høyst 1200 punkter bredt, kartet får det fortsatt, og veggene beholder drømmens farger
          G.run.dromVent = 2; startFloor(2, false); await vent(200); ut.drom = !!G.drom; const gm = Paint.mesh.gulv.material.map.image; ut.dromGulv = gm.width; ut.dromKart = Kart.gulvBilde() === gm;
          ut.dromVegger = Paint.mesh.vegger.filter(v => v.material.map.fraBilde).length; R.coarse = c0; Drom.hopp(); await vent(200);
          // et bilde som ikke er pakket ut ennå, males først og byttes når det kommer; et ødelagt bilde males av koden
          const ny = document.createElement('canvas'); ny.width = 300; ny.height = 200; const ng = ny.getContext('2d'); ng.fillStyle = '#' + (Math.random() * 0xffffff | 0).toString(16).padStart(6, '0'); ng.fillRect(0, 0, 300, 200);
          SPRITES.vegg_mur = ny.toDataURL(); delete Art.img.vegg_mur; const tm = Paint.wallTex(G.th, 'mur', G.F); ut.sakte = [tm.image.width]; // en ny adresse, så nettleseren ikke har bildet ferdig fra før
          for (let i = 0; i < 100 && !tm.fraBilde; i++) await vent(50); ut.sakte.push(tm.image.width, tm.fraBilde || ''); tm.dispose();
          SPRITES.vegg_tre = 'data:image/webp;base64,AAAA'; delete Art.img.vegg_tre; const tf = Paint.wallTex(G.th, 'tre', G.F); await vent(300); const tf2 = Paint.wallTex(G.th, 'tre', G.F);
          ut.odelagt = [tf.image.width, !!tf.fraBilde, tf2.image.width, !!tf2.fraBilde]; tf.dispose(); tf2.dispose(); delete SPRITES.vegg_mur; delete SPRITES.vegg_tre;
          // lette teksturer maler som før; Enkel grafikk tar bildet og bygger uten feil
          R.lowTex = true; await bygg(2); ut.lowTex = mål(vegg('panel')); R.lowTex = false;
          const s = G.meta.settings; s.simple = true; applySettings(); await bygg(2); ut.enkel = mål(vegg('panel')); s.simple = false; applySettings(); await bygg(2);
          return ut; }""", [panel_url, bakke_url])
        sjekk('uten bilder er veggen og bakken malt som før (256 punkter bred)', tk['malt'][:2] == [256, 296] and tk['malt'][2] == '' and tk['maltBakke'] == [256, 256, ''], [tk['malt'], tk['maltBakke']])
        sjekk('panelveggen fra bildet er 442 x 294 og gjentas hver 3,45 rute (repeat .5797)', tk['lastet'][0] == 442 and tk['panel'] == [442, 294, 'vegg_panel'] and abs(tk['rep'] - .5797) < .001, [tk['panel'], tk['rep']])
        sjekk('i Underetasjen maler koden panelveggen når vegg_panel_3 mangler', tk['panel3'][0] == 256 and tk['panel3'][2] == '', tk['panel3'])
        sjekk('bakken i Parken fra bildet er 512 punkter over 4 x 4 ruter, 256 på telefon', tk['bakke'] == [512, 512, 'bakke_park'] and tk['bakkeRep'] == 48 and tk['bakkeTlf'] == [256, 256, 'bakke_park'], [tk['bakke'], tk['bakkeRep'], tk['bakkeTlf']])
        sjekk('en drøm på telefon har et gulv på høyst 1200 punkter, kartet får det, og veggene tar ikke bildene', tk['drom'] and 0 < tk['dromGulv'] <= 1200 and tk['dromKart'] and tk['dromVegger'] == 0, [tk['dromGulv'], tk['dromKart'], tk['dromVegger']])
        sjekk('et bilde som pakkes ut, males først og byttes når det kommer; et ødelagt bilde males av koden', tk['sakte'] == [256, 442, 'vegg_mur'] and tk['odelagt'] == [256, False, 256, False], [tk['sakte'], tk['odelagt']])
        sjekk('lette teksturer maler veggen, og Enkel grafikk tar bildet', tk['lowTex'][0] == 256 and tk['lowTex'][2] == '' and tk['enkel'] == [442, 294, 'vegg_panel'], [tk['lowTex'], tk['enkel']])
        await pg.screenshot(path='/tmp/e_50_2d.png')
        sjekk('ingen konsollfeil (teksturer i 2D)', not pg.errs, pg.errs[:6])
        await pg.close()
        # 3D: rommene får samme tekstur i sine egne materialer, og en etasje med bilder bygget på nytt holder grafikkminnet i ro
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await pg.goto(URL3D); await pg.wait_for_timeout(2500); await pg.evaluate("() => localStorage.clear()")
        await start_lop(pg, url=URL3D)
        t3 = await pg.evaluate("""async ([panel, bakke]) => { const G = MORBIDIUM, vent = t => new Promise(r => setTimeout(r, t)), ut = {};
          const bygg = async d => { G.run.dromVent = 0; startFloor(d, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } await vent(300); };
          const last = (k, src) => new Promise(r => { SPRITES[k] = src; const im = Art.img[k] = new Image(); im.onload = im.onerror = () => r(im.naturalWidth); im.src = src; });
          await last('vegg_panel', panel); await last('bakke_park', bakke); await bygg(2); await bygg(1);
          const mem = () => R.renderer.info.memory; await bygg(2); const m0 = [mem().textures, mem().geometries];
          const v = Paint.mesh.vegger.find(v => v.userData.veggStil === 'panel'); ut.d3 = D3.on; ut.map = v && v.material.map && v.material.map.fraBilde; ut.type = v && v.material.type;
          for (const d of [1, 2, 1, 2]) await bygg(d); const m1 = [mem().textures, mem().geometries]; ut.minne = [m1[0] - m0[0], m1[1] - m0[1]]; return ut; }""", [panel_url, bakke_url])
        sjekk('3D: panelveggen bruker bildet i rommets eget materiale', t3['d3'] and t3['map'] == 'vegg_panel' and t3['type'] != 'MeshBasicMaterial', t3)
        sjekk('3D: etasjer med bilder bygget på nytt holder grafikkminnet i ro', t3['minne'][0] <= 6 and t3['minne'][1] <= 12, t3['minne'])
        await pg.screenshot(path='/tmp/e_50_3d.png')
        sjekk('ingen konsollfeil (teksturer i 3D)', not pg.errs, pg.errs[:6])
        await pg.close()

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
        # 52) Vinter
        #     Snøen på gulvet er ett lag over hele uteområdet (ingen kutt langs rutene), dekker 75 til 85 % og er aldri helt hvit,
        #     veggene mot snøen får hvit topp og et snøbånd, bakken ute er snø, lyset er kaldere, og etasjer uten snø har ingen snø
        V52 = """() => { const G = MORBIDIUM, finn = v => { for (let s = 1; s < 900; s++) if (v(generateFloor(s + 7919, 1, {}))) return s; return null; };
          window._v52 = { sno: finn(F => F.vaer === 'sno' && F.rooms.some(r => r.template === 'liggehall')), regn: finn(F => F.vaer === 'regn') }; return window._v52; }"""
        # dekket, kuttene langs rutene, veggene, toppene og bakken i etasjen som står
        MAAL52 = """() => { const G = MORBIDIUM, F = G.F, c = Paint.mesh.gulv.material.map.image, T = c.width / F.W, d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, cw = c.width;
          const lum = k => (.2126 * d[k] + .7152 * d[k + 1] + .0722 * d[k + 2]) / 255, ute = i => { if (!F.tiles[i]) return false; const rid = F.roomId[i]; return rid >= 0 ? !!F.rooms[rid].ute : !!F.ute; };
          const mulberry32 = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
          const snoFarge = k => Math.abs(d[k] - 228) + Math.abs(d[k + 1] - 235) + Math.abs(d[k + 2] - 243) < 12 || Math.abs(d[k] - 179) + Math.abs(d[k + 1] - 191) + Math.abs(d[k + 2] - 210) < 8;
          const r1 = mulberry32(5); let n = 0, lys = 0, maks = 0, sf = 0;
          for (let t = 0; t < 100000 && n < 400; t++) { const x = r1() * F.W, z = r1() * F.H; if (!ute(Math.floor(z) * F.W + Math.floor(x))) continue; const k = (Math.floor(z * T) * cw + Math.floor(x * T)) * 4; n++; if (lum(k) > .72) lys++; if (snoFarge(k)) sf++; maks = Math.max(maks, d[k], d[k + 1], d[k + 2]); }
          // 200 rutegrenser mellom to uteruter: forskjellen over grensen mot forskjellen mellom to kolonner midt i ruta. Bare par der minst
          // ett punkt er snø (lysstyrke over .72) telles: bar bakke har sine egne fuger langs rutene, og det er ikke snøen som er kuttet
          const r2 = mulberry32(9), d2 = (a, b) => { const x = lum(a), y = lum(b); return Math.max(x, y) > .72 ? Math.abs(x - y) : 0; }; let over = 0, inne = 0, nb = 0;
          for (let t = 0; t < 50000 && nb < 200; t++) { const x = 1 + Math.floor(r2() * (F.W - 1)), z = 1 + Math.floor(r2() * (F.H - 1)), i = z * F.W + x, loddrett = nb % 2 === 0, j = loddrett ? i - 1 : i - F.W; if (!ute(i) || !ute(j)) continue;
            for (let k = 2; k < T - 2; k++) { if (loddrett) { const y = z * T + k, p = (y * cw + x * T - 1) * 4, q = (y * cw + x * T + T / 2 - 1) * 4; over += d2(p, p + 4); inne += d2(q, q + 4); }
              else { const xx = x * T + k, p = ((z * T - 1) * cw + xx) * 4, q = ((z * T + T / 2 - 1) * cw + xx) * 4; over += d2(p, p + cw * 4); inne += d2(q, q + cw * 4); } }
            nb++; }
          const sv = Paint.mesh.vegger.filter(m => m.userData.sno), hk = sv.find(m => m.userData.veggStil === 'hekk') || sv.find(m => !(VEGG[m.userData.veggStil] || {}).alfa);
          let topp12 = 0; if (hk) { const im = hk.material.map.image, dd = im.getContext('2d').getImageData(0, 0, im.width, 12).data; for (let k = 0; k < dd.length; k += 4) topp12 += (.2126 * dd[k] + .7152 * dd[k + 1] + .0722 * dd[k + 2]) / 255; topp12 /= dd.length / 4; }
          const ca = Paint.mesh.topp.geometry.attributes.color.array; let snoTopp = 0; for (let k = 0; k < ca.length; k += 3) if (Math.abs(ca[k] - .875) < .05 && Math.abs(ca[k + 1] - .902) < .05 && Math.abs(ca[k + 2] - .937) < .05) snoTopp++;
          const bk = Paint.mesh.bakke.material.map, bi = bk.image, bd = bi.getContext ? bi.getContext('2d').getImageData(0, 0, bi.width, bi.height).data : null; let bl = 0; if (bd) { for (let k = 0; k < bd.length; k += 16) bl += (.2126 * bd[k] + .7152 * bd[k + 1] + .0722 * bd[k + 2]) / 255; bl /= bd.length / 16; }
          const amb = R.post.uniforms.uAmbient.value;
          // fronter som vender inn i en paviljong (et innerom sør for veggen): ingen av dem har snøbånd og istapper
          const inn = ms => ms.reduce((n, m) => { const p = m.geometry.attributes.position.array; for (let k = 0; k < p.length; k += 18) { const x = Math.floor(p[k] + 1e-4), z = Math.round(p[k + 2]), i = z * F.W + x; if (z < F.H && F.tiles[i] && !ute(i)) n++; } return n; }, 0);
          return { vaer: F.vaer, T, n, innSno: inn(sv), innAlle: inn(Paint.mesh.vegger), dekke: +(lys / Math.max(1, n)).toFixed(3), maks, snoFarge: sf, over: +(over / Math.max(1, nb)).toFixed(3), inne: +(inne / Math.max(1, nb)).toFixed(3), nb,
            snoVegger: sv.length, stil: hk && hk.userData.veggStil, topp12: +topp12.toFixed(3), snoTopp, bakke: +bl.toFixed(3), bakkeRute: +((F.W + 48) / bk.repeat.x).toFixed(2), amb: '#' + amb.getHexString() }; }"""
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg)
        fro = await pg.evaluate(V52)
        m52 = await pg.evaluate("""async () => { const G = MORBIDIUM, vent = t => new Promise(r => setTimeout(r, t)), S = window._v52, ut = {};
          const bygg = async s => { G.run.seed = s; G.run.dromVent = 0; startFloor(1, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } await vent(150); };
          await bygg(S.sno); ut.sno = (""" + MAAL52 + """)(); await bygg(S.regn); ut.regn = (""" + MAAL52 + """)();
          R.lowTex = true; await bygg(S.sno); ut.lett = (""" + MAAL52 + """)(); R.lowTex = false;
          const st = G.meta.settings; st.simple = true; applySettings(); await bygg(S.sno); ut.enkel = (""" + MAAL52 + """)(); st.simple = false; applySettings();
          // byggetiden: hele startFloor med snø, og Paint.level (gulvet, veggene og bakken, der snøen males) med og uten snø på samme etasje.
          // Uten snø er startFloor minus forskjellen; beste av fem (maskinen er delt, så ett av tre kunne bli forstyrret)
          const ts = [], ls = [], lr = [], ferdig = () => Paint.mesh.gulv.material.map.image.getContext('2d').getImageData(0, 0, 1, 1); // lerretet tegnes først når det leses
          for (let k = 0; k < 5; k++) { G.run.seed = S.sno; G.run.dromVent = 0; let t0 = performance.now(); startFloor(1, false); ferdig(); ts.push(performance.now() - t0); await vent(100);
            const Fr = Object.assign({}, G.F, { vaer: 'regn' }); t0 = performance.now(); Paint.level(Fr, G.th); ferdig(); lr.push(performance.now() - t0); await vent(50);
            t0 = performance.now(); Paint.level(G.F, G.th); ferdig(); ls.push(performance.now() - t0); await vent(100); }
          const a = Math.min(...ts), b = Math.min(...ls), c = Math.min(...lr); ut.tid = [Math.round(a), Math.round(a - (b - c)), Math.round(b), Math.round(c)];
          await bygg(S.sno); const P = G.player, r = G.F.rooms.find(r => r.template === 'liggehall'); for (const e of G.enemies) if (e.alive) killEntity(e, {}); G.combat = null; G.lock = null;
          P.x = r.x + r.w / 2; P.z = r.z + r.h / 2; P.invuln = 999; R.snapCamera(P.x, P.z); return ut; }""")
        s5, r5, l5, e5 = m52['sno'], m52['regn'], m52['lett'], m52['enkel']
        sjekk('vinter: frøene finnes (Parken med snø og liggehall, og Parken i regn)', fro['sno'] is not None and fro['regn'] is not None and s5['vaer'] == 'sno' and r5['vaer'] == 'regn', fro)
        sjekk('vinter: snøen dekker minst 70 % av uterutene (lysstyrke over .72), og ingen punkter er helt hvite', s5['n'] == 400 and s5['dekke'] >= .7 and s5['maks'] < 250, s5)
        sjekk('vinter: ingen kutt langs rutene (forskjellen over 200 rutegrenser er høyst 1,5 ganger den midt i rutene)', s5['nb'] == 200 and s5['over'] <= 1.5 * s5['inne'], (s5['over'], s5['inne'], s5['nb']))
        sjekk('vinter: veggene mot snøen har snøbånd (øverste 12 punkter lyse) og hvit topp', s5['snoVegger'] > 0 and s5['topp12'] > .8 and s5['snoTopp'] > 0, (s5['snoVegger'], s5['stil'], s5['topp12'], s5['snoTopp']))
        sjekk('vinter: fronter som vender inn i en paviljong har ikke snøbånd eller istapper', s5['innAlle'] > 0 and s5['innSno'] == 0, (s5['innAlle'], s5['innSno']))
        sjekk('vinter: bakken ute er snø, gjentatt hver tiende rute, og lyset er kaldere', s5['bakke'] > .7 and abs(s5['bakkeRute'] - 10) < .01 and s5['amb'] != r5['amb'], (s5['bakke'], s5['bakkeRute'], s5['amb'], r5['amb']))
        sjekk('vinter: en Parken uten snø har ingen snøfarger, snøvegger, snøtopper eller snøbakke', r5['snoFarge'] <= 2 and r5['snoVegger'] == 0 and r5['snoTopp'] == 0 and r5['bakke'] < .5 and abs(r5['bakkeRute'] - 5) < .01, r5)
        sjekk('vinter: lette teksturer og Enkel grafikk har også snøen', l5['T'] == 16 and l5['dekke'] >= .6 and l5['maks'] < 250 and e5['dekke'] >= .7 and e5['snoVegger'] > 0, (l5['T'], l5['dekke'], e5['dekke'], e5['snoVegger']))
        sjekk('vinter: etasjen med snø bygges på høyst 1,3 ganger tiden uten (samme frø, beste av fem: startFloor, uten snø, Paint.level med og uten)', m52['tid'][0] <= 1.3 * m52['tid'][1], m52['tid'])
        await pg.wait_for_timeout(800); await pg.screenshot(path='/tmp/e_52_vinter_2d.png')
        sjekk('ingen konsollfeil (vinter, 2D)', not pg.errs, pg.errs[:6])
        await pg.close()
        # 3D: kaldt lys fra snøen, lavere relieff, lys tåke, og snøetasjer bygget på nytt holder grafikkminnet i ro
        for vp, navn in (({'width': 1280, 'height': 720}, '1280'), ({'width': 390, 'height': 844}, '390x844')):
            pg = await ny_side(b, viewport=vp, **({'is_mobile': True, 'has_touch': True} if vp['width'] < 600 else {}))
            await start_lop(pg, url=URL3D)
            await pg.evaluate(V52)
            d3 = await pg.evaluate("""async (mobil) => { const G = MORBIDIUM, vent = t => new Promise(r => setTimeout(r, t)), S = window._v52, ut = {};
              const bygg = async s => { G.run.seed = s; G.run.dromVent = 0; startFloor(1, false); await vent(300); };
              const lys = () => { const h = D3.ting.find(o => o.isHemisphereLight), g = Paint.mesh.gulv.material; return { hemi: h && '#' + h.groundColor.getHexString(), mane: D3.mane && +D3.mane.intensity.toFixed(2), bump: g.bumpScale, farge: g.color && '#' + g.color.getHexString(), type: g.type }; };
              await bygg(S.regn); ut.regn = lys(); await bygg(S.sno); ut.sno = lys();
              if (!mobil) { const mem = () => R.renderer.info.memory, m0 = [mem().textures, mem().geometries]; for (const s of [S.regn, S.sno, S.regn, S.sno]) await bygg(s); ut.minne = [mem().textures - m0[0], mem().geometries - m0[1]]; }
              const P = G.player, r = G.F.rooms.find(r => r.template === 'liggehall'); for (const e of G.enemies) if (e.alive) killEntity(e, {}); G.combat = null; G.lock = null;
              P.x = r.x + r.w / 2; P.z = r.z + r.h / 2; P.invuln = 999; R.snapCamera(P.x, P.z); ut.d3 = D3.on; return ut; }""", vp['width'] < 600)
            if vp['width'] > 600:
                sjekk('vinter i 3D: blått lys fra snøen, sterkere måne, lavere relieff og dempet gulv, og regnværet er som før', d3['d3'] and d3['sno']['hemi'] == '#4a5470' and d3['sno']['mane'] > d3['regn']['mane'] and abs(d3['sno']['bump'] - .45) < .01 and d3['sno']['farge'] != '#ffffff' and d3['regn']['hemi'] == '#2a1a14' and abs(d3['regn']['bump'] - .7) < .01 and d3['regn']['farge'] == '#ffffff', d3)
                sjekk('vinter i 3D: snøetasjer bygget på nytt holder grafikkminnet i ro', d3['minne'][0] <= 6 and d3['minne'][1] <= 12, d3['minne'])
            await pg.evaluate("async () => { const G = MORBIDIUM, g0 = G.time, t0 = performance.now(); while (G.time - g0 < 1 && performance.now() - t0 < 20000) await new Promise(r => setTimeout(r, 50)); }")
            await pg.screenshot(path=f'/tmp/e_52_vinter_{navn}.png')
            sjekk(f'ingen konsollfeil (vinter, 3D {navn})', not pg.errs, pg.errs[:6])
            await pg.close()
        # 53) Hint og innbrudd
        #     Sprekken er en flekk nyere puss (ingen murkasse), trekken høres dempet bak veggen innen fem ruter og dragene blåser ut av den,
        #     et slag mot en vanlig vegg gir et dumpt slag (høyst hvert 0,4 sekund, ikke når en fiende treffes), én boble per etasje og ett tips,
        #     og innbruddet går gjennom bristen, synkingen, byttet og lysene på under halvannet sekund spilltid, også med enkel grafikk
        # OPP53: en etasje med en sprekk etter ønske (nord: nordveggen i et innerom, hekk: sørveggen i en hekk ute som i 10.png), med pasienten foran
        OPP53 = """async (o) => { const G = MORBIDIUM, vent = t => new Promise(r => setTimeout(r, t)); let s0 = null;
          const passer = F => { const h = F.rooms.find(r => r.role === 'secret'); if (!h || !F.crack || !F.crack.length) return false; const p = F.rooms[h.parent], rad = i => (i / F.W) | 0;
            return o.hvor === 'nord' ? !p.ute && F.crack.every(i => rad(i) === p.z - 1) && ['panel', 'tapet', 'paviljong'].includes(p.vegg) : !!p.ute && F.crack.every(i => rad(i) === p.z + p.h); };
          for (let s = 1; s < 900; s++) { if (!passer(generateFloor(s + o.d * 7919, o.d, {}))) continue; G.run.seed = s; G.run.dromVent = 0; startFloor(o.d, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); }
            if (o.hvor !== 'hekk' || (Skjult.info && Skjult.info.st === 'hekk')) { s0 = s; break; } }
          if (s0 === null) return null;
          const P = G.player, I = Skjult.info; for (const e of G.enemies) if (e.alive) killEntity(e, {}); G.combat = null; G.lock = null; G.rooms.forEach(s => s.cleared = true); Bygg.alt();
          P.x = I.cx; P.z = I.ez + I.uz * (o.avst || 1.2); P.face = Math.atan2(0, -I.uz); P.hp = P.maxHp; P.invuln = 999; R.snapCamera(P.x, P.z); await vent(300);
          return { s0, side: I.side, st: I.st, ute: I.ute, meshes: I.meshes.map(m => m.userData.dekal), sprite: Spesial.cracks.some(c => c.g), eid: Paint.owned.includes(I.tex) && Paint.owned.includes(I.mat) }; }"""
        # pasienten et gitt antall ruter rett ut fra midten av sprekken (fra midten av sprekkruta)
        STILL53 = "(d) => { const G = MORBIDIUM, P = G.player, I = Skjult.info; P.x = I.cx; P.z = I.ez - I.uz * .5 + I.uz * d; R.snapCamera(P.x, P.z); }"
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg)
        n53 = await pg.evaluate(OPP53, {'d': 2, 'hvor': 'nord'})
        sjekk('hint: en sprekk i en nordvegg har flekken (flate og støv, i Paint.owned) og ingen murkasse', n53 is not None and n53['side'] == 'n' and 'flate' in n53['meshes'] and 'stov' in n53['meshes'] and not n53['sprite'] and n53['eid'], n53)
        # trekken: dempet vind innen fem ruter (lavpass under 900 på tre ruter), ingenting på ni ruter eller i kamp, og dragene langs gulvet
        tr = await pg.evaluate("""(still) => { const G = MORBIDIUM, ut = {}, still_ = eval(still), maal = () => { const M = Stemning.maal(); return M.trekk_vind ? M.trekk_vind.map(v => +v.toFixed(3)) : null; };
          const glod = () => { Skjult.trekk(); const E = Skjult.trekkE; return E && Glod.liste.includes(E) ? +E.mat.uniforms.uStyrke.value.toFixed(2) : null; };
          still_(3); ut.tre = maal(); ut.gl3 = glod(); ut.gruppe = !!(Lydbank.gruppeListe().trekk_vind || []).length; ut.rot = Skjult.trekkE ? +Skjult.trekkE.pts.rotation.y.toFixed(2) : null;
          G.combat = {}; ut.kamp = maal(); G.combat = null;
          still_(2); ut.gl2 = glod(); still_(7); ut.gl7 = glod(); G.sprekkKjent = true; ut.gl7m = glod(); G.sprekkKjent = false; still_(9); ut.ni = maal(); ut.gl9 = glod(); return ut; }""", STILL53)
        sjekk('hint: trekken bak veggen høres dempet på tre ruter (lavpass høyst 900) og ikke på ni ruter eller i kamp', tr['tre'] is not None and tr['tre'][0] > 0 and tr['tre'][1] <= 900 and tr['ni'] is None and tr['kamp'] is None and tr['gruppe'], tr)
        sjekk('hint: kalde drag langs gulvet nær sprekken (fullt på to ruter, ingen på ni), og monokkelen viser dem fra åtte ruter', tr['gl3'] is not None and 0 < tr['gl3'] < 1 and tr['gl2'] == 1 and tr['gl7'] is None and tr['gl7m'] is not None and tr['gl9'] is None and tr['rot'] is not None, tr)
        # banking: slag mot en vanlig vegg i foreldrerommet (nordveggen, et stykke fra sprekken)
        bk = await pg.evaluate("""async () => { const G = MORBIDIUM, F = G.F, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), h = F.rooms.find(r => r.role === 'secret'), p = F.rooms[h.parent];
          // en rute i foreldrerommet inntil en vanlig vegg, langt fra sprekken og uten ting i nærheten
          let st = null; for (let z = p.z; z < p.z + p.h && !st; z++) for (let x = p.x; x < p.x + p.w && !st; x++) { if (solid(x, z) || F.crack.some(c => Math.hypot(c % F.W - x, ((c / F.W) | 0) - z) < 4) || G.props.some(o => o.alive !== false && Math.hypot(o.x - x - .5, o.z - z - .5) < 2)) continue;
            for (const [dx, dz] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) { const i = (z + dz) * F.W + x + dx; if (Paint.wallH[i] > 0 && !F.crack.includes(i)) { st = { x, z, dx, dz }; break; } } }
          if (!st) return null;
          const lyder = [], _p = Sound.play; Sound.play = function (n, ...a) { lyder.push([n, +G.time.toFixed(3)]); return _p.call(this, n, ...a); };
          P.x = st.x + .5 + st.dx * .05; P.z = st.z + .5 + st.dz * .05; P.face = Math.atan2(st.dx, st.dz); R.snapCamera(P.x, P.z); Spesial.bankT = -9;
          startSwing(false); const g0 = G.time, t0 = performance.now(); while (P.atk && G.time - g0 < 3 && performance.now() - t0 < 20000) await vent(30);
          const ekte = lyder.filter(l => l[0] === 'veggbank').length; lyder.length = 0;
          const t00 = G.time; for (let k = 0; k < 24; k++) { G.time += .1; meleeHit({ heavy: false, combo: 0, charge: 0 }); } const tider = lyder.filter(l => l[0] === 'veggbank').map(l => l[1]); G.time = t00 + 2.4; lyder.length = 0;
          const e = spawnEnemy('pleier', P.x + st.dx * .2, P.z + st.dz * .2, false, 2); e.state = 'chase'; e.cd = 99; e.hp = 1e6; e.maxHp = 1e6; G.time += 1; meleeHit({ heavy: false, combo: 0, charge: 0 }); const medFiende = lyder.filter(l => l[0] === 'veggbank').length; killEntity(e, {}); G.combat = null; G.lock = null;
          lyder.length = 0; P.face += Math.PI; G.time += 1; meleeHit({ heavy: false, combo: 0, charge: 0 }); const luft = lyder.filter(l => l[0] === 'veggbank').length;
          Sound.play = _p; let min = 9; for (let k = 1; k < tider.length; k++) min = Math.min(min, tider[k] - tider[k - 1]); return { ekte, n: tider.length, min: +min.toFixed(2), medFiende, luft }; }""")
        sjekk('hint: et slag mot en vanlig vegg gir et dumpt slag, høyst ett per 0,4 sekund spilltid', bk is not None and bk['ekte'] == 1 and 4 <= bk['n'] <= 7 and bk['min'] >= .4 - 1e-6, bk)
        sjekk('hint: ingen banking når slaget treffer en fiende eller bare luft', bk is not None and bk['medFiende'] == 0 and bk['luft'] == 0, bk)
        # ordene: høyst én boble på tjue sekunder spilltid ved sprekken, og tipset første gang (også ved et nytt løp er det vist)
        ord_ = await pg.evaluate("""async (still) => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)); eval(still)(1.6); for (const e of G.enemies) if (e.alive) killEntity(e, {});
          const alle = new Set([...Skjult.ord(), 'Det trekker herfra.', 'Den veggen ser tynn ut.', 'Er det noen der inne?']), bobler = [], _b = FX.bubble; FX.bubble = function (hvem, s, ...a) { if (hvem === P) bobler.push(s); return _b.call(this, hvem, s, ...a); };
          if (G.meta.tips) delete G.meta.tips.sprekk; G.meta.settings.tips = true; Spesial.sagt = false; Spesial.naerT = 0;
          // tre sekunder i spillets egen løkke, og resten av de tjue sekundene med Spesial.update i steg på en tidel (maskinen er for treg til tjue sekunder spilltid)
          const g0 = G.time, t0 = performance.now(); while (G.time - g0 < 3 && performance.now() - t0 < 60000) { P.hp = P.maxHp; await vent(100); } let tid = G.time - g0; const n3 = bobler.filter(s => alle.has(s)).length;
          while (tid < 20) { Spesial.update(.1); tid += .1; }
          FX.bubble = _b; const el = document.getElementById('tips'); return { tid: +tid.toFixed(1), ekte: +(G.time - g0).toFixed(1), n3, n: bobler.filter(s => alle.has(s)).length, bobler: bobler.slice(0, 6), tips: !!(G.meta.tips && G.meta.tips.sprekk), tekst: el ? el.textContent : '' }; }""", STILL53)
        sjekk('hint: nøyaktig én boble på tjue sekunder spilltid ved sprekken (den første etter to sekunder), og tipset om murte vegger', ord_['tid'] >= 20 and ord_['ekte'] >= 2.5 and ord_['n3'] == 1 and ord_['n'] == 1 and ord_['tips'] and 'murt igjen' in ord_['tekst'], ord_)
        await pg.evaluate(STILL53, 1.8); await pg.wait_for_timeout(700); await pg.screenshot(path='/tmp/e_53_hint_2d.png')
        # et vanlig slag på sprekken: hult, «Det knaker», og hårstreken vokser et steg
        sl = await pg.evaluate("""async (still) => { const G = MORBIDIUM, P = G.player, I = Skjult.info; eval(still)(1.1); P.face = Math.atan2(0, -I.uz); const lyder = [], _p = Sound.play; Sound.play = function (n, ...a) { lyder.push(n); return _p.call(this, n, ...a); };
          Spesial.bankT = -9; Spesial.bank(P.x, P.z, P.face, 1.2, 1.4); const direkte = lyder.includes('veggbank'); lyder.length = 0; // sprekken svarer aldri massivt, heller ikke når slaget bommet på den
          G.time += 1; meleeHit({ heavy: false, combo: 0, charge: 0 }); Sound.play = _p; return { steg: I.steg, lyder, hp: Spesial.cracks.map(c => c.hp), direkte }; }""", STILL53)
        sjekk('hint: et vanlig slag på sprekken svarer hult (ingen banking) og hårstreken vokser', sl['steg'] == 1 and 'bonk' in sl['lyder'] and 'veggbank' not in sl['lyder'] and not sl['direkte'] and min(sl['hp']) == 2, sl)
        # innbruddet: et tungt slag, og stegene i forløpet i spilltid etter bristen
        FORLOP53 = """async (skudd) => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), tider = {}, ut = { lyder: [], bobler: [] };
          const _p = Sound.play; Sound.play = function (n, ...a) { ut.lyder.push(n); return _p.call(this, n, ...a); }; const _b = FX.bubble; FX.bubble = function (hvem, s, ...a) { if (hvem === P) ut.bobler.push(s); return _b.call(this, hvem, s, ...a); };
          const orig = {}; for (const k of ['brist', 'synk0', 'bytt', 'vekk', 'slutt']) { orig[k] = Skjult[k]; Skjult[k] = function (...a) { tider[k] = G.time; const r = orig[k].apply(this, a); if (k === 'brist') ut.brist = (Skjult.vis.brist || []).length; return r; }; }
          const _f = Skjult.forlop; Skjult.forlop = function (dt) { const r = _f.call(this, dt); if (ut.stopp === undefined) ut.stopp = +G.hitstop.toFixed(3); return r; };
          const rydd = () => { for (const k in orig) Skjult[k] = orig[k]; Skjult.forlop = _f; Sound.play = _p; FX.bubble = _b; };
          P.face = Math.atan2(0, -Skjult.info.uz); startSwing(true, 1); const g0 = G.time, t0 = performance.now();
          while (!tider.brist && G.time - g0 < 5 && performance.now() - t0 < 30000) await vent(20);
          if (skudd && tider.brist) { while (!(Skjult.vis && Skjult.vis.t > .04) && performance.now() - t0 < 30000) await vent(10); slowMo(60, .0005); ut.skudd = true; rydd(); return ut; }
          const g1 = G.time, t1 = performance.now(); while ((Skjult.vis || !tider.slutt) && G.time - g1 < 3 && performance.now() - t1 < 40000) await vent(30);
          rydd();
          const t = k => tider[k] !== undefined ? +(tider[k] - tider.brist).toFixed(2) : null, PM = Paint.mesh, I = Skjult.info;
          return Object.assign(ut, { synk0: t('synk0'), bytt: t('bytt'), vekk: t('vekk'), slutt: t('slutt'), ferdig: !Skjult.vis, gulv: PM.gulvSkjult && PM.gulvSkjult.visible,
            sprekkSynlig: [...PM.vegger, ...(PM.toppEkstra || [])].filter(m => m.userData.del === 'sprekk' && m.visible).length, dekalSynlig: I ? I.meshes.filter(m => m.visible && m.userData.dekal !== 'stov' && m.userData.dekal !== 'rusk').length : -1,
            rusk: I ? I.meshes.some(m => m.userData.dekal === 'rusk') : false, secrets: G.run.secrets || 0, lys: Skjult.lys.length, tent: Skjult.lys.filter(L => L.material.color.r + L.material.color.g + L.material.color.b > 0).length,
            trekk: Glod.liste.filter(E => E.type === 'trekk').length }); }"""
        ib = await pg.evaluate(FORLOP53, False)
        rekke = [ib.get(k) for k in ('synk0', 'bytt', 'vekk', 'slutt')]
        sjekk('innbrudd: bristen med stopp i slaget, sprekkveggen som bristbilde og bruddlyden', ib.get('brist', 0) >= 2 and ib['stopp'] > 0 and 'murbrudd' in ib['lyder'], ib)
        sjekk('innbrudd: veggen synker, byttet, rommet våkner og ruskene ligger der, i rekkefølge og innen halvannet sekund spilltid', None not in rekke and rekke == sorted(rekke) and .15 <= rekke[0] <= .3 and rekke[3] <= 1.5 and ib['ferdig'] and ib['rusk'], rekke)
        sjekk('innbrudd: etterpå er gulvet der, sprekkveggen og flekken borte, lysene tent og «Visste jeg det.» sagt', ib['gulv'] and ib['sprekkSynlig'] == 0 and ib['dekalSynlig'] == 0 and ib['secrets'] == 1 and ib['lys'] >= 2 and ib['tent'] == ib['lys'] and 'Visste jeg det.' in ib['bobler'], ib)
        await pg.wait_for_timeout(600); await pg.screenshot(path='/tmp/e_53_brudd_2d.png')
        # enkel grafikk: flekken og innbruddet virker, men uten drag og partikler
        sf = await pg.evaluate("""async (still) => { const G = MORBIDIUM, vent = t => new Promise(r => setTimeout(r, t)), s = G.meta.settings, frø = G.run.seed; s.simple = true; applySettings();
          G.run.seed = frø; G.run.dromVent = 0; startFloor(2, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } await vent(200); for (const e of G.enemies) if (e.alive) killEntity(e, {}); G.combat = null; G.lock = null;
          const P = G.player; P.invuln = 999; eval(still)(2); Skjult.trekk(); await vent(300); const ut = { safe: R.safe, dekal: !!(Skjult.info && Skjult.info.meshes.length), trekkE: !!Skjult.trekkE, glod: Glod.liste.length };
          let tS = null; const _s = Skjult.slutt; Skjult.slutt = function () { tS = G.time; return _s.call(this); };
          const g0 = G.time; Spesial.damage(Spesial.cracks[0], 9); const t0 = performance.now(); while (Skjult.vis && G.time - g0 < 3 && performance.now() - t0 < 30000) await vent(30); Skjult.slutt = _s;
          Object.assign(ut, { tid: tS === null ? null : +(tS - g0).toFixed(2), ferdig: !Skjult.vis, gulv: Paint.mesh.gulvSkjult.visible, trekk: Glod.liste.filter(E => E.type === 'trekk').length });
          s.simple = false; applySettings(); return ut; }""", STILL53)
        sjekk('innbrudd med enkel grafikk: flekken er der, ingen drag, og innbruddet blir ferdig innen halvannet sekund uten feil', sf['safe'] and sf['dekal'] and not sf['trekkE'] and sf['trekk'] == 0 and sf['ferdig'] and sf['tid'] is not None and sf['tid'] <= 1.5 and sf['gulv'], sf)
        # hekken ute (10.png): visnet flekk, klokka som tikker inne i hekken i stedet for vinden, og innbruddet med blader
        hk = await pg.evaluate(OPP53, {'d': 1, 'hvor': 'hekk', 'avst': 1.8})
        hkl = await pg.evaluate("""(still) => { eval(still)(3); const M = Stemning.maal(); return { tikk: M.trekk_tikk ? M.trekk_tikk.map(v => +v.toFixed(2)) : null, vind: !!M.trekk_vind, ord: Skjult.ord()[0] }; }""", STILL53)
        sjekk('hint ute: sprekken i en hekk er en visnet flekk, og klokka tikker inne i hekken i stedet for vinden', hk is not None and hk['st'] == 'hekk' and hk['side'] == 's' and not hk['sprite'] and 'topp' in hk['meshes'] and hkl['tikk'] is not None and not hkl['vind'], (hk, hkl))
        await pg.evaluate(STILL53, 1.8); await pg.wait_for_timeout(700); await pg.screenshot(path='/tmp/e_53_hint_park_2d.png')
        ihk = await pg.evaluate(FORLOP53, False)
        sjekk('innbrudd ute: bladene og kvisten (lovbrudd) uten murstein i bristen, og rommet er åpent innen halvannet sekund', 'lovbrudd' in ihk['lyder'] and ihk.get('brist') == 0 and ihk['ferdig'] and ihk['gulv'] and ihk['slutt'] is not None and ihk['slutt'] <= 1.5, ihk)
        await pg.wait_for_timeout(600); await pg.screenshot(path='/tmp/e_53_brudd_park_2d.png')
        sjekk('ingen konsollfeil (hint og innbrudd, 2D)', not pg.errs, pg.errs[:6])
        await pg.close()
        # 3D: flekken, dragene og bristbildet, i et innerom og i hekken
        for hvor, d, avst in (('nord', 2, 1.8), ('hekk', 1, 1.8)):
            pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
            await start_lop(pg, url=URL3D)
            o3 = await pg.evaluate(OPP53, {'d': d, 'hvor': hvor, 'avst': avst})
            g3 = await pg.evaluate("""async () => { const G = MORBIDIUM, g0 = G.time, t0 = performance.now(); while (G.time - g0 < 1.5 && performance.now() - t0 < 30000) await new Promise(r => setTimeout(r, 50));
              const I = Skjult.info; return { on: D3.on, trekk: !!Skjult.trekkE, mat: I && I.mat.type, dekal: I ? I.meshes.length : 0 }; }""")
            await pg.screenshot(path=f'/tmp/e_53_hint_{hvor}_3d.png')
            sjekk(f'hint i 3D ({hvor}): flekken står på veggen og dragene blåser ut av den', o3 is not None and g3['on'] and g3['dekal'] >= 2 and g3['trekk'] and not o3['sprite'], (o3, g3))
            b3 = await pg.evaluate(FORLOP53, True)
            await pg.wait_for_timeout(300); await pg.screenshot(path=f'/tmp/e_53_brist_{hvor}_3d.png')
            await pg.evaluate("async () => { const G = MORBIDIUM; G.slow.t = 0; G.slow.s = 1; const g0 = G.time, t0 = performance.now(); while ((Skjult.vis || G.time - g0 < 1.6) && performance.now() - t0 < 40000) await new Promise(r => setTimeout(r, 50)); }")
            f3 = await pg.evaluate("() => ({ ferdig: !Skjult.vis, gulv: Paint.mesh.gulvSkjult.visible, skjult: !!MORBIDIUM.skjult })")
            await pg.screenshot(path=f'/tmp/e_53_brudd_{hvor}_3d.png')
            sjekk(f'innbrudd i 3D ({hvor}): bristbildet vises inne (ute bare blader), og rommet er åpent etterpå', b3.get('skudd') and (b3.get('brist', 0) >= 2 if hvor == 'nord' else b3.get('brist') == 0) and f3['ferdig'] and f3['gulv'] and not f3['skjult'], (b3.get('brist'), f3))
            sjekk(f'ingen konsollfeil (hint og innbrudd, 3D {hvor})', not pg.errs, pg.errs[:6])
            await pg.close()
        # 56) Hår og pynt på hodet
        #     Papiljottene og den andre pynten sitter på hodet og svever ikke over det (8.png): minst 15 prosent av pynten ligger over hodet
        #     for begge kjønn i alle tre retninger, hornene og svulsten minst 10 prosent. Issen måles på hodebildet (hodeTopp), pynten dreies
        #     med et hode som vipper, og HUD-portrettet krymper ikke hodet for pynt som ikke stikker over kanten. Også kontrollene i GRAFIKKLEVERANSE.md:
        #     hjortens kropp står over beina, frisyrene fra ChatGPT på personalet dekker hodet, og ansiktstilbehøret sitter på ansiktet.
        PYNT56 = """() => { const ut = { lav: [], min: {}, topp: [], kode: 0 };
          const dekning = (H, Q, ox, oy) => { const S = 128, W = 420, cx = 210, cy = 330, c = document.createElement('canvas'); c.width = c.height = W; const g = c.getContext('2d'),
              img = (P, x, y) => g.drawImage(P.canvas, cx + (x - P.ax) * S, cy - (y + P.h - P.ay) * S, P.w * S, P.h * S);
            img(H, 0, 0); const h = g.getImageData(0, 0, W, W).data; g.clearRect(0, 0, W, W); img(Q, ox, oy); const q = g.getImageData(0, 0, W, W).data;
            let n = 0, over = 0; for (let i = 3; i < q.length; i += 4) if (q[i] > 128) { n++; if (h[i] > 128) over++; } return n ? over / n : 0; };
          for (const kjonn of ['m', 'k']) {
            for (const id in PAS_PYNT) { if (PAS_PYNT[id].face) continue; const D = Pasient.deler({ v: 1, kjonn, pynt: [id] }), p = D.pynt[0];
              for (const v of ['f', 's', 'b']) { const a = dekning(D.hode[v], p.P, p.L.off[v][0], p.L.off[v][1]); ut.min[id] = Math.min(ut.min[id] ?? 1, +a.toFixed(3)); if (a < .15) ut.lav.push([id, kjonn, v, +a.toFixed(3)]); } }
            const D = Pasient.deler({ v: 1, kjonn });
            for (const k of ['horn', 'svulst']) for (const v of ['f', 's', 'b']) { const H = D.hode[v], o = LOOKS[k].off[v] || LOOKS[k].off.f, a = dekning(H, addonPart(k), o[0], o[1] + hodeTopp(H) - .78); ut.min[k] = Math.min(ut.min[k] ?? 1, +a.toFixed(3)); if (a < .1) ut.lav.push([k, kjonn, v, +a.toFixed(3)]); }
            for (const v of ['f', 's', 'b']) ut.topp.push(+hodeTopp(D.hode[v]).toFixed(3));
          }
          ut.kode = +hodeTopp(Art.part('test56_kodehode', 1.2, 1.1, .6, .1, drawPasientHead('f', {}))).toFixed(3);
          // HUD-portrettet: med papiljotter står hodet like stort som uten pynt (nederste del av bildet er lik), med nattlue krymper det
          const rader = look => { const c = portraitCanvas('pasient', look); return c.getContext('2d').getImageData(0, 72, 128, 56).data; }, ulik = (a, b) => { let n = 0; for (let i = 3; i < a.length; i += 4) if (Math.abs(a[i] - b[i]) > 40) n++; return n; };
          const u = rader({ v: 1, kjonn: 'm' }); ut.hud = { papiljotter: ulik(u, rader({ v: 1, kjonn: 'm', pynt: ['papiljotter'] })), nattlue: ulik(u, rader({ v: 1, kjonn: 'm', pynt: ['nattlue:#b3261e'] })) };
          return ut; }"""
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg)
        ut = await pg.evaluate(PYNT56)
        sjekk('papiljotter og annen pynt ligger minst 15 prosent over hodet for begge kjønn forfra, fra siden og bakfra (horn og svulst minst 10)', not ut['lav'], ut)
        sjekk('issen på hodene fra ChatGPT måles til .78, det tegnede reservehodet høyere (.84 til .96)', all(abs(t - .78) <= .02 for t in ut['topp']) and .84 <= ut['kode'] <= .96, [ut['topp'], ut['kode']])
        sjekk('HUD-portrettet krymper hodet for nattlua, men ikke for papiljottene', ut['hud']['papiljotter'] == 0 and ut['hud']['nattlue'] > 50, ut['hud'])
        rot = await pg.evaluate("""() => { const G = MORBIDIUM, ut = {}, r = .3, c = Math.cos(r), s = Math.sin(r), fasit = (base, o) => [base.position.x + o[0] * c - o[1] * s, base.position.y + o[0] * s + o[1] * c];
          const d = Pasient.dukke({ v: 1, kjonn: 'k', pynt: ['papiljotter', 'plaster'] }); d.update(.016, {});
          ut.dukke = ['f', 's', 'b'].map(v => { d.head.rotation.z = r; d.placeAddons(v); const a = d.addons[0], f = fasit(d.head, a.L.off[v]); return +Math.max(Math.abs(a.m.position.x - f[0]), Math.abs(a.m.position.y - f[1]), Math.abs(a.m.rotation.z - r)).toFixed(4); });
          d.dispose();
          // pasientens tillegg fra gjenstandene (placeLook) følger også hodet
          const P = G.player, pd = P.doll; Items.clearLook(); const m = partMesh(addonPart('horn'), pd.U); pd.plane.add(m); Items.addons.horn = m;
          pd.head.rotation.z = r; Items.placeLook(); const v = pd.view || 'f', o = LOOKS.horn.off[v] || LOOKS.horn.off.f, f = fasit(pd.head, [o[0], o[1] + hodeTopp(pd.head.userData.P) - .78]);
          ut.look = +Math.max(Math.abs(m.position.x - f[0]), Math.abs(m.position.y - f[1])).toFixed(4); Items.clearLook(); return ut; }""")
        sjekk('pynten og tilleggene dreies med hodet når det vipper (0,3 radianer)', all(x <= .001 for x in rot['dukke']) and rot['look'] <= .001, rot)
        # Den hvite hjorten (GRAFIKKLEVERANSE.md): kroppen fra ChatGPT har bunnen på festepunktet, så den må løftes over beina (de starter på .95),
        # og toppen må nå opp til halsen (hodet henger på 1.55), ellers ligger kroppen på bakken under et hode som svever
        hj = await pg.evaluate("""() => { const d = LAGDUKKE.hjort.deler[0], P = d.P(), W = P.canvas.width, H = P.canvas.height, a = P.canvas.getContext('2d').getImageData(0, 0, W, H).data; let lo = -1, hi = -1;
          for (let y = 0; y < H; y++) { let n = 0; for (let x = 0; x < W; x++) if (a[(y * W + x) * 4 + 3] > 128) n++; if (n > W * .05) { if (hi < 0) hi = y; lo = y; } }
          const opp = y => +(d.y + P.h - P.ay - y / 128).toFixed(2); return { bilde: SPRITES.hjort_kropp ? spriteReady('hjort_kropp') : 'mangler', bunn: opp(lo + 1), topp: opp(hi), hals: LAGDUKKE.hjort.deler[1].y }; }""")
        sjekk('hjortens kropp står over beina og når opp til halsen', hj['bilde'] is True and .6 <= hj['bunn'] <= .95 and hj['topp'] >= hj['hals'], hj)
        # frisyrene og ansiktstilbehøret fra ChatGPT på personalet (Oppskrift.kleDeler): håret er en parykk som skal dekke hodet, ikke sveve over det
        # (før lå 1 til 7 prosent av håret over hodet), munnbindet under øynene og gassmasken over ansiktet (før dekket begge øynene og pannen)
        op = await pg.evaluate("""() => { const D = Oppskrift.deler(), ut = { har: {}, lav: [], bind: [], maske: [] }, alle = [];
          for (const hs in D.hode || {}) for (const hn in D.hode[hs]) alle.push(D.hode[hs][hn]);
          const dekning = (H, Q, ox, oy) => { const S = 100, W = 360, cx = 180, cy = 300, c = document.createElement('canvas'); c.width = c.height = W; const g = c.getContext('2d'),
              img = (P, x, y) => g.drawImage(P.canvas, cx + (x - P.ax) * S, cy - (y + P.h - P.ay) * S, P.w * S, P.h * S);
            img(H, 0, 0); const h = g.getImageData(0, 0, W, W).data; g.clearRect(0, 0, W, W); img(Q, ox, oy); const q = g.getImageData(0, 0, W, W).data;
            let n = 0, over = 0; for (let i = 3; i < q.length; i += 4) if (q[i] > 128) { n++; if (h[i] > 128) over++; } return n ? over / n : 0; };
          const kle = (hode, kind, set) => { const f = [], d = { setParts() { }, addAddon(P, L) { f.push(L); } }; Oppskrift.kleDeler(d, hode, null, kind === 'tilbehor' ? null : set, kind, kind === 'tilbehor' ? set : null); return f[0]; };
          for (const s in D.har || {}) for (const n in D.har[s]) for (const hode of alle) for (const v of ['f', 's', 'b']) { const L = kle(hode, 'har', D.har[s][n]); if (!hode[v] || !L || !L.views[v]) continue;
            const o = L.off[v], a = dekning(Oppskrift.delPart(hode[v], 'hode'), L.views[v], o[0], o[1]); ut.har[s + n] = Math.min(ut.har[s + n] ?? 1, +a.toFixed(2)); if (a < .15) ut.lav.push([s + n, v, +a.toFixed(2)]); }
          const T = (D.tilbehor || {}).ansikt || {};
          for (const hode of alle) for (const v of ['f', 's']) { const hh = Oppskrift.delPart(hode[v], 'hode').dh;
            if (T[2]) { const L = kle(hode, 'tilbehor', T[2]); ut.bind.push(+((L.off[v][1] + L.views[v].dh) / hh).toFixed(2)); }
            if (T[3]) { const L = kle(hode, 'tilbehor', T[3]); ut.maske.push(+((L.off[v][1] + L.views[v].dh / 2) / hh).toFixed(2)); } }
          ut.lav = ut.lav.slice(0, 8); return ut; }""")
        sjekk('frisyrene fra ChatGPT dekker hodet (minst 15 prosent av håret over hodet på alle hodene og i alle retningene)', len(op['har']) >= 6 and not op['lav'], op)
        sjekk('munnbindet har overkanten under øynene og gassmasken står midt på ansiktet', op['bind'] and op['maske'] and all(.38 <= x <= .5 for x in op['bind']) and all(.3 <= x <= .5 for x in op['maske']), [op['bind'], op['maske']])
        # dødskortet med papiljotter
        await pg.evaluate("() => { const G = MORBIDIUM; G.run.look = { v: 1, kjonn: 'm', har: 'brun', hud: 0, klaer: 'kape', farge: 'sennep', sko: 'tofler', pynt: ['papiljotter'] }; G.player.invuln = 0; playerDie(); }")
        el = await pg.wait_for_selector('#deadc', timeout=60000); await pg.wait_for_timeout(300)
        await el.screenshot(path='/tmp/e_56_papiljotter.png')
        sjekk('ingen konsollfeil (hår og pynt)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 57) Snøfall
        #     Snøen faller i tre lag på skjermkortet i stedet for 220 harde firkanter i en fast boks (6.png): midtlaget er Vaer.obj med vindsus,
        #     to lag på lav kvalitet, boksen dekker det som synes på PC, stående og liggende telefon og med kameraavstand 1,25, tiden følger
        #     spilltiden, alt ryddes når været stopper, enkel grafikk gir runde prikker i stedet for firkanter, gasslyktene får snø i lyset i stedet
        #     for møll, sirissene tier og vindsuset øker i kastene, og snøen koster høyst tre tegnekall.
        HJELP57 = """const G = MORBIDIUM, vent = t => new Promise(r => setTimeout(r, t)), ramme = n => new Promise(r => { const f = () => --n <= 0 ? r() : requestAnimationFrame(f); requestAnimationFrame(f); }),
            spill = async (t, maks = 30000) => { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < t && performance.now() - t0 < maks) await vent(40); }, ut = {};
          // det synlige rektangelet i høyden h, fra hjørnene av bildet langs kameraets retning (uavhengig av hvordan snøen regner boksen)
          const synlig = h => { const c = R.camera, f = new THREE.Vector3(); c.getWorldDirection(f); const r = { x0: 1e9, x1: -1e9, z0: 1e9, z1: -1e9 };
            for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const p = new THREE.Vector3(a, b, -1).unproject(c); p.addScaledVector(f, (h - p.y) / f.y); r.x0 = Math.min(r.x0, p.x); r.x1 = Math.max(r.x1, p.x); r.z0 = Math.min(r.z0, p.z); r.z1 = Math.max(r.z1, p.z); } return r; };
          const dekker = () => { const B = window.Sno && Sno.boks(); if (!B) return { ok: false, B }; const a = synlig(0), b = synlig(B.ytop * .98), inn = r => r.x0 >= B.x0 && r.x1 <= B.x1 && r.z0 >= B.z0 && r.z1 <= B.z1;
            return { ok: inn(a) && inn(b), rimelig: B.x1 - B.x0 <= a.x1 - a.x0 + 4 && B.z1 - B.z0 <= b.z1 - a.z0 + 4, B: [B.x0, B.x1, B.z0, B.z1].map(v => +v.toFixed(1)), bunn: [a.x0, a.x1, a.z0, a.z1].map(v => +v.toFixed(1)), topp: [b.z0, b.z1].map(v => +v.toFixed(1)) }; };
          const snoEtasje = async () => { let s = 1; for (; s < 600; s++) { const F = generateFloor(s + 7919, 1, {}); if (F.vaer === 'sno' && F.rooms.some(r => r.ute && r.template === 'hage')) break; }
            G.run.seed = s; startFloor(1, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } rolig(); R.shakeOn = false; const P = G.player; P.hp = P.maxHp = 1e6; P.invuln = 999;
            const L = G.props.find(o => o.kind === 'lyktestolpe'), c = L ? freeSpot(L.x + 2, L.z + 1, 3) : P; P.x = c.x; P.z = c.z; P.vx = P.vz = 0; R.snapCamera(P.x, P.z); await spill(.4); return s; };
          const kall = () => { const info = R.renderer.info; info.autoReset = false; info.reset(); R.render(0); const n = info.render.calls; info.autoReset = true; return n; };"""
        LOGIKK57 = """async () => { """ + HJELP57 + """
          ut.frø = await snoEtasje(); const F = G.F, har = !!window.Sno;
          ut.lag = { vaer: F.vaer, n: har ? Sno.lag.length : -1, midt: har && Sno.lag.length > 1 && Vaer.obj === Sno.lag[1].pts, points: !!(Vaer.obj && Vaer.obj.isPoints), shader: !!(Vaer.obj && Vaer.obj.material.isShaderMaterial), lyd: Sound.vaerType };
          // tiden i shaderen følger spilltiden og står i pausen
          if (har) { const t0 = Sno.U.uTid.value, g0 = G.time; await spill(.5); ut.tid = { spill: +(G.time - g0).toFixed(3), sno: +(Sno.U.uTid.value - t0).toFixed(3) }; G.state = 'panel'; const t1 = Sno.U.uTid.value; await vent(400); ut.tid.pause = Sno.U.uTid.value - t1; G.state = 'play'; }
          // gasslyktene har snø i lyset og ingen møll
          const E = Glod.liste.filter(E => E.eier && E.eier.kind === 'lyktestolpe'); ut.lykt = { lykter: G.props.filter(o => o.kind === 'lyktestolpe').length, sno: E.filter(E => E.type === 'lyssno').length, moll: E.filter(E => E.type === 'moll').length };
          // ingen sirisser, og vindsuset øker i et kast
          Stemning.etasje = G.depth; if (har) Sno.kast = 0; const M0 = Stemning.maal(); if (har) Sno.kast = 1; const M1 = Stemning.maal(); if (har) Sno.kast = 0;
          ut.lyd = { natt: 'amb_natt' in M0, vind0: M0.amb_vind ? +M0.amb_vind[0].toFixed(3) : 0, vind1: M1.amb_vind ? +M1.amb_vind[0].toFixed(3) : 0 };
          // tegnekall: snøen mot ingen snø
          await ramme(2); const k1 = kall(); const lag = har ? Sno.lag.map(L => L.pts) : []; const info = R.renderer.info; await ramme(2); const g1 = info.memory.geometries, t1 = info.memory.textures;
          Vaer.stopp(); await ramme(3); const k0 = kall(), g0 = info.memory.geometries, t0 = info.memory.textures;
          ut.kall = { med: k1, uten: k0 }; ut.rydd = { g1, g0, t1, t0, iScenen: lag.filter(o => o.parent).length + R.scene.children.filter(o => o.userData && o.userData.sno).length, obj: Vaer.obj, type: Vaer.type, lyd: Sound.vaerType || null };
          // en runde til: tilbake til det samme
          Vaer.start(F); await ramme(3); const g2 = info.memory.geometries; Vaer.stopp(); await ramme(3); ut.rydd.igjen = [g2, info.memory.geometries];
          // enkel grafikk: ingen lag på skjermkortet, de gamle prikkene er runde og holder seg i en boks som følger kameraet
          R.safe = true; Vaer.start(F); const V = Vaer, m = V.obj && V.obj.material; await spill(.6);
          let paa = 0, levende = 0; if (V.obj) for (let i = 0; i < V.n; i++) { const y = V.p[i * 3 + 1]; if (y < -40) continue; levende++; const q = R.project(V.p[i * 3], y, V.p[i * 3 + 2]); if (q.x >= 0 && q.x <= innerWidth && q.y >= 0 && q.y <= innerHeight) paa++; }
          ut.enkel = { lag: har ? Sno.lag.length : -1, points: !!(V.obj && V.obj.isPoints), kart: !!(m && m.map), str: m ? m.size : 0, andel: +(paa / Math.max(1, levende)).toFixed(2), type: V.type };
          R.safe = false; Vaer.start(F); await spill(.3);
          return ut; }"""
        DEKNING57 = """async (kamera) => { """ + HJELP57 + """
          R.view = 11.5 * kamera; R.resize(); await spill(.3); await ramme(2); return dekker(); }"""
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg)
        ut = await pg.evaluate(LOGIKK57)
        la = ut['lag']
        sjekk('snøen faller i tre lag på skjermkortet, og midtlaget er Vaer.obj med vindsus (del 37)', la['vaer'] == 'sno' and la['n'] == 3 and la['midt'] and la['points'] and la['shader'] and la['lyd'] == 'vind', la)
        ti = ut.get('tid', {})
        sjekk('fnuggene faller med spilltiden og står stille i pausen', ti and abs(ti['sno'] - ti['spill']) < 1e-3 and ti['spill'] > .4 and ti['pause'] == 0, ti)
        sjekk('gasslyktene har snø i lyset og ingen møll når det snør', ut['lykt']['lykter'] > 0 and ut['lykt']['sno'] >= ut['lykt']['lykter'] and ut['lykt']['moll'] == 0, ut['lykt'])
        sjekk('ingen sirisser mens det snør, og vindsuset øker i kastene', not ut['lyd']['natt'] and ut['lyd']['vind0'] > 0 and ut['lyd']['vind1'] >= 1.7 * ut['lyd']['vind0'], ut['lyd'])
        sjekk('snøen koster høyst tre tegnekall (2D)', 2 <= ut['kall']['med'] - ut['kall']['uten'] <= 3, ut['kall'])
        rd = ut['rydd']
        sjekk('Vaer.stopp rydder snøen: geometriene tilbake, ingen lag i scenen, ingen lyd', rd['g0'] <= rd['g1'] - 3 and rd['igjen'][1] == rd['g0'] and rd['igjen'][0] == rd['g1'] and rd['t0'] < rd['t1'] and rd['iScenen'] == 0 and rd['obj'] is None and rd['type'] is None and rd['lyd'] is None, rd)
        en = ut['enkel']
        sjekk('enkel grafikk: ingen snø på skjermkortet, de gamle prikkene er runde, og de fleste synes', en['lag'] == 0 and en['points'] and en['kart'] and en['str'] >= 4 and en['andel'] >= .6 and en['type'] == 'sno', en)
        for navn, vp, kam in (('PC 1280x720', (1280, 720), 1), ('stående telefon 390x844', (390, 844), 1), ('liggende telefon 844x390', (844, 390), 1), ('PC med kameraavstand 1,25', (1280, 720), 1.25), ('stående telefon med kameraavstand 1,25', (390, 844), 1.25)):
            await pg.set_viewport_size({'width': vp[0], 'height': vp[1]}); await pg.wait_for_timeout(500)
            d = await pg.evaluate(DEKNING57, kam)
            sjekk(f'boksen snøen faller i dekker det som synes fra bakken til toppen ({navn}), og er ikke mye større', d['ok'] and d['rimelig'], d)
        sjekk('ingen konsollfeil (snøfall)', not pg.errs, pg.errs[:6])
        await pg.close()
        UA57 = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        # og i 3D: tre lag på høy, to på lav, lyset fra lampene og tegnekallene, med skjermbilder på PC og stående telefon
        for navn, kw in (('1280', {'viewport': {'width': 1280, 'height': 720}}), ('390', {'viewport': {'width': 390, 'height': 844}, 'has_touch': True, 'is_mobile': True, 'device_scale_factor': 2, 'user_agent': UA57})):
            pg = await ny_side(b, **kw)
            await start_lop(pg, url=URL3D)
            ut = await pg.evaluate("""async () => { """ + HJELP57 + """
              ut.frø = await snoEtasje(); await spill(1.5); const har = !!window.Sno;
              ut.d3 = D3.on && D3.bygd; ut.kval = D3.kval(); ut.lag = har ? Sno.lag.length : -1; ut.lys = har ? Sno.U.uLysF.value.filter(v => v.x + v.y + v.z > .05).length : 0; ut.dekker = dekker().ok;
              const k1 = kall(); Vaer.stopp(); const k0 = kall(); ut.kall = k1 - k0;
              G.meta.settings.kvalitet = 1; ut.lavKval = D3.kval(); Vaer.start(G.F); ut.lav = har ? Sno.lag.length : -1; G.meta.settings.kvalitet = 0; Vaer.start(G.F); await spill(1.5);
              return ut; }""")
            await pg.screenshot(path=f'/tmp/e_57_sno_{navn}.png')
            sjekk(f'3D ({navn}): tre lag på {ut["kval"]}, to på lav, lyset fra lampene når fnuggene, boksen dekker bildet og høyst tre tegnekall', ut['d3'] and ut['lag'] == 3 and ut['lavKval'] == 'lav' and ut['lav'] == 2 and ut['lys'] >= 1 and ut['dekker'] and 2 <= ut['kall'] <= 3, ut)
            sjekk(f'ingen konsollfeil (snøfall i 3D, {navn})', not pg.errs, pg.errs[:6])
            await pg.close()

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

        # 59) Skinnlauget: Lærlingen og Klokkeren går til angrep på tre etasjer, laugets stans deler én nedkjøling, bjella treffer i sølvringen
        #     og ikke utenfor, høyst ti kjettinger samtidig, én klokker per rom, fiendeindeksen og Enkel grafikk
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg)
        la = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), ut = { etasjer: {} },
            til = async (f, t = 4, maks = 40000) => { const g0 = G.time, t0 = performance.now(); while (!f() && G.time - g0 < t && performance.now() - t0 < maks) await vent(50); return !!f(); },
            spill = async (t, maks = 20000) => { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < t && performance.now() - t0 < maks) await vent(50); };
          if (typeof Laug !== 'object') return { mangler: true };
          // alle treff fra lauget går gjennom Laug.treff, som gir true når pasienten tok skade
          const skade = {}, _lt = Laug.treff; Laug.treff = function (shape, o, dmg, src) { const r = _lt.apply(Laug, arguments); if (r && src) skade[src.type] = (skade[src.type] || 0) + 1; return r; };
          const rom = () => { const r = G.F.rooms.find(r => r.role === 'combat' && r.w >= 8 && r.h >= 8) || G.F.rooms.find(r => r.role === 'combat') || G.F.rooms[0]; P.x = r.x + r.w / 2; P.z = r.z + r.h / 2; return r; };
          const ved = (dx, dz) => freeSpot(P.x + dx, P.z + dz, 3), mot = e => [Math.hypot(P.x - e.x, P.z - e.z), Math.atan2(P.x - e.x, P.z - e.z)];
          try {
            // hver type, på etasje 3, 4 og 6: legger an innen 6 sekunder spilltid og skader en pasient med 400 i helse innen 20
            for (const d of [3, 4, 6]) {
              startFloor(d, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } rolig(); rom(); P.hp = P.maxHp = 400; P.invuln = 0; for (const k in skade) delete skade[k];
              const s1 = ved(2.4, 0), l = spawnEnemy('laerling', s1.x, s1.z, false, d), s2 = ved(-4.5, 1), k = spawnEnemy('klokker', s2.x, s2.z, false, d); k.kallT = 1e9;
              const g0 = G.time, t0 = performance.now(), E = { l: {}, k: {} };
              while (G.time - g0 < 20 && performance.now() - t0 < 120000) { await vent(60); const t = G.time - g0; if (P.hp < 150) P.hp = 400;
                if (l.state === 'wind' && E.l.wind === undefined) E.l.wind = t; if (k.state === 'wind' && E.k.wind === undefined) E.k.wind = t;
                if (skade.laerling && E.l.skade === undefined) E.l.skade = t; if (skade.klokker && E.k.skade === undefined) E.k.skade = t;
                if (E.l.skade !== undefined && E.k.skade !== undefined) break; }
              ut.etasjer[d] = E; for (const e of [l, k]) if (e.alive) killEntity(e, {}); await spill(.3);
            }
            rolig(); rom(); P.hp = P.maxHp = 9999; P.invuln = 0;
            // laugets stans: av tre på under to sekunder får pasienten bare den første, og etter nedkjølingen kommer den igjen
            const o = { x: P.x, z: P.z, r: 1 }, stans = []; G.laugStunT = 0; // en stans fra kampene over kan ligge under to sekunder bak
            for (let i = 0; i < 3; i++) { P.invuln = 0; P.iframe = 0; P.stunT = 0; Laug.treff('circle', o, 1, { type: 'laerling', x: P.x, z: P.z }, .6, 'SPENT FAST'); stans.push(P.stunT > 0); await spill(.3); }
            await spill(2.2); P.invuln = 0; P.stunT = 0; Laug.treff('circle', o, 1, { type: 'klokker', x: P.x, z: P.z }, .35, 'HEKTET'); stans.push(P.stunT > 0); ut.stans = stans;
            // bjella: lyden kommer først, sølvringen treffer den som står i den, og ikke den som har gått to ruter ut av den
            const s3 = ved(-5, 0), k = spawnEnemy('klokker', s3.x, s3.z, false, 4); k.kallT = 1e9; await til(() => k.state !== 'spawn');
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
            for (let i = 0; i < 5; i++) { const v = i / 5 * Math.PI * 2, s = ved(Math.sin(v) * 5, Math.cos(v) * 5), e = spawnEnemy('klokker', s.x, s.z, false, 4); e.kallT = 1e9; kl.push(e); }
            Laug.flereKlokkere = false; await til(() => kl.every(e => e.state !== 'spawn'));
            for (const e of kl) { e.ringN = 2; e.ringT = 0; e.state = 'chase'; const [dist, a] = mot(e); Grotesk.ai.klokker(e, P, dist, a); e.cd = 99; }
            let maks = 0; { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < 2.2 && performance.now() - t0 < 40000) { maks = Math.max(maks, Kjeder.liste.length); await vent(30); } }
            ut.kjeder = maks; for (const e of kl) killEntity(e, {}); await spill(1);
            // Enkel grafikk: ingen kjettinger tegnes, men treffet og skaden kommer som før
            R.safe = true; const s4 = ved(-5, 0), ks = spawnEnemy('klokker', s4.x, s4.z, false, 4); ks.kallT = 1e9; await til(() => ks.state !== 'spawn'); rom();
            Laug.sistTreff = -1; ks.ringN = 2; ks.ringT = 0; ks.state = 'chase'; P.invuln = 0; skade.klokker = 0; { const [dist, a] = mot(ks); Grotesk.ai.klokker(ks, P, dist, a); } ks.cd = 99;
            let kjS = 0; { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < 1.6 && performance.now() - t0 < 30000) { kjS = Math.max(kjS, Kjeder.liste.length); await vent(40); } }
            ut.safe = { kjeder: kjS, treff: Laug.sistTreff > 0, skade: skade.klokker > 0 }; R.safe = false; killEntity(ks, {});
          } finally { Laug.treff = _lt; R.safe = false; Laug.flereKlokkere = false; }
          ut.info = ['laerling', 'klokker'].every(t => (FIENDE_INFO[t] || [])[0] && FIENDE_INFO[t][1] && FIENDE_REKKE.includes(t) && MESTER_TITTEL[t] && FIENDESTEMME[t] && LINES[t] && DEATH_CAUSES[t]) && !ROLLER.laerling && !ROLLER.klokker;
          ut.bilde = ['laerling', 'klokker'].map(t => { const c = fiendeBilde(t, 160, 190), d = c.getContext('2d').getImageData(0, 0, 160, 190).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 100) n++; return n / (160 * 190); });
          ut.pulje = { 3: DEPTH_ENEMIES[3].filter(t => t === 'laerling').length, 4: [DEPTH_ENEMIES[4].filter(t => t === 'laerling').length, DEPTH_ENEMIES[4].filter(t => t === 'klokker').length], 6: [DEPTH_ENEMIES[6].filter(t => t === 'laerling').length, DEPTH_ENEMIES[6].filter(t => t === 'klokker').length] };
          return ut; }""")
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
        # 3D: begge i kamp, med kjettinger fra mørket (én runde, 3D er tungt i programvaregrafikk)
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg, url=URL3D)
        d3 = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), ut = {};
          if (typeof Laug !== 'object') return { mangler: true };
          startFloor(4, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } rolig(); P.hp = P.maxHp = 9999; ut.d3 = D3.on;
          const r = G.F.rooms.find(r => r.role === 'combat' && r.w >= 8 && r.h >= 8) || G.F.rooms[0]; P.x = r.x + r.w / 2; P.z = r.z + r.h / 2; R.snapCamera(P.x, P.z);
          const s1 = freeSpot(P.x + 2.2, P.z + .3, 3), l = spawnEnemy('laerling', s1.x, s1.z, false, 4), s2 = freeSpot(P.x - 3.8, P.z - 1.2, 3), k = spawnEnemy('klokker', s2.x, s2.z, false, 4); k.kallT = 1e9;
          const S = { l: {}, k: {} }, g0 = G.time, t0 = performance.now(); let kj = 0;
          while (G.time - g0 < 14 && performance.now() - t0 < 150000) { await vent(80); P.hp = 9999; S.l[l.state] = 1; S.k[k.state] = 1; kj = Math.max(kj, Kjeder.liste.length); if (S.l.wind && S.k.wind && kj && k.state === 'wind' && Kjeder.liste.length) break; }
          ut.S = S; ut.kjeder = kj; return ut; }""")
        sjekk('i 3D legger begge an, og krokene kommer fra mørket', not d3.get('mangler') and d3.get('d3') and d3['S']['l'].get('wind') and d3['S']['k'].get('wind') and d3['kjeder'] > 0, d3)
        await pg.screenshot(path='/tmp/e_59_laug_3d.png')
        sjekk('ingen konsollfeil (Skinnlauget i 3D)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 60) Havet under huset: Avløpsarmen ligger under risten og kan ikke treffes der, er aldri lenge under når pasienten står nær,
        #     det er aldri mer enn tre av dem, grepet drar pasienten til risten, og Kapellanens preken, avbrutte preken, kall og død
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg)
        hv = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), ut = { etasjer: {} },
            til = async (f, t = 4, maks = 120000) => { const g0 = G.time, t0 = performance.now(); while (!f() && G.time - g0 < t && performance.now() - t0 < maks) await vent(50); return !!f(); },
            spill = async (t, maks = 60000) => { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < t && performance.now() - t0 < maks) await vent(50); },
            iKastere = e => Dybde.kastere().some(k => k.k === e), sluk = r => G.props.filter(p => p.kind === 'drain' && p.room === r.id);
          if (typeof Havet !== 'object') return { mangler: true };
          const skade = {}, _ht = Havet.treff; Havet.treff = function (shape, o, dmg, src) { const r = _ht.apply(Havet, arguments); if (r && src) skade[src.type] = (skade[src.type] || 0) + 1; return r; };
          // et kamprom med rist, og et fritt sted et stykke unna risten (med sikt)
          const rom = () => { const rs = G.F.rooms.filter(r => r.role === 'combat' && r.w >= 7 && r.h >= 7 && sluk(r).length).sort((a, b) => b.w * b.h - a.w * a.h); return rs[0] || G.F.rooms.find(r => sluk(r).length) || G.F.rooms[0]; };
          const ved = (s, d) => { for (let i = 0; i < 24; i++) { const v = i / 24 * Math.PI * 2, x = s.x + Math.sin(v) * d, z = s.z + Math.cos(v) * d; if (!solid(Math.floor(x), Math.floor(z)) && !solid(Math.floor(x + .3), Math.floor(z)) && !solid(Math.floor(x - .3), Math.floor(z)) && los(s.x, s.z, x, z)) return { x, z }; } return freeSpot(s.x + d, s.z, 3); };
          const mot = e => [Math.hypot(P.x - e.x, P.z - e.z), Math.atan2(P.x - e.x, P.z - e.z)];
          try {
            // hver type der den hører hjemme: legger an innen 6 sekunder spilltid og skader en pasient med 400 i helse innen 20
            for (const d of [3, 4, 6]) {
              startFloor(d, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } rolig(); const r = rom(), s = sluk(r)[0]; if (!s) { ut.etasjer[d] = { utenSluk: true }; continue; }
              P.hp = P.maxHp = 400; P.invuln = 0; for (const k in skade) delete skade[k];
              const a = spawnEnemy('avlopsarm', s.x, s.z, false, d), p0 = ved(s, 2.4); P.x = p0.x; P.z = p0.z;
              let k = null; if (d >= 4) { const ks = ved(s, 5); k = spawnEnemy('kapellan', ks.x, ks.z, false, d); k.kallT = 1e9; }
              const g0 = G.time, t0 = performance.now(), E = { a: {}, k: {} };
              while (G.time - g0 < 20 && performance.now() - t0 < 150000) { await vent(60); const t = G.time - g0; if (P.hp < 150) P.hp = 400; P.x = p0.x; P.z = p0.z;
                if (a.state === 'wind' && E.a.wind === undefined) E.a.wind = t; if (skade.avlopsarm && E.a.skade === undefined) E.a.skade = t;
                if (k) { if (k.state === 'wind' && E.k.wind === undefined) E.k.wind = t; if (skade.kapellan && E.k.skade === undefined) E.k.skade = t; }
                if (E.a.skade !== undefined && (!k || E.k.skade !== undefined)) break; }
              if (!k) delete E.k; ut.etasjer[d] = E; for (const e of [a, k]) if (e && e.alive) killEntity(e, {}); await spill(.3);
            }
            startFloor(4, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } rolig(); P.hp = P.maxHp = 1e6;
            const r = rom(), s = sluk(r)[0];
            // under risten: ingen skade, ingen lykteskygge, ikke nærmest. Pasienten langt unna, så den blir liggende
            P.x = s.x + 30; P.z = s.z + 30; const a = spawnEnemy('avlopsarm', s.x, s.z, false, 4); a.hp = a.max = 1e6; await til(() => a.state !== 'spawn');
            const hu = a.hp; ut.under = { dukket: a.dukket === true, skjult: !a.doll.root.visible, skade: hurt(a, 30, { from: 'player' }), hp: a.hp === hu, skygge: iKastere(a), naermest: nearestEnemy(a.x, a.z, 99) === a, iSluk: Math.hypot(a.x - s.x, a.z - s.z) < .05 };
            // pasienten kommer nær: opp innen litt over et halvt sekund, og da biter slagene
            const p1 = ved(s, 2.5); P.x = p1.x; P.z = p1.z; P.invuln = 999; const tOpp = G.time; ut.oppe = { kom: await til(() => !a.dukket, 3) }; ut.oppe.tid = G.time - tOpp;
            await til(() => false, .2); Object.assign(ut.oppe, { skade: hurt(a, 30, { from: 'player' }) > 0, skygge: iKastere(a), naermest: nearestEnemy(a.x, a.z, 99) === a, synlig: a.doll.root.visible, baand: [a.doll.back.n, a.doll.front.n] });
            // armen lever: tuppen flytter seg selv når armen står stille
            a.cd = 99; await til(() => !a.anim && a.state === 'chase', 3); const tp = a.doll.deler[0].m.position, t1 = [tp.x, tp.y]; await spill(.4); ut.oppe.lever = Math.hypot(tp.x - t1[0], tp.y - t1[1]);
            // med pasienten innen fem ruter er den aldri under lenger enn 2,6 sekunder spilltid, og den dykker og kommer opp igjen
            a.cd = 0; let under = 0, maksUnder = 0, dykk = 0, sist = a.dukket; { const g0 = G.time, t0 = performance.now(); let gt = G.time;
              while (G.time - g0 < 14 && performance.now() - t0 < 120000) { await vent(40); const dt = G.time - gt; gt = G.time; P.x = p1.x; P.z = p1.z; P.hp = 1e6;
                if (a.dukket) { under += dt; maksUnder = Math.max(maksUnder, under); } else under = 0; if (a.dukket && !sist) dykk++; sist = a.dukket; } }
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
            const S = {}; { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < 5 && performance.now() - t0 < 40000) { await vent(60); S[sa.state] = 1; S['k' + sk.state] = 1; } } ut.safe = S; R.safe = false;
            for (const e of [sa, sk]) if (e.alive) killEntity(e, {});
          } finally { Havet.treff = _ht; R.safe = false; }
          ut.info = ['avlopsarm', 'kapellan'].every(t => (FIENDE_INFO[t] || [])[0] && FIENDE_INFO[t][1] && FIENDE_REKKE.includes(t) && MESTER_TITTEL[t] && FIENDESTEMME[t] && LINES[t] && DEATH_CAUSES[t]) && !ROLLER.avlopsarm && !ROLLER.kapellan;
          ut.bilde = ['avlopsarm', 'kapellan'].map(t => { const c = fiendeBilde(t, 160, 190), d = c.getContext('2d').getImageData(0, 0, 160, 190).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 100) n++; return n / (160 * 190); });
          const tell = (d, t) => DEPTH_ENEMIES[d].filter(x => x === t).length;
          ut.pulje = { 3: [tell(3, 'avlopsarm'), tell(3, 'kapellan')], 4: [tell(4, 'avlopsarm'), tell(4, 'kapellan')], 6: [tell(6, 'avlopsarm'), tell(6, 'kapellan')] };
          return ut; }""")
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
        # 3D: armen kommer opp av risten og legger an, og Kapellanen preker (én runde, 3D er tungt i programvaregrafikk)
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg, url=URL3D)
        d3 = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), ut = {};
          if (typeof Havet !== 'object') return { mangler: true };
          startFloor(4, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } rolig(); P.hp = P.maxHp = 1e6; ut.d3 = D3.on;
          const r = G.F.rooms.filter(r => r.role === 'combat' && G.props.some(p => p.kind === 'drain' && p.room === r.id)).sort((a, b) => b.w * b.h - a.w * a.h)[0] || G.F.rooms[0], s = G.props.find(p => p.kind === 'drain' && p.room === r.id) || { x: r.x + r.w / 2, z: r.z + r.h / 2 };
          const p0 = freeSpot(s.x - 2.2, s.z + .3, 2); P.x = p0.x; P.z = p0.z; R.snapCamera(P.x, P.z);
          const a = spawnEnemy('avlopsarm', s.x, s.z, false, 4), ks = freeSpot(s.x - 3, s.z - 2.5, 3), k = spawnEnemy('kapellan', ks.x, ks.z, false, 4); k.kallT = 1e9;
          const S = { a: {}, k: {} }, g0 = G.time, t0 = performance.now(); let baand = 0;
          while (G.time - g0 < 14 && performance.now() - t0 < 150000) { await vent(80); P.hp = 1e6; P.invuln = 999; S.a[a.fase + ':' + a.state] = 1; if (k.preken) S.k.preken = 1; baand = Math.max(baand, a.doll.back.n); if (S.a['opp:wind'] && S.k.preken) break; }
          ut.S = S; ut.baand = baand; return ut; }""")
        sjekk('i 3D kommer armen opp av risten og legger an, og Kapellanen preker', not d3.get('mangler') and d3.get('d3') and d3['S']['a'].get('opp:wind') and d3['S']['k'].get('preken') and 0 < d3['baand'] < 3200, d3)
        await pg.screenshot(path='/tmp/e_60_havet_3d.png')
        sjekk('ingen konsollfeil (Havet under huset i 3D)', not pg.errs, pg.errs[:6])
        await pg.close()

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

        # 62) Oldermann Nålepute: minisjefen leser opp dagsorden i boblen og gjør sakene i den rekkefølgen han sa, med klubbeslag mellom,
        #     hver sak for seg (nåler, kjettinger som drar, klubba, votering med tak på lærlinger, eventuelt), årsmøtet ved halv helse,
        #     aldri i parken, fiendeindeksen, Enkel grafikk og én runde i 3D
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg)
        om = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), ut = {},
            til = async (f, t = 4, maks = 40000) => { const g0 = G.time, t0 = performance.now(); while (!f() && G.time - g0 < t && performance.now() - t0 < maks) await vent(50); return !!f(); },
            spill = async (t, maks = 20000) => { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < t && performance.now() - t0 < maks) await vent(50); };
          if (typeof Oldermann !== 'object' || !ENEMIES.oldermann) return { mangler: true };
          startFloor(4, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } rolig(); P.hp = P.maxHp = 1e6; P.invuln = 0;
          const r = G.F.rooms.find(r => r.role === 'combat' && r.w >= 10 && r.h >= 8) || G.F.rooms.find(r => r.role === 'combat') || G.F.rooms[0];
          const midt = () => { P.x = r.x + r.w / 2 + .5; P.z = r.z + r.h / 2 + .5; }; midt();
          // det som blir sagt: boblene hans (teksten slik den står), tall og ord over hodene (#fx .dmg), lydene, og varslene han legger
          const bobler = [], tall = [], lyder = [], teleSett = new Set(); let samle = true;
          const _b = Oldermann.boble; Oldermann.boble = function (e) { const el = _b.apply(Oldermann, arguments); bobler.push({ t: G.time, tekst: el ? [...el.children].map(d => d.textContent) : [], ref: e.referat.length }); return el; };
          const mo = new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.classList && n.classList.contains('dmg')) tall.push(n.textContent); }); mo.observe(document.getElementById('fx'), { childList: true });
          const _sp = Sound.play; Sound.play = function (n) { lyder.push(n); return _sp.apply(Sound, arguments); };
          (async () => { while (samle) { for (const t of G.tele) if (t.owner && t.owner.type === 'oldermann') teleSett.add(t); await vent(15); } })();
          const varsler = () => [...teleSett].map(t => ({ shape: t.shape, r: t.o.r, w: t.o.w, len: t.o.len, type: t.o.type }));
          // det han faktisk gjør (angrepet som kjøres), ikke bare det referatet sier
          const gjort = [], FN = { naaler: 'naal', kjeder: 'kjede', klubba: 'klubbe', votering: 'votering' }, _fn = {};
          for (const f in FN) { _fn[f] = Oldermann[f]; Oldermann[f] = function (e) { if (e && e.referat) gjort.push({ ref: e.referat.length, e, k: FN[f] }); return _fn[f].apply(Oldermann, arguments); }; }
          try {
            // tre dagsordener i vanlig kamp: det han gjør, er det han sa, i samme rekkefølge
            const s0 = freeSpot(P.x + 3, P.z, 3), o = spawnEnemy('oldermann', s0.x, s0.z, false, 4);
            { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < 70 && performance.now() - t0 < 240000) { await vent(80); P.hp = 1e6; o.hp = o.max; if ((o.referat || []).filter(a => a.ferdig).length >= 3) break; } }
            ut.referat = (o.referat || []).filter(a => a.ferdig).slice(0, 3).map(a => ({ saker: a.saker, utfort: a.utfort }));
            // den første boblen i hver dagsorden er hele dagsorden, i den rekkefølgen sakene ble gjort
            ut.bobler = [1, 2, 3].map(n => { const b = bobler.find(x => x.ref === n); return b ? b.tekst : null; });
            // angrepene i hver dagsorden: Eventuelt er den saken boblen sa, og votering blir klubba når det er fullt
            ut.gjort = (o.referat || []).filter(a => a.ferdig).slice(0, 3).map(a => { const n = o.referat.indexOf(a) + 1; return { saker: a.saker, ev: a.ev, gjort: gjort.filter(g => g.e === o && g.ref === n).map(g => g.k) }; });
            ut.gjortRiktig = ut.gjort.length === 3 && ut.gjort.every(a => a.gjort.length === a.saker.length && a.saker.every((k, j) => a.gjort[j] === (k === 'eventuelt' ? a.ev : k) || (k === 'votering' && a.gjort[j] === 'klubbe')));
            ut.bobleRekke = ut.referat.map((a, i) => { const b = ut.bobler[i] || [], navn = a.saker.map(k => Oldermann.NAVN[k]); return b[0] === 'Dagsorden:' && navn.every((nv, j) => (b[j + 1] || '').startsWith((j + 1) + '. ' + nv)); });
            ut.tall = tall.filter(s => /Dagsorden|Sak |Knappenål|Kjetting|Klubba|Votering|Eventuelt/.test(s));
            ut.klubbe = lyder.filter(n => n === 'klubbe').length; ut.bokslag = lyder.filter(n => n === 'bokslag').length;
            ut.saker = ut.referat.reduce((s, a) => s + a.utfort.length, 0);
            // hver sak for seg, satt opp for hånd
            rolig(); midt(); await spill(.3);
            const o2 = spawnEnemy('oldermann', freeSpot(P.x, P.z, 3).x, freeSpot(P.x, P.z, 3).z, false, 4); await til(() => o2.state !== 'spawn'); o2.cd = 1e9;
            // pasienten settes der han ser Oldermannen (ellers venter saken, og testen har stoppet ham med cd), med litt plass rundt
            const fri = (x, z) => [[0, 0], [.45, 0], [-.45, 0], [0, .45], [0, -.45]].every(([a, c]) => !solid(Math.floor(x + a), Math.floor(z + c)));
            const plasser = d => { let s = null; for (let i = 0; i < 32 && !s; i++) { const v = i / 32 * Math.PI * 2, x = o2.x + Math.sin(v) * d, z = o2.z + Math.cos(v) * d; if (fri(x, z) && los(o2.x, o2.z, x, z)) s = { x, z }; } s = s || freeSpot(o2.x + d, o2.z, 3); P.x = s.x; P.z = s.z; P.kvx = P.kvz = 0; P.stunT = 0; P.invuln = 0; P.iframe = 0; P.deny = null; G.laugStunT = 0; };
            const sak = async (saker, d, t = 1.8) => {
              await til(() => o2.state !== 'wind', 3); o2.state = 'chase'; o2.stun = 0; plasser(d); teleSett.clear();
              o2.dagsorden = { saker, i: 0, cd: .35, ev: null, vent: null }; (o2.referat || (o2.referat = [])).push({ saker, utfort: [] });
              const hp0 = P.hp, d0 = Math.hypot(P.x - o2.x, P.z - o2.z), n0 = Oldermann.skutt || 0, t0n = tall.length; Oldermann.sak(o2, P, d0, Math.atan2(P.x - o2.x, P.z - o2.z)); o2.cd = 1e9;
              await spill(t); const r = { tele: varsler(), skade: hp0 - P.hp, d0, d1: Math.hypot(P.x - o2.x, P.z - o2.z), proj: (Oldermann.skutt || 0) - n0, ord: tall.slice(t0n, t0n + 8), ev: o2.referat[o2.referat.length - 1].ev };
              o2.dagsorden = null; P.hp = 1e6; return r; };
            ut.naal = await sak(['naal'], 4);
            // står pasienten feil for saken, venter han (høyst 2,5 s), og dagsorden blir stående i boblen så lenge
            { await til(() => o2.state !== 'wind', 3); o2.state = 'chase'; o2.stun = 0; plasser(4);
              o2.dagsorden = { saker: ['naal'], i: 0, cd: 1e9, ev: null, vent: null }; o2.cd = 1e9; o2.referat.push({ saker: ['naal'], utfort: [] }); const bel = Oldermann.boble(o2, -1); await spill(1.5);
              const langt = { x: o2.x + 20, z: o2.z }, g0 = G.time, t0 = performance.now(); let borte = 0, n = 0, fyrt = null;
              while (G.time - g0 < 3.2 && performance.now() - t0 < 30000) { if (fyrt === null) { Oldermann.sak(o2, langt, 20, 0); o2.cd = 1e9; if (o2.dagsorden.i === 1) fyrt = +(G.time - g0).toFixed(2); else { n++; if (!bel.isConnected) borte++; } } await vent(60); }
              ut.vent = { fyrt, borte, n }; await til(() => o2.state !== 'wind', 3); o2.dagsorden = null; P.hp = 1e6; }
            ut.kjede = await sak(['kjede'], 5.5); ut.kjede.hektet = !!(P.statusT && P.statusT.HEKTET !== undefined);
            ut.klubbe1 = await sak(['klubbe'], 1.6);
            for (const e of G.enemies) if (e.alive && e.type === 'laerling') killEntity(e, {});
            ut.vote = await sak(['votering'], 3, 2.2); ut.vote.lar = G.enemies.filter(e => e.alive && e.type === 'laerling').length;
            { const s = freeSpot(o2.x - 3, o2.z + 2, 3); spawnEnemy('laerling', s.x, s.z, false, 4); } for (const e of G.enemies) if (e.alive && e.type === 'laerling') e.cd = 1e9;
            ut.vote2 = await sak(['votering'], 1.6, 2.2); ut.vote2.lar = G.enemies.filter(e => e.alive && e.type === 'laerling').length;
            for (const e of G.enemies) if (e.alive && e.type === 'laerling') killEntity(e, {});
            ut.ev = await sak(['eventuelt'], 2);
            // halv helse: ekstraordinært årsmøte, fire sølvringer rundt pasienten og klokkeren kommer. Etterpå er det tre saker og Eventuelt
            await til(() => o2.state !== 'wind', 3); o2.state = 'chase'; plasser(3); teleSett.clear(); for (const e of G.enemies) if (e.alive && e.type === 'klokker') killEntity(e, {});
            o2.hp = o2.max * .45; Grotesk.ai.oldermann(o2, P, 3, 0); o2.cd = 1e9;
            await vent(50); ut.aarsBoble = [...document.querySelectorAll('#fx .bubble')].map(e => e.textContent).join(' | ');
            await spill(2.4); ut.aars = { ringer: varsler().filter(t => t.shape === 'circle' && t.type === 'lenke' && t.r === 1.3).length, klokker: G.enemies.filter(e => e.alive && e.type === 'klokker').length };
            await til(() => o2.state !== 'wind', 3); o2.state = 'chase'; Oldermann.les(o2, P, 0); ut.aars.saker = o2.dagsorden.saker.length; ut.aars.sist = o2.dagsorden.saker[3];
            // Enkel grafikk: varslene og nålene kommer, men ingen kjettinger tegnes
            o2.dagsorden = null; o2.cd = 1e9; for (const e of G.enemies) if (e.alive && e !== o2) killEntity(e, {});
            await til(() => !Kjeder.liste.length, 4); R.safe = true; let kjS = 0; const kt = setInterval(() => { kjS = Math.max(kjS, Kjeder.liste.length); }, 20);
            ut.safe = { kjede: await sak(['kjede'], 5), naal: await sak(['naal'], 4) }; clearInterval(kt); ut.safe.kjeder = kjS; ut.safe.for = Kjeder.liste.length; R.safe = false;
            // boblen med dagsorden er varselet: den holdes inne på skjermen når han står langt utenfor, og synes selv om snakkeboblene er slått av
            { document.body.classList.add('uten-bobler'); const falsk = { x: P.x - 40, z: P.z + 1, alive: true, bubbleH: 4.3, referat: [], dagsorden: { saker: ['naal', 'kjede', 'eventuelt'], i: 0 } };
              const el = Oldermann.boble(falsk, 0, 'Møtet er satt.'); await spill(.2); const rb = el.getBoundingClientRect(), W = document.getElementById('fx').getBoundingClientRect();
              ut.klem = { synlig: el.isConnected && getComputedStyle(el).display !== 'none' && rb.width > 0, inne: rb.left >= W.left - 1 && rb.right <= W.right + 1 && rb.top >= W.top - 1, l: Math.round(rb.left), r: Math.round(rb.right), t: Math.round(rb.top) };
              // står han langt nord og til venstre, havner boblen i hjørnet under panelet: den skyves ned så ingenting i toppen dekker den
              falsk.z = P.z - 30; await spill(.2); const rb2 = el.getBoundingClientRect(), over = ['badge', 'miniBar', 'bossBar', 'tools', 'mapring'].filter(id => { const r = document.getElementById(id).getBoundingClientRect(); return r.width && r.height && rb2.left < r.right && rb2.right > r.left && rb2.top < r.bottom && rb2.bottom > r.top; });
              ut.klem.hjorne = { over, t: Math.round(rb2.top), b: Math.round(rb2.bottom), panel: Math.round(document.getElementById('badge').getBoundingClientRect().bottom), mini: !document.getElementById('miniBar').classList.contains('hidden') };
              falsk.alive = false; document.body.classList.remove('uten-bobler'); await spill(.1); }
            killEntity(o2, {}); await spill(.8);
            // aldri i parken: 60 etasjefrø i Parken gir aldri Oldermannen, i Kjelleren kommer han
            const F = G.F, frø = F.seed, d0 = G.depth, risk = F.rooms.find(r => r.role === 'risk') || F.rooms[0], rolle = risk.role; risk.role = 'risk';
            const telle = d => { G.depth = d; let n = 0; for (let s = 1; s <= 60; s++) { F.seed = s * 7919; Mini.onFloor(); if (Object.values(Mini.rom).includes('oldermann')) n++; } return n; };
            ut.park = telle(1); ut.kjeller = telle(4); F.seed = frø; G.depth = d0; risk.role = rolle; Mini.onFloor();
          } finally { Oldermann.boble = _b; Sound.play = _sp; Object.assign(Oldermann, _fn); mo.disconnect(); samle = false; R.safe = false; document.body.classList.remove('uten-bobler'); }
          ut.info = !!((FIENDE_INFO.oldermann || [])[0] && FIENDE_INFO.oldermann[1] && SJEF_REKKE.includes('oldermann') && MINISJEFER.includes('oldermann') && FIENDESTEMME.oldermann && LINES.oldermann && DEATH_CAUSES.oldermann) && !ROLLER.oldermann;
          ut.bilde = (() => { const c = fiendeBilde('oldermann', 160, 190), d = c.getContext('2d').getImageData(0, 0, 160, 190).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 100) n++; return n / (160 * 190); })();
          return ut; }""")
        sjekk('Oldermann Nålepute finnes (Oldermann i 50_skinnlauget.js)', not om.get('mangler'), om.get('mangler', ''))
        if not om.get('mangler'):
            R = om['referat']
            sjekk('tre dagsordener er ferdige, og hver ender med Eventuelt etter to saker', len(R) == 3 and all(len(a['saker']) == 3 and a['saker'][-1] == 'eventuelt' for a in R), R)
            sjekk('over tre dagsordener gjør han sakene i nøyaktig den rekkefølgen han sa', len(R) == 3 and all(a['utfort'] == a['saker'] for a in R), R)
            sjekk('angrepene han faktisk gjør, følger dagsorden (Eventuelt som boblen sa, votering eller klubba)', om['gjortRiktig'], om['gjort'])
            sjekk('dagsorden står i boblen, med sakene i samme rekkefølge', len(om['bobleRekke']) == 3 and all(om['bobleRekke']), om['bobler'])
            sjekk('dagsorden og sakene kommer aldri som tall eller ord over hodet', om['tall'] == [], om['tall'])
            sjekk('bokslag for hver dagsorden og et klubbeslag for hver sak', om['bokslag'] >= 3 and om['klubbe'] >= om['saker'], {k: om[k] for k in ['bokslag', 'klubbe', 'saker']})
            n = om['naal']
            sjekk('knappenåler: et rektangel 2,2 bredt og 8 langt, så tre salver med fem nåler som treffer', any(t['shape'] == 'rect' and t['w'] == 2.2 and t['len'] == 8 for t in n['tele']) and n['proj'] == 15 and n['skade'] > 0, n)
            v = om['vent']
            sjekk('står pasienten feil, venter han høyst 2,5 s, og dagsorden blir stående i boblen mens han venter', v['fyrt'] is not None and 2.3 <= v['fyrt'] <= 2.9 and v['n'] > 5 and v['borte'] == 0, v)
            k = om['kjede']
            sjekk('kjettinger: en sølvring på 1,6 der pasienten står, som treffer, hekter og drar ham inn', any(t['shape'] == 'circle' and t['r'] == 1.6 and t['type'] == 'lenke' for t in k['tele']) and k['skade'] > 0 and k['hektet'] and k['d1'] < k['d0'] - 1, k)
            kl = om['klubbe1']
            sjekk('klubba: en ring på 2,6 rundt ham, som treffer og slår pasienten bakover', any(t['shape'] == 'circle' and t['r'] == 2.6 for t in kl['tele']) and kl['skade'] > 0 and kl['d1'] > kl['d0'] + 1, kl)
            sjekk('votering: to lærlinger kommer', om['vote']['lar'] == 2, om['vote'])
            sjekk('votering med tre lærlinger i live: ingen flere, og klubba i stedet', om['vote2']['lar'] == 3 and any(t['shape'] == 'circle' and t['r'] == 2.6 for t in om['vote2']['tele']), om['vote2'])
            ev = om['ev']; forv = {'naal': ('rect', None), 'kjede': ('circle', 1.6), 'klubbe': ('circle', 2.6)}.get(ev['ev'])
            sjekk('eventuelt: en av de tre første, og varselet passer til den', forv is not None and any(t['shape'] == forv[0] and (forv[1] is None or t['r'] == forv[1]) for t in ev['tele']), ev)
            a = om['aars']
            sjekk('halv helse: «Ekstraordinært årsmøte!», fire sølvringer, klokkeren kommer, og så tre saker og Eventuelt', 'Ekstraordinært årsmøte' in om['aarsBoble'] and a['ringer'] == 4 and a['klokker'] == 1 and a['saker'] == 4 and a['sist'] == 'eventuelt', [om['aarsBoble'], a])
            s = om['safe']
            sjekk('Enkel grafikk: sølvringen og nålene kommer og treffer, men ingen kjettinger tegnes', s['kjeder'] == 0 and s['kjede']['skade'] > 0 and s['naal']['proj'] == 15, s)
            sjekk('dagsorden holdes inne på skjermen når han står utenfor, og synes selv om snakkeboblene er av', om['klem']['synlig'] and om['klem']['inne'], om['klem'])
            sjekk('dagsorden havner aldri bak panelet, minisjeflinja, knappene eller kompasset', om['klem']['hjorne']['over'] == [] and om['klem']['hjorne']['t'] >= om['klem']['hjorne']['panel'], om['klem'])
            sjekk('aldri i parken, men han kommer i Kjelleren', om['park'] == 0 and om['kjeller'] > 0, [om['park'], om['kjeller']])
            sjekk('fiendeindeksen (blant minisjefene), replikker, stemme og dødsårsaker, og ikke i ROLLER', om['info'], om['info'])
            sjekk('fiendeBilde tegner ham', om['bilde'] > .08, om['bilde'])
        await pg.screenshot(path='/tmp/e_62_oldermann.png')
        sjekk('ingen konsollfeil (Oldermann Nålepute)', not pg.errs, pg.errs[:6])
        # håndbokssiden med minisjefene: får plass på PC og telefon
        hbs = []
        for vp in [{'width': 1280, 'height': 720}, {'width': 390, 'height': 844}]:
            await pg.set_viewport_size(vp)
            await pg.goto(URL); await pg.wait_for_function("() => window.MORBIDIUM && MORBIDIUM.state === 'title'", timeout=60000); await pg.wait_for_timeout(500)
            hb = await pg.evaluate("""() => { if (!SJEF_REKKE.includes('oldermann')) return { mangler: true }; const kap = HANDBOK.findIndex(h => h.id === 'sjefer'), per = document.body.clientWidth <= 700 ? 2 : 4; openHandbook({}, kap, Math.floor(SJEF_REKKE.indexOf('oldermann') / per));
              return { navn: [...document.querySelectorAll('.fkort .fnavn')].map(e => e.textContent) }; }""")
            await pg.wait_for_timeout(300)
            hb['plass'] = await pg.evaluate(HB_PLASS) if not hb.get('mangler') else False
            hbs.append(hb)
            await pg.screenshot(path=f"/tmp/e_62_handbok_{vp['width']}.png")
        sjekk('håndboka har Oldermann Nålepute blant minisjefene, og siden får plass på PC og telefon', all('Oldermann Nålepute' in h.get('navn', []) and h['plass'] for h in hbs), hbs)
        sjekk('ingen konsollfeil (Oldermann i håndboka)', not pg.errs, pg.errs[:6])
        await pg.close()
        # 3D: han leser dagsorden og gjør den første saken (én runde, 3D er tungt i programvaregrafikk)
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg, url=URL3D)
        d3 = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), ut = {};
          if (typeof Oldermann !== 'object') return { mangler: true };
          startFloor(4, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } rolig(); P.hp = P.maxHp = 1e6; ut.d3 = D3.on;
          const r = G.F.rooms.find(r => r.role === 'combat' && r.w >= 10 && r.h >= 8) || G.F.rooms.find(r => r.role === 'combat') || G.F.rooms[0]; P.x = r.x + r.w / 2 + .5; P.z = r.z + r.h / 2 + .5; R.snapCamera(P.x, P.z);
          const s = freeSpot(P.x + 3.5, P.z - 1, 3), o = spawnEnemy('oldermann', s.x, s.z, false, 4);
          const g0 = G.time, t0 = performance.now(); let sett = {};
          while (G.time - g0 < 16 && performance.now() - t0 < 150000) { await vent(60); P.hp = 1e6; sett[o.state] = 1; if (o.dagsorden && o.dagsorden.i >= 1 && o.state === 'wind' && o.teles.length) break; }
          G.hitstop = 30; // nesten stillstand mens bildet tas
          ut.sett = sett; ut.boble = [...document.querySelectorAll('#fx .bubble')].map(e => e.textContent).join(' | '); ut.varsel = o.teles.length; return ut; }""")
        await pg.wait_for_timeout(250)
        await pg.screenshot(path='/tmp/e_62_oldermann_3d.png')
        sjekk('i 3D leser han dagsorden og legger an til den første saken', not d3.get('mangler') and d3.get('d3') and 'Dagsorden' in d3.get('boble', '') and d3.get('varsel', 0) > 0, d3)
        await pg.evaluate("() => { MORBIDIUM.hitstop = 0; }")
        sjekk('ingen konsollfeil (Oldermann i 3D)', not pg.errs, pg.errs[:6])
        await pg.close()

        await b.close()
    print('\n' + ('Alt gikk bra.' if not feil else 'Feilet: ' + ', '.join(feil)))
    sys.exit(1 if feil else 0)

asyncio.run(main())
