/* ============================================================
   MENYER  -  tittel, pause, innstillinger, pasienthåndboka og arkivet.
   Alt er papir. Innstillingene er et kartotekkort med faner, håndboka et
   hefte med kapittelfaner, arkivet et arkivskap med skuffer og mapper.
   Ingenting ruller: alt skaleres til skjermen, og det som ikke får plass, blas i.
   ============================================================ */
const SET_DEF = { vol: .7, sfx: 1, amb: 1, mus: .8, kamera: 1, shake: 1, flash: true, distort: true, lights: true, simple: false, tall: true, bobler: true, skilt: true, ui: 1, tips: true, d3: true, kvalitet: 0, blod: true, lemmer: 'tynne', kombo: true, opptak: true, vaatt: true, tv: 0, sv: 2 };
function normSettings(s) {
  const o = Object.assign({}, SET_DEF, s || {});
  if (typeof o.shake === 'boolean') o.shake = o.shake ? 1 : 0; // eldre lagring hadde av/på
  // versjon 2 (25.9.): rom i 3D er standard. Eldre lagring hadde det av, så det slås på én gang
  if (s && !(s.sv >= 2)) o.d3 = true;
  o.sv = 2; o.kvalitet = clamp(Math.round(+o.kvalitet || 0), 0, 3); o.tv = clamp(Math.round(+o.tv || 0), 0, 2);
  return o;
}
/* TV-modus (Innstillinger, Spill): 0 automatisk, 1 på, 2 av. Automatisk kjenner igjen nettleseren i TV-en (Samsung, LG, Android TV,
   Fire TV og andre). En PC på HDMI eller en speilet mobil kan ikke kjennes igjen, så der slås det på for hånd */
const TV_UA = /SMART-TV|SmartTV|Tizen|Web0S|webOS|NetCast|HbbTV|BRAVIA|VIDAA|GoogleTV|Android TV|AndroidTV|AFT[A-Z]|CrKey|Opera TV/;
const tvAuto = () => TV_UA.test(navigator.userAgent || '');
/* på TV er HUD-en og tittelen 40 prosent større, for sofaen. En TV viser 1920 x 1080 punkter; er bildet mindre, er alt allerede større.
   Taket på 1,6 holder evnekortene klar av apparatet nede til venstre */
const tvSkala = () => R.tv ? Math.max(1, 1.4 * Math.min(innerWidth / 1920, innerHeight / 1080)) : 1;
function settUi(s) { const k = tvSkala(), r = document.documentElement.style; r.setProperty('--ui', R.tv ? Math.min(1.6, s.ui * k) : s.ui); r.setProperty('--tvk', k.toFixed(3)); }
addEventListener('resize', () => { if (R.tv && G.meta && G.meta.settings) settUi(G.meta.settings); });
function applySettings() {
  // samme objekt hele tiden: panelet holder på det mens du endrer flere ting etter hverandre
  const n = normSettings(G.meta.settings), s = G.meta.settings = G.meta.settings ? Object.assign(G.meta.settings, n) : n;
  R.safe = !!s.simple; R.tv = s.tv === 1 || (!s.tv && tvAuto()); document.body.classList.toggle('tv', R.tv); Sound.setVolume(s.vol); Sound.setMix(s.sfx, s.amb, s.mus);
  R.shakeOn = s.shake > 0; R.shakeK = s.shake; R.flashOn = s.flash; R.distortOn = s.distort; R.lightsOn = s.lights;
  const v = 11.5 * s.kamera; if (Math.abs(R.view - v) > .01) { R.view = v; R.resize(); }
  settUi(s);
  D3.sett(s.d3 && !s.simple); D3.kvalitet(); STREK.tynn = s.lemmer !== 'tykke'; if (typeof Blod === 'object') Blod.sett(s.blod); if (typeof Lydbank === 'object') Lydbank.sett(s.opptak !== false); if (typeof Vaatt === 'object') Vaatt.sett(s.vaatt !== false);
  document.body.classList.toggle('uten-tall', !s.tall); document.body.classList.toggle('uten-bobler', !s.bobler); document.body.classList.toggle('uten-skilt', !s.skilt);
}
const narrow = () => innerWidth < 700 || innerWidth / innerHeight < .9;
/* papirflatene har fast størrelse og skaleres til skjermen med zoom, som også flytter layouten */
function fitPanel() {
  const el = document.querySelector('#panel .fit'); if (!el || (G.state !== 'panel' && G.state !== 'dead')) return;
  passInn(el);
}
/* skalerer en papirflate til plassen innenfor margene på panelet den ligger i. På telefon går den ikke under 75 prosent,
   så teksten kan leses og knappene treffes; blir den da høyere enn skjermen, kan panelet rulles (.screen sentrerer med auto-marger) */
function passInn(el, min = R.coarse ? .75 : 0) {
  const p = el.parentElement || document.body, cs = getComputedStyle(p), px = k => parseFloat(cs[k]) || 0;
  const aw = (p.clientWidth || innerWidth) - px('paddingLeft') - px('paddingRight') - 4, ah = (p.clientHeight || innerHeight) - px('paddingTop') - px('paddingBottom') - 4;
  el.style.zoom = 1; const W = el.offsetWidth, H = el.offsetHeight;
  el.style.zoom = Math.max(Math.min(min, aw / W), Math.min(R.tv ? 1.6 : 1.15, aw / W, ah / H)).toFixed(4); // på TV fyller menyene mer av skjermen
}
addEventListener('resize', () => { if (G.state === 'panel' && G.panelO && G.panelO.refit) G.panelO.refit(); else fitPanel(); });
function canvasOf(P, w, h, pad = .06) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; if (!P) return c;
  const g = c.getContext('2d'), s = Math.min(w * (1 - pad * 2) / P.canvas.width, h * (1 - pad * 2) / P.canvas.height);
  g.drawImage(P.canvas, (w - P.canvas.width * s) / 2, (h - P.canvas.height * s) / 2, P.canvas.width * s, P.canvas.height * s); return c;
}
function portraitOf(look, w = 110, h = 140) { const c = document.createElement('canvas'); c.width = w; c.height = h; try { drawDollPortrait(c.getContext('2d'), 'pasient', w / 2, h - 6, h * .47, look); } catch (e) { } return c; }
function place(sel, node) { const el = document.querySelector(sel); if (el && node) el.replaceWith(node); }
const depthName = d => (THEMES[d] || THEMES[1]).name.split(':')[0];

/* ---------- fullskjerm: en knapp på tittelen og i pausen der nettleseren kan det (ikke iPhone). Et trykk med A eller Enter på
   fjernkontrollen regnes som et klikk, så det virker med bare kontroll også ---------- */
const Fullskjerm = {
  kan() { return !!(document.fullscreenEnabled || document.webkitFullscreenEnabled); },
  paa() { return !!(document.fullscreenElement || document.webkitFullscreenElement); },
  tekst() { return this.paa() ? 'Avslutt fullskjerm' : 'Fullskjerm'; },
  bytt() {
    const d = document, el = d.documentElement;
    try { const r = this.paa() ? (d.exitFullscreen || d.webkitExitFullscreen).call(d) : (el.requestFullscreen || el.webkitRequestFullscreen).call(el); if (r && r.catch) r.catch(() => toast('Fikk ikke fullskjerm', 'Nettleseren sa nei. Prøv F11 eller menyen i nettleseren.')); } catch (e) { }
  },
  // knappene i menyene: data-fs, og teksten følger når fullskjerm slås av og på (også med Esc eller F11)
  knapp(kl) { return this.kan() ? `<button class="${kl}" data-fs><b>${this.tekst()}</b></button>` : ''; },
  bind() { document.querySelectorAll('[data-fs]').forEach(b => b.onclick = () => { Sound.init(); this.bytt(); }); }
};
for (const h of ['fullscreenchange', 'webkitfullscreenchange']) addEventListener(h, () => document.querySelectorAll('[data-fs] b').forEach(b => { b.textContent = Fullskjerm.tekst(); }));

/* ---------- tittelen ---------- */
function titleMenuHtml(sv) {
  const m = G.meta;
  return `<h1>MORBIDIUM</h1><div class="sub">Sanatorium for oppstyrret sinn, 1923</div>
    <div class="tmenu paper">
      <div class="tmhead"><span>Innleggelsesskjema</span><span class="nr">Nr. ${1000 + (m.deaths || 0) + (m.wins || 0)}</span></div>
      ${sv ? `<button class="tbtn gold" id="tCont"><b>Fortsett</b><small>${esc(sv.run.patient.name)}, ${esc(depthName(sv.depth))}</small></button>` : ''}
      <button class="tbtn ${sv ? '' : 'gold'}" id="tNew"><b>Ny pasient</b><small>Legg inn en ny sjel</small></button>
      <button class="tbtn" id="tHelp"><b>Pasienthåndboka</b><small>Slik overlever du oppholdet</small></button>
      <button class="tbtn" id="tArch"><b>Arkivet</b><small>${(m.historie || []).length} pasientmapper</small></button>
      <button class="tbtn" id="tSet"><b>Innstillinger</b><small>Lyd, bilde og styring</small></button>
      <div class="tstamp">${m.wins ? 'UTSKREVET ' + m.wins : m.deaths ? 'AVDØDE ' + m.deaths : 'NY'}</div>
    </div>
    <div class="meta">${m.deaths ? `${m.deaths} pasienter er skrevet ut på den ene eller andre måten. ${m.bossKills} overleger behandlet.` : 'Ingen pasienter har ennå forlatt bygningen.'}<br>Tastatur og mus, håndkontroll eller berøring.${Fullskjerm.knapp('btn fsknapp')}</div>`;
}
function bindTitleMenu(sv) {
  $('tNew').onclick = () => { Sound.init(); applySettings(); showIntake(); };
  if (sv) $('tCont').onclick = () => { Sound.init(); applySettings(); continueRun(); };
  $('tHelp').onclick = () => { Sound.init(); openHandbook({ onBack: showTitle }); };
  $('tArch').onclick = () => { Sound.init(); showArchive(); };
  $('tSet').onclick = () => { Sound.init(); openSettings(true); };
  Fullskjerm.bind();
}

/* ---------- pause ---------- */
function openPause() {
  const r = G.run, p = r && r.patient;
  openPanel(`<div class="fit clip paper"><div class="clamp"></div><div class="ptitle">Pause</div>
    ${p ? `<div class="pwho"><span id="pPort"></span><div><b>${esc(p.name)}</b><br>Pasient ${p.nr}, ${esc(depthName(G.depth))}<br><span class="svak">${G.player ? G.player.teeth : 0} gulltenner, ${r.kills || 0} fiender slått</span></div></div>` : ''}
    <div class="pmenu"><button class="tbtn gold" data-close><b>Fortsett</b></button><button class="tbtn" id="pJ"><b>Journalen</b></button>${G.player && G.seen ? '<button class="tbtn" id="pK"><b>Kartet</b></button>' : ''}<button class="tbtn" id="pH"><b>Pasienthåndboka</b></button><button class="tbtn" id="pS"><b>Innstillinger</b></button>${Fullskjerm.knapp('tbtn')}<button class="tbtn" id="pQ"><b>Avslutt til tittelen</b></button></div>
    <div class="hint">Løpet lagres ved starten av hver etasje.</div></div>`);
  if (p) { const c = portraitCanvas('pasient', r.look); c.className = 'pport'; place('#pPort', c); }
  $('pJ').onclick = () => { closePanel(); openJournal(); };
  if ($('pK')) $('pK').onclick = () => Kart.apne({ onBack: openPause });
  $('pH').onclick = () => openHandbook({ onBack: openPause });
  $('pS').onclick = () => openSettings(false, openPause);
  $('pQ').onclick = () => { closePanel(); showTitle(); };
  Fullskjerm.bind(); fitPanel();
}

/* ---------- innstillinger: kartotekkort med faner ---------- */
/* linja over kontrolltabellen: om nettleseren ser en håndkontroll. Den kommer ofte først etter et knappetrykk, så linja følger med (MenyNav.tick) */
function kontrollTekst() { const g = Input.gp; return g.connected ? 'Kontroller funnet: ' + (g.id || 'uten navn') + (g.mapping === 'standard' ? '.' : '. Nettleseren kjenner ikke oppsettet, så knappene kan ligge feil.') : 'Ingen kontroller funnet. Trykk en knapp på kontrolleren.'; }
const SET_TABS = { lyd: 'Lyd', bilde: 'Bilde', spill: 'Spill', styring: 'Styring', data: 'Data' };
const KONTROLLER = [
  ['Gå', 'W A S D eller piltastene', 'Venstre spak', 'Spaken nede til venstre'],
  ['Sikte', 'Musa', 'Høyre spak', 'Retningen du går'],
  ['Slag', 'Venstre museknapp eller J', 'A', 'Slag'],
  ['Tungt slag', 'Hold høyre museknapp eller K, slipp for å slå', 'Hold X', 'Hold Tungt'],
  ['Rull', 'Mellomrom eller venstre Shift', 'B', 'Rull'],
  ['Evnekort 1 til 4', '1 2 3 4 eller Q R T C', 'LB RB LT RT', 'Trykk på kortene'],
  ['Snakk, åpne, undersøk', 'E', 'Y', 'Snakk'],
  ['Drikk flaske', 'F eller G', 'Pil ned', 'Bruk'],
  ['Bruk apparat', 'V eller X', 'Pil opp', 'Aktiv'],
  ['Kartet', 'M eller klikk på kartet', 'Pil høyre', 'Trykk på kartet'],
  ['Journalen', 'Tab eller I', 'Select', 'Journal oppe til høyre'],
  ['Pause', 'Esc eller P', 'Start', 'Pause oppe til høyre']
];
const SET_FMT = {};
function settingsBody(tab) {
  const s = G.meta.settings, sl = (id, lab, min, max, st, v, fmt) => { SET_FMT[id] = fmt; return `<label class="srow"><span>${lab}</span><input type="range" min="${min}" max="${max}" step="${st}" value="${v}" data-s="${id}"><em>${fmt(v)}</em></label>`; };
  const cb = (id, lab, hint) => `<label class="srow cb"><input type="checkbox" data-s="${id}" ${s[id] ? 'checked' : ''}><span>${lab}${hint ? `<small>${hint}</small>` : ''}</span></label>`;
  const pct = v => Math.round(v * 100) + ' %';
  if (tab === 'lyd') return sl('vol', 'Hovedvolum', 0, 1, .05, s.vol, pct) + sl('sfx', 'Effekter', 0, 1, .05, s.sfx, pct) + sl('mus', 'Musikk', 0, 1, .05, s.mus, pct) + sl('amb', 'Stemning', 0, 1, .05, s.amb, pct) + cb('kombo', 'Kunngjører og fanfarer', 'Orgel, kor, gong og en dyp stemme når du slår mange på rad, og applaus når det går vilt for seg') + cb('opptak', 'Innspilte lyder', 'Ekte opptak av slag, dører, fottrinn, regn og instrumenter. Slå av for bare synth, som bruker mindre minne') + '<p class="shint">Musikken spilles av orgel, piano, harpe, klokker og synth, og glir over i neste stykke på slaget når du går fra rom til rom. Lydene er innspilte og fri til bruk (CC0), med synthlyder som reserve. Stemning er suset i veggene, regnet og det som knirker og drypper.</p>';
  if (tab === 'bilde') return sl('kamera', 'Kameraavstand', .8, 1.25, .05, s.kamera, v => v < .95 ? 'nær' : v > 1.05 ? 'langt unna' : 'vanlig') + sl('shake', 'Skjermristing', 0, 1, .1, s.shake, v => v ? pct(v) : 'av')
    + cb('flash', 'Hvite glimt ved store treff') + cb('distort', 'Forvrengning', 'Blekkboiling, Morbidium-bølger og hallusinasjoner') + cb('lights', 'Lys og skygge') + `<label class="srow cb"><input type="checkbox" data-s="lemmer" ${s.lemmer !== 'tykke' ? 'checked' : ''}><span>Strekarmer og strekbein<small>Tynne blekkstreker i stedet for tykke armer og bein i klesfargen</small></span></label>` + cb('d3', 'Rom i 3D', 'Ekte lys fra lampene, måneskinn gjennom vinduene, skygger, tåke og glød. Figurene og tingene er de samme tegningene.') + sl('kvalitet', 'Grafikkvalitet', 0, 3, 1, s.kvalitet, v => v ? ['', 'lav', 'middels', 'høy'][v] : 'automatisk (' + D3.Q().navn + ')') + cb('blod', 'Blod og skrekkeffekter', 'Blodsprut på gulv og vegger, kjøttbiter, blod på skjermen og ting som ser på deg fra veggene') + cb('vaatt', 'Blod og vann på skjermen', 'Dråper som treffer glasset, klistrer seg fast og renner nedover: blod når du blir truffet eller noe dør tett ved, regn ute og plask fra pytter. Blodet følger også innstillingen over') + cb('simple', 'Enkel grafikk', 'Uten etterbehandling og uten 3D. For svake eller rare skjermkort.') + '<p class="shint">Automatisk kvalitet går ned et trinn av seg selv hvis bildet hakker, og slår til slutt av 3D.</p>';
  if (tab === 'spill') return sl('ui', 'Størrelse på skjermtekst', .8, 1.3, .05, s.ui, pct) + sl('tv', 'TV-modus', 0, 2, 1, s.tv, v => ['automatisk (' + (tvAuto() ? 'på' : 'av') + ')', 'på', 'av'][v]) + cb('tall', 'Skadetall') + cb('bobler', 'Snakkebobler', 'Det fiendene og personalet sier') + cb('skilt', 'Navneskilt over mestere og personale') + cb('tips', 'Tips for nye pasienter', 'Små lapper som forklarer det viktigste første gang det skjer') + '<p class="shint">TV-modus gir større tekst og menyer, marger mot kanten av TV-en og ingen berøringsknapper. Den slås på av seg selv i nettleseren på TV-en. Spiller du fra en PC eller mobil koblet til TV-en, slår du den på her.</p>';
  if (tab === 'styring') return `<p class="shint kstatus" id="kStatus">${esc(kontrollTekst())}</p><table class="ktabell"><tr><th></th><th>Tastatur og mus</th><th>Håndkontroll</th><th>Berøring</th></tr>${KONTROLLER.map(r => `<tr><th>${r[0]}</th><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</table><p class="shint">Menyene med håndkontroll: pil eller venstre spak flytter, A velger, B går tilbake, LB og RB bytter fane. Tilbake på fjernkontrollen til TV-en er som Esc.</p>`;
  const sv = savedRun();
  return `<div class="datarad"><div><b>Lagret løp</b><small>${sv ? esc(sv.run.patient.name) + ', ' + esc(depthName(sv.depth)) : 'Ingen'}</small></div><button class="btn" id="dRun" ${sv ? '' : 'disabled'}>Slett løpet</button></div>
    <div class="datarad"><div><b>Arkivet</b><small>${G.meta.deaths} døde, ${G.meta.wins} utskrevet, ${G.meta.fragments.length} fragmenter, ${(G.meta.lik || []).length} lik i bygget</small></div><button class="btn" id="dMeta">Brenn arkivet</button></div>
    <div class="datarad"><div><b>Tipsene</b><small>${Object.keys(G.meta.tips || {}).length} av ${Object.keys(TIPS).length} er vist</small></div><button class="btn" id="dTips">Vis dem på nytt</button></div>
    <p class="shint">Alt lagres bare i denne nettleseren. Innstillingene beholdes når arkivet brennes.</p>`;
}
function openSettings(fromTitle, back, tab = 'lyd') {
  if (fromTitle) show('title', false);
  const onBack = fromTitle ? showTitle : back || null;
  openPanel(`<div class="fit kort paper${narrow() ? ' smal' : ''}" id="settings"><div class="ktabs">${Object.entries(SET_TABS).map(([k, n]) => `<button class="ktab${k === tab ? ' on' : ''}" data-tab="${k}">${n}</button>`).join('')}</div>
    <div class="kbody"><div class="khead">Innstillinger <span>${SET_TABS[tab]}</span></div>${settingsBody(tab)}</div>
    <div class="btnrow"><button class="btn big" data-close>Ferdig</button></div></div>`, onBack ? { onBack } : {});
  const s = G.meta.settings, up = () => { applySettings(); saveMeta(); };
  document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { Sound.play('paper'); openSettings(false, onBack, b.dataset.tab); });
  document.querySelectorAll('#settings [data-s]').forEach(inp => {
    const k = inp.dataset.s;
    if (inp.type === 'range') inp.oninput = () => { s[k] = +inp.value; inp.parentNode.querySelector('em').textContent = SET_FMT[k](s[k]); up(); if (k === 'tv') fitPanel(); };
    else inp.onchange = () => { s[k] = k === 'lemmer' ? (inp.checked ? 'tynne' : 'tykke') : inp.checked; up(); };
  });
  const dr = $('dRun'); if (dr) dr.onclick = () => { if (dr.dataset.ok) { clearRun(); Sound.play('slam'); openSettings(false, onBack, 'data'); } else { dr.dataset.ok = 1; dr.textContent = 'Sikker? Trykk igjen'; } };
  const dtp = $('dTips'); if (dtp) dtp.onclick = () => { G.meta.tips = {}; saveMeta(); Sound.play('paper'); openSettings(false, onBack, 'data'); };
  const dm = $('dMeta'); if (dm) dm.onclick = () => { if (dm.dataset.ok) { const keep = G.meta.settings; G.meta = blankMeta(); G.meta.settings = keep; saveMeta(); Sound.play('slam'); openSettings(false, onBack, 'data'); } else { dm.dataset.ok = 1; dm.textContent = 'Alt blir borte. Trykk igjen'; } };
  G.panelO.refit = () => openSettings(false, onBack, tab); fitPanel();
}

/* ---------- pasienthåndboka ---------- */
const HANDBOK = [
  { id: 'velkommen', t: 'Velkommen', note: 'De sier det er seks etasjer. Jeg har talt sju. Den sjuende var en skog.', art: () => portraitOf(G.run && G.player ? G.run.look : Pasient.lag(), 150, 190),
    b: `<p>Du er innlagt ved Morbidium sanatorium. Det finnes ingen vei ut, bare ned.</p>
      <p>Det er <b>seks etasjer</b>, fra parken utenfor og ned. I hver av dem holder en <b>overlege</b> til bak en låst dør. Behandle overlegen, så åpner det seg en vei ut: en port, et vindu, en kloakk. Den fører alltid lenger inn. Overlegene bytter plass fra pasient til pasient, så du vet aldri hvem som venter. Nederst, under skogen som ikke finnes, venter alltid noe som kaller seg Journalen.</p>
      <p>Dør du, er pasienten borte for godt. Neste pasient våkner et annet sted i bygget, men liket blir liggende. Løpet lagres ved starten av hver etasje, så du kan ta en pause og fortsette fra tittelen.</p>
      <p>Hver pasient er ny: annet navn, andre klær, andre evner. Du våkner aldri to ganger på samme sted.</p>` },
  // to sider: tabellen, og hvordan spillet kommer opp på TV-en (den lange utgaven står i README)
  { id: 'styring', t: 'Styring', note: 'Mellomrom redder liv. Ikke mitt, men likevel.',
    b: [() => `<table class="ktabell small"><tr><th></th><th>Tastatur og mus</th><th>Håndkontroll</th><th>Berøring</th></tr>${KONTROLLER.map(r => `<tr><th>${r[0]}</th><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</table>`,
      `<p class="hunder">Spille på TV</p>
      <p><b>Best, uten forsinkelse:</b> koble PC-en til TV-en med en HDMI-kabel og kontrolleren til PC-en. Trykk Fullskjerm på tittelen (eller F11), og slå på TV-modus under Innstillinger, Spill. Slå gjerne på spillmodus på TV-en.</p>
      <p><b>Rett i TV-en:</b> koble kontrolleren til TV-en med Bluetooth og åpne spillet i nettleseren på TV-en. Står det «Kontroller funnet» under Innstillinger, Styring, virker det. Det trengs en TV fra 2023 eller nyere.</p>
      <p><b>Trådløst:</b> Windows-tasten og K, Cast i Chrome, skjermspeiling fra iPhone eller Smart View fra en Samsung-mobil. Kontrolleren kobles til maskinen spillet kjører på. Det gir litt forsinkelse.</p>
      <p><b>I menyene:</b> pil eller venstre spak flytter, A velger, B går tilbake, og LB og RB blar. Tilbake på fjernkontrollen er som Esc.</p>`] },
  { id: 'kamp', t: 'Kamp', note: 'Tungt slag velter pleierne. De liker det ikke.', art: () => canvasOf(weaponPart('mopp'), 110, 170),
    b: `<p><b>Slag:</b> klikk eller J. Tre slag på rad blir en kombinasjon.</p>
      <p><b>Tungt slag:</b> hold inne for å lade, slipp for å slå. Det slår hardere og velter fiender.</p>
      <p><b>Rull:</b> mellomrom. Du tar ikke skade mens du ruller. Prikkene ved navnet ditt viser hvor mange rull du har, og de lades opp igjen.</p>
      <p><b>Evnekort:</b> fire plasser, tast 1 til 4. Hvert kort trenger litt tid før det kan brukes igjen.</p>
      <p>Dørene låses når fiendene ser deg, og åpnes når rommet er ryddet. Fiender med <b>navneskilt</b> er mestere med en egen egenskap, som tykk hud eller en tendens til å eksplodere. De slipper mer.</p>
      <p>I rommet med <b>frivillig risiko</b> kommer en <b>minisjef</b> til slutt, med egen helsestang. Den legger alltid igjen et preparatglass. Kapittel 9 og 10 har bilder av alt som bor i bygget.</p>` },
  { id: 'journal', t: 'Journalen', note: 'Sett kortene der de hører hjemme. Hodet vet best.', art: () => cardArtCanvas('monolog', 130),
    b: `<p>Tab åpner journalen. Erfaring fra fiender gir nye nivåer, og hvert nivå gir poeng til egenskapene:</p>
      <ul><li><b>Helse:</b> mer helse.</li><li><b>Styrke:</b> hardere slag med våpenet.</li><li><b>Smidighet:</b> raskere på beina, oftere rull.</li><li><b>Forstand:</b> sterkere evner, kortere ventetid.</li><li><b>Fatteevne:</b> flere kritiske treff, bedre priser, mindre Morbidium, mer erfaring og flere tenner.</li></ul>
      <p>Hodet er delt i fire områder: <b>Frykt, Kontroll, Uvirkelighet og Mening</b>. Et kort som ligger i sitt eget område, får en gullprikk: ett nivå ekstra og kortere ventetid. Dra kortene dit de hører hjemme.</p>
      <p>Måten du spiller på gir diagnoser. Ruller du mye, får du en. De har alltid en bakside.</p>` },
  { id: 'morbidium', t: 'Morbidium', note: 'Hører du hvisking, er det ikke meg.', art: () => canvasOf(morbPart(), 100, 130),
    b: `<p>Den lilla stripen er <b>Morbidium</b>, mørket i blodet. Det fylles av dråper, forbannelser, visse kort og visse handler.</p>
      <ul><li><b>Over 50:</b> øyne åpner seg i veggene og følger deg.</li><li><b>Over 55:</b> noe hvisker.</li><li><b>Over 60:</b> hikke som kaster deg til siden.</li><li><b>Over 70:</b> lyset slukner av og til.</li><li><b>Over 75:</b> du ser ting som ikke er der, men evnene lades 15 % raskere.</li><li><b>100:</b> mørket spiser helsa.</li></ul>
      <p>Medisinluka, vaskeriet og luktesalt renser blodet. Noen kuriositeter blir sterkere jo mer mørke du bærer.</p>` },
  { id: 'ting', t: 'Ting du finner', note: 'Den svarte pillen. Aldri den svarte pillen.', art: () => canvasOf(jarPart(null), 110, 140),
    b: `<ul><li><b>Gulltenner</b> er pengene i bygget. Fiender, kister og lik har dem.</li>
      <li><b>Preparatglass</b> inneholder kuriositeter. De varer hele løpet og stables. Tre i samme gruppe gir en forvandling, og noen par gir en synergi.</li>
      <li><b>Piller</b> har ukjent virkning til du har prøvd dem. Fargene betyr noe nytt for hver pasient.</li>
      <li><b>Flasker</b> drikkes med F. Du kan bære én.</li>
      <li><b>Apparater</b> brukes med V og lades når du rydder rom.</li>
      <li><b>Lommerusk</b> virker hele tiden. Du har plass til én ting i lomma.</li></ul>` },
  { id: 'rom', t: 'Rommene', note: 'Vaskeriet biter.', art: () => { try { return portraitCanvas('kokk'); } catch (e) { return null; } },
    b: `<ul><li><b>Kafeteriaen</b> (Fru Ruud): suppe, kaffe og levertran.</li>
      <li><b>Medisinluka</b> (Søster Hansen): full behandling, ukjente piller og rens for Morbidium.</li>
      <li><b>Vaktmesterskapet</b> (Olsen): bedre våpen.</li>
      <li><b>Journalskapet:</b> styrk og oppgrader evnekortene dine.</li>
      <li><b>Biblioteket</b> (Ask): nye evnekort og plantegninger.</li>
      <li><b>Tøyvaskeriet:</b> vask bort Morbidium, eller stikk hånden inn i trommelen.</li></ul>
      <p>En <b>sprukken vegg</b> skjuler et hemmelig rom. Slå den opp. Et <b>forbannet rom</b> koster et hjerte å gå inn i, men har noe verdt det. Ved <b>alteret</b> byr noe på handler i blod.</p>` },
  { id: 'doden', t: 'Døden', note: 'Jeg lå der i tre dager før noen tok tennene mine.', art: () => canvasOf(corpseArt(G.run && G.player ? G.run.look : Pasient.lag()), 190, 100),
    b: `<p>Når en pasient dør, blir liket liggende der det falt. Neste pasient kan finne det og ta tennene fra lommene.</p>
      <p><b>Arkivet</b> på tittelen har en mappe for hver pasient, journalfragmentene du har funnet og årsrapporten.</p>
      <p><b>Merknader</b> i arkivet gis for det pasientene får til, og hver av dem åpner noe nytt: kuriositeter som ikke fantes før, eller nye steder å våkne.</p>
      <p>Blir du utskrevet fra bunnen av bygget, er du frisk nok. Etter det kan du krysse av for <b>gjeninnleggelse</b> når du legges inn: hardere fiender, flere mestere og mer lønn.</p>` }
];
/* ---------- fiendeindeksen: bilde, hvor de finnes, hva de gjør, et råd og hvor mange du har slått ---------- */
const FIENDE_INFO = {
  pleier: ['Tung og sint, med dobbeltvakt. Slår rundt seg og stormer mot deg over rommet.', 'Rull til siden når stripen fylles. Treffer hun veggen, står hun og svaier.'],
  kultist: ['Tenåring med fire belter og et dikt. Holder avstand og kaller ned lilla ringer der du står.', 'Slå mens han poserer. Da tar han dobbel skade.'],
  oppasser: ['Stille og trøtt, med en sprøyte som flyr langt. Sikter langs en tynn linje.', 'Gå ut av linja. Han bruker tid på å sikte.'],
  yngel: ['Noe fra avløpet. Rask, svak og alltid flere. Blir friskere i lilla søl.', 'Et tungt slag feier dem unna. Hold dem borte fra Morbidium.'],
  flue: ['Kjøttflue i sverm. Svak hver for seg, men den kommer aldri alene.', 'Slag med bred bue tar mange på en gang.'],
  svulst: ['Vandrende svulst som føder fluer og spruter puss når den dør.', 'Drep den tidlig, før fluene blir for mange.'],
  lunge: ['Hostende lunge uten eier. Skyter slim i vifte.', 'Gå tett inn på den mens den harker.'],
  tvang: ['Pasient i tvangstrøye som ruller seg som en kjegle og stanger.', 'Stå foran en vegg og gå unna i siste liten. BONK.'],
  byrakrat: ['Kaster skjemaer i vifte og stempler en kølapp som holder deg fast.', 'Rull ut av den røde ringen før stempelet faller.'],
  narkose: ['Kaster eter som blir en sky på gulvet. I skyen går du tregt og sovner.', 'Ikke stå i skyen. Heliumlunge gjør deg immun.'],
  rotte: ['Arkivrotter kommer alltid tre og tre, med et skjema i munnen.', 'Ta dem før de omringer deg.'],
  oyeblomst: ['Står fast i gulvet og skyter Morbidium-kuler som følger etter deg.', 'Den kan ikke flytte seg. Kom inn fra siden og slå hardt.'],
  kasteren: ['Gammel mann i flekkete kåpe med noe i lomma. Merker hvor det lander, og kaster.', 'Flytt deg fra den brune ringen. Sølet gjør deg treg.'],
  trille: ['Knirkende rullestol som svinger tregt og kjører rett på deg. Kaster bekken.', 'Gå til siden i siste liten. Den bremser ikke for vegger heller.'],
  speil: ['Speilet viser deg. Den går i sporet ditt og slår der du nettopp var.', 'Ikke stå stille. Knuses den, får du sju års ulykke resten av etasjen.'],
  klumpunge: ['En liten del av noe større. Vil bare kose.', 'Ett godt slag holder.'],
  koret: ['Sju munner og mange ører i kormesserskjorte. Hvisker ord som gjør vondt, lager røyk og skriker i kor.', 'Rull gjennom korskriket. Hold deg ute av røyken.'],
  tannlege: ['Trekker alt som sitter løst. Kaster tenner, borer og kaster seg fram med tangen.', 'Blir du trukket, ligger tennene dine bak ham. Hent dem.'],
  portier: ['Holder døren og hodet sitt under armen. Kaster hodet, som biter og kommer tilbake.', 'Mens hodet er borte, går han i blinde. Da er det din tur.'],
  krok: ['Hekter deg inn til et kutt og svinger kjettingen rundt seg.', 'Rull sidelengs når kroken kommer, og hold avstand når han snurrer.'],
  rust: ['Fyller rommet med vann og setter strøm på. Spyler i tre strøk.', 'Stå på tørt gulv når den gule ringen kommer.'],
  arkivar: ['Stempelregn, virvler av skjemaer, og isolat der stemplene faller inni.', 'Beveg deg hele tiden, også i isolatet.'],
  klumpen: ['Alle pasientene som ble til én. Klemmer, slår med mange armer, spytter unger og ruller.', 'Kom deg ut av ringen før klemmen. Ruller den i veggen, er det din sjanse.'],
  journalen: ['Sider i spiral, blekk som blir liggende og kapitler fra sjefene du har møtt.', 'Se etter mønsteret i sidene og gå mellom dem.']
};
const FIENDE_REKKE = ['pleier', 'kultist', 'oppasser', 'yngel', 'flue', 'svulst', 'lunge', 'tvang', 'byrakrat', 'narkose', 'rotte', 'oyeblomst', 'kasteren', 'trille', 'speil', 'klumpunge'];
const SJEF_REKKE = ['koret', 'tannlege', 'portier', 'krok', 'rust', 'arkivar', 'klumpen', 'journalen'];
function fiendeNavn(t) { return (ENEMIES[t] && ENEMIES[t].name) || (SJEF_DATA[t] && SJEF_DATA[t].name) || t; }
function fiendeSted(t) {
  if (ENEMIES[t] && ENEMIES[t].mini) return 'Minisjef, oftest i rommet med frivillig risiko';
  if (SJEF_DATA[t]) return t === 'journalen' ? 'Sjef i Dypet, alltid' : 'Sjef i en av de fem første etasjene';
  if (t === 'klumpunge') return 'Der Den Store Klumpen er';
  const d = [1, 2, 3, 4, 5, 6].filter(k => (DEPTH_ENEMIES[k] || []).includes(t)), kort = { 1: 'Parken', 2: 'Mottaket', 3: 'Underetasjen', 4: 'Kjelleren', 5: 'Nattskogen', 6: 'Dypet' };
  return d.length === 6 ? 'Alle etasjene' : d.length ? d.map(k => kort[k]).join(', ') : 'Kommer når noen kaller';
}
function fiendeKort(t) {
  const I = FIENDE_INFO[t] || ['', ''], m = G.meta, n = ((m.drapPer || {})[t] || 0) + ((m.sjefDrap || {})[t] || 0);
  return `<div class="fkort"><span data-fb="${t}"></span><div class="ftekst"><div class="fnavn">${esc(fiendeNavn(t))}</div><div class="fsted">${esc(fiendeSted(t))}</div><p>${esc(I[0])}</p><p class="fraad">${esc(I[1])}</p><div class="ftall">${n ? 'Slått ' + n + (n === 1 ? ' gang' : ' ganger') : 'Ikke slått ennå'}</div></div></div>`;
}
const indeksPer = () => narrow() ? 2 : 4;
HANDBOK.push(
  { id: 'fiender', t: 'Fiendene', note: 'Kasteren sikter dårlig. Ikke dårlig nok.', indeks: FIENDE_REKKE },
  { id: 'sjefer', t: 'Overleger og minisjefer', note: 'Klumpen hilste på meg. Med sju hender.', indeks: SJEF_REKKE }
);
const hbSider = K => K.indeks ? Math.ceil(K.indeks.length / indeksPer()) : Array.isArray(K.b) ? K.b.length : 1;
function openHandbook(o = {}, kap = 0, side = 0) {
  show('title', false);
  const K = HANDBOK[kap], smal = narrow(), n = hbSider(K); side = clamp(side, 0, n - 1); const B = Array.isArray(K.b) ? K.b[side] : K.b; // et kapittel kan ha flere sider
  const alle = HANDBOK.reduce((a, h) => a + hbSider(h), 0), nr = HANDBOK.slice(0, kap).reduce((a, h) => a + hbSider(h), 0) + side + 1;
  const body = K.indeks ? `<div class="findeks">${K.indeks.slice(side * indeksPer(), side * indeksPer() + indeksPer()).map(fiendeKort).join('')}</div>`
    : `<div class="hcols"><div class="htext">${typeof B === 'function' ? B() : B}</div>${K.art ? '<div class="hart"><span id="hArt"></span><div class="hnote">' + esc(K.note) + '</div></div>' : ''}</div>${K.art ? '' : '<div class="hnote solo">' + esc(K.note) + '</div>'}`;
  openPanel(`<div class="fit hefte${smal ? ' smal' : ''}"><div class="hside"><div class="htitle">Pasient&shy;håndbok</div><div class="hsub">for innlagte ved Morbidium sanatorium<br>utgave 1923</div>
      <div class="htabs">${HANDBOK.map((h, i) => `<button class="htab${i === kap ? ' on' : ''}" data-kap="${i}"><i>${i + 1}</i>${h.t}</button>`).join('')}</div>${K.indeks && !smal ? '<div class="hnote hsidenote">' + esc(K.note) + '</div>' : ''}</div>
    <div class="hpage"><div class="hkap">Kapittel ${kap + 1}${n > 1 ? ', ' + (side + 1) + ' av ' + n : ''}</div><h2>${K.t}</h2>${body}
      <div class="hnav"><button class="btn" id="hPrev" ${nr > 1 ? '' : 'disabled'}>Forrige</button><span>Side ${nr} av ${alle}</span><button class="btn" id="hNext" ${nr < alle ? '' : 'disabled'}>Neste</button><button class="btn big" data-close>Lukk</button></div></div></div>`, Object.assign({}, o, { refit: () => openHandbook(o, kap, side) }));
  if (K.art && !K.indeks) { try { place('#hArt', K.art()); } catch (e) { } }
  document.querySelectorAll('[data-fb]').forEach(el => { try { el.replaceWith(fiendeBilde(el.dataset.fb, 132, 156)); } catch (e) { } });
  const go = (k, sd = 0) => { Sound.play('paper'); openHandbook(o, k, sd); };
  document.querySelectorAll('[data-kap]').forEach(b => b.onclick = () => go(+b.dataset.kap));
  $('hPrev').onclick = () => { if (side > 0) go(kap, side - 1); else if (kap) go(kap - 1, hbSider(HANDBOK[kap - 1]) - 1); };
  $('hNext').onclick = () => { if (side < n - 1) go(kap, side + 1); else if (kap < HANDBOK.length - 1) go(kap + 1, 0); };
  G.handbokKap = kap; G.handbokSide = side; fitPanel();
}

/* ---------- arkivet: skap med tre skuffer ---------- */
function showArchive(skuff = 'mapper', side = 0) {
  show('title', false);
  const m = G.meta, H = (m.historie || []).slice().reverse(), frags = LORE.map((f, i) => m.fragments.includes(i) ? f : null), smal = narrow();
  const MK = Object.keys(MERKNADER), per = skuff === 'mapper' ? (smal ? 4 : 8) : skuff === 'fragmenter' ? (smal ? 3 : 6) : skuff === 'merknader' ? (smal ? 6 : 15) : 1, n = skuff === 'mapper' ? H.length : skuff === 'fragmenter' ? frags.length : skuff === 'merknader' ? MK.length : 1, sider = Math.max(1, Math.ceil(n / per));
  side = Math.max(0, Math.min(side, sider - 1));
  const likIgjen = (m.lik || []).filter(l => !l.looted);
  let body = '';
  if (skuff === 'mapper') {
    const vis = H.slice(side * per, side * per + per);
    body = vis.length ? `<div class="mapper">${vis.map((h, i) => { const lik = likIgjen.find(l => l.name === h.name && l.depth === h.depth);
      return `<div class="mappe ${h.utskrevet ? 'ut' : 'dod'}"><div class="mfane">Nr. ${h.nr || '?'}</div><span data-mp="${i}"></span><div class="mnavn">${esc(h.name)}</div><div class="minfo">${h.age ? h.age + ' år, ' : ''}kom til ${esc(depthName(h.depth).toLowerCase())}</div><div class="maarsak">${esc(h.cause || '')}</div>${h.drom && h.drom.tekst ? `<div class="mdrom" title="${esc(h.drom.tekst)}">${esc(h.drom.tekst)}</div>` : ''}<div class="mtall">${h.kills || 0} slått, ${h.rooms || 0} rom</div><div class="mstempel">${h.utskrevet ? 'UTSKREVET' : 'AVDØD'}</div>${lik ? `<div class="mlapp">Liket ligger fortsatt i ${esc(depthName(lik.depth).toLowerCase())}</div>` : ''}</div>`; }).join('')}</div>`
      : '<div class="tom">Skuffen er tom. Ingen pasienter har ennå fått sin mappe.</div>';
  } else if (skuff === 'fragmenter') {
    body = `<div class="frags">${frags.slice(side * per, side * per + per).map((f, i) => f ? `<div class="frag"><div class="binders"></div><b>${esc(f.t)}</b><p>${esc(f.b)}</p></div>` : `<div class="frag mangler"><b>Fragment ${side * per + i + 1}</b><p>Mangler. Det ligger på en lesepult et sted i bygget.</p></div>`).join('')}</div>`;
  } else if (skuff === 'merknader') {
    body = `<div class="merker">${MK.slice(side * per, side * per + per).map(k => { const M = MERKNADER[k], ok = Merknad.har(k); return `<div class="merke ${ok ? 'ok' : ''}"><b>${esc(M.navn)}</b><div class="mk">${esc(M.krav)}</div><div class="mg">${ok ? esc(M.gir) : 'Gir noe når den er fortjent.'}</div>${ok ? '<div class="mst">NOTERT</div>' : ''}</div>`; }).join('')}</div>`;
  } else {
    const dyp = H.reduce((a, h) => Math.max(a, h.depth || 1), 0), slatt = H.reduce((a, h) => a + (h.kills || 0), 0), aarsak = {};
    for (const h of H) if (!h.utskrevet && h.cause) aarsak[h.cause] = (aarsak[h.cause] || 0) + 1;
    const vanlig = Object.entries(aarsak).sort((a, b) => b[1] - a[1])[0];
    body = `<div class="rapport"><div class="rhead">Årsrapport for Morbidium sanatorium</div>
      <div class="rgrid"><div><b>${m.deaths}</b>døde</div><div><b>${m.wins}</b>utskrevet</div><div><b>${m.bossKills}</b>overleger behandlet</div><div><b>${dyp ? depthName(dyp) : 'ingen'}</b>dypeste etasje</div><div><b>${slatt}</b>fiender slått</div><div><b>${m.fragments.length} av ${LORE.length}</b>fragmenter</div></div>
      ${vanlig ? `<p>Vanligste dødsårsak: <b>${esc(vanlig[0])}</b> (${vanlig[1]} ${vanlig[1] === 1 ? 'gang' : 'ganger'}).</p>` : ''}
      <p>Steder å våkne: ${Object.entries(AWAKENINGS).map(([k, a]) => unlocked(k) ? `<span class="ok">${esc(a.name)}</span>` : `<span class="laast">låst</span>`).join(' ')}</p>
      ${likIgjen.length ? `<p>Lik som fortsatt ligger i bygget: ${likIgjen.map(l => esc(l.name) + ' (' + esc(depthName(l.depth).toLowerCase()) + ')').join(', ')}.</p>` : '<p>Ingen lik ligger igjen i bygget. Noen har vært grundige.</p>'}
      <div class="rsign">Overlegen</div></div>`;
  }
  openPanel(`<div class="fit skap${smal ? ' smal' : ''}"><div class="skhead">Arkivet</div>
    <div class="skuffer">${[['mapper', 'Pasientmapper', H.length], ['fragmenter', 'Journalfragmenter', m.fragments.length + ' av ' + LORE.length], ['merknader', 'Merknader', Merknad.antall() + ' av ' + Object.keys(MERKNADER).length], ['rapport', 'Årsrapport', '1923']].map(([k, n, t]) => `<button class="skuff${k === skuff ? ' on' : ''}" data-sk="${k}"><span class="skilt">${n}<small>${t}</small></span><i class="grep"></i></button>`).join('')}</div>
    <div class="skinn">${body}</div>
    <div class="hnav">${sider > 1 ? `<button class="btn" id="aPrev" ${side ? '' : 'disabled'}>Forrige</button><span>Side ${side + 1} av ${sider}</span><button class="btn" id="aNext" ${side < sider - 1 ? '' : 'disabled'}>Neste</button>` : ''}<button class="btn big" data-close>Tilbake</button></div></div>`, { onBack: showTitle, refit: () => showArchive(skuff, side) });
  if (skuff === 'mapper') H.slice(side * per, side * per + per).forEach((h, i) => place(`[data-mp="${i}"]`, portraitOf(h.look, 84, 104)));
  const go = (k, s) => { Sound.play('paper'); showArchive(k, s); };
  document.querySelectorAll('[data-sk]').forEach(b => b.onclick = () => go(b.dataset.sk, 0));
  if ($('aPrev')) { $('aPrev').onclick = () => go(skuff, side - 1); $('aNext').onclick = () => go(skuff, side + 1); }
  fitPanel();
}

/* ---------- menyene med håndkontroll og piltaster ----------
   Én navigator for tittelen, panelene, journalen, døden og testpanelet. Pil, D-pad eller venstre spak flytter fokus til
   nærmeste knapp i den retningen (ingen runde: kanten er kanten), A trykker, B går tilbake, LB og RB blar i faner og sider,
   og høyre spak ruller panelet. Løkka kaller tick bare utenfor spillet, så styringen i spillet er som før.
   Nettleseren viser ikke :focus-visible når skriptet flytter fokus etter en håndkontroll, så body.pad gir fokusringen. */
const MENY_SEL = 'button:not([disabled]),input:not([disabled]),textarea,select,a[href],[tabindex="0"]';
const MenyNav = {
  r: '', rT: 0, stum: false, ro: 0, gt: null, padT: -1e9,
  rot() {
    if (typeof Testmodus === 'object' && Testmodus.apen) return $('testpanel');
    const s = G.state, id = s === 'journal' ? 'journal' : s === 'panel' || s === 'dead' ? 'panel' : s === 'title' ? 'title' : '', el = id && $(id);
    return el && !el.classList.contains('hidden') ? el : null;
  },
  synlig(el) { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'; },
  valg(rot) { return [...rot.querySelectorAll(MENY_SEL)].filter(el => this.synlig(el)); },
  inne(rot) { const f = document.activeElement; return !!f && f !== rot && rot.contains(f); },
  // første knapp (i journalen det første kortet), men aldri et tekstfelt: det ville åpnet tastaturet på telefonen
  forste(rot) { const L = this.valg(rot).filter(e => e.tagName !== 'TEXTAREA' && !(e.tagName === 'INPUT' && !/range|checkbox|radio/.test(e.type))), el = L.find(e => e.matches('.jcard[data-ref]')) || L[0]; if (el) el.focus({ preventScroll: true }); },
  // en knapp som tegnes på nytt (fanen, Neste, kortet som ble flyttet), finnes igjen på id eller data-feltene sine
  nokkel(el) {
    if (el.id) return '#' + CSS.escape(el.id);
    const a = [...el.attributes].filter(x => x.name.startsWith('data-') && x.name !== 'data-bound');
    return a.length ? el.tagName.toLowerCase() + a.map(x => `[${x.name}="${CSS.escape(x.value)}"]`).join('') : null;
  },
  igjen(k) {
    const rot = this.rot(); if (!rot || !k || this.inne(rot)) return;
    const el = rot.querySelector(k), m = el && (el.matches(MENY_SEL) ? el : el.querySelector(MENY_SEL)); if (m && this.synlig(m)) m.focus({ preventScroll: true });
  },
  retning() {
    const g = Input.gp; if (!g.connected) return '';
    if (g.cur[12]) return 'u'; if (g.cur[13]) return 'd'; if (g.cur[14]) return 'l'; if (g.cur[15]) return 'r';
    const x = g.lx, y = g.ly; if (Math.max(Math.abs(x), Math.abs(y)) < .6) return '';
    return Math.abs(x) > Math.abs(y) ? (x > 0 ? 'r' : 'l') : (y > 0 ? 'd' : 'u');
  },
  /* nærmeste knapp i retningen: avstanden fram til kanten, pluss hvor langt den ligger ved siden av (0 når de overlapper).
     Den må nå lenger enn denne i den retningen, så en fane som er litt lavere enn den valgte, ikke regnes som «ned».
     Et kryss eller en spak i en rad regnes som hele raden, så opp og ned går rad for rad i innstillingene */
  flytt(rot, r, pad) {
    if (pad) this.padT = performance.now();
    const f = document.activeElement; if (!this.inne(rot)) { this.forste(rot); return; }
    if (f.matches('input[type=range]') && (r === 'l' || r === 'r')) { r === 'r' ? f.stepUp() : f.stepDown(); f.dispatchEvent(new Event('input', { bubbles: true })); Sound.play('ui', .3); return; }
    const flate = el => ((el.tagName === 'INPUT' && el.closest('label')) || el).getBoundingClientRect();
    const a = flate(f), dx = r === 'l' ? -1 : r === 'r' ? 1 : 0, dy = r === 'u' ? -1 : r === 'd' ? 1 : 0, ax = a.left + a.width / 2, ay = a.top + a.height / 2;
    let best = null, bs = 1e9;
    for (const el of this.valg(rot)) {
      if (el === f || el.contains(f)) continue;
      const b = flate(el), bx = b.left + b.width / 2, by = b.top + b.height / 2;
      if ((bx - ax) * dx + (by - ay) * dy <= 1 || (dx > 0 ? b.right - a.right : dx < 0 ? a.left - b.left : dy > 0 ? b.bottom - a.bottom : a.top - b.top) <= 1) continue;
      const fram = dx ? Math.max(0, dx > 0 ? b.left - a.right : a.left - b.right) : Math.max(0, dy > 0 ? b.top - a.bottom : a.top - b.bottom);
      const tvers = dx ? Math.max(0, b.top - a.bottom, a.top - b.bottom) : Math.max(0, b.left - a.right, a.left - b.right);
      const on = el.classList.contains('on'), sk = fram + tvers * (dx ? 4 : 2) + (on ? -2 : Math.abs(dx ? by - ay : bx - ax) * .05); // tilbake til faneraden: den valgte fanen
      if (sk < bs) { bs = sk; best = el; }
    }
    if (!best) return;
    best.focus({ preventScroll: true }); best.scrollIntoView({ block: 'nearest', inline: 'nearest' }); Sound.play('ui', .4);
  },
  trykk(rot) {
    if (!this.inne(rot)) { this.forste(rot); return; }
    const el = document.activeElement, k = this.nokkel(el); Sound.init();
    if (el.matches('input[type=range]')) return;
    // journalkortene velges med Enter (bindCards). Hendelsen bobler ikke, så Input tror ikke at det var tastaturet
    if (el.matches('.jcard[data-ref]')) el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', cancelable: true }));
    else el.click();
    this.igjen(k);
  },
  // LB og RB: sidene i håndboka, ellers fanene i innstillingene, skuffene i arkivet og fanene i journalen
  fane(rot, d) {
    let el = rot.querySelector(d > 0 ? '#hNext' : '#hPrev'); if (el && el.disabled) return;
    if (!el) for (const s of ['.ktab', '.skuff', '#journal .tab']) { const L = [...rot.querySelectorAll(s)]; if (!L.length) continue; el = L[L.findIndex(b => b.classList.contains('on')) + d]; break; }
    if (!el) return; Sound.init(); const k = this.nokkel(el); el.click(); this.igjen(k);
  },
  /* true når menyen tok imot trykket, så løkka ikke lukker panelet i tillegg */
  tick(dt, A) {
    const ks = $('kStatus'); if (ks) { const t = kontrollTekst(); if (ks.textContent !== t) ks.textContent = t; }
    const rot = this.rot(); if (!rot) return false;
    const P = Input, g = P.gp, pad = g.connected, test = rot.id === 'testpanel';
    // rett fra spillet: en A som ble holdt eller hamret på i kampen, trykker ikke på noe før det har gått et halvt sekund,
    // og en retning som holdes inne, må slippes først (G.time går bare i spillet)
    if (G.time !== this.gt) { this.gt = G.time; this.ro = P.gpDown(0) || performance.now() - g.aT < 450 ? .5 : 0; this.stum = true; }
    this.ro -= dt;
    if (P.lastDevice === 'pad' && !this.inne(rot)) this.forste(rot);
    if (!pad) return test;
    const r = this.retning(); if (!r) this.stum = false;
    if (r !== this.r) { this.r = r; this.rT = 0; if (r && !this.stum) this.flytt(rot, r, true); }
    else if (r && !this.stum) { this.rT += dt; if (this.rT >= .35) { this.rT -= .12; this.flytt(rot, r, true); } }
    if (Math.abs(g.ry) > .25 && rot.scrollHeight > rot.clientHeight) rot.scrollTop += g.ry * 900 * dt;
    if (P.gpPressed(4) || P.gpPressed(5)) this.fane(rot, P.gpPressed(5) ? 1 : -1);
    if (P.gpPressed(0)) { if (this.ro <= 0) this.trykk(rot); return true; }
    if (test && (P.gpPressed(1) || P.gpPressed(9))) { Testmodus.lukk(); return true; }
    if (G.state === 'journal' && P.gpPressed(1)) { if (G.jsel) { G.jsel = null; document.querySelectorAll('#journal .jcard.sel').forEach(c => c.classList.remove('sel')); } else closeJournal(); return true; }
    return test;
  }
};
// piltastene i menyene. Tekstfelt og spakene (venstre og høyre) beholder dem, og testpanelet stopper alle taster selv
addEventListener('keydown', e => {
  const r = { ArrowUp: 'u', ArrowDown: 'd', ArrowLeft: 'l', ArrowRight: 'r' }[Input.kode(e)]; if (!r || G.state === 'play' || performance.now() - MenyNav.padT < 150) return;
  const rot = MenyNav.rot(), f = document.activeElement, t = f && f.tagName; if (!rot) return;
  if (t === 'TEXTAREA' || t === 'SELECT' || (t === 'INPUT' && f.type !== 'checkbox' && (f.type !== 'range' || r === 'l' || r === 'r'))) return;
  e.preventDefault(); MenyNav.flytt(rot, r, false);
});

/* ---------- tilbakeknappen på TV-en ----------
   Nettleseren på TV-en tar ofte selv tilbaketasten på fjernkontrollen og går en side tilbake, ut av spillet. Bare i TV-modus
   legges det derfor inn et ekstra steg i historikken når spillet er i gang. Tilbake tar det steget, og spillet gjør det Esc gjør:
   pause i spillet, lukker panelet eller journalen. Så legges steget inn igjen. På tittelen er det ikke noe steg, så der går
   tilbake ut av spillet som vanlig (slik Samsung vil ha det), og heller ikke mens spillet lastes. Kom tasten fram som et tastetrykk også,
   har den alt gjort jobben. Steget i historikken kan komme et godt stykke etter tasten når maskinen er treg, derfor 1,5 sekunder. */
const TvTilbake = {
  fanget: false, n: 0, // n: hvor mange steg tilbake som er tatt imot (til testene)
  sjekk() {
    if (!R.tv || this.fanget || !G.meta || !['play', 'panel', 'journal', 'dead'].includes(G.state)) return;
    try { history.pushState({ morbidium: 1 }, ''); this.fanget = true; } catch (e) { }
  },
  tilbake() {
    if (typeof Testmodus === 'object' && Testmodus.apen) Testmodus.lukk();
    else if (G.state === 'play') openPause();
    else if (G.state === 'panel') closePanel();
    else if (G.state === 'journal') closeJournal();
  },
  popstate() {
    if (!this.fanget) return; this.fanget = false; this.n++; if (!R.tv) return;
    if (performance.now() - Input.tilbakeT > 1500) {
      // steget var igjen fra før spilleren gikk til tittelen: da skal tilbake ut av spillet, som på tittelen ellers
      if (G.state === 'title') { history.back(); return; }
      this.tilbake();
    }
    this.sjekk();
  }
};
addEventListener('popstate', () => TvTilbake.popstate());
setInterval(() => TvTilbake.sjekk(), 250);

/* ---------- UI-settet fra ChatGPT (DESIGN_BRIEF.md, del G) ----------
   Et bilde med en ui_-nøkkel i gpt-grafikk/ tas i bruk av seg selv når spillet starter. Mangler det, tegner CSS-en som før.
   Paneler, kort, knapper, skilt og utklippstavle er 9-delte bilder: hjørnene beholder størrelsen og sidene strekkes.
   snitt er hvor mange piksler inn fra kanten hjørnet går i det behandlede bildet (128 piksler per enhet), kant er bredden på skjermen.
   Rammen får bredden sin fra border-image og går litt utenfor elementet (ut). Elementene beholder sin egen kant, bare usynlig,
   så størrelsen og innholdet står der de sto. De som ikke har kant (tom), får en usynlig kant på 1 piksel, fordi noen
   nettlesere ikke tegner border-image uten.
   Ringene legges over portrettet og kartet. Hjerter og ikoner byttes rett inn. */
const UI_SETT = {
  ui_panel: { sel: '#plate, #weapon, #cons, #akt, .dcard', tom: '#cons, #akt', snitt: 40, kant: 16, css: 'background:none; box-shadow:none;', ekstra: '#cons::before, #akt::before{ display:none; }' },
  ui_knapp: { sel: '#tools .btn', snitt: 28, kant: 11, css: 'background:none; box-shadow:none;' },
  ui_kort: { sel: '.acard', snitt: 26, kant: 9, css: 'background-color:transparent; background-image:none; box-shadow:none;' },
  ui_skilt: { sel: '#roomsign .ribbon', snitt: 30, kant: 12, css: 'background:none; box-shadow:none;', ekstra: '#roomsign .ribbon::before, #roomsign .ribbon::after{ display:none; }' },
  ui_utklipp: { sel: '.fit.clip', snitt: 64, kant: 30, css: 'background:none; box-shadow:none;', ekstra: '.fit.clip .clamp{ display:none; }' },
  ui_ring_portrett: { ring: '#medal', inn: '-16%' },
  ui_ring_kart: { ring: '#mapring', inn: '-15%', ekstra: '#mapring::after, #mapring .nord{ display:none; }' }
};
const uiBilde = k => typeof SPRITES === 'object' && SPRITES[k] ? SPRITES[k] : null;
function brukUIsett() {
  let css = ''; const brukt = [];
  for (const [k, d] of Object.entries(UI_SETT)) {
    const src = uiBilde(k); if (!src) continue; brukt.push(k);
    if (d.sel) css += `${d.sel}{ border-color:transparent; border-image:url("${src}") ${d.snitt} fill / ${d.kant}px / ${d.ut ?? Math.round(d.kant * .35)}px stretch; ${d.css || ''} }\n`;
    if (d.tom) css += `${d.tom}{ border-style:solid; border-width:1px; }\n`;
    if (d.ring) css += `${d.ring}{ border-color:transparent; box-shadow:none; } ${d.ring}::before{ content:""; position:absolute; inset:${d.inn}; background:url("${src}") center / contain no-repeat; z-index:4; pointer-events:none; }\n`;
    if (d.ekstra) css += d.ekstra + '\n';
  }
  for (const [k, id] of [['ui_ikon_journal', 'bJournal'], ['ui_ikon_pause', 'bPause']]) { const src = uiBilde(k), b = $(id); if (!src || !b) continue; brukt.push(k); const sv = b.querySelector('svg'); if (sv) { const im = document.createElement('img'); im.src = src; im.alt = ''; sv.replaceWith(im); } }
  if (css) { let st = $('uiSett'); if (!st) { st = document.createElement('style'); st.id = 'uiSett'; document.head.appendChild(st); } st.textContent = css; }
  document.body.classList.toggle('ui-sett', brukt.length > 0); brukUIsett.brukt = brukt; return brukt;
}
/* hjerter i HUD-en: bilder fra ChatGPT når alle tre finnes, ellers de tegnede */
function hjerteHtml(v, reserve) {
  const k = v >= 1 ? 'ui_hjerte_full' : v > 0 ? 'ui_hjerte_halv' : 'ui_hjerte_tom';
  if (uiBilde('ui_hjerte_full') && uiBilde('ui_hjerte_halv') && uiBilde('ui_hjerte_tom')) return `<img class="uihjerte" src="${SPRITES[k]}" alt="">`;
  return reserve(v >= 1 ? '#d8322a' : v > 0 ? '#e88a6a' : '#4a3a36');
}

