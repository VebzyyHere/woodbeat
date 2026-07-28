// ============================================================
// WoodBeat — Bootstrapping.
// Inhalte ändern? → src/data.js. Aussehen? → src/style.css.
// Diese Datei orchestriert nur.
// ============================================================

import '@fontsource/bevan/latin-400.css';
import '@fontsource-variable/martian-mono/standard.css';
import './style.css';

import { FESTIVAL, INDEX } from './data.js';
import { initCountdown, phase } from './countdown.js';
import { auszaehlungAlsText, initPolls } from './polls.js';
import { initAudio } from './audio.js';

const $ = (wahl) => document.querySelector(wahl);

// ---------- Kopf ----------

$('#marke-jahr').textContent = String(FESTIVAL.jahr);
$('#anschlag-fakten').textContent = `${FESTIVAL.datumKurz} · ab ${FESTIVAL.abPreis}`;
$('#fuss-jahr').textContent = String(FESTIVAL.jahr);
document.title = `WoodBeat ${FESTIVAL.jahr}`;

// ---------- Banderole ----------
// Das Motto zweimal einfüllen → nahtlose Endlosschleife.

const spur = $('#banderole-spur');
const teile = FESTIVAL.motto.split('·').map((s) => s.trim());
for (let runde = 0; runde < 2; runde++) {
  for (const teil of teile) {
    const wort = document.createElement('span');
    wort.textContent = teil;
    const raute = document.createElement('b');
    raute.textContent = '◆';
    spur.append(wort, raute);
  }
}

// ---------- Index-Leiste ----------

const liste = $('#index-liste');
for (const eintrag of INDEX) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = `#${eintrag.id}`;
  a.textContent = `${eintrag.nr} ${eintrag.label}`;
  li.append(a);
  liste.append(li);
}

// Aktiver Eintrag folgt dem Scrollen und wird in der Leiste mittig gezogen.
const marken = new Map();
for (const eintrag of INDEX) {
  const ziel = document.getElementById(eintrag.id);
  if (ziel) marken.set(ziel, liste.querySelector(`a[href="#${eintrag.id}"]`));
}

const beobachter = new IntersectionObserver(
  (eintraege) => {
    for (const e of eintraege) {
      if (!e.isIntersecting) continue;
      const aktiv = marken.get(e.target);
      if (!aktiv) continue;
      for (const a of marken.values()) a.removeAttribute('aria-current');
      aktiv.setAttribute('aria-current', 'true');
      aktiv.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'auto' });
    }
  },
  { rootMargin: '-40% 0px -50% 0px' },
);
for (const ziel of marken.keys()) beobachter.observe(ziel);

// ---------- Countdown ----------

initCountdown($('#anschlag-uhr'), $('#index-uhr'));
document.documentElement.dataset.phase = phase();

// ---------- Stimmzettel ----------

$('#zettel-kopf').textContent = `Stimmzettel · WoodBeat ${FESTIVAL.jahr} · Ausgabe 01`;
initPolls($('#umfragen'), $('#zettel-modus'));

$('#zettel-teilen').addEventListener('click', async () => {
  const text = auszaehlungAlsText();
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return;
    } catch {
      return; // abgebrochen
    }
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
});

// ---------- Ton ----------

initAudio($('#ton'), $('#ton-label'));
