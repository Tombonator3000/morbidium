# Morbidium: kunstbrief for bildegenerering

Denne fila er laget av `tools/lag_brief.py` fra `assets/manifest.json`. Ikke rediger den for hånd; endre skriptet og kjør det på nytt.

## Slik gjør du det

1. Lim inn stilblokken under i ChatGPT én gang, og be den bruke stilen for alle bildene i samtalen.
2. Be om ett bilde om gangen: «Draw: <beskrivelse fra tabellen>». Bruk formatet i tabellen (kvadrat 1024x1024, stående 1024x1536, liggende 1536x1024).
3. Last ned bildet som PNG og gi det nøyaktig filnavnet fra tabellen, for eksempel `kort_due.png`.
4. Last det opp til `gpt-grafikk/` i repoet (Add file, Upload files).
5. Resten gjør Claude: `python3 tools/behandle_bilder.py` fjerner eventuell bakgrunn, beskjærer, skalerer og setter festepunktet, og `python3 build.py` bygger bildet inn i spillet. Alt som ikke har bilde ennå, tegnes av koden som før.

Status: 287 av 544 bilder er levert. Kolonnen «Levert» viser hvilke.

## Stilblokk (lim inn i ChatGPT)

```
Style: hand-drawn cartoon game art in the style of Conan Chop Chop mixed with Castle Crashers. Thick dark brown ink outlines (#2a1a14) with a slightly wobbly, hand-inked line that is heavier on the lower right. Flat colors with one darker cel-shade tone on the lower right and a small light highlight on the upper left. Muted, warm 1920s palette. Setting: a 1920s Norwegian sanatorium, Lovecraftian and a bit gross, but with dark humor. Camera: seen from the front and slightly above (about 50 degrees), like a top-down action game, so objects show their front and a little of their top.
Technical: PNG with a TRANSPARENT background. Exactly one object, centered, fully visible (not cropped). No ground shadow, no text, no frame, no background scenery.
```

## Tips

- Samme stil i alle bilder er viktigere enn at hvert enkelt bilde er perfekt. Bruk samme ChatGPT-samtale for en hel runde.
- Gjennomsiktig bakgrunn er best. Hvit eller ensfarget bakgrunn går også, verktøyet fjerner den fra kantene og innover.
- Ikke tegn skygge på bakken. Spillet legger på skygge og lys selv.

## Runde 14: historien (12 bilder, 0 levert)

Historien er Hellraiser møter Twin Peaks, på et norsk sanatorium i 1923, med et Lovecraft-hav under huset. Journalsidene før drømmene, de fire sluttbildene, forstanderen som er sydd fast til stolen i Dypet, Venterommet med de røde forhengene og instrumentskrinet. Alt vises stort i samtalepanelet. Journalsidene er stilleben (ting, ikke folk), mørkere og mer høytidelige enn resten. Kroker og kjettinger skal være elegante og kalde, ikke blodige.

| Filnavn | Beskrivelse til ChatGPT | Format | Levert |
|---|---|---|---|
| `historie_1.png` | a hospital admission form from 1923: a sheet of yellowed paper with rows of handwritten lines, a red rectangular rubber-stamp mark at an angle, and a black fountain pen lying across it, seen slightly from above | liggende |  |
| `historie_2.png` | a thick journal bound in cracked black skin with stitched seams, closed, lying on a pale whale rib bone, with a dark red ribbon bookmark hanging out and an old dip pen with one drop of purple ink beside it (the only text allowed: a faded gold 1887 and the initial M. on the cover) | liggende |  |
| `historie_3.png` | a cross-section below a building: a thin band of brick foundation at the top, and under it a black, ancient sea; in the water sleeps something vast and dark with one huge closed eye and slow curling limbs, and small violet sparks rise from it toward the foundation | liggende |  |
| `historie_4.png` | Ward Zero: a pale surgical gown hanging from a hook, with surgical instruments stitched into the fabric, surrounded by chains hanging from the dark above, each ending in a sharp hook, and a small silver bell to the side. Elegant, ritual and cold, not gory | kvadrat |  |
| `historie_5.png` | an open journal lying flat, the left page full of handwritten lines, the right page only half written with the last line trailing off in purple ink, and a burning candle stub beside it | liggende |  |
| `historie_slutt_fornektelse.png` | a blank sheet of paper with nothing written on it, a red ribbon bookmark across it, and a slack iron chain lying over the edge | liggende |  |
| `historie_slutt_gjentakelse.png` | a freshly made iron hospital bed with a blue blanket, a new admission form on the pillow, a small silver bell on the blanket, and a red curved arrow looping back to where it started | liggende |  |
| `historie_slutt_sannheten.png` | a lone figure standing still on a stone quay at night in the rain, seen small from behind, and far out the black sea rising in one smooth swell, like a chest breathing in | liggende |  |
| `historie_slutt_tilgivelse.png` | an open iron gate seen from the front with warm white light behind it, and a small dark figure walking out through it | liggende |  |
| `prop_forstander.png` | an old man with a white beard in a long dark frock coat, sewn to his chair with fine silver hooks through the backs of his hands, thin chains running from the chair down into the floor; he sits behind an oversized wooden desk reading aloud from a thick black journal that lies open, with a green glass banker's lamp on the desk and dust on his shoulders, seen from the front. Quiet and tired, not a villain | kvadrat |  |
| `prop_skrin.png` | a small black lacquered instrument case with shifting brass geometric patterns on the lid, the lid open a finger width with warm light in the gap, standing on a small wooden side table | kvadrat |  |
| `prop_venterom.png` | a small waiting room seen through parted heavy red velvet curtains set into a wall: red curtains on every side inside too, a floor with a black and white zigzag pattern, and a very small doctor in a white coat far too big for him sitting on a chair, waiting politely | stående |  |

## Runde 10: uterom og de nye rommene (59 bilder, 0 levert)

Møblene til de nye romtypene, parken og Nattskogen, og utgangene fra hver etasje. Forfra, som de andre møblene. Det som ligger flatt på gulvet (grav, vak, kloakk, kullsjakt, blomsterbed), tegnes rett ovenfra.

| Filnavn | Beskrivelse til ChatGPT | Format | Levert |
|---|---|---|---|
| `prop_baal.png` | a campfire in a ring of stones, burning | stående |  |
| `prop_bjork.png` | a tall white birch tree | stående |  |
| `prop_bjork_dod.png` | a dead white birch tree without leaves | stående |  |
| `prop_bjorn.png` | a stuffed brown bear standing upright with one glass eye missing | stående |  |
| `prop_blomsterbed.png` | a flower bed with red and white flowers, seen from above (flat) | liggende |  |
| `prop_bronn.png` | a stone well with a small wooden roof and a bucket | kvadrat |  |
| `prop_busk.png` | a round clipped hedge bush | kvadrat |  |
| `prop_elektrostol.png` | an electroshock therapy chair with leather straps and a metal head cap with wires | stående |  |
| `prop_engel.png` | a weeping stone angel on a plinth | stående |  |
| `prop_fontene.png` | a round stone fountain with water in the basin | kvadrat |  |
| `prop_frisorstol.png` | a barber chair of cracked leather and chrome | stående |  |
| `prop_fuglebad.png` | a stone birdbath | kvadrat |  |
| `prop_gevir.png` | deer antlers mounted on a wooden plaque | stående |  |
| `prop_globus.png` | an old globe on a wooden stand | stående |  |
| `prop_grammofon.png` | a 1920s gramophone with a big brass horn on a small wooden cabinet | stående |  |
| `prop_grav.png` | an open grave with a spade in the dirt pile, seen from above (flat) | stående |  |
| `prop_gryte.png` | a big steel soup pot | kvadrat |  |
| `prop_hagenisse.png` | a garden gnome with a red cap, slightly sinister | stående |  |
| `prop_harhaug.png` | a pile of cut hair on the floor, seen from above (flat) | liggende |  |
| `prop_instrumentbord.png` | a small steel instrument table with pliers and probes | stående |  |
| `prop_kjele.png` | a big iron boiler with pipes, a pressure gauge and a glowing firebox | kvadrat |  |
| `prop_kjerre.png` | a wooden hand cart | liggende |  |
| `prop_kjottkrok.png` | meat hooks on a rail with sausages and a ham | stående |  |
| `prop_kloakk.png` | a round sewer grate seen from above (flat), dark water below | kvadrat |  |
| `prop_komfyr.png` | a black cast-iron kitchen stove with pots on top | kvadrat |  |
| `prop_kors.png` | a tall wooden crucifix | stående |  |
| `prop_kortbord.png` | a small card table with playing cards and a glass of cognac | kvadrat |  |
| `prop_langbord.png` | a long wooden dining-hall table with white plates and cups, front view | liggende |  |
| `prop_lenestol.png` | a worn floral armchair, front view | kvadrat |  |
| `prop_liggestol.png` | a wooden sanatorium deck chair with a plaid blanket | stående |  |
| `prop_lyktestolpe.png` | a cast-iron gas street lamp, lit | stående |  |
| `prop_lysskjerm.png` | an X-ray light box on a stand showing the bones of a hand | stående |  |
| `prop_lysthus.png` | a small white wooden gazebo with a pointed roof | kvadrat |  |
| `prop_piano.png` | an old upright piano with brass candle holders, front view | kvadrat |  |
| `prop_plantebord.png` | a greenhouse potting table with seedlings in clay pots | liggende |  |
| `prop_porten.png` | a tall wrought-iron park gate, slightly open | kvadrat |  |
| `prop_robat.png` | a wooden rowing boat pulled up on land | liggende |  |
| `prop_rontgen.png` | a 1920s X-ray machine: a glass tube on a big jointed arm over a stand | kvadrat |  |
| `prop_ror.png` | rusty pipes with a valve wheel | stående |  |
| `prop_ruinmur.png` | a crumbling stone ruin wall | liggende |  |
| `prop_siv.png` | a clump of reeds | stående |  |
| `prop_skilt.png` | a wooden signpost pointing out of a forest | stående |  |
| `prop_snomann.png` | a crooked snowman with coal eyes | stående |  |
| `prop_sopp.png` | two toadstools, red with white dots | kvadrat |  |
| `prop_spole.png` | a tall induction coil on a wooden base with a copper ring on top | stående |  |
| `prop_spyttkum.png` | a white enamel spittoon on a stand | stående |  |
| `prop_statue.png` | a classical marble statue of a woman on a plinth | stående |  |
| `prop_stein.png` | a mossy boulder | liggende |  |
| `prop_stubbe.png` | a tree stump | kvadrat |  |
| `prop_tannglass.png` | a glass jar full of pulled teeth | stående |  |
| `prop_tannlegestol.png` | an old dentist chair with a drill arm | stående |  |
| `prop_teppe.png` | a folded plaid blanket on the ground, flat | liggende |  |
| `prop_tre.png` | a large leafy park tree, front view | stående |  |
| `prop_utgang.png` | a lit exit door with bright white light behind it | stående |  |
| `prop_vak.png` | a black hole in the ice, seen from above (flat) | kvadrat |  |
| `prop_vannkanne.png` | a zinc watering can | kvadrat |  |
| `prop_vedovn.png` | a black wood-burning stove with a glowing door | stående |  |
| `prop_vedstabel.png` | a stack of firewood | liggende |  |
| `prop_vindu.png` | an open window with a night sky outside | stående |  |

## Runde 11: hendelsene (24 bilder, 0 levert)

De absurde hendelsene. Tonen er David Lynch på et norsk sanatorium i 1923: hverdagslig, litt feil, aldri skummelt på den åpenbare måten. Bildene vises også stort i samtalepanelet.

| Filnavn | Beskrivelse til ChatGPT | Format | Levert |
|---|---|---|---|
| `hode_baklengs_b.png` | HEAD ONLY (no neck, no body) of a pale man in a neat black suit and tie with his eyes closed and a small calm smile (he walks backwards and talks backwards). back view, facing away | kvadrat |  |
| `hode_baklengs_f.png` | HEAD ONLY (no neck, no body) of a pale man in a neat black suit and tie with his eyes closed and a small calm smile (he walks backwards and talks backwards). front view, facing the viewer | kvadrat |  |
| `hode_baklengs_s.png` | HEAD ONLY (no neck, no body) of a pale man in a neat black suit and tie with his eyes closed and a small calm smile (he walks backwards and talks backwards). side view, facing right | kvadrat |  |
| `kropp_baklengs_b.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a pale man in a neat black suit and tie with his eyes closed and a small calm smile (he walks backwards and talks backwards). back view, facing away | liggende |  |
| `kropp_baklengs_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a pale man in a neat black suit and tie with his eyes closed and a small calm smile (he walks backwards and talks backwards). front view, facing the viewer | liggende |  |
| `kropp_baklengs_s.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a pale man in a neat black suit and tie with his eyes closed and a small calm smile (he walks backwards and talks backwards). side view, facing right | liggende |  |
| `prop_badekarmann.png` | a man in a dark suit and hat sitting fully dressed in a clawfoot bathtub of grey water, reading a newspaper | kvadrat |  |
| `prop_brennevin.png` | a patient in long underwear next to a copper moonshine still on a crate | kvadrat |  |
| `prop_damer.png` | three old ladies in Norwegian bunad sitting on tree stumps drinking coffee; the third one has a cow tail | liggende |  |
| `prop_heis.png` | an old cage elevator; inside stands a lift operator in a red uniform and cap with no face | stående |  |
| `prop_kaffebord.png` | a small cafe table with a cup of black coffee and a slice of cream cake with one cherry | kvadrat |  |
| `prop_kjempe.png` | a very tall thin man in a black tuxedo and bow tie, his small bald head far up | stående |  |
| `prop_kjempeplante.png` | a giant carnivorous plant with glowing pods | stående |  |
| `prop_ku.png` | a brown and white cow standing sideways, calm wet eyes and a brass bell | liggende |  |
| `prop_kubbekona.png` | an old woman in a shawl and round glasses cradling a firewood log like a baby | stående |  |
| `prop_kullhaug.png` | a heap of coal with a shovel stuck in it | liggende |  |
| `prop_kullsjakt.png` | a square coal chute hatch in the floor with a ladder, seen from above (flat) | kvadrat |  |
| `prop_lampemann.png` | a patient in striped pyjamas standing stiffly with a lampshade on his head and an electric cord coming out of his sleeve | stående |  |
| `prop_lampemann_paa.png` | the same lamp patient, but the lampshade glows warm yellow | stående |  |
| `prop_radiobord.png` | a 1920s wooden radio set on a small table | kvadrat |  |
| `prop_rotter.png` | six rats sitting in a ring around a candle stump, the biggest wearing a white judge wig | liggende |  |
| `prop_tannfe.png` | a woman in a nightgown with moth wings lying under an iron hospital bed, counting a pile of teeth | liggende |  |
| `prop_telefon.png` | a wooden wall telephone with a rotary dial and the receiver hanging on its cord | stående |  |
| `prop_utedo.png` | a wooden outhouse with a heart cut into the door | stående |  |

## Runde 12: drømmene (52 bilder, 0 levert)

Minnene, tegnene som går igjen, døra og figurene uten ansikt. Litt mykere og blekere enn resten, som et gammelt fotografi. Figurene uten ansikt skal ha et helt blankt papirark der ansiktet skulle vært, ingen trekk i det hele tatt.

| Filnavn | Beskrivelse til ChatGPT | Format | Levert |
|---|---|---|---|
| `drom_bok.png` | a prayer book open on a stand | stående |  |
| `drom_bord.png` | a kitchen table set for four | kvadrat |  |
| `drom_brev.png` | a small table with a handwritten letter and an envelope | kvadrat |  |
| `drom_dor.png` | a closed door in a dark frame | stående |  |
| `drom_dor_aapen.png` | the same door wide open with warm white light pouring out | stående |  |
| `drom_dorlaast.png` | a closed wooden door with a key in the lock | stående |  |
| `drom_foto.png` | an old framed photograph of two people on an easel; their faces are blank | stående |  |
| `drom_hest.png` | a white horse standing sideways, calm and slightly unreal | kvadrat |  |
| `drom_hvitveis.png` | a glass of white wood anemones on a stool | stående |  |
| `drom_kaape_4a4a52.png` | a man's grey coat hanging on a coat stand | stående |  |
| `drom_kaape_7a2a2e.png` | a woman's dark red coat hanging on a coat stand | stående |  |
| `drom_koffert.png` | a packed brown suitcase with a train ticket on top | kvadrat |  |
| `drom_kommode.png` | a wooden chest of drawers with one drawer open | kvadrat |  |
| `drom_kopp.png` | a half-full cup of black coffee with steam, on a small table | kvadrat |  |
| `drom_lue.png` | a red knitted hat lying on a wooden stool | stående |  |
| `drom_mappe.png` | a patient file folder on a small table | kvadrat |  |
| `drom_notat.png` | a lectern with an open policeman's notebook | stående |  |
| `drom_sko.png` | a pair of dry leather shoes on a doormat | liggende |  |
| `drom_soldat.png` | a tin soldier in a red coat, missing one foot, standing on a stool | stående |  |
| `drom_speil.png` | a standing oval mirror | stående |  |
| `drom_symaskin.png` | a black and gold antique sewing machine on a small table | kvadrat |  |
| `drom_ur.png` | a gold pocket watch on a small wooden table | kvadrat |  |
| `drom_vindu_brann.png` | a freestanding window frame with fire outside | stående |  |
| `drom_vindu_klart.png` | a freestanding window frame with a starry night outside | stående |  |
| `drom_vindu_regn.png` | a freestanding window frame with rain outside | stående |  |
| `drom_vindu_rim.png` | a freestanding window frame covered in frost patterns | stående |  |
| `drom_vindu_sno.png` | a freestanding window frame, snow falling at night outside | stående |  |
| `drom_vindu_taake.png` | a freestanding window frame with thick fog outside | stående |  |
| `hode_ansikt_k_b.png` | HEAD ONLY (no neck, no body) of the same woman in a long dark red dress, but now with an ordinary, gentle, slightly sad face. back view, facing away | kvadrat |  |
| `hode_ansikt_k_f.png` | HEAD ONLY (no neck, no body) of the same woman in a long dark red dress, but now with an ordinary, gentle, slightly sad face. front view, facing the viewer | kvadrat |  |
| `hode_ansikt_k_s.png` | HEAD ONLY (no neck, no body) of the same woman in a long dark red dress, but now with an ordinary, gentle, slightly sad face. side view, facing right | kvadrat |  |
| `hode_ansikt_m_b.png` | HEAD ONLY (no neck, no body) of the same man in a dark 1910s suit, but now with an ordinary, gentle, slightly sad face. back view, facing away | kvadrat |  |
| `hode_ansikt_m_f.png` | HEAD ONLY (no neck, no body) of the same man in a dark 1910s suit, but now with an ordinary, gentle, slightly sad face. front view, facing the viewer | kvadrat |  |
| `hode_ansikt_m_s.png` | HEAD ONLY (no neck, no body) of the same man in a dark 1910s suit, but now with an ordinary, gentle, slightly sad face. side view, facing right | kvadrat |  |
| `hode_blank_k_b.png` | HEAD ONLY (no neck, no body) of a woman in a long dark red dress with a white collar and her hair in a bun, whose face is a blank sheet of paper with no features at all (a figure in a dream). back view, facing away | kvadrat |  |
| `hode_blank_k_f.png` | HEAD ONLY (no neck, no body) of a woman in a long dark red dress with a white collar and her hair in a bun, whose face is a blank sheet of paper with no features at all (a figure in a dream). front view, facing the viewer | kvadrat |  |
| `hode_blank_k_s.png` | HEAD ONLY (no neck, no body) of a woman in a long dark red dress with a white collar and her hair in a bun, whose face is a blank sheet of paper with no features at all (a figure in a dream). side view, facing right | kvadrat |  |
| `hode_blank_m_b.png` | HEAD ONLY (no neck, no body) of a man in a dark 1910s suit and tie whose face is a blank sheet of paper with no features at all, dark combed hair (a figure in a dream). back view, facing away | kvadrat |  |
| `hode_blank_m_f.png` | HEAD ONLY (no neck, no body) of a man in a dark 1910s suit and tie whose face is a blank sheet of paper with no features at all, dark combed hair (a figure in a dream). front view, facing the viewer | kvadrat |  |
| `hode_blank_m_s.png` | HEAD ONLY (no neck, no body) of a man in a dark 1910s suit and tie whose face is a blank sheet of paper with no features at all, dark combed hair (a figure in a dream). side view, facing right | kvadrat |  |
| `kropp_ansikt_k_b.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the same woman in a long dark red dress, but now with an ordinary, gentle, slightly sad face. back view, facing away | kvadrat |  |
| `kropp_ansikt_k_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the same woman in a long dark red dress, but now with an ordinary, gentle, slightly sad face. front view, facing the viewer | kvadrat |  |
| `kropp_ansikt_k_s.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the same woman in a long dark red dress, but now with an ordinary, gentle, slightly sad face. side view, facing right | kvadrat |  |
| `kropp_ansikt_m_b.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the same man in a dark 1910s suit, but now with an ordinary, gentle, slightly sad face. back view, facing away | liggende |  |
| `kropp_ansikt_m_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the same man in a dark 1910s suit, but now with an ordinary, gentle, slightly sad face. front view, facing the viewer | liggende |  |
| `kropp_ansikt_m_s.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the same man in a dark 1910s suit, but now with an ordinary, gentle, slightly sad face. side view, facing right | liggende |  |
| `kropp_blank_k_b.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a woman in a long dark red dress with a white collar and her hair in a bun, whose face is a blank sheet of paper with no features at all (a figure in a dream). back view, facing away | kvadrat |  |
| `kropp_blank_k_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a woman in a long dark red dress with a white collar and her hair in a bun, whose face is a blank sheet of paper with no features at all (a figure in a dream). front view, facing the viewer | kvadrat |  |
| `kropp_blank_k_s.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a woman in a long dark red dress with a white collar and her hair in a bun, whose face is a blank sheet of paper with no features at all (a figure in a dream). side view, facing right | kvadrat |  |
| `kropp_blank_m_b.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a man in a dark 1910s suit and tie whose face is a blank sheet of paper with no features at all, dark combed hair (a figure in a dream). back view, facing away | liggende |  |
| `kropp_blank_m_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a man in a dark 1910s suit and tie whose face is a blank sheet of paper with no features at all, dark combed hair (a figure in a dream). front view, facing the viewer | liggende |  |
| `kropp_blank_m_s.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a man in a dark 1910s suit and tie whose face is a blank sheet of paper with no features at all, dark combed hair (a figure in a dream). side view, facing right | liggende |  |

## Runde 13: Parken og Nattskogen, fiender og sjefer (35 bilder, 0 levert)

Gartnerne og kråkene i parken, Huldra, Vedkubbemannen og Nøkken i skogen, og de to nye sjefene. Hjorten og kråka er satt sammen av deler; tegn hver del for seg.

| Filnavn | Beskrivelse til ChatGPT | Format | Levert |
|---|---|---|---|
| `blob_kaalhode_b.png` | a small cabbage head with a mouth full of sharp teeth and two little eyes. back view, facing away | kvadrat |  |
| `blob_kaalhode_f.png` | a small cabbage head with a mouth full of sharp teeth and two little eyes. front view, facing the viewer | kvadrat |  |
| `blob_kaalhode_s.png` | a small cabbage head with a mouth full of sharp teeth and two little eyes. side view, facing right | kvadrat |  |
| `hjort_hode.png` | BOSS: the neck and head of the white stag with huge antlers, but the face is a sad human face with tears | stående |  |
| `hjort_kropp.png` | BOSS: the body of an enormous white stag seen from the side facing right, no head and no legs (the game draws the legs) | liggende |  |
| `hode_gartner_b.png` | HEAD ONLY (no neck, no body) of a park gardener with a wide straw hat, a big white mustache, a red nose and a pipe, white shirt and a dark green apron with suspenders. back view, facing away | kvadrat |  |
| `hode_gartner_f.png` | HEAD ONLY (no neck, no body) of a park gardener with a wide straw hat, a big white mustache, a red nose and a pipe, white shirt and a dark green apron with suspenders. front view, facing the viewer | kvadrat |  |
| `hode_gartner_s.png` | HEAD ONLY (no neck, no body) of a park gardener with a wide straw hat, a big white mustache, a red nose and a pipe, white shirt and a dark green apron with suspenders. side view, facing right | kvadrat |  |
| `hode_hekk_f.png` | HEAD ONLY (no neck, no body) of BOSS: Head Gardener Ansgar Hekk, huge and red-faced, a wide straw hat with a rose in the band, an enormous white walrus mustache, white shirt, a dark green apron with garden tools in the pocket and manure stains. front view, facing the viewer | kvadrat |  |
| `hode_huldra_b.png` | HEAD ONLY (no neck, no body) of the Huldra from Norwegian folklore: a beautiful young woman with long golden hair and a crown of white wood anemones, red bunad with black and gold embroidery. SEEN FROM BEHIND (back view) she is a hollow rotten tree trunk with moss, fungus and beetles, and she has a cow tail. back view, facing away | kvadrat |  |
| `hode_huldra_f.png` | HEAD ONLY (no neck, no body) of the Huldra from Norwegian folklore: a beautiful young woman with long golden hair and a crown of white wood anemones, red bunad with black and gold embroidery. SEEN FROM BEHIND (back view) she is a hollow rotten tree trunk with moss, fungus and beetles, and she has a cow tail. front view, facing the viewer | kvadrat |  |
| `hode_huldra_s.png` | HEAD ONLY (no neck, no body) of the Huldra from Norwegian folklore: a beautiful young woman with long golden hair and a crown of white wood anemones, red bunad with black and gold embroidery. SEEN FROM BEHIND (back view) she is a hollow rotten tree trunk with moss, fungus and beetles, and she has a cow tail. side view, facing right | kvadrat |  |
| `hode_nokken_b.png` | HEAD ONLY (no neck, no body) of the Nokken (Norwegian water spirit): a pale green man with long wet black hair, big sad eyes, bare ribs, holding a Hardanger fiddle across his chest, dripping water. back view, facing away | kvadrat |  |
| `hode_nokken_f.png` | HEAD ONLY (no neck, no body) of the Nokken (Norwegian water spirit): a pale green man with long wet black hair, big sad eyes, bare ribs, holding a Hardanger fiddle across his chest, dripping water. front view, facing the viewer | kvadrat |  |
| `hode_nokken_s.png` | HEAD ONLY (no neck, no body) of the Nokken (Norwegian water spirit): a pale green man with long wet black hair, big sad eyes, bare ribs, holding a Hardanger fiddle across his chest, dripping water. side view, facing right | kvadrat |  |
| `hode_vedkubbe_b.png` | HEAD ONLY (no neck, no body) of the Log Man: a man whose head is a birch log standing on end, with two glowing knot-hole eyes and a crack for a mouth, wearing a black and white Norwegian lusekofte sweater with pewter clasps. back view, facing away | kvadrat |  |
| `hode_vedkubbe_f.png` | HEAD ONLY (no neck, no body) of the Log Man: a man whose head is a birch log standing on end, with two glowing knot-hole eyes and a crack for a mouth, wearing a black and white Norwegian lusekofte sweater with pewter clasps. front view, facing the viewer | kvadrat |  |
| `hode_vedkubbe_s.png` | HEAD ONLY (no neck, no body) of the Log Man: a man whose head is a birch log standing on end, with two glowing knot-hole eyes and a crack for a mouth, wearing a black and white Norwegian lusekofte sweater with pewter clasps. side view, facing right | kvadrat |  |
| `kraake_kropp.png` | a black crow seen from the side facing right, one pale eye, the body only (the wing is a separate image) | liggende |  |
| `kraake_vinge.png` | one black crow wing, spread | kvadrat |  |
| `kropp_gartner_b.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a park gardener with a wide straw hat, a big white mustache, a red nose and a pipe, white shirt and a dark green apron with suspenders. back view, facing away | liggende |  |
| `kropp_gartner_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a park gardener with a wide straw hat, a big white mustache, a red nose and a pipe, white shirt and a dark green apron with suspenders. front view, facing the viewer | liggende |  |
| `kropp_gartner_s.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a park gardener with a wide straw hat, a big white mustache, a red nose and a pipe, white shirt and a dark green apron with suspenders. side view, facing right | liggende |  |
| `kropp_hekk_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of BOSS: Head Gardener Ansgar Hekk, huge and red-faced, a wide straw hat with a rose in the band, an enormous white walrus mustache, white shirt, a dark green apron with garden tools in the pocket and manure stains. front view, facing the viewer | liggende |  |
| `kropp_huldra_b.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the Huldra from Norwegian folklore: a beautiful young woman with long golden hair and a crown of white wood anemones, red bunad with black and gold embroidery. SEEN FROM BEHIND (back view) she is a hollow rotten tree trunk with moss, fungus and beetles, and she has a cow tail. back view, facing away | kvadrat |  |
| `kropp_huldra_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the Huldra from Norwegian folklore: a beautiful young woman with long golden hair and a crown of white wood anemones, red bunad with black and gold embroidery. SEEN FROM BEHIND (back view) she is a hollow rotten tree trunk with moss, fungus and beetles, and she has a cow tail. front view, facing the viewer | kvadrat |  |
| `kropp_huldra_s.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the Huldra from Norwegian folklore: a beautiful young woman with long golden hair and a crown of white wood anemones, red bunad with black and gold embroidery. SEEN FROM BEHIND (back view) she is a hollow rotten tree trunk with moss, fungus and beetles, and she has a cow tail. side view, facing right | kvadrat |  |
| `kropp_nokken_b.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the Nokken (Norwegian water spirit): a pale green man with long wet black hair, big sad eyes, bare ribs, holding a Hardanger fiddle across his chest, dripping water. back view, facing away | liggende |  |
| `kropp_nokken_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the Nokken (Norwegian water spirit): a pale green man with long wet black hair, big sad eyes, bare ribs, holding a Hardanger fiddle across his chest, dripping water. front view, facing the viewer | liggende |  |
| `kropp_nokken_s.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the Nokken (Norwegian water spirit): a pale green man with long wet black hair, big sad eyes, bare ribs, holding a Hardanger fiddle across his chest, dripping water. side view, facing right | liggende |  |
| `kropp_vedkubbe_b.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the Log Man: a man whose head is a birch log standing on end, with two glowing knot-hole eyes and a crack for a mouth, wearing a black and white Norwegian lusekofte sweater with pewter clasps. back view, facing away | liggende |  |
| `kropp_vedkubbe_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the Log Man: a man whose head is a birch log standing on end, with two glowing knot-hole eyes and a crack for a mouth, wearing a black and white Norwegian lusekofte sweater with pewter clasps. front view, facing the viewer | liggende |  |
| `kropp_vedkubbe_s.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the Log Man: a man whose head is a birch log standing on end, with two glowing knot-hole eyes and a crack for a mouth, wearing a black and white Norwegian lusekofte sweater with pewter clasps. side view, facing right | liggende |  |
| `vaapen_hagesaks.png` | garden hedge shears with wooden handles | stående |  |
| `vaapen_storsaks.png` | enormous garden hedge shears with long wooden handles | stående |  |

## Runde 7: nye fiender, minisjefer og Den Store Klumpen (52 bilder, 0 levert)

Fiendene ChatGPT foreslo. Kasteren, Trillepasienten, Speilpasienten, Tannlegen og Portieren lages som figurark på mal_figur.png: figur_kasteren.png, figur_trille.png, figur_speil.png, figur_tannlege.png og figur_portier.png. Hviskekoret og Klumpen er lagdelte: kroppen alene, og munner, ører, ansikter og øyne hver for seg, så spillet kan bevege dem.

| Filnavn | Beskrivelse til ChatGPT | Format | Levert |
|---|---|---|---|
| `blob_klumpunge_b.png` | klumpunge. back view, facing away | kvadrat |  |
| `blob_klumpunge_f.png` | klumpunge. front view, facing the viewer | kvadrat |  |
| `blob_klumpunge_s.png` | klumpunge. side view, facing right | kvadrat |  |
| `glasskar.png` | a small shard of broken mirror glass | kvadrat |  |
| `hjul_trille_f.png` | ONE big wooden wheelchair wheel with spokes and a rubber tire, seen straight from the side (the game spins it) | kvadrat |  |
| `hode_kasteren_b.png` | HEAD ONLY (no neck, no body) of the Thrower: a skinny old man with wild grey hair sticking out in all directions, huge round glasses that magnify his mismatched eyes, open mouth with the tongue hanging out, a mustard-yellow bathrobe with brown stains and a lumpy pocket. back view, facing away | kvadrat |  |
| `hode_kasteren_f.png` | HEAD ONLY (no neck, no body) of the Thrower: a skinny old man with wild grey hair sticking out in all directions, huge round glasses that magnify his mismatched eyes, open mouth with the tongue hanging out, a mustard-yellow bathrobe with brown stains and a lumpy pocket. front view, facing the viewer | kvadrat |  |
| `hode_kasteren_s.png` | HEAD ONLY (no neck, no body) of the Thrower: a skinny old man with wild grey hair sticking out in all directions, huge round glasses that magnify his mismatched eyes, open mouth with the tongue hanging out, a mustard-yellow bathrobe with brown stains and a lumpy pocket. side view, facing right | kvadrat |  |
| `hode_portier_b.png` | HEAD ONLY (no neck, no body) of MINI-BOSS the Headless Doorman: a tall doorman in a dark green uniform with two rows of gold buttons and gold epaulettes, but with NO HEAD, only a bloody neck stump above a high collar (the head part is just the stump and collar). back view, facing away | liggende |  |
| `hode_portier_f.png` | HEAD ONLY (no neck, no body) of MINI-BOSS the Headless Doorman: a tall doorman in a dark green uniform with two rows of gold buttons and gold epaulettes, but with NO HEAD, only a bloody neck stump above a high collar (the head part is just the stump and collar). front view, facing the viewer | liggende |  |
| `hode_portier_s.png` | HEAD ONLY (no neck, no body) of MINI-BOSS the Headless Doorman: a tall doorman in a dark green uniform with two rows of gold buttons and gold epaulettes, but with NO HEAD, only a bloody neck stump above a high collar (the head part is just the stump and collar). side view, facing right | liggende |  |
| `hode_speil_b.png` | HEAD ONLY (no neck, no body) of the Mirror Patient: a thin patient whose head is an ornate gilded hand mirror on its handle (the glass is blank and cracked, the game shows a reflection in it), grey-green hospital gown with shards of mirror glued into it and a little blood around them. back view, facing away | kvadrat |  |
| `hode_speil_f.png` | HEAD ONLY (no neck, no body) of the Mirror Patient: a thin patient whose head is an ornate gilded hand mirror on its handle (the glass is blank and cracked, the game shows a reflection in it), grey-green hospital gown with shards of mirror glued into it and a little blood around them. front view, facing the viewer | kvadrat |  |
| `hode_speil_s.png` | HEAD ONLY (no neck, no body) of the Mirror Patient: a thin patient whose head is an ornate gilded hand mirror on its handle (the glass is blank and cracked, the game shows a reflection in it), grey-green hospital gown with shards of mirror glued into it and a little blood around them. side view, facing right | kvadrat |  |
| `hode_tannlege_b.png` | HEAD ONLY (no neck, no body) of MINI-BOSS the Dentist: bald with a round head mirror on a headband, pince-nez, a big waxed mustache, a manic grin with several gold teeth, white coat with blood spots and a leather bandolier of pulled teeth. back view, facing away | kvadrat |  |
| `hode_tannlege_f.png` | HEAD ONLY (no neck, no body) of MINI-BOSS the Dentist: bald with a round head mirror on a headband, pince-nez, a big waxed mustache, a manic grin with several gold teeth, white coat with blood spots and a leather bandolier of pulled teeth. front view, facing the viewer | kvadrat |  |
| `hode_tannlege_s.png` | HEAD ONLY (no neck, no body) of MINI-BOSS the Dentist: bald with a round head mirror on a headband, pince-nez, a big waxed mustache, a manic grin with several gold teeth, white coat with blood spots and a leather bandolier of pulled teeth. side view, facing right | kvadrat |  |
| `hode_trille_b.png` | HEAD ONLY (no neck, no body) of the Wheelchair Patient: a bald old man with a bandage wound around his head and over one eye and a toothless grin, slumped in a creaky wooden wheelchair with big spoked wheels, a red and green plaid blanket over his knees and an IV stand with a yellow bag behind him (the body part is the chair, blanket and torso together; the chair reaches the floor). back view, facing away | kvadrat |  |
| `hode_trille_f.png` | HEAD ONLY (no neck, no body) of the Wheelchair Patient: a bald old man with a bandage wound around his head and over one eye and a toothless grin, slumped in a creaky wooden wheelchair with big spoked wheels, a red and green plaid blanket over his knees and an IV stand with a yellow bag behind him (the body part is the chair, blanket and torso together; the chair reaches the floor). front view, facing the viewer | kvadrat |  |
| `hode_trille_s.png` | HEAD ONLY (no neck, no body) of the Wheelchair Patient: a bald old man with a bandage wound around his head and over one eye and a toothless grin, slumped in a creaky wooden wheelchair with big spoked wheels, a red and green plaid blanket over his knees and an IV stand with a yellow bag behind him (the body part is the chair, blanket and torso together; the chair reaches the floor). side view, facing right | kvadrat |  |
| `klumpen_ansikt0.png` | ONE human face sunk into pink flesh, screaming with the eyes squeezed shut, drawn alone | kvadrat |  |
| `klumpen_ansikt1.png` | ONE human face sunk into pink flesh, sleeping and drooling, drawn alone | kvadrat |  |
| `klumpen_ansikt2.png` | ONE human face sunk into pink flesh, smiling far too wide with many teeth, drawn alone | kvadrat |  |
| `klumpen_ansikt3.png` | ONE human face sunk into pink flesh, wearing round glasses and looking worried, drawn alone | kvadrat |  |
| `klumpen_kropp.png` | BOSS the Big Lump, BODY ONLY: a huge mound of fused human flesh in different skin tones, with stitches, bandages, a stuck IV needle with a tube, a piece of a yellow bathrobe and a striped pyjama patch grown into it. No faces and no arms (the game adds them) | kvadrat |  |
| `klumpen_lue.png` | a red and white striped nightcap with a white pompom, drawn alone | kvadrat |  |
| `klumpen_oye.png` | ONE loose bloodshot eyeball with a green iris | kvadrat |  |
| `koret_kropp.png` | MINI-BOSS the Whispering Choir, BODY ONLY: a floating torn burgundy choir robe with a white ruffled collar, a tall column of pale pink flesh bursting out of the collar with stitches, and three lit candles on top. No mouths and no ears (the game adds them) | stående |  |
| `koret_munn0.png` | ONE human mouth with red lips and teeth, half open, drawn alone | kvadrat |  |
| `koret_munn1.png` | ONE human mouth with red lips, teeth and the tongue sticking out, drawn alone | kvadrat |  |
| `koret_munn2.png` | ONE wide human mouth with red lips and teeth, whispering, drawn alone | kvadrat |  |
| `koret_ore0.png` | ONE human ear, fleshy pink, drawn alone | stående |  |
| `koret_ore1.png` | ONE human ear with a small gold earring, drawn alone | stående |  |
| `kropp_kasteren_b.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the Thrower: a skinny old man with wild grey hair sticking out in all directions, huge round glasses that magnify his mismatched eyes, open mouth with the tongue hanging out, a mustard-yellow bathrobe with brown stains and a lumpy pocket. back view, facing away | liggende |  |
| `kropp_kasteren_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the Thrower: a skinny old man with wild grey hair sticking out in all directions, huge round glasses that magnify his mismatched eyes, open mouth with the tongue hanging out, a mustard-yellow bathrobe with brown stains and a lumpy pocket. front view, facing the viewer | liggende |  |
| `kropp_kasteren_s.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the Thrower: a skinny old man with wild grey hair sticking out in all directions, huge round glasses that magnify his mismatched eyes, open mouth with the tongue hanging out, a mustard-yellow bathrobe with brown stains and a lumpy pocket. side view, facing right | liggende |  |
| `kropp_portier_b.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of MINI-BOSS the Headless Doorman: a tall doorman in a dark green uniform with two rows of gold buttons and gold epaulettes, but with NO HEAD, only a bloody neck stump above a high collar (the head part is just the stump and collar). back view, facing away | liggende |  |
| `kropp_portier_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of MINI-BOSS the Headless Doorman: a tall doorman in a dark green uniform with two rows of gold buttons and gold epaulettes, but with NO HEAD, only a bloody neck stump above a high collar (the head part is just the stump and collar). front view, facing the viewer | liggende |  |
| `kropp_portier_s.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of MINI-BOSS the Headless Doorman: a tall doorman in a dark green uniform with two rows of gold buttons and gold epaulettes, but with NO HEAD, only a bloody neck stump above a high collar (the head part is just the stump and collar). side view, facing right | liggende |  |
| `kropp_speil_b.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the Mirror Patient: a thin patient whose head is an ornate gilded hand mirror on its handle (the glass is blank and cracked, the game shows a reflection in it), grey-green hospital gown with shards of mirror glued into it and a little blood around them. back view, facing away | liggende |  |
| `kropp_speil_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the Mirror Patient: a thin patient whose head is an ornate gilded hand mirror on its handle (the glass is blank and cracked, the game shows a reflection in it), grey-green hospital gown with shards of mirror glued into it and a little blood around them. front view, facing the viewer | liggende |  |
| `kropp_speil_s.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the Mirror Patient: a thin patient whose head is an ornate gilded hand mirror on its handle (the glass is blank and cracked, the game shows a reflection in it), grey-green hospital gown with shards of mirror glued into it and a little blood around them. side view, facing right | liggende |  |
| `kropp_tannlege_b.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of MINI-BOSS the Dentist: bald with a round head mirror on a headband, pince-nez, a big waxed mustache, a manic grin with several gold teeth, white coat with blood spots and a leather bandolier of pulled teeth. back view, facing away | liggende |  |
| `kropp_tannlege_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of MINI-BOSS the Dentist: bald with a round head mirror on a headband, pince-nez, a big waxed mustache, a manic grin with several gold teeth, white coat with blood spots and a leather bandolier of pulled teeth. front view, facing the viewer | liggende |  |
| `kropp_tannlege_s.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of MINI-BOSS the Dentist: bald with a round head mirror on a headband, pince-nez, a big waxed mustache, a manic grin with several gold teeth, white coat with blood spots and a leather bandolier of pulled teeth. side view, facing right | liggende |  |
| `kropp_trille_b.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the Wheelchair Patient: a bald old man with a bandage wound around his head and over one eye and a toothless grin, slumped in a creaky wooden wheelchair with big spoked wheels, a red and green plaid blanket over his knees and an IV stand with a yellow bag behind him (the body part is the chair, blanket and torso together; the chair reaches the floor). back view, facing away | kvadrat |  |
| `kropp_trille_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the Wheelchair Patient: a bald old man with a bandage wound around his head and over one eye and a toothless grin, slumped in a creaky wooden wheelchair with big spoked wheels, a red and green plaid blanket over his knees and an IV stand with a yellow bag behind him (the body part is the chair, blanket and torso together; the chair reaches the floor). front view, facing the viewer | kvadrat |  |
| `kropp_trille_s.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the Wheelchair Patient: a bald old man with a bandage wound around his head and over one eye and a toothless grin, slumped in a creaky wooden wheelchair with big spoked wheels, a red and green plaid blanket over his knees and an IV stand with a yellow bag behind him (the body part is the chair, blanket and torso together; the chair reaches the floor). side view, facing right | kvadrat |  |
| `portierhode.png` | the doorman's severed head carried as an object: pale and surprised, big mustache, green doorman's cap with a gold band, a little blood at the neck | kvadrat |  |
| `vaapen_klump.png` | a brown lump the Thrower holds in his hand (you know what it is), drawn alone | kvadrat |  |
| `vaapen_knippe.png` | a huge iron key ring with five big old brass keys, handle down | kvadrat |  |
| `vaapen_tang.png` | a giant pair of dental pliers with a gold tooth in the jaws, handles down | stående |  |

## Runde 8: animasjoner (spriteark) (5 bilder, 0 levert)

Ett bilde med like store ruter på én rad, lest fra venstre. Samme festepunkt i hver rute (samme midtpunkt eller samme bakkelinje), ellers hopper figuren. Filnavnet er anim_<navn>.png.

| Filnavn | Beskrivelse til ChatGPT | Format | Levert |
|---|---|---|---|
| `anim_blodsprut.png` | SPRITE SHEET, 6 equal cells in ONE row: a burst of droplets exploding outward and falling. Draw it in WHITE and light grey with dark outlines (the game colors it red, purple or yellow). Same ground line in every cell | ark, 6 ruter på rad |  |
| `anim_kasteklump.png` | SPRITE SHEET, 4 equal squares in ONE row: a brown lump spinning in the air, a quarter turn more in each frame. Same size and same center in every square | ark, 4 ruter på rad |  |
| `anim_kastesprut.png` | SPRITE SHEET, 4 equal cells in ONE row: a brown splash hitting the floor, from a small impact to a big splat with droplets flying up, then settling. Same ground line in every cell | ark, 4 ruter på rad |  |
| `anim_kjottbiter.png` | SHEET, 6 equal squares in ONE row, six different small gore bits, one per square: a chunk of meat, a bone, an eyeball with a nerve, a gold tooth, a finger, a piece of liver | ark, 6 ruter på rad |  |
| `anim_oye.png` | SPRITE SHEET, 5 equal cells in ONE row: an eye opening in a crack in a wall, from a closed slit to wide open, bloodshot white, NO pupil (the game adds the pupil). Same center in every cell | ark, 5 ruter på rad |  |

## Runde 9: HUD og menyer (UI-settet) (13 bilder, 0 levert)

Rammer og ikoner til HUD-en og menyene, etter ChatGPTs egne skisser. Paneler, kort, knapper, skilt og utklippstavle strekkes av spillet (9-delt): hjørnene beholder størrelsen og sidene strekkes, så all pynt må ligge i kanten og midten må være jevn. Ringene må være helt gjennomsiktige i midten.

| Filnavn | Beskrivelse til ChatGPT | Format | Levert |
|---|---|---|---|
| `ui_hjerte_full.png` | UI ICON: a full red cartoon heart with an ink outline and a small highlight | kvadrat |  |
| `ui_hjerte_halv.png` | UI ICON: the same heart, left half red and right half empty grey | kvadrat |  |
| `ui_hjerte_tom.png` | UI ICON: the same heart, empty and dark grey | kvadrat |  |
| `ui_hode.png` | UI: a phrenology head in profile facing LEFT, bald, with neck and shoulders cut off, a pale parchment-colored bust with ink outlines. NO brain regions and NO text (the game draws the four regions and labels on top). Square image, the skull fills the upper two thirds | kvadrat |  |
| `ui_ikon_journal.png` | UI ICON: an open leather-bound book, simple and bold | kvadrat |  |
| `ui_ikon_pause.png` | UI ICON: two thick vertical pause bars drawn in ink | kvadrat |  |
| `ui_knapp.png` | UI 9-SLICE BUTTON: a small empty parchment tile with a thick ink outline and a tiny brass pin in the top right corner. Nothing inside | kvadrat |  |
| `ui_kort.png` | UI 9-SLICE ABILITY CARD FRAME: an empty cream paper card with faint blue ruled lines, rounded corners and a brass pin at the top center. No picture, no text | stående |  |
| `ui_panel.png` | UI 9-SLICE PANEL: an empty parchment panel with a slightly torn edge, dark ink outline and small brass pins in the four corners. Nothing inside. Keep all detail within the outer 10 % so the middle can be stretched | liggende |  |
| `ui_ring_kart.png` | UI RING: a brass compass ring with a small N at the top and four knobs, the center COMPLETELY TRANSPARENT (the map goes inside) | kvadrat |  |
| `ui_ring_portrett.png` | UI RING: a thick round gold frame with rivets and an ink outline, the center COMPLETELY TRANSPARENT (a portrait goes inside) | kvadrat |  |
| `ui_skilt.png` | UI 9-SLICE SIGN: an empty wide parchment plaque with brass screws at both ends, for the room name. No text | liggende |  |
| `ui_utklipp.png` | UI 9-SLICE CLIPBOARD: an empty brown wooden clipboard with a brass clamp at the top center and a sheet of lined paper, seen straight on. No text | stående |  |

## Runde 1: kuriositetene (Isaac-gjenstander), apparater og lommerusk (71 bilder, 71 levert)

Gjenstandene man plukker opp og kombinerer. Små, tydelige og groteske, som gjenstandene i The Binding of Isaac. Bruk gjerne «ni ting»-arket fra DESIGN_BRIEF.md.

| Filnavn | Beskrivelse til ChatGPT | Format | Levert |
|---|---|---|---|
| `akt_adrenalin.png` | icon for an active gadget from a 1920s sanatorium: «Adrenalinsprøyte» (Seks sekunder med fart og kraft, og et lite plaster på såret.). Readable at small size | kvadrat | ja |
| `akt_blits.png` | icon for an active gadget from a 1920s sanatorium: «Kamera med magnesiumblits» (SI APPELSIN. Alle fiender du ser, blir blendet. Sjefer myser.). Readable at small size | kvadrat | ja |
| `akt_blodpose.png` | icon for an active gadget from a 1920s sanatorium: «Blodpose» (Fyller på 40 prosent helse. Gruppe ukjent.). Readable at small size | kvadrat | ja |
| `akt_bor.png` | icon for an active gadget from a 1920s sanatorium: «Tannlegebor» (Du snurrer med boret i to sekunder. Alt rundt deg tar skade og mister tenner.). Readable at small size | kvadrat | ja |
| `akt_defib.png` | icon for an active gadget from a 1920s sanatorium: «Bærbar defibrillator» (Et elektrisk støt rundt deg. Alle i nærheten tar skade og blir stående. Pytter får strøm.). Readable at small size | kvadrat | ja |
| `akt_duebur.png` | icon for an active gadget from a 1920s sanatorium: «Duebur» (Slipper ut fire duer som kjemper for deg en stund.). Readable at small size | kvadrat | ja |
| `akt_grammofon.png` | icon for an active gadget from a 1920s sanatorium: «Grammofon med vuggevise» (Alle i nærheten sovner. Musikken er ikke god.). Readable at small size | kvadrat | ja |
| `akt_meisel.png` | icon for an active gadget from a 1920s sanatorium: «Vaktmesterens meisel» (Tegner hele etasjen på kartet, med det hemmelige rommet, og knuser sprekker i nærheten.). Readable at small size | kvadrat | ja |
| `akt_stempelpute.png` | icon for an active gadget from a 1920s sanatorium: «Stempelpute» (AVSLÅTT på alle i rommet. De tar skade og står og venter i to sekunder.). Readable at small size | kvadrat | ja |
| `akt_stoppeklokke.png` | icon for an active gadget from a 1920s sanatorium: «Forstanderens stoppeklokke» (Fiendene går i sakte film i fem sekunder. Du gjør ikke det.). Readable at small size | kvadrat | ja |
| `glass_tomt.png` | an empty glass specimen jar with a metal lid, standing on a small wooden base (the game puts the item inside) | stående | ja |
| `kur_adrenalin.png` | item icon, a single grotesque 1920s hospital curiosity: «Hestesprøyte med adrenalin» (Raskere bein og raskere slag. Hjertet klager.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_bart.png` | item icon, a single grotesque 1920s hospital curiosity: «Pålimt bart» (Flere kritiske treff og bedre priser. Folk stoler på bart.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_blodtrykk.png` | item icon, a single grotesque 1920s hospital curiosity: «Livsfarlig høyt blodtrykk» (30 % mer skade. Du spruter litt når du blir truffet.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_boomerang.png` | item icon, a single grotesque 1920s hospital curiosity: «Tilbakefall» (Klumpene kommer tilbake. Som alt annet.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_brodsmuler.png` | item icon, a single grotesque 1920s hospital curiosity: «Brødsmuler i lomma» (En due følger deg inn i hvert rom som låses.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_bronkitt.png` | item icon, a single grotesque 1920s hospital curiosity: «Kronisk bronkitt» (Hostene kommer i treer. Legen sier det er normalt.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_celledeling.png` | item icon, a single grotesque 1920s hospital curiosity: «Ukontrollert celledeling» (Klumpene deler seg i tre når de treffer.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_cyste.png` | item icon, a single grotesque 1920s hospital curiosity: «Pratsom cyste» (Når du blir truffet, spytter den klumper i alle retninger.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_dikt.png` | item icon, a single grotesque 1920s hospital curiosity: «Dikt om mørket (14 vers)» (Står du stille, sovner fiender i nærheten av ren kjedsomhet.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_ekstra_tunge.png` | item icon, a single grotesque 1920s hospital curiosity: «Ekstra tunge» (Klumpene flyr lenger og raskere.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_elektro.png` | item icon, a single grotesque 1920s hospital curiosity: «Elektrosjokkbehandling» (Treff hopper videre til to fiender til.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_eterflaske.png` | item icon, a single grotesque 1920s hospital curiosity: «Evig eterflaske» (Fiender du treffer, sovner et øyeblikk.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_eyeliner.png` | item icon, a single grotesque 1920s hospital curiosity: «Tung eyeliner» (15 % mer skade når Morbidium er over 50. Tårene er malt på.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_fluepapir.png` | item icon, a single grotesque 1920s hospital curiosity: «Fluepapir» (Fluene dine gjør dobbel skade og fanger skudd.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_frost.png` | item icon, a single grotesque 1920s hospital curiosity: «Frostskadet tå» (Treff bremser fiender. Tåa var ikke din.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_glassoye.png` | item icon, a single grotesque 1920s hospital curiosity: «Lånt glassøye» (Lengre rekkevidde og flere kritiske treff. Eieren vil ha det tilbake.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_gulltann.png` | item icon, a single grotesque 1920s hospital curiosity: «Løs gulltann» (En ekstra tann per drap, og treff kan slå ut tenner.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_heliumlunge.png` | item icon, a single grotesque 1920s hospital curiosity: «Heliumlunge» (Du svever litt over gulvet. Pytter og strøm biter ikke på deg.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_hjerte_i_glass.png` | item icon, a single grotesque 1920s hospital curiosity: «Hjerte på glass» (Ett ekstra hjerte og full helse. Det slår fortsatt.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_hodeskalle.png` | item icon, a single grotesque 1920s hospital curiosity: «Hodeskalle med stearinlys» (Et lys brenner på hodet ditt. Fiender helt inntil deg tar brannskade.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_igle.png` | item icon, a single grotesque 1920s hospital curiosity: «Blodigler» (Treff gir deg litt helse tilbake. Iglene er fornøyde.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_kappe_lang.png` | item icon, a single grotesque 1920s hospital curiosity: «Altfor lang kappe» (En ekstra rull. Kappen feier gulvet for deg.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_karantene.png` | item icon, a single grotesque 1920s hospital curiosity: «Karantenebånd» (Fiender i låste rom har 20 % mindre helse.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_kvikksolv.png` | item icon, a single grotesque 1920s hospital curiosity: «Knust kvikksølvtermometer» (Treff forgifter. Ikke slikk på det.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_lavement.png` | item icon, a single grotesque 1920s hospital curiosity: «Lavement» (Når du løper fort, etterlater du et glatt, brunt spor. Fiender sklir.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_lommekirurgi.png` | item icon, a single grotesque 1920s hospital curiosity: «Lommekirurgi» (Alle slag gir blødning.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_magnet.png` | item icon, a single grotesque 1920s hospital curiosity: «Svelget magnet» (Klumpene søker mot nærmeste fiende. Den sitter der fortsatt.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_nitro.png` | item icon, a single grotesque 1920s hospital curiosity: «Nitroglyserintabletter» (For hjertet. Klumpene eksploderer.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_rattent_kjott.png` | item icon, a single grotesque 1920s hospital curiosity: «Råttent kjøtt» (Hver fiende du dreper, gir deg en flue som kjemper for deg.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_speil.png` | item icon, a single grotesque 1920s hospital curiosity: «Knust speil» (13 % sjanse for dobbel skade. 1 % sjanse for å kutte deg selv.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_sprett.png` | item icon, a single grotesque 1920s hospital curiosity: «Gummicelle» (Klumpene spretter på veggene.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_spyttkjertel.png` | item icon, a single grotesque 1920s hospital curiosity: «Overaktiv spyttkjertel» (Større, tregere og tyngre klumper.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_stemmegaffel.png` | item icon, a single grotesque 1920s hospital curiosity: «Stemmegaffel» (Tunge slag sender ut en sjokkbølge.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_surkal.png` | item icon, a single grotesque 1920s hospital curiosity: «Gammel surkål» (Når du ruller, slipper du en gass som gir fiender kvalme.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_svulst.png` | item icon, a single grotesque 1920s hospital curiosity: «Godartet svulst (sier de)» (To ekstra hjerter. Litt tregere. Den vokser.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_svulstvenn.png` | item icon, a single grotesque 1920s hospital curiosity: «Svulsten Sverre» (En svulst går i bane rundt deg og stopper prosjektiler.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_syl.png` | item icon, a single grotesque 1920s hospital curiosity: «Syl i spiserøret» (Klumpene går gjennom to fiender.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_tang.png` | item icon, a single grotesque 1920s hospital curiosity: «Tannlegens tang» (Klumpene dine blir til tenner: mer skade, og drap gir tenner.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_tannfe.png` | item icon, a single grotesque 1920s hospital curiosity: «Fanget tannfe» (Tannfeen henter tenner til deg på lang avstand.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `kur_tuberkulose.png` | item icon, a single grotesque 1920s hospital curiosity: «Tuberkuløs hoste» (Hvert slag hoster opp en slimklump. Ikke dekk til munnen.). Isaac-style item sprite, readable at small size | kvadrat | ja |
| `lomme_batteri.png` | icon for a small pocket trinket: «Lekkende batteri» (Apparatet ditt lades dobbelt så fort.). Tiny object, readable at small size | kvadrat | ja |
| `lomme_frosk.png` | icon for a small pocket trinket: «Tørket frosk» (Én gang per etasje tar frosken et dødelig slag for deg.). Tiny object, readable at small size | kvadrat | ja |
| `lomme_hestesko.png` | icon for a small pocket trinket: «Hestesko» (Flere kritiske treff.). Tiny object, readable at small size | kvadrat | ja |
| `lomme_kaninpote.png` | icon for a small pocket trinket: «Kaninpote fra tøffelen» (Rullingen lades 25 prosent raskere. Tøffelen savner den.). Tiny object, readable at small size | kvadrat | ja |
| `lomme_knappenal.png` | icon for a small pocket trinket: «Knappenål i fôret» (10 prosent mer skade når du har full helse.). Tiny object, readable at small size | kvadrat | ja |
| `lomme_kolapp.png` | icon for a small pocket trinket: «Kølapp nummer 1» (Første treff på hver fiende gjør 50 prosent mer skade. Du var først.). Tiny object, readable at small size | kvadrat | ja |
| `lomme_lanekort.png` | icon for a small pocket trinket: «Lånekort med stempel» (Alt koster 15 prosent mindre. Ingen sjekker datoen.). Tiny object, readable at small size | kvadrat | ja |
| `lomme_monokkel.png` | icon for a small pocket trinket: «Sprukket monokkel» (Du ser straks hvor den sprukne veggen er i hver etasje.). Tiny object, readable at small size | kvadrat | ja |
| `lomme_morfin.png` | icon for a small pocket trinket: «Morfindråpe» (Tre helse hver gang et rom er ryddet.). Tiny object, readable at small size | kvadrat | ja |
| `lomme_pastill.png` | icon for a small pocket trinket: «Halspastill» (Morbidium stiger 30 prosent saktere. Smaker mint og angst.). Tiny object, readable at small size | kvadrat | ja |
| `lomme_skalpell.png` | icon for a small pocket trinket: «Rusten skalpell» (Slag gir ofte blødning. Stivkrampevaksinen er utgått.). Tiny object, readable at small size | kvadrat | ja |
| `lomme_tannspeil.png` | icon for a small pocket trinket: «Tannlegespeil» (Tenner og hjerter trekkes til deg fra dobbelt så langt unna.). Tiny object, readable at small size | kvadrat | ja |
| `pille_pille_bla.png` | ONE small pill capsule, color: bla (rod=red, bla=blue, gul=yellow, hvit=white, svart=black, rosa=pink, gronn=green, flekket=white with red dots) | kvadrat | ja |
| `pille_pille_flekket.png` | ONE small pill capsule, color: flekket (rod=red, bla=blue, gul=yellow, hvit=white, svart=black, rosa=pink, gronn=green, flekket=white with red dots) | kvadrat | ja |
| `pille_pille_gronn.png` | ONE small pill capsule, color: gronn (rod=red, bla=blue, gul=yellow, hvit=white, svart=black, rosa=pink, gronn=green, flekket=white with red dots) | kvadrat | ja |
| `pille_pille_gul.png` | ONE small pill capsule, color: gul (rod=red, bla=blue, gul=yellow, hvit=white, svart=black, rosa=pink, gronn=green, flekket=white with red dots) | kvadrat | ja |
| `pille_pille_hvit.png` | ONE small pill capsule, color: hvit (rod=red, bla=blue, gul=yellow, hvit=white, svart=black, rosa=pink, gronn=green, flekket=white with red dots) | kvadrat | ja |
| `pille_pille_rod.png` | ONE small pill capsule, color: rod (rod=red, bla=blue, gul=yellow, hvit=white, svart=black, rosa=pink, gronn=green, flekket=white with red dots) | kvadrat | ja |
| `pille_pille_rosa.png` | ONE small pill capsule, color: rosa (rod=red, bla=blue, gul=yellow, hvit=white, svart=black, rosa=pink, gronn=green, flekket=white with red dots) | kvadrat | ja |
| `pille_pille_svart.png` | ONE small pill capsule, color: svart (rod=red, bla=blue, gul=yellow, hvit=white, svart=black, rosa=pink, gronn=green, flekket=white with red dots) | kvadrat | ja |

## Runde 2: evnekortene (13 bilder, 13 levert)

Størst gevinst først. Kortene vises i HUD-en og i journalen. Motivet midt i bildet, spillet tegner selve kortrammen.

| Filnavn | Beskrivelse til ChatGPT | Format | Levert |
|---|---|---|---|
| `kort_benektelse.png` | a speech bubble with a big red X. Square card illustration, subject centered | kvadrat | ja |
| `kort_brekning.png` | a pale cartoon head vomiting a green splash (funny, not gross). Square card illustration, subject centered | kvadrat | ja |
| `kort_due.png` | a grey city pigeon with a red eye and a puffed chest. Square card illustration, subject centered | kvadrat | ja |
| `kort_hydro.png` | a brass fire-hose nozzle spraying blue water. Square card illustration, subject centered | kvadrat | ja |
| `kort_kappe.png` | a dramatic black cape with purple lining, swirling. Square card illustration, subject centered | kvadrat | ja |
| `kort_lys.png` | an old medical examination lamp shining a bright yellow beam. Square card illustration, subject centered | kvadrat | ja |
| `kort_monolog.png` | a big speech bubble full of dramatic scribbles. Square card illustration, subject centered | kvadrat | ja |
| `kort_nokler.png` | a janitor's iron key ring with three old keys. Square card illustration, subject centered | kvadrat | ja |
| `kort_resept.png` | a prescription note with a red and white pill capsule. Square card illustration, subject centered | kvadrat | ja |
| `kort_skjema.png` | a blank official paper form with lines and a stamp box. Square card illustration, subject centered | kvadrat | ja |
| `kort_skyggehand.png` | a purple shadow hand made of dark smoke reaching upward. Square card illustration, subject centered | kvadrat | ja |
| `kort_stempel.png` | a red rubber office stamp slamming down with a splash of red ink. Square card illustration, subject centered | kvadrat | ja |
| `kort_ukjent.png` | a dark silhouette of a person with a question mark. Square card illustration, subject centered | kvadrat | ja |

## Runde 3: rekvisitter og møbler (73 bilder, 72 levert)

Møblene står i 3/4-vinkel: du ser fronten og litt av toppen. Bunnen av møbelet helt nederst i motivet.

| Filnavn | Beskrivelse til ChatGPT | Format | Levert |
|---|---|---|---|
| `alter3.png` | a stone altar draped in purple cloth with two lit candles, three tiles wide, front view | liggende | ja |
| `arkivhylle3.png` | a tall dark archive shelf stuffed with folders and boxes, three tiles wide | liggende | ja |
| `celle.png` | a padded cell corner: quilted white walls, two tiles wide | kvadrat | ja |
| `disk_kafeteria4.png` | a long wooden cafeteria counter with a steel soup pot and bread, 4 tiles wide, front view | liggende | ja |
| `disk_kafeteria5.png` | a long wooden cafeteria counter with a steel soup pot and bread, front view | liggende | ja |
| `disk_medisin3.png` | a wooden medicine counter with small glass bottles, front view | liggende | ja |
| `disk_vaktmester3.png` | a janitor's workbench counter with tools and a vise, front view | liggende | ja |
| `garderobes.png` | a tall wooden wardrobe, side view | stående | ja |
| `hylleb11.png` | hylleb11 | stående | ja |
| `hyllef11.png` | hyllef11 | stående | ja |
| `hylles11.png` | hylles11 | stående | ja |
| `journalskap.png` | a large dark wooden filing cabinet with many drawers, one drawer glowing purple, front view | stående | ja |
| `kiste12.png` | a dark wooden coffin with a slightly raised lid and a small brass name plate, lying lengthwise into the picture (one tile wide, two tiles deep) | stående |  |
| `kiste_lukket.png` | a small wooden treasure chest with iron bands, closed | kvadrat | ja |
| `kiste_open.png` | the same chest, open, gold teeth inside | kvadrat | ja |
| `kommodef.png` | a wooden chest of drawers, front view | liggende | ja |
| `lik.png` | a dead patient in a yellow bathrobe lying on the floor, X eyes, comedic, seen from above at an angle | liggende | ja |
| `medisinskap.png` | a white enamel medicine cabinet with glass doors and bottles inside | stående | ja |
| `offeralter.png` | a sacrificial altar of dark stone with a bowl of blood and red candles | liggende | ja |
| `olsenskap.png` | a grey steel locker with a big padlock, front view | stående | ja |
| `prop_bench.png` | a wooden waiting-room bench, front view | liggende | ja |
| `prop_bokstabel.png` | a wobbly stack of old leather-bound books | kvadrat | ja |
| `prop_bord.png` | a small white enamel hospital table | kvadrat | ja |
| `prop_botte.png` | a zinc mop bucket with a mop standing in it | stående | ja |
| `prop_chair.png` | a wooden waiting-room chair, front view | stående | ja |
| `prop_chair_b.png` | the same wooden chair seen from behind | stående | ja |
| `prop_crate.png` | a wooden crate | kvadrat | ja |
| `prop_do.png` | an old porcelain toilet with a wooden seat, front view | stående | ja |
| `prop_drain.png` | a round iron floor drain seen from straight above (flat on the floor) | liggende | ja |
| `prop_forbannet.png` | a cursed floor sigil: a red glowing occult circle scratched into the floor, seen from above (flat on the floor) | kvadrat | ja |
| `prop_kjetting.png` | a rusty iron chain hanging from above with a meat hook at the end | stående | ja |
| `prop_kurv.png` | a wicker laundry basket full of white sheets | kvadrat | ja |
| `prop_lamp.png` | a tall standing medical examination lamp | stående | ja |
| `prop_lesestol.png` | a worn green leather reading armchair | kvadrat | ja |
| `prop_linhaug.png` | a heap of dirty white hospital linen | kvadrat | ja |
| `prop_luke.png` | an open wooden trapdoor in the floor with darkness below, seen from above | kvadrat | ja |
| `prop_lys.png` | three white candles of different heights, lit | kvadrat | ja |
| `prop_madrass.png` | a thin striped mattress lying on the floor, stained | liggende | ja |
| `prop_menytavle.png` | a small chalkboard menu sign on legs reading nothing (the game adds no text), cafeteria style | stående | ja |
| `prop_papirhaug.png` | a knee-high heap of loose papers and files | kvadrat | ja |
| `prop_pillar.png` | a stone pillar with a simple capital | stående | ja |
| `prop_plant.png` | a potted palm in a terracotta pot | stående | ja |
| `prop_side.png` | a small wooden side stand | stående | ja |
| `prop_soppel.png` | a metal trash can overflowing with paper | kvadrat | ja |
| `prop_strykebrett.png` | an old wooden ironing board with a heavy iron | kvadrat | ja |
| `prop_torkesnor3.png` | a drying line on two poles with white sheets hanging, three tiles wide | liggende | ja |
| `prop_trolley.png` | a steel hospital trolley with bottles and a folded towel | kvadrat | ja |
| `prop_tvangstroye.png` | an empty straitjacket hanging on a coat stand | stående | ja |
| `prop_vekt.png` | an old upright doctor's weighing scale with a sliding weight bar | stående | ja |
| `pult.png` | a wooden writing desk with papers and an inkwell, front view | kvadrat | ja |
| `seng_bed12n.png` | an iron hospital bed with white sheets and a blue blanket, lengthwise into the picture, head end far away (top) | stående | ja |
| `seng_bed12s.png` | an iron hospital bed with white sheets and a blue blanket, lengthwise into the picture, head end nearest the viewer (bottom) | stående | ja |
| `seng_bed21e.png` | an iron hospital bed with white sheets and a blue blanket, sideways, head end on the right | liggende | ja |
| `seng_bed21w.png` | an iron hospital bed with white sheets and a blue blanket, sideways, head end on the left | liggende | ja |
| `seng_gurney12n.png` | a steel hospital stretcher on wheels, lengthwise into the picture, head end far away (top) | stående | ja |
| `seng_gurney12s.png` | a steel hospital stretcher on wheels, lengthwise into the picture, head end nearest the viewer (bottom) | stående | ja |
| `seng_gurney21e.png` | a steel hospital stretcher on wheels, sideways, head end on the right | liggende | ja |
| `seng_gurney21w.png` | a steel hospital stretcher on wheels, sideways, head end on the left | liggende | ja |
| `seng_optable12n.png` | a steel operating table with blood stains and an overhead lamp arm, lengthwise into the picture, head end far away (top) | stående | ja |
| `seng_tub12n.png` | an old clawfoot bathtub filled with murky water, lengthwise into the picture, head end far away (top) | stående | ja |
| `seng_tub12s.png` | an old clawfoot bathtub filled with murky water, lengthwise into the picture, head end nearest the viewer (bottom) | stående | ja |
| `seng_tub21e.png` | an old clawfoot bathtub filled with murky water, sideways, head end on the right | liggende | ja |
| `seng_tub21w.png` | an old clawfoot bathtub filled with murky water, sideways, head end on the left | liggende | ja |
| `sjakt.png` | a metal laundry chute hatch set in a steel box | stående | ja |
| `skapb11.png` | skapb11 | stående | ja |
| `skapf11.png` | skapf11 | stående | ja |
| `skaps11.png` | skaps11 | stående | ja |
| `sperre.png` | a barricade of wooden planks with red and white warning stripes | kvadrat | ja |
| `sprekkvegg.png` | a cracked section of wall with light shining through the crack | stående | ja |
| `vaskemaskin2.png` | two old industrial washing machines side by side with round glass doors, front view | liggende | ja |
| `vaskemaskin3.png` | old industrial washing machines side by side with round glass doors, 3 tiles wide, front view | liggende | ja |
| `verktoytavle1.png` | a pegboard with hanging tools (hammers, saws, keys), 1 tiles wide, front view | stående | ja |
| `verktoytavle2.png` | a pegboard with hanging tools (hammers, saws, keys), 2 tiles wide, front view | liggende | ja |

## Runde 4: plukk, effekter, tillegg og pynt (34 bilder, 33 levert)

Små ting. Enkle former, tydelig kontur.

| Filnavn | Beskrivelse til ChatGPT | Format | Levert |
|---|---|---|---|
| `due_figur.png` | a grey city pigeon standing, side view | kvadrat | ja |
| `flaske_eter.png` | a blue glass ether bottle with a cork | stående | ja |
| `flaske_kamfer.png` | an orange camphor ointment tin | stående | ja |
| `flaske_levertran.png` | a small brown glass bottle of cod liver oil with a cork | stående | ja |
| `flaske_luktesalt.png` | a small white smelling-salts jar with a red cap | stående | ja |
| `hjerte.png` | a small red cartoon heart (health pickup) | kvadrat | ja |
| `kortplukk.png` | an ability card lying on the floor, slightly tilted, face down with a purple back (pickup) | stående | ja |
| `morbdrape.png` | a glowing purple liquid droplet (pickup) | kvadrat | ja |
| `puff0.png` | a small cartoon dust cloud puff, beige with a brown outline | kvadrat | ja |
| `puff1.png` | a small cartoon dust cloud puff, beige with a brown outline | kvadrat | ja |
| `puff2.png` | a small cartoon dust cloud puff, beige with a brown outline | kvadrat | ja |
| `pupill.png` | a small red iris with a black pupil and a white highlight | kvadrat |  |
| `pynt_harnett.png` | a thin dark hair net shaped like a dome (drawn alone) | liggende | ja |
| `pynt_hjelm.png` | a padded brown leather protective helmet with brass rivets (drawn alone) | liggende | ja |
| `pynt_nattlue.png` | a striped red and white nightcap with a pompom, drooping to the side (worn on a head, drawn alone) | kvadrat | ja |
| `pynt_papiljotter.png` | five pastel hair curlers in a row, as worn on top of a head (drawn alone) | liggende | ja |
| `pynt_plaster.png` | a crossed pair of beige sticking plasters | kvadrat | ja |
| `pynt_rosett.png` | a small red hair bow | liggende | ja |
| `pynt_sting.png` | a short stitched scar with black stitches | liggende | ja |
| `skudd_slim.png` | a small glob of green-yellow phlegm (projectile) | kvadrat | ja |
| `skyggehand_p.png` | a purple smoky shadow hand flying forward (projectile) | kvadrat | ja |
| `stempelmerke.png` | a smudged red rectangular rubber-stamp imprint | liggende | ja |
| `stjerne.png` | a white and yellow comic impact star burst | kvadrat | ja |
| `tann.png` | a single gold tooth (currency pickup) | kvadrat | ja |
| `tillegg_bandasje.png` | a tiny add-on worn by the player character: a head bandage with a red spot. Tiny, drawn alone | liggende | ja |
| `tillegg_bart.png` | a tiny add-on worn by the player character: a glued-on mustache. Tiny, drawn alone | liggende | ja |
| `tillegg_eyeliner.png` | a tiny add-on worn by the player character: heavy black eyeliner around two eyes. Tiny, drawn alone | liggende | ja |
| `tillegg_glassoye.png` | a tiny add-on worn by the player character: a glass eye. Tiny, drawn alone | kvadrat | ja |
| `tillegg_horn.png` | a tiny add-on worn by the player character: two small devil horns. Tiny, drawn alone | liggende | ja |
| `tillegg_igler.png` | a tiny add-on worn by the player character: three leeches. Tiny, drawn alone | kvadrat | ja |
| `tillegg_lys.png` | a tiny add-on worn by the player character: a lit candle stuck on the head. Tiny, drawn alone | stående | ja |
| `tillegg_svulst.png` | a tiny add-on worn by the player character: a pink lump on the head. Tiny, drawn alone | kvadrat | ja |
| `tillegg_tunge.png` | a tiny add-on worn by the player character: a tongue sticking out. Tiny, drawn alone | stående | ja |
| `torner.png` | a tangle of black thorny vines (a hazard lying on the floor) | kvadrat | ja |

## Runde 5: våpen (10 bilder, 7 levert)

Våpenet står loddrett med håndtaket nederst og tuppen opp. Spillet roterer det selv.

| Filnavn | Beskrivelse til ChatGPT | Format | Levert |
|---|---|---|---|
| `vaapen_bekken.png` | a white enamel bedpan on a handle | stående | ja |
| `vaapen_gasskolbe.png` | a glass ether bottle with a cork, held as a weapon | stående |  |
| `vaapen_krok.png` | a surgeon's large bone hook | stående | ja |
| `vaapen_mopp.png` | a janitor's mop, wooden handle, grey clamp, strings dripping purple | stående | ja |
| `vaapen_sag.png` | a bone saw with a wooden handle | stående | ja |
| `vaapen_skjemabunke.png` | a messy stack of official paper forms held as a weapon | kvadrat |  |
| `vaapen_slange.png` | a rubber hose with a brass nozzle | stående | ja |
| `vaapen_sproyte.png` | a large glass syringe | stående | ja |
| `vaapen_stativ.png` | an IV drip stand: metal pole with an empty drip bag | stående | ja |
| `vaapen_stempelboss.png` | a giant wooden office stamp with a red rubber foot, handle down | stående |  |

## Runde 6: figurer (91 bilder, 91 levert)

Vanskeligst. Be først om et figurark (samme figur forfra, bakfra, fra siden), og deretter om hode og kropp hver for seg fra arket. Armer og bein tegner spillet selv som tykke streker, så de skal ikke være med.

| Filnavn | Beskrivelse til ChatGPT | Format | Levert |
|---|---|---|---|
| `blob_flue_b.png` | a fat bluebottle meat fly with big red eyes. back view, facing away | liggende | ja |
| `blob_flue_f.png` | a fat bluebottle meat fly with big red eyes. front view, facing the viewer | liggende | ja |
| `blob_flue_s.png` | a fat bluebottle meat fly with big red eyes. side view, facing right | liggende | ja |
| `blob_journalen_b.png` | FINAL BOSS: the Journal, a huge floating leather-bound patient journal with tentacles and teeth, pages flapping. back view, facing away | liggende | ja |
| `blob_journalen_f.png` | FINAL BOSS: the Journal, a huge floating leather-bound patient journal with tentacles and teeth, pages flapping. front view, facing the viewer | liggende | ja |
| `blob_journalen_s.png` | FINAL BOSS: the Journal, a huge floating leather-bound patient journal with tentacles and teeth, pages flapping. side view, facing right | liggende | ja |
| `blob_lunge_b.png` | a pink human lung walking on its own, tar spots, tiny sad face. back view, facing away | kvadrat | ja |
| `blob_lunge_f.png` | a pink human lung walking on its own, tar spots, tiny sad face. front view, facing the viewer | kvadrat | ja |
| `blob_lunge_s.png` | a pink human lung walking on its own, tar spots, tiny sad face. side view, facing right | kvadrat | ja |
| `blob_oyeblomst_b.png` | an eye flower: a fleshy stalk rooted in the floor with a big bloodshot eye as its bloom. back view, facing away | stående | ja |
| `blob_oyeblomst_f.png` | an eye flower: a fleshy stalk rooted in the floor with a big bloodshot eye as its bloom. front view, facing the viewer | stående | ja |
| `blob_oyeblomst_s.png` | an eye flower: a fleshy stalk rooted in the floor with a big bloodshot eye as its bloom. side view, facing right | stående | ja |
| `blob_rotte_b.png` | a fat grey archive rat with a paper slip in its mouth. back view, facing away | liggende | ja |
| `blob_rotte_f.png` | a fat grey archive rat with a paper slip in its mouth. front view, facing the viewer | liggende | ja |
| `blob_rotte_s.png` | a fat grey archive rat with a paper slip in its mouth. side view, facing right | liggende | ja |
| `blob_svulst_b.png` | a walking pink tumor with veins, one eye and a grin. back view, facing away | liggende | ja |
| `blob_svulst_f.png` | a walking pink tumor with veins, one eye and a grin. front view, facing the viewer | liggende | ja |
| `blob_svulst_s.png` | a walking pink tumor with veins, one eye and a grin. side view, facing right | liggende | ja |
| `blob_tvang_b.png` | an enemy patient in a straitjacket, arms bound, hopping, wild eyes. back view, facing away | stående | ja |
| `blob_tvang_f.png` | an enemy patient in a straitjacket, arms bound, hopping, wild eyes. front view, facing the viewer | stående | ja |
| `blob_tvang_s.png` | an enemy patient in a straitjacket, arms bound, hopping, wild eyes. side view, facing right | stående | ja |
| `blob_yngel_b.png` | drain spawn: a small purple slime creature with mismatched eyes and a toothy grin. back view, facing away | liggende | ja |
| `blob_yngel_f.png` | drain spawn: a small purple slime creature with several mismatched eyes and a toothy grin, front view | liggende | ja |
| `blob_yngel_s.png` | drain spawn: a small purple slime creature with mismatched eyes and a toothy grin. side view, facing right | liggende | ja |
| `hode_arkivar_f.png` | HEAD ONLY (no neck, no body) of BOSS: chief archivist Gunhild Paragraf, tall and severe, grey hair bun, pince-nez, dusty grey suit covered in stamps and paper slips. front view, facing the viewer | kvadrat | ja |
| `hode_bibliotekar_f.png` | HEAD ONLY (no neck, no body) of Ask the librarian, hair in a bun, small glasses, purple cardigan. front view, facing the viewer | kvadrat | ja |
| `hode_byrakrat_f.png` | HEAD ONLY (no neck, no body) of a hollow-eyed bureaucrat in a black suit and red tie, arms full of forms. front view, facing the viewer | kvadrat | ja |
| `hode_hansen_f.png` | HEAD ONLY (no neck, no body) of Sister Hansen, a strict older nurse with a white cap. front view, facing the viewer | kvadrat | ja |
| `hode_kokk_f.png` | HEAD ONLY (no neck, no body) of Fru Ruud, a round friendly cafeteria cook lady with a tall white chef hat and an apron. front view, facing the viewer | kvadrat | ja |
| `hode_krok_f.png` | HEAD ONLY (no neck, no body) of BOSS: Chief surgeon Hektor Krok, huge and menacing, head mirror on his forehead, white coat with a blood-stained red apron. front view, facing the viewer | kvadrat | ja |
| `hode_kultist_b.png` | HEAD ONLY (no neck, no body) of a pale gloomy edgelord teenager cultist, dark hood, black eye makeup, skinny black robe with four leather belts with gold buckles. back view, facing away | kvadrat | ja |
| `hode_kultist_f.png` | HEAD ONLY (no neck, no body) of a pale gloomy edgelord teenager cultist, dark hood, black eye makeup, skinny black robe with four leather belts with gold buckles. front view, facing the viewer | kvadrat | ja |
| `hode_kultist_s.png` | HEAD ONLY (no neck, no body) of a pale gloomy edgelord teenager cultist, dark hood, black eye makeup, skinny black robe with four leather belts with gold buckles. side view, facing right | kvadrat | ja |
| `hode_narkose_f.png` | HEAD ONLY (no neck, no body) of an anesthetist in a green surgical gown with a rubber ether mask and a big glass bottle. front view, facing the viewer | kvadrat | ja |
| `hode_olsen_f.png` | HEAD ONLY (no neck, no body) of Olsen the janitor, grey cap, bushy grey mustache, grey overalls. front view, facing the viewer | kvadrat | ja |
| `hode_oppasser_b.png` | HEAD ONLY (no neck, no body) of a tall thin hospital orderly in mint-green scrubs, surgical cap and white face mask, tired squinting eyes. back view, facing away | kvadrat | ja |
| `hode_oppasser_f.png` | HEAD ONLY (no neck, no body) of a tall thin hospital orderly in mint-green scrubs, surgical cap and white face mask, tired squinting eyes. front view, facing the viewer | kvadrat | ja |
| `hode_oppasser_s.png` | HEAD ONLY (no neck, no body) of a tall thin hospital orderly in mint-green scrubs, surgical cap and white face mask, tired squinting eyes. side view, facing right | kvadrat | ja |
| `hode_pasient_b.png` | HEAD ONLY (no neck, no body) of the player: a small patient with messy black hair, big round glasses, rosy cheeks, mustard-yellow bathrobe with a brown belt and an ID badge. back view, facing away | kvadrat | ja |
| `hode_pasient_f.png` | HEAD ONLY (no neck, no body) of the player: a small patient with messy black hair, big round glasses, rosy cheeks, mustard-yellow bathrobe with a brown belt and an ID badge. front view, facing the viewer | kvadrat | ja |
| `hode_pasient_kvinne_b.png` | HEAD ONLY (no neck, no body) of the player, female version: a small patient woman with messy long dark hair, a white hair clip, big round glasses, rosy cheeks, mustard-yellow bathrobe with a brown belt. back view, facing away | kvadrat | ja |
| `hode_pasient_kvinne_f.png` | HEAD ONLY (no neck, no body) of the player, female version: a small patient woman with messy long dark hair, a white hair clip, big round glasses, rosy cheeks, mustard-yellow bathrobe with a brown belt. front view, facing the viewer | kvadrat | ja |
| `hode_pasient_kvinne_s.png` | HEAD ONLY (no neck, no body) of the player, female version: a small patient woman with messy long dark hair, a white hair clip, big round glasses, rosy cheeks, mustard-yellow bathrobe with a brown belt. side view, facing right | kvadrat | ja |
| `hode_pasient_s.png` | HEAD ONLY (no neck, no body) of the player: a small patient with messy black hair, big round glasses, rosy cheeks, mustard-yellow bathrobe with a brown belt and an ID badge. side view, facing right | kvadrat | ja |
| `hode_pasient_x.png` | HEAD ONLY (no neck, no body) of the player: a small patient with messy black hair, big round glasses, rosy cheeks, mustard-yellow bathrobe with a brown belt and an ID badge. front view, dead with X marks over the eyes (comedic) | kvadrat | ja |
| `hode_pleier_b.png` | HEAD ONLY (no neck, no body) of a big stern nurse, square jaw, angry brows, hair in a bun, white cap with a red cross, boxy white uniform with apron. back view, facing away | kvadrat | ja |
| `hode_pleier_f.png` | HEAD ONLY (no neck, no body) of a big stern nurse, square jaw, angry brows, hair in a bun, white cap with a red cross, boxy white uniform with apron. front view, facing the viewer | kvadrat | ja |
| `hode_pleier_s.png` | HEAD ONLY (no neck, no body) of a big stern nurse, square jaw, angry brows, hair in a bun, white cap with a red cross, boxy white uniform with apron. side view, facing right | kvadrat | ja |
| `hode_rust_f.png` | HEAD ONLY (no neck, no body) of BOSS: hydrotherapist Ragnvald Rust, rubber diving-style helmet with round goggles, black rubber apron, big and damp. front view, facing the viewer | kvadrat | ja |
| `kappe_kultist_b.png` | the long black cape with purple lining ALONE, hanging of a pale gloomy edgelord teenager cultist, dark hood, black eye makeup, skinny black robe with four leather belts with gold buckles. back view, facing away | kvadrat | ja |
| `kappe_kultist_f.png` | the long black cape with purple lining ALONE, hanging of a pale gloomy edgelord teenager cultist, dark hood, black eye makeup, skinny black robe with four leather belts with gold buckles. front view, facing the viewer | kvadrat | ja |
| `kappe_kultist_s.png` | the long black cape with purple lining ALONE, hanging of a pale gloomy edgelord teenager cultist, dark hood, black eye makeup, skinny black robe with four leather belts with gold buckles. side view, facing right | kvadrat | ja |
| `kropp_arkivar_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of BOSS: chief archivist Gunhild Paragraf, tall and severe, grey hair bun, pince-nez, dusty grey suit covered in stamps and paper slips. front view, facing the viewer | liggende | ja |
| `kropp_bibliotekar_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of Ask the librarian, hair in a bun, small glasses, purple cardigan. front view, facing the viewer | liggende | ja |
| `kropp_byrakrat_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a hollow-eyed bureaucrat in a black suit and red tie, arms full of forms. front view, facing the viewer | liggende | ja |
| `kropp_hansen_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of Sister Hansen, a strict older nurse with a white cap. front view, facing the viewer | liggende | ja |
| `kropp_kokk_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of Fru Ruud, a round friendly cafeteria cook lady with a tall white chef hat and an apron. front view, facing the viewer | liggende | ja |
| `kropp_krok_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of BOSS: Chief surgeon Hektor Krok, huge and menacing, head mirror on his forehead, white coat with a blood-stained red apron. front view, facing the viewer | liggende | ja |
| `kropp_kultist_b.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a pale gloomy edgelord teenager cultist, dark hood, black eye makeup, skinny black robe with four leather belts with gold buckles. back view, facing away | liggende | ja |
| `kropp_kultist_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a pale gloomy edgelord teenager cultist, dark hood, black eye makeup, skinny black robe with four leather belts with gold buckles. front view, facing the viewer | liggende | ja |
| `kropp_kultist_s.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a pale gloomy edgelord teenager cultist, dark hood, black eye makeup, skinny black robe with four leather belts with gold buckles. side view, facing right | liggende | ja |
| `kropp_narkose_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of an anesthetist in a green surgical gown with a rubber ether mask and a big glass bottle. front view, facing the viewer | liggende | ja |
| `kropp_olsen_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of Olsen the janitor, grey cap, bushy grey mustache, grey overalls. front view, facing the viewer | liggende | ja |
| `kropp_oppasser_b.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a tall thin hospital orderly in mint-green scrubs, surgical cap and white face mask, tired squinting eyes. back view, facing away | liggende | ja |
| `kropp_oppasser_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a tall thin hospital orderly in mint-green scrubs, surgical cap and white face mask, tired squinting eyes. front view, facing the viewer | liggende | ja |
| `kropp_oppasser_s.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a tall thin hospital orderly in mint-green scrubs, surgical cap and white face mask, tired squinting eyes. side view, facing right | liggende | ja |
| `kropp_pasient_b.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the player: a small patient with messy black hair, big round glasses, rosy cheeks, mustard-yellow bathrobe with a brown belt and an ID badge. back view, facing away | liggende | ja |
| `kropp_pasient_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the player: a small patient with messy black hair, big round glasses, rosy cheeks, mustard-yellow bathrobe with a brown belt and an ID badge. front view, facing the viewer | liggende | ja |
| `kropp_pasient_kvinne_b.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the player, female version: a small patient woman with messy long dark hair, a white hair clip, big round glasses, rosy cheeks, mustard-yellow bathrobe with a brown belt. back view, facing away | liggende | ja |
| `kropp_pasient_kvinne_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the player, female version: a small patient woman with messy long dark hair, a white hair clip, big round glasses, rosy cheeks, mustard-yellow bathrobe with a brown belt. front view, facing the viewer | liggende | ja |
| `kropp_pasient_kvinne_s.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the player, female version: a small patient woman with messy long dark hair, a white hair clip, big round glasses, rosy cheeks, mustard-yellow bathrobe with a brown belt. side view, facing right | liggende | ja |
| `kropp_pasient_s.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the player: a small patient with messy black hair, big round glasses, rosy cheeks, mustard-yellow bathrobe with a brown belt and an ID badge. side view, facing right | liggende | ja |
| `kropp_pleier_b.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a big stern nurse, square jaw, angry brows, hair in a bun, white cap with a red cross, boxy white uniform with apron. back view, facing away | liggende | ja |
| `kropp_pleier_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a big stern nurse, square jaw, angry brows, hair in a bun, white cap with a red cross, boxy white uniform with apron. front view, facing the viewer | liggende | ja |
| `kropp_pleier_s.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a big stern nurse, square jaw, angry brows, hair in a bun, white cap with a red cross, boxy white uniform with apron. side view, facing right | liggende | ja |
| `kropp_pyjamas_b.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the player patient wearing white pyjamas with vertical blue stripes, a lapel collar, buttons and a breast pocket (the clothes only). back view, facing away | liggende | ja |
| `kropp_pyjamas_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the player patient wearing white pyjamas with vertical blue stripes, a lapel collar, buttons and a breast pocket (the clothes only). front view, facing the viewer | liggende | ja |
| `kropp_pyjamas_s.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the player patient wearing white pyjamas with vertical blue stripes, a lapel collar, buttons and a breast pocket (the clothes only). side view, facing right | liggende | ja |
| `kropp_rust_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of BOSS: hydrotherapist Ragnvald Rust, rubber diving-style helmet with round goggles, black rubber apron, big and damp. front view, facing the viewer | liggende | ja |
| `kropp_skjorte_b.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the player patient wearing a pale blue hospital gown with a tiny diamond pattern and short sleeves; seen from behind it is open with ties and white polka-dot underpants (the clothes only). back view, facing away | liggende | ja |
| `kropp_skjorte_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the player patient wearing a pale blue hospital gown with a tiny diamond pattern and short sleeves; seen from behind it is open with ties and white polka-dot underpants (the clothes only). front view, facing the viewer | liggende | ja |
| `kropp_skjorte_s.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the player patient wearing a pale blue hospital gown with a tiny diamond pattern and short sleeves; seen from behind it is open with ties and white polka-dot underpants (the clothes only). side view, facing right | liggende | ja |
| `kropp_tvang_b.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the player patient wearing an off-white canvas straitjacket with brown leather straps and brass buckles, one loose strap dangling (the clothes only). back view, facing away | liggende | ja |
| `kropp_tvang_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the player patient wearing an off-white canvas straitjacket with brown leather straps and brass buckles, one loose strap dangling (the clothes only). front view, facing the viewer | liggende | ja |
| `kropp_tvang_s.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the player patient wearing an off-white canvas straitjacket with brown leather straps and brass buckles, one loose strap dangling (the clothes only). side view, facing right | liggende | ja |
| `sko_barfot.png` | ONE bare human foot with toes, side view | liggende | ja |
| `sko_hvit.png` | ONE white nurse clog, side view | liggende | ja |
| `sko_klogg.png` | ONE black clog, side view | liggende | ja |
| `sko_sokk.png` | ONE grey wool sock with a red band, side view | liggende | ja |
| `sko_stovel.png` | ONE black pointy boot, side view | liggende | ja |
| `sko_tofler.png` | ONE pink bunny slipper with little ears, front view | liggende | ja |
