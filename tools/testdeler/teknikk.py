"""Teknikken: lyskildene etter flettingen, hint og innbrudd, krokene, testklokka og nettutgaven.

Testdeler fra test_ekstra.py. Kjøres med python3 tools/test_ekstra.py --system teknikk eller --del N.
"""
from .felles import ROT, sjekk, ny_side, start_lop, klikk, URL, URL3D


async def del_43(b):
    # 43) Etter flettingen av sporene: lista over lyskilder vokser ikke med etasjene, B (rull) i kampen lukker ikke et panel som
    #     akkurat åpnet seg, og merkene for flaska og apparatet viser knappen for det du spiller med
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await pg.add_init_script("""(() => {
          window.__pad = { id: 'Testkontroll (STANDARD GAMEPAD)', index: 0, connected: true, mapping: 'standard', timestamp: 0, axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) };
          Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => [window.__pad] });
          window.__ramme = n => new Promise(r => { const f = () => --n <= 0 ? r() : requestAnimationFrame(f); requestAnimationFrame(f); });
          window.__trykk = async (i, ned = 3, opp = 3) => { const k = window.__pad.buttons[i]; k.pressed = true; k.value = 1; await window.__ramme(ned); k.pressed = false; k.value = 0; await window.__ramme(opp); };
        })()""")
    await pg.goto(URL); await pg.wait_for_timeout(2000); await pg.evaluate("() => localStorage.clear()")
    await start_lop(pg)
    kl = await pg.evaluate("""async () => { const G = MORBIDIUM, vent = t => new Promise(r => setTimeout(r, t)), n = [];
          for (const d of [1, 2, 3, 4, 5, 6, 1, 2, 3]) { startFloor(d, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } await vent(80); n.push(R.kilder.length); }
          return { n, festet: R.kilder.every(k => k.parent && (k.parent === R.lscene || !!k.parent.parent)) }; }""")
    sjekk('lista over lyskilder vokser ikke når etasjene bygges på nytt, og alle i den henger i scenen', abs(kl['n'][6] - kl['n'][0]) <= 12 and max(kl['n']) < 300 and kl['festet'], kl)
    bv = await pg.evaluate("""async () => { const G = MORBIDIUM, ut = {}; rolig(); await __ramme(3);
          // B som rull i spillet, og et panel som dukker opp rett etterpå
          // B holdes inne idet panelet åpnes (som når den hamres på i kampen), så testen ikke avhenger av hvor fort nettleseren tegner
          const k = __pad.buttons[1]; k.pressed = true; k.value = 1; await __ramme(2); openPanel('<div class="paper" style="padding:20px"><button data-close>Lukk</button></div>'); await __ramme(1);
          k.pressed = false; k.value = 0; await __ramme(1); await __trykk(1, 1, 1); ut.bliver = G.state === 'panel';
          for (let i = 0; i < 120 && MenyNav.roB > 0; i++) await __ramme(1);
          await __trykk(1); await __ramme(2); ut.lukker = G.state === 'play';
          return ut; }""")
    sjekk('B som ble trykket for å rulle, lukker ikke et panel som akkurat åpnet seg, men gjør det etter et halvt sekund', bv == {'bliver': True, 'lukker': True}, bv)
    mk = await pg.evaluate("""async () => { await __trykk(3); await __ramme(3); return { pad: document.getElementById('consk').textContent, apparat: document.querySelector('#akt .n').textContent }; }""")
    await pg.keyboard.press('KeyW'); await pg.wait_for_timeout(400)
    mk.update(await pg.evaluate("() => ({ kb: document.getElementById('consk').textContent, apparatKb: document.querySelector('#akt .n').textContent })"))
    sjekk('merkene for flaska og apparatet viser Ned og Opp med håndkontroll og F og V med tastatur', mk == {'pad': 'Ned', 'apparat': 'Opp', 'kb': 'F', 'apparatKb': 'V'}, mk)
    # funnene fra gjennomgangen: gloria til en ting som dør mens den blekner, krasjer ikke; et panel som er åpent når etasjen byttes,
    # lukkes; og lappen for å snakke ligger over kortene også med TV-modus og stor skjermtekst
    gj = await pg.evaluate("""async () => { const G = MORBIDIUM, vent = t => new Promise(r => setTimeout(r, t)), ut = {};
          let o = null; for (const d of [1, 2, 3, 4, 5, 6]) { startFloor(d, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } await vent(150); o = G.props.find(p => GLORIE_KILDER[p.kind] && p.g); if (o) break; }
          ut.ting = !!o; if (o) { Glorie.tick(1 / 60); o.alive = false; for (const k of Glorie.K) if (k.eier === o) { k.w = 1; delete k.c; }
            try { for (let i = 0; i < 4; i++) Glorie.tick(1 / 60); ut.glorie = 'ok'; } catch (e) { ut.glorie = String(e); } }
          // kartet åpent idet etasjen byttes (som når drømmen blekner): panelet lukkes og lerretet frigjøres
          rolig(); Kart.apne(); await vent(200); ut.kart = Kart.aapen(); startFloor(G.depth, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } await vent(150);
          const c = document.getElementById('kCan'); ut.lukket = G.state === 'play' && document.getElementById('panel').classList.contains('hidden') && (!c || c.width === 0);
          // TV-modus: lappen over kortene
          const s = G.meta.settings, tv0 = s.tv; s.tv = 1; applySettings(); await vent(300); const pr = document.getElementById('prompt'); pr.innerHTML = '<kbd>Y</kbd> Snakk'; pr.classList.remove('hidden');
          // målt med en gang: spillet skjuler lappen i neste bilde når det ikke er noe å snakke med
          const a = pr.getBoundingClientRect(), b = document.getElementById('cards').getBoundingClientRect(); ut.lapp = { over: a.height > 10 && a.bottom <= b.top + 1, a: [Math.round(a.top), Math.round(a.bottom)], kort: Math.round(b.top) };
          pr.classList.add('hidden'); s.tv = tv0; applySettings(); return ut; }""")
    sjekk('gloria til en ting som dør mens den blekner, krasjer ikke spillet', gj['ting'] and gj['glorie'] == 'ok', gj)
    sjekk('et panel som er åpent når etasjen byttes, lukkes, og kartets lerret frigjøres', gj['kart'] and gj['lukket'], gj)
    sjekk('lappen for å snakke ligger over kortene i TV-modus', gj['lapp']['over'], gj['lapp'])
    sjekk('ingen konsollfeil (etter flettingen)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_53(b):
    # 53) Hint og innbrudd
    #     Sprekken er en flekk nyere puss (ingen murkasse), trekken høres dempet bak veggen innen fem ruter og dragene blåser ut av den,
    #     et slag mot en vanlig vegg gir et dumpt slag (høyst hvert 0,4 sekund, ikke når en fiende treffes), én boble per etasje og ett tips,
    #     og innbruddet går gjennom bristen, synkingen, byttet og lysene på under halvannet sekund spilltid, også med enkel grafikk
    # OPP53: en etasje med en sprekk etter ønske (nord: nordveggen i et innerom, hekk: sørveggen i en hekk ute som i 10.png), med pasienten foran
    OPP53 = """async (o) => { const G = MORBIDIUM, vent = t => new Promise(r => setTimeout(r, t)); let s0 = null;
          const passer = F => { const h = F.rooms.find(r => r.role === 'secret'); if (!h || !F.crack || !F.crack.length) return false; const p = F.rooms[h.parent], rad = i => (i / F.W) | 0;
            return o.hvor === 'nord' ? !p.ute && F.crack.every(i => rad(i) === p.z - 1) && ['panel', 'tapet', 'paviljong'].includes(p.vegg) : !!p.ute && F.crack.every(i => rad(i) === p.z + p.h); };
          for (let s = 1; s < 900; s++) { if (!passer(generateFloor(s + o.d * 7919, o.d, {}))) continue; G.run.seed = s; G.run.dromVent = 0; startFloor(o.d, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); }
            if (o.hvor !== 'hekk' || (Skjult.info && Skjult.info.st === 'hekk')) { s0 = s; break; } }
          if (s0 === null) return null;
          const P = G.player, I = Skjult.info; for (const e of G.enemies) if (e.alive) killEntity(e, {}); G.combat = null; G.lock = null; G.rooms.forEach(s => s.cleared = true); Bygg.alt();
          P.x = I.cx; P.z = I.ez + I.uz * (o.avst || 1.2); P.face = Math.atan2(0, -I.uz); P.hp = P.maxHp; P.invuln = 999; R.snapCamera(P.x, P.z); await vent(300);
          return { s0, side: I.side, st: I.st, ute: I.ute, meshes: I.meshes.map(m => m.userData.dekal), sprite: Spesial.cracks.some(c => c.g), eid: Paint.owned.includes(I.tex) && Paint.owned.includes(I.mat) }; }"""
    # pasienten et gitt antall ruter rett ut fra midten av sprekken (fra midten av sprekkruta)
    STILL53 = "(d) => { const G = MORBIDIUM, P = G.player, I = Skjult.info; P.x = I.cx; P.z = I.ez - I.uz * .5 + I.uz * d; R.snapCamera(P.x, P.z); }"
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg)
    n53 = await pg.evaluate(OPP53, {'d': 2, 'hvor': 'nord'})
    sjekk('hint: en sprekk i en nordvegg har flekken (flate og støv, i Paint.owned) og ingen murkasse', n53 is not None and n53['side'] == 'n' and 'flate' in n53['meshes'] and 'stov' in n53['meshes'] and not n53['sprite'] and n53['eid'], n53)
    # trekken: dempet vind innen fem ruter (lavpass under 900 på tre ruter), ingenting på ni ruter eller i kamp, og dragene langs gulvet
    tr = await pg.evaluate("""(still) => { const G = MORBIDIUM, ut = {}, still_ = eval(still), maal = () => { const M = Stemning.maal(); return M.trekk_vind ? M.trekk_vind.map(v => +v.toFixed(3)) : null; };
          const glod = () => { Skjult.trekk(); const E = Skjult.trekkE; return E && Glod.liste.includes(E) ? +E.mat.uniforms.uStyrke.value.toFixed(2) : null; };
          still_(3); ut.tre = maal(); ut.gl3 = glod(); ut.gruppe = !!(Lydbank.gruppeListe().trekk_vind || []).length; ut.rot = Skjult.trekkE ? +Skjult.trekkE.pts.rotation.y.toFixed(2) : null;
          G.combat = {}; ut.kamp = maal(); G.combat = null;
          still_(2); ut.gl2 = glod(); still_(7); ut.gl7 = glod(); G.sprekkKjent = true; ut.gl7m = glod(); G.sprekkKjent = false; still_(9); ut.ni = maal(); ut.gl9 = glod(); return ut; }""", STILL53)
    sjekk('hint: trekken bak veggen høres dempet på tre ruter (lavpass høyst 900) og ikke på ni ruter eller i kamp', tr['tre'] is not None and tr['tre'][0] > 0 and tr['tre'][1] <= 900 and tr['ni'] is None and tr['kamp'] is None and tr['gruppe'], tr)
    sjekk('hint: kalde drag langs gulvet nær sprekken (fullt på to ruter, ingen på ni), og monokkelen viser dem fra åtte ruter', tr['gl3'] is not None and 0 < tr['gl3'] < 1 and tr['gl2'] == 1 and tr['gl7'] is None and tr['gl7m'] is not None and tr['gl9'] is None and tr['rot'] is not None, tr)
    # banking: slag mot en vanlig vegg i foreldrerommet (nordveggen, et stykke fra sprekken)
    bk = await pg.evaluate("""async () => { const G = MORBIDIUM, F = G.F, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), h = F.rooms.find(r => r.role === 'secret'), p = F.rooms[h.parent];
          // en rute i foreldrerommet inntil en vanlig vegg, langt fra sprekken og uten ting i nærheten
          let st = null; for (let z = p.z; z < p.z + p.h && !st; z++) for (let x = p.x; x < p.x + p.w && !st; x++) { if (solid(x, z) || F.crack.some(c => Math.hypot(c % F.W - x, ((c / F.W) | 0) - z) < 4) || G.props.some(o => o.alive !== false && Math.hypot(o.x - x - .5, o.z - z - .5) < 2)) continue;
            for (const [dx, dz] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) { const i = (z + dz) * F.W + x + dx; if (Paint.wallH[i] > 0 && !F.crack.includes(i)) { st = { x, z, dx, dz }; break; } } }
          if (!st) return null;
          const lyder = [], _p = Sound.play; Sound.play = function (n, ...a) { lyder.push([n, +G.time.toFixed(3)]); return _p.call(this, n, ...a); };
          P.x = st.x + .5 + st.dx * .05; P.z = st.z + .5 + st.dz * .05; P.face = Math.atan2(st.dx, st.dz); R.snapCamera(P.x, P.z); Spesial.bankT = -9;
          startSwing(false); const g0 = G.time, t0 = performance.now(); while (P.atk && G.time - g0 < 3 && performance.now() - t0 < 20000) await vent(30);
          const ekte = lyder.filter(l => l[0] === 'veggbank').length; lyder.length = 0;
          const t00 = G.time; for (let k = 0; k < 24; k++) { G.time += .1; meleeHit({ heavy: false, combo: 0, charge: 0 }); } const tider = lyder.filter(l => l[0] === 'veggbank').map(l => l[1]); G.time = t00 + 2.4; lyder.length = 0;
          const e = spawnEnemy('pleier', P.x + st.dx * .2, P.z + st.dz * .2, false, 2); e.state = 'chase'; e.cd = 99; e.hp = 1e6; e.maxHp = 1e6; G.time += 1; meleeHit({ heavy: false, combo: 0, charge: 0 }); const medFiende = lyder.filter(l => l[0] === 'veggbank').length; killEntity(e, {}); G.combat = null; G.lock = null;
          lyder.length = 0; P.face += Math.PI; G.time += 1; meleeHit({ heavy: false, combo: 0, charge: 0 }); const luft = lyder.filter(l => l[0] === 'veggbank').length;
          Sound.play = _p; let min = 9; for (let k = 1; k < tider.length; k++) min = Math.min(min, tider[k] - tider[k - 1]); return { ekte, n: tider.length, min: +min.toFixed(2), medFiende, luft }; }""")
    sjekk('hint: et slag mot en vanlig vegg gir et dumpt slag, høyst ett per 0,4 sekund spilltid', bk is not None and bk['ekte'] == 1 and 4 <= bk['n'] <= 7 and bk['min'] >= .4 - 1e-6, bk)
    sjekk('hint: ingen banking når slaget treffer en fiende eller bare luft', bk is not None and bk['medFiende'] == 0 and bk['luft'] == 0, bk)
    # ordene: høyst én boble på tjue sekunder spilltid ved sprekken, og tipset første gang (også ved et nytt løp er det vist)
    ord_ = await pg.evaluate("""async (still) => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)); eval(still)(1.6); for (const e of G.enemies) if (e.alive) killEntity(e, {});
          const alle = new Set([...Skjult.ord(), 'Det trekker herfra.', 'Den veggen ser tynn ut.', 'Er det noen der inne?']), bobler = [], _b = FX.bubble; FX.bubble = function (hvem, s, ...a) { if (hvem === P) bobler.push(s); return _b.call(this, hvem, s, ...a); };
          if (G.meta.tips) delete G.meta.tips.sprekk; G.meta.settings.tips = true; Spesial.sagt = false; Spesial.naerT = 0;
          // tipsene vises etter en ventetid i faktisk tid, så et tips fra starten av løpet (kartet) kan komme etter og skrive over: alle som vises, noteres
          let tEl = document.getElementById('tips'); if (!tEl) { tEl = document.createElement('div'); tEl.id = 'tips'; document.getElementById('hud').appendChild(tEl); }
          const sett = [], mo = new MutationObserver(() => sett.push(tEl.textContent)); mo.observe(tEl, { childList: true, subtree: true, characterData: true });
          // tre sekunder i spillets egen løkke, og resten av de tjue sekundene med Spesial.update i steg på en tidel (maskinen er for treg til tjue sekunder spilltid)
          const g0 = G.time, t0 = performance.now(); while (G.time - g0 < 3 && performance.now() - t0 < 60000) { P.hp = P.maxHp; await vent(100); } let tid = G.time - g0; const n3 = bobler.filter(s => alle.has(s)).length;
          while (tid < 20) { Spesial.update(.1); tid += .1; }
          for (let i = 0; i < 60 && !sett.some(t => t.includes('murt igjen')); i++) await vent(100); mo.disconnect();
          FX.bubble = _b; const el = document.getElementById('tips'); return { tid: +tid.toFixed(1), ekte: +(G.time - g0).toFixed(1), n3, n: bobler.filter(s => alle.has(s)).length, bobler: bobler.slice(0, 6), tips: !!(G.meta.tips && G.meta.tips.sprekk), tekst: sett.find(t => t.includes('murt igjen')) || (el ? el.textContent : '') }; }""", STILL53)
    sjekk('hint: nøyaktig én boble på tjue sekunder spilltid ved sprekken (den første etter to sekunder), og tipset om murte vegger', ord_['tid'] >= 20 and ord_['ekte'] >= 2.5 and ord_['n3'] == 1 and ord_['n'] == 1 and ord_['tips'] and 'murt igjen' in ord_['tekst'], ord_)
    await pg.evaluate(STILL53, 1.8); await pg.wait_for_timeout(700); await pg.screenshot(path='/tmp/e_53_hint_2d.png')
    # et vanlig slag på sprekken: hult, «Det knaker», og hårstreken vokser et steg
    sl = await pg.evaluate("""async (still) => { const G = MORBIDIUM, P = G.player, I = Skjult.info; eval(still)(1.1); P.face = Math.atan2(0, -I.uz); const lyder = [], _p = Sound.play; Sound.play = function (n, ...a) { lyder.push(n); return _p.call(this, n, ...a); };
          Spesial.bankT = -9; Spesial.bank(P.x, P.z, P.face, 1.2, 1.4); const direkte = lyder.includes('veggbank'); lyder.length = 0; // sprekken svarer aldri massivt, heller ikke når slaget bommet på den
          G.time += 1; meleeHit({ heavy: false, combo: 0, charge: 0 }); Sound.play = _p; return { steg: I.steg, lyder, hp: Spesial.cracks.map(c => c.hp), direkte }; }""", STILL53)
    sjekk('hint: et vanlig slag på sprekken svarer hult (ingen banking) og hårstreken vokser', sl['steg'] == 1 and 'bonk' in sl['lyder'] and 'veggbank' not in sl['lyder'] and not sl['direkte'] and min(sl['hp']) == 2, sl)
    # innbruddet: et tungt slag, og stegene i forløpet i spilltid etter bristen
    FORLOP53 = """async (skudd) => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), tider = {}, ut = { lyder: [], bobler: [] };
          const _p = Sound.play; Sound.play = function (n, ...a) { ut.lyder.push(n); return _p.call(this, n, ...a); }; const _b = FX.bubble; FX.bubble = function (hvem, s, ...a) { if (hvem === P) ut.bobler.push(s); return _b.call(this, hvem, s, ...a); };
          const orig = {}; for (const k of ['brist', 'synk0', 'bytt', 'vekk', 'slutt']) { orig[k] = Skjult[k]; Skjult[k] = function (...a) { tider[k] = G.time; const r = orig[k].apply(this, a); if (k === 'brist') ut.brist = (Skjult.vis.brist || []).length; return r; }; }
          const _f = Skjult.forlop; Skjult.forlop = function (dt) { const r = _f.call(this, dt); if (ut.stopp === undefined) ut.stopp = +G.hitstop.toFixed(3); return r; };
          const rydd = () => { for (const k in orig) Skjult[k] = orig[k]; Skjult.forlop = _f; Sound.play = _p; FX.bubble = _b; };
          P.face = Math.atan2(0, -Skjult.info.uz); startSwing(true, 1); const g0 = G.time, t0 = performance.now();
          while (!tider.brist && G.time - g0 < 5 && performance.now() - t0 < 30000) await vent(20);
          if (skudd && tider.brist) { while (!(Skjult.vis && Skjult.vis.t > .04) && performance.now() - t0 < 30000) await vent(10); slowMo(60, .0005); ut.skudd = true; rydd(); return ut; }
          const g1 = G.time, t1 = performance.now(); while ((Skjult.vis || !tider.slutt) && G.time - g1 < 3 && performance.now() - t1 < 40000) await vent(30);
          rydd();
          const t = k => tider[k] !== undefined ? +(tider[k] - tider.brist).toFixed(2) : null, PM = Paint.mesh, I = Skjult.info;
          return Object.assign(ut, { synk0: t('synk0'), bytt: t('bytt'), vekk: t('vekk'), slutt: t('slutt'), ferdig: !Skjult.vis, gulv: PM.gulvSkjult && PM.gulvSkjult.visible,
            sprekkSynlig: [...PM.vegger, ...(PM.toppEkstra || [])].filter(m => m.userData.del === 'sprekk' && m.visible).length, dekalSynlig: I ? I.meshes.filter(m => m.visible && m.userData.dekal !== 'stov' && m.userData.dekal !== 'rusk').length : -1,
            rusk: I ? I.meshes.some(m => m.userData.dekal === 'rusk') : false, secrets: G.run.secrets || 0, lys: Skjult.lys.length, tent: Skjult.lys.filter(L => L.material.color.r + L.material.color.g + L.material.color.b > 0).length,
            trekk: Glod.liste.filter(E => E.type === 'trekk').length }); }"""
    ib = await pg.evaluate(FORLOP53, False)
    rekke = [ib.get(k) for k in ('synk0', 'bytt', 'vekk', 'slutt')]
    sjekk('innbrudd: bristen med stopp i slaget, sprekkveggen som bristbilde og bruddlyden', ib.get('brist', 0) >= 2 and ib['stopp'] > 0 and 'murbrudd' in ib['lyder'], ib)
    sjekk('innbrudd: veggen synker, byttet, rommet våkner og ruskene ligger der, i rekkefølge og innen halvannet sekund spilltid', None not in rekke and rekke == sorted(rekke) and .15 <= rekke[0] <= .3 and rekke[3] <= 1.5 and ib['ferdig'] and ib['rusk'], rekke)
    sjekk('innbrudd: etterpå er gulvet der, sprekkveggen og flekken borte, lysene tent og «Visste jeg det.» sagt', ib['gulv'] and ib['sprekkSynlig'] == 0 and ib['dekalSynlig'] == 0 and ib['secrets'] == 1 and ib['lys'] >= 2 and ib['tent'] == ib['lys'] and 'Visste jeg det.' in ib['bobler'], ib)
    await pg.wait_for_timeout(600); await pg.screenshot(path='/tmp/e_53_brudd_2d.png')
    # enkel grafikk: flekken og innbruddet virker, men uten drag og partikler
    sf = await pg.evaluate("""async (still) => { const G = MORBIDIUM, vent = t => new Promise(r => setTimeout(r, t)), s = G.meta.settings, frø = G.run.seed; s.simple = true; applySettings();
          G.run.seed = frø; G.run.dromVent = 0; startFloor(2, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } await vent(200); for (const e of G.enemies) if (e.alive) killEntity(e, {}); G.combat = null; G.lock = null;
          const P = G.player; P.invuln = 999; eval(still)(2); Skjult.trekk(); await vent(300); const ut = { safe: R.safe, dekal: !!(Skjult.info && Skjult.info.meshes.length), trekkE: !!Skjult.trekkE, glod: Glod.liste.length };
          let tS = null; const _s = Skjult.slutt; Skjult.slutt = function () { tS = G.time; return _s.call(this); };
          const g0 = G.time; Spesial.damage(Spesial.cracks[0], 9); const t0 = performance.now(); while (Skjult.vis && G.time - g0 < 3 && performance.now() - t0 < 30000) await vent(30); Skjult.slutt = _s;
          Object.assign(ut, { tid: tS === null ? null : +(tS - g0).toFixed(2), ferdig: !Skjult.vis, gulv: Paint.mesh.gulvSkjult.visible, trekk: Glod.liste.filter(E => E.type === 'trekk').length });
          s.simple = false; applySettings(); return ut; }""", STILL53)
    sjekk('innbrudd med enkel grafikk: flekken er der, ingen drag, og innbruddet blir ferdig innen halvannet sekund uten feil', sf['safe'] and sf['dekal'] and not sf['trekkE'] and sf['trekk'] == 0 and sf['ferdig'] and sf['tid'] is not None and sf['tid'] <= 1.5 and sf['gulv'], sf)
    # hekken ute (10.png): visnet flekk, klokka som tikker inne i hekken i stedet for vinden, og innbruddet med blader
    hk = await pg.evaluate(OPP53, {'d': 1, 'hvor': 'hekk', 'avst': 1.8})
    hkl = await pg.evaluate("""(still) => { eval(still)(3); const M = Stemning.maal(); return { tikk: M.trekk_tikk ? M.trekk_tikk.map(v => +v.toFixed(2)) : null, vind: !!M.trekk_vind, ord: Skjult.ord()[0] }; }""", STILL53)
    sjekk('hint ute: sprekken i en hekk er en visnet flekk, og klokka tikker inne i hekken i stedet for vinden', hk is not None and hk['st'] == 'hekk' and hk['side'] == 's' and not hk['sprite'] and 'topp' in hk['meshes'] and hkl['tikk'] is not None and not hkl['vind'], (hk, hkl))
    await pg.evaluate(STILL53, 1.8); await pg.wait_for_timeout(700); await pg.screenshot(path='/tmp/e_53_hint_park_2d.png')
    ihk = await pg.evaluate(FORLOP53, False)
    sjekk('innbrudd ute: bladene og kvisten (lovbrudd) uten murstein i bristen, og rommet er åpent innen halvannet sekund', 'lovbrudd' in ihk['lyder'] and ihk.get('brist') == 0 and ihk['ferdig'] and ihk['gulv'] and ihk['slutt'] is not None and ihk['slutt'] <= 1.5, ihk)
    await pg.wait_for_timeout(600); await pg.screenshot(path='/tmp/e_53_brudd_park_2d.png')
    sjekk('ingen konsollfeil (hint og innbrudd, 2D)', not pg.errs, pg.errs[:6])
    await pg.close()
    # 3D: flekken, dragene og bristbildet, i et innerom og i hekken
    for hvor, d, avst in (('nord', 2, 1.8), ('hekk', 1, 1.8)):
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg, url=URL3D)
        o3 = await pg.evaluate(OPP53, {'d': d, 'hvor': hvor, 'avst': avst})
        g3 = await pg.evaluate("""async () => { const G = MORBIDIUM, g0 = G.time, t0 = performance.now(); while (G.time - g0 < 1.5 && performance.now() - t0 < 30000) await new Promise(r => setTimeout(r, 50));
              const I = Skjult.info; return { on: D3.on, trekk: !!Skjult.trekkE, mat: I && I.mat.type, dekal: I ? I.meshes.length : 0 }; }""")
        await pg.screenshot(path=f'/tmp/e_53_hint_{hvor}_3d.png')
        sjekk(f'hint i 3D ({hvor}): flekken står på veggen og dragene blåser ut av den', o3 is not None and g3['on'] and g3['dekal'] >= 2 and g3['trekk'] and not o3['sprite'], (o3, g3))
        b3 = await pg.evaluate(FORLOP53, True)
        await pg.wait_for_timeout(300); await pg.screenshot(path=f'/tmp/e_53_brist_{hvor}_3d.png')
        await pg.evaluate("async () => { const G = MORBIDIUM; G.slow.t = 0; G.slow.s = 1; const g0 = G.time, t0 = performance.now(); while ((Skjult.vis || G.time - g0 < 1.6) && performance.now() - t0 < 40000) await new Promise(r => setTimeout(r, 50)); }")
        f3 = await pg.evaluate("() => ({ ferdig: !Skjult.vis, gulv: Paint.mesh.gulvSkjult.visible, skjult: !!MORBIDIUM.skjult })")
        await pg.screenshot(path=f'/tmp/e_53_brudd_{hvor}_3d.png')
        sjekk(f'innbrudd i 3D ({hvor}): bristbildet vises inne (ute bare blader), og rommet er åpent etterpå', b3.get('skudd') and (b3.get('brist', 0) >= 2 if hvor == 'nord' else b3.get('brist') == 0) and f3['ferdig'] and f3['gulv'] and not f3['skjult'], (b3.get('brist'), f3))
        sjekk(f'ingen konsollfeil (hint og innbrudd, 3D {hvor})', not pg.errs, pg.errs[:6])
        await pg.close()


async def del_66(b):
    # 66) Kroker i stedet for innpakning (punkt 4): ingen fil setter de omgjorte funksjonene på nytt, krokene kjører i samme rekkefølge
    #     som innpakningene ga, prio går foran, en feil i én krok stopper ikke de andre, av() tar en krok bort, vaktene kan svare i stedet
    #     for kjernen, rundt-lagene ligger utenpå med det siste ytterst, og våpnene fra andre filer slås opp i VAAPEN_TEGNING og tegnes
    import re as _re
    kilde = {f.name: f.read_text(encoding='utf-8') for f in (ROT / 'src').glob('*.js')}
    KROK = ['startFloor', 'clearFloor', 'spawnBoss', 'bossDie', 'enemyDie', 'drawWeapon', 'spawnProps', 'decorateLevel', 'updateTele', 'updateZones', 'updateProjectiles', 'playerDie', 'spawnEnemy',
            'hurt', 'hurtPlayer', 'healPlayer', 'nearestEnemy', 'groundEffects', 'enemySlip', 'charPart', 'bottlePart', 'updatePlayer', 'updateEnemy', 'meleeHit', 'useAbility',
            'toast', 'stampBig', 'runStats', 'showDeath', 'visUtskrevet', 'applySettings', 'openPause', 'settingsBody', 'openSettings',
            'addPuddle', 'hitProps', 'propArt', 'gainXp', 'bossOnHurt', 'updateBoss', 'descend', 'combatTick', 'utskrivningsbrev']
    pakket = [f'{f}: {n}' for f, t in sorted(kilde.items()) for n in KROK if _re.search(r'(?<![\w.])' + n + r'\s*=(?![=>])', t)]
    sjekk('ingen fil pakker inn funksjonene som har fått kroker', not pakket, pakket)
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await pg.goto(URL); await pg.wait_for_function("() => window.MORBIDIUM && MORBIDIUM.state === 'title'", timeout=60000)
    kr = await pg.evaluate("""() => { const K = Kroker, ut = { orden: {} }, ord = /(Kraken|Kjeder|Dybde|Glod|Drom|Hendelse|Vaer|Blekk|Nedslag|Vaatt|Kombo|Historie|Testmodus|Mini|Blod|Havet|speil|morke|sjefSvekk|kamZoom|journalen|bossDod|kraken|sjokk|Effekter|Skjult|LYS|Landskap|dukket|hpFor|MONSTER_ART|ENEMY_ART|BLOBS|avlopsarm|draug|velsignet|vaatT|Laug)/;
          for (const n of ['clearFloor:foer', 'clearFloor:etter', 'startFloor:foer', 'startFloor:etter', 'spawnBoss:etter', 'bossDie:etter', 'enemyDie:etter', 'spawnProps:etter',
                           'hurt:vakt', 'hurt:foer', 'hurt:etter', 'hurtPlayer:etter', 'enemySlip:vakt', 'charPart:vakt', 'updateEnemy:foer', 'updateEnemy:etter', 'updatePlayer:foer', 'updatePlayer:etter', 'nearestEnemy:rundt'])
            ut.orden[n] = (K.l[n] || []).map(x => (x.fn.toString().match(ord) || ['?'])[0]).join(' ');
          const spor = [], ce = console.error; console.error = () => spor.push('logget');
          try {
            K.foer('t66', () => spor.push('f1')); K.foer('t66', () => spor.push('f2')); K.foer('t66', () => spor.push('f0'), -1);
            K.etter('t66', (r, a) => spor.push('e1:' + r + ':' + a)); K.etter('t66', () => { throw new Error('med vilje'); }); const e3 = K.etter('t66', () => spor.push('e3'));
            ut.svar = K.kall('t66', (a, b) => { spor.push('kjerne'); return a + b; }, null, [2, 3]); ut.spor = spor.join(' ');
            spor.length = 0; K.av('t66', e3); K.kall('t66', () => 0, null, []); ut.av = !spor.includes('e3');
            // vaktene (sist lagt til først) kan svare i stedet for kjernen, også med 0; rundt-lagene ligger utenpå før- og etter-krokene
            const s2 = [], kj = a => { s2.push('k:' + a); return a; };
            K.vakt('t66b', a => { s2.push('v1'); if (a === 1) return 'stopp1'; }); K.vakt('t66b', a => { s2.push('v2'); if (a === 2) return 0; });
            K.rundt('t66b', (neste, a) => { s2.push('r1<'); const s = neste(a * 10); s2.push('>r1'); return s + 1; });
            K.rundt('t66b', (neste, a) => { s2.push('r2<'); const s = neste(a + 1); s2.push('>r2'); return s * 2; });
            K.foer('t66b', a => s2.push('f:' + a)); K.etter('t66b', (s, a) => s2.push('e:' + s + ':' + a));
            ut.vakt = [];
            for (const a of [1, 2, 3]) { s2.length = 0; ut.vakt.push([K.kall('t66b', kj, null, [a]), s2.join(' ')]); }
            spor.length = 0; K.vakt('t66c', () => { throw new Error('med vilje'); }); ut.vaktFeil = [K.kall('t66c', () => 'kjerne', null, []), spor.join(' ')];
            K.rundt('t66d', () => { throw new Error('med vilje'); }); try { K.kall('t66d', () => 1, null, []); ut.rundtFeil = 'stoppet'; } catch (e) { ut.rundtFeil = 'gikk videre'; }
          } finally { console.error = ce; for (const n of ['t66', 't66b', 't66c', 't66d']) for (const s of ['vakt', 'rundt', 'foer', 'etter']) delete K.l[n + ':' + s]; }
          const tegn = id => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.setTransform(60, 0, 0, 60, 64, 120); drawWeapon(id)(g); const d = g.getImageData(0, 0, 128, 128).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n; };
          ut.vaapen = Object.keys(VAAPEN_TEGNING).filter(id => tegn(id) < 40); ut.nVaapen = Object.keys(VAAPEN_TEGNING).length; ut.mopp = tegn('mopp');
          return ut; }""")
    kr['errs'] = pg.errs[:6]
    await pg.close()
    o = kr['orden']
    sjekk('krokene kjører i samme rekkefølge som innpakningene: rydding, etasjestart, sjefene, døden og tingene',
          o == {'clearFloor:foer': 'Kraken Kjeder Dybde Glod Drom Hendelse Vaer', 'clearFloor:etter': 'Blekk Nedslag', 'startFloor:foer': 'Vaatt Kombo',
                'startFloor:etter': 'Hendelse Drom Historie Testmodus', 'spawnBoss:etter': 'morke sjefSvekk kamZoom journalen kraken Testmodus',
                'bossDie:etter': 'Blod sjokk Kombo bossDod kraken Testmodus', 'enemyDie:etter': 'speil Mini Blod Havet', 'spawnProps:etter': 'LYS Effekter Skjult',
                'hurt:vakt': 'dukket', 'hurt:foer': 'hpFor', 'hurt:etter': 'Blod Kombo', 'hurtPlayer:etter': 'Kombo Nedslag Testmodus', 'enemySlip:vakt': 'draug avlopsarm dukket',
                'charPart:vakt': 'MONSTER_ART ENEMY_ART BLOBS', 'updateEnemy:foer': 'Laug velsignet', 'updateEnemy:etter': 'avlopsarm', 'updatePlayer:foer': 'Laug vaatT',
                'updatePlayer:etter': 'Laug', 'nearestEnemy:rundt': 'dukket'}, o)
    sjekk('Kroker: prio foran, før-krokene sist lagt til først, etter-krokene med svaret først, en feil stopper ikke resten, og av() virker',
          kr['svar'] == 5 and kr['spor'] == 'f0 f2 f1 kjerne e1:5:2 logget e3' and kr['av'], kr)
    sjekk('Kroker: vaktene svarer i stedet for kjernen (også med 0), rundt-lagene ligger utenpå med det siste ytterst, en feil i en vakt stopper ikke kallet, og en feil i et rundt-lag går videre',
          kr['vakt'] == [['stopp1', 'v2 v1'], [0, 'v2'], [82, 'v2 v1 r2< r1< f:40 k:40 e:40:40 >r1 >r2']] and kr['vaktFeil'] == ['kjerne', 'logget'] and kr['rundtFeil'] == 'gikk videre',
          [kr['vakt'], kr['vaktFeil'], kr['rundtFeil']])
    sjekk('alle våpnene i VAAPEN_TEGNING tegnes, og moppen fra kjernen også', kr['nVaapen'] == 13 and not kr['vaapen'] and kr['mopp'] > 40, [kr['nVaapen'], kr['vaapen'], kr['mopp']])
    sjekk('ingen konsollfeil (kroker)', not kr['errs'], kr['errs'])


async def del_67(b):
    # 67) Testklokka: Klokke.frys() stopper spilltiden og fjerner oppstartsskjermen, Klokke.spol(sek) går fram nøyaktig så langt i faste steg,
    #     stopper når spillet går ut av 'play' eller til() blir sann, og det som klinger av på skjermen, klinger av også i steg som ikke tegnes.
    #     Med samme frø gir to kjøringer av samme kamp nøyaktig samme stillinger, og slipp() gir tilbake lyden og tallene fra nettleseren.
    #     Tallrekka er spillets egen Math (01_core.js), så Three.js forskyver den ikke.
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg)
    await pg.wait_for_function("() => MORBIDIUM.state === 'play'", timeout=30000)
    fr = await pg.evaluate("""async () => { rolig(); const G = MORBIDIUM, a = {}, vol = Sound.volume, ekte = SpillMath.random, nett = Math.random;
      Klokke.frys({ frø: 5, stille: true }); a.boot = !document.getElementById('boot'); a.stille = Sound.volume === 0;
      const r1 = [Klokke.trekk(), Klokke.trekk()]; Klokke.frys({ frø: 5 }); a.fro = SpillMath.random !== ekte && Math.random === nett && JSON.stringify(r1) === JSON.stringify([Klokke.trekk(), Klokke.trekk()]);
      const t0 = G.time; await new Promise(r => setTimeout(r, 700)); a.sto = G.time === t0;
      const s = Klokke.spol(2); a.spol = [+(G.time - t0).toFixed(6), s.steg, s.tilstand];
      R.fx.hurt = 1; R.fx.blod = 1; R.sjokk(G.player.x, G.player.z, 1); Klokke.spol(1); a.fx = [R.fx.hurt, +R.fx.blod.toFixed(3), R.sjokkL.length];
      const t1 = G.time, u = Klokke.til(() => G.time - t1 >= .5, 3); a.til = [u.stoppet, +u.tid.toFixed(3)];
      openPause(); const p = Klokke.spol(1); a.panel = [p.steg, p.tilstand]; closePanel();
      Klokke.slipp(); Math.random = () => .25; a.slipp = SpillMath.random === ekte && Klokke.trekk() === .25 && Sound.volume === vol; Math.random = nett;
      const t2 = G.time; await new Promise(r => setTimeout(r, 900)); a.gaar = G.time > t2;
      return a; }""")
    sjekk('frys: spilltiden står, oppstartsskjermen er borte, lyden er av, og spillets tallrekke er fast (nettleserens Math.random er urørt)', fr['boot'] and fr['fro'] and fr['stille'] and fr['sto'], fr)
    sjekk('spol(2) går nøyaktig 2 sekunder fram i 120 steg, og blod, rødt blink og sjokkbølger klinger av uten at bildet tegnes',
          fr['spol'] == [2.0, 120, 'play'] and fr['fx'] == [0, 0.62, 0], fr)
    sjekk('til() stopper når vilkåret er oppfylt, og spol står stille i et panel', fr['til'][0] and 0.5 <= fr['til'][1] <= 0.52 and fr['panel'] == [0, 'panel'], fr)
    sjekk('slipp() gir tilbake lyden og tallene fra nettleseren, og spillet går igjen', fr['slipp'] and fr['gaar'], fr)
    # samme kamp to ganger med samme frø og samme spilltid: fiender av flere slag rundt en pasient som ikke kan skades, fem sekunder.
    # Frøet settes før etasjen bygges, og tida settes fordi mye i spillet regner fra G.time.
    KAMP = """() => { const G = MORBIDIUM; G.run.seed = 777; G.run.dromVent = 0; G.meta.lik = [];
      Klokke.frys({ frø: 31, stille: true }); G.time = 1000; startFloor(3, false); rolig(); Hendelse.fjern();
      const P = G.player, r = G.F.rooms.filter(r => r.role === 'combat').sort((a, b) => b.w * b.h - a.w * a.h || a.id - b.id)[0];
      P.x = r.x + r.w / 2 + .5; P.z = r.z + r.h / 2 + .5; P.vx = P.vz = 0; P.hp = P.maxHp = 9999; P.invuln = 999;
      const fi = [['pleier', 2, 0], ['kasteren', -2, 1], ['oppasser', 0, -2], ['laerling', 1.5, 1.5]].filter(f => ENEMIES[f[0]])
        .map(([t, dx, dz]) => { const e = spawnEnemy(t, P.x + dx, P.z + dz, false, 3); e.t = 0; e.sleep = 0; return e; });
      Klokke.spol(5);
      const sig = fi.map(e => [e.type, +e.x.toFixed(6), +e.z.toFixed(6), +e.hp.toFixed(3), e.state, e.alive]);
      const ut = { sig, tid: +G.time.toFixed(6), P: [+P.x.toFixed(6), +P.z.toFixed(6), P.hp], n: G.enemies.length, prosj: G.projectiles.length, rnd: Klokke.trekk() };
      Klokke.slipp(); return ut; }"""
    k1 = await pg.evaluate(KAMP)
    k2 = await pg.evaluate(KAMP)
    beveget = any(abs(a[1] - 0) > 0 for a in k1['sig'])
    # i samme side går tidtakerne til tingene pasienten har, videre mellom kampene, så neste tilfeldige tall kan være et annet
    kamp = lambda k: {x: k[x] for x in k if x != 'rnd'}
    sjekk('samme frø i samme side gir nøyaktig samme kamp to ganger (stillinger, helse og tilstander)', kamp(k1) == kamp(k2) and len(k1['sig']) >= 3 and beveget, [k1, k2])
    sjekk('ingen konsollfeil (testklokka)', not pg.errs, pg.errs[:6])
    await pg.close()
    # to nye sider med samme frø fra tittelen (samme pasient og samme vei fram): helt lik kamp, også neste tilfeldige tall
    async def fra_tittelen():
        s2 = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await s2.goto(URL); await s2.wait_for_function("() => window.MORBIDIUM && MORBIDIUM.state === 'title'", timeout=90000)
        await s2.evaluate("() => Klokke.frys({ frø: 4242, stille: true })")
        await klikk(s2, '#tNew'); await s2.wait_for_timeout(500)
        # en innleggelse uten kamp i første rom (bølgene kommer med setTimeout), og oppstartens tidtakere får gå ut først
        await s2.evaluate("() => { const b = [...document.querySelectorAll('[data-awk]')], rolig = b.find(x => !['soppel', 'operasjon', 'begravelse'].includes(x.dataset.awk)) || b[0]; rolig.click(); }")
        await s2.wait_for_function("() => MORBIDIUM.state === 'play'", timeout=60000); await s2.wait_for_timeout(2000)
        k = await s2.evaluate(KAMP); feil2 = s2.errs[:6]; await s2.close(); return k, feil2
    (t1, f1), (t2, f2) = await fra_tittelen(), await fra_tittelen()
    sjekk('to sider med samme frø fra tittelen gir nøyaktig samme kamp, også neste tilfeldige tall', t1 == t2 and len(t1['sig']) >= 3, [t1, t2])
    sjekk('ingen konsollfeil (testklokka fra tittelen)', not f1 and not f2, f1 + f2)


async def del_68(b):
    # 68) Nettutgaven (dist/web, build.py): bildene, delene og lydene er egne filer. Startsettet (UI-settet, glassene, animasjonsarkene,
    #     pasienten og flatene) er dekodet før tittelen, resten hentes i bakgrunnen, en fiende utenfor startsettet får bildet sitt i spillet,
    #     lydene hentes og pakkes ut uten feil, en mester som kommer før delene hans er hentet, tegnes av koden uten feil, og fra disken
    #     sier siden at nettutgaven må åpnes fra en nettside. Serveres over http som på GitHub Pages.
    import functools, http.server, threading
    web = ROT / 'dist' / 'web'
    if not (web / 'index.html').exists():
        sjekk('nettutgaven finnes (python3 build.py lager dist/web)', False, str(web)); return
    class Stille(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    h = functools.partial(Stille, directory=str(web))
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), h); threading.Thread(target=srv.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{srv.server_address[1]}/index.html?2d'
    try:
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await pg.goto(url); await pg.wait_for_function("() => window.MORBIDIUM && MORBIDIUM.state === 'title'", timeout=90000)
        ti = await pg.evaluate("""() => { performance.setResourceTimingBufferSize(5000); // bufferen holder 250 oppføringer som standard
              const k = Object.keys(SPRITES), start = k.filter(x => Art.iStart(x)), rest = k.filter(x => !Art.iStart(x));
              const lastet = performance.getEntriesByType('resource').concat(performance.getEntriesByType('navigation')).reduce((a, e) => a + (e.transferSize || e.encodedBodySize || 0), 0);
              return { ute: BYGG.ute, adresser: k.every(x => !SPRITES[x].startsWith('data:')), start: start.length, startKlar: start.filter(x => Art.klar(x)).length,
                rest: rest.length, restDekodet: rest.filter(x => Art.klar(x)).length, lyd: Object.values(LYDFILER).every(v => typeof v === 'string' && v.startsWith('lyd/')), mb: +(lastet / 1e6).toFixed(2) }; }""")
        sjekk('nettutgaven: SPRITES og LYDFILER er adresser, og hele startsettet er dekodet før tittelen', ti['ute'] and ti['adresser'] and ti['lyd'] and ti['start'] > 60 and ti['startKlar'] == ti['start'], ti)
        sjekk('nettutgaven: resten er ikke dekodet ved tittelen, og det som er lastet før tittelen, er under 5 MB (den selvstendige fila er 12,7)', ti['restDekodet'] < ti['rest'] / 2 and 0 < ti['mb'] < 5, ti)
        await klikk(pg, '#tNew'); await pg.wait_for_timeout(500); await klikk(pg, '[data-awk]')
        await pg.wait_for_function("() => MORBIDIUM.state === 'play'", timeout=60000)
        sp = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)); rolig(); P.hp = P.maxHp = 1e6; P.invuln = 999;
              // en fiende utenfor startsettet: dukken tegnes av koden først, og bildet kommer
              const k = Object.keys(SPRITES).find(x => x === 'hode_kapellan_f') || Object.keys(SPRITES).find(x => /^hode_.*_f$/.test(x) && !Art.iStart(x)); // forsiden, som tegnes når han ser mot pasienten
              const t = k.split('_')[1], e = spawnEnemy(t, P.x + 2, P.z, false, 2); e.stun = 99;
              for (let i = 0; i < 100 && !Art.klar(k); i++) await vent(100);
              const ut = { nokkel: k, klar: Art.klar(k) };
              // lydene: hentes og pakkes ut når lyden er i gang (første klikk), uten feil
              for (let i = 0; i < 300 && Lydbank.klar + Lydbank.feil < Lydbank.totalt; i++) await vent(100);
              ut.lyd = { klar: Lydbank.klar, feil: Lydbank.feil, totalt: Lydbank.totalt };
              // en fiende som kles med deler før delene er hentet: koden tegner hodet, uten feil, og delene hentes. Bildene kastes fra minnet
              // først, så de må hentes på nytt (som når en mester kommer tidlig i nettutgaven)
              const kat = Oppskrift.deler().hode, serie = Object.keys(kat)[0], hode = kat[serie][Object.keys(kat[serie])[0]], nk = Object.values(hode);
              for (const x of nk) delete Art.img[x];
              try { const e2 = spawnEnemy('pleier', P.x - 2, P.z, false, 2); e2.stun = 99; e2.doll.setParts(null, null); Oppskrift.kleDeler(e2.doll, hode, null, null, 'har', null); ut.kodeHode = !e2.doll.headOv; } catch (err) { ut.mesterFeil = String(err); }
              ut.mester = !ut.mesterFeil; for (let i = 0; i < 50 && !nk.every(x => Art.klar(x)); i++) await vent(100); ut.delHentet = nk.every(x => Art.klar(x));
              // bakgrunnen blir ferdig: alle filene er hentet etter en stund
              const alle = Object.keys(SPRITES).length; let hentet = 0;
              const filer = () => new Set(performance.getEntriesByType('resource').map(r => new URL(r.name).pathname).filter(x => x.includes('/bilder/') || x.includes('/deler/'))).size;
              for (let i = 0; i < 300; i++) { hentet = filer(); if (hentet >= alle) break; await vent(200); }
              ut.bakgrunn = { hentet, alle };
              return ut; }""")
        sjekk('nettutgaven: en fiende utenfor startsettet får bildet sitt i spillet', sp['klar'], sp)
        sjekk('nettutgaven: lydene hentes som filer og pakkes ut uten feil', sp['lyd']['feil'] == 0 and sp['lyd']['klar'] == sp['lyd']['totalt'] > 100, sp['lyd'])
        sjekk('nettutgaven: en fiende som kles med deler før de er hentet, tegnes av koden uten feil, og delene hentes', sp['mester'] and sp.get('kodeHode') and sp['delHentet'], sp)
        sjekk('nettutgaven: bakgrunnen henter alle bildene og delene etter hvert', sp['bakgrunn']['hentet'] >= sp['bakgrunn']['alle'], sp['bakgrunn'])
        sjekk('ingen konsollfeil (nettutgaven)', not pg.errs, pg.errs[:6])
        await pg.close()
        # fra disken: en tydelig melding i stedet for et spill uten bilder og lyd
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await pg.goto((web / 'index.html').as_uri()); await pg.wait_for_timeout(4000)
        tekst = await pg.evaluate("() => { const e = document.getElementById('err'); return e ? e.textContent : ''; }")
        sjekk('nettutgaven fra disken sier at den må åpnes fra en nettside, og peker på morbidium.html', 'nettutgaven' in tekst and 'morbidium.html' in tekst, tekst[:160])
        await pg.close()
    finally:
        srv.shutdown()


DELER = {43: del_43, 53: del_53, 66: del_66, 67: del_67, 68: del_68}
