# gpt-grafikk: bilder fra ChatGPT

Denne mappa er innboksen. Alt ChatGPT tegner til Morbidium, legges her. Herfra plukker verktøyene bildene opp, klipper dem, renser dem og bygger dem inn i spillet. Ingenting annet skal ligge her.

Innboksen er tom med vilje. Når en leveranse er tatt imot, ligger de behandlede bildene i `assets/ferdig/` (og delene til oppskriftssystemet i `assets/deler/`), og originalene er tatt ut av mappa. De finnes i git-historikken: `arkiv/grafikk-originaler.md` sier hvilken commit hver fil ligger i, og alt som var levert fram til 28.9.2026, ligger i commit 578f6f2 (`git checkout 578f6f2 -- gpt-grafikk/` henter alt tilbake).

## Før du tegner
- Les `DESIGN_BRIEF.md`. Den har stilblokken som limes inn først i hver ChatGPT-samtale, reglene og arktypene.
- Lista over hvert enkelt bilde spillet trenger, med beskrivelse og format, står i `ART_BRIEF.md`.
- Det som mangler, er samlet i ferdige ark i `tegnelister/` (start med `tegnelister/LESMEG.md`): filnavn, mal, prompt og referansebilde for hvert ark.
- Malene som lastes opp til ChatGPT ligger i `maler/`.

## Filnavnet er alt
Verktøyene vet hva et bilde er bare ut fra filnavnet. Skriv det med små bokstaver, uten mellomrom og med `.png` til slutt.

| Hva | Filnavn | Eksempel |
|---|---|---|
| Ett enkelt bilde | en nøkkel fra `assets/manifest.json` | `kort_due.png`, `kur_bart.png`, `prop_bench.png` |
| Uteflater som gjentas over gulv eller vegg | `gulv_<stil>.png`, `vegg_<stil>.png` | `gulv_gress.png`, `vegg_hekk.png` |
| Figurark (forfra, bakfra, fra siden) laget på `mal_figur.png` | `figur_<navn>.png` | `figur_pasient.png` |
| Ni ting på ett ark laget på `mal_ni_ting.png` | `ark__<nøkkel>__<nøkkel>...png`, ni nøkler med to understreker mellom, lest fra venstre mot høyre og ovenfra. `_` hopper over en rute | se under |
| Delark til oppskriftssystemet | `hoder_<serie>.png`, `hatter_<serie>.png`, `har_<serie>.png`, `tilbehor_<serie>.png`, `kropper_<serie>.png` | `hoder_personale.png` |
| Spriteark: like store ruter på én rad, samme festepunkt i hver rute (se del I i `DESIGN_BRIEF.md`) | `anim_<navn>.png` | `anim_kastesprut.png` |
| HUD og menyer: rammer, ringer, hjerter og ikoner uten tekst (se del G) | `ui_<navn>.png` | `ui_panel.png`, `ui_hjerte_full.png` |
| Løse deler til lagdelte skapninger (se del H) | `koret_<del>.png`, `klumpen_<del>.png` | `koret_munn0.png`, `klumpen_ansikt2.png` |
| Tekstur til en vegg, et gulv eller bakken ute (se del D og tegneliste 11 og 12) | `vegg_<stil>.png`, `gulv_<stil>.png`, `bakke_park.png`, `bakke_skog.png` | `vegg_panel.png`, `gulv_planker_3.png` |

Eksempel på et «ni ting»-ark med de ni første kuriositetene:

`ark__kur_tuberkulose__kur_bronkitt__kur_spyttkjertel__kur_magnet__kur_syl__kur_celledeling__kur_nitro__kur_kvikksolv__kur_frost.png`

Et bilde med et navn som ikke finnes i manifestet, blir hoppet over med en melding. Det ødelegger ikke bygget.

De nye fiendene fra ChatGPTs forslag lages som figurark på `mal_figur.png`: `figur_kasteren.png`, `figur_trille.png`, `figur_speil.png`, `figur_tannlege.png` og `figur_portier.png`. Rullestolhjulet (`hjul_trille_f.png`), portierens hode (`portierhode.png`) og våpnene (`vaapen_klump.png`, `vaapen_tang.png`, `vaapen_knippe.png`) er enkeltbilder. Hele lista står i `ART_BRIEF.md`, runde 7, 8 og 9.

Spilleren settes sammen på nytt ved hver innleggelse. `figur_pasient.png` er mannen og `figur_pasient_kvinne.png` kvinnen; hårfarge, hudtone og kåpefarge legges på av spillet. Andre plagg er foreløpig tegnet i koden og kan erstattes med figurark som bare har kroppsraden fylt ut: `figur_tvang.png` (tvangstrøye), `figur_skjorte.png` (sykehusskjorte) og `figur_pyjamas.png` (stripete pyjamas). Småting til hodet kan leveres som enkeltbilder: `pynt_nattlue.png`, `pynt_papiljotter.png`, `pynt_harnett.png`, `pynt_hjelm.png`, `pynt_rosett.png`, `pynt_plaster.png` og `pynt_sting.png`, og fottøy som `sko_barfot.png` og `sko_sokk.png`.

Utvidelsen høsten 2026 har fire nye runder i `ART_BRIEF.md`: runde 10 (møblene i de nye rommene, parken og skogen, og utgangene), runde 11 (hendelsene: øyet, kua, telefonen, heisen og de andre), runde 12 (drømmene: minnene, tegnene, døra og figurene uten ansikt) og runde 13 (gartnerne, kråkene, Huldra, Vedkubbemannen, Nøkken, Overgartneren og Den hvite hjorten). Figurene lages som figurark på `mal_figur.png` med navnet `figur_<type>.png`, for eksempel `figur_huldra.png`.

## Krav til bildene
Flater med `tekstur: true` i manifestet er et unntak fra reglene om bakgrunn nedenfor: de skal fylle hele bildet og gjentas uten synlig skjøt. Gulv ses rett ovenfra og vegger rett forfra. Behandlingen beholder kantene og alfaen, uten beskjæring eller bakgrunnsfjerning. Se `UTEGRAFIKK.md` i rotmappa.

- PNG, helst med gjennomsiktig bakgrunn. Hvit eller ensfarget bakgrunn går også, den fjernes fra kantene og innover.
- Ingen skygge på bakken, ingen tekst, ingen ramme, ingen bakgrunn.
- Magenta hjelpelinjer fra malene kan bli stående, de fjernes automatisk.

## Teksturene: vegger, gulv og bakken ute
Teksturene er unntaket fra reglene over. De lages i en egen ChatGPT-samtale med stilblokken for teksturer (del D i `DESIGN_BRIEF.md`), og ferdige prompter står i `tegnelister/11_vegger.md` (veggene og bakken ute) og `tegnelister/12_gulv.md` (gulvene).
- Bildet skal dekke hele flata, uten gjennomsiktighet. Bare `vegg_gjerde.png` og `vegg_ruin.png` er gjennomsiktige, mellom stengene og over bruddkanten.
- Vegger: 1536 x 1024, et utsnitt av veggen rett forfra, 1,5 ganger så bredt som høyt, med gulvet nederst og toppen av veggen øverst. Det skal gå i ett fra venstre mot høyre.
- Gulv og bakke: 1024 x 1024, rett ovenfra, nøyaktig 4 x 4 ruter på én meter. Det skal gå i ett i begge retninger.
- `_3`, `_4` og `_6` bak navnet er fargene i Underetasjen, Kjelleren og Dypet. Uten tall brukes fargene fra Mottaket.
- Bildeløpet fjerner ingen bakgrunn og beskjærer ingenting for disse. Det skalerer dem (veggene til 128 punkter per meter, gulv og bakke til 512 x 512), retter kanter som ikke går helt i ett, og lagrer dem som WebP i `assets/ferdig/`.
- Gulvene i liste 12 bestilles først når Claude sier at gulvet tegnes med egne fliser i spillet.

## Slik kommer bildene inn
1. Last ned bildet fra ChatGPT og gi det riktig filnavn.
2. Last det opp hit: på GitHub, åpne mappa `gpt-grafikk`, velg Add file og Upload files, og commit til `main`.
3. Pushen til `main` starter GitHub Actions, som klipper arkene (`tools/skjaer_ark.py`), behandler bildene (`tools/behandle_bilder.py`), bygger spillet (`build.py`), tester det og publiserer det på GitHub Pages. Bildene er med i spillet med en gang.
4. Neste gang Claude jobber i repoet, tas leveransen imot med `python3 tools/ta_imot_grafikk.py`: bildene behandles inn i `assets/ferdig/`, originalene tas ut av innboksen, og commitene de ligger i, skrives i `arkiv/grafikk-originaler.md`. Da blir repoet lett å klone igjen.

Lokalt gjøres det samme med:

```
python3 tools/skjaer_ark.py
python3 tools/behandle_bilder.py
python3 build.py
```

Når `skjaer_ark.py` kjøres lokalt, flyttes originalarket til `gpt-grafikk/behandlet/`, og de klipte delene havner her som enkeltbilder. Behandlede bilder havner i `assets/ferdig/`, og deler til oppskriftssystemet i `assets/deler/`. `tools/ta_imot_grafikk.py` gjør alt dette og tømmer innboksen etterpå. Det som mangler bilde, tegnes av koden som før, så spillet får aldri hull.
