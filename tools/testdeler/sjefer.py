"""Sjefene: alle angrep, puljen, Oldermann Nålepute og Kraken.

Testdeler fra test_ekstra.py. Kjøres med python3 tools/test_ekstra.py --system sjefer eller --del N.
"""
from .felles import sjekk, ny_side, start_lop, URL, URL3D, HB_PLASS


async def del_4(b):
    # 4) alle fire sjefer med alle angrep, og rommene i Isolat og arkiv
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg)
    # sjefene trekkes tilfeldig per løp, så her velges hver av dem med vilje, også Den Store Klumpen
    for depth, sjef in [(1, 'krok'), (2, 'rust'), (4, 'arkivar'), (3, 'klumpen'), (1, 'hekk'), (5, 'hjort'), (6, 'journalen')]:
        info = await pg.evaluate("""([d, s]) => { const G = MORBIDIUM; G.player.hp = G.player.maxHp = 9999; G.run.sjefer[d] = s; startFloor(d, false); const r = G.F.rooms[G.F.bossId]; G.player.x = r.x + r.w / 2; G.player.z = r.z + r.h - 2; return { theme: G.th.name, tpl: G.F.rooms.map(r => r.template) }; }""", [depth, sjef])
        if depth == 4:
            sjekk('Isolat og arkiv har egne rom', 'isolat' in info['tpl'] or 'kartotek' in info['tpl'], info['tpl'])
            await pg.evaluate("""() => { const G = MORBIDIUM, r = G.F.rooms.find(r => r.template === 'kartotek') || G.F.rooms.find(r => r.template === 'isolat'); if (r) { G.player.x = r.x + r.w / 2; G.player.z = r.z + r.h / 2; G.rooms[r.id].cleared = true; } }""")
            await pg.wait_for_timeout(1200); await pg.screenshot(path='/tmp/e_5arkiv.png')
            await pg.evaluate("""() => { const G = MORBIDIUM, r = G.F.rooms.find(r => r.template === 'isolat'); if (r) { G.player.x = r.x + r.w / 2; G.player.z = r.z + r.h / 2; G.rooms[r.id].cleared = true; } }""")
            await pg.wait_for_timeout(1000); await pg.screenshot(path='/tmp/e_6isolat.png')
            await pg.evaluate("""() => { const G = MORBIDIUM, r = G.F.rooms[G.F.bossId]; G.player.x = r.x + r.w / 2; G.player.z = r.z + r.h - 2; }""")
        # sjefen kommer når pasienten er i rommet, og inngangen tar 2,6 sekunder spilltid: testklokka spoler fram til den er over
        # (i vanlig tid går spillet saktere på en travel maskin)
        await pg.evaluate("() => Klokke.til(() => MORBIDIUM.boss && MORBIDIUM.boss.state !== 'intro', 8)")
        bnavn = await pg.evaluate("() => MORBIDIUM.boss && MORBIDIUM.boss.type")
        sjekk(f'{sjef} er sjef i etasje {depth}', bnavn == sjef, bnavn)
        kinds = await pg.evaluate("() => MORBIDIUM.boss ? [...new Set(MORBIDIUM.boss.B0.attacks)] : []")
        for k in kinds:
            await pg.evaluate("(k) => { const B = MORBIDIUM.boss, P = MORBIDIUM.player; if (!B) return; B.state = 'chase'; B.cd = 99; P.hp = P.maxHp; bossAttackTest(B, k); }", k)
            await pg.evaluate("() => Klokke.spol(1.7)")
            await pg.wait_for_timeout(150)
            if (depth, k) in [(4, 'isolate'), (6, 'pages'), (2, 'flood'), (1, 'hookpull'), (3, 'rull'), (1, 'hekkring'), (5, 'maane')]:
                await pg.screenshot(path=f'/tmp/e_7sjef_{depth}_{k}.png')
        # et angrep kan ha sjefen under vann eller midt i en tale (fasen «monolog»): spol til han er i kamp og kan treffes
        await pg.evaluate("() => { const B = MORBIDIUM.boss; if (!B) return; Klokke.til(() => !B.alive || (B.phase === 'fight' && B.state !== 'intro' && !B.dukket), 8); hurt(B, 99999, { from: 'player' }); }")
        # luken åpnes med en vanlig setTimeout 1,4 sekunder etter at sjefen døde, så her ventes det i vanlig tid, med tak
        try: await pg.wait_for_function("() => !!MORBIDIUM.trapdoor", timeout=15000)
        except Exception: pass
        sjekk(f'luken åpner seg etter {sjef} i etasje {depth}', await pg.evaluate("() => !!MORBIDIUM.trapdoor"))
    sjekk('ingen konsollfeil (sjefer)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_21(b):
    # 21) sjefene trekkes fra frøet: samme frø gir samme sjefer, ulike frø gir variasjon, og Journalen er alltid sist
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await pg.goto(URL); await pg.wait_for_timeout(2000)
    tr = await pg.evaluate("""() => { const a = JSON.stringify(trekkSjefer(4242)) === JSON.stringify(trekkSjefer(4242)), sett = new Set(), alle = new Set(); let sist = true;
          for (let s = 1; s < 80; s++) { const t = trekkSjefer(s), fem = [1, 2, 3, 4, 5].map(d => t[d]); sett.add(fem.join()); fem.forEach(x => alle.add(x)); sist = sist && t[MAX_DEPTH] === 'journalen' && new Set(fem).size === Math.min(5, SJEF_PULJE.length) && fem.every(x => SJEF_PULJE.includes(x)); }
          return { lik: a, varianter: sett.size, alle: [...alle].sort(), pulje: SJEF_PULJE.slice().sort(), sist, dybde: MAX_DEPTH }; }""")
    sjekk('sjefene i etasje 1 til 5 trekkes fra frøet, hele puljen dukker opp, og Journalen er alltid nederst i etasje 6', tr['lik'] and tr['varianter'] >= 10 and tr['alle'] == tr['pulje'] and tr['sist'] and tr['dybde'] == 6, tr)
    lagret = await pg.evaluate("() => { Merknad.onBoss({ type: 'klumpen' }); return (JSON.parse(localStorage.getItem('morbidium_meta_v2')).sjefDrap || {}).klumpen; }")
    sjekk('en slått sjef lagres med en gang (til fiendeindeksen)', lagret == 1, lagret)
    sjekk('ingen konsollfeil (sjefpulje)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_62(b):
    # 62) Oldermann Nålepute: minisjefen leser opp dagsorden i boblen og gjør sakene i den rekkefølgen han sa, med klubbeslag mellom,
    #     hver sak for seg (nåler, kjettinger som drar, klubba, votering med tak på lærlinger, eventuelt), årsmøtet ved halv helse,
    #     aldri i parken, fiendeindeksen, Enkel grafikk og én runde i 3D
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg)
    om = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), ut = {},
            til = async (f, t = 4) => { if (!f()) Klokke.til(() => { prov(); return f(); }, t); return !!f(); },
            spill = async t => { Klokke.spol(t, { til: prov }); };
          if (typeof Oldermann !== 'object' || !ENEMIES.oldermann) return { mangler: true };
          startFloor(4, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } rolig(); P.hp = P.maxHp = 1e6; P.invuln = 0;
          const r = G.F.rooms.find(r => r.role === 'combat' && r.w >= 10 && r.h >= 8) || G.F.rooms.find(r => r.role === 'combat') || G.F.rooms[0];
          const midt = () => { P.x = r.x + r.w / 2 + .5; P.z = r.z + r.h / 2 + .5; }; midt();
          // det som blir sagt: boblene hans (teksten slik den står), tall og ord over hodene (#fx .dmg), lydene, og varslene han legger
          const bobler = [], tall = [], lyder = [], teleSett = new Set(); let samle = true;
          const _b = Oldermann.boble; Oldermann.boble = function (e) { const el = _b.apply(Oldermann, arguments); bobler.push({ t: G.time, tekst: el ? [...el.children].map(d => d.textContent) : [], ref: e.referat.length }); return el; };
          const mo = new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.classList && n.classList.contains('dmg')) tall.push(n.textContent); }); mo.observe(document.getElementById('fx'), { childList: true });
          const _sp = Sound.play; Sound.play = function (n) { lyder.push(n); return _sp.apply(Sound, arguments); };
          (async () => { while (samle) { for (const t of G.tele) if (t.owner && t.owner.type === 'oldermann') teleSett.add(t); await vent(15); } })();
          // testklokka spoler uten å slippe til løkka over, så varslene (og kjettingene) samles også i hvert steg den tar
          const prover = [() => { for (const t of G.tele) if (t.owner && t.owner.type === 'oldermann') teleSett.add(t); }], prov = () => { for (const f of prover) f(); return false; };
          const varsler = () => [...teleSett].map(t => ({ shape: t.shape, r: t.o.r, w: t.o.w, len: t.o.len, type: t.o.type }));
          // det han faktisk gjør (angrepet som kjøres), ikke bare det referatet sier
          const gjort = [], FN = { naaler: 'naal', kjeder: 'kjede', klubba: 'klubbe', votering: 'votering' }, _fn = {};
          for (const f in FN) { _fn[f] = Oldermann[f]; Oldermann[f] = function (e) { if (e && e.referat) gjort.push({ ref: e.referat.length, e, k: FN[f] }); return _fn[f].apply(Oldermann, arguments); }; }
          try {
            // tre dagsordener i vanlig kamp: det han gjør, er det han sa, i samme rekkefølge
            const s0 = freeSpot(P.x + 3, P.z, 3), o = spawnEnemy('oldermann', s0.x, s0.z, false, 4);
            { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < 70 && performance.now() - t0 < 240000) { await vent(80); P.hp = 1e6; o.hp = o.max; if ((o.referat || []).filter(a => a.ferdig).length >= 3) break; } }
            ut.referat = (o.referat || []).filter(a => a.ferdig).slice(0, 3).map(a => ({ saker: a.saker, utfort: a.utfort }));
            // den første boblen i hver dagsorden er hele dagsorden, i den rekkefølgen sakene ble gjort
            ut.bobler = [1, 2, 3].map(n => { const b = bobler.find(x => x.ref === n); return b ? b.tekst : null; });
            // angrepene i hver dagsorden: Eventuelt er den saken boblen sa, og votering blir klubba når det er fullt
            ut.gjort = (o.referat || []).filter(a => a.ferdig).slice(0, 3).map(a => { const n = o.referat.indexOf(a) + 1; return { saker: a.saker, ev: a.ev, gjort: gjort.filter(g => g.e === o && g.ref === n).map(g => g.k) }; });
            ut.gjortRiktig = ut.gjort.length === 3 && ut.gjort.every(a => a.gjort.length === a.saker.length && a.saker.every((k, j) => a.gjort[j] === (k === 'eventuelt' ? a.ev : k) || (k === 'votering' && a.gjort[j] === 'klubbe')));
            ut.bobleRekke = ut.referat.map((a, i) => { const b = ut.bobler[i] || [], navn = a.saker.map(k => Oldermann.NAVN[k]); return b[0] === 'Dagsorden:' && navn.every((nv, j) => (b[j + 1] || '').startsWith((j + 1) + '. ' + nv)); });
            ut.tall = tall.filter(s => /Dagsorden|Sak |Knappenål|Kjetting|Klubba|Votering|Eventuelt/.test(s));
            ut.klubbe = lyder.filter(n => n === 'klubbe').length; ut.bokslag = lyder.filter(n => n === 'bokslag').length;
            ut.saker = ut.referat.reduce((s, a) => s + a.utfort.length, 0);
            // hver sak for seg, satt opp for hånd
            rolig(); midt(); await spill(.3);
            const o2 = spawnEnemy('oldermann', freeSpot(P.x, P.z, 3).x, freeSpot(P.x, P.z, 3).z, false, 4); await til(() => o2.state !== 'spawn'); o2.cd = 1e9;
            // pasienten settes der han ser Oldermannen (ellers venter saken, og testen har stoppet ham med cd), med litt plass rundt
            const fri = (x, z) => [[0, 0], [.45, 0], [-.45, 0], [0, .45], [0, -.45]].every(([a, c]) => !solid(Math.floor(x + a), Math.floor(z + c)));
            const plasser = d => { let s = null; for (let i = 0; i < 32 && !s; i++) { const v = i / 32 * Math.PI * 2, x = o2.x + Math.sin(v) * d, z = o2.z + Math.cos(v) * d; if (fri(x, z) && los(o2.x, o2.z, x, z)) s = { x, z }; } s = s || freeSpot(o2.x + d, o2.z, 3); P.x = s.x; P.z = s.z; P.kvx = P.kvz = 0; P.stunT = 0; P.invuln = 0; P.iframe = 0; P.deny = null; G.laugStunT = 0; };
            const sak = async (saker, d, t = 1.8) => {
              await til(() => o2.state !== 'wind', 3); o2.state = 'chase'; o2.stun = 0; plasser(d); teleSett.clear();
              // hjerter fra fiender testen har drept, trekkes inn når pasienten mister helse og ville skjult skaden
              for (const k of G.pickups.filter(k => k.kind === 'heart')) { R.remove(k.mesh); G.pickups.splice(G.pickups.indexOf(k), 1); }
              o2.dagsorden = { saker, i: 0, cd: .35, ev: null, vent: null }; (o2.referat || (o2.referat = [])).push({ saker, utfort: [] });
              const hp0 = P.hp, d0 = Math.hypot(P.x - o2.x, P.z - o2.z), n0 = Oldermann.skutt || 0, t0n = tall.length; Oldermann.sak(o2, P, d0, Math.atan2(P.x - o2.x, P.z - o2.z)); o2.cd = 1e9;
              await spill(t); const r = { tele: varsler(), skade: hp0 - P.hp, d0, d1: Math.hypot(P.x - o2.x, P.z - o2.z), proj: (Oldermann.skutt || 0) - n0, ord: tall.slice(t0n, t0n + 8), ev: o2.referat[o2.referat.length - 1].ev };
              o2.dagsorden = null; P.hp = 1e6; return r; };
            ut.naal = await sak(['naal'], 4);
            // står pasienten feil for saken, venter han (høyst 2,5 s), og dagsorden blir stående i boblen så lenge
            { await til(() => o2.state !== 'wind', 3); o2.state = 'chase'; o2.stun = 0; plasser(4);
              o2.dagsorden = { saker: ['naal'], i: 0, cd: 1e9, ev: null, vent: null }; o2.cd = 1e9; o2.referat.push({ saker: ['naal'], utfort: [] }); const bel = Oldermann.boble(o2, -1); await spill(1.5);
              const langt = { x: o2.x + 20, z: o2.z }, g0 = G.time, t0 = performance.now(); let borte = 0, n = 0, fyrt = null;
              while (G.time - g0 < 3.2 && performance.now() - t0 < 30000) { if (fyrt === null) { Oldermann.sak(o2, langt, 20, 0); o2.cd = 1e9; if (o2.dagsorden.i === 1) fyrt = +(G.time - g0).toFixed(2); else { n++; if (!bel.isConnected) borte++; } } await vent(60); }
              ut.vent = { fyrt, borte, n }; await til(() => o2.state !== 'wind', 3); o2.dagsorden = null; P.hp = 1e6; }
            ut.kjede = await sak(['kjede'], 5.5); ut.kjede.hektet = !!(P.statusT && P.statusT.HEKTET !== undefined);
            ut.klubbe1 = await sak(['klubbe'], 1.6);
            for (const e of G.enemies) if (e.alive && e.type === 'laerling') killEntity(e, {});
            ut.vote = await sak(['votering'], 3, 2.2); ut.vote.lar = G.enemies.filter(e => e.alive && e.type === 'laerling').length;
            { const s = freeSpot(o2.x - 3, o2.z + 2, 3); spawnEnemy('laerling', s.x, s.z, false, 4); } for (const e of G.enemies) if (e.alive && e.type === 'laerling') e.cd = 1e9;
            ut.vote2 = await sak(['votering'], 1.6, 2.2); ut.vote2.lar = G.enemies.filter(e => e.alive && e.type === 'laerling').length;
            for (const e of G.enemies) if (e.alive && e.type === 'laerling') killEntity(e, {});
            ut.ev = await sak(['eventuelt'], 2);
            // halv helse: ekstraordinært årsmøte, fire sølvringer rundt pasienten og klokkeren kommer. Etterpå er det tre saker og Eventuelt
            await til(() => o2.state !== 'wind', 3); o2.state = 'chase'; plasser(3); teleSett.clear(); for (const e of G.enemies) if (e.alive && e.type === 'klokker') killEntity(e, {});
            o2.hp = o2.max * .45; Grotesk.ai.oldermann(o2, P, 3, 0); o2.cd = 1e9;
            await vent(50); ut.aarsBoble = [...document.querySelectorAll('#fx .bubble')].map(e => e.textContent).join(' | ');
            await spill(2.4); ut.aars = { ringer: varsler().filter(t => t.shape === 'circle' && t.type === 'lenke' && t.r === 1.3).length, klokker: G.enemies.filter(e => e.alive && e.type === 'klokker').length };
            await til(() => o2.state !== 'wind', 3); o2.state = 'chase'; Oldermann.les(o2, P, 0); ut.aars.saker = o2.dagsorden.saker.length; ut.aars.sist = o2.dagsorden.saker[3];
            // Enkel grafikk: varslene og nålene kommer, men ingen kjettinger tegnes
            o2.dagsorden = null; o2.cd = 1e9; for (const e of G.enemies) if (e.alive && e !== o2) killEntity(e, {});
            await til(() => !Kjeder.liste.length, 4); R.safe = true; let kjS = 0; const kt = setInterval(() => { kjS = Math.max(kjS, Kjeder.liste.length); }, 20); prover.push(() => { kjS = Math.max(kjS, Kjeder.liste.length); });
            ut.safe = { kjede: await sak(['kjede'], 5), naal: await sak(['naal'], 4) }; clearInterval(kt); ut.safe.kjeder = kjS; ut.safe.for = Kjeder.liste.length; R.safe = false;
            // boblen med dagsorden er varselet: den holdes inne på skjermen når han står langt utenfor, og synes selv om snakkeboblene er slått av
            { document.body.classList.add('uten-bobler'); const falsk = { x: P.x - 40, z: P.z + 1, alive: true, bubbleH: 4.3, referat: [], dagsorden: { saker: ['naal', 'kjede', 'eventuelt'], i: 0 } };
              const el = Oldermann.boble(falsk, 0, 'Møtet er satt.'); await spill(.2); const rb = el.getBoundingClientRect(), W = document.getElementById('fx').getBoundingClientRect();
              ut.klem = { synlig: el.isConnected && getComputedStyle(el).display !== 'none' && rb.width > 0, inne: rb.left >= W.left - 1 && rb.right <= W.right + 1 && rb.top >= W.top - 1, l: Math.round(rb.left), r: Math.round(rb.right), t: Math.round(rb.top) };
              // står han langt nord og til venstre, havner boblen i hjørnet under panelet: den skyves ned så ingenting i toppen dekker den
              falsk.z = P.z - 30; await spill(.2); const rb2 = el.getBoundingClientRect(), over = ['badge', 'miniBar', 'bossBar', 'tools', 'mapring'].filter(id => { const r = document.getElementById(id).getBoundingClientRect(); return r.width && r.height && rb2.left < r.right && rb2.right > r.left && rb2.top < r.bottom && rb2.bottom > r.top; });
              ut.klem.hjorne = { over, t: Math.round(rb2.top), b: Math.round(rb2.bottom), panel: Math.round(document.getElementById('badge').getBoundingClientRect().bottom), mini: !document.getElementById('miniBar').classList.contains('hidden') };
              falsk.alive = false; document.body.classList.remove('uten-bobler'); await spill(.1); }
            killEntity(o2, {}); await spill(.8);
            // aldri i parken: 60 etasjefrø i Parken gir aldri Oldermannen, i Kjelleren kommer han
            const F = G.F, frø = F.seed, d0 = G.depth, risk = F.rooms.find(r => r.role === 'risk') || F.rooms[0], rolle = risk.role; risk.role = 'risk';
            const telle = d => { G.depth = d; let n = 0; for (let s = 1; s <= 60; s++) { F.seed = s * 7919; Mini.onFloor(); if (Object.values(Mini.rom).includes('oldermann')) n++; } return n; };
            ut.park = telle(1); ut.kjeller = telle(4); F.seed = frø; G.depth = d0; risk.role = rolle; Mini.onFloor();
          } finally { Oldermann.boble = _b; Sound.play = _sp; Object.assign(Oldermann, _fn); mo.disconnect(); samle = false; R.safe = false; document.body.classList.remove('uten-bobler'); }
          ut.info = !!((FIENDE_INFO.oldermann || [])[0] && FIENDE_INFO.oldermann[1] && SJEF_REKKE.includes('oldermann') && MINISJEFER.includes('oldermann') && FIENDESTEMME.oldermann && LINES.oldermann && DEATH_CAUSES.oldermann) && !ROLLER.oldermann;
          ut.bilde = (() => { const c = fiendeBilde('oldermann', 160, 190), d = c.getContext('2d').getImageData(0, 0, 160, 190).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 100) n++; return n / (160 * 190); })();
          return ut; }""")
    sjekk('Oldermann Nålepute finnes (Oldermann i 50_skinnlauget.js)', not om.get('mangler'), om.get('mangler', ''))
    if not om.get('mangler'):
        R = om['referat']
        sjekk('tre dagsordener er ferdige, og hver ender med Eventuelt etter to saker', len(R) == 3 and all(len(a['saker']) == 3 and a['saker'][-1] == 'eventuelt' for a in R), R)
        sjekk('over tre dagsordener gjør han sakene i nøyaktig den rekkefølgen han sa', len(R) == 3 and all(a['utfort'] == a['saker'] for a in R), R)
        sjekk('angrepene han faktisk gjør, følger dagsorden (Eventuelt som boblen sa, votering eller klubba)', om['gjortRiktig'], om['gjort'])
        sjekk('dagsorden står i boblen, med sakene i samme rekkefølge', len(om['bobleRekke']) == 3 and all(om['bobleRekke']), om['bobler'])
        sjekk('dagsorden og sakene kommer aldri som tall eller ord over hodet', om['tall'] == [], om['tall'])
        sjekk('bokslag for hver dagsorden og et klubbeslag for hver sak', om['bokslag'] >= 3 and om['klubbe'] >= om['saker'], {k: om[k] for k in ['bokslag', 'klubbe', 'saker']})
        n = om['naal']
        sjekk('knappenåler: et rektangel 2,2 bredt og 8 langt, så tre salver med fem nåler som treffer', any(t['shape'] == 'rect' and t['w'] == 2.2 and t['len'] == 8 for t in n['tele']) and n['proj'] == 15 and n['skade'] > 0, n)
        v = om['vent']
        sjekk('står pasienten feil, venter han høyst 2,5 s, og dagsorden blir stående i boblen mens han venter', v['fyrt'] is not None and 2.3 <= v['fyrt'] <= 2.9 and v['n'] > 5 and v['borte'] == 0, v)
        k = om['kjede']
        sjekk('kjettinger: en sølvring på 1,6 der pasienten står, som treffer, hekter og drar ham inn', any(t['shape'] == 'circle' and t['r'] == 1.6 and t['type'] == 'lenke' for t in k['tele']) and k['skade'] > 0 and k['hektet'] and k['d1'] < k['d0'] - 1, k)
        kl = om['klubbe1']
        sjekk('klubba: en ring på 2,6 rundt ham, som treffer og slår pasienten bakover', any(t['shape'] == 'circle' and t['r'] == 2.6 for t in kl['tele']) and kl['skade'] > 0 and kl['d1'] > kl['d0'] + 1, kl)
        sjekk('votering: to lærlinger kommer', om['vote']['lar'] == 2, om['vote'])
        sjekk('votering med tre lærlinger i live: ingen flere, og klubba i stedet', om['vote2']['lar'] == 3 and any(t['shape'] == 'circle' and t['r'] == 2.6 for t in om['vote2']['tele']), om['vote2'])
        ev = om['ev']; forv = {'naal': ('rect', None), 'kjede': ('circle', 1.6), 'klubbe': ('circle', 2.6)}.get(ev['ev'])
        sjekk('eventuelt: en av de tre første, og varselet passer til den', forv is not None and any(t['shape'] == forv[0] and (forv[1] is None or t['r'] == forv[1]) for t in ev['tele']), ev)
        a = om['aars']
        sjekk('halv helse: «Ekstraordinært årsmøte!», fire sølvringer, klokkeren kommer, og så tre saker og Eventuelt', 'Ekstraordinært årsmøte' in om['aarsBoble'] and a['ringer'] == 4 and a['klokker'] == 1 and a['saker'] == 4 and a['sist'] == 'eventuelt', [om['aarsBoble'], a])
        s = om['safe']
        sjekk('Enkel grafikk: sølvringen og nålene kommer og treffer, men ingen kjettinger tegnes', s['kjeder'] == 0 and s['kjede']['skade'] > 0 and s['naal']['proj'] == 15, s)
        sjekk('dagsorden holdes inne på skjermen når han står utenfor, og synes selv om snakkeboblene er av', om['klem']['synlig'] and om['klem']['inne'], om['klem'])
        sjekk('dagsorden havner aldri bak panelet, minisjeflinja, knappene eller kompasset', om['klem']['hjorne']['over'] == [] and om['klem']['hjorne']['t'] >= om['klem']['hjorne']['panel'], om['klem'])
        sjekk('aldri i parken, men han kommer i Kjelleren', om['park'] == 0 and om['kjeller'] > 0, [om['park'], om['kjeller']])
        sjekk('fiendeindeksen (blant minisjefene), replikker, stemme og dødsårsaker, og ikke i ROLLER', om['info'], om['info'])
        sjekk('fiendeBilde tegner ham', om['bilde'] > .08, om['bilde'])
    await pg.screenshot(path='/tmp/e_62_oldermann.png')
    sjekk('ingen konsollfeil (Oldermann Nålepute)', not pg.errs, pg.errs[:6])
    # håndbokssiden med minisjefene: får plass på PC og telefon
    hbs = []
    for vp in [{'width': 1280, 'height': 720}, {'width': 390, 'height': 844}]:
        await pg.set_viewport_size(vp)
        await pg.goto(URL); await pg.wait_for_function("() => window.MORBIDIUM && MORBIDIUM.state === 'title'", timeout=60000); await pg.wait_for_timeout(500)
        hb = await pg.evaluate("""() => { if (!SJEF_REKKE.includes('oldermann')) return { mangler: true }; const kap = HANDBOK.findIndex(h => h.id === 'sjefer'), per = document.body.clientWidth <= 700 ? 2 : 4; openHandbook({}, kap, Math.floor(SJEF_REKKE.indexOf('oldermann') / per));
              return { navn: [...document.querySelectorAll('.fkort .fnavn')].map(e => e.textContent) }; }""")
        await pg.wait_for_timeout(300)
        hb['plass'] = await pg.evaluate(HB_PLASS) if not hb.get('mangler') else False
        hbs.append(hb)
        await pg.screenshot(path=f"/tmp/e_62_handbok_{vp['width']}.png")
    sjekk('håndboka har Oldermann Nålepute blant minisjefene, og siden får plass på PC og telefon', all('Oldermann Nålepute' in h.get('navn', []) and h['plass'] for h in hbs), hbs)
    sjekk('ingen konsollfeil (Oldermann i håndboka)', not pg.errs, pg.errs[:6])
    await pg.close()
    # 3D: han leser dagsorden og gjør den første saken (én runde, 3D er tungt i programvaregrafikk)
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg, url=URL3D)
    d3 = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), ut = {};
          if (typeof Oldermann !== 'object') return { mangler: true };
          startFloor(4, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } rolig(); P.hp = P.maxHp = 1e6; ut.d3 = D3.on;
          const r = G.F.rooms.find(r => r.role === 'combat' && r.w >= 10 && r.h >= 8) || G.F.rooms.find(r => r.role === 'combat') || G.F.rooms[0]; P.x = r.x + r.w / 2 + .5; P.z = r.z + r.h / 2 + .5; R.snapCamera(P.x, P.z);
          const s = freeSpot(P.x + 3.5, P.z - 1, 3), o = spawnEnemy('oldermann', s.x, s.z, false, 4);
          const g0 = G.time, t0 = performance.now(); let sett = {};
          while (G.time - g0 < 16 && performance.now() - t0 < 150000) { await vent(60); P.hp = 1e6; sett[o.state] = 1; if (o.dagsorden && o.dagsorden.i >= 1 && o.state === 'wind' && o.teles.length) break; }
          G.hitstop = 30; // nesten stillstand mens bildet tas
          ut.sett = sett; ut.boble = [...document.querySelectorAll('#fx .bubble')].map(e => e.textContent).join(' | '); ut.varsel = o.teles.length; return ut; }""")
    await pg.wait_for_timeout(250)
    await pg.screenshot(path='/tmp/e_62_oldermann_3d.png')
    sjekk('i 3D leser han dagsorden og legger an til den første saken', not d3.get('mangler') and d3.get('d3') and 'Dagsorden' in d3.get('boble', '') and d3.get('varsel', 0) > 0, d3)
    await pg.evaluate("() => { MORBIDIUM.hitstop = 0; }")
    sjekk('ingen konsollfeil (Oldermann i 3D)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_63(b):
    # 63) Kraken: sjefen i puljen sitter i hullet sitt og flytter seg ikke, armene stiger opp rundt pasienten og klemmer (den som går ut
    #     mellom dem, slipper), blekket gir skyer, malstrømmen drar inn og biter i midten (også når Journalen låner den), dykket kan ikke
    #     treffes og kommer opp der pasienten sto, Journalen låner aldri dykket, høyst fire armer, og armene er ute av minnet etter etasjen
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg)
    kr = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), ut = {},
            til = async (f, t = 4) => { if (!f()) Klokke.til(f, t); return !!f(); },
            spill = async (t, maks = 90000, hver) => { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < t && performance.now() - t0 < maks) { await vent(40); if (hver) hver(); } };
          if (typeof Kraken !== 'object' || !SJEF_DATA.kraken) return { mangler: true };
          ut.data = { pulje: SJEF_PULJE.includes('kraken'), rekke: SJEF_REKKE.includes('kraken'), info: !!(FIENDE_INFO.kraken && FIENDE_INFO.kraken[0] && FIENDE_INFO.kraken[1]),
            replikker: ['bossIntro', 'monolog', 'monolog2', 'boss'].every(k => (LINES[k].kraken || []).length >= 3) && !!LINES.bossDod.kraken, epitaf: !!SJEF_EPITAF.kraken, dod: (DEATH_CAUSES.boss_kraken || []).length >= 3,
            egne: SJEF_DATA.kraken.egne, fart: SJEF_DATA.kraken.fart, oye: !!OYE_SER.kraken, merknad: !!MERKNADER.kraken };
          { let n = 0; for (let s = 1; s < 200; s++) if (Object.values(trekkSjefer(s)).includes('kraken')) n++; ut.data.trukket = n; }
          // Journalen låner aldri dykket (bare Krakens egen tick flytter den), men gjerne de andre
          G.run.sjefer = { 1: 'krok', 2: 'kraken', 3: 'hjort', 4: 'klumpen', 5: 'rust', 6: 'journalen' };
          ut.laan = [...new Set(laanbareTrekk())].sort();
          G.run.sjefer[3] = 'kraken'; startFloor(3, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); }
          P.hp = P.maxHp = 1e6; { const r = G.F.rooms[G.F.bossId]; P.x = r.x + r.w / 2; P.z = r.z + r.h - 2; }
          await til(() => G.boss && G.boss.alive, 30); const B = G.boss; if (!B || B.type !== 'kraken') return Object.assign(ut, { ingenSjef: B && B.type });
          await til(() => B.state !== 'intro', 6); B.B0.attacks = ['ingen']; B.cd = 1e9; // ingen egne angrep under testen: de settes i gang ett og ett
          // treffene på pasienten telles der helsa settes tilbake: hurt kan ikke pakkes inn utenfra (spillet ligger i en funksjon), men P.lastCause sier hvem
          const treff = [], tell = () => { if (P.hp < 1e6 - .01) treff.push({ t: G.time, type: P.lastCause }); P.hp = 1e6; P.iframe = 0; P.invuln = 0; };
          const rom = G.F.bossId, fri = (x, z) => roomAt(x, z) === rom && [[0, 0], [.4, 0], [-.4, 0], [0, .4], [0, -.4]].every(([a, c]) => !solid(Math.floor(x + a), Math.floor(z + c)));
          const ved = (d, a0 = 0) => { for (let i = 0; i < 24; i++) { const v = a0 + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * .26, x = B.x + Math.sin(v) * d, z = B.z + Math.cos(v) * d; if (fri(x, z) && los(B.x, B.z, x, z)) return { x, z }; } return { x: B.x, z: B.z + d }; };
          const hold = p => () => { tell(); P.x = p.x; P.z = p.z; P.kvx = P.kvz = 0; P.stunT = 0; };
          const mot = () => [Math.hypot(P.x - B.x, P.z - B.z), Math.atan2(P.x - B.x, P.z - B.z)];
          const angrip = k => { const [d, a] = mot(); bossAttackTest(B, k); };
          try {
            // i hullet: et tjern som varer, stor nok til kroppen, og Kraken står stille når pasienten er fem ruter unna
            const x0 = B.x, z0 = B.z, p0 = ved(5); await spill(2, 60000, hold(p0));
            ut.start = { hull: !!B.hull && G.puddles.includes(B.hull) && B.hull.kind === 'tjern' && B.hull.r >= 2.3 && B.hull.life > 1e6, r: B.r, flytt: Math.hypot(B.x - x0, B.z - z0),
              baand: [B.doll.back.n, B.doll.back.cap, B.doll.front.n, B.doll.front.cap], boble: B.bubbleH };
            // hullet graves på nytt når taket på 46 pytter har skjøvet det ut
            { const rr = G.F.rooms[rom]; let n = 0; for (let z = rr.z + .5; z < rr.z + rr.h && n < 50; z += .7) for (let x = rr.x + .5; x < rr.x + rr.w && n < 50; x += .7) if (!solid(Math.floor(x), Math.floor(z)) && Math.hypot(x - B.x, z - B.z) > 3) { addPuddle(x, z, 'wet', .3, 60); n++; } }
            { const h0 = B.hull; await spill(.3, 30000, hold(p0)); ut.start.gravd = !G.puddles.includes(h0) && !!B.hull && G.puddles.includes(B.hull) && B.hull.r >= 2.3; }
            // favn: armene stiger opp i en ring rundt pasienten, og klemmene går inn mot der hen står
            treff.length = 0; angrip('favn'); let armer = 0, retning = [];
            await spill(4.2, 120000, () => { hold(p0)(); armer = Math.max(armer, Kraken.armer.filter(a => a.aktiv).length);
              for (const t of G.tele) if (t.owner === B && t.shape === 'rect' && !retning.includes(t)) retning.push(t); });
            const avvik = retning.map(t => { const o = t.o, dx = p0.x - o.x, dz = p0.z - o.z; return Math.abs(dx * Math.cos(o.a) - dz * Math.sin(o.a)); });
            ut.favn = { armer, klemmer: retning.length, avvik: Math.max(0, ...avvik), treff: treff.filter(t => t.type === 'boss').length, igjen: Kraken.armer.filter(a => a.aktiv).length, lagd: Kraken.armer.length };
            // den som går ut mellom armene med en gang de er oppe, slipper klemmen
            treff.length = 0; angrip('favn'); await spill(.95, 60000, hold(p0));
            const ringen = Kraken.armer.filter(a => a.aktiv).map(a => Math.atan2(a.x - p0.x, a.z - p0.z)).sort((a, b) => a - b); let ut2 = null;
            if (ringen.length >= 3) { const gap = ringen.map((a, i) => { const nx = i + 1 < ringen.length ? ringen[i + 1] : ringen[0] + Math.PI * 2; return [nx - a, a + (nx - a) / 2]; }).sort((a, b) => b[0] - a[0]);
              ut: for (const [, mid] of gap) for (const rr of [5.2, 4.8, 5.8, 4.4]) { const x = p0.x + Math.sin(mid) * rr, z = p0.z + Math.cos(mid) * rr; if (fri(x, z)) { ut2 = { x, z }; break ut; } } }
            if (ut2) { const t1 = G.time; await spill(2.6, 90000, hold(ut2)); ut.unna = { flyttet: true, treff: treff.filter(t => t.t >= t1 && t.type === 'boss').length }; } else ut.unna = { flyttet: false, ringen: ringen.length };
            await spill(1.5, 30000, hold(p0));
            // blekk: kjeglen treffer, og det blir skyer der blekket landet
            const royk0 = G.zones.filter(z => z.kind === 'royk').length, p1 = ved(3.5); treff.length = 0; hold(p1)(); angrip('blekk'); await spill(1.4, 60000, hold(p1));
            ut.blekk = { skyer: G.zones.filter(z => z.kind === 'royk').length - royk0, treff: treff.filter(t => t.type === 'boss').length };
            await spill(1, 30000, hold(p0));
            // malstrømmen drar pasienten inn (omtrent tre ruter i sekundet) og biter i midten
            const p2 = ved(5.2); hold(p2)(); treff.length = 0; angrip('malstrom'); const zn = G.zones.find(z => z.kind === 'malstrom');
            const dm = () => zn ? Math.hypot(P.x - zn.x, P.z - zn.z) : 0, d0 = dm(), g0 = G.time; let indre = false;
            await spill(1.0, 60000, tell);
            const d1 = dm(), dt1 = G.time - g0;
            await spill(1.9, 60000, () => { tell(); indre = indre || G.tele.some(t => t.owner === zn && t.o.r > 2 && t.o.r < 2.5); });
            await spill(.5, 30000, tell);
            ut.malstrom = { sone: !!zn, d0, d1, fart: (d0 - d1) / dt1, indre, bitt: treff.filter(t => t.type === 'boss').length, borte: !G.zones.includes(zn), mesh: !!zn && !zn.mesh.parent };
            // Journalen låner malstrømmen: sonen trenger ikke eieren, den drar og biter uten at eieren gjør noe, og stilner når eieren er borte
            const J = { alive: true, x: B.x, z: B.z, type: 'journalen', q: [], teles: [], bubbleH: 4 }; hold(p2)(); treff.length = 0; BOSS_MOVES.malstrom(J, 5, 0, 20); const zj = G.zones.find(z => z.kind === 'malstrom' && z.B === J);
            await spill(1.2, 60000, tell); const dj = zj ? Math.hypot(P.x - zj.x, P.z - zj.z) : 99;
            await spill(1.8, 60000, tell);
            ut.laant = { sone: !!zj, dratt: dj < 5.2 - 1, bitt: treff.filter(t => t.type === 'boss').length };
            const zj2 = Kraken.virvel(B.x, B.z, J, 20); await spill(.3, 30000); J.alive = false; await spill(.3, 30000); ut.laant.stilner = !G.zones.includes(zj2) && !zj2.mesh.parent;
            // grepet til armene står over mens malstrømmen går (to drag samtidig kan ikke løpes fra)
            { const _gr = Havet.grip; let grep = 0; Havet.grip = function () { grep++; }; const a0 = spawnEnemy('avlopsarm', B.x + 3, B.z, false, 3);
              try { let pa = null; for (let i = 0; i < 48 && !pa; i++) { const v = i / 48 * Math.PI * 2, x = a0.x + Math.sin(v) * 4.5, z = a0.z + Math.cos(v) * 4.5; if (fri(x, z) && los(a0.x, a0.z, x, z)) pa = { x, z }; }
                const prov = n => { for (let i = 0; i < n; i++) { hold(pa)(); a0.fase = 'opp'; a0.faseT = 1; a0.dukket = false; a0.state = 'chase'; Grotesk.ai.avlopsarm(a0, P, Math.hypot(P.x - a0.x, P.z - a0.z), Math.atan2(P.x - a0.x, P.z - a0.z)); cancelTeles(a0); } };
                if (pa) { const zv = Kraken.virvel(B.x, B.z, B, 1); prov(40); const under = grep; zv.t = 0; await spill(.2, 20000); grep = 0; prov(40); ut.grep = { underVirvel: under, uten: grep }; } else ut.grep = { ingenPlass: true }; }
              finally { Havet.grip = _gr; killEntity(a0, {}); } }
            await spill(.8, 30000, hold(p0));
            // dykket: under vann tar den ingen skade, har ingen skygge og siktes ikke på; den kommer opp der pasienten sto, treffer og graver nytt hull
            const p3 = ved(5); hold(p3)(); treff.length = 0; const hull0 = B.hull, hp0 = B.hp; angrip('dypdykk');
            ut.dykk = { under: await til(() => B.dukket && !B.doll.root.visible, 3) };
            Object.assign(ut.dykk, { skade: hurt(B, 50, { from: 'player' }), hp: B.hp === hp0, skygge: Dybde.kastere().some(k => k.k === B), naermest: nearestEnemy(B.x, B.z, 99) === B, gammelt: !G.puddles.includes(hull0) || hull0.life < 10 });
            const tU = G.time; await til(() => { hold(p3)(); return !B.dukket; }, 4); ut.dykk.tidUnder = G.time - tU;
            await spill(.6, 30000, hold(p3));
            Object.assign(ut.dykk, { oppe: !B.dukket && B.doll.root.visible, avstand: Math.hypot(B.x - p3.x, B.z - p3.z), treff: treff.filter(t => t.type === 'boss').length, hop: B.hop || 0, r: B.r,
              hull: !!B.hull && G.puddles.includes(B.hull) && Math.hypot(B.hull.x - B.x, B.hull.z - B.z) < .1 && B.hull.life > 1e6, armer: Havet.armer() });
            // høyst fire armer, uansett hvor mange som kalles
            Kraken.kallArmer(B, 6); Kraken.kallArmer(B, 6); await spill(2.2, 60000, hold(p0)); ut.dykk.maks = Havet.armer();
            // rasende og to favn på rad (6 og 6 armer, den andre før de første har sunket): alle klemmene har en arm å vise. Armer som ville kommet opp i en vegg, hoppes over, så tallet på kall følger rommet
            { const _a = Kraken.arm; let kall = 0, uten = 0; Kraken.arm = function (...a) { kall++; const d = _a.apply(this, a); if (!d) uten++; return d; };
              try { B.enraged = true; angrip('favn'); await spill(3.09, 60000, hold(p0)); angrip('favn'); await spill(3.6, 60000, hold(p0)); } finally { Kraken.arm = _a; B.enraged = false; }
              ut.rasende = { kall, uten }; }
            // Enkel grafikk: favn og malstrøm uten feil
            R.safe = true; try { angrip('favn'); await spill(1.5, 60000, hold(p0)); angrip('malstrom'); await spill(3, 60000, tell); } finally { R.safe = false; }
            // talen ved to tredjedeler helse, og døden: hullet renner ut, armene dør og luken åpner seg
            await til(() => B.state !== 'act', 4); B.state = 'chase'; for (let i = 0; i < 40 && B.phase !== 'monolog' && B.hp > B.max * .34; i++) hurt(B, B.max * .04, { from: 'player' }); ut.tale = { fase: B.phase, tale: B.mono === LINES.monolog.kraken };
            const hull1 = B.hull; hurt(B, 1e9, { from: 'player' }); await spill(3, 60000, hold(p0));
            ut.dod = { hull: !hull1 || !G.puddles.includes(hull1) || hull1.life < 5, armer: Havet.armer(), luke: !!G.trapdoor };
          } finally { R.safe = false; }
          // ny etasje: armene er kastet ut av grafikkminnet, og ingen virvel henger igjen
          const lagd = Kraken.armer.length; startFloor(4, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); }
          ut.rydd = { lagd, igjen: Kraken.armer.length, soner: G.zones.filter(z => z.kind === 'malstrom').length };
          ut.bilde = (() => { const c = fiendeBilde('kraken', 160, 190), d = c.getContext('2d').getImageData(0, 0, 160, 190).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 100) n++; return n / (160 * 190); })();
          return ut; }""")
    sjekk('Kraken finnes (Kraken i 49_havet.js)', not kr.get('mangler') and not kr.get('ingenSjef'), {k: kr.get(k) for k in ['mangler', 'ingenSjef']})
    if not kr.get('mangler') and not kr.get('ingenSjef'):
        d = kr['data']
        sjekk('Kraken står i sjefpuljen og fiendeindeksen, med replikker, tale, siste ord, epitaf, dødsårsaker, øyet i sprekken og en merknad, og trekkes i en del løp', d['pulje'] and d['rekke'] and d['info'] and d['replikker'] and d['epitaf'] and d['dod'] and d['oye'] and d['merknad'] and 40 < d['trukket'] < 199, d)
        sjekk('Journalen låner favn, blekk, malstrøm og dypkall, men aldri dykket', 'dypdykk' not in kr['laan'] and all(k in kr['laan'] for k in ['favn', 'blekk', 'malstrom', 'dypkall']) and d['egne'] == ['dypdykk'], kr['laan'])
        s = kr['start']
        sjekk('Kraken sitter i et tjern som varer, flytter seg ikke, og hullet graves på nytt når pyttetaket skyver det ut', s['hull'] and s['flytt'] < .05 and s['r'] >= 1.5 and s['gravd'], s)
        sjekk('de seks armene får plass i strekbåndene (ingenting kuttes)', 2000 < s['baand'][0] < s['baand'][1] and 2000 < s['baand'][2] < s['baand'][3], s['baand'])
        f = kr['favn']
        sjekk('favn: armene stiger opp rundt pasienten, klemmer inn mot der hen står, treffer den som blir stående, og synker igjen', f['armer'] >= 3 and f['klemmer'] >= 3 and f['avvik'] < .3 and f['treff'] >= 1 and f['igjen'] == 0, f)
        sjekk('favn: den som går ut mellom armene med en gang de er oppe, slipper klemmen', kr['unna']['flyttet'] and kr['unna']['treff'] == 0, kr['unna'])
        sjekk('blekk: kjeglen treffer, og blekket blir til skyer', kr['blekk']['skyer'] >= 2 and kr['blekk']['treff'] >= 1, kr['blekk'])
        m = kr['malstrom']
        sjekk('malstrømmen drar pasienten inn med omtrent tre ruter i sekundet, nebbet biter i midten, og virvelen er borte etterpå', m['sone'] and 1.5 < m['fart'] < 5.5 and m['indre'] and m['bitt'] >= 1 and m['borte'] and m['mesh'], m)
        sjekk('malstrømmen virker også når Journalen låner den, og stilner når eieren er borte', kr['laant']['sone'] and kr['laant']['dratt'] and kr['laant']['bitt'] >= 1 and kr['laant']['stilner'], kr['laant'])
        sjekk('armene griper ikke mens malstrømmen går (men gjør det ellers)', kr['grep']['underVirvel'] == 0 and kr['grep']['uten'] >= 5, kr['grep'])
        dk = kr['dykk']
        sjekk('under vann tar Kraken ingen skade, kaster ingen skygge og siktes ikke på, og det gamle hullet renner ut', dk['under'] and dk['skade'] == 0 and dk['hp'] and not dk['skygge'] and not dk['naermest'] and dk['gammelt'], dk)
        sjekk('dykket: opp igjen innen 2,6 sekunder der pasienten sto, treffer, står i et nytt hull og har kroppen sin igjen', dk['oppe'] and dk['tidUnder'] <= 2.6 and dk['avstand'] < 1.8 and dk['treff'] >= 1 and dk['hull'] and abs(dk['hop']) < .01 and dk['r'] >= 1.5, dk)
        sjekk('armer stiger opp mens Kraken er under, og det blir aldri mer enn fire', 1 <= dk['armer'] <= 4 and dk['maks'] <= 4, dk)
        sjekk('to favn på rad når Kraken er rasende: hver klemme har en arm (ingen treff uten arm)', kr['rasende']['kall'] >= 6 and kr['rasende']['uten'] == 0, kr['rasende'])
        sjekk('talen ved to tredjedeler helse er Krakens egen', kr['tale']['fase'] == 'monolog' and kr['tale']['tale'], kr['tale'])
        sjekk('når Kraken dør, renner hullet ut, armene dør og luken åpner seg', kr['dod']['hull'] and kr['dod']['armer'] == 0 and kr['dod']['luke'], kr['dod'])
        sjekk('armene i favn er kastet ut av grafikkminnet etter etasjen, og ingen virvel henger igjen', kr['rydd']['lagd'] >= 3 and kr['rydd']['igjen'] == 0 and kr['rydd']['soner'] == 0, kr['rydd'])
        sjekk('fiendeBilde tegner Kraken', kr['bilde'] > .06, kr['bilde'])
    await pg.screenshot(path='/tmp/e_63_kraken.png')
    sjekk('ingen konsollfeil (Kraken)', not pg.errs, pg.errs[:6])
    # håndbokssiden med Kraken får plass, og kortet har bilde
    await pg.goto(URL); await pg.wait_for_function("() => window.MORBIDIUM && MORBIDIUM.state === 'title'", timeout=60000); await pg.wait_for_timeout(500)
    hb = await pg.evaluate("""() => { if (!SJEF_REKKE.includes('kraken')) return { mangler: true }; const kap = HANDBOK.findIndex(h => h.id === 'sjefer'), per = document.body.clientWidth <= 700 ? 2 : 4; openHandbook({}, kap, Math.floor(SJEF_REKKE.indexOf('kraken') / per));
          return { navn: [...document.querySelectorAll('.fkort .fnavn')].map(e => e.textContent) }; }""")
    await pg.wait_for_timeout(300)
    hb['plass'] = await pg.evaluate(HB_PLASS) if not hb.get('mangler') else False
    sjekk('håndboka har en side med Kraken, og den får plass', 'Kraken' in hb.get('navn', []) and hb['plass'], hb)
    await pg.screenshot(path='/tmp/e_63_handbok.png')
    sjekk('ingen konsollfeil (Kraken i håndboka)', not pg.errs, pg.errs[:6])
    await pg.close()
    # og på stående og liggende telefon, der det er to kort på hver side
    for vw, vh in [(390, 844), (844, 390)]:
        pg = await ny_side(b, viewport={'width': vw, 'height': vh}, is_mobile=True, has_touch=True, device_scale_factor=2)
        await pg.goto(URL); await pg.wait_for_function("() => window.MORBIDIUM && MORBIDIUM.state === 'title'", timeout=60000); await pg.wait_for_timeout(500)
        hb = await pg.evaluate("""() => { if (!SJEF_REKKE.includes('kraken')) return { mangler: true }; const kap = HANDBOK.findIndex(h => h.id === 'sjefer'), per = document.body.clientWidth <= 700 ? 2 : 4; openHandbook({}, kap, Math.floor(SJEF_REKKE.indexOf('kraken') / per));
              return { navn: [...document.querySelectorAll('.fkort .fnavn')].map(e => e.textContent) }; }""")
        await pg.wait_for_timeout(400)
        # liggende telefon: håndboka rekker under skjermkanten på alle sider også før Kraken (panelet ruller), så der sjekkes bare kortene
        hb['plass'] = (await pg.evaluate(HB_PLASS) if vw < vh else await pg.evaluate("() => [...document.querySelectorAll('.fkort')].every(k => k.scrollHeight <= k.clientHeight + 2 && !!k.querySelector('canvas'))")) if not hb.get('mangler') else False
        sjekk(f'håndbokssiden med Kraken får plass på telefon ({vw}x{vh})', 'Kraken' in hb.get('navn', []) and hb['plass'], hb)
        await pg.screenshot(path=f'/tmp/e_63_handbok_{vw}.png')
        await pg.close()
    # 3D: Kraken med favn, malstrøm og dykk (én runde, 3D er tungt i programvaregrafikk)
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg, url=URL3D)
    d3 = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), ut = {},
            til = async (f, t = 4) => { if (!f()) Klokke.til(f, t); return !!f(); };
          if (typeof Kraken !== 'object') return { mangler: true };
          G.run.sjefer[3] = 'kraken'; startFloor(3, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } ut.d3 = D3.on;
          P.hp = P.maxHp = 1e6; { const r = G.F.rooms[G.F.bossId]; P.x = r.x + r.w / 2; P.z = r.z + r.h - 2; }
          await til(() => G.boss && G.boss.alive, 40); const B = G.boss; if (!B || B.type !== 'kraken') return Object.assign(ut, { ingenSjef: true });
          await til(() => B.state !== 'intro', 8); B.B0.attacks = ['ingen']; P.x = B.x + 1; P.z = B.z + 4.5;
          const S = {}; let armer = 0, baand = 0;
          for (const k of ['favn', 'malstrom', 'dypdykk']) { bossAttackTest(B, k); await til(() => { P.hp = 1e6; armer = Math.max(armer, Kraken.armer.filter(a => a.aktiv).length); baand = Math.max(baand, B.doll.front.n); if (B.dukket) S.dukket = 1; if (G.zones.some(z => z.kind === 'malstrom')) S.virvel = 1; return false; }, 3.5); }
          await til(() => !B.dukket, 4); ut.S = S; ut.armer = armer; ut.baand = baand; ut.oppe = !B.dukket && B.doll.root.visible; ut.ekstra = (G.ekstraDukker || []).filter(d => d.type === 'krakenarm').length;
          bossAttackTest(B, 'favn'); await til(() => false, 1.7); G.hitstop = 30; return ut; }""")
    sjekk('i 3D stiger armene opp, malstrømmen går rundt og Kraken dykker og kommer opp igjen', not d3.get('mangler') and not d3.get('ingenSjef') and d3.get('d3') and d3['S'].get('dukket') and d3['S'].get('virvel') and d3['armer'] >= 3 and d3['oppe'] and 0 < d3['baand'] < 6000 and d3['ekstra'] >= 3, d3)
    await pg.screenshot(path='/tmp/e_63_kraken_3d.png')
    sjekk('ingen konsollfeil (Kraken i 3D)', not pg.errs, pg.errs[:6])
    await pg.close()


DELER = {4: del_4, 21: del_21, 62: del_62, 63: del_63}
