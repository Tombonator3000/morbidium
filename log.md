# Morbidium - arbeidslogg

Alle tidspunkt er UTC.

## 2026-09-28 10:47 Spor C, punkt C8: skeptikeren
- To favn på rad mens Kraken er rasende (seks og seks armer, den andre kommer før de første har sunket) trengte flere armer enn samlingen hadde (høyst åtte). Da kom to av klemmene uten arm: varselet og treffet var der, men ingen arm. Målt i en egen prøve: 12 kall, 2 uten arm. Taket er nå tolv (rundt 80 kB per arm, kastet ved ny etasje som før), og prøven gir 0 uten arm.
- Den ytre ringen i malstrømmen treffer ikke når den går ut (det er den indre som biter), så den har fått `stille: true` etter kontrakten. Ellers ville nedslagseffekten fra spor A kommet på sju ruter uten skade når sporene flettes.
- Testdel 63 sjekker nå også to favn på rad når Kraken er rasende: ingen klemme uten arm. Armer som ville kommet opp i en vegg, hoppes over, så sjekken krever minst seks kall og ingen uten arm. Del 4, 21, 36 og 63 er grønne (61 av 61) på koden fra før rettingen av terskelen (9 kall i det rommet); terskelen er senket fra 9 til 6 etterpå, uten ny kjøring.
- Resten holdt: dykket (ingen skade, skygge eller sikte under vann), favn, blekk, malstrømmen (også lånt av Journalen), taket på fire armer, døden og ryddingen. Sett på stående og liggende telefon (2D og 3D), med Enkel grafikk og med lav tekstur, uten feil i konsollen. Ingen andre spors filer er rørt.
- Åpent, ikke C8: på stående telefon ligger navnet og tittelen til sjefen oppå panelet med hjertene (gjelder alle sjefer, 00_head.html, spor D). Sjeflinja på PC ligger over toppen av kappen når pasienten står nær Kraken, men øyet synes.

## 2026-09-28 10:51 Kraken flettet, samlet integrasjonsløp startet, og bilder til Tom
- B6 (tomrom og ganger) og C8 (Kraken) er ferdige, sjekket og flettet. Del 55, 51 og 38 er grønne etter B6. Kraken ga seks nye bildenøkler (kappe, øye, pupill, nebb, skum og bandasje), som står i ART_BRIEF runde 17 og tegneliste 13.
- Det samlede integrasjonsløpet går nå på det endelige bygget (8c6c468): generatoren, gjennomspillingen og alle delene i test_ekstra.
- Før- og etterbilder til Tom ligger i dokumentasjon/runde5/, ett ark per punkt på lista hans: angrepsvarslene og nedslagene, snøen, hårrullene med hjorten, det skjulte rommet og tomrommene, stemplene og blodet, og de nye fiendene.

## 2026-09-28 12:20 Samlet integrasjonsløp: to sjekker tilpasset, og gjennomgang av flettingen
- Tom ba om å fullføre og flette når Kraken er ferdig. Kraken var allerede flettet inn.
- Integrasjonsløpet på 8c6c468 så langt: generatoren er grønn (1800 etasjer, deterministisk, skjult rom i alle), gjennomspillingen er grønn uten feil, og test_ekstra har 502 OK og 2 feil. Begge feilene er sjekker som ikke kjente de nye reglene:
  1. Del 11 ventet nøyaktig 18 sider i håndboka. De nye fiendene gir 19. Alle sidene får plass, og sjekken godtar nå 18 eller flere.
  2. Del 28 ventet glød fra alle bål, lys og lamper. Stearinlysene i det skjulte rommet (ett per etasje, seks til sammen) gløder først etter innbruddet (B2), og telles ikke før.
- En gjennomgang av flettingen går samtidig: fire lesere (flettingen med Toms uteflater, fiendene på tvers av sporene, grafikkminne og ytelse, testene) og én skeptiker per funn. Hvert punkt var sjekket i sitt spor; dette ser på sømmene mellom sporene.

## 2026-09-28 13:37 Resten av integrasjonsløpet, uten flere agenter
- Tom syntes runden har brukt altfor mye tid og ressurser på testing. Gjennomgangen med flere agenter er stoppet, og resten gjøres for hånd: bare delene som var røde, kjøres på nytt.
- Samlet løp på 8c6c468: generatoren og gjennomspillingen grønne, test_ekstra 613 OK og 10 feil i del 11, 28, 59, 60 og 62.
- Rettet:
  1. Boblen med dagsorden til Oldermannen havnet utenfor skjermen. Klemmen i 50_skinnlauget.js satte left og top, men FX plasserer boblene med transform nå (spor D). Klemmen regner og skriver transformen selv.
  2. Rettingen i del 28 fra forrige commit hadde en //-kommentar midt i en enlinjes løkke, så resten av linja ble borte. Det er nå en blokkommentar.
  3. Del 62 (knappenålene): nålen traff, men et hjerte fra en lærling testen hadde drept, ble trukket inn med en gang pasienten mistet helse og ga +7 tilbake. Testen fjerner løse hjerter før hver sak. Ikke en feil i spillet.
- Del 59 (Lærlingen på etasje 3) og del 60 (kall fra dypet) var grønne ved ny kjøring uten endring. Begge avhenger av hvor fiendene står i en tilfeldig etasje. Ikke rettet, men notert her.
- Ny kjøring: del 11 grønn, del 28, 59 og 60 grønne (52 sjekker), del 62 grønn bortsett fra knappenålene før hjerterettingen.
- Del 62 etter hjerterettingen: 26 av 26 OK. Alle delene som var røde i samlekjøringen, er nå grønne.

## 2026-09-28 13:47 Flettet til main (PR #12) og publisert
- PR #12 (runde 5) er flettet til main som «Flett PR #12: Runde 5, angrepsvarsler, snø, hårruller, skjulte rom, vegger og gulv, og nye fiender» (4355d3d).
- Pages-byggingen gikk, og den publiserte siden har den nye versjonen. Kort sjekk av siden på PC (1280 x 720) og stående telefon (390 x 844): et løp starter i 3D, blekkvarslene, snøfallet, det skjulte rommet, havet, Skinnlauget, Oldermannen og Kraken er med, og konsollen har ingen feil.
- Grenen claude/practical-babbage-nc80bu er satt tilbake til main.
- todo.md: flettingen er krysset av, og del 59 og 60 er notert som tester som bør få faste plasser.

## 2026-09-28 18:20 Veggprøve og Havet under huset og Skinnlauget
- Tom ba om å fortsette den krasjede grafikkøkta. Dagens main og manifest viste 558 av 636 bilder. Vedlagt kunstbrief var eldre; dagens tegnelister og referansebilder er brukt.
- Levert fem veggteksturer og ni bestillinger i liste 13: seks figurark, Avløpsarmens tupp, Kraken-delene og fem våpen. 14 PNG-filer gir 53 nye manifestbilder, nå 611 av 636.
- Fire figurark fikk større marger etter kontroll av klippekantene. Alle 53 klipte kildebilder er gyldige PNG-filer. Bildeløpet og bygget er kjørt i egen kontrollmappe, med 611 innebygde bilder, 124 deler og 165 lyder. En tom mellomfil ble klippet på nytt; fire gjenværende originalark ble hoppet over av bildebehandlingen. Se leveranserapporten for detaljene.
- ART_BRIEF og tegnelistene er regenerert. Ferdig liste 13 er arkivert i dokumentasjon/grafikk-2026-09-28 sammen med prompter og leveranseoversikt. Spillkode og skript er uendret.
- De siste 25 bildene følger stoppunktene i bestillingen: ni vegger etter vurdering av prøven på PC og mobil, og 16 gulv etter at egne gulvfliser er på plass.

## 2026-09-28 16:40 Kameraprøve med isometrisk vinkel og ny etterbehandling
- Tom spurte om vegger og gulv kan være 3D mot 2D-figurer og ting, om vinkelen kan bli mer isometrisk, og om det kan bli mer etterbehandling for bedre lys. Vegger og gulv var allerede 3D. Denne økta er gjort fra Cowork, ikke Claude Code.
- Kameraet: KAMERA_VALG øverst i 04_render.js leser ?kamera=iso (dreining 45, helning 45), ?kamera=lav (helning 42) og ?helning= og ?dreining=. Uten valg er alt som før. KAM har hjelperne for dreiningen, og alt som vender mot kameraet bruker dem: dukker, ting, animerte ting, lagdukker, Kraken-armene, blekkpartiklene, båndene, kantlyset, prosjektilene og snøboksen. Visningen forfra, bakfra og fra siden regnes mot kameraet. Styringen dreies i Input.actions.
- Veggene: en vegg er lav når gulvet ligger på sida bort fra kameraet, og med dreid kamera bygges sideflatene mot kameraet, med lister i 3D. Minikartet og N på kartringen dreies med.
- Etterbehandling i 3D: dis (åttendedels oppløsning, tre runder uskarphet, skjermblanding og lys i mørket nær lyskilder) på høy og middels, omgivelsesskygge fra dybdeteksturen på høy (symmetriske nabopar, så flate gulv ikke mørkner, og store sprang teller ikke), og en mild tonekurve. Første forsøk på disen var for sterkt og vasket ut pasienten i lyktelyset, så terskelen ble hevet og styrken tatt ned. ?lys=gammel slår det nye av, ?lys=ao viser bare omgivelsesskyggen.
- Nytt verktøy: tools/bilder_kamera.py (samme sted med ulike valg). Ny testdel 64 i test_ekstra.py: 7 av 7 OK. Generatoren og gjennomspillingen er grønne.
- Bilder til Tom i dokumentasjon/kamera/.
- Kjente mangler står i memory.md og todo.md (lamper, vinduer, pilastre, blod og sprekken bare på sørvegger, ingen gjennomsiktige vegger ennå, snøens parallakse).
- Denne økta fikk ikke skrive til GitHub (repoet er ikke koblet til økta), så endringene ble levert som en patch til Tom.

## 2026-09-28 17:45 Kameravinkel som valg i innstillingene
- Tom ba om isometrisk som valg i innstillingene. Innstillinger, Bilde har nå Kameravinkel (som før, lav, isometrisk), lagret som settings.vinkel.
- Vinkelen settes når spillet lastes (tegningene måles etter den), så KAMERA_VALG leser innstillingen rett fra lagringen. Velges en annen vinkel enn den som brukes, kommer en rad med «Last på nytt». Et løp som er i gang, fortsetter fra starten av etasjen. Adressen går foran innstillingen, og ?kamera=standard er lagt til.
- Testdel 64 har tre nye sjekker (innstillingen brukes ved lasting, raden kommer og panelet får plass, adressen går foran). Kjørt sammen med del 11 (innstillingene får plass) og del 48: 29 av 29 OK.
- Utvalgte deler etter kameraprøven (16, 28, 36, 39, 40, 48, 51, 55, 57 og 64) er kjørt: alt grønt bortsett fra én sjekk i del 48 (900 partikler lever ut, 3 igjen), som var grønn ved neste kjøring. Den avhenger av tid i programvaregrafikken. Hele test_ekstra er ikke kjørt, fordi den går flere timer i denne skyen.

## 2026-09-28 17:30 Levert som filer til opplasting på GitHub
- Verken denne økta eller Claude Code fikk skrive til repoet, så Tom fikk endringene som nedlastbare filer: en zip med de 28 endrede og nye filene i samme mapper som i repoet (til «Add file», «Upload files» på GitHub), og patchen med alle commitene til git am.
- Filene i zipen er hentet fra commiten, ikke fra arbeidsmappa, så de er like det som er testet.

## 2026-09-28 17:42 Kameravinkelen fra patchen lagt oppå main
- Tom sendte zipen og patchen fra Cowork-økta (kameraprøven, ny etterbehandling og Kameravinkel under Innstillinger, Bilde) og ba om at det kommer på main, så Pages publiserer det.
- Patchen er laget mot 4355d3d, men main har fått veggprøven (9b1e5af) etterpå. Zipen har hele filer fra før veggprøven, så en opplasting av den ville slettet veggprøvelinjene i log.md, memory.md og todo.md. Derfor er patchen brukt: de fire commitene er lagt oppå 9b1e5af med cherry-pick, og konfliktene i log.md og todo.md er løst ved å ta med begge sider (oppføringen fra 13:47 foran veggprøven i loggen).
- Kontroll: lagt på 4355d3d gir patchen nøyaktig de 28 filene i zipen. Oppå main er 25 av dem like zipen byte for byte, og log.md, memory.md og todo.md skiller seg bare med veggprøvelinjene. Ingen filer fra veggprøven er endret, og alt ligger i src/, tools/ og dokumentasjon/kamera/, ikke øverst i repoet.
- Bygget med bildeløpet: 611 innebygde bilder, 124 deler og 165 lyder. node --check på skriptet er grønn, og test_gen.js gir 1800 av 1800 gyldige etasjer, deterministisk. Arkene bildeløpet klipte i gpt-grafikk/, er satt tilbake, siden Pages-bygget klipper selv.
- Testdel 41 (menyene med håndkontroll) feilet: den ventet at spaken etter Kameraavstand i fanen Bilde var Skjermristing, men nå kommer Kameravinkel imellom. Resten av sjekken stemte. Testen venter nå vinkel. Del 11 er grønn, også sjekken av at alle fanene i innstillingene får plass. Del 64 og en ny kjøring av del 41 går.
- memory.md: råd om å bruke patchen og ikke zipen når en økt uten GitHub-tilgang leverer begge, om å rydde gpt-grafikk/ etter bildeløpet lokalt, og om hvordan enkeltdeler av test_ekstra kan kjøres. todo.md: kameraendringene er krysset av som lagt inn.

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
