"""Bygger Morbidium til én selvstendig HTML-fil (dist/morbidium.html).

Spillkoden pakkes i en funksjon som startes først når «Laster»-skjermen er tegnet
og Three.js er hentet, så siden aldri blir stående hvit mens noe tungt skjer.
Ferdige bilder i assets/ferdig/ bygges inn som data-URI-er i SPRITES, slik at
fila fortsatt er selvstendig og virker både som publisert artefakt og på GitHub Pages.
Lydene i assets/lyd/ (tools/lag_lyd.py) bygges inn som base64 i LYDFILER, med metadata i LYD_META.
"""
import base64, json, pathlib
ROT = pathlib.Path(__file__).resolve().parent
S = ROT / 'src'
parts = ['01_core.js', '02_data.js', '03_generator.js', '04_render.js', '05_world.js', '06_musikk.js', '10_art.js', '11_doll.js', '12_paint.js', '13_rom.js', '14_pasient.js', '15_rom3d.js', '16_anim.js', '17_romtyper.js', '20_actors.js', '22_sjefer.js', '25_items.js', '26_fiender.js', '27_utstyr.js', '28_oppskrift.js', '29_monstre.js', '31_sjefpulje.js', '34_blod.js', '35_hendelser.js', '36_drom.js', '32_meny.js', '33_merknader.js', '37_utefiender.js', '38_effekter.js', '39_kombo.js', '40_dybde.js', '41_historie.js', '42_lyd.js', '30_game.js']
ferdig = ROT / 'assets' / 'ferdig'
sprites = {p.stem: 'data:image/png;base64,' + base64.b64encode(p.read_bytes()).decode() for p in sorted(ferdig.glob('*.png'))} if ferdig.exists() else {}
# deler til oppskriftssystemet (assets/deler/, laget av tools/skjaer_ark.py): beskjæres til det som
# faktisk er tegnet, skaleres ned og får palett. Spillet tilpasser størrelsen selv (28_oppskrift.js),
# fordi tegningene ikke alltid holder seg til hjelpesirkelen i malen.
deler_meta, deler_sprites = {}, {}
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
        deler_sprites[k] = 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()
        deler_meta[k] = {'kategori': m['kategori'], 'serie': m['serie'], 'del': m['del'], 'visning': m['visning'], 'bw': im.width, 'bh': im.height}
# spriteark (anim_<navn>): rutenett og festepunkt fra manifestet, så spillet klipper arket slik bildeflyten skalerte det
man_sti = ROT / 'assets' / 'manifest.json'
manifest = json.loads(man_sti.read_text(encoding='utf-8')) if man_sti.exists() else {}
anim_ark = {k: {n: m[n] for n in ('w', 'h', 'ax', 'ay', 'ruter', 'n', 'fps') if n in m} for k, m in manifest.items() if k.startswith('anim_') and 'ruter' in m and k in sprites}
# lydene (assets/lyd/, laget av tools/lag_lyd.py): MP3 som base64, og det lydbanken trenger fra lyd.json (42_lyd.js)
lyd_dir = ROT / 'assets' / 'lyd'
lyd_json = json.loads((lyd_dir / 'lyd.json').read_text(encoding='utf-8')) if (lyd_dir / 'lyd.json').exists() else {}
lydfiler = {k: base64.b64encode((lyd_dir / f'{k}.mp3').read_bytes()).decode() for k in sorted(lyd_json) if (lyd_dir / f'{k}.mp3').exists()}
lyd_meta = {k: {n: m[n] for n in ('gruppe', 'type', 'sek', 'sloyfe', 'rot') if m.get(n) not in (None, False)} for k, m in lyd_json.items() if k in lydfiler}
game = ''
for p in parts:
    game += (S / p).read_text(encoding='utf-8') + '\n'
    if p == '01_core.js':
        game += 'const LYDFILER = ' + json.dumps(lydfiler) + ';\n'
        game += 'const LYD_META = ' + json.dumps(lyd_meta, ensure_ascii=False) + ';\n'
    if p == '10_art.js':
        if sprites: game += 'Object.assign(SPRITES, ' + json.dumps(sprites) + ');\n'
        if deler_sprites: game += 'Object.assign(SPRITES, ' + json.dumps(deler_sprites) + ');\n'
        game += 'const DELER_META = ' + json.dumps(deler_meta) + ';\n'
        game += 'const ANIM_ARK = ' + json.dumps(anim_ark) + ';\n'
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
out = (S / '00_head.html').read_text(encoding='utf-8') + 'window.__game = function () {\n' + game + '\n};\n' + loader
d = ROT / 'dist'; d.mkdir(exist_ok=True)
(d / 'morbidium.html').write_text(out, encoding='utf-8')
print('skrev dist/morbidium.html,', len(out), 'tegn,', len(sprites), 'innebygde bilder,', len(deler_sprites), 'deler,', len(lydfiler), 'lyder')
