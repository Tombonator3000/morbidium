/* ============================================================
   DATA  -  alt innhold samlet, adskilt fra regler og grafikk
   ============================================================ */
const WEAPONS = {
  stativ: { id: 'stativ', name: 'Infusjonsstativ', desc: 'Balansert. Posen er tom, men den svinger godt.', dmg: 10, range: 1.95, arc: 2.1, time: .30, knock: 4, sound: 'hit', color: 0xb8b8b8 },
  sag: { id: 'sag', name: 'Beinsag', desc: 'Rask og sint. Tre slag for prisen av ett.', dmg: 7, range: 1.65, arc: 1.6, time: .20, knock: 2.5, bleed: .25, sound: 'hit', color: 0x9aa0a6 },
  mopp: { id: 'mopp', name: 'Mopp med metallhode', desc: 'Tung og bred. Gjør gulvet vått av og til.', dmg: 16, range: 2.4, arc: 2.8, time: .46, knock: 7, wet: .2, sound: 'hitHeavy', color: 0x8a6a3a },
  bekken: { id: 'bekken', name: 'Stålbekken', desc: 'Bonk. Kan svimeslå. Ikke spør hva den er brukt til.', dmg: 12, range: 1.8, arc: 1.9, time: .34, knock: 5, stun: .3, sound: 'bonk', color: 0xe9e4d8 }
};

/* Evner: fire faste plasser. Hver har to konkurrerende oppgraderinger (a/b). */
const ABILITIES = {
  brekning: { name: 'Taktisk brekning', cd: 7, desc: 'Sprut som gjør gulvet glatt. Fiender sklir og faller.',
    up: { a: { name: 'Prosjektil', desc: 'Én stor klatt lander der du sikter og gjør skade.' }, b: { name: 'Refluks', desc: 'Glatt ring rundt deg som dytter fiender unna.' } } },
  benektelse: { name: 'Klinisk benektelse', cd: 10, desc: 'Neste skade utsettes og kommer senere, svakere.',
    up: { a: { name: 'Bortforklaring', desc: 'Skaden venter til rommet er ryddet, og blir mindre.' }, b: { name: 'Ansvarsfraskrivelse', desc: 'Skaden sendes dobbelt til nærmeste fiende.' } } },
  due: { name: 'Patologisk due', cd: 14, desc: 'Tilkaller en aggressiv og uappetittlig due.',
    up: { a: { name: 'Duesverm', desc: 'Tre mindre duer, like dårlig oppdratt.' }, b: { name: 'Distraksjonsdue', desc: 'Duen fornærmer fiendene så de jager den.' } } },
  skjema: { name: 'Skjema 13-B', cd: 9, desc: 'Stemplet papirvegg som stopper prosjektiler.',
    up: { a: { name: 'Returnert til avsender', desc: 'Prosjektiler sendes tilbake.' }, b: { name: 'Uten tillatelse', desc: 'Fiender som rører veggen blir stående og vente på stempel.' } } },
  hydro: { name: 'Hydroterapi', cd: 6, desc: 'Vannstråle som dytter fiender og gjør gulvet vått.',
    up: { a: { name: 'Strålebehandling', desc: 'Smal stråle med høy skade som går gjennom alle.' }, b: { name: 'Oversvømmelse', desc: 'Stor våt flate rundt deg. Pass på strømmen.' } } },
  monolog: { name: 'Våpenisert monolog', cd: 12, desc: 'Kort stun på alle som må høre på. Gjør deg litt mer edgelord.',
    up: { a: { name: 'Utvidet monolog', desc: 'Lengre tale, større rekkevidde.' }, b: { name: 'Avbrytelse', desc: 'Gjør skade og avbryter bosser midt i talen.' } } },
  kappe: { name: 'Kappekrøll', cd: 5, desc: 'Dramatisk støt fremover i en overdreven positur.',
    up: { a: { name: 'Lokkedukke', desc: 'Etterlater en papp-kopi av deg som trekker til seg angrep.' }, b: { name: 'Snublefelle', desc: 'Etterlater en snubletråd som felter fiender.' } } },
  nokler: { name: 'Vaktmesterens nøkkelknippe', cd: 7, desc: 'Kaster knippet og drar første fiende inntil deg.',
    up: { a: { name: 'Svingknippe', desc: 'Svinger knippet rundt deg i stedet.' }, b: { name: 'Hovedknippe', desc: 'Drar alle fiender i en kjegle.' } } },
  resept: { name: 'Feil resept', cd: 8, desc: 'Kaster en tilfeldig pille på en fiende. Resultatet varierer.',
    up: { a: { name: 'Second opinion', desc: 'Velger det beste av to utfall. Aldri helbredelse.' }, b: { name: 'Epidemi', desc: 'Virkningen smitter til fiender i nærheten.' } } }
};
// Fra Toms journalskisse: fire kort som ikke fantes i designdokumentet
ABILITIES.due.name = 'Duesannsyn';
Object.assign(ABILITIES, {
  lys: { name: 'Undersøkelseslys', cd: 7, desc: 'Et skarpt lys i en kjegle foran deg. Alle som ser inn i det, blir stående og myse.',
    up: { a: { name: 'Operasjonslampe', desc: 'Bredere kjegle og lengre blending.' }, b: { name: 'Forhør', desc: 'Blendede fiender tar ekstra skade.' } } },
  skyggehand: { name: 'Skyggehånd', cd: 6, desc: 'En hånd av Morbidium griper den første fienden og drar den inntil deg.',
    up: { a: { name: 'Lange fingre', desc: 'Rekker dobbelt så langt.' }, b: { name: 'Knyttneve', desc: 'Klemmer hardt og gir Morbidium tilbake.' } } },
  stempel: { name: 'Stempel', cd: 8, desc: 'Et gigantisk stempel lander der du sikter. AVSLÅTT.',
    up: { a: { name: 'Tre eksemplarer', desc: 'Tre mindre stempler på rad.' }, b: { name: 'Godkjent', desc: 'Stempelet helbreder deg litt for hver fiende det treffer.' } } }
});
/* Frenologikartet: fire områder i hodet. Et kort i sitt eget område får ekstra nivå og kortere nedkjøling. */
const REGIONS = [
  { id: 'frykt', name: 'Frykt', color: '#7fa6d6', dark: '#3f5f8e', words: ['Orden', 'Frykt', 'Tvang', 'Flukt', 'Erindring'], glyph: 'fjær' },
  { id: 'kontroll', name: 'Kontroll', color: '#e8c35a', dark: '#9a7a1c', words: ['Kontroll', 'Plikt', 'Tap', 'Håp'], glyph: 'sol' },
  { id: 'uvirkelighet', name: 'Uvirkelighet', color: '#a57acc', dark: '#5a2a7a', words: ['Drømmer', 'Hva hvis?', 'Stillhet'], glyph: 'spiral' },
  { id: 'mening', name: 'Mening', color: '#8cc3a2', dark: '#3f7a5a', words: ['Mening', 'Tilpasning', 'Frigjøring', 'Uvirkelighet'], glyph: 'penn' }
];
const AFFINITY = { due: 'frykt', kappe: 'frykt', benektelse: 'frykt', lys: 'kontroll', skjema: 'kontroll', nokler: 'kontroll', skyggehand: 'uvirkelighet', monolog: 'uvirkelighet', resept: 'uvirkelighet', stempel: 'mening', hydro: 'mening', brekning: 'mening' };
const ABILITY_IDS = Object.keys(ABILITIES);

/* Ikoner tegnet som enkle SVG-stier, blekk på kartotekkort */
const ICONS = {
  brekning: '<path d="M20 6c-5 0-8 4-8 8 0 3 2 5 4 6l-3 8M20 20c2 0 5-2 5-5" fill="none" stroke="#2b1a12" stroke-width="3" stroke-linecap="round"/><circle cx="12" cy="33" r="3" fill="#6f8a3a"/><circle cx="20" cy="31" r="2.5" fill="#6f8a3a"/><circle cx="27" cy="34" r="3.2" fill="#6f8a3a"/>',
  benektelse: '<rect x="8" y="8" width="24" height="26" rx="2" fill="none" stroke="#2b1a12" stroke-width="3"/><path d="M13 14l14 14M27 14L13 28" stroke="#b3261e" stroke-width="3.5" stroke-linecap="round"/>',
  due: '<ellipse cx="20" cy="23" rx="11" ry="8" fill="#8a8f98" stroke="#2b1a12" stroke-width="2.5"/><circle cx="28" cy="14" r="6" fill="#8a8f98" stroke="#2b1a12" stroke-width="2.5"/><path d="M33 14l5 2-5 1" fill="#e8b93a" stroke="#2b1a12" stroke-width="1.5"/><circle cx="29" cy="13" r="1.5" fill="#b3261e"/>',
  skjema: '<rect x="9" y="5" width="22" height="30" fill="#fff" stroke="#2b1a12" stroke-width="2.5"/><path d="M13 12h14M13 17h14M13 22h9" stroke="#2b1a12" stroke-width="2"/><circle cx="25" cy="28" r="5" fill="none" stroke="#b3261e" stroke-width="2.5"/>',
  hydro: '<path d="M20 5C15 13 11 18 11 24a9 9 0 0 0 18 0c0-6-4-11-9-19z" fill="#6aa9c8" stroke="#2b1a12" stroke-width="2.5"/><path d="M16 25a4 4 0 0 0 4 4" stroke="#fff" stroke-width="2" fill="none"/>',
  monolog: '<path d="M6 9h28v17H18l-7 6v-6H6z" fill="#fff" stroke="#2b1a12" stroke-width="2.5" stroke-linejoin="round"/><path d="M11 15h18M11 20h12" stroke="#2b1a12" stroke-width="2"/>',
  kappe: '<path d="M20 5l-4 6-8 24h24L24 11z" fill="#2b1a12"/><path d="M12 35c3-3 5-3 8 0 3-3 5-3 8 0" stroke="#b3261e" stroke-width="2" fill="none"/><circle cx="20" cy="8" r="4" fill="#efe4c4" stroke="#2b1a12" stroke-width="2"/>',
  nokler: '<circle cx="14" cy="14" r="7" fill="none" stroke="#2b1a12" stroke-width="3"/><path d="M19 19l13 13M26 26l4-4M30 30l3-3" stroke="#2b1a12" stroke-width="3" stroke-linecap="round"/>',
  resept: '<rect x="7" y="15" width="26" height="11" rx="5.5" fill="#fff" stroke="#2b1a12" stroke-width="2.5" transform="rotate(-30 20 20)"/><path d="M20 12v16" stroke="#2b1a12" stroke-width="2" transform="rotate(-30 20 20)"/><rect x="20" y="15" width="13" height="11" rx="0" fill="#b3261e" opacity=".8" transform="rotate(-30 20 20)"/>'
};

const CONSUMABLES = {
  levertran: { name: 'Levertran', desc: 'Helbreder 30. Smaker som straff.' },
  luktesalt: { name: 'Luktesalt', desc: 'Fjerner plager og gir fart i fire sekunder.' },
  eter: { name: 'Eterflaske', desc: 'Kast den. Alle i skyen sovner.' },
  kamfer: { name: 'Kamferdram', desc: 'Fem sekunder med halvannen gang så mye skade.' }
};

/* Fiender. Tallene er prototypeverdier, ikke testet balanse. */
const ENEMIES = {
  pleier: { name: 'Pleier', hp: 42, speed: 2.7, r: .5, dmg: 11, xp: 12, teeth: [2, 4], look: 'pleier' },
  kultist: { name: 'Kultist', hp: 28, speed: 2.4, r: .42, dmg: 13, xp: 10, teeth: [1, 4], look: 'kultist' },
  oppasser: { name: 'Oppasser', hp: 24, speed: 2.5, r: .4, dmg: 8, xp: 10, teeth: [1, 3], look: 'oppasser' },
  yngel: { name: 'Avløpsyngel', hp: 16, speed: 4.3, r: .36, dmg: 6, xp: 6, teeth: [0, 1], look: 'yngel', morb: 3 }
};
const DEPTH_ENEMIES = { 1: ['pleier', 'kultist', 'oppasser', 'pleier', 'kultist'], 2: ['pleier', 'oppasser', 'yngel', 'kultist', 'oppasser', 'yngel'], 3: ['pleier', 'kultist', 'oppasser', 'kultist', 'pleier'], 4: ['yngel', 'kultist', 'pleier', 'yngel', 'oppasser', 'kultist'] };

/* Sjefene. attacks trekkes tilfeldig; signaturangrepene (hookpull, chainspin, flood, jet, stamprain, paperstorm,
   isolate, pages, ink, rewrite) ligger i 22_sjefer.js. */
const BOSSES = {
  1: { type: 'krok', weapon: 'krok', name: 'Overlege Hektor Krok', title: 'Smertens saksbehandler', hp: 650, color: 0xe8e2d0, accent: 0x7a1d18, minion: 'kultist', minions: 2, attacks: ['slam', 'hooks', 'summon', 'hookpull', 'chainspin', 'hookpull'], puddle: null },
  2: { type: 'rust', weapon: 'slange', name: 'Hydroterapeut Ragnvald Rust', title: 'Badevakt for de fortapte', hp: 950, color: 0x9cc7b4, accent: 0x2c5a5c, minion: 'oppasser', minions: 2, attacks: ['slam', 'hooks', 'summon', 'sweep', 'flood', 'jet', 'jet'], puddle: 'wet' },
  3: { type: 'arkivar', weapon: 'stempelboss', name: 'Overarkivar Gunhild Paragraf', title: 'Hun som arkiverer alt, også deg', hp: 1150, color: 0x3a3440, accent: 0xb3261e, minion: 'kultist', minions: 2, attacks: ['stamprain', 'paperstorm', 'isolate', 'summon', 'sweep', 'stamprain', 'paperstorm'], puddle: null },
  4: { type: 'journalen', weapon: null, name: 'Journalen', title: 'Den som opprettet deg', hp: 1500, color: 0x4a2d5a, accent: 0xb36be0, minion: 'yngel', minions: 4, attacks: ['slam', 'hooks', 'summon', 'sweep', 'pages', 'ink', 'rewrite', 'pages'], puddle: 'morb', tome: true, float: true }
};

const THEMES = {
  1: { name: '1. etasje: Mottak og bosted', tileA: '#d2cb86', tileB: '#8fa35e', grout: '#5d6a3a', wall: '#ddd4ad', wains: '#6f8a55', base: '#3b3322', top: '#1b140e', fog: 0x16130c, sky: 0xfff1c8, ground: 0x3a3524, pool: '#ffe6a0', corridor: .82 },
  2: { name: 'Underetasjen: Behandling og hydroterapi', tileA: '#a8d6c4', tileB: '#5e9488', grout: '#2f5650', wall: '#c4ddd3', wains: '#3f6e6a', base: '#1e3331', top: '#0f1a19', fog: 0x0c1616, sky: 0xd8fff2, ground: 0x1e302d, pool: '#bfffe8', corridor: .78 },
  3: { name: 'Kjelleren: Isolat og arkiv', tileA: '#cbbf9c', tileB: '#a6997a', grout: '#4a3f2c', wall: '#e6dcc2', wains: '#8a7a5a', base: '#2e2618', top: '#120e08', fog: 0x120e0a, sky: 0xfff0d0, ground: 0x2e281c, pool: '#fff0c0', corridor: .75 },
  4: { name: 'Under grunnmuren: Dypet', tileA: '#6a5478', tileB: '#2f2340', grout: '#1a1024', wall: '#57445f', wains: '#2c1d36', base: '#140c1a', top: '#07040a', fog: 0x0a0610, sky: 0xd9b8ff, ground: 0x1a0f22, pool: '#c98cff', corridor: .7 }
};
// Malte temaer: dempet palett, veggtopper og fargegradering per etasje (brukes av etterbehandlingen)
Object.assign(THEMES[1], { tileA: '#d8d08e', tileB2: '#aebb74', grout: '#5d6a3a', corr: '#b9a878', cap: '#8a7d62', grade: { amb: '#f2ead8', lift: '#0a0604', gain: '#fff4e4', vig: .5 } });
Object.assign(THEMES[2], { tileA: '#b4d8c8', tileB2: '#86b4a4', grout: '#2f5650', corr: '#8aa89c', cap: '#5f7a72', grade: { amb: '#a8c4c0', lift: '#040a0a', gain: '#e8fff8', vig: .6 } });
Object.assign(THEMES[3], { tileB2: '#b3a684', corr: '#8f8268', cap: '#3a3024', grade: { amb: '#cfc4ae', lift: '#070503', gain: '#fff6e6', vig: .66 } });
Object.assign(THEMES[4], { tileA: '#7a6488', tileB2: '#5a4668', grout: '#1a1024', corr: '#4e3e58', cap: '#4a3a52', grade: { amb: '#5a4a6e', lift: '#08030c', gain: '#f0e0ff', vig: .7 } });
const MAX_DEPTH = 4;

/* Oppvåkningssteder. unlock: hvordan de låses opp i metaprogresjonen */
const AWAKENINGS = {
  eget: { name: 'Eget rom', perk: 'Trygt første minutt og personlige eiendeler: en ekstra evne.', problem: 'Personalet kjenner navnet ditt. Flere pleiere på jakt i denne etasjen.', template: 'eget' },
  likhus: { name: 'Likhuset', perk: 'Beinsag, 25 gulltenner og en snarvei: sjefslegen er merket på kartet.', problem: 'Lite helse, og kafeteriaen tror du er død. Alt koster mer.', template: 'likhus' },
  toalett: { name: 'Toalettet', perk: 'Rørveien avslører skattekammeret, og du har allerede litt Morbidium i blodet.', problem: 'Forurenset start. Dårlig førsteinntrykk gir høyere priser.', template: 'toalett' },
  soppel: { name: 'Søppelrommet', perk: 'Mer tilfeldig utstyr: et ekstra våpen og to evner.', problem: 'Utstyret var bevoktet. Noen vil ha det tilbake, nå.', template: 'soppel' },
  vaskesjakt: { name: 'Vaskesjakten', perk: 'Du starter i underetasjen, ett nivå høyere.', problem: 'Hardere fiender før du rekker å utruste deg.', template: 'vask', depth: 2 },
  operasjon: { name: 'Operasjonsbordet', perk: 'En umiddelbar særmutasjon: tilfeldig diagnose og en oppgradert evne.', problem: 'Operasjonen er fortsatt i gang. Kirurgen vil fullføre.', template: 'operasjon', unlock: 'bossKill' },
  begravelse: { name: 'En annens begravelse', perk: 'Falsk identitet. Arvingen får rabatt overalt.', problem: 'Sørgefølget har oppdaget at liket reiste seg. De er misfornøyde.', template: 'begravelse', unlock: 'deaths3' }
};

/* Diagnoser: reaksjoner på atferd. Alltid en fordel og et problem. */
const DIAGNOSES = {
  ruging: { name: 'Akutt ruging', good: 'Tunge angrep gjør 35 % mer skade.', bad: 'Du beveger deg 10 % tregere.', note: 'Pasienten svinger tungt og tenker lett.' },
  hovedperson: { name: 'Terminal hovedperson', good: '25 % mer skade når du er under halv helse. Mer Morbidium fra alt.', bad: 'Alle ser gjennom poseringen: priser opp 30 %.', note: 'Pasienten opptrer som om noen filmer. Ingen filmer.' },
  rulling: { name: 'Kronisk rulling', good: 'Rullingen lades 30 % raskere.', bad: 'Av og til faller en gulltann ut når du ruller.', note: 'Pasienten foretrekker å rulle fremfor å gå. Gulvet har klaget.' },
  nysgjerrighet: { name: 'Kirurgisk nysgjerrighet', good: 'Møbler du knuser gir flere gulltenner.', bad: 'Lamper gnistrer lenger når du er i nærheten.', note: 'Pasienten åpner ting som burde vært lukket.' },
  innsikt: { name: 'Kosmisk innsikt', good: 'Evner lades 20 % raskere.', bad: 'Du ser fiender som ikke finnes.', note: 'Pasienten har sett for mye. Journalen har sett pasienten.' },
  hypokonder: { name: 'Institusjonell hypokondri', good: 'All helbredelse virker 40 % bedre.', bad: '10 % mindre maks helse.', note: 'Pasienten ber om behandling for ting som ikke finnes. Innvilget.' }
};

const STATS = {
  kropp: { name: 'Kropp', desc: '+10 maks helse og mer nærkampskade' },
  smid: { name: 'Smidighet', desc: 'Fart og raskere rulling' },
  vett: { name: 'Vett', desc: 'Kortere nedkjøling og sterkere evner' },
  nerver: { name: 'Nerver', desc: 'Mindre skade og mer stabil Morbidium' },
  tryne: { name: 'Tryne', desc: 'Lavere priser og flere gulltenner' }
};

const FIRST_M = ['Ingvald', 'Asbjørn', 'Torleif', 'Halvard', 'Eilert', 'Sigvart', 'Kasper', 'Leopold', 'Ansgar', 'Olaus', 'Reidar', 'Kornelius', 'Gottfred', 'Alf', 'Edvin', 'Tobias', 'Ivar', 'Mikkel'];
const FIRST_K = ['Borghild', 'Magnhild', 'Ragna', 'Solveig', 'Gudrun', 'Oddny', 'Signe', 'Jenny', 'Petra', 'Dagny', 'Hulda', 'Aslaug', 'Klara', 'Edle', 'Tordis', 'Bergljot', 'Ingeborg', 'Martha'];
const FIRST = FIRST_M.concat(FIRST_K);
const LAST = ['Brekke', 'Moe', 'Tveit', 'Haugen', 'Skogstad', 'Lien', 'Sæther', 'Rønning', 'Aas', 'Bakken', 'Nygaard', 'Kvam', 'Strand', 'Viken', 'Dahl', 'Hovde'];
const COMPLAINTS = ['innlagt for nervøs uro', 'innlagt for overdreven dramatikk', 'innlagt for mistanke om poesi', 'innlagt for å ha lest feil bok', 'innlagt etter en misforståelse på postkontoret', 'innlagt for kronisk mørk kledning', 'innlagt for å ha stirret på månen i arbeidstiden'];

const LINES = {
  kultist: ['Ingen forstår mørket slik jeg gjør.', 'Jeg ble født i skyggene. Mamma sier noe annet.', 'Smerte er min eneste venn. Den svarer ikke heller.', 'Frykt meg. Eller legg i det minste merke til kappen.', 'Mitt sanne navn kan ikke uttales. Det er Kjell.', 'Kappen er ikke upraktisk. Den er symbolsk.', 'Jeg har fire belter fordi mørket har mange lag.', 'Du kjenner ikke min smerte. Den står i en dagbok med lås.', 'Jeg skrev et dikt om deg. Det rimer på død.'],
  pose: ['*poserer dramatisk*', 'Se på meg. Nei, i profil.', 'Vent, jeg må finne lyset.', 'Dette er min mørkeste vinkel.', 'Merk hvordan kappen faller.'],
  pleier: ['Tid for medisin.', 'Ut av gangen!', 'Jeg har dobbeltvakt og null tålmodighet.', 'Tilbake i sengen. Eller i en annen seng.', 'Hvem har tisset i hydroterapien?'],
  oppasser: ['Hold deg i ro, dette gjør ikke vondt. For meg.', 'Én sprøyte om dagen holder legen borte. Jeg er ikke lege.', 'Stikk!', 'Journalen sier at du trenger mer.'],
  yngel: ['blubb', 'gurgl', '...', 'klikk klikk'],
  bossIntro: {
    1: ['Ah. En pasient som går på egne bein. Det må vi rette på.', 'Smerte er bare byråkrati for kroppen.'],
    2: ['Velkommen til badet. Vannet er rent. Det meste av det.', 'Vi skal skylle ut alt som er deg.'],
    3: ['Navn? Fødselsdato? Dødsdato? Den siste fyller vi inn selv.', 'Alt skal arkiveres. Du også.'],
    4: ['Hvem opprettet denne journalen?', 'Du gjorde. Hver gang du døde.']
  },
  boss: {
    1: ['Kjetting er et livssyn.', 'Mine studenter! Mer dramatikk!', 'Jeg har åpnet dører du ikke engang har søkt om.', 'Dette vil gjøre vondt, og det er dokumentert.'],
    2: ['Hold pusten.', 'Strøm og vann. Klassisk behandling.', 'Mine oppassere! Rengjøring!', 'Skyll. Gjenta.'],
    3: ['Feil skjema.', 'AVSLÅTT.', 'Til isolatet med deg.', 'Dette går rett i arkivet.', 'Har du kvittering for den kappen?'],
    4: ['Du er en fotnote.', 'Jeg har lest slutten din. Den er kort.', 'Dere er lunsj.', 'Signer her. Og her. Og her.']
  },
  monolog: {
    1: ['La meg forklare min tragiske bakgrunn.', 'Det begynte i 1887, da jeg fikk avslag på permisjon...', '...og siden har jeg båret smerten. I tre ringpermer.'],
    2: ['Vann husker alt, vet du.', 'Jeg var en gang en helt vanlig badevakt...', '...helt til jeg så hva som bor i avløpet. Og det så meg.'],
    3: ['Vet du hvor mange skjemaer jeg har stemplet?', 'Førti år uten en eneste feilarkivering...', '...bortsett fra deg. Du ble arkivert feil. Det retter jeg opp nå.'],
    4: ['Hver pasient er en side.', 'Hver side er et forsøk.', 'Og du har aldri lest deg selv ferdig.']
  },
  interrupted: ['Unnskyld, jeg var ikke ferdig!', 'Du avbrøt meg midt i det beste!', 'Dette er svært uprofesjonelt.'],
  playerMonolog: ['Hør her. Mørket? Jeg ER mørket. Og i dag er jeg i dårlig humør.', 'Dere forstår ikke min smerte. Men dere skal få høre om den.', 'Jeg har skrevet et dikt. Det har 14 vers.', 'Hvis dere bare visste hvor lite jeg sov i 1923.'],
  pigeon: ['Kurr.', 'Din mor er en statue.', 'Kurr. Du lukter brød.', 'Jeg har spist ting du aldri har hørt om.']
};

const PA = {
  1: ['God morgen, kjære pasienter. Husk at det er forbudt å dø i korridorene.', 'Kafeteriaen minner om at suppe ikke er en diagnose.', 'Pasienter med kappe bes melde seg i resepsjonen for utlevering av perspektiv.', 'Besøkstiden er avlyst. Besøkende er også avlyst.', 'Husk: et smil koster ingenting. Tannbehandling koster mye.'],
  2: ['Hydroterapi er obligatorisk. Strøm er valgfritt.', 'Vannet i badene er rent. Det som bor i det, er en annen sak.', 'Kjære pasienter. Kjære pasienter. Husk å puste. Bygget gjør det allerede.', 'Vi minner om at elektriske apparater og badekar ikke er venner.'],
  3: ['Arkivet minner om at alle pasienter arkiveres alfabetisk. Også de levende.', 'Isolatet er stille. Det er hele poenget. Slutt å banke.', 'Mistet skjema? Mistet sjel? Henvend dere til arkivet i åpningstiden, som er avlyst.', 'Tvangstrøyer leveres tilbake knyttet. Takk for forståelsen.', 'Overarkivaren minner om at hysj også gjelder skrik.'],
  4: ['Kjære. Pasienter. Dere. Er. Hjemme.', 'Journalen er oppdatert. Journalen er oppdatert. Journalen er sulten.', 'Lunsj serveres nå. Dere er lunsj.', 'Utskrivning krever skjema null. Skjema null finnes ikke. Ennå.']
};

const POSTERS = ['SMIL.\nDET ER\nOBLIGATORISK', 'HAR DU HUSKET\nSKJEMA 13-B?', 'MØRKET ER\nIKKE EN\nPERSONLIGHET', 'HOLD KAPPEN\nUNNA\nMASKINENE', 'SUPPE\nER\nMEDISIN', 'FRISK LUFT\nKUN MED\nTILLATELSE', 'IKKE MAT\nDUENE', 'SKJEMA FØRST\nSMERTE\nETTERPÅ'];

const DEATH_CAUSES = {
  pleier: ['Ble lagt i seng. Permanent.', 'Tapte en diskusjon med en dobbeltvakt.', 'Ble dyttet ut av posisjon, og ut av livet.'],
  kultist: ['Drept av noen med fire belter. Det teller.', 'Beseiret av et dikt.', 'Undervurderte en mann i kappe. Kappen vant.'],
  oppasser: ['Fikk mer medisin enn anbefalt.', 'Sprøyten var ikke steril. Den var dødelig.'],
  yngel: ['Spist av noe fra avløpet. Avløpet har ingen kommentar.', 'Tråkket i noe som tråkket tilbake.'],
  boss: ['Ble behandlet. Grundig.', 'Fikk avslag på søknad om å leve.', 'Journalført.'],
  boss_krok: ['Ble hektet og henvist. Til likhuset.', 'Fikk en second opinion fra en krok.'],
  boss_rust: ['Skylt ut. Grundig.', 'Druknet i terapi.', 'Strøm og vann. Klassisk behandling.'],
  boss_arkivar: ['Arkivert under D, for død.', 'Stemplet AVSLÅTT. Anken ble også avslått.', 'Sendt til isolatet. For godt.'],
  boss_journalen: ['Skrevet ut. Av historien.', 'Journalført. Siste side.', 'Ble en fotnote.'],
  zap: ['Stod i vann og lekte med strøm. En klassiker.', 'Oppdaget elektrisitet. Den oppdaget ham tilbake.'],
  morb: ['Tråkket i noe som tråkket tilbake.', 'For mye Morbidium, for lite forstand.'],
  self: ['Skadet av egen oppfinnsomhet.', 'Blunket for lenge.'],
  any: ['Blunket for lenge.', 'Trengte bedre hånd-øye-koordinasjon.']
};

const JOURNAL_NOTES = {
  dodge: 'Pasienten foretrekker å rulle fremfor å gå. Gulvet har klaget.',
  heavy: 'Pasienten svinger tungt og tenker lett.',
  ability: 'Pasienten bruker evner slik andre bruker lommetørkle.',
  monolog: 'Pasienten holder taler for folk som prøver å drepe ham. De lytter, dessverre.',
  hurt: 'Pasienten stopper slag med ansiktet. Metoden er ikke godkjent.',
  props: 'Pasienten knuser inventar. Regning er sendt pårørende.',
  none: 'Pasienten er foreløpig ikke interessant nok til en kommentar.'
};

const LORE = [
  { t: 'Innleggelsesprotokoll, 1921', b: 'Morbidium sanatorium tar imot pasienter med nervøse lidelser, overdreven dramatikk og uforklarlige drømmer om trapper som går ned for alltid. Pasienter som dør, skal ikke skrives ut. De skal flyttes.' },
  { t: 'Notat fra vaktmester Olsen', b: 'Kjelleren var ikke der da vi bygde huset. Jeg har tegningene. Det står ingenting under grunnmuren. Likevel har jeg nøkkel til den.' },
  { t: 'Brev fra en pasient', b: 'Hver gang jeg sovner, våkner jeg et annet sted i bygget. Sykepleierne kaller meg ved nye navn. Jeg svarer på alle.' },
  { t: 'Overlege Kroks forskningslogg', b: 'Stoffet samles i avløpene. Det reagerer på stolthet. Pasienter som poserer, gir mest. Jeg anbefaler flere kapper.' },
  { t: 'Rundskriv 13-B', b: 'All smerte skal registreres i tre eksemplarer. Ett til pasienten, ett til arkivet og ett til det som bor under arkivet.' },
  { t: 'Badevaktens dagbok', b: 'Vannet husker. Jeg hørte det si navnet mitt. Så sa det navnet til en pasient som ikke er født ennå.' },
  { t: 'Uten avsender', b: 'Journalen ble ikke skrevet om deg. Du ble skrevet ut av journalen. Hver død er en ny side. Den vil ha flere sider.' },
  { t: 'Arkivets regler, punkt 1 til 400', b: 'Punkt 1: Alt skal arkiveres. Punkt 2: Den som arkiverer, arkiveres også. Punkt 3 til 400 er arkivert og kan ikke leses uten skjema 1.' },
  { t: 'Innskrevet på veggen i isolat 4', b: 'De sier det er stille her. Det er ikke stille. Arkivet under meg skriver hele natten. Jeg hører pennen.' },
  { t: 'Overarkivarens lommebok', b: 'Kvittering for 40 000 stempler. Et fotografi av et stempel. En lapp: «Glem ikke å arkivere deg selv før du går hjem.»' },
  { t: 'Siste side', b: 'Utskrivning krever at pasienten leser sin egen journal til slutten. Ingen pasient har gjort det. Ingen pasient har vært en pasient lenge nok.' }
];

const SERVICES = {
  kafeteria: { name: 'Kafeteriaen', npc: 'Fru Ruud', color: 0xe07a3a, tint: [1.08, .98, .84] },
  medisin: { name: 'Medisinluka', npc: 'Søster Hansen', color: 0x9cc7a4, tint: [.95, 1.04, 1.0] },
  vaktmester: { name: 'Vaktmesterskapet', npc: 'Vaktmester Olsen', color: 0x6a5a3a, tint: [1.0, .96, .9] },
  journal: { name: 'Journalskapet', npc: 'Journalen', color: 0xcfae6b, tint: [1.02, 1.0, .92] },
  bibliotek: { name: 'Biblioteket', npc: 'Bibliotekar Ask', color: 0x5a3a2a, tint: [1.0, .94, .86] },
  vaskeri: { name: 'Tøyvaskeriet', npc: 'Vaskeriet', color: 0x7aa0c0, tint: [.92, 1.0, 1.06] }
};
const NPC_LINES = {
  kafeteria: ['Dagens suppe er suppe.', 'Du ser død ut, vennen. Det koster ekstra.', 'Vi har kaffe. Den har ingen medisinsk verdi, men den er varm.'],
  medisin: ['Riktig medisin krever skjema 4-A, 4-B og en skriftlig unnskyldning.', 'Feilbehandling er et sterkt ord. Vi kaller det overraskelser.', 'Ta av deg kappen. Nei, den andre kappen også.'],
  vaktmester: ['Jeg har nøkkel til hver eneste dør her. Bortsett fra mitt eget skap.', 'Alt kan repareres. Unntatt mennesker. Og det skapet.', 'Hvis det rører seg og ikke skal, har jeg teip. Hvis det ikke rører seg og skal, har jeg en mopp.'],
  journal: ['Journalen blar seg frem til deg og sukker.', 'Et ark faller ut. Det er en tegning av deg, datert i morgen.', 'Journalen har skrevet noe i margen. Det er ikke pent.'],
  bibliotek: ['Hysj. Bøkene her er sortert etter hvor pinlig forrige låner døde.', 'Denne står på hylla «Kvalt i egen kappe». Svært populær.', 'Lånetiden er tre uker eller ett liv, det som kommer først.'],
  vaskeri: ['Trommelen snurrer. Noe i den snurrer andre veien.', 'Vi vasker alt. Flekker, statuser, tvil.', 'Ikke stikk hånden inn. Den har fått nok hender.']
};
const OLSEN_LOCKER = ['Olsen prøver alle nøklene. Ingen passer. «Det er det samme hver dag,» sier han.', 'Olsen sparker i skapet. Skapet sparker tilbake.', 'Olsen legger øret mot døra. «Den puster,» hvisker han. «Eller så er det meg.»', 'Døra går opp. Den var ulåst hele tiden. Olsen sier ingenting på en lang stund.'];

// mørkere veggtopper, så de ikke forveksles med korridorgulv
Object.assign(THEMES[1], { cap: '#4a3f31' }); Object.assign(THEMES[2], { cap: '#2a3a37' }); Object.assign(THEMES[3], { cap: '#3a3024' }); Object.assign(THEMES[4], { cap: '#2c2034' });
