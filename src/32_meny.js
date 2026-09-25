/* ============================================================
   MENYER  -  tittel, pause, innstillinger, pasienthåndboka og arkivet.
   Alt er papir. Innstillingene er et kartotekkort med faner, håndboka et
   hefte med kapittelfaner, arkivet et arkivskap med skuffer og mapper.
   Ingenting ruller: alt skaleres til skjermen, og det som ikke får plass, blas i.
   ============================================================ */
const SET_DEF = { vol: .7, sfx: 1, amb: 1, mus: .8, kamera: 1, shake: 1, flash: true, distort: true, lights: true, simple: false, tall: true, bobler: true, skilt: true, ui: 1, tips: true, d3: true, kvalitet: 0, blod: true, lemmer: 'tynne', sv: 2 };
function normSettings(s) {
  const o = Object.assign({}, SET_DEF, s || {});
  if (typeof o.shake === 'boolean') o.shake = o.shake ? 1 : 0; // eldre lagring hadde av/på
  // versjon 2 (25.9.): rom i 3D er standard. Eldre lagring hadde det av, så det slås på én gang
  if (s && !(s.sv >= 2)) o.d3 = true;
  o.sv = 2; o.kvalitet = clamp(Math.round(+o.kvalitet || 0), 0, 3);
  return o;
}
function applySettings() {
  // samme objekt hele tiden: panelet holder på det mens du endrer flere ting etter hverandre
  const n = normSettings(G.meta.settings), s = G.meta.settings = G.meta.settings ? Object.assign(G.meta.settings, n) : n;
  R.safe = !!s.simple; Sound.setVolume(s.vol); Sound.setMix(s.sfx, s.amb, s.mus);
  R.shakeOn = s.shake > 0; R.shakeK = s.shake; R.flashOn = s.flash; R.distortOn = s.distort; R.lightsOn = s.lights;
  const v = 11.5 * s.kamera; if (Math.abs(R.view - v) > .01) { R.view = v; R.resize(); }
  document.documentElement.style.setProperty('--ui', s.ui);
  D3.sett(s.d3 && !s.simple); D3.kvalitet(); STREK.tynn = s.lemmer !== 'tykke'; if (typeof Blod === 'object') Blod.sett(s.blod);
  document.body.classList.toggle('uten-tall', !s.tall); document.body.classList.toggle('uten-bobler', !s.bobler); document.body.classList.toggle('uten-skilt', !s.skilt);
}
const narrow = () => innerWidth < 700 || innerWidth / innerHeight < .9;
/* papirflatene har fast størrelse og skaleres til skjermen med zoom, som også flytter layouten */
function fitPanel() {
  const el = document.querySelector('#panel .fit'); if (!el || G.state !== 'panel') return;
  el.style.zoom = 1; const W = el.offsetWidth, H = el.offsetHeight;
  el.style.zoom = Math.min(1.15, (innerWidth - 20) / W, (innerHeight - 20) / H).toFixed(4);
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
    <div class="meta">${m.deaths ? `${m.deaths} pasienter er skrevet ut på den ene eller andre måten. ${m.bossKills} overleger behandlet.` : 'Ingen pasienter har ennå forlatt bygningen.'}<br>Tastatur og mus, håndkontroll eller berøring.</div>`;
}
function bindTitleMenu(sv) {
  $('tNew').onclick = () => { Sound.init(); applySettings(); showIntake(); };
  if (sv) $('tCont').onclick = () => { Sound.init(); applySettings(); continueRun(); };
  $('tHelp').onclick = () => { Sound.init(); openHandbook({ onBack: showTitle }); };
  $('tArch').onclick = () => { Sound.init(); showArchive(); };
  $('tSet').onclick = () => { Sound.init(); openSettings(true); };
}

/* ---------- pause ---------- */
function openPause() {
  const r = G.run, p = r && r.patient;
  openPanel(`<div class="fit clip paper"><div class="clamp"></div><div class="ptitle">Pause</div>
    ${p ? `<div class="pwho"><span id="pPort"></span><div><b>${esc(p.name)}</b><br>Pasient ${p.nr}, ${esc(depthName(G.depth))}<br><span class="svak">${G.player ? G.player.teeth : 0} gulltenner, ${r.kills || 0} fiender slått</span></div></div>` : ''}
    <div class="pmenu"><button class="tbtn gold" data-close><b>Fortsett</b></button><button class="tbtn" id="pJ"><b>Journalen</b></button><button class="tbtn" id="pH"><b>Pasienthåndboka</b></button><button class="tbtn" id="pS"><b>Innstillinger</b></button><button class="tbtn" id="pQ"><b>Avslutt til tittelen</b></button></div>
    <div class="hint">Løpet lagres ved starten av hver etasje.</div></div>`);
  if (p) { const c = portraitCanvas('pasient', r.look); c.className = 'pport'; place('#pPort', c); }
  $('pJ').onclick = () => { closePanel(); openJournal(); };
  $('pH').onclick = () => openHandbook({ onBack: openPause });
  $('pS').onclick = () => openSettings(false, openPause);
  $('pQ').onclick = () => { closePanel(); showTitle(); };
  fitPanel();
}

/* ---------- innstillinger: kartotekkort med faner ---------- */
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
  ['Journalen', 'Tab eller I', 'Select', 'Journal oppe til høyre'],
  ['Pause', 'Esc eller P', 'Start', 'Pause oppe til høyre']
];
const SET_FMT = {};
function settingsBody(tab) {
  const s = G.meta.settings, sl = (id, lab, min, max, st, v, fmt) => { SET_FMT[id] = fmt; return `<label class="srow"><span>${lab}</span><input type="range" min="${min}" max="${max}" step="${st}" value="${v}" data-s="${id}"><em>${fmt(v)}</em></label>`; };
  const cb = (id, lab, hint) => `<label class="srow cb"><input type="checkbox" data-s="${id}" ${s[id] ? 'checked' : ''}><span>${lab}${hint ? `<small>${hint}</small>` : ''}</span></label>`;
  const pct = v => Math.round(v * 100) + ' %';
  if (tab === 'lyd') return sl('vol', 'Hovedvolum', 0, 1, .05, s.vol, pct) + sl('sfx', 'Effekter', 0, 1, .05, s.sfx, pct) + sl('mus', 'Musikk', 0, 1, .05, s.mus, pct) + sl('amb', 'Stemning', 0, 1, .05, s.amb, pct) + '<p class="shint">Både musikken og lydene lages av spillet mens du spiller, uten lydfiler. Stemning er suset i veggene og det som knirker.</p>';
  if (tab === 'bilde') return sl('kamera', 'Kameraavstand', .8, 1.25, .05, s.kamera, v => v < .95 ? 'nær' : v > 1.05 ? 'langt unna' : 'vanlig') + sl('shake', 'Skjermristing', 0, 1, .1, s.shake, v => v ? pct(v) : 'av')
    + cb('flash', 'Hvite glimt ved store treff') + cb('distort', 'Forvrengning', 'Blekkboiling, Morbidium-bølger og hallusinasjoner') + cb('lights', 'Lys og skygge') + `<label class="srow cb"><input type="checkbox" data-s="lemmer" ${s.lemmer !== 'tykke' ? 'checked' : ''}><span>Strekarmer og strekbein<small>Tynne blekkstreker i stedet for tykke armer og bein i klesfargen</small></span></label>` + cb('d3', 'Rom i 3D', 'Ekte lys fra lampene, måneskinn gjennom vinduene, skygger, tåke og glød. Figurene og tingene er de samme tegningene.') + sl('kvalitet', 'Grafikkvalitet', 0, 3, 1, s.kvalitet, v => v ? ['', 'lav', 'middels', 'høy'][v] : 'automatisk (' + D3.Q().navn + ')') + cb('blod', 'Blod og skrekkeffekter', 'Blodsprut på gulv og vegger, kjøttbiter, blod på skjermen og ting som ser på deg fra veggene') + cb('simple', 'Enkel grafikk', 'Uten etterbehandling og uten 3D. For svake eller rare skjermkort.') + '<p class="shint">Automatisk kvalitet går ned et trinn av seg selv hvis bildet hakker, og slår til slutt av 3D.</p>';
  if (tab === 'spill') return sl('ui', 'Størrelse på skjermtekst', .8, 1.3, .05, s.ui, pct) + cb('tall', 'Skadetall') + cb('bobler', 'Snakkebobler', 'Det fiendene og personalet sier') + cb('skilt', 'Navneskilt over mestere og personale') + cb('tips', 'Tips for nye pasienter', 'Små lapper som forklarer det viktigste første gang det skjer');
  if (tab === 'styring') return `<table class="ktabell"><tr><th></th><th>Tastatur og mus</th><th>Håndkontroll</th><th>Berøring</th></tr>${KONTROLLER.map(r => `<tr><th>${r[0]}</th><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</table>`;
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
    if (inp.type === 'range') inp.oninput = () => { s[k] = +inp.value; inp.parentNode.querySelector('em').textContent = SET_FMT[k](s[k]); up(); };
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
  { id: 'styring', t: 'Styring', note: 'Mellomrom redder liv. Ikke mitt, men likevel.',
    b: () => `<table class="ktabell small"><tr><th></th><th>Tastatur og mus</th><th>Håndkontroll</th><th>Berøring</th></tr>${KONTROLLER.map(r => `<tr><th>${r[0]}</th><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</table>` },
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
const hbSider = K => K.indeks ? Math.ceil(K.indeks.length / indeksPer()) : 1;
function openHandbook(o = {}, kap = 0, side = 0) {
  show('title', false);
  const K = HANDBOK[kap], smal = narrow(), n = hbSider(K); side = clamp(side, 0, n - 1);
  const alle = HANDBOK.reduce((a, h) => a + hbSider(h), 0), nr = HANDBOK.slice(0, kap).reduce((a, h) => a + hbSider(h), 0) + side + 1;
  const body = K.indeks ? `<div class="findeks">${K.indeks.slice(side * indeksPer(), side * indeksPer() + indeksPer()).map(fiendeKort).join('')}</div>`
    : `<div class="hcols"><div class="htext">${typeof K.b === 'function' ? K.b() : K.b}</div>${K.art ? '<div class="hart"><span id="hArt"></span><div class="hnote">' + esc(K.note) + '</div></div>' : ''}</div>${K.art ? '' : '<div class="hnote solo">' + esc(K.note) + '</div>'}`;
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
      return `<div class="mappe ${h.utskrevet ? 'ut' : 'dod'}"><div class="mfane">Nr. ${h.nr || '?'}</div><span data-mp="${i}"></span><div class="mnavn">${esc(h.name)}</div><div class="minfo">${h.age ? h.age + ' år, ' : ''}kom til ${esc(depthName(h.depth).toLowerCase())}</div><div class="maarsak">${esc(h.cause || '')}</div><div class="mtall">${h.kills || 0} slått, ${h.rooms || 0} rom</div><div class="mstempel">${h.utskrevet ? 'UTSKREVET' : 'AVDØD'}</div>${lik ? `<div class="mlapp">Liket ligger fortsatt i ${esc(depthName(lik.depth).toLowerCase())}</div>` : ''}</div>`; }).join('')}</div>`
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

