/* ============================================================
   TESTMODUS  -  måler i hjørnet, løpsrapport og «Si din mening»
   Til spilletesting på ekte maskiner. Slås på under Innstillinger, Spill («Testmodus»), eller med
   ?testmodus i adressen. Da kommer:
   - en liten måler til venstre: bilder i sekundet (nå og laveste), 3D og kvalitet, minne, lydene og musikken
   - «Si din mening» og «Testrapport» i pausemenyen, og «Testrapport» på dødsskjermen og ved utskrivningen
   - et panel med spørsmålene fra todo.md som knapper (tre valg hver, trykk igjen for å angre) og et
     felt for fritekst, og en rapport for løpet som kopieres med én knapp og limes inn til Claude:
     versjon og enhet, hver etasje (tid, drap, skade og fra hva, helse, tenner, sjefen, bilder i sekundet),
     slutten, kuriositeter og kort, lengste kombo, valgene i drømmene, ytelsen, lydene, feil og svarene.
   De fem siste rapportene lagres (G.meta.testrapporter) og kan kopieres fra Data-fanen.
   Tallene samles bare når testmodus er på, i G.run.test, som lagres med løpet.
   ============================================================ */
const MENING = [
  { fane: 'lyd', id: 'slag', sp: 'Slagene og treffene', v: ['For svake', 'Passe', 'For høye'] },
  { fane: 'lyd', id: 'fot', sp: 'Fottrinnene', v: ['For svake', 'Passe', 'For høye'] },
  { fane: 'lyd', id: 'stemning', sp: 'Stemningen (sus, regn, drypp, bål)', v: ['For svak', 'Passe', 'For sterk'] },
  { fane: 'lyd', id: 'stemmer', sp: 'Fiendene som stønner og hvisker', v: ['For svake', 'Passe', 'For høye'] },
  { fane: 'lyd', id: 'musikk', sp: 'Musikken mot lydene', v: ['For svak', 'Passe', 'For sterk'] },
  { fane: 'lyd', id: 'overgang', sp: 'Overgangene i musikken', v: ['Brå', 'Fine', 'Merker dem ikke'] },
  { fane: 'lyd', id: 'besetning', sp: 'Instrumentene passer rommene', v: ['Nei', 'Delvis', 'Ja'] },
  { fane: 'lyd', id: 'kombo', sp: 'Kombolyden (kunngjører og fanfarer)', v: ['For lite', 'Passe', 'For mye'] },
  { fane: 'bilde', id: 'blodskjerm', sp: 'Blod på skjermen', v: ['For lite', 'Passe', 'For mye'] },
  { fane: 'bilde', id: 'vann', sp: 'Vann på skjermen i regnet', v: ['Synes ikke', 'Passe', 'For mye'] },
  { fane: 'bilde', id: 'morke', sp: 'Mørket i parken og skogen', v: ['For lyst', 'Passe', 'For mørkt'] },
  { fane: 'bilde', id: 'skygger', sp: 'Lykteskygger og takstøv', v: ['For lite', 'Passe', 'For mye'] },
  { fane: 'bilde', id: 'dykk', sp: 'Kameradykket (sjef, død, store kombo)', v: ['For lite', 'Passe', 'For mye'] },
  { fane: 'bilde', id: 'strek', sp: 'Strekarmene og strekbeina', v: ['For tynne', 'Passe', 'For tykke'] },
  { fane: 'bilde', id: 'kvalitet', sp: '3D på denne maskinen', v: ['Stygt', 'Passe', 'Hakker'] },
  { fane: 'spill', id: 'vansk', sp: 'Vanskeligheten', v: ['For lett', 'Passe', 'For tungt'] },
  { fane: 'spill', id: 'lengde', sp: 'Lengden på et løp', v: ['For kort', 'Passe', 'For langt'] },
  { fane: 'spill', id: 'sjefer', sp: 'Sjefene (også Overgartneren og hjorten)', v: ['For lette', 'Passe', 'For tunge'] },
  { fane: 'spill', id: 'lyn', sp: 'Lynet i regnværet', v: ['For sjeldent', 'Passe', 'For farlig'] },
  { fane: 'spill', id: 'skygge', sp: 'Skyggen i drømmene', v: ['For treg', 'Passe', 'For rask'] },
  { fane: 'spill', id: 'styring', sp: 'Styringen og slagene', v: ['Tung', 'Grei', 'God'] },
  { fane: 'historie', id: 'tone', sp: 'Tonen i tekstene (journalsidene, forstanderen, Venterommet)', v: ['Treffer ikke', 'Delvis', 'Treffer'] },
  { fane: 'historie', id: 'tekstmengde', sp: 'Mengden tekst', v: ['For lite', 'Passe', 'For mye'] },
  { fane: 'historie', id: 'hendelser', sp: 'Hendelsene (øyet, kua, telefonen og de andre)', v: ['Kjedelige', 'Blandet', 'Morsomme'] },
  { fane: 'historie', id: 'drommer', sp: 'Drømmene mellom etasjene', v: ['Treffer ikke', 'Delvis', 'Treffer'] },
  { fane: 'historie', id: 'humor', sp: 'Humoren', v: ['For lite', 'Passe', 'For mye'] }
];
const MENING_FANER = { lyd: 'Lyd', bilde: 'Bilde', spill: 'Spill', historie: 'Historien', rapport: 'Rapport' };

const Testmodus = {
  startT: performance.now(), feil: [], apen: false, fane: 'lyd', hudT: 0, fps: { t: 0, n: 0, sist: 0, na: 0 }, forrigeT: 0,
  paa() { return !!(G.meta && G.meta.settings && G.meta.settings.testmodus); },
  sett(on) {
    let el = $('testHud');
    if (on && !el && $('hud')) { el = document.createElement('div'); el.id = 'testHud'; $('hud').appendChild(el); }
    if (el) el.classList.toggle('hidden', !on);
    if (!on && this.apen) this.lukk();
    // slås testmodus på midt i en etasje, begynner tellingen her
    if (on && G.run && G.player && G.state === 'play' && !this.naa()) this.nyEtasje(G.depth);
  },
  /* ---------- tallene for løpet (G.run.test) ---------- */
  data() {
    const run = G.run; if (!run) return null;
    if (!run.test) run.test = { v: 1, id: Date.now().toString(36) + Math.floor(Math.random() * 1e4), dato: new Date().toISOString(), etasjer: [], mening: {}, fritekst: '', fps: { n: 0, sum: 0, min: 999, under30: 0 }, kvalitet: [], lyd: null, slutt: null };
    return run.test;
  },
  naa() { const T = this.data(); return T && T.etasjer[T.etasjer.length - 1]; },
  nyEtasje(depth) {
    const T = this.data(), P = G.player; if (!T) return;
    this.lukkEtasje();
    T.etasjer.push({ d: depth, navn: G.drom ? 'Drøm, kapittel ' + (G.drom.kap || '?') : depthName(depth), drom: !!G.drom, t0: performance.now(), sek: 0, drap0: G.run.kills || 0, drap: 0, skade: {}, hel: 0, tenner0: P ? P.teeth : 0, tenner: 0, sjef: null, fps: { n: 0, sum: 0, min: 999 } });
    this.hp = P ? P.hp : 0; this.maxHp = P ? P.maxHp : 0; this.fanget = 0; this.pauseFra = 0;
  },
  lukkEtasje() {
    const E = this.naa(), P = G.player; if (!E || E.ferdig) return;
    E.sek = Math.round((performance.now() - E.t0) / 100) / 10; E.drap = (G.run.kills || 0) - E.drap0; E.tenner = P ? P.teeth - E.tenner0 : 0; E.ferdig = true;
  },
  skade(kilde, d) {
    const E = this.naa(); if (!E || !(d > 0)) return;
    const k = kilde || 'annet'; E.skade[k] = Math.round(((E.skade[k] || 0) + d) * 10) / 10;
  },
  /* ---------- per bilde ---------- */
  tick() {
    const now = performance.now(), dtr = (now - (this.forrigeT || now)) / 1000; this.forrigeT = now;
    if (!this.paa()) return;
    // bilder i sekundet, målt i hele sekunder. Hopp over etter pauser (fanen skjult) og de første sekundene i en etasje (lasting).
    const f = this.fps; f.n++; f.t += dtr;
    if (dtr > 1) { f.n = 0; f.t = 0; }
    if (f.t >= 1) {
      f.na = f.n / f.t; f.n = 0; f.t = 0; const E = this.naa(), T = this.data();
      if (T && G.state === 'play' && E && now - E.t0 > 3000) {
        for (const o of [T.fps, E.fps]) { o.n++; o.sum += f.na; o.min = Math.min(o.min, f.na); }
        if (f.na < 30) T.fps.under30++;
      }
      f.min = Math.min(f.min || 999, f.na);
    }
    const T = this.data(), P = G.player;
    if (T && P && G.state === 'play') {
      // skade som ikke gikk gjennom hurtPlayer (torner, Morbidium, blodoffer): fallet i helse denne rammen
      if (this.hp !== undefined) { const fall = this.hp - P.hp - (this.fanget || 0); if (fall > .05 && P.maxHp >= this.maxHp && P.alive) this.skade('annet', fall); }
      this.fanget = 0; this.hp = P.hp; this.maxHp = P.maxHp;
      // kvaliteten: når 3D slås av eller går ned et nivå
      const kv = D3.on ? D3.kval() : '2D', K = T.kvalitet; if (!K.length || K[K.length - 1].k !== kv) K.push({ k: kv, sek: Math.round((performance.now() - (G.run.t0 || 0)) / 1000) });
    }
    if (T && !T.lyd && typeof Lydbank === 'object' && Lydbank.totalt && Lydbank.klar + Lydbank.feil >= Lydbank.totalt) T.lyd = { klar: Lydbank.klar, totalt: Lydbank.totalt, feil: Lydbank.feil, sek: Lydbank.startT ? Math.round((performance.now() - Lydbank.startT) / 100) / 10 : null };
    this.hudT -= dtr; if (this.hudT <= 0) { this.hudT = .5; this.maaler(); }
  },
  /* måleren til venstre */
  maaler() {
    const el = $('testHud'); if (!el || el.classList.contains('hidden')) return;
    const f = this.fps, mem = performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) + ' MB' : 'ukjent';
    const lydMb = typeof Lydbank === 'object' ? Math.round(Object.values(Lydbank.buf).reduce((a, b) => a + b.length * b.numberOfChannels * 4, 0) / 1048576) : 0;
    const L = typeof Lydbank === 'object' ? Lydbank.klar + ' av ' + (Lydbank.totalt || (typeof LYD_META === 'object' ? Object.keys(LYD_META).length : 0)) : 'av';
    const M = typeof Musikk === 'object' && Musikk.S ? Musikk.navn + (Musikk.neste ? ' til ' + Musikk.neste : '') + (Musikk.bNavn ? ', ' + Musikk.bNavn : '') + (Musikk.niva ? ', ' + (Musikk.niva > 1 ? 'sjef' : 'kamp') : '') + ', fylde ' + Math.round(Musikk.glid * 100) + ' %' : 'stille';
    el.textContent = `${Math.round(f.na || 0)} b/s (laveste ${f.min && f.min < 999 ? Math.round(f.min) : '...'})\n${D3.on ? '3D ' + D3.kval() : '2D'}${R.safe ? ', enkel grafikk' : ''}\nMinne ${mem}, lyd ${lydMb} MB\nLyder ${L}\nMusikk ${M}\nDråper ${typeof Vaatt === 'object' ? Vaatt.draper.length : 0}`;
  },
  /* ---------- rapporten ---------- */
  enhet() {
    const u = navigator.userAgent, m = (re) => (u.match(re) || [])[1];
    const nett = m(/Edg\/(\d+)/) ? 'Edge ' + m(/Edg\/(\d+)/) : m(/Firefox\/(\d+)/) ? 'Firefox ' + m(/Firefox\/(\d+)/) : m(/Chrome\/(\d+)/) ? 'Chrome ' + m(/Chrome\/(\d+)/) : m(/Version\/(\d+)[^ ]* .*Safari/) ? 'Safari ' + m(/Version\/(\d+)/) : 'ukjent nettleser';
    const os = m(/Android ([\d.]+)/) ? 'Android ' + m(/Android ([\d.]+)/) : m(/(?:iPhone|CPU) OS (\d+)/) ? 'iOS ' + m(/OS (\d+)/) : /Windows/.test(u) ? 'Windows' : /Mac OS X/.test(u) ? 'macOS' : /Linux/.test(u) ? 'Linux' : 'ukjent system';
    let gpu = '';
    try { const gl = R.renderer.getContext(), x = gl.getExtension('WEBGL_debug_renderer_info'); gpu = x ? gl.getParameter(x.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER); } catch (e) { }
    return `${nett} på ${os}, ${innerWidth} x ${innerHeight} (dpr ${+(devicePixelRatio || 1).toFixed(2)}), ${R.coarse ? 'berøring' : 'mus og tastatur'}${navigator.hardwareConcurrency ? ', ' + navigator.hardwareConcurrency + ' kjerner' : ''}${navigator.deviceMemory ? ', ' + navigator.deviceMemory + ' GB' : ''}${gpu ? ', skjermkort ' + gpu : ''}${Sound.ctx ? ', lydkort ' + Sound.ctx.sampleRate + ' Hz' : ''}`;
  },
  tekst() {
    const run = G.run, T = this.data(), P = G.player; if (!run || !T) return 'Ingen løp ennå.';
    const s = G.meta.settings, sek = v => { v = Math.round(v); return v >= 60 ? Math.floor(v / 60) + ' min ' + (v % 60) + ' s' : v + ' s'; }, tall = v => String(Math.round(v * 10) / 10).replace('.', ',');
    const navn = k => k === 'annet' ? 'annet (torner, Morbidium, offer)' : k === 'boss' ? 'sjefen' : ENEMIES[k] ? ENEMIES[k].name.toLowerCase() : k;
    const pa = run.patient || {}, total = (performance.now() - (run.t0 || 0)) / 1000, L = [];
    L.push('MORBIDIUM TESTRAPPORT');
    L.push(`Versjon: ${typeof BYGG === 'object' ? BYGG.dato + (BYGG.commit ? ', ' + BYGG.commit : '') : 'ukjent'}. Rapporten laget ${new Date().toLocaleString('nb-NO')}.`);
    L.push('Enhet: ' + this.enhet() + '.');
    L.push(`Innstillinger: ${s.simple ? 'enkel grafikk' : s.d3 ? '3D ' + (['automatisk', 'lav', 'middels', 'høy'][s.kvalitet | 0]) + ' (nå ' + (D3.on ? D3.kval() : '2D') + ')' : '2D'}, volum ${Math.round(s.vol * 100)} %, effekter ${Math.round(s.sfx * 100)} %, musikk ${Math.round(s.mus * 100)} %, stemning ${Math.round(s.amb * 100)} %, innspilte lyder ${s.opptak !== false ? 'på' : 'av'}, blod ${s.blod !== false ? 'på' : 'av'}, blod og vann på skjermen ${s.vaatt !== false ? 'på' : 'av'}, forvrengning ${s.distort ? 'på' : 'av'}.`);
    L.push(`Oppstart: spillet startet ${tall(this.startT / 1000)} s etter at siden begynte å laste.` + (T.lyd ? ` Lydene: ${T.lyd.klar} av ${T.lyd.totalt} pakket ut${T.lyd.sek != null ? ' på ' + tall(T.lyd.sek) + ' s' : ''}${T.lyd.feil ? ', ' + T.lyd.feil + ' feil' : ''}.` : ''));
    L.push(`Pasient: ${pa.name || 'ukjent'}, nr. ${pa.nr || '?'}, ${pa.age || '?'} år, våknet i ${AWAKENINGS[run.awk] ? AWAKENINGS[run.awk].name.toLowerCase() : run.awk || '?'}${run.gjen ? ', gjeninnlagt' : ''}.`);
    const S = T.slutt;
    L.push('Slutt: ' + (S ? S.tekst : `løpet pågår, etasje ${G.depth} (${depthName(G.depth)}), ${sek(total)} så langt`) + '.');
    L.push('Etasjer:');
    for (const E of T.etasjer) {
      const sekE = E.ferdig ? E.sek : (performance.now() - E.t0) / 1000, drap = E.ferdig ? E.drap : (run.kills || 0) - E.drap0, tenner = E.ferdig ? E.tenner : (P ? P.teeth - E.tenner0 : 0);
      const sk = Object.entries(E.skade).sort((a, b) => b[1] - a[1]), sum = sk.reduce((a, b) => a + b[1], 0);
      let r = `  ${E.drom ? E.navn : E.d + ' ' + E.navn}: ${sek(sekE)}`;
      if (!E.drom) r += `, ${drap} drap, tok ${tall(sum)} skade${sk.length ? ' (' + sk.map(([k, v]) => navn(k) + ' ' + tall(v)).join(', ') + ')' : ''}, fikk ${tall(E.hel)} helse, ${tenner >= 0 ? '+' : ''}${tenner} tenner`;
      if (E.sjef) r += `, sjef ${E.sjef.navn}${E.sjef.sek != null ? ' behandlet på ' + sek(E.sjef.sek) : ' ikke behandlet'}`;
      if (E.fps.n) r += `, ${Math.round(E.fps.sum / E.fps.n)} b/s i snitt (laveste ${Math.round(E.fps.min)})`;
      L.push(r);
    }
    const items = (run.items || []).map(id => ITEMS[id] ? ITEMS[id].name : id), kort = (run.slots || []).concat(run.reserve || []).filter(Boolean).map(c => (ABILITIES[c.id] ? ABILITIES[c.id].name : c.id) + (c.up ? ' (' + c.up + ')' : ''));
    L.push('Kuriositeter: ' + (items.length ? items.join(', ') : 'ingen') + '.');
    L.push('Kort: ' + (kort.length ? kort.join(', ') : 'ingen') + '.');
    if (P) L.push(`Våpen: ${WEAPONS[P.weapon] ? WEAPONS[P.weapon].name : P.weapon}${P.weaponLvl > 1 ? ' nivå ' + P.weaponLvl : ''}. Nivå ${P.level || 1}. Lengste kombo: ${typeof Kombo === 'object' ? Kombo.maks : '?'}. Drap i alt: ${run.kills || 0}. Rom ryddet: ${run.rooms || 0}.`);
    const valg = run.historie && run.historie.valg ? Object.entries(run.historie.valg).map(([k, v]) => k + ' ' + v) : [];
    L.push('Drømmene: ' + (valg.length ? valg.join(', ') : 'ingen valg ennå') + '.');
    const F = T.fps, kv = T.kvalitet.map(q => q.k + (q.sek ? ' fra ' + sek(q.sek) : '')).join(', ');
    L.push(`Ytelse: ${F.n ? Math.round(F.sum / F.n) + ' b/s i snitt, laveste sekund ' + Math.round(F.min) + ', ' + F.under30 + ' s under 30 b/s' : 'ikke målt'}${kv ? '. Kvalitet: ' + kv : ''}.`);
    const feil = this.feil.filter(e => e.t >= (run.t0 || 0));
    L.push('Feil i konsollen: ' + (feil.length ? feil.map(e => e.m).join(' | ') : 'ingen') + '.');
    const svar = MENING.filter(q => T.mening[q.id] !== undefined);
    L.push('Svar' + (svar.length ? ':' : ': ingen ennå.'));
    for (const q of svar) L.push(`  ${q.sp}: ${q.v[T.mening[q.id]]}`);
    if (T.fritekst && T.fritekst.trim()) { L.push('Fritekst:'); for (const l of T.fritekst.trim().split('\n')) L.push('  ' + l); }
    return L.join('\n');
  },
  /* slutten av løpet: rapporten lagres (de fem siste) */
  slutt(tekst) {
    const T = this.data(); if (!T || !this.paa()) return;
    this.lukkEtasje(); T.slutt = { tekst }; this.lagre();
  },
  lagre() {
    const T = this.data(); if (!T || !T.slutt) return;
    const L = G.meta.testrapporter || (G.meta.testrapporter = []), i = L.findIndex(r => r.id === T.id), r = { id: T.id, t: Date.now(), tekst: this.tekst() };
    if (i >= 0) L[i] = r; else L.push(r);
    G.meta.testrapporter = L.slice(-5); saveMeta();
  },
  /* ---------- panelet: spørsmålene og rapporten ---------- */
  apne(fane = 'lyd') {
    let el = $('testpanel');
    if (!el) {
      el = document.createElement('div'); el.id = 'testpanel'; el.className = 'hidden'; document.body.appendChild(el);
      // tastene i panelet (fritekst) skal ikke styre spillet
      el.addEventListener('keydown', e => { if (e.code === 'Escape') this.lukk(); e.stopPropagation(); });
      addEventListener('keydown', e => { if (this.apen && e.code === 'Escape') { this.lukk(); e.stopPropagation(); e.preventDefault(); } }, true);
      addEventListener('resize', () => { if (this.apen) this.tilpass(); });
    }
    this.fane = fane; this.apen = true; el.classList.remove('hidden'); this.tegn();
  },
  lukk() { const el = $('testpanel'); if (el) el.classList.add('hidden'); this.apen = false; const T = this.data(); if (T && T.slutt) this.lagre(); },
  tegn() {
    const el = $('testpanel'), T = this.data() || { mening: {}, fritekst: '' }, smal = narrow();
    const kropp = this.fane === 'rapport'
      ? `<p class="shint">Kopier rapporten og lim den inn i samtalen med Claude. Svarene fra de andre fanene er med.</p>
        <label class="mfri">Fritekst: det som føltes feil, det som var morsomt, det du vil ha mer av<textarea id="mFri" rows="3">${esc(T.fritekst || '')}</textarea></label>
        <textarea id="trTekst" readonly rows="9">${esc(this.tekst())}</textarea>
        <div class="btnrow"><button class="btn big" id="tKopier">Kopier rapporten</button></div><div class="tstatus" id="tStatus"></div>`
      : MENING.filter(q => q.fane === this.fane).map(q => `<div class="mrad"><span>${q.sp}</span><div class="mvalg">${q.v.map((t, i) => `<button data-m="${q.id}" data-i="${i}" class="${T.mening[q.id] === i ? 'on' : ''}">${t}</button>`).join('')}</div></div>`).join('')
        + '<p class="shint">Trykk på det som passer. Trykk en gang til for å angre. Alt er frivillig, og svarene kommer med i rapporten.</p>';
    el.innerHTML = `<div class="kort paper${smal ? ' smal' : ''}" id="tkort"><div class="ktabs">${Object.entries(MENING_FANER).map(([k, n]) => `<button class="ktab${k === this.fane ? ' on' : ''}" data-tf="${k}">${n}</button>`).join('')}</div>
      <div class="kbody"><div class="khead">Si din mening <span>${MENING_FANER[this.fane]}</span></div>${kropp}</div>
      <div class="btnrow"><button class="btn big" id="tLukk">Ferdig</button></div></div>`;
    el.querySelectorAll('[data-tf]').forEach(b => b.onclick = () => { Sound.play('paper'); this.fane = b.dataset.tf; this.tegn(); });
    el.querySelectorAll('[data-m]').forEach(b => b.onclick = () => {
      const D = this.data(); if (!D) return; const id = b.dataset.m, i = +b.dataset.i;
      if (D.mening[id] === i) delete D.mening[id]; else D.mening[id] = i;
      Sound.play('ui'); el.querySelectorAll(`[data-m="${id}"]`).forEach(x => x.classList.toggle('on', D.mening[id] === +x.dataset.i));
    });
    const fri = $('mFri'); if (fri) fri.oninput = () => { const D = this.data(); if (D) D.fritekst = fri.value.slice(0, 4000); const tr = $('trTekst'); if (tr) tr.value = this.tekst(); };
    const k = $('tKopier'); if (k) k.onclick = () => this.kopier(this.tekst(), $('trTekst'));
    $('tLukk').onclick = () => { Sound.play('paper'); this.lukk(); };
    this.tilpass();
  },
  tilpass() { const f = $('tkort'); if (f) passInn(f); },
  /* til utklippstavla; faller tilbake på å merke teksten og kopiere den gamle måten */
  kopier(tekst, felt, status = 'tStatus') {
    const melding = (ok) => { const s = $(status); if (s) s.textContent = ok ? 'Kopiert. Lim den inn i samtalen med Claude.' : 'Fikk ikke kopiert. Merk teksten i feltet og kopier den selv.'; Sound.play(ok ? 'pickup' : 'deny'); this.kopiert = ok; };
    const gammel = () => { try { if (felt) { felt.focus(); felt.select(); } const ok = document.execCommand && document.execCommand('copy'); melding(!!ok); } catch (e) { melding(false); } };
    try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(tekst).then(() => melding(true), gammel); else gammel(); } catch (e) { gammel(); }
    this.sistKopiert = tekst;
  }
};

/* feil i konsollen tas vare på (de åtte siste), så de kommer med i rapporten */
addEventListener('error', e => { Testmodus.feil.push({ t: performance.now(), m: String(e.message || e).slice(0, 160) }); Testmodus.feil = Testmodus.feil.slice(-8); });
addEventListener('unhandledrejection', e => { Testmodus.feil.push({ t: performance.now(), m: 'løfte: ' + String(e.reason && e.reason.message || e.reason).slice(0, 150) }); Testmodus.feil = Testmodus.feil.slice(-8); });

/* ---------- koblingene ---------- */
{
  const _sf = startFloor;
  startFloor = function (...a) { const r = _sf.apply(this, a); try { if (Testmodus.paa()) Testmodus.nyEtasje(G.depth); } catch (e) { console.warn('testmodus', e); } return r; };
  const _hp = hurtPlayer;
  hurtPlayer = function (dmg, src) { const P = G.player, h0 = P ? P.hp : 0, r = _hp(dmg, src); if (P && Testmodus.paa() && P.hp < h0) { const d = h0 - Math.max(P.hp, 0); Testmodus.fanget = (Testmodus.fanget || 0) + d; Testmodus.skade(src && src.type, d); } return r; };
  const _hel = healPlayer;
  healPlayer = function (...a) { const P = G.player, h0 = P ? P.hp : 0, r = _hel.apply(this, a); if (P && Testmodus.paa() && P.hp > h0) { const E = Testmodus.naa(); if (E) E.hel = Math.round((E.hel + P.hp - h0) * 10) / 10; Testmodus.hp = P.hp; } return r; };
  const _sb = spawnBoss;
  spawnBoss = function (...a) { const B = _sb.apply(this, a); try { const E = Testmodus.naa(); if (B && E && Testmodus.paa() && !E.sjef) E.sjef = { navn: B.name, t0: performance.now(), sek: null }; } catch (e) { } return B; };
  const _bd = bossDie;
  bossDie = function (B) { const r = _bd.apply(this, arguments); try { const E = Testmodus.naa(); if (E && E.sjef && E.sjef.sek == null) E.sjef.sek = Math.round((performance.now() - E.sjef.t0) / 100) / 10; } catch (e) { } return r; };
  // døden og utskrivningen: rapporten lagres, og det kommer en knapp til den
  const knapp = () => { if (!Testmodus.paa()) return; const rad = document.querySelector('#panel .btnrow'); if (!rad || $('dTest')) return; const b = document.createElement('button'); b.className = 'btn'; b.id = 'dTest'; b.textContent = 'Testrapport'; b.onclick = () => Testmodus.apne('rapport'); rad.appendChild(b); };
  const _sd = showDeath;
  showDeath = function (...a) {
    const P = G.player, alleredeDod = G.state === 'dead', r = _sd.apply(this, a);
    if (!alleredeDod && Testmodus.paa()) { const rr = roomAt(P.x, P.z), rom = rr >= 0 && G.F ? G.F.rooms[rr] : null, E = Testmodus.naa(); Testmodus.slutt(`døde i etasje ${G.depth} (${depthName(G.depth)})${rom ? ', i rommet ' + (rom.template || rom.role) : ''}, dødsårsak «${(G.meta.lastDeath || {}).cause || '?'}» (${P.lastCause || '?'})${G.boss && G.boss.alive ? ', sjefen levde' : ''}, etter ${Math.round((performance.now() - G.run.t0) / 1000)} s` + (E && E.drom ? ', i en drøm' : '')); knapp(); }
    return r;
  };
  const _vu = visUtskrevet;
  visUtskrevet = function (...a) { const r = _vu.apply(this, a); if (Testmodus.paa()) { Testmodus.slutt(`utskrevet etter ${Math.round((performance.now() - G.run.t0) / 1000)} s, brevet «${Historie.brev().sl}»`); knapp(); } return r; };
  // pausemenyen: to knapper til når testmodus er på
  const _op = openPause;
  openPause = function (...a) {
    const r = _op.apply(this, a);
    if (Testmodus.paa()) {
      const q = $('pQ'); if (q) q.insertAdjacentHTML('beforebegin', '<button class="tbtn" id="pMening"><b>Si din mening</b><small>Spørsmål med knapper, til Claude</small></button><button class="tbtn" id="pRapport"><b>Testrapport</b><small>Kopier og lim inn til Claude</small></button>');
      const m = $('pMening'), t = $('pRapport'); if (m) m.onclick = () => Testmodus.apne('lyd'); if (t) t.onclick = () => Testmodus.apne('rapport');
      fitPanel();
    }
    return r;
  };
  // innstillingene: Testmodus under Spill, og de lagrede rapportene under Data
  const _sbd = settingsBody;
  settingsBody = function (tab) {
    let h = _sbd(tab); const s = G.meta.settings;
    if (tab === 'spill') h += `<label class="srow cb"><input type="checkbox" data-s="testmodus" ${s.testmodus ? 'checked' : ''}><span>Testmodus<small>Bilder i sekundet og minne i et hjørne, «Si din mening» og «Testrapport» i pausen, og en rapport etter hvert løp som kan kopieres og limes inn til Claude</small></span></label>`;
    if (tab === 'data') { const n = (G.meta.testrapporter || []).length; h = h.replace('<p class="shint">', `<div class="datarad"><div><b>Testrapporter</b><small>${n ? n + ' lagret, den siste fra ' + new Date(G.meta.testrapporter[n - 1].t).toLocaleString('nb-NO') : 'Ingen ennå. Slå på Testmodus under Spill.'}</small></div><button class="btn" id="dTestSist" ${n ? '' : 'disabled'}>Kopier siste</button><button class="btn" id="dTestAlle" ${n > 1 ? '' : 'disabled'}>Kopier alle</button></div><div class="tstatus" id="dTestStatus"></div><p class="shint">`); }
    return h;
  };
  const _os = openSettings;
  openSettings = function (...a) {
    const r = _os.apply(this, a), L = G.meta.testrapporter || [];
    const b1 = $('dTestSist'), b2 = $('dTestAlle');
    if (b1) b1.onclick = () => Testmodus.kopier(L[L.length - 1].tekst, null, 'dTestStatus');
    if (b2) b2.onclick = () => Testmodus.kopier(L.map(x => x.tekst).join('\n\n'), null, 'dTestStatus');
    return r;
  };
  const _as = applySettings;
  applySettings = function (...a) {
    const r = _as.apply(this, a), s = G.meta.settings;
    // ?testmodus i adressen slår den på én gang per lasting, så den fortsatt kan slås av under Spill
    if (!Testmodus.urlBrukt && /[?&#]testmodus\b/.test(location.search + location.hash)) { Testmodus.urlBrukt = true; if (!s.testmodus) { s.testmodus = true; saveMeta(); } }
    Testmodus.sett(!!s.testmodus); return r;
  };
}
