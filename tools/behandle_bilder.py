"""Behandler bilder fra gpt-grafikk/ til ferdige spilldeler i assets/ferdig/.

Filnavnet (uten endelse) må være en nøkkel i assets/manifest.json, for eksempel
kort_due.png eller prop_lamp.png. For hvert bilde:
  1. Mangler bildet gjennomsiktighet, fjernes bakgrunnsfargen fra hjørnene.
  2. Bildet beskjæres til innholdet.
  3. Det skaleres og plasseres slik at festepunktet treffer: kort og effekter midtstilles,
     alt annet står med bunnen midt på festepunktet (føtter, bunn av møbelet, grepet på våpenet).
     Spriteark (anim_<navn>.png) beskjæres ikke: hele arket skaleres så hver rute får sin størrelse,
     og alle ruter beholder samme festepunkt.
  4. Resultatet lagres som PNG i 128 piksler per spillenhet (det spillet tegner i, se PX i 10_art.js),
     med en palett på 256 farger. Det gjør fila rundt fire ganger mindre uten synlig forskjell.
     --full-farge hopper over paletten.

Krever Pillow:  pip install pillow
Bruk:           python3 tools/behandle_bilder.py [--sjekk] [--full-farge]
"""
import json, sys
from pathlib import Path
from PIL import Image

ROT = Path(__file__).resolve().parent.parent
INN, UT = ROT / 'gpt-grafikk', ROT / 'assets' / 'ferdig'
PXU = 128  # piksler per spillenhet i ferdige bilder, samme som PX i spillet
FYLL = {'hode': .9, 'kropp': .95, 'kort': .9, 'vaapen': .97, 'sko': .9}  # hvor mye av plassen tegningen får

def fjern_bakgrunn(im):
    """Gjør bakgrunnsfargen gjennomsiktig hvis bildet ikke har alfa fra før."""
    a = im.getchannel('A')
    if a.getextrema()[0] < 250:
        return im  # har allerede gjennomsiktighet
    px = im.load(); w, h = im.size
    hj = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
    bg = tuple(sorted(c[i] for c in hj)[1] for i in range(3))
    # flomfyll fra kantene så bare sammenhengende bakgrunn fjernes, ikke lignende farger inni figuren
    seen = bytearray(w * h); stack = [(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)] + [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)]
    def nær(c, t=34): return abs(c[0] - bg[0]) + abs(c[1] - bg[1]) + abs(c[2] - bg[2]) < t * 3
    while stack:
        x, y = stack.pop(); i = y * w + x
        if seen[i]: continue
        seen[i] = 1; c = px[x, y]
        if not nær(c): continue
        px[x, y] = (c[0], c[1], c[2], 0)
        if x > 0: stack.append((x - 1, y))
        if x < w - 1: stack.append((x + 1, y))
        if y > 0: stack.append((x, y - 1))
        if y < h - 1: stack.append((x, y + 1))
    return im

def behandle_ark(sti, m):
    """Spriteark (anim_<navn>): like store ruter med samme festepunkt. Arket beskjæres ikke, for da
    ville rutene forskyves. Hele arket skaleres så hver rute blir w x h spillenheter."""
    im = fjern_bakgrunn(Image.open(sti).convert('RGBA'))
    kol, rad = m['ruter']
    W, H = max(1, round(m['w'] * PXU)) * kol, max(1, round(m['h'] * PXU)) * rad
    return im.resize((W, H), Image.LANCZOS)

def behandle(sti, m):
    if 'ruter' in m and sti.stem.lower().startswith('anim_'):
        return behandle_ark(sti, m)
    im = fjern_bakgrunn(Image.open(sti).convert('RGBA'))
    bbox = im.getchannel('A').point(lambda v: 255 if v > 12 else 0).getbbox()
    if not bbox:
        raise ValueError('bildet er helt gjennomsiktig')
    im = im.crop(bbox); cw, ch = im.size
    W, H = max(1, round(m['w'] * PXU)), max(1, round(m['h'] * PXU))
    ax, ay = m['ax'] * PXU, (m['h'] - m['ay']) * PXU  # festepunkt i bildekoordinater (y nedover)
    nøkkel = sti.stem.lower(); pre = nøkkel.split('_')[0]; fyll = FYLL.get(pre, .96)
    midt = pre in ('kort', 'stjerne', 'stempelmerke', 'skyggehand') or nøkkel.startswith('puff') or m['ay'] >= m['h'] * .4
    ut = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    if midt:
        s = min(W * fyll / cw, H * fyll / ch); nw, nh = max(1, round(cw * s)), max(1, round(ch * s))
        ut.alpha_composite(im.resize((nw, nh), Image.LANCZOS), (round((W - nw) / 2), round((H - nh) / 2)))
    else:
        bredde, høyde = 2 * min(ax, W - ax) * fyll, ay * fyll
        s = min(bredde / cw, høyde / ch); nw, nh = max(1, round(cw * s)), max(1, round(ch * s))
        ut.alpha_composite(im.resize((nw, nh), Image.LANCZOS), (round(ax - nw / 2), round(ay - nh)))
    return ut

def main():
    man = json.loads((ROT / 'assets' / 'manifest.json').read_text(encoding='utf-8'))
    UT.mkdir(parents=True, exist_ok=True)
    filer = sorted(p for p in INN.iterdir() if p.suffix.lower() in ('.png', '.webp', '.jpg', '.jpeg'))
    if not filer:
        print('gpt-grafikk/ har ingen bilder.'); return
    ok = feil = 0
    for f in filer:
        k = f.stem.lower()
        if k not in man:
            print(f'UKJENT  {f.name}: filnavnet må være en nøkkel fra assets/manifest.json'); feil += 1; continue
        try:
            ut = behandle(f, man[k])
            if '--full-farge' not in sys.argv: ut = ut.quantize(colors=256, method=Image.Quantize.FASTOCTREE)
            if '--sjekk' not in sys.argv: ut.save(UT / f'{k}.png', optimize=True)
            print(f'OK      {f.name} -> assets/ferdig/{k}.png ({ut.size[0]}x{ut.size[1]})'); ok += 1
        except Exception as e:
            print(f'FEIL    {f.name}: {e}'); feil += 1
    print(f'\n{ok} behandlet, {feil} med feil. Kjør python3 build.py for å bygge dem inn.')

if __name__ == '__main__':
    main()
