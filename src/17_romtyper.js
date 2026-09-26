/* ============================================================
   ROMTYPER  -  rom som ser forskjellige ut, inne og ute (UTVIDELSE.md)
   - GULV: hvert rom males med sitt eget gulv (romStil i 03_generator.js velger),
     rute for rute og i verdenskoordinater, så mønstrene går sømløst over rutene.
   - VEGG: veggene får stil etter rommet foran dem. Ute blir veggene hekker,
     smijernsgjerder, steinmurer eller en vegg av trær.
   - Bakken utenfor, trær i mørket, vær, gasslykter og utgangene fra hver etasje.
   - Nye møbler og ting for de nye romtypene (ROM_ART, samme 3/4-stil som resten).
   ============================================================ */

/* deterministisk tall mellom 0 og 1 for en rute (samme rute gir alltid samme svar) */
function hRute(x, z, k = 0) {
  let t = (Math.imul(x | 0, 374761393) + Math.imul(z | 0, 668265263) + Math.imul(k | 0, 1274126177)) | 0;
  t = Math.imul(t ^ (t >>> 13), 1274126177); return ((t ^ (t >>> 16)) >>> 0) / 4294967296;
}
const blandF = (a, b, k) => { const A1 = Col.rgb(a), B1 = Col.rgb(b); return Col.hex(A1[0] + (B1[0] - A1[0]) * k, A1[1] + (B1[1] - A1[1]) * k, A1[2] + (B1[2] - A1[2]) * k); };

/* ---------- gulv: GULV[stil](g, px, py, T, c), c = { x, z, th, rom, kant: { n, s, w, e }, ute } ---------- */
const GULV = {
  tre(g, px, py, T, c) {
    const b3 = T / 3;
    for (let b = 0; b < 3; b++) {
      const row = c.z * 3 + b, len = 2 + Math.floor(hRute(row, 7, 1) * 2), off = hRute(row, 3, 2) * len, seg = Math.floor((c.x + off) / len);
      const base = blandF('#7a5236', '#9a6a44', hRute(row, seg, 3)), y = py + b * b3;
      g.fillStyle = base; g.fillRect(px, y, T + 1, b3 + 1);
      g.strokeStyle = 'rgba(40,24,12,.28)'; g.lineWidth = Math.max(1, T * .025);
      for (let k = 0; k < 2; k++) { const yy = y + b3 * (.3 + k * .35) + (hRute(c.x, row, k) - .5) * 2; g.beginPath(); g.moveTo(px, yy); g.quadraticCurveTo(px + T / 2, yy + (hRute(row, c.x, 9 + k) - .5) * b3 * .5, px + T, yy); g.stroke(); }
      g.fillStyle = 'rgba(30,18,8,.55)'; g.fillRect(px, y + b3 - Math.max(1, T * .035), T + 1, Math.max(1, T * .035));
      const skj = (Math.ceil((c.x + off) / len) * len - off - c.x); if (skj > 0 && skj < 1) g.fillRect(px + skj * T, y, Math.max(1, T * .04), b3);
      if (hRute(c.x, row, 5) < .08) { g.fillStyle = 'rgba(20,12,6,.7)'; g.beginPath(); g.arc(px + T * hRute(c.x, row, 6), y + b3 / 2, T * .025, 0, TAU); g.fill(); }
    }
  },
  teppe(g, px, py, T, c) {
    const rid = c.rom ? c.rom.id : 0, farge = ['#6a2226', '#2c4a3a', '#4a2a4e', '#6a3a1e'][rid % 4], kantF = '#b8963e';
    g.fillStyle = farge; g.fillRect(px, py, T + 1, T + 1);
    g.save(); g.beginPath(); g.rect(px, py, T, T); g.clip();
    g.strokeStyle = Col.dark(farge, .7); g.lineWidth = Math.max(1, T * .05);
    for (let k = -1; k <= 2; k++) { g.beginPath(); g.moveTo(px + k * T / 2, py); g.lineTo(px + (k + 1) * T / 2 + T / 2, py + T); g.stroke(); g.beginPath(); g.moveTo(px + (k + 1) * T / 2 + T / 2, py); g.lineTo(px + k * T / 2, py + T); g.stroke(); }
    g.fillStyle = Col.light(farge, .3); for (const [a, b] of [[.25, .25], [.75, .75], [.25, .75], [.75, .25]]) { g.beginPath(); g.arc(px + a * T, py + b * T, T * .05, 0, TAU); g.fill(); }
    const bw = T * .22; g.fillStyle = kantF;
    if (c.kant.n) g.fillRect(px, py + T * .1, T, bw * .6); if (c.kant.s) g.fillRect(px, py + T * .9 - bw * .6, T, bw * .6);
    if (c.kant.w) g.fillRect(px + T * .1, py, bw * .6, T); if (c.kant.e) g.fillRect(px + T * .9 - bw * .6, py, bw * .6, T);
    if (hRute(c.x, c.z, 4) < .18) { g.fillStyle = 'rgba(40,20,10,.25)'; g.beginPath(); g.ellipse(px + T * .5, py + T * .5, T * .35, T * .22, hRute(c.x, c.z, 5) * 3, 0, TAU); g.fill(); }
    g.restore();
  },
  sekskant(g, px, py, T, c) {
    g.fillStyle = '#8e9894'; g.fillRect(px, py, T + 1, T + 1);
    const s = T / 3.2, hh = s * Math.sqrt(3);
    g.save(); g.beginPath(); g.rect(px, py, T, T); g.clip();
    const X0 = c.x * T, Z0 = c.z * T, i0 = Math.floor(X0 / (s * 1.5)) - 1, i1 = Math.ceil((X0 + T) / (s * 1.5)) + 1;
    for (let i = i0; i <= i1; i++) {
      const cx = i * s * 1.5, oy = (i & 1) ? hh / 2 : 0, j0 = Math.floor((Z0 - oy) / hh) - 1, j1 = Math.ceil((Z0 + T - oy) / hh) + 1;
      for (let j = j0; j <= j1; j++) {
        const cy = j * hh + oy, gx = px + cx - X0, gy = py + cy - Z0, r = hRute(i, j, 11);
        g.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; g.lineTo(gx + Math.cos(a) * s * .92, gy + Math.sin(a) * s * .92); } g.closePath();
        g.fillStyle = r < .08 ? '#9ec4bc' : r < .14 ? '#c8c0a8' : blandF('#e6ebe6', '#d4dcd6', hRute(i, j, 12)); g.fill();
      }
    }
    g.restore();
  },
  linoleum(g, px, py, T, c) {
    const stor = ((Math.floor(c.x / 2) + Math.floor(c.z / 2)) & 1);
    g.fillStyle = stor ? '#a8987a' : '#8a7c64'; g.fillRect(px, py, T + 1, T + 1);
    g.fillStyle = 'rgba(40,30,20,.18)'; for (let k = 0; k < 7; k++) g.fillRect(px + hRute(c.x, c.z, 20 + k) * T, py + hRute(c.z, c.x, 30 + k) * T, Math.max(1, T * .03), Math.max(1, T * .03));
    if (hRute(c.x, c.z, 40) < .2) { g.strokeStyle = 'rgba(30,20,10,.3)'; g.lineWidth = Math.max(1, T * .03); g.beginPath(); const a = hRute(c.x, c.z, 41) * T; g.moveTo(px + a, py + T * .2); g.quadraticCurveTo(px + T * .5, py + T * .5, px + T - a * .5, py + T * .8); g.stroke(); }
    if (c.x % 2 === 0) { g.fillStyle = 'rgba(30,20,10,.35)'; g.fillRect(px, py, Math.max(1, T * .025), T); }
  },
  stein(g, px, py, T, c) {
    g.fillStyle = '#3a352c'; g.fillRect(px, py, T + 1, T + 1);
    const delt = hRute(c.x, c.z, 50), m = T * .04, farge = k => blandF(c.ute ? '#6e6c62' : '#7a7466', c.ute ? '#5a5a50' : '#8e8676', hRute(c.x, c.z, 51 + k));
    const flis = (x0, y0, w, h, k) => { g.fillStyle = farge(k); A.rr(px + x0 + m, py + y0 + m, w - 2 * m, h - 2 * m, T * .08)(g); g.fill(); g.fillStyle = 'rgba(255,250,230,.08)'; g.fillRect(px + x0 + m * 2, py + y0 + m * 2, w * .5, Math.max(1, T * .04)); };
    if (delt < .35) flis(0, 0, T, T, 0);
    else if (delt < .7) { const s = T * (.35 + hRute(c.x, c.z, 52) * .3); flis(0, 0, s, T, 1); flis(s, 0, T - s, T, 2); }
    else { const s = T * (.4 + hRute(c.x, c.z, 53) * .2); flis(0, 0, T, s, 3); flis(0, s, T * .5, T - s, 4); flis(T * .5, s, T * .5, T - s, 5); }
    if ((c.ute || c.th.fukt) && hRute(c.x, c.z, 54) < .3) { g.fillStyle = 'rgba(80,110,50,.55)'; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(px + hRute(c.x, c.z, 55 + k) * T, py + (k % 2 ? 0 : T) + (hRute(c.z, c.x, 60 + k) - .5) * m * 3, T * .05, 0, TAU); g.fill(); } }
  },
  parkett(g, px, py, T, c) {
    const q = T / 2;
    for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) {
      const liggende = ((c.x * 2 + a + c.z * 2 + b) & 1) === 0, x0 = px + a * q, y0 = py + b * q;
      for (let k = 0; k < 3; k++) {
        g.fillStyle = blandF('#8a5a34', '#b07a48', hRute(c.x * 2 + a, c.z * 2 + b, 70 + k));
        if (liggende) g.fillRect(x0, y0 + k * q / 3, q + .5, q / 3 + .5); else g.fillRect(x0 + k * q / 3, y0, q / 3 + .5, q + .5);
      }
      g.strokeStyle = 'rgba(40,22,10,.45)'; g.lineWidth = Math.max(1, T * .02);
      for (let k = 1; k < 3; k++) { g.beginPath(); if (liggende) { g.moveTo(x0, y0 + k * q / 3); g.lineTo(x0 + q, y0 + k * q / 3); } else { g.moveTo(x0 + k * q / 3, y0); g.lineTo(x0 + k * q / 3, y0 + q); } g.stroke(); }
      g.strokeRect(x0, y0, q, q);
    }
    g.fillStyle = 'rgba(255,230,190,.07)'; g.fillRect(px, py, T, T * .1);
  },
  betong(g, px, py, T, c) {
    g.fillStyle = blandF('#86867e', '#76766e', hRute(c.x, c.z, 80)); g.fillRect(px, py, T + 1, T + 1);
    for (let k = 0; k < 3; k++) { g.fillStyle = hRute(c.x, c.z, 81 + k) < .5 ? 'rgba(40,40,30,.12)' : 'rgba(255,255,240,.06)'; g.beginPath(); g.arc(px + hRute(c.x, c.z, 84 + k) * T, py + hRute(c.z, c.x, 87 + k) * T, T * (.15 + hRute(c.x, c.z, 90 + k) * .2), 0, TAU); g.fill(); }
    if (c.x % 3 === 0) { g.fillStyle = 'rgba(30,30,24,.4)'; g.fillRect(px, py, Math.max(1, T * .03), T); }
    if (c.z % 3 === 0) { g.fillStyle = 'rgba(30,30,24,.4)'; g.fillRect(px, py, T, Math.max(1, T * .03)); }
    if (hRute(c.x, c.z, 93) < .15) { g.strokeStyle = 'rgba(30,26,20,.55)'; g.lineWidth = Math.max(1, T * .025); g.beginPath(); let x = px + T * .1, y = py + hRute(c.x, c.z, 94) * T; g.moveTo(x, y); for (let s = 0; s < 4; s++) { x += T * .22; y += (hRute(c.x, c.z, 95 + s) - .5) * T * .3; g.lineTo(x, y); } g.stroke(); }
  },
  fliser(g, px, py, T, c) {
    g.fillStyle = '#9a9a92'; g.fillRect(px, py, T + 1, T + 1);
    const n = 3, s = T / n, m = Math.max(1, T * .025);
    for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) {
      const r = hRute(c.x * n + a, c.z * n + b, 100);
      g.fillStyle = r < .04 ? '#3a342c' : r < .12 ? '#d2cab6' : r < .16 ? '#c4d4d0' : '#e8e6de';
      g.fillRect(px + a * s + m, py + b * s + m, s - 2 * m, s - 2 * m);
      if (r > .96) { g.strokeStyle = 'rgba(40,30,20,.6)'; g.lineWidth = m; g.beginPath(); g.moveTo(px + a * s + m, py + b * s + m); g.lineTo(px + a * s + s - m, py + b * s + s - m); g.stroke(); }
    }
  },
  brostein(g, px, py, T, c) {
    g.fillStyle = '#2e2a24'; g.fillRect(px, py, T + 1, T + 1);
    const rader = 3, rh = T / rader;
    for (let b = 0; b < rader; b++) {
      const row = c.z * rader + b, off = (row & 1) ? .5 : 0, n = 3;
      for (let a = -1; a <= n; a++) {
        const cx = px + (a + off + .5) * T / n, cy = py + (b + .5) * rh, w = T / n * .44, h = rh * .4, r = hRute(c.x * 4 + a, row, 110);
        g.fillStyle = blandF('#7a7266', '#9a9282', r); g.beginPath(); g.ellipse(cx, cy, w, h, 0, 0, TAU); g.fill();
        g.fillStyle = 'rgba(255,250,230,.14)'; g.beginPath(); g.ellipse(cx - w * .25, cy - h * .3, w * .45, h * .3, 0, 0, TAU); g.fill();
      }
    }
    if (c.ute) { g.fillStyle = 'rgba(160,190,220,.12)'; g.fillRect(px, py + T * .6, T, T * .15); }
  },
  gress(g, px, py, T, c) {
    g.fillStyle = blandF('#3a5428', '#46622e', hRute(c.x, c.z, 120)); g.fillRect(px, py, T + 1, T + 1);
    for (let k = 0; k < 3; k++) { g.fillStyle = hRute(c.x, c.z, 121 + k) < .5 ? 'rgba(20,40,10,.3)' : 'rgba(120,160,80,.16)'; g.beginPath(); g.ellipse(px + hRute(c.x, c.z, 124 + k) * T, py + hRute(c.z, c.x, 127 + k) * T, T * .35, T * .22, 0, 0, TAU); g.fill(); }
    g.strokeStyle = 'rgba(140,180,90,.55)'; g.lineWidth = Math.max(1, T * .025);
    for (let k = 0; k < 9; k++) { const x = px + hRute(c.x, c.z, 130 + k) * T, y = py + hRute(c.z, c.x, 140 + k) * T; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (hRute(k, c.x, 150) - .5) * T * .1, y - T * .12); g.stroke(); }
    if (hRute(c.x, c.z, 160) < .12) for (let k = 0; k < 3; k++) { g.fillStyle = k ? '#f4f0e0' : '#e8d05a'; g.beginPath(); g.arc(px + hRute(c.x, c.z, 161 + k) * T, py + hRute(c.z, c.x, 164 + k) * T, T * .035, 0, TAU); g.fill(); }
  },
  grus(g, px, py, T, c) {
    g.fillStyle = blandF('#9a8c70', '#8a7e64', hRute(c.x, c.z, 170)); g.fillRect(px, py, T + 1, T + 1);
    for (let k = 0; k < 16; k++) { const r = hRute(c.x, c.z, 171 + k); g.fillStyle = r < .5 ? 'rgba(50,40,30,.4)' : 'rgba(240,230,210,.45)'; g.beginPath(); g.arc(px + hRute(c.x * 7, c.z, 190 + k) * T, py + hRute(c.z * 7, c.x, 210 + k) * T, T * (.015 + r * .025), 0, TAU); g.fill(); }
    if (hRute(c.x, c.z, 230) < .2) { g.fillStyle = '#6a6254'; g.beginPath(); g.ellipse(px + T * .6, py + T * .4, T * .08, T * .055, .4, 0, TAU); g.fill(); }
  },
  jord(g, px, py, T, c) {
    g.fillStyle = blandF('#4a3a28', '#5a4630', hRute(c.x, c.z, 240)); g.fillRect(px, py, T + 1, T + 1);
    for (let k = 0; k < 8; k++) { g.fillStyle = hRute(c.x, c.z, 241 + k) < .6 ? 'rgba(30,20,10,.45)' : 'rgba(140,110,70,.3)'; g.beginPath(); g.arc(px + hRute(c.x, c.z, 250 + k) * T, py + hRute(c.z, c.x, 260 + k) * T, T * .04, 0, TAU); g.fill(); }
    g.strokeStyle = 'rgba(120,90,50,.4)'; g.lineWidth = Math.max(1, T * .02); g.beginPath(); g.moveTo(px + T * .1, py + T * hRute(c.x, c.z, 270)); g.quadraticCurveTo(px + T * .5, py + T * .5, px + T * .9, py + T * hRute(c.x, c.z, 271)); g.stroke();
  },
  mose(g, px, py, T, c) {
    g.fillStyle = blandF('#2e3a20', '#3a4a26', hRute(c.x, c.z, 280)); g.fillRect(px, py, T + 1, T + 1);
    for (let k = 0; k < 6; k++) { const r = hRute(c.x, c.z, 281 + k); g.fillStyle = r < .4 ? '#4a5e2c' : r < .7 ? '#26301a' : '#5a6a34'; g.beginPath(); g.arc(px + hRute(c.x, c.z, 290 + k) * T, py + hRute(c.z, c.x, 300 + k) * T, T * (.08 + r * .1), 0, TAU); g.fill(); }
    if (hRute(c.x, c.z, 310) < .15) { g.strokeStyle = 'rgba(120,90,60,.6)'; g.lineWidth = Math.max(1, T * .03); g.beginPath(); g.moveTo(px + T * .2, py + T * .8); g.lineTo(px + T * .7, py + T * .3); g.stroke(); }
  },
  myr(g, px, py, T, c) {
    g.fillStyle = blandF('#34331e', '#3e3c22', hRute(c.x, c.z, 320)); g.fillRect(px, py, T + 1, T + 1);
    for (let k = 0; k < 3; k++) { g.fillStyle = 'rgba(16,20,14,.7)'; g.beginPath(); g.ellipse(px + hRute(c.x, c.z, 321 + k) * T, py + hRute(c.z, c.x, 324 + k) * T, T * .22, T * .12, 0, 0, TAU); g.fill(); g.fillStyle = 'rgba(180,200,210,.18)'; g.fillRect(px + hRute(c.x, c.z, 321 + k) * T - T * .1, py + hRute(c.z, c.x, 324 + k) * T - T * .05, T * .12, Math.max(1, T * .025)); }
    g.strokeStyle = 'rgba(150,140,70,.6)'; g.lineWidth = Math.max(1, T * .025);
    for (let k = 0; k < 5; k++) { const x = px + hRute(c.x, c.z, 330 + k) * T, y = py + hRute(c.z, c.x, 340 + k) * T; g.beginPath(); g.moveTo(x, y); g.lineTo(x - T * .05, y - T * .15); g.moveTo(x, y); g.lineTo(x + T * .05, y - T * .13); g.stroke(); }
  },
  is(g, px, py, T, c) {
    g.fillStyle = blandF('#b8d0dc', '#a4c0d0', hRute(c.x, c.z, 350)); g.fillRect(px, py, T + 1, T + 1);
    if (hRute(c.x, c.z, 351) < .35) { g.fillStyle = 'rgba(60,90,120,.3)'; g.beginPath(); g.ellipse(px + T * .5, py + T * .5, T * .4, T * .25, hRute(c.x, c.z, 352) * 3, 0, TAU); g.fill(); }
    g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = Math.max(1, T * .02);
    g.beginPath(); let x = px + hRute(c.x, c.z, 353) * T, y = py; g.moveTo(x, y); for (let s = 0; s < 3; s++) { x += (hRute(c.x, c.z, 354 + s) - .5) * T * .6; y += T / 3; g.lineTo(x, y); } g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = Math.max(1, T * .06); g.beginPath(); g.moveTo(px + T * .15, py + T * .75); g.lineTo(px + T * .45, py + T * .45); g.stroke();
  },
  sti(g, px, py, T, c) {
    g.fillStyle = blandF('#4a3c2a', '#56462e', hRute(c.x, c.z, 360)); g.fillRect(px, py, T + 1, T + 1);
    g.strokeStyle = 'rgba(30,22,12,.55)'; g.lineWidth = Math.max(1, T * .018);
    for (let k = 0; k < 10; k++) { const x = px + hRute(c.x, c.z, 361 + k) * T, y = py + hRute(c.z, c.x, 372 + k) * T, a = hRute(k, c.z, 383) * TAU; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * T * .09, y + Math.sin(a) * T * .09); g.stroke(); }
    g.fillStyle = 'rgba(90,110,60,.35)'; if (hRute(c.x, c.z, 395) < .5) { g.beginPath(); g.arc(px + (hRute(c.x, c.z, 396) < .5 ? 0 : T), py + T * .5, T * .25, 0, TAU); g.fill(); }
  }
};
/* snø ligger på bakken ute når det snør */
function snoPaa(g, px, py, T, c) {
  g.fillStyle = 'rgba(240,244,250,.78)';
  for (let k = 0; k < 4; k++) { g.beginPath(); g.ellipse(px + hRute(c.x, c.z, 400 + k) * T, py + hRute(c.z, c.x, 404 + k) * T, T * (.2 + hRute(c.x, c.z, 408 + k) * .25), T * .14, 0, 0, TAU); g.fill(); }
}

/* ---------- vegger: VEGG[stil] = { h, lav, topp, alfa, tegn(g, w, hp, th, rng) }. Lerretet er 2 enheter bredt og h høyt (128 px per enhet). ---------- */
const VEGG = {
  panel: { h: 2.3 },
  paviljong: { h: 2.3, tegn(g, w, hp, th) {
    g.fillStyle = '#d8d0b8'; g.fillRect(0, 0, w, hp);
    for (let y = 18; y < hp - 20; y += 18) { g.fillStyle = 'rgba(60,50,30,.22)'; g.fillRect(0, y, w, 3); g.fillStyle = 'rgba(255,250,235,.25)'; g.fillRect(0, y + 3, w, 2); }
    g.fillStyle = '#5e7a4a'; g.fillRect(0, hp - 30, w, 30); g.fillStyle = INK; g.fillRect(0, hp - 32, w, 4);
    for (const x of [6, w - 14]) { g.fillStyle = '#efe8d4'; g.fillRect(x, 0, 8, hp - 32); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(x, 0, 8, hp - 32); }
    g.fillStyle = INK; g.fillRect(0, 0, w, 9);
  } },
  tapet: { h: 2.3, tegn(g, w, hp, th, rng) {
    const bunn = blandF(th.wall || '#c8b890', '#a88a6a', .35);
    g.fillStyle = bunn; g.fillRect(0, 0, w, hp);
    for (let x = 0; x < w; x += 32) { g.fillStyle = 'rgba(80,40,30,.14)'; g.fillRect(x, 0, 12, hp); }
    g.fillStyle = 'rgba(90,50,40,.28)';
    for (let y = 30; y < hp * .62; y += 44) for (let x = 16; x < w; x += 32) { g.beginPath(); g.moveTo(x, y - 9); g.quadraticCurveTo(x + 8, y, x, y + 9); g.quadraticCurveTo(x - 8, y, x, y - 9); g.fill(); }
    const pan = hp - 128 * .95; g.fillStyle = th.wains || '#6a5a40'; g.fillRect(0, pan, w, hp - pan);
    g.fillStyle = Col.dark(th.wains || '#6a5a40', .6); g.fillRect(0, pan - 8, w, 8);
    g.strokeStyle = Col.dark(th.wains || '#6a5a40', .7); g.lineWidth = 3; for (let x = 20; x < w; x += 64) g.strokeRect(x, pan + 14, 40, hp - pan - 34);
    g.fillStyle = 'rgba(60,40,20,.3)'; g.beginPath(); g.moveTo(170, 0); g.lineTo(200, 0); g.lineTo(190, 60); g.lineTo(175, 30); g.closePath(); g.fill();
    g.fillStyle = 'rgba(90,70,40,.18)'; g.beginPath(); g.ellipse(60, hp * .35, 30, 44, .1, 0, TAU); g.fill();
    g.fillStyle = INK; g.fillRect(0, 0, w, 9); g.fillRect(0, pan - 2, w, 4); g.fillRect(0, hp - 7, w, 7);
  } },
  fliser: { h: 2.3, tegn(g, w, hp) {
    g.fillStyle = '#b8bab4'; g.fillRect(0, 0, w, hp);
    const s = 21, top = hp * .32;
    g.fillStyle = '#d8d4c4'; g.fillRect(0, 0, w, top);
    for (let y = top; y < hp; y += s) for (let x = 0; x < w; x += s) { const r = hRute(x, y, 7); g.fillStyle = r < .06 ? '#c8d8d4' : r < .1 ? '#d4c8a8' : '#eeece4'; g.fillRect(x + 2, y + 2, s - 4, s - 4); }
    g.fillStyle = 'rgba(120,70,30,.28)'; for (const x of [40, 150, 210]) g.fillRect(x, top, 6, 60 + x % 50);
    g.fillStyle = INK; g.fillRect(0, top - 3, w, 5); g.fillRect(0, 0, w, 9); g.fillRect(0, hp - 7, w, 7);
  } },
  mur: { h: 2.3, tegn(g, w, hp, th) {
    g.fillStyle = '#4a3024'; g.fillRect(0, 0, w, hp);
    const bh = 16, bw = 36;
    for (let r = 0, y = 0; y < hp; r++, y += bh) for (let x = (r & 1) ? -bw / 2 : 0; x < w; x += bw) { const k = hRute(x, r, 3); g.fillStyle = k < .1 ? '#5a3e30' : blandF('#8a4a36', '#a45a40', k); g.fillRect(x + 2, y + 2, bw - 4, bh - 4); g.fillStyle = 'rgba(255,220,190,.1)'; g.fillRect(x + 2, y + 2, bw - 4, 2); }
    g.fillStyle = 'rgba(40,60,30,.35)'; g.fillRect(0, hp - 26, w, 26);
    g.fillStyle = '#2a2420'; g.fillRect(118, 0, 10, hp); g.fillStyle = '#4a4440'; g.fillRect(120, 0, 3, hp);
    g.fillStyle = INK; g.fillRect(0, 0, w, 9); g.fillRect(0, hp - 7, w, 7);
  } },
  stein: { h: 2.3, tegn(g, w, hp) {
    g.fillStyle = '#2e2a26'; g.fillRect(0, 0, w, hp);
    let y = 0; while (y < hp) { const bh = 28 + hRute(y, 1, 2) * 20; let x = -hRute(y, 2, 3) * 30; while (x < w) { const bw = 40 + hRute(x, y, 4) * 40; g.fillStyle = blandF('#6a6660', '#848078', hRute(x, y, 5)); A.rr(x + 3, y + 3, bw - 6, bh - 6, 6)(g); g.fill(); g.fillStyle = 'rgba(255,250,230,.1)'; g.fillRect(x + 6, y + 5, bw * .5, 3); x += bw; } y += bh; }
    g.fillStyle = INK; g.fillRect(0, 0, w, 9); g.fillRect(0, hp - 7, w, 7);
  } },
  polstret: { h: 2.3, tegn(g, w, hp) {
    g.fillStyle = '#e2d8be'; g.fillRect(0, 0, w, hp);
    g.strokeStyle = 'rgba(120,100,70,.45)'; g.lineWidth = 3;
    for (let k = -8; k < 12; k++) { g.beginPath(); g.moveTo(k * 32, 0); g.lineTo(k * 32 + hp, hp); g.stroke(); g.beginPath(); g.moveTo(k * 32 + hp, 0); g.lineTo(k * 32, hp); g.stroke(); }
    g.fillStyle = 'rgba(90,70,50,.6)'; for (let y = 16; y < hp; y += 32) for (let x = (y / 32 & 1) ? 16 : 0; x < w; x += 32) { g.beginPath(); g.arc(x, y, 3, 0, TAU); g.fill(); }
    g.fillStyle = 'rgba(120,80,40,.22)'; g.beginPath(); g.ellipse(90, hp * .6, 26, 36, 0, 0, TAU); g.fill();
    g.fillStyle = INK; g.fillRect(0, 0, w, 9); g.fillRect(0, hp - 7, w, 7);
  } },
  tre: { h: 2.3, tegn(g, w, hp) {
    for (let x = 0; x < w; x += 22) { g.fillStyle = blandF('#6a4a2c', '#86603a', hRute(x, 1, 9)); g.fillRect(x, 0, 22, hp); g.fillStyle = 'rgba(30,18,8,.6)'; g.fillRect(x, 0, 3, hp); g.fillStyle = 'rgba(30,18,8,.35)'; g.beginPath(); g.arc(x + 11, hp * hRute(x, 2, 9), 3, 0, TAU); g.fill(); }
    g.fillStyle = INK; g.fillRect(0, 0, w, 9); g.fillRect(0, hp - 7, w, 7);
  } },
  tommer: { h: 2.3, tegn(g, w, hp) {
    g.fillStyle = '#2a1c10'; g.fillRect(0, 0, w, hp);
    const lh = 30; for (let y = 4; y < hp; y += lh) { const gr = g.createLinearGradient(0, y, 0, y + lh); gr.addColorStop(0, '#8a6440'); gr.addColorStop(.5, '#6e4c2c'); gr.addColorStop(1, '#3e2814'); g.fillStyle = gr; A.rr(0, y + 1, w, lh - 3, 12)(g); g.fill(); g.strokeStyle = 'rgba(30,18,8,.4)'; g.lineWidth = 2; g.beginPath(); g.moveTo(10, y + lh * .45); g.bezierCurveTo(80, y + lh * .3, 160, y + lh * .6, w - 10, y + lh * .4); g.stroke(); }
    g.fillStyle = '#c8b48a'; for (let y = 4 + lh - 3; y < hp; y += lh) g.fillRect(0, y - 2, w, 3);
    g.fillStyle = INK; g.fillRect(0, 0, w, 9); g.fillRect(0, hp - 7, w, 7);
  } },
  glass: { h: 2.3, alfa: true, topp: '#e8ece4', tegn(g, w, hp) {
    g.fillStyle = 'rgba(200,230,220,.28)'; g.fillRect(0, 0, w, hp);
    g.fillStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.moveTo(20, hp); g.lineTo(80, 0); g.lineTo(100, 0); g.lineTo(40, hp); g.closePath(); g.fill();
    g.fillStyle = 'rgba(60,110,50,.5)'; for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(20 + k * 52, hp - 20 - (k % 2) * 16, 22, 30, 0, 0, TAU); g.fill(); }
    g.fillStyle = '#e8ece4'; g.strokeStyle = INK; g.lineWidth = 3;
    for (let x = 0; x <= w; x += 64) { g.fillRect(x - 4, 0, 8, hp); g.strokeRect(x - 4, 0, 8, hp); }
    for (const y of [0, hp * .45, hp - 10]) { g.fillRect(0, y, w, 10); g.strokeRect(0, y, w, 10); }
  } },
  hekk: { h: 1.7, lav: .5, topp: '#1e3016', tegn(g, w, hp) {
    const rng = mulberry32(31);
    g.fillStyle = '#1c2c14'; g.fillRect(0, 10, w, hp - 10);
    for (let k = 0; k < 140; k++) { const x = rng() * w, y = 10 + rng() * (hp - 10), r = 7 + rng() * 10; g.fillStyle = rng() < .5 ? '#2c4420' : rng() < .5 ? '#385a28' : '#1a2a12'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
    for (let k = 0; k < 40; k++) { const x = rng() * w, y = 10 + rng() * (hp * .6); g.fillStyle = 'rgba(150,190,110,.35)'; g.beginPath(); g.arc(x, y, 3 + rng() * 3, 0, TAU); g.fill(); }
    const gr = g.createLinearGradient(0, hp * .55, 0, hp); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(8,14,6,.6)'); g.fillStyle = gr; g.fillRect(0, hp * .55, w, hp * .45);
    g.fillStyle = INK; for (let x = 0; x < w; x += 16) { g.beginPath(); g.arc(x + 8, 10, 9, Math.PI, 0); g.fill(); } g.fillRect(0, hp - 7, w, 7);
  } },
  gjerde: { h: 1.6, lav: .5, topp: null, alfa: true, tegn(g, w, hp) {
    g.clearRect(0, 0, w, hp);
    const sokkel = 36; g.fillStyle = '#6a665e'; g.fillRect(0, hp - sokkel, w, sokkel); g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(0, hp - sokkel, w, sokkel);
    g.fillStyle = '#16161a';
    for (let x = 8; x < w; x += 21) { g.fillRect(x, 16, 6, hp - sokkel - 16); g.beginPath(); g.moveTo(x - 4, 18); g.lineTo(x + 3, 2); g.lineTo(x + 10, 18); g.closePath(); g.fill(); }
    for (const y of [26, hp - sokkel - 20]) g.fillRect(0, y, w, 6);
    g.strokeStyle = 'rgba(200,210,230,.35)'; g.lineWidth = 2; for (let x = 9; x < w; x += 21) { g.beginPath(); g.moveTo(x, 20); g.lineTo(x, hp - sokkel - 4); g.stroke(); }
  } },
  steinmur: { h: 1.2, lav: .5, topp: '#4a5040', tegn(g, w, hp) {
    g.fillStyle = '#2a2824'; g.fillRect(0, 0, w, hp);
    let y = 8; while (y < hp) { const bh = 20 + hRute(y, 3, 1) * 14; let x = -hRute(y, 4, 2) * 24; while (x < w) { const bw = 30 + hRute(x, y, 6) * 36; g.fillStyle = blandF('#6e6a60', '#8a8676', hRute(x, y, 7)); A.rr(x + 3, y + 3, bw - 6, bh - 6, 8)(g); g.fill(); x += bw; } y += bh; }
    g.fillStyle = '#3e5a28'; for (let x = 0; x < w; x += 12) { g.beginPath(); g.arc(x + 6, 10, 6 + hRute(x, 1, 9) * 5, 0, TAU); g.fill(); }
    g.fillStyle = INK; g.fillRect(0, 0, w, 6); g.fillRect(0, hp - 7, w, 7);
  } },
  skog: { h: 2.8, lav: .6, topp: '#0a120a', tegn(g, w, hp) {
    const rng = mulberry32(77);
    g.fillStyle = '#060a08'; g.fillRect(0, 0, w, hp);
    for (let k = 0; k < 9; k++) { const x = rng() * w, bw = 10 + rng() * 14, bjork = rng() < .45; g.fillStyle = bjork ? '#d8d4c8' : '#2a2018'; g.fillRect(x, 0, bw, hp); if (bjork) { g.fillStyle = '#1a1612'; for (let y = 10; y < hp; y += 14 + rng() * 20) g.fillRect(x + rng() * bw * .5, y, bw * (.3 + rng() * .5), 3); } g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(x, 0, bw, hp); }
    for (let k = 0; k < 60; k++) { g.fillStyle = rng() < .5 ? '#10200e' : '#1a3014'; g.beginPath(); g.arc(rng() * w, rng() * hp * .45, 10 + rng() * 16, 0, TAU); g.fill(); }
    const gr = g.createLinearGradient(0, hp * .5, 0, hp); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = gr; g.fillRect(0, hp * .5, w, hp * .5);
    g.fillStyle = INK; g.fillRect(0, hp - 7, w, 7);
  } },
  ruin: { h: 1.1, lav: .45, topp: '#5a584e', alfa: true, tegn(g, w, hp) {
    g.clearRect(0, 0, w, hp);
    g.beginPath(); g.moveTo(0, hp); let x = 0; while (x < w) { g.lineTo(x, 8 + hRute(x, 1, 3) * hp * .55); x += 18 + hRute(x, 2, 4) * 20; } g.lineTo(w, 20); g.lineTo(w, hp); g.closePath(); g.save(); g.clip();
    g.fillStyle = '#2e2c28'; g.fillRect(0, 0, w, hp);
    for (let y = 0; y < hp; y += 22) for (let xx = (y / 22 & 1) ? -14 : 0; xx < w; xx += 32) { g.fillStyle = blandF('#6a665c', '#807a6c', hRute(xx, y, 5)); g.fillRect(xx + 2, y + 2, 28, 18); }
    g.fillStyle = 'rgba(60,90,40,.5)'; for (let k = 0; k < 8; k++) { g.beginPath(); g.arc(hRute(k, 3, 6) * w, hp * .3 + hRute(k, 4, 7) * hp * .4, 8, 0, TAU); g.fill(); }
    g.restore(); g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); x = 0; g.moveTo(0, 8 + hRute(0, 1, 3) * hp * .55); while (x < w) { g.lineTo(x, 8 + hRute(x, 1, 3) * hp * .55); x += 18 + hRute(x, 2, 4) * 20; } g.lineTo(w, 20); g.stroke();
  } }
};

/* ============================================================
   NYE TING. Tegnet som de andre møblene: 3/4 ovenfra, festet i forkant.
   Nøklene er prop_<navn>, så ChatGPT kan levere bilder med samme navn.
   ============================================================ */
const JERN = '#26262a', MESS = '#c8a048', MESSL = '#5a4410', HVIT = '#f0ece0', HVITL = '#3a3a36';
/* bord på bein: plate sett ovenfra, forkant og to synlige bein */
function bordArt(key, w, d, hgt, col, line, pynt) {
  const tf = d * SINP, ff = hgt * COSP;
  return Art.part(key, w + .3, tf + ff + .4, (w + .3) / 2, .08, g => {
    for (const x of [-w / 2 + .1, w / 2 - .18]) A.cel(g, A.rr(x, -ff + .06, .08, ff - .06, .02), Col.dark(col, .8), { line, lw: .035, hi: false });
    A.cel(g, A.rr(-w / 2, -ff - tf, w, tf, .05), Col.light(col, .12), { line, lw: .045 });
    A.cel(g, A.rr(-w / 2, -ff, w, .1, .02), Col.dark(col, .85), { line, lw: .04, hi: false });
    if (pynt) pynt(g, w, tf, ff);
  });
}
const FLATE_TING = { grav: 1, vak: 1, teppe: 1, kloakk: 1, kullsjakt: 1 };
Object.assign(ROM_ART, {
  // ---------- inne ----------
  langbord() { return bordArt('prop_langbord', 3.8, .9, .78, WOOD, WOODL, (g, w, tf, ff) => { const top = -ff - tf; for (let i = 0; i < 4; i++) { const x = -w / 2 + .5 + i * .95; A.flat(g, A.ell(x, top + tf * .5, .2, .1), HVIT, .025, HVITL); A.flat(g, A.ell(x, top + tf * .5, .1, .05), i % 2 ? '#8a6a3a' : '#9aa060', 0); } A.flat(g, A.rr(-.08, top + .05, .16, tf * .5, .04), '#e8dcc0', .025); A.dot(g, 0, top + .02, .05, '#ffcc66'); }); },
  grammofon() { return Art.part('prop_grammofon', 1.1, 1.9, .55, .05, g => { A.cel(g, A.rr(-.32, -.6, .64, .6, .05), '#6a3a1e', { line: '#2a1408' }); A.cel(g, A.rr(-.36, -.72, .72, .14, .04), '#8a5a34', { line: '#2a1408' }); A.line(g, [[.1, -.72], [.2, -1.1], [.05, -1.3]], .05, MESSL); A.cel(g, A.poly([[.05, -1.3], [-.4, -1.85], [.45, -1.8]]), MESS, { line: MESSL }); A.flat(g, A.ell(.02, -1.82, .43, .1), '#e8c878', .035, MESSL); A.flat(g, A.ell(-.05, -.78, .26, .06), '#1a1410', .02); }); },
  piano() { return boxArt('prop_piano', 1.9, .7, 1.45, '#2a1c14', '#0a0604', (g, w, tf, ff) => { A.flat(g, A.rr(-w / 2 + .1, -ff * .55, w - .2, .16, .02), '#f4f0e0', .025); for (let i = 0; i < 14; i++) A.flat(g, A.rr(-w / 2 + .14 + i * (w - .28) / 14, -ff * .55, .05, .09, .01), '#141010', 0); A.flat(g, A.rr(-.5, -ff * .92, .3, .2, .02), '#e8dcc0', .02); A.dot(g, .4, -ff * .9, .05, '#ffcc66'); A.dot(g, -.7, -ff * .9, .05, '#ffcc66'); }); },
  lenestol() { return Art.part('prop_lenestol', 1.1, 1.3, .55, .05, g => { A.cel(g, A.rr(-.42, -1.2, .84, .7, .2), '#6a2a3a', { line: '#2a0a14' }); A.cel(g, A.rr(-.46, -.62, .92, .42, .1), '#7a3446', { line: '#2a0a14' }); for (const x of [-.48, .3]) A.cel(g, A.rr(x, -.78, .18, .52, .08), '#5a2030', { line: '#2a0a14' }); for (const x of [-.36, .28]) A.flat(g, A.rr(x, -.2, .08, .2, .02), '#2a1408', .03); A.flat(g, A.ell(.1, -.95, .12, .08), 'rgba(40,20,20,.35)', 0); }); },
  kortbord() { return bordArt('prop_kortbord', 1.1, 1.0, .7, '#2e5a3a', '#0e2014', (g, w, tf, ff) => { const top = -ff - tf; for (let i = 0; i < 5; i++) { g.save(); g.translate(-.3 + i * .15, top + tf * .5); g.rotate(-.4 + i * .2); A.flat(g, A.rr(-.07, -.1, .14, .2, .02), HVIT, .02); A.dot(g, 0, 0, .025, i % 2 ? '#b3261e' : INK); g.restore(); } }); },
  elektrostol() { return Art.part('prop_elektrostol', 1.1, 1.9, .55, .05, g => { A.cel(g, A.rr(-.38, -1.5, .76, 1.0, .06), '#5a4a3a', { line: '#1a120a' }); A.cel(g, A.rr(-.42, -.62, .84, .3, .05), '#6a5a48', { line: '#1a120a' }); for (const x of [-.4, .32]) A.flat(g, A.rr(x, -.32, .08, .32, .02), '#2a1a10', .03); for (const x of [-.44, .36]) A.cel(g, A.rr(x, -.9, .1, .5, .03), '#4a3a2a', { line: '#1a120a', hi: false }); A.flat(g, A.rr(-.28, -1.82, .56, .3, .1), '#8a8a90', .04); A.line(g, [[.28, -1.7], [.5, -1.6], [.52, -.9]], .03, '#b3261e'); A.line(g, [[-.28, -1.7], [-.5, -1.4]], .03, JERN); for (const x of [-.4, .4]) A.flat(g, A.rr(x - .08, -.72, .16, .06, .02), '#3a2a1a', .02); }); },
  spole() { return Art.part('prop_spole', 1.0, 2.4, .5, .05, g => { A.cel(g, A.rr(-.32, -.35, .64, .35, .05), '#3a3a40', { line: JERN }); A.cel(g, A.rr(-.14, -1.7, .28, 1.4, .06), '#b87a3a', { line: '#4a2a10' }); for (let y = -1.6; y < -.4; y += .1) A.line(g, [[-.14, y], [.14, y + .04]], .018, '#6a3a14'); A.flat(g, A.ell(0, -1.9, .3, .2), '#c8ccd4', .04, JERN); A.line(g, [[.2, -2.0], [.35, -2.15], [.3, -2.25]], .025, '#9ad8ff'); A.line(g, [[-.2, -1.95], [-.4, -2.1]], .025, '#9ad8ff'); }); },
  tannlegestol() { return Art.part('prop_tannlegestol', 1.3, 1.9, .65, .05, g => { A.cel(g, A.rr(-.08, -.5, .16, .5, .03), STEEL, { line: STEELL, hi: false }); A.cel(g, A.rr(-.3, -.12, .6, .12, .04), STEEL, { line: STEELL }); A.cel(g, A.poly([[-.45, -.55], [.4, -.55], [.36, -.8], [-.4, -.8]]), '#3a7a6a', { line: '#10302a' }); A.cel(g, A.poly([[.3, -.8], [.42, -1.45], [.2, -1.5], [.12, -.8]]), '#3a7a6a', { line: '#10302a' }); A.flat(g, A.ell(.34, -1.55, .12, .09), '#2a5a4e', .03); A.line(g, [[-.5, -.9], [-.55, -1.6], [-.2, -1.75]], .04, STEELL); A.flat(g, A.ell(-.2, -1.75, .14, .1), '#e8ecf0', .03, STEELL); A.dot(g, -.2, -1.75, .05, '#fff6c0'); }); },
  instrumentbord() { return Art.part('prop_instrumentbord', .9, 1.3, .45, .05, g => { A.line(g, [[0, 0], [0, -.8]], .05, STEELL); A.flat(g, A.ell(0, -.02, .25, .07), STEEL, .03, STEELL); A.cel(g, A.rr(-.36, -.95, .72, .18, .03), STEEL, { line: STEELL }); for (let i = 0; i < 5; i++) A.line(g, [[-.26 + i * .12, -.96], [-.22 + i * .12, -1.12]], .03, i % 2 ? '#e8ecf0' : '#8a9298'); A.dot(g, .24, -1.02, .04, '#f4f0c0'); }); },
  spyttkum() { return Art.part('prop_spyttkum', .6, .9, .3, .05, g => { A.line(g, [[0, 0], [0, -.5]], .05, STEELL); A.flat(g, A.ell(0, -.02, .18, .05), STEEL, .03, STEELL); A.cel(g, A.poly([[-.24, -.5], [.24, -.5], [.16, -.7], [-.16, -.7]]), '#e8ecec', { line: STEELL }); A.flat(g, A.ell(0, -.7, .16, .05), '#9aa040', .02); A.dot(g, .05, -.7, .03, '#6a0a0a'); }); },
  tannglass() { return Art.part('prop_tannglass', .5, .7, .25, .05, g => { A.flat(g, A.rr(-.14, -.5, .28, .5, .05), 'rgba(200,230,230,.55)', .03, '#4a6a6a'); for (let i = 0; i < 9; i++) A.flat(g, A.ell(-.08 + (i % 3) * .08, -.08 - Math.floor(i / 3) * .1, .035, .045), i === 4 ? MESS : '#f4f0d8', .012); A.flat(g, A.rr(-.16, -.56, .32, .07, .02), '#8a6a3a', .02); }); },
  rontgen() { return boxArt('prop_rontgen', 1.8, .8, 1.3, '#8a9a9a', '#2a3a3a', (g, w, tf, ff) => { A.flat(g, A.rr(-w / 2 + .15, -ff + .1, w * .45, ff * .6, .03), '#1a2a20', .03); for (let i = 0; i < 4; i++) A.line(g, [[-w / 2 + .25, -ff + .2 + i * .1], [-w / 2 + .6, -ff + .2 + i * .1]], .02, '#9aff9a'); A.dot(g, w / 2 - .3, -ff + .25, .06, '#ff5a3a'); A.line(g, [[w / 2 - .2, -ff - tf], [w / 2 - .2, -ff - tf - .6], [0, -ff - tf - .7]], .06, '#5a6a6a'); A.flat(g, A.rr(-.2, -ff - tf - .82, .4, .22, .05), '#6a7a7a', .035); }); },
  lysskjerm() { return Art.part('prop_lysskjerm', 1.1, 1.8, .55, .05, g => { A.line(g, [[-.3, 0], [-.3, -1.0]], .05, STEELL); A.line(g, [[.3, 0], [.3, -1.0]], .05, STEELL); A.cel(g, A.rr(-.45, -1.7, .9, .75, .04), '#e8f0f4', { line: STEELL, hi: false }); A.flat(g, A.ell(-.1, -1.4, .14, .22), 'rgba(30,40,50,.75)', 0); A.flat(g, A.ell(.14, -1.4, .14, .22), 'rgba(30,40,50,.75)', 0); for (let i = 0; i < 5; i++) A.line(g, [[-.22, -1.55 + i * .07], [.26, -1.55 + i * .07]], .015, 'rgba(240,250,255,.8)'); A.line(g, [[.02, -1.62], [.02, -1.18]], .03, 'rgba(240,250,255,.8)'); }); },
  frisorstol() { return Art.part('prop_frisorstol', 1.0, 1.7, .5, .05, g => { A.flat(g, A.ell(0, -.03, .3, .08), '#8a9298', .03, STEELL); A.line(g, [[0, -.03], [0, -.45]], .07, STEELL); A.cel(g, A.rr(-.36, -.72, .72, .3, .08), '#8a1a1a', { line: '#2a0606' }); A.cel(g, A.rr(-.3, -1.45, .6, .76, .1), '#9a2222', { line: '#2a0606' }); A.flat(g, A.rr(-.16, -1.6, .32, .14, .05), '#e8e0d0', .03); for (const x of [-.42, .3]) A.cel(g, A.rr(x, -.9, .12, .2, .04), STEEL, { line: STEELL, hi: false }); }); },
  harhaug() { return Art.part('prop_harhaug', .8, .5, .4, .1, g => { const rng = mulberry32(11); for (let i = 0; i < 26; i++) { const x = (rng() - .5) * .6, y = -rng() * .22; A.curve(g, [x - .1, y], [x, y - .08], [x + .12, y + (rng() - .5) * .06], .02, rng() < .5 ? '#3a2414' : rng() < .5 ? '#c8a060' : '#8a8a8a'); } }); },
  bjorn() { return Art.part('prop_bjorn', 1.4, 2.6, .7, .05, g => { A.cel(g, A.rr(-.45, -.25, .9, .25, .05), '#5a3a1e', { line: '#1a0e04' }); A.cel(g, A.blob([[-.4, -.3], [.4, -.3], [.46, -1.2], [.3, -1.8], [-.3, -1.8], [-.46, -1.2]]), '#5a3a22', { line: '#1a0e04' }); for (const s of [-1, 1]) A.cel(g, A.blob([[s * .3, -1.65], [s * .62, -1.95], [s * .7, -1.7], [s * .4, -1.4]]), '#4a2e1a', { line: '#1a0e04' }); A.cel(g, A.ell(0, -2.05, .3, .26), '#5a3a22', { line: '#1a0e04' }); for (const s of [-1, 1]) A.flat(g, A.ell(s * .22, -2.28, .08, .07), '#4a2e1a', .03); A.flat(g, A.ell(0, -1.95, .12, .08), '#8a6a4a', .025); A.dot(g, 0, -2.0, .035, INK); for (const s of [-1, 1]) A.dot(g, s * .1, -2.1, .03, '#f4e8a0'); A.flat(g, A.rr(-.3, -1.05, .6, .16, .03), '#e8dcc0', .02); for (const s of [-1, 1]) for (let i = 0; i < 3; i++) A.line(g, [[s * .64 + i * .03 * s, -1.72], [s * .7 + i * .04 * s, -1.66]], .015, '#f4f0e0'); }); },
  globus() { return Art.part('prop_globus', .8, 1.4, .4, .05, g => { A.line(g, [[0, 0], [0, -.55]], .06, WOODL); A.flat(g, A.ell(0, -.03, .22, .06), WOOD, .03, WOODL); A.curve(g, [-.32, -.95], [0, -.4], [.32, -.95], .04, MESSL); A.cel(g, A.ell(0, -.95, .3, .3), '#4a7aa0', { line: '#1a3040' }); A.flat(g, A.blob([[-.15, -1.1], [.05, -1.15], [.1, -.95], [-.05, -.85], [-.18, -.95]]), '#8aa05a', .02, '#2a3a1a'); A.flat(g, A.blob([[.08, -.8], [.2, -.82], [.18, -.7], [.06, -.72]]), '#8aa05a', .02, '#2a3a1a'); }); },
  komfyr() { return boxArt('prop_komfyr', .95, .75, 1.0, '#2e2e32', '#0a0a0c', (g, w, tf, ff) => { const top = -ff - tf; for (const x of [-.22, .22]) A.flat(g, A.ell(x, top + tf * .5, .16, .09), '#1a1a1c', .025, '#5a5a60'); A.flat(g, A.rr(-w / 2 + .1, -ff * .7, w - .2, ff * .45, .03), '#1a1a1e', .03, '#6a6a70'); A.dot(g, 0, -ff * .45, .05, '#ff7a3a'); A.flat(g, A.ell(.2, top - .05, .14, .1), '#6a6a70', .03); A.line(g, [[.2, top - .12], [.25, top - .35], [.18, top - .5]], .02, 'rgba(230,230,220,.5)'); }); },
  gryte() { return Art.part('prop_gryte', 1.1, 1.1, .55, .05, g => { for (const x of [-.3, .22]) A.line(g, [[x, 0], [x + .04, -.25]], .06, JERN); A.cel(g, A.poly([[-.45, -.25], [.45, -.25], [.4, -.75], [-.4, -.75]]), '#2a2a2e', { line: '#0a0a0c' }); A.flat(g, A.ell(0, -.75, .42, .12), '#5a6a2a', .04, '#0a0a0c'); for (const [x, r] of [[-.15, .05], [.1, .04], [.2, .06]]) A.flat(g, A.ell(x, -.76, r, r * .6), '#8a9a3a', .015); A.flat(g, A.ell(-.05, -.78, .06, .03), '#f0e8c8', .015); A.line(g, [[-.05, -.8], [.1, -1.0], [.05, -1.05]], .025, '#4a3a2a'); }); },
  kjottkrok() { return Art.part('prop_kjottkrok', .9, 2.3, .45, .05, g => { A.line(g, [[-.35, 0], [-.35, -2.1], [.35, -2.1], [.35, 0]], .06, JERN); A.line(g, [[0, -2.1], [0, -1.85]], .03, STEELL); A.curve(g, [0, -1.85], [.12, -1.72], [0, -1.65], .03, STEELL); A.cel(g, A.blob([[-.2, -1.7], [.18, -1.72], [.24, -1.2], [.1, -.8], [-.12, -.82], [-.24, -1.25]]), '#b84a4a', { line: '#3a0a0a' }); A.flat(g, A.blob([[-.12, -1.5], [.08, -1.55], [.12, -1.25], [-.06, -1.1]]), '#f0d8c0', .02, '#3a0a0a'); A.dot(g, -.05, -.75, .04, '#6a0a0a'); A.dot(g, .02, -.55, .03, '#6a0a0a'); }); },
  kjele() { return boxArt('prop_kjele', 1.9, 1.3, 1.9, '#4a3e36', '#140e0a', (g, w, tf, ff) => { const top = -ff - tf; for (let i = 0; i < 3; i++) A.line(g, [[-w / 2 + .1, -ff + .3 + i * .4], [w / 2 - .1, -ff + .3 + i * .4]], .04, '#2a221c'); for (let i = 0; i < 6; i++) A.dot(g, -w / 2 + .2 + i * .3, -ff + .1, .03, '#8a7a6a'); A.flat(g, A.rr(-.35, -ff * .5, .7, ff * .35, .06), '#1a0e08', .04); A.flat(g, A.rr(-.28, -ff * .44, .56, ff * .25, .04), '#ff7a2a', 0); A.flat(g, A.rr(-.2, -ff * .4, .4, ff * .15, .03), '#ffd05a', 0); A.flat(g, A.ell(w / 2 - .35, top + .1, .14, .14), '#e8e4d8', .03); A.line(g, [[w / 2 - .35, top + .1], [w / 2 - .3, top + .02]], .02, '#b3261e'); A.line(g, [[-w / 2 + .3, top], [-w / 2 + .3, top - .8]], .12, '#3a322c'); }); },
  kullhaug() { return Art.part('prop_kullhaug', 1.3, .9, .65, .05, g => { const rng = mulberry32(5); A.cel(g, A.blob([[-.58, 0], [.58, 0], [.4, -.35], [.1, -.62], [-.2, -.55], [-.45, -.3]]), '#1e1c1e', { line: '#050405' }); for (let i = 0; i < 14; i++) A.flat(g, A.ell((rng() - .5) * .9, -rng() * .5, .05 + rng() * .04, .04), rng() < .3 ? '#3a383c' : '#141214', 0); A.line(g, [[.3, -.1], [.65, -.8]], .04, '#6a4a2a'); A.flat(g, A.rr(.58, -.95, .16, .2, .03), '#5a5a60', .03); }); },
  ror() { return Art.part('prop_ror', .7, 2.4, .35, .05, g => { A.cel(g, A.rr(-.12, -2.3, .24, 2.3, .06), '#6a5a4a', { line: '#1a120a' }); for (const y of [-2.0, -1.2, -.4]) A.cel(g, A.rr(-.17, y, .34, .1, .03), '#8a7a66', { line: '#1a120a', hi: false }); A.flat(g, A.ell(0, -1.6, .14, .14), '#b3261e', .03); A.line(g, [[0, -1.6], [.06, -1.68]], .02, INK); A.line(g, [[.12, -.9], [.18, -.7], [.14, -.5]], .02, 'rgba(160,200,220,.7)'); }); },
  kors() { return Art.part('prop_kors', .9, 2.1, .45, .05, g => { A.flat(g, A.ell(0, -.03, .3, .08), '#4a4038', .03); A.cel(g, A.rr(-.08, -1.95, .16, 1.95, .03), '#3a2a1e', { line: '#0e0804' }); A.cel(g, A.rr(-.4, -1.5, .8, .15, .03), '#3a2a1e', { line: '#0e0804' }); }); },
  plantebord() { return bordArt('prop_plantebord', 1.8, .8, .75, '#6a5a44', '#1e160c', (g, w, tf, ff) => { const top = -ff - tf; for (let i = 0; i < 4; i++) { const x = -w / 2 + .3 + i * .42; A.cel(g, A.poly([[x - .13, top + tf * .6], [x + .13, top + tf * .6], [x + .1, top + tf * .6 - .2], [x - .1, top + tf * .6 - .2]]), '#b8603a', { line: '#3a1a0a', lw: .025, hi: false }); A.flat(g, A.blob([[x - .12, top + tf * .6 - .2], [x, top + tf * .6 - .5 - (i % 2) * .15], [x + .12, top + tf * .6 - .2]]), i === 2 ? '#8a3a5a' : '#4a7a3a', .025, '#1a2a10'); } }); },
  kjempeplante() { return Art.part('prop_kjempeplante', 1.6, 2.6, .8, .05, g => { A.cel(g, A.poly([[-.4, 0], [.4, 0], [.34, -.5], [-.34, -.5]]), '#b8603a', { line: '#3a1a0a' }); for (const [a, l] of [[-.8, 1.2], [.7, 1.3], [-.3, 1.6], [.2, 1.1]]) A.line(g, [[0, -.5], [Math.sin(a) * .5, -.5 - l * .6], [Math.sin(a) * .7, -.5 - l]], .08, '#3a6a2a'); A.cel(g, A.blob([[-.5, -1.9], [-.1, -2.5], [.35, -2.3], [.45, -1.9], [.1, -1.75]]), '#7a2a3a', { line: '#2a0a10' }); A.flat(g, A.blob([[-.4, -1.95], [.35, -1.95], [.1, -1.8]]), '#f0c8c8', .02); for (let i = 0; i < 7; i++) A.line(g, [[-.35 + i * .11, -1.95], [-.33 + i * .11, -1.88]], .02, '#f4f0e0'); A.dot(g, .1, -2.25, .04, '#ffd84a'); }); },
  vannkanne() { return Art.part('prop_vannkanne', .8, .7, .4, .05, g => { A.cel(g, A.rr(-.2, -.45, .36, .45, .06), '#6a8a6a', { line: '#1a2a1a' }); A.line(g, [[.16, -.3], [.42, -.52]], .05, '#1a2a1a'); A.flat(g, A.ell(.44, -.54, .06, .04), '#6a8a6a', .025, '#1a2a1a'); A.curve(g, [-.18, -.42], [-.02, -.7], [.14, -.42], .035, '#1a2a1a'); }); },
  // ---------- ute ----------
  bronn() { return Art.part('prop_bronn', 2.0, 2.4, 1.0, .05, g => { A.cel(g, A.rr(-.75, -.75, 1.5, .75, .1), '#6e6a60', { line: INK }); for (let i = 0; i < 3; i++) A.line(g, [[-.75, -.25 - i * .22], [.75, -.25 - i * .22]], .025, '#3a3830'); A.flat(g, A.ell(0, -.78, .72, .2), '#0a0c10', .05); A.flat(g, A.ell(-.1, -.8, .3, .07), '#2a3a4a', 0); for (const x of [-.7, .62]) A.cel(g, A.rr(x, -2.0, .1, 1.3, .02), WOOD, { line: WOODL, hi: false }); A.cel(g, A.poly([[-.9, -1.95], [0, -2.35], [.9, -1.95], [.8, -1.85], [0, -2.2], [-.8, -1.85]]), '#6a3a2a', { line: '#1a0a06' }); A.line(g, [[0, -1.9], [0, -1.2]], .02, '#8a7a5a'); A.cel(g, A.rr(-.12, -1.25, .24, .2, .03), '#6a5a44', { line: WOODL, hi: false }); }); },
  tre() { return Art.part('prop_tre', 2.6, 4.2, 1.3, .05, g => { A.cel(g, A.poly([[-.18, 0], [.2, 0], [.14, -1.6], [-.12, -1.6]]), '#4a3a28', { line: '#140c06' }); A.line(g, [[.05, -1.2], [.5, -1.8]], .08, '#4a3a28'); for (const [x, y, r, c] of [[-.6, -2.4, .7, '#1e3a1c'], [.6, -2.5, .72, '#244420'], [0, -3.2, .85, '#2a4a24'], [-.3, -2.0, .55, '#18301a'], [.4, -2.0, .5, '#1a3418']]) A.cel(g, A.ell(x, y, r, r * .85), c, { line: '#08140a' }); for (let i = 0; i < 6; i++) A.dot(g, -.6 + i * .25, -2.8 + (i % 2) * .4, .05, 'rgba(160,200,120,.5)'); }); },
  lyktestolpe() { return Art.part('prop_lyktestolpe', .8, 3.1, .4, .05, g => { A.flat(g, A.ell(0, -.04, .22, .07), JERN, .03); A.cel(g, A.rr(-.06, -2.5, .12, 2.5, .03), '#2a2a30', { line: '#0a0a0c', hi: false }); A.cel(g, A.rr(-.12, -.5, .24, .12, .03), '#3a3a40', { line: '#0a0a0c', hi: false }); A.cel(g, A.poly([[-.22, -2.5], [.22, -2.5], [.28, -2.95], [-.28, -2.95]]), '#1a1a1e', { line: '#0a0a0c' }); A.flat(g, A.poly([[-.16, -2.55], [.16, -2.55], [.2, -2.88], [-.2, -2.88]]), '#ffe2a0', 0); A.flat(g, A.poly([[-.3, -2.95], [0, -3.1], [.3, -2.95]]), '#1a1a1e', .03); }); },
  busk() { return Art.part('prop_busk', 1.4, 1.3, .7, .05, g => { for (const [x, y, r, c] of [[-.3, -.4, .38, '#1e3a1a'], [.3, -.45, .4, '#244420'], [0, -.75, .42, '#2a4a24']]) A.cel(g, A.ell(x, y, r, r * .8), c, { line: '#08140a' }); for (let i = 0; i < 4; i++) A.dot(g, -.3 + i * .2, -.7 + (i % 2) * .2, .04, 'rgba(170,210,120,.55)'); if (mulberry32(3)() < .5) for (let i = 0; i < 3; i++) A.dot(g, -.2 + i * .2, -.5 - i * .1, .045, '#c8323a'); }); },
  blomsterbed() { return Art.part('prop_blomsterbed', 2.2, 1.1, 1.1, .05, g => { A.cel(g, A.rr(-1.0, -.35, 2.0, .35, .06), '#6a6258', { line: INK }); A.flat(g, A.rr(-.95, -.55, 1.9, .25, .06), '#3a2a1a', .03); const rng = mulberry32(9); for (let i = 0; i < 16; i++) { const x = -.85 + i * .11, y = -.55 - rng() * .25; A.line(g, [[x, -.4], [x, y]], .02, '#3a6a2a'); A.dot(g, x, y, .05, ['#e8d05a', '#c8323a', '#f0f0f4', '#8a5ac8'][i % 4]); } }); },
  hagenisse() { return Art.part('prop_hagenisse', .7, 1.1, .35, .05, g => { A.cel(g, A.rr(-.18, -.45, .36, .45, .08), '#3a5aa0', { line: '#101a30' }); A.cel(g, A.ell(0, -.55, .15, .13), '#f0c8a0', { line: INK }); A.cel(g, A.poly([[-.16, -.6], [.16, -.6], [.02, -1.0]]), '#c8323a', { line: '#3a0a0a' }); A.flat(g, A.blob([[-.14, -.5], [.14, -.5], [.08, -.28], [0, -.22], [-.08, -.28]]), '#f4f0e8', .025); A.dot(g, -.05, -.58, .025, INK); A.dot(g, .06, -.58, .025, INK); A.line(g, [[.18, -.3], [.3, -.05]], .04, '#6a4a2a'); }); },
  fuglebad() { return Art.part('prop_fuglebad', 1.1, 1.3, .55, .05, g => { A.cel(g, A.rr(-.12, -.8, .24, .8, .04), '#8a867a', { line: INK }); A.flat(g, A.ell(0, -.04, .3, .08), '#7a766a', .03); A.cel(g, A.ell(0, -.88, .48, .16), '#9a968a', { line: INK }); A.flat(g, A.ell(0, -.9, .38, .1), '#3a5a6a', .02); A.flat(g, A.ell(.1, -.92, .14, .04), 'rgba(220,240,255,.6)', 0); }); },
  lysthus() { return Art.part('prop_lysthus', 3.4, 4.2, 1.7, .05, g => { A.cel(g, A.rr(-1.5, -.3, 3.0, .3, .05), '#d8d0b8', { line: INK }); for (const x of [-1.4, -.5, .4, 1.3]) A.cel(g, A.rr(x, -2.5, .12, 2.2, .03), '#efe8d4', { line: INK, hi: false }); for (let i = 0; i < 12; i++) A.line(g, [[-1.4 + i * .24, -1.0], [-1.28 + i * .24, -.35]], .025, '#d8d0b8'); A.line(g, [[-1.45, -1.0], [1.45, -1.0]], .06, '#efe8d4'); A.cel(g, A.poly([[-1.75, -2.45], [0, -3.9], [1.75, -2.45]]), '#5a6a4a', { line: INK }); A.flat(g, A.poly([[-1.75, -2.45], [1.75, -2.45], [1.6, -2.3], [-1.6, -2.3]]), '#efe8d4', .04); A.flat(g, A.ell(0, -4.0, .08, .08), MESS, .025); }); },
  gravstein(p) {
    const navn = gravNavn(p), key = 'prop_gravstein_' + (navn || 'x').replace(/\W/g, '').slice(0, 10) + ((p.navn || 0) % 3);
    return Art.part(key, 1.0, 1.4, .5, .05, g => { const v = (p.navn || 0) % 3; A.flat(g, A.ell(0, -.02, .42, .08), '#3a3a30', 0); if (v === 1) A.cel(g, A.rr(-.36, -1.1, .72, 1.1, .08), '#8a8a82', { line: INK }); else if (v === 2) { A.cel(g, A.rr(-.08, -1.2, .16, 1.2, .02), '#7a7a72', { line: INK }); A.cel(g, A.rr(-.32, -.95, .64, .14, .02), '#7a7a72', { line: INK }); } else A.cel(g, A.poly([[-.34, 0], [.34, 0], [.34, -.85], [0, -1.15], [-.34, -.85]]), '#8a8a82', { line: INK }); if (navn && v !== 2) { g.save(); g.fillStyle = '#2a2a24'; g.font = 'bold .13px Georgia, serif'; g.textAlign = 'center'; g.fillText(navn.split(' ')[0].slice(0, 9).toUpperCase(), 0, -.62); g.font = '.1px Georgia, serif'; g.fillText('HVIL', 0, -.45); g.restore(); } A.flat(g, A.ell(-.2, -.1, .18, .06), 'rgba(60,90,40,.6)', 0); });
  },
  engel() { return Art.part('prop_engel', 1.4, 2.6, .7, .05, g => { A.cel(g, A.rr(-.4, -.4, .8, .4, .05), '#7a7a72', { line: INK }); for (const s of [-1, 1]) A.cel(g, A.blob([[s * .1, -1.6], [s * .7, -2.2], [s * .6, -1.4], [s * .2, -1.1]]), '#9a9a90', { line: INK }); A.cel(g, A.poly([[-.25, -.4], [.25, -.4], [.18, -1.6], [-.18, -1.6]]), '#a4a49a', { line: INK }); A.cel(g, A.ell(0, -1.8, .17, .19), '#a4a49a', { line: INK }); A.flat(g, A.ell(0, -2.05, .16, .04), null, .03); A.line(g, [[-.06, -1.78], [-.03, -1.6]], .02, 'rgba(40,40,40,.5)'); A.line(g, [[.06, -1.78], [.08, -1.55]], .02, 'rgba(40,40,40,.5)'); A.flat(g, A.ell(-.15, -1.0, .12, .3), 'rgba(60,90,40,.5)', 0); }); },
  grav() { return Art.part('prop_grav', 1.3, 2.2, .65, 1.1, g => { A.flat(g, A.rr(-.5, -1.0, 1.0, 2.0, .1), '#2a1c10', .05); A.flat(g, A.rr(-.4, -.9, .8, 1.8, .08), '#0c0806', 0); A.flat(g, A.blob([[.5, -1.0], [.62, -.4], [.58, .3], [.5, .9]]), '#4a3422', .04); A.line(g, [[.5, .6], [.75, .95]], .05, '#6a4a2a'); }); },
  fontene() { return Art.part('prop_fontene', 2.6, 3.0, 1.3, .6, g => { A.cel(g, A.ell(0, -.2, 1.2, .5), '#8a867a', { line: INK }); A.flat(g, A.ell(0, -.3, 1.05, .38), '#2a4a5a', .03); A.flat(g, A.ell(.2, -.35, .5, .12), 'rgba(200,230,255,.35)', 0); A.cel(g, A.rr(-.12, -1.6, .24, 1.3, .04), '#9a968a', { line: INK }); A.cel(g, A.ell(0, -1.6, .5, .14), '#9a968a', { line: INK }); A.cel(g, A.ell(0, -2.05, .16, .2), '#a4a49a', { line: INK }); A.dot(g, -.05, -2.08, .025, INK); A.dot(g, .05, -2.08, .025, INK); A.flat(g, A.ell(0, -1.98, .04, .03), '#1a1a1a', 0); A.line(g, [[0, -1.97], [.25, -1.8], [.45, -1.55]], .035, 'rgba(160,210,240,.75)'); A.line(g, [[0, -1.97], [-.3, -1.75], [-.5, -1.5]], .03, 'rgba(160,210,240,.6)'); }); },
  statue() { return Art.part('prop_statue', 1.1, 2.6, .55, .05, g => { A.cel(g, A.rr(-.36, -.5, .72, .5, .04), '#7a7a72', { line: INK }); A.cel(g, A.poly([[-.26, -.5], [.26, -.5], [.2, -1.7], [-.2, -1.7]]), '#9a968a', { line: INK }); A.cel(g, A.ell(0, -1.95, .2, .24), '#a4a49a', { line: INK }); A.line(g, [[.2, -1.5], [.5, -1.9]], .1, '#9a968a'); A.flat(g, A.rr(-.3, -.3, .6, .12, .02), '#c8c4b4', .02); A.flat(g, A.ell(.08, -2.1, .1, .05), 'rgba(240,240,240,.8)', 0); A.flat(g, A.blob([[.05, -2.05], [.12, -1.7], [.08, -1.6], [.03, -1.8]]), 'rgba(240,240,230,.7)', 0); }); },
  siv() { return Art.part('prop_siv', .8, 1.5, .4, .05, g => { const rng = mulberry32(21); for (let i = 0; i < 7; i++) { const x = (rng() - .5) * .5, h = .8 + rng() * .5; A.curve(g, [x, 0], [x + (rng() - .5) * .2, -h * .6], [x + (rng() - .5) * .3, -h], .03, '#5a6a2a'); if (i % 3 === 0) A.flat(g, A.rr(x - .04, -h - .02, .08, .22, .04), '#5a3a1a', .02); } }); },
  snomann() { return Art.part('prop_snomann', 1.1, 2.0, .55, .05, g => { A.cel(g, A.ell(0, -.4, .45, .4), '#eef2f6', { line: '#3a4a5a' }); A.cel(g, A.ell(0, -1.05, .32, .3), '#eef2f6', { line: '#3a4a5a' }); A.cel(g, A.ell(0, -1.55, .24, .22), '#eef2f6', { line: '#3a4a5a' }); A.dot(g, -.08, -1.6, .03, INK); A.dot(g, .08, -1.58, .03, INK); A.flat(g, A.poly([[0, -1.52], [.25, -1.48], [0, -1.46]]), '#e07a2a', .015); A.line(g, [[-.08, -1.42], [0, -1.4], [.1, -1.43]], .02, INK); A.line(g, [[.3, -1.05], [.62, -1.3]], .03, '#4a3a2a'); A.line(g, [[.1, -1.45], [.22, -1.38], [.3, -1.42]], .03, '#3a2a1a'); A.flat(g, A.ell(.33, -1.44, .05, .04), '#2a1a0a', .015); A.flat(g, A.rr(-.2, -1.9, .4, .15, .03), '#2a2a2a', .02); A.flat(g, A.rr(-.3, -1.78, .6, .05, .02), '#2a2a2a', .02); }); },
  vak() { return Art.part('prop_vak', 1.6, 1.4, .8, .7, g => { A.flat(g, A.blob([[-.6, 0], [-.3, -.45], [.35, -.5], [.65, -.05], [.4, .4], [-.4, .42]]), '#04080c', .05, '#e8f4ff'); A.flat(g, A.ell(.1, -.05, .3, .1), 'rgba(80,120,160,.4)', 0); A.line(g, [[.65, -.05], [.9, -.2]], .02, 'rgba(255,255,255,.8)'); A.line(g, [[-.6, 0], [-.85, .2]], .02, 'rgba(255,255,255,.8)'); }); },
  liggestol() { return Art.part('prop_liggestol', 1.1, 1.5, .55, .05, g => { for (const x of [-.4, .34]) A.line(g, [[x, 0], [x + .02, -.45]], .05, WOODL); A.cel(g, A.poly([[-.45, -.4], [.45, -.4], [.4, -1.3], [-.4, -1.3]]), '#8a6a4a', { line: WOODL }); A.cel(g, A.blob([[-.4, -.45], [.4, -.45], [.38, -1.1], [.1, -1.25], [-.3, -1.15]]), '#6a7a9a', { line: '#1a2030' }); for (let i = 0; i < 4; i++) A.line(g, [[-.38, -.55 - i * .15], [.38, -.55 - i * .15]], .025, '#4a5a7a'); A.cel(g, A.ell(0, -1.18, .16, .13), '#f0d8c0', { line: INK }); A.line(g, [[-.07, -1.2], [-.02, -1.2]], .015, INK); A.line(g, [[.03, -1.2], [.08, -1.2]], .015, INK); }); },
  teppe() { return Art.part('prop_teppe', 1.1, .8, .55, .4, g => { A.flat(g, A.blob([[-.45, -.3], [.4, -.35], [.5, .2], [-.4, .3]]), '#7a4a3a', .03); for (let i = 0; i < 4; i++) A.line(g, [[-.4 + i * .25, -.3], [-.35 + i * .25, .28]], .025, '#c8a060'); }); },
  kjerre() { return Art.part('prop_kjerre', 2.2, 1.5, 1.1, .05, g => { A.cel(g, A.rr(-.9, -.95, 1.8, .6, .05), '#7a5a3a', { line: WOODL }); for (let i = 0; i < 3; i++) A.line(g, [[-.9, -.75 + i * .15], [.9, -.75 + i * .15]], .02, WOODL); A.cel(g, A.ell(-.45, -.35, .32, .32), '#5a4028', { line: WOODL }); A.flat(g, A.ell(-.45, -.35, .08, .08), JERN, .02); for (let a = 0; a < 6; a++) A.line(g, [[-.45, -.35], [-.45 + Math.cos(a) * .3, -.35 + Math.sin(a) * .3]], .02, WOODL); A.line(g, [[.9, -.8], [1.05, -.2]], .06, WOODL); A.flat(g, A.blob([[-.7, -.95], [-.2, -1.25], [.3, -1.15], [.6, -.95]]), '#c8a868', .03, '#4a3a1a'); }); },
  vedstabel() { return Art.part('prop_vedstabel', 2.2, 1.3, 1.1, .05, g => { for (let r = 0; r < 3; r++) for (let i = 0; i < 6 - r; i++) { const x = -.8 + i * .32 + r * .16, y = -.2 - r * .3; A.cel(g, A.ell(x, y, .16, .15), '#8a6a44', { line: WOODL, lw: .03, hi: false }); A.flat(g, A.ell(x, y, .08, .07), '#c8a070', 0); A.flat(g, A.ell(x, y, .03, .03), '#8a6a44', 0); } }); },
  // ---------- Nattskogen ----------
  bjork(p) { const dod = p && p.dod; return Art.part('prop_bjork' + (dod ? '_dod' : ''), 1.6, 4.4, .8, .05, g => { A.cel(g, A.poly([[-.13, 0], [.14, 0], [.1, -3.4], [-.08, -3.4]]), '#e8e4d8', { line: '#1a1612' }); const rng = mulberry32(4); for (let y = -.2; y > -3.3; y -= .18 + rng() * .25) A.flat(g, A.rr(-.12 + rng() * .1, y, .08 + rng() * .1, .035, .01), '#1a1612', 0); A.line(g, [[0, -2.2], [.5, -2.9]], .04, '#d8d4c8'); A.line(g, [[0, -2.6], [-.45, -3.2]], .035, '#d8d4c8'); if (!dod) for (const [x, y, r] of [[-.4, -3.3, .45], [.4, -3.1, .4], [0, -3.8, .5], [.3, -3.6, .35], [-.2, -2.9, .3]]) A.cel(g, A.ell(x, y, r, r * .9), rng() < .5 ? '#2a4020' : '#324a24', { line: '#0a1408', lw: .03 }); else { A.line(g, [[0, -3.4], [.3, -4.1]], .03, '#d8d4c8'); A.line(g, [[0, -3.3], [-.25, -4.0]], .03, '#d8d4c8'); } }); },
  gran() { return Art.part('prop_gran', 2.0, 4.6, 1.0, .05, g => { A.cel(g, A.rr(-.08, -.8, .16, .8, .03), '#3a2a1a', { line: '#0a0604' }); for (let i = 0; i < 4; i++) { const y = -.6 - i * .85, w = .95 - i * .2; A.cel(g, A.poly([[-w, y], [w, y], [0, y - 1.3]]), i % 2 ? '#12241a' : '#16301e', { line: '#040a06' }); } }); },
  stubbe() { return Art.part('prop_stubbe', .9, .9, .45, .05, g => { A.cel(g, A.poly([[-.32, 0], [.32, 0], [.26, -.45], [-.26, -.45]]), '#5a4028', { line: '#140c04' }); A.flat(g, A.ell(0, -.45, .26, .1), '#c8a070', .03, '#140c04'); for (let r = .06; r < .24; r += .06) A.flat(g, A.ell(0, -.45, r, r * .38), null, .012, '#8a6a44'); A.line(g, [[.3, -.05], [.44, .02]], .04, '#5a4028'); }); },
  sopp() { return Art.part('prop_sopp', .7, .7, .35, .05, g => { for (const [x, s] of [[-.12, 1], [.14, .7]]) { A.cel(g, A.rr(x - .04 * s, -.3 * s, .08 * s, .3 * s, .02), '#f0ece0', { line: INK, lw: .025, hi: false }); A.cel(g, A.blob([[x - .18 * s, -.28 * s], [x, -.48 * s], [x + .18 * s, -.28 * s]]), '#c8282a', { line: INK, lw: .03 }); for (let i = 0; i < 3; i++) A.dot(g, x - .08 * s + i * .08 * s, -.35 * s - (i % 2) * .05 * s, .025 * s, '#f4f0e8'); } }); },
  stein() { return Art.part('prop_stein', 1.4, 1.1, .7, .05, g => { A.cel(g, A.blob([[-.6, 0], [.55, 0], [.62, -.4], [.3, -.8], [-.2, -.85], [-.58, -.45]]), '#5a5a58', { line: INK }); A.flat(g, A.blob([[-.4, -.55], [.1, -.8], [.4, -.6], [.1, -.5]]), '#3e5a2a', .02); A.line(g, [[.1, -.1], [.25, -.4]], .02, '#2a2a28'); }); },
  baal() { return Art.part('prop_baal', 1.4, 1.8, .7, .05, g => { for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; A.flat(g, A.ell(Math.cos(a) * .5, Math.sin(a) * .16 - .1, .12, .08), '#5a5a58', .02); } A.line(g, [[-.4, -.05], [.35, -.3]], .09, '#3a2414'); A.line(g, [[.4, -.05], [-.3, -.32]], .09, '#4a2c16'); A.cel(g, A.blob([[-.35, -.2], [0, -1.3], [.35, -.2]]), '#ff7a2a', { line: '#6a1a04', lw: .03 }); A.flat(g, A.blob([[-.2, -.22], [.02, -.95], [.22, -.22]]), '#ffd05a', 0); A.flat(g, A.blob([[-.08, -.25], [0, -.6], [.08, -.25]]), '#fff6d0', 0); A.dot(g, .2, -1.4, .03, '#ffb04a'); A.dot(g, -.15, -1.55, .025, '#ffb04a'); }); },
  robat() { return Art.part('prop_robat', 2.2, 1.2, 1.1, .05, g => { A.cel(g, A.blob([[-1.0, -.35], [-.7, 0], [.8, 0], [1.05, -.4], [.9, -.62], [-.9, -.62]]), '#6a4a2e', { line: WOODL }); A.flat(g, A.blob([[-.85, -.58], [.85, -.58], [.75, -.42], [-.75, -.42]]), '#2a1a0e', .02); for (const x of [-.3, .3]) A.line(g, [[x, -.62], [x, -.42]], .05, '#8a6a44'); A.line(g, [[.2, -.5], [.95, -.95]], .04, '#8a6a44'); A.flat(g, A.rr(.9, -1.05, .2, .1, .03), '#8a6a44', .02); }); },
  ruinmur() { return Art.part('prop_ruinmur', 2.2, 1.6, 1.1, .05, g => { A.cel(g, A.poly([[-1.0, 0], [1.0, 0], [1.0, -.7], [.6, -1.1], [.3, -.8], [-.2, -1.35], [-.5, -.9], [-1.0, -1.0]]), '#6e6a60', { line: INK }); for (let r = 0; r < 4; r++) A.line(g, [[-1.0, -.2 - r * .25], [1.0, -.2 - r * .25]], .02, '#3a3830'); A.flat(g, A.blob([[-.6, -.9], [-.2, -1.3], [.1, -1.0], [-.3, -.85]]), '#3e5a2a', .02); }); },
  vedovn() { return Art.part('prop_vedovn', 1.0, 2.6, .5, .05, g => { A.cel(g, A.rr(-.3, -1.0, .6, 1.0, .06), '#2a2a2e', { line: '#0a0a0c' }); A.flat(g, A.rr(-.2, -.7, .4, .35, .04), '#140e0a', .03); A.flat(g, A.rr(-.15, -.62, .3, .22, .03), '#ff7a2a', 0); A.flat(g, A.rr(-.1, -.56, .2, .1, .02), '#ffd05a', 0); A.cel(g, A.rr(-.08, -2.5, .16, 1.5, .02), '#3a3a40', { line: '#0a0a0c', hi: false }); A.line(g, [[0, -2.5], [.1, -2.9], [0, -3.2]], .04, 'rgba(200,200,190,.35)'); }); },
  koiesong() { return bedArt('bed', 1, 2, 'n'); },
  gevir() { return Art.part('prop_gevir', 1.6, 2.2, .8, .05, g => { A.line(g, [[0, 0], [0, -1.2]], .06, WOODL); A.cel(g, A.rr(-.25, -1.5, .5, .4, .06), '#6a4a2a', { line: WOODL }); for (const s of [-1, 1]) { A.line(g, [[s * .1, -1.45], [s * .45, -1.9], [s * .7, -2.05]], .06, '#e8dcc0'); A.line(g, [[s * .3, -1.7], [s * .38, -2.0]], .05, '#e8dcc0'); A.line(g, [[s * .5, -1.92], [s * .5, -2.12]], .04, '#e8dcc0'); } }); },
  // ---------- utgangene (rømningsforsøkene) ----------
  porten() { return Art.part('prop_porten', 2.6, 3.2, 1.3, .05, g => { for (const x of [-1.1, .9]) A.cel(g, A.rr(x, -2.6, .2, 2.6, .03), '#5a5a58', { line: INK }); for (const x of [-1.1, .9]) A.cel(g, A.ell(x + .1, -2.75, .16, .16), '#6a6a66', { line: INK }); for (let i = 0; i < 9; i++) { const x = -.85 + i * .2; A.line(g, [[x, -.1], [x, -2.1 - Math.sin(i / 8 * Math.PI) * .4]], .045, '#16161a'); A.flat(g, A.poly([[x - .05, -2.1 - Math.sin(i / 8 * Math.PI) * .4], [x, -2.28 - Math.sin(i / 8 * Math.PI) * .4], [x + .05, -2.1 - Math.sin(i / 8 * Math.PI) * .4]]), '#16161a', 0); } for (const y of [-.4, -1.6]) A.line(g, [[-.9, y], [.9, y]], .05, '#16161a'); A.curve(g, [-.4, -1.0], [0, -1.35], [.4, -1.0], .035, '#16161a'); A.flat(g, A.ell(0, -1.05, .08, .08), MESS, .02); }); },
  vindu() { return Art.part('prop_vindu', 1.8, 2.8, .9, .05, g => { A.cel(g, A.rr(-.7, -2.6, 1.4, 2.0, .04), '#e8e0cc', { line: INK }); A.flat(g, A.rr(-.58, -2.48, 1.16, 1.76, .02), '#0e1830', .03); for (let i = 0; i < 12; i++) A.dot(g, -.5 + ((i * 37) % 100) / 100, -2.4 + ((i * 53) % 100) / 100 * 1.5, .015, '#f4f0d8'); A.flat(g, A.ell(.25, -2.2, .12, .12), '#f4f0d8', 0); A.line(g, [[0, -2.48], [0, -.72]], .05, '#e8e0cc'); A.line(g, [[-.58, -1.6], [.58, -1.6]], .05, '#e8e0cc'); A.flat(g, A.blob([[-.7, -2.6], [-.95, -1.8], [-.75, -.9], [-.55, -1.6]]), 'rgba(240,236,220,.85)', .03); A.cel(g, A.rr(-.85, -.62, 1.7, .12, .03), '#d8d0b8', { line: INK }); }); },
  kloakk() { return Art.part('prop_kloakk', 1.6, 1.6, .8, .8, g => { A.flat(g, A.ell(0, 0, .72, .62), '#050404', .06); A.flat(g, A.ell(0, 0, .62, .52), '#16181a', 0); for (let i = -3; i <= 3; i++) A.line(g, [[i * .16, -.5], [i * .16, .5]], .06, '#3a3c3e'); A.flat(g, A.ell(.2, .15, .18, .08), 'rgba(90,110,120,.35)', 0); }); },
  kullsjakt() { return Art.part('prop_kullsjakt', 1.6, 1.6, .8, .8, g => { A.flat(g, A.rr(-.65, -.55, 1.3, 1.1, .08), '#0a0806', .06); for (let i = 0; i < 5; i++) A.line(g, [[-.35, -.45 + i * .22], [.35, -.45 + i * .22]], .05, '#6a5a44'); for (const x of [-.35, .35]) A.line(g, [[x, -.5], [x, .5]], .05, '#6a5a44'); A.flat(g, A.ell(0, -.3, .5, .2), 'rgba(255,240,200,.25)', 0); }); },
  sti() { return Art.part('prop_skilt', 1.6, 2.6, .8, .05, g => { A.cel(g, A.rr(-.07, -2.2, .14, 2.2, .03), '#5a4028', { line: WOODL, hi: false }); A.cel(g, A.poly([[-.6, -2.2], [.5, -2.2], [.72, -1.95], [.5, -1.7], [-.6, -1.7]]), '#c8b890', { line: INK }); g.save(); g.fillStyle = INK; g.font = 'bold .22px Georgia, serif'; g.textAlign = 'center'; g.fillText('UTGANG', -.02, -1.88); g.restore(); A.line(g, [[.1, -1.4], [.35, -1.25]], .02, JERN); A.flat(g, A.rr(.28, -1.25, .16, .24, .04), '#ffe2a0', .025, JERN); }); },
  utgang() { return Art.part('prop_utgang', 1.8, 3.0, .9, .05, g => { A.cel(g, A.rr(-.65, -2.4, 1.3, 2.4, .04), '#6b4a2c', { line: INK }); A.flat(g, A.rr(-.55, -2.3, 1.1, 2.3, .03), '#f4ecd0', .03); A.flat(g, A.rr(-.55, -2.3, 1.1, 2.3, .03), 'rgba(255,240,190,.6)', 0); A.cel(g, A.rr(-.6, -2.85, 1.2, .35, .04), '#1a3a1a', { line: INK }); g.save(); g.fillStyle = '#9aff9a'; g.font = 'bold .2px Georgia, serif'; g.textAlign = 'center'; g.fillText('UTSKRIVNING', 0, -2.61); g.restore(); }); }
});
/* navnet på en gravstein: dine egne døde pasienter fra arkivet, ellers et navn fra lista */
function gravNavn(p) {
  const H = (typeof G === 'object' && G.meta && G.meta.historie) || [], dode = H.filter(h => !h.utskrevet);
  if (dode.length && (p.navn || 0) % 2 === 0) return dode[(p.navn || 0) % dode.length].name;
  const N = ['Ole Hansen', 'Karen Berg', 'Nils Dahl', 'Ingrid Moe', 'Petter Lie', 'Ukjent', 'Marta Aas', 'Johan Vik'];
  return N[(p.navn || 0) % N.length];
}
Object.assign(BREAK, { lenestol: 1, kortbord: 1, harhaug: 1, kullhaug: 2, hagenisse: 1, sopp: 1, vannkanne: 1, tannglass: 1, instrumentbord: 1, siv: 1, snomann: 2, globus: 1, vedstabel: 2, plantebord: 1, busk: 2, spyttkum: 1, stubbe: 2 });

/* ============================================================
   UTE: bakken utenfor rommene, trær i mørket, vær og gasslykter
   ============================================================ */
const Landskap = {
  /* en stor flate under hele etasjen: gress i parken, mose og barnåler i skogen */
  bakke(F, th, L) {
    const skog = F.depth === 5, sno = F.vaer === 'sno';
    const tex = R.canvasTex(256, 256, g => {
      const rng = mulberry32(skog ? 55 : 44);
      g.fillStyle = skog ? '#1a2216' : '#243a1c'; g.fillRect(0, 0, 256, 256);
      for (let k = 0; k < 90; k++) { g.fillStyle = rng() < .5 ? (skog ? '#10180e' : '#1a2c14') : (skog ? '#26301e' : '#2e4a24'); g.beginPath(); g.ellipse(rng() * 256, rng() * 256, 10 + rng() * 26, 6 + rng() * 14, rng() * 3, 0, TAU); g.fill(); }
      g.strokeStyle = skog ? 'rgba(90,70,40,.5)' : 'rgba(110,150,80,.45)'; g.lineWidth = 2;
      for (let k = 0; k < 160; k++) { const x = rng() * 256, y = rng() * 256; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rng() - .5) * 6, y - 5 - rng() * 5); g.stroke(); }
      if (sno) { g.fillStyle = 'rgba(236,242,250,.7)'; for (let k = 0; k < 40; k++) { g.beginPath(); g.ellipse(rng() * 256, rng() * 256, 14 + rng() * 30, 8 + rng() * 12, 0, 0, TAU); g.fill(); } }
    }, true);
    const B = 24; tex.repeat.set((F.W + B * 2) / 5, (F.H + B * 2) / 5);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(F.W + B * 2, F.H + B * 2), new THREE.MeshBasicMaterial({ map: tex, color: skog ? 0x8a94a4 : 0x9aa4b4 }));
    m.rotation.x = -Math.PI / 2; m.position.set(F.W / 2, -.03, F.H / 2); m.userData.d3 = true; L.add(m);
    Paint.mesh.bakke = m; Paint.owned.push(tex, m.material, m.geometry);
  },
  /* trær og busker utenfor hekkene, så parken og skogen fortsetter inn i mørket */
  traer(F) {
    const W = F.W, H = F.H, wh = Paint.wallH || [], avst = new Uint8Array(W * H).fill(99), q = [];
    for (let i = 0; i < W * H; i++) if (F.tiles[i]) { avst[i] = 0; q.push(i); }
    for (let h = 0; h < q.length; h++) { const i = q[h], x = i % W, z = (i / W) | 0; if (avst[i] >= 8) continue; for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, nz = z + dz; if (nx < 0 || nz < 0 || nx >= W || nz >= H) continue; const j = nz * W + nx; if (avst[j] > avst[i] + 1) { avst[j] = avst[i] + 1; q.push(j); } } }
    const rng = mulberry32((F.seed || 3) * 17 + 5), skog = F.depth === 5, tetthet = skog ? .32 : .16, ut = [];
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
      const i = z * W + x; if (F.tiles[i] || wh[i] || avst[i] < 2 || avst[i] > 7 || rng() > tetthet) continue;
      ut.push([x + .5 + (rng() - .5) * .6, z + .5 + (rng() - .5) * .6, rng()]);
    }
    ut.sort((a, b) => a[2] - b[2]);
    const tint = new THREE.Color(skog ? '#6a7898' : '#7a8aa8');
    for (const [x, z, r] of ut.slice(0, skog ? 140 : 90)) {
      const k = skog ? (r < .55 ? 'gran' : 'bjork') : (r < .45 ? 'tre' : r < .85 ? 'busk' : 'gran');
      const g = propSprite(null, x, z, { P: ROM_ART[k]({}), shadow: false }); g.userData.U.uTint.value.copy(tint); g.userData.m.scale.multiplyScalar(.85 + r * .35); R.level.add(g);
    }
  }
};

/* ---------- været: regn, snø, tåke eller ildfluer ute, og i gårdsrommene inne ---------- */
const Vaer = {
  type: null, obj: null, n: 0, pos: null, fart: null, ripT: 0,
  start(F) {
    this.stopp(); this.F = F; const type = F && F.vaer; // F settes alltid, så ute() svarer for riktig etasje også i klarvær og tåke
    if (!type || type === 'klart' || type === 'taake' || R.lowTex) return;
    this.type = type; const N = this.n = type === 'regn' ? 260 : type === 'sno' ? 220 : 60;
    this.p = new Float32Array(N * 3); this.v = new Float32Array(N); for (let i = 0; i < N; i++) this.plasser(i, true);
    const geo = new THREE.BufferGeometry();
    if (type === 'regn') {
      this.pos = new Float32Array(N * 6); geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
      this.obj = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0x9ab4d8, transparent: true, opacity: .42, depthWrite: false }));
    } else {
      this.pos = new Float32Array(N * 3); geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
      if (type === 'ildfluer') { this.farge = new Float32Array(N * 3); geo.setAttribute('color', new THREE.BufferAttribute(this.farge, 3)); }
      this.obj = new THREE.Points(geo, new THREE.PointsMaterial({ color: type === 'sno' ? 0xf4f8ff : 0xffffff, vertexColors: type === 'ildfluer', size: type === 'sno' ? 3.2 : 4.5, sizeAttenuation: false, transparent: true, opacity: type === 'sno' ? .9 : 1, depthWrite: false, blending: type === 'ildfluer' ? THREE.AdditiveBlending : THREE.NormalBlending }));
    }
    this.obj.frustumCulled = false; this.obj.renderOrder = 6; R.scene.add(this.obj);
    Sound.vaer && Sound.vaer(type === 'regn' ? 'regn' : 'vind');
  },
  stopp() { if (this.obj) { R.scene.remove(this.obj); this.obj.geometry.dispose(); this.obj.material.dispose(); } this.obj = null; this.type = null; this.farge = null; Sound.vaer && Sound.vaer(null); },
  /* ute er alt i en uteetasje utenom paviljongene, og uterommene (gårdsrom, lysgård) i inneetasjene */
  ute(x, z) { const F = this.F; if (!F) return false; const tx = Math.floor(x), tz = Math.floor(z); if (tx < 0 || tz < 0 || tx >= F.W || tz >= F.H) return F.ute; const i = tz * F.W + tx; if (!F.tiles[i]) return F.ute; const rid = F.roomId[i]; return rid >= 0 ? !!F.rooms[rid].ute : F.ute; },
  plasser(i, forste) {
    const cx = R.camT.x, cz = R.camT.z;
    for (let k = 0; k < 4; k++) {
      const x = cx + (Math.random() - .5) * 28, z = cz + (Math.random() - .5) * 22 - 2;
      if (!this.ute(x, z)) continue;
      this.p[i * 3] = x; this.p[i * 3 + 1] = this.type === 'ildfluer' ? .3 + Math.random() * 1.6 : forste ? Math.random() * 7 : 6 + Math.random() * 2; this.p[i * 3 + 2] = z;
      this.v[i] = this.type === 'regn' ? 13 + Math.random() * 5 : this.type === 'sno' ? .7 + Math.random() * .6 : Math.random() * TAU; return;
    }
    this.p[i * 3 + 1] = -50;
  },
  tick(dt) {
    if (!this.obj) return;
    const N = this.n, p = this.p, t = performance.now() / 1000;
    for (let i = 0; i < N; i++) {
      const o = i * 3;
      if (p[o + 1] < -40) { if (Math.random() < dt * 2) this.plasser(i); continue; }
      if (this.type === 'regn') { p[o + 1] -= this.v[i] * dt; p[o] += dt * 2.2; }
      else if (this.type === 'sno') { p[o + 1] -= this.v[i] * dt; p[o] += Math.sin(t * .8 + i) * dt * .5; p[o + 2] += Math.cos(t * .6 + i * .7) * dt * .3; }
      else { this.v[i] += dt * .8; p[o] += Math.cos(this.v[i] + i) * dt * .6; p[o + 2] += Math.sin(this.v[i] * 1.3 + i) * dt * .5; p[o + 1] = .4 + (1 + Math.sin(t * .7 + i)) * .7; }
      const ute = Math.abs(p[o] - R.camT.x) < 16 && Math.abs(p[o + 2] - R.camT.z) < 13;
      if (!ute || p[o + 1] < 0) {
        if (this.type === 'regn' && p[o + 1] < 0 && (this.ripT -= .02) < 0 && G.F && G.F.tiles[Math.floor(p[o + 2]) * G.F.W + Math.floor(p[o])]) { this.ripT = .25; R.ripple(p[o], p[o + 2]); }
        this.plasser(i);
      }
      if (this.type === 'regn') { const a = i * 6; this.pos[a] = p[o]; this.pos[a + 1] = p[o + 1]; this.pos[a + 2] = p[o + 2]; this.pos[a + 3] = p[o] - .12; this.pos[a + 4] = p[o + 1] + .55; this.pos[a + 5] = p[o + 2]; }
      else { this.pos[o] = p[o]; this.pos[o + 1] = p[o + 1]; this.pos[o + 2] = p[o + 2]; if (this.farge) { const b = .35 + .65 * Math.max(0, Math.sin(t * 2.3 + i * 1.7)); this.farge[o] = .8 * b; this.farge[o + 1] = 1 * b; this.farge[o + 2] = .35 * b; } }
    }
    this.obj.geometry.attributes.position.needsUpdate = true; if (this.farge) this.obj.geometry.attributes.color.needsUpdate = true;
  }
};

/* ---------- gulvet under føttene (brukes av spilleren: myr og is) ---------- */
function gulvUnder(x, z) { const F = G.F; if (!F) return null; const tx = Math.floor(x), tz = Math.floor(z); if (tx < 0 || tz < 0 || tx >= F.W || tz >= F.H) return null; const i = tz * F.W + tx; if (!F.tiles[i]) return null; const rid = F.roomId[i]; return rid >= 0 ? F.rooms[rid].gulv : F.korridor ? F.korridor.gulv : null; }

/* ---------- utgangene: hvert forsøk på å komme seg ut fører lenger inn ---------- */
const UTGANGER = {
  1: { k: 'porten', tekst: 'Prøv å rømme gjennom porten', toast: ['Porten står åpen', 'Den var ikke låst. Den har aldri vært låst.'], ankomst: 'Du gikk ut porten. Du våknet i mottaket.' },
  2: { k: 'vindu', tekst: 'Klatre ut vinduet', toast: ['Et vindu står åpent', 'Det lukter natt og syrin der ute.'], ankomst: 'Du klatret ut vinduet. Du landet i underetasjen.' },
  3: { k: 'kloakk', tekst: 'Kryp ned i kloakken', toast: ['Kloakkristen er løs', 'Den fører ut i sjøen, sier de.'], ankomst: 'Kloakken førte ikke til sjøen. Den førte til kjelleren.' },
  4: { k: 'kullsjakt', tekst: 'Klatre opp kullsjakta', toast: ['Kullsjakta står åpen', 'Det er lys der oppe.'], ankomst: 'Du klatret mot lyset. Det var månen, under grunnmuren.' },
  5: { k: 'sti', tekst: 'Følg stien ut av skogen', toast: ['En sti ut av skogen', 'Noen har satt opp et skilt: UTGANG.'], ankomst: 'Stien gikk i ring. Den gikk ned.' },
  6: { k: 'utgang', tekst: 'Gå ut av bygget', toast: ['Utgangen er åpen', 'Gå til døra for å bli skrevet ut'] }
};

/* ---------- lys fra de nye tingene, og ute blir rommene lyst av månen, ikke av taklamper ---------- */
{ const _sp = spawnProps; spawnProps = function () {
  _sp();
  const LYS = { lyktestolpe: [4.4, '#ffd8a0', .72, .6], baal: [5, '#ff9a4a', .85, .3], kjele: [3.4, '#ff7a3a', .6, .9], vedovn: [3, '#ff8a4a', .55, .6], spole: [2.8, '#9ad8ff', .45, 1.2], lysskjerm: [1.8, '#e8f0ff', .4, 1], kjempeplante: [1.4, '#ffd84a', .25, 1.4] };
  for (const o of G.props) { const L = LYS[o.kind]; if (!L || o.light) continue; o.light = R.light(o.x, o.z + .3, L[0], L[1], L[2], R.levelL); o.light.userData.y = L[3]; o.lysBase = L[2]; if (o.kind === 'baal' || o.kind === 'spole') o.flakker = true; }
}; }
{ const _dl = decorateLevel; decorateLevel = function () {
  _dl();
  const F = G.F; if (!F) return;
  try { if (F.ute) Landskap.traer(F); Vaer.start(F); } catch (e) { console.warn('uteområdene feilet', e); }
}; }
{ const _cf = clearFloor; clearFloor = function () { Vaer.stopp(); _cf(); }; }
/* hvert bilde: været og bål som flakker (kalles fra loop i 30_game.js) */
const Romtyper = {
  tick(dt) {
    Vaer.tick(dt);
    for (const o of G.props || []) if (o.flakker && o.light && o.alive !== false) { o.flakT = (o.flakT || 0) - dt; if (o.flakT <= 0) { o.flakT = rnd(.05, .14); R.setLight(o.light, o.lysBase * (o.kind === 'spole' && Math.random() < .3 ? .2 : rnd(.78, 1.12))); } }
  }
};
