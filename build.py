"""Bygger Morbidium i to utgaver.

dist/morbidium.html er én selvstendig fil: bildene i assets/ferdig/ ligger inne som data-URI-er i SPRITES og lydene i
assets/lyd/ (tools/lag_lyd.py) som base64 i LYDFILER. Den virker rett fra disken, som publisert artefakt og i testene.

dist/web/ er nettutgaven (den GitHub Pages viser): index.html med bare koden, og bildene, delene og lydene som egne filer i
bilder/, deler/ og lyd/. SPRITES og LYDFILER har da adresser i stedet for innholdet, og BYGG.ute er sann. Spillet henter det
tittelen og første etasje trenger før det starter, og resten etterpå (Art.preload i 10_art.js, Lydbank i 42_lyd.js).
Nettutgaven må åpnes over http (Pages eller en lokal server), ikke fra disken.

Spillkoden pakkes i en funksjon som startes først når «Laster»-skjermen er tegnet og Three.js er hentet,
så siden aldri blir stående hvit mens noe tungt skjer. python3 build.py lager begge; --bare-fil bare den selvstendige.
"""
import base64, datetime, json, pathlib, shutil, subprocess, sys
ROT = pathlib.Path(__file__).resolve().parent
S = ROT / 'src'
parts = ['01_core.js', '02_data.js', '03_generator.js', '04_render.js', '05_world.js', '06_musikk.js', '10_art.js', '11_doll.js', '12_paint.js', '13_rom.js', '14_pasient.js', '15_rom3d.js', '16_anim.js', '17_romtyper.js', '20_actors.js', '22_sjefer.js', '25_items.js', '26_fiender.js', '27_utstyr.js', '28_oppskrift.js', '29_monstre.js', '31_sjefpulje.js', '34_blod.js', '35_hendelser.js', '36_drom.js', '32_meny.js', '33_merknader.js', '37_utefiender.js', '38_effekter.js', '39_kombo.js', '40_dybde.js', '41_historie.js', '42_lyd.js', '43_vaatt.js', '46_blekk.js', '47_sno.js', '48_skjult.js', '49_havet.js', '50_skinnlauget.js', '44_testmodus.js', '45_kart.js', '30_game.js']
ferdig = ROT / 'assets' / 'ferdig'
# teksturene (gulv_, vegg_ og bakke_) lagres som WebP av tools/behandle_bilder.py, alt annet som PNG
bildefiler = {p.stem: p for p in sorted([*ferdig.glob('*.png'), *ferdig.glob('*.webp')])} if ferdig.exists() else {}
# deler til oppskriftssystemet (assets/deler/, laget av tools/skjaer_ark.py): beskjæres til det som
# faktisk er tegnet, skaleres ned og får palett. Spillet tilpasser størrelsen selv (28_oppskrift.js),
# fordi tegningene ikke alltid holder seg til hjelpesirkelen i malen.
deler_meta, deler_png = {}, {}
meta_sti = ROT / 'assets' / 'deler' / 'deler.json'
if meta_sti.exists():
    try:
        from PIL import Image
        import io
    except ImportError:
        Image = None
    for k, m in json.loads(meta_sti.read_text(encoding='utf-8')).items():
        f = ROT / 'assets' / 'deler' / m['fil']
        if not f.exists(): continue
        if not Image: continue
        im = Image.open(f).convert('RGBA'); bb = im.getchannel('A').point(lambda v: 255 if v > 12 else 0).getbbox()
        if not bb: continue
        im = im.crop(bb); s = min(1, 200 / max(im.size)); im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
        q = im.quantize(colors=256, method=Image.Quantize.FASTOCTREE); b = io.BytesIO(); q.save(b, 'PNG', optimize=True)
        deler_png[k] = b.getvalue()
        deler_meta[k] = {'kategori': m['kategori'], 'serie': m['serie'], 'del': m['del'], 'visning': m['visning'], 'bw': im.width, 'bh': im.height}
# spriteark (anim_<navn>): rutenett og festepunkt fra manifestet, så spillet klipper arket slik bildeflyten skalerte det
man_sti = ROT / 'assets' / 'manifest.json'
manifest = json.loads(man_sti.read_text(encoding='utf-8')) if man_sti.exists() else {}
anim_ark = {k: {n: m[n] for n in ('w', 'h', 'ax', 'ay', 'ruter', 'n', 'fps') if n in m} for k, m in manifest.items() if k.startswith('anim_') and 'ruter' in m and k in bildefiler}
# lydene (assets/lyd/, laget av tools/lag_lyd.py): MP3 som base64, og det lydbanken trenger fra lyd.json (42_lyd.js)
lyd_dir = ROT / 'assets' / 'lyd'
lyd_json = json.loads((lyd_dir / 'lyd.json').read_text(encoding='utf-8')) if (lyd_dir / 'lyd.json').exists() else {}
lydsti = {k: lyd_dir / f'{k}.mp3' for k in sorted(lyd_json) if (lyd_dir / f'{k}.mp3').exists()}
lyd_meta = {k: {n: m[n] for n in ('gruppe', 'type', 'sek', 'sloyfe', 'rot') if m.get(n) not in (None, False)} for k, m in lyd_json.items() if k in lydsti}
# versjonen står i testrapporten (44_testmodus.js): når fila ble bygget, og hvilken commit
try:
    commit = subprocess.run(['git', 'rev-parse', '--short', 'HEAD'], cwd=ROT, capture_output=True, text=True, timeout=10).stdout.strip()
except Exception:
    commit = ''
bygg = {'dato': datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M UTC'), 'commit': commit}
def spillkode(ute):
    """spillkoden med dataene: innholdet selv (selvstendig fil) eller adresser til filene (nettutgaven)"""
    b64 = lambda data: base64.b64encode(data).decode()
    if ute:
        sprites = {k: f'bilder/{p.name}' for k, p in bildefiler.items()}
        deler = {k: f'deler/{k}.png' for k in deler_png}
        lydfiler = {k: f'lyd/{k}.mp3' for k in lydsti}
    else:
        sprites = {k: f'data:image/{p.suffix[1:]};base64,' + b64(p.read_bytes()) for k, p in bildefiler.items()}
        deler = {k: 'data:image/png;base64,' + b64(d) for k, d in deler_png.items()}
        lydfiler = {k: b64(p.read_bytes()) for k, p in lydsti.items()}
    game = ''
    for p in parts:
        game += (S / p).read_text(encoding='utf-8') + '\n'
        if p == '01_core.js':
            game += 'const BYGG = ' + json.dumps(dict(bygg, ute=ute)) + ';\n'
            game += 'const LYDFILER = ' + json.dumps(lydfiler) + ';\n'
            game += 'const LYD_META = ' + json.dumps(lyd_meta, ensure_ascii=False) + ';\n'
        if p == '10_art.js':
            if sprites: game += 'Object.assign(SPRITES, ' + json.dumps(sprites) + ');\n'
            if deler: game += 'Object.assign(SPRITES, ' + json.dumps(deler) + ');\n'
            game += 'const DELER_META = ' + json.dumps(deler_meta) + ';\n'
            game += 'const ANIM_ARK = ' + json.dumps(anim_ark) + ';\n'
    return game


loader = r'''
</script>
<script>
(function () {
  bootStep('Henter Three.js');
  var s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  s.onload = function () { bootStep('Starter spillet'); setTimeout(function () { try { window.__game(); } catch (e) { showErr((e && e.message) || String(e)); } }, 30); };
  s.onerror = function () { showErr('Kunne ikke hente Three.js fra cdnjs. Sjekk nettforbindelsen og prøv igjen.'); };
  requestAnimationFrame(function () { setTimeout(function () { document.head.appendChild(s); }, 30); });
})();
</script>
</body>
</html>
'''
hode = (S / '00_head.html').read_text(encoding='utf-8')
side = lambda ute: hode + 'window.__game = function () {\n' + spillkode(ute) + '\n};\n' + loader
d = ROT / 'dist'; d.mkdir(exist_ok=True)
out = side(False)
(d / 'morbidium.html').write_text(out, encoding='utf-8')
print('skrev dist/morbidium.html,', len(out), 'tegn,', len(bildefiler), 'innebygde bilder,', len(deler_png), 'deler,', len(lydsti), 'lyder')
if '--bare-fil' not in sys.argv:
    web = d / 'web'
    if web.exists(): shutil.rmtree(web)
    for mappe in ('bilder', 'deler', 'lyd'): (web / mappe).mkdir(parents=True)
    for p in bildefiler.values(): shutil.copyfile(p, web / 'bilder' / p.name)
    for k, data in deler_png.items(): (web / 'deler' / f'{k}.png').write_bytes(data)
    for k, p in lydsti.items(): shutil.copyfile(p, web / 'lyd' / f'{k}.mp3')
    ut = side(True)
    (web / 'index.html').write_text(ut, encoding='utf-8')
    storrelse = sum(f.stat().st_size for f in web.rglob('*') if f.is_file())
    print(f'skrev dist/web/: index.html på {len(ut)} tegn, og {len(bildefiler)} bilder, {len(deler_png)} deler og {len(lydsti)} lyder som filer ({storrelse / 1e6:.1f} MB i alt)')
