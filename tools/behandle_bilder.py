"""Behandler bilder fra gpt-grafikk/ til ferdige spilldeler i assets/ferdig/.

Filnavnet (uten endelse) må være en nøkkel i assets/manifest.json, for eksempel
kort_due.png eller prop_lamp.png. For hvert bilde:
  1. Mangler bildet gjennomsiktighet, fjernes bakgrunnsfargen fra hjørnene.
  2. Bildet beskjæres til innholdet.
  3. Det skaleres og plasseres slik at festepunktet treffer: kort og effekter midtstilles,
     alt annet står med bunnen midt på festepunktet (føtter, bunn av møbelet, grepet på våpenet).
     Spriteark (anim_<navn>.png) deles i ruter, og alle rutene beskjæres og skaleres likt,
     så festepunktet står stille fra bilde til bilde (se behandle_ark).
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
FYLL = {'hode': .9, 'kropp': .95, 'kort': .9, 'vaapen': .97, 'sko': .9, 'ui': 1.0}  # hvor mye av plassen tegningen får

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

def alfa_boks(im):
    return im.getchannel('A').point(lambda v: 255 if v > 12 else 0).getbbox()

def ark_ruter(im, kol, rad):
    """Finner rutene i et spriteark. ChatGPT leverer bare 1024x1024, 1536x1024 eller 1024x1536, så
    et ark med fire ruter på rad blir sjelden nøyaktig fire kvadrater. Først deles arket i like store
    ruter. Krysser tegningen skillelinjene (arket har marg på sidene, eller rutene er ujevne), letes
    det i stedet etter de tomme stripene mellom bildene. Gir det feil antall, brukes like ruter likevel."""
    w, h = im.size; cw, ch = w / kol, h / rad
    like = [(round(c * cw), round(r * ch), round((c + 1) * cw), round((r + 1) * ch)) for r in range(rad) for c in range(kol)]
    if rad != 1 or kol == 1: return like, True
    # hvor mye av hver kolonne som er tegnet (0 til 255)
    kolonner = list(im.getchannel('A').point(lambda v: 255 if v > 12 else 0).resize((w, 1), Image.BOX).getdata())
    grense = 1
    kryss = sum(1 for c in range(1, kol) for x in range(round(c * cw) - 2, round(c * cw) + 3) if kolonner[x] > grense)
    if not kryss: return like, True
    biter, start = [], None
    for x, v in enumerate(kolonner + [0]):
        if v > grense and start is None: start = x
        elif v <= grense and start is not None:
            if x - start > w * .01: biter.append([start, x])
            start = None
    # små hull inni en tegning (dråper med luft mellom) slås sammen til det blir riktig antall
    while len(biter) > kol:
        i = min(range(len(biter) - 1), key=lambda j: biter[j + 1][0] - biter[j][1])
        biter[i][1] = biter[i + 1][1]; del biter[i + 1]
    if len(biter) != kol:
        print(f'  obs: fant ikke {kol} ruter i arket, deler det likt')
        return like, True
    return [(b[0], 0, b[1], h) for b in biter], False

def behandle_ark(sti, m):
    """Spriteark (anim_<navn>): ruter på rad med samme festepunkt. Hver rute klippes ut, og alle beskjæres
    med den samme boksen (det de har av innhold til sammen) og skaleres likt inn i spillets rute (w x h
    enheter). Da står festepunktet stille fra bilde til bilde, og det spiller ingen rolle hvilket format
    arket kom i. Ark som er festet ved bakkelinja (lav ay), får bunnen av boksen på bakkelinja."""
    im = fjern_bakgrunn(Image.open(sti).convert('RGBA'))
    kol, rad = m['ruter']
    ruter, like = ark_ruter(im, kol, rad)
    celler = [im.crop(r) for r in ruter]
    if not like:  # funnet ved de tomme stripene: midtstill hver tegning i en felles bredde
        bred = max(c.width for c in celler)
        def midtstill(c):
            u = Image.new('RGBA', (bred, c.height), (0, 0, 0, 0)); u.alpha_composite(c, ((bred - c.width) // 2, 0)); return u
        celler = [midtstill(c) for c in celler]
    boks = None
    for c in celler:
        b = alfa_boks(c)
        if b: boks = b if not boks else (min(boks[0], b[0]), min(boks[1], b[1]), max(boks[2], b[2]), max(boks[3], b[3]))
    if not boks: raise ValueError('arket er helt gjennomsiktig')
    W, H = max(1, round(m['w'] * PXU)), max(1, round(m['h'] * PXU))
    ax, ay = m['ax'] * PXU, (m['h'] - m['ay']) * PXU
    bunn = m['ay'] < m['h'] * .4
    bw, bh = boks[2] - boks[0], boks[3] - boks[1]
    s = min(2 * min(ax, W - ax) * .94 / bw, ay * .96 / bh) if bunn else min(W * .94 / bw, H * .94 / bh)
    nw, nh = max(1, round(bw * s)), max(1, round(bh * s))
    x0, y0 = round(ax - nw / 2), round(ay - nh) if bunn else round((H - nh) / 2)
    ut = Image.new('RGBA', (W * kol, H * rad), (0, 0, 0, 0))
    for i, c in enumerate(celler):
        ut.alpha_composite(c.crop(boks).resize((nw, nh), Image.LANCZOS), ((i % kol) * W + x0, (i // kol) * H + y0))
    return ut

def behandle_ui(sti, m):
    """9-delte UI-bilder (ui_panel, ui_kort ...): beskjæres til innholdet og strekkes til nøyaktig størrelse,
    så snittene i spillet (UI_SETT i 32_meny.js) treffer hjørnene."""
    im = fjern_bakgrunn(Image.open(sti).convert('RGBA'))
    bbox = im.getchannel('A').point(lambda v: 255 if v > 12 else 0).getbbox()
    if not bbox: raise ValueError('bildet er helt gjennomsiktig')
    return im.crop(bbox).resize((max(1, round(m['w'] * PXU)), max(1, round(m['h'] * PXU))), Image.LANCZOS)

def behandle(sti, m):
    if 'ruter' in m and sti.stem.lower().startswith('anim_'):
        return behandle_ark(sti, m)
    if m.get('strekk'):
        return behandle_ui(sti, m)
    im = fjern_bakgrunn(Image.open(sti).convert('RGBA'))
    bbox = im.getchannel('A').point(lambda v: 255 if v > 12 else 0).getbbox()
    if not bbox:
        raise ValueError('bildet er helt gjennomsiktig')
    im = im.crop(bbox); cw, ch = im.size
    W, H = max(1, round(m['w'] * PXU)), max(1, round(m['h'] * PXU))
    ax, ay = m['ax'] * PXU, (m['h'] - m['ay'] + m.get('bunn', 0)) * PXU  # festepunkt i bildekoordinater (y nedover); bunn: tegningen går så langt under festepunktet
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
