/* ============================================================
   HAVET UNDER HUSET  -  tentakler og det som bor i sluket
   Avløpsarmen, Kapellanen, Draugpleieren og Kraken, og det de trenger (dukket under vann,
   tentakkelbånd). Spor C fyller fila i runde 5.
   ============================================================ */

/* ---------- grunnarbeid: under vann (e.dukket) ----------
   En fiende eller sjef med e.dukket ligger under vann og kan verken treffes eller siktes på. Nøkken (37_utefiender.js) var først,
   og Avløpsarmen og Krakens dykk skal bruke det samme. Fila ligger etter 39_kombo og 34_blod, så slag i vannet teller ikke i treffkjeden
   og gir ikke blod. Nærkampslaget hopper over dem (20_actors.js), og lykta gir dem ingen skygge (Dybde.kastere, 40_dybde.js). */
{ const _h = hurt; hurt = function (e, dmg, src) { if (e && e.dukket && e.kind !== 'player') return 0; return _h(e, dmg, src); }; }
// siktet på berøring og håndkontroll, evnene, duene og lynet i treffkjeden finner ikke den som ligger under
{ const _ne = nearestEnemy; nearestEnemy = function (x, z, maxD, filter) { return _ne(x, z, maxD, e => !e.dukket && (!filter || filter(e))); }; }
// strøm i pytten, skli og snubletråd biter ikke under overflaten. Før røpet ZAPP og SKLI! over tomt vann hvor Nøkken lå
{ const _ge = groundEffects; groundEffects = function (e, dt, speed) { if (e && e.dukket && e.kind !== 'player') return; return _ge(e, dt, speed); }; }
{ const _es = enemySlip; enemySlip = function (e) { if (e && e.dukket) return; return _es(e); }; }

/* ---------- trekk Journalen ikke låner (laanbareTrekk i 31_sjefpulje.js) ----------
   Stormen flyttes bare av hjortens egen tick, så hos Journalen ble den et varsel på elleve ruter, et brøl og ingenting mer */
SJEF_DATA.hjort.egne = ['storm'];

/* ---------- statusord ----------
   GREPET, SNØRT, SPENT FAST, HEKTET, DØPT og de andre ordene som sier hva som skjedde med den som ble rammet.
   Samme ord over samme figur vises høyst én gang per cd sekunder, og et nytt ord mens et annet ennå står, løftes over det
   (omtrent en tekstlinje per ord), så de ikke legger seg oppå hverandre som «IKKBONKG». Gir true når ordet ble vist. */
function statusOrd(e, ord, cd = 1.2) {
  if (!e) return false;
  const S = e.statusT || (e.statusT = {}), t = G.time, sist = S[ord];
  if (sist !== undefined && t >= sist && t - sist < cd) return false;
  let over = 0; for (const k in S) if (k !== ord && t >= S[k] && t - S[k] < .6) over++;
  S[ord] = t; numText(e.x, e.z, ord, 'crit', (e.kind === 'boss' ? 3.4 : 2.4) + Math.min(2, over));
  return true;
}

Object.assign(window, { nearestEnemy, statusOrd, BOSS_MOVES, laanbareTrekk }); // til testene
