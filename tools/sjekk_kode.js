/* Sjekker spillkoden i src/ uten å kjøre den. Det er det vi trenger fra moduler nå, uten å bytte verktøy (punkt 7 i planen):
   1. Rekkefølgen i build.py: ingen fil bruker en const, let eller class fra en senere fil (eller lenger ned i samme fil) mens den
      lastes. Det gir «Cannot access X before initialization» når siden åpnes. Kode som kjøres mens filene lastes, er toppnivået,
      funksjoner som kalles derfra (også metoder på objekter på toppnivå), og tilbakekall til forEach, map og liknende der.
   2. Ingen navn deklareres to ganger på toppnivå (alle filene deler ett skop i bygget).
   3. Ingen ukjente navn: alt som brukes, er deklarert i en fil, i skriptet i 00_head.html, lagt inn av build.py eller kjent fra
      nettleseren (KJENT under). Fanger skrivefeil i kode som bare kjøres av og til. typeof X er alltid lov.
   4. Ingen toppnivåfunksjon settes på nytt (pakkes inn): det er en feil, fordi funksjonene har kroker (Kroker i 01_core.js) og
      fordi moduler ikke kan sette en annen fils funksjoner. Metoder på objekter som settes på nytt (Sound.play = ...), telles,
      med et tak som ikke skal øke: nye systemer bruker Kroker eller oppslag (AGENTS.md). Senk TAK når de gjøres om til kroker.
   5. Ingen fil skriver til en let eller var som er deklarert i en annen fil (en modul kan ikke det heller). Gi fila som eier
      variabelen, en funksjon som gjør det (som hudKortPaaNytt og kartPaaNytt i 30_game.js).
   Bruk: node tools/sjekk_kode.js [--liste] [--moduler] [--rot MAPPE]    --liste viser innpakningene, --moduler viser navnene
   tidligere filer bruker fra senere filer mens spillet går (med moduler blir de til sirkler i importene, se «Kodesjekken» i
   dokumentasjon/systemer.md), --rot sjekker et annet repo.
   Avslutter med kode 1 ved feil. */
'use strict';
const fs = require('fs'), path = require('path');
const acorn = require('./vendor/acorn.js');
const ROT = process.argv.includes('--rot') ? path.resolve(process.argv[process.argv.indexOf('--rot') + 1]) : path.resolve(__dirname, '..'), SRC = path.join(ROT, 'src');
const TAK = 45; // innpakninger av metoder som er igjen (28.9.2026); toppnivåfunksjoner: ingen, og det er en feil å legge til en

// nettleseren og språket: navn spillet bruker uten å deklarere dem
const KJENT = new Set(`window document navigator location history screen console performance localStorage sessionStorage globalThis self
  setTimeout clearTimeout setInterval clearInterval requestAnimationFrame cancelAnimationFrame queueMicrotask structuredClone
  fetch Image Audio AudioContext OfflineAudioContext webkitAudioContext webkitOfflineAudioContext AudioBuffer MediaQueryList matchMedia
  innerWidth innerHeight devicePixelRatio visualViewport getComputedStyle alert confirm prompt open close focus blur scrollTo
  Blob URL URLSearchParams FileReader TextEncoder TextDecoder atob btoa encodeURIComponent decodeURIComponent encodeURI decodeURI escape unescape
  HTMLElement HTMLCanvasElement HTMLImageElement Element Node Event KeyboardEvent MouseEvent PointerEvent TouchEvent CustomEvent DOMParser
  ResizeObserver MutationObserver IntersectionObserver OffscreenCanvas ImageData Path2D CanvasRenderingContext2D WebGLRenderingContext WebGL2RenderingContext
  Object Array String Number Boolean Symbol BigInt Function Date RegExp Error TypeError RangeError SyntaxError ReferenceError EvalError URIError AggregateError
  Map Set WeakMap WeakSet WeakRef Promise Proxy Reflect JSON Intl ArrayBuffer SharedArrayBuffer DataView
  Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array BigInt64Array BigUint64Array
  parseInt parseFloat isNaN isFinite NaN Infinity undefined eval arguments
  CSS THREE Gamepad speechSynthesis SpeechSynthesisUtterance Notification crypto indexedDB caches
  addEventListener removeEventListener dispatchEvent getSelection scrollX scrollY outerWidth outerHeight name`.split(/\s+/).filter(Boolean));

const parts = JSON.parse(fs.readFileSync(path.join(ROT, 'build.py'), 'utf8').match(/^parts = (\[.*\])$/m)[1].replace(/'/g, '"'));
// konstantene build.py legger inn etter en fil
const INNLAGT = { '01_core.js': ['BYGG', 'LYDFILER', 'LYD_META'], '10_art.js': ['DELER_META', 'ANIM_ARK'] };
const feil = [], varsler = [], innpakninger = [], bakover = new Map(); // bakover: 'fil -> senere fil' => navnene

/* ---------- toppnivået: hvem deklarerer hva, og i hvilken rekkefølge ---------- */
const topp = new Map(); // navn -> { fil, nr, pos, art, linje }
const filer = parts.map((fil, nr) => {
  const kilde = fs.readFileSync(path.join(SRC, fil), 'utf8');
  let ast; try { ast = acorn.parse(kilde, { ecmaVersion: 'latest', sourceType: 'script', allowReturnOutsideFunction: true, locations: true }); }
  catch (e) { feil.push(`${fil}:${e.loc ? e.loc.line : '?'}: kan ikke leses (${e.message})`); return null; }
  return { fil, nr, ast };
}).filter(Boolean);
const deklarer = (navn, d) => {
  const f = topp.get(navn);
  if (f) feil.push(`${d.fil}:${d.linje}: ${navn} er deklarert to ganger (også i ${f.fil}:${f.linje})`); else topp.set(navn, d);
};
const navnI = (p, ut = []) => { // navnene et mønster binder
  if (!p) return ut;
  if (p.type === 'Identifier') ut.push(p.name);
  else if (p.type === 'ObjectPattern') p.properties.forEach(q => navnI(q.type === 'RestElement' ? q.argument : q.value, ut));
  else if (p.type === 'ArrayPattern') p.elements.forEach(q => navnI(q, ut));
  else if (p.type === 'AssignmentPattern') navnI(p.left, ut);
  else if (p.type === 'RestElement') navnI(p.argument, ut);
  return ut;
};
for (const F of filer) {
  for (const s of F.ast.body) {
    const d = (art, n) => ({ fil: F.fil, nr: F.nr, pos: s.start, art, linje: n.loc.start.line, node: s });
    if (s.type === 'FunctionDeclaration') deklarer(s.id.name, d('function', s));
    else if (s.type === 'ClassDeclaration') deklarer(s.id.name, d('class', s));
    else if (s.type === 'VariableDeclaration') for (const v of s.declarations) for (const n of navnI(v.id)) deklarer(n, Object.assign(d(s.kind, v), { init: v.init }));
  }
  for (const n of INNLAGT[F.fil] || []) deklarer(n, { fil: F.fil, nr: F.nr, pos: Infinity, art: 'const', linje: 'bygget' });
}
// skriptet i 00_head.html ligger utenfor spillet, og det det deklarerer, er globalt
const hode = fs.readFileSync(path.join(SRC, '00_head.html'), 'utf8');
for (const m of hode.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
  try { for (const s of acorn.parse(m[1], { ecmaVersion: 'latest', sourceType: 'script' }).body) if (s.type === 'FunctionDeclaration') KJENT.add(s.id.name); else if (s.type === 'VariableDeclaration') s.declarations.forEach(v => navnI(v.id).forEach(n => KJENT.add(n))); } catch (e) { }
  for (const w of m[1].matchAll(/window\.([A-Za-z_$][\w$]*)\s*=/g)) KJENT.add(w[1]);
}
// alt spillet legger på window (Object.assign(window, {...}) og window.X = ...) kan brukes som globalt navn
for (const F of filer) {
  const kilde = fs.readFileSync(path.join(SRC, F.fil), 'utf8');
  for (const w of kilde.matchAll(/window\.([A-Za-z_$][\w$]*)\s*=[^=]/g)) KJENT.add(w[1]);
}

/* ---------- gjennomgang med skop ---------- */
// metoder på objekter på toppnivå (const X = { m() {} }), så kall som X.m() mens filene lastes, kan følges
const metoder = new Map();
for (const [navn, d] of topp) if (d.init && d.init.type === 'ObjectExpression') for (const p of d.init.properties)
  if (p.type === 'Property' && !p.computed && p.key && (p.value.type === 'FunctionExpression' || p.value.type === 'ArrowFunctionExpression')) metoder.set(navn + '.' + (p.key.name || p.key.value), { fn: p.value, fil: d.fil, nr: d.nr });
const LOKKE = new Set(['forEach', 'map', 'filter', 'reduce', 'reduceRight', 'some', 'every', 'find', 'findIndex', 'findLast', 'flatMap', 'sort', 'from']);

function heist(kropp, sett) { // var og funksjoner i en funksjonskropp (ikke i nøstede funksjoner)
  const gå = n => {
    if (!n || typeof n !== 'object') return;
    if (Array.isArray(n)) return n.forEach(gå);
    if (n.type === 'VariableDeclaration' && n.kind === 'var') n.declarations.forEach(v => navnI(v.id).forEach(x => sett.add(x)));
    if (n.type === 'FunctionDeclaration') { sett.add(n.id.name); return; }
    if (/Function|Class/.test(n.type) && n.type !== 'FunctionDeclaration') return;
    for (const k in n) if (k !== 'loc' && n[k] && typeof n[k] === 'object') gå(n[k]);
  };
  gå(kropp);
}
function blokkNavn(liste, sett) { for (const s of liste) { if (s.type === 'VariableDeclaration' && s.kind !== 'var') s.declarations.forEach(v => navnI(v.id).forEach(n => sett.add(n))); else if (s.type === 'ClassDeclaration' || s.type === 'FunctionDeclaration') sett.add(s.id.name); } }

/* går gjennom en node. K: { fil, nr, skop (liste av sett), lastes (kjøres mens filene lastes), refs (liste), kall (liste) } */
function gå(n, K) {
  if (!n) return;
  switch (n.type) {
    case 'Identifier': return ref(n, K);
    case 'Literal': case 'ThisExpression': case 'Super': case 'MetaProperty': case 'EmptyStatement': case 'DebuggerStatement': case 'BreakStatement': case 'ContinueStatement': case 'TemplateElement': return;
    case 'Program': case 'BlockStatement': case 'StaticBlock': { const s = new Set(); blokkNavn(n.body, s); const K2 = Object.assign({}, K, { skop: K.skop.concat([s]) }); n.body.forEach(x => gå(x, K2)); return; }
    case 'ExpressionStatement': return gå(n.expression, K);
    case 'ParenthesizedExpression': case 'ChainExpression': return gå(n.expression, K);
    case 'VariableDeclaration': for (const v of n.declarations) { mønster(v.id, K); gå(v.init, K); } return;
    case 'FunctionDeclaration': return funksjon(n, K, false);
    case 'FunctionExpression': case 'ArrowFunctionExpression': return funksjon(n, K, false);
    case 'ClassDeclaration': case 'ClassExpression': { gå(n.superClass, K); const s = new Set(n.id ? [n.id.name] : []); const K2 = Object.assign({}, K, { skop: K.skop.concat([s]) });
      for (const m of n.body.body) { if (m.computed) gå(m.key, K2); if (m.type === 'MethodDefinition') funksjon(m.value, K2, false); else if (m.type === 'PropertyDefinition') { if (m.static) gå(m.value, K2); else if (m.value) funksjon({ type: 'ArrowFunctionExpression', params: [], body: m.value, expression: true }, K2, false); } else if (m.type === 'StaticBlock') gå(m, K2); } return; }
    case 'ReturnStatement': case 'ThrowStatement': case 'UnaryExpression': case 'UpdateExpression': case 'SpreadElement': case 'AwaitExpression': case 'YieldExpression':
      if (n.type === 'UnaryExpression' && n.operator === 'typeof' && n.argument.type === 'Identifier') return ref(n.argument, Object.assign({}, K, { typeof: true }));
      if (n.type === 'UpdateExpression' && n.argument.type === 'Identifier') skrivTil(n.argument, K, n.loc.start.line);
      return gå(n.argument, K);
    case 'IfStatement': case 'ConditionalExpression': gå(n.test, K); gå(n.consequent, K); return gå(n.alternate, K);
    case 'ForStatement': { const s = new Set(); if (n.init && n.init.type === 'VariableDeclaration' && n.init.kind !== 'var') n.init.declarations.forEach(v => navnI(v.id).forEach(x => s.add(x))); const K2 = Object.assign({}, K, { skop: K.skop.concat([s]) }); gå(n.init, K2); gå(n.test, K2); gå(n.update, K2); return gå(n.body, K2); }
    case 'ForInStatement': case 'ForOfStatement': { const s = new Set(); if (n.left.type === 'VariableDeclaration' && n.left.kind !== 'var') n.left.declarations.forEach(v => navnI(v.id).forEach(x => s.add(x))); const K2 = Object.assign({}, K, { skop: K.skop.concat([s]) }); if (n.left.type === 'VariableDeclaration') gå(n.left, K2); else mønster(n.left, K2); gå(n.right, K2); return gå(n.body, K2); }
    case 'WhileStatement': case 'DoWhileStatement': gå(n.test, K); return gå(n.body, K);
    case 'TryStatement': gå(n.block, K); if (n.handler) { const s = new Set(navnI(n.handler.param)); gå(n.handler.body, Object.assign({}, K, { skop: K.skop.concat([s]) })); } return gå(n.finalizer, K);
    case 'SwitchStatement': { gå(n.discriminant, K); const s = new Set(); n.cases.forEach(c => blokkNavn(c.consequent, s)); const K2 = Object.assign({}, K, { skop: K.skop.concat([s]) }); for (const c of n.cases) { gå(c.test, K2); c.consequent.forEach(x => gå(x, K2)); } return; }
    case 'LabeledStatement': return gå(n.body, K);
    case 'TemplateLiteral': return n.expressions.forEach(x => gå(x, K));
    case 'TaggedTemplateExpression': gå(n.tag, K); return gå(n.quasi, K);
    case 'ArrayExpression': return n.elements.forEach(x => gå(x, K));
    case 'ObjectExpression': for (const p of n.properties) { if (p.type === 'SpreadElement') { gå(p.argument, K); continue; } if (p.computed) gå(p.key, K); gå(p.value, K); } return;
    case 'BinaryExpression': case 'LogicalExpression': gå(n.left, K); return gå(n.right, K);
    case 'AssignmentExpression': tildeling(n, K); if (n.left.type === 'Identifier' || n.left.type === 'MemberExpression') gå(n.left, K); else mønster(n.left, K); return gå(n.right, K);
    case 'SequenceExpression': return n.expressions.forEach(x => gå(x, K));
    case 'MemberExpression': gå(n.object, K); if (n.computed) gå(n.property, K); return;
    case 'CallExpression': case 'NewExpression': return kall(n, K);
    case 'ImportExpression': return gå(n.source, K);
    default: for (const k in n) if (k !== 'loc' && k !== 'type' && n[k] && typeof n[k] === 'object') { if (Array.isArray(n[k])) n[k].forEach(x => x && x.type && gå(x, K)); else if (n[k].type) gå(n[k], K); }
  }
}
function mønster(p, K) { // standardverdier og beregnede nøkler i mønstre er uttrykk; navnene i mønsteret er tildelinger
  if (!p) return;
  if (p.type === 'Identifier') return ref(p, K);
  if (p.type === 'MemberExpression') return gå(p, K);
  if (p.type === 'ObjectPattern') return p.properties.forEach(q => { if (q.type === 'RestElement') return mønster(q.argument, K); if (q.computed) gå(q.key, K); mønster(q.value, K); });
  if (p.type === 'ArrayPattern') return p.elements.forEach(q => mønster(q, K));
  if (p.type === 'AssignmentPattern') { mønster(p.left, K); return gå(p.right, K); }
  if (p.type === 'RestElement') return mønster(p.argument, K);
}
function funksjon(f, K, kjøres) { // kjøres: kroppen kjøres med en gang (IIFE, forEach og liknende)
  const s = new Set(); f.params.forEach(p => navnI(p).forEach(n => s.add(n))); if (f.id && f.type === 'FunctionExpression') s.add(f.id.name);
  if (f.body.type === 'BlockStatement') heist(f.body.body, s);
  const K2 = Object.assign({}, K, { skop: K.skop.concat([s]), lastes: K.lastes && kjøres });
  f.params.forEach(p => { if (p.type !== 'Identifier') mønsterStandard(p, K2); });
  if (f.body.type === 'BlockStatement') gå(f.body, K2); else gå(f.body, K2);
}
function mønsterStandard(p, K) { if (!p) return; if (p.type === 'AssignmentPattern') { mønsterStandard(p.left, K); gå(p.right, K); } else if (p.type === 'ObjectPattern') p.properties.forEach(q => { if (q.computed) gå(q.key, K); mønsterStandard(q.type === 'RestElement' ? q.argument : q.value, K); }); else if (p.type === 'ArrayPattern') p.elements.forEach(q => mønsterStandard(q, K)); }
function kall(n, K) {
  const c = n.callee, iife = c.type === 'FunctionExpression' || c.type === 'ArrowFunctionExpression'
    || (c.type === 'MemberExpression' && !c.computed && /^(call|apply)$/.test(c.property.name) && /Function/.test(c.object.type));
  if (iife) { funksjon(c.type === 'MemberExpression' ? c.object : c, K, true); }
  else gå(c, K);
  const lokke = c.type === 'MemberExpression' && !c.computed && LOKKE.has(c.property.name);
  for (const a of n.arguments) { if ((a.type === 'FunctionExpression' || a.type === 'ArrowFunctionExpression') && lokke) funksjon(a, K, true); else gå(a, K); }
  if (K.lastes && K.kall) { // kall mens filene lastes: f() og X.m() på toppnivånavn
    if (c.type === 'Identifier' && !lokal(c.name, K)) K.kall.push({ navn: c.name, node: n });
    else if (c.type === 'MemberExpression' && !c.computed && c.object.type === 'Identifier' && !lokal(c.object.name, K)) K.kall.push({ navn: c.object.name + '.' + c.property.name, node: n });
  }
}
function lokal(navn, K) { for (let i = K.skop.length - 1; i >= 1; i--) if (K.skop[i].has(navn)) return true; return false; } // skop[0] er toppnivået
function ref(id, K) {
  if (lokal(id.name, K)) return;
  K.refs.push({ navn: id.name, pos: id.start, linje: id.loc ? id.loc.start.line : '?', lastes: K.lastes, typeof: !!K.typeof });
}
function skrivTil(id, K, linje) { // en let eller var fra en annen fil
  if (lokal(id.name, K)) return; const d = topp.get(id.name);
  if (d && (d.art === 'let' || d.art === 'var') && d.fil !== K.fil) feil.push(`${K.fil}:${linje}: skriver til ${id.name}, som er deklarert i ${d.fil}:${d.linje}; gi ${d.fil} en funksjon som gjør det`);
}
function tildeling(n, K) { // innpakninger: en funksjon eller metode som settes på nytt
  const l = n.left; if (l.type === 'Identifier') skrivTil(l, K, n.loc.start.line);
  if (l.type === 'Identifier' && !lokal(l.name, K)) { const d = topp.get(l.name); if (d && d.art === 'function') feil.push(`${K.fil}:${n.loc.start.line}: ${l.name} settes på nytt (${d.fil}:${d.linje}); gi den kroker med Kroker.kall i stedet (se «Kroker» i dokumentasjon/systemer.md)`); }
  else if (l.type === 'MemberExpression' && !l.computed && l.object.type === 'Identifier' && !lokal(l.object.name, K) && metoder.has(l.object.name + '.' + l.property.name)) innpakninger.push(`${K.fil}:${n.loc.start.line}: ${l.object.name}.${l.property.name}`);
}

/* ---------- sjekkene ---------- */
const refsAv = new Map(); // funksjon/metode -> referanser og kall når den kjøres (til å følge kall fra toppnivået)
function kjøringAv(navn) {
  if (refsAv.has(navn)) return refsAv.get(navn);
  const d = topp.get(navn), m = metoder.get(navn), fn = d && d.art === 'function' ? d.node : m ? m.fn : null, fil = d ? d.fil : m ? m.fil : null;
  const ut = { refs: [], kall: [], fil }; refsAv.set(navn, ut); if (!fn) return ut;
  const K = { fil, skop: [new Set()], lastes: true, refs: ut.refs, kall: ut.kall };
  const s = new Set(); fn.params.forEach(p => navnI(p).forEach(n => s.add(n))); if (fn.body.type === 'BlockStatement') heist(fn.body.body, s);
  gå(fn.body, Object.assign({}, K, { skop: [new Set(), s] }));
  return ut;
}
for (const F of filer) {
  const K = { fil: F.fil, nr: F.nr, skop: [new Set()], lastes: true, refs: [], kall: [] };
  // toppnivået: blokker på toppnivå har egne navn, men selve Program-skopet er toppnivået (skop[0])
  for (const s of F.ast.body) gå(s, K);
  // følg kall mens filene lastes, et par ledd ned
  const sett = new Set(), kø = K.kall.map(k => ({ navn: k.navn, linje: k.node.loc.start.line, via: k.navn }));
  while (kø.length) {
    const k = kø.shift(); if (sett.has(k.navn)) continue; sett.add(k.navn);
    const r = kjøringAv(k.navn);
    for (const x of r.refs) if (x.lastes) K.refs.push(Object.assign({}, x, { pos: -1, linje: k.linje, via: k.via }));
    for (const c of r.kall) kø.push({ navn: c.navn, linje: k.linje, via: k.via + ' -> ' + c.navn });
  }
  for (const r of K.refs) { const d = topp.get(r.navn); if (d && d.nr > F.nr) { const k = F.fil + ' -> ' + d.fil; if (!bakover.has(k)) bakover.set(k, new Set()); bakover.get(k).add(r.navn); } }
  for (const r of K.refs) {
    const d = topp.get(r.navn);
    if (!d) { if (!KJENT.has(r.navn) && !r.typeof) feil.push(`${F.fil}:${r.linje}: ukjent navn ${r.navn}`); continue; }
    if (!r.lastes || d.art === 'function' || d.art === 'var') continue;
    const senere = d.nr > F.nr || (d.nr === F.nr && r.pos >= 0 && d.pos > r.pos);
    if (senere && !r.typeof) feil.push(`${F.fil}:${r.linje}: ${r.navn} brukes mens fila lastes${r.via ? ' (via ' + r.via + ')' : ''}, men deklareres først i ${d.fil}:${d.linje}`);
  }
}
const unike = a => [...new Set(a)];
const F2 = unike(feil), IP = unike(innpakninger); // en funksjon som kalles mens filene lastes, gås gjennom to ganger
if (process.argv.includes('--liste')) { console.log(IP.join('\n')); console.log(''); }
if (process.argv.includes('--moduler')) {
  let n = 0; for (const [k, s] of bakover) { n += s.size; console.log(`${k}: ${[...s].sort().join(' ')}`); }
  console.log(`\n${n} navn i ${bakover.size} filpar brukes fra en senere fil mens spillet går. Med moduler blir hvert filpar en sirkel i importene.\n`);
}
console.log(`${parts.length} filer, ${topp.size} navn på toppnivået, ${IP.length} innpakninger av metoder (tak ${TAK}).`);
if (IP.length > TAK) F2.push(`flere innpakninger av metoder enn taket (${IP.length} > ${TAK}): bruk Kroker eller et oppslag (AGENTS.md), eller se --liste`);
else if (IP.length < TAK) varsler.push(`færre innpakninger enn taket: sett TAK = ${IP.length} i tools/sjekk_kode.js`);
for (const v of varsler) console.log('Merk: ' + v);
if (F2.length) { console.log('\nFeil:'); for (const f of F2) console.log('  ' + f); process.exitCode = 1; }
else console.log('Koden er i orden.');
