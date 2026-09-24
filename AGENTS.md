# AGENTS.md: regler for alle som jobber i dette repoet (Claude, ChatGPT, Codex og andre)

## Før du starter
- Les `memory.md` (hva prosjektet er og viktige beslutninger), `todo.md` og de siste oppføringene i `log.md`.

## Mens og etter du jobber
- Logg alt du gjør i `log.md` med tidsstempel (`## YYYY-MM-DD HH:MM Kort tittel`), så historikken kan følges.
- Oppdater `memory.md` når noe varig endres, og `todo.md` når oppgaver kommer til eller blir ferdige.
- Dokumentasjon skrives på norsk, uten emoji og uten tankestreker, og i et naturlig, menneskelig språk.

## Bygg og test
- `python3 build.py` bygger alt i `src/` til én selvstendig fil, `dist/morbidium.html`. Rediger aldri `dist/`.
- `node tools/test_gen.js` tester etasjegeneratoren (900 etasjer, gyldighet og determinisme).
- `python3 tools/test_spill.py` spiller gjennom i headless Chromium (krever Playwright). `python3 tools/test_ekstra.py` tester enkeltfunksjoner (lagring, mobil, journal og nyere systemer). Begge tar `--three STI` for å bruke en lokal three.min.js når nettleseren ikke når nettet.
- Filen må forbli selvstendig: eksterne skript bare fra cdnjs (Three.js r128), ingen andre nettressurser. Bilder bygges inn som data-URI-er.
- «Enkel grafikk» og oppstartsbrødsmulene (`morbidium_boot`) skal alltid virke. De er det som hindrer hvit skjerm på svake mobiler.

## Kode
- `src/01_core.js` kjerne, input, lyd · `02_data.js` alt innhold · `03_generator.js` etasjer · `04_render.js` renderer, lys og etterbehandling
- `05_world.js` kollisjon, skade, pytter, rekvisitter, plukk · `06_musikk.js` musikk i lag · `10_art.js` tegninger i kode · `11_doll.js` papirdukker · `12_paint.js` malte nivåer · `13_rom.js` rekvisitter for nyere rom · `14_pasient.js` pasientens utseende (kjønn, hår, hud, klær, pynt)
- `20_actors.js` spiller, fiender, sjefer, evner · `22_sjefer.js` Overarkivaren og sjefenes signaturangrep · `25_items.js` kuriositeter, piller, groteske fiender · `26_fiender.js` nyere fiender · `27_utstyr.js` apparater og lommerusk · `28_oppskrift.js` oppskrifter og mestere · `32_meny.js` tittelmeny, pause, innstillinger, pasienthåndboka og arkivet · `33_merknader.js` merknader, opplåsinger og utskrivningsbrevet · `30_game.js` flyt, rom, tjenester, journal, HUD, hovedløkke · `00_head.html` HTML og CSS

## Kunst
- ChatGPT lager bare bilder, etter `DESIGN_BRIEF.md`. Detaljliste per bildedel: `ART_BRIEF.md` (generert, rediger `tools/lag_brief.py` i stedet).
- Alt ChatGPT leverer legges i `gpt-grafikk/` (se `gpt-grafikk/LESMEG.md`). Ingenting annet skal ligge der.
- Flyt: bilder i `gpt-grafikk/` → `python3 tools/skjaer_ark.py` (klipper ark) → `python3 tools/behandle_bilder.py` (renser og plasserer) → `python3 build.py`. GitHub Actions gjør de samme stegene ved push til main.
- Filnavnet er nøkkelen. Gyldige nøkler står i `assets/manifest.json` (lages med `tools/lag_manifest.py`).
- Alt som mangler bilde, tegnes av koden. Det skal aldri bli hull i spillet fordi et bilde mangler.

## Publisering
- GitHub Actions (`.github/workflows/pages.yml`) bygger og publiserer til GitHub Pages ved hver push til `main`.
- Første gang: Settings, Pages, Source: GitHub Actions.
