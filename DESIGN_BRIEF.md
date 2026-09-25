# Morbidium: designbrief for ChatGPT

Denne briefen forklarer hva ChatGPT skal tegne til Morbidium, og hvordan bildene må se ut for at Claude kan bruke dem uten manuelt arbeid. Den detaljerte lista over hver enkelt bildedel spillet bruker i dag, ligger i `ART_BRIEF.md`.

## Arbeidsdelingen

- **ChatGPT** tegner. Bare bilder, ingen kode.
- **Tom** laster bildene opp til `gpt-grafikk/` i repoet, eller i chatten med Claude.
- **Claude** klipper, renser, plasserer og bygger bildene inn i spillet (`tools/skjaer_ark.py`, `tools/behandle_bilder.py`, `build.py`), og skriver all kode, lyd og musikk.

## Spillet i korte trekk

Sanntids action-roguelite i et norsk sanatorium fra 1920-tallet. Lovecraft og Hellraiser, men med mørk humor som gjør narr av edgelords. Kameraet ser ned på rommene fra omtrent 50 grader, som i Conan Chop Chop. Figurene er 2D-papirdukker: hode og kropp er tegnede flater, mens armer og bein tegnes av spillet som tykke, litt skjeve streker. Rommene er 3D som standard (vegger, lamper, skygger og tåke bygges av spillet), men figurer, rekvisitter og effekter er fortsatt tegnede flater.

## Stilblokk (lim inn først i hver ChatGPT-samtale)

```
Style: hand-drawn cartoon game art in the style of Conan Chop Chop mixed with Castle Crashers. Thick dark brown ink outlines (#2a1a14) with a slightly wobbly, hand-inked line that is heavier on the lower right. Flat colors with one darker cel-shade tone on the lower right and a small light highlight on the upper left. Light always comes from the upper left. Muted, warm 1920s palette. Setting: a 1920s Norwegian sanatorium, Lovecraftian and a bit gross, but with dark humor. Big heads, small bodies, chunky shapes. Keep this exact style, line thickness and palette for every image in this conversation.
Technical: PNG with a TRANSPARENT background. No text unless asked, no ground shadows, no frames, no background scenery.
```

## Ansikter

Tom ønsker at ansiktene er grovere, styggere og mer morbide enn de første figurarkene. Tegn skjeve silhuetter, ujevne øyne og tenner, tydelige poser under øynene, skranglete hår og røffe blekkstreker med litt skravering. Figurene kan være groteske og komiske, men må fortsatt være lette å kjenne igjen fra alle vinkler. Unngå glatte hudoverganger, symmetrisk portrettpreg og blankt, polert uttrykk. Ikoner og utstyr beholder stilen i blokken over.

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

Lagre som `figur_<navn>.png`, for eksempel `figur_pasient.png`. Navnene spillet kjenner i dag: `pasient`, `pleier`, `kultist`, `oppasser`, `kokk`, `hansen`, `olsen`, `bibliotekar`, `krok`, `rust`, og de nye fiendene `kasteren`, `trille`, `speil`, `tannlege` og `portier`. Beskrivelser står i `ART_BRIEF.md` (runde 6 og 7).

Trillepasienten sitter i rullestol. Figurarket viser mannen og stolen uten hjul, og hjulet tegnes for seg som `hjul_trille_f.png`, sett rett fra siden, fordi spillet snurrer det når han ruller. Portieren har ikke hode: hoderaden i figurarket hans viser bare halsstumpen over den høye kragen, og hodet er en egen ting han bærer under armen og kaster som en bumerang (`portierhode.png`).

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

### G. HUD og menyer (UI-settet)

ChatGPT har tegnet skisser av hele skjermen: HUD-en, pausemenyen som utklippstavle og journalen som bok. Skissene er gode som retning, men et helt skjermbilde kan ikke limes rett inn i spillet. Tekst, tall, hjerter og nedtellinger endrer seg hele tiden, og skjermene er ulike store. Derfor deler vi det opp:

1. **Skissen er fasiten for oppsettet.** ChatGPT tegner gjerne hele skjermen. Claude bygger den om i HTML og CSS: plassering, farger, størrelser og småting. Fra skissen i september 2026 er dette allerede gjort: nummerskilt øverst til venstre på kortene, en rød sektor som teller ned med sekunder på kortet, ikonknapper for Journal og Pause, kompass med N rundt kartet, og en rød strek på Morbidium-stanga der skrekken starter.
2. **Delene tegnes hver for seg.** Etterpå tegner ChatGPT de enkelte delene med filnavnene under (de står også i `ART_BRIEF.md`, runde 9), og Tom laster dem opp til `gpt-grafikk/` som vanlig.
3. **Spillet bytter dem inn selv.** Når spillet starter, ser det etter `ui_`-bildene og tar i bruk dem som finnes (`brukUIsett()` i `src/32_meny.js`). Det som mangler, tegner CSS-en som før. Et nytt UI-bilde trenger altså ingen kodeendring.

Alt som er tekst eller tall, tegner spillet selv, så UI-bildene skal aldri ha tekst i seg. Da kan vi endre ord og språk uten å tegne på nytt.

| Filnavn | Hva | Brukes til | Form |
|---|---|---|---|
| `ui_panel.png` | tomt pergamentpanel med små messingstifter i hjørnene | navnefeltet ved portrettet, våpenet, lommen, apparatet, samtalekort | 9-delt, liggende |
| `ui_knapp.png` | liten pergamentflis | knappene Journal og Pause | 9-delt, kvadrat |
| `ui_kort.png` | tom kortramme med stift øverst | de fire evnekortene nederst | 9-delt, stående |
| `ui_skilt.png` | bredt skilt med skruer i endene | romnavnet øverst | 9-delt, liggende |
| `ui_utklipp.png` | utklippstavle i tre med linjert ark og klemme | pausemenyen og de andre utklippspanelene | 9-delt, stående |
| `ui_ring_portrett.png` | tykk gullring med nagler | rundt portrettet øverst til venstre | ring, gjennomsiktig midt i |
| `ui_ring_kart.png` | kompassring i messing med N | rundt kartet nede til høyre | ring, gjennomsiktig midt i |
| `ui_hjerte_full.png`, `ui_hjerte_halv.png`, `ui_hjerte_tom.png` | helt, halvt og tomt hjerte | helsa | ikon; alle tre må finnes før de brukes |
| `ui_ikon_journal.png`, `ui_ikon_pause.png` | oppslått bok, to pausestreker | knappene Journal og Pause | ikon |
| `ui_hode.png` | frenologisk hode i profil mot venstre, uten områder og ord | Sinnets kart i journalen | kvadrat |

**Slik virker de 9-delte bildene.** Panelet, knappen, kortet, skiltet og utklippstavla deles i ni biter. De fire hjørnene beholder størrelsen, kantene strekkes på langs, og midten strekkes begge veier. Da passer ett bilde på bokser i alle størrelser. For ChatGPT betyr det:

- All pynt (stifter, skruer, rifter, messinghjørner) ligger ytterst, innenfor omtrent en tiendedel av bredden fra kanten.
- Midten er jevn: samme papirfarge, uten flekker eller motiver som ser rare ut når de strekkes. Svake linjer på tvers, som på linjert papir, går fint på kortet og utklippstavla.
- Kantene ser like ut langs hele siden. Unntakene er klemma øverst på utklippstavla og stiften øverst på kortet, som tåler å strekkes litt.
- Ingen skygge utenfor rammen.

Verktøyet beskjærer bildet til innholdet og strekker det til riktig størrelse (`strekk` og `snitt` i manifestet, `behandle_ui` i `tools/behandle_bilder.py`). Formatet fra ChatGPT (1024x1024, 1536x1024 eller 1024x1536) spiller ingen rolle, bare retningen stemmer omtrent. Rammen legges utenpå boksen og endrer ikke størrelsen på den, så tekst og tall står der de sto.

**Ringene** legges oppå portrettet og kartet. Midten må være helt gjennomsiktig, ellers dekker ringen det som er inni.

```
UI element for the HUD of a 1920s sanatorium game, same ink-and-cel style: <beskrivelse fra ART_BRIEF.md, runde 9>. Flat and seen straight on, no perspective, no text, no shadow outside the shape, transparent background.
```

**Neste steg (trenger kode først, så ikke tegn disse før de står i `ART_BRIEF.md`):**

- `ui_bok.png`: et oppslått journalomslag i skinn som bakgrunn til journalen, to tomme sider med sting i midten.
- `ui_fane.png`: en fane til journalfanene (Utstyr, Ferdigheter, Diagnoser, Kuriositeter). 9-delt i gråtoner, så spillet kan farge hver fane.
- `ui_stempel.png`: en tom stempelramme til «FRISK NOK» og «IKKE FRISK». Spillet skriver ordene.
- `ui_merke.png`: det lille nummerskiltet på kortene og F-merket på lommen.
- `ui_stang.png`: rammen rundt Morbidium-stanga og erfaringsstanga, 9-delt.
- `ui_flaske.png`: ikon til lommen.

Kommer det nye skisser fra ChatGPT, send dem til Claude i chatten. Claude justerer oppsettet, legger nye `ui_`-nøkler inn i `tools/lag_manifest.py` og `UI_SETT`, og lager nye beskrivelser i `ART_BRIEF.md`.

### H. Lagdelte skapninger: Hviskekoret og Den Store Klumpen

Noen skapninger er ikke papirdukker med hode og kropp, men én stor kropp med løse deler som spillet flytter hver for seg: munner som hvisker, ører som vokser ut, ansikter som synker inn og kommer opp igjen. Hver del tegnes alene på sitt eget bilde, med gjennomsiktig bakgrunn og uten noe rundt.

| Skapning | Deler |
|---|---|
| Hviskekoret (minisjef) | `koret_kropp.png` (kappen og kjøttsøylen med lys, uten munner og ører), `koret_munn0.png` til `koret_munn2.png`, `koret_ore0.png` og `koret_ore1.png` |
| Den Store Klumpen (sjef) | `klumpen_kropp.png` (kjøtthaugen uten ansikter og armer), `klumpen_ansikt0.png` til `klumpen_ansikt3.png`, `klumpen_oye.png` og `klumpen_lue.png`. Armene tegner spillet. Klumpungene han spytter ut, er `blob_klumpunge_f/b/s.png` |

Beskrivelsene står i `ART_BRIEF.md`, runde 7.

### I. Spriteark (animasjon)

Figurene animeres ved at spillet flytter delene, men små ting og effekter kan ha ekte animasjon, bilde for bilde: en klump som snurrer i lufta, en sprut som treffer gulvet, et øye som åpner seg i en sprekk i veggen. ChatGPT foreslo selv reglene, og spillet følger dem:

- Ett bilde, `anim_<navn>.png`, med like store ruter på én rad, lest fra venstre.
- Samme festepunkt i hver rute: samme midtpunkt for ting som svever, samme bakkelinje for ting som treffer gulvet.
- Ingenting stikker inn i naboruta.
- Antall ruter står i `ART_BRIEF.md`, runde 8. Farten (bilder i sekundet) og hvilke ruter som spilles når, bestemmer spillet (`ANIM` i `src/16_anim.js`), ikke bildet.

Verktøyet deler arket i ruter. Har arket marg på sidene eller litt ujevne ruter, finner det rutene ved de tomme stripene mellom bildene. Alle rutene skaleres likt, så festepunktet står stille, og formatet fra ChatGPT spiller ingen rolle.

```
SPRITE SHEET for a game animation, same ink-and-cel style: <antall> equal cells in ONE horizontal row, read left to right: <beskrivelse fra ART_BRIEF.md, runde 8>. The same object in every cell, same size and same center (or the same ground line), only the motion changes. Nothing crosses into the next cell. No text, no grid lines, transparent background.
```

Nye animasjoner legges inn av Claude: først et navn i `ANIM` med en tegnet reserve, så en nøkkel i manifestet. Figurer som går, slår og dør, tegnes fortsatt ikke som spriteark (se under).

ChatGPT har også laget en prototype av Kasteren: seks dukkedeler og et ark med fire kastebilder og fire treffbilder. Den pakken har ikke kommet inn i repoet ennå. Leveres delene som `figur_kasteren.png` (på `mal_figur.png`) og treffet som `anim_kastesprut.png`, tas de i bruk med en gang. Selve kastet gjør spillet med delene (positur «kast»), så de fire kastebildene trengs ikke.

## Oppskriftssystemet (uendelige fiender)

Designdokumentet beskriver figurer som oppskrifter, og delarkene over er byggeklossene. En fiende settes sammen av:

- **Rolle:** pleier, kultist, oppasser osv. Rollen bestemmer hvilke deler som er lov og hvordan fienden oppfører seg.
- **Deler:** ett hode, én hatt eller frisyre, ett tilbehør (valgfritt), én kropp og ett våpen, alle trukket fra rollens utvalg.
- **Tilpasning:** farge på klærne, litt større eller mindre hode og kropp, og elitemerker som lilla årer, glød eller et øye for mye.
- **Personlighet:** navn og replikker trekkes ut fra rollen og delene.

Med ni hoder, ni hatter og frisyrer, ni tilbehør, ni kropper, åtte farger og tre størrelser blir det over 150 000 kombinasjoner, før vi regner med våpen og elitemerker. Rollene holder det sammenhengende, så en kultist ikke tilfeldig får sykepleierlue (bortsett fra som sjelden spøk). Alt trekkes fra etasjens frø, så samme etasje alltid gir de samme fiendene.

Motoren for dette bygger Claude. Delene ChatGPT tegner nå, havner i `assets/deler/` med festepunkt, klare til bruk.

## Hva ChatGPT ikke skal lage

Animasjonsark for figurer som går, slår og dør. Spillet animerer figurene ved å flytte delene (som klippeanimasjon i Castle Crashers), og bildegeneratorer klarer ikke å tegne samme figur likt nok fra bilde til bilde til at det blir jevn gange. Spriteark for effekter og små ting er noe annet, se I over. Lag heller ikke 3D-modeller: rommene er 3D, men de bygges av spillet selv. Tom har bedt om rekvisitter og møbler som enkeltbilder i trekvart perspektiv. Disse legges i gpt-grafikk og behandles av det vanlige bildeløpet.

## Neste bestilling, i denne rekkefølgen

1. De vanlige nye fiendene, som dukker opp fra 1. etasje: `figur_kasteren.png`, `figur_trille.png` med `hjul_trille_f.png`, og `figur_speil.png`. Våpenet til Kasteren er `vaapen_klump.png`, og skårene etter Speilpasienten er `glasskar.png`.
2. Minisjefene: `figur_tannlege.png` med `vaapen_tang.png`, `figur_portier.png` med `portierhode.png` og `vaapen_knippe.png`, og Hviskekoret (se H).
3. Den Store Klumpen og klumpungene (se H).
4. Spritearkene i runde 8 (se I), aller først `anim_kastesprut.png` og `anim_blodsprut.png`, som synes mest.
5. UI-settet i runde 9 (se G). Hjertene og ringene gir mest for minst.

## Første bestilling (stort sett levert, se status i `ART_BRIEF.md`)

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
