# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projekt

WoodBeat — Homepage für ein privates Techno-Festival im Freundeskreis (keine
öffentliche Seite, ~30–80 Gäste). Zielfestival ist **WoodBeat 2027, Sommer 2027**;
das genaue Datum wird **bis 31.12.2026 verkündet**. Statische Vite-Site ohne
Framework. UI-Text ist **Deutsch**, Code-Bezeichner Englisch — Ausnahme: Bezeichner
der Gestaltung sind deutsch (`.sek`, `.pille`, `.gleiten`, `.umfrage`).

## Commands

- `npm install` — Dependencies (vite + drei Schriften)
- `npm run dev` — Dev-Server auf http://localhost:5181
- `npm run build` — Produktions-Build nach `dist/`
- `npm run preview` — gebautes `dist/` lokal testen

Kein Test-Runner, kein Linter. Verifikation ist manuell: `npm run dev`, Seite
bei **375 px und 1440 px** durchgehen, Konsole prüfen, auf horizontalen Überlauf
achten (`document.documentElement.scrollWidth` muss = Viewport-Breite sein).

## Deployment

Live: **https://vebzyyhere.github.io/woodbeat/** (GitHub Pages, Repo
`VebzyyHere/woodbeat`, öffentlich). Deploy = auf `master` pushen —
`.github/workflows/deploy.yml` baut und veröffentlicht automatisch.
`vite.config.js` setzt `base: '/woodbeat/'` nur im CI (`GITHUB_ACTIONS`),
lokal bleibt alles unter `/`. Die `og:image`-URL in `index.html` ist absolut
auf die Pages-Domain eingetragen und **muss 1200×630 bleiben** — WhatsApp
beschneidet auf ~1,91:1.

## Der Termin — eine Stellschraube

`FESTIVAL.datumBekannt` in `src/data.js` schaltet die ganze Seite um:

| | `false` (jetzt) | `true` |
|---|---|---|
| Kopf | „Sommer 2027" | `datumKurz` |
| Countdown | bis `enthuellungISO` (Verkündung) | bis `startISO` (erster Kick) |
| Tippspiel | Wochenend-Chips (Umfrage `termin`) | ausgeblendet |

Datum steht fest → `startISO`, `endISO`, `datumKurz` eintragen und
`datumBekannt: true`. Mehr ist nicht zu tun. Die `og:description` in
`index.html` sollte man dann von Hand nachziehen.

Der Tipp ist eine ganz normale Umfrage mit der poll-id `termin` (keys =
Freitag-Datum `2027-07-23`), läuft also über dieselbe Supabase-Auszählung.

## Seitenaufbau

**Eine Seite** (seit Sept. 2026, vorher fünf Unterseiten). Reihenfolge:
Hero → Motto-Band → 01 Datum (Countdown + Tipp) → „Drei Tage / Zwei Nächte /
Ein Wald" → Der Sound (`SOUND` in data.js: 150+ BPM, Genres) → 02 Abstimmen → 03 Programm (Line-up, Laufplan, Playlist) →
04 Tickets & Bar → 05 Rückblick → 06 Praktisch (Anfahrt, Mitbringen, Waldkodex,
Crew) → 07 Fragen → Dabei (Zusage-Formular) + Fuß.

Die alten URLs `/programm/`, `/tickets/`, `/abstimmen/`, `/praktisches/` sind
Weiterleitungs-Stubs in `public/` (meta refresh auf den Anker) — sie halten
alte WhatsApp-Links am Leben. Im Vite-Dev-Server greifen sie nicht (SPA-Fallback),
im Build schon.

## Architektur

Inhalt, Darstellung und Datenzugang sind strikt getrennt.

- `index.html` — Skelett: Meta/OG, Navigation, Hero (hartkodiert, LCP), leere
  Sektionen mit IDs.
- `src/data.js` — **alle Inhalte**. Text-/Termin-Änderungen passieren
  ausschließlich hier, nie im HTML.
- `src/main.js` — Orchestrierung: Fonts, Datumstexte, Render-Aufrufe,
  Mobil-Menü, Nav-Zustand, Reveal-Ersatz für Browser ohne Scroll-Timelines.
- `src/sections.js` — je eine reine `render*(…)`-Funktion pro Sektion.
- `src/polls.js` / `src/rsvp.js` — die beiden Teile mit eigenem Zustand.
  `initRsvp()` gibt `waehleTicket()` zurück; die „Ticket sichern"-Links wählen
  damit das Ticket im Formular vor.
- `src/live.js` — Datenzugang (Supabase per `fetch`, kein SDK) **plus** lokaler
  Ersatz. Wirft nie, gibt im Fehlerfall `null`.
- `src/config-live.js` — die zwei Supabase-Werte. Wird committet.
- `src/countdown.js` — `phase()` (`offen`/`verkuendet`/`vor`/`live`/`nach`) und der Zähler.
- `src/register.js` — der Herzschlag `--kick`, `puls()`, `uebergang()`.
- `src/audio.js` — der Ton-Knopf: spielt den SoundCloud-Song aus `HINTERGRUND` (data.js) über ein unsichtbares Widget-iframe, erst beim ersten Klick geladen, in Schleife. Kommt SoundCloud nicht in 4 s in Gang, springt der synthetisierte 150-BPM-Loop ein. `HINTERGRUND.soundcloud` leer = nur Synth.
- `src/teilen.js` — Web-Share mit `wa.me`-Fallback.
- `src/style.css` — Tokens und alle Komponenten, 12 nummerierte Abschnitte.
  Farben **nur** über die Variablen in Abschnitt 1.

## Live-Daten (Supabase)

Umfrage-Ergebnisse und Zusagen laufen über Supabase Free (Region Frankfurt).
Das komplette Schema liegt in **`supabase/setup.sql`** — einmal in den SQL
Editor einfügen, fertig. Danach die zwei Werte in `src/config-live.js`.

Sicherheitsmodell: Der publishable Key steht öffentlich im Repo (so vorgesehen).
Sicher ist das nur, weil die Tabellen **RLS ohne jede Policy** haben und alle
Rechte für `anon` entzogen sind. Zugriff läuft ausschließlich über fünf
`SECURITY DEFINER`-Funktionen mit leerem `search_path`. Es gibt bewusst **keine**
Funktion, die Namen ausliest — öffentlich ist ausschließlich die Zahl.

1. **`config-live.js` leer = alles läuft lokal weiter.** Gleiche Oberfläche,
   Zahlen aus `localStorage`, ehrlicher Hinweis darunter.
2. **Supabase pausiert nach 7 Tagen ohne DB-Aktivität.** Dagegen läuft
   `.github/workflows/keepalive.yml` alle drei Tage.
3. **Option-Keys sind Speicherschlüssel.** `UMFRAGEN[].options[].key`,
   `TERMIN_TIPP`-Keys und `TICKETS[].key` dürfen **nie** geändert werden, `label` jederzeit.

localStorage-Schlüssel: `woodbeat-voter`, `woodbeat-wahl`, `woodbeat-outbox`,
`woodbeat-rsvp`, `woodbeat-checked`.

## Gestaltung: „LICHTUNG"

Ein Rave im nächtlichen Wald. Entworfen auf der Design-Canvas
(https://claude.ai/artifact/4HtPysfejDsfaJXsoeDoeV), dann hier umgesetzt.

- **Palette:** Moosgrund `--nacht`, `--creme`, genau **eine** Akzentfarbe `--lime`,
  `--moos` nur als Nebentext auf Creme. Helle Sektionen: Abstimmen + Programm.
  Lime-Flächen: Motto-Band, Wochenendticket, Dabei-Sektion.
- **Schriften:** Anybody Variable (Anzeige, Versalien, Breiten-Achse
  `font-stretch` 50–150 %), Familjen Grotesk (Fließtext), Martian Mono (Labels).
- **Signatur = die Breiten-Achse.** Titel dehnen sich beim Reinscrollen
  (`.dehnen`), Line-up/Kodex-Zeilen beim Hover.
- **Scroll- und Zoom-Animationen sind reines CSS** (`animation-timeline: view()/scroll()`,
  Abschnitt 12): Hero-Wortmarke zoomt beim Scrollen durch die „OO", Ringe fliegen
  weg, `.auf` zoomt rein, `.kippen` kippt Tickets rein, `.gleiten--l/r` schieben
  die Riesenzeilen, das Motto-Band läuft mit dem Scrollen (nie von selbst).
  **Browser ohne Scroll-Timelines** bekommen `html.ohne-timeline` + einmalige
  Einblendungen per IntersectionObserver (`initRevealErsatz()`).
- **Herzschlag:** `--kick` (0…1) skaliert die Hero-Ringe. Ohne Ton pulsiert CSS
  im 150-BPM-Takt; läuft der Ton, schaltet `html.ton-an` das ab und der Audio-Takt
  schlägt. Stimmabgabe/Zusage = Extra-Schlag via `puls()`.
- **Keine Emoji in der UI.** Ausnahme: `og:title` und Share-Texte.
- **Leerzustände sind entworfen:** „Slot frei", „Foto folgt", „Hand heben", nie „TBD".
- **Mobil ist der Entwurfsfall** (Breakpoints 800 px, 1100 px). Unter 1100 px
  liegen die Links in einem Vollbild-Menü (Lime, `clip-path`-Kreis).
- Alle Animationen respektieren `prefers-reduced-motion`. Der Ton bleibt verfügbar.

### Gotchas

- **Transform-Hover auf animierten Elementen:** `.kippen`/`.auf` halten `transform`
  per `animation-fill-mode: both` fest — ein `:hover { transform }` greift dann
  nicht. Für Hover die Einzel-Properties `rotate`/`translate`/`scale` nehmen.
- **Anybody bei 150 % ist ~9 em breit** für „WOODBEAT". Große Wortmarken daher
  mit `vw`-Größe um 10vw, sonst horizontaler Überlauf auf dem Handy.
- **Grids brauchen `minmax(0, 1fr)`**, sonst drückt `white-space: nowrap`-Inhalt
  die Spalte über den Viewport (`.raster` hat das als Default).
- **`geladen` ist nicht `voters === 0`.** „Noch keine Daten" und „null Stimmen"
  getrennt halten, sonst zeigt eine abgegebene Stimme nach dem Neuladen kurz „0 %".
- **View Transitions über `uebergang()` aus `register.js` starten**, nie direkt.
- **Reiter einmal bauen, danach nur den Zustand ändern** — sonst verliert die
  Tastatur den Fokus.

### Neue Sektion hinzufügen

Daten in `data.js` → `<section id>` in `index.html` (+ Nav-Link, falls Hauptpunkt)
→ `render*()` in `sections.js` + Aufruf in `main.js` → Stile in `style.css`.
