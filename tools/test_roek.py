"""Kort røyktest før publisering (GitHub Actions kjører den før Pages får ny versjon).

Starter spillet på PC i 3D og 2D og på telefon i 3D, begynner et løp, går ned noen etasjer og sjekker at
tegningen går, at 3D er på der det skal, og at konsollen er tom for feil. Tar rundt ett minutt.

Bruk:  python3 tools/test_roek.py [--three STI] [--fil STI | --mappe MAPPE]
  --three STI    three.min.js fra en lokal fil (når nettleseren ikke når nettet, som i Claude Code-skyen)
  --fil STI      en selvstendig HTML-fil (standard: dist/morbidium.html)
  --mappe MAPPE  en mappe med index.html som serveres over http (den delte nettversjonen)
Avslutter med kode 1 hvis noe feiler.
"""
import asyncio, functools, http.server, os, pathlib, sys, threading
from playwright.async_api import async_playwright

ROT = pathlib.Path(__file__).resolve().parent.parent
argv = sys.argv[1:]
def valg(navn, std=None):
    return argv[argv.index(navn) + 1] if navn in argv else std
THREE = os.environ.get('MORBIDIUM_THREE') or valg('--three')
MAPPE = valg('--mappe')
FIL = pathlib.Path(valg('--fil', str(ROT / 'dist' / 'morbidium.html'))).resolve()
feil = []

def sjekk(navn, ok, info=''):
    print(('OK    ' if ok else 'FEIL  ') + navn + (': ' + str(info) if info != '' else ''), flush=True)
    if not ok: feil.append(navn)

def server(mappe):
    """serverer mappa på en ledig port i en egen tråd, så fetch og lasting ved behov virker som på Pages"""
    h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(pathlib.Path(mappe).resolve()))
    h.log_message = lambda *a: None
    s = http.server.ThreadingHTTPServer(('127.0.0.1', 0), h)
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s, f'http://127.0.0.1:{s.server_address[1]}/index.html'

async def profil(b, url, navn, **kw):
    pg = await b.new_page(**kw)
    if THREE:
        await pg.route('**/three.min.js', lambda r: r.fulfill(path=THREE, content_type='application/javascript'))
        await pg.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
    errs = []
    pg.on('pageerror', lambda e: errs.append('PAGEERROR: ' + str(e)))
    pg.on('console', lambda m: errs.append(m.type + ': ' + m.text) if m.type == 'error' else None)
    try:
        await pg.goto(url, timeout=60000)
        await pg.wait_for_function("() => window.MORBIDIUM && MORBIDIUM.state === 'title'", timeout=90000)
        ut = await pg.evaluate("() => ({ d3: D3.on, safe: R.safe, telefon: R.coarse })")
        await pg.evaluate("() => document.getElementById('tNew').click()")
        await pg.wait_for_selector('[data-awk]', timeout=30000)
        await pg.evaluate("() => document.querySelector('[data-awk]').click()")
        await pg.wait_for_function("() => MORBIDIUM.state === 'play' && MORBIDIUM.time > .5", timeout=90000)
        for d in (2, 3, 5):
            await pg.evaluate("(d) => { const G = MORBIDIUM; G.player.hp = G.player.maxHp = 99999; startFloor(d, false); }", d)
            await pg.wait_for_function("(t) => MORBIDIUM.time > t", arg=await pg.evaluate("() => MORBIDIUM.time + .4"), timeout=60000)
        ut['etasje'] = await pg.evaluate("() => MORBIDIUM.depth")
        ut['kall'] = await pg.evaluate("() => R.renderer.info.render.calls")
        ut['errs'] = errs[:6]
        return ut
    except Exception as e:
        return {'unntak': str(e).splitlines()[0], 'errs': errs[:6]}
    finally:
        await pg.close()

async def main():
    srv = None
    if MAPPE:
        srv, url = server(MAPPE)
    else:
        url = FIL.as_uri()
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pc = await profil(b, url + '?3d', 'pc', viewport={'width': 1280, 'height': 720})
        sjekk('PC i 3D: tittel, nytt løp og tre etasjer uten feil i konsollen',
              'unntak' not in pc and pc['d3'] and not pc['safe'] and pc['etasje'] == 5 and pc['kall'] > 0 and not pc['errs'], pc)
        to = await profil(b, url + '?2d', 'pc2d', viewport={'width': 1280, 'height': 720})
        sjekk('PC i 2D: tittel, nytt løp og tre etasjer uten feil i konsollen',
              'unntak' not in to and not to['d3'] and to['etasje'] == 5 and to['kall'] > 0 and not to['errs'], to)
        tlf = await profil(b, url + '?3d', 'telefon', viewport={'width': 390, 'height': 844}, device_scale_factor=3, is_mobile=True, has_touch=True)
        sjekk('telefon i 3D: kjent som telefon, nytt løp og tre etasjer uten feil i konsollen',
              'unntak' not in tlf and tlf['telefon'] and tlf['d3'] and tlf['etasje'] == 5 and not tlf['errs'], tlf)
        await b.close()
    if srv: srv.shutdown()
    print('\n' + ('Røyktesten gikk bra.' if not feil else 'Røyktesten feilet: ' + ', '.join(feil)))
    return 1 if feil else 0

if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
