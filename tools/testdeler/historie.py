"""Hendelsene, drømmene og historien.

Testdeler fra test_ekstra.py. Kjøres med python3 tools/test_ekstra.py --system historie eller --del N.
"""
from .felles import sjekk, ny_side, start_lop


async def del_25(b):
    # 25) hendelsene: to til fire per etasje, ingen fra etasjen over, samtale med valg, minne på tvers av løp og følgene
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg)
    fo = await pg.evaluate("""() => { const G = MORBIDIUM, runder = [];
          for (let k = 0; k < 3; k++) { G.run.hendelser = []; G.run.hendForrige = []; const ut = [];
            for (let d = 1; d <= 6; d++) { startFloor(d, false); rolig(); ut.push(Hendelse.aktive.map(h => h.id)); }
            runder.push({ antall: ut.map(l => l.length), gyldig: ut.every((l, i) => l.every(id => HENDELSER[id].dybder.includes(i + 1))), naboer: ut.every((l, i) => i === 0 || !l.some(id => ut[i - 1].includes(id))), unike: new Set(ut.flat()).size }); }
          return { runder, totalt: Object.keys(HENDELSER).length }; }""")
    sjekk('hver etasje får to til fire hendelser som passer dybden, aldri den samme som i etasjen over', fo['totalt'] >= 18 and all(all(2 <= n <= 4 for n in r['antall']) and r['gyldig'] and r['naboer'] and r['unike'] >= 11 for r in fo['runder']), fo)
    oy = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t));
          startFloor(2, false); rolig(); Hendelse.fjern(); const h = Hendelse.tving('oyet'); if (!h) return null;
          const s = freeSpot(h.x, h.z + 1.2, 2); P.x = s.x; P.z = s.z; R.snapCamera(P.x, P.z); for (let i = 0; i < 100 && !(h.oye.i >= 3 && h.pm.visible); i++) await vent(100); // øyet åpner seg på 0,375 s spilltid, og testnettleseren går sakte
          const aapent = h.oye.i >= 3 && h.pm.visible, it = findInteract(), prompt = it && it.t;
          P.teeth = 0; P.hp = P.maxHp - 25; it.fn(); await vent(80);
          const panel = !!document.querySelector('.samtale'), fire = document.querySelectorAll('[data-sv]').length === 4, bilde = !!document.querySelector('.samtale .sbilde canvas');
          Samtale.velg(0); await vent(50); const sperret = document.querySelector('[data-sv="0"]').disabled; Samtale.velg(0); await vent(50);
          const fortsatt = !!document.querySelector('.samtale') && P.teeth === 0; Samtale.velg(1); await vent(50); closePanel();
          const hp0 = P.hp, m0 = P.morb; Hendelse.start(h); await vent(80); const husker = document.querySelector('.samtale .stekst').innerText.includes('Du igjen');
          Samtale.velg(2); await vent(50); const bedre = P.hp > hp0, brukt = h.brukt; closePanel(); await vent(1600);
          const lagret = (JSON.parse(localStorage.getItem('morbidium_meta_v2')) || {}).hendelser || {};
          return { aapent, prompt, panel, fire, bilde, sperret, fortsatt, bedre, brukt, lukket: h.oye.i < 3, husker, teller: lagret.oyet, igjen: !findInteract() || findInteract().t !== 'Se inn i sprekken' }; }""")
    sjekk('øyet i sprekken åpner seg når du kommer nær, og samtalen har bilde og fire valg', bool(oy) and oy['aapent'] and oy['prompt'] == 'Se inn i sprekken' and oy['panel'] and oy['fire'] and oy['bilde'], oy)
    sjekk('et valg du ikke har råd til er sperret og gjør ingenting', bool(oy) and oy['sperret'] and oy['fortsatt'], oy)
    sjekk('øyet husker deg andre gang, og tellingen lagres', bool(oy) and oy['husker'] and (oy['teller'] or 0) >= 2, oy)
    sjekk('etter en belønning lukker øyet seg og kan ikke brukes igjen', bool(oy) and oy['bedre'] and oy['brukt'] and oy['lukket'] and oy['igjen'], oy)
    tast = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t));
          startFloor(3, false); rolig(); Hendelse.fjern(); const h = Hendelse.tving('kaffe'); P.coffee = false; Hendelse.start(h); await vent(80);
          document.dispatchEvent(new KeyboardEvent('keydown', { key: '1', code: 'Digit1', bubbles: true })); await vent(80);
          const r = { kaffe: P.coffee === true, svar: !!document.querySelector('.samtale') && document.querySelector('.samtale .stekst').innerText.includes('kaffe') }; closePanel(); return r; }""")
    sjekk('tallene på tastaturet velger i samtalen', tast['kaffe'] and tast['svar'], tast)
    rom = await pg.evaluate("""() => { const G = MORBIDIUM, P = G.player; for (let k = 0; k < 6; k++) { startFloor(1, false); Hendelse.fjern(); const h = Hendelse.tving('ku'); if (!h) continue;
            for (const e of G.enemies) if (e.alive) killEntity(e, {}); G.combat = null; G.lock = null; const st = G.rooms[h.sted.rom]; st.cleared = false;
            P.x = h.x; P.z = h.z + 1; const for_ = findInteract(); st.cleared = true; const etter = findInteract();
            return { for: for_ ? for_.t : null, etter: etter ? etter.t : null }; } return null; }""")
    sjekk('en hendelse i et kamprom kan først brukes når rommet er ryddet', bool(rom) and rom['for'] != 'Hils på kua' and rom['etter'] == 'Hils på kua', rom)
    fl = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), ut = {};
          startFloor(1, false); rolig(); Hendelse.fjern(); let h = null; const nyttFro = k => { if (k) G.run.seed = (G.run.seed + 104729) >>> 0; }; // etasjen lages av frøet, så et nytt forsøk trenger et nytt frø
          for (let k = 0; k < 6 && !h; k++) { nyttFro(k); startFloor(1, false); rolig(); Hendelse.fjern(); h = Hendelse.tving('graven'); }
          G.run.sjefSvekk = {}; Hendelse.start(h); await vent(50); Samtale.velg(2); closePanel(); const B = spawnBoss(1, P.x + 4, P.z); ut.sjef = B.hp / B.max;
          h = null; for (const d of [3, 4, 6, 2, 4, 6]) { if (h) break; startFloor(d, false); rolig(); Hendelse.fjern(); h = Hendelse.tving('hjemmebrent'); } if (h) { Hendelse.start(h); await vent(50); Samtale.velg(0); closePanel(); ut.sterk = P.kamferT > 20; await vent(3000); ut.spy = G.puddles.filter(p => p.kind === 'vomit').length; }
          startFloor(2, false); rolig(); Hendelse.fjern(); h = null; for (let k = 0; k < 6 && !h; k++) { nyttFro(k); startFloor(2, false); rolig(); Hendelse.fjern(); h = Hendelse.tving('tannfeen'); }
          if (h) { P.teeth = 20; const m0 = P.maxHp; Hendelse.start(h); await vent(50); Samtale.velg(0); closePanel(); ut.hjerte = P.maxHp - m0; ut.tenner = P.teeth; }
          startFloor(2, false); rolig(); Hendelse.fjern(); h = null; for (let k = 0; k < 6 && !h; k++) { nyttFro(k); startFloor(2, false); rolig(); Hendelse.fjern(); h = Hendelse.tving('dans'); }
          if (h) { P.x = h.x + 1.5; P.z = h.z + 1.5; P.vx = P.vz = 0; Hendelse.start(h); await vent(50); Samtale.velg(0); for (let t = 0; t < 40 && !h.ferdig; t++) { P.vx = P.vz = 0; await vent(500); } ut.dans = h.ferdig === true && h.brukt === true && !h.dukke; ut.dansIgjen = h.data.dans; }
          const gamle = Hendelse.aktive.flatMap(x => x.obj); startFloor(3, false); rolig(); ut.ryddet = gamle.every(o => !o.parent);
          return ut; }""")
    sjekk('graven svekker sjefen, hjemmebrent gir styrke og et spor av spy, tannfeen gir et hjerte og dansen gir noe når du står stille', fl.get('sjef', 1) < .85 and fl.get('sterk') and fl.get('spy', 0) >= 1 and fl.get('hjerte') == 10 and fl.get('tenner') == 5 and fl.get('dans'), fl)
    sjekk('hendelsene ryddes bort når du går til neste etasje', fl.get('ryddet'), fl)
    await pg.screenshot(path='/tmp/e_12hendelser.png')
    sjekk('ingen konsollfeil (hendelser)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_26(b):
    # 26) drømmene: historien fra frøet, fem kapitler, minnene, skyggen, døra, valgene, slutten og pasientmappa
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg)
    tk = await pg.evaluate("""() => { const run = MORBIDIUM.run, gammel = run.historie, fro = run.seed, feil = [], hjem = new Set(), like = []; let n = 0;
          for (let s = 1; s <= 240; s++) { run.historie = null; run.seed = s * 7919; const H = Drom.historie(), S = Drom.ord(H), tekster = []; hjem.add(H.hjem);
            if (s <= 3) { run.historie = null; like.push(JSON.stringify(Drom.historie()) === JSON.stringify(H)); }
            for (const k of [1, 2, 3, 4, 5]) { const K = DROM_KAP[k], v = K.valg(S); tekster.push(K.intro(S), ...K.minner(S).map(m => m.tittel + ' ' + m.tekst), ...K.figurer(S), v.tekst, v.baklengs || '', ...v.valg.map(o => o.tekst + ' ' + o.svar)); }
            for (const k of Object.keys(DROM_SLUTT)) tekster.push(DROM_SLUTT[k].tekst(S)); tekster.push(...S.skyld.jeg(S));
            for (const t of tekster) { n++; if (/undefined|NaN|\$\{|\[object|null/.test(t)) feil.push(s + ': ' + t.slice(0, 90)); } }
          run.historie = gammel; run.seed = fro; return { n, feil: feil.slice(0, 4), antall: feil.length, hjem: hjem.size, like }; }""")
    sjekk('historien trekkes likt fra frøet, og alle tekstene i fem kapitler blir hele setninger', tk['antall'] == 0 and tk['n'] > 5000 and tk['hjem'] == 7 and all(tk['like']), tk)
    dr = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), ut = {};
          startFloor(1, false); rolig(); descend(); await vent(500);
          ut.drom = !!G.drom && G.drom.kap === 1 && G.depth === 2 && !!document.querySelector('.samtale'); ut.fiender = G.enemies.length; closePanel();
          const m0 = Drom.minner[0]; P.x = m0.x; P.z = m0.z + 1.1; const it = findInteract(); ut.prompt = it && it.t; it.fn(); await vent(80); ut.panel = !!document.querySelector('.samtale'); closePanel();
          ut.skygge = Drom.skygge.aktiv && Drom.skygge.doll.root.visible; ut.dorLukket = !Drom.dor.aapen;
          for (const m of Drom.minner.slice(1)) { P.x = m.x; P.z = m.z + 1.1; findInteract().fn(); await vent(60); closePanel(); }
          ut.dorAapen = Drom.dor.aapen; P.x = Drom.dor.x; P.z = Drom.dor.z + .6; const d = findInteract(); ut.dorPrompt = d && d.t; d.fn(); await vent(80);
          ut.valg = document.querySelectorAll('[data-sv]').length; Samtale.velg(1); await vent(60); Samtale.velg(0); await vent(2600);
          ut.vaaken = !G.drom && G.depth === 2 && G.state === 'play' && document.getElementById('toast').textContent.includes(UTGANGER[1].ankomst.slice(0, 10)); ut.husket = G.run.historie.valg[1];
          // skyggen tar deg igjen: du våkner for tidlig med Morbidium i blodet
          startFloor(2, false); rolig(); descend(); await vent(500); closePanel(); const m1 = Drom.minner[0]; P.x = m1.x; P.z = m1.z + 1.1; findInteract().fn(); await vent(60); closePanel();
          const mb = P.morb, s = Drom.skygge; s.x = P.x + .5; s.z = P.z; await vent(2600); ut.tatt = !G.drom && G.depth === 3 && G.run.historie.valg[2] === 'flukt' && P.morb > mb;
          // kapittel 5 etter skogen: det røde rommet, og skyggen snur seg når minnene er funnet
          startFloor(5, false); rolig(); descend(); await vent(500); closePanel(); ut.kap5 = G.drom && G.drom.kap === 5 && G.F.rooms.every(r => r.gulv === 'sikksakk' && r.vegg === 'forheng');
          for (const m of Drom.minner) { P.x = m.x; P.z = m.z + 1.1; findInteract().fn(); await vent(60); closePanel(); }
          ut.snudd = !!Drom.skygge.snudd; Drom.hopp('tilgivelse'); await vent(300); ut.dypet = G.depth === 6 && !G.drom;
          G.run.historie.valg = { 1: 'sannheten', 2: 'gjentakelse', 3: 'gjentakelse', 4: 'sannheten', 5: 'sannheten' }; ut.slutt = Drom.slutt();
          G.run.historie.valg = { 1: 'tilgivelse', 2: 'tilgivelse', 3: 'flukt', 4: 'flukt', 5: 'flukt' }; ut.slutt2 = Drom.slutt();
          G.run.historie.sett = 5; ut.mappe = Drom.mappe(true);
          return ut; }""")
    sjekk('utgangen fører inn i en drøm uten fiender, med tre minner, en skygge som våkner og en dør som åpner seg', dr['drom'] and dr['fiender'] == 0 and (dr['prompt'] or '').startswith('Husk') and dr['panel'] and dr['skygge'] and dr['dorLukket'] and dr['dorAapen'] and dr['dorPrompt'] == 'Gå mot døra', dr)
    sjekk('valget ved døra huskes, og du våkner i neste etasje', dr['valg'] >= 3 and dr['vaaken'] and dr['husket'] == 'sannheten', dr)
    sjekk('skyggen kan ta deg igjen, og da våkner du for tidlig med Morbidium i blodet', dr['tatt'], dr)
    sjekk('kapittel 5 er det røde rommet, og skyggen snur seg', dr['kap5'] and dr['snudd'] and dr['dypet'], dr)
    sjekk('slutten følger valgene (kapittel 5 teller dobbelt), og pasientmappa får historien', dr['slutt'] == 'sannheten' and dr['slutt2'] == 'fornektelse' and dr['mappe'] and 'Fra ' in dr['mappe']['tekst'] and dr['mappe']['tekst'].endswith('.'), dr)
    ep = await pg.evaluate("""async () => { const vent = t => new Promise(r => setTimeout(r, t)); showWin(); for (let i = 0; i < 40 && !document.getElementById('sisteOk'); i++) await vent(100); const siste = document.getElementById('sisteOk'); if (siste) siste.click(); await vent(400); const tekst = (document.querySelector('.samtale .stekst') || {}).innerText || ''; const knapp = document.getElementById('epOk'); if (knapp) knapp.click(); await vent(500); return { siste: !!siste, tekst: tekst.slice(0, 60), brev: !!document.querySelector('.brev') }; }""")
    sjekk('ved utskrivningen kommer siste side og slutten på historien før brevet', ep['siste'] and len(ep['tekst']) > 20 and ep['brev'], ep)
    await pg.screenshot(path='/tmp/e_13drom.png')
    sjekk('ingen konsollfeil (drømmer)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_31(b):
    # 31) Historien: journalsidene før drømmene, forstanderen i Dypet, sjefenes nye replikker, personlige linjer, siste side og brevet
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg, 'eget')
    hi = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), ut = {};
          const tittel = () => (document.querySelector('#panel:not(.hidden) .samtale .stittel') || document.querySelector('.samtale .stittel') || {}).textContent || '', tekst = () => (document.querySelector('.samtale .stekst') || {}).innerText || '';
          const venteTittel = async (s, maks = 40) => { for (let i = 0; i < maks && !tittel().startsWith(s); i++) await vent(100); return tittel(); };
          // side 1 før første drøm: ingen sjef nevnt når ingen er behandlet, og «Les videre» går inn i drømmen.
          // Innleggelsen tilbyr tre tilfeldige oppvåkninger, så testen setter Eget rom (etasje 1), ellers følger kapitlene en annen startetasje.
          G.run.awk = 'eget'; startFloor(1, false); rolig(); G.run.behandlet = []; descend(); ut.side1 = await venteTittel('Journalen, side 1'); ut.tekst1 = tekst();
          ut.knapp = ((document.querySelector('[data-sv]') || {}).innerText || '').split('\\n')[0]; Samtale.velg(0); ut.intro1 = await venteTittel('Kapittel 1');
          // side 2 etter en behandlet sjef: gravskriften, sannheten om huset og forrige valg. Escape går til innledningen.
          closePanel(); Drom.hopp('tilgivelse'); await vent(400); rolig(); G.run.behandlet = [2]; const B2 = sjefFor(2); descend(); ut.side2 = await venteTittel('Journalen, side 2'); ut.tekst2 = tekst();
          ut.epitaf = ut.tekst2.startsWith(SJEF_EPITAF[B2.type]); ut.valgMerk = ut.tekst2.includes('tilgivelse') && ut.tekst2.includes('1887');
          closePanel(); ut.etterEsc = await venteTittel('Kapittel 2', 20); closePanel(); Drom.hopp('sannheten'); await vent(400);
          // kapitlene følger startetasjen, så skylda alltid kommer før sannheten
          const awk = G.run.awk; G.run.awk = 'vaskesjakt'; ut.vask = [3, 4, 5].map(f => Historie.kapittelFor(G.run.historie, f)); G.run.awk = 'eget'; ut.eget = [1, 2, 3, 4, 5].map(f => Historie.kapittelFor(G.run.historie, f)); G.run.awk = awk;
          // alle sidene blir hele setninger, og personen passer til alderen
          const run = G.run, gammel = run.historie, fro = run.seed, alder = run.patient.age, feil = []; let n = 0;
          for (let s = 1; s <= 160; s++) { run.historie = null; run.seed = s * 7919; run.patient.age = alder; const H = Drom.historie(); H.sett = s % 6; H.valg = { 1: 'tilgivelse', 2: 'flukt', 3: 'gjentakelse', 4: 'sannheten' }; run.behandlet = [1, 2, 3, 4, 5];
            for (const kap of [1, 2, 3, 4, 5]) for (const fra of [1, 2, 3, 4, 5]) { const s0 = Historie.side({ kap, fra, H }); n++; if (!s0 || /undefined|NaN|\\$\\{|\\[object|null/.test(s0.tekst + s0.tittel)) feil.push(kap + ': ' + (s0 && s0.tekst.slice(0, 80))); }
            for (const a of [19, 30, 50, 70]) { run.patient.age = a; run.historie = null; const H2 = Drom.historie(); if ((a > 45 && H2.rolle === 'bestefar') || (a > 58 && ['mor', 'far'].includes(H2.rolle)) || (a < 22 && H2.rolle === 'barn')) feil.push('alder ' + a + ' ' + H2.rolle); } }
          run.historie = gammel; run.seed = fro; run.patient.age = alder; run.behandlet = [2]; ut.sider = n; ut.feil = feil.slice(0, 4); ut.antallFeil = feil.length;
          // personlige linjer fra drømmene i høyttaleren og koret, og Olsen følger etasjen
          run.historie.sett = 4; startFloor(3, false); await vent(300); const S = Drom.ord(run.historie), navn = run.patient.name;
          ut.pa = PA[3].filter(l => l.includes(navn)).length; ut.koret = LINES.koret.some(l => l.includes(S.N)); ut.olsen3 = NPC_LINES.vaktmester.some(l => l.includes('Kjelleren var ikke der'));
          startFloor(4, false); await vent(300); ut.paBorte = PA[3].every(l => !l.includes(navn)); ut.olsen4 = NPC_LINES.vaktmester.some(l => l.includes('fjerde nøkkelen')) && !NPC_LINES.vaktmester.some(l => l.includes('Kjelleren var ikke der'));
          // forstanderen i Dypet: fire valg, du kan lese over skulderen, og pennen gjør Journalen svakere
          startFloor(6, false); rolig(); await vent(300); ut.naturlig = Hendelse.aktive.some(h => h.id === 'forstanderen');
          const h = Hendelse.aktive.find(h => h.id === 'forstanderen') || Hendelse.tving('forstanderen'); P.x = h.x; P.z = h.z + 1.2; R.snapCamera(P.x, P.z); await vent(300);
          const it = findInteract(); ut.prompt = it && it.t; it.fn(); ut.forstander = await venteTittel('Forstander'); ut.fvalg = document.querySelectorAll('[data-sv]').length;
          Samtale.velg(1); await vent(150); ut.les = tekst().includes('håndskrift'); Samtale.velg(0); await vent(100);
          Samtale.vis(h.H.samtale(h)); await vent(100); Samtale.velg(2); await vent(150); ut.penn = run.pennen === true && Merknad.har('pennen'); Samtale.velg(0); await vent(100);
          // sjefene: en ny tale ved en tredjedel helse, slengord i kampen og siste ord når de dør
          const B = G.boss || spawnBoss(6, P.x + 3, P.z); ut.pennSvak = B.hp <= B.max * .81; B.t = 0; B.state = 'chase'; await vent(100);
          B.hp = B.max * .6; bossOnHurt(B, 1); ut.tale1 = B.mono === (LINES.monolog[B.type] || LINES.monolog[6]);
          B.monoT = 0; B.phase = 'fight'; B.state = 'chase'; B.hp = B.max * .3; bossOnHurt(B, 1); ut.tale2 = B.phasesDone === 2 && B.mono === LINES.monolog2[B.type];
          const bobler = () => [...document.querySelectorAll('#fx .bubble')].map(e => e.textContent);
          ut.tale2boble = bobler().includes(LINES.monolog2[B.type][0]);
          B.state = 'chase'; B.phase = 'fight'; B.cd = 99; B.slengT = .01; for (let i = 0; i < 30 && !bobler().some(t => LINES.boss[B.type].includes(t)); i++) { B.state = 'chase'; B.cd = 99; await vent(100); }
          ut.sleng = bobler().some(t => LINES.boss[B.type].includes(t));
          hurt(B, 1e7, { from: 'player' }); for (let i = 0; i < 10 && !bobler().includes(LINES.bossDod[B.type]); i++) await vent(100); ut.sisteOrd = bobler().includes(LINES.bossDod[B.type]); ut.behandlet = run.behandlet.includes(6);
          await vent(2000);
          // slutten: siste side, Escape går videre til etterordet, og gjentakelse gir et innkallingsbrev signert av pasienten
          if (G.state === 'panel') closePanel(); run.historie.sett = 5; run.historie.valg = { 1: 'gjentakelse', 2: 'gjentakelse', 3: 'sannheten', 4: 'gjentakelse', 5: 'gjentakelse' };
          showWin(); for (let i = 0; i < 40 && !document.getElementById('sisteOk'); i++) await vent(100); ut.siste = tittel() === 'Siste side' && tekst().includes('side én');
          closePanel(); await vent(200); ut.etterord = tittel() === DROM_SLUTT.gjentakelse.navn; const k = document.getElementById('epOk'); if (k) k.click(); await vent(400);
          ut.brev = (document.querySelector('.brev h2') || {}).textContent; ut.sign = (document.querySelector('.bsign') || {}).textContent === navn; ut.stempel = (document.querySelector('.bstempel') || {}).textContent;
          ut.brevTekst = [...document.querySelectorAll('.brev p')].map(e => e.textContent).join(' ');
          return ut; }""")
    sjekk('en journalside før drømmen, uten sjef når ingen er behandlet, og «Les videre» går inn i drømmen', hi['side1'] == 'Journalen, side 1' and 'behandlet' not in hi['tekst1'] and hi['knapp'].endswith('Les videre') and hi['intro1'].startswith('Kapittel 1'), {k: hi[k] for k in ('side1', 'knapp', 'intro1')})
    sjekk('side 2 nevner sjefen som ble behandlet, grunnleggelsen og forrige valg, og Escape går til drømmen', hi['side2'] == 'Journalen, side 2' and hi['epitaf'] and hi['valgMerk'] and hi['etterEsc'].startswith('Kapittel 2'), {k: hi[k] for k in ('side2', 'epitaf', 'valgMerk', 'etterEsc')})
    sjekk('kapitlene følger startetasjen (1 4 5 fra vaskesjakten), og tusenvis av journalsider blir hele setninger', hi['vask'] == [1, 4, 5] and hi['eget'] == [1, 2, 3, 4, 5] and hi['sider'] >= 4000 and hi['antallFeil'] == 0, {k: hi[k] for k in ('vask', 'eget', 'sider', 'feil')})
    sjekk('høyttaleren og koret får linjer fra drømmene, og Olsen og personalet følger etasjen', hi['pa'] >= 2 and hi['koret'] and hi['olsen3'] and hi['paBorte'] and hi['olsen4'], {k: hi[k] for k in ('pa', 'koret', 'olsen3', 'paBorte', 'olsen4')})
    sjekk('forstanderen sitter i Dypet med fire valg, du kan lese over skulderen, og pennen svekker Journalen', hi['prompt'] and hi['forstander'].startswith('Forstander') and hi['fvalg'] == 4 and hi['les'] and hi['penn'] and hi['pennSvak'], {k: hi[k] for k in ('naturlig', 'prompt', 'forstander', 'fvalg', 'les', 'penn', 'pennSvak')})
    sjekk('sjefen holder en ny tale ved en tredjedel helse, slenger ord i kampen og får siste ord', hi['tale1'] and hi['tale2'] and hi['tale2boble'] and hi['sleng'] and hi['sisteOrd'] and hi['behandlet'], {k: hi[k] for k in ('tale1', 'tale2', 'tale2boble', 'sleng', 'sisteOrd', 'behandlet')})
    sjekk('siste side før etterordet, Escape går videre, og gjentakelse gir innkallingsbrev signert av pasienten', hi['siste'] and hi['etterord'] and hi['brev'] == 'Innkallingsbrev' and hi['sign'] and hi['stempel'] == 'INNKALT' and 'samme dag' in hi['brevTekst'] and 'forstanderens penn' in hi['brevTekst'], {k: hi[k] for k in ('siste', 'etterord', 'brev', 'sign', 'stempel')})
    hk = await pg.evaluate("""async () => { const vent = t => new Promise(r => setTimeout(r, t)); document.getElementById('bOk').click(); await vent(500);
          return { kort: (document.querySelector('.dcard .cause') || {}).textContent, stempel: (document.querySelector('.dcard .stamp') || {}).textContent, lore: LORE[LORE.length - 1].t, oye: ['krok', 'rust', 'arkivar', 'klumpen', 'hekk', 'hjort', 'journalen'].every(t => OYE_SER[t] && LINES.monolog2[t] && LINES.bossDod[t]), merk: ['klumpen', 'hekk', 'hjort', 'pennen'].every(k => MERKNADER[k]) }; }""")
    sjekk('dødskortet følger slutten, og fragmentene, øyet, talene og merknadene dekker alle sjefene', hk['kort'].startswith('Pasienten er innkalt') and hk['stempel'] == 'INNKALT' and hk['lore'] == 'Hele historien' and hk['oye'] and hk['merk'], hk)
    await pg.screenshot(path='/tmp/e_18historie.png')
    sjekk('ingen konsollfeil (historie)', not pg.errs, pg.errs[:6])
    await pg.close()
    # Avdeling Null og Venterommet: den lille legen, instrumentskrinet med kjettingene, og forstanderen som løses fra krokene
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg, 'eget')
    ny = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), ut = {};
          const spill = async (t, maks = 30000) => { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < t && performance.now() - t0 < maks) await vent(50); };
          const tekst = () => (document.querySelector('#panel:not(.hidden) .samtale .stekst') || {}).innerText || '';
          let h = null; for (const d of [4, 3, 2, 6, 4, 3]) { startFloor(d, false); rolig(); Hendelse.fjern(); h = Hendelse.tving('venterom'); if (h) break; }
          ut.venterom = !!h;
          if (h) { const s = freeSpot(h.x, h.z + 1.3, 2); P.x = s.x; P.z = s.z; R.snapCamera(P.x, P.z); await vent(300); const it = findInteract(); ut.vPrompt = it && it.t; it.fn(); await vent(150);
            ut.bak = ((document.querySelector('.samtale .baklengs') || {}).textContent || '').includes('neffaK'); ut.vValg = document.querySelectorAll('[data-sv]').length;
            Samtale.velg(2); await vent(150); ut.drommer = tekst().includes('Den som ligger under'); closePanel(); await vent(100); ut.vBorte = !!h.ferdig; }
          // instrumentskrinet: kjettingene kommer når panelet er lukket, treffer pasienten og etterlater en gave
          h = null; for (const d of [3, 4, 2, 6]) { startFloor(d, false); rolig(); Hendelse.fjern(); h = Hendelse.tving('skrin'); if (h) break; }
          ut.skrin = !!h;
          if (h) { P.hp = P.maxHp = 300; const s = freeSpot(h.x, h.z + 1.2, 2); P.x = s.x; P.z = s.z; R.snapCamera(P.x, P.z); await vent(300); findInteract().fn(); await vent(150);
            Samtale.velg(0); await vent(150); const hp0 = P.hp, n0 = G.run.items.length; ut.forLukk = Kjeder.liste.length === 0; closePanel();
            for (let i = 0; i < 200 && !Kjeder.liste.some(K => K.truffet); i++) await vent(50); ut.kjeder = Kjeder.liste.length;
            await spill(2.2); ut.skade = P.hp < hp0 && P.lastCause === 'kroker'; ut.gave = G.run.items.length > n0; ut.kjederBorte = Kjeder.liste.length === 0; }
          // forstanderen: løs ham fra krokene, og kjettingene henter ham ned
          startFloor(6, false); rolig(); await vent(300); h = Hendelse.aktive.find(x => x.id === 'forstanderen') || Hendelse.tving('forstanderen');
          P.x = h.x; P.z = h.z + 1.2; R.snapCamera(P.x, P.z); await vent(300); findInteract().fn(); await vent(150); Samtale.velg(3); await vent(150); ut.losTekst = tekst().includes('første kroken'); closePanel();
          await spill(2.4); ut.losBorte = !!h.ferdig && G.run.forstanderLos === true && Merknad.har('loslatt') && Kjeder.liste.length === 0;
          const B = spawnBoss(6, P.x + 3, P.z); ut.sterkere = B.max > sjefFor(6).hp * 1.19; killEntity(B, {}); await vent(200);
          ut.sign = Historie.brev().sign; Drom.historie(); G.run.historie.sett = 5; G.run.historie.valg = { 5: 'tilgivelse' }; ut.tomStol = Historie.siste(G.run.historie).tekst.includes('tom stol');
          // en ny etasje rydder bort kjettinger som henger igjen
          Kjeder.rundt({ x: P.x, y: 1, z: P.z }, 3, { hold: 5 }); startFloor(5, false); ut.rydda = Kjeder.liste.length === 0;
          return ut; }""")
    sjekk('Venterommet bak forhenget: den lille legen snakker baklengs, har fire valg og forteller hvem som drømmer', ny['venterom'] and ny['vPrompt'] == 'Gå gjennom forhenget' and ny['bak'] and ny['vValg'] == 4 and ny['drommer'] and ny['vBorte'], ny)
    sjekk('instrumentskrinet: kjettingene kommer først når panelet er lukket, treffer pasienten og etterlater en gave', ny['skrin'] and ny['forLukk'] and ny['kjeder'] >= 3 and ny['skade'] and ny['gave'] and ny['kjederBorte'], ny)
    sjekk('forstanderen kan løses fra krokene: kjettingene henter ham, Journalen blir sterkere, og siste side får en tom stol', ny['losTekst'] and ny['losBorte'] and ny['sterkere'] and ny['sign'] == 'M. Morbeck, tidligere forstander' and ny['tomStol'] and ny['rydda'], ny)
    await pg.screenshot(path='/tmp/e_19avdeling_null.png')
    sjekk('ingen konsollfeil (Avdeling Null og Venterommet)', not pg.errs, pg.errs[:6])
    await pg.close()


DELER = {25: del_25, 26: del_26, 31: del_31}
