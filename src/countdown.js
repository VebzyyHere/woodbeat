// ============================================================
// COUNTDOWN & FESTIVAL-PHASE
//
// Der Countdown wird nach Schwelle prominent, nicht dauerhaft:
// ein dreistelliger Zähler sagt elf Monate lang „hier passiert
// nichts". Erst ab 30 Tagen wird er groß, ab 24 Stunden glüht er.
// ============================================================

import { FESTIVAL } from './data.js';

const TAG = 86_400_000;

/** 'vor' | 'live' | 'nach' */
export function phase(now = Date.now()) {
  const start = +new Date(FESTIVAL.startISO);
  const ende = +new Date(FESTIVAL.endISO);
  if (now < start) return 'vor';
  return now <= ende ? 'live' : 'nach';
}

export function tminus(now = Date.now()) {
  const rest = +new Date(FESTIVAL.startISO) - now;
  return {
    rest,
    tage: Math.floor(rest / TAG),
    std: Math.floor(rest / 3_600_000) % 24,
    min: Math.floor(rest / 60_000) % 60,
    sek: Math.floor(rest / 1000) % 60,
  };
}

const zwei = (n) => String(n).padStart(2, '0');

function texte(now) {
  const p = phase(now);
  if (p === 'live') return { kurz: 'Jetzt', lang: 'Wir sind mittendrin.', glut: true, nah: true };
  if (p === 'nach') return { kurz: 'Vorbei', lang: 'Das war’s. Bis nächstes Jahr.', glut: false, nah: false };

  const { rest, tage, std, min, sek } = tminus(now);
  if (rest <= TAG) {
    return {
      kurz: `T−${zwei(std)}:${zwei(min)}:${zwei(sek)}`,
      lang: `T−${zwei(std)}:${zwei(min)}:${zwei(sek)} bis zum ersten Kick`,
      glut: true,
      nah: true,
    };
  }
  if (tage <= 30) {
    return {
      kurz: `T−${tage} · ${zwei(std)}:${zwei(min)}`,
      lang: `T−${tage} Tage ${zwei(std)}:${zwei(min)}:${zwei(sek)}`,
      glut: false,
      nah: true,
    };
  }
  return { kurz: `T−${tage}`, lang: `T−${tage} Tage bis zum ersten Kick`, glut: false, nah: false };
}

/**
 * Das einzige Element der Seite, das sich von selbst verändert —
 * und nur, wenn es etwas zu sagen hat. Pausiert im Hintergrund.
 */
export function initCountdown(uhrGross, uhrKlein) {
  let timer = 0;

  function tick() {
    const t = texte(Date.now());
    if (uhrGross) {
      uhrGross.textContent = t.lang;
      uhrGross.toggleAttribute('data-nah', t.nah);
      uhrGross.toggleAttribute('data-glut', t.glut);
    }
    if (uhrKlein) {
      uhrKlein.textContent = t.kurz;
      uhrKlein.toggleAttribute('data-glut', t.glut);
    }
  }

  function starte() {
    clearInterval(timer);
    tick();
    if (!document.hidden) timer = setInterval(tick, 1000);
  }

  document.addEventListener('visibilitychange', starte);
  starte();
}
