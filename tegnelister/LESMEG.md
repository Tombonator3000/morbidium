# Tegnelister til ChatGPT

Laget av `tools/lag_tegnelister.py` fra `assets/manifest.json`. Ikke rediger for hånd; kjør skriptet på nytt når bilder er levert.

Status: 611 av 636 bilder i manifestet er levert. De 25 som mangler, er samlet i 25 ark og bilder fordelt på 2 lister, én ChatGPT-samtale per liste. I tillegg kommer 0 delark til oppskriftssystemet.

Hvert ark er én PNG. Et figurark gir seks bilder (hode og kropp fra tre kanter), et «ni ting»-ark opptil ni. Store ting som trær, porter og sjefskropper tegnes som enkeltbilder, fordi en rute på malen blir for liten til dem. Referansebildene i `referanse/` viser dagens kodetegninger i samme rutenett som malen; last dem opp sammen med malen, så ser ChatGPT hva som skal i hver rute.

| Liste | Innhold | Ark | Bilder |
|---|---|---|---|
| [11. Veggene](11_vegger.md) | Panelveggen i Underetasjen, Panelveggen i Kjelleren, Panelveggen i Dypet, Den polstrede veggen, Treveggen, Paviljongveggen, ... | 9 | 9 |
| [12. Gulvene inne](12_gulv.md) | Plankegulvet, Sjakkgulvet, Sjakkgulvet i Underetasjen, Sjakkgulvet i Kjelleren, Sjakkgulvet i Dypet, Plankegulvet i Underetasjen, ... | 16 | 16 |

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
| 11a | `vegg_panel_3.png` |  | 1 |
| 11b | `vegg_panel_4.png` |  | 1 |
| 11c | `vegg_panel_6.png` |  | 1 |
| 11d | `vegg_polstret.png` |  | 1 |
| 11e | `vegg_tre.png` |  | 1 |
| 11f | `vegg_paviljong.png` |  | 1 |
| 11g | `vegg_tommer.png` |  | 1 |
| 11h | `vegg_gjerde.png` |  | 1 |
| 11i | `vegg_forheng.png` |  | 1 |
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
| 12p | `gulv_sikksakk.png` |  | 1 |
