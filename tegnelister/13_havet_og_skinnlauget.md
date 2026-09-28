# Tegneliste 13: Havet under huset og Skinnlauget

Laget av `tools/lag_tegnelister.py`. Ikke rediger for hånd; kjør skriptet på nytt når bilder er levert, så forsvinner det som er ferdig.

De nye fiendene fra runde 5, og Kraken, den nye sjefen. De er tegnet av koden nå og kan spilles uten bildene, så lista kan tas når det passer. Havet under huset (Avløpsarmen, Kapellanen og Draugpleieren) er Lovecraft i 1923: tentakler, blekk og sjøvann. Skinnlauget av 1887 (Lærlingen, Klokkeren, Holdningssøsteren og Oldermann Nålepute) er et høflig lærlaug av håndverkere med reimer, spenner og dagsorden. Parodien ligger i tonen: ikke noe seksuelt, ikke fetisjutstyr og ingenting hentet fra filmene. Referansebildet viser dagens tegning.

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

## 13a. laerling (figurark)

Filnavn: `figur_laerling.png`

Mal: `maler/mal_figur.png`

Gir: `hode_laerling_f/b/s` og `kropp_laerling_f/b/s`

Referanse (last opp sammen med malen): `tegnelister/referanse/ref_figur_laerling.png`

![Dagens tegning](referanse/ref_figur_laerling.png)

```text
Using the attached template (mal_figur.png), draw the character described below in a 3 x 2 grid.
Top row: the HEAD ONLY (no neck, no body): front view, back view, and side view facing right. Each head fills the dashed circle and rests on the + mark.
Bottom row: the TORSO AND HIPS ONLY (no head, no arms, no legs), fitted to the dashed shape. The shoulders must sit on the magenta dots, because the game attaches the arms there.
Keep every drawing inside its own cell. Do not draw the magenta guides.
Faces: rough, ugly and morbid, with crooked silhouettes, uneven eyes and teeth, heavy bags under the eyes, scraggly hair and rough ink lines with a little hatching. Grotesque and comic, but easy to recognize from every angle.
The second attached image shows the placeholder drawings the game uses today, in the same cells. Use it only to see what goes where and roughly how it is posed; redraw everything properly in our style.
Character: the Apprentice of the Leather Guild of 1887: a polite, eager young craftsman with round glasses and neat side-parted hair, a brown leather apron with cross-stitching, crossed leather straps over a white shirt, a few small steel hooks hanging from the apron; he looks proud of his work.
```

## 13b. klokker (figurark)

Filnavn: `figur_klokker.png`

Mal: `maler/mal_figur.png`

Gir: `hode_klokker_f/b/s` og `kropp_klokker_f/b/s`

Referanse (last opp sammen med malen): `tegnelister/referanse/ref_figur_klokker.png`

![Dagens tegning](referanse/ref_figur_klokker.png)

```text
Using the attached template (mal_figur.png), draw the character described below in a 3 x 2 grid.
Top row: the HEAD ONLY (no neck, no body): front view, back view, and side view facing right. Each head fills the dashed circle and rests on the + mark.
Bottom row: the TORSO AND HIPS ONLY (no head, no arms, no legs), fitted to the dashed shape. The shoulders must sit on the magenta dots, because the game attaches the arms there.
Keep every drawing inside its own cell. Do not draw the magenta guides.
Faces: rough, ugly and morbid, with crooked silhouettes, uneven eyes and teeth, heavy bags under the eyes, scraggly hair and rough ink lines with a little hatching. Grotesque and comic, but easy to recognize from every angle.
The second attached image shows the placeholder drawings the game uses today, in the same cells. Use it only to see what goes where and roughly how it is posed; redraw everything properly in our style.
Character: the Bell-Ringer of the Leather Guild: a small bald old man with very large ears and a grey fringe, a long dark red coat with brass buttons and a leather belt with small steel hooks, a patient, satisfied smile.
```

## 13c. holdning (figurark)

Filnavn: `figur_holdning.png`

Mal: `maler/mal_figur.png`

Gir: `hode_holdning_f/b/s` og `kropp_holdning_f/b/s`

Referanse (last opp sammen med malen): `tegnelister/referanse/ref_figur_holdning.png`

![Dagens tegning](referanse/ref_figur_holdning.png)

```text
Using the attached template (mal_figur.png), draw the character described below in a 3 x 2 grid.
Top row: the HEAD ONLY (no neck, no body): front view, back view, and side view facing right. Each head fills the dashed circle and rests on the + mark.
Bottom row: the TORSO AND HIPS ONLY (no head, no arms, no legs), fitted to the dashed shape. The shoulders must sit on the magenta dots, because the game attaches the arms there.
Keep every drawing inside its own cell. Do not draw the magenta guides.
Faces: rough, ugly and morbid, with crooked silhouettes, uneven eyes and teeth, heavy bags under the eyes, scraggly hair and rough ink lines with a little hatching. Grotesque and comic, but easy to recognize from every angle.
The second attached image shows the placeholder drawings the game uses today, in the same cells. Use it only to see what goes where and roughly how it is posed; redraw everything properly in our style.
Character: the Posture Sister of the Leather Guild: a strict, upright nurse in a grey dress with a starched collar, a stiff leather posture brace with many laced straps and small buckles over the dress, hair in a tight bun, a thin satisfied smile.
```

## 13d. oldermann (figurark)

Filnavn: `figur_oldermann.png`

Mal: `maler/mal_figur.png`

Gir: `hode_oldermann_f/b/s` og `kropp_oldermann_f/b/s`

Referanse (last opp sammen med malen): `tegnelister/referanse/ref_figur_oldermann.png`

![Dagens tegning](referanse/ref_figur_oldermann.png)

```text
Using the attached template (mal_figur.png), draw the character described below in a 3 x 2 grid.
Top row: the HEAD ONLY (no neck, no body): front view, back view, and side view facing right. Each head fills the dashed circle and rests on the + mark.
Bottom row: the TORSO AND HIPS ONLY (no head, no arms, no legs), fitted to the dashed shape. The shoulders must sit on the magenta dots, because the game attaches the arms there.
Keep every drawing inside its own cell. Do not draw the magenta guides.
Faces: rough, ugly and morbid, with crooked silhouettes, uneven eyes and teeth, heavy bags under the eyes, scraggly hair and rough ink lines with a little hatching. Grotesque and comic, but easy to recognize from every angle.
The second attached image shows the placeholder drawings the game uses today, in the same cells. Use it only to see what goes where and roughly how it is posed; redraw everything properly in our style.
Character: Alderman Pincushion, master of the Leather Guild: a stout old gentleman in a long black leather frock coat with a sash of guild medals, big mutton chops, a walrus moustache and a lorgnette; on his bald crown sits a red velvet pincushion full of pins, held on by a strap under the chin (the pins are only in the cushion, never in him).
```

## 13e. kapellan (figurark)

Filnavn: `figur_kapellan.png`

Mal: `maler/mal_figur.png`

Gir: `hode_kapellan_f/b/s` og `kropp_kapellan_f/b/s`

Referanse (last opp sammen med malen): `tegnelister/referanse/ref_figur_kapellan.png`

![Dagens tegning](referanse/ref_figur_kapellan.png)

```text
Using the attached template (mal_figur.png), draw the character described below in a 3 x 2 grid.
Top row: the HEAD ONLY (no neck, no body): front view, back view, and side view facing right. Each head fills the dashed circle and rests on the + mark.
Bottom row: the TORSO AND HIPS ONLY (no head, no arms, no legs), fitted to the dashed shape. The shoulders must sit on the magenta dots, because the game attaches the arms there.
Keep every drawing inside its own cell. Do not draw the magenta guides.
Faces: rough, ugly and morbid, with crooked silhouettes, uneven eyes and teeth, heavy bags under the eyes, scraggly hair and rough ink lines with a little hatching. Grotesque and comic, but easy to recognize from every angle.
The second attached image shows the placeholder drawings the game uses today, in the same cells. Use it only to see what goes where and roughly how it is posed; redraw everything properly in our style.
Character: the Chaplain from the sea under the house: a knee-high curate in a black cassock with a white Lutheran ruff, a squid-dome head with sad yellow eyes, a beard of short tentacles over the ruff, a collection box and a drain-cover medallion on a chain.
```

## 13f. draug (figurark)

Filnavn: `figur_draug.png`

Mal: `maler/mal_figur.png`

Gir: `hode_draug_f/b/s` og `kropp_draug_f/b/s`

Referanse (last opp sammen med malen): `tegnelister/referanse/ref_figur_draug.png`

![Dagens tegning](referanse/ref_figur_draug.png)

```text
Using the attached template (mal_figur.png), draw the character described below in a 3 x 2 grid.
Top row: the HEAD ONLY (no neck, no body): front view, back view, and side view facing right. Each head fills the dashed circle and rests on the + mark.
Bottom row: the TORSO AND HIPS ONLY (no head, no arms, no legs), fitted to the dashed shape. The shoulders must sit on the magenta dots, because the game attaches the arms there.
Keep every drawing inside its own cell. Do not draw the magenta guides.
Faces: rough, ugly and morbid, with crooked silhouettes, uneven eyes and teeth, heavy bags under the eyes, scraggly hair and rough ink lines with a little hatching. Grotesque and comic, but easy to recognize from every angle.
The second attached image shows the placeholder drawings the game uses today, in the same cells. Use it only to see what goes where and roughly how it is posed; redraw everything properly in our style.
Character: the Drowned Orderly of 1887: a pale blue-green hospital orderly in a soaked white uniform with seaweed and barnacles, hollow sad eyes, water dripping, carrying an old enamel bedpan.
```

## 13g. avlopsarm_tupp (enkeltbilde)

Filnavn: `avlopsarm_tupp.png`

Gir: `avlopsarm_tupp`

Referanse (last opp sammen med prompten): `tegnelister/referanse/ref_avlopsarm_tupp.png`

![Dagens tegning](referanse/ref_avlopsarm_tupp.png)

```text
Draw ONE image, 1024 x 1024 (square): the tip of a dark sea-green tentacle rising from a drain, curling, with pale suckers underneath and ONE lidless yellow eye with a goat pupil near the tip.
It rises straight up out of a round drain in the floor; draw only the upper part of the tentacle with the eye.
Exactly one object, centered and fully visible, not cropped. Transparent background, no ground shadow, no text, no frame.
The attached image shows the placeholder the game uses today. Use it only to see what it is; redraw it properly in our style.
```

## 13h. Kraken («ni ting»-ark)

Filnavn: `ark__kraken_kappe__kraken_oye__kraken_pupill__kraken_nebb__kraken_skum__kraken_bandasje.png`

Mal: `maler/mal_ni_ting.png`

Gir: 1 `kraken_kappe`, 2 `kraken_oye`, 3 `kraken_pupill`, 4 `kraken_nebb`, 5 `kraken_skum`, 6 `kraken_bandasje`

Referanse (last opp sammen med malen): `tegnelister/referanse/ref_kraken.png`

![Dagens tegning](referanse/ref_kraken.png)

```text
Using the attached template (mal_ni_ting.png), draw six separate items, one per cell, read left to right, top to bottom. Use only the first six cells and leave the rest empty.
Each item sits on the short line with its bottom touching the + mark. Icons, cards and loose body parts are centered in the cell instead. Things that lie flat on the ground are drawn seen from straight above. Keep every drawing inside its own cell. Do not draw the magenta guides.
These are the separate parts of one giant sea monster boss; the game puts the eye, pupil and beak on the mantle.
The second attached image shows the placeholder drawings the game uses today, in the same cells. Use it only to see what goes where and roughly how it is posed; redraw everything properly in our style.
Items:
1) the Kraken (Pontoppidan 1752): a huge, tall, bulging octopus mantle rising out of dark water, mauve-pink skin with dark patches and pale spots, two fins at the top like ears, barnacles and seaweed; front view, no eye and no beak (they are separate parts).
2) one huge pale yellow eye of the Kraken, round, wet and bulging, with a dark lid rim, WITHOUT the pupil.
3) the horizontal goat-like pupil of the Kraken, black with a thin amber rim, alone.
4) the Kraken beak: a big dark brown parrot-like beak, slightly open with a dark red mouth inside.
5) a ring of white sea foam and splashes around something rising out of dark water, seen from the front and a little above.
6) a dirty hospital bandage wrapped around a tentacle, with a safety pin, loose ends hanging.
```

## 13i. Våpnene til Skinnlauget og Kapellanen («ni ting»-ark)

Filnavn: `ark__vaapen_reim__vaapen_bjelle__vaapen_tommestokk__vaapen_klubbe__vaapen_avgud.png`

Mal: `maler/mal_ni_ting.png`

Gir: 1 `vaapen_reim`, 2 `vaapen_bjelle`, 3 `vaapen_tommestokk`, 4 `vaapen_klubbe`, 5 `vaapen_avgud`

Referanse (last opp sammen med malen): `tegnelister/referanse/ref_vaapen_nye.png`

![Dagens tegning](referanse/ref_vaapen_nye.png)

```text
Using the attached template (mal_ni_ting.png), draw five separate items, one per cell, read left to right, top to bottom. Use only the first five cells and leave the rest empty.
Each item sits on the short line with its bottom touching the + mark. Icons, cards and loose body parts are centered in the cell instead. Things that lie flat on the ground are drawn seen from straight above. Keep every drawing inside its own cell. Do not draw the magenta guides.
Each weapon alone in its cell, held by nobody, handle down.
The second attached image shows the placeholder drawings the game uses today, in the same cells. Use it only to see what goes where and roughly how it is posed; redraw everything properly in our style.
Items:
1) a long brown leather strap with a polished brass buckle at the end (a weapon).
2) a small silver handbell with a black wooden handle.
3) a yellow wooden folding ruler, half unfolded.
4) a heavy dark wooden gavel with a brass band.
5) a small grey-green soapstone idol of a squatting squid-headed figure with folded wings.
```
