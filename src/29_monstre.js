/* ============================================================
   MONSTRE  -  de groteske fiendene ChatGPT foreslo, laget i koden til bildene kommer.
   - Kasteren: en gammel mann i flekkete morgenkåpe. Holder avstand, merker treffstedet,
     løfter armen og kaster en klump i bue. Klumpen blir til et brunt søl som gjør deg treg.
   - Trillepasienten: sitter i en knirkende rullestol med stort hjul. Svinger tregt, kjører
     på deg i full fart (krasjer i veggen) og kaster bekken.
   - Speilpasienten: har et håndspeil som hode, og speilet viser ansiktet ditt. Går i sporet
     ditt litt etter deg, slår der du nettopp var og blender deg med lyset fra lampene.
     Knuses den, får du sju års ulykke (mindre flaks resten av etasjen).
   - Minisjefer: Hviskekoret (sju munner og mange ører i en kormesserskjorte, ord som
     prosjektiler, røyk og korskrik), Tannlegen (trekker tennene dine, tannregn og bor) og
     Den hodeløse portieren (kaster sitt eget hode som en bumerang).
   - Den Store Klumpen er en sjef (31_sjefpulje.js). Tegningen og delene ligger her.
   Lagdelte skapninger (Hviskekoret, Klumpen) bygges av Lagdukke: mange tegnede deler som
   beveger seg hver for seg, i stedet for hode og kropp.
   Alle tegninger kan byttes med bilder fra ChatGPT: figur_kasteren.png, figur_trille.png,
   figur_speil.png, figur_tannlege.png og figur_portier.png (mal_figur), og enkeltbilder med
   nøklene som står i manifestet (koret_kropp, koret_munn1 ...).
   ============================================================ */
Object.assign(Sound.lib, {
  kast: [{ n: 1, d: .22, f0: 500, f1: 1800, ft: 'bandpass', v: .22 }],
  hjul: [{ w: 'sawtooth', f: 620, d: .35, pd: -.25, v: .05 }, { w: 'sawtooth', f: 710, d: .3, pd: .2, v: .04, at: .12 }],
  glassknus: [{ arp: [2600, 3100, 2200, 2900], nl: .025, w: 'triangle', v: .16 }, { n: 1, d: .35, f0: 8000, f1: 2500, ft: 'highpass', v: .3 }],
  hvisk: [{ n: 1, d: .9, f0: 2600, f1: 5200, ft: 'bandpass', v: .08 }, { n: 1, d: .7, f0: 3400, f1: 1900, ft: 'bandpass', v: .06, at: .35 }],
  korskrik: [{ w: 'sawtooth', f: 420, d: 1.2, pd: .45, v: .07 }, { w: 'sawtooth', f: 560, d: 1.1, pd: .4, v: .06 }, { w: 'sawtooth', f: 330, d: 1.3, pd: .5, v: .06 }, { n: 1, d: 1, f0: 3000, f1: 600, ft: 'bandpass', v: .12 }],
  bor: [{ w: 'sawtooth', f: 1900, d: .5, pd: .04, v: .05 }, { w: 'square', f: 2300, d: .45, pd: -.03, v: .03 }],
  bitt: [{ w: 'square', f: 240, d: .08, pd: .6, v: .2 }, { n: 1, d: .06, f0: 2000, f1: 500, ft: 'bandpass', v: .25 }]
});
Object.assign(ENEMIES, {
  kasteren: { name: 'Kasteren', hp: 28, speed: 2.2, r: .42, dmg: 11, xp: 12, teeth: [1, 3], bubbleH: 3.0, weapon: 'klump', blood: 0xa01414 },
  trille: { name: 'Trillepasienten', hp: 48, speed: 3.6, r: .52, dmg: 13, xp: 14, teeth: [2, 4], bubbleH: 2.8, skygge: .6 },
  speil: { name: 'Speilpasienten', hp: 34, speed: 3.0, r: .42, dmg: 12, xp: 14, teeth: [1, 3], bubbleH: 3.2, blood: 0x8a1818 },
  klumpunge: { name: 'Klumpunge', hp: 12, speed: 3.9, r: .32, dmg: 6, xp: 3, teeth: [0, 1], bubbleH: 1.4, blood: 0xa0303a },
  koret: { name: 'Hviskekoret', hp: 330, speed: 1.3, r: .85, dmg: 11, xp: 60, teeth: [16, 24], bubbleH: 3.9, mini: true, skygge: .9, blood: 0x6a2a3a, tittel: 'Sju munner og ingen hjerne' },
  tannlege: { name: 'Tannlegen', hp: 300, speed: 2.7, r: .55, dmg: 14, xp: 55, teeth: [26, 38], bubbleH: 3.9, mini: true, weapon: 'tang', skygge: .6, tittel: 'Trekker alt som sitter løst' },
  portier: { name: 'Den hodeløse portieren', hp: 320, speed: 2.5, r: .55, dmg: 13, xp: 55, teeth: [20, 30], bubbleH: 3.4, mini: true, weapon: 'knippe', skygge: .6, tittel: 'Holder døren. Og hodet.' }
});
Object.assign(LINES, {
  kasteren: ['Fang!', 'Jeg har mer der den kom fra.', 'Tre poeng!', 'Hold deg unna, jeg er dekorert!', 'Hvem vil ha en gave?', 'Det er ikke det du tror. Det er verre.'],
  trille: ['Pass beina!', 'Bremsene er en myte!', 'Vroom.', 'Jeg har forkjørsrett!', 'Skyv meg, da!', 'Hjulene mine er eldre enn deg.'],
  speil: ['...', 'Du ser trøtt ut.', 'Jeg er deg, bare penere.', 'Snu deg.', 'Hvem av oss er ekte?', 'Du har noe mellom tennene.'],
  klumpunge: ['mamma?', 'varmt', '*kliss*', 'vi'],
  koret: ['...du kunne ha reddet dem...', '...alle vet det...', '...hun sa det om deg...', 'hysj hysj hysj', '...vi synger for deg...', '...skyld...skyld...'],
  tannlege: ['Gap opp!', 'Dette kjenner du bare litt.', 'Så mange fine tenner. Så få igjen.', 'Skyll, takk.', 'Har du pusset i dag? Nei.'],
  portier: ['Velkommen! Har du reservasjon?', 'Hodet mitt er der borte. Ikke spør.', 'Uten hode, men ikke uten manerer.', 'Tørk av deg på beina.', 'Rom 13 er dessverre opptatt.']
});
Object.assign(DEATH_CAUSES, {
  kasteren: ['Truffet av noe Kasteren hadde laget selv.', 'Døde med en klump i håret.', 'Fikk en gave man ikke kan levere tilbake.'],
  trille: ['Overkjørt av en rullestol i full fart.', 'Fikk et bekken i bakhodet.', 'Kom i veien for en som hadde forkjørsrett.'],
  speil: ['Drept av sitt eget speilbilde.', 'Så seg selv i øynene. For lenge.', 'Skåret opp av sju års ulykke.'],
  klumpunge: ['Kvalt av en klump som ville kose.', 'Spist av en liten del av noe større.'],
  koret: ['Hvisket i hjel. Det tok lang tid.', 'Ble fortalt sannheten om seg selv av sju munner samtidig.'],
  tannlege: ['Trukket. Alle tennene, og så resten.', 'Døde i tannlegestolen. Det var ingen stol.'],
  portier: ['Slått av en hodeløs mann. Hodet så på.', 'Ble vist ut. For godt.', 'Bitt av et hode uten kropp.']
});
DEPTH_ENEMIES[1].push('kasteren', 'kasteren', 'trille', 'trille');
DEPTH_ENEMIES[2].push('kasteren', 'kasteren', 'trille');
DEPTH_ENEMIES[3].push('kasteren', 'trille', 'speil');
DEPTH_ENEMIES[4].push('kasteren', 'speil', 'trille');
DEPTH_ENEMIES[5].push('speil', 'speil', 'kasteren');
DEPTH_ENEMIES[6].push('speil', 'speil', 'trille', 'kasteren');
Object.assign(MESTER_TITTEL, { kasteren: 'Kasteren', trille: 'Pasient', speil: 'Speilet', klumpunge: 'Ungen' });

/* ============================================================
   TEGNINGER. MONSTER_ART[type] = { hode(v), kropp(v), box } der v er f, b eller s (sett fra siden, mot høyre).
   Nøklene blir hode_<type>_<v> og kropp_<type>_<v>, de samme som figurark fra ChatGPT klippes til.
   ============================================================ */
const MONSTER_ART = {};
{ const _cp = charPart; charPart = function (type, piece, v) {
  const M = MONSTER_ART[type];
  if (M && M[piece]) {
    const box = (M.box && M.box[piece]) || (piece === 'hode' ? [1.2, 1.1, .6, .1] : [1.3, 1.0, .65, .08]), k = M.big || 1;
    return Art.part(piece + '_' + type + '_' + v, box[0] * k, box[1] * k, box[2] * k, box[3], M[piece](v));
  }
  return _cp(type, piece, v);
}; }
const kv = (v, f, b, s) => v === 'b' ? b : v === 's' ? s : f;

/* ---------- Kasteren: vill, grå sveis, digre briller, åpen munn med tunga ute, flekkete kåpe ---------- */
const KAST = { hud: '#ecc9a4', har: '#dcd8d0', kape: '#c8922e', flekk: '#6b4423', belte: '#5a3a18' };
RIG.kasteren = { hip: .44, hipW: .12, neck: .54, shW: .24, shY: .45, armW: .13, legW: .11, handR: .08, arm: KAST.kape, leg: KAST.hud, hand: KAST.hud, shoe: 'barfot:' + KAST.hud, scale: .8, headLag: 1.4 };
MONSTER_ART.kasteren = {
  hode: v => g => {
    const S = KAST.hud, H = KAST.har, cy = -.46;
    const sky = v === 's' ? A.blob(A.spikes(-.06, cy - .04, .4, Math.PI * .5, Math.PI * 1.8, 11, .22, .1).concat([[-.12, cy + .22]]))
      : A.blob(A.spikes(0, cy - .04, .42, Math.PI * .7, Math.PI * 2.3, 13, .24, .1).concat([[.36, cy + .14], [0, cy + .2], [-.36, cy + .14]]));
    A.cel(g, sky, H, { sk: .72 });
    if (v === 'b') {
      for (const s of [-1, 1]) A.cel(g, A.ell(s * .38, cy + .06, .08, .12), S);
      A.cel(g, A.ell(0, cy + .06, .33, .34), H, { sk: .72, hi: false });
      A.cel(g, A.ell(.04, cy - .08, .16, .12), S, { lw: .025, hi: false }); // skallen titter fram
      for (const [x, y] of [[-.1, cy - .12], [.1, cy - .02]]) A.flat(g, A.ell(x, y, .03, .02), 'rgba(140,90,50,.45)', 0);
      A.line(g, [[-.14, cy + .3], [0, cy + .34], [.15, cy + .29]], .02, '#8a6a50');
      return;
    }
    if (v === 's') {
      A.cel(g, A.ell(.03, cy + .05, .33, .36), S);
      A.cel(g, A.ell(-.12, cy + .07, .08, .11), S); A.curve(g, [-.14, cy + .02], [-.1, cy + .07], [-.14, cy + .12], .02);
      A.line(g, [[.1, cy - .01], [-.06, cy + .03]], .03);
      A.flat(g, A.ell(.23, cy + .01, .15, .16), 'rgba(232,244,250,.9)', .05); A.flat(g, A.ell(.25, cy + .01, .1, .1), '#fbf8f0', .025); A.dot(g, .3, cy, .048); A.dot(g, .285, cy - .015, .015, '#ffffff');
      A.cel(g, A.blob([[.08, cy - .2], [.2, cy - .26], [.36, cy - .2], [.3, cy - .15], [.14, cy - .16]]), H, { lw: .03, hi: false });
      A.cel(g, A.blob([[.32, cy + .08], [.49, cy + .15], [.47, cy + .24], [.33, cy + .23]]), '#e8a88c', { lw: .035 });
      A.cel(g, A.ell(.3, cy + .33, .09, .07), '#5a1414', { lw: .035, hi: false });
      A.cel(g, A.blob([[.3, cy + .34], [.4, cy + .33], [.44, cy + .44], [.38, cy + .5], [.32, cy + .43]]), '#e87a8a', { lw: .03, hi: false });
      for (const [x, y] of [[.1, cy + .3], [.18, cy + .36], [.06, cy + .22]]) A.dot(g, x, y, .012, '#8a7a6a');
      return;
    }
    for (const s of [-1, 1]) A.cel(g, A.ell(s * .38, cy + .07, .09, .12), S);
    A.cel(g, A.ell(0, cy + .04, .34, .37), S);
    for (let i = 0; i < 3; i++) A.curve(g, [-.15, cy - .2 + i * .045], [0, cy - .23 + i * .045], [.15, cy - .2 + i * .045], .012, '#b8876a');
    A.flat(g, A.ell(.18, cy - .16, .035, .025), 'rgba(140,90,50,.45)', 0);
    // buskete bryn, det ene høyt oppe
    A.cel(g, A.blob([[-.28, cy - .1], [-.16, cy - .17], [-.04, cy - .12], [-.16, cy - .1]]), H, { lw: .025, hi: false });
    A.cel(g, A.blob([[.04, cy - .1], [.16, cy - .24], [.3, cy - .18], [.16, cy - .14]]), H, { lw: .025, hi: false });
    // briller som forstørrer øynene, som ser hver sin vei
    for (const s of [-1, 1]) { A.flat(g, A.ell(s * .15, cy + .02, .15, .15), 'rgba(232,244,250,.9)', .05); A.flat(g, A.ell(s * .15, cy + .02, .105, .105), '#fbf8f0', .025); A.line(g, [[s * .3, cy], [s * .37, cy + .03]], .03); }
    A.dot(g, -.19, cy - .02, .05); A.dot(g, .19, cy + .05, .05); A.dot(g, -.2, cy - .035, .016, '#ffffff'); A.dot(g, .18, cy + .035, .016, '#ffffff');
    A.line(g, [[-.02, cy - .01], [.02, cy - .01]], .045);
    A.cel(g, A.blob([[-.05, cy + .09], [.03, cy + .08], [.09, cy + .16], [.06, cy + .22], [-.05, cy + .22], [-.1, cy + .16]]), '#e8a88c', { lw: .035 });
    A.cel(g, A.ell(.01, cy + .31, .12, .075), '#5a1414', { lw: .04, hi: false });
    A.flat(g, A.rr(-.07, cy + .24, .04, .045, .01), '#f4ecd0', .015); A.flat(g, A.rr(.05, cy + .32, .035, .04, .01), '#e8d8a0', .015);
    A.cel(g, A.blob([[-.04, cy + .32], [.07, cy + .32], [.08, cy + .43], [.01, cy + .49], [-.05, cy + .42]]), '#e87a8a', { lw: .03, hi: false });
    A.line(g, [[.015, cy + .34], [.015, cy + .44]], .015, '#b84a5a');
    for (const [x, y] of [[-.16, cy + .3], [-.2, cy + .24], [.16, cy + .34], [.21, cy + .27], [-.08, cy + .4], [.12, cy + .41]]) A.dot(g, x, y, .012, '#8a7a6a');
  },
  kropp: v => g => {
    const Y = KAST.kape, top = -.52, w0 = v === 's' ? .26 : .38, w1 = v === 's' ? .2 : .27, h = v === 's' ? .06 : 0;
    A.cel(g, A.blob([[-w0, 0], [-w0 * .4, .04], [w0 * .5, .03], [w0 + .02, 0], [w1 + .04 + h, top + .16], [w1 - .02 + h, top + .01], [h, top - .03], [-w1 + .02 + h, top + .02], [-w1 - .04, top + .18]]), Y, { sk: .76 });
    for (const [x, y, r] of [[-.2, -.12, .07], [.14, -.36, .05], [.24, -.08, .06], [-.05, -.4, .04], [.02, -.06, .05]]) A.flat(g, A.blob([[x - r, y], [x, y - r * .8], [x + r * 1.1, y - r * .2], [x + r * .6, y + r * .7], [x - r * .5, y + r * .6]]), 'rgba(107,68,35,.55)', 0);
    if (v === 'f') {
      A.cel(g, A.poly([[-.12, top + .02], [0, top + .26], [.12, top + .02], [.06, top], [0, top + .1], [-.06, top]]), Col.light(Y, .22), { lw: .03, hi: false });
      A.line(g, [[-.04, top + .08], [.02, top + .12], [-.02, top + .16]], .012, '#6a5040');
      A.cel(g, A.rr(.08, top + .22, .15, .13, .02), Col.dark(Y, .85), { lw: .03, hi: false });
      A.cel(g, A.ell(.155, top + .22, .07, .05), KAST.flekk, { lw: .025, hi: false }); // en klump i lomma, klar til bruk
      A.line(g, [[0, top + .26], [0, -.03]], .025, Col.dark(Y, .6));
    }
    if (v === 's') { A.line(g, [[.1, top + .04], [.14, top + .26]], .025, Col.dark(Y, .6)); A.cel(g, A.rr(.06, top + .26, .14, .12, .02), Col.dark(Y, .85), { lw: .03, hi: false }); }
    A.cel(g, A.rr(-w0 + .03, -.27, (w0 - .03) * 2, .07, .03), KAST.belte, { lw: .03, hi: false });
    if (v !== 'b') A.line(g, [[v === 's' ? .14 : .05, -.22], [v === 's' ? .1 : .01, -.08]], .03, KAST.belte);
    A.line(g, [[-w0 * .8, -.04], [-w0 * .55, -.03]], .018, Col.dark(Y, .6));
  }
};
WEAPON_ART.klump = [.5, .5, .25, .14];
{ const _dw = drawWeapon; drawWeapon = id => id !== 'klump' ? _dw(id) : g => {
  A.cel(g, A.blob([[-.13, -.08], [-.15, -.2], [-.05, -.3], [.08, -.29], [.15, -.18], [.1, -.07], [0, -.04]]), '#6b4423', { line: '#2a1408', lw: .035, sk: .7 });
  A.line(g, [[-.07, -.18], [.02, -.23], [.08, -.18]], .02, '#3a2210');
}; }

/* ---------- Trillepasienten: gammel mann med bandasje rundt hodet i en knirkende rullestol ---------- */
const TRIL = { hud: '#e8c4a0', tre: '#7a4a28', treL: '#2a1408', jern: '#8a9096', teppe: '#a83a3a', teppe2: '#3a6a4a', kjole: '#c8d8e8' };
RIG.trille = { hip: .52, hipW: .12, neck: .5, shW: .23, shY: .42, armW: .11, legW: .1, handR: .08, arm: TRIL.kjole, leg: TRIL.hud, hand: TRIL.hud, shoe: 'hvit', scale: .86, headLag: 1.6, sete: true, hjul: { r: .36, x: -.04, y: .37 } };
MONSTER_ART.trille = {
  box: { kropp: [1.7, 1.9, .85, .6], hjul: [.9, .9, .45, .45] },
  hode: v => g => {
    const S = TRIL.hud, cy = -.44;
    if (v === 'b') { A.cel(g, A.ell(0, cy, .31, .33), S); A.cel(g, A.blob([[-.33, cy - .02], [-.3, cy - .2], [0, cy - .28], [.3, cy - .2], [.33, cy - .02], [0, cy - .1]]), '#f2eee4', { sk: .82 }); A.line(g, [[-.3, cy - .08], [.3, cy - .1]], .015, '#c8c0b0'); for (const s of [-1, 1]) A.cel(g, A.ell(s * .32, cy + .06, .07, .1), S); return; }
    if (v === 's') {
      A.cel(g, A.ell(.03, cy, .31, .33), S);
      A.cel(g, A.blob([[-.28, cy - .02], [-.26, cy - .22], [.04, cy - .32], [.3, cy - .2], [.33, cy - .06], [.1, cy - .1]]), '#f2eee4', { sk: .82 });
      A.cel(g, A.ell(-.1, cy + .06, .07, .1), S);
      A.flat(g, A.ell(.22, cy + .02, .06, .045), '#fbf6ea', .025); A.dot(g, .24, cy + .025, .025);
      A.cel(g, A.blob([[.3, cy + .06], [.44, cy + .14], [.4, cy + .2], [.3, cy + .18]]), '#e0a88c', { lw: .03 });
      A.curve(g, [.2, cy + .27], [.3, cy + .31], [.38, cy + .25], .03); A.dot(g, .3, cy + .29, .02, '#f4ecd0');
      return;
    }
    A.cel(g, A.ell(0, cy, .31, .33), S);
    for (const s of [-1, 1]) A.cel(g, A.ell(s * .32, cy + .06, .07, .1), S);
    // bandasje rundt hodet, over det ene øyet
    A.cel(g, A.blob([[-.34, cy - .02], [-.3, cy - .24], [0, cy - .33], [.3, cy - .24], [.34, cy - .02], [.26, cy + .08], [.02, cy + .02], [-.2, cy - .08]]), '#f2eee4', { sk: .82 });
    A.line(g, [[-.28, cy - .1], [.3, cy - .14]], .015, '#c8c0b0'); A.line(g, [[-.2, cy - .22], [.24, cy - .24]], .015, '#c8c0b0');
    A.flat(g, A.ell(.14, cy - .02, .05, .04), 'rgba(170,40,40,.6)', 0);
    A.flat(g, A.ell(-.13, cy + .03, .075, .055), '#fbf6ea', .025); A.dot(g, -.12, cy + .04, .028); A.line(g, [[-.21, cy - .01], [-.05, cy]], .025);
    A.cel(g, A.blob([[-.04, cy + .06], [.04, cy + .06], [.07, cy + .15], [0, cy + .19], [-.07, cy + .15]]), '#e0a88c', { lw: .03 });
    // tannløst glis
    A.cel(g, A.blob([[-.14, cy + .24], [0, cy + .22], [.15, cy + .23], [.1, cy + .3], [0, cy + .32], [-.1, cy + .3]]), '#6a1a1a', { lw: .03, hi: false });
    A.dot(g, .06, cy + .25, .02, '#f4ecd0');
    for (const [x, y] of [[.2, cy + .14], [-.2, cy + .18], [.08, cy - .02]]) A.flat(g, A.ell(x, y, .025, .018), 'rgba(140,90,50,.4)', 0);
  },
  kropp: v => g => {
    const T = TRIL.tre, TL = TRIL.treL, J = TRIL.jern, top = -.46;
    const stativ = x => { A.line(g, [[x, .1], [x, -1.08]], .05, INK); A.line(g, [[x, .1], [x, -1.08]], .025, J); A.line(g, [[x - .12, -1.08], [x + .12, -1.08]], .035, INK); A.cel(g, A.rr(x + .02, -1.06, .16, .24, .05), '#f0e6a0', { lw: .03 }); A.line(g, [[x + .1, -.82], [x + .08, -.3]], .015, '#8a8040'); };
    if (v === 'b') {
      stativ(.34);
      for (const s of [-1, 1]) { A.cel(g, A.ell(s * .44, .14, .07, .36), '#3a3a40', { lw: .035, hi: false }); A.line(g, [[s * .44, -.2], [s * .44, .48]], .02, J); }
      A.cel(g, A.rr(-.36, top - .1, .72, .66, .04), T, { line: TL, lw: .04 }); for (let i = 1; i < 4; i++) A.line(g, [[-.34, top - .1 + i * .16], [.34, top - .1 + i * .16]], .02, TL);
      for (const s of [-1, 1]) { A.line(g, [[s * .34, top - .1], [s * .38, top - .26]], .05, INK); A.line(g, [[s * .34, top - .1], [s * .38, top - .26]], .025, '#3a3a40'); }
      A.cel(g, A.rr(-.28, top + .56, .56, .1, .02), '#5a5a60', { lw: .03, hi: false });
      return;
    }
    if (v === 's') {
      stativ(-.36);
      A.line(g, [[-.3, top - .12], [-.24, .06]], .05, INK); A.line(g, [[-.3, top - .12], [-.24, .06]], .03, T); // ryggstø
      A.cel(g, A.rr(-.28, -.04, .5, .08, .02), T, { line: TL, lw: .035 }); // sete
      A.line(g, [[.2, .04], [.3, .4]], .04, INK); A.line(g, [[.3, .4], [.44, .4]], .04, INK); // fotbrett
      A.cel(g, A.ell(.28, .44, .06, .06), '#3a3a40', { lw: .03, hi: false }); // lite forhjul
      // pasienten: sammensunket overkropp, teppe over knærne
      A.cel(g, A.blob([[-.2, 0], [.08, .02], [.14, top + .2], [.06, top], [-.14, top - .02], [-.24, top + .2]]), TRIL.kjole, { sk: .82 });
      A.cel(g, A.blob([[-.1, -.02], [.26, -.02], [.36, .3], [.3, .34], [.16, .12], [-.08, .1]]), TRIL.teppe, { sk: .75, lw: .04 });
      for (let i = 0; i < 3; i++) A.line(g, [[-.02 + i * .1, -.01], [.12 + i * .08, .22]], .02, TRIL.teppe2);
      return;
    }
    stativ(.4);
    for (const s of [-1, 1]) { A.cel(g, A.ell(s * .44, .12, .075, .38), '#3a3a40', { lw: .04, hi: false }); A.line(g, [[s * .44, -.22], [s * .44, .48]], .02, J); A.line(g, [[s * .36, -.06], [s * .36, .36]], .03, INK); }
    A.cel(g, A.rr(-.36, top - .14, .72, .5, .05), T, { line: TL, lw: .04 }); // ryggstø bak
    A.cel(g, A.blob([[-.26, .02], [.26, .02], [.28, top + .2], [.2, top + .02], [0, top - .02], [-.2, top + .02], [-.28, top + .2]]), TRIL.kjole, { sk: .84 });
    A.line(g, [[-.1, top + .04], [0, top + .14], [.1, top + .04]], .02, '#8aa0b8');
    for (const s of [-1, 1]) A.cel(g, A.rr(s * .3 - .06, -.1, .12, .08, .02), T, { line: TL, lw: .03, hi: false }); // armlener
    // rutete teppe over knærne
    A.cel(g, A.rr(-.3, -.08, .6, .44, .06), TRIL.teppe, { sk: .75, lw: .04 });
    for (let i = 0; i < 4; i++) { A.line(g, [[-.28, -.02 + i * .1], [.28, -.02 + i * .1]], .02, TRIL.teppe2); A.line(g, [[-.2 + i * .14, -.06], [-.2 + i * .14, .34]], .02, TRIL.teppe2); }
    A.line(g, [[-.24, .42], [.24, .42]], .04, INK);
  },
  hjul: () => g => {
    A.flat(g, A.ell(0, 0, .36, .36), '#2a2a30', .05); A.flat(g, A.ell(0, 0, .3, .3), '#cfd3d8', .03);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI; A.line(g, [[Math.cos(a) * .29, Math.sin(a) * .29], [-Math.cos(a) * .29, -Math.sin(a) * .29]], .018, '#5a5a62'); }
    A.flat(g, A.ell(0, 0, .26, .26), null, .02, '#8a9096'); A.cel(g, A.ell(0, 0, .06, .06), '#8a9096', { lw: .025, hi: false });
    A.flat(g, A.ell(.2, -.1, .04, .025), '#c8322a', 0); // en rød flekk som viser at hjulet ruller
  }
};

/* ---------- Speilpasienten: et håndspeil som hode, glasskår i sykehusskjorta ---------- */
const SPEIL = { gull: '#c8a040', gullL: '#4a3410', glass: '#b8ccd8', skjorte: '#b8c4b0' };
RIG.speil = { hip: .5, hipW: .1, neck: .7, shW: .21, shY: .63, armW: .1, legW: .09, handR: .07, arm: SPEIL.skjorte, leg: '#d8c8b8', hand: '#d8c8b8', shoe: 'barfot:#d8c8b8', scale: .86, headLag: 1.7 };
MONSTER_ART.speil = {
  box: { hode: [1.2, 1.3, .6, .1] },
  hode: v => g => {
    const cy = -.58;
    A.line(g, [[0, .04], [0, cy + .38]], .12, INK); A.line(g, [[0, .04], [0, cy + .38]], .07, SPEIL.gull); // skaftet er halsen
    if (v === 's') { A.cel(g, A.ell(0, cy, .08, .42), SPEIL.gull, { line: SPEIL.gullL, lw: .045 }); A.line(g, [[.04, cy - .38], [.04, cy + .38]], .02, '#fff4d0'); return; }
    A.cel(g, A.ell(0, cy, .34, .42), SPEIL.gull, { line: SPEIL.gullL, lw: .05 });
    for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; A.dot(g, Math.cos(a) * .31, cy + Math.sin(a) * .39, .025, '#e8c860'); }
    if (v === 'b') { A.cel(g, A.ell(0, cy, .26, .34), '#6a4a24', { line: SPEIL.gullL, lw: .03 }); A.cel(g, A.blob([[0, cy - .2], [.1, cy - .06], [0, cy + .2], [-.1, cy - .06]]), '#c8a040', { lw: .025, hi: false }); return; }
    const gr = g.createLinearGradient(-.25, cy - .3, .25, cy + .3); gr.addColorStop(0, '#e8f2f6'); gr.addColorStop(.5, SPEIL.glass); gr.addColorStop(1, '#7a90a0');
    A.flat(g, A.ell(0, cy, .26, .34), gr, .03);
    A.line(g, [[-.16, cy - .2], [-.04, cy - .28]], .03, 'rgba(255,255,255,.8)'); A.line(g, [[.12, cy + .18], [.18, cy + .1]], .02, 'rgba(255,255,255,.6)');
  },
  kropp: v => g => {
    const K = SPEIL.skjorte, top = -.66, w0 = v === 's' ? .22 : .3, w1 = v === 's' ? .16 : .22;
    A.cel(g, A.blob([[-w0, 0], [w0, 0], [w1 + .04, top + .2], [w1, top], [0, top - .02], [-w1, top], [-w1 - .04, top + .2]]), K, { sk: .8 });
    for (let i = 0; i < 4; i++) A.dot(g, (i % 2 - .5) * .1, top + .14 + i * .08, .012, '#7a8474');
    // glasskår limt fast i huden, med litt blod rundt
    const rng = mulberry32(v === 'b' ? 5 : v === 's' ? 9 : 3);
    for (let i = 0; i < 6; i++) {
      const x = (rng() - .5) * w0 * 1.5, y = top + .1 + rng() * .5, s = .05 + rng() * .04;
      A.flat(g, A.ell(x + .01, y + .02, s * 1.3, s * .9), 'rgba(150,20,20,.45)', 0);
      A.cel(g, A.poly([[x - s, y + s * .4], [x - s * .2, y - s], [x + s, y - s * .3], [x + s * .3, y + s]]), '#c8dce8', { lw: .02, hi: false, sk: .85 });
      A.line(g, [[x - s * .4, y - s * .3], [x + s * .1, y - s * .6]], .012, '#ffffff');
    }
  }
};
function speilbilde(look) {
  // speilet viser ansiktet ditt, speilvendt, blekt og sprukket
  const key = 'speilbilde_' + JSON.stringify(look || {}).split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  return Art.part(key, .6, .8, .3, .4, g => {
    g.save(); A.ell(0, 0, .25, .33)(g); g.clip();
    try { const c = portraitCanvas('pasient', look); g.save(); g.scale(-1, 1); g.globalAlpha = .62; g.drawImage(c, -.3, -.34, .6, .6); g.restore(); } catch (e) { }
    g.fillStyle = 'rgba(170,200,220,.35)'; g.fillRect(-.3, -.4, .6, .8);
    g.restore();
    A.line(g, [[-.22, -.2], [-.02, -.02], [.04, .06], [.2, .22]], .014, 'rgba(40,50,60,.8)'); A.line(g, [[-.02, -.02], [.14, -.12]], .012, 'rgba(40,50,60,.7)');
  });
}

/* ---------- Tannlegen: pannespeil, voksbart, glis full av gulltenner, blodig frakk ---------- */
const TANN = { hud: '#f0cfae', frakk: '#f4f2ea' };
RIG.tannlege = { hip: .5, hipW: .15, neck: .78, shW: .33, shY: .68, armW: .14, legW: .13, handR: .1, arm: TANN.frakk, leg: '#3a3a44', hand: '#f4f0e8', shoe: 'klogg', scale: 1.22, headLag: .8 };
MONSTER_ART.tannlege = {
  hode: v => g => {
    const S = TANN.hud, cy = -.46;
    const speil = (x, y, r) => { A.cel(g, A.ell(x, y, r, r), '#d4d8dc', { line: '#3a3a44', lw: .04 }); A.flat(g, A.ell(x, y, r * .45, r * .45), '#2a2a30', .02); A.flat(g, A.ell(x - r * .3, y - r * .3, r * .2, r * .14), 'rgba(255,255,255,.8)', 0); };
    if (v === 'b') { A.cel(g, A.ell(0, cy, .36, .38), S); A.cel(g, A.rr(-.37, cy - .14, .74, .08, .03), '#3a3a44', { lw: .03, hi: false }); for (const s of [-1, 1]) A.cel(g, A.ell(s * .37, cy + .06, .07, .1), S); A.flat(g, A.blob([[-.2, cy + .3], [0, cy + .36], [.2, cy + .3], [.26, cy + .12], [-.26, cy + .12]]), '#7a5a3a', .02); return; }
    if (v === 's') {
      A.cel(g, A.ell(.03, cy, .35, .38), S); A.cel(g, A.rr(-.32, cy - .16, .66, .08, .03), '#3a3a44', { lw: .03, hi: false }); speil(.28, cy - .14, .12);
      A.cel(g, A.ell(-.12, cy + .06, .07, .1), S);
      A.flat(g, A.ell(.24, cy + .02, .06, .05), '#fbf6ea', .025); A.dot(g, .26, cy + .025, .026);
      A.cel(g, A.blob([[.3, cy + .1], [.46, cy + .16], [.4, cy + .22], [.3, cy + .2]]), '#e8a88c', { lw: .03 });
      A.cel(g, A.blob([[.18, cy + .22], [.42, cy + .24], [.5, cy + .18], [.44, cy + .28], [.2, cy + .28]]), '#3a2a1a', { lw: .025 });
      A.cel(g, A.blob([[.16, cy + .3], [.4, cy + .3], [.36, cy + .38], [.2, cy + .38]]), '#f4ecd0', { lw: .03, hi: false }); A.dot(g, .3, cy + .34, .025, '#f4dc7a');
      return;
    }
    for (const s of [-1, 1]) A.cel(g, A.ell(s * .37, cy + .06, .07, .1), S);
    A.cel(g, A.ell(0, cy, .36, .38), S);
    for (let i = 0; i < 4; i++) A.curve(g, [-.16 + i * .1, cy - .36], [-.1 + i * .1, cy - .41], [-.04 + i * .1, cy - .34], .015, '#5a4030'); // hårstrå som er kjemmet over
    A.cel(g, A.rr(-.37, cy - .2, .74, .08, .03), '#3a3a44', { lw: .03, hi: false }); speil(.02, cy - .18, .14);
    for (const s of [-1, 1]) { A.flat(g, A.ell(s * .13, cy + .02, .07, .055), '#fbf6ea', .025); A.dot(g, s * .13 + .015, cy + .025, .03); A.flat(g, A.ell(s * .13, cy + .02, .09, .075), 'rgba(230,245,255,.35)', .02); }
    A.line(g, [[-.04, cy + .02], [.04, cy + .02]], .02);
    A.flat(g, A.ell(-.2, cy - .08, .025, .04), 'rgba(160,210,240,.7)', .012); // svette
    A.cel(g, A.blob([[-.05, cy + .06], [.05, cy + .06], [.08, cy + .15], [0, cy + .18], [-.08, cy + .15]]), '#e8a88c', { lw: .03 });
    // voksbart med krøller
    A.cel(g, A.blob([[0, cy + .18], [-.12, cy + .16], [-.26, cy + .2], [-.34, cy + .12], [-.3, cy + .08], [-.26, cy + .14], [-.14, cy + .12], [0, cy + .15], [.14, cy + .12], [.26, cy + .14], [.3, cy + .08], [.34, cy + .12], [.26, cy + .2], [.12, cy + .16]]), '#3a2a1a', { lw: .025 });
    // glis med gulltenner
    A.cel(g, A.blob([[-.2, cy + .24], [.2, cy + .24], [.16, cy + .33], [0, cy + .36], [-.16, cy + .33]]), '#5a1414', { lw: .03, hi: false });
    for (let i = 0; i < 6; i++) A.flat(g, A.rr(-.17 + i * .058, cy + .24, .05, .05, .008), i === 1 || i === 4 ? '#f4dc7a' : '#f4ecd0', .012);
  },
  kropp: v => g => {
    const F = TANN.frakk, top = -.78, w0 = v === 's' ? .3 : .44, w1 = v === 's' ? .24 : .38;
    A.cel(g, A.blob([[-w0, 0], [w0, 0], [w1 + .04, top + .3], [w1, top + .04], [0, top], [-w1, top + .04], [-w1 - .04, top + .3]]), F, { sk: .84 });
    for (const [x, y, r] of [[-.2, top + .5, .07], [.18, top + .66, .05], [.06, top + .3, .04], [-.1, top + .7, .05]]) A.flat(g, A.ell(x, y, r, r * .8), 'rgba(160,20,20,.55)', 0);
    if (v === 'b') return;
    if (v === 'f') {
      A.cel(g, A.poly([[-.1, top + .02], [0, top + .1], [.1, top + .02], [.1, top + .08], [0, top + .12], [-.1, top + .08]]), '#b3261e', { lw: .025, hi: false }); // sløyfe
      A.line(g, [[0, top + .14], [0, -.04]], .02, '#b8b4a8');
      // belte med tenner på skrå over brystet
      A.line(g, [[-.32, top + .12], [.3, top + .6]], .08, INK); A.line(g, [[-.32, top + .12], [.3, top + .6]], .05, '#6a4226');
      for (let i = 0; i < 7; i++) { const t = i / 6, x = lerp(-.28, .26, t), y = lerp(top + .15, top + .57, t); A.cel(g, A.blob([[x - .025, y], [x + .025, y], [x + .02, y + .05], [x - .02, y + .05]]), i % 3 === 1 ? '#f4dc7a' : '#f4ecd0', { lw: .012, hi: false }); }
      A.cel(g, A.rr(.12, top + .2, .16, .16, .02), Col.dark(F, .9), { lw: .025, hi: false }); A.line(g, [[.16, top + .2], [.16, top + .08]], .025, '#8a9096'); A.line(g, [[.22, top + .2], [.24, top + .1]], .02, '#8a9096');
    } else { A.line(g, [[.08, top + .1], [.14, top + .5]], .02, '#b8b4a8'); A.line(g, [[-.2, top + .2], [.24, top + .5]], .06, '#6a4226'); }
  }
};
WEAPON_ART.tang = [.7, 1.4, .35, .12];
{ const _dw = drawWeapon; drawWeapon = id => id !== 'tang' ? _dw(id) : g => {
  for (const s of [-1, 1]) { A.line(g, [[s * .06, 0], [s * .1, -.5], [s * .03, -.7]], .09, INK); A.line(g, [[s * .06, 0], [s * .1, -.5], [s * .03, -.7]], .05, '#b4bcc2'); }
  A.cel(g, A.ell(0, -.7, .06, .06), '#8a9096', { lw: .025, hi: false });
  for (const s of [-1, 1]) A.cel(g, A.blob([[0, -.72], [s * .12, -.86], [s * .1, -1.1], [s * .02, -1.16], [s * .02, -.92]]), '#b4bcc2', { line: '#2f3a40', lw: .035 });
  A.cel(g, A.blob([[-.03, -1.14], [.03, -1.14], [.03, -1.06], [-.03, -1.06]]), '#f4dc7a', { lw: .015, hi: false }); // en gulltann i tangen
}; }

/* ---------- Den hodeløse portieren: uniform med gullknapper, halsstump, hodet under armen ---------- */
const PORT = { uni: '#2e4a3a', uniL: '#0e1a14', gull: '#d4b048', hud: '#e8d0b8' };
RIG.portier = { hip: .52, hipW: .15, neck: .84, shW: .34, shY: .76, armW: .14, legW: .13, handR: .1, arm: PORT.uni, leg: '#1e2a24', hand: '#f2f2ea', shoe: 'stovel', scale: 1.22, headLag: .25 };
MONSTER_ART.portier = {
  box: { hode: [1.0, .6, .5, .1] },
  // «hodet» er bare halsstumpen over den høye kragen
  hode: v => g => {
    A.cel(g, A.rr(-.2, -.2, .4, .22, .05), PORT.uni, { line: PORT.uniL, lw: .04 });
    A.line(g, [[-.2, -.18], [.2, -.18]], .03, PORT.gull);
    A.cel(g, A.ell(0, -.24, .13, .06), '#c86a6a', { lw: .035 }); A.flat(g, A.ell(0, -.25, .07, .03), '#8a1a1a', 0);
    if (v !== 'b') { A.flat(g, A.rr(-.03, -.2, .045, .14, .02), '#8a1a1a', 0); A.dot(g, -.005, -.05, .025, '#8a1a1a'); }
    A.cel(g, A.rr(-.14, -.3, .1, .06, .02), '#f2eee4', { lw: .02, hi: false });
  },
  kropp: v => g => {
    const U = PORT.uni, top = -.86, w0 = v === 's' ? .3 : .46, w1 = v === 's' ? .26 : .4;
    A.cel(g, A.blob([[-w0, 0], [w0, 0], [w1 + .05, top + .3], [w1, top + .04], [0, top], [-w1, top + .04], [-w1 - .05, top + .3]]), U, { line: PORT.uniL, sk: .7 });
    if (v !== 's') for (const s of [-1, 1]) A.cel(g, A.rr(s * .36 - .09, top - .02, .18, .07, .02), PORT.gull, { lw: .025, hi: false }); // epåletter
    if (v === 'f') {
      for (let i = 0; i < 4; i++) for (const s of [-1, 1]) A.cel(g, A.ell(s * .12, top + .18 + i * .15, .03, .03), PORT.gull, { lw: .015, hi: false });
      A.line(g, [[-.3, top + .12], [-.18, top + .3], [-.34, top + .42]], .025, PORT.gull);
      A.cel(g, A.rr(.18, top + .26, .18, .07, .01), '#f2eee4', { lw: .018, hi: false });
    }
    A.cel(g, A.rr(-w0 + .04, top + .64, (w0 - .04) * 2, .07, .02), '#1a1a1a', { lw: .025, hi: false });
    A.line(g, [[-.12, top + .06], [0, top + .14], [.12, top + .06]], .025, PORT.gull);
  }
};
function portierHode() {
  return Art.part('portierhode', .8, .8, .4, .4, g => {
    const S = PORT.hud, cy = .02;
    A.cel(g, A.ell(0, cy, .28, .3), S);
    A.flat(g, A.ell(0, cy + .3, .14, .05), '#8a1a1a', .03); A.flat(g, A.rr(-.04, cy + .3, .05, .1, .02), '#8a1a1a', 0);
    A.cel(g, A.blob([[-.3, cy - .12], [-.26, cy - .3], [0, cy - .36], [.26, cy - .3], [.3, cy - .12], [0, cy - .18]]), PORT.uni, { line: PORT.uniL });
    A.cel(g, A.rr(-.3, cy - .16, .6, .07, .02), '#1a1a1a', { lw: .025, hi: false }); A.line(g, [[-.26, cy - .22], [.26, cy - .22]], .03, PORT.gull);
    for (const s of [-1, 1]) { A.flat(g, A.ell(s * .1, cy - .02, .07, .08), '#fbf6ea', .025); A.dot(g, s * .1, cy, .03); }
    A.cel(g, A.blob([[0, cy + .1], [-.1, cy + .08], [-.24, cy + .14], [-.14, cy + .16], [0, cy + .14], [.14, cy + .16], [.24, cy + .14], [.1, cy + .08]]), '#5a4030', { lw: .02 });
    A.cel(g, A.ell(0, cy + .21, .05, .05), '#5a1414', { lw: .02, hi: false });
  });
}
Object.assign(WEAPON_ART, { knippe: [.8, 1.0, .4, .12] });
{ const _dw = drawWeapon; drawWeapon = id => id !== 'knippe' ? _dw(id) : g => {
  A.line(g, [[0, 0], [0, -.3]], .06, INK); A.line(g, [[0, 0], [0, -.3]], .03, '#8a7020');
  A.flat(g, A.ell(0, -.5, .2, .2), null, .07, '#8a7020'); A.flat(g, A.ell(0, -.5, .2, .2), null, .035, '#e8c040');
  for (let i = 0; i < 5; i++) { const a = -1.2 + i * .6; g.save(); g.translate(Math.cos(a) * .2, -.5 + Math.sin(a) * .2); g.rotate(a + Math.PI / 2); A.cel(g, A.rr(-.03, 0, .06, .3, .02), '#d4b048', { lw: .025, hi: false }); A.cel(g, A.rr(-.03, .24, .1, .05, .01), '#d4b048', { lw: .02, hi: false }); g.restore(); }
}; }

/* ---------- Klumpunge: en liten klump kjøtt med ett ansikt ---------- */
RIG.klumpunge = { blob: true, scale: .6, tentacles: 3, tentW: .07, tentCol: '#c8807a', tentLen: .1, tentSpread: .5, tentWave: .1, pulse: 9 };
BLOBS.klumpunge = [1.0, .8, .5, .08, v => g => {
  A.cel(g, A.blob([[-.36, -.02], [-.4, -.3], [-.2, -.52], [.1, -.56], [.36, -.4], [.4, -.1], [.1, .02]]), '#d49a8a', { sk: .72 });
  for (const [x, y] of [[-.22, -.2], [.2, -.44]]) A.flat(g, A.ell(x, y, .08, .05), 'rgba(160,80,80,.4)', 0);
  A.line(g, [[-.3, -.36], [-.16, -.3]], .015, '#6a2a2a'); A.line(g, [[-.28, -.4], [-.24, -.3]], .012, '#6a2a2a');
  if (v === 'b') return;
  const ox = v === 's' ? .14 : 0;
  A.flat(g, A.ell(ox - .09, -.3, .06, .05), '#fbf6ea', .02); A.dot(g, ox - .08, -.29, .025); A.flat(g, A.ell(ox + .1, -.32, .045, .04), '#fbf6ea', .02); A.dot(g, ox + .1, -.31, .02);
  A.cel(g, A.ell(ox, -.16, .08, .05), '#5a1414', { lw: .025, hi: false });
}];

/* ============================================================
   LAGDUKKE: skapninger av mange tegnede deler som beveger seg hver for seg.
   Samme grensesnitt som Doll (root, U, update, setFacing, flash, hit, dissolve, dispose),
   så fiende- og sjefskoden ikke trenger å vite forskjell.
   def = { scale, skygge, sveve, puls, deler: [{ P, x, y, z, anim(d, S) }], lemmer(dukke, S) }
   ============================================================ */
class Lagdukke {
  constructor(type, def, opt = {}) {
    this.type = type; this.def = def; this.opt = opt; this.rig = RIG[type] || (RIG[type] = { blob: true, scale: def.scale || 1 });
    this.root = new THREE.Group(); this.plane = new THREE.Group(); this.root.add(this.plane);
    this.U = makeU({ outline: opt.elite ? 1 : 0, outlineCol: opt.outlineCol, tint: opt.tint });
    this.sc = (opt.scale || 1) * (def.scale || 1); this.flip = 1; this.view = 'f'; this.t = Math.random() * 10; this.speed = 0; this.squash = 0; this.flashT = 0;
    this.headOff = { x: 0, y: 0, vx: 0, vy: 0 };
    this.shadow = Doll.blob(opt.shadow || def.skygge || .8); if (!opt.noShadow) this.root.add(this.shadow);
    this.back = new Ribbon(3200, this.U); this.front = new Ribbon(3200, this.U); this.plane.add(this.back.mesh, this.front.mesh);
    this.deler = def.deler.map(d => { const m = partMesh(d.P(), this.U); m.position.set(d.x || 0, d.y || 0, d.z || 0); this.plane.add(m); return Object.assign({ m }, d); });
    this.meshes = []; this.plane.traverse(o => { if (o.isMesh && o.material.map) this.meshes.push(o); });
  }
  setFacing(a) { const sx = Math.sin(a); this.flip = sx < -.25 ? -1 : sx > .25 ? 1 : this.flip; }
  flash(t = .09) { this.flashT = t; }
  hit() { this.squash = 1; }
  setWeapon() { }
  update(dt, st = {}) {
    this.t += dt; this.speed = lerp(this.speed, st.speed || 0, 1 - Math.pow(.001, dt));
    this.squash = Math.max(0, this.squash - dt * 6);
    const PO = st.pose ? posStat(st.pose) : null, kl = PO && PO.klem ? PO.klem[0] : 0, sq = Math.sin(this.squash * Math.PI) * .1 * (this.squash > 0 ? 1 : 0);
    const puls = this.def.puls ? Math.sin(this.t * this.def.puls) * .03 : 0;
    this.plane.scale.set(this.sc * this.flip * (1 + sq + kl * .45 + puls), this.sc * BILL_Y * (1 - sq * .7 - kl * .5 - puls * .6), this.sc);
    this.root.position.y = (st.hop || 0) + (this.def.sveve ? this.def.sveve + Math.sin(this.t * 1.6) * .1 : 0);
    this.plane.rotation.z = lerp(this.plane.rotation.z, st.down ? -1.1 * this.flip : st.spin ? Math.sin(st.spin) * .2 : 0, Math.min(1, dt * 8));
    const S = { t: this.t, st, PO, kl, speed: this.speed, aapen: st.aapen || 0 };
    for (const d of this.deler) if (d.anim) d.anim(d, S);
    this.back.begin(); this.front.begin();
    if (this.def.lemmer) this.def.lemmer(this, S);
    this.back.end(.028); this.front.end(.028);
    this.flashT -= dt; this.U.uFlash.value = this.flashT > 0 && R.flashOn ? 1 : 0;
  }
  dissolve(p) { this.U.uDissolve.value = p; this.shadow.material.opacity = 1 - p; }
  dispose() { R.remove(this.root); }
}
/* ---------- delene til Hviskekoret ---------- */
function korDel(k, w, h, draw) { return () => Art.part('koret_' + k, w, h, w / 2, h / 2, draw); }
const KOR = { kjott: '#d0a8a4', kjottL: '#5a2a2a', kappe: '#6a1a2a', krage: '#f4f0e6' };
const KOR_DELER = {
  kropp: () => Art.part('koret_kropp', 1.8, 3.0, .9, .1, g => {
    // en kormesserskjorte som svever, med kjøtt som tyter ut av kragen
    g.translate(0, -1.3);
    A.cel(g, A.blob([[-.62, .9], [-.4, 1.2], [-.2, .98], [0, 1.24], [.2, .98], [.42, 1.2], [.64, .92], [.48, .1], [.34, -.1], [-.34, -.1], [-.5, .1]]), KOR.kappe, { sk: .6, lw: .05 });
    for (const x of [-.36, -.12, .12, .36]) A.line(g, [[x, .05], [x * 1.2, 1.0]], .02, '#3a0a14');
    A.cel(g, A.blob([[-.56, .02], [-.3, .16], [0, .08], [.3, .16], [.56, .02], [.4, -.1], [0, -.06], [-.4, -.1]]), KOR.krage, { lw: .04 });
    A.cel(g, A.blob([[-.46, -.02], [-.56, -.4], [-.44, -.8], [-.22, -1.1], [.04, -1.2], [.3, -1.06], [.48, -.76], [.56, -.38], [.44, -.02]]), KOR.kjott, { line: KOR.kjottL, sk: .72 });
    for (const [a, b] of [[[-.4, -.5], [-.1, -.36]], [[.1, -.86], [.36, -.7]], [[-.2, -.9], [0, -.72]], [[.2, -.3], [.44, -.46]]]) A.line(g, [a, b], .02, '#8a5a5a');
    for (let i = 0; i < 5; i++) A.line(g, [[-.3 + i * .03, -.62 + i * .05], [-.26 + i * .03, -.58 + i * .05]], .012, INK); // sting
    // tre stearinlys på toppen
    for (const [x, hh] of [[-.2, .22], [.04, .3], [.26, .18]]) { A.cel(g, A.rr(x - .04, -1.12 - hh, .08, hh, .02), '#f4ecd8', { lw: .025, hi: false }); A.flat(g, A.ell(x, -1.19 - hh, .035, .07), '#ffc040', .015); A.flat(g, A.ell(x, -1.18 - hh, .015, .035), '#fff4c0', 0); }
  }),
  munn: i => korDel('munn' + i, .6, .5, g => {
    const bred = [.2, .16, .24][i % 3];
    A.cel(g, A.blob([[-bred, 0], [-bred * .6, -.12], [0, -.14], [bred * .6, -.12], [bred, 0], [bred * .6, .13], [0, .15], [-bred * .6, .13]]), '#c85a64', { line: KOR.kjottL, lw: .035, sk: .75 });
    A.cel(g, A.blob([[-bred * .8, 0], [0, -.07], [bred * .8, 0], [0, .08]]), '#2a0a10', { lw: .02, hi: false });
    for (let k = 0; k < 4; k++) A.flat(g, A.rr(-bred * .6 + k * bred * .34, -.06, bred * .22, .045, .01), '#f4ecd0', .01);
    if (i === 1) A.cel(g, A.blob([[-.04, .02], [.06, .02], [.07, .14], [0, .17], [-.05, .12]]), '#e87a8a', { lw: .02, hi: false });
  }),
  ore: i => korDel('ore' + i, .44, .56, g => {
    A.cel(g, A.blob([[-.08, .22], [-.16, 0], [-.12, -.18], [0, -.24], [.12, -.16], [.14, .04], [.06, .2]]), '#d8aea8', { line: KOR.kjottL, lw: .035, sk: .72 });
    A.curve(g, [-.06, .1], [-.08, -.08], [.04, -.12], .025, '#8a4a4a'); A.curve(g, [.0, .04], [-.02, -.04], [.05, -.04], .02, '#8a4a4a');
    if (i === 1) A.flat(g, A.ell(-.02, .2, .03, .03), '#d4b048', .015); // en ørering
  })
};
const LAGDUKKE = {
  koret: {
    scale: 1, skygge: .9, sveve: .35,
    deler: [
      { P: KOR_DELER.kropp, x: 0, y: 0, z: 0, anim: (d, S) => { d.m.scale.set(1 + Math.sin(S.t * 1.3) * .02, 1 - Math.sin(S.t * 1.3) * .015, 1); } },
      ...[[-.26, 1.82, 0], [.2, 2.02, 1], [.02, 1.58, 2], [-.3, 1.46, 1], [.32, 1.52, 0], [.06, 2.24, 2], [-.14, 2.08, 0]].map(([x, y, i], k) => ({ P: () => KOR_DELER.munn(i)(), x, y, z: .02 + k * .002,
        anim: (d, S) => { const hvisk = .5 + .5 * Math.sin(S.t * (5 + k * 1.3) + k * 2.1), aapen = Math.max(hvisk * .55, S.aapen); d.m.scale.set(1 + S.aapen * .25, .45 + aapen * .9, 1); } })),
      ...[[-.6, 1.72, 0, .5], [.6, 1.94, 1, -.4], [-.48, 2.22, 1, .9], [.56, 1.48, 0, -.8]].map(([x, y, i, r], k) => ({ P: () => KOR_DELER.ore(i)(), x, y, z: -.01,
        anim: (d, S) => { d.m.rotation.z = r + Math.sin(S.t * (3 + k) + k) * .12 + (Math.sin(S.t * 17 + k * 4) > .96 ? .3 : 0); } }))
    ]
  }
};

/* ============================================================
   OPPFØRSEL
   ============================================================ */
Object.assign(Grotesk.keep, { kasteren: 6.2, trille: 1.2, speil: 1.1, klumpunge: .8, koret: 5.5, tannlege: 1.6, portier: 1.8 });
Object.assign(Grotesk.retreat, { kasteren: 1, koret: 1 });
Object.assign(Grotesk.talk, { kasteren: 1, trille: 1, speil: 1, klumpunge: 1, koret: 1, tannlege: 1, portier: 1 });
Object.assign(Grotesk.hop, { klumpunge: 1 });
Grotesk.styring = Object.assign(Grotesk.styring || {}, { trille: 1.8, koret: 3 });
Grotesk.tick = Grotesk.tick || {};
const Monstre = {
  spor: [], sporT: 0, hoder: [],
  /* spillerens spor (hvert 0,08 sekund de siste fem sekundene), til Speilpasienten */
  tick(dt) {
    const P = G.player; if (!P) return;
    this.sporT -= dt; if (this.sporT <= 0) { this.sporT = .08; this.spor.push({ t: G.time, x: P.x, z: P.z }); if (this.spor.length > 64) this.spor.shift(); }
    this.hodeTick(dt);
  },
  der(sek) { const t = G.time - sek; let best = null; for (const s of this.spor) { if (s.t <= t) best = s; else break; } return best || this.spor[0] || G.player; },
  clear() { this.spor = []; for (const h of this.hoder) R.remove(h.g); this.hoder = []; },
  /* ---------- Portierens hode: flyr ut, biter, kommer tilbake ---------- */
  kastHode(e, T) {
    const a = Math.atan2(T.x - e.x, T.z - e.z), d = Math.min(8.5, Math.hypot(T.x - e.x, T.z - e.z) + 1.5);
    const g = sprite(portierHode(), e.x, e.z, { y: 1.5 }); g.userData.m.scale.set(1.15, BILL_Y * 1.15, 1);
    this.hoder.push({ e, g, x: e.x, z: e.z, y: 1.5, sx: e.x, sz: e.z, tx: e.x + Math.sin(a) * d, tz: e.z + Math.cos(a) * d, t: 0, fase: 'ut', bitT: 0 });
    e.hodeUte = true; Sound.play('kast', 1, .8); FX.bubble(e, 'HER BORTE!', 1.2);
  },
  hodeTick(dt) {
    const P = G.player;
    for (let i = this.hoder.length - 1; i >= 0; i--) {
      const h = this.hoder[i], e = h.e; h.t += dt;
      if (!e.alive) { puff(h.x, h.z, 3, 1); R.remove(h.g); this.hoder.splice(i, 1); continue; }
      if (h.fase === 'ut') { const k = Math.min(1, h.t / .6), q = 1 - (1 - k) * (1 - k); h.x = lerp(h.sx, h.tx, q); h.z = lerp(h.sz, h.tz, q); if (solid(Math.floor(h.x), Math.floor(h.z))) { h.fase = 'svev'; h.t = 0; } if (k >= 1) { h.fase = 'svev'; h.t = 0; } }
      else if (h.fase === 'svev') { h.x += Math.sin(G.time * 9) * dt * .6; if (P.alive) { const a = Math.atan2(P.x - h.x, P.z - h.z); h.x += Math.sin(a) * dt * 1.6; h.z += Math.cos(a) * dt * 1.6; } if (h.t > .9) { h.fase = 'hjem'; h.t = 0; h.sx = h.x; h.sz = h.z; } }
      else { const k = Math.min(1, h.t / .6); h.x = lerp(h.sx, e.x, k * k); h.z = lerp(h.sz, e.z, k * k); if (k >= 1) { e.hodeUte = false; R.remove(h.g); this.hoder.splice(i, 1); Sound.play('bonk', .5, 1.3); continue; } }
      h.bitT -= dt;
      if (P.alive && h.bitT <= 0 && d2(h.x, h.z, P.x, P.z) < .8) { h.bitT = .6; if (hurt(P, e.dmg * .7, { type: 'portier', x: h.x, z: h.z, kb: 3 }) > 0) { numText(P.x, P.z, 'BITT', 'crit', 2.3); Sound.play('bitt'); } }
      h.g.position.set(h.x, h.y + Math.abs(Math.sin(h.t * 10)) * .2, h.z); h.g.userData.m.rotation.z = Math.sin(h.t * 14) * .5;
    }
  }
};
/* Kasterens klump: flyr i bue med snurrende bilder, lander som et brunt søl */
function kastKlump(e, o, h = 2.4) {
  const a = Anim.lag('kasteklump', e.x, e.z, { y: 1.4, folgLys: true }); if (!a) return;
  a.g.userData.m = a.m;
  addProj({ type: 'klump', from: 'enemy', x: e.x + Math.sin(e.face) * .3, z: e.z + Math.cos(e.face) * .3, tx: o.x, tz: o.z, arc: true, dur: .55, h, mesh: a.g, land: () => {
    hitShape('circle', o, e.dmg, { type: e.type, x: o.x, z: o.z, kb: 3 }, 'enemy');
    Anim.lag('kastesprut', o.x, o.z + .05, {}); addPuddle(o.x, o.z, 'mokk', o.r * .95, 12);
    Blod.flekk(o.x, o.z, '#5a3a1a', .8, .88); Sound.play('splat', .7, .85); R.shake(.1);
  } });
}
/* ord som prosjektiler: Hviskekoret sier stygge ting, og de gjør vondt */
const ORD = ['SKAM', 'SKYLD', 'DØ', 'FEIG', 'SLEM', 'IKKE', 'DU', 'ALENE', 'TOM', 'SVAK'];
function ordPart(ord) {
  const w = .3 + ord.length * .19;
  return Art.part('ord_' + ord, w, .5, w / 2, .25, g => {
    g.font = 'bold .34px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.lineWidth = .09; g.strokeStyle = '#1a0608'; g.strokeText(ord, 0, .02); g.fillStyle = '#c83a4a'; g.fillText(ord, 0, .02);
    g.fillStyle = 'rgba(255,220,220,.5)'; g.fillText(ord, -.012, -.005);
  });
}
function sendOrd(e, a, fart = 5.5) {
  const ord = pick(ORD), mesh = propSprite(null, e.x, e.z, { P: ordPart(ord), shadow: false, y: 1.3 }); R.dyn.add(mesh);
  addProj({ type: 'ord', from: 'enemy', x: e.x + Math.sin(a) * .7, z: e.z + Math.cos(a) * .7, vx: Math.sin(a) * fart, vz: Math.cos(a) * fart, dmg: e.dmg * .55, life: 3, r: .32, y: 1.3, cause: 'koret', mesh, spin: 0, ord: true });
}
/* røyk fra koret: tung, mørk og full av hvisking. Inni blir du tregere og mer Morbidium. */
function addRoyk(x, z, r, t) {
  const m = new THREE.Mesh(R.plane1(), new THREE.MeshBasicMaterial({ map: R.tex.pool, color: 0x2a1a30, transparent: true, opacity: .75, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, .06, z); m.scale.set(r * 2.4, r * 2.4, 1); m.renderOrder = 2; R.dyn.add(m);
  G.zones.push({ kind: 'royk', x, z, r, t, max: t, mesh: m, puffT: 0 }); puff(x, z, 5, 1.5, '#3a2a44');
}
{ const _uz = updateZones; updateZones = function (dt) {
  _uz(dt); const P = G.player;
  for (let i = G.zones.length - 1; i >= 0; i--) {
    const zn = G.zones[i]; if (zn.kind !== 'royk') continue;
    zn.t -= dt; zn.puffT -= dt; zn.mesh.material.opacity = .75 * Math.min(1, zn.t / 1.2, (zn.max - zn.t) / .4 + .2);
    if (zn.puffT <= 0) { zn.puffT = .3; puff(zn.x + rnd(-zn.r, zn.r) * .7, zn.z + rnd(-zn.r, zn.r) * .7, 1, 1.3, '#2a1a34'); }
    if (P && P.alive && d2(P.x, P.z, zn.x, zn.z) < zn.r * zn.r) { P.roykT = .15; addMorb(dt * 5); if (Math.random() < dt * .8) whisper(); }
    if (zn.t <= 0) { R.remove(zn.mesh); G.zones.splice(i, 1); }
  }
}; }
Object.assign(Grotesk.ai, {
  kasteren(e, T, dist, toT) {
    if (dist > 11 || !los(e.x, e.z, T.x, T.z)) return;
    const n = e.elite || e.mester ? 3 : 1, tid = .9;
    e.state = 'wind'; e.t = tid + .2; e.face = toT; e.positur = { navn: 'kast', t: 0, dur: tid }; if (e.doll.wp) e.doll.wp.visible = true;
    if (Math.random() < .35) FX.bubble(e, pick(LINES.kasteren), 1.2);
    const mal = []; for (let i = 0; i < n; i++) { const a = Math.random() * TAU, d = i ? rnd(1.3, 2.3) : 0; mal.push({ x: T.x + Math.sin(a) * d, z: T.z + Math.cos(a) * d, r: 1.05, color: 0x8a5a2a }); }
    for (const o of mal) addTele('circle', o, tid * .6 + .55, () => { }, e);
    bossLaterE(e, tid * .6, () => { if (e.doll.wp) e.doll.wp.visible = false; if (e.stun > 0 || e.sleep > 0 || e.slip > 0) return; Sound.play('kast'); mal.forEach((o, i) => kastKlump(e, o, 2.2 + i * .3)); });
    e.cd = rnd(2.4, 3.6);
  },
  trille(e, T, dist, toT) {
    if (dist < 9 && dist > 2.2 && los(e.x, e.z, T.x, T.z) && Math.random() < .62) {
      const len = Math.min(10, dist + 2.8); e.state = 'wind'; e.t = .8; e.face = toT; FX.bubble(e, pick(['VROOM!', 'Pass beina!', 'Bremsene er en myte!']), 1);
      addTele('rect', { x: e.x, z: e.z, a: toT, w: 1.2, len }, .8, o => { e.state = 'charge'; e.chargeDir = o.a; e.chargeLeft = len; e.chargeHit = false; Sound.play('hjul'); Sound.play('swingHeavy', .7, .7); }, e);
      e.cd = rnd(2.6, 3.8); return;
    }
    if (dist < 10 && dist > 3 && los(e.x, e.z, T.x, T.z)) {
      e.state = 'wind'; e.t = .85; e.face = toT; e.positur = { navn: 'kast', t: 0, dur: .75 };
      bossLaterE(e, .45, () => {
        if (e.stun > 0) return; const a = Math.atan2(G.player.x - e.x, G.player.z - e.z), m = propSprite(null, e.x, e.z, { P: weaponPart('bekken'), shadow: false, y: 1.1 }); R.dyn.add(m);
        addProj({ type: 'bekken', from: 'enemy', x: e.x, z: e.z, vx: Math.sin(a) * 9, vz: Math.cos(a) * 9, dmg: e.dmg * .8, life: 1.4, r: .3, y: 1.1, cause: 'trille', spin: 14, mesh: m }); Sound.play('kast', .8, 1.2);
      });
      e.cd = rnd(2, 3);
    }
  },
  speil(e, T, dist, toT) {
    const P = G.player;
    if (dist < 2.3) {
      // slår der du var for et øyeblikk siden
      const s = Monstre.der(.45), o = { x: s.x, z: s.z, r: 1.1, color: 0xb8d0e8 }; e.state = 'wind'; e.t = .5; e.face = Math.atan2(o.x - e.x, o.z - e.z);
      addTele('circle', o, .5, () => { hitShape('circle', o, e.dmg, { type: 'speil', x: e.x, z: e.z, kb: 5 }, 'enemy'); Sound.play('glass', .6, .8); Particles.spawn(o.x, .8, o.z, 6, 0xdfefff, { speed: 3, up: 3, life: .4, size: .6 }); }, e);
      e.cd = rnd(1.3, 2.1); return;
    }
    if (dist < 9.5 && los(e.x, e.z, T.x, T.z)) {
      // blendende refleks: speilet kaster lyset fra lampene rett i øynene dine
      e.state = 'wind'; e.t = .85; e.face = toT; const o = { x: e.x, z: e.z, a: toT, w: 1.1, len: 9.5, color: 0xe8f4ff };
      if (Math.random() < .4) FX.bubble(e, pick(['Se på meg.', 'Smil!', 'Snu deg.']), 1);
      addTele('rect', o, .85, () => {
        const hits = hitShape('rect', o, e.dmg * .55, { type: 'speil', x: e.x, z: e.z, stun: 1.1 }, 'enemy');
        beam(o.x, o.z, o.x + Math.sin(o.a) * o.len, o.z + Math.cos(o.a) * o.len, 0xf4faff, .3, .25, 1.4); flashLight(e.x + Math.sin(o.a) * 3, e.z + Math.cos(o.a) * 3, 4, '#e8f4ff', .35, 1.6); Sound.play('glass', .8, 1.4);
        if (hits.includes(P)) { numText(P.x, P.z, 'BLENDET', 'crit', 2.4); R.fx.flash = Math.max(R.fx.flash, .35); }
      }, e);
      e.cd = rnd(3, 4.5);
    }
  },
  klumpunge(e, T, dist, toT) {
    if (dist < 1.1) { e.state = 'wind'; e.t = .25; e.face = toT; addTele('circle', { x: e.x + Math.sin(toT) * .5, z: e.z + Math.cos(toT) * .5, r: .5, color: 0xd49a8a }, .25, o => { if (inShape({ shape: 'circle', o }, T.x, T.z, T.r)) hurt(T, e.dmg, { type: 'klumpunge', x: e.x, z: e.z, kb: 2 }); }, e); e.cd = rnd(.8, 1.3); }
  },
  koret(e, T, dist, toT) {
    const r = Math.random(), P = G.player;
    if (dist < 3.2 || r < .16) {
      // korskrik: alle munnene åpner seg, og alt innenfor ringen får høre det. Rull gjennom.
      e.state = 'wind'; e.t = 1.4; e.aapen = 1; const o = { x: e.x, z: e.z, r: 6.2, color: 0xc83a4a }; FX.bubble(e, 'AAAAAAA', 1.2);
      addTele('circle', o, 1.05, () => { o.x = e.x; o.z = e.z; hitShape('circle', o, e.dmg * 1.3, { type: 'koret', x: e.x, z: e.z, kb: 9 }, 'enemy'); Sound.play('korskrik'); R.shake(.45); flashLight(e.x, e.z, 6, '#c83a4a', .3, 1); for (let k = 0; k < 16; k++) Particles.spawn(e.x, 1.4, e.z, 1, 0x2a1a30, { speed: 7, up: 1, g: 0, life: .5 }); bossLaterE(e, .4, () => { e.aapen = 0; }); }, e);
      e.cd = rnd(2.8, 3.6); return;
    }
    if (r < .38) {
      e.state = 'wind'; e.t = 1.2; FX.bubble(e, pick(LINES.koret), 1.6); Sound.play('hvisk');
      for (let k = 0; k < 3; k++) { const a = Math.random() * TAU, d = k ? rnd(1.6, 3) : rnd(0, .8), x = P.x + Math.sin(a) * d, z = P.z + Math.cos(a) * d; if (!solid(Math.floor(x), Math.floor(z))) { const o = { x, z, r: 1.5, color: 0x3a2a44 }; addTele('circle', o, .8, () => addRoyk(o.x, o.z, 1.5, 4.5), e); } }
      e.cd = rnd(3, 4); return;
    }
    e.state = 'wind'; e.aapen = .6;
    if (r < .62) { e.t = 1.7; for (let k = 0; k < 16; k++) bossLaterE(e, k * .1, () => { sendOrd(e, G.time * 2.3 + k * .72, 4.8); if (k % 3 === 0) Sound.play('hvisk', .5); }); bossLaterE(e, 1.7, () => { e.aapen = 0; }); }
    else { e.t = .8; bossLaterE(e, .45, () => { const a0 = Math.atan2(P.x - e.x, P.z - e.z); for (const da of [-.44, -.22, 0, .22, .44]) sendOrd(e, a0 + da, 5.8); Sound.play('hvisk', .8); e.aapen = 0; }); }
    e.cd = rnd(2.2, 3.2);
  },
  tannlege(e, T, dist, toT) {
    const P = G.player;
    if (e.hp < e.max * .5 && !e.nesteKalt) { e.nesteKalt = true; e.state = 'wind'; e.t = 1; FX.bubble(e, 'NESTE!', 1.4); for (let k = 0; k < 2; k++) { const s = freeSpot(e.x + rnd(-2, 2), e.z + rnd(-2, 2), 2); bossLaterE(e, .3 + k * .3, () => spawnEnemy('tvang', s.x, s.z, false, G.depth)); } e.cd = 1.5; return; }
    if (dist < 4.6 && Math.random() < .55) {
      // trekk: kaster seg fram med tangen. Treffer han, er noen av tennene dine hans.
      e.state = 'wind'; e.t = 1.0; e.face = toT; e.positur = { navn: 'greip', t: 0, dur: 1.0 }; FX.bubble(e, 'Gap opp!', 1);
      const o = { x: e.x, z: e.z, a: toT, w: 1.3, len: 4.4 };
      addTele('rect', o, .6, () => {
        e.kvx = Math.sin(o.a) * 13; e.kvz = Math.cos(o.a) * 13; Sound.play('swingHeavy', 1, .9);
        const hits = hitShape('rect', o, e.dmg, { type: 'tannlege', x: e.x, z: e.z, kb: 4 }, 'enemy');
        if (hits.includes(P)) { const n = Math.min(P.teeth, rndi(6, 10)); if (n) { P.teeth -= n; const bx = e.x - Math.sin(o.a) * 3, bz = e.z - Math.cos(o.a) * 3, s = freeSpot(bx, bz, 3); dropTeeth(s.x, s.z, n); numText(P.x, P.z, 'TREKT -' + n, 'crit', 2.6); Sound.play('knas'); Sound.play('tooth', 1, .6); } }
      }, e);
      e.cd = rnd(2, 2.8); return;
    }
    if (dist < 10 && Math.random() < .6) {
      e.state = 'wind'; e.t = .9; e.face = toT; e.positur = { navn: 'kast', t: 0, dur: .8 };
      bossLaterE(e, .5, () => { const a0 = Math.atan2(P.x - e.x, P.z - e.z); for (let k = -3; k <= 3; k++) addProj({ type: 'tann', from: 'enemy', x: e.x, z: e.z, vx: Math.sin(a0 + k * .16) * 8.5, vz: Math.cos(a0 + k * .16) * 8.5, dmg: e.dmg * .45, life: 1.5, r: .24, y: 1.2, cause: 'tannlege', spin: 16, mesh: (() => { const m = propSprite(null, e.x, e.z, { P: toothPart(), shadow: false, y: 1.2 }); R.dyn.add(m); return m; })() }); Sound.play('tooth', .9, .8); });
      e.cd = rnd(2.2, 3); return;
    }
    // boret: snurrer mot deg og surrer i to og et halvt sekund
    e.bor = 2.5; e.borT = 0; FX.bubble(e, 'Dette kjenner du bare litt.', 1.4); Sound.play('bor');
    e.cd = rnd(3.2, 4.2);
  },
  portier(e, T, dist, toT) {
    const P = G.player;
    if (e.hp < e.max * .5 && !e.velkommen) { e.velkommen = true; e.state = 'wind'; e.t = 1; FX.bubble(e, 'Velkommen! Velkommen!', 1.6); for (let k = 0; k < 2; k++) { const s = freeSpot(e.x + rnd(-2.5, 2.5), e.z + rnd(-2.5, 2.5), 2); bossLaterE(e, .3 + k * .3, () => spawnEnemy('pleier', s.x, s.z, false, G.depth)); } e.cd = 1.5; return; }
    if (dist < 2.8) {
      e.state = 'wind'; e.t = .8; e.face = toT; e.positur = { navn: 'sving', t: 0, dur: .8 }; const o = { x: e.x, z: e.z, a: toT, r: 2.8, arc: 2.4 };
      addTele('cone', o, .55, () => { hitShape('cone', o, e.dmg, { type: 'portier', x: e.x, z: e.z, kb: 8 }, 'enemy'); slashFx(e.x, e.z, o.a, o.r, o.arc, true, 0xd4b048); Sound.play('chain'); R.shake(.2); }, e);
      e.cd = rnd(1.4, 2.2); return;
    }
    if (!e.hodeUte && dist < 10) { e.state = 'wind'; e.t = .6; e.face = toT; e.positur = { navn: 'kast', t: 0, dur: .6 }; bossLaterE(e, .35, () => Monstre.kastHode(e, P)); e.cd = rnd(3.2, 4.4); }
  }
});
/* per bilde: bor, hvisking, lys i koret, hodeløs vandring, og målet til Speilpasienten */
Object.assign(Grotesk.tick, {
  speil(e) { const s = Monstre.der(1.25); return s ? { x: s.x, z: s.z } : null; },
  tannlege(e, dt, T) {
    if (!(e.bor > 0)) { e.spinn = false; return null; }
    e.bor -= dt; e.spinn = true; e.borT -= dt;
    if (e.borT <= 0) { e.borT = .3; const o = { x: e.x, z: e.z, r: 1.5 }; hitShape('circle', o, e.dmg * .35, { type: 'tannlege', x: e.x, z: e.z, kb: 2 }, 'enemy'); Particles.spawn(e.x, 1, e.z, 4, 0xf4ecd0, { speed: 4, up: 3, life: .35, size: .6 }); if (Math.random() < .5) Sound.play('bor', .6); }
    if (e.bor <= 0) e.spinn = false;
    return { x: T.x, z: T.z };
  },
  koret(e, dt, T, dist) {
    e.roykT = (e.roykT || 0) - dt; if (e.roykT <= 0) { e.roykT = rnd(.25, .5); puff(e.x + rnd(-.6, .6), e.z + rnd(-.3, .3), 1, 1.2, '#2a1a30'); }
    if (!e.lys) e.lys = R.light(e.x, e.z, 3.4, '#ffb060', .4);
    e.lys.position.set(e.x, 0, e.z + .2); R.setLight(e.lys, .35 + Math.random() * .08);
    // hviskingen kryper inn under huden når du står nær
    if (dist < 6.5 && G.player.alive) { addMorb(dt * .9); e.hviskT = (e.hviskT || 0) - dt; if (e.hviskT <= 0) { e.hviskT = rnd(2.5, 5); Sound.play('hvisk', .6); if (R.distortOn) whisper(); } }
    return null;
  },
  portier(e, dt, T) {
    if (!e.hodeAddon && e.doll.addAddon) { e.hodeAddon = e.doll.addAddon(portierHode(), { at: 'body', off: { f: [-.36, .3], s: [-.05, .32], b: [.36, .3] } }); }
    if (e.hodeAddon) e.hodeAddon.userData.skjult = !!e.hodeUte;
    if (!e.hodeUte) return null;
    // uten hodet går han litt i blinde
    e.blindT = (e.blindT || 0) - dt; if (e.blindT <= 0) { e.blindT = rnd(.5, 1); e.blindM = { x: e.x + rnd(-3, 3), z: e.z + rnd(-3, 3) }; }
    return e.blindM;
  }
});
/* Speilpasienten knuses: skår i alle retninger, og sju års ulykke resten av etasjen */
function skarPart() { return Art.part('glasskar', .4, .4, .2, .2, g => A.cel(g, A.poly([[-.14, .1], [-.02, -.16], [.15, -.04], [.04, .14]]), '#c8dce8', { lw: .025, hi: false })); }
{ const _d = enemyDie; enemyDie = function (e, src) {
  _d(e, src);
  if (e.type === 'speil') {
    Sound.play('glassknus');
    for (let k = 0; k < 7; k++) { const a = k / 7 * TAU + Math.random() * .3, m = propSprite(null, e.x, e.z, { P: skarPart(), shadow: false, y: 1 }); R.dyn.add(m); addProj({ type: 'skar', from: 'enemy', x: e.x, z: e.z, vx: Math.sin(a) * 7, vz: Math.cos(a) * 7, dmg: 5, life: .7, r: .2, y: 1, cause: 'speil', spin: 18, mesh: m }); }
    const b = G.run.buffs || (G.run.buffs = {}); b.ulykke = (b.ulykke || 0) + 1; toast('Sju års ulykke', 'Mindre flaks resten av etasjen');
  }
  if (e.type === 'koret' && e.lys) { R.remove(e.lys); e.lys = null; }
}; }
{ const _s = Items.stat.bind(Items); Items.stat = function (n) { let v = _s(n); if (n === 'luck' && G.run && G.run.buffs && G.run.buffs.ulykke) v -= 6 * G.run.buffs.ulykke; return v; }; }
/* Speilpasienten viser ansiktet ditt i speilet */
{ const _se = spawnEnemy; spawnEnemy = function (type, x, z, elite, depth) {
  const e = _se(type, x, z, elite, depth);
  if (e && type === 'speil' && e.doll.addAddon) { try { e.doll.addAddon(speilbilde(G.run && G.run.look), { at: 'head', off: { f: [0, .58] }, bare: ['f'] }); } catch (err) { } }
  if (e && type === 'kasteren' && e.doll.wp) e.doll.wp.visible = false;
  return e;
}; }

/* ============================================================
   PORTRETT av en fiendetype, forfra, til fiendeindeksen i Pasienthåndboka.
   Samme tegninger (eller bilder fra ChatGPT) som i spillet, satt sammen på et lerret.
   ============================================================ */
function fiendeBilde(type, W = 160, H = 190) {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const img = (P, x, y, S, cx, cy, rot = 0) => { if (!P) return; g.save(); g.translate(cx + x * S, cy - y * S); if (rot) g.rotate(rot); g.drawImage(P.canvas, -P.ax * S, -(P.h - P.ay) * S, P.w * S, P.h * S); g.restore(); };
  try {
    const L = LAGDUKKE[type], R0 = RIG[type] || {};
    if (L) {
      const deler = L.deler.map(d => ({ d, P: d.P() })).sort((a, b) => (a.d.z || 0) - (b.d.z || 0));
      let top = 0, bred = 1; for (const { d, P } of deler) { top = Math.max(top, (d.y || 0) + P.h - P.ay); bred = Math.max(bred, Math.abs(d.x || 0) * 2 + P.w); }
      const S = Math.min((H - 12) / (top + .1), (W - 6) / bred), cx = W / 2, cy = H - 6;
      if (L.portrett) L.portrett(g, S, cx, cy, 'bak');
      for (const { d, P } of deler) img(P, d.x || 0, d.y || 0, S, cx, cy);
      if (L.portrett) L.portrett(g, S, cx, cy, 'foran');
      return c;
    }
    if (R0.blob) { const P = charPart(type, 'blob', 'f'), S = Math.min((H - 10) / P.h, (W - 10) / P.w) * .95; img(P, 0, 0, S, W / 2, H - 6); return c; }
    const R1 = STREK.tynn ? Object.assign({}, R0, { legW: STREK.ben, armW: STREK.arm, leg: STREK.farge, arm: STREK.farge, handR: STREK.hand }) : R0;
    const hode = charPart(type, 'hode', 'f'), kropp = charPart(type, 'kropp', 'f');
    const hip = R0.hip, neck = hip + R0.neck, sh = hip + R0.shY, hw = R0.hipW, topp = neck - .02 + hode.h - hode.ay + .04;
    const S = Math.min((H - 10) / topp, (W - 8) / Math.max(kropp.w, hode.w, 1.1)), cx = W / 2, cy = H - 5;
    const lem = (a, b, w, col) => { for (const [ww, cc] of [[w + (STREK.tynn ? .04 : .09), INK], [w, col]]) { g.beginPath(); g.moveTo(cx + a[0] * S, cy - a[1] * S); g.quadraticCurveTo(cx + (a[0] + b[0]) / 2 * S + 3, cy - (a[1] + b[1]) / 2 * S, cx + b[0] * S, cy - b[1] * S); g.lineWidth = ww * S; g.strokeStyle = cc; g.lineCap = 'round'; g.stroke(); } };
    const haand = (x, y) => { g.beginPath(); g.arc(cx + x * S, cy - y * S, (R1.handR + .045) * S, 0, TAU); g.fillStyle = INK; g.fill(); g.beginPath(); g.arc(cx + x * S, cy - y * S, R1.handR * S, 0, TAU); g.fillStyle = R0.hand; g.fill(); };
    if (!R0.sete) { lem([-hw, hip + .04], [-hw - .04, .08], R1.legW, R1.leg); lem([hw, hip + .04], [hw + .04, .08], R1.legW, R1.leg); const sko = shoePart(R0.shoe || 'klogg'); img(sko, -hw - .05, 0, S, cx, cy); img(sko, hw + .05, 0, S, cx, cy); }
    img(kropp, 0, hip, S, cx, cy);
    const hL = R0.sete ? [-R0.shW - .08, hip + .06] : [-R0.shW - .08, sh - .4], hR = R0.sete ? [R0.shW + .08, hip + .06] : [R0.shW + .1, sh - .38];
    lem([-R0.shW, sh], hL, R1.armW, R1.arm); haand(hL[0], hL[1]);
    const vp = ENEMIES[type] && ENEMIES[type].weapon, wa = { oppasser: 'sproyte' }[type] || (vp && vp !== 'klump' ? vp : null) || (BOSSES[1] && Object.values(BOSSES).find(b => b.type === type) || {}).weapon;
    if (wa && WEAPON_ART[wa]) img(weaponPart(wa), hR[0], hR[1], S, cx, cy, .3);
    lem([R0.shW, sh], hR, R1.armW, R1.arm); haand(hR[0], hR[1]);
    img(hode, 0, neck - .02, S, cx, cy);
    if (type === 'speil') img(speilbilde(G.run && G.run.look), 0, neck - .02 + .58, S, cx, cy);
    if (type === 'portier') img(portierHode(), -.36, hip + .3, S, cx, cy);
    if (R0.cape) img(charPart(type, 'kappe', 'f'), 0, sh - .88, S, cx, cy);
  } catch (e) { }
  return c;
}
