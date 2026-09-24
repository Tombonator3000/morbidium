/* ============================================================
   KURIOSITETER  -  gjenstander i Binding of Isaac-ånd
   Gjenstandene endrer tall, angrep og utseende, og de stables: hoste fra én,
   målsøking fra en annen, deling fra en tredje, eksplosjon fra en fjerde.
   Tre fra samme gruppe gir en forvandling. Ukjente piller får tilfeldig virkning
   per løp. Nye groteske fiender: kjøttfluer, vandrende svulst, hostende lunge.
   Blodsøl og innvoller blir liggende på gulvet.
   ============================================================ */

/* ---------- ikonspråk: e=ellipse, r=rektangel, p=polygon, l=linje, d=prikk (enheter -0,5..0,5) ---------- */
const ITEMS = {
  tuberkulose: { name: 'Tuberkuløs hoste', desc: 'Hvert slag hoster opp en slimklump. Ikke dekk til munnen.', tags: ['kropp'], pool: ['kabinett', 'sjef'], ico: [['e', -.13, 0, .15, .23, '#e88a8a'], ['e', .13, 0, .15, .23, '#e88a8a'], ['l', [[0, -.34], [0, -.1]], .07, '#c86a6a'], ['e', .24, .22, .09, .07, '#b8c24a']] },
  bronkitt: { name: 'Kronisk bronkitt', desc: 'Hostene kommer i treer. Legen sier det er normalt.', tags: ['kropp'], pool: ['kabinett', 'blod'], ico: [['e', -.2, .06, .11, .09, '#b8c24a'], ['e', 0, -.1, .11, .09, '#b8c24a'], ['e', .2, .06, .11, .09, '#b8c24a']] },
  spyttkjertel: { name: 'Overaktiv spyttkjertel', desc: 'Større, tregere og tyngre klumper.', st: { shotDmg: 1.4, shotSpeed: .8 }, pool: ['kabinett', 'butikk'], ico: [['p', [[0, -.38], [.22, -.02], [.16, .24], [-.16, .24], [-.22, -.02]], '#d8e8a8']] },
  magnet: { name: 'Svelget magnet', desc: 'Klumpene søker mot nærmeste fiende. Den sitter der fortsatt.', tags: ['metall'], pool: ['kabinett', 'butikk'], ico: [['l', [[-.2, .26], [-.2, -.04], [0, -.26], [.2, -.04], [.2, .26]], .15, '#c8322a'], ['r', -.28, .2, .16, .1, '#c8ccd0'], ['r', .12, .2, .16, .1, '#c8ccd0']] },
  syl: { name: 'Syl i spiserøret', desc: 'Klumpene går gjennom to fiender.', tags: ['metall'], pool: ['kabinett', 'butikk'], ico: [['r', -.04, -.38, .08, .5, '#c8ccd0'], ['r', -.09, .1, .18, .26, '#8a5a34']] },
  celledeling: { name: 'Ukontrollert celledeling', desc: 'Klumpene deler seg i tre når de treffer.', tags: ['svulst'], pool: ['kabinett', 'blod'], ico: [['e', -.14, .08, .16, .16, '#e8a0b0'], ['e', .14, .08, .16, .16, '#e8a0b0'], ['e', 0, -.14, .16, .16, '#f0b8c4']] },
  nitro: { name: 'Nitroglyserintabletter', desc: 'For hjertet. Klumpene eksploderer.', pool: ['blod', 'sjef'], ico: [['r', -.18, -.2, .36, .5, '#c8322a'], ['r', -.14, -.06, .28, .16, '#f4ecd8'], ['r', -.2, -.3, .4, .12, '#e8e8e8'], ['p', [[.02, -.46], [.1, -.34], [0, -.3], [-.08, -.36]], '#ffb030']] },
  kvikksolv: { name: 'Knust kvikksølvtermometer', desc: 'Treff forgifter. Ikke slikk på det.', tags: ['metall'], pool: ['kabinett'], ico: [['r', -.05, -.38, .1, .56, '#eef0f4'], ['d', 0, .24, .11, '#c8ccd8'], ['d', .2, .3, .05, '#c8ccd8'], ['d', -.18, .34, .04, '#c8ccd8']] },
  frost: { name: 'Frostskadet tå', desc: 'Treff bremser fiender. Tåa var ikke din.', pool: ['kabinett'], ico: [['e', 0, .06, .18, .26, '#b8e0f4'], ['e', 0, -.1, .1, .08, '#e8f8ff'], ['p', [[-.3, -.3], [-.2, -.1], [-.26, -.12]], '#e8f8ff']] },
  elektro: { name: 'Elektrosjokkbehandling', desc: 'Treff hopper videre til to fiender til.', pool: ['blod', 'sjef'], ico: [['p', [[.08, -.42], [-.2, .04], [-.02, .04], [-.1, .42], [.2, -.06], [.02, -.06]], '#ffd23a']] },
  boomerang: { name: 'Tilbakefall', desc: 'Klumpene kommer tilbake. Som alt annet.', pool: ['kabinett', 'butikk'], ico: [['l', [[-.28, .2], [-.04, -.24], [.28, .1]], .14, '#a8743a']] },
  sprett: { name: 'Gummicelle', desc: 'Klumpene spretter på veggene.', pool: ['kabinett', 'butikk'], ico: [['e', 0, 0, .28, .28, '#c84a4a'], ['e', -.08, -.1, .08, .06, '#f0a0a0']] },
  igle: { name: 'Blodigler', desc: 'Treff gir deg litt helse tilbake. Iglene er fornøyde.', tags: ['kropp'], look: 'igler', pool: ['kabinett', 'blod'], ico: [['l', [[-.28, .16], [-.1, -.1], [.12, -.06], [.26, -.24]], .14, '#3a2a1a'], ['d', .26, -.24, .05, '#c8322a']] },
  glassoye: { name: 'Lånt glassøye', desc: 'Lengre rekkevidde og flere kritiske treff. Eieren vil ha det tilbake.', tags: ['kirurg'], st: { range: 1.2, luck: 10 }, look: 'glassoye', pool: ['kabinett', 'sjef'], ico: [['e', 0, 0, .3, .3, '#f4f4ee'], ['d', .04, 0, .14, '#4a7ac8'], ['d', .04, 0, .06, '#1a1a1a'], ['d', -.06, -.1, .04, '#ffffff']] },
  ekstra_tunge: { name: 'Ekstra tunge', desc: 'Klumpene flyr lenger og raskere.', tags: ['kropp'], st: { shotRange: 1.5, shotSpeed: 1.25 }, look: 'tunge', pool: ['kabinett'], ico: [['p', [[-.18, -.3], [.18, -.3], [.2, .1], [0, .34], [-.2, .1]], '#e87a8a'], ['l', [[0, -.24], [0, .14]], .03, '#b84a5a']] },
  adrenalin: { name: 'Hestesprøyte med adrenalin', desc: 'Raskere bein og raskere slag. Hjertet klager.', tags: ['kirurg'], st: { speed: 1.22, rate: 1.12 }, pool: ['sjef', 'butikk'], ico: [['r', -.09, -.3, .18, .48, '#e4f2f6'], ['r', -.06, -.12, .12, .28, '#d83a3a'], ['l', [[0, -.3], [0, -.46]], .04, '#8a8a8a'], ['l', [[-.16, .2], [.16, .2]], .06, '#8a8a8a']] },
  blodtrykk: { name: 'Livsfarlig høyt blodtrykk', desc: '30 % mer skade. Du spruter litt når du blir truffet.', st: { dmg: 1.3 }, pool: ['sjef', 'blod'], ico: [['p', [[0, .3], [-.3, 0], [-.26, -.2], [-.1, -.26], [0, -.14], [.1, -.26], [.26, -.2], [.3, 0]], '#d8322a'], ['e', .18, .16, .12, .12, '#f4f2ea'], ['l', [[.18, .16], [.24, .08]], .03, '#1a1a1a']] },
  bart: { name: 'Pålimt bart', desc: 'Flere kritiske treff og bedre priser. Folk stoler på bart.', st: { luck: 8 }, look: 'bart', pool: ['butikk', 'kabinett'], ico: [['p', [[0, -.04], [-.14, -.1], [-.34, 0], [-.4, .12], [-.2, .06], [0, .08], [.2, .06], [.4, .12], [.34, 0], [.14, -.1]], '#3a2418']] },
  hjerte_i_glass: { name: 'Hjerte på glass', desc: 'Ett ekstra hjerte og full helse. Det slår fortsatt.', tags: ['svulst'], hearts: 1, pool: ['sjef', 'butikk'], ico: [['r', -.24, -.32, .48, .64, '#cfe8e0'], ['p', [[0, .18], [-.16, 0], [-.12, -.12], [0, -.06], [.12, -.12], [.16, 0]], '#c8322a'], ['r', -.26, -.38, .52, .1, '#8a8f96']] },
  svulst: { name: 'Godartet svulst (sier de)', desc: 'To ekstra hjerter. Litt tregere. Den vokser.', tags: ['svulst'], hearts: 2, st: { speed: .95 }, look: 'svulst', pool: ['kabinett', 'sjef'], ico: [['e', 0, .04, .3, .26, '#e8a0a0'], ['e', -.12, -.12, .12, .1, '#f0b8b8'], ['l', [[-.2, .1], [0, 0], [.14, .14]], .03, '#a8404a']] },
  svulstvenn: { name: 'Svulsten Sverre', desc: 'En svulst går i bane rundt deg og stopper prosjektiler.', tags: ['svulst'], pool: ['kabinett', 'blod'], ico: [['e', 0, .04, .28, .26, '#e8a0a0'], ['d', -.1, -.02, .05, '#1a1a1a'], ['d', .1, -.02, .05, '#1a1a1a'], ['l', [[-.08, .14], [.08, .14]], .03, '#1a1a1a']] },
  cyste: { name: 'Pratsom cyste', desc: 'Når du blir truffet, spytter den klumper i alle retninger.', tags: ['svulst'], pool: ['kabinett'], ico: [['e', 0, 0, .28, .24, '#e8d070'], ['e', 0, .08, .1, .05, '#6a3a1a']] },
  rattent_kjott: { name: 'Råttent kjøtt', desc: 'Hver fiende du dreper, gir deg en flue som kjemper for deg.', tags: ['flue'], pool: ['kabinett', 'blod'], ico: [['e', 0, .04, .3, .22, '#8a6a4a'], ['e', .04, 0, .18, .12, '#a8c070'], ['d', -.26, -.26, .04, '#1a1a1a'], ['d', .2, -.3, .04, '#1a1a1a'], ['d', .3, -.18, .04, '#1a1a1a']] },
  fluepapir: { name: 'Fluepapir', desc: 'Fluene dine gjør dobbel skade og fanger skudd.', tags: ['flue'], pool: ['kabinett', 'butikk'], ico: [['r', -.12, -.4, .24, .8, '#e8d060'], ['d', 0, -.2, .05, '#1a1a1a'], ['d', -.04, .02, .05, '#1a1a1a'], ['d', .04, .22, .05, '#1a1a1a']] },
  surkal: { name: 'Gammel surkål', desc: 'Når du ruller, slipper du en gass som gir fiender kvalme.', tags: ['flue'], pool: ['kabinett', 'butikk'], ico: [['r', -.22, -.28, .44, .56, '#cfe0d0'], ['l', [[-.14, 0], [.14, -.06]], .04, '#c8c060'], ['l', [[-.12, .12], [.12, .08]], .04, '#c8c060'], ['r', -.24, -.36, .48, .1, '#8a5a34']] },
  lavement: { name: 'Lavement', desc: 'Når du løper fort, etterlater du et glatt, brunt spor. Fiender sklir.', tags: ['flue'], pool: ['kabinett', 'blod'], ico: [['e', -.06, .12, .22, .2, '#8a3a2a'], ['l', [[.1, -.02], [.34, -.34]], .07, '#2a2a2a']] },
  eyeliner: { name: 'Tung eyeliner', desc: '15 % mer skade når Morbidium er over 50. Tårene er malt på.', tags: ['edgelord'], look: 'eyeliner', pool: ['kabinett', 'blod'], ico: [['e', 0, .06, .3, .16, '#f4f0e6'], ['d', 0, .06, .1, '#1a1a1a'], ['l', [[-.32, .06], [0, -.1], [.32, .06]], .06, '#1a1a1a'], ['l', [[.1, .22], [.12, .38]], .04, '#1a1a1a']] },
  kappe_lang: { name: 'Altfor lang kappe', desc: 'En ekstra rull. Kappen feier gulvet for deg.', tags: ['edgelord'], pool: ['kabinett', 'butikk'], ico: [['p', [[-.12, -.38], [.12, -.38], [.32, .36], [.12, .28], [0, .38], [-.12, .28], [-.32, .36]], '#2a1f33']] },
  dikt: { name: 'Dikt om mørket (14 vers)', desc: 'Står du stille, sovner fiender i nærheten av ren kjedsomhet.', tags: ['edgelord'], pool: ['kabinett'], ico: [['r', -.26, -.36, .52, .72, '#f4ecd8'], ['l', [[-.16, -.2], [.16, -.2]], .03, '#6a5a4a'], ['l', [[-.16, -.08], [.12, -.08]], .03, '#6a5a4a'], ['e', 0, .16, .09, .09, '#e8e4dc'], ['d', -.03, .15, .02, '#1a1a1a'], ['d', .03, .15, .02, '#1a1a1a']] },
  hodeskalle: { name: 'Hodeskalle med stearinlys', desc: 'Et lys brenner på hodet ditt. Fiender helt inntil deg tar brannskade.', tags: ['edgelord'], look: 'lys', pool: ['kabinett', 'blod'], ico: [['e', 0, .1, .24, .22, '#ece4d4'], ['d', -.08, .1, .06, '#1a1a1a'], ['d', .08, .1, .06, '#1a1a1a'], ['r', -.05, -.3, .1, .2, '#f4ecd8'], ['e', 0, -.36, .05, .08, '#ffc040']] },
  lommekirurgi: { name: 'Lommekirurgi', desc: 'Alle slag gir blødning.', tags: ['kirurg'], pool: ['kabinett', 'sjef'], ico: [['r', -.3, -.08, .5, .16, '#c8ccd0'], ['r', .2, -.1, .16, .2, '#6b4226'], ['l', [[-.3, .08], [.2, .08]], .03, '#1a1a1a']] },
  eterflaske: { name: 'Evig eterflaske', desc: 'Fiender du treffer, sovner et øyeblikk.', tags: ['kirurg'], pool: ['kabinett', 'butikk'], ico: [['p', [[-.16, .34], [.16, .34], [.2, -.06], [.08, -.2], [-.08, -.2], [-.2, -.06]], '#9ad0e0'], ['r', -.06, -.34, .12, .14, '#6b4226']] },
  stemmegaffel: { name: 'Stemmegaffel', desc: 'Tunge slag sender ut en sjokkbølge.', tags: ['kirurg', 'metall'], pool: ['kabinett', 'sjef'], ico: [['l', [[-.12, -.36], [-.12, 0], [0, .1], [.12, 0], [.12, -.36]], .07, '#c8ccd0'], ['l', [[0, .1], [0, .38]], .07, '#c8ccd0']] },
  tannfe: { name: 'Fanget tannfe', desc: 'Tannfeen henter tenner til deg på lang avstand.', tags: ['tann'], pool: ['kabinett', 'butikk'], ico: [['p', [[-.12, -.1], [0, -.14], [.12, -.1], [.1, .12], [.04, .2], [0, .1], [-.04, .2], [-.1, .12]], '#f4dc7a'], ['e', -.24, -.14, .14, .08, '#dff4ff'], ['e', .24, -.14, .14, .08, '#dff4ff']] },
  gulltann: { name: 'Løs gulltann', desc: 'En ekstra tann per drap, og treff kan slå ut tenner.', tags: ['tann'], pool: ['kabinett', 'butikk'], ico: [['p', [[-.2, -.24], [0, -.3], [.2, -.24], [.18, .08], [.08, .3], [0, .1], [-.08, .3], [-.18, .08]], '#f4d050']] },
  tang: { name: 'Tannlegens tang', desc: 'Klumpene dine blir til tenner: mer skade, og drap gir tenner.', tags: ['tann', 'metall'], pool: ['kabinett', 'sjef'], ico: [['l', [[-.24, .36], [-.04, -.1], [.02, -.3]], .07, '#c8ccd0'], ['l', [[.24, .36], [.04, -.1], [-.02, -.3]], .07, '#c8ccd0'], ['p', [[-.08, -.46], [.08, -.46], [.06, -.32], [-.06, -.32]], '#f4f0e0']] },
  brodsmuler: { name: 'Brødsmuler i lomma', desc: 'En due følger deg inn i hvert rom som låses.', pool: ['butikk', 'kabinett'], ico: [['e', -.14, .1, .1, .07, '#c89a5a'], ['e', .12, .02, .12, .08, '#d8aa6a'], ['e', 0, -.16, .08, .06, '#c89a5a'], ['e', .2, .22, .06, .05, '#c89a5a']] },
  speil: { name: 'Knust speil', desc: '13 % sjanse for dobbel skade. 1 % sjanse for å kutte deg selv.', pool: ['blod', 'kabinett'], ico: [['e', 0, 0, .24, .32, '#b8d8e8'], ['l', [[-.1, -.24], [.02, -.02], [-.06, .1], [.1, .28]], .03, '#1a1a1a'], ['e', 0, 0, .28, .36, null]] },
  heliumlunge: { name: 'Heliumlunge', desc: 'Du svever litt over gulvet. Pytter og strøm biter ikke på deg.', tags: ['kropp'], pool: ['kabinett', 'butikk'], ico: [['e', -.1, -.08, .16, .22, '#f0a8c0'], ['e', .1, -.08, .16, .22, '#f0a8c0'], ['l', [[0, .14], [.04, .44]], .03, '#6a6a6a']] },
  karantene: { name: 'Karantenebånd', desc: 'Fiender i låste rom har 20 % mindre helse.', pool: ['butikk', 'kabinett'], ico: [['p', [[-.44, -.12], [.44, -.24], [.44, 0], [-.44, .12]], '#f0d040'], ['l', [[-.3, -.08], [-.2, .06]], .06, '#1a1a1a'], ['l', [[-.04, -.12], [.06, .02]], .06, '#1a1a1a'], ['l', [[.22, -.16], [.32, -.02]], .06, '#1a1a1a']] }
};
const ITEM_IDS = Object.keys(ITEMS);
const TRANSFORMS = {
  flue: { name: 'Fluekongen', desc: 'Klumpene dine er nå fluer som jager fiender, og to fluer følger deg alltid.' },
  svulst: { name: 'Svulstbaronen', desc: 'To ekstra hjerter, og svulstene dine skyter tilbake.' },
  edgelord: { name: 'Selverklært mørkets fyrste', desc: 'Horn, 20 % mer skade og en aura av pinlighet.' },
  kirurg: { name: 'Selvopererende', desc: 'Lengre rekkevidde, og tunge slag treffer hele veien rundt.' },
  tann: { name: 'Tannfeen selv', desc: 'Dobbelt så mange tenner, og klumpene dine er av gull.' }
};
const SYNERGIES = [
  [['tuberkulose', 'nitro'], 'Eksplosiv hoste'], [['tuberkulose', 'magnet'], 'Målsøkende slim'], [['celledeling', 'nitro'], 'Kjedereaksjon'],
  [['bronkitt', 'celledeling'], 'Epidemi'], [['elektro', 'kvikksolv'], 'Giftig strøm'], [['boomerang', 'syl'], 'Tilbakefallets syl'],
  [['rattent_kjott', 'fluepapir'], 'Fluefarm'], [['lavement', 'surkal'], 'Fordøyelsesbesvær'], [['eyeliner', 'dikt'], 'Posør'], [['igle', 'blodtrykk'], 'Blodbank']
];
/* piller: farge per løp, virkning ukjent til første gang */
const PILL_COL = { pille_rod: ['Rød pille', '#c8322a'], pille_bla: ['Blå pille', '#3a6ac8'], pille_gul: ['Gul pille', '#e8c040'], pille_hvit: ['Hvit pille', '#f4f2ea'], pille_svart: ['Svart pille', '#2a2a2a'], pille_rosa: ['Rosa pille', '#f2a8c8'], pille_gronn: ['Grønn pille', '#6aa84a'], pille_flekket: ['Flekket pille', '#f4f2ea'] };
const PILLS = {
  helse: ['Helse opp', 'Ett ekstra hjerte.'], svakhet: ['Helse ned', 'Ett hjerte mindre. Beklager.'], fart: ['Fart opp', 'Raskere resten av etasjen.'], treg: ['Fart ned', 'Tregere resten av etasjen.'],
  kraft: ['Kraft', '20 % mer skade resten av etasjen.'], diare: ['Diaré', 'Glatt, brunt spor resten av etasjen.'], oppkast: ['Oppkast', 'En ring av oppkast rundt deg.'], morb: ['Mørke tanker', '30 Morbidium.'],
  rens: ['Klarhet', '40 mindre Morbidium.'], kjempe: ['Gigantisme', 'Større, sterkere og tregere resten av etasjen.'], krymp: ['Krymping', 'Mindre og raskere resten av etasjen.'], kart: ['Opplysning', 'Hele etasjen tegnes på kartet.'],
  glemsel: ['Hukommelsestap', 'Kartet er borte.'], tenner: ['Tannfeen var her', '12 gulltenner under puta.'], placebo: ['Placebo', 'Ingenting skjer. Du føler deg bedre.']
};
for (const [id, [nm]] of Object.entries(PILL_COL)) CONSUMABLES[id] = { name: nm, desc: 'Ukjent virkning. Bare prøv.' };

/* ---------- nye groteske fiender ---------- */
Object.assign(ENEMIES, {
  flue: { name: 'Kjøttflue', hp: 6, speed: 5.4, r: .26, dmg: 3, xp: 2, teeth: [0, 0] },
  svulst: { name: 'Vandrende svulst', hp: 44, speed: 1.1, r: .52, dmg: 7, xp: 12, teeth: [1, 3] },
  lunge: { name: 'Hostende lunge', hp: 26, speed: 2.1, r: .42, dmg: 6, xp: 9, teeth: [0, 2] }
});
Object.assign(LINES, { flue: ['bzz', 'bzzz', 'BZZ'], svulst: ['Godartet!', 'Jeg er en del av deg nå.', '*pulserer*', 'Vi vokser sammen.'], lunge: ['*host*', '*harker*', 'Ikke røyk, barn.', 'Jeg var en gang en tenor.'] });
Object.assign(DEATH_CAUSES, { flue: ['Spist av fluer. Fluene var fornøyde.', 'Gikk bort i en sky av surring.'], svulst: ['Omfavnet av en svulst som bare ville være venner.'], lunge: ['Hostet på av en lunge uten eier. Smittsomt.', 'Druknet i fremmed slim.'] });
DEPTH_ENEMIES[1].push('flue', 'flue', 'lunge'); DEPTH_ENEMIES[2].push('svulst', 'lunge', 'flue', 'flue'); DEPTH_ENEMIES[3].push('lunge', 'svulst', 'flue'); DEPTH_ENEMIES[4].push('svulst', 'svulst', 'flue', 'lunge');
Object.assign(RIG, {
  flue: { blob: true, scale: .5, tentacles: 2, tentW: .04, tentCol: '#2a2a2a', float: true, pulse: 40, tentSpread: .24 },
  svulst: { blob: true, scale: .95, tentacles: 6, tentW: .07, tentCol: '#a8404a', pulse: 3, tentSpread: .8 },
  lunge: { blob: true, scale: .85, tentacles: 2, tentW: .08, tentCol: '#c86a6a', pulse: 5, tentSpread: .3 }
});
const BLOBS = {
  flue: [.9, .7, .45, .1, v => g => {
    A.flat(g, A.ell(-.2, -.42, .16, .1, -.4), 'rgba(220,240,255,.7)', .03); A.flat(g, A.ell(.2, -.42, .16, .1, .4), 'rgba(220,240,255,.7)', .03);
    A.cel(g, A.ell(0, -.26, .18, .16), '#2a3a2a', { sk: .6 }); A.cel(g, A.ell(0, -.1, .14, .12), '#3a5a3a', { sk: .6, lw: .035 });
    if (v !== 'b') { A.cel(g, A.ell(-.09, -.3, .08, .08), '#c8322a', { lw: .03 }); A.cel(g, A.ell(.09, -.3, .08, .08), '#c8322a', { lw: .03 }); }
  }],
  svulst: [1.4, 1.1, .7, .08, v => g => {
    A.cel(g, A.blob([[-.56, -.04], [-.6, -.4], [-.34, -.74], [-.02, -.82], [.36, -.7], [.6, -.42], [.54, -.06], [0, .02]]), '#e8a0a0', { sk: .72 });
    A.cel(g, A.ell(-.26, -.56, .16, .13), '#f0b8b8', { lw: .03 }); A.cel(g, A.ell(.3, -.34, .13, .11), '#f0b8b8', { lw: .03 });
    for (const [a, b] of [[[-.4, -.2], [-.1, -.4]], [[.1, -.1], [.4, -.5]], [[-.2, -.7], [0, -.5]]]) A.line(g, [a, b], .025, '#a8404a');
    if (v !== 'b') { A.flat(g, A.ell(.02, -.44, .12, .12), '#f6f0e0', .035); A.dot(g, .05, -.44, .05); A.curve(g, [-.16, -.22], [0, -.12], [.16, -.22], .035); }
    for (const [x, y] of [[-.4, -.5], [.2, -.72], [.46, -.2]]) A.line(g, [[x, y], [x + .04, y - .08]], .02, '#3a2418');
  }],
  lunge: [1.2, 1.1, .6, .08, v => g => {
    A.line(g, [[0, -.95], [0, -.58], [-.2, -.5]], .1, '#c8a0a0'); A.line(g, [[0, -.58], [.2, -.5]], .1, '#c8a0a0');
    A.cel(g, A.blob([[-.04, -.52], [-.3, -.6], [-.5, -.36], [-.5, -.04], [-.24, .02], [-.06, -.14]]), '#e88a8a', { sk: .75 });
    A.cel(g, A.blob([[.04, -.52], [.3, -.6], [.5, -.36], [.5, -.04], [.24, .02], [.06, -.14]]), '#e88a8a', { sk: .75 });
    for (const [x, y] of [[-.3, -.3], [-.2, -.14], [.34, -.24], [.24, -.4]]) A.flat(g, A.ell(x, y, .05, .04), '#6a5a5a', 0);
    if (v !== 'b') { A.dot(g, -.22, -.4, .04); A.dot(g, .22, -.4, .04); A.curve(g, [-.1, -.26], [0, -.2], [.1, -.26], .03); }
  }]
};
{ const _cp = charPart; charPart = function (type, piece, v) { if (piece === 'blob' && BLOBS[type]) { const b = BLOBS[type]; return Art.part('blob_' + type + '_' + v, b[0], b[1], b[2], b[3], b[4](v)); } return _cp(type, piece, v); }; }
{ const _bp = bottlePart; bottlePart = function (id) { return id && id.startsWith('pille_') ? pillPart(id) : _bp(id); }; }
function pillPart(id) {
  const [, col] = PILL_COL[id] || ['', '#fff'];
  return Art.part('pille_' + id, .5, .4, .25, .08, g => {
    g.save(); g.translate(0, -.14); g.rotate(-.5);
    A.cel(g, A.rr(-.18, -.08, .18, .16, .08), col, { lw: .035 }); A.cel(g, A.rr(0, -.08, .18, .16, .08), id === 'pille_flekket' ? '#f4f2ea' : Col.light(col, .45), { lw: .035 });
    if (id === 'pille_flekket') for (const [x, y] of [[-.1, -.02], [.06, .02], [.12, -.03]]) A.dot(g, x, y, .02, '#c8322a');
    g.restore();
  });
}
function itemIcon(id) {
  const it = ITEMS[id];
  return Art.part('kur_' + id, 1, 1, .5, .5, g => {
    for (const o of it ? it.ico : []) {
      const t = o[0];
      if (t === 'e') { if (o[5]) A.cel(g, A.ell(o[1], o[2], o[3], o[4]), o[5], { lw: .045 }); else A.flat(g, A.ell(o[1], o[2], o[3], o[4]), null, .05); }
      else if (t === 'r') A.cel(g, A.rr(o[1], o[2], o[3], o[4], Math.min(o[3], o[4]) * .25), o[5], { lw: .045 });
      else if (t === 'p') A.cel(g, A.blob(o[1]), o[2], { lw: .045 });
      else if (t === 'l') { A.line(g, o[1], o[2] + .05, INK); A.line(g, o[1], o[2], o[3]); }
      else if (t === 'd') A.dot(g, o[1], o[2], o[3], o[4]);
    }
  });
}
/* preparatglass med formalin og kuriositeten inni */
function jarPart(id) {
  // med glasset fra ChatGPT: formalin og kuriositeten bak, glassbildet over, så fylte og tomme glass ser like ut
  const img = Art.img && Art.img.glass_tomt;
  if (id && img && img.complete && img.naturalWidth) return Art.part('glassbilde_' + id, 1, 1.5, .5, .05, g => {
    A.flat(g, A.rr(-.31, -.98, .62, .74, .1), 'rgba(150,210,120,.34)', 0);
    g.save(); g.translate(0, -.62); g.scale(.56, .56); const P = itemIcon(id); g.drawImage(P.canvas, -.5, -.5, 1, 1); g.restore();
    for (const [x, y] of [[-.18, -.84], [.14, -.5], [.2, -.9]]) A.flat(g, A.ell(x, y, .025, .025), 'rgba(255,255,255,.6)', .01, '#2f4a3a');
    g.drawImage(img, -.5, -1.45, 1, 1.5);
  });
  return Art.part('glass_' + (id || 'tomt'), 1, 1.5, .5, .05, g => {
    A.cel(g, A.rr(-.38, -.18, .76, .18, .04), '#5a4a3a', { line: '#2a1a10' });
    A.flat(g, A.rr(-.32, -1.2, .64, 1.02, .12), 'rgba(170,220,190,.35)', .045, '#2f4a3a');
    if (id) { A.flat(g, A.rr(-.3, -.9, .6, .72, .1), 'rgba(150,210,120,.35)', 0); g.save(); g.translate(0, -.62); g.scale(.55, .55); const P = itemIcon(id); g.drawImage(P.canvas, -.5, -.5, 1, 1); g.restore(); for (const [x, y] of [[-.18, -.78], [.14, -.5], [.2, -.86]]) A.flat(g, A.ell(x, y, .03, .03), 'rgba(255,255,255,.6)', .012, '#2f4a3a'); }
    A.cel(g, A.rr(-.36, -1.34, .72, .16, .04), '#8a8f96', { line: '#26302f' });
    A.line(g, [[-.22, -1.12], [-.22, -.36]], .04, 'rgba(255,255,255,.55)');
  });
}
function shotPart(kind) {
  if (kind === 'tann') return toothPart();
  if (kind === 'flue') return BLOBS.flue && charPart('flue', 'blob', 'f');
  return Art.part('skudd_slim', .5, .5, .25, .25, g => { A.cel(g, A.blob([[-.16, .02], [-.04, -.16], [.14, -.12], [.18, .06], [0, .16]]), '#c8d060', { lw: .035 }); A.flat(g, A.ell(-.04, -.06, .04, .03), '#f4f8d0', 0); });
}
const LOOKS = {
  glassoye: { at: 'head', w: .3, h: .3, off: { f: [.16, .46], s: [.26, .46] }, face: true, draw: g => { A.flat(g, A.ell(0, 0, .12, .12), '#f4f4ee', .03); A.dot(g, .02, 0, .06, '#3a7ad8'); A.dot(g, .02, 0, .025, '#101010'); } },
  svulst: { at: 'head', w: .5, h: .4, off: { f: [-.26, .8], s: [-.18, .82], b: [.26, .8] }, draw: g => { A.cel(g, A.ell(0, 0, .18, .14), '#e8a0a0', { lw: .035 }); A.line(g, [[-.1, .02], [.04, -.04]], .02, '#a8404a'); } },
  lys: { at: 'head', w: .3, h: .6, off: { f: [.02, 1.02], s: [0, 1.02], b: [0, 1.02] }, draw: g => { A.cel(g, A.rr(-.05, -.08, .1, .24, .02), '#f4ecd8', { lw: .03 }); A.flat(g, A.ell(0, -.16, .045, .08), '#ffc040', .02); A.flat(g, A.ell(0, -.15, .02, .04), '#fff4c0', 0); } },
  bart: { at: 'head', w: .5, h: .2, off: { f: [0, .3], s: [.3, .3] }, face: true, draw: g => A.cel(g, A.blob([[0, -.02], [-.08, -.05], [-.2, 0], [-.22, .06], [-.1, .03], [0, .04], [.1, .03], [.22, .06], [.2, 0], [.08, -.05]]), '#3a2418', { lw: .025 }) },
  tunge: { at: 'head', w: .2, h: .3, off: { f: [.02, .18], s: [.34, .18] }, face: true, draw: g => A.cel(g, A.blob([[-.06, -.06], [.06, -.06], [.07, .06], [0, .12], [-.07, .06]]), '#e87a8a', { lw: .025 }) },
  eyeliner: { at: 'head', w: .6, h: .25, off: { f: [0, .47], s: [.24, .47] }, face: true, draw: g => { for (const x of [-.16, .16]) { A.line(g, [[x - .12, .02], [x, -.04], [x + .12, .02]], .035); A.line(g, [[x + .06, .04], [x + .07, .12]], .025); } } },
  igler: { at: 'body', w: .7, h: .6, off: { f: [0, .3], s: [0, .3], b: [0, .3] }, draw: g => { for (const [x, y, r] of [[-.18, -.08, .4], [.14, .04, -.3], [.02, .16, .1]]) { g.save(); g.translate(x, y); g.rotate(r); A.cel(g, A.ell(0, 0, .09, .04), '#3a2a1a', { lw: .02 }); g.restore(); } } },
  horn: { at: 'head', w: .9, h: .5, off: { f: [0, .9], s: [-.02, .9], b: [0, .9] }, draw: g => { for (const s of [-1, 1]) A.cel(g, A.poly([[s * .12, .08], [s * .3, .06], [s * .36, -.2]]), '#8a2a2a', { lw: .03 }); } },
  bandasje: { at: 'head', w: .9, h: .3, off: { f: [0, .68], s: [0, .68], b: [0, .68] }, draw: g => { A.cel(g, A.rr(-.38, -.06, .76, .12, .05), '#f4f2ea', { lw: .03 }); A.dot(g, .2, 0, .03, '#c8322a'); } }
};
function addonPart(k) { const L = LOOKS[k]; return Art.part('tillegg_' + k, L.w, L.h, L.w / 2, L.h / 2, L.draw); }
function splatTex(i) {
  const key = 'splat' + i;
  if (!splatTex.c) splatTex.c = {};
  if (!splatTex.c[key]) splatTex.c[key] = R.canvasTex(96, 96, g => {
    const rng = mulberry32(i * 31 + 5); g.fillStyle = '#ffffff';
    g.beginPath(); for (let a = 0; a <= 16; a++) { const an = a / 16 * TAU, rr = 22 + rng() * 14; g.lineTo(48 + Math.cos(an) * rr, 48 + Math.sin(an) * rr); } g.fill();
    for (let k = 0; k < 7; k++) { const an = rng() * TAU, d = 30 + rng() * 14; g.beginPath(); g.arc(48 + Math.cos(an) * d, 48 + Math.sin(an) * d, 3 + rng() * 5, 0, TAU); g.fill(); }
  });
  return splatTex.c[key];
}

/* ============================================================
   MOTOREN
   ============================================================ */
const Items = {
  shots: [], eshots: [], orbits: [], pedestals: [], splats: [], addons: {}, auraT: 0, stillT: 0, trailT: 0, leechT: 0, sverreT: 0, liftG: null, liftT: 0,
  run() { return G.run || {}; },
  owned() { return this.run().items || []; },
  has(id) { return this.owned().includes(id); },
  tf(t) { return (this.run().transforms || []).includes(t); },
  stat(n) {
    const luck = n === 'luck'; let v = luck ? 0 : 1;
    for (const id of this.owned()) { const s = ITEMS[id] && ITEMS[id].st; if (s && s[n] !== undefined) v = luck ? v + s[n] : v * s[n]; }
    const b = this.run().buffs || {};
    if (!luck && b[n]) v *= b[n];
    if (luck && Lomme.has('hestesko')) v += 10;
    if (n === 'dmg' && this.tf('edgelord')) v *= 1.2;
    if (n === 'dmg' && this.has('eyeliner') && G.player && G.player.morb > 50) v *= 1.15;
    if (n === 'range' && this.tf('kirurg')) v *= 1.2;
    return v;
  },
  hearts() { let h = 0; for (const id of this.owned()) h += ITEMS[id].hearts || 0; if (this.tf('svulst')) h += 2; const r = this.run(); return h + (r.pillHearts || 0) - (r.heartDebt || 0); },
  newRun() {
    const r = G.run; r.items = []; r.transforms = []; r.synergies = []; r.flies = 0; r.pillKnown = {}; r.buffs = {}; r.heartDebt = 0; r.pillHearts = 0;
    const eff = shuf(Object.keys(PILLS)); r.pills = {}; Object.keys(PILL_COL).forEach((id, i) => { r.pills[id] = eff[i % eff.length]; CONSUMABLES[id].name = PILL_COL[id][0]; CONSUMABLES[id].desc = 'Ukjent virkning. Bare prøv.'; });
    this.clearLook();
  },
  pickFrom(pool) {
    const cand = ITEM_IDS.filter(id => ITEMS[id].pool.includes(pool) && !this.has(id) && !this.pedestals.some(p => p.id === id && !p.taken));
    return cand.length ? pick(cand) : pick(ITEM_IDS.filter(id => !this.has(id))) || 'hjerte_i_glass';
  },
  /* ---------- preparatglass ---------- */
  spawnPedestal(x, z, id, price) {
    const s = freeSpot(x, z, 2), g = propSprite(null, s.x, s.z, { P: jarPart(id) }); R.level.add(g);
    const light = R.light(s.x, s.z + .2, 2.2, price && price.hp ? '#ff5a4a' : '#b8ffcf', .5, R.levelL);
    const pd = { x: s.x, z: s.z, id, price: price || null, g, light, taken: false }; this.pedestals.push(pd); return pd;
  },
  priceText(pd) { const p = pd.price; if (!p) return ''; return p.hp ? ' (koster ' + p.hp + ' hjerte' + (p.hp > 1 ? 'r' : '') + ')' : ' (' + p.teeth + ' gulltenner)'; },
  take(pd) {
    const P = G.player, p = pd.price;
    if (p && p.hp) { if (P.maxHp - p.hp * 10 < 10) { toast('For lite hjerte igjen', 'Blodofferet vil ha mer enn du har'); Sound.play('deny'); return; } G.run.heartDebt += p.hp; recalcPlayer(); Sound.play('hurt', .8, .6); this.splat(P.x, P.z, '#8a1010', 1.4); }
    if (p && p.teeth) { if (P.teeth < p.teeth) { toast('For få tenner', p.teeth + ' gulltenner trengs'); Sound.play('deny'); return; } P.teeth -= p.teeth; }
    pd.taken = true; R.remove(pd.g); pd.g = propSprite(null, pd.x, pd.z, { P: jarPart(null) }); R.level.add(pd.g);
    for (const o of this.pedestals) if (o !== pd && o.pair === pd.pair && pd.pair && !o.taken) { o.taken = true; R.remove(o.g); o.g = propSprite(null, o.x, o.z, { P: jarPart(null) }); R.level.add(o.g); }
    if (pd.akt) Aktiv.give(pd.akt, pd.charge); else this.give(pd.id); Spesial.onTake(pd);
  },
  give(id) {
    const P = G.player, it = ITEMS[id]; if (!it || this.has(id)) return;
    G.run.items.push(id); hudCardsKey = ''; this.itemsKey = '';
    toast(it.name, it.desc); Sound.play('level'); Sound.play('pickup');
    // pasienten løfter kuriositeten over hodet, som Isaac
    this.liftT = 1.1; if (this.liftG) R.remove(this.liftG); this.liftG = sprite(itemIcon(id), P.x, P.z, {}); this.liftG.scale.setScalar(.8);
    if (it.hearts) { recalcPlayer(); healPlayer(P.maxHp, true); }
    if (id === 'kappe_lang') { P.dodgeMax++; P.dodge++; }
    this.checkTransforms(); this.checkSynergies(); this.updateLook();
  },
  checkTransforms() {
    const r = G.run;
    for (const t of Object.keys(TRANSFORMS)) {
      if (r.transforms.includes(t)) continue;
      const n = this.owned().filter(id => (ITEMS[id].tags || []).includes(t)).length;
      if (n >= 3) {
        r.transforms.push(t); const T = TRANSFORMS[t];
        setTimeout(() => { stampBig('FORVANDLING', T.name); toast(T.name, T.desc); R.shake(.4); if (R.fx) R.fx.flash = 1; }, 1300);
        if (t === 'svulst') { recalcPlayer(); healPlayer(20, true); }
        if (t === 'flue') r.flies = Math.max(r.flies, 2);
        this.updateLook();
      }
    }
  },
  checkSynergies() {
    const r = G.run;
    for (const [ids, name] of SYNERGIES) if (!r.synergies.includes(name) && ids.every(i => this.has(i))) { r.synergies.push(name); setTimeout(() => stampBig('SYNERGI', name), 2200); }
  },
  /* ---------- utseende: gjenstandene vises på pasienten ---------- */
  looks() { const L = []; for (const id of this.owned()) if (ITEMS[id].look) L.push(ITEMS[id].look); if (this.tf('edgelord')) L.push('horn'); if (this.tf('kirurg')) L.push('bandasje'); return L; },
  clearLook() { for (const k in this.addons) R.remove(this.addons[k]); this.addons = {}; },
  updateLook() {
    const P = G.player; if (!P || !P.doll) return;
    for (const k of this.looks()) if (!this.addons[k]) { const m = partMesh(addonPart(k), P.doll.U); P.doll.plane.add(m); this.addons[k] = m; }
  },
  placeLook() {
    const P = G.player; if (!P || !P.doll || !P.doll.head) return;
    const d = P.doll, v = d.view || 'f';
    for (const k in this.addons) {
      const L = LOOKS[k], m = this.addons[k], base = L.at === 'head' ? d.head : d.body, off = L.off[v] || L.off.f;
      m.visible = !(L.face && v === 'b');
      m.position.set(base.position.x + off[0], base.position.y + off[1], base.position.z + .004); m.rotation.z = base.rotation.z;
    }
  },
  /* ---------- kroker fra kampen ---------- */
  onSwing(k) {
    const P = G.player; let n = (this.has('tuberkulose') ? 1 : 0) + (this.has('bronkitt') ? 2 : 0) + (this.tf('flue') ? 1 : 0);
    if (k.heavy && this.has('stemmegaffel')) { const o = { x: P.x, z: P.z, r: 3.2 * this.stat('range') }; hitShape('circle', o, weaponStats().dmg * .6, { from: 'player', x: P.x, z: P.z, kb: 6 }, 'player'); slashFx(P.x, P.z, P.face, 3.2, TAU, true, 0xcfe8ff); Sound.play('glass', .7, .5); }
    if (!n) return;
    if (k.heavy) n += 2;
    const spread = n > 1 ? (k.heavy ? 1.3 : .55) : 0, dmg = weaponStats().dmg * .5;
    for (let i = 0; i < n; i++) { const a = P.face + (n > 1 ? lerp(-spread / 2, spread / 2, i / (n - 1)) : 0); this.fire(P.x + Math.sin(a) * .45, P.z + Math.cos(a) * .45, a, dmg); }
    Sound.play('vomit', .35, 1.7);
  },
  fire(x, z, a, dmg, o = {}) {
    const big = this.has('spyttkjertel'), tooth = this.has('tang') || this.tf('tann'), fly = this.tf('flue'), sp = 9 * this.stat('shotSpeed');
    const s = { x, z, a, sp, vx: Math.sin(a) * sp, vz: Math.cos(a) * sp, dmg: dmg * this.stat('shotDmg') * (tooth ? 1.25 : 1) * playerDmgMult(), r: big ? .34 : .22, life: (o.life || 1.05) * this.stat('shotRange'),
      pierce: this.has('syl') ? 2 : 0, hit: new Set(), bounce: this.has('sprett') ? 2 : 0, homing: this.has('magnet') || fly, split: this.has('celledeling') && !o.child, boomer: this.has('boomerang') && !o.child ? { t: 0 } : null, child: !!o.child, kind: fly ? 'flue' : tooth ? 'tann' : 'slim' };
    s.g = sprite(shotPart(s.kind), x, z, {}); s.g.position.y = .85; s.g.scale.setScalar((big ? 1.35 : 1) * (o.child ? .7 : 1) * (s.kind === 'flue' ? .6 : 1));
    this.shots.push(s); return s;
  },
  boom(x, z, dmg) {
    hitShape('circle', { x, z, r: 1.3 }, dmg, { from: 'player', x, z, kb: 6 }, 'player'); Spesial.boom(x, z, 1.3);
    puff(x, z, 4, 1, '#6a5a4a'); Particles.spawn(x, .5, z, 16, 0xffa040, { speed: 6, up: 5, life: .45 }); flashLight(x, z, 3.2, '#ffb050', .3, 1.6);
    Sound.play('slam', .6, 1.3); R.shake(.18); this.splat(x, z, '#2a1a10', 1.1, .5);
  },
  hitShot(s, e) {
    hurt(e, s.dmg, { from: 'player', x: s.x - s.vx * .05, z: s.z - s.vz * .05, a: s.a, kb: 3 }); s.hit.add(e);
    if (this.has('kvikksolv')) e.poison = { t: 3, tick: .5, dps: s.dmg * .45 };
    if (this.has('frost')) e.slowT = 2.2;
    if (this.has('igle') && this.leechT <= 0) { this.leechT = .3; healPlayer(1, true); }
    if (this.has('elektro')) { let from = e, n = 0; for (const t of G.enemies) { if (n >= 2) break; if (t === e || !t.alive || d2(t.x, t.z, from.x, from.z) > 16) continue; beam(from.x, from.z, t.x, t.z, 0xfff6a0, .06, .22, 1); hurt(t, s.dmg * .6, { from: 'player', stun: .2 }); if (this.has('kvikksolv')) t.poison = { t: 3, tick: .5, dps: s.dmg * .3 }; from = t; n++; } if (n) Sound.play('zap', .6); }
    if (s.split) for (const da of [-.8, 0, .8]) this.fire(s.x, s.z, s.a + da + Math.PI * (da === 0 ? 0 : 0), s.dmg / playerDmgMult() * .5, { child: true, life: .45 });
    if (this.has('nitro')) this.boom(s.x, s.z, s.dmg * .8);
    if (s.kind === 'tann' && Math.random() < .05) dropTeeth(e.x, e.z, 1);
    Particles.spawn(s.x, .8, s.z, 4, s.kind === 'tann' ? 0xf4d050 : 0xc8d060, { speed: 2, up: 2, life: .3 });
  },
  popShot(s, i) { if (this.has('nitro') && !s.hitAny) this.boom(s.x, s.z, s.dmg * .6); Particles.spawn(s.x, .7, s.z, 5, 0xc8d060, { speed: 2.5, up: 2, life: .3 }); R.remove(s.g); this.shots.splice(i, 1); },
  updateShots(dt) {
    const P = G.player, all = G.boss && G.boss.alive ? G.enemies.concat([G.boss]) : G.enemies;
    for (let i = this.shots.length - 1; i >= 0; i--) {
      const s = this.shots[i]; s.life -= dt;
      if (s.homing) { const t = nearestEnemy(s.x, s.z, 7, e => !s.hit.has(e)); if (t) { s.a += angDiff(Math.atan2(t.x - s.x, t.z - s.z), s.a) * Math.min(1, dt * 5); s.vx = Math.sin(s.a) * s.sp; s.vz = Math.cos(s.a) * s.sp; } }
      if (s.boomer) { s.boomer.t += dt; if (s.boomer.t > .42 && !s.boomer.back) { s.boomer.back = true; s.hit.clear(); s.life = 1.2; } if (s.boomer.back) { s.a = Math.atan2(P.x - s.x, P.z - s.z); s.vx = Math.sin(s.a) * s.sp * 1.2; s.vz = Math.cos(s.a) * s.sp * 1.2; if (d2(s.x, s.z, P.x, P.z) < .4) { R.remove(s.g); this.shots.splice(i, 1); continue; } } }
      const nx = s.x + s.vx * dt, nz = s.z + s.vz * dt;
      if (solid(Math.floor(nx), Math.floor(nz))) {
        if (s.bounce > 0) { s.bounce--; if (solid(Math.floor(nx), Math.floor(s.z))) s.vx *= -1; else s.vz *= -1; s.a = Math.atan2(s.vx, s.vz); Sound.play('bonk', .3, 1.8); }
        else { this.popShot(s, i); continue; }
      } else { s.x = nx; s.z = nz; }
      s.g.position.set(s.x, .85 + Math.sin(G.time * 18 + i) * .04, s.z);
      let dead = false;
      for (const e of all) {
        if (!e.alive || s.hit.has(e) || d2(s.x, s.z, e.x, e.z) > (s.r + e.r) * (s.r + e.r)) continue;
        s.hitAny = true; this.hitShot(s, e);
        if (s.pierce-- <= 0 && !s.boomer) { dead = true; break; }
      }
      if (dead) { R.remove(s.g); this.shots.splice(i, 1); continue; }
      if (s.life <= 0) this.popShot(s, i);
    }
  },
  onHit(e, k, dmg) {
    const P = G.player;
    if (this.has('lommekirurgi') || (Lomme.has('skalpell') && Math.random() < .3)) e.bleed = Math.max(e.bleed || 0, 3);
    if (this.has('eterflaske') && e.kind === 'enemy') e.sleep = Math.max(e.sleep || 0, .5);
    if (this.has('igle') && this.leechT <= 0) { this.leechT = .25; healPlayer(1, true); }
    if (this.has('gulltann') && Math.random() < .1) dropTeeth(e.x, e.z, 1);
    if (this.has('speil')) { if (Math.random() < .13 && e.alive) { hurt(e, dmg, { from: 'player' }); numText(e.x, e.z, 'SPEIL', 'crit', 2.6); } if (Math.random() < .01) { hurt(P, 2, { type: 'self' }); numText(P.x, P.z, 'Au. Speilet.', 'info', 2.4); } }
  },
  onKill(e) {
    const col = { pleier: '#9a1818', kultist: '#6a1030', oppasser: '#9a1818', yngel: '#5a2a7a', flue: '#5a6a2a', svulst: '#d8c060', lunge: '#b8c060', rotte: '#6a1818', oyeblomst: '#5a2a7a', narkose: '#8a1818' }[e.type] || '#8a1010';
    this.splat(e.x, e.z, col, e.type === 'flue' || e.type === 'rotte' ? .5 : e.elite ? 1.5 : 1.1);
    Particles.spawn(e.x, .8, e.z, 6, 0xf4f0e0, { speed: 4, up: 5, life: .9, size: .8 });
    if (this.has('rattent_kjott')) G.run.flies = Math.min(6 + (this.tf('flue') ? 2 : 0), (G.run.flies || 0) + 1);
    if (this.has('gulltann')) dropTeeth(e.x, e.z, 1);
    if (this.tf('tann')) dropTeeth(e.x, e.z, 1);
    if (Math.random() < .06) dropPickup(e.x, e.z, 'cons', pick(Object.keys(PILL_COL)));
    if (e.type === 'svulst') { addPuddle(e.x, e.z, 'soup', 1.3, 30); for (let i = 0; i < 2; i++) if (G.enemies.length < 30) spawnEnemy('flue', e.x + rnd(-.5, .5), e.z + rnd(-.5, .5), false, G.depth); }
  },
  onHurt() {
    const P = G.player;
    if (this.has('blodtrykk')) this.splat(P.x, P.z, '#9a1010', .8);
    if (this.has('cyste') && Math.random() < .3) { for (let i = 0; i < 6; i++) this.fire(P.x, P.z, i / 6 * TAU, weaponStats().dmg * .4); FX.bubble(P, pick(['Cysten sier hei.', 'Den har meninger.', 'Pfft!']), 1.4); }
  },
  onDodge() {
    const P = G.player;
    if (this.has('surkal')) { puff(P.x, P.z, 4, 1.2, '#a8c070'); Sound.play('splash', .5, .45); for (const e of G.enemies) if (e.alive && d2(e.x, e.z, P.x, P.z) < 6) { e.slowT = 3; e.poison = { t: 2, tick: .5, dps: 4 }; } }
  },
  onRoomLock() {
    const P = G.player;
    if (this.has('brodsmuler')) try { spawnAlly('due', P.x + .8, P.z, { life: 18 }); } catch (e) { }
  },
  onFloor() {
    for (const pd of this.pedestals) { R.remove(pd.g); } this.pedestals = []; this.clearSplats();
    G.run.buffs = {}; const P = G.player; if (P && P.doll && P.doll.sc0) { P.doll.sc = P.doll.sc0; P.r = .36; }
    for (const r of G.F.rooms) if (r.role === 'treasure' || r.role === 'secret') { if (Math.random() < (r.role === 'secret' ? .5 : .25)) Aktiv.spawnJar(r.x + r.w / 2, r.z + r.h / 2, Aktiv.pick()); else this.spawnPedestal(r.x + r.w / 2, r.z + r.h / 2, this.pickFrom('kabinett')); }
    for (const r of G.F.rooms) if (r.role === 'cursed') { const pd = this.spawnPedestal(r.cx + .5, r.cz - .5, this.pickFrom('blod')); pd.cursed = true; pd.room = r.id; }
  },
  onRoomClear(r) {
    const cx = r.x + r.w / 2, cz = r.z + r.h / 2;
    if (r.role === 'risk') this.spawnPedestal(cx, cz, this.pickFrom('kabinett'));
    if (r.role === 'boss') {
      this.spawnPedestal(cx - 1.6, cz + 1.2, this.pickFrom('sjef'));
      const b = this.spawnPedestal(cx + 1.6, cz + 1.2, this.pickFrom('blod'), { hp: 1 }); b.pair = 'blod';
      setTimeout(() => toast('Blodofferet', 'Et glass koster et hjerte. Det andre er gratis.'), 1600);
    }
  },
  /* ---------- piller ---------- */
  usePill(id) {
    const P = G.player, r = G.run, eff = r.pills[id] || 'placebo', [nm, ds] = PILLS[eff], b = r.buffs;
    r.pillKnown[id] = eff; CONSUMABLES[id].name = PILL_COL[id][0] + ': ' + nm; CONSUMABLES[id].desc = ds;
    stampBig(nm.toUpperCase(), ''); toast(nm, ds); Sound.play('glass', .7, 1.4);
    if (eff === 'helse') { r.pillHearts = (r.pillHearts || 0) + 1; recalcPlayer(); healPlayer(10, true); }
    else if (eff === 'svakhet') { if (P.maxHp > 20) { r.pillHearts = (r.pillHearts || 0) - 1; recalcPlayer(); } }
    else if (eff === 'fart') b.speed = (b.speed || 1) * 1.15; else if (eff === 'treg') b.speed = (b.speed || 1) * .85;
    else if (eff === 'kraft') b.dmg = (b.dmg || 1) * 1.2; else if (eff === 'diare') b.diare = true;
    else if (eff === 'oppkast') { for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; addPuddle(P.x + Math.sin(a) * 1.6, P.z + Math.cos(a) * 1.6, 'vomit', .7, 16); } Sound.play('vomit'); for (const e of G.enemies) if (e.alive && d2(e.x, e.z, P.x, P.z) < 9) enemySlip(e); }
    else if (eff === 'morb') addMorb(30); else if (eff === 'rens') P.morb = Math.max(0, P.morb - 40);
    else if (eff === 'kjempe' || eff === 'krymp') { if (!P.doll.sc0) P.doll.sc0 = P.doll.sc; const k = eff === 'kjempe' ? 1.35 : .7; P.doll.sc = P.doll.sc0 * k; P.r = .36 * k; b.speed = (b.speed || 1) * (eff === 'kjempe' ? .9 : 1.15); if (eff === 'kjempe') b.dmg = (b.dmg || 1) * 1.25; }
    else if (eff === 'kart') { if (G.seen) G.seen.fill(1); } else if (eff === 'glemsel') { if (G.seen) G.seen.fill(0); }
    else if (eff === 'tenner') dropTeeth(P.x, P.z, 12);
    else FX.bubble(P, 'Jeg føler meg mye bedre.', 1.6);
  },
  /* ---------- blodsøl ---------- */
  splat(x, z, col, s = 1, alpha = .85) {
    const m = new THREE.Mesh(R.plane1(), new THREE.MeshBasicMaterial({ map: splatTex(Math.floor(Math.random() * 6)), color: new THREE.Color(col), transparent: true, opacity: alpha, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.rotation.z = Math.random() * TAU; const k = s * (.9 + Math.random() * .6); m.scale.set(k * 1.6, k * 1.6, 1); m.position.set(x + rnd(-.2, .2), .013 + Math.random() * .002, z + rnd(-.2, .2)); m.renderOrder = 1;
    R.level.add(m); this.splats.push(m); if (this.splats.length > 160) R.remove(this.splats.shift());
  },
  clearSplats() { for (const m of this.splats) R.remove(m); this.splats = []; },
  clear() { for (const s of this.shots) R.remove(s.g); for (const s of this.eshots) R.remove(s.g); for (const o of this.orbits) R.remove(o.g); this.shots = []; this.eshots = []; this.orbits = []; for (const pd of this.pedestals) R.remove(pd.g); this.pedestals = []; this.clearSplats(); if (this.liftG) { R.remove(this.liftG); this.liftG = null; } },
  /* ---------- per bilde: baner, auraer, spor, statuser ---------- */
  update(dt) {
    const P = G.player; if (!P) return;
    this.leechT -= dt; this.updateShots(dt); this.updateEnemyShots(dt); this.placeLook();
    if (this.liftT > 0) { this.liftT -= dt; if (this.liftG) { this.liftG.position.set(P.x, 2.3 + Math.sin(this.liftT * 6) * .05, P.z + .05); if (this.liftT <= 0) { R.remove(this.liftG); this.liftG = null; } } }
    // fluer og Sverre i bane
    const want = [];
    for (let i = 0; i < (G.run.flies || 0); i++) want.push('flue');
    if (this.has('svulstvenn')) want.push('sverre');
    if (this.has('tannfe')) want.push('tannfe');
    while (this.orbits.length > want.length) R.remove(this.orbits.pop().g);
    want.forEach((k, i) => {
      let o = this.orbits[i];
      if (!o || o.k !== k) { if (o) R.remove(o.g); const Pp = k === 'flue' ? charPart('flue', 'blob', 'f') : k === 'sverre' ? itemIcon('svulstvenn') : itemIcon('tannfe'); o = this.orbits[i] = { k, g: sprite(Pp, P.x, P.z, {}), a: i * 1.3, hitT: {} }; o.g.scale.setScalar(k === 'flue' ? .55 : .7); }
      const rad = k === 'sverre' ? 1.5 : k === 'tannfe' ? .9 : 1.1, spd = k === 'sverre' ? 1.6 : k === 'tannfe' ? 1 : 3.4;
      o.a += dt * spd; const ox = P.x + Math.sin(o.a) * rad, oz = P.z + Math.cos(o.a) * rad; o.g.position.set(ox, k === 'tannfe' ? 1.8 : 1, oz);
      if (k === 'flue' || k === 'sverre') for (const e of G.enemies) {
        if (!e.alive || d2(e.x, e.z, ox, oz) > (e.r + .3) ** 2) continue;
        if ((o.hitT[e.id || (e.id = Math.random())] || 0) > G.time) continue; o.hitT[e.id] = G.time + .45;
        hurt(e, (k === 'flue' ? 4 : 8) * (this.has('fluepapir') && k === 'flue' ? 2 : 1), { from: 'player', x: ox, z: oz, kb: 2 });
      }
      if (k === 'sverre' || (k === 'flue' && this.has('fluepapir'))) for (const pr of G.projectiles) if (pr.alive && pr.from === 'enemy' && d2(pr.x, pr.z, ox, oz) < .5) { pr.alive = false; Particles.spawn(ox, 1, oz, 5, 0xe8a0a0, { speed: 2 }); }
      if (k === 'sverre') for (let j = this.eshots.length - 1; j >= 0; j--) if (d2(this.eshots[j].x, this.eshots[j].z, ox, oz) < .5) { R.remove(this.eshots[j].g); this.eshots.splice(j, 1); }
      if (k === 'sverre' && this.tf('svulst')) { this.sverreT -= dt; if (this.sverreT <= 0) { this.sverreT = 2; const t = nearestEnemy(ox, oz, 7); if (t) this.fire(ox, oz, Math.atan2(t.x - ox, t.z - oz), 8, { child: true }); } }
    });
    // tannfeen og tannfe-forvandlingen trekker tenner til seg
    if (this.has('tannfe') || this.tf('tann')) for (const k of G.pickups) if (k.kind === 'tooth' && k.t > .3) { const d = Math.hypot(P.x - k.x, P.z - k.z); if (d < 10 && d > .4) { k.x += (P.x - k.x) / d * 9 * dt; k.z += (P.z - k.z) / d * 9 * dt; } }
    // auraer
    const speed = Math.hypot(P.vx, P.vz);
    this.auraT -= dt;
    if (this.auraT <= 0) {
      this.auraT = .5;
      if (this.has('hodeskalle')) for (const e of G.enemies) if (e.alive && d2(e.x, e.z, P.x, P.z) < 2.6 * 2.6) { hurt(e, 3, { from: 'player' }); Particles.spawn(e.x, 1.2, e.z, 3, 0xffa040, { speed: 1.5, up: 3, life: .4 }); }
      if (this.has('dikt')) { this.stillT = speed < .4 ? this.stillT + .5 : 0; if (this.stillT >= 3) { this.stillT = 0; const t = nearestEnemy(P.x, P.z, 5.5); if (t && t.kind === 'enemy') { t.sleep = 2.5; numText(t.x, t.z, 'zzz', 'info', 2.4); FX.bubble(P, pick(['...og mørket, det kalte på meg...', 'Vers elleve. Det blir bedre.', 'Ingen forstår meg. Særlig ikke deg.']), 1.8); } } }
    }
    if ((this.has('lavement') || (G.run.buffs && G.run.buffs.diare)) && speed > 4) { this.trailT -= dt; if (this.trailT <= 0) { this.trailT = .3; addPuddle(P.x - Math.sin(P.face) * .4, P.z - Math.cos(P.face) * .4, 'soup', .55, 12); } }
    // statuser på fiender: gift, treghet, karantene
    for (const e of G.enemies) {
      if (!e.alive) continue;
      if (e.poison && e.poison.t > 0) { e.poison.t -= dt; e.poison.tick -= dt; if (e.poison.tick <= 0) { e.poison.tick = .5; hurt(e, e.poison.dps * .5, { from: 'player' }); Particles.spawn(e.x, 1.1, e.z, 3, 0x7ac84a, { speed: 1, up: 2, life: .5 }); } }
      if (e.slowT > 0) { e.slowT -= dt; if (!e.baseSp) e.baseSp = e.sp; e.sp = e.baseSp * .55; } else if (e.baseSp) { e.sp = e.baseSp; e.baseSp = 0; }
      if (!e._kar && this.has('karantene') && G.combat) { e._kar = true; e.hp *= .8; e.max *= .8; }
    }
  },
  /* ---------- fiendenes egne skudd (lungens slim) ---------- */
  enemyShot(e, a, dmg) {
    const s = { x: e.x + Math.sin(a) * .5, z: e.z + Math.cos(a) * .5, vx: Math.sin(a) * 7, vz: Math.cos(a) * 7, dmg, life: 1.6, cause: e.type };
    s.g = sprite(shotPart('slim'), s.x, s.z, {}); s.g.position.y = .8; s.g.scale.setScalar(1.1); this.eshots.push(s);
  },
  updateEnemyShots(dt) {
    const P = G.player;
    for (let i = this.eshots.length - 1; i >= 0; i--) {
      const s = this.eshots[i]; s.life -= dt; s.x += s.vx * dt; s.z += s.vz * dt; s.g.position.set(s.x, .8, s.z);
      let dead = s.life <= 0 || solid(Math.floor(s.x), Math.floor(s.z));
      for (const w of G.walls || []) if (w.alive && d2(s.x, s.z, w.x, w.z) < (w.w / 2) ** 2) dead = true;
      if (!dead && P.alive && d2(s.x, s.z, P.x, P.z) < (P.r + .22) ** 2) { hurt(P, s.dmg, { type: s.cause, x: s.x - s.vx * .1, z: s.z - s.vz * .1, kb: 3 }); dead = true; }
      if (dead) { Particles.spawn(s.x, .6, s.z, 5, 0xc8d060, { speed: 2, up: 2, life: .3 }); if (Math.random() < .5) this.splat(s.x, s.z, '#b8c060', .5, .6); R.remove(s.g); this.eshots.splice(i, 1); }
    }
  }
};

/* ---------- oppførsel for de nye fiendene ---------- */
const Grotesk = {
  keep: { flue: .6, svulst: 4.5, lunge: 4.8 },
  ai: {
    flue(e, T, dist, toT) {
      if (dist < 1.1) { e.state = 'wind'; e.t = .18; e.face = toT; addTele('circle', { x: e.x + Math.sin(toT) * .5, z: e.z + Math.cos(toT) * .5, r: .5 }, .18, o => { if (inShape({ shape: 'circle', o }, T.x, T.z, T.r)) hurt(T, e.dmg, { type: 'flue', x: e.x, z: e.z, kb: 1 }); }, e); e.cd = rnd(.6, 1.1); }
    },
    svulst(e, T, dist, toT) {
      if (dist < 9 && G.enemies.filter(f => f.alive && f.type === 'flue').length < 10) {
        e.state = 'wind'; e.t = .9; addTele('circle', { x: e.x, z: e.z, r: 1.1, color: 0xe8a0a0 }, .9, () => { for (let i = 0; i < 2; i++) spawnEnemy('flue', e.x + rnd(-.6, .6), e.z + rnd(-.6, .6), false, G.depth); Sound.play('splash', .7, .6); Items.splat(e.x, e.z, '#d8c060', .8); FX.bubble(e, pick(LINES.svulst), 1.6); }, e); e.cd = rnd(4, 6);
      }
    },
    lunge(e, T, dist, toT) {
      if (dist < 10 && los(e.x, e.z, T.x, T.z)) {
        e.state = 'wind'; e.t = .65; e.face = toT; addTele('rect', { x: e.x, z: e.z, a: toT, w: 1.4, len: 8 }, .65, o => { for (const da of [-.18, 0, .18]) Items.enemyShot(e, o.a + da, e.dmg); Sound.play('vomit', .6, 1.3); FX.bubble(e, '*HOST*', .8); }, e); e.cd = rnd(2, 3.2);
      }
    }
  }
};
