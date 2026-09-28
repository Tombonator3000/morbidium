"""Telefon, stor skjerm og TV.

Testdeler fra test_ekstra.py. Kjøres med python3 tools/test_ekstra.py --system mobil_og_tv eller --del N.
"""
import asyncio
from .felles import sjekk, ny_side, start_lop, URL, URL3D, THREE, HB_PLASS


async def del_2(b):
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


async def del_3(b):
    # 3) journalen på stor skjerm
    pg = await ny_side(b, viewport={'width': 1280, 'height': 800})
    await start_lop(pg)
    await pg.evaluate("() => { for (const id of ['due','lys','stempel','hydro']) if (!owned(id)) giveCard(id, true); openJournal(); }")
    await pg.wait_for_timeout(1200)
    await pg.screenshot(path='/tmp/e_4journal.png')
    sjekk('ingen konsollfeil (journal)', not pg.errs, pg.errs[:5])
    await pg.close()


async def del_36(b):
    # 36) Mobil: liggende og stående telefon. HUD-en overlapper ikke, døden og utskrivningen får plass, nye paneler begynner øverst,
    #     panelene kan rulles med fingeren, butikken ligger side om side, journalen og brevet er store nok, hjertene får en grense,
    #     og mistet grafikk hentes tilbake (med nedgradering bare når siden var synlig)
    UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    async def mobil(vp):
        ctx = await b.new_context(viewport=vp, has_touch=True, is_mobile=True, device_scale_factor=2, user_agent=UA)
        pg = await ctx.new_page()
        if THREE:
            await pg.route('**/three.min.js', lambda r: r.fulfill(path=THREE, content_type='application/javascript'))
            await pg.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
        pg.errs = []
        pg.on('pageerror', lambda e: pg.errs.append('PAGEERROR: ' + str(e)))
        pg.on('console', lambda m: pg.errs.append(m.type + ': ' + m.text) if m.type == 'error' else None)
        await pg.goto(URL); await pg.wait_for_timeout(2500); await pg.evaluate("() => localStorage.clear()")
        await pg.goto(URL); await pg.wait_for_timeout(2500)
        await pg.tap('#tNew'); await pg.wait_for_timeout(600); await pg.tap('[data-awk]'); await pg.wait_for_timeout(2500)
        return ctx, pg
    async def sveip(pg, x, y, dy, steg=12):
        cdp = await pg.context.new_cdp_session(pg)
        await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x, 'y': y}]})
        for i in range(1, steg + 1):
            await cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x, 'y': y + dy * i / steg}]})
            await asyncio.sleep(0.016)
        await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await pg.goto(URL); await pg.wait_for_timeout(2500)
    tit = await pg.evaluate("() => { const t = document.getElementById('title'), a = t.firstElementChild.getBoundingClientRect(), z = t.lastElementChild.getBoundingClientRect(); return { over: Math.round(a.top), under: Math.round(innerHeight - z.bottom) }; }")
    sjekk('tittelmenyen står midt på skjermen på PC', abs(tit['over'] - tit['under']) < 40 and tit['over'] > 40, tit)
    await pg.close()
    ctx, pg = await mobil({'width': 844, 'height': 390})
    await pg.evaluate("() => { MORBIDIUM.meta.tips = {}; MORBIDIUM.meta.settings.tips = true; Tips.vis('sjef'); }"); await pg.wait_for_timeout(1000)
    hud = await pg.evaluate("""() => { const r = id => { const b = document.getElementById(id).getBoundingClientRect(); return [b.left, b.top, b.right, b.bottom]; };
          const over = (a, c) => a[0] < c[2] && c[0] < a[2] && a[1] < c[3] && c[1] < a[3], k = ['badge', 'mapring', 'tools', 'cards', 'stick', 'tbtns', 'tips'].map(r), par = [];
          for (let i = 0; i < k.length; i++) for (let j = i + 1; j < k.length; j++) if (over(k[i], k[j])) par.push(i + '-' + j); return { par, skilt: getComputedStyle(document.getElementById('roomsign')).display }; }""")
    sjekk('liggende: merket, kartet, knappene i toppen, kortene, spaken, slagknappene og tipslappen overlapper ikke', not hud['par'] and hud['skilt'] == 'none', hud)
    # innstillingene er høyere enn skjermen: de kan rulles med fingeren, og neste panel begynner øverst likevel
    await pg.evaluate("() => openSettings(false, null, 'bilde')"); await pg.wait_for_timeout(500)
    await sveip(pg, 422, 280, -150); await pg.wait_for_timeout(600)
    ru = await pg.evaluate("() => { const p = document.getElementById('panel'); return { hoy: p.scrollHeight > p.clientHeight, rullet: p.scrollTop }; }")
    ru['panel'] = await pg.evaluate("""async () => { const p = document.getElementById('panel'), vent = t => new Promise(r => setTimeout(r, t)), ut = {};
          p.scrollTop = 100; openSettings(false, null, 'bilde'); await vent(200); ut.sammeBeholder = p.scrollTop;
          p.scrollTop = 999; openHandbook({}, 2, 0); await vent(300); ut.hbHoy = p.scrollHeight > p.clientHeight; ut.hbTopp = p.scrollTop;
          return ut; }""")
    sjekk('det samme panelet tegnet på nytt beholder rullingen, og et nytt panel åpnet fra et annet begynner øverst', abs(ru['panel']['sammeBeholder'] - 100) <= 2 and ru['panel']['hbHoy'] and ru['panel']['hbTopp'] == 0, ru['panel'])
    await pg.evaluate("() => { document.getElementById('panel').scrollTop = 999; closePanel(); openService('kafeteria'); }"); await pg.wait_for_timeout(600)
    ru['butikk'] = await pg.evaluate("""() => { const p = document.getElementById('panel'), w = document.querySelector('.shop .who').getBoundingClientRect(), l = document.querySelector('.shop .list').getBoundingClientRect();
          return { top: p.scrollTop, sideomside: Math.abs(w.top - l.top) < 30 && w.right <= l.left + 1, fokus: document.activeElement.classList.contains('offer') }; }""")
    sjekk('panelene kan rulles med fingeren, og et nytt panel begynner øverst selv om det forrige var rullet', ru['hoy'] and ru['rullet'] > 60 and ru['butikk']['top'] == 0 and ru['butikk']['fokus'], ru)
    sjekk('liggende: butikken har personen til venstre og varene til høyre', ru['butikk']['sideomside'], ru['butikk'])
    await pg.evaluate("() => { closePanel(); const P = MORBIDIUM.player; P.invuln = 0; P.iframe = 0; hurt(P, 9999, { type: 'kultist', x: P.x, z: P.z }); }")
    await pg.wait_for_function("() => !!document.getElementById('dNew')", timeout=20000); await pg.wait_for_timeout(300)
    dod = await pg.evaluate("""() => { const p = document.getElementById('panel'), h = document.querySelector('.dodskjerm .hdr').getBoundingClientRect(), n = document.getElementById('dNew').getBoundingClientRect();
          return { plass: p.scrollHeight <= p.clientHeight + 1, hdr: h.top >= 0, knapp: n.bottom <= innerHeight, kolonner: getComputedStyle(document.querySelector('.dodskjerm .dcard')).display }; }""")
    sjekk('liggende: dødskortet i to kolonner, med overskriften og knappene på skjermen uten rulling', dod['plass'] and dod['hdr'] and dod['knapp'] and dod['kolonner'] == 'grid', dod)
    await pg.tap('#dNew'); await pg.wait_for_timeout(800)
    await pg.evaluate("() => { document.getElementById('panel').scrollTop = 999; }"); await pg.tap('[data-awk]'); await pg.wait_for_timeout(2500)
    await pg.evaluate("() => showWin()"); await pg.wait_for_function("() => !!document.getElementById('bOk')", timeout=20000); await pg.wait_for_timeout(300)
    brev = await pg.evaluate("() => ({ top: document.getElementById('panel').scrollTop })")
    await pg.tap('#bOk'); await pg.wait_for_function("() => !!document.getElementById('dNew')", timeout=20000); await pg.wait_for_timeout(300)
    brev['utskrevet'] = await pg.evaluate("() => { const p = document.getElementById('panel'), f = p.firstElementChild; return { sh: p.scrollHeight, ch: p.clientHeight, st: p.scrollTop, hdr: Math.round(document.querySelector('.dodskjerm .hdr').getBoundingClientRect().top), zoom: f.style.zoom, h: f.offsetHeight, merk: document.querySelectorAll('.nymerk > div').length }; }")
    u = brev['utskrevet']
    sjekk('utskrivningsbrevet begynner øverst, og utskrivningen får plass liggende', brev['top'] == 0 and u['sh'] <= u['ch'] + 1 and u['hdr'] >= 0, brev)
    sjekk('ingen konsollfeil (mobil liggende)', not pg.errs, pg.errs[:6])
    await ctx.close()
    ctx, pg = await mobil({'width': 390, 'height': 844})
    st = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), ut = {};
          P.maxHp = 400; P.hp = 300; await vent(400); ut.hjerter = document.querySelectorAll('#hearts > *:not(.hplus)').length; ut.pluss = (document.querySelector('#hearts .hplus') || {}).textContent;
          openJournal(); await vent(600); const m = /scale\(([\d.]+)\)/.exec(document.querySelector('#journal .jwrap').style.transform); ut.journal = m ? +m[1] : 0;
          const q = document.querySelector('#journal .quote'); ut.sitat = q ? getComputedStyle(q).position : ''; closeJournal();
          return ut; }""")
    sjekk('stående: høyst 20 hjerter, og «+fulle/skjulte» for resten', st['hjerter'] == 20 and st['pluss'] == '+10/20', st)
    sjekk('stående: journalen får en smalere side og skaleres ikke under 0,7', st['journal'] >= .7 and st['sitat'] == 'relative', st)
    await pg.evaluate("() => showWin()"); await pg.wait_for_function("() => !!document.getElementById('bOk')", timeout=20000); await pg.wait_for_timeout(300)
    st['brev'] = await pg.evaluate("() => { const f = document.querySelector('.brev'); return { smal: f.classList.contains('smal'), zoom: +f.style.zoom }; }")
    sjekk('stående: utskrivningsbrevet er smalt og skaleres ikke under 0,7', st['brev']['smal'] and st['brev']['zoom'] >= .7, st['brev'])
    await pg.tap('#bOk'); await pg.wait_for_timeout(600)
    await pg.tap('#dNew'); await pg.wait_for_timeout(800); await pg.tap('[data-awk]'); await pg.wait_for_timeout(2500)
    # grafikkminnet: en runde gjennom fire etasjer med fiender som dør, to ganger. Den første fyller bufrene (bilder av møbler
    # og fiender), den andre skal ikke legge igjen noe. Før rettingen ble det liggende et skyggekart, teksturene til flekker,
    # plakater og dører, og strekbåndene til hver dukke for hver etasje: målt til +16 teksturer og +67 geometrier per runde,
    # mot høyst +3 og rundt 0 etter rettingen.
    mem = await pg.evaluate("""async () => { const G = MORBIDIUM, vent = t => new Promise(r => setTimeout(r, t)), info = R.renderer.info.memory;
          R.safe = false; G.meta.settings.simple = false; G.meta.settings.d3 = true; applySettings();
          const runde = async () => { for (let d = 1; d <= 4; d++) { startFloor(d, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); }
            await vent(150); const P = G.player; for (let i = 0; i < 6; i++) { const s = freeSpot(P.x + 2 + i * .3, P.z, 4), e = spawnEnemy('pleier', s.x, s.z, false, d); killEntity(e, {}); } await vent(250); } };
          // tre runder: de to første fyller bufrene (bilder som lages første gang noe dukker opp, og det varierer litt), den tredje skal ikke legge igjen noe
          await runde(); await runde(); const m1 = { t: info.textures, g: info.geometries }; await runde(); const m2 = { t: info.textures, g: info.geometries };
          // skyggekartet direkte: kartet til månen i denne etasjen skal kastes når neste etasje bygges
          const kart = D3.mane && D3.mane.shadow && D3.mane.shadow.map; let kastet = false; if (kart) kart.addEventListener('dispose', () => { kastet = true; });
          startFloor(2, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } await vent(200);
          return { m1, m2, d3: D3.on, bygd: D3.bygd, kval: D3.kval(), kart: !!kart, kastet }; }""")
    sjekk('skyggekartet til månen frigjøres når neste etasje bygges', mem['kart'] and mem['kastet'], mem)
    sjekk('grafikkminnet vokser ikke når de samme etasjene bygges på nytt (flekker, plakater, dører og dukker frigjøres)', mem['d3'] and mem['bygd'] and mem['m2']['t'] - mem['m1']['t'] <= 6 and mem['m2']['g'] - mem['m1']['g'] <= 12, mem)
    tap = await pg.evaluate("""async () => { const vent = t => new Promise(r => setTimeout(r, t)), gl = R.renderer.getContext(), x = gl.getExtension('WEBGL_lose_context'), ut = {};
          const kv = () => [R.dprMax, D3.on ? D3.kval() : '2D'];
          let skjult = false; Object.defineProperty(document, 'hidden', { configurable: true, get: () => skjult });
          const synlig = v => { skjult = !v; document.dispatchEvent(new Event('visibilitychange')); };
          // i bakgrunnen: pause, ingen feilmelding, og ingen nedgradering når den kommer tilbake
          const for1 = kv(); synlig(false); x.loseContext(); await vent(500); ut.pause = MORBIDIUM.state === 'panel'; ut.skjult = R.tapSkjult;
          synlig(true); x.restoreContext(); for (let i = 0; i < 50 && R.tapt; i++) await vent(100); await vent(300);
          ut.bakgrunn = { tilbake: !R.tapt, lik: JSON.stringify(kv()) === JSON.stringify(for1), feil: !document.getElementById('err').classList.contains('hidden') };
          // synlig: tilbake med lettere grafikk
          const for2 = kv(); x.loseContext(); await vent(500); x.restoreContext(); for (let i = 0; i < 50 && R.tapt; i++) await vent(100); await vent(300);
          const etter = kv(); ut.synlig = { tilbake: !R.tapt, ned: etter[0] < for2[0] || etter[1] !== for2[1] || for2[0] === 1 && for2[1] === '2D', feil: !document.getElementById('err').classList.contains('hidden'), for: for2, etter };
          // fast kvalitet (lav): 3D blir på, og valget står
          const s = MORBIDIUM.meta.settings; s.kvalitet = 1; applySettings(); await vent(300);
          x.loseContext(); await vent(500); x.restoreContext(); for (let i = 0; i < 50 && R.tapt; i++) await vent(100); await vent(300);
          ut.fast = { on: D3.on, kval: D3.kval(), d3: s.d3 !== false, kvalitet: s.kvalitet }; s.kvalitet = 0; applySettings();
          delete document.hidden; return ut; }""")
    sjekk('mistet grafikk i bakgrunnen gir pause uten feilmelding, og kommer tilbake uten nedgradering', tap['pause'] and tap['skjult'] and tap['bakgrunn']['tilbake'] and tap['bakgrunn']['lik'] and not tap['bakgrunn']['feil'], tap)
    sjekk('mistet grafikk mens spillet synes, kommer tilbake med lettere grafikk', tap['synlig']['tilbake'] and tap['synlig']['ned'] and not tap['synlig']['feil'], tap['synlig'])
    sjekk('med fast kvalitet står spillerens valg når grafikken kommer tilbake (3D blir på)', tap['fast'] == {'on': True, 'kval': 'lav', 'd3': True, 'kvalitet': 1}, tap['fast'])
    await pg.screenshot(path='/tmp/e_22mobil.png')
    sjekk('ingen konsollfeil (mobil stående)', not [e for e in pg.errs if 'CONTEXT_LOST' not in e], pg.errs[:6])
    await ctx.close()


async def del_40(b):
    # 40) Stort kart: ringen, M, pausen og håndkontrollen åpner det, M, Esc, B og Lukk lukker det, i kamp slår et klikk på ringen,
    #     tegnforklaringen viser det du har sett, lerretene frigjøres, og det får plass stående og liggende på telefon, i 3D og i alle slags etasjer
    ramme = "const ramme = n => new Promise(r => { const f = () => --n <= 0 ? r() : requestAnimationFrame(f); requestAnimationFrame(f); });"
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await pg.goto(URL); await pg.wait_for_timeout(2000); await pg.evaluate("() => localStorage.clear()")
    await start_lop(pg)
    await pg.wait_for_function("() => MORBIDIUM.state === 'play' && MORBIDIUM.time > .3", timeout=30000)
    ring = await pg.evaluate("() => { const r = document.getElementById('mapring'); return { rolle: r.getAttribute('role'), pe: getComputedStyle(r).pointerEvents, navn: r.getAttribute('aria-label'), rad: KONTROLLER.some(k => k[0] === 'Kartet'), tips: !!TIPS.kart }; }")
    sjekk('kartringen er en knapp (rolle, navn og pekerhendelser), og kartet står i kontrollene og tipsene', ring == {'rolle': 'button', 'pe': 'auto', 'navn': 'Kartet (M)', 'rad': True, 'tips': True}, ring)
    await pg.evaluate("() => rolig()")  # noen oppvåkninger begynner i kamp, og da er et klikk på ringen et slag
    await pg.click('#mapring')
    await pg.wait_for_function("() => MORBIDIUM.state === 'panel' && !!document.querySelector('#panel .kartark')", timeout=10000)
    k1 = await pg.evaluate("""() => { const c = document.getElementById('kCan'), p = document.getElementById('kPil'), l = parseFloat(p.style.left), t = parseFloat(p.style.top);
          return { w: c.width, h: c.height, pil: l >= 3 && t >= 3 && l <= parseFloat(c.style.width) + 3 && t <= parseFloat(c.style.height) + 3, fokus: document.activeElement.id, forste: Math.round(Kart.ms), gulv: !!Kart.gulvBilde() }; }""")
    await pg.screenshot(path='/tmp/e_kart_pc.png')
    await pg.keyboard.press('m')
    await pg.wait_for_function("() => MORBIDIUM.state === 'play'", timeout=20000)
    k1['frigjort'] = await pg.evaluate("() => { const c = document.getElementById('kCan'); return !!c && c.width === 0 && c.height === 0; }")
    sjekk('et klikk på ringen åpner kartet over det malte gulvet, med pila på pasienten, og M lukker det og frigjør lerretet', k1['w'] >= 360 and k1['h'] > 300 and k1['pil'] and k1['fokus'] == 'kLukk' and k1['gulv'] and k1['frigjort'], k1)
    await pg.keyboard.press('m')
    await pg.wait_for_function("() => MORBIDIUM.state === 'panel' && !!document.querySelector('#panel .kartark')", timeout=20000)
    await pg.keyboard.press('Escape')
    await pg.wait_for_function("() => MORBIDIUM.state === 'play'", timeout=20000)
    # tegnetiden: det beste av tre nye tegninger, så en annen nettleser som går samtidig ikke gir falsk feil
    tid = await pg.evaluate("() => { Kart.apne(); const ms = []; for (let i = 0; i < 3; i++) { Kart.tegn(); ms.push(Kart.ms); } closePanel(); return { beste: Math.round(Math.min(...ms)), forste: " + str(k1['forste']) + " }; }")
    sjekk('M åpner kartet, Esc lukker det, og kartet tegnes på under 60 ms', tid['beste'] < 60, tid)
    # i kamp: et klikk på ringen er et slag, og musa sikter gjennom den
    kamp = await pg.evaluate("() => { const G = MORBIDIUM; window.__md = 0; document.getElementById('game').addEventListener('mousedown', () => window.__md++); G.combat = { r: G.F.rooms[G.F.startId], wave: 0, t: 999 }; const r = document.getElementById('mapring').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }")
    await pg.click('#mapring'); await pg.wait_for_timeout(300)
    kamp.update(await pg.evaluate("() => { const G = MORBIDIUM, ut = { state: G.state, md: window.__md, mx: Input.mouse.x, my: Input.mouse.y }; G.combat = null; return ut; }"))
    sjekk('i kamp på PC åpner ikke et klikk på ringen kartet: det blir et slag, og musa sikter videre', kamp['state'] == 'play' and kamp['md'] == 1 and abs(kamp['mx'] - kamp['x']) < 3 and abs(kamp['my'] - kamp['y']) < 3, kamp)
    # fiender fra en hendelse låser ingen dører (G.combat er tom), men et klikk på ringen er et slag da også
    await pg.evaluate("() => { const P = MORBIDIUM.player; spawnEnemyBareTest('rotte', P.x + 2, P.z); }")
    await pg.click('#mapring'); await pg.wait_for_timeout(300)
    hf = await pg.evaluate("() => { const G = MORBIDIUM, ut = { state: G.state, md: window.__md, combat: !!G.combat }; if (G.state === 'panel') closePanel(); rolig(); return ut; }")
    sjekk('fiender fra en hendelse rundt pasienten: et klikk på ringen er et slag og ikke kartet', hf == {'state': 'play', 'md': 2, 'combat': False}, hf)
    # et annet panel som tar over mens kartet er oppe (drømmen begynner), frigjør lerretet også
    byttet = await pg.evaluate("() => { Kart.apne(); const c = document.getElementById('kCan'), for_ = c.width; openPause(); const ut = { for: for_, etter: c.width, pause: !!document.getElementById('pK') }; closePanel(); return ut; }")
    sjekk('kartet som byttes ut med et annet panel, frigjør lerretet', byttet['for'] >= 360 and byttet['etter'] == 0 and byttet['pause'], byttet)
    # fra pausen og tilbake
    await pg.keyboard.press('Escape'); await pg.wait_for_function("() => MORBIDIUM.state === 'panel' && !!document.getElementById('pK')", timeout=20000)
    await pg.click('#pK'); await pg.wait_for_timeout(200)
    pa = await pg.evaluate("() => !!document.querySelector('#panel .kartark')")
    await pg.keyboard.press('Escape'); await pg.wait_for_function("() => !!document.querySelector('#panel .clip')", timeout=20000)
    await pg.click('#panel [data-close]'); await pg.wait_for_function("() => MORBIDIUM.state === 'play'", timeout=20000)
    sjekk('Kartet i pausen åpner kartet, og Esc går tilbake til pausen', pa, pa)
    # håndkontroll: pil høyre (15) åpner, pil høyre igjen lukker ikke (den skal bla i menyene), B (1) lukker
    pad = await pg.evaluate("""async () => { """ + ramme + """ const G = MORBIDIUM, ut = {};
          const p = { id: 'testpad', index: 0, connected: true, mapping: 'standard', axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) };
          Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => [p] });
          const trykk = async i => { p.buttons[i].pressed = true; p.buttons[i].value = 1; await ramme(4); p.buttons[i].pressed = false; p.buttons[i].value = 0; await ramme(4); };
          await ramme(3); await trykk(15); ut.apnet = G.state === 'panel' && Kart.aapen(); ut.hint = (document.querySelector('.khint') || {}).textContent;
          await trykk(15); ut.blir = Kart.aapen(); await trykk(1); ut.lukket = G.state === 'play';
          await trykk(9); ut.pause = G.state === 'panel' && !!document.querySelector('#panel .clip'); await trykk(1); ut.pauseB = G.state === 'play';
          Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => [] }); await ramme(3); return ut; }""")
    sjekk('håndkontrollen: pil høyre åpner kartet, B lukker det (og pausen), og pil høyre lukker det ikke', pad == {'apnet': True, 'hint': 'B eller Start lukker kartet', 'blir': True, 'lukket': True, 'pause': True, 'pauseB': True}, pad)
    # journalen bytter ut alt med data-kart med bilder av kuriositeter; ringen og minikartet skal overleve den
    jr = await pg.evaluate("() => { openJournal('kuriositeter'); closeJournal(); openJournal(); closeJournal(); const m = document.getElementById('map'); return !!m && m.parentElement.id === 'mapring' && document.getElementById('mapring').parentElement.id === 'hud'; }")
    sjekk('minikartet og ringen står igjen etter journalen', jr, jr)
    # tegnforklaringen viser det du har sett: tjenestene med navn, overlegen uten navn før du har vært der
    leg = await pg.evaluate("""() => { const G = MORBIDIUM, F = G.F; Folge.kart('alt'); Kart.apne(); const L = [...document.querySelectorAll('.kleg li')].map(l => l.textContent), tj = F.rooms.filter(r => r.role === 'service');
          const ut = { tjenester: tj.every(r => L.some(t => t.startsWith(SERVICES[r.service].name))), sjef: L.some(t => t.startsWith('Overlegen')), du: L[0] === 'Du er her', ikoner: document.querySelectorAll('.kleg canvas').length === L.length, tall: document.querySelector('.ktall').textContent };
          closePanel(); return ut; }""")
    sjekk('tegnforklaringen: tjenestene med navn, overlegen uten navn før du har vært der, og hvor mye som er utforsket', leg['tjenester'] and leg['sjef'] and leg['du'] and leg['ikoner'] and 'utforsket' in leg['tall'], leg)
    # alle slags etasjer: Parken, Nattskogen, en drøm, «Enkel grafikk» og uten det malte gulvet
    et = await pg.evaluate("""async () => { const G = MORBIDIUM, vent = t => new Promise(r => setTimeout(r, t)), ut = {};
          const prov = navn => { Kart.apne(); ut[navn] = !!document.querySelector('#panel .kartark') && Kart.merker().L.length >= 1 && document.getElementById('kCan').width >= 360; closePanel(); };
          for (const d of [1, 5]) { startFloor(d, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } await vent(200); prov('etasje' + d); }
          G.run.dromVent = 3; startFloor(3, false); await vent(300); ut.drom = !!G.drom; G.seen.fill(1); Kart.apne(); ut.dor = [...document.querySelectorAll('.kleg li')].some(l => l.textContent.startsWith('Døra')) && document.querySelector('.kund').textContent.startsWith('Drømmen'); closePanel();
          for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); }
          G.meta.settings.simple = true; applySettings(); startFloor(2, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } await vent(200); ut.safe = R.safe; prov('enkel');
          G.meta.settings.simple = false; applySettings();
          const gb = Kart.gulvBilde; Kart.gulvBilde = () => null; prov('flatt'); Kart.gulvBilde = gb;
          return ut; }""")
    sjekk('kartet virker i Parken, Nattskogen, drømmen (med døra), med «Enkel grafikk» og uten det malte gulvet', et == {'etasje1': True, 'etasje5': True, 'drom': True, 'dor': True, 'safe': True, 'enkel': True, 'flatt': True}, et)
    sjekk('ingen konsollfeil (stort kart på PC)', not pg.errs, pg.errs[:6])
    await pg.close()
    # 3D: det malte gulvet ligger under et annet materiale, men kartet finner det
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await pg.goto(URL3D); await pg.wait_for_timeout(2000); await pg.evaluate("() => localStorage.clear()")
    await start_lop(pg, url=URL3D)
    await pg.wait_for_function("() => MORBIDIUM.state === 'play' && MORBIDIUM.time > .3", timeout=60000)
    d3 = await pg.evaluate("() => { Folge.kart('alt'); Kart.apne(); const ut = { d3: D3.on && D3.bygd, kart: !!document.querySelector('#panel .kartark'), gulv: !!Kart.gulvBilde() }; return ut; }")
    await pg.wait_for_timeout(300); await pg.screenshot(path='/tmp/e_kart_3d.png')
    await pg.evaluate("() => closePanel()")
    sjekk('kartet i 3D bruker det malte gulvet', d3 == {'d3': True, 'kart': True, 'gulv': True}, d3)
    sjekk('ingen konsollfeil (stort kart i 3D)', not pg.errs, pg.errs[:6])
    await pg.close()
    # telefon: trykk på ringen stående og liggende, snu telefonen med kartet oppe, og ingenting ruller
    UA_K = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    ctx = await b.new_context(viewport={'width': 390, 'height': 844}, has_touch=True, is_mobile=True, device_scale_factor=2, user_agent=UA_K)
    pg = await ctx.new_page()
    if THREE:
        await pg.route('**/three.min.js', lambda r: r.fulfill(path=THREE, content_type='application/javascript'))
        await pg.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
    pg.errs = []
    pg.on('pageerror', lambda e: pg.errs.append('PAGEERROR: ' + str(e)))
    pg.on('console', lambda m: pg.errs.append(m.type + ': ' + m.text) if m.type == 'error' else None)
    await pg.goto(URL); await pg.wait_for_timeout(2500); await pg.evaluate("() => localStorage.clear()")
    await pg.goto(URL); await pg.wait_for_timeout(2500)
    await pg.tap('#tNew'); await pg.wait_for_timeout(600); await pg.tap('[data-awk]')
    await pg.wait_for_function("() => MORBIDIUM.state === 'play' && MORBIDIUM.time > .3", timeout=30000)
    await pg.evaluate("() => { rolig(); Folge.kart('alt'); }")
    plass = """() => { const p = document.getElementById('panel'), a = document.getElementById('kartark'), r = a.getBoundingClientRect(), l = document.getElementById('kLukk').getBoundingClientRect();
          return { lag: a.className.replace('fit kartark paper', '').trim() || 'bred', rull: p.scrollHeight > p.clientHeight + 2 || p.scrollWidth > p.clientWidth + 2, inne: r.left >= -1 && r.top >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1, lukk: l.bottom <= innerHeight && l.width > 30, zoom: +a.style.zoom, lup: getComputedStyle(document.querySelector('#mapring .kluppe')).display, hint: !!document.querySelector('.khint') }; }"""
    await pg.tap('#mapring')
    await pg.wait_for_function("() => MORBIDIUM.state === 'panel' && !!document.querySelector('#panel .kartark')", timeout=10000); await pg.wait_for_timeout(300)
    st = await pg.evaluate(plass)
    await pg.screenshot(path='/tmp/e_kart_staende.png')
    sjekk('stående telefon: et trykk på ringen åpner kartet i smalt oppsett, alt får plass uten rulling, og uten tastehint', st['lag'] == 'smal' and not st['rull'] and st['inne'] and st['lukk'] and st['zoom'] >= .75 and st['lup'] == 'block' and not st['hint'], st)
    await pg.set_viewport_size({'width': 844, 'height': 390})
    await pg.wait_for_function("() => { const a = document.getElementById('kartark'); return !!a && a.classList.contains('lig'); }", timeout=20000); await pg.wait_for_timeout(300)
    lg = await pg.evaluate(plass)
    await pg.screenshot(path='/tmp/e_kart_liggende.png')
    await pg.tap('#kLukk')
    await pg.wait_for_function("() => MORBIDIUM.state === 'play'", timeout=20000)
    lg['frigjort'] = await pg.evaluate("() => document.getElementById('kCan').width === 0")
    await pg.tap('#mapring')
    await pg.wait_for_function("() => MORBIDIUM.state === 'panel' && !!document.querySelector('#panel .kartark')", timeout=10000); await pg.wait_for_timeout(300)
    lg['igjen'] = await pg.evaluate(plass)
    await pg.tap('#kLukk'); await pg.wait_for_function("() => MORBIDIUM.state === 'play'", timeout=20000)
    sjekk('telefonen snus med kartet oppe: liggende oppsett uten rulling, Lukk frigjør lerretet, og ringen kan trykkes på liggende også', lg['lag'] == 'lig' and not lg['rull'] and lg['inne'] and lg['lukk'] and not lg['hint'] and lg['frigjort'] and lg['igjen']['lag'] == 'lig' and not lg['igjen']['rull'], lg)
    sjekk('ingen konsollfeil (stort kart på telefon)', not pg.errs, pg.errs[:6])
    await ctx.close()


async def del_42(b):
    # 42) TV-modus: nettleseren i en Samsung-TV kjennes igjen, HUD-en holder seg innenfor margene uten overlapp og står midt på,
    #     middels kvalitet, tilbaketasten på fjernkontrollen og historikken, fullskjerm, håndboka, linja om kontrolleren, rapporten og innstillingen
    TVUA = 'Mozilla/5.0 (SMART-TV; LINUX; Tizen 8.0) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/7.0 Chrome/120.0.6099.5 TV Safari/537.36'
    TV_INIT = """(() => {
          window.__pad = { id: 'Testkontroll (STANDARD GAMEPAD)', index: 0, connected: true, mapping: 'standard', timestamp: 0, axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) };
          window.__pads = () => [];
          Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => window.__pads() });
          window.__ramme = n => new Promise(r => { const f = () => --n <= 0 ? r() : requestAnimationFrame(f); requestAnimationFrame(f); });
          window.__vent = async (f, n = 400) => { for (let i = 0; i < n && !f(); i++) await window.__ramme(1); return !!f(); };
          // fullskjerm uten ekte fullskjerm: nettleseren i testen kan ikke, men knappen skal be om det og teksten følge med
          window.__fs = null; const bytt = el => { window.__fs = el; setTimeout(() => document.dispatchEvent(new Event('fullscreenchange', { bubbles: true })), 0); return Promise.resolve(); };
          Object.defineProperty(Document.prototype, 'fullscreenEnabled', { configurable: true, get: () => true });
          Object.defineProperty(Document.prototype, 'fullscreenElement', { configurable: true, get: () => window.__fs });
          Element.prototype.requestFullscreen = function () { return bytt(this); }; Document.prototype.exitFullscreen = function () { return bytt(null); };
          // tilbaketasten på fjernkontrollen: Samsung sender keyCode 10009 og key XF86Back, uten code
          window.__tilbake = () => { for (const t of ['keydown', 'keyup']) { const e = new KeyboardEvent(t, { key: 'XF86Back', bubbles: true, cancelable: true }); Object.defineProperty(e, 'keyCode', { get: () => 10009 }); document.body.dispatchEvent(e); } };
        })()"""
    HUD_TV = """() => { const W = innerWidth, H = innerHeight, r = id => { const e = document.getElementById(id); if (!e || getComputedStyle(e).display === 'none') return null; const b = e.getBoundingClientRect(); return b.width ? [b.left, b.top, b.right, b.bottom] : null; };
          const navn = ['badge', 'roomsign', 'tools', 'cards', 'weapon', 'cons', 'mapring', 'tips'], k = navn.map(r), ute = [], par = [];
          const over = (a, c) => a[0] < c[2] - 1 && c[0] < a[2] - 1 && a[1] < c[3] - 1 && c[1] < a[3] - 1;
          k.forEach((a, i) => { if (a && (a[0] < W * .045 - 1 || a[1] < H * .045 - 1 || a[2] > W * .955 + 1 || a[3] > H * .955 + 1)) ute.push(navn[i]); });
          for (let i = 0; i < k.length; i++) for (let j = i + 1; j < k.length; j++) if (k[i] && k[j] && over(k[i], k[j])) par.push(navn[i] + '-' + navn[j]);
          const c = k[3], s = k[1]; return { ute, par, alle: k.filter(Boolean).length, kortMidt: Math.round((c[0] + c[2]) / 2 - W / 2), skiltMidt: Math.round((s[0] + s[2]) / 2 - W / 2), ui: getComputedStyle(document.documentElement).getPropertyValue('--ui').trim() }; }"""
    pg = await ny_side(b, viewport={'width': 1920, 'height': 1080}, user_agent=TVUA)
    await pg.add_init_script(TV_INIT)
    await pg.goto(URL)
    await pg.wait_for_function("() => window.MORBIDIUM && MORBIDIUM.state === 'title' && document.activeElement && document.activeElement.id === 'tNew'", timeout=30000)
    t = await pg.evaluate("""async () => { const cs = getComputedStyle(document.documentElement), ut = { tv: R.tv, body: document.body.classList.contains('tv'), ui: cs.getPropertyValue('--ui').trim(), kval: D3.kval(), zoom: getComputedStyle(document.querySelector('#title .tmenu')).zoom };
          await new Promise(r => setTimeout(r, 700)); ut.tittelFelle = !!(history.state && history.state.morbidium);
          // pilene på fjernkontrollen kan komme uten code, bare med key
          document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })); ut.pil = document.activeElement.id;
          const f = document.querySelector('#title [data-fs]'); ut.fs = f ? f.textContent : ''; f.click(); ut.fsBedt = window.__fs === document.documentElement;
          await __vent(() => f.textContent === 'Avslutt fullskjerm', 100); ut.fsTekst = f.textContent; f.click(); await __vent(() => f.textContent === 'Fullskjerm', 100); ut.fsAv = !window.__fs && f.textContent === 'Fullskjerm';
          return ut; }""")
    sjekk('TV-modus: nettleseren i Samsung-TV-en kjennes igjen, større HUD og tittel, middels kvalitet, og ingen felle i historikken på tittelen',
          t['tv'] and t['body'] and t['ui'] == '1.4' and t['kval'] == 'middels' and abs(float(t['zoom']) - 1.4) < .01 and not t['tittelFelle'], t)
    sjekk('TV-modus: pilene på fjernkontrollen uten code flytter i menyen, og Fullskjerm på tittelen slås av og på med teksten etter',
          t['pil'] == 'tHelp' and t['fs'] == 'Fullskjerm' and t['fsBedt'] and t['fsTekst'] == 'Avslutt fullskjerm' and t['fsAv'], t)
    await pg.click('#tNew'); await pg.wait_for_timeout(500); await pg.click('[data-awk]')
    await pg.wait_for_function("() => MORBIDIUM.state === 'play' && MORBIDIUM.time > .3", timeout=30000)
    await pg.evaluate("() => { rolig(); MORBIDIUM.run.patient.name = 'Alf Nygaard'; MORBIDIUM.meta.tips = {}; MORBIDIUM.meta.settings.tips = true; Tips.vis('sjef'); }")
    await pg.wait_for_function("() => { const t = document.getElementById('tips'); return t && t.classList.contains('inn') && getComputedStyle(t).opacity === '1'; }", timeout=20000)
    h = await pg.evaluate(HUD_TV)
    await pg.screenshot(path='/tmp/e_tv_hud.png')
    # berøringsknappene vises ikke på TV, selv om noe skulle sende en berøring
    h['touch'] = await pg.evaluate("() => { Input.touch.active = true; const t = document.getElementById('touch'); t.classList.remove('hidden'); const d = getComputedStyle(t).display; t.classList.add('hidden'); Input.touch.active = false; return d; }")
    # største skjermtekst: taket på 1,6 holder kortene klar av apparatet
    await pg.evaluate("() => { const s = MORBIDIUM.meta.settings; s.ui = 1.3; applySettings(); }"); await pg.wait_for_timeout(300)
    h2 = await pg.evaluate(HUD_TV)
    await pg.evaluate("() => { const s = MORBIDIUM.meta.settings; s.ui = 1; applySettings(); }")
    sjekk('TV-modus: HUD-en holder seg innenfor 4,5 prosent av kanten uten overlapp, kort og skilt står midt på, og berøringsknappene er skjult',
          not h['ute'] and not h['par'] and h['alle'] == 8 and abs(h['kortMidt']) <= 3 and abs(h['skiltMidt']) <= 3 and h['touch'] == 'none' and h['ui'] == '1.4', h)
    sjekk('TV-modus med største skjermtekst: taket på 1,6, og fortsatt innenfor margene uten overlapp', h2['ui'] == '1.6' and not h2['ute'] and not h2['par'], h2)
    # tilbaketasten og historikken: et ekstra steg i spillet, tilbake åpner og lukker pausen, og tasten og steget sammen gjør det bare én gang
    tb = await pg.evaluate("""async () => { const G = MORBIDIUM, ut = {}, felle = () => !!(history.state && history.state.morbidium);
          ut.felle = await __vent(felle, 200);
          __tilbake(); ut.tastPause = await __vent(() => G.state === 'panel' && !!document.getElementById('pS')); ut.fsPause = !!document.querySelector('#panel .pmenu [data-fs]');
          ut.zoom = +document.querySelector('#panel .fit').style.zoom;
          __tilbake(); ut.tastLukk = await __vent(() => G.state === 'play');
          // en nettleser som bare går tilbake i historikken, uten tastetrykk: tiden siden forrige tast nullstilles, ellers ville en rask maskin
          // tatt steget for en del av tasten over (samme trykk)
          Input.tilbakeT = -1e9; history.back(); ut.histPause = await __vent(() => G.state === 'panel' && !!document.getElementById('pS')); ut.igjen = await __vent(felle, 200);
          Input.tilbakeT = -1e9; history.back(); ut.histLukk = await __vent(() => G.state === 'play'); ut.igjen2 = await __vent(felle, 200);
          // Samsung kan sende både tastetrykket og steget tilbake i historikken for samme trykk: da skal pausen åpnes, ikke åpnes og lukkes
          const n0 = TvTilbake.n; __tilbake(); history.back(); ut.tatt = await __vent(() => TvTilbake.n > n0 && G.state === 'panel', 600); await __ramme(10);
          ut.begge = G.state === 'panel' && !!document.getElementById('pS'); ut.igjen3 = await __vent(felle, 200);
          return ut; }""")
    sjekk('TV-modus: tilbake på fjernkontrollen åpner og lukker pausen, også som steg i historikken, og steget legges inn igjen',
          tb == {'felle': True, 'tastPause': True, 'fsPause': True, 'zoom': tb['zoom'], 'tastLukk': True, 'histPause': True, 'igjen': True, 'histLukk': True, 'igjen2': True, 'tatt': True, 'begge': True, 'igjen3': True} and tb['zoom'] > 1.15, tb)
    # testpanelet over pausen (?testmodus på TV-en): ett trykk på tilbake, som tast og som steg i historikken, lukker bare testpanelet
    tp = await pg.evaluate("""async () => { const G = MORBIDIUM, ut = {}; Testmodus.apne('lyd'); await __ramme(3); ut.apen = Testmodus.apen;
          const n0 = TvTilbake.n; __tilbake(); history.back(); ut.tatt = await __vent(() => TvTilbake.n > n0, 600); await __ramme(10);
          ut.lukket = !Testmodus.apen; ut.pause = G.state === 'panel' && !!document.getElementById('pS'); ut.igjen = await __vent(() => !!(history.state && history.state.morbidium), 200); return ut; }""")
    sjekk('TV-modus: tilbake med testpanelet over pausen lukker bare testpanelet, også når steget i historikken kommer i tillegg',
          tp == {'apen': True, 'tatt': True, 'lukket': True, 'pause': True, 'igjen': True}, tp)
    # rapporten og linja om kontrolleren i Innstillinger, Styring (kontrolleren dukker først opp etter et knappetrykk)
    rp = await pg.evaluate("""async () => { const ut = {}; ut.uten = Testmodus.enhet(); openSettings(false, null, 'styring'); await __ramme(2); ut.ingen = document.getElementById('kStatus').textContent;
          window.__pads = () => [window.__pad]; __pad.buttons[3].pressed = true; await __ramme(3); __pad.buttons[3].pressed = false; await __vent(() => document.getElementById('kStatus').textContent.startsWith('Kontroller funnet'), 100);
          ut.funnet = document.getElementById('kStatus').textContent; ut.med = Testmodus.enhet(); closePanel(); await __ramme(2);
          openSettings(false, null, 'spill'); await __ramme(2); ut.fane = document.querySelector('[data-s="tv"]').parentNode.querySelector('em').textContent; closePanel();
          openHandbook({}, 1, 1); await __ramme(2); ut.sider = hbSider(HANDBOK[1]); ut.side = document.querySelector('.hpage h2').textContent + ': ' + (document.querySelector('.htext .hunder') || {}).textContent; return ut; }""")
    rp['plass'] = await pg.evaluate(HB_PLASS)
    await pg.screenshot(path='/tmp/e_tv_handbok.png')
    sjekk('TV-modus: testrapporten nevner Samsung-TV-en, kontrolleren, TV-modus og fullskjerm, og Styring sier om kontrolleren er funnet',
          'Samsung-TV (Tizen 8.0, Chromium 120)' in rp['uten'] and 'ingen kontroller funnet' in rp['uten'] and 'TV-modus på' in rp['uten'] and 'fullskjerm nei' in rp['uten']
          and rp['ingen'].startswith('Ingen kontroller funnet') and rp['funnet'] == 'Kontroller funnet: Testkontroll (STANDARD GAMEPAD).' and 'kontroller Testkontroll (STANDARD GAMEPAD) (standard oppsett, 17 knapper, 4 akser)' in rp['med'] and rp['fane'] == 'automatisk (på)', rp)
    sjekk('håndboka: Styring har en side til, «Spille på TV», som får plass', rp['sider'] == 2 and rp['side'] == 'Styring: Spille på TV' and rp['plass'], rp)
    # journalen er større på TV, men innenfor margene
    await pg.evaluate("() => { closePanel(); openJournal(); }"); await pg.wait_for_timeout(600)
    jr = await pg.evaluate("() => { const r = document.querySelector('#journal .jwrap').getBoundingClientRect(), m = /scale\\(([\\d.]+)\\)/.exec(document.querySelector('#journal .jwrap').style.transform); closeJournal(); return { s: m ? +m[1] : 0, inne: r.left >= innerWidth * .045 - 1 && r.top >= innerHeight * .045 - 1 && r.right <= innerWidth * .955 + 1 && r.bottom <= innerHeight * .955 + 1 }; }")
    # innstillingen: av (2) slår TV-modus av også i TV-en, og automatisk (0) slår den på igjen
    av = await pg.evaluate("() => { const s = MORBIDIUM.meta.settings; s.tv = 2; applySettings(); const ut = { tv: R.tv, body: document.body.classList.contains('tv'), ui: getComputedStyle(document.documentElement).getPropertyValue('--ui').trim(), kval: D3.kval() }; s.tv = 0; applySettings(); ut.igjen = R.tv && document.body.classList.contains('tv'); return ut; }")
    sjekk('TV-modus: journalen skaleres innenfor margene, og innstillingen «av» slår TV-modus av (automatisk på igjen)',
          jr['inne'] and jr['s'] > 1 and av == {'tv': False, 'body': False, 'ui': '1', 'kval': 'hoy', 'igjen': True}, [jr, av])
    # tilbake til tittelen: steget som er igjen, tar tilbake med seg ut av spillet, slik tilbake på tittelen skal,
    # også når tasten kommer fram i tillegg (Samsung). Uten tastetrykk sjekkes det i 3D-delen under
    await pg.evaluate("() => showTitle()"); await pg.wait_for_timeout(300)
    sjekk('ingen konsollfeil (TV-modus)', not pg.errs, pg.errs[:6])
    await pg.evaluate("() => { __tilbake(); history.back(); }")
    for i in range(100):
        if pg.url == 'about:blank': break
        await pg.wait_for_timeout(100)
    sjekk('TV-modus: tilbake på tittelen går ut av spillet, også når steget fra spillet er igjen og tasten kommer fram', pg.url == 'about:blank', pg.url)
    await pg.close()
    # vanlig nettleser: TV-modus er av, ingen felle i historikken, lappen om TV-modus med håndkontroll på stor skjerm, og «på» slår den på
    pg = await ny_side(b, viewport={'width': 1920, 'height': 1080})
    await pg.add_init_script(TV_INIT)
    await start_lop(pg)
    pc = await pg.evaluate("""async () => { const G = MORBIDIUM, ut = { tv: R.tv, body: document.body.classList.contains('tv'), kval: D3.kval() }; await new Promise(r => setTimeout(r, 700)); ut.felle = !!(history.state && history.state.morbidium);
          rolig(); G.meta.tips = {}; G.meta.settings.tips = true; Input.enhet('pad'); const t0 = G.time; await __vent(() => G.meta.tips.tv || G.time > t0 + 2, 600); ut.tips = !!G.meta.tips.tv;
          Input.enhet('kb'); G.meta.settings.tv = 1; applySettings(); ut.paa = R.tv && document.body.classList.contains('tv') && D3.kval() === 'middels'; G.meta.settings.tv = 0; applySettings(); return ut; }""")
    sjekk('vanlig nettleser: TV-modus er av uten felle i historikken, lappen om TV-modus kommer med håndkontroll på stor skjerm, og «på» slår den på',
          pc == {'tv': False, 'body': False, 'kval': 'hoy', 'felle': False, 'tips': True, 'paa': True}, pc)
    sjekk('ingen konsollfeil (TV-modus av)', not pg.errs, pg.errs[:6])
    await pg.close()
    # 3D og «Enkel grafikk» på TV-en: 3D starter på middels, og enkel grafikk slår det av uten feil
    pg = await ny_side(b, viewport={'width': 1920, 'height': 1080}, user_agent=TVUA)
    await pg.add_init_script(TV_INIT)
    await pg.goto(URL3D); await pg.wait_for_function("() => window.MORBIDIUM && MORBIDIUM.state === 'title'", timeout=30000)
    # klikk i siden i stedet for med musa: 3D i 1920 x 1080 med programvaregrafikk tegner så sakte at et museklikk kan gå ut på tid når maskinen har mye å gjøre
    await pg.evaluate("() => document.getElementById('tNew').click()"); await pg.wait_for_selector('[data-awk]', timeout=30000); await pg.evaluate("() => document.querySelector('[data-awk]').click()")
    await pg.wait_for_function("() => MORBIDIUM.state === 'play' && MORBIDIUM.time > .2", timeout=60000)
    d3 = await pg.evaluate("""async () => { const ut = { on: D3.on, bygd: D3.bygd, kval: D3.kval(), skygge: D3.Q().skygge };
          const s = MORBIDIUM.meta.settings; s.simple = true; applySettings(); await __ramme(5); ut.enkel = !D3.on && R.safe && document.body.classList.contains('tv'); return ut; }""")
    await pg.screenshot(path='/tmp/e_tv_enkel.png')
    sjekk('TV-modus i 3D: starter på middels, og «Enkel grafikk» virker', d3 == {'on': True, 'bygd': True, 'kval': 'middels', 'skygge': 1024, 'enkel': True}, d3)
    sjekk('ingen konsollfeil (TV-modus i 3D)', not pg.errs, pg.errs[:6])
    # nettleserens egen tilbakeknapp (ingen tast): på tittelen tar steget fra spillet tilbake med seg ut av spillet
    await pg.wait_for_function("() => TvTilbake.fanget", timeout=10000)
    await pg.evaluate("() => { showTitle(); history.back(); }")
    for i in range(100):
        if pg.url == 'about:blank': break
        await pg.wait_for_timeout(100)
    sjekk('TV-modus: tilbake uten tastetrykk på tittelen går ut av spillet, også når steget fra spillet er igjen', pg.url == 'about:blank', pg.url)
    await pg.close()


async def del_65(b):
    # 65) Telefoner som melder fin peker (Chrome på Samsung med S Pen) får telefonoppsettet, men ikke en PC med berøringsskjerm.
    #     Telefoner får aldri omgivelsesskyggen (dybdeteksturen), heller ikke på høy. Mistet grafikk som ikke kommer tilbake, gir en
    #     lettere start neste gang, og feilmeldingen forteller om telefon eller PC, kvaliteten og oppløsningen
    FIN = """(() => { const o = window.matchMedia.bind(window); window.matchMedia = q => /pointer:\\s*coarse/.test(q) ? { matches: false, media: q, onchange: null,
          addListener() { }, removeListener() { }, addEventListener() { }, removeEventListener() { }, dispatchEvent() { return false; } } : o(q); })()"""
    UA_S = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Mobile Safari/537.36'
    async def fin_side(**kw):
        pg = await ny_side(b, has_touch=True, **kw)
        await pg.add_init_script(FIN)
        await pg.goto(URL3D + '?3d'); await pg.wait_for_timeout(1500); await pg.evaluate("() => localStorage.clear()")
        return pg
    pg = await fin_side(viewport={'width': 384, 'height': 832}, device_scale_factor=3.75, user_agent=UA_S)
    await start_lop(pg, url=URL3D + '?3d')
    tf = await pg.evaluate("""async () => { const vent = t => new Promise(r => setTimeout(r, t)), s = MORBIDIUM.meta.settings;
          const ut = { fin: !matchMedia('(pointer: coarse)').matches, coarse: R.coarse, dprMax: R.dprMax, kval: D3.kval(), d3: D3.on };
          s.kvalitet = 3; applySettings(); await vent(500);
          ut.hoy = { kval: D3.kval(), ao: D3.Q().ao, skygge: D3.Q().skygge, dybde: !!R.rt.depthTexture, uAo: R.post.uniforms.uAo.value, dis: R.post.uniforms.uDis.value };
          s.kvalitet = 0; delete s.kvAuto; applySettings(); await vent(500); ut.auto = D3.kval();
          R.renderer.getContext().getExtension('WEBGL_lose_context').loseContext(); await vent(8800);
          const e = document.getElementById('err'), p = e ? [...e.querySelectorAll('p')].map(x => x.textContent) : [];
          ut.feil = !!e && !e.classList.contains('hidden'); ut.tekst = p[0] || ''; ut.info = p[1] || ''; ut.kvAuto = JSON.parse(localStorage.getItem('morbidium_meta_v2')).settings.kvAuto;
          document.getElementById('errKopi').click(); await vent(300); ut.rapport = document.getElementById('errTekst').value; ut.lagret = !!localStorage.getItem('morbidium_krasj');
          return ut; }""")
    tf['errs'] = [e for e in pg.errs if 'context_lost' not in e.lower() and 'context lost' not in e.lower()][:6]
    await pg.close()
    h = tf['hoy']
    sjekk('telefon som melder fin peker (Samsung med S Pen) får telefonoppsettet: oppløsning 1,5 og middels i 3D',
          tf['fin'] and tf['coarse'] and tf['dprMax'] == 1.5 and tf['kval'] == 'middels' and tf['d3'], tf)
    sjekk('telefon på høy: ingen omgivelsesskygge eller dybdetekstur, 1024 i skyggekartet, men dis',
          h['kval'] == 'hoy' and h['ao'] == 0 and h['skygge'] == 1024 and not h['dybde'] and h['uAo'] == 0 and h['dis'] > 0, h)
    sjekk('mistet grafikk som ikke kommer tilbake: feilmeldingen sier at neste start blir lettere og viser telefon, 3D middels og oppløsning, og lav er lagret',
          tf['auto'] == 'middels' and tf['feil'] and 'lav kvalitet' in tf['tekst'] and 'telefon, 3D middels, oppløsning 1.5' in tf['info'] and tf['kvAuto'] == 'lav', tf)
    rp = tf['rapport']
    sjekk('feilrapporten har meldingen, grafikken, øyeblikksbildet (etasje, lyder og rammer) og det lagrede løpet, og øyeblikksbildet er lagret',
          rp.startswith('Morbidium feilrapport') and 'Melding: Grafikken gikk tom' in rp and 'telefon, 3D middels' in rp and '"etasje":' in rp and '"lyder":' in rp and '"rammeMs":' in rp and 'Lagret løp: {' in rp and tf['lagret'], rp[:900])
    sjekk('ingen konsollfeil (telefon med fin peker)', not tf['errs'], tf['errs'])
    pc = await fin_side(viewport={'width': 1280, 'height': 720})
    await pc.goto(URL3D + '?3d'); await pc.wait_for_function("() => window.MORBIDIUM && MORBIDIUM.state === 'title'", timeout=60000)
    tp = await pc.evaluate("() => ({ coarse: R.coarse, touch: navigator.maxTouchPoints, kval: D3.kval() })")
    await pc.close()
    sjekk('PC med berøringsskjerm og fin peker er ikke telefon', not tp['coarse'] and tp['touch'] > 0 and tp['kval'] == 'hoy', tp)
    # uten WebGL i det hele tatt (Chrome stenger WebGL for siden etter et krasj): forklaring på norsk, ikke bare feilen fra three
    pg = await ny_side(b, viewport={'width': 390, 'height': 844})
    await pg.add_init_script("(() => { const o = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...a) { return /webgl/i.test(t) ? null : o.call(this, t, ...a); }; })()")
    await pg.goto(URL3D); await pg.wait_for_selector('#err:not(.hidden)', timeout=30000)
    ng = await pg.evaluate("() => ({ tekst: (document.querySelector('#err p') || {}).textContent || '', sider: [...document.querySelectorAll('#err p')].length })")
    await pg.close()
    sjekk('uten WebGL: feilmeldingen sier at nettleseren må lukkes helt, og har med feilen fra three', 'Lukk nettleseren helt' in ng['tekst'] and 'Error creating WebGL context' in ng['tekst'], ng)


DELER = {2: del_2, 3: del_3, 36: del_36, 40: del_40, 42: del_42, 65: del_65}
