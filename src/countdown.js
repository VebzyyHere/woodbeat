// ============================================================
// COUNTDOWN & FESTIVAL-PHASE
//
// Zwei Ziele, je nachdem ob der Termin feststeht:
//   datumBekannt: false → zählt bis zur Verkündung (enthuellungISO)
//   datumBekannt: true  → zählt bis zum ersten Kick (startISO)
// ============================================================

import { FESTIVAL } from './data.js';

/** 'offen' | 'verkuendet' | 'vor' | 'live' | 'nach' */
export function phase(now = Date.now()) {
  if (!FESTIVAL.datumBekannt) {
    return now < +new Date(FESTIVAL.enthuellungISO) ? 'offen' : 'verkuendet';
  }
  const start = +new Date(FESTIVAL.startISO);
  const ende = +new Date(FESTIVAL.endISO);
  if (now < start) return 'vor';
  return now <= ende ? 'live' : 'nach';
}

const zielISO = () => (FESTIVAL.datumBekannt ? FESTIVAL.startISO : FESTIVAL.enthuellungISO);

export function tminus(now = Date.now()) {
  const rest = Math.max(0, +new Date(zielISO()) - now);
  return {
    rest,
    tage: Math.floor(rest / 86_400_000),
    std: Math.floor(rest / 3_600_000) % 24,
    min: Math.floor(rest / 60_000) % 60,
    sek: Math.floor(rest / 1000) % 60,
  };
}

const zwei = (n) => String(n).padStart(2, '0');

/** Unterzeile unter den vier Ziffern + Kurztext für die Navigation. */
function texte(now) {
  const t = tminus(now);
  switch (phase(now)) {
    case 'offen':
      return { label: 'bis zur Verkündung', kurz: `Datum in ${t.tage} T` };
    case 'verkuendet':
      return { label: 'Das Datum kommt in den nächsten Tagen', kurz: 'Datum gleich' };
    case 'vor':
      return { label: 'bis zum ersten Kick', kurz: `T−${t.tage}` };
    case 'live':
      return { label: 'Wir sind mittendrin', kurz: 'Jetzt' };
    default:
      return { label: 'Das war’s. Bis nächstes Jahr', kurz: 'Vorbei' };
  }
}

/**
 * @param {{tage, std, min, sek, label}|null} gross  die vier Ziffernfelder + Unterzeile
 * @param {HTMLElement|null} klein  Kurzanzeige in der Navigation
 */
export function initCountdown(gross, klein) {
  let timer = 0;

  function tick() {
    const now = Date.now();
    const t = tminus(now);
    const x = texte(now);
    if (gross) {
      gross.tage.textContent = String(t.tage);
      gross.std.textContent = zwei(t.std);
      gross.min.textContent = zwei(t.min);
      gross.sek.textContent = zwei(t.sek);
      gross.label.textContent = x.label;
    }
    if (klein) klein.textContent = x.kurz;
  }

  function starte() {
    clearInterval(timer);
    tick();
    if (!document.hidden) timer = setInterval(tick, 1000);
  }

  document.addEventListener('visibilitychange', starte);
  starte();
}
