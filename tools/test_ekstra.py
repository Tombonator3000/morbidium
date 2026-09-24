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
        for_ = await pg.evaluate("() => ({ d: MORBIDIUM.depth, items: MORBIDIUM.run.items.slice(), teeth: MORBIDIUM.player.teeth, name: MORBIDIUM.run.patient.name })")
        await pg.evaluate("() => showTitle()"); await pg.wait_for_timeout(800)
        har = await pg.query_selector('#tCont')
        sjekk('Fortsett-knapp på tittelen', har is not None)
        if har:
            await pg.click('#tCont'); await pg.wait_for_timeout(1500)
            etter = await pg.evaluate("() => ({ d: MORBIDIUM.depth, items: MORBIDIUM.run.items.slice(), teeth: MORBIDIUM.player.teeth, name: MORBIDIUM.run.patient.name, lvl: MORBIDIUM.player.weaponLvl, state: MORBIDIUM.state })")
            sjekk('fortsatt løp har samme etasje, tenner og kuriositeter', etter['d'] == for_['d'] and etter['items'] == for_['items'] and etter['teeth'] == for_['teeth'] and etter['name'] == for_['name'] and etter['lvl'] == 2 and etter['state'] == 'play', etter)
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

        await b.close()
    print('\n' + ('Alt gikk bra.' if not feil else 'Feilet: ' + ', '.join(feil)))
    sys.exit(1 if feil else 0)

asyncio.run(main())
