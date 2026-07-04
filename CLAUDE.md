# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projekt

WoodBeat 2026 — Homepage für ein privates Festival (Freundeskreis, keine öffentliche
Seite). Zeigt Timetable, Anfahrt, Wünsche/Mitbringliste, Kosten und FAQ. Statische
Vite-Site ohne Framework — bewusst einfach gehalten. UI-Text ist **Deutsch**,
Code-Bezeichner Englisch.

## Commands

- `npm install` — Dependencies (nur vite)
- `npm run dev` — Dev-Server auf http://localhost:5181
- `npm run build` — Produktions-Build nach `dist/`
- `npm run preview` — gebautes `dist/` lokal testen

Kein Test-Runner, kein Linter.

## Deployment

Live: **https://vebzyyhere.github.io/woodbeat/** (GitHub Pages, Repo
`VebzyyHere/woodbeat`, öffentlich). Deploy = einfach auf `master` pushen —
`.github/workflows/deploy.yml` baut und veröffentlicht automatisch.
`vite.config.js` setzt `base: '/woodbeat/'` nur im CI (`GITHUB_ACTIONS`),
lokal bleibt alles unter `/`. Die `og:image`-URL in `index.html` ist absolut
auf die Pages-Domain eingetragen.

## Architektur

Inhalt und Darstellung sind strikt getrennt:

- `src/data.js` — **alle Inhalte** (Datum, Ort, Timetable, Mitbringliste, Kosten, FAQ)
  als einfache Datenstrukturen. Text-/Termin-Änderungen passieren ausschließlich hier,
  nie im HTML. Platzhalter sind mit "TBD" markiert.
- `src/main.js` — rendert `data.js` in die Sektions-Gerüste von `index.html`:
  Tag-Chips + Timeline für den Timetable, Checkliste mit localStorage-Persistenz
  (Key `woodbeat-checked`), Umfragen (Key `woodbeat-votes`, Freitext-Idee
  `woodbeat-idea`), FAQ als `<details>`-Accordions. Countdown im Hero erscheint
  automatisch, sobald `FESTIVAL.dateISO` gesetzt ist. Spotify-Embed baut sich aus
  `SPOTIFY.playlistUrl` (Playlist-ID wird aus dem Link geparst; Playlist muss in
  Spotify öffentlich sein, damit Gäste sie sehen). Marquee-Laufband aus `MARQUEE`.
- `src/style.css` — Design-Tokens als CSS-Variablen in `:root` (OKLCH, Dark Theme:
  Waldgrün-Basis + Bernstein-Akzent). Farben/Abstände nur über die Variablen ändern,
  keine Hardcodes in Komponenten-Regeln.
- `index.html` — statische Sektions-Gerüste mit IDs, die `main.js` befüllt.

Alles läuft client-seitig, kein Backend. Häkchen, Umfrage-Stimmen und die
Freitext-Idee leben nur im localStorage des jeweiligen Geräts.

**Umfragen-Konzept:** bewusst ohne Server — jede:r wählt lokal per Chips, der
Teilen-Button baut daraus eine fertige Nachricht (Web-Share-API, Fallback
`wa.me`-Link) für die WhatsApp-Gruppe, wo die Entscheidung sowieso fällt.
Umfrage hinzufügen = Eintrag in `UMFRAGEN` in `data.js`. Achtung: Stimmen hängen
am Options-Text — Text ändern setzt die lokale Auswahl dafür zurück. Wenn später
echte Live-Ergebnisse gewünscht sind, wäre der Schritt ein kleines Backend
(z.B. Supabase) hinter derselben `UMFRAGEN`-Datenstruktur.

### Design-Entscheidungen

- Dunkles Waldgrün + Bernstein (Lagerfeuer/Holz) — kein generisches Blau/Neon.
- Display-Schrift **Unbounded** (selbst gehostet via `@fontsource/unbounded`,
  Gewichte 500/700, Import in `main.js`) für Titel/H2/Marquee/Topbar-Logo;
  Body bleibt Systemschrift. Schriftwechsel = `--font-display` in `style.css`.
- Link-Vorschau: OG-Tags in `index.html` + `public/og-image.png` (generiert; nach
  dem Hosting die `og:image`-URL auf die absolute Domain umstellen!).
- Logo-SVGs (Hero groß, Topbar klein): rotierende Teile brauchen
  `transform-box: view-box`, sonst liegt die Drehachse außerhalb des Icons.
  `body { overflow-x: clip }` fängt Überstände des schrägen Marquees ab.
- Signature-Element: das Logo im Hero — exzentrische Baumringe ("Wood", drehen
  langsam wie eine Vinyl) durchschnitten von einer pulsierenden Waveform ("Beat").
  Inline-SVG in `index.html`, Animationen in `style.css`; statische Kopie als
  `public/favicon.svg` (Farben dort hardcoded). Respektiert `prefers-reduced-motion`.
- Chips statt Dropdowns — Tagesauswahl und Umfrage-Optionen nutzen dasselbe
  `.chip`-Pattern (`aria-selected` bzw. `aria-pressed`).
- Scroll-Reveal der Sektionen rein per CSS (`animation-timeline: view()` hinter
  `@supports`, degradiert sauber); Scroll-Fortschrittsbalken ebenso
  (`animation-timeline: scroll()`, `body::after`).
- Verspielte Schicht (bewusst so gewollt, Stand Award-Trends 2025/26): kinetischer
  Hero-Titel (Buchstaben-Spans `.ltr`, gestaffelter Einfall + Hover pro Buchstabe),
  Marquee leicht rotiert (Anti-Grid), rotierendes Kreis-Text-Badge, Glow-Blobs im
  Hero, Cursor-Glow (nur `pointer: fine`), Emoji-Konfetti wenn die Packliste voll
  ist. **Alle** Animationen respektieren `prefers-reduced-motion` (JS-seitig über
  `reducedMotion`-Konstante, CSS-seitig über den zentralen reduce-Block).
- Neue Sektion hinzufügen = Gerüst in `index.html` + Daten in `data.js` +
  Render-Block in `main.js` — dieses Muster beibehalten.
