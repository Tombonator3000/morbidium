"""Grafikken: effekter og shadere, dybde, skygger og vær, lyspuljen, dioramaet, teksturene, vinteren, snøen og kameraprøven.

Testdeler fra test_ekstra.py. Kjøres med python3 tools/test_ekstra.py --system grafikk eller --del N.
"""
import pathlib, sys
from .felles import sjekk, ny_side, start_lop, klikk, URL, URL3D


async def del_28(b):
    # 28) Effekter og shadere: sjokkbølger, zoom, negativ og lyn i etterbehandlingen, glød fra ting, lynet, teslaspolen, regnringer og drømmesløret
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg)
    ef = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), spill = async t => { Klokke.spol(t); }, u = R.post.uniforms, ut = {};
          rolig(); P.hp = P.maxHp = 9999;
          // etterbehandlingen: alt slår inn neste bilde og dør ut av seg selv
          R.sjokk(P.x, P.z, 1.2); R.zoomStot(P.x, P.z, .8); R.negativ(.1); R.fx.lyn = 1; await vent(120);
          ut.paa = u.uSjokk.value[0].w > .1 && u.uZoom.value.z > .1 && u.uNeg.value > .5 && u.uLyn.value > .1;
          const avNaa = () => u.uSjokk.value[0].w === 0 && u.uZoom.value.z === 0 && u.uNeg.value === 0 && u.uLyn.value === 0 && R.sjokkL.length === 0, ge = G.time; for (let i = 0; i < 150 && !avNaa() && G.time - ge < 4; i++) await vent(100); ut.av = avNaa();
          // uten forvrengning og uten glimt blir de borte
          R.distortOn = false; R.flashOn = false; R.sjokk(P.x, P.z, 1); R.zoomStot(P.x, P.z, 1); R.negativ(); R.fx.lyn = 1; await vent(120);
          ut.skaansom = u.uSjokk.value[0].w === 0 && u.uZoom.value.z === 0 && u.uNeg.value === 0 && u.uLyn.value === 0; R.distortOn = true; R.flashOn = true; await vent(900);
          // glød: alle typene lages, og tingene med ild, damp eller lys får sine når etasjen bygges
          ut.typer = Object.keys(GLOD_TYPER).filter(t => { const E = Glod.lag(P.x, .3, P.z, t, { liv: 1 }); return E && E.pts.parent; }); ut.antall = Object.keys(GLOD_TYPER).length;
          const sett = new Set(); let kilder = 0, dekket = 0;
          for (let d = 1; d <= 6; d++) { startFloor(d, false); await vent(80); for (const E of Glod.liste) sett.add(E.type); for (const o of G.props) if (['baal', 'vedovn', 'kjele', 'komfyr', 'gryte', 'candles', 'kjempeplante', 'lyktestolpe'].includes(o.kind) && !o.skjult) { kilder++; /* ting i det skjulte rommet gløder først etter innbruddet */ if (Glod.liste.some(E => E.eier === o)) dekket++; } ut['glod' + d] = Glod.liste.every(E => !E.eier || G.props.includes(E.eier) || G.puddles.includes(E.eier)); }
          ut.sett = [...sett]; ut.kilder = kilder; ut.dekket = dekket;
          // addPuddle slår sammen med en lilla pytt i nærheten og beholder den lengste levetiden, så testpytten får kort liv selv,
          // og vi venter til både pytten og gløden er borte (høyst 8 s spilltid), i stedet for en fast ventetid
          const p = addPuddle(P.x, P.z, 'morb', 1, 3); ut.morbPytt = !!(p && p.glod && p.glod.pts); if (p) p.life = Math.min(p.life, 3);
          { const gm0 = G.time, rt0 = performance.now(); while (p && (G.puddles.includes(p) || Glod.liste.includes(p.glod)) && G.time - gm0 < 8 && performance.now() - rt0 < 120000) await vent(50);
            ut.morbBorte = !!p && !G.puddles.includes(p) && !Glod.liste.includes(p.glod); if (!ut.morbBorte) ut.morbInfo = { spilltid: +(G.time - gm0).toFixed(2), liv: p && +p.life.toFixed(2), iPytter: !!p && G.puddles.includes(p), iGlod: !!p && Glod.liste.includes(p.glod), state: G.state }; }
          R.safe = true; ut.enkel = Glod.lag(P.x, 0, P.z, 'gnister') === null && Lyn.slag(0, 0, 0, 1, 0, 1) === null; R.safe = false;
          // lynet: varsel på bakken, så nedslag som treffer fienden der, og deg om du står der
          startFloor(1, false); rolig(); P.hp = P.maxHp = 9999; const r = G.F.rooms.find(r => r.role === 'combat') || G.F.rooms[0]; P.x = r.x + r.w / 2; P.z = r.z + r.h / 2;
          const s1 = freeSpot(P.x + 3, P.z, 3), e = spawnEnemy('pleier', s1.x, s1.z, false, 1); e.hp = e.max = 500; e.stun = 99; e.mArmor = 1; // av og til blir den en pansret mester (Oppskrift.mester) og tar da 34 og ikke 45
          let lyn = 0; const _sl = Lyn.slag; Lyn.slag = function () { lyn++; return _sl.apply(this, arguments); };
          const hp0 = P.hp; Uvaer.varsel(e.x, e.z); Uvaer.varsel(P.x, P.z); await spill(1.3);
          ut.lyn = lyn >= 2 && e.hp <= 455 && P.hp < hp0 - 5 && G.fxl.some(f => f.max === 20); ut.lynInfo = [lyn, Math.round(e.hp), Math.round(hp0 - P.hp), G.fxl.length];
          // teslaspolen slår mot fienden som står nær
          const spole = { kind: 'spole', x: e.x + 1.5, z: e.z, g: { position: { z: e.z + .2 } }, alive: true, buT: 0 }; G.props.push(spole); const h1 = e.hp; Effekter.spoler(.1); G.props.splice(G.props.indexOf(spole), 1);
          ut.spole = e.hp < h1 && lyn >= 3; Lyn.slag = _sl;
          // regnringer der det regner, og bort igjen
          const v0 = G.F.vaer; G.F.vaer = 'regn'; Vaer.start(G.F); ut.regn = !!(Regnringer.obj && Regnringer.obj.parent); Vaer.stopp(); ut.regnBorte = !Regnringer.obj; G.F.vaer = v0; Vaer.start(G.F);
          // drømmesløret: glir inn i drømmen og ut igjen etterpå
          G.drom = G.drom || null; descend(); for (let i = 0; i < 80 && !G.drom; i++) await vent(100); for (let i = 0; i < 80 && R.fx.drom <= .6; i++) await vent(100); await vent(200); ut.drom = R.fx.drom > .6 && u.uDrom.value > .5; ut.dromInfo = [!!G.drom, G.state, +R.fx.drom.toFixed(2)];
          Drom.hopp(); for (let i = 0; i < 80 && G.drom; i++) await vent(100); for (let i = 0; i < 80 && R.fx.drom >= .2; i++) await vent(100); ut.dromUt = R.fx.drom < .2;
          return ut; }""")
    sjekk('sjokkbølge, zoomslag, negativ og lynblink slår inn i etterbehandlingen og dør ut av seg selv', ef['paa'] and ef['av'], ef)
    sjekk('uten forvrengning og hvite glimt blir sjokkbølger, zoom, negativ og lynblink borte', ef['skaansom'], ef)
    sjekk('alle typene glød (gnister, glør, damp, røyk, sporer, Morbidium, møll, kombo og de som kommer til) lages på skjermkortet', len(ef['typer']) == ef['antall'] >= 8, ef['typer'])
    sjekk('bål, ovner, kjeler, gryter, stearinlys, kjempeplanter og lyktestolper gløder og ryker, og gløden følger etasjen', ef['kilder'] > 0 and ef['dekket'] == ef['kilder'] and all(ef['glod%d' % d] for d in range(1, 7)), ef)
    sjekk('Morbidium stiger fra lilla pytter og forsvinner med pytten, og enkel grafikk lager ingen glød eller lyn', ef['morbPytt'] and ef['morbBorte'] and ef['enkel'], ef)
    sjekk('lynet varsler på bakken, slår ned og treffer fienden og pasienten som står der, og svir gulvet', ef['lyn'], ef)
    sjekk('teslaspolen slår en bue mot fienden som står nær', ef['spole'], ef)
    sjekk('regnringer på bakken når det regner, og de forsvinner med regnet', ef['regn'] and ef['regnBorte'], ef)
    sjekk('drømmesløret glir inn i drømmen og ut igjen etterpå', ef['drom'] and ef['dromUt'], ef)
    await pg.screenshot(path='/tmp/e_15fx.png')
    sjekk('ingen konsollfeil (effekter og shadere)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_30(b):
    # 30) Dybde: lykteskygger, kontaktskygger, varmeflimmer, speiling i vannet, lysende tåke, takstøv og kameradykk
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg)
    dy = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), spill = async t => { Klokke.spol(t); }, u = R.post.uniforms, ut = {};
          startFloor(2, false); rolig(); P.hp = P.maxHp = 9999; const r = G.F.rooms.find(r => r.role === 'combat' && !r.ute && r.w >= 8) || G.F.rooms[0]; P.x = r.x + r.w / 2; P.z = r.z + r.h / 2; R.snapCamera(P.x, P.z);
          // kontaktskyggene males med etasjen og byttes ut ved neste
          const ao1 = Dybde.ao; ut.ao = !!(ao1 && ao1.m.parent === R.level);
          // lykteskygger: fiendene nær lykta kaster skygge bort fra pasienten
          const fl = [[2, 0], [-1.5, 1.2], [0, -2]].map(([dx, dz]) => { const s = freeSpot(P.x + dx, P.z + dz, 2), e = spawnEnemy('pleier', s.x, s.z, false, 2); e.stun = 99; e.hp = e.max = 1e6; e.state = 'chase'; return e; });
          await vent(900); const retning = fl.every(e => { const m = Dybde.skygger.get(e); if (!m) return false; const d = Math.hypot(e.x - P.x, e.z - P.z), ux = (e.x - P.x) / d, uz = (e.z - P.z) / d, a = Math.atan2(-ux, -uz); return Math.abs(Math.atan2(Math.sin(m.rotation.z - a), Math.cos(m.rotation.z - a))) < .05 && m.material.opacity > .05; });
          ut.skygger = retning; for (const e of fl) killEntity(e, {}); await vent(300); ut.skyggerBorte = fl.every(e => !Dybde.skygger.has(e));
          R.lightsOn = false; const s2 = freeSpot(P.x + 1.5, P.z, 2), e2 = spawnEnemy('pleier', s2.x, s2.z, false, 2); e2.stun = 99; e2.state = 'chase'; await vent(400); ut.utenLys = Dybde.skygger.size === 0; R.lightsOn = true; killEntity(e2, {});
          // varmeflimmer over et bål, bare med forvrengning på
          const baal = { kind: 'baal', x: P.x + 2, z: P.z - 1, alive: true, g: { position: { z: P.z - .8 } } }; G.props.push(baal); await vent(250);
          ut.varme = (R.varmeL || []).some(h => Math.abs(h.x - baal.x) < .01) && u.uVarme.value.some(v => v.w > 0);
          R.distortOn = false; await vent(250); ut.varmeAv = u.uVarme.value.every(v => v.w === 0); R.distortOn = true; G.props.splice(G.props.indexOf(baal), 1);
          // vannet speiler lykta, og tåka lyser opp rundt lampene i 3D
          addPuddle(P.x + .8, P.z, 'wet', 1.2, 60); await vent(500); ut.speil = R.water.u.uLysF.value.some(v => v.x + v.y + v.z > 0);
          ut.taake = !D3.on || !D3.q.taake || (!!D3.taakeLys && D3.taakeLys.f.value.some(v => v.x + v.y + v.z > 0));
          // takstøv inne når det smeller, og det lander og blir borte
          Dybde.stovT = 0; R.shake(.8); ut.stov = Dybde.stov.length > 0; await spill(3.2); ut.stovBorte = Dybde.stov.length === 0;
          // kameradykk når sjefen kommer, og ikke uten skjermristing
          spawnBoss(G.depth, P.x + 3, P.z - 2); await vent(900); ut.dykk = R.camera.zoom > 1.04 && R.kam.holdT > 0;
          if (G.boss) killEntity(G.boss, {}); R.kam.hold = R.kam.kick = R.kam.holdT = 0; await vent(900); R.shakeOn = false; R.kamZoom(.2, 2); await vent(500); ut.dykkAv = Math.abs(R.camera.zoom - 1) < .01; R.shakeOn = true; R.kam.hold = R.kam.holdT = 0;
          // enkel grafikk: ingen kontaktskygger eller lykteskygger
          R.safe = true; startFloor(1, false); await vent(300); ut.enkel = !Dybde.ao && Dybde.skygger.size === 0; R.safe = false; startFloor(2, false); await vent(300); ut.aoIgjen = !!Dybde.ao && Dybde.ao !== ao1 && ao1.m.parent !== R.level && Dybde.ao.m.parent === R.level;
          return ut; }""")
    sjekk('kontaktskyggene males med etasjen, og fiendene nær lykta kaster skygge bort fra pasienten', dy['ao'] and dy['skygger'] and dy['skyggerBorte'], dy)
    sjekk('uten lys og skygge blir lykteskyggene borte, og enkel grafikk lager ingen skygger', dy['utenLys'] and dy['enkel'] and dy['aoIgjen'], dy)
    sjekk('varmeflimmer over bålet, og ikke uten forvrengning', dy['varme'] and dy['varmeAv'], dy)
    sjekk('vannet speiler lykta, og tåka lyser opp rundt lampene', dy['speil'] and dy['taake'], dy)
    sjekk('takstøv drysser ned når det smeller, og blir borte når det har landet', dy['stov'] and dy['stovBorte'], dy)
    sjekk('kameraet dykker inn når sjefen kommer, men ikke uten skjermristing', dy['dykk'] and dy['dykkAv'], dy)
    await pg.screenshot(path='/tmp/e_17dybde.png')
    sjekk('ingen konsollfeil (dybde)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_37(b):
    # 37) Skygger og vær
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg)
    # været: bare regn, snø og ildfluer lager partikler og lyd. Klarvær, tåke og etasjer uten vær får ingenting (vakta lå i en kommentar
    # og ga 60 hvite prikker og vindsus overalt), men Vaer.F følger etasjen likevel, så ute() svarer for riktig etasje
    va = await pg.evaluate("""async () => { const G = MORBIDIUM, vent = t => new Promise(r => setTimeout(r, t)), ut = { etasjer: {} }, aktiv = v => v === 'regn' || v === 'sno' || v === 'ildfluer';
          const bygg = async d => { startFloor(d, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } rolig(); const g0 = G.time; for (let i = 0; i < 100 && G.time - g0 < .1; i++) await vent(50); };
          const tilstand = () => ({ vaer: G.F.vaer, obj: !!Vaer.obj, type: Vaer.type, F: Vaer.F === G.F, lyd: Sound.vaerType || null });
          for (let d = 1; d <= 6; d++) { await bygg(d); const s = tilstand(); s.ok = s.F && (aktiv(s.vaer) ? s.obj && s.type === s.vaer && s.lyd === (s.vaer === 'regn' ? 'regn' : 'vind') : !s.obj && s.type === null && s.lyd === null); ut.etasjer[d] = s; }
          const F = G.F, v0 = F.vaer; ut.stille = {};
          for (const v of [null, 'klart', 'taake']) { F.vaer = v; Vaer.start(F); ut.stille[v] = Vaer.obj === null && Vaer.type === null && Vaer.F === F && !Sound.vaerType && !Regnringer.obj; }
          F.vaer = 'regn'; Vaer.start(F); ut.regn = !!(Vaer.obj && Vaer.obj.isLineSegments && Vaer.obj.parent === R.scene && Vaer.type === 'regn' && Sound.vaerType === 'regn');
          F.vaer = 'sno'; Vaer.start(F); ut.sno = !!(Vaer.obj && Vaer.obj.isPoints && Vaer.type === 'sno' && Sound.vaerType === 'vind');
          R.lowTex = true; F.vaer = 'regn'; Vaer.start(F); ut.lowTex = Vaer.obj === null && Vaer.type === null && Vaer.F === F && !Sound.vaerType; R.lowTex = false;
          // fra regn i en inneetasje til klarvær i parken: ute() skal svare for parken, ikke for etasjen før
          F.vaer = 'regn'; Vaer.start(F); const F6 = F; await bygg(1); const F1 = G.F, v1 = F1.vaer;
          Vaer.start(F6); F1.vaer = 'klart'; Vaer.start(F1); let feil = 0, rom = 0, pav = 0;
          for (let z = 0; z < F1.H; z++) for (let x = 0; x < F1.W; x++) { const i = z * F1.W + x, rid = F1.tiles[i] ? F1.roomId[i] : -1, venter = rid >= 0 ? !!F1.rooms[rid].ute : true; if (rid >= 0) { if (venter) rom++; else pav++; } if (Vaer.ute(x + .5, z + .5) !== venter) feil++; }
          ut.parken = { F: Vaer.F === F1, obj: Vaer.obj, utenfor: Vaer.ute(-5, -5), feil, rom, pav };
          F1.vaer = v1; F6.vaer = v0; Vaer.start(F1); ut.tilbake = Vaer.F === F1 && !!Vaer.obj === aktiv(v1);
          return ut; }""")
    sjekk('været lager partikler og lyd bare ved regn, snø og ildfluer, og følger etasjen i alle seks', all(va['etasjer'][str(d)]['ok'] for d in range(1, 7)), va['etasjer'])
    sjekk('klarvær, tåke og etasjer uten vær gir ingen prikker, ingen vind og ingen regnringer', all(va['stille'].values()) and va['lowTex'], va)
    sjekk('regn er streker og snø er prikker, med lyden som hører til', va['regn'] and va['sno'], va)
    pk = va['parken']
    sjekk('etter regn i etasjen før svarer været riktig for parken i klarvær', pk['F'] and pk['obj'] is None and pk['utenfor'] is True and pk['feil'] == 0 and pk['rom'] > 0 and va['tilbake'], pk)
    sjekk('ingen konsollfeil (skygger og vær)', not pg.errs, pg.errs[:6])
    await pg.close()

    # lykteskygger: i samme bilde som figurene, ikke gjennom vegger, kortere mot en vegg bak og myke nær lykta (at de er borte like etter et drap, sjekker del 30)
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg)
    ly = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), spill = async (t, maks = 20000) => { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < t && performance.now() - t0 < maks) await vent(50); }, ut = {};
          // vegg mellom to punkter, målt for seg: tette prøver langs linja, og bare veggruter teller (ikke møbler)
          const vegg = (ax, az, bx, bz) => { const F = G.F; for (let i = 0; i <= 120; i++) { const t = i / 120, x = Math.floor(ax + (bx - ax) * t), z = Math.floor(az + (bz - az) * t); if (x < 0 || z < 0 || x >= F.W || z >= F.H || !F.tiles[z * F.W + x]) return true; } return false; };
          const fri = (x, z) => [[0, 0], [.45, 0], [-.45, 0], [0, .45], [0, -.45]].every(([a, c]) => !solid(Math.floor(x + a), Math.floor(z + c)));
          const rom = (x, z) => { const i = Math.floor(z) * G.F.W + Math.floor(x); return G.F.tiles[i] ? G.F.roomId[i] : -1; };
          const hoy = o => o.alive && o.g && o.g.parent && o.m && !o.g.userData.flat && o.m.userData && o.m.userData.P && o.m.userData.P.h >= 1.1;
          const fiende = (x, z) => { const e = spawnEnemy('pleier', x, z, false, 2); e.stun = 99; e.hp = e.max = 1e6; e.state = 'chase'; return e; };
          const plass = (x, z) => { P.x = x; P.z = z; P.vx = P.vz = P.kvx = P.kvz = 0; R.snapCamera(P.x, P.z); };
          const RR = () => Math.max(2.5, P.lantern.scale.x * .5 * 1.15);
          // et sted i et rom med en høy ting like ved og en fri rute bak en vegg innen tre ruter
          let S = null;
          for (const d of [2, 3, 4, 6, 1, 5]) {
            startFloor(d, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } rolig(); P.hp = P.maxHp = 9999; P.invuln = 999;
            const F = G.F, maks = Math.min(2.9, RR() - .4);
            for (const o of G.props.filter(hoy)) { const oz = o.g.position.z - .15;
              for (let k = 0; k < 24 && !S; k++) { const a = k / 24 * Math.PI * 2, r = 1.3 + (k % 3) * .4, px = o.x + Math.cos(a) * r, pz = oz + Math.sin(a) * r; if (!fri(px, pz) || rom(px, pz) !== o.room || vegg(px, pz, o.x, oz)) continue;
                for (let dz = -3; dz <= 3 && !S; dz++) for (let dx = -3; dx <= 3 && !S; dx++) { const ex = Math.floor(px) + dx + .5, ez = Math.floor(pz) + dz + .5, dd = Math.hypot(ex - px, ez - pz); if (dd > maks || dd < 1.2 || !fri(ex, ez) || !vegg(px, pz, ex, ez)) continue; S = { d, o, px, pz, ex, ez }; } }
              if (S) break; }
            if (S) break; }
          ut.funnet = !!S; if (!S) return ut;
          plass(S.px, S.pz); const e1 = fiende(S.ex, S.ez); await spill(.8);
          ut.vegg = { etasje: S.d, bak: vegg(P.x, P.z, e1.x, e1.z), avstand: +Math.hypot(e1.x - P.x, e1.z - P.z).toFixed(2), rr: +RR().toFixed(2), fiende: Dybde.skygger.has(e1), ting: Dybde.skygger.has(S.o) && Dybde.skygger.get(S.o).material.opacity > .05 };
          killEntity(e1, {}); await spill(.8);
          // en fiende rett foran en vegg, med lykta bak seg: skyggen stopper ved veggen i stedet for å gå gjennom den
          let V = null; const F = G.F;
          for (let z = 1; z < F.H - 3 && !V; z++) for (let x = 1; x < F.W - 1 && !V; x++) { const i = z * F.W + x; if (!F.tiles[i] || F.tiles[i - F.W] || !fri(x + .5, z + .5) || !fri(x + .5, z + 2.1) || vegg(x + .5, z + .5, x + .5, z + 2.1) || rom(x + .5, z + .5) < 0) continue; V = { x: x + .5, z: z + .5 }; }
          ut.veggFunnet = !!V; if (!V) return ut;
          plass(V.x, V.z + 1.6); const e = fiende(V.x, V.z); await spill(.8);
          { const m = Dybde.skygger.get(e), d = Math.hypot(e.x - P.x, e.z - P.z), ux = (e.x - P.x) / d, uz = (e.z - P.z) / d, L = .8 + d * 1.15, l = m ? m.scale.y : 0;
            ut.kort = { finnes: !!m, lengde: +l.toFixed(3), full: +L.toFixed(3), forbi: vegg(e.x, e.z, e.x + ux * L, e.z + uz * L), inni: vegg(e.x, e.z, e.x + ux * l * .97, e.z + uz * l * .97) }; }
          // samme bilde: platen står der fienden står når bildet tegnes, også mens den dyttes fram og tilbake
          { const r0 = R.render, L = { n: 0, flytt: 0, maks: 0 }; let x0 = e.x, z0 = e.z, f = 0;
            R.render = function (dt) { const m = Dybde.skygger.get(e); if (m) { L.n++; if (Math.hypot(e.x - x0, e.z - z0) > 1e-3) { L.flytt++; L.maks = Math.max(L.maks, Math.abs(m.position.x - e.x), Math.abs(m.position.z - e.z)); } } x0 = e.x; z0 = e.z; e.kvx = ++f % 12 < 6 ? 3 : -3; return r0.call(this, dt); };
            await spill(1.2); R.render = r0; e.kvx = e.kvz = 0; ut.sammeBilde = L; }
          await spill(.4);
          // nær lykta blekner skyggen jevnt bort i stedet for å klippes ved 0,35
          { const d0 = Math.hypot(e.x - P.x, e.z - P.z), ux = (e.x - P.x) / d0, uz = (e.z - P.z) / d0, ex0 = e.x, ez0 = e.z; ut.naer = [];
            for (const d of [.8, .55, .4, .3, .22]) { e.x = P.x + ux * d; e.z = P.z + uz * d; Dybde.lykt(0); const m = Dybde.skygger.get(e); ut.naer.push(m ? +m.material.opacity.toFixed(4) : -1); }
            e.x = ex0; e.z = ez0; Dybde.lykt(0);
            // gjennomsiktige og halvt oppløste figurer kaster svakere skygge
            const m = Dybde.skygger.get(e), o0 = m.material.opacity; e.doll.U.uAlpha.value = .3; Dybde.lykt(0); const o1 = m.material.opacity; e.doll.U.uAlpha.value = 1; e.doll.U.uDissolve.value = .5; Dybde.lykt(0); const o2 = m.material.opacity; e.doll.U.uDissolve.value = 0; Dybde.lykt(0);
            ut.alfa = { o0: +o0.toFixed(4), gjennomsiktig: +(o1 / o0).toFixed(4), oppløst: +(o2 / o0).toFixed(4) }; }
          return ut; }""")
    sjekk('lykta kaster ikke skygge gjennom vegger, men de høye tingene i rommet beholder sin', ly.get('funnet') and ly['vegg']['bak'] and ly['vegg']['avstand'] < ly['vegg']['rr'] and not ly['vegg']['fiende'] and ly['vegg']['ting'], ly.get('vegg', ly))
    k = ly.get('kort', {})
    sjekk('lykteskyggen stopper ved første vegg bak fienden', ly.get('veggFunnet') and k.get('finnes') and k['forbi'] and not k['inni'] and .15 < k['lengde'] < k['full'] - .8, k)
    sb = ly.get('sammeBilde', {})
    sjekk('lykteskyggen står der fienden står i samme bilde, også under et dytt', sb.get('flytt', 0) >= 5 and sb.get('maks', 1) < 1e-6, sb)
    n = ly.get('naer', [])
    sjekk('nær lykta blekner skyggen jevnt i stedet for å klippes', len(n) == 5 and all(x >= 0 for x in n) and all(n[i] > n[i + 1] for i in range(4)) and n[4] < .03 and n[0] > .3, n)
    al = ly.get('alfa', {})
    sjekk('gjennomsiktige og halvt oppløste figurer kaster svakere lykteskygge', abs(al.get('gjennomsiktig', 0) - .3) < 1e-3 and abs(al.get('oppløst', 0) - .5) < 1e-3, al)
    sjekk('ingen konsollfeil (lykteskygger)', not pg.errs, pg.errs[:6])
    await pg.close()

    # 3D: månens skygger står stille når kameraet glir, lykta lyser fra der pasienten er i samme bilde, og telefoner får 1024 i skyggekartet
    pg = await ny_side(b, viewport={'width': 960, 'height': 540})
    await start_lop(pg, url=URL3D)
    m3 = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), spill = async (t, maks = 30000) => { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < t && performance.now() - t0 < maks) await vent(50); }, bilder = n => new Promise(r => { const f = () => --n <= 0 ? r() : requestAnimationFrame(f); requestAnimationFrame(f); }), ut = {};
          const bygg = async d => { startFloor(d, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } rolig(); P.hp = P.maxHp = 9999; P.invuln = 999; await spill(.3); };
          await bygg(2); ut.d3 = D3.on && D3.bygd;
          // seks tilfeldige små flytt av kameraet: midtpunktet ligger alltid på hele ruter i skyggekartet, med samme retning og lengde, på gulvet og nær kameraet.
          // Aksene regnes ut her fra lyset selv, slik lookAt gjør det for skyggekameraet, og ruta er bredden på kameraet delt på kartet
          const M = D3.mane, C = M.shadow.camera, z = new THREE.Vector3(-7, 16, 9).normalize(), x = new THREE.Vector3(0, 1, 0).cross(z).normalize(), B = { x, y: z.clone().cross(x), texel: (C.right - C.left) / M.shadow.mapSize.x }, A = { rute: 0, retning: 0, gulv: 0, naer: 0 };
          for (let i = 0; i < 6; i++) { R.camT.x += Math.random() - .5; R.camT.z += Math.random() - .5; D3.tick(0); const t = M.target.position, fx = t.dot(B.x) / B.texel, fy = t.dot(B.y) / B.texel;
            A.rute = Math.max(A.rute, Math.abs(fx - Math.round(fx)), Math.abs(fy - Math.round(fy))); A.retning = Math.max(A.retning, Math.abs(M.position.x - t.x + 7), Math.abs(M.position.y - t.y - 16), Math.abs(M.position.z - t.z - 9)); A.gulv = Math.max(A.gulv, Math.abs(t.y)); A.naer = Math.max(A.naer, Math.hypot(t.x - R.camT.x, t.z - R.camT.z) / B.texel); }
          ut.maane = A; ut.texel = B.texel; ut.kart = M.shadow.mapSize.x; ut.niva = D3.kval();
          // lykta: punktlyset står der pasienten står når bildet tegnes, også under et dytt
          { const r0 = R.render, L = { n: 0, flytt: 0, maks: 0 }; let x0 = P.x, z0 = P.z, f = 0;
            R.render = function (dt) { const l = D3.pool[0]; if (l && G.state === 'play') { L.n++; if (Math.hypot(P.x - x0, P.z - z0) > 1e-3) { L.flytt++; L.maks = Math.max(L.maks, Math.abs(l.position.x - P.x), Math.abs(l.position.z + .3 - P.z)); } } x0 = P.x; z0 = P.z; P.kvx = ++f % 10 < 5 ? 3 : -3; return r0.call(this, dt); };
            await spill(1.2); R.render = r0; P.kvx = P.kvz = 0; ut.lykt = L; }
          // skyggekartet tegnes ikke i pausen, bare én gang når den åpnes, og igjen når spillet går videre
          { const SM = R.renderer.shadowMap, r1 = SM.render; let n = 0; SM.render = function (...a) { if (this.enabled && (this.autoUpdate || this.needsUpdate) && a[0] && a[0].length) n++; return r1.apply(this, a); };
            await bilder(3); const spillN = n; openPause(); await bilder(2); n = 0; await bilder(4); const pauseN = n, auto = SM.autoUpdate; closePanel(); await bilder(3); ut.kartpass = { spill: spillN, pause: pauseN, auto, etter: n, autoEtter: SM.autoUpdate }; SM.render = r1; }
          // telefon (grov peker) på høy: 1024 i skyggekartet, uten at nivåene endres
          { const s = G.meta.settings, k0 = s.kvalitet; s.kvalitet = 3; R.coarse = true; applySettings(); ut.mobil = { niva: D3.kval(), skygge: D3.Q().skygge, kart: D3.mane.shadow.mapSize.x, texel: D3.maneB && D3.maneB.texel, hoy: D3.NIVA.hoy.skygge };
            R.coarse = false; applySettings(); ut.pc = { skygge: D3.Q().skygge, kart: D3.mane.shadow.mapSize.x };
            s.lights = false; applySettings(); D3.tick(0); ut.lysAv = !D3.maneB && !D3.mane.castShadow; s.lights = true; s.kvalitet = k0; applySettings(); }
          const r = G.F.rooms.find(r => r.role === 'combat' && !r.ute && r.w >= 8) || G.F.rooms[G.F.startId]; P.x = r.x + r.w / 2; P.z = r.z + r.h / 2; R.snapCamera(P.x, P.z); await spill(.6);
          return ut; }""")
    await pg.screenshot(path='/tmp/e_skygge_a.png')
    await pg.evaluate("async () => { const G = MORBIDIUM, g0 = G.time, t0 = performance.now(); G.player.x += .02; while (G.time - g0 < .8 && performance.now() - t0 < 20000) await new Promise(r => setTimeout(r, 50)); }")
    await pg.screenshot(path='/tmp/e_skygge_b.png')
    ma = m3['maane']
    sjekk('månens skyggekamera flytter seg bare i hele ruter av skyggekartet, med samme retning og lengde', m3['d3'] and ma['rute'] < 1e-3 and ma['retning'] < 1e-6 and ma['gulv'] < 1e-6 and ma['naer'] < 2, m3)
    ly3 = m3['lykt']
    sjekk('lykta i 3D lyser fra der pasienten står i samme bilde, også under et dytt', ly3['flytt'] >= 5 and ly3['maks'] < 1e-6, ly3)
    kp = m3['kartpass']
    sjekk('skyggekartet tegnes ikke på nytt i pausen, men igjen når spillet går videre', kp['spill'] >= 3 and kp['pause'] == 0 and kp['auto'] is False and kp['etter'] >= 2 and kp['autoEtter'] is True, kp)
    sjekk('telefoner får høyst 1024 i skyggekartet på høy, PC 2048, og uten lys og skygge er det ingen måneskygge', m3['mobil'] == {'niva': 'hoy', 'skygge': 1024, 'kart': 1024, 'texel': 32 / 1024, 'hoy': 2048} and m3['pc'] == {'skygge': 2048, 'kart': 2048} and m3['lysAv'], m3)
    sjekk('ingen konsollfeil (måneskygger)', not pg.errs, pg.errs[:6])
    await pg.close()

    # skyggeflekkene i 2D: kråka og koret svever og et hopp løfter tegningen, men flekken blir liggende på gulvet, mindre og lysere.
    # Fiendene settes på plass etter update (roten til y 0), så det sjekkes når bildet tegnes. Full styrke i 2D, og den blekner med figuren
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg)
    fl = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), spill = async (t, maks = 20000) => { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < t && performance.now() - t0 < maks) await vent(50); }, ut = {};
          startFloor(2, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } rolig(); P.hp = P.maxHp = 9999; P.invuln = 999;
          const fiende = (t, dx, dz) => { const s = freeSpot(P.x + dx, P.z + dz, 2), e = spawnEnemy(t, s.x, s.z, false, 2); e.stun = 99; e.hp = e.max = 1e6; return e; };
          const v = new THREE.Vector3(), y = o => o.getWorldPosition(v).y, r0 = R.render;
          const kr = fiende('kraake', 2, 0), ko = fiende('koret', -2, 0), pl = fiende('pleier', 0, 2);
          // pleieren hopper (som rottene og yngelen gjør når de løper): update får hopp, og updateEnemy setter roten på plass etterpå som ellers
          const u0 = pl.doll.update; pl.doll.update = function (dt, st) { return u0.call(this, dt, Object.assign({}, st, { hop: .5 })); };
          await spill(1.2);
          const M = { n: 0, kraake: 9, koret: 9, hopp: 9, flekk: 0 };
          R.render = function (dt) { M.n++; M.kraake = Math.min(M.kraake, y(kr.doll.plane)); M.koret = Math.min(M.koret, y(ko.doll.plane)); M.hopp = Math.min(M.hopp, y(pl.doll.plane)); for (const e of [kr, ko, pl]) M.flekk = Math.max(M.flekk, Math.abs(y(e.doll.shadow) - .012));
            const s = pl.doll.shadow; M.str = +(s.scale.x / s.userData.sx).toFixed(4); M.a = +s.material.opacity.toFixed(4); return r0.call(this, dt); };
          await spill(.5); R.render = r0; pl.doll.update = u0; ut.hoyde = M; await spill(.2); ut.full = pl.doll.shadow.material.opacity;
          // et drap: flekken følger oppløsningen (og høyden) og går aldri over full styrke, og kråka daler ned mens den løses opp
          const L = { n: 0, avvik: 0, maks: 0, kraake: 9 };
          R.render = function (dt) { for (const e of [pl, kr]) if (!e.gone) { const d = e.doll, h = Math.max(0, d.plane.position.y); L.n++; L.avvik = Math.max(L.avvik, Math.abs(d.shadow.material.opacity - (1 - d.U.uDissolve.value) * (1 - Math.min(.5, h * .4)))); L.maks = Math.max(L.maks, d.shadow.material.opacity); } if (!kr.gone) L.kraake = kr.doll.plane.position.y; return r0.call(this, dt); };
          killEntity(pl, {}); killEntity(kr, {}); await spill(.7); R.render = r0; L.borte = pl.gone && kr.gone; ut.drap = L;
          return ut; }""")
    h = fl['hoyde']
    sjekk('kråka og koret svever i spillet, men skyggeflekken ligger på gulvet', h['n'] >= 3 and h['kraake'] > .5 and h['koret'] > .2 and h['flekk'] < 1e-3, h)
    sjekk('et hopp løfter tegningen og ikke skyggeflekken, som blir mindre og lysere', h['hopp'] > .45 and abs(h['str'] - .8) < .01 and abs(h['a'] - .8) < .01, h)
    d = fl['drap']
    sjekk('i 2D har skyggeflekken full styrke, den blekner med figuren når den dør, og kråka daler ned', abs(fl['full'] - 1) < 1e-6 and d['n'] >= 4 and d['avvik'] < 1e-6 and d['maks'] <= 1 and d['kraake'] < .15 and d['borte'], fl)
    sjekk('ingen konsollfeil (skyggeflekker)', not pg.errs, pg.errs[:6])
    await pg.close()

    # 3D: figurene kaster måneskygge etter hele tegningen, også våpen og tillegg som kommer senere. Skyggeflekken er .45 og blir der,
    # også gjennom et drap og når hjorten skjuler seg. Halvt oppløste og gjennomsiktige kaster ikke. Den åpne kista, dekalene, lys av og 3D av
    pg = await ny_side(b, viewport={'width': 960, 'height': 540})
    await start_lop(pg, url=URL3D)
    s3 = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), spill = async (t, maks = 30000) => { const g0 = G.time, t0 = performance.now(); while (G.time - g0 < t && performance.now() - t0 < maks) await vent(50); }, bilder = n => new Promise(r => { const f = () => --n <= 0 ? r() : requestAnimationFrame(f); requestAnimationFrame(f); }), ut = {};
          const bygg = async d => { startFloor(d, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } rolig(); P.hp = P.maxHp = 9999; P.invuln = 999; await spill(.3); };
          const fiende = (t, dx, dz) => { const s = freeSpot(P.x + dx, P.z + dz, 2), e = spawnEnemy(t, s.x, s.z, false, 2); e.stun = 99; e.hp = e.max = 1e6; return e; };
          const plate = d => d.meshes.length > 0 && d.meshes.every(m => !!m.customDepthMaterial && m.castShadow), K = d => d.d3k || [], v = new THREE.Vector3(), y = o => o.getWorldPosition(v).y, r0 = R.render;
          await bygg(2); ut.d3 = D3.on && D3.bygd;
          const pd = P.doll; ut.spiller = { deler: pd.meshes.length, plate: plate(pd), baand: [pd.back.mesh, pd.front.mesh].every(m => K(pd).includes(m) && m.castShadow), flekk: +pd.shadow.material.opacity.toFixed(4) };
          // et våpen som plukkes opp midt i etasjen får skyggeplate, og det gamle våpenet frigjøres
          { let kastet = false; const gml = pd.wpMesh; if (gml) gml.material.addEventListener('dispose', () => { kastet = true; }); const w = Object.keys(WEAPONS).find(w => w !== P.weapon); P.weapon = w; pd.setWeapon(w); await bilder(3);
            ut.vaapen = { ny: pd.wpMesh !== gml, plate: !!pd.wpMesh.customDepthMaterial && pd.wpMesh.castShadow && plate(pd), kastet: !gml || kastet }; }
          // en ny fiende og en kråke: flekken er .45 i 3D (lysere når kråka svever), og et tillegg som kommer senere får skyggeplate
          const e = fiende('pleier', 2, 0), kr = fiende('kraake', -2, 0); await spill(1.2);
          ut.fiende = { flekk: +e.doll.shadow.material.opacity.toFixed(4), a: e.doll.shadowA, plate: plate(e.doll) };
          { const M = { n: 0, kraake: 9, flekk: 0 }; R.render = function (dt) { M.n++; M.kraake = Math.min(M.kraake, y(kr.doll.plane)); M.flekk = Math.max(M.flekk, Math.abs(y(kr.doll.shadow) - .012)); return r0.call(this, dt); }; await spill(.3); R.render = r0; M.a = +kr.doll.shadow.material.opacity.toFixed(4); ut.kraake = M; }
          { const m = e.doll.addAddon(weaponPart('mopp'), { at: 'head', off: { f: [0, .2] } }); await bilder(3); ut.tillegg = !!m.customDepthMaterial && m.castShadow; }
          // den gjennomsiktige mesteren kaster ikke måneskygge, og skyggen kommer tilbake når figuren er synlig igjen
          e.doll.U.uAlpha.value = .3; await bilder(3); const gj = K(e.doll).length > 3 && K(e.doll).every(m => !m.castShadow); e.doll.U.uAlpha.value = 1; await bilder(3); ut.gjennomsiktig = gj && K(e.doll).every(m => m.castShadow);
          // den skjulte hjorten (oppløst .55 og så 0 igjen): ingen måneskygge mens den er skjult, og flekken går tilbake til .45, ikke til 1
          e.doll.dissolve(.55); await bilder(3); const skjult = K(e.doll).length > 3 && K(e.doll).every(m => !m.castShadow); e.doll.dissolve(0); await bilder(3); ut.skjult = { skygge: skjult && K(e.doll).every(m => m.castShadow), flekk: +e.doll.shadow.material.opacity.toFixed(4) };
          // et drap: flekken går aldri over .45 mens figuren løses opp, måneskyggen er borte før halvveis, og skyggeplatene frigjøres med dukken
          { let kastet = false; const m0 = e.doll.meshes[0]; if (m0 && m0.customDepthMaterial) m0.customDepthMaterial.addEventListener('dispose', () => { kastet = true; });
            const M = { n: 0, maks: 0 }; R.render = function (dt) { if (!e.gone) { M.n++; M.maks = Math.max(M.maks, e.doll.shadow.material.opacity); } return r0.call(this, dt); };
            killEntity(e, {}); const g0 = G.time; await spill(.3); M.tid = +(G.time - g0).toFixed(2); M.skygge = K(e.doll).length === 0 || K(e.doll).some(m => m.castShadow); await spill(.5); R.render = r0; M.borte = e.gone; M.kastet = kastet; M.maks = +M.maks.toFixed(4); ut.drap = M; }
          // dekaler, plakater og dører er toon som gulvet (Lambert tok lykta og lampene bort i måneskyggen)
          { const lag = D3.byttet.filter(([m]) => m.userData.d3 && !m.userData.vaat).map(([m]) => m.material.type); ut.dekaler = { n: lag.length, toon: lag.every(t => t === 'MeshToonMaterial'), lambert: R.level.children.filter(c => c.material && c.material.isMeshLambertMaterial).length }; }
          // den åpne kista: ny tegning i U og m, lyses av lampene, kaster måneskygge og har ikke lenger den bakte skyggen
          { let K = null; for (const d of [2, 3, 4, 1, 6, 5]) { if (d !== G.depth) await bygg(d); K = G.props.find(o => o.kind === 'chest' && !o.opened && o.g); if (K) break; }
            if (K) { openChest(K); const t0 = D3.t; for (let i = 0; i < 300 && D3.t - t0 < .7; i++) await vent(50); const c = K.U.uTint.value; ut.kiste = { U: K.U === K.g.userData.U, m: K.m === K.g.userData.m, bakt: K.g.userData.shadow.visible, plate: !!K.m.customDepthMaterial && K.m.castShadow, r: +c.r.toFixed(3), panel: G.state }; closePanel(); await bilder(2); } }
          // lys og skygge av: tingene beholder den bakte skyggen, og flekken under figurene har full styrke. Så på igjen
          { const s = G.meta.settings; s.lights = false; applySettings(); await bilder(3); const tegnet = G.props.filter(o => o.g && o.g.userData.shadow && !o.g.userData.flat && o.g.userData.m);
            ut.lysAv = { d3: D3.on && D3.bygd, ting: tegnet.length, bakt: tegnet.every(o => o.g.userData.shadow.visible), flekk: +P.doll.shadow.material.opacity.toFixed(4) };
            s.lights = true; applySettings(); await bilder(3); ut.lysPaa = { flekk: +P.doll.shadow.material.opacity.toFixed(4), gjemt: tegnet.filter(o => !o.g.userData.shadow.visible).length, plate: plate(P.doll) }; }
          // 3D av: skyggeflekkene får full styrke igjen, og tilbake på .45 når 3D slås på
          { const s = G.meta.settings; s.d3 = false; applySettings(); await bilder(3); ut.av = { d3: D3.on, flekk: +P.doll.shadow.material.opacity.toFixed(4), a: P.doll.shadowA };
            s.d3 = true; applySettings(); await bilder(3); ut.paaIgjen = { d3: D3.on && D3.bygd, flekk: +P.doll.shadow.material.opacity.toFixed(4), plate: plate(P.doll) }; }
          // kuriositeter som vises på pasienten (Items.addons) kaster måneskygge, og materialet og skyggeplaten frigjøres når utseendet tømmes
          { const id = Object.keys(ITEMS).find(k => ITEMS[k].look); Items.give(id); Items.updateLook(); await bilder(3); const ms = Object.values(Items.addons); let kastet = 0;
            for (const m of ms) { if (m.customDepthMaterial) m.customDepthMaterial.addEventListener('dispose', () => kastet++); m.material.addEventListener('dispose', () => kastet++); }
            ut.utseende = { n: ms.length, plate: ms.length > 0 && ms.every(m => !!m.customDepthMaterial && m.castShadow) }; Items.clearLook(); ut.utseende.kastet = kastet; }
          return ut; }""")
    sp = s3['spiller']
    sjekk('i 3D kaster alle tegnede deler og strekbåndene måneskygge, og skyggeflekken er .45', s3['d3'] and sp['deler'] >= 4 and sp['plate'] and sp['baand'] and abs(sp['flekk'] - .45) < 1e-3, s3)
    sjekk('et våpen som plukkes opp og et tillegg som kommer senere, kaster måneskygge, og det gamle våpenet frigjøres', s3['vaapen'] == {'ny': True, 'plate': True, 'kastet': True} and s3['tillegg'], s3)
    fi, kr = s3['fiende'], s3['kraake']
    sjekk('en ny fiende har flekken på .45, og kråka svever i 3D med flekken på gulvet', abs(fi['flekk'] - .45) < 1e-3 and fi['a'] == .45 and fi['plate'] and kr['n'] >= 3 and kr['kraake'] > .5 and kr['flekk'] < 1e-3 and .22 < kr['a'] < .45, s3)
    sjekk('gjennomsiktige og halvt oppløste figurer kaster ikke måneskygge, og hjorten som har skjult seg får flekken tilbake på .45', s3['gjennomsiktig'] and s3['skjult']['skygge'] and abs(s3['skjult']['flekk'] - .45) < 1e-3, s3)
    dr = s3['drap']
    sjekk('under et drap går flekken aldri over .45, måneskyggen er borte etter 0,3 sekunder, og skyggeplatene frigjøres', dr['n'] >= 3 and dr['maks'] <= .46 and dr['tid'] >= .3 and not dr['skygge'] and dr['borte'] and dr['kastet'], dr)
    dk = s3['dekaler']
    sjekk('dekaler, plakater og dører er toon som gulvet, ikke Lambert', dk['n'] > 0 and dk['toon'] and dk['lambert'] == 0, dk)
    ki = s3.get('kiste')
    sjekk('den åpne kista lyses av lampene, kaster måneskygge og har ikke lenger den bakte skyggen', ki is not None and ki['U'] and ki['m'] and not ki['bakt'] and ki['plate'] and ki['r'] < .95 and ki['panel'] == 'panel', ki)
    la, lp = s3['lysAv'], s3['lysPaa']
    sjekk('uten lys og skygge beholder tingene den bakte skyggen og flekken har full styrke, og med lys igjen er alt som før', la['d3'] and la['ting'] > 5 and la['bakt'] and abs(la['flekk'] - 1) < 1e-3 and abs(lp['flekk'] - .45) < 1e-3 and lp['gjemt'] > 5 and lp['plate'], s3)
    sjekk('når 3D slås av, får skyggeflekken full styrke igjen, og .45 når det slås på', s3['av'] == {'d3': False, 'flekk': 1, 'a': 1} and s3['paaIgjen']['d3'] and abs(s3['paaIgjen']['flekk'] - .45) < 1e-3 and s3['paaIgjen']['plate'], s3)
    ut_ = s3['utseende']
    sjekk('kuriositetene på pasienten kaster måneskygge, og materialet og skyggeplaten frigjøres når utseendet tømmes', ut_['plate'] and ut_['kastet'] == 2 * ut_['n'], ut_)
    sjekk('ingen konsollfeil (skygger i 3D)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_38(b):
    # 38) Lyspuljen
    # 3D: punktlysene hopper ikke av og på når pasienten går, lykta har det første, bare ett lysglimt får lys om gangen, svarte kilder
    # får ingenting, en lampe som er mørk en kort stund beholder lyset sitt, romlyset kan settes sist i køen, og antallet følger kvaliteten.
    # D3.tick kjøres for hånd i faste steg (1/60) inne i én evaluate, så spillet ikke går imellom og maskinens fart ikke betyr noe
    pg = await ny_side(b, viewport={'width': 960, 'height': 540})
    await start_lop(pg, url=URL3D)
    lp = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), spill = async t => { Klokke.spol(t); }, ut = {};
          startFloor(2, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } rolig(); P.hp = P.maxHp = 9999; P.invuln = 999; await spill(.3);
          ut.d3 = D3.on && D3.bygd; const pool = D3.pool, N = pool.length, lys = m => { const c = m.material.color; return c.r + c.g + c.b >= .05; };
          // ingen flimring, intet mørke og ingen Morbidium, så bare fordelingen kan endre lysene
          const ro = () => { for (const L of D3.lamper) L.flimrer = false; D3.morkeT = 0; P.morb = 0; };
          const flytt = (x, z) => { P.x = x; P.z = z; P.lantern.position.x = x; P.lantern.position.z = z; R.camT.x = x; R.camT.z = z; };
          const steg = (n, f) => { const L = []; for (let k = 0; k < n; k++) { if (f) f(k); D3.tick(1 / 60); L.push(pool.map(l => [l.position.x, l.position.z, l.intensity])); } return L; };
          // et hopp: lyset flytter seg mer enn en halv rute mens det lyser (etter flyttet, eller mer enn ett steg i blekningen før)
          const hopp = L => { let pop = 0, maks = 0; for (let k = 1; k < L.length; k++) for (let i = 1; i < N; i++) { const [x0, z0, a] = L[k - 1][i], [x1, z1, b] = L[k][i]; maks = Math.max(maks, Math.abs(b - a)); if (Math.hypot(x1 - x0, z1 - z0) > .5 && (b > .01 || a > .2)) pop++; } return { pop, maks: +maks.toFixed(3) }; };
          const paa = m => pool.findIndex((l, i) => i > 0 && l.intensity > 0 && Math.abs(l.position.x - m.position.x) < 1e-6 && Math.abs(l.position.z - m.position.z + .3) < 1e-6);
          const kand = () => D3.kilder().filter(m => m !== P.lantern && lys(m)).length, tent = () => pool.filter((l, i) => i > 0 && l.intensity > 0).length;
          // pasienten går 12 ruter i 60 steg, fra midten av et rom og den veien flest lyskilder kommer inn blant de nærmeste
          const K0 = D3.kilder().filter(m => m !== P.lantern && lys(m)), naer = (x, z) => K0.map(m => [(m.position.x - x) ** 2 + (m.position.z - z) ** 2, m]).sort((a, b) => a[0] - b[0]).slice(0, N - 1).map(a => a[1]);
          let x0 = P.x, z0 = P.z, dir = [1, 0], mulige = -1;
          for (const r of G.F.rooms) for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ax = r.x + r.w / 2, az = r.z + r.h / 2, S = new Set(); for (let t = 0; t <= 12; t += 1) for (const m of naer(ax + dx * t, az + dz * t)) S.add(m); if (S.size > mulige) { mulige = S.size; x0 = ax; z0 = az; dir = [dx, dz]; } }
          ro(); flytt(x0, z0); steg(90);
          const sett = new Set(), nest = new Set(), L = steg(60, k => { flytt(x0 + dir[0] * .2 * (k + 1), z0 + dir[1] * .2 * (k + 1)); for (const m of naer(R.camT.x, R.camT.z)) nest.add(m); for (const l of pool.slice(1)) if (l.intensity > 0) sett.add(Math.round(l.position.x * 100) + ',' + Math.round(l.position.z * 100)); });
          ut.gange = Object.assign(hopp(L), { kilder: sett.size, naermeste: nest.size, n: N, mulige });
          steg(90); ut.hvile = { tent: tent(), kand: kand(), lykt: pool[0].userData.lykt === true && Math.abs(pool[0].position.x - P.x) < 1e-6 && Math.abs(pool[0].position.z + .3 - P.z) < 1e-6 && pool[0].intensity > 0 };
          // fem lysglimt rundt kameraet samtidig: bare ett får et punktlys, og det tennes med en gang. Når de er over, får lampene lyset tilbake
          { const cx = R.camT.x, cz = R.camT.z, fl = [], f0 = tent(); for (let k = 0; k < 5; k++) { flashLight(cx + .37 * (k - 2) + .011, cz + .23 * (k - 2) + .013, 3, '#ffd0a0', .3); fl.push(G.fxl[G.fxl.length - 1].obj); }
            D3.tick(1 / 60); const i = fl.map(paa).find(i => i > 0), maks = { n: 0 };
            ut.glimt = { lys: fl.filter(m => paa(m) > 0).length, sterk: i > 0 ? +pool[i].intensity.toFixed(3) : 0, blink: i > 0 && !!(pool[i].userData.kilde && pool[i].userData.kilde.userData.blink) };
            steg(40, () => { updateFx(1 / 60); maks.n = Math.max(maks.n, fl.filter(m => paa(m) > 0).length); });
            ut.glimt.maks = maks.n; ut.glimt.borte = fl.every(m => !m.parent) && fl.every(m => paa(m) < 0); steg(60); ut.glimt.for = f0; ut.glimt.etter = tent(); }
          // en svart kilde rett ved kameraet får aldri lys
          { const sv = R.light(R.camT.x + .123, R.camT.z + .077, 3, '#ffd89a', 0, R.levelL); steg(30); ut.svart = pool.some(l => Math.abs(l.position.x - sv.position.x) < 1e-6 && Math.abs(l.position.z - sv.position.z + .3) < 1e-6); R.remove(sv); }
          // en lampe som blir mørk ett sekund (som i mørket etter en sjef), beholder lyset og lyser med en gang den tennes igjen. Mørk i 2,5 sekunder mister den det
          { const i1 = pool.findIndex((l, i) => i > 0 && l.userData.kilde && l.userData.w === 1 && !l.userData.kilde.userData.blink && !D3.lamper.some(L => L.lp === l.userData.kilde));
            if (i1 > 0) { const m1 = pool[i1].userData.kilde, k1 = m1.material.color.clone();
              m1.material.color.setRGB(0, 0, 0); steg(60); const kort = pool[i1].userData.kilde === m1; m1.material.color.copy(k1); steg(1); const igjen = pool[i1].intensity > 0 && pool[i1].userData.w === 1;
              m1.material.color.setRGB(0, 0, 0); steg(150); const lang = pool.every(l => l.userData.kilde !== m1); m1.material.color.copy(k1); steg(30); ut.morkt = { kort, igjen, lang }; } }
          // romlyset (fyll) er merket i hvert rom, og med FYLL_SIST går punktlysene til lampene så lenge det er nok av dem
          { const fylte = D3.kilder().filter(m => m.userData.fyll), andre = D3.kilder().filter(m => !m.userData.fyll && m !== P.lantern && lys(m)).length;
            D3.FYLL_SIST = true; steg(120); ut.fyll = { n: fylte.length, rom: G.F.rooms.length, andre, sist: pool.filter(l => l.userData.kilde && l.userData.kilde.userData.fyll).length, n1: N - 1 }; D3.FYLL_SIST = false; steg(30); }
          // antallet punktlys følger kvaliteten (8, 6 og 4), og uten lys og skygge er det ingen
          { const s = G.meta.settings, k0 = s.kvalitet; ut.niva = {};
            for (const [k, n] of [[1, 'lav'], [2, 'middels'], [3, 'hoy']]) { s.kvalitet = k; applySettings(); ro(); for (let j = 0; j < 20; j++) D3.tick(1 / 60); ut.niva[n] = [D3.pool.length, D3.pool.filter(l => l.intensity > 0).length]; }
            s.lights = false; applySettings(); for (let j = 0; j < 5; j++) D3.tick(1 / 60); ut.niva.av = D3.pool.length; s.lights = true; s.kvalitet = k0; applySettings(); }
          await spill(.6); ut.spill = D3.pool.filter(l => l.intensity > 0).length;
          return ut; }""")
    ga = lp['gange']
    sjekk('punktlysene hopper ikke av og på når pasienten går 12 ruter, og de blekner jevnt', lp['d3'] and ga['naermeste'] >= ga['n'] + 2 and ga['pop'] == 0 and ga['maks'] <= .3 and ga['kilder'] >= ga['n'] + 1, ga)
    hv = lp['hvile']
    sjekk('lykta har det første punktlyset, og står pasienten stille, er ingen punktlys ledige så lenge det er kilder nok', hv['lykt'] and hv['tent'] == min(lp['gange']['n'] - 1, hv['kand']), hv)
    gl = lp['glimt']
    sjekk('fem lysglimt samtidig gir bare ett punktlys, det tennes med en gang, og lampene får lyset tilbake etterpå', gl['lys'] == 1 and gl['sterk'] > 1 and gl['blink'] and gl['maks'] == 1 and gl['borte'] and gl['etter'] == gl['for'], gl)
    sjekk('en svart lyskilde får aldri punktlys', lp['svart'] is False, lp['svart'])
    mo = lp.get('morkt')
    sjekk('en lampe som er mørk et sekund, beholder punktlyset og lyser med en gang, men mister det etter 2,5 sekunder', mo == {'kort': True, 'igjen': True, 'lang': True}, mo)
    fy = lp['fyll']
    sjekk('romlyset er merket i hvert rom, og med FYLL_SIST får lampene punktlysene', fy['n'] == fy['rom'] and fy['andre'] >= fy['n1'] and fy['sist'] == 0, fy)
    nv = lp['niva']
    sjekk('antallet punktlys følger kvaliteten, og uten lys og skygge er det ingen', nv['lav'][0] == 4 and nv['middels'][0] == 6 and nv['hoy'][0] == 8 and all(nv[k][1] >= 2 for k in ('lav', 'middels', 'hoy')) and nv['av'] == 0 and lp['spill'] >= 2, nv)
    sjekk('ingen konsollfeil (lyspuljen)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_39(b):
    # 39) Diorama
    # Glorier rundt lampene og flammene, tilt-shift også på middels med det skarpe båndet der pasienten står, og etterbehandlingen med
    # hjelpemål uten dybdebuffer som kastes når de slås av, og ingen lysbuffer i 3D. Gloriene kjøres for hånd i faste steg, og bildet
    # tegnes med R.render(0) to ganger i samme evaluate (uten og med glorier), så maskinens fart ikke betyr noe
    pg = await ny_side(b, viewport={'width': 960, 'height': 540})
    await start_lop(pg, url=URL3D)
    di = await pg.evaluate("""async () => { const G = MORBIDIUM, P = G.player, vent = t => new Promise(r => setTimeout(r, t)), bilder = n => new Promise(r => { const f = () => --n <= 0 ? r() : requestAnimationFrame(f); requestAnimationFrame(f); }), ut = {}, s = G.meta.settings, u = R.post.uniforms;
            G.run.seed = 4242; startFloor(3, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } rolig(); P.hp = P.maxHp = 9999; P.invuln = 999;
            const tikk = n => { for (let i = 0; i < n; i++) Glorie.tick(1 / 60); }, antall = () => Glorie.pts && Glorie.pts.visible ? Glorie.pts.geometry.drawRange.count : 0, lyser = () => Glorie.K.filter(k => k.lys > .01).length;
            const mal = () => ({ tilt: +u.uTilt.value.toFixed(3), bl: R.bl ? [R.bl.a.depthBuffer, R.bl.b.depthBuffer] : null, us: R.us ? [R.us.a.depthBuffer, R.us.b.depthBuffer] : null, lrt: R.lrt ? R.lrt.depthBuffer : null, rt: R.rt.depthBuffer, lys: u.uLights.value });
            // etterbehandlingen per nivå: tilt-shift på høy og middels, glød og tilt i mål uten dybdebuffer som kastes når de slås av, ingen lysbuffer i 3D.
            // Antallet glorier følger taket, også mens kameraet glir over hele etasjen
            ut.niva = {}; const glc = R.renderer.getContext(); ut.maks = [(Glorie.maks || {}).value, glc.getParameter(glc.ALIASED_POINT_SIZE_RANGE)[1]];
            for (const [k, n] of [[3, 'hoy'], [2, 'middels'], [1, 'lav']]) {
              s.kvalitet = k; applySettings(); await bilder(3); tikk(30); const m = mal(); m.kval = D3.kval(); m.tak = Glorie.tak(); m.n = antall(); m.lyser = lyser();
              let maks = 0; const W = G.F.W, H = G.F.H; for (let i = 0; i <= 90; i++) { const t = i / 90; R.camT.x = W * (.1 + .8 * t); R.camT.z = H * (.2 + .6 * Math.abs(Math.sin(t * 5))); tikk(1); maks = Math.max(maks, antall()); }
              m.maks = maks; ut.niva[n] = m;
            }
            s.kvalitet = 3; applySettings(); await bilder(3);
            // uten 3D: lysbufferen uten dybdebuffer, ingen glød eller tilt, og høyst ti glorier
            s.d3 = false; applySettings(); await bilder(3); tikk(30); ut.uten3d = Object.assign(mal(), { d3: D3.on, tak: Glorie.tak(), n: antall() }); s.d3 = true; applySettings(); await bilder(3); tikk(30);
            // enkel grafikk, lette teksturer og uten lys og skygge: ingen glorier
            const av = () => [Glorie.tak(), Glorie.pts.visible, antall()];
            // enkel grafikk slått på midt i spillet kaster også hjelpemålene til glød, tilt-shift og lysbufferen
            R.safe = true; tikk(1); R.render(0); ut.safe = av(); ut.safeMal = [!!R.bl, !!R.us, !!R.lrt]; R.safe = false; R.lowTex = true; tikk(1); ut.lowTex = av(); R.lowTex = false;
            s.lights = false; applySettings(); await bilder(2); tikk(1); ut.lysAv = av(); s.lights = true; applySettings(); await bilder(3); tikk(30); ut.igjen = av();
            // lyset i gloria ved et stearinlys nær pasienten. Bildet tegnes to ganger i samme øyeblikk, med og uten glorier, og blekkstrekene
            // (under 30 uten glorier) skal holde seg mørke
            const kand = Glorie.K.filter(k => k.t === 'ting' && k.eier.kind === 'candles' && k.lys > .5);
            ut.kand = kand.length; if (!kand.length) return ut;
            const L = kand[0], o = L.eier, fs = freeSpot(o.x + 1.6, o.z + 1.2, 3); P.x = fs.x; P.z = fs.z; P.vx = P.vz = 0; R.snapCamera(P.x, P.z); D3.tick(1 / 60); tikk(40);
            const gl = R.renderer.getContext(), Wb = gl.drawingBufferWidth, Hb = gl.drawingBufferHeight, v = new THREE.Vector3(L.x, L.y, L.z).project(R.camera);
            const cx = Math.round((v.x + 1) / 2 * Wb), cy = Math.round((v.y + 1) / 2 * Hb), B = 48, px = new Uint8Array(B * B * 4), les = () => { gl.readPixels(cx - B / 2, cy - B / 2, B, B, gl.RGBA, gl.UNSIGNED_BYTE, px); return Array.from({ length: B * B }, (_, i) => .299 * px[i * 4] + .587 * px[i * 4 + 1] + .114 * px[i * 4 + 2]); };
            const info = R.renderer.info; info.autoReset = false;
            Glorie.pts.visible = false; info.reset(); R.render(0); const kall0 = info.render.calls, uten = les();
            Glorie.pts.visible = true; info.reset(); R.render(0); const kall1 = info.render.calls, med = les(); info.autoReset = true;
            const boks = a => { let sum = 0, n = 0; for (let y = 12; y < 36; y++) for (let x = 12; x < 36; x++) { sum += a[y * B + x]; n++; } return sum / n; };
            const blekk = []; for (let i = 0; i < B * B; i++) if (uten[i] < 30) blekk.push(i);
            ut.lys = { kind: o.kind, skjerm: [cx, cy, Wb, Hb], uten: +boks(uten).toFixed(1), med: +boks(med).toFixed(1), blekk: blekk.length, blekkMaks: +Math.max(0, ...blekk.map(i => med[i])).toFixed(1), blekkUten: +Math.max(0, ...blekk.map(i => uten[i])).toFixed(1), kall: [kall0, kall1] };
            // det skarpe båndet står der pasienten står
            ut.fokus = { x: +u.uFokus.value.x.toFixed(4), P: +R.uvAv(P.x, .9, P.z).y.toFixed(4), y: u.uFokus.value.y, z: u.uFokus.value.z };
            // gloriene følger lyset: mørket etter en sjef slukker dem, og et stearinlys som mister lyset (knust), blekner bort
            const sum = () => Glorie.K.filter(k => k.t === 'ting' && k.w > 0).reduce((a, k) => a + k.lys, 0), s0 = sum(); D3.morke(1.2, .08); D3.tick(1 / 60); tikk(1); const s1 = sum(); D3.morkeT = 0; D3.tick(1 / 60); tikk(1);
            ut.morke = { for: +s0.toFixed(3), under: +s1.toFixed(3), etter: +sum().toFixed(3) };
            const ly = Glorie.K.find(k => k.t === 'ting' && k.eier.kind === 'candles' && k.w === 1);
            if (ly) { R.remove(ly.eier.light); tikk(6); const w1 = ly.w; tikk(20); ut.knust = { w1: +w1.toFixed(3), w2: ly.w, lys: ly.lys }; }
            // ny etasje: den gamle gloria frigjøres og en ny lages
            const g = Glorie.pts.geometry; let kastet = false; g.addEventListener('dispose', () => { kastet = true; });
            startFloor(2, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } await bilder(2);
            ut.nyEtasje = { kastet, ny: !!Glorie.pts && Glorie.pts.geometry !== g, iScenen: !!Glorie.pts && Glorie.pts.parent === R.scene, gammel: R.scene.children.some(c => c.geometry === g) };
            return ut; }""")
    nv = di['niva']; h, m, l = nv['hoy'], nv['middels'], nv['lav']
    sjekk('tilt-shift på høy (0,7) og middels (0,45), ikke på lav, og glød og tilt har mål uten dybdebuffer som kastes når de slås av', h['tilt'] == .7 and m['tilt'] == .45 and l['tilt'] == 0 and h['bl'] == [False, False] and h['us'] == [False, False] and m['us'] == [False, False] and l['bl'] is None and l['us'] is None and all(x['rt'] and x['lrt'] is None for x in (h, m, l)), nv)
    u3 = di['uten3d']
    sjekk('uten 3D: lysbufferen uten dybdebuffer, ingen glød eller tilt, og høyst ti glorier', not u3['d3'] and u3['lrt'] is False and u3['bl'] is None and u3['us'] is None and u3['tilt'] == 0 and u3['lys'] == 1 and 0 < u3['n'] <= 10 and u3['tak'] == 10, u3)
    sjekk('gloriene holder seg under taket (32, 20 og 10) også mens kameraet glir over etasjen, og taket fylles når det er kilder nok', all(x['n'] == min(x['tak'], x['lyser']) and x['maks'] <= x['tak'] for x in (h, m, l)) and [h['tak'], m['tak'], l['tak']] == [32, 20, 10], nv)
    sjekk('enkel grafikk slått på underveis kaster målene til glød, tilt-shift og lysbufferen', di['safeMal'] == [False, False, False], di['safeMal'])
    sjekk('gloriene kan bli så store som skjermkortet tillater (de vokser i de uskarpe båndene også på store skjermer)', di['maks'][0] == di['maks'][1] and (di['maks'][0] or 0) > 160, di['maks'])
    sjekk('ingen glorier med enkel grafikk, lette teksturer eller uten lys og skygge, og de kommer tilbake', di['safe'] == [0, False, 0] and di['lowTex'] == [0, False, 0] and di['lysAv'] == [0, False, 0] and di['igjen'][1] and di['igjen'][2] > 0, [di['safe'], di['lowTex'], di['lysAv'], di['igjen']])
    ly = di.get('lys', {})
    sjekk('gloria lyser opp rundt stearinlyset, blekkstrekene holder seg mørke, og den koster ett tegnekall', di.get('kand', 0) > 0 and ly.get('med', 0) - ly.get('uten', 0) >= 8 and ly.get('blekk', 0) >= 5 and ly.get('blekkMaks', 99) < 60 and ly['kall'][1] - ly['kall'][0] == 1, ly)
    fo = di.get('fokus', {})
    sjekk('det skarpe båndet i tilt-shift står der pasienten står, bredere på liggende skjerm', abs(fo.get('x', 0) - fo.get('P', 1)) < 1e-3 and fo.get('y') == .2 and fo.get('z') == .42, fo)
    mo, kn = di.get('morke', {}), di.get('knust', {})
    sjekk('gloriene slukner i mørket etter sjefene og kommer tilbake, og et lys som blir borte, blekner bort', mo.get('under', 99) < mo.get('for', 0) * .2 and abs(mo.get('etter', 0) - mo.get('for', 0)) < .05 * mo.get('for', 1) and 0 < kn.get('w1', 0) < 1 and kn.get('w2') == 0, [mo, kn])
    ne = di.get('nyEtasje', {})
    sjekk('gloriene frigjøres når etasjen rives, og den nye etasjen får sine egne', ne == {'kastet': True, 'ny': True, 'iScenen': True, 'gammel': False}, ne)
    await pg.screenshot(path='/tmp/e_diorama_pc.png')
    sjekk('ingen konsollfeil (diorama)', not pg.errs, pg.errs[:6])
    await pg.close()

    # telefon: middels som standard, med tilt-shift og et smalere skarpt bånd stående, og bredere liggende
    pg = await ny_side(b, viewport={'width': 390, 'height': 844}, has_touch=True, is_mobile=True, device_scale_factor=2)
    await pg.goto(URL3D); await pg.wait_for_timeout(2500)
    await pg.tap('#tNew'); await pg.wait_for_timeout(500); await pg.tap('[data-awk]'); await pg.wait_for_timeout(1500)
    TLF = """async () => { const G = MORBIDIUM, P = G.player, u = R.post.uniforms, bilder = n => new Promise(r => { const f = () => --n <= 0 ? r() : requestAnimationFrame(f); requestAnimationFrame(f); });
          if (G.state === 'play') { rolig(); P.hp = P.maxHp = 9999; P.invuln = 999; } await bilder(4); R.render(0);
          return { kval: D3.on && D3.kval(), tilt: u.uTilt.value, us: R.us ? [R.us.a.depthBuffer, R.us.b.depthBuffer] : null, fokus: [+u.uFokus.value.x.toFixed(4), +R.uvAv(P.x, .9, P.z).y.toFixed(4), u.uFokus.value.y], n: Glorie.pts.geometry.drawRange.count, tak: Glorie.tak(), coarse: R.coarse }; }"""
    st = await pg.evaluate(TLF)
    await pg.screenshot(path='/tmp/e_diorama_mobil.png')
    await pg.set_viewport_size({'width': 844, 'height': 390}); await pg.wait_for_timeout(600)
    lg = await pg.evaluate(TLF)
    sjekk('telefon: middels med tilt-shift (0,45) i mål uten dybdebuffer, og høyst 20 glorier', st['coarse'] and st['kval'] == 'middels' and st['tilt'] == .45 and st['us'] == [False, False] and 0 < st['n'] <= 20 and st['tak'] == 20, st)
    sjekk('telefon: det skarpe båndet følger pasienten, smalere stående (0,14) enn liggende (0,2)', abs(st['fokus'][0] - st['fokus'][1]) < 1e-3 and st['fokus'][2] == .14 and abs(lg['fokus'][0] - lg['fokus'][1]) < 1e-3 and lg['fokus'][2] == .2, [st['fokus'], lg['fokus']])
    sjekk('ingen konsollfeil (diorama på telefon)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_50(b):
    # 50) Teksturer fra ChatGPT
    #     Bildeløpet for teksturer (ren Python), veggene og bakken ute tar bildet når det finnes og maler ellers som før,
    #     drømmegulvet er mindre på telefon, og tegneliste 11 og 12 har alle teksturene som mangler
    import base64, io, json, re, tempfile
    from urllib.parse import unquote, urlparse
    from PIL import Image
    ROT50 = pathlib.Path(unquote(urlparse(URL3D).path)).parent.parent  # roten til bygget som testes
    sys.path.insert(0, str(ROT50 / 'tools')); import behandle_bilder as BB
    man = json.loads((ROT50 / 'assets' / 'manifest.json').read_text(encoding='utf-8'))
    def proveflate(w, h, farger, hard=True):
        """en syntetisk tekstur: striper i farger, med en hard søm (venstre halvdel mørk, høyre lys) og litt gjennomsiktighet"""
        im = Image.new('RGBA', (w, h), farger[0] + (255,)); px = im.load()
        for y in range(h):
            for x in range(w):
                c = farger[(y * len(farger)) // h]; k = (.55 + .45 * x / w) if hard else 1; s = ((x // 24 + y // 24) % 2) * 14
                px[x, y] = (min(255, int(c[0] * k) + s), min(255, int(c[1] * k) + s), min(255, int(c[2] * k) + s), 255)
        for y in range(40, 90):
            for x in range(40, 90): px[x, y] = (0, 0, 0, 0)
        return im
    with tempfile.TemporaryDirectory() as tmp:
        sti = pathlib.Path(tmp) / 'gulv_planker.png'; rå = proveflate(1024, 1024, [(40, 70, 30), (60, 100, 40), (30, 60, 24)]); rå.save(sti)
        ut = BB.behandle(sti, man['gulv_planker']); for_ = BB.saum(rå.convert('RGB').resize((512, 512), Image.LANCZOS), 'x')[0]; etter = BB.saum(ut, 'x')[0]
        sjekk('bildeløpet: et gulv med hard søm blir 512 x 512 uten gjennomsiktighet, og sømmen minst halvert', ut.size == (512, 512) and ut.mode == 'RGB' and etter <= for_ * .5, (ut.size, ut.mode, round(for_, 1), round(etter, 1)))
        sti = pathlib.Path(tmp) / 'vegg_panel.png'; proveflate(1536, 1024, [(220, 212, 173)] * 5 + [(111, 138, 85)] * 4 + [(59, 51, 34)], False).save(sti)
        vut = BB.behandle(sti, man['vegg_panel'])
        sjekk('bildeløpet: en vegg på 1536 x 1024 til en vegg på 2,3 meter blir 442 x 294', vut.size == (442, 294), vut.size)
        def data_url(im):
            b = io.BytesIO(); im.save(b, 'WEBP', quality=85); return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()
        panel_url, bakke_url = data_url(vut), data_url(ut)
    # de genererte listene: alle teksturer som ikke er levert, står i liste 11 og 12, med filnavn, nøkkel, referanse og prompt
    tl = ROT50 / 'tegnelister'; teks = [k for k, m in man.items() if m.get('flis')]
    levert = {p.stem for p in (ROT50 / 'assets' / 'ferdig').glob('*.*')} if (ROT50 / 'assets' / 'ferdig').exists() else set()
    tekst = ''.join((tl / f).read_text(encoding='utf-8') for f in ('11_vegger.md', '12_gulv.md') if (tl / f).exists())
    poster = re.findall(r'(?m)^## (1[12][a-z])\. .*\n\nFilnavn: `([a-z0-9_]+)\.png`\n\nGir: `([a-z0-9_]+)`\n\nBrukes i: .*\n\nReferanse \(last opp sammen med prompten\): `tegnelister/referanse/ref_\2\.png`\n\n!\[[^\]]*\]\(referanse/ref_\2\.png\)\n\n```text\n(?:FLOOR|WALL|GROUND) texture \2: ', tekst)
    mangler = sorted(set(teks) - levert)
    sjekk('tegneliste 11 og 12 har hver tekstur som mangler, med filnavn, nøkkel, referansebilde og prompt', len(teks) == 30 and sorted(p[1] for p in poster) == mangler and all(p[1] == p[2] and (tl / 'referanse' / f'ref_{p[1]}.png').exists() for p in poster), (len(teks), len(poster), len(mangler)))
    stil = re.search(r'## Stilblokk for teksturer.*?```text\n(.*?)\n```', tekst, re.S)
    sjekk('stilblokken for teksturer ber om et helt dekket bilde, ikke gjennomsiktig bakgrunn', bool(stil) and 'OPAQUE' in stil.group(1) and 'TRANSPARENT background' not in stil.group(1))
    les = (tl / 'LESMEG.md').read_text(encoding='utf-8'); csvn = [r for r in (tl / 'tegneliste.csv').read_text(encoding='utf-8').splitlines()[1:] if r.split(';')[2:3] == ['tekstur']]
    sjekk('LESMEG og regnearket har liste 11 og 12', '11_vegger.md' in les and '12_gulv.md' in les and len(csvn) == len(mangler), len(csvn))

    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await pg.goto(URL); await pg.wait_for_timeout(2000); await pg.evaluate("() => localStorage.clear()")
    await start_lop(pg)
    tk = await pg.evaluate("""async ([panel, bakke]) => { const G = MORBIDIUM, vent = t => new Promise(r => setTimeout(r, t)), ut = {};
          const bygg = async d => { G.run.dromVent = 0; startFloor(d, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } await vent(150); };
          const vegg = st => { const m = Paint.mesh.vegger.find(v => v.userData.veggStil === st); return m && m.material.map; }, mål = t => t && [t.image.width, t.image.height, t.fraBilde || ''];
          const last = (k, src) => new Promise(r => { SPRITES[k] = src; const im = Art.img[k] = new Image(); im.onload = im.onerror = () => r(im.naturalWidth); im.src = src; });
          delete Art.img.gulv_gress; // Toms gressbilde (levert 27.9.) tas ut, så bakken males av koden
          delete SPRITES.vegg_panel; delete Art.img.vegg_panel; // og panelveggen fra veggprøven (levert 28.9.), så veggen males av koden
          await bygg(2); ut.malt = mål(vegg('panel')); await bygg(1); ut.maltBakke = mål(Paint.mesh.bakke.material.map); ut.vaer1 = G.F.vaer;
          ut.lastet = [await last('vegg_panel', panel), await last('gulv_gress', bakke)];
          await bygg(2); const t = vegg('panel'); ut.panel = mål(t); ut.rep = t && +t.repeat.x.toFixed(4);
          await bygg(3); ut.panel3 = mål(vegg('panel')); // Underetasjen har egne farger (vegg_panel_3), og uten det bildet maler koden
          await bygg(1); const bk = Paint.mesh.bakke.material.map; ut.bakke = mål(bk); ut.bakkeRep = +(bk.repeat.x * 4 - G.F.W).toFixed(2);
          const c0 = R.coarse; R.coarse = true; await bygg(1); ut.bakkeTlf = mål(Paint.mesh.bakke.material.map);
          // en drøm på telefon: gulvet er høyst 1200 punkter bredt, kartet får det fortsatt, og veggene beholder drømmens farger
          G.run.dromVent = 2; startFloor(2, false); await vent(200); ut.drom = !!G.drom; const gm = Paint.mesh.gulv.material.map.image; ut.dromGulv = gm.width; ut.dromKart = Kart.gulvBilde() === gm;
          ut.dromVegger = Paint.mesh.vegger.filter(v => v.material.map.fraBilde).length; R.coarse = c0; Drom.hopp(); await vent(200);
          // et bilde som ikke er pakket ut ennå, males først og byttes når det kommer; et ødelagt bilde males av koden
          const ny = document.createElement('canvas'); ny.width = 300; ny.height = 200; const ng = ny.getContext('2d'); ng.fillStyle = '#' + (Math.random() * 0xffffff | 0).toString(16).padStart(6, '0'); ng.fillRect(0, 0, 300, 200);
          SPRITES.vegg_mur = ny.toDataURL(); delete Art.img.vegg_mur; const tm = Paint.wallTex(G.th, 'mur', G.F); ut.sakte = [tm.image.width]; // en ny adresse, så nettleseren ikke har bildet ferdig fra før
          for (let i = 0; i < 100 && !tm.fraBilde; i++) await vent(50); ut.sakte.push(tm.image.width, tm.fraBilde || ''); tm.dispose();
          SPRITES.vegg_tre = 'data:image/webp;base64,AAAA'; delete Art.img.vegg_tre; const tf = Paint.wallTex(G.th, 'tre', G.F); await vent(300); const tf2 = Paint.wallTex(G.th, 'tre', G.F);
          ut.odelagt = [tf.image.width, !!tf.fraBilde, tf2.image.width, !!tf2.fraBilde]; tf.dispose(); tf2.dispose(); delete SPRITES.vegg_mur; delete SPRITES.vegg_tre;
          // lette teksturer maler som før; Enkel grafikk tar bildet og bygger uten feil
          R.lowTex = true; await bygg(2); ut.lowTex = mål(vegg('panel')); R.lowTex = false;
          const s = G.meta.settings; s.simple = true; applySettings(); await bygg(2); ut.enkel = mål(vegg('panel')); s.simple = false; applySettings(); await bygg(2);
          return ut; }""", [panel_url, bakke_url])
    sjekk('uten bilder er veggen og bakken malt som før (256 punkter bred)', tk['malt'][:2] == [256, 296] and tk['malt'][2] == '' and tk['maltBakke'] == ([512, 512, ''] if tk.get('vaer1') == 'sno' else [256, 256, '']), [tk['malt'], tk['maltBakke'], tk.get('vaer1')])
    sjekk('panelveggen fra bildet er 442 x 294 og gjentas hver 3,45 rute (repeat .5797)', tk['lastet'][0] == 442 and tk['panel'] == [442, 294, 'vegg_panel'] and abs(tk['rep'] - .5797) < .001, [tk['panel'], tk['rep']])
    sjekk('i Underetasjen maler koden panelveggen når vegg_panel_3 mangler', tk['panel3'][0] == 256 and tk['panel3'][2] == '', tk['panel3'])
    sjekk('bakken i Parken fra bildet er 512 punkter over 4 x 4 ruter, 256 på telefon', tk['bakke'] == [512, 512, 'gulv_gress'] and tk['bakkeRep'] == 48 and tk['bakkeTlf'] == [256, 256, 'gulv_gress'], [tk['bakke'], tk['bakkeRep'], tk['bakkeTlf']])
    sjekk('en drøm på telefon har et gulv på høyst 1200 punkter, kartet får det, og veggene tar ikke bildene', tk['drom'] and 0 < tk['dromGulv'] <= 1200 and tk['dromKart'] and tk['dromVegger'] == 0, [tk['dromGulv'], tk['dromKart'], tk['dromVegger']])
    sjekk('et bilde som pakkes ut, males først og byttes når det kommer; et ødelagt bilde males av koden', tk['sakte'] == [256, 442, 'vegg_mur'] and tk['odelagt'] == [256, False, 256, False], [tk['sakte'], tk['odelagt']])
    sjekk('lette teksturer maler veggen, og Enkel grafikk tar bildet', tk['lowTex'][0] == 256 and tk['lowTex'][2] == '' and tk['enkel'] == [442, 294, 'vegg_panel'], [tk['lowTex'], tk['enkel']])
    await pg.screenshot(path='/tmp/e_50_2d.png')
    sjekk('ingen konsollfeil (teksturer i 2D)', not pg.errs, pg.errs[:6])
    await pg.close()
    # 3D: rommene får samme tekstur i sine egne materialer, og en etasje med bilder bygget på nytt holder grafikkminnet i ro
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await pg.goto(URL3D); await pg.wait_for_timeout(2500); await pg.evaluate("() => localStorage.clear()")
    await start_lop(pg, url=URL3D)
    t3 = await pg.evaluate("""async ([panel, bakke]) => { const G = MORBIDIUM, vent = t => new Promise(r => setTimeout(r, t)), ut = {};
          const bygg = async d => { G.run.dromVent = 0; startFloor(d, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } await vent(300); };
          const last = (k, src) => new Promise(r => { SPRITES[k] = src; const im = Art.img[k] = new Image(); im.onload = im.onerror = () => r(im.naturalWidth); im.src = src; });
          await last('vegg_panel', panel); await last('gulv_gress', bakke); await bygg(2); await bygg(1);
          const mem = () => R.renderer.info.memory; await bygg(2); const m0 = [mem().textures, mem().geometries];
          const v = Paint.mesh.vegger.find(v => v.userData.veggStil === 'panel'); ut.d3 = D3.on; ut.map = v && v.material.map && v.material.map.fraBilde; ut.type = v && v.material.type;
          for (const d of [1, 2, 1, 2]) await bygg(d); const m1 = [mem().textures, mem().geometries]; ut.minne = [m1[0] - m0[0], m1[1] - m0[1]]; return ut; }""", [panel_url, bakke_url])
    sjekk('3D: panelveggen bruker bildet i rommets eget materiale', t3['d3'] and t3['map'] == 'vegg_panel' and t3['type'] != 'MeshBasicMaterial', t3)
    sjekk('3D: etasjer med bilder bygget på nytt holder grafikkminnet i ro', t3['minne'][0] <= 6 and t3['minne'][1] <= 12, t3['minne'])
    await pg.screenshot(path='/tmp/e_50_3d.png')
    sjekk('ingen konsollfeil (teksturer i 3D)', not pg.errs, pg.errs[:6])
    await pg.close()


async def del_52(b):
    # 52) Vinter
    #     Snøen på gulvet er ett lag over hele uteområdet (ingen kutt langs rutene), dekker 75 til 85 % og er aldri helt hvit,
    #     veggene mot snøen får hvit topp og et snøbånd, bakken ute er snø, lyset er kaldere, og etasjer uten snø har ingen snø
    V52 = """() => { const G = MORBIDIUM, finn = v => { for (let s = 1; s < 900; s++) if (v(generateFloor(s + 7919, 1, {}))) return s; return null; };
          window._v52 = { sno: finn(F => F.vaer === 'sno' && F.rooms.some(r => r.template === 'liggehall')), regn: finn(F => F.vaer === 'regn') }; return window._v52; }"""
    # dekket, kuttene langs rutene, veggene, toppene og bakken i etasjen som står
    MAAL52 = """() => { const G = MORBIDIUM, F = G.F, c = Paint.mesh.gulv.material.map.image, T = c.width / F.W, d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, cw = c.width;
          const lum = k => (.2126 * d[k] + .7152 * d[k + 1] + .0722 * d[k + 2]) / 255, ute = i => { if (!F.tiles[i]) return false; const rid = F.roomId[i]; return rid >= 0 ? !!F.rooms[rid].ute : !!F.ute; };
          const mulberry32 = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
          const snoFarge = k => Math.abs(d[k] - 228) + Math.abs(d[k + 1] - 235) + Math.abs(d[k + 2] - 243) < 12 || Math.abs(d[k] - 179) + Math.abs(d[k + 1] - 191) + Math.abs(d[k + 2] - 210) < 8;
          const r1 = mulberry32(5); let n = 0, lys = 0, maks = 0, sf = 0;
          for (let t = 0; t < 100000 && n < 400; t++) { const x = r1() * F.W, z = r1() * F.H; if (!ute(Math.floor(z) * F.W + Math.floor(x))) continue; const k = (Math.floor(z * T) * cw + Math.floor(x * T)) * 4; n++; if (lum(k) > .72) lys++; if (snoFarge(k)) sf++; maks = Math.max(maks, d[k], d[k + 1], d[k + 2]); }
          // 200 rutegrenser mellom to uteruter: forskjellen over grensen mot forskjellen mellom to kolonner midt i ruta. Bare par der minst
          // ett punkt er snø (lysstyrke over .72) telles: bar bakke har sine egne fuger langs rutene, og det er ikke snøen som er kuttet
          const r2 = mulberry32(9), d2 = (a, b) => { const x = lum(a), y = lum(b); return Math.max(x, y) > .72 ? Math.abs(x - y) : 0; }; let over = 0, inne = 0, nb = 0;
          for (let t = 0; t < 50000 && nb < 200; t++) { const x = 1 + Math.floor(r2() * (F.W - 1)), z = 1 + Math.floor(r2() * (F.H - 1)), i = z * F.W + x, loddrett = nb % 2 === 0, j = loddrett ? i - 1 : i - F.W; if (!ute(i) || !ute(j)) continue;
            for (let k = 2; k < T - 2; k++) { if (loddrett) { const y = z * T + k, p = (y * cw + x * T - 1) * 4, q = (y * cw + x * T + T / 2 - 1) * 4; over += d2(p, p + 4); inne += d2(q, q + 4); }
              else { const xx = x * T + k, p = ((z * T - 1) * cw + xx) * 4, q = ((z * T + T / 2 - 1) * cw + xx) * 4; over += d2(p, p + cw * 4); inne += d2(q, q + cw * 4); } }
            nb++; }
          const sv = Paint.mesh.vegger.filter(m => m.userData.sno), hk = sv.find(m => m.userData.veggStil === 'hekk') || sv.find(m => !(VEGG[m.userData.veggStil] || {}).alfa);
          let topp12 = 0; if (hk) { const im = hk.material.map.image, dd = im.getContext('2d').getImageData(0, 0, im.width, 12).data; for (let k = 0; k < dd.length; k += 4) topp12 += (.2126 * dd[k] + .7152 * dd[k + 1] + .0722 * dd[k + 2]) / 255; topp12 /= dd.length / 4; }
          const ca = Paint.mesh.topp.geometry.attributes.color.array; let snoTopp = 0; for (let k = 0; k < ca.length; k += 3) if (Math.abs(ca[k] - .875) < .05 && Math.abs(ca[k + 1] - .902) < .05 && Math.abs(ca[k + 2] - .937) < .05) snoTopp++;
          const bk = Paint.mesh.bakke.material.map, bi = bk.image, bd = bi.getContext ? bi.getContext('2d').getImageData(0, 0, bi.width, bi.height).data : null; let bl = 0; if (bd) { for (let k = 0; k < bd.length; k += 16) bl += (.2126 * bd[k] + .7152 * bd[k + 1] + .0722 * bd[k + 2]) / 255; bl /= bd.length / 16; }
          const amb = R.post.uniforms.uAmbient.value;
          // fronter som vender inn i en paviljong (et innerom sør for veggen): ingen av dem har snøbånd og istapper
          const inn = ms => ms.reduce((n, m) => { const p = m.geometry.attributes.position.array; for (let k = 0; k < p.length; k += 18) { const x = Math.floor(p[k] + 1e-4), z = Math.round(p[k + 2]), i = z * F.W + x; if (z < F.H && F.tiles[i] && !ute(i)) n++; } return n; }, 0);
          return { vaer: F.vaer, T, n, innSno: inn(sv), innAlle: inn(Paint.mesh.vegger), dekke: +(lys / Math.max(1, n)).toFixed(3), maks, snoFarge: sf, over: +(over / Math.max(1, nb)).toFixed(3), inne: +(inne / Math.max(1, nb)).toFixed(3), nb,
            snoVegger: sv.length, stil: hk && hk.userData.veggStil, topp12: +topp12.toFixed(3), snoTopp, bakke: +bl.toFixed(3), bakkeRute: +((F.W + 48) / bk.repeat.x).toFixed(2), amb: '#' + amb.getHexString() }; }"""
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg)
    fro = await pg.evaluate(V52)
    m52 = await pg.evaluate("""async () => { const G = MORBIDIUM, vent = t => new Promise(r => setTimeout(r, t)), S = window._v52, ut = {};
          const bygg = async s => { G.run.seed = s; G.run.dromVent = 0; startFloor(1, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } await vent(150); };
          await bygg(S.sno); ut.sno = (""" + MAAL52 + """)(); await bygg(S.regn); ut.regn = (""" + MAAL52 + """)();
          R.lowTex = true; await bygg(S.sno); ut.lett = (""" + MAAL52 + """)(); R.lowTex = false;
          const st = G.meta.settings; st.simple = true; applySettings(); await bygg(S.sno); ut.enkel = (""" + MAAL52 + """)(); st.simple = false; applySettings();
          // byggetiden: hele startFloor med snø, og Paint.level (gulvet, veggene og bakken, der snøen males) med og uten snø på samme etasje.
          // Uten snø er startFloor minus forskjellen; beste av fem (maskinen er delt, så ett av tre kunne bli forstyrret)
          const ts = [], ls = [], lr = [], ferdig = () => Paint.mesh.gulv.material.map.image.getContext('2d').getImageData(0, 0, 1, 1); // lerretet tegnes først når det leses
          for (let k = 0; k < 5; k++) { G.run.seed = S.sno; G.run.dromVent = 0; let t0 = performance.now(); startFloor(1, false); ferdig(); ts.push(performance.now() - t0); await vent(100);
            const Fr = Object.assign({}, G.F, { vaer: 'regn' }); t0 = performance.now(); Paint.level(Fr, G.th); ferdig(); lr.push(performance.now() - t0); await vent(50);
            t0 = performance.now(); Paint.level(G.F, G.th); ferdig(); ls.push(performance.now() - t0); await vent(100); }
          const a = Math.min(...ts), b = Math.min(...ls), c = Math.min(...lr); ut.tid = [Math.round(a), Math.round(a - (b - c)), Math.round(b), Math.round(c)];
          await bygg(S.sno); const P = G.player, r = G.F.rooms.find(r => r.template === 'liggehall'); for (const e of G.enemies) if (e.alive) killEntity(e, {}); G.combat = null; G.lock = null;
          P.x = r.x + r.w / 2; P.z = r.z + r.h / 2; P.invuln = 999; R.snapCamera(P.x, P.z); return ut; }""")
    s5, r5, l5, e5 = m52['sno'], m52['regn'], m52['lett'], m52['enkel']
    sjekk('vinter: frøene finnes (Parken med snø og liggehall, og Parken i regn)', fro['sno'] is not None and fro['regn'] is not None and s5['vaer'] == 'sno' and r5['vaer'] == 'regn', fro)
    sjekk('vinter: snøen dekker minst 70 % av uterutene (lysstyrke over .72), og ingen punkter er helt hvite', s5['n'] == 400 and s5['dekke'] >= .7 and s5['maks'] < 250, s5)
    sjekk('vinter: ingen kutt langs rutene (forskjellen over 200 rutegrenser er høyst 1,5 ganger den midt i rutene)', s5['nb'] == 200 and s5['over'] <= 1.5 * s5['inne'], (s5['over'], s5['inne'], s5['nb']))
    sjekk('vinter: veggene mot snøen har snøbånd (øverste 12 punkter lyse) og hvit topp', s5['snoVegger'] > 0 and s5['topp12'] > .8 and s5['snoTopp'] > 0, (s5['snoVegger'], s5['stil'], s5['topp12'], s5['snoTopp']))
    sjekk('vinter: fronter som vender inn i en paviljong har ikke snøbånd eller istapper', s5['innAlle'] > 0 and s5['innSno'] == 0, (s5['innAlle'], s5['innSno']))
    sjekk('vinter: bakken ute er snø (Toms snøbilde hver fjerde rute, malt hver tiende), og lyset er kaldere', s5['bakke'] > .7 and min(abs(s5['bakkeRute'] - 4), abs(s5['bakkeRute'] - 10)) < .01 and s5['amb'] != r5['amb'], (s5['bakke'], s5['bakkeRute'], s5['amb'], r5['amb']))
    sjekk('vinter: en Parken uten snø har ingen snøfarger, snøvegger, snøtopper eller snøbakke', r5['snoFarge'] <= 2 and r5['snoVegger'] == 0 and r5['snoTopp'] == 0 and r5['bakke'] < .5 and min(abs(r5['bakkeRute'] - 4), abs(r5['bakkeRute'] - 5)) < .01, r5)
    sjekk('vinter: lette teksturer og Enkel grafikk har også snøen', l5['T'] == 16 and l5['dekke'] >= .6 and l5['maks'] < 250 and e5['dekke'] >= .7 and e5['snoVegger'] > 0, (l5['T'], l5['dekke'], e5['dekke'], e5['snoVegger']))
    sjekk('vinter: etasjen med snø bygges på høyst 1,3 ganger tiden uten (samme frø, beste av fem: startFloor, uten snø, Paint.level med og uten)', m52['tid'][0] <= 1.3 * m52['tid'][1], m52['tid'])
    await pg.wait_for_timeout(800); await pg.screenshot(path='/tmp/e_52_vinter_2d.png')
    sjekk('ingen konsollfeil (vinter, 2D)', not pg.errs, pg.errs[:6])
    await pg.close()
    # 3D: kaldt lys fra snøen, lavere relieff, lys tåke, og snøetasjer bygget på nytt holder grafikkminnet i ro
    for vp, navn in (({'width': 1280, 'height': 720}, '1280'), ({'width': 390, 'height': 844}, '390x844')):
        pg = await ny_side(b, viewport=vp, **({'is_mobile': True, 'has_touch': True} if vp['width'] < 600 else {}))
        await start_lop(pg, url=URL3D)
        await pg.evaluate(V52)
        d3 = await pg.evaluate("""async (mobil) => { const G = MORBIDIUM, vent = t => new Promise(r => setTimeout(r, t)), S = window._v52, ut = {};
              const bygg = async s => { G.run.seed = s; G.run.dromVent = 0; startFloor(1, false); await vent(300); };
              const lys = () => { const h = D3.ting.find(o => o.isHemisphereLight), g = Paint.mesh.gulv.material; return { hemi: h && '#' + h.groundColor.getHexString(), mane: D3.mane && +D3.mane.intensity.toFixed(2), bump: g.bumpScale, farge: g.color && '#' + g.color.getHexString(), type: g.type }; };
              await bygg(S.regn); ut.regn = lys(); await bygg(S.sno); ut.sno = lys();
              if (!mobil) { const mem = () => R.renderer.info.memory, m0 = [mem().textures, mem().geometries]; for (const s of [S.regn, S.sno, S.regn, S.sno]) await bygg(s); ut.minne = [mem().textures - m0[0], mem().geometries - m0[1]]; }
              const P = G.player, r = G.F.rooms.find(r => r.template === 'liggehall'); for (const e of G.enemies) if (e.alive) killEntity(e, {}); G.combat = null; G.lock = null;
              P.x = r.x + r.w / 2; P.z = r.z + r.h / 2; P.invuln = 999; R.snapCamera(P.x, P.z); ut.d3 = D3.on; return ut; }""", vp['width'] < 600)
        if vp['width'] > 600:
            sjekk('vinter i 3D: blått lys fra snøen, sterkere måne, lavere relieff og dempet gulv, og regnværet er som før', d3['d3'] and d3['sno']['hemi'] == '#4a5470' and d3['sno']['mane'] > d3['regn']['mane'] and abs(d3['sno']['bump'] - .45) < .01 and d3['sno']['farge'] != '#ffffff' and d3['regn']['hemi'] == '#2a1a14' and abs(d3['regn']['bump'] - .7) < .01 and d3['regn']['farge'] == '#ffffff', d3)
            sjekk('vinter i 3D: snøetasjer bygget på nytt holder grafikkminnet i ro', d3['minne'][0] <= 6 and d3['minne'][1] <= 12, d3['minne'])
        await pg.evaluate("async () => { const G = MORBIDIUM, g0 = G.time, t0 = performance.now(); while (G.time - g0 < 1 && performance.now() - t0 < 20000) await new Promise(r => setTimeout(r, 50)); }")
        await pg.screenshot(path=f'/tmp/e_52_vinter_{navn}.png')
        sjekk(f'ingen konsollfeil (vinter, 3D {navn})', not pg.errs, pg.errs[:6])
        await pg.close()


async def del_57(b):
    # 57) Snøfall
    #     Snøen faller i tre lag på skjermkortet i stedet for 220 harde firkanter i en fast boks (6.png): midtlaget er Vaer.obj med vindsus,
    #     to lag på lav kvalitet, boksen dekker det som synes på PC, stående og liggende telefon og med kameraavstand 1,25, tiden følger
    #     spilltiden, alt ryddes når været stopper, enkel grafikk gir runde prikker i stedet for firkanter, gasslyktene får snø i lyset i stedet
    #     for møll, sirissene tier og vindsuset øker i kastene, og snøen koster høyst tre tegnekall.
    HJELP57 = """const G = MORBIDIUM, vent = t => new Promise(r => setTimeout(r, t)), ramme = n => new Promise(r => { const f = () => --n <= 0 ? r() : requestAnimationFrame(f); requestAnimationFrame(f); }),
            spill = async t => { Klokke.spol(t); }, ut = {};
          // det synlige rektangelet i høyden h, fra hjørnene av bildet langs kameraets retning (uavhengig av hvordan snøen regner boksen)
          const synlig = h => { const c = R.camera, f = new THREE.Vector3(); c.getWorldDirection(f); const r = { x0: 1e9, x1: -1e9, z0: 1e9, z1: -1e9 };
            for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const p = new THREE.Vector3(a, b, -1).unproject(c); p.addScaledVector(f, (h - p.y) / f.y); r.x0 = Math.min(r.x0, p.x); r.x1 = Math.max(r.x1, p.x); r.z0 = Math.min(r.z0, p.z); r.z1 = Math.max(r.z1, p.z); } return r; };
          const dekker = () => { const B = window.Sno && Sno.boks(); if (!B) return { ok: false, B }; const a = synlig(0), b = synlig(B.ytop * .98), inn = r => r.x0 >= B.x0 && r.x1 <= B.x1 && r.z0 >= B.z0 && r.z1 <= B.z1;
            return { ok: inn(a) && inn(b), rimelig: B.x1 - B.x0 <= a.x1 - a.x0 + 4 && B.z1 - B.z0 <= b.z1 - a.z0 + 4, B: [B.x0, B.x1, B.z0, B.z1].map(v => +v.toFixed(1)), bunn: [a.x0, a.x1, a.z0, a.z1].map(v => +v.toFixed(1)), topp: [b.z0, b.z1].map(v => +v.toFixed(1)) }; };
          const snoEtasje = async () => { let s = 1; for (; s < 600; s++) { const F = generateFloor(s + 7919, 1, {}); if (F.vaer === 'sno' && F.rooms.some(r => r.ute && r.template === 'hage')) break; }
            G.run.seed = s; startFloor(1, false); for (let i = 0; i < 40 && G.drom; i++) { Drom.hopp(); await vent(100); } rolig(); R.shakeOn = false; const P = G.player; P.hp = P.maxHp = 1e6; P.invuln = 999;
            const L = G.props.find(o => o.kind === 'lyktestolpe'), c = L ? freeSpot(L.x + 2, L.z + 1, 3) : P; P.x = c.x; P.z = c.z; P.vx = P.vz = 0; R.snapCamera(P.x, P.z); await spill(.4); return s; };
          const kall = () => { const info = R.renderer.info; info.autoReset = false; info.reset(); R.render(0); const n = info.render.calls; info.autoReset = true; return n; };"""
    LOGIKK57 = """async () => { """ + HJELP57 + """
          ut.frø = await snoEtasje(); const F = G.F, har = !!window.Sno;
          ut.lag = { vaer: F.vaer, n: har ? Sno.lag.length : -1, midt: har && Sno.lag.length > 1 && Vaer.obj === Sno.lag[1].pts, points: !!(Vaer.obj && Vaer.obj.isPoints), shader: !!(Vaer.obj && Vaer.obj.material.isShaderMaterial), lyd: Sound.vaerType };
          // tiden i shaderen følger spilltiden og står i pausen
          if (har) { const t0 = Sno.U.uTid.value, g0 = G.time; await spill(.5); ut.tid = { spill: +(G.time - g0).toFixed(3), sno: +(Sno.U.uTid.value - t0).toFixed(3) }; G.state = 'panel'; const t1 = Sno.U.uTid.value; await vent(400); ut.tid.pause = Sno.U.uTid.value - t1; G.state = 'play'; }
          // gasslyktene har snø i lyset og ingen møll
          const E = Glod.liste.filter(E => E.eier && E.eier.kind === 'lyktestolpe'); ut.lykt = { lykter: G.props.filter(o => o.kind === 'lyktestolpe').length, sno: E.filter(E => E.type === 'lyssno').length, moll: E.filter(E => E.type === 'moll').length };
          // ingen sirisser, og vindsuset øker i et kast
          Stemning.etasje = G.depth; if (har) Sno.kast = 0; const M0 = Stemning.maal(); if (har) Sno.kast = 1; const M1 = Stemning.maal(); if (har) Sno.kast = 0;
          ut.lyd = { natt: 'amb_natt' in M0, vind0: M0.amb_vind ? +M0.amb_vind[0].toFixed(3) : 0, vind1: M1.amb_vind ? +M1.amb_vind[0].toFixed(3) : 0 };
          // tegnekall: snøen mot ingen snø
          await ramme(2); const k1 = kall(); const lag = har ? Sno.lag.map(L => L.pts) : []; const info = R.renderer.info; await ramme(2); const g1 = info.memory.geometries, t1 = info.memory.textures;
          Vaer.stopp(); await ramme(3); const k0 = kall(), g0 = info.memory.geometries, t0 = info.memory.textures;
          ut.kall = { med: k1, uten: k0 }; ut.rydd = { g1, g0, t1, t0, iScenen: lag.filter(o => o.parent).length + R.scene.children.filter(o => o.userData && o.userData.sno).length, obj: Vaer.obj, type: Vaer.type, lyd: Sound.vaerType || null };
          // en runde til: tilbake til det samme
          Vaer.start(F); await ramme(3); const g2 = info.memory.geometries; Vaer.stopp(); await ramme(3); ut.rydd.igjen = [g2, info.memory.geometries];
          // enkel grafikk: ingen lag på skjermkortet, de gamle prikkene er runde og holder seg i en boks som følger kameraet
          R.safe = true; Vaer.start(F); const V = Vaer, m = V.obj && V.obj.material; await spill(.6);
          let paa = 0, levende = 0; if (V.obj) for (let i = 0; i < V.n; i++) { const y = V.p[i * 3 + 1]; if (y < -40) continue; levende++; const q = R.project(V.p[i * 3], y, V.p[i * 3 + 2]); if (q.x >= 0 && q.x <= innerWidth && q.y >= 0 && q.y <= innerHeight) paa++; }
          ut.enkel = { lag: har ? Sno.lag.length : -1, points: !!(V.obj && V.obj.isPoints), kart: !!(m && m.map), str: m ? m.size : 0, andel: +(paa / Math.max(1, levende)).toFixed(2), type: V.type };
          R.safe = false; Vaer.start(F); await spill(.3);
          return ut; }"""
    DEKNING57 = """async (kamera) => { """ + HJELP57 + """
          R.view = 11.5 * kamera; R.resize(); await spill(.3); await ramme(2); return dekker(); }"""
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg)
    ut = await pg.evaluate(LOGIKK57)
    la = ut['lag']
    sjekk('snøen faller i tre lag på skjermkortet, og midtlaget er Vaer.obj med vindsus (del 37)', la['vaer'] == 'sno' and la['n'] == 3 and la['midt'] and la['points'] and la['shader'] and la['lyd'] == 'vind', la)
    ti = ut.get('tid', {})
    sjekk('fnuggene faller med spilltiden og står stille i pausen', ti and abs(ti['sno'] - ti['spill']) < 1e-3 and ti['spill'] > .4 and ti['pause'] == 0, ti)
    sjekk('gasslyktene har snø i lyset og ingen møll når det snør', ut['lykt']['lykter'] > 0 and ut['lykt']['sno'] >= ut['lykt']['lykter'] and ut['lykt']['moll'] == 0, ut['lykt'])
    sjekk('ingen sirisser mens det snør, og vindsuset øker i kastene', not ut['lyd']['natt'] and ut['lyd']['vind0'] > 0 and ut['lyd']['vind1'] >= 1.7 * ut['lyd']['vind0'], ut['lyd'])
    sjekk('snøen koster høyst tre tegnekall (2D)', 2 <= ut['kall']['med'] - ut['kall']['uten'] <= 3, ut['kall'])
    rd = ut['rydd']
    sjekk('Vaer.stopp rydder snøen: geometriene tilbake, ingen lag i scenen, ingen lyd', rd['g0'] <= rd['g1'] - 3 and rd['igjen'][1] == rd['g0'] and rd['igjen'][0] == rd['g1'] and rd['t0'] < rd['t1'] and rd['iScenen'] == 0 and rd['obj'] is None and rd['type'] is None and rd['lyd'] is None, rd)
    en = ut['enkel']
    sjekk('enkel grafikk: ingen snø på skjermkortet, de gamle prikkene er runde, og de fleste synes', en['lag'] == 0 and en['points'] and en['kart'] and en['str'] >= 4 and en['andel'] >= .6 and en['type'] == 'sno', en)
    for navn, vp, kam in (('PC 1280x720', (1280, 720), 1), ('stående telefon 390x844', (390, 844), 1), ('liggende telefon 844x390', (844, 390), 1), ('PC med kameraavstand 1,25', (1280, 720), 1.25), ('stående telefon med kameraavstand 1,25', (390, 844), 1.25)):
        await pg.set_viewport_size({'width': vp[0], 'height': vp[1]}); await pg.wait_for_timeout(500)
        d = await pg.evaluate(DEKNING57, kam)
        sjekk(f'boksen snøen faller i dekker det som synes fra bakken til toppen ({navn}), og er ikke mye større', d['ok'] and d['rimelig'], d)
    sjekk('ingen konsollfeil (snøfall)', not pg.errs, pg.errs[:6])
    await pg.close()
    UA57 = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    # og i 3D: tre lag på høy, to på lav, lyset fra lampene og tegnekallene, med skjermbilder på PC og stående telefon
    for navn, kw in (('1280', {'viewport': {'width': 1280, 'height': 720}}), ('390', {'viewport': {'width': 390, 'height': 844}, 'has_touch': True, 'is_mobile': True, 'device_scale_factor': 2, 'user_agent': UA57})):
        pg = await ny_side(b, **kw)
        await start_lop(pg, url=URL3D)
        ut = await pg.evaluate("""async () => { """ + HJELP57 + """
              ut.frø = await snoEtasje(); await spill(1.5); const har = !!window.Sno;
              ut.d3 = D3.on && D3.bygd; ut.kval = D3.kval(); ut.lag = har ? Sno.lag.length : -1; ut.lys = har ? Sno.U.uLysF.value.filter(v => v.x + v.y + v.z > .05).length : 0; ut.dekker = dekker().ok;
              const k1 = kall(); Vaer.stopp(); const k0 = kall(); ut.kall = k1 - k0;
              G.meta.settings.kvalitet = 1; ut.lavKval = D3.kval(); Vaer.start(G.F); ut.lav = har ? Sno.lag.length : -1; G.meta.settings.kvalitet = 0; Vaer.start(G.F); await spill(1.5);
              return ut; }""")
        await pg.screenshot(path=f'/tmp/e_57_sno_{navn}.png')
        sjekk(f'3D ({navn}): tre lag på {ut["kval"]}, to på lav, lyset fra lampene når fnuggene, boksen dekker bildet og høyst tre tegnekall', ut['d3'] and ut['lag'] == 3 and ut['lavKval'] == 'lav' and ut['lav'] == 2 and ut['lys'] >= 1 and ut['dekker'] and 2 <= ut['kall'] <= 3, ut)
        sjekk(f'ingen konsollfeil (snøfall i 3D, {navn})', not pg.errs, pg.errs[:6])
        await pg.close()


async def del_64(b):
    # 64) Kameraprøven og den nye etterbehandlingen: ?kamera=iso dreier kameraet 45 grader, styringen følger skjermen, dukkene og tingene
    # vender mot kameraet, sideveggene mot kameraet bygges, kartet og N dreies, og veggene nærmest kameraet er lave. Uten valget er alt
    # som før. Omgivelsesskyggen har dybdetekstur bare på høy, disen er på i middels og høy, og ?lys=gammel slår det nye av
    async def kamera(url):
        pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
        await start_lop(pg, url=url)
        await pg.evaluate("() => { const s = MORBIDIUM.meta.settings; s.kvalitet = 3; applySettings(); }")
        await pg.wait_for_timeout(600)
        await pg.keyboard.down('KeyD'); await pg.wait_for_timeout(120)
        r = await pg.evaluate("""() => { const G = MORBIDIUM, P = G.player, A = Input.actions(), c = R.camera.position, F = G.F, W = F.W;
              // sideflater: trekanter der alle tre hjørnene har samme x (planet x = konstant) i veggmeshene
              let side = 0; for (const m of Paint.mesh.vegger || []) { const p = m.geometry.attributes.position.array; for (let i = 0; i < p.length; i += 9) if (p[i] === p[i + 3] && p[i] === p[i + 6] && (p[i + 2] !== p[i + 5] || p[i + 2] !== p[i + 8])) side++; }
              // lave vegger: en vegg med gulv rett vest for seg (og ikke nord) er lav når kameraet står i øst
              let lavVest = 0, hoyVest = 0; for (let z = 1; z < F.H - 1; z++) for (let x = 1; x < W - 1; x++) { const h = Paint.wallH[z * W + x]; if (!h || !F.tiles[z * W + x - 1] || (G.skjult && G.skjult[z * W + x - 1]) || F.tiles[(z - 1) * W + x] || F.tiles[(z - 1) * W + x - 1] || F.tiles[(z - 1) * W + x + 1]) continue; if (h < 1) lavVest++; else hoyVest++; }
              const n = document.querySelector('#mapring .nord');
              return { valg: KAMERA_VALG.navn, dx: c.x - R.camT.x, dz: c.z - R.camT.z, mx: A.mx, mz: A.mz, dukke: P.doll.plane.rotation.y, side, lavVest, hoyVest,
                nord: n ? n.style.left : '', ting: (G.props.find(o => o.g && !o.g.userData.flat && o.g.userData.m) || {}).g?.rotation.y ?? null,
                dybde: !!R.rt.depthTexture, ao: R.post.uniforms.uAo.value, dis: R.post.uniforms.uDis.value, tone: R.post.uniforms.uTone.value, kval: D3.kval(), d3: D3.on }; }""")
        await pg.keyboard.up('KeyD')
        r['middels'] = await pg.evaluate("""async () => { const s = MORBIDIUM.meta.settings; s.kvalitet = 2; applySettings(); await new Promise(f => setTimeout(f, 400)); return { dybde: !!R.rt.depthTexture, ao: R.post.uniforms.uAo.value, dis: R.post.uniforms.uDis.value }; }""")
        r['errs'] = pg.errs[:6]
        await pg.screenshot(path='/tmp/e_64_' + ('iso' if 'iso' in url else 'gammel' if 'gammel' in url else 'standard') + '.png')
        await pg.close()
        return r
    iso = await kamera(URL3D + '?3d&kamera=iso')
    sjekk('kamera=iso: kameraet står skrått (øst og sør for målet), og D går mot høyre på skjermen (sørøst i verden)',
          iso['valg'] == 'iso' and iso['dx'] > 15 and iso['dz'] > 15 and iso['mx'] > .6 and iso['mz'] < -.6, iso)
    sjekk('kamera=iso: dukkene og tingene vender mot kameraet, sideveggene finnes, og veggene med gulv i vest er lave',
          abs(iso['dukke'] - .7854) < .01 and (iso['ting'] is None or abs(iso['ting'] - .7854) < .01) and iso['side'] > 20 and iso['lavVest'] > 0 and iso['hoyVest'] == 0, iso)
    sjekk('kamera=iso: N på kartringen er flyttet', 'calc' in iso['nord'], iso['nord'])
    sjekk('ny etterbehandling på høy: dybdetekstur, omgivelsesskygge, dis og tonekurve; på middels dis uten omgivelsesskygge',
          iso['d3'] and iso['kval'] == 'hoy' and iso['dybde'] and iso['ao'] > 0 and iso['dis'] > 0 and iso['tone'] > 0 and not iso['middels']['dybde'] and iso['middels']['ao'] == 0 and iso['middels']['dis'] > 0, iso)
    sjekk('ingen konsollfeil (kamera=iso)', not iso['errs'], iso['errs'])
    std = await kamera(URL3D + '?3d')
    sjekk('uten valg er kameraet som før: rett nedover gangene, D er rett mot høyre, ingen sidevegger',
          std['valg'] == '' and abs(std['dx']) < .5 and std['mx'] > .99 and abs(std['mz']) < .01 and std['side'] == 0 and abs(std['dukke']) < 1e-6 and std['nord'] == '', std)
    gml = await kamera(URL3D + '?3d&lys=gammel')
    sjekk('lys=gammel slår av dis, omgivelsesskygge og tonekurve', gml['ao'] == 0 and gml['dis'] == 0 and gml['tone'] == 0 and not gml['dybde'], gml)
    # innstillingen Kameravinkel (Bilde) velger vinkelen når spillet lastes, raden med «Last på nytt» kommer når en annen vinkel er valgt
    # enn den som brukes, og adressen går foran innstillingen
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await pg.goto(URL); await pg.wait_for_timeout(2000)
    await pg.evaluate("() => { localStorage.clear(); MORBIDIUM.meta.settings.vinkel = 2; saveMeta(); }")
    await pg.goto(URL); await pg.wait_for_timeout(2000)
    vi = await pg.evaluate("() => ({ navn: KAMERA_VALG.navn, kilde: KAMERA_VALG.kilde, dreid: KAM.dreid, vinkel: MORBIDIUM.meta.settings.vinkel })")
    await klikk(pg, '#tSet'); await pg.wait_for_timeout(300); await klikk(pg, '[data-tab="bilde"]'); await pg.wait_for_timeout(300)
    vi['panel'] = await pg.evaluate("""() => { const i = document.querySelector('#settings [data-s="vinkel"]'), rad = () => { const r = document.getElementById('vinkelRad'); return !!r && getComputedStyle(r).display !== 'none'; };
          const ut = { finnes: !!i, tekst: i ? i.parentNode.querySelector('em').textContent : '', radFor: rad() };
          i.value = 0; i.dispatchEvent(new Event('input', { bubbles: true })); ut.radEtter = rad(); ut.knapp = !!document.getElementById('bVinkel'); ut.lagret = MORBIDIUM.meta.settings.vinkel;
          const f = document.querySelector('#panel .fit').getBoundingClientRect(); ut.plass = f.bottom <= innerHeight + 1 && f.top >= -1; return ut; }""")
    await pg.evaluate("() => { MORBIDIUM.meta.settings.vinkel = 2; saveMeta(); }")
    await pg.goto(URL + '&kamera=standard'); await pg.wait_for_timeout(2000)
    vi['adresse'] = await pg.evaluate("() => ({ navn: KAMERA_VALG.navn, kilde: KAMERA_VALG.kilde, dreid: KAM.dreid })")
    await pg.evaluate("() => { MORBIDIUM.meta.settings.vinkel = 0; saveMeta(); }")
    vi['errs'] = pg.errs[:6]
    await pg.close()
    p = vi['panel']
    sjekk('Kameravinkel i innstillingene: isometrisk brukes når spillet lastes, raden kommer når en annen vinkel velges, og panelet får plass',
          vi['navn'] == 'iso' and vi['kilde'] == 'innstilling' and vi['dreid'] and p['finnes'] and 'isometrisk' in p['tekst'] and not p['radFor'] and p['radEtter'] and p['knapp'] and p['lagret'] == 0 and p['plass'], vi)
    sjekk('adressen (kamera=standard) går foran innstillingen', vi['adresse'] == {'navn': '', 'kilde': 'adresse', 'dreid': False}, vi['adresse'])
    sjekk('ingen konsollfeil (kameravinkel i innstillingene)', not vi['errs'], vi['errs'])


DELER = {28: del_28, 30: del_30, 37: del_37, 38: del_38, 39: del_39, 50: del_50, 52: del_52, 57: del_57, 64: del_64}
