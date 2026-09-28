# Morbidium - arbeidslogg

Alle tidspunkt er UTC.

## 2026-09-28 17:48 Testene er grønne, og kameravinkelen er lagt på main
- Del 64 (kameraprøven, etterbehandlingen og Kameravinkel i innstillingene): 10 av 10 OK. Del 11 (menyene): alle OK. Første kjøring av del 41, 11 og 64 ga 25 OK og 1 feil, og feilen var sjekken i del 41 som ventet Skjermristing.
- Del 41 med den rettede sjekken: 9 av 9 OK. Gjennomspillingen (test_spill.py) er grønn uten feil: kamp, rydding, tjeneste, sjef, luke, drøm og død.
- Grenen claude/dazzling-newton-2iix7q er lagt på main som fast-forward fra 9b1e5af, så Pages bygger og publiserer. Tom trenger ikke laste opp zipen, og bør ikke gjøre det nå, for den ville satt log.md, memory.md og todo.md tilbake til en eldre utgave.

## 2026-09-28 17:50 Pages publisert med kameravinkelen
- Pages-byggingen for 4e511f1 (kjøring 50) gikk grønt. Den publiserte siden har BYGG-merket 4e511f1, er like stor som det lokale bygget (12 757 035 byte) og har Kameravinkel under Innstillinger, Bilde, med «Last på nytt».

## 2026-09-28 18:18 Mobil: Samsung-telefonen fikk PC-oppsettet og mistet WebGL
- Tom fikk hvitt bilde og «Noe gikk galt: Grafikken gikk tom for minne eller krasjet (WebGL-konteksten ble mistet), og kom ikke tilbake» på telefonen. Skjermbildet viste WebGL2 på Adreno 750 (Snapdragon 8 Gen 3), dpr 3,75 og Chrome 154 på Android, trolig en Galaxy S24 Ultra. Det skjedde midt i et løp (nivå 3).
- Målt grafikkminne i telefonprofil (384 x 832, berøring, grov peker, seks etasjer og to tilbake) for bygget før i dag (4355d3d), veggprøven (9b1e5af) og i dag: 33 til 47 MB i alle tre, uten tap og uten lekkasje av betydning. Minnet forklarer det ikke på en så sterk telefon.
- Det jeg fant: spillet kjente igjen telefoner bare med matchMedia('(pointer: coarse)'). Chrome på Samsung med S Pen melder fin peker, fordi pennen teller først. Da fikk telefonen PC-oppsettet: oppløsning 2 i stedet for 1,5, høy kvalitet i stedet for middels, 2048 i skyggekartet, større teksturer og, fra i dag, omgivelsesskyggen med dybdetekstur. Samme telefonstørrelse med fin peker målt: 68 til 82 MB og dybdetekstur på. Dybdeteksturen er det eneste helt nye på skjermkortet i dag, og den var aldri prøvd på en ekte telefon. Jeg har ikke en Adreno å prøve på, så dette er den mest sannsynlige forklaringen, ikke en bevist en.
- Rettet: R.coarse er nå også sann for berøringsskjerm i en mobil nettleser (Android, iPhone, iPad eller userAgentData.mobile). En PC med berøringsskjerm er fortsatt PC. Telefoner og TV får aldri omgivelsesskyggen (D3.Q setter ao til 0, slik taket på 1024 i skyggekartet gjør), heller ikke på høy.
- Kommer grafikken ikke tilbake på åtte sekunder, lagres et trinn lettere til neste lasting (automatisk kvalitet: høy til middels til lav, og så uten 3D), og feilmeldingen sier det. Før startet «Last inn på nytt» med samme oppsett og kunne krasje likt. Feilmeldingen viser nå også telefon eller PC, 3D og kvalitet, og oppløsningen (window.__glInfo).
- AGENTS.md: bruk R.coarse, ikke pointer: coarse alene. memory.md og todo.md oppdatert.
- Ny testdel 65: 5 av 5 OK (telefon med fin peker får telefonoppsettet, høy på telefon uten dybdetekstur, mistet grafikk gir lettere start og riktig melding, PC med berøringsskjerm er PC). Del 64, 37 og 36 kjører.

## 2026-09-28 18:25 Mobilrettingen testet og lagt på main
- Del 65, 64, 37 og 36: 63 av 63 OK (telefon med fin peker, kameraprøven og omgivelsesskyggen på PC, skyggekart på telefon, og mobiloppsettet med mistet grafikk som kommer tilbake).
- Målt på nytt som telefon med fin peker (384 x 832, dpr 3,75): middels, oppløsning 1,5, ingen dybdetekstur og 33 til 48 MB, mot høy, oppløsning 2, dybdetekstur og 68 til 82 MB før rettingen.
- Lagt på main som fast-forward, så Pages publiserer.

## 2026-09-28 18:50 «Error creating WebGL context» på telefonen etter krasjet
- Tom sendte et nytt skjermbilde fra telefonen (18:46 UTC, etter at mobilrettingen var publisert): «Noe gikk galt: Error creating WebGL context.», uten opplysninger om skjermkortet.
- Den feilen kommer fra three når nettleseren ikke gir siden WebGL i det hele tatt, før spillet har tegnet noe. Så langt jeg vet, legger Chrome et domene som skjermkortet krasjet på, i en sperreliste som ikke går ut av seg selv. Den gjelder til Chrome startes helt på nytt, eller til man trykker på knappen i meldingen «WebGL hit a snag». Det stemmer med at feilen kom rett ved oppstart. Trolig har telefonen ikke fått kjørt den rettede versjonen ennå, men det er ikke bevist.
- Spillet viser nå en norsk forklaring når WebGL ikke kan lages: at Chrome stenger WebGL etter et krasj, og at nettleseren må lukkes helt (sveipes bort, eller Tving avslutning) før spillet åpnes igjen. Feilteksten fra three står i parentes. Meldingen om mistet grafikk sier det samme kort.
- Testdel 65 har fått en sjekk for dette (getContext for webgl gir null): 6 av 6 OK.
- Gjennomspillingen (test_spill.py) er grønn uten feil på det nye bygget. Lagt på main.

## 2026-09-28 19:22 Telefonen krasjet også i trygg modus, og feilrapport i feilmeldingen
- Tom sendte et tredje skjermbilde: grafikken ble borte igjen, nå med «telefon, enkel grafikk, oppløsning 1». Det er trygg modus, fordi oppstarten før stoppet under «Starter WebGL». Pasienten, tennene, nivået og erfaringen er de samme som på det første skjermbildet, så krasjet kommer kort tid etter at det lagrede løpet fortsetter.
- Telefongjenkjenningen virker altså. Men verken kvaliteten, 3D, etterbehandlingen eller dybdeteksturen er årsaken, for alt det er av i trygg modus. Rettingene fra i sted er fortsatt riktige for telefoner med S Pen, men de løste ikke dette krasjet.
- Målt i telefonprofil og trygg modus: 2D-lerreter 25 til 56 MB, 735 utpakkede bilder rundt 100 MB, JS 54 MB. Skannet 60 etasjer (10 frø, etasje 1 til 6) i trygg modus uten WebGL-feil, uten lerreter eller teksturer over 4096 punkter og med høyst 92 tegnekall. Her i skyen oppfører spillet seg pent, så krasjet henger sammen med telefonen (Adreno 750, Chrome 154). Pasienten og frøet lages tilfeldig, så løpet kan ikke gjenskapes uten det lagrede løpet.
- Ny knapp i feilmeldingen: «Kopier feilrapport». Rapporten har meldingen, grafikken slik den var da feilen kom, nettleseren, bygget, et øyeblikksbilde fra da grafikken ble borte, innstillingene, oppstartssteget og det lagrede løpet. Øyeblikksbildet har sekunder siden lasting, tilstand, etasje, rom, vær, kamp, sjef, fiender, tegnekall, trekanter, teksturer, geometrier, programmer, deler, JS-minne, de siste rammetidene og de 14 siste lydene. Det lagres også (morbidium_krasj), så det overlever at nettleseren startes på nytt. Kopiering virker ikke alltid på telefon, så rapporten vises også i et felt som kan merkes.
- Testdel 65: 7 av 7 (med rapporten). Del 36 og gjennomspillingen er grønne.

## 2026-09-28 19:47 Spillet virker på telefonen igjen
- Tom melder at spillet virker på mobilen nå, med versjonen som har telefongjenkjenningen, ingen omgivelsesskygge på telefon og feilrapporten (2bb63c9), etter at Chrome ble startet på nytt.
- Årsaken er ikke bevist. Det første krasjet skjedde med PC-oppsettet på telefonen, og det er rettet. Det tredje skjedde i trygg modus, og det er ikke forklart. Det kan ha vært ettervirkninger av krasjene før, siden Chrome ikke var startet helt på nytt.
- Kommer det igjen, gir «Kopier feilrapport» øyeblikksbildet og det lagrede løpet, og «Log Messages» i chrome://gpu viser hva skjermkortet gjorde. todo.md og memory.md er oppdatert.

## 2026-09-28 19:55 Punkt 1: dokumentene agentene leser, er slanket
- Tom sendte en liste med sju forbedringer (dokumentene, lettere repo og tester i CI, bilder og lyd ut av HTML-fila, kroker i stedet for innpakking, testklokke og ryddigere tester, fiender som data, moduler) og ba om alt, og om bedre løsninger der jeg finner dem.
- memory.md er skrevet på nytt med gjeldende tilstand og beslutninger (4,4 KB, var 83 KB). Systemdelene er flyttet ordrett til dokumentasjon/systemer.md med innholdsliste (alle linjene er sjekket), siden de er et oppslagsverk per system og ikke historikk. Agentene leser avsnittet for systemet de jobber med.
- log.md har de 17 nyeste oppføringene (19 KB). De 168 eldre ligger i logg/2026-09.md, alle 185 i samme rekkefølge som før (sjekket).
- todo.md har bare åpne punkter (12 KB, var 31 KB). De 120 ferdige ligger i arkiv/ferdig-2026-09.md under samme overskrifter (alle linjene sjekket).
- Nytt verktøy: tools/rydd_dokumenter.py flytter eldre logg til logg/ÅÅÅÅ-MM.md når log.md passerer 20 KB, flytter avkryssede punkter fra todo.md til arkiv/ferdig-ÅÅÅÅ-MM.md og sier fra når memory.md passerer 8 KB. --sjekk bare sjekker. AGENTS.md sier at det kjøres før en økt avsluttes.
- Oppstartslesingen for en agent er nå rundt 4 KB minne, 12 KB gjøremål og slutten av en logg på 19 KB, mot 83 KB, 31 KB og 287 KB før.

## 2026-09-28 20:12 Punkt 2: lettere repo og tester i CI
- CI: generatortesten (test_gen.js avslutter nå med feilkode ved feil) og en ny røyktest (tools/test_roek.py: PC i 3D og 2D og telefon i 3D, tittel, nytt løp og tre etasjer, ingen konsollfeil, rundt ett minutt) må være grønne før Pages publiserer. Ny arbeidsflyt test.yml kjører det samme på alle andre grener og i pull requests, og varsler hvis dokumentene er for lange. Første kjøring på grenen var grønn. test_spill.py avslutter også med feilkode ved feil.
- gpt-grafikk/ er nå en innboks. Bygget trenger bare de behandlede bildene, så assets/ferdig/ (611 bilder, 5,2 MB) ligger i repoet, og de 607 originalene (445 MB) er tatt ut av arbeidstreet. De ligger i historikken: alt fram til nå i commit 578f6f2, fil for fil i arkiv/grafikk-originaler.md. Taggen jeg ville sette, fikk ikke pushes herfra.
- Nytt verktøy tools/ta_imot_grafikk.py tar imot en leveranse: klipper og behandler, sjekker at hvert bilde fikk en fil (stopper uten å slette ellers), tømmer innboksen og fører commitene inn. Flyttingen nå ble gjort med det.
- lag_brief.py regner «levert» fra assets/ferdig og innboksen i stedet for fra originalene. ART_BRIEF.md og tegnelistene ble helt like, og bygget ble byte for byte likt (bortsett fra byggestempelet). De behandlede bildene er like fra kjøring til kjøring.
- Dokumentene som beskrev det gamle løpet, er oppdatert (gpt-grafikk/LESMEG.md, AGENTS.md, README.md, memory.md, systemer.md, DESIGN_BRIEF.md, og en merknad i GRAFIKKLEVERANSE.md, UTEGRAFIKK.md og leveransen 28.9., der bildene nå peker på assets/ferdig).
- Testdel 50 feilet også før dette: den ventet at panelveggen ble malt av koden, men veggprøven leverte et panelbilde 28.9. Testen tar nå ut det bildet selv, som den gjorde med gresset. 16 av 16 OK.
- Historikken er ikke skrevet om. En full kloning henter fortsatt de 447 MB i historikken; en grunn kloning (CI, dybde 1) blir rundt 30 MB med en gang. Å fjerne dem fra historikken krever omskriving og force-push av main, og det gjøres ikke uten at Tom sier ja.

## 2026-09-28 20:22 Punkt 4: kroker i stedet for innpakning
- Kartla alle innpakningene med en egen agent: 146 steder, 100 rundt globale funksjoner (43 navn) og 43 rundt metoder, med rekkefølgen som betyr noe noen steder (vakta for fiender under vann i hurt må ligge ytterst, drømmen må ryddes før hendelsene tømmer ekstradukkene).
- Ny Kroker i 01_core.js: foer, etter (med svaret først), av og kall, prio som går foran, og en feil i én krok logges uten å stoppe resten. Rekkefølgen er den samme som innpakningene ga (før-krokene sist lagt til først, etter-krokene først lagt til først), så oppførselen er uendret. Det er sjekket i nettleseren for hver funksjon.
- Gjort om: startFloor, clearFloor og decorateLevel (30_game), spawnBoss, bossDie, enemyDie og playerDie (20_actors), spawnProps, updateTele og updateProjectiles (05_world) og updateZones (26_fiender): 43 innpakninger. De elleve innpakningene av drawWeapon (13 våpen) er et oppslag, VAAPEN_TEGNING, der rekkefølgen ikke betyr noe. Til sammen 54 av 146.
- Igjen, med rekkefølgen dokumentert i systemer.md under «Kroker»: spawnEnemy, hurt, charPart, enemySlip, hurtPlayer, Sound.play og de med ett eller to lag. AGENTS.md sier at nye systemer bruker kroker eller oppslag.
- Ny testdel 66: ingen fil setter de omgjorte funksjonene på nytt (sjekket i kildene), krokene står i samme rekkefølge som innpakningene, prio, av og feil i en krok, og alle våpnene tegnes. 5 av 5 OK. En full kjøring av alle testdelene på bygget fra før går i bakgrunnen som fasit.

## 2026-09-28 20:55 Punkt 5: testklokka og test_ekstra.py delt per system
- Testklokka i 30_game.js: løkka er delt i loop og steg(dt). Klokke.frys() stopper spillet (bildet tegnes fortsatt, ingenting flytter seg), Klokke.spol(sek) kjører oppdateringen i faste steg på 1/60 sekund uten å vente på skjermen, og Klokke.til(f, sek) spoler til f() er sann. I spolte steg hoppes lyden, musikken, testmodusen og den automatiske kvaliteten over, og HUD, kart og bilde tegnes ikke. Det som ellers klinger av når bildet tegnes (blod og rødt på skjermen, sjokkbølger, zoom), går i R.fxTick, så det klinger av i spilltid også der.
- frys({ frø }) gir en fast tallrekke. For at den skal holde, har spillet fått sin egen Math i 01_core.js: Three.js trekker tall til id-ene når den lager objekter (og bare første gang noe lages), og det forskjøv rekka. Nettleserens Math.random er urørt, og spillets random spør den når testklokka ikke styrer.
- Dryppet fra taket og øynene i veggene hadde tidtakere som aldri ble nullstilt mellom etasjene. De begynner nå på nytt i hver etasje (Blod.tom). Da gir samme frø og samme spilltid nøyaktig samme kamp to ganger, også i etasje 3 og 6.
- tools/test_ekstra.py er delt: testdelene ligger i tools/testdeler/ (tolv filer per system, én funksjon per del), og test_ekstra.py er en kjører med --del, --system, -j (flere nettlesere samtidig), --liste, --rot og --frist. En del som krasjer, stopper ikke resten, og sidene den lot stå, lukkes. Delene som delte side (17 og 18, 19 og 20, 21 og 22), har fått hver sin, og telefonsiden som ble stående åpen i del 39, lukkes.
- Ny testdel 67 for testklokka: 6 av 6 OK. Røyktesten og generatortesten er grønne.

## 2026-09-28 21:45 Punkt 5: del 59 og 60 med faste etasjer, og hele testpakka mot fasiten
- Del 59 (Skinnlauget) og 60 (havet) bruker testklokka og FAST i tools/testdeler/felles.py: fastEtasje søker opp et løpsfrø der etasjen har et rektangulært kamprom som passer (og der plassene testen bruker, er frie), bygger etasjen med klokka frosset, uten drøm, lik og hendelser, og tar bort teslaspoler, gnistrende lamper og pytter. plass() gir et sted bare når det er fritt og i rommet. 17 av 17 på 80 sekunder og 25 av 25 på 61 sekunder, mot flere minutter før, og de feilet av og til.
- Hele testpakka på bygget med kroker og testklokka (66 deler, tre nettlesere, en time): 11 sjekker feilet i 7 deler. Fasiten (bygget før punkt 4) hadde feil i del 48 og 62. Del 4, 25, 30 og 62 venter i vanlig tid og feiler når spilltida går saktere enn klokka på en travel maskin. Del 33 (musikken) følger lydklokka og gikk gjennom to av tre ganger alene; den var aldri med i fasiten, fordi fasitkjøringen delte 17 og 18 (som delte side) på to grupper og krasjet. Delene som delte side, har nå hver sin.

## 2026-09-28 22:05 Punkt 7: kodesjekken i stedet for ES-moduler og Vite nå
- tools/sjekk_kode.js leser koden med acorn (lagt i tools/vendor, så den virker uten nett) og finner det moduler ville passet på: en fil som bruker en const, let eller class fra en senere fil mens den lastes, navn deklarert to ganger, ukjente navn (skrivefeil i kode som sjelden kjøres) og innpakninger, med et tak. Prøvd med feil satt inn med vilje, og den fant alle. Går på to sekunder, og CI kjører den.
- Moduler nå ville brutt de 92 innpakningene som var igjen (en importert funksjon kan ikke settes på nytt). Veien videre står i systemer.md: når taket er 0, kan filene bli moduler, og esbuild eller Vite kan bygge.

## 2026-09-28 22:40 Punkt 6: fiender som data og byggeklosser, med bevis på lik oppførsel
- Kartla alle 32 fiendetypene med en egen agent: alle har egen AI, og en type er spredt på rundt 15 tabeller. Regler for når de lages, lå i fem innpakninger rundt spawnEnemy.
- spawnEnemy har kroker. Grensene (høyst tre armer, én klokker) og oppstarten per type er data på typen (grense, vedStart), flokken og fast i gulvet ligger i spawnEnemyGrunn, og oppskriften er en krok. Fem innpakninger borte, taket er 87.
- Fiende.ny samler en type på ett sted og fyller de gamle tabellene i samme rekkefølge. Byggeklossene Blokk.bitt (flue, rotte, klumpunge og kålhode, som hadde nesten lik kode) og Blokk.angrep (Lærlingen). Lærlingen og Klokkeren er samlet med Fiende.ny.
- Beviset: tools/fiende_fasit.py kjører hver type i en egen side med samme frøstart og en fast etasje, og lager et avtrykk av hvert tiende steg og av tabellene. Alle 32 typene og tabellene ga nøyaktig samme avtrykk før og etter.
- For at avtrykket skulle bli likt fra kjøring til kjøring, måtte tre ting i spillet over på spilltid eller egen tallkilde: kameraristingen brukte performance.now (og kameraet avgjør hvor musa sikter), regnet og snøen også, og lyden og musikken trakk tall fra spillets rekke (hvor mye, fulgte lydklokka og hvor mange lyder som var pakket ut). Lyden trekker nå fra nettleseren (lydRandom). Del 67 er delt: samme side sammenligner kampen, og to nye sider med samme frø fra tittelen må gi helt likt, også neste tilfeldige tall.

## 2026-09-28 23:05 Punkt 3: nettutgaven med bildene og lydene som egne filer
- build.py lager to utgaver: dist/morbidium.html som før (12,7 MB, alt inne, virker fra disken, testene bruker den) og dist/web (index.html på 1,8 MB, og 611 bilder, 124 deler og 165 lyder som filer, 10 MB i alt). Pages viser nettutgaven og har den selvstendige fila ved siden av som morbidium.html.
- Nettutgaven henter startsettet (UI, glass, animasjonsark, pasienten, gulv, vegger og bakke) før tittelen, rundt 4 MB med Three.js, mot 12,7 MB. Resten hentes etterpå i bakgrunnen: delene til oppskriftene først, så fiendene etter etasjen de hører hjemme i. Art.hent og Art.klar, Art.part og Oppskrift tåler bilder som kommer senere, og lydene hentes med fetch når de skal pakkes ut. Fra disken gir nettutgaven en melding om å bruke morbidium.html.
- WebP ble målt og valgt bort: PNG-ene er palettkomprimert, tapsfri WebP ga 11 prosent, og tapsbasert ble større.
- Testdel 68 for nettutgaven (8 av 8), og røyktesten er grønn på begge utgavene. CI røyktester begge.

## 2026-09-28 23:10 Testene: 18 deler over på testklokka
- Del 4, 25, 28, 29, 30, 38, 44, 46, 48, 49, 57, 58, 61, 62, 63 og 67 venter nå i spilltid. Del 62 (Oldermannen), som feilet i fasiten, er grønn; den samler varslene i hvert steg klokka tar. Del 31 og 37 venter i vanlig tid som før: gaven etter instrumentskrinet kommer med setTimeout, og skyggene måles i tegnede bilder.
