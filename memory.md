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
- Kilder i src/, satt sammen av build.py til dist/morbidium.html. Rekkefølge: 00_head, 01_core, 02_data, 03_generator, 04_render, 05_world, 10_art, 11_doll, 12_paint, 20_actors, 30_game. old/ har utrangerte filer og dubletter.
- Render: ortografisk kamera, scenen tegnes til et mål, lys i eget lag (R.light), så ett etterbehandlingspass (gradering, papir, korn, vignett, blekkboiling, Morbidium, skade). Dukkene har egen shader (blink, kontur, oppløsning).
- Spillflyt i 30_game.js: tilstander title, panel, play, journal, dead. G.run holder løpet (pasient, egenskaper, kort i slots og reserve), G.meta lagres i localStorage under morbidium_meta_v2.
- Generatoren er ren data og testet: 900 av 900 etasjer gyldige, deterministisk.
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
- Testing i Claude Code-skyen: Chromium når ikke nettet via proxyen, så test_spill.py må få three.min.js servert lokalt (page.route mot en fil hentet med curl). Python-pakken playwright må installeres (1.56.0 passer med den ferdiginstallerte Chromium).

## Arbeidsdeling med ChatGPT
- Claude koder, lager lyd og musikk og setter sammen bildene. ChatGPT lager bare bilder etter DESIGN_BRIEF.md. Tom laster opp til gpt-grafikk/ (erstattet assets/innboks/ 2026-09-24). Pages-bygget klipper og behandler bildene selv.
- Figurer bygges som oppskrifter av deler (hode, hatt/hår, tilbehør, kropp, farging). Armer og bein tegnes alltid av koden.
- Repoet ligger på GitHub som Tombonator3000/morbidium (opprettet 2026-09-24, innholdet kom som zip og ble pakket ut av Claude Code). GitHub-koblingen i Claude.ai virker ikke (peker på github.com); Claude Code er veien inn.
- Tom vil at alt arbeid skjer direkte på main (bestemt 2026-09-24). Ikke lag egne grener eller pull requests uten at han ber om det. Hver push til main bygger og publiserer til GitHub Pages: https://tombonator3000.github.io/morbidium/
- De 13 første evnekortene fra ChatGPT ligger i gpt-grafikk/. kort_due.png bruker den første, mer detaljerte duen som Tom valgte.

## Kuriositeter (Isaac-systemet)
- src/25_items.js: 40 kuriositeter som stables, ti navngitte synergier, fem forvandlinger (tre i samme gruppe), åtte ukjente piller per løp, preparatglass som leveringsform, blodoffer etter sjefen (koster ett hjerte).
- Slagene kan hoste slimklumper; nesten alle angrepsgjenstander virker på klumpene. Det er dette som gir kombinasjonene.
- Nye fiender: flue, svulst, lunge (enkeltsprites som yngelen).
- Tonen skal være mer absurd og grotesk, som Isaac, men fortsatt tegneserieaktig.
