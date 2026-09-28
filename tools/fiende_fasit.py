"""Fasit for hvordan fiendene oppfører seg: samme kamp med samme frø, steg for steg, så en omskriving kan bevises å gi nøyaktig lik oppførsel.

Hver fiendetype får sin egen side med samme start: testklokka står med fast tallrekke fra tittelen, så pasienten og veien fram er
like hver gang. Så bygges en fast etasje (FAST i tools/testdeler/felles.py), fienden settes et stykke fra en pasient som ikke kan dø,
og spillet spoles sek sekunder i steg på 1/60. Hvert tiende steg noteres fiendens plass, tilstand og helse, pasientens helse og plass,
og hvor mange varsler, prosjektiler og fiender som finnes. Alt samles i et fingeravtrykk per type, og tabellene får sitt eget.

Bruk:  python3 tools/fiende_fasit.py --lagre fasit.json [--typer laerling,klokker] [--sek 20] [--fil dist/morbidium.html] [--three STI]
       python3 tools/fiende_fasit.py --mot fasit.json [...]    sammenligner og sier hvilke typer som oppfører seg annerledes, og fra hvilket steg
Uten --typer tas alle typene i ENEMIES. Avslutter med kode 1 når noe er ulikt.
"""
import argparse, asyncio, hashlib, json, os, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))

a = argparse.ArgumentParser()
a.add_argument('--lagre'); a.add_argument('--mot'); a.add_argument('--typer'); a.add_argument('--sek', type=float, default=20)
a.add_argument('--fil'); a.add_argument('--three')
args = a.parse_args()
if args.three: os.environ['MORBIDIUM_THREE'] = str(pathlib.Path(args.three).resolve())
if args.fil: os.environ['MORBIDIUM_ROT'] = str(pathlib.Path(args.fil).resolve().parent.parent)
from testdeler.felles import ny_side, klikk, URL, FAST  # noqa: E402  (etter miljøvariablene)
from playwright.async_api import async_playwright  # noqa: E402

KAMP = FAST + """(([type, sek]) => { const G = MORBIDIUM, P = G.player;
  // etasjen der typen hører hjemme (den første), ellers etasje 3
  let d = 3; for (let x = 1; x <= MAX_DEPTH; x++) if ((DEPTH_ENEMIES[x] || []).includes(type)) { d = x; break; }
  const r = fastEtasje(d, undefined, [11, 11], [[2.4, 0]]); P.hp = P.maxHp = 1e6; P.invuln = 0;
  const s = plass(r, r.cx + .5 + 2.4, r.cz + .5), e = spawnEnemy(type, s.x, s.z, false, d);
  const r6 = v => Math.round(v * 1e6) / 1e6, spor = [];
  let n = 0;
  Klokke.til(() => { n++; P.hp = Math.max(P.hp, 1e5);
    if (n % 10 === 0) spor.push([n, r6(e.x), r6(e.z), e.state, r6(e.hp), e.alive ? 1 : 0, r6(P.x), r6(P.z), r6(P.hp), G.tele.length, G.projectiles.length, G.enemies.filter(q => q.alive).length, e.type].join(' '));
    return false; }, sek);
  return { type, etasje: d, frø: G.run.seed, spor }; })"""  # testklokka står mellom kampene, så ingenting går i vanlig tid mellom dem

# tabellene: puljene per etasje, indeksen, lista over sjefer og typer, og alt som står per type
TABELLER = """() => { const f = v => typeof v === 'function' ? 'fn:' + v.toString().length : v, per = {};
              for (const t of Object.keys(ENEMIES).sort()) per[t] = JSON.stringify([Object.entries(ENEMIES[t]).filter(([k]) => k !== 'vedStart' && k !== 'grense').sort(), LINES[t], DEATH_CAUSES[t], MESTER_TITTEL[t], FIENDESTEMME[t], FIENDE_INFO[t],
                ['keep', 'retreat', 'talk', 'hold', 'hop', 'styring'].map(k => (Grotesk[k] || {})[t]), !!Grotesk.ai[t], !!(Grotesk.tick || {})[t]], (k, v) => f(v)); // grense og vedStart er nye felt, ikke med her
              return { puljer: JSON.stringify(DEPTH_ENEMIES), rekke: FIENDE_REKKE.join(' '), sjefer: SJEF_REKKE.join(' '), typer: Object.keys(ENEMIES).join(' '), per }; }"""


async def ny_start(b):
    """en ny side med samme pasient hver gang: testklokka står med fast tallrekke fra tittelen, før løpet lages. Innleggelsen velges
    blant dem som ikke starter med kamp (bølgene kommer med setTimeout i vanlig tid), og oppstartens tidtakere får gå ut"""
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await pg.goto(URL); await pg.wait_for_function("() => window.MORBIDIUM && MORBIDIUM.state === 'title'", timeout=90000)
    await pg.evaluate("() => Klokke.frys({ frø: 4242, stille: true })")
    await klikk(pg, '#tNew'); await pg.wait_for_timeout(500)
    await pg.evaluate("() => { const b = [...document.querySelectorAll('[data-awk]')], rolig = b.find(x => !['soppel', 'operasjon', 'begravelse'].includes(x.dataset.awk)) || b[0]; rolig.click(); }")
    await pg.wait_for_function("() => MORBIDIUM.state === 'play'", timeout=60000); await pg.wait_for_timeout(2000)
    return pg


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await ny_start(b)
        typer = args.typer.split(',') if args.typer else await pg.evaluate("() => Object.keys(ENEMIES).sort()")
        # tabellene: puljene per etasje (rekkefølgen avgjør hvilke fiender bølgene får), indeksen og alt som står per type
        tab = await pg.evaluate(TABELLER)
        await pg.close()
        ut = {'_tabeller': {'avtrykk': hashlib.sha1(json.dumps(tab, sort_keys=True).encode()).hexdigest()[:16], 'spor': [f'puljer {tab["puljer"]}', f'rekke {tab["rekke"]}', f'sjefer {tab["sjefer"]}', f'typer {tab["typer"]}'] + [f'{t} {v}' for t, v in sorted(tab['per'].items())]}}
        print(f'{"_tabeller":14} {ut["_tabeller"]["avtrykk"]}', flush=True)
        # hver type i sin egen side, så avtrykket ikke avhenger av hvilke typer som kom før; tre sider om gangen
        grense = asyncio.Semaphore(3)
        async def en(t):
            async with grense:
                side = await ny_start(b)
                try:
                    r = await side.evaluate(KAMP, [t, args.sek])
                    ut[t] = {'etasje': r['etasje'], 'frø': r['frø'], 'avtrykk': hashlib.sha1('\n'.join(r['spor']).encode()).hexdigest()[:16], 'spor': r['spor']}
                    print(f'{t:14} etasje {r["etasje"]}  {ut[t]["avtrykk"]}', flush=True)
                except Exception as e:
                    ut[t] = {'feil': str(e).splitlines()[0][:200]}
                    print(f'{t:14} FEIL {ut[t]["feil"]}', flush=True)
                finally:
                    await side.close()
        await asyncio.gather(*(en(t) for t in typer))
        await b.close()
    if args.lagre:
        pathlib.Path(args.lagre).write_text(json.dumps(ut, ensure_ascii=False, indent=0), encoding='utf-8')
        print(f'\nLagret {len(ut)} typer i {args.lagre}.')
        return 0
    if args.mot:
        fasit = json.loads(pathlib.Path(args.mot).read_text(encoding='utf-8'))
        ulike = []
        for t, v in ut.items():
            f = fasit.get(t)
            if not f: print(f'{t}: ikke i fasiten'); continue
            if v.get('avtrykk') == f.get('avtrykk'): continue
            if 'spor' not in v or 'spor' not in f: ulike.append(t); print(f'{t}: {v.get("feil") or f.get("feil")}'); continue
            i = next((i for i, (x, y) in enumerate(zip(v['spor'], f['spor'])) if x != y), min(len(v['spor']), len(f['spor'])))
            ulike.append(t)
            print(f'{t}: ulik fra steg {(i + 1) * 10}\n  fasit: {f["spor"][i] if i < len(f["spor"]) else "(slutt)"}\n  nå:    {v["spor"][i] if i < len(v["spor"]) else "(slutt)"}')
        print('\n' + ('Alle typene oppfører seg som i fasiten.' if not ulike else f'Ulik oppførsel: {", ".join(ulike)}.'))
        return 1 if ulike else 0
    return 0

sys.exit(asyncio.run(main()))
