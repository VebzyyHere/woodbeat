// ============================================================
// DIE AUSHÄNGE
//
// Die Startseite ist das Inhaltsverzeichnis des Plakats — vier
// nummerierte Zeilen statt eines Menüs.
//
// Jede Zeile trägt eine echte Zahl: wie viele Programmpunkte, wie
// viele schon zugesagt haben, wie viele abgestimmt haben. Sonst wäre
// die Startseite eine Weiche, durch die man nur hindurchklickt.
// Die Zahlen kommen nach, wenn sie da sind — sie halten nichts auf.
// ============================================================

import { AUSHAENGE, urlVon } from './seiten.js';
import { ANFAHRT, FESTIVAL, TIMETABLE, UMFRAGEN } from './data.js';
import { fetchResults, fetchRsvpCount, liveEnabled } from './live.js';
import { phase } from './countdown.js';

/**
 * Während des Festivals dreht sich die Absicht: niemand entscheidet
 * mehr, ob er kommt — er steht schon da und sucht die Adresse oder
 * den nächsten Slot. Also rutschen Praktisches und Programm nach oben.
 * Die Nummern bleiben, damit die Ordnung wiedererkennbar ist.
 */
function reihenfolge() {
  if (phase() !== 'live') return AUSHAENGE;
  const vorn = ['praktisches', 'programm'];
  return [...AUSHAENGE].sort(
    (a, b) => (vorn.indexOf(b.id) - vorn.indexOf(a.id)) || 0,
  );
}

/** Was ohne jeden Netzzugriff schon dasteht. */
function ruhendeZahl(id) {
  switch (id) {
    case 'programm': {
      const punkte = TIMETABLE.reduce((summe, tag) => summe + tag.slots.length, 0);
      return `${punkte} Punkte · ${TIMETABLE.length} Tage`;
    }
    case 'tickets':
      return `ab ${FESTIVAL.abPreis}`;
    case 'abstimmen':
      return `${UMFRAGEN.length} Fragen`;
    case 'praktisches':
      return ANFAHRT.name.startsWith('TBD') ? 'Ort folgt' : ANFAHRT.name;
    default:
      return '';
  }
}

export function renderAushaenge(wurzel) {
  if (!wurzel) return;

  for (const seite of reihenfolge()) {
    const zeile = document.createElement('li');
    zeile.className = 'aushang';

    const link = document.createElement('a');
    link.className = 'aushang__blatt';
    link.href = urlVon(seite);

    const nr = document.createElement('span');
    nr.className = 'aushang__nr daten';
    nr.textContent = seite.nr;

    const text = document.createElement('span');
    text.className = 'aushang__text';

    const titel = document.createElement('span');
    titel.className = 'aushang__titel';
    titel.textContent = seite.titel;

    const unter = document.createElement('span');
    unter.className = 'aushang__unter marginal';
    unter.textContent = seite.unterzeile;

    text.append(titel, unter);

    const zahl = document.createElement('span');
    zahl.className = 'aushang__zahl daten';
    zahl.dataset.fuer = seite.id;
    zahl.textContent = ruhendeZahl(seite.id);

    link.append(nr, text, zahl);
    zeile.append(link);
    wurzel.append(zeile);
  }

  lebendeZahlen(wurzel);
}

/** Zahlen nachtragen, sobald der Server geantwortet hat. Scheitert still. */
async function lebendeZahlen(wurzel) {
  if (!liveEnabled()) return;

  const setze = (id, text) => {
    const feld = wurzel.querySelector(`[data-fuer="${id}"]`);
    if (feld && text) feld.textContent = text;
  };

  const [zusagen, stimmen] = await Promise.all([fetchRsvpCount(), fetchResults()]);

  if (zusagen && !zusagen.lokal && zusagen.gesamt > 0) {
    setze('tickets', `${zusagen.gesamt} ${zusagen.gesamt === 1 ? 'ist' : 'sind'} dabei`);
  }

  if (stimmen) {
    // Die größte Wählerzahl über alle Umfragen — „so viele machen mit".
    const meiste = Math.max(0, ...Object.values(stimmen).map((t) => t?.voters ?? 0));
    if (meiste > 0) setze('abstimmen', `${meiste} ${meiste === 1 ? 'Stimme' : 'Stimmen'}`);
  }
}
