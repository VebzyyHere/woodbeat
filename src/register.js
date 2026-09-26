// ============================================================
// Der Schlag.
//
// `--kick` (0…1) auf <html> ist der Herzschlag der Seite: die
// Jahresringe im Kopf und die Pille "Sommer 2027" wachsen mit ihm.
// Ohne Ton pulsiert er per CSS im 128-BPM-Takt; läuft der Ton,
// gibt der Audio-Takt den Schlag vor. Eine Stimmabgabe oder Zusage
// löst einen Extra-Schlag aus — lokale Handlung, seitenweite Folge.
// ============================================================

export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

let timer = 0;

/**
 * Ein Schlag.
 * @param {number} px  Stärke; 9 = Stimmabgabe, 6 = Taktschlag des Tons
 * @param {number} ms  Wie lange
 */
export function puls(px = 9, ms = 140) {
  if (reducedMotion) return;
  const wurzel = document.documentElement;
  wurzel.style.setProperty('--kick', String(Math.min(1, px / 9)));
  clearTimeout(timer);
  timer = setTimeout(() => wurzel.style.setProperty('--kick', '0'), ms);
}

/**
 * Den CSS-Puls abschalten, solange der Ton läuft — dann gibt der
 * Audio-Takt den Schlag vor, nicht die CSS-Uhr.
 */
export function cssPulsAktiv(an) {
  document.documentElement.classList.toggle('ton-an', !an);
  if (!an) document.documentElement.style.setProperty('--kick', '0');
}

/**
 * Zustandswechsel überblenden, wenn der Browser es kann.
 *
 * Die drei Promises MÜSSEN behandelt werden: bricht der Übergang ab
 * — weil jemand weiterklickt, den Tab wechselt oder die Seite
 * verlässt — lehnen sie ab, und eine unbehandelte Ablehnung landet
 * als Fehler in der Konsole. Ein abgebrochener Übergang ist aber
 * kein Fehler, sondern der Normalfall.
 */
export function uebergang(male) {
  if (reducedMotion || !document.startViewTransition) {
    male();
    return;
  }
  const wechsel = document.startViewTransition(male);
  wechsel.ready.catch(() => {});
  wechsel.finished.catch(() => {});
  wechsel.updateCallbackDone.catch(() => {});
}
