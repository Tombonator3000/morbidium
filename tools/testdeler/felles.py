"""Det testdelene deler: adressene, sjekk, nye sider, klikk og hvordan et løp startes.

MORBIDIUM_ROT peker på bygget som testes (standard: dette repoet) og MORBIDIUM_THREE på en lokal three.min.js,
for når nettleseren ikke når cdnjs. Kjøreren tools/test_ekstra.py setter begge fra --rot og --three.
"""
import os, pathlib

ROT = pathlib.Path(os.environ.get('MORBIDIUM_ROT') or pathlib.Path(__file__).resolve().parent.parent.parent).resolve()
THREE = os.environ.get('MORBIDIUM_THREE') or None
# Rommene er 3D som standard, men programvaregrafikken i testnettleseren er så treg i 3D at tidsfølsomme
# tester bommer. Derfor går de fleste testene i 2D (?2d), som før. Testene for 3D bruker URL3D eller slår det på selv.
# Spørsmålstegn og ikke #, fordi en ny goto til samme adresse med # bare hopper i siden i stedet for å laste den på nytt.
URL3D = (ROT / 'dist' / 'morbidium.html').as_uri()
URL = URL3D + '?2d'

# sjekkene som feilet i denne kjøringen, som (del, navn). Kjøreren setter NA['del'] til delen som går.
feil = []
NA = {'del': None}


def sjekk(navn, ok, info=''):
    print(('OK    ' if ok else 'FEIL  ') + navn + (': ' + str(info) if info != '' else ''), flush=True)
    if not ok: feil.append((NA['del'], navn))


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
