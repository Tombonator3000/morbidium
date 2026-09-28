"""Blod, kombo, varsler, blekk og nedslag.

Testdeler fra test_ekstra.py. Kjøres med python3 tools/test_ekstra.py --system blod_og_treff eller --del N.
"""
import pathlib
from .felles import sjekk, ny_side, start_lop, URL, URL3D


async def del_18(b):
    # 18) blod: flekker, sprut på veggen, kjøttbiter ved tunge slag, blod på skjermen når pasienten skades, og det kan slås av
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg)
    bl = await pg.evaluate("""async () => { startFloor(2, false); rolig(); const G = MORBIDIUM, P = G.player, r = G.F.rooms.find(r => r.role === 'combat'), n = () => Object.values(Blod.pools).reduce((a, p) => a + p.n, 0);
          P.x = r.x + r.w / 2; P.z = r.z + r.h / 2; Bygg.alt(); const a = {}, n0 = n();
          const e = spawnEnemy('pleier', P.x + 1.5, P.z, false, 1); e.state = 'chase'; e.cd = 99; hurt(e, 9999, { from: 'player', x: P.x, z: P.z, kb: 9 });
          await new Promise(r => setTimeout(r, 300)); a.flekker = n() - n0; a.biter = Blod.bitene.length;
          let vegg = false; for (let x = r.x + 1; x < r.x + r.w - 1 && !vegg; x++) for (let z = r.z + .4; z < r.z + 2.5 && !vegg; z += .3) vegg = Blod.vegg(x + .5, z, '#8a1010', 1);
          a.vegg = vegg && Blod.vegger.length > 0 && Blod.drypper.length > 0;
          R.fx.blod = 0; P.hp = P.maxHp; P.iframe = P.invuln = 0; P.deny = null; hurt(P, 2, { type: 'pleier', x: P.x - 1, z: P.z }); a.skjerm = R.fx.blod > 0 || Vaatt.draper.some(d => d.blod);
          const gulv = n(); Blod.sett(false); a.av = R.fx.blod === 0 && !Blod.on && !Vaatt.draper.some(d => d.blod); a.ryddet = { vegger: Blod.vegger.length, drypp: Blod.drypper.length, biter: Blod.bitene.length, gulvIgjen: n() === gulv }; Blod.sett(true); P.hp = P.maxHp;
          return a; }""")
    sjekk('blod: flekker og kjøttbiter når en fiende knuses, sprut med drypp på veggen og blod på skjermen', bl['flekker'] > 3 and bl['biter'] >= 4 and bl['vegg'] and bl['skjerm'] and bl['av'], bl)
    sjekk('slås blod og skrekk av, forsvinner sprut på veggene, drypp og kjøttbiter, mens flekkene på gulvet blir liggende', bl['ryddet'] == {'vegger': 0, 'drypp': 0, 'biter': 0, 'gulvIgjen': True}, bl)
    sjekk('ingen konsollfeil (blod)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_29(b):
    # 29) Kombo: treffkjeden med nivåer, flerdrap, overkill, miljødrap, perfekt unnvikelse, tredje slag, kortkjede, sjefdrap og fanfarer
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg, url=URL + '?2d')
    ko = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), spill = async (t, maks = 60000) => { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < t && performance.now() - t0 < maks) await vent(50); }, T = Kombo.tall, ut = {};
          Sound.init(); rolig(); P.hp = P.maxHp = 9999; const r = G.F.rooms.find(r => r.role === 'combat') || G.F.rooms[0]; P.x = r.x + r.w / 2; P.z = r.z + r.h / 2; P.face = 0;
          const lag = (dx, dz, hp = 1e6) => { const s = freeSpot(P.x + dx, P.z + dz, 2), e = spawnEnemy('pleier', s.x, s.z, false, 1); e.hp = e.max = hp; e.stun = 99; e.state = 'chase'; return e; };
          // treffkjeden: 22 treff gir tredje nivå, telleren og den brennende kanten
          const a = lag(2, 0), xp0 = P.xp + P.level * 1000;
          for (let i = 0; i < 22; i++) hurt(a, 1, { from: 'player', x: P.x, z: P.z }); hurt(a, 1, { from: 'player', dot: true });
          const el = document.getElementById('kombo'); await vent(400);
          ut.kjede = Kombo.n === 22 && Kombo.niva === 3 && T.milepael === 3 && el.classList.contains('on') && el.querySelector('b').textContent === '22' && el.querySelector('span').textContent === 'Kirurgisk' && el.classList.contains('het');
          ut.hete = R.fx.hete > 0 && R.post.uniforms.uHete.value > 0; ut.stempel = document.getElementById('kstempel').textContent.startsWith('KIRURGISK');
          // kjeden slutter av seg selv og gir erfaring
          await spill(Kombo.VINDU + .3); ut.slutt = Kombo.n === 0 && T.slutt === 1 && P.xp + P.level * 1000 > xp0 && !el.classList.contains('on');
          // og brister når du blir truffet
          for (let i = 0; i < 12; i++) hurt(a, 1, { from: 'player', x: P.x, z: P.z }); P.invuln = P.iframe = 0; P.roll = 0; hurt(P, 3, { type: 'test' }); ut.brist = Kombo.n === 0 && T.brist === 1;
          // perfekt unnvikelse: truffet midt i rullingen
          P.invuln = 0; P.roll = .3; P.iframe = .3; hurt(P, 3, { type: 'test' }); ut.perfekt = T.perfekt === 1 && G.slow.t > 0; P.roll = 0; P.iframe = 0;
          // flerdrap: fem på et øyeblikk er en massakre, med merknad
          killEntity(a, {}); await spill(.3); const fem = [0, 1, 2, 3, 4].map(i => lag(-2 + i, 2, 20));
          for (const e of fem) hurt(e, 9999, { from: 'player', x: P.x, z: P.z }); await spill(.6);
          ut.massakre = G.run.flerdrapMaks === 5 && T.flerdrap >= 1 && T.overkill >= 1 && !!(G.meta.merk || {}).massakre;
          // miljødrap: strøm, lyn og spolen
          await spill(1.6); const m = lag(2, -1, 5); hurt(m, 50, { from: 'env', type: 'lyn' }); ut.miljo = T.miljo === 1;
          // tredje slag som treffer to
          const b1 = lag(-.35, 1), b2 = lag(.35, 1); P.face = 0; meleeHit({ combo: 2, heavy: false, charge: 0 }); ut.finale = T.finale === 1;
          killEntity(b1, {}); killEntity(b2, {});
          // tre ulike kort på rad
          Kombo.kort(0); Kombo.kort(1); Kombo.kort(2); ut.kort = T.kort === 1 && document.getElementById('kstempel').textContent.startsWith('LEGEKUNST');
          // fanfare for synergi og forvandling, og sjefdrap
          stampBig('SYNERGI', 'Test'); stampBig('FORVANDLING', 'Test'); ut.fanfare = T.fanfare === 2;
          const B = spawnBoss(1, P.x + 3, P.z); G.boss = G.boss || B; hurt(G.boss, 1e9, { from: 'player', x: P.x, z: P.z }); ut.sjef = T.sjef === 1;
          // lydene og stemmen lages uten feil
          let lydfeil = ''; try { for (const k of ['kombo1', 'kombo2', 'kombo3', 'kombo4', 'kombo5', 'dobbel', 'trippel', 'firling', 'massakre', 'overkill', 'miljo', 'perfekt', 'finale', 'kortkombo', 'synergi', 'forvandling', 'sjefdrap', 'trombone', 'kasse', 'applaus', 'lynslag', 'torden', 'gnistre']) { if (!Sound.lib[k]) lydfeil += k + ' mangler '; else Sound.play(k, .01); } for (const o of ['massakre', 'Klinisk sinnssyk', 'behandlet', 'xyz']) Sound.stemme(o, { v: .01 }); } catch (e) { lydfeil += e.message; }
          ut.lyd = lydfeil || 'ok';
          // bryteren i innstillingene, og kjeden på dødskortet
          G.meta.settings.kombo = false; ut.av = !Kombo.lyd(); G.meta.settings.kombo = true;
          ut.stats = runStats().includes('Lengste kjede') && runStats().includes('Flest på en gang');
          return ut; }""")
    sjekk('treffkjeden teller, får navn ved 5, 10 og 20 treff og vises til høyre, men blødning og gift teller ikke', ko['kjede'] and ko['stempel'], ko)
    sjekk('lange kjeder får skjermkanten til å brenne', ko['hete'], ko)
    sjekk('kjeden slutter av seg selv og gir erfaring, og brister når du blir truffet', ko['slutt'] and ko['brist'], ko)
    sjekk('perfekt unnvikelse gir tidsfall', ko['perfekt'], ko)
    sjekk('fem drept på et øyeblikk er en massakre, med overkill og merknaden Massakre', ko['massakre'], ko)
    sjekk('miljødrap, tredje slag som treffer to, og tre ulike kort på rad', ko['miljo'] and ko['finale'] and ko['kort'], ko)
    sjekk('fanfare for synergi og forvandling, og sjefdrap med lyn og applaus', ko['fanfare'] and ko['sjef'], ko)
    sjekk('alle kombolydene og kunngjørerstemmen lages uten feil', ko['lyd'] == 'ok', ko['lyd'])
    sjekk('kunngjøreren kan slås av, og lengste kjede og flest på en gang står på dødskortet', ko['av'] and ko['stats'], ko)
    await pg.wait_for_timeout(300)
    await pg.screenshot(path='/tmp/e_16kombo.png')
    sjekk('ingen konsollfeil (kombo)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_34(b):
    # 34) Blod og vann på skjermen: dråper fra siden slaget kom fra, de renner, slår seg sammen, tørker, regn og plask, og innstillingene
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await pg.goto(URL); await pg.wait_for_timeout(2000); await pg.evaluate("() => localStorage.clear()")
    await start_lop(pg)
    ut = await pg.evaluate("""async () => { const vent = t => new Promise(r => setTimeout(r, t)), G = MORBIDIUM, P = G.player, ut = {};
          for (const e of G.enemies) if (e.alive) killEntity(e, {}); P.hp = P.maxHp = 100; P.invuln = 999; Sound.vaerType = null; Vaatt.tom(); await vent(200);
          ut.aktiv = Vaatt.aktiv(); R.fx.blod = 0;
          Blod.treff(P, { x: P.x + 2, z: P.z }, 45); await vent(300);
          const D = Vaatt.draper; ut.n = D.length; ut.blod = D.every(d => d.blod); ut.hoyre = D.filter(d => d.x > Vaatt.W / 2).length / Math.max(1, D.length); ut.gammelt = R.fx.blod;
          ut.u = R.post.uniforms.uVaatt.value; ut.tex = R.post.uniforms.tVaatt.value === Vaatt.tex;
          // de tunge renner: spol fram i fysikken
          const y0 = Math.max(...D.filter(d => d.r > 3 * Vaatt.H / 135).map(d => d.y), 0); for (let i = 0; i < 20; i++) Vaatt.fysikk(.05);
          ut.glir = Vaatt.tall.sklidd > 0 && Vaatt.spor.length > 0; ut.nedover = Vaatt.draper.some(d => d.glir && d.y > y0);
          // to dråper oppå hverandre blir én
          Vaatt.tom(); Vaatt.ny(50, 50, 2, false); Vaatt.ny(51, 50, 2, false); const s0 = Vaatt.tall.slatt; Vaatt.fysikk(.016); ut.slatt = Vaatt.tall.slatt - s0 === 1 && Vaatt.draper.length === 1;
          // noe som dør tett ved, spruter
          Vaatt.tom(); const e = spawnEnemyBareTest('pleier', P.x + 1, P.z); killEntity(e, { from: 'player', x: P.x, z: P.z }); ut.drap = Vaatt.draper.length;
          // alt tørker bort, og da er etterbehandlingen fri
          for (let i = 0; i < 700; i++) Vaatt.fysikk(.05); await vent(200); ut.torr = Vaatt.draper.length === 0 && Vaatt.spor.length === 0 && R.post.uniforms.uVaatt.value === 0;
          // regn ute og plask
          G.F.ute = true; Sound.vaerType = 'regn'; for (let i = 0; i < 60; i++) Vaatt.regn(.05); ut.regn = Vaatt.draper.filter(d => !d.blod).length; Sound.vaerType = null;
          Vaatt.tom(); Sound.play('splash'); ut.plask = Vaatt.draper.length;
          // innstillingene: uten blod ingen blodsprut på glasset, og av betyr tørt
          Vaatt.tom(); G.meta.settings.blod = false; applySettings(); Blod.treff(P, { x: P.x + 2, z: P.z }, 45); ut.utenBlod = Vaatt.draper.length; G.meta.settings.blod = true; applySettings();
          Blod.treff(P, { x: P.x - 2, z: P.z }, 45); await vent(200); G.meta.settings.vaatt = false; applySettings(); await vent(200); ut.av = Vaatt.draper.length === 0 && R.post.uniforms.uVaatt.value === 0;
          Blod.treff(P, { x: P.x - 2, z: P.z }, 45); ut.avGammelt = R.fx.blod > 0; G.meta.settings.vaatt = true; applySettings();
          return ut; }""")
    sjekk('treff gir bloddråper på glasset fra siden slaget kom fra, i stedet for det gamle blodet i kanten', ut['aktiv'] and ut['n'] >= 6 and ut['blod'] and ut['hoyre'] > .6 and ut['gammelt'] == 0 and ut['u'] == 1 and ut['tex'], ut)
    sjekk('de tunge dråpene renner nedover og legger igjen spor, og dråper som møtes, blir én', ut['glir'] and ut['nedover'] and ut['slatt'], [ut['glir'], ut['nedover'], ut['slatt']])
    sjekk('drap tett ved spruter, og alt tørker bort så etterbehandlingen blir fri', ut['drap'] > 0 and ut['torr'], [ut['drap'], ut['torr']])
    sjekk('regn ute og plask gir vann på glasset', ut['regn'] >= 5 and ut['plask'] > 0, [ut['regn'], ut['plask']])
    sjekk('uten «Blod og skrekkeffekter» kommer ikke blodet, og uten «Blod og vann på skjermen» er glasset tørt og det gamle blodet tilbake', ut['utenBlod'] == 0 and ut['av'] and ut['avGammelt'], [ut['utenBlod'], ut['av'], ut['avGammelt']])
    await pg.screenshot(path='/tmp/e_20vaatt.png')
    sjekk('ingen konsollfeil (vått på skjermen)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_44(b):
    # 44) Varsler og slag uten lekkasje
    #     Varsler som går av, avbrytes eller ryddes bort når etasjen byttes, og hugg legger ikke igjen geometri på skjermkortet,
    #     shaderne bygges ikke på nytt for hvert angrep, og R.kastTele får vite hvorfor varselet kastes.
    #     Før rettingen: +1500 geometrier for 300 varsler, +101 for 20 avbrutte og +60 for 60 hugg.
    VL_HJELP = """const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)),
            spill = async (t, maks = 30000) => { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < t && performance.now() - t0 < maks) await vent(50); },
            // til ingen varsler eller hugg er igjen: spillet må gå, men taket i sanntid er romslig, for mange varsler samtidig er tungt i programvaregrafikk
            tomt = async () => { const t0 = performance.now(); while ((G.tele.length || VFX.slashes.length) && performance.now() - t0 < 120000) await vent(50); await spill(.1); },
            ramme = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))),
            info = R.renderer.info.memory, former = ['circle', 'rect', 'cone'], buer = [1.2, 1.6, 2.2, Math.PI * 2 - .01], ut = {};
          // blekkvarslene (del 46) lager ingen geometri per varsel, så her måles den gamle tegningen, som enkel grafikk og overløpet fortsatt bruker
          Blekk.av = true; rolig(); P.hp = P.maxHp = 1e6; P.invuln = 999; await spill(.3);
          // oppvarming: ett varsel av hver form og ett hugg per bue, så det som lages én gang (ringene til huggene og shaderne), er laget
          for (let i = 0; i < 4; i++) { addTele(former[i % 3], { x: P.x + 2, z: P.z, r: 1.2, w: .6, len: 3, a: i, arc: 1.4 }, .2, null, null); slashFx(P.x, P.z, i, 1.4, buer[i], i % 2 === 0); }
          await tomt();"""
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg)
    vl = await pg.evaluate("""async () => { """ + VL_HJELP + """
          // shaderne telles rett på WebGL: et materiale som kastes, tar shaderen med seg når ingen andre bruker den, og da bygges den på nytt neste gang
          const gl = R.renderer.getContext(), lp = gl.linkProgram; let lenk = 0; gl.linkProgram = function (p) { lenk++; return lp.call(this, p); };
          // 300 varsler som går av: sirkel, rektangel og kjegle om hverandre. Toppen viser at de faktisk kom på skjermkortet
          const g0 = info.geometries;
          for (let i = 0; i < 300; i++) { const a = i * .37; addTele(former[i % 3], { x: P.x + Math.sin(a) * 2, z: P.z + Math.cos(a) * 2, r: 1 + (i % 5) * .3, w: .6, len: 4, a, arc: 1.4, color: [0xff4a22, 0x9ad0e0, 0xb36be0][i % 3] }, .3, null, null); }
          await ramme(); const topp = info.geometries - g0; await tomt(); await spill(.5);
          ut.fyr = { topp, dg: info.geometries - g0, igjen: G.tele.length };
          // 20 varsler på én eier, som så stanses: de går ikke av og frigjøres
          const g1 = info.geometries, eier = { alive: true, stun: 0, sleep: 0 }; let fyrt = 0;
          for (let i = 0; i < 20; i++) addTele(former[i % 3], { x: P.x + 1, z: P.z + (i % 4) * .5, r: 1.2, w: .6, len: 3, a: i, arc: 1.2 }, 5, () => fyrt++, eier);
          await ramme(); const midt = info.geometries - g1; cancelTeles(eier); await spill(.3);
          ut.avbrutt = { midt, dg: info.geometries - g1, igjen: G.tele.length, eier: eier.teles.length, fyrt };
          // 60 hugg: ringen deles av alle hugg med samme bue, og materialene brukes om igjen
          const g2 = info.geometries;
          for (let i = 0; i < 60; i++) { slashFx(P.x + (i % 3) - 1, P.z, i * .3, 1 + (i % 5) * .4, buer[i % 4], i % 2 === 0); if (i % 10 === 9) await ramme(); }
          await tomt(); ut.hugg = { dg: info.geometries - g2, igjen: VFX.slashes.length };
          // ringen er like stor som før: indre radius 0,68 r, ytre r, buen rundet til 0,05 (helt rundt som før) og midt foran
          slashFx(P.x, P.z, 0, 2, 1.62, false); slashFx(P.x, P.z, 1, 3, 1.6, false); slashFx(P.x, P.z, 2, 3.8, Math.PI * 2 - .01, true);
          const S = VFX.slashes.slice(-3), maal = s => { const q = s.m.geometry.parameters, k = s.m.scale.x; return [q.innerRadius * k, q.outerRadius * k, q.thetaLength, q.thetaStart + q.thetaLength / 2].map(v => +v.toFixed(3)); };
          ut.maal = { a: maal(S[0]), b: maal(S[1]), c: maal(S[2]), delt: S[0].m.geometry === S[1].m.geometry }; await tomt();
          // hugg og varsler én og én, hvert ferdig før det neste kommer: ingen shader bygges på nytt
          lenk = 0;
          for (let i = 0; i < 8; i++) { slashFx(P.x, P.z, i, 1.5, buer[i % 4], i % 2 === 0); await tomt(); }
          for (let i = 0; i < 6; i++) { addTele(former[i % 3], { x: P.x + 2, z: P.z, r: 1.3, w: .6, len: 3, a: i, arc: 1.4, color: 0x9ad0e0 }, .2, null, null); await tomt(); }
          ut.lenk = lenk;
          // hvorfor varselet kastes: 'fyr' når angrepet går av, 'avbryt' når eieren er stanset eller stoppes, og 'rydd' når etasjen byttes
          const hvorfor = [], _k = R.kastTele; R.kastTele = function (g, how) { hvorfor.push(how); return _k.apply(this, arguments); };
          const e1 = { alive: true, stun: 0, sleep: 0 }, e2 = { alive: true, stun: 0, sleep: 0 }, e3 = { alive: true, stun: 0, sleep: 0 }, gikk = [];
          addTele('circle', { x: P.x + 2, z: P.z, r: 1 }, .2, () => gikk.push(1), e1); addTele('circle', { x: P.x - 2, z: P.z, r: 1 }, .2, () => gikk.push(2), e2); e2.stun = 5;
          addTele('rect', { x: P.x, z: P.z + 1, a: 0, w: .6, len: 3 }, 5, () => gikk.push(3), e3); await ramme(); cancelTeles(e3); await tomt();
          ut.hvorfor = { liste: hvorfor.slice().sort(), gikk }; hvorfor.length = 0;
          // etasjen byttes med varsler og hugg i lufta: alt tas ut, og geometrien til varselet frigjøres
          const t = addTele('circle', { x: P.x, z: P.z + 2, r: 1.5 }, 5, null, null); for (let i = 0; i < 5; i++) slashFx(P.x, P.z, i, 1.5, 1.6, true); await ramme();
          let n = 0, kastet = 0; t.mesh.traverse(o => { if (o.geometry) { n++; o.geometry.addEventListener('dispose', () => kastet++); } });
          startFloor(G.depth, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } await vent(200);
          ut.rydd = { hvorfor: hvorfor.slice(), n, kastet, ute: !t.mesh.parent, tele: G.tele.length, hugg: VFX.slashes.length };
          R.kastTele = _k; gl.linkProgram = lp;
          return ut; }""")
    sjekk('300 varsler som går av, legger ikke igjen geometri på skjermkortet', vl['fyr']['topp'] >= 1000 and vl['fyr']['dg'] <= 2 and vl['fyr']['igjen'] == 0, vl['fyr'])
    sjekk('20 varsler på en eier som stanses, går ikke av og legger ikke igjen geometri', vl['avbrutt']['midt'] >= 60 and vl['avbrutt']['dg'] <= 2 and vl['avbrutt']['igjen'] == 0 and vl['avbrutt']['eier'] == 0 and vl['avbrutt']['fyrt'] == 0, vl['avbrutt'])
    naer = lambda a, b: len(a) == len(b) and all(abs(x - y) < .002 for x, y in zip(a, b))
    m = vl['maal']
    sjekk('60 hugg legger høyst igjen to geometrier, og ringen deles og er like stor som før', vl['hugg']['dg'] <= 2 and vl['hugg']['igjen'] == 0 and m['delt'] and naer(m['a'], [1.36, 2, 1.6, -1.571]) and naer(m['b'], [2.04, 3, 1.6, -1.571]) and naer(m['c'], [2.584, 3.8, 6.273, -1.571]), {'hugg': vl['hugg'], 'maal': m})
    sjekk('shaderne til varsler og hugg bygges ikke på nytt for hvert angrep', vl['lenk'] <= 2, vl['lenk'])
    r_ = vl['rydd']
    sjekk('varselet kastes med fyr, avbryt (stanset eier og cancelTeles) og rydd når etasjen byttes, og bare det som går av, treffer', vl['hvorfor'] == {'liste': ['avbryt', 'avbryt', 'fyr'], 'gikk': [1]} and 'rydd' in r_['hvorfor'] and r_['n'] == 4 and r_['kastet'] == 4 and r_['ute'] and r_['tele'] == 0 and r_['hugg'] == 0, {'hvorfor': vl['hvorfor'], 'rydd': r_})
    sjekk('ingen konsollfeil (varsler og hugg i 2D)', not pg.errs, pg.errs[:6])
    await pg.close()
    # én runde i 3D
    pg = await ny_side(b, viewport={'width': 960, 'height': 540})
    await start_lop(pg, url=URL3D)
    v3 = await pg.evaluate("""async () => { """ + VL_HJELP + """
          ut.d3 = D3.on; const g0 = info.geometries;
          for (let i = 0; i < 60; i++) { const a = i * .41; addTele(former[i % 3], { x: P.x + Math.sin(a) * 2, z: P.z + Math.cos(a) * 2, r: 1 + (i % 4) * .3, w: .6, len: 4, a, arc: 1.4 }, .4, null, null); if (i % 3 === 0) slashFx(P.x, P.z, a, 1.6, buer[i % 4], i % 2 === 0); }
          await ramme(); ut.topp = info.geometries - g0; await tomt(); await spill(.5); ut.dg = info.geometries - g0;
          return ut; }""")
    sjekk('3D: 60 varsler og 20 hugg legger ikke igjen geometri', v3['d3'] and v3['topp'] >= 200 and v3['dg'] <= 2, v3)
    sjekk('ingen konsollfeil (varsler og hugg i 3D)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_46(b):
    # 46) Blekkvarsel
    #     Alle angrepsvarsler tegnes av én blekkshader (46_blekk.js): 30 varsler koster høyst to tegnekall (varslene og lysplatene),
    #     ingen geometri per varsel, plassene er frie etter bruk og etter etasjebytte, formen i shaderen er den samme som inShape,
    #     sonen er tegnet inne i sirkelen og ikke utenfor, varselet følger eieren, etterbildet og den grå oppløsningen varer som de skal,
    #     alle fargene i koden har en skadetype som leses på mørkt gulv, og enkel grafikk tegner på den gamle måten.
    import re as _re, io as _io
    from PIL import Image as _Img
    import urllib.parse as _up
    _src = pathlib.Path(_up.unquote(URL3D[len('file://'):])).parent.parent / 'src'
    farger = {}
    for _f in sorted(_src.glob('*.js')):
        for _m in _re.findall(r'color: 0x([0-9a-fA-F]+)', _f.read_text(encoding='utf-8')): farger.setdefault(int(_m, 16), set()).add(_f.name)
    # nye fiender i spor C (49 og 50) kan bruke gjettingen fra fargetonen, resten skal stå i TELE_FARGE
    maa_sta = [c for c, fs in farger.items() if any(not (f.startswith('49_') or f.startswith('50_')) for f in fs)]
    BK_HJELP = """const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)),
            spill = async (t, maks = 30000) => { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < t && performance.now() - t0 < maks) await vent(50); },
            tomt = async () => { const t0 = performance.now(); while (G.tele.length && performance.now() - t0 < 120000) await vent(50); await spill(.4); },
            rydd = () => { for (const t of G.tele) R.kastTele(t.mesh, 'rydd', t); G.tele = []; Blekk.tom(); },
            kall = () => { const i = R.renderer.info; i.autoReset = false; i.reset(); R.render(0); const n = i.render.calls; i.autoReset = true; return n; },
            eier = () => ({ alive: true, stun: 0, sleep: 0 }), ut = {};"""
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg)
    bk = await pg.evaluate("""async () => { """ + BK_HJELP + """
          rolig(); P.hp = P.maxHp = 1e6; P.invuln = 999; await spill(.3); rydd();
          // tegnekall: 30 varsler samtidig mot ingen
          addTele('circle', { x: P.x, z: P.z + 2, r: 1 }, .1, null, null); await tomt(); const k0 = kall(), E = eier(), former = ['circle', 'rect', 'cone'];
          for (let i = 0; i < 30; i++) { const a = i * .41; addTele(former[i % 3], { x: P.x + Math.sin(a) * 3, z: P.z + Math.cos(a) * 3, r: 1 + (i % 4) * .4, w: .3 + (i % 3) * .5, len: 4, a, arc: 1.4, color: [0xb3261e, 0x9ad0e0, 0xb36be0, 0xffe25a][i % 4] }, 30, null, E); }
          await spill(.05); ut.kall = { k0, k1: kall(), blekk: G.tele.filter(t => t.mesh.isBlekk).length, kval: Blekk.kval() }; cancelTeles(E); await tomt();
          // 300 varsler: 48 i blekk, resten på den gamle måten, og ingenting blir liggende
          const info = R.renderer.info.memory, g0 = info.geometries;
          for (let i = 0; i < 300; i++) { const a = i * .37; addTele(former[i % 3], { x: P.x + Math.sin(a) * 2, z: P.z + Math.cos(a) * 2, r: 1 + (i % 5) * .3, w: .6, len: 4, a, arc: 1.4 }, .3, null, null); }
          ut.pool = { blekk: G.tele.filter(t => t.mesh.isBlekk).length, gamle: G.tele.filter(t => t.mesh.isGroup).length, fulle: Blekk.ledige };
          await tomt(); ut.pool.dg = info.geometries - g0; ut.pool.ledige = Blekk.ledige;
          for (let i = 0; i < 10; i++) addTele(former[i % 3], { x: P.x + i * .3, z: P.z, r: 1.2, w: .6, len: 3, a: i, arc: 1.2 }, 5, null, null);
          await spill(.05); ut.pool.for = Blekk.ledige; startFloor(G.depth, false); ut.pool.etter = Blekk.ledige;
          for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } await vent(200); rolig(); P.hp = P.maxHp = 1e6; P.invuln = 999; await spill(.2);
          // formen: speilet i JS av avstandsfeltet i shaderen mot inShape, 2000 punkter per form (ikke de nærmere kanten enn 0,05)
          const S = [['circle', { r: 1.7 }], ['circle', { r: .5 }], ['rect', { w: .35, len: 10, a: .66 }], ['rect', { w: 2.4, len: 6, a: -2.1 }], ['cone', { r: 2.2, arc: 1.6, a: .4 }],
            ['cone', { r: 2.8, arc: 2.2, a: 3 }], ['cone', { r: .5, arc: 1.9, a: 1 }], ['cone', { r: 3, arc: 4.2, a: -1 }], ['cone', { r: 2, arc: Math.PI * 2 - .01, a: 2 }]];
          ut.form = { n: 0, naer: 0, feil: [], inne: 0 };
          for (const [f, o0] of S) {
            const o = Object.assign({ x: P.x + .3, z: P.z - .2 }, o0), t = addTele(f, o, 30, null, null); await spill(.02); const s = Blekk.finn(t), R_ = (o.len || o.r) + 1;
            let feil = 0; for (let k = 0; k < 2000; k++) { const x = o.x + (Math.random() * 2 - 1) * R_, z = o.z + (Math.random() * 2 - 1) * R_, d = Blekk.avstand(s, x, z); if (Math.abs(d) < .05) { ut.form.naer++; continue; } ut.form.n++; if (d < 0) ut.form.inne++; if ((d < 0) !== inShape(t, x, z)) feil++; }
            if (feil) ut.form.feil.push(f + ' ' + JSON.stringify(o0) + ': ' + feil); rydd();
          }
          // følger eieren: blekk og den gamle tegningen
          const B = Object.assign(eier(), { x: P.x + 1, z: P.z }), tf = addTele('circle', { x: B.x, z: B.z, r: 3, folg: B }, 5, null, B); await spill(.05); B.x += 2; B.z += .5; await spill(.1);
          const sf = Blekk.finn(tf); ut.folg = { sx: sf.x, sz: sf.z, bx: B.x, bz: B.z }; rydd();
          Blekk.av = true; const B2 = Object.assign(eier(), { x: P.x - 1, z: P.z }), tg = addTele('circle', { x: B2.x, z: B2.z, r: 2, folg: B2 }, 5, null, B2); await spill(.05); B2.x -= 2; await spill(.1);
          ut.folg.gammel = { gx: tg.mesh.position.x, bx: B2.x, gruppe: !!tg.mesh.isGroup }; Blekk.av = false; rydd();
          // etterbildet når angrepet går av, grå oppløsning når eieren stanses
          const t1 = addTele('circle', { x: P.x + 2, z: P.z, r: 1 }, .3, null, null), s1 = Blekk.finn(t1), E2 = eier(), t2 = addTele('circle', { x: P.x - 2, z: P.z, r: 1 }, 5, null, E2), s2 = Blekk.finn(t2);
          await spill(.05); cancelTeles(E2); ut.slutt = { st2: s2.state }; const t0 = performance.now(); let st1 = 0;
          while ((s1.bruk || s2.bruk) && performance.now() - t0 < 60000) { if (s1.bruk && s1.state === 1) st1 = 1; await vent(10); }
          Object.assign(ut.slutt, { st1, l1: s1.logg, l2: s2.logg, ledige: Blekk.ledige });
          // enkel grafikk: den gamle tegningen, også for et blekkvarsel som allerede er ute
          const tb = addTele('circle', { x: P.x, z: P.z + 2, r: 1.2 }, 5, null, null); await spill(.05); const varBlekk = !!tb.mesh.isBlekk;
          R.safe = true; const ts = [addTele('circle', { x: P.x, z: P.z, r: 1 }, 5, null, null), addTele('rect', { x: P.x, z: P.z, w: .6, len: 3, a: 1 }, 5, null, null), addTele('cone', { x: P.x, z: P.z, r: 2, arc: 1.4, a: 2 }, 5, null, null)];
          await spill(.1); ut.safe = { gruppe: ts.every(t => t.mesh instanceof THREE.Group), varBlekk, over: !!(tb.mesh.g && tb.mesh.g.isGroup), ledige: Blekk.ledige, synlig: Blekk.mesh.visible };
          rydd(); R.safe = false; await spill(.1);
          // skadetypene: fra o.type, fargen og eieren
          ut.typer = [teleType({ type: 'strom', color: 0xb3261e }), teleType({ color: 0x3a2a44 }), teleType({}, { type: 'oppasser' }), teleType({}, { type: 'kultist' }), teleType({}), teleType({ color: 0x123456 })];
          return ut; }""")
    k = bk['kall']
    sjekk('30 varsler samtidig koster høyst to tegnekall (varslene og lysplatene)', k['blekk'] == 30 and k['k1'] - k['k0'] <= 2 and k['kval'] == 1, k)
    po = bk['pool']
    sjekk('300 varsler: 48 plasser i blekk, resten på den gamle måten, ingen geometri blir liggende og plassene er frie etterpå og etter etasjebytte', po['blekk'] == 48 and po['gamle'] == 252 and po['fulle'] == 0 and po['dg'] <= 2 and po['ledige'] == 48 and po['for'] == 38 and po['etter'] == 48, po)
    fo = bk['form']
    sjekk('formen i shaderen er den samme som inShape (2000 punkter per form, ni former)', not fo['feil'] and fo['n'] > 15000 and fo['inne'] > 2000, fo)
    f_ = bk['folg']
    sjekk('varselet følger eieren (o.folg), også på den gamle måten', abs(f_['sx'] - f_['bx']) < 1e-6 and abs(f_['sz'] - f_['bz']) < 1e-6 and f_['gammel']['gruppe'] and abs(f_['gammel']['gx'] - f_['gammel']['bx']) < 1e-6, f_)
    sl = bk['slutt']; l1, l2 = sl['l1'] or {}, sl['l2'] or {}
    sjekk('etterbildet ligger høyst 0,18 s (fritt første bilde etter), den grå oppløsningen høyst 0,15 s, og plassene er frie',
          sl['st1'] == 1 and l1.get('state') == 1 and l1['t'] >= .18 and l1['t'] - l1['dt'] < .18 + 1e-6 and sl['st2'] == 2 and l2.get('state') == 2 and l2['t'] >= .15 and l2['t'] - l2['dt'] < .15 + 1e-6 and sl['ledige'] == 48, sl)
    sa = bk['safe']
    sjekk('enkel grafikk: alle varsler tegnes på den gamle måten, og et blekkvarsel som er ute, går over til den', sa['gruppe'] and sa['varBlekk'] and sa['over'] and sa['ledige'] == 48, sa)
    sjekk('skadetypen kommer fra o.type, så fargen, så eieren', bk['typer'][:5] == ['strom', 'gass', 'gift', 'morb', 'fysisk'] and bk['typer'][5] in ('vann', 'gass', 'morb'), bk['typer'])
    fa = await pg.evaluate("""(fs) => { const ut = { mangler: [], ukjent: [], lum: {} };
          for (const c of fs.alle) if (!TELE_TYPE[teleType({ color: c })]) ut.ukjent.push(c.toString(16));
          for (const c of fs.maa) if (!TELE_FARGE[c]) ut.mangler.push(c.toString(16));
          for (const [k, T] of Object.entries(TELE_TYPE)) { const c = new THREE.Color(T.farge); ut.lum[k] = +(.2126 * c.r + .7152 * c.g + .0722 * c.b).toFixed(3); }
          return ut; }""", {'alle': list(farger), 'maa': maa_sta})
    sjekk('alle %d fargene i koden har en skadetype, og hver type er lys nok (luminans minst 0,35)' % len(farger), len(farger) >= 48 and not fa['mangler'] and not fa['ukjent'] and len(fa['lum']) == 11 and min(fa['lum'].values()) >= .35, fa)
    # pikslene: sonen er tegnet inne i sirkelen og ikke utenfor (snitt over 9 x 9 punkter, før og etter)
    pos = await pg.evaluate("""async () => { """ + BK_HJELP + """
          // innendørs (ingen regn som endrer pikslene), i det største rommet
          G.run.seed = 11; startFloor(2, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } await vent(200);
          const inne = r => !Vaer.ute(r.x + r.w / 2, r.z + r.h / 2), rr = G.F.rooms.filter(inne);
          rolig(); R.shakeOn = false; rydd(); const r = (rr.length ? rr : G.F.rooms).slice().sort((a, b) => b.w * b.h - a.w * a.h)[0], c = freeSpot(r.x + r.w / 2 - .4, r.z + r.h / 2, 3);
          P.x = c.x; P.z = c.z; P.vx = P.vz = 0; R.snapCamera(P.x, P.z); await spill(.6);
          const q = (x, z) => { const s = R.project(x, 0, z); return [Math.round(s.x), Math.round(s.y)]; };
          return { inne: q(P.x + 3 + .75, P.z), ute: q(P.x + 3 + 2.1, P.z), rinne: q(P.x - 1.2, P.z - 2.5), rute: q(P.x - 2.3, P.z - 2.5) }; }""")
    def flekk(png, xy):
        im = _Img.open(_io.BytesIO(png)).convert('RGB'); x0, y0 = xy
        px = [im.getpixel((x0 + i, y0 + j)) for i in range(-4, 5) for j in range(-4, 5)]
        return [sum(p[k] for p in px) / len(px) for k in range(3)]
    for_ = await pg.screenshot()
    await pg.evaluate("""async () => { """ + BK_HJELP + """
          const t = addTele('circle', { x: P.x + 3, z: P.z, r: 1.5 }, 30, null, null); t.t = 3; const u = addTele('rect', { x: P.x - 1.2, z: P.z - .5, a: Math.PI, w: .8, len: 4 }, 30, null, null); u.t = 3; await spill(.15); }""")
    etter = await pg.screenshot()
    await pg.screenshot(path='/tmp/e_46_piksler.png')
    dlt = lambda xy: sum(abs(a - b) for a, b in zip(flekk(for_, xy), flekk(etter, xy))) / 3
    px_ = {k: round(dlt(v), 1) for k, v in pos.items()}
    sjekk('pikslene: sirkelen er fylt inne (endring over 25, banen over 15) og urørt utenfor (under 8)', px_['inne'] > 25 and px_['ute'] < 8 and px_['rinne'] > 15 and px_['rute'] < 8, px_)
    sjekk('ingen konsollfeil (blekkvarsel i 2D)', not pg.errs, pg.errs[:6])
    await pg.close()
    # én runde i 3D: shaderen lenker, høy kvalitet, ett tegnekall, og ingen geometri blir liggende
    pg = await ny_side(b, viewport={'width': 960, 'height': 540})
    await start_lop(pg, url=URL3D)
    b3 = await pg.evaluate("""async () => { """ + BK_HJELP + """
          rolig(); P.hp = P.maxHp = 1e6; P.invuln = 999; await spill(.3); rydd(); ut.d3 = D3.on;
          addTele('circle', { x: P.x, z: P.z + 2, r: 1 }, .1, null, null); await tomt(); const k0 = kall(), g0 = R.renderer.info.memory.geometries, former = ['circle', 'rect', 'cone'], B = Object.assign(eier(), { kind: 'boss', type: 'krok' });
          for (let i = 0; i < 24; i++) { const a = i * .5; addTele(former[i % 3], { x: P.x + Math.sin(a) * 2.5, z: P.z + Math.cos(a) * 2.5, r: 1 + (i % 4) * .6, w: .4 + (i % 3) * .6, len: 5, a, arc: 1.6, color: [0xb3261e, 0x9ad0e0, 0xffe25a, 0x3a2a44][i % 4], stille: true }, 1.2, null, i % 5 ? null : B); } // stille: nedslagene (merkene og lynene) prøves i del 49
          await spill(.3); const q = R.renderer.properties.get(Blekk.mat), pr = q.currentProgram || q.program;
          const k2 = kall(); Blekk.mesh.visible = false; const k3 = kall(); Blekk.mesh.visible = true;
          Object.assign(ut, { k: k2 - k0, egne: k2 - k3, blekk: G.tele.filter(t => t.mesh.isBlekk).length, kval: Blekk.kval(), lenket: !!pr && !(pr.diagnostics && !pr.diagnostics.runnable) && !Blekk.brutt, lys: Blekk.lys.visible });
          await tomt(); ut.dg = R.renderer.info.memory.geometries - g0; ut.ledige = Blekk.ledige; return ut; }""")
    await pg.screenshot(path='/tmp/e_46_3d.png')
    sjekk('3D: shaderen lenker, høy kvalitet, 24 varsler koster høyst to tegnekall, ingen lysplater, og ingenting blir liggende', b3['d3'] and b3['lenket'] and b3['blekk'] == 24 and b3['k'] <= 2 and b3['egne'] == 1 and b3['kval'] == 2 and not b3['lys'] and b3['dg'] <= 1 and b3['ledige'] == 48, b3)
    sjekk('ingen konsollfeil (blekkvarsel i 3D)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_47(b):
    # 47) Blod som renner
    #     Blodet på glasset renner som ekte blod (10.png): ingen lange, rette streker fra toppen, sporene smalner og slingrer, en dråpe
    #     renner et stykke og stanser, høyst seks bloddråper renner samtidig, og lerretet lastes opp annethvert bilde når ingenting renner.
    RENN47 = """async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), ramme = n => new Promise(r => { const f = () => --n <= 0 ? r() : requestAnimationFrame(f); requestAnimationFrame(f); }), ut = {};
          for (const e of G.enemies) if (e.alive) killEntity(e, {}); P.hp = P.maxHp = 100; P.invuln = 999; Sound.vaerType = null; G.F.ute = false; Vaatt.tom(); await vent(200);
          const V = Vaatt, mr = Math.random; let fr = 4747; Math.random = () => { fr |= 0; fr = fr + 0x6D2B79F5 | 0; let t = Math.imul(fr ^ fr >>> 15, 1 | fr); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
          try {
            // tolv tunge treff med hvert sitt frø og 8 sekunder etter hvert: den lengste loddrette stripen med blod i en kolonne av lerretet, målt hvert sekund.
            // Ett treff alene gir en håndfull spor, og hvor mange av dem som slingrer og smalner, avhenger av frøet og av hvor mye Blod.treff trakk fra Math.random før
            // (etasjen), så ett treff med «alle sporene» feilet omtrent hver tredje gang. Andelene over tolv treff er stabile.
            V.tom(); V.init(); const k = V.kk(), W = V.W, H = V.H, alle = new Set(); let stripe = 0, maksGlir = 0;
            for (let h = 0; h < 12; h++) {
              fr = 4747 + 131 * h; V.tom(); Blod.treff(P, { x: P.x + 2, z: P.z }, 80);
              for (let i = 1; i <= 160; i++) {
                V.fysikk(.05); for (const s of V.spor) if (s.blod) alle.add(s); maksGlir = Math.max(maksGlir, V.draper.filter(d => d.glir && d.blod).length);
                if (i % 20 === 0) { V.tegn(); const D = V.g.getImageData(0, 0, W, H).data; for (let x = 0; x < W; x++) { let n = 0; for (let y = 0; y < H; y++) { n = D[(y * W + x) * 4 + 1] > 20 ? n + 1 : 0; if (n > stripe) stripe = n; } } }
              }
            }
            // sporene med minst seks punkter: smalere nederst enn øverst, og de slingrer (andelen av alle sporene, og hvor mye de smalner i midten)
            const lange = [...alle].filter(s => s.p.length >= 24).map(s => { const p = s.p, xs = p.filter((_, i) => i % 4 === 0); return { forst: p[2], sist: p[p.length - 2], bredde: Math.max(...xs) - Math.min(...xs) }; }), n = Math.max(1, lange.length), fh = lange.map(s => s.sist / s.forst).sort((a, b) => a - b);
            ut.tungt = { stripe, H, maksGlir, spor: alle.size, lange: lange.length, smalner: +(lange.filter(s => s.sist <= .8 * s.forst).length / n).toFixed(2), slingrer: +(lange.filter(s => s.bredde >= 1.5 * k).length / n).toFixed(2), forhold: +(fh[fh.length >> 1] || 1).toFixed(2), punkter: [...alle].every(s => s.p.length % 4 === 0) };
            // 30 enkeltdråper på r = 3,5 k: hvor langt de renner før de stanser
            const L = []; for (let n = 0; n < 30; n++) { V.tom(); const d = V.ny(W * (.1 + .8 * n / 29), H * .2, 3.5 * k, true); d.ny = 0; const y0 = d.y; for (let i = 0; i < 400 && (i < 3 || d.glir); i++) V.fysikk(.05); L.push(d.y - y0); }
            L.sort((a, b) => a - b); ut.enkle = { median: +((L[14] + L[15]) / 2).toFixed(1), maks: +L[29].toFixed(1), min: +L[0].toFixed(1), H, stanset: L.length === 30 };
          } finally { Math.random = mr; }
          // opplastingen: annethvert bilde når sporene bare blekner, hvert bilde når noe renner
          V.tom(); await ramme(3); const t0 = V.tick; let n = 0; V.tick = function (dt) { n++; return t0.call(this, dt); };
          try {
            V.spor.push({ p: [50, 20, 3, V.klokke, 52, 60, 3, V.klokke], blod: true, id: 1 }); await ramme(2); n = 0; let v0 = V.tex.version; await ramme(24); ut.blekner = +((V.tex.version - v0) / Math.max(1, n)).toFixed(2);
            const d = V.ny(V.W * .5, V.H * .1, 6 * V.kk(), true); d.ny = 0; await ramme(3); n = 0; v0 = V.tex.version; await ramme(12); ut.renner = +((V.tex.version - v0) / Math.max(1, n)).toFixed(2); ut.glir = d.glir;
          } finally { V.tick = t0; }
          V.tom(); return ut; }"""
    UA47 = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    for navn, kw in (('PC', {'viewport': {'width': 1280, 'height': 720}}), ('stående telefon', {'viewport': {'width': 390, 'height': 844}, 'has_touch': True, 'is_mobile': True, 'device_scale_factor': 2, 'user_agent': UA47})):
        pg = await ny_side(b, **kw)
        await start_lop(pg)
        ut = await pg.evaluate(RENN47)
        t = ut['tungt']
        sjekk(f'{navn}: tunge treff gir ingen lange, rette streker på glasset (lengste stripe under halve høyden)', t['stripe'] < .5 * t['H'] and t['spor'] > 0, t)
        sjekk(f'{navn}: minst tre av fire spor smalner mot dråpen og slingrer, punktene har bredde og alder, og høyst seks bloddråper renner samtidig', t['lange'] >= 20 and t['smalner'] >= .75 and t['slingrer'] >= .75 and t['forhold'] <= .8 and t['punkter'] and 0 < t['maksGlir'] <= 6, t)
        e = ut['enkle']
        if navn == 'PC':
            sjekk('en enkelt dråpe renner et stykke og stanser (median 25 til 60 punkter, ingen over 0,6 av høyden)', e['stanset'] and 25 <= e['median'] <= 60 and e['maks'] < .6 * e['H'], e)
        else:
            sjekk(f'{navn}: en enkelt dråpe renner et stykke og stanser (ingen over 0,6 av høyden)', e['stanset'] and e['min'] > 0 and e['maks'] < .6 * e['H'], e)
        sjekk(f'{navn}: lerretet lastes opp annethvert bilde når sporene bare blekner, og hvert bilde når noe renner', .3 <= ut['blekner'] <= .7 and ut['renner'] >= .9 and ut['glir'], [ut['blekner'], ut['renner'], ut['glir']])
        sjekk(f'ingen konsollfeil (blod som renner, {navn})', not pg.errs, pg.errs[:6])
        await pg.close()
    # og en gang i 3D: et tungt treff og 3 sekunder spilltid
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg, url=URL3D)
    ut = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t));
          rolig(); P.hp = P.maxHp = 100; P.invuln = 999; Sound.vaerType = null; Vaatt.tom(); await vent(200); Blod.treff(P, { x: P.x + 2, z: P.z }, 80);
          const g0 = G.time, t0 = performance.now(); while (G.time - g0 < 3 && performance.now() - t0 < 60000) await vent(50);
          return { u: R.post.uniforms.uVaatt.value, spor: Vaatt.spor.length, draper: Vaatt.draper.length, tid: +(G.time - g0).toFixed(2) }; }""")
    await pg.screenshot(path='/tmp/e_47_blod.png')
    sjekk('3D: blodet ligger på glasset etter et tungt treff og 3 sekunder', ut['u'] == 1 and ut['draper'] > 0, ut)
    sjekk('ingen konsollfeil (blod som renner i 3D)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_48(b):
    # 48) Blekkpartikler
    #     Partiklene er flater i blekk og papir som vender mot kameraet, med fire tegninger fra ett ark (gnist, dråpe, papirbit og støv),
    #     ikke klosser: 900 partikler koster ett tegnekall, fargene kommer fram (før var alle svarte, fordi fargelista ble laget tom),
    #     gnistene strekkes ut langs farten, formen gjettes fra fargen, enkel grafikk gir klossene tilbake uten å legge igjen geometri,
    #     og alt er borte etterpå.
    import io as _io48
    from PIL import Image as _Img48
    PT_HJELP = """const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)),
            spill = async (t, maks = 30000) => { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < t && performance.now() - t0 < maks) await vent(50); },
            tomt = async () => { const t0 = performance.now(); while (Particles.n && performance.now() - t0 < 60000) await vent(50); },
            kall = () => { const i = R.renderer.info; i.autoReset = false; i.reset(); R.render(0); const n = i.render.calls; i.autoReset = true; return n; },
            lenket = () => { const q = R.renderer.properties.get(Particles.mesh.material), pr = q.currentProgram || q.program; return !!pr && !(pr.diagnostics && !pr.diagnostics.runnable) && !Particles.brutt; },
            M = () => Particles.mesh, ut = {};"""
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg)
    pt = await pg.evaluate("""async () => { """ + PT_HJELP + """
          rolig(); P.hp = P.maxHp = 1e6; P.invuln = 999; await spill(.3); Particles.clear(); await spill(.05);
          const g = M().geometry, info = R.renderer.info.memory;
          ut.form = { geo: g.type, aForm: !!g.attributes.aForm, mat: M().material.type, farger: M().instanceColor ? M().instanceColor.array.length : 0 };
          // 900 samtidig (og 100 til, som ikke får plass) koster ett tegnekall
          Particles.spawn(P.x, 1, P.z, 1000, 0xb3261e, { speed: 5, up: 4, life: 20, g: 0 }); await spill(.05);
          const k1 = kall(); M().visible = false; const k0 = kall(); M().visible = true;
          ut.kall = { n: Particles.n, k: k1 - k0, lenket: lenket() };
          const c = M().instanceColor.array; ut.farge = [c[0], c[1], c[2], c[899 * 3]].map(v => +(v ?? -1).toFixed(3));
          Particles.clear(); await spill(.05); ut.kall.tom = M().count;
          // formen gjettes fra fargen: blod og vann er dråper, hvitt og gult er gnister, o.flat er papir, grått og brunt er støv, o.form vinner
          const f = (col, o = {}) => { Particles.spawn(P.x, 1, P.z, 1, col, Object.assign({ life: 5 }, o)); return Particles.d[Particles.n - 1].f; };
          ut.gjett = [f(0xb3261e, { speed: 8 }), f(0x9fd8f0, { speed: 2 }), f(0xfff6a0, { speed: 5 }), f(0xffa040, { speed: 6 }), f(0xefe4c4, { flat: true }), f(0xb8a888, { speed: 3 }), f(0x2a1a1a), f(0xb3261e, { form: 'papir' }), f(0xfff6a0, { form: 'stov' })];
          Particles.clear();
          // en gnist som flyr mot høyre på skjermen: strukket langs farten, flaten vender mot kameraet
          Particles.spawn(P.x, 1, P.z, 1, 0xfff6a0, { speed: .001, up: .001, vx: 9, g: 0, life: 5 }); await spill(.05);
          const A = M().instanceMatrix.array, len = o => Math.hypot(A[o], A[o + 1], A[o + 2]);
          ut.gnist = { x: +len(0).toFixed(3), y: +len(4).toFixed(3), retning: +(A[0] / len(0)).toFixed(3), mot: [A[8], A[9], A[10]].map(v => +v.toFixed(3)), sp: +Math.sin(52 * Math.PI / 180).toFixed(3), cp: +Math.cos(52 * Math.PI / 180).toFixed(3) };
          Particles.clear();
          // de lever ut livet sitt og blir borte
          Particles.spawn(P.x, 1, P.z, 900, 0xfff6a0, { speed: 6, up: 5, life: .4 }); ut.liv = { n0: Particles.n }; await tomt(); await spill(.1); ut.liv.n = Particles.n; ut.liv.count = M().count;
          // enkel grafikk: klossene tilbake på neste bilde, og tilbake til blekk igjen, uten at geometri blir liggende
          const g0 = info.geometries, t0 = info.textures;
          // hver meshen som byttes ut, må kastes (geometri og materiale); det globale tallet tåler én geometri fra noe annet som lages første gang i samme stund
          const kast = [], folg = m => { const k = { g: false, m: false }; m.geometry.addEventListener('dispose', () => k.g = true); m.material.addEventListener('dispose', () => k.m = true); kast.push(k); };
          for (let i = 0; i < 3; i++) { folg(M()); R.safe = true; await spill(.05); if (!i) ut.safe = { geo: M().geometry.type, mat: M().material.type }; Particles.spawn(P.x, 1, P.z, 20, 0xb3261e, { life: 5 }); folg(M()); R.safe = false; await spill(.05); }
          ut.safe.tilbake = M().geometry.type; ut.safe.n = Particles.n; ut.safe.dg = info.geometries - g0; ut.safe.dt = info.textures - t0; ut.safe.kastet = kast.filter(k => k.g && k.m).length + '/' + kast.length;
          const cc = M().instanceColor.array; ut.safe.farge = [cc[0], cc[1], cc[2]].map(v => +v.toFixed(3));
          // enkel grafikk før init (som ved oppstart med innstillingen på) gir klosser fra første bilde, og blekket etterpå
          Particles.clear(); const gm = M(); R.scene.remove(gm); gm.geometry.dispose(); gm.material.dispose(); Particles.mesh = null; Particles.d.length = 0;
          R.safe = true; Particles.init(); ut.safe.init = M().geometry.type; R.safe = false; await spill(.05); ut.safe.initEtter = M().geometry.type; ut.safe.d = Particles.d.length;
          Particles.clear(); rolig();
          return ut; }""")
    fo = pt['form']
    sjekk('partiklene er flater med formattributt og egen shader, ikke klosser, og fargelista har plass til alle 900', fo == {'geo': 'PlaneGeometry', 'aForm': True, 'mat': 'ShaderMaterial', 'farger': 2700}, fo)
    k = pt['kall']
    sjekk('900 partikler koster ett tegnekall, shaderen lenker, og count går til 0 etter clear', k['n'] == 900 and k['k'] == 1 and k['lenket'] and k['tom'] == 0, k)
    sjekk('fargen kommer fram (blodrødt, ikke svart)', pt['farge'] == [0.702, 0.149, 0.118, 0.702], pt['farge'])
    sjekk('formen gjettes fra fargen (dråpe, dråpe, gnist, gnist, papir, støv, dråpe) og o.form vinner', pt['gjett'] == [1, 1, 0, 0, 2, 3, 1, 2, 3], pt['gjett'])
    gn = pt['gnist']
    sjekk('gnisten strekkes ut langs farten og flaten vender mot kameraet', gn['x'] > gn['y'] * 1.8 and gn['retning'] > .99 and abs(gn['mot'][1] - gn['sp']) < .002 and abs(gn['mot'][2] - gn['cp']) < .002 and abs(gn['mot'][0]) < .002, gn)
    sjekk('900 partikler lever ut og er borte', pt['liv'] == {'n0': 900, 'n': 0, 'count': 0}, pt['liv'])
    sa = pt['safe']
    sjekk('enkel grafikk gir klosser, blekket kommer tilbake, fargene og partiklene følger med, og ingen geometri eller tekstur blir liggende', sa['geo'] == 'BoxGeometry' and sa['mat'] == 'MeshBasicMaterial' and sa['tilbake'] == 'PlaneGeometry' and sa['n'] == 60 and sa['kastet'] == '6/6' and sa['dg'] <= 1 and sa['dt'] <= 0 and sa['farge'] == [0.702, 0.149, 0.118], sa)
    sjekk('enkel grafikk satt før init gir klosser, og blekket kommer når den slås av', sa['init'] == 'BoxGeometry' and sa['initEtter'] == 'PlaneGeometry' and sa['d'] == 900, sa)
    # pikslene: en klump blodpartikler som står stille, blir rød på skjermen (snitt over 9 x 9 punkter, før og etter)
    xy = await pg.evaluate("""async () => { """ + PT_HJELP + """
          R.shakeOn = false; P.vx = P.vz = 0; R.snapCamera(P.x, P.z); await spill(.3);
          const s = R.project(P.x + 2.5, 1, P.z + .5); return [Math.round(s.x), Math.round(s.y)]; }""")
    def flekk48(png, xy):
        im = _Img48.open(_io48.BytesIO(png)).convert('RGB'); x0, y0 = xy
        px = [im.getpixel((x0 + i, y0 + j)) for i in range(-4, 5) for j in range(-4, 5)]
        return [sum(q[k] for q in px) / len(px) for k in range(3)]
    for48 = await pg.screenshot()
    await pg.evaluate("""async () => { """ + PT_HJELP + """
          Particles.spawn(P.x + 2.5, 1, P.z + .5, 40, 0xb3261e, { speed: .001, up: .001, g: 0, life: 30, size: 1.3 }); await spill(.15); }""")
    etter48 = await pg.screenshot()
    a_, e_ = flekk48(for48, xy), flekk48(etter48, xy)
    sjekk('pikslene: blodpartiklene er røde på skjermen (rødt over grønt med minst 50, og endret)', e_[0] - e_[1] > 50 and abs(e_[0] - a_[0]) + abs(e_[1] - a_[1]) > 40, {'for': [round(v) for v in a_], 'etter': [round(v) for v in e_]})
    # fem drap i et rolig rom, til gjennomsyn
    await pg.evaluate("""async () => { """ + PT_HJELP + """
          Particles.clear(); const E = [], typer = ['pleier', 'oppasser', 'kultist', 'yngel', 'pleier'];
          for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 + .3, f = freeSpot(P.x + Math.sin(a) * 2.6, P.z + Math.cos(a) * 2.2, 2); E.push(spawnEnemy(typer[i], f.x, f.z, false, 2)); }
          await spill(.7); for (const e of E) if (e && e.alive) { e.stun = 5; hurt(e, 1e6, { from: 'player', x: P.x, z: P.z }); } await spill(.12); }""")
    await pg.screenshot(path='/tmp/e_48_partikler.png')
    sjekk('ingen konsollfeil (blekkpartikler i 2D)', not pg.errs, pg.errs[:6])
    await pg.close()
    # én runde i 3D: flatene, shaderen lenker og ett tegnekall
    pg = await ny_side(b, viewport={'width': 960, 'height': 540})
    await start_lop(pg, url=URL3D)
    p3 = await pg.evaluate("""async () => { """ + PT_HJELP + """
          rolig(); await spill(.3); Particles.clear(); ut.d3 = D3.on;
          Particles.spawn(P.x, 1, P.z, 900, 0xfff6a0, { speed: 6, up: 5, life: 20, g: 0 }); Particles.spawn(P.x, 1, P.z, 5, 0xb3261e, {}); await spill(.1);
          const k1 = kall(); M().visible = false; const k0 = kall(); M().visible = true;
          Object.assign(ut, { geo: M().geometry.type, n: Particles.n, k: k1 - k0, lenket: lenket() }); Particles.clear(); return ut; }""")
    sjekk('3D: flater, shaderen lenker og 900 partikler koster ett tegnekall', p3 == {'d3': True, 'geo': 'PlaneGeometry', 'n': 900, 'k': 1, 'lenket': True}, p3)
    sjekk('ingen konsollfeil (blekkpartikler i 3D)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_49(b):
    # 49) Nedslag
    #     Angrepene lander med tyngde (Nedslag i 46_blekk.js): partikler langs omrisset når et varsel går av (ikke når det avbrytes
    #     eller har o.stille), korte lyn på kanten for strøm, merker i gulvet på store angrep (høyst 12, de som har bleknet brukes
    #     om igjen), skrensemerker når en fiende stormer, bare et blaff for prosjektilbaner, partiklene er borte innen 5 s,
    #     ingen ny geometri per nedslag, ingenting med enkel grafikk, tunge treff på spilleren fryser bildet, lynet i regnværet
    #     beholder sitt eget nedslag, og prosjektilene har en skygge på gulvet.
    import io as _io49
    from PIL import Image as _Img49
    NS_HJELP = """const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)),
            spill = async (t, maks = 30000) => { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < t && performance.now() - t0 < maks) await vent(50); },
            tomt = async () => { const t0 = performance.now(); while (G.tele.length && performance.now() - t0 < 120000) await vent(50); await spill(.1); },
            rydd = () => { for (const t of G.tele) R.kastTele(t.mesh, 'rydd', t); G.tele = []; Blekk.tom(); },
            kall = () => { const i = R.renderer.info; i.autoReset = false; i.reset(); R.render(0); const n = i.render.calls; i.autoReset = true; return n; },
            eier = (o = {}) => Object.assign({ alive: true, stun: 0, sleep: 0 }, o), T = () => Object.assign({}, Nedslag.tall), ut = {};"""
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg)
    ns = await pg.evaluate("""async () => { """ + NS_HJELP + """
          rolig(); P.hp = P.maxHp = 1e6; P.invuln = 999; await spill(.3); rydd(); Particles.clear(); Nedslag.tom();
          // går av: partikler langs omrisset. Avbrutt eller o.stille: ingenting
          let t0 = T(), n0 = Particles.n; const E = eier();
          addTele('circle', { x: P.x + 2, z: P.z, r: 1.4 }, .1, null, null); addTele('circle', { x: P.x - 2, z: P.z, r: 1.4 }, 5, null, E); addTele('circle', { x: P.x, z: P.z + 2, r: 1.4, stille: true }, .1, null, null);
          await spill(.02); cancelTeles(E); await tomt(); let t1 = T();
          ut.land = { d: t1.land - t0.land, part: t1.partikler - t0.partikler, kvote: Glod.kvote(), merker: t1.merker - t0.merker };
          // strøm: gnister og to eller tre lyn på kanten
          t0 = T(); addTele('circle', { x: P.x + 2, z: P.z, r: 1.8, color: 0xffe25a }, .1, null, null); await tomt(); t1 = T(); ut.strom = { lyn: t1.lyn - t0.lyn, part: t1.partikler - t0.partikler };
          // en prosjektilbane: bare et lite blaff og ingen merker. Et løp: skrensemerker
          t0 = T(); addTele('rect', { x: P.x, z: P.z, a: 1, w: .35, len: 10 }, .1, null, eier()); await tomt(); t1 = T(); ut.bane = { baner: t1.baner - t0.baner, part: t1.partikler - t0.partikler, merker: t1.merker - t0.merker };
          const L = eier({ state: 'wind' }); t0 = T(); addTele('rect', { x: P.x, z: P.z, a: 2, w: 1.3, len: 7 }, .1, () => { L.state = 'charge'; }, L); await tomt(); t1 = T();
          const sk = Nedslag.M.filter(m => m.t < m.liv).map(m => Nedslag.aDek.array[m.i * 2]);
          ut.lop = { lop: t1.lop - t0.lop, merker: t1.merker - t0.merker, skrens: sk.includes(3), part: t1.partikler - t0.partikler };
          Nedslag.tom();
          // korskriket (r 6,2) når forbi rommet: ingen partikler inne i veggen eller ute i mørket, og merket blir høyst 6,5 skritt
          { const K = { x: P.x, z: P.z, r: 6.2 }; let vegg = 0; for (let i = 0; i < 64; i++) { const q = Nedslag.kant('circle', K, i / 64); if (solid(Math.floor(q.x), Math.floor(q.z))) vegg++; }
            const sp0 = Particles.spawn; let iVegg = 0, nSp = 0; Particles.spawn = function (x, y, z) { nSp++; if (solid(Math.floor(x), Math.floor(z))) iVegg++; return sp0.apply(this, arguments); };
            try { addTele('circle', K, .05, null, eier({ kind: 'boss' })); await tomt(); } finally { Particles.spawn = sp0; }
            const m = Nedslag.M.filter(m => m.t < m.liv); ut.kor = { vegg, iVegg, nSp, merker: m.length, str: m.length ? Math.max(m[0].sx, m[0].sz) : 0 }; Nedslag.tom(); }
          // 40 store angrep av alle typene: høyst 12 merker, de som har bleknet brukes om igjen, ingen geometri blir liggende, partiklene er borte innen 5 s
          const info = R.renderer.info.memory, g0 = info.geometries, typer = Object.keys(TELE_TYPE); let maks = 0; t0 = T(); n0 = Particles.n;
          for (let i = 0; i < 40; i++) { const a = i * .9; addTele('circle', { x: P.x + Math.sin(a) * 3, z: P.z + Math.cos(a) * 3, r: 2.2 + (i % 3) * .6, type: typer[i % typer.length] }, .05 + (i % 10) * .02, null, i % 4 ? null : eier({ kind: 'boss' })); if (i % 10 === 9) { await tomt(); maks = Math.max(maks, Nedslag.levende); } }
          t1 = T(); const nTopp = Particles.n; await spill(5.3, 240000);
          ut.stor = { merker: t1.merker - t0.merker, maks, sjokk: t1.sjokk - t0.sjokk, nTopp, n5: Particles.n, n0, levende: Nedslag.levende, dg: info.geometries - g0 };
          t0 = T(); addTele('circle', { x: P.x + 3, z: P.z, r: 2.5 }, .05, null, null); await tomt(); t1 = T(); ut.stor.gjenbruk = t1.gjenbruk - t0.gjenbruk; ut.stor.dg2 = info.geometries - g0;
          const k1 = kall(); Nedslag.mesh.visible = false; const k0 = kall(); Nedslag.mesh.visible = true; ut.stor.kall = k1 - k0; Nedslag.tom(); await spill(.1);
          // enkel grafikk: ingen partikler og ingen merker, og meshen vises ikke
          Particles.clear(); R.safe = true; await spill(.05); t0 = T(); n0 = Particles.n;
          addTele('circle', { x: P.x + 2, z: P.z, r: 3, color: 0xffe25a }, .05, null, eier({ kind: 'boss' })); addTele('rect', { x: P.x, z: P.z, a: 2, w: .35, len: 6 }, .05, null, null); await tomt(); t1 = T();
          ut.safe = { land: t1.land - t0.land, part: t1.partikler - t0.partikler, merker: t1.merker - t0.merker, lyn: t1.lyn - t0.lyn, synlig: Nedslag.mesh.visible, sjokk: t1.sjokk - t0.sjokk };
          R.safe = false; await spill(.1);
          // tunge treff: over 15 % av livet fryser bildet og viser treffstjerna, et lite treff gjør det ikke
          P.hp = P.maxHp = 100; P.invuln = 0; P.iframe = 0; G.hitstop = 0; const s0 = VFX.stars.length; t0 = T(); const d1 = hurt(P, 20, { type: 'test' }); const hs1 = G.hitstop, st1 = VFX.stars.length - s0;
          P.invuln = 0; P.iframe = 0; G.hitstop = 0; const d2_ = hurt(P, 5, { type: 'test' }); const hs2 = G.hitstop;
          ut.tungt = { d1, hs1, st1, d2: d2_, hs2, tunge: T().tunge - t0.tunge }; P.hp = P.maxHp = 1e6; P.invuln = 999; await spill(.1);
          // lynet i regnværet har sitt eget nedslag
          const nT = G.tele.length; Uvaer.varsel(P.x + 4, P.z); ut.lyn = { stille: G.tele.length > nT && !!G.tele[G.tele.length - 1].o.stille }; rydd();
          // skygge under prosjektilene, også en som går i bue
          const pr = addProj({ type: 'glob', from: 'enemy', x: P.x + 3, z: P.z, arc: true, tx: P.x + 6, tz: P.z, dur: 20, h: 3, dmg: 0 }); await spill(.1);
          ut.skygge = { n: Nedslag.skygger ? Nedslag.skygger.count : -1 }; pr.alive = false; await spill(.1); ut.skygge.etter = Nedslag.skygger.count;
          return ut; }""")
    la = ns['land']
    sjekk('et varsel som går av, gir et nedslag med partikler langs omrisset, men ikke et som avbrytes eller har o.stille', la['d'] == 1 and la['part'] >= 8 and la['kvote'] > 0 and la['merker'] == 0, la)
    sjekk('strøm gir gnister og to eller tre korte lyn på kanten', 2 <= ns['strom']['lyn'] <= 3 and ns['strom']['part'] >= 8, ns['strom'])
    sjekk('en prosjektilbane gir bare et lite blaff, et løp gir skrensemerker', ns['bane']['baner'] == 1 and 1 <= ns['bane']['part'] <= 8 and ns['bane']['merker'] == 0 and ns['lop']['lop'] == 1 and ns['lop']['merker'] == 1 and ns['lop']['skrens'] and ns['lop']['part'] >= 4, [ns['bane'], ns['lop']])
    sjekk('et stort angrep som når inn i veggen (korskriket, r 6,2): ingen partikler i veggen, og merket blir høyst 6,5 skritt', ns['kor']['vegg'] > 0 and ns['kor']['iVegg'] == 0 and ns['kor']['nSp'] >= 8 and ns['kor']['merker'] == 1 and 0 < ns['kor']['str'] <= 6.5, ns['kor'])
    st = ns['stor']
    sjekk('40 store angrep: høyst 12 merker (ett tegnekall), sjokkbølger, merker som har bleknet brukes om igjen, partiklene er borte innen 5 s og geometrien vokser høyst 2',
          st['merker'] == 40 and st['maks'] == 12 and st['sjokk'] >= 40 and st['nTopp'] > 100 and st['n5'] <= st['n0'] and st['levende'] == 0 and st['gjenbruk'] == 1 and st['dg'] <= 2 and st['dg2'] <= 2 and st['kall'] == 1, st)
    sa = ns['safe']
    sjekk('enkel grafikk: nedslaget telles, men ingen partikler, lyn, merker eller sjokkbølger', sa['land'] == 2 and sa['part'] == 0 and sa['merker'] == 0 and sa['lyn'] == 0 and not sa['synlig'] and sa['sjokk'] == 0, sa)
    tu = ns['tungt']
    sjekk('et tungt treff (over 15 % av livet) fryser bildet minst 0,04 s og viser treffstjerna, et lite gjør det ikke', tu['d1'] > 15 and tu['hs1'] >= .04 and tu['st1'] == 1 and tu['tunge'] == 1 and tu['d2'] > 0 and tu['hs2'] == 0, tu)
    sjekk('lynet i regnværet beholder sitt eget nedslag (o.stille)', ns['lyn']['stille'], ns['lyn'])
    sjekk('prosjektilene har en skygge på gulvet, også i bue, og den er borte med prosjektilet', ns['skygge'] == {'n': 1, 'etter': 0}, ns['skygge'])
    # pikslene: blekksølet etter et stort angrep synes i gulvet midt i sirkelen og ikke utenfor (snitt over 9 x 9 punkter, før og etter)
    pos = await pg.evaluate("""async () => { """ + NS_HJELP + """
          G.run.seed = 11; startFloor(2, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } await vent(200);
          const inne = r => !Vaer.ute(r.x + r.w / 2, r.z + r.h / 2), rr = G.F.rooms.filter(inne);
          rolig(); R.shakeOn = false; rydd(); P.hp = P.maxHp = 1e6; P.invuln = 999; const r = (rr.length ? rr : G.F.rooms).slice().sort((a, b) => b.w * b.h - a.w * a.h)[0], c = freeSpot(r.x + r.w / 2 - .4, r.z + r.h / 2, 3);
          P.x = c.x; P.z = c.z; P.vx = P.vz = 0; R.snapCamera(P.x, P.z); await spill(.6); Particles.clear();
          const q = (x, z) => { const s = R.project(x, 0, z); return [Math.round(s.x), Math.round(s.y)]; };
          return { midt: q(P.x + 3.2, P.z), ute: q(P.x + 3.2 + 4.3, P.z) }; }""")
    def flekk49(png, xy):
        im = _Img49.open(_io49.BytesIO(png)).convert('RGB'); x0, y0 = xy
        px = [im.getpixel((x0 + i, y0 + j)) for i in range(-4, 5) for j in range(-4, 5)]
        return [sum(q[k] for q in px) / len(px) for k in range(3)]
    for49 = await pg.screenshot()
    await pg.evaluate("""async () => { """ + NS_HJELP + """
          addTele('circle', { x: P.x + 3.2, z: P.z, r: 2.4, color: 0xb36be0 }, .05, null, null); await tomt(); await spill(1.4); }""")
    etter49 = await pg.screenshot()
    await pg.screenshot(path='/tmp/e_49_merke.png')
    dl49 = lambda xy: round(sum(abs(a - b) for a, b in zip(flekk49(for49, xy), flekk49(etter49, xy))) / 3, 1)
    px49 = {k: dl49(v) for k, v in pos.items()}
    sjekk('pikslene: merket synes midt i sirkelen (endring over 25) og ikke utenfor (under 8)', px49['midt'] > 25 and px49['ute'] < 8, px49)
    sjekk('ingen konsollfeil (nedslag i 2D)', not pg.errs, pg.errs[:6])
    await pg.close()
    # én runde i 3D: merkene lenker, ett tegnekall for 12 merker, og ingenting blir liggende
    pg = await ny_side(b, viewport={'width': 960, 'height': 540})
    await start_lop(pg, url=URL3D)
    n3 = await pg.evaluate("""async () => { """ + NS_HJELP + """
          rolig(); P.hp = P.maxHp = 1e6; P.invuln = 999; await spill(.3); rydd(); ut.d3 = D3.on;
          addTele('circle', { x: P.x + 2, z: P.z, r: 2.4 }, .05, null, null); await tomt(); await spill(.5); Nedslag.tom(); const g0 = R.renderer.info.memory.geometries, t0 = T(); // første gang lages varslene og merkene
          for (let i = 0; i < 14; i++) { const a = i * .45; addTele(i % 5 ? 'circle' : 'cone', { x: P.x + Math.sin(a) * 3, z: P.z + Math.cos(a) * 3, r: 2.4, a, arc: 1.6, type: Object.keys(TELE_TYPE)[i % 11] }, .1 + (i % 7) * .03, null, null); }
          await tomt(); const q = R.renderer.properties.get(Nedslag.mesh.material), pr = q.currentProgram || q.program;
          const k1 = kall(); Nedslag.mesh.visible = false; const k0 = kall(); Nedslag.mesh.visible = true;
          Object.assign(ut, { merker: T().merker - t0.merker, levende: Nedslag.levende, kall: k1 - k0, lenket: !!pr && !(pr.diagnostics && !pr.diagnostics.runnable) });
          await spill(5.3, 240000); ut.dg = R.renderer.info.memory.geometries - g0; ut.etter = Nedslag.levende; return ut; }""")
    await pg.screenshot(path='/tmp/e_49_3d.png')
    sjekk('3D: merkene lenker, 12 merker koster ett tegnekall, de blekner, og geometrien vokser høyst 2', n3['d3'] and n3['lenket'] and n3['merker'] == 14 and n3['levende'] == 12 and n3['kall'] == 1 and n3['etter'] == 0 and n3['dg'] <= 2, n3)
    sjekk('ingen konsollfeil (nedslag i 3D)', not pg.errs, pg.errs[:6])
    await pg.close()


DELER = {18: del_18, 29: del_29, 34: del_34, 44: del_44, 46: del_46, 47: del_47, 48: del_48, 49: del_49}
