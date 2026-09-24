# Morbidium: gjøremål

## Venter på Tom
- [ ] Spille prototypen og si hva som føles feil i utseende og kamp.
- [ ] Bekrefte egenskapsnavnene fra journalskissen.
- [ ] Bekrefte regelen om at kort i eget hjerneområde får bonus.
- [ ] Si om han vil levere egne PNG-er for hoder og kropper (SPRITES i 10_art.js tar dem inn med samme festepunkt).
- [ ] Slå på Pages hvis det ikke er gjort (Settings, Pages, Source: GitHub Actions), så spillet publiseres fra main.

## Kjente svakheter
- [ ] Claude-appen på Android viser ingen publiserte sider (hvit skjerm), heller ikke en enkel testside. Meldt inn av Tom. Spill i Chrome inntil videre.
- [ ] Ytelse er ikke målt på ekte maskinvare. Testmaskinen har bare programvaregrafikk.
- [ ] Fiender kan sette seg fast bak møbler i trange rom; strømningsfeltet brukes, men ikke overalt.
- [ ] Stående mobil: berøringsknappene dekker nedre halvdel av skjermen.
- [ ] Kortplassene i journalen dekker deler av hjerneområdene.
- [ ] Balanse (skade, priser, antall fiender) er grovt satt og ikke spilltestet.

## Neste
- [ ] Aktive gjenstander (med lading ved romrydding) og småtrinkets, som i Isaac.
- [ ] Egne rom: forbannet rom, hemmelig rom, blodofferrom med flere valg.
- [ ] Balansere kuriositetene etter spilltesting; noen kombinasjoner blir trolig altfor sterke.
- [ ] Flere groteske fiender og sjefer med egne mønstre.
- [ ] Oppskriftssystemet i motoren: sette sammen fiender av deler fra assets/deler/ (rolle, hode, hatt/hår, tilbehør, kropp, farging, størrelse, elitemerker, navn).
- [ ] Utseendetest av 3D-verden med 2D-figurer (ett rom, vegglamper, måneskygger, bloom), hvis Tom vil.
- [ ] Første bilder fra ChatGPT etter DESIGN_BRIEF.md: figur_pasient, evnekort, personale.
- [ ] Musikk og flere lyder.
- [ ] Etasjen "Isolat og arkiv" fra designdokumentet.
- [ ] Byggeanimasjon når et rom avsløres (idé fra threejs-architecture-effects).
- [ ] Flere diagnoser og oppvåkningssteder, flere spor etter tidligere pasienter.
- [ ] Rydde bort ubrukt kode i old/ og ubrukte deler av 04_render.js.
- [ ] Gi tools/test_spill.py et valg for å servere three.min.js lokalt, så testen virker i miljøer uten nett i nettleseren (som Claude Code-skyen).
