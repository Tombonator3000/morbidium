# Morbidium: systemene

Oppslagsverk over hvordan spillet er bygd, system for system. Flyttet ordrett fra memory.md 28.9., så memory.md kan være kort. Les avsnittet for systemet du jobber med (søk etter overskriften), og skriv nye detaljer om et system her, ikke i memory.md. Det som var dagsaktuelt da det ble skrevet, kan være utdatert; loggen (log.md og logg/) sier hva som skjedde når.

## Innhold
- Kroker (01_core.js, punkt 4, 28.9. kveld)
- Testklokka og testdelene (30_game.js, tools/testdeler/, punkt 5, 28.9. kveld)
- Kodesjekken (tools/sjekk_kode.js, punkt 7, 28.9. kveld)
- Utseende (besluttet etter Toms referanser)
- Teknikk
- Gjenbruk og lisenser
- Ting å huske
- Arbeidsdeling med ChatGPT
- Kuriositeter (Isaac-systemet)
- Pasienten (14_pasient.js)
- Merknader og slutten (33_merknader.js)
- Spor, byggeanimasjon og tips (33_merknader.js)
- Rom i 3D (15_rom3d.js), standard fra 2026-09-25
- Strekarmer og strekbein (11_doll.js)
- Musikk og lyd (06_musikk.js, Sound i 01_core.js)
- Menyer (32_meny.js)
- Apparater og lommerusk (27_utstyr.js)
- Spesialrom (13_rom.js, Spesial)
- Animasjon (16_anim.js)
- Blod og skrekk (34_blod.js)
- Nye fiender og minisjefer (29_monstre.js)
- Sjefpuljen og minisjefene (31_sjefpulje.js)
- HUD og UI-settet fra ChatGPT (32_meny.js, del G i DESIGN_BRIEF.md)
- Status for kunsten
- Etasjene og rommene (utvidelsen, UTVIDELSE.md)
- Hendelsene (35_hendelser.js)
- Drømmene (36_drom.js)
- Parken og Nattskogen: fiender og sjefer (37_utefiender.js)
- Tegnelistene (tools/lag_tegnelister.py, tegnelister/)
- Effekter og shadere (04_render.js, 38_effekter.js)
- Kombo (39_kombo.js)
- Dybde (40_dybde.js)
- Historien (41_historie.js)
- Lydbanken (42_lyd.js, assets/lyd/, tools/lag_lyd.py)
- Musikken som iMUSE (06_musikk.js)
- Blod og vann på skjermen (43_vaatt.js, 04_render.js)
- Testmodus (44_testmodus.js), fra 26.9. morgen
- Mobil (26.9.): grafikkminnet, mistet WebGL og layout
- Skygger, lys og diorama (26.9. kveld, spor A)
- Det store kartet (45_kart.js, 26.9. kveld, spor B)
- Kontroller i menyene (MenyNav i 32_meny.js, 26.9. kveld, spor B)
- TV-modus (26.9. kveld, spor B)
- Runde 5 (26.9. natt): kontrakten mellom sporene
- Kampbildet: varsler, nedslag, tekster og stempler (runde 5, spor A og D)
- Det skjulte rommet (48_skjult.js, runde 5, B2 og B4)
- Vinter i teksturene (runde 5, B3, og snøbildet fra Tom)
- Teksturer fra ChatGPT (runde 5, B1, og uteflatene fra Tom 27.9.)
- Nye fiender (runde 5, spor C)
- Snøfallet (47_sno.js, runde 5, C2)
- Kameraprøven og den nye etterbehandlingen (04_render.js), 2026-09-28

## Utseende (besluttet etter Toms referanser)
- Mål: Conan Chop Chop møter Castle Crashers. Tykk mørk kontur, flate farger med én skyggetone, store hoder, korte bein.
- Kamera: ortografisk, 52 grader helning, fast. Fra 28.9. kan vinkelen velges under Innstillinger, Bilde (Kameravinkel: som før, lav eller isometrisk), eller i adressen med ?kamera=iso (dreid 45 grader, helning 45) og ?kamera=lav (helning 42), se «Kameraprøven» under. Standard er som før til Tom har valgt.
- Figurer er 2.5D-papirdukker: illustrert hode og kropp som flate plater, armer og bein som tykke bånd bygget hvert bilde. Visninger forfra, bakfra og fra siden (speilet for venstre).
- Rekvisitter er tegnet i 3/4-perspektiv og står som plater festet i forkant.
- Gulv og vegger er ekte geometri med malte teksturer. Rommene er 3D som standard (lys, skygger, tåke, se under); uten 3D er skyggen langs veggene malt inn.
- Alle deler kan byttes mot PNG via SPRITES med samme festepunkt. Tegningen i koden er reserven.
- UI: pergament, gullring rundt portrett og kart, evnekort med messingnål og nummerskilt, dødskort med "DU ER DØD." og dødsårsak. ChatGPTs HUD-skisse (september 2026) er fulgt: rød sektor som teller ned i sekunder, ikonknapper, kompass med N, terskelstrek på Morbidium-stanga.
- Skrift: Alfa Slab One (overskrifter og tall), Alegreya (brødtekst), Caveat (håndskrift i bobler og notater).

## Teknikk
- Én selvstendig HTML-fil, Three.js r128 fra cdnjs.
- Kilder i src/, satt sammen av build.py til dist/morbidium.html. Rekkefølge: 00_head, 01_core, 02_data, 03_generator, 04_render, 05_world, 06_musikk, 10_art, 11_doll, 12_paint, 13_rom, 14_pasient, 15_rom3d, 16_anim, 17_romtyper, 20_actors, 22_sjefer, 25_items, 26_fiender, 27_utstyr, 28_oppskrift, 29_monstre, 31_sjefpulje, 34_blod, 35_hendelser, 36_drom, 32_meny, 33_merknader, 37_utefiender, 38_effekter, 39_kombo, 40_dybde, 41_historie, 42_lyd, 43_vaatt, 44_testmodus, 30_game. Rett etter 01_core legger build.py inn BYGG (dato og commit), LYDFILER (lydene som base64) og LYD_META. 38 til 44 pakker inn funksjoner fra de fleste andre filene (hurt, hurtPlayer, meleeHit, useAbility, bossDie, bossOnHurt, updateBoss, spawnBoss, stampBig, spawnProps, addPuddle, gainXp, runStats, startFloor, Samtale.vis, Drom.lag, Drom.epilog), så de må ligge sist før 30_game. 37_utefiender ligger etter 32_meny og 33_merknader fordi den legger nye fiender inn i fiendeindeksen (FIENDE_REKKE, SJEF_REKKE, FIENDE_INFO). 32_meny og 33_merknader ligger før 30_game fordi konstantene der må finnes når 30_game starter.
- Seks etasjer (MAX_DEPTH 6, fra 25.9. kveld): 1 Parken (ute), 2 Mottak, 3 Underetasjen, 4 Kjelleren: Isolat og arkiv, 5 Nattskogen (ute, under grunnmuren), 6 Dypet. THEMES[d].ute markerer uteetasjene. Fiendenes styrke følger dybdeStyrke(d) (STYRKE i 02_data.js: 1, 1.4, 2, 2.8, 3.4, 4), så Dypet er like tungt som før. Sjefene i etasje 1 til 5 trekkes for hvert løp fra puljen (trekkSjefer(seed), lagret i G.run.sjefer, gjentar seg så lenge puljen har færre enn fem); Journalen står fast i etasje 6. Signaturangrepene står i BOSS_MOVES i 22_sjefer.js og 31_sjefpulje.js.
- Render: ortografisk kamera, scenen tegnes til et mål, lys i eget lag (R.light), så ett etterbehandlingspass (gradering, papir, korn, vignett, blekkboiling, Morbidium, skade). Dukkene har egen shader (blink, kontur, oppløsning).
- Spillflyt i 30_game.js: tilstander title, panel, play, journal, dead. G.run holder løpet (pasient, egenskaper, kort i slots og reserve), G.meta lagres i localStorage under morbidium_meta_v2.
- Generatoren er ren data og testet: 1200 av 1200 etasjer gyldige, deterministisk.
- Løpet lagres ved starten av hver etasje (localStorage morbidium_run_v1) og kan fortsettes fra tittelen. Død og utskrivning sletter det.
- På berøringsskjerm er evnekortene i HUD-en selve evneknappene; body får klassen touch.
- Toon-vann er en ShaderMaterial med delte uniformer for tid og ringer.

## Gjenbruk og lisenser
- Tombonator3000/3044 (MIT): lydsynth og tidsfall.
- Tombonator3000/the-deep-ones (MIT i README): brun støy, tonerekke som skifter til urolig skala, sanity-effekter som modell for Morbidium-slør.
- cortiz2894/stylized-components (MIT, Christian Ortiz): toon-vannshader.
- scottstts/Threejs-Awesome-Graphics-Agent-Skills (MIT): partikkelpool med tett bytte, valideringsprotokoll.
- Brogue CE og Shattered Pixel Dungeon: bare som idékilder (GPL, ingen kode kopiert).
- Freesound: 102 lydeffekter og stemningslyder, bare CC0 1.0. tools/lag_lyd.py sjekker CC0-lenken på hver lydside før nedlasting. Navn på alle i assets/lyd/KILDER.md.
- Versilian Community Sample Library (VCSL, github.com/sgossner/VCSL, CC0): 63 instrumenttoner.
- iMUSE (LucasArts) er bare forbilde for musikksystemet.

## Ting å huske
- prosjektbibliotek kunne klones uten innlogging, altså offentlig, selv om AGENTS.md sier privat.
- Transcendensens-Vev-CRPG krever innlogging og er ikke sjekket.
- Egenskapene følger Toms journalskisse: Helse, Styrke, Smidighet, Forstand, Fatteevne (designdokumentet hadde Kropp, Smidighet, Vett, Nerver, Tryne). Ikke eksplisitt bekreftet av Tom.
- Journalen er karakterarket etter skissen, med frenologihodet og fire områder: Frykt, Kontroll, Uvirkelighet, Mening. Kort i eget område gir gullprikk og kortere nedkjøling (mitt forslag, ikke bekreftet).
- Fire nye evner fra skissen: Duesannsyn, Undersøkelseslys, Skyggehånd, Stempel.
- Testing i Claude Code-skyen: Chromium når ikke nettet via proxyen. Hent three.min.js med curl og kjør testene med --three STI eller MORBIDIUM_THREE=STI. Python-pakkene playwright (1.56.0 passer med den ferdiginstallerte Chromium) og pillow må installeres.
- Kommer endringer som zip og patch fra en økt uten GitHub-tilgang (Cowork), bruk patchen: git am på basen den ble laget mot, og cherry-pick oppå main. Zipen har hele filer fra den main-en økta startet fra, så en opplasting skriver over det som har kommet til siden (28.9. ville den slettet veggprøven i log.md, memory.md og todo.md).
- gpt-grafikk/ er en innboks fra 28.9. kveld. Nye leveranser tas imot med tools/ta_imot_grafikk.py (klipper, behandler inn i assets/ferdig og assets/deler, sjekker at alt fikk en fil, tømmer innboksen og fører commitene inn i arkiv/grafikk-originaler.md). Kjører du bare skjaer_ark.py lokalt for å prøve noe, sett innboksen tilbake etterpå (git checkout og git clean på mappa).
- test_ekstra.py har ikke valg for enkeltdeler. For å kjøre noen få deler kan main() klippes ved kommentarlinjene «# N)» (8 mellomrom inn), med oppstarten og avslutningen beholdt.

## Arbeidsdeling med ChatGPT
- Fra 28.9. kveld ligger originalene ikke lenger i gpt-grafikk/. Der det står under at noe ligger i gpt-grafikk/, ligger originalen i commit 578f6f2 (se arkiv/grafikk-originaler.md) og den behandlede utgaven i assets/ferdig/.
- 2026-09-28: veggprøven med fem teksturer og hele tegneliste 13 er levert som 14 PNG-filer, 53 manifestbilder. Status er 611 av 636. Ni vegger venter på Claudes vurdering av prøven på PC og mobil; 16 gulv venter på egne gulvfliser i koden. Se dokumentasjon/grafikk-2026-09-28/LEVERANSE.md og prompter.json. Ingen spillkode er endret.
- 2026-09-27: Tom ba Codex lage manglende utegrafikk og pushe. 14 nye bilder til gran, bakke, snø, hekk, skogkant og mur gir 558 av 558 manifestbilder. `UTE_FLATER` registrerer teksturene, og manifestverktøyet tar også med landskapsdekor fra `ROM_ART`. `tekstur: true` beholder hele bildeflaten og alfa ved behandling. Graner skal ikke sorteres bort når antall bakgrunnstrær begrenses. Se UTEGRAFIKK.md og utegrafikk-prompter.json før nye bestillinger. Dette er en levering på main; øvrig Claude-arbeid på den separate grenen er ikke flettet inn.
- 2026-09-26: alle 74 bestillinger i Claude-artifacten «Tegnelister» er dekket med 268 nye PNG-kilder: 257 manifestbilder og 11 delark med 97 synlige deler. Hele manifestet har nå 544 av 544 bilder. Lokal behandling: 544 bilder, 0 feil; bygg: 544 bilder, 124 deler, 165 lyder. Kasterens åtte bilder er gjenbrukt fra prøven. Se GRAFIKKLEVERANSE.md og grafikkleveranse.csv før noen nye bilder bestilles. Den hvite hjortens kropp og bein trenger fortsatt visuell kontroll i spillet.
- Claude koder, lager lyd og musikk og setter sammen bildene. ChatGPT lager bare bilder etter DESIGN_BRIEF.md. Tom laster opp til gpt-grafikk/ (erstattet assets/innboks/ 2026-09-24). Pages-bygget klipper og behandler bildene selv.
- Figurer bygges som oppskrifter av deler (hode, hatt/hår, tilbehør, kropp, farging). Armer og bein tegnes alltid av koden.
- Repoet ligger på GitHub som Tombonator3000/morbidium (opprettet 2026-09-24, innholdet kom som zip og ble pakket ut av Claude Code). GitHub-koblingen i Claude.ai virker ikke (peker på github.com); Claude Code er veien inn.
- Tom vil at alt arbeid skjer direkte på main (bestemt 2026-09-24). Ikke lag egne grener eller pull requests uten at han ber om det. Økta 25.9. var låst til grenen claude/practical-babbage-nc80bu av miljøet, så den må flettes inn i main før Pages oppdateres. Hver push til main bygger og publiserer til GitHub Pages: https://tombonator3000.github.io/morbidium/
- De 13 første evnekortene fra ChatGPT ligger i gpt-grafikk/. kort_due.png bruker den første, mer detaljerte duen som Tom valgte.
- ChatGPT har også lagt inn fem ark med alle 40 kuriositeter, ett ark med de åtte pillene og glass_tomt.png. Bildebehandlingen klipper arkene til enkeltbilder ved bygging.
- Spillerfiguren ligger i gpt-grafikk/figur_pasient.png som seks deler: hode og kropp sett forfra, bakfra og fra høyre side.
- Tom ønsker grovere og styggere ansikter enn i de første arkene, med asymmetri, skjevheter, ujevne tenner og røffe blekkstreker. Ikoner og utstyr skal beholde stilen sin. Standardpasienten og personalhodene er tegnet om. Kvinnearket er registrert som figur_pasient_kvinne.png (hode_pasient_kvinne_f/b/s). Mannsarket var en kopi av figur_pasient.png og er fjernet.
- Tre personalark i gpt-grafikk/ gir ni hoder, ni hodeplagg og ni uniformsdeler etter klipping. De vises først i spillet når oppskriftssystemet tar i bruk assets/deler/.
- Ett ark med fire sko og fem småobjekter gir ni bilder som bygges inn i spillfila.
- Et nytt ark med de ni siste plukk- og effektbildene gjør hele denne delen av den opprinnelige kunstlista komplett.
- Alle sju våpen fra den opprinnelige kunstlista ligger i ett ni ruters ark med de siste to rutene tomme.
- Tom har bedt ChatGPT starte rekvisitter og møbler som enkeltbilder i trekvart perspektiv. Første gruppe har åtte bilder i gpt-grafikk/: alter, tre disker, venteværelsesbenk, sykehusbord og stol forfra og bakfra. De behandles av den eksisterende bildeflyten.
- Hele runden med 51 rekvisitter og møbler er tegnet. De resterende 43 bildene omfatter oppbevaring, romrekvisitter, behandlingsutstyr og seng, båre og badekar i fire retninger. Alle PNG-filene ligger i gpt-grafikk/ med gjennomsiktig bakgrunn og filnavn fra manifestet.
- Hele den opprinnelige kunstlisten er dekket. Figurarkene for pleier, oppasser og kultist har seks visninger hver. Bibliotekar, Hansen, kokk, Krok, Olsen og Rust har hode og kropp forfra. Kultistens kappe har tre visninger, og flue, lunge og svulst har tre hver. Yngelen, spillerens døde hode, ni små ansiktstilbehør, slimskudd og kortplukk er også tegnet.
- Ni nye pasientplagg i tre retninger, sju hodeplagg og ansiktsmerker samt bare føtter og ullsokk ligger som enkeltbilder i gpt-grafikk/. ART_BRIEF.md viser 223 av 287 leverte bilder. Hele bildeflyten er kontrollert i en kopi med 223 bilder uten feil og 27 personaldeler.
- De ti aktive apparatene og tolv små lommerusk har nå egne PNG-ikoner i gpt-grafikk/. ART_BRIEF.md viser 245 av 287 leverte bilder. Kontrollbyggingen behandlet alle 245 uten feil.
- De 22 siste rombildene er også tegnet: arkiv, celle, kafeteria, vaskerom, gulvfarer og øvrige rekvisitter. ART_BRIEF.md viser 267 av 287 leverte bilder. Kontrollbyggingen behandlet alle 267 uten feil.
- De siste 20 figurfilene er tegnet, med flere retninger for Journalen, øyeblomsten, arkivrotta, tvangstrøyepasienten og slukyngelen, samt hoder og kropper for Overarkivaren, byråkraten og narkoselegen. ART_BRIEF.md viser 287 av 287 leverte bilder. Hele bildeflyten behandlet 287 bilder uten feil og bygget dem inn sammen med 27 personaldeler.

## Kuriositeter (Isaac-systemet)
- src/25_items.js: 40 kuriositeter som stables, ti navngitte synergier, fem forvandlinger (tre i samme gruppe), åtte ukjente piller per løp, preparatglass som leveringsform, blodoffer etter sjefen (koster ett hjerte).
- Slagene kan hoste slimklumper; nesten alle angrepsgjenstander virker på klumpene. Det er dette som gir kombinasjonene.
- Nye fiender: flue, svulst, lunge (enkeltsprites som yngelen). I 26_fiender.js: tvang, byrakrat, narkose, rotte (flokk på tre), oyeblomst (står fast). Byråkrat og narkoselege er tegnet bare forfra (ENEMY_ART), som tjenestefolkene.
- Tonen skal være mer absurd og grotesk, som Isaac, men fortsatt tegneserieaktig.

## Pasienten (14_pasient.js)
- Hver innleggelse lager et utseende (G.patient.look, kopiert til G.run.look): kjønn, hårfarge (6), hudtone (4), plagg (morgenkåpe i 8 farger, tvangstrøye, sykehusskjorte, stripete pyjamas, nattserk), sko (tøfler, klogger, bare føtter, ullsokker, støvler) og pynt (nattlue, papiljotter, hårnett, beskyttelseshjelm, sløyfe, plaster, sting). Fornavnet følger kjønnet (FIRST_K, FIRST_M).
- ChatGPT-hodene og kåpa farges om piksel for piksel. Hår farges bare der det er sammenhengende hår rundt (uskarp maske), ellers blir skjeggstubber prikker.
- Pasient.deler(look) gir alt som trengs; Pasient.dukke lager figuren. Brukes av spilleren, medaljen, innleggelseskortet, journalen, dødskortet, utskrivningskortet og likene. Lik i likhuset får tilfeldige utseender. Menn i morgenkåpe blir liggende som ChatGPT-liket (lik.png) farget om, alle andre som et sammensatt lik.
- Nøkler for bilder fra ChatGPT: hode_pasient_kvinne_*, kropp_tvang_*, kropp_skjorte_*, kropp_pyjamas_*, sko_barfot, sko_sokk, pynt_*. Nattserken har ingen bildenøkkel ennå (den går under hofta, og bildebehandlingen fester alt ved hofta).
- De nye plaggene og pyntbildene vises foreløpig i PNG-fargene. I src/14_pasient.js brukes bildene direkte uten omfarging, selv om pasienten fortsatt kan få andre valgte farger. Bare føtter farges etter hudtonen. Claude må koble på omfarging dersom fargevariasjonen skal synes på de nye bildene.
- Doll tar opt.rig (farger og mål) og opt.shoeP. Båndene til armer og bein har plass til 3200 punkter; med 900 ble fyllfargen kuttet og lemmene tegnet nesten bare i blekk (feil fra første versjon, rettet 2026-09-24).
- Pynten på hodet (runde 5, C1): den tette issen på ChatGPT-hodene når .78 over festepunktet (hårtustene .90), og tallene i PAS_PYNT og LOOKS gjelder disse bildene. PAS_PYNT har et valgfritt skala-felt. hodeTopp(P) måler issen én gang per hodelerret (reservehodet som koden tegner, måler .94), og deler() og placeLook flytter pynten som ikke sitter i ansiktet med hodeTopp − .78. Pynten og tilleggene dreies med hodet (placeAddons i 11_doll.js og placeLook i 25_items.js). HUD-portrettet krymper bare hodet når pynten stikker over kanten (nattlua, hjelmen).
- Frisyrene fra ChatGPT på personalet (Oppskrift.kleDeler i 28_oppskrift.js) er parykker med hull for ansiktet og legges med toppen på 1,06 av hodets høyde. Ansiktstilbehøret legges etter øynene (TILBEHOR_FESTE: briller, munnbind, gassmaske). Tegner ChatGPT nye hoder eller frisyrer, må tallene justeres, og testdel 56 viser det.
- Kroppen til Den hvite hjorten fra ChatGPT har bunnen på festepunktet (ay .1), så delen løftes .8 i LAGDUKKE.hjort når bildet finnes (en getter på y i 37_utefiender.js). Den tegnede reservekroppen står der den stod.

## Merknader og slutten (33_merknader.js)
- G.meta.merk = { id: tidspunkt }. MERKNADER har navn, krav, gir og eventuelt kur (kuriositeter som er låst til merknaden er fortjent). Merknad.laast(id) brukes av Items.pickFrom.
- Kroker: onDeath (showDeath), onBoss (bossDie), onWin (visUtskrevet), onKill (enemyDie, teller meta.drap og meta.mestere), onLoot, onTransform, onFragment, tick (tenner, diagnoser, Morbidium).
- Oppvåkningssteder kan låses med unlock: 'merk:<id>' (Kapellet: merk:rust, Vaktmesterens bod: merk:tenner). lockText(k) gir teksten.
- showWin viser først utskrivningsbrevet (utskrivningsbrev), så visUtskrevet med kortet. Gjeninnleggelse: G.run.gjen (valget huskes i meta.gjenValg). Ganger fiende- og sjefshelse 1,3, skade 1,2, mestersjanse 1,6, tenner 1,25.

## Spor, byggeanimasjon og tips (33_merknader.js)
- Spor.onFloor legger opptil to krittrablinger fra meta.historie på gulvet i kamprom; Spor.interact gir «Les rablingen».
- Bygg.onFloor gjør møblene utenfor startrommet flate (scale nesten 0, byggS husker skalaen); Bygg.tick bygger et rom når pasienten er innen seks ruter. Bygg.alt() bygger alt (brukes av rolig() i testene). Av med R.lowTex eller enkel grafikk.
- Tips.vis(id, forsinkelse) viser en lapp én gang (meta.tips); innstillingen tips slår dem av.
- Manifestet oppdateres med tools/lag_manifest.py (fletter inn, fjerner aldri). ART_BRIEF.md lages av tools/lag_brief.py og viser hva som er levert.

## Rom i 3D (15_rom3d.js), standard fra 2026-09-25
- Kvalitet (innstillingen kvalitet: 0 automatisk, 1 lav, 2 middels, 3 høy) i D3.NIVA: skyggekart, antall punktlys, glød, støv, lysstråler, tåke, tilt-shift, kantlys og oppløsning. Automatisk (D3.maal) går ned et trinn etter to målinger under 40, 30 og 22 bilder i sekundet, lagrer trinnet i settings.kvAuto og slår til slutt 3D av (D3.nedgrader). Testnettlesere måles ikke med mindre D3.tvingMaal er satt.
- Innstillingene har versjon (sv: 2). Eldre lagring får d3 slått på én gang; et nytt valg om å slå det av huskes.
- Lys: vegglamper med egen lyskjegle og flimring (D3.lamper), lysstråler og lysflekk fra vinduene, bakketåke i to lag, mørke som slukker lysene og flimrer dem tilbake (D3.morke, brukt av sjefer, minisjefer og høy Morbidium). D3.lysVed(x, z) gir fargen fra de nærmeste lysene, brukt til kantlys på dukker og ting (settKant, uRimCol i SPRITE_FS) og til animasjoner.
- Våte ting (userData.vaat: blod, pytter) blir Phong med litt egenglød i lysLag, så de ikke blir svarte i mørket.
- D3.sett(på) fra applySettings (innstillingen d3; #2d slår av). D3.onFloor() etter hver etasje og på tittelen. D3.tick(dt) hvert bilde, rett før R.render.
- R.light registrerer lysplatene i R.kilder; D3.fordel gir de nærmeste et PointLight (8, 6 og 4 etter kvaliteten, lykta først, uten at lyset hopper av og på, se «Skygger, lys og diorama»). Månen er et DirectionalLight med skyggekart som følger kameraet, låst til rutene i skyggekartet.
- Paint.mesh { gulv, topp, vegg } får MeshToonMaterial (gradient i fire trinn) og normaler. Vanlige MeshBasic-materialer i nivået blir Lambert. Alt huskes i D3.byttet og settes tilbake.
- Toms retning (24.9. kveld): figurer og ting forblir 2D-tegningene (så alle bildene fra ChatGPT brukes), bare rommene, gulvet og effektene er 3D. Lavpoly-møblene er fjernet.
- D3.moble(o) gjør rekvisittens tegning til skyggekaster (skyggePlate: MeshDepthMaterial med alfatest, setPart oppdaterer kartet) og gjemmer den gamle skyggeflekken (D3.gjemt, vises igjen i riv).
- D3.arkitektur: fotlist, brystlist og taklist (InstancedMesh per del) langs alle høye veggfronter, og pilastre med sokkel og kapitel hver tredje rute på bakveggen i hvert rom (midt mellom vegglampene og vinduene). En litt større blekkasse rett bak hver del gir strek på sidene og under. Paint.opptatt (settes av Paint.door og Paint.poster) holder lister, pilastre og vegglamper unna dører og plakater.
- Gulvet får bumpMap fra sin egen tekstur (D3.BUMP), så fugene får relieff i lyset. D3.stov: 192 støvkorn, hvert hører til ett punktlys og driver rundt i lyskjeglen (additivt, 4,2 px).
- Materialene som byttes, kastes i riv; egne materialer og geometrier ligger i D3.egne.
- Glød: R.renderBloom (lyse deler i kvart oppløsning, uskarpt to ganger), lagt til i etterbehandlingen når D3 er på. Den tegnede lysbufferen er av i 3D.

## Strekarmer og strekbein (11_doll.js)
- STREK = { tynn, farge, ben, arm, hand }: armer og bein som tynne mørke blekkstreker, som i Conan Chop Chop. Innstillingen lemmer ('tynne' som standard, 'tykke' gir de gamle båndene i klesfargen), avkrysning under Bilde. Brukes av Doll.update, drawDollPortrait (journal og kort) og corpseArt (liknøkkelen får .t).
- applySettings oppdaterer G.meta.settings på stedet (Object.assign), så panelet kan endre flere ting etter hverandre.

## Musikk og lyd (06_musikk.js, Sound i 01_core.js)
- Fra 26.9. morgen er musikken et lite iMUSE (se egen del under). Det som står her, gjelder fortsatt.
- Musikk er et sekvenseringsverk i åttendeler med forhåndsplanlegging (0,25 s). Stykker i STYKKER: tittel (spilledåsevals), e1 (vals i d-moll), e2 (sakte orgel med drypp), e3 (frygisk marsj med cembalo og skrivemaskin), e4 (kor og klokker), tjeneste (grammofonvals i dur, filtrert som en gammel grammofon).
- Tre lag: grunn (alltid), kamp (trommer og sagbass) og sjef (messing og pauker). Musikk.settNiva(0/1/2) toner lagene inn og øker tempoet litt. Morbidium (Musikk.morb) drar tonene skjeve og gir halvtonefeil.
- Lydbusser: sfx, amb (drone og stemningslyder), mus (musikken). Innstillinger: vol, sfx, mus, amb.
- Sound.tick spiller nå tilfeldige stemningslyder per etasje (klokke, knirk, drypp, rør, skrivemaskin, rotte, skrik, hjerteslag). Tonerekka fra the-deep-ones er erstattet av musikken.
- Hjerteslag under 25 % helse, raskere jo mindre helse. Stikk ved død (fallende orgel og gongong) og utskrivning (spilledåse i dur).

## Menyer (32_meny.js)
- Alt er papir og skaleres til skjermen med CSS zoom (fitPanel), ingenting ruller. Smale skjermer (under 700 px eller stående) får egne smale varianter.
- Tittelen: innleggelsesskjema med avkrysning. Pause: utklippstavle med portrett. Innstillinger: kartotekkort med fanene Lyd, Bilde, Spill, Styring, Data. Pasienthåndboka: hefte med ti kapitler og notater i margen. Kapittel 9 og 10 er fiendeindeksen (FIENDE_REKKE og SJEF_REKKE, fire kort per side, to på smal skjerm) med bilde fra fiendeBilde, hvor fienden bor, en kort tekst, et tips og hvor mange du har slått (meta.drapPer og meta.sjefDrap). Arkivet: skap med tre skuffer (pasientmapper med portrett og stempel, journalfragmenter, årsrapport).
- Innstillinger (G.meta.settings, normSettings): vol, sfx, amb, kamera (ganger R.view 11.5), shake (styrke 0 til 1, var av/på før), flash, distort, lights, simple, tall, bobler, skilt, ui (størrelse på HUD via CSS-variabelen --ui og scale), d3, kvalitet, kvAuto, blod (blod og skrekkeffekter), lemmer, sv (versjon).
- Data-fanen kan slette lagret løp og brenne arkivet (to trykk). Innstillingene beholdes.
- Etasje 3 har alltid minst ett isolat eller kartotek (generatoren, testet i test_gen).

## Apparater og lommerusk (27_utstyr.js)
- Aktiv: G.run.akt = { id, charge, max }, lades per ryddet rom (sjef to, batteri dobler). Lomme: G.run.trinket. Begge lagres med løpet.

## Spesialrom (13_rom.js, Spesial)
- Hemmelig rom i hver etasje bak sprukken vegg (F.crack er rutene; tre poeng: vanlig slag 1, tungt 3, eksplosjon 3). Forbannet rom i blindvei (torner tar et hjerte per inngang, glasset utløser bakhold). Blodofferrom med alter som tilbyr tre handler.
- Fra runde 5 finnes det hemmelige området ikke før veggen er slått inn, og sprekken er en flekk i pussen i stedet for en murkasse. Se «Det skjulte rommet» under.

## Animasjon (16_anim.js)
- ANIM: kasteklump, kastesprut, blodsprut, oye, kjottbiter, hver med n ruter, fps og en tegnefunksjon som reserve. Spriteark fra ChatGPT (anim_<navn>.png) brukes når de finnes; build.py legger rutenettet inn som ANIM_ARK.
- Anim.lag(navn, x, z, o): stående eller liggende plate (flat), løkke, én gang, baklengs (fart under 0), hold på siste bilde, farge (tint), festet til en annen gruppe (parent), lyses av lampene i 3D. Anim.tick i hovedløkka, Anim.clear ved ny etasje.
- POSER (kast, brol, greip, sving, og klemme og rulle fra 31_sjefpulje): nøkkelbilder for hender, lening, hode, klem og hopp. Fiender får e.positur = { navn, t, dur }, og Doll.update tar st.pose.
- behandle_bilder.py deler spriteark i ruter (like store, eller funnet ved de tomme stripene når arket har marg), beskjærer alle med samme boks og skalerer likt, så festepunktet står stille uansett format fra ChatGPT.

## Blod og skrekk (34_blod.js)
- Blod: flekker i InstancedMesh-er per tekstur (ring, farge per flekk), sprut i slagretningen, blod på veggene med drypp som renner (Blod.vegg, veggVed), kjøttbiter ved tunge drap (Blod.biter, lista heter bitene), blodige fotspor, blodspor etter sårede, drypp fra taket, øyne i veggene ved Morbidium over 50. Innstillingen blod slår alt utover vanlige flekker av (Blod.sett).
- Kroker: hurt setter e.hpFor og e.raaSkade før skaden, så dødseffekten vet om slaget var tungt. R.fx.blod (det gamle, ferdigmalte blodet på skjermen, bare når «Blod og vann på skjermen» er av; ellers 43_vaatt.js), R.fx.aarer (årer ved lite helse) og uFilm/uSplit/uTilt i etterbehandlingen (04_render.js).

## Nye fiender og minisjefer (29_monstre.js)
- Fra ChatGPTs forslag: kasteren, trille (sitter i rullestol, RIG.sete og hjul), speil (viser pasientens ansikt, sju års ulykke: G.run.buffs.ulykke, flaks minus 6 per stykk), klumpunge. Minisjefer (ENEMIES[t].mini, tittel): koret (Lagdukke), tannlege, portier (hodet er et eget tillegg som kastes, portierHode()).
- Grotesk-registeret har kroker for avstand (keep), retrett, prat, hold, hopp, ai, tick og styring, så nye fiender kan legges til uten å røre updateEnemy.
- Lagdukke (LAGDUKKE[type] med deler, lemmer og portrett) har samme grensesnitt som Doll.

## Sjefpuljen og minisjefene (31_sjefpulje.js)
- SJEF_PULJE, SJEF_DATA, SJEF_HP (helsa følger etasjen), sjefFor(depth), trekkSjefer(seed). Den Store Klumpen: klem, armslag, spytt (klumpunger), rull.
- Mini.onFloor: rommet med frivillig risiko får alltid en minisjef, og fra etasje 2 er det 35 % sjanse for en til i et kamprom lenger inne. Den kommer etter siste bølge (combatTick), får lilla helsestang (#miniBar) og gir preparatglass og hjerte (Mini.dod, meta.minisjefer).

## HUD og UI-settet fra ChatGPT (32_meny.js, del G i DESIGN_BRIEF.md)
- UI_SETT: ui_panel, ui_knapp, ui_kort, ui_skilt, ui_utklipp (9-delt med border-image, snitt i bildepiksler, kant på skjermen, rammen går litt utenfor og endrer ikke størrelsen på boksen), ui_ring_portrett og ui_ring_kart (legges over). brukUIsett() kjøres etter at bildene er lastet; hjerteHtml bruker ui_hjerte_full/halv/tom når alle tre finnes, drawHeadMap bruker ui_hode. Uten bildene tegner CSS-en som før.
- Neste steg (trenger kode): ui_bok, ui_fane, ui_stempel, ui_merke, ui_stang, ui_flaske.

## Status for kunsten
- ART_BRIEF.md: 287 av 532 bilder levert (25.9. natt). Alt som mangler (245 bilder), står som ferdige ark i tegnelister/: fiendene og minisjefene, koret og Klumpen, spritearkene, UI-settet, Parken og Nattskogen, hendelsene, drømmene og møblene, pluss 11 delark til oppskriftssystemet. ChatGPTs Kasteren-pakke («Pakken til Claude») har ikke kommet inn i repoet.

## Etasjene og rommene (utvidelsen, UTVIDELSE.md)
- Planen står i UTVIDELSE.md: seks etasjer, rom som ser forskjellige ut, hendelser, pasienthistorier i drømmer, nye fiender og sjefer. Tom valgte seks etasjer der to er ute, korte drømmebaner og grov, kroppslig humor (revy 1923, ikke eksplisitt), med Lynch og Twin Peaks som tone.
- Generatoren (03_generator.js): ROMTYPER[dybde] er kamprommene per etasje, trukket fra en stokket sekk. ROMSTIL[romtype] = [gulv, vegg, ute]. romStil(F, r) setter r.gulv, r.vegg og r.ute; i uteetasjene er alt som ikke er kamprom små paviljonger (i skogen koier). F.korridor har gulv og vegg for korridorene (grus og hekk i parken, sti og skog i skogen). F.vaer velges fra frøet.
- Former: noen kamprom får L-form eller avskårne hjørner (r.form 'L' eller 'rund'). Dørene finnes nå som korridorruter ved siden av en rute i rommet, ikke ved rektangelets kant. inRoom i decorateRoom sjekker roomId.
- topp(k, len) i decorateRoom plasserer store ting mot overveggen, så raden under, så nede, og til slutt et ledig sted.
- Maling (12_paint.js): floorCanvas maler hver rute med GULV[stil] fra 17_romtyper.js (sjakk og planker som før). Veggene grupperes per stil i hver sin mesh (Paint.mesh.vegger, userData.veggStil), med høyde, topp og gjennomsiktighet fra VEGG[stil]. Paint.wallS har stilen per veggrute. Uteetasjene får Paint.mesh.bakke.
- 3D: alle veggmeshene får toon-materiale, gjerder og ruiner er utklipp uten skygge. Vegglamper bare på innevegger (D3.inneVegg), lister og pilastre bare på pussede vegger (D3.listeVegg). Månen lyser sterkere ute.
- 17_romtyper.js: GULV (tre, teppe, sekskant, linoleum, stein, parkett, betong, fliser, brostein, gress, grus, jord, mose, myr, is, sti), VEGG (panel, paviljong, tapet, fliser, mur, stein, polstret, tre, tommer, glass, hekk, gjerde, steinmur, skog, ruin), rundt 60 nye ting i ROM_ART (nøkler prop_<navn>), Landskap (bakke og trær utenfor), Vaer (regn, snø, ildfluer; tåke gjør 3D-tåka tykkere), gulvUnder(x, z) (myr gjør deg treg, på is glir du), UTGANGER per etasje, lys fra nye ting og Romtyper.tick.
- Utgangene: porten (Parken), vinduet (Mottak), kloakken (Underetasjen), kullsjakta (Kjelleren), stien (Nattskogen), utskrivningen (Dypet). openTrapdoor bruker UTGANGER, og ankomstteksten vises i neste etasje. Drømmene skal komme her (trinn 3).
- Lyd og musikk: Sound.lydDybde mapper seks etasjer til de gamle fire, ute får ugle, kråke, kvist og hund, Sound.vaer spiller regn eller vind. stykkeFor(d) gir 'park' og 'skog' for uteetasjene.
- Gravsteinene på kirkegården har navnene til pasienter som har dødd før (meta.historie).

## Hendelsene (35_hendelser.js)
- HENDELSER[id] = { navn, dybder, plass, vekt, prompt, lag(h), tick(h, dt), samtale(h) }. plass er 'vegg' (en høy innevegg), 'gang' (en bred korridor) eller 'rom:a,b' (et kamprom av de typene, 'rom:*' for alle). Hendelser i rom kan først brukes når rommet er ryddet.
- Hendelse.onFloor() legger ut to til fire per etasje med frøet. Nye hendelser først; blir puljen for liten (de nederste etasjene), kan en fra tidligere i løpet komme igjen med lavere vekt, men aldri en fra etasjen rett over (run.hendelser, run.hendForrige). Hendelse.tving(id) legger ut en bestemt hendelse (for testene).
- Samtale.vis({ tittel, bilde, tekst, baklengs, valg }) viser panelet. Hvert valg har tekst, hint, kan() (sperret når den gir false) og gjor(), som gir neste side eller null for å lukke. Tallene 1 til 4 velger. Folge har småtingene valgene gir: tenner, hel, skade, morb, xp, kart, naerRom, kuriositet, lomme, flaske, fiender, hjerte.
- h.brukt settes når et valg gir noe, så det ikke kan gjentas. Hendelse.borte(h) fjerner scenen (kjempen, lampemannen).
- Minne på tvers av løp: meta.hendelser[id] teller hvor mange ganger du har møtt hver. Øyet husker forrige pasient (meta.oyetHusker), kua husker sparket (meta.kuSpark), telefonen, badekaret og kona med kubben sier noe annet andre gang.
- Graven kan svekke sjefen i etasjen (run.sjefSvekk[d] tar 20 prosent av helsa når sjefen kommer). Hjemmebrent gir styrke i 25 sekunder og et spor av spy som fiendene sklir i (run.fyllT).
- Portrettene: hendBilde(P) beskjærer tegningen til det som faktisk er tegnet (innhold()), hendFigur(type) tegner en dukke forfra, oyeBilde() er øyet tett på.
- Atten hendelser: øyet, mannen som går baklengs, telefonen, kaffe og kake, kua, hjemmebrent, doet (utedo i parken), mannen i badekaret, heisen, rotteparlamentet, graven, den dansende pleieren, radioen, kaffeselskapet, kona med kubben, kjempen, tannfeen og mannen som er en lampe.

## Drømmene (36_drom.js)
- Historien trekkes fra frøet første gang den trengs (Drom.historie(), lagres i G.run.historie): hjem (sju steder), person med navn og kjønn, hendelse (bare de som passer hjemmet), skyld (seks), tegn som går igjen (sju) og et felles minne. Drom.ord(H) gir alt tekstene trenger, med pronomen.
- Utgangen etter sjefen (descend) setter G.run.dromVent = neste dybde. startFloor ser det og bygger en drøm i stedet for etasjen: G.drom = Drom.lag(depth) med eget tema (DROM_TEMA), egen liten etasje (tre rom på rad, 50 x 26 ruter) og egen musikk (STYKKER.drom og losje). Løpet lagres med neste dybde og dromVent, så Fortsett spiller drømmen på nytt. Når drømmen er over, settes dromVent til 0 og startFloor bygger den virkelige etasjen.
- Kapitlene (DROM_KAP): 1 Hjemme, 2 Personen, 3 Dagen det skjedde, 4 Det du gjorde, 5 Det som er sant. Fra 26.9. følger kapitlene startetasjen (Historie.kapittelFor i 41_historie.js): fra etasje 1 blir det 1 til 5, fra vaskesjakten (etasje 3) 1, 4 og 5, så skylda alltid kommer før sannheten. Utgangen fra etasje 5 gir alltid kapittel 5. Hvert kapittel har intro, tre minner (ett i hvert rom), figurer med tomme papiransikter (blank_m, blank_k), personen, og et valg ved døra.
- Skyggen er pasienten selv i svart (Pasient.dukke med mørk tint). Den våkner ved første minne og følger sakte etter. Tar den deg igjen, våkner du for tidlig med 25 Morbidium, og valget blir 'flukt'. I kapittel 4 snakker den med skylden din, i kapittel 5 står den med ryggen til og snur seg når minnene er funnet.
- Valgene: tilgivelse, sannheten, gjentakelse eller fornektelse (flukt teller som fornektelse). Drom.slutt() tar det som kom oftest, kapittel 5 teller dobbelt og vinner uavgjort. Slutten vises før utskrivningsbrevet (utskrivningsbrev er pakket inn), og Drom.mappe() skriver det pasienten har drømt i pasientmappa (meta.historie[].drom), både ved død og utskrivning.
- En pasient fra før kan stå i drømmen din med navnet sitt og fortelle om sin egen drøm.
- Gulvet sikksakk og veggen forheng finnes bare i drømmene. F.taake overstyrer tåka i 3D. G.ekstraDukker er dukker utenfor fiendene som 3D skal lyse opp (hendelsene og drømmene).
- Drom.hopp(slutt) hopper ut av drømmen (testene bruker den). Spilleren kan også velge «Våkn med en gang» i innledningen.

## Parken og Nattskogen: fiender og sjefer (37_utefiender.js)
- Parken (etasje 1): gartneren (to klipp med hagesaksa, riva drar deg inntil) og kråka (flyr i flokk, stuper i en linje, blir liggende om den treffer veggen). Kråka er en Lagdukke som svever og slår med vingene.
- Nattskogen (etasje 5): Huldra (vakker forfra, en råtten stamme bakfra; snur ryggen til når hun slår, og sangen hennes drar deg mot henne, e.lokker), Vedkubbemannen (flis i vifte, skaller på nært hold, går til siden når han ikke ser deg) og Nøkken (under overflaten er han usynlig og kan ikke treffes, e.dukket; han kommer opp, drar deg under og spiller fele).
- Kålhodet er en liten kål med tenner som Overgartneren planter.
- Sjefene: Overgartner Ansgar Hekk (saks, hekkring som blokkerer ruter i seks sekunder med to åpninger, gjødsel som mokk og røyk, kålhoder) og Den hvite hjorten (storm i en rett linje som ender i BONK mot veggen, geviret rundt seg, rødt månelys, og tåke med kopier der den selv blir halvt borte). Begge ligger i SJEF_PULJE, så etasje 1 til 5 trekker nå fem av seks.
- Fiendeindeksen har 22 fiender og 10 sjefer. Håndboka har 17 sider.
- Bildene fra ChatGPT til utvidelsen står i runde 10 til 13 i ART_BRIEF.md. tools/lag_manifest.py går gjennom seks etasjer og lager også utgangene, hendelsene (HEND_ART) og drømmene (DROM_ART). Gravsteiner med navn tas ikke med, fordi navnene tegnes av koden.

## Tegnelistene (tools/lag_tegnelister.py, tegnelister/)
- Verktøyet regner ut hva som mangler (manifestet minus det som er levert: de behandlede bildene i assets/ferdig og det som venter i innboksen gpt-grafikk/, samme regel som ART_BRIEF.md) og skriver én liste per ChatGPT-samtale: figurark, «ni ting»-ark, enkeltbilder, spriteark, UI-bilder og delark, med filnavn, mal og ferdig engelsk prompt. LESMEG.md har oversikten og tegneliste.csv det samme som regneark.
- Planen (LISTER i skriptet) samler ting som hører sammen på samme ark. Det som er større enn 400 piksler i spillet, blir enkeltbilde, fordi en rute på mal_ni_ting.png er rundt 330. Nye nøkler som ikke står i planen, havner i en liste «Øvrige» av seg selv.
- --bilder tegner dagens kodetegninger inn i samme rutenett som malen (referanse/ref_*.png). Nøklene ligger i en tekstbit i PNG-en, så en referanse som ikke lenger passer arket, blir ikke vist. Navnene starter med ref_, så verktøyene ignorerer dem om de havner i gpt-grafikk/.
- Delarkene bruker seriene oppskriftssystemet leter etter: personale, kultister og pasienter (kropper for pleiere og oppassere heter uniformer, ansiktstilbehør kan hete ansikt). har_diverse fra den gamle briefen ville aldri blitt brukt og heter nå har_personale.
- lag_brief.py og lag_manifest.py kan importeres uten å skrive filer (skriv() og apne_spill()).
- Liste 10 (Historien) har journalsidene og sluttbildene på ett ark, og forstanderen, Venterommet og skrinet som egne bilder. Runde 14 i ART_BRIEF.md.
- --side STI.html lager én side med alle arkene, kopieringsknapper og avkryssing for levert (localStorage), til mobilen. Referansebildene må ligge i referanse/ ved siden av. Publisert som Artifact «Tegnelister»: https://claude.ai/artifact/CwTKtxx3rN65Es4PKpTPrW (oppdateres ved å publisere samme fil på nytt med url).

## Effekter og shadere (04_render.js, 38_effekter.js)
- Etterbehandlingen har fått R.sjokk(x, z, styrke) (opptil fire ringer som skyver bildet utover, med fargesplitt i kanten), R.zoomStot(x, z, styrke), R.negativ(t) (vrengt blekk), R.fx.ca (fargesplitt), R.fx.lyn (kaldt blink, sterkest øverst), R.fx.hete (brennende skjermkant) og R.fx.drom (drømmeslør: bølger, bleke farger og en vignett som puster). Forvrengning følger distortOn, blink følger flashOn. storeFx() oppdaterer alt hvert bilde og lar det dø ut.
- Glod: partikkelskyer der posisjonen regnes ut i vertex-shaderen fra tiden (ingen oppdatering per partikkel på prosessoren). Typer i GLOD_TYPER: gnister, glor, damp, roy, sporer, morb, moll (i bane rundt lampen) og kombo. GLOD_KILDER sier hvilke ting som får hva (bål, vedovn, kjele, komfyr, gryte, stearinlys, kjempeplante, lyktestolpe), med høyden i tegningens enheter ganget med BILL_Y. Antallet følger kvaliteten (hoy 1, middels .65, lav .35, uten 3D .6), og enkel grafikk lager ingenting.
- Lyn.slag(x0, y0, z0, x1, y1, z1, valg) lager taggete bånd som vender mot kameraet og tegnes om hvert 55. millisekund så de flakker. Uvaer slår ned ute i regnvær hvert 11. til 26. sekund, med varsel på bakken i 0,85 sekunder: 45 skade på fiender, 30 på sjefen, 10 på pasienten, et svidd merke og gnister. I 3D løfter lynet månelyset (D3.maneI). Dødsårsak «lyn».
- Teslaspolen (spole) slår en bue med et par sekunders mellomrom mot den nærmeste fienden innen 3,6 ruter (14 skade), ellers ut i lufta. Den skader ikke pasienten.
- Regnringer er et skyggelag over uteflisene med ringer fra et hash-rutenett, bare når det regner.
- Store øyeblikk som har fått sjokkbølge: eksplosjoner fra kuriositetene, nytt nivå, sjefer som dør (med zoom, negativ og fargesplitt).
- Partiklene (Particles i 04_render.js, runde 5, A5) er flater som vender mot kameraet, med fire tegninger fra ett ark på 128 x 128 (gnist, blekkdråpe, papirbit, støv) i stedet for klosser. Particles.spawn tar o.form ('gnist', 'drape', 'papir', 'stov' eller 0 til 3); uten o.form gjettes formen fra fargen og o.flat. Gnister strekkes langs farten. 900 plasser, ett tegnekall, og bare de levende sendes til skjermkortet. Enkel grafikk gir farget klosser (Particles.bygg bytter når R.safe endres). Før var alle partiklene svarte, fordi fargelista til en InstancedMesh ble laget med setColorAt mens count var 0. Lag den for hele kapasiteten.

## Kombo (39_kombo.js)
- Treffkjeden teller alle slag fra pasienten som treffer (ikke blødning og gift, src.dot). Vinduet er 2,4 sekunder spilltid. Nivåene står i KOMBO_NIVA (5 Lett irritert, 10 Blodig, 20 Kirurgisk, 35 Klinisk sinnssyk, 50 Morbid, 75 Apokalyptisk, 100 Guddommelig inngrep, 150 Utenfor journalen), med lyd kombo1 til kombo5. Fra nivå 3 kommer stempelet (#kstempel) og kunngjøreren, fra 4 tidsfall og zoom, fra 5 negativ og lyn i en fiende.
- Kjeden brister når pasienten tar skade (trombone over 10), og gir erfaring (0,8 per treff) og kassaapparat når den slutter av seg selv. Telleren (#kombo) står til høyre under verktøyknappene og rister mer jo lengre kjeden er.
- Flerdrap: drap innen 1,1 sekund teller sammen, og meldes 0,35 sekunder etter siste drap (FLERDRAP: dobbeltdrap, trippeldrap, firlinger, massakre, epidemi, pandemi). Overkill er drap med minst 25 skade og 2,5 ganger det som var igjen. Miljødrap er drap fra 'env' (strøm, lyn, spolen, eksplosive mestere).
- Perfekt unnvikelse er et treff midt i rullingen (tidsfall, med 2,2 sekunders pause). Tredje slag i kjeden eller et fullt ladet tungt slag som treffer minst to, gir finale. Tre ulike evnekort innen 2,6 sekunder gir LEGEKUNST.
- Sound.stemme(ord) er kunngjøreren: stavelser av sagtann gjennom to formantfiltre per vokal, dypt og med kirkeklang. Lydmotoren har fått lagvalgene rv (kirkeklang), vib, dist, lp og atk, lange støylag i sløyfe, og en kompressor på hovedutgangen.
- Innstillingen kombo (Lyd, «Kunngjører og fanfarer») slår av stemmen og alle kombolydene. Merknadene Blodrus (50 på rad) og Massakre (fem på et øyeblikk). Dødskortet viser lengste kjede og flest på en gang (G.run.komboMaks, G.run.flerdrapMaks).
- I kamp går musikken over i sjefslaget (Musikk.settNiva(2): messing, pauker, raskere tempo) når treffkjeden passerer 35.
- Kombo.tall teller hva som har skjedd, til testene.

## Dybde (40_dybde.js)
- Lykteskygger: fiender, sjefen, personalet, G.ekstraDukker og høye ting (userData.P.h >= 1,1) nær lykta får en flat skyggeplate som snus bort fra lykta og strekkes etter avstanden, hvert bilde. Styrken følger lykta i forhold til grunnstyrken, så den flakker med. Ekte punktlysskygger passer dårlig fordi tegningene er strukket i høyden (BILL_Y).
- Kontaktskygger (Dybde.kontakt): et lerret med 8 piksler per rute som mørkner gulvet mot veggene og i indre hjørner, sterkest under de høye veggene i nord. Males i decorateLevel og fjernes i clearFloor.
- Takstøv: R.shake over 0,5 inne (ikke ute, Vaer.ute) drysser stein og puss fra taket (InstancedMesh med MeshBasicMaterial, så det synes i 2D også), med skygge som vokser mens steinen faller. Minst 1,2 sekunder mellom hver gang.
- Kameradykk: R.kamZoom(k, t) og R.kam i 04_render.js, kalt når sjefen kommer, når pasienten dør og på store kombo-øyeblikk. Følger shakeOn.
- Varmeflimmer (VARME-tabellen, R.varmeL, uVarme i etterbehandlingen) over bål, vedovner, kjeler, komfyrer og gryter. Følger distortOn.
- Dybde.speil gir vannshaderen de seks nærmeste lyskildene (uLysP, uLysF), og D3.taakeLys gir tåka i 3D de samme punktlysene.
- Enkel grafikk (R.safe) lager ingen kontaktskygger eller lykteskygger.

## Historien (41_historie.js)
- Tonen (Toms ønske 26.9.): Hellraiser møter Twin Peaks, på et norsk sanatorium i 1923, med Lovecraft-stemning. Egen mytologi, ingen navn eller sitater fra filmene eller serien.
- Hovedhistorien: under huset er det et hav, eldre enn fjorden, og der sover den første pasienten, nr. 0. Når det gjør vondt i den, drømmer den mennesker, og pasientene er drømmene dens. Morbidium er det den blør, og det stiger opp gjennom avløpene og liker smerte og stolthet. Høsten 1886 kjøpte dr. Mathias Morbeck en protokoll i sort skinn på auksjon i Bergen (funnet i en hval utenfor Røst). Journalen er en lås: hvert navn vrir den et hakk. I 1887 vred han den helt rundt, en bjelle ringte, og Avdeling Null kom opp: leger som ble behandlingen, med kitler sydd til huden og kroker i kjeder. De ga ham «den fullkomne kur». Nå sitter han sydd fast til stolen med sølvkroker og leser høyt for den som sover. Mellom søvnen og drømmen ligger Venterommet (røde forheng, sikksakkgulv, den lille legen som snakker baklengs), som også er kapittel 5 i drømmene. Spillet foregår 24. september 1923, så ingen har jobbet der i mer enn trettiseks år.
- Journalside før hver drøm (JOURNALSIDER 1 til 5): Samtale.vis er pakket inn, så innledningen til kapitlet kommer etter «Les videre» (og etter Escape, via panelO.onBack). Sida nevner sjefen fra forrige etasje (SJEF_EPITAF) bare hvis den er behandlet i dette løpet (G.run.behandlet, fylles i bossDie), og hva Journalen mener om forrige valg (VALG_MERK). G.run.journalsider husker hvilke sider som er lest.
- Kapitlene følger startetasjen (Historie.kapittelFor). Over startetasjen (bare mulig i testene) og fra etasje 5 gjelder den gamle regelen.
- Forstanderen (HENDELSER.forstanderen, bare i Dypet, vekt 60, rom:*): spør, les over skulderen (linjer fra historien), ta pennen (G.run.pennen, 15 Morbidium, merknaden Pennen, Journalen starter med 80 prosent helse) eller løs ham fra krokene (G.run.forstanderLos: når panelet lukkes, ringer bjella og kjettingene henter ham ned, pasienten får 40 helse, en kuriositet og merknaden Løslatelse, og Journalen får 20 prosent mer helse). Pennen bruker ikke sjefSvekk lenger, fordi den viser teksten fra graven.
- Kjeder: kjettinger med kroker fra mørket (bånd med leddtekstur og en krok som sprite). Kjeder.rundt(mål, n, o) fyrer n kjettinger litt etter hverandre, og treff(K) kalles når den første strammes. Går i spilltid via Hendelse.tick, ryddes i clearFloor, lages ikke med enkel grafikk (treff kalles likevel). Lydene bjelle og kjetting ligger i Sound.lib. Dødsårsaken kroker.
- Nye hendelser (HENDELSER_HISTORIE): Venterommet (vegg, etasje 2, 3, 4 og 6: baklengs tale, fire valg, forsvinner etterpå) og Morbecks instrumentskrin (rom:*, samme etasjer: «Vri på mønsteret» gir kjettinger når panelet lukkes, 18 skade, 15 Morbidium, en kuriositet og 40 erfaring).
- Sjefene: LINES.monolog2 (ny tale ved en tredjedel helse, byttes inn i bossOnHurt), slengord hvert 8. til 14. sekund (LINES.boss per type, Krok og Journalen har fått flere), LINES.bossDod (siste ord på et merke der sjefen sto). Journalen svarer seg selv etter 2,3 sekunder og kommenterer pennen eller den tomme stolen. Hjorten nevner den hvite hesten hvis tegnet i drømmene var hest.
- Historie.personlig() etter hver startFloor: PA, LINES.koret og NPC_LINES settes tilbake til utgangspunktet (med havlinjene lagt inn ved lasting) og får linjer fra drømmene (fra etasje 3) og NPC_DYP.
- Slutten: «Siste side» (SISTE_SIDE med a, morbeck og los) før etterordet. Historie.brev() gir tittel, stempel, avslutning og underskrift (pasienten med pennen, «tidligere forstander» når han er løst). Historie.konklusjon() står på kortet.
- Ni nye journalfragmenter (auksjonen 1886, to notater fra 1887, byggmesteren 1901, Olsen 1918, styrmann G. J. 1921, universitetet 1922, siste notat, hele historien), merknadene Løsrevet, Villnis, Ansiktet tilbake, Pennen og Løslatelse.
- Bildene (HISTORIE_ART): historie_1 til 5, historie_slutt_<slutt>, prop_forstander, prop_venterom og prop_skrin, med reservetegninger i koden. Liste 10 i tegnelister/ og runde 14 i ART_BRIEF.md.

## Lydbanken (42_lyd.js, assets/lyd/, tools/lag_lyd.py)
- 165 lyder, alle CC0: 102 fra Freesound (effekter og stemning) og 63 instrumenttoner fra VCSL. Mono-MP3, effektene i 32 kHz, stemningen i 24 kHz, 1,57 MB i alt (2,1 MB som base64 i fila).
- tools/lag_lyd.py: lista FREESOUND (navn, id, bruker, tittel) og INSTRUMENTER (mappe i VCSL, filer, valg). Samme navn flere ganger gir varianter (navn, navn_2). Mellomlager i .lydcache/ (ignorert av git). --bare navn,ins_orgel lager bare noen på nytt. lyd.json har gruppe, type (sfx, amb, ins), sek, sloyfe ([start, slutt] i sekunder) og rot (MIDI) for instrumentene.
- Sløyfene (amb_*, klokketikk, summ) har 0,15 s ekstra lyd på hver side, fordi nettleserne legger ulikt mye stillhet foran en MP3 (Chrome tar den stort sett bort). Holdetonene (orgel, orgelbass, vinglass, psalter, saks) har sløyfe på et helt antall perioder, seks desimaler.
- Lydbanken pakker ut etter første trykk (Sound.init), fire om gangen, effektene først, i lydenes egen samplingsfrekvens via OfflineAudioContext (30 MB mot rundt 48). Stillheten foran måles per lyd (Lydbank.forsink).
- LYD_KART: Sound.play(navn) -> opptak med styrke, tonehøyde og valg (lp, rv, pan), syn = hvor mye synth som ligger under. Tilfeldig variant, aldri samme to ganger på rad, høyst fem like på 80 ms. Navn som mangler i kartet, spilles som synth. Innstillingen «Innspilte lyder» (opptak) slår alt av.
- Fottrinn (FOTGULV) etter gulvUnder og pytter, hvert 1,45 rute. Stemningen (Stemning): sløyfer per etasje (STEMNING_ETASJE), per romtype (STEMNING_ROM), vær (Sound.vaerType, regnet og vinden tar over for støyen), bål og ovner etter avstand, og havet i drømmene. Synthdronen går under med 55 prosent styrke (Sound.droneNiva). Fiender i FIENDESTEMME stønner, hvisker eller piper fra siden de kommer fra (Lydbank.ved).

## Musikken som iMUSE (06_musikk.js)
- Musikk.velg(dt) i hovedløkka er dirigenten: stykket (drømmen, grammofonen i tjenesterommene, ellers etasjen), besetningen etter romtype (ROM_BESETNING -> BESETNING), laget (kamp, sjef, blodrus) og roen.
- spill(navn) bytter på neste taktstrek, med minst ett slag til broen (harpeløp opp dominanten i den nye tonearten og bass på den). Et bekken svulmer inn mot første slag, og paukene slår den nye grunntonen. Musikk.navn er stykket som spilles nå, Musikk.neste og Musikk.overgang det som venter.
- Besetningen byttes på taktstreken (bNeste). Kamplaget kommer på neste slag med bekken og pauke og går ut på neste taktstrek. Tempoet følger laget.
- Instrumentene (MUS_INS) er opptak fra lydbanken med nærmeste tone og tonehøyde, holdetoner med sløyfe, styrken k målt fra lydnivået. Synthstemmene er reserve og brukes fortsatt til kor, messing, sagbass, hatt og knitring.
- Innslag (Musikk.innslag) på neste slag: ryddet (clear), niva (level), hel (heal) i stedet for synthlydene. Plingene i LYD_STEMT stemmes etter akkorden (Musikk.stem). Stemningslyder med kvant legges på neste åttendel (drypp, skrivemaskin), klokka (mus: klokke) på neste taktstrek på grunntonen (Musikk.pynt). LYD_DUKK: store smell får musikken til å dukke unna.
- Roen: roT teller opp når det ikke er kamp, fiender innen åtte ruter eller nytt rom. Etter 20 s glir glid fra 1 til 0,35 over 12 s: færre melodinoter, lavere lag, og stemningen løftes (stemningK). Nytt rom setter roT til høyst 6.
- Dronen i veggene stemmes etter grunntonen (Sound.stemDrone).
- Rettet 26.9.: drømmemusikken ble byttet ut med etasjemusikken etter første bilde (30_game.js valgte stykke uten å se på G.drom).

## Blod og vann på skjermen (43_vaatt.js, 04_render.js)
- Dråper i et høydekart (lengste side 384 punkter, rødt vann, grønt blod), tegnet som kupler med «lighter». Spor som polylinjer som blir tynnere med alderen (blod 12 s, vann 3,5 s). Ingen varig lerretslag, fordi uttoning i 8 bit blir stående igjen som svake spor.
- Fysikk: klistrer seg fast til radius over 3,0 (blod) eller 2,3 (vann) i 135-skala, glir med fart etter vekt (blod høyst 40, vann 115 punkter i sekundet), vingler, legger igjen perler, slås sammen (største tar over, høyst 6,5 og 5 i radius), tørker (blod raskere etter 8 s, vann etter 5 s). Høyst 110 dråper.
- Etterbehandlingen: uv forskyves etter gradienten i høydekartet (brytning, 40 prosent selv uten «Forvrengning»), blod etter Beer-Lambert (tykt nesten svart, tynt rødt), skarpt lyspunkt fra øvre venstre, lys i bunnen, mørk kant. uVaatt er 0 når skjermen er tørr, så ingenting regnes da.
- Kilder: Blod.treff på pasienten (fra siden slaget kom fra, store dråper ved hardere treff), Blod.dod og sjefDod tett ved (Vaatt.naert), Sound.play('splash'), pytter under fottrinn, regn ute og i gårdsrom. startFloor tørker skjermen. Innstillingen vaatt, og blodet følger også blod.
- Runde 5 (A4), fordi blodet rant som rette, tynne streker fra toppen: dråpene mister masse når de renner (r² minker med 0,2 ganger bredden ganger strekningen), stopper og rykker (stick-slip), følger et felt av riper per etasje (Vaatt.flyt, frø i Vaatt.fro), og sporene lagrer punkter som [x, y, w, t0], så de smalner og renner av ovenfra. Et spor forsvinner når det nyeste punktet er 8 s (vann 3,5 s), og gamle biter perler seg. Tunge treff starter dråpene lavere, høyst seks bloddråper renner samtidig, og lerretet lastes opp annethvert bilde når ingenting renner. Den blå kanalen i tVaatt er ledig.

## Testmodus (44_testmodus.js), fra 26.9. morgen
- Slås på under Innstillinger, Spill («Testmodus», G.meta.settings.testmodus) eller med ?testmodus i adressen (én gang per lasting, Testmodus.urlBrukt, så den kan slås av igjen).
- Måleren (#testHud i #hud, til venstre midt på): bilder i sekundet nå og laveste, 3D og kvalitet, minne (performance.memory, bare Chrome), lydbankens minne, lyder pakket ut, musikken og dråpene.
- Tallene samles bare når testmodus er på, i G.run.test (lagres med løpet): etasjer (d, navn, drom, t0, sek, drap, skade per kilde, hel, tenner, sjef med tid, fps), fps for hele løpet (snitt, laveste sekund, sekunder under 30), kvalitetsbytter, lydutpakking, mening (svar 0 til 2 per spørsmål), fritekst og slutt.
- Skade: hurtPlayer-innpakningen gir kilde (src.type); fall i helse som ikke gikk gjennom den (torner, Morbidium, blodoffer), telles som «annet» i tick. Bilder i sekundet måles i hele sekunder, de tre første sekundene av en etasje og pauser over ett sekund regnes ikke med.
- MENING: 26 spørsmål fra todo.md i fire faner (lyd, bilde, spill, historie), tre svar hver. Panelet (#testpanel, z-index 40) ligger over #panel og lukkes med Escape uten å lukke pausen under. Tastene i panelet stoppes, så friteksten ikke styrer spillet.
- Rapporten (Testmodus.tekst) er ren tekst på norsk som Tom kopierer og limer inn i samtalen. Lagres ved døden og utskrivningen i G.meta.testrapporter (de fem siste), og oppdateres når svarene endres etterpå. Data-fanen har «Kopier siste» og «Kopier alle». Kopieringen bruker navigator.clipboard og faller tilbake på å merke feltet og document.execCommand('copy').
- Feil i konsollen (error og unhandledrejection) tas vare på (de åtte siste) og kommer med i rapporten.

## Mobil (26.9.): grafikkminnet, mistet WebGL og layout
- Tom fikk «Noe gikk galt» på mobil fordi grafikkminnet vokste for hver etasje (rundt 12 MB per etasje med fiender). Tre lekkasjer er tettet: skyggekartet til månelyset (D3.riv kaster lysene med dispose), strekbåndene og materialene til dukkene (dukkeKast i 11_doll.js, brukt av Doll og Lagdukke), og teksturer og materialer til flekker, plakater og dører (Paint.owned i 12_paint.js). Grafikkminnet ligger nå flatt rundt 52 MB. Regel: alt som lages per etasje, må frigjøres i riv eller dispose; R.remove kobler bare løs.
- Målt ved å pakke inn WebGL-kallene (texImage2D, texStorage2D, renderbufferStorage, bufferData og sletting) og summere per etasje i en mobilprofil. renderer.info.memory er en grov, billig kontroll.
- Mistet WebGL (R.mistet og R.hentet i 04_render.js): pause, «Grafikken ble borte», three bygger opp igjen, og grafikken går ned et trinn (dprMax minus 0,5 og ett nivå ned i 3D). Har spilleren valgt fast kvalitet, står valget, og bare oppløsningen går ned (som i D3.maal). Åtte sekunder uten retur gir feilmeldingen. Mistes den mens siden er skjult (bytte av app), teller klokka først når siden synes igjen, og det blir ingen nedgradering. Selvtesten ved oppstart ser bort fra mistet kontekst.
- Layout: .screen sentrerer med auto-marger, så det som er høyere enn skjermen, kan rulles. passInn (32_meny.js) skalerer papirflater til plassen innenfor panelets marger, og ikke under 0,75 på berøringsskjerm. Liggende telefon (orientation:landscape og max-height:500px): HUD-en i hjørnene, kortene nederst, dødskortet og utskrivningen i to kolonner, butikken side om side. Stående: journalen med 430 brede sider (max-width:560px), smalt brev (.brev.smal, byttes ved rotasjon med refit), tipslappen under merket. Liggende ligger tipslappen i sonen mellom merket og knappene i toppen. Mer enn 20 hjerter blir «+fulle/skjulte», for eksempel +10/20. Auto-margene på .screen har !important, ellers vinner ID-regler som #title h1{ margin:0 } og tittelen havner øverst.
- Rulling: openPanel nullstiller rullingen for alle nye paneler, også når de åpnes fra et annet panel. Bare det samme panelet tegnet på nytt (samme klasse og id på det øverste elementet: butikken etter et kjøp, innstillingene etter et valg) beholder den. Paneler av samme slag som følger etter hverandre (samtalene, siste side, epilogen), nullstiller selv. Nullstillingen må skje etter at panelet vises. Knapper som får fokus når et panel åpnes, bruker focus({ preventScroll: true }).
- body har touch-action:none, men panelene med overflow:auto kan likevel rulles med fingeren (Blink slipper panorering til igjen for rullbare elementer). Synthesized scroll gesture i CDP virker ikke i testnettleseren; bruk Input.dispatchTouchEvent.
- Testmodus-panelet stopper alle taster mens det er åpent (skriving i feltene virker), så P og Escape ikke lukker pausen under.
- Telefongjenkjenningen (R.coarse i 04_render.js, 28.9. kveld): grov peker, eller berøringsskjerm (maxTouchPoints) i en mobil nettleser (Android, iPhone, iPad eller userAgentData.mobile). Chrome på Samsung med S Pen melder fin peker fordi pennen teller først, og da fikk Toms telefon (Adreno 750, dpr 3,75, trolig Galaxy S24 Ultra) hele PC-oppsettet og mistet WebGL. R.coarse styrer oppløsningen (høyst 1,5), middels som standard, 1024 i skyggekartet, ingen omgivelsesskygge, teksturstørrelsene, blekkvarslene og snøen. En PC med berøringsskjerm er ikke telefon. Testdel 65.
- Kommer mistet grafikk ikke tilbake på åtte sekunder (Chrome stenger ofte WebGL for siden da), lagres et trinn lettere (kvAuto, eller 3D av fra lav) etter at feilmeldingen er vist, og meldingen sier det. Feilmeldingen viser __glInfo: skjermkortet, telefon eller PC, 3D og kvalitet, og oppløsningen.
- «Error creating WebGL context» ved oppstart betyr at nettleseren ikke gir siden WebGL. Etter at skjermkortet har krasjet på en side, sperrer Chrome WebGL for domenet til Chrome startes helt på nytt (eller til man trykker på knappen i meldingen «WebGL hit a snag»). Et krasj koster altså spilleren en omstart av nettleseren. Spillet forklarer dette på norsk (boot i 30_game.js, testdel 65).
- Feilrapporten (Krasj i 30_game.js, 28.9.): R.mistet tar et øyeblikksbilde (Krasj.tilstand) og lagrer det i morbidium_krasj. «Kopier feilrapport» i feilmeldingen gir meldingen, grafikken i krasjøyeblikket, øyeblikksbildet, innstillingene og det lagrede løpet (morbidium_run_v1), så løpet kan lastes inn her og etasjen spilles av igjen. Toms Adreno 750 mistet grafikken også i trygg modus 28.9., kort tid etter at et lagret løp fortsatte, så årsaken er ikke kvaliteten eller etterbehandlingen. Etter at Chrome ble startet på nytt med 2bb63c9, virket spillet på telefonen igjen samme kveld. Hva som løste det, er ikke bevist: telefongjenkjenningen, at omgivelsesskyggen er av på telefon, eller at Chrome fikk starte helt på nytt etter krasjene.
- Målt grafikkminne 28.9. (telefonprofil 384 x 832, seks etasjer og to tilbake): 33 til 47 MB både før i dag, med veggprøven og med kameraprøven. Samme telefon med fin peker (PC-oppsettet): 68 til 82 MB. Måleren pakker inn texImage2D, texStorage2D, renderbufferStorage og bufferData som før.
- Testdel 36 i test_ekstra dekker dette, med en minnesjekk (renderer.info.memory over to runder med fire etasjer, og at skyggekartet til månen frigjøres direkte). Bygget fra før rettingene la igjen 16 teksturer og 67 geometrier per runde.

## Skygger, lys og diorama (26.9. kveld, spor A)
- Tom så at noen skygger står fast og andre følger spilleren. Tre skyggesystemer virker samtidig i 3D, og det er riktig fysikk: månen (retningslys med skyggekart, fast retning), lykta som pasienten bærer (flate plater som dreier bort fra lykta, 40_dybde.js) og flekken under hver figur. Det som var feil: månens skyggekart gled med kameraet uten å være låst til rutene sine, så kantene krøp. Nå låses det til hele ruter (D3.maneB i 15_rom3d.js). Retning og lengde er de samme.
- D3.tick, Dybde.tick og Glorie.tick går rett før R.render, etter at alt har flyttet seg, så lykteskyggene og lyset følger i samme bilde. Lykteskyggene går ikke gjennom vegger (egen vegg-sjekk, ikke solid(), som også teller møbler), stopper ved veggen bak figuren, blekner jevnt nær lykta og følger uAlpha og oppløsningen.
- Telefoner og TV får høyst 1024 i skyggekartet (D3.Q), og skyggekartet tegnes ikke på nytt mens spillet står i pause.
- Flekken under figurene står på gulvet når figuren hopper eller svever: hopp og sveving løfter plane, ikke root, og Doll.bakke setter flekkens størrelse og styrke (shadowA er .45 i 3D og 1 ellers, ganger oppløsningen). Kråka og koret svever nå synlig, og rotter og klumpunger hopper synlig. Før satte updateEnemy roten tilbake på gulvet hvert bilde.
- Figurene kaster måneskygge etter hele tegningen, også våpen og tillegg som kommer senere (D3.dukke lager skyggeplater for alt i plane). Halvt oppløste og gjennomsiktige figurer kaster ikke (D3.dukkeVis). Den åpne kista får riktig materiale, bakte skygger synes når «Lys og skygge» er av, og dekaler, plakater og dører er toon som gulvet.
- Lyspuljen (D3.fordel): lykta har det første punktlyset. De andre går til de nærmeste kildene, men en kilde beholder lyset så lenge den er blant de N+2 nærmeste og ingen er 1,5 nærmere. Lys blekner ut på 0,2 og inn på 0,25 sekunder. Bare ett lysglimt (userData.blink) får lys om gangen, svarte kilder får aldri. D3.FYLL_SIST (av) kan sette romlyset midt i rommet sist i køen.
- R.kilder tømmes for lysplatene fra forrige etasje når etasjen byttes (Paint.level), og materialene deres kastes.
- Værvakta i Vaer.start (17_romtyper.js) var havnet inni en kommentar, så klarvær, tåke og innendørs etasjer fikk hvite prikker og vindlyd. Rettet.
- Dioramaet (inspirert av Toms HD-2D-bilde): Glorie i 38_effekter.js lager glorier rundt lamper, lys, bål og ovner (GLORIE_KILDER), ett Points-objekt per etasje, høyst 32, 20 og 10 (høy, middels, lav og 2D), ingen under Enkel grafikk, R.lowTex eller uten lys. STYRKE 1,6 og UTEN_3D ,45. Tilt-shift (NIVA.tilt ,7 på høy og ,45 på middels, så også telefoner) har det skarpe båndet der pasienten står. Glød og tilt har ingen dybdebuffer og fire oppslag i nedskaleringen, og lysbufferen lrt lages ikke i 3D.

## Det store kartet (45_kart.js, 26.9. kveld, spor B)
- Trykk eller klikk på ringen med minikartet, M, eller pil høyre på håndkontrollen åpner hele etasjen som plantegning på papir. Pausemenyen har også «Kartet». Spillet står stille mens kartet er oppe (et vanlig panel). Lukkes med M, Esc, P, B, Start eller Lukk.
- Tegnes én gang når det åpnes: det malte gulvet skalert ned, bare der pasienten har vært (G.seen), rollefarger, blekkstrek, ikoner og en pil for pasienten. Lerretene frigjøres når kartet lukkes (closePanel har fått o.onClose). Ingen WebGL, så det virker likt i 2D, 3D og med Enkel grafikk.
- På PC er et klikk på ringen i kamp et slag, ikke kartet, og musa sendes videre til spillet. Ringen har ikke data-kart (journalen bytter ut alt med data-kart).
- Hemmelige rom synes ikke på kartene før veggen er slått inn (runde 5). Kartpillen, plantegningen og meiselen (visHeleKartet) gir bare en stiplet anelse (G.kartAnelse, «Noe er visket ut her»), og monokkelen tegner sprekken i rødt (G.sprekkKjent).

## Kontroller i menyene (MenyNav i 32_meny.js, 26.9. kveld, spor B)
- Hele spillet kan styres med bare en håndkontroll: pil eller venstre spak flytter mellom knappene (nærmeste i retningen), A trykker, B går tilbake, LB og RB blar i faner og sider, høyre spak ruller. Piltastene gjør det samme med tastatur og fjernkontroll. MenyNav.tick kalles fra løkka i alle tilstander unntatt play, også på døds- og utskrivningsskjermen.
- Nye paneler må ha knapper som MENY_SEL finner (button, input, [tabindex="0"]), og en [data-close] for B. Journalkortene velges med en syntetisk Enter.
- En A eller B som ble trykket i spillet de siste 450 ms, trykker ikke i et panel som dukker opp av seg selv (brevet, drømmen). B er også rull, så bare B-trykk i spillet teller.
- Input bruker den første tilkoblede kontrollen med standard oppsett, også når plass 0 er tom, og kontrollen skjuler berøringsknappene. Input.tast gir knappenavn etter enheten (kortene, pausen, journalen, flaska og apparatet).

## TV-modus (26.9. kveld, spor B)
- R.tv slås på av seg selv i nettleseren på TV-en (TV_UA), eller med Innstillinger, Spill, TV-modus (0 automatisk, 1 på, 2 av). body.tv gir marger mot kanten (4,5 prosent), større HUD (--ui minst 1,4), større menyer (passInn opptil 1,6) og ingen berøringsknapper. TV starter på middels kvalitet og får malte teksturer som telefoner.
- Tilbake på fjernkontrollen (keyCode 10009 og 461, GoBack, BrowserBack, XF86Back) virker som Esc. I TV-modus fanger TvTilbake også tilbake-steget i nettleserens historikk, og på tittelen går tilbake ut av spillet.
- Fullskjerm-knapp på tittelen og i pausen når nettleseren tillater det (Fullskjerm). En A på håndkontrollen regnes ikke alltid som et ekte trykk, så nettleseren kan si nei.
- Testrapporten sier om det er en Samsung-TV (Tizen og Chromium-versjon), hvilken kontroller som er funnet, om TV-modus er på og om spillet er i fullskjerm. Innstillinger, Styring viser om en kontroller er funnet.
- Samsung lover Gamepad API bare for installerte Tizen-apper, ikke for nettleseren på TV-en. Det må prøves på Toms TV. Veiledningen står i TV.md og i håndboka under Styring.


## Runde 5 (26.9. natt): kontrakten mellom sporene
Toms liste med fem skjermbilder (angrepsvarsler, snø, hårruller, skjulte rom, vegger og gulv fra ChatGPT, nye fiender), pluss stemplene oppå hverandre og blodet på skjermen. Gjøres i fire spor: A (varsler, lekkasje, partikler, nedslag), D (tekster og stempler, skjermblod, hårruller, snøfall), B (vegger og bakke fra ChatGPT, det skjulte rommet, vinter i teksturene) og C (nye fiender). Nye filer: 46_blekk.js (A), 47_sno.js (D), 48_skjult.js (B), 49_havet.js og 50_skinnlauget.js (C).
- `addTele(shape, o, dur, fire, owner)` tar disse valgfrie feltene, og gammel kode ser bort fra dem: `o.type` (skadetypen: fysisk, morb, strom, gass, vann, gift, ild, lys, papir, natur, lenke), `o.folg` (en figur som varselet følger i x og z) og `o.stille` (ingen automatisk nedslagseffekt).
- `R.kastTele(mesh, how, t)` erstatter `R.remove(t.mesh)` for varsler, med how `'fyr'`, `'avbryt'` eller `'rydd'`. Spor A lager den.
- `G.skjult` (Uint8Array eller null) og `gulvSynlig(i)` (global i 12_paint.js) kommer fra spor B. De andre sporene bruker dem ikke før flettingen.
- `e.dukket` er en fiende under vann som ikke kan treffes eller siktes på. Spor C gjør det generelt.
- Testdeler: A 44, 46, 48, 49; D 45, 47, 56, 57; B 50 til 55; C 58 til 63. Test 28 teller typene i GLOD_TYPER i stedet for å vente åtte.

## Kampbildet: varsler, nedslag, tekster og stempler (runde 5, spor A og D)
- Varsler kastes med R.kastTele(g, how, t), der how er 'fyr', 'avbryt' eller 'rydd'. Geometrien frigjøres, men ikke det som er merket userData.delt, og aldri teksturer. Materialene til de gamle varslene deles per farge (R.teleMat), og huggene bruker ringer fra R.geo og materialer fra potten slashFx.fri. Et materiale kastes ikke per angrep, for da lenkes shaderen på nytt hver gang. Nye angrep skal gå gjennom addTele, aldri R.remove alene. Før lekket hvert varsel 4 til 7 geometrier.
- Blekkvarsel (46_blekk.js): alle varsler tegnes av én instansiert blekkshader med 48 plasser (Blekk). Omrisset tegner seg inn, fyllet feier over, pulsen går fortere mot slutten, siste 0,12 s blinker det (lås), og etter at angrepet går av står et etterbilde i 0,18 s. Et avbrutt varsel løser seg opp i grått. Store angrep (radius 2,2 eller mer, eller sjef) får en ring av tegn og sprekker. Kvaliteten styrer lagene (lav: omriss, fyll og puls).
- Fargen følger skadetypen: o.type, så TELE_FARGE (alle fargene i color: 0x... i koden), så TELE_EIER, så fargetonen. Nye farger i color: må inn i TELE_FARGE, og test 46 sjekker det (unntatt 49_ og 50_, som setter o.type). o.folg lar varselet følge eieren. Den gamle tegningen (R.telegraph i 04_render.js) brukes med Enkel grafikk, uten instansiering, når shaderen ikke lenker, og når alle plassene er i bruk. Blekk.av = true tvinger den gamle.
- I 2D ganger lyset hele bildet, så varsler ved lamper og ved pasienten blir bleke, og låsen blir nesten hvit.
- Nedslag (46_blekk.js): når et varsel går av (ikke o.stille), sprutes blekkpartikler langs omrisset etter skadetypen (NED_TYPE), og strøm får korte lyn på kanten. Store angrep (radius 2,2 eller mer, eller sjef; ikke baner smalere enn 1,2) får merke i gulvet (12 plasser i én InstancedMesh, høyst 6,5 skritt: sprekk, svimerke, blekksøl, skrens), sjokkbølge og risting etter avstanden. Løp gir skrensemerker og støv bakover, tynne prosjektilbaner et blaff ved munningen. Partikler i vegger hoppes over. Tunge treff på pasienten (over 15 prosent av livet) fryser bildet 0,05 s med treffstjerna. Prosjektilene har skygge på gulvet. Lynet i regnværet har o.stille. Ingenting lages per nedslag, og ingenting av det med Enkel grafikk.
- Flytende tekster (FX i 04_render.js) legges ut hvert bilde fra mål tatt én gang og flyttes med transform. Ingen skal sette left eller top på .dmg eller .bubble. Viktigst først (krit og stempel, skade på pasienten, tall, info), eldre før nyere, og en tekst som ville dekke en annen, flyttes kortest mulig (helst opp). Samme ord på samme sted innen 0,4 s blir «ORD ×n», høyst tre krit- og stempelord lever samtidig, og perfekt unnvikelse fjerner «bom» fra samme unnvikelse.
- Store stempler går gjennom Stempel i 39_kombo.js (stampBig kaller Stempel.stor): hvert står minst 0,7 s, køen har høyst tre, like stempler hoppes over, det store legger seg under kombostempelet, og lappen (#toast) får .lav så lenge et stempel står, uten å legge seg over evnekortene. Liggende telefon har mindre stempler.
- Tester: del 18 bruker siden fra del 17, så de må kjøres sammen.

## Det skjulte rommet (48_skjult.js, runde 5, B2 og B4)
- Tom syntes det var for lett å se hvor det hemmelige rommet var (gangen bak sprekken var tegnet, opplyst og vist på kartet). Nå er det ikke der før man bryter seg inn.
- Generatoren merker gangen, sprekken og rommet i F.skjult (uten trekk fra rng, så etasjene er de samme). Paint.level bygger etasjen lukket: sprekken er vanlig vegg i foreldrerommets stil, og det skjulte gulvet ligger i Paint.mesh.gulvSkjult (skjult). Veggene som er ulike i lukket og åpen tilstand, ligger i egne deler (userData.del 'lukket', 'sprekk' og 'aapen', toppene i Paint.mesh.toppEkstra) innenfor en sone på to ruter. Paint.wallH og wallS er de lukkede kartene til innbruddet, Paint.aapen de åpne. Går delingen galt, bygges etasjen som før (try/catch).
- G.skjult er masken så lenge veggen står (null etterpå), og gulvSynlig(i) i 12_paint.js sier om gulvet synes. Alt som legger noe på gulvet eller veggen (hendelser, lyn, regnringer, dekaler, pytter, lik, takstøv), bruker den. Innholdet er gjemt (o.skjult, lys på 0, ingen glød), og tennene og pillen kommer ved innbruddet.
- Hintene ligger i lag: en flekk nyere puss med én hårstrek og litt pusstøv på gulvet (visne blader i hekken, kvist i krattet), trekk bak veggen innen fem ruter (egne sløyfer trekk_vind og trekk_tikk, stille i kamp), kalde drag (gløden trekk), et dumpt slag mot vanlige vegger (veggbank, høyst hvert 0,4 s, Spesial.bank i 13_rom.js), én boble per etasje og tipset sprekk første gang. Monokkelen gir en tydeligere flekk med lys og drag fra åtte ruter. Flekken er med vilje svak; styrken står i Skjult.flekk.
- Tomrom inne (B6): en veggfront som vender mot tomrom (ikke gulv, ingen vegg) tegnes som mur i toppfargen i toppmeshen, ikke med veggteksturen, så tomrom og det skjulte bak en sprekk ser like ut og ikke leses som mørke rom (Toms bilde 9). Ute beholder frontene teksturen. Gangene inne har små taklamper i 3D (D3.ganglamper, lysplater med userData.gang, ikke fyll), faste fra gang til gang og minst fem ruter fra hverandre.
- Innbruddet (Skjult.aapne) går i spilltid på 1,3 s: brist (sprekkvegg.png, bare inne), veggen synker under biter, byttet til det åpne, lysene og møblene kommer, rusk på terskelen og «Visste jeg det.». Ute blåser det blader i stedet for biter.

## Vinter i teksturene (runde 5, B3, og snøbildet fra Tom)
- Snøen på gulvet males i Paint.snoDekke som ett lag over uterutene. Finnes snøbildet fra ChatGPT (gulv_sno), legges det over hver uterute i verdenskoordinater med litt av bakken under, slik Tom laget det 27.9. Mangler det, maler koden snøen (Art.cel med blågrå skygge, sørpe i gangene, smeltet rundt bål, fonner mot veggene, glitter).
- Vegger mot snødekt ute får hvit topp (#dfe6ef) og sin egen tekstur (nøkkelen stil + '*') med et klumpete snøbånd, klumper på hekkene og istapper under paviljongen, tømmeret og glasset (Paint.snoKant). Bakken ute får snøbildet over gresset eller mosen. Paint.tema gir kaldere fargetone, og D3 har BUMP_SNO .45, hemi #4a5470 og litt mørkere gulv på snøetasjer, så lykta ikke brenner snøen hvit.

## Teksturer fra ChatGPT (runde 5, B1, og uteflatene fra Tom 27.9.)
- To slags flater i manifestet. Uteflatene Tom leverte 27.9. (UTE_FLATER i 17_romtyper.js: gulvene gress, grus, jord, mose, myr, is, sti, brostein og snø, veggene hekk, steinmur, skog og ruin) har tekstur: true, skaleres bare (ingen beskjæring eller bakgrunnsfjerning) og lagres som PNG. Gulvene tegnes rute for rute inn i det bakte gulvet i verdenskoordinater (uteBakkeBilde, 4 x 4 ruter per bilde), veggene er 2 enheter brede uten blekkstreker, og bakken ute bruker gress- eller mosebildet med snøen oppå. De bevares og bestilles ikke på nytt (UTEGRAFIKK.md).
- De andre flatene (B1) har flis i manifestet ('begge' for gulv, 'vannrett' for vegger, alfa for gjerdet), går gjennom behandle_tekstur (sømretting, advarsel om magenta og vignett) og lagres som WebP. Paint.bilde(key, F) gir bildet eller null (drømmene bare sikksakkgulvet og forhengene; panelveggen, sjakk- og plankegulvet har egne bilder for etasje 3, 4 og 6), og et bilde som ikke er pakket ut, byttes inn når det kommer. Veggene er 1,5 vegghøyde brede med blekkstreken oppe og nede. wallTex bruker Toms mål for hans flater.
- Gulvene inne (liste 12) bestilles først når gulvet tegnes med egne fliser (B5 i planen); i dag ville et gulvbilde blitt presset ned til 24 til 32 punkter per rute. Drømmegulvet har 24 punkter per rute på telefon og TV.
- Tegnelistene: 11 veggene (prøven er panel, fliser, mur, tapet og stein), 12 gulvene inne og 13 de nye fiendene. ART_BRIEF har runde 15 (uteflatene, levert), 16 (vegger og gulv inne) og 17 (havet under huset og Skinnlauget).

## Nye fiender (runde 5, spor C)
- Grunnarbeid: e.dukket gjelder alle fiender og sjefer (49_havet.js pakker inn hurt, nearestEnemy, groundEffects og enemySlip; meleeHit, skudd og Dybde.kastere hopper over dem). SJEF_DATA[t].egne lister trekk Journalen ikke låner (laanbareTrekk i 31_sjefpulje.js). Statusord (GREPET, SNØRT, SPENT FAST, HEKTET, DØPT) går gjennom statusOrd(e, ord, cd). Ribbon.end sender bare n*3 av tabellen til skjermkortet.
- Skinnlauget av 1887 (50_skinnlauget.js) er Avdeling Nulls høflige lærlaug: Lærlingen (bukker, reimslag, spenne), Klokkeren (bjella og kjettinger der pasienten står), Holdningssøsteren (snører pasienten treg med lærreimer som en rulle løser, tommestokk) og minisjefen Oldermann Nålepute (nålepute på issen, leser dagsorden i boblen og følger den med klubbeslag, årsmøte ved halv helse). Alle stans fra lauget deler én nedkjøling på to sekunder (G.laugStunT), og høyst ti kjettinger lever. Tonen: høflige lærentusiaster som elsker reimer, spenner og nagler og gjerne forteller om det, aldri noe seksuelt og ingenting fra filmene. Lauget skal ikke i ROLLER.
- Havet under huset (49_havet.js): Avløpsarmen (en tentakkel fra sluket med ett gult øye, dukker og kommer opp, feier, slår og griper, høyst tre levende), Kapellanen (knehøy kapellan med blekksprutkuppel og tentakkelskjegg over prestekragen, preker for kultistene, døper med sjøvann og kaller armer fra sluket) og Draugpleieren (druknet pleier fra 1887, froskehopp, bekken, leges i vann). tentakelLinje og tentakel er den delte tentakkelen.
- Kraken (49_havet.js) er en sjef i puljen: favn (en ring av armer fra vannet klemmer mot midten én etter én, gå ut mellom dem), blekk (en kjegle som legger blekkrøyk), dypdykk (under vann, boblene følger pasienten, kommer opp der og graver et nytt hull; egne, så Journalen låner det ikke), malstrøm (en sone som drar pasienten inn mens nebbet biter i midten; Journalen kan låne den) og dypkall (høyst fire armer). Et fast tjern er hullet dens. Armene i favn er en gjenbrukt samling på tolv (Kraken.armer) som kastes i clearFloor, og Kraken har 6000 punkter i strekbåndene.
- Rombias i 03_generator.js: Avløpsarmen i kjelleren, Kapellanen i likkapellet og Draugpleieren i tjernet (35 prosent, samme trekk fra rng som før).
- Oldermann Nålepute bruker ENEMIES[t].fraDybde, så Mini.onFloor ikke setter ham i Parken. Boblen med dagsorden er varselet hans, holdes inne på skjermen under HUD-en og synes også når snakkeboblene er av (en innpakning av FX.update i 50_skinnlauget.js).
- Figurene er tegnet i kode til nå. Bildene fra ChatGPT står i tegneliste 13.

## Snøfallet (47_sno.js, runde 5, C2)
- Tre Points-lag på skjermkortet med én shader: fjernt (0 til 2,5 høyt), midt (0 til 6, dette er Vaer.obj, så test 37 holder) og nært (på skjermen, 1,4 ganger parallakse, blekner rundt pasienten og i paviljonger). All bevegelse regnes i vertex-shaderen fra uTid, som følger spilltiden, så pause og frys stopper snøen.
- Boksen regnes ut fra R.camera hvert bilde (Sno.ramme i en innpakning av D3.tick), og fnuggene brettes med mod(), så stående telefon og kameraavstand 1,25 dekkes helt ut. Atlaset (myk klatt, klump med svak blekkant, krystall med seks armer i blekk, uskarp klatt) og den runde prikken lages én gang for hele spillet. Masken over uterommene lages per etasje og kastes i Vaer.stopp.
- Vind med retning fra frøet og kast hvert 8. til 20. sekund (opptil 2,5 ganger), og mengden går i bølger på 90 til 150 s. I 3D lyser lampene opp fnuggene (D3.pool), i 2D gjør lysbufferen det. Budsjettet følger kvaliteten (SNO_BUDSJETT); lav har to lag.
- Enkel grafikk har bare de gamle prikkene, nå runde og i en boks som følger kameraet. Lette teksturer har ikke snøfall.
- På snøetasjer har gasslyktene snø i lyset (GLOD_TYPER.lyssno) i stedet for møll, sirissene (amb_natt) tier, og vinden stiger i kastene.
- GLSL: bruk aldri smoothstep med kantene baklengs, skriv 1.0 - smoothstep(a, b, x).

## Kameraprøven og den nye etterbehandlingen (04_render.js), 2026-09-28
- Tom ønsket at vegger og gulv skal være 3D mot 2D-figurer og ting (slik det allerede var), en mer isometrisk vinkel og mer etterbehandling for bedre lys. Referansen hans var et høstlig isometrisk spill med og uten etterbehandling.
- Kameraet velges når spillet lastes og gjelder hele økta, fordi tegningene måles etter vinkelen. Tom ba om vinkelen som valg i innstillingene: Innstillinger, Bilde, Kameravinkel (settings.vinkel: 0 som før, 1 lav, 2 isometrisk). Velges en annen vinkel enn den som brukes, kommer en rad med «Last på nytt» (et løp i gang fortsetter fra starten av etasjen). Adressen går foran innstillingen: ?kamera=iso (dreining 45, helning 45), ?kamera=lav (dreining 0, helning 42), ?kamera=standard, og ?helning=N og ?dreining=N overstyrer tallene (25 til 80 og -80 til 80). Uten valg er alt som før (52 grader, ingen dreining). KAMERA_VALG (med kilde: adresse eller innstilling), VINKLER, CAM_PITCH, CAM_YAW og BILL_Y ligger øverst i 04_render.js, og KAMERA_VALG leser innstillingen rett fra lagringen fordi meta ikke er lastet ennå.
- KAM har hjelperne for dreiningen: sx og sz gir hvor mye en vannrett vektor peker mot høyre på skjermen og mot kameraet, vx og vz går andre veien. Alt som vender mot kameraet bruker dem: dukkene (plane.rotation.y), propSprite og Anim (gruppen dreies, flate ting får rotation.z), Lagdukke og Kraken-armene, blekkpartiklene, båndene i 38_effekter og 41_historie, kantlyset i 15_rom3d, prosjektilene i 05_world og 50_skinnlauget, og snøboksen i 47_sno. Visningen forfra, bakfra og fra siden regnes mot kameraet (setFacing trekker fra CAM_YAW). Styringen (tastatur, spak, berøring) dreies i Input.actions, så opp er opp på skjermen. Musa bruker strålen fra kameraet og trengte ingen endring.
- Veggene (12_paint.js): en vegg er lav når det er gulv på sida bort fra kameraet (BORT), ikke bare i raden nord for den. Med dreid kamera bygges også sideflaten som vender mot kameraet (quadS), med tomromsfront der det ikke er gulv. 15_rom3d.js gir sideveggene fotlist, brystlist og taklist.
- Minikartet dreies likt med kameraet, og N på kartringen flyttes dit nord er.
- Ny etterbehandling (standard i 3D, for alle kameravalg): dis (en bred, myk glød i en åttendedels oppløsning, lagt på som skjermblanding og som lys i mørket nær lyskilder) på høy og middels, omgivelsesskygge fra dybdeteksturen (bare høy, med symmetriske nabopar så flate gulv ikke blir mørke) og en mild tonekurve. NIVA i 15_rom3d.js har dis og ao per kvalitetsnivå. Enkel grafikk slår alt av. ?lys=gammel slår det nye av for sammenligning, og ?lys=ao viser bare omgivelsesskyggen.
- Kjente mangler i prøven: vegglamper, vinduer, pilastre, blod på veggene og sprekken til det skjulte rommet ligger bare på sørveggene. Mellomrom mellom rom kan gi en høy vegg som dekker litt av gulvet sørøst for den (ingen gjennomsiktige vegger ennå). Snøens parallakse i shaderen regner fortsatt med 52 grader. Tegningene av ting er laget sett rett forfra.
- tools/bilder_kamera.py tar sammenligningsbilder av samme sted med ulike valg (kamprom i etasje 2, kjelleren og parken). Testdel 64 i test_ekstra.py sjekker prøven og etterbehandlingen.
- Omgivelsesskyggen og dybdeteksturen er bare for PC: D3.Q setter ao til 0 på telefon og TV, også på høy (etter at Toms telefon mistet WebGL 28.9.). Disen og tonekurven er med på telefon.
- Alt dette kom på main 28.9. kveld fra patchen (Cowork-økta fikk ikke skrive til GitHub). Testdel 41 venter nå at håndkontrollen går fra Kameraavstand til Kameravinkel i fanen Bilde.

## Kroker (01_core.js, punkt 4, 28.9. kveld)
- Nye systemer kobler seg på spillets gang med navngitte kroker i stedet for å pakke inn funksjonene i hverandre (før var det 146 innpakninger). Kroker.foer(navn, fn, prio) kjører før kjernen, Kroker.etter(navn, fn, prio) etter, med svaret fra kjernen først: fn(svar, ...argumentene). Kroker.av(navn, fn) tar en krok bort. En feil i én krok logges med console.error og stopper verken de andre krokene eller kjernen.
- Kjernen heter <navn>Kjerne, og navnet kaller den med Kroker.kall(navn, <navn>Kjerne, this, arguments). Funksjonen settes aldri på nytt, så window-eksportene i boot og alle kallene ser den samme funksjonen hele tiden.
- Rekkefølgen er den samme som innpakningene ga, så ombyggingen ikke endret oppførselen: før-krokene kjører sist lagt til først (som det ytterste laget), etter-krokene først lagt til først, begge i rekkefølgen filene står i build.py. Avhenger en krok av en annen, gi den prio (lavere kjører først, og prio går foran rekkefølgen), så den ikke lenger avhenger av plassen i bygget.
- Funksjoner med kroker (fil med kjernen): startFloor, clearFloor, decorateLevel (30_game), spawnBoss, bossDie, enemyDie, playerDie (20_actors), spawnProps, updateTele, updateProjectiles (05_world) og updateZones (26_fiender). Rekkefølgen i dag: clearFloor før: Kraken, kjettingene, dybden, gløden, drømmen, hendelsene, været; etter: Blekk, Nedslag. startFloor før: Vaatt, Kombo; etter: hendelsene, drømmen, historien, testmodus. spawnProps etter: lysene (17), gløden (38), det skjulte rommet (48, må komme sist).
- Våpnene fra andre filer ligger i VAAPEN_TEGNING[id] = (g, id) => tegning (10_art.js), som drawWeapon slår opp først. 13 våpen: stempelboss, skjemabunke, gasskolbe, klump, tang, knippe, hagesaks, storsaks, avgud, reim, bjelle, tommestokk og klubbe.
- Igjen som innpakninger (etter antall): spawnEnemy (5, endrer typen og svaret, og har et øyeblikksbilde spawnEnemyBare i 28_oppskrift), hurt (4, rekkefølgen betyr noe: vakta for fiender under vann i 49 må ligge ytterst, og 34 setter e.hpFor før døden), charPart (3, tabeller der den ytterste vinner), enemySlip (3), hurtPlayer (3), Sound.play (3), og de med ett eller to lag. Testdel 66 sjekker at ingen fil setter de omgjorte funksjonene på nytt, og rekkefølgen på krokene.

## Testklokka og testdelene (30_game.js, tools/testdeler/, punkt 5, 28.9. kveld)
- Løkka er delt i `loop` (skjermen) og `steg(dt, o)` (ett steg i spillet). Den vanlige løkka tar ett steg per skjermbilde, som før.
- `Klokke.frys(o)` stopper spillet: løkka tegner bare det som er (`R.render(0)`), og ingenting flytter seg eller trekker tilfeldige tall. `frys({ frø })` gir spillets `Math.random` en fast tallrekke (mulberry32), `frys({ stille: true })` setter lyden til null, og oppstartsmerket settes med en gang (ellers står `#boot`, og neste lasting starter i gjenopprettingsmodus). `Klokke.slipp()` gir alt tilbake.
- `Klokke.spol(sek, o)` kjører steg på 1/60 sekund til spilltida har gått `sek` fram, stopper når spillet går ut av 'play' (død, meny, dialog) eller når `o.til()` blir sann, og gir `{ tid, steg, tilstand, stoppet }`. `Klokke.til(f, sek)` er det samme med vilkår. Det virker også uten `frys`, som en rask spoling.
- I spolte steg hoppes lyden, musikken, testmodusen og den automatiske kvaliteten over (de følger vanlig tid eller lydklokka), og HUD, kart og bilde tegnes ikke. Det som ellers klinger av når bildet tegnes (blod og rødt på skjermen, blink, sjokkbølger, zoom), går i `R.fxTick(dt)` (`postFx` i 04_render.js), så det klinger av i spilltid også der. Etter spolingen tegnes HUD og kart én gang.
- Spillets egen Math (øverst i 01_core.js): hele spillet trekker tall gjennom den, mens Three.js bruker nettleserens. Three.js trekker tall til id-ene når den lager objekter, og bare første gang noe lages, så med én felles rekke ble to like kamper ulike. `SpillMath` og `Klokke.trekk()` er til testene. Tester som setter nettleserens `Math.random`, styrer fortsatt spillet når testklokka ikke gjør det.
- Det testklokka ikke styrer: setTimeout (luken 1,4 sekunder etter en sjef, bølgene i et kamprom, utbruddet i det forbannede rommet og noen få andre), performance.now (siktet etter musa i 1,2 sekunder, menyene) og lydklokka. Tidtakere som varer mellom etasjene, må nullstilles i etasjen (dryppet fra taket og øynene i veggene gjør det nå i `Blod.tom`), ellers blir to like etasjer ulike.
- Samme frø, samme spilltid (`G.time`, mye regner fra den) og samme etasje gir nøyaktig samme kamp to ganger (testdel 67).
- `FAST` i `tools/testdeler/felles.py` settes foran koden i en evaluate: `fastEtasje(d, krav, min, steder, godta)` søker opp det første løpsfrøet der etasje d har et rektangulært kamprom som passer (og der stedene testen bruker, er frie), bygger etasjen med testklokka frosset, uten drøm, lik og hendelser, og tar bort farene (teslaspoler, gnistrende lamper, pytter). Pasienten står midt i rommet, der kamprommene har fem ganger fem ruter uten møbler. `plass(r, x, z)` gir et sted bare når det er fritt og i rommet. Del 59 og 60 bruker dette og tar 80 og 60 sekunder (før flere minutter, og de feilet av og til).
- `tools/test_ekstra.py` er en kjører: delene ligger i `tools/testdeler/<system>.py` (tolv filer), og hver del åpner og lukker sine egne sider. En del som krasjer eller går over fristen (`--frist`, 1800 sekunder), regnes som feilet uten å stoppe resten, og sidene den lot stå, lukkes. `-j N` starter N arbeidere med hver sin nettleser og fordeler delene etter lengde.

## Kodesjekken (tools/sjekk_kode.js, punkt 7, 28.9. kveld)
- I stedet for ES-moduler og Vite nå: alle filene i `src/` deler ett skop i bygget, og det er det moduler ville passet på. Sjekken leser koden med acorn (`tools/vendor/acorn.js`, så den virker uten nett) og finner det samme uten å endre verktøyene.
- Den fanger: en fil som bruker en const, let eller class fra en senere fil (eller lenger ned i samme fil) mens den lastes (toppnivået, funksjoner og metoder som kalles derfra, og tilbakekall til forEach, map og liknende); navn som er deklarert to ganger; ukjente navn (alt som ikke er deklarert i en fil, i skriptet i 00_head.html, lagt inn av build.py, lagt på window eller kjent fra nettleseren, lista `KJENT`); og innpakninger (en toppnivåfunksjon eller en metode på et toppnivåobjekt som settes på nytt), med et tak.
- Den ble prøvd med feil satt inn med vilje (en konstant fra en senere fil, en skrivefeil i et navn, et dobbelt navn og en ny innpakning), og fant alle. Egenskaper med skrivefeil (G.playre) finner den ikke; det krever typer.
- Veien til moduler senere: når innpakningene er gjort om til kroker (taket er 0), kan filene bli moduler med import og export, fordi ingen fil lenger setter en annens funksjoner på nytt. Da kan Vite eller esbuild bygge, og build.py kan gjøre resten (bildene, lydene og de to utgavene). Før det ville moduler brutt alle de 92 innpakningene som er igjen.

