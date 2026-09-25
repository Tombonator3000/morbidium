# Tegneliste 4: HUD og menyer

Laget av `tools/lag_tegnelister.py`. Ikke rediger for hånd; kjør skriptet på nytt når bilder er levert, så forsvinner det som er ferdig.

UI-settet (del G i `DESIGN_BRIEF.md`). Ingen tekst i noen av bildene. Panelet, knappen, kortet, skiltet og utklippstavla strekkes i ni deler, så all pynt må ligge ytterst og midten være jevn. Ringene må være helt gjennomsiktige i midten. Hjertene og ringene gir mest for minst.

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

## 4a. Hjerter og ikoner («ni ting»-ark)

Filnavn: `ark__ui_hjerte_full__ui_hjerte_halv__ui_hjerte_tom__ui_ikon_journal__ui_ikon_pause.png`

Mal: `maler/mal_ni_ting.png`

Gir: 1 `ui_hjerte_full`, 2 `ui_hjerte_halv`, 3 `ui_hjerte_tom`, 4 `ui_ikon_journal`, 5 `ui_ikon_pause`

```text
Using the attached template (mal_ni_ting.png), draw five separate items, one per cell, read left to right, top to bottom. Use only the first five cells and leave the rest empty.
Each item sits on the short line with its bottom touching the + mark. Icons, cards and loose body parts are centered in the cell instead. Things that lie flat on the ground are drawn seen from straight above. Keep every drawing inside its own cell. Do not draw the magenta guides.
These are HUD icons: centered in their cells, flat and seen straight on. The three hearts must be the same heart.
Items:
1) UI ICON: a full red cartoon heart with an ink outline and a small highlight.
2) UI ICON: the same heart, left half red and right half empty grey.
3) UI ICON: the same heart, empty and dark grey.
4) UI ICON: an open leather-bound book, simple and bold.
5) UI ICON: two thick vertical pause bars drawn in ink.
```

## 4b. Gullringen rundt portrettet (UI-bilde)

Filnavn: `ui_ring_portrett.png`

Gir: `ui_ring_portrett`

```text
UI element for the HUD of a 1920s sanatorium game, same ink-and-cel style: UI RING: a thick round gold frame with rivets and an ink outline, the center COMPLETELY TRANSPARENT (a portrait goes inside). Flat and seen straight on, no perspective, no text, no shadow outside the shape, transparent background.
Format: 1024 x 1024 (square).
```

## 4c. Kompassringen rundt kartet (UI-bilde)

Filnavn: `ui_ring_kart.png`

Gir: `ui_ring_kart`

```text
UI element for the HUD of a 1920s sanatorium game, same ink-and-cel style: UI RING: a brass compass ring with a small N at the top and four knobs, the center COMPLETELY TRANSPARENT (the map goes inside). Flat and seen straight on, no perspective, no text, no shadow outside the shape, transparent background.
Format: 1024 x 1024 (square).
```

## 4d. Panelet (UI-bilde)

Filnavn: `ui_panel.png`

Gir: `ui_panel`

```text
UI element for the HUD of a 1920s sanatorium game, same ink-and-cel style: UI 9-SLICE PANEL: an empty parchment panel with a slightly torn edge, dark ink outline and small brass pins in the four corners. Nothing inside. Keep all detail within the outer 10 % so the middle can be stretched. Flat and seen straight on, no perspective, no text, no shadow outside the shape, transparent background.
Format: 1536 x 1024 (landscape).
```

## 4e. Knappen (UI-bilde)

Filnavn: `ui_knapp.png`

Gir: `ui_knapp`

```text
UI element for the HUD of a 1920s sanatorium game, same ink-and-cel style: UI 9-SLICE BUTTON: a small empty parchment tile with a thick ink outline and a tiny brass pin in the top right corner. Nothing inside. Flat and seen straight on, no perspective, no text, no shadow outside the shape, transparent background.
Format: 1024 x 1024 (square).
```

## 4f. Kortrammen (UI-bilde)

Filnavn: `ui_kort.png`

Gir: `ui_kort`

```text
UI element for the HUD of a 1920s sanatorium game, same ink-and-cel style: UI 9-SLICE ABILITY CARD FRAME: an empty cream paper card with faint blue ruled lines, rounded corners and a brass pin at the top center. No picture, no text. Flat and seen straight on, no perspective, no text, no shadow outside the shape, transparent background.
Format: 1024 x 1536 (portrait).
```

## 4g. Romskiltet (UI-bilde)

Filnavn: `ui_skilt.png`

Gir: `ui_skilt`

```text
UI element for the HUD of a 1920s sanatorium game, same ink-and-cel style: UI 9-SLICE SIGN: an empty wide parchment plaque with brass screws at both ends, for the room name. No text. Flat and seen straight on, no perspective, no text, no shadow outside the shape, transparent background.
Format: 1536 x 1024 (landscape).
```

## 4h. Utklippstavla (UI-bilde)

Filnavn: `ui_utklipp.png`

Gir: `ui_utklipp`

```text
UI element for the HUD of a 1920s sanatorium game, same ink-and-cel style: UI 9-SLICE CLIPBOARD: an empty brown wooden clipboard with a brass clamp at the top center and a sheet of lined paper, seen straight on. No text. Flat and seen straight on, no perspective, no text, no shadow outside the shape, transparent background.
Format: 1024 x 1536 (portrait).
```

## 4i. Frenologihodet i Sinnets kart (UI-bilde)

Filnavn: `ui_hode.png`

Gir: `ui_hode`

```text
UI element for the HUD of a 1920s sanatorium game, same ink-and-cel style: UI: a phrenology head in profile facing LEFT, bald, with neck and shoulders cut off, a pale parchment-colored bust with ink outlines. NO brain regions and NO text (the game draws the four regions and labels on top). Square image, the skull fills the upper two thirds. Flat and seen straight on, no perspective, no text, no shadow outside the shape, transparent background.
Format: 1024 x 1024 (square).
```
