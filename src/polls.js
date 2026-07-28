// ============================================================
// DER STIMMZETTEL
//
// Der Ergebnisbalken ist kein <div> mit width, sondern das erste
// Wort der Antwort, endlos wiederholt und bei --pct abgeschnitten.
// Er ist Dekoration (aria-hidden) — die Prozentzahl daneben ist
// die Information und steht als echter Text im DOM.
//
// Vor der eigenen Stimme bleiben die Zahlen verdeckt: das
// verhindert den Ankereffekt und macht das Abstimmen zum
// belohnten Moment.
// ============================================================

import { UMFRAGEN, UMFRAGEN_SHARE } from './data.js';
import {
  castVote, eigeneWahl, fetchResults, flushOutbox,
  liveEnabled, outboxOffen, toPercent,
} from './live-polls.js';
import { puls } from './register.js';

const AKTUALISIERUNG = 20_000;

let stand = {};          // { [pollId]: { counts, voters } }
let geladen = false;     // lag schon einmal eine Auszählung vor?
let lokal = !liveEnabled();
let fehler = false;
let ticker = 0;
let sichtbar = false;

/** Das Wort, aus dem der Balken gesetzt wird. Nur das erste —
 *  sonst wird „Melodic Techno / House" zu Matsch. */
function balkenWort(label) {
  const wort = label
    .split(/[\s—–/·]+/)[0]
    .replace(/[^A-Za-zÄÖÜäöüß&]/g, '')
    .toUpperCase()
    .slice(0, 10);
  const basis = wort || 'WOODBEAT';
  return basis.repeat(Math.ceil(90 / basis.length));
}

/** Die eigene Stimme sofort einrechnen, bevor der Server antwortet. */
function optimistisch(pollId, neueKeys, alteKeys) {
  const topf = (stand[pollId] ??= { counts: {}, voters: 0 });
  const warSchonDabei = alteKeys.length > 0;
  for (const key of alteKeys) topf.counts[key] = Math.max(0, (topf.counts[key] ?? 1) - 1);
  for (const key of neueKeys) topf.counts[key] = (topf.counts[key] ?? 0) + 1;
  if (!warSchonDabei && neueKeys.length) topf.voters += 1;
  if (warSchonDabei && !neueKeys.length) topf.voters = Math.max(0, topf.voters - 1);
}

function fussText(poll, hatGewaehlt) {
  const topf = stand[poll.id];
  const voters = topf?.voters ?? 0;

  if (!geladen) return 'Auszählung wird geholt';
  if (fehler) return 'Auszählung nicht erreichbar — deine Stimme ist gespeichert und geht raus, sobald du wieder Netz hast';
  if (!hatGewaehlt) {
    if (!voters) return 'Noch keine Stimme. Du machst den Anfang';
    return `Noch nicht abgestimmt · ${voters} ${voters === 1 ? 'hat' : 'haben'} schon`;
  }
  if (lokal) return 'Auszählung läuft nur auf diesem Gerät — die gemeinsame Zählung kommt, sobald die Datenbank steht';
  return `Auszählung · ${voters} ${voters === 1 ? 'Stimme' : 'Stimmen'} · Stand ${uhrzeit()}`;
}

const uhrzeit = () =>
  new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

function zeichne(wurzel) {
  const wahl = eigeneWahl();

  for (const poll of UMFRAGEN) {
    const feld = wurzel.querySelector(`[data-poll="${poll.id}"]`);
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

      const balken = zeile.querySelector('.zettel__balken');
      balken.style.setProperty('--pct', zeigeZahlen ? `${prozent}%` : '0%');

      zeile.toggleAttribute('data-leer', !zeigeZahlen);
      zeile.querySelector('.zettel__zahl').textContent = zeigeZahlen ? `${prozent} %` : '– –';
      zeile.querySelector('.zettel__stimmen').textContent = zeigeZahlen ? String(anzahl) : '';
    }

    feld.querySelector('.zettel__fuss').textContent = fussText(poll, hatGewaehlt);
  }
}

function baue(wurzel) {
  for (const poll of UMFRAGEN) {
    const feld = document.createElement('fieldset');
    feld.className = 'zettel';
    feld.dataset.poll = poll.id;

    const frage = document.createElement('legend');
    frage.className = 'zettel__frage';
    frage.textContent = poll.frage;

    const modus = document.createElement('p');
    modus.className = 'zettel__modus daten';
    modus.textContent = poll.multi ? 'Mehrfachauswahl' : 'Eine Stimme';

    const liste = document.createElement('ul');
    liste.className = 'zettel__liste';

    for (const option of poll.options) {
      const zeile = document.createElement('li');
      zeile.className = 'zettel__zeile';
      zeile.dataset.key = option.key;

      const wahl = document.createElement('label');
      wahl.className = 'zettel__wahl';

      const feldchen = document.createElement('input');
      feldchen.type = poll.multi ? 'checkbox' : 'radio';
      feldchen.name = `poll-${poll.id}`;
      feldchen.value = option.key;

      const kasten = document.createElement('span');
      kasten.className = 'zettel__kasten';
      kasten.setAttribute('aria-hidden', 'true');

      const label = document.createElement('span');
      label.className = 'zettel__label';
      label.textContent = option.label;

      wahl.append(feldchen, kasten, label);

      const balken = document.createElement('span');
      balken.className = 'zettel__balken';
      balken.setAttribute('aria-hidden', 'true');
      balken.textContent = balkenWort(option.label);

      const zahlen = document.createElement('span');
      zahlen.className = 'zettel__zahlen daten';
      const zahl = document.createElement('span');
      zahl.className = 'zettel__zahl';
      const stimmen = document.createElement('span');
      stimmen.className = 'zettel__stimmen';
      zahlen.append(zahl, stimmen);

      const mein = document.createElement('span');
      mein.className = 'zettel__mein daten';
      mein.textContent = '◀ Deine Stimme';

      zeile.append(wahl, balken, zahlen, mein);
      liste.append(zeile);

      feldchen.addEventListener('change', () => stimmeAb(poll, option.key, wurzel));
    }

    const fuss = document.createElement('p');
    fuss.className = 'zettel__fuss daten';
    fuss.setAttribute('aria-live', 'polite');

    feld.append(frage, modus, liste, fuss);
    wurzel.append(feld);
  }
}

async function stimmeAb(poll, key, wurzel) {
  const wahl = eigeneWahl();
  const alte = wahl[poll.id] ?? [];

  let neue;
  if (poll.multi) {
    neue = alte.includes(key) ? alte.filter((k) => k !== key) : [...alte, key];
  } else {
    neue = [key];
  }

  // Der ganze Bogen zuckt — dieselbe Mechanik wie der Taktschlag.
  puls(9, 140);
  navigator.vibrate?.(12);

  optimistisch(poll.id, neue, alte);
  geladen = true;   // ab jetzt gibt es Zahlen zu zeigen
  const male = () => zeichne(wurzel);
  if (document.startViewTransition) document.startViewTransition(male);
  else male();

  const angekommen = await castVote(poll.id, neue);
  fehler = liveEnabled() && !angekommen;
  if (angekommen) await hole(wurzel);
  else zeichne(wurzel);
}

async function hole(wurzel) {
  const frisch = await fetchResults();
  lokal = Boolean(frisch?._lokal) || !liveEnabled();
  if (frisch) {
    delete frisch._lokal;
    stand = frisch;
    geladen = true;
    fehler = liveEnabled() && lokal;
  }
  zeichne(wurzel);
}

function takt(wurzel) {
  clearInterval(ticker);
  if (!sichtbar || document.hidden || !liveEnabled()) return;
  ticker = setInterval(() => hole(wurzel), AKTUALISIERUNG);
}

export function initPolls(wurzel, modusZeile) {
  if (!wurzel) return;
  baue(wurzel);
  zeichne(wurzel);

  if (modusZeile) {
    modusZeile.textContent = liveEnabled()
      ? 'Ein Gerät, eine Stimme. Meinung ändern geht jederzeit.'
      : 'Die gemeinsame Auszählung ist noch nicht angeschlossen — deine Auswahl bleibt vorerst auf diesem Gerät.';
  }

  // Ohne Server kostet die Auszählung nichts — sofort holen, damit die
  // eigene Wahl nach dem Neuladen nicht erst beim Scrollen auftaucht.
  if (!liveEnabled()) hole(wurzel);

  // Mit Server: erst laden, wenn die Sektion wirklich ins Bild kommt.
  new IntersectionObserver((eintraege) => {
    sichtbar = eintraege[0].isIntersecting;
    if (sichtbar) hole(wurzel);
    takt(wurzel);
  }, { threshold: 0.05 }).observe(wurzel);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && sichtbar) hole(wurzel);
    takt(wurzel);
  });

  addEventListener('online', async () => {
    if (await flushOutbox()) {
      fehler = false;
      hole(wurzel);
    }
  });

  if (outboxOffen()) flushOutbox().then((ok) => ok && hole(wurzel));
}

/** Text für den Teilen-Button: die Auszählung, nicht die eigene Stimme. */
export function auszaehlungAlsText() {
  const zeilen = [UMFRAGEN_SHARE];
  for (const poll of UMFRAGEN) {
    const topf = stand[poll.id];
    if (!topf?.voters) continue;
    const sortiert = poll.options
      .map((o) => ({ ...o, n: topf.counts?.[o.key] ?? 0 }))
      .sort((a, b) => b.n - a.n)
      .filter((o) => o.n > 0)
      .slice(0, 3)
      .map((o) => `${o.label} ${toPercent(o.n, topf.voters)}%`);
    if (sortiert.length) zeilen.push(`${poll.frage}\n  ${sortiert.join(' · ')}`);
  }
  if (zeilen.length === 1) zeilen.push('Noch keine Stimmen. Mach den Anfang.');
  return zeilen.join('\n\n');
}
