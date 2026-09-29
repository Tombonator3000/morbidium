# Utegrafikk, 27. september 2026

> Fra 28.9.2026 er `gpt-grafikk/` en innboks. Originalene fra denne leveransen ligger på grenen `arkiv/originaler` (commit 578f6f2, se `arkiv/grafikk-originaler.md`), ikke lenger i historikken til main, og de behandlede bildene i `assets/ferdig/`.

Tom ba om manglende grafikk, særlig i hagen og på grantrærne, og om push til main.

## Funn og retting

De tidligere 544 manifestbildene var levert. `prop_gran` manglet likevel både bildefil og manifestoppføring. Manifestverktøyet undersøkte rommenes rekvisitter, men overså dekortrærne utenfor rommene. Gulv, hekk og skogkanter brukte bare kodetegninger og var heller ikke med i bildetallet.

En annen feil fjernet graner ved utvelgelsen av bakgrunnsdekor: samme tilfeldige verdi styrte både treslag og hvilke trær som fikk plass innenfor grensen. Parkgraner hadde de høyeste verdiene og ble sortert bort først. Kontrollhagen med løpsfrø 3 hadde null graner. Prioriteringen er nå uavhengig av treslaget. Grensen er fortsatt 90 dekorobjekter i parken og 140 i skogen; kollisjon og generator er uendret.

## Leveransen

14 nye originalbilder ligger i `gpt-grafikk/`:

| Type | Bilder |
|---|---|
| Tre | `prop_gran` |
| Bakke | `gulv_gress`, `gulv_grus`, `gulv_jord`, `gulv_mose`, `gulv_myr`, `gulv_is`, `gulv_sti`, `gulv_brostein`, `gulv_sno` |
| Vegg | `vegg_hekk`, `vegg_steinmur`, `vegg_skog`, `vegg_ruin` |

Alle navn i tabellen har endelsen `.png`. Bildene er laget med den innebygde ChatGPT-bildegeneratoren. Verktøyet bekrefter ikke et bestemt modellnavn. De fullstendige promptene, inkludert rettingen av steinmurens hvite toppkant, står i [utegrafikk-prompter.json](utegrafikk-prompter.json).

Bakke dekker 4 x 4 spillruter og males i verdenskoordinater. Veggflatene følger eksisterende høyder og geometri. Snøbildet erstatter de ovale flekkene, også utenfor rommene. Granen beholder festepunktet og størrelsen til den gamle kodetegningen.

Teksturer har `tekstur: true` i manifestet og skaleres uten beskjæring eller bakgrunnsfjerning. Gulv blir 512 x 512 piksler. Veggene beholder 128 piksler per spillenhet. Ruinens hull og granens bakgrunn beholder alfa. Flater kopieres inn i eksisterende lerreter; de tilfører ingen sceneobjekter eller tegnekall. Landskapsbakken bruker én 512 x 512-tekstur per uteetasje og frigjøres gjennom `Paint.owned`.

Manifestverktøyet besøker nå hele `ROM_ART` og registrerer `UTE_FLATER`. Resultatet er 558 av 558 leverte manifestbilder. Andre eksisterende kodeflater, blant annet glass, gjerder og innendørsgulv, er bevart. Bildetallet beskriver registrerte bildefiler, ikke alle prosedyrer som tegner i spillet.

## Kontroller

- Bildebehandling: 558 bilder, 0 feil. Bygget inneholder også de tidligere 124 delene og 165 lydene.
- Alle JavaScript-kildene består syntakskontrollen. Nye bilders dimensjoner og alfa er kontrollert.
- `tools/test_utegrafikk.py`: 14 bilder lastet. Flater sammenlignet med sine reservetegninger, snø og landskapsbakke kontrollert. Hage, vinterhage, drivhus, bjørkeskog, myr og ruin kjørt i 3D og enkel grafikk. Alle 12 scener bestod uten nettleserfeil og med graner til stede, også etter rettingen av treutvalget.
- `tools/test_spill.py` er kjørt etter bildeintegrasjonen: kamp, ryddet rom, tjeneste, sjef, luke, drøm, etasjebytte og død. Ingen nettleserfeil. Etter rettingen av treutvalget ble de berørte scenene kontrollert på nytt.
- Chromium med programvaregrafikk. Ingen ny ytelsesmåling på fysisk telefon eller TV og ingen full omkjøring av `test_ekstra.py`.

[Kontrollrapport](dokumentasjon/utegrafikk/rapport.json), [grafikktest](dokumentasjon/utegrafikk/test_utegrafikk.log) og [gjennomspilling](dokumentasjon/utegrafikk/test_spill.log).

Følgende er uendrede skjermbilder fra det kjørende spillet, ikke genererte illustrasjoner:

- [Hagen i 3D](dokumentasjon/utegrafikk/3d-hage-klart.png)
- [Vinterhagen i 3D](dokumentasjon/utegrafikk/3d-hage-sno.png)
- [Graner og ruin i Nattskogen](dokumentasjon/utegrafikk/3d-ruin-taake.png)
- [Vinterhagen med enkel grafikk](dokumentasjon/utegrafikk/enkel-hage-sno.png)

## Videreføring av Claude-arbeidet

Leveransen bygger på main `799f983`. Claudes øvrige runde 5 på `claude/practical-babbage-nc80bu` og de utilgjengelige B/C-arbeidskopiene er ikke innlemmet her. Ved senere integrasjon må disse bildefilene og den fungerende teksturstøtten bevares, uten å bestille de samme bildene en gang til.
