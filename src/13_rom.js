/* ============================================================
   ROM  -  rekvisitter for Kjelleren: Isolat og arkiv (polstret celle, arkivhylle,
   madrass, tvangstrøye, papirhaug). Tegnet i samme 3/4-stil som resten, og
   lagt inn i propArt uten å røre de gamle tegningene.
   ============================================================ */
const PADD = '#e6dcc2', PADDL = '#4a4234', PAPER = '#f4ecd8', PAPERL = '#5a4a36';
const ROM_ART = {
  celle(p) {
    return boxArt('celle', 1.9, 1.4, 1.75, PADD, PADDL, (g, w, tf, ff) => {
      // quiltet polstring: rutemønster med knapper
      g.save(); A.rr(-w / 2, -ff, w, ff, .04)(g); g.clip();
      for (let i = -6; i <= 6; i++) { A.line(g, [[-w / 2 + i * .3, -ff], [-w / 2 + i * .3 + ff * .6, 0]], .018, Col.dark(PADD, .8)); A.line(g, [[w / 2 - i * .3, -ff], [w / 2 - i * .3 - ff * .6, 0]], .018, Col.dark(PADD, .8)); }
      for (let y = -ff + .2; y < -.1; y += .3) for (let x = -w / 2 + .15; x < w / 2; x += .3) A.dot(g, x + ((y * 10) % 2 ? .15 : 0), y, .02, Col.dark(PADD, .6));
      g.restore();
      // dør med kikkeluke og bolter
      A.cel(g, A.rr(-.32, -ff + .12, .64, ff - .14, .04), '#d8ccb0', { line: PADDL, lw: .04, hi: false });
      A.flat(g, A.rr(-.16, -ff + .26, .32, .1, .02), '#15100c', .03, PADDL);
      for (const y of [-ff + .5, -.4]) { A.cel(g, A.rr(.12, y, .2, .08, .02), '#9aa0a6', { line: '#2f3a40', lw: .025, hi: false }); }
      A.flat(g, A.ell(-.2, -.25, .1, .06), 'rgba(120,90,40,.35)', 0);
    });
  },
  arkivhylle(p) {
    const fw = p.fw || 3;
    return boxArt('arkivhylle' + fw, fw * .95, .55, 2.05, P_.wood, P_.woodL, (g, w, tf, ff) => {
      const rng = mulberry32(fw * 71 + 3), cols = ['#e8dcb8', '#c8b890', '#9aa0a6', '#b8a070', '#d8c8a0', '#8a6a4a'];
      for (let row = 0; row < 4; row++) {
        const y0 = -ff + .08 + row * (ff - .12) / 4, hh = (ff - .12) / 4 - .06;
        A.line(g, [[-w / 2 + .04, y0 + hh + .03], [w / 2 - .04, y0 + hh + .03]], .04, P_.woodL);
        for (let x = -w / 2 + .1; x < w / 2 - .12;) {
          const bw = .07 + rng() * .08, lean = rng() < .12 ? .08 : 0;
          g.save(); g.translate(x + bw / 2, y0 + hh); g.rotate(lean); A.cel(g, A.rr(-bw / 2, -hh * (.75 + rng() * .25), bw, hh * (.75 + rng() * .25), .01), cols[Math.floor(rng() * cols.length)], { line: PAPERL, lw: .02, hi: false, soft: false });
          if (rng() < .5) A.flat(g, A.rr(-bw / 3, -hh * .5, bw / 1.5, .05, .005), '#f6f0de', 0); g.restore();
          x += bw + .012;
        }
        if (rng() < .6) { const px = -w / 2 + .2 + rng() * (w - .4); A.cel(g, A.poly([[px, y0 + .02], [px + .22, y0 - .04], [px + .24, y0 + .06], [px + .02, y0 + .1]]), PAPER, { line: PAPERL, lw: .02, hi: false }); }
      }
    });
  },
  madrass(p) {
    return Art.part('prop_madrass', 1.3, .7, .65, .05, g => {
      A.cel(g, A.poly([[-.58, -.02], [.58, -.02], [.46, -.42], [-.46, -.42]]), '#e8e0c8', { line: PADDL, lw: .04, sk: .88 });
      A.cel(g, A.rr(-.6, -.12, 1.2, .12, .03), '#d8ceb0', { line: PADDL, lw: .035, hi: false });
      for (const x of [-.3, 0, .3]) A.line(g, [[x, -.38], [x * 1.2, -.06]], .018, '#b8ae90');
      A.flat(g, A.ell(.14, -.26, .16, .07), 'rgba(150,110,50,.4)', 0); A.flat(g, A.ell(-.26, -.2, .08, .04), 'rgba(120,30,20,.35)', 0);
    });
  },
  tvangstroye(p) {
    return Art.part('prop_tvangstroye', .9, 1.9, .45, .05, g => {
      A.cel(g, A.ell(0, -.05, .26, .08), '#555a60', { line: STEELL, lw: .035 });
      A.line(g, [[0, -.08], [0, -1.62]], .06, STEELL); A.line(g, [[0, -.08], [0, -1.62]], .03, STEEL);
      A.line(g, [[-.2, -1.62], [.2, -1.62]], .05, STEELL);
      // trøya: lange ermer som krysser foran, med stropper og spenner
      A.cel(g, A.blob([[-.3, -1.58], [.3, -1.58], [.36, -1.2], [.3, -.7], [-.3, -.7], [-.36, -1.2]]), '#efe8d4', { line: PADDL, lw: .04, sk: .86 });
      A.cel(g, A.blob([[-.34, -1.3], [.28, -1.02], [.3, -.92], [-.3, -1.16]]), '#e6dcc2', { line: PADDL, lw: .03 });
      A.cel(g, A.blob([[.34, -1.3], [-.28, -1.02], [-.3, -.92], [.3, -1.16]]), '#e6dcc2', { line: PADDL, lw: .03 });
      for (const y of [-1.42, -.84]) { A.line(g, [[-.28, y], [.28, y]], .05, '#8a6a4a'); A.cel(g, A.rr(-.05, y - .04, .1, .08, .01), '#c8ccd0', { lw: .02, hi: false }); }
      A.line(g, [[.3, -.72], [.36, -.36]], .035, '#8a6a4a'); A.line(g, [[-.3, -.72], [-.34, -.4]], .035, '#8a6a4a');
    });
  },
  papirhaug(p) {
    return Art.part('prop_papirhaug', .9, .9, .45, .05, g => {
      const rng = mulberry32(17);
      for (let i = 0; i < 7; i++) { const y = -.06 - i * .08, x = (rng() - .5) * .12, r0 = (rng() - .5) * .2; g.save(); g.translate(x, y); g.rotate(r0); A.cel(g, A.rr(-.32, -.08, .64, .1, .01), i % 3 === 1 ? '#c8b890' : PAPER, { line: PAPERL, lw: .025, hi: false, soft: false }); g.restore(); }
      A.cel(g, A.poly([[-.1, -.62], [.18, -.7], [.22, -.6], [-.04, -.54]]), PAPER, { line: PAPERL, lw: .025 });
      A.flat(g, A.rr(.02, -.66, .12, .06, .01), 'rgba(179,38,30,.7)', 0);
    });
  }
};
{ const _pa = propArt; propArt = function (p) { return ROM_ART[p.k] ? ROM_ART[p.k](p) : _pa(p); }; }
