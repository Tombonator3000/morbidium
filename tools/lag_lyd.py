"""Henter frie lyder (CC0) og lager assets/lyd/: klippet, normalisert og kodet som mono-MP3, med kildeliste.

Kilder:
  freesound  forhåndsvisningen (hq, 128 kbps) av lyder merket Creative Commons 0 på freesound.org.
             Lisensen sjekkes på lydens egen side hver gang fila hentes; mangler CC0-lenken, stopper verktøyet.
  vcsl       Versilian Community Sample Library (CC0, github.com/sgossner/VCSL), rå WAV-filer.

Hver lyd får et navn, det samme som Sound.play() bruker i spillet. Flere lyder med samme navn blir
varianter (navn, navn_2, navn_3), og spillet velger tilfeldig. Instrumentprøvene heter ins_<instrument>_<n>,
får tonehøyden målt (rot, MIDI) og, for toner som holdes (orgel, psalter, vinglass, saks), en sløyfe midt i.
Stemningslydene (amb_*) får halen blandet inn i starten, så de kan gå i sløyfe uten klikk.

Ferdige filer: assets/lyd/<navn>.mp3 og assets/lyd/lyd.json (lengde, tonehøyde, sløyfe og kilde), og
assets/lyd/KILDER.md med alle forfattere. Mellomlager: .lydcache/ (ikke i git).
Krever ffmpeg (pip install imageio-ffmpeg) og numpy.

Bruk:  python3 tools/lag_lyd.py            (henter det som mangler i mellomlageret og lager alt på nytt)
       python3 tools/lag_lyd.py --bare hit,ins_orgel
"""
import json, re, subprocess, sys, time, urllib.parse
from pathlib import Path
import numpy as np

ROT = Path(__file__).resolve().parent.parent
UT = ROT / 'assets' / 'lyd'
CACHE = ROT / '.lydcache'
VCSL = 'https://raw.githubusercontent.com/sgossner/VCSL/master/'

def ffmpeg():
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        return 'ffmpeg'

# ---------- lydeffekter og stemningslyder fra Freesound (alle Creative Commons 0) ----------
# (navn, id, bruker, tittel)
FREESOUND = [
  ('amb_baal', 650574, 'soundofsong', 'fire crackling loop.wav'),
  ('amb_brum', 619320, 'aSuperiorPotato', 'Facility Hum Ambience Loopable'),
  ('amb_drone', 249985, 'Werra', 'Eerie Dark Drone Soundscape'),
  ('amb_drypp', 696438, 'Patrick_Corra', 'Water drops with reverb'),
  ('amb_hav', 179927, 'yosarrian', 'underwater'),
  ('amb_natt', 129678, 'FreethinkerAnon', 'crickets'),
  ('amb_regn', 265627, 'director89', 'Rain-Atmo.WAV'),
  ('amb_vind', 146932, 'crashoverride6', 'Wind Gust'),
  ('bjelle', 462042, '15HVojta_Michael', 'small bell_1.wav'),
  ('bokslag', 235588, 'tcrocker68', 'Book_Closing.wav'),
  ('bonk', 66397, '110110010', 'wood_knock.wav'),
  ('bonk', 629987, 'Flem0527', 'Knocking on Wood Door (1)'),
  ('chain', 536737, 'egomassive', 'Chain.ogg'),
  ('die', 417994, 'DylanTheFish', 'Body fall.wav'),
  ('dodge', 494797, 'brandondelehoy', 'Jacket/Cloth Rustle 9'),
  ('dodge', 496188, 'JonasTisell', 'Whoosh (Clothing Drag)'),
  ('door', 216878, 'CastIronCarousel', 'Squeaky door opened quickly.wav'),
  ('door', 219499, 'JarredGibb', 'Door - Creak.wav'),
  ('dorslag', 48980, 'Lunardrive', 'Metal Door Slam_SoundSmith.wav'),
  ('dorslag', 266682, 'wjtaylor', 'door_close'),
  ('drypp', 166325, 'deleted_user_2104797', 'Water_drop_9.wav'),
  ('drypp', 174718, 'paespedro', 'Single Water Drop'),
  ('fot_gress', 151235, 'OwlStorm', 'Grassy Footstep 4'),
  ('fot_gress', 396016, 'morganpurkis', 'Rustling Grass 4.wav'),
  ('fot_stein', 166508, 'Yoyodaman234', 'concrete footstep 2'),
  ('fot_stein', 690006, 'matth3wc04', 'Concrete Footstep 2.mp3'),
  ('fot_stein', 778502, 'BlondPanda', 'Cloth_And_Shoes_On_Concrete_22'),
  ('fot_tre', 421153, 'GiocoSound', 'Footstep_Wood_Toe_1.wav'),
  ('fot_tre', 434759, 'Notarget', 'Wood step Sample 4'),
  ('fot_vann', 450621, 'Breviceps', 'Step into water puddle / wade'),
  ('fot_vann', 841834, 'Robo9418', 'Small Puddle Splash'),
  ('glass', 267889, 'wjl', 'Breaking-Glass.wav'),
  ('glass', 418194, 'deleted_user_3656686', 'Hard Glass Impact'),
  ('gore', 641046, 'magnuswaker', 'Gore Impact - "LOT OF HEART"'),
  ('gore', 649982, 'SoundDesignForYou', 'Squelching SFX [6]'),
  ('gore', 784768, 'AKkingStudio', 'DeathCrunch Gore SFX Blood and Bone'),
  ('gulvknirk', 502504, 'Rudmer_Rotteveel', 'Wood Creak Single V2'),
  ('gulvknirk', 502505, 'Rudmer_Rotteveel', 'Wood Creak Single V1'),
  ('hit', 276600, 'insanity54', 'body_hit.wav'),
  ('hit', 380616, 'Lesmash', 'hard-punch.wav'),
  ('hit', 411693, 'deoking', 'punch2.wav'),
  ('hitHeavy', 399183, 'janbezouska', 'Major punch'),
  ('hitHeavy', 517744, 'danlucaz', 'Punch'),
  ('hjerte', 540985, 'magnuswaker', 'Heartbeat (Dumpf-Dumpf)'),
  ('hund', 581478, 'rvandemark', 'Dogs Barking in Distance_Rural.wav'),
  ('hund', 813116, 'qubodup', 'Distant Dog Bark'),
  ('hvisk', 22328, 'sleepCircle', 'whisper trail 1.ogg'),
  ('hvisk', 211872, 'Fyodore', 'whispers and screams'),
  ('kjetting', 167914, 'ani_music', 'Steel chain dragged, shower reverb'),
  ('kjetting', 405417, 'Mrthenoronha', 'Pulling Chain.wav'),
  ('klokketikk', 212181, 'OwlStorm', 'Loopable Ticking Clock'),
  ('knas', 392883, 'clif_creates', 'Hard Candy / Bone Crunch'),
  ('knas', 578874, 'samueleunimancer', 'BoneSnaping.mp3'),
  ('knirk', 377552, 'Mafon2', 'Wooden Creak'),
  ('knirk', 502511, 'Rudmer_Rotteveel', 'Wood Creak Single V3'),
  ('kraake', 361470, 'Jofae', 'Crow Caw'),
  ('kraake', 813115, 'qubodup', 'Crow Caw'),
  ('ku', 700380, 'manofham', 'Moo 3 - Moo Moo the Cow'),
  ('kvist', 164472, 'deleted_user_2104797', 'Crack of branch 3.wav'),
  ('kvist', 251464, 'martian', 'twig snap classic.wav'),
  ('paper', 346835, 'yatoimtop', 'PageTurn.wav'),
  ('paper', 397548, 'LilMati', 'Page Turn 01'),
  ('radio', 335205, 'dotY21', 'TV static Channel change'),
  ('rive', 528263, 'magnuswaker', 'Pound of Flesh 2'),
  ('rive', 762900, 'gowoto', 'Gore_Physical tear'),
  ('ror', 453333, 'kyles', 'metal crank groan.flac'),
  ('ror', 481787, 'Crinkem', 'Metallic groan long.wav'),
  ('rotte', 288941, 'toefur', 'rat-squeak.wav'),
  ('rotte', 536753, 'egomassive', 'Rat.ogg'),
  ('skrik', 789680, 'DavidKronberg', 'Haunted 1'),
  ('skrik', 844113, 'perspektywa_tn', 'scream_female_muffled'),
  ('skrivemaskin', 380137, 'yottasounds', 'Typewriter - single key - type 2.wav'),
  ('skrivemaskin', 406243, '_stubb', 'Typewriter ding_near_mono.wav'),
  ('slam', 513694, 'kasparsj', 'impact-stone-heavy.wav'),
  ('slam', 640204, '7of9Designs', 'Heavy Metal Thud on Ground'),
  ('slim', 442772, 'qubodup', 'Slime Squish'),
  ('slim', 447929, 'Breviceps', 'Step on a slug (Splat!) 1'),
  ('sluk', 529300, 'brittmosel', 'drain finishing/glug'),
  ('spark', 94132, 'BMacZero', 'Spark.wav'),
  ('spark', 189630, 'elliott.klein', 'Spark'),
  ('splash', 186748, 'rombart', 'Splash-eau-goudron1.wav'),
  ('splash', 398032, 'swordofkings128', 'Splash'),
  ('splat', 55234, 'SlykMrByches', 'Splattt.mp3'),
  ('splat', 323525, 'Kreastricon62', 'Bloody Blade.wav'),
  ('splat', 445109, 'Breviceps', 'Mud Splat'),
  ('stamp', 362622, 'kermite607', 'Stamp'),
  ('stamp', 362624, 'kermite607', 'Stamp'),
  ('stikk', 344404, 'jawbutch', 'Knife Stab Melon.wav'),
  ('stonn', 196720, 'PaulMorek', 'SZ_Zombies_02.wav'),
  ('stonn', 463721, 'EricsSoundschmiede', 'Burp Monster Zombie groan moan'),
  ('summ', 556717, 'NachtmahrTV', 'Electricity Sound'),
  ('swing', 60013, 'qubodup', 'Whoosh'),
  ('swing', 389590, 'Jofae', 'Swing Woosh'),
  ('swingHeavy', 475135, 'bolkmar', 'FX - Swoosh - Low Pitch'),
  ('tooth', 343462, 'Rocotilos', 'Real Coin Drop'),
  ('tooth', 350875, 'cabled_mess', 'Coin_C_07'),
  ('torden', 188767, 'vonz', 'Thunder (Kraków, Poland, 20.05.2013)'),
  ('torden', 475094, 'Josh74000MC', 'thunder3.ogg'),
  ('ugle', 447211, 'Gamba_Studio', 'Buhos.wav'),
  ('vomit', 383334, 'DeezSoundzTho', 'pukesplash.wav'),
  ('zap', 136542, 'JoelAudio', 'ELECTRIC_ZAP_001.wav'),
  ('zap', 530356, 'danielpodlovics', 'Electricity.wav'),
]
# klipp og nivå per navn: fra (s etter stillheten foran), lengde (s), ut (uttoning, s), maal (toppnivå, dBFS)
OPT = {
  'swing': dict(lengde=.45), 'swingHeavy': dict(lengde=.7), 'hit': dict(lengde=.45), 'hitHeavy': dict(lengde=.7), 'bonk': dict(lengde=.35),
  'die': dict(lengde=1.2), 'dodge': dict(lengde=.4), 'splat': dict(lengde=.8), 'knas': dict(lengde=.7), 'gore': dict(lengde=1.0), 'rive': dict(lengde=.9),
  'stikk': dict(lengde=.6), 'slam': dict(lengde=1.1), 'chain': dict(lengde=.9), 'kjetting': dict(lengde=1.8, maal=-3), 'bjelle': dict(lengde=2.3, ut=.8),
  'stamp': dict(lengde=.4), 'paper': dict(lengde=.5), 'bokslag': dict(lengde=.5), 'glass': dict(lengde=1.1), 'door': dict(lengde=1.2), 'dorslag': dict(lengde=.8),
  'knirk': dict(lengde=1.0, maal=-4), 'gulvknirk': dict(lengde=.9, maal=-6), 'splash': dict(lengde=.9), 'drypp': dict(lengde=.45, maal=-4), 'vomit': dict(lengde=1.0),
  'tooth': dict(lengde=.35, maal=-3), 'zap': dict(lengde=.6), 'spark': dict(lengde=.35), 'hjerte': dict(lengde=.7), 'skrik': dict(lengde=1.8, maal=-6, ut=.6),
  'ror': dict(lengde=1.6, maal=-5, ut=.5), 'skrivemaskin': dict(lengde=.9), 'rotte': dict(lengde=.6, maal=-4), 'ugle': dict(lengde=1.1, maal=-5), 'kraake': dict(lengde=.8, maal=-3),
  'kvist': dict(lengde=.4), 'hund': dict(lengde=1.2, maal=-6), 'ku': dict(lengde=1.8), 'radio': dict(lengde=1.5, maal=-5), 'torden': dict(lengde=3.4, ut=1.2),
  'fot_stein': dict(lengde=.3, ut=.05, maal=-4), 'fot_tre': dict(lengde=.3, ut=.05, maal=-4), 'fot_gress': dict(lengde=.35, ut=.06, maal=-5), 'fot_vann': dict(lengde=.4, ut=.08, maal=-4),
  'hvisk': dict(lengde=2.6, maal=-6, ut=.7), 'stonn': dict(lengde=1.6, maal=-4, ut=.4), 'slim': dict(lengde=.6), 'sluk': dict(lengde=2.0, maal=-5, ut=.5),
  'klokketikk': dict(lengde=3.0, sloyfe=True, maal=-8), 'summ': dict(lengde=2.0, sloyfe=True, maal=-8),
  'amb_regn': dict(fra=1, lengde=9, sloyfe=True), 'amb_hav': dict(fra=2, lengde=10, sloyfe=True), 'amb_drone': dict(fra=2, lengde=10, sloyfe=True),
  'amb_baal': dict(lengde=4.5, sloyfe=True), 'amb_drypp': dict(fra=.5, lengde=7, sloyfe=True), 'amb_natt': dict(fra=1, lengde=8, sloyfe=True),
  'amb_brum': dict(fra=.5, lengde=6, sloyfe=True), 'amb_vind': dict(lengde=7, sloyfe=True)}

# ---------- instrumentprøver fra VCSL (CC0) ----------
# instrument: (mappe, [filer], valg). holdt = tonen holdes og trenger sløyfe; okt = oktavforskyvning i filnavnene
# (de fleste mappene i VCSL kaller midt-C for C3, så okt=12 gir riktig MIDI-nummer; harpa og psalteret kaller den C4).
# Tonen tas fra filnavnet. Målingen skrives bare ut som kontroll, fordi autokorrelasjon bommer med oktaver på lyse
# og uharmoniske instrumenter (glockenspiel, vibrafon, klokker, vinglass). Paukene har ikke tone i navnet og måles i spekteret (tone='fft').
ORG = 'Aerophones/Edge-blown Aerophones/Pipe Organ/'
INSTRUMENTER = {
  'orgel': (ORG + 'Quiet/', ['NT5_Man3Quiet_C3_rr1.wav', 'NT5_Man3Quiet_F#3_rr1.wav', 'NT5_Man3Quiet_C4_rr1.wav', 'NT5_Man3Quiet_F#4_rr1.wav', 'NT5_Man3Quiet_C5_rr1.wav'], dict(holdt=True, lengde=2.4, okt=12)),
  'orgelbass': (ORG + 'Quiet Pedal/', ['NT5_PedalQuiet_C1_rr1.wav', 'NT5_PedalQuiet_F#1_rr1.wav', 'NT5_PedalQuiet_C2_rr1.wav'], dict(holdt=True, lengde=2.4, okt=12)),
  'piano': ('Chordophones/Zithers/Upright Piano, Knight/Sustains/', ['Player_vl1_rr1_A1.wav', 'Player_vl1_rr1_D#2.wav', 'Player_vl1_rr1_A2.wav', 'Player_vl1_rr1_D#3.wav', 'Player_vl1_rr1_A3.wav'], dict(lengde=2.0, ut=.6, okt=12)),
  'glock': ('Idiophones/Struck Idiophones/Glockenspiel/', ['glock_soft_G4_01.wav', 'glock_soft_C5_02.wav', 'glock_soft_G5_01.wav', 'glock_soft_C6_01.wav'], dict(lengde=1.3, ut=.5, okt=12)),
  'vibrafon': ('Idiophones/Struck Idiophones/Vibraphone/Soft Mallets/', ['Vibes_soft_C3_v1_rr2_Main.wav', 'Vibes_soft_G3_v1_rr1_Main.wav', 'Vibes_soft_D4_v1_rr1_Main.wav', 'Vibes_soft_A4_v1_rr1_Main.wav', 'Vibes_soft_E5_v1_rr1_Main.wav'], dict(lengde=2.2, ut=.8, okt=12)),
  'klokker': ('Idiophones/Struck Idiophones/Tubular Bells 1/', ['chimes_C3_f_rr1.wav', 'chimes_G#3_ff_rr1.wav', 'chimes_E4_ff_rr2.wav'], dict(lengde=3.0, ut=1.2, okt=12)),
  'harpe': ('Chordophones/Composite Chordophones/Concert Harp/', ['KSHarp_D2_mf1.wav', 'KSHarp_A2_mf1.wav', 'KSHarp_E3_mf1.wav', 'KSHarp_B3_mf1.wav', 'KSHarp_F4_mf1.wav', 'KSHarp_C5_mf1.wav'], dict(lengde=1.5, ut=.5, okt=0)),
  'cembalo': ('Chordophones/Zithers/Harpsichord, French/Sustains/', ['Harpsi2_Normal_C2_rr1_Main.wav', 'Harpsi2_Normal_F#2_rr1_Main.wav', 'Harpsi2_Normal_C3_rr1_Main.wav', 'Harpsi2_Normal_F#3_rr1_Main.wav', 'Harpsi2_Normal_C4_rr1_Main.wav'], dict(lengde=1.2, ut=.4, okt=12)),
  'vinglass': ('Idiophones/Friction Idiophones/Wine Glasses/Sustains/Slow/', ['glass1_D#4_Slow_1_Main.wav', 'glass2_F#4_Slow_1_Main.wav', 'glass3_A#4_Slow_1_Main.wav', 'glass4_D5_Slow_2_Main.wav'], dict(holdt=True, fra=.4, lengde=2.4, okt=12)),
  'psalter': ('Chordophones/Zithers/Psaltery, Bowed and Plucked/LongBow/', ['BowedPsaltery_C4_Main_LongBow_rr1.wav', 'BowedPsaltery_E4_Main_LongBow_rr2.wav', 'BowedPsaltery_G#4_Main_LongBow_rr1.wav', 'BowedPsaltery_C5_Main_LongBow_rr1.wav'], dict(holdt=True, fra=.3, lengde=2.4, okt=0)),
  'saks': ('Aerophones/Reed Aerophones/Tenor Saxophone/Non-Vibrato/', ['BrettTenor_NV_Main_C3_vl2_rr1.wav', 'BrettTenor_NV_Main_D4_vl2_rr1.wav', 'BrettTenor_NV_Main_C4_vl2_rr1.wav'], dict(holdt=True, fra=.15, lengde=1.8, okt=12)),
  'pauke': ('Membranophones/Struck Membranophones/Timpani 1/Hit/', ['Timpani1_Hit_v3_rr3_Sum.wav', 'Timpani3_Hit_v3_rr1_Sum.wav', 'Timpani5_Hit_v3_rr1_Sum.wav'], dict(lengde=1.6, ut=.6, tone='fft')),
  'paukevirvel': ('Membranophones/Struck Membranophones/Timpani 1/Roll/', ['Timpani3_Roll_v3_rr1_Sum.wav'], dict(lengde=2.2, ut=.5, tone=None)),
  'bekken': ('Idiophones/Struck Idiophones/Suspended Cymbal 1/', ['susCymb1_cresc_2s.wav', 'susCymb1_hit_f1.wav'], dict(lengde=2.6, ut=.8, tone=None, maal=-3)),
  'skarp': ('Membranophones/Struck Membranophones/Snare Drum, Rope Tension/Low/', ['RopeSnare_low_sn_Main_vl2_rr1.wav', 'RopeSnare_low_sn_Main_vl3_rr1.wav'], dict(lengde=.45, ut=.15, tone=None)),
  'stortromme': ('Membranophones/Struck Membranophones/Bass Drum 1/', ['BDrumNew_hit_v5_rr1_Sum.wav', 'BDrumNew_hit_v3_rr1_Sum.wav'], dict(lengde=.7, ut=.3, tone=None)),
  'gong': ('Idiophones/Struck Idiophones/Gong 1/', ['gong_f.wav'], dict(lengde=4.0, ut=1.6, tone=None, maal=-2)),
  'handbjelle': ('Idiophones/Struck Idiophones/Hand Bells, Nepalese/', ['HB_1.wav', 'HB_2.wav', 'HB_3.wav'], dict(lengde=2.4, ut=.9, tone=None, maal=-3)),
  'triangel': ('Idiophones/Struck Idiophones/Triangles/', ['Triangle3_Hit_v1_rr1_Mid.wav'], dict(lengde=1.4, ut=.6, tone=None, maal=-6)),
  'treblokk': ('Idiophones/Struck Idiophones/Woodblock/', ['wood_click_mp.wav'], dict(lengde=.25, ut=.08, tone=None, maal=-4)),
}

NOTER = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
def note_fra_navn(fil):
    m = list(re.finditer(r'(?<![A-Za-z])([A-G]#?)(-?\d)(?!\d)', fil))
    if not m: return None
    n, o = m[-1].group(1), int(m[-1].group(2))
    return 12 * (o + 1) + NOTER[n]

# ---------- nett ----------
def hent(url, sti, forsok=4):
    if sti.exists() and sti.stat().st_size > 256: return sti
    sti.parent.mkdir(parents=True, exist_ok=True)
    for i in range(forsok):
        r = subprocess.run(['curl', '-s', '-L', '-m', '120', '-A', 'Mozilla/5.0', '-o', str(sti), url])
        if r.returncode == 0 and sti.exists() and sti.stat().st_size > 256: return sti
        time.sleep(2 ** (i + 1))
    raise SystemExit(f'lag_lyd: fikk ikke hentet {url}')

def freesound(i, bruker):
    """Forhåndsvisningen av én Freesound-lyd, etter at lisensen er sjekket på lydens egen side."""
    side = CACHE / f'fs_{i}.html'
    hent(f'https://freesound.org/people/{urllib.parse.quote(bruker)}/sounds/{i}/', side)
    h = side.read_text(encoding='utf-8', errors='replace')
    if 'creativecommons.org/publicdomain/zero/1.0' not in h:
        side.unlink(); raise SystemExit(f'lag_lyd: {i} ({bruker}) er ikke merket CC0 på siden sin, og brukes ikke')
    m = re.search(r'data-mp3="([^"]+)"', h)
    if not m: raise SystemExit(f'lag_lyd: fant ingen forhåndsvisning for {i}')
    return hent(m.group(1).replace('-lq.mp3', '-hq.mp3'), CACHE / f'fs_{i}.mp3')

# ---------- lydbehandling ----------
def les(sti, sr):
    r = subprocess.run([ffmpeg(), '-v', 'error', '-i', str(sti), '-ac', '1', '-ar', str(sr), '-f', 'f32le', '-'], capture_output=True)
    if r.returncode: raise SystemExit(f'lag_lyd: ffmpeg klarte ikke å lese {sti}: {r.stderr.decode()[:300]}')
    return np.frombuffer(r.stdout, dtype=np.float32).copy()

def skriv(x, sr, br, sti):
    r = subprocess.run([ffmpeg(), '-v', 'error', '-y', '-f', 'f32le', '-ar', str(sr), '-ac', '1', '-i', '-', '-c:a', 'libmp3lame', '-b:a', br, str(sti)], input=x.astype(np.float32).tobytes(), capture_output=True)
    if r.returncode: raise SystemExit(f'lag_lyd: ffmpeg klarte ikke å skrive {sti}: {r.stderr.decode()[:300]}')

def klipp(x, sr, fra=0.0, lengde=None, ut=None, sloyfe=False, holdt=False):
    topp = float(np.max(np.abs(x))) or 1.0
    lyd = np.nonzero(np.abs(x) > topp * .02)[0]
    if len(lyd): x = x[max(0, lyd[0] - int(sr * .002)):]            # stillheten foran
    x = x[int(fra * sr):]
    if lengde: x = x[:int((lengde + (1.0 if sloyfe else 0)) * sr)]
    lyd = np.nonzero(np.abs(x) > topp * .004)[0]
    if len(lyd) and not sloyfe and not holdt: x = x[:lyd[-1] + int(sr * .01)]  # stillheten bak
    x = x.astype(np.float64)
    inn = min(len(x), int(sr * .002)); x[:inn] *= np.linspace(0, 1, inn)
    if sloyfe:  # halen blandes inn i starten: slutten går rett over i begynnelsen
        X = min(int(sr * 1.0), len(x) // 3); L = len(x) - X
        k = np.linspace(0, 1, X); y = x[:L].copy(); y[:X] = x[:X] * np.sqrt(k) + x[L:L + X] * np.sqrt(1 - k); return y
    if not holdt:
        u = min(len(x), int(sr * (ut if ut is not None else min(.08, len(x) / sr * .2)))); x[len(x) - u:] *= np.linspace(1, 0, u) ** 1.5
    return x

def normaliser(x, maal=-1.0):
    topp = float(np.max(np.abs(x))) or 1.0
    return x * (10 ** (maal / 20) / topp)

def tonehoyde(x, sr, fmin=35, fmax=2500):
    """Grunntonen med autokorrelasjon i en rolig bit etter anslaget, i MIDI med desimaler."""
    a = int(len(x) * .25); w = x[a:a + int(sr * .3)]
    if len(w) < sr * .06: w = x[:int(sr * .3)]
    w = (w - w.mean()) * np.hanning(len(w)); F = np.fft.rfft(w, n=2 * len(w)); ac = np.fft.irfft(F * np.conj(F))[:len(w)]; ac /= ac[0] + 1e-12
    lo, hi = max(2, int(sr / fmax)), min(len(ac) - 2, int(sr / fmin))
    i = int(np.argmax(ac[lo:hi])) + lo; y0, y1, y2 = ac[i - 1], ac[i], ac[i + 1]; i = i + .5 * (y0 - y2) / (y0 - 2 * y1 + y2 + 1e-12)
    return 69 + 12 * np.log2(sr / i / 440)

def spekter(x, sr, fmin=40, fmax=300):
    """Sterkeste topp i spekteret (for pauker), i MIDI med desimaler."""
    a = int(sr * .05); w = x[a:a + int(sr * .6)]; w = (w - w.mean()) * np.hanning(len(w)); n = 1 << 16
    S = np.abs(np.fft.rfft(w, n=n)); f = np.fft.rfftfreq(n, 1 / sr); m = (f >= fmin) & (f <= fmax)
    return float(69 + 12 * np.log2(f[m][int(np.argmax(S[m]))] / 440))

def holdesloyfe(x, sr, rot):
    """Sløyfe midt i en holdt tone: et helt antall perioder, og slutten blandes mot det som kommer før starten."""
    per = sr / (440 * 2 ** ((rot - 69) / 12)); ls = int(len(x) * .38); le = int(len(x) * .9)
    le = ls + max(1, round((le - ls) / per)) * per; le = int(round(le)); X = min(int(sr * .06), ls - 1, le - ls - 1)
    k = np.linspace(0, 1, X); x = x.copy(); x[le - X:le] = x[le - X:le] * np.sqrt(1 - k) + x[ls - X:ls] * np.sqrt(k)
    fade = min(len(x) - le, int(sr * .05))
    if fade > 0: x[le:le + fade] *= np.linspace(1, 0, fade)
    return x[:le + fade], [round(ls / sr, 4), round(le / sr, 4)]

# ---------- hovedløkka ----------
def lag(bare=None):
    UT.mkdir(parents=True, exist_ok=True); CACHE.mkdir(exist_ok=True)
    meta, nye, teller = {}, [], {}
    for navn, i, bruker, tittel in FREESOUND:
        teller[navn] = teller.get(navn, 0) + 1; fil = navn if teller[navn] == 1 else f'{navn}_{teller[navn]}'
        o = dict(OPT.get(navn, {})); amb = navn.startswith('amb_') or o.get('sloyfe')
        sr, br = (24000, '32k') if navn.startswith('amb_') else (32000, '48k')
        if bare and navn not in bare and fil not in bare and (UT / f'{fil}.mp3').exists():
            gammel = json.loads((UT / 'lyd.json').read_text(encoding='utf-8')).get(fil) if (UT / 'lyd.json').exists() else None
            if gammel: meta[fil] = gammel; continue
        kilde = freesound(i, bruker); x = les(kilde, sr)
        x = klipp(x, sr, o.get('fra', 0), o.get('lengde'), o.get('ut'), sloyfe=bool(amb))
        x = normaliser(x, o.get('maal', -12.0 if navn.startswith('amb_') else -1.0))
        skriv(x, sr, br, UT / f'{fil}.mp3')
        meta[fil] = {'gruppe': navn, 'type': 'amb' if navn.startswith('amb_') else 'sfx', 'sek': round(len(x) / sr, 3), 'sloyfe': bool(amb),
                     'kilde': 'Freesound', 'id': i, 'bruker': bruker, 'tittel': tittel, 'side': f'https://freesound.org/people/{bruker}/sounds/{i}/', 'lisens': 'CC0 1.0'}
        nye.append(fil)
    for ins, (mappe, filer, o) in INSTRUMENTER.items():
        for n, f in enumerate(filer):
            fil = f'ins_{ins}_{n + 1}'
            if bare and ins not in bare and f'ins_{ins}' not in bare and fil not in bare and (UT / f'{fil}.mp3').exists():
                gammel = json.loads((UT / 'lyd.json').read_text(encoding='utf-8')).get(fil) if (UT / 'lyd.json').exists() else None
                if gammel: meta[fil] = gammel; continue
            sr = 32000; kilde = hent(VCSL + urllib.parse.quote(mappe + f), CACHE / 'vcsl' / (mappe + f).replace('/', '__'))
            x = les(kilde, sr); x = klipp(x, sr, o.get('fra', 0), o.get('lengde'), o.get('ut'), holdt=o.get('holdt', False))
            navnrot = note_fra_navn(f); rot = None; maalt = None; merk = ''
            if o.get('tone', 'navn') == 'fft': rot = maalt = spekter(x, sr)
            elif o.get('tone', 'navn') is not None and navnrot is not None:
                rot = float(navnrot + o.get('okt', 0)); maalt = float(tonehoyde(x, sr))
                d = (maalt - rot) % 12; d = d - 12 if d > 6 else d
                if abs(d) > .7: merk = '  (målingen er ikke en oktav unna navnet; sjekk på øret)'
            sl = None
            if o.get('holdt') and rot: x, sl = holdesloyfe(x, sr, rot)
            x = normaliser(x, o.get('maal', -1.0)); skriv(x, sr, '56k', UT / f'{fil}.mp3')
            meta[fil] = {'gruppe': 'ins_' + ins, 'type': 'ins', 'sek': round(len(x) / sr, 3), 'rot': round(rot, 2) if rot is not None else None, 'sloyfe': sl,
                         'kilde': 'VCSL', 'fil': mappe + f, 'side': 'https://github.com/sgossner/VCSL', 'lisens': 'CC0 1.0'}
            print(f'  {fil:20} {f[:44]:44} navn {navnrot}  målt {maalt and round(maalt, 2)}  rot {rot and round(rot, 2)}{merk}')
            nye.append(fil)
    (UT / 'lyd.json').write_text(json.dumps(meta, ensure_ascii=False, indent=1, sort_keys=True), encoding='utf-8')
    for f in UT.glob('*.mp3'):
        if f.stem not in meta: f.unlink()  # lyder som er tatt ut av lista
    kilder(meta)
    tot = sum(f.stat().st_size for f in UT.glob('*.mp3'))
    print(f'skrev assets/lyd/: {len(meta)} lyder ({len(nye)} laget nå), {tot / 1024:.0f} kB')

def kilder(meta):
    ut = ['# Lydene i Morbidium', '', 'Laget av `tools/lag_lyd.py`. Alle lydene er fri for bruk (CC0 1.0, «No Rights Reserved»). Vi krediterer likevel alle som har spilt dem inn.', '',
          '## Lydeffekter og stemningslyder (Freesound)', '', '| Fil | Tittel | Av | Kilde |', '|---|---|---|---|']
    for k, m in sorted(meta.items()):
        if m['kilde'] == 'Freesound': ut.append(f"| `{k}.mp3` | {m['tittel'].replace('|', '/')} | {m['bruker']} | {m['side']} |")
    ut += ['', '## Instrumentprøver (Versilian Community Sample Library, VCSL)', '', 'Versilian Studios, CC0 1.0, https://github.com/sgossner/VCSL', '', '| Fil | Prøve |', '|---|---|']
    for k, m in sorted(meta.items()):
        if m['kilde'] == 'VCSL': ut.append(f"| `{k}.mp3` | {m['fil']} |")
    (UT / 'KILDER.md').write_text('\n'.join(ut) + '\n', encoding='utf-8')

if __name__ == '__main__':
    bare = set(sys.argv[sys.argv.index('--bare') + 1].split(',')) if '--bare' in sys.argv else None
    lag(bare)
