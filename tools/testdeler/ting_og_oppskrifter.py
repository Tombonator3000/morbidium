"""Apparater, lommerusk, oppskrifter og mestere.

Testdeler fra test_ekstra.py. Kjøres med python3 tools/test_ekstra.py --system ting_og_oppskrifter eller --del N.
"""
from .felles import sjekk, ny_side, start_lop


async def del_7(b):
    # 7) apparater og lommerusk
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg)
    await pg.evaluate("""() => { const G = MORBIDIUM, P = G.player; rolig(); Aktiv.give('defib'); Lomme.give('frosk');
          for (let i = 0; i < 3; i++) { const s = freeSpot(P.x + Math.sin(i * 2) * 2.2, P.z + Math.cos(i * 2) * 2.2, 2); const e = spawnEnemyBareTest('pleier', s.x, s.z); e.cd = 99; } }""")
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
    sjekk('frosken tar det dødelige slaget', await pg.evaluate("() => MORBIDIUM.player.alive && MORBIDIUM.player.hp <= 21 && MORBIDIUM.run.froskBrukt"))
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


async def del_8(b):
    # 8) oppskrifter og mestere
    pg = await ny_side(b, viewport={'width': 1280, 'height': 720})
    await start_lop(pg)
    info = await pg.evaluate("""() => { const G = MORBIDIUM, P = G.player; G.rooms.forEach(s => s.cleared = true); P.hp = P.maxHp = 500; P.teeth = 10; R.view = 15; R.resize();
          const keys = Object.keys(MESTER), out = [];
          keys.forEach((k, i) => { const a = i / keys.length * Math.PI * 2, s = freeSpot(P.x + Math.sin(a) * 4, P.z + Math.cos(a) * 4, 2); const e = spawnEnemy(['pleier', 'kultist', 'byrakrat', 'tvang', 'rotte', 'oppasser'][i % 6], s.x, s.z, false, 2); if (!e.mester) Oppskrift.mester(e, k); else { e.mester = k; } out.push(e.mesterNavn); });
          return { navn: out, labels: document.querySelectorAll('.mester').length }; }""")
    sjekk('mestere får navn og navneskilt', info['labels'] >= 11 and all(info['navn']), info)
    await pg.wait_for_timeout(2500); await pg.screenshot(path='/tmp/e_17mestere.png')
    for_ = await pg.evaluate("() => ({ n: MORBIDIUM.enemies.filter(e => e.alive).length, teeth: MORBIDIUM.player.teeth })")
    await pg.evaluate("() => { for (const e of MORBIDIUM.enemies) if (e.alive && e.mester === 'lommetyv') e.stolen = 5; for (const e of MORBIDIUM.enemies.slice()) if (e.alive && e.mester) hurt(e, 99999, { from: 'player' }); }")
    await pg.wait_for_timeout(150)
    tele = await pg.evaluate("() => Oppskrift.tall.smell")
    await pg.wait_for_timeout(1000)
    etter = await pg.evaluate("() => ({ n: MORBIDIUM.enemies.filter(e => e.alive).length, split: Oppskrift.tall.delt, hp: MORBIDIUM.player.hp })")
    etter['tele'] = tele
    sjekk('todelt mester deler seg i to', etter['split'] >= 2, etter)
    sjekk('eksplosiv mester varsler en eksplosjon når den dør', etter['tele'] > 0, etter)
    await pg.evaluate("() => { for (const e of MORBIDIUM.enemies) if (e.alive) hurt(e, 99999, { from: 'player' }); }")
    await pg.wait_for_timeout(1500)
    # farging og tilbehør på vanlige fiender
    await pg.evaluate("""() => { const G = MORBIDIUM, P = G.player; const cols = ['#6a94c8', '#d880a0', '#7ab888', '#d8b850'];
          for (let i = 0; i < 6; i++) { const s = freeSpot(P.x - 3 + i * 1.3, P.z - 2.2, 2); const e = spawnEnemyBareTest('pleier', s.x, s.z); e.cd = 99; if (i < 4) e.doll.setDye(cols[i]); if (i >= 2) e.doll.addAddon(addonPart(['bart', 'eyeliner', 'glassoye', 'bandasje'][i - 2]), Object.assign({}, LOOKS[['bart', 'eyeliner', 'glassoye', 'bandasje'][i - 2]], { off: Object.fromEntries(Object.entries(LOOKS[['bart', 'eyeliner', 'glassoye', 'bandasje'][i - 2]].off).map(([v, o]) => [v, [o[0], o[1] - .12]])) })); } }""")
    await pg.wait_for_timeout(1500); await pg.screenshot(path='/tmp/e_18farget.png')
    sjekk('ingen konsollfeil (oppskrifter)', not pg.errs, pg.errs[:6])
    await pg.close()


DELER = {7: del_7, 8: del_8}
