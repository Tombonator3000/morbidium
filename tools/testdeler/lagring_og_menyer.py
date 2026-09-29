"""Lagring, menyene, pasienthåndboka, merknader, tips, testmodus og kontrollene i menyene.

Testdeler fra test_ekstra.py. Kjøres med python3 tools/test_ekstra.py --system lagring_og_menyer eller --del N.
"""
from .felles import sjekk, ny_side, start_lop, URL, URL3D, HB_PLASS


async def del_1(b):
    # 1) lagring og fortsettelse
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await pg.goto(URL); await pg.wait_for_timeout(2000)
    await pg.evaluate("() => localStorage.clear()")
    await start_lop(pg)
    await pg.evaluate("""() => { const G = MORBIDIUM; Items.give('bart'); Items.give('magnet'); G.player.teeth = 77; G.player.weaponLvl = 2; descend(); }""")
    await pg.wait_for_timeout(1500)
    for_ = await pg.evaluate("() => ({ d: MORBIDIUM.depth, items: MORBIDIUM.run.items.slice(), teeth: MORBIDIUM.player.teeth, name: MORBIDIUM.run.patient.name, look: JSON.stringify(MORBIDIUM.run.look), drom: !!MORBIDIUM.drom })")
    await pg.evaluate("() => showTitle()"); await pg.wait_for_timeout(800)
    har = await pg.query_selector('#tCont')
    sjekk('Fortsett-knapp på tittelen', har is not None)
    if har:
        await pg.click('#tCont'); await pg.wait_for_timeout(1500)
        igjen = await pg.evaluate("() => !!MORBIDIUM.drom")
        sjekk('drømmen mellom etasjene kommer før neste etasje, og spilles på nytt etter Fortsett', for_['drom'] and igjen, (for_['drom'], igjen))
        await pg.evaluate("() => Drom.hopp()"); await pg.wait_for_timeout(800)
        etter = await pg.evaluate("() => ({ d: MORBIDIUM.depth, items: MORBIDIUM.run.items.slice(), teeth: MORBIDIUM.player.teeth, name: MORBIDIUM.run.patient.name, lvl: MORBIDIUM.player.weaponLvl, state: MORBIDIUM.state, look: JSON.stringify(MORBIDIUM.run.look) })")
        sjekk('fortsatt løp har samme etasje, tenner og kuriositeter', etter['d'] == for_['d'] and etter['items'] == for_['items'] and etter['teeth'] == for_['teeth'] and etter['name'] == for_['name'] and etter['lvl'] == 2 and etter['state'] == 'play', etter)
        sjekk('fortsatt løp har samme utseende', etter['look'] == for_['look'] and '"v":1' in for_['look'], for_['look'])
    await pg.evaluate("() => { const P = MORBIDIUM.player; P.invuln = 0; P.iframe = 0; hurt(P, 9999, { type: 'kultist' }); }")
    await pg.wait_for_timeout(2400)
    sjekk('død sletter det lagrede løpet', await pg.evaluate("() => !localStorage.getItem('morbidium_run_v1')"))
    await pg.screenshot(path='/tmp/e_1dod.png')
    sjekk('ingen konsollfeil (lagring)', not pg.errs, pg.errs[:5])
    await pg.close()


async def del_11(b):
    # 11) menyene: innstillinger, pasienthåndboka, arkivet og pausen
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await pg.goto(URL); await pg.wait_for_timeout(2000)
    await pg.evaluate("() => { localStorage.clear(); localStorage.setItem('morbidium_meta_v2', JSON.stringify({ deaths: 2, bossKills: 0, wins: 0, fragments: [1], historie: [{ name: 'Ola Test', nr: 1, age: 30, depth: 2, cause: 'test', kills: 3, rooms: 2, look: null, utskrevet: false }], settings: { vol: .5, shake: false } })); }")
    await pg.goto(URL); await pg.wait_for_timeout(2000)
    m = await pg.evaluate("() => { const s = MORBIDIUM.meta.settings; return { shake: s.shake, vol: s.vol, kamera: s.kamera, tall: s.tall }; }")
    sjekk('gamle innstillinger flyttes over (ristingen var av/på)', m == {'shake': 0, 'vol': .5, 'kamera': 1, 'tall': True}, m)
    await pg.click('#tSet'); await pg.wait_for_timeout(300)
    faner = []
    for t in ['lyd', 'bilde', 'spill', 'styring', 'data']:
        await pg.click(f'[data-tab="{t}"]'); await pg.wait_for_timeout(150)
        faner.append(await pg.evaluate("() => { const f = document.querySelector('#panel .fit'), r = f.getBoundingClientRect(); return r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1 && r.top >= -1; }"))
    sjekk('alle fem fanene i innstillingene får plass uten rulling', all(faner), faner)
    await pg.click('[data-tab="bilde"]'); await pg.wait_for_timeout(150)
    await pg.evaluate("() => { const i = document.querySelector('[data-s=kamera]'); i.value = 1.2; i.dispatchEvent(new Event('input')); }")
    await pg.click('[data-tab="spill"]'); await pg.wait_for_timeout(150)
    await pg.click('[data-s=tall]'); await pg.wait_for_timeout(100)
    v = await pg.evaluate("() => ({ view: R.view, tall: document.body.classList.contains('uten-tall'), lagret: JSON.parse(localStorage.getItem('morbidium_meta_v2')).settings.kamera })")
    sjekk('kameraavstand og skadetall virker og lagres', abs(v['view'] - 13.8) < .01 and v['tall'] and v['lagret'] == 1.2, v)
    await pg.click('[data-close]'); await pg.wait_for_timeout(300)
    await pg.click('#tHelp'); await pg.wait_for_timeout(300)
    kap, nkap = [], await pg.evaluate("() => HANDBOK.length")
    for k in range(nkap):
        await pg.click(f'[data-kap="{k}"]'); await pg.wait_for_timeout(120)
        for side in range(await pg.evaluate("(k) => hbSider(HANDBOK[k])", k)):
            if side: await pg.click('#hNext'); await pg.wait_for_timeout(150)
            kap.append(await pg.evaluate(HB_PLASS))
    sjekk('pasienthåndboka har ti kapitler med fiendeindeks, og alle sidene får plass', nkap == 10 and len(kap) >= 18 and all(kap), kap)
    await pg.click('[data-close]'); await pg.wait_for_timeout(300)
    await pg.click('#tArch'); await pg.wait_for_timeout(400)
    a = await pg.evaluate("() => ({ mapper: document.querySelectorAll('.mappe').length, portrett: document.querySelectorAll('.mappe canvas').length })")
    for sk in ['fragmenter', 'rapport']:
        await pg.click(f'[data-sk="{sk}"]'); await pg.wait_for_timeout(200)
    a['rapport'] = await pg.evaluate("() => !!document.querySelector('.rapport')")
    sjekk('arkivet viser mapper med portrett, fragmenter og årsrapport', a == {'mapper': 1, 'portrett': 1, 'rapport': True}, a)
    await pg.click('[data-close]'); await pg.wait_for_timeout(300)
    await pg.click('#tNew'); await pg.wait_for_timeout(400); await pg.click('[data-awk]'); await pg.wait_for_timeout(1400)
    # Escape åpner pausen bare når spillet går, og på en travel maskin tar innleggelsen mer enn 1,4 sekunder
    await pg.wait_for_function("() => MORBIDIUM.state === 'play'", timeout=30000)
    await pg.keyboard.press('Escape'); await pg.wait_for_selector('#pS', timeout=15000); await pg.wait_for_timeout(200)
    p1 = await pg.evaluate("() => ({ state: MORBIDIUM.state, clip: !!document.querySelector('.clip'), port: !!document.querySelector('.pport') })")
    await pg.click('#pS'); await pg.wait_for_timeout(300); await pg.click('[data-close]'); await pg.wait_for_timeout(300)
    p1['tilbake'] = await pg.evaluate("() => !!document.querySelector('.clip')")
    await pg.click('[data-close]'); await pg.wait_for_timeout(300)
    p1['spill'] = await pg.evaluate("() => MORBIDIUM.state")
    sjekk('pausen åpner, innstillinger går tilbake til pausen, og spillet fortsetter', p1 == {'state': 'panel', 'clip': True, 'port': True, 'tilbake': True, 'spill': 'play'}, p1)
    sjekk('ingen konsollfeil (menyer)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_13(b):
    # 13) merknader, utskrivningsbrev og gjeninnleggelse
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await pg.goto(URL); await pg.wait_for_timeout(2000); await pg.evaluate("() => localStorage.clear()"); await pg.goto(URL); await pg.wait_for_timeout(2000)
    await start_lop(pg)
    l = await pg.evaluate("""() => { const ut = new Set(); for (let i = 0; i < 300; i++) for (const p of ['kabinett', 'sjef', 'blod', 'butikk']) ut.add(Items.pickFrom(p)); const laast = [...ut].filter(id => Merknad.laast(id));
          const før = Merknad.laast('speil'), kapell = unlocked('kapell'); Merknad.gi('dod1'); Merknad.gi('rust'); return { laast, før, etter: Merknad.laast('speil'), kapell, kapell2: unlocked('kapell') }; }""")
    sjekk('låste kuriositeter dukker ikke opp før merknaden er fortjent', l == {'laast': [], 'før': True, 'etter': False, 'kapell': False, 'kapell2': True}, l)
    await pg.evaluate("() => { rolig(); MORBIDIUM.run.kills = 12; showWin(); }"); await pg.wait_for_timeout(1500)
    brev = await pg.evaluate("() => ({ brev: !!document.querySelector('.brev'), ps: !!document.querySelector('.bps') })")
    await pg.click('#bOk'); await pg.wait_for_timeout(600)
    etter = await pg.evaluate("() => ({ wins: MORBIDIUM.meta.wins, merk: Merknad.har('utskrevet'), kort: !!document.getElementById('winc') })")
    sjekk('utskrivningsbrevet kommer før kortet, og utskrivningen gir merknad', brev == {'brev': True, 'ps': True} and etter == {'wins': 1, 'merk': True, 'kort': True}, [brev, etter])
    await pg.click('#dNew'); await pg.wait_for_timeout(600)
    har = await pg.query_selector('#inGjen')
    sjekk('innleggelsen tilbyr gjeninnleggelse etter første utskrivning', har is not None)
    if har:
        await pg.click('#inGjen'); await pg.click('[data-awk]'); await pg.wait_for_timeout(1500)
        g = await pg.evaluate("() => { const e = spawnEnemyBareTest('pleier', MORBIDIUM.player.x + 3, MORBIDIUM.player.z); return { gjen: MORBIDIUM.run.gjen, hp: Math.round(e.hp), valg: MORBIDIUM.meta.gjenValg }; }")
        sjekk('gjeninnleggelse gir sterkere fiender', g['gjen'] is True and g['valg'] is True and g['hp'] >= 54, g)
        sp = await pg.evaluate("() => { startFloor(1, false); rolig(); const s = Spor.liste[0]; if (!s) return null; const P = MORBIDIUM.player; P.x = s.x; P.z = s.z + .6; return { n: Spor.liste.length, navn: s.h.name, tekst: s.tekst }; }")
        await pg.wait_for_timeout(500)
        pr = await pg.evaluate("() => document.getElementById('prompt').textContent")
        sjekk('tidligere pasienter har rablet på gulvet, og rablingen kan leses', sp is not None and sp['n'] >= 1 and 'Les rablingen' in pr, [sp, pr])
    sjekk('ingen konsollfeil (merknader)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_14(b):
    # 14) byggeanimasjon og tips for nye pasienter
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await pg.goto(URL); await pg.wait_for_timeout(2000); await pg.evaluate("() => localStorage.clear()")
    await start_lop(pg)
    await pg.wait_for_timeout(1500)
    t1 = await pg.evaluate("() => ({ tips: !!document.querySelector('#tips.inn'), tekst: (document.querySelector('#tips') || {}).textContent || '' })")
    r = await pg.evaluate("""() => { const G = MORBIDIUM, P = G.player; P.hp = P.maxHp = 9999; const r = G.F.rooms.find(r => r.id !== G.F.startId && G.props.some(o => o.room === r.id && o.byggS));
          if (!r) return null; const f = G.props.filter(o => o.room === r.id && o.byggS).length; P.x = r.x + r.w / 2; P.z = r.z + r.h / 2; window.__rom = r.id; return { rom: r.id, skjult: f }; }""")
    await pg.wait_for_timeout(250)
    midt = await pg.evaluate("() => MORBIDIUM.props.filter(o => o.room === window.__rom && o.byggS).length")
    # animasjonen går i spilltid, og testnettleseren går langt under sanntid, så vi venter på at den blir ferdig (høyst 12 sekunder)
    etter = await pg.evaluate("""async () => { const G = MORBIDIUM, igjen = () => G.props.filter(o => o.room === window.__rom && o.byggS).length;
          for (let i = 0; i < 120 && igjen() > 0; i++) await new Promise(r => setTimeout(r, 100));
          return { igjen: igjen(), feil: G.props.filter(o => o.room === window.__rom && o.g.scale.y < .5 && !o.byggS && o.p.k !== 'drain').length }; }""")
    sjekk('møblene i et rom bygges opp når pasienten kommer inn', r is not None and r['skjult'] > 0 and etter == {'igjen': 0, 'feil': 0}, [r, midt, etter])
    sjekk('første tips vises som lapp', t1['tips'] and len(t1['tekst']) > 10, t1)
    await pg.evaluate("() => rolig()")
    await pg.mouse.move(1150, 360); await pg.wait_for_timeout(1600)
    await pg.keyboard.down('KeyA'); await pg.wait_for_timeout(500)
    gaar = await pg.evaluate("() => [MORBIDIUM.player.doll.view, MORBIDIUM.player.doll.flip]")
    await pg.mouse.move(1160, 380); await pg.wait_for_timeout(300)
    sikter = await pg.evaluate("() => [MORBIDIUM.player.doll.view, MORBIDIUM.player.doll.flip]")
    await pg.keyboard.up('KeyA')
    sjekk('figuren ser dit den går når musa ligger i ro, og mot musa når den brukes', gaar == ['s', -1] and sikter == ['s', 1], [gaar, sikter])
    sjekk('ingen konsollfeil (bygging og tips)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_16(b):
    # 16) 3D er standard: gamle lagringer slås over én gang, et nytt valg huskes, og kvaliteten går ned ett trinn om gangen til 3D slås av
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await pg.goto(URL3D); await pg.wait_for_timeout(2000)
    await pg.evaluate("() => { localStorage.clear(); localStorage.setItem('morbidium_meta_v2', JSON.stringify({ deaths: 1, settings: { d3: false, vol: .5 } })); }")
    await pg.reload(); await pg.wait_for_timeout(2000)
    m1 = await pg.evaluate("() => { const s = MORBIDIUM.meta.settings, a = { d3: s.d3, sv: s.sv, kvalitet: s.kvalitet }; s.d3 = false; saveMeta(); return a; }")
    await pg.reload(); await pg.wait_for_timeout(2000)
    m1['huskes'] = await pg.evaluate("() => MORBIDIUM.meta.settings.d3")
    sjekk('3D slås på for gamle lagringer, og et nytt valg om å slå det av huskes', m1 == {'d3': True, 'sv': 2, 'kvalitet': 0, 'huskes': False}, m1)
    await pg.evaluate("() => localStorage.clear()")
    await start_lop(pg, url=URL3D)
    q = await pg.evaluate("""async () => { rolig(); await new Promise(r => setTimeout(r, 600)); const s = MORBIDIUM.meta.settings, a = { d3: s.d3, on: D3.on, niva: D3.kval() };
          a.trinn = [D3.nedgrader(), D3.nedgrader(), D3.nedgrader()]; await new Promise(r => setTimeout(r, 300));
          a.etter = { d3: s.d3, on: D3.on, lagret: JSON.parse(localStorage.getItem('morbidium_meta_v2')).settings.d3 };
          s.kvAuto = null; s.d3 = true; applySettings(); await new Promise(r => setTimeout(r, 600));
          D3.tvingMaal = true; for (let i = 0; i < 45; i++) D3.maal(.1); D3.tvingMaal = false; a.maalt = D3.kval();
          s.kvalitet = 1; applySettings(); a.fast = D3.kval(); a.lavGlod = D3.Q().glod; s.kvalitet = 0; s.kvAuto = null; applySettings();
          s.lights = false; applySettings(); await new Promise(r => setTimeout(r, 400)); a.lysAv = { flat: !!D3.q.flat, lys: D3.pool.length, skygge: D3.mane.castShadow };
          s.lights = true; applySettings(); await new Promise(r => setTimeout(r, 400)); a.lysPaa = { flat: !!D3.q.flat, lys: D3.pool.length > 0, skygge: D3.mane.castShadow };
          return a; }""")
    sjekk('3D er på fra start, og kvaliteten går fra høy til middels til lav før 3D slås av og lagres av',
          q['d3'] and q['on'] and q['niva'] == 'hoy' and q['trinn'] == ['middels', 'lav', 'av'] and q['etter'] == {'d3': False, 'on': False, 'lagret': False}, q)
    sjekk('lav bildefrekvens måles og gir et trinn ned, og fast kvalitet i innstillingene overstyrer', q['maalt'] == 'middels' and q['fast'] == 'lav' and q['lavGlod'] is False, q)
    sjekk('«Lys og skygge» av gir jevnt lys i 3D uten punktlys og skygger, og på igjen gir dem tilbake', q['lysAv'] == {'flat': True, 'lys': 0, 'skygge': False} and q['lysPaa'] == {'flat': False, 'lys': True, 'skygge': True}, q)
    sjekk('ingen konsollfeil (3D som standard)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_23(b):
    # 23) fiendeindeksen i håndboka får plass også på smal skjerm
    pg = await ny_side(b, viewport={'width': 400, 'height': 800})
    await pg.goto(URL); await pg.wait_for_timeout(2000)
    await pg.evaluate("() => localStorage.clear()")
    await pg.click('#tHelp'); await pg.wait_for_timeout(300)
    smal = []
    for k in [8, 9]:
        await pg.click(f'[data-kap="{k}"]'); await pg.wait_for_timeout(150)
        for side in range(await pg.evaluate("(k) => hbSider(HANDBOK[k])", k)):
            if side: await pg.click('#hNext'); await pg.wait_for_timeout(150)
            smal.append(await pg.evaluate(HB_PLASS))
    await pg.screenshot(path='/tmp/e_10indeks_smal.png')
    forvent = await pg.evaluate("() => [8, 9].reduce((a, k) => a + Math.ceil(HANDBOK[k].indeks.length / 2), 0)")  # vokser når nye fiender kommer i indeksen
    sjekk('fiendeindeksen får plass på smal skjerm, to kort per side', len(smal) == forvent and forvent >= 16 and all(smal), (forvent, smal))
    sjekk('ingen konsollfeil (smal indeks)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_35(b):
    # 35) Testmodus: måleren, tallene per etasje, «Si din mening» og «Testrapport» i pausen, rapporten ved døden og innstillingene
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await pg.goto(URL); await pg.wait_for_timeout(2000); await pg.evaluate("() => localStorage.clear()")
    await start_lop(pg, url=URL + '&testmodus')
    ut = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), ut = {};
          const hud = document.getElementById('testHud'); ut.paa = Testmodus.paa(); ut.hud = !!hud && !hud.classList.contains('hidden');
          for (let i = 0; i < 60 && !(hud.textContent || '').includes('b/s'); i++) await vent(100); ut.hudTekst = hud.textContent.includes('b/s') && hud.textContent.includes('Lyder');
          for (const e of G.enemies) if (e.alive) killEntity(e, {});
          P.hp = P.maxHp = 100; P.invuln = 0; P.iframe = 0; hurt(P, 12, { type: 'pleier', x: P.x + 1, z: P.z }); await vent(300);
          P.hp -= 5; await vent(300); healPlayer(8); await vent(200);
          const T = G.run.test; ut.skade = Object.keys(T.etasjer[0].skade).sort(); ut.skadeOk = T.etasjer[0].skade.pleier > 0 && Math.abs(T.etasjer[0].skade.annet - 5) < .01; ut.hel = T.etasjer[0].hel;
          startFloor(3, false); await vent(300); ut.etasjer = T.etasjer.length; ut.forsteFerdig = !!T.etasjer[0].ferdig && T.etasjer[0].sek > 0;
          return ut; }""")
    sjekk('testmodus med ?testmodus: måleren viser bilder i sekundet og lydene', ut['paa'] and ut['hud'] and ut['hudTekst'], ut)
    sjekk('tallene per etasje: skade etter kilde (også den som ikke går gjennom treff), helse, og ny etasje avslutter den forrige', ut['skadeOk'] and ut['hel'] == 8 and ut['etasjer'] == 2 and ut['forsteFerdig'], ut)
    await pg.keyboard.press('Escape'); await pg.wait_for_timeout(500)
    pause = await pg.evaluate("() => !!document.getElementById('pMening') && !!document.getElementById('pRapport')")
    await pg.click('#pMening'); await pg.wait_for_timeout(300)
    await pg.click('[data-m="slag"][data-i="2"]'); await pg.click('[data-m="musikk"][data-i="1"]'); await pg.click('[data-m="musikk"][data-i="1"]')
    await pg.click('[data-tf="spill"]'); await pg.wait_for_timeout(200); await pg.click('[data-m="vansk"][data-i="0"]')
    await pg.click('[data-tf="rapport"]'); await pg.wait_for_timeout(200); await pg.fill('#mFri', 'Kråkene er for mange.')
    r = await pg.evaluate("""() => { const t = document.getElementById('trTekst').value, T = MORBIDIUM.run.test;
          return { mening: T.mening, fri: T.fritekst, tekst: t.startsWith('MORBIDIUM TESTRAPPORT') && t.includes('Versjon:') && t.includes('Enhet:') && t.includes('Slagene og treffene: For høye') && t.includes('Vanskeligheten: For lett') && !t.includes('Musikken mot lydene') && t.includes('Kråkene er for mange.') && t.includes('pleier') }; }""")
    await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300)
    esc_ = await pg.evaluate("() => ({ apen: Testmodus.apen, pause: MORBIDIUM.state === 'panel' && !!document.getElementById('pMening') })")
    sjekk('«Si din mening» og «Testrapport» i pausen: svar med knapper (og angre), fritekst, og alt kommer med i rapporten', pause and r['mening'] == {'slag': 2, 'vansk': 0} and r['fri'] == 'Kråkene er for mange.' and r['tekst'], [pause, r])
    sjekk('Escape lukker panelet, men ikke pausen under', not esc_['apen'] and esc_['pause'], esc_)
    await pg.evaluate("() => { closePanel(); const P = MORBIDIUM.player; P.invuln = 0; P.iframe = 0; hurt(P, 9999, { type: 'kultist', x: P.x, z: P.z }); }")
    d = await pg.evaluate("""async () => { for (let i = 0; i < 80 && !document.getElementById('dTest'); i++) await new Promise(r => setTimeout(r, 100));
          const L = MORBIDIUM.meta.testrapporter || []; return { knapp: !!document.getElementById('dTest'), lagret: L.length, slutt: L.length && L[0].tekst.includes('Slutt: døde i etasje 3') && L[0].tekst.includes('Kråkene er for mange.') }; }""")
    await pg.click('#dTest'); await pg.wait_for_timeout(300)
    d['panel'] = await pg.evaluate("() => Testmodus.apen && Testmodus.fane === 'rapport' && document.getElementById('trTekst').value.includes('Slutt: døde')")
    await pg.click('#tLukk'); await pg.wait_for_timeout(200)
    sjekk('døden lagrer rapporten, og dødsskjermen får en knapp til den', d['knapp'] and d['lagret'] == 1 and d['slutt'] and d['panel'], d)
    await pg.evaluate("() => openSettings(false, null, 'data')"); await pg.wait_for_timeout(300)
    s = await pg.evaluate("() => ({ sist: !!document.getElementById('dTestSist') && !document.getElementById('dTestSist').disabled })")
    await pg.evaluate("() => { MORBIDIUM.meta.settings.testmodus = false; applySettings(); }")
    s['av'] = await pg.evaluate("() => { const h = document.getElementById('testHud'); return (!h || h.classList.contains('hidden')) && !Testmodus.paa(); }")
    sjekk('de lagrede rapportene kan kopieres fra Data-fanen, og testmodus kan slås av', s['sist'] and s['av'], s)
    await pg.screenshot(path='/tmp/e_21testmodus.png')
    sjekk('ingen konsollfeil (testmodus)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_41(b):
    # 41) Kontroller i menyene: A, B, retningene, LB og RB på tittelen, i innleggelsen, pausen, innstillingene, journalen, butikken
    #     og dødsskjermen, piltastene i menyene, tastene i tekstene etter enheten, berøringsknappene skjules, og kontrollen på plass 1 styrer
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await pg.add_init_script("""(() => {
          window.__pad = { id: 'Testkontroll (STANDARD GAMEPAD)', index: 0, connected: true, mapping: 'standard', timestamp: 0, axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) };
          window.__pads = () => [window.__pad];
          Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => window.__pads() });
          window.__ramme = n => new Promise(r => { const f = () => --n <= 0 ? r() : requestAnimationFrame(f); requestAnimationFrame(f); });
          window.__trykk = async (i, ned = 3, opp = 3) => { const k = window.__pad.buttons[i]; k.pressed = true; k.value = 1; await window.__ramme(ned); k.pressed = false; k.value = 0; await window.__ramme(opp); };
        })()""")
    await pg.goto(URL); await pg.wait_for_timeout(2000); await pg.evaluate("() => localStorage.clear()")
    await pg.goto(URL)
    await pg.wait_for_function("() => window.MORBIDIUM && MORBIDIUM.state === 'title' && document.activeElement && document.activeElement.id === 'tNew'", timeout=30000)
    t1 = await pg.evaluate("""async () => { await __trykk(0); await __ramme(2); const f = document.activeElement, cs = getComputedStyle(f);
          return { inntak: MORBIDIUM.state === 'panel' && !!document.querySelector('#panel .intake'), fokus: f.hasAttribute('data-awk'), ring: cs.outlineStyle === 'solid' && parseFloat(cs.outlineWidth) >= 2.5, pad: document.body.classList.contains('pad'), enhet: Input.lastDevice }; }""")
    sjekk('håndkontrollen på tittelen: A trykker Ny pasient, og innleggelsen har fokus med synlig ring', t1 == {'inntak': True, 'fokus': True, 'ring': True, 'pad': True, 'enhet': 'pad'}, t1)
    await pg.evaluate("() => __trykk(0)")
    await pg.wait_for_function("() => MORBIDIUM.state === 'play' && MORBIDIUM.time > .3", timeout=30000)
    hud = await pg.evaluate("async () => { rolig(); await __ramme(3); return [...document.querySelectorAll('#cards .acard .k')].map(e => e.textContent).join(' '); }")
    sjekk('A i innleggelsen legger inn pasienten, og evnekortene viser LB RB LT RT', hud == 'LB RB LT RT', hud)
    # pausen og innstillingene: Start, pil ned til Innstillinger, A, RB bytter fane, pil ned til spaken, pil høyre og venstre endrer den.
    # Neste spak etter Kameraavstand er Kameravinkel (28.9.)
    ps = await pg.evaluate("""async () => { const G = MORBIDIUM, ut = {}; await __trykk(9); await __ramme(2);
          ut.pause = G.state === 'panel' && !!document.querySelector('#panel .clip'); ut.forste = document.activeElement.hasAttribute('data-close');
          await __trykk(13); ut.ned = document.activeElement.id;
          for (let i = 0; i < 8 && document.activeElement.id !== 'pS'; i++) await __trykk(13);
          await __trykk(0); await __ramme(2); ut.inn = !!document.getElementById('settings') && document.activeElement.dataset.tab === 'lyd';
          await __trykk(5); await __ramme(2); const on = document.querySelector('.ktab.on'); ut.fane = on.dataset.tab; ut.fanefokus = document.activeElement === on;
          await __trykk(13); const sp = document.activeElement, k = sp.dataset.s, v0 = G.meta.settings[k]; ut.spak = k;
          await __trykk(15); ut.opp = +(G.meta.settings[k] - v0).toFixed(3);
          await __trykk(14); ut.ned2 = +(G.meta.settings[k] - v0).toFixed(3);
          await __trykk(13); ut.neste = document.activeElement.dataset.s; await __trykk(12); await __trykk(12); ut.oppTilFane = document.activeElement.dataset.tab;
          return ut; }""")
    await pg.screenshot(path='/tmp/e_pad_meny.png')
    ps.update(await pg.evaluate("""async () => { const G = MORBIDIUM, ut = {}; await __trykk(4); await __ramme(2); ut.lb = document.querySelector('.ktab.on').dataset.tab;
          await __trykk(1); await __ramme(2); ut.tilbake = !!document.querySelector('#panel .clip'); await __trykk(1); await __ramme(2); ut.ute = G.state; return ut; }"""))
    sjekk('pausen og innstillingene med håndkontroll: pil ned, A, RB og LB bytter fane, spaken endres med pil høyre og venstre, B går tilbake',
          ps == {'pause': True, 'forste': True, 'ned': 'pJ', 'inn': True, 'fane': 'bilde', 'fanefokus': True, 'spak': 'kamera', 'opp': .05, 'ned2': 0, 'neste': 'vinkel', 'oppTilFane': 'bilde', 'lb': 'lyd', 'tilbake': True, 'ute': 'play'}, ps)
    # journalen: Select åpner, A velger et kort, retningene flytter fokus, A på en tom plass flytter kortet dit og så til lomma, RB og LB bytter fane, B slipper kortet og lukker
    jr = await pg.evaluate("""async () => { const G = MORBIDIUM, run = G.run, ut = {};
          run.slots = [null, null, null, null]; run.reserve = []; giveCard('due', true); const fra = run.slots.findIndex(Boolean), til = run.slots.findIndex(c => !c);
          await __trykk(8); await __ramme(2); ut.aapen = G.state === 'journal' && document.activeElement.matches('.jcard[data-ref]');
          document.querySelector('.jcard[data-ref="s"][data-i="' + fra + '"]').focus(); await __trykk(0); ut.valgt = !!G.jsel && !!document.querySelector('#journal .jcard.sel');
          const sett = new Set(); for (const d of [15, 13, 14, 12]) { await __trykk(d); if (document.getElementById('journal').contains(document.activeElement)) sett.add(document.activeElement); }
          ut.flyttet = sett.size >= 2;
          document.querySelector('.slot.empty[data-slot="' + til + '"]').focus(); await __trykk(0);
          const f = document.activeElement; ut.flytt = !run.slots[fra] && !!run.slots[til] && run.slots[til].id === 'due'; ut.fokus = f.classList.contains('jcard') && f.dataset.ref === 's' && +f.dataset.i === til;
          f.focus(); await __trykk(0); document.querySelector('.pocket [data-lomme]').focus(); await __trykk(0);
          ut.lomme = run.reserve.length === 1 && run.reserve[0].id === 'due' && !run.slots.some(Boolean) && !!document.activeElement.dataset.lomme;
          await __trykk(5); ut.rb = G.jtab; await __trykk(4); await __trykk(4); ut.lb = G.jtab; await __trykk(5);
          document.querySelector('.jcard[data-ref]').focus(); await __trykk(0); const v = !!G.jsel; await __trykk(1); ut.slipp = v && !G.jsel && G.state === 'journal';
          ut.knapp = document.getElementById('jClose').textContent; await __trykk(1); await __ramme(2); ut.lukket = G.state === 'play'; return ut; }""")
    sjekk('journalen med håndkontroll: A og A flytter et kort til en tom plass, retningene, RB og LB, og B slipper kortet og lukker',
          jr == {'aapen': True, 'valgt': True, 'flyttet': True, 'flytt': True, 'fokus': True, 'lomme': True, 'rb': 'diagnoser', 'lb': 'utstyr', 'slipp': True, 'knapp': 'Lukk journalen (B)', 'lukket': True}, jr)
    # butikken: knappen sier B, og B lukker
    sh = await pg.evaluate("""async () => { const G = MORBIDIUM; openService('kafeteria'); await __ramme(2); const ut = { knapp: document.querySelector('#panel [data-close]').textContent, fokus: document.activeElement.classList.contains('offer') };
          await __trykk(1); await __ramme(2); ut.ute = G.state; return ut; }""")
    sjekk('butikken med håndkontroll: Gå (B), første vare har fokus, og B lukker', sh == {'knapp': 'Gå (B)', 'fokus': True, 'ute': 'play'}, sh)
    # piltastene i pausen, og tekstene går tilbake til tastaturet
    await pg.keyboard.press('Escape'); await pg.wait_for_function("() => MORBIDIUM.state === 'panel' && !!document.querySelector('#panel .clip')", timeout=20000)
    await pg.wait_for_timeout(200)
    await pg.keyboard.press('ArrowDown'); await pg.keyboard.press('ArrowDown')
    kb = await pg.evaluate("() => ({ fokus: document.activeElement.id, pad: document.body.classList.contains('pad') })")
    await pg.keyboard.press('Escape'); await pg.wait_for_function("() => MORBIDIUM.state === 'play'", timeout=20000)
    kb['kort'] = await pg.evaluate("async () => { await __ramme(3); return [...document.querySelectorAll('#cards .acard .k')].map(e => e.textContent).join(' '); }")
    sjekk('piltastene flytter fokus i pausen, og tastaturet tar bort ringen og gir tallene tilbake', kb == {'fokus': 'pJ', 'pad': False, 'kort': '1 2 3 4'}, kb)
    # berøringsknappene skjules når håndkontrollen brukes (telefon speilet til TV med kontroll), og en kontroll på plass 1 styrer pasienten
    mv = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, ut = {};
          Input.touch.active = true; document.getElementById('touch').classList.remove('hidden'); document.body.classList.add('touch'); Input.enhet('touch');
          __pad.axes[0] = .9; await __ramme(2); __pad.axes[0] = 0; await __ramme(2);
          ut.touch = { skjult: document.getElementById('touch').classList.contains('hidden'), body: document.body.classList.contains('touch'), aktiv: Input.touch.active, pad: document.body.classList.contains('pad') };
          const r = G.F.rooms[G.F.startId]; P.x = r.x + r.w / 2; P.z = r.z + r.h / 2; __pad.index = 1; window.__pads = () => [null, __pad]; __pad.axes[0] = 1;
          const x0 = P.x, t0 = G.time; for (let i = 0; i < 600 && G.time < t0 + .4; i++) await __ramme(1); __pad.axes[0] = 0;
          ut.dx = P.x - x0 > .5; ut.index = Input.gp.index;
          window.__pads = () => [{ id: 'noe annet', index: 0, connected: true, mapping: '', timestamp: 0, axes: [0, 0], buttons: [] }, __pad]; await __ramme(2); ut.standard = Input.gp.index === 1 && Input.gp.mapping === 'standard';
          window.__pads = () => []; dispatchEvent(new Event('gamepaddisconnected')); await __ramme(2);
          ut.frakoblet = !Input.gp.connected && Input.lastDevice === 'kb' && !document.body.classList.contains('pad');
          __pad.index = 0; window.__pads = () => [__pad]; return ut; }""")
    sjekk('håndkontrollen skjuler berøringsknappene, en kontroll på plass 1 styrer pasienten, standardoppsettet velges, og frakobling rydder',
          mv == {'touch': {'skjult': True, 'body': False, 'aktiv': False, 'pad': True}, 'dx': True, 'index': 1, 'standard': True, 'frakoblet': True}, mv)
    # døden: en A som holdes gjennom dødsfallet trykker ikke på Ny pasient det første halve sekundet, så gjør A det
    await pg.evaluate("() => { __pad.buttons[0].pressed = true; __pad.buttons[0].value = 1; const P = MORBIDIUM.player; P.invuln = 0; P.iframe = 0; hurt(P, 9999, { type: 'kultist' }); }")
    await pg.wait_for_function("() => MORBIDIUM.state === 'dead' && !!document.getElementById('dNew')", timeout=30000)
    dd = await pg.evaluate("""async () => { const G = MORBIDIUM, ut = { vakt: MenyNav.ro > 0, fokus: document.activeElement.id };
          __pad.buttons[0].pressed = false; __pad.buttons[0].value = 0; await __ramme(1); await __trykk(0, 1, 1); ut.blokkert = G.state === 'dead';
          await __trykk(15); ut.hoyre = document.activeElement.id; await __trykk(14); ut.venstre = document.activeElement.id;
          for (let i = 0; i < 400 && MenyNav.ro > 0; i++) await __ramme(1);
          await __trykk(0); await __ramme(2); ut.inntak = G.state === 'panel' && !!document.querySelector('#panel .intake'); return ut; }""")
    await pg.evaluate("() => __trykk(0)")
    await pg.wait_for_function("() => MORBIDIUM.state === 'play' && MORBIDIUM.time > .2", timeout=30000)
    dd['nytt'] = await pg.evaluate("() => MORBIDIUM.player.alive && MORBIDIUM.player.hp > 0")
    sjekk('døden med håndkontroll: A holdt gjennom dødsfallet trykker ikke, retningene flytter, og A på Ny pasient legger inn en ny pasient',
          dd == {'vakt': True, 'fokus': 'dNew', 'blokkert': True, 'hoyre': 'dTitle', 'venstre': 'dNew', 'inntak': True, 'nytt': True}, dd)
    sjekk('ingen konsollfeil (kontroller i menyene)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_45(b):
    # 45) Tekster og stempler
    #     Flytende tekster legger seg ikke oppå hverandre eller over snakkebobler (IKKE I DAG, BONK og bom i 6.png), sju like ord
    #     blir ett med ×7, «bom» forsvinner når den perfekte unnvikelsen har sitt eget ord, høyst tre store ord lever samtidig,
    #     og det store stempelet, kombostempelet og lappen står under hverandre og i kø. PC (1280x720) og liggende telefon (844x390).
    HJELP45 = """const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), ramme = n => new Promise(r => { const f = () => --n <= 0 ? r() : requestAnimationFrame(f); requestAnimationFrame(f); }), ut = {};
          const rute = e => { const b = e.getBoundingClientRect(); return { s: e.id || e.textContent, x0: b.left, y0: b.top, x1: b.right, y1: b.bottom }; };
          const tekster = () => [...document.querySelectorAll('#fx .dmg')].filter(e => getComputedStyle(e).display !== 'none').map(rute);
          const kryss = L => { const p = []; for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) { const a = L[i], c = L[j]; if (a.x0 < c.x1 - 1 && c.x0 < a.x1 - 1 && a.y0 < c.y1 - 1 && c.y0 < a.y1 - 1) p.push(a.s + ' / ' + c.s); } return p; };
          const inni = L => L.every(a => a.x0 >= -1 && a.y0 >= -1 && a.x1 <= innerWidth + 1 && a.y1 <= innerHeight + 1), kort = L => L.map(a => [a.s, Math.round(a.x0), Math.round(a.y0), Math.round(a.x1), Math.round(a.y1)]);
          const klar = async () => { rolig(); G.meta.settings.tips = false; P.hp = P.maxHp = 9999; P.roll = P.iframe = P.invuln = 0; const r = G.F.rooms.find(r => r.role === 'combat') || G.F.rooms[0]; P.x = r.x + r.w / 2; P.z = r.z + r.h / 2; await ramme(4); FX.clear(); };"""
    TRE45 = """async () => { """ + HJELP45 + """
          await klar(); FX.text(P.x, 2.7, P.z, 'IKKE I DAG', 'crit', 4); FX.text(P.x + .3, 2.6, P.z, 'BONK', 'crit', 4); FX.text(P.x, 1.6, P.z, 'bom', 'info', 4);
          await ramme(20); const L = tekster(); return { n: L.length, kryss: kryss(L), inni: inni(L), transform: [...document.querySelectorAll('#fx .dmg')].every(e => e.style.transform.startsWith('translate3d') && !e.style.left), L: kort(L) }; }"""
    TEKST45 = """async () => { """ + HJELP45 + """
          await klar(); ut.tre = await (""" + TRE45 + """)();
          // sju AVSLÅTT på ett bilde blir én tekst
          FX.clear(); for (let i = 0; i < 7; i++) FX.text(P.x + (i % 3) * .2, 1.6, P.z, 'AVSLÅTT', 'stamp', 1);
          await ramme(2); ut.sju = [...document.querySelectorAll('#fx .dmg')].filter(e => e.textContent.startsWith('AVSLÅTT')).map(e => e.textContent);
          // perfekt unnvikelse: ordet til kunngjøreren, og ingen «bom» fra den samme unnvikelsen
          FX.clear(); const n0 = Kombo.tall.perfekt, PERF = ['PÅ HÅRET', 'UNNSLUPPET', 'IKKE I DAG', 'FOR SENT, DOKTOR'];
          Kombo.perfektT = 0; P.invuln = 0; P.roll = .3; P.iframe = .3; hurt(P, 3, { type: 'test' }); await ramme(2);
          let ord = [...document.querySelectorAll('#fx .dmg')].map(e => e.textContent); ut.perfekt = { ord, kjort: Kombo.tall.perfekt === n0 + 1, bom: ord.some(s => s.startsWith('bom')), ordet: ord.some(s => PERF.includes(s)) };
          // mens kunngjøreren hviler (2,2 s), er «bom» det eneste ordet, og da blir det stående
          P.invuln = 0; P.roll = .3; P.iframe = .3; hurt(P, 3, { type: 'test' }); await ramme(1); ut.perfekt.bomIgjen = [...document.querySelectorAll('#fx .dmg')].some(e => e.textContent.startsWith('bom')); P.roll = P.iframe = 0;
          // høyst tre store ord: de to eldste av fem blekner og blir borte, de tre nyeste står
          FX.clear(); for (let i = 0; i < 5; i++) FX.text(P.x - 3 + i * 1.5, 2.4, P.z + (i % 2) * 2.5, 'ORD ' + i, 'crit', 4);
          for (let i = 0; i < 90 && document.querySelectorAll('#fx .dmg.crit').length > 3; i++) await ramme(1);
          ut.tak = [...document.querySelectorAll('#fx .dmg.crit')].map(e => e.textContent);
          // tall som er skjult (Vis tall av), tar ikke plass fra en info-tekst på samme sted
          FX.clear(); document.body.classList.add('uten-tall'); FX.text(P.x, 1.6, P.z, '12', '', 3); FX.text(P.x, 1.6, P.z, 'Benektet', 'info', 3); await ramme(3);
          const inf = FX.items.find(it => it.str === 'Benektet'); ut.utenTall = !!inf && Math.abs(inf.mx) < 1 && Math.abs(inf.my) < 1; document.body.classList.remove('uten-tall');
          // en tekst legger seg ikke over en snakkeboble
          FX.clear(); FX.bubble(P, 'Jeg har det helt fint, takk.', 4); FX.text(P.x, P.bubbleH, P.z, 'HER', 'crit', 4); await ramme(8);
          const bob = [...document.querySelectorAll('#fx .bubble')].map(rute), her = tekster().filter(a => a.s === 'HER'); ut.boble = { kryss: kryss(bob.concat(her)), n: bob.length + her.length };
          FX.clear(); return ut; }"""
    STEMPEL45 = """async () => { """ + HJELP45 + """
          const $ = id => document.getElementById(id), k = $('kstempel'), b = $('bigstamp'), t = $('toast'), borte = async () => { for (let i = 0; i < 120 && (b.classList.contains('on') || k.classList.contains('on') || Stempel.ko.length); i++) await vent(50); };
          await klar(); await borte();
          // alle tre på en gang: det store stempelet, kombostempelet og lappen står under hverandre (målt når kombostempelet har landet)
          stampBig('RYDDET', 'Rommet er friskmeldt'); Kombo.stempel('KIRURGISK', '20 treff på rad'); toast('Test', 'Lappen'); ut.lappStraks = t.textContent === 'TestLappen';
          for (let i = 0; i < 80; i++) { if (k.getAnimations().every(a => a.currentTime >= 350) && !b.getAnimations().length) break; await vent(25); }
          const S = [t, k, b].map(rute), kt = $('cards').getBoundingClientRect().top; ut.tre = { kryss: kryss(S), inni: inni(S), lav: t.classList.contains('lav'), overKort: S.every(a => a.y1 <= kt + 1), kortTopp: Math.round(kt), S: kort(S) };
          // køen: RYDDET står, DIAGNOSE venter til RYDDET har stått i 0,7 sekunder
          await borte(); const t0 = performance.now(); stampBig('RYDDET'); stampBig('DIAGNOSE', 'Hypokondri'); const straks = b.textContent;
          for (let i = 0; i < 400 && !b.textContent.startsWith('DIAGNOSE'); i++) await vent(20);
          const t1 = performance.now(), diag = b.textContent; for (let i = 0; i < 400 && b.classList.contains('on'); i++) await vent(20);
          ut.ko = { straks, diag, ryddet: Math.round(t1 - t0), diagnose: Math.round(performance.now() - t1) };
          // like stempler hoppes over, og høyst tre venter
          await borte(); stampBig('A'); stampBig('B'); stampBig('B'); stampBig('C'); stampBig('A'); stampBig('D'); stampBig('E'); ut.koen = Stempel.ko.map(q => q[0]);
          await borte(); toast('Uten stempel', ''); ut.lappOppe = !t.classList.contains('lav') && !t.style.top;
          return ut; }"""
    UA45 = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    for navn, kw in (('PC', {'viewport': {'width': 1280, 'height': 720}}), ('liggende telefon', {'viewport': {'width': 844, 'height': 390}, 'has_touch': True, 'is_mobile': True, 'device_scale_factor': 2, 'user_agent': UA45})):
        pg = await ny_side(b, **kw)
        await start_lop(pg)
        tk = await pg.evaluate(TEKST45)
        tre = tk['tre']
        sjekk(f'{navn}: IKKE I DAG, BONK og bom på samme sted legger seg ved siden av hverandre, innenfor skjermen og med transform', tre['n'] == 3 and not tre['kryss'] and tre['inni'] and tre['transform'], tre)
        sjekk(f'{navn}: sju AVSLÅTT på ett bilde blir én tekst, «AVSLÅTT ×7»', tk['sju'] == ['AVSLÅTT ×7'], tk['sju'])
        sjekk(f'{navn}: perfekt unnvikelse viser kunngjørerens ord uten «bom», og «bom» står når kunngjøreren hviler', tk['perfekt']['kjort'] and tk['perfekt']['ordet'] and not tk['perfekt']['bom'] and tk['perfekt']['bomIgjen'], tk['perfekt'])
        sjekk(f'{navn}: høyst tre store ord samtidig, og det er de nyeste som står', tk['tak'] == ['ORD 2', 'ORD 3', 'ORD 4'], tk['tak'])
        sjekk(f'{navn}: skjulte tall tar ikke plass, og en tekst legger seg ikke over en snakkeboble', tk['utenTall'] and tk['boble']['n'] == 2 and not tk['boble']['kryss'], (tk['utenTall'], tk['boble']))
        if navn == 'PC':
            await pg.evaluate(TRE45); await pg.screenshot(path='/tmp/e_45_tekst.png')
        st = await pg.evaluate(STEMPEL45)
        sjekk(f'{navn}: det store stempelet, kombostempelet og lappen står under hverandre uten å overlappe og over evnekortene, og lappen får teksten med en gang', st['lappStraks'] and not st['tre']['kryss'] and st['tre']['inni'] and st['tre']['lav'] and st['tre']['overKort'], st['tre'])
        ko = st['ko']
        sjekk(f'{navn}: et nytt stort stempel venter til det forrige har stått i 0,7 sekunder, og står selv minst like lenge', ko['straks'] == 'RYDDET' and ko['diag'] == 'DIAGNOSEHypokondri' and 680 <= ko['ryddet'] < 8000 and ko['diagnose'] >= 700, ko)
        sjekk(f'{navn}: like stempler hoppes over, høyst tre venter, og lappen er tilbake oppe når stemplene er borte', st['koen'] == ['B', 'C', 'D'] and st['lappOppe'], (st['koen'], st['lappOppe']))
        sjekk(f'ingen konsollfeil (tekster og stempler, {navn})', not pg.errs, pg.errs[:6])
        await pg.close()
    # og en gang i 3D
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg, url=URL3D)
    tre = await pg.evaluate(TRE45)
    sjekk('3D: IKKE I DAG, BONK og bom legger seg ved siden av hverandre', tre['n'] == 3 and not tre['kryss'] and tre['inni'], tre)
    sjekk('ingen konsollfeil (tekster og stempler i 3D)', not pg.errs, pg.errs[:6])
    await pg.close()


DELER = {1: del_1, 11: del_11, 13: del_13, 14: del_14, 16: del_16, 23: del_23, 35: del_35, 41: del_41, 45: del_45}
