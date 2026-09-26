// ============================================================
// WoodBeat — Bootstrapping.
// Inhalte ändern? → src/data.js. Aussehen? → src/style.css.
//
// Eine Seite, neun Sektionen. Die Scroll- und Zoom-Animationen
// sind reines CSS (animation-timeline); hier gibt es nur einen
// kleinen Ersatz für Browser ohne Scroll-Timelines.
// ============================================================

import '@fontsource-variable/anybody/standard.css';
import '@fontsource-variable/familjen-grotesk/wght.css';
import '@fontsource-variable/martian-mono/standard.css';
import './style.css';

import { FESTIVAL, HINTERGRUND, RSVP } from './data.js';
import { initCountdown, phase } from './countdown.js';
import { auszaehlungAlsText, initPolls } from './polls.js';
import { initRsvp } from './rsvp.js';
import { initAudio } from './audio.js';
import { teilen } from './teilen.js';
import { reducedMotion } from './register.js';
import {
  renderBar, renderFaq, renderKodex, renderLageplan, renderLaufplan, renderLineup,
  renderMitbringen, renderPlaylist, renderRueckblick, renderSound, renderTickets, ticketKnoepfeVerbinden,
} from './sections.js';

const $ = (wahl) => document.querySelector(wahl);

// ---------- Kopf & Datum ----------

const datumSteht = FESTIVAL.datumBekannt;
$('#hero-wann').textContent = datumSteht ? FESTIVAL.datumKurz : FESTIVAL.saison;
$('#hero-satz').textContent = datumSteht
  ? `Drei Tage, zwei Nächte, ein Wald. Ab ${FESTIVAL.abPreis}.`
  : 'Das Datum wird bis Ende 2026 verkündet.';

if (datumSteht) {
  $('#datum-titel').innerHTML = 'Es steht.<br /><em></em>';
  $('#datum-titel em').textContent = FESTIVAL.datumKurz;
  $('#datum-intro').textContent = 'Drei Tage, zwei Nächte, ein Wald. Trag’s dir ein — und sag unten Bescheid, ob du kommst.';
  $('#tipp').hidden = true;
} else {
  $('#datum-titel').innerHTML = 'Wann?<br />Verraten wir<br /><em>bis Silvester.</em>';
  $('#datum-intro').textContent =
    `Ein Wochenende im ${FESTIVAL.saison}. Drei Tage, zwei Nächte, ein Wald. Das genaue Datum verkünden wir spätestens am 31. Dezember 2026 — bis dahin darfst du tippen.`;
}

$('#dabei-zeile').textContent = [
  datumSteht ? FESTIVAL.datumKurz : `${FESTIVAL.saison} · Datum folgt bis 31.12.2026`,
  FESTIVAL.locationShort,
].join(' · ');
$('#ab-preis').textContent = `${FESTIVAL.abPreis}.`;

baueBand();

initCountdown(
  {
    tage: $('#uhr-tage'), std: $('#uhr-std'), min: $('#uhr-min'),
    sek: $('#uhr-sek'), label: $('#uhr-label'),
  },
  $('#nav-uhr'),
);

// ---------- Sektionen ----------

initPolls({ umfragen: $('#umfragen'), tipp: $('#tipp'), modus: $('#abstimmen-modus') });
$('#abstimmen-teilen').addEventListener('click', () => teilen(auszaehlungAlsText()));

renderSound($('#sound-bpm'), $('#sound-satz'), $('#sound-liste'));
renderLineup($('#lineup-liste'), $('#lineup-hinweis'));
renderLaufplan($('#tag-reiter'), $('#lauf-liste'));
renderPlaylist($('#spotify'));
renderTickets($('#tickets-liste'), $('#tickets-hinweis'));
renderBar($('#bar-liste'));
renderRueckblick($('#rueckblick-titel'), $('#rueckblick-geist'), $('#rueckblick-text'), $('#rueckblick-bilder'));
renderLageplan($('#lageplan-ort'), $('#lageplan-hinweise'));
renderMitbringen($('#pack-liste'), $('#pack-stand'));
renderKodex($('#kodex-liste'), $('#crew-liste'));
renderFaq($('#faq-liste'));

$('#rsvp-hinweis').textContent = RSVP.hinweis;
const waehleTicket = initRsvp({
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
ticketKnoepfeVerbinden(waehleTicket);

initAudio($('#ton'), $('#ton-label'), HINTERGRUND.soundcloud);
if (HINTERGRUND.soundcloud) {
  const link = $('#song-link');
  link.href = HINTERGRUND.soundcloud;
  link.textContent = `Hintergrund-Song: ${HINTERGRUND.titel} ↗`;
  link.hidden = false;
}
initMenue();
initNavZustand();
initRevealErsatz();

// Während des Festivals ist der Laufplan das Wichtigste — direkt hin.
if (phase() === 'live' && !location.hash) {
  document.getElementById('programm')?.scrollIntoView();
}

// ============================================================
// Bausteine
// ============================================================

/** Motto viermal einfüllen — das Band läuft beim Scrollen um 50 % weiter. */
function baueBand() {
  const spur = $('#band-spur');
  const teile = FESTIVAL.motto.split('·').map((s) => s.trim());
  for (let runde = 0; runde < 4; runde++) {
    for (const teil of teile) {
      const wort = document.createElement('span');
      wort.textContent = teil;
      const stern = document.createElement('span');
      stern.className = 'band__stern';
      stern.textContent = '✺';
      spur.append(wort, stern);
    }
  }
}

/** Mobil: die Links liegen in einem Vollbild-Menü. */
function initMenue() {
  const knopf = $('#menue-knopf');
  const nav = $('.nav');
  const setze = (offen) => {
    nav.toggleAttribute('data-offen', offen);
    knopf.setAttribute('aria-expanded', String(offen));
    knopf.querySelector('.nav__menue-text').textContent = offen ? 'Zu' : 'Menü';
    document.documentElement.classList.toggle('menue-offen', offen);
  };
  knopf.addEventListener('click', () => setze(!nav.hasAttribute('data-offen')));
  for (const link of nav.querySelectorAll('.nav__links a, .nav__dabei, .nav__marke')) {
    link.addEventListener('click', () => setze(false));
  }
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.hasAttribute('data-offen')) {
      setze(false);
      knopf.focus();
    }
  });
}

/**
 * Die Navigation wird erst nach dem Kopf massiv, und der Link der
 * Sektion im Bild wird markiert.
 */
function initNavZustand() {
  const nav = $('.nav');
  new IntersectionObserver(([e]) => nav.toggleAttribute('data-fest', !e.isIntersecting), {
    rootMargin: '-80px 0px 0px 0px',
  }).observe($('#top'));

  const links = new Map(
    [...document.querySelectorAll('.nav__links a')].map((a) => [a.getAttribute('href').slice(1), a]),
  );
  const beobachter = new IntersectionObserver((eintraege) => {
    for (const e of eintraege) {
      if (!e.isIntersecting) continue;
      for (const a of links.values()) a.removeAttribute('aria-current');
      links.get(e.target.id)?.setAttribute('aria-current', 'true');
    }
  }, { rootMargin: '-45% 0px -50% 0px' });
  for (const id of links.keys()) {
    const sektion = document.getElementById(id);
    if (sektion) beobachter.observe(sektion);
  }
}

/**
 * Browser ohne Scroll-Timelines (Firefox, ältere Safari) bekommen
 * dieselben Einblendungen per IntersectionObserver — einmalig statt
 * scroll-synchron, aber nie unsichtbarer Inhalt.
 */
function initRevealErsatz() {
  if (CSS.supports('animation-timeline: view()') || reducedMotion) return;
  document.documentElement.classList.add('ohne-timeline');
  const beobachter = new IntersectionObserver((eintraege) => {
    for (const e of eintraege) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('ist-da');
      beobachter.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -8% 0px' });
  for (const k of document.querySelectorAll('.auf, .dehnen, .kippen')) beobachter.observe(k);
}
