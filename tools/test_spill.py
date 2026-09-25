"""Spiller gjennom Morbidium i headless Chromium og skriver ut feil fra konsollen.

Bruk:  python3 tools/test_spill.py [--three STI]
  --three STI   serverer three.min.js fra en lokal fil i stedet for cdnjs. Nyttig der
                nettleseren ikke når nettet (som i Claude Code-skyen). Hent fila med
                curl -o three.min.js https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js
                Miljøvariabelen MORBIDIUM_THREE gjør det samme.
Skjermbilder havner i /tmp/p_*.png.
"""
import pathlib, os
import asyncio, sys
from playwright.async_api import async_playwright
THREE = os.environ.get('MORBIDIUM_THREE') or (sys.argv[sys.argv.index('--three') + 1] if '--three' in sys.argv else None)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width':1280,'height':720})
        if THREE: await pg.route('**/three.min.js', lambda r: r.fulfill(path=THREE, content_type='application/javascript'))
        if THREE: await pg.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))  # uten nett: tom skriftfil i stedet for feil
        errs=[]
        pg.on('pageerror', lambda e: errs.append('PAGEERROR: '+str(e)))
        pg.on('console', lambda m: errs.append(m.type+': '+m.text) if m.type=='error' else None)
        async def shot(n): await pg.screenshot(path=f'/tmp/p_{n}.png')
        await pg.goto('' + (pathlib.Path(__file__).resolve().parent.parent / 'dist' / 'morbidium.html').as_uri() + ''); await pg.wait_for_timeout(2500); await shot('1title')
        await pg.click('#tNew'); await pg.wait_for_timeout(600); await shot('2intake')
        await pg.click('[data-awk]'); await pg.wait_for_timeout(1500); await shot('3start')
        # finn et kamprom og gå inn
        await pg.evaluate("""() => { const G = MORBIDIUM, F = G.F; if (G.combat) { for (const e of G.enemies) e.alive && hurt(e, 9999, {from:"player"}); finishCombat(); } const r = F.rooms.find(r => r.role === "combat" && r.waves && r.waves.length); G.player.x = r.x + r.w/2; G.player.z = r.z + r.h/2; }""")
        await pg.wait_for_timeout(2600)
        await pg.mouse.move(700, 380)
        for i in range(6):
            await pg.mouse.down(); await pg.wait_for_timeout(70); await pg.mouse.up(); await pg.wait_for_timeout(110)
        await pg.keyboard.press('Digit1'); await pg.wait_for_timeout(200); await pg.keyboard.press('Digit4'); await pg.wait_for_timeout(400)
        await shot('4combat')
        info = await pg.evaluate("() => ({ state: MORBIDIUM.state, enemies: MORBIDIUM.enemies.length, combat: !!MORBIDIUM.combat, hp: MORBIDIUM.player.hp, slots: MORBIDIUM.run.slots.map(c=>c&&c.id) })")
        print('etter kamp:', info)
        # rydd rommet
        await pg.evaluate("() => { for (const e of MORBIDIUM.enemies) if (e.alive) hurt(e, 9999, { from: 'player' }); }")
        await pg.wait_for_timeout(2500)
        await pg.evaluate("() => { for (const e of MORBIDIUM.enemies) if (e.alive) hurt(e, 9999, { from: 'player' }); }")
        await pg.wait_for_timeout(2500); await shot('5cleared')
        print('ryddet:', await pg.evaluate("() => ({ combat: !!MORBIDIUM.combat, rooms: MORBIDIUM.run.rooms, lock: !!MORBIDIUM.lock })"))
        await pg.keyboard.press('Tab'); await pg.wait_for_timeout(1200); await shot('6journal')
        await pg.keyboard.press('Tab'); await pg.wait_for_timeout(300)
        # tjeneste
        svc = await pg.evaluate("""() => { const G = MORBIDIUM; const n = G.npcs.find(n => !n.invisible) || G.npcs[0]; if (!n) return null; G.player.x = n.x; G.player.z = n.z + 1.3; openService(n.service, n); return n.service; }""")
        await pg.wait_for_timeout(900); await shot('7service'); print('tjeneste:', svc)
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300)
        # boss
        await pg.evaluate("""() => { const G = MORBIDIUM; if (G.combat) finishCombat(); const r = G.F.rooms[G.F.bossId]; G.player.x = r.x + r.w/2; G.player.z = r.z + r.h - 2; G.player.hp = G.player.maxHp; }""")
        await pg.wait_for_timeout(3800); await shot('8boss')
        print('boss:', await pg.evaluate("() => ({ boss: MORBIDIUM.boss && MORBIDIUM.boss.name, state: MORBIDIUM.boss && MORBIDIUM.boss.state })"))
        await pg.evaluate("() => { const B = MORBIDIUM.boss; if (B) hurt(B, 99999, { from: 'player' }); }")
        await pg.wait_for_timeout(4200); await shot('9bossdead')
        print('luke:', await pg.evaluate("() => !!MORBIDIUM.trapdoor"))
        await pg.evaluate("() => descend()"); await pg.wait_for_timeout(1200); await shot('10drom')
        print('drøm:', await pg.evaluate("() => MORBIDIUM.drom ? MORBIDIUM.drom.K.navn : null"))
        await pg.evaluate("() => Drom.hopp()"); await pg.wait_for_timeout(1200); await shot('10floor2')
        print("før død:", await pg.evaluate("() => { const P = MORBIDIUM.player; P.lastCause = \"kultist\"; P.invuln = 0; P.iframe = 0; P.deny = null; const s = MORBIDIUM.state, d = hurt(P, 9999, { type: \"kultist\" }); return { s, d, hp: P.hp, alive: P.alive, depth: MORBIDIUM.depth }; }"))
        await pg.wait_for_timeout(2600); await shot('11death')
        print('state:', await pg.evaluate("() => MORBIDIUM.state"))
        print('\n'.join(errs[:25]) or 'ingen feil')
        await b.close()
asyncio.run(main())
