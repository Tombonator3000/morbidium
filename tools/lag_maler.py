"""Lager malene i maler/ som lastes opp til ChatGPT sammen med prompten.
All hjelpegrafikk er ren magenta (#ff00ff), så tools/skjaer_ark.py kan fjerne den.
Et hode på malen har radius R piksler = 0,4 spillenheter. Det gir samme proporsjoner som spillet."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
ROT = Path(__file__).resolve().parent.parent
M = (255, 0, 255, 255)
def font(s):
    for f in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 'DejaVuSans-Bold.ttf'):
        try: return ImageFont.truetype(f, s)
        except OSError: pass
    return ImageFont.load_default()
def stiplet_ellipse(d, box, w=3, n=48):
    import math
    cx, cy, rx, ry = (box[0] + box[2]) / 2, (box[1] + box[3]) / 2, (box[2] - box[0]) / 2, (box[3] - box[1]) / 2
    for i in range(0, n, 2):
        a0, a1 = i / n * 2 * math.pi, (i + 1) / n * 2 * math.pi
        d.line([(cx + math.cos(a0) * rx, cy + math.sin(a0) * ry), (cx + math.cos(a1) * rx, cy + math.sin(a1) * ry)], fill=M, width=w)
def stiplet_poly(d, pts, w=3, seg=14):
    for (x0, y0), (x1, y1) in zip(pts, pts[1:] + pts[:1]):
        import math
        L = math.hypot(x1 - x0, y1 - y0); n = max(1, int(L / seg))
        for i in range(0, n, 2):
            t0, t1 = i / n, min(1, (i + 1) / n); d.line([(x0 + (x1 - x0) * t0, y0 + (y1 - y0) * t0), (x0 + (x1 - x0) * t1, y0 + (y1 - y0) * t1)], fill=M, width=w)
def kryss(d, x, y, s=10, w=4): d.line([(x - s, y), (x + s, y)], fill=M, width=w); d.line([(x, y - s), (x, y + s)], fill=M, width=w)
def prikk(d, x, y, r=7): d.ellipse((x - r, y - r, x + r, y + r), fill=M)
def rutenett(d, W, H, kol, rad, top=40, venstre=0):
    cw, ch = (W - venstre) / kol, (H - top) / rad
    for i in range(1, kol): d.line([(venstre + i * cw, top), (venstre + i * cw, H)], fill=M, width=2)
    for j in range(1, rad): d.line([(venstre, top + j * ch), (W, top + j * ch)], fill=M, width=2)
    return cw, ch
def kolonnetekst(d, W, kol, tekster, venstre=0):
    cw = (W - venstre) / kol; f = font(22)
    for i, t in enumerate(tekster): d.text((venstre + i * cw + cw / 2, 20), t, fill=M, font=f, anchor='mm')
VIS = ['FORFRA', 'BAKFRA', 'FRA SIDEN, SER MOT HØYRE']
def hodeguide(d, cx, bunn, R, side=False, nakke=True):
    cy = bunn - R * 1.15
    stiplet_ellipse(d, (cx - R + (R * .15 if side else 0), cy - R, cx + R + (R * .15 if side else 0), cy + R * .95))
    if nakke: kryss(d, cx, bunn)
    return cy
def kroppguide(d, cx, bunn, R, side=False):
    # proporsjoner fra pasienten: kropp 0,56 høy, 0,74 bred nede, 0,56 oppe (i enheter der hode-radius = 0,4)
    u = R / .4; h, wb, wt = .56 * u, (.46 if side else .74) * u / 2, (.4 if side else .56) * u / 2
    stiplet_poly(d, [(cx - wb, bunn), (cx + wb, bunn), (cx + wt, bunn - h), (cx - wt, bunn - h)])
    prikk(d, cx, bunn - h); kryss(d, cx, bunn)
    if not side: prikk(d, cx - .25 * u, bunn - h + .09 * u); prikk(d, cx + .25 * u, bunn - h + .09 * u)
    else: prikk(d, cx + .06 * u, bunn - h + .09 * u)

def figurmal():
    W, H = 1536, 1024; im = Image.new('RGBA', (W, H), (255, 255, 255, 0)); d = ImageDraw.Draw(im)
    kolonnetekst(d, W, 3, VIS); cw, ch = rutenett(d, W, H, 3, 2)
    R = 118
    for i in range(3):
        cx = cw * i + cw / 2
        hodeguide(d, cx, 40 + ch - 40, R, side=(i == 2)); kroppguide(d, cx, 40 + 2 * ch - 50, R, side=(i == 2))
    d.text((12, 60), 'HODE', fill=M, font=font(20)); d.text((12, 40 + ch + 20), 'KROPP (uten armer og bein)', fill=M, font=font(20))
    im.save(ROT / 'maler' / 'mal_figur.png')
def delmal(navn, tegn, radtekst):
    W = H = 1024; im = Image.new('RGBA', (W, H), (255, 255, 255, 0)); d = ImageDraw.Draw(im)
    kolonnetekst(d, W, 3, ['FORFRA', 'BAKFRA', 'FRA SIDEN']); cw, ch = rutenett(d, W, H, 3, 3)
    for j in range(3):
        d.text((8, 40 + j * ch + 8), f'{radtekst} {j + 1}', fill=M, font=font(18))
        for i in range(3): tegn(d, cw * i + cw / 2, 40 + (j + 1) * ch - 22, i == 2, i)
    im.save(ROT / 'maler' / f'{navn}.png')
R3 = 78
delmal('mal_hoder', lambda d, cx, b, s, i: hodeguide(d, cx, b, R3, s), 'HODE')
delmal('mal_hatter_og_har', lambda d, cx, b, s, i: hodeguide(d, cx, b, R3, s), 'HATT/HÅR')
delmal('mal_tilbehor', lambda d, cx, b, s, i: (hodeguide(d, cx, b, R3, s), d.line([(cx - R3 * .8 + (R3 * .3 if s else 0), b - R3 * 1.25), (cx + R3 * .8 + (R3 * .3 if s else 0), b - R3 * 1.25)], fill=M, width=2)), 'TILBEHØR')
delmal('mal_kropper', lambda d, cx, b, s, i: kroppguide(d, cx, b, R3 * 1.05, s), 'KROPP')
def tingmal():
    W = H = 1024; im = Image.new('RGBA', (W, H), (255, 255, 255, 0)); d = ImageDraw.Draw(im)
    cw, ch = rutenett(d, W, H, 3, 3, top=0)
    for j in range(3):
        for i in range(3): kryss(d, cw * i + cw / 2, (j + 1) * ch - 20, 8, 3); d.line([(cw * i + 20, (j + 1) * ch - 20), (cw * (i + 1) - 20, (j + 1) * ch - 20)], fill=M, width=1)
    im.save(ROT / 'maler' / 'mal_ni_ting.png')
figurmal(); tingmal()
print('laget:', ', '.join(sorted(p.name for p in (ROT / 'maler').glob('*.png'))))
