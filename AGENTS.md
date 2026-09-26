# AGENTS.md: regler for alle som jobber i dette repoet (Claude, ChatGPT, Codex og andre)

## Før du starter
- Les `memory.md` (hva prosjektet er og viktige beslutninger), `todo.md` og de siste oppføringene i `log.md`.

## Mens og etter du jobber
- Logg alt du gjør i `log.md` med tidsstempel (`## YYYY-MM-DD HH:MM Kort tittel`), så historikken kan følges.
- Oppdater `memory.md` når noe varig endres, og `todo.md` når oppgaver kommer til eller blir ferdige.
- Dokumentasjon skrives på norsk, uten emoji og uten tankestreker, og i et naturlig, menneskelig språk.

## Bygg og test
- `python3 build.py` bygger alt i `src/` til én selvstendig fil, `dist/morbidium.html`. Rediger aldri `dist/`.
- `node tools/test_gen.js` tester etasjegeneratoren (1200 etasjer, gyldighet og determinisme).
- `python3 tools/test_spill.py` spiller gjennom i headless Chromium (krever Playwright). `python3 tools/test_ekstra.py` tester enkeltfunksjoner (lagring, mobil, journal og nyere systemer). Begge tar `--three STI` for å bruke en lokal three.min.js når nettleseren ikke når nettet.
- Filen må forbli selvstendig: eksterne skript bare fra cdnjs (Three.js r128), ingen andre nettressurser. Bilder bygges inn som data-URI-er, og lydene i `assets/lyd/` som base64 (`LYDFILER`).
- Lyder: bare lyder som er fri til bruk (CC0). `tools/lag_lyd.py` henter, klipper og koder dem, sjekker lisensen på hver lydside og skriver `assets/lyd/KILDER.md` med alle som har spilt inn. Nye lyder legges inn i lista der, ikke rett i mappa.
- «Enkel grafikk» og oppstartsbrødsmulene (`morbidium_boot`) skal alltid virke. De er det som hindrer hvit skjerm på svake mobiler.
- Store effekter følger innstillingene: forvrengning (sjokkbølger, zoom, drømmebølger) følger «Forvrengning», blink (negativ, lynblink) følger «Hvite glimt», og alt nytt i etterbehandlingen og partiklene må slås av med «Enkel grafikk» (`R.safe`). Blod og vann på skjermen følger «Blod og vann på skjermen», og blodet også «Blod og skrekkeffekter».
- Rommene er 3D som standard. `#2d` i adressen og «Enkel grafikk» slår 3D av, og automatisk kvalitet går ned fra høy til middels til lav og slår til slutt 3D av når bildet hakker. Testnettlesere (navigator.webdriver) måles ikke, så testene styrer kvaliteten selv (`D3.nedgrader`, `D3.tvingMaal`).

## Kode
- `src/01_core.js` kjerne, input, lyd · `02_data.js` alt innhold · `03_generator.js` etasjer · `04_render.js` renderer, lys og etterbehandling
- `05_world.js` kollisjon, skade, pytter, rekvisitter, plukk · `06_musikk.js` musikken som et lite iMUSE: stykker som byttes på taktstreken med bro, besetning etter rommet, lag for kamp og sjef, innslag i tonearten og roen som glir over i stemning · `10_art.js` tegninger i kode · `11_doll.js` papirdukker (med kantlys, positurer og rullestol) · `12_paint.js` malte nivåer · `13_rom.js` rekvisitter for nyere rom · `14_pasient.js` pasientens utseende (kjønn, hår, hud, klær, pynt) · `15_rom3d.js` rommene i 3D, lys, skygger, tåke og kvalitetsnivåer · `16_anim.js` animasjon av 2D-ting (spriteark eller tegnede ruter) og positurer for dukkene · `17_romtyper.js` gulv og vegger per romtype, møblene til de nye rommene, uteområder (bakke, trær, vær, gasslykter) og utgangene fra hver etasje
- `20_actors.js` spiller, fiender, sjefer, evner · `22_sjefer.js` Overarkivaren og sjefenes signaturangrep · `25_items.js` kuriositeter, piller, groteske fiender · `26_fiender.js` nyere fiender · `27_utstyr.js` apparater og lommerusk · `28_oppskrift.js` oppskrifter og mestere · `29_monstre.js` fiendene ChatGPT foreslo (Kasteren, Trillepasienten, Speilpasienten, klumpunger) og minisjefene, lagdelte skapninger (`Lagdukke`) · `31_sjefpulje.js` tilfeldige sjefer per løp, Den Store Klumpen og minisjefenes flyt · `32_meny.js` tittelmeny, pause, innstillinger, pasienthåndboka med fiendeindeks, arkivet og UI-settet fra ChatGPT · `33_merknader.js` merknader, opplåsinger og utskrivningsbrevet · `34_blod.js` blod, kjøttbiter, sprut på veggene og skrekkeffekter · `35_hendelser.js` de absurde hendelsene (øyet i sprekken, kua i kapellet og de andre), samtalepanelet med valg og følgene · `36_drom.js` pasientens historie og de fem drømmene mellom etasjene, skyggen, valgene, slutten og pasientmappa · `37_utefiender.js` fiendene og sjefene i Parken og Nattskogen (gartnere, kråker, Huldra, Vedkubbemannen, Nøkken, Overgartner Ansgar Hekk og Den hvite hjorten); ligger etter 32_meny og 33_merknader i bygget fordi den fyller fiendeindeksen · `38_effekter.js` partikler som regnes ut på skjermkortet (gnister, røyk, damp, sporer, Morbidium og møll), lyn i regnværet, teslaspolens buer, regnringer og drømmesløret · `39_kombo.js` treffkjeden, flerdrap, overkill, miljødrap, perfekt unnvikelse, kortkjeder, sjefdrap, fanfarer for synergier og forvandlinger, og kunngjørerstemmen · `40_dybde.js` lykteskygger, kontaktskygger, takstøv, varmeflimmer og lys i vannet og tåka · `41_historie.js` hovedhistorien (havet under huset, Avdeling Null og Venterommet): journalsidene før drømmene, forstanderen i Dypet, Venterommet og instrumentskrinet, kjettinger med kroker (Kjeder), sjefenes andre tale og siste ord, personlige linjer, siste side og brevet etter slutten · `42_lyd.js` lydbanken (de innspilte lydene pakkes ut og spilles), kartet fra spillets lydnavn til opptak, fottrinn, stemningssløyfer per etasje, rom og vær, og stemmer fra fiendene · `43_vaatt.js` blod og vann som treffer skjermen og renner nedover (dråpene i et høydekart som etterbehandlingen bryter bildet gjennom) · `44_testmodus.js` testmodus til spilletesting: måleren i hjørnet, løpsrapporten som kopieres til Claude, og «Si din mening» med spørsmålene som knapper (nye spørsmål legges i MENING) · `30_game.js` flyt, rom, tjenester, journal, HUD, hovedløkke · `00_head.html` HTML og CSS
- Rekkefølgen i bygget står i `build.py` (`parts`). Nye filer må legges inn der.

## Kunst
- ChatGPT lager bare bilder, etter `DESIGN_BRIEF.md`. Detaljliste per bildedel: `ART_BRIEF.md` (generert, rediger `tools/lag_brief.py` i stedet).
- Det som mangler, er samlet i ferdige ark i `tegnelister/` (generert av `tools/lag_tegnelister.py`, med `--bilder` også referansebilder av dagens kodetegninger). Kjør verktøyet på nytt når bilder er levert eller manifestet endres, og ikke rediger listene for hånd.
- Alt ChatGPT leverer legges i `gpt-grafikk/` (se `gpt-grafikk/LESMEG.md`). Ingenting annet skal ligge der.
- Flyt: bilder i `gpt-grafikk/` → `python3 tools/skjaer_ark.py` (klipper ark) → `python3 tools/behandle_bilder.py` (renser og plasserer) → `python3 build.py`. GitHub Actions gjør de samme stegene ved push til main.
- Filnavnet er nøkkelen. Gyldige nøkler står i `assets/manifest.json` (lages med `tools/lag_manifest.py`).
- Alt som mangler bilde, tegnes av koden. Det skal aldri bli hull i spillet fordi et bilde mangler.
- Spriteark (`anim_<navn>.png`) og UI-bilder (`ui_<navn>.png`) går gjennom det samme løpet. Spritearkene deles i ruter og skaleres likt, UI-bildene strekkes til riktig størrelse (9-delt). Se del G, H og I i `DESIGN_BRIEF.md`.

## Publisering
- GitHub Actions (`.github/workflows/pages.yml`) bygger og publiserer til GitHub Pages ved hver push til `main`.
- Første gang: Settings, Pages, Source: GitHub Actions.
