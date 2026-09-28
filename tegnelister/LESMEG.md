# Tegnelister til ChatGPT

Laget av `tools/lag_tegnelister.py` fra `assets/manifest.json`. Ikke rediger for hånd; kjør skriptet på nytt når bilder er levert.

Status: 544 av 588 bilder i manifestet er levert. De 44 som mangler, er samlet i 44 ark og bilder fordelt på 2 lister, én ChatGPT-samtale per liste. I tillegg kommer 0 delark til oppskriftssystemet.

Hvert ark er én PNG. Et figurark gir seks bilder (hode og kropp fra tre kanter), et «ni ting»-ark opptil ni. Store ting som trær, porter og sjefskropper tegnes som enkeltbilder, fordi en rute på malen blir for liten til dem. Referansebildene i `referanse/` viser dagens kodetegninger i samme rutenett som malen; last dem opp sammen med malen, så ser ChatGPT hva som skal i hver rute.

| Liste | Innhold | Ark | Bilder |
|---|---|---|---|
| [11. Veggene og bakken ute](11_vegger_og_bakken.md) | Panelveggen, Flisveggen, Murveggen, Hekken, Bakken i Parken, Panelveggen i Underetasjen, ... | 20 | 20 |
| [12. Gulvene](12_gulv.md) | Plankegulvet, Sjakkgulvet, Sjakkgulvet i Underetasjen, Sjakkgulvet i Kjelleren, Sjakkgulvet i Dypet, Plankegulvet i Underetasjen, ... | 24 | 24 |

Rekkefølgen følger «Neste bestilling» i `DESIGN_BRIEF.md`: fiendene som synes mest først, møblene sist. Historien (liste 10) er ny og kort, bare to bestillinger, og kan tas når som helst. Liste 11 og 12 er teksturer til veggene, bakken ute og gulvene. De har sin egen stilblokk (den står i lista), fordi en tekstur skal dekke hele bildet, og gulvene i liste 12 venter til gulvet tegnes med egne fliser i spillet. Det som ikke har bilde ennå, tegnes av koden som før, så spillet får aldri hull.

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
| 11a | `vegg_panel.png` |  | 1 |
| 11b | `vegg_fliser.png` |  | 1 |
| 11c | `vegg_mur.png` |  | 1 |
| 11d | `vegg_hekk.png` |  | 1 |
| 11e | `bakke_park.png` |  | 1 |
| 11f | `vegg_panel_3.png` |  | 1 |
| 11g | `vegg_panel_4.png` |  | 1 |
| 11h | `vegg_panel_6.png` |  | 1 |
| 11i | `vegg_tapet.png` |  | 1 |
| 11j | `vegg_stein.png` |  | 1 |
| 11k | `vegg_polstret.png` |  | 1 |
| 11l | `vegg_tre.png` |  | 1 |
| 11m | `vegg_paviljong.png` |  | 1 |
| 11n | `vegg_tommer.png` |  | 1 |
| 11o | `vegg_skog.png` |  | 1 |
| 11p | `vegg_steinmur.png` |  | 1 |
| 11q | `vegg_gjerde.png` |  | 1 |
| 11r | `vegg_ruin.png` |  | 1 |
| 11s | `vegg_forheng.png` |  | 1 |
| 11t | `bakke_skog.png` |  | 1 |
| 12a | `gulv_planker.png` |  | 1 |
| 12b | `gulv_sjakk.png` |  | 1 |
| 12c | `gulv_sjakk_3.png` |  | 1 |
| 12d | `gulv_sjakk_4.png` |  | 1 |
| 12e | `gulv_sjakk_6.png` |  | 1 |
| 12f | `gulv_planker_3.png` |  | 1 |
| 12g | `gulv_planker_4.png` |  | 1 |
| 12h | `gulv_planker_6.png` |  | 1 |
| 12i | `gulv_tre.png` |  | 1 |
| 12j | `gulv_parkett.png` |  | 1 |
| 12k | `gulv_linoleum.png` |  | 1 |
| 12l | `gulv_fliser.png` |  | 1 |
| 12m | `gulv_sekskant.png` |  | 1 |
| 12n | `gulv_stein.png` |  | 1 |
| 12o | `gulv_betong.png` |  | 1 |
| 12p | `gulv_brostein.png` |  | 1 |
| 12q | `gulv_gress.png` |  | 1 |
| 12r | `gulv_grus.png` |  | 1 |
| 12s | `gulv_jord.png` |  | 1 |
| 12t | `gulv_mose.png` |  | 1 |
| 12u | `gulv_sti.png` |  | 1 |
| 12v | `gulv_myr.png` |  | 1 |
| 12w | `gulv_is.png` |  | 1 |
| 12x | `gulv_sikksakk.png` |  | 1 |
