// ============================================================
// Datenzugang für Umfragen und Zusagen.
//
// Grundregel: NICHTS hier wirft je eine Exception. Bei Netzwerk-
// fehler, pausiertem Projekt oder fehlender Konfiguration kommt
// `null` zurück und die Oberfläche zeigt den lokalen Stand.
// Der Unterschied zwischen "geht gerade nicht" und "ist kaputt"
// ist reine Präsentation.
// ============================================================

import { SUPABASE } from './config-live.js';

const VOTER_KEY = 'woodbeat-voter';
const WAHL_KEY = 'woodbeat-wahl';
const OUTBOX_KEY = 'woodbeat-outbox';
const RSVP_KEY = 'woodbeat-rsvp';

/** Läuft die Auszählung über den Server oder nur lokal? */
export const liveEnabled = () => Boolean(SUPABASE.url && SUPABASE.key);

function lies(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '') ?? fallback;
  } catch {
    return fallback;
  }
}

function schreib(key, wert) {
  try {
    localStorage.setItem(key, JSON.stringify(wert));
  } catch {
    /* privater Modus o.ä. — die Seite funktioniert trotzdem */
  }
}

/**
 * Anonyme Geräte-Kennung. Ersetzt einen Login: sie ist der einzige
 * Schlüssel zu den eigenen Stimmen. Wer den Browserspeicher leert,
 * kann erneut abstimmen — für einen Freundeskreis ausreichend.
 */
export function getVoterId() {
  let id = null;
  try {
    id = localStorage.getItem(VOTER_KEY);
  } catch {
    /* ignorieren */
  }
  if (!id) {
    id = crypto.randomUUID();
    try {
      localStorage.setItem(VOTER_KEY, id);
    } catch {
      /* ignorieren */
    }
  }
  return id;
}

/** Die eigene Auswahl: { [pollId]: [optionKey, …] } */
export const eigeneWahl = () => lies(WAHL_KEY, {});

function merkeWahl(pollId, keys) {
  const alle = eigeneWahl();
  if (keys.length) alle[pollId] = keys;
  else delete alle[pollId];
  schreib(WAHL_KEY, alle);
}

async function rpc(fn, body) {
  if (!liveEnabled()) return null;
  try {
    const res = await fetch(`${SUPABASE.url}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE.key,
        Authorization: `Bearer ${SUPABASE.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body ?? {}),
    });
    if (!res.ok) return null;
    const text = await res.text();
    return text ? JSON.parse(text) : true;
  } catch {
    return null;
  }
}

/**
 * Auszählung ohne Server: nur die eigene Stimme zählt.
 * Ehrlich statt erfunden — die Oberfläche sagt das auch dazu.
 */
function lokaleAuszaehlung() {
  const wahl = eigeneWahl();
  const ergebnis = {};
  for (const [pollId, keys] of Object.entries(wahl)) {
    const counts = {};
    for (const key of keys) counts[key] = 1;
    ergebnis[pollId] = { counts, voters: keys.length ? 1 : 0 };
  }
  return ergebnis;
}

/**
 * Aggregierte Ergebnisse aller Umfragen.
 * @returns {Promise<{[pollId: string]: {counts: object, voters: number}}>}
 */
export async function fetchResults() {
  const zeilen = await rpc('poll_results');
  if (!zeilen || !Array.isArray(zeilen)) return { ...lokaleAuszaehlung(), _lokal: true };

  const ergebnis = {};
  for (const z of zeilen) {
    const topf = (ergebnis[z.poll_id] ??= { counts: {}, voters: 0 });
    topf.counts[z.option_key] = Number(z.votes) || 0;
    topf.voters = Number(z.voters) || 0;
  }
  return ergebnis;
}

/**
 * Stimme abgeben. Ersetzt die bisherige Auswahl dieses Geräts für
 * diese Umfrage — es entsteht nie eine Zusatzstimme.
 * @returns {Promise<boolean>} true = beim Server angekommen
 */
export async function castVote(pollId, keys) {
  merkeWahl(pollId, keys);
  if (!liveEnabled()) return false;

  const ok = await rpc('cast_vote', {
    p_poll: pollId,
    p_voter: getVoterId(),
    p_options: keys,
  });

  if (ok === null) {
    // Nicht durchgekommen: in die Outbox, geht beim nächsten
    // Seitenaufruf oder sobald wieder Netz da ist automatisch raus.
    const box = lies(OUTBOX_KEY, {});
    box[pollId] = keys;
    schreib(OUTBOX_KEY, box);
    return false;
  }

  const box = lies(OUTBOX_KEY, {});
  if (pollId in box) {
    delete box[pollId];
    schreib(OUTBOX_KEY, box);
  }
  return true;
}

export const outboxOffen = () => Object.keys(lies(OUTBOX_KEY, {})).length > 0;

/** Liegengebliebene Stimmen nachsenden. @returns {Promise<boolean>} etwas gesendet? */
export async function flushOutbox() {
  const box = lies(OUTBOX_KEY, {});
  const offen = Object.entries(box);
  if (!offen.length || !liveEnabled()) return false;

  let gesendet = false;
  for (const [pollId, keys] of offen) {
    const ok = await rpc('cast_vote', { p_poll: pollId, p_voter: getVoterId(), p_options: keys });
    if (ok !== null) {
      delete box[pollId];
      gesendet = true;
    }
  }
  schreib(OUTBOX_KEY, box);
  return gesendet;
}

/** Anteil an den Abstimmenden — die Basis ist immer `voters`. */
export function toPercent(anzahl, voters) {
  if (!voters) return 0;
  return Math.round((anzahl / voters) * 100);
}

// ============================================================
// ZUSAGEN
//
// Öffentlich ist ausschließlich die ZAHL. Namen liegen in der
// Datenbank und sind nur über das Supabase-Dashboard einsehbar —
// die Seite fragt sie nie ab. Deshalb gibt es hier bewusst kein
// `rsvp_list()`, sondern nur `rsvp_count()` und `my_rsvp()`.
// ============================================================

/** Die eigene Zusage — liegt zusätzlich lokal, damit das Formular gefüllt ist. */
export const eigeneZusage = () => lies(RSVP_KEY, null);

/**
 * Zusage speichern.
 * @returns {Promise<boolean>} true = beim Server angekommen
 */
export async function saveRsvp({ name, ticket, notiz }) {
  schreib(RSVP_KEY, { name, ticket, notiz });
  if (!liveEnabled()) return false;
  const ok = await rpc('upsert_rsvp', {
    p_voter: getVoterId(),
    p_name: name,
    p_ticket: ticket,
    p_note: notiz || null,
  });
  return ok !== null;
}

/** Eigene Zusage zurückziehen. */
export async function deleteRsvp() {
  try {
    localStorage.removeItem(RSVP_KEY);
  } catch {
    /* ignorieren */
  }
  if (!liveEnabled()) return false;
  return (await rpc('delete_rsvp', { p_voter: getVoterId() })) !== null;
}

/**
 * Wie viele sind dabei — aufgeschlüsselt nach Ticketart.
 * Ohne Server zählt nur die eigene Zusage.
 * @returns {Promise<{gesamt: number, nach: object, lokal: boolean}>}
 */
export async function fetchRsvpCount() {
  const zeilen = await rpc('rsvp_count');
  if (!zeilen || !Array.isArray(zeilen)) {
    const eigene = eigeneZusage();
    return {
      gesamt: eigene ? 1 : 0,
      nach: eigene ? { [eigene.ticket]: 1 } : {},
      lokal: true,
    };
  }
  const nach = {};
  let gesamt = 0;
  for (const z of zeilen) {
    const n = Number(z.anzahl) || 0;
    nach[z.ticket] = n;
    gesamt += n;
  }
  return { gesamt, nach, lokal: false };
}
