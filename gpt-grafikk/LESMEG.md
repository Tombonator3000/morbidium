# gpt-grafikk: bilder fra ChatGPT

Alt ChatGPT tegner til Morbidium, legges i denne mappa. Herfra plukker verktøyene bildene opp, klipper dem, renser dem og bygger dem inn i spillet. Ingenting annet skal ligge her.

## Før du tegner
- Les `DESIGN_BRIEF.md`. Den har stilblokken som limes inn først i hver ChatGPT-samtale, reglene og arktypene.
- Lista over hvert enkelt bilde spillet trenger, med beskrivelse og format, står i `ART_BRIEF.md`.
- Malene som lastes opp til ChatGPT ligger i `maler/`.

## Filnavnet er alt
Verktøyene vet hva et bilde er bare ut fra filnavnet. Skriv det med små bokstaver, uten mellomrom og med `.png` til slutt.

| Hva | Filnavn | Eksempel |
|---|---|---|
| Ett enkelt bilde | en nøkkel fra `assets/manifest.json` | `kort_due.png`, `kur_bart.png`, `prop_bench.png` |
| Figurark (forfra, bakfra, fra siden) laget på `mal_figur.png` | `figur_<navn>.png` | `figur_pasient.png` |
| Ni ting på ett ark laget på `mal_ni_ting.png` | `ark__<nøkkel>__<nøkkel>...png`, ni nøkler med to understreker mellom, lest fra venstre mot høyre og ovenfra. `_` hopper over en rute | se under |
| Delark til oppskriftssystemet | `hoder_<serie>.png`, `hatter_<serie>.png`, `har_<serie>.png`, `tilbehor_<serie>.png`, `kropper_<serie>.png` | `hoder_personale.png` |

Eksempel på et «ni ting»-ark med de ni første kuriositetene:

`ark__kur_tuberkulose__kur_bronkitt__kur_spyttkjertel__kur_magnet__kur_syl__kur_celledeling__kur_nitro__kur_kvikksolv__kur_frost.png`

Et bilde med et navn som ikke finnes i manifestet, blir hoppet over med en melding. Det ødelegger ikke bygget.

Spilleren settes sammen på nytt ved hver innleggelse. `figur_pasient.png` er mannen og `figur_pasient_kvinne.png` kvinnen; hårfarge, hudtone og kåpefarge legges på av spillet. Andre plagg er foreløpig tegnet i koden og kan erstattes med figurark som bare har kroppsraden fylt ut: `figur_tvang.png` (tvangstrøye), `figur_skjorte.png` (sykehusskjorte) og `figur_pyjamas.png` (stripete pyjamas). Småting til hodet kan leveres som enkeltbilder: `pynt_nattlue.png`, `pynt_papiljotter.png`, `pynt_harnett.png`, `pynt_hjelm.png`, `pynt_rosett.png`, `pynt_plaster.png` og `pynt_sting.png`, og fottøy som `sko_barfot.png` og `sko_sokk.png`.

## Krav til bildene
- PNG, helst med gjennomsiktig bakgrunn. Hvit eller ensfarget bakgrunn går også, den fjernes fra kantene og innover.
- Ingen skygge på bakken, ingen tekst, ingen ramme, ingen bakgrunn.
- Magenta hjelpelinjer fra malene kan bli stående, de fjernes automatisk.

## Slik kommer bildene inn
1. Last ned bildet fra ChatGPT og gi det riktig filnavn.
2. Last det opp hit: på GitHub, åpne mappa `gpt-grafikk`, velg Add file og Upload files, og commit til `main`.
3. Pushen til `main` starter GitHub Actions, som klipper arkene (`tools/skjaer_ark.py`), behandler bildene (`tools/behandle_bilder.py`), bygger spillet (`build.py`) og publiserer det på GitHub Pages.

Lokalt gjøres det samme med:

```
python3 tools/skjaer_ark.py
python3 tools/behandle_bilder.py
python3 build.py
```

Når `skjaer_ark.py` kjøres lokalt, flyttes originalarket til `gpt-grafikk/behandlet/`, og de klipte delene havner her som enkeltbilder. Behandlede bilder havner i `assets/ferdig/`, og deler til oppskriftssystemet i `assets/deler/`. Det som mangler bilde, tegnes av koden som før, så spillet får aldri hull.
