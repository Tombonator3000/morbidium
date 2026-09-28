# Morbidium: minne

Sist oppdatert 2026-09-28. Fila er kort med vilje (under 8 KB, sjekkes av tools/rydd_dokumenter.py): gjeldende tilstand og beslutninger. Hvordan hvert system virker, står i dokumentasjon/systemer.md. Eldre logg ligger i logg/, ferdige oppgaver i arkiv/.

## Hva prosjektet er
Sanntids action-roguelite i et norsk sanatorium, 24. september 1923. Lovecraft- og Hellraiser-mareritt møter Twin Peaks, med mørk humor som gjør narr av edgelords. Tilfeldig genererte etasjer satt sammen av rom. Designdokument: Morbidium-Design-v0_2.md, utvidelsen i UTVIDELSE.md. Publisert på https://tombonator3000.github.io/morbidium/ (hver push til main bygger og publiserer).

## Beslutninger
- Arbeidsflyt: Tom vil at alt arbeid skjer direkte på main (24.9.). Ikke lag pull requests uten at han ber om det. Er økta låst til en egen gren, legges den på main med fast-forward når arbeidet er testet.
- Utseende: Conan Chop Chop møter Castle Crashers. Figurer og ting er 2D-tegninger (papirdukker, ting i trekvart perspektiv), mens rom, gulv, vegger og effekter er 3D (standard fra 25.9.). Tykk mørk kontur og flate farger. Tom vil ha grovere og styggere ansikter.
- Kamera: ortografisk, 52 grader som standard. Kameravinkel under Innstillinger, Bilde (som før, lav, isometrisk). Tom har ikke valgt standard ennå.
- Seks etasjer: 1 Parken (ute), 2 Mottak, 3 Underetasjen, 4 Kjelleren, 5 Nattskogen (ute), 6 Dypet. Sjefene i etasje 1 til 5 trekkes fra en pulje per løp, Journalen står fast i etasje 6.
- Historien: under huset er et hav der pasient nr. 0 sover. Dr. Morbeck, Avdeling Null og Journalen. Egen mytologi, ingen navn eller sitater fra filmene eller serien. Tonen er grov, kroppslig humor (revy 1923), ikke eksplisitt.
- Kunst: ChatGPT lager bare bilder etter DESIGN_BRIEF.md. Claude koder, lager lyd og musikk og setter sammen bildene. Alt som mangler bilde, tegnes av koden, så det blir aldri hull. Status 28.9.: 611 av 636 manifestbilder. Ni vegger venter på at veggprøven vurderes, 16 gulv venter på egne gulvfliser i koden. Se GRAFIKKLEVERANSE.md og UTEGRAFIKK.md før nye bestillinger.
- Lyd: bare lyder som er fri til bruk (CC0, Freesound og VCSL). Navn på alle i assets/lyd/KILDER.md.
- Telefon: R.coarse skiller telefon fra PC, ikke pointer: coarse alene (Samsung med S Pen melder fin peker). Telefoner og TV får middels som standard, høyst oppløsning 1,5, 1024 i skyggekartet og ingen omgivelsesskygge.
- Ikke bekreftet av Tom: egenskapsnavnene (Helse, Styrke, Smidighet, Forstand, Fatteevne) og bonusen for kort i eget hjerneområde.

## Teknikk i korte trekk
- Kilder i src/, satt sammen av build.py i rekkefølgen i parts. Three.js r128 fra cdnjs. Hva hver fil gjør, står i AGENTS.md; hvordan systemene virker, i dokumentasjon/systemer.md.
- Bildeløpet: gpt-grafikk/ -> tools/skjaer_ark.py -> tools/behandle_bilder.py -> build.py. GitHub Actions gjør det samme ved push til main.
- Tester: node tools/test_gen.js (etasjegeneratoren), python3 tools/test_spill.py (gjennomspilling) og python3 tools/test_ekstra.py (enkeltfunksjoner, tar flere timer i skyen).
- I Claude Code-skyen når Chromium ikke nettet: hent three.min.js med curl og bruk --three STI. Installer playwright==1.56.0 og pillow med pip.
- Telefonen tåler lite: alt som lages på skjermkortet per etasje, må frigjøres. Chrome sperrer WebGL for siden etter et krasj til nettleseren startes helt på nytt. «Kopier feilrapport» i feilmeldingen gir et øyeblikksbilde og det lagrede løpet.

## Status nå (28.9. kveld)
- Runde 5 er flettet og publisert: blekkvarsler, snø, hårruller, det skjulte rommet, veggteksturer, Skinnlauget, havet under huset og Kraken.
- Kameraprøven med ny etterbehandling (dis, omgivelsesskygge på PC og tonekurve) er på main.
- Toms telefon (Adreno 750) mistet WebGL 28.9. Etter telefongjenkjenningen og en omstart av Chrome virker spillet. Hvorfor den også krasjet i trygg modus, er ikke funnet.
- Åpne oppgaver står i todo.md.

## Hvor ting står
- dokumentasjon/systemer.md: hvordan hvert system virker (3D, lys, lyd og musikk, fiender, sjefer, historien, mobil, testmodus og resten), med innholdsliste øverst.
- log.md: det siste arbeidet. logg/ÅÅÅÅ-MM.md: eldre logg. arkiv/: ferdige oppgaver.
- UTVIDELSE.md (planen for etasjer og rom), DESIGN_BRIEF.md (til ChatGPT), ART_BRIEF.md og tegnelister/ (generert), GRAFIKKLEVERANSE.md, UTEGRAFIKK.md, TV.md.
