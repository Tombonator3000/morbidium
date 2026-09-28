"""Holder dokumentene agentene leser i starten av hver økt korte.

- log.md: de nyeste oppføringene blir liggende (høyst LOGG_MAKS byte). Eldre oppføringer flyttes til
  logg/ÅÅÅÅ-MM.md etter måneden i overskriften (## ÅÅÅÅ-MM-DD TT:MM Tittel), i samme rekkefølge som de sto.
- todo.md: avkryssede punkter (- [x]) flyttes til arkiv/ferdig-ÅÅÅÅ-MM.md under samme overskrift.
  En overskrift uten åpne punkter igjen flyttes med innledningen sin.
- memory.md: bare en sjekk. Over MINNE_MAKS byte gir en advarsel: detaljer om et system hører hjemme i
  dokumentasjon/systemer.md.

Bruk:  python3 tools/rydd_dokumenter.py            rydder og skriver hva som ble flyttet
       python3 tools/rydd_dokumenter.py --sjekk    bare sjekker (avslutter med kode 1 hvis noe bør ryddes)
"""
import datetime, pathlib, re, sys

ROT = pathlib.Path(__file__).resolve().parent.parent
LOGG_MAKS = 20_000
MINNE_MAKS = 8_000
OPPF = re.compile(r'(?m)^(?=## \d{4}-\d{2}-\d{2} )')


def les(p):
    return p.read_text(encoding='utf-8') if p.exists() else ''


def logg_deler(tekst):
    deler = OPPF.split(tekst)
    return deler[0], deler[1:]


def rydd_logg(sjekk):
    p = ROT / 'log.md'
    hode, oppf = logg_deler(les(p))
    storrelse = lambda xs: sum(len(x.encode('utf-8')) for x in xs)
    flytt = []
    while len(oppf) > 1 and storrelse(oppf) > LOGG_MAKS:
        flytt.append(oppf.pop(0))
    if not flytt:
        return 0
    if sjekk:
        print(f'log.md: {len(flytt)} eldre oppføringer bør flyttes til logg/')
        return len(flytt)
    per_maaned = {}
    for o in flytt:
        per_maaned.setdefault(o[3:10], []).append(o)
    (ROT / 'logg').mkdir(exist_ok=True)
    for mnd, xs in per_maaned.items():
        q = ROT / 'logg' / f'{mnd}.md'
        gammel = les(q) or f'# Morbidium: arbeidslogg {mnd}\n\nEldre oppføringer fra log.md, i samme rekkefølge som de ble skrevet. Alle tidspunkt er UTC.\n\n'
        if not gammel.endswith('\n\n'):
            gammel = gammel.rstrip('\n') + '\n\n'
        q.write_text(gammel + ''.join(x if x.endswith('\n') else x + '\n' for x in xs).rstrip('\n') + '\n', encoding='utf-8')
        print(f'log.md: {len(xs)} oppføringer flyttet til logg/{mnd}.md')
    p.write_text(hode + ''.join(oppf), encoding='utf-8')
    return len(flytt)


def rydd_todo(sjekk):
    p = ROT / 'todo.md'
    linjer = les(p).splitlines()
    if not linjer:
        return 0
    # tittel og innledning før første ##, så seksjonene
    start = next((i for i, l in enumerate(linjer) if l.startswith('## ')), len(linjer))
    hode, seksjoner, cur = linjer[:start], [], None
    for l in linjer[start:]:
        if l.startswith('## '):
            cur = {'tittel': l, 'linjer': []}; seksjoner.append(cur)
        else:
            cur['linjer'].append(l)
    beholdt, flyttet, n = [], [], 0
    for s in seksjoner:
        ferdig = [l for l in s['linjer'] if l.lstrip().startswith('- [x]')]
        aapne = [l for l in s['linjer'] if l.lstrip().startswith('- [ ]')]
        n += len(ferdig)
        if aapne or not ferdig:
            # seksjoner med åpne punkter, og notater uten avkrysning, blir stående (uten de ferdige punktene)
            beholdt.append([s['tittel']] + [l for l in s['linjer'] if not l.lstrip().startswith('- [x]')])
            if ferdig:
                flyttet.append([s['tittel']] + ferdig)
        else:
            # bare ferdige punkter igjen: hele seksjonen med innledningen flyttes
            flyttet.append([s['tittel']] + [l for l in s['linjer'] if l.strip()])
    if not n:
        return 0
    if sjekk:
        print(f'todo.md: {n} ferdige punkter eller tomme seksjoner bør flyttes til arkiv/')
        return n
    mnd = datetime.date.today().strftime('%Y-%m')
    (ROT / 'arkiv').mkdir(exist_ok=True)
    q = ROT / 'arkiv' / f'ferdig-{mnd}.md'
    gammel = les(q) or f'# Morbidium: ferdige oppgaver {mnd}\n\nFlyttet fra todo.md av tools/rydd_dokumenter.py. Overskriftene er de samme som i todo.md da punktene ble krysset av.\n'
    blokk = '\n'.join('\n'.join(s).rstrip() + '\n' for s in flyttet)
    q.write_text(gammel.rstrip('\n') + '\n\n' + blokk, encoding='utf-8')
    tekst = '\n'.join(hode).rstrip() + '\n\n' + '\n\n'.join('\n'.join(s).strip('\n') for s in beholdt) + '\n'
    p.write_text(re.sub(r'\n{3,}', '\n\n', tekst), encoding='utf-8')
    print(f'todo.md: {n} ferdige punkter flyttet til arkiv/ferdig-{mnd}.md')
    return n


def sjekk_minne():
    b = len(les(ROT / 'memory.md').encode('utf-8'))
    if b > MINNE_MAKS:
        print(f'memory.md er {b} byte (grensen er {MINNE_MAKS}). Flytt detaljer om systemene til dokumentasjon/systemer.md.')
        return 1
    return 0


if __name__ == '__main__':
    sjekk = '--sjekk' in sys.argv
    n = rydd_logg(sjekk) + rydd_todo(sjekk) + sjekk_minne()
    if not n:
        print('Dokumentene er korte nok.')
    sys.exit(1 if sjekk and n else 0)
