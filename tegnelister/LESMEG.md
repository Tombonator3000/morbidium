# Tegnelister til ChatGPT

Laget av `tools/lag_tegnelister.py` fra `assets/manifest.json`. Ikke rediger for hånd; kjør skriptet på nytt når bilder er levert.

Status: 287 av 544 bilder i manifestet er levert. De 257 som mangler, er samlet i 63 ark og bilder fordelt på 10 lister, én ChatGPT-samtale per liste. I tillegg kommer 11 delark til oppskriftssystemet.

Hvert ark er én PNG. Et figurark gir seks bilder (hode og kropp fra tre kanter), et «ni ting»-ark opptil ni. Store ting som trær, porter og sjefskropper tegnes som enkeltbilder, fordi en rute på malen blir for liten til dem. Referansebildene i `referanse/` viser dagens kodetegninger i samme rutenett som malen; last dem opp sammen med malen, så ser ChatGPT hva som skal i hver rute.

| Liste | Innhold | Ark | Bilder |
|---|---|---|---|
| [1. Fiendene og minisjefene i sanatoriet](01_fiender.md) | Kasteren, Trillepasienten, Speilpasienten, Tannlegen (minisjef), Den hodeløse portieren (minisjef), Våpen og småting | 6 | 39 |
| [2. Hviskekoret og Den Store Klumpen](02_koret_og_klumpen.md) | Hviskekorets kropp, Korets munner og ører, Klumpens kropp, Klumpens ansikter, øye, lue og ungene | 4 | 17 |
| [3. Spriteark](03_spriteark.md) | Spruten når klumpen treffer, Blodspruten, Klumpen som snurrer i lufta, Øyet som åpner seg i veggsprekken, Kjøttbitene | 5 | 5 |
| [4. HUD og menyer](04_hud.md) | Hjerter og ikoner, Gullringen rundt portrettet, Kompassringen rundt kartet, Panelet, Knappen, Kortrammen, ... | 9 | 13 |
| [5. Parken og Nattskogen: fiender og sjefer](05_parken_og_skogen.md) | Gartneren, Huldra, Vedkubbemannen, Nøkken, Overgartner Ansgar Hekk (sjef), Hjortens kropp, ... | 8 | 35 |
| [6. Hendelsene](06_hendelsene.md) | Mannen som går baklengs, Telefonen, kua, heisen og de andre, Kubbekona, tannfeen og lampemannen, De tre damene i bunad, Kjempen i smoking | 5 | 22 |
| [7. Drømmene](07_drommene.md) | Mannen uten ansikt, Mannen med ansikt, Kvinnen uten ansikt, Kvinnen med ansikt, Vinduene og dørene, Tingene de etterlot seg, ... | 8 | 52 |
| [8. Møblene i de nye rommene, parken og skogen](08_moblene.md) | Behandlingsrommene, Salongen og kapellet, Kjøkkenet og kjelleren, Drivhuset og hagen, Kirkegården, dammen og vinteren, Nattskogen, ... | 14 | 62 |
| [9. Delark til oppskriftssystemet](09_delark.md) | Pasienthoder, Kultisthoder, Pasientklær, Kultistklær, Kultisthatter, Ansiktstilbehør, ... | 11 | delark |
| [10. Historien](10_historien.md) | Journalsidene og sluttene, prop_forstander, prop_venterom, prop_skrin | 4 | 12 |

Rekkefølgen følger «Neste bestilling» i `DESIGN_BRIEF.md`: fiendene som synes mest først, møblene sist. Historien (liste 10) er ny og kort, bare to bestillinger, og kan tas når som helst. Det som ikke har bilde ennå, tegnes av koden som før, så spillet får aldri hull.

## Slik gjør du det

1. Start en ny samtale i ChatGPT og lim inn stilblokken under. Bruk samme samtale for hele lista, så stilen holder seg.
2. For hvert ark: last opp malen fra `maler/` (står ved arket), og referansebildet hvis det står et. Lim inn prompten.
3. Last ned resultatet som PNG og gi det nøyaktig filnavnet som står ved arket.
4. Last fila opp til `gpt-grafikk/` i repoet (Add file, Upload files) og commit til `main`. Resten går av seg selv.

## Stilblokk (lim inn først)

```text
Style: hand-drawn cartoon game art in the style of Conan Chop Chop mixed with Castle Crashers. Thick dark brown ink outlines (#2a1a14) with a slightly wobbly, hand-inked line that is heavier on the lower right. Flat colors with one darker cel-shade tone on the lower right and a small light highlight on the upper left. Light always comes from the upper left. Muted, warm 1920s palette. Setting: a 1920s Norwegian sanatorium, Lovecraftian and a bit gross, but with dark humor. Big heads, small bodies, chunky shapes. Keep this exact style, line thickness and palette for every image in this conversation.
Technical: PNG with a TRANSPARENT background. No text unless asked, no ground shadows, no frames, no background scenery.
```

## Alle ark

Samme oversikt finnes som regneark i `tegneliste.csv`.

| Nr | Filnavn | Mal | Bilder |
|---|---|---|---|
| 1a | `figur_kasteren.png` | mal_figur.png | 6 |
| 1b | `figur_trille.png` | mal_figur.png | 6 |
| 1c | `figur_speil.png` | mal_figur.png | 6 |
| 1d | `figur_tannlege.png` | mal_figur.png | 6 |
| 1e | `figur_portier.png` | mal_figur.png | 6 |
| 1f | `ark__hjul_trille_f__vaapen_klump__glasskar__vaapen_tang_....png` | mal_ni_ting.png | 9 |
| 2a | `koret_kropp.png` |  | 1 |
| 2b | `ark__koret_munn0__koret_munn1__koret_munn2__koret_ore0__....png` | mal_ni_ting.png | 6 |
| 2c | `klumpen_kropp.png` |  | 1 |
| 2d | `ark__klumpen_ansikt0__klumpen_ansikt1__klumpen_ansikt2__....png` | mal_ni_ting.png | 9 |
| 3a | `anim_kastesprut.png` |  | 1 |
| 3b | `anim_blodsprut.png` |  | 1 |
| 3c | `anim_kasteklump.png` |  | 1 |
| 3d | `anim_oye.png` |  | 1 |
| 3e | `anim_kjottbiter.png` |  | 1 |
| 4a | `ark__ui_hjerte_full__ui_hjerte_halv__ui_hjerte_tom__ui_i....png` | mal_ni_ting.png | 5 |
| 4b | `ui_ring_portrett.png` |  | 1 |
| 4c | `ui_ring_kart.png` |  | 1 |
| 4d | `ui_panel.png` |  | 1 |
| 4e | `ui_knapp.png` |  | 1 |
| 4f | `ui_kort.png` |  | 1 |
| 4g | `ui_skilt.png` |  | 1 |
| 4h | `ui_utklipp.png` |  | 1 |
| 4i | `ui_hode.png` |  | 1 |
| 5a | `figur_gartner.png` | mal_figur.png | 6 |
| 5b | `figur_huldra.png` | mal_figur.png | 6 |
| 5c | `figur_vedkubbe.png` | mal_figur.png | 6 |
| 5d | `figur_nokken.png` | mal_figur.png | 6 |
| 5e | `figur_hekk.png` | mal_figur.png | 2 |
| 5f | `hjort_kropp.png` |  | 1 |
| 5g | `hjort_hode.png` |  | 1 |
| 5h | `ark__kraake_kropp__kraake_vinge__blob_kaalhode_f__blob_k....png` | mal_ni_ting.png | 7 |
| 6a | `figur_baklengs.png` | mal_figur.png | 6 |
| 6b | `ark__prop_telefon__prop_kaffebord__prop_ku__prop_brennev....png` | mal_ni_ting.png | 9 |
| 6c | `ark__prop_kubbekona__prop_tannfe__prop_tannglass__prop_l....png` | mal_ni_ting.png | 5 |
| 6d | `prop_damer.png` |  | 1 |
| 6e | `prop_kjempe.png` |  | 1 |
| 7a | `figur_blank_m.png` | mal_figur.png | 6 |
| 7b | `figur_ansikt_m.png` | mal_figur.png | 6 |
| 7c | `figur_blank_k.png` | mal_figur.png | 6 |
| 7d | `figur_ansikt_k.png` | mal_figur.png | 6 |
| 7e | `ark__drom_vindu_sno__drom_vindu_rim__drom_vindu_regn__dr....png` | mal_ni_ting.png | 9 |
| 7f | `ark__drom_lue__drom_ur__drom_symaskin__drom_kopp__drom_s....png` | mal_ni_ting.png | 9 |
| 7g | `ark__drom_bord__drom_brev__drom_foto__drom_notat__drom_s....png` | mal_ni_ting.png | 9 |
| 7h | `drom_hest.png` |  | 1 |
| 8a | `ark__prop_elektrostol__prop_spole__prop_rontgen__prop_ly....png` | mal_ni_ting.png | 9 |
| 8b | `ark__prop_piano__prop_grammofon__prop_lenestol__prop_kor....png` | mal_ni_ting.png | 9 |
| 8c | `ark__prop_komfyr__prop_gryte__prop_kjottkrok__prop_kjele....png` | mal_ni_ting.png | 9 |
| 8d | `ark__prop_plantebord__prop_kjempeplante__prop_vannkanne_....png` | mal_ni_ting.png | 9 |
| 8e | `ark__prop_engel__prop_grav__prop_statue__prop_fontene__p....png` | mal_ni_ting.png | 9 |
| 8f | `ark__prop_baal__prop_stubbe__prop_sopp__prop_stein__prop....png` | mal_ni_ting.png | 9 |
| 8g | `prop_utgang.png` |  | 1 |
| 8h | `prop_vindu.png` |  | 1 |
| 8i | `prop_porten.png` |  | 1 |
| 8j | `prop_langbord.png` |  | 1 |
| 8k | `prop_tre.png` |  | 1 |
| 8l | `prop_bjork.png` |  | 1 |
| 8m | `prop_bjork_dod.png` |  | 1 |
| 8n | `prop_lysthus.png` |  | 1 |
| 9a | `hoder_pasienter.png` | mal_hoder.png |  |
| 9b | `hoder_kultister.png` | mal_hoder.png |  |
| 9c | `kropper_pasienter.png` | mal_kropper.png |  |
| 9d | `kropper_kultister.png` | mal_kropper.png |  |
| 9e | `hatter_kultister.png` | mal_hatter_og_har.png |  |
| 9f | `tilbehor_ansikt.png` | mal_tilbehor.png |  |
| 9g | `har_personale.png` | mal_hatter_og_har.png |  |
| 9h | `kropper_personale.png` | mal_kropper.png |  |
| 9i | `hatter_pasienter.png` | mal_hatter_og_har.png |  |
| 9j | `har_pasienter.png` | mal_hatter_og_har.png |  |
| 9k | `har_kultister.png` | mal_hatter_og_har.png |  |
| 10a | `ark__historie_1__historie_2__historie_3__historie_4__his....png` | mal_ni_ting.png | 9 |
| 10b | `prop_forstander.png` |  | 1 |
| 10c | `prop_venterom.png` |  | 1 |
| 10d | `prop_skrin.png` |  | 1 |
