// ============================================================
// WER KOMMT
//
// Öffentlich steht hier ausschließlich die ZAHL. Namen gehen in die
// Datenbank und sind nur über das Supabase-Dashboard einsehbar —
// die Seite fragt die Liste nie ab. Das war eine bewusste
// Entscheidung des Organisators gegen den sozialen Effekt einer
// sichtbaren Gästeliste.
// ============================================================

import { RSVP, TICKETS } from './data.js';
import { deleteRsvp, eigeneZusage, fetchRsvpCount, liveEnabled, saveRsvp } from './live.js';
import { puls } from './register.js';

let stand = { gesamt: 0, nach: {}, lokal: !liveEnabled() };
let geladen = false;

const ticketName = (key) => TICKETS.find((t) => t.key === key)?.name ?? key;

function zeichneZaehler(zaehlerEl, aufteilungEl) {
  if (!geladen) {
    zaehlerEl.textContent = 'Zusagen werden geholt';
    aufteilungEl.textContent = '';
    return;
  }

  const n = stand.gesamt;
  if (!n) {
    zaehlerEl.textContent = 'Noch niemand — mach den Anfang';
  } else {
    zaehlerEl.textContent = `${n} ${n === 1 ? 'ist' : 'sind'} dabei`;
  }
  zaehlerEl.toggleAttribute('data-voll', n >= RSVP.ziel);

  const teile = Object.entries(stand.nach)
    .filter(([, anzahl]) => anzahl > 0)
    .map(([key, anzahl]) => `${anzahl}× ${ticketName(key)}`);

  if (stand.lokal) {
    aufteilungEl.textContent =
      'Gezählt wird bisher nur auf diesem Gerät — die gemeinsame Zählung kommt, sobald die Datenbank steht.';
  } else {
    aufteilungEl.textContent = teile.length
      ? `${teile.join(' · ')} · Platz für ${RSVP.ziel}`
      : `Platz für ${RSVP.ziel}`;
  }
}

/**
 * Einmal bauen, danach nur noch den Zustand umschalten — sonst
 * verliert die Tastatur beim Klick den Fokus auf das Element.
 * Gibt eine Funktion zurück, die die Auswahl setzt.
 */
function baueTicketwahl(wurzel) {
  const knoepfe = TICKETS.map((ticket) => {
    const knopf = document.createElement('button');
    knopf.type = 'button';
    knopf.className = 'reiter__knopf';
    knopf.dataset.ticket = ticket.key;
    knopf.textContent = `${ticket.name} · ${ticket.preis}`;
    knopf.addEventListener('click', () => waehle(ticket.key));
    wurzel.append(knopf);
    return knopf;
  });

  function waehle(key) {
    for (const knopf of knoepfe) {
      knopf.setAttribute('aria-pressed', String(knopf.dataset.ticket === key));
    }
  }
  return waehle;
}

const gewaehltesTicket = (wurzel) =>
  wurzel.querySelector('[aria-pressed="true"]')?.dataset.ticket ?? null;

export function initRsvp({ form, zaehler, aufteilung, ticketWahl, name, notiz, senden, loeschen, status }) {
  if (!form) return () => {};

  const meine = eigeneZusage();
  const waehleTicket = baueTicketwahl(ticketWahl);
  waehleTicket(meine?.ticket ?? TICKETS[0].key);

  if (meine) {
    name.value = meine.name;
    notiz.value = meine.notiz ?? '';
    senden.textContent = 'Eintrag ändern';
    loeschen.hidden = false;
    status.textContent = 'Du stehst auf der Liste.';
  }

  zeichneZaehler(zaehler, aufteilung);

  async function hole() {
    stand = await fetchRsvpCount();
    geladen = true;
    zeichneZaehler(zaehler, aufteilung);
  }

  // Ohne Server kostet das nichts — sofort holen.
  if (!liveEnabled()) hole();
  else {
    new IntersectionObserver((eintraege, beobachter) => {
      if (!eintraege[0].isIntersecting) return;
      beobachter.disconnect();
      hole();
    }, { threshold: 0.05 }).observe(form);
  }

  form.addEventListener('submit', async (ereignis) => {
    ereignis.preventDefault();

    const gewaehlt = name.value.trim();
    if (gewaehlt.length < 2) {
      // Die Meldung muss AM FELD hängen, nicht nur am Formularende:
      // sonst springt der Fokus nach oben und die Erklärung bleibt
      // auf einem 390-px-Schirm außerhalb des Bildes.
      status.textContent = 'Bitte trag einen Namen ein — Vorname reicht.';
      name.setAttribute('aria-invalid', 'true');
      name.setAttribute('aria-describedby', status.id);
      name.focus();
      return;
    }
    name.removeAttribute('aria-invalid');
    name.removeAttribute('aria-describedby');
    const ticket = gewaehltesTicket(ticketWahl);
    if (!ticket) {
      status.textContent = 'Bitte wähl aus, was du nimmst.';
      return;
    }

    senden.disabled = true;
    status.textContent = 'Wird eingetragen …';
    puls(9, 140);
    if (navigator.userActivation?.isActive) navigator.vibrate?.(12);

    const angekommen = await saveRsvp({ name: gewaehlt, ticket, notiz: notiz.value.trim() });
    senden.disabled = false;
    senden.textContent = 'Eintrag ändern';
    loeschen.hidden = false;

    if (angekommen) {
      status.textContent = 'Eingetragen. Bis dann.';
    } else if (liveEnabled()) {
      status.textContent =
        'Gerade nicht erreichbar — dein Eintrag ist gespeichert. Schick ihn zur Sicherheit kurz in die Gruppe.';
    } else {
      status.textContent = 'Eingetragen — bisher nur auf diesem Gerät.';
    }
    hole();
  });

  loeschen.addEventListener('click', async () => {
    await deleteRsvp();
    form.reset();
    waehleTicket(TICKETS[0].key);
    senden.textContent = 'Ich bin dabei';
    loeschen.hidden = true;
    status.textContent = 'Eintrag gelöscht.';
    hole();
  });

  return waehleTicket;
}
