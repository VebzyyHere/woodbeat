// ============================================================
// Die Sektionen der Seite.
//
// Je eine reine render*(…)-Funktion, kein gemeinsamer Zustand.
// Inhalte kommen ausschließlich aus data.js.
//
// Grundsatz überall: leere Daten erzeugen einen ENTWORFENEN
// Leerzustand ("Slot frei", gestrichelter Rahmen), nie ein
// trauriges "TBD" und nie einen toten Knopf.
// ============================================================

import {
  ANFAHRT, BAR, CREW, FAQ, KODEX, LINEUP, LINEUP_HINWEIS,
  RUECKBLICK, SOUND, SPOTIFY, TICKETS, TICKETS_HINWEIS, TIMETABLE, WUENSCHE,
} from './data.js';
import { phase } from './countdown.js';
import { uebergang } from './register.js';

const el = (tag, klasse, text) => {
  const k = document.createElement(tag);
  if (klasse) k.className = klasse;
  if (text != null) k.textContent = text;
  return k;
};

/** Leerzustand: gestrichelte Fläche mit Hinweis. */
const leer = (text) => el('p', 'leer mono', text);

// ---------- DER SOUND ----------

export function renderSound(bpm, satz, liste) {
  bpm.textContent = SOUND.bpm;
  satz.textContent = SOUND.satz;
  SOUND.genres.forEach((genre, i) => {
    const zeile = el('li', 'genre auf' + (genre.selten ? ' genre--selten' : ''));
    zeile.append(el('span', 'genre__nr mono', String(i + 1).padStart(2, '0')));
    zeile.append(el('span', 'genre__name disp', genre.name));
    if (genre.selten) zeile.append(el('span', 'genre__marke mono', 'ab und zu'));
    liste.append(zeile);
  });
}

// ---------- LINE-UP ----------

export function renderLineup(liste, hinweis) {
  // Die Slots stehen immer — auch ohne Namen. "Freitag 20:00 Opening"
  // sagt mehr als ein Sammelstempel, und die Lücke macht neugierig.
  for (const act of LINEUP) {
    const zeile = el('li', 'slot auf');
    zeile.append(el('span', 'slot__tag mono', act.tag));
    zeile.append(el('span', 'slot__zeit mono', `${act.zeit} Uhr`));
    const name = act.name.trim();
    const kopf = el('span', 'slot__name disp', name || act.rolle);
    zeile.append(kopf);
    zeile.append(
      name
        ? el('span', 'slot__info mono', [act.rolle, act.genre].filter(Boolean).join(' · '))
        : el('span', 'slot__frei mono', 'Slot frei'),
    );
    liste.append(zeile);
  }
  hinweis.textContent = LINEUP_HINWEIS;
}

// ---------- LAUFPLAN ----------

/**
 * Der JETZT-Marker läuft nur während des Festivals. Slots nach
 * Mitternacht (z. B. 01:00 Afterhour) werden bewusst dem Vorabend
 * zugeschlagen, so wie es auf einem Festival auch gelesen wird.
 */
function laufenderSlot(tagIndex) {
  if (phase() !== 'live') return -1;
  const jetzt = new Date();
  const minuten = jetzt.getHours() * 60 + jetzt.getMinutes();
  let treffer = -1;
  TIMETABLE[tagIndex].slots.forEach((slot, i) => {
    const [h, m] = slot.time.split(':').map(Number);
    if (h * 60 + m <= minuten) treffer = i;
  });
  return treffer;
}

export function renderLaufplan(reiterWurzel, listeWurzel) {
  let aktiv = 0;

  // Die Reiter werden EINMAL gebaut. Würden sie bei jedem Klick neu
  // entstehen, verlöre die Tastatur mitten in der Bedienung den Fokus.
  const knoepfe = TIMETABLE.map((tag, i) => {
    const knopf = el('button', 'reiter__knopf', tag.day);
    knopf.type = 'button';
    knopf.setAttribute('role', 'tab');
    knopf.setAttribute('aria-controls', 'lauf-liste');
    knopf.addEventListener('click', () => {
      if (aktiv === i) return;
      aktiv = i;
      uebergang(() => { markiere(); zeichne(); });
    });
    reiterWurzel.append(knopf);
    return knopf;
  });

  function markiere() {
    knoepfe.forEach((knopf, i) => knopf.setAttribute('aria-selected', String(i === aktiv)));
  }

  function zeichne() {
    listeWurzel.replaceChildren();
    const jetztIndex = laufenderSlot(aktiv);
    TIMETABLE[aktiv].slots.forEach((slot, i) => {
      const zeile = el('li', 'lauf');
      if (i === jetztIndex) zeile.setAttribute('data-jetzt', '');
      zeile.append(el('span', 'lauf__zeit disp', slot.time));
      const text = el('div', 'lauf__text');
      text.append(el('p', 'lauf__titel', slot.title));
      if (slot.note) text.append(el('p', 'lauf__notiz', slot.note));
      zeile.append(text);
      if (i === jetztIndex) zeile.append(el('span', 'lauf__jetzt mono', 'Jetzt'));
      listeWurzel.append(zeile);
    });
  }

  markiere();
  zeichne();
}

// ---------- TICKETS & BAR ----------

export function renderTickets(wurzel, hinweis) {
  for (const ticket of TICKETS) {
    const karte = el('article', 'ticket kippen' + (ticket.featured ? ' ticket--haupt' : ''));

    const inhalt = el('div', 'ticket__inhalt');
    const kopf = el('div', 'ticket__kopf');
    // h3: darüber steht die h2 der Sektion.
    kopf.append(el('h3', 'ticket__name mono', ticket.name));
    if (ticket.badge) kopf.append(el('span', 'ticket__marke mono', ticket.badge));
    inhalt.append(kopf);
    inhalt.append(el('p', 'ticket__preis disp', ticket.preis));
    inhalt.append(el('p', 'ticket__einheit mono', ticket.einheit));

    const liste = el('ul', 'ticket__liste');
    for (const punkt of ticket.includes) liste.append(el('li', null, punkt));
    inhalt.append(liste);

    const knopf = el('a', 'knopf ' + (ticket.featured ? 'knopf--dunkel' : 'knopf--rand'), 'Ticket sichern');
    knopf.href = '#dabei';
    knopf.dataset.ticket = ticket.key;
    inhalt.append(knopf);

    const abriss = el('div', 'ticket__abriss');
    abriss.setAttribute('aria-hidden', 'true');
    abriss.append(el('span', 'ticket__code disp', `WB·27·${ticket.key === 'weekend' ? 'FR–SO' : 'TAG'}`));

    karte.append(inhalt, abriss);
    wurzel.append(karte);
  }
  hinweis.textContent = TICKETS_HINWEIS;
}

export function renderBar(wurzel) {
  for (const gruppe of BAR) {
    const block = el('div', 'bar__gruppe');
    block.append(el('h4', 'bar__kategorie mono', gruppe.kategorie));
    const liste = el('ul', 'bar__liste');
    for (const drink of gruppe.drinks) {
      const zeile = el('li', 'bar__zeile');
      zeile.append(el('span', null, drink.name), el('span', 'bar__preis', drink.preis));
      liste.append(zeile);
    }
    block.append(liste);
    wurzel.append(block);
  }
}

// ---------- RÜCKBLICK ----------

export function renderRueckblick(titel, geist, text, bilder) {
  titel.textContent = `05 — Rückblick ${RUECKBLICK.jahr}`;
  geist.textContent = `${RUECKBLICK.jahr} `.repeat(4);
  text.textContent = RUECKBLICK.text;

  if (!RUECKBLICK.bilder.length) {
    // Drei leere Rahmen, leicht verdreht — die Einladung, Fotos zu schicken.
    for (let i = 0; i < 3; i++) bilder.append(el('div', 'foto foto--leer mono', i === 1 ? 'Schick uns dein bestes Foto' : 'Foto folgt'));
    return;
  }
  for (const bild of RUECKBLICK.bilder) {
    const rahmen = el('figure', 'foto');
    const img = document.createElement('img');
    img.src = bild.src;
    img.alt = bild.alt ?? '';
    img.loading = 'lazy';
    img.decoding = 'async';
    rahmen.append(img);
    bilder.append(rahmen);
  }
}

// ---------- ANFAHRT ----------

export function renderLageplan(wurzel, hinweise) {
  const offen = !ANFAHRT.name || ANFAHRT.name.startsWith('TBD');

  if (offen) {
    // Kein Routen-Knopf, solange es kein Ziel gibt.
    wurzel.append(el('p', 'ort__name disp', 'Ort folgt'));
    wurzel.append(el('p', 'text', ANFAHRT.address));
  } else {
    wurzel.append(el('p', 'ort__name disp', ANFAHRT.name));
    wurzel.append(el('p', 'text', ANFAHRT.address));
    if (ANFAHRT.mapsUrl) {
      const link = el('a', 'knopf knopf--lime', 'Route planen ↗');
      link.href = ANFAHRT.mapsUrl;
      link.target = '_blank';
      link.rel = 'noopener';
      wurzel.append(link);
    }
  }

  for (const hint of ANFAHRT.hints) {
    const zeile = el('li', 'hinweis');
    zeile.append(el('span', 'hinweis__titel mono', hint.titel));
    zeile.append(el('span', 'hinweis__text', hint.text));
    hinweise.append(zeile);
  }
}

// ---------- MITBRINGEN ----------

const PACK_KEY = 'woodbeat-checked';

export function renderMitbringen(liste, stand) {
  let gehakt;
  try {
    gehakt = new Set(JSON.parse(localStorage.getItem(PACK_KEY) ?? '[]'));
  } catch {
    gehakt = new Set();
  }

  function schreibStand() {
    try {
      localStorage.setItem(PACK_KEY, JSON.stringify([...gehakt]));
    } catch {
      /* privater Modus — Haken gelten dann nur für diese Sitzung */
    }
    const n = WUENSCHE.filter((w) => gehakt.has(w.item)).length;
    stand.textContent = n === WUENSCHE.length ? 'Alles gepackt' : `${n} / ${WUENSCHE.length} gepackt`;
    stand.toggleAttribute('data-voll', n === WUENSCHE.length);
  }

  for (const wunsch of WUENSCHE) {
    const zeile = el('li');
    const label = el('label', 'pack');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = gehakt.has(wunsch.item);
    box.addEventListener('change', () => {
      if (box.checked) gehakt.add(wunsch.item);
      else gehakt.delete(wunsch.item);
      schreibStand();
    });
    const haken = el('span', 'pack__haken');
    haken.setAttribute('aria-hidden', 'true');
    const text = el('span', 'pack__text');
    text.append(el('span', 'pack__item', wunsch.item));
    if (wunsch.note) text.append(el('span', 'pack__notiz', wunsch.note));
    label.append(box, haken, text);
    zeile.append(label);
    liste.append(zeile);
  }
  schreibStand();
}

// ---------- PLAYLIST ----------

export function renderPlaylist(wurzel) {
  const id = SPOTIFY.playlistUrl?.match(/playlist\/([A-Za-z0-9]+)/)?.[1];
  if (!id) {
    wurzel.append(leer('Playlist folgt'));
    return;
  }
  const kopf = el('div', 'playlist__kopf');
  kopf.append(el('h3', 'untertitel disp', 'Warm werden'));
  const link = el('a', 'knopf knopf--rand', 'In Spotify öffnen ↗');
  link.href = SPOTIFY.playlistUrl;
  link.target = '_blank';
  link.rel = 'noopener';
  kopf.append(link);
  wurzel.append(kopf);

  // Der Player lädt erst auf Klick: spart ~1 MB Spotify-Skripte für
  // alle, die nur das Datum nachschauen wollen.
  const platz = el('button', 'playlist__platz');
  platz.type = 'button';
  platz.append(el('span', 'playlist__play', '▶'), el('span', 'mono', 'Playlist hier abspielen'));
  platz.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = `https://open.spotify.com/embed/playlist/${id}?theme=0`;
    iframe.width = '100%';
    iframe.height = '352';
    iframe.allow = 'clipboard-write; encrypted-media; fullscreen; picture-in-picture';
    iframe.title = 'WoodBeat-Playlist bei Spotify';
    platz.replaceWith(iframe);
  });
  wurzel.append(platz);
}

// ---------- WALDKODEX & CREW ----------

const ROEMISCH = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

export function renderKodex(liste, crewListe) {
  KODEX.forEach((eintrag, i) => {
    const zeile = el('li', 'regel auf');
    zeile.append(el('span', 'regel__nr mono', ROEMISCH[i] ?? String(i + 1)));
    zeile.append(el('span', 'regel__titel disp', eintrag.regel));
    zeile.append(el('span', 'regel__text', eintrag.text));
    liste.append(zeile);
  });

  for (const person of CREW) {
    const zeile = el('li', 'crew__zeile');
    zeile.append(el('span', 'crew__rolle', person.rolle));
    const name = person.name.trim();
    zeile.append(name ? el('span', 'crew__name mono', name) : el('span', 'crew__offen mono', 'Hand heben'));
    crewListe.append(zeile);
  }
}

// ---------- FRAGEN ----------

export function renderFaq(wurzel) {
  for (const eintrag of FAQ) {
    const block = el('details', 'frage');
    const kopf = el('summary', 'frage__q');
    kopf.append(el('span', null, eintrag.q), el('span', 'frage__zeichen disp'));
    block.append(kopf, el('p', 'frage__a', eintrag.a));
    wurzel.append(block);
  }
}

// ---------- "Ticket sichern" → Formular vorauswählen ----------

export function ticketKnoepfeVerbinden(waehleTicket) {
  for (const link of document.querySelectorAll('[data-ticket]')) {
    if (link.tagName !== 'A') continue;
    link.addEventListener('click', () => waehleTicket(link.dataset.ticket));
  }
}
