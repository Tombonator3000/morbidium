"""Kontrollerer utebildene i den bygde spillfila og tar ekte spillbilder.

python3 tools/test_utegrafikk.py --three /sti/three.min.js --ut /tmp/utegrafikk
MORBIDIUM_BROWSER kan peke på en allerede installert Chromium.
"""
import argparse
import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright

ROT = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--three', default=os.environ.get('MORBIDIUM_THREE'))
parser.add_argument('--ut', type=Path, default=Path('/tmp/morbidium-utegrafikk'))
args = parser.parse_args()

KONTROLL = """() => {
  const feil = [], keys = [...Object.keys(UTE_FLATER), 'prop_gran'];
  for (const k of keys) if (!SPRITES[k] || !Art.img[k]?.naturalWidth) feil.push('Bildet mangler: ' + k);
  // Bevis at forbrukerne bruker PNG-en, og at reservetegningen fremdeles virker.
  const tegn = (k, bilde) => {
    // Paint.bilde lager bildet på nytt fra SPRITES når Art.img mangler, så reserven tegnes uten begge
    const im = Art.img[k], sp = SPRITES[k]; if (!bilde) { delete Art.img[k]; delete SPRITES[k]; }
    try {
      if (k.startsWith('vegg_')) {
        const tex = Paint.wallTex(THEMES[1], k.slice(5));
        const url = tex.image.toDataURL(); tex.dispose(); return url;
      }
      const c = document.createElement('canvas'); c.width = c.height = 128;
      const g = c.getContext('2d');
      GULV[k.slice(5)](g, 0, 0, 128, { x: 1, z: 1, th: THEMES[1], ute: true, kant: {} });
      if (!g.getImageData(0, 0, 128, 128).data.some(v => v)) feil.push('Tom flate: ' + k);
      return c.toDataURL();
    } finally { Art.img[k] = im; SPRITES[k] = sp; }
  };
  for (const k of Object.keys(UTE_FLATER).filter(k => k !== 'gulv_sno'))
    if (tegn(k, true) === tegn(k, false)) feil.push('PNG blir ikke brukt: ' + k);
  // Snø og landskapsbakke har egne forbrukere og samme ressurslevetid som før.
  const G = MORBIDIUM, F = Object.assign({}, G.F, {vaer: 'sno'});
  const vinter = Paint.floorCanvas(F, THEMES[1]);
  const im = Art.img.gulv_sno; delete Art.img.gulv_sno;
  const reserve = Paint.floorCanvas(F, THEMES[1]); Art.img.gulv_sno = im;
  if (vinter.image.toDataURL() === reserve.image.toDataURL()) feil.push('Snøbildet blir ikke brukt');
  vinter.dispose(); reserve.dispose();
  const old = Paint.mesh.bakke, n = Paint.owned.length, gruppe = new THREE.Group();
  Landskap.bakke(F, THEMES[1], gruppe);
  if (!Paint.mesh.bakke.material.map.image.width) feil.push('Tom landskapsbakke');
  for (const r of Paint.owned.splice(n)) r.dispose(); Paint.mesh.bakke = old;
  return { bilder: keys.length, feil };
}"""

SCENE = """({depth, weather, template}) => {
  const G = MORBIDIUM; Drom.lag = () => null;
  let valgt = null;
  for (let seed = 1; seed <= 300; seed++) {
    const F = generateFloor(seed + depth * 7919, depth);
    if ((weather === 'sno' ? F.vaer === 'sno' : F.vaer !== 'sno') && F.rooms.some(r => r.template === template)) { valgt = seed; break; }
  }
  if (valgt === null) throw new Error('Fant ikke kontrollrom: ' + template);
  G.run.seed = valgt; startFloor(depth, false); rolig();
  const r = G.F.rooms.find(r => r.template === template);
  const pos = freeSpot(r.x + r.w / 2, r.z + r.h / 2, 4);
  G.player.x = pos.x; G.player.z = pos.z; G.player.invul = 100;
  R.snapCamera(pos.x, pos.z);
  // Ventekriteriet nedenfor bruker spilltid, ikke maskinens renderhastighet.
  const traer = R.level.children.reduce((o, g) => {
    const k = g.userData?.m?.userData?.P?.key;
    if (k && /^prop_(gran|tre|busk|bjork)$/.test(k)) o[k] = (o[k] || 0) + 1;
    return o;
  }, {});
  return { seed: valgt, weather: G.F.vaer, room: template, time: G.time, three: D3.on, simple: R.safe, traer };
}"""

async def main():
    args.ut.mkdir(parents=True, exist_ok=True)
    rapport = {'kontroller': [], 'feil': []}
    async with async_playwright() as p:
        launch = {'args': ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']}
        if os.environ.get('MORBIDIUM_BROWSER'): launch['executable_path'] = os.environ['MORBIDIUM_BROWSER']
        browser = await p.chromium.launch(**launch)
        try:
            for modus in ['3d', 'enkel']:
                page = await browser.new_page(viewport={'width': 1280, 'height': 720})
                page.on('pageerror', lambda e: rapport['feil'].append(str(e)))
                page.on('console', lambda m: rapport['feil'].append(m.text) if m.type == 'error' else None)
                if args.three:
                    await page.route('**/three.min.js', lambda r: r.fulfill(path=args.three, content_type='application/javascript'))
                    await page.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
                await page.goto((ROT / 'dist/morbidium.html').as_uri() + '?' + modus)
                await page.locator('#tNew').click()
                await page.locator('[data-awk]').first.click()
                await page.wait_for_function('MORBIDIUM.state === "play"')
                if modus == '3d':
                    resultat = await page.evaluate(KONTROLL)
                    rapport['feil'].extend(resultat['feil'])
                    print('Bilder og reserver:', resultat, flush=True)
                for depth, weather, template in [(1, 'klart', 'hage'), (1, 'sno', 'hage'), (1, 'klart', 'drivhus'), (5, 'klart', 'bjorkeskog'), (5, 'klart', 'myr'), (5, 'klart', 'ruin')]:
                    resultat = await page.evaluate(SCENE, {'depth': depth, 'weather': weather, 'template': template})
                    await page.wait_for_function('(t) => MORBIDIUM.time > t + .8', arg=resultat['time'], timeout=60000)
                    navn = f"{modus}-{template}-{resultat['weather']}.png"
                    await page.screenshot(path=str(args.ut / navn))
                    if bool(resultat['three']) != (modus == '3d'): rapport['feil'].append('Feil grafikkmodus: ' + navn)
                    if not resultat['traer'].get('prop_gran'): rapport['feil'].append('Graner ble sortert bort: ' + navn)
                    rapport['kontroller'].append(dict(resultat, bilde=navn))
                    print('Scene:', navn, resultat, flush=True)
                await page.close()
        finally:
            await browser.close()
    (args.ut / 'rapport.json').write_text(json.dumps(rapport, indent=2, ensure_ascii=False) + '\n')
    print('Feil:', rapport['feil'], flush=True)
    if rapport['feil']: raise SystemExit(1)

if __name__ == '__main__':
    asyncio.run(main())
