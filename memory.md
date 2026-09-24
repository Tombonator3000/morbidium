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
- Kilder i src/, satt sammen av build.py til dist/morbidium.html. Rekkefølge: 00_head, 01_core, 02_data, 03_generator, 04_render, 05_world, 10_art, 11_doll, 12_paint, 13_rom, 14_pasient, 20_actors, 22_sjefer, 25_items, 26_fiender, 27_utstyr, 28_oppskrift, 30_game.
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
- Doll tar opt.rig (farger og mål) og opt.shoeP. Båndene til armer og bein har plass til 3200 punkter; med 900 ble fyllfargen kuttet og lemmene tegnet nesten bare i blekk (feil fra første versjon, rettet 2026-09-24).

## Apparater og lommerusk (27_utstyr.js)
- Aktiv: G.run.akt = { id, charge, max }, lades per ryddet rom (sjef to, batteri dobler). Lomme: G.run.trinket. Begge lagres med løpet.

## Spesialrom (13_rom.js, Spesial)
- Hemmelig rom i hver etasje bak sprukken vegg (F.crack er rutene; tre poeng: vanlig slag 1, tungt 3, eksplosjon 3). Forbannet rom i blindvei (torner tar et hjerte per inngang, glasset utløser bakhold). Blodofferrom med alter som tilbyr tre handler.
