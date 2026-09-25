/* ============================================================
   UTEFIENDER  -  Parken og Nattskogen (UTVIDELSE.md, trinn 4)
   - Gartneren: stråhatt, bart og pipe. Klipper to ganger med hagesaksa og drar deg inntil med riva.
   - Kråka: kommer i flokk, svever og stuper rett mot deg. Går den i veggen, blir den liggende.
   - Huldra: vakker forfra, en råtten trestamme bakfra, med kuhale. Synger og lokker deg til seg,
     og snur ryggen til når hun slår.
   - Vedkubbemannen: en vedkubbe til hode og lusekofte. Kaster flis i vifte og skaller.
   - Nøkken: ligger under overflaten der du ikke ser ham, kommer opp og drar deg under, og spiller fele.
     Mens han er nede, biter ingenting på ham.
   - Kålhodet: småkål med tenner, som Overgartneren planter.
   - Overgartner Ansgar Hekk (sjef): digre hagesakser, hekker som vokser opp rundt deg, gjødsel som
     stinker og kålhoder med tenner.
   - Den hvite hjorten (sjef): en enorm hvit hjort med et trist menneskeansikt. Stormer, svinger
     geviret, kaller ned rødt månelys og gjemmer seg i tåka med kopier av seg selv.
   Filen ligger etter 32_meny.js og 33_merknader.js i bygget, fordi fiendeindeksen i håndboka må finnes.
   ============================================================ */
Object.assign(Sound.lib, {
  saks: [{ w: 'square', f: 1900, d: .05, pd: .35, v: .1 }, { n: 1, d: .05, f0: 5000, f1: 2500, ft: 'highpass', v: .14 }, { w: 'square', f: 2300, d: .05, pd: .35, v: .09, at: .09 }],
  kra: [{ w: 'sawtooth', f: 560, d: .24, pd: .4, v: .1 }, { n: 1, d: .2, f0: 1900, f1: 900, ft: 'bandpass', v: .1 }],
  vinge: [{ n: 1, d: .16, f0: 380, f1: 900, ft: 'bandpass', v: .12 }],
  flis: [{ n: 1, d: .09, f0: 3200, f1: 1200, ft: 'bandpass', v: .14 }],
  fele: [{ arp: [659, 740, 831, 740, 659, 587, 523], nl: .11, w: 'sawtooth', v: .03 }],
  lokk: [{ arp: [523, 659, 784, 659, 523], nl: .2, w: 'sine', v: .06 }],
  brol: [{ w: 'sawtooth', f: 105, d: 1.5, pd: -.35, v: .12 }, { w: 'sawtooth', f: 158, d: 1.3, pd: -.3, v: .07 }, { n: 1, d: 1.2, f0: 600, f1: 200, ft: 'lowpass', v: .08 }]
});
Object.assign(ENEMIES, {
  gartner: { name: 'Gartneren', hp: 36, speed: 2.6, r: .45, dmg: 11, xp: 12, teeth: [1, 3], bubbleH: 3.0, weapon: 'hagesaks', blood: 0x8a1a14 },
  kraake: { name: 'Kråka', hp: 9, speed: 4.4, r: .32, dmg: 6, xp: 4, teeth: [0, 1], bubbleH: 2.4, pack: 3, skygge: .35, blood: 0x2a1a1a },
  huldra: { name: 'Huldra', hp: 58, speed: 2.1, r: .45, dmg: 13, xp: 16, teeth: [2, 4], bubbleH: 3.1, blood: 0x5a3a1a },
  vedkubbe: { name: 'Vedkubbemannen', hp: 46, speed: 2.3, r: .48, dmg: 12, xp: 14, teeth: [1, 3], bubbleH: 3.1, blood: 0x6a4a2a },
  nokken: { name: 'Nøkken', hp: 52, speed: 3.0, r: .45, dmg: 12, xp: 16, teeth: [2, 4], bubbleH: 2.9, blood: 0x2a4a3a },
  kaalhode: { name: 'Kålhodet', hp: 14, speed: 2.4, r: .34, dmg: 6, xp: 3, teeth: [0, 1], bubbleH: 1.5, blood: 0x4a6a2a }
});
Object.assign(LINES, {
  gartner: ['Ikke tråkk på plenen!', 'Hekken vokser når ingen ser.', 'Jeg har gjødslet deg.', 'Rosene trenger blod. Bare litt.', 'Klipp klipp.', 'Du står i bedet mitt.'],
  kraake: ['KRA!', 'Kra.', 'Blankt!', 'Øyne!', 'KRA KRA!'],
  huldra: ['Kom nærmere.', 'Du har så pene øyne. Kan jeg få dem?', 'Ikke se bak meg.', 'Syng med meg.', 'Skogen er varm om natta.'],
  vedkubbe: ['Knirk.', 'Jeg har kvist i hodet.', 'Fyr i ovnen!', 'Tre er bedre enn deg.', 'Du har splint i øyet.'],
  nokken: ['Spill med meg.', 'Vannet er varmt i kveld.', 'Bli med ned.', 'Fela er stemt i deg.'],
  kaalhode: ['*knask*', 'kål!', 'gnag', 'grønt!']
});
Object.assign(DEATH_CAUSES, {
  gartner: ['Klippet ned til passende høyde.', 'Kompostert.', 'Raket sammen med løvet.'],
  kraake: ['Plukket i stykker av kråker.', 'Kråkene tok øynene først. Så resten.'],
  huldra: ['Fulgte en vakker kvinne inn i skogen.', 'Så henne bakfra. For sent.'],
  vedkubbe: ['Skallet ned av en vedkubbe.', 'Døde av splinter. Mange.'],
  nokken: ['Dratt under av Nøkken.', 'Danset til fela til det ikke var mer igjen.'],
  kaalhode: ['Spist av kål. Det er en første gang for alt.'],
  boss_hekk: ['Klippet til en pen kule.', 'Brukt som gjødsel under rosene.', 'Plantet med hodet ned.'],
  boss_hjort: ['Stanget av noe som gråt mens det gjorde det.', 'Så inn i hjortens ansikt og kjente det igjen.', 'Tråkket ned i rødt månelys.']
});
DEPTH_ENEMIES[1].push('gartner', 'gartner', 'gartner', 'kraake', 'kraake');
DEPTH_ENEMIES[2].push('kraake');
DEPTH_ENEMIES[5].push('huldra', 'huldra', 'vedkubbe', 'vedkubbe', 'nokken', 'nokken', 'kraake');
Object.assign(MESTER_TITTEL, { gartner: 'Gartneren', kraake: 'Kråka', huldra: 'Huldra', vedkubbe: 'Kubben', nokken: 'Nøkken', kaalhode: 'Kålen' });

/* ============================================================
   TEGNINGER
   ============================================================ */
/* ---------- Gartneren: stråhatt, hvit bart, rød nese, pipe og grønt forkle ---------- */
RIG.gartner = { hip: .46, hipW: .15, neck: .74, shW: .3, shY: .64, armW: .14, legW: .13, handR: .09, arm: '#f0ece0', leg: '#5a4430', hand: '#e0b090', shoe: 'stovel', scale: .86, headLag: .8 };
function strahatt(g, cy, v) {
  const H = '#e8c878', L = '#6a4a1a';
  A.cel(g, A.ell(v === 's' ? .04 : 0, cy - .22, v === 's' ? .42 : .46, .09), H, { line: L, lw: .03 });
  A.cel(g, A.rr(v === 's' ? -.16 : -.2, cy - .48, v === 's' ? .36 : .4, .27, .07), H, { line: L, lw: .03 });
  A.line(g, [[v === 's' ? -.16 : -.2, cy - .27], [v === 's' ? .2 : .2, cy - .27]], .045, '#3a6a2a');
  for (let i = 0; i < 5; i++) A.line(g, [[-.16 + i * .08, cy - .44], [-.15 + i * .08, cy - .32]], .012, 'rgba(120,80,20,.5)');
}
MONSTER_ART.gartner = {
  hode: v => g => {
    const cy = -.5, S = '#e8b894';
    if (v === 'b') { A.cel(g, A.ell(0, cy, .28, .32), '#8a7a6a', { sk: .7 }); strahatt(g, cy, 'b'); return; }
    if (v === 's') {
      A.cel(g, A.ell(.03, cy, .27, .32), S); A.dot(g, .15, cy - .03, .025); A.cel(g, A.ell(.29, cy + .05, .07, .06), '#d8806a', { lw: .02, hi: false });
      A.cel(g, A.blob([[.08, cy + .12], [.3, cy + .1], [.38, cy + .22], [.2, cy + .18]]), '#f0ece4', { lw: .02, hi: false }); A.line(g, [[.3, cy + .22], [.44, cy + .3]], .025, '#6a4a2a');
      strahatt(g, cy, 's'); return;
    }
    A.cel(g, A.ell(0, cy, .28, .32), S);
    for (const s of [-1, 1]) { A.dot(g, s * .1, cy - .03, .025); A.line(g, [[s * .04, cy - .1], [s * .16, cy - .12]], .02, '#a8a098'); }
    A.cel(g, A.ell(0, cy + .06, .07, .06), '#d8806a', { lw: .02, hi: false });
    A.cel(g, A.blob([[-.27, cy + .2], [-.12, cy + .1], [0, cy + .14], [.12, cy + .1], [.27, cy + .2], [.12, cy + .18], [0, cy + .2], [-.12, cy + .18]]), '#f0ece4', { lw: .025, hi: false });
    A.line(g, [[.14, cy + .22], [.3, cy + .3]], .025, '#6a4a2a'); A.dot(g, .31, cy + .31, .035, '#4a3020');
    strahatt(g, cy, 'f');
  },
  kropp: v => g => {
    const top = -.72;
    A.cel(g, A.blob([[-.28, 0], [.28, 0], [.26, top + .12], [0, top - .02], [-.26, top + .12]]), '#f0ece0', { sk: .7 });
    if (v !== 'b') {
      A.cel(g, A.blob([[-.22, 0], [.22, 0], [.2, top + .3], [-.2, top + .3]]), '#3a6a3a', { sk: .75 });
      A.flat(g, A.rr(-.1, top + .42, .2, .12, .02), '#2a4a2a', .02); A.line(g, [[-.04, top + .44], [-.04, top + .36]], .02, '#8a8a84');
      for (const s of [-1, 1]) A.line(g, [[s * .19, top + .3], [s * .12, top + .02]], .035, '#3a6a3a');
    } else A.line(g, [[-.2, top + .3], [.2, top + .3]], .03, '#3a6a3a');
  }
};
WEAPON_ART.hagesaks = [.8, 1.5, .4, .12];
WEAPON_ART.storsaks = [1.2, 2.4, .6, .12];
{ const _dw = drawWeapon; drawWeapon = id => id === 'hagesaks' || id === 'storsaks' ? g => {
  const k = id === 'storsaks' ? 1.55 : 1;
  for (const s of [-1, 1]) A.line(g, [[0, 0], [s * .1 * k, -.35 * k]], .1 * k, WOOD);
  A.cel(g, A.ell(0, -.4 * k, .07 * k, .07 * k), '#8a9096', { lw: .025, hi: false });
  for (const s of [-1, 1]) A.cel(g, A.poly([[0, -.42 * k], [s * .1 * k, -.5 * k], [s * .05 * k, -1.2 * k], [-s * .02 * k, -1.25 * k]]), '#c8ccd0', { line: '#2f3a40', lw: .03 });
} : _dw(id); }

/* ---------- Kråka: svart, blank, med ett lyst øye. Svever og slår med vingene ---------- */
const KRA = { f: '#1a1a22', L: '#000000', blank: '#3a3a4a' };
LAGDUKKE.kraake = {
  scale: .7, skygge: .35, sveve: .8,
  deler: [
    { P: () => Art.part('kraake_kropp', 1.4, 1.0, .7, .5, g => {
      A.cel(g, A.blob([[-.55, .05], [-.2, -.18], [.3, -.16], [.52, -.02], [.3, .16], [-.3, .16]]), KRA.f, { line: KRA.L });
      A.cel(g, A.poly([[-.5, .02], [-.72, -.08], [-.74, .12]]), KRA.f, { line: KRA.L, lw: .03 });
      A.cel(g, A.ell(.46, -.12, .15, .13), KRA.f, { line: KRA.L });
      A.cel(g, A.poly([[.58, -.14], [.74, -.08], [.58, -.04]]), '#3a3a30', { line: KRA.L, lw: .02 });
      A.dot(g, .49, -.15, .035, '#e8e0c8'); A.dot(g, .5, -.15, .018, KRA.L);
      A.line(g, [[-.1, -.08], [.2, -.1]], .02, KRA.blank);
      for (const x of [-.06, .08]) A.line(g, [[x, .15], [x + .02, .32]], .025, '#4a4a40');
    }), x: 0, y: .45, z: 0 },
    { P: () => Art.part('kraake_vinge', 1.0, .8, .1, .1, g => { A.cel(g, A.blob([[0, 0], [.3, -.3], [.8, -.5], [.6, -.2], [.4, 0]]), '#22222c', { line: KRA.L, lw: .03 }); for (let i = 0; i < 3; i++) A.line(g, [[.3 + i * .12, -.16 - i * .05], [.62 + i * .06, -.38 - i * .03]], .015, KRA.blank); }),
      x: -.15, y: .5, z: .01, anim: (d, S) => { const f = Math.sin(S.t * (S.speed > 1 ? 22 : 12)); d.m.rotation.z = f * .6 - .1; } }
  ]
};
RIG.kraake = { blob: true, scale: .7 };

/* ---------- Huldra: vakker forfra, råtten stamme bakfra, og kuhale ---------- */
RIG.huldra = { hip: .44, hipW: .15, neck: .8, shW: .25, shY: .7, armW: .1, legW: .09, handR: .075, arm: '#f4f0e6', leg: '#6a1a1a', hand: '#f0d8c0', shoe: 'stovel', scale: .94, headLag: .6 };
MONSTER_ART.huldra = {
  box: { kropp: [1.4, 1.6, .7, .55] },
  hode: v => g => {
    const cy = -.5, S = '#f4dcc4', HAR = '#e8c870';
    if (v === 'b') { // bakfra: en hul, råtten stamme med mose
      A.cel(g, A.ell(0, cy, .3, .36), '#6a5038', { line: '#1a120a' }); A.flat(g, A.ell(0, cy + .05, .16, .22), '#140c06', .02);
      for (let i = 0; i < 4; i++) A.line(g, [[-.24 + i * .16, cy - .3], [-.22 + i * .15, cy + .3]], .02, '#3a2818');
      A.flat(g, A.ell(-.12, cy - .28, .14, .06), '#4a6a2a', 0); A.dot(g, .1, cy + .1, .04, '#c8b870'); return;
    }
    A.cel(g, A.blob([[-.32, cy + .45], [-.34, cy - .1], [-.22, cy - .38], [0, cy - .44], [.22, cy - .38], [.34, cy - .1], [.32, cy + .45]]), HAR, { line: '#6a4a10', lw: .03 });
    if (v === 's') { A.cel(g, A.ell(.06, cy, .24, .3), S); A.dot(g, .18, cy - .02, .025, '#2a4a8a'); A.cel(g, A.ell(.2, cy + .16, .04, .025), '#c8303a', { lw: .015, hi: false }); }
    else {
      A.cel(g, A.ell(0, cy, .25, .31), S);
      for (const s of [-1, 1]) { A.flat(g, A.ell(s * .09, cy - .02, .05, .04), '#fbf8f0', .015); A.dot(g, s * .09, cy - .02, .025, '#2a4a8a'); A.line(g, [[s * .04, cy - .09], [s * .14, cy - .1]], .015, '#8a6a30'); }
      A.cel(g, A.ell(0, cy + .17, .06, .03), '#c8303a', { lw: .015, hi: false }); A.flat(g, A.ell(-.14, cy + .08, .05, .03), 'rgba(230,120,120,.35)', 0); A.flat(g, A.ell(.14, cy + .08, .05, .03), 'rgba(230,120,120,.35)', 0);
    }
    for (let i = 0; i < 6; i++) { const x = -.24 + i * .1; A.dot(g, x, cy - .38 - Math.sin(i) * .03, .045, '#f8f6f0'); A.dot(g, x, cy - .38 - Math.sin(i) * .03, .02, '#e8c848'); } // hvitveiskrans
  },
  kropp: v => g => {
    const top = -.72;
    if (v === 'b') { // en hul stamme fra nakken og ned, med biller og sopp, og kuhalen
      A.cel(g, A.blob([[-.34, .5], [.34, .5], [.28, top + .1], [0, top - .02], [-.28, top + .1]]), '#6a5038', { line: '#1a120a' });
      A.flat(g, A.blob([[-.2, .4], [.2, .4], [.16, top + .25], [-.16, top + .25]]), '#140c06', .02);
      for (const [x, y] of [[-.1, -.2], [.08, .1], [-.04, .3]]) A.flat(g, A.ell(x, y, .04, .025), '#3a5a2a', 0);
      A.cel(g, A.ell(.22, -.1, .08, .05), '#c8a060', { lw: .02, hi: false }); A.cel(g, A.ell(-.24, .2, .06, .04), '#c8a060', { lw: .02, hi: false });
      A.curve(g, [0, .1], [.1, .5], [-.05, .7], .05, '#9a4228'); A.flat(g, A.ell(-.06, .74, .06, .08), '#2a0e06', 0);
      return;
    }
    A.cel(g, A.blob([[-.34, .5], [.34, .5], [.24, top + .12], [0, top - .02], [-.24, top + .12]]), '#b8262a', { sk: .72 });
    A.cel(g, A.poly([[-.2, top + .1], [.2, top + .1], [.16, top + .38], [-.16, top + .38]]), '#1a1a2a', { lw: .025, hi: false });
    for (let i = 0; i < 4; i++) A.line(g, [[-.14 + i * .09, top + .16], [-.12 + i * .09, top + .32]], .02, '#e8c848');
    A.flat(g, A.rr(-.3, .3, .6, .06, .02), '#1a1a2a', .015); for (let i = 0; i < 5; i++) A.dot(g, -.24 + i * .12, .33, .02, '#e8c848');
    A.cel(g, A.poly([[-.1, top + .02], [0, top + .1], [.1, top + .02]]), '#f4f0e6', { lw: .015, hi: false });
    if (v === 's') { A.curve(g, [-.26, .1], [-.5, .3], [-.4, .55], .045, '#9a4228'); A.flat(g, A.ell(-.4, .6, .05, .07), '#2a0e06', 0); }
  }
};

/* ---------- Vedkubbemannen: en bjørkekubbe til hode og lusekofte ---------- */
RIG.vedkubbe = { hip: .5, hipW: .14, neck: .78, shW: .3, shY: .7, armW: .13, legW: .13, handR: .09, arm: '#2a2a30', leg: '#3a3a44', hand: '#c8a888', shoe: 'stovel', scale: .92, headLag: .3 };
MONSTER_ART.vedkubbe = {
  box: { hode: [1.2, 1.4, .6, .1] },
  hode: v => g => {
    const cy = -.6, B = '#e8e2d4';
    A.cel(g, A.rr(-.26, cy - .5, .52, .9, .06), B, { line: '#2a2218' });
    for (let i = 0; i < 6; i++) A.line(g, [[-.2 + (i % 3) * .14, cy - .4 + i * .13], [-.1 + (i % 3) * .14, cy - .38 + i * .13]], .035, '#2a2218');
    A.cel(g, A.ell(0, cy - .5, .26, .07), '#d8b078', { line: '#6a4a2a', lw: .025 }); for (const r of [.06, .12, .18]) A.flat(g, A.ell(0, cy - .5, r, r * .27), null, .012, '#8a5a2a');
    if (v === 'b') return;
    const ox = v === 's' ? .1 : 0;
    for (const s of v === 's' ? [1] : [-1, 1]) { A.flat(g, A.ell(ox + s * .1, cy - .15, .06, .05), '#1a0e06', .02); A.dot(g, ox + s * .1, cy - .15, .02, '#ffb040'); }
    A.line(g, [[ox - .12, cy + .1], [ox - .03, cy + .07], [ox + .04, cy + .12], [ox + .13, cy + .08]], .025, '#1a0e06');
    A.line(g, [[.2, cy - .3], [.36, cy - .42]], .03, '#5a4028'); A.dot(g, .37, cy - .43, .03, '#4a6a2a'); // en kvist med et blad
  },
  kropp: v => g => {
    const top = -.72;
    A.cel(g, A.blob([[-.3, 0], [.3, 0], [.28, top + .12], [0, top - .02], [-.28, top + .12]]), '#2a2a30', { sk: .7 });
    A.flat(g, A.rr(-.28, top + .08, .56, .2, .02), '#e8e4d8', .015);
    for (let i = 0; i < 7; i++) { A.dot(g, -.24 + i * .08, top + .18, .025, '#2a2a30'); if (i % 2) A.dot(g, -.24 + i * .08, top + .12, .018, '#b8262a'); }
    for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) A.dot(g, -.2 + i * .1 + (r % 2) * .05, top + .38 + r * .12, .014, '#e8e4d8');
    if (v !== 'b') for (const y of [top + .34, top + .5]) { A.flat(g, A.rr(-.03, y - .025, .06, .05, .01), '#c8a048', .012); }
  }
};
function flisPart() { return Art.part('flis', .5, .3, .25, .15, g => { A.cel(g, A.poly([[-.2, .03], [-.1, -.06], [.2, -.03], [.12, .06]]), '#d8b078', { line: '#4a3018', lw: .025, hi: false }); }); }

/* ---------- Nøkken: blek og grønn, langt vått hår, store triste øyne, fele ---------- */
RIG.nokken = { hip: .44, hipW: .13, neck: .76, shW: .27, shY: .66, armW: .1, legW: .1, handR: .08, arm: '#9ab8a4', leg: '#3a5a4a', hand: '#aac8b4', shoe: 'stovel', scale: .9, headLag: .5 };
MONSTER_ART.nokken = {
  hode: v => g => {
    const cy = -.5, S = '#b8d4c0', H = '#141a18';
    if (v === 'b') { A.cel(g, A.blob([[-.3, cy + .5], [-.3, cy - .2], [0, cy - .36], [.3, cy - .2], [.3, cy + .5]]), H, { sk: .7 }); return; }
    A.cel(g, A.blob([[-.32, cy + .55], [-.33, cy - .15], [-.18, cy - .38], [0, cy - .42], [.18, cy - .38], [.33, cy - .15], [.32, cy + .55]]), H, { line: '#000000', lw: .03 });
    A.cel(g, A.ell(v === 's' ? .05 : 0, cy, .24, .31), S);
    if (v === 's') { A.flat(g, A.ell(.14, cy - .02, .06, .07), '#f4f8f0', .015); A.dot(g, .15, cy - .01, .03, '#1a2a2a'); A.line(g, [[.1, cy + .17], [.22, cy + .16]], .015, '#3a5a4a'); }
    else {
      for (const s of [-1, 1]) { A.flat(g, A.ell(s * .1, cy - .02, .075, .085), '#f4f8f0', .018); A.dot(g, s * .1, cy - .01, .038, '#1a2a2a'); A.dot(g, s * .1 - .015, cy - .03, .012, '#ffffff'); A.line(g, [[s * .04, cy - .12], [s * .16, cy - .09]], .015, '#2a3a34'); }
      A.curve(g, [-.07, cy + .17], [0, cy + .2], [.07, cy + .17], .015, '#3a5a4a');
    }
    for (const [x, y] of [[-.26, cy + .3], [.27, cy + .42], [-.3, cy + .55]]) A.flat(g, A.ell(x, y, .02, .035), 'rgba(170,210,230,.8)', 0);
  },
  kropp: v => g => {
    const top = -.72;
    A.cel(g, A.blob([[-.26, 0], [.26, 0], [.25, top + .12], [0, top - .02], [-.25, top + .12]]), '#9ab8a4', { sk: .72 });
    for (let i = 0; i < 3; i++) A.curve(g, [-.14, top + .3 + i * .1], [0, top + .34 + i * .1], [.14, top + .3 + i * .1], .015, '#6a8a74');
    A.cel(g, A.blob([[-.26, 0], [.26, 0], [.24, -.18], [-.24, -.18]]), '#3a5a4a', { lw: .025, hi: false });
    if (v === 'b') return;
    // hardingfela over brystet
    A.cel(g, A.blob([[-.08, top + .3], [.08, top + .26], [.14, top + .4], [.1, top + .52], [.16, top + .64], [.04, top + .72], [-.1, top + .66], [-.06, top + .5], [-.12, top + .4]]), '#8a4a1e', { line: '#2a1206', lw: .025 });
    A.line(g, [[.02, top + .3], [.2, top + .02]], .03, '#2a1206'); A.line(g, [[-.24, top + .5], [.3, top + .2]], .015, '#e8e0c8');
  }
};

/* ---------- Kålhodet: et kålhode med en munn full av tenner ---------- */
RIG.kaalhode = { blob: true, scale: .62, tentacles: 0, pulse: 6 };
BLOBS.kaalhode = [1.0, .9, .5, .08, v => g => {
  A.cel(g, A.ell(0, -.34, .4, .34), '#8ab85a', { line: '#2a4a1a' });
  for (const [a, r] of [[-.6, .32], [.4, .3], [2.4, .28], [3.4, .3]]) A.cel(g, A.blob([[0, -.34], [Math.cos(a) * r, -.34 + Math.sin(a) * r * .8], [Math.cos(a + .5) * r * .8, -.34 + Math.sin(a + .5) * r * .7]]), '#a8d070', { line: '#2a4a1a', lw: .025, hi: false });
  for (let i = 0; i < 5; i++) A.curve(g, [0, -.62], [-.3 + i * .15, -.4], [-.34 + i * .17, -.1], .015, '#5a8a3a');
  if (v === 'b') return;
  const ox = v === 's' ? .12 : 0;
  A.cel(g, A.ell(ox, -.2, .2, .1), '#3a0a10', { lw: .025, hi: false }); for (let i = 0; i < 6; i++) A.flat(g, A.poly([[ox - .16 + i * .06, -.27], [ox - .13 + i * .06, -.18], [ox - .1 + i * .06, -.27]]), '#f4efe0', .01);
  A.dot(g, ox - .1, -.44, .035, '#fbf6ea'); A.dot(g, ox - .1, -.44, .017); A.dot(g, ox + .1, -.46, .035, '#fbf6ea'); A.dot(g, ox + .1, -.46, .017);
}];

/* ============================================================
   OPPFØRSEL
   ============================================================ */
Object.assign(Grotesk.keep, { gartner: 1.3, kraake: 3.2, huldra: 1.6, vedkubbe: 5.2, nokken: 1.0, kaalhode: .8 });
Object.assign(Grotesk.retreat, { vedkubbe: 1 });
Object.assign(Grotesk.talk, { gartner: 1, kraake: 1, huldra: 1, vedkubbe: 1, nokken: 1, kaalhode: 1 });
Object.assign(Grotesk.hop, { kaalhode: 1 });
Object.assign(Grotesk.ai, {
  /* to klipp med saksa på nært hold, riva som drar deg inntil på avstand */
  gartner(e, T, dist, toT) {
    if (dist < 2.3) {
      e.state = 'wind'; e.t = .85; e.face = toT; const o = { x: e.x, z: e.z, a: toT, r: 2.2, arc: 1.6, color: 0x6a9a4a };
      const klipp = () => { o.x = e.x; o.z = e.z; hitShape('cone', o, e.dmg * .7, { type: 'gartner', x: e.x, z: e.z, kb: 4 }, 'enemy'); Sound.play('saks'); slashFx(e.x, e.z, o.a, 2.2, 1.6, false, 0xd8e8c8); };
      addTele('cone', o, .45, klipp, e); bossLaterE(e, .6, () => { if (e.stun <= 0) addTele('cone', o, .2, klipp, e); });
      e.cd = rnd(1.6, 2.4); return;
    }
    if (dist < 7 && los(e.x, e.z, T.x, T.z) && Math.random() < .45) {
      e.state = 'wind'; e.t = .9; e.face = toT; const o = { x: e.x, z: e.z, a: toT, w: .9, len: 7, color: 0x8a6a3a };
      if (Math.random() < .5) FX.bubble(e, pick(['Kom hit!', 'Ugress!', 'Du står i bedet mitt.']), 1.2);
      addTele('rect', o, .7, () => {
        const P = G.player; beam(o.x, o.z, o.x + Math.sin(o.a) * o.len, o.z + Math.cos(o.a) * o.len, 0x8a6a3a, .12, .3, 1); Sound.play('chain', .5, 1.5);
        if (!P.alive || !inShape({ shape: 'rect', o }, P.x, P.z, P.r) || hurt(P, e.dmg * .5, { type: 'gartner', x: e.x, z: e.z }) <= 0) return;
        const a = Math.atan2(e.x - P.x, e.z - P.z), d = Math.hypot(e.x - P.x, e.z - P.z); P.kvx = Math.sin(a) * Math.min(11, d * 2); P.kvz = Math.cos(a) * Math.min(11, d * 2); numText(P.x, P.z, 'RAKET', 'crit', 2.2);
      }, e);
      e.cd = rnd(2.2, 3.2);
    }
  },
  /* kråka stuper rett mot deg i en linje */
  kraake(e, T, dist, toT) {
    if (dist < 1.2) { e.state = 'wind'; e.t = .25; e.face = toT; addTele('circle', { x: e.x + Math.sin(toT) * .5, z: e.z + Math.cos(toT) * .5, r: .5, color: 0x3a3a4a }, .22, o => { if (inShape({ shape: 'circle', o }, T.x, T.z, T.r)) hurt(T, e.dmg, { type: 'kraake', x: e.x, z: e.z, kb: 2 }); Sound.play('kra', .5, 1.3); }, e); e.cd = rnd(1, 1.6); return; }
    if (dist < 8.5 && los(e.x, e.z, T.x, T.z)) {
      const len = Math.min(9, dist + 2); e.state = 'wind'; e.t = .6; e.face = toT; Sound.play('kra', .6, rnd(.85, 1.2));
      addTele('rect', { x: e.x, z: e.z, a: toT, w: .7, len, color: 0x3a3a4a }, .55, o => { e.state = 'charge'; e.chargeDir = o.a; e.chargeLeft = len; e.chargeHit = false; Sound.play('vinge'); }, e);
      e.cd = rnd(1.8, 3);
    }
  },
  /* huldra: snur ryggen (stammen) til og slår rundt seg, eller synger og lokker deg nærmere */
  huldra(e, T, dist, toT) {
    const P = G.player;
    if (dist < 2.2) {
      e.state = 'wind'; e.t = .8; e.face = toT + Math.PI; const o = { x: e.x, z: e.z, r: 2.1, color: 0x6a5038 };
      addTele('circle', o, .55, () => { o.x = e.x; o.z = e.z; hitShape('circle', o, e.dmg, { type: 'huldra', x: e.x, z: e.z, kb: 7 }, 'enemy'); Sound.play('bonk', .7, .7); puff(e.x, e.z, 4, 1.2, '#5a4a2a'); }, e);
      e.cd = rnd(1.8, 2.6); return;
    }
    if (dist < 8 && los(e.x, e.z, T.x, T.z) && Math.random() < .55) {
      e.state = 'wind'; e.t = 1.2; e.face = toT; FX.bubble(e, pick(['Kom hit, vennen.', 'Kyr, kyr, kom!', 'Du er så sliten. Hvil her.']), 1.4); Sound.play('lokk');
      const o = { x: P.x, z: P.z, r: 1.6, color: 0xe8a0c0 };
      addTele('circle', o, .9, () => { if (P.alive && inShape({ shape: 'circle', o }, P.x, P.z, P.r)) { e.lokker = 1.8; numText(P.x, P.z, 'LOKKET', 'crit', 2.3); addMorb(4); } }, e);
      e.cd = rnd(3, 4.2);
    }
  },
  /* flis i vifte på avstand, skalle på nært hold */
  vedkubbe(e, T, dist, toT) {
    if (dist < 2.0) {
      e.state = 'wind'; e.t = .85; e.face = toT; const o = { x: e.x + Math.sin(toT) * .8, z: e.z + Math.cos(toT) * .8, r: 1.1, color: 0x8a6a3a };
      addTele('circle', o, .6, () => { hitShape('circle', o, e.dmg * 1.3, { type: 'vedkubbe', x: e.x, z: e.z, kb: 9, stun: .4 }, 'enemy'); Sound.play('bonk', 1, .6); numText(o.x, o.z, 'KNOKK', 'crit', 2.2); puff(o.x, o.z, 3, 1, '#c8a878'); }, e);
      e.cd = rnd(2, 2.8); return;
    }
    if (dist < 10 && los(e.x, e.z, T.x, T.z)) {
      e.state = 'wind'; e.t = .8; e.face = toT; e.positur = { navn: 'kast', t: 0, dur: .7 };
      bossLaterE(e, .45, () => {
        if (e.stun > 0 || e.slip > 0) return; const a0 = Math.atan2(G.player.x - e.x, G.player.z - e.z);
        for (const da of (e.elite || e.mester ? [-.3, -.15, 0, .15, .3] : [-.2, 0, .2])) { const a = a0 + da, m = propSprite(null, e.x, e.z, { P: flisPart(), shadow: false, y: 1.3 }); R.dyn.add(m); addProj({ type: 'flis', from: 'enemy', x: e.x, z: e.z, vx: Math.sin(a) * 10, vz: Math.cos(a) * 10, dmg: e.dmg * .55, life: 1.1, r: .22, y: 1.3, cause: 'vedkubbe', spin: 18, mesh: m }); }
        Sound.play('flis');
      });
      e.cd = rnd(2.2, 3.2);
    }
  },
  /* nøkken: kommer opp og drar deg under, eller spiller fela så tonene river i hodet */
  nokken(e, T, dist, toT) {
    const P = G.player;
    if (e.dukket && dist < 2.8) {
      e.dukket = false; e.opp = 3; e.state = 'wind'; e.t = 1.0; e.face = toT; Sound.play('splash', 1, .6); R.ripple(e.x, e.z); if (Math.random() < .6) FX.bubble(e, pick(LINES.nokken), 1.4);
      const o = { x: T.x, z: T.z, r: 1.2, color: 0x3a6a5a };
      addTele('circle', o, .75, () => { if (P.alive && inShape({ shape: 'circle', o }, P.x, P.z, P.r) && hurt(P, e.dmg, { type: 'nokken', x: e.x, z: e.z }) > 0) { P.stunT = Math.max(P.stunT, .7); addPuddle(P.x, P.z, 'tjern', 1.4, 8); numText(P.x, P.z, 'DRATT UNDER', 'crit', 2.4); } Sound.play('splash', 1, .8); }, e);
      e.cd = rnd(1.6, 2.4); return;
    }
    if (!e.dukket && dist < 8 && los(e.x, e.z, T.x, T.z)) {
      e.state = 'wind'; e.t = 1.1; e.face = toT; Sound.play('fele');
      for (let k = 0; k < 4; k++) bossLaterE(e, .2 + k * .16, () => { if (e.stun > 0) return; const a = Math.atan2(P.x - e.x, P.z - e.z) + rnd(-.2, .2); Items.enemyShot({ x: e.x, z: e.z, type: 'nokken' }, a, e.dmg * .45); });
      e.cd = rnd(2.4, 3.2);
    }
  },
  kaalhode(e, T, dist, toT) {
    if (dist < 1.1) { e.state = 'wind'; e.t = .3; e.face = toT; addTele('circle', { x: e.x + Math.sin(toT) * .5, z: e.z + Math.cos(toT) * .5, r: .55, color: 0x6a9a4a }, .28, o => { if (inShape({ shape: 'circle', o }, T.x, T.z, T.r)) hurt(T, e.dmg, { type: 'kaalhode', x: e.x, z: e.z, kb: 2 }); Sound.play('bitt', .6, 1.1); }, e); e.cd = rnd(.9, 1.4); }
  }
});
Object.assign(Grotesk.tick, {
  /* Vedkubbemannen går til siden når noe står i veien, til han ser deg og kan kaste */
  vedkubbe(e, dt, T) {
    if (e.state !== 'chase' || los(e.x, e.z, T.x, T.z)) return null;
    e.sideSign = e.sideSign || (Math.random() < .5 ? -1 : 1); const a = Math.atan2(T.x - e.x, T.z - e.z) + e.sideSign * 1.2;
    return { x: e.x + Math.sin(a) * 6, z: e.z + Math.cos(a) * 6 };
  },
  /* huldra drar deg mot seg mens hun synger */
  huldra(e, dt) {
    if (!(e.lokker > 0)) return null; e.lokker -= dt; const P = G.player; if (!P.alive) return null;
    const a = Math.atan2(e.x - P.x, e.z - P.z), d = Math.hypot(e.x - P.x, e.z - P.z); if (d > 1.2) { P.kvx += Math.sin(a) * dt * 14; P.kvz += Math.cos(a) * dt * 14; } // omtrent 3,6 i sekundet: løper du unna, kommer du deg sakte løs
    if (Math.random() < dt * 4) Particles.spawn(P.x, 1.6, P.z, 1, 0xf0b0d0, { speed: 1, up: 1, g: 0, life: .6, size: .7 });
    return { x: e.x, z: e.z };
  },
  /* nøkken under vannet: usynlig, bare ringer i overflaten, og han følger etter deg */
  nokken(e, dt, T) {
    if (e.dukket === undefined) { e.dukket = true; e.opp = 0; }
    if (!e.dukket) { e.opp -= dt; e.doll.root.visible = true; if (e.opp <= 0 && e.state === 'chase') { e.dukket = true; Sound.play('splash', .6, .7); R.ripple(e.x, e.z); puff(e.x, e.z, 2, .8, '#6a8a9a'); } return null; }
    e.doll.root.visible = false; e.ringT = (e.ringT || 0) - dt; if (e.ringT <= 0) { e.ringT = .45; R.ripple(e.x, e.z); }
    return { x: T.x, z: T.z };
  }
});
// Nøkken under vannet kan ikke treffes
{ const _h = hurt; hurt = function (e, dmg, src) { if (e && e.kind === 'enemy' && e.type === 'nokken' && e.dukket) return 0; return _h(e, dmg, src); }; }

/* ============================================================
   OVERGARTNER ANSGAR HEKK
   ============================================================ */
SJEF_DATA.hekk = { type: 'hekk', weapon: 'storsaks', name: 'Overgartner Ansgar Hekk', title: 'Førti år i parken', hp: 1000, minion: 'gartner', minions: 2, attacks: ['saks', 'hekkring', 'gjodsel', 'kaal', 'saks', 'gjodsel', 'summon'], puddle: 'mokk', skygge: 1.2 };
RIG.hekk = { hip: .5, hipW: .2, neck: .92, shW: .46, shY: .82, armW: .2, legW: .17, handR: .12, arm: '#f0ece0', leg: '#5a4430', hand: '#e0b090', shoe: 'stovel', scale: 1.45, headLag: .7 };
BOSS_ART.hekk = {
  head: g => {
    const cy = -.5, S = '#e0a888';
    A.cel(g, A.ell(0, cy + .02, .32, .36), S);
    for (const s of [-1, 1]) { A.flat(g, A.ell(s * .12, cy - .04, .07, .05), '#fbf6ea', .02); A.dot(g, s * .12, cy - .03, .03); A.cel(g, A.blob([[s * .03, cy - .12], [s * .2, cy - .2], [s * .24, cy - .13], [s * .06, cy - .08]]), '#e8e4dc', { lw: .02, hi: false }); }
    A.cel(g, A.ell(0, cy + .06, .08, .07), '#c85a4a', { lw: .02, hi: false });
    A.cel(g, A.blob([[-.42, cy + .12], [-.3, cy + .28], [-.12, cy + .16], [0, cy + .2], [.12, cy + .16], [.3, cy + .28], [.42, cy + .12], [.22, cy + .1], [0, cy + .12], [-.22, cy + .1]]), '#f4f0e8', { lw: .03 });
    A.line(g, [[-.14, cy + .3], [.14, cy + .3]], .02, '#6a2a2a');
    A.cel(g, A.ell(0, cy - .26, .6, .11), '#e8c878', { line: '#6a4a1a', lw: .035 }); A.cel(g, A.rr(-.26, cy - .6, .52, .34, .08), '#e8c878', { line: '#6a4a1a', lw: .035 });
    A.line(g, [[-.26, cy - .32], [.26, cy - .32]], .06, '#3a6a2a'); A.dot(g, .2, cy - .34, .06, '#c8262a'); // en rose i hattebåndet
    for (let i = 0; i < 6; i++) A.line(g, [[-.22 + i * .09, cy - .56], [-.21 + i * .09, cy - .4]], .015, 'rgba(120,80,20,.5)');
  },
  body: g => {
    const top = -1.0;
    A.cel(g, A.blob([[-.62, 0], [.62, 0], [.5, top + .5], [.38, top + .06], [0, top], [-.38, top + .06], [-.5, top + .5]]), '#f0ece0', { sk: .75 });
    A.cel(g, A.blob([[-.52, 0], [.52, 0], [.46, top + .42], [-.46, top + .42]]), '#2e5a2e', { sk: .75 });
    for (const s of [-1, 1]) A.line(g, [[s * .44, top + .42], [s * .28, top + .06]], .06, '#2e5a2e');
    A.flat(g, A.rr(-.3, top + .56, .6, .2, .03), '#1e4a1e', .025); for (const x of [-.18, 0, .16]) A.line(g, [[x, top + .56], [x + .02, top + .42]], .03, x ? '#8a8a84' : '#6a4a2a'); // redskap i lomma
    A.flat(g, A.ell(.2, top + .84, .12, .06), 'rgba(90,60,20,.45)', 0); A.flat(g, A.ell(-.26, top + .72, .08, .05), 'rgba(90,60,20,.4)', 0); // gjødselflekker
  }
};
Object.assign(LINES.bossIntro, { hekk: ['Hvem har tråkket på plenen min?', 'Jeg har klippet større hekker enn deg.', 'Alt skal stå rett. Også du.'] });
Object.assign(LINES.monolog, { hekk: ['Førti år har jeg stelt denne parken.', 'Førti år, og ingen har sagt takk.', 'Nå skal jeg klippe deg til, så du passer inn.'] });
Object.assign(LINES.boss, { hekk: ['Klipp!', 'Rett linje!', 'Gjødsel!', 'Luk ugresset!', 'Ingen går på plenen!'] });
Object.assign(BOSS_MOVES, {
  /* digre hagesakser: to klipp foran seg og et langt stikk */
  saks(B, dist, toP, dmg) {
    B.t = B.atkDur = 1.8; FX.bubble(B, pick(['Klipp!', 'Rett linje!', 'Litt av toppen?']), 1.2, 'boss');
    const snipp = (d, r) => bossLater(B, d, () => { const P = G.player, a = Math.atan2(P.x - B.x, P.z - B.z), o = { x: B.x, z: B.z, a, r, arc: 1.5, color: 0xb8c8a8 }; addTele('cone', o, .45, () => { o.x = B.x; o.z = B.z; hitShape('cone', o, dmg, { type: 'boss', x: B.x, z: B.z, kb: 8 }, 'enemy'); slashFx(B.x, B.z, o.a, r, 1.5, false, 0xe8f0e0); Sound.play('saks'); R.shake(.2); }, B); });
    snipp(0, 3.2); snipp(.6, 3.2);
    bossLater(B, 1.1, () => { const P = G.player, a = Math.atan2(P.x - B.x, P.z - B.z), o = { x: B.x, z: B.z, a, w: 1.2, len: 7.5, color: 0xb8c8a8 }; addTele('rect', o, .5, () => { hitShape('rect', o, dmg * 1.1, { type: 'boss', x: B.x, z: B.z, kb: 10 }, 'enemy'); beam(o.x, o.z, o.x + Math.sin(o.a) * o.len, o.z + Math.cos(o.a) * o.len, 0xd8e0d0, .25, .25, 1.2); Sound.play('saks', 1, .7); }, B); });
  },
  /* hekker vokser opp i en ring rundt deg, med to åpninger. De visner etter litt. */
  hekkring(B, dist, toP, dmg) {
    B.t = B.atkDur = 1.6; FX.bubble(B, pick(['Stå stille, så vokser du fast.', 'Hekken er min beste venn.']), 1.6, 'boss');
    const P = G.player, cx = P.x, cz = P.z, F = G.F, W = F.W, gap = Math.random() * TAU;
    const ruter = []; for (let k = 0; k < 20; k++) { const a = k / 20 * TAU; if (Math.abs(angDiff(a, gap)) < .45 || Math.abs(angDiff(a, gap + Math.PI)) < .45) continue; const x = Math.floor(cx + Math.sin(a) * 3.1), z = Math.floor(cz + Math.cos(a) * 3.1), i = z * W + x; if (x < 1 || z < 1 || x >= W - 1 || z >= F.H - 1 || !F.tiles[i] || F.block[i] || ruter.some(r => r.i === i)) continue; ruter.push({ i, x, z }); }
    for (const r of ruter) addTele('circle', { x: r.x + .5, z: r.z + .5, r: .5, color: 0x3a6a2a }, .9, () => {
      if (F !== G.F || G.enemies.some(e => e.alive && Math.floor(e.x) === r.x && Math.floor(e.z) === r.z) || (Math.floor(G.player.x) === r.x && Math.floor(G.player.z) === r.z)) return;
      F.block[r.i] = 1; const g = propSprite(null, r.x + .5, r.z + .7, { P: ROM_ART.busk() }); R.level.add(g); puff(r.x + .5, r.z + .5, 2, .8, '#3a6a2a');
      // hekken visner etter seks sekunder, også om sjefen dør før det (addFx går uavhengig av sjefen og ryddes ved ny etasje)
      addFx(g, 6, (o, p) => { if (p >= 1 && F === G.F) { F.block[r.i] = 0; puff(r.x + .5, r.z + .5, 2, .8, '#6a5a2a'); } });
    }, B);
    Sound.play('splash', .6, .5);
  },
  /* gjødsel i bue: brunt søl som gjør deg treg, og stank som river i øynene */
  gjodsel(B, dist, toP, dmg) {
    B.t = B.atkDur = 1.5; FX.bubble(B, pick(['Gjødsel!', 'Rosene takker deg.', 'Kumøkk. Førsteklasses.']), 1.2, 'boss');
    const P = G.player;
    for (let i = 0; i < 5; i++) bossLater(B, i * .16, () => {
      const a = Math.random() * TAU, d = i ? rnd(1.2, 3) : 0, o = { x: P.x + Math.sin(a) * d, z: P.z + Math.cos(a) * d, r: 1.1, color: 0x6a4a1a };
      addTele('circle', o, .75, () => { hitShape('circle', o, dmg * .5, { type: 'boss', x: o.x, z: o.z, kb: 3 }, 'enemy'); addPuddle(o.x, o.z, 'mokk', 1.3, 14); addRoyk(o.x, o.z, 1.2, 3); Sound.play('splash', .8, .5); }, B);
    });
  },
  /* planter kålhoder med tenner rundt deg */
  kaal(B, dist, toP, dmg) {
    B.t = B.atkDur = 1.4; FX.bubble(B, pick(['Spis grønnsakene dine!', 'Nyttevekster.', 'Så, så, så.']), 1.2, 'boss');
    const P = G.player;
    for (let i = 0; i < 3; i++) { const a = i / 3 * TAU + Math.random(), s = freeSpot(P.x + Math.sin(a) * 2.6, P.z + Math.cos(a) * 2.6, 2); addTele('circle', { x: s.x, z: s.z, r: .7, color: 0x6a9a4a }, .8, () => { if (G.enemies.filter(e => e.alive).length < 14) spawnEnemy('kaalhode', s.x, s.z, false, B.depth); puff(s.x, s.z, 2, .8, '#5a4a2a'); }, B); }
  }
});

/* ============================================================
   DEN HVITE HJORTEN
   ============================================================ */
SJEF_DATA.hjort = { type: 'hjort', weapon: null, name: 'Den hvite hjorten', title: 'Det er ikke meg du er redd for', hp: 1000, minion: 'kraake', minions: 3, attacks: ['storm', 'gevir', 'maane', 'taakekopi', 'storm', 'gevir', 'summon'], puddle: null, r: 1.5, fart: 1.35, skygge: 2.1 };
const HJORT = { pels: '#f2eee6', skygge: '#c8c4bc', L: '#4a4640', hud: '#e8d4c4' };
LAGDUKKE.hjort = {
  scale: 1.4, skygge: 2.1,
  deler: [
    { P: () => Art.part('hjort_kropp', 3.2, 2.4, 1.6, .1, g => {
      A.cel(g, A.blob([[-1.3, -1.1], [-1.0, -1.6], [.3, -1.7], [1.1, -1.55], [1.3, -1.2], [1.1, -.9], [-1.1, -.85]]), HJORT.pels, { line: HJORT.L });
      A.flat(g, A.blob([[-1.0, -1.0], [.9, -1.0], [.8, -.92], [-.9, -.9]]), HJORT.skygge, 0);
      A.cel(g, A.poly([[-1.3, -1.25], [-1.55, -1.4], [-1.42, -1.1]]), '#ffffff', { line: HJORT.L, lw: .03 });
      for (const [x, y] of [[-.4, -1.4], [.3, -1.5], [.7, -1.3]]) A.flat(g, A.ell(x, y, .12, .05), 'rgba(200,190,180,.4)', 0);
    }), x: 0, y: 0, z: 0 },
    { P: () => Art.part('hjort_hode', 2.2, 3.4, 1.1, 1.1, g => {
      // halsen og hodet, med et trist menneskeansikt der snuten skulle vært
      A.cel(g, A.blob([[-.35, .9], [.15, .95], [.35, .2], [.2, -.2], [-.2, -.2], [-.4, .3]]), HJORT.pels, { line: HJORT.L });
      A.cel(g, A.ell(0, -.35, .4, .45), HJORT.pels, { line: HJORT.L });
      A.cel(g, A.ell(.02, -.28, .26, .3), HJORT.hud, { line: '#8a6a5a', lw: .025 });
      for (const s of [-1, 1]) { A.flat(g, A.ell(.02 + s * .09, -.34, .05, .035), '#fbf6ea', .015); A.dot(g, .02 + s * .09, -.33, .02, '#3a3a4a'); A.line(g, [[.02 + s * .04, -.42], [.02 + s * .14, -.39]], .015, '#6a5a50'); A.flat(g, A.ell(.02 + s * .1, -.24, .015, .05), 'rgba(170,210,240,.8)', 0); }
      A.curve(g, [-.06, -.12], [.02, -.16], [.1, -.12], .015, '#6a4a4a');
      for (const s of [-1, 1]) A.cel(g, A.blob([[s * .3, -.62], [s * .55, -.8], [s * .45, -.58]]), HJORT.pels, { line: HJORT.L, lw: .03 });
      for (const [w, c] of [[.04, INK], [0, '#e8dcc0']]) for (const s of [-1, 1]) { A.line(g, [[s * .15, -.72], [s * .3, -1.1], [s * .55, -1.4], [s * .75, -1.8], [s * .8, -2.2]], .07 + w, c); A.line(g, [[s * .3, -1.1], [s * .1, -1.45], [s * .12, -1.75]], .05 + w, c); A.line(g, [[s * .55, -1.4], [s * .95, -1.55]], .05 + w, c); A.line(g, [[s * .75, -1.8], [s * .5, -2.1]], .045 + w, c); }
    }), x: 1.25, y: 1.55, z: .02, anim: (d, S) => { d.m.position.y = 1.55 + Math.sin(S.t * 1.4) * .04 - (S.aapen ? .25 : 0); d.m.rotation.z = (S.aapen ? .3 : 0) + Math.sin(S.t * .9) * .03; } }
  ],
  /* fire bein som går når hjorten går */
  lemmer(dd, S) {
    const fart = Math.min(1, S.speed / 2), f = S.t * (4 + S.speed * 2);
    [[-.95, .95, 0], [-.7, .95, Math.PI], [.75, .95, Math.PI / 2], [1.0, .95, Math.PI * 1.5]].forEach(([x, y, fase], k) => {
      const sv = Math.sin(f + fase) * .35 * fart, fx = x + sv, fy = Math.max(0, Math.cos(f + fase)) * .15 * fart + .04;
      const L = k % 2 ? dd.front : dd.back, z = k % 2 ? .012 : -.015;
      L.add(limb(x, y, fx, fy, .06, 4), .16, INK, z); L.add(limb(x, y, fx, fy, .06, 4), .1, HJORT.pels, z + .001);
      L.circle(fx, fy, .07, '#3a3630', z + .002);
    });
  },
  portrett(g, S, cx, cy, lag) {
    if (lag !== 'bak') return;
    for (const [x, sv] of [[-.95, .1], [-.7, -.1], [.75, .12], [1.0, -.08]]) for (const [w, c] of [[.16, INK], [.1, HJORT.pels]]) { g.beginPath(); g.moveTo(cx + x * S, cy - .95 * S); g.lineTo(cx + (x + sv) * S, cy - .04 * S); g.lineWidth = w * S; g.strokeStyle = c; g.lineCap = 'round'; g.stroke(); }
  }
};
RIG.hjort = { blob: true, scale: 1 };
Object.assign(LINES.bossIntro, { hjort: ['Det er ikke meg du er redd for.', 'Du har sett meg før. I drømmen.', 'Jeg var som deg en gang.'] });
Object.assign(LINES.monolog, { hjort: ['Jeg var en pasient her, som deg.', 'Jeg gikk ut i skogen for å slippe unna.', 'Skogen tok ansiktet mitt og ga meg dette.'] });
Object.assign(LINES.boss, { hjort: ['Løp. Det hjelper ikke, men løp.', 'Jeg husker deg.', 'Det er ikke meg.', '...'] });
Object.assign(BOSS_MOVES, {
  /* stormer mot deg i en rett linje, og blir stående svimmel hvis den treffer veggen */
  storm(B, dist, toP, dmg) {
    B.t = B.atkDur = 2.4; const o = { x: B.x, z: B.z, a: toP, w: 2.4, len: 11, color: 0xe8e4dc }; Sound.play('brol', .8);
    addTele('rect', o, .95, () => { B.storm = { a: o.a, igjen: 11, traff: false }; B.aapen = 1; Sound.play('swingHeavy', 1, .5); }, B);
  },
  /* svinger geviret rundt seg */
  gevir(B, dist, toP, dmg) {
    B.t = B.atkDur = 1.5; B.aapen = 1; const o = { x: B.x, z: B.z, r: 3.8, color: 0xe8dcc0 };
    addTele('circle', o, .85, () => { o.x = B.x; o.z = B.z; hitShape('circle', o, dmg, { type: 'boss', x: B.x, z: B.z, kb: 12 }, 'enemy'); slashFx(B.x, B.z, 0, 3.8, TAU - .01, true, 0xf4f0e8); Sound.play('swingHeavy', 1, .6); R.shake(.35); B.aapen = 0; }, B);
  },
  /* rødt månelys faller ned der du står, flere ganger */
  maane(B, dist, toP, dmg) {
    B.t = B.atkDur = 2.6; FX.bubble(B, pick(['Se opp.', 'Månen er rød i kveld.', 'Det er ikke meg du er redd for.']), 1.8, 'boss'); Sound.play('brol', .6, .8);
    flashLight(B.x, B.z, 9, '#ff2a2a', 2.4, .5);
    for (let i = 0; i < 6; i++) bossLater(B, .2 + i * .3, () => { const P = G.player, a = Math.random() * TAU, d = i % 2 ? rnd(.5, 1.8) : 0, o = { x: P.x + Math.sin(a) * d, z: P.z + Math.cos(a) * d, r: 1.3, color: 0xff3a3a };
      addTele('circle', o, .7, () => { hitShape('circle', o, dmg * .6, { type: 'boss', x: o.x, z: o.z, kb: 3 }, 'enemy'); Particles.spawn(o.x, 4, o.z, 12, 0xff4a4a, { speed: 1.5, up: -7, life: .5, size: 1.1 }); flashLight(o.x, o.z, 2.4, '#ff3a3a', .6, .6); Sound.play('zap', .5, .6); }, B); });
  },
  /* gjemmer seg i tåka, og kopier av hjorten stormer fram av den */
  taakekopi(B, dist, toP, dmg) {
    B.t = B.atkDur = 3.2; FX.bubble(B, 'Hvilken av oss?', 1.6, 'boss'); B.skjultT = 3.2;
    for (let k = 0; k < 10; k++) puff(B.x + rnd(-3, 3), B.z + rnd(-2, 2), 3, 2.2, '#dcdcdc');
    for (let i = 0; i < 3; i++) bossLater(B, .3 + i * .6, () => {
      const P = G.player, a = Math.random() * TAU, s = freeSpot(P.x + Math.sin(a) * 6, P.z + Math.cos(a) * 6, 3), o = { x: s.x, z: s.z, a: Math.atan2(P.x - s.x, P.z - s.z), w: 1.8, len: 9, color: 0xe8e4dc };
      puff(s.x, s.z, 4, 1.6, '#dcdcdc');
      addTele('rect', o, .8, () => { hitShape('rect', o, dmg * .7, { type: 'boss', x: o.x, z: o.z, kb: 10 }, 'enemy'); beam(o.x, o.z, o.x + Math.sin(o.a) * o.len, o.z + Math.cos(o.a) * o.len, 0xf4f0e8, 1.2, .35, .9); for (let k = 0; k < 6; k++) puff(o.x + Math.sin(o.a) * k * 1.5, o.z + Math.cos(o.a) * k * 1.5, 1, 1, '#e8e4dc'); Sound.play('swingHeavy', .8, .6); }, B);
    });
  }
});
SJEF_DATA.hjort.tick = (B, dt) => {
  // halvt borte i tåka
  if (B.skjultT > 0) { B.skjultT -= dt; B.doll.dissolve(B.skjultT > 0 ? .55 : 0); }
  const S0 = B.storm; if (!S0) return;
  const sp = 12, P = G.player, st = sp * dt, wall = moveEnt(B, Math.sin(S0.a) * st, Math.cos(S0.a) * st); S0.igjen -= st;
  if (Math.random() < dt * 20) puff(B.x, B.z, 1, .8, '#dcd8d0');
  if (!S0.traff && P.alive && d2(B.x, B.z, P.x, P.z) < (B.r + P.r + .3) ** 2) { S0.traff = true; hurt(P, bossDmg(B) * 1.15, { type: 'boss', x: B.x, z: B.z, kb: 13 }); }
  if (wall || S0.igjen <= 0) { B.storm = null; B.aapen = 0; if (wall) { B.state = 'stagger'; B.t = 1.8; B.stagger = 1.8; R.shake(.5); Sound.play('bonk', 1, .45); numText(B.x, B.z, 'BONK', 'crit', 4); puff(B.x, B.z, 6, 1.8); } }
};

/* sjefene i puljen, og alt nytt i fiendeindeksen */
SJEF_PULJE.push('hekk', 'hjort');
FIENDE_REKKE.push('gartner', 'kraake', 'kaalhode', 'huldra', 'vedkubbe', 'nokken');
SJEF_REKKE.push('hekk', 'hjort');
Object.assign(FIENDE_INFO, {
  gartner: ['Klipper to ganger med hagesaksa og drar deg inntil med riva.', 'Hold avstand, men ikke i en rett linje fra ham.'],
  kraake: ['Kommer i flokk, svever og stuper rett mot deg.', 'Gå til siden når den legger an. Treffer den veggen, blir den liggende.'],
  kaalhode: ['Kål med tenner. Overgartneren planter dem.', 'Slå dem før de slår deg. De er langsomme.'],
  huldra: ['Vakker forfra. Snur hun seg, er hun en råtten stamme. Synger og lokker deg til seg.', 'Gå ut av ringen før sangen er ferdig.'],
  vedkubbe: ['En vedkubbe til hode. Kaster flis i vifte og skaller på nært hold.', 'Gå rundt ham, ikke rett mot ham.'],
  nokken: ['Ligger under overflaten, der ingenting biter på ham. Kommer opp og drar deg under, og spiller fele.', 'Se etter ringene i vannet. Slå når han er oppe.'],
  hekk: ['Overgartneren. Digre hagesakser, hekker som vokser opp rundt deg, gjødsel og kålhoder med tenner.', 'Finn åpningen i hekken med en gang.'],
  hjort: ['En enorm hvit hjort med et trist menneskeansikt. Stormer, svinger geviret og kaller ned rødt månelys.', 'Få den til å storme i veggen. Det er ikke den du er redd for.']
});
