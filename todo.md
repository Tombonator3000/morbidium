# Morbidium: gjøremål

## Kameraprøve og etterbehandling (28.9.)
Tom ønsket 3D-vegger og gulv mot 2D-figurer, en mer isometrisk vinkel og mer etterbehandling for bedre lys.
- [x] ?kamera=iso (dreid 45 grader) og ?kamera=lav (helning 42), med styring, dukker, ting, partikler, sidevegger, lave vegger mot kameraet, minikart og N som følger dreiningen.
- [x] Ny etterbehandling i 3D: dis, omgivelsesskygge (høy) og tonekurve. ?lys=gammel for sammenligning.
- [x] Testdel 64 og tools/bilder_kamera.py. Bilder i dokumentasjon/kamera/.
- [x] Kameravinkel som valg under Innstillinger, Bilde (som før, lav, isometrisk), med «Last på nytt» når en annen vinkel er valgt. Adressen går foran.
- [x] Lagt inn på main 28.9. kveld fra patchen, oppå veggprøven, og testdel 41 rettet for den nye spaken.
- [ ] Tom: prøv isometrisk og lav (Innstillinger, Bilde, Kameravinkel) på PC og telefon, og si hvilken vinkel som skal bli standard (eller prøv egne tall i adressen med ?helning=40&dreining=30).
- [ ] Tom: er disen og omgivelsesskyggen passe, for mye eller for lite? Styrken står i NIVA i 15_rom3d.js (dis, ao).
- [ ] Claude, når vinkelen er valgt: vegglamper, vinduer, pilastre, blod og sprekken også på sideveggene, gjennomsiktige vegger der en høy vegg dekker pasienten, snøens parallakse etter vinkelen, og eventuelt tegninger av ting sett på skrå.

## Toms liste, runde 5 (26. og 27.9.)
Tom sendte fem skjermbilder og ba om: (1) flottere effekter når fiender angriper, (2) snø som ser bedre ut, (3) hårruller som sitter på hodet, (4) skjulte rom som skjules bedre, (5) svar på om ChatGPT skal lage vegger og gulv, (6) flere fiender: Cthulhu og tentakelmonstre, og en Hellraiser-parodi med lærentusiaster. Skjermbildene viste også stempler oppå hverandre («IKKBONKG») og blod på skjermen som rant i rette streker.
- [x] Angrepsvarslene tegnes i blekk (Blekkvarsel): omrisset tegner seg inn, fyllet feier over, låsen blinker, etterbildet står igjen, store angrep får tegn og sprekker, og fargen følger skadetypen. Varslene følger fienden der treffet gjør det. Lekkasjen i grafikkminnet fra varsler og hugg er tettet.
- [x] Blekkpartikler (dråper, gnister, papirbiter og støv) i stedet for svarte klosser, og nedslag med merker i gulvet, sjokkbølge, risting, skrensemerker og skygger under det som kastes.
- [x] Tekstene og stemplene legger seg ikke oppå hverandre («IKKBONKG» er borte).
- [x] Blodet på glasset renner som blod: buktende, smalner, perler seg og tørker ovenfra.
- [x] Hårrullene og annen pynt sitter på hodet i alle retninger og på alle tegningene. Kontrollene fra GRAFIKKLEVERANSE.md: hjortens kropp løftet over beina, frisyrene og ansiktstilbehøret til personalet rettet, trillepasienten, speilpasienten, hjertene og rammene var i orden.
- [x] Snøfallet i tre lag med ekte fnugg, vind og kast, lys fra lampene og snø i lyktelyset.
- [x] Snøen på bakken: snøbildet Tom leverte 27.9. over uteområdet, hvite topper, snøbånd og istapper på veggene, snø på bakken utenfor og kaldere lys. Uten bildet maler koden snøen selv.
- [x] Det skjulte rommet finnes ikke før man bryter seg inn: gangen og rommet er ikke tegnet, opplyst eller vist på kartet, og sprekken er vanlig vegg med en svak flekk ny puss. Hint i lag (trekk, kalde drag, dumpt slag mot vanlige vegger, én boble, tipset første gang, monokkelen) og et innbrudd med brist, støv, lys og møbler som kommer fram.
- [x] Svaret på om ChatGPT skal lage vegger og gulv: ja for veggene nå, gulvene inne først når gulvet tegnes med egne fliser. Uteflatene Tom leverte 27.9. er i spillet. Teksturløpet tar imot resten (tegneliste 11 og 12).
- [x] Nye fiender: Skinnlauget av 1887 (Lærlingen, Klokkeren, Holdningssøsteren og minisjefen Oldermann Nålepute), havet under huset (Avløpsarmen, Kapellanen og Draugpleieren) og sjefen Kraken. Tegnet i kode, med tegneliste 13 til ChatGPT.
- [x] Tomrom inne ser ikke lenger ut som mørke rom (murfronter i stedet for panel og puss), og gangene har små taklamper i 3D.
- [x] Flettet til main i PR #12 den 28.9.
- [x] ChatGPT: veggprøven med panel, fliser, mur, tapet og stein, samt hele liste 13, levert 28.9. 53 nye manifestbilder, 611 av 636 i alt. Se dokumentasjon/grafikk-2026-09-28/LEVERANSE.md.
- [ ] Claude og Tom: vurder de fem veggprøvene på PC og mobil før de ni øvrige veggene bestilles. Liste 12 med 16 gulv venter fortsatt på egne gulvfliser.
- [ ] Tom: prøv de nye fiendene. Skinnlauget fra etasje 3 (Oldermannen som minisjef fra etasje 2), havet fra etasje 3. Er bukket og bjella tydelige varsler, kan dagsorden leses i farten på telefon, og er tonen riktig?
- [ ] Tom: er flekken ved sprekken for svak på telefon? Styrken står i Skjult.flekk i 48_skjult.js.
- [ ] Claude, senere: håndboka rekker under skjermkanten på liggende telefon (844 x 390) på alle sider (fantes før runde 5).
- [ ] Claude, senere: gulvene inne med egne fliser (B5 i planen), så liste 12 kan bestilles. Biter (Particles) også når hekken eller krattet slås inn ute; de ble svarte før blekkpartiklene kom, og nå har de farge.
- [ ] Tom: er varslene passe sterke og tydelige? Se bildene 46_varsel_* og 49_nedslag_*. Styrken kan justeres i Blekk.
- [ ] Tom: er det nok snø på telefonen, eller skal det være mer? Mengden står i SNO_BUDSJETT i 47_sno.js.
- [ ] Claude, senere: i 2D med lys blir varsler ved lamper og ved pasienten bleke, og strømgnister og lyn synes dårlig på lyse gulv. Kan løses ved å tegne varslene etter lysgangingen.
- [ ] Claude, senere: resten av A7 (halvmåne-shader på huggene, stråler som bånd, fartsstrek på prosjektiler, ANIM-oppføringer så ChatGPT kan levere ark), starBurst som bruker materialet om igjen, og større marger i partikkelarket hvis nabotegningen synes rundt små partikler på telefon.
- [ ] Claude, senere: eyeliner fra siden stikker foran ansiktet (tegningen har to øyne), og liket av menn i morgenkåpe viser ikke pynten.
- [ ] Claude, senere: blodet på glasset kan tørke mot brunrødt i den ledige blå kanalen, og snø på hoder og ting, fotspor, knirkende fottrinn og frost på glasset (C9 i planen).
- [ ] Claude, senere: flere eldre testdeler venter i sanntid (wait_for_timeout før en sjekk på skade eller tid). De bør vente på G.time. Morbidium-sjekken i del 28 er rettet (testpytten får kort liv og testen venter til pytten og gløden er borte).
- [ ] Claude, senere: del 59 (Lærlingen på etasje 3) og del 60 (kall fra dypet) feilet én gang i samlekjøringen 28.9. og var grønne ved neste kjøring. Begge avhenger av hvor fiendene havner i etasjen. Bør få faste plasser.
## Utegrafikk 2026-09-27
- [x] Finne grafikk som den gamle manifestkontrollen overså: gran og uteflater.
- [x] Lage og koble inn 14 nye PNG-er til hage, Nattskogen og snødekke.
- [x] Rette utvelgelsen som sorterte bort graner i parken ved dekorgrensen.
- [x] Registrere landskapsdekor og teksturer, og oppdatere kunstbrief og tegnelister. 558 av 558 manifestbilder levert.
- [x] Kontrollere innlasting, reservetegninger, 3D, enkel grafikk og gjennomspilling. Se UTEGRAFIKK.md.

## Grafikkleveranse 2026-09-26
- [x] Alle bestillingene i de ti tegnelistene levert. 544 av 544 manifestbilder, ingen manglende delark.
- [x] Claude: kontroller Den hvite hjortens kropp mot hals og animerte bein i spillet. Gjort i runde 5: kroppen lå for lavt og er løftet .8 når bildet finnes. De andre kontrollene (trillepasienten, speilpasienten, hjerter og rammer, hatter, hår og ansiktstilbehør) er også gjort, se runde 5 over.

## Venter på Tom
- [ ] Spille prototypen og si hva som føles feil i utseende og kamp.
- [ ] Bekrefte egenskapsnavnene fra journalskissen.
- [ ] Bekrefte regelen om at kort i eget hjerneområde får bonus.
- [x] Si om han vil levere egne PNG-er for hoder og kropper (SPRITES i 10_art.js tar dem inn med samme festepunkt). Levert 2026-09-26, se GRAFIKKLEVERANSE.md.
- [ ] Slette grenen claude/funny-newton-cgnzav på GitHub (Claude Code får ikke lov til det). Alt på den finnes i main.

## Forslag til neste steg (Claude, 2026-09-26 morgen, etter lydrunden)
Lista har nå 19 åpne spørsmål til Tom (lyd, blod, mørke, vanskelighet, historien, sjefene), og ingen av dem kan besvares uten å spille. Flaskehalsen er tilbakemelding fra ekte spilling på ekte maskiner, ikke flere systemer. Neste steg bør gjøre det lett å gi den.
- [x] Claude (gjort 26.9. morgen): testmodus med bilder i sekundet, kvalitetsnivå og minne i et hjørne, og en rapport etter hvert løp som kan kopieres med én knapp (tid per etasje, skade tatt og fra hva, dødsårsak, kuriositeter og kort, lengste kombo, valgene i drømmene, laveste bilder i sekundet, hvor lang tid lydene brukte på å pakkes ut).
- [x] Claude (gjort 26.9. morgen): «Si din mening» i pausemenyen, der spørsmålene fra denne lista er knapper (for lite, passe, for mye) pluss et felt for fritekst, og svarene havner i samme rapport. Da blir de 19 spørsmålene et par minutter etter et løp.
- [ ] Tom: spille tre eller fire løp på PC og mobil, gjerne med hodetelefoner, og lime inn rapportene. Slik: åpne https://tombonator3000.github.io/morbidium/?testmodus (eller slå på Testmodus under Innstillinger, Spill). Svar på spørsmålene under «Si din mening» i pausen når du har lyst. Når pasienten dør eller blir skrevet ut: trykk «Testrapport», så «Kopier rapporten», og lim den inn i samtalen med Claude. Glemmer du det, ligger de fem siste rapportene under Innstillinger, Data.
- [ ] Claude: justere ut fra rapportene: lydmiksen, mengden blod på skjermen, vanskelighetskurven gjennom seks etasjer, lengden på et løp og ytelsen på mobil.
- [ ] Claude, små ting som kan tas når som helst: koble inn de seks lydene som er hentet, men ikke brukt (bokslag når journalen lukkes, dørsmell når rommet låses, gulvknirk, radiosus i radiohendelsen, riving ved overkill, sluk på badet), og en fast testklokke så nettlesertestene ikke avhenger av hvor rask maskinen er.
- [x] Tom og ChatGPT, i denne rekkefølgen: liste 10 (historien, fire bestillinger), liste 5 og 1 (fiendene i parken og første etasje), hjertene og ringene i liste 4. Levert 2026-09-26, se GRAFIKKLEVERANSE.md.
- [ ] Senere: kapittel i Pasienthåndboka med journalsidene man har lest, og andre halvdel av UI-settet.

## Grafikk, kart, skygger og TV, 2026-09-26 kveld
Tom sendte et bilde av et HD-2D-spill og ba om å undersøke bedre grafikk med 2D og 3D sammen, et stort kart når minikartet trykkes på, en sjekk av skyggene (noen står fast og andre følger spilleren) og mulighet for å spille på Samsung-TV med kontroller.
- [x] Skyggene: undersøkt av to agenter hver for seg. Faste måneskygger og lykteskygger som dreier med spilleren er riktig (to lyskilder). Rettet: måneskyggene krøp (nå låst til skyggekartet), lykteskyggene lå ett bilde etter og gikk gjennom vegger, flekkene løftet seg med figurer som hopper og svever, døende og gjennomsiktige figurer kastet full skygge, våpen og tillegg manglet skygge, den åpne kista, og mer.
- [x] Lampene blinker ikke lenger av og på rundt pasienten (lyspuljen), og værvakta som havnet i en kommentar er rettet (hvite prikker og vindlyd på feil etasjer).
- [x] Diorama-lys: glorier rundt lamper, lys, bål og ovner, tilt-shift også på middels (telefon) med det skarpe båndet der pasienten står, og billigere glød.
- [x] Det store kartet: trykk på minikartet, M, pil høyre på kontrolleren, eller Kartet i pausen.
- [x] Hele spillet kan styres med håndkontroll, også menyene. TV-modus med marger, større tekst, tilbaketasten og fullskjerm. Veiledning i TV.md og i håndboka under Styring.
- [ ] Tom: prøv på Samsung-TV-en. Åpne appen Internett på TV-en, gå til tombonator3000.github.io/morbidium/?testmodus, trykk en knapp på kontrolleren og se under Innstillinger, Styring om den er funnet. Lim inn testrapporten. Virker det ikke, er PC med HDMI eller Cast fra Chrome veien (TV.md).
- [ ] Tom: velg lysretning. Bildene (A som nå, B med månen fra samme kant som de malte skyggene og et svakt fyllys forfra) ble sendt i samtalen 26.9. kveld (lysretning, ark.png). B gjør at alle skyggene peker samme vei, men endrer stemningen.
- [ ] Tom: skal romlyset midt i rommet komme sist i køen for punktlysene (D3.FYLL_SIST)? Da får lampene mer eget lys, men sjefsrommene mister det oransje skjæret. Bildene ble sendt i samtalen (fyll_ark.jpg).
- [ ] Tom: er gloriene og tilt-shiften passe sterke? Før og etter ble sendt i samtalen (for_etter_pc.jpg og for_etter_mobil.jpg). Styrken står i Glorie.STYRKE og NIVA.tilt.
- [ ] Tom: figurene kaster nå måneskygge etter hele tegningen, som tegningen er ment. Det koster noen ekstra tegnekall per figur på telefon. Si fra om det hakker på mobilen (testmodus viser bilder i sekundet).
- [ ] Tom: kråka og koret svever nå synlig, og små fiender hopper. Før holdt en feil dem på gulvet. Si om det ser riktig ut.
- [x] Tom: skal hemmelige rom skjules på kartene til de er funnet? Gjort i runde 5: de synes ikke før veggen er slått inn, men kartpillen og plantegningen gir en stiplet anelse.
- [ ] Tom: skal «Enkel grafikk» også slå av regn, snø og ildfluer, og skal «Lys og skygge» av også slå av glød og tilt-shift? I dag gjør de ikke det.
- [ ] Claude, senere: gloriene tegnes som punkter, og en glorie forsvinner brått når midten går ut av skjermkanten. Kan løses med små flater i stedet for punkter.
- [ ] Claude, senere: i TV-modus laster tilbake på tittelen spillet én gang til rett etter at siden er lastet på nytt (nettleseren lar ikke siden fange et steg fra før omlastingen).
- [ ] Claude, senere: dukkene og tingene som ikke er i G.props (lik, sprekker, ting i hendelser) i 3D, billige lyspøler for lamper uten punktlys, glød fra malte flammer, og en egen Tizen-app bare hvis nettleseren på TV-en ikke slipper kontrolleren inn.

## Mobil, 2026-09-26 formiddag (Tom: «Noe gikk galt», WebGL mistet)
- [x] Tre lekkasjer i grafikkminnet tettet (skyggekartet, strekbåndene til dukkene, flekker, plakater og dører). Minnet ligger flatt i stedet for å vokse rundt 12 MB per etasje.
- [x] Mistet WebGL gir pause og kommer tilbake med lettere grafikk i stedet for «Noe gikk galt». Bytte av app gir ingen feilmelding og ingen nedgradering.
- [x] Menyene får plass eller kan rulles med fingeren, liggende og stående. HUD-en i hjørnene liggende, dødskortet og utskrivningen i to kolonner, butikken side om side, større journal og brev stående, høyst 20 hjerter.
- [ ] Tom: spill på samme telefon igjen, gjerne med https://tombonator3000.github.io/morbidium/?testmodus, både stående og liggende. Si fra om noe fortsatt er for smått, kuttet av eller vanskelig å treffe med fingeren. Rapporten viser telefonen, skjermkortet og om grafikken ble mistet underveis.
- [ ] Tom: hvilken telefon og nettleser var det? Det avgjør om startkvaliteten på mobil bør settes lavere.
- [ ] Claude, hvis grafikken fortsatt mistes: starte på lav 3D-kvalitet på berøringsskjerm, mindre skyggekart, og pakke ut stemningslydene først når de trengs.
- [x] Claude: en test som følger grafikkminnet over etasjeskifter (testdel 36), så nye lekkasjer blir oppdaget. Den fanger lekkasjene fra før rettingen med god margin.
- [x] Gjennomgang av hele endringen før fletting, med skeptikere per funn. 14 funn rettet (blant annet tittelen som havnet øverst på PC, rulling mellom paneler og fast kvalitet ved mistet grafikk).

## Lyd, musikk og vått på skjermen, 2026-09-26 morgen
- [x] 165 frie lyder (CC0): 102 effekter og stemningslyder fra Freesound og 63 instrumenttoner fra VCSL, med verktøy (tools/lag_lyd.py) og kildeliste (assets/lyd/KILDER.md).
- [x] Lydbanken (42_lyd.js): opptakene i stedet for synthlydene der de finnes, fottrinn etter gulvet, stemningssløyfer per etasje, rom og vær, knitring fra bål, havet i drømmene og stemmer fra fiendene. Innstillingen «Innspilte lyder».
- [x] Musikken som et lite iMUSE (06_musikk.js): bytte på taktstreken med bro, besetning etter rommet, kamplaget på slaget, innslag i tonearten, stemte plinger, roen som glir over i stemning, dronen stemt etter musikken. Rettet: drømmemusikken ble byttet ut etter første bilde.
- [x] Blod og vann som treffer skjermen og renner nedover (43_vaatt.js), med brytning, farge gjennom blodet og glans i etterbehandlingen. Innstillingen «Blod og vann på skjermen».
- [ ] Tom: spill med lyd på (gjerne hodetelefoner) og si hva som er for høyt eller lavt: slagene, fottrinnene, stemningen, fiendene som stønner, musikken mot lydene. Alt kan justeres i LYD_KART, FOTGULV og STEMNING_* i src/42_lyd.js.
- [ ] Tom: si om overgangene i musikken føles myke nok, og om besetningene passer rommene (orgel i kapellet, piano i spisesalen, vibrafon på badet, saksofon i Venterommet).
- [ ] Tom: si om det blir for mye blod på skjermen i lange kamper, og om vannet i regnet synes godt nok.
- [ ] Claude, når Tom har spilt: finjustere styrken på lydene og instrumentene etter det han hører. Det er målt, men ikke lyttet på (skyen har ikke høyttalere).
- [ ] Senere: kor som opptak (i dag er koret synth), en egen lyd for Avdeling Null i musikken (bjella og kjettingene på slaget), fottrinn for de store fiendene, og en egen stemning for sjefslaget.
- [ ] Senere: sjekke minnet på en svak mobil (lydbanken bruker rundt 30 MB når alt er pakket ut). Hvis det blir trangt: pakke ut stemningen og instrumentene først når de trengs.

## 3D, historien og grafikklista, 2026-09-26 natt
- [x] Mer 3D i den skrå ovenfra-visningen (40_dybde.js): lykteskygger, kontaktskygger, takstøv, kameradykk, varmeflimmer, lys i vannet og i tåka.
- [x] En bedre historie (41_historie.js): journalside før hver drøm, forstanderen i Dypet, sjefenes andre tale, slengord og siste ord, personlige linjer i høyttaleren og koret, Olsens nøkkelhistorie, siste side, innkallingsbrev ved gjentakelse, seks nye fragmenter og fire merknader.
- [x] Grafikklista: runde 14 i ART_BRIEF.md og liste 10 i tegnelister/ for de ti nye historiebildene, og en side med alle arkene og kopieringsknapper (Artifact «Tegnelister»).
- [x] Historien skrevet om etter Toms ønske: Hellraiser møter Twin Peaks, med Lovecraft-stemning og 1920-tallet. Havet under huset og pasient nr. 0, Avdeling Null med bjelle og kroker, Venterommet, instrumentskrinet, forstanderen sydd fast til stolen, kjettinger som effekt, ni fragmenter.
- [ ] Tom: les journalsidene, forstanderen, Venterommet og skrinet og si om tonen treffer, og om det er for mye eller for lite. Tekstene står i src/41_historie.js.
- [x] Tom og ChatGPT: bildene til historien (liste 10) er nå fire bestillinger: arket med sidene og sluttene, forstanderen, Venterommet og skrinet. Levert 2026-09-26, se GRAFIKKLEVERANSE.md.
- [ ] Senere: la kjettingene dukke opp andre steder også (Krok, Journalens død), og en egen lyd for Avdeling Null i musikken.
- [x] Tom og ChatGPT: liste 10 (Historien) er fire bestillinger og gjør mest for historien. Levert 2026-09-26, se GRAFIKKLEVERANSE.md.
- [ ] Tom: si om lykteskyggene og takstøvet er passe mye, og om kameradykket blir for mye på mobil.
- [ ] Senere: et kapittel om historien i Pasienthåndboka (journalsidene man har lest, G.run.journalsider).

## Tegnelister, effekter og kombo, 2026-09-25 natt
- [x] Tegnelister for alt som mangler bilde: tools/lag_tegnelister.py skriver tegnelister/ med ni lister (én ChatGPT-samtale hver), 59 ark og bilder for de 245 som mangler, og 11 delark til oppskriftssystemet. Referansebilder av dagens kodetegninger i samme rutenett som malen.
- [x] Tom og ChatGPT: tegne arkene i tegnelister/, liste 1 først (liste 10, historien, kan tas når som helst). Kjør tools/lag_tegnelister.py etter levering, så krymper listene. Levert 2026-09-26, se GRAFIKKLEVERANSE.md.
- [x] Flettet inn i main som PR #3 og publisert på GitHub Pages.
- [x] Flere effekter og shadere (38_effekter.js og 04_render.js): sjokkbølger, zoomslag, negativ, lynblink, brennende skjermkant, drømmeslør, gnister, røyk, damp, sporer, Morbidium og møll på skjermkortet, lyn i regnværet, teslaspolens buer og regnringer.
- [x] Kombo langt over toppen (39_kombo.js): treffkjede med åtte nivåer, flerdrap opp til pandemi, overkill, miljødrap, perfekt unnvikelse, tredje slag, kortkjede, sjefdrap, fanfarer for synergier og forvandlinger, kunngjørerstemme og trist trombone. Lydmotoren har fått kirkeklang, vibrato, forvrengning, filtersveip og en kompressor.
- [ ] Tom: spille og si om kombolyden er passe mye over toppen. Kunngjøreren og fanfarene kan slås av under Lyd.
- [ ] Tom: si om lynet i regnværet er for farlig, for sjeldent eller for ofte.
- [x] Musikken går over i sjefslaget (messing, pauker og raskere tempo) når treffkjeden passerer 35.
- [ ] Senere: egne ChatGPT-bilder til kombostempelet.

## Utvidelsen (UTVIDELSE.md), fra 2026-09-25 kveld
- [x] Idédugnad og designdokument. Tom valgte seks etasjer der to er ute, korte drømmebaner og grov, kroppslig humor.
- [x] Trinn 1: seks etasjer (Parken og Nattskogen ute), dybdeskala, gulv og vegger per romtype, L-rom og rotunder, 19 nye romtyper, bakke, trær og vær ute, utgangene per etasje, lyd og musikk for uteetasjene.
- [x] Trinn 2: hendelsene. Samtalepanel med valg, atten hendelser (fire flere enn planlagt, så seks etasjer har nok), minne på tvers av løp.
- [ ] Tom: prøve hendelsene og si hvilke som er morsomme og hvilke som bør skrives om. Tekstene står i src/35_hendelser.js.
- [x] Trinn 3: pasienthistoriene og drømmebanene mellom etasjene, slutten og arkivet.
- [ ] Tom: gå gjennom en hel runde med drømmer og si om tekstene treffer, og om skyggen er for treg eller for rask.
- [ ] Senere: et kapittel om drømmene i Pasienthåndboka. Bildene for minnene, figurene uten ansikt og det røde rommet er levert 2026-09-26.
- [x] Trinn 4: nye fiender og sjefer for Parken og Nattskogen (gartnere, kråker, Huldra, Vedkubbemannen, Nøkken, kålhoder, Overgartner Ansgar Hekk, Den hvite hjorten).
- [ ] Tom: slåss mot Overgartneren og hjorten og si om de er for lette eller for tunge.
- [x] Trinn 5: nye nøkler i manifestet (171 nye, 532 i alt) og fire nye runder i ART_BRIEF.md for ChatGPT (runde 10 til 13: møblene og uteområdene, hendelsene, drømmene, de nye fiendene og sjefene).
- [x] Tom: bestille bildene til utvidelsen. De står som ferdige ark i tegnelister/ (liste 5 til 8), med prompt og referansebilde. Levert 2026-09-26, se GRAFIKKLEVERANSE.md.
- [ ] Tom: prøve de nye etasjene og si om parken og skogen er mørke nok, og om løpet blir for langt.

## Økta 2026-09-25 (3D, grafikk, blod, nye fiender, sjefer, håndbok og HUD)
- [x] 3D som standard med automatisk kvalitet (høy, middels, lav, av) og valg under Bilde.
- [x] Bedre lys og shadere: kantlys fra lampene, lysstråler fra vinduene, lyskjegler, flimring, tåke, mørke som kommer og går, tilt-shift, kalde skygger og varme høylys, filmriper.
- [x] Blod og skrekk: sprut på vegger og gulv, drypp, kjøttbiter, fotspor, blod på skjermen, årer ved lite helse, øyne i veggene.
- [x] System for animering av 2D-ting (spriteark eller tegnede ruter) og positurer for dukkene.
- [x] ChatGPTs fiender: Kasteren, Trillepasienten, Speilpasienten, klumpunger, Hviskekoret (minisjef) og Den Store Klumpen (sjef). I tillegg minisjefene Tannlegen og Den hodeløse portieren.
- [x] Tilfeldige sjefer per løp og minisjefer i risikorommet.
- [x] Fiendeindeks med bilder i Pasienthåndboka (kapittel 9 og 10).
- [x] HUD etter ChatGPTs skisse, og UI-settet (runde 9) som tas i bruk av seg selv når bildene kommer.
- [x] Forslag til ChatGPT som grafikkleverandør for HUD og menyer: del G, H og I i DESIGN_BRIEF.md.
- [x] Flette grenen claude/practical-babbage-nc80bu inn i main (PR #2, flettet 25.9. om kvelden).
- [ ] Tom: spille med 3D på mobil og PC og si om den automatiske kvaliteten treffer, og om blodet er passe mye.
- [x] ChatGPT: runde 7, 8 og 9 i ART_BRIEF.md. Står nå som ferdige ark i tegnelister/ (liste 1 til 4). Levert 2026-09-26, se GRAFIKKLEVERANSE.md.
- [x] Kasteren-pakken levert 2026-09-26 som seks navngitte hode- og kroppsdeler, anim_kasteklump.png og anim_kastesprut.png, gjenbrukt fra den tidligere prøven.
- [ ] Claude, når Tom vil: UI-settet fase 2 (ui_bok, ui_fane, ui_stempel, ui_merke, ui_stang, ui_flaske).
- [ ] Balanse for de nye fiendene, minisjefene og Klumpen etter spilltesting.

## Toms tilbakemelding 2026-09-24 (åtte punkter)
- [x] 8: sjefer ble usynlige (feil i slag-angrepet).
- [x] 6: fiender som ikke dør (personale uten disk, hallusinasjoner som ble stående, vern mot ugyldig helse).
- [x] 7: lik ligger der pasienten døde, synlige, flere per etasje.
- [x] 1: journalen uten rulling.
- [x] 2: tjenesterom med egne rekvisitter, hovedrekvisitten alltid på plass.
- [x] 3: varierte pasienter (kjønn, hår, hud, fem plagg, sko og pynt; kvinnefiguren fra ChatGPT er tatt i bruk).
- [x] 4: bruksanvisning (Pasienthåndboka) og innstillinger med faner (lyd i tre kanaler, kamera, risting, skjermtekst, skadetall, bobler, navneskilt, styring, data).
- [x] 5: arkivet som arkivskap med mapper, fragmenter og årsrapport; ny tittelmeny og pause. Resten av UI-et (tjenester, dødskort, HUD) kan få samme behandling i etappe 9.

## Kjente svakheter
- [ ] Claude-appen på Android viser ingen publiserte sider (hvit skjerm), heller ikke en enkel testside. Meldt inn av Tom. Spill i Chrome inntil videre.
- [ ] Ytelse er ikke målt på ekte maskinvare. Testmaskinen har bare programvaregrafikk.
- [ ] Balanse (skade, priser, antall fiender) er grovt satt og ikke spilltestet.

## Neste (plan for et ferdig spill, 2026-09-24)
- [x] Legge de 13 evnekortene fra ChatGPT i gpt-grafikk/ med den første duen som kort_due.png.
- [x] Etappe 1: testoppsett, lagring og fortsettelse, berøring på mobil, journalplasser, fiender rundt møbler.
- [x] Etappe 2: etasjen Kjelleren: Isolat og arkiv med Overarkivar Gunhild Paragraf, og signaturangrep for alle sjefer.
- [x] Etappe 3: fem nye fiender (tvangstrøye, byråkrat, narkoselege, arkivrotter, øyeblomst).
- [x] Etappe 4: spesialrom (hemmelig rom bak sprukken vegg, forbannet rom med bakhold, blodofferrom med tre handler).
- [x] Etappe 5: apparater (ti aktive gjenstander som lades ved romrydding) og lommerusk (tolv små gjenstander med én plass).
- [ ] Balansere kuriositetene etter spilltesting; noen kombinasjoner blir trolig altfor sterke.
- [x] Etappe 6: oppskriftssystemet setter sammen fiender av deler (rolle, hode, hatt, tilbehør, kropp, farging, størrelse, mestere med navn). Personaldelene fra ChatGPT skaleres riktig.
- [x] Varierte pasienter, Pasienthåndboka, innstillinger med faner, nytt arkiv, ny tittelmeny og pause (Toms punkt 3, 4 og 5).
- [x] Prøve på 3D-rom med 2D-figurer (vegglamper, måneskygger, glød, lavpoly-møbler). Av som standard, slås på i innstillingene eller med #3d.
- [x] Tom har bestemt retning for 3D: figurer og ting forblir 2D, bare rom, gulv og effekter i 3D. Lavpoly-møblene er fjernet; lister, pilastre, relieff i gulvet og støv i lyset er lagt til.
- [x] Tom ba 25.9. om at 3D blir standard. Gjort, med automatisk kvalitet som går ned og til slutt slår 3D av når bildet hakker.
- [x] Strekarmer og strekbein som i Conan Chop Chop (standard), med valg for de gamle tykke lemmene.
- [ ] Tom: si om strekarmene skal være enda tynnere eller ha en annen farge (STREK i 11_doll.js).
- [x] Bilder av 40 kuriositeter, åtte piller og et tomt preparatglass fra ChatGPT i gpt-grafikk/.
- [x] Spillerens figurark fra ChatGPT i gpt-grafikk/.
- [x] To nye spillerfigurvarianter, kvinne og mann, med grovere ansikter. Standardfiguren og personalansiktene er også tegnet om.
- [x] Claude: Registrere spillerfigurvariantene i manifestet og ta dem i bruk (kvinnefiguren er med, mannsarket var en kopi av standardfiguren).
- [x] Tre delark fra ChatGPT for personale: hoder, hatter og uniformer.
- [x] Fire sko og fem småobjekter fra ChatGPT: hjerte, Morbidiumdråpe, gulltann, due og eterflaske.
- [x] De siste ni bildene for plukk og effekter fra ChatGPT: kamfer, levertran, luktesalt, tre støvpuff, skyggehånd, stempelmerke og treffstjerne.
- [x] De sju våpenbildene fra ChatGPT i ett ark.
- [x] Første gruppe rekvisitter og møbler fra ChatGPT: alter, tre disker, benk, bord og stol forfra og bakfra.
- [x] Resten av de 51 rekvisittene og møblene i kunstlisten. Alle ligger nå i gpt-grafikk/.
- [x] Alle 54 figurdelene i kunstlisten, inkludert personale, sjefer, kultist, småfiender og spillerens døde ansikt.
- [x] De ni ekstra ansiktstilbehørene, slimskuddet og kortplukk. Hele den gjeldende kunstlisten har bilder.
- [x] Alle bildene i den gjeldende kunstlisten er laget etter DESIGN_BRIEF.md og ligger i gpt-grafikk/.
- [x] ChatGPT: ni pasientplagg som enkeltbilder i tre retninger, sju pyntbilder, bare føtter og ullsokk i gpt-grafikk/.
- [x] Claude: Behold pasientens valgte fargevarianter når de nye PNG-bildene for klær og pynt brukes (gjort i 73b702a).
- [x] Etappe 7: musikk (seks stykker i lag som følger kampen) og stemningslyder.
- [x] Etappe 8: merknader som låser opp kuriositeter og oppvåkningssteder, utskrivningsbrev, gjeninnleggelse, tre diagnoser og sju fragmenter.
- [x] Spor etter tidligere pasienter (rablinger med kritt signert med navn fra arkivet).
- [x] Etappe 9: rablinger fra tidligere pasienter, byggeanimasjon, tips for nye spillere, ubrukt kode fjernet, manifest og kunstliste oppdatert, merknader på døds- og utskrivningskortet.
- [ ] Balanse etter Toms spilltesting (skade, helse, priser, hvor ofte mestere dukker opp, hvor vanskelig gjeninnleggelse er).
- [x] Byggeanimasjon når pasienten nærmer seg et rom (idé fra threejs-architecture-effects).
- [x] Rydde bort ubrukt kode (ICONS, STATS, R.basic). Mappa old/ finnes ikke lenger.
- [x] Utvide tools/lag_manifest.py og ART_BRIEF.md med alt det nye. ART_BRIEF viser nå hva som er levert (150 av 287).
- [x] ChatGPT: de siste 20 figurbildene i ART_BRIEF.md: Overarkivaren, byråkrat, narkoselege, pasient i tvangstrøye, arkivrotte, øyeblomst, Journalen og to nye visninger av slukyngelen. Kunstlisten er komplett med 287 av 287 bilder.
