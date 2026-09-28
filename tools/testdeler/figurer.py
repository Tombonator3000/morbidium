"""Figurene: pasientene, animasjonene, hår og pynt, og UI-settet.

Testdeler fra test_ekstra.py. Kjøres med python3 tools/test_ekstra.py --system figurer eller --del N.
"""
from .felles import sjekk, ny_side, start_lop, URL


async def del_10(b):
    # 10) pasientene settes sammen av kjønn, hår, hud, klær, sko og pynt
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await pg.goto(URL); await pg.wait_for_timeout(2000); await pg.evaluate("() => localStorage.clear()")
    v = await pg.evaluate("""() => { const L = Array.from({ length: 300 }, () => Pasient.lag()), c = k => new Set(L.map(l => typeof l[k] === 'object' ? l[k].join() : l[k])).size;
          return { kjonn: c('kjonn'), klaer: c('klaer'), har: c('har'), hud: c('hud'), sko: c('sko'), pynt: L.filter(l => l.pynt.length).length, unike: new Set(L.map(l => Pasient.nokkel(l))).size }; }""")
    sjekk('300 nye pasienter har begge kjønn, alle fem plagg og mange varianter', v['kjonn'] == 2 and v['klaer'] == 5 and v['har'] >= 5 and v['hud'] == 4 and v['sko'] >= 4 and v['pynt'] > 60 and v['unike'] > 250, v)
    navn = []
    for i in range(8):
        await pg.evaluate("() => showIntake()"); await pg.wait_for_timeout(250)
        navn.append(await pg.evaluate("() => { const p = MORBIDIUM.patient; return [p.name.split(' ')[0], p.look.kjonn, (p.look.kjonn === 'k' ? FIRST_K : FIRST_M).includes(p.name.split(' ')[0]), document.querySelector('.intake').textContent.includes('Iført')]; }"))
    sjekk('fornavnet passer kjønnet, og kortet sier hva pasienten har på seg', all(n[2] and n[3] for n in navn), navn)
    await pg.click('[data-awk]'); await pg.wait_for_timeout(1500)
    d = await pg.evaluate("() => { const G = MORBIDIUM, D = Pasient.deler(G.run.look), dl = G.player.doll; return { hode: dl.headOv === D.hode, kropp: dl.bodyOv === D.kropp, arm: dl.rig.arm === D.rig.arm, pynt: (dl.addons || []).length === D.pynt.length, medalje: !!document.querySelector('#medal canvas') }; }")
    sjekk('spillerfiguren bruker pasientens hode, klær, farger og pynt', all(d.values()), d)
    g = await pg.evaluate("() => { try { Pasient.dukke(undefined).dispose(); corpseArt(null); corpseArt({ v: 1, klaer: 'ukjent', har: 'lilla' }); return Pasient.norm({ v: 1, klaer: 'ukjent' }).klaer; } catch (e) { return String(e); } }")
    sjekk('gamle lagringer uten utseende og ugyldige verdier gir standardpasienten', g == 'kape', g)
    rib = await pg.evaluate("() => { const dl = MORBIDIUM.player.doll; return [dl.front.n, dl.back.n, dl.front.cap]; }")
    sjekk('armer og bein får plass til både kontur og farge', rib[0] < rib[2] and rib[1] < rib[2], rib)
    st = await pg.evaluate("""async () => { const dl = MORBIDIUM.player.doll, s = MORBIDIUM.meta.settings, bein = () => dl.back.strokes.filter(k => !k.circle).map(k => [k.w, k.color]), vent = () => new Promise(r => setTimeout(r, 1200));
          const a = { standard: s.lemmer, tynn: bein() }; s.lemmer = 'tykke'; applySettings(); await vent(); a.tykk = bein(); s.lemmer = 'tynne'; applySettings(); await vent(); a.tilbake = bein(); a.rig = [dl.rig.legW, dl.rig.leg]; a.strek = [STREK.ben, STREK.farge]; return a; }""")
    sjekk('armer og bein er tynne blekkstreker som standard og kan byttes til tykke i innstillingene', st['standard'] == 'tynne' and st['tynn'] and all(k == st['strek'] for k in st['tynn']) and all(k == st['rig'] for k in st['tykk']) and st['tilbake'] == st['tynn'], st)
    await pg.evaluate("() => { rolig(); R.view = 5; R.resize(); }"); await pg.wait_for_timeout(600); await pg.screenshot(path='/tmp/e_20pasient.png')
    sjekk('ingen konsollfeil (pasienter)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_17(b):
    # 17) animasjonssystemet: tegnede ruter når arket mangler, spilles av og forsvinner, går i ring, baklengs og blir stående
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg)
    an = await pg.evaluate("""() => { rolig(); const P = MORBIDIUM.player, a = {};
          a.ruter = Object.keys(ANIM).map(k => [k, Anim.rammer(k).length]);
          const h = Anim.lag('kastesprut', P.x, P.z, { fps: 20 }); a.lagd = Anim.aktive.includes(h);
          for (let i = 0; i < 12; i++) Anim.tick(.05); a.ferdig = h.done && !Anim.aktive.includes(h);
          const l = Anim.lag('oye', P.x + 1, P.z, { loop: true, fps: 10 }); for (let i = 0; i < 30; i++) Anim.tick(.05); a.ring = !l.done && Anim.aktive.includes(l); Anim.fjern(l); Anim.tick(.01); a.fjernet = !Anim.aktive.includes(l);
          const r = Anim.lag('oye', P.x - 1, P.z, { fps: 10, fart: -1, start: 4 }); a.start = r.i; for (let i = 0; i < 20; i++) Anim.tick(.05); a.baklengs = r.i === 0 && r.done;
          const s = Anim.lag('blodsprut', P.x, P.z, { hold: true, fps: 30 }); for (let i = 0; i < 20; i++) Anim.tick(.05); a.hold = s.done && Anim.aktive.includes(s) && s.i === s.rammer.length - 1; Anim.fjern(s);
          const k = posStat({ navn: 'kast', p: .5 }); a.pose = !!k && Object.values(k).every(v => Array.isArray(v) && v.every(Number.isFinite)); a.ukjent = posStat({ navn: 'finnesikke', p: .5 }) === null;
          return a; }""")
    sjekk('animasjonene har ruter (tegnet når arket mangler), spilles av og forsvinner, går i ring, baklengs og blir stående',
          all(n > 1 for k, n in an['ruter']) and an['lagd'] and an['ferdig'] and an['ring'] and an['fjernet'] and an['start'] == 4 and an['baklengs'] and an['hold'], an)
    sjekk('posituren «kast» gir tall til dukken, og en ukjent positur gir ingenting', an['pose'] and an['ukjent'], an)
    sjekk('ingen konsollfeil (animasjon)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_22(b):
    # 22) UI-settet fra ChatGPT: uten bilder tegner CSS-en som før, med bilder byttes rammer, ringer, hjerter og ikoner inn uten at boksene endrer størrelse.
    #     Alle UI-bildene er levert nå, så de tas ut av SPRITES mens sjekken går, og legges tilbake etterpå
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg)
    ui = await pg.evaluate("""async () => { rolig(); const a = {}, px = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
          const P = MORBIDIUM.player; P.cds[1] = 4.6; (P.cdMax || (P.cdMax = [1, 1, 1, 1]))[1] = 8; await new Promise(r => setTimeout(r, 500));
          const cd = document.querySelector('#ac1 .cd'); a.nedtelling = cd && !cd.classList.contains('hidden') ? cd.textContent : null; a.sektor = cd ? +cd.style.getPropertyValue('--p') : -1;
          const ekte = {}; for (const k of Object.keys(SPRITES)) if (k.startsWith('ui_')) { ekte[k] = SPRITES[k]; delete SPRITES[k]; }
          a.uten = brukUIsett().length === 0 && !document.body.classList.contains('ui-sett'); a.kodehjerte = !hjerteHtml(1, c => '<i style="color:' + c + '"></i>').includes('uihjerte');
          const boks = () => { const r = document.getElementById('plate').getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; }, f0 = boks();
          for (const k of ['ui_panel', 'ui_kort', 'ui_ring_kart', 'ui_hjerte_full', 'ui_hjerte_halv', 'ui_ikon_pause']) SPRITES[k] = px;
          a.halvtSett = hjerteHtml(1, c => '').includes('uihjerte'); SPRITES.ui_hjerte_tom = px;
          a.brukt = brukUIsett(); a.css = (document.getElementById('uiSett') || { textContent: '' }).textContent.includes('border-image'); a.ikon = !!document.querySelector('#bPause img');
          a.hjerte = hjerteHtml(.5, c => '').includes('uihjerte'); const f1 = boks(); a.boks = Math.abs(f1[0] - f0[0]) <= 2 && Math.abs(f1[1] - f0[1]) <= 2;
          for (const k of Object.keys(SPRITES)) if (k.startsWith('ui_')) delete SPRITES[k]; Object.assign(SPRITES, ekte); brukUIsett(); // de leverte bildene tilbake
          return a; }""")
    sjekk('kortet viser nedtellingen i sekunder og en sektor som krymper', ui['nedtelling'] in ('4s', '5s') and 0.3 < ui['sektor'] < 0.65, ui)
    sjekk('UI-settet: CSS-en tegner når bildene mangler, og ChatGPTs bilder tas i bruk uten å endre størrelsen på boksene',
          ui['uten'] and ui['kodehjerte'] and not ui['halvtSett'] and ui['brukt'] == ['ui_panel', 'ui_kort', 'ui_ring_kart', 'ui_ikon_pause'] and ui['css'] and ui['ikon'] and ui['hjerte'] and ui['boks'], ui)
    sjekk('ingen konsollfeil (UI-sett)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_56(b):
    # 56) Hår og pynt på hodet
    #     Papiljottene og den andre pynten sitter på hodet og svever ikke over det (8.png): minst 15 prosent av pynten ligger over hodet
    #     for begge kjønn i alle tre retninger, hornene og svulsten minst 10 prosent. Issen måles på hodebildet (hodeTopp), pynten dreies
    #     med et hode som vipper, og HUD-portrettet krymper ikke hodet for pynt som ikke stikker over kanten. Også kontrollene i GRAFIKKLEVERANSE.md:
    #     hjortens kropp står over beina, frisyrene fra ChatGPT på personalet dekker hodet, og ansiktstilbehøret sitter på ansiktet.
    PYNT56 = """() => { const ut = { lav: [], min: {}, topp: [], kode: 0 };
          const dekning = (H, Q, ox, oy) => { const S = 128, W = 420, cx = 210, cy = 330, c = document.createElement('canvas'); c.width = c.height = W; const g = c.getContext('2d'),
              img = (P, x, y) => g.drawImage(P.canvas, cx + (x - P.ax) * S, cy - (y + P.h - P.ay) * S, P.w * S, P.h * S);
            img(H, 0, 0); const h = g.getImageData(0, 0, W, W).data; g.clearRect(0, 0, W, W); img(Q, ox, oy); const q = g.getImageData(0, 0, W, W).data;
            let n = 0, over = 0; for (let i = 3; i < q.length; i += 4) if (q[i] > 128) { n++; if (h[i] > 128) over++; } return n ? over / n : 0; };
          for (const kjonn of ['m', 'k']) {
            for (const id in PAS_PYNT) { if (PAS_PYNT[id].face) continue; const D = Pasient.deler({ v: 1, kjonn, pynt: [id] }), p = D.pynt[0];
              for (const v of ['f', 's', 'b']) { const a = dekning(D.hode[v], p.P, p.L.off[v][0], p.L.off[v][1]); ut.min[id] = Math.min(ut.min[id] ?? 1, +a.toFixed(3)); if (a < .15) ut.lav.push([id, kjonn, v, +a.toFixed(3)]); } }
            const D = Pasient.deler({ v: 1, kjonn });
            for (const k of ['horn', 'svulst']) for (const v of ['f', 's', 'b']) { const H = D.hode[v], o = LOOKS[k].off[v] || LOOKS[k].off.f, a = dekning(H, addonPart(k), o[0], o[1] + hodeTopp(H) - .78); ut.min[k] = Math.min(ut.min[k] ?? 1, +a.toFixed(3)); if (a < .1) ut.lav.push([k, kjonn, v, +a.toFixed(3)]); }
            for (const v of ['f', 's', 'b']) ut.topp.push(+hodeTopp(D.hode[v]).toFixed(3));
          }
          ut.kode = +hodeTopp(Art.part('test56_kodehode', 1.2, 1.1, .6, .1, drawPasientHead('f', {}))).toFixed(3);
          // HUD-portrettet: med papiljotter står hodet like stort som uten pynt (nederste del av bildet er lik), med nattlue krymper det
          const rader = look => { const c = portraitCanvas('pasient', look); return c.getContext('2d').getImageData(0, 72, 128, 56).data; }, ulik = (a, b) => { let n = 0; for (let i = 3; i < a.length; i += 4) if (Math.abs(a[i] - b[i]) > 40) n++; return n; };
          const u = rader({ v: 1, kjonn: 'm' }); ut.hud = { papiljotter: ulik(u, rader({ v: 1, kjonn: 'm', pynt: ['papiljotter'] })), nattlue: ulik(u, rader({ v: 1, kjonn: 'm', pynt: ['nattlue:#b3261e'] })) };
          return ut; }"""
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg)
    ut = await pg.evaluate(PYNT56)
    sjekk('papiljotter og annen pynt ligger minst 15 prosent over hodet for begge kjønn forfra, fra siden og bakfra (horn og svulst minst 10)', not ut['lav'], ut)
    sjekk('issen på hodene fra ChatGPT måles til .78, det tegnede reservehodet høyere (.84 til .96)', all(abs(t - .78) <= .02 for t in ut['topp']) and .84 <= ut['kode'] <= .96, [ut['topp'], ut['kode']])
    sjekk('HUD-portrettet krymper hodet for nattlua, men ikke for papiljottene', ut['hud']['papiljotter'] == 0 and ut['hud']['nattlue'] > 50, ut['hud'])
    rot = await pg.evaluate("""() => { const G = MORBIDIUM, ut = {}, r = .3, c = Math.cos(r), s = Math.sin(r), fasit = (base, o) => [base.position.x + o[0] * c - o[1] * s, base.position.y + o[0] * s + o[1] * c];
          const d = Pasient.dukke({ v: 1, kjonn: 'k', pynt: ['papiljotter', 'plaster'] }); d.update(.016, {});
          ut.dukke = ['f', 's', 'b'].map(v => { d.head.rotation.z = r; d.placeAddons(v); const a = d.addons[0], f = fasit(d.head, a.L.off[v]); return +Math.max(Math.abs(a.m.position.x - f[0]), Math.abs(a.m.position.y - f[1]), Math.abs(a.m.rotation.z - r)).toFixed(4); });
          d.dispose();
          // pasientens tillegg fra gjenstandene (placeLook) følger også hodet
          const P = G.player, pd = P.doll; Items.clearLook(); const m = partMesh(addonPart('horn'), pd.U); pd.plane.add(m); Items.addons.horn = m;
          pd.head.rotation.z = r; Items.placeLook(); const v = pd.view || 'f', o = LOOKS.horn.off[v] || LOOKS.horn.off.f, f = fasit(pd.head, [o[0], o[1] + hodeTopp(pd.head.userData.P) - .78]);
          ut.look = +Math.max(Math.abs(m.position.x - f[0]), Math.abs(m.position.y - f[1])).toFixed(4); Items.clearLook(); return ut; }""")
    sjekk('pynten og tilleggene dreies med hodet når det vipper (0,3 radianer)', all(x <= .001 for x in rot['dukke']) and rot['look'] <= .001, rot)
    # Den hvite hjorten (GRAFIKKLEVERANSE.md): kroppen fra ChatGPT har bunnen på festepunktet, så den må løftes over beina (de starter på .95),
    # og toppen må nå opp til halsen (hodet henger på 1.55), ellers ligger kroppen på bakken under et hode som svever
    hj = await pg.evaluate("""() => { const d = LAGDUKKE.hjort.deler[0], P = d.P(), W = P.canvas.width, H = P.canvas.height, a = P.canvas.getContext('2d').getImageData(0, 0, W, H).data; let lo = -1, hi = -1;
          for (let y = 0; y < H; y++) { let n = 0; for (let x = 0; x < W; x++) if (a[(y * W + x) * 4 + 3] > 128) n++; if (n > W * .05) { if (hi < 0) hi = y; lo = y; } }
          const opp = y => +(d.y + P.h - P.ay - y / 128).toFixed(2); return { bilde: SPRITES.hjort_kropp ? spriteReady('hjort_kropp') : 'mangler', bunn: opp(lo + 1), topp: opp(hi), hals: LAGDUKKE.hjort.deler[1].y }; }""")
    sjekk('hjortens kropp står over beina og når opp til halsen', hj['bilde'] is True and .6 <= hj['bunn'] <= .95 and hj['topp'] >= hj['hals'], hj)
    # frisyrene og ansiktstilbehøret fra ChatGPT på personalet (Oppskrift.kleDeler): håret er en parykk som skal dekke hodet, ikke sveve over det
    # (før lå 1 til 7 prosent av håret over hodet), munnbindet under øynene og gassmasken over ansiktet (før dekket begge øynene og pannen)
    op = await pg.evaluate("""() => { const D = Oppskrift.deler(), ut = { har: {}, lav: [], bind: [], maske: [] }, alle = [];
          for (const hs in D.hode || {}) for (const hn in D.hode[hs]) alle.push(D.hode[hs][hn]);
          const dekning = (H, Q, ox, oy) => { const S = 100, W = 360, cx = 180, cy = 300, c = document.createElement('canvas'); c.width = c.height = W; const g = c.getContext('2d'),
              img = (P, x, y) => g.drawImage(P.canvas, cx + (x - P.ax) * S, cy - (y + P.h - P.ay) * S, P.w * S, P.h * S);
            img(H, 0, 0); const h = g.getImageData(0, 0, W, W).data; g.clearRect(0, 0, W, W); img(Q, ox, oy); const q = g.getImageData(0, 0, W, W).data;
            let n = 0, over = 0; for (let i = 3; i < q.length; i += 4) if (q[i] > 128) { n++; if (h[i] > 128) over++; } return n ? over / n : 0; };
          const kle = (hode, kind, set) => { const f = [], d = { setParts() { }, addAddon(P, L) { f.push(L); } }; Oppskrift.kleDeler(d, hode, null, kind === 'tilbehor' ? null : set, kind, kind === 'tilbehor' ? set : null); return f[0]; };
          for (const s in D.har || {}) for (const n in D.har[s]) for (const hode of alle) for (const v of ['f', 's', 'b']) { const L = kle(hode, 'har', D.har[s][n]); if (!hode[v] || !L || !L.views[v]) continue;
            const o = L.off[v], a = dekning(Oppskrift.delPart(hode[v], 'hode'), L.views[v], o[0], o[1]); ut.har[s + n] = Math.min(ut.har[s + n] ?? 1, +a.toFixed(2)); if (a < .15) ut.lav.push([s + n, v, +a.toFixed(2)]); }
          const T = (D.tilbehor || {}).ansikt || {};
          for (const hode of alle) for (const v of ['f', 's']) { const hh = Oppskrift.delPart(hode[v], 'hode').dh;
            if (T[2]) { const L = kle(hode, 'tilbehor', T[2]); ut.bind.push(+((L.off[v][1] + L.views[v].dh) / hh).toFixed(2)); }
            if (T[3]) { const L = kle(hode, 'tilbehor', T[3]); ut.maske.push(+((L.off[v][1] + L.views[v].dh / 2) / hh).toFixed(2)); } }
          ut.lav = ut.lav.slice(0, 8); return ut; }""")
    sjekk('frisyrene fra ChatGPT dekker hodet (minst 15 prosent av håret over hodet på alle hodene og i alle retningene)', len(op['har']) >= 6 and not op['lav'], op)
    sjekk('munnbindet har overkanten under øynene og gassmasken står midt på ansiktet', op['bind'] and op['maske'] and all(.38 <= x <= .5 for x in op['bind']) and all(.3 <= x <= .5 for x in op['maske']), [op['bind'], op['maske']])
    # dødskortet med papiljotter
    await pg.evaluate("() => { const G = MORBIDIUM; G.run.look = { v: 1, kjonn: 'm', har: 'brun', hud: 0, klaer: 'kape', farge: 'sennep', sko: 'tofler', pynt: ['papiljotter'] }; G.player.invuln = 0; playerDie(); }")
    el = await pg.wait_for_selector('#deadc', timeout=60000); await pg.wait_for_timeout(300)
    await el.screenshot(path='/tmp/e_56_papiljotter.png')
    sjekk('ingen konsollfeil (hår og pynt)', not pg.errs, pg.errs[:6])
    await pg.close()


DELER = {10: del_10, 17: del_17, 22: del_22, 56: del_56}
