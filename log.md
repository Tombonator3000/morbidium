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
