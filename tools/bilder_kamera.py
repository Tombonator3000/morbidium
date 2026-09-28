"""Tar sammenligningsbilder av samme sted i spillet med ulike kameravalg og etterbehandling.

Bruk:  python3 tools/bilder_kamera.py [--three STI] [--ut MAPPE] [valg ...]
  valg er tillegg i adressen, for eksempel  kamera=iso  kamera=lav  kamera=iso&lys=gammel
  Uten valg tas bilder med dagens kamera og med kamera=iso.
Hvert valg gir tre bilder: et kamprom inne (etasje 2), et rom i kjelleren (etasje 4) og parken (etasje 1),
med samme frø, så bildene kan legges ved siden av hverandre. Bildene havner i MAPPE (standard /tmp/kamera).
"""
import pathlib, os, sys, asyncio
from playwright.async_api import async_playwright
arg = sys.argv[1:]
THREE = os.environ.get('MORBIDIUM_THREE')
UT = '/tmp/kamera'
valg = []
i = 0
while i < len(arg):
    if arg[i] == '--three': THREE = arg[i + 1]; i += 2
    elif arg[i] == '--ut': UT = arg[i + 1]; i += 2
    else: valg.append(arg[i]); i += 1
valg = valg or ['', 'kamera=iso']
URL = (pathlib.Path(__file__).resolve().parent.parent / 'dist' / 'morbidium.html').as_uri()
os.makedirs(UT, exist_ok=True)

# samme frø og samme rom hver gang: det første kamprommet med et bord eller en seng, pasienten midt i, fiendene stille
STED = """([d, seed]) => { const G = MORBIDIUM; G.run.seed = seed; startFloor(d, false);
  for (const e of G.enemies) if (e.alive) killEntity(e, {}); G.combat = null; G.lock = null; for (const b of G.barriers) b.up = false; G.rooms.forEach(s => s.cleared = true);
  const rom = G.F.rooms.filter(r => r.role === 'combat' || r.role === 'start').sort((a, b) => b.w * b.h - a.w * a.h)[0] || G.F.rooms[0];
  const P = G.player; P.x = rom.x + rom.w / 2; P.z = rom.z + rom.h / 2; P.hp = P.maxHp = 9999; P.invuln = 999;
  for (let k = 0; k < 3; k++) spawnEnemy(['pleier', 'kultist', 'oppasser'][k], P.x - 2.5 + k * 2.5, P.z - 2, {});
  return { rom: rom.role, w: rom.w, h: rom.h, fiender: G.enemies.length }; }"""

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        for v in valg:
            pg = await b.new_page(viewport={'width': 1280, 'height': 720})
            if THREE:
                await pg.route('**/three.min.js', lambda r: r.fulfill(path=THREE, content_type='application/javascript'))
                await pg.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
            errs = []
            pg.on('pageerror', lambda e: errs.append('PAGEERROR: ' + str(e)))
            pg.on('console', lambda m: errs.append(m.type + ': ' + m.text) if m.type == 'error' else None)
            await pg.goto(URL + '?3d' + ('&' + v if v else '')); await pg.wait_for_timeout(2500)
            await pg.evaluate("() => { const s = MORBIDIUM.meta.settings; s.kvalitet = 3; s.testmodus = false; applySettings(); }")
            await pg.evaluate("() => document.querySelector('#tNew').click()"); await pg.wait_for_timeout(600)
            await pg.evaluate("() => document.querySelector('[data-awk]').click()"); await pg.wait_for_timeout(2000)
            navn = (v or 'standard').replace('&', '_').replace('=', '-')
            for d, seed, n in [(2, 11, 'inne'), (4, 23, 'kjeller'), (1, 7, 'park')]:
                info = await pg.evaluate(STED, [d, seed])
                await pg.evaluate("() => { MORBIDIUM.state = 'play'; for (const id of ['panel', 'toast']) { const e = document.getElementById(id); if (e) e.classList.add('hidden'); } }")
                await pg.wait_for_timeout(3500)
                await pg.screenshot(path=f'{UT}/{navn}_{n}.png')
                print(navn, n, info)
            print(navn, 'feil:', errs[:8] or 'ingen')
            await pg.close()
        await b.close()
asyncio.run(main())
