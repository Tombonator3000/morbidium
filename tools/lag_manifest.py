"""Lager assets/manifest.json: alle bildedeler spillet bruker, med størrelse og festepunkt.
Kjør etter python3 build.py. Krever Playwright med Chromium."""
import pathlib
ROT = pathlib.Path(__file__).resolve().parent.parent
import asyncio, json
from playwright.async_api import async_playwright
JS = r"""() => {
  const out = {}, safe = f => { try { f(); } catch (e) { } };
  for (const t of Object.keys(RIG)) for (const v of ['f', 'b', 's']) for (const piece of ['hode', 'kropp', 'kappe']) safe(() => charPart(t, piece, v));
  for (const t of ['yngel', 'tome', 'journalen']) for (const v of ['f', 'b', 's']) safe(() => charPart(t, 'yngel', v));
  for (const id of Object.keys(CARD_ART)) safe(() => cardArtCanvas(id, 8));
  for (const w of Object.keys(WEAPONS).concat(['sproyte', 'krok', 'slange'])) safe(() => weaponPart(w));
  for (const t of Object.keys(RIG)) safe(() => shoePart(RIG[t].shoe));
  for (const tm of [null, 'eget', 'likhus', 'toalett', 'soppel', 'vask', 'operasjon', 'begravelse']) for (let d = 1; d <= 3; d++) for (let s = 1; s <= 4; s++) { const F = generateFloor(s * 101 + d, d, tm ? { startTemplate: tm, startCombat: true } : {}); for (const r of F.rooms) for (const p of r.props) if (p.k !== 'npc' && p.k !== 'puddle') { safe(() => propArt(p)); safe(() => propArt(Object.assign({}, p, { opened: true }))); } }
  for (const k of ['corpse', 'barrier', 'trapdoor']) safe(() => propArt({ k }));
  safe(heartPart); safe(morbPart); safe(cardPart); safe(pigeonPart); safe(stampDecal); safe(handPart); safe(toothPart); safe(starPart); safe(barrierArt);
  for (const id of Object.keys(CONSUMABLES)) safe(() => bottlePart(id)); for (let i = 0; i < 3; i++) safe(() => puffPart(i));
  for (const id of Object.keys(ITEMS)) { safe(() => itemIcon(id)); } safe(() => jarPart(null)); for (const id of Object.keys(PILL_COL)) safe(() => pillPart(id));
  for (const k of Object.keys(LOOKS)) safe(() => addonPart(k)); for (const t of Object.keys(BLOBS)) for (const v of ['f', 'b', 's']) safe(() => charPart(t, 'blob', v)); safe(() => shotPart('slim'));
  window.__kur = Object.fromEntries(Object.entries(ITEMS).map(([k, v]) => [k, { name: v.name, desc: v.desc }]));
  for (const [k, P] of Art.cache) if (!(k.startsWith('kappe_') && !k.startsWith('kappe_kultist')) && !k.includes('undefined') && !k.startsWith('glass_') || k === 'glass_tomt') out[k] = { w: P.w, h: P.h, ax: P.ax, ay: P.ay, px: [P.canvas.width, P.canvas.height] };
  return out;
}"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width':1280,'height':720}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto((ROT / 'dist' / 'morbidium.html').as_uri()); await pg.wait_for_timeout(4000)
        await pg.click('#tNew'); await pg.wait_for_timeout(400); await pg.click('[data-awk]'); await pg.wait_for_timeout(2500)
        m = await pg.evaluate(JS)
        json.dump(m, open(ROT / 'assets' / 'manifest.json', 'w'), indent=1, sort_keys=True)
        json.dump(await pg.evaluate('() => window.__kur'), open(ROT / 'assets' / 'kuriositeter.json', 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
        cats = {}
        for k in m: cats.setdefault(k.split('_')[0], []).append(k)
        for c, ks in sorted(cats.items()): print(c, len(ks), ks[:6])
        print('totalt', len(m), errs[:3])
        await b.close()
asyncio.run(main())
