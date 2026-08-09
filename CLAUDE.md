# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projekt

WoodBeat — Homepage für ein privates Techno-Festival im Freundeskreis (keine
öffentliche Seite, ~30–80 Gäste). Zielfestival ist **WoodBeat 2027**; das Jahr
steht als **eine Zeile** in `FESTIVAL.jahr` und wird überall daraus gerendert.
Statische Vite-Site ohne Framework. UI-Text ist **Deutsch**, Code-Bezeichner
Englisch — Ausnahme: Bezeichner der Gestaltung sind ebenfalls deutsch
(`.anschlag`, `.zettel`, `.pressung`), weil sie Begriffe aus der Drucksprache
sind und keine englischen Entsprechungen haben, die dasselbe meinen.

## Commands

- `npm install` — Dependencies (vite + zwei Schriften)
- `npm run dev` — Dev-Server auf http://localhost:5181
- `npm run build` — Produktions-Build nach `dist/`
- `npm run preview` — gebautes `dist/` lokal testen

Kein Test-Runner, kein Linter. Verifikation ist manuell: `npm run dev`, Seite
bei **390 px und 1280 px** durchgehen, Konsole und Netzwerk-Tab prüfen.

## Deployment

Live: **https://vebzyyhere.github.io/woodbeat/** (GitHub Pages, Repo
`VebzyyHere/woodbeat`, öffentlich). Deploy = auf `master` pushen —
`.github/workflows/deploy.yml` baut und veröffentlicht automatisch.
`vite.config.js` setzt `base: '/woodbeat/'` nur im CI (`GITHUB_ACTIONS`),
lokal bleibt alles unter `/`. Die `og:image`-URL in `index.html` ist absolut
auf die Pages-Domain eingetragen und **muss 1200×630 bleiben** — WhatsApp
beschneidet auf ~1,91:1 und schnitt beim alten 3:1-Banner den Titel weg.

## Seitenschnitt

**Fünf echte Seiten, geschnitten nach Absicht** — nicht nach Thema. Vorher war
alles eine Endlosseite: 14 Bildschirme auf dem Handy, und wer den Preis suchte,
scrollte an fünf Sektionen vorbei.

| Seite | Absicht | Inhalt |
|---|---|---|
| `/` | entscheiden | Anschlag, Banderole, **die vier Aushänge**, Rückblick |
| `/programm/` | nachschauen | Line-up, Laufplan, Playlist |
| `/tickets/` | zusagen | Preise & Bar, Wer kommt |
| `/abstimmen/` | mitreden | Stimmzettel |
| `/praktisches/` | vorbereiten | Lageplan, Mitbringen, Waldkodex & Crew, Kleingedrucktes |

Deshalb liegen Tickets und „Wer kommt" zusammen (beides ist die Zusage-Handlung)
und der Laufplan beim Line-up (beides ist „was passiert"), obwohl das eine Zeiten
und das andere Namen sind.

Die **Aushänge** auf der Startseite sind kein Menü, sondern das
Inhaltsverzeichnis des Plakats: vier nummerierte Zeilen, jede mit einer echten
Zahl rechts (`13 Punkte · 3 Tage`, `23 sind dabei`, …). Sonst wäre die
Startseite eine Weiche, durch die man nur hindurchklickt.

Technisch ein echtes MPA: fünf HTML-Dateien, ein gemeinsames JS/CSS-Bündel (nach
dem ersten Aufruf im Cache). Kein Router — jede Seite hat eine eigene URL, einen
eigenen Titel und eine eigene Link-Vorschau, und man kann „guck mal das
Programm" verschicken statt „scroll mal weit runter". `@view-transition` blendet
Seitenwechsel über, wo der Browser es kann.

**Neue Seite anlegen:** Eintrag in `src/seiten.js` → Ordner mit `index.html` →
Zeile in `vite.config.js` (`rollupOptions.input`) → Render-Zweig in `main.js`.

## Architektur

Inhalt, Darstellung und Datenzugang sind strikt getrennt.

- `*/index.html` — Skelett je Seite: Meta/OG, Kopf (Anschlag bzw. Blattkopf),
  leere `<section>`s. Die Wortmarke auf der Startseite ist **hartkodiert**, weil
  sie das LCP-Element ist und nicht auf JS warten darf. `<body data-seite="…">`
  steuert, was `main.js` rendert.
- `src/seiten.js` — der Seitenschnitt. Struktur-, keine Inhaltsentscheidung.
- `src/data.js` — **alle Inhalte**. Text-/Termin-Änderungen passieren
  ausschließlich hier, nie im HTML.
- `src/main.js` — Orchestrierung: Fonts, Kopfdaten, gemeinsame Bauteile
  (Emblem-Sprite, Fuß, Index-Leiste) und die Render-Aufrufe der aktiven Seite.
- `src/aushaenge.js` — die vier Zeilen der Startseite samt Live-Zahlen.
- `src/glyphen.js` — das Emblem als SVG-Sprite (liegt hier statt fünfmal im HTML).
- `src/sections.js` — je eine reine `render*(…)`-Funktion pro Sektion, kein
  gemeinsamer Zustand.
- `src/polls.js` / `src/rsvp.js` — die beiden Sektionen mit eigenem Zustand.
- `src/live.js` — Datenzugang (Supabase per `fetch`, kein SDK) **plus** lokaler
  Ersatz. Wirft nie, gibt im Fehlerfall `null`.
- `src/config-live.js` — die zwei Supabase-Werte. Wird committet.
- `src/countdown.js` — `phase()` (`vor`/`live`/`nach`) und der Zähler.
- `src/register.js` — das Register-Primitiv (siehe unten).
- `src/audio.js` — der synthetisierte Ton.
- `src/teilen.js` — Web-Share mit `wa.me`-Fallback.
- `src/style.css` — Tokens und alle Komponenten, in nummerierte Abschnitte
  gegliedert. Farben/Abstände **nur** über die Variablen in Abschnitt 1.

## Live-Daten (Supabase)

Umfrage-Ergebnisse und Zusagen laufen über Supabase Free (Region Frankfurt).
Das komplette Schema liegt in **`supabase/setup.sql`** — einmal in den SQL
Editor einfügen, fertig. Danach die zwei Werte in `src/config-live.js`.

Sicherheitsmodell: Der publishable Key steht öffentlich im Repo (so vorgesehen).
Sicher ist das nur, weil die Tabellen **RLS ohne jede Policy** haben und alle
Rechte für `anon` entzogen sind. Zugriff läuft ausschließlich über fünf
`SECURITY DEFINER`-Funktionen mit leerem `search_path`. Es gibt bewusst **keine**
Funktion, die Namen ausliest — die Gästeliste ist nur im Dashboard sichtbar,
öffentlich ist ausschließlich die Zahl.

Drei Dinge, die man wissen muss:

1. **`config-live.js` leer = alles läuft lokal weiter.** Gleiche Oberfläche,
   Zahlen aus `localStorage`, ehrlicher Hinweis darunter. Es gibt keinen
   Zustand, in dem die Seite leer oder kaputt ist.
2. **Supabase pausiert nach 7 Tagen ohne DB-Aktivität.** Dagegen läuft
   `.github/workflows/keepalive.yml` alle drei Tage. Der Workflow liest seine
   Zugangsdaten aus `config-live.js` — es gibt nur diese eine Stelle.
3. **Option-Keys sind Speicherschlüssel.** `UMFRAGEN[].options[].key` und
   `TICKETS[].key` dürfen **nie** geändert werden, `label` jederzeit. Vor dem
   Relaunch hing die Stimme am Options-*Text*; ein Tippfehler-Fix löschte sie.

localStorage-Schlüssel: `woodbeat-voter` (anonyme Geräte-ID), `woodbeat-wahl`,
`woodbeat-outbox` (ungesendete Stimmen), `woodbeat-rsvp`, `woodbeat-checked`.

## Gestaltung: „DER ANSCHLAG"

Die Seite ist kein Interface, sondern ein an den Baum genageltes Festivalplakat.

- **Das Register-Primitiv ist der Signature-Moment.** `--reg` steuert, wie weit
  die Druckplatten auseinanderliegen; alle 8 Beats bei 128 BPM springt der Druck
  kurz aus dem Register (`@keyframes reg-schlag` auf `html`). Dieselben drei
  Zeilen tragen Wortmarke, Sektionstitel, aktiven Index-Eintrag und jedes
  `:active`. `puls()` aus `register.js` hebt es kurz global an — deshalb zuckt
  bei einer Stimmabgabe der ganze Bogen.
- **Es gibt keine Karte.** Kein `border-radius`, kein `box-shadow`, kein
  `backdrop-filter`. Getrennt wird durch Haarlinien, Punktleader, Ränder und
  Korn. `--radius: 0` und `--schatten: none` existieren nur, damit niemand
  andere Werte erfindet.
- **Keine Emoji in der UI.** Ausnahme: genau eines in `og:title` und in den
  Share-Texten — die landen in einem Chat, nicht auf dem Plakat.
- **Zwei Schriften.** Bevan (Holzschnitt-Slab) nur für Wortmarke, Sektionstitel
  und Ticketpreis, immer Versalien, immer ≥ 1.35rem. Martian Mono Variable für
  alles andere inklusive Fließtext. Zusammen 59,5 KB.
- **Gold ist knapp, Glut ist knapper.** `--glut` darf auf der ganzen Seite genau
  **dreimal** vorkommen: eigene Stimme, JETZT-Marker im Laufplan, Countdown
  unter 24 h. Alle Kontraste sind gemessen und in Abschnitt 1 dokumentiert.
- **Genau ein rotiertes Element** (die Banderole), **genau eine helle Sektion**
  (Tickets & Bar), **genau ein fixiertes UI-Element** (die Index-Leiste, sie
  ersetzt Topbar *und* Stickybar).
- **Der Ergebnisbalken ist kein Balken**, sondern das erste Wort der Antwort,
  endlos wiederholt und bei `--pct` abgeschnitten. Er ist `aria-hidden` — die
  Prozentzahl daneben ist die Information.
- **Der Ton wird synthetisiert**, nicht geladen (Web Audio, 128 BPM). Läuft er,
  gibt der Audio-Takt den Registerschlag vor statt der CSS-Uhr. Nie Autoplay,
  keine Wiederaufnahme beim nächsten Besuch.
- **Leerzustände sind entworfen.** Fehlende Daten erzeugen eine gestempelte
  Fläche (`.stempel`), nie ein „TBD" und nie einen toten Knopf.
- **Mobil ist der Entwurfsfall**, Desktop die Anpassung. 80 % der Gäste öffnen
  den Link auf dem Handy aus einer WhatsApp-Gruppe.
- Alle Animationen respektieren `prefers-reduced-motion` (CSS-Block am Ende von
  `style.css`, JS über `reducedMotion` in `register.js`). **Ausnahme mit
  Absicht:** der Ton bleibt verfügbar — eine Bewegungspräferenz ist kein Grund,
  jemandem den Ton zu verweigern; nur der optische Puls entfällt.

### Gotchas

- **Kein `scrollIntoView()` auf die Index-Leiste.** Sie steht im HTML hinter dem
  Footer und ist `position: fixed` — ihre Layout-Position ist das Dokumentende,
  und `scrollIntoView()` reißt die Seite dorthin (auch mit `block: 'nearest'`).
  Stattdessen direkt `scrollLeft` des Containers setzen.
- **Die Banderole dreht ein inneres Blatt, nicht sich selbst.** Ein rotierter
  Clipping-Container dreht sich aus dem Viewport heraus, und `overflow-x: clip`
  auf `<html>` fängt das in Chrome nicht ab.
- **Reiter einmal bauen, danach nur den Zustand ändern.** Wer die Knöpfe bei
  jedem Klick neu erzeugt, reißt der Tastatur den Fokus weg.
- **`geladen` ist nicht `voters === 0`.** „Noch keine Daten" und „null Stimmen"
  müssen getrennt bleiben, sonst zeigt eine abgegebene Stimme nach dem Neuladen
  kurz „0 %".
- **View Transitions über `uebergang()` aus `register.js` starten**, nie direkt.
  Bricht ein Übergang ab (Weiterklicken, Tabwechsel, Navigation), lehnen
  `ready`/`finished`/`updateCallbackDone` ab — unbehandelt landet das als
  `InvalidStateError` in der Konsole. Ein Abbruch ist der Normalfall, kein Fehler.
- **Seitenübergreifende Links über `urlVon()` / `BASIS`** (`seiten.js`), nie als
  `/programm/` hartkodiert: auf GitHub Pages liegt alles unter `/woodbeat/`.

### Neue Sektion hinzufügen

Vier Stellen, immer in dieser Reihenfolge: Daten in `data.js` → Eintrag in
`INDEX` (`data.js`) → `<section id data-nr>` in `index.html` → `render*()` in
`sections.js` + Aufruf in `main.js`.
