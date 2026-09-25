"""Lager tegnelister til ChatGPT: alt spillet fortsatt mangler bilde til, samlet i ark som tegnes i én vending.

Hver oppføring er én PNG ChatGPT skal lage, med ferdig filnavn, malen som lastes opp og en prompt
som kan limes rett inn:
  figurark      figur_<navn>.png på mal_figur.png (hode og kropp forfra, bakfra og fra siden)
  ni ting       ark__<nøkkel>__...png på mal_ni_ting.png (opptil ni ting, lest fra venstre og ovenfra)
  enkeltbilde   <nøkkel>.png, for det som er for stort til en rute (trær, porter, sjefskropper)
  spriteark     anim_<navn>.png, like store ruter på én rad
  UI            ui_<navn>.png, rammer og ringer til HUD-en og menyene
  delark        hoder_/hatter_/har_/tilbehor_/kropper_<serie>.png til oppskriftssystemet

Hva som mangler, regnes ut av assets/manifest.json minus det som ligger i gpt-grafikk/ (samme regel
som i ART_BRIEF.md). Kjør skriptet igjen når bilder er levert, så krymper listene. Et ark der noen
av rutene alt er levert, får nytt filnavn med bare det som gjenstår.

Med --bilder lages også referansebilder i tegnelister/referanse/: dagens kodetegninger lagt i
samme rutenett som malen, så ChatGPT ser hva som skal i hver rute. De heter ref_<...>.png, så ingen
av verktøyene tar dem for et levert bilde om de havner i gpt-grafikk/ ved en feil.

Bruk:  python3 tools/lag_tegnelister.py
       python3 build.py && python3 tools/lag_tegnelister.py --bilder [--three STI]
"""
import csv, json, re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import lag_brief as B

ROT, man, LEV = B.ROT, B.man, B.LEV
UT = ROT / 'tegnelister'; REF = UT / 'referanse'
MANGLER = {k for k in man if k not in LEV}
TALL = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
STOR = 400  # piksler i spillet; større enn dette tegnes som enkeltbilde (en rute på mal_ni_ting.png er rundt 330)
VIS = 'fbs'
DELKAT = {'hoder': 'hode', 'hatter': 'hatt', 'har': 'har', 'tilbehor': 'tilbehor', 'kropper': 'kropp'}
DELMAL = {'hoder': 'mal_hoder.png', 'hatter': 'mal_hatter_og_har.png', 'har': 'mal_hatter_og_har.png', 'tilbehor': 'mal_tilbehor.png', 'kropper': 'mal_kropper.png'}
ANSIKT = ('Faces: rough, ugly and morbid, with crooked silhouettes, uneven eyes and teeth, heavy bags under the eyes, '
          'scraggly hair and rough ink lines with a little hatching. Grotesque and comic, but easy to recognize from every angle.')
REF_LINJE = ('The second attached image shows the placeholder drawings the game uses today, in the same cells. Use it only to see '
             'what goes where and roughly how it is posed; redraw everything properly in our style.')
FORMAT = {'kvadrat': '1024 x 1024 (square)', 'stående': '1024 x 1536 (portrait)', 'liggende': '1536 x 1024 (landscape)'}

NAVN = {'kasteren': 'Kasteren', 'trille': 'Trillepasienten', 'speil': 'Speilpasienten', 'tannlege': 'Tannlegen (minisjef)',
        'portier': 'Den hodeløse portieren (minisjef)', 'gartner': 'Gartneren', 'huldra': 'Huldra', 'vedkubbe': 'Vedkubbemannen',
        'nokken': 'Nøkken', 'hekk': 'Overgartner Ansgar Hekk (sjef)', 'baklengs': 'Mannen som går baklengs',
        'blank_m': 'Mannen uten ansikt', 'ansikt_m': 'Mannen med ansikt', 'blank_k': 'Kvinnen uten ansikt', 'ansikt_k': 'Kvinnen med ansikt',
        # enkeltbilder, spriteark, UI og delark
        'koret_kropp': 'Hviskekorets kropp', 'klumpen_kropp': 'Klumpens kropp', 'hjort_kropp': 'Hjortens kropp', 'hjort_hode': 'Hjortens hode og hals',
        'anim_kastesprut': 'Spruten når klumpen treffer', 'anim_blodsprut': 'Blodspruten', 'anim_kasteklump': 'Klumpen som snurrer i lufta',
        'anim_oye': 'Øyet som åpner seg i veggsprekken', 'anim_kjottbiter': 'Kjøttbitene',
        'ui_ring_portrett': 'Gullringen rundt portrettet', 'ui_ring_kart': 'Kompassringen rundt kartet', 'ui_panel': 'Panelet', 'ui_knapp': 'Knappen',
        'ui_kort': 'Kortrammen', 'ui_skilt': 'Romskiltet', 'ui_utklipp': 'Utklippstavla', 'ui_hode': 'Frenologihodet i Sinnets kart',
        'prop_damer': 'De tre damene i bunad', 'prop_kjempe': 'Kjempen i smoking', 'drom_hest': 'Den hvite hesten',
        'prop_utgang': 'Utgangsdøra med lys bak', 'prop_vindu': 'Det åpne vinduet', 'prop_porten': 'Parkporten', 'prop_langbord': 'Langbordet i spisesalen',
        'prop_tre': 'Parktreet', 'prop_bjork': 'Bjørka', 'prop_bjork_dod': 'Den døde bjørka', 'prop_lysthus': 'Lysthuset',
        'hoder_pasienter': 'Pasienthoder', 'hoder_kultister': 'Kultisthoder', 'kropper_pasienter': 'Pasientklær', 'kropper_kultister': 'Kultistklær',
        'hatter_kultister': 'Kultisthatter', 'tilbehor_ansikt': 'Ansiktstilbehør', 'har_personale': 'Frisyrer til personalet', 'kropper_personale': 'Klær til byråkrater og leger',
        'hatter_pasienter': 'Pasienthatter', 'har_pasienter': 'Pasientfrisyrer', 'har_kultister': 'Kultistfrisyrer'}

def figur(typ, ansikt=True, ekstra=''): return {'type': 'figur', 'typ': typ, 'ansikt': ansikt, 'ekstra': ekstra}
def ark(slug, tittel, keys, ekstra=''): return {'type': 'ark', 'slug': slug, 'tittel': tittel, 'keys': keys, 'ekstra': ekstra}
def enkelt(k, ekstra=''): return {'type': 'enkelt', 'keys': [k], 'ekstra': ekstra}
def anim(k): return {'type': 'anim', 'keys': [k]}
def ui(k): return {'type': 'ui', 'keys': [k]}
def delark(fil, hva, items, farg=False): return {'type': 'del', 'fil': fil, 'hva': hva, 'items': items, 'farg': farg}

UTEN_ANSIKT = 'The face is a completely blank sheet of paper: no eyes, no nose, no mouth, no shading at all. Everything else is drawn normally.'
MED_ANSIKT = 'Exactly the same clothes, hair and build as the faceless version drawn earlier in this conversation, so the game can swap one for the other.'

# Rekkefølgen følger «Neste bestilling» i DESIGN_BRIEF.md. Hver liste er én ChatGPT-samtale.
LISTER = [
  {'nr': 1, 'fil': '01_fiender.md', 'tittel': 'Fiendene og minisjefene i sanatoriet',
   'merk': 'De vanlige fiendene fra 1. etasje (Kasteren, Trillepasienten og Speilpasienten) og minisjefene Tannlegen og Portieren. Figurarkene først, så våpnene og småtingene deres på ett «ni ting»-ark.',
   'ark': [figur('kasteren'), figur('trille', ekstra='Important: draw the wheelchair WITHOUT its two big side wheels. The game adds the wheel, which is drawn separately, and spins it.'),
           figur('speil', ansikt=False), figur('tannlege'), figur('portier', ansikt=False),
           ark('vaapen_og_smating', 'Våpen og småting', ['hjul_trille_f', 'vaapen_klump', 'glasskar', 'vaapen_tang', 'vaapen_knippe', 'portierhode', 'vaapen_gasskolbe', 'vaapen_skjemabunke', 'vaapen_stempelboss'],
               ekstra='Weapons stand upright with the handle at the bottom and the tip at the top; the game rotates them.')]},
  {'nr': 2, 'fil': '02_koret_og_klumpen.md', 'tittel': 'Hviskekoret og Den Store Klumpen',
   'merk': 'Lagdelte skapninger (del H i `DESIGN_BRIEF.md`): kroppen tegnes alene som et eget bilde, og de løse delene samles på «ni ting»-ark. Spillet flytter munnene, ørene og ansiktene hver for seg. Pupillen er den som ruller rundt i øyet i veggsprekken.',
   'ark': [enkelt('koret_kropp'), ark('koret_deler', 'Korets munner og ører', ['koret_munn0', 'koret_munn1', 'koret_munn2', 'koret_ore0', 'koret_ore1', 'pupill'], ekstra='Each part is drawn alone and centered in its cell, nothing around it.'),
           enkelt('klumpen_kropp'), ark('klumpen_deler', 'Klumpens ansikter, øye, lue og ungene', ['klumpen_ansikt0', 'klumpen_ansikt1', 'klumpen_ansikt2', 'klumpen_ansikt3', 'klumpen_oye', 'klumpen_lue', 'blob_klumpunge_f', 'blob_klumpunge_b', 'blob_klumpunge_s'],
               ekstra='Cells 7 to 9 are the same small creature: a lump spawn of pink fused flesh with a tiny face, in front view, back view and side view facing right.')]},
  {'nr': 3, 'fil': '03_spriteark.md', 'tittel': 'Spriteark',
   'merk': 'Små animasjoner, bilde for bilde (del I i `DESIGN_BRIEF.md`). Like store ruter på én rad, og samme festepunkt i hver rute, ellers hopper tingen. Ingen mal; formatet spiller ingen rolle så lenge rutene er like store. Kastespruten og blodspruten synes mest.',
   'ark': [anim('anim_kastesprut'), anim('anim_blodsprut'), anim('anim_kasteklump'), anim('anim_oye'), anim('anim_kjottbiter')]},
  {'nr': 4, 'fil': '04_hud.md', 'tittel': 'HUD og menyer',
   'merk': 'UI-settet (del G i `DESIGN_BRIEF.md`). Ingen tekst i noen av bildene. Panelet, knappen, kortet, skiltet og utklippstavla strekkes i ni deler, så all pynt må ligge ytterst og midten være jevn. Ringene må være helt gjennomsiktige i midten. Hjertene og ringene gir mest for minst.',
   'ark': [ark('ui_ikoner', 'Hjerter og ikoner', ['ui_hjerte_full', 'ui_hjerte_halv', 'ui_hjerte_tom', 'ui_ikon_journal', 'ui_ikon_pause'], ekstra='These are HUD icons: centered in their cells, flat and seen straight on. The three hearts must be the same heart.'),
           ui('ui_ring_portrett'), ui('ui_ring_kart'), ui('ui_panel'), ui('ui_knapp'), ui('ui_kort'), ui('ui_skilt'), ui('ui_utklipp'), ui('ui_hode')]},
  {'nr': 5, 'fil': '05_parken_og_skogen.md', 'tittel': 'Parken og Nattskogen: fiender og sjefer',
   'merk': 'Gartnerne og kråkene i Parken, Huldra, Vedkubbemannen og Nøkken i Nattskogen, Overgartneren og Den hvite hjorten. Huldra er viktigst: bakfra er hun en råtten stamme, så baksiden på arket betyr mye. Hjorten er satt sammen av deler; kropp og hode tegnes hver for seg.',
   'ark': [figur('gartner'), figur('huldra', ansikt=False, ekstra='Front and side view: the beautiful woman. Back view: the hollow rotten trunk with moss, fungus and beetles, and the cow tail hanging down.'),
           figur('vedkubbe', ansikt=False), figur('nokken'), figur('hekk', ekstra='The front view matters most, the game uses it for the boss. Back and side views are a bonus.'),
           enkelt('hjort_kropp'), enkelt('hjort_hode'),
           ark('kraake_og_kaal', 'Kråka, kålhodet og hagesaksene', ['kraake_kropp', 'kraake_vinge', 'blob_kaalhode_f', 'blob_kaalhode_b', 'blob_kaalhode_s', 'vaapen_hagesaks', 'vaapen_storsaks'],
               ekstra='The shears stand upright with the handles at the bottom.')]},
  {'nr': 6, 'fil': '06_hendelsene.md', 'tittel': 'Hendelsene',
   'merk': 'De absurde hendelsene. Tonen er David Lynch på et norsk sanatorium i 1923: hverdagslig, litt feil, aldri skummelt på den åpenbare måten. Bildene vises også stort i samtalepanelet, så de fortjener litt ekstra.',
   'ark': [figur('baklengs', ansikt=False),
           ark('hendelser_1', 'Telefonen, kua, heisen og de andre', ['prop_telefon', 'prop_kaffebord', 'prop_ku', 'prop_brennevin', 'prop_badekarmann', 'prop_heis', 'prop_rotter', 'prop_radiobord', 'prop_utedo'],
               ekstra='Everyday things that are slightly wrong. Seen from the front and slightly above, like the furniture.'),
           ark('hendelser_2', 'Kubbekona, tannfeen og lampemannen', ['prop_kubbekona', 'prop_tannfe', 'prop_tannglass', 'prop_lampemann', 'prop_lampemann_paa'],
               ekstra='Cells 4 and 5 are the same man, first with the lamp off and then with it lit.'),
           enkelt('prop_damer'), enkelt('prop_kjempe')]},
  {'nr': 7, 'fil': '07_drommene.md', 'tittel': 'Drømmene',
   'merk': 'Minnene, tegnene som går igjen, døra og figurene uten ansikt. Litt mykere og blekere enn resten, som et gammelt fotografi. Tegn mannen og kvinnen uten ansikt først og versjonen med ansikt rett etter, i samme samtale, så klærne blir like.',
   'ark': [figur('blank_m', ansikt=False, ekstra=UTEN_ANSIKT), figur('ansikt_m', ansikt=False, ekstra=MED_ANSIKT),
           figur('blank_k', ansikt=False, ekstra=UTEN_ANSIKT), figur('ansikt_k', ansikt=False, ekstra=MED_ANSIKT),
           ark('drom_vinduer', 'Vinduene og dørene', ['drom_vindu_sno', 'drom_vindu_rim', 'drom_vindu_regn', 'drom_vindu_brann', 'drom_vindu_taake', 'drom_vindu_klart', 'drom_dor', 'drom_dor_aapen', 'drom_dorlaast'],
               ekstra='The six windows are the same freestanding window frame with different weather outside. The three doors are the same door. Soft and a little faded, like an old photograph.'),
           ark('drom_ting', 'Tingene de etterlot seg', ['drom_lue', 'drom_ur', 'drom_symaskin', 'drom_kopp', 'drom_soldat', 'drom_hvitveis', 'drom_kaape_7a2a2e', 'drom_kaape_4a4a52', 'drom_sko'],
               ekstra='Soft and a little faded, like an old photograph.'),
           ark('drom_bord', 'Bordene, brevene og mappa', ['drom_bord', 'drom_brev', 'drom_foto', 'drom_notat', 'drom_speil', 'drom_koffert', 'drom_bok', 'drom_kommode', 'drom_mappe'],
               ekstra='Soft and a little faded, like an old photograph.'),
           enkelt('drom_hest', ekstra='Soft and a little faded, like an old photograph.')]},
  {'nr': 8, 'fil': '08_moblene.md', 'tittel': 'Møblene i de nye rommene, parken og skogen',
   'merk': 'Møblene til de nye romtypene, parken og Nattskogen, og utgangene fra hver etasje. Forfra og litt ovenfra, som de andre møblene. Det som ligger flatt på bakken (grav, våk, kloakk, kullsjakt, blomsterbed, hårhaug, teppe) tegnes rett ovenfra. Denne lista kan komme sist; koden tegner møblene godt nok til da.',
   'ark': [ark('behandling', 'Behandlingsrommene', ['prop_elektrostol', 'prop_spole', 'prop_rontgen', 'prop_lysskjerm', 'prop_tannlegestol', 'prop_instrumentbord', 'prop_spyttkum', 'prop_frisorstol', 'prop_harhaug']),
           ark('salong', 'Salongen og kapellet', ['prop_piano', 'prop_grammofon', 'prop_lenestol', 'prop_kortbord', 'prop_globus', 'prop_bjorn', 'prop_gevir', 'prop_kors', 'kiste12']),
           ark('kjokken', 'Kjøkkenet og kjelleren', ['prop_komfyr', 'prop_gryte', 'prop_kjottkrok', 'prop_kjele', 'prop_kullhaug', 'prop_ror', 'prop_vedovn', 'prop_kloakk', 'prop_kullsjakt']),
           ark('hagen', 'Drivhuset og hagen', ['prop_plantebord', 'prop_kjempeplante', 'prop_vannkanne', 'prop_busk', 'prop_blomsterbed', 'prop_hagenisse', 'prop_fuglebad', 'prop_bronn', 'prop_lyktestolpe']),
           ark('kirkegard', 'Kirkegården, dammen og vinteren', ['prop_engel', 'prop_grav', 'prop_statue', 'prop_fontene', 'prop_siv', 'prop_vak', 'prop_snomann', 'prop_liggestol', 'prop_teppe']),
           ark('skogen', 'Nattskogen', ['prop_baal', 'prop_stubbe', 'prop_sopp', 'prop_stein', 'prop_vedstabel', 'prop_robat', 'prop_ruinmur', 'prop_skilt', 'prop_kjerre']),
           enkelt('prop_utgang'), enkelt('prop_vindu'), enkelt('prop_porten'), enkelt('prop_langbord'),
           enkelt('prop_tre'), enkelt('prop_bjork'), enkelt('prop_bjork_dod'), enkelt('prop_lysthus')]},
  {'nr': 9, 'fil': '09_delark.md', 'tittel': 'Delark til oppskriftssystemet',
   'merk': 'Løse hoder, hatter, frisyrer, ansiktstilbehør og kropper som spillet setter sammen til nye fiender (del B i `DESIGN_BRIEF.md`). Seriene har navnene spillet leter etter: `personale` brukes av pleiere, oppassere, byråkrater og narkoseleger, `kultister` av kultistene og `pasienter` av pasientfiendene. Kropper for pleiere og oppassere heter `uniformer` (levert). Ansiktstilbehør i serien `ansikt` kan havne på alle.',
   'ark': [delark('hoder_pasienter', 'heads for patients', ['a head wrapped in a dirty bandage with one bloodshot eye showing', 'a bald head with a row of black stitches across the scalp', 'a confused face with bulging, wide-open eyes and a crooked open mouth']),
           delark('hoder_kultister', 'heads for gloomy teenage cultists', ['heavy black eyeliner and a sulky pout', 'fake vampire fangs and a smug little grin', 'very pale, with tears painted on the cheeks']),
           delark('kropper_pasienter', 'outfits for patients', ['a hospital gown with ties', 'a canvas straitjacket with leather straps', 'a bathrobe with a belt'], farg=True),
           delark('kropper_kultister', 'outfits for gloomy teenage cultists', ['a black robe with four leather belts', 'a long leather coat with chains', 'a velvet shirt with a white ruff collar'], farg=True),
           delark('hatter_kultister', 'hats for gloomy teenage cultists', ['a tall pointed hood', 'a battered top hat with a small skull on the band', 'a crown of dripping candles'], farg=True),
           delark('tilbehor_ansikt', 'face accessories', ['round wire glasses', 'a white surgical mask', 'a 1920s rubber gas mask with round eyepieces and a filter']),
           delark('har_personale', 'hairstyles for hospital staff', ['a tight bun', 'hair slicked back with oil and a sharp parting', 'short, messy grey hair']),
           delark('kropper_personale', 'outfits for office clerks and doctors', ['a black suit with a red tie', 'a green surgical gown with an apron', 'a grey three-piece suit with a watch chain'], farg=True),
           delark('hatter_pasienter', 'hats for patients', ['a folded newspaper hat', 'an enamel bedpan worn as a helmet', 'a striped nightcap with a pompom'], farg=True),
           delark('har_pasienter', 'hairstyles for patients', ['wild uncombed hair sticking out in all directions', 'a patchy shaved head with stubble', 'long, greasy hair']),
           delark('har_kultister', 'hairstyles for gloomy teenage cultists', ['a long black fringe covering one eye', 'teased black hair with a white stripe', 'a greasy black ponytail'])]},
]

# ---------- hva som mangler ----------
def figurnokler(typ): return [f'{d}_{typ}_{v}' for d in ('hode', 'kropp') for v in VIS if f'{d}_{typ}_{v}' in man]

def del_levert(fil):
    typ, serie = fil.split('_', 1)
    if any((ROT / 'gpt-grafikk' / m / f'{fil}.png').exists() for m in ('', 'behandlet')): return True
    meta = ROT / 'assets' / 'deler' / 'deler.json'
    if meta.exists():
        return any(m.get('kategori') == DELKAT[typ] and m.get('serie') == serie for m in json.loads(meta.read_text(encoding='utf-8')).values())
    return False

def stor(k): return max(man[k]['px']) > STOR

def rest_av(a):
    """Nøklene i arket som fortsatt mangler (for delark: [] hvis levert, ellers filnavnet)."""
    if a['type'] == 'del': return [] if del_levert(a['fil']) else [a['fil']]
    ks = figurnokler(a['typ']) if a['type'] == 'figur' else a['keys']
    ukjent = [k for k in ks if k not in man]
    if ukjent: raise SystemExit(f'lag_tegnelister: ukjente nøkler i planen: {ukjent}')
    return [k for k in ks if k in MANGLER]

def ovrige(dekket):
    """Det som mangler, men ikke står i planen (nye nøkler i manifestet): figurark, enkeltbilder og ark på ni."""
    igjen = sorted(k for k in MANGLER if k not in dekket); ut = []
    typer = sorted({m.group(2) for k in igjen for m in [re.match(r'^(hode|kropp)_(.+)_[fbs]$', k)] if m})
    for t in typer: ut.append(figur(t)); igjen = [k for k in igjen if k not in figurnokler(t)]
    for k in [k for k in igjen if k.startswith('anim_')]: ut.append(anim(k))
    for k in [k for k in igjen if k.startswith('ui_')]: ut.append(ui(k))
    igjen = [k for k in igjen if not k.startswith(('anim_', 'ui_'))]
    for k in [k for k in igjen if stor(k)]: ut.append(enkelt(k))
    små = [k for k in igjen if not stor(k)]
    for i in range(0, len(små), 9): ut.append(ark(f'ovrige_{i // 9 + 1}', f'Øvrige {i // 9 + 1}', små[i:i + 9]))
    return ut

def planlegg():
    dekket, lister = set(), []
    for L in LISTER:
        ny = dict(L, ark=[])
        for a in L['ark']:
            if a['type'] != 'del': dekket |= set(figurnokler(a['typ']) if a['type'] == 'figur' else a['keys'])
            rest = rest_av(a)
            if not rest: continue
            a = dict(a, rest=rest)
            if a['type'] == 'ark' and len(rest) == 1: a = dict(enkelt(rest[0], a['ekstra']), rest=rest)
            ny['ark'].append(a)
        lister.append(ny)
    o = ovrige(dekket)
    if o:
        lister.append({'nr': len(LISTER) + 1, 'fil': f'{len(LISTER) + 1:02d}_ovrige.md', 'tittel': 'Øvrige',
                       'merk': 'Nye bilder i manifestet som ennå ikke har fått plass i en av listene over. Claude sorterer dem inn neste gang.',
                       'ark': [dict(a, rest=rest_av(a)) for a in o]})
    return [L for L in lister if L['ark']]

# ---------- filnavn, mal og prompt ----------
def filnavn(a):
    if a['type'] == 'figur': return f"figur_{a['typ']}.png"
    if a['type'] == 'ark': return 'ark__' + '__'.join(a['rest']) + '.png'
    if a['type'] == 'del': return a['fil'] + '.png'
    return a['rest'][0] + '.png'

def mal(a):
    return {'figur': 'mal_figur.png', 'ark': 'mal_ni_ting.png', 'del': DELMAL.get(a.get('fil', '').split('_')[0])}.get(a['type'])

def ref_navn(a):
    slug = {'figur': lambda: 'figur_' + a['typ'], 'ark': lambda: a['slug']}.get(a['type'], lambda: a['rest'][0] if a['type'] != 'del' else None)()
    return f'ref_{slug}.png' if slug else None

def ref_gyldig(a):
    """Referansebildet finnes og viser de samme nøklene som arket nå (nøklene ligger i en tekstbit i PNG-en)."""
    n = ref_navn(a)
    if not n or not (REF / n).exists(): return False
    try:
        from PIL import Image
        return Image.open(REF / n).text.get('nokler') == ','.join(a['rest'])
    except Exception:
        return False

def setning(s): s = s.strip(); return s if s.endswith(('.', '!', '?')) else s + '.'
def flat(k): return 'seen from above' in B.beskriv(k) or 'seen from straight above' in B.beskriv(k)

def prompt(a, ref):
    t, L = a['type'], []
    if t == 'figur':
        L += ['Using the attached template (mal_figur.png), draw the character described below in a 3 x 2 grid.',
              'Top row: the HEAD ONLY (no neck, no body): front view, back view, and side view facing right. Each head fills the dashed circle and rests on the + mark.',
              'Bottom row: the TORSO AND HIPS ONLY (no head, no arms, no legs), fitted to the dashed shape. The shoulders must sit on the magenta dots, because the game attaches the arms there.',
              'Keep every drawing inside its own cell. Do not draw the magenta guides.']
        if a['ansikt']: L.append(ANSIKT)
        if a.get('ekstra'): L.append(a['ekstra'])
        if ref: L.append(REF_LINJE)
        L.append('Character: ' + setning(B.FIG.get(a['typ'], a['typ'])))
    elif t == 'ark':
        n = len(a['rest'])
        s = f'Using the attached template (mal_ni_ting.png), draw {TALL[n]} separate items, one per cell, read left to right, top to bottom.'
        if n < 9: s += f' Use only the first {TALL[n]} cells and leave the rest empty.'
        L += [s, 'Each item sits on the short line with its bottom touching the + mark. Icons, cards and loose body parts are centered in the cell instead. Things that lie flat on the ground are drawn seen from straight above. Keep every drawing inside its own cell. Do not draw the magenta guides.']
        if a.get('ekstra'): L.append(a['ekstra'])
        if ref: L.append(REF_LINJE)
        L.append('Items:'); L += [f'{i + 1}) {setning(B.beskriv(k))}' for i, k in enumerate(a['rest'])]
    elif t == 'enkelt':
        k = a['rest'][0]; fmt = FORMAT[B.format_(man[k])]
        L.append(f'Draw ONE image, {fmt}: {setning(B.beskriv(k))}')
        if k.startswith(('prop_', 'drom_')) and not flat(k): L.append('Seen from the front and slightly above, so it shows its front and a little of its top.')
        if a.get('ekstra'): L.append(a['ekstra'])
        L.append('Exactly one object, centered and fully visible, not cropped. Transparent background, no ground shadow, no text, no frame.')
        if ref: L.append('The attached image shows the placeholder the game uses today. Use it only to see what it is; redraw it properly in our style.')
    elif t == 'anim':
        k = a['rest'][0]; m = man[k]; d = B.beskriv(k)
        kort = re.sub(r'^(SPRITE SHEET|SHEET), \d+ equal (cells|squares) in ONE row: ', '', d)
        if kort != d:
            L.append(f'SPRITE SHEET for a game animation, same ink-and-cel style: {m["n"]} equal cells in ONE horizontal row, read left to right: {setning(kort)} '
                     'The same object in every cell, same size and same center (or the same ground line), only the motion changes. Nothing crosses into the next cell. No text, no grid lines, transparent background.')
        else:
            L.append(f'{setning(d)} Same ink-and-cel style, {m["n"]} equal cells in ONE horizontal row. Nothing crosses into the next cell. No text, no grid lines, transparent background.')
        if ref: L.append('The attached image shows the placeholder frames the game draws today, in the same order and at the same scale.')
    elif t == 'ui':
        k = a['rest'][0]
        L.append(f'UI element for the HUD of a 1920s sanatorium game, same ink-and-cel style: {setning(B.beskriv(k))} Flat and seen straight on, no perspective, no text, no shadow outside the shape, transparent background.')
        L.append(f'Format: {FORMAT[B.format_(man[k])]}.')
    elif t == 'del':
        typ = a['fil'].split('_')[0]; ting = {'hatter': 'hat', 'har': 'hair', 'tilbehor': 'accessory'}.get(typ)
        L.append(f"Using the attached template ({DELMAL[typ]}), draw three different {a['hva']}, one per row, each in front view, back view and side view facing right.")
        if ting: L.append(f'The dashed circle is the head. Draw ONLY the {ting}, fitted exactly to that head, not the head itself. Leave the back view empty for accessories that only show from the front.')
        if typ == 'kropper': L.append('Torso and hips only, shoulders on the magenta dots, no arms, no legs, no head.')
        if typ == 'hoder': L.append(ANSIKT)
        L.append('Keep every drawing inside its own cell. Do not draw the magenta guides.')
        if a['farg']: L.append('Draw all fabric in light neutral grey (around #d8d8d8) with a darker grey shade, so the game can dye it. Keep skin, metal, leather and paper in their real colors.')
        L.append('Items: ' + ' '.join(f'{i + 1}) {setning(x)}' for i, x in enumerate(a['items'])))
    return '\n'.join(L)

def stilblokk():
    t = (ROT / 'DESIGN_BRIEF.md').read_text(encoding='utf-8')
    m = re.search(r'## Stilblokk[^\n]*\n+```\n(.*?)\n```', t, re.S)
    return m.group(1) if m else B.STIL

TYPENAVN = {'figur': 'figurark', 'ark': '«ni ting»-ark', 'enkelt': 'enkeltbilde', 'anim': 'spriteark', 'ui': 'UI-bilde', 'del': 'delark'}
def tittel(a):
    if a['type'] == 'figur': return NAVN.get(a['typ'], a['typ'])
    if a['type'] == 'ark': return a['tittel']
    k = a['fil'] if a['type'] == 'del' else a['rest'][0]
    return NAVN.get(k, k)

def gir(a):
    """Hva arket blir til når det er klippet: nøklene, kort skrevet."""
    if a['type'] == 'figur':
        hode = [k for k in a['rest'] if k.startswith('hode_')]; kropp = [k for k in a['rest'] if k.startswith('kropp_')]
        f = lambda ks: f"`{ks[0][:-2]}_{'/'.join(k[-1] for k in ks)}`" if ks else ''
        return ' og '.join(x for x in (f(hode), f(kropp)) if x)
    if a['type'] == 'ark': return ', '.join(f'{i + 1} `{k}`' for i, k in enumerate(a['rest']))
    if a['type'] == 'del': return f"løse deler i `assets/deler/{DELKAT[a['fil'].split('_')[0]]}/`"
    return f"`{a['rest'][0]}`"

def antall(a): return 0 if a['type'] == 'del' else len(a['rest'])

# ---------- skriving ----------
def hvordan(stil):
    return ['## Slik gjør du det', '',
            '1. Start en ny samtale i ChatGPT og lim inn stilblokken under. Bruk samme samtale for hele lista, så stilen holder seg.',
            '2. For hvert ark: last opp malen fra `maler/` (står ved arket), og referansebildet hvis det står et. Lim inn prompten.',
            '3. Last ned resultatet som PNG og gi det nøyaktig filnavnet som står ved arket.',
            '4. Last fila opp til `gpt-grafikk/` i repoet (Add file, Upload files) og commit til `main`. Resten går av seg selv.', '',
            '## Stilblokk (lim inn først)', '', '```text', stil, '```', '']

def skriv_liste(L, stil):
    ut = [f"# Tegneliste {L['nr']}: {L['tittel']}", '',
          'Laget av `tools/lag_tegnelister.py`. Ikke rediger for hånd; kjør skriptet på nytt når bilder er levert, så forsvinner det som er ferdig.', '',
          L['merk'], ''] + hvordan(stil)
    for i, a in enumerate(L['ark']):
        ref = ref_gyldig(a); nr = f"{L['nr']}{chr(97 + i)}"
        ut += [f"## {nr}. {tittel(a)} ({TYPENAVN[a['type']]})", '', f'Filnavn: `{filnavn(a)}`', '']
        if mal(a): ut += [f'Mal: `maler/{mal(a)}`', '']
        ut += [f'Gir: {gir(a)}', '']
        if ref: ut += [f"Referanse (last opp sammen med {'malen' if mal(a) else 'prompten'}): `tegnelister/referanse/{ref_navn(a)}`", '', f'![Dagens tegning](referanse/{ref_navn(a)})', '']
        ut += ['```text', prompt(a, ref), '```', '']
    (UT / L['fil']).write_text('\n'.join(ut), encoding='utf-8')

def skriv(lister):
    UT.mkdir(exist_ok=True); stil = stilblokk()
    for p in UT.glob('[0-9][0-9]_*.md'): p.unlink()  # lister som er ferdige, skal bort
    for L in lister: skriv_liste(L, stil)
    n_ark = sum(len(L['ark']) for L in lister); n_bilder = sum(antall(a) for L in lister for a in L['ark'])
    n_del = sum(1 for L in lister for a in L['ark'] if a['type'] == 'del')
    ut = ['# Tegnelister til ChatGPT', '',
          'Laget av `tools/lag_tegnelister.py` fra `assets/manifest.json`. Ikke rediger for hånd; kjør skriptet på nytt når bilder er levert.', '',
          f'Status: {len(man) - len(MANGLER)} av {len(man)} bilder i manifestet er levert. De {len(MANGLER)} som mangler, er samlet i '
          f'{n_ark - n_del} ark og bilder fordelt på {len(lister)} lister, én ChatGPT-samtale per liste. I tillegg kommer {n_del} delark til oppskriftssystemet.', '',
          'Hvert ark er én PNG. Et figurark gir seks bilder (hode og kropp fra tre kanter), et «ni ting»-ark opptil ni. '
          'Store ting som trær, porter og sjefskropper tegnes som enkeltbilder, fordi en rute på malen blir for liten til dem. '
          'Referansebildene i `referanse/` viser dagens kodetegninger i samme rutenett som malen; last dem opp sammen med malen, så ser ChatGPT hva som skal i hver rute.', '',
          '| Liste | Innhold | Ark | Bilder |', '|---|---|---|---|']
    ut += [f"| [{L['nr']}. {L['tittel']}]({L['fil']}) | {', '.join(dict.fromkeys(tittel(a) for a in L['ark'][:6]))}{', ...' if len(L['ark']) > 6 else ''} | {len(L['ark'])} | {sum(antall(a) for a in L['ark']) or 'delark'} |" for L in lister]
    ut += ['', 'Rekkefølgen følger «Neste bestilling» i `DESIGN_BRIEF.md`: fiendene som synes mest først, møblene sist. '
           'Det som ikke har bilde ennå, tegnes av koden som før, så spillet får aldri hull.', ''] + hvordan(stil)
    ut += ['## Alle ark', '', 'Samme oversikt finnes som regneark i `tegneliste.csv`.', '', '| Nr | Filnavn | Mal | Bilder |', '|---|---|---|---|']
    rader = []
    for L in lister:
        for i, a in enumerate(L['ark']):
            nr = f"{L['nr']}{chr(97 + i)}"; rader.append([nr, L['tittel'], TYPENAVN[a['type']], filnavn(a), mal(a) or '', antall(a), ' '.join(a['rest']) if a['type'] != 'del' else ''])
            vist = filnavn(a) if len(filnavn(a)) < 60 else filnavn(a)[:56] + '....png'
            ut.append(f"| {nr} | `{vist}` | {mal(a) or ''} | {antall(a) or ''} |")
    (UT / 'LESMEG.md').write_text('\n'.join(ut) + '\n', encoding='utf-8')
    with open(UT / 'tegneliste.csv', 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f, delimiter=';'); w.writerow(['nr', 'liste', 'type', 'filnavn', 'mal', 'bilder', 'nokler']); w.writerows(rader)
    return n_ark, n_bilder, n_del

# ---------- referansebilder ----------
JS_BILDER = r"""(keys) => {
  const out = {};
  for (const k of keys) {
    if (k.startsWith('anim_')) { const R0 = Anim.rammer(k.slice(5)); if (R0) out[k] = R0.map(P => P.canvas.toDataURL('image/png')); continue; }
    const P = Art.cache.get(k); if (P && P.canvas) out[k] = [P.canvas.toDataURL('image/png')];
  }
  return out;
}"""

def lag_referanser(lister):
    import asyncio, base64, io
    from PIL import Image, ImageDraw, ImageFont
    from PIL.PngImagePlugin import PngInfo
    from playwright.async_api import async_playwright
    import lag_manifest as LM
    ark_ = [a for L in lister for a in L['ark'] if a['type'] in ('figur', 'ark', 'enkelt', 'anim')]
    trengs = sorted({k for a in ark_ for k in a['rest']})
    async def hent():
        async with async_playwright() as p:
            b, pg, errs = await LM.apne_spill(p)
            await pg.evaluate(LM.JS)  # tegner alt spillet kan tegne inn i Art.cache
            data = await pg.evaluate(JS_BILDER, trengs); await b.close(); return data, errs
    data, errs = asyncio.run(hent())
    if errs: print('feil i spillet:', errs[:3])
    bilde = lambda s: Image.open(io.BytesIO(base64.b64decode(s.split(',', 1)[1]))).convert('RGBA')
    BG, STREK, TXT = (236, 230, 218), (205, 196, 180), (150, 138, 120)
    try: font = ImageFont.load_default(size=22)
    except Exception: font = ImageFont.load_default()
    def lim(ut, im, x, y, C, midt, hel=False):
        bb = im.getchannel('A').getbbox()
        if not bb: return
        if not hel: im = im.crop(bb)  # hel: hele ruta skaleres likt, så bevegelsen mellom bildene i et spriteark synes
        s = min(C * .84 / im.width, C * .84 / im.height); im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
        ut.alpha_composite(im, (round(x + (C - im.width) / 2), round(y + ((C - im.height) / 2 if midt else C * .92 - im.height))))
    def rutenett(kol, rad, C, nummer=True):
        ut = Image.new('RGBA', (kol * C, rad * C), BG + (255,)); d = ImageDraw.Draw(ut)
        for i in range(1, kol): d.line([(i * C, 0), (i * C, rad * C)], fill=STREK, width=2)
        for j in range(1, rad): d.line([(0, j * C), (kol * C, j * C)], fill=STREK, width=2)
        if nummer:
            for j in range(rad):
                for i in range(kol): d.text((i * C + 8, j * C + 4), str(j * kol + i + 1), fill=TXT, font=font)
        return ut
    REF.mkdir(parents=True, exist_ok=True); laget = 0; tomme = []
    for a in ark_:
        rest = a['rest']; t = a['type']
        if t == 'figur':
            C = 256; ut = rutenett(3, 2, C, nummer=False)
            for k in rest:
                v = VIS.index(k[-1]); rad = 0 if k.startswith('hode_') else 1
                if k in data: lim(ut, bilde(data[k][0]), v * C, rad * C, C, rad == 0)
        elif t == 'ark':
            C = 256; ut = rutenett(3, 3, C)
            for i, k in enumerate(rest):
                if k in data: lim(ut, bilde(data[k][0]), (i % 3) * C, (i // 3) * C, C, not k.startswith(('prop_', 'drom_', 'kiste', 'vaapen_', 'hjul_')) or flat(k))
        elif t == 'anim':
            k = rest[0]; R0 = data.get(k) or []; C = 192
            if not R0: tomme.append(k); continue
            ut = rutenett(len(R0), 1, C)
            for i, s in enumerate(R0): lim(ut, bilde(s), i * C, 0, C, True, hel=True)
        else:
            k = rest[0]
            if k not in data: tomme.append(k); continue
            C = 512; ut = rutenett(1, 1, C, nummer=False); lim(ut, bilde(data[k][0]), 0, 0, C, flat(k))
        if not any(k in data for k in rest): tomme += rest; continue
        info = PngInfo(); info.add_text('nokler', ','.join(rest))
        ut.convert('RGB').quantize(colors=128).save(REF / ref_navn(a), optimize=True, pnginfo=info); laget += 1
    gyldige = {ref_navn(a) for a in ark_}
    for p in REF.glob('ref_*.png'):
        if p.name not in gyldige: p.unlink()  # ark som er levert, trenger ikke referanse lenger
    print(f'referansebilder: {laget} laget i tegnelister/referanse/' + (f', uten kodetegning: {tomme}' if tomme else ''))

if __name__ == '__main__':
    lister = planlegg()
    if '--bilder' in sys.argv: lag_referanser(lister)
    n_ark, n_bilder, n_del = skriv(lister)
    print(f'skrev tegnelister/: {len(lister)} lister, {n_ark - n_del} ark og bilder med {n_bilder} av {len(MANGLER)} manglende bilder, og {n_del} delark')
