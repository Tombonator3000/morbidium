"""Lyden og musikken.

Testdeler fra test_ekstra.py. Kjøres med python3 tools/test_ekstra.py --system lyd_og_musikk eller --del N.
"""
from .felles import sjekk, ny_side, start_lop, URL


async def del_12(b):
    # 12) musikken følger situasjonen
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await pg.goto(URL); await pg.wait_for_timeout(2000); await pg.evaluate("() => localStorage.clear()")
    await pg.mouse.click(5, 5); await pg.wait_for_timeout(600)
    t = await pg.evaluate("() => ({ navn: Musikk.navn, klar: Sound.ready })")
    await start_lop(pg)
    await pg.evaluate("() => { startFloor(1, false); const G = MORBIDIUM, P = G.player, r = G.F.rooms.find(r => r.role === 'combat'); P.hp = P.maxHp = 9999; P.x = r.x + r.w / 2; P.z = r.z + r.h / 2; }")
    # det nye stykket begynner på neste taktstrek (06_musikk.js), og kamplaget på neste slag
    k = await pg.evaluate("""async () => { const vent = t => new Promise(r => setTimeout(r, t)); for (let i = 0; i < 100 && !(Musikk.navn === 'park' && Musikk.niva === 1 && Musikk.steg > 3); i++) await vent(100);
          return { navn: Musikk.navn, niva: Musikk.niva, steg: Musikk.steg }; }""")
    await pg.evaluate("() => { const P = MORBIDIUM.player; P.invuln = 0; P.iframe = 0; hurt(P, 99999, { type: 'kultist' }); }"); await pg.wait_for_timeout(2600)
    d = await pg.evaluate("() => Musikk.navn")
    sjekk('musikken spiller på tittelen, går over i kamp og stopper ved død', t == {'navn': 'tittel', 'klar': True} and k['navn'] == 'park' and k['niva'] == 1 and k['steg'] > 3 and d is None, [t, k, d])
    sjekk('ingen konsollfeil (musikk)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_32(b):
    # 32) Lydbanken: de innspilte lydene pakkes ut, kartet oversetter spillets lydnavn, fottrinn, stemningssløyfer, stemmer og innstillingen
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await pg.goto(URL); await pg.wait_for_timeout(2000); await pg.evaluate("() => localStorage.clear()")
    await start_lop(pg)
    ut = await pg.evaluate("""async () => { const vent = t => new Promise(r => setTimeout(r, t)), G = MORBIDIUM, P = G.player, ut = {};
          for (let i = 0; i < 400 && Lydbank.klar + Lydbank.feil < Lydbank.totalt; i++) await vent(100);
          ut.klar = Lydbank.klar; ut.feil = Lydbank.feil; ut.totalt = Lydbank.totalt; ut.meta = Object.keys(LYD_META).length;
          ut.mangler = [...new Set(Object.values(LYD_KART).flatMap(K => K.s.map(s => s[0])).concat(Object.values(FOTGULV).map(f => f[0])).filter(g => !Lydbank.har(g)))];
          // sløyfepunktene ligger inne i lyden, også med stillheten nettleseren legger foran
          ut.sloyfer = Object.keys(LYD_META).filter(k => Array.isArray(LYD_META[k].sloyfe)).every(k => { const b = Lydbank.buf[k], s = LYD_META[k].sloyfe, f = Lydbank.forsink[k] || 0; return b && s[0] < s[1] && f + s[1] <= b.duration + .001; });
          const spilt = [], _s = Lydbank.spill; Lydbank.spill = function (g, o) { spilt.push(g); return _s.call(this, g, o); };
          let kast = null; try { for (const n of Object.keys(LYD_KART)) Sound.play(n, .3, 1); } catch (e) { kast = e.message; } ut.kast = kast; ut.kart = new Set(spilt).size; spilt.length = 0;
          // fottrinn etter gulvet
          for (const e of G.enemies) if (e.alive) killEntity(e, {}); P.hp = P.maxHp = 9999; Lydbank.fx = null; Lydbank.fotD = 0;
          for (let i = 0; i < 10; i++) { P.x += .5; Lydbank.fot(); } P.x -= 5;
          const lov = new Set(['fot_vann'].concat(Object.values(FOTGULV).map(f => f[0]))); ut.fot = spilt.filter(g => g.startsWith('fot_')); ut.fotRiktig = ut.fot.length >= 2 && ut.fot.every(g => lov.has(g)); spilt.length = 0;
          // og riktig lyd for gulvet der pasienten står
          Lydbank.fx = null; Lydbank.fot(); P.x += 1.5; Lydbank.fotD = 1.5; spilt.length = 0; Lydbank.fot(); const gulv = gulvUnder(P.x, P.z); ut.gulv = gulv; ut.fotHer = spilt[0]; ut.fotRiktig = ut.fotRiktig && (spilt[0] === 'fot_vann' || spilt[0] === (FOTGULV[gulv] || ['fot_stein'])[0]); P.x -= 1.5; spilt.length = 0;
          // stemningen i Dypet: havet og dronen, og regnet ute
          startFloor(6, false); for (const e of G.enemies) if (e.alive) killEntity(e, {}); for (let i = 0; i < 6; i++) { Stemning.t = 0; Stemning.tick(.25); await vent(30); }
          ut.dypet = Object.keys(Stemning.lag); ut.drone = !!Sound.drone;
          startFloor(1, false); for (const e of G.enemies) if (e.alive) killEntity(e, {}); Sound.vaer('regn'); for (let i = 0; i < 6; i++) { Stemning.t = 0; Stemning.tick(.25); await vent(30); }
          ut.regn = Object.keys(Stemning.lag).includes('amb_regn') && !Sound.vaerN; Sound.vaer(null);
          // en fiende på vei mot pasienten stønner
          const e = spawnEnemyBareTest('pleier', P.x + 3, P.z); e.state = 'chase'; e.stemT = 0; Lydbank.stemmeT = 0; spilt.length = 0; Lydbank.stemmer(.1); ut.stemme = spilt.includes('stonn');
          // innstillingen: bare synth
          G.meta.settings.opptak = false; applySettings(); spilt.length = 0; Sound.play('door'); Sound.play('hit'); ut.avSpilt = spilt.length; ut.avHar = Lydbank.har('door');
          G.meta.settings.opptak = true; applySettings(); ut.paaIgjen = Lydbank.har('door');
          Lydbank.spill = _s; return ut; }""")
    sjekk('alle de innspilte lydene pakkes ut uten feil', ut['feil'] == 0 and ut['klar'] == ut['totalt'] == ut['meta'] and ut['meta'] > 150, [ut['klar'], ut['feil'], ut['totalt'], ut['meta']])
    sjekk('kartet oversetter alle lydnavnene til opptak som finnes, og sløyfepunktene ligger inne i lydene', not ut['mangler'] and ut['sloyfer'] and ut['kast'] is None and ut['kart'] >= 40, [ut['mangler'], ut['sloyfer'], ut['kast'], ut['kart']])
    sjekk('fottrinn etter gulvet', ut['fotRiktig'], [ut['fot'], ut['gulv'], ut['fotHer']])
    sjekk('stemningssløyfer: havet og dronen i Dypet, regnet ute tar over for støyen', 'amb_hav' in ut['dypet'] and 'amb_drone' in ut['dypet'] and ut['drone'] and ut['regn'], [ut['dypet'], ut['drone'], ut['regn']])
    sjekk('en fiende på vei mot pasienten stønner', ut['stemme'])
    sjekk('«Innspilte lyder» av gir bare synth, og på igjen gir opptakene tilbake', ut['avSpilt'] == 0 and not ut['avHar'] and ut['paaIgjen'], [ut['avSpilt'], ut['avHar'], ut['paaIgjen']])
    sjekk('ingen konsollfeil (lydbanken)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_33(b):
    # 33) Musikken som iMUSE: bytte på taktstreken med bro, besetning etter rommet, kamplaget på neste slag, innslag i tonearten, roen og drømmen
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await pg.goto(URL); await pg.wait_for_timeout(2000); await pg.evaluate("() => localStorage.clear()")
    await start_lop(pg)
    ut = await pg.evaluate("""async () => { const vent = t => new Promise(r => setTimeout(r, t)), G = MORBIDIUM, P = G.player, ut = {};
          const rolig = () => { for (const e of G.enemies) if (e.alive) killEntity(e, {}); G.combat = null; G.lock = null; for (const b of G.barriers) b.up = false; G.rooms.forEach(s => s.cleared = true); };
          for (let i = 0; i < 400 && Lydbank.klar + Lydbank.feil < Lydbank.totalt; i++) await vent(100);
          // fra etasjen til Dypet: det nye stykket venter på taktstreken, og broen spilles først
          for (let i = 0; i < 60 && Musikk.navn !== stykkeFor(G.depth); i++) await vent(100);
          const n0 = Object.assign({}, Musikk.tall); startFloor(6, false); rolig(); P.hp = P.maxHp = 9999; Musikk.velg(.016);
          const O = Musikk.overgang, per = Musikk.per(); ut.venter = Musikk.navn !== 'e4' && !!O && O.til === 'e4'; ut.paaStrek = !!O && O.b % per === 0;
          // byttet følger lydklokka (vanlig tid), og på en travel maskin med tre nettlesere kan broen og taktstreken ta lenger tid
          for (let i = 0; i < 250 && Musikk.navn !== 'e4'; i++) await vent(100);
          ut.byttet = Musikk.navn === 'e4' && Musikk.tall.bytter > n0.bytter && Musikk.tall.broer > n0.broer;
          // besetningen følger rommet
          const rom = G.F.rooms.find(r => ROM_BESETNING[r.template] && !['combat', 'risk', 'boss'].includes(r.role)) || G.F.rooms.find(r => ROM_BESETNING[r.template]);
          if (rom) { P.x = rom.cx + .5; P.z = rom.cz + .5; ut.forventet = ROM_BESETNING[rom.template]; for (let i = 0; i < 100 && Musikk.bNavn !== ut.forventet; i++) await vent(100); ut.besetning = Musikk.bNavn; }
          // kamplaget kommer på neste slag
          const kr = G.F.rooms.find(r => r.role === 'combat'); G.rooms[G.F.rooms.indexOf(kr)].cleared = false; P.x = kr.cx + .5; P.z = kr.cz + .5; for (let i = 0; i < 60 && !G.combat; i++) await vent(100);
          ut.kamp = !!G.combat; for (let i = 0; i < 40 && Musikk.niva !== 1; i++) await vent(100); ut.niva = Musikk.niva;
          // innslag og stemte plinger
          const i0 = Musikk.tall.innslag; Sound.play('clear'); Sound.play('level'); ut.innslag = Musikk.tall.innslag - i0;
          const A = Musikk.akkord(Musikk.takt()), sk = SKALA[Musikk.S.skala], akkTone = midiHz(Musikk.S.rot + sk[A[0] % 7] + 60 - 12 * Math.floor((Musikk.S.rot + sk[A[0] % 7]) / 12));
          ut.stemAkkord = Math.abs(Musikk.stem(akkTone) - 1) < .001; ut.stemOmfang = [784, 1318, 659, 523, 1000].every(f => { const k = Musikk.stem(f); return k > .7 && k < 1.42; });
          const now = Sound.ctx.currentTime, s1 = Musikk.slag(1), s2 = Musikk.slag(2); ut.slag = s1.t >= now - .01 && s1.t < now + .4 && s2.t >= s1.t;
          // roen: uten kamp og fiender glir musikken over i stemning, og et nytt rom henter den fram igjen
          rolig(); for (const e of G.enemies) e.alive = false; Musikk.roT = 40; for (let i = 0; i < 40; i++) Musikk.velg(.5); ut.ro = +Musikk.glid.toFixed(2); ut.stemningK = +Musikk.stemningK().toFixed(2);
          Musikk.sistRom = -9; for (let i = 0; i < 10; i++) Musikk.velg(.5); ut.tilbake = +Musikk.glid.toFixed(2);
          // drømmen beholder sin musikk (før ble den byttet ut med etasjemusikken etter første bilde)
          startFloor(2, false); rolig(); descend(); const tittel = () => (document.querySelector('.samtale .stittel') || {}).textContent || '';
          for (let i = 0; i < 60 && !tittel().startsWith('Journalen'); i++) await vent(100); Samtale.velg(0); await vent(300);
          for (let i = 0; i < 40 && G.state !== 'play'; i++) { if (G.state === 'panel') closePanel(); await vent(150); }
          ut.drom = !!G.drom; for (let i = 0; i < 80 && Musikk.navn !== 'drom'; i++) await vent(100); await vent(2500); ut.dromMusikk = Musikk.navn; ut.dromBes = Musikk.bNavn; ut.dromNeste = Musikk.neste;
          return ut; }""")
    sjekk('et nytt stykke venter på taktstreken og kommer inn etter broen', ut['venter'] and ut['paaStrek'] and ut['byttet'], [ut['venter'], ut['paaStrek'], ut['byttet']])
    sjekk('besetningen følger rommet', ut.get('besetning') == ut.get('forventet') and ut.get('forventet'), [ut.get('forventet'), ut.get('besetning')])
    sjekk('kamplaget kommer inn på neste slag', ut['kamp'] and ut['niva'] == 1, [ut['kamp'], ut['niva']])
    sjekk('innslag i tonearten, stemte plinger og slaget til stemningslydene', ut['innslag'] == 2 and ut['stemAkkord'] and ut['stemOmfang'] and ut['slag'], [ut['innslag'], ut['stemAkkord'], ut['stemOmfang'], ut['slag']])
    sjekk('musikken glir over i stemning når det er rolig, og kommer tilbake i et nytt rom', ut['ro'] < .5 and ut['stemningK'] > 1.15 and ut['tilbake'] > .9, [ut['ro'], ut['stemningK'], ut['tilbake']])
    sjekk('drømmen beholder drømmemusikken og får vinglass', ut['drom'] and ut['dromMusikk'] in ('drom', 'losje') and ut['dromBes'] == 'drom' and ut['dromNeste'] is None, [ut['drom'], ut['dromMusikk'], ut['dromBes'], ut['dromNeste']])
    sjekk('ingen konsollfeil (iMUSE)', not pg.errs, pg.errs[:6])
    await pg.close()


DELER = {12: del_12, 32: del_32, 33: del_33}
