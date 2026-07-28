// ============================================================
// Das Register-Primitiv.
//
// `--reg` steuert, wie weit die Druckplatten auseinanderliegen.
// Normalerweise pulsiert es per CSS im Takt (siehe style.css).
// Von hier aus wird es kurz angehoben — dann zuckt der ganze
// Bogen: lokale Handlung, seitenweite Konsequenz.
// ============================================================

export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

let timer = 0;

/**
 * Einmal aus dem Register springen und zurückschnappen.
 * @param {number} px  Wie weit (9 = Stimmabgabe, 4 = Taktschlag)
 * @param {number} ms  Wie lange
 */
export function puls(px = 9, ms = 140) {
  if (reducedMotion) return;
  const wurzel = document.documentElement;
  wurzel.style.setProperty('--reg-extra', `${px}px`);
  clearTimeout(timer);
  timer = setTimeout(() => wurzel.style.setProperty('--reg-extra', '0px'), ms);
}

/**
 * Den CSS-Puls abschalten, solange der Ton läuft — dann gibt der
 * Audio-Takt den Schlag vor, nicht die CSS-Uhr.
 */
export function cssPulsAktiv(an) {
  document.documentElement.style.animationPlayState = an ? 'running' : 'paused';
  if (!an) document.documentElement.style.setProperty('--reg-extra', '0px');
}
