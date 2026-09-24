# Morbidium: minne

Sist oppdatert 2026-09-24.

## Hva prosjektet er
Sanntids action-roguelite i et norsk sanatorium fra 1920-tallet. Lovecraft- og Hellraiser-mareritt med mørk humor som gjør narr av edgelords. Tilfeldig genererte etasjer satt sammen av rom. Designdokument: Morbidium-Design-v0_2.md.

## Utseende (besluttet etter Toms referanser)
- Mål: Conan Chop Chop møter Castle Crashers. Tykk mørk kontur, flate farger med én skyggetone, store hoder, korte bein.
- Kamera: ortografisk, 52 grader helning, fast.
- Figurer er 2.5D-papirdukker: illustrert hode og kropp som flate plater, armer og bein som tykke bånd bygget hvert bilde. Visninger forfra, bakfra og fra siden (speilet for venstre).
- Rekvisitter er tegnet i 3/4-perspektiv og står som plater festet i forkant.
- Gulv og vegger er ekte geometri med malte teksturer og uten lyssetting. Skygge langs vegger er malt inn.
- Alle deler kan byttes mot PNG via SPRITES med samme festepunkt. Tegningen i koden er reserven.
- UI: pergament, gullring rundt portrett og kart, evnekort med messingnål, dødskort med "DU ER DØD." og dødsårsak.
- Skrift: Alfa Slab One (overskrifter og tall), Alegreya (brødtekst), Caveat (håndskrift i bobler og notater).

## Teknikk
- Én selvstendig HTML-fil, Three.js r128 fra cdnjs.
- Kilder i src/, satt sammen av build.py til dist/morbidium.html. Rekkefølge: 00_head, 01_core, 02_data, 03_generator, 04_render, 05_world, 06_musikk, 10_art, 11_doll, 12_paint, 13_rom, 14_pasient, 20_actors, 22_sjefer, 25_items, 26_fiender, 27_utstyr, 28_oppskrift, 32_meny, 33_merknader, 30_game. 32_meny og 33_merknader ligger før 30_game fordi konstantene der må finnes når 30_game starter.
- Fire etasjer (MAX_DEPTH 4): Mottak (Krok), Underetasjen (Rust), Kjelleren: Isolat og arkiv (Overarkivar Gunhild Paragraf), Under grunnmuren: Dypet (Journalen). Signaturangrepene står i BOSS_MOVES i 22_sjefer.js.
- Render: ortografisk kamera, scenen tegnes til et mål, lys i eget lag (R.light), så ett etterbehandlingspass (gradering, papir, korn, vignett, blekkboiling, Morbidium, skade). Dukkene har egen shader (blink, kontur, oppløsning).
- Spillflyt i 30_game.js: tilstander title, panel, play, journal, dead. G.run holder løpet (pasient, egenskaper, kort i slots og reserve), G.meta lagres i localStorage under morbidium_meta_v2.
- Generatoren er ren data og testet: 900 av 900 etasjer gyldige, deterministisk.
- Løpet lagres ved starten av hver etasje (localStorage morbidium_run_v1) og kan fortsettes fra tittelen. Død og utskrivning sletter det.
- På berøringsskjerm er evnekortene i HUD-en selve evneknappene; body får klassen touch.
- Toon-vann er en ShaderMaterial med delte uniformer for tid og ringer.

## Gjenbruk og lisenser
- Tombonator3000/3044 (MIT): lydsynth og tidsfall.
- Tombonator3000/the-deep-ones (MIT i README): brun støy, tonerekke som skifter til urolig skala, sanity-effekter som modell for Morbidium-slør.
- cortiz2894/stylized-components (MIT, Christian Ortiz): toon-vannshader.
- scottstts/Threejs-Awesome-Graphics-Agent-Skills (MIT): partikkelpool med tett bytte, valideringsprotokoll.
- Brogue CE og Shattered Pixel Dungeon: bare som idékilder (GPL, ingen kode kopiert).

## Ting å huske
- prosjektbibliotek kunne klones uten innlogging, altså offentlig, selv om AGENTS.md sier privat.
- Transcendensens-Vev-CRPG krever innlogging og er ikke sjekket.
- Egenskapene følger Toms journalskisse: Helse, Styrke, Smidighet, Forstand, Fatteevne (designdokumentet hadde Kropp, Smidighet, Vett, Nerver, Tryne). Ikke eksplisitt bekreftet av Tom.
- Journalen er karakterarket etter skissen, med frenologihodet og fire områder: Frykt, Kontroll, Uvirkelighet, Mening. Kort i eget område gir gullprikk og kortere nedkjøling (mitt forslag, ikke bekreftet).
- Fire nye evner fra skissen: Duesannsyn, Undersøkelseslys, Skyggehånd, Stempel.
- Testing i Claude Code-skyen: Chromium når ikke nettet via proxyen. Hent three.min.js med curl og kjør testene med --three STI eller MORBIDIUM_THREE=STI. Python-pakkene playwright (1.56.0 passer med den ferdiginstallerte Chromium) og pillow må installeres.

## Arbeidsdeling med ChatGPT
- Claude koder, lager lyd og musikk og setter sammen bildene. ChatGPT lager bare bilder etter DESIGN_BRIEF.md. Tom laster opp til gpt-grafikk/ (erstattet assets/innboks/ 2026-09-24). Pages-bygget klipper og behandler bildene selv.
- Figurer bygges som oppskrifter av deler (hode, hatt/hår, tilbehør, kropp, farging). Armer og bein tegnes alltid av koden.
- Repoet ligger på GitHub som Tombonator3000/morbidium (opprettet 2026-09-24, innholdet kom som zip og ble pakket ut av Claude Code). GitHub-koblingen i Claude.ai virker ikke (peker på github.com); Claude Code er veien inn.
- Tom vil at alt arbeid skjer direkte på main (bestemt 2026-09-24). Ikke lag egne grener eller pull requests uten at han ber om det. Hver push til main bygger og publiserer til GitHub Pages: https://tombonator3000.github.io/morbidium/
- De 13 første evnekortene fra ChatGPT ligger i gpt-grafikk/. kort_due.png bruker den første, mer detaljerte duen som Tom valgte.
- ChatGPT har også lagt inn fem ark med alle 40 kuriositeter, ett ark med de åtte pillene og glass_tomt.png. Bildebehandlingen klipper arkene til enkeltbilder ved bygging.
- Spillerfiguren ligger i gpt-grafikk/figur_pasient.png som seks deler: hode og kropp sett forfra, bakfra og fra høyre side.
- Tom ønsker grovere og styggere ansikter enn i de første arkene, med asymmetri, skjevheter, ujevne tenner og røffe blekkstreker. Ikoner og utstyr skal beholde stilen sin. Standardpasienten og personalhodene er tegnet om. Kvinnearket er registrert som figur_pasient_kvinne.png (hode_pasient_kvinne_f/b/s). Mannsarket var en kopi av figur_pasient.png og er fjernet.
- Tre personalark i gpt-grafikk/ gir ni hoder, ni hodeplagg og ni uniformsdeler etter klipping. De vises først i spillet når oppskriftssystemet tar i bruk assets/deler/.
- Ett ark med fire sko og fem småobjekter gir ni bilder som bygges inn i spillfila.
- Et nytt ark med de ni siste plukk- og effektbildene gjør hele denne delen av den opprinnelige kunstlista komplett.
- Alle sju våpen fra den opprinnelige kunstlista ligger i ett ni ruters ark med de siste to rutene tomme.
- Tom har bedt ChatGPT starte rekvisitter og møbler som enkeltbilder i trekvart perspektiv. Første gruppe har åtte bilder i gpt-grafikk/: alter, tre disker, venteværelsesbenk, sykehusbord og stol forfra og bakfra. De behandles av den eksisterende bildeflyten.
- Hele runden med 51 rekvisitter og møbler er tegnet. De resterende 43 bildene omfatter oppbevaring, romrekvisitter, behandlingsutstyr og seng, båre og badekar i fire retninger. Alle PNG-filene ligger i gpt-grafikk/ med gjennomsiktig bakgrunn og filnavn fra manifestet.
- Hele den opprinnelige kunstlisten er dekket. Figurarkene for pleier, oppasser og kultist har seks visninger hver. Bibliotekar, Hansen, kokk, Krok, Olsen og Rust har hode og kropp forfra. Kultistens kappe har tre visninger, og flue, lunge og svulst har tre hver. Yngelen, spillerens døde hode, ni små ansiktstilbehør, slimskudd og kortplukk er også tegnet.
- Ni nye pasientplagg i tre retninger, sju hodeplagg og ansiktsmerker samt bare føtter og ullsokk ligger som enkeltbilder i gpt-grafikk/. ART_BRIEF.md viser 223 av 287 leverte bilder. Hele bildeflyten er kontrollert i en kopi med 223 bilder uten feil og 27 personaldeler.
- De ti aktive apparatene og tolv små lommerusk har nå egne PNG-ikoner i gpt-grafikk/. ART_BRIEF.md viser 245 av 287 leverte bilder. Kontrollbyggingen behandlet alle 245 uten feil.
- De 22 siste rombildene er også tegnet: arkiv, celle, kafeteria, vaskerom, gulvfarer og øvrige rekvisitter. ART_BRIEF.md viser 267 av 287 leverte bilder. Kontrollbyggingen behandlet alle 267 uten feil.
- De siste 20 figurfilene er tegnet, med flere retninger for Journalen, øyeblomsten, arkivrotta, tvangstrøyepasienten og slukyngelen, samt hoder og kropper for Overarkivaren, byråkraten og narkoselegen. ART_BRIEF.md viser 287 av 287 leverte bilder. Hele bildeflyten behandlet 287 bilder uten feil og bygget dem inn sammen med 27 personaldeler.

## Kuriositeter (Isaac-systemet)
- src/25_items.js: 40 kuriositeter som stables, ti navngitte synergier, fem forvandlinger (tre i samme gruppe), åtte ukjente piller per løp, preparatglass som leveringsform, blodoffer etter sjefen (koster ett hjerte).
- Slagene kan hoste slimklumper; nesten alle angrepsgjenstander virker på klumpene. Det er dette som gir kombinasjonene.
- Nye fiender: flue, svulst, lunge (enkeltsprites som yngelen). I 26_fiender.js: tvang, byrakrat, narkose, rotte (flokk på tre), oyeblomst (står fast). Byråkrat og narkoselege er tegnet bare forfra (ENEMY_ART), som tjenestefolkene.
- Tonen skal være mer absurd og grotesk, som Isaac, men fortsatt tegneserieaktig.

## Pasienten (14_pasient.js)
- Hver innleggelse lager et utseende (G.patient.look, kopiert til G.run.look): kjønn, hårfarge (6), hudtone (4), plagg (morgenkåpe i 8 farger, tvangstrøye, sykehusskjorte, stripete pyjamas, nattserk), sko (tøfler, klogger, bare føtter, ullsokker, støvler) og pynt (nattlue, papiljotter, hårnett, beskyttelseshjelm, sløyfe, plaster, sting). Fornavnet følger kjønnet (FIRST_K, FIRST_M).
- ChatGPT-hodene og kåpa farges om piksel for piksel. Hår farges bare der det er sammenhengende hår rundt (uskarp maske), ellers blir skjeggstubber prikker.
- Pasient.deler(look) gir alt som trengs; Pasient.dukke lager figuren. Brukes av spilleren, medaljen, innleggelseskortet, journalen, dødskortet, utskrivningskortet og likene. Lik i likhuset får tilfeldige utseender. Menn i morgenkåpe blir liggende som ChatGPT-liket (lik.png) farget om, alle andre som et sammensatt lik.
- Nøkler for bilder fra ChatGPT: hode_pasient_kvinne_*, kropp_tvang_*, kropp_skjorte_*, kropp_pyjamas_*, sko_barfot, sko_sokk, pynt_*. Nattserken har ingen bildenøkkel ennå (den går under hofta, og bildebehandlingen fester alt ved hofta).
- De nye plaggene og pyntbildene vises foreløpig i PNG-fargene. I src/14_pasient.js brukes bildene direkte uten omfarging, selv om pasienten fortsatt kan få andre valgte farger. Bare føtter farges etter hudtonen. Claude må koble på omfarging dersom fargevariasjonen skal synes på de nye bildene.
- Doll tar opt.rig (farger og mål) og opt.shoeP. Båndene til armer og bein har plass til 3200 punkter; med 900 ble fyllfargen kuttet og lemmene tegnet nesten bare i blekk (feil fra første versjon, rettet 2026-09-24).

## Merknader og slutten (33_merknader.js)
- G.meta.merk = { id: tidspunkt }. MERKNADER har navn, krav, gir og eventuelt kur (kuriositeter som er låst til merknaden er fortjent). Merknad.laast(id) brukes av Items.pickFrom.
- Kroker: onDeath (showDeath), onBoss (bossDie), onWin (visUtskrevet), onKill (enemyDie, teller meta.drap og meta.mestere), onLoot, onTransform, onFragment, tick (tenner, diagnoser, Morbidium).
- Oppvåkningssteder kan låses med unlock: 'merk:<id>' (Kapellet: merk:rust, Vaktmesterens bod: merk:tenner). lockText(k) gir teksten.
- showWin viser først utskrivningsbrevet (utskrivningsbrev), så visUtskrevet med kortet. Gjeninnleggelse: G.run.gjen (valget huskes i meta.gjenValg). Ganger fiende- og sjefshelse 1,3, skade 1,2, mestersjanse 1,6, tenner 1,25.

## Spor, byggeanimasjon og tips (33_merknader.js)
- Spor.onFloor legger opptil to krittrablinger fra meta.historie på gulvet i kamprom; Spor.interact gir «Les rablingen».
- Bygg.onFloor gjør møblene utenfor startrommet flate (scale nesten 0, byggS husker skalaen); Bygg.tick bygger et rom når pasienten er innen seks ruter. Bygg.alt() bygger alt (brukes av rolig() i testene). Av med R.lowTex eller enkel grafikk.
- Tips.vis(id, forsinkelse) viser en lapp én gang (meta.tips); innstillingen tips slår dem av.
- Manifestet oppdateres med tools/lag_manifest.py (fletter inn, fjerner aldri). ART_BRIEF.md lages av tools/lag_brief.py og viser hva som er levert.

## Rom i 3D, prøve (15_rom3d.js)
- D3.sett(på) fra applySettings (innstillingen d3, eller #3d). D3.onFloor() etter hver etasje og på tittelen. D3.tick(dt) hvert bilde.
- R.light registrerer lysplatene i R.kilder; D3 gir de åtte nærmeste et PointLight (spillerens lykt først). Månen er et DirectionalLight med skyggekart som følger kameraet.
- Paint.mesh { gulv, topp, vegg } får MeshToonMaterial (gradient i fire trinn) og normaler. Vanlige MeshBasic-materialer i nivået blir Lambert. Alt huskes i D3.byttet og settes tilbake.
- Toms retning (24.9. kveld): figurer og ting forblir 2D-tegningene (så alle bildene fra ChatGPT brukes), bare rommene, gulvet og effektene er 3D. Lavpoly-møblene er fjernet.
- D3.moble(o) gjør rekvisittens tegning til skyggekaster (skyggePlate: MeshDepthMaterial med alfatest, setPart oppdaterer kartet) og gjemmer den gamle skyggeflekken (D3.gjemt, vises igjen i riv).
- D3.arkitektur: fotlist, brystlist og taklist (InstancedMesh per del) langs alle høye veggfronter, og pilastre med sokkel og kapitel hver tredje rute på bakveggen i hvert rom (midt mellom vegglampene og vinduene). En litt større blekkasse rett bak hver del gir strek på sidene og under. Paint.opptatt (settes av Paint.door og Paint.poster) holder lister, pilastre og vegglamper unna dører og plakater.
- Gulvet får bumpMap fra sin egen tekstur (D3.BUMP), så fugene får relieff i lyset. D3.stov: 192 støvkorn, hvert hører til ett punktlys og driver rundt i lyskjeglen (additivt, 4,2 px).
- Materialene som byttes, kastes i riv; egne materialer og geometrier ligger i D3.egne.
- Glød: R.renderBloom (lyse deler i kvart oppløsning, uskarpt to ganger), lagt til i etterbehandlingen når D3 er på. Den tegnede lysbufferen er av i 3D.

## Strekarmer og strekbein (11_doll.js)
- STREK = { tynn, farge, ben, arm, hand }: armer og bein som tynne mørke blekkstreker, som i Conan Chop Chop. Innstillingen lemmer ('tynne' som standard, 'tykke' gir de gamle båndene i klesfargen), avkrysning under Bilde. Brukes av Doll.update, drawDollPortrait (journal og kort) og corpseArt (liknøkkelen får .t).
- applySettings oppdaterer G.meta.settings på stedet (Object.assign), så panelet kan endre flere ting etter hverandre.

## Musikk og lyd (06_musikk.js, Sound i 01_core.js)
- Musikk er et sekvenseringsverk i åttendeler med forhåndsplanlegging (0,22 s). Stykker i STYKKER: tittel (spilledåsevals), e1 (vals i d-moll), e2 (sakte orgel med drypp), e3 (frygisk marsj med cembalo og skrivemaskin), e4 (kor og klokker), tjeneste (grammofonvals i dur, filtrert som en gammel grammofon).
- Tre lag: grunn (alltid), kamp (trommer og sagbass) og sjef (messing og pauker). Musikk.settNiva(0/1/2) toner lagene inn og øker tempoet litt. Morbidium (Musikk.morb) drar tonene skjeve og gir halvtonefeil.
- Lydbusser: sfx, amb (drone og stemningslyder), mus (musikken). Innstillinger: vol, sfx, mus, amb.
- Sound.tick spiller nå tilfeldige stemningslyder per etasje (klokke, knirk, drypp, rør, skrivemaskin, rotte, skrik, hjerteslag). Tonerekka fra the-deep-ones er erstattet av musikken.
- Hjerteslag under 25 % helse, raskere jo mindre helse. Stikk ved død (fallende orgel og gongong) og utskrivning (spilledåse i dur).

## Menyer (32_meny.js)
- Alt er papir og skaleres til skjermen med CSS zoom (fitPanel), ingenting ruller. Smale skjermer (under 700 px eller stående) får egne smale varianter.
- Tittelen: innleggelsesskjema med avkrysning. Pause: utklippstavle med portrett. Innstillinger: kartotekkort med fanene Lyd, Bilde, Spill, Styring, Data. Pasienthåndboka: hefte med åtte kapitler og notater i margen. Arkivet: skap med tre skuffer (pasientmapper med portrett og stempel, journalfragmenter, årsrapport).
- Innstillinger (G.meta.settings, normSettings): vol, sfx, amb, kamera (ganger R.view 11.5), shake (styrke 0 til 1, var av/på før), flash, distort, lights, simple, tall, bobler, skilt, ui (størrelse på HUD via CSS-variabelen --ui og scale).
- Data-fanen kan slette lagret løp og brenne arkivet (to trykk). Innstillingene beholdes.
- Etasje 3 har alltid minst ett isolat eller kartotek (generatoren, testet i test_gen).

## Apparater og lommerusk (27_utstyr.js)
- Aktiv: G.run.akt = { id, charge, max }, lades per ryddet rom (sjef to, batteri dobler). Lomme: G.run.trinket. Begge lagres med løpet.

## Spesialrom (13_rom.js, Spesial)
- Hemmelig rom i hver etasje bak sprukken vegg (F.crack er rutene; tre poeng: vanlig slag 1, tungt 3, eksplosjon 3). Forbannet rom i blindvei (torner tar et hjerte per inngang, glasset utløser bakhold). Blodofferrom med alter som tilbyr tre handler.
