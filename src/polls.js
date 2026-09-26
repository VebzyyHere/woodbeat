// ============================================================
// ABSTIMMUNGEN — die drei Umfragen und der Termin-Tipp.
//
// Beide laufen über dieselbe Auszählung (live.js); der Tipp ist
// nur eine weitere Umfrage mit der poll-id `termin`, die als
// Chip-Reihe statt als Liste gesetzt wird.
//
// Hinter jeder Antwort füllt sich eine Fläche bis --pct. Sie ist
// Dekoration (aria-hidden) — die Prozentzahl daneben ist die
// Information und steht als echter Text im DOM.
//
// Vor der eigenen Stimme bleiben die Zahlen verdeckt: das
// verhindert den Ankereffekt und macht das Abstimmen zum
// belohnten Moment.
// ============================================================

import { FESTIVAL, TERMIN_TIPP, UMFRAGEN, UMFRAGEN_SHARE } from './data.js';
import {
  castVote, eigeneWahl, fetchResults, flushOutbox,
  liveEnabled, outboxOffen, toPercent,
} from './live.js';
import { puls, uebergang } from './register.js';

const AKTUALISIERUNG = 20_000;

let stand = {};          // { [pollId]: { counts, voters } }
let geladen = false;     // lag schon einmal eine Auszählung vor?
let lokal = !liveEnabled();
let fehler = false;
let ticker = 0;
const sichtbare = new Set();

/** Alle Umfragen, die gerade laufen — der Tipp nur, solange das Datum offen ist. */
const aktive = () => (FESTIVAL.datumBekannt ? UMFRAGEN : [TERMIN_TIPP, ...UMFRAGEN]);

/** Die eigene Stimme sofort einrechnen, bevor der Server antwortet. */
function optimistisch(pollId, neueKeys, alteKeys) {
  const topf = (stand[pollId] ??= { counts: {}, voters: 0 });
  const warSchonDabei = alteKeys.length > 0;
  for (const key of alteKeys) topf.counts[key] = Math.max(0, (topf.counts[key] ?? 1) - 1);
  for (const key of neueKeys) topf.counts[key] = (topf.counts[key] ?? 0) + 1;
  if (!warSchonDabei && neueKeys.length) topf.voters += 1;
  if (warSchonDabei && !neueKeys.length) topf.voters = Math.max(0, topf.voters - 1);
}

const uhrzeit = () =>
  new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

function fussText(poll, hatGewaehlt) {
  const voters = stand[poll.id]?.voters ?? 0;
  if (!geladen) return 'Auszählung wird geholt';
  if (fehler) return 'Auszählung nicht erreichbar — deine Stimme ist gespeichert und geht raus, sobald du wieder Netz hast';
  if (!hatGewaehlt) {
    if (!voters) return 'Noch keine Stimme. Du machst den Anfang';
    return `Noch nicht abgestimmt · ${voters} ${voters === 1 ? 'hat' : 'haben'} schon`;
  }
  if (lokal) return 'Gezählt wird bisher nur auf diesem Gerät — die gemeinsame Auszählung kommt, sobald die Datenbank steht';
  return `${voters} ${voters === 1 ? 'Stimme' : 'Stimmen'} · Stand ${uhrzeit()}`;
}

function zeichne() {
  const wahl = eigeneWahl();

  for (const poll of aktive()) {
    const feld = document.querySelector(`[data-poll="${poll.id}"]`);
    if (!feld) continue;

    const meine = wahl[poll.id] ?? [];
    const hatGewaehlt = meine.length > 0;
    const topf = stand[poll.id];
    const voters = topf?.voters ?? 0;
    // Zahlen erst zeigen, wenn abgestimmt UND eine Auszählung vorliegt.
    // Sonst stünde nach dem Neuladen kurz "0 %" statt "– –".
    const zeigeZahlen = hatGewaehlt && geladen;
    feld.toggleAttribute('data-verdeckt', !zeigeZahlen);

    for (const option of poll.options) {
      const zeile = feld.querySelector(`[data-key="${option.key}"]`);
      if (!zeile) continue;
      const istMeine = meine.includes(option.key);
      zeile.toggleAttribute('data-mine', istMeine);
      zeile.querySelector('input').checked = istMeine;

      const anzahl = topf?.counts?.[option.key] ?? 0;
      const prozent = toPercent(anzahl, voters);
      zeile.style.setProperty('--pct', zeigeZahlen ? `${prozent}%` : '0%');
      // Im Tipp-Raster nur Wochenenden mit Stimmen beziffern — 13× „0 %“ ist Rauschen.
      const zeigen = zeigeZahlen && (!feld.classList.contains('umfrage--chips') || anzahl > 0);
      zeile.querySelector('.opt__zahl').textContent = zeigen ? `${prozent} %` : '';
    }

    feld.querySelector('.umfrage__fuss').textContent = fussText(poll, hatGewaehlt);
  }
}

function baueUmfrage(poll, wurzel, chips) {
  const feld = document.createElement('fieldset');
  feld.className = chips ? 'umfrage umfrage--chips' : 'umfrage auf';
  feld.dataset.poll = poll.id;

  const frage = document.createElement('legend');
  frage.className = 'umfrage__frage';
  frage.textContent = poll.frage;
  if (poll.multi) {
    const modus = document.createElement('span');
    modus.className = 'umfrage__modus mono';
    modus.textContent = 'Mehrfachauswahl';
    frage.append(' ', modus);
  }

  const liste = document.createElement('div');
  liste.className = 'umfrage__liste';

  for (const option of poll.options) {
    const zeile = document.createElement('label');
    zeile.className = 'opt';
    zeile.dataset.key = option.key;

    const feldchen = document.createElement('input');
    feldchen.type = poll.multi ? 'checkbox' : 'radio';
    feldchen.name = `poll-${poll.id}`;
    feldchen.value = option.key;
    feldchen.className = 'opt__input';
    feldchen.addEventListener('change', () => stimmeAb(poll, option.key));

    const fuellung = document.createElement('span');
    fuellung.className = 'opt__fuell';
    fuellung.setAttribute('aria-hidden', 'true');

    const text = document.createElement('span');
    text.className = 'opt__label';
    if (option.monat) {
      const monat = document.createElement('span');
      monat.className = 'opt__monat mono';
      monat.textContent = option.monat;
      text.append(monat, ' ');
    }
    text.append(option.label);

    const zahl = document.createElement('span');
    zahl.className = 'opt__zahl mono';

    const mein = document.createElement('span');
    mein.className = 'opt__mein mono';
    mein.textContent = chips ? 'Dein Tipp' : 'Deine Stimme';

    zeile.append(feldchen, fuellung, text, zahl, mein);
    liste.append(zeile);
  }

  const fuss = document.createElement('p');
  fuss.className = 'umfrage__fuss mono';
  fuss.setAttribute('aria-live', 'polite');

  feld.append(frage, liste, fuss);
  wurzel.append(feld);
}

async function stimmeAb(poll, key) {
  const alte = eigeneWahl()[poll.id] ?? [];
  let neue;
  if (poll.multi) neue = alte.includes(key) ? alte.filter((k) => k !== key) : [...alte, key];
  else neue = [key];

  puls();
  navigator.vibrate?.(12);

  optimistisch(poll.id, neue, alte);
  geladen = true;   // ab jetzt gibt es Zahlen zu zeigen
  uebergang(zeichne);

  const angekommen = await castVote(poll.id, neue);
  fehler = liveEnabled() && !angekommen;
  if (angekommen) await hole();
  else zeichne();
}

async function hole() {
  const frisch = await fetchResults();
  lokal = Boolean(frisch?._lokal) || !liveEnabled();
  if (frisch) {
    delete frisch._lokal;
    stand = frisch;
    geladen = true;
    fehler = liveEnabled() && lokal;
  }
  zeichne();
}

function takt() {
  clearInterval(ticker);
  if (!sichtbare.size || document.hidden || !liveEnabled()) return;
  ticker = setInterval(hole, AKTUALISIERUNG);
}

/**
 * @param {{umfragen: HTMLElement, tipp: HTMLElement|null, modus: HTMLElement|null}} ziele
 */
export function initPolls({ umfragen, tipp, modus }) {
  if (!umfragen) return;
  for (const poll of UMFRAGEN) baueUmfrage(poll, umfragen, false);
  if (tipp && !FESTIVAL.datumBekannt) baueUmfrage(TERMIN_TIPP, tipp, true);
  zeichne();

  if (modus) {
    modus.textContent = liveEnabled()
      ? 'Ein Gerät, eine Stimme pro Frage. Meinung geändert? Einfach die andere Antwort antippen.'
      : 'Die gemeinsame Auszählung ist noch nicht angeschlossen — deine Auswahl bleibt vorerst auf diesem Gerät.';
  }

  // Ohne Server kostet die Auszählung nichts — sofort holen.
  if (!liveEnabled()) hole();

  // Mit Server: erst laden, wenn eine Abstimmung wirklich ins Bild kommt.
  const beobachter = new IntersectionObserver((eintraege) => {
    let neuSichtbar = false;
    for (const e of eintraege) {
      if (e.isIntersecting) {
        if (!sichtbare.size) neuSichtbar = true;
        sichtbare.add(e.target);
      } else sichtbare.delete(e.target);
    }
    if (neuSichtbar) hole();
    takt();
  }, { threshold: 0.05 });
  beobachter.observe(umfragen);
  if (tipp) beobachter.observe(tipp);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && sichtbare.size) hole();
    takt();
  });

  addEventListener('online', async () => {
    if (await flushOutbox()) {
      fehler = false;
      hole();
    }
  });

  if (outboxOffen()) flushOutbox().then((ok) => ok && hole());
}

/** Text für den Teilen-Button: die Auszählung, nicht die eigene Stimme. */
export function auszaehlungAlsText() {
  const zeilen = [UMFRAGEN_SHARE];
  for (const poll of aktive()) {
    const topf = stand[poll.id];
    if (!topf?.voters) continue;
    const sortiert = poll.options
      .map((o) => ({ ...o, n: topf.counts?.[o.key] ?? 0 }))
      .sort((a, b) => b.n - a.n)
      .filter((o) => o.n > 0)
      .slice(0, 3)
      .map((o) => `${o.monat ? `${o.label} ${o.monat}` : o.label} ${toPercent(o.n, topf.voters)}%`);
    if (sortiert.length) zeilen.push(`${poll.frage}\n  ${sortiert.join(' · ')}`);
  }
  if (zeilen.length === 1) zeilen.push('Noch keine Stimmen. Mach den Anfang.');
  return zeilen.join('\n\n');
}
