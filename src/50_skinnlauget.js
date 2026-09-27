/* ============================================================
   SKINNLAUGET AV 1887  -  Avdeling Nulls høflige lærlaug
   Lærlingen, Klokkeren, Holdningssøsteren og Oldermann Nålepute. Håndverkere med reimer,
   spenner, bjeller og dagsorden, som elsker lær, nagler, lærfett og kroker, og som gjerne
   forteller deg om det mens de holder på. Smerte er et fag med skjemaer, referat og god tone.
   Ingenting seksuelt, og ingen navn, tegninger eller sitater fra filmene de parodierer.
   - Lærlingen bukker (varselet), slår med reima og spenner deg fast hvis du står for nær.
   - Klokkeren slår aldri selv. Han ringer med sølvbjella, og krokene kommer ut av mørket der du står.
   - Oldermann Nålepute (minisjef) leser opp dagsorden og gjør sakene i den rekkefølgen han sa.
   Alle stans fra laugets folk deler én nedkjøling (G.laugStunT), så de ikke kan holde pasienten fast på rad.
   Tegningene kan byttes med bilder fra ChatGPT (hode_laerling_f, kropp_klokker_s, vaapen_reim, vaapen_bjelle ...).
   ============================================================ */
Object.assign(Sound.lib, {
  // knirk fra et lærforkle som bøyer seg
  bukk: [{ w: 'sawtooth', f: 150, d: .45, pd: .45, v: .05 }, { n: 1, d: .4, f0: 700, f1: 1300, ft: 'bandpass', v: .08 }],
  smekk: [{ n: 1, d: .06, f0: 5200, f1: 1400, ft: 'bandpass', v: .45 }, { w: 'sine', f: 260, d: .08, pd: .5, v: .35 }],
  spenne: [{ w: 'triangle', f: 1800, d: .06, v: .12 }, { w: 'triangle', f: 2500, d: .05, v: .1, at: .07 }, { n: 1, d: .1, f0: 4200, f1: 2000, ft: 'bandpass', v: .15 }]
});
Object.assign(LYD_KART, {
  bukk: { s: [['gulvknirk', .55]] },
  smekk: { s: [['hit', .6, 1.4], ['knirk', .3, 1.3]], syn: .35 },
  spenne: { s: [['chain', .5, 1.7]], syn: .3 }
});
Object.assign(FIENDESTEMME, { laerling: ['knirk', 1.35], klokker: ['knirk', 1.1] });

Object.assign(ENEMIES, {
  laerling: { name: 'Lærlingen', hp: 32, speed: 2.6, r: .42, dmg: 10, xp: 11, teeth: [1, 3], bubbleH: 3.2, weapon: 'reim', blood: 0xa01c1c },
  klokker: { name: 'Klokkeren', hp: 22, speed: 2.1, r: .38, dmg: 10, xp: 14, teeth: [2, 4], bubbleH: 2.6, weapon: 'bjelle', blood: 0x9a1a1a }
});
Object.assign(LINES, {
  laerling: ['Med Deres tillatelse.', 'Unnskyld. Det var meningen.', 'Dette er min første behandling!', 'Kjenn på reima. Oksehud, vegetabilsk garvet. Nei, kjenn!', 'Jeg pusset spennene til i kveld.',
    'Oldermannen sier jeg har talent.', 'Det knirker. Beklager, det er forkleet.', 'Seksten nagler. Jeg har talt dem to ganger.', 'Har De tenkt på å melde Dem inn? Vi har kaffe.', 'Smerte er et håndverk. Jeg er i lære.', 'Takk for tålmodigheten.'],
  klokker: ['Besøkstid.', 'Hører De bjella? Den er til Dem.', 'Notert.', 'Vi ringer når det passer. Det passer nå.', 'Avdeling Null takker for tålmodigheten.', 'Krokene er nypusset. Ikke ta på. Jo, ta på.',
    'Referatet fra sist er godkjent. De skrek i riktig rekkefølge.', 'Kjenner De lukten? Lærfett. Vi smører hver torsdag.', 'Skjema 12-B, smerte, frivillig. Kryss av her.']
});
Object.assign(DEATH_CAUSES, {
  laerling: ['Behandlet av en lærling. Det var hans første. Han ba om unnskyldning.', 'Spent fast, høflig men bestemt.', 'Fikk reim, etter alle kunstens regler.', 'Fikk høre om garving i tre kvarter. Så kom reima.'],
  klokker: ['Svarte på bjella.', 'Hentet av kroker etter at noen ringte på.', 'Notert, stemplet og hengt opp til tørk.', 'Ført i laugets protokoll under «Frivillige».']
});
DEPTH_ENEMIES[3].push('laerling');
DEPTH_ENEMIES[4].push('laerling', 'laerling', 'klokker');
DEPTH_ENEMIES[6].push('laerling', 'laerling', 'klokker');
Object.assign(MESTER_TITTEL, { laerling: 'Lærling', klokker: 'Klokker' });

/* ---------- positurer: bukket før slaget, reimslaget og bjella ---------- */
Object.assign(POSER, {
  bukk: { hR: [[0, .14, -.34], [.35, -.12, -.2], [.75, -.14, -.18], [1, .1, -.3]], hL: [[0, -.1, -.34], [.35, .1, -.22], [.75, .12, -.2], [1, -.1, -.34]],
    lean: [[0, 0], [.4, 2], [.75, 2.2], [1, .3]], hode: [[0, 0], [.4, -.4], [.75, -.45], [1, 0]], klem: [[0, 0], [.4, .28], [.75, .3], [1, 0]] },
  reimslag: { hR: [[0, .1, .42], [.3, .3, .34], [.55, .56, -.1], [1, .3, -.3]], lean: [[0, -.4], [.4, 1.2], [1, 0]], klem: [[0, 0], [.35, -.1], [.6, .1], [1, 0]] },
  ringe: { hR: [[0, .12, -.3], [.12, .16, .36], [.24, .22, .2], [.36, .16, .38], [.48, .22, .2], [.6, .16, .38], [.72, .22, .2], [.86, .16, .34], [1, .14, -.2]], hode: [[0, 0], [.2, .1], [.9, .1], [1, 0]] }
});

/* ============================================================
   TEGNINGER
   ============================================================ */
const LAUG = { lar: '#5a3620', larM: '#3a2012', okse: '#6a1e1e', oksel: '#2a0808', messing: '#d4a83a', solv: '#c8ccd8', traad: '#e0c088', skjorte: '#ece4d0' };
// lærglans: to tynne lyse streker, det de er mest stolte av
const larGlans = (g, x, y, h, s = 1) => { A.line(g, [[x, y], [x + .02 * s, y + h]], .022, 'rgba(255,236,210,.42)'); A.line(g, [[x + .05 * s, y + h * .1], [x + .06 * s, y + h * .5]], .012, 'rgba(255,236,210,.3)'); };
// korssting langs en kant, fra a til b
const korssting = (g, a, b, n, col = LAUG.traad) => { for (let i = 0; i < n; i++) { const t = (i + .5) / n, x = lerp(a[0], b[0], t), y = lerp(a[1], b[1], t), s = .018; A.line(g, [[x - s, y - s], [x + s, y + s]], .011, col); A.line(g, [[x - s, y + s], [x + s, y - s]], .011, col); } };
const nagle = (g, x, y, r = .018) => { A.dot(g, x, y, r + .008, INK); A.dot(g, x, y, r, LAUG.messing); A.dot(g, x - r * .35, y - r * .35, r * .35, '#fff4c8'); };
// laugets merke: en liten sølvkrok
const krokMerke = (g, x, y, s = 1) => { for (const [w, c] of [[.045 * s, INK], [.022 * s, LAUG.solv]]) { g.beginPath(); g.moveTo(x, y - .07 * s); g.lineTo(x, y + .02 * s); g.quadraticCurveTo(x, y + .07 * s, x - .04 * s, y + .06 * s); g.quadraticCurveTo(x - .06 * s, y + .04 * s, x - .05 * s, y + .02 * s); g.lineWidth = w; g.strokeStyle = c; g.stroke(); } };

/* ---------- Lærlingen: lang og ung, midtskill og runde briller, et lærforkle alt for stort for ham ---------- */
const LAER = { hud: '#f0dac4', har: '#3a2414' };
RIG.laerling = { hip: .52, hipW: .1, neck: .74, shW: .23, shY: .66, armW: .11, legW: .1, handR: .08, arm: LAUG.skjorte, leg: '#3a3030', hand: LAER.hud, shoe: 'stovel', scale: .88, headLag: 1.3 };
MONSTER_ART.laerling = {
  box: { hode: [1.2, 1.1, .6, .1], kropp: [1.2, 1.3, .6, .44] },
  hode: v => g => {
    const S = LAER.hud, H = LAER.har, cy = -.48;
    if (v === 'b') {
      for (const s of [-1, 1]) A.cel(g, A.ell(s * .3, cy + .05, .07, .1), S);
      A.cel(g, A.ell(0, cy + .02, .29, .36), H, { sk: .7 });
      for (let i = 0; i < 4; i++) A.curve(g, [-.2 + i * .13, cy - .28], [-.18 + i * .13, cy - .02], [-.14 + i * .1, cy + .3], .012, Col.light(H, .25));
      A.curve(g, [.02, cy - .34], [.08, cy - .52], [.16, cy - .46], .035, H); // en hårtust som aldri legger seg
      A.cel(g, A.rr(-.16, cy + .3, .32, .1, .03), S, { lw: .03, hi: false });
      return;
    }
    if (v === 's') {
      A.cel(g, A.ell(.03, cy, .28, .36), S);
      A.cel(g, A.blob([[-.26, cy + .12], [-.3, cy - .12], [-.2, cy - .32], [.04, cy - .4], [.24, cy - .3], [.3, cy - .18], [.12, cy - .22], [-.06, cy - .18], [-.1, cy + .02], [-.18, cy + .16]]), H, { sk: .7 });
      A.curve(g, [-.2, cy - .24], [0, cy - .36], [.2, cy - .28], .012, Col.light(H, .3));
      A.cel(g, A.ell(-.08, cy + .04, .06, .09), S);
      A.flat(g, A.ell(.2, cy - .01, .05, .09), 'rgba(230,242,250,.6)', .025); A.line(g, [[.16, cy - .02], [-.06, cy + .01]], .014); A.dot(g, .22, cy, .03); A.dot(g, .21, cy - .015, .01, '#ffffff');
      A.curve(g, [.14, cy - .13], [.22, cy - .17], [.28, cy - .12], .022, H);
      A.cel(g, A.blob([[.29, cy + .02], [.38, cy + .12], [.36, cy + .16], [.28, cy + .15]]), '#e8b89a', { lw: .028 });
      A.cel(g, A.blob([[.14, cy + .22], [.32, cy + .22], [.28, cy + .3], [.18, cy + .3]]), '#6a1a1a', { lw: .025, hi: false }); A.flat(g, A.rr(.17, cy + .22, .12, .03, .01), '#fbf6ea', 0);
      A.cel(g, A.rr(.12, cy + .32, .1, .045, .015), '#e8c8a0', { lw: .014, hi: false }); // plaster på haka: han har øvd
      return;
    }
    for (const s of [-1, 1]) { A.cel(g, A.ell(s * .31, cy + .05, .07, .1), S); A.curve(g, [s * .3, cy + .01], [s * .33, cy + .05], [s * .3, cy + .09], .012, '#b88a6a'); }
    A.cel(g, A.ell(0, cy, .29, .36), S);
    // midtskill, glatt og blank av pomade
    for (const s of [-1, 1]) A.cel(g, A.blob([[0, cy - .35], [s * .15, cy - .39], [s * .29, cy - .28], [s * .31, cy - .06], [s * .26, cy - .16], [s * .14, cy - .25], [s * .02, cy - .27]]), H, { sk: .7, hi: false });
    for (const s of [-1, 1]) A.curve(g, [s * .06, cy - .33], [s * .18, cy - .34], [s * .25, cy - .22], .014, 'rgba(255,240,220,.45)');
    A.line(g, [[0, cy - .37], [0, cy - .26]], .018, S);
    // ivrige bryn, høyt oppe
    for (const s of [-1, 1]) A.curve(g, [s * .05, cy - .15], [s * .13, cy - .21], [s * .2, cy - .15], .025, H);
    // runde briller med stålinnfatning
    for (const s of [-1, 1]) { A.flat(g, A.ell(s * .12, cy - .02, .1, .1), 'rgba(230,242,250,.55)', .026); A.dot(g, s * .115, cy - .01, .036); A.dot(g, s * .105, cy - .025, .012, '#ffffff'); A.line(g, [[s * .22, cy - .03], [s * .3, cy - .01]], .014); }
    A.curve(g, [-.03, cy - .03], [0, cy - .06], [.03, cy - .03], .016);
    A.cel(g, A.blob([[-.04, cy + .05], [.04, cy + .05], [.06, cy + .12], [0, cy + .15], [-.06, cy + .12]]), '#e8b89a', { lw: .026 });
    // stort, ivrig smil med tenner
    A.cel(g, A.blob([[-.14, cy + .2], [.14, cy + .2], [.1, cy + .28], [0, cy + .3], [-.1, cy + .28]]), '#6a1a1a', { lw: .026, hi: false });
    A.flat(g, A.blob([[-.12, cy + .2], [.12, cy + .2], [.11, cy + .235], [-.11, cy + .235]]), '#fbf6ea', 0);
    for (const [x, y] of [[-.18, cy + .09], [-.21, cy + .13], [.19, cy + .1], [.16, cy + .14]]) A.dot(g, x, y, .01, '#c89070'); // fregner
    g.save(); g.translate(.1, cy + .31); g.rotate(-.35); A.cel(g, A.rr(-.06, -.022, .12, .044, .015), '#e8c8a0', { lw: .014, hi: false }); A.line(g, [[-.02, -.012], [-.02, .012]], .008, '#b89070'); A.line(g, [[.02, -.012], [.02, .012]], .008, '#b89070'); g.restore();
  },
  kropp: v => g => {
    const top = -.76, L = LAUG.lar, K = LAUG.skjorte;
    if (v === 'b') {
      A.cel(g, A.blob([[-.26, .02], [.26, .02], [.27, top + .18], [.2, top + .02], [0, top - .01], [-.2, top + .02], [-.27, top + .18]]), K, { sk: .82 });
      for (const s of [-1, 1]) A.cel(g, A.blob([[s * .27, -.02], [s * .31, .36], [s * .25, .36], [s * .24, -.02]]), L, { lw: .03, hi: false }); // forkleet stikker fram på sidene
      // forkleremmene i kryss over ryggen, og sløyfa i livet
      for (const s of [-1, 1]) { A.line(g, [[s * .17, top + .03], [-s * .2, -.06]], .075, INK); A.line(g, [[s * .17, top + .03], [-s * .2, -.06]], .045, L); nagle(g, s * .15, top + .06, .014); }
      A.cel(g, A.rr(-.26, -.09, .52, .07, .02), L, { lw: .025, hi: false });
      for (const s of [-1, 1]) { A.cel(g, A.blob([[0, -.06], [s * .14, -.14], [s * .15, -.02], [0, -.05]]), L, { lw: .025, hi: false }); A.line(g, [[s * .02, -.03], [s * .06, .16]], .035, L); }
      A.cel(g, A.ell(0, -.055, .035, .035), LAUG.larM, { lw: .02, hi: false });
      return;
    }
    if (v === 's') {
      A.cel(g, A.blob([[-.18, .02], [.14, .02], [.18, top + .2], [.1, top], [-.1, top + .01], [-.2, top + .2]]), K, { sk: .82 });
      A.line(g, [[.06, top + .02], [.13, top + .16]], .045, L); // remmen over skulderen
      // forkleet i profil: smekke og skjørt som stikker ut foran
      A.cel(g, A.blob([[.08, top + .15], [.2, top + .16], [.23, -.04], [.3, .1], [.34, .37], [.02, .37], [.04, -.02]]), L, { sk: .72 });
      korssting(g, [.2, top + .2], [.23, -.06], 5); korssting(g, [.3, .1], [.33, .34], 3);
      A.cel(g, A.rr(-.22, -.08, .44, .06, .02), LAUG.larM, { lw: .022, hi: false }); nagle(g, .18, -.05, .015);
      A.line(g, [[-.22, -.05], [-.28, .08]], .035, L); A.line(g, [[-.22, -.05], [-.18, .1]], .035, L); // sløyfeenden bak
      A.line(g, [[.24, .02], [.28, -.1]], .03, '#8a6a4a'); A.line(g, [[.28, -.1], [.29, -.16]], .015, '#c8ccd0'); // sylen i lomma
      larGlans(g, .12, top + .26, .3); larGlans(g, .22, .12, .18);
      return;
    }
    A.cel(g, A.blob([[-.28, .02], [.28, .02], [.29, top + .18], [.21, top + .02], [0, top - .01], [-.21, top + .02], [-.29, top + .18]]), K, { sk: .82 });
    // snippen og en liten sløyfe, også den i lær
    for (const s of [-1, 1]) A.cel(g, A.poly([[s * .01, top + .01], [s * .11, top - .01], [s * .06, top + .08]]), '#fbf8f0', { lw: .02, hi: false });
    A.cel(g, A.blob([[0, top + .06], [-.08, top + .02], [-.08, top + .1], [0, top + .07], [.08, top + .1], [.08, top + .02]]), LAUG.larM, { lw: .02, hi: false });
    for (const s of [-1, 1]) A.line(g, [[s * .15, top + .16], [s * .09, top + .03]], .04, L);
    // smekka med nagler langs kanten
    A.cel(g, A.blob([[-.17, top + .15], [.17, top + .15], [.19, -.04], [-.19, -.04]]), L, { sk: .72 });
    for (let i = 0; i < 5; i++) nagle(g, -.13 + i * .065, top + .19, .014);
    for (const s of [-1, 1]) nagle(g, s * .15, -.08, .016);
    korssting(g, [-.17, top + .22], [-.19, -.1], 6); korssting(g, [.17, top + .22], [.19, -.1], 6);
    krokMerke(g, -.08, top + .32, 1.1); // laugets sølvkrok
    for (let i = 0; i < 3; i++) { const x = .05 + i * .045, y = top + .28; A.line(g, [[x, y], [x + .01, y + .12]], .012, '#c8ccd0'); A.flat(g, A.ell(x, y, .012, .018), '#c8ccd0', .01); } // tre sikkerhetsnåler
    // livremmen med messingspenne
    A.cel(g, A.rr(-.3, -.08, .6, .07, .02), LAUG.larM, { lw: .025, hi: false });
    A.flat(g, A.rr(.1, -.095, .09, .1, .015), null, .05); A.flat(g, A.rr(.1, -.095, .09, .1, .015), null, .026, LAUG.messing); A.line(g, [[.105, -.045], [.2, -.045]], .014, LAUG.messing);
    // skjørtet, for langt for ham, med korssting langs falden
    A.cel(g, A.blob([[-.29, -.02], [.29, -.02], [.35, .36], [.12, .39], [-.12, .38], [-.35, .36]]), L, { sk: .72 });
    korssting(g, [-.3, .34], [.3, .34], 9);
    A.curve(g, [-.14, .02], [-.18, .18], [-.12, .32], .014, LAUG.larM); A.curve(g, [.2, .04], [.16, .2], [.22, .3], .014, LAUG.larM); // bretter
    // lomme med syl og en boks lærfett
    A.cel(g, A.rr(-.24, .06, .18, .14, .02), Col.dark(L, .88), { lw: .025, hi: false }); korssting(g, [-.23, .08], [-.07, .08], 4);
    A.line(g, [[-.2, .07], [-.21, -.06]], .035, '#8a6a4a'); A.line(g, [[-.21, -.06], [-.215, -.12]], .015, '#c8ccd0');
    A.cel(g, A.ell(-.12, .06, .045, .025), '#a8a8b0', { lw: .018, hi: false });
    larGlans(g, -.12, top + .2, .38); larGlans(g, .2, .04, .24);
  }
};
WEAPON_ART.reim = [.5, 1.3, .25, .12];
{ const _dw = drawWeapon; drawWeapon = id => id !== 'reim' ? _dw(id) : g => {
  // barberreim i oksehud: håndtak med tråd rundt, hull langs midten og en messingspenne ytterst
  A.cel(g, A.rr(-.05, -.22, .1, .26, .03), '#2a1a10', { lw: .03, hi: false });
  for (let i = 0; i < 4; i++) A.line(g, [[-.05, -.04 - i * .05], [.05, -.06 - i * .05]], .012, LAUG.traad);
  A.cel(g, A.blob([[-.055, -.22], [.055, -.22], [.07, -.7], [.05, -1.12], [-.05, -1.12], [-.065, -.7]]), '#6a3a1a', { line: '#1a0c04', lw: .032, sk: .7 });
  for (let i = 0; i < 6; i++) A.dot(g, 0, -.34 - i * .1, .014, '#1a0c04');
  A.line(g, [[-.035, -.25], [-.045, -1.08]], .008, LAUG.traad); A.line(g, [[.035, -.25], [.045, -1.08]], .008, LAUG.traad);
  A.flat(g, A.rr(-.08, -1.08, .16, .12, .02), null, .05, INK); A.flat(g, A.rr(-.08, -1.08, .16, .12, .02), null, .026, LAUG.messing); A.line(g, [[0, -1.08], [0, -.98]], .018, LAUG.messing);
  A.line(g, [[.02, -.5], [.03, -.9]], .02, 'rgba(255,230,200,.35)');
}; }

/* ---------- Klokkeren: liten, krumrygget gammel mann med digre ører og tre hårstrå, i en lang lærfrakk ---------- */
const KLOKK = { hud: '#eedcc8', har: '#c8c0b4' };
RIG.klokker = { hip: .4, hipW: .09, neck: .5, shW: .19, shY: .44, armW: .11, legW: .09, handR: .075, arm: LAUG.okse, leg: '#2a2020', hand: KLOKK.hud, shoe: 'stovel', scale: .8, headLag: 1.5 };
MONSTER_ART.klokker = {
  box: { hode: [1.4, 1.0, .7, .1], kropp: [1.2, 1.05, .6, .4] },
  hode: v => g => {
    const S = KLOKK.hud, cy = -.42, ore = (x, y, s) => { A.cel(g, A.blob([[x, y - .16], [x + s * .18, y - .22], [x + s * .24, y - .02], [x + s * .16, y + .18], [x, y + .12]]), S); A.flat(g, A.blob([[x + s * .04, y - .1], [x + s * .14, y - .13], [x + s * .17, y], [x + s * .1, y + .1], [x + s * .03, y + .06]]), '#e0a898', 0); };
    const straa = (sx) => { for (let i = 0; i < 3; i++) A.curve(g, [sx * -.24, cy - .08 + i * .03], [0, cy - .36 + i * .03], [sx * .22, cy - .16 + i * .04], .016, KLOKK.har); };
    if (v === 'b') {
      for (const s of [-1, 1]) ore(s * .22, cy + .02, s);
      A.cel(g, A.ell(0, cy, .25, .28), S);
      straa(1); A.flat(g, A.ell(-.08, cy - .12, .07, .04), 'rgba(255,255,255,.4)', 0);
      for (let i = 0; i < 3; i++) A.curve(g, [-.12, cy + .2 + i * .03], [0, cy + .22 + i * .03], [.12, cy + .2 + i * .03], .01, '#b89a88'); // rynker i nakken
      return;
    }
    if (v === 's') {
      A.cel(g, A.ell(.02, cy, .25, .28), S); ore(-.08, cy + .02, -1);
      straa(1); A.flat(g, A.ell(-.02, cy - .16, .08, .04), 'rgba(255,255,255,.45)', 0);
      A.cel(g, A.blob([[.08, cy - .12], [.2, cy - .15], [.24, cy - .09], [.14, cy - .08]]), '#f4f0e8', { lw: .02, hi: false });
      A.curve(g, [.12, cy - .02], [.17, cy + .02], [.22, cy - .02], .02); A.dot(g, .17, cy - .01, .022);
      A.cel(g, A.blob([[.2, cy - .02], [.36, cy + .14], [.32, cy + .2], [.22, cy + .14]]), '#e8b0a0', { lw: .028 });
      A.curve(g, [.08, cy + .22], [.17, cy + .26], [.24, cy + .2], .02);
      return;
    }
    for (const s of [-1, 1]) ore(s * .22, cy + .02, s);
    A.cel(g, A.ell(0, cy, .25, .28), S);
    A.flat(g, A.ell(-.08, cy - .16, .09, .05), 'rgba(255,255,255,.45)', 0); // blank isse
    straa(1);
    for (let i = 0; i < 2; i++) A.curve(g, [-.12, cy - .12 + i * .04], [0, cy - .14 + i * .04], [.12, cy - .12 + i * .04], .01, '#c8a490');
    // buskete hvite bryn og halvlukkede, høflige øyne
    for (const s of [-1, 1]) {
      A.cel(g, A.blob([[s * .03, cy - .06], [s * .1, cy - .11], [s * .2, cy - .09], [s * .22, cy - .04], [s * .12, cy - .06]]), '#f4f0e8', { lw: .02, hi: false });
      A.flat(g, A.ell(s * .1, cy + .01, .05, .03), '#fbf6ea', .018); A.dot(g, s * .1, cy + .02, .022); A.line(g, [[s * .04, cy - .005], [s * .16, cy - .005]], .022);
    }
    A.cel(g, A.blob([[-.04, cy + .02], [.04, cy + .02], [.08, cy + .16], [0, cy + .2], [-.08, cy + .16]]), '#e8b0a0', { lw: .026 });
    // et smalt, høflig smil med én tann
    A.curve(g, [-.1, cy + .22], [0, cy + .27], [.1, cy + .22], .02); A.flat(g, A.rr(.01, cy + .235, .03, .03, .005), '#f4ecd0', .01);
  },
  kropp: v => g => {
    const top = -.52, O = LAUG.okse, OL = LAUG.oksel;
    const kroker = (xs, y) => { for (const x of xs) { A.line(g, [[x, y], [x, y + .05]], .012, '#8a8e98'); krokMerke(g, x + .02, y + .1, .75); } };
    if (v === 'b') {
      A.cel(g, A.blob([[-.28, .36], [.28, .36], [.24, 0], [.21, top + .16], [.12, top + .02], [0, top - .03], [-.12, top + .02], [-.21, top + .16], [-.24, 0]]), O, { line: OL, sk: .7 });
      A.line(g, [[0, top + .08], [0, .34]], .016, OL);
      A.cel(g, A.rr(-.16, -.06, .32, .06, .015), OL, { lw: .02, hi: false }); for (const s of [-1, 1]) A.dot(g, s * .12, -.03, .018, LAUG.messing);
      kroker([-.22, .2], -.02); larGlans(g, -.14, top + .12, .3); larGlans(g, .12, .08, .22);
      return;
    }
    if (v === 's') {
      A.cel(g, A.blob([[-.2, .36], [.2, .36], [.14, 0], [.14, top + .18], [.06, top + .02], [-.08, top - .02], [-.2, top + .08], [-.24, top + .26], [-.18, 0]]), O, { line: OL, sk: .7 }); // krum rygg
      A.cel(g, A.rr(-.02, top + .02, .14, .08, .02), OL, { lw: .02, hi: false });
      A.cel(g, A.rr(.08, top + .22, .12, .28, .02), '#24344e', { lw: .025, hi: false }); A.flat(g, A.rr(.16, top + .24, .03, .24, .005), '#efe6d0', 0); // protokollen under armen
      A.cel(g, A.rr(-.18, -.06, .34, .06, .015), OL, { lw: .02, hi: false }); kroker([-.12, .02], -.02);
      for (let i = 0; i < 3; i++) A.dot(g, .1, top + .12 + i * .1, .018, LAUG.messing);
      larGlans(g, -.12, top + .2, .3);
      return;
    }
    A.cel(g, A.blob([[-.3, .36], [.3, .36], [.25, 0], [.22, top + .16], [.13, top + .02], [0, top - .02], [-.13, top + .02], [-.22, top + .16], [-.25, 0]]), O, { line: OL, sk: .7 });
    A.cel(g, A.blob([[-.13, top + .02], [0, top + .14], [.13, top + .02], [.1, top - .04], [-.1, top - .04]]), OL, { lw: .022, hi: false }); // ståkrage
    A.line(g, [[0, top + .14], [.02, .34]], .016, OL);
    for (let i = 0; i < 4; i++) for (const s of [-1, 1]) nagle(g, s * .07 + .01, top + .2 + i * .09, .015);
    // livremmen med en ring av små sølvkroker
    A.cel(g, A.rr(-.25, -.06, .5, .06, .015), OL, { lw: .022, hi: false });
    A.flat(g, A.rr(-.04, -.07, .08, .08, .012), null, .022, LAUG.solv);
    kroker([-.2, -.1, .1, .2], -.02);
    // protokollen under venstre arm
    A.cel(g, A.rr(-.36, top + .16, .15, .3, .02), '#24344e', { lw: .026, hi: false }); A.flat(g, A.rr(-.23, top + .18, .025, .26, .005), '#efe6d0', 0);
    A.cel(g, A.rr(-.33, top + .24, .09, .05, .005), '#efe6d0', { lw: .012, hi: false });
    larGlans(g, -.14, top + .2, .32); larGlans(g, .14, .06, .24, -1);
    A.line(g, [[-.28, .34], [-.2, .3], [-.1, .35]], .014, OL);
  }
};
WEAPON_ART.bjelle = [.5, .75, .25, .1];
{ const _dw = drawWeapon; drawWeapon = id => id !== 'bjelle' ? _dw(id) : g => {
  // den lille sølvbjella fra Avdeling Null: dreid treskaft, kuppel, kant og kolv
  A.cel(g, A.rr(-.035, -.26, .07, .3, .03), '#7a4a28', { lw: .028, hi: false });
  for (const y of [-.06, -.18]) A.cel(g, A.ell(0, y, .05, .025), '#8a5a30', { lw: .018, hi: false });
  A.cel(g, A.blob([[-.04, -.26], [.04, -.26], [.1, -.29], [.12, -.36], [.12, -.46], [.15, -.56], [.2, -.62], [0, -.63], [-.2, -.62], [-.15, -.56], [-.12, -.46], [-.12, -.36], [-.1, -.29]]), LAUG.solv, { line: '#2a2e36', lw: .03, sk: .72 });
  A.curve(g, [-.13, -.5], [0, -.53], [.13, -.5], .014, '#7a808a');
  A.cel(g, A.ell(0, -.62, .17, .035), '#9aa0aa', { line: '#2a2e36', lw: .022, hi: false });
  A.dot(g, .02, -.66, .035, '#5a5e66');
  A.line(g, [[-.06, -.32], [-.1, -.54]], .02, 'rgba(255,255,255,.7)');
}; }

/* ============================================================
   OPPFØRSEL
   ============================================================ */
Object.assign(Grotesk.keep, { laerling: 1.4, klokker: 6.5 });
Object.assign(Grotesk.retreat, { klokker: 1 });
Object.assign(Grotesk.talk, { laerling: 1, klokker: 1 });
Object.assign(Grotesk.hold, { laerling: 1, klokker: 1 });
const Laug = {
  STUN_CD: 2, KJEDER_MAKS: 10, flereKlokkere: false,
  /* laugets treff i en form: allierte tar skaden, pasienten også, og stans deles mellom alle i lauget (én per STUN_CD sekunder).
     Gir true når pasienten ble truffet. */
  treff(shape, o, dmg, src, stun, ord) {
    const P = G.player, t = { shape, o }; let traff = false;
    for (const a of G.allies) if (a && a.alive && inShape(t, a.x, a.z, (a.r || .4) * .7)) hurt(a, dmg, src);
    if (P && P.alive && inShape(t, P.x, P.z, P.r * .7)) {
      const igjen = (G.laugStunT || 0) - G.time, kan = !!stun && !(igjen > 0 && igjen <= this.STUN_CD);
      const d = hurt(P, dmg, kan ? Object.assign({}, src, { stun }) : src);
      if (d > 0) { traff = true; if (kan) { G.laugStunT = G.time + this.STUN_CD; if (ord) statusOrd(P, ord); } this.notert(P); }
    }
    return traff;
  },
  /* Klokkeren fører protokoll: når lauget treffer pasienten i nærheten, sier han det */
  notert(P) {
    if (Math.random() > .5) return;
    const k = G.enemies.find(e => e.alive && e.type === 'klokker' && e.state !== 'wind' && G.time >= (e.notertT || 0) && d2(e.x, e.z, P.x, P.z) < 81);
    if (!k) return; k.notertT = G.time + 6; FX.bubble(k, 'Notert.', 1); Sound.play('skrivemaskin', .4, 1.1);
  },
  /* krokene fra mørket rundt et punkt. Høyst KJEDER_MAKS levende kjettinger; over det hoppes tegningen over (skaden kommer fra ringen) */
  kjeder(o, n) {
    const plass = this.KJEDER_MAKS - Kjeder.liste.length;
    if (plass <= 0) { Sound.play('kjetting', .5, 1.1); return []; }
    return Kjeder.rundt({ x: o.x, y: 1, z: o.z }, Math.min(n, plass), { hold: .4, treff: () => { this.sistTreff = G.time; R.shake(.15); } }) || [];
  },
  /* spenner pasienten fast etter et reimslag som traff */
  spenn(e) {
    const P = G.player, o = { x: P.x, z: P.z, r: .85, color: 0x8a5a2a, type: 'fysisk' };
    e.state = 'wind'; e.t = Math.max(e.t, .6); Sound.play('spenne', .5, .9);
    addTele('circle', o, .5, () => {
      Sound.play('spenne', .9);
      if (this.treff('circle', o, e.dmg * .3, { type: 'laerling', x: e.x, z: e.z }, .6, 'SPENT FAST') && Math.random() < .5) FX.bubble(e, pick(['Sitter den godt?', 'Messingspenne, 1887-modell.', 'Kjenn så godt den sitter!', 'Tre hull inn. Perfekt.']), 1.3);
    }, e);
  },
  /* Klokkeren kaller på en lærling, som kommer bukkende */
  kall(e) {
    const s = freeSpot(e.x + rnd(-1.4, 1.4), e.z + rnd(-1.4, 1.4), 2);
    e.kallT = G.time + 12; e.state = 'wind'; e.t = .9; e.positur = { navn: 'ringe', t: 0, dur: .8 }; FX.bubble(e, pick(['Lærling! Besøk!', 'Besøkstiden er over.', 'Gutt! Reima!']), 1.3); Sound.play('bjelle', .3, 1.5);
    addTele('circle', { x: s.x, z: s.z, r: .6, color: 0x8a5a2a, type: 'fysisk', stille: true }, .8, () => { // bare der lærlingen kommer, ikke et slag
      if (G.enemies.filter(f => f.alive).length >= 14) return;
      const l = spawnEnemy('laerling', s.x, s.z, false, G.depth); l.face = Math.atan2(G.player.x - l.x, G.player.z - l.z); l.positur = { navn: 'bukk', t: 0, dur: .8 }; FX.bubble(l, 'Til tjeneste!', 1.2); Sound.play('bukk', .6);
    }, e);
  }
};
Object.assign(Grotesk.ai, {
  /* bukker (varselet), slår med reima, og spenner deg fast av og til */
  laerling(e, T, dist, toT) {
    if (dist > 3 || !los(e.x, e.z, T.x, T.z)) return;
    const tid = .55, o = { x: e.x, z: e.z, a: toT, w: .9, len: 3.4, color: 0x8a5a2a, type: 'fysisk' };
    e.state = 'wind'; e.t = tid + .4; e.face = toT; e.positur = { navn: 'bukk', t: 0, dur: tid };
    Sound.play('bukk', .7, rnd(.9, 1.15)); if (Math.random() < .4) FX.bubble(e, 'Med Deres tillatelse.', 1.1);
    addTele('rect', o, tid, () => {
      e.positur = { navn: 'reimslag', t: 0, dur: .32 }; Sound.play('smekk', .9); Sound.play('swing', .5, 1.3);
      const P = G.player, traff = Laug.treff('rect', o, e.dmg, { type: 'laerling', x: e.x, z: e.z, kb: 4 });
      if (traff && P.alive && Math.hypot(P.x - e.x, P.z - e.z) < 2.2 && Math.random() < .5) { Laug.spenn(e); return; }
      if (Math.random() < .3) FX.bubble(e, pick(['Unnskyld.', 'Beklager, det var reima.', 'Takk for tålmodigheten.']), 1);
      e.kvx = -Math.sin(e.face) * 3; e.kvz = -Math.cos(e.face) * 3; // et lite skritt tilbake
    }, e);
    e.cd = rnd(1.8, 2.6);
  },
  /* ringer med bjella: sølvringen der pasienten står, krokene fra mørket når ringen går av. Hver tredje er stor */
  klokker(e, T, dist, toT) {
    const lar = G.enemies.filter(f => f.alive && f.type === 'laerling').length;
    if (G.time >= (e.kallT || 0) && lar < 2 && G.enemies.filter(f => f.alive).length < 14 && (dist < 4 || Math.random() < .4)) { Laug.kall(e); return; }
    if (dist < 3 || dist > 10 || G.time < (e.ringT || 0)) { e.cd = .4; if (dist < 3 && Math.random() < .08) FX.bubble(e, 'Besøkstiden er over.', 1); return; }
    e.ringN = (e.ringN || 0) + 1; const stor = e.ringN % 3 === 0, tid = 1.2, o = { x: T.x, z: T.z, r: stor ? 2 : 1.4, color: 0xc8ccd8, type: 'lenke' };
    e.state = 'wind'; e.t = tid + .15; e.face = toT; e.positur = { navn: 'ringe', t: 0, dur: tid }; e.ringT = G.time + rnd(3.2, 4.4);
    Sound.play('bjelle', stor ? .55 : .38, 1.2); // lyden er varselet, lysere og svakere enn i historien
    if (stor) FX.bubble(e, pick(['Stor visitt!', 'Alle kroker, takk.', 'Nå ringer vi ordentlig.']), 1.3); else if (Math.random() < .3) FX.bubble(e, pick(['Hører De bjella?', 'Besøkstid.', 'Det er til Dem.']), 1.1);
    addTele('circle', o, tid, () => { Laug.treff('circle', o, e.dmg * (stor ? 1.3 : 1), { type: 'klokker', x: o.x, z: o.z, kb: 2 }, .35, 'HEKTET'); R.shake(stor ? .25 : .12); Sound.play('kjetting', .6, 1.1); }, e);
    bossLaterE(e, tid - .16, () => { if (e.state === 'wind' && !(e.stun > 0)) Laug.kjeder(o, stor ? 5 : 3); });
    e.cd = 1;
  }
});
/* høyst én klokker i rommet: flere blir lærlinger. Klokkeren venter litt før han roper på hjelp første gang */
{ const _se = spawnEnemy; spawnEnemy = function (type, x, z, elite, depth) {
  if (type === 'klokker' && !Laug.flereKlokkere && G.enemies.some(e => e.alive && e.type === 'klokker')) type = 'laerling';
  const e = _se(type, x, z, elite, depth);
  if (e && e.type === 'klokker') { e.kallT = G.time + rnd(4, 7); e.ringT = G.time + rnd(.6, 1.4); }
  return e;
}; }

/* ============================================================
   HOLDNINGSSØSTEREN
   Laugets holdningssøster: eldre, rak som en linjal, med stram knute, lorgnett i kjede og en stivet lue med laugets sølvkrok.
   Hun går med en høy nakkekrage i lær og en snøret ryggskinne over den svarte kjolen, og har en rull lærsnøre og en gul tommestokk.
   - Snøring: en brun ring der pasienten står, to lærreimer fra hendene hennes, og så SNØRT: du går tregere til du ruller deg løs.
     Mens pasienten er snørt, slår laugets folk innen åtte ruter 25 prosent hardere i fire sekunder («Rett ryggen!»).
     Hun snører aldri en pasient som alt er slått ut eller snørt.
   - Tommestokken: en kjegle på kloss hold.
   Tregheten bruker P.mokkT denne runden (samme som myr), med en egen klokke (P.snortT) så en pytt ikke korter den ned.
   ============================================================ */
Object.assign(FIENDESTEMME, { holdning: ['knirk', 1.2] });
Object.assign(ENEMIES, { holdning: { name: 'Holdningssøsteren', hp: 40, speed: 2.3, r: .44, dmg: 9, xp: 13, teeth: [1, 3], bubbleH: 3.3, weapon: 'tommestokk', blood: 0x8a1a1a } });
Object.assign(LINES, { holdning: ['Rett ryggen!', 'Skuldrene tilbake, takk.', 'Holdningen Deres er et symptom.', 'Snørt. Pent.', 'Smerte er bare god holdning som ikke har kommet fram ennå.',
  'Haka opp. Nei, ikke så langt.', 'Jeg har gått rett siden 1887. Det gjør vondt hver dag, og det er poenget.', 'Nakkekragen er oksehud. Tre spenner. Jeg strammer den til søndag.', 'Tommestokken lyver aldri, vennen.'] });
Object.assign(DEATH_CAUSES, { holdning: ['Snørt så stramt at resten ikke fikk plass.', 'Døde med perfekt holdning.', 'Målt med tommestokk og funnet for kort.'] });
DEPTH_ENEMIES[4].push('holdning'); DEPTH_ENEMIES[6].push('holdning');
Object.assign(MESTER_TITTEL, { holdning: 'Søster' });
PA[4].push('Laugets holdningssøster tar imot i korridoren. Rett ryggen før De går forbi, så slipper De å bli rettet.');
Object.assign(POSER, {
  // snøringen: hendene fram med reimene, og så et rykk bakover
  snore: { hR: [[0, .1, -.3], [.45, .36, .24], [.8, .42, .3], [.9, .1, .1], [1, .06, -.24]], hL: [[0, -.1, -.3], [.45, -.3, .26], [.8, -.36, .32], [.9, -.06, .12], [1, -.06, -.26]],
    lean: [[0, 0], [.8, .6], [.9, -1], [1, 0]], hode: [[0, 0], [.8, .1], [.9, -.2], [1, 0]] },
  linjal: { hR: [[0, .2, .38], [.4, .3, .44], [.55, .5, -.1], [1, .24, -.3]], lean: [[0, -.3], [.5, .8], [1, 0]], hode: [[0, 0], [.5, .12], [1, 0]] }
});

const HOLD = { hud: '#ecd6c0', har: '#b8b2aa', harM: '#8a847c', kjole: '#1e1a22', kjoleL: '#3a3440', lue: '#f6f2e6', forkle: '#ece6d6' };
RIG.holdning = { hip: .5, hipW: .1, neck: .8, shW: .22, shY: .7, armW: .1, legW: .09, handR: .075, arm: HOLD.kjole, leg: '#2a2228', hand: HOLD.hud, shoe: 'stovel', scale: .9, headLag: .5 };
// en liten messingspenne på en reim
const spenne = (g, x, y, s = 1) => { A.flat(g, A.rr(x - .03 * s, y - .025 * s, .06 * s, .05 * s, .008), null, .03 * s, INK); A.flat(g, A.rr(x - .03 * s, y - .025 * s, .06 * s, .05 * s, .008), null, .014 * s, LAUG.messing); A.line(g, [[x - .03 * s, y], [x + .03 * s, y]], .01 * s, LAUG.messing); };
MONSTER_ART.holdning = {
  box: { hode: [1.1, 1.2, .55, .1], kropp: [1.2, 1.4, .6, .44] },
  hode: v => g => {
    const S = HOLD.hud, H = HOLD.har, cy = -.52;
    // den stivede lua med laugets sølvkrok
    const lue = x => { A.cel(g, A.blob([[x - .24, cy - .2], [x - .2, cy - .38], [x - .1, cy - .44], [x + .1, cy - .44], [x + .2, cy - .38], [x + .24, cy - .2], [x, cy - .24]]), HOLD.lue, { sk: .88 }); A.line(g, [[x - .21, cy - .3], [x + .21, cy - .3]], .012, '#c8c0b0'); krokMerke(g, x + .1, cy - .36, .8); };
    if (v === 'b') {
      A.cel(g, A.ell(0, cy, .25, .32), H, { sk: .72 });
      for (let i = 0; i < 5; i++) A.curve(g, [-.2 + i * .1, cy - .28], [-.18 + i * .09, cy - .08], [-.06 + i * .03, cy + .06], .012, Col.light(H, .25));
      // den stramme knuten, med to hårnåler
      A.cel(g, A.ell(0, cy + .08, .12, .1), H, { sk: .72 }); A.curve(g, [-.08, cy + .06], [0, cy + .14], [.08, cy + .06], .012, HOLD.harM); A.line(g, [[-.12, cy + .02], [.1, cy + .14]], .014, '#6a6a72'); A.line(g, [[.12, cy + .02], [-.08, cy + .15]], .014, '#6a6a72');
      lue(0);
      return;
    }
    if (v === 's') {
      A.cel(g, A.ell(.02, cy, .23, .32), S);
      A.cel(g, A.blob([[-.22, cy + .08], [-.24, cy - .14], [-.14, cy - .3], [.06, cy - .33], [.2, cy - .24], [.08, cy - .2], [-.04, cy - .14], [-.1, cy + .04]]), H, { sk: .72 });
      A.cel(g, A.ell(-.24, cy + .02, .09, .09), H, { sk: .72 }); // knuten i nakken
      A.flat(g, A.ell(.14, cy - .04, .05, .05), 'rgba(230,242,250,.55)', .018); A.dot(g, .15, cy - .04, .018); A.curve(g, [.1, cy - .02], [.02, cy + .16], [-.04, cy + .3], .008, '#a8acb4'); // lorgnetten i kjedet
      A.curve(g, [.08, cy - .12], [.15, cy - .16], [.21, cy - .12], .018, H);
      A.cel(g, A.blob([[.2, cy - .04], [.3, cy + .1], [.22, cy + .12]]), '#e0b8a0', { lw: .022 });
      A.line(g, [[.14, cy + .2], [.22, cy + .19]], .02); // smale, pressede lepper
      for (let i = 0; i < 2; i++) A.curve(g, [.04, cy + .06 + i * .05], [.08, cy + .08 + i * .05], [.1, cy + .06 + i * .05], .008, '#b89a88');
      lue(-.02);
      return;
    }
    A.cel(g, A.ell(0, cy, .23, .32), S);
    A.cel(g, A.blob([[-.22, cy + .02], [-.24, cy - .16], [-.12, cy - .3], [0, cy - .32], [.12, cy - .3], [.24, cy - .16], [.22, cy + .02], [.16, cy - .14], [0, cy - .2], [-.16, cy - .14]]), H, { sk: .72 }); // strøket stramt bakover
    for (const s of [-1, 1]) A.curve(g, [s * .04, cy - .28], [s * .14, cy - .24], [s * .2, cy - .1], .01, HOLD.harM);
    // det ene brynet hevet: misbilligelse
    A.curve(g, [-.16, cy - .08], [-.1, cy - .11], [-.04, cy - .08], .02, HOLD.harM); A.curve(g, [.04, cy - .12], [.1, cy - .17], [.16, cy - .13], .02, HOLD.harM);
    for (const s of [-1, 1]) { A.flat(g, A.ell(s * .1, cy - .02, .055, .025), '#fbf6ea', .014); A.dot(g, s * .1, cy - .015, .018); }
    // lorgnetten på nesen, med kjede ned til brystet
    for (const s of [-1, 1]) A.flat(g, A.ell(s * .1, cy - .02, .07, .065), 'rgba(230,242,250,.45)', .016, '#8a8e98');
    A.curve(g, [-.03, cy - .03], [0, cy - .06], [.03, cy - .03], .014, '#8a8e98'); A.curve(g, [.17, cy - .01], [.24, cy + .14], [.18, cy + .34], .008, '#a8acb4');
    A.cel(g, A.blob([[-.03, cy + .02], [.03, cy + .02], [.05, cy + .12], [0, cy + .14], [-.05, cy + .12]]), '#e0b8a0', { lw: .022 });
    A.line(g, [[-.07, cy + .21], [.07, cy + .21]], .02); // munnen: en rett strek
    for (const s of [-1, 1]) { A.curve(g, [s * .1, cy + .14], [s * .12, cy + .19], [s * .1, cy + .24], .008, '#b89a88'); A.curve(g, [s * .15, cy - .02], [s * .19, cy], [s * .2, cy + .04], .008, '#b89a88'); }
    lue(0);
  },
  kropp: v => g => {
    const top = -.8, K = HOLD.kjole, L = LAUG.lar, LM = LAUG.larM;
    // den høye nakkekragen i lær, med tre spenner på den synlige siden
    const krage = (w, spenner) => { A.cel(g, A.rr(-w, top - .14, w * 2, .2, .03), L, { line: '#1a0c04', lw: .026, sk: .72 }); A.line(g, [[-w + .02, top - .12], [w - .02, top - .12]], .008, LAUG.traad); A.line(g, [[-w + .02, top + .04], [w - .02, top + .04]], .008, LAUG.traad); for (const x of spenner) spenne(g, x, top - .04, .9); larGlans(g, -w * .5, top - .12, .14); };
    if (v === 'b') {
      A.cel(g, A.blob([[-.28, .38], [.28, .38], [.22, 0], [.22, top + .16], [.14, top + .04], [0, top + .02], [-.14, top + .04], [-.22, top + .16], [-.22, 0]]), K, { line: '#0a080c', sk: .75 });
      // ryggskinnen: to lærskinner langs ryggen, snøret i kryss fra skulderbladene ned til livet
      A.cel(g, A.blob([[-.17, top + .14], [.17, top + .14], [.16, -.02], [-.16, -.02]]), L, { line: '#1a0c04', lw: .026, sk: .72 });
      for (const s of [-1, 1]) { A.cel(g, A.rr(s * .06 - .025, top + .16, .05, .64, .015), LM, { lw: .018, hi: false }); for (let i = 0; i < 6; i++) A.dot(g, s * .06, top + .2 + i * .1, .012, LAUG.messing); }
      for (let i = 0; i < 5; i++) { const y = top + .2 + i * .1; A.line(g, [[-.06, y], [.06, y + .1]], .012, LAUG.traad); A.line(g, [[.06, y], [-.06, y + .1]], .012, LAUG.traad); }
      A.line(g, [[-.03, -.02], [-.07, .12]], .012, LAUG.traad); A.line(g, [[.03, -.02], [.08, .1]], .012, LAUG.traad); // sløyfa
      krage(.13, []); A.line(g, [[0, top - .14], [0, top + .06]], .014, LM);
      for (const s of [-1, 1]) A.line(g, [[s * .14, top + .12], [s * .19, top + .04]], .04, L);
      A.line(g, [[-.2, .36], [0, .34], [.2, .36]], .012, HOLD.kjoleL);
      return;
    }
    if (v === 's') {
      A.cel(g, A.blob([[-.2, .38], [.22, .38], [.14, 0], [.14, top + .16], [.08, top + .03], [-.08, top + .02], [-.14, top + .14], [-.16, 0]]), K, { line: '#0a080c', sk: .75 });
      A.cel(g, A.blob([[.06, -.02], [.18, -.02], [.22, .36], [.04, .36]]), HOLD.forkle, { lw: .02, hi: false });
      A.cel(g, A.rr(-.16, top + .14, .3, .74, .02), L, { line: '#1a0c04', lw: .024, sk: .72 }); // skinnen fra siden
      for (let i = 0; i < 3; i++) { A.line(g, [[-.16, top + .24 + i * .22], [.14, top + .24 + i * .22]], .03, LM); spenne(g, .1, top + .24 + i * .22, .8); }
      krage(.1, [.06]);
      // en rull lærsnøre i beltet
      for (let i = 0; i < 3; i++) A.flat(g, A.ell(-.2, .02 + i * .012, .07 - i * .012, .05 - i * .008), null, .02, LM);
      larGlans(g, -.12, top + .2, .4);
      return;
    }
    A.cel(g, A.blob([[-.3, .38], [.3, .38], [.23, 0], [.23, top + .16], [.14, top + .04], [0, top + .02], [-.14, top + .04], [-.23, top + .16], [-.23, 0]]), K, { line: '#0a080c', sk: .75 });
    // hvitt forkle nederst, og ryggskinnens reimer rundt livet og over skuldrene
    A.cel(g, A.blob([[-.18, -.02], [.18, -.02], [.24, .36], [-.24, .36]]), HOLD.forkle, { lw: .022, hi: false });
    A.line(g, [[-.2, .34], [0, .32], [.2, .34]], .01, '#c8c0b0');
    for (const s of [-1, 1]) { A.line(g, [[s * .15, top + .06], [s * .13, -.06]], .055, '#1a0c04'); A.line(g, [[s * .15, top + .06], [s * .13, -.06]], .036, L); spenne(g, s * .14, top + .3, .8); }
    A.cel(g, A.rr(-.24, -.1, .48, .09, .02), L, { line: '#1a0c04', lw: .024, hi: false }); spenne(g, 0, -.055, 1.1);
    for (let i = 0; i < 4; i++) nagle(g, -.2 + i * .04 + (i > 1 ? .24 : 0), -.055, .012);
    // pleierurets på brystet, og lorgnettkjedet som ender der
    A.flat(g, A.ell(-.07, top + .22, .04, .04), '#e8e4d8', .016, '#8a8e98'); A.line(g, [[-.07, top + .2], [-.07, top + .22], [-.055, top + .22]], .008);
    krage(.14, [-.08, 0, .08]);
    // rullen med lærsnøre på hofta
    for (let i = 0; i < 3; i++) A.flat(g, A.ell(-.26, .06 + i * .012, .07 - i * .012, .05 - i * .008), null, .02, LM);
    A.curve(g, [-.26, .1], [-.3, .2], [-.24, .26], .014, LM);
    larGlans(g, -.1, top + .1, .3); larGlans(g, .16, top + .1, .3, -1);
  }
};
WEAPON_ART.tommestokk = [.4, 1.3, .2, .1];
{ const _dw = drawWeapon; drawWeapon = id => id !== 'tommestokk' ? _dw(id) : g => {
  // en gul tommestokk, halvveis brettet ut: fem ledd i sikksakk med svarte streker og messingledd
  let x = 0, y = 0;
  for (let i = 0; i < 5; i++) {
    const a = (i % 2 ? .08 : -.08), L = .22, nx = x + Math.sin(a) * L, ny = y - Math.cos(a) * L;
    g.save(); g.translate(x, y); g.rotate(a); A.cel(g, A.rr(-.035, -L, .07, L, .01), '#f0c83a', { line: '#3a2a08', lw: .022, hi: false });
    for (let k = 1; k < 8; k++) A.line(g, [[-.035, -k * L / 8], [k % 4 ? -.012 : .005, -k * L / 8]], .008, '#1a1408');
    if (i === 2) { g.fillStyle = '#b3261e'; g.font = 'bold .045px Georgia'; g.fillText('50', -.02, -.1); }
    g.restore(); if (i) A.dot(g, x, y, .018, LAUG.messing);
    x = nx; y = ny;
  }
  A.line(g, [[-.015, -.02], [-.02, -.18]], .01, 'rgba(255,250,220,.5)');
}; }

/* ---------- reimene hun kaster: Kjeder.slag med lær i stedet for kjetting, og en messingspenne i stedet for kroken ---------- */
Object.assign(Laug, {
  reimTex() {
    if (!this._rt) this._rt = R.canvasTex(64, 16, g => {
      g.fillStyle = '#1a0c04'; g.fillRect(0, 2, 64, 12); g.fillStyle = '#6a3a1a'; g.fillRect(0, 4, 64, 8);
      g.fillStyle = 'rgba(255,230,200,.3)'; g.fillRect(0, 5, 64, 1.4);
      g.fillStyle = '#e0c088'; for (let x = 2; x < 64; x += 6) { g.fillRect(x, 4.6, 3, .9); g.fillRect(x, 10.6, 3, .9); }
      g.fillStyle = '#1a0c04'; for (const x of [16, 48]) { g.beginPath(); g.arc(x, 8, 1.4, 0, TAU); g.fill(); }
    }, true);
    return this._rt;
  },
  spenneTex() {
    if (!this._st) this._st = R.canvasTex(64, 64, g => {
      g.lineCap = 'round'; g.lineJoin = 'round';
      for (const [w, c] of [[9, '#1a0c04'], [5, '#d4a83a']]) { g.strokeStyle = c; g.lineWidth = w; g.strokeRect(12, 20, 30, 24); g.beginPath(); g.moveTo(27, 20); g.lineTo(27, 44); g.stroke(); }
      g.strokeStyle = 'rgba(255,244,200,.8)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(14, 22); g.lineTo(40, 22); g.stroke();
    });
    return this._st;
  },
  /* to reimer fra hendene hennes til pasienten. Bare det tegnede: skaden kommer fra ringen. Ingen i Enkel grafikk, og ikke over taket.
     Reimene sitter i hendene hennes (følger henne) og holdes stramme så lenge pasienten er snørt, så han ser hva som holder ham igjen */
  reimer(e) {
    if (R.safe || !R.scene || Kjeder.liste.length + 2 > this.KJEDER_MAKS) return 0;
    const P = G.player; let n = 0; e.reimK = [];
    for (const s of [-1, 1]) {
      const fra = { get x() { return e.x + Math.sin(e.face + s * .6) * .35; }, y: 1.25, get z() { return e.z + Math.cos(e.face + s * .6) * .35; } };
      const K = Kjeder.slag(fra, () => ({ x: P.x + s * .15, y: .95, z: P.z }), { inn: .2, hold: .45, ut: .28, bredde: .13 });
      if (K) { K.m.material.map = this.reimTex(); K.krok.material.map = this.spenneTex(); K.krok.center.set(.3, .5); K.krok.scale.set(.5, .5, 1); K.reim = true; e.reimK.push(K); n++; }
    }
    return n;
  },
  /* reimene holdes stramme i t sekunder til, eller slippes og går tilbake med en gang */
  stram(e, t) { for (const K of e.reimK || []) if (Kjeder.liste.includes(K)) K.hold = Math.max(K.hold, Math.max(0, K.t - K.inn) + t); },
  slipp(e) { for (const K of e.reimK || []) if (Kjeder.liste.includes(K)) K.hold = Math.min(K.hold, Math.max(0, K.t - K.inn)); e.reimK = null; },
  slippAlle() { for (const e of G.enemies) if (e.reimK) this.slipp(e); },
  /* snøringen: en brun ring der pasienten står. Treffer den, blir pasienten SNØRT, og lauget i nærheten slår hardere */
  snor(e, T, toT) {
    const tid = 1, o = { x: T.x, z: T.z, r: 1.25, color: 0x8a5a2a, type: 'fysisk' };
    e.state = 'wind'; e.t = tid + .3; e.face = toT; e.positur = { navn: 'snore', t: 0, dur: tid + .15 };
    FX.bubble(e, 'Rett ryggen!', 1.2); Sound.play('swing', .5, 1.5); Sound.play('knirk', .45, 1.2);
    addTele('circle', o, tid, () => {
      const P = G.player; Sound.play('spenne', .7, .8);
      if (!this.treff('circle', o, e.dmg * .5, { type: 'holdning', x: o.x, z: o.z }) || P.stunT > 0) return;
      this.snoer(P, this.SNORT); this.stram(e, this.SNORT); this.rett(e);
    }, e);
    bossLaterE(e, tid - .2, () => { if (e.state === 'wind' && !(e.stun > 0)) this.reimer(e); });
    e.cd = rnd(2.6, 3.6);
  },
  SNORT: 2.5, RETT: 4, RETT_K: 1.25, MEDLEMMER: { laerling: 1, klokker: 1, holdning: 1, oldermann: 1 },
  snoer(P, t) { P.snortT = Math.max(P.snortT || 0, t); P.mokkT = Math.max(P.mokkT || 0, .05); statusOrd(P, 'SNØRT'); },
  /* rullet løs: snøret ryker */
  los(P) { P.snortT = 0; P.mokkT = 0; this.slippAlle(); statusOrd(P, 'LØS'); Sound.play('rive', .6, 1.4); },
  /* «Rett ryggen!»: laugets folk innen åtte ruter slår 25 prosent hardere i fire sekunder. Skaden lagres og settes tilbake nøyaktig */
  rett(e) {
    let n = 0;
    for (const f of G.enemies) if (f.alive && this.MEDLEMMER[f.type] && d2(f.x, f.z, e.x, e.z) < 64) {
      if (!f.rettet) { f.rettet = { dmg: f.dmg, satt: f.dmg * this.RETT_K }; f.dmg = f.rettet.satt; }
      f.rettetT = this.RETT; n++; Particles.spawn(f.x, 1.3, f.z, 5, 0x8a5a2a, { speed: 1, up: 2.5, g: 0, life: .7, size: .8 });
      if (f !== e && Math.random() < .4) FX.bubble(f, pick(['Ja, søster!', 'Rett rygg!', 'Takk, søster.']), 1);
    }
    FX.bubble(e, pick(['Rett ryggen!', 'Snørt. Pent.', 'Skuldrene tilbake, takk.']), 1.2);
    return n;
  },
  /* tommestokken på kloss hold */
  linjal(e, toT) {
    const tid = .55, o = { x: e.x, z: e.z, a: toT, r: 2.2, arc: 1.6, color: 0x8a5a2a, type: 'fysisk' };
    e.state = 'wind'; e.t = tid + .35; e.face = toT; e.raise = true; if (Math.random() < .3) FX.bubble(e, pick(['Skuldrene tilbake, takk.', 'Tommestokken lyver aldri.', 'Rett. Deg.']), 1);
    addTele('cone', o, tid, () => { e.raise = false; e.positur = { navn: 'linjal', t: 0, dur: .3 }; Sound.play('bonk', .8, 1.4); Sound.play('swing', .5, 1.4); this.treff('cone', o, e.dmg, { type: 'holdning', x: e.x, z: e.z, kb: 5 }); slashFx(e.x, e.z, o.a, 2.2, 1.6, false, 0xf0c83a); }, e);
    e.cd = rnd(1.4, 2);
  }
});
Object.assign(Grotesk.keep, { holdning: 3.2 });
Object.assign(Grotesk.retreat, { holdning: 1 });
Object.assign(Grotesk.talk, { holdning: 1 });
Object.assign(Grotesk.hold, { holdning: 1 });
Object.assign(Grotesk.ai, {
  /* tommestokken nær, snøringen på avstand. Aldri på en pasient som er slått ut eller alt snørt */
  holdning(e, T, dist, toT) {
    const P = G.player;
    if (dist < 2.4) { Laug.linjal(e, toT); return; }
    if (T === P && dist <= 7 && !(P.stunT > 0) && !(P.snortT > 0) && los(e.x, e.z, T.x, T.z) && Math.random() < .6) { Laug.snor(e, T, toT); return; }
    e.cd = .35;
  }
});
/* snøret: pasienten går tregere (P.mokkT, som myr) så lenge P.snortT varer, og en rulle løser det med en gang */
{ const _up = updatePlayer; updatePlayer = function (dt, A) {
  const P = G.player;
  if (P && P.snortT > 0) { P.snortT -= dt; if (P.snortT > 0 && P.alive) P.mokkT = Math.max(P.mokkT || 0, dt + .02); else { P.snortT = 0; Laug.slippAlle(); } }
  const r = _up(dt, A);
  if (P && P.snortT > 0 && P.roll > 0) Laug.los(P);
  return r;
}; }
/* «Rett ryggen!» går ut: skaden tilbake nøyaktig, eller faktoren tas ut av det som står hvis noe annet har endret den underveis */
{ const _ue = updateEnemy; updateEnemy = function (e, dt) {
  if (e.reimK && (!e.alive || e.stun > 0 || e.sleep > 0)) Laug.slipp(e); // slått ut eller død: reimene går slakke og tilbake
  if (e.rettet) {
    e.rettetT -= dt;
    if (e.rettetT <= 0 || !e.alive) { const V = e.rettet; e.dmg = e.dmg === V.satt ? V.dmg : e.dmg / Laug.RETT_K; e.rettet = null; }
    else if (Math.random() < dt * 2) Particles.spawn(e.x + rnd(-.3, .3), 1.5, e.z + rnd(-.3, .3), 1, 0x8a5a2a, { speed: .3, up: 1.2, g: 0, life: .6, size: .7 });
  }
  return _ue(e, dt);
}; }

/* ============================================================
   OLDERMANN NÅLEPUTE  -  minisjef, laugets formann
   En høy, verdig gammel herre i sort lærfrakk med vingekrage og et skjerf med laugets medaljer. Kinnskjegg,
   hvalrossbart og lorgnett, og en rund nålepute i rød fløyel spent fast på den blanke issen, full av knappenåler
   med glasshoder. Nålene sitter i puta, aldri i ham.
   Han leder kampen som et møte: leser opp dagsorden i boblen (bokslag) og gjør sakene i nøyaktig den rekkefølgen,
   med et klubbeslag mellom hver. Dagsorden blir stående i boblen, med sakene som er ferdige strøket over.
   - Knappenåler: et rektangel (2,2 bredt og 8 langt), så tre salver med fem nåler i vifte.
   - Kjettinger: en sølvring der pasienten står, krokene fra mørket, og et treff drar pasienten inn til ham («HEKTET»).
   - Klubba: en ring rundt ham selv, 1,2 ganger skaden og et kraftig tilbakeslag.
   - Votering: to lærlinger kommer og sier ja. Er det alt tre lærlinger i live, faller forslaget, og han bruker klubba.
   - Eventuelt: en av de tre første, og boblen sier hvilken.
   Ved halv helse, én gang: «Ekstraordinært årsmøte!» Han ringer selv, fire sølvringer rundt pasienten, og klokkeren kommer.
   Aldri i parken (ENEMIES.oldermann.fraDybde, se Mini.onFloor).
   ============================================================ */
Object.assign(Sound.lib, {
  bokslag: [{ n: 1, d: .12, f0: 1200, f1: 300, ft: 'lowpass', v: .5 }, { w: 'sine', f: 110, d: .1, pd: .5, v: .3 }],
  klubbe: [{ w: 'triangle', f: 520, d: .07, pd: .7, v: .35 }, { n: 1, d: .05, f0: 2400, f1: 900, ft: 'bandpass', v: .3 }, { w: 'sine', f: 140, d: .12, pd: .5, v: .3 }],
  naaler: [{ n: 1, d: .12, f0: 6000, f1: 2500, ft: 'bandpass', v: .18 }, { w: 'triangle', f: 2600, d: .04, v: .06 }]
});
Object.assign(LYD_KART, {
  bokslag: { s: [['bokslag', .7]], syn: .2 },
  klubbe: { s: [['stamp', .6, .85], ['ins_treblokk', .55, .9]], syn: .25 },
  naaler: { s: [['swing', .35, 1.9], ['stikk', .2, 1.6]], syn: .4 }
});
Object.assign(FIENDESTEMME, { oldermann: ['knirk', .85] });
Object.assign(ENEMIES, { oldermann: { name: 'Oldermann Nålepute', hp: 340, speed: 2.2, r: .55, dmg: 13, xp: 60, teeth: [22, 32], bubbleH: 4.3, mini: true, weapon: 'klubbe', skygge: .6, blood: 0x9a1a1a, tittel: 'Takk for tålmodigheten', fraDybde: 2 } });
Object.assign(LINES, { oldermann: ['Møtet er satt.', 'Sak én: Deres smerte. Sak to: Eventuelt.', 'Forslaget er vedtatt mot én stemme. Deres.', 'Skinnlauget takker for tålmodigheten.', 'Overlege Krok er æresmedlem. Han kommer aldri på møtene.',
  'Forstanderen? Vårt fineste arbeid. Dobbel søm, 1887.', 'Referatet sendes Journalen.', 'Puta? Rød fløyel og hundre og tolv nåler. Jeg teller dem hver morgen.', 'Frakken er hel oksehud. Den har vært på alle møtene siden 1887.'] });
Object.assign(DEATH_CAUSES, { oldermann: ['Vedtatt behandlet, mot én stemme.', 'Ført i protokollen under «Eventuelt».', 'Stukket av en nålepute med stemmerett.', 'Møtet ble hevet. Det samme ble pasienten.'] });
MINISJEFER.push('oldermann');
Object.assign(POSER, {
  // leser dagsorden: arket opp foran seg, hodet ned
  lese: { hR: [[0, .12, -.34], [.2, .1, .12], [.9, .1, .12], [1, .12, -.3]], hL: [[0, -.1, -.34], [.2, -.14, .1], [.9, -.14, .1], [1, -.1, -.34]], hode: [[0, 0], [.2, .22], [.9, .22], [1, 0]] },
  // klubbeslaget: opp, og ned i bordet som ikke er der
  klubbeslag: { hR: [[0, .14, .3], [.3, .22, .52], [.55, .34, -.06], [.75, .32, -.1], [1, .14, -.3]], lean: [[0, -.2], [.3, -.5], [.55, .8], [1, 0]], hode: [[0, 0], [.55, .16], [1, 0]] }
});

const OLD = { hud: '#eed4bc', nese: '#e0a090', har: '#e6e2da', harM: '#a8a49c', frakk: '#1e1a1e', frakkL: '#3a3238', pute: '#a01c28', puteM: '#5a0a12', vest: '#4a4450', skjorte: '#f4efe4' };
RIG.oldermann = { hip: .54, hipW: .15, neck: .86, shW: .33, shY: .76, armW: .14, legW: .13, handR: .1, arm: OLD.frakk, leg: '#1e1a1e', hand: OLD.hud, shoe: 'stovel', scale: 1.22, headLag: .6 };
// nåleputa: rød fløyel, knappet i midten, spent fast med en lærreim, full av knappenåler med glasshoder
const NAALEFARGER = ['#e8d040', '#f4f0e8', '#3a6ab0', '#c82a3a', '#4a9a5a', '#e8d040', '#f4f0e8', '#8a4ab0'];
const naalepute = (g, x, y, s = 1, bak = false) => {
  for (let i = 0; i < 9; i++) { // nålene som stikker opp bak og på sidene
    const a = -1.25 + i * 2.5 / 8, L = (.15 + (i % 3) * .03) * s, x0 = x + Math.sin(a) * .12 * s, y0 = y - .02 * s - Math.cos(a) * .04 * s, x1 = x0 + Math.sin(a) * L, y1 = y0 - Math.cos(a) * L;
    A.line(g, [[x0, y0], [x1, y1]], .014 * s, '#8a8e98'); A.dot(g, x1, y1, .034 * s, INK); A.dot(g, x1, y1, .024 * s, NAALEFARGER[i % 8]); A.dot(g, x1 - .008 * s, y1 - .008 * s, .007 * s, '#ffffff');
  }
  A.cel(g, A.ell(x, y, .27 * s, .13 * s), OLD.pute, { line: '#2a0406', lw: .03, sk: .7 });
  A.flat(g, A.ell(x - .06 * s, y - .05 * s, .12 * s, .04 * s), 'rgba(255,190,190,.35)', 0); // fløyelsglansen
  if (!bak) for (const [dx, dy] of [[-.16, .02], [-.08, .05], [.08, .05], [.16, .02]]) A.curve(g, [x, y], [x + dx * .6 * s, y + dy * .3 * s], [x + dx * s, y + dy * s], .01 * s, OLD.puteM); // knappingen
  A.dot(g, x, y, .022 * s, OLD.puteM);
  for (const [dx, dy, c] of [[-.14, -.02, 0], [.1, -.04, 3], [-.04, .06, 2], [.18, .04, 4], [.02, -.07, 7]]) { A.dot(g, x + dx * s, y + dy * s, .028 * s, INK); A.dot(g, x + dx * s, y + dy * s, .02 * s, NAALEFARGER[c]); } // hoder rett mot oss
};
// kinnskjegg, fra øret og ned
const kinnskjegg = (g, s, cy, x0 = 0) => A.cel(g, A.blob([[x0 + s * .3, cy - .12], [x0 + s * .23, cy - .1], [x0 + s * .19, cy + .08], [x0 + s * .21, cy + .2], [x0 + s * .27, cy + .32], [x0 + s * .36, cy + .24], [x0 + s * .37, cy + .04]]), OLD.har, { sk: .75 });
MONSTER_ART.oldermann = {
  box: { hode: [1.3, 1.5, .65, .12], kropp: [1.3, 1.36, .65, .44] },
  hode: v => g => {
    const S = OLD.hud, H = OLD.har, cy = -.5;
    const ore = (x, s) => { A.cel(g, A.ell(x, cy + .04, .07, .11), S); A.curve(g, [x - s * .01, cy], [x + s * .02, cy + .04], [x - s * .01, cy + .08], .012, '#b88a6a'); };
    if (v === 'b') {
      for (const s of [-1, 1]) ore(s * .31, s);
      A.cel(g, A.ell(0, cy, .3, .36), S);
      A.cel(g, A.blob([[-.3, cy - .02], [-.28, cy + .2], [-.14, cy + .3], [0, cy + .32], [.14, cy + .3], [.28, cy + .2], [.3, cy - .02], [.2, cy + .08], [0, cy + .12], [-.2, cy + .08]]), H, { sk: .75 }); // hestesko av hvitt hår
      for (let i = 0; i < 7; i++) { const x = -.24 + i * .08; A.curve(g, [x, cy + .1 - Math.abs(x) * .3], [x * 1.05 + .02, cy + .18], [x * .95, cy + .28 - Math.abs(x) * .3], .01, OLD.harM); }
      for (const s of [-1, 1]) A.line(g, [[s * .24, cy - .28], [s * .3, cy + .02], [s * .25, cy + .3]], .03, '#4a2a14'); // reima rundt haka
      A.flat(g, A.ell(-.08, cy - .18, .1, .05), 'rgba(255,255,255,.4)', 0);
      naalepute(g, 0, cy - .36, 1, true);
      return;
    }
    if (v === 's') {
      A.cel(g, A.ell(.03, cy, .29, .36), S); ore(-.1, -1);
      kinnskjegg(g, -1, cy, .14);
      A.flat(g, A.ell(-.04, cy - .2, .1, .05), 'rgba(255,255,255,.45)', 0);
      A.cel(g, A.blob([[.08, cy - .12], [.2, cy - .15], [.25, cy - .09], [.14, cy - .08]]), H, { lw: .02, hi: false }); // bryn
      A.dot(g, .19, cy - .02, .022); A.flat(g, A.ell(.2, cy - .02, .06, .06), 'rgba(230,242,250,.5)', .016, '#8a8e98'); // lorgnetten
      A.curve(g, [.2, cy + .04], [.12, cy + .3], [.02, cy + .46], .008, '#a8acb4');
      A.cel(g, A.blob([[.24, cy - .02], [.38, cy + .1], [.36, cy + .18], [.26, cy + .16]]), OLD.nese, { lw: .026 });
      A.cel(g, A.blob([[.34, cy + .16], [.26, cy + .15], [.12, cy + .2], [.06, cy + .34], [.14, cy + .3], [.2, cy + .36], [.28, cy + .3], [.36, cy + .32]]), H, { sk: .75 }); // hvalrossbarten henger
      A.line(g, [[-.06, cy - .28], [-.04, cy], [.02, cy + .32]], .03, '#4a2a14');
      naalepute(g, -.01, cy - .36);
      return;
    }
    for (const s of [-1, 1]) ore(s * .32, s);
    A.cel(g, A.ell(0, cy, .3, .36), S);
    A.flat(g, A.ell(-.1, cy - .2, .1, .05), 'rgba(255,255,255,.45)', 0); // den blanke issen
    for (const s of [-1, 1]) kinnskjegg(g, s, cy);
    // buskete, strenge bryn og små øyne bak lorgnetten
    for (const s of [-1, 1]) {
      A.cel(g, A.blob([[s * .03, cy - .08], [s * .1, cy - .14], [s * .21, cy - .13], [s * .23, cy - .07], [s * .12, cy - .09]]), H, { lw: .02, hi: false });
      A.flat(g, A.ell(s * .11, cy - .02, .045, .025), '#fbf6ea', .016); A.dot(g, s * .11, cy - .015, .018);
      A.flat(g, A.ell(s * .11, cy - .02, .075, .07), 'rgba(230,242,250,.45)', .016, '#8a8e98');
    }
    A.curve(g, [-.04, cy - .03], [0, cy - .06], [.04, cy - .03], .014, '#8a8e98'); A.curve(g, [.18, cy], [.26, cy + .2], [.18, cy + .46], .008, '#a8acb4'); // kjedet ned til frakken
    A.cel(g, A.blob([[-.05, cy + .02], [.05, cy + .02], [.09, cy + .13], [0, cy + .17], [-.09, cy + .13]]), OLD.nese, { lw: .026 }); // rød nese
    // hvalrossbarten, som dekker munnen helt
    A.cel(g, A.blob([[0, cy + .14], [-.1, cy + .12], [-.22, cy + .16], [-.28, cy + .32], [-.2, cy + .28], [-.1, cy + .26], [0, cy + .28], [.1, cy + .26], [.2, cy + .28], [.28, cy + .32], [.22, cy + .16], [.1, cy + .12]]), H, { sk: .75 });
    for (let i = 0; i < 6; i++) { const x = -.2 + i * .08; A.line(g, [[x, cy + .18], [x * 1.1, cy + .27]], .008, OLD.harM); }
    // reima som holder puta, ned langs kinnet og under haka, med en messingspenne
    for (const s of [-1, 1]) A.line(g, [[s * .25, cy - .3], [s * .31, cy - .08]], .03, '#4a2a14');
    A.curve(g, [-.2, cy + .3], [0, cy + .42], [.2, cy + .3], .03, '#4a2a14'); spenne(g, .14, cy + .36, .8);
    naalepute(g, 0, cy - .36);
  },
  kropp: v => g => {
    const top = -.86, F = OLD.frakk, FL = OLD.frakkL;
    // skjerfet på skrå med laugets medaljer: sølvkroker og en liten bjelle
    const skjerf = (a, b, n) => {
      A.line(g, [a, b], .1, INK); A.line(g, [a, b], .07, LAUG.okse);
      for (let i = 0; i < n; i++) { const t = (i + 1) / (n + 1), x = lerp(a[0], b[0], t), y = lerp(a[1], b[1], t); if (i === n - 1) { A.cel(g, A.blob([[x - .03, y + .02], [x - .02, y - .03], [x + .02, y - .03], [x + .03, y + .02]]), LAUG.solv, { lw: .014, hi: false }); A.dot(g, x, y + .03, .01); } else krokMerke(g, x, y, .8); }
    };
    if (v === 'b') {
      A.cel(g, A.blob([[-.36, .4], [-.04, .4], [0, .1], [.04, .4], [.36, .4], [.34, 0], [.33, top + .2], [.24, top + .04], [0, top + .01], [-.24, top + .04], [-.33, top + .2], [-.34, 0]]), F, { line: '#0a080a', sk: .72 });
      A.line(g, [[0, top + .1], [0, .1]], .016, FL);
      for (const s of [-1, 1]) nagle(g, s * .08, -.04, .02);
      A.cel(g, A.rr(-.08, top - .02, .16, .08, .02), OLD.skjorte, { lw: .02, hi: false }); // kragen bak
      larGlans(g, -.2, top + .16, .5); larGlans(g, .2, top + .2, .4, -1);
      return;
    }
    if (v === 's') {
      A.cel(g, A.blob([[-.34, .42], [-.2, .42], [-.14, .1], [-.1, .38], [.22, .38], [.26, 0], [.28, top + .4], [.2, top + .06], [0, top + .01], [-.18, top + .06], [-.22, top + .3], [-.2, 0]]), F, { line: '#0a080a', sk: .72 }); // frakkeskjøtene bak
      A.cel(g, A.blob([[.14, top + .3], [.3, top + .36], [.33, -.06], [.2, -.02]]), OLD.vest, { lw: .022, hi: false }); // en velfødd formann
      A.cel(g, A.poly([[.02, top + .02], [.2, top + .02], [.18, top + .12]]), OLD.skjorte, { lw: .018, hi: false });
      skjerf([-.02, top + .08], [.28, -.1], 2);
      A.curve(g, [.3, top + .5], [.24, top + .56], [.26, top + .62], .01, '#d4b048');
      A.cel(g, A.rr(.08, -.12, .14, .08, .02), '#efe6d0', { lw: .014, hi: false }); // dagsorden i lomma
      larGlans(g, -.12, top + .24, .5);
      return;
    }
    // den lange lærfrakken, åpen foran over vest og skjorte
    A.cel(g, A.blob([[-.38, .4], [-.08, .4], [-.1, 0], [.1, 0], [.08, .4], [.38, .4], [.35, 0], [.34, top + .2], [.25, top + .04], [0, top + .01], [-.25, top + .04], [-.34, top + .2], [-.35, 0]]), F, { line: '#0a080a', sk: .72 });
    A.cel(g, A.blob([[-.13, top + .08], [.13, top + .08], [.16, top + .4], [.15, -.02], [-.15, -.02], [-.16, top + .4]]), OLD.vest, { lw: .022, hi: false });
    A.cel(g, A.poly([[-.07, top + .06], [.07, top + .06], [0, top + .26]]), OLD.skjorte, { lw: .016, hi: false });
    // vingekragen og en sort halsbind
    for (const s of [-1, 1]) A.cel(g, A.poly([[s * .02, top + .02], [s * .13, top - .02], [s * .1, top + .08], [s * .04, top + .07]]), OLD.skjorte, { lw: .018, hi: false });
    A.cel(g, A.blob([[0, top + .08], [-.06, top + .05], [-.05, top + .14], [0, top + .11], [.05, top + .14], [.06, top + .05]]), '#141014', { lw: .018, hi: false });
    for (let i = 0; i < 4; i++) A.dot(g, 0, top + .3 + i * .1, .016, '#8a8e98'); // vestknappene
    A.curve(g, [-.13, top + .52], [0, top + .6], [.12, top + .5], .01, '#d4b048'); // urkjedet
    // slagene på frakken
    for (const s of [-1, 1]) A.cel(g, A.poly([[s * .13, top + .06], [s * .22, top + .1], [s * .17, top + .42], [s * .14, top + .38]]), FL, { line: '#0a080a', lw: .02, hi: false });
    skjerf([.28, top + .08], [-.24, -.02], 4);
    A.cel(g, A.rr(-.3, -.14, .14, .08, .02), '#efe6d0', { lw: .014, hi: false }); A.line(g, [[-.28, -.12], [-.19, -.12]], .006, '#6a5a4a'); // dagsorden i lomma
    for (const s of [-1, 1]) for (let i = 0; i < 2; i++) nagle(g, s * .2, -.2 + i * .16, .016);
    larGlans(g, -.26, top + .2, .5); larGlans(g, .26, top + .2, .5, -1);
  }
};
WEAPON_ART.klubbe = [.6, 1.0, .3, .12];
{ const _dw = drawWeapon; drawWeapon = id => id !== 'klubbe' ? _dw(id) : g => {
  // møteklubba: dreid skaft og et tungt hode med messingbånd
  A.cel(g, A.rr(-.035, -.66, .07, .7, .03), '#6a3a1a', { lw: .026, hi: false });
  A.line(g, [[-.012, -.6], [-.012, -.1]], .01, 'rgba(255,230,200,.35)');
  A.cel(g, A.rr(-.22, -.86, .44, .2, .06), '#7a4a24', { line: '#1a0c04', lw: .03, sk: .7 });
  for (const s of [-1, 1]) { A.line(g, [[s * .13, -.86], [s * .13, -.66]], .03, LAUG.messing); A.cel(g, A.ell(s * .22, -.76, .03, .1), '#5a3218', { lw: .02, hi: false }); }
  A.line(g, [[-.16, -.82], [.1, -.82]], .016, 'rgba(255,230,200,.4)');
}; }
// en knappenål i fart: spissen fram, glasshodet bak
const naalPart = () => Art.part('knappenaal', .24, .7, .12, .35, g => {
  A.line(g, [[0, .2], [0, -.32]], .036, INK); A.line(g, [[0, .2], [0, -.32]], .018, '#d8dce4');
  A.dot(g, 0, .22, .075, INK); A.dot(g, 0, .22, .058, '#c82a3a'); A.dot(g, -.02, .2, .018, '#ffffff');
});

const Oldermann = {
  NAVN: { naal: 'Knappenåler', kjede: 'Kjettinger', klubbe: 'Klubba', votering: 'Votering', eventuelt: 'Eventuelt' },
  /* dagsorden i boblen: det som er gjort, strøket over, det han gjør nå, i rødt. sitat er en linje under */
  boble(e, naa, sitat) {
    const D = e.dagsorden; if (!D) return;
    FX.bubble(e, 'Dagsorden', 3.6); const it = FX.items[FX.items.length - 1]; if (!it || it.target !== e) return;
    const el = it.el, rad = (t, st) => { const d = document.createElement('div'); d.textContent = t; if (st) Object.assign(d.style, st); el.appendChild(d); return d; };
    el.textContent = ''; el.style.textAlign = 'left'; if (!document.body.classList.contains('touch')) el.style.maxWidth = '250px';
    rad('Dagsorden:', { fontWeight: 'bold' });
    D.saker.forEach((k, i) => rad((i + 1) + '. ' + this.navn(D, k, i < naa || i === naa), i < naa ? { textDecoration: 'line-through', opacity: .5 } : i === naa ? { color: '#8a1a1a', fontWeight: 'bold' } : null));
    if (sitat) rad('«' + sitat + '»', { fontStyle: 'italic', marginTop: '2px' });
    return el;
  },
  navn(D, k, vis) { return k === 'eventuelt' && vis && D.ev ? 'Eventuelt: ' + this.NAVN[D.ev].toLowerCase() : this.NAVN[k]; },
  /* bokslag, og så leser han opp. To saker og Eventuelt, tre etter årsmøtet */
  les(e, T, toT) {
    const valg = ['naal', 'kjede', 'klubbe', 'votering'].filter(k => k !== 'votering' || G.time >= (e.voteT || 0)), saker = [];
    while (saker.length < (e.aarsmote ? 3 : 2) && valg.length) saker.push(valg.splice(Math.floor(Math.random() * valg.length), 1)[0]);
    if (saker.includes('votering')) e.voteT = G.time + 20;
    saker.push('eventuelt');
    e.dagsorden = { saker, i: 0, cd: e.aarsmote ? .15 : .35, ev: null, vent: null };
    (e.referat || (e.referat = [])).push({ saker: saker.slice(), utfort: [], t: G.time });
    e.state = 'wind'; e.t = 1.9; e.face = toT; e.positur = { navn: 'lese', t: 0, dur: 1.8 };
    Sound.play('bokslag', .8); this.boble(e, -1, e.referat.length === 1 ? 'Møtet er satt.' : null);
  },
  /* én sak: klubbeslag, boblen, og så saken. Står pasienten feil for saken, venter han litt, men aldri lenger enn 2,5 sekunder */
  sak(e, T, dist, toT) {
    const D = e.dagsorden, k = D.saker[D.i], P = G.player, sikt = los(e.x, e.z, T.x, T.z);
    if (k === 'eventuelt' && !D.ev) D.ev = pick(['naal', 'kjede', 'klubbe']);
    let s = k === 'eventuelt' ? D.ev : k;
    const klar = s === 'naal' ? dist <= 9 && sikt : s === 'kjede' ? dist <= 10 && sikt : s === 'klubbe' ? dist <= 3.4 : true;
    if (!klar && (D.vent === null || G.time - D.vent < 2.5)) { if (D.vent === null) D.vent = G.time; e.cd = .25; return; }
    D.vent = null; const nr = D.i++, ref = e.referat[e.referat.length - 1]; ref.utfort.push(k); if (k === 'eventuelt') ref.ev = D.ev;
    Sound.play('klubbe', .85); e.face = toT;
    let sitat = null;
    if (s === 'votering') {
      const lar = G.enemies.filter(f => f.alive && f.type === 'laerling').length, plass = Math.min(2, 3 - lar, 14 - G.enemies.filter(f => f.alive).length);
      if (plass <= 0) { s = 'klubbe'; sitat = 'Forslaget faller. Til orden!'; } else { sitat = 'Votering! Alle som er for?'; this.votering(e, plass); }
    }
    if (s === 'klubbe' && !sitat) sitat = pick(['Til orden!', 'Orden i salen!', 'Klubba har ordet.']);
    if (s === 'kjede' && !sitat && Math.random() < .5) sitat = pick(['Kroker, takk.', 'Laugets kjettinger, nypusset.']);
    this.boble(e, nr, sitat);
    if (s === 'naal') this.naaler(e, toT); else if (s === 'kjede') this.kjeder(e, T); else if (s === 'klubbe') this.klubba(e);
  },
  /* knappenåler: rektangelet, så tre salver med fem nåler i vifte */
  naaler(e, toT) {
    const tid = .6, o = { x: e.x, z: e.z, a: toT, w: 2.2, len: 8, color: 0x8a5a2a, type: 'fysisk' };
    e.state = 'wind'; e.t = tid + .7; e.positur = { navn: 'kast', t: 0, dur: tid + .1 };
    addTele('rect', o, tid, () => {
      for (let v = 0; v < 3; v++) bossLaterE(e, v * .22, () => {
        if (!e.alive || e.stun > 0 || e.sleep > 0) return;
        for (const da of [-.12, -.06, 0, .06, .12]) this.naal(e, o, o.a + da + rnd(-.015, .015));
        Sound.play('naaler', .7, 1 + v * .08);
      });
    }, e);
  },
  naal(e, o, a) {
    this.skutt = (this.skutt || 0) + 1; // telles, til testene
    const x = o.x + Math.sin(a) * .6, z = o.z + Math.cos(a) * .6, m = propSprite(null, x, z, { P: naalPart(), shadow: false, y: 1.2 });
    const sx = Math.sin(a), sy = -Math.cos(a) * Math.sin(CAM_PITCH); m.userData.m.rotation.z = Math.atan2(-sx, sy); R.dyn.add(m);
    return addProj({ type: 'naal', from: 'enemy', x, z, vx: Math.sin(a) * 14, vz: Math.cos(a) * 14, dmg: e.dmg * .4, life: .56, r: .2, y: 1.2, cause: 'oldermann', mesh: m });
  },
  /* kjettinger: sølvringen der pasienten står, krokene fra mørket, og treffet drar pasienten inn til ham */
  kjeder(e, T) {
    const tid = 1, o = { x: T.x, z: T.z, r: 1.6, color: 0xc8ccd8, type: 'lenke' };
    e.state = 'wind'; e.t = tid + .15; e.positur = { navn: 'ringe', t: 0, dur: tid };
    Sound.play('bjelle', .3, 1.05);
    addTele('circle', o, tid, () => {
      const P = G.player; Sound.play('kjetting', .6, 1.05); R.shake(.15);
      if (!Laug.treff('circle', o, e.dmg * .8, { type: 'oldermann', x: o.x, z: o.z }, .35, 'HEKTET') || !P.alive) return;
      const a = Math.atan2(e.x - P.x, e.z - P.z), d = Math.hypot(e.x - P.x, e.z - P.z); P.kvx = Math.sin(a) * Math.min(15, d * 2.3); P.kvz = Math.cos(a) * Math.min(15, d * 2.3);
    }, e);
    bossLaterE(e, tid - .16, () => { if (e.state === 'wind' && !(e.stun > 0)) Laug.kjeder(o, 4); });
  },
  /* klubba: en ring rundt ham selv */
  klubba(e) {
    const tid = .8, o = { x: e.x, z: e.z, r: 2.6, color: 0x8a5a2a, type: 'fysisk' };
    e.state = 'wind'; e.t = tid + .25; e.raise = true;
    addTele('circle', o, tid, () => {
      e.raise = false; e.positur = { navn: 'klubbeslag', t: 0, dur: .35 }; Sound.play('klubbe', 1, .8); Sound.play('slam', .6, 1.2); R.shake(.35);
      Laug.treff('circle', o, e.dmg * 1.2, { type: 'oldermann', x: e.x, z: e.z, kb: 10 }); puff(e.x, e.z, 5, 1.6);
    }, e);
  },
  /* votering: to lærlinger kommer og sier ja */
  votering(e, n) {
    e.state = 'wind'; e.t = 1.2; e.positur = { navn: 'klubbeslag', t: 0, dur: .4 };
    for (let i = 0; i < n; i++) {
      const s = freeSpot(e.x + rnd(-2, 2), e.z + rnd(-2, 2), 2);
      addTele('circle', { x: s.x, z: s.z, r: .6, color: 0x8a5a2a, type: 'fysisk', stille: true }, .7 + i * .2, () => {
        if (G.enemies.filter(f => f.alive && f.type === 'laerling').length >= 3 || G.enemies.filter(f => f.alive).length >= 14) return;
        const l = spawnEnemy('laerling', s.x, s.z, false, G.depth); l.face = Math.atan2(G.player.x - l.x, G.player.z - l.z); l.positur = { navn: 'bukk', t: 0, dur: .8 };
        FX.bubble(l, pick(['Ja!', 'Ja, Oldermann!', 'For!']), 1.2); Sound.play('bukk', .6);
      }, e);
    }
  },
  /* ved halv helse, én gang: han ringer selv, fire sølvringer rundt pasienten, og klokkeren kommer hvis han ikke er her */
  aarsmote(e) {
    e.aarsmote = true; e.state = 'wind'; e.t = 2.2; e.positur = { navn: 'ringe', t: 0, dur: 1.4 };
    FX.bubble(e, 'Ekstraordinært årsmøte!', 2.2); Sound.play('bjelle', .6, 1.1); R.shake(.2);
    for (let k = 0; k < 4; k++) bossLaterE(e, .15 + k * .3, () => {
      if (!e.alive || e.stun > 0 || e.sleep > 0) return;
      const P = G.player, v = rnd(0, TAU), r = k ? rnd(.8, 2.2) : 0, s = freeSpot(P.x + Math.sin(v) * r, P.z + Math.cos(v) * r, 2), o = { x: s.x, z: s.z, r: 1.3, color: 0xc8ccd8, type: 'lenke' };
      Sound.play('bjelle', .3, 1.2 + k * .08);
      addTele('circle', o, 1, () => { Laug.treff('circle', o, e.dmg * .7, { type: 'oldermann', x: o.x, z: o.z, kb: 2 }, .35, 'HEKTET'); Sound.play('kjetting', .45, 1.2); R.shake(.1); }, e);
      bossLaterE(e, .84, () => { if (e.alive && !(e.stun > 0)) Laug.kjeder(o, 2); });
    });
    if (!G.enemies.some(f => f.alive && f.type === 'klokker') && G.enemies.filter(f => f.alive).length < 14) bossLaterE(e, .6, () => {
      const s = freeSpot(e.x + rnd(-2.5, 2.5), e.z + rnd(-2.5, 2.5), 2), k = spawnEnemy('klokker', s.x, s.z, false, G.depth);
      if (k && k.type === 'klokker') FX.bubble(k, 'Unnskyld, jeg ble holdt igjen.', 1.6);
    });
  }
};
Object.assign(Grotesk.keep, { oldermann: 2.6 });
Object.assign(Grotesk.talk, { oldermann: 1 });
Object.assign(Grotesk.hold, { oldermann: 1 });
Object.assign(Grotesk.ai, {
  oldermann(e, T, dist, toT) {
    if (e.hp < e.max * .5 && !e.aarsmote) { Oldermann.aarsmote(e); e.cd = .4; return; }
    if (!e.dagsorden) { Oldermann.les(e, T, toT); return; }
    Oldermann.sak(e, T, dist, toT);
  }
});
/* mellom sakene: kort pause, og ingen løse replikker som skjuler dagsorden. Når siste sak er gjort, heves møtet */
Object.assign(Grotesk.tick, {
  oldermann(e) {
    const D = e.dagsorden; if (!D || e.state === 'wind') return null;
    if (D.i >= D.saker.length) {
      e.dagsorden = null; e.referat[e.referat.length - 1].ferdig = true; e.cd = rnd(1.6, 2.4);
      FX.bubble(e, pick(['Møtet er hevet.', 'Referatet sendes Journalen.', 'Takk for tålmodigheten. Møtet er hevet.']), 1.6); Sound.play('klubbe', .9); e.positur = { navn: 'klubbeslag', t: 0, dur: .35 };
      return null;
    }
    e.cd = Math.min(e.cd, D.cd); e.speechT = Math.max(e.speechT, 1.5);
    return null;
  }
});

/* ---------- fiendeindeksen ---------- */
FIENDE_REKKE.push('laerling', 'klokker', 'holdning');
Object.assign(FIENDE_INFO, {
  laerling: ['Skinnlaugets yngste, i et lærforkle som knirker. Elsker reimer og nagler og vil vise deg alle. Bukker, slår med reima og spenner deg fast.', 'Bukket er varselet. Gå til siden når han bøyer seg, og slå mens han ber om unnskyldning.'],
  klokker: ['Laugets klokker med sølvbjella. Slår aldri selv, men når bjella ringer, kommer krokene ut av mørket der du står.', 'Gå ut av sølvringen når bjella ringer. Ta ham først, ellers roper han på lærlingen.'],
  holdning: ['Laugets holdningssøster. Snører deg inn med lærreimer så du går sakte og rett, og slår med tommestokken når du kommer nær.', 'Rull deg løs med en gang, snøret ryker når du ruller.'],
  oldermann: ['Oldermannen i Skinnlauget, med nålepute på hodet og klubbe i hånden. Leser opp dagsorden før han slår, og gjør alt i den rekkefølgen han sa.', 'Les dagsorden i boblen. Han følger den alltid, og ved «Votering» kommer lærlingene.']
});
SJEF_REKKE.splice(SJEF_REKKE.indexOf('portier') + 1, 0, 'oldermann');

Object.assign(window, { Laug, Oldermann, MINISJEFER, naalPart, Grotesk, ROLLER, MESTER_TITTEL, DEATH_CAUSES, DEPTH_ENEMIES }); // til testene
