// ============================================================
// Die Sektionen des Bogens.
//
// Je eine reine render*(…)-Funktion, kein gemeinsamer Zustand.
// Inhalte kommen ausschließlich aus data.js.
//
// Grundsatz überall: leere Daten erzeugen einen ENTWORFENEN
// Leerzustand (gestempelte Fläche), nie ein trauriges "TBD" und
// nie einen toten Knopf.
// ============================================================

import {
  ANFAHRT, BAR, CREW, FAQ, KODEX, LINEUP, LINEUP_HINWEIS,
  RUECKBLICK, SPOTIFY, TICKETS, TICKETS_HINWEIS, TIMETABLE, WUENSCHE,
} from './data.js';
import { phase } from './countdown.js';
import { teilen } from './teilen.js';
import { uebergang } from './register.js';

const el = (tag, klasse, text) => {
  const k = document.createElement(tag);
  if (klasse) k.className = klasse;
  if (text != null) k.textContent = text;
  return k;
};

/** Gestempelte Fläche — der Leerzustand der Seite. */
const stempel = (text) => el('p', 'stempel', text);

// ---------- 02 LINE-UP ----------

export function renderLineup(liste, hinweis) {
  // Die Slots stehen immer — auch ohne Namen. "Freitag 20:00 Opening"
  // sagt mehr als ein Sammelstempel, und die Lücke macht neugierig.
  for (const act of LINEUP) {
    const zeile = el('li', 'act');
    zeile.append(el('p', 'act__slot daten', `${act.tag} · ${act.zeit} · ${act.rolle}`));
    zeile.append(
      act.name.trim()
        ? el('p', 'act__name', act.name)
        : el('p', 'act__name act__name--offen', 'wird gedruckt'),
    );
    if (act.genre) zeile.append(el('p', 'act__genre marginal', act.genre));
    liste.append(zeile);
  }
  hinweis.textContent = LINEUP_HINWEIS;
}

// ---------- 03 LAUFPLAN ----------

/**
 * Der JETZT-Marker läuft nur während des Festivals. Slots nach
 * Mitternacht (z. B. 01:00 Afterhour) gehören kalendarisch schon
 * zum Folgetag — die werden bewusst dem Vorabend zugeschlagen,
 * so wie es auf einem Festival auch gelesen wird.
 */
function laufenderSlot(tagIndex) {
  if (phase() !== 'live') return -1;
  const jetzt = new Date();
  const slots = TIMETABLE[tagIndex].slots;
  const minuten = jetzt.getHours() * 60 + jetzt.getMinutes();
  let treffer = -1;
  slots.forEach((slot, i) => {
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
    const knopf = el('button', 'reiter__tag daten', tag.kurz);
    knopf.type = 'button';
    knopf.setAttribute('role', 'tab');
    knopf.setAttribute('aria-controls', 'lauf-liste');
    knopf.title = tag.day;
    knopf.addEventListener('click', () => {
      if (aktiv === i) return;
      aktiv = i;
      uebergang(() => { markiereReiter(); zeichneSlots(); });
    });
    reiterWurzel.append(knopf);
    return knopf;
  });

  function markiereReiter() {
    knoepfe.forEach((knopf, i) => knopf.setAttribute('aria-selected', String(i === aktiv)));
  }

  function zeichneSlots() {
    listeWurzel.replaceChildren();
    const jetztIndex = laufenderSlot(aktiv);

    TIMETABLE[aktiv].slots.forEach((slot, i) => {
      const zeile = el('li', 'lauf__zeile');
      if (i === jetztIndex) zeile.setAttribute('data-jetzt', '');

      zeile.append(el('span', 'lauf__zeit daten', slot.time));

      const text = el('div', 'lauf__text');
      text.append(el('p', 'lauf__titel', slot.title));
      if (slot.note) text.append(el('p', 'lauf__notiz marginal', slot.note));
      if (i === jetztIndex) text.append(el('p', 'lauf__jetzt daten', 'Jetzt'));
      zeile.append(text);

      listeWurzel.append(zeile);
    });
  }

  markiereReiter();
  zeichneSlots();
}

// ---------- 04 TICKETS & BAR ----------

export function renderTickets(wurzel, hinweis) {
  for (const ticket of TICKETS) {
    const karte = el('article', 'pressung' + (ticket.featured ? ' pressung--haupt' : ''));

    if (ticket.badge) karte.append(el('p', 'pressung__marke daten', ticket.badge));
    // h3, nicht h4: darüber steht die h2 "Preise". Ein Sprung h2 -> h4
    // lässt Screenreader eine Ebene vermissen.
    karte.append(el('h3', 'pressung__name daten', ticket.name));
    karte.append(el('p', 'pressung__preis', ticket.preis));
    karte.append(el('p', 'pressung__einheit daten', ticket.einheit));

    const liste = el('ul', 'pressung__inhalt');
    for (const punkt of ticket.includes) liste.append(el('li', null, punkt));
    karte.append(liste);

    if (ticket.ctaText) {
      const knopf = el('button', 'taste taste--voll pressung__taste', 'Ticket sichern');
      knopf.type = 'button';
      knopf.addEventListener('click', () => teilen(ticket.ctaText));
      karte.append(knopf);
    }
    wurzel.append(karte);
  }
  hinweis.textContent = TICKETS_HINWEIS;
}

export function renderBar(wurzel) {
  for (const gruppe of BAR) {
    const block = el('div', 'bar__gruppe');
    block.append(el('h4', 'bar__kategorie daten', gruppe.kategorie));

    const liste = el('ul', 'bar__liste');
    for (const drink of gruppe.drinks) {
      const zeile = el('li', 'bar__zeile');
      zeile.append(el('span', 'bar__name', drink.name));
      // Punktleader — die Zeile einer gedruckten Preisliste
      zeile.append(el('span', 'bar__punkte'));
      zeile.append(el('span', 'bar__preis daten', drink.preis));
      liste.append(zeile);
    }
    block.append(liste);
    wurzel.append(block);
  }
}

// ---------- 06 RÜCKBLICK ----------

export function renderRueckblick(titel, text, bilder) {
  titel.textContent = `Rückblick ${RUECKBLICK.jahr}`;
  text.textContent = RUECKBLICK.text;

  if (!RUECKBLICK.bilder.length) {
    bilder.append(stempel('Bilder folgen — schickt eure besten in die Gruppe'));
    return;
  }

  const strecke = el('ul', 'strecke');
  RUECKBLICK.bilder.forEach((bild, i) => {
    const kachel = el('li', 'strecke__kachel');
    const img = document.createElement('img');
    img.src = bild.src;
    img.alt = bild.alt ?? '';
    img.loading = 'lazy';
    img.decoding = 'async';
    // Erstes Bild groß — eine Fotostrecke ohne Hierarchie ist ein Raster
    if (i === 0) kachel.classList.add('strecke__kachel--gross');
    kachel.append(img);
    strecke.append(kachel);
  });
  bilder.append(strecke);
}

// ---------- 07 LAGEPLAN ----------

export function renderLageplan(wurzel, hinweise) {
  const offen = !ANFAHRT.name || ANFAHRT.name.startsWith('TBD');

  if (offen) {
    // Kein Routen-Knopf, solange es kein Ziel gibt — ein toter Knopf
    // ist schlimmer als gar keiner.
    wurzel.append(stempel('Ort steht noch nicht fest'));
    wurzel.append(el('p', 'sektion__intro', ANFAHRT.address));
  } else {
    const block = el('div', 'ort');
    block.append(el('p', 'ort__label daten', 'Gelände'));
    block.append(el('p', 'ort__name', ANFAHRT.name));
    block.append(el('p', 'ort__adresse daten', ANFAHRT.address));
    if (ANFAHRT.mapsUrl) {
      const link = el('a', 'taste', 'Route planen');
      link.href = ANFAHRT.mapsUrl;
      link.target = '_blank';
      link.rel = 'noopener';
      block.append(link);
    }
    wurzel.append(block);
  }

  ANFAHRT.hints.forEach((hint, i) => {
    const zeile = el('li', 'fussnote');
    zeile.append(el('span', 'fussnote__nr daten', `◆ ${String(i + 1).padStart(2, '0')}`));
    const text = el('div');
    text.append(el('p', 'fussnote__titel daten', hint.titel));
    text.append(el('p', 'fussnote__text', hint.text));
    zeile.append(text);
    hinweise.append(zeile);
  });
}

// ---------- 08 MITBRINGEN ----------

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
    stand.textContent =
      n === WUENSCHE.length
        ? `${n} von ${WUENSCHE.length} — alles gepackt`
        : `${n} von ${WUENSCHE.length} gepackt`;
    stand.toggleAttribute('data-voll', n === WUENSCHE.length);
  }

  for (const wunsch of WUENSCHE) {
    const zeile = el('li', 'pack__zeile');
    const label = el('label', 'pack__wahl');

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = gehakt.has(wunsch.item);
    box.addEventListener('change', () => {
      if (box.checked) gehakt.add(wunsch.item);
      else gehakt.delete(wunsch.item);
      schreibStand();
    });

    const kasten = el('span', 'pack__kasten');
    kasten.setAttribute('aria-hidden', 'true');

    const text = el('span', 'pack__text');
    text.append(el('span', 'pack__item', wunsch.item));
    if (wunsch.note) text.append(el('span', 'pack__notiz marginal', wunsch.note));

    label.append(box, kasten, text);
    zeile.append(label);
    liste.append(zeile);
  }

  schreibStand();
}

// ---------- 09 PLAYLIST ----------

export function renderPlaylist(wurzel) {
  const id = SPOTIFY.playlistUrl?.match(/playlist\/([A-Za-z0-9]+)/)?.[1];
  if (!id) {
    wurzel.append(stempel('Playlist folgt'));
    return;
  }
  wurzel.append(el('p', 'etikett__label daten', 'Spotify · WoodBeat'));
  const rahmen = el('div', 'etikett__rahmen');
  const iframe = document.createElement('iframe');
  iframe.src = `https://open.spotify.com/embed/playlist/${id}?theme=0`;
  iframe.width = '100%';
  iframe.height = '352';
  iframe.loading = 'lazy';
  iframe.allow = 'clipboard-write; encrypted-media; fullscreen; picture-in-picture';
  iframe.title = 'WoodBeat-Playlist bei Spotify';
  rahmen.append(iframe);
  wurzel.append(rahmen);
}

// ---------- 10 WALDKODEX & CREW ----------

export function renderKodex(liste, crewListe) {
  KODEX.forEach((eintrag, i) => {
    const zeile = el('li', 'regel');
    zeile.append(el('span', 'regel__nr daten', String(i + 1).padStart(2, '0')));
    const text = el('div');
    text.append(el('p', 'regel__titel daten', eintrag.regel));
    text.append(el('p', 'regel__text', eintrag.text));
    zeile.append(text);
    liste.append(zeile);
  });

  for (const person of CREW) {
    const zeile = el('li', 'crew__zeile');
    zeile.append(el('span', 'crew__rolle daten', person.rolle));
    zeile.append(el('span', 'bar__punkte'));
    zeile.append(
      person.name.trim()
        ? el('span', 'crew__name daten', person.name)
        : el('span', 'crew__name crew__name--offen daten', 'offen'),
    );
    crewListe.append(zeile);
  }
}

// ---------- 11 KLEINGEDRUCKTES ----------

export function renderFaq(wurzel) {
  for (const eintrag of FAQ) {
    const block = document.createElement('details');
    block.className = 'faq';
    const kopf = document.createElement('summary');
    kopf.className = 'faq__frage daten';
    kopf.textContent = eintrag.q;
    const text = el('p', 'faq__text', eintrag.a);
    block.append(kopf, text);
    wurzel.append(block);
  }
}
