/* ============================================================
   HISTORIEN  -  Hellraiser møter Twin Peaks, på et norsk sanatorium i 1923
   Under Morbidium sanatorium er det ikke fjell, men et hav som er eldre enn fjorden.
   Der sover den første pasienten, nr. 0, og drømmer. Når det gjør vondt i den, drømmer
   den mennesker. Når det gjør veldig vondt, drømmer den sykehus.
   - Høsten 1886 kjøpte dr. Mathias Morbeck en protokoll i sort skinn på auksjon i Bergen.
     Den var funnet i buken på en hval skutt utenfor Røst. Journalen er en lås: hvert navn
     som skrives i den, vrir den et hakk. Morbeck bygde sanatoriet på kollen over havet,
     fordi journalen ville det.
   - I 1887 vred han låsen helt rundt og ba om den fullkomne kur. En liten bjelle ringte, og
     Avdeling Null kom opp fra Dypet: leger som har behandlet smerte så lenge at de ble
     behandlingen, med kitler sydd fast i huden og kroker i kjeder. De ga ham kuren. Nå sitter
     han sydd fast til stolen med sølvkroker og leser høyt for den som sover, så den ikke våkner.
   - Morbidium er det den sovende blør når den drømmer vondt. Det stiger opp gjennom avløpene
     og liker smerte, og stolthet enda bedre. Pasientene er drømmene dens. Hver av dem slipper
     ut ved å lese sin egen journal ferdig, og Avdeling Null venter på at alle skal gjøre det.
   - Mellom søvnen og drømmen ligger Venterommet: røde forheng, gulv i sikksakk, og en liten
     lege i en altfor stor kittel som snakker baklengs og byr på kaffe som smaker sjø.
   Slik kommer det fram:
   - En journalside før hver drøm (fem i alt), med sjefen som ble behandlet, en bit av
     sannheten og hva Journalen syntes om forrige valg.
   - Forstanderen i Dypet: spør, les over skulderen, ta pennen (en krok av sølv), eller løs ham
     fra krokene og se kjettingene hente ham.
   - Venterommet bak et forheng i veggen, og Morbecks instrumentskrin, som kan vris opp.
     Kjettinger med kroker kommer ut av mørket (Kjeder), med en bjelle først.
   - Sjefene har en ny tale ved en tredjedel helse, slengord og siste ord.
   - Høyttaleren, koret, radioen og personalet vet mer enn de burde.
   - Ni nye journalfragmenter: auksjonen, forstanderens notater, byggmesteren, Olsen, en
     styrmann som så en by stige opp av havet, et brev fra universitetet og hele historien.
   - Siste side og brevet følger slutten fra drømmene. Gjentakelse gir et innkallingsbrev.
   ============================================================ */

/* ---------- bildene til historien (reserver til ChatGPT leverer historie_*.png og prop_*.png) ---------- */
const HISTORIE_ART = {
  // side 1: innleggelsesskjemaet med stempel og penn
  historie_1: () => Art.part('historie_1', 2.4, 1.8, 1.2, .05, g => {
    A.cel(g, A.poly([[-.95, -.1], [.8, -.18], [.9, -1.62], [-.85, -1.56]]), '#efe4c4', { line: INK, lw: .05 });
    for (let i = 0; i < 7; i++) A.line(g, [[-.7, -1.35 + i * .16], [.62 + (i % 3) * .05, -1.4 + i * .16]], .025, 'rgba(60,40,30,.45)');
    A.cel(g, A.rr(-.6, -1.5, .5, .1, .02), '#2a1a14', { lw: 0, hi: false });
    g.save(); g.translate(.3, -.55); g.rotate(-.18); A.flat(g, A.rr(-.42, -.14, .84, .28, .04), 'rgba(179,38,30,.12)', .05, '#b3261e'); g.fillStyle = '#b3261e'; g.font = 'bold .17px Georgia'; g.textAlign = 'center'; g.fillText('INNLAGT', 0, .06); g.restore();
    A.line(g, [[.65, -.3], [1.1, -1.25]], .07, '#1a1a1a'); A.line(g, [[.62, -.24], [.66, -.32]], .04, '#c8a048');
  }),
  // side 2: journalen i sort skinn med sømmer, på hvalribbeinet den ble funnet ved
  historie_2: () => Art.part('historie_2', 2.4, 1.8, 1.2, .05, g => {
    A.curve(g, [-1.12, -.1], [0, -.62], [1.12, -.1], .16, '#e8dcc0'); A.curve(g, [-1.12, -.1], [0, -.62], [1.12, -.1], .03, 'rgba(60,40,30,.5)');
    A.cel(g, A.rr(-.72, -1.62, 1.44, 1.3, .08), '#1c1416', { line: INK, lw: .06, sk: .6 });
    for (let i = 0; i < 9; i++) { const y = -1.52 + i * .14; A.line(g, [[-.66, y], [-.6, y + .05]], .02, '#8a6a5a'); A.line(g, [[.6, y], [.66, y + .05]], .02, '#8a6a5a'); }
    A.flat(g, A.rr(-.56, -1.48, 1.12, 1.02, .05), null, .03, '#8a6a3a');
    g.save(); g.fillStyle = '#c8a048'; g.font = 'bold .24px Georgia'; g.textAlign = 'center'; g.fillText('1887', 0, -.98); g.font = 'italic .14px Georgia'; g.fillText('M.', 0, -.74); g.restore();
    A.cel(g, A.rr(.68, -1.3, .08, .62, .02), '#6a1a1a', { lw: .02, hi: false });
    A.line(g, [[-1.0, -.4], [-.5, -1.05]], .06, '#2a2a2a'); A.dot(g, -1.02, -.37, .05, '#6b2d8c');
  }),
  // side 3: havet under grunnmuren, og den som sover i det
  historie_3: () => Art.part('historie_3', 2.4, 1.8, 1.2, .05, g => {
    A.cel(g, A.rr(-1.1, -1.72, 2.2, .3, .02), '#6a5448', { line: INK, lw: .04, hi: false });
    for (let i = 0; i < 6; i++) A.line(g, [[-1.05 + i * .42, -1.72], [-1.05 + i * .42, -1.42]], .02, 'rgba(30,20,16,.6)');
    A.cel(g, A.poly([[-1.1, -1.42], [1.1, -1.42], [1.1, -.05], [-1.1, -.05]]), '#0e1a24', { line: INK, lw: .04, hi: false, soft: false });
    for (let i = 0; i < 4; i++) A.curve(g, [-1.0, -1.3 + i * .3], [0, -1.38 + i * .3], [1.0, -1.3 + i * .3], .015, 'rgba(120,160,190,.35)');
    A.cel(g, A.blob([[-.95, -.1], [-.7, -.62], [-.2, -.86], [.3, -.84], [.8, -.6], [.98, -.1]]), '#2a3a44', { line: '#0a1016', lw: .035, hi: false });
    A.curve(g, [-.36, -.52], [0, -.36], [.36, -.52], .04, '#0a1016');
    for (let i = 0; i < 5; i++) { const b = Math.sin(i / 4 * Math.PI) * .05; A.line(g, [[-.28 + i * .14, -.44 - b], [-.3 + i * .15, -.36 - b]], .02, '#0a1016'); }
    for (const [x, y, s] of [[-.8, -.95, 1], [.75, -1.0, -1], [.55, -1.25, 1]]) A.curve(g, [x, y + .1], [x + .25 * s, y - .15], [x + .08 * s, y - .3], .05, '#34485a');
    for (let i = 0; i < 6; i++) A.dot(g, -.8 + i * .32, -1.1 - (i % 2) * .12, .03, 'rgba(180,110,230,.8)');
  }),
  // side 4: Avdeling Null. En kittel med instrumentene sydd inn, kroker i kjeder og en liten sølvbjelle
  historie_4: () => Art.part('historie_4', 2.4, 2.2, 1.2, .05, g => {
    for (const x of [-.95, -.6, .62, .97]) {
      const d = x < 0 ? .06 : -.06, y1 = -1.2 - Math.abs(x) * .1;
      A.line(g, [[x, -2.15], [x + d, y1]], .045, '#2a2624');
      for (let k = 0; k < 7; k++) { const t = k / 7, xx = x + d * t, yy = -2.1 + (y1 + 2.1) * t; A.line(g, [[xx - .025, yy], [xx + .025, yy + .06]], .018, 'rgba(210,210,220,.5)'); }
      A.curve(g, [x + d, y1], [x + d + .14, y1 + .2], [x + d - .02, y1 + .22], .045, '#2a2624');
    }
    A.line(g, [[0, -1.98], [0, -1.8]], .04, '#2a2624'); A.curve(g, [-.14, -1.78], [0, -1.92], [.14, -1.78], .04, '#2a2624');
    A.cel(g, A.poly([[-.36, -1.78], [.36, -1.78], [.46, -.3], [-.46, -.3]]), '#d8d0c0', { line: INK, lw: .05 });
    for (let i = 0; i < 7; i++) A.line(g, [[-.3, -1.6 + i * .18], [-.24, -1.56 + i * .18]], .018, '#7a1d18');
    for (const [x, y, a] of [[-.08, -1.4, .3], [.16, -1.18, -.4], [-.1, -.9, .6], [.18, -.66, -.2]]) { g.save(); g.translate(x, y); g.rotate(a); A.line(g, [[-.12, 0], [.12, 0]], .03, '#8a9098'); A.line(g, [[.12, 0], [.16, -.03]], .02, '#8a9098'); g.restore(); }
    A.cel(g, A.poly([[.74, -.62], [.9, -.62], [.95, -.38], [.69, -.38]]), '#c8c8d0', { line: INK, lw: .03 }); A.dot(g, .82, -.34, .035, '#3a3a40'); A.line(g, [[.82, -.62], [.82, -.72]], .03, '#3a3a40');
  }),
  // side 5: siste side, åpen, med et stearinlys
  historie_5: () => Art.part('historie_5', 2.4, 1.8, 1.2, .05, g => {
    A.cel(g, A.poly([[-1.05, -.25], [0, -.1], [0, -1.3], [-1.0, -1.45]]), '#f0e6cc', { line: INK, lw: .045, hi: false });
    A.cel(g, A.poly([[1.05, -.25], [0, -.1], [0, -1.3], [1.0, -1.45]]), '#e8dcc0', { line: INK, lw: .045, hi: false });
    for (let i = 0; i < 6; i++) { A.line(g, [[-.85, -1.25 + i * .16], [-.15, -1.15 + i * .16]], .022, 'rgba(40,30,30,.55)'); if (i < 3) A.line(g, [[.15, -1.15 + i * .16], [.8, -1.25 + i * .16]], .022, 'rgba(40,30,30,.55)'); }
    A.curve(g, [.2, -.62], [.45, -.55], [.62, -.66], .03, '#6b2d8c');
    A.cel(g, A.rr(.78, -.72, .12, .5, .02), '#f0e8d0', { lw: .025, hi: false }); A.flat(g, A.ell(.84, -.82, .05, .09), '#ffcf5a', .015);
  }),
  // slutten: fire bilder, ett for hver slutt
  historie_slutt_tilgivelse: () => Art.part('historie_slutt_tilgivelse', 2.4, 1.8, 1.2, .05, g => {
    A.flat(g, A.rr(-.3, -1.5, .6, 1.45, .3), '#fff4d0', 0);
    for (const s of [-1, 1]) { A.line(g, [[s * .3, -.05], [s * .3, -1.3]], .06, '#26262a'); A.curve(g, [s * .3, -1.3], [s * .15, -1.62], [0, -1.55], .05, '#26262a'); A.line(g, [[s * .3, -.05], [s * .75, -.05]], .05, '#26262a'); for (let k = 0; k < 3; k++) A.line(g, [[s * (.45 + k * .12), -.05], [s * (.45 + k * .12), -.9 + k * .1]], .035, '#26262a'); }
    A.flat(g, A.ell(0, -.12, .07, .04), '#2a1a14', 0); A.line(g, [[0, -.12], [0, -.5]], .05, '#2a1a14'); A.dot(g, 0, -.57, .07, '#2a1a14');
  }),
  // sannheten: en skikkelse på steinkaia i regnet, og havet som puster inn
  historie_slutt_sannheten: () => Art.part('historie_slutt_sannheten', 2.4, 1.8, 1.2, .05, g => {
    A.cel(g, A.poly([[-1.15, -.6], [1.15, -.6], [1.15, -.05], [-1.15, -.05]]), '#141c26', { line: INK, lw: .03, hi: false, soft: false });
    A.curve(g, [-1.1, -.64], [.25, -1.12], [1.1, -.64], .05, '#2a3a4c');
    A.cel(g, A.rr(-1.15, -.4, 1.1, .35, .02), '#5a5850', { line: INK, lw: .03, hi: false });
    for (let i = 0; i < 22; i++) { const x = -1 + (i * .37) % 2, y = -1.6 + (i * .53) % 1.1; A.line(g, [[x, y], [x - .06, y + .2]], .018, 'rgba(120,150,200,.75)'); }
    A.line(g, [[-.5, -.42], [-.5, -.78]], .07, '#2a2a30'); A.dot(g, -.5, -.88, .08, '#2a2a30');
  }),
  // gjentakelse: senga er redd opp, med et nytt skjema og en liten bjelle
  historie_slutt_gjentakelse: () => Art.part('historie_slutt_gjentakelse', 2.4, 1.8, 1.2, .05, g => {
    A.cel(g, A.rr(-.8, -.75, 1.6, .5, .05), '#e8e8e4', { line: INK, lw: .04 }); A.cel(g, A.rr(-.8, -.6, 1.6, .35, .04), '#6a8ab8', { line: INK, lw: .035, hi: false });
    for (const x of [-.8, .8]) A.line(g, [[x, -.1], [x, -1.05]], .06, '#3a3a40'); A.line(g, [[-.8, -1.0], [.8, -1.0]], .05, '#3a3a40');
    A.cel(g, A.rr(.25, -1.35, .5, .3, .03), '#efe4c4', { line: INK, lw: .03, hi: false }); A.line(g, [[.33, -1.25], [.66, -1.25]], .02, '#2a1a14'); A.line(g, [[.33, -1.17], [.6, -1.17]], .02, '#2a1a14');
    A.cel(g, A.poly([[-.52, -.94], [-.36, -.94], [-.32, -.76], [-.56, -.76]]), '#c8c8d0', { line: INK, lw: .025 }); A.dot(g, -.44, -.73, .025, '#3a3a40');
    A.curve(g, [-.6, -1.35], [-.2, -1.7], [.1, -1.4], .04, '#b3261e'); A.flat(g, A.poly([[.1, -1.4], [.02, -1.5], [.17, -1.47]]), '#b3261e', 0);
  }),
  // fornektelse: et blankt ark, et bokmerke og en slakk kjetting
  historie_slutt_fornektelse: () => Art.part('historie_slutt_fornektelse', 2.4, 1.8, 1.2, .05, g => {
    A.cel(g, A.poly([[-.9, -.2], [.9, -.2], [.95, -1.45], [-.95, -1.45]]), '#f4eedc', { line: INK, lw: .045, hi: false });
    A.cel(g, A.rr(.55, -1.6, .12, .6, .02), '#b3261e', { lw: .02, hi: false });
    for (let i = 0; i < 9; i++) A.flat(g, A.ell(-.8 + i * .2, -.4 - Math.sin(i / 8 * Math.PI) * .14, .09, .04), null, .025, '#2a2624');
    g.save(); g.fillStyle = 'rgba(42,26,20,.25)'; g.font = 'italic .16px Georgia'; g.textAlign = 'center'; g.fillText('(blank)', 0, -.9); g.restore();
  }),
  // forstanderen i Dypet: en gammel mann sydd fast til stolen med sølvkroker, med journalen åpen og en grønn lampe
  forstander: () => Art.part('prop_forstander', 2.2, 2.4, 1.1, .05, g => {
    for (const s of [-1, 1]) { A.line(g, [[s * .32, -.9], [s * .78, -.02]], .035, '#2a2624'); for (let k = 1; k < 6; k++) A.dot(g, s * (.32 + .46 * k / 6), -.9 + .88 * k / 6, .022, 'rgba(210,210,220,.6)'); }
    A.cel(g, A.rr(-.28, -1.55, .56, .9, .1), '#2a2a32', { line: INK, lw: .05 });
    A.cel(g, A.ell(0, -1.8, .24, .27), '#e8c8a8', { line: INK, lw: .045 });
    A.flat(g, A.blob([[-.2, -1.72], [0, -1.55], [.2, -1.72], [.16, -1.45], [0, -1.35], [-.16, -1.45]]), '#f4f0e8', .03);
    for (const s of [-1, 1]) A.dot(g, s * .08, -1.85, .025);
    A.line(g, [[-.1, -1.92], [-.04, -1.94]], .02); A.line(g, [[.04, -1.94], [.1, -1.92]], .02);
    A.cel(g, A.rr(-1.0, -.72, 2.0, .18, .02), '#4a3020', { line: INK, lw: .05 }); A.cel(g, A.rr(-.9, -.56, 1.8, .52, .02), '#3a2418', { line: INK, lw: .04, hi: false });
    A.cel(g, A.poly([[-.45, -.74], [0, -.7], [0, -.95], [-.42, -1.0]]), '#efe4c4', { line: INK, lw: .03, hi: false }); A.cel(g, A.poly([[.45, -.74], [0, -.7], [0, -.95], [.42, -1.0]]), '#e6dcc0', { line: INK, lw: .03, hi: false });
    for (const s of [-1, 1]) A.curve(g, [s * .26, -.82], [s * .34, -.96], [s * .2, -.98], .025, '#c8ccd4');
    A.line(g, [[.62, -.74], [.62, -1.2]], .04, '#2a2a2a'); A.cel(g, A.poly([[.44, -1.18], [.8, -1.18], [.72, -1.36], [.52, -1.36]]), '#2e6a3a', { line: INK, lw: .03 }); A.flat(g, A.ell(.62, -1.16, .12, .03), '#fff0a0', 0);
  }),
  // Venterommet: røde forheng trukket til side, gulv i sikksakk, og den lille legen i en altfor stor kittel
  venterom: () => Art.part('prop_venterom', 2.0, 2.7, 1.0, .05, g => {
    const gulv = A.poly([[-.8, -.05], [.8, -.05], [.62, -.55], [-.62, -.55]]);
    g.save(); gulv(g); g.clip();
    for (let i = 0; i < 9; i++) { const y0 = -.55 + i * .07; A.flat(g, A.poly([[-1, y0], [-.6, y0 - .07], [-.2, y0], [.2, y0 - .07], [.6, y0], [1, y0 - .07], [1, y0 - .035], [.6, y0 + .035], [.2, y0 - .035], [-.2, y0 + .035], [-.6, y0 - .035], [-1, y0 + .035]]), i % 2 ? '#1a1414' : '#e8e0d0', 0); }
    g.restore(); A.flat(g, gulv, null, .03);
    A.cel(g, A.rr(-.62, -2.2, 1.24, 1.66, .02), '#7a1010', { line: INK, lw: .03, hi: false, soft: false });
    for (let i = 0; i < 8; i++) A.line(g, [[-.56 + i * .16, -2.15], [-.58 + i * .16, -.6]], .02, 'rgba(30,0,0,.45)');
    A.cel(g, A.rr(-.08, -.95, .36, .36, .03), '#2a1a14', { lw: .025, hi: false }); A.line(g, [[-.04, -.6], [-.04, -.36]], .03); A.line(g, [[.24, -.6], [.24, -.36]], .03);
    A.cel(g, A.poly([[-.02, -1.18], [.22, -1.18], [.3, -.62], [-.1, -.62]]), '#f0ece0', { line: INK, lw: .03 });
    A.cel(g, A.ell(.1, -1.26, .09, .1), '#e0c0a0', { line: INK, lw: .025 }); A.line(g, [[.04, -1.3], [.08, -1.3]], .015); A.line(g, [[.12, -1.3], [.16, -1.3]], .015);
    for (const s of [-1, 1]) A.cel(g, A.poly([[s * .95, -2.62], [s * .5, -2.62], [s * .62, -1.4], [s * .78, -.05], [s * .98, -.05]]), '#9a1818', { line: INK, lw: .045, sk: .55 });
    A.cel(g, A.rr(-.98, -2.66, 1.96, .26, .04), '#8a1414', { line: INK, lw: .04 });
  }),
  // Morbecks instrumentskrin: sort lakk med messingmønster, lokket på gløtt, på et lite bord
  skrin: () => Art.part('prop_skrin', 1.1, 1.3, .55, .05, g => {
    A.cel(g, A.rr(-.45, -.72, .9, .1, .02), '#4a3020', { line: INK, lw: .035 }); for (const x of [-.38, .32]) A.line(g, [[x, -.62], [x + (x < 0 ? -.03 : .03), 0]], .05, '#3a2418');
    A.cel(g, A.rr(-.3, -1.08, .6, .36, .03), '#15121a', { line: INK, lw: .04, sk: .5 });
    A.cel(g, A.poly([[-.32, -1.1], [.32, -1.1], [.28, -1.22], [-.28, -1.22]]), '#1c1822', { line: INK, lw: .035, hi: false });
    A.line(g, [[-.28, -1.095], [.28, -1.095]], .018, 'rgba(255,214,140,.95)');
    for (const [a, b] of [[[-.22, -1.0], [-.08, -.8]], [[-.08, -.8], [.08, -1.0]], [[.08, -1.0], [.22, -.8]], [[-.22, -.9], [.22, -.9]]]) A.line(g, [a, b], .018, '#c8a048');
    A.flat(g, A.ell(0, -.9, .06, .06), null, .018, '#c8a048');
  })
};

/* ---------- hva Journalen noterer om sjefen du nettopp behandlet ---------- */
const SJEF_EPITAF = {
  krok: 'Overlege Hektor Krok er behandlet. Han var Avdeling Nulls mann i huset og skrev under på hver innleggelse siden 1887 uten å lese én. Kjettingene hans ligger igjen på gulvet og rører på seg når ingen ser.',
  rust: 'Hydroterapeut Ragnvald Rust er behandlet. Han lyttet til avløpene i trettiseks år, og avløpene lyttet tilbake. Nå har havet under huset tatt ham hjem.',
  arkivar: 'Overarkivar Gunhild Paragraf er behandlet og arkivert under P. Hun sendte hver smerte i huset videre i tre eksemplarer. Det tredje gikk ned i avløpet, og hun fikk aldri kvittering.',
  klumpen: 'Den Store Klumpen er behandlet. Den var mange drømmer som hadde drømt seg inn i hverandre. Nå er de skilt, og hver av dem har fått tilbake et ansikt, omtrent sitt eget.',
  hekk: 'Overgartner Ansgar Hekk er behandlet. Røttene i parken nådde vannet under huset i 1918. Siden har de vokst nedover, og nå er det ingen som klipper dem.',
  hjort: 'Den hvite hjorten er behandlet. Den var en pasient som prøvde å gå ut gjennom skogen, men skogen er en drøm om å slippe unna, og drømmer slipper ingen. Den fikk ansiktet sitt tilbake til slutt, et øyeblikk.'
};
/* hva Journalen sier om valget i forrige kapittel */
const VALG_MERK = {
  tilgivelse: 'Forrige side sluttet med tilgivelse. Journalen har streket det ut og skrevet det inn igjen, med penere skrift. Noe under huset sov bedre den natta.',
  sannheten: 'Forrige side sluttet med sannheten. Journalen har satt tre streker under, og låsen i den har vridd seg ett hakk.',
  gjentakelse: 'Forrige side sluttet der den begynte. Journalen liker det. Den blir tykkere av det.',
  fornektelse: 'Forrige side ble aldri lest ferdig. Journalen har brettet hjørnet, og et sted i Dypet har noen strammet en kjetting.'
};
/* en side per kapittel: sannheten om huset, en bit om gangen */
const JOURNALSIDER = {
  1: c => [
    `Pasient nr. ${c.nr}, ${c.navn}, innlagt i dag ${c.arsak}. Det står i skjemaet. Skjemaet var fylt ut før pasienten kom, med blekk som fortsatt er vått.`,
    `${c.fornavn} kom hit på grunn av ${c.S.kort} ${c.S.N}. Det står ikke i noe skjema. Det står her.`,
    c.gjen ? 'Gjeninnlagt etter eget ønske. Journalen er fornøyd. Den liker gjengangere.' : c.n > 1 ? `Dette er innleggelse nummer ${c.n}. De ${c.n - 1} forrige hadde andre navn og de samme hendene. Journalen har tatt vare på fingeravtrykkene.` : 'Første innleggelse, står det. Journalen husker det annerledes, men sier ingenting ennå.',
    'Et sted under huset snur noe seg i søvne. Pasienten har begynt å drømme. Neste side er et hjem.'],
  2: c => [
    'Høsten 1886 kjøpte dr. Mathias Morbeck en protokoll i sort skinn på auksjon i Bergen, for to kroner og femti øre. Den var funnet i buken på en hval skutt utenfor Røst. Sidene var blanke, bortsett fra én linje øverst, i en skrift ingen i salen kunne lese.',
    'Han skrev navnet sitt under linja. Skinnet ble varmt under hånden, som en arm. Om natten hørte han hav under gulvet, og i 1887 bygde han sanatoriet på kollen over fjorden, akkurat der journalen ville.',
    'Mørket han fant i blodet til pasientene, kalte han Morbidium, etter seg selv, trodde han. Han hadde lest den første linja uten å vite det.',
    `Journalen var tykkere enn den så ut. Neste side er ${c.S.kort} ${c.S.N}.`],
  3: c => [
    'Under grunnmuren er det ikke fjell. Det er et hav, eldre enn fjorden og eldre enn isen. Der ligger den første pasienten og sover. Den har aldri hatt navn, bare nummer: 0.',
    'Morbidium er det den blør når den drømmer vondt. Det stiger opp gjennom avløpene og samler seg der det gjør vondt. Stolthet liker det enda bedre.',
    `${c.fornavn} har gitt mer av det enn de fleste, uten å si et ord om dagen ${c.S.kort} ${c.S.N} ${c.S.hendelse}.`,
    'Neste side er den dagen. Hører du en liten bjelle mens du leser, skal du ikke svare.'],
  4: c => [
    'Journalen er en lås. Hvert navn som skrives i den, vrir den et hakk. Høsten 1887 vred forstanderen den helt rundt, og en dør gikk opp i Dypet.',
    'De som kom opp, var leger en gang. De har behandlet smerte så lenge at de ble behandlingen: kitler sydd fast i huden, instrumenter under neglene, kroker i kjeder som synger når de strammes. De kaller seg Avdeling Null. For dem er smerte ikke et symptom. Det er et svar.',
    'Siden har bygget vokst nedover, én etasje for hver pasient som ga opp. Kjelleren kom i 1901. Skogen kom høsten 1918, samme høst som spanskesyken. Vaktmester Olsen har nøkkel til alt og har sluttet å spørre.',
    'Neste side er skrevet med din håndskrift. Den er vanskelig å lese, fordi den er skrevet fra innsiden.'],
  5: c => [
    'Nederst i huset sitter forstander Morbeck, sydd fast til stolen med sølvkroker, og leser høyt av journalen, lavt og jevnt, som for et barn som ikke får sove. Så lenge han leser, sover det under huset. Han har ikke tatt pause siden 1887.',
    'Du er ikke pasient her. Du er det den drømmer når det gjør vondt. Alle dere er det. Hver gang en av dere leser seg ferdig, er det én drøm mindre mellom den og morgenen.',
    'Avdeling Null venter på den morgenen. Forstanderen er redd for den. Journalen er sulten, og siste side er skrevet med din håndskrift.',
    'Les.']
};
/* siste side, etter at Journalen er behandlet. Andre avsnitt avhenger av om forstanderen fortsatt leser. */
const SISTE_SIDE = {
  tilgivelse: { a: 'Journalen lukker seg av seg selv, stille, som en dør noen har holdt åpen altfor lenge. Under huset snur den første pasienten seg i søvne og sover videre, roligere enn på trettiseks år.',
    morbeck: 'I Dypet slipper sølvkrokene taket, én etter én. Forstander Morbeck reiser seg for første gang siden 1887 og går opp trappene. De bærer ham.',
    los: 'I Dypet står en tom stol med sølvkroker i armlenene. Ingen leser, og det er likevel stille.' },
  sannheten: { a: 'Du leser siste side høyt, med din egen stemme: «Det var meg.» Låsen i journalen vrir seg det siste hakket, og forhenget i Venterommet glir til side.',
    morbeck: 'Bak det venter ingen leger, bare vann, stille og svart. Forstanderen lukker boka og nikker. Langt ute ved Røst ser fiskerne havet puste inn, én gang, og så ligge stille.',
    los: 'Bak det venter ingen leger, bare vann, stille og svart. Langt ute ved Røst ser fiskerne havet puste inn, én gang, og så ligge stille. Ingen vet om det var et sukk eller et gjesp.' },
  gjentakelse: { a: 'Journalen blar tilbake til side én. Det står et nytt navn der, med din håndskrift, og en liten bjelle ringer et sted i Dypet.',
    morbeck: 'Forstanderen sukker, pusser brillene og begynner å lese høyt fra begynnelsen. Du kjenner igjen stemmen. Du har hørt den gjennom gulvet hver natt.',
    los: 'Stolen i Dypet er tom, så journalen leser seg selv høyt. Den har din stemme nå.' },
  fornektelse: { a: 'Du lukker journalen uten å lese siste side. Den lar deg gjøre det. Den har tid.',
    morbeck: 'I mørket under deg strammes en kjetting, høflig, som når noen holder en dør og venter. Forstanderen legger et bokmerke der du stoppet.',
    los: 'I mørket under deg strammes en kjetting, høflig, som når noen holder en dør og venter. Det ligger et bokmerke der du stoppet. Du la det ikke der.' }
};

/* ---------- sjefene: ny tale ved en tredjedel helse, slengord og siste ord ---------- */
LINES.monolog2 = {
  krok: ['Tror du jeg valgte dette?', 'Jeg var den første de behandlet etter forstanderen. De var så forsiktige med meg.', 'Kjettingene er ikke for å holde deg fast. De er for å holde deg sammen.'],
  rust: ['Hører du vannet?', 'Det er ikke vann. Det er havet under huset, og det drømmer med åpne øyne.', 'Jeg skyller bare. Det er avløpet som ber for oss.'],
  arkivar: ['Alle mapper har en første side.', 'Din begynner midt i en setning. Den ble skrevet før du ble født.', 'Tredje eksemplar går ned. Alltid ned. Jeg har aldri fått kvittering.'],
  klumpen: ['Vi har en hemmelighet.', 'Vi ble drømt samtidig, og drømmene rant sammen.', 'Under alle ansiktene våre er det samme ansiktet. Ditt.'],
  hekk: ['Forstanderen plantet den første hekken selv.', 'Røttene nådde vannet i 1918. Siden har de vokst nedover.', 'Jeg klipper ikke for at det skal bli pent. Jeg klipper så den under oss ikke skal se opp.'],
  hjort: ['Jeg husker navnet mitt nå.', 'Jeg het det samme som deg, en gang. Vi var samme drøm.', 'Ikke gå inn i skogen for å slippe unna. Skogen er drømmen om å slippe unna.'],
  journalen: ['Jeg ble funnet i buken på en hval utenfor Røst.', 'Forstanderen skrev det første ordet. Det var feil navn. Siden har jeg skrevet selv.', 'Du er ikke pasient her. Du er det den drømmer når det gjør vondt.']
};
LINES.bossDod = {
  krok: 'Kjettingene... er... slakke...', rust: 'Endelig. Tørt.', arkivar: 'Arkiver meg under... under... null...', klumpen: 'Vi... slipper... hverandre...',
  hekk: 'Ingen... tråkker... på plenen...', hjort: 'Takk. Nå husker du meg.', journalen: 'Les. Meg. Ferdig.'
};
Object.assign(LINES.boss, { krok: LINES.boss[1], rust: LINES.boss[2], arkivar: LINES.boss[3], journalen: LINES.boss[4] });
LINES.boss.krok.push('Smerte er bare kunnskap som ikke har fått plass ennå.', 'Hør på kjettingene. De synger for deg.');
LINES.boss.journalen.push('Vi har tid. Vi har så god tid.', 'Hører du bjella? Den er til deg nå.');
LINES.bossIntro.krok.push('Kjettingene har savnet deg.');
// Journalen spør og svarer selv, i stedet for at bare den ene halvdelen blir trukket
LINES.bossIntro.journalen = ['Hvem opprettet denne journalen?'];
LINES.bossIntro.hjort = ['Det er ikke meg du er redd for.', 'Du har sett meg før. Du husker det bare ikke.', 'Jeg var som deg en gang.'];

/* ---------- høyttaleren og koret vet om havet ---------- */
PA[2].push('Kafeteriaen minner om at kaka ikke er kake. Kafeteriaen beklager.');
PA[3].push('Pasienter bes ikke svare når vannet i badekarene sier navnet deres.', 'Det er salt i springvannet i dag. Det er ingen grunn til uro.');
PA[4].push('Rundskriv 13-B gjelder fortsatt. All smerte i tre eksemplarer. Det tredje leveres i avløpet.');
PA[5].push('Hallo? Skogen minner om at den er drømt. Ikke tråkk for hardt.');
PA[6].push('Avdeling Null har besøkstid. Den har alltid besøkstid.', 'Vennligst ikke vekk pasient nummer null.', 'Hører dere en bjelle, er den ikke til dere. Ennå.');
LINES.koret.push('...den under oss drømmer deg...', '...hører du bjella...', '...ikke les siste side høyt...');

/* ---------- personalet merker hvor de er, og Olsen har en historie ---------- */
const NPC_DYP = {
  kafeteria: { 1: ['Suppe i parken. Det er ikke mitt valg, men suppen er god.'], 3: ['Fisken kom tilbake i dag. Den var ikke død. Vi serverer suppe.'], 4: ['Kjelleren har ikke vinduer. Suppen merker det.'], 5: ['Jeg vet ikke hvordan jeg kom hit heller, vennen. Suppe?', 'Det er elg i suppa. Jeg har ikke puttet den der.'], 6: ['Forstanderen spiste her en gang. I 1887. Han har ikke betalt ennå.', 'Kaka er ikke kake her nede. Den er det den under oss drømmer om kake. Suppe?'] },
  medisin: { 1: ['Frisk luft er ikke en medisin. Den er et symptom.'], 4: ['Salt i blodprøven igjen. Tredje pasient i dag. Havet er langt unna, sier de.'], 5: ['Jeg har ikke resept for skog. Ta to av disse og ikke se deg tilbake.'], 6: ['Forstanderen har stått på venteliste siden 1887. Du er foran ham.'] },
  vaktmester: {
    1: ['Jeg fikk nøkkelknippet i 1901. Det var tre nøkler på det da. Nå er det fire.'],
    2: ['Den fjerde nøkkelen på knippet har aldri passet i noe. Jeg bærer den likevel. Man vet aldri.'],
    3: ['Kjelleren var ikke der i går. Jeg har nøkkel til den i dag.'],
    4: ['Den fjerde nøkkelen varmer seg. Den har aldri gjort det før du kom.'],
    5: ['Jeg har nøkkel til skogen. Det finnes ingen dør. Nøkkelen er grønn i kanten, som om den har vokst.'],
    6: ['Den fjerde nøkkelen passer ikke i noen dør. Den passer i en journal. Jeg har visst alltid visst det.']
  },
  journal: { 3: ['Journalen lukter tang i dag.'], 4: ['Journalen blar raskere nå.', 'Et ark faller ut. Det er din håndskrift, men du har ikke skrevet det ennå.'], 5: ['Journalen er fuktig. Den har vært ute i skogen.'], 6: ['Journalskapet er tomt. Journalen er et annet sted i kveld.'] },
  bibliotek: { 4: ['Noen har lånt en bok om Røst. Den kom tilbake våt.'], 5: ['Bøkene her har røtter. Lånetiden er ubestemt.'], 6: ['Den eneste boka her er ikke til utlån. Den leser deg.'] }
};

/* ---------- kjettinger med kroker fra mørket: Avdeling Null ---------- */
const Kjeder = {
  liste: [],
  tex() {
    if (!this._t) this._t = R.canvasTex(64, 16, g => {
      g.strokeStyle = '#1c1816'; g.lineWidth = 3.4; g.beginPath(); g.ellipse(17, 8, 13, 5, 0, 0, TAU); g.stroke();
      g.fillStyle = '#1c1816'; g.fillRect(36, 5.6, 26, 4.8);
      g.strokeStyle = 'rgba(225,225,235,.85)'; g.lineWidth = 1.6; g.beginPath(); g.ellipse(17, 7, 11.5, 3.6, 0, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
      g.fillStyle = 'rgba(225,225,235,.75)'; g.fillRect(38, 6.1, 22, 1.4);
    }, true);
    return this._t;
  },
  krokTex() {
    if (!this._k) this._k = R.canvasTex(64, 64, g => {
      g.lineCap = 'round'; g.strokeStyle = '#1c1816'; g.lineWidth = 7;
      g.beginPath(); g.moveTo(5, 32); g.lineTo(34, 32); g.quadraticCurveTo(58, 32, 56, 46); g.quadraticCurveTo(52, 58, 40, 52); g.stroke();
      g.beginPath(); g.moveTo(40, 52); g.lineTo(47, 42); g.stroke();
      g.strokeStyle = 'rgba(220,220,230,.75)'; g.lineWidth = 2; g.beginPath(); g.moveTo(8, 30); g.lineTo(34, 30); g.quadraticCurveTo(54, 30, 53, 44); g.stroke();
    });
    return this._k;
  },
  /* bånd langs kjettingen, lagt på tvers av synslinja, med u langs lengden så leddene gjentas */
  baand(a, b, w, heng) {
    const n = 10, P = [], inn = new THREE.Vector3(0, -Math.sin(CAM_PITCH), -Math.cos(CAM_PITCH)), s = new THREE.Vector3(), t = new THREE.Vector3(), pos = [], uv = [], idx = [];
    for (let i = 0; i <= n; i++) { const k = i / n; P.push(new THREE.Vector3(a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k - Math.sin(Math.PI * k) * heng, a.z + (b.z - a.z) * k)); }
    let L = 0;
    P.forEach((p, i) => {
      if (i) L += p.distanceTo(P[i - 1]);
      t.subVectors(P[Math.min(n, i + 1)], P[Math.max(0, i - 1)]).normalize(); s.crossVectors(t, inn).normalize().multiplyScalar(w / 2);
      pos.push(p.x - s.x, p.y - s.y, p.z - s.z, p.x + s.x, p.y + s.y, p.z + s.z); uv.push(L / (w * 4), 0, L / (w * 4), 1);
      if (i) { const j = i * 2; idx.push(j - 2, j - 1, j, j - 1, j + 1, j); }
    });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); return g;
  },
  /* én kjetting fra et punkt i mørket til et mål (et objekt med x og z, eller en funksjon). o: inn, hold, ut, forsink, treff(K) */
  slag(fra, mal, o = {}) {
    if (!R.scene || R.safe) { if (o.treff) try { o.treff(null); } catch (e) { } return null; }
    const m = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ map: this.tex(), transparent: true, depthWrite: false, depthTest: false, side: THREE.DoubleSide }));
    const krok = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.krokTex(), transparent: true, depthTest: false, depthWrite: false }));
    m.renderOrder = 18; m.frustumCulled = false; m.visible = false; krok.center.set(.08, .5); krok.scale.set(.8, .8, 1); krok.renderOrder = 19; krok.visible = false;
    R.scene.add(m); R.scene.add(krok);
    const K = { m, krok, fra, mal, t: -(o.forsink || 0), inn: o.inn || .16, hold: o.hold ?? .7, ut: o.ut || .32, bredde: o.bredde || .16, treff: o.treff, truffet: false, tupp: new THREE.Vector3() };
    this.liste.push(K); return K;
  },
  /* flere kjettinger fra mørket rundt et mål, litt etter hverandre */
  rundt(mal, n, o = {}) {
    const M = typeof mal === 'function' ? mal() : mal, a0 = Math.random() * TAU, ut = [];
    for (let i = 0; i < n; i++) {
      const a = a0 + i / n * TAU + rnd(-.3, .3), r = rnd(5.5, 7.5);
      ut.push(this.slag({ x: M.x + Math.sin(a) * r, y: rnd(3.2, 5), z: M.z + Math.cos(a) * r * .8 }, mal, Object.assign({}, o, { forsink: (o.forsink || 0) + i * .07, treff: i === 0 ? o.treff : null })));
    }
    Sound.play('chain', .7); setTimeout(() => Sound.play('kjetting', .8), 120);
    return ut;
  },
  malPos(K) { const M = typeof K.mal === 'function' ? K.mal() : K.mal; return { x: M.x, y: M.y ?? 1, z: M.z }; },
  tick(dt) {
    for (let i = this.liste.length - 1; i >= 0; i--) {
      const K = this.liste[i]; K.t += dt; if (K.t < 0) continue;
      const M = this.malPos(K), A0 = K.fra, stram = K.t >= K.inn && K.t < K.inn + K.hold;
      let k;
      if (K.t < K.inn) k = K.t / K.inn;
      else if (stram) { k = 1; if (!K.truffet) { K.truffet = true; if (K.treff) try { K.treff(K); } catch (e) { console.warn('kjede', e); } } }
      else k = 1 - (K.t - K.inn - K.hold) / K.ut;
      if (k <= 0 && K.t > K.inn) { this.fjern(K); this.liste.splice(i, 1); continue; }
      const skj = stram ? .035 : 0; // kjettingen dirrer når den er stram
      K.tupp.set(A0.x + (M.x - A0.x) * k + rnd(-skj, skj), A0.y + (M.y - A0.y) * k, A0.z + (M.z - A0.z) * k + rnd(-skj, skj));
      K.m.geometry.dispose(); K.m.geometry = this.baand(A0, K.tupp, K.bredde, stram ? .02 : .05 + (1 - k) * .3);
      K.m.visible = K.krok.visible = true; K.krok.position.copy(K.tupp);
      const p0 = R.project(A0.x, A0.y, A0.z), p1 = R.project(K.tupp.x, K.tupp.y, K.tupp.z); K.krok.material.rotation = Math.atan2(-(p1.y - p0.y), p1.x - p0.x);
    }
  },
  fjern(K) { R.scene.remove(K.m); R.scene.remove(K.krok); K.m.geometry.dispose(); K.m.material.dispose(); K.krok.material.dispose(); },
  tom() { for (const K of this.liste) this.fjern(K); this.liste = []; }
};
Object.assign(Sound.lib, {
  // en liten sølvbjelle, langt borte, med mye klang
  bjelle: [{ w: 'sine', f: 988, d: 2.2, v: .16, rv: .7, atk: .002 }, { w: 'sine', f: 2371, d: 1.3, v: .07, rv: .7, atk: .002 }, { w: 'sine', f: 3853, d: .8, v: .045, rv: .6, atk: .002 }, { w: 'sine', f: 5336, d: .45, v: .03, rv: .5, atk: .002 }],
  kjetting: [{ n: 1, d: .5, f0: 6000, f1: 1800, ft: 'bandpass', v: .28 }, { arp: [1500, 1820, 1340, 1660, 1480], nl: .05, w: 'triangle', v: .06 }]
});
Object.assign(DEATH_CAUSES, { kroker: ['Undersøkt av Avdeling Null. Grundig.', 'Fant den fullkomne kur. Kuren fant pasienten først.', 'Hengt opp i kjettinger for observasjon. Observasjonen pågår.'] });

/* ---------- to nye hendelser: Venterommet og instrumentskrinet ---------- */
const HENDELSER_HISTORIE = {
  venterom: {
    navn: 'Venterommet', dybder: [2, 3, 4, 6], plass: 'vegg', vekt: 3, prompt: 'Gå gjennom forhenget',
    lag(h) { const g = propSprite(null, h.x, h.sted.vz + .06, { P: HISTORIE_ART.venterom(), shadow: false }); R.level.add(g); h.obj.push(g); h.obj.push(R.light(h.x, h.sted.vz + .5, 2.2, '#ff5a4a', .45, R.levelL)); },
    tick(h, dt) { if (!h.brukt && !h.ferdig && Math.random() < dt * .1 && d2(G.player.x, G.player.z, h.x, h.z) < 30) Sound.mumble(2, 90); },
    samtale(h) {
      const bak = s => '«' + s.split('').reverse().join('') + '»', bilde = () => hendBilde(HISTORIE_ART.venterom(), '#1a0808'), ferdig = () => { h.brukt = true; Hendelse.borte(h); };
      return { tittel: 'Venterommet', bilde, baklengs: bak('Kaffen er kald, men havet er varmt.'),
        tekst: 'Bak forhenget er et lite rom med røde forheng på alle kanter og et gulv som går i sikksakk. Det lukter sjø. En liten lege i en kittel som er altfor stor for ham, sitter på en stol og venter, som om dere hadde en avtale klokka tre.\nHan snakker baklengs, og du forstår hvert ord: «Kaffen er kald, men havet er varmt.»',
        valg: [
          { tekst: 'Sett deg', gjor: () => { ferdig(); Folge.hel(20); return { tekst: '«Alle venter her før de blir drømt,» sier den lille legen. «Noen venter lenge. Du har sittet i den stolen før.» Han peker på stolen du sitter i. «Og i den.» Han peker på en annen stol. Den er også varm.\nNår du reiser deg, står du i gangen igjen, uthvilt, som etter en lang natt.' }; } },
          { tekst: 'Drikk kaffen', gjor: () => { ferdig(); G.player.coffee = true; Folge.hel(10); Folge.morb(10); return { tekst: 'Kaffen smaker salt, som sjøen utenfor Røst i november. Du drikker den likevel. Den er forbasket god, på en måte du ikke liker.\n«Og nå kake,» sier den lille legen og skyver fram et fat. Du ser ned. Fatet er tomt, og det er verre.' }; } },
          { tekst: 'Spør hvem som drømmer', gjor: () => { ferdig(); Folge.xp(25); return { tekst: '«Den som ligger under,» sier den lille legen og peker ned, mot gulvet som går i sikksakk. «Den har drømt dere siden før dere hadde navn. Når det gjør vondt i den, drømmer den folk. Når det gjør veldig vondt, drømmer den sykehus.»\nHan knipser med fingrene. «Og kake. Den drømmer kake. Ikke spis den.»' }; } },
          { tekst: 'Dans', gjor: () => { ferdig(); Folge.morb(-20); Folge.hel(5); return { tekst: 'Dere danser, han baklengs og du forlengs, til en musikk som kommer fra alle kanter og ingen. Han er en overraskende god danser. Du er ikke det.\nNår musikken stopper, står du i gangen igjen. Skoene dine er våte av sjøvann, og hodet er lettere.' }; } }] };
    }
  },
  skrin: {
    navn: 'Instrumentskrinet', dybder: [2, 3, 4, 6], plass: 'rom:*', vekt: 2, prompt: 'Se på skrinet',
    lag(h) { const g = propSprite(null, h.x, h.z + .2, { P: HISTORIE_ART.skrin() }); R.level.add(g); h.obj.push(g); h.obj.push(R.light(h.x, h.z + .3, 1.6, '#ffd8a0', .35, R.levelL)); },
    tick(h, dt) {
      const P = G.player; if (!P) return;
      if (!h.brukt && Math.random() < dt * .12 && d2(P.x, P.z, h.x, h.z) < 36) Sound.play('bjelle', .2, 1.4);
      // når panelet er lukket: bjella, kjettingene fra mørket, undersøkelsen og gaven
      if (h.data.vri && G.state === 'play') {
        h.data.vri = false; Sound.play('bjelle', .9); R.fx.lyn = Math.max(R.fx.lyn || 0, .45);
        Kjeder.rundt(() => ({ x: G.player.x, y: 1, z: G.player.z }), 5, { forsink: .35, hold: .75, treff: () => {
          const P2 = G.player; if (!P2 || !P2.alive) return; R.shake(.45); R.negativ(.1); Folge.skade(18, 'kroker'); Folge.morb(15);
          setTimeout(() => { if (!G.player || !G.player.alive) return; Folge.kuriositet(); Folge.xp(40); toast('Avdeling Null', 'Undersøkelsen er ferdig. Resultatet ligger i hånden din.'); }, 900);
        } });
      }
    },
    samtale(h) {
      const bilde = () => hendBilde(HISTORIE_ART.skrin(), '#140e0a');
      return { tittel: 'Morbecks instrumentskrin', bilde,
        tekst: 'Et lite skrin av sort lakk står på et bord der det ikke var noe bord i går. Messingmønsteret på lokket står ikke helt stille når du ser på det. Under bunnen er det gravert, med små bokstaver: «Til den fullkomne kur. M. M. 1887.»\nDet er varmt å ta på. Noe inni tikker, som et ur, eller et hjerte som har god tid.',
        valg: [
          { tekst: 'Vri på mønsteret', hint: 'Noe åpner seg. Det kommer til å gjøre vondt.', gjor: () => { h.brukt = true; h.data.vri = true; Sound.play('bjelle', .6); return { tekst: 'Mønsteret glir under fingrene dine, som om det har ventet på akkurat dem. Et klikk. Et til. Lokket åpner seg en fingerbredd, og det kommer kald luft ut, som fra en kjeller ved havet.\nEt sted langt under deg ringer en liten bjelle. Noen er på vei opp. De har god tid, men de er ikke trege.' }; } },
          { tekst: 'Lytt til det', gjor: () => ({ tekst: 'Det tikker. Mellom tikkene hører du en stemme, veldig høflig og veldig langt borte: «Vi har undersøkt pasienten. Pasienten er nesten klar.»\nDu setter skrinet fra deg. Det tikker litt fortere.' }) },
          { tekst: 'La det stå', gjor: () => null }] };
    }
  }
};

const Historie = {
  base: null,
  /* alt en journalside trenger om pasienten og historien */
  ctx(H) {
    const run = G.run, p = run.patient || {}, m = G.meta || {}, S = Drom.ord(H);
    return { S, H, nr: p.nr || '?', navn: p.name || 'Pasienten', fornavn: (p.name || 'Pasienten').split(' ')[0], arsak: String(p.complaint || 'innlagt for nervøs uro').replace(/^innlagt /, ''), n: (m.deaths || 0) + (m.wins || 0) + 1, gjen: !!run.gjen };
  },
  /* journalsiden før drømmen: sjefen du forlot, sannheten om huset og en merknad om forrige valg */
  side(D) {
    if (!D || !D.H || !JOURNALSIDER[D.kap]) return null;
    const c = this.ctx(D.H), B = typeof sjefFor === 'function' ? sjefFor(D.fra) : null, deler = [];
    if (B && SJEF_EPITAF[B.type] && (G.run.behandlet || []).includes(D.fra)) deler.push(SJEF_EPITAF[B.type]); // ikke hvis pasienten tok heisen forbi
    deler.push(...JOURNALSIDER[D.kap](c));
    const forrige = D.H.valg && D.H.valg[D.kap - 1];
    if (forrige) deler.splice(deler.length - 1, 0, VALG_MERK[forrige === 'flukt' ? 'fornektelse' : forrige] || '');
    (G.run.journalsider || (G.run.journalsider = [])).includes(D.kap) || G.run.journalsider.push(D.kap);
    return { tittel: 'Journalen, side ' + D.kap, bilde: () => hendBilde((HISTORIE_ART['historie_' + D.kap] || HISTORIE_ART.historie_5)(), '#140e14'), tekst: deler.filter(Boolean).join('\n') };
  },
  /* siste side etter slutten, før etterordet fra drømmene */
  siste(H) { const sl = Drom.slutt(H), T = SISTE_SIDE[sl]; return { sl, tekst: T ? T.a + '\n' + (G.run && G.run.forstanderLos ? T.los : T.morbeck) : '', bilde: HISTORIE_ART['historie_slutt_' + sl] }; },
  /* utskrivningsbrevet: tittel, stempel, avslutning og underskrift etter slutten og forstanderen */
  brev() {
    const run = G.run || {}, H = run.historie, sl = H && H.sett ? Drom.slutt(H) : null, fornavn = ((run.patient && run.patient.name) || '').split(' ')[0];
    const avslutning = {
      tilgivelse: 'Journalen er lukket. Den ba oss si at den savner Dem, men at den forstår. Pasient nr. 0 sover godt. Vi takker for hjelpen.',
      sannheten: 'Siste side i journalen er skrevet med Deres håndskrift og lest høyt. Det er første gang. Vi ber Dem holde Dem borte fra kysten ved Røst en stund.',
      gjentakelse: 'Senga Deres står klar. Den har alltid stått klar. Vi ser fram til å skrive Dem inn igjen, under et nytt navn. Avdeling Null hilser.',
      fornektelse: 'De er utskrevet mot journalens råd. Journalen har holdt av en blank side til Dem, og Avdeling Null har notert adressen.'
    }[sl] || 'Journalen er lukket. Den ba oss si at den savner Dem.';
    const sign = run.pennen ? (run.patient && run.patient.name) || 'Pasienten' : run.forstanderLos ? 'M. Morbeck, tidligere forstander' : run.forstanderMott ? 'M. Morbeck, forstander' : 'Overlegen';
    return { sl, avslutning, samme: 'De ble innlagt og utskrevet samme dag. Det er vanlig her. Dagen er lang.', tittel: sl === 'gjentakelse' ? 'Innkallingsbrev' : 'Utskrivningsbrev', stempel: sl === 'gjentakelse' ? 'INNKALT' : 'UTSKREVET', sign, egen: !!run.pennen, fornavn };
  },
  konklusjon() {
    const sl = this.brev().sl;
    return { tilgivelse: 'Pasienten er friskmeldt og har tilgitt noen. Det står ikke i skjemaet hvem. Noe under huset sover bedre.', sannheten: 'Pasienten er friskmeldt. Pasienten sa det høyt, og havet hørte det.', gjentakelse: 'Pasienten er innkalt på nytt. Senga er redd opp. Bjella har ringt.', fornektelse: 'Pasienten er friskmeldt mot journalens råd. Ingen vet helt hva det betyr lenger.' }[sl] || 'Pasienten er friskmeldt. Ingen vet helt hva det betyr lenger.';
  },
  /* høyttaleren, koret og personalet får linjer fra pasientens egen historie */
  personlig() {
    if (!this.base) this.base = { PA: Object.fromEntries(Object.entries(PA).map(([k, v]) => [k, v.slice()])), koret: LINES.koret.slice(), npc: Object.fromEntries(Object.entries(NPC_LINES).map(([k, v]) => [k, v.slice()])) };
    for (const [k, v] of Object.entries(this.base.PA)) PA[k] = v.slice();
    LINES.koret = this.base.koret.slice();
    for (const [k, v] of Object.entries(this.base.npc)) NPC_LINES[k] = v.slice().concat(((NPC_DYP[k] || {})[G.depth]) || [], ((NPC_DYP[k] || {})[G.depth]) || []);
    const run = G.run, H = run && run.historie; if (!H || !H.sett || G.drom) return;
    const S = Drom.ord(H), navn = (run.patient && run.patient.name) || 'pasienten';
    const pa = [`Besøk til ${navn}. ${cap(S.kort)} ${S.N} venter i kafeteriaen. Rettelse: ${S.hun} venter ikke.`, `Har noen mistet ${S.tegn}? Den ligger i hittegodset. Den har ligget der lenge, og den er våt.`, `Telefon til ${navn} fra ${S.fra}. Linja er dårlig. Det høres ut som hav.`];
    if (H.sett >= 3) pa.push(`Påminnelse til ${navn}: Dagen ${S.kort} ${S.N} ${S.hendelse}, er ikke i dag. Den er hver dag.`);
    if (G.depth >= 3) PA[G.depth] = (PA[G.depth] || []).concat(pa);
    LINES.koret.push(`...${S.N} ventet på deg...`, `...${S.tegnB}...`, `...husker du ${S.fra}...`);
    if (H.sett >= 4) LINES.koret.push(`...du ${S.skyld.kort}...`, '...si det...');
  },
  /* forstanderen i Dypet: hvem som skriver, hva han leser, pennen, og krokene */
  hendelse: {
    navn: 'Forstanderen', dybder: [6], plass: 'rom:*', vekt: 60, prompt: 'Snakk med den gamle mannen ved skrivebordet',
    lag(h) {
      const g = propSprite(null, h.x, h.z - .1, { P: HISTORIE_ART.forstander() }); R.level.add(g); h.obj.push(g); h.g = g;
      const l = R.light(h.x + .62, h.z + .2, 2.4, '#b8e0a0', .55, R.levelL); l.userData.y = 1.2; h.obj.push(l); h.lys = l; G.run.forstanderMott = G.run.forstanderMott || false;
    },
    // løs ham: når panelet er lukket, ringer bjella, og kjettingene henter ham ned i gulvet, stol og alt
    tick(h, dt) {
      if (h.ferdig || h.data.los === undefined || G.state !== 'play') return;
      if (h.data.los === 0) { Sound.play('bjelle', .9); R.fx.lyn = Math.max(R.fx.lyn || 0, .4); Kjeder.rundt({ x: h.x, y: 1.3, z: h.z - .1 }, 4, { forsink: .3, hold: .9, treff: () => { R.shake(.4); Sound.play('chain', 1, .7); } }); }
      h.data.los += dt; const t = h.data.los - .55;
      if (t > 0 && h.g) { const k = Math.max(.001, 1 - t / .7); h.g.scale.set(1 + (1 - k) * .1, k, 1); if (h.lys) R.setLight(h.lys, .55 * k); }
      if (t > .75) {
        Hendelse.borte(h); G.run.forstanderLos = true; Folge.hel(40); Folge.kuriositet(); if (typeof Merknad === 'object') Merknad.gi('loslatt');
        toast('Forstanderen er borte', 'Ingen leser for den under huset nå');
      }
    },
    samtale(h) {
      const run = G.run, H = run.historie, S = H && H.sett ? Drom.ord(H) : null; run.forstanderMott = true;
      const les = () => {
        if (!S) return { tekst: 'Du leser over skulderen hans. Siden er tom, bortsett fra navnet ditt øverst og datoen i dag, med din håndskrift. «De har ikke drømt ennå,» hvisker han. «Det er der det står.»' };
        const linje = H.sett >= 4 ? S.skyld.jeg(S)[0] : H.sett >= 3 ? `${cap(S.kort)} ${S.N} ${S.hendelse}.` : `Fra ${S.fra}. ${cap(S.kort)} ${S.N}.`;
        return { tekst: `Du leser over skulderen hans. Det er din håndskrift, men du har aldri skrevet det: «${linje}»\n«Ja,» hvisker forstanderen. «Den linja leser jeg ofte. Den under oss liker den. Den sover så godt når det gjør vondt i noen andre.»` };
      };
      return { tittel: 'Forstander dr. Mathias Morbeck', bilde: () => hendBilde(HISTORIE_ART.forstander(), '#10140e'),
        tekst: 'Bak et skrivebord som er altfor stort for rommet, sitter en gammel mann i frakk. Fine sølvkroker går gjennom huden på hendene hans og videre inn i stolen, og kjettinger forsvinner ned i gulvet. Foran ham ligger en tykk journal i sort skinn. Han leser høyt, lavt og jevnt, som for et barn som ikke får sove.\n«Sett Dem,» sier han uten å se opp. «Ikke så høyt. Den sover.»',
        valg: [
          { tekst: 'Spør hvem som skriver journalen', gjor: () => ({ tekst: '«Ingen. Den skriver seg selv. Jeg skrev det første ordet i 1887. Det var navnet mitt, og det var feil navn.»\nHan blar om. «Jeg ba om den fullkomne kur. De ringte med en liten bjelle og ga meg den. Nå leser jeg for det under oss, hver natt, så det ikke våkner. Det er kuren. Den virker.»' }) },
          { tekst: 'Les over skulderen hans', gjor: () => les() },
          { tekst: 'Ta pennen fra ham', hint: 'Journalen blir svakere. Litt mer mørke i blodet.', gjor: () => { h.brukt = true; run.pennen = true; Folge.morb(15); if (typeof Merknad === 'object') Merknad.gi('pennen'); return { tekst: 'Pennen er en krok av sølv, varm og våt i spissen. Han slipper den uten å kjempe, og en av kjettingene i gulvet går slakk.\nEt sted under deg skjelver Journalen, som en munn som har bitt seg i tunga. «Nå er det De som skriver under,» sier forstanderen. «De kommer til å høre en bjelle. Ikke svar.»' }; } },
          { tekst: 'Løs ham fra krokene', hint: 'Han får slutte å lese. Journalen blir sterkere.', gjor: () => { h.brukt = true; h.data.los = 0; return { tekst: 'Du løsner den første kroken. Han skriker ikke. Han ler, lavt, som en som har ventet lenge på å få le.\n«Takk,» sier han og lukker journalen. «Gå litt unna nå. De liker ikke at noen forstyrrer behandlingen.»' }; } }] };
    }
  },
  /* første gang pasienten kommer inn i en drøm: bare de kapitlene som rekker fram til sannheten.
     Over startetasjen (bare mulig i testene) og rett før Dypet gjelder den gamle regelen. */
  kapittelFor(H, fra) {
    const run = G.run, start = (AWAKENINGS[run.awk] && AWAKENINGS[run.awk].depth) || 1, n = 6 - start, i = fra - start;
    if (fra >= 5) return 5;
    if (i < 0) return Math.min(4, (H.sett || 0) + 1);
    const rekke = { 5: [1, 2, 3, 4, 5], 4: [1, 3, 4, 5], 3: [1, 4, 5], 2: [4, 5], 1: [5] }[n] || [1, 2, 3, 4, 5];
    return rekke[Math.min(rekke.length - 1, i)];
  }
};

/* ---------- koblinger ---------- */
HENDELSER.forstanderen = Historie.hendelse;
Object.assign(HENDELSER, HENDELSER_HISTORIE);
// kjettingene går i spilltid, så de står stille bak pausemenyen og samtalepanelet, og forsvinner med etasjen
{ const _ht = Hendelse.tick; Hendelse.tick = function (dt) { _ht.call(this, dt); Kjeder.tick(dt); }; }
{ const _cf = clearFloor; clearFloor = function () { Kjeder.tom(); _cf(); }; }
// journalsiden før drømmen: «Les videre» og Escape går begge til innledningen, så valget om å våkne med en gang ikke forsvinner
{ const _v = Samtale.vis; Samtale.vis = function (o) {
  const D = G.drom;
  if (o && D && !D.sideVist && typeof o.tittel === 'string' && o.tittel.startsWith('Kapittel ' + D.kap)) {
    D.sideVist = true; const s = Historie.side(D);
    if (s) { _v.call(this, Object.assign({}, s, { valg: [{ tekst: 'Les videre', hint: 'Inn i drømmen', gjor: () => o }] })); if (G.panelO) G.panelO.onBack = () => Samtale.vis(o); return; }
  }
  return _v.call(this, o);
}; }
// siste side før etterordet fra drømmene. Escape går videre her også, ellers havner pasienten tilbake i spillet uten brev.
{ const _e = Drom.epilog; Drom.epilog = function (videre) {
  const H = G.run && G.run.historie, S0 = H ? Historie.siste(H) : null, etterord = () => { _e.call(Drom, videre); if (G.panelO) G.panelO.onBack = videre; };
  if (!S0 || !S0.tekst) return etterord();
  openPanel(`<div class="paper samtale"><div class="sbilde"></div><div class="sinnhold"><div class="stittel">Siste side</div><div class="stekst">${S0.tekst.split('\n').map(t => `<p>${esc(t)}</p>`).join('')}</div><div class="svalg"><button id="sisteOk"><b>1</b> Les videre</button></div></div></div>`, { onBack: etterord });
  try { document.querySelector('.samtale .sbilde').appendChild(hendBilde(S0.bilde(), '#140e14')); } catch (e) { }
  $('panel').scrollTop = 0; // samme slags panel som samtalene før
  $('sisteOk').onclick = etterord; $('sisteOk').focus({ preventScroll: true }); Sound.play('paper');
}; }
// kapitlene følger hvor langt nede pasienten våknet, så skylda (kapittel 4) alltid kommer før sannheten (kapittel 5)
{ const _l = Drom.lag; Drom.lag = function (depth) {
  const D = _l.call(this, depth); if (!D) return D;
  const kap = Historie.kapittelFor(D.H, D.fra);
  if (kap !== D.kap) { const run = G.run, H = D.H, S = this.ord(H), K = DROM_KAP[kap], tm = DROM_TEMA[K.tema];
    D.kap = kap; D.K = K; D.undertittel = 'Kapittel ' + kap + ' av 5'; D.musikk = kap === 5 ? 'losje' : 'drom';
    D.tema = Object.assign({}, THEMES[2], { name: 'Drømmen: ' + K.navn, wall: tm.wall, wains: tm.wains, pool: tm.pool, fog: tm.fog, grade: tm.grade, corr: Col.dark(tm.wall, .7), cap: Col.dark(tm.wains, .7) });
    D.F = this.etasje(kap, K.rom(S), S, run.seed + depth * 131); D.F.taake = (H.hendelse === 'taake' && kap === 3) ? [.55, '#c8c8d8'] : tm.taake;
    D.F.vaer = kap === 3 ? DROM_STED[H.hendelse].vaer : kap === 4 ? 'regn' : kap === 5 ? null : 'klart'; }
  return D;
}; }
// personen i historien passer til alderen på pasienten (ingen bestefar til en på sytti)
{ const _h = Drom.historie; Drom.historie = function () {
  const run = G.run; if (!run || run.historie) return _h.call(this);
  const H = _h.call(this), alder = (run.patient && run.patient.age) || 40, ok = r => !((alder > 45 && r === 'bestefar') || (alder > 58 && (r === 'mor' || r === 'far')) || (alder < 22 && r === 'barn'));
  if (!ok(H.rolle)) {
    const rng = mulberry32(((run.seed >>> 0) * 17 + 3) >>> 0), roller = Object.keys(DROM_ROLLER).filter(ok), rolle = roller[Math.floor(rng() * roller.length)], R0 = DROM_ROLLER[rolle];
    const kjonn = R0.kjonn === '?' ? (rng() < .5 ? 'k' : 'm') : R0.kjonn; Object.assign(H, { rolle, kjonn, navn: DROM_NAVN[kjonn][Math.floor(rng() * DROM_NAVN[kjonn].length)] });
  }
  return H;
}; }
// sjefene: ny tale ved en tredjedel helse, slengord i kampen, siste ord, og Journalen som svarer seg selv
// den første talen er over når fasen er tilbake til kamp, så den andre kan byttes inn før bossOnHurt starter den
{ const _o = bossOnHurt; bossOnHurt = function (B, d) { if (B.phasesDone === 1 && B.phase !== 'monolog' && LINES.monolog2[B.type]) B.mono = LINES.monolog2[B.type]; _o(B, d); }; }
{ const _u = updateBoss; updateBoss = function (B, dt) {
  _u(B, dt);
  if (B.alive && B.state === 'chase' && G.state === 'play') { B.slengT = (B.slengT ?? rnd(5, 9)) - dt; if (B.slengT <= 0) { B.slengT = rnd(8, 14); const L = LINES.boss[B.type]; if (L && L.length) FX.bubble(B, pick(L), 1.8, 'boss'); } }
}; }
// Journalen: svarer seg selv, er svakere uten pennen og sterkere når ingen leser for den under huset
{ const _s = spawnBoss; spawnBoss = function (...a) {
  const B = _s.apply(this, a); if (!B) return B; const run = G.run || {};
  if (B.type === 'journalen') {
    setTimeout(() => { if (B.alive) FX.bubble(B, 'Du gjorde. Hver gang du døde.', 2.8, 'boss'); }, 2300);
    if (run.pennen) { B.hp *= .8; setTimeout(() => { if (B.alive) FX.bubble(B, 'Hvem har pennen min?', 2.4, 'boss'); }, 5200); }
    if (run.forstanderLos) { B.max *= 1.2; B.hp *= 1.2; setTimeout(() => { if (B.alive) FX.bubble(B, 'Ingen leser for oss nå. Hører du hvor stille det er?', 2.8, 'boss'); }, 5200); }
  }
  if (B.type === 'hjort' && run.historie && run.historie.tegn === 'hest' && run.historie.sett) setTimeout(() => { if (B.alive) FX.bubble(B, 'I drømmen din var jeg en hvit hest.', 2.6, 'boss'); }, 2400);
  return B;
}; }
// sjefen er alt markert som død, og FX fjerner bobler på døde, så de siste ordene henger på et merke der den sto
{ const _d = bossDie; bossDie = function (B) {
  const ord = LINES.bossDod[B.type]; _d(B); if (ord) FX.bubble({ x: B.x, z: B.z, bubbleH: B.bubbleH, alive: true }, ord, 2.6, 'boss');
  if (G.run) (G.run.behandlet || (G.run.behandlet = [])).push(B.depth);
}; }
// personlige linjer og personalet på hver etasje
{ const _sf = startFloor; startFloor = function (...a) { const r = _sf.apply(this, a); try { Historie.personlig(); } catch (e) { console.warn('historie', e); } return r; }; }
// radioen kan spille pasientens egen historie
{ const _r = HENDELSER.radio.samtale; HENDELSER.radio.samtale = function (h) {
  const s = _r.call(this, h), H = G.run && G.run.historie;
  if (s && H && H.sett >= 2 && !h.data.egen && Math.random() < .5) { const S = Drom.ord(H); h.data.egen = true; s.tekst = `Et hørespill på prøvesendingen. «...og så dro ${S.kort} ${S.N} fra ${S.fra} den dagen, og det kom aldri noen tilbake for å fortelle hvorfor. Bare én visste det, og den ene ble innlagt på et sanatorium i 1923 for noe helt annet.»\nStemmen i radioen høres ut som din. Bak den, svakt, hører du havet. Noen i radioen hoster og sier: «Pause. Vi fortsetter når pasienten er klar.»`; }
  return s;
}; }
// merknader for sjefene som manglet, for pennen og for krokene
Object.assign(MERKNADER, {
  klumpen: { navn: 'Løsrevet', krav: 'Behandle Den Store Klumpen.', gir: 'Æren, og en følelse av at noen endelig slipper hverandre.' },
  hekk: { navn: 'Villnis', krav: 'Behandle Overgartner Ansgar Hekk.', gir: 'Parken får vokse som den vil.' },
  hjort: { navn: 'Ansiktet tilbake', krav: 'Behandle Den hvite hjorten.', gir: 'Hjorten husker hvem den var.' },
  pennen: { navn: 'Pennen', krav: 'Ta pennen fra forstanderen i Dypet.', gir: 'Utskrivningsbrevet kan signeres av pasienten selv.' },
  loslatt: { navn: 'Løslatelse', krav: 'Løs forstanderen fra sølvkrokene i Dypet.', gir: 'Forstanderen får slutte å lese. Journalen blir sterkere av det.' }
});
{ const _ob = Merknad.onBoss; Merknad.onBoss = function (B) { _ob.call(this, B); if (['klumpen', 'hekk', 'hjort'].includes(B.type)) this.gi(B.type); }; }
// ni nye journalfragmenter, fra auksjonen i 1886 til hele historien
LORE.push(
  { t: 'Auksjonsprotokoll, Bergen 1886', b: 'Nr. 13. En protokoll innbundet i sort skinn, funnet i buken på en hval skutt utenfor Røst. Sidene er blanke, bortsett fra én linje i en skrift ingen av de fremmøtte kunne lese. Tilslag: dr. M. Morbeck, to kroner og femti øre. Kjøperen gråt da han betalte.' },
  { t: 'Forstanderens første notat, 1887', b: 'Jeg skrev navnet mitt på første side. Skinnet ble varmt under hånden, som en arm. I natt hørte jeg havet under gulvet. Det finnes ikke hav under gulvet. Jeg ba Olsen sjekke. Olsen hørte det også. M. Morbeck' },
  { t: 'Forstanderens andre notat, 1887', b: 'Jeg har vridd låsen helt rundt. En liten bjelle ringte, og det kom en trekk fra gulvet som luktet sjø. De var fire. De var høflige. De spurte hva jeg ønsket meg, og jeg sa: den fullkomne kur. De ble så glade.' },
  { t: 'Byggmesterens regning, 1901', b: 'For kjeller under kjeller: ingen arbeidstimer. Den var der da vi kom, og trappa gikk lenger ned enn lykta rakk. En av karene sier han hørte bølger. Vi har likevel sendt regning, av prinsipp.' },
  { t: 'Olsens notat, høsten 1918', b: 'Skogen kom i natt. Ingen har plantet den. Røttene går ned i vann, sier gartneren. Jeg fikk nøkkel til den i posten i morges. Avsender: Journalen. Frimerket var slikket.' },
  { t: 'Forklaring fra styrmann G. J., innlagt 1921', b: 'Vi så en by stige opp av havet utenfor Røst. Vinklene var feil, og steinen var våt som hud. Én dør sto på gløtt. Derfra kom lyden av en liten bjelle, og en høflig stemme spurte om vi var pasienter. Jeg sa nei. Jeg ble innlagt samme høst.' },
  { t: 'Brev fra Det Kongelige Frederiks Universitet, 1922', b: 'Kjære kollega. Tegnene De sendte meg fra første side i journalen, er ikke norrøne. De samme tegnene er hogget i en stein fra havbunnen ved Røst og i en figur fra Stillehavet som intet museum vil ta imot. Jeg råder Dem til å slutte å lese. Selv har jeg sluttet å sove. Deres hengivne H. W.' },
  { t: 'Siste notat fra forstanderen', b: 'Jeg leser høyt hver natt, for det under oss. Så lenge jeg leser, sover det. Krokene holder meg på plass, og det er godt, for jeg ville ha løpt. Et sted i boka finnes en pasient som leser seg ferdig. Da får vi gå, begge to. Eller så våkner det. Jeg vet ikke lenger hva som er kur.' },
  { t: 'Hele historien', b: 'Under huset er det et hav, og i havet sover den første pasienten. Når det gjør vondt i den, drømmer den oss. Forstanderen kjøpte en journal som var en lås, vred den rundt og fikk sin kur av Avdeling Null. Nå leser han for at den skal sove. Morbidium er det den blør. Hver pasient er en drøm med nytt navn, og du blir skrevet ut når du har lest deg ferdig. Ikke før. P.S. Ikke spis kaka.' }
);
