# Tegneliste 9: Delark til oppskriftssystemet

Laget av `tools/lag_tegnelister.py`. Ikke rediger for hånd; kjør skriptet på nytt når bilder er levert, så forsvinner det som er ferdig.

Løse hoder, hatter, frisyrer, ansiktstilbehør og kropper som spillet setter sammen til nye fiender (del B i `DESIGN_BRIEF.md`). Seriene har navnene spillet leter etter: `personale` brukes av pleiere, oppassere, byråkrater og narkoseleger, `kultister` av kultistene og `pasienter` av pasientfiendene. Kropper for pleiere og oppassere heter `uniformer` (levert). Ansiktstilbehør i serien `ansikt` kan havne på alle.

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

## 9a. Pasienthoder (delark)

Filnavn: `hoder_pasienter.png`

Mal: `maler/mal_hoder.png`

Gir: løse deler i `assets/deler/hode/`

```text
Using the attached template (mal_hoder.png), draw three different heads for patients, one per row, each in front view, back view and side view facing right.
Faces: rough, ugly and morbid, with crooked silhouettes, uneven eyes and teeth, heavy bags under the eyes, scraggly hair and rough ink lines with a little hatching. Grotesque and comic, but easy to recognize from every angle.
Keep every drawing inside its own cell. Do not draw the magenta guides.
Items: 1) a head wrapped in a dirty bandage with one bloodshot eye showing. 2) a bald head with a row of black stitches across the scalp. 3) a confused face with bulging, wide-open eyes and a crooked open mouth.
```

## 9b. Kultisthoder (delark)

Filnavn: `hoder_kultister.png`

Mal: `maler/mal_hoder.png`

Gir: løse deler i `assets/deler/hode/`

```text
Using the attached template (mal_hoder.png), draw three different heads for gloomy teenage cultists, one per row, each in front view, back view and side view facing right.
Faces: rough, ugly and morbid, with crooked silhouettes, uneven eyes and teeth, heavy bags under the eyes, scraggly hair and rough ink lines with a little hatching. Grotesque and comic, but easy to recognize from every angle.
Keep every drawing inside its own cell. Do not draw the magenta guides.
Items: 1) heavy black eyeliner and a sulky pout. 2) fake vampire fangs and a smug little grin. 3) very pale, with tears painted on the cheeks.
```

## 9c. Pasientklær (delark)

Filnavn: `kropper_pasienter.png`

Mal: `maler/mal_kropper.png`

Gir: løse deler i `assets/deler/kropp/`

```text
Using the attached template (mal_kropper.png), draw three different outfits for patients, one per row, each in front view, back view and side view facing right.
Torso and hips only, shoulders on the magenta dots, no arms, no legs, no head.
Keep every drawing inside its own cell. Do not draw the magenta guides.
Draw all fabric in light neutral grey (around #d8d8d8) with a darker grey shade, so the game can dye it. Keep skin, metal, leather and paper in their real colors.
Items: 1) a hospital gown with ties. 2) a canvas straitjacket with leather straps. 3) a bathrobe with a belt.
```

## 9d. Kultistklær (delark)

Filnavn: `kropper_kultister.png`

Mal: `maler/mal_kropper.png`

Gir: løse deler i `assets/deler/kropp/`

```text
Using the attached template (mal_kropper.png), draw three different outfits for gloomy teenage cultists, one per row, each in front view, back view and side view facing right.
Torso and hips only, shoulders on the magenta dots, no arms, no legs, no head.
Keep every drawing inside its own cell. Do not draw the magenta guides.
Draw all fabric in light neutral grey (around #d8d8d8) with a darker grey shade, so the game can dye it. Keep skin, metal, leather and paper in their real colors.
Items: 1) a black robe with four leather belts. 2) a long leather coat with chains. 3) a velvet shirt with a white ruff collar.
```

## 9e. Kultisthatter (delark)

Filnavn: `hatter_kultister.png`

Mal: `maler/mal_hatter_og_har.png`

Gir: løse deler i `assets/deler/hatt/`

```text
Using the attached template (mal_hatter_og_har.png), draw three different hats for gloomy teenage cultists, one per row, each in front view, back view and side view facing right.
The dashed circle is the head. Draw ONLY the hat, fitted exactly to that head, not the head itself. Leave the back view empty for accessories that only show from the front.
Keep every drawing inside its own cell. Do not draw the magenta guides.
Draw all fabric in light neutral grey (around #d8d8d8) with a darker grey shade, so the game can dye it. Keep skin, metal, leather and paper in their real colors.
Items: 1) a tall pointed hood. 2) a battered top hat with a small skull on the band. 3) a crown of dripping candles.
```

## 9f. Ansiktstilbehør (delark)

Filnavn: `tilbehor_ansikt.png`

Mal: `maler/mal_tilbehor.png`

Gir: løse deler i `assets/deler/tilbehor/`

```text
Using the attached template (mal_tilbehor.png), draw three different face accessories, one per row, each in front view, back view and side view facing right.
The dashed circle is the head. Draw ONLY the accessory, fitted exactly to that head, not the head itself. Leave the back view empty for accessories that only show from the front.
Keep every drawing inside its own cell. Do not draw the magenta guides.
Items: 1) round wire glasses. 2) a white surgical mask. 3) a 1920s rubber gas mask with round eyepieces and a filter.
```

## 9g. Frisyrer til personalet (delark)

Filnavn: `har_personale.png`

Mal: `maler/mal_hatter_og_har.png`

Gir: løse deler i `assets/deler/har/`

```text
Using the attached template (mal_hatter_og_har.png), draw three different hairstyles for hospital staff, one per row, each in front view, back view and side view facing right.
The dashed circle is the head. Draw ONLY the hair, fitted exactly to that head, not the head itself. Leave the back view empty for accessories that only show from the front.
Keep every drawing inside its own cell. Do not draw the magenta guides.
Items: 1) a tight bun. 2) hair slicked back with oil and a sharp parting. 3) short, messy grey hair.
```

## 9h. Klær til byråkrater og leger (delark)

Filnavn: `kropper_personale.png`

Mal: `maler/mal_kropper.png`

Gir: løse deler i `assets/deler/kropp/`

```text
Using the attached template (mal_kropper.png), draw three different outfits for office clerks and doctors, one per row, each in front view, back view and side view facing right.
Torso and hips only, shoulders on the magenta dots, no arms, no legs, no head.
Keep every drawing inside its own cell. Do not draw the magenta guides.
Draw all fabric in light neutral grey (around #d8d8d8) with a darker grey shade, so the game can dye it. Keep skin, metal, leather and paper in their real colors.
Items: 1) a black suit with a red tie. 2) a green surgical gown with an apron. 3) a grey three-piece suit with a watch chain.
```

## 9i. Pasienthatter (delark)

Filnavn: `hatter_pasienter.png`

Mal: `maler/mal_hatter_og_har.png`

Gir: løse deler i `assets/deler/hatt/`

```text
Using the attached template (mal_hatter_og_har.png), draw three different hats for patients, one per row, each in front view, back view and side view facing right.
The dashed circle is the head. Draw ONLY the hat, fitted exactly to that head, not the head itself. Leave the back view empty for accessories that only show from the front.
Keep every drawing inside its own cell. Do not draw the magenta guides.
Draw all fabric in light neutral grey (around #d8d8d8) with a darker grey shade, so the game can dye it. Keep skin, metal, leather and paper in their real colors.
Items: 1) a folded newspaper hat. 2) an enamel bedpan worn as a helmet. 3) a striped nightcap with a pompom.
```

## 9j. Pasientfrisyrer (delark)

Filnavn: `har_pasienter.png`

Mal: `maler/mal_hatter_og_har.png`

Gir: løse deler i `assets/deler/har/`

```text
Using the attached template (mal_hatter_og_har.png), draw three different hairstyles for patients, one per row, each in front view, back view and side view facing right.
The dashed circle is the head. Draw ONLY the hair, fitted exactly to that head, not the head itself. Leave the back view empty for accessories that only show from the front.
Keep every drawing inside its own cell. Do not draw the magenta guides.
Items: 1) wild uncombed hair sticking out in all directions. 2) a patchy shaved head with stubble. 3) long, greasy hair.
```

## 9k. Kultistfrisyrer (delark)

Filnavn: `har_kultister.png`

Mal: `maler/mal_hatter_og_har.png`

Gir: løse deler i `assets/deler/har/`

```text
Using the attached template (mal_hatter_og_har.png), draw three different hairstyles for gloomy teenage cultists, one per row, each in front view, back view and side view facing right.
The dashed circle is the head. Draw ONLY the hair, fitted exactly to that head, not the head itself. Leave the back view empty for accessories that only show from the front.
Keep every drawing inside its own cell. Do not draw the magenta guides.
Items: 1) a long black fringe covering one eye. 2) teased black hair with a white stripe. 3) a greasy black ponytail.
```
