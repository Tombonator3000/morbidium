# Morbidium: gjøremål

## Venter på Tom
- [ ] Spille prototypen og si hva som føles feil i utseende og kamp.
- [ ] Bekrefte egenskapsnavnene fra journalskissen.
- [ ] Bekrefte regelen om at kort i eget hjerneområde får bonus.
- [ ] Si om han vil levere egne PNG-er for hoder og kropper (SPRITES i 10_art.js tar dem inn med samme festepunkt).
- [ ] Slette grenen claude/funny-newton-cgnzav på GitHub (Claude Code får ikke lov til det). Alt på den finnes i main.

## Toms tilbakemelding 2026-09-24 (åtte punkter)
- [x] 8: sjefer ble usynlige (feil i slag-angrepet).
- [x] 6: fiender som ikke dør (personale uten disk, hallusinasjoner som ble stående, vern mot ugyldig helse).
- [x] 7: lik ligger der pasienten døde, synlige, flere per etasje.
- [x] 1: journalen uten rulling.
- [x] 2: tjenesterom med egne rekvisitter, hovedrekvisitten alltid på plass.
- [x] 3: varierte pasienter (kjønn, hår, hud, fem plagg, sko og pynt; kvinnefiguren fra ChatGPT er tatt i bruk).
- [x] 4: bruksanvisning (Pasienthåndboka) og innstillinger med faner (lyd i tre kanaler, kamera, risting, skjermtekst, skadetall, bobler, navneskilt, styring, data).
- [x] 5: arkivet som arkivskap med mapper, fragmenter og årsrapport; ny tittelmeny og pause. Resten av UI-et (tjenester, dødskort, HUD) kan få samme behandling i etappe 9.

## Kjente svakheter
- [ ] Claude-appen på Android viser ingen publiserte sider (hvit skjerm), heller ikke en enkel testside. Meldt inn av Tom. Spill i Chrome inntil videre.
- [ ] Ytelse er ikke målt på ekte maskinvare. Testmaskinen har bare programvaregrafikk.
- [ ] Balanse (skade, priser, antall fiender) er grovt satt og ikke spilltestet.

## Neste (plan for et ferdig spill, 2026-09-24)
- [x] Legge de 13 evnekortene fra ChatGPT i gpt-grafikk/ med den første duen som kort_due.png.
- [x] Etappe 1: testoppsett, lagring og fortsettelse, berøring på mobil, journalplasser, fiender rundt møbler.
- [x] Etappe 2: etasjen Kjelleren: Isolat og arkiv med Overarkivar Gunhild Paragraf, og signaturangrep for alle sjefer.
- [x] Etappe 3: fem nye fiender (tvangstrøye, byråkrat, narkoselege, arkivrotter, øyeblomst).
- [x] Etappe 4: spesialrom (hemmelig rom bak sprukken vegg, forbannet rom med bakhold, blodofferrom med tre handler).
- [x] Etappe 5: apparater (ti aktive gjenstander som lades ved romrydding) og lommerusk (tolv små gjenstander med én plass).
- [ ] Balansere kuriositetene etter spilltesting; noen kombinasjoner blir trolig altfor sterke.
- [x] Etappe 6: oppskriftssystemet setter sammen fiender av deler (rolle, hode, hatt, tilbehør, kropp, farging, størrelse, mestere med navn). Personaldelene fra ChatGPT skaleres riktig.
- [x] Varierte pasienter, Pasienthåndboka, innstillinger med faner, nytt arkiv, ny tittelmeny og pause (Toms punkt 3, 4 og 5).
- [x] Prøve på 3D-rom med 2D-figurer (vegglamper, måneskygger, glød, lavpoly-møbler). Av som standard, slås på i innstillingene eller med #3d.
- [ ] Tom: prøve 3D-rommene og bestemme retning. Går vi videre, trenger modellene mer detalj (bedre former eller teksturer fra ChatGPT) og ytelsen må måles på mobil.
- [x] Bilder av 40 kuriositeter, åtte piller og et tomt preparatglass fra ChatGPT i gpt-grafikk/.
- [x] Spillerens figurark fra ChatGPT i gpt-grafikk/.
- [x] To nye spillerfigurvarianter, kvinne og mann, med grovere ansikter. Standardfiguren og personalansiktene er også tegnet om.
- [x] Claude: Registrere spillerfigurvariantene i manifestet og ta dem i bruk (kvinnefiguren er med, mannsarket var en kopi av standardfiguren).
- [x] Tre delark fra ChatGPT for personale: hoder, hatter og uniformer.
- [x] Fire sko og fem småobjekter fra ChatGPT: hjerte, Morbidiumdråpe, gulltann, due og eterflaske.
- [x] De siste ni bildene for plukk og effekter fra ChatGPT: kamfer, levertran, luktesalt, tre støvpuff, skyggehånd, stempelmerke og treffstjerne.
- [x] De sju våpenbildene fra ChatGPT i ett ark.
- [x] Første gruppe rekvisitter og møbler fra ChatGPT: alter, tre disker, benk, bord og stol forfra og bakfra.
- [x] Resten av de 51 rekvisittene og møblene i kunstlisten. Alle ligger nå i gpt-grafikk/.
- [x] Alle 54 figurdelene i kunstlisten, inkludert personale, sjefer, kultist, småfiender og spillerens døde ansikt.
- [x] De ni ekstra ansiktstilbehørene, slimskuddet og kortplukk. Hele den gjeldende kunstlisten har bilder.
- [ ] Flere bilder fra ChatGPT etter DESIGN_BRIEF.md: andre figurer, rekvisitter og effekter. Lastes opp til gpt-grafikk/.
- [x] ChatGPT: ni pasientplagg som enkeltbilder i tre retninger, sju pyntbilder, bare føtter og ullsokk i gpt-grafikk/.
- [ ] Claude: Behold pasientens valgte fargevarianter når de nye PNG-bildene for klær og pynt brukes. src/14_pasient.js viser dem nå i faste PNG-farger.
- [x] Etappe 7: musikk (seks stykker i lag som følger kampen) og stemningslyder.
- [x] Etappe 8: merknader som låser opp kuriositeter og oppvåkningssteder, utskrivningsbrev, gjeninnleggelse, tre diagnoser og sju fragmenter.
- [x] Spor etter tidligere pasienter (rablinger med kritt signert med navn fra arkivet).
- [x] Etappe 9: rablinger fra tidligere pasienter, byggeanimasjon, tips for nye spillere, ubrukt kode fjernet, manifest og kunstliste oppdatert, merknader på døds- og utskrivningskortet.
- [ ] Balanse etter Toms spilltesting (skade, helse, priser, hvor ofte mestere dukker opp, hvor vanskelig gjeninnleggelse er).
- [x] Byggeanimasjon når pasienten nærmer seg et rom (idé fra threejs-architecture-effects).
- [x] Rydde bort ubrukt kode (ICONS, STATS, R.basic). Mappa old/ finnes ikke lenger.
- [x] Utvide tools/lag_manifest.py og ART_BRIEF.md med alt det nye. ART_BRIEF viser nå hva som er levert (150 av 287).
- [ ] ChatGPT: de 64 bildene som gjenstår i ART_BRIEF.md (223 av 287 levert): nye figurer (Overarkivaren, byråkrat, narkoselege, pasient i tvangstrøye, arkivrotte, øyeblomst, Journalen), apparater og lommerusk og de nyeste møblene.
