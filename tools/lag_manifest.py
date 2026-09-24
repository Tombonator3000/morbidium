"""Oppdaterer assets/manifest.json: alle bildedeler spillet bruker, med størrelse og festepunkt.
Kjør etter python3 build.py. Krever Playwright med Chromium.

Nye nøkler flettes inn; nøkler som allerede står i manifestet, blir stående selv om spillet
ikke lager dem akkurat nå (ChatGPT kan ha levert bilder til dem). Fargevarianter (~),
sammensatte lik og oppskriftsdeler tas ikke med, de lages av spillet selv.

Bruk:  python3 tools/lag_manifest.py [--three STI]   (eller MORBIDIUM_THREE=STI, når nettet er stengt)
"""
import pathlib, os, sys
ROT = pathlib.Path(__file__).resolve().parent.parent
import asyncio, json
from playwright.async_api import async_playwright
THREE = os.environ.get('MORBIDIUM_THREE') or (sys.argv[sys.argv.index('--three') + 1] if '--three' in sys.argv else None)
JS = r"""() => {
  const out = {}, safe = f => { try { f(); } catch (e) { } };
  for (const t of Object.keys(RIG)) for (const v of ['f', 'b', 's']) for (const piece of ['hode', 'kropp', 'kappe']) safe(() => charPart(t, piece, v));
  for (const t of Object.keys(BLOBS).concat(['yngel', 'journalen'])) for (const v of ['f', 'b', 's']) safe(() => charPart(t, 'blob', v));
  for (const id of Object.keys(CARD_ART)) safe(() => cardArtCanvas(id, 8));
  for (const w of Object.keys(WEAPONS).concat(['sproyte', 'krok', 'slange'])) safe(() => weaponPart(w));
  for (const t of Object.keys(RIG)) safe(() => shoePart(RIG[t].shoe)); for (const k of ['tofler', 'hvit', 'klogg', 'stovel', 'sokk']) safe(() => shoePart(k));
  const maler = [null, 'eget', 'likhus', 'toalett', 'soppel', 'vask', 'operasjon', 'begravelse', 'kapell', 'vaktbod'];
  for (const tm of maler) for (let d = 1; d <= 4; d++) for (let s = 1; s <= 5; s++) { const F = generateFloor(s * 101 + d * 7 + (tm ? tm.length : 0), d, tm ? { startTemplate: tm, startCombat: true } : {}); for (const r of F.rooms) for (const p of r.props) if (p.k !== 'npc' && p.k !== 'puddle') { safe(() => propArt(p)); safe(() => propArt(Object.assign({}, p, { opened: true }))); } }
  for (const k of ['corpse', 'barrier', 'trapdoor']) safe(() => propArt({ k }));
  safe(heartPart); safe(morbPart); safe(cardPart); safe(pigeonPart); safe(stampDecal); safe(handPart); safe(toothPart); safe(starPart); safe(barrierArt); safe(thornArt);
  for (const id of Object.keys(CONSUMABLES)) safe(() => bottlePart(id)); for (let i = 0; i < 3; i++) safe(() => puffPart(i));
  for (const id of Object.keys(ITEMS)) safe(() => itemIcon(id)); safe(() => jarPart(null)); for (const id of Object.keys(PILL_COL)) safe(() => pillPart(id));
  for (const id of Object.keys(AKTIVE)) { safe(() => aktIcon(id)); } for (const id of Object.keys(LOMMERUSK)) { safe(() => lommeIcon(id)); safe(() => lommePart(id)); }
  for (const k of Object.keys(LOOKS)) safe(() => addonPart(k)); safe(() => shotPart('slim'));
  const skip = k => k.includes('~') || k.includes('undefined') || /^(lik_|likb|del_|lommeplukk_|glassakt_|glassbilde_)/.test(k) || (k.startsWith('glass_') && k !== 'glass_tomt') || (k.startsWith('kappe_') && !k.startsWith('kappe_kultist'));
  for (const [k, P] of Art.cache) if (!skip(k)) out[k] = { w: P.w, h: P.h, ax: P.ax, ay: P.ay, px: [P.canvas.width, P.canvas.height] };
  window.__kur = Object.assign(Object.fromEntries(Object.entries(ITEMS).map(([k, v]) => [k, { name: v.name, desc: v.desc }])), Object.fromEntries(Object.entries(AKTIVE).map(([k, v]) => ['akt:' + k, { name: v.name, desc: v.desc }])), Object.fromEntries(Object.entries(LOMMERUSK).map(([k, v]) => ['lomme:' + k, { name: v.name, desc: v.desc }])));
  return out;
}"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': 1280, 'height': 720}); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        if THREE:
            await pg.route('**/three.min.js', lambda r: r.fulfill(path=THREE, content_type='application/javascript'))
            await pg.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
        await pg.goto((ROT / 'dist' / 'morbidium.html').as_uri()); await pg.wait_for_timeout(4000)
        await pg.click('#tNew'); await pg.wait_for_timeout(400); await pg.click('[data-awk]'); await pg.wait_for_timeout(2500)
        ny = await pg.evaluate(JS)
        sti = ROT / 'assets' / 'manifest.json'; gammel = json.loads(sti.read_text(encoding='utf-8')) if sti.exists() else {}
        lagt_til = sorted(k for k in ny if k not in gammel); ikke_laget = sorted(k for k in gammel if k not in ny)
        m = dict(gammel); m.update({k: ny[k] for k in lagt_til})
        json.dump(m, open(sti, 'w'), indent=1, sort_keys=True)
        json.dump(await pg.evaluate('() => window.__kur'), open(ROT / 'assets' / 'kuriositeter.json', 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
        print('nye nøkler', len(lagt_til), lagt_til[:40])
        print('i manifestet, men ikke laget av spillet nå (beholdt):', len(ikke_laget), ikke_laget[:20])
        print('totalt', len(m), errs[:3])
        await b.close()
asyncio.run(main())
