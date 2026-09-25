# Morbidium

Sanntids action-roguelite i et norsk sanatorium fra 1920-tallet. Lovecraft og Hellraiser, men med mørk humor som gjør narr av edgelords. Tegnet i en stil som låner fra Conan Chop Chop og Castle Crashers. Hver pasient våkner et nytt sted, kjemper seg gjennom fire genererte etasjer, samler groteske kuriositeter som kombineres til stadig merkeligere angrep, og dør som regel på en pinlig måte.

## Spill
- Nettleser: https://tombonator3000.github.io/morbidium/
- Tastatur og mus: WASD, mus for å sikte, venstreklikk slag, høyreklikk tungt slag, mellomrom rull, 1 til 4 evner, V apparat, F flaske, E snakk, Tab journal, Esc pause.
- Håndkontroll og berøring virker også. Hele oversikten står i Pasienthåndboka på tittelskjermen og i pausemenyen.

## Innhold
- Fire etasjer med hver sin overlege, trukket fra en pulje for hvert løp: Krok, Rust, Overarkivaren eller Den Store Klumpen, og under grunnmuren Journalen selv. Minisjefer venter i rommet med frivillig risiko.
- Rommene er 3D som standard, med lamper, måneskinn, skygger og tåke. Kvaliteten justeres av seg selv, og 3D kan slås av under Bilde.
- Hver pasient settes sammen på nytt: kjønn, hår, hud, klær og pynt. Liket blir liggende der pasienten døde.
- Kuriositeter som stables og kombineres, piller med ukjent virkning, apparater og lommerusk, evnekort i et frenologisk hode, diagnoser som følger av måten du spiller på.
- Tjenesterom, hemmelige rom bak sprukne vegger, forbannede rom og blodoffer. Fiender settes sammen av deler, og noen er navngitte mestere. Pasienthåndboka har en fiendeindeks med bilde av alt som bor i bygget.
- Blod som spruter på vegger og gulv, kjøttbiter ved tunge slag, og øyne som åpner seg i veggene når Morbidium stiger.
- Musikk laget i nettleseren som følger kampen, pasienthåndbok, arkiv med pasientmapper, merknader som låser opp nytt innhold, og gjeninnleggelse etter første utskrivning.

## Bygg
```
python3 build.py          # lager dist/morbidium.html
node tools/test_gen.js    # tester generatoren
python3 tools/test_spill.py   # gjennomspilling i nettleseren (Playwright)
python3 tools/test_ekstra.py  # enkeltfunksjoner i nettleseren (Playwright)
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
- Brun støy fra Tombonator3000/the-deep-ones (tonerekka derfra er erstattet av egen musikk), lydsynth og tidsfall fra Tombonator3000/3044.
- Brogue CE og Shattered Pixel Dungeon som idékilder (ingen kode kopiert).
- Lisens for Morbidium er ikke valgt ennå.
