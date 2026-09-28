"""Tester enkeltfunksjoner i Morbidium i headless Chromium: lagring og menyene, telefon og TV, fiendene, sjefene, rommene,
figurene, blod og treff, lyden, historien, grafikken og teknikken. Testdelene ligger i tools/testdeler/, én fil per system
og én funksjon per del. Hver del åpner sine egne sider, så delene kan kjøres hver for seg og i hvilken som helst rekkefølge.

Bruk:  python3 tools/test_ekstra.py [--three STI]      alle delene etter hverandre
       python3 tools/test_ekstra.py --del 59,60        bare disse delene
       python3 tools/test_ekstra.py --system fiender   alle delene i tools/testdeler/fiender.py
       python3 tools/test_ekstra.py -j 3               fordelt på tre nettlesere samtidig (programvaregrafikken holder en kjerne
                                                       i arbeid per nettleser, så ikke flere enn maskinen har kjerner)
       python3 tools/test_ekstra.py --liste            delene og systemene
       --rot STI    tester STI/dist/morbidium.html i stedet for bygget i dette repoet
       --frist SEK  en del som går lenger (standard 1800 sekunder), stoppes og regnes som feilet
Skjermbilder havner i /tmp/e_*.png. En del som krasjer, stopper ikke de andre: sidene den lot stå, lukkes, og den regnes som
feilet. Skriptet avslutter med kode 1 hvis noe feiler.
"""
import argparse, asyncio, importlib, inspect, json, os, pathlib, sys, time, traceback

HER = pathlib.Path(__file__).resolve().parent
SYSTEMER = ['lagring_og_menyer', 'mobil_og_tv', 'fiender', 'sjefer', 'rom_og_etasjer', 'ting_og_oppskrifter', 'figurer',
            'blod_og_treff', 'lyd_og_musikk', 'historie', 'grafikk', 'teknikk']
NETTLESER = ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']


def argumenter():
    a = argparse.ArgumentParser(description='Tester enkeltfunksjoner i Morbidium (se toppen av fila).')
    a.add_argument('--three', help='lokal three.min.js, når nettleseren ikke når cdnjs')
    a.add_argument('--rot', help='repoet med bygget som testes (dist/morbidium.html)')
    a.add_argument('--del', dest='deler', help='delene som skal kjøres, med komma mellom')
    a.add_argument('--system', help='kjør alle delene i tools/testdeler/SYSTEM.py (flere med komma)')
    a.add_argument('-j', type=int, default=1, help='antall nettlesere samtidig')
    a.add_argument('--frist', type=float, default=1800, help='sekunder en del får før den stoppes')
    a.add_argument('--liste', action='store_true', help='vis delene og systemene')
    a.add_argument('--arbeider', help=argparse.SUPPRESS)  # brukes av -j: skriv resultatet som JSON til slutt
    return a.parse_args()


def last_deler():
    """{nr: (system, funksjon, tittel, linjer)} for alle delene"""
    sys.path.insert(0, str(HER))
    deler = {}
    for s in SYSTEMER:
        m = importlib.import_module('testdeler.' + s)
        for nr, f in m.DELER.items():
            kilde = inspect.getsourcelines(f)[0]
            tittel = next((l.strip()[2:].split(') ', 1)[-1] for l in kilde if l.strip().startswith('# ')), '')
            deler[nr] = (s, f, tittel, len(kilde))
    return deler


def velg(args, deler):
    if args.deler:
        nrs = [int(x) for x in args.deler.replace(' ', '').split(',') if x]
        ukjent = [n for n in nrs if n not in deler]
        if ukjent: sys.exit('Finner ikke del ' + ', '.join(map(str, ukjent)) + '. --liste viser delene.')
        return nrs
    if args.system:
        sy = args.system.split(',')
        ukjent = [s for s in sy if s not in SYSTEMER]
        if ukjent: sys.exit('Ukjent system: ' + ', '.join(ukjent) + '. Systemene er ' + ', '.join(SYSTEMER) + '.')
        return sorted(n for n, d in deler.items() if d[0] in sy)
    return sorted(deler)


async def kjor(nrs, deler, frist):
    """kjører delene etter hverandre i én nettleser; gir (feil, tider)"""
    from playwright.async_api import async_playwright
    from testdeler import felles
    tider = {}
    async with async_playwright() as p:
        b = await p.chromium.launch(args=NETTLESER)
        for nr in nrs:
            s, f, tittel, _ = deler[nr]
            felles.NA['del'] = nr
            print(f'\n== del {nr} ({s}): {tittel[:110]}', flush=True)
            t0 = time.time()
            try:
                await asyncio.wait_for(f(b), frist)
            except Exception as e:
                traceback.print_exc(file=sys.stdout)
                grunn = f'stoppet etter {frist:.0f} s' if isinstance(e, asyncio.TimeoutError) else (type(e).__name__ + ': ' + (str(e).splitlines() or [''])[0][:160])
                print('FEIL  delen krasjet: ' + grunn, flush=True)
                felles.feil.append((nr, 'delen krasjet: ' + grunn))
            tider[nr] = round(time.time() - t0)
            # sider delen lot stå åpne, lukkes, så de ikke tar maskinkraft fra de neste delene
            if b.is_connected():
                for c in list(b.contexts):
                    try: await c.close()
                    except Exception: pass
            else:
                print('Nettleseren døde, starter en ny.', flush=True)
                b = await p.chromium.launch(args=NETTLESER)
            print(f'-- del {nr}: {tider[nr]} s', flush=True)
        await b.close()
    return felles.feil, tider


def fordel(nrs, deler, n):
    """fordeler delene på n grupper med omtrent like mye arbeid (antall linjer i delen er målet)"""
    grupper = [[] for _ in range(n)]; vekt = [0] * n
    for nr in sorted(nrs, key=lambda x: -deler[x][3]):
        k = vekt.index(min(vekt)); grupper[k].append(nr); vekt[k] += deler[nr][3]
    return [sorted(g) for g in grupper if g]


async def parallelt(nrs, deler, args):
    grupper = fordel(nrs, deler, args.j)
    videre = sum(([f'--{k}', str(v)] for k, v in (('three', args.three), ('rot', args.rot), ('frist', args.frist)) if v), [])
    feil, tider = [], {}

    async def arbeider(k, g):
        print(f'[{k}] deler {",".join(map(str, g))}', flush=True)
        pr = await asyncio.create_subprocess_exec(sys.executable, str(pathlib.Path(__file__).resolve()), '--del', ','.join(map(str, g)),
                                                  '--arbeider', str(k), *videre, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.STDOUT)
        res = None
        async for rå in pr.stdout:
            linje = rå.decode('utf-8', 'replace').rstrip('\n')
            if linje.startswith('RESULTAT '): res = json.loads(linje[9:]); continue
            print(f'[{k}] {linje}', flush=True)
        await pr.wait()
        if res is None:
            feil.extend((nr, f'arbeider {k} døde uten resultat (kode {pr.returncode})') for nr in g)
        else:
            feil.extend(tuple(x) for x in res['feil']); tider.update({int(n): t for n, t in res['tider'].items()})

    await asyncio.gather(*(arbeider(k + 1, g) for k, g in enumerate(grupper)))
    return feil, tider


def main():
    args = argumenter()
    if args.three: os.environ['MORBIDIUM_THREE'] = str(pathlib.Path(args.three).resolve())
    if args.rot: os.environ['MORBIDIUM_ROT'] = str(pathlib.Path(args.rot).resolve())
    deler = last_deler()
    if args.liste:
        for s in SYSTEMER:
            print(s + ':')
            for nr in sorted(n for n, d in deler.items() if d[0] == s): print(f'  {nr:>3}  {deler[nr][2][:100]}')
        return 0
    nrs = velg(args, deler)
    t0 = time.time()
    feil, tider = asyncio.run(parallelt(nrs, deler, args) if args.j > 1 else kjor(nrs, deler, args.frist))
    if args.arbeider:
        print('RESULTAT ' + json.dumps({'feil': feil, 'tider': tider}, ensure_ascii=False), flush=True)
        return 1 if feil else 0
    tregest = sorted(tider.items(), key=lambda x: -x[1])[:8]
    print(f'\n{len(nrs)} deler på {time.time() - t0:.0f} s. Tregest: ' + ', '.join(f'{n} ({t} s)' for n, t in tregest))
    if feil:
        print('\nFeilet:')
        for nr, navn in feil: print(f'  del {nr}: {navn}')
    print('\n' + ('Alt gikk bra.' if not feil else f'Feilet: {len(feil)} sjekker i {len({n for n, _ in feil})} deler.'))
    return 1 if feil else 0


if __name__ == '__main__':
    sys.exit(main())
