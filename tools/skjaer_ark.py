"""Klipper ark fra ChatGPT i gpt-grafikk/ opp i enkeltdeler.

Arktyper (filnavn bestemmer typen):
  figur_<navn>.png          mal_figur.png, 3 x 2. Gir hode_<navn>_f/b/s og kropp_<navn>_f/b/s
                            i gpt-grafikk/, klare for tools/behandle_bilder.py.
  ark__<nøkkel>__<nøkkel>...png
                            mal_ni_ting.png, 3 x 3, lest fra venstre mot høyre og ovenfra.
                            Hver rute blir <nøkkel>.png i gpt-grafikk/. Bruk _ for å hoppe over en rute.
  hoder_/hatter_/har_/tilbehor_/kropper_<serie>.png
                            delmalene, 3 x 3 (rad = del, kolonne = forfra/bakfra/fra siden).
                            Blir løse deler i assets/deler/<kategori>/ med festepunkt i deler.json,
                            til oppskriftssystemet som setter sammen nye figurer.
Magenta hjelpelinjer fra malene fjernes, og ensfarget bakgrunn gjøres gjennomsiktig.
Originalarket flyttes til gpt-grafikk/behandlet/.  Bruk: python3 tools/skjaer_ark.py
"""
import json, shutil
from pathlib import Path
from PIL import Image

ROT = Path(__file__).resolve().parent.parent
INN, DELER = ROT / 'gpt-grafikk', ROT / 'assets' / 'deler'
VIS = ['f', 'b', 's']
KAT = {'hoder': 'hode', 'hatter': 'hatt', 'har': 'har', 'tilbehor': 'tilbehor', 'kropper': 'kropp'}

def rens(im):
    """Fjerner magenta hjelpegrafikk og bakgrunn (flomfyll fra kantene som slipper gjennom magenta)."""
    im = im.convert('RGBA'); px = im.load(); w, h = im.size
    mag = lambda c: c[0] > 170 and c[2] > 170 and c[1] < min(c[0], c[2]) - 70  # magenta og glatte magentakanter, ikke rosa eller lilla
    for y in range(h):
        for x in range(w):
            if mag(px[x, y]): px[x, y] = (255, 255, 255, 0)
    if im.getchannel('A').getextrema()[0] < 250 and sum(1 for c in (im.get_flattened_data() if hasattr(im, 'get_flattened_data') else im.getdata()) if c[3] < 20) > w * h * .3:
        return im  # hadde gjennomsiktig bakgrunn fra før
    hj = [px[2, 2], px[w - 3, 2], px[2, h - 3], px[w - 3, h - 3]]
    bg = tuple(sorted(c[i] for c in hj)[1] for i in range(3))
    nær = lambda c: c[3] == 0 or abs(c[0] - bg[0]) + abs(c[1] - bg[1]) + abs(c[2] - bg[2]) < 100
    seen = bytearray(w * h); st = [(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)] + [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)]
    while st:
        x, y = st.pop(); i = y * w + x
        if seen[i]: continue
        seen[i] = 1; c = px[x, y]
        if not nær(c): continue
        px[x, y] = (c[0], c[1], c[2], 0)
        if x: st.append((x - 1, y))
        if x < w - 1: st.append((x + 1, y))
        if y: st.append((x, y - 1))
        if y < h - 1: st.append((x, y + 1))
    return im

def ruter(im, kol, rad, topp):
    w, h = im.size; t = round(topp * h / 1024); cw, ch = w / kol, (h - t) / rad
    for j in range(rad):
        for i in range(kol):
            yield i, j, im.crop((round(i * cw) + 3, round(t + j * ch) + 3, round((i + 1) * cw) - 3, round(t + (j + 1) * ch) - 3))

def lagre_beskåret(celle, sti):
    bb = celle.getchannel('A').point(lambda v: 255 if v > 12 else 0).getbbox()
    if not bb: return False
    celle.crop(bb).save(sti); return True

def main():
    DELER.mkdir(parents=True, exist_ok=True); (INN / 'behandlet').mkdir(parents=True, exist_ok=True)
    meta_sti = DELER / 'deler.json'; meta = json.loads(meta_sti.read_text(encoding='utf-8')) if meta_sti.exists() else {}
    ark = [p for p in sorted(INN.glob('*.png')) if p.stem.startswith(('figur_', 'ark__')) or p.stem.split('_')[0] in KAT]
    if not ark: print('Ingen ark i gpt-grafikk/.'); return
    for p in ark:
        try:
            im = rens(Image.open(p)); n = 0; navn = p.stem
            if navn.startswith('figur_'):
                fig = navn[6:]
                for i, j, c in ruter(im, 3, 2, 40):
                    if lagre_beskåret(c, INN / f"{'hode' if j == 0 else 'kropp'}_{fig}_{VIS[i]}.png"): n += 1
            elif navn.startswith('ark__'):
                nøkler = navn[5:].split('__')
                for (i, j, c), k in zip(ruter(im, 3, 3, 0), nøkler):
                    if k != '_' and lagre_beskåret(c, INN / f'{k}.png'): n += 1
            else:
                typ, serie = navn.split('_', 1); kat = KAT[typ]; mappe = DELER / kat; mappe.mkdir(exist_ok=True)
                for i, j, c in ruter(im, 3, 3, 40):
                    if not c.getchannel('A').getbbox(): continue
                    nøkkel = f'{kat}_{serie}_{j + 1}_{VIS[i]}'; c.save(mappe / f'{nøkkel}.png'); n += 1
                    cw, ch = c.size  # festepunkt: nakke/hofte-krysset nederst midt i ruta (22 px over kanten på en 1024-mal)
                    meta[nøkkel] = {'fil': f'{kat}/{nøkkel}.png', 'kategori': kat, 'serie': serie, 'del': j + 1, 'visning': VIS[i],
                                    'feste': [cw / 2, ch - 22 * im.size[1] / 1024 + 3], 'px_per_enhet': 78 * im.size[1] / 1024 / .4, 'storrelse': [cw, ch]}
            shutil.move(str(p), INN / 'behandlet' / p.name)
            print(f'{p.name}: {n} deler')
        except Exception as e:
            print(f'FEIL    {p.name}: {e} (arket blir liggende)')
    meta_sti.write_text(json.dumps(meta, indent=1, ensure_ascii=False), encoding='utf-8')

if __name__ == '__main__':
    main()
