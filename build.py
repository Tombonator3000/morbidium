"""Bygger Morbidium til én selvstendig HTML-fil (dist/morbidium.html).

Spillkoden pakkes i en funksjon som startes først når «Laster»-skjermen er tegnet
og Three.js er hentet, så siden aldri blir stående hvit mens noe tungt skjer.
Ferdige bilder i assets/ferdig/ bygges inn som data-URI-er i SPRITES, slik at
fila fortsatt er selvstendig og virker både som publisert artefakt og på GitHub Pages.
"""
import base64, json, pathlib
ROT = pathlib.Path(__file__).resolve().parent
S = ROT / 'src'
parts = ['01_core.js', '02_data.js', '03_generator.js', '04_render.js', '05_world.js', '10_art.js', '11_doll.js', '12_paint.js', '13_rom.js', '20_actors.js', '22_sjefer.js', '25_items.js', '26_fiender.js', '27_utstyr.js', '30_game.js']
ferdig = ROT / 'assets' / 'ferdig'
sprites = {p.stem: 'data:image/png;base64,' + base64.b64encode(p.read_bytes()).decode() for p in sorted(ferdig.glob('*.png'))} if ferdig.exists() else {}
game = ''
for p in parts:
    game += (S / p).read_text(encoding='utf-8') + '\n'
    if p == '10_art.js' and sprites:
        game += 'Object.assign(SPRITES, ' + json.dumps(sprites) + ');\n'
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
print('skrev dist/morbidium.html,', len(out), 'tegn,', len(sprites), 'innebygde bilder')
