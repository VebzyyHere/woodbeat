// ============================================================
// WoodBeat — Bootstrapping.
// Inhalte ändern? → src/data.js. Aussehen? → src/style.css.
// Seitenschnitt ändern? → src/seiten.js.
//
// Fünf Seiten, ein Bündel: der Browser lädt JS und CSS beim ersten
// Aufruf und hat sie danach für alle weiteren Seiten im Cache.
// Was gerendert wird, entscheidet `data-seite` am <body>.
// ============================================================

import '@fontsource/bevan/latin-400.css';
import '@fontsource-variable/martian-mono/standard.css';
import './style.css';

import { FESTIVAL } from './data.js';
import { AUSHAENGE, BASIS, urlVon } from './seiten.js';
import { emblemeEinsetzen } from './glyphen.js';
import { initCountdown } from './countdown.js';
import { renderAushaenge } from './aushaenge.js';
import { auszaehlungAlsText, initPolls } from './polls.js';
import { initRsvp } from './rsvp.js';
import { initAudio } from './audio.js';
import { teilen } from './teilen.js';
import {
  renderBar, renderFaq, renderKodex, renderLageplan, renderLaufplan,
  renderLineup, renderMitbringen, renderPlaylist, renderRueckblick, renderTickets,
} from './sections.js';

const $ = (wahl) => document.querySelector(wahl);
const seite = document.body.dataset.seite;

emblemeEinsetzen();

// ---------- Gemeinsames auf jeder Seite ----------

for (const feld of document.querySelectorAll('#kopf-jahr')) {
  feld.textContent = String(FESTIVAL.jahr);
}
// Der Zurück-Link im Blattkopf steht als "../" im HTML — das stimmt
// lokal wie unter /woodbeat/ und funktioniert auch ohne JavaScript.

baueFuss();
const uhrKlein = baueIndex();

// ---------- Seitenspezifisches ----------

if (seite === 'start') {
  $('#marke-jahr').textContent = String(FESTIVAL.jahr);
  $('#anschlag-fakten').textContent = `${FESTIVAL.datumKurz} · ab ${FESTIVAL.abPreis}`;
  baueBanderole();
  renderAushaenge($('#aushaenge-liste'));
  renderRueckblick($('#rueckblick-titel'), $('#rueckblick-text'), $('#rueckblick-bilder'));
  initCountdown($('#anschlag-uhr'), uhrKlein);
} else {
  initCountdown(null, uhrKlein);
}

if (seite === 'programm') {
  renderLineup($('#lineup-liste'), $('#lineup-hinweis'));
  renderLaufplan($('#tag-reiter'), $('#lauf-liste'));
  renderPlaylist($('#spotify'));
}

if (seite === 'tickets') {
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
}

if (seite === 'abstimmen') {
  $('#zettel-kopf').textContent = `Stimmzettel · WoodBeat ${FESTIVAL.jahr} · Ausgabe 01`;
  initPolls($('#umfragen'), $('#zettel-modus'));
  $('#zettel-teilen').addEventListener('click', () => teilen(auszaehlungAlsText()));
}

if (seite === 'praktisches') {
  renderLageplan($('#lageplan-ort'), $('#lageplan-hinweise'));
  renderMitbringen($('#pack-liste'), $('#pack-stand'));
  renderKodex($('#kodex-liste'), $('#crew-liste'));
  renderFaq($('#faq-liste'));
}

initAudio($('#ton'), $('#ton-label'));

// ============================================================
// Bausteine
// ============================================================

/** Motto zweimal einfüllen → nahtlose Endlosschleife. */
function baueBanderole() {
  const spur = $('#banderole-spur');
  if (!spur) return;
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
}

function baueFuss() {
  const fuss = document.createElement('footer');
  fuss.className = 'fuss';
  fuss.innerHTML = `
    <svg class="fuss__siegel" viewBox="0 0 88 88" aria-hidden="true" focusable="false">
      <use href="#emblem"></use>
    </svg>
    <p class="daten">WoodBeat · privat organisiert · ${FESTIVAL.jahr}</p>
    <p class="marginal">Gesetzt am Küchentisch. 128 BPM.</p>`;
  document.body.append(fuss);
}

/**
 * Die Index-Leiste: das einzige fixierte Element. Mobil unten am
 * Daumen, ab 780 px oben. Sie zeigt jetzt die SEITEN statt der
 * Abschnitte einer Endlosseite — das war der eigentliche Gewinn
 * des Seitenschnitts.
 * @returns das Countdown-Feld der Leiste
 */
function baueIndex() {
  const leiste = document.createElement('nav');
  leiste.className = 'index';
  leiste.setAttribute('aria-label', 'Seiten');

  const heim = document.createElement('a');
  heim.className = 'index__stempel';
  heim.href = BASIS;
  heim.setAttribute('aria-label', 'Zur Startseite');
  heim.innerHTML = '<svg viewBox="0 0 88 88" aria-hidden="true" focusable="false"><use href="#emblem-klein"></use></svg>';
  if (seite === 'start') heim.setAttribute('aria-current', 'page');

  const liste = document.createElement('ul');
  liste.className = 'index__liste';
  for (const eintrag of AUSHAENGE) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = urlVon(eintrag);
    if (eintrag.id === seite) a.setAttribute('aria-current', 'page');
    const nr = document.createElement('span');
    nr.className = 'index__nr';
    nr.textContent = eintrag.nr;
    a.append(nr, document.createTextNode(eintrag.titel));
    li.append(a);
    liste.append(li);
  }

  const ton = document.createElement('button');
  ton.className = 'index__ton';
  ton.type = 'button';
  ton.id = 'ton';
  ton.setAttribute('aria-pressed', 'false');
  ton.innerHTML =
    '<span class="index__ton-balken" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' +
    '<span id="ton-label">Ton</span>';

  const uhr = document.createElement('p');
  uhr.className = 'index__uhr daten';

  leiste.append(heim, liste, ton, uhr);
  document.body.append(leiste);

  // Die aktive Seite mittig in die Leiste ziehen. Ausdrücklich NICHT
  // über scrollIntoView(): die Leiste ist position:fixed und steht im
  // DOM am Ende — scrollIntoView() reißt die Seite ans Dokumentende.
  const aktiv = liste.querySelector('[aria-current="page"]');
  if (aktiv) {
    liste.scrollLeft = Math.max(0, aktiv.offsetLeft - (liste.clientWidth - aktiv.offsetWidth) / 2);
  }

  return uhr;
}
