/* ============================================================
   DRØMMENE  -  pasientens historie (UTVIDELSE.md, trinn 3)
   Hver pasient får et liv før innleggelsen, trukket fra frøet: et hjem, en person,
   en hendelse, en skyld og et tegn som går igjen. Hver gang pasienten prøver å
   rømme (utgangen etter sjefen i etasje 1 til 5), faller hen inn i en kort drøm før
   neste etasje. Fem kapitler: Hjemme, Personen, Dagen det skjedde, Det du gjorde og
   Det som er sant. Valgene bestemmer slutten ved utskrivningen, og historien skrives
   i pasientmappa i arkivet.
   Drømmen er en egen liten etasje (G.drom) som bygges og tegnes med de vanlige
   systemene, uten fiender. Løpet lagres med neste etasje før drømmen starter, så en
   lukket fane spiller drømmen på nytt (G.run.dromVent).
   ============================================================ */

/* ---------- historien: hjemmet, personen, hendelsen, skylden og tegnet ---------- */
// rom: [navn, gulv, vegg, ute, ting]
const DROM_HJEM = {
  lofoten: { tekst: 'et fiskevær i Lofoten', fra: 'Lofoten', hendelser: ['forlis', 'taake', 'spanske', 'brann'], lukt: 'tørrfisk og tjære', vann: 'havna', brannsted: 'rorbua', taakeLyd: 'en båtmotor som stopper, og så ingenting',
    rom: [['Kjøkkenet', 'tre', 'tre', 0, ['vedovn', 'table', 'chair', 'shelf']], ['Stua', 'teppe', 'tre', 0, ['lenestol', 'bed', 'candles', 'drawers']], ['Brygga', 'tre', 'gjerde', 1, ['robat', 'vedstabel', 'crate', 'lyktestolpe']]] },
  gudbrandsdalen: { tekst: 'en gård i Gudbrandsdalen', fra: 'Gudbrandsdalen', hendelser: ['isen', 'brann', 'taake', 'spanske'], lukt: 'fjøs og nystekt flatbrød', vann: 'Lågen', brannsted: 'låven', taakeLyd: 'ei kubjelle langt oppe i lia, og så ingenting',
    rom: [['Kjøkkenet', 'tre', 'tommer', 0, ['vedovn', 'langbord', 'chair', 'shelf']], ['Stua', 'teppe', 'tommer', 0, ['lenestol', 'piano', 'candles', 'wardrobe']], ['Tunet', 'gress', 'gjerde', 1, ['bronn', 'kjerre', 'tre', 'vedstabel']]] },
  grunerlokka: { tekst: 'en bakgård på Grünerløkka', fra: 'Grünerløkka', hendelser: ['brann', 'spanske', 'isen'], lukt: 'kålsuppe og kullrøyk', vann: 'Akerselva', brannsted: 'bakgården',
    rom: [['Kjøkkenet', 'linoleum', 'tapet', 0, ['komfyr', 'table', 'chair', 'drawers']], ['Kammerset', 'tre', 'tapet', 0, ['bed', 'wardrobe', 'chair', 'candles']], ['Bakgården', 'brostein', 'mur', 1, ['torkesnor', 'garbage', 'crate', 'kjerre']]] },
  roros: { tekst: 'gruvebyen Røros', fra: 'Røros', hendelser: ['ras', 'brann', 'isen', 'spanske'], lukt: 'svovel og bjørkeved', vann: 'Aursunden', brannsted: 'smeltehytta',
    rom: [['Kjøkkenet', 'tre', 'tommer', 0, ['vedovn', 'table', 'chair', 'shelf']], ['Stua', 'teppe', 'tommer', 0, ['lenestol', 'bed', 'candles', 'kortbord']], ['Gata', 'brostein', 'gjerde', 1, ['lyktestolpe', 'kjerre', 'vedstabel', 'kullhaug']]] },
  nordfjord: { tekst: 'prestegården i Nordfjord', fra: 'Nordfjord', hendelser: ['isen', 'brann', 'taake', 'spanske'], lukt: 'bivoks og gamle bøker', vann: 'fjorden', brannsted: 'prestegården', taakeLyd: 'årer som slår i vannet, og så ingenting',
    rom: [['Kjøkkenet', 'tre', 'panel', 0, ['komfyr', 'table', 'chair', 'shelf']], ['Studerværelset', 'parkett', 'tapet', 0, ['desk', 'shelf', 'globus', 'lesestol']], ['Hagen', 'grus', 'hekk', 1, ['busk', 'blomsterbed', 'fuglebad', 'statue']]] },
  sandefjord: { tekst: 'hvalfangerbyen Sandefjord', fra: 'Sandefjord', hendelser: ['forlis', 'spanske', 'brann'], lukt: 'hvalolje og grønnsåpe', vann: 'havna', brannsted: 'kokeriet',
    rom: [['Kjøkkenet', 'tre', 'panel', 0, ['komfyr', 'table', 'chair', 'drawers']], ['Stua', 'teppe', 'tapet', 0, ['lenestol', 'piano', 'candles', 'globus']], ['Kaia', 'stein', 'gjerde', 1, ['robat', 'crate', 'lyktestolpe', 'vedstabel']]] },
  dombas: { tekst: 'stasjonsbyen Dombås', fra: 'Dombås', hendelser: ['perrong', 'spanske', 'taake', 'brann'], lukt: 'kullrøyk og våt ull', vann: 'tjernet', brannsted: 'stasjonsbygningen', taakeLyd: 'et lokomotiv som fløyter langt borte, og så ingenting',
    rom: [['Ventesalen', 'tre', 'panel', 0, ['bench', 'pew', 'vekt', 'candles']], ['Stua', 'teppe', 'tapet', 0, ['lenestol', 'bed', 'candles', 'drawers']], ['Perrongen', 'betong', 'gjerde', 1, ['bench', 'lyktestolpe', 'crate', 'kjerre']]] }
};
const DROM_ROLLER = {
  tvilling: { kort: 'tvillingsøsteren', din: 'tvillingsøsteren din', kjonn: 'k' },
  mor: { kort: 'mora', din: 'mora di', kjonn: 'k' },
  far: { kort: 'faren', din: 'faren din', kjonn: 'm' },
  bror: { kort: 'broren', din: 'broren din', kjonn: 'm' },
  forlovede: { kort: 'forloveden', din: 'forloveden din', kjonn: '?' },
  barn: { kort: 'barnet', din: 'barnet ditt', kjonn: '?' },
  bestefar: { kort: 'bestefaren', din: 'bestefaren din', kjonn: 'm' },
  venninne: { kort: 'venninnen', din: 'venninnen din', kjonn: 'k' }
};
const DROM_NAVN = { k: ['Astrid', 'Borghild', 'Gudrun', 'Signe', 'Ragnhild', 'Solveig', 'Magnhild', 'Dagny', 'Hjørdis', 'Ingeborg', 'Kari', 'Marit'], m: ['Olav', 'Halvor', 'Torstein', 'Sverre', 'Einar', 'Knut', 'Gunnar', 'Arne', 'Lars', 'Johannes', 'Nils', 'Petter'] };
const DROM_FELLES = ['sto på ski ned til butikken og kom hjem uten ski', 'stjal moltebær fra presten og ble tatt', 'lå på låvebrua og telte stjerneskudd til det ble lyst', 'fikk kinobilletter av en fremmed mann med bart', 'badet i oktober og lo så mye at vi nesten druknet', 'sang for kua fordi den så trist ut'];
const DROM_HENDELSE = {
  isen: { kort: h => 'gikk gjennom isen på ' + h.vann, vaer: 'en grå dag i mars, med mildvær i lufta', lyd: 'isen som knaker, lenge, som en dør noen åpner veldig forsiktig' },
  brann: { kort: h => 'døde i brannen i ' + h.brannsted, vaer: 'en kald og stille natt i januar, med stjerner', lyd: 'noen som roper navnet ditt fra et vindu i andre etasje' },
  taake: { kort: h => 'forsvant i tåka ved ' + h.vann, vaer: 'tåke så tett at du ikke ser dine egne hender', lyd: h => h.taakeLyd || 'et rop langt borte, og så ingenting' },
  spanske: { kort: () => 'døde av spanskesyken høsten 1918', vaer: 'høsten 1918, med regn hver eneste dag', lyd: 'hosting gjennom veggen, hele natta, og så plutselig ikke' },
  forlis: { kort: () => 'gikk ned med båten', vaer: 'storm fra nordvest, med sludd som står rett inn', lyd: 'kirkeklokka som ringer midt på dagen, for noen' },
  ras: { kort: () => 'ble igjen i gruva da raset gikk', vaer: 'en helt vanlig tirsdag i oktober', lyd: 'et dunk dypt inne i fjellet, og så sirenen' },
  perrong: { kort: () => 'falt ned foran toget på perrongen', vaer: 'snøkav i desember, med lav sol', lyd: 'et tog som ikke bremser' }
};
// stedet der det skjedde: det siste rommet i kapittel 3
const DROM_STED = {
  isen: { navn: h => 'isen på ' + h.vann, til: h => 'ned til ' + h.vann, rom: ['Isen', 'is', 'gjerde', 1, ['vak', 'siv', 'stein', 'siv']], vaer: 'sno' },
  brann: { navn: h => h.brannsted, til: h => 'bort til ' + h.brannsted, rom: ['Brannstedet', 'jord', 'ruin', 1, ['ruinmur', 'baal', 'vedstabel', 'stein']], vaer: 'klart' },
  taake: { navn: h => 'vannkanten', til: h => 'ned til ' + h.vann, rom: ['Tåka', 'gress', 'gjerde', 1, ['stein', 'robat', 'lyktestolpe', 'siv']], vaer: 'taake' },
  spanske: { navn: () => 'senga', til: () => 'inn i rommet der senga sto', rom: ['Sykerommet', 'tre', 'tapet', 0, ['bed', 'bed', 'candles', 'drawers']], vaer: null },
  forlis: { navn: () => 'moloen', til: () => 'ut på moloen', rom: ['Moloen', 'stein', 'steinmur', 1, ['robat', 'crate', 'lyktestolpe', 'stein']], vaer: 'regn' },
  ras: { navn: () => 'gruveåpningen', til: () => 'opp til gruveåpningen', rom: ['Gruveåpningen', 'jord', 'stein', 1, ['kullhaug', 'stein', 'kjerre', 'lyktestolpe']], vaer: 'klart' },
  perrong: { navn: () => 'perrongen', til: () => 'ut på perrongen', rom: ['Perrongen', 'betong', 'gjerde', 1, ['bench', 'lyktestolpe', 'crate', 'kjerre']], vaer: 'sno' }
};
const DROM_SKYLD = {
  laaste: { kort: 'låste døra', jeg: S => ['Jeg låste døra.', 'Jeg hørte at noen banket. Jeg sa til meg selv at det var vinden.', 'Nøkkelen lå i lomma mi hele natta. Den var varm om morgenen.'],
    minner: S => [{ art: 'dorlaast', tittel: 'Døra', tekst: 'Døra. Nøkkelen står i låsen. Du kjenner den kalde smaken av metall i munnen, som om du har hatt nøkkelen der hele natta.' }, { art: 'vindu:rim', tittel: 'Vinduet', tekst: 'Et vindu med rim på innsiden. Noen har skrevet navnet ditt i rimet med en finger. Fra utsiden.' }] },
  loy: { kort: 'løy om hva som skjedde', jeg: S => ['Jeg sa at det var et uhell.', 'Jeg har fortalt det så mange ganger at jeg nesten tror på det selv.', 'Lensmannen trodde meg. Det var det verste.'],
    minner: S => [{ art: 'notat', tittel: 'Lensmannens notatbok', tekst: 'Lensmannens notatbok. Der står det du sa, med pen, skråstilt skrift. Det er ikke sant, men det er pent skrevet, og lensmannen har satt strek under.' }, { art: 'speil', tittel: 'Speilet', tekst: 'Et speil. Du øver på ansiktet du hadde da du fortalte det. Det sitter fortsatt. Du har brukt det så mange ganger at det har blitt ansiktet ditt.' }] },
  saa: { kort: 'så det og sa ingenting', jeg: S => ['Jeg så det.', 'Jeg sto helt stille. Jeg sier at jeg ikke kunne røre meg.', 'Jeg kunne ha ropt. Det hadde bare tatt ett ord.'],
    minner: S => [{ art: 'vindu:klart', tittel: 'Gardinen', tekst: `Du står bak gardinen og ser ut. Herfra kan du se alt. Det har du alltid kunnet.\nDu ser ${S.N}. Du ser deg selv stå helt stille.` }, { art: 'sko', tittel: 'Skoene', tekst: 'Et par sko ved døra. Dine. De er helt tørre. Alle andre sko den dagen var våte.' }] },
  dro: { kort: 'dro før det skjedde', jeg: S => ['Jeg var allerede på vei.', 'Jeg sa at jeg skulle komme hjem til helgen.', `${S.N} ba meg bli. Jeg lo.`],
    minner: S => [{ art: 'koffert', tittel: 'Kofferten', tekst: 'En koffert, ferdig pakket. Billetten ligger oppå. Den er stemplet dagen før. Du husker at du var glad da du kjøpte den.' }, { art: 'brev', tittel: 'Brevet', tekst: `Et brev fra ${S.N} som du aldri åpnet. Du vet hva som står i det. Du har alltid visst det.\n«Kom hjem,» står det. Bare det.` }] },
  onsket: { kort: 'ønsket det et øyeblikk', jeg: S => [`Et øyeblikk ønsket jeg at ${S.hun} skulle forsvinne.`, 'Bare et øyeblikk. Det var nok.', 'Jeg har ikke tenkt det siden. Jeg tenker det nå.'],
    minner: S => [{ art: 'foto', tittel: 'Fotografiet', tekst: `Et fotografi av dere to. Noen har strøket ut ansiktet til ${S.N} med blyant, hardt, så papiret har revnet. Du husker ikke at du gjorde det. Du husker blyanten.` }, { art: 'bok', tittel: 'Bønneboka', tekst: `En bønnebok, åpnet på en side der noen har skrevet med barnehåndskrift: «La ${S.henne} bli borte. Bare litt.»\nDet er din håndskrift.` }] },
  tok: { kort: 'tok noe som tilhørte en annen', jeg: S => [`Jeg tok ${S.tegnB}.`, `${S.Hun} lette etter ${S.den} hele kvelden.`, `Jeg har ${S.den} fortsatt.`],
    minner: S => [{ art: 'kommode', tittel: cap(S.tegnB), tekst: `${cap(S.tegnB)}. Du tok ${S.den} den dagen, uten å spørre. ${S.Hun} lette etter ${S.den} lenge, og så gikk ${S.hun} ut for å lete videre.` }, { art: 'kommode', tittel: 'Det tomme stedet', tekst: `Et tomt sted der ${S.tegnB} pleide å være. Det er støv rundt det tomme stedet, men ikke på det. Noen har sett etter der mange ganger.` }] }
};
const DROM_TEGN = {
  lue: { ub: 'en rød lue', best: 'den røde lua', den: 'den', linjer: S => ({
    1: 'Den røde lua ligger på krakken. Noen har strikket den for stor, med vilje, så den skulle vare. Du vet at den ikke er din, men den passer.',
    2: `${S.N} tar den røde lua og setter den på hodet ditt og ler. Latteren kommer litt for sent, som torden.`,
    3: `Den røde lua ligger ved ${S.sted}. Den er våt og mørk, nesten svart. Du kjenner den igjen likevel.`,
    4: 'Den røde lua. Nå ser du hvem som hadde den sist. Det var deg.',
    5: 'Den røde lua ligger på krakken igjen, tørr og hel. Den har ventet.' }) },
  ur: { ub: 'et lommeur som går baklengs', best: 'lommeuret', den: 'det', linjer: S => ({
    1: 'Et lommeur på bordet. Det går baklengs. Ingen andre ser ut til å legge merke til det, og du sier ingenting, for det virker uhøflig.',
    2: `Lommeuret tikker inni lomma di, selv om du ser det ligge på bordet. ${S.N} sier: «Du har god tid. Du har alltid hatt god tid.»`,
    3: 'Lommeuret har stoppet. Viserne står på et klokkeslett du alltid har visst.',
    4: 'Lommeuret går forlengs nå. Hver gang det tikker, er det litt mindre igjen.',
    5: 'Lommeuret går ikke i noen retning. Det bare er.' }) },
  symaskin: { ub: 'lyden av en symaskin', best: 'symaskinen', den: 'den', linjer: S => ({
    1: 'Du hører en symaskin i rommet ved siden av. Når du kommer inn, står den stille, og nåla er fortsatt varm.',
    2: `${S.N} syr noe til deg. Du får ikke se hva det er. «Det er til senere,» sier ${S.hun}.`,
    3: 'Symaskinen syr og syr, men det er ingen tråd i den. Bare hull, i en lang rad.',
    4: 'Symaskinen har sydd ferdig. Det er en liten skjorte. Den er til ingen.',
    5: 'Symaskinen står stille. Det den sydde, har du på deg. Det passer.' }) },
  kopp: { ub: 'en halvfull kaffekopp som aldri blir kald', best: 'kaffekoppen', den: 'den', linjer: S => ({
    1: 'En kaffekopp står på bordet, halvfull og varm. Du har sett den før, i alle rom du har vært i siden. Den blir aldri kald.',
    2: `${S.N} skyver koppen over til deg. «Drikk,» sier ${S.hun}. Du drikker, og koppen er like full.`,
    3: `Kaffekoppen står ved ${S.sted}. Den er fortsatt varm. Det er det verste.`,
    4: 'Kaffekoppen. Det var du som satte den fra deg, halvfull, fordi du hadde det travelt.',
    5: 'Kaffekoppen er tom. Noen har drukket den opp for deg. Det er fortsatt litt varme igjen i porselenet.' }) },
  hest: { ub: 'en hvit hest', best: 'den hvite hesten', den: 'den', linjer: S => ({
    1: 'En hvit hest står midt i rommet. Den ser på deg med rolige øyne. Ingen sier noe om den. Den har alltid stått der.',
    2: `Den hvite hesten står bak ${S.N} og puster på nakken ${S.hennes}. ${S.N} merker det ikke.`,
    3: `Den hvite hesten står ved ${S.sted}. Den så alt, og den kommer aldri til å fortelle det.`,
    4: 'Den hvite hesten snur seg bort fra deg. Det har den aldri gjort før.',
    5: 'Den hvite hesten går foran deg ut av rommet. Du følger etter.' }) },
  soldat: { ub: 'en tinnsoldat', best: 'tinnsoldaten', den: 'den', linjer: S => ({
    1: 'En tinnsoldat holder vakt på krakken. Den mangler en fot. Du husker at det var du som bet den av.',
    2: `${S.N} gir deg tinnsoldaten. «Han passer på deg,» sier ${S.hun}. Tinnsoldaten ser en annen vei.`,
    3: `Tinnsoldaten ligger på siden ved ${S.sted}. Den holdt ikke vakt.`,
    4: 'Tinnsoldaten i hånden din. Du har klemt så hardt at den har bøyd seg.',
    5: 'Tinnsoldaten står på krakken igjen. Den har fått tilbake foten.' }) },
  hvitveis: { ub: 'hvitveis', best: 'hvitveisen', den: 'den', linjer: S => ({
    1: 'Hvitveis i et glass. Det er for tidlig for hvitveis. Det er alltid for tidlig for hvitveis.',
    2: `${S.N} har plukket hvitveis til deg, en hel neve, med røttene på. «De skulle ikke ha vært plukket,» sier ${S.hun}.`,
    3: `Hvitveisen ligger strødd utover ved ${S.sted}. Noen har tråkket på den.`,
    4: 'Hvitveisen har visnet i glasset. Du glemte å gi den vann. Du glemte det i mange år.',
    5: 'Hvitveis vokser opp gjennom gulvet, midt i rommet. Det er vår et sted.' }) }
};
// når pasienten rømmer fra etasjen, før drømmen
const DROM_UTGANG = { 1: 'Du går ut porten. Den var ikke låst. Den har aldri vært låst.', 2: 'Du klatrer ut vinduet og faller lenger enn du burde.', 3: 'Du kryper inn i kloakkristen. Det er trangere enn det så ut.', 4: 'Du klatrer opp kullsjakta, mot lyset.', 5: 'Du følger stien ut av skogen.' };
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;

/* ---------- de fem kapitlene ---------- */
const DROM_KAP = {
  1: { navn: 'Hjemme', tema: 'varm',
    intro: S => `På den andre siden er det ikke sanatoriet. Det lukter ${S.lukt}. Du er hjemme, i ${S.hjem}, og det er en helt vanlig dag.`,
    rom: S => S.hjemRom,
    minner: S => [{ art: 'kaape', tittel: 'Knaggen i gangen', tekst: `Kåpa til ${S.din} henger på knaggen. Den er fortsatt varm, som om ${S.hun} nettopp tok den av. Du legger ansiktet inntil den. Den lukter ${S.lukt}, og noe annet, noe du hadde glemt at du husket.` },
      { art: 'tegn', tittel: cap(S.tegnB), tekst: S.tegnLinje(1) },
      { art: 'bord', tittel: 'Kjøkkenbordet', tekst: `Bordet er dekket til fire. Dere var aldri fire. Du teller tallerkenene igjen, og nå stemmer det, og det er verre.\nNoen har lagt en brødskive med brunost på tallerkenen din. Osten er skåret for tykt, slik bare ${S.N} gjorde det.` }],
    figurer: S => ['Så stor du har blitt.', 'Tørk av deg på beina.', 'Vi snakker ikke om det ved bordet.', `Det har alltid luktet ${S.lukt} her.`, 'Er det deg? Det er så vanskelig å se uten ansikt.'],
    personen: 'blank', hilsen: 'Der er du jo.',
    valg: S => ({ tekst: `${S.N} står i døråpningen. ${S.Hun} har ikke ansikt, bare et hvitt ark der ansiktet skulle vært, og likevel vet du at ${S.hun} smiler.\n«Du blir vel til middag?»`, valg: [
      { tekst: '«Ja. Jeg blir.»', slutt: 'gjentakelse', svar: `Dere setter dere. Maten smaker ingenting. Du spiser likevel, og ${S.N} ser på deg med det tomme ansiktet sitt, fornøyd. Så blir det mørkt.` },
      { tekst: '«Jeg kan ikke. Jeg er ikke egentlig her.»', slutt: 'sannheten', svar: `«Nei,» sier ${S.N}. «Det vet jeg.» Arket der ansiktet skulle vært, blir litt vått. Så blir det mørkt.` },
      { tekst: 'Si ingenting, og gå forbi', slutt: 'fornektelse', svar: `Du går forbi ${S.henne} uten å se opp. Bak deg dekker ${S.hun} av bordet, én tallerken om gangen. Så blir det mørkt.` }] }) },
  2: { navn: 'Personen', tema: 'varm',
    intro: S => `Du lander mykt, på et teppe du kjenner igjen. ${S.N} sitter i stua og venter på deg, som ${S.hun} alltid gjorde.\nDet er noe med ansiktet ${S.hennes}. Det er ikke der.`,
    rom: S => S.hjemRom,
    minner: S => [{ art: 'brev', tittel: 'Et brev', tekst: `Et brev med håndskriften til ${S.N}. Arket er tomt, bortsett fra én linje nederst:\n«Husker du den gangen vi ${S.felles}?»\nDu husker det. Det var den beste dagen. Du har ikke tenkt på den på mange år, fordi den gjør vondt.` },
      { art: 'tegn', tittel: cap(S.tegnB), tekst: S.tegnLinje(2) },
      { art: 'foto', tittel: 'Et fotografi', tekst: `Et fotografi av dere to, tatt av en omreisende fotograf med for mange tenner. Du ser rett i kameraet. ${S.N} ser på deg.\nDet er ikke noe ansikt der det skulle vært. Men det er så tydelig hvem ${S.hun} ser på.` }],
    figurer: S => [`${S.N} har ventet hele dagen.`, 'Dere to. Alltid dere to.', 'Hvem er du nå?', `Snakk med ${S.henne}. Det er ikke mye tid.`],
    personen: 'blank', hilsen: '.mok uD',
    valg: S => ({ baklengs: '«' + 'Var det godt å ha meg?'.split('').reverse().join('') + '»', tekst: `${S.N} ser på deg med ansiktet som ikke er der. Så sier ${S.hun} noe baklengs, og du forstår hvert ord: «Var det godt å ha meg?»`, valg: [
      { tekst: '«Det var det beste jeg hadde.»', slutt: 'tilgivelse', svar: `${S.N} nikker. Et øyeblikk ser du nesten et ansikt, slik man ser en stjerne best når man ser litt ved siden av den.` },
      { tekst: '«Jeg husker ikke.»', slutt: 'fornektelse', svar: `«Nei,» sier ${S.N}. «Det er vel best sånn.» ${S.Hun} bretter arket der ansiktet skulle vært, i to, og så i fire.` },
      { tekst: '«Kan vi gjøre alt sammen en gang til?»', slutt: 'gjentakelse', svar: `«Vi gjør det hele tiden,» sier ${S.N}. «Merker du ikke det?»` }] }) },
  3: { navn: 'Dagen det skjedde', tema: 'kald',
    intro: S => `Det lukter ${S.lukt}, og så noe annet. Når du kommer ut, er det ${S.vaer}, og du vet med en gang hvilken dag det er.\nDu har ikke lov til å være her. Du er her likevel.`,
    rom: S => [S.hjemRom[0], S.hjemRom[1], S.stedRom],
    minner: S => [{ art: 'vindu:' + S.vaerType, tittel: 'Været', tekst: `Været. ${cap(S.vaer)}.\nDu husker været bedre enn du husker ansiktet ${S.hennes}, og du skammer deg over det.` },
      { art: 'grammofon', tittel: 'Lyden', tekst: `Lyden. ${cap(S.lyd)}.\nDen er her fortsatt. Den har bare blitt lavere med årene, som når noen skrur ned radioen i et annet rom.` },
      { art: 'tegn', knust: true, tittel: cap(S.tegnB), tekst: S.tegnLinje(3) }],
    figurer: S => ['Det var ingen som kunne gjort noe.', `${S.Hun} var så ung.`, 'Det var ikke været sin skyld.', 'Jeg så deg der. Gjorde ikke du?', 'Sånt skjer. Det er det verste med det.'],
    rekke: true, personen: 'blank', hilsen: null,
    valg: S => ({ tekst: `Der står ${S.N}, ved ${S.sted}, like før. ${S.Hun} har ikke sett deg ennå. Om et øyeblikk skjer det. Du vet nøyaktig hvordan.`, valg: [
      { tekst: `Løp mot ${S.henne}`, slutt: 'gjentakelse', svar: 'Du løper, og det går så sakte som det alltid går i drømmer. Du rekker det ikke. Du har aldri rukket det. Du kommer til å prøve igjen.' },
      { tekst: 'Snu deg bort', slutt: 'fornektelse', svar: 'Du snur deg bort og ser på himmelen, på skoene dine, på ingenting. Det skjer bak deg. Du hører det likevel.' },
      { tekst: 'Bli stående og se', slutt: 'sannheten', svar: 'Du ser det, hele. Det tar ikke lang tid. Det var aldri det som var vanskelig.' }] }) },
  4: { navn: 'Det du gjorde', tema: 'mork',
    intro: S => 'Du kommer ut hjemme. Huset er tomt.\nNei. Ikke tomt. Noen går i gangen bak deg, i samme takt som deg.',
    rom: S => S.hjemRom.map(r => [r[0], r[1], r[2], r[3], r[4].slice(0, 2)]),
    minner: S => [...S.skyld.minner(S), { art: 'tegn', tittel: cap(S.tegnB), tekst: S.tegnLinje(4) }],
    figurer: S => [], vendt: true, personen: null, hilsen: null,
    valg: S => ({ tekst: 'Skyggen står rett bak deg. Den puster i samme takt som deg.\n«Si det,» sier den, med stemmen din.', valg: [
      { tekst: '«Det var meg.»', slutt: 'sannheten', svar: 'Skyggen blir stille. Så legger den hånden på skulderen din, lett, slik man gjør med noen som har båret noe tungt et langt stykke.' },
      { tekst: '«Det var ikke min skyld.»', slutt: 'fornektelse', svar: '«Nei,» sier skyggen. «Det var ikke det.» Den sier det nøyaktig slik du alltid har sagt det. For første gang hører du hvordan det høres ut.' },
      { tekst: '«Jeg vil gjøre det om igjen.»', slutt: 'gjentakelse', svar: '«Du gjør det om igjen hver natt,» sier skyggen. «Det er derfor du er her.»' },
      { tekst: '«Jeg tilgir deg.»', slutt: 'tilgivelse', svar: 'Skyggen står lenge uten å si noe. Så nikker den, én gang. Den er litt mindre nå. Eller så er du litt større.' }] }) },
  5: { navn: 'Det som er sant', tema: 'rod',
    intro: S => 'Du kommer til et rødt forheng. Bak forhenget er et rom du har vært i før, men aldri våken.\nGulvet går i sikksakk. Noen har satt fram stoler. Musikken kommer fra alle kanter og ingen.',
    rom: S => [['Forhenget', 'sikksakk', 'forheng', 0, ['chair', 'chair', 'lamp', 'statue']], ['Venterommet', 'sikksakk', 'forheng', 0, ['chair', 'lamp', 'chair', 'grammofon']], ['Det røde rommet', 'sikksakk', 'forheng', 0, ['chair', 'chair', 'lamp', 'statue']]],
    minner: S => [{ art: 'grammofon', tittel: 'Platen', tekst: `En grammofon spiller en plate baklengs. Du forstår hvert ord. Det er stemmen til ${S.N}, og ${S.hun} sier navnet ditt, om og om igjen, som om ${S.hun} leter etter deg i et mørkt hus.` },
      { art: 'tegn', tittel: cap(S.tegnB), tekst: S.tegnLinje(5) },
      { art: 'mappe', tittel: 'Pasientmappa', tekst: `En pasientmappe med navnet ditt på. Inni ligger ett eneste ark. Der står det, med din egen håndskrift:\n«${S.skyld.jeg(S)[0]}»\nDet er det første sanne du har skrevet på lenge.` }],
    figurer: S => [], personen: 'ansikt', hilsen: 'Sett deg. Du har gått lenge.',
    valg: S => ({ tekst: `Skyggen har snudd seg. Den har ansiktet ditt. ${S.N} sitter på en stol ved siden av, og ${S.hun} har ansikt nå, et helt vanlig ansikt. Du hadde glemt hvor vanlig det var.\n«Du kan gå nå,» sier ${S.N}. «Men du må bestemme hva du tar med deg.»`, valg: [
      { tekst: `Ta ${S.N} i hånden`, slutt: 'tilgivelse', svar: 'Hånden er varm. Du holder den så lenge du trenger. Så slipper du, og det er ikke det samme som å miste.' },
      { tekst: `Fortell ${S.N} hva du gjorde`, slutt: 'sannheten', svar: `Du forteller alt, fra begynnelsen. ${S.N} hører på uten å avbryte. Når du er ferdig, sier ${S.hun} bare: «Jeg vet det. Jeg har alltid visst det.»` },
      { tekst: 'Gå tilbake og begynn på nytt', slutt: 'gjentakelse', svar: 'Du snur deg og går tilbake gjennom forhenget. På den andre siden er porten til parken. Den er ikke låst. Den har aldri vært låst.' },
      { tekst: 'Våkn opp og glem', slutt: 'fornektelse', svar: `Du våkner. Du husker ingenting, bortsett fra ${S.tegnB}, og at det var noe med et rødt rom. «Det går over,» sier sykepleieren. «Det går alltid over.»` }] }) }
};
// slutten ved utskrivning, etter hva som kom oftest (kapittel 5 teller dobbelt)
const DROM_SLUTT = {
  tilgivelse: { navn: 'Tilgivelse', mappe: 'Gikk ut med tilgivelse.', tekst: S => `Du går ut porten, og denne gangen er det bare en port. Utenfor venter ${S.hjem}, eller noe som ligner nok.\n${S.N} er ikke der, og det er greit. ${cap(S.tegnB)} har du fortsatt, i lomma. ${cap(S.den)} er lett nå.` },
  sannheten: { navn: 'Sannheten', mappe: 'Gikk ut med sannheten.', tekst: S => `Du tar toget hjem. Du går ${S.stedTil} og sier det høyt, til ingen: «Det var meg.»\nIngenting skjer. Så begynner det å regne, og det er bare regn. For første gang på mange år er det bare regn.` },
  gjentakelse: { navn: 'Gjentakelse', mappe: 'Gikk ut for å gjøre det igjen.', tekst: S => `Du går ut porten, og porten er hjemme, og hjemme er det ${S.vaer}. ${S.N} står i vinduet og vinker til deg.\nDu vet hvordan dagen ender. Du går inn likevel. I morgen får en ny pasient senga di, og det er deg.` },
  fornektelse: { navn: 'Fornektelse', mappe: 'Gikk ut uten å huske.', tekst: S => `Du går ut porten og ser deg ikke tilbake. Du husker ingenting av drømmene, bortsett fra ${S.tegnB}, som du ikke kan forklare.\nLegen skriver «frisk nok» i journalen og setter strek under. Legen tar feil. Det er ikke legens problem lenger.` }
};
// fargene i drømmen: varm (hjemme), kald (dagen det skjedde), mørk (det du gjorde), rød (det som er sant)
const DROM_TEMA = {
  varm: { wall: '#d8c8b8', wains: '#7a5a58', pool: '#ffd8b0', fog: 0x100a10, grade: { amb: '#d8c8d8', lift: '#0c0610', gain: '#fff0e8', vig: .84 }, taake: [.22, '#c8b0d0'] },
  kald: { wall: '#b8c0cc', wains: '#4a5a6a', pool: '#c8d8ff', fog: 0x080a10, grade: { amb: '#a8b4c8', lift: '#04060c', gain: '#e8f0ff', vig: .86 }, taake: [.32, '#a8b4c8'] },
  mork: { wall: '#8a7a80', wains: '#3a2a34', pool: '#b8a0c8', fog: 0x060408, grade: { amb: '#7a6a88', lift: '#060308', gain: '#f0e0ff', vig: .9 }, taake: [.3, '#6a5a7a'] },
  rod: { wall: '#8a1a1a', wains: '#4a0808', pool: '#ff9a88', fog: 0x0c0204, grade: { amb: '#e8b0a8', lift: '#120404', gain: '#ffe8e0', vig: .82 }, taake: [.24, '#8a2a2a'] }
};

/* ---------- gulv og vegger bare drømmen har: sikksakk og røde forheng ---------- */
GULV.sikksakk = (g, px, py, T, c) => {
  g.fillStyle = '#ece6d8'; g.fillRect(px, py, T + 1, T + 1);
  g.save(); g.beginPath(); g.rect(px, py, T, T); g.clip(); g.fillStyle = '#16121a';
  const X0 = c.x * T, Z0 = c.z * T, per = T / 2, amp = T / 4, bw = T / 4, n0 = Math.floor(X0 / per) - 1, n1 = Math.ceil((X0 + T) / per) + 1, y = n => ((n % 2) + 2) % 2 * amp;
  for (let j = Math.floor((Z0 - amp) / (2 * bw)) - 1; j <= Math.ceil((Z0 + T) / (2 * bw)) + 1; j++) {
    const y0 = py + j * 2 * bw - Z0; g.beginPath();
    for (let n = n0; n <= n1; n++) g.lineTo(px + n * per - X0, y0 + y(n));
    for (let n = n1; n >= n0; n--) g.lineTo(px + n * per - X0, y0 + y(n) + bw);
    g.closePath(); g.fill();
  }
  g.restore();
};
VEGG.forheng = { h: 2.3, tegn(g, w, hp) {
  g.fillStyle = '#5a0a0e'; g.fillRect(0, 0, w, hp);
  for (let x = 0; x < w; x += 22) { const gr = g.createLinearGradient(x, 0, x + 22, 0); gr.addColorStop(0, 'rgba(20,0,2,.6)'); gr.addColorStop(.45, 'rgba(200,44,52,.5)'); gr.addColorStop(1, 'rgba(20,0,2,.6)'); g.fillStyle = gr; g.fillRect(x, 0, 22, hp); }
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, hp - 16, w, 16); g.fillStyle = INK; g.fillRect(0, 0, w, 9);
} };

/* ---------- tegningene: minnene, tegnene og døra ---------- */
const DROM_ART = {
  lue: () => Art.part('drom_lue', 1.0, 1.3, .5, .05, g => { krakk(g); A.cel(g, A.blob([[-.3, -.54], [-.26, -.86], [0, -1.0], [.26, -.86], [.3, -.54]]), '#c8262a', { line: '#4a0a0a' }); for (let i = 0; i < 7; i++) A.line(g, [[-.26 + i * .087, -.55], [-.25 + i * .085, -.66]], .02, '#8a1414'); A.cel(g, A.ell(0, -1.04, .1, .09), '#efe8da', { lw: .025, hi: false }); }),
  ur: () => bordArt('drom_ur', .9, .7, .75, WOOD, WOODL, (g, w, tf, ff) => { const y = -ff - tf + tf * .5; A.flat(g, A.ell(0, y, .17, .11), '#c8a048', .025, MESSL); A.flat(g, A.ell(0, y, .13, .08), '#f4efe0', .015); A.line(g, [[0, y], [-.06, y - .03]], .015); A.line(g, [[0, y], [.07, y + .015]], .012); A.curve(g, [.15, y - .04], [.32, y - .2], [.36, y + .02], .015, MESS); }),
  symaskin: () => bordArt('drom_symaskin', 1.1, .7, .75, WOOD, WOODL, (g, w, tf, ff) => { const y = -ff - tf + tf * .6; A.cel(g, A.poly([[-.36, y], [.3, y], [.3, y - .1], [.12, y - .1], [.12, y - .42], [-.3, y - .42], [-.36, y - .34]]), '#141414', { line: INK, lw: .03 }); A.line(g, [[-.28, y - .38], [.08, y - .38]], .02, '#c8a048'); A.flat(g, A.ell(.2, y - .2, .07, .07), '#c8a048', .02, MESSL); A.line(g, [[-.28, y - .1], [-.28, y + .02]], .02, '#c8c8c0'); A.flat(g, A.rr(-.12, y - .52, .1, .1, .02), '#e8e0d0', .015); }),
  kopp: () => bordArt('drom_kopp', .9, .7, .75, WOOD, WOODL, (g, w, tf, ff) => { const y = -ff - tf + tf * .55; A.flat(g, A.ell(0, y, .16, .06), HVIT, .02); A.cel(g, A.rr(-.1, y - .18, .2, .18, .03), HVIT, { lw: .025, hi: false }); A.curve(g, [.1, y - .14], [.19, y - .1], [.1, y - .04], .02); A.flat(g, A.ell(0, y - .18, .09, .03), '#2a160a', .015); A.curve(g, [-.02, y - .24], [.06, y - .36], [-.02, y - .5], .02, 'rgba(240,240,230,.7)'); A.curve(g, [.04, y - .26], [.12, y - .38], [.04, y - .52], .015, 'rgba(240,240,230,.5)'); }),
  hest: () => Art.part('drom_hest', 2.6, 2.4, 1.3, .05, g => {
    for (const x of [-.75, -.5, .45, .7]) { A.cel(g, A.rr(x, -.9, .12, .9, .04), '#e8e4dc', { line: '#5a5650', lw: .03, hi: false }); A.flat(g, A.rr(x - .01, -.1, .14, .1, .02), '#3a3630', 0); }
    A.cel(g, A.blob([[-.95, -.85], [.85, -.9], [.95, -1.45], [.5, -1.6], [-.6, -1.55], [-1.0, -1.3]]), '#f2eee6', { line: '#5a5650' });
    A.cel(g, A.blob([[.7, -1.4], [.95, -2.1], [1.2, -2.2], [1.25, -1.95], [1.0, -1.75], [.9, -1.35]]), '#f2eee6', { line: '#5a5650' });
    A.cel(g, A.blob([[.72, -1.5], [.86, -2.1], [.98, -2.18], [.8, -1.7]]), '#d8d4cc', { lw: .02, hi: false });
    A.dot(g, 1.08, -2.02, .035, INK); A.flat(g, A.ell(1.22, -2.04, .05, .04), '#c8b8b0', 0); A.curve(g, [-.98, -1.3], [-1.2, -1.0], [-1.1, -.6], .06, '#d8d4cc');
  }),
  soldat: () => Art.part('drom_soldat', 1.0, 1.9, .5, .05, g => { krakk(g); const y = -.52; A.cel(g, A.rr(-.1, y - .5, .08, .5, .02), '#2a3a6a', { lw: .025, hi: false }); A.cel(g, A.rr(.02, y - .5, .08, .38, .02), '#2a3a6a', { lw: .025, hi: false }); A.cel(g, A.rr(-.16, y - .92, .32, .44, .05), '#b8262a', { line: INK }); A.line(g, [[-.16, y - .78], [.16, y - .78]], .03, '#e8e0c8'); A.line(g, [[-.16, y - .5], [.16, y - .5]], .04, '#1a1a1a'); A.cel(g, A.ell(0, y - 1.03, .11, .12), '#e8c8a8'); A.cel(g, A.rr(-.1, y - 1.36, .2, .28, .03), '#1a1a1a', { lw: .025 }); A.dot(g, -.04, y - 1.03, .015); A.dot(g, .04, y - 1.03, .015); A.line(g, [[.2, y - .88], [.22, y - 1.42]], .03, '#8a8a84'); }),
  hvitveis: () => Art.part('drom_hvitveis', 1.0, 1.5, .5, .05, g => { krakk(g); A.cel(g, A.poly([[-.12, -.52], [.12, -.52], [.09, -.8], [-.09, -.8]]), 'rgba(200,220,220,.6)', { line: '#3a4a4a', lw: .025, hi: false }); for (let i = 0; i < 7; i++) { const a = -.9 + i * .3, x = Math.sin(a) * .28, y = -1.05 - Math.cos(a) * .12; A.line(g, [[0, -.78], [x, y]], .018, '#4a6a2a'); for (let k = 0; k < 6; k++) A.dot(g, x + Math.cos(k / 6 * TAU) * .045, y + Math.sin(k / 6 * TAU) * .045, .03, '#f8f6f0'); A.dot(g, x, y, .02, '#e8c848'); } }),
  kaape: farge => Art.part('drom_kaape_' + farge.slice(1), 1.0, 2.4, .5, .05, g => { A.line(g, [[0, 0], [0, -2.1]], .06, WOODL); A.cel(g, A.ell(0, -.03, .3, .06), WOOD, { lw: .025, hi: false }); for (const s of [-1, 1]) A.line(g, [[0, -2.0], [s * .2, -2.12]], .04, WOODL); A.cel(g, A.blob([[-.22, -2.0], [.22, -2.0], [.34, -.9], [.1, -.8], [-.1, -.8], [-.34, -.9]]), farge, { line: INK }); A.line(g, [[0, -1.95], [0, -.85]], .02, 'rgba(0,0,0,.35)'); for (const y of [-1.7, -1.4, -1.1]) A.dot(g, .06, y, .025, '#c8a048'); }),
  bord: () => bordArt('drom_bord', 1.6, 1.0, .75, WOOD, WOODL, (g, w, tf, ff) => { const y = -ff - tf + tf * .55; for (const x of [-.5, -.17, .16, .48]) { A.flat(g, A.ell(x, y, .13, .05), HVIT, .015); A.flat(g, A.ell(x, y - .01, .08, .025), '#e8e0d0', 0); } A.flat(g, A.rr(-.56, y - .05, .12, .04, .01), '#c89a5a', .01); A.flat(g, A.rr(-.56, y - .07, .12, .02, .01), '#b86a2a', 0); }),
  brev: () => bordArt('drom_brev', 1.1, .8, .75, WOOD, WOODL, (g, w, tf, ff) => { const y = -ff - tf + tf * .5; A.flat(g, A.poly([[-.3, y - .08], [.18, y - .12], [.26, y + .06], [-.24, y + .1]]), '#f4efe0', .015); for (let i = 0; i < 3; i++) A.line(g, [[-.2, y - .04 + i * .04], [.1, y - .06 + i * .04]], .01, '#4a3a5a'); A.flat(g, A.poly([[.08, y + .02], [.34, y], [.36, y + .12], [.1, y + .14]]), '#e8d8b8', .015); }),
  foto: () => Art.part('drom_foto', 1.0, 1.8, .5, .05, g => { for (const [a, b] of [[[-.3, 0], [0, -1.5]], [[.3, 0], [0, -1.5]], [[0, -.1], [0, -1.3]]]) A.line(g, [a, b], .04, WOODL); A.cel(g, A.rr(-.36, -1.5, .72, .56, .03), '#6a4a2c', { line: INK }); A.flat(g, A.rr(-.3, -1.44, .6, .44, .02), '#d8ccb0', .015); for (const x of [-.12, .12]) { A.flat(g, A.ell(x, -1.28, .06, .07), '#f4f0e8', .012); A.flat(g, A.rr(x - .08, -1.21, .16, .2, .03), '#5a4a3a', .012); } }),
  vindu: vaer => Art.part('drom_vindu_' + vaer, 1.2, 2.2, .6, .05, g => {
    for (const x of [-.4, .4]) A.line(g, [[x, 0], [x * .8, -.6]], .05, WOODL);
    A.cel(g, A.rr(-.5, -2.0, 1.0, 1.4, .03), '#e8e0cc', { line: INK }); A.flat(g, A.rr(-.42, -1.92, .84, 1.24, .02), vaer === 'brann' ? '#3a1408' : vaer === 'taake' ? '#b8bcc4' : vaer === 'klart' ? '#2a3a5a' : '#1a2438', .02);
    if (vaer === 'sno' || vaer === 'rim') for (let i = 0; i < 16; i++) A.dot(g, -.38 + ((i * 37) % 76) / 100, -1.88 + ((i * 53) % 118) / 100, .02, '#f4f8ff');
    if (vaer === 'rim') { for (let i = 0; i < 9; i++) { const x = -.4 + i * .1; A.line(g, [[x, -.7], [x + .05, -.9], [x - .02, -1.0]], .012, 'rgba(230,240,255,.8)'); } A.curve(g, [-.2, -1.5], [0, -1.62], [.2, -1.48], .02, 'rgba(240,248,255,.9)'); }
    if (vaer === 'regn') for (let i = 0; i < 12; i++) { const x = -.36 + ((i * 29) % 72) / 100, y = -1.85 + ((i * 41) % 105) / 100; A.line(g, [[x, y], [x - .04, y + .12]], .012, '#8aa8c8'); }
    if (vaer === 'brann') { A.flat(g, A.blob([[-.4, -.7], [-.2, -1.3], [0, -1.0], [.15, -1.5], [.4, -.7]]), '#e86a1a', 0); A.flat(g, A.blob([[-.25, -.7], [-.1, -1.05], [.05, -.9], [.2, -1.15], [.3, -.7]]), '#ffd04a', 0); }
    if (vaer === 'taake') A.flat(g, A.rr(-.42, -1.3, .84, .6, .02), 'rgba(240,240,245,.6)', 0);
    if (vaer === 'klart') for (let i = 0; i < 7; i++) A.dot(g, -.36 + ((i * 43) % 72) / 100, -1.86 + ((i * 29) % 60) / 100, .015, '#fff8d0');
    A.line(g, [[0, -1.92], [0, -.68]], .04, '#e8e0cc'); A.line(g, [[-.42, -1.3], [.42, -1.3]], .04, '#e8e0cc');
  }),
  notat: () => Art.part('drom_notat', 1.0, 1.8, .5, .05, g => { A.line(g, [[0, 0], [0, -1.1]], .08, WOODL); A.cel(g, A.ell(0, -.03, .3, .07), WOOD, { lw: .025, hi: false }); A.cel(g, A.poly([[-.4, -1.05], [.4, -1.05], [.34, -1.35], [-.34, -1.35]]), WOOD, { line: WOODL }); A.flat(g, A.poly([[-.3, -1.12], [0, -1.1], [0, -1.32], [-.27, -1.32]]), '#f4efe0', .015); A.flat(g, A.poly([[0, -1.1], [.3, -1.12], [.27, -1.32], [0, -1.32]]), '#eee8d8', .015); for (let i = 0; i < 4; i++) { A.line(g, [[-.24, -1.16 - i * .04], [-.04, -1.15 - i * .04]], .01, '#3a3a5a'); A.line(g, [[.04, -1.15 - i * .04], [.24, -1.16 - i * .04]], .01, '#3a3a5a'); } }),
  speil: () => Art.part('drom_speil', 1.0, 2.2, .5, .05, g => { for (const x of [-.3, .3]) A.line(g, [[x, 0], [x * .7, -.6]], .05, WOODL); A.cel(g, A.ell(0, -1.25, .36, .7), '#8a6a3a', { line: INK }); A.flat(g, A.ell(0, -1.25, .3, .62), '#9aa8b0', .02); A.flat(g, A.ell(-.08, -1.45, .08, .25), 'rgba(255,255,255,.35)', 0); A.flat(g, A.ell(0, -1.2, .12, .16), 'rgba(40,30,40,.35)', 0); }),
  sko: () => Art.part('drom_sko', 1.0, .7, .5, .35, g => { A.flat(g, A.rr(-.45, -.2, .9, .4, .05), '#6a4a3a', .02); for (const x of [-.16, .16]) { A.cel(g, A.blob([[x - .12, .1], [x - .12, -.05], [x - .04, -.14], [x + .12, -.12], [x + .13, .1]]), '#2a1a12', { lw: .025 }); A.flat(g, A.ell(x, -.08, .05, .02), '#6a5a4a', 0); } }),
  koffert: () => Art.part('drom_koffert', 1.2, 1.0, .6, .05, g => { A.cel(g, A.rr(-.5, -.7, 1.0, .7, .05), '#6a4028', { line: INK }); A.line(g, [[-.5, -.4], [.5, -.4]], .03, '#3a2014'); for (const x of [-.3, .3]) A.flat(g, A.rr(x - .06, -.72, .12, .08, .02), MESS, .015); A.line(g, [[-.12, -.72], [-.1, -.84], [.1, -.84], [.12, -.72]], .04, '#2a1a0e'); A.flat(g, A.poly([[-.1, -.74], [.3, -.8], [.34, -.7], [-.08, -.66]]), '#f0e0b0', .015); }),
  bok: () => Art.part('drom_bok', 1.0, 1.6, .5, .05, g => { A.line(g, [[0, 0], [0, -.95]], .08, WOODL); A.cel(g, A.ell(0, -.03, .28, .07), WOOD, { lw: .025, hi: false }); A.cel(g, A.poly([[-.36, -.9], [.36, -.9], [.32, -1.15], [-.32, -1.15]]), '#2a1a2a', { line: INK }); A.flat(g, A.poly([[-.28, -.95], [0, -.93], [0, -1.12], [-.26, -1.12]]), '#f4efe0', .012); A.flat(g, A.poly([[0, -.93], [.28, -.95], [.26, -1.12], [0, -1.12]]), '#f4efe0', .012); A.line(g, [[.04, -1.0], [.2, -1.02]], .012, '#6a2a2a'); A.line(g, [[.04, -1.05], [.18, -1.06]], .012, '#6a2a2a'); }),
  kommode: () => Art.part('drom_kommode', 1.4, 1.5, .7, .05, g => { A.cel(g, A.rr(-.6, -1.1, 1.2, 1.1, .04), WOOD, { line: WOODL }); for (let i = 0; i < 3; i++) { A.flat(g, A.rr(-.52, -1.02 + i * .34, 1.04, .28, .02), Col.dark(WOOD, .85), .02, WOODL); A.dot(g, 0, -.88 + i * .34, .03, MESS); } A.flat(g, A.rr(-.5, -.44, 1.0, .1, .02), '#1a0e06', 0); }),
  mappe: () => bordArt('drom_mappe', 1.1, .8, .75, WOOD, WOODL, (g, w, tf, ff) => { const y = -ff - tf + tf * .5; A.flat(g, A.poly([[-.32, y - .1], [.24, y - .12], [.3, y + .08], [-.28, y + .1]]), '#c8a868', .02); A.flat(g, A.rr(-.2, y - .08, .2, .06, .01), '#f4efe0', .01); A.line(g, [[-.16, y - .05], [-.04, y - .055]], .01); }),
  dorlaast: () => Art.part('drom_dorlaast', 1.6, 2.8, .8, .05, g => { A.cel(g, A.rr(-.62, -2.5, 1.24, 2.5, .04), '#4a3a30', { line: INK }); A.flat(g, A.rr(-.52, -2.4, 1.04, 2.4, .02), '#6a4a34', .03); for (const y of [-2.2, -1.5, -.8]) A.flat(g, A.rr(-.42, y, .84, .5, .02), Col.dark('#6a4a34', .85), .02, WOODL); A.flat(g, A.ell(.34, -1.2, .07, .07), MESS, .02, MESSL); A.line(g, [[.34, -1.16], [.34, -1.0]], .04, '#c8c8c0'); A.dot(g, .34, -.98, .04, '#c8c8c0'); }),
  dor: aapen => Art.part('drom_dor' + (aapen ? '_aapen' : ''), 1.8, 2.9, .9, .05, g => {
    A.cel(g, A.rr(-.7, -2.6, 1.4, 2.6, .04), '#4a2a3a', { line: INK });
    if (aapen) { const r = g.createLinearGradient(0, -2.5, 0, 0); r.addColorStop(0, '#fff6dc'); r.addColorStop(1, '#ffd890'); g.fillStyle = r; g.fillRect(-.58, -2.48, 1.16, 2.48); A.cel(g, A.poly([[-.58, -2.48], [-.24, -2.34], [-.24, -.1], [-.58, 0]]), '#6a4a5a', { line: INK, lw: .03 }); }
    else { A.flat(g, A.rr(-.58, -2.48, 1.16, 2.48, .02), '#6a4a5a', .03); A.dot(g, .4, -1.2, .05, MESS); }
  })
};
function krakk(g) { for (const x of [-.24, .2]) A.line(g, [[x, -.44], [x - .03, 0]], .06, WOODL); A.cel(g, A.rr(-.32, -.52, .64, .12, .04), WOOD, { line: WOODL }); }
// tegn i stykker (kapittel 3): sprekker over tegningen
function knustBilde(c) { const g = c.getContext('2d'); g.fillStyle = 'rgba(20,14,24,.35)'; g.fillRect(0, 0, c.width, c.height); g.strokeStyle = 'rgba(10,6,10,.85)'; g.lineWidth = 4; const rng = mulberry32(3); for (let k = 0; k < 5; k++) { let x = 120 + rng() * 160, y = 120 + rng() * 160; g.beginPath(); g.moveTo(x, y); for (let i = 0; i < 5; i++) { x += (rng() - .5) * 90; y += (rng() - .5) * 90; g.lineTo(x, y); } g.stroke(); } return c; }

/* ---------- figurene: tomme papiransikter, og til slutt et vanlig ansikt ---------- */
RIG.blank_m = { hip: .5, hipW: .12, neck: .8, shW: .27, shY: .72, armW: .11, legW: .11, handR: .075, arm: '#3a3430', leg: '#2a2622', hand: '#e8dcc8', shoe: 'stovel', scale: .98, headLag: .5 };
RIG.blank_k = { hip: .44, hipW: .15, neck: .78, shW: .24, shY: .7, armW: .1, legW: .09, handR: .07, arm: '#4a2a2e', leg: '#3a2024', hand: '#e8dcc8', shoe: 'stovel', scale: .94, headLag: .5 };
RIG.ansikt_m = Object.assign({}, RIG.blank_m); RIG.ansikt_k = Object.assign({}, RIG.blank_k);
{
  const HUD = '#ece4d4', HAR = { m: '#2a1e16', k: '#5a3a24' };
  const hode = (ansikt, k) => v => g => {
    const cy = -.5, har = HAR[k ? 'k' : 'm'];
    if (v === 'b') { A.cel(g, A.ell(0, cy, .28, .33), har, { sk: .7 }); if (k) A.cel(g, A.ell(0, cy - .08, .13, .11), Col.dark(har, .8), { lw: .025 }); return; }
    if (v === 's') {
      A.cel(g, A.ell(.02, cy, .27, .33), ansikt ? '#e8c8a8' : HUD); A.cel(g, A.blob([[-.28, cy - .02], [-.22, cy - .3], [.14, cy - .34], [.26, cy - .2], [.02, cy - .22], [-.1, cy + .06]]), har, { lw: .03, hi: false });
      if (k) A.cel(g, A.ell(-.2, cy - .22, .1, .09), har, { lw: .025, hi: false });
      if (ansikt) { A.dot(g, .17, cy - .02, .022); A.line(g, [[.26, cy + .02], [.29, cy + .08], [.25, cy + .1]], .018); A.line(g, [[.16, cy + .18], [.24, cy + .17]], .018); }
      else A.line(g, [[.04, cy - .12], [.1, cy + .2]], .012, 'rgba(120,110,90,.35)');
      return;
    }
    A.cel(g, A.ell(0, cy, .27, .33), ansikt ? '#e8c8a8' : HUD);
    if (k) { A.cel(g, A.blob([[-.28, cy - .02], [-.25, cy - .28], [0, cy - .36], [.25, cy - .28], [.28, cy - .02], [.13, cy - .22], [-.13, cy - .22]]), har, { lw: .03, hi: false }); A.cel(g, A.ell(0, cy - .38, .12, .09), har, { lw: .025, hi: false }); }
    else A.cel(g, A.blob([[-.28, cy - .02], [-.25, cy - .28], [.05, cy - .37], [.26, cy - .26], [.28, cy - .04], [.1, cy - .24], [-.1, cy - .2]]), har, { lw: .03, hi: false });
    if (ansikt) { for (const s of [-1, 1]) { A.dot(g, s * .09, cy - .01, .025); A.line(g, [[s * .05, cy - .08], [s * .14, cy - .09]], .015); } A.line(g, [[0, cy + .02], [-.02, cy + .1], [.02, cy + .11]], .016, '#b89a80'); A.curve(g, [-.07, cy + .19], [0, cy + .21], [.07, cy + .19], .018); }
    else { A.line(g, [[-.2, cy + .03], [.22, cy]], .012, 'rgba(120,110,90,.35)'); A.flat(g, A.ell(.08, cy + .1, .12, .08), 'rgba(160,150,130,.16)', 0); }
  };
  const kropp = k => v => g => {
    const top = -.72;
    if (k) {
      A.cel(g, A.blob([[-.32, .42], [.32, .42], [.24, top + .12], [0, top - .02], [-.24, top + .12]]), '#4a2a2e', { sk: .7 });
      if (v !== 'b') A.cel(g, A.poly([[-.11, top + .02], [0, top + .12], [.11, top + .02], [0, top - .02]]), '#f4efe4', { lw: .02, hi: false });
      A.line(g, [[-.2, 0], [.2, 0]], .02, 'rgba(0,0,0,.3)');
    } else {
      A.cel(g, A.blob([[-.27, 0], [.27, 0], [.25, top + .12], [0, top - .02], [-.25, top + .12]]), '#3a3430', { sk: .7 });
      if (v !== 'b') { A.cel(g, A.poly([[-.07, top + .02], [0, top + .26], [.07, top + .02]]), '#f4f0e8', { lw: .02, hi: false }); A.line(g, [[0, top + .04], [0, top + .24]], .035, '#5a1a1a'); for (const y of [top + .36, top + .5]) A.dot(g, 0, y, .018, '#8a8a90'); }
    }
  };
  const box = { kropp: [1.3, 1.5, .65, .5] };
  MONSTER_ART.blank_m = { hode: hode(false, false), kropp: kropp(false) };
  MONSTER_ART.blank_k = { hode: hode(false, true), kropp: kropp(true), box };
  MONSTER_ART.ansikt_m = { hode: hode(true, false), kropp: kropp(false) };
  MONSTER_ART.ansikt_k = { hode: hode(true, true), kropp: kropp(true), box };
}

/* musikken: en spilledåse som går for sakte, og noe langsomt og rødt til slutt */
Object.assign(STYKKER, {
  drom: { bpm: 44, takt: 3, rot: 57, skala: 'harm', akk: [0, 3, 0, 5, 3, 4, 0, 4], mel: 'spilledaase', stil: 'vals', knitr: .35, tetthet: .5, grammofon: true },
  losje: { bpm: 38, takt: 4, rot: 44, skala: 'frygisk', akk: [0, 1, 0, 6, 5, 1, 0, 0], mel: 'orgel', stil: 'sakte', tetthet: .3 }
});

/* ============================================================
   STYRINGEN
   ============================================================ */
const Drom = {
  kap: 0, S: null, minner: [], figurer: [], skygge: null, dor: null, t: 0, slutter: false,
  historie() {
    const run = G.run; if (!run) return null;
    if (!run.historie) {
      const rng = mulberry32(((run.seed >>> 0) * 31 + 7) >>> 0), velg = a => a[Math.floor(rng() * a.length)];
      const hjem = velg(Object.keys(DROM_HJEM)), rolle = velg(Object.keys(DROM_ROLLER)), R0 = DROM_ROLLER[rolle], kjonn = R0.kjonn === '?' ? (rng() < .5 ? 'k' : 'm') : R0.kjonn;
      run.historie = { hjem, rolle, kjonn, navn: velg(DROM_NAVN[kjonn]), hendelse: velg(DROM_HJEM[hjem].hendelser), skyld: velg(Object.keys(DROM_SKYLD)), tegn: velg(Object.keys(DROM_TEGN)), felles: velg(DROM_FELLES), valg: {}, sett: 0 };
    }
    return run.historie;
  },
  /* alt tekstene trenger, med riktige pronomen */
  ord(H) {
    const hj = DROM_HJEM[H.hjem], R0 = DROM_ROLLER[H.rolle], hv = DROM_HENDELSE[H.hendelse], st = DROM_STED[H.hendelse], T = DROM_TEGN[H.tegn], k = H.kjonn === 'k';
    const S = { N: H.navn, hun: k ? 'hun' : 'han', Hun: k ? 'Hun' : 'Han', henne: k ? 'henne' : 'ham', hennes: k ? 'hennes' : 'hans', din: R0.din, kort: R0.kort, lukt: hj.lukt, hjem: hj.tekst, fra: hj.fra, felles: H.felles,
      tegn: T.ub, tegnB: T.best, den: T.den, sted: st.navn(hj), stedTil: st.til(hj), vaer: hv.vaer, vaerType: H.hendelse === 'brann' ? 'brann' : st.vaer || 'regn', lyd: typeof hv.lyd === 'function' ? hv.lyd(hj) : hv.lyd, hendelse: hv.kort(hj),
      hjemRom: hj.rom, stedRom: st.rom, skyld: DROM_SKYLD[H.skyld] };
    S.tegnLinje = n => T.linjer(S)[n];
    return S;
  },
  /* startFloor spør: skal det drømmes før denne etasjen? */
  lag(depth) {
    const run = G.run; if (!run || run.dromVent !== depth || depth < 2) return null;
    const H = this.historie(), fra = depth - 1, kap = fra >= 5 ? 5 : Math.min(4, (H.sett || 0) + 1);
    const S = this.ord(H), K = DROM_KAP[kap], tm = DROM_TEMA[K.tema];
    const tema = Object.assign({}, THEMES[2], { name: 'Drømmen: ' + K.navn, wall: tm.wall, wains: tm.wains, pool: tm.pool, fog: tm.fog, grade: tm.grade, corr: Col.dark(tm.wall, .7), cap: Col.dark(tm.wains, .7) });
    const F = this.etasje(kap, K.rom(S), S, run.seed + depth * 131);
    F.taake = (H.hendelse === 'taake' && kap === 3) ? [.55, '#c8c8d8'] : tm.taake;
    F.vaer = kap === 3 ? DROM_STED[H.hendelse].vaer : kap === 4 ? 'regn' : kap === 5 ? null : 'klart';
    return { kap, fra, H, S, K, F, tema, musikk: kap === 5 ? 'losje' : 'drom', undertittel: 'Kapittel ' + kap + ' av 5' };
  },
  /* den lille etasjen: tre rom på rad, forbundet med korte ganger langs midtlinja */
  etasje(kap, romDef, S, seed) {
    const W = 50, H = 26, rng = mulberry32(seed >>> 0), F = { seed, depth: G.depth, W, H, tiles: new Uint8Array(W * H), roomId: new Int16Array(W * H).fill(-1), block: new Uint8Array(W * H), rooms: [], edges: [[0, 1], [1, 2]], adj: [[1], [0, 2], [1]], startId: 0, bossId: 2, crack: [], ute: false, drom: kap };
    const rammer = [[3, 8, 11, 10], [19, 8, 11, 10], [35, 7, 12, 12]], MID = 13;
    rammer.forEach(([x, z, w, h], i) => {
      const d = romDef[i], r = { id: i, ci: i, cj: 0, role: i ? 'drom' : 'start', template: 'drom', props: [], waves: [], doors: [], spawns: [], x, z, w, h, cx: x + (w >> 1), cz: MID, gulv: d[1], vegg: d[2], ute: !!d[3], navn: d[0] };
      F.rooms.push(r); for (let zz = z; zz < z + h; zz++) for (let xx = x; xx < x + w; xx++) { F.tiles[zz * W + xx] = T_ROOM; F.roomId[zz * W + xx] = i; }
    });
    for (const [x0, x1] of [[14, 18], [30, 34]]) for (let z = MID - 1; z <= MID + 1; z++) for (let x = x0; x <= x1; x++) F.tiles[z * W + x] = T_COR;
    for (const r of F.rooms) for (let z = r.z - 1; z <= r.z + r.h; z++) for (let x = r.x - 1; x <= r.x + r.w; x++) { const i = z * W + x; if (F.tiles[i] !== T_COR) continue; if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => F.roomId[(z + dz) * W + x + dx] === r.id)) r.doors.push(i); }
    const r0 = F.rooms[0]; F.korridor = { gulv: kap === 5 ? 'sikksakk' : r0.gulv === 'teppe' ? 'tre' : r0.gulv, vegg: kap === 5 ? 'forheng' : r0.ute ? 'gjerde' : r0.vegg };
    // plassene: minnet under overveggen, figurer nede, midtlinja fri. Det siste rommet har døra og personen.
    F.dromPlass = { minner: [], figurer: [], dor: null, person: null, skygge: null };
    const opptatt = new Set(), fri = (x, z) => !opptatt.has(z * W + x) && Math.abs(z - MID) > 1;
    F.rooms.forEach((r, i) => {
      const mx = i === 2 ? r.cx - 3 : r.cx + (i ? 2 : -2), mz = r.z + 2; F.dromPlass.minner.push({ x: mx + .5, z: mz + .5 }); opptatt.add(mz * W + mx); F.block[mz * W + mx] = 1;
      if (i === 2) { F.dromPlass.dor = { x: r.cx + .5, z: r.z + .5 }; for (let dx = -1; dx <= 1; dx++) opptatt.add(r.z * W + r.cx + dx), opptatt.add((r.z + 1) * W + r.cx + dx); F.dromPlass.person = { x: r.cx + 2.5, z: r.z + 3.5 }; F.dromPlass.skygge = { x: r.cx + .5, z: r.z + 3.2 }; opptatt.add((r.z + 3) * W + r.cx + 2); }
      // tingene fra hjemmet langs veggene
      const ting = romDef[i][4] || [], plasser = [];
      for (let x = r.x + 1; x < r.x + r.w - 1; x += 2) plasser.push([x, r.z, 0]);
      for (let x = r.x + 1; x < r.x + r.w - 1; x += 3) plasser.push([x, r.z + r.h - 1, Math.PI]);
      const stokk = plasser.map(p => [rng(), p]).sort((a, b) => a[0] - b[0]).map(p => p[1]);
      let n = 0;
      for (const k of ting) {
        const fot = { bed: [1, 2], langbord: [3, 1], piano: [2, 1], robat: [2, 1], kjerre: [2, 1], bench: [2, 1], pew: [2, 1], desk: [2, 1], shelf: [2, 1], wardrobe: [2, 1], vedstabel: [2, 1], komfyr: [2, 1], ruinmur: [2, 1], torkesnor: [2, 1] }[k] || [1, 1];
        for (const [x, z, rot] of stokk) {
          const tiles = []; for (let dz = 0; dz < fot[1]; dz++) for (let dx = 0; dx < fot[0]; dx++) tiles.push([x + dx, rot ? z - dz : z + dz]);
          if (!tiles.every(([tx, tz]) => tx > r.x && tx < r.x + r.w - 1 && tz >= r.z && tz < r.z + r.h && fri(tx, tz))) continue;
          for (const [tx, tz] of tiles) { opptatt.add(tz * W + tx); if (!['candles', 'siv', 'vak', 'lyktestolpe'].includes(k)) F.block[tz * W + tx] = 1; }
          const px = tiles.reduce((a, t) => a + t[0], 0) / tiles.length + .5, pz = tiles.reduce((a, t) => a + t[1], 0) / tiles.length + .5;
          r.props.push({ k, x: px, z: pz, rot, fw: fot[0], fd: fot[1], navn: n }); n++; break;
        }
      }
      // figurene står nede i rommet, i kapittel 3 på rad og vendt mot det som skjer
      const rekke = kap === 3 && i === 1;
      if (i < 2) for (const x of rekke ? [r.x + 2, r.x + 5, r.x + 8] : [r.x + 2, r.x + r.w - 3]) { const z = rekke ? MID + 3 : r.z + r.h - 3; if (!fri(x, z)) continue; opptatt.add(z * W + x); F.dromPlass.figurer.push({ x: x + .5, z: z + .5, rom: i }); }
    });
    return F;
  },
  /* etter at etasjen er bygget: minnene, figurene, personen, skyggen og døra */
  oppsett() {
    const D = G.drom; if (!D) return; const { S, K, F, kap } = D, P0 = F.dromPlass;
    this.kap = kap; this.S = S; this.t = 0; this.sist = -9; this.slutter = false; this.minner = []; this.figurer = []; this.skygge = null; this.dor = null;
    Sound.stopAmbience();
    // minnene
    K.minner(S).forEach((m, i) => {
      const p = P0.minner[i], P = this.art(m.art, S), g = propSprite(null, p.x, p.z + .2, { P, tint: m.knust ? '#6a5a70' : null }); R.level.add(g);
      const lys = R.light(p.x, p.z + .4, 2.2, '#ffe6b0', .5, R.levelL);
      this.minner.push({ i, x: p.x, z: p.z, g, lys, m, P, funnet: false });
    });
    // figurene
    const linjer = shuf(K.figurer(S));
    P0.figurer.forEach((p, i) => { if (!linjer.length && !K.vendt) return; this.figur(pick(['blank_m', 'blank_k']), p.x, p.z, { linje: linjer[i % Math.max(1, linjer.length)], vend: K.vendt ? Math.PI : K.rekke ? Math.PI / 2 : undefined }); });
    // en pasient fra før, i sin egen drøm som går over i din
    const tidl = (G.meta.historie || []).filter(h => h.drom && h.drom.N && h.name !== G.run.patient.name);
    if (tidl.length && kap <= 4 && P0.figurer.length) { const h = tidl[tidl.length - 1], p = P0.figurer[0]; const f = this.figurer.find(f => f.x === p.x && f.z === p.z); if (f) { f.linje = `Jeg er ${h.name.split(' ')[0]}. Jeg var fra ${h.drom.fra}. Jeg drømte om ${h.drom.kort} ${h.drom.N} hver natt. Ikke bli her for lenge.`; f.navn = h.name; FX.label(f, h.name, 'npc'); } }
    // personen
    if (K.personen) { const p = P0.person, f = this.figur((K.personen === 'ansikt' ? 'ansikt_' : 'blank_') + (D.H.kjonn === 'k' ? 'k' : 'm'), p.x, p.z, { linje: K.hilsen, person: true }); FX.label(f, S.N, 'npc'); }
    // skyggen: pasienten selv, i svart. I kapittel 5 står den med ryggen til og venter.
    const sk = kap === 5 ? P0.skygge : { x: F.rooms[0].x + 1.5, z: 13.5 }, d = ekstraDukke(Pasient.dukke(G.run.look, { tint: '#140c1a', noShadow: true }));
    d.root.position.set(sk.x, 0, sk.z); d.root.visible = kap === 5; R.scene.add(d.root);
    this.skygge = { kind: 'skygge', x: sk.x, z: sk.z, r: .35, doll: d, alive: true, bubbleH: 2.2, aktiv: false, pratT: 3, prat: 0 };
    if (kap === 5) d.setFacing(Math.PI);
    // døra
    const dp = P0.dor, g = propSprite(null, dp.x, dp.z + .15, { P: DROM_ART.dor(false), shadow: false }); R.level.add(g);
    this.dor = { x: dp.x, z: dp.z + 1.1, g, aapen: false, lys: null };
    // innledningen
    setTimeout(() => { if (G.drom !== D) return; Samtale.vis({ tittel: 'Kapittel ' + kap + ': ' + K.navn, bilde: () => this.portrett(), tekst: (DROM_UTGANG[D.fra] || '') + '\n' + K.intro(S), valg: [
      { tekst: 'Se deg rundt', hint: 'Finn tre minner. Noe følger etter deg.' },
      { tekst: 'Våkn med en gang', hint: 'Hopp over drømmen', gjor: () => { this.vaakne('flukt', false); return null; } }] }); }, 250);
  },
  figur(type, x, z, o = {}) {
    const d = ekstraDukke(new Doll(type, { shadow: .42 })); d.root.position.set(x, 0, z); R.scene.add(d.root);
    const f = { kind: 'figur', x, z, doll: d, alive: true, bubbleH: 2.3, linje: o.linje || null, person: !!o.person, vend: o.vend, sagt: false };
    if (o.vend !== undefined) d.setFacing(o.vend);
    this.figurer.push(f); return f;
  },
  art(n, S) {
    if (n === 'tegn') return DROM_ART[G.drom.H.tegn]();
    if (n.startsWith('vindu:')) return DROM_ART.vindu(n.slice(6));
    if (n === 'kaape') return DROM_ART.kaape(G.drom.H.kjonn === 'k' ? '#7a2a2e' : '#4a4a52');
    if (n === 'grammofon') return ROM_ART.grammofon();
    return (DROM_ART[n] || DROM_ART.brev)();
  },
  portrett() { return hendBilde(DROM_ART[(G.drom || {}).H ? G.drom.H.tegn : 'lue'](), '#120c16'); },
  interact(consider) {
    if (!G.drom || this.slutter) return; const P = G.player; if (!P) return;
    for (const m of this.minner) if (!m.funnet) consider(Math.hypot(m.x - P.x, m.z - P.z) - .8, { t: 'Husk: ' + m.m.tittel.toLowerCase(), fn: () => this.husk(m) });
    if (this.dor && this.dor.aapen) consider(Math.hypot(this.dor.x - P.x, this.dor.z - P.z) - .9, { t: 'Gå mot døra', fn: () => this.valget() });
  },
  husk(m) {
    m.funnet = true; R.remove(m.lys); m.lys = null; const n = this.minner.filter(x => x.funnet).length, kap = this.kap;
    Samtale.vis({ tittel: m.m.tittel, bilde: () => { const c = hendBilde(m.P, '#120c16'); return m.m.knust ? knustBilde(c) : c; }, tekst: m.m.tekst, valg: [{ tekst: n < 3 ? 'Legg det fra deg' : 'Se deg rundt' }] });
    Sound.play('paper');
    if (n === 1 && kap < 5) { const sk = this.skygge, P = G.player, langt = G.drom.F.rooms.slice().sort((a, b) => d2(b.cx, b.cz, P.x, P.z) - d2(a.cx, a.cz, P.x, P.z))[0]; sk.x = langt.x + 1.5; sk.z = 13.5; sk.doll.root.position.set(sk.x, 0, sk.z); sk.doll.root.visible = true; sk.aktiv = true; setTimeout(() => toast('Noe følger etter deg', 'Ikke la det ta deg igjen'), 400); }
    if (n === 3) this.aapneDor();
  },
  aapneDor() {
    const D = this.dor; if (!D || D.aapen) return; D.aapen = true; R.remove(D.g);
    D.g = propSprite(null, D.x, D.z - .95, { P: DROM_ART.dor(true), shadow: false }); R.level.add(D.g); D.lys = R.light(D.x, D.z - .4, 3.2, '#ffe0a0', .8, R.levelL);
    Sound.play('door', .6, .7); setTimeout(() => toast('En dør står åpen', 'I det siste rommet'), 900);
    if (this.kap === 5) { const s = this.skygge; s.snudd = true; s.doll.setFacing(0); s.doll.U.uTint.value.set('#ffffff'); s.doll.U.tint0 = s.doll.U.uTint.value.clone(); FX.bubble(s, 'Nå vet du.', 3); }
  },
  valget() {
    const v = this.K().valg(this.S), person = this.figurer.find(f => f.person);
    Samtale.vis({ tittel: this.kap === 4 ? 'Skyggen' : this.S.N, bilde: () => this.kap === 4 ? this.portrett() : hendFigur(person ? person.doll.type : 'blank_m'), baklengs: v.baklengs, tekst: v.tekst,
      valg: v.valg.map(o => ({ tekst: o.tekst, gjor: () => { this.slutter = true; return { tekst: o.svar, valg: [{ tekst: 'Våkn', gjor: () => { this.vaakne(o.slutt, false); return null; } }] }; } })) });
  },
  K() { return DROM_KAP[this.kap]; },
  /* drømmen er over: valget huskes, og den virkelige etasjen bygges */
  vaakne(slutt, tatt) {
    const D = G.drom; if (!D || D.ferdig) return; D.ferdig = true; this.slutter = true;
    const H = D.H; H.valg[D.kap] = slutt; H.sett = Math.max(H.sett || 0, D.kap);
    if (tatt) addMorb(25);
    this.fade(1, () => { const d = G.depth; G.run.dromVent = 0; startFloor(d, false); if (tatt) setTimeout(() => toast('Du våknet for tidlig', 'Skyggen tok deg igjen. Du har Morbidium i blodet.'), 1600); this.fade(0); });
  },
  /* for testene: hopp rett ut av drømmen med et valg */
  hopp(slutt = 'sannheten') { const D = G.drom; if (!D) return; if (G.state === 'panel') closePanel(); D.ferdig = true; D.H.valg[D.kap] = slutt; D.H.sett = Math.max(D.H.sett || 0, D.kap); G.run.dromVent = 0; startFloor(G.depth, false); },
  fade(til, fn) {
    let el = document.getElementById('dromfade'); if (!el) { el = document.createElement('div'); el.id = 'dromfade'; document.body.appendChild(el); }
    el.style.opacity = til; if (fn) setTimeout(fn, 1100);
  },
  tick(dt) {
    if (!G.drom || !G.player) return; const P = G.player; this.t += dt;
    for (const f of this.figurer) {
      const dx = P.x - f.x, dz = P.z - f.z, d = Math.hypot(dx, dz);
      if (f.vend === undefined && d < 7) f.doll.setFacing(Math.atan2(dx, dz));
      f.doll.update(dt, { speed: 0 }); f.doll.root.position.set(f.x, 0, f.z);
      if (f.linje && !f.sagt && d < 3.2 && this.t - this.sist > 3.2) { f.sagt = true; this.sist = this.t; FX.bubble(f, f.linje, 3.6); } // én snakker om gangen
    }
    for (const m of this.minner) if (m.lys) R.setLight(m.lys, .42 + Math.sin(this.t * 2.4 + m.i) * .12);
    if (this.dor && this.dor.lys) R.setLight(this.dor.lys, .75 + Math.sin(this.t * 3) * .1);
    const s = this.skygge; if (!s) return;
    if (s.aktiv && !this.slutter) {
      let tx = P.x, tz = P.z; if (!los(s.x, s.z, P.x, P.z)) { tx = clamp(P.x, s.x - 3, s.x + 3); tz = 13.5; } // midtlinja går gjennom alle rommene og gangene
      const dx = tx - s.x, dz = tz - s.z, L = Math.hypot(dx, dz) || 1, v = this.kap === 4 ? 2.3 : 1.75;
      moveEnt(s, dx / L * v * dt, dz / L * v * dt); s.doll.setFacing(Math.atan2(dx, dz)); s.doll.update(dt, { speed: v }); s.doll.root.position.set(s.x, 0, s.z);
      if (this.kap === 4 && (s.pratT -= dt) <= 0) { const jeg = this.S.skyld.jeg(this.S); s.pratT = 6; FX.bubble(s, jeg[s.prat++ % jeg.length], 3.4); }
      if (Math.hypot(P.x - s.x, P.z - s.z) < .85) { FX.bubble(P, 'Nei. Ikke ennå.', 1.4); this.vaakne('flukt', true); }
    } else { s.doll.update(dt, { speed: 0 }); if (this.kap === 5 && !s.snudd) s.doll.setFacing(Math.PI); }
  },
  fjern() {
    for (const f of this.figurer) { f.alive = false; f.doll.dispose(); } this.figurer = [];
    if (this.skygge) { this.skygge.alive = false; this.skygge.doll.dispose(); this.skygge = null; }
    this.minner = []; this.dor = null;
  },
  /* slutten: det som kom oftest, og kapittel 5 teller dobbelt. Uavgjort går til kapittel 5. */
  slutt(H = G.run && G.run.historie) {
    if (!H) return 'fornektelse'; const t = { tilgivelse: 0, sannheten: 0, gjentakelse: 0, fornektelse: 0 };
    for (const [k, v] of Object.entries(H.valg || {})) { const n = v === 'flukt' ? 'fornektelse' : v; if (n in t) t[n] += +k === 5 ? 2 : 1; }
    const siste = H.valg && H.valg[5] === 'flukt' ? 'fornektelse' : H.valg && H.valg[5];
    return Object.keys(t).sort((a, b) => t[b] - t[a] || (a === siste ? -1 : b === siste ? 1 : 0))[0];
  },
  /* det som skrives i pasientmappa: så mye av historien som pasienten har drømt */
  mappe(utskrevet) {
    const H = G.run && G.run.historie; if (!H || !H.sett) return null;
    const S = this.ord(H), fn = G.run.patient.name.split(' ')[0], deler = ['Fra ' + S.fra + '.'];
    if (H.sett >= 3) deler.push(`${cap(S.kort)} ${S.N} ${S.hendelse}.`); else if (H.sett >= 2) deler.push(`Drømte om ${S.kort} ${S.N}.`);
    if (H.sett >= 4) deler.push(`${fn} ${S.skyld.kort}.`);
    if (utskrevet) deler.push(DROM_SLUTT[this.slutt(H)].mappe);
    return { tekst: deler.join(' '), fra: S.fra, kort: S.kort, N: S.N, slutt: utskrevet ? this.slutt(H) : null };
  },
  /* etterordet ved utskrivningen, før brevet */
  epilog(videre) {
    const H = G.run.historie, S = this.ord(H), sl = DROM_SLUTT[this.slutt(H)];
    openPanel(`<div class="paper samtale"><div class="sbilde"></div><div class="sinnhold"><div class="stittel">${esc(sl.navn)}</div><div class="stekst">${sl.tekst(S).split('\n').map(t => `<p>${esc(t)}</p>`).join('')}</div><div class="svalg"><button id="epOk"><b>1</b> Gå ut porten</button></div></div></div>`);
    try { document.querySelector('.samtale .sbilde').appendChild(this.portrettFor(H)); } catch (e) { }
    $('epOk').onclick = () => videre(); $('epOk').focus(); Sound.play('paper');
  },
  portrettFor(H) { return hendBilde(DROM_ART[H.tegn](), '#120c16'); }
};

/* ---------- krokene ---------- */
// utgangen etter sjefen: drømmen venter før neste etasje
{ const _d = descend; descend = function () { const P = G.player; if (P && P.alive && !G.drom && G.run && G.depth < MAX_DEPTH) G.run.dromVent = G.depth + 1; _d(); }; }
{ const _sf = startFloor; startFloor = function (depth, first) { _sf(depth, first); if (G.drom) try { Drom.oppsett(); } catch (e) { console.warn('drøm', e); } }; }
{ const _cf = clearFloor; clearFloor = function () { Drom.fjern(); _cf(); }; }
// utskrivningen: slutten på historien før brevet
{ const _ub = utskrivningsbrev; utskrivningsbrev = function (onDone) { const H = G.run && G.run.historie; if (!H || !H.sett) return _ub(onDone); Drom.epilog(() => _ub(onDone)); }; }
