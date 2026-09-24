"""Lager ART_BRIEF.md fra assets/manifest.json. Kjør etter tools/lag_manifest.py."""
import json, pathlib
ROT = pathlib.Path(__file__).resolve().parent.parent
man = json.loads((ROT / 'assets' / 'manifest.json').read_text(encoding='utf-8'))
kp = ROT / 'assets' / 'kuriositeter.json'
KUR = json.loads(kp.read_text(encoding='utf-8')) if kp.exists() else {}

FIG = {
  'pasient': 'the player: a small patient with messy black hair, big round glasses, rosy cheeks, mustard-yellow bathrobe with a brown belt and an ID badge',
  'pleier': 'a big stern nurse, square jaw, angry brows, hair in a bun, white cap with a red cross, boxy white uniform with apron',
  'kultist': 'a pale gloomy edgelord teenager cultist, dark hood, black eye makeup, skinny black robe with four leather belts with gold buckles',
  'oppasser': 'a tall thin hospital orderly in mint-green scrubs, surgical cap and white face mask, tired squinting eyes',
  'kokk': 'Fru Ruud, a round friendly cafeteria cook lady with a tall white chef hat and an apron',
  'hansen': 'Sister Hansen, a strict older nurse with a white cap',
  'olsen': 'Olsen the janitor, grey cap, bushy grey mustache, grey overalls',
  'bibliotekar': 'Ask the librarian, hair in a bun, small glasses, purple cardigan',
  'krok': 'BOSS: Chief surgeon Hektor Krok, huge and menacing, head mirror on his forehead, white coat with a blood-stained red apron',
  'rust': 'BOSS: hydrotherapist Ragnvald Rust, rubber diving-style helmet with round goggles, black rubber apron, big and damp',
  'arkivar': 'BOSS: chief archivist Gunhild Paragraf, tall and severe, grey hair bun, pince-nez, dusty grey suit covered in stamps and paper slips',
  'byrakrat': 'a hollow-eyed bureaucrat in a black suit and red tie, arms full of forms',
  'narkose': 'an anesthetist in a green surgical gown with a rubber ether mask and a big glass bottle',
  'pasient_kvinne': 'the player, female version: a small patient woman with messy long dark hair, a white hair clip, big round glasses, rosy cheeks, mustard-yellow bathrobe with a brown belt',
  'tvang': 'the player patient wearing an off-white canvas straitjacket with brown leather straps and brass buckles, one loose strap dangling (the clothes only)',
  'skjorte': 'the player patient wearing a pale blue hospital gown with a tiny diamond pattern and short sleeves; seen from behind it is open with ties and white polka-dot underpants (the clothes only)',
  'pyjamas': 'the player patient wearing white pyjamas with vertical blue stripes, a lapel collar, buttons and a breast pocket (the clothes only)',
}
VIEW = {'f': 'front view, facing the viewer', 'b': 'back view, facing away', 's': 'side view, facing right', 'x': 'front view, dead with X marks over the eyes (comedic)'}
CARD = {
  'due': 'a grey city pigeon with a red eye and a puffed chest', 'lys': 'an old medical examination lamp shining a bright yellow beam',
  'skyggehand': 'a purple shadow hand made of dark smoke reaching upward', 'stempel': 'a red rubber office stamp slamming down with a splash of red ink',
  'brekning': 'a pale cartoon head vomiting a green splash (funny, not gross)', 'monolog': 'a big speech bubble full of dramatic scribbles',
  'hydro': 'a brass fire-hose nozzle spraying blue water', 'kappe': 'a dramatic black cape with purple lining, swirling',
  'skjema': 'a blank official paper form with lines and a stamp box', 'nokler': "a janitor's iron key ring with three old keys",
  'resept': 'a prescription note with a red and white pill capsule', 'benektelse': 'a speech bubble with a big red X',
  'ukjent': 'a dark silhouette of a person with a question mark',
}
MISC = {
  'alter3': 'a stone altar draped in purple cloth with two lit candles, three tiles wide, front view',
  'disk_kafeteria5': 'a long wooden cafeteria counter with a steel soup pot and bread, front view',
  'disk_medisin3': 'a wooden medicine counter with small glass bottles, front view',
  'disk_vaktmester3': "a janitor's workbench counter with tools and a vise, front view",
  'due_figur': 'a grey city pigeon standing, side view', 'garderobes': 'a tall wooden wardrobe, side view',
  'hjerte': 'a small red cartoon heart (health pickup)', 'journalskap': 'a large dark wooden filing cabinet with many drawers, one drawer glowing purple, front view',
  'kiste_lukket': 'a small wooden treasure chest with iron bands, closed', 'kiste_open': 'the same chest, open, gold teeth inside',
  'kommodef': 'a wooden chest of drawers, front view', 'lik': 'a dead patient in a yellow bathrobe lying on the floor, X eyes, comedic, seen from above at an angle',
  'morbdrape': 'a glowing purple liquid droplet (pickup)', 'olsenskap': 'a grey steel locker with a big padlock, front view',
  'prop_bench': 'a wooden waiting-room bench, front view', 'prop_bord': 'a small white enamel hospital table',
  'prop_chair': 'a wooden waiting-room chair, front view', 'prop_chair_b': 'the same wooden chair seen from behind',
  'prop_crate': 'a wooden crate', 'prop_do': 'an old porcelain toilet with a wooden seat, front view',
  'prop_drain': 'a round iron floor drain seen from straight above (flat on the floor)',
  'prop_kjetting': 'a rusty iron chain hanging from above with a meat hook at the end',
  'prop_kurv': 'a wicker laundry basket full of white sheets', 'prop_lamp': 'a tall standing medical examination lamp',
  'prop_luke': 'an open wooden trapdoor in the floor with darkness below, seen from above',
  'prop_lys': 'three white candles of different heights, lit', 'prop_pillar': 'a stone pillar with a simple capital',
  'prop_plant': 'a potted palm in a terracotta pot', 'prop_side': 'a small wooden side stand',
  'prop_soppel': 'a metal trash can overflowing with paper', 'prop_trolley': 'a steel hospital trolley with bottles and a folded towel',
  'pult': 'a wooden writing desk with papers and an inkwell, front view', 'sjakt': 'a metal laundry chute hatch set in a steel box',
  'skyggehand_p': 'a purple smoky shadow hand flying forward (projectile)', 'sperre': 'a barricade of wooden planks with red and white warning stripes',
  'stempelmerke': 'a smudged red rectangular rubber-stamp imprint', 'stjerne': 'a white and yellow comic impact star burst',
  'tann': 'a single gold tooth (currency pickup)', 'vaskemaskin2': 'two old industrial washing machines side by side with round glass doors, front view',
  'flaske_levertran': 'a small brown glass bottle of cod liver oil with a cork', 'flaske_luktesalt': 'a small white smelling-salts jar with a red cap',
  'flaske_eter': 'a blue glass ether bottle with a cork', 'flaske_kamfer': 'an orange camphor ointment tin',
  'vaapen_mopp': "a janitor's mop, wooden handle, grey clamp, strings dripping purple", 'vaapen_stativ': 'an IV drip stand: metal pole with an empty drip bag',
  'vaapen_sag': 'a bone saw with a wooden handle', 'vaapen_bekken': 'a white enamel bedpan on a handle', 'vaapen_sproyte': 'a large glass syringe',
  'vaapen_krok': "a surgeon's large bone hook", 'vaapen_slange': 'a rubber hose with a brass nozzle',
  'sko_tofler': 'ONE pink bunny slipper with little ears, front view', 'sko_klogg': 'ONE black clog, side view', 'sko_stovel': 'ONE black pointy boot, side view', 'sko_hvit': 'ONE white nurse clog, side view',
  'blob_yngel_f': 'drain spawn: a small purple slime creature with several mismatched eyes and a toothy grin, front view',
  'sko_barfot': 'ONE bare human foot with toes, side view', 'sko_sokk': 'ONE grey wool sock with a red band, side view',
  'pynt_nattlue': 'a striped red and white nightcap with a pompom, drooping to the side (worn on a head, drawn alone)', 'pynt_papiljotter': 'five pastel hair curlers in a row, as worn on top of a head (drawn alone)',
  'pynt_harnett': 'a thin dark hair net shaped like a dome (drawn alone)', 'pynt_hjelm': 'a padded brown leather protective helmet with brass rivets (drawn alone)',
  'pynt_rosett': 'a small red hair bow', 'pynt_plaster': 'a crossed pair of beige sticking plasters', 'pynt_sting': 'a short stitched scar with black stitches',
  'prop_menytavle': 'a small chalkboard menu sign on legs reading nothing (the game adds no text), cafeteria style', 'prop_vekt': 'an old upright doctor\'s weighing scale with a sliding weight bar',
  'prop_botte': 'a zinc mop bucket with a mop standing in it', 'prop_bokstabel': 'a wobbly stack of old leather-bound books', 'prop_lesestol': 'a worn green leather reading armchair',
  'prop_linhaug': 'a heap of dirty white hospital linen', 'prop_torkesnor3': 'a drying line on two poles with white sheets hanging, three tiles wide', 'prop_strykebrett': 'an old wooden ironing board with a heavy iron',
  'prop_madrass': 'a thin striped mattress lying on the floor, stained', 'prop_tvangstroye': 'an empty straitjacket hanging on a coat stand', 'prop_papirhaug': 'a knee-high heap of loose papers and files',
  'prop_forbannet': 'a cursed floor sigil: a red glowing occult circle scratched into the floor, seen from above (flat on the floor)', 'celle': 'a padded cell corner: quilted white walls, two tiles wide',
  'arkivhylle3': 'a tall dark archive shelf stuffed with folders and boxes, three tiles wide', 'medisinskap': 'a white enamel medicine cabinet with glass doors and bottles inside',
  'offeralter': 'a sacrificial altar of dark stone with a bowl of blood and red candles', 'sprekkvegg': 'a cracked section of wall with light shining through the crack',
  'kortplukk': 'an ability card lying on the floor, slightly tilted, face down with a purple back (pickup)',
  'torner': 'a tangle of black thorny vines (a hazard lying on the floor)', 'isolatvegg': 'a padded white cell wall panel with buttons, standing', 'stempelfall': 'a giant red rubber office stamp falling down',
}
SENG = {'bed': 'an iron hospital bed with white sheets and a blue blanket', 'optable': 'a steel operating table with blood stains and an overhead lamp arm', 'gurney': 'a steel hospital stretcher on wheels', 'tub': 'an old clawfoot bathtub filled with murky water'}
RETN = {'n': 'lengthwise into the picture, head end far away (top)', 's': 'lengthwise into the picture, head end nearest the viewer (bottom)', 'w': 'sideways, head end on the left', 'e': 'sideways, head end on the right'}

def beskriv(k):
    if k in MISC: return MISC[k]
    import re
    if re.match(r'^(disk_kafeteria|disk_medisin|disk_vaktmester|vaskemaskin|verktoytavle)\d$', k):
        base, n = k[:-1], k[-1]
        return {'disk_kafeteria': 'a long wooden cafeteria counter with a steel soup pot and bread', 'disk_medisin': 'a wooden medicine counter with small glass bottles', 'disk_vaktmester': "a janitor's workbench counter with tools and a vise", 'vaskemaskin': 'old industrial washing machines side by side with round glass doors', 'verktoytavle': 'a pegboard with hanging tools (hammers, saws, keys)'}[base] + f', {n} tiles wide, front view'
    if k.startswith('kur_'):
        i = KUR.get(k[4:], {}); return f"item icon, a single grotesque 1920s hospital curiosity: «{i.get('name', k[4:])}» ({i.get('desc', '')}). Isaac-style item sprite, readable at small size"
    if k.startswith('akt_'):
        i = KUR.get('akt:' + k[4:], {}); return f"icon for an active gadget from a 1920s sanatorium: «{i.get('name', k[4:])}» ({i.get('desc', '')}). Readable at small size"
    if k.startswith('lomme_'):
        i = KUR.get('lomme:' + k[6:], {}); return f"icon for a small pocket trinket: «{i.get('name', k[6:])}» ({i.get('desc', '')}). Tiny object, readable at small size"
    if k.startswith('pynt_'): return k
    if k == 'glass_tomt': return 'an empty glass specimen jar with a metal lid, standing on a small wooden base (the game puts the item inside)'
    if k.startswith('pille_'): return 'ONE small pill capsule, color: ' + k.split('_')[-1] + ' (rod=red, bla=blue, gul=yellow, hvit=white, svart=black, rosa=pink, gronn=green, flekket=white with red dots)'
    if k.startswith('tillegg_'): return 'a tiny add-on worn by the player character: ' + {'glassoye': 'a glass eye', 'svulst': 'a pink lump on the head', 'lys': 'a lit candle stuck on the head', 'bart': 'a glued-on mustache', 'tunge': 'a tongue sticking out', 'eyeliner': 'heavy black eyeliner around two eyes', 'igler': 'three leeches', 'horn': 'two small devil horns', 'bandasje': 'a head bandage with a red spot'}.get(k[8:], k[8:]) + '. Tiny, drawn alone'
    if k == 'skudd_slim': return 'a small glob of green-yellow phlegm (projectile)'
    if k.startswith('blob_'):
        typ, v = k.split('_')[1], k.split('_')[2]
        return {'tvang': 'an enemy patient in a straitjacket, arms bound, hopping, wild eyes', 'rotte': 'a fat grey archive rat with a paper slip in its mouth', 'oyeblomst': 'an eye flower: a fleshy stalk rooted in the floor with a big bloodshot eye as its bloom', 'journalen': 'FINAL BOSS: the Journal, a huge floating leather-bound patient journal with tentacles and teeth, pages flapping', 'flue': 'a fat bluebottle meat fly with big red eyes', 'svulst': 'a walking pink tumor with veins, one eye and a grin', 'lunge': 'a pink human lung walking on its own, tar spots, tiny sad face', 'yngel': 'drain spawn: a small purple slime creature with mismatched eyes and a toothy grin'}.get(typ, typ) + '. ' + VIEW.get(v, v)
    if k.startswith('kort_'): return CARD.get(k[5:], k[5:]) + '. Square card illustration, subject centered'
    if k.startswith('seng_'):
        kind = next(x for x in SENG if k[5:].startswith(x)); return SENG[kind] + ', ' + RETN[k[-1]]
    if k.startswith('puff'): return 'a small cartoon dust cloud puff, beige with a brown outline'
    for pre, hva in (('hode_', 'HEAD ONLY (no neck, no body)'), ('kropp_', 'TORSO AND HIPS ONLY (no head, no arms, no legs)'), ('kappe_', 'the long black cape with purple lining ALONE, hanging')):
        if k.startswith(pre):
            typ, v = k[len(pre):].rsplit('_', 1); return f'{hva} of {FIG.get(typ, typ)}. {VIEW.get(v, v)}'
    return k

# det ChatGPT allerede har levert: enkeltbilder, ark med nøkler i navnet og figurark
LEV = set()
for mappe in (ROT / 'gpt-grafikk', ROT / 'gpt-grafikk' / 'behandlet'):
    for f in (mappe.glob('*.png') if mappe.exists() else []):
        n = f.stem
        if n.startswith('ark__'): LEV |= {k for k in n[5:].split('__') if k != '_'}
        elif n.startswith('figur_'): LEV |= {f'{d}_{n[6:]}_{v}' for d in ('hode', 'kropp') for v in 'fbs'}
        else: LEV.add(n)

def format_(m):
    r = m['w'] / m['h']
    return 'kvadrat' if .8 <= r <= 1.25 else ('stående' if r < .8 else 'liggende')

RUNDER = [
  ('Runde 1: kuriositetene (Isaac-gjenstander), apparater og lommerusk', lambda k: k.startswith(('kur_', 'pille_', 'akt_', 'lomme_')) or k == 'glass_tomt', 'Gjenstandene man plukker opp og kombinerer. Små, tydelige og groteske, som gjenstandene i The Binding of Isaac. Bruk gjerne «ni ting»-arket fra DESIGN_BRIEF.md.'),
  ('Runde 2: evnekortene', lambda k: k.startswith('kort_'), 'Størst gevinst først. Kortene vises i HUD-en og i journalen. Motivet midt i bildet, spillet tegner selve kortrammen.'),
  ('Runde 3: rekvisitter og møbler', lambda k: k.startswith(('prop_', 'seng_', 'skap', 'hylle', 'disk_', 'kiste_')) or k in ('journalskap', 'olsenskap', 'pult', 'sjakt', 'alter3', 'kommodef', 'garderobes', 'sperre', 'lik', 'celle', 'medisinskap', 'offeralter', 'sprekkvegg') or k.startswith(('arkivhylle', 'vaskemaskin', 'verktoytavle')), 'Møblene står i 3/4-vinkel: du ser fronten og litt av toppen. Bunnen av møbelet helt nederst i motivet.'),
  ('Runde 4: plukk, effekter, tillegg og pynt', lambda k: k in ('hjerte', 'morbdrape', 'tann', 'due_figur', 'stempelmerke', 'skyggehand_p', 'stjerne', 'skudd_slim', 'torner', 'isolatvegg', 'stempelfall', 'kortplukk') or k.startswith(('flaske_', 'puff', 'tillegg_', 'pynt_')), 'Små ting. Enkle former, tydelig kontur.'),
  ('Runde 5: våpen', lambda k: k.startswith('vaapen_'), 'Våpenet står loddrett med håndtaket nederst og tuppen opp. Spillet roterer det selv.'),
  ('Runde 6: figurer', lambda k: k.startswith(('hode_', 'kropp_', 'kappe_', 'blob_', 'sko_')), 'Vanskeligst. Be først om et figurark (samme figur forfra, bakfra, fra siden), og deretter om hode og kropp hver for seg fra arket. Armer og bein tegner spillet selv som tykke streker, så de skal ikke være med.'),
]
STIL = '''Style: hand-drawn cartoon game art in the style of Conan Chop Chop mixed with Castle Crashers. Thick dark brown ink outlines (#2a1a14) with a slightly wobbly, hand-inked line that is heavier on the lower right. Flat colors with one darker cel-shade tone on the lower right and a small light highlight on the upper left. Muted, warm 1920s palette. Setting: a 1920s Norwegian sanatorium, Lovecraftian and a bit gross, but with dark humor. Camera: seen from the front and slightly above (about 50 degrees), like a top-down action game, so objects show their front and a little of their top.
Technical: PNG with a TRANSPARENT background. Exactly one object, centered, fully visible (not cropped). No ground shadow, no text, no frame, no background scenery.'''

ut = ['# Morbidium: kunstbrief for bildegenerering', '',
 'Denne fila er laget av `tools/lag_brief.py` fra `assets/manifest.json`. Ikke rediger den for hånd; endre skriptet og kjør det på nytt.', '',
 '## Slik gjør du det', '',
 '1. Lim inn stilblokken under i ChatGPT én gang, og be den bruke stilen for alle bildene i samtalen.',
 '2. Be om ett bilde om gangen: «Draw: <beskrivelse fra tabellen>». Bruk formatet i tabellen (kvadrat 1024x1024, stående 1024x1536, liggende 1536x1024).',
 '3. Last ned bildet som PNG og gi det nøyaktig filnavnet fra tabellen, for eksempel `kort_due.png`.',
 '4. Last det opp til `gpt-grafikk/` i repoet (Add file, Upload files).',
 '5. Resten gjør Claude: `python3 tools/behandle_bilder.py` fjerner eventuell bakgrunn, beskjærer, skalerer og setter festepunktet, og `python3 build.py` bygger bildet inn i spillet. Alt som ikke har bilde ennå, tegnes av koden som før.', '',
 '## Stilblokk (lim inn i ChatGPT)', '', '```', STIL, '```', '',
 '## Tips', '',
 '- Samme stil i alle bilder er viktigere enn at hvert enkelt bilde er perfekt. Bruk samme ChatGPT-samtale for en hel runde.',
 '- Gjennomsiktig bakgrunn er best. Hvit eller ensfarget bakgrunn går også, verktøyet fjerner den fra kantene og innover.',
 '- Ikke tegn skygge på bakken. Spillet legger på skygge og lys selv.', '']
brukt = set()
for tittel, f, merk in RUNDER:
    ks = sorted(k for k in man if f(k) and k not in brukt); brukt |= set(ks)
    lev = sum(1 for k in ks if k in LEV)
    ut += [f'## {tittel} ({len(ks)} bilder, {lev} levert)', '', merk, '', '| Filnavn | Beskrivelse til ChatGPT | Format | Levert |', '|---|---|---|---|']
    ut += [f'| `{k}.png` | {beskriv(k)} | {format_(man[k])} | {"ja" if k in LEV else ""} |' for k in ks]
    ut.append('')
rest = sorted(k for k in man if k not in brukt)
if rest: ut += ['## Øvrige', '', '| Filnavn | Beskrivelse | Format | Levert |', '|---|---|---|---|'] + [f'| `{k}.png` | {beskriv(k)} | {format_(man[k])} | {"ja" if k in LEV else ""} |' for k in rest] + ['']
ut.insert(ut.index('## Stilblokk (lim inn i ChatGPT)'), f'Status: {sum(1 for k in man if k in LEV)} av {len(man)} bilder er levert. Kolonnen «Levert» viser hvilke.')
ut.insert(ut.index('## Stilblokk (lim inn i ChatGPT)'), '')
(ROT / 'ART_BRIEF.md').write_text('\n'.join(ut), encoding='utf-8')
print('skrev ART_BRIEF.md med', len(man), 'bilder,', len(rest), 'uten runde')
