# Morbidium: kunstbrief for bildegenerering

Denne fila er laget av `tools/lag_brief.py` fra `assets/manifest.json`. Ikke rediger den for hånd; endre skriptet og kjør det på nytt.

## Slik gjør du det

1. Lim inn stilblokken under i ChatGPT én gang, og be den bruke stilen for alle bildene i samtalen.
2. Be om ett bilde om gangen: «Draw: <beskrivelse fra tabellen>». Bruk formatet i tabellen (kvadrat 1024x1024, stående 1024x1536, liggende 1536x1024).
3. Last ned bildet som PNG og gi det nøyaktig filnavnet fra tabellen, for eksempel `kort_due.png`.
4. Last det opp til `gpt-grafikk/` i repoet (Add file, Upload files).
5. Resten gjør Claude: `python3 tools/behandle_bilder.py` fjerner eventuell bakgrunn, beskjærer, skalerer og setter festepunktet, og `python3 build.py` bygger bildet inn i spillet. Alt som ikke har bilde ennå, tegnes av koden som før.

Status: 150 av 287 bilder er levert. Kolonnen «Levert» viser hvilke.

## Stilblokk (lim inn i ChatGPT)

```
Style: hand-drawn cartoon game art in the style of Conan Chop Chop mixed with Castle Crashers. Thick dark brown ink outlines (#2a1a14) with a slightly wobbly, hand-inked line that is heavier on the lower right. Flat colors with one darker cel-shade tone on the lower right and a small light highlight on the upper left. Muted, warm 1920s palette. Setting: a 1920s Norwegian sanatorium, Lovecraftian and a bit gross, but with dark humor. Camera: seen from the front and slightly above (about 50 degrees), like a top-down action game, so objects show their front and a little of their top.
Technical: PNG with a TRANSPARENT background. Exactly one object, centered, fully visible (not cropped). No ground shadow, no text, no frame, no background scenery.
```

## Tips

- Samme stil i alle bilder er viktigere enn at hvert enkelt bilde er perfekt. Bruk samme ChatGPT-samtale for en hel runde.
- Gjennomsiktig bakgrunn er best. Hvit eller ensfarget bakgrunn går også, verktøyet fjerner den fra kantene og innover.
- Ikke tegn skygge på bakken. Spillet legger på skygge og lys selv.

## Runde 1: kuriositetene (Isaac-gjenstander), apparater og lommerusk (71 bilder, 49 levert)

Gjenstandene man plukker opp og kombinerer. Små, tydelige og groteske, som gjenstandene i The Binding of Isaac. Bruk gjerne «ni ting»-arket fra DESIGN_BRIEF.md.

| Filnavn | Beskrivelse til ChatGPT | Format | Levert |
|---|---|---|---|
| `akt_adrenalin.png` | icon for an active gadget from a 1920s sanatorium: «Adrenalinsprøyte» (Seks sekunder med fart og kraft, og et lite plaster på såret.). Readable at small size | kvadrat |  |
| `akt_blits.png` | icon for an active gadget from a 1920s sanatorium: «Kamera med magnesiumblits» (SI APPELSIN. Alle fiender du ser, blir blendet. Sjefer myser.). Readable at small size | kvadrat |  |
| `akt_blodpose.png` | icon for an active gadget from a 1920s sanatorium: «Blodpose» (Fyller på 40 prosent helse. Gruppe ukjent.). Readable at small size | kvadrat |  |
| `akt_bor.png` | icon for an active gadget from a 1920s sanatorium: «Tannlegebor» (Du snurrer med boret i to sekunder. Alt rundt deg tar skade og mister tenner.). Readable at small size | kvadrat |  |
| `akt_defib.png` | icon for an active gadget from a 1920s sanatorium: «Bærbar defibrillator» (Et elektrisk støt rundt deg. Alle i nærheten tar skade og blir stående. Pytter får strøm.). Readable at small size | kvadrat |  |
| `akt_duebur.png` | icon for an active gadget from a 1920s sanatorium: «Duebur» (Slipper ut fire duer som kjemper for deg en stund.). Readable at small size | kvadrat |  |
| `akt_grammofon.png` | icon for an active gadget from a 1920s sanatorium: «Grammofon med vuggevise» (Alle i nærheten sovner. Musikken er ikke god.). Readable at small size | kvadrat |  |
| `akt_meisel.png` | icon for an active gadget from a 1920s sanatorium: «Vaktmesterens meisel» (Tegner hele etasjen på kartet, med det hemmelige rommet, og knuser sprekker i nærheten.). Readable at small size | kvadrat |  |
| `akt_stempelpute.png` | icon for an active gadget from a 1920s sanatorium: «Stempelpute» (AVSLÅTT på alle i rommet. De tar skade og står og venter i to sekunder.). Readable at small size | kvadrat |  |
| `akt_stoppeklokke.png` | icon for an active gadget from a 1920s sanatorium: «Forstanderens stoppeklokke» (Fiendene går i sakte film i fem sekunder. Du gjør ikke det.). Readable at small size | kvadrat |  |
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
| `lomme_batteri.png` | icon for a small pocket trinket: «Lekkende batteri» (Apparatet ditt lades dobbelt så fort.). Tiny object, readable at small size | kvadrat |  |
| `lomme_frosk.png` | icon for a small pocket trinket: «Tørket frosk» (Én gang per etasje tar frosken et dødelig slag for deg.). Tiny object, readable at small size | kvadrat |  |
| `lomme_hestesko.png` | icon for a small pocket trinket: «Hestesko» (Flere kritiske treff.). Tiny object, readable at small size | kvadrat |  |
| `lomme_kaninpote.png` | icon for a small pocket trinket: «Kaninpote fra tøffelen» (Rullingen lades 25 prosent raskere. Tøffelen savner den.). Tiny object, readable at small size | kvadrat |  |
| `lomme_knappenal.png` | icon for a small pocket trinket: «Knappenål i fôret» (10 prosent mer skade når du har full helse.). Tiny object, readable at small size | kvadrat |  |
| `lomme_kolapp.png` | icon for a small pocket trinket: «Kølapp nummer 1» (Første treff på hver fiende gjør 50 prosent mer skade. Du var først.). Tiny object, readable at small size | kvadrat |  |
| `lomme_lanekort.png` | icon for a small pocket trinket: «Lånekort med stempel» (Alt koster 15 prosent mindre. Ingen sjekker datoen.). Tiny object, readable at small size | kvadrat |  |
| `lomme_monokkel.png` | icon for a small pocket trinket: «Sprukket monokkel» (Du ser straks hvor den sprukne veggen er i hver etasje.). Tiny object, readable at small size | kvadrat |  |
| `lomme_morfin.png` | icon for a small pocket trinket: «Morfindråpe» (Tre helse hver gang et rom er ryddet.). Tiny object, readable at small size | kvadrat |  |
| `lomme_pastill.png` | icon for a small pocket trinket: «Halspastill» (Morbidium stiger 30 prosent saktere. Smaker mint og angst.). Tiny object, readable at small size | kvadrat |  |
| `lomme_skalpell.png` | icon for a small pocket trinket: «Rusten skalpell» (Slag gir ofte blødning. Stivkrampevaksinen er utgått.). Tiny object, readable at small size | kvadrat |  |
| `lomme_tannspeil.png` | icon for a small pocket trinket: «Tannlegespeil» (Tenner og hjerter trekkes til deg fra dobbelt så langt unna.). Tiny object, readable at small size | kvadrat |  |
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

## Runde 3: rekvisitter og møbler (72 bilder, 51 levert)

Møblene står i 3/4-vinkel: du ser fronten og litt av toppen. Bunnen av møbelet helt nederst i motivet.

| Filnavn | Beskrivelse til ChatGPT | Format | Levert |
|---|---|---|---|
| `alter3.png` | a stone altar draped in purple cloth with two lit candles, three tiles wide, front view | liggende | ja |
| `arkivhylle3.png` | a tall dark archive shelf stuffed with folders and boxes, three tiles wide | liggende |  |
| `celle.png` | a padded cell corner: quilted white walls, two tiles wide | kvadrat |  |
| `disk_kafeteria4.png` | a long wooden cafeteria counter with a steel soup pot and bread, 4 tiles wide, front view | liggende |  |
| `disk_kafeteria5.png` | a long wooden cafeteria counter with a steel soup pot and bread, front view | liggende | ja |
| `disk_medisin3.png` | a wooden medicine counter with small glass bottles, front view | liggende | ja |
| `disk_vaktmester3.png` | a janitor's workbench counter with tools and a vise, front view | liggende | ja |
| `garderobes.png` | a tall wooden wardrobe, side view | stående | ja |
| `hylleb11.png` | hylleb11 | stående | ja |
| `hyllef11.png` | hyllef11 | stående | ja |
| `hylles11.png` | hylles11 | stående | ja |
| `journalskap.png` | a large dark wooden filing cabinet with many drawers, one drawer glowing purple, front view | stående | ja |
| `kiste_lukket.png` | a small wooden treasure chest with iron bands, closed | kvadrat | ja |
| `kiste_open.png` | the same chest, open, gold teeth inside | kvadrat | ja |
| `kommodef.png` | a wooden chest of drawers, front view | liggende | ja |
| `lik.png` | a dead patient in a yellow bathrobe lying on the floor, X eyes, comedic, seen from above at an angle | liggende | ja |
| `medisinskap.png` | a white enamel medicine cabinet with glass doors and bottles inside | stående |  |
| `offeralter.png` | a sacrificial altar of dark stone with a bowl of blood and red candles | liggende |  |
| `olsenskap.png` | a grey steel locker with a big padlock, front view | stående | ja |
| `prop_bench.png` | a wooden waiting-room bench, front view | liggende | ja |
| `prop_bokstabel.png` | a wobbly stack of old leather-bound books | kvadrat |  |
| `prop_bord.png` | a small white enamel hospital table | kvadrat | ja |
| `prop_botte.png` | a zinc mop bucket with a mop standing in it | stående |  |
| `prop_chair.png` | a wooden waiting-room chair, front view | stående | ja |
| `prop_chair_b.png` | the same wooden chair seen from behind | stående | ja |
| `prop_crate.png` | a wooden crate | kvadrat | ja |
| `prop_do.png` | an old porcelain toilet with a wooden seat, front view | stående | ja |
| `prop_drain.png` | a round iron floor drain seen from straight above (flat on the floor) | liggende | ja |
| `prop_forbannet.png` | a cursed floor sigil: a red glowing occult circle scratched into the floor, seen from above (flat on the floor) | kvadrat |  |
| `prop_kjetting.png` | a rusty iron chain hanging from above with a meat hook at the end | stående | ja |
| `prop_kurv.png` | a wicker laundry basket full of white sheets | kvadrat | ja |
| `prop_lamp.png` | a tall standing medical examination lamp | stående | ja |
| `prop_lesestol.png` | a worn green leather reading armchair | kvadrat |  |
| `prop_linhaug.png` | a heap of dirty white hospital linen | kvadrat |  |
| `prop_luke.png` | an open wooden trapdoor in the floor with darkness below, seen from above | kvadrat | ja |
| `prop_lys.png` | three white candles of different heights, lit | kvadrat | ja |
| `prop_madrass.png` | a thin striped mattress lying on the floor, stained | liggende |  |
| `prop_menytavle.png` | a small chalkboard menu sign on legs reading nothing (the game adds no text), cafeteria style | stående |  |
| `prop_papirhaug.png` | a knee-high heap of loose papers and files | kvadrat |  |
| `prop_pillar.png` | a stone pillar with a simple capital | stående | ja |
| `prop_plant.png` | a potted palm in a terracotta pot | stående | ja |
| `prop_side.png` | a small wooden side stand | stående | ja |
| `prop_soppel.png` | a metal trash can overflowing with paper | kvadrat | ja |
| `prop_strykebrett.png` | an old wooden ironing board with a heavy iron | kvadrat |  |
| `prop_torkesnor3.png` | a drying line on two poles with white sheets hanging, three tiles wide | liggende |  |
| `prop_trolley.png` | a steel hospital trolley with bottles and a folded towel | kvadrat | ja |
| `prop_tvangstroye.png` | an empty straitjacket hanging on a coat stand | stående |  |
| `prop_vekt.png` | an old upright doctor's weighing scale with a sliding weight bar | stående |  |
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
| `sprekkvegg.png` | a cracked section of wall with light shining through the crack | stående |  |
| `vaskemaskin2.png` | two old industrial washing machines side by side with round glass doors, front view | liggende | ja |
| `vaskemaskin3.png` | old industrial washing machines side by side with round glass doors, 3 tiles wide, front view | liggende |  |
| `verktoytavle1.png` | a pegboard with hanging tools (hammers, saws, keys), 1 tiles wide, front view | stående |  |
| `verktoytavle2.png` | a pegboard with hanging tools (hammers, saws, keys), 2 tiles wide, front view | liggende |  |

## Runde 4: plukk, effekter, tillegg og pynt (33 bilder, 14 levert)

Små ting. Enkle former, tydelig kontur.

| Filnavn | Beskrivelse til ChatGPT | Format | Levert |
|---|---|---|---|
| `due_figur.png` | a grey city pigeon standing, side view | kvadrat | ja |
| `flaske_eter.png` | a blue glass ether bottle with a cork | stående | ja |
| `flaske_kamfer.png` | an orange camphor ointment tin | stående | ja |
| `flaske_levertran.png` | a small brown glass bottle of cod liver oil with a cork | stående | ja |
| `flaske_luktesalt.png` | a small white smelling-salts jar with a red cap | stående | ja |
| `hjerte.png` | a small red cartoon heart (health pickup) | kvadrat | ja |
| `kortplukk.png` | an ability card lying on the floor, slightly tilted, face down with a purple back (pickup) | stående |  |
| `morbdrape.png` | a glowing purple liquid droplet (pickup) | kvadrat | ja |
| `puff0.png` | a small cartoon dust cloud puff, beige with a brown outline | kvadrat | ja |
| `puff1.png` | a small cartoon dust cloud puff, beige with a brown outline | kvadrat | ja |
| `puff2.png` | a small cartoon dust cloud puff, beige with a brown outline | kvadrat | ja |
| `pynt_harnett.png` | a thin dark hair net shaped like a dome (drawn alone) | liggende |  |
| `pynt_hjelm.png` | a padded brown leather protective helmet with brass rivets (drawn alone) | liggende |  |
| `pynt_nattlue.png` | a striped red and white nightcap with a pompom, drooping to the side (worn on a head, drawn alone) | kvadrat |  |
| `pynt_papiljotter.png` | five pastel hair curlers in a row, as worn on top of a head (drawn alone) | liggende |  |
| `pynt_plaster.png` | a crossed pair of beige sticking plasters | kvadrat |  |
| `pynt_rosett.png` | a small red hair bow | liggende |  |
| `pynt_sting.png` | a short stitched scar with black stitches | liggende |  |
| `skudd_slim.png` | a small glob of green-yellow phlegm (projectile) | kvadrat |  |
| `skyggehand_p.png` | a purple smoky shadow hand flying forward (projectile) | kvadrat | ja |
| `stempelmerke.png` | a smudged red rectangular rubber-stamp imprint | liggende | ja |
| `stjerne.png` | a white and yellow comic impact star burst | kvadrat | ja |
| `tann.png` | a single gold tooth (currency pickup) | kvadrat | ja |
| `tillegg_bandasje.png` | a tiny add-on worn by the player character: a head bandage with a red spot. Tiny, drawn alone | liggende |  |
| `tillegg_bart.png` | a tiny add-on worn by the player character: a glued-on mustache. Tiny, drawn alone | liggende |  |
| `tillegg_eyeliner.png` | a tiny add-on worn by the player character: heavy black eyeliner around two eyes. Tiny, drawn alone | liggende |  |
| `tillegg_glassoye.png` | a tiny add-on worn by the player character: a glass eye. Tiny, drawn alone | kvadrat |  |
| `tillegg_horn.png` | a tiny add-on worn by the player character: two small devil horns. Tiny, drawn alone | liggende |  |
| `tillegg_igler.png` | a tiny add-on worn by the player character: three leeches. Tiny, drawn alone | kvadrat |  |
| `tillegg_lys.png` | a tiny add-on worn by the player character: a lit candle stuck on the head. Tiny, drawn alone | stående |  |
| `tillegg_svulst.png` | a tiny add-on worn by the player character: a pink lump on the head. Tiny, drawn alone | kvadrat |  |
| `tillegg_tunge.png` | a tiny add-on worn by the player character: a tongue sticking out. Tiny, drawn alone | stående |  |
| `torner.png` | a tangle of black thorny vines (a hazard lying on the floor) | kvadrat |  |

## Runde 5: våpen (7 bilder, 7 levert)

Våpenet står loddrett med håndtaket nederst og tuppen opp. Spillet roterer det selv.

| Filnavn | Beskrivelse til ChatGPT | Format | Levert |
|---|---|---|---|
| `vaapen_bekken.png` | a white enamel bedpan on a handle | stående | ja |
| `vaapen_krok.png` | a surgeon's large bone hook | stående | ja |
| `vaapen_mopp.png` | a janitor's mop, wooden handle, grey clamp, strings dripping purple | stående | ja |
| `vaapen_sag.png` | a bone saw with a wooden handle | stående | ja |
| `vaapen_slange.png` | a rubber hose with a brass nozzle | stående | ja |
| `vaapen_sproyte.png` | a large glass syringe | stående | ja |
| `vaapen_stativ.png` | an IV drip stand: metal pole with an empty drip bag | stående | ja |

## Runde 6: figurer (91 bilder, 16 levert)

Vanskeligst. Be først om et figurark (samme figur forfra, bakfra, fra siden), og deretter om hode og kropp hver for seg fra arket. Armer og bein tegner spillet selv som tykke streker, så de skal ikke være med.

| Filnavn | Beskrivelse til ChatGPT | Format | Levert |
|---|---|---|---|
| `blob_flue_b.png` | a fat bluebottle meat fly with big red eyes. back view, facing away | liggende |  |
| `blob_flue_f.png` | a fat bluebottle meat fly with big red eyes. front view, facing the viewer | liggende |  |
| `blob_flue_s.png` | a fat bluebottle meat fly with big red eyes. side view, facing right | liggende |  |
| `blob_journalen_b.png` | FINAL BOSS: the Journal, a huge floating leather-bound patient journal with tentacles and teeth, pages flapping. back view, facing away | liggende |  |
| `blob_journalen_f.png` | FINAL BOSS: the Journal, a huge floating leather-bound patient journal with tentacles and teeth, pages flapping. front view, facing the viewer | liggende |  |
| `blob_journalen_s.png` | FINAL BOSS: the Journal, a huge floating leather-bound patient journal with tentacles and teeth, pages flapping. side view, facing right | liggende |  |
| `blob_lunge_b.png` | a pink human lung walking on its own, tar spots, tiny sad face. back view, facing away | kvadrat |  |
| `blob_lunge_f.png` | a pink human lung walking on its own, tar spots, tiny sad face. front view, facing the viewer | kvadrat |  |
| `blob_lunge_s.png` | a pink human lung walking on its own, tar spots, tiny sad face. side view, facing right | kvadrat |  |
| `blob_oyeblomst_b.png` | an eye flower: a fleshy stalk rooted in the floor with a big bloodshot eye as its bloom. back view, facing away | stående |  |
| `blob_oyeblomst_f.png` | an eye flower: a fleshy stalk rooted in the floor with a big bloodshot eye as its bloom. front view, facing the viewer | stående |  |
| `blob_oyeblomst_s.png` | an eye flower: a fleshy stalk rooted in the floor with a big bloodshot eye as its bloom. side view, facing right | stående |  |
| `blob_rotte_b.png` | a fat grey archive rat with a paper slip in its mouth. back view, facing away | liggende |  |
| `blob_rotte_f.png` | a fat grey archive rat with a paper slip in its mouth. front view, facing the viewer | liggende |  |
| `blob_rotte_s.png` | a fat grey archive rat with a paper slip in its mouth. side view, facing right | liggende |  |
| `blob_svulst_b.png` | a walking pink tumor with veins, one eye and a grin. back view, facing away | liggende |  |
| `blob_svulst_f.png` | a walking pink tumor with veins, one eye and a grin. front view, facing the viewer | liggende |  |
| `blob_svulst_s.png` | a walking pink tumor with veins, one eye and a grin. side view, facing right | liggende |  |
| `blob_tvang_b.png` | an enemy patient in a straitjacket, arms bound, hopping, wild eyes. back view, facing away | stående |  |
| `blob_tvang_f.png` | an enemy patient in a straitjacket, arms bound, hopping, wild eyes. front view, facing the viewer | stående |  |
| `blob_tvang_s.png` | an enemy patient in a straitjacket, arms bound, hopping, wild eyes. side view, facing right | stående |  |
| `blob_yngel_b.png` | drain spawn: a small purple slime creature with mismatched eyes and a toothy grin. back view, facing away | liggende |  |
| `blob_yngel_f.png` | drain spawn: a small purple slime creature with several mismatched eyes and a toothy grin, front view | liggende |  |
| `blob_yngel_s.png` | drain spawn: a small purple slime creature with mismatched eyes and a toothy grin. side view, facing right | liggende |  |
| `hode_arkivar_f.png` | HEAD ONLY (no neck, no body) of BOSS: chief archivist Gunhild Paragraf, tall and severe, grey hair bun, pince-nez, dusty grey suit covered in stamps and paper slips. front view, facing the viewer | kvadrat |  |
| `hode_bibliotekar_f.png` | HEAD ONLY (no neck, no body) of Ask the librarian, hair in a bun, small glasses, purple cardigan. front view, facing the viewer | kvadrat |  |
| `hode_byrakrat_f.png` | HEAD ONLY (no neck, no body) of a hollow-eyed bureaucrat in a black suit and red tie, arms full of forms. front view, facing the viewer | kvadrat |  |
| `hode_hansen_f.png` | HEAD ONLY (no neck, no body) of Sister Hansen, a strict older nurse with a white cap. front view, facing the viewer | kvadrat |  |
| `hode_kokk_f.png` | HEAD ONLY (no neck, no body) of Fru Ruud, a round friendly cafeteria cook lady with a tall white chef hat and an apron. front view, facing the viewer | kvadrat |  |
| `hode_krok_f.png` | HEAD ONLY (no neck, no body) of BOSS: Chief surgeon Hektor Krok, huge and menacing, head mirror on his forehead, white coat with a blood-stained red apron. front view, facing the viewer | kvadrat |  |
| `hode_kultist_b.png` | HEAD ONLY (no neck, no body) of a pale gloomy edgelord teenager cultist, dark hood, black eye makeup, skinny black robe with four leather belts with gold buckles. back view, facing away | kvadrat |  |
| `hode_kultist_f.png` | HEAD ONLY (no neck, no body) of a pale gloomy edgelord teenager cultist, dark hood, black eye makeup, skinny black robe with four leather belts with gold buckles. front view, facing the viewer | kvadrat |  |
| `hode_kultist_s.png` | HEAD ONLY (no neck, no body) of a pale gloomy edgelord teenager cultist, dark hood, black eye makeup, skinny black robe with four leather belts with gold buckles. side view, facing right | kvadrat |  |
| `hode_narkose_f.png` | HEAD ONLY (no neck, no body) of an anesthetist in a green surgical gown with a rubber ether mask and a big glass bottle. front view, facing the viewer | kvadrat |  |
| `hode_olsen_f.png` | HEAD ONLY (no neck, no body) of Olsen the janitor, grey cap, bushy grey mustache, grey overalls. front view, facing the viewer | kvadrat |  |
| `hode_oppasser_b.png` | HEAD ONLY (no neck, no body) of a tall thin hospital orderly in mint-green scrubs, surgical cap and white face mask, tired squinting eyes. back view, facing away | kvadrat |  |
| `hode_oppasser_f.png` | HEAD ONLY (no neck, no body) of a tall thin hospital orderly in mint-green scrubs, surgical cap and white face mask, tired squinting eyes. front view, facing the viewer | kvadrat |  |
| `hode_oppasser_s.png` | HEAD ONLY (no neck, no body) of a tall thin hospital orderly in mint-green scrubs, surgical cap and white face mask, tired squinting eyes. side view, facing right | kvadrat |  |
| `hode_pasient_b.png` | HEAD ONLY (no neck, no body) of the player: a small patient with messy black hair, big round glasses, rosy cheeks, mustard-yellow bathrobe with a brown belt and an ID badge. back view, facing away | kvadrat | ja |
| `hode_pasient_f.png` | HEAD ONLY (no neck, no body) of the player: a small patient with messy black hair, big round glasses, rosy cheeks, mustard-yellow bathrobe with a brown belt and an ID badge. front view, facing the viewer | kvadrat | ja |
| `hode_pasient_kvinne_b.png` | HEAD ONLY (no neck, no body) of the player, female version: a small patient woman with messy long dark hair, a white hair clip, big round glasses, rosy cheeks, mustard-yellow bathrobe with a brown belt. back view, facing away | kvadrat | ja |
| `hode_pasient_kvinne_f.png` | HEAD ONLY (no neck, no body) of the player, female version: a small patient woman with messy long dark hair, a white hair clip, big round glasses, rosy cheeks, mustard-yellow bathrobe with a brown belt. front view, facing the viewer | kvadrat | ja |
| `hode_pasient_kvinne_s.png` | HEAD ONLY (no neck, no body) of the player, female version: a small patient woman with messy long dark hair, a white hair clip, big round glasses, rosy cheeks, mustard-yellow bathrobe with a brown belt. side view, facing right | kvadrat | ja |
| `hode_pasient_s.png` | HEAD ONLY (no neck, no body) of the player: a small patient with messy black hair, big round glasses, rosy cheeks, mustard-yellow bathrobe with a brown belt and an ID badge. side view, facing right | kvadrat | ja |
| `hode_pasient_x.png` | HEAD ONLY (no neck, no body) of the player: a small patient with messy black hair, big round glasses, rosy cheeks, mustard-yellow bathrobe with a brown belt and an ID badge. front view, dead with X marks over the eyes (comedic) | kvadrat |  |
| `hode_pleier_b.png` | HEAD ONLY (no neck, no body) of a big stern nurse, square jaw, angry brows, hair in a bun, white cap with a red cross, boxy white uniform with apron. back view, facing away | kvadrat |  |
| `hode_pleier_f.png` | HEAD ONLY (no neck, no body) of a big stern nurse, square jaw, angry brows, hair in a bun, white cap with a red cross, boxy white uniform with apron. front view, facing the viewer | kvadrat |  |
| `hode_pleier_s.png` | HEAD ONLY (no neck, no body) of a big stern nurse, square jaw, angry brows, hair in a bun, white cap with a red cross, boxy white uniform with apron. side view, facing right | kvadrat |  |
| `hode_rust_f.png` | HEAD ONLY (no neck, no body) of BOSS: hydrotherapist Ragnvald Rust, rubber diving-style helmet with round goggles, black rubber apron, big and damp. front view, facing the viewer | kvadrat |  |
| `kappe_kultist_b.png` | the long black cape with purple lining ALONE, hanging of a pale gloomy edgelord teenager cultist, dark hood, black eye makeup, skinny black robe with four leather belts with gold buckles. back view, facing away | kvadrat |  |
| `kappe_kultist_f.png` | the long black cape with purple lining ALONE, hanging of a pale gloomy edgelord teenager cultist, dark hood, black eye makeup, skinny black robe with four leather belts with gold buckles. front view, facing the viewer | kvadrat |  |
| `kappe_kultist_s.png` | the long black cape with purple lining ALONE, hanging of a pale gloomy edgelord teenager cultist, dark hood, black eye makeup, skinny black robe with four leather belts with gold buckles. side view, facing right | kvadrat |  |
| `kropp_arkivar_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of BOSS: chief archivist Gunhild Paragraf, tall and severe, grey hair bun, pince-nez, dusty grey suit covered in stamps and paper slips. front view, facing the viewer | liggende |  |
| `kropp_bibliotekar_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of Ask the librarian, hair in a bun, small glasses, purple cardigan. front view, facing the viewer | liggende |  |
| `kropp_byrakrat_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a hollow-eyed bureaucrat in a black suit and red tie, arms full of forms. front view, facing the viewer | liggende |  |
| `kropp_hansen_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of Sister Hansen, a strict older nurse with a white cap. front view, facing the viewer | liggende |  |
| `kropp_kokk_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of Fru Ruud, a round friendly cafeteria cook lady with a tall white chef hat and an apron. front view, facing the viewer | liggende |  |
| `kropp_krok_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of BOSS: Chief surgeon Hektor Krok, huge and menacing, head mirror on his forehead, white coat with a blood-stained red apron. front view, facing the viewer | liggende |  |
| `kropp_kultist_b.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a pale gloomy edgelord teenager cultist, dark hood, black eye makeup, skinny black robe with four leather belts with gold buckles. back view, facing away | liggende |  |
| `kropp_kultist_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a pale gloomy edgelord teenager cultist, dark hood, black eye makeup, skinny black robe with four leather belts with gold buckles. front view, facing the viewer | liggende |  |
| `kropp_kultist_s.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a pale gloomy edgelord teenager cultist, dark hood, black eye makeup, skinny black robe with four leather belts with gold buckles. side view, facing right | liggende |  |
| `kropp_narkose_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of an anesthetist in a green surgical gown with a rubber ether mask and a big glass bottle. front view, facing the viewer | liggende |  |
| `kropp_olsen_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of Olsen the janitor, grey cap, bushy grey mustache, grey overalls. front view, facing the viewer | liggende |  |
| `kropp_oppasser_b.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a tall thin hospital orderly in mint-green scrubs, surgical cap and white face mask, tired squinting eyes. back view, facing away | liggende |  |
| `kropp_oppasser_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a tall thin hospital orderly in mint-green scrubs, surgical cap and white face mask, tired squinting eyes. front view, facing the viewer | liggende |  |
| `kropp_oppasser_s.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a tall thin hospital orderly in mint-green scrubs, surgical cap and white face mask, tired squinting eyes. side view, facing right | liggende |  |
| `kropp_pasient_b.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the player: a small patient with messy black hair, big round glasses, rosy cheeks, mustard-yellow bathrobe with a brown belt and an ID badge. back view, facing away | liggende | ja |
| `kropp_pasient_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the player: a small patient with messy black hair, big round glasses, rosy cheeks, mustard-yellow bathrobe with a brown belt and an ID badge. front view, facing the viewer | liggende | ja |
| `kropp_pasient_kvinne_b.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the player, female version: a small patient woman with messy long dark hair, a white hair clip, big round glasses, rosy cheeks, mustard-yellow bathrobe with a brown belt. back view, facing away | liggende | ja |
| `kropp_pasient_kvinne_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the player, female version: a small patient woman with messy long dark hair, a white hair clip, big round glasses, rosy cheeks, mustard-yellow bathrobe with a brown belt. front view, facing the viewer | liggende | ja |
| `kropp_pasient_kvinne_s.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the player, female version: a small patient woman with messy long dark hair, a white hair clip, big round glasses, rosy cheeks, mustard-yellow bathrobe with a brown belt. side view, facing right | liggende | ja |
| `kropp_pasient_s.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the player: a small patient with messy black hair, big round glasses, rosy cheeks, mustard-yellow bathrobe with a brown belt and an ID badge. side view, facing right | liggende | ja |
| `kropp_pleier_b.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a big stern nurse, square jaw, angry brows, hair in a bun, white cap with a red cross, boxy white uniform with apron. back view, facing away | liggende |  |
| `kropp_pleier_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a big stern nurse, square jaw, angry brows, hair in a bun, white cap with a red cross, boxy white uniform with apron. front view, facing the viewer | liggende |  |
| `kropp_pleier_s.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a big stern nurse, square jaw, angry brows, hair in a bun, white cap with a red cross, boxy white uniform with apron. side view, facing right | liggende |  |
| `kropp_pyjamas_b.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the player patient wearing white pyjamas with vertical blue stripes, a lapel collar, buttons and a breast pocket (the clothes only). back view, facing away | liggende |  |
| `kropp_pyjamas_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the player patient wearing white pyjamas with vertical blue stripes, a lapel collar, buttons and a breast pocket (the clothes only). front view, facing the viewer | liggende |  |
| `kropp_pyjamas_s.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the player patient wearing white pyjamas with vertical blue stripes, a lapel collar, buttons and a breast pocket (the clothes only). side view, facing right | liggende |  |
| `kropp_rust_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of BOSS: hydrotherapist Ragnvald Rust, rubber diving-style helmet with round goggles, black rubber apron, big and damp. front view, facing the viewer | liggende |  |
| `kropp_skjorte_b.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the player patient wearing a pale blue hospital gown with a tiny diamond pattern and short sleeves; seen from behind it is open with ties and white polka-dot underpants (the clothes only). back view, facing away | liggende |  |
| `kropp_skjorte_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the player patient wearing a pale blue hospital gown with a tiny diamond pattern and short sleeves; seen from behind it is open with ties and white polka-dot underpants (the clothes only). front view, facing the viewer | liggende |  |
| `kropp_skjorte_s.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the player patient wearing a pale blue hospital gown with a tiny diamond pattern and short sleeves; seen from behind it is open with ties and white polka-dot underpants (the clothes only). side view, facing right | liggende |  |
| `kropp_tvang_b.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the player patient wearing an off-white canvas straitjacket with brown leather straps and brass buckles, one loose strap dangling (the clothes only). back view, facing away | liggende |  |
| `kropp_tvang_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the player patient wearing an off-white canvas straitjacket with brown leather straps and brass buckles, one loose strap dangling (the clothes only). front view, facing the viewer | liggende |  |
| `kropp_tvang_s.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the player patient wearing an off-white canvas straitjacket with brown leather straps and brass buckles, one loose strap dangling (the clothes only). side view, facing right | liggende |  |
| `sko_barfot.png` | ONE bare human foot with toes, side view | liggende |  |
| `sko_hvit.png` | ONE white nurse clog, side view | liggende | ja |
| `sko_klogg.png` | ONE black clog, side view | liggende | ja |
| `sko_sokk.png` | ONE grey wool sock with a red band, side view | liggende |  |
| `sko_stovel.png` | ONE black pointy boot, side view | liggende | ja |
| `sko_tofler.png` | ONE pink bunny slipper with little ears, front view | liggende | ja |
