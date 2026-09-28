# Morbidium - arbeidslogg

Alle tidspunkt er UTC.

## 2026-09-23 11:22 Oppstart
- Leste Morbidium-Design-v0_2.md (sanntids action-roguelite, Three.js, fire evneplasser, oppvåkningssteder, diagnoser, tjenester inne i sanatoriet).
- Så på seks referansebilder: Conan Chop Chop (props, landsby, trener, smed, dødsskjerm) og et mørkt isometrisk asylum-laboratorium.
- Klonet github.com/Tombonator3000/prosjektbibliotek. Leste AGENTS.md: biblioteket er referansemateriale, ikke instrukser. Lisens og kompatibilitet skal sjekkes før gjenbruk.
- Funn: biblioteket inneholder README- og lisenskopier, ingen kildekode. Relevante oppføringer: Tombonator3000/3044 (eget spill, MIT-merke i README), scottstts/Threejs-Awesome-Graphics-Agent-Skills (MIT, for tungt/realistisk for denne stilen), cortiz2894/stylized-components (MIT, R3F/Next, ikke direkte brukbart i én HTML-fil), bobeff/open-source-games (lenkeliste, Brogue CE og Shattered Pixel Dungeon som genereringsreferanser).
- Merknad: repoet kunne klones uten innlogging, altså offentlig synlig, selv om AGENTS.md sier det skal være privat.
- Klonet Tombonator3000/3044 og leste agents.md der. Valgt gjenbruk: SoundSystem-mønsteret (synth med pitch-envelope, filtrert støy, arpeggio) og SlowMotionSystem-ideen (tidsfaktor ved treff/bossdrap), tilpasset til Morbidium.
- Testmiljø: headless Chromium med SwiftShader WebGL fungerer, cdnjs three.js r128 er tilgjengelig.

## 2026-09-23 14:36 Kildelenker i prosjektbiblioteket fulgt
- Tom påpekte at biblioteket har lenker til kildekoden. Det stemmer: hver oppføring i KATALOG.md og data/catalog.json har lenke til originalrepoet og en festet commit. Forrige runde fulgte bare lenken til 3044. Nå er de relevante lenkene fulgt og repoene klonet til /home/claude/kilder.
- Klonet: scottstts/Threejs-Awesome-Graphics-Agent-Skills (d1cb23d, MIT), cortiz2894/stylized-components (c0c02c4, MIT), achimala/dream-loop (9bddb90, MIT), lhlGitHub/threejs-architecture-effects (693ca2e, MIT), chaseleantj/desktop-habitats (66e80ea, MIT), Tombonator3000/the-deep-ones (7619501, MIT i README), conspiracy-canvas, state-shift-strategy, vector-war-games.
- Tombonator3000/Transcendensens-Vev-CRPG krever innlogging (privat eller slettet). Ikke tilgjengelig.
- Sjekket agents.md i alle: the-deep-ones (logg til log.md, vanilla JS, prosedyral fallback), vector-war-games, state-shift-strategy (AGENTS.md + CLAUDE.md), Threejs-skills (.codex/AGENTS.md). Ingen av dem gjelder Morbidium direkte, men loggkravet følges uansett.

## 2026-09-23 14:51 Pause og retningsskifte for utseendet
- Tom stanset arbeidet og sendte 13 nye referansebilder: Castle Crashers (tykke strek, store hoder, støvskyer, skadetall), Conan Chop Chop (3/4-ovenfra, håndtegnede rekvisitter med farget kontur, pergamentpaneler, rund gullramme rundt kartet, dødskort med dødsårsak) og en egen Morbidium-journalskisse (pasient i gul morgenkåpe med rosa kanintøfler, fire hjerneområder som evnekort, FRISK NOK-stempel).
- Konklusjon: 3D-primitiver med toon-skygge (kuler og bokser) treffer ikke. Designdokumentet kapittel 9 beskriver allerede løsningen: 2.5D-papirdukker med illustrert hode og kropp, strek-armer og -bein generert i sanntid, gulvskygge, og en liten animasjonstest før resten bygges.
- Beslutning: fullbygget stoppes. Logikken (generator, data, lyd, verdensregler) beholdes. Presentasjonslaget lages på nytt: ortografisk kamera, tegnede figurer og rekvisitter som flate illustrasjoner med tykk kontur, malte gulv og vegger uten lyssetting, toon-vann beholdes.
- Neste leveranse: utseendetest (ett rom, spiller og fire fiendetyper som kan slås, HUD i Conan-stil) for godkjenning før resten bygges om.

## 2026-09-23 15:05 Utseendetest bygget
- Nye filer: src/10_art.js (tegnede deler), src/11_doll.js (papirdukke), src/12_paint.js (malt gulv og vegger), src/13_lab.js og src/lab_head.html (testrommet), build_lab.py.
- Figurer: pasienten fra Toms journalskisse (bustete hår, runde briller, gul morgenkåpe, rosa kanintøfler), pleier, kultist med kappe og fire belter, oppasser med maske og sprøyte, avløpsyngel. Hver har forfra, bakfra og fra siden. Armer og bein er tykke, litt skjeve bånd som bygges hvert bilde; hodet henger litt etter kroppen på en fjær.
- Rekvisitter tegnet i 3/4-perspektiv med farget kontur per materiale: stol, benk, plante, tralle med suppe, lampe, arkivskap, seng, kasse, sluk.
- Gjenbruk fra biblioteket i denne runden: toon-vannshaderen fra cortiz2894/stylized-components (Voronoi-kanter, ringer ved tråkk), partikkelpoolen med tett bytte fra Threejs-Awesome-Graphics-Agent-Skills, brun støy og tonerekke fra the-deep-ones, lyd og tidsfall fra 3044.
- Rettet en feil i det gamle gulvet: trekantene hadde normal ned og ville blitt borte fra kameraet.
- Testet i headless Chromium med SwiftShader: ingen konsollfeil, skjermbilder av kamp, evner (brekning og monolog), dødskort og mobil (390x844). Bildefrekvensen kan ikke måles her; en tom Three.js-scene gir bare 27 bilder i sekundet i denne maskinen, tegnekallet vårt tar rundt 2 ms.
- Mobil: romskiltet skjules, kartet flyttes opp, testknappene flyttes ned til venstre.

## 2026-09-23 15:17 Tilbakemelding: mer tegnestil, og karakterarket
- Tom: utseendet må ligge nærmere tegnestilen i Conan Chop Chop-bildene. Journalskissen hans er karakterarket, med hodet som frenologikart der evnekortene festes i fire områder.
- Plan: ujevn blekkstrek med tyngde nederst til høyre og myk malt skygge i alle tegninger. Gulvet males som ett unikt lerret per nivå, med håndtegnede fliser, flekker, skygger og rusk, i stedet for et gjentatt rutenett. Veggtopper tegnes som flater med blekkant, ikke svarte bånd. Papirkorn over bildet. Journalen bygges som oppslått arkivbok etter skissen: portrett med høydemål, egenskaper med prikker, utstyr, diagnoser, legens merknad og stempel. Høyre side får frenologihodet med fire kortplasser, kortlomme og faner.

## 2026-09-24 11:58 Komplett prototype i ny stil
- Tom ba om hele prototypen i denne stilen, med shadere for å få det så bra som mulig.
- Oppdaget at et tidligere, avbrutt forsøk på samme bestilling hadde skrevet mye i src/ (tegninger for alle rekvisitter, tjenestefolk og bosser, dukkeshader, etterbehandling med eget lyslag, 20_actors.js med spiller, fiender, bosser og evner). Bygget videre på det. Mine dubletter (10b_art2.js, 18_post.js) ligger i old/.
- Nytt: src/00_head.html (alle skjermbilder og HUD), src/30_game.js (tittel, innleggelse med oppvåkningsvalg, etasjer, romlåsing og bølger, tjenester, kister, journalsider, Olsens skap, lik etter forrige pasient, journalen, pause og innstillinger, død, utskrivning, hovedløkke), build.py.
- Shadere: etterbehandlingen fikk blekkboiling (tegningen skjelver åtte ganger i sekundet). Fra før: lyslag, fargegradering per etasje, papir og korn, vignett, Morbidium-bølger og fargeforskyvning, rød kant ved skade, puls ved lav helse. Dukkeshader: treffblink, kontur for eliter, oppløsning ved død. Toon-vann i pyttene.
- Journalen følger Toms skisse: pasientjournal med portrett og høydemål, fem egenskaper med prikker, utstyrt gjenstand, diagnoser, legens merknad og stempel. Høyre side: frenologihodet med fire områder, kortene festes med nål og kan dras eller klikkes mellom områdene og lomma. Kort i sitt eget område får gullprikk og 20 % kortere nedkjøling.
- Feil rettet: verdenskoden brukte gamle egenskapsnavn (nerver, tryne) etter at spilleren fikk navnene fra skissen. Det ga NaN i skade (ingen død) og null tenner. Seks evnekort manglet tegning. Veggtoppene var for like korridorgulvet. Kameraet rammer nå inn bossen.
- Testet med automatisk gjennomspilling i headless Chromium: tittel, innleggelse, kamp med bølger, rydding, journal, tjeneste, boss, luke, etasje 2 og død. Ingen konsollfeil. Mobil 390x844 sjekket.

## 2026-09-24 12:17 Hvit skjerm hos Tom
- Tom får hvit skjerm når spillet starter. Den publiserte filen er identisk med dist/morbidium.html. Spillet kjører feilfritt i Chromium og i WebKit (installert for anledningen) under en etterligning av publiseringens CSP. Feilen skjer altså bare på ekte maskinvare.
- Sannsynlige årsaker: etterbehandlingen (nytt siden utseendetesten, som virket) brukte multisample-rendermål, og overgangen fra tittel til spill presset minnet fordi valg av oppvåkning bygde tittelsida på nytt før første etasje, og gamle nivåteksturer ble aldri frigjort.
- Tiltak: multisample-mål fjernet, oppløsningen på mobil begrenset til 1,5x, gamle gulv- og veggteksturer frigjøres ved nytt nivå, feilen med dobbel tittelbygging rettet, «Laster»-tekst vises før tungt arbeid starter.
- Selvdiagnose: etter 20, 40 og 60 bilder leses ni punkter fra skjermen. Er bildet helt hvitt eller helt tomt, eller konteksten tapt, slås enkel grafikk på og lagres. Ny innstilling «Enkel grafikk». Adressen med #enkel tvinger den også.
- Feil vises nå i en boks på skjermen med feiltekst og nettleserinfo, med knapper for enkel grafikk og ny innlasting, i stedet for hvit skjerm.
- Testet: tvunget hvitt bilde slår over til enkel grafikk i Chromium og WebKit, feilboksen vises, full gjennomspilling uten feil.

## 2026-09-24 12:28 Fortsatt hvit skjerm (Android, Claude-appen)
- Toms skjermbilde (Samsung, Android WebView i Claude-appen) er helt hvitt: pikselsjekk viser ikke engang den mørke bakgrunnen eller «Laster»-teksten. Siden blir altså aldri tegnet, det er ikke en WebGL-feil midt i spillet.
- Mulige årsaker: Google Fonts-stilarket i head blokkerer all tegning til det er lastet, og henger det, blir siden hvit. Eller visningen krasjer under den tunge oppstarten før første tegning, og WebView etterlater hvitt.
- Tiltak: skriftene hentes nå etter første tegning. En enkel «Laster»-skjerm i ren HTML ligger øverst i body. Spillkoden pakkes i en funksjon (build.py) og startes først etter at Three.js er hentet dynamisk etter første tegning.
- Brødsmuler: hvert oppstartssteg vises på skjermen og lagres i localStorage (morbidium_boot). Stopper forrige oppstart midt i et steg, starter neste i trygg modus: enkel grafikk, oppløsning 1x, gulvtekstur 16 px per rute, ingen tung tittelbakgrunn, med en merknad om hvor det stoppet. Vellykket etter 90 tegnede bilder.
- Feilboksen viser nå GPU-info (WebGL-versjon, grafikkort, maks tekstur, dpr) og nettleser, så et skjermbilde av den sier hva som skjer.
- Testet i Chromium og WebKit: vanlig oppstart, simulert krasj med påfølgende trygg modus, full gjennomspilling uten feil.

## 2026-09-24 12:33 Appen viser ikke spillet, nettleseren gjør
- Tom: spillet virker i Chrome på telefonen (claude.ai på web), men Claude-appen på Android viser hvitt (etter siste endring: hvitt felt med grå kanter). Siden ikke engang oppstartsskjermen i ren HTML vises, laster appens visning ikke siden i det hele tatt. Spillkoden er ikke årsaken.
- Laget en testside (morbidium-apptest.html, publisert separat) uten eksterne ressurser, fylt opp til samme størrelse som spillet (344 kB). Den sjekker om appen viser publiserte sider, JavaScript, lagring, Canvas 2D, WebGL med GPU-navn, og henting av Three.js fra cdnjs.
- Midlertidig løsning for Tom: åpne spillets lenke i Chrome.

## 2026-09-24 12:37 Konklusjon: feil i Claude-appen på Android
- Testsiden uten eksterne ressurser blir også hvit i appen. Appens visning viser altså ingen publiserte sider på Toms telefon (Samsung, Android). Samme sider virker i Chrome på samme telefon.
- Tom melder feilen til Anthropic. Spillet spilles i Chrome inntil videre.

## 2026-09-24 14:43 Vurdering: 3D-verden med 2D-figurer
- Repopakken er avbrutt midtveis: ART_BRIEF.md, tools/ (behandle_bilder.py, lag_manifest.py, lag_brief.py, test_spill.py, test_gen.js), build.py med innebygde bilder og .github/workflows/pages.yml er ferdige og testet. AGENTS.md, CLAUDE.md, README.md og zip gjenstår.
- Tom vurderer å gjøre verdenen om til 3D i stil med et Three.js-spill av SimonDev (iced_coffee_dev på X): mørk natt, varme punktlys fra lykter og stearinlys, måneskygger, bloom, tett detaljert diorama med åpne rom, glatte lavpoly-modeller. Figurene (helten og fiendene) skal forbli 2D som nå.
- Vurdering: gjennomførbart (samme grep som HD-2D, Don't Starve, Paper Mario). Generator, spillogikk, UI, journal og lyd beholdes. Nivåtegning, rekvisitter, lys og etterbehandling byttes. Dukkene må lyses av de samme lampene og kaste ekte skygge, ellers ser de limt på ut. Runde 2 i kunstbriefen (rekvisitter som bilder) bør vente til stilen er bestemt.

## 2026-09-24 14:57 Designbrief, maler, klippeverktøy og repopakke
- DESIGN_BRIEF.md: arbeidsdeling, stilblokk, faste regler, maler, arktyper med prompter (figurark, delark, ni ting, teksturer, portretter), oppskriftssystemet og første bestilling.
- maler/ (lages av tools/lag_maler.py): mal_figur, mal_hoder, mal_hatter_og_har, mal_tilbehor, mal_kropper, mal_ni_ting. All hjelpegrafikk er magenta, med hodesirkel, nakkekryss, skulderprikker og hoftekryss i spillets proporsjoner.
- tools/skjaer_ark.py: klipper figurark til hode_ og kropp_-filer, «ni ting»-ark til nøkkelfiler, og delark til assets/deler/ med festepunkt i deler.json. Fjerner magenta (også glatte kanter, men ikke rosa eller lilla) og ensfarget bakgrunn. Testet på syntetiske ark: hodet kom ut 221x221, akkurat som tegnet.
- AGENTS.md, CLAUDE.md og README.md skrevet. Repoet pakket som morbidium-repo.zip.
- Svar til Tom: ChatGPT kan lage figurark (forfra, bakfra, fra siden) med mal, men ikke gode animasjonsark; spillet animerer ved å flytte deler. Uendelige fiender er mulig med oppskriftssystemet (rolle, deler, farging, størrelse, elitemerker), over 150 000 kombinasjoner fra ni deler av hver type. Motoren for oppskriftene er ikke bygget ennå.

## 2026-09-24 15:19 Kuriositeter i Isaac-ånd, mer absurd og grotesk
- Tom ville ha mer absurd og grotesk innhold, i retning The Binding of Isaac, og særlig gjenstander man plukker opp og kombinerer.
- Ny fil src/25_items.js (bygges mellom 20_actors og 30_game):
  - 40 kuriositeter med navn, humoristisk beskrivelse, grupper og ikon. De endrer tall (skade, fart, rekkevidde, slagtakt, hjerter, flaks), angrep (slimklumper fra slagene) og klumpenes egenskaper (målsøking, gjennomtrenging, deling, eksplosjon, gift, treghet, kjedelyn, bumerang, sprett, livssuging, tenner). Alt stables, så kombinasjonene oppstår av seg selv.
  - Ti navngitte synergier med stempel når de oppstår, og fem forvandlinger ved tre gjenstander i samme gruppe: Fluekongen, Svulstbaronen, Selverklært mørkets fyrste, Selvopererende, Tannfeen selv.
  - Gjenstandene vises på pasienten (glassøye, svulst, stearinlys, bart, tunge, eyeliner, igler, horn, bandasje), og pasienten løfter nye gjenstander over hodet.
  - Preparatglass med formalin: i skatterom, i risikorom etter rydding, og to etter hver sjef der det ene er et blodoffer som koster et hjerte. Vaktmesteren selger én kuriositet.
  - Åtte ukjente piller med 15 mulige virkninger, fordelt tilfeldig per løp og identifisert først når de tas. Medisinluka selger ukjente piller.
  - Nye fiender: kjøttflue (sverm), vandrende svulst (føder fluer), hostende lunge (skyter slim). Svulsten spruter puss og fluer når den dør.
  - Blodsøl og puss blir liggende på gulvet (opptil 160 per etasje), med beinbiter som partikler.
  - HUD viser kuriositetene i en rad under navnet. Journalen har fått fanen Kuriositeter med gjenstander, synergier, forvandlinger og kjente piller.
- Kroker lagt inn i 20_actors (skade, hjerter, fart, rekkevidde, slagtakt, rulling, treff, drap, piller, fiende-KI), 05_world (flaks i krit, treff på spilleren) og 30_game (etasje, låsing, rydding, samhandling, butikker, HUD, journal).
- Manifest og ART_BRIEF.md oppdatert: 199 bildedeler, kuriositetene er ny runde 1 for ChatGPT. DESIGN_BRIEF.md har fått del F om kuriositetene og ny rekkefølge i første bestilling.
- Testet: 15 gjenstander gav Fluekongen, seks synergier, 70 i maks helse, ni klumper samtidig, seks fluer i bane og 15 blodflekker etter en kort kamp. Glass i skatterom, sjefsglass og blodoffer virker. Full gjennomspilling og generatortest uten feil.
- GitHub: koblingen i Claude.ai virker fortsatt ikke. Repoet må opprettes av Tom og fylles via Claude Code (se svaret i chatten).

## 2026-09-24 15:37 Repoet pakket ut på GitHub (Claude Code)
- Tom opprettet Tombonator3000/morbidium og lastet opp morbidium-repo.zip. Claude Code pakket ut innholdet i morbidium-mappa til roten av repoet og slettet zip-fila. Arbeidet ligger på grenen claude/funny-newton-cgnzav.
- Leste AGENTS.md, memory.md, todo.md og loggen før arbeidet startet.
- Bygget: `python3 build.py` gav dist/morbidium.html (409 360 tegn, ingen innebygde bilder ennå fordi assets/ferdig/ er tom). dist/ er i .gitignore og sjekkes ikke inn.
- Generatortest: 900 av 900 etasjer gyldige, deterministisk.
- Gjennomspilling i headless Chromium: tittel, innleggelse, kamp, rydding, journal, tjeneste (vaktmester), sjef (Hydroterapeut Ragnvald Rust), luke til neste etasje og død på etasje 3. Ingen feil fra spillkoden.
- Merknad om testmiljøet: Chromium i Claude Code-skyen går ikke gjennom proxyen, så Three.js fra cdnjs og Google Fonts kan ikke hentes derfra. Testen ble kjørt med en kopi av test_spill.py som serverer three.min.js lokalt (hentet med curl). Den eneste konsollfeilen var sertifikatfeil på skriftene, som er miljøet og ikke spillet. Feilboksen «Kunne ikke hente Three.js» dukket opp i første forsøk, og den så ut som den skal.
- memory.md og todo.md oppdatert: repoet finnes nå på GitHub, og publisering krever at grenen flettes inn i main og at Pages settes til GitHub Actions.

## 2026-09-24 15:40 Pull request for grenen
- Tom opprettet pull request fra Claude Code for grenen claude/funny-newton-cgnzav: https://github.com/Tombonator3000/morbidium/pull/1. Nye commits på grenen oppdaterer den.

## 2026-09-24 15:43 Alt flyttet til main
- Tom ba om at alt legges på main, og at arbeidet heretter skjer direkte på main.
- main ble spolt fram til grenen claude/funny-newton-cgnzav (ingen flettecommit, historikken er rett linje) og pushet. GitHub merket pull request 1 som flettet.
- Pushen til main startet arbeidsflyten «Bygg og publiser på GitHub Pages» for første gang.
- memory.md og todo.md oppdatert: jobb på main, pull request-punktet er ferdig.

## 2026-09-24 15:47 Egen mappe for grafikk fra ChatGPT
- Tom ba om en mappe i repoet til grafikken ChatGPT skal lage. Ny mappe gpt-grafikk/ på toppnivå, med gpt-grafikk/LESMEG.md som forklarer filnavn, krav til bildene og hva som skjer etter opplasting.
- gpt-grafikk/ erstatter assets/innboks/, så det bare finnes ett sted å legge bilder. tools/skjaer_ark.py og tools/behandle_bilder.py leser derfra. AGENTS.md, README.md, DESIGN_BRIEF.md, memory.md og tools/lag_brief.py er oppdatert, og ART_BRIEF.md er laget på nytt.
- Pages-bygget (.github/workflows/pages.yml) kjører nå også tools/skjaer_ark.py før behandle_bilder.py. Da holder det at Tom laster opp et ark til gpt-grafikk/ på main; klipping, behandling og bygging skjer av seg selv.
- tools/skjaer_ark.py hopper nå over et ark med feil navn (skriver FEIL og går videre) i stedet for å stoppe. Før kunne for eksempel hoder.png uten serienavn stanse hele Pages-bygget.
- Testet i en kopi av repoet med syntetiske ark på malene: figur_pasient.png gav seks deler, et «ni ting»-ark med ni kuriositeter gav ni, et enkeltbilde med hvit bakgrunn ble renset. hoder.png og tull_og_tøys.png ble hoppet over med melding. 16 bilder bygget inn, og gjennomspillingen gikk uten feil fra spillet (bare skriftene, som før).

## 2026-09-24 15:48 GitHub Pages er oppe
- Første Pages-kjøring som gikk helt gjennom var nummer 2 (commit 9982817). Nummer 1 ble avbrutt fordi en nyere push tok over, slik arbeidsflyten er satt opp.
- Spillet svarer på https://tombonator3000.github.io/morbidium/ (samme størrelse som dist/morbidium.html).

## 2026-09-24 15:48 Pages-bygget med arkklipping virker
- Kjøring 3 (commit 7b89860, første med tools/skjaer_ark.py i arbeidsflyten) gikk grønt gjennom bygg og publisering. gpt-grafikk/ var tom, så klippesteget meldte bare at det ikke fant ark, og bygget fortsatte som det skulle.
- Påminnelsen om å sjekke kjøringen for 9982817 kom etter at den allerede var sjekket og logget (grønn).

## 2026-09-24 15:53 Forsøk på å slette grenen claude/funny-newton-cgnzav
- Tom ba om at den gamle grenen slettes. Sjekket først at alt på grenen (175a92b) finnes i main.
- Den lokale grenen er slettet. Slettingen på GitHub ble avvist med HTTP 403: tilgangen Claude Code har i denne økta, kan pushe commits, men ikke slette grener. GitHub-verktøyene her har heller ingen måte å slette en gren på.
- Grenen må slettes av Tom på GitHub (Branches, søppelbøtta ved grenen, eller «Delete branch» nederst i pull request 1).

## 2026-09-24 16:04 Første evnekort fra ChatGPT
- Hentet originalbildene fra samtalen «Skriv sanatorium roguelite RPG» og la 13 PNG-filer i gpt-grafikk/ med navn fra manifestet.
- Brukte den første, mer detaljerte duen som kort_due.png etter Toms valg.
- Alle bildene er kvadratiske PNG-filer på 1254 ganger 1254 piksler med gjennomsiktig bakgrunn.
- Kjørte bildeverktøyets sjekk: 13 behandlet, 0 feil. Bilder for senere runder er ikke laget ennå.

## 2026-09-24 16:15 Tom: «lag spillet ferdig». Plan og etappe 1
- Tom ba om å fortsette prosjektet og gjøre spillet ferdig. Leste hele kodebasen først. Kjernen (tre etasjer, sjefer, utskrivning, journal, kuriositeter) finnes; det som mangler, står i todo.md.
- Plan i ni etapper, hver testet og pushet til main: 1) testoppsett og kjente svakheter, 2) etasjen Isolat og arkiv med egen sjef og egne sjefsangrep, 3) nye fiender, 4) spesialrom, 5) aktive gjenstander og lommerusk, 6) oppskriftssystem for fiender, 7) musikk, 8) slutt og metaprogresjon, 9) finpuss.
- Etappe 1:
  - tools/test_spill.py tar --three STI (eller MORBIDIUM_THREE) og serverer Three.js lokalt, så testen virker uten nett i nettleseren.
  - Ny test tools/test_ekstra.py: lagring og fortsettelse, stående mobil med berøring, journalen. Flere spillfunksjoner er lagt ut på window for testene.
  - Lagring: løpet lagres ved starten av hver etasje (localStorage, morbidium_run_v1). Tittelen får «Fortsett». Død og utskrivning sletter lagringen.
  - Berøring: evnekortene i HUD-en er nå selve evneknappene. Resten (slag, tungt, rull, snakk, bruk) ligger i en klynge nede til høyre. Kart og menyknapper flyttes opp. På stående mobil dekker kontrollene 34 % av høyden, før rundt halvparten. Et ekte tastetrykk skjuler berøringsknappene.
  - Journalen: kortplassene er mindre og står litt under midten av hjerneområdene, og hvert område har fått navnet sitt skrevet øverst, så fargen og navnet synes.
  - Fiender: sikt sjekkes nå for hele kroppen, ikke bare midtpunktet, og en fiende som står fast i et halvt sekund prøver en annen vei. I en målt test nådde alle 48 fiender fram både før og etter, så svakheten var sjelden; den nye koden fanger resten.
- Tester: generator 900 av 900, gjennomspilling uten feil, test_ekstra alt bestått.

## 2026-09-24 16:18 Evnekortene fra ChatGPT vises riktig
- Tom la inn 13 evnekort i gpt-grafikk/ mens etappe 1 pågikk. Flettet inn (rebase av min upushede commit, loggen og gjøremålene beholdt begge oppføringene).
- Kjørte behandle_bilder.py som Pages-bygget gjør: 13 kort på 256 ganger 256 piksler, ingen feil. Spillfila blir 1,7 MB.
- Feil funnet: innebygde bilder ble lastet asynkront, så kort som tegnes én gang (HUD, journal, butikk) fikk kodetegningen i stedet for bildet. Nå dekodes alle innebygde bilder før tittelen vises (Art.preload, maks 4 sekunder).
- assets/ferdig/*.png er lagt i .gitignore; Pages-bygget lager dem fra gpt-grafikk/.
- Journalen: kortplassene er gjort litt mindre, og navnene på de nedre områdene er flyttet, så ingen navn skjules av kort.

## 2026-09-24 16:31 Etappe 2: Kjelleren: Isolat og arkiv, og egne sjefsangrep
- Spillet har nå fire etasjer: 1. etasje: Mottak og bosted, Underetasjen: Behandling og hydroterapi, Kjelleren: Isolat og arkiv (ny) og Under grunnmuren: Dypet (den gamle kjelleren, der Journalen venter). MAX_DEPTH er 4.
- Ny fil src/13_rom.js: rekvisitter for den nye etasjen (polstret celle over to ganger to ruter, arkivhylle over tre ruter, madrass, tvangstrøye på stativ, papirhaug som kan knuses).
- Nye rommaler i generatoren: isolat (polstrede celler langs veggene, madrasser, tvangstrøyer) og kartotek (rader med arkivhyller som danner smug, papirhauger). Generatortesten dekker nå alle fire etasjer: 1200 av 1200 gyldige.
- Ny fil src/22_sjefer.js: Overarkivar Gunhild Paragraf (tegnet i kode: grå knute med blyant, lorgnett, kjole med kartotekskuffer, stort stempel) og signaturangrep for alle sjefene:
  - Krok: hektekrok som drar pasienten inn til et kutt, og kjettingsving rundt seg (dobbel når han er rasende).
  - Rust: flom (vannpytter over hele rommet som får strøm etter et gult varsel) og høytrykksspyler som feier i tre strøk.
  - Arkivaren: stempelregn, virvel av løse skjemaer, og isolat: en ring av polstrede vegger rundt pasienten i fire sekunder mens stemplene faller inni.
  - Journalen: sider i spiral, «signer her» med Morbidium-blekk som blir liggende, og omskriving der den låner et angrep fra en av de andre sjefene.
- Sjefene har egen kø for forsinkede handlinger, så angrepene følger pause og tidsfall. Egne dødsårsaker per sjef. Nye høyttalermeldinger, sjefsreplikker og tre nye journalfragmenter.
- Fiendenes helse og skade stiger litt saktere per etasje (0,3 og 0,17 i stedet for 0,35 og 0,2), siden det nå er fire etasjer.
- Tester: test_ekstra kjører alle fire sjefer med alle angrep og sjekker at luken åpnes. Alt bestått, ingen konsollfeil. Feil funnet og rettet underveis: isolatveggene forsvant med en gang, og teksten på stempelet ble speilvendt.

## 2026-09-24 16:39 Etappe 3: fem nye fiender
- Ny fil src/26_fiender.js med fem fiender, tegnet i kode, med egne replikker og dødsårsaker:
  - Pasient i tvangstrøye: hopper, ruller seg som en kjegle mot pasienten (spinner rundt), og stanger på kort hold. Vanligst i isolatene.
  - Byråkrat (grønn skjermlue, blyant bak øret): holder avstand, kaster tre skjemaer i vifte, eller stempler en «kølapp» der pasienten står som holder hen fast i et sekund.
  - Narkoselege (gassmaske, eterkolbe): kaster eter som blir en sky på gulvet. I skyen går pasienten 40 % tregere og sovner litt etter drøye to sekunder. Heliumlunge beskytter.
  - Arkivrotter: kommer alltid tre og tre, små, raske og svake, med et skjema i munnen.
  - Øyeblomst: står fast i gulvet (kan ikke dyttes), skyter langsomme Morbidium-kuler som følger etter pasienten, og slår rundt seg når noen kommer for nær.
- Fordeling: tvangstrøye fra etasje 1, narkoselege fra etasje 2, alle i Isolat og arkiv, øyeblomst og rotter i Dypet. Isolat-rom trekker mot tvangstrøyer og kartotek mot byråkrater. Overarkivaren kaller inn byråkrater.
- Motoren: fiendeskudd kan være målsøkende, fiender kan ha egen kø for forsinkede handlinger, og oppførselslistene (trekke seg unna, snakke, holde ting, hoppe) er gjort generelle.
- Test: alle fem satt ut rundt pasienten i fem sekunder. Rottene kom i flokk, gass-skyen oppstod, pasienten tok skade, ingen konsollfeil. Rettet: tvangstrøye-pasienten så ut som en bamse bakfra.

## 2026-09-24 16:44 Kuriositeter og piller fra ChatGPT
- Tegnet fem bildeark med alle 40 kuriositetene fra manifestet, ett ark med åtte piller og et tomt preparatglass. Bildene har gjennomsiktig bakgrunn og følger den varme, håndtegnede sanatoriestilen.
- Kontrollerte rutene for motiver som krysser grensene, og rettet de tre arkene som trengte det.
- Prøvde hele bildeflyten i en egen kopi av repoet. Alle 40 kuriositeter, åtte piller og glasset ble behandlet, og byggingen tok med 62 bilder totalt uten feil.

## 2026-09-24 16:50 Etappe 4: spesialrom
- Hemmelig rom i hver etasje: generatoren legger et lite rom i en tom celle ved siden av et vanlig rom, med en korridor som er stengt av en sprukken murvegg der den møter rommet. Tre vanlige slag, ett tungt slag, en eksplosjon (nitroglyserin, eksplosiv pille) eller et stempel knuser veggen. Det støver fra sprekken når pasienten er i nærheten. Inni: en kuriositet i preparatglass, en journalside, tenner og en pille.
- Forbannet rom (rundt hver femte etasje, i en blindvei): tornemerker og rødt lys ved døra, og tornene tar ett hjerte hver gang pasienten går inn (aldri det siste). Midt i rommet står en kuriositet fra blodhylla på et skjevt tegnet pentagram («IKKE TRÅKK»). Tar du den, låses dørene og et bakhold med to eliter kommer.
- Blodofferrom (en av tre etasjer, oftere lenger ned): et alter som tilbyr tre av seks handler, for eksempel et hjerte for en kuriositet, halve tennene for en kuriositet, et evnekort for to poeng, 30 helse for 40 tenner, mørke for styrke eller slipingen for et hjerte. Én gave per alter, eller «Gå din vei».
- Blod er ny væsketype i vannshaderen, og leder strøm.
- Kartet viser spesialrommene med egne farger og tegn (* for skatt og hemmelig rom, ! for forbannet, O for offer).
- Generatoren: validering tar hensyn til den sprukne veggen, sløyfekravet teller ikke det hemmelige rommet, og midten holdes ikke lenger fri i spesialrom. 1200 av 1200 gyldige, 1,01 forsøk i snitt.
- Test: tungt slag knuser veggen, tornene tar et hjerte, kuriositeten utløser bakhold som kan ryddes, alteret tar imot én gave. Ingen konsollfeil.

## 2026-09-24 16:51 Spillerfigur fra ChatGPT
- Tegnet figur_pasient.png med tre vinkler av hode og tre vinkler av gul morgenkåpe uten armer og bein. Justerte plasseringen for å holde hodene og kroppene i hver sin rad.
- Prøvde arket i en egen kopi med samme bildebehandling og bygging som GitHub bruker. Seks figurdeler ble laget; 68 bilder ble behandlet uten feil og tatt med i spillfila.
- GitHub Pages bygde og publiserte den forrige leveransen med kuriositeter og piller uten feil.

## 2026-09-24 16:54 Kuriositetene fra ChatGPT i spillet, og mindre spillfil
- Flettet inn Toms commit med fem kuriositetsark, et pilleark og et tomt preparatglass. Kjørte bildeflyten slik Pages-bygget gjør (i en kopi, så arkene i repoet ikke flyttes): 62 bilder, ingen feil.
- Problem: med alle bildene ble spillfila 6,6 MB, tungt på mobil. Spillet tegner uansett alle deler i 128 piksler per enhet (PX i 10_art.js), så 256 var bortkastet. tools/behandle_bilder.py lagrer nå i 128 piksler per enhet og med en palett på 256 farger (--full-farge slår paletten av). Forskjellen synes ikke. Spillfila er nå 0,95 MB med alle 62 bildene.
- Fylte preparatglass bruker nå glasset fra ChatGPT: formalin og kuriositeten tegnes bak, glassbildet legges over. Før ble fylte glass tegnet av koden og tomme av ChatGPT.
- Feil funnet og rettet: et glass uten innhold ga en feil hvert bilde i samhandlingen. Spillet lager ikke slike glass selv, men vakten er lagt inn.

## 2026-09-24 16:59 Spillerfiguren fra ChatGPT sjekket i spillet
- Flettet inn figur_pasient.png. Bildeflyten klipper arket til seks deler (hode og kropp forfra, bakfra og fra siden), 68 bilder totalt, spillfila 1,0 MB.
- Så på pasienten i spillet forfra, bakfra, fra begge sider, i gange og i tungt slag: delene sitter riktig på festepunktene, og armene og beina som koden tegner, passer til morgenkåpen.
- Alle tester kjørt med alle 68 bildene bygd inn: gjennomspilling og test_ekstra uten feil.

## 2026-09-24 17:07 Etappe 5: apparater og lommerusk
- Ny fil src/27_utstyr.js.
- Apparater (aktive gjenstander, én plass): defibrillator, tannlegebor, stempelpute, adrenalinsprøyte, blodpose, kamera med magnesiumblits, forstanderens stoppeklokke (fiendene går i sakte film), duebur, vaktmesterens meisel (hele kartet og knuser sprekker) og grammofon med vuggevise. De lades ett streik per ryddet rom, sjefen gir to. Brukes med V (eller X), D-pad opp eller Aktiv-knappen på berøringsskjerm. Et nytt apparat bytter ut det gamle, som blir stående igjen i et glass.
- Lommerusk (én plass): hestesko, tannlegespeil, knappenål i fôret, lånekort med stempel, lekkende batteri, kaninpote fra tøffelen, morfindråpe, sprukket monokkel, rusten skalpell, tørket frosk (tar ett dødelig slag per etasje), kølapp nummer 1 og halspastill.
- Hvor de finnes: skatterom (hvert fjerde glass er et apparat), hemmelige rom (annethvert), kister (nytt valg), vaktmesteren (ett apparat og ett hittegods), eliter og knuste møbler (lommerusk av og til).
- HUD: apparatet vises ved siden av lomma med ladestreker og tast V, lommerusket med gullring først i gjenstandsraden. På berøringsskjerm dukker Aktiv-knappen opp i klyngen når pasienten har et apparat. Journalens kuriositetsfane viser begge.
- Begge lagres med løpet. README har fått V i kontrollene.
- Test: defibrillatoren skader og tømmer ladningen, ett streik per ryddet rom, bytte gir glass med det gamle, frosken redder fra døden, lommerusk byttes, og alt overlever lagring. Ingen konsollfeil.

## 2026-09-24 17:10 Personaldeler, sko og småobjekter fra ChatGPT
- Tegnet tre delark til personalet: hoder, hodeplagg og uniformer i tre vinkler, 27 deler totalt. Justerte størrelser og rutene slik at arkene kan klippes uten sammenblanding.
- Tegnet et ni ruters ark med fire sko, hjerte, Morbidiumdråpe, gulltann, due og eterflaske. Rettet tøffelen, hjertet og duen etter visuell kontroll.
- Prøvde alle ark i en egen kopi av den nyeste hovedgrenen. Verktøyene laget 27 personaldeler og ni nye enkeltbilder, behandlet 77 bilder uten feil og bygde spillfila med 77 innebygde bilder. Personaldelene venter på oppskriftssystemet før de blir synlige i spillet.

## 2026-09-24 17:14 Resten av plukk og effekter fra ChatGPT
- Tegnet og kontrollerte de siste ni småbildene: tre beholdere, tre støvpuff, skyggehånd, stempelmerke og treffstjerne. Krympet skyggehånden så ingen motiv krysser rutekanten.
- Prøvde arket med bildebehandling og bygging i en egen kopi. 86 bilder ble behandlet uten feil og tatt med i spillfila. Hele den opprinnelige runden med 14 plukk og effekter er nå tegnet.

## 2026-09-24 17:16 Våpen fra ChatGPT
- Tegnet de sju våpnene i ett ni ruters ark med de to siste rutene tomme. Skaftene vender ned og virkedelen opp, slik at spillet kan rotere våpnene selv.
- Prøvde klipping, bildebehandling og bygging i en egen kopi. Alle sju våpen ble laget; 93 bilder ble behandlet uten feil og tatt med i spillfila.

## 2026-09-24 17:50 Grovere ansikter og to spillerfigurer
- Tom ønsket at ansiktene skulle bli mer morbide, stygge og stiliserte. Brukte referansene som retning for asymmetri, ujevne tenner, øyeposer og røffe blekkstreker uten å kopiere figurene i dem.
- Tegnet to nye voksenvarianter av spilleren, kvinne og mann, hver som seks figurdeler i samme mal som standardpasienten. Den mannlige varianten er også tatt i bruk som nytt standardark, og de ni personalhodene er tegnet om i samme grovere stil. Ikoner og utstyr er ikke endret.
- Prøvde klipping, bildebehandling og bygging i en egen kopi. Standardfiguren gir seks behandlede deler, personalarket gir ni deler, og spillet bygges med 93 bilder uten feil. De to ekstra variantarkene ligger i gpt-grafikk/varianter/ til Claude registrerer dem i manifestet og lager figurvalg.

## 2026-09-24 18:02 Første gruppe rekvisitter og møbler
- Tom ba om å starte runden med rekvisitter og møbler. Tegnet åtte enkeltbilder i trekvart perspektiv: alter, kafeteriadisk, medisindisk, vaktmesterbenk, venteværelsesbenk, sykehusbord og stol forfra og bakfra.
- Bildene har gjennomsiktig bakgrunn, og stolens to vinkler er tegnet etter samme møbel. Kontrollerte de ferdig behandlede bildene visuelt.
- Prøvde hele bildeflyten i en egen kopi. 101 bilder ble behandlet uten feil og bygget inn i spillfila. Oppdaterte designbriefen slik at den gjenspeiler Toms beslutning om møbler som enkeltbilder.

## 2026-09-24 18:31 Toms tilbakemelding (åtte punkter), første runde: feil, tjenesterom, lik og journal
- Tom spilte og sendte åtte punkter med skjermbilder: journalen ruller, tjenesterommene ser ikke ut som seg selv (ingen vaskemaskin foran «Undersøk vaskemaskinen»), pasientene ser like ut, mangler bruksanvisning og ordentlige innstillinger, arkivet og UI-et er kjedelig, noen fiender dør ikke, likene synes dårlig, og sjefer blir usynlige.
- Usynlige sjefer (punkt 8): en feil. Slag-angrepet registrerte sjefens figur som en effekt med null levetid, og effektlisten fjerner objektet når levetiden er ute. Sjefen levde videre, men usynlig. Linja er fjernet.
- Fiender som ikke dør (punkt 6): en automatisk spiller ryddet alle rom i alle fire etasjer; alle vanlige fiender døde. Sannsynlige forklaringer, som alle er rettet:
  - Personalet i tjenesterommene (for eksempel Søster Hansen i hvit uniform) kunne stå midt i rommet når disken ikke fikk plass, og så ut som fiender som ikke tok skade. Nå står de alltid bak disken, har navneskilt og sier fra hvis de blir slått.
  - Hallusinasjoner (høyt Morbidium eller Kosmisk innsikt) ble stående for alltid hvis forvrengning var slått av eller pasienten døde. Nå forsvinner de alltid, og et slag gjennom dem viser «ikke ekte».
  - Vern mot ugyldig helse (NaN) i skadeberegningen, så en fiende aldri kan bli udødelig av en regnefeil.
- Lik (punkt 7): før lå bare siste lik, flatt og forvrengt, i et tilfeldig rom. Nå lagres hvert dødsfall med etasje og nøyaktig posisjon (de åtte siste), og likene legges der pasienten døde, eller så nær som gulvet i den nye etasjen tillater. De tegnes som en liggende pasient med lapp på tåa, blodpøl og fluer, og hvert lik kan undersøkes. Eldre lagring flyttes over automatisk.
- Tjenesterom (punkt 2): hovedrekvisitten (disk, vaskemaskin, journalskap) prøves fra midten av veggen og utover, blir kortere om nødvendig, og en etasje godtas ikke uten den. Personalet står bak disken. Nye rekvisitter: menytavle («DAGENS: SUPPE»), medisinskap, personvekt, verktøytavle, bøtte med mopp, bokstabler, lenestol, linhauger, tørkesnor og strykebrett. Kafeteriaen har bord med stoler.
- Journalen (punkt 1): hele boka skaleres til skjermen, uten rullefelt. På stående mobil vises én side om gangen med en knapp for å bla. Kuriositetslisten er i to kolonner.
- Oppskriftssystemet (fra etappe 6, klart før tilbakemeldingen) er tatt med: fiender kan få farget klær, tilbehør i ansiktet og ulik størrelse, og av og til bli navngitte mestere med en egenskap (tykkhudet, oppjaget, eksplosiv, todelt, blodsuger, pestbærer, oppblåst, krympet, gjennomsiktig, lommetyv, pansret) og navneskilt. Delene fra ChatGPT (assets/deler/) bygges inn av build.py og brukes når de finnes.
- Flettet inn Toms fire nye leveranser fra ChatGPT (personaldeler, sko og småting, våpen, plukk og effekter, grovere ansikter og to nye spillerfigurer).
- Tester: generator 1200 av 1200, gjennomspilling uten feil, test_ekstra alt bestått (nye tester for lik og oppskrifter; tre tester gjort uavhengige av tilfeldigheter).

## 2026-09-24 18:41 Personaldelene fra ChatGPT får riktig størrelse
- Hodene på personalarket er tegnet omtrent 1,6 ganger større enn hjelpesirkelen i malen. I spillet ble de dobbelt så store som kroppen, og hattene havnet ved siden av hodet.
- build.py klipper nå hver del til det som faktisk er tegnet (gjennomsiktige kanter bort) og lagrer bredde og høyde. Oppskriftssystemet skalerer hoder og kropper inn i spillets egne rammer for figurdeler, og hatter, hår og tilbehør plasseres og skaleres etter hodet de sitter på.
- Sjekket med skjermbilde av åtte pleiere, oppassere, byråkrater og narkoseleger: hodene passer kroppen og hattene sitter på hodet.
- Tester: generator 1200 av 1200, gjennomspilling uten feil, test_ekstra alt bestått.

## 2026-09-24 18:47 Alle rekvisitter og møbler fra ChatGPT
- Tegnet de 43 resterende enkeltbildene fra møbelrunden. Skap og hyller har egne forside-, bakside- og sidevisninger. Seng, båre og badekar har fire retninger hver. Den døde pasienten har det grovere, komisk morbide ansiktet Tom ba om.
- Kontrollerte at alle 51 filnavnene i kunstlisten har egne PNG-filer med gjennomsiktig bakgrunn. Så på representative spillklare bilder, blant annet kjetting, lik, hyller, skap, badekar og medisintralle.
- Prøvde hele bildeflyten i en egen kopi av Claudes nyeste hovedgren. 144 bilder ble behandlet uten feil, og spillfila ble bygget med alle 144 bildene og 27 personaldeler. Ingen spillkode ble endret.

## 2026-09-24 19:03 Varierte pasienter (Toms punkt 3) og fargede armer og bein
- Hver innleggelse setter nå sammen en ny pasient: kjønn (fornavnet følger kjønnet, 18 nye navn), seks hårfarger (grått og hvitt oftere hos eldre), fire hudtoner, fem plagg (morgenkåpe i åtte farger, tvangstrøye med stropper og lukkede ermer, sykehusskjorte med åpen rygg, stripete pyjamas i fem farger, nattserk med blonder), fem slags fottøy (tøfler, klogger, bare føtter, ullsokker, støvler) og av og til pynt (nattlue, papiljotter, hårnett, beskyttelseshjelm, sløyfe, plaster eller sting over panna). 300 tilfeldige pasienter gir over 250 ulike.
- Kvinnefiguren fra ChatGPT er flyttet fra gpt-grafikk/varianter/ og registrert (hode og kropp i tre vinkler). Mannsarket i samme mappe var byte for byte likt standardfiguren og er fjernet. Mappa varianter/ finnes ikke lenger.
- ChatGPT-hodene og kåpa farges om i spillet. Hår farges bare der det er sammenhengende hår rundt pikselen, ellers ble skjeggstubbene prikker over mørk hud. De nye plaggene og pynten er tegnet i koden og har bildenøkler i manifestet, så ChatGPT kan erstatte dem (LESMEG i gpt-grafikk forklarer filnavnene).
- Utseendet lagres med løpet, i dødslisten og i historikken. Spillerfiguren, medaljen i hjørnet, innleggelseskortet (med en linje om hva pasienten har på seg), journalen, dødskortet, utskrivningskortet og likene bruker det. Likene i likhuset får tilfeldige utseender. Gamle lagringer uten utseende gir standardpasienten.
- Toms nye lik.png (pushet mens dette ble laget) brukes for lik av menn i morgenkåpe. Det farges etter pasientens hår, hud og kåpe og vises like stort som de sammensatte likene, med blodpøl. Andre pasienter får det sammensatte liket, så liket alltid ligner den som døde.
- Feil fra første versjon: armer og bein på alle figurer ble tegnet nesten bare med blekk, fordi båndnettet hadde plass til 900 punkter og trengte rundt 1300 for kontur og farge. Nå har det plass til 3200, og armer og bein har fargene de alltid skulle hatt (ermer, hud, uniform). Gjelder spilleren, fiendene, personalet og sjefene.
- Ny fil src/14_pasient.js. Doll tar egne farger og sko per figur. Nye tester i test_ekstra: variasjon over 300 pasienter, navn som passer kjønnet, figuren bruker riktige deler, fortsatt løp beholder utseendet, likene husker utseendet, gamle lagringer, plass i båndnettet.
- Tester: generator 1200 av 1200, gjennomspilling uten feil, test_ekstra alt bestått.

## 2026-09-24 19:23 Pasienthåndboka, innstillinger med faner, nytt arkiv, ny tittel og pause (Toms punkt 4 og 5)
- Ny fil src/32_meny.js samler tittelmenyen, pausen, innstillingene, pasienthåndboka og arkivet. Alt er papir, skaleres til skjermen og ruller aldri. Smale skjermer får egne oppsett.
- Tittelen er et innleggelsesskjema der knappene krysses av, med et stempel i hjørnet. Pasienthåndboka har fått egen knapp.
- Pausen er en utklippstavle med pasientens portrett, navn, etasje, tenner og antall slåtte fiender, og knapper til journalen, håndboka og innstillingene.
- Innstillingene er et kartotekkort med fem faner. Lyd: hovedvolum, effekter, stemning og musikk hver for seg. Bilde: kameraavstand, styrke på skjermristing (var av eller på), glimt, forvrengning, lys, enkel grafikk. Spill: størrelse på skjermteksten, skadetall, snakkebobler og navneskilt av eller på. Styring: tabell for tastatur og mus, håndkontroll og berøring. Data: slett lagret løp eller brenn arkivet, begge med to trykk. Gamle innstillinger flyttes over.
- Pasienthåndboka er et grønt hefte med åtte kapitler (Velkommen, Styring, Kamp, Journalen, Morbidium, Ting du finner, Rommene, Døden). Tekstene er skrevet ut fra hvordan spillet faktisk virker, med bilde fra spillet og en håndskrevet lapp i margen fra en tidligere pasient på hver side.
- Arkivet er et arkivskap med tre skuffer: pasientmapper (portrett i pasientens eget utseende, navn, nummer, alder, hvor langt pasienten kom, dødsårsak, stempel AVDØD eller UTSKREVET, og en gul lapp hvis liket fortsatt ligger i bygget), journalfragmenter (funne som maskinskrevne ark, manglende som tomme plasser) og årsrapport (døde, utskrevne, overleger, dypeste etasje, fiender slått, vanligste dødsårsak, steder å våkne og lik som ligger igjen). Mappene blas i sider.
- Test_ekstra fikk en test for etasje 3 som av og til feilet: med fire kamprom var det omtrent 1 % sjanse for at ingen ble isolat eller kartotek. Generatoren sørger nå for at Isolat og arkiv alltid har minst ett slikt rom, og test_gen sjekker det for alle 300 frø.
- Nye tester i test_ekstra: gamle innstillinger flyttes over, alle faner får plass, kameraavstand og skadetall virker og lagres, alle åtte kapitler får plass uten rulling, arkivet viser mapper med portrett, fragmenter og rapport, pausen går til innstillinger og tilbake.

## 2026-09-24 19:30 Etappe 7: musikk og stemningslyder
- Ny fil src/06_musikk.js: et lite sekvenseringsverk som spiller musikk laget av synth i nettleseren, uten lydfiler. Stilen er en sanatoriumsgrammofon fra 1923.
- Seks stykker: tittelen (spilledåsevals i a-moll), etasje 1 (vals i d-moll med celesta og pizzicatobass), etasje 2 (sakte orgel med drypp fra rørene), etasje 3 (frygisk marsj med cembalo og skrivemaskinklikk), etasje 4 (kor og klokker) og tjenesterommene (en litt for munter vals i dur, filtrert som en gammel grammofon med knitring).
- Musikken har tre lag som toner inn etter situasjonen: grunnlaget spiller alltid, kamplaget legger på trommer og drivende bass når dørene låses, og sjefslaget legger på messing og pauker i sjefskampen. Tempoet øker litt i kamp. Jo mer Morbidium i blodet, jo skjevere blir tonene.
- Stikk ved død (fallende orgel og en dyp klokke) og ved utskrivning (spilledåse i dur). Musikken dempes når journalen eller en meny er åpen.
- Nye stemningslyder per etasje, spilt tilfeldig hvert tiende til tjuende sekund: klokke og knirk i første etasje, drypp og rør i underetasjen, skrivemaskin og rotter i arkivet, skrik og hjerteslag under grunnmuren. Tonerekka fra the-deep-ones er erstattet av musikken (README er rettet).
- Hjerteslag når helsa er under 25 %, raskere jo mindre helse.
- Innstillingene har fått egen glidebryter for musikk. Lyd-fanen har nå hovedvolum, effekter, musikk og stemning.
- Målt i nettleseren: alle stykker spiller, kamp- og sjefslaget kommer inn, ingen klipping (høyeste topp 0,36 i sjefskamp). Ny test i test_ekstra: musikk på tittelen, over i kamp, stopp ved død.

## 2026-09-24 19:37 Etappe 8: merknader, utskrivningsbrev, gjeninnleggelse og mer innhold
- Ny fil src/33_merknader.js. Femten merknader gis for ting pasientene får til: første død, ta tennene fra et lik, behandle hver av de tre første overlegene, bli utskrevet, 100 fiender og fem mestere til sammen, 150 gulltenner på en gang, tre diagnoser i samme løp, en forvandling, 100 Morbidium, alle journalfragmentene, utskrivning på under 30 minutter og utskrivning etter gjeninnleggelse. Hver merknad stemples på skjermen og står i en ny skuff i arkivet.
- Merknadene åpner noe: ni kuriositeter er låst til de er fortjent (knust speil, fanget tannfe, lommekirurgi, hodeskalle med stearinlys, ukontrollert celledeling, svulsten Sverre, hjerte på glass, altfor lang kappe, dikt om mørket), og to nye steder å våkne: Kapellet (en kuriositet og en ekstra evne, men 30 Morbidium fra start) og Vaktmesterens bod (nøkkelknippet og 40 tenner, men Olsen stenger vaktmesterskapet for deg).
- Slutten: når Journalen er behandlet, kommer et utskrivningsbrev fra sanatoriet før kortet. Brevet er skrevet ut fra løpet: tid, antall behandlede ansatte og rom, diagnosene («regnes fra i dag av som personlighet»), kuriositetene (sanatoriet vil ha én tilbake), forvandlinger og Morbidium i blodet. Første gang står det et P.S. om gjeninnleggelse.
- Gjeninnleggelse: etter første utskrivning kan pasienten krysses av for gjeninnleggelse ved innleggelsen. Fiender og sjefer har 30 % mer helse og slår 20 % hardere, mestere dukker opp 60 % oftere, og det faller 25 % flere tenner. Valget huskes.
- Tre nye diagnoser: patologisk samlemani (åtte kuriositeter: mer skade, litt tregere), tannløs grådighet (120 tenner: flere tenner fra fiender, høyere priser) og klinisk blodtørst (60 drap i løpet: hvert drap helbreder, annen helbredelse virker dårligere).
- Sju nye journalfragmenter (18 i alt): kafeteriamenyen, Søster Hansens lommebok, en kvittering fra glassverket, Olsens nøkkelliste, en klage fra en pårørende, Rusts tabell over vanntemperatur og en lapp skrevet med tannkjøtt.
- Musikken stopper nå i selve dødsøyeblikket, og dødsstikket kommer med dødskortet.
- Nye tester: låste kuriositeter dukker ikke opp, merknader låser opp, brevet kommer før kortet, gjeninnleggelse tilbys og gir sterkere fiender.

## 2026-09-24 19:40 Hele kunstlisten er tegnet
- Tegnet ni nye figurark. Pleier, oppasser og kultist har hode og kropp forfra, bakfra og fra siden. Bibliotekar, Hansen, kokk, Krok, Olsen og Rust har hode og kropp forfra. Ansiktene er skjeve, grove og komisk morbide etter Toms tilbakemelding.
- Tegnet kultistens kappe i tre retninger, et dødt spillerhode og ti småfiendebilder: flue, lunge og svulst fra tre sider samt slukyngel forfra.
- Tegnet de siste småtingene i kunstlisten: ni ansiktstilbehør i ett ark, slimskudd og kortplukk. Justerte Krok og Rust så figurarkene ikke lager ekstra bilder fra nabofelt.
- Kontrollerte hele bildeprosessen i en kopi av den nyeste hovedgrenen. Alle 199 bildefilene i ART_BRIEF.md finnes etter utskjæring. 205 bilder ble behandlet uten feil og bygget inn i spillet sammen med 27 personaldeler. Ingen spillkode ble endret.

## 2026-09-24 19:44 Etappe 9, første del: rablinger, byggeanimasjon, tips og ny kunstliste
- Spor etter tidligere pasienter: i hver etasje kan det stå opptil to rablinger med kritt på gulvet, signert med navn fra arkivet («DAGNY VAR HER»). Leser du rablingen, får du en setning fra pasienten («Ikke stol på Rust.», «Suppa er ikke suppe.», dødsårsaken deres) og hvor det gikk med dem.
- Byggeanimasjon (idé fra threejs-architecture-effects): møblene i et rom står flate og usynlige til pasienten kommer innen seks ruter, og spretter så opp ett og ett med en liten bue, nærmest først. Startrommet er ferdig bygget. Av i enkel grafikk.
- Tips for nye pasienter: små lapper med nål under romskiltet første gang noe skjer (gå, kamp, evnekort, tjenesterom, lite helse, nytt nivå, Morbidium, luka, overlege). Teksten følger enheten: tastatur, håndkontroll eller berøring. Kan slås av under Spill, og vises på nytt fra Data.
- tools/lag_manifest.py dekker nå alle fire etasjer, alle maler (også Kapellet og Vaktmesterens bod), de nye fiendene, sjefene, apparatene, lommerusket og spesialrommene. Den fletter inn nye nøkler og beholder de gamle, så ingen levert ChatGPT-tegning blir foreldreløs. 64 nye nøkler.
- tools/lag_brief.py skriver ART_BRIEF.md med beskrivelse av alt det nye og en kolonne som viser hva ChatGPT allerede har levert: 150 av 287 bilder. Det som gjenstår er mest figurer (fiender, personale, sjefer), apparater og lommerusk, pynt og de nyeste møblene.
- Testrunden med alt dette gikk grønt bortsett fra én for streng grense i musikktesten (den krevde flere enn 8 åttendeler på 2,5 sekunder, som i 84 slag i minuttet er på kanten). Grensen er rettet og testen består. Fjernet ubrukt kode fra første versjon: SVG-ikonene ICONS, de gamle egenskapsnavnene STATS og R.basic. Innleggelseskortene er litt smalere, så alle får plass på én rad. Gjennomspilling og hele bildeflyten med 150 bilder går uten feil.

## 2026-09-24 19:53 Kunstlista oppdatert etter Toms siste leveranse
- Tom leverte figurark for personale og sjefer, småfiender, kappe, dødt spillerhode og ansiktstilbehør. Bygget med alle 205 bilder uten feil, og figurene fungerer sammen med oppskriftssystemet og de fargede lemmene.
- ART_BRIEF.md er generert på nytt: 205 av 287 bilder er levert. Det som gjenstår står uten «ja» i Levert-kolonnen.
- Merknader som fortjenes mens døds- eller utskrivningskortet vises, stemples ikke lenger over overskriften. De står på selve kortet («Merknad: Innlagt for godt» og hva den åpner). Under spill stemples de som før.

## 2026-09-24 20:15 Flere varianter av pasienten
- Tegnet ni separate kroppsbilder for tvangstrøye, sykehusskjorte og stripete pyjamas, hver sett forfra, bakfra og fra høyre side. Tvangstrøyen har en løs stropp, og sykehusskjorten viser knyting og prikkete underbukse bakfra.
- Tegnet nattlue, papiljotter, gjennomsiktig hårnett, beskyttelseshjelm, sløyfe, plaster og sting, samt en bar fot og en ullsokk. Alle 18 nye PNG-filer ligger i gpt-grafikk/ med navn fra manifestet.
- Kjørte utskjæring, bildebehandling og bygging i en kopi av repoet. 223 bilder ble behandlet uten feil og bygget inn sammen med 27 personaldeler. Kontrollerte de ferdige bildene i spillstørrelse. ART_BRIEF.md er generert på nytt og viser 223 av 287 leverte bilder.
- Bildene for klær og pynt brukes foreløpig uten omfarging i src/14_pasient.js. Spillets eksisterende fargevalg for disse delene blir derfor ikke synlige på PNG-bildene før Claude kobler dem på. Bare føtter farges etter hudtonen.

## 2026-09-24 20:20 Toms tilbakemelding: innleggelsesskjema, hodets retning, 3D-prøve
- Tom: innleggelsen bør se ut som et innleggelsesskjema på et mentalsykehus eller en legeerklæring, hodet på spillerfiguren matcher ikke retningen på kroppen, og planene om mer 3D i rommene skal prøves. Balansen virker grei så langt, men må sjekkes mer.
- Innleggelsen er nå ett dokument: «Innleggelsesskjema og legeerklæring», skjema 13-A fra Morbidium sanatorium med logo, skjemanummer og dato. Feltene er fylt ut for hånd i blått blekk: navn, alder, kjønn med avkrysning, hva pasienten er innlagt for, hva pasienten har på seg ved ankomst, tidligere innleggelser og pårørende. Fotografiet ved ankomst er festet med binders. Legens vurdering står for hånd. Oppvåkningsstedene er feltet «Plassering. Kryss av ett felt», og når du velger, krysses feltet av og skjemaet stemples INNLAGT før spillet starter. Signatur fra H. Krok, rundt stempel og liten skrift om at samtykke ikke anses nødvendig. Egen smal utgave på mobil.
- Hodets retning: hode og kropp bytter alltid visning sammen, og alle sidebildene fra ChatGPT ser samme vei (sjekket alle fem figurark). Det som så feil ut, var at figuren alltid vendte seg mot musepekeren, også når bare tastaturet ble brukt og musa lå i ro et annet sted. Da gikk kroppen én vei mens ansiktet så en annen. Nå ser figuren dit den går når musa har ligget i ro over 1,2 sekunder, og vender seg mot musa så snart den flyttes, du slår, bruker en evne eller står stille. Siktet for evner følger fortsatt musa.
- Tester: gjennomspilling, lagring, pasienter, merknader, bygging og en ny test for retningen (går til venstre med musa i ro til høyre: ser til venstre; musa flyttes: ser mot musa).
- Toms nye ChatGPT-bilder for tvangstrøye, sykehusskjorte, pyjamas og pynt var i bruk uten spillets fargevalg. Nå farges de: grunnfargen i hvert bilde er målt (skjorta lyseblå, pyjamasstripene grå-blå, lerretet i tvangstrøya, rødt i nattlua og sløyfa), og den flyttes til fargen pasienten har fått. Standardfargen viser bildet uendret. Sykehusskjorta får også hudtonen i den åpne ryggen. Kontrollert med 16 tilfeldige pasienter.

## 2026-09-24 20:34 Prøve på 3D-rom (planen fra 14:43)
- Ny fil src/15_rom3d.js. Slås på under Innstillinger, Bilde: «Rom i 3D (prøve)», eller med #3d bak adressen. Av som standard, så Tom kan sammenligne.
- Mørk natt: svakt grunnlys, kaldt måneskinn fra venstre som kaster ekte skygger, og åtte punktlys som hvert bilde fordeles på de nærmeste lyskildene (rompølene, lampene, stearinlysene, alterne, kistene, spillerens lykt først). Lyskildene er de samme som den tegnede lysstilen bruker, så alt som lyser i dag, lyser også i 3D.
- Vegglamper med glødende pære og vinduer med måneskinn og en lysstripe ned mot gulvet på bakveggen i hvert rom.
- Gulv, vegger, plakater og dekaler får tegneserieskygging (tre trinn) og tar imot skygger. Glød (bloom) rundt pærer og flammer i etterbehandlingen.
- Lavpoly-møbler med blekkstrek (omvendt skall): kasser, bord med duk og tallerken, stoler, benker, senger, bårer, operasjonsbord, badekar, skap, kommoder, hyller med bøker, garderober, skap med skuffer, journalskapet, disker med suppegryter, rødt kors eller skruestikke, søyler, søppelbøtter, kurver, kister, altere, vaskemaskiner, traller, lamper, stearinlys og skattekister. Resten (planter, toaletter og lignende) er fortsatt tegnede plater, men lyses og kaster skygge etter tegningen.
- Figurene er fortsatt 2D: de lyses av de samme lampene (fargen regnes ut fra punktlysene rundt dem hvert bilde) og kaster skygge etter omrisset, også armer og bein.
- Alt bygges oppå den vanlige etasjen og kan slås av uten å bygge etasjen på nytt: materialene byttes tilbake, modellene fjernes og platene vises igjen. Følger med til nye etasjer og tittelskjermen.
- Vurdering etter bildene: stemningen med lyspøler og måneskygger fungerer, og søyler, lamper og møbler får tydelig dybde. De enkle modellene er mindre detaljerte enn tegningene fra ChatGPT, så en ordentlig 3D-versjon trenger bedre modeller eller teksturer tegnet av ChatGPT på modellene. Ytelse er ikke målt på ekte maskinvare; skyggekart 2048 og åtte punktlys kan bli tungt på mobil.
- Ny test i test_ekstra: slå på, modeller, lys og glød finnes, følger med til etasje 2, og alt er tilbake som før når det slås av.

## 2026-09-24 20:42 Apparater og lommerusk tegnet
- Tegnet ti ikoner for aktive apparater og tolv små ikoner for lommerusk som enkeltbilder med gjennomsiktig bakgrunn og nøkkelnavn fra manifestet. De ligger i gpt-grafikk/.
- Kjørte utskjæring, bildebehandling og bygging i en kopi. 245 bilder ble behandlet og bygget inn uten feil, sammen med 27 personaldeler. ART_BRIEF.md er generert på nytt og viser 245 av 287 leverte bilder.

## 2026-09-24 21:00 Siste rombilder tegnet
- Tegnet de 22 manglende bildene av rekvisitter, møbler og gulvfarer. De omfatter blant annet arkivhylle, polstret celle, kafeteriadisk, medisinskap, offeralter, vaskerom, sprukken vegg og to verktøytavler i ulik bredde.
- Kontrollkopien behandlet 267 bilder og bygget dem inn uten feil. Sjekket flere av dem i spillstørrelse. ART_BRIEF.md er generert på nytt og viser 267 av 287 leverte bilder.

## 2026-09-24 21:02 3D bare for rommene, strekarmer og strekbein
- Tom: figurene og tingene skal fortsatt være 2D, så alle bildene vi har laget brukes. Bare selve rommene, gulvet og effektene skal være 3D. Han vurderer også armer og bein som tynne streker, som i Conan Chop Chop.
- Lavpoly-møblene er fjernet fra src/15_rom3d.js. Alle ting i rommene er de samme tegningene som ellers, men de lyses av lampene og kaster skygge etter tegningen. Den gamle skyggeflekken under tingene kommer tilbake når 3D slås av (den ble før liggende gjemt).
- Rommene har fått egen dybde: fotlist, brystlist og taklist stikker ut av alle høye vegger der veggtegningen allerede har dem, og pilastre med sokkel og kapitel står hver tredje rute på bakveggen, midt mellom vegglampene og vinduene. Hver del har blekkstrek på sidene og under. Dører og plakater får være i fred (Paint husker hvilke veggfelt som er opptatt), og vegglamper havner heller ikke oppå dem.
- Gulvflisene har fått relieff (fugene tar lyset), og støvkorn svever i lyset rundt lampene, vinduene og lykta.
- Strekarmer og strekbein: tynne mørke blekkstreker med små runde hender, på spilleren, fiendene, personalet, portrettene i journalen og på kortene, og på likene. Det er standard nå. Under Innstillinger, Bilde kan det byttes tilbake til de tykke armene og beina i klesfargen.
- Rettet en feil i innstillingene: panelet mistet alle endringer etter den første til det ble åpnet på nytt, fordi innstillingene ble byttet ut med et nytt objekt hver gang. Nå oppdateres det samme objektet.
- Testene er oppdatert: 3D-testen sjekker lister og pilastre, støv, at tingene er tegningene og kaster skygge, og at alt er som før når 3D slås av. Ny test for strekarmene (standard, bytte til tykke og tilbake).

## 2026-09-24 23:19 Hele den utvidede kunstlisten er levert
- Tegnet de siste 20 figurfilene: Journalen, øyeblomsten, arkivrotta og tvangstrøyepasienten fra tre vinkler, slukyngelen bakfra og fra siden, og hode og kropp til Overarkivaren, byråkraten og narkoselegen.
- Kontrollerte at alle 64 bilder som manglet ved starten av arbeidet ligger i gpt-grafikk/ som PNG med gjennomsiktig bakgrunn. De omfatter 22 ikoner, 22 rombilder og 20 figurbilder.
- Kjørte utskjæring, bildebehandling og bygging i en separat kopi av den nyeste hovedgrenen. 287 bilder ble behandlet uten feil, og 287 bilder samt 27 personaldeler ble bygget inn. Sjekket flere ferdig skalerte figurer visuelt.
- Genererte ART_BRIEF.md på nytt. Den viser 287 av 287 leverte bilder. Ingen spillkode ble endret.

## 2026-09-25 16:35 Ny økt: 3D, grafikk, blod, nye fiender, sjefer, håndbok og HUD
- Tom ba om å fortsette: gjøre 3D til standard og så bra som mulig, bedre shadere og effekter med blod og skrekk, lage de groteske fiendene ChatGPT har foreslått (Kasteren, Trillepasienten, Den Store Klumpen, Hviskekoret, Speilpasienten), et system for å animere 2D-objekter, tilfeldige sjefer og minisjefer, en fiendeindeks med bilder i Pasienthåndboka, og forslag til hvordan ChatGPTs HUD-skisser (HUD, pause og journal) kan leveres som grafikk.
- Leste AGENTS.md, memory.md, todo.md, loggen og koden. Denne økta jobber på grenen claude/practical-babbage-nc80bu (satt av miljøet), som er lik main.
- Testmiljø: Playwright 1.56.0 og Pillow installert, three.min.js hentet med curl. Bildeflyten kjørt i en kopi av repoet: 287 bilder behandlet uten feil, fullbygg med 287 bilder og 27 deler. Grunnlinje: generator 1200 av 1200, gjennomspilling uten feil, test_ekstra 73 av 73.
- Pakken ChatGPT nevner for Kasteren («Pakken til Claude») ligger ikke i repoet. Kasteren lages derfor i koden, med filnavn klare for ChatGPTs bilder.

## 2026-09-25 17:09 3D som standard, animasjonssystem, blod og skrekk, bedre lys
- 3D er nå standard. Eldre innstillinger (uten versjon) får 3D slått på én gang (sv: 2). Enkel grafikk og trygg modus slår det fortsatt alltid av, og #2d i adressen slår det av.
- Grafikkvalitet under Bilde: automatisk, lav, middels eller høy. Høy: skyggekart 2048, åtte punktlys, glød, 192 støvkorn, tilt-shift, lysstråler, tåke, kantlys. Middels: 1024, seks lys, uten tilt-shift, oppløsning høyst 1,5. Lav: 512, fire lys, uten glød, støv, stråler og tåke, oppløsning 1. Automatisk starter på høy (middels på berøringsskjerm) og går ned et trinn etter to lave målinger på to sekunder hver (under 40, 30 og 22 bilder i sekundet). Etter lav slås 3D av med en lapp om hvorfor. Hopper over fanebytter og automatiske testnettlesere.
- Ny fil src/16_anim.js: spriteark (anim_<navn>.png) med like store ruter og samme festepunkt, eller ruter tegnet av koden når bildet mangler. Anim.lag spiller av som stående eller liggende plate, i løkke, én gang, baklengs eller stående på siste bilde, og lyses av lampene i 3D. Positurer (POSER: kast, brøl, grip, sving) med nøkkelbilder for hender, lening, hode, klem og hopp, brukt av Doll.update med st.pose. build.py legger rutenettet fra manifestet inn som ANIM_ARK, og behandle_bilder.py skalerer spriteark uten å beskjære dem. Tegnede animasjoner: kasteklump, kastesprut, blodsprut, øye i veggen og kjøttbiter.
- Ny fil src/34_blod.js: blodflekkene er samlet i InstancedMesh-er (én per tekstur), våte og blanke i 3D (Phong som lyser litt selv, så de ikke blir svarte i mørket). Sprut i slagretningen, blod på veggene med dråper som renner ned, blodige fotspor når pasienten tråkker i ferskt blod, blodspor etter sårede fiender og pasienten, kjøttbiter som spretter og blir liggende etter tunge drap, blodsky ved drap, tak som drypper vann i underetasjen og blod i Dypet, og øyne som åpner seg i veggene og følger pasienten med blikket når Morbidium er over 50.
- Etterbehandlingen: blod på skjermen etter treff (små treff viser bare kanten, store kryper lenger inn og sklir nedover), årer som banker i takt med hjertet ved lite helse, tilt-shift på høy kvalitet, kalde skygger og varme høylys i 3D, og svake filmriper som blir tydeligere lenger ned i bygget.
- 3D: kantlys på alle tegninger fra den sterkeste lampen (en smal lysstripe innenfor blekkstreken på siden som vender mot lyset), lysstråler fra vinduene med sprossen som mørk stripe og støv i lyset, vinduet tegnet i lys på gulvet, lyskjegler under vegglampene, lamper som flimrer (flere lenger ned), mørke der alle lys slukner og flimrer tilbake (brukes ved mye Morbidium, og av sjefene), og bakketåke i to lag over gulvet.
- Ny innstilling «Blod og skrekkeffekter» (standard på) slår av alt utover de vanlige flekkene.
- Tester: generator 1200 av 1200, gjennomspilling uten feil.

## 2026-09-25 17:31 Nye fiender, Den Store Klumpen, tilfeldige sjefer og minisjefer
- Ny fil src/29_monstre.js med skapningene ChatGPT foreslo, tegnet i koden i samme stil (tykk blekkstrek, skjeve, grove ansikter):
  - Kasteren: gammel mann med vill, grå sveis, digre briller, tunga ute og flekkete kåpe. Holder avstand, merker treffstedet, løfter armen (positur «kast») og kaster en snurrende klump i bue (animasjonen kasteklump). Klumpen lander med en brun sprut og legger et søl som gjør pasienten treg. Mestere og eliter kaster tre.
  - Trillepasienten: i knirkende rullestol med rutete teppe, infusjonsstativ og bandasje over det ene øyet. Svinger tregt, kjører på deg i full fart (BONK i veggen) og kaster bekken. Hjulet ruller etter hvor langt stolen faktisk flytter seg.
  - Speilpasienten: et håndspeil som hode, og speilet viser ansiktet til pasienten du spiller, speilvendt og sprukket. Går i sporet ditt 1,25 sekunder bak, slår der du var for et øyeblikk siden, og blender deg med lyset fra lampene. Knuses den, flyr sju glasskår ut, og du får sju års ulykke (mindre flaks resten av etasjen).
  - Klumpunge: små kjøttklumper med ett ansikt.
  - Minisjefer: Hviskekoret (kormesserskjorte full av munner og ører, stearinlys på toppen, ord som prosjektiler, røyk som gir Morbidium, korskrik du må rulle gjennom), Tannlegen (pannespeil, voksbart, gulltenner; trekker tennene dine og slipper dem bak seg, tannregn, bor og «NESTE!») og Den hodeløse portieren (kaster sitt eget hode som biter og kommer tilbake, går i blinde mens det er borte, svinger nøkkelknippet og ønsker velkommen).
- Lagdukke: skapninger av mange tegnede deler som beveger seg hver for seg (munner som hvisker, ører som rykker, ansikter som skriker). Samme grensesnitt som papirdukken. Doll kan nå sitte (sete og hjul) og ta imot positurer.
- Ny fil src/31_sjefpulje.js:
  - Tilfeldige sjefer: etasje 1 til 3 trekkes fra Krok, Rust, Overarkivaren og Den Store Klumpen for hvert løp, uten gjentakelse. Journalen står fast nederst. Helsa følger etasjen. Trekningen lagres med løpet; eldre lagringer får de faste sjefene. Journalens «omskriving» låner angrep fra sjefene du faktisk har møtt.
  - Den Store Klumpen: alle pasientene som ble til én, med fire ansikter, løse øyne, seks armer og nattlue. Klemmer seg sammen og spruter puss rundt seg, slår ned med armene tre eller fire ganger, spytter ut klumpunger og ruller etter deg med et blodspor (BONK i veggen). Egne replikker, tale og dødsårsaker.
  - Minisjefer kommer til slutt i rommet med frivillig risiko, og fra underetasjen av og til i et kamprom lenger inne. Lampene slukner når de kommer, de får egen lilla helsestang og legger alltid igjen et preparatglass og et hjerte. De tåler slag uten å bli svimeslått og skyves mindre.
- Mørke når sjefer kommer: alle lys slukner og flimrer tilbake.
- fiendeBilde(type) tegner hvilken som helst fiendetype forfra til et lerret (til fiendeindeksen).
- Tester: generator 1200 av 1200, gjennomspilling uten feil (sjefen i etasje 1 var Rust denne gangen). Alle sju skapninger lever og angriper uten konsollfeil, alle fem angrepene til Klumpen virker, og minisjefen i risikorommet får helsestang og gir belønning.

## 2026-09-25 18:20 HUD etter ChatGPTs skisse, UI-settet, fiendeindeks, verktøy og tester
- HUD-en følger ChatGPTs skisse: nummerskilt øverst til venstre på evnekortene, en rød sektor som teller ned med sekunder på kortet, ikonknapper for Journal og Pause, kompass med N rundt kartet, og en rød strek på Morbidium-stanga der skrekken starter. Hjertene brytes etter ti per rad, som i Isaac.
- UI-settet (runde 9 i ART_BRIEF.md): ui_panel, ui_knapp, ui_kort, ui_skilt og ui_utklipp er 9-delte rammer (border-image), ui_ring_portrett og ui_ring_kart legges oppå, ui_hjerte_full/halv/tom byttes inn når alle tre finnes, ui_ikon_journal og ui_ikon_pause erstatter ikonene, og ui_hode brukes i Sinnets kart. brukUIsett() tar i bruk det som finnes når spillet starter, og CSS-en tegner resten som før. Prøvd med kunstige bilder i en kopi: alt byttes inn, nedtellingen synes over rammen, og boksene beholder størrelsen (første forsøk krympet lommekortet, så rammen går nå utenpå og elementene beholder sin egen, usynlige kant).
- Fiendeindeksen i Pasienthåndboka: kapittel 9 Fiendene (16 typer) og kapittel 10 Overleger og minisjefer (8), fire kort per side og to på smal skjerm. Kamp-kapittelet viste til kapittel 10 og 11; rettet til 9 og 10.
- behandle_bilder.py: spriteark deles i ruter, rutene finnes ved de tomme stripene når arket har marg, og alle rutene beskjæres og skaleres likt med samme festepunkt, så formatet fra ChatGPT ikke spiller noen rolle. Prøvd med kunstige ark i 1536x1024 og 1024x1024. Alle 287 ekte bilder behandles fortsatt uten feil.
- DESIGN_BRIEF.md: ny del G (HUD og menyer: skissen er fasit for oppsettet, delene leveres hver for seg uten tekst, regler for 9-delte bilder og ringer, og neste steg med ui_bok, ui_fane, ui_stempel, ui_merke, ui_stang og ui_flaske), del H (lagdelte skapninger), del I (spriteark), oppdatert «Hva ChatGPT ikke skal lage» og en ny bestillingsliste. gpt-grafikk/LESMEG.md har de nye filnavnene.
- Adressen godtar nå ?2d, ?3d og ?enkel i tillegg til #. SPRITES, hbSider og saveMeta er lagt ut på window for testene.
- test_ekstra.py: nye tester for 3D som standard og overgangen fra gamle innstillinger, kvalitetstrinnene ned til 3D av, måling av bildefrekvens, animasjonssystemet, blod, de nye fiendene, minisjefene, trekningen av sjefer, alle fem sjefene (også Klumpen) med alle angrep, UI-settet, nedtellingen og fiendeindeksen på bred og smal skjerm. De fleste testene går i 2D (?2d), fordi programvaregrafikken i testnettleseren er for treg i 3D for de tidsfølsomme testene (sprukken vegg, bakhold, byggeanimasjon). En skjult feil i testene: å sette en ny fiende rett til state 'chase' hopper over oppstigningen, så dukken blir stående i skala 0,01. Testene setter nå e.t = 0 i stedet. Spillet selv gjør aldri dette.
- Dokumentasjon: memory.md, todo.md, AGENTS.md og README.md er oppdatert med de nye filene og systemene.
- Tester på det ferdige bygget: generator 1200 av 1200, gjennomspilling uten feil, test_ekstra 94 av 94 (var 73 før økta).

## 2026-09-25 19:05 Rettet tre feil Codex fant i PR #2
- «Lys og skygge» virket ikke i 3D. Nå gir innstillingen et jevnt opplyst rom uten punktlys, skygger, lysstråler og kantlys (D3.Q() får flat: true), og 3D bygges på nytt når den endres.
- Slås «Blod og skrekkeffekter» av, forsvinner sprut på veggene, drypp, fallende dråper og kjøttbiter med en gang. Vanlige flekker på gulvet blir liggende.
- Slåtte sjefer (meta.sjefDrap) lagres med en gang, ikke først ved neste lagring.
- Nye tester for alle tre. test_ekstra: 97 av 97.
- Tom valgte retning for utvidelsen: seks etasjer der to er ute (Parken først, Nattskogen under grunnmuren før Dypet), korte drømmebaner med pasientens historie, og grov, kroppslig humor.

## 2026-09-25 19:20 Idédugnad og designdokument for utvidelsen
- Tom ba om idédugnad: spillet skal bli større, med flere absurde hendelser (øyet i sprekken med samtale), en dyp historie for hver pasient som spilles ut i drømmer når pasienten prøver å komme seg ut, David Lynch og Twin Peaks, skitten humor, og rom med mer variasjon, inne og ute.
- Idéliste og tre spørsmål. Tom valgte seks etasjer der to er ute, korte drømmebaner og grov, kroppslig humor.
- Planen står i UTVIDELSE.md: etasjene og rømningsforsøkene, gulv, vegger og former per romtype, uterom, fjorten hendelser, historiegeneratoren og de fem drømmekapitlene, nye fiender og sjefer, og rekkefølgen for arbeidet.

## 2026-09-25 19:52 Trinn 1 av utvidelsen: seks etasjer, uterom og rom som ser forskjellige ut
- Seks etasjer: 1 Parken (ute), 2 Mottaket, 3 Underetasjen, 4 Kjelleren, 5 Nattskogen (ute, under grunnmuren) og 6 Dypet. MAX_DEPTH er 6, og temaer, fiendelister, PA-meldinger, velkomsttekst, håndbok og fiendeindeks følger etter.
- Fiendenes styrke går etter en egen skala (dybdeStyrke: 1, 1,4, 2, 2,8, 3,4, 4), så slutten ikke blir tyngre enn før. Helse, skade, sjefens slag og sjansen for mesterfiender bruker den.
- Sjefene i etasje 1 til 5 trekkes fra puljen, Journalen står fast i Dypet. Puljen har fortsatt fire sjefer, så etasje 5 gjentar sjefen fra etasje 1 til de nye kommer i trinn 4.
- Ny fil src/17_romtyper.js: 16 gulv (tregulv, teppe, sekskantfliser, linoleum, steinheller, parkett, betong, gress, grus, jord, snø, mose, myr og flere) og 15 vegger (tapet, fliser, mur, trepanel, polstring, hekk, smijernsgjerde, steinmur, skog, ruin, glass og flere), hver med egen høyde og tegning. Rundt 60 nye møbler og uteting: langbord, grammofon, piano, elektrostol, tannlegestol, røntgen, frisørstol, komfyr og kjøttkroker, kjele og kullhaug, lysthus, gravsteiner med navnene til dine døde pasienter, engel, fontene, brønn, lyktestolper, bjørk, gran, bål, robåt, tømmerkoie og mye mer.
- Generatoren lager L-rom og rotunder, og hver etasje trekker romtyper fra sin egen liste (19 nye). Uteetasjene får grusganger mellom hekkene i parken og stier mellom trærne i skogen. Rom uten kamp på uteetasjene blir paviljonger.
- Ute ser ute ut: bakken fortsetter utenfor rommene med gress og trær, månen lyser sterkere, og det regner, snør, er tåke eller ildfluer. Gasslykter i stedet for vegglamper. Myr gjør deg treg, og på is sklir du.
- Hver etasje har sin utgang etter sjefen: porten, et åpent vindu, kloakkristen, kullsjakta, stien ut av skogen og utskrivningen. Når du kommer ned, står det hva som skjedde («Du gikk ut porten. Du våknet i mottaket.»).
- Lyd og musikk: ugle, kråke, kvist som knekker og en hund langt borte når du er ute, regn og vind som egne lyder. Parken har en vals fra musikkpaviljongen, Nattskogen et sakte stykke med klokker.
- 3D: hver veggstil får sin egen mesh med toon-materiale, hekker og gjerder er lave, lampene sitter bare på innevegger, og tåka er tettest i skogen.
- Tester: generator 1800 av 1800 (seks etasjer, stil på alle rom, former og romtyper), gjennomspilling uten feil (Krok i parken, porten åpnet seg og førte til mottaket), test_ekstra 103 av 103 med ny del for de seks etasjene.

## 2026-09-25 20:43 Trinn 2 av utvidelsen: hendelsene
- Ny fil src/35_hendelser.js med atten absurde hendelser, to til fire per etasje: øyet i sprekken, mannen som går baklengs, telefonen som ringer i et tomt rom, kaffe og kake, kua i kapellet, hjemmebrentapparatet, doet som snakker (utedo i parken), mannen i badekaret, heisen som bare går ned, rotteparlamentet, graven med navnet ditt, den dansende pleieren, radioen, kaffeselskapet i lysningen, kona med kubben, kjempen, tannfeen og mannen som er en lampe. De fire siste kom til fordi fjorten ikke rakk til seks etasjer uten gjentakelser.
- Samtalepanelet: bilde til venstre, tekst og valg til høyre, tallene 1 til 4 velger, og valg du ikke har råd til er sperret. Bildene beskjæres til det som faktisk er tegnet. Hver hendelse gir noe eller tar noe: tenner, helse, Morbidium, kart, kuriositeter, flasker, et hjerte, fiender, eller en svakere sjef (graven).
- Trekningen: nye hendelser først. Når puljen blir for liten i de nederste etasjene, kan en fra tidligere i løpet komme igjen, men aldri en fra etasjen rett over. Hendelser i kamprom kan først brukes når rommet er ryddet. Et valg som gir noe, kan ikke gjentas.
- Minne på tvers av løp: øyet husker forrige pasient, kua husker at du sparket henne, og telefonen, badekaret og kona med kubben sier noe annet andre gang (meta.hendelser).
- Lyder: kua rauter, telefonen ringer med en ekte klokke, radioen mumler.
- 3D lyser nå også opp dukkene i hendelsene (G.ekstraDukker).
- Rettet to feil fra trinn 1 som testene fant: været beholdt fargelisten fra ildfluene når du kom fra skogen, så regn og snø kastet en feil hvert bilde etterpå. Og Vaer.ute() svarte for forrige etasje når det var klarvær eller tåke.
- Tester: test_ekstra har en ny del for hendelsene (fordeling over seks etasjer, øyet, sperrede valg, minnet, tastaturet, rom som må ryddes, graven, hjemmebrent, tannfeen, dansen og opprydding). 112 av 113 i første kjøring; den ene var værfeilen over, som er rettet. Generator 1800 av 1800, gjennomspilling uten feil.

## 2026-09-25 21:00 Trinn 3 av utvidelsen: pasientens historie og drømmene
- Ny fil src/36_drom.js. Hver pasient får et liv før innleggelsen, trukket fra frøet: et hjem (sju steder, fra et fiskevær i Lofoten til stasjonsbyen Dombås), en person med navn (tvillingsøster, mor, far, bror, forlovede, barn, bestefar eller venninne), en hendelse som passer hjemmet (isen som brast, brannen, tåka, spanskesyken, forliset, gruveraset eller ulykken på perrongen), en skyld (låste døra, løy, så det og sa ingenting, dro før det skjedde, ønsket det et øyeblikk, eller tok noe) og et tegn som går igjen (en rød lue, et lommeur som går baklengs, lyden av en symaskin, en kaffekopp som aldri blir kald, en hvit hest, en tinnsoldat eller hvitveis).
- Når pasienten rømmer etter sjefen, faller hen inn i en kort drøm før neste etasje. Fem kapitler: Hjemme, Personen, Dagen det skjedde, Det du gjorde og Det som er sant. Hver drøm er tre rom fra hjemmet med tre minner å huske, figurer med tomme papiransikter som sier ting, personen uten ansikt, og en dør som åpner seg når minnene er funnet. Ved døra kommer valget.
- Skyggen er pasienten selv i svart. Den våkner ved første minne og følger sakte etter. Tar den deg igjen, våkner du for tidlig med Morbidium i blodet. I kapittel 4 snakker den med skylden din. Kapittel 5 er et rødt rom med sikksakkgulv og forheng, der skyggen står med ryggen til og snur seg når du har forstått.
- Valgene (tilgivelse, sannheten, gjentakelse eller fornektelse) bestemmer slutten. Den vises før utskrivningsbrevet, og pasientmappa i arkivet får så mye av historien som pasienten rakk å drømme. En pasient fra et tidligere løp kan stå i drømmen din og fortelle om sin.
- Løpet lagres med neste etasje før drømmen, så Fortsett spiller den på nytt. I innledningen kan du velge å våkne med en gang; det teller som fornektelse.
- Egen musikk: en spilledåse som går for sakte, og noe langsomt og rødt til slutt. 3D har egen tåke for drømmene og ingen vinduer i forhengene. Dukkene i hendelsene og drømmene lyses nå opp i 3D.
- Tester: ny del i test_ekstra for drømmene (16 320 tekster fra 240 frø uten hull, flyten gjennom et kapittel, skyggen som tar deg igjen, det røde rommet, slutten, pasientmappa og etterordet), og testene som går ned en etasje, hopper nå ut av drømmen. test_ekstra 122 av 122, generator 1800 av 1800.

## 2026-09-25 21:42 Trinn 4 av utvidelsen: fiendene og sjefene i Parken og Nattskogen
- Ny fil src/37_utefiender.js. Den ligger etter 32_meny.js og 33_merknader.js i bygget, fordi den legger de nye fiendene inn i fiendeindeksen.
- Parken: Gartneren (stråhatt, bart og pipe; to klipp med hagesaksa, og riva som drar deg inntil) og Kråka (flyr i flokk, svever og stuper i en rett linje; treffer den veggen, blir den liggende en stund).
- Nattskogen: Huldra (vakker forfra, en råtten stamme med kuhale bakfra; synger og drar deg mot seg, og snur ryggen til når hun slår), Vedkubbemannen (vedkubbe til hode og lusekofte; flis i vifte, skaller på nært hold, og går til siden når noe står i veien) og Nøkken (usynlig under overflaten, der ingenting biter på ham; kommer opp, drar deg under og spiller fele).
- Kålhodet: kål med tenner, som Overgartneren planter.
- Overgartner Ansgar Hekk (sjef): to klipp og et stikk med digre hagesakser, hekker som vokser opp i en ring rundt deg med to åpninger, gjødsel som gjør deg treg og stinker, og kålhoder.
- Den hvite hjorten (sjef): en enorm hvit hjort med et trist menneskeansikt. Stormer i en rett linje og står svimmel om den treffer veggen, svinger geviret rundt seg, kaller ned rødt månelys, og gjemmer seg i tåka mens kopier stormer fram.
- Sjefpuljen har seks sjefer, så etasje 1 til 5 trekker fem forskjellige. Fiendeindeksen i håndboka har 22 fiender og 10 sjefer (17 sider).
- Rettet underveis: hekkene visnet på sjefens egen tidtaker og ble stående for alltid hvis sjefen døde først; nå har de sin egen. Huldras sang drar litt svakere, så du kan løpe deg løs.
- Tester: ny del for fiendene i Parken og Nattskogen (alle går til angrep, kråka stuper, Huldra drar deg til seg, Nøkken går under og kan ikke treffes der), begge sjefene med alle angrep i sjeftesten, og håndboktestene teller de nye sidene. To tester fra hendelsene og Huldra var ustabile (for få rom av riktig type, og andre fiender som slo spilleren bort under målingen); begge er gjort robuste.

## 2026-09-25 21:52 Trinn 5 av utvidelsen: bildene til ChatGPT
- tools/lag_manifest.py går nå gjennom alle seks etasjene og lager også utgangene, hendelsene og drømmene, så alle nye bildedeler kommer i manifestet. 171 nye nøkler, 532 i alt. Gravsteinene med navn er holdt utenfor, fordi navnene tegnes av koden.
- tools/lag_brief.py har fire nye runder i ART_BRIEF.md med engelske beskrivelser til ChatGPT: runde 10 (møblene i de nye rommene, uteområdene og utgangene, 59 bilder), runde 11 (hendelsene, 24), runde 12 (drømmene og figurene uten ansikt, 52) og runde 13 (de nye fiendene og sjefene, 35).
- DESIGN_BRIEF.md og gpt-grafikk/LESMEG.md sier hva som bør bestilles først: figurarkene til de nye fiendene, så figurene uten ansikt og hendelsene.
- Tester på det ferdige bygget: test_ekstra 131 av 131, generator 1800 av 1800, gjennomspilling uten feil (med drøm mellom etasjene).

## 2026-09-25 21:53 Utvidelsen ferdig, alt ligger i PR #2
- Alle fem trinnene i UTVIDELSE.md er gjort og pushet til grenen claude/practical-babbage-nc80bu, som oppdaterer PR #2. Den må flettes inn i main før GitHub Pages viser noe av det.
- Retting: overskriften på forrige oppføring hadde feil klokkeslett (22:08). Riktig er 21:52.

## 2026-09-25 22:51 PR #2 flettet, og tegnelister for alt som mangler bilde
- PR #2 er flettet inn i main. Grenen claude/practical-babbage-nc80bu er satt tilbake til main, så neste runde blir en ny PR.
- Nytt verktøy tools/lag_tegnelister.py. Det regner ut hva som mangler (manifestet minus det som ligger i gpt-grafikk/) og skriver tegnelister/: én liste per ChatGPT-samtale, med filnavn, mal og en ferdig engelsk prompt for hvert ark. 245 manglende bilder er samlet i 59 ark og bilder: 15 figurark, 16 «ni ting»-ark, 5 spriteark, 8 UI-bilder og 15 enkeltbilder for det som er for stort til en rute. I tillegg 11 delark til oppskriftssystemet, med seriene spillet faktisk leter etter.
- Med --bilder tegner verktøyet dagens kodetegninger inn i samme rutenett som malen (tegnelister/referanse/ref_*.png, 50 bilder, 2 MB), så ChatGPT ser hva som skal i hver rute. Nøklene ligger i PNG-en, så en referanse som ikke lenger passer arket, blir ikke vist.
- tegnelister/tegneliste.csv har den samme oversikten som regneark. Kjøres verktøyet på nytt etter levering, forsvinner det som er ferdig, og et delvis levert ark får nytt filnavn med bare det som gjenstår.
- kiste12 (kista i begravelsesrommet) og pupill hadde ingen runde i ART_BRIEF.md; nå er de med i runde 3 og 4. DESIGN_BRIEF.md foreslo har_diverse.png, men spillet leter bare etter seriene personale, kultister og pasienter, så forslaget heter nå har_personale.png.
- lag_brief.py og lag_manifest.py kan importeres uten å skrive filer, så det nye verktøyet bruker de samme beskrivelsene og den samme nettleseroppstarten.

## 2026-09-25 23:45 Flere effekter og shadere, og kombo langt over toppen
- Etterbehandlingen (04_render.js) har fått sjokkbølger (opptil fire samtidig, med fargesplitt i kanten), zoomslag, et bilde i vrengt blekk, lynblink, en brennende skjermkant når treffkjeden er lang, og et drømmeslør som gjør bildet bølgete, blekere og varmere mellom etasjene. Forvrengning følger «Forvrengning», blink følger «Hvite glimt», og enkel grafikk slår alt av.
- Ny fil src/38_effekter.js. Partikler der posisjonen regnes ut i vertex-shaderen: gnister og røyk fra bålet, glør og røyk fra vedovnen, damp fra kjeler, komfyrer og gryter, glør fra stearinlys, sporer fra kjempeplanten, Morbidium som stiger fra lilla pytter, og møll som flyr rundt lyktestolpene. Antallet følger 3D-kvaliteten.
- Lyn: i regnvær ute slår lynet ned hvert 11. til 26. sekund, med varsel på bakken først. Det treffer fiender, sjefen og pasienten, svir gulvet og løfter månelyset i 3D. Teslaspolen slår buer mot fiender som kommer for nær. Regnet lager ringer på bakken.
- Ny fil src/39_kombo.js. Treffkjeden får åtte nivåer fra «Lett irritert» til «Utenfor journalen», med en teller til høyre som rister, stempel på skjermen og stadig større lyd. Over 35 treff går musikken over i sjefslaget. Brister kjeden, spiller en trist trombone; slutter den av seg selv, gir den erfaring og et kassaapparat.
- Flerdrap (dobbeltdrap til pandemi) med orgel, kor, gong, torden, lyn og applaus. Overkill, miljødrap, perfekt unnvikelse med tidsfall, tredje slag som treffer flere, tre ulike kort på rad (LEGEKUNST), sjefdrap, og fanfare for synergier og forvandlinger.
- Lydmotoren (01_core.js) har fått kirkeklang, vibrato, forvrengning, filtersveip, lange støylag i sløyfe og en kompressor på hovedutgangen. Kunngjøreren er en dyp syntetisk stemme som sier ordet i stavelser. Stemmen og fanfarene kan slås av under Lyd («Kunngjører og fanfarer»).
- To nye merknader (Blodrus og Massakre), og dødskortet viser lengste kjede og flest på en gang. Blødning og gift teller ikke i kjeden (src.dot).
- Tester: to nye deler i test_ekstra (28 effekter og shadere, 29 kombo). To eldre sjekker ventet en fast tid på noe som skjer i spilltid, og feilet fordi testnettleseren går på omtrent en firedel av farten: bakholdet i det forbannede rommet og øyet i sprekken. Begge venter nå på det de sjekker. En setning om treffkjeden i håndboka ble tatt ut igjen fordi kampsiden ikke fikk plass. Resultat: test_ekstra 150 av 151, og den siste (håndboka) er rettet og sjekket for seg (17 av 17 sider på PC, 24 av 24 på mobil). Generator 1800 av 1800, gjennomspilling uten feil.
- Foreslått som egen oppgave: gå gjennom resten av testene og la dem vente på spilltid i stedet for sanntid.

## 2026-09-25 23:47 PR #3 flettet og publisert
- PR #3 (tegnelistene, effektene og shaderne, og kombosystemet) er flettet inn i main som 505421f. GitHub Actions bygget og publiserte til GitHub Pages uten feil (kjøring 37).
- Grenen claude/practical-babbage-nc80bu er satt til main igjen, så neste runde blir en ny PR.

## 2026-09-25 23:57 Alt flettet, publisert og sjekket
- Tom ba om å flette alt og gjøre klart. Ingen PR-er står åpne. Arbeidsgrenen claude/practical-babbage-nc80bu står likt med main, og den gamle grenen claude/funny-newton-cgnzav har ingen commits som mangler i main, så den kan slettes på GitHub.
- GitHub Pages bygget og publiserte både PR #3 og PR #4 uten feil (kjøring 37 og 38).
- Den publiserte fila (lastet ned fra tombonator3000.github.io/morbidium, 4,1 MB med 314 innebygde bilder) starter i testnettleseren på PC og mobil uten konsollfeil. Et nytt løp kommer i gang med 3D, glød fra tingene og kombotelleren (12 treff, nivå «Blodig»). Testnettleseren her stoler ikke på sertifikatet til nettverksproxyen, så fila ble testet lokalt i stedet for fra adressen.
- Denne oppføringen flettes inn i main som en egen liten PR.

## 2026-09-26 00:15 Mer 3D i den skrå ovenfra-visningen (del 1 av Toms nye bestilling)
- Tom ba om mer 3D i den isometriske visningen, en bedre historie og en liste til ChatGPT over grafikk som mangler. Denne oppføringen gjelder 3D-delen. Historien og lista kommer i neste oppføring.
- Ny fil src/40_dybde.js. Lykteskygger: fiender, sjefer, personale, figurer i hendelsene og høye ting nær pasienten kaster lange, myke skygger bort fra lykta, og skyggene flakker med lykta. Ekte punktlysskygger passer dårlig fordi tegningene er strukket i høyden for kameraets skyld, så skyggene er flate plater som snus og strekkes hvert bilde.
- Kontaktskygger: gulvet mørkner inn mot veggene og i indre hjørner, mest under de høye veggene bak. Males én gang per etasje.
- Takstøv: når skjermen rister kraftig inne, drysser stein og puss ned fra taket, og skyggen på gulvet vokser og skjerpes mens steinen faller.
- Kameradykk (04_render.js, R.kamZoom): kameraet går nærmere når en sjef dukker opp, når pasienten dør, og på store kombo-øyeblikk. Følger skjermristingen i innstillingene.
- Varmeflimmer over bål, vedovner, kjeler, komfyrer og gryter i etterbehandlingen. Følger forvrengningen.
- Pytter og vann speiler lampene og lykta i nærheten (vannshaderen), og tåka lyser opp rundt punktlysene i 3D (15_rom3d.js).
- tools/lag_tegnelister.py kan også lage én side med alle arkene og kopieringsknapper (--side), til mobilen.
- Ny testdel 30 i test_ekstra (dybde). Den går gjennom i 2D; hele pakken kjøres når historien er på plass.

## 2026-09-26 00:38 En bedre historie (del 2 av Toms nye bestilling)
- Ny fil src/41_historie.js. Hovedhistorien sies nå tydelig i stedet for bare å hintes: Morbidium sanatorium ble grunnlagt i 1887 av forstander dr. Mathias Morbeck («M.» i journalen). Han kjøpte en journal i svart skinn for å skrive ned alle sinn i huset, og journalen begynte å skrive tilbake. Morbidium er blekket den skriver med, bygget vokser nedover for hver pasient som slutter å lese, og pasienten er den samme sjela under nye navn.
- En journalside før hver drøm (fem i alt), med knappen «Les videre» inn i drømmen. Siden nevner sjefen som nettopp ble behandlet (bare hvis den faktisk ble det, ikke etter heisen), en bit av sannheten om huset, og hva Journalen mener om valget i forrige kapittel. Escape går videre til innledningen, så valget om å våkne med en gang ikke forsvinner.
- Kapitlene følger startetasjen: fra vaskesjakten blir det kapittel 1, 4 og 5, så skylda alltid kommer før sannheten. Før ble det 1, 2 og 5.
- Personen i drømmene passer til alderen (ingen bestefar til en på sytti).
- Forstanderen sitter i Dypet og leser. Du kan spørre hvem som skriver, lese over skulderen hans (der står linjer fra din egen historie), ta pennen fra ham (Journalen blir svakere, litt mer Morbidium, ny merknad «Pennen»), eller la ham lese i fred.
- Sjefene: en ny tale ved en tredjedel helse for alle sju, slengord i kampen, og siste ord når de dør. Journalen spør «Hvem opprettet denne journalen?» og svarer selv litt etter. Hjorten kjenner igjen den hvite hesten fra drømmen.
- Høyttaleren, Hviskekoret og radioen bruker personen og tegnet fra drømmene. Personalet vet hvor de er (suppe i parken, elg i suppa i skogen), og vaktmester Olsen har en historie om nøklene gjennom alle seks etasjene.
- Siste side før etterordet ved utskrivningen, og brevet følger slutten: gjentakelse gir et innkallingsbrev med stempelet INNKALT, og har pasienten pennen, signerer pasienten selv. Legens konklusjon på kortet følger også slutten.
- Seks nye journalfragmenter, fra forstanderens første notat i 1887 til «Hele historien». Nye merknader for Klumpen, Hekk og Hjorten, som manglet.
- Årstall og småfeil: ingen har jobbet der i førti år i 1923 når huset er fra 1887, så arkivaren og gartneren sier trettiseks. Radioen sender på prøvesendingen (Kringkastingselskapet kom først i 1925). Øyet i sprekken sa alltid «han» om sjefen; nå passer det til sjefen i etasjen. Krittskriften «Ikke stol på ...» bruker sjefen som faktisk er trukket til den etasjen.
- Reservetegninger for ti nye bilder (historie_1 til 5, fire sluttbilder og prop_forstander) til ChatGPT leverer ekte.
- Ny testdel 31 i test_ekstra (historie), og sluttesten i del 26 klikker seg gjennom siste side. Del 26 og 31 går gjennom.

## 2026-09-26 00:45 Grafikklista til ChatGPT (del 3 av Toms nye bestilling)
- tools/lag_manifest.py tar med bildene til historien (HISTORIE_ART). Manifestet har ti nye nøkler, 542 i alt: historie_1 til historie_5, fire sluttbilder (historie_slutt_tilgivelse, _sannheten, _gjentakelse og _fornektelse) og prop_forstander.
- tools/lag_brief.py har engelske beskrivelser av de ti og en ny runde 14 (historien) først i ART_BRIEF.md. Ingen bilder står uten runde.
- tools/lag_tegnelister.py har fått liste 10, Historien: ett «ni ting»-ark med de fem journalsidene og de fire sluttbildene, og forstanderen som eget bilde. Referansebildene er laget på nytt (52). Status: 255 bilder mangler, samlet i 61 ark og bilder på ti lister, pluss 11 delark.
- DESIGN_BRIEF.md nevner historien som punkt 7 under «Neste bestilling».
- Siden med alle arkene, kopieringsknapper og avkryssing for levert er publisert som en privat side i Claude, «Tegnelister»: https://claude.ai/artifact/CwTKtxx3rN65Es4PKpTPrW. Sjekket på 390 og 1280 piksler bredde, uten sidescroll og uten konsollfeil.
- Småretting i historien: vaktmester Olsen gjentok en linje han allerede hadde, så linjene hans handler nå om den fjerde nøkkelen på knippet fra 1901 og fram til Dypet.
- memory.md (nye deler om Dybde og Historien, byggerekkefølgen og kapitlene), todo.md, AGENTS.md (fillista) og README.md er oppdatert.

## 2026-09-26 01:15 Tester for hele runden, raskere etterbehandling og forslag til neste steg
- Første fulle kjøring: generatoren 1800 av 1800, gjennomspillingen uten feil, test_ekstra 164 av 167. De tre som feilet (byggeanimasjonen i del 14, Huldras sang i del 27 og effektene som dør ut i del 28), ventet en fast tid i sanntid på noe som skjer i spilltid. Alle tre gikk gjennom i forrige runde.
- Målt i testnettleseren (programvaregrafikk, 2D, samme rom): main ga rundt 9 bilder i sekundet, denne grenen rundt 6,7. Dybde sto for omtrent halvparten. Resten kom av at etterbehandlingen regnet varmeflimmer for hver piksel, og vannet speilet seks lys, også når ingen kilder var i nærheten.
- Rettet: begge løkkene i shaderne hoppes over når første plass er tom (kildene kommer sortert, med de tomme sist). Etter det ga denne grenen rundt 7,8 bilder i sekundet, mot 9,1 for main. Dybde koster fortsatt rundt 7 prosent med programvaregrafikk, mest fordi det tegnes flere gjennomsiktige flater. På et ekte skjermkort blir det langt mindre.
- De tre testene venter nå på spilltid, som de andre vi rettet forrige runde. Del 31 antok at løpet startet i Eget rom, men innleggelsen tilbyr tre tilfeldige oppvåkninger, så testen setter oppvåkningen selv. Del 14, 27, 28, 30 og 31 går gjennom, og gjennomspillingen er kjørt på nytt uten feil. Historien er også sjekket med 3D på.
- Tom spurte hva neste steg bør være. Forslaget står øverst i todo.md: spille i stedet for å bygge mer. Først en liten testmodus med bilder i sekundet og en rapport etter hvert løp, så tre eller fire løp på PC og mobil, og deretter balanse ut fra rapportene. Grafikken i denne rekkefølgen: liste 10, 5, 1 og 4.
- En siste full kjøring av test_ekstra går nå, før PR-en lages.

## 2026-09-26 01:41 Historien skrevet om: Hellraiser møter Twin Peaks, med Lovecraft og 1920-tallet
- Tom ba om at historien skulle bli «skikkelig Hellraiser møter Twin Peaks», med Lovecraft-stemning fra 1920-tallet. Den nye mytologien er vår egen, uten navn eller sitater fra filmene og serien.
- Hovedhistorien (src/41_historie.js): under huset er det et hav, eldre enn fjorden, og der sover den første pasienten, nr. 0. Når det gjør vondt i den, drømmer den mennesker, og pasientene er drømmene dens. Morbidium er det den blør. Forstander Morbeck kjøpte en protokoll i sort skinn på auksjon i Bergen i 1886, funnet i buken på en hval utenfor Røst. Journalen er en lås. I 1887 vred han den helt rundt, en liten bjelle ringte, og Avdeling Null kom opp fra Dypet: leger med kitler sydd til huden og kroker i kjeder. Nå sitter han sydd fast til stolen med sølvkroker og leser høyt for det som sover.
- Alle fem journalsidene, gravskriftene over sjefene, merknadene om forrige valg, siste side, brevet og legens konklusjon er skrevet om. Siste side har egne avsnitt for når forstanderen er løst.
- Forstanderen har fått et fjerde valg: løs ham fra krokene. Når panelet lukkes, ringer bjella, kjettinger kommer ut av mørket og henter ham ned i gulvet, stol og alt. Pasienten får helse og en kuriositet, Journalen får 20 prosent mer helse, og brevet signeres av «tidligere forstander». Pennen er nå en krok av sølv og svekker Journalen direkte (før brukte den samme mekanisme som graven, og da sa Journalen feil replikk).
- Ny effekt: kjettinger med kroker fra mørket (Kjeder), med leddtekstur og kroker som peker dit kjettingen går. Nye lyder: en liten sølvbjelle og et kjettingrasl.
- To nye hendelser: Venterommet bak et forheng i veggen (røde forheng, sikksakkgulv, en liten lege i altfor stor kittel som snakker baklengs; sett deg, drikk kaffen som smaker sjø, spør hvem som drømmer, eller dans) og Morbecks instrumentskrin (vri på mønsteret, og Avdeling Null undersøker deg med kjettinger: skade, Morbidium og en gave).
- Sjefene har fått nye taler og siste ord som passer mytologien. Høyttaleren, koret, kjempen, kona med kubben, radioen og personalet vet om havet under huset. Ni nye journalfragmenter, fra auksjonsprotokollen i 1886 til en styrmann som så en by stige opp av havet utenfor Røst, et brev fra Det Kongelige Frederiks Universitet og hele historien. Ny dødsårsak: kroker. Ny merknad: Løslatelse.
- Kapittelvalget i drømmene tåler nå at testene hopper over startetasjen (den gamle regelen gjelder da). Det var årsaken til at drømmetesten feilet i siste fulle kjøring (166 av 167) når løpet tilfeldigvis startet i vaskesjakten.
- Bildene: nye reservetegninger for journalsidene 2, 3 og 4, tre av sluttbildene og forstanderen, pluss Venterommet og skrinet. Manifestet har 544 nøkler. Runde 14 og liste 10 har fått nye beskrivelser og to nye bilder (fire bestillinger). Siden «Tegnelister» er oppdatert på samme adresse.
- Tester: del 31 sjekker nå også Venterommet, skrinet med kjettingene og forstanderen som løses. Del 25, 26 og 31 går gjennom, og røyktesten er kjørt både i 2D og 3D uten konsollfeil.

## 2026-09-26 01:57 Hele testpakken grønn før PR
- Generatoren 1800 av 1800, gjennomspillingen uten feil, test_ekstra 171 av 171 (med de nye sjekkene for Venterommet, skrinet, kjettingene og forstanderen som løses).
- Tom sendte ønsket om historien en gang til. Han har fått et sammendrag av det som er gjort, og tilbud om neste steg: knytte drømmene direkte til havet og Avdeling Null, kjettinger i kampen mot Journalen, og bjelle og hav som lyd i Dypet.
- Neste: PR til main og fletting.

## 2026-09-26 02:00 PR #6 flettet, publisert og sjekket
- PR #6 (mer 3D, historien som Hellraiser møter Twin Peaks med Lovecraft-stemning, og grafikklista til ChatGPT) er flettet inn i main som ad7634b. GitHub Actions bygget og publiserte til GitHub Pages uten feil (kjøring 40).
- Den publiserte fila (4,2 MB, 314 innebygde bilder) er lastet ned og testet lokalt på PC og mobil: et nytt løp starter med 3D, kombotelleren virker, og historien, kjettingene, Venterommet, skrinet og Dybde er med. Ingen konsollfeil.
- Grenen claude/practical-babbage-nc80bu er satt lik main igjen. Denne oppføringen flettes inn i main som en egen liten PR.

## 2026-09-26 05:49 Frie lyder hentet og lagt i assets/lyd (del 1 av lydrunden)
- Tom ba om mer og bedre lyd, gratis lyder og effekter, musikk som glir over i lyd slik iMUSE gjorde hos LucasArts, og blod og vann som renner nedover skjermen. Denne oppføringen gjelder bare lydfilene.
- Nytt verktøy tools/lag_lyd.py henter lydene, klipper, normaliserer og lager MP3. Det sjekker lisensen på hver lydside før nedlasting og skriver assets/lyd/lyd.json (gruppe, type, lengde, løkkepunkter, grunntone, kilde) og assets/lyd/KILDER.md med navn på alle som har spilt inn.
- 102 lydeffekter og stemningslyder fra Freesound, alle CC0 1.0: fottrinn på stein, tre, gress og vann, dører, kjettinger, glass, blodsprut, slag, skrik, hunder, kråker, torden, regn, vind, bål, drypp, hav, summing i rørene og mer.
- 63 instrumenttoner fra Versilian Community Sample Library (VCSL, CC0): orgel, orgelbass, piano, glockenspiel, vibrafon, rørklokker, harpe, cembalo, vinglass, psalter, saksofon, pauker, bekken, skarptromme, stortromme, gong, håndbjeller, triangel og treblokk. Grunntonene er sjekket med frekvensanalyse, og holdetoner har løkkepunkter på hele perioder.
- Alt er 1,55 MB (instrumenter 0,83, effekter 0,49, stemning 0,23). Nedlastingene ligger i .lydcache/, som git ignorerer.

## 2026-09-26 06:02 Lydbanken: de innspilte lydene er koblet inn i spillet (del 2 av lydrunden)
- build.py bygger inn lydene i assets/lyd/ som base64 (LYDFILER) med metadata (LYD_META) rett etter 01_core.js. Fila blir 6,4 MB, 2,1 MB av det er lyd.
- Ny modul src/42_lyd.js. Lydbanken pakker ut lydene i bakgrunnen etter første trykk, fire om gangen og effektene først, i lydenes egen samplingsfrekvens (30 MB i minnet i stedet for rundt 48). Til en lyd er klar, spilles synthlyden som før.
- LYD_KART oversetter spillets lydnavn til opptak: slag, treff, blod, dører, papir, glass, kjettinger, torden, bjella, sjefens gong og pauker, dyr og stemningslyder. Varianten velges tilfeldig (aldri den samme to ganger på rad) med litt ulik tonehøyde, og noe av synthlyden ligger under der den gir trykk. Høyst fem like lyder på 80 ms.
- Fottrinn etter gulvet (tre, stein, fliser, gress, grus, myr, is, teppe) og i pytter. Stemningssløyfer per etasje (natt og vind i parken, summing, drypp, tikkende klokke, havet og dronen i Dypet), per rom (drypp på badet, summing i elektro- og røntgenrommet, knitring i fyrrommet), regn og vind, knitring fra bål og ovner etter avstand, og havet under huset i drømmene. Fiender som kommer mot deg, stønner, hvisker eller piper, fra riktig side.
- Sløyfene har litt ekstra lyd på hver side (tools/lag_lyd.py), så de går rundt uten klikk selv om nettleserne legger ulikt mye stillhet foran en MP3. Holdetonene i instrumentene har løkkepunkter med seks desimaler.
- Dronen fra synthen kan nå dempes og stemmes (Sound.stemDrone), til musikken i neste steg.
- Ny innstilling under Lyd: «Innspilte lyder». Av betyr bare synth, og da pakkes ingenting ut.
- Røyktest i testnettleseren: alle 165 lydene pakket ut på 6,9 sekunder uten feil, alle kan spilles, kartet, fottrinn, stemningen, regnet og stemmene virker, ingen konsollfeil.

## 2026-09-26 06:12 Musikken skrevet om som et lite iMUSE (del 3 av lydrunden)
- src/06_musikk.js er skrevet om med samme grensesnitt som før. Stykkene er de samme, men nå glir alt over i hverandre i takt, slik iMUSE gjorde hos LucasArts:
- Et nytt stykke begynner på neste taktstrek. Det siste slaget før byttet er en bro: harpa løper opp dominanten i den nye tonearten, et bekken svulmer inn mot første slag, og paukene slår den nye grunntonen. Tittelmusikken går over i parkvalsen på under ett sekund i testen.
- Besetningen følger rommet: samme stykke på orgel med mye klang i kapellet, piano og grammofon i spisesalen, vibrafon og stemte drypp på badet, cembalo og skrivemaskin i arkivet, psalter i kjelleren, saksofon, vibrafon og visper i Venterommet, harpe i hagen, glockenspiel i skogen og vinglass i drømmene. Byttet skjer på taktstreken.
- Kamplaget og sjefslaget kommer inn på neste slag med bekken og pauke, og går ut på neste taktstrek. Tempoet øker i kamp som før.
- Innslag i samme toneart på neste slag i stedet for de gamle synthlydene: rommet er ryddet (harpe og klokke), nytt nivå (harpeløp og glockenspiel) og helse (vibrafon). Plingene for tenner, gjenstander og høyttaleren stemmes etter akkorden som spilles. Klokka som slår i det fjerne, legges på neste taktstrek og slår grunntonen, dryppene og skrivemaskinen legges på slaget. Store smell (slam, torden, sjefen) får musikken til å dukke unna et øyeblikk.
- Når det har vært rolig en stund (tjue sekunder uten kamp, fiender i nærheten eller nytt rom), trekker musikken seg tilbake og stemningssløyfene kommer fram. Når noe skjer, er den der igjen.
- Dronen i veggene stemmes etter grunntonen i stykket.
- Instrumentene er opptakene fra lydbanken (orgel, piano, harpe, glockenspiel, vibrafon, klokker, cembalo, vinglass, psalter, saksofon, pauker, bekken, trommer og gong), med synthstemmene som reserve. Styrken er målt fra lydnivået i opptakene.
- Rettet gammel feil: i drømmene ble drømmemusikken byttet ut med etasjemusikken allerede etter første bilde. Nå bestemmer én dirigent (Musikk.velg) stykket, og drømmen beholder sin musikk og får havet under huset som stemning.
- Røyktest: overgang med bro, besetning i journalrommet, kamplaget på neste slag, innslag, drømmen og døden, ingen konsollfeil. Testdel 12 (musikken) går gjennom.

## 2026-09-26 06:24 Blod og vann som renner nedover skjermen (del 4 av lydrunden)
- Ny modul src/43_vaatt.js: en liten simulering av dråper på glasset foran kameraet. Dråpene klistrer seg fast til de blir tunge nok, sklir så nedover og vingler litt, legger igjen spor og små perler bak seg, og tar med seg dråpene de møter. Blodet er seigt, sklir sakte og legger igjen tykke, mørke spor. Vannet renner fort og tørker på noen sekunder. Blodet forsvinner etter 10 til 15 sekunder, så skjermen ikke blir dekket i lange kamper.
- Dråpene tegnes som små kupler i et høydekart (384 punkter bredt, rødt for vann og grønt for blod). Etterbehandlingen i 04_render.js bryter bildet gjennom kuplene, farger gjennom blodet (tynt blod klart rødt, tykt nesten svart), legger et skarpt lyspunkt fra øvre venstre hjørne og litt lys i bunnen av dråpen, og gjør kanten mørk. Ingenting regnes når skjermen er tørr.
- Blod kommer fra siden slaget kom fra når pasienten blir truffet, og store treff gir tunge dråper som renner med en gang. Drap tett ved gir sprut, og sjefer som dør gir mye. Vann kommer fra regnet ute (også i gårdsrommene), fra plask og fra pytter pasienten går i. Det gamle, ferdigmalte blodet i kanten brukes bare når det nye er slått av.
- Ny innstilling under Bilde: «Blod og vann på skjermen». Blodet følger også «Blod og skrekkeffekter». Enkel grafikk har ingen etterbehandling og dermed ikke noe vått. Blodpartiklene, sprutene på vegger og gulv og kjøttbitene er som før.
- Sjekket med skjermbilder i testnettleseren, både 2D og 3D: første versjon så ut som røde klistremerker og kornete flekker. Rettet med høyere oppløsning, skarpere kant, mørkere tykt blod, skarpere lyspunkt, en øvre grense for dråpestørrelsen (store dråper slo seg sammen til én kjempeklatt) og smalere spor. Ingen konsollfeil.

## 2026-09-26 06:35 Tester og dokumentasjon for lydrunden (del 5)
- Nye testdeler i tools/test_ekstra.py: 32 (lydbanken: alle lydene pakkes ut uten feil, kartet og sløyfepunktene, fottrinn etter gulvet, havet og dronen i Dypet, regnet, en fiende som stønner, og innstillingen «Innspilte lyder»), 33 (iMUSE: nytt stykke på taktstreken etter broen, besetning etter rommet, kamplaget på neste slag, innslag og stemte plinger, roen som glir over i stemning, og drømmemusikken som blir værende) og 34 (blod og vann på skjermen: treff fra riktig side, dråper som renner og slår seg sammen, drap tett ved, tørking, regn, plask og begge innstillingene).
- Del 12 (musikken) venter nå på at det nye stykket kommer inn på taktstreken, i stedet for en fast tid.
- Testene fant at kamprommet ikke startet kamp når testen bare satte rommet til uryddet i generatorens liste; tilstanden ligger i G.rooms. Rettet i testen. SKALA, midiHz og hzMidi er lagt til i eksporten til testene.
- To små rettelser i 42_lyd.js: dronen i en ny etasje stemmes med en gang etter musikken (før skjedde det bare når stykket byttet), og base64-teksten til hver lyd slippes når lyden er pakket ut, så den ikke ligger i minnet to ganger.
- Delene 12, 32, 33 og 34 går gjennom hver for seg. Generatoren ga 1800 av 1800, og gjennomspillingen gikk uten feil. Full kjøring av test_ekstra pågår.
- README.md (nye avsnitt om lyd, musikk og vått på skjermen, og takk til Freesound, VCSL og iMUSE som forbilde), AGENTS.md (regel for frie lyder, nye filer), memory.md (tre nye deler) og todo.md (ny runde med spørsmål til Tom) er oppdatert.

## 2026-09-26 07:08 Full testkjøring: fem feil, fire tidsfølsomme tester gjort robuste
- Full kjøring på grenen: generatoren 1800 av 1800, gjennomspillingen uten feil, test_ekstra 186 av 191.
- Én feil var ventet: blodtesten i del 18 så etter det gamle, ferdigmalte blodet i kanten, som nå er byttet ut med dråpene. Testen godtar nå dråper på glasset som blod på skjermen. Samtidig forsvinner blodet på glasset med en gang når «Blod og skrekkeffekter» slås av (Blod.sett), som resten av blodet.
- De fire andre ventet en fast tid i sanntid på noe som skjer i spilltid: det tunge slaget mot den sprukne veggen og bølgene i bakholdet (del 6), og Kasteren som kaster (del 19). Del 9 (liket kan undersøkes) feilet fordi en gravstein på kirkegården sto nærmere enn liket. Samme testdeler kjørt mot main på denne maskinen: bakholdet og liket feiler der også, så de fantes fra før. Maskinen er mye tregere enn i forrige økt (main gir rundt 5 bilder i sekundet i testnettleseren, mot 9 da).
- Målt: grenen går rundt 5 til 10 prosent tregere enn main i testnettleseren, men målingene spriker like mye (4,4 til 5,0 mot 4,9 til 5,6), og verken opptakene, musikkens klang eller dråpene står ut hver for seg.
- Rettet: del 6 og 19 venter nå på spilltid, og del 9 prøver flere sider av liket til det er det nærmeste som kan undersøkes. Del 6, 9, 17, 18, 19 og 20 går gjennom. En ny full kjøring går nå.

## 2026-09-26 07:32 Andre fulle testkjøring og klar for PR
- Generatoren 1800 av 1800, gjennomspillingen uten feil, test_ekstra 190 av 191 på det endelige bygget. Del 6, 9, 18 og 19 går nå gjennom også her.
- Den ene feilen var i del 25 (hendelsene): Tannfeen fikk ikke plass i etasje 2. Etasjen lages av løpets frø, så de seks forsøkene i testen fikk samme etasje hver gang, og i dette løpet manglet etasjen rommene Tannfeen kan bo i. Testen bytter nå frø mellom forsøkene for graven, Tannfeen og dansen. Del 25 er kjørt tre ganger på rad uten feil. Feilen hadde ingenting med lydrunden å gjøre.
- Neste: PR til main og fletting.

## 2026-09-26 07:38 PR #8 flettet og publisert, og mindre dråper på stående mobil
- PR #8 (frie lyder, musikken som iMUSE, og blod og vann som renner nedover skjermen) er flettet inn i main som bd5c716. GitHub Actions bygget og publiserte til GitHub Pages uten feil (kjøring 42).
- Den publiserte fila (6,4 MB, 314 innebygde bilder og 165 lyder) er lastet ned og testet på PC og mobil: alle lydene pakkes ut uten feil, musikken spiller og går over med bro, stemningssløyfene går, dråpene kommer når pasienten blir truffet, og det er ingen konsollfeil.
- Skjermbildet fra mobilen viste at bloddråpene ble for store på stående skjerm, fordi størrelsen fulgte høyden på bildet. Nå følger størrelse og fart den korteste siden (Vaatt.kk), så dråpene er like store på stående mobil som på PC. Liggende skjerm er som før. Sjekket med skjermbilde på 390 x 844, og testdel 34 går gjennom.
- Grenen claude/practical-babbage-nc80bu er satt lik main igjen. Rettelsen og denne oppføringen flettes inn som en egen liten PR.

## 2026-09-26 08:12 Forslag til neste steg etter lydrunden
- Tom spurte hva neste steg bør være. Svaret er det samme som i forrige runde, bare tydeligere: todo.md har nå 19 åpne spørsmål til Tom som bare kan besvares ved å spille, og ingenting av lyden, musikken eller dråpene er hørt eller sett på ekte maskiner. Flaskehalsen er tilbakemelding, ikke flere systemer.
- Forslaget står øverst i todo.md: testmodus og løpsrapport, «Si din mening» i pausemenyen med spørsmålene som knapper, så tre eller fire løp på PC og mobil, og deretter justering av lydmiks, blod, vanskelighet, lengde og ytelse. Små ting som kan tas når som helst: seks lyder som er hentet, men ikke koblet inn (bokslag, dørsmell, gulvknirk, radiosus, riving og sluk), og en fast testklokke for nettlesertestene.

## 2026-09-26 08:57 Testmodus og «Si din mening» (Toms ja til forslaget)
- Tom sa ja til å starte med testmodusen og tilbakemeldingsknappene.
- Ny modul src/44_testmodus.js. Testmodus slås på under Innstillinger, Spill, eller med ?testmodus i adressen (én gang per lasting, så den kan slås av igjen).
- Måleren til venstre på skjermen: bilder i sekundet (nå og laveste), 3D og kvalitet, minne (Chrome), hvor mye lydene bruker, hvor mange lyder som er pakket ut, musikken (stykke, neste stykke, besetning, kamp eller sjef og hvor mye musikk det er nå) og antall dråper på skjermen.
- Rapporten for løpet: versjon (dato og commit, lagt inn av build.py som BYGG), enhet (nettleser, system, skjerm, berøring, kjerner, minne, skjermkort, lydkort), innstillingene, oppstartstid og hvor lang tid lydene brukte, pasienten, slutten (dødsårsak, rom, om sjefen levde, eller utskrivning og brev), hver etasje og drøm (tid, drap, skade etter kilde, helse, tenner, sjefen og hvor lang tid behandlingen tok, bilder i sekundet), kuriositeter, kort, våpen, nivå, lengste kombo, valgene i drømmene, ytelse og kvalitetsbytter, feil i konsollen, svarene og friteksten.
- «Si din mening»: et kartotekkort med fanene Lyd, Bilde, Spill, Historien og Rapport. 26 spørsmål fra todo.md med tre knapper hver (trykk en gang til for å angre), fritekst, og en knapp som kopierer rapporten (med reserve når nettleseren ikke gir tilgang til utklippstavla). Panelet ligger over alt annet, og Escape lukker bare det.
- Pausemenyen får «Si din mening» og «Testrapport», dødsskjermen og utskrivningen får «Testrapport». Rapporten lagres ved slutten av løpet (de fem siste), oppdateres hvis svarene endres etterpå, og kan kopieres fra Data-fanen.
- Røyktest på PC og mobil med skjermbilder: måleren, pausemenyen, spørsmålene, rapporten, døden og innstillingene virker, ingen konsollfeil. Ny testdel 35 i test_ekstra går gjennom. Den fant én ekte feil: med ?testmodus i adressen gikk testmodus ikke an å slå av.

## 2026-09-26 09:24 Mobilen mistet WebGL: lekkasjer i grafikkminnet funnet og tettet
- Tom fikk «Noe gikk galt: grafikken gikk tom for minne (WebGL-konteksten ble mistet)» på mobil. PC går fint. Han ba også om at layout og bruk tilpasses mobil.
- Den fulle testkjøringen av testmodusen ble stoppet halvveis (generatoren 1800 av 1800, gjennomspillingen uten feil, test_ekstra 72 av 72 så langt), fordi mobilrettingen endrer bygget.
- Målt med et eget skript som følger med på alt spillet legger i grafikkminnet (teksturer, render-buffere og vertex-buffere) i en mobilprofil (412 x 839, dpr 2,625, berøring). Grafikkminnet vokste for hver etasje, også i versjonen fra før lydrunden. Med 15 fiender som dør per etasje gikk den publiserte versjonen fra rundt 65 til nesten 190 MB over tolv etasjeskifter, omtrent 12 MB per etasje. Et langt løp med drømmer blir mer enn en telefon tåler.
- Tre lekkasjer:
  1. Skyggekartet til månelyset (1024 x 1024 på mobil, med dybdebuffer, 8 MB) ble aldri frigjort når 3D-rommet ble revet (D3.riv i 15_rom3d.js). R.remove kobler bare løs. Nå kastes lysene med dispose, som tar skyggekartet.
  2. Hver papirdukke (fiender, personale, figurer i drømmene) har to strekbånd med 3200 punkter hver, rundt 150 kB i grafikkminnet. Doll.dispose og Lagdukke.dispose koblet bare roten løs. Nå frigjøres strekbåndene og materialene (dukkeKast i 11_doll.js). Teksturene og firkantene deles og blir liggende.
  3. Flekkene på gulvet, plakatene og dørene til tjenesterommene fikk nye teksturer og materialer i hver etasje uten å bli registrert for opprydding (12_paint.js). Nå havner de i Paint.owned.
- Etter rettingene ligger grafikkminnet flatt på rundt 52 MB (tekstur 41, render-buffere 7, buffere 4) gjennom tolv etasjeskifter med fiender. Små teksturer som fortsatt dukker opp, er bilder av møbler som bufres første gang de vises. De flater ut.

## 2026-09-26 09:27 WebGL som mistes, hentes tilbake i stedet for å stoppe spillet
- Før viste spillet feilmeldingen «Noe gikk galt» med en gang WebGL-konteksten ble mistet. Det skjer på mobil ved lite minne, men også når nettleseren legges i bakgrunnen.
- Nå (R.mistet og R.hentet i 04_render.js): spillet pauser og viser «Grafikken ble borte». Three.js bygger opp igjen teksturer, render-mål og shadere når konteksten kommer tilbake. Deretter går grafikken ned et trinn: oppløsningen settes ned (dprMax minus 0,5, minst 1), og 3D går ett nivå ned (middels til lav, lav til 2D). Kommer grafikken ikke tilbake på åtte sekunder, vises feilmeldingen med «Prøv enkel grafikk» som før. Testmodus-rapporten får med når det skjer.
- Selvtesten ved oppstart (hvitt eller tomt bilde gir enkel grafikk) tolket en mistet kontekst som tomt bilde og slo av 3D helt. Den ser nå bort fra mistet kontekst.
- Testet ved å miste konteksten med vilje (WEBGL_lose_context) i mobilprofil: pause, tilbake etter ett sekund, dpr fra 1,5 til 1 og 3D fra middels til lav, bildet tegnes riktig igjen, ingen feilmelding og ingen konsollfeil.

## 2026-09-26 10:19 Mobil: layout og bruk tilpasset
- Gikk gjennom alle skjermene med skjermbilder i mobilprofil (iPhone, 390 x 844 stående og 844 x 390 liggende, dpr 3, berøring): tittel, innleggelse, spill, kamp, pause, journal, håndbok, innstillinger, butikk, hendelse, død, utskrivningsbrev og utskrivning.
- Skjermene (.screen) sentreres nå med auto-marger i stedet for justify-content. Det som er høyere enn skjermen, kan rulles i stedet for å bli kuttet i toppen.
- Papirflatene skaleres med passInn (32_meny.js). På telefon går de ikke under 75 prosent, så teksten kan leses og knappene treffes. Blir de da høyere enn skjermen, rulles panelet. Testpanelet bruker det samme.
- Liggende telefon: merket, kartet og knappene i toppen blir mindre og flyttes ut i hjørnene, kortene legges nederst mellom spaken og knappene, rommets skilt skjules, og tittelen blir mindre. Dødskortet og utskrivningen får to kolonner (båren til venstre, tallene på én rad til høyre), og butikken legger personen til venstre og varene til høyre. Alt får plass uten rulling.
- Stående telefon: tipslappen flyttes ned under merket, snakkeboblene blir større, og testmåleren flyttes til høyre. Journalen får en smalere side (430 i stedet for 640), så den skaleres ned til rundt 0,78 i stedet for 0,55. Utskrivningsbrevet får en smal utgave, så teksten ikke blir uleselig liten.
- Mer enn 20 hjerter vises som to rader og «+N», i stedet for å fylle skjermen.
- Rulling: et nytt panel begynner alltid øverst, og et panel som tegnes på nytt (butikken etter et kjøp, en ny fane i innstillingene) beholder rullingen. Nullstillingen må skje etter at panelet vises, fordi nettleseren husker rullingen til et skjult panel og legger den tilbake. Knappene som får fokus når et panel åpnes, får det uten at panelet ruller (preventScroll). Hvert steg i en samtale begynner øverst.
- Sjekket at panelene kan rulles med fingeren selv om body har touch-action:none (sveip med ekte berøringshendelser i testen).
- WebGL som mistes mens spillet ligger i bakgrunnen (bytte av app): de åtte sekundene før feilmeldingen telles først når siden synes igjen, og grafikken settes ikke ned når den kommer tilbake. Før kunne feilmeldingen dukke opp med en gang man kom tilbake til spillet. Testet med skjult side i ni sekunder: ingen feilmelding, ingen nedgradering, og feilmeldingen kommer fortsatt etter åtte sekunder når siden synes og grafikken ikke kommer tilbake.
- Ingen konsollfeil i noen av rundene.

## 2026-09-26 10:25 Testdel 36 for mobil, og papirflatene regner med panelets marger
- Ny testdel 36 i tools/test_ekstra.py, med liggende og stående telefon (berøring, iPhone): HUD-en overlapper ikke liggende, innstillingene kan rulles med fingeren (ekte berøringshendelser), et nytt panel begynner øverst selv om det forrige var rullet, butikken ligger side om side, dødskortet og utskrivningen får plass uten rulling, brevet begynner øverst, høyst 20 hjerter og «+N», journalen og brevet skaleres ikke under 0,7 stående, og mistet grafikk: i bakgrunnen pause uten feilmelding og uten nedgradering, synlig tilbake med lettere grafikk.
- Testen fant én feil: passInn regnet med 20 piksler marg, men panelene har 16 på hver side (32). Utskrivningen kunne derfor rulles 12 piksler liggende. passInn måler nå plassen innenfor margene på panelet flata ligger i. På PC blir papirflatene rundt to prosent mindre.

## 2026-09-26 10:27 Dokumentasjon for mobilrettingene
- memory.md: ny del om mobil (lekkasjene og regelen om å frigjøre alt per etasje, hvordan grafikkminnet ble målt, mistet WebGL i forgrunn og bakgrunn, layout med passInn og de to telefonoppsettene, rulling og fokus, touch-action og hvordan berøring testes).
- todo.md: ny del for mobil med det som er gjort, og det Tom bør gjøre: spille på samme telefon igjen med ?testmodus, stående og liggende, og si hvilken telefon og nettleser det var.
- AGENTS.md: to nye regler, om grafikkminne per etasje og om nye papirflater på mobil.
- README.md: telefon stående og liggende. Rettet også «fire genererte etasjer» til seks.
- Den fulle testkjøringen på det endelige bygget går i en egen arbeidskopi.

## 2026-09-26 10:29 Lekkasjetest for grafikkminnet i testdel 36 (ikke kalibrert ennå)
- Testdel 36 bygger fire etasjer med seks fiender som dør i hver, to ganger, og sammenligner renderer.info.memory (teksturer og geometrier) etter første og andre runde. Den andre runden skal ikke legge igjen noe. Grensene (høyst 4 teksturer og 12 geometrier) er satt før testen er kjørt, og justeres når den store testkjøringen er ferdig og testen er prøvd mot versjonen fra før rettingen.

## 2026-09-26 10:53 Full testkjøring grønn, og minnesjekken er kalibrert
- Full testkjøring på det endelige bygget (ab64245, i egen arbeidskopi, uten andre nettlesere i gang samtidig): generatoren 1800 av 1800, gjennomspillingen uten feil, test_ekstra 210 av 210. De fire sjekkene som feilet i forrige runde (del 28, 29, 30 og 33), gikk gjennom. De feilet fordi maskinen var belastet av skjermbilderundene mine samtidig, og spilltiden rakk ikke fram innenfor taket på 20 sekunder.
- Minnesjekken i del 36 kjørt mot bygget fra før lekkasjerettingene (1f410e9): +16 teksturer og +67 geometrier per runde med fire etasjer. Mot det rettede bygget: +2 til +3 teksturer og -1 til -2 geometrier. Grensene er satt til 6 teksturer og 12 geometrier, så sjekken fanger lekkasjen med god margin.
- «2D» i den stående telefonen i del 36 var ikke en feil: test_ekstra åpner spillet med ?2d. Minnesjekken slår 3D på selv.

## 2026-09-26 11:36 Gjennomgang før fletting: 14 funn, rettet
- Kjørte en gjennomgang av hele endringen (testmodus og mobil) med fire lesere, hver med sin kant (grafikkminne og mistet WebGL, layout, panelflyt og rulling, testene), og to skeptikere per funn som prøvde å avkrefte det. 16 funn, 14 overlevde. Rettet:
  1. Tittelmenyen havnet øverst på skjermen, også på PC: #title h1{ margin:0 } slo den nye auto-margen. Auto-margene på .screen har nå !important. Testdel 36 sjekker at tittelen står midt på skjermen på PC.
  2. Et nytt panel som ble åpnet fra et annet panel (brevet etter epilogen, pausen etter innstillingene, håndboka fra innstillingene), beholdt den gamle rullingen. openPanel nullstiller nå rullingen for alle nye paneler, og bare det samme panelet tegnet på nytt (samme klasse og id på det øverste elementet, som butikken etter et kjøp eller innstillingene etter et valg) beholder den. Siste side og epilogen, som er samme slags panel, nullstiller selv.
  3. Mistet grafikk med fast kvalitet (Innstillinger, Bilde): med «Lav» ble 3D slått av, med «Høy» ble ingenting satt ned selv om meldingen sa det. Nå står spillerens valg, og bare oppløsningen går ned. Meldingen sier «Alt er som før» når oppløsningen allerede var på det laveste.
  4. Tipslappen dekket merket og knappene i toppen på små liggende telefoner (667 bred), og lå litt over merket stående. Den ligger nå i sonen mellom merket og knappene, og testen tar den med i overlappsjekken.
  5. Brevet byttet ikke mellom smal og bred utgave når telefonen ble snudd. Nå har det en refit.
  6. Testpanelet slapp gjennom taster når fokus var utenfor det (P lukket pausen under, og spillet gikk videre bak panelet). Nå stoppes alle taster mens det er åpent, og det begynner øverst når det åpnes.
  7. Over 200 i helse viste «+N» alltid som fullt. Nå viser det «+fulle/skjulte», for eksempel +10/20.
  8. Minnesjekken kunne ikke skille en lekkasje i skyggekartet alene (4 teksturer per runde) fra støyen. Testen sjekker nå direkte at skyggekartet til månen frigjøres når neste etasje bygges, og at 3D faktisk er bygd. Butikksjekken kunne passere uten at noe ble rullet, så testen åpner nå håndboka (som er høyere enn skjermen) fra de rullede innstillingene.
- Avkreftet: at listene i arkitekturen (InstancedMesh) lekker, og at rommets skilt skjules på PC-vinduer som er lave (det gjelder bare liggende vinduer under 500 piksler).
- Testdel 36 går gjennom med alle de nye sjekkene. Skjermbilder av tittelen på PC, stående og liggende ser riktige ut.

## 2026-09-26 11:37 memory og todo etter gjennomgangen
- memory.md: regelen for rulling i openPanel (samme panel beholder, alt annet begynner øverst), fast kvalitet ved mistet grafikk, tipslappen liggende, hjertene som +fulle/skjulte, !important på auto-margene, tastene i testpanelet, og minnesjekken i testdel 36.
- todo.md: minnetesten og gjennomgangen er gjort.
- Full testkjøring på 8777830 går i egen arbeidskopi.

## 2026-09-26 12:04 PR #10 flettet og publisert, og ny bestilling fra Tom
- Full testkjøring på det endelige bygget (8777830, i egen arbeidskopi): generatoren 1800 av 1800, gjennomspillingen uten feil, test_ekstra 215 av 215. Etter det kom bare dokumentasjon (c0b110d).
- PR #10 (testmodus, «Si din mening», og mobil: grafikkminnet, mistet WebGL og layout) ble opprettet og flettet av Tom selv rett etterpå (1bc8561, «Merge pull request #10»). GitHub Pages publiserte samme minutt (kjøring 44, success).
- Den publiserte siden er testet i PC-profil og telefon stående og liggende: versjon 1bc8561, tittelen midt på skjermen på PC (73 over, 91 under) og stående, mistet grafikk gir pause og kommer tilbake uten feilmelding, testmodus slås på med ?testmodus, ingen konsollfeil.
- Grenen claude/practical-babbage-nc80bu er satt lik main igjen. De gamle arbeidskopiene wt_for og wt_lyd er fjernet.
- Ny bestilling fra Tom, med et skjermbilde av et HD-2D-spill (pikselfigurer i en 3D-diorama om natta, sterk tilt-shift-dybdeskarphet, varme lamper med glød, lysende kuler ved spilleren): (1) undersøke hvordan grafikken kan bli enda bedre med 2D og 3D sammen, (2) minikartet skal kunne trykkes på så et stort kart åpnes («stortingsrepresentant kart» er autokorrektur for «stort kart»), (3) sjekke om skyggene virker riktig, fordi noen ser faste ut mens andre følger spilleren, (4) mulighet for å spille på Samsung-TV med kontroller. En undersøkelse med fem agenter (grafikk, kart, skygger to ganger fra hver sin kant, TV) går nå.

## 2026-09-26 12:37 Været står stille i klarvær og tåke igjen
- Vakta i Vaer.start (src/17_romtyper.js) hadde havnet inne i en kommentar i 4ba2030, da linja som setter Vaer.F ble lagt til. Siden da har hver etasje med klarvær, tåke eller uten vær i det hele tatt fått 60 hvite prikker og vindsus. Vakta står nå på egen linje igjen, og Vaer.F settes fortsatt før den, så ute() svarer for riktig etasje også når det ikke er vær. Det gir ett tegnekall, 60 prikker og én lydsløyfe mindre i de fleste etasjene, og R.lowTex slår av været igjen.
- Planen sa at etasje 2 skulle være uten vær, men inneetasjer med gårdsrom kan få regn (i testkjøringen regnet det i etasje 3). Testen sjekker derfor alle seks etasjene opp mot det været etasjen faktisk fikk, og tvinger klarvær, tåke og ingen vær for seg.
- Ny testdel 37 (Skygger og vær): regn, snø og ildfluer gir partikler og lyd, klarvær, tåke og ingen vær gir ingenting, heller ikke regnringer, regn er streker og snø prikker, R.lowTex slår av, og etter regn i etasjen før svarer ute() riktig for hver rute i parken i klarvær. Kjørt mot det gamle bygget feiler tre av sjekkene, mot det nye går alle gjennom, og det gjør del 28 (regn, lyn og regnringer) også.

## 2026-09-26 13:31 Skyggene står stille, og lykteskyggene følger med i samme bilde
- Månens skygger krøp når kameraet gled etter pasienten, også når hun bare snudde seg, og hele tiden på tittelen. Skyggekameraet fulgte kameraet uten å holde seg til rutenettet i skyggekartet. Nå rundes midtpunktet av til hele ruter på tvers av lyset (D3.maneB i 15_rom3d.js), så de faste skyggene står stille. Retningen og lengden er som før.
- Telefoner (og TV, når det kommer) får høyst 1024 i skyggekartet, også på høy. Det sparer rundt 24 MB grafikkminne. NIVA er ikke endret.
- D3.tick og Dybde.tick går nå rett før R.render, etter at alt har flyttet seg. Før hang lykta, punktlyset og lykteskyggene ett bilde etter figurene.
- Lykteskyggene (40_dybde.js): lykta lyser ikke lenger gjennom vegger. Det sjekkes rute for rute hvert 0,2 sekund, og bare vegger og en sprukken vegg som står teller. solid() kunne ikke brukes, for møblene merker sin egen rute, og da ville bordene stengt lyset og de høye tingene mistet skyggen. Skyggen glir inn og ut bak hjørner, stopper ved første vegg bak kasteren og blekner jevnt bort nær lykta i stedet for å klippes ved 0,35. Gjennomsiktige og halvt oppløste figurer (den gjennomsiktige mesteren, den skjulte hjorten) kaster svakere skygge. Platene brukes om igjen i stedet for å lages og kastes.
- Jeg prøvde også å la skyggen blekne når en fiende dør, men tok det bort igjen. Testdel 30 venter at skyggen er borte 0,3 sekunder etter drapet, og i testnettleseren tok det første bildet etter et drap over 0,3 sekunder. De døde mister skyggen i første bilde, som før.
- Skyggekartet tegnes ikke i pausen, panelene og journalen. Det tegnes én gang når tilstanden skifter, når etasjen bygges og når grafikken kommer tilbake etter mistet WebGL.
- Testdel 37 har fått sjekker for alt dette: lykteskyggene i 2D, og månen, lykta, pausen og telefonen i 3D. Skjermbildene /tmp/e_skygge_a.png og /tmp/e_skygge_b.png (pasienten flyttet 2 cm) er til å sammenligne for hånd. Mot bygget fra før feiler alle de nye sjekkene. Del 37, 30, 15, 36 og 16 går gjennom. Del 28 feiler på «Morbidium stiger fra lilla pytter» både med og uten endringen: maskinen var belastet av en annen testkjøring, og spilltiden rakk ikke 3,6 sekunder innenfor taket på 20.

## 2026-09-26 13:31 Stort kart
- Ny fil src/45_kart.js (lagt inn i build.py før 30_game.js). Kartet i gullringen er nå en knapp: et trykk eller klikk på det, M, pil høyre på håndkontrollen eller «Kartet» i pausen åpner hele etasjen som en plantegning på papir. M, Esc, P, B, Start og Lukk lukker det igjen. Spillet står stille mens kartet er oppe, som i pausen.
- Kartet tegnes én gang når det åpnes: det malte gulvet skalert ned, bare der pasienten har vært, med myk kant mot det ukjente, rollefargene fra minikartet, skravur over rom du bare har sett inn i, blekkstrek langs veggene, gullkant rundt rommet du står i, røde bommer på låste dører og torner på dørene til forbannede rom. Ikonene er tegnet med blekk: tjenestene som gullmedaljer med forbokstaven, overlegen som hodeskalle (krysset over når den er behandlet), utgangen, stjerner for stille og hemmelige rom, blodoffer, minisjefer, røde spørsmålstegn for noe rart, kors for likene og røde prikker for fiender. I drømmen står romnavnene og døra på kartet. Pasienten er en pil av papir som pulserer, men ikke når redusert bevegelse er slått på i systemet.
- Ved siden av står navnet på etasjen, hvor mye som er utforsket, hvor mange rom som er ryddet, været og en tegnforklaring med bare det du har sett. «Nær meg» viser 24 ruter rundt pasienten.
- Tre oppsett: bredt på PC, smalt stående på telefon (forklaringen under kartet) og lavt liggende på telefon. De skaleres med passInn, og kartet tegnes på nytt når telefonen snus.
- Ingen WebGL. Lerretet er høyst 1024 punkter på hver led, og både det og hjelpelerretene gis tilbake når kartet lukkes (nytt onClose i closePanel). Mangler det malte gulvet, tegnes flate ruter i stedet. Samme kart i 2D, 3D og med «Enkel grafikk». Tegningen tar rundt 10 til 30 ms i testnettleseren.
- På PC ligger ringen der musa ofte sikter, så musebevegelsen sendes videre til spillet, høyre knapp er alltid tungt slag, og i kamp er et klikk på ringen et slag og ikke kartet. På telefon viser en liten lupe på ringen at den kan trykkes på.
- B lukker nå alle paneler som Esc (tilbakeP). Pil høyre åpner bare kartet og lukker det ikke, fordi den skal bla i menyene når håndkontrollen får menynavigasjon.
- Tips for nye pasienter om kartet (fra etasje 2), en rad i kontrolltabellen og «Kartet» i pausen.
- Fant og rettet en feil underveis: jeg merket ringen med data-kart, men journalen bytter ut alt med data-kart med bilder av kuriositeter, så minikartet forsvant etter første journal. Ringen bruker ikke data-attributter nå, og testen sjekker at minikartet står igjen etter journalen.
- Det hemmelige rommet oppfører seg som før (Tom bestemmer). Den sprukne veggen tegnes som vegg på det store kartet til den er slått opp.
- Ny testdel 40 (Stort kart) i test_ekstra.py: ringen, M, Esc, pausen, håndkontrollen, klikk i kamp, tegnforklaringen, Parken, Nattskogen, drømmen, «Enkel grafikk», uten malt gulv, 3D, telefon stående og liggende med rotasjon, ingen rulling og at lerretet frigjøres. Skjermbilder i /tmp/e_kart_*.png. Del 40, 36, 2, 11, 14, 21 og 22 går gjennom.

## 2026-09-26 14:04 Stort kart: gjennomgang og to rettinger
- Gikk gjennom det store kartet på PC (1280x720, mus og tastatur), i 2D, i 3D, med «Enkel grafikk», på telefon stående og liggende (360x640, 640x360, 390x844, 844x390) og på nettbrett (768x1024, 1024x768). Alt får plass uten rulling, Lukk er på skjermen, og det er ingen konsollfeil. Høyreklikk på ringen gir tungt slag og slippes riktig, og kartet som åpnes fra pausen, går tilbake til pausen også etter at vinduet har endret størrelse.
- Rettet: fiender som en hendelse slipper løs (rottene under lyset, pleierne som hører at du tyster), låser ingen dører, så G.combat er tom. Da åpnet et klikk på ringen kartet midt i slåsskampen i stedet for å slå. Nå regnes levende fiender innen 12 ruter fra pasienten også som kamp.
- Rettet: når et annet panel tar over mens kartet er oppe (drømmen som begynner et kvart sekund etter at pasienten kommer ned, eller pausen), ble lerretet til kartet ikke gitt tilbake før nettleseren ryddet. openPanel kaller nå onClose på panelet som byttes ut.
- Testdel 40 har fått to nye sjekker for dette, og snuingen av telefonen venter nå på det liggende oppsettet i stedet for en fast tid. Del 40, 36 og 2 går gjennom.

## 2026-09-26 14:21 Gjennomgang av skyggene som står stille
- Gikk gjennom endringen i 5b6c5e4 opp mot planen: avrundingen av månens midtpunkt (aksene er de samme som lookAt gir skyggekameraet, og forskyvningen langs lyset endrer ikke rutene), taket på 1024 for telefon, flyttingen av D3.tick og Dybde.tick, veggsjekken for lykta, platene som brukes om igjen og frigjøres i Dybde.tom, og at skyggekartet tegnes igjen når tilstanden skifter, når etasjen bygges og når WebGL kommer tilbake. Fant ingen feil som måtte rettes.
- Sjekket også at ingen høye ting i de seks etasjene står med skyggepunktet inne i en vegg (da ville lykteskyggen blitt borte), og at en telefon med berøring (390 x 844 og 844 x 390) får 1024 i skyggekartet på høy, ingen skyggepass i pausen og ingen konsollfeil, i 3D og i 2D.
- Del 37, 30, 15, 36, 6, 11, 16, 25 og 28 går gjennom. Takstøvet i del 30, dansen i del 25 og Morbidium-pyttene i del 28 feilet mens en annen testkjøring gikk på samme maskin. Da gikk det rundt 20 sekunder på 2,6 sekunder spilltid, og testene har et tak på 20 sekunder. Bygget fra før endringen feilet på samme måte, og begge gikk gjennom da maskinen var ledig.

## 2026-09-26 14:46 Håndkontroll i menyene
- Ny MenyNav i 32_meny.js. Nå kan hele spillet brukes med bare en håndkontroll: tittelen, innleggelsen, pausen, innstillingene, håndboka, arkivet, butikkene, samtalene, journalen, dødsskjermen og utskrivningen. Pil eller venstre spak flytter fokus til nærmeste knapp i den retningen, og ved kanten stopper det (ingen runde). Holdes retningen inne, gjentas den etter 0,35 sekunder og så hvert 0,12 sekund. A trykker, B går tilbake, LB og RB blar i fanene (innstillinger, arkivskuffer, journalfaner) og sidene i håndboka, og høyre spak ruller panelet. På spakene i innstillingene endrer venstre og høyre verdien.
- Dødsskjermen hadde ingen gren i løkka, så der kom en med bare kontroll ikke videre. Den har det nå.
- En A som ble holdt eller hamret på i kampen, trykker ikke på noe det første halve sekundet etter at en meny dukker opp, så ingen hopper over dødsskjermen ved et uhell. En retning som holdes inne når menyen kommer, må slippes først.
- Når menyen lukkes med A eller B, går ikke trykket videre til spillet (slag eller rull) i samme bilde.
- Piltastene virker også i menyene nå (før ble de bare stoppet). Tekstfelt og venstre og høyre på spakene beholder dem som før.
- Journalen: tomme plasser har fått tabindex og Enter, og det tomme kortet i lomma er målet når et kort skal legges i lomma. A på et kort sender Enter til det, fordi kortene velges med tastetrykk og ikke med klikk. Journalen åpnes med fokus på det første kortet.
- Fokusringen: nettleseren viser ikke :focus-visible når skriptet flytter fokus etter en håndkontroll, så body.pad gir en gullring. Kortene, fanene og plassene i journalen har fått ring for tastaturet også.
- Input (01_core.js): håndkontrollen er den første med standardoppsett, ellers den første som finnes, så en kontroll på plass 1 virker. id, oppsett og plass huskes. Frakobling rydder knappene og setter tekstene tilbake til tastaturet. Bruk av kontrollen skjuler berøringsknappene (telefon speilet til TV med kontroll), og musa i menyene tar bort ringen. Input.enhet holder body.pad i takt med siste enhet, og Input.tast gir tasten i tekstene per enhet.
- Tekstene følger enheten: evnekortene i HUD-en viser LB RB LT RT med kontroll, butikken sier «Gå (B)», journalen «Lukk journalen (B)», og beskjedene om poeng nevner Select i stedet for Tab. På berøringsskjerm står det ingen tast.
- Jeg prøvde en rad for menyene i kontrolltabellen, men håndboka har ikke plass: siden med styring renner over med 31 punkter på PC selv med en kort rad. Raden er tatt ut igjen. Menyhjelp for kontroll bør heller stå som en linje under tabellen i Innstillinger, Styring.
- Ny testdel 41 (Kontroller i menyene) med en falsk håndkontroll: tittelen, innleggelsen, pausen, innstillingene med faner og spak, journalen med kort til tom plass og til lomma, butikken, piltastene, berøringsknappene, kontroll på plass 1, frakobling og dødsskjermen med A holdt gjennom dødsfallet. Skjermbilde i /tmp/e_pad_meny.png. Del 41, 40, 35, 36, 2, 3 og 11 går gjennom (61 av 61).

## 2026-09-26 15:05 Skyggeflekkene blir på gulvet, og figurene kaster hele skyggen
- Skyggeflekken under figurene fulgte med opp når de hoppet eller svevde. Nå løfter hopp og sveving bare tegningen (plane), og flekken blir liggende på gulvet, mindre og lysere jo høyere figuren er (Doll.bakke i 11_doll.js, brukt av både Doll og Lagdukke).
- Kråka og koret svevde faktisk aldri i spillet. Lagdukke løftet roten, men updateEnemy satte roten tilbake på gulvet rett etterpå, og det samme tok hoppene til rottene, yngelen, klumpungen og kålhodet. Bare da kråka døde, spratt den opp 0,8. Nå svever de som tenkt (memory.md sier at kråka svever), og kråka og koret daler ned når de dør, sklir eller sover.
- Styrken på flekken er shadowA: 1 i 2D og 0,45 i 3D, der månen også kaster skygge. Før skrev oppløsningen og 3D over styrken direkte. En fiende som døde i 3D fikk en flekk dobbelt så mørk, hjorten som hadde gjemt seg fikk full flekk, og alle beholdt 0,45 når 3D ble slått av. Med lys og skygge av har flekken full styrke, for da er den den eneste skyggen.
- Figurene kastet bare måneskygge fra armene og beina. Lista over de tegnede delene (d.meshes) var alltid tom, fordi tegningene er ShaderMaterial med kartet i uniforms og ikke i material.map. Planen og undersøkelsene gikk ut fra at dukkene kastet hele skyggen, og det står i toppen av 15_rom3d.js at de skal. Nå gjør de det, også et våpen som plukkes opp midt i etasjen, tillegg og pynt som kommer til senere. Det koster rundt fire tegnekall til i skyggepasset per figur (38 med ni figurer i testen), ikke noe grafikkminne. Vil vi spare det på telefon, er det D3.dukke som må endres.
- Halvt oppløste og gjennomsiktige figurer kaster ikke måneskygge: de døde fra halvveis i oppløsningen, den gjennomsiktige mesteren og hjorten når den har gjemt seg.
- Den åpne kista lyste i mørket og hadde fortsatt den bakte skyggen i 3D, fordi U og m pekte på den gamle tegningen. Nå følger de med, og 3D tar kista på nytt.
- Med 3D på og lys og skygge av hadde tingene ingen skygge i det hele tatt. Nå beholder de den bakte.
- Dekaler, plakater og dører er toon som gulvet i stedet for Lambert. Lambert ganget alt lyset med måneskyggen, så de ble mørke flekker i skyggen av en vegg selv med lykta rett ved.
- Skyggeplatene til dukkene frigjøres med dukken, og materialet til et våpen som byttes ut, frigjøres også.
- Lyset på figurene regnes nå midt på tegningen også når den svever.
- Testdel 37 har fått sjekker for alt dette, i 2D og i 3D. Mot bygget fra før feiler alle de nye sjekkene unntatt den som sjekker at flekken blekner riktig i 2D. Del 37, 15, 30, 36, 16, 19, 20 og 27 går gjennom.

## 2026-09-26 15:37 Kontroll av skyggeflekkene og måneskyggene til figurene
- Gikk gjennom f2a9a24 opp mot planen: flekken som blir på gulvet (Doll.bakke), styrken shadowA gjennom 3D, oppløsningen og 3D av, skyggeplatene når delene endrer seg, figurene som ikke kaster måneskygge når de er halvt oppløst eller gjennomsiktige, den åpne kista, de bakte skyggene uten lys og dekalene i toon. Sjekket også at ingenting annet flytter roten til dukkene i høyden (B.hop settes aldri), og at ingen andre leser d.meshes.
- Prøvde PC i 3D og 2D, enkel grafikk og telefon stående og liggende med berøring: kråka og koret svever med flekken på gulvet, flekken er 0,45 i 3D og 1 i 2D og enkel grafikk, telefonene får 1024 i skyggekartet, og ingen konsollfeil.
- Én feil: kuriositetene som vises på pasienten (Items.addons) fikk skyggeplate i 3D nå som hele tegningen kaster skygge, men Items.clearLook koblet dem bare løs. Materialet og skyggeplaten ble liggende for hvert løp. Nå frigjøres begge, og del 37 sjekker det.
- Del 37, 15, 30 og 36 går gjennom.

## 2026-09-26 16:05 Lampene slår seg ikke av og på rundt pasienten i 3D
- Punktlysene i 3D ble delt ut på nytt i hvert bilde etter avstanden til kameraet, uten noe slingringsmonn og uten blekning. Når pasienten gikk, hoppet lyset fra én lampe til en annen med full styrke, og lysflekkene rundt henne slo seg av og på. Støvet i lyset og gløden i tåka hoppet med. I testgangen på 12 ruter ga det 76 slike hopp, og nå ingen.
- Nå har hvert punktlys en kilde og en styrke (D3.fordel i 15_rom3d.js). Lykta har det første. En lampe som har lys, beholder det så lenge den er blant de N+2 nærmeste og ingen lampe uten lys er 1,5 ruter nærmere enn den som er lengst unna. Den som mister lyset, blekner bort på 0,2 sekunder, og først da tennes den neste, på 0,25. Punktlyset flyttes mens det er slukket, så det aldri hopper mens det lyser.
- Lysglimtene (flashLight) er merket blink. Bare ett får punktlys om gangen, og det tennes med en gang, ellers ville et glimt på 0,25 sekunder knapt vist seg. Det tar lyset fra lampen som er lengst unna, og den lampen får lyset tilbake når glimtet er over. Før kunne fem glimt ta fem lamper samtidig.
- Svarte kilder (en lampe som har falt ned, et slukket sjefslys) får aldri punktlys. Planen sa at kilder() skulle ta dem bort, men da hadde vegglampene mistet lysene sine i mørket når en sjef kommer, og lampene lengre unna hadde tatt dem. Derfor beholder en lampe som blir svart, lyset sitt i to sekunder, og lyser med en gang den tennes igjen. Kilder som forsvinner, slukner med en gang.
- Romlyset midt i hvert rom er merket fyll. D3.FYLL_SIST setter det sist i køen, så lampene får punktlysene. Den står av, for det endrer hvordan rommene ser ut, mest i sjefsrommene som mister det varme oransje skjæret. Skjermbilder av alle seks etasjene med og uten ligger i scratchpad (lys_fyll/fyll_ark.jpg) til Tom.
- Ingen kostnad på skjermkortet: antallet punktlys er det samme (8, 6 og 4 etter kvaliteten, ingen uten lys og skygge), så ingen shadere bygges på nytt. 2D og enkel grafikk er som før.
- flashLight og updateFx er lagt til i lista over funksjoner testene når.
- Ny testdel 38 (Lyspuljen): D3.tick kjøres for hånd i faste steg, så maskinens fart ikke betyr noe. Den sjekker gangen på 12 ruter, lykta først og ingen ledige lys når det er kilder nok, fem glimt samtidig, en svart kilde, en lampe som er mørk ett og 2,5 sekunder, FYLL_SIST og antallet per kvalitet. Mot bygget fra før feiler alle unntatt antallet per kvalitet og konsollfeilene. Del 38, 15 og 37 går gjennom.

## 2026-09-26 16:13 TV-modus
- Ny innstilling under Innstillinger, Spill: TV-modus (automatisk, på, av). Automatisk kjenner igjen nettleseren i TV-en (Samsung med Tizen, LG, Android TV, Fire TV og noen andre) på nettleser-ID-en. En PC på HDMI eller en speilet mobil kan ikke kjennes igjen, så der slås den på for hånd. Første gang en håndkontroll brukes på en stor skjerm uten berøring og uten TV-modus, kommer en lapp om det.
- I TV-modus er berøringsknappene borte, HUD-en holder seg 4,5 prosent unna kanten og menyene 5 prosent (mange TV-er skjærer bort litt av bildet), fokusringen er tykkere, og tittelmenyen, panelene (opptil 1,6 ganger) og journalen er større. Skjermteksten ganges med 1,4 på en TV med 1920 x 1080 punkter, med et tak på 1,6 så evnekortene holder seg klar av apparatet. Planen sa «minst 1,4», men da ville spaken for skjermtekst ikke gjort noe på TV-en, så den ganges i stedet. Lappen med tips ligger under merket på TV, fordi merket blir så bredt.
- TV-er starter på middels kvalitet i 3D og får de mindre gulvbildene, som telefonene. «Enkel grafikk» og 2D er som før.
- Tilbake på fjernkontrollen (Samsung 10009, LG 461, GoBack, BrowserBack og XF86Back) er Esc. Fjernkontroller som ikke sender code, bruker key, så pilene virker i menyene også da. Bare i TV-modus legges det inn et ekstra steg i historikken når spillet er i gang, så tilbake gir pause eller lukker menyen i stedet for å gå ut av spillet. På tittelen og mens spillet lastes er det ikke noe steg, så der går tilbake ut som i andre TV-apper. Kommer både tastetrykket og steget i historikken for samme trykk, gjøres det bare én gang.
- Fullskjerm: en liten knapp på tittelen og en linje i pausen der nettleseren kan det (ikke iPhone). Teksten bytter til «Avslutt fullskjerm».
- Testrapporten sier nå «Samsung-TV (Tizen x, Chromium y)», hvilken kontroller nettleseren ser (navn, oppsett, knapper og akser), om TV-modus er på og om spillet er i fullskjerm. Innstillinger, Styring har en linje øverst som sier «Kontroller funnet» eller «Ingen kontroller funnet», og en linje under tabellen om menyene med kontroll. Da kan Tom finne ut på én gang om nettleseren i TV-en slipper kontrolleren inn.
- Pasienthåndboka: kapittelet Styring har fått en side til, «Spille på TV», med den korte veiledningen. Den lange står i en egen fil til README og todo.
- Rettet underveis: det som står midt på i HUD-en (kortene, skiltet, sjefsstanga, minisjefen og tipslappen) gled mot venstre når skjermteksten var større enn 100 prosent, fordi skaleringen tok utgangspunkt i midten av boksen etter at den var flyttet et halvt hakk til venstre. Nå står de midt på, og avstandene ned fra toppen følger størrelsen, så lappene ikke legger seg over skiltet. Ingen endring med 100 prosent.
- For TV-er fra 2023 (Chromium 94), som ikke kan CSS-egenskapen scale, gjør zoom samme jobb. Sjekket ved å tvinge den reserven i testnettleseren: HUD-en havner på nesten samme sted.
- Ny testdel 42 (TV-modus) med nettleser-ID-en til en Samsung-TV i 1920 x 1080: gjenkjenning, HUD innenfor margene uten overlapp og midt på (også med største skjermtekst), berøringsknappene skjult, middels kvalitet, pilene uten code, fullskjerm, tilbaketasten og historikken (også begge for samme trykk, og ut av spillet fra tittelen), testrapporten, linja om kontrolleren, håndboksida, journalen, innstillingen av og på, vanlig nettleser uten TV-modus og med lappen, og 3D med «Enkel grafikk». Testdel 11 venter nå 18 sider i håndboka. Del 42, 41, 40, 36, 35, 23, 11 og 2 går gjennom.

## 2026-09-26 16:47 Gjennomgang av lyspuljen uten hopp
- Gikk gjennom endringen i 4735474 opp mot planen: D3.fordel med lykta først, slingringsmonnet (N+2 og 1,5 ruter), blekningen ut på 0,2 og inn på 0,25 sekunder, at punktlyset flyttes mens det er slukket, bare ett lysglimt om gangen, svarte kilder, merkingen av glimt (blink) og romlys (fyll), og FYLL_SIST. Fant ingen feil som måtte rettes.
- Spilte med tastatur på PC (1280 x 720) i 3D og målte punktlysene i hvert bilde: tolv bytter mellom lamper mens pasienten gikk, alle med blekning, og styrken endret seg aldri raskere enn blekningen. Tittelen, en kamp med slag og telefon stående og liggende med styrespaken (6 punktlys på middels) ga ingen hopp. Et par lysglimt tar lyset fra én lampe, den lengst unna, og alle lampene er tent igjen etterpå. I 2D og med enkel grafikk er det ingen punktlys, romlyset er merket i hvert rom, glimtene blir borte, og det er ingen konsollfeil noe sted.
- Kjørte koden i del 38 på åtte etasjer med forskjellige frø. Alle gikk gjennom med god margin, så delen avhenger ikke av hvordan etasjen blir. Fordelingen tar rundt 0,03 millisekunder per bilde.
- Ikke rettet, fordi det var der fra før: R.kilder beholder lyskildene fra etasjene før (de henger fortsatt i den gamle R.levelL-gruppen og blir derfor aldri ryddet), og materialene til lysplatene i R.light frigjøres ikke når etasjen rives. Ingen av dem har egne teksturer, så det er bare litt minne i JavaScript per etasje.
- Del 38, 15 og 37 går gjennom.

## 2026-09-26 17:37 Gjennomgang av TV-modus: tilbake med testpanelet og på tittelen, og testdel 42 uten tidsflaks
- Gikk gjennom TV-modus på PC (1280 x 720), stående og liggende telefon, TV i 1920 x 1080 og 1280 x 720 og PC med TV-modus slått på, og sammenlignet med versjonen før. Ingen konsollfeil. På TV holder HUD-en seg innenfor margene, og med større skjermtekst står kortene, skiltet og tipslappen nå midt på også på PC og telefon (før gled de mot venstre, på stående telefon ut over kanten).
- Rettet: med testpanelet åpent over pausen lukket ett trykk på tilbake både testpanelet og pausen når TV-en sender både tastetrykket og steget i historikken. Testpanelet stopper tastene før spillet ser dem, så tasten ble aldri husket. Nå huskes tilbaketasten før testpanelet får den. Tom skal bruke ?testmodus på TV-en, så der ville det skjedd.
- Rettet: sto spilleren på tittelen med steget fra spillet igjen i historikken (etter Avslutt til tittelen, eller etter at innstillingene fra tittelen ble lukket med tilbake), måtte tilbake trykkes to ganger for å gå ut når TV-en sender både tasten og steget. Nå husker spillet hva det holdt på med da tasten kom, og går ut med én gang når tasten kom på tittelen.
- Steget i historikken kom 0,7 til 0,9 sekunder etter tasten i testnettleseren, fordi det venter på neste bilde, og testdel 42 feilet én gang av det. Grensen for samme trykk er derfor 3 sekunder i stedet for 1,5.
- Testdel 42: stegene som bare går tilbake i historikken, nullstiller tiden siden forrige tast. Før gikk de gjennom bare fordi testnettleseren er treg; på en rask maskin ville de blitt tatt for samme trykk som tasten rett før. 3D-siden klikker i siden i stedet for med musa, fordi museklikket gikk ut på tid da maskinen hadde mye å gjøre. Nye sjekker for testpanelet over pausen, tittelen med både tast og steg og tittelen uten tast. De feiler med versjonen før. Del 42, 41, 36 og 35 går gjennom (49 av 49), også mens maskinen hadde mye annet å gjøre.
- Åpent: planen sa at steget i historikken skulle vente til Tom har prøvd nettleseren i TV-en. Det er med nå, bare i TV-modus. Pausen på liggende telefon har fått en knapp til (Fullskjerm), så linja nederst må rulles fram. Nettlesere regner vanligvis ikke A på håndkontrollen som et ekte trykk, så Fullskjerm med A kan bli avvist (lappen sier fra), mens OK på fjernkontrollen virker. Reserven med zoom for TV-er uten scale er ikke prøvd i en ekte Chromium 94.

## 2026-09-26 17:38 Grafikken fra de ti tegnelistene levert
- Leste hele Claude-artifacten CwTKtxx3rN65Es4PKpTPrW og kontrollerte alle 74 bestillinger mot den ferdige produksjonen. Alle er dekket.
- La inn 268 nye PNG-kilder i gpt-grafikk/: 257 manglende manifestbilder og 11 delark med 97 synlige deler. Kasterens åtte filer er gjenbrukt fra prøven. De 311 eksisterende PNG-kildene er kontrollert uendret med SHA-256.
- Tok utgangspunkt i gjeldende main, 1bc8561, med mobilrettingene. Bildeverktøy og manifest er de samme som ved produksjonsstart.
- Kjørte den ordinære klippingen, bildebehandlingen og byggingen: 544 behandlet, 0 feil; 544 bilder, 124 synlige deler og 165 lyder i bygget. Ingen endringer i spillkode, manifest eller bildeverktøy.
- Genererte ART_BRIEF.md og tegnelistene på nytt: 544 av 544 levert, 0 manglende bilder og 0 manglende delark. Ferdige bestillingslister fjernet av generatoren.
- GRAFIKKLEVERANSE.md og grafikkleveranse.csv dokumenterer filene og overleveringen til Claude. Full visuell spilltest er ikke utført; hjortens kropp mot de animerte beina er en konkret gjenstående kontroll. Oppdatert memory.md og todo.md.

## 2026-09-26 18:09 Dioramaet: glorier rundt lysene og tilt-shift på telefon
- Først ryddet jeg plass i etterbehandlingen (04_render.js). Hjelpemålene til glød og tilt-shift og lysbufferen har ikke lenger dybdebuffer, som de aldri brukte. Lysbufferen lages bare uten 3D og kastes i 3D, der ingenting tegnes i den. Etterbehandlingen henter lysbufferen bare når den brukes, og bildet bare én gang når det ikke er fargesplitt. Målene til glød og tilt-shift kastes når de slås av (lavere kvalitet eller 2D).
- Nedskaleringen til glød og tilt-shift tar nå fire oppslag i stedet for ett, så hver rute i kvart oppløsning får snittet av alle pikslene under seg. Små lyse ting (pærer, gnister, støv) blinket inn og ut av gløden når de flyttet seg. Glød og tilt-shift deler nå firkanten og shaderne (R.kjede), og tilt-shift virker også uten glød.
- Nye glorier (Glorie i 38_effekter.js): et mykt lys rundt lampene, stearinlysene, alterlysene, lyktestolpene, bålet, ovnene, kjelen, teslaspolen, lysskjermen, kjempeplanten og journalskapet, rundt pærene i vegglampene i 3D, og et lite lys ved siden av pasienten. Ett Points-objekt per etasje, laget i Effekter.onFloor og frigjort i clearFloor, og det koster ett tegnekall. Høyst 32, 20 og 10 på høy, middels og lav (10 i 2D), de nærmeste kameraet, med blekning inn og ut. Ingen med enkel grafikk, lette teksturer eller uten lys og skygge. Stedet på lampen, stearinlysene, journalskapet, offeralteret og alteret er målt i bildene fra ChatGPT. Gloria følger lysplaten sin, så den flimrer med stearinlysene, blir borte når en lampe faller eller knuses, slukker i mørket etter sjefene og vokser fram med møblene når rommet bygges.
- Planen sa at gloriene skulle legges additivt oppå. Det prøvde jeg først, men da ble de enten så svake at de ikke syntes, eller så sterke at blekkstrekene gjennom dem ble grå. Nå ganges gloria inn i det som ligger under (bildet ganger 1 pluss gloria). Flammene og lampeglasset, som natta i 3D gjorde mørke, lyser igjen og kan ta gløden, mens blekkstrekene holder seg like mørke i forhold til det rundt. Ved et stearinlys går snittet i en boks på 24 piksler opp fra 52 til 74, og den lyseste blekkpikselen er 45. Lampen på fot har en lys skjerm fra før og fikk derfor svakere glorie, og det samme gjelder pærene i vegglampene, som ellers ble en hvit klatt på stående telefon.
- Tilt-shift er slått på også for middels (0,45), som er det telefonene starter på, og høy har fått 0,7. Det skarpe båndet følger pasienten i stedet for å stå fast midt på skjermen, og er smalere på stående skjerm enn liggende. I de uskarpe båndene blir gloriene større og svakere, som lys ute av fokus.
- Skjermbilder av samme rom (kapellet i underetasjen og lysthuset i parken) på høy, middels, lav, 2D og enkel grafikk, før og etter, på PC og stående telefon, ligger i scratchpad (diorama/sammenlign_*.jpg og enkeltbildene) til Tom. Pasienten og hendelsene i rommet er forskjellige fra bilde til bilde, men rommet er det samme.
- Ny testdel 39 (Diorama): tilt og mål per nivå, 2D, antallet glorier mens kameraet glir over etasjen, enkel grafikk og de andre bryterne, lyset og blekket ved et stearinlys, tegnekallet, båndet der pasienten står, mørket, et lys som blir borte, etasjeskifte og telefon stående og liggende. Mot bygget fra før stopper delen fordi Glorie ikke finnes.
- Del 39, 15, 28, 36 og 38 går gjennom. I en kjøring mens skjermbildene ble tatt på samme maskin, feilet Morbidium-pyttene i del 28 og grafikkminnet i del 36 (7 teksturer mer i andre runde, grensen er 6). Bygget fra før ga opptil 8 i samme måling, og med samme frø vokste begge byggene like mye, så det avhenger av hvor fort maskinen går. Begge gikk gjennom da maskinen var ledig.

## 2026-09-26 18:47 Gjennomgang av dioramaet: gloriene på store skjermer og enkel grafikk
- Gikk gjennom glorier, tilt-shift, nedskaleringen og målene uten dybdebuffer mot planen, og kjørte del 39, 15, 28, 36, 37 og 38 i tillegg til egne målinger på PC (1280x720, 1920x1080 og 1280x720 med dobbel pikseltetthet), i 2D, med enkel grafikk og på telefon liggende.
- Rettet: gloriene var kappet på 160 piksler. Det slo inn i de uskarpe båndene allerede på 1280x720 (23 av 36 glorier på høy), på alle i båndene på 1920x1080 og på de fleste også i det skarpe båndet på skjermer med dobbel pikseltetthet. Der ble gloriene altså mindre enn meningen var, og i de uskarpe båndene ble de svakere uten å vokse, fordi dempingen regnet med at de vokste. Nå er grensen det største punktet skjermkortet kan tegne (1023 i testnettleseren), og blir en glorie likevel kappet, dempes den bare så mye som den faktisk vokste. På telefon er gloriene nesten alltid under den gamle grensen, så der er det nesten ingen forskjell.
- Rettet: når enkel grafikk ble slått på midt i spillet (i innstillingene eller av selvtesten ved hvitt bilde), ble målene til glød og tilt-shift liggende på skjermkortet. Nå kastes de, og lysbufferen, så lenge enkel grafikk er på.
- To nye sjekker i del 39 for dette. Begge feiler mot bygget fra før og går gjennom nå.
- Ikke rettet, men verdt å vite: med «Lys og skygge» av er glød og tilt-shift fortsatt på i 3D, som før. Planen nevnte at de skulle av der også, men det står ikke blant det som skulle sjekkes, og det endrer ikke minnet på telefon. Punkter som tegnes utenfor skjermkanten, kan på noen skjermkort forsvinne helt i stedet for å gli ut. Det skjer ikke i testnettleseren, så det er ikke sett.

## 2026-09-26 19:35 Sporene flettet, og tre små rettinger etterpå (testene går)
- Spor A (vær, skygger, lyspulje og diorama-lys) og spor B (stort kart, kontroller i menyene og TV-modus) er flettet inn i grenen med to flettecommiter. Konfliktene: kval() fra spor B (TV starter på middels) sammen med taket på skyggekartet fra spor A, MenyNav i løkka med D3.tick og Dybde.tick etter bevegelsen, begge eksportlistene, testdelene 37 til 42 i rekkefølge, og loggen sortert etter tid.
- Rettet etter notatene fra skeptikerne:
  1. B er også rulleknappen. Et B-trykk i spillet rett før et panel dukker opp av seg selv (brevet, drømmen), lukker ikke panelet det første halve sekundet, på samme måte som A. B i menyene teller ikke.
  2. Merket på flaska og apparatet i HUD-en sa alltid F og V. Nå står det Ned og Opp med håndkontroll (Bruk på berøring).
  3. R.kilder (lyskildene) vokste for hver etasje, fordi platene i den gamle lysgruppa fortsatt hadde gruppa som forelder. Når etasjen byttes, tas de ut av lista og materialene deres kastes. Grensen på 400 luker også ut kilder i grupper som er tatt ut.
- Ny testdel 43 for de tre rettingene. En første kjøring av testdelene 36 til 42 på det flettede bygget går nå. Den har funnet tre feil i skyggesjekkene i del 37 (nye fiender får ikke skyggeplate i 3D), som undersøkes når kjøringen er ferdig.

## 2026-09-26 19:53 Dokumentasjon for sporene, og TV.md
- memory.md: nye deler om skygger, lys og diorama (tre skyggesystemer og hvorfor, låsingen av måneskyggen, rekkefølgen i løkka, lykteskyggene, flekkene og hopp, D3.dukke, lyspuljen, R.kilder, værvakta, Glorie og tilt-shift), det store kartet, kontroller i menyene (MenyNav, vaktene for A og B) og TV-modus. To eldre linjer om D3.tick og punktlysene er oppdatert.
- todo.md: ny del med det som er gjort og ni ting Tom må ta stilling til eller prøve: TV-en, lysretningen, romlyset sist, styrken på gloriene og tilt-shiften, skygger fra hele tegningen på telefon, kråka som svever, hemmelige rom på kartet, og hva Enkel grafikk og Lys av skal slå av.
- README.md: kartet, håndkontroll i hele spillet og lenke til TV.md.
- AGENTS.md: 45_kart.js i fillista, og en regel om håndkontroll og TV for nye paneler.
- Ny fil TV.md: veiledningen for å spille på Samsung-TV (PC med HDMI, rett i TV-en med kontroller paret til TV-en og ?testmodus for å sjekke, trådløst fra PC eller mobil, menyene med håndkontroll).
- Den fulle testkjøringen på det flettede bygget (6a97b44) og en gjennomgang med skeptikere går fortsatt.

## 2026-09-26 20:39 Full testkjøring på det flettede bygget, og to tester gjort robuste
- Full kjøring på 6a97b44 (i egen arbeidskopi): generatoren 1800 av 1800, gjennomspillingen uten feil, test_ekstra 312 av 314. De tre skyggefeilene fra den første kjøringen etter flettingen kom ikke igjen (del 37 gikk også gjennom alene og sammen med del 36).
- De to som feilet, var testene, ikke spillet:
  1. Minnesjekken i del 36 målte +7 teksturer mellom første og andre runde. Med fire runder på rad ble tallene 122, 122, 126 og 126, altså bilder som bufres første gang noe dukker opp (det varierer litt fra runde til runde), ikke en lekkasje. Sjekken sammenligner nå andre og tredje runde. Lekkasjen fra før rettingen ga +16 i hver runde, så den fanges fortsatt. Nå: +1 tekstur og 0 geometrier.
  2. B-testen i del 43 regnet med at fem bilder tar under 450 ms. I testnettleseren tar de mer. Nå holdes B inne idet panelet åpnes, slik det skjer når den hamres på i kampen, og da virker vakta uansett fart.
- Del 36 og 43 går gjennom.

## 2026-09-26 21:01 Gjennomgang av de flettede sporene: 13 funn, 12 rettet
- Seks lesere (skygger, lys, diorama, kart, menyer, TV) og to skeptikere per funn gikk gjennom hele endringen siden e068b3b. 15 funn, 13 holdt.
- Rettet:
  1. Gloriene kunne krasje spillet («Noe gikk galt»): en glorie som fortsatt blekner for en ting som var død eller skjult, fikk aldri farge og ble lest som undefined. Fargen settes nå før den tidlige returen, og tegnesløyfa hopper over glorier uten farge.
  2. Kartet eller pausen som ble åpnet i sekundet før etasjen byttes (når drømmen blekner), ble liggende over den nye etasjen. startFloor lukker nå et åpent panel først og kjører onClose.
  3. Lappen for å snakke dekket toppen av evnekortene med stor skjermtekst og i TV-modus. Den flytter seg nå opp med --ui.
  4. Lyspuljen kunne ta lyset fra en lampe blant de nærmeste når en annen allerede var på vei ut. Bytte skjer nå bare når det venter flere enn det er plasser som er ledige eller på vei ut. Med FYLL_SIST sammenlignes ekte avstand mellom to romlys.
  5. Kartet tegnet rød bom og torner på sprekken til det hemmelige rommet og røpet den. Sprekken er vegg på kartet også der.
  6. Den første A etter mus eller tastatur trykket med en gang på den første knappen i menyen. Nå viser den bare hvor fokuset er.
  7. En knapp som kom tilbake avslått (Neste på siste side), sendte fokuset til den første knappen i menyen. Nå går det til den nærmeste.
  8. Skyggekartet står stille i paneler, så et våpen kjøpt i butikken hadde gammel skygge til panelet ble lukket. D3.dukke ber nå om ny skygge når en figur får nye deler.
  9. A på en håndkontroll teller ikke alltid som et ekte trykk i nettleseren, så lyden kan vente og fullskjerm kan bli nektet. Spillet sier nå én gang hva som virker (OK på fjernkontrollen, en tast eller et klikk), og meldingen om fullskjerm sier det samme på TV.
- Ikke rettet, og lagt i todo: en glorie som forsvinner brått når midten går ut av skjermkanten (slik tegnes punkter), og at tilbake på tittelen i TV-modus laster spillet én gang til rett etter at siden er lastet på nytt (nettleseren lar ikke siden fange et steg som hører til dokumentet før omlastingen).
- Under rettingen havnet en kommentar midt på en enlinjes funksjon i 45_kart.js, så resten av linja ble kommentert bort og spillet ikke startet. Fanget av del 43 og rettet. Alle filene i src/ sjekkes nå også med node --check før testene.
- Nye sjekker i del 43: gloria krasjer ikke, panelet lukkes når etasjen byttes, og lappen ligger over kortene i TV-modus. Del 43 går gjennom.

## 2026-09-26 21:41 Siste testkjøring, klikk som tåler en travel maskin, og ny liste fra Tom
- Full kjøring på 973a662 (etter rettingene fra gjennomgangen): generatoren 1800 av 1800, gjennomspillingen uten feil, og test_ekstra 280 av 280 fram til 3D-siden i del 40. Der stoppet testskriptet: klikket på «Ny pasient» ble ikke ferdig på 30 sekunder, fordi en 3D-side på 1280 x 720 i programvaregrafikk brukte sekunder per bilde mens agentene fra en undersøkelse jobbet på samme maskin. Del 40 alene gikk gjennom (17 av 17).
- test_ekstra.py har fått hjelperen klikk: et vanlig klikk først, og svarer ikke siden på 15 sekunder, trykkes knappen fra siden selv. start_lop bruker den. Testene prøver da spillet og ikke hvor rask maskinen er.
- Containeren ble startet på nytt mens del 40 til 43 kjørte. Filene var der fortsatt, og kjøringen er startet igjen.
- Ny liste fra Tom, med fem skjermbilder: (1) effektene når fiender angriper (de røde strekene og sirklene som varsler angrep) skal se mye flottere ut, (2) snøen må se mye bedre ut, (3) hårrullene skal sitte på hodet og ikke sveve over, (4) skjulte rom skal skjules bedre, (5) spørsmål om ChatGPT bør lage grafikk til vegger og gulv, (6) flere fiender: Cthulhu og tentakelmonstre, og en Hellraiser-parodi med cenobitter som er ivrige skinnentusiaster. Skjermbildene viser også to stempler oppå hverandre («IKKBONKG») og blod på skjermen som renner som rette, tynne streker. Seks agenter undersøker lista, bare med lesing.

## 2026-09-26 21:52 Main flettet inn (grafikkleveransen), og delarkene klippet
- PR #11 fikk konflikt fordi Tom hadde lagt grafikkleveransen på main (88ebc55: 257 bilder og 11 delark, manifestet 544 av 544). Main er flettet inn i grenen. Bare loggen hadde konflikt, og den er sortert etter tid.
- Kjørte tools/skjaer_ark.py og tools/behandle_bilder.py slik GRAFIKKLEVERANSE.md sier. De 11 delarkene er klippet til løse deler i assets/deler/ (deler.json slått sammen med de gamle), og arkene er flyttet til gpt-grafikk/behandlet/, slik de tidligere leveransene ligger i repoet. 544 bilder behandlet, 0 feil. Bygget har 544 bilder, 124 synlige deler og 165 lyder, og er nå 10,8 MB (før 6,5 MB).
- Målt i mobilprofil over seks etasjer: grafikkminnet er det samme som før (48 MB), mens JS-minnet er høyere (rundt 110 MB mot 68 MB), fordi de nye bildene ligger som tekst i fila. Bildene pakkes bare ut når en del brukes.
- Den publiserte siden har hatt de nye bildene siden 15:40 UTC, så Toms skjermbilder med hårrullene er trolig tatt med dem. Kontrollene som GRAFIKKLEVERANSE.md ber om (hjorten, trillepasienten, speilpasienten, hatter, hår og tilbehør i alle tre retninger), tas i neste runde sammen med Toms liste.
- Full testkjøring med alle 544 bildene går nå.

## 2026-09-26 22:27 Full testkjøring med alle 544 bildene, og to tester rettet
- Full kjøring på det flettede bygget med alle 544 bildene (6d5c45e, i egen arbeidskopi): generatoren 1800 av 1800, gjennomspillingen uten feil, test_ekstra 279 OK og 1 feil før skriptet stoppet på 3D-siden i del 40.
- Feilen var i del 22 (UI-settet): testen gikk ut fra at UI-bildene mangler ved start, og slik er det ikke etter leveransen. Nå tas ui_*-bildene ut av SPRITES mens sjekken går, begge tilstandene prøves, og de leverte bildene legges tilbake.
- Stoppen i del 40: på den tunge 3D-siden bruker hvert klikk 6 til 7 sekunder, og i den lange kjøringen enda mer. Klikket på oppvåkningen gikk trolig gjennom selv om svaret kom for sent, så innleggelsen var borte da reserven ventet på at knappen skulle synes. Reserveklikket i hjelperen klikk trykker nå bare når knappen fortsatt synes, og venter ikke på at den skal bli synlig.
- Del 21, 22 og 40 til 43 kjøres nå på nytt med alle bildene.

## 2026-09-26 22:36 PR #11 flettet og publisert
- Del 21, 22 og 40 til 43 med alle 544 bildene: 54 av 54. Sammen med den fulle kjøringen er hele suiten grønn på det endelige bygget med grafikkleveransen.
- PR #11 (skygger som står stille, lys uten blinking, diorama-lys, stort kart, kontroller i menyene og TV-modus, pluss grafikkleveransen fra main) er flettet som 799f983, «Flett PR #11». GitHub Pages publiserte på 30 sekunder (kjøring 46).
- Den publiserte siden er testet på PC og telefon, stående og liggende: versjon 799f983, tittelen midt på skjermen på PC og stående, kartet åpnes, TV-modus er av på PC og telefon, gloriene og menynavigasjonen finnes, mistet grafikk gir pause og kommer tilbake, ingen konsollfeil.
- Grenen claude/practical-babbage-nc80bu er satt lik main. Arbeidskopiene og grenene til sporene (spor-a, spor-b) er fjernet.
- Neste: Toms nye liste (angrepseffekter, snø, hårruller, skjulte rom, vegger og gulv fra ChatGPT, nye fiender), stemplene som legger seg oppå hverandre, blodet på skjermen, og kontrollene som GRAFIKKLEVERANSE.md ber om. Undersøkelsen går.

## 2026-09-26 23:34 Runde 5: planen for Toms liste, og grunnlaget før sporene
- Undersøkelsen med seks agenter (bare lesing) er ferdig, med én rapport per punkt og en plan. De viktigste funnene:
  1. Angrepsvarslene er flate røde strimler og små sirkler med rundt 30 tilfeldige farger, og de forsvinner brått. Hvert varsel og hvert slag lager ny geometri som aldri frigjøres (samme slags lekkasje som ga «Noe gikk galt» på mobil). Fem angrep treffer der fienden står nå, mens varselet står igjen der det ble laget.
  2. «IKKBONKG»: «IKKE I DAG» (perfekt unnvikelse), «bom» og «BONK» (rullestolen i veggen) havner på samme sted samtidig. Stemplene på skjermen dekker hverandre, og et nytt stort stempel skriver over det som vises.
  3. Blodet på skjermen blir rette streker fordi hvert spor har samme bredde og styrke hele veien, dråpene mister nesten ingen masse og alderen på sporet nullstilles for hvert nytt punkt.
  4. Snøen er 220 harde firkanter i en fast boks som ikke følger kameraet, og snøen på bakken er bleke ellipser klippet langs rutene.
  5. Hårrullene svever fordi tallene i PAS_PYNT var laget for hodet som koden tegner. ChatGPT-hodene er lavere og smalere, så bare 0 til 2 prosent av hårrullene rører hodet. Horn, sløyfe, svulst og hårnett svever også litt.
  6. Det hemmelige rommet er malt, opplyst og vist på kartet. Bare sprekken stenger. Gangen fram til det synes på skjermbilde 10.
  7. ChatGPT-vegger og bakken ute kan brukes nå (veggene tegnes i omtrent skjermens oppløsning). Gulv først når gulvet tegnes med egne fliser, ellers presses bildene ned til 24 til 32 punkter per rute.
  8. Nye fiender: «Havet under huset» (Avløpsarmen, Kapellanen, Draugpleieren, Kraken) og «Skinnlauget av 1887» (Lærlingen, Klokkeren, Holdningssøsteren, Oldermann Nålepute). Skinnlauget er en parodi på cenobittene: høflige lærhåndverkere med reimer, spenner, kroker og dagsorden. Ikke noe seksuelt, og ingen navn eller sitater fra filmene.
- Arbeidet deles i fire spor som går samtidig i hver sin arbeidskopi, med en egen skeptiker som sjekker og retter hvert punkt: A (varsler, lekkasjen, partikler og nedslag), D (tekster og stempler, blodet på skjermen, hårrullene med kontrollene fra GRAFIKKLEVERANSE.md, og snøfallet), B (vegger og bakke fra ChatGPT med tegnelister 11 og 12, det skjulte rommet og vinter i teksturene) og C (de nye fiendene).
- Grunnlaget før sporene: fem nye filer i bygget (46_blekk.js, 47_sno.js, 48_skjult.js, 49_havet.js og 50_skinnlauget.js, etter 43_vaatt.js og før 44_testmodus.js), fillista i AGENTS.md, kontrakten mellom sporene i memory.md, og test 28 teller typene glød i stedet for å vente åtte (to spor legger til nye typer).

## 2026-09-27 01:24 Sporene stoppet på bruksgrensen, og startet igjen
- Alle fire sporene stoppet rundt 00:15 UTC fordi bruksgrensen for økta var nådd. De første agentene i hvert spor (A1, A2, B1 og C3) var kommet langt, men hadde ikke committet. Endringene deres ligger i arbeidskopiene.
- Sporene er startet på nytt. Agentene som kommer nå, ser gjennom det som ligger igjen, beholder det som er riktig og gjør ferdig. De committer også underveis, så et nytt avbrudd koster lite.
- Et spor stopper nå med én gang hvis en agent faller ut, i stedet for å prøve resten av punktene og feile på hvert av dem.
- Agentene tenker på «high» i stedet for «max», så runden bruker mindre av grensen.

## 2026-09-27 01:59 Spor C, punkt C3: grunnarbeid for nye fiender
- Den som ligger under vann (`e.dukket`), gjelder nå alle fiender og sjefer, ikke bare Nøkken. I 49_havet.js pakkes `hurt` inn så slag i vannet gir 0 skade, uten treffkjede og uten blod (fila ligger etter 39_kombo og 34_blod). `nearestEnemy` hopper over dem, så sikte på berøring og håndkontroll, evnene, duene og lynet ikke drar mot tomt vann. Strøm i pytten, skli og snubletråd biter heller ikke under overflaten (før kom det ZAPP og SKLI! over vannet der Nøkken lå).
- Nærkampslaget hopper over dem (20_actors.js), og lykta gir dem ingen skygge (Dybde.kastere i 40_dybde.js krever nå også at dukken synes). Nøkken kastet før en lykteskygge mens han lå under vannet.
- Journalen låner ikke lenger trekk som bare virker med sjefens egen tilstand. De står i `SJEF_DATA[t].egne`: Klumpens rull og hjortens storm (Kraken skal få dypdykk). Hjortens storm hos Journalen var et varsel, et brøl og ingenting mer. Lista finnes som `laanbareTrekk()` i 31_sjefpulje.js.
- Strekbåndene i dukkene sender bare den tegnede delen til skjermkortet (en figur bruker rundt 1300 av 3200 punkter), og et tomt bånd (framsiden på blobfiendene) sendes ikke i det hele tatt. Det sparer rundt 90 kB opplasting per figur per bilde på telefon.
- Ny hjelper `statusOrd(e, ord, cd)` for GREPET, SNØRT, SPENT FAST, HEKTET, DØPT og de andre: samme ord over samme figur høyst én gang per cd sekunder, og et nytt ord mens et annet står, løftes over det. Tekstene fra A2 kan slå dem sammen senere.
- Testdel 58 (Grunnarbeid for nye fiender) sjekker alt dette i 2D og lykteskyggen i 3D, og feiler på bygget fra før. Del 4, 21, 27, 30 og 58 er grønne, bortsett fra takstøvet i del 30, som feiler like ofte på bygget fra før: støvet lever rundt 3 sekunder, mens testen venter 2,6 sekunder spilltid.
- Bilder til Tom: r5_bilder/58_nokken_under_vann_for.png, _etter.png og _utsnitt.png, 58_figurer_for.png og _etter.png (figurene ser like ut), og 58_statusord_etter.png.

## 2026-09-27 02:04 Spor C, punkt C3: skeptikeren
- Skudd og kast stoppet fortsatt der en fiende lå under vann: kula forsvant i tomt vann over Nøkken (og ville gjort det over hver rist med en Avløpsarm). `Items.updateShots` (25_items.js) og `updateProjectiles` (05_world.js) hopper nå over `e.dukket`, som nærkampslaget. To små hunker utenfor spor C sine filer, på linjer ingen andre spor eier.
- Testdel 58 sjekker at både et skudd og et kast går over en fiende under vann, og treffer når han er oppe.
- Resten holdt: Journalen låner ikke rull eller storm (tåkekopien og de andre hjortetrekkene virker hos henne), strekbåndene sender bare det tegnede, og statusordene løftes over hverandre.

## 2026-09-27 02:07 Vegger og bakke fra ChatGPT: anbefaling, bildeløp, støtte i spillet og tegneliste 11 og 12
- Toms spørsmål (punkt 5): skal ChatGPT lage grafikk til vegger og gulv, så det ser bedre ut? Svaret er ja for veggene og bakken ute, og det kan begynne nå. Veggene tegnes i omtrent den oppløsningen skjermen viser dem i (128 punkter per meter), så detaljene fra ChatGPT kommer med, og i dag gjentar hver vegg de samme flekkene annenhver rute. Gulvene venter til gulvet tegnes med egne fliser (B5). Nå males hele gulvet inn i ett stort bilde med 24 til 32 punkter per rute, og et gulv fra ChatGPT ville blitt presset ned til noe uskarpt. Teppet (egen farge per rom og gullkant) og drivhusglasset tegnes fortsatt av koden. Den mørke gangen på skjermbilde 9 kommer av lyset og ikke av teksturene; det er B6.
- Bestillingen: 44 teksturer i to lister. Tegneliste 11 (veggene og bakken ute, 20 bilder) begynner med en prøve på fem (panelveggen, flisveggen, murveggen, hekken og bakken i Parken) som sjekkes på telefon og PC før resten. Tegneliste 12 (gulvene, 24 bilder) bestilles først etter B5. Begge har en egen stilblokk for teksturer (helt dekket bilde, jevnt lys, ingen vignett), fordi den vanlige ber om gjennomsiktig bakgrunn. Referansebildene viser dagens tegning i samme målestokk som bildet ChatGPT skal lage.
- Bildeløpet (tools/behandle_bilder.py): teksturer (flis i manifestet) får ingen bakgrunnsfjerning og ingen beskjæring. Gjennomsiktighet som ikke er med vilje, legges på snittfargen, bildet skaleres (vegger 128 punkter per meter, 442 x 294 for en vanlig vegg, gulv og bakke 512 x 512), og en søm som ikke går i ett, blandes ut med en kopi forskjøvet et halvt bilde (to ruter, så fugene havner likt). Det advarer om magenta og vignett, og lagrer som WebP (build.py tar nå også .webp).
- I spillet: Paint.bilde gir bildet til en flate eller null, så koden maler som før. Veggene tar vegg_<stil> og gjentas hver 1,5 vegghøyde (3,45 ruter for en vanlig vegg), med blekkstreken oppe og nede som før. Bakken ute tar bakke_park eller bakke_skog over 4 x 4 ruter, 512 punkter på PC og 256 på telefon og TV, og snøen legges oppå. Drømmene beholder sine farger (bare sikksakkgulvet og de røde forhengene kan få bilde der). Panelveggen har egne bilder for Underetasjen, Kjelleren og Dypet (_3, _4, _6), og mangler de, maler koden. Et bilde som ikke er pakket ut ennå, males først og byttes når det kommer; et ødelagt bilde males av koden. Lette teksturer (R.lowTex) maler som før.
- Drømmegulvet på telefon og TV har nå 24 punkter per rute (1200 x 624) i stedet for 64 (3200 x 1664, rundt 28 MB i grafikkminnet).
- Ryddet: den døde Paint.floorTex er borte, og panelveggen er skilt ut som Paint.malPanel. DESIGN_BRIEF.md del D, gpt-grafikk/LESMEG.md og ART_BRIEF.md (runde 15) beskriver teksturene. Manifestet har 44 nye nøkler (588 i alt, 544 levert).
- Kjørte lag_manifest.py, lag_brief.py og lag_tegnelister.py --bilder. Referansebildene som forsvant, var alle for bilder som er levert (544 av 544 før denne runden); de nye er ref_vegg_*, ref_gulv_* og ref_bakke_*.
- Test 50 «Teksturer fra ChatGPT»: bildeløpet i ren Python, listene, veggen og bakken med og uten bilde i 2D og 3D, telefon, drøm, sen og ødelagt bildefil, lette teksturer, Enkel grafikk og grafikkminnet. Skjermbilde til Tom: r5_bilder/50_vegg_prove.png.
- Testene: del 50 er 16 av 16, og den feiler på bygget fra før (1ff4a4f) der den skal (veggen og bakken tar ikke bildet, drømmegulvet er 3200 punkter). Det gamle bildeløpet kaster en tekstur som «helt gjennomsiktig». Del 21, 22, 24, 36 og 40 er grønne (45 av 45), test_gen.js likeså (1800 av 1800). Generatorene gir ingen endringer når de kjøres en gang til.
- Prøvebildet i skjermbildet er tegnet av et lite skript, ikke av ChatGPT; det viser bare at veien fra fil til vegg virker i 2D og 3D.

## 2026-09-27 02:09 Spor A, A1: varsler og hugg lekker ikke lenger på skjermkortet
- Hvert varsel på gulvet lagde fire til sju nye geometrier og like mange materialer, og hvert hugg en ny ring. Ingenting ble frigjort, bare tatt ut av scenen, så bufrene ble liggende på skjermkortet til siden ble lukket. 300 varsler ga 1500 geometrier som aldri forsvant.
- Nytt: R.kastTele(g, how, t) ved siden av R.telegraph. Den tar varselet ut og frigjør geometrien, men ikke noe som er merket userData.delt og aldri teksturen med skraveringen. how er 'fyr' når angrepet går av, 'avbryt' når eieren er død, lammet, sover eller cancelTeles stanser den, og 'rydd' når clearFloor river etasjen. Blekkvarselet (A3) kan henge seg på den.
- Materialene til varslene deles per farge og blir liggende. Planen sa at de skulle kastes, men da måtte skjermkortet lenke shaderen på nytt for hvert varsel, fordi ingen andre bruker akkurat den. Varslene endrer aldri materialene sine (bare skalaen på fyllet), så det ser helt likt ut.
- Huggene: ringen lages én gang per bue (rundet til 0,05, helt rundt som før) i R.geo og skaleres med rekkevidden, så størrelsen er den samme som før. Materialene legges i en liten pott og brukes om igjen, av samme grunn som over.
- Test 44 (Varsler og slag uten lekkasje): 300 varsler som går av, 20 som avbrytes, 60 hugg, ingen nye shaderlenkinger, riktig grunn til R.kastTele og rydding ved etasjebytte, pluss én runde i 3D. På bygget fra før gir den +1500, +101 og +60 geometrier. Før og etter i r5_bilder/44_varsler_*.png er like.
- Del 5, 28 og 29 ventet i sanntid og feilet på en maskin der programvaregrafikken gikk på en åttendedel av full fart (også på bygget fra før). Del 5 venter nå på spilletid eller første treff, og taket for spill() i 28 og 29 er hevet fra 20 til 60 sekunder. Del 4, 5, 19, 28, 29, 36 og 44 er grønne.

## 2026-09-27 02:12 Tekstene legger seg ikke oppå hverandre, og stemplene står i kø (A2, «IKKBONKG»)
- Det Tom så i 6.png: en perfekt unnvikelse av trillepasienten gir «IKKE I DAG» og «bom» på pasienten, og når stolen treffer veggen like etter, kommer «BONK» på nesten samme sted. Ordene ble liggende oppå hverandre og leste «IKKBONKG».
- De flytende tekstene (FX i 04_render.js) legges nå ut på nytt hvert bilde. Store ord (krit og stempel) går først, så skade på pasienten, så tall og til sist info, og eldre før nyere. En tekst som ville dekket en annen tekst eller en snakkeboble, flyttes dit den må flyttes minst (helst opp) og glir dit. Planen sa «skyv opp inntil fire ganger, så til siden»; å prøve plassene rundt hver tekst som alt ligger der og ta den nærmeste gir samme resultat og hopper ikke fram og tilbake.
- Samme ord på samme sted på et øyeblikk blir ett ord med en liten puls: «AVSLÅTT ×7», «BONK ×2». Høyst tre store ord lever samtidig; de eldste blekner fort. Store ord står litt på skrå, som et stempel.
- «bom» fjernes når den perfekte unnvikelsen har sitt eget ord. Er «Vis tall» slått av, er ordet skjult, og da får «bom» stå.
- Tekstene flyttes med transform i stedet for left og top, og størrelsen måles én gang per ny tekst, så telefonen slipper å legge ut siden på nytt for hver tekst hvert bilde. Skjulte tall tar ikke plass.
- Stemplene på skjermen: kombostempelet kommer med en gang som før. Det store stempelet (stampBig) venter til det forrige har stått i 0,7 sekunder (høyst tre i kø, like hoppes over). Står begge, legges det store 8 punkter under kombostempelet, og lappen (toast) legger seg i nedre tredjedel under dem så lenge et stempel står. Teksten i lappen settes fortsatt med en gang. På liggende telefon er alle tre mindre, så de får plass under hverandre.
- Ny testdel 45 (Tekster og stempler), på PC 1280x720, liggende telefon 844x390 og én gang i 3D. Alle sjekkene feiler på bygget fra før (1ff4a4f). Del 24, 26, 29, 36 og 45 er grønne.
- Skjermbilder til Tom: 45_tekst_for.png og 45_tekst_etter.png (6.png laget på nytt i liggehallen i Parken), og 45_stempler_etter_844x390.png med tre stempler på en gang.

## 2026-09-27 02:49 Spor A, A1 sjekket av skeptikeren
- Gikk gjennom R.kastTele, updateTele (fyr og avbryt), cancelTeles, clearFloor og huggene: alle stedene som tar ut et varsel, går nå gjennom R.kastTele, ingen andre filer holder på varselet eller endrer materialene, fargene er faste tall (så lista over delte materialer vokser ikke), og ringene og materialene til huggene deles uten å bli kastet ved en feil. Treffene er som før: bare det som går av, treffer.
- Test 44 er ikke tom: toppen er +1500 geometrier for 300 varsler og +101 for 20 avbrutte, og etterpå 0. Del 36 (grafikkminnet) holder seg innenfor. Bildene før og etter er like, som planen sier (A1 skal ikke endre utseendet; det gjør A3).
- Del 28 feilet én gang av fire: fienden i lynprøven ble av og til en pansret mester (Oppskrift.mester, rustning 0,75) og tok 34 i stedet for 45. Ikke fra A1. Testen setter nå e.mArmor = 1.
- Del 4, 5, 19, 28, 29, 36 og 44 er grønne.

## 2026-09-27 02:52 Skeptikeren på vegger og bakke fra ChatGPT (B1)
- Sjekket: koden i Paint.bilde, wallTex og Landskap.bakke (bilde, sent bilde, ødelagt bilde, lette teksturer, drøm, telefon og TV), bildeløpet, manifestet, listene, referansebildene og skjermbildet. Referansebildene som forsvant, gjaldt bare levert grafikk (544 av 544 levert før runden). three.js r128 laster opp lerretet på nytt når det bytter størrelse, så en vegg som får bildet sent, tegnes riktig.
- Rettet: paviljongveggen fikk to motstridende mål i prompten (grønn sokkel 0 til 10 prosent og ingen brystlist, mens malen ber om lister der 3D-rommene setter dem: 0 til 7, 43 til 46 og 94 til 100 prosent). Nå står sokkelen på 0 til 7 prosent, med en hvit brystlist og taklist i samme høyde som 3D-listene.
- Rettet: mobilsiden med tegnelistene (tegnelister/index.html, --side) skrev «null» på hvert kort uten mal, altså på alle 44 teksturene. Siden er laget på nytt med liste 11 og 12; den gamle viste ingen lister. Artifacten «Tegnelister» må publiseres på nytt fra denne fila for at Tom skal se dem på telefonen.
- lag_manifest.py og lag_tegnelister.py --bilder trenger --three STI (eller MORBIDIUM_THREE) når nettet er stengt; ellers finner de aldri tittelknappen. Kjørt på nytt med det: manifestet og referansebildene er uendret.
- Testene: del 50, 24, 36, 40, 21 og 22 grønne, test_gen.js grønn (1800 av 1800), bygget har 544 innebygde bilder.

## 2026-09-27 02:53 Skeptikeren på A2: stemplene og lappen holder seg over evnekortene
- Sjekket planpunktet, testdel 45 og skjermbildene, og tok egne bilder av tre stempler på en gang på PC (1280x720), TV (1920x1080), liggende telefon (844x390) og stående telefon (390x844). Tekstene over pasienten (45_tekst_etter.png) er klart bedre: BONK over IKKE I DAG, og «bom» borte.
- Feil 1: lappen (toast) la seg oppå evnekortene når et stempel sto. På PC dekket forklaringen tallene på kortene (lappen 520 til 626, kortene fra 614), og på liggende telefon lå hele lappen og bunnen av det store stempelet over kortene, så forklaringen ikke kunne leses (det gamle 45_stempler_etter_844x390.png). Stempel.plass legger nå stemplene og lappen under hverandre og måler toppen av kortene (16 punkter ekstra for tallene og myntene som stikker opp). Går det ikke, skyves stakken opp, og er det fortsatt ikke plass, krymper stemplene (ikke lappen, den har forklaringen). Når et stempel går, blir de andre stående der de er, som før.
- Feil 2: en lang forklaring i lappen gikk ut av skjermen på stående telefon (fra før, men nå står lappen lavt der alle ser den). Forklaringen brytes nå innenfor 94 prosent av bredden.
- Feil 3: utleggingen av tekstene prøver alle plassene rundt hver tekst som alt ligger der, så en stor haug på samme sted koster mye (100 tekster: 7,7 ms per bilde på denne maskinen, flere ganger mer på en telefon). Nå legges høyst 28 ut; resten (de minst viktige og nyeste) står der de er. 100 tekster koster nå 0,2 ms.
- Ikke rettet: fanfaren for SYNERGI og FORVANDLING spilles når stampBig kalles, også når stempelet står i kø og vises opptil 0,7 sekunder senere. Test 29 venter fanfaren med en gang, så det er latt være.
- 45_stempler_etter_844x390.png er tatt på nytt. Del 24, 26, 29, 36 og 45 kjøres.
- Del 24, 26, 36 og 45 grønne (60 av 61). Del 29 feilet én gang på «kjeden slutter av seg selv» mens maskinen hadde last 9 på 4 kjerner: testen venter på spilltid med et tak på 20 sekunder ekte tid. Alene gikk del 29 gjennom.
- Del 45 sjekker nå også at de tre stemplene slutter over evnekortene (på bygget før rettingen lå lappen 309 til 386 og kortene fra 284 på liggende telefon). Del 45 grønn.

## 2026-09-27 03:15 Spor C, punkt C4: Skinnlauget av 1887, Lærlingen og Klokkeren
- Ny fil 50_skinnlauget.js med de to første i Avdeling Nulls høflige lærlaug, parodien på Hellraiser som Tom ba om. De elsker lær, reimer, spenner, nagler, lærfett og kroker, behandler smerte som et håndverk med skjemaer og referat, og vil altfor gjerne fortelle pasienten om hobbyen («Kjenn på reima. Oksehud, vegetabilsk garvet. Nei, kjenn!»). Ingenting seksuelt, og ingen navn, tegninger eller sitater fra filmene.
- Lærlingen: lang og ung, midtskill, runde briller, plaster på haka og et lærforkle alt for stort for ham, med korssting, messingnagler, sikkerhetsnåler og laugets sølvkrok. Han bukker (ny positur `bukk`, med gulvknirk, som er varselet), slår med barberreima og spenner deg fast av og til («SPENT FAST»). Etasje 3 én gang, 4 og 6 to ganger.
- Klokkeren: liten, krumrygget gammel mann med digre ører og tre hårstrå, i en lang lærfrakk i oksblod med en ring av sølvkroker i beltet og protokollen under armen. Slår aldri selv: bjella ringer først, så kommer en sølvring (`o.type = 'lenke'`) der pasienten står, og krokene fra mørket går stramme når ringen går av («HEKTET»). Hver tredje ring er stor. Han holder avstand, roper på en lærling høyst hvert tolvte sekund og sier «Notert.» når lauget treffer. Etasje 4 og 6, høyst én per rom.
- Alle stans fra lauget deler én nedkjøling på to sekunder (`G.laugStunT`), så de ikke kan holde pasienten fast på rad. Høyst ti kjettinger lever samtidig; over det hoppes tegningen over, men ringen treffer som før. I Enkel grafikk tegnes ingen kjettinger.
- Tegnet i kode i tre retninger (MONSTER_ART), med reima og sølvbjella i WEAPON_ART. Stemmer (knirk), lyder med synth i reserve (bukk fra den ubrukte gulvknirk, smekk og spenne), replikker, dødsårsaker, mestertitler og fiendeindeksen. De er holdt utenfor ROLLER, så de beholder lærlooket.
- Testdel 59 (Skinnlauget) sjekker at begge legger an og skader på etasje 3, 4 og 6, den delte nedkjølingen, at bjella treffer i ringen og ikke to ruter utenfor, én klokker per rom, taket på kjettinger, Enkel grafikk, fiendeindeksen og håndbokssiden, og én runde i 3D. Den feiler på bygget fra før. Del 23 teller nå sidene i fiendeindeksen i stedet for å vente 16, siden indeksen vokser. Del 11, 23, 36, 58 og 59 er grønne.
- Bilder til Tom: r5_bilder/59_laug.png (begge i kamp, 2D over og 3D under), 59_handbok.png og 59_tegninger.png (delene og portrettene).

## 2026-09-27 03:45 Det skjulte rommet er ikke der før man bryter seg inn (B2)
- Toms punkt 4 og skjermbilde 10: gangen og rommet bak den sprukne veggen var malt, opplyst og på kartet. Nå finnes de ikke før veggen er slått inn.
- Generatoren merker gangen, sprekken og rommet i F.skjult, uten nye trekk fra tilfeldighetene, så alle etasjer blir like som før. test_gen.js sjekker at sprekken og rommet er med, at ingen skjult rute kan nås fra start uten å slå inn sprekken (møblene teller ikke), og at det er deterministisk. Alle 1800 etasjer har et skjult rom, og ingen ble endret.
- Paint.level bygger etasjen lukket: det skjulte er tomrom, så sprekken blir vanlig vegg i foreldrerommets stil og høyde, med blekk, lister og kontaktskygge helt over. Gulvet bak er en egen mesh som står skjult. Veggene regnes to ganger, og bare ruter innenfor to ruter fra det skjulte kan bli ulike; der sammenlignes hver rute, og bare de som faktisk er ulike havner i egne deler (lukket, sprekk og åpen). På etasjen i test 6 er det 18 firkanter lukket og sprekk og 177 åpen, mot 2481 felles. Feiler delingen, bygges etasjen som før.
- Det malte gulvet får blekkstrek og skygge der det synlige møter det skjulte, så rommet foran ser helt vanlig ut. Etter innbruddet blir det en terskel.
- Innholdet står gjemt: møblene, lysene (også fyllyset og glasset), gløden og tennene og pillen. Byggeanimasjonen venter, og det kommer ingen plakat der. I 3D får lister på sprekken egne InstancedMesh, ingen pilastre der, og tåka ligger ikke over det skjulte.
- Kartet: ingenting bak veggen kommer på kartet når du står ved den. Kartpillen, plantegningen og meiselen går gjennom visHeleKartet(), som hopper over det skjulte og gir en stiplet blyantstrek med «Noe er visket ut her». Monokkelen tegner en sprukken vegg i rødt blekk på begge kartene i stedet for å avsløre rutene rundt. Hendelsen som viser skatter, gir samme anelse. 100 prosent utforsket kan nås uten å finne rommet.
- Lekkasjer tettet med gulvSynlig(i): hendelser, lynnedslag, regnringer, tåka, kontaktskygger, dekaler, pytter, likene, drypp fra taket og blodsprut havner ikke på det skjulte, og blod og øyne setter seg ikke på sprekken. Tennene trekkes ikke lenger gjennom vegger. Ute plantes trærne også der det skjulte er, og de tas bort når veggen faller.
- Innbruddet (enkelt, B4 lager showet): det siste slaget knuser veggen som før, så byttes det lukkede mot det åpne, lysene tennes over ett sekund, tennene og pillen kommer, og tåka, regnringene, kontaktskyggene og skyggekartet tegnes på nytt. Murkassen på sprekken står der fortsatt; den byttes ut i B4.
- Test 51 «Det skjulte rommet» (2D og 3D, 15 sjekker) er grønn og feiler på bygget fra før. Del 6, 24, 36 og 40 er grønne, og del 30 er grønn når den kjøres alene (kameradykket bommet én gang under last, det venter på sanntid). test_gen.js er grønn.
- Skjermbilder til Tom i r5_bilder: 51_skjult_for, _etter og _apnet (etasjen i test 6, sprekk i en østvegg, 2D og 3D) og 51_skjult_park_for, _etter og _apnet (Parken med sprekken i sørveggen, som på skjermbilde 10).

## 2026-09-27 03:52 Spor A, A3 Blekkvarsel: angrepsvarslene i én blekkshader
- Toms punkt 1 og 7.webp: varslene var flate røde striper og små ringer. Nå tegnes alle varsler av én shader i 46_blekk.js (Blekk): ett InstancedBufferGeometry med 48 plasser og én ShaderMaterial som ligger i scenen fra første varsel, som partiklene. 30 varsler koster ett tegnekall i 3D og to uten 3D (varslene og lysplatene), og ingenting lages per varsel.
- Formene er avstandsfelt som følger inShape: sirkel, boks fra 0 til len og kjegle (kakestykke pluss en skive på 0,6). Lagene: papirkant utenfor streken så varselet leses på mørke gulv, grunnfarge, skravur i verdensrom bak fronten (kryss etter 0,6), glød innenfra kanten som pulserer fortere mot slutten, vinkler som ruller mot målet på brede baner og streker i prosjektilbaner, en pil ytterst på banene, sigillring og sprekker på store angrep (radius 2,2 eller mer, sjefer og minisjefer), lys front, blekkstreken som tegner seg selv den første fjerdedelen, og låsen de siste 0,12 sekundene. Når angrepet går av, ligger et hvitglødende etterbilde i 0,18 s. Stanses eieren, løses varselet opp i grått på 0,15 s.
- Fargen følger skadetypen (TELE_TYPE: fysisk, morb, strøm, gass, vann, gift, ild, lys, papir, natur, lenke), fra o.type, så fargen i TELE_FARGE (alle 48 fargene som står i koden), så eieren (TELE_EIER, oppasserens sprøyte er gift), så fargetonen, ellers fysisk. Fiendens egen farge brukes i skravuren. Alle typefargene har luminans minst 0,35, så de mørke fargene (0x2a1a30, 0x3a2a44, 0x3a3a4a og de andre) forsvinner ikke lenger på mørke gulv. Strøm har taggete kant, gass og vann boblende, lys glimt, papir dobbel stempelring og lenke kjettingledd.
- Kvalitet: lav og R.lowTex tegner kant, fyll, front og puls, middels, telefon og 2D også inntegning, skravur og vinkler, og høy også blekk som flyter, sigiller og sprekker. Den gamle tegningen brukes med enkel grafikk (R.safe), uten instansiering, når shaderen ikke lenker og når alle 48 plassene er tatt, nå med typefargen. Slås enkel grafikk på midt i et angrep, går varselet over til den gamle tegningen.
- o.folg: varselet følger eieren. Lagt inn i de fem angrepene der treffet flyttes til eieren når det går av (22_sjefer.js:89, 29_monstre.js:591, 37_utefiender.js:268, 373 og 459), og updateTele flytter o med eieren, så det som tegnes og det som treffer er det samme.
- addTele gir nå R.telegraph varigheten og eieren. clearFloor og updateTele pakkes inn i 46_blekk.js. Test 44 måler den gamle tegningen (Blekk.av), siden blekket ikke lager geometri.
- Test 46 (Blekkvarsel): tegnekall, 300 varsler (48 i blekk og 252 på den gamle måten, ingen geometri igjen), plassene frie etter bruk og etasjebytte, formen mot inShape på 18 000 punkter, følge eieren, etterbildet og oppløsningen, skadetypene, fargene, enkel grafikk, piksler inne og utenfor en sirkel og en bane, og en runde i 3D. På bygget fra før stopper den på at Blekk ikke finnes. Bilder i r5_bilder/46_varsel_*.png. Del 4, 5, 19, 20, 27, 28, 36, 44 og 46 er grønne.

## 2026-09-27 04:00 Skeptikeren på det skjulte rommet (B2)
- Sjekket: generatoren og test_gen.js (1800 av 1800, alle med skjult rom, deterministisk), Paint.level med den doble sonen og tellingen av firkanter, gulvkanten i floorCanvas, 3D-byttet (gulvSkjult, toppEkstra, listene på sprekken, tåka), innholdet (møbler, lys, glød, glasset, tennene og pillen), kartene, lekkasjene og innbruddet. Skjermbildene i r5_bilder (51_skjult_*, 2D og 3D, inne og i Parken): gangen er borte på kartet og på skjermen, og veggen går i ett over sprekken. Murkassen på sprekken er den eneste avsløringen som står igjen; den tas i B4.
- Målt over 1800 etasjer: sprekken ligger minst 3,5 ruter fra det skjulte rommet, så kister, journalsider og glasset der inne kan ikke nås med E gjennom veggen.
- Rettet: meiselen (plantegningen) viste ikke lenger «Plantegningen» og spilte ikke papirlyden, fordi toast og lyd hadde havnet inni en kommentar.
- Rettet: en hendelse på veggen (øyet i sprekken og de andre som henger der) kunne legges på sprekken når den er i en nordvegg, og da ville den svevd i lufta etter innbruddet. finnSted hopper nå over den, som blodet og øynene.
- Rettet: takstøvet (når det smeller) kunne falle ned i det skjulte rommet bak veggen, og regndråpene ute laget ringer der. Begge bruker nå gulvSynlig. Én linje hver i 40_dybde.js (takstov) og 17_romtyper.js (regnet), utenfor sporets egne biter.
- Test 51 sjekker nå også hendelser på sprekken og takstøvet. Test 40 venter 3,2 i stedet for 2,6 sekunder spilltid på at takstøvet er borte (det trenger opptil 2,57, og det feilet én gang under last).

## 2026-09-27 04:18 Blodet på glasset renner som blod (A4)
- Det Tom så i 10.png: tynne, rette røde streker fra toppen av skjermen og helt ned. Det var sporene etter bloddråpene på glasset (43_vaatt.js). Hvert spor var ett strøk med samme bredde og styrke hele veien, dråpene mistet nesten ingen masse og rant hele skjermen, alderen på sporet ble nullstilt for hvert nytt punkt, og de tunge treffene la dråper helt oppe i kanten.
- Nå tar sporet med seg litt av dråpen for hver piksel den renner (r² minker med 0,2 ganger bredden ganger strekningen), så en enkelt dråpe renner et stykke og stanser. Bare dråper som slår seg sammen, renner langt.
- Dråpene renner i rykk og napp, og følger ripene i glasset: et rolig felt som er likt for alle dråper i etasjen, pluss dråpens egen slingring og litt skjelving. Sporene slingrer derfor litt, og to spor i nærheten følger samme vei.
- Hvert punkt i sporet har sin egen bredde og alder. Sporet smalner mot dråpen etter hvert som den mister masse, toppen blekner og tynnes først, og et spor er borte når også det nyeste punktet er 8 sekunder gammelt (vann 3,5).
- Sporet tegnes som et bredt, svakt strøk og en smal kjerne, så det får en rund rygg som lyset glinser langs. Leddene tegnes med «lighten», så de ikke blir dobbelt så tykke der bitene møtes. Etter 2 til 3 sekunder trekker det gamle sporet seg sammen til en rad små perler (vann etter 1 til 1,8 sekunder), på faste steder så de ikke flimrer.
- Lerretet får en svart, helt dekkende bunn i stedet for å tømmes, så svakere strøk og perler faktisk blir svakere når det lastes opp (før ble fargen delt på dekningen igjen).
- Tunge treff legger dråpene fra 15 til 35 prosent ned på skjermen i stedet for helt oppe, høyst seks bloddråper renner samtidig, og når ingenting renner og sporene bare blekner, tegnes og lastes lerretet opp annethvert bilde.
- Ikke gjort: tørking i den blå kanalen (valgfritt i planen). Blå kanal er fortsatt ledig.
- Ny testdel 47 (Blod som renner), på PC og stående telefon og én gang i 3D. Den lengste loddrette stripen med blod etter et tungt treff er nå 49 av 216 punkter (194 før), en enkelt dråpe renner 42 punkter (178 før), og sporene smalner og slingrer. Alle sjekkene unntatt de uten konsollfeil og 3D-sjekken feiler på bygget fra før (1ff4a4f). Del 17, 18, 34, 36 og 47 er grønne.
- Skjermbilder til Tom: 47_blod_for.png og 47_blod_etter.png (tungt treff og 3 sekunder spilltid i liggehallen i Parken, samme frø og utsnitt), og 47_blod_etter_390x844.png.

## 2026-09-27 04:38 Spor C, punkt C4: skeptikeren
- Bildet 59_handbok.png viste tittelmenyen, ikke håndboka. I testdel 59 ble håndboka åpnet 2 sekunder etter at siden var lastet, men når maskinen er treg kommer tittelen etter det, og den lukker panelet. Sjekken av sidene rakk å gå gjennom først, så bare bildet ble feil. Testen venter nå på tittelen før håndboka åpnes.
- Kampbildene i 59_laug.png viste ingen varsler: skriptet satte `G.paused`, som ikke finnes, så spillet gikk videre til sølvringen og bukket var ferdige før bildet ble tatt. Nye bilder er tatt med spillet stoppet midt i varslene, i 2D og 3D: sølvringen rundt pasienten, reima som bukker, og krokene på vei inn.
- Testdel 59 feilet én gang på stansen: en stans fra kampene på etasje 6 lå under to sekunder bak, så den første av de tre ble (riktig) holdt tilbake. Testen nullstiller nå `G.laugStunT` før sjekken.
- Klokkerens rop på en lærling har `o.stille`, så ringen der lærlingen kommer ikke får nedslagseffekten fra spor A når sporene flettes. Det er ikke et slag.
- Resten holdt: begge legger an og skader på etasje 3, 4 og 6, bjella treffer i ringen og ikke to ruter utenfor, én klokker per rom, høyst ti kjettinger, Enkel grafikk uten kjettinger men med treff, og håndbokssiden får plass på PC, stående telefon og liggende telefon (der ruller panelet, som før). Del 11, 23, 36, 58 og 59 er grønne (54 av 54).
- Åpent: på stående telefon står Klokkeren (holder 6,5 ruter unna) i kanten av bildet eller utenfor. Ringen og bjella synes og høres. Mens stoppeklokka bremser fiendene, kommer krokene etter at ringen har gått av, fordi ringen går på spilltid og Klokkeren på den bremsede tiden (som hos de andre fiendene).

## 2026-09-27 04:51 Spor A, A3 sjekket av skeptikeren
- Gikk gjennom 46_blekk.js mot planen: formene i shaderen (sirkel, boks fra 0 til len, kjegle med skiven på 0,6) er de samme som inShape, også for kjegler bredere enn en halv sirkel og for r under 0,6. Plassene frigjøres ved fyr, avbryt, rydd og etasjebytte, bare de endrede delene sendes til skjermkortet, og ingenting lages per varsel. Enkel grafikk, shader som ikke lenker, full pott og enkel grafikk slått på midt i et angrep går til den gamle tegningen. De fem folg-linjene er riktige, og updateTele flytter o før tegningen.
- Egne bilder i 2D, 3D, lav, enkel grafikk og uten lys, pluss ekte kamp (oppasser, narkose, pleier, kultist) på PC, liggende telefon (844 x 390, berøring) og stående telefon i 3D: varslene leses godt, typefargene skilles, vinklene viser retningen, og ingen konsollfeil. Den grå oppløsningen og etterbildet ser ut som planen sier.
- I 2D med lys blir varsler nær pasienten og lamper bleke (narkoseringen nesten hvit), og låsen de siste 0,12 s blir en hvit flate. Det kommer av at 2D-lyset ganger hele bildet (også før A3). Prøvde svakere lysplater: nesten ingen forskjell, så endringen ble ikke tatt med.
- Del 4, 5, 19, 20, 27, 28, 36, 44 og 46: 76 av 76.

## 2026-09-27 04:55 Skeptikeren på A4 (blod som renner)
- Sjekket planpunktet, koden i 43_vaatt.js, testdel 47 og skjermbildene. Etterbildene er klart bedre: sporene slingrer, smalner og perler seg, og de rette strekene fra toppen er borte, også på stående telefon.
- Feil: testdel 47 feilet omtrent hver tredje gang. Den krevde at alle sporene etter ett tungt treff smalnet og slingret, men hvor mange spor som gjør det, avhenger av hva Blod.treff har trukket fra Math.random før (etasjen), og i en simulering med 400 frø feilet ett treff alene i 133 av dem. Per spor smalner 92 prosent og 94 prosent slingrer. Testen slår nå sammen tolv tunge treff med hvert sitt frø og krever at minst tre av fire spor smalner og slingrer, og at sporene i midten smalner til 0,8 eller mindre (målt 0,63 på PC og 0,57 på telefon). Den lengste stripen måles over alle tolv. Tallene er nå like fra kjøring til kjøring.
- Målt og latt være: tegningen av sporene koster mer enn før (hver bit to strøk og perlene i tillegg). I spilløkka på stående telefon med firedobbelt strupet prosessor, regn og et tungt treff hvert 1,5 sekund: 1,96 ms per bilde i snitt og 5,8 ms i 95-persentilen, mot 1,31 og 4,5 før, og ingen topper. Opptegningen i R.render ble ikke tregere.
- Del 17, 18, 34, 36 og 47 kjørt; del 34 og 47 grønne to ganger etter rettingen.

## 2026-09-27 06:23 Andre vindu: åtte punkter ferdige og sjekket, resten startet
- Mellom 01:22 og omtrent 05:30 UTC ble åtte punkter ferdige og sjekket av hver sin skeptiker, før bruksgrensen stoppet sporene igjen:
  1. Spor A: A1 (varsler og hugg frigjør geometrien) og A3 (Blekkvarsel, alle angrepsvarsler i én blekkshader).
  2. Spor D: A2 (tekstene og stemplene legger seg ikke oppå hverandre) og A4 (blodet på glasset renner som blod).
  3. Spor B: B1 (vegger og bakke fra ChatGPT, med tegnelistene 11 og 12) og B2 (det skjulte rommet er ikke der før man bryter seg inn).
  4. Spor C: C3 (grunnarbeidet for nye fiender) og C4 (Skinnlauget av 1887: Lærlingen og Klokkeren).
- Påbegynt og delvis committet: A5, C1, B3 og C5. Agentene som kommer nå, gjør dem ferdige.
- Resten startet 06:22 UTC: A5 og A6, C1 og C2, B3, B4 og B6, C5, C6, C7 og C8.
- B5 (gulv i full oppløsning med egne fliser) er tatt ut av denne runden. Det er en stor endring i hvordan gulvet tegnes, og den trengs først når Tom skal bestille gulv (liste 12). Veggprøven i liste 11 kommer først uansett.

## 2026-09-27 06:31 Spor A, A5 Blekkpartikler: flater i blekk og papir i stedet for klosser
- Toms punkt 1: partiklene var små klosser på 0,12, og alle var svarte. Fargelista til InstancedMesh ble laget av setColorAt mens count var 0, så den fikk lengde 0 og hver partikkel ble tegnet uten farge. Det gjaldt alle 44 stedene som lager partikler.
- Nå er hver partikkel en flate som vender mot kameraet (fast vinkel, CAM_PITCH), med en av fire tegninger fra ett lite ark på 128 x 128 som lages én gang og blir liggende: gnist (spiss strek med lys kjerne, strekkes ut langs farten), blekkdråpe med omriss og høylys (peker dit den flyr), papirbit med revet kant og journallinjer (vender seg i lufta) og støvdott (vokser og blekner). Arket har fyll, blekk og høylys i hver sin kanal, så partikkelens farge legges på fyllet og omrisset blir mørkt blekk.
- Formen velges med o.form ('gnist', 'drape', 'papir', 'stov') eller gjettes fra fargen: o.flat gir papir, grått og brunt gir støv, blod, vann og mørke farger gir dråper, hvitt, gult og oransje gir gnister. Ingen av stedene som lager partikler er endret.
- Fortsatt én InstancedMesh med 900 plasser, samme spawn og samme bytte ved fjerning, og ett tegnekall. Matrisene skrives rett inn i lista, og bare de levende plassene sendes til skjermkortet. Fargelista lages for alle plassene.
- Enkel grafikk (R.safe), og en shader som ikke lenker, gir de gamle klossene (nå med farge). Slås enkel grafikk av eller på, bygges meshen om på neste bilde, og den gamle frigjøres. Arket frigjøres aldri.
- Test 48 (Blekkpartikler): flate med formattributt og egen shader, 900 partikler i ett tegnekall, fargen kommer fram, formen gjettes riktig, gnisten strekkes langs farten og vender mot kameraet, 900 partikler lever ut og blir borte, enkel grafikk fram og tilbake uten at geometri eller tekstur blir liggende, røde piksler på skjermen, og en runde i 3D. På bygget før A5 (med Particles eksportert) er det klosser og en tom fargeliste, så første sjekk feiler og testen stopper.
- Bilder: r5_bilder/48_partikler_for.png og 48_partikler_etter.png (fem drap i et rolig rom, 2D, samme frø og øyeblikk) og 48_partikler_etter_3d.png. Før er det svarte klosser, etter er det røde dråper, gule gnister, papirbiter og støv.
- Del 17, 18, 28, 29, 36 og 48 er grønne.

## 2026-09-27 06:47 Spor C, punkt C5: Havet under huset, Avløpsarmen og Kapellanen
- Tom ba om «CTHULHU OG TENTAKKEL MONSTRE». Nå bor det noe i havet under huset, og det rekker opp gjennom de samme rørene som Morbidium stiger i. Alt ligger i 49_havet.js, tegnet i kode i blekk og papir. Ingen andre spors filer er rørt i dette punktet.
- Tentakkelen er en delt hjelper som Kraken (C8) skal bruke: `tentakelLinje` gir punktene fra roten og ut, med en bølge som går fra roten mot tuppen og en krok ytterst, og `tentakel` tegner den i strekbåndene som fire strøk som smalner av, med lys buk, glans og bleke sugekopper. Armen glir mot formen oppførselen ber om, og høyden fjærer, så den skyter opp, vipper over og aldri står helt stille. Den bruker rundt 1860 og 1550 av de 3200 punktene i de to båndene.
- Avløpsarmen (etasje 3 to ganger, 4 én, 6 to): finner risten nærmest i rommet, ellers en rute under en høy vegg (med sprekk), ellers slår den hull i gulvet (et lite tjern som er borte når den dør, og den lager ikke hull i et tjern som finnes fra før). Den ligger under vann og bobler og gurgler, kommer opp når pasienten er innen 5,5 ruter eller etter tre sekunder, og er oppe i 4,5 sekunder: feier nær, slår langt (to våte pytter som leder strøm) eller griper og drar deg til risten («GREPET»). Så dykker den, aldri midt i et angrep, og kommer opp igjen ved risten nærmest pasienten etter 0,8 sekunder. Under vann er den aldri mer enn rundt 1,4 sekunder når pasienten står nær, og det er aldri mer enn tre armer (flere blir yngel). Tuppen har ett gult øye uten lokk, med pupill som en geit.
- Kapellanen (etasje 4 og 6): knehøy hjelpeprest med blekksprutkuppel, triste gule øyne, tentakkelskjegg over en hvit prestekrage, kollektbøsse og en liten avgud i kleberstein. Han preker i 1,8 sekunder (salme nummer null), og de som hører det innen seks ruter, går 1,2 ganger så fort og får nedkjølingen halvannen gang så raskt i seks sekunder. Farten lagres og settes tilbake nøyaktig, og en ny velsignelse ganger ikke to ganger. Slår du ham for 15 prosent av helsa midt i preken, blir det «Amen?!» og ingenting. Han døper deg med sjøvann i en bue («DØPT», pluss Morbidium) og kaller armer opp av ristene. Når han dør, sier han «Amen.», avguden sprekker, og kultistene står og ser etter ham (da tar de dobbel skade).
- Lyder fra banken med synth i reserve: `sluk` og `rive` (ubrukte fra før), og `salme` (orgel og hvisk). Replikker, dødsårsaker, mestertitler, fiendeindeksen og en PA-melding på etasje 3 og 6. Rombiasene i 03_generator.js venter på flettingen.
- Testdel 60 (Havet under huset) sjekker begge på etasje 3, 4 og 6, at armen under vann ikke kan treffes, siktes på eller kaste lykteskygge, at den aldri er under lenger enn 2,6 sekunder når pasienten er nær, at grepet drar, taket på tre armer, vegg og gulv uten rist, preken, avbrutt preken, kallet, døden, Enkel grafikk, håndboka og én runde i 3D. Den feiler på bygget fra før (Havet finnes ikke der). Del 23, 36, 58, 59 og 60 er grønne.
- Bilder til Tom: r5_bilder/60_havet.png (armen opp av risten mens Kapellanen preker, 2D over og 3D under) og 60_handbok.png (PC, stående og liggende telefon).

## 2026-09-27 06:58 Papiljottene sitter på hodet, og kontrollene i grafikkleveransen (C1)
- Det Tom så i 8.png: papiljottene svevde som en glorie over hodet på dødskortet. Tallene i PAS_PYNT var stilt inn for det tegnede reservehodet (issen på .88), men spillet bruker hodene fra ChatGPT, der den tette issen når .78 over festepunktet. Papiljottene fra ChatGPT er i tillegg bredere og høyere enn tegningen, så bare 0 til 2 prosent av dem lå over hodet.
- PAS_PYNT har fått et valgfritt felt skala (papiljotter .75, hårnett .9, hjelm .92) og nye tall for papiljotter, hårnett, hjelm, sløyfe og nattlue. Hornene og svulsten i LOOKS er senket. Nå ligger minst 20 prosent av all pynt over hodet (papiljottene 56 prosent), for begge kjønn forfra, fra siden og bakfra.
- hodeTopp måler issen én gang per hodetegning, og pynten som ikke sitter i ansiktet flyttes like mye som hodet er høyere eller lavere enn .78. Hodene fra ChatGPT gir .78, så ingenting endres der, men det tegnede reservehodet (.94) får pynten opp på seg i stedet for inni håret.
- Pynten og tilleggene dreies med hodet (placeAddons og placeLook). Før gled en hatt 0,2 til 0,26 enheter av hodet når en fiende eller sjef vippet hodet.
- HUD-portrettet krymper bare hodet når pynten stikker over kanten (nattlua, hjelmen), så ansiktet får plassen med papiljotter.
- Kontrollene i GRAFIKKLEVERANSE.md: kroppen til den hvite hjorten fra ChatGPT lå med buken på bakken under et hode som svevde (bunnen på festepunktet, ay .1). Den løftes .8 når bildet brukes, så buken ligger over beina og halsen møter hodet, i 2D og 3D. Rettet i 37_utefiender.js i stedet for manifestet, så sporet for veggene slipper å lage manifestet på nytt.
- Frisyrene fra ChatGPT på personalet (Oppskrift.kleDeler) er parykker med hull til ansiktet, men lå med bunnen på 60 prosent av hodet og svevde som en klump over hodets eget hår (1 til 7 prosent over hodet). Nå legges toppen av håret litt over issen, så det dekker hodet (minst 20 prosent, de fleste over 50). Munnbindet dekket øynene og gassmasken pannen; ansiktstilbehøret legges nå etter øynene (TILBEHOR_FESTE). Hattene og brillene satt fra før.
- Sett over og i orden: trillepasientens hjul og stativ, speilpasientens ramme, hjertene og rammene i HUD i vanlig spillstørrelse, og løs pynt, hatter, hår og ansiktstilbehør i alle tre retninger. Ikke rettet: eyeliner fra siden stikker litt foran ansiktet, fordi tegningen har to øyne.
- Ny testdel 56 (Hår og pynt på hodet). Alle sjekkene unntatt den uten konsollfeil feiler på bygget fra før (1ff4a4f). Del 8, 9, 10, 11, 27, 36 og 56 er grønne.
- Skjermbilder til Tom: 56_papiljotter_for.png og 56_papiljotter_etter.png (dødskortet), 56_kontakt.png og 56_kontakt_for.png (all pynt på begge kjønn i f, s og b), 56_kontakt_oppskrift_for.png og 56_kontakt_oppskrift_etter.png (hatter, frisyrer og tilbehør på personalet), 56_hjort_for.png og 56_hjort_etter.png (2D og 3D, samme frø og plass), og 56_fiender_kontroll.png.

## 2026-09-27 07:05 Spor A, A5 sjekket av skeptikeren
- Gikk gjennom Particles mot planen: samme InstancedMesh, spawn, 900 plasser og bytte ved fjerning. Flaten vender mot kameraet (normalen er (0, sin, cos) av CAM_PITCH, som kameraet i updateCamera), vinkelen på skjermen regnes riktig fra farten, cellene i arket stemmer med flipY, formen og p.f følger med ved byttet, og fargelista har plass til alle 900. three er r128, så updateRange finnes og ShaderMaterial får instanceColor. Ingen tåke i scenen, så shaderen mangler ikke noe der. Enkel grafikk bygger om meshen og frigjør den gamle, arket lages én gang, og ingen andre filer bruker Particles.mesh. Alle 44 stedene bruker faste farger og size under 1,2.
- Egne bilder på stående telefon i 3D (390 x 844, berøring), liggende telefon i 2D (844 x 390), enkel grafikk i 2D og lav i 3D: dråpene, gnistene og papiret leses også på telefon, enkel grafikk gir fargede klosser, og ingen konsollfeil. Før og etter er klart forskjellige: svarte klosser mot røde blekkdråper med omriss, gule gnister og papirbiter.
- Tok bildene 48_partikler_for.png, 48_partikler_etter.png og 48_partikler_etter_3d.png på nytt uten snakkebobla, som dekket midten av etter-bildet (v48_bilder_tom.py).
- Planen sier at enkel grafikk satt før init gir klosser, men test 48 sjekket bare bytte etterpå. Ny sjekk i test 48: meshen rives, R.safe settes, init gir klosser, og blekket kommer når den slås av.
- Del 17, 18, 28, 29, 36 og 48 er grønne (del 18 trenger siden fra del 17).

## 2026-09-27 07:18 Skeptikeren på C1 (papiljottene og kontrollene i grafikkleveransen)
- Gått gjennom: PAS_PYNT med skala, hodeTopp, deler(), placeAddons og placeLook (dreiingen), HUD-portrettet, LOOKS, frisyrene og ansiktstilbehøret på personalet (Oppskrift.kleDeler), og løftet av hjortens kropp. Sett på dødskortet, kontaktarkene (pynt på begge kjønn i f, s og b, hatter, hår og tilbehør på personalet), reservehodet uten bilder, hjorten i 2D og 3D, trillepasienten og speilpasienten, og spilldukken med papiljotter i 3D på PC, stående og liggende telefon (ingen konsollfeil). Papiljottene sitter i håret i alle rendererne, og hjorten står på beina.
- Ingen feil funnet som måtte rettes. Testdel 56 feiler på den gamle koden (dreiingen, hjorten, dekningen), så den er ikke tom.
- Ikke rettet (fra før): eyeliner fra siden stikker foran ansiktet, fordi tegningen har to øyne. 28_oppskrift.js står ikke i noe spors liste, men er endret her (frisyrene og TILBEHOR_FESTE), så det må med i flettingen.
- Del 9, 10, 11, 27, 36 og 56 grønne.

## 2026-09-27 07:25 Spor C, punkt C5: skeptikeren
- Velsignelsen tålte ikke treghet. Frost (hvert slag med frost-kuriositeten) og surkål lagrer farten i `baseSp` og setter den tilbake når tregheten går ut (25_items.js). Kom tregheten mens fienden var velsignet, ble 1,2 ganger farten stående for godt; kom velsignelsen mens fienden var treg, ble den treg for godt. Nå får `baseSp` den samme faktoren, og når velsignelsen går ut, settes farten nøyaktig tilbake når ingen annen har rørt den, ellers tas faktoren ut av det som står.
- Armen kunne havne i et annet rom enn kampen: uten ledig rist i rommet tok den en rist inntil fem ruter unna uansett rom, Kapellanen kalte opp armer ved en rist innen åtte ruter uansett rom, og etter et dykk kunne armen flytte til en rist i naborommet. Dørene er stengt under kampen, og rommet ryddes først når alle fiender er døde, så en arm bak veggen kunne låse spillet. Sjelden (4 av rundt 2500 prøvde steder i 36 etasjer), men nå holder armen seg alltid i sitt eget rom, og Kapellanen kaller bare ved rister i sitt.
- Et slag som både tar 15 prosent av helsa og slår Kapellanen ut av preken, ga en stille avbrytelse. Nå sjekkes helsa først, så det blir «Amen?!».
- Prestekragen synes: den var smalere enn tentakkelskjegget og ble helt skjult i spillet. Nå er den bredere, med bølgete, plissert kant, og stikker fram på begge sider av skjegget.
- Testdel 60 sjekker nå treghet og velsignelse om hverandre (begge veier) og at armen ikke tar en rist i et annet rom. Begge ville feilet på koden fra før (gått gjennom for hånd, ikke kjørt).
- De svarte klattene rundt armen på bildene er partiklene (kuber som blekkstreken gjør svarte). De er fra før og ryddes av spor A (A6).
- Resten holdt: armen kan ikke treffes, siktes på eller kaste skygge under vann, er aldri mer enn rundt 1,4 sekunder under når pasienten står nær, høyst tre armer, grepet drar, preken og kallet virker, Enkel grafikk uten feil. Nye bilder: r5_bilder/60_havet.png og 60_handbok.png.

## 2026-09-27 08:12 Spor A, A6 Nedslag: angrepene lander med tyngde
- Toms punkt 1: når et angrep gikk av, forsvant varselet og det skjedde nesten ingenting. Nå lander hvert angrep med Nedslag i 46_blekk.js. R.kastTele med 'fyr' legger varselet i en kø (ikke med o.stille), og køen tas i updateTele rett etter at fire har gått, så vi vet om fienden stormer.
- Partikler langs omrisset av formen (sirkel, bane og kjegle, pluss noen inne i formen på store angrep) med blekkpartiklene fra A5, etter skadetypen: støv og gulvflis (fysisk), gule gnister og to eller tre korte lyn på kanten (strøm), blå sky (gass), dråper og sky (vann og gift), fiolette gløder som stiger (morb), gløder og røyk (ild), papirbiter (papir), blad og støv (natur) og metallgnister (lenke). Antallet er 8 pluss 2,4 per kvadratenhet, høyst 60, ganger Glod.kvote(), som er 0 med enkel grafikk og lav tekstur.
- Store angrep (r 2,2 eller mer, en sjef eller en minisjef, ikke smale baner som krokene) setter et merke i gulvet: sprekk (fysisk, papir, natur, lenke), svimerke (ild, strøm, lys) eller blekksøl i typefargen (morb, gass, vann, gift). Merkene er 12 plasser i én InstancedMesh med et eget ark på 256 x 256 som lages én gang, stemples inn og blekner over 5 s, og den som har bleknet helt brukes først, ellers den eldste. De gir også en sjokkbølge på 0,35 til 0,6 (følger Forvrengning) og rister skjermen etter avstanden fra kanten av angrepet til pasienten (ingenting over 14 skritt, og ristingen legges ikke oppå den angrepet selv gir).
- Et løp (pleieren, tvangstrøya, trillepasienten og de andre som stormer) gir støv som sparkes bakover og skrensemerker der fienden tok sats. En prosjektilbane gir bare et lite blaff der skuddet går ut.
- Tunge treff på pasienten (over 15 % av livet) fryser bildet 0,05 s og viser treffstjerna, gjennom en innpakning av hurtPlayer.
- Fra A7 (tatt med fordi den var liten): prosjektilene har en liten skygge på gulvet, én InstancedMesh med 64 plasser og delt geometri, som krymper med høyden, så kast i bue viser hvor de lander.
- Lynet i regnværet har sitt eget nedslag, så varselet får o.stille (Uvaer.varsel pakkes inn). Ingen andre filer er endret.
- Ingenting lages per nedslag: arket, meshen for merkene og skyggene lages første gang og blir liggende. Lyn på kanten bruker Lyn.slag, som frigjør seg selv. Med enkel grafikk kommer ingen partikler, lyn, merker, sjokkbølger eller skygger, men ristingen og frysen er med.
- Test 49 (Nedslag): nedslag når et varsel går av og ikke når det avbrytes eller har o.stille, lyn for strøm, blaff for baner og skrensemerker for løp, 40 store angrep med høyst 12 merker i ett tegnekall og gjenbruk, partiklene borte innen 5 s, geometrien vokser ikke, enkel grafikk, tunge og lette treff, lynet i regnværet, skyggen under et prosjektil i bue, piksler midt i et merke og utenfor, og en runde i 3D. På bygget før A6 stopper den på at Nedslag ikke finnes.
- Bilder: r5_bilder/49_nedslag_stor, _lop og _gnist, i 2D og 3D, og _for_ fra bygget før A6 (samme frø, sted og øyeblikk).
- Del 28, 29, 36, 46, 48 og 49 er grønne. Del 46 fant fargen på skyggematerialet i lista over farger i koden, så den skrives som new THREE.Color.

## 2026-09-27 08:25 Snøfall som ligner snø (C2)
- Det Tom så i 6.png: snøen som faller, var 220 harde firkanter på to til tre punkter i en fast boks som ikke fulgte kameraet. På stående telefon kom det aldri snø i den nederste femtedelen av skjermen, alle fnuggene slengte i takt, og det var ingen vind eller dybde.
- Ny fil 47_sno.js (Sno): snøen faller i tre lag på skjermkortet. Fjerne, små fnugg nær bakken under bakketåka, vanlige fnugg midt i lufta (dette er Vaer.obj, så del 37 holder), og noen få store nær glasset som tegnes rett på skjermen, flytter seg 1,4 ganger så fort som bakken og viker unna pasienten. Alt regnes ut i vertex-shaderen fra tiden, som går med spilltiden, så pausen og treffstansen fryser snøen. Prosessoren gjør ingenting per fnugg.
- Boksen følger kameraet hvert bilde (bredde, høyde, zoom og vinkelen) og brettes med mod(), så stående og liggende telefon og kameraavstand 1,25 blir dekket helt ut. Fnuggene ligger fast i verden og kommer tilbake et nytt sted for hver runde.
- Utseendet er et atlas på 128 punkter tegnet i kode: en myk klump, en klump med cel-skygge og svak blekkant, en krystall med seks armer i blekk (bare de nære) og en uskarp skive. Aldri helt hvitt. En maske over uterommene holder snøen ute av paviljongene. I 3D får fnuggene lyset fra lampene, så de er varme under gasslyktene og blågrå i mørket.
- Vind fra etasjens frø, med kast hvert 8. til 20. sekund der fnuggene slenger mer og vindsuset øker. Mengden går opp og ned over et par minutter. Høy 700, 380 og 120 fnugg, middels (telefon og TV) 420, 220 og 60, lav 240 og 110 og ingen nære, 2D 300, 160 og 40 (200, 110 og 40 på berøringsskjerm). Tre tegnekall.
- Størrelsene er større enn i planen (fjern .07 til .1, midt .12 til .19, nær .3 til .46 enheter). Med planens tall ble fnuggene prikker på tre til fem punkter som knapt syntes mot den hvite bakken.
- Gasslyktene får snø som faller i lyset i stedet for møll (GLOD_TYPER.lyssno), og sirissene tier mens det snør.
- Enkel grafikk: ingen snø på skjermkortet. De gamle prikkene er runde (en myk prikk på 16 punkter i størrelse 4,5) og legges der de synes på skjermen, så 81 prosent av dem er i bildet (52 før). Lette teksturer har ingen snø, som før.
- Ikke gjort (valgfritt i planen): vinden i bakketåka, snø på hodene og tingene, fotspor, knirkende fottrinn og frost på glasset.
- Ny testdel 57 (Snøfall), i 2D med én runde i 3D på PC og stående telefon. Alle sjekkene unntatt de uten konsollfeil feiler på bygget fra før (1ff4a4f). Del 24, 36, 37, 39 og 57 er grønne. Del 28 feiler på at Morbidium-gløden ikke er borte etter pytten, også alene. Den feilet likt før denne endringen (kun_gammel_28.log), så det kommer ikke herfra.
- Skjermbilder til Tom: 57_sno_for_1280.png og 57_sno_etter_1280.png (en snøetasje i Parken ved gasslyktene, 3D, samme frø og sted), 57_sno_for_390x844.png og 57_sno_etter_390x844.png, og 57_sno_etter_2d.png.

## 2026-09-27 08:57 Spor C, punkt C6: Draugpleieren og Holdningssøsteren
- Draugpleieren (49_havet.js, etasje 3, 5 og 6 to ganger) er en pleier fra nattevakta i 1887 som gikk ned i kjelleren og kom opp våtere: et flatt, blekt fiskefroskehode med øyne som ser hver sin vei, nåletenner, gjeller og tang under ei krøllete pleierlue, i våt uniform med navnelapp og rur på skulderen. Den biter på kloss hold, skvetter med bekkenet på mellomhold (VÅT: du går tregere i 1,2 sekunder, og det blir en pytt der du står) og hopper som en frosk når du holder avstand. Hoppet har en ny positur (`POSER.froskehopp`): den krøker seg sammen, letter og faller ned i ringen, og kroppen flyttes i steg med `moveEnt` de siste 0,45 sekundene, så den stopper ved en vegg i stedet for å lande i den. Nedslaget legger et tjern som leder strøm.
- I vann (pytt, tjern, suppe eller myr) blir draugen friskere, to i sekundet og høyst halve helsa per liv, med grønne tall. Ikke når det går strøm i vannet, og strømmen biter på den som før. Den sklir ikke i sitt eget element.
- Holdningssøsteren (50_skinnlauget.js, etasje 4 og 6) er laugets eldre, rake søster med stram knute, lorgnett i kjede og stivet lue med sølvkroken, en høy nakkekrage i lær med tre spenner og en snøret ryggskinne over den svarte kjolen. Hun slår med en gul tommestokk på kloss hold, og snører deg på avstand: en brun ring, to lærreimer fra hendene hennes (Kjeder.slag med lær og en messingspenne i stedet for kjetting og krok, ingen i Enkel grafikk) og SNØRT i 2,5 sekunder. En rulle løser det med en gang (LØS). Mens du er snørt, slår laugets folk innen åtte ruter 25 prosent hardere i fire sekunder, og skaden settes nøyaktig tilbake. Hun snører aldri en pasient som er slått ut.
- Tregheten bruker `P.mokkT` (som myr), slik planen sa, men med egne klokker (`P.snortT` og `P.vaatT`) i en innpakning av `updatePlayer`. Pyttene setter `P.mokkT` rett (et tjern gir 0,35 sekunder), så uten klokkene kortet et tjern ned både snøret og bekkenet. 20_actors.js er ikke rørt.
- Klokkerens tekst i håndboka er kortet ned: med fire kort på siden fikk den ikke plass lenger.
- Testdel 61 (Draugen og Holdningssøsteren) sjekker at begge legger an og skader der de hører hjemme, legingen (tørt, vått, strøm og taket), hoppet (ring, løft, stille i sammenkrøkingen, landing på fritt gulv, tjern, mot en vegg), bekkenet, snøringen (varer, rullen løser, lauget slår hardere og nøyaktig tilbake, aldri på en som er slått ut), tommestokken, Enkel grafikk, fiendeindeksen, håndbokssiden og én runde i 3D. Den feiler på bygget fra før (typene finnes ikke). Del 36, 59 og 60 er grønne.
- Bilder til Tom: r5_bilder/61_draug_soster.png (draugen i lufta og søsteren som snører, i 3D, og tegningene i tre retninger under) og 61_handbok.png.

## 2026-09-27 09:10 Vinter i teksturene (B3)
- Toms punkt 2, bakkehalvdelen, og skjermbilde 6: snøen var fire bleke ellipser per rute, kuttet langs rutenettet og som bobleplast i 3D. Nå males den som ett lag over hele uteområdet i Paint.snoDekke (12_paint.js), og snoPaa er borte.
- Dekket kommer fra rolig støy med eget frø (generatoren og tilfeldighetene i gulvet røres ikke), og 16 prosent blir bart. Klattene tegnes som Art.cel over hele flaten: blågrå skygge nede til høyre, snøen i #e4ebf3 (aldri helt hvit) og blekk bare under. Sørpe med to hjulspor midt i grusgangene og stiene, smeltet rundt bål, vedovner og kjeler, fonner mot veggene i nord og vest og mot hekkene, isen blank med snø i kanten, vindriller og glitter. Lette teksturer får én klatt per rute og ikke glitter.
- Veggene mot snøen får hvit topp (#dfe6ef, litt ulik fra rute til rute) og en egen tekstur med et klumpete snøbånd langs toppen, blå underside og blekk under, klumper på hekken og istapper under paviljongen, tømmeret og glasset. Én ekstra tekstur per veggstil som står i snøen.
- Bakken ute er snø (#cdd6e2) med fonner, søkk og noen mørke flekker jord, gjentatt hver tiende rute, og bildet fra ChatGPT (sommer) brukes ikke i snøvær. Trærne blir lysere. Lyset: blått lys opp fra snøen (#4a5470), månen .84, lys kald tåke, fargetonen trekkes mot blåhvitt, lavere relieff (.45) og et litt dempet gulv, så lykta ikke brenner snøen hvit.
- Byggetiden: det første forsøket kostet rundt 200 ms ekstra per etasje i testnettleseren. Hver klatt koster like mye å fylle, stor eller liten, så nå ligger klattene to per rute på skrå, ruter med dyp snø rundt seg blir rektangler (bare kanten har klatter), ruter i rad slås sammen, snøen klippes ikke til skyggen, og rillene og glitteret fylles i én sti hver. Nå er det rundt 35 ms, og etasjen bygges på 1,2 ganger tiden uten snø.
- Test 52 «Vinter» (13 sjekker, 2D, 3D, telefon, lette teksturer og Enkel grafikk) er grønn og feiler på bygget fra før (1ff4a4f). Sjekken for kutt langs rutene teller bare par der minst ett punkt er snø; bar bakke har sine egne fuger langs rutene. Del 24, 36 og 37 er grønne, og test_gen.js likeså.
- Skjermbilder til Tom i r5_bilder: 52_vinter_for og _etter i 1280 og 390x844 (samme etasje og sted, 3D) og 52_vinter_etter_2d.

## 2026-09-27 09:24 Skeptikeren på C2: snøfallet
- Kontrollert: de tre lagene, boksen som følger kameraet (testen regner det synlige rektangelet selv, så den er ikke tom), opprydding i Vaer.stopp (geometriene tilbake og masken kastet), enkel grafikk med runde prikker, lette teksturer uten snø, snø i lyktelyset i stedet for møll, tiden som følger spilltiden, tre tegnekall, og at Stemning.maal lager et nytt objekt hvert kall (så vindsuset ikke vokser seg større for hvert bilde).
- Rettet: de uskarpe nære fnuggene hadde en lys kant og så ut som såpebobler på skjermbildet. Nå er de en myk klump uten kant, som et fnugg ute av fokus.
- Rettet: toppen av fnuggene blektes med smoothstep med kantene baklengs, som er udefinert i GLSL og kan gi feil på noen mobiler. Skrevet om til 1 minus smoothstep.
- Rettet: med lette teksturer (R.lowTex) er det ikke noe snøfall, og da sang sirissene igjen på snøetasjene. Nå tier de når etasjen har snøvær, uansett grafikk.
- Skjermbildene 57_sno_etter_1280.png, 57_sno_etter_390x844.png og 57_sno_etter_2d.png er tatt på nytt.
- Del 24, 36, 37, 39 og 57 er grønne. Del 28 feiler på at Morbidium-gløden ikke er borte etter pytten, likt på bygget fra før, så det kommer ikke fra snøen.

## 2026-09-27 09:39 A6 sjekket: korskriket sprekker ikke hele rommet, ingen støv i veggen
- Gikk gjennom A6 mot planen, kontrakten og bildene, og tok egne bilder av korskriket (r 6,2) i 2D og 3D og av et stort angrep og strøm på telefon stående og liggende (r5_bilder/v6_ og v6b_).
- Korskriket til Hviskekoret (en minisjef, så hvert skrik er et stort angrep) la et merke på 13 skritt: sprekkene fra en tegning på 128 punkter ble tykke og uskarpe og gikk over hele rommet og ut i mørket, hvert tredje sekund. Merket blir nå høyst 6,5 skritt (Nedslag.maksMerke), omtrent som et stort sjefsangrep fra før.
- Partiklene langs omrisset havnet inne i veggene og ute i mørket når ringen gikk forbi rommet. Nedslag.sprut hopper nå over punkter der solid() er sant.
- Del 46 i 3D telte geometrien etter 24 varsler og fikk 2 i stedet for høyst 1, fordi nedslagene (merkene første gang og lynene på kanten) nå lager sitt. Varslene i den prøven får o.stille, siden nedslagene prøves i del 49.
- Ny sjekk i del 49: et stort angrep som når inn i veggen gir ingen partikler i veggen, og merket blir høyst 6,5 skritt.
- Del 48 feilet én gang på at 900 partikler ikke var borte (3 igjen), men gikk igjennom neste gang, og en prøve av en rolig etasje i 4 s viste ingen andre som lager partikler. Ser ut som travelhet på maskinen.
- Del 28, 29, 36, 46, 48 og 49 er grønne.

## 2026-09-27 09:44 Spor C, punkt C6: skeptikeren
- Snøringen synes nå så lenge den varer. Før holdt de to lærreimene pasienten i under et halvt sekund, og så gikk han treg i over to sekunder uten at noe på skjermen sa hvorfor (bare ordet SNØRT én gang). Nå sitter reimene i hendene hennes (de følger henne) og holdes stramme fra søsteren til pasienten så lenge han er snørt. En rulle river dem løs (LØS), og de går slakke og tilbake når snøret går ut, når pasienten dør, eller når hun blir slått ut, sovner eller dør. Ingen reimer i Enkel grafikk, som før.
- Testdel 61 feilet én av to ganger på koden fra før, uten feil i spillet. Ringen i froskehoppet ble målt mot der pasienten stod etter at nedslaget hadde slått ham 7 bakover. Nå måles den mot der han stod da hoppet begynte. Søsteren kunne også skli i pyttene som draugen hadde lagt igjen, og da falt varselet bort. Nå tas pyttene bort før snøringen prøves.
- Testdel 61 sjekker nå også at reimene fortsatt holder over et sekund etter treffet, og at de er borte et halvt sekund etter en rulle. Del 36, 59 og 60 er grønne, og del 61 er grønn (25 av 25) etter rettingen.
- Resten holdt: draugen blir friskere bare i vann og høyst med halve helsa, ikke når det går strøm i vannet. Hoppet går i steg med moveEnt og lander aldri i en vegg. Bekkenet gjør deg VÅT. Lauget slår 25 prosent hardere og får nøyaktig samme skade tilbake. Hun snører aldri en pasient som er slått ut. Ingen nye GPU-ressurser per etasje: tekstur til reim og spenne lages én gang.
- Nytt bilde til Tom: r5_bilder/61_snort.png (pasienten snørt 0,9 sekunder etter treffet, på PC og stående telefon).

## 2026-09-27 09:52 Skeptikeren på vinteren i teksturene (B3)
- Sjekket: snoDekke (støyen med eget frø, terskelen, sørpa, ilden, fonnene, isen, rillene og glitteret, lette teksturer), snoKant på vegger med og uten utklipp, snøtoppene, snøbakken, trærne, lyset, tåka og fargetonen, byggetiden, grafikkminnet og test 52. Skjermbildene i r5_bilder (52_vinter_*): snøen er ett lag med blå skygge og myk kant, ikke bobleplast, og den leses godt på telefon, i 2D og i 3D.
- Rettet: en vegg fikk snøbånd og istapper på fronten når den hadde snø på en hvilken som helst side, også når fronten vender inn i en paviljong. På Parken med liggehall i test 52 var det åtte slike fronter inne i paviljongene. Nå får fronten snø bare når ruta foran den ikke er et innerom; toppen blir fortsatt hvit.
- Test 52 sjekker nå at ingen snøfront vender inn i en paviljong (og at det finnes slike fronter å sjekke).
- Del 52, 24, 37 og 36 er grønne (52: 58 fronter inn i paviljonger, ingen med snø; byggetiden 216 mot 177 ms, grafikkminnet +0 og +0). Bygget har 544 innebygde bilder.

## 2026-09-27 10:14 Spor D og A flettet, og en skarpere sjekk i del 48
- Spor D (04b6332) og spor A (bde5be0) er flettet inn i grenen. Loggen er sortert etter tid, og de nye testdelene fra begge sporene ligger i nummerrekkefølge (44 til 49, 56 og 57). To små hjelpere i kladdemappa gjør dette likt hver gang: flett_logg.py og flett_test.py (tre-veis per testdel).
- Delene 17, 18, 36, 44 til 49, 56 og 57 på den flettede grenen: 123 OK og 1 feil. Feilen var i del 48, der Enkel grafikk slås av og på tre ganger og all geometri i spillet telles før og etter. Én geometri kom til. Del 48 alene og etter del 47 var grønn begge gangene, så noe annet i spillet laget en ting første gang i det samme vinduet.
- Sjekken ser nå direkte på at hver partikkelmesh som byttes ut, kastes (geometri og materiale, 6 av 6), og tåler én geometri fra noe annet. En lekkasje per bytte vil fortsatt bli fanget. Del 48 er grønn.

## 2026-09-27 10:20 Minisjefene gir ikke merke og sjokkbølge på hvert lille angrep
- Skeptikeren på A6 så at Hviskekoret (en minisjef) skriker med små sirkler (radius 1,5) omtrent hvert tredje sekund, og at hvert skrik ga merke i gulvet, sjokkbølge og risting, fordi nedslaget regnet alle angrep fra minisjefer som store.
- Nå teller bare angrep med radius 2,2 eller mer, og angrep fra sjefene, som store, slik planen sa. Minisjefenes store angrep får fortsatt hele nedslaget. Varselet selv (ringen med tegn og sprekkene) er som før.
- Del 49 er grønn.

## 2026-09-27 11:22 Tredje vindu: vinter, havet og Holdningssøsteren ferdige, resten startet
- Mellom 06:22 og omtrent 10:30 UTC ble disse ferdige og sjekket: A5 og A6 (blekkpartikler og nedslag), C1 og C2 (papiljottene med kontrollene fra grafikkleveransen, og snøfallet), B3 (vinter i teksturene), C5 og C6 (Avløpsarmen og Kapellanen, Draugpleieren og Holdningssøsteren). Spor A og D er flettet inn i grenen.
- Bruksgrensen stoppet spor B midt i B4 (hint og innbrudd) og spor C midt i C7 (Oldermann Nålepute). Begge er startet igjen 11:22 UTC med det som står igjen: B4 og B6 i spor B, C7 og C8 (Kraken) i spor C.

## 2026-09-27 11:24 memory.md og todo.md for spor A og D
- memory.md har fått «Kampbildet» (R.kastTele, Blekkvarsel, fargene etter skadetype, Nedslag, tekstene og stemplene) og «Snøfallet», og punkter under Pasienten (pynten etter ChatGPT-hodene, frisyrene til personalet, hjorten), Effekter (blekkpartiklene) og Blod og vann på skjermen (blodet som renner).
- todo.md har fått en egen del for Toms liste i runde 5, med det som er gjort i spor A og D, spørsmålene til Tom og det som er lagt til senere. Kontrollen av hjorten fra grafikkleveransen er krysset av.

## 2026-09-27 12:26 Spor C, punkt C7: Oldermann Nålepute
- Ny minisjef i 50_skinnlauget.js: oldermannen i Skinnlauget av 1887, en høy, verdig gammel herre i lang lærfrakk med vingekrage, skjerf med laugets medaljer, kinnskjegg, hvalrossbart og lorgnett. På den blanke issen sitter en rød fløyelsnålepute, spent fast med en lærreim under haka og full av knappenåler med glasshoder. Nålene sitter i puta, aldri i ham. Han slår med møteklubba. Tegnet i kode i tre retninger (MONSTER_ART), med klubba i WEAPON_ART og to nye positurer, `lese` og `klubbeslag`.
- Han leder kampen som et møte. Et bokslag, og boblen leser opp dagsorden: to saker og Eventuelt («Dagsorden: 1. Knappenåler 2. Kjettinger 3. Eventuelt»). Så gjør han sakene i nøyaktig den rekkefølgen, med et klubbeslag foran hver. Boblen blir stående, sakene som er gjort, strykes over, og den han holder på med, står i rødt. Dagsorden kommer aldri som tall eller ord over hodet.
- Sakene: Knappenåler (et rektangel 2,2 bredt og 8 langt, så tre salver med fem nåler i vifte). Kjettinger (en sølvring på 1,6 der pasienten står, krokene fra mørket, og et treff drar pasienten inn til ham, HEKTET). Klubba (en ring på 2,6 rundt ham, 1,2 ganger skaden og tilbakeslag 10, «Til orden!»). Votering («Votering! Alle som er for?», to lærlinger kommer og sier «Ja!», men aldri mer enn tre i live; er det fullt, faller forslaget og han bruker klubba). Eventuelt er en av de tre første, og boblen sier hvilken. Står pasienten feil for en sak (utenfor rekkevidde eller bak en vegg), venter han høyst 2,5 sekunder, og så gjør han den likevel.
- Ved halv helse, én gang: «Ekstraordinært årsmøte!» Han ringer selv, fire sølvringer rundt pasienten med kjettinger, og Klokkeren kommer hvis han ikke er her fra før. Etter det er dagsorden tre saker og Eventuelt.
- Han kommer aldri i parken. `Mini.onFloor` (31_sjefpulje.js, spor C sin fil) hopper over minisjefer med `fraDybde` over etasjen, og Oldermannen har `fraDybde: 2`.
- Dagsorden er varselet hans, så boblen holdes inne på skjermen når han står i kanten av bildet (stående telefon), og den synes selv om snakkeboblene er slått av i innstillingene. Det gjøres med en innpakning av `FX.update` fra 50_skinnlauget.js, bare for hans boble. Litt mindre skrift i boblen på telefon.
- Lyder fra banken med synth i reserve: bokslag, klubbe (stamp og treblokk) og naaler. Replikker, dødsårsaker, stemme, mestertittel, fiendeindeksen blant minisjefene og håndboka.
- Testdel 62 (Oldermann Nålepute) sjekker at han over tre dagsordener gjør sakene i den rekkefølgen han sa, at dagsorden står i boblen og aldri som tall, bokslag og klubbeslag, hver sak for seg (nålene, kjettingene som drar, klubba som slår bakover, voteringen og taket på lærlinger, Eventuelt), årsmøtet, at boblen holdes inne på skjermen og synes uten snakkebobler, Enkel grafikk (ingen kjettinger, men treff), aldri i parken, fiendeindeksen, håndbokssiden på PC og telefon og én runde i 3D. Den feiler på bygget fra før (Oldermannen finnes ikke der), og sjekken av boblen feiler på koden fra før denne rettingen. Del 19, 20, 36, 59 og 62 er grønne (62 av 62).
- Testen setter nå pasienten der han ser Oldermannen. Før kunne en søyle stå imellom, og da ventet saken på et bedre skudd mens testen hadde stoppet ham. Det var testen, ikke spillet.
- Bilder til Tom: r5_bilder/62_oldermann.png (dagsorden i boblen og nålene i lufta i 3D øverst, rektangelet i 2D under, og stående telefon til høyre med boblen skjøvet inn fra kanten) og 62_handbok.png.

## 2026-09-27 12:42 Hint og innbrudd i det skjulte rommet (B4)
- Murkassen på sprekken er borte. Den lukkede veggen får i stedet en flekk nyere puss formet som en døråpning, med en svak, ujevn kant, én hårfin sprekk fra gulvet og mot overliggeren og en liten vifte pusstøv på gulvet (48_skjult.js, `Skjult.lagDekal`). Nordveggen får flaten foran veggen, en lav sørvegg toppen og fronten, øst og vest bare toppen. Ute er det visne blader i hekken og kvist i krattet, uten firkantet kant: bladene tynnes ut mot sidene, så flekken ikke blir en brun rute i hekklinja (som i 10.png). Én tekstur på 256 x 512 per etasje i `Paint.owned`, og hårstreken vokser et steg for hvert slag.
- Trekken: innen fem ruter høres vinden dempet bak veggen (lavpass rundt 700 til 850, høyst 0,18, panorert mot sprekken, stille i kamp). Ute tikker en klokke inne i hekken i stedet. Det er egne sløyfer (`trekk_vind`, `trekk_tikk`) av de samme opptakene, så vinden i etasjen og været beholder sitt filter. Kalde drag langs gulvet (gløden `trekk` i GLOD_TYPER) blåser ut av veggen, fullt på to ruter og ingenting fra fem. Ingen drag med enkel grafikk. Støvkuben som ble sluppet hvert 0,6 sekund, er fjernet.
- Banking: et slag mot en vanlig vegg gir et dumpt, tett slag (`veggbank`, fot_stein dypt og dempet, høyst hvert 0,4 sekund), men ikke når slaget traff en fiende (også en som døde av slaget) eller en ting. Sprekken svarer hult med «Det knaker» og «Den er hul.» første gang.
- Ordene: høyst én boble per etasje, etter to sekunder innen to og en halv rute (før var det omtrent én hvert sjuende sekund). Første sprekk noensinne viser tipset «Noen vegger er murt igjen» med tastatur, håndkontroll og berøring.
- Monokkelen: flekken blir tydeligere med en tynn stripe lys i sprekken, og dragene synes fra åtte ruter.
- Innbruddet (`Skjult.aapne`): stopp i slaget og risting, mur- og bonklyd, og sprekkveggen fra ChatGPT et femtedels sekund som bristbilde (inne; ute blader og kvist). Så synker veggen under biter i veggens farge og et pust av innestengt luft, det lukkede byttes mot det åpne, lysene tennes over et sekund, møblene spretter opp, glasset kommer med et stjerneglimt og tennene triller ut mot pasienten. Etterpå ligger det rusk på terskelen, og pasienten sier «Visste jeg det.». Alt er ferdig etter 1,3 sekunder spilltid, også med enkel grafikk, og D3.onFloor kalles ikke.
- Ute blir bitene fra Particles svarte i Parken (også hvite biter, det gjelder partiklene generelt og ikke bare sprekken). Derfor er det bare blader (puff i løvfarge) når en hekk eller et kratt slås inn, også ved slagene før veggen faller. Testkrokene FX, slowMo og Particles eksporteres fra 48_skjult.js.
- lag_brief.py beskriver sprekkvegg som bristbildet. Ingen ny tegning trengs.
- Test 53 «Hint og innbrudd» (20 sjekker, 2D, 3D, enkel grafikk og hekken i Parken). Test 51 venter nå på at innbruddet er ferdig før den ser etter listene på sprekken, siden de synker med veggen. Del 53, 51, 6, 32 og 36 er grønne. På bygget fra før B4 feiler 53 allerede i oppsettet (det finnes ingen flekk å finne).
- Skjermbilder til Tom i r5_bilder: 53_hint.png og 53_brudd.png (før og etter, 2D og 3D, nordvegg inne og hekken i Parken), og enkeltbildene 53_hint_* og 53_brudd_*.

## 2026-09-27 12:59 Morbidium-sjekken i del 28 er gjort deterministisk (tips fra Codex)
- Codex, som Tom ba hjelpe til, pekte på at sjekken «Morbidium stiger fra lilla pytter og forsvinner med pytten» kunne bli rød uten at noe var galt: addPuddle slår en ny pytt sammen med en lilla pytt i nærheten og beholder den lengste levetiden (05_world.js), og ventingen hadde en grense i faktisk tid. Sjekken kjøres rett etter at etasje 6 er bygget, der en lilla pytt kan ligge nær start. Da levde testpytten mye lenger enn 3 sekunder.
- Nå får testpytten selv kort levetid (3 s) etter at den er laget, og sjekken venter til både pytten er ute av G.puddles og gløden ute av Glod.liste (høyst 8 s spilltid, 120 s faktisk tid). Feiler den, logges spilltid, levetid, tilstand og hvor den hang igjen.
- Sjekken fanger fortsatt en glød som blir stående etter pytten. Del 28 er grønn.
- Tom vil ha færre gjentatte kontroller. Etter spor B og C: målrettede kontroller for det som er endret, og ett samlet integrasjonsløp etter flettingen. Grønne resultater gjenbrukes der koden ikke er endret.

## 2026-09-27 13:10 Spor C, punkt C7: skeptikeren
- Dagsorden havnet bak panelet på liggende telefon (844x390): Oldermannen står nord for pasienten, og boblen ble klemt opp i toppen, der merket og minisjeflinja ligger over den. På PC dekket minisjeflinja saken i rødt når han sto høyt i bildet. Klemmen i 50_skinnlauget.js skyver nå boblen ned under merket, minisjeflinja, sjeflinja, knappene og kompasset når den ellers ville ligget bak dem.
- Boblen dekket nåleputa, som er selve kjennetegnet hans (halen på boblen lå oppå puta i 2D og 3D). `bubbleH` er 4,9 (var 4,3).
- Dagsorden forsvant mens han ventet: står pasienten feil for en sak, venter han opptil 2,5 sekunder, og boblen (3,6 sekunder) rakk å gå ut før saken kom. Nå blir den stående så lenge han venter.
- Testdel 62: sjekken av rekkefølgen leste bare referatet, som skrives av den samme koden den skulle sjekke. Nå logger testen hvilket angrep han faktisk kjører (nålene, kjettingene, klubba eller voteringen) og sammenligner med dagsorden. Den sjekker også at han venter høyst 2,5 sekunder med boblen synlig, og at boblen aldri ligger bak noe i toppen. Del 19, 20, 36, 59 og 62 er grønne (65 av 65), og de to nye boblesjekkene feiler på koden fra før.
- Står igjen (ikke C7): på stående telefon ligger minisjeflinja oppå panelet med hjertene, for alle minisjefene (00_head.html, spor D).
- Nye bilder til Tom: r5_bilder/62_oldermann.png (klubba med dagsorden under minisjeflinja i 3D, nålene i lufta i 2D, stående telefon, og nåleputa synes over boblen) og 62_oldermann_liggende.png (boblen under panelet).

## 2026-09-27 14:17 Skeptikeren på hint og innbrudd (B4)
- Sjekket: flekken (tekstur, flater, vekst per slag, monokkelen, Paint.owned og toon i 3D via lysLag, også ruskene som kommer etterpå), trekken (egen sløyfe, lavpass, panorering, stille i kamp), dragene (Glod, rotasjonen ut av veggen, ingen med enkel grafikk eller lette teksturer), bankingen, boblene og tipset, innbruddet (stopp, brist, synking, byttet, lysene, møblene, tennene og ruskene) og test 53. Skjermbildene i r5_bilder (53_hint, 53_brudd) og egne på telefon stående og liggende (hekken), med lette teksturer i 2D og i TV-modus (53v_*): ingen konsollfeil, rommet åpnes overalt. Flekken er nesten usynlig i 3D og svak i 2D; støvvifta, dragene og boblen er det spilleren ser. Det passer Toms ønske om at det ikke skal være opplagt.
- Rettet: et slag som bommet på sprekken, men hadde sprekkruta 1,1 foran seg, ga det massive bankeslaget, så den hule veggen kunne svare som en vanlig vegg. Bankingen hopper nå over sprekkruter, og også slag som traff personalet (de sier fra selv). Test 53 sjekker sprekken.
- Funnet, ikke rettet her: alle partikler fra Particles blir svarte (instanceColor lages med count 0 i Particles.init, three r128), inne og ute, 2D og 3D. Spor A har skrevet Particles om med en egen instanceColor, så det forsvinner ved flettingen. Da kan bitene ute ved innbruddet vurderes igjen.
- I TV-modus (1920 x 1080 i testnettleseren) tar innbruddet 84 sekunder sanntid for 2 sekunder spilltid, men blir ferdig.
- Del 53, 51, 6, 32 og 36 er grønne (66 sjekker). Bygget har 544 innebygde bilder.

## 2026-09-27 16:22 Manglende utegrafikk, graner og teksturer
- Tom ba Codex kontrollere manglende grafikk i hagen og på grantrær, lage bildene og pushe. Arbeidet er gjort fra gjeldende main 799f983 i egen arbeidskopi. Claudes separate gren og utilgjengelige B/C-arbeidskopier er ikke innlemmet.
- Fant at prop_gran manglet bilde og ikke var registrert. Den gamle manifestkontrollen overså dekor utenfor rommene. Lagde 14 bilder med den innebygde ChatGPT-bildegeneratoren: gran, ni bakkeflater og fire veggflater. Originaler i gpt-grafikk, prompter i utegrafikk-prompter.json og leveransebeskrivelse i UTEGRAFIKK.md.
- Teksturene bygges inn gjennom eksisterende bildeflyt uten beskjæring eller bakgrunnsfjerning. De brukes i gulv, vegger, snø og bakgrunnen utenfor rommene. Reservetegninger og eksisterende ressursfrigjøring beholdes. Manifest, kunstbrief og tegnelister er oppdatert til 558 av 558 bilder.
- Fant og rettet at dekorgrensen sorterte på verdien som valgte treslag, slik at granene i parken ble valgt bort først. Kontrollhagen med løpsfrø 3 hadde ingen graner. Utvalget er nå uavhengig av treslag, med samme grense på 90 objekter i parken og 140 i Nattskogen.
- Bildebehandling 558 bilder og 0 feil, bygg med 558 bilder, 124 deler og 165 lyder, JavaScript-syntaks og bildestørrelser/alfa kontrollert. test_utegrafikk bestod med 14 innlastede bilder, fungerende reserver og 12 scener i 3D/enkel grafikk, også etter rettingen av treutvalget. Ekte spillbilder er inspisert og fire lagret i dokumentasjon/utegrafikk sammen med rapport og logger.
- test_spill ble kjørt etter bildeintegrasjonen og fullførte kamp, tjeneste, sjef, drøm, etasjebytte og død uten nettleserfeil. Generatoren er uendret. Ingen ny ytelsesmåling på fysisk telefon/TV eller full omkjøring av test_ekstra.

## 2026-09-28 09:29 Spor B og C flettet, og Toms utegrafikk fra main tatt inn
- Spor B (B1 til B4) og spor C (C3 til C7) er flettet inn i grenen. B6 (tomrom og ganger) og C8 (Kraken) går fortsatt i hver sin arbeidskopi og flettes når de er ferdige. Ukegrensen stoppet dem i går kveld, og nå får agentene kjøre igjen.
- Main hadde fått Toms commit 72ce47e (utegrafikk: 14 bilder fra ChatGPT til gress, grus, jord, mose, myr, is, sti, brostein, snø, hekk, steinmur, skogkant, ruin og gran, med teksturstøtte i 12_paint.js og 17_romtyper.js og rettingen av granutvalget). Den overlappet med B1 (teksturløpet) og B3 (snøen). UTEGRAFIKK.md sier at bildene og teksturstøtten skal bevares, og slik er det flettet:
  1. Toms uteflater (UTE_FLATER, tekstur: true) beholder sine mål og sin behandling. wallTex fra B1 bruker Toms bredde (2 enheter, uten blekkstreker) for hans vegger, og teksturløpet fra B1 (flis, sømretting, WebP) gjelder bare flatene som ikke er levert.
  2. Snøen på gulvet: finnes Toms snøbilde, legges det over uterutene i Paint.snoDekke som Tom gjorde. B3s malte snø er reserven når bildet mangler. Snøbåndene og istappene på veggene, de hvite toppene og det kalde lyset fra B3 er beholdt.
  3. Bakken ute bruker Toms gress, mose og snø, med 256 punkter på telefon og TV. B1s egne bakkenøkler (bakke_park og bakke_skog) bestilte det samme og er tatt bort.
  4. Trærne: Toms retting av granutvalget og trærne ved det skjulte rommet fra B2 virker sammen.
  5. Manifestet er laget på nytt: 630 nøkler, alle de 558 fra main uendret, pluss 30 flater som ikke er levert og 42 tegninger av de nye fiendene. 558 bilder er behandlet og bygget inn.
  6. ART_BRIEF.md: runde 15 er Toms uteflater (levert), runde 16 veggene og gulvene inne, runde 17 havet under huset og Skinnlauget. Tegnelistene: 11 veggene (prøven er panel, fliser, mur, tapet og stein), 12 gulvene inne og 13 de nye fiendene.
- Rombias for de nye fiendene: Avløpsarmen i kjelleren, Kapellanen i likkapellet og Draugpleieren i tjernet. Samme trekk fra rng som før, og generatoren er deterministisk (node tools/test_gen.js).
- Toms test tools/test_utegrafikk.py fjernet bildet fra Art.img for å tegne reserven. Paint.bilde lager bildet på nytt fra SPRITES, så testen trodde veggbildene ikke ble brukt. Testen tar nå også bildet ut av SPRITES mens reserven tegnes.
- memory.md har fått «Det skjulte rommet», «Vinter i teksturene», «Teksturer fra ChatGPT» og «Nye fiender», og todo.md det som er gjort og spørsmålene til Tom for spor B og C.

## 2026-09-28 09:38 Del 50 følger flettingen med Toms uteflater
- Del 50 brukte manifestnøkkelen bakke_park, som er tatt bort fordi bakken ute nå bruker Toms gress- og mosebilder. Bildeløpet prøves med gulv_planker, lista heter 11_vegger.md og har 30 flater (ikke 44, fordi Tom har levert uteflatene), og bakken prøves med gulv_gress: Toms gressbilde tas ut mens den malte bakken prøves, og prøvebildet legges inn under samme nøkkel.
- Del 24 og 36 er grønne på den flettede grenen (23 OK). Del 50 til 53 kjøres nå.

## 2026-09-28 09:38 Tomrom som ikke ser ut som rom, og lysere ganger (B6)
- Tomrommet mellom rommene (de mørke blokkene i 9.webp) er ikke et skjult rom, men så ut som et mørkt rom fordi en lav vegg viste pussen og brystpanelet sitt ned mot tomrommet. Inne tegnes nå en veggfront som vender mot tomrom (ikke gulv og ingen vegg) som mur i toppfargen, litt mørkere (x0,8), i den vertexfargede toppmeshen (12_paint.js, `rute`). Da leser tomrommet som massiv mur, og det skjulte bak en sprekk ser ut som alt annet tomrom. Ute (hekker, trær, steinmur, glass) beholder frontene sine, for der fortsetter landskapet, og det samme gjelder snøveggene. Fronter mot gulv og mot en lavere vegg er som før.
- Antallet firkanter er det samme som før; en front flyttes bare fra veggmeshen til toppmeshen, så ingen nye teksturer eller materialer. I 3D blir den tegneserielyst som toppene og vender mot kameraet.
- En sprekk i sørveggen av et innerom har pussflekken sin (B4) på fronten, og den fronten er nå mur som resten av sørveggen. Den nøytrale vasken på flekken ligger da lyst på mørk mur, litt tydeligere enn før, men fortsatt svak.
- Gangene inne var bare opplyst av lykta og ble mørke hull i 3D. Nå får de små taklamper (`D3.ganglamper` i 15_rom3d.js): et svakt, varmt lys (temaets pool, 0,42, radius 2,8) omtrent hver femte rute, de åpneste gangrutene først, ikke i døråpningene, ikke i det skjulte, ikke ute og ikke i drømmene. Uten tilfeldighet, så de står likt hver gang. Lysplatene ligger i R.levelL og ryddes med etasjen, og de er ikke merket som romlys (fyll). I 2D var gangene lyse nok fra før, så der er ingenting endret. Gangfaktoren i gulvet er som før.
- Målt i skjermbildene (3D, 1280 x 720): gangen ved kafeteriaen gikk fra 60 til 69 i snittlysstyrke, og gangen i det andre bildet fra 55 til 65. Rommene er uendret.
- Test 55 «Tomrom og ganger» (9 sjekker, 2D og 3D): ingen puss mot tomrom inne, murfronter mot tomrommet og mot det skjulte bak en sprekk i sørveggen, hekkene ute uendret, taklampene på gangruter med avstand, punktlys under en lampe, ingen ute, og de samme stedene neste gang. Den feiler på koden fra før endringen. Del 24, 36, 38, 39 og 55 er grønne, og test_gen.js likeså. Del 51 bommet én gang på sanntidstaket (1,35 av 2 sekunder spilltid på 30 sekunder) mens maskinen var travel, og var grønn da den ble kjørt alene på nytt.
- Skjermbilder til Tom i r5_bilder: 55_tomrom_for og _etter (kafeteriaen med tomrom som i 9.webp) og 55_gang_for og _etter, samme etasje og sted, 3D.

## 2026-09-28 09:40 Spor C, punkt C8: Kraken
- Ny sjef i sjefpuljen (49_havet.js): Kraken som biskop Pontoppidan i Bergen beskrev i 1752, her noe som bor i badevannet til den som sover. Blekket dens er det Journalen er skrevet med. En høy, bulende kappe i dus rødfiolett med rur og tang, ett stort gult øye med vannrett geitepupill som ser etter pasienten og blunker, papegøyenebb når den angriper, og en stiplet blyantskisse av kirken biskopen bygde på ryggen dens i tankene sine. Seks armer tegnet med `tentakel()` fra C5, fire bak kappen og to foran, og den ene er stumpen etter armen hvalen utenfor Røst spiste, med bandasje. Den sitter i et tjern som varer (r 2,4, graves på nytt om taket på 46 pytter skyver det ut) og flytter seg ikke (`fart .001`).
- Angrepene: favn (fem eller seks armer stiger opp av vannet i en ring rundt pasienten og klemmer inn mot midten én etter én, så den som går ut mellom dem, slipper), blekk (en kjegle fra trakten og tre skyer der blekket landet, og mørke i 3D), dypdykk (den synker, boblene følger pasienten, en ring, og den kommer opp der pasienten sto og graver nytt hull; mens den er under, kommer to armer opp), malstrøm (en virvel som drar pasienten inn med rundt tre ruter i sekundet, og nebbet biter i midten etter 1,6 sekunder) og dypkall (armer opp av ristene, høyst fire). Dypdykk står i `egne`, så Journalen låner det aldri. Malstrømmen er en sone og trenger ikke eieren, så Journalen kan låne den, og den stilner når eieren er borte. Armene griper ikke mens malstrømmen går.
- Armene i favn er en liten samling tentakler som gjenbrukes og kastes ut av grafikkminnet ved ny etasje. Virvelen har én tekstur for hele spillet. Kraken får bredere strekbånd (6000 punkter) fordi seks armer med sugekopper ellers ble kuttet.
- Står der pasienten er inntil en vegg, kommer armen opp litt nærmere i stedet for inni muren. Replikker, tale og andre tale, siste ord, epitaf, dødsårsaker, fiendeindeksen og håndboka, øyet i sprekken («Den leter etter nesen sin med sju armer») og merknaden «Blekk på hendene».
- Testdel 63 (Kraken) sjekker puljen og tekstene, at Journalen aldri låner dykket, hullet, favn (treffer den som blir stående, ikke den som går ut mellom armene), blekket, malstrømmen (også lånt), at armene ikke griper i virvelen, dykket (ingen skade, skygge eller sikte under vann, opp innen 2,6 sekunder der pasienten sto), taket på fire armer, talen, døden, ryddingen, Enkel grafikk, håndboka på PC og telefon og én runde i 3D. Den feiler på bygget fra før (Kraken finnes ikke der). Del 4, 21, 36 og 63 er grønne (60 av 60).
- På liggende telefon (844x390) går håndboka under skjermkanten på alle sider, også i bygget fra før. Der sjekker testen bare at kortene får plass og har bilde.
- Bilde til Tom: r5_bilder/63_kraken.png (favn i 2D øverst og 3D under), og 63_kraken_malstrom_2d.png og _3d.png.

## 2026-09-28 09:51 Del 50 til 53 på den flettede grenen, og tre sjekker tilpasset
- Del 50 til 53: 61 OK og 4 feil, alle fra flettingen med Toms uteflater eller fra ventetid i faktisk tid, ikke fra spillet:
  1. Bakken ute gjentas nå hver fjerde rute (Toms gress-, mose- og snøbilder), ikke hver femte eller tiende som den malte bakken. Sjekkene i del 52 godtar begge.
  2. Del 50 forventet malt bakke på 256 punkter i etasje 1, men etasjen kan snø, og da males snøbakken i 512. Sjekken ser nå på været.
  3. Del 53 leste bare teksten i tipslappen til slutt. Tipsene vises etter en ventetid i faktisk tid, så karttipset fra starten av løpet kom etter sprekktipset og skrev over det. Sjekken noterer nå alle tips som vises mens den venter.
- Del 51 er grønn. Del 50, 52 og 53 kjøres på nytt.

## 2026-09-28 10:29 Skeptikeren på tomrom og ganger (B6)
- Sjekket: murfrontene mot tomrom (bare inne, ikke ute, på snøvegger, glass eller hekk; delingen i lukket og åpen rundt det skjulte, så fronten bak sprekken blir puss igjen etter innbruddet; listene i 3D står bare der det er gulv foran, så ingen brystlist havner på murfronten; normalene vender mot kameraet), taklampene i gangene (faste steder, ikke i det skjulte, ryddes med etasjen via R.levelL og D3.ting, ingen glorie eller flimring, konkurrerer om punktlysene som alle andre kilder), test 55 (ikke tom: 151 murfronter, 17 lamper, og punktlyset målt med D3.tick i faste steg) og de andre testene som leser vegg- og toppmeshene (51 teller firkanter per del, 52 er ute, 53 har ingen pikselsjekk på fronten).
- Egne skjermbilder av en sprekk i sørveggen inne, før og etter, 3D og 2D, og telefon stående (r5_bilder/55v_sprekk_sor_*): fronten er nå mur som resten av sørveggen, og pussflekken fra B4 ligger på den som én flekk over topp og front. Ingen konsollfeil.
- Skjermbildene 55_tomrom og 55_gang: den grønne sokkelen mot tomrommet er borte, så gropa leser som en mørk sjakt og ikke et rom. Gangen er litt lysere og varmere (snitt 77 til 84 der pasienten står, 57 til 65 lenger bort), uten at stemningen blir flat.
- Ingen feil funnet, ingenting endret i koden. Bygget har 544 innebygde bilder, node --check og test_gen.js er grønne, og del 24, 36, 38, 39 og 55 er grønne (54 sjekker).

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
