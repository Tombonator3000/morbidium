# Grafikkleveranse til Morbidium

Bestillingen er kontrollert mot [Claude-artifacten «Tegnelister»](https://claude.ai/artifact/CwTKtxx3rN65Es4PKpTPrW) 26. september 2026. Alle 74 bestillinger i de ti listene er dekket. De 257 manglende manifestbildene og 11 delarkene ligger i `gpt-grafikk/`, til sammen 268 nye PNG-filer. Delarkene gir 97 synlige nye deler.

Produksjonen startet fra `193fa384183be2e25c02807397ef441a61d9e322`. Leveransen er lagt oppå `1bc8561b720ba6e5d05900bf32978f2a82828f91`, som inneholder de nye mobilrettingene. Manifest, tegnebestillinger og bildeverktøy var identiske mellom disse revisjonene. De 311 tidligere PNG-kildefilene, som dekker de 287 tidligere manifestbildene, er kontrollert uendret med SHA-256.

`grafikkleveranse.csv` knytter hver bestilling i Claude-artifacten til de faktiske filene. Figurark og samleark er levert ferdig delt. Filnavnet på et opprinnelig ark kan derfor mangle selv om alle bildedelene er levert. Avkryssingene i artifacten lagres bare i nettleseren og er ikke leveransestatus i GitHub.

## Ta inn bildene

1. Bildene følger denne endringen i `gpt-grafikk/`. GitHub Actions bruker dem automatisk ved push til main.
2. Kjør `python3 tools/skjaer_ark.py`, `python3 tools/behandle_bilder.py` og `python3 build.py` i denne rekkefølgen.
3. Kjør `python3 tools/lag_tegnelister.py` for å oppdatere lista ut fra de faktiske bildene.

Figurark og samleark er allerede delt i navngitte enkeltbilder. Originalarkene er bevart i den lokale produksjonsmappa `deliverables/morbidium-manglende-grafikk/originals/`. Ikke legg dem inn i den aktive innboksen igjen, siden de da vil bli klippet med en annen radgrense. Delarkene til oppskriftssystemet leveres derimot som ark med repoets vanlige navn og maler.

Ikke erstatt repoets `assets/deler/deler.json` med leveransens fil. Den i leveransen inneholder bare de nye delene. Klippeverktøyet slår dem sammen med de eksisterende 27 delene.

## Animasjon og gjenbruk

- Kasterens seks hode- og kroppsdeler er hentet fra den tidligere prøven. De to effektradene er hentet fra det tidligere kastearket, fire ruter i hver.
- Figurene bruker spillets eksisterende papirdukker: separate hoder og kropper forfra, bakfra og fra høyre side. Armer og bein følger det eksisterende systemet.
- Drømmefigurene deler identiske kroppsbilder og bakhoder mellom variantene med og uten ansikt. Bare hodet forfra og fra siden skifter.
- Klærne i de løse delarkene bruker nøytrale grå tekstiler der spillet skal fargelegge dem.

## Konkret kontroll i spillet

Den hvite hjorten trenger kontroll av plasseringen når PNG-ene tas inn. I `src/37_utefiender.js` ligger den tegnede reservekroppen omtrent 0,85 til 1,7 enheter over bakken, og beina starter på 0,95. `hjort_kropp` har samtidig `ay: 0.1` i manifestet, og den generelle bildebehandlingen setter bunnen av nye kroppsbilder nær dette festepunktet. Det kan plassere den nye kroppen for lavt i forhold til beina. Kontroller kropp, hals og bein samlet, og juster bildeplasseringen i verktøyet som lager manifestet hvis dette vises i spillet. Bildets innhold er rettet til hvit kropp uten ekstra gevir, bein eller sår.

Prøv også trillepasientens hjul og stativ, speilpasientens ramme, hjerter og UI-rammer i aktuell spillstørrelse. Kontroller at løse hatter, hår og ansiktstilbehør sitter på hodene i alle tre retninger. Filkontroll og vellykket bygg er dokumentert separat fra en faktisk spilltest.

## Verifisering ved levering

- PASS: alle 74 bestillinger er koblet til filer som finnes.
- PASS: alle 268 nye kildefiler er kontrollert mot den ferdige lokale leveransen med SHA-256.
- PASS: lokal klipping, bildebehandling og bygg på gjeldende spillkode. 544 behandlede manifestbilder, 0 feil; bygget inneholder 544 bilder, 124 synlige løse deler og 165 lyder.
- PASS: de genererte tegnelistene viser 544 av 544 levert, 0 manglende bilder og 0 manglende delark.
- UVERIFISERT: samlet visuell spilltest av alle figurene, delene og skjermstørrelsene. Hjortens plassering er den konkrete kontrollen ovenfor.

Leveransen består av grafikk og oppdatert dokumentasjon. Beskrivelsen her og koblingstabellen er overleveringen til Claude.
