"""Tar imot nye bilder fra ChatGPT i innboksen gpt-grafikk/.

Klipper arkene (skjaer_ark.py), behandler alt inn i assets/ferdig og delarkene inn i assets/deler (behandle_bilder.py),
sjekker at hvert bilde fikk en behandlet fil, og tar så originalene ut av innboksen. Originalene blir liggende i
git-historikken: commiten hver fil kom i, skrives i arkiv/grafikk-originaler.md, så den kan hentes igjen med
    git checkout <commit> -- gpt-grafikk/<fil>
Stopper uten å slette noe hvis et bilde ikke ble behandlet (ukjent navn eller feil).

Bruk:  python3 tools/ta_imot_grafikk.py            tar imot og tømmer innboksen
       python3 tools/ta_imot_grafikk.py --sjekk    viser bare hva som ligger i innboksen
Etterpå: python3 build.py, se på spillet, og commit assets/ferdig, assets/deler, arkiv/grafikk-originaler.md og
slettingen i gpt-grafikk/. GitHub Actions behandler innboksen ved hver bygging, så bilder som ikke er tatt imot
ennå, kommer likevel med på Pages.
"""
import datetime, json, pathlib, subprocess, sys

ROT = pathlib.Path(__file__).resolve().parent.parent
INN = ROT / 'gpt-grafikk'
BEH = INN / 'behandlet'
FERDIG = ROT / 'assets' / 'ferdig'
LEDGER = ROT / 'arkiv' / 'grafikk-originaler.md'
BILDE = ('.png', '.webp', '.jpg', '.jpeg')


def git(*a):
    return subprocess.run(['git', *a], cwd=ROT, capture_output=True, text=True).stdout.strip()


def innboks():
    return sorted(f for f in INN.glob('*') if f.is_file() and f.suffix.lower() in BILDE)


def nokler(navn):
    """nøklene et originalbilde gir: ark__a__b gir a og b, figur_x gir hode og kropp i tre visninger, delark gir ingen"""
    if navn.startswith('ark__'):
        return [k for k in navn[5:].split('__') if k != '_']
    if navn.startswith('figur_'):
        return [f'{d}_{navn[6:]}_{v}' for d in ('hode', 'kropp') for v in 'fbs']
    if navn.split('_')[0] in ('hoder', 'hatter', 'har', 'tilbehor', 'kropper'):
        return []
    return [navn]


def main():
    filer = innboks()
    if not filer:
        print('Innboksen er tom.'); return 0
    man = json.loads((ROT / 'assets' / 'manifest.json').read_text(encoding='utf-8'))
    # arkene som alt er klippet (behandlet/), føres også inn, med commiten de ligger i
    alle = filer + (sorted(f for f in BEH.glob('*') if f.suffix.lower() in BILDE) if BEH.exists() else [])
    kom = {f.relative_to(INN).as_posix(): (git('log', '-1', '--format=%h', '--', f.relative_to(ROT).as_posix()) or 'ikke committet') for f in alle}
    print(f'{len(filer)} bilder i innboksen:')
    for f in filer:
        print(f'  {f.name} ({kom[f.name]})')
    if len(alle) > len(filer):
        print(f'  og {len(alle) - len(filer)} ark som alt er klippet, i behandlet/')
    if '--sjekk' in sys.argv:
        return 0
    # skjaer_ark klipper arkene til enkeltbilder i innboksen og flytter arkene til behandlet/; behandle_bilder tar resten
    for skript in ('skjaer_ark.py', 'behandle_bilder.py'):
        r = subprocess.run([sys.executable, str(ROT / 'tools' / skript)], cwd=ROT, capture_output=True, text=True)
        print(r.stdout.strip().splitlines()[-1] if r.stdout.strip() else skript)
        if r.returncode:
            print(r.stdout + r.stderr); print('Stoppet: ' + skript + ' feilet. Ingenting er slettet.'); return 1
        if 'UKJENT' in r.stdout or 'FEIL' in r.stdout:
            print('\n'.join(l for l in r.stdout.splitlines() if 'UKJENT' in l or 'FEIL' in l))
            print('Stoppet: noen bilder ble ikke behandlet (ukjent navn eller feil). Ingenting er slettet.'); return 1
    mangler = [k for f in filer for k in nokler(f.stem) if k in man and not any((FERDIG / f'{k}{e}').exists() for e in ('.png', '.webp'))]
    if mangler:
        print('Stoppet: disse fikk ingen behandlet fil: ' + ', '.join(mangler) + '. Ingenting er slettet.'); return 1
    # tøm innboksen: originalene (git rm når de er committet), bitene arkene ble klippet til, og arkene i behandlet/
    sporet = set(git('ls-files', 'gpt-grafikk').splitlines())
    for f in innboks() + (sorted(BEH.glob('*')) if BEH.exists() else []):
        rel = f.relative_to(ROT).as_posix()
        if rel in sporet: git('rm', '-q', '--', rel)
        elif f.exists(): f.unlink()
    if BEH.exists() and not any(BEH.iterdir()): BEH.rmdir()
    LEDGER.parent.mkdir(exist_ok=True)
    hode = '' if LEDGER.exists() else ('# Originalbildene fra ChatGPT\n\nOriginalene tas ut av gpt-grafikk/ når de er behandlet (tools/ta_imot_grafikk.py). De ligger i git-historikken; '
                                       'hent en fil med `git checkout <commit> -- gpt-grafikk/<fil>`.\n')
    linjer = [f'\n## {datetime.date.today().isoformat()}'] + [f'- {n}: {c}' for n, c in kom.items()]
    with LEDGER.open('a', encoding='utf-8') as u:
        u.write(hode + '\n'.join(linjer) + '\n')
    print(f'Tok imot {len(filer)} bilder. Innboksen er tømt, og commitene står i {LEDGER.relative_to(ROT)}.')
    print('Neste: python3 build.py, se på spillet, og commit assets/ferdig, assets/deler, arkiv/grafikk-originaler.md og gpt-grafikk/.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
