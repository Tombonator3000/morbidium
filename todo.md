# Morbidium: gjøremål

## Venter på Tom
- [ ] Spille prototypen og si hva som føles feil i utseende og kamp.
- [ ] Bekrefte egenskapsnavnene fra journalskissen.
- [ ] Bekrefte regelen om at kort i eget hjerneområde får bonus.
- [ ] Si om han vil levere egne PNG-er for hoder og kropper (SPRITES i 10_art.js tar dem inn med samme festepunkt).
- [ ] Slette grenen claude/funny-newton-cgnzav på GitHub (Claude Code får ikke lov til det). Alt på den finnes i main.

## Økta 2026-09-25 (3D, grafikk, blod, nye fiender, sjefer, håndbok og HUD)
- [x] 3D som standard med automatisk kvalitet (høy, middels, lav, av) og valg under Bilde.
- [x] Bedre lys og shadere: kantlys fra lampene, lysstråler fra vinduene, lyskjegler, flimring, tåke, mørke som kommer og går, tilt-shift, kalde skygger og varme høylys, filmriper.
- [x] Blod og skrekk: sprut på vegger og gulv, drypp, kjøttbiter, fotspor, blod på skjermen, årer ved lite helse, øyne i veggene.
- [x] System for animering av 2D-ting (spriteark eller tegnede ruter) og positurer for dukkene.
- [x] ChatGPTs fiender: Kasteren, Trillepasienten, Speilpasienten, klumpunger, Hviskekoret (minisjef) og Den Store Klumpen (sjef). I tillegg minisjefene Tannlegen og Den hodeløse portieren.
- [x] Tilfeldige sjefer per løp og minisjefer i risikorommet.
- [x] Fiendeindeks med bilder i Pasienthåndboka (kapittel 9 og 10).
- [x] HUD etter ChatGPTs skisse, og UI-settet (runde 9) som tas i bruk av seg selv når bildene kommer.
- [x] Forslag til ChatGPT som grafikkleverandør for HUD og menyer: del G, H og I i DESIGN_BRIEF.md.
- [ ] Tom: flette grenen claude/practical-babbage-nc80bu inn i main, så Pages får det nye.
- [ ] Tom: spille med 3D på mobil og PC og si om den automatiske kvaliteten treffer, og om blodet er passe mye.
- [ ] ChatGPT: runde 7, 8 og 9 i ART_BRIEF.md, i rekkefølgen under «Neste bestilling» i DESIGN_BRIEF.md.
- [ ] ChatGPT eller Tom: legge Kasteren-pakken inn som figur_kasteren.png og anim_kastesprut.png. De fire kastebildene trengs ikke, spillet kaster med delene.
- [ ] Claude, når Tom vil: UI-settet fase 2 (ui_bok, ui_fane, ui_stempel, ui_merke, ui_stang, ui_flaske).
- [ ] Balanse for de nye fiendene, minisjefene og Klumpen etter spilltesting.

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
- [x] Tom har bestemt retning for 3D: figurer og ting forblir 2D, bare rom, gulv og effekter i 3D. Lavpoly-møblene er fjernet; lister, pilastre, relieff i gulvet og støv i lyset er lagt til.
- [x] Tom ba 25.9. om at 3D blir standard. Gjort, med automatisk kvalitet som går ned og til slutt slår 3D av når bildet hakker.
- [x] Strekarmer og strekbein som i Conan Chop Chop (standard), med valg for de gamle tykke lemmene.
- [ ] Tom: si om strekarmene skal være enda tynnere eller ha en annen farge (STREK i 11_doll.js).
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
- [x] Alle bildene i den gjeldende kunstlisten er laget etter DESIGN_BRIEF.md og ligger i gpt-grafikk/.
- [x] ChatGPT: ni pasientplagg som enkeltbilder i tre retninger, sju pyntbilder, bare føtter og ullsokk i gpt-grafikk/.
- [x] Claude: Behold pasientens valgte fargevarianter når de nye PNG-bildene for klær og pynt brukes (gjort i 73b702a).
- [x] Etappe 7: musikk (seks stykker i lag som følger kampen) og stemningslyder.
- [x] Etappe 8: merknader som låser opp kuriositeter og oppvåkningssteder, utskrivningsbrev, gjeninnleggelse, tre diagnoser og sju fragmenter.
- [x] Spor etter tidligere pasienter (rablinger med kritt signert med navn fra arkivet).
- [x] Etappe 9: rablinger fra tidligere pasienter, byggeanimasjon, tips for nye spillere, ubrukt kode fjernet, manifest og kunstliste oppdatert, merknader på døds- og utskrivningskortet.
- [ ] Balanse etter Toms spilltesting (skade, helse, priser, hvor ofte mestere dukker opp, hvor vanskelig gjeninnleggelse er).
- [x] Byggeanimasjon når pasienten nærmer seg et rom (idé fra threejs-architecture-effects).
- [x] Rydde bort ubrukt kode (ICONS, STATS, R.basic). Mappa old/ finnes ikke lenger.
- [x] Utvide tools/lag_manifest.py og ART_BRIEF.md med alt det nye. ART_BRIEF viser nå hva som er levert (150 av 287).
- [x] ChatGPT: de siste 20 figurbildene i ART_BRIEF.md: Overarkivaren, byråkrat, narkoselege, pasient i tvangstrøye, arkivrotte, øyeblomst, Journalen og to nye visninger av slukyngelen. Kunstlisten er komplett med 287 av 287 bilder.
