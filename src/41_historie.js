/* ============================================================
   HISTORIEN  -  Journalen forteller
   Hovedhistorien er det spillet har hintet om hele tiden, nå sagt tydelig:
   - Morbidium sanatorium ble grunnlagt i 1887 av forstander dr. Mathias Morbeck,
     «M.» i journalen. Han fant et mørke i blodet til pasientene, oppkalte det etter
     seg selv og kjøpte en journal i svart skinn for å skrive ned alle sinn i huset.
   - Journalen skrev tilbake. Morbidium er blekket den skriver med, laget av det
     pasientene ikke sier høyt. Bygget vokser nedover, én etasje for hver pasient som
     slutter å lese før siste side.
   - Pasienten er den samme sjela, innlagt igjen og igjen under nye navn. Den eneste
     veien ut er å lese sin egen journal ferdig, og det er det drømmene er.
   Slik kommer det fram:
   - En journalside før hver drøm: Journalen skriver om pasienten, om sjefen som nettopp
     ble behandlet, og en bit av sannheten om huset. Fem sider i alt.
   - Sjefene har fått en ny tale ved en tredjedel helse, slengord i kampen og siste ord
     når de dør. Journalen stiller spørsmålet og svarer selv.
   - Forstanderen sitter i Dypet og leser. Han kan fortelle, la deg lese over skulderen,
     eller miste pennen til deg.
   - Høyttaleren, Hviskekoret og radioen kjenner igjen personen og tegnet fra drømmene,
     personalet merker hvor de er, og vaktmester Olsen har en historie gjennom etasjene.
   - Seks nye journalfragmenter, og det siste er «Hele historien».
   - Siste side og utskrivningsbrevet følger slutten fra drømmene. Gjentakelse gir et
     innkallingsbrev i stedet for et utskrivningsbrev.
   ============================================================ */

/* ---------- bildene til historien (reserver til ChatGPT leverer historie_*.png og prop_forstander.png) ---------- */
const HISTORIE_ART = {
  // side 1: innleggelsesskjemaet med stempel og penn
  historie_1: () => Art.part('historie_1', 2.4, 1.8, 1.2, .05, g => {
    A.cel(g, A.poly([[-.95, -.1], [.8, -.18], [.9, -1.62], [-.85, -1.56]]), '#efe4c4', { line: INK, lw: .05 });
    for (let i = 0; i < 7; i++) A.line(g, [[-.7, -1.35 + i * .16], [.62 + (i % 3) * .05, -1.4 + i * .16]], .025, 'rgba(60,40,30,.45)');
    A.cel(g, A.rr(-.6, -1.5, .5, .1, .02), '#2a1a14', { lw: 0, hi: false });
    g.save(); g.translate(.3, -.55); g.rotate(-.18); A.flat(g, A.rr(-.42, -.14, .84, .28, .04), 'rgba(179,38,30,.12)', .05, '#b3261e'); g.fillStyle = '#b3261e'; g.font = 'bold .17px Georgia'; g.textAlign = 'center'; g.fillText('INNLAGT', 0, .06); g.restore();
    A.line(g, [[.65, -.3], [1.1, -1.25]], .07, '#1a1a1a'); A.line(g, [[.62, -.24], [.66, -.32]], .04, '#c8a048');
  }),
  // side 2: journalen i svart skinn fra 1887
  historie_2: () => Art.part('historie_2', 2.4, 1.8, 1.2, .05, g => {
    A.cel(g, A.rr(-.75, -1.6, 1.5, 1.5, .08), '#1c1416', { line: INK, lw: .06, sk: .6 });
    A.flat(g, A.rr(-.62, -1.48, 1.24, 1.26, .05), null, .03, '#8a6a3a');
    g.save(); g.fillStyle = '#c8a048'; g.font = 'bold .26px Georgia'; g.textAlign = 'center'; g.fillText('1887', 0, -.78); g.font = 'italic .14px Georgia'; g.fillText('M.', 0, -.52); g.restore();
    A.cel(g, A.rr(.72, -1.2, .08, .6, .02), '#6a1a1a', { lw: .02, hi: false });
    A.line(g, [[-.9, -.25], [-.4, -.95]], .06, '#2a2a2a'); A.dot(g, -.92, -.22, .05, '#6b2d8c');
  }),
  // side 3: blekket, lilla og levende
  historie_3: () => Art.part('historie_3', 2.4, 1.8, 1.2, .05, g => {
    A.cel(g, A.poly([[-.35, -.1], [.35, -.1], [.42, -.75], [.2, -.95], [.2, -1.2], [-.2, -1.2], [-.2, -.95], [-.42, -.75]]), '#3a2a4a', { line: INK, lw: .05, sk: .6 });
    A.flat(g, A.poly([[-.36, -.2], [.36, -.2], [.4, -.7], [-.4, -.7]]), '#6b2d8c', 0);
    A.cel(g, A.rr(-.16, -1.36, .32, .18, .04), '#6a4a2c', { lw: .03 });
    for (const [x, y, r] of [[.6, -.3, .12], [.85, -.15, .08], [.5, -.05, .06], [-.7, -.2, .1]]) A.cel(g, A.ell(x, y, r * 1.4, r * .6), '#7b3aa6', { lw: .025, hi: false });
    A.curve(g, [.3, -.6], [.8, -.8], [.62, -.32], .05, '#7b3aa6');
    for (let i = 0; i < 5; i++) A.dot(g, -.6 + i * .3, -1.45 - (i % 2) * .15, .035, 'rgba(224,168,255,.7)');
  }),
  // side 4: bygget som vokser nedover, med skogen under grunnmuren
  historie_4: () => Art.part('historie_4', 2.4, 2.2, 1.2, .05, g => {
    A.flat(g, A.poly([[-.9, -1.75], [0, -2.1], [.9, -1.75]]), '#4a3a34', .04);
    const et = ['#d8c8a8', '#b8a888', '#988870', '#786858', '#584838'];
    et.forEach((c, i) => { const y = -1.75 + i * .3, w = .85 - i * .04; A.cel(g, A.rr(-w, y, w * 2, .3, .01), c, { line: INK, lw: .03, hi: false }); for (let k = 0; k < 4; k++) A.flat(g, A.rr(-w + .15 + k * (w * 2 - .3) / 3.4, y + .08, .12, .14, .01), i < 2 ? '#ffe6a0' : '#2a2030', .015); });
    A.line(g, [[-1.1, -.25], [1.1, -.25]], .05, '#3a2a1a');
    for (let i = 0; i < 7; i++) { const x = -.9 + i * .3; A.flat(g, A.poly([[x - .12, -.05], [x, -.3 + (i % 2) * .05], [x + .12, -.05]]), '#1e3a24', .02, '#0a1a0c'); }
    A.curve(g, [0, -.25], [.1, -.1], [-.05, 0], .03, '#3a2a1a');
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
  historie_slutt_sannheten: () => Art.part('historie_slutt_sannheten', 2.4, 1.8, 1.2, .05, g => {
    for (let i = 0; i < 26; i++) { const x = -1 + (i * .37) % 2, y = -1.6 + (i * .53) % 1.4; A.line(g, [[x, y], [x - .06, y + .22]], .02, 'rgba(120,150,200,.8)'); }
    A.flat(g, A.ell(0, -.08, .3, .06), 'rgba(90,110,150,.5)', 0);
    A.line(g, [[0, -.1], [0, -.6]], .08, '#2a2a30'); A.dot(g, 0, -.72, .1, '#2a2a30'); A.line(g, [[-.1, -.45], [.1, -.45]], .06, '#2a2a30');
  }),
  historie_slutt_gjentakelse: () => Art.part('historie_slutt_gjentakelse', 2.4, 1.8, 1.2, .05, g => {
    A.cel(g, A.rr(-.8, -.75, 1.6, .5, .05), '#e8e8e4', { line: INK, lw: .04 }); A.cel(g, A.rr(-.8, -.6, 1.6, .35, .04), '#6a8ab8', { line: INK, lw: .035, hi: false });
    for (const x of [-.8, .8]) A.line(g, [[x, -.1], [x, -1.05]], .06, '#3a3a40'); A.line(g, [[-.8, -1.0], [.8, -1.0]], .05, '#3a3a40');
    A.cel(g, A.rr(.25, -1.35, .5, .3, .03), '#efe4c4', { line: INK, lw: .03, hi: false }); A.line(g, [[.33, -1.25], [.66, -1.25]], .02, '#2a1a14'); A.line(g, [[.33, -1.17], [.6, -1.17]], .02, '#2a1a14');
    A.curve(g, [-.6, -1.35], [-.2, -1.7], [.1, -1.4], .04, '#b3261e'); A.flat(g, A.poly([[.1, -1.4], [.02, -1.5], [.17, -1.47]]), '#b3261e', 0);
  }),
  historie_slutt_fornektelse: () => Art.part('historie_slutt_fornektelse', 2.4, 1.8, 1.2, .05, g => {
    A.cel(g, A.poly([[-.9, -.2], [.9, -.2], [.95, -1.45], [-.95, -1.45]]), '#f4eedc', { line: INK, lw: .045, hi: false });
    A.cel(g, A.rr(.55, -1.6, .12, .6, .02), '#b3261e', { lw: .02, hi: false });
    g.save(); g.fillStyle = 'rgba(42,26,20,.25)'; g.font = 'italic .16px Georgia'; g.textAlign = 'center'; g.fillText('(blank)', 0, -.8); g.restore();
  }),
  // forstanderen i Dypet: en gammel mann i frakk ved et skrivebord, med journalen åpen og en grønn lampe
  forstander: () => Art.part('prop_forstander', 2.2, 2.4, 1.1, .05, g => {
    A.cel(g, A.rr(-.28, -1.55, .56, .9, .1), '#2a2a32', { line: INK, lw: .05 });
    A.cel(g, A.ell(0, -1.8, .24, .27), '#e8c8a8', { line: INK, lw: .045 });
    A.flat(g, A.blob([[-.2, -1.72], [0, -1.55], [.2, -1.72], [.16, -1.45], [0, -1.35], [-.16, -1.45]]), '#f4f0e8', .03);
    for (const s of [-1, 1]) A.dot(g, s * .08, -1.85, .025);
    A.line(g, [[-.1, -1.92], [-.04, -1.94]], .02); A.line(g, [[.04, -1.94], [.1, -1.92]], .02);
    A.cel(g, A.rr(-1.0, -.72, 2.0, .18, .02), '#4a3020', { line: INK, lw: .05 }); A.cel(g, A.rr(-.9, -.56, 1.8, .52, .02), '#3a2418', { line: INK, lw: .04, hi: false });
    A.cel(g, A.poly([[-.45, -.74], [0, -.7], [0, -.95], [-.42, -1.0]]), '#efe4c4', { line: INK, lw: .03, hi: false }); A.cel(g, A.poly([[.45, -.74], [0, -.7], [0, -.95], [.42, -1.0]]), '#e6dcc0', { line: INK, lw: .03, hi: false });
    A.line(g, [[.62, -.74], [.62, -1.2]], .04, '#2a2a2a'); A.cel(g, A.poly([[.44, -1.18], [.8, -1.18], [.72, -1.36], [.52, -1.36]]), '#2e6a3a', { line: INK, lw: .03 }); A.flat(g, A.ell(.62, -1.16, .12, .03), '#fff0a0', 0);
  })
};

/* ---------- hva Journalen noterer om sjefen du nettopp behandlet ---------- */
const SJEF_EPITAF = {
  krok: 'Overlege Hektor Krok er behandlet. Han har skrevet under på hver eneste innleggelse siden 1887 uten å lese én. Journalen har lest dem for ham.',
  rust: 'Hydroterapeut Ragnvald Rust er behandlet. Han skylte i trettiseks år. Nå har avløpet fått ham tilbake.',
  arkivar: 'Overarkivar Gunhild Paragraf er behandlet og arkivert under P. Hun ville ha likt det, og så ville hun ha rettet på bokstaven.',
  klumpen: 'Den Store Klumpen er behandlet. Alle pasientene i den er skrevet ut samtidig, for første gang. Kafeteriaen har bestilt tre hundre porsjoner, for sikkerhets skyld.',
  hekk: 'Overgartner Ansgar Hekk er behandlet. Parken får vokse som den vil nå. Ingen vet hva den vil bli.',
  hjort: 'Den hvite hjorten er behandlet. Den var en pasient som prøvde å gå ut gjennom skogen. Den fikk ansiktet sitt tilbake til slutt, bare litt for sent.'
};
/* hva Journalen sier om valget i forrige kapittel */
const VALG_MERK = {
  tilgivelse: 'Forrige side sluttet med tilgivelse. Journalen har streket det ut og skrevet det inn igjen, med penere skrift.',
  sannheten: 'Forrige side sluttet med sannheten. Journalen har satt tre streker under, og så en til.',
  gjentakelse: 'Forrige side sluttet der den begynte. Journalen liker det. Den blir tykkere av det.',
  fornektelse: 'Forrige side ble aldri lest ferdig. Journalen har brettet hjørnet, som man gjør.'
};
/* en side per kapittel: sannheten om huset, en bit om gangen */
const JOURNALSIDER = {
  1: c => [
    `Pasient nr. ${c.nr}, ${c.navn}, innlagt i dag ${c.arsak}. Det står i skjemaet, og skjemaet tar feil.`,
    `${c.fornavn} kom hit på grunn av ${c.S.kort} ${c.S.N}. Det står ikke i noe skjema. Det står her.`,
    c.gjen ? 'Gjeninnlagt etter eget ønske. Journalen er fornøyd. Den liker gjengangere.' : c.n > 1 ? `Dette er innleggelse nummer ${c.n}. De ${c.n - 1} forrige hadde andre navn og de samme hendene.` : 'Første innleggelse, står det. Journalen husker det annerledes, men sier ingenting ennå.',
    'Pasienten har begynt å lese. Neste side er et hjem.'],
  2: c => [
    'Morbidium sanatorium ble grunnlagt i 1887 av forstander dr. Mathias Morbeck. Han fant et mørke i blodet til pasientene og oppkalte det etter seg selv, som man gjorde den gangen.',
    'Så kjøpte han en journal i svart skinn, for to kroner og femti øre, for å skrive ned alle sinn i huset og gjøre dem sunne. Han skrev sitt eget navn på første side, for ordens skyld.',
    `Journalen var tykkere enn den så ut. Neste side er ${c.S.kort} ${c.S.N}.`],
  3: c => [
    'Morbidium er blekk. Det lages av det pasientene ikke sier høyt: skammen, stoltheten, den ene dagen. Journalen skriver med det. Nå skriver den med ditt.',
    `${c.fornavn} har gitt mer blekk enn de fleste, uten å si et ord om dagen ${c.S.kort} ${c.S.N} ${c.S.hendelse}.`,
    'Neste side er den dagen. Den er skrevet med tykk penn.'],
  4: c => [
    'Bygget vokser nedover. Én etasje for hver pasient som slutter å lese før siste side. Kjelleren kom i 1901. Skogen kom høsten 1918, samme høst som spanskesyken, og ingen har plantet den.',
    'Vaktmester Olsen har nøkkel til alt, også det som ikke er bygget ennå. Han har sluttet å spørre.',
    'Neste side er skrevet med din håndskrift. Den er vanskelig å lese. Det er ikke håndskriftens feil.'],
  5: c => [
    'Nederst i huset sitter forstander Morbeck ved skrivebordet sitt. Han har ikke skrevet et ord siden 1887. Han leser. Han venter på en pasient som leser seg ferdig, for da får de gå, begge to.',
    'Siste side er skrevet med din håndskrift. Den er ikke ferdig. Journalen er sulten, og den er redd.',
    'Les.']
};
/* siste side, etter at Journalen er behandlet: det som skjer med huset, etter slutten fra drømmene */
const SISTE_SIDE = {
  tilgivelse: 'Journalen lukker seg av seg selv, stille, som en dør noen har holdt åpen altfor lenge.\nI Dypet reiser forstander Morbeck seg for første gang siden 1887 og går opp trappene. De bærer ham. Han er lettere enn han trodde.',
  sannheten: 'Du skriver siste setning selv: «Det var meg.» Blekket er vanlig blekk.\nForstanderen leser det, nikker og lukker boka. «Det var alt,» sier han. «Det var alt den ville.»',
  gjentakelse: 'Journalen blar tilbake til side én. Det står et nytt navn der, med din håndskrift.\nForstanderen sukker, pusser brillene og begynner å lese fra begynnelsen.',
  fornektelse: 'Du lukker journalen uten å lese siste side. Den lar deg gjøre det. Den har tid.\nForstanderen legger et bokmerke der du stoppet og sier ingenting.'
};

/* ---------- sjefene: ny tale ved en tredjedel helse, slengord og siste ord ---------- */
LINES.monolog2 = {
  krok: ['Tror du jeg valgte dette?', 'Jeg har ikke lest en eneste innleggelse siden 1887. Jeg skriver bare under.', 'Journalen leser dem for meg. Den har pen håndskrift. Den har min håndskrift.'],
  rust: ['Hører du vannet?', 'Det sier navnet ditt. Det har sagt det i trettiseks år, lenge før du kom.', 'Jeg skyller bare. Det er avløpet som husker.'],
  arkivar: ['Alle mapper har en første side.', 'Din mappe har ingen. Den begynner midt i en setning.', 'Hvem har tatt første side? Det er det eneste jeg aldri har funnet.'],
  klumpen: ['Vi har en hemmelighet.', 'Under alle ansiktene våre er det samme ansiktet.', 'Ditt.'],
  hekk: ['Forstanderen plantet den første hekken selv.', 'Han sa at et sunt sinn er et klippet sinn.', 'Jeg har aldri spurt hva som vokser under røttene.'],
  hjort: ['Jeg husker navnet mitt nå.', 'Jeg het det samme som deg, en gang.', 'Ikke gå inn i skogen for å slippe unna. Gå inn for å huske.'],
  journalen: ['Jeg ble kjøpt for to kroner og femti øre i 1887.', 'Forstanderen skrev det første ordet. Siden har jeg skrevet selv.', 'Du er ikke pasient her. Du er manuskriptet.']
};
LINES.bossDod = {
  krok: 'Jeg skriver meg ut. Uten underskrift.', rust: 'Endelig. Tørt.', arkivar: 'Arkiver meg under... under...', klumpen: 'Vi... slipper... hverandre...',
  hekk: 'Ingen... tråkker... på plenen...', hjort: 'Takk. Nå husker du meg.', journalen: 'Les. Meg. Ferdig.'
};
Object.assign(LINES.boss, { krok: LINES.boss[1], rust: LINES.boss[2], arkivar: LINES.boss[3], journalen: LINES.boss[4] });
// Journalen spør og svarer selv, i stedet for at bare den ene halvdelen blir trukket
LINES.bossIntro.journalen = ['Hvem opprettet denne journalen?'];
LINES.bossIntro.hjort = ['Det er ikke meg du er redd for.', 'Du har sett meg før. Du husker det bare ikke.', 'Jeg var som deg en gang.'];

/* ---------- personalet merker hvor de er, og Olsen har en historie ---------- */
const NPC_DYP = {
  kafeteria: { 1: ['Suppe i parken. Det er ikke mitt valg, men suppen er god.'], 4: ['Kjelleren har ikke vinduer. Suppen merker det.'], 5: ['Jeg vet ikke hvordan jeg kom hit heller, vennen. Suppe?', 'Det er elg i suppa. Jeg har ikke puttet den der.'], 6: ['Forstanderen spiste her en gang. I 1887. Han har ikke betalt ennå.', 'Dette er siste servering. Det har det vært lenge.'] },
  medisin: { 1: ['Frisk luft er ikke en medisin. Den er et symptom.'], 5: ['Jeg har ikke resept for skog. Ta to av disse og ikke se deg tilbake.'], 6: ['Forstanderen har stått på venteliste siden 1887. Du er foran ham.'] },
  vaktmester: {
    1: ['Jeg fikk nøkkelknippet i 1901. Det var tre nøkler på det da. Nå er det fire.'],
    2: ['Den fjerde nøkkelen på knippet har aldri passet i noe. Jeg bærer den likevel. Man vet aldri.'],
    3: ['Kjelleren var ikke der i går. Jeg har nøkkel til den i dag.'],
    4: ['Den fjerde nøkkelen varmer seg. Den har aldri gjort det før du kom.'],
    5: ['Jeg har nøkkel til skogen. Det finnes ingen dør. Nøkkelen er grønn i kanten, som om den har vokst.'],
    6: ['Den fjerde nøkkelen passer ikke i noen dør. Den passer i en journal. Jeg har visst alltid visst det.']
  },
  journal: { 4: ['Journalen blar raskere nå.', 'Et ark faller ut. Det er din håndskrift, men du har ikke skrevet det ennå.'], 5: ['Journalen er fuktig. Den har vært ute i skogen.'], 6: ['Journalskapet er tomt. Journalen er et annet sted i kveld.'] },
  bibliotek: { 5: ['Bøkene her har røtter. Lånetiden er ubestemt.'], 6: ['Den eneste boka her er ikke til utlån. Den leser deg.'] }
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
  siste(H) { const sl = Drom.slutt(H); return { sl, tekst: SISTE_SIDE[sl], bilde: HISTORIE_ART['historie_slutt_' + sl] }; },
  /* utskrivningsbrevet: tittel, stempel, avslutning og underskrift etter slutten og forstanderen */
  brev() {
    const run = G.run || {}, H = run.historie, sl = H && H.sett ? Drom.slutt(H) : null, fornavn = ((run.patient && run.patient.name) || '').split(' ')[0];
    const avslutning = {
      tilgivelse: 'Journalen er lukket. Den ba oss si at den savner Dem, men at den forstår.',
      sannheten: 'Siste side i journalen er skrevet med Deres håndskrift, og den er ferdig. Det er første gang. Vi har rammet den inn.',
      gjentakelse: 'Senga Deres står klar. Den har alltid stått klar. Vi ser fram til å skrive Dem inn igjen, under et nytt navn.',
      fornektelse: 'De er utskrevet mot journalens råd. Journalen har holdt av en blank side til Dem. Den venter.'
    }[sl] || 'Journalen er lukket. Den ba oss si at den savner Dem.';
    const sign = run.pennen ? (run.patient && run.patient.name) || 'Pasienten' : run.forstanderMott ? 'M. Morbeck, forstander' : 'Overlegen';
    return { sl, avslutning, samme: 'De ble innlagt og utskrevet samme dag. Det er vanlig her. Dagen er lang.', tittel: sl === 'gjentakelse' ? 'Innkallingsbrev' : 'Utskrivningsbrev', stempel: sl === 'gjentakelse' ? 'INNKALT' : 'UTSKREVET', sign, egen: !!run.pennen, fornavn };
  },
  konklusjon() {
    const sl = this.brev().sl;
    return { tilgivelse: 'Pasienten er friskmeldt og har tilgitt noen. Det står ikke i skjemaet hvem.', sannheten: 'Pasienten er friskmeldt. Pasienten sa det høyt. Det holdt.', gjentakelse: 'Pasienten er innkalt på nytt. Senga er redd opp.', fornektelse: 'Pasienten er friskmeldt mot journalens råd. Ingen vet helt hva det betyr lenger.' }[sl] || 'Pasienten er friskmeldt. Ingen vet helt hva det betyr lenger.';
  },
  /* høyttaleren, koret og personalet får linjer fra pasientens egen historie */
  personlig() {
    if (!this.base) this.base = { PA: Object.fromEntries(Object.entries(PA).map(([k, v]) => [k, v.slice()])), koret: LINES.koret.slice(), npc: Object.fromEntries(Object.entries(NPC_LINES).map(([k, v]) => [k, v.slice()])) };
    for (const [k, v] of Object.entries(this.base.PA)) PA[k] = v.slice();
    LINES.koret = this.base.koret.slice();
    for (const [k, v] of Object.entries(this.base.npc)) NPC_LINES[k] = v.slice().concat(((NPC_DYP[k] || {})[G.depth]) || [], ((NPC_DYP[k] || {})[G.depth]) || []);
    const run = G.run, H = run && run.historie; if (!H || !H.sett || G.drom) return;
    const S = Drom.ord(H), navn = (run.patient && run.patient.name) || 'pasienten';
    const pa = [`Besøk til ${navn}. ${cap(S.kort)} ${S.N} venter i kafeteriaen. Rettelse: ${S.hun} venter ikke.`, `Har noen mistet ${S.tegn}? Den ligger i hittegodset. Den har ligget der lenge.`, `Telefon til ${navn} fra ${S.fra}. Linja er dårlig. Det regner der.`];
    if (H.sett >= 3) pa.push(`Påminnelse til ${navn}: Dagen ${S.kort} ${S.N} ${S.hendelse}, er ikke i dag. Den er hver dag.`);
    if (G.depth >= 3) PA[G.depth] = (PA[G.depth] || []).concat(pa);
    LINES.koret.push(`...${S.N} ventet på deg...`, `...${S.tegnB}...`, `...husker du ${S.fra}...`);
    if (H.sett >= 4) LINES.koret.push(`...du ${S.skyld.kort}...`, '...si det...');
  },
  /* forstanderen i Dypet: hvem som skriver, hva han leser, og pennen */
  hendelse: {
    navn: 'Forstanderen', dybder: [6], plass: 'rom:*', vekt: 60, prompt: 'Snakk med den gamle mannen ved skrivebordet',
    lag(h) {
      const g = propSprite(null, h.x, h.z - .1, { P: HISTORIE_ART.forstander() }); R.level.add(g); h.obj.push(g);
      const l = R.light(h.x + .62, h.z + .2, 2.4, '#b8e0a0', .55, R.levelL); l.userData.y = 1.2; h.obj.push(l); G.run.forstanderMott = G.run.forstanderMott || false;
    },
    samtale(h) {
      const run = G.run, H = run.historie, S = H && H.sett ? Drom.ord(H) : null; run.forstanderMott = true;
      const les = () => {
        if (!S) return { tekst: 'Du leser over skulderen hans. Siden er tom, bortsett fra navnet ditt øverst og datoen i dag. «De har ikke drømt ennå,» sier han. «Det er der det står.»' };
        const linje = H.sett >= 4 ? S.skyld.jeg(S)[0] : H.sett >= 3 ? `${cap(S.kort)} ${S.N} ${S.hendelse}.` : `Fra ${S.fra}. ${cap(S.kort)} ${S.N}.`;
        return { tekst: `Du leser over skulderen hans. Det er din håndskrift, men du har aldri skrevet det: «${linje}»\n«Ja,» sier forstanderen stille. «Jeg har lest den linja mange ganger. Du har skrevet den mange ganger. Med forskjellige navn.»` };
      };
      return { tittel: 'Forstander dr. Mathias Morbeck', bilde: () => hendBilde(HISTORIE_ART.forstander(), '#10140e'),
        tekst: 'Bak et skrivebord som er altfor stort for rommet, sitter en gammel mann i frakk. Foran ham ligger en tykk journal i svart skinn, åpen. Han leser. Støvet på skuldrene hans har sitt eget støv.\n«Sett Dem,» sier han uten å se opp. «De er sent ute. De er alltid sent ute.»',
        valg: [
          { tekst: 'Spør hvem som skriver journalen', gjor: () => ({ tekst: '«Ingen. Den skriver seg selv. Jeg skrev det første ordet i 1887. Det var navnet mitt. Siden har jeg ikke fått et ord inn.»\nHan blar om. «Jeg ville skrive ned sinnene i huset, så vi kunne gjøre dem sunne. Journalen syntes det var en god idé. Den begynte med meg.»' }) },
          { tekst: 'Les over skulderen hans', gjor: () => les() },
          { tekst: 'Ta pennen fra ham', hint: 'Journalen blir svakere. Litt mer mørke i blodet.', gjor: () => { h.brukt = true; run.pennen = true; (run.sjefSvekk || (run.sjefSvekk = {}))[6] = .2; Folge.morb(15); if (typeof Merknad === 'object') Merknad.gi('pennen'); return { tekst: 'Han slipper den uten å kjempe. Pennen er varm. Den har ventet på noen som tør.\nEt sted under deg lukker Journalen seg litt, som en munn som har bitt seg i tunga. «Nå er det De som skriver under,» sier forstanderen. «Det er ikke så lett som det ser ut.»' }; } },
          { tekst: 'La ham lese i fred', gjor: () => { h.brukt = true; Folge.hel(25); return { tekst: '«Takk,» sier han. «Ingen har latt meg være i fred på trettiseks år.»\nHan leser videre. Du hører at han leser om deg.' }; } }] };
    }
  },
  /* første gang pasienten kommer inn i en drøm: bare de kapitlene som rekker fram til sannheten */
  kapittelFor(H, fra) {
    const run = G.run, start = (AWAKENINGS[run.awk] && AWAKENINGS[run.awk].depth) || 1, n = 6 - start, i = fra - start;
    const rekke = { 5: [1, 2, 3, 4, 5], 4: [1, 3, 4, 5], 3: [1, 4, 5], 2: [4, 5], 1: [5] }[n] || [1, 2, 3, 4, 5];
    return rekke[Math.max(0, Math.min(rekke.length - 1, i))];
  }
};

/* ---------- koblinger ---------- */
HENDELSER.forstanderen = Historie.hendelse;
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
  $('sisteOk').onclick = etterord; $('sisteOk').focus(); Sound.play('paper');
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
{ const _s = spawnBoss; spawnBoss = function (...a) {
  const B = _s.apply(this, a); if (!B) return B;
  if (B.type === 'journalen') setTimeout(() => { if (B.alive) FX.bubble(B, 'Du gjorde. Hver gang du døde.', 2.8, 'boss'); }, 2300);
  if (B.type === 'hjort' && G.run && G.run.historie && G.run.historie.tegn === 'hest' && G.run.historie.sett) setTimeout(() => { if (B.alive) FX.bubble(B, 'I drømmen din var jeg en hvit hest.', 2.6, 'boss'); }, 2400);
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
  if (s && H && H.sett >= 2 && !h.data.egen && Math.random() < .5) { const S = Drom.ord(H); h.data.egen = true; s.tekst = `Et hørespill på prøvesendingen. «...og så dro ${S.kort} ${S.N} fra ${S.fra} den dagen, og det kom aldri noen tilbake for å fortelle hvorfor. Bare én visste det, og den ene ble innlagt på et sanatorium i 1923 for noe helt annet.»\nStemmen i radioen høres ut som din. Noen i radioen hoster og sier: «Pause. Vi fortsetter når pasienten er klar.»`; }
  return s;
}; }
// merknader for sjefene som manglet, og for pennen
Object.assign(MERKNADER, {
  klumpen: { navn: 'Løsrevet', krav: 'Behandle Den Store Klumpen.', gir: 'Æren, og en følelse av at noen endelig slipper hverandre.' },
  hekk: { navn: 'Villnis', krav: 'Behandle Overgartner Ansgar Hekk.', gir: 'Parken får vokse som den vil.' },
  hjort: { navn: 'Ansiktet tilbake', krav: 'Behandle Den hvite hjorten.', gir: 'Hjorten husker hvem den var.' },
  pennen: { navn: 'Pennen', krav: 'Ta pennen fra forstanderen i Dypet.', gir: 'Utskrivningsbrevet kan signeres av pasienten selv.' }
});
{ const _ob = Merknad.onBoss; Merknad.onBoss = function (B) { _ob.call(this, B); if (['klumpen', 'hekk', 'hjort'].includes(B.type)) this.gi(B.type); }; }
// seks nye journalfragmenter: grunnleggelsen, skogen, forstanderen og hele historien
LORE.push(
  { t: 'Forstanderens første notat, 1887', b: 'I dag kjøpte jeg en journal i svart skinn hos Cammermeyer, to kroner og femti. Den skal romme alle sinn i dette huset, så vi kan gjøre dem sunne. Jeg skrev mitt eget navn på første side, for ordens skyld. M. Morbeck' },
  { t: 'Forstanderens andre notat, 1888', b: 'Journalen har skrevet et navn jeg ikke skrev. Pasienten kom neste morgen, med en koffert og et navn som ikke var hans. Han kjente meg igjen. Jeg har aldri sett ham før.' },
  { t: 'Byggmesterens regning, 1901', b: 'For kjeller under kjeller: ingen arbeidstimer. Den var der da vi kom. Vi har likevel sendt regning, av prinsipp.' },
  { t: 'Olsens notat, høsten 1918', b: 'Skogen kom i natt. Ingen har plantet den. Jeg fikk nøkkel til den i posten i morges. Avsender: Journalen. Frimerket var slikket.' },
  { t: 'Siste notat fra forstanderen', b: 'Jeg har sluttet å skrive. Jeg leser. Et sted i boka finnes en pasient som leser seg ferdig. Da får vi gå, begge to. Jeg tror jeg har kommet til ham nå. Han har mange navn.' },
  { t: 'Hele historien', b: 'Huset ble bygd i 1887 for å gjøre sinn sunne. Forstanderen skrev det ned i en journal, og journalen begynte å skrive tilbake. Den skriver med det vi ikke sier høyt, og den vokser nedover når vi slutter å lese. Hver pasient er den samme sjela med et nytt navn. Du blir skrevet ut når du har lest deg ferdig. Ikke før. P.S. Ikke spis kaka.' }
);
