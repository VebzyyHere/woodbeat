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
  Waldgrün-Basis + Antik-Gold-Akzent, abgeleitet vom Banner-Artwork). Farben/Abstände
  nur über die Variablen ändern, keine Hardcodes in Komponenten-Regeln.
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

- **Look = Vintage-Festivalposter, abgeleitet vom offiziellen Banner-Artwork**
  (`public/banner.jpg`, Stand 07/2026): dunkles Waldgrün + Antik-Gold + Creme,
  leichte Körnung über der ganzen Seite (`body::before`, SVG-Turbulence-Tile) —
  kein generisches Blau/Neon.
- Display-Schrift **Rye** (Western/Vintage, selbst gehostet via `@fontsource/rye`,
  nur Gewicht 400 — `font-synthesis: none` auf `body` verhindert Fake-Fett) für
  H2/H3/Preise/Marquee/Topbar-Logo; Body bleibt Systemschrift.
  Schriftwechsel = `--font-display` in `style.css`.
- Sektions-Titel im Poster-Stil: zentriert, Versalien, ✦-Rauten via
  `h2::before/::after`; Sektionen ohne Trennlinien (Struktur aus Abstand).
- Link-Vorschau: OG-Tags in `index.html`, `og:image` zeigt absolut auf
  `banner.jpg` (nach Domain-Wechsel URL anpassen!).
- Signature-Element: das Banner-Artwork als Hero — auf den inneren Poster-Streifen
  zugeschnitten (`public/banner-strip.jpg`), volle Breite, alle vier Ränder per
  Verlaufs-Masken (`mask-composite: intersect`) weich ins Waldgrün ausgeblendet.
  Die `h1` ist nur noch `sr-only` (der Titel steht im Artwork). Topbar-Logo =
  Emblem-Ausschnitt aus dem Banner (`public/logo.png`, rund maskiert);
  `public/favicon.svg` behält das alte Baumring-Motiv in Gold (bei 16 px klarer
  als das fotografische Emblem). `body { overflow-x: clip }` fängt Überstände
  des schrägen Marquees ab.
- Chips statt Dropdowns — Tagesauswahl und Umfrage-Optionen nutzen dasselbe
  `.chip`-Pattern (`aria-selected` bzw. `aria-pressed`).
- Scroll-Reveal der Sektionen rein per CSS (`animation-timeline: view()` hinter
  `@supports`, degradiert sauber); Scroll-Fortschrittsbalken ebenso
  (`animation-timeline: scroll()`, `body::after`).
- Verspielte Schicht (bewusst so gewollt): Marquee leicht rotiert (Anti-Grid),
  Glow-Blobs im Hero, Cursor-Glow (nur `pointer: fine`), Emoji-Konfetti wenn die
  Packliste voll ist. (Kinetischer Buchstaben-Titel und rotierendes Kreis-Badge
  wurden mit dem Banner-Redesign 07/2026 entfernt.) **Alle** Animationen respektieren `prefers-reduced-motion` (JS-seitig über
  `reducedMotion`-Konstante, CSS-seitig über den zentralen reduce-Block).
- Neue Sektion hinzufügen = Gerüst in `index.html` + Daten in `data.js` +
  Render-Block in `main.js` — dieses Muster beibehalten.
