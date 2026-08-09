// ============================================================
// DIE SEITEN DES ANSCHLAGS
//
// Geschnitten nach ABSICHT, nicht nach Thema. Die Frage ist nicht
// „wo gehört Inhalt X hin", sondern „was will jemand gerade":
//
//   Start        entscheiden      — ist das was für mich, wann, was kostet's
//   Programm     nachschauen      — wer spielt, wann läuft was
//   Tickets      zusagen          — bezahlen und sich eintragen
//   Abstimmen    mitreden         — der einzige Grund, wiederzukommen
//   Praktisches  vorbereiten      — anreisen, packen, Regeln
//
// Deshalb liegen Tickets und „Wer kommt" zusammen (beides ist die
// Zusage-Handlung) und der Laufplan liegt beim Line-up (beides ist
// „was passiert"), obwohl das eine Zeiten und das andere Namen sind.
//
// Neue Seite = Eintrag hier + Ordner mit index.html + Zeile in
// vite.config.js + Render-Zweig in main.js.
// ============================================================

/** Basis-Pfad: '/' lokal, '/woodbeat/' auf GitHub Pages. */
export const BASIS = import.meta.env.BASE_URL;

export const SEITEN = [
  {
    id: 'start',
    pfad: '',
    titel: 'Start',
  },
  {
    id: 'programm',
    pfad: 'programm/',
    nr: '01',
    titel: 'Programm',
    unterzeile: 'Wer spielt, wann läuft was.',
  },
  {
    id: 'tickets',
    pfad: 'tickets/',
    nr: '02',
    titel: 'Tickets',
    unterzeile: 'Was es kostet — und wer schon dabei ist.',
  },
  {
    id: 'abstimmen',
    pfad: 'abstimmen/',
    nr: '03',
    titel: 'Abstimmen',
    unterzeile: 'Ihr entscheidet, was gebaut wird.',
  },
  {
    id: 'praktisches',
    pfad: 'praktisches/',
    nr: '04',
    titel: 'Praktisches',
    unterzeile: 'Anfahrt, Packliste, Waldkodex.',
  },
];

/** Die vier Aushänge auf der Startseite — alles außer der Startseite selbst. */
export const AUSHAENGE = SEITEN.filter((s) => s.id !== 'start');

export const seiteNach = (id) => SEITEN.find((s) => s.id === id);

/** Vollständige URL einer Seite, basis-sicher. */
export const urlVon = (seite) => `${BASIS}${seite.pfad}`;
