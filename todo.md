# Morbidium: gjøremål

## Toms sju punkter (28.9. kveld)
Tom ba om slankere dokumenter, lettere repo og tester i CI, bilder og lyd ut av HTML-fila, kroker i stedet for innpakking, testklokke og ryddigere tester, fiender som data og byggeklosser, og moduler. Alt er gjort i første omgang; se log.md 28.9. Det som gjenstår:
- [x] Tom 29.9.: ja, originalbildene (447 MB) skal ut av git-historikken. Gjort samme morgen: originalene ligger på grenen arkiv/originaler (commit 578f6f2), og main og arbeidsgrenen er skrevet om uten dem.
- [ ] Tom: slett grenen claude/practical-babbage-nc80bu på GitHub (Claude Code får ikke lov). Den har originalene i historikken, så en vanlig klone blir stor så lenge den finnes, og den har ikke noe som mangler på main (loggoppføringen står i logg/2026-09.md). Har du en klone av repoet på maskinen, hent det på nytt (eller `git fetch` og `git reset --hard origin/main`), fordi historikken er ny.
- [ ] Claude, senere: de 45 innpakningene av metoder (`node tools/sjekk_kode.js --liste`), Sound.play (3) først. Der må alle tre bli `rundt`, fordi 42_lyd ikke kaller synthen når et opptak spilles, og plasket i 43_vaatt skal komme likevel. Metoden får kroker slik: `play(...a) { return Kroker.kall('Sound.play', Sound.spill, this, a); }`. Senk TAK.
- [ ] Claude, med neste fiendebølge: nye fiender med Fiende.ny og byggeklossene, flere klosser (sirkel der målet står, kjegle, storm, tilkalling med tak, preken med avbrudd), og de gamle typene over én fil om gangen med tools/fiende_fasit.py som vakt.
- [ ] Claude, senere: flere testdeler over på testklokka (del 9, 11, 25, 61 og 62 er gjort 29.9.), og spilltid for setTimeout som påvirker spillet (bølgene i kamprommene, luken etter en sjef, gaven etter instrumentskrinet), så de også kan spoles. Med tre nettlesere samtidig feiler fortsatt noen få deler som venter i vanlig tid eller måler noe som avhenger av bildefrekvensen (sist 33, 45, 46 og 49); de er grønne alene. Del 33 følger lydklokka.
- [ ] Claude, før ES-moduler: de 175 navnene tidligere filer bruker fra senere filer (`node tools/sjekk_kode.js --moduler`) må gå gjennom kroker, et register eller flyttes, ellers bestemmer sirklene i importene rekkefølgen filene kjøres i. Så esbuild eller Vite (se «Kodesjekken» i systemer.md).

## Kameraprøve og etterbehandling (28.9.)
Tom ønsket 3D-vegger og gulv mot 2D-figurer, en mer isometrisk vinkel og mer etterbehandling for bedre lys.
- [ ] Claude, hvis telefonen krasjer igjen: be om «Kopier feilrapport» og et skjermbilde av «Log Messages» i chrome://gpu, last inn løpet her og spill av etasjen. Hvorfor Adreno 750 også krasjet i trygg modus 28.9., er ikke funnet. Chrome sperrer WebGL for siden etter hvert krasj, så hvert forsøk koster Tom en omstart av nettleseren.
- [ ] Tom: prøv isometrisk og lav (Innstillinger, Bilde, Kameravinkel) på PC og telefon, og si hvilken vinkel som skal bli standard (eller prøv egne tall i adressen med ?helning=40&dreining=30).
- [ ] Tom: er disen og omgivelsesskyggen passe, for mye eller for lite? Styrken står i NIVA i 15_rom3d.js (dis, ao).
- [ ] Claude, når vinkelen er valgt: vegglamper, vinduer, pilastre, blod og sprekken også på sideveggene, gjennomsiktige vegger der en høy vegg dekker pasienten, snøens parallakse etter vinkelen, og eventuelt tegninger av ting sett på skrå.

## Toms liste, runde 5 (26. og 27.9.)
Tom sendte fem skjermbilder og ba om: (1) flottere effekter når fiender angriper, (2) snø som ser bedre ut, (3) hårruller som sitter på hodet, (4) skjulte rom som skjules bedre, (5) svar på om ChatGPT skal lage vegger og gulv, (6) flere fiender: Cthulhu og tentakelmonstre, og en Hellraiser-parodi med lærentusiaster. Skjermbildene viste også stempler oppå hverandre («IKKBONKG») og blod på skjermen som rant i rette streker.
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

## Venter på Tom
- [ ] Spille prototypen og si hva som føles feil i utseende og kamp.
- [ ] Bekrefte egenskapsnavnene fra journalskissen.
- [ ] Bekrefte regelen om at kort i eget hjerneområde får bonus.
- [ ] Slette grenen claude/funny-newton-cgnzav på GitHub (Claude Code får ikke lov til det). Alt på den finnes i main.

## Forslag til neste steg (Claude, 2026-09-26 morgen, etter lydrunden)
Lista har nå 19 åpne spørsmål til Tom (lyd, blod, mørke, vanskelighet, historien, sjefene), og ingen av dem kan besvares uten å spille. Flaskehalsen er tilbakemelding fra ekte spilling på ekte maskiner, ikke flere systemer. Neste steg bør gjøre det lett å gi den.
- [ ] Tom: spille tre eller fire løp på PC og mobil, gjerne med hodetelefoner, og lime inn rapportene. Slik: åpne https://tombonator3000.github.io/morbidium/?testmodus (eller slå på Testmodus under Innstillinger, Spill). Svar på spørsmålene under «Si din mening» i pausen når du har lyst. Når pasienten dør eller blir skrevet ut: trykk «Testrapport», så «Kopier rapporten», og lim den inn i samtalen med Claude. Glemmer du det, ligger de fem siste rapportene under Innstillinger, Data.
- [ ] Claude: justere ut fra rapportene: lydmiksen, mengden blod på skjermen, vanskelighetskurven gjennom seks etasjer, lengden på et løp og ytelsen på mobil.
- [ ] Claude, små ting som kan tas når som helst: koble inn de seks lydene som er hentet, men ikke brukt (bokslag når journalen lukkes, dørsmell når rommet låses, gulvknirk, radiosus i radiohendelsen, riving ved overkill, sluk på badet), og (gjort 28.9.) en fast testklokke så nettlesertestene ikke avhenger av hvor rask maskinen er.
- [ ] Senere: kapittel i Pasienthåndboka med journalsidene man har lest, og andre halvdel av UI-settet.

## Grafikk, kart, skygger og TV, 2026-09-26 kveld
Tom sendte et bilde av et HD-2D-spill og ba om å undersøke bedre grafikk med 2D og 3D sammen, et stort kart når minikartet trykkes på, en sjekk av skyggene (noen står fast og andre følger spilleren) og mulighet for å spille på Samsung-TV med kontroller.
- [ ] Tom: prøv på Samsung-TV-en. Åpne appen Internett på TV-en, gå til tombonator3000.github.io/morbidium/?testmodus, trykk en knapp på kontrolleren og se under Innstillinger, Styring om den er funnet. Lim inn testrapporten. Virker det ikke, er PC med HDMI eller Cast fra Chrome veien (TV.md).
- [ ] Tom: velg lysretning. Bildene (A som nå, B med månen fra samme kant som de malte skyggene og et svakt fyllys forfra) ble sendt i samtalen 26.9. kveld (lysretning, ark.png). B gjør at alle skyggene peker samme vei, men endrer stemningen.
- [ ] Tom: skal romlyset midt i rommet komme sist i køen for punktlysene (D3.FYLL_SIST)? Da får lampene mer eget lys, men sjefsrommene mister det oransje skjæret. Bildene ble sendt i samtalen (fyll_ark.jpg).
- [ ] Tom: er gloriene og tilt-shiften passe sterke? Før og etter ble sendt i samtalen (for_etter_pc.jpg og for_etter_mobil.jpg). Styrken står i Glorie.STYRKE og NIVA.tilt.
- [ ] Tom: figurene kaster nå måneskygge etter hele tegningen, som tegningen er ment. Det koster noen ekstra tegnekall per figur på telefon. Si fra om det hakker på mobilen (testmodus viser bilder i sekundet).
- [ ] Tom: kråka og koret svever nå synlig, og små fiender hopper. Før holdt en feil dem på gulvet. Si om det ser riktig ut.
- [ ] Tom: skal «Enkel grafikk» også slå av regn, snø og ildfluer, og skal «Lys og skygge» av også slå av glød og tilt-shift? I dag gjør de ikke det.
- [ ] Claude, senere: gloriene tegnes som punkter, og en glorie forsvinner brått når midten går ut av skjermkanten. Kan løses med små flater i stedet for punkter.
- [ ] Claude, senere: i TV-modus laster tilbake på tittelen spillet én gang til rett etter at siden er lastet på nytt (nettleseren lar ikke siden fange et steg fra før omlastingen).
- [ ] Claude, senere: dukkene og tingene som ikke er i G.props (lik, sprekker, ting i hendelser) i 3D, billige lyspøler for lamper uten punktlys, glød fra malte flammer, og en egen Tizen-app bare hvis nettleseren på TV-en ikke slipper kontrolleren inn.

## Mobil, 2026-09-26 formiddag (Tom: «Noe gikk galt», WebGL mistet)
- [ ] Tom: spill på samme telefon igjen, gjerne med https://tombonator3000.github.io/morbidium/?testmodus, både stående og liggende. Si fra om noe fortsatt er for smått, kuttet av eller vanskelig å treffe med fingeren. Rapporten viser telefonen, skjermkortet og om grafikken ble mistet underveis.
- [ ] Tom: hvilken telefon og nettleser var det? Det avgjør om startkvaliteten på mobil bør settes lavere.
- [ ] Claude, hvis grafikken fortsatt mistes: starte på lav 3D-kvalitet på berøringsskjerm, mindre skyggekart, og pakke ut stemningslydene først når de trengs.

## Lyd, musikk og vått på skjermen, 2026-09-26 morgen
- [ ] Tom: spill med lyd på (gjerne hodetelefoner) og si hva som er for høyt eller lavt: slagene, fottrinnene, stemningen, fiendene som stønner, musikken mot lydene. Alt kan justeres i LYD_KART, FOTGULV og STEMNING_* i src/42_lyd.js.
- [ ] Tom: si om overgangene i musikken føles myke nok, og om besetningene passer rommene (orgel i kapellet, piano i spisesalen, vibrafon på badet, saksofon i Venterommet).
- [ ] Tom: si om det blir for mye blod på skjermen i lange kamper, og om vannet i regnet synes godt nok.
- [ ] Claude, når Tom har spilt: finjustere styrken på lydene og instrumentene etter det han hører. Det er målt, men ikke lyttet på (skyen har ikke høyttalere).
- [ ] Senere: kor som opptak (i dag er koret synth), en egen lyd for Avdeling Null i musikken (bjella og kjettingene på slaget), fottrinn for de store fiendene, og en egen stemning for sjefslaget.
- [ ] Senere: sjekke minnet på en svak mobil (lydbanken bruker rundt 30 MB når alt er pakket ut). Hvis det blir trangt: pakke ut stemningen og instrumentene først når de trengs.

## 3D, historien og grafikklista, 2026-09-26 natt
- [ ] Tom: les journalsidene, forstanderen, Venterommet og skrinet og si om tonen treffer, og om det er for mye eller for lite. Tekstene står i src/41_historie.js.
- [ ] Senere: la kjettingene dukke opp andre steder også (Krok, Journalens død), og en egen lyd for Avdeling Null i musikken.
- [ ] Tom: si om lykteskyggene og takstøvet er passe mye, og om kameradykket blir for mye på mobil.
- [ ] Senere: et kapittel om historien i Pasienthåndboka (journalsidene man har lest, G.run.journalsider).

## Tegnelister, effekter og kombo, 2026-09-25 natt
- [ ] Tom: spille og si om kombolyden er passe mye over toppen. Kunngjøreren og fanfarene kan slås av under Lyd.
- [ ] Tom: si om lynet i regnværet er for farlig, for sjeldent eller for ofte.
- [ ] Senere: egne ChatGPT-bilder til kombostempelet.

## Utvidelsen (UTVIDELSE.md), fra 2026-09-25 kveld
- [ ] Tom: prøve hendelsene og si hvilke som er morsomme og hvilke som bør skrives om. Tekstene står i src/35_hendelser.js.
- [ ] Tom: gå gjennom en hel runde med drømmer og si om tekstene treffer, og om skyggen er for treg eller for rask.
- [ ] Senere: et kapittel om drømmene i Pasienthåndboka. Bildene for minnene, figurene uten ansikt og det røde rommet er levert 2026-09-26.
- [ ] Tom: slåss mot Overgartneren og hjorten og si om de er for lette eller for tunge.
- [ ] Tom: prøve de nye etasjene og si om parken og skogen er mørke nok, og om løpet blir for langt.

## Økta 2026-09-25 (3D, grafikk, blod, nye fiender, sjefer, håndbok og HUD)
- [ ] Tom: spille med 3D på mobil og PC og si om den automatiske kvaliteten treffer, og om blodet er passe mye.
- [ ] Claude, når Tom vil: UI-settet fase 2 (ui_bok, ui_fane, ui_stempel, ui_merke, ui_stang, ui_flaske).
- [ ] Balanse for de nye fiendene, minisjefene og Klumpen etter spilltesting.

## Kjente svakheter
- [ ] Claude-appen på Android viser ingen publiserte sider (hvit skjerm), heller ikke en enkel testside. Meldt inn av Tom. Spill i Chrome inntil videre.
- [ ] Ytelse er ikke målt på ekte maskinvare. Testmaskinen har bare programvaregrafikk.
- [ ] Balanse (skade, priser, antall fiender) er grovt satt og ikke spilltestet.

## Neste (plan for et ferdig spill, 2026-09-24)
- [ ] Balansere kuriositetene etter spilltesting; noen kombinasjoner blir trolig altfor sterke.
- [ ] Tom: si om strekarmene skal være enda tynnere eller ha en annen farge (STREK i 11_doll.js).
- [ ] Balanse etter Toms spilltesting (skade, helse, priser, hvor ofte mestere dukker opp, hvor vanskelig gjeninnleggelse er).
