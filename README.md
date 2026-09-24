# Morbidium

Sanntids action-roguelite i et norsk sanatorium fra 1920-tallet. Lovecraft og Hellraiser, men med mørk humor som gjør narr av edgelords. Tegnet i en stil som låner fra Conan Chop Chop og Castle Crashers. Hver pasient våkner et nytt sted, kjemper seg gjennom tre genererte etasjer, samler groteske kuriositeter som kombineres til stadig merkeligere angrep, og dør som regel på en pinlig måte.

## Spill
- Nettleser: https://tombonator3000.github.io/morbidium/
- Tastatur og mus: WASD, mus for å sikte, venstreklikk slag, høyreklikk tungt slag, mellomrom rull, 1 til 4 evner, F flaske, E snakk, Tab journal, Esc pause.
- Håndkontroll og berøring virker også.

## Bygg
```
python3 build.py          # lager dist/morbidium.html
node tools/test_gen.js    # tester generatoren
```

## Mapper
- `src/` kildekode, satt sammen av `build.py`
- `gpt-grafikk/` bilder fra ChatGPT legges her (se `gpt-grafikk/LESMEG.md`)
- `assets/` behandlede bilder: `ferdig/` (klare for spillet), `deler/` (byggeklosser til figurer), `manifest.json`
- `maler/` maler som lastes opp til ChatGPT
- `tools/` verktøy for bilder, tester og manifest
- `DESIGN_BRIEF.md` og `ART_BRIEF.md` for bildegenerering, `AGENTS.md` for regler

## Gjenbruk og takk
- Toon-vannshader tilpasset fra cortiz2894/stylized-components (MIT, Christian Ortiz).
- Partikkelpool etter scottstts/Threejs-Awesome-Graphics-Agent-Skills (MIT).
- Brun støy og tonerekke fra Tombonator3000/the-deep-ones, lydsynth og tidsfall fra Tombonator3000/3044.
- Brogue CE og Shattered Pixel Dungeon som idékilder (ingen kode kopiert).
- Lisens for Morbidium er ikke valgt ennå.
