# Morbidium: kunstbrief for bildegenerering

Denne fila er laget av `tools/lag_brief.py` fra `assets/manifest.json`. Ikke rediger den for hånd; endre skriptet og kjør det på nytt.

## Slik gjør du det

1. Lim inn stilblokken under i ChatGPT én gang, og be den bruke stilen for alle bildene i samtalen.
2. Be om ett bilde om gangen: «Draw: <beskrivelse fra tabellen>». Bruk formatet i tabellen (kvadrat 1024x1024, stående 1024x1536, liggende 1536x1024).
3. Last ned bildet som PNG og gi det nøyaktig filnavnet fra tabellen, for eksempel `kort_due.png`.
4. Last det opp til `gpt-grafikk/` i repoet (Add file, Upload files).
5. Resten gjør Claude: `python3 tools/behandle_bilder.py` fjerner eventuell bakgrunn, beskjærer, skalerer og setter festepunktet, og `python3 build.py` bygger bildet inn i spillet. Alt som ikke har bilde ennå, tegnes av koden som før.

## Stilblokk (lim inn i ChatGPT)

```
Style: hand-drawn cartoon game art in the style of Conan Chop Chop mixed with Castle Crashers. Thick dark brown ink outlines (#2a1a14) with a slightly wobbly, hand-inked line that is heavier on the lower right. Flat colors with one darker cel-shade tone on the lower right and a small light highlight on the upper left. Muted, warm 1920s palette. Setting: a 1920s Norwegian sanatorium, Lovecraftian and a bit gross, but with dark humor. Camera: seen from the front and slightly above (about 50 degrees), like a top-down action game, so objects show their front and a little of their top.
Technical: PNG with a TRANSPARENT background. Exactly one object, centered, fully visible (not cropped). No ground shadow, no text, no frame, no background scenery.
```

## Tips

- Samme stil i alle bilder er viktigere enn at hvert enkelt bilde er perfekt. Bruk samme ChatGPT-samtale for en hel runde.
- Gjennomsiktig bakgrunn er best. Hvit eller ensfarget bakgrunn går også, verktøyet fjerner den fra kantene og innover.
- Ikke tegn skygge på bakken. Spillet legger på skygge og lys selv.

## Runde 1: kuriositetene (Isaac-gjenstander) (49 bilder)

Gjenstandene man plukker opp og kombinerer. Små, tydelige og groteske, som gjenstandene i The Binding of Isaac. Bruk gjerne «ni ting»-arket fra DESIGN_BRIEF.md.

| Filnavn | Beskrivelse til ChatGPT | Format |
|---|---|---|
| `glass_tomt.png` | an empty glass specimen jar with a metal lid, standing on a small wooden base (the game puts the item inside) | stående |
| `kur_adrenalin.png` | item icon, a single grotesque 1920s hospital curiosity: «Hestesprøyte med adrenalin» (Raskere bein og raskere slag. Hjertet klager.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_bart.png` | item icon, a single grotesque 1920s hospital curiosity: «Pålimt bart» (Flere kritiske treff og bedre priser. Folk stoler på bart.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_blodtrykk.png` | item icon, a single grotesque 1920s hospital curiosity: «Livsfarlig høyt blodtrykk» (30 % mer skade. Du spruter litt når du blir truffet.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_boomerang.png` | item icon, a single grotesque 1920s hospital curiosity: «Tilbakefall» (Klumpene kommer tilbake. Som alt annet.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_brodsmuler.png` | item icon, a single grotesque 1920s hospital curiosity: «Brødsmuler i lomma» (En due følger deg inn i hvert rom som låses.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_bronkitt.png` | item icon, a single grotesque 1920s hospital curiosity: «Kronisk bronkitt» (Hostene kommer i treer. Legen sier det er normalt.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_celledeling.png` | item icon, a single grotesque 1920s hospital curiosity: «Ukontrollert celledeling» (Klumpene deler seg i tre når de treffer.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_cyste.png` | item icon, a single grotesque 1920s hospital curiosity: «Pratsom cyste» (Når du blir truffet, spytter den klumper i alle retninger.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_dikt.png` | item icon, a single grotesque 1920s hospital curiosity: «Dikt om mørket (14 vers)» (Står du stille, sovner fiender i nærheten av ren kjedsomhet.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_ekstra_tunge.png` | item icon, a single grotesque 1920s hospital curiosity: «Ekstra tunge» (Klumpene flyr lenger og raskere.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_elektro.png` | item icon, a single grotesque 1920s hospital curiosity: «Elektrosjokkbehandling» (Treff hopper videre til to fiender til.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_eterflaske.png` | item icon, a single grotesque 1920s hospital curiosity: «Evig eterflaske» (Fiender du treffer, sovner et øyeblikk.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_eyeliner.png` | item icon, a single grotesque 1920s hospital curiosity: «Tung eyeliner» (15 % mer skade når Morbidium er over 50. Tårene er malt på.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_fluepapir.png` | item icon, a single grotesque 1920s hospital curiosity: «Fluepapir» (Fluene dine gjør dobbel skade og fanger skudd.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_frost.png` | item icon, a single grotesque 1920s hospital curiosity: «Frostskadet tå» (Treff bremser fiender. Tåa var ikke din.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_glassoye.png` | item icon, a single grotesque 1920s hospital curiosity: «Lånt glassøye» (Lengre rekkevidde og flere kritiske treff. Eieren vil ha det tilbake.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_gulltann.png` | item icon, a single grotesque 1920s hospital curiosity: «Løs gulltann» (En ekstra tann per drap, og treff kan slå ut tenner.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_heliumlunge.png` | item icon, a single grotesque 1920s hospital curiosity: «Heliumlunge» (Du svever litt over gulvet. Pytter og strøm biter ikke på deg.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_hjerte_i_glass.png` | item icon, a single grotesque 1920s hospital curiosity: «Hjerte på glass» (Ett ekstra hjerte og full helse. Det slår fortsatt.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_hodeskalle.png` | item icon, a single grotesque 1920s hospital curiosity: «Hodeskalle med stearinlys» (Et lys brenner på hodet ditt. Fiender helt inntil deg tar brannskade.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_igle.png` | item icon, a single grotesque 1920s hospital curiosity: «Blodigler» (Treff gir deg litt helse tilbake. Iglene er fornøyde.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_kappe_lang.png` | item icon, a single grotesque 1920s hospital curiosity: «Altfor lang kappe» (En ekstra rull. Kappen feier gulvet for deg.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_karantene.png` | item icon, a single grotesque 1920s hospital curiosity: «Karantenebånd» (Fiender i låste rom har 20 % mindre helse.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_kvikksolv.png` | item icon, a single grotesque 1920s hospital curiosity: «Knust kvikksølvtermometer» (Treff forgifter. Ikke slikk på det.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_lavement.png` | item icon, a single grotesque 1920s hospital curiosity: «Lavement» (Når du løper fort, etterlater du et glatt, brunt spor. Fiender sklir.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_lommekirurgi.png` | item icon, a single grotesque 1920s hospital curiosity: «Lommekirurgi» (Alle slag gir blødning.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_magnet.png` | item icon, a single grotesque 1920s hospital curiosity: «Svelget magnet» (Klumpene søker mot nærmeste fiende. Den sitter der fortsatt.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_nitro.png` | item icon, a single grotesque 1920s hospital curiosity: «Nitroglyserintabletter» (For hjertet. Klumpene eksploderer.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_rattent_kjott.png` | item icon, a single grotesque 1920s hospital curiosity: «Råttent kjøtt» (Hver fiende du dreper, gir deg en flue som kjemper for deg.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_speil.png` | item icon, a single grotesque 1920s hospital curiosity: «Knust speil» (13 % sjanse for dobbel skade. 1 % sjanse for å kutte deg selv.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_sprett.png` | item icon, a single grotesque 1920s hospital curiosity: «Gummicelle» (Klumpene spretter på veggene.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_spyttkjertel.png` | item icon, a single grotesque 1920s hospital curiosity: «Overaktiv spyttkjertel» (Større, tregere og tyngre klumper.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_stemmegaffel.png` | item icon, a single grotesque 1920s hospital curiosity: «Stemmegaffel» (Tunge slag sender ut en sjokkbølge.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_surkal.png` | item icon, a single grotesque 1920s hospital curiosity: «Gammel surkål» (Når du ruller, slipper du en gass som gir fiender kvalme.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_svulst.png` | item icon, a single grotesque 1920s hospital curiosity: «Godartet svulst (sier de)» (To ekstra hjerter. Litt tregere. Den vokser.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_svulstvenn.png` | item icon, a single grotesque 1920s hospital curiosity: «Svulsten Sverre» (En svulst går i bane rundt deg og stopper prosjektiler.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_syl.png` | item icon, a single grotesque 1920s hospital curiosity: «Syl i spiserøret» (Klumpene går gjennom to fiender.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_tang.png` | item icon, a single grotesque 1920s hospital curiosity: «Tannlegens tang» (Klumpene dine blir til tenner: mer skade, og drap gir tenner.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_tannfe.png` | item icon, a single grotesque 1920s hospital curiosity: «Fanget tannfe» (Tannfeen henter tenner til deg på lang avstand.). Isaac-style item sprite, readable at small size | kvadrat |
| `kur_tuberkulose.png` | item icon, a single grotesque 1920s hospital curiosity: «Tuberkuløs hoste» (Hvert slag hoster opp en slimklump. Ikke dekk til munnen.). Isaac-style item sprite, readable at small size | kvadrat |
| `pille_pille_bla.png` | ONE small pill capsule, color: bla (rod=red, bla=blue, gul=yellow, hvit=white, svart=black, rosa=pink, gronn=green, flekket=white with red dots) | kvadrat |
| `pille_pille_flekket.png` | ONE small pill capsule, color: flekket (rod=red, bla=blue, gul=yellow, hvit=white, svart=black, rosa=pink, gronn=green, flekket=white with red dots) | kvadrat |
| `pille_pille_gronn.png` | ONE small pill capsule, color: gronn (rod=red, bla=blue, gul=yellow, hvit=white, svart=black, rosa=pink, gronn=green, flekket=white with red dots) | kvadrat |
| `pille_pille_gul.png` | ONE small pill capsule, color: gul (rod=red, bla=blue, gul=yellow, hvit=white, svart=black, rosa=pink, gronn=green, flekket=white with red dots) | kvadrat |
| `pille_pille_hvit.png` | ONE small pill capsule, color: hvit (rod=red, bla=blue, gul=yellow, hvit=white, svart=black, rosa=pink, gronn=green, flekket=white with red dots) | kvadrat |
| `pille_pille_rod.png` | ONE small pill capsule, color: rod (rod=red, bla=blue, gul=yellow, hvit=white, svart=black, rosa=pink, gronn=green, flekket=white with red dots) | kvadrat |
| `pille_pille_rosa.png` | ONE small pill capsule, color: rosa (rod=red, bla=blue, gul=yellow, hvit=white, svart=black, rosa=pink, gronn=green, flekket=white with red dots) | kvadrat |
| `pille_pille_svart.png` | ONE small pill capsule, color: svart (rod=red, bla=blue, gul=yellow, hvit=white, svart=black, rosa=pink, gronn=green, flekket=white with red dots) | kvadrat |

## Runde 2: evnekortene (13 bilder)

Størst gevinst først. Kortene vises i HUD-en og i journalen. Motivet midt i bildet, spillet tegner selve kortrammen.

| Filnavn | Beskrivelse til ChatGPT | Format |
|---|---|---|
| `kort_benektelse.png` | a speech bubble with a big red X. Square card illustration, subject centered | kvadrat |
| `kort_brekning.png` | a pale cartoon head vomiting a green splash (funny, not gross). Square card illustration, subject centered | kvadrat |
| `kort_due.png` | a grey city pigeon with a red eye and a puffed chest. Square card illustration, subject centered | kvadrat |
| `kort_hydro.png` | a brass fire-hose nozzle spraying blue water. Square card illustration, subject centered | kvadrat |
| `kort_kappe.png` | a dramatic black cape with purple lining, swirling. Square card illustration, subject centered | kvadrat |
| `kort_lys.png` | an old medical examination lamp shining a bright yellow beam. Square card illustration, subject centered | kvadrat |
| `kort_monolog.png` | a big speech bubble full of dramatic scribbles. Square card illustration, subject centered | kvadrat |
| `kort_nokler.png` | a janitor's iron key ring with three old keys. Square card illustration, subject centered | kvadrat |
| `kort_resept.png` | a prescription note with a red and white pill capsule. Square card illustration, subject centered | kvadrat |
| `kort_skjema.png` | a blank official paper form with lines and a stamp box. Square card illustration, subject centered | kvadrat |
| `kort_skyggehand.png` | a purple shadow hand made of dark smoke reaching upward. Square card illustration, subject centered | kvadrat |
| `kort_stempel.png` | a red rubber office stamp slamming down with a splash of red ink. Square card illustration, subject centered | kvadrat |
| `kort_ukjent.png` | a dark silhouette of a person with a question mark. Square card illustration, subject centered | kvadrat |

## Runde 3: rekvisitter og møbler (51 bilder)

Møblene står i 3/4-vinkel: du ser fronten og litt av toppen. Bunnen av møbelet helt nederst i motivet.

| Filnavn | Beskrivelse til ChatGPT | Format |
|---|---|---|
| `alter3.png` | a stone altar draped in purple cloth with two lit candles, three tiles wide, front view | liggende |
| `disk_kafeteria5.png` | a long wooden cafeteria counter with a steel soup pot and bread, front view | liggende |
| `disk_medisin3.png` | a wooden medicine counter with small glass bottles, front view | liggende |
| `disk_vaktmester3.png` | a janitor's workbench counter with tools and a vise, front view | liggende |
| `garderobes.png` | a tall wooden wardrobe, side view | stående |
| `hylleb11.png` | hylleb11 | stående |
| `hyllef11.png` | hyllef11 | stående |
| `hylles11.png` | hylles11 | stående |
| `journalskap.png` | a large dark wooden filing cabinet with many drawers, one drawer glowing purple, front view | stående |
| `kiste_lukket.png` | a small wooden treasure chest with iron bands, closed | kvadrat |
| `kiste_open.png` | the same chest, open, gold teeth inside | kvadrat |
| `kommodef.png` | a wooden chest of drawers, front view | liggende |
| `lik.png` | a dead patient in a yellow bathrobe lying on the floor, X eyes, comedic, seen from above at an angle | liggende |
| `olsenskap.png` | a grey steel locker with a big padlock, front view | stående |
| `prop_bench.png` | a wooden waiting-room bench, front view | liggende |
| `prop_bord.png` | a small white enamel hospital table | kvadrat |
| `prop_chair.png` | a wooden waiting-room chair, front view | stående |
| `prop_chair_b.png` | the same wooden chair seen from behind | stående |
| `prop_crate.png` | a wooden crate | kvadrat |
| `prop_do.png` | an old porcelain toilet with a wooden seat, front view | stående |
| `prop_drain.png` | a round iron floor drain seen from straight above (flat on the floor) | liggende |
| `prop_kjetting.png` | a rusty iron chain hanging from above with a meat hook at the end | stående |
| `prop_kurv.png` | a wicker laundry basket full of white sheets | kvadrat |
| `prop_lamp.png` | a tall standing medical examination lamp | stående |
| `prop_luke.png` | an open wooden trapdoor in the floor with darkness below, seen from above | kvadrat |
| `prop_lys.png` | three white candles of different heights, lit | kvadrat |
| `prop_pillar.png` | a stone pillar with a simple capital | stående |
| `prop_plant.png` | a potted palm in a terracotta pot | stående |
| `prop_side.png` | a small wooden side stand | stående |
| `prop_soppel.png` | a metal trash can overflowing with paper | kvadrat |
| `prop_trolley.png` | a steel hospital trolley with bottles and a folded towel | kvadrat |
| `pult.png` | a wooden writing desk with papers and an inkwell, front view | kvadrat |
| `seng_bed12n.png` | an iron hospital bed with white sheets and a blue blanket, lengthwise into the picture, head end far away (top) | stående |
| `seng_bed12s.png` | an iron hospital bed with white sheets and a blue blanket, lengthwise into the picture, head end nearest the viewer (bottom) | stående |
| `seng_bed21e.png` | an iron hospital bed with white sheets and a blue blanket, sideways, head end on the right | liggende |
| `seng_bed21w.png` | an iron hospital bed with white sheets and a blue blanket, sideways, head end on the left | liggende |
| `seng_gurney12n.png` | a steel hospital stretcher on wheels, lengthwise into the picture, head end far away (top) | stående |
| `seng_gurney12s.png` | a steel hospital stretcher on wheels, lengthwise into the picture, head end nearest the viewer (bottom) | stående |
| `seng_gurney21e.png` | a steel hospital stretcher on wheels, sideways, head end on the right | liggende |
| `seng_gurney21w.png` | a steel hospital stretcher on wheels, sideways, head end on the left | liggende |
| `seng_optable12n.png` | a steel operating table with blood stains and an overhead lamp arm, lengthwise into the picture, head end far away (top) | stående |
| `seng_tub12n.png` | an old clawfoot bathtub filled with murky water, lengthwise into the picture, head end far away (top) | stående |
| `seng_tub12s.png` | an old clawfoot bathtub filled with murky water, lengthwise into the picture, head end nearest the viewer (bottom) | stående |
| `seng_tub21e.png` | an old clawfoot bathtub filled with murky water, sideways, head end on the right | liggende |
| `seng_tub21w.png` | an old clawfoot bathtub filled with murky water, sideways, head end on the left | liggende |
| `sjakt.png` | a metal laundry chute hatch set in a steel box | stående |
| `skapb11.png` | skapb11 | stående |
| `skapf11.png` | skapf11 | stående |
| `skaps11.png` | skaps11 | stående |
| `sperre.png` | a barricade of wooden planks with red and white warning stripes | kvadrat |
| `vaskemaskin2.png` | two old industrial washing machines side by side with round glass doors, front view | liggende |

## Runde 4: plukk, effekter og tillegg (24 bilder)

Små ting. Enkle former, tydelig kontur.

| Filnavn | Beskrivelse til ChatGPT | Format |
|---|---|---|
| `due_figur.png` | a grey city pigeon standing, side view | kvadrat |
| `flaske_eter.png` | a blue glass ether bottle with a cork | stående |
| `flaske_kamfer.png` | an orange camphor ointment tin | stående |
| `flaske_levertran.png` | a small brown glass bottle of cod liver oil with a cork | stående |
| `flaske_luktesalt.png` | a small white smelling-salts jar with a red cap | stående |
| `hjerte.png` | a small red cartoon heart (health pickup) | kvadrat |
| `morbdrape.png` | a glowing purple liquid droplet (pickup) | kvadrat |
| `puff0.png` | a small cartoon dust cloud puff, beige with a brown outline | kvadrat |
| `puff1.png` | a small cartoon dust cloud puff, beige with a brown outline | kvadrat |
| `puff2.png` | a small cartoon dust cloud puff, beige with a brown outline | kvadrat |
| `skudd_slim.png` | a small glob of green-yellow phlegm (projectile) | kvadrat |
| `skyggehand_p.png` | a purple smoky shadow hand flying forward (projectile) | kvadrat |
| `stempelmerke.png` | a smudged red rectangular rubber-stamp imprint | liggende |
| `stjerne.png` | a white and yellow comic impact star burst | kvadrat |
| `tann.png` | a single gold tooth (currency pickup) | kvadrat |
| `tillegg_bandasje.png` | a tiny add-on worn by the player character: a head bandage with a red spot. Tiny, drawn alone | liggende |
| `tillegg_bart.png` | a tiny add-on worn by the player character: a glued-on mustache. Tiny, drawn alone | liggende |
| `tillegg_eyeliner.png` | a tiny add-on worn by the player character: heavy black eyeliner around two eyes. Tiny, drawn alone | liggende |
| `tillegg_glassoye.png` | a tiny add-on worn by the player character: a glass eye. Tiny, drawn alone | kvadrat |
| `tillegg_horn.png` | a tiny add-on worn by the player character: two small devil horns. Tiny, drawn alone | liggende |
| `tillegg_igler.png` | a tiny add-on worn by the player character: three leeches. Tiny, drawn alone | kvadrat |
| `tillegg_lys.png` | a tiny add-on worn by the player character: a lit candle stuck on the head. Tiny, drawn alone | stående |
| `tillegg_svulst.png` | a tiny add-on worn by the player character: a pink lump on the head. Tiny, drawn alone | kvadrat |
| `tillegg_tunge.png` | a tiny add-on worn by the player character: a tongue sticking out. Tiny, drawn alone | stående |

## Runde 5: våpen (7 bilder)

Våpenet står loddrett med håndtaket nederst og tuppen opp. Spillet roterer det selv.

| Filnavn | Beskrivelse til ChatGPT | Format |
|---|---|---|
| `vaapen_bekken.png` | a white enamel bedpan on a handle | stående |
| `vaapen_krok.png` | a surgeon's large bone hook | stående |
| `vaapen_mopp.png` | a janitor's mop, wooden handle, grey clamp, strings dripping purple | stående |
| `vaapen_sag.png` | a bone saw with a wooden handle | stående |
| `vaapen_slange.png` | a rubber hose with a brass nozzle | stående |
| `vaapen_sproyte.png` | a large glass syringe | stående |
| `vaapen_stativ.png` | an IV drip stand: metal pole with an empty drip bag | stående |

## Runde 6: figurer (54 bilder)

Vanskeligst. Be først om et figurark (samme figur forfra, bakfra, fra siden), og deretter om hode og kropp hver for seg fra arket. Armer og bein tegner spillet selv som tykke streker, så de skal ikke være med.

| Filnavn | Beskrivelse til ChatGPT | Format |
|---|---|---|
| `blob_flue_b.png` | a fat bluebottle meat fly with big red eyes. back view, facing away | liggende |
| `blob_flue_f.png` | a fat bluebottle meat fly with big red eyes. front view, facing the viewer | liggende |
| `blob_flue_s.png` | a fat bluebottle meat fly with big red eyes. side view, facing right | liggende |
| `blob_lunge_b.png` | a pink human lung walking on its own, tar spots, tiny sad face. back view, facing away | kvadrat |
| `blob_lunge_f.png` | a pink human lung walking on its own, tar spots, tiny sad face. front view, facing the viewer | kvadrat |
| `blob_lunge_s.png` | a pink human lung walking on its own, tar spots, tiny sad face. side view, facing right | kvadrat |
| `blob_svulst_b.png` | a walking pink tumor with veins, one eye and a grin. back view, facing away | liggende |
| `blob_svulst_f.png` | a walking pink tumor with veins, one eye and a grin. front view, facing the viewer | liggende |
| `blob_svulst_s.png` | a walking pink tumor with veins, one eye and a grin. side view, facing right | liggende |
| `blob_yngel_f.png` | drain spawn: a small purple slime creature with several mismatched eyes and a toothy grin, front view | liggende |
| `hode_bibliotekar_f.png` | HEAD ONLY (no neck, no body) of Ask the librarian, hair in a bun, small glasses, purple cardigan. front view, facing the viewer | kvadrat |
| `hode_hansen_f.png` | HEAD ONLY (no neck, no body) of Sister Hansen, a strict older nurse with a white cap. front view, facing the viewer | kvadrat |
| `hode_kokk_f.png` | HEAD ONLY (no neck, no body) of Fru Ruud, a round friendly cafeteria cook lady with a tall white chef hat and an apron. front view, facing the viewer | kvadrat |
| `hode_krok_f.png` | HEAD ONLY (no neck, no body) of BOSS: Chief surgeon Hektor Krok, huge and menacing, head mirror on his forehead, white coat with a blood-stained red apron. front view, facing the viewer | kvadrat |
| `hode_kultist_b.png` | HEAD ONLY (no neck, no body) of a pale gloomy edgelord teenager cultist, dark hood, black eye makeup, skinny black robe with four leather belts with gold buckles. back view, facing away | kvadrat |
| `hode_kultist_f.png` | HEAD ONLY (no neck, no body) of a pale gloomy edgelord teenager cultist, dark hood, black eye makeup, skinny black robe with four leather belts with gold buckles. front view, facing the viewer | kvadrat |
| `hode_kultist_s.png` | HEAD ONLY (no neck, no body) of a pale gloomy edgelord teenager cultist, dark hood, black eye makeup, skinny black robe with four leather belts with gold buckles. side view, facing right | kvadrat |
| `hode_olsen_f.png` | HEAD ONLY (no neck, no body) of Olsen the janitor, grey cap, bushy grey mustache, grey overalls. front view, facing the viewer | kvadrat |
| `hode_oppasser_b.png` | HEAD ONLY (no neck, no body) of a tall thin hospital orderly in mint-green scrubs, surgical cap and white face mask, tired squinting eyes. back view, facing away | kvadrat |
| `hode_oppasser_f.png` | HEAD ONLY (no neck, no body) of a tall thin hospital orderly in mint-green scrubs, surgical cap and white face mask, tired squinting eyes. front view, facing the viewer | kvadrat |
| `hode_oppasser_s.png` | HEAD ONLY (no neck, no body) of a tall thin hospital orderly in mint-green scrubs, surgical cap and white face mask, tired squinting eyes. side view, facing right | kvadrat |
| `hode_pasient_b.png` | HEAD ONLY (no neck, no body) of the player: a small patient with messy black hair, big round glasses, rosy cheeks, mustard-yellow bathrobe with a brown belt and an ID badge. back view, facing away | kvadrat |
| `hode_pasient_f.png` | HEAD ONLY (no neck, no body) of the player: a small patient with messy black hair, big round glasses, rosy cheeks, mustard-yellow bathrobe with a brown belt and an ID badge. front view, facing the viewer | kvadrat |
| `hode_pasient_s.png` | HEAD ONLY (no neck, no body) of the player: a small patient with messy black hair, big round glasses, rosy cheeks, mustard-yellow bathrobe with a brown belt and an ID badge. side view, facing right | kvadrat |
| `hode_pasient_x.png` | HEAD ONLY (no neck, no body) of the player: a small patient with messy black hair, big round glasses, rosy cheeks, mustard-yellow bathrobe with a brown belt and an ID badge. front view, dead with X marks over the eyes (comedic) | kvadrat |
| `hode_pleier_b.png` | HEAD ONLY (no neck, no body) of a big stern nurse, square jaw, angry brows, hair in a bun, white cap with a red cross, boxy white uniform with apron. back view, facing away | kvadrat |
| `hode_pleier_f.png` | HEAD ONLY (no neck, no body) of a big stern nurse, square jaw, angry brows, hair in a bun, white cap with a red cross, boxy white uniform with apron. front view, facing the viewer | kvadrat |
| `hode_pleier_s.png` | HEAD ONLY (no neck, no body) of a big stern nurse, square jaw, angry brows, hair in a bun, white cap with a red cross, boxy white uniform with apron. side view, facing right | kvadrat |
| `hode_rust_f.png` | HEAD ONLY (no neck, no body) of BOSS: hydrotherapist Ragnvald Rust, rubber diving-style helmet with round goggles, black rubber apron, big and damp. front view, facing the viewer | kvadrat |
| `kappe_kultist_b.png` | the long black cape with purple lining ALONE, hanging of a pale gloomy edgelord teenager cultist, dark hood, black eye makeup, skinny black robe with four leather belts with gold buckles. back view, facing away | kvadrat |
| `kappe_kultist_f.png` | the long black cape with purple lining ALONE, hanging of a pale gloomy edgelord teenager cultist, dark hood, black eye makeup, skinny black robe with four leather belts with gold buckles. front view, facing the viewer | kvadrat |
| `kappe_kultist_s.png` | the long black cape with purple lining ALONE, hanging of a pale gloomy edgelord teenager cultist, dark hood, black eye makeup, skinny black robe with four leather belts with gold buckles. side view, facing right | kvadrat |
| `kropp_bibliotekar_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of Ask the librarian, hair in a bun, small glasses, purple cardigan. front view, facing the viewer | liggende |
| `kropp_hansen_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of Sister Hansen, a strict older nurse with a white cap. front view, facing the viewer | liggende |
| `kropp_kokk_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of Fru Ruud, a round friendly cafeteria cook lady with a tall white chef hat and an apron. front view, facing the viewer | liggende |
| `kropp_krok_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of BOSS: Chief surgeon Hektor Krok, huge and menacing, head mirror on his forehead, white coat with a blood-stained red apron. front view, facing the viewer | liggende |
| `kropp_kultist_b.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a pale gloomy edgelord teenager cultist, dark hood, black eye makeup, skinny black robe with four leather belts with gold buckles. back view, facing away | liggende |
| `kropp_kultist_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a pale gloomy edgelord teenager cultist, dark hood, black eye makeup, skinny black robe with four leather belts with gold buckles. front view, facing the viewer | liggende |
| `kropp_kultist_s.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a pale gloomy edgelord teenager cultist, dark hood, black eye makeup, skinny black robe with four leather belts with gold buckles. side view, facing right | liggende |
| `kropp_olsen_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of Olsen the janitor, grey cap, bushy grey mustache, grey overalls. front view, facing the viewer | liggende |
| `kropp_oppasser_b.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a tall thin hospital orderly in mint-green scrubs, surgical cap and white face mask, tired squinting eyes. back view, facing away | liggende |
| `kropp_oppasser_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a tall thin hospital orderly in mint-green scrubs, surgical cap and white face mask, tired squinting eyes. front view, facing the viewer | liggende |
| `kropp_oppasser_s.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a tall thin hospital orderly in mint-green scrubs, surgical cap and white face mask, tired squinting eyes. side view, facing right | liggende |
| `kropp_pasient_b.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the player: a small patient with messy black hair, big round glasses, rosy cheeks, mustard-yellow bathrobe with a brown belt and an ID badge. back view, facing away | liggende |
| `kropp_pasient_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the player: a small patient with messy black hair, big round glasses, rosy cheeks, mustard-yellow bathrobe with a brown belt and an ID badge. front view, facing the viewer | liggende |
| `kropp_pasient_s.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of the player: a small patient with messy black hair, big round glasses, rosy cheeks, mustard-yellow bathrobe with a brown belt and an ID badge. side view, facing right | liggende |
| `kropp_pleier_b.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a big stern nurse, square jaw, angry brows, hair in a bun, white cap with a red cross, boxy white uniform with apron. back view, facing away | liggende |
| `kropp_pleier_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a big stern nurse, square jaw, angry brows, hair in a bun, white cap with a red cross, boxy white uniform with apron. front view, facing the viewer | liggende |
| `kropp_pleier_s.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of a big stern nurse, square jaw, angry brows, hair in a bun, white cap with a red cross, boxy white uniform with apron. side view, facing right | liggende |
| `kropp_rust_f.png` | TORSO AND HIPS ONLY (no head, no arms, no legs) of BOSS: hydrotherapist Ragnvald Rust, rubber diving-style helmet with round goggles, black rubber apron, big and damp. front view, facing the viewer | liggende |
| `sko_hvit.png` | ONE white nurse clog, side view | liggende |
| `sko_klogg.png` | ONE black clog, side view | liggende |
| `sko_stovel.png` | ONE black pointy boot, side view | liggende |
| `sko_tofler.png` | ONE pink bunny slipper with little ears, front view | liggende |

## Øvrige

| Filnavn | Beskrivelse | Format |
|---|---|---|
| `kortplukk.png` | kortplukk | stående |
