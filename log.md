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
