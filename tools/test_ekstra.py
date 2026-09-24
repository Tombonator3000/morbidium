"""Tester enkeltfunksjoner i Morbidium i headless Chromium: lagring og fortsettelse,
berøringsoppsett på stående mobil, journalen og nyere systemer.

Bruk:  python3 tools/test_ekstra.py [--three STI]   (samme valg som test_spill.py)
Skjermbilder havner i /tmp/e_*.png. Skriptet avslutter med kode 1 hvis noe feiler.
"""
import pathlib, os, sys, asyncio
from playwright.async_api import async_playwright
THREE = os.environ.get('MORBIDIUM_THREE') or (sys.argv[sys.argv.index('--three') + 1] if '--three' in sys.argv else None)
URL = (pathlib.Path(__file__).resolve().parent.parent / 'dist' / 'morbidium.html').as_uri()
feil = []

def sjekk(navn, ok, info=''):
    print(('OK    ' if ok else 'FEIL  ') + navn + (': ' + str(info) if info != '' else ''))
    if not ok: feil.append(navn)

async def ny_side(b, **kw):
    pg = await b.new_page(**kw)
    if THREE:
        await pg.route('**/three.min.js', lambda r: r.fulfill(path=THREE, content_type='application/javascript'))
        await pg.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
    pg.errs = []
    pg.on('pageerror', lambda e: pg.errs.append('PAGEERROR: ' + str(e)))
    pg.on('console', lambda m: pg.errs.append(m.type + ': ' + m.text) if m.type == 'error' else None)
    return pg

async def start_lop(pg, awk=None):
    await pg.goto(URL); await pg.wait_for_timeout(2500)
    await pg.click('#tNew'); await pg.wait_for_timeout(500)
    sel = f'[data-awk="{awk}"]' if awk else '[data-awk]'
    if awk and not await pg.query_selector(sel): sel = '[data-awk]'
    await pg.click(sel); await pg.wait_for_timeout(1500)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])

        # 1) lagring og fortsettelse
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await pg.goto(URL); await pg.wait_for_timeout(2000)
        await pg.evaluate("() => localStorage.clear()")
        await start_lop(pg)
        await pg.evaluate("""() => { const G = MORBIDIUM; Items.give('bart'); Items.give('magnet'); G.player.teeth = 77; G.player.weaponLvl = 2; descend(); }""")
        await pg.wait_for_timeout(1500)
        for_ = await pg.evaluate("() => ({ d: MORBIDIUM.depth, items: MORBIDIUM.run.items.slice(), teeth: MORBIDIUM.player.teeth, name: MORBIDIUM.run.patient.name })")
        await pg.evaluate("() => showTitle()"); await pg.wait_for_timeout(800)
        har = await pg.query_selector('#tCont')
        sjekk('Fortsett-knapp på tittelen', har is not None)
        if har:
            await pg.click('#tCont'); await pg.wait_for_timeout(1500)
            etter = await pg.evaluate("() => ({ d: MORBIDIUM.depth, items: MORBIDIUM.run.items.slice(), teeth: MORBIDIUM.player.teeth, name: MORBIDIUM.run.patient.name, lvl: MORBIDIUM.player.weaponLvl, state: MORBIDIUM.state })")
            sjekk('fortsatt løp har samme etasje, tenner og kuriositeter', etter['d'] == for_['d'] and etter['items'] == for_['items'] and etter['teeth'] == for_['teeth'] and etter['name'] == for_['name'] and etter['lvl'] == 2 and etter['state'] == 'play', etter)
        await pg.evaluate("() => { const P = MORBIDIUM.player; P.invuln = 0; P.iframe = 0; hurt(P, 9999, { type: 'kultist' }); }")
        await pg.wait_for_timeout(2400)
        sjekk('død sletter det lagrede løpet', await pg.evaluate("() => !localStorage.getItem('morbidium_run_v1')"))
        await pg.screenshot(path='/tmp/e_1dod.png')
        sjekk('ingen konsollfeil (lagring)', not pg.errs, pg.errs[:5])
        await pg.close()

        # 2) stående mobil med berøring
        ctx = await b.new_context(viewport={'width': 390, 'height': 844}, has_touch=True, is_mobile=True, device_scale_factor=2)
        pg = await ctx.new_page()
        if THREE:
            await pg.route('**/three.min.js', lambda r: r.fulfill(path=THREE, content_type='application/javascript'))
            await pg.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
        pg.errs = []
        pg.on('pageerror', lambda e: pg.errs.append('PAGEERROR: ' + str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(2500)
        await pg.evaluate("() => localStorage.clear()")
        await pg.tap('#tNew'); await pg.wait_for_timeout(500); await pg.tap('[data-awk]'); await pg.wait_for_timeout(1500)
        await pg.evaluate("() => { MORBIDIUM.run.slots[0] || giveCard('due', true); }")
        await pg.wait_for_timeout(400)
        await pg.screenshot(path='/tmp/e_2mobil.png')
        dekning = await pg.evaluate("""() => { let top = innerHeight; for (const el of document.querySelectorAll('#stick, #tbtns button, #cards .acard')) { const r = el.getBoundingClientRect(); if (r.width) top = Math.min(top, r.top); } return 1 - top / innerHeight; }""")
        sjekk('berøringsknappene dekker under 40 % av høyden', dekning < .4, round(dekning, 2))
        # trykk på første evnekort
        cd0 = await pg.evaluate("() => MORBIDIUM.player.cds.slice()")
        idx = await pg.evaluate("() => MORBIDIUM.run.slots.findIndex(Boolean)")
        await pg.tap(f'#ac{idx}'); await pg.wait_for_timeout(200)
        cd1 = await pg.evaluate("() => MORBIDIUM.player.cds.slice()")
        sjekk('evnekortet kan trykkes på som knapp', cd1[idx] > cd0[idx], cd1)
        await pg.evaluate("() => openJournal()"); await pg.wait_for_timeout(900)
        await pg.screenshot(path='/tmp/e_3journal_mobil.png', full_page=True)
        sjekk('ingen konsollfeil (mobil)', not pg.errs, pg.errs[:5])
        await ctx.close()

        # 3) journalen på stor skjerm
        pg = await ny_side(b, viewport={'width': 1280, 'height': 800})
        await start_lop(pg)
        await pg.evaluate("() => { for (const id of ['due','lys','stempel','hydro']) if (!owned(id)) giveCard(id, true); openJournal(); }")
        await pg.wait_for_timeout(1200)
        await pg.screenshot(path='/tmp/e_4journal.png')
        sjekk('ingen konsollfeil (journal)', not pg.errs, pg.errs[:5])
        await pg.close()

        # 5) de nye fiendene i aksjon
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg)
        await pg.evaluate("""() => { const G = MORBIDIUM; G.run.seed = 5; startFloor(3, false); G.rooms.forEach(s => s.cleared = true); const P = G.player; P.hp = P.maxHp = 400;
          const r = G.F.rooms.filter(r => r.role === 'combat').sort((a, b) => b.w * b.h - a.w * a.h)[0]; const c = freeSpot(r.x + r.w / 2, r.z + r.h / 2, 3); P.x = c.x; P.z = c.z; R.snapCamera(P.x, P.z);
          const types = ['tvang', 'byrakrat', 'narkose', 'rotte', 'oyeblomst']; types.forEach((t, i) => { const a = i / types.length * Math.PI * 2, s = freeSpot(P.x + Math.sin(a) * 3.2, P.z + Math.cos(a) * 3.2, 2); spawnEnemy(t, s.x, s.z, false, 3); }); }""")
        await pg.wait_for_timeout(1400); await pg.screenshot(path='/tmp/e_8fiender.png')
        await pg.wait_for_timeout(5000); await pg.screenshot(path='/tmp/e_9fiender_kamp.png')
        st = await pg.evaluate("() => ({ n: MORBIDIUM.enemies.filter(e => e.alive).length, types: [...new Set(MORBIDIUM.enemies.map(e => e.type))], hp: Math.round(MORBIDIUM.player.hp), gas: MORBIDIUM.zones.filter(z => z.kind === 'gas').length })")
        sjekk('nye fiender lever og rotter kom i flokk', st['n'] >= 7 and len(st['types']) == 5, st)
        sjekk('fiendene gjorde skade', st['hp'] < 400, st['hp'])
        await pg.evaluate("() => { for (const e of MORBIDIUM.enemies) if (e.alive) hurt(e, 9999, { from: 'player' }); }")
        await pg.wait_for_timeout(800)
        sjekk('ingen konsollfeil (nye fiender)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 6) spesialrom: sprukken vegg, forbannet rom, blodoffer
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg)
        funnet = await pg.evaluate("""() => { const G = MORBIDIUM; for (let s = 1; s < 400; s++) { const F = generateFloor(s * 7919, 2, {}); if (F.rooms.some(r => r.role === 'cursed') && F.rooms.some(r => r.role === 'offer')) { G.run.seed = s * 7919 - 2 * 7919; startFloor(2, false); return { seed: s, roles: G.F.rooms.map(r => r.role) }; } } return null; }""")
        sjekk('fant en etasje med forbannet rom og blodoffer', funnet is not None and 'cursed' in funnet['roles'] and 'offer' in funnet['roles'] and 'secret' in funnet['roles'], funnet)
        # a) hemmelig rom: stå innenfor den sprukne veggen og slå tungt
        r = await pg.evaluate("""() => { const G = MORBIDIUM, F = G.F, P = G.player; G.rooms.forEach(s => s.cleared = true); const c = Spesial.cracks[Math.floor(Spesial.cracks.length / 2)]; const par = F.rooms.find(r => r.role === 'secret'); const parent = F.rooms[par.parent];
            const tx = Math.floor(c.x), tz = Math.floor(c.z); let ix = tx, iz = tz; if (tz === parent.z - 1) iz = tz + 1; else if (tz === parent.z + parent.h) iz = tz - 1; else if (tx === parent.x - 1) ix = tx + 1; else ix = tx - 1;
            P.x = ix + .5; P.z = iz + .5; P.face = Math.atan2(c.x - P.x, c.z - P.z); R.snapCamera(P.x, P.z); return { hp: c.hp, secretReach: false }; }""")
        await pg.wait_for_timeout(600); await pg.screenshot(path='/tmp/e_10sprekk.png')
        await pg.evaluate("() => { const P = MORBIDIUM.player; const c = Spesial.cracks[0]; startSwing(true, 1); }")
        await pg.wait_for_timeout(900)
        brutt = await pg.evaluate("() => ({ broken: Spesial.cracks.every(c => c.broken), block: Spesial.cracks.map(c => MORBIDIUM.F.block[c.i]), secrets: MORBIDIUM.run.secrets || 0 })")
        sjekk('tungt slag knuser den sprukne veggen', brutt['broken'] and brutt['secrets'] == 1 and not any(brutt['block']), brutt)
        # b) forbannet rom: gå inn, ta glasset, overlev bakholdet
        cur = await pg.evaluate("""() => { const G = MORBIDIUM, F = G.F, P = G.player; P.hp = P.maxHp; const r = F.rooms.find(r => r.role === 'cursed'); const h0 = P.hp; const d = r.doors[0]; P.x = d % F.W + .5; P.z = ((d / F.W) | 0) + .5; return { h0, id: r.id }; }""")
        await pg.evaluate("""(id) => { const G = MORBIDIUM, r = G.F.rooms[id], P = G.player; P.x = r.x + r.w / 2; P.z = r.z + r.h / 2 + 1.5; R.snapCamera(P.x, P.z); }""", cur['id'])
        await pg.wait_for_timeout(700); await pg.screenshot(path='/tmp/e_11forbannet.png')
        etter = await pg.evaluate("() => MORBIDIUM.player.hp")
        sjekk('tornene tar et hjerte ved inngangen', cur['h0'] - etter >= 9.9, (cur['h0'], etter))
        await pg.evaluate("() => { const pd = Items.pedestals.find(p => p.cursed); Items.take(pd); }")
        await pg.wait_for_timeout(2600)
        kamp = await pg.evaluate("() => ({ combat: !!MORBIDIUM.combat, n: MORBIDIUM.enemies.filter(e => e.alive).length, items: MORBIDIUM.run.items.length })")
        sjekk('kuriositeten utløser bakhold', kamp['combat'] and kamp['n'] > 0 and kamp['items'] == 1, kamp)
        await pg.screenshot(path='/tmp/e_12bakhold.png')
        for _ in range(3):
            await pg.evaluate("() => { for (const e of MORBIDIUM.enemies) if (e.alive) hurt(e, 9999, { from: 'player' }); }"); await pg.wait_for_timeout(1700)
        sjekk('bakholdet kan ryddes', await pg.evaluate("() => !MORBIDIUM.combat"))
        # c) blodoffer
        await pg.evaluate("""() => { const G = MORBIDIUM, P = G.player; P.teeth = 60; P.hp = P.maxHp; const o = G.props.find(o => o.kind === 'offeralter'); P.x = o.x; P.z = o.z + 1.6; R.snapCamera(P.x, P.z); Spesial.offer(o); }""")
        await pg.wait_for_timeout(700); await pg.screenshot(path='/tmp/e_13offer.png')
        await pg.click('[data-ch="0"]'); await pg.wait_for_timeout(600)
        sjekk('alteret tar imot én gave', await pg.evaluate("() => MORBIDIUM.props.find(o => o.kind === 'offeralter').used === true && MORBIDIUM.state === 'play'"))
        sjekk('ingen konsollfeil (spesialrom)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 7) apparater og lommerusk
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg)
        await pg.evaluate("""() => { const G = MORBIDIUM, P = G.player; G.rooms.forEach(s => s.cleared = true); Aktiv.give('defib'); Lomme.give('frosk');
          for (let i = 0; i < 3; i++) { const s = freeSpot(P.x + Math.sin(i * 2) * 2.2, P.z + Math.cos(i * 2) * 2.2, 2); const e = spawnEnemy('pleier', s.x, s.z, false, 1); e.cd = 99; } }""")
        await pg.wait_for_timeout(900)
        hp0 = await pg.evaluate("() => MORBIDIUM.enemies.filter(e => e.alive).map(e => e.hp)")
        await pg.keyboard.press('KeyV'); await pg.wait_for_timeout(300)
        await pg.screenshot(path='/tmp/e_14defib.png')
        st = await pg.evaluate("() => ({ hp: MORBIDIUM.enemies.filter(e => e.alive).map(e => e.hp), charge: MORBIDIUM.run.akt.charge })")
        sjekk('defibrillatoren skader og tømmer ladningen', st['charge'] == 0 and (len(st['hp']) < len(hp0) or all(a < b for a, b in zip(st['hp'], hp0))), st)
        await pg.evaluate("() => { const G = MORBIDIUM, r = G.F.rooms.find(r => r.role === 'combat'); G.combat = { r, wave: 99, t: 0 }; finishCombat(); }")
        sjekk('ett streik per ryddet rom', await pg.evaluate("() => MORBIDIUM.run.akt.charge") == 1)
        await pg.evaluate("() => { const P = MORBIDIUM.player; const pd = Aktiv.spawnJar(P.x + 1, P.z, 'stoppeklokke'); Items.take(pd); }")
        byt = await pg.evaluate("() => ({ id: MORBIDIUM.run.akt.id, gammel: Items.pedestals.some(p => p.akt === 'defib' && !p.taken) })")
        sjekk('nytt apparat bytter ut det gamle, som blir stående i et glass', byt['id'] == 'stoppeklokke' and byt['gammel'], byt)
        await pg.evaluate("() => { const P = MORBIDIUM.player; P.invuln = 0; P.iframe = 0; hurt(P, 9999, { type: 'kultist' }); }")
        await pg.wait_for_timeout(300)
        sjekk('frosken tar det dødelige slaget', await pg.evaluate("() => MORBIDIUM.player.alive && MORBIDIUM.player.hp === 1 && MORBIDIUM.run.froskBrukt"))
        await pg.evaluate("() => { const P = MORBIDIUM.player; P.hp = P.maxHp; dropPickup(P.x + .5, P.z, 'trinket', 'hestesko'); }")
        await pg.wait_for_timeout(900)
        await pg.evaluate("() => { const k = MORBIDIUM.pickups.find(k => k.kind === 'trinket'); takePickupTest(k); }")
        sjekk('lommerusk byttes, og det gamle havner på gulvet', await pg.evaluate("() => MORBIDIUM.run.trinket === 'hestesko' && MORBIDIUM.pickups.some(k => k.kind === 'trinket' && k.val === 'frosk')"))
        await pg.screenshot(path='/tmp/e_15hud.png')
        await pg.evaluate("() => { saveRun(false); showTitle(); }"); await pg.wait_for_timeout(600); await pg.click('#tCont'); await pg.wait_for_timeout(1400)
        sjekk('apparat og lommerusk overlever lagring', await pg.evaluate("() => MORBIDIUM.run.akt && MORBIDIUM.run.akt.id === 'stoppeklokke' && MORBIDIUM.run.trinket === 'hestesko'"))
        await pg.evaluate("() => openJournal('kuriositeter')"); await pg.wait_for_timeout(700); await pg.screenshot(path='/tmp/e_16journal_utstyr.png')
        sjekk('ingen konsollfeil (utstyr)', not pg.errs, pg.errs[:6])
        await pg.close()

        # 4) alle fire sjefer med alle angrep, og rommene i Isolat og arkiv
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg)
        for depth in [1, 2, 3, 4]:
            info = await pg.evaluate("""(d) => { const G = MORBIDIUM; G.player.hp = G.player.maxHp = 9999; startFloor(d, false); const r = G.F.rooms[G.F.bossId]; G.player.x = r.x + r.w / 2; G.player.z = r.z + r.h - 2; return { theme: G.th.name, tpl: G.F.rooms.map(r => r.template) }; }""", depth)
            if depth == 3:
                sjekk('Isolat og arkiv har egne rom', 'isolat' in info['tpl'] or 'kartotek' in info['tpl'], info['tpl'])
                await pg.evaluate("""() => { const G = MORBIDIUM, r = G.F.rooms.find(r => r.template === 'kartotek') || G.F.rooms.find(r => r.template === 'isolat'); if (r) { G.player.x = r.x + r.w / 2; G.player.z = r.z + r.h / 2; G.rooms[r.id].cleared = true; } }""")
                await pg.wait_for_timeout(1200); await pg.screenshot(path='/tmp/e_5arkiv.png')
                await pg.evaluate("""() => { const G = MORBIDIUM, r = G.F.rooms.find(r => r.template === 'isolat'); if (r) { G.player.x = r.x + r.w / 2; G.player.z = r.z + r.h / 2; G.rooms[r.id].cleared = true; } }""")
                await pg.wait_for_timeout(1000); await pg.screenshot(path='/tmp/e_6isolat.png')
                await pg.evaluate("""() => { const G = MORBIDIUM, r = G.F.rooms[G.F.bossId]; G.player.x = r.x + r.w / 2; G.player.z = r.z + r.h - 2; }""")
            await pg.wait_for_timeout(3500)
            bnavn = await pg.evaluate("() => MORBIDIUM.boss && MORBIDIUM.boss.type")
            sjekk(f'sjef i etasje {depth}', bnavn is not None, bnavn)
            kinds = await pg.evaluate("() => MORBIDIUM.boss ? [...new Set(MORBIDIUM.boss.B0.attacks)] : []")
            for k in kinds:
                await pg.evaluate("(k) => { const B = MORBIDIUM.boss, P = MORBIDIUM.player; if (!B) return; B.state = 'chase'; B.cd = 99; P.hp = P.maxHp; bossAttackTest(B, k); }", k)
                await pg.wait_for_timeout(1700)
                if (depth, k) in [(3, 'isolate'), (4, 'pages'), (2, 'flood'), (1, 'hookpull')]:
                    await pg.screenshot(path=f'/tmp/e_7sjef_{depth}_{k}.png')
            await pg.evaluate("() => { const B = MORBIDIUM.boss; if (B) hurt(B, 99999, { from: 'player' }); }")
            await pg.wait_for_timeout(2500)
            sjekk(f'luken åpner seg i etasje {depth}', await pg.evaluate("() => !!MORBIDIUM.trapdoor"))
        sjekk('ingen konsollfeil (sjefer)', not pg.errs, pg.errs[:6])
        await pg.close()

        await b.close()
    print('\n' + ('Alt gikk bra.' if not feil else 'Feilet: ' + ', '.join(feil)))
    sys.exit(1 if feil else 0)

asyncio.run(main())
