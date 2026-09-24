# Morbidium: designbrief for ChatGPT

Denne briefen forklarer hva ChatGPT skal tegne til Morbidium, og hvordan bildene må se ut for at Claude kan bruke dem uten manuelt arbeid. Den detaljerte lista over hver enkelt bildedel spillet bruker i dag, ligger i `ART_BRIEF.md`.

## Arbeidsdelingen

- **ChatGPT** tegner. Bare bilder, ingen kode.
- **Tom** laster bildene opp til `gpt-grafikk/` i repoet, eller i chatten med Claude.
- **Claude** klipper, renser, plasserer og bygger bildene inn i spillet (`tools/skjaer_ark.py`, `tools/behandle_bilder.py`, `build.py`), og skriver all kode, lyd og musikk.

## Spillet i korte trekk

Sanntids action-roguelite i et norsk sanatorium fra 1920-tallet. Lovecraft og Hellraiser, men med mørk humor som gjør narr av edgelords. Kameraet ser ned på rommene fra omtrent 50 grader, som i Conan Chop Chop. Figurene er 2D-papirdukker: hode og kropp er tegnede flater, mens armer og bein tegnes av spillet som tykke, litt skjeve streker. Verdenen rundt kan bli 3D senere; figurene forblir 2D uansett.

## Stilblokk (lim inn først i hver ChatGPT-samtale)

```
Style: hand-drawn cartoon game art in the style of Conan Chop Chop mixed with Castle Crashers. Thick dark brown ink outlines (#2a1a14) with a slightly wobbly, hand-inked line that is heavier on the lower right. Flat colors with one darker cel-shade tone on the lower right and a small light highlight on the upper left. Light always comes from the upper left. Muted, warm 1920s palette. Setting: a 1920s Norwegian sanatorium, Lovecraftian and a bit gross, but with dark humor. Big heads, small bodies, chunky shapes. Keep this exact style, line thickness and palette for every image in this conversation.
Technical: PNG with a TRANSPARENT background. No text unless asked, no ground shadows, no frames, no background scenery.
```

## Faste regler for alle bilder

1. Gjennomsiktig bakgrunn. Går ikke det, bruk helt hvit bakgrunn.
2. Følg malen nøyaktig: én ting per rute, helt innenfor ruta, ingenting som overlapper naboruta.
3. Magentafargede hjelpelinjer i malene er bare veiledning. De skal helst ikke tegnes med, men verktøyet fjerner dem hvis de blir stående.
4. Samme strektykkelse og samme lys (fra øvre venstre) i alle bilder.
5. Aldri armer eller bein på figurdeler. Spillet tegner dem.
6. Ikke skygge på bakken. Spillet legger på skygge og lys selv.

## Malene

Malene ligger i `maler/`. Last opp riktig mal i ChatGPT sammen med prompten, og be den tegne oppå malen.

| Mal | Brukes til | Filnavn på resultatet |
|---|---|---|
| `mal_figur.png` | Én hel figur: hode øverst, kropp nederst, forfra, bakfra og fra siden | `figur_<navn>.png` |
| `mal_hoder.png` | Tre ulike hoder, hvert i tre vinkler | `hoder_<serie>.png` |
| `mal_hatter_og_har.png` | Tre hatter eller frisyrer, tilpasset hodesirkelen | `hatter_<serie>.png` eller `har_<serie>.png` |
| `mal_tilbehor.png` | Tre ting i ansiktet (briller, masker, pannespeil) | `tilbehor_<serie>.png` |
| `mal_kropper.png` | Tre kropper (antrekk), hver i tre vinkler | `kropper_<serie>.png` |
| `mal_ni_ting.png` | Ni valgfrie ting: kort, våpen, flasker, sko, plukk | `ark__<nøkkel>__<nøkkel>__...png` |

Sirkelen er hodet, krysset nederst er nakken (hodet hviler der). På kroppen markerer prikken øverst nakken, de to prikkene er skuldrene der spillet fester armene, og krysset nederst er hoftene der beina festes. Holder tegningen seg til dette, passer alle deler sammen.

## Arktyper og prompter

### A. Figurark: unike figurer

Spilleren, sjefer og tjenestefolk som alltid ser like ut.

```
Using the attached template (mal_figur.png), draw the character described below in a 3 x 2 grid.
Top row: the HEAD ONLY (no neck, no body): front view, back view, and side view facing right. Each head fills the dashed circle and rests on the + mark.
Bottom row: the TORSO AND HIPS ONLY (no head, no arms, no legs), fitted to the dashed shape. The shoulders must sit on the magenta dots, because the game attaches the arms there.
Keep every drawing inside its own cell. Do not draw the magenta guides.
Character: <beskrivelse>
```

Lagre som `figur_<navn>.png`, for eksempel `figur_pasient.png`. Navnene spillet kjenner i dag: `pasient`, `pleier`, `kultist`, `oppasser`, `kokk`, `hansen`, `olsen`, `bibliotekar`, `krok`, `rust`. Beskrivelser står i `ART_BRIEF.md` (runde 5).

### B. Delark: byggeklosser til uendelig mange fiender

Her tegnes løse deler som spillet setter sammen selv (se «Oppskriftssystemet» under).

```
Using the attached template (<malnavn>), draw three different <hodetyper / hatter / frisyrer / ansiktstilbehør / antrekk> for <gruppe>, one per row, each in front view, back view and side view facing right.
<For hatter, hår og tilbehør:> The dashed circle is the head. Draw ONLY the <hat / hair / accessory>, fitted exactly to that head, not the head itself. Leave the back view empty for accessories that only show from the front.
<For kropper:> Torso and hips only, shoulders on the magenta dots, no arms, no legs, no head.
Keep every drawing inside its own cell. Do not draw the magenta guides.
Items: 1) <...> 2) <...> 3) <...>
```

**Farging:** Til klær og hatter som skal finnes i mange farger, legg til: *«Draw all fabric in light neutral grey (around #d8d8d8) with a darker grey shade, so the game can dye it. Keep skin, metal, leather and paper in their real colors.»* Da kan spillet farge ett antrekk i hvilken som helst farge.

Forslag til første serier:

| Filnavn | Innhold |
|---|---|
| `hoder_personale.png` | rundt og slapt, firkantet kjeve, langt og tynt, alle med strengt blikk og lite hår |
| `hoder_pasienter.png` | bandasjert, skallet med sting, vidåpne øyne og forvirret |
| `hoder_kultister.png` | tung eyeliner og surmule, falske hoggtenner, blek med tårer malt på |
| `hatter_personale.png` | sykepleierlue med rødt kors, operasjonslue, pannebånd med legespeil (farges) |
| `hatter_kultister.png` | spiss hette, flosshatt med liten hodeskalle, krone av stearinlys |
| `har_diverse.png` | knute, sleikt bakover, bustete |
| `tilbehor_ansikt.png` | runde briller, operasjonsmaske, gassmaske fra 1920-tallet |
| `kropper_uniformer.png` | sykepleieruniform, legefrakk, oppasserdrakt (farges) |
| `kropper_pasienter.png` | sykehusskjorte, tvangstrøye, morgenkåpe (farges) |
| `kropper_kultister.png` | kappe med fire belter, skinnfrakk med kjettinger, fløyelsskjorte med pipekrage |

### C. Ni ting på ett ark

For kort, våpen, flasker, sko og plukk.

```
Using the attached template (mal_ni_ting.png), draw nine separate items, one per cell, read left to right, top to bottom. Each item sits on the short line with its bottom touching the + mark. Card illustrations are centered in the cell instead. Do not draw the magenta guides.
Items: 1) <...> 2) <...> ... 9) <...>
```

Filnavnet forteller spillet hva som er i hver rute, i samme rekkefølge, med to understreker mellom. Et eksempel:

`ark__kort_due__kort_lys__kort_skyggehand__kort_stempel__kort_brekning__kort_monolog__kort_hydro__kort_kappe__kort_skjema.png`

Bruk `_` for en rute som skal hoppes over. Alle nøklene finnes i `ART_BRIEF.md`.

### F. Kuriositeter: gjenstandene man plukker opp (som i The Binding of Isaac)

Spillet har 40 kuriositeter som stables og kombineres, åtte ukjente piller og et preparatglass de står i. Kodetegningene er plassholdere; dette er den runden som løfter spillet mest. Tegn dem som små, tydelige og groteske gjenstandsikoner, lesbare i 24 piksler, ni på hvert «ni ting»-ark:

```
Using the attached template (mal_ni_ting.png), draw nine separate item icons for a grotesque 1920s sanatorium roguelite, in the style of The Binding of Isaac item sprites but with our ink-and-cel style. One item per cell, centered, bold silhouette, readable at very small size. Do not draw the magenta guides.
Items: 1) <navn og beskrivelse> 2) ... 9) ...
```

Navn og beskrivelser står i `ART_BRIEF.md`, runde 1 (nøklene `kur_...`). Eksempel på filnavn for de ni første:

`ark__kur_tuberkulose__kur_bronkitt__kur_spyttkjertel__kur_magnet__kur_syl__kur_celledeling__kur_nitro__kur_kvikksolv__kur_frost.png`

### D. Teksturer og plakater (til vegger og gulv)

```
A seamless, tileable square texture for a game floor/wall: <beskrivelse>. Seen straight on, flat, even lighting, no perspective, no objects on it, edges must tile perfectly. Same hand-drawn cartoon style with ink lines.
```

Forslag: gulgrønne sjakkfliser, mintgrønne fliser for hydroterapien, lilla stein for kjelleren, falmet tapet, grønt brystpanel, tregulv i korridor. Plakater kan ha kort norsk tekst: «SMIL. DET ER OBLIGATORISK.», «IKKE MAT DUENE.».

### E. Portretter

Til medaljongen i HUD-en og tjenestepanelene: `portrett_<navn>.png`, kvadratisk, hode og skuldre forfra, gjennomsiktig bakgrunn.

## Oppskriftssystemet (uendelige fiender)

Designdokumentet beskriver figurer som oppskrifter, og delarkene over er byggeklossene. En fiende settes sammen av:

- **Rolle:** pleier, kultist, oppasser osv. Rollen bestemmer hvilke deler som er lov og hvordan fienden oppfører seg.
- **Deler:** ett hode, én hatt eller frisyre, ett tilbehør (valgfritt), én kropp og ett våpen, alle trukket fra rollens utvalg.
- **Tilpasning:** farge på klærne, litt større eller mindre hode og kropp, og elitemerker som lilla årer, glød eller et øye for mye.
- **Personlighet:** navn og replikker trekkes ut fra rollen og delene.

Med ni hoder, ni hatter og frisyrer, ni tilbehør, ni kropper, åtte farger og tre størrelser blir det over 150 000 kombinasjoner, før vi regner med våpen og elitemerker. Rollene holder det sammenhengende, så en kultist ikke tilfeldig får sykepleierlue (bortsett fra som sjelden spøk). Alt trekkes fra etasjens frø, så samme etasje alltid gir de samme fiendene.

Motoren for dette bygger Claude. Delene ChatGPT tegner nå, havner i `assets/deler/` med festepunkt, klare til bruk.

## Hva ChatGPT ikke skal lage

Animasjonsark med mange bilder per bevegelse. Spillet animerer ved å flytte delene (som klippeanimasjon i Castle Crashers), og bildegeneratorer klarer ikke å tegne samme figur likt nok fra bilde til bilde til at det blir jevn animasjon. Heller ikke 3D-modeller eller møbler som flate bilder foreløpig, før vi har bestemt om verdenen blir 3D.

## Første bestilling, i denne rekkefølgen

1. Kuriositetene: fem «ni ting»-ark med `kur_`-ikonene, og ett med pillene og det tomme preparatglasset (se F).
2. `figur_pasient.png`, med Toms journalskisse som referanse (bustete svart hår, runde briller, gul morgenkåpe med belte og navneskilt). Tøflene lages på et «ni ting»-ark.
3. Ni evnekort på ett ark (se eksempelet under C), deretter de fire siste kortene.
4. `hoder_personale.png`, `hatter_personale.png`, `kropper_uniformer.png` (farges). Det gir de første sammensatte pleierne og oppasserne.
5. `hoder_kultister.png`, `hatter_kultister.png`, `kropper_kultister.png`.
6. Sjefene: `figur_krok.png`, `figur_rust.png`.
7. Teksturer og plakater.

## Levering

Last ned som PNG, gi fila nøyaktig filnavnet fra denne briefen, og last den opp til `gpt-grafikk/`. Ved push til main klipper og bygger GitHub Actions bildene inn av seg selv. Lokalt kjører du (eller Claude):

```
python3 tools/skjaer_ark.py
python3 tools/behandle_bilder.py
python3 build.py
```
