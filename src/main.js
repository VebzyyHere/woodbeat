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
import { initRsvp } from './rsvp.js';
import { initAudio } from './audio.js';
import { teilen } from './teilen.js';
import {
  renderBar, renderFaq, renderKodex, renderLageplan, renderLaufplan,
  renderLineup, renderMitbringen, renderPlaylist, renderRueckblick, renderTickets,
} from './sections.js';

const $ = (wahl) => document.querySelector(wahl);

// ---------- Kopf ----------

$('#marke-jahr').textContent = String(FESTIVAL.jahr);
$('#anschlag-fakten').textContent = `${FESTIVAL.datumKurz} · ab ${FESTIVAL.abPreis}`;
$('#fuss-jahr').textContent = String(FESTIVAL.jahr);
document.title = `WoodBeat ${FESTIVAL.jahr}`;
document.documentElement.dataset.phase = phase();

// ---------- Banderole ----------
// Motto zweimal einfüllen → nahtlose Endlosschleife.

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

// ---------- Sektionen ----------

$('#zettel-kopf').textContent = `Stimmzettel · WoodBeat ${FESTIVAL.jahr} · Ausgabe 01`;
initPolls($('#umfragen'), $('#zettel-modus'));
$('#zettel-teilen').addEventListener('click', () => teilen(auszaehlungAlsText()));

renderLineup($('#lineup-liste'), $('#lineup-hinweis'));
renderLaufplan($('#tag-reiter'), $('#lauf-liste'));
renderTickets($('#tickets-liste'), $('#tickets-hinweis'));
renderBar($('#bar-liste'));

initRsvp({
  form: $('#rsvp-form'),
  zaehler: $('#rsvp-zaehler'),
  aufteilung: $('#rsvp-aufteilung'),
  ticketWahl: $('#rsvp-ticket'),
  name: $('#rsvp-name'),
  notiz: $('#rsvp-notiz'),
  senden: $('#rsvp-senden'),
  loeschen: $('#rsvp-loeschen'),
  status: $('#rsvp-status'),
});

renderRueckblick($('#rueckblick-titel'), $('#rueckblick-text'), $('#rueckblick-bilder'));
renderLageplan($('#lageplan-ort'), $('#lageplan-hinweise'));
renderMitbringen($('#pack-liste'), $('#pack-stand'));
renderPlaylist($('#spotify'));
renderKodex($('#kodex-liste'), $('#crew-liste'));
renderFaq($('#faq-liste'));

// ---------- Festival-Modus ----------
// Wer um 23:40 mit einem Balken Empfang am Waldrand steht, sucht die
// Adresse — nicht den Stimmzettel. Während des Festivals rutschen
// Lageplan und Laufplan deshalb an den Anfang. Die Index-Leiste bleibt
// unverändert, sie sortiert nach data-nr statt nach DOM-Reihenfolge.

if (phase() === 'live') {
  const bogen = $('#bogen');
  bogen.prepend($('#laufplan'));
  bogen.prepend($('#lageplan'));
}

// ---------- Index-Leiste ----------

const liste = $('#index-liste');
for (const eintrag of INDEX) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = `#${eintrag.id}`;
  a.innerHTML = '';
  const nr = document.createElement('span');
  nr.className = 'index__nr';
  nr.textContent = eintrag.nr;
  a.append(nr, document.createTextNode(eintrag.label));
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

// ---------- Countdown & Ton ----------

initCountdown($('#anschlag-uhr'), $('#index-uhr'));
initAudio($('#ton'), $('#ton-label'));
