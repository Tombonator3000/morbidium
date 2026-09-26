/* ============================================================
   MERKNADER OG SLUTTEN  -  det som bygger seg opp mellom pasientene.
   Merknader i arkivet gis for ting pasientene har gjort, og hver åpner
   noe nytt: kuriositeter som ikke fantes før, nye steder å våkne, og
   etter første utskrivning gjeninnleggelse (vanskeligere løp, mer lønn).
   Her ligger også utskrivningsbrevet som avslutter et vellykket løp.
   ============================================================ */
const MERKNADER = {
  dod1: { navn: 'Innlagt for godt', krav: 'Dø for første gang.', gir: 'Kuriositeten Knust speil kan dukke opp.', kur: ['speil'] },
  plyndrer: { navn: 'Gravrøver', krav: 'Ta tennene fra et lik.', gir: 'Kuriositeten Fanget tannfe kan dukke opp.', kur: ['tannfe'] },
  krok: { navn: 'Kirurgen er behandlet', krav: 'Behandle overlege Hektor Krok.', gir: 'Kuriositeten Lommekirurgi kan dukke opp.', kur: ['lommekirurgi'] },
  rust: { navn: 'Tørrlagt', krav: 'Behandle hydroterapeut Ragnvald Rust.', gir: 'Nytt sted å våkne: Kapellet.' },
  arkivar: { navn: 'Arkivert', krav: 'Behandle overarkivar Gunhild Paragraf.', gir: 'Kuriositeten Hodeskalle med stearinlys kan dukke opp.', kur: ['hodeskalle'] },
  utskrevet: { navn: 'Frisk nok', krav: 'Bli utskrevet fra bunnen av bygget.', gir: 'Gjeninnleggelse: vanskeligere løp med mer lønn.' },
  drap100: { navn: 'Personalet teller', krav: 'Slå 100 fiender til sammen.', gir: 'Kuriositeten Ukontrollert celledeling kan dukke opp.', kur: ['celledeling'] },
  mester5: { navn: 'Mesterknuser', krav: 'Slå fem mestere til sammen.', gir: 'Kuriositeten Svulsten Sverre kan dukke opp.', kur: ['svulstvenn'] },
  tenner: { navn: 'Gulltannfeen', krav: 'Ha 150 gulltenner på en gang.', gir: 'Nytt sted å våkne: Vaktmesterens bod.' },
  diag3: { navn: 'Et medisinsk mysterium', krav: 'Få tre diagnoser i samme løp.', gir: 'Kuriositeten Hjerte på glass kan dukke opp.', kur: ['hjerte_i_glass'] },
  forvandling: { navn: 'Noe annet nå', krav: 'Gjennomgå en forvandling.', gir: 'Kuriositeten Altfor lang kappe kan dukke opp.', kur: ['kappe_lang'] },
  morb: { navn: 'Helt mørk', krav: 'Nå 100 Morbidium i blodet.', gir: 'Kuriositeten Dikt om mørket kan dukke opp.', kur: ['dikt'] },
  fragmenter: { navn: 'Arkivar i sjel', krav: 'Finn alle journalfragmentene.', gir: 'Hele historien. Og Journalens takknemlighet.' },
  rask: { navn: 'Hastebehandling', krav: 'Bli utskrevet på under 30 minutter.', gir: 'Æren, og et rødt stempel.' },
  gjen: { navn: 'Gjengangeren', krav: 'Bli utskrevet etter gjeninnleggelse.', gir: 'Æren, og et enda rødere stempel.' }
};
const Merknad = {
  nye: [],
  har(id) { return !!((G.meta && G.meta.merk) || {})[id]; },
  kortHtml() { return this.nye.length ? `<div class="nymerk">${this.nye.map(id => `<div><b>Merknad: ${esc(MERKNADER[id].navn)}</b><span>${esc(MERKNADER[id].gir)}</span></div>`).join('')}</div>` : ''; },
  /* kuriositeter som ennå ikke er låst opp, skal ikke dukke opp */
  laast(kur) { for (const id in MERKNADER) { const M = MERKNADER[id]; if (M.kur && M.kur.includes(kur) && !this.har(id)) return true; } return false; },
  gi(id) {
    const m = G.meta; if (!MERKNADER[id]) return; m.merk = m.merk || {}; if (m.merk[id]) return;
    m.merk[id] = Date.now(); saveMeta(); this.nye.push(id);
    // under spill stemples merknaden på skjermen; på døds- og utskrivningskortet står den på kortet i stedet
    const M = MERKNADER[id]; setTimeout(() => { if (G.state === 'play') { stampBig('MERKNAD', M.navn); toast(M.navn, M.gir); } }, 1100);
  },
  antall() { return Object.keys((G.meta && G.meta.merk) || {}).filter(k => MERKNADER[k]).length; },
  onDeath() { this.gi('dod1'); },
  onBoss(B) { const m = G.meta; (m.sjefDrap || (m.sjefDrap = {}))[B.type] = (m.sjefDrap[B.type] || 0) + 1; saveMeta(); const id = { krok: 'krok', rust: 'rust', arkivar: 'arkivar' }[B.type]; if (id) this.gi(id); },
  onWin(run) { this.gi('utskrevet'); if ((performance.now() - run.t0) / 60000 < 30) this.gi('rask'); if (run.gjen) this.gi('gjen'); },
  onKill(e) { const m = G.meta; m.drap = (m.drap || 0) + 1; (m.drapPer || (m.drapPer = {}))[e.type] = (m.drapPer[e.type] || 0) + 1; if (e.mesterNavn) m.mestere = (m.mestere || 0) + 1; if (m.drap >= 100) this.gi('drap100'); if ((m.mestere || 0) >= 5) this.gi('mester5'); },
  onLoot() { this.gi('plyndrer'); },
  onTransform() { this.gi('forvandling'); },
  onFragment() { if (G.meta.fragments.length >= LORE.length) this.gi('fragmenter'); },
  t: 0,
  tick(dt) {
    this.t -= dt; if (this.t > 0) return; this.t = 1; const P = G.player; if (!P || !P.alive) return;
    if (P.teeth >= 150) this.gi('tenner'); if (P.diag.length >= 3) this.gi('diag3'); if (P.morb >= 100) this.gi('morb');
  }
};

/* ---------- utskrivningsbrevet ---------- */
function utskrivningsbrev(onDone) {
  const r = G.run, P = G.player, p = r.patient, min = Math.max(1, Math.round((performance.now() - r.t0) / 60000));
  const diag = (P.diag || []).map(d => DIAGNOSES[d] && DIAGNOSES[d].name).filter(Boolean), kur = (r.items || []).map(i => ITEMS[i] && ITEMS[i].name).filter(Boolean), tf = (r.transforms || []).map(t => TRANSFORMS[t] && TRANSFORMS[t].name).filter(Boolean);
  const liste = a => a.length > 1 ? a.slice(0, -1).join(', ') + ' og ' + a[a.length - 1] : a[0], Bv = Historie.brev();
  const avsnitt = [
    `Etter ${min} ${min === 1 ? 'minutt' : 'minutter'} under vår omsorg, ${r.kills || 0} behandlede ansatte og ${r.rooms || 0} ryddede rom er De herved utskrevet fra Morbidium sanatorium${Bv.sl === 'gjentakelse' ? ', og innkalt på nytt fra i morgen tidlig' : ''}.`,
    Bv.samme,
    diag.length ? `Vi noterer at De under oppholdet utviklet ${liste(diag.map(d => d.toLowerCase()))}. Dette regnes fra i dag av som personlighet.` : 'De utviklet ingen diagnoser under oppholdet. Det er i seg selv mistenkelig, og er notert.',
    kur.length ? `De forlater oss med ${kur.length} ${kur.length === 1 ? 'kuriositet' : 'kuriositeter'} i lommene, blant annet ${kur[0].toLowerCase()}. Vi ber Dem returnere ${(kur[1] || kur[0]).toLowerCase()} innen fjorten dager.` : 'De forlater oss med tomme lommer, noe vaktmester Olsen ønsker å få skriftlig.',
    tf.length ? `Personalet har bedt oss nevne at De ikke lenger er helt menneskelig (${liste(tf)}). Kafeteriaen tar ikke imot Dem i denne formen.` : '',
    P.morb >= 60 ? 'Mørket i blodet Deres er fortsatt målbart. Unngå trapper som bare går ned.' : 'Blodprøvene er nesten normale. Vi har sendt dem tilbake for sikkerhets skyld.',
    Bv.avslutning
  ].filter(Boolean);
  const forste = !Merknad.har('utskrevet');
  openPanel(`<div class="fit brev paper${narrow() ? ' smal' : ''}"><div class="bhode"><b>MORBIDIUM SANATORIUM</b><span>Avdeling for oppstyrret sinn. Grunnlagt 1887.</span></div>
    <div class="bdato">24. september 1923</div><div class="btil">Til ${esc(p.name)}, pasient nr. ${p.nr}</div><h2>${esc(Bv.tittel)}</h2>
    ${avsnitt.map(a => `<p>${esc(a)}</p>`).join('')}
    <div class="bslutt"><div><div class="bhilsen">Med vennlig hilsen</div><div class="bsign">${esc(Bv.sign)}</div></div><div class="bstempel">${esc(Bv.stempel)}</div></div>
    ${Bv.egen ? '<p class="bps">P.S. Brevet er signert av pasienten selv, med forstanderens penn. Det er ikke lov. Det er gjort.</p>' : ''}
    ${forste ? '<p class="bps">P.S. De er velkommen tilbake. Gjeninnleggelse er nå mulig fra innleggelsen.</p>' : ''}
    <div class="btnrow"><button class="btn big" id="bOk">Ta imot papirene</button></div></div>`, { onBack: onDone, refit: () => { const b = document.querySelector('#panel .brev'); if (b) b.classList.toggle('smal', narrow()); fitPanel(); } });
  $('bOk').onclick = () => closePanel(); Sound.play('paper'); fitPanel();
}

/* ---------- spor etter tidligere pasienter: rablinger med kritt på gulvet ---------- */
const SPOR_TEKST = [
  h => `Ikke stol på ${((typeof sjefFor === 'function' ? sjefFor(h.depth || 1) : BOSSES[h.depth] || BOSSES[2]).name.split(' ').slice(-1)[0])}.`,
  () => 'Suppa er ikke suppe.',
  () => 'Rull. Bare rull.',
  h => `Jeg slo ${h.kills || 0}. De slo tilbake.`,
  h => h.utskrevet ? 'Det finnes en vei ut. Den går ned.' : 'Hvis du leser dette, kom jeg meg ikke ut.',
  () => 'Journalen lyver. Eller så gjør jeg det.',
  () => 'Tell tennene dine. Noen andre gjør det.',
  h => h.utskrevet ? 'Jeg ble frisk. Tror jeg.' : `${h.cause || 'Noe tok meg.'} Husk det.`
];
function sporTex(t) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 176; const g = c.getContext('2d');
  g.font = '600 62px Caveat, "Comic Sans MS", cursive'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.translate(256, 84); g.rotate(-.04); g.fillStyle = 'rgba(238,230,212,.82)'; g.fillText(t, 0, 0);
  g.strokeStyle = 'rgba(238,230,212,.55)'; g.lineWidth = 4; g.beginPath(); g.moveTo(-190, 46); g.quadraticCurveTo(0, 38, 180, 44); g.stroke();
  const tex = new THREE.CanvasTexture(c); tex.anisotropy = 4; return tex;
}
const Spor = {
  liste: [],
  onFloor() {
    this.liste = []; const H = (G.meta.historie || []).filter(h => h.name); if (!H.length || !G.F) return;
    const rom = G.F.rooms.filter(r => r.role === 'combat' || r.role === 'risk');
    for (let i = 0; i < Math.min(2, H.length) && rom.length; i++) {
      const h = pick(H), r = rom.splice(Math.floor(Math.random() * rom.length), 1)[0], s = freeSpot(r.x + 1.5 + Math.random() * (r.w - 3), r.z + 1.5 + Math.random() * (r.h - 3), 3);
      const m = new THREE.Mesh(R.plane1(), new THREE.MeshBasicMaterial({ map: sporTex(h.name.split(' ')[0].toUpperCase() + ' VAR HER'), transparent: true, depthWrite: false }));
      m.rotation.x = -Math.PI / 2; m.rotation.z = (Math.random() - .5) * .5; m.scale.set(2.7, .93, 1); m.position.set(s.x, .014, s.z); m.renderOrder = 1; R.level.add(m);
      this.liste.push({ x: s.x, z: s.z, h, tekst: pick(SPOR_TEKST)(h) });
    }
  },
  interact(consider) { const P = G.player; if (!P) return; for (const s of this.liste) consider(Math.hypot(s.x - P.x, s.z - P.z) - .5, { t: 'Les rablingen', fn: () => this.les(s) }); },
  les(s) {
    const h = s.h; Sound.play('paper');
    openPanel(`<div class="list paper" style="width:min(480px,94vw);padding:18px 22px"><div class="jtitle">Rablet på gulvet med kritt</div><p style="font-family:var(--hand);font-size:30px;line-height:1.1;margin:10px 0">«${esc(s.tekst)}»</p><p style="font-size:15px">Signert ${esc(h.name)}, pasient ${h.nr || '?'}. ${h.utskrevet ? 'Utskrevet.' : 'Døde i ' + esc(depthName(h.depth).toLowerCase()) + '.'}</p><div class="btnrow"><button class="btn" data-close>Gå videre</button></div></div>`);
  }
};

/* ---------- tips for nye pasienter: hvert tips vises én gang, som en lapp med nål ---------- */
const TIPS = {
  gaa: { kb: 'WASD eller piltastene for å gå. Musa sikter.', pad: 'Venstre spak for å gå, høyre spak sikter.', touch: 'Spaken nede til venstre for å gå.' },
  slag: { kb: 'Dørene er låst til rommet er ryddet. Klikk for å slå, hold høyre knapp for tungt slag, mellomrom for å rulle.', pad: 'Dørene er låst til rommet er ryddet. A slår, hold X for tungt slag, B ruller.', touch: 'Dørene er låst til rommet er ryddet. Slag, Tungt og Rull nede til høyre.' },
  kort: { kb: 'Tastene 1 til 4 bruker evnekortene. Tab åpner journalen.', pad: 'LB, RB, LT og RT bruker evnekortene. Select åpner journalen.', touch: 'Trykk på kortene for å bruke evnene.' },
  tjeneste: { kb: 'E for å snakke. Gulltenner er pengene her inne.', pad: 'Y for å snakke. Gulltenner er pengene her inne.', touch: 'Snakk-knappen for å handle. Gulltenner er pengene her inne.' },
  lav: { alle: 'Lite helse igjen. Kafeteriaen har suppe, og fiender slipper av og til hjerter.' },
  niva: { kb: 'Nytt nivå. Tab åpner journalen, der poengene fordeles.', pad: 'Nytt nivå. Select åpner journalen, der poengene fordeles.', touch: 'Nytt nivå. Journal-knappen oppe til høyre, der poengene fordeles.' },
  morb: { alle: 'Morbidium stiger i blodet. Over 60 kommer hikken, over 75 ser du ting som ikke er der.' },
  luke: { alle: 'Luka ned er åpen. Gå ned når du er klar. Det er ingen vei tilbake.' },
  sjef: { alle: 'En overlege. Hold avstand og rull unna de store slagene. Et rødt felt på gulvet betyr at noe kommer.' }
};
const Tips = {
  vis(id, forsink = 0) {
    const s = G.meta.settings, m = G.meta; if (!s || s.tips === false || !TIPS[id]) return; m.tips = m.tips || {}; if (m.tips[id]) return; m.tips[id] = 1; saveMeta();
    setTimeout(() => {
      const T = TIPS[id], dev = Input.lastDevice === 'touch' ? 'touch' : Input.lastDevice === 'pad' ? 'pad' : 'kb', tekst = T.alle || T[dev] || T.kb;
      let el = $('tips'); if (!el) { el = document.createElement('div'); el.id = 'tips'; $('hud').appendChild(el); }
      el.innerHTML = `<i class="nal"></i>${esc(tekst)}`; el.classList.remove('ut'); el.classList.add('inn'); Sound.play('paper', .6);
      clearTimeout(Tips.h); Tips.h = setTimeout(() => { el.classList.remove('inn'); el.classList.add('ut'); }, 7000);
    }, forsink);
  },
  t: 0,
  tick(dt) { this.t -= dt; if (this.t > 0) return; this.t = .5; const P = G.player; if (!P || !P.alive) return; if (P.hp < P.maxHp * .35) this.vis('lav'); if (P.morb >= 50) this.vis('morb'); }
};

/* ---------- byggeanimasjon: møblene i et rom spretter opp første gang pasienten nærmer seg ---------- */
const Bygg = {
  liste: [], ferdig: null,
  onFloor() {
    this.liste = []; this.ferdig = new Set(); if (R.lowTex || (G.meta.settings && G.meta.settings.simple)) { this.ferdig = null; return; }
    const start = G.F.startId;
    for (const o of G.props) { if (o.room === start || !o.g || o.p.k === 'drain' || o.p.k === 'trapdoor' || o.p.k === 'forbannet') continue; o.byggS = o.g.scale.clone(); o.g.scale.set(o.byggS.x * .001, o.byggS.y * .001, o.byggS.z); }
    this.ferdig.add(start);
  },
  tick(dt) {
    if (!this.ferdig) return; const P = G.player, F = G.F;
    if (P) for (const r of F.rooms) {
      if (this.ferdig.has(r.id)) continue; const dx = Math.max(r.x - P.x, 0, P.x - (r.x + r.w)), dz = Math.max(r.z - P.z, 0, P.z - (r.z + r.h));
      if (dx * dx + dz * dz > 36) continue; this.ferdig.add(r.id);
      for (const o of G.props) if (o.room === r.id && o.byggS) this.liste.push({ o, t: -Math.hypot(o.x - P.x, o.z - P.z) * .035 - Math.random() * .08 });
    }
    for (let i = this.liste.length - 1; i >= 0; i--) {
      const b = this.liste[i], o = b.o; b.t += dt; if (b.t < 0) continue;
      const k = Math.min(1, b.t / .38), bue = 1 + Math.sin(k * Math.PI) * .18 * (1 - k), y = k < 1 ? 1 - Math.pow(1 - k, 3) : 1;
      o.g.scale.set(o.byggS.x * (k < 1 ? .7 + .3 * y : 1) * (k < 1 ? 1 / bue : 1), o.byggS.y * Math.max(.001, y) * bue, o.byggS.z);
      if (k >= 1) { o.g.scale.copy(o.byggS); delete o.byggS; this.liste.splice(i, 1); if (Math.random() < .5) puff(o.x, o.z + .2, 1, .5); }
    }
  },
  /* alt i etasjen på plass med en gang (tester og enkel grafikk) */
  alt() { for (const o of G.props) if (o.byggS) { o.g.scale.copy(o.byggS); delete o.byggS; } this.liste = []; if (this.ferdig) for (const r of G.F.rooms) this.ferdig.add(r.id); }
};
