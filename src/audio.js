// ============================================================
// DER TON
//
// Es wird KEINE Audiodatei geladen. Der Loop wird im Browser
// synthetisiert (Web Audio API) — 0 KB statt 200–500 KB, und der
// Takt ist exakt derselbe, der in style.css als --bpm steht.
//
// Läuft der Ton, gibt der Audio-Takt den Registerschlag vor
// statt der CSS-Uhr: das Plakat vibriert dann hörbar im Rhythmus.
//
// Startet ausschließlich auf Klick. Kein Autoplay, keine
// Wiederaufnahme beim nächsten Besuch — wer den Link aus einer
// WhatsApp-Gruppe öffnet, soll nie überrascht Musik hören.
// ============================================================

import { cssPulsAktiv, puls, reducedMotion } from './register.js';

const BPM = 150;
const BEAT = 60 / BPM;
const VORLAUF = 0.12;   // Sekunden, die im Voraus geplant werden
const TAKT = 25;        // Millisekunden zwischen zwei Planungsläufen

let ctx = null;
let master = null;
let laeuft = false;
let naechsterSchlag = 0;
let schlagNr = 0;
let planer = 0;
let rauschen = null;

function rauschPuffer(context) {
  const laenge = context.sampleRate * 2;
  const puffer = context.createBuffer(1, laenge, context.sampleRate);
  const daten = puffer.getChannelData(0);
  for (let i = 0; i < laenge; i++) daten[i] = Math.random() * 2 - 1;
  return puffer;
}

function kick(t) {
  const osc = ctx.createOscillator();
  const hue = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(132, t);
  osc.frequency.exponentialRampToValueAtTime(44, t + 0.07);
  hue.gain.setValueAtTime(0.0001, t);
  hue.gain.exponentialRampToValueAtTime(0.9, t + 0.005);
  hue.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
  osc.connect(hue).connect(master);
  osc.start(t);
  osc.stop(t + 0.32);
}

function hat(t, offen) {
  const quelle = ctx.createBufferSource();
  quelle.buffer = rauschen;
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 8200;
  const hue = ctx.createGain();
  const dauer = offen ? 0.13 : 0.035;
  hue.gain.setValueAtTime(offen ? 0.09 : 0.13, t);
  hue.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
  quelle.connect(filter).connect(hue).connect(master);
  quelle.start(t);
  quelle.stop(t + dauer + 0.02);
}

function bass(t) {
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const hue = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.value = 55;
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(420, t);
  filter.frequency.exponentialRampToValueAtTime(140, t + 0.2);
  hue.gain.setValueAtTime(0.0001, t);
  hue.gain.exponentialRampToValueAtTime(0.22, t + 0.01);
  hue.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  osc.connect(filter).connect(hue).connect(master);
  osc.start(t);
  osc.stop(t + 0.24);
}

/** Sehr leiser gefilterter Rauschteppich — der Wald unter der Maschine. */
function wind() {
  const quelle = ctx.createBufferSource();
  quelle.buffer = rauschen;
  quelle.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 620;
  filter.Q.value = 0.6;
  const hue = ctx.createGain();
  hue.gain.value = 0.035;
  quelle.connect(filter).connect(hue).connect(master);
  quelle.start();
  return quelle;
}

function planeSchlag(nr, t) {
  const imTakt = nr % 8;
  kick(t);
  hat(t + BEAT / 2, imTakt === 7);
  if (imTakt % 2 === 1) bass(t + BEAT / 2);

  // Alle 8 Schläge springt der Druck aus dem Register —
  // dieselbe Bewegung wie im CSS, nur jetzt auf der Audio-Uhr.
  if (imTakt === 0 && !reducedMotion) {
    const inMs = Math.max(0, (t - ctx.currentTime) * 1000);
    setTimeout(() => laeuft && puls(6, 110), inMs);
  }
}

function plane() {
  while (naechsterSchlag < ctx.currentTime + VORLAUF) {
    planeSchlag(schlagNr, naechsterSchlag);
    naechsterSchlag += BEAT;
    schlagNr++;
  }
}

async function an() {
  ctx ??= new (window.AudioContext || window.webkitAudioContext)();
  await ctx.resume();

  if (!master) {
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    rauschen = rauschPuffer(ctx);
  }

  laeuft = true;
  schlagNr = 0;
  naechsterSchlag = ctx.currentTime + 0.08;
  rauschen && (window.__wbWind ??= wind());
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
  master.gain.linearRampToValueAtTime(0.24, ctx.currentTime + 1.2);

  clearInterval(planer);
  planer = setInterval(plane, TAKT);
  cssPulsAktiv(false);
}

function aus() {
  laeuft = false;
  clearInterval(planer);
  if (master && ctx) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
  }
  cssPulsAktiv(true);
}

// ============================================================
// HINTERGRUND-SONG (SoundCloud)
//
// Steht in data.js ein SoundCloud-Link, spielt der Ton-Knopf diesen
// Song statt des Synth-Loops. Der Player ist ein unsichtbares
// SoundCloud-iframe, gesteuert über deren Widget-API. Er wird erst
// beim ersten Klick geladen — vorher kostet er 0 Byte.
// Kommt er nicht in Gang (blockiert, offline, iOS-Eigenheiten),
// springt der Synth-Loop ein, damit der Knopf nie tot ist.
// ============================================================

let widget = null;
let widgetLaden = null;
let songLaeuft = false;

function ladeWidget(url) {
  widgetLaden ??= new Promise((fertig, fehler) => {
    const zeitlimit = setTimeout(() => fehler(new Error('SoundCloud antwortet nicht')), 10_000);
    const skript = document.createElement('script');
    skript.src = 'https://w.soundcloud.com/player/api.js';
    skript.onerror = () => fehler(new Error('SoundCloud nicht erreichbar'));
    skript.onload = () => {
      const rahmen = document.createElement('iframe');
      rahmen.className = 'hintergrund-player';
      rahmen.title = 'Hintergrund-Song';
      rahmen.allow = 'autoplay';
      rahmen.tabIndex = -1;
      rahmen.setAttribute('aria-hidden', 'true');
      rahmen.src = 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(url)
        + '&auto_play=false&visual=false&show_artwork=false&buying=false&sharing=false';
      document.body.append(rahmen);
      const w = window.SC.Widget(rahmen);
      w.bind(window.SC.Widget.Events.READY, () => {
        clearTimeout(zeitlimit);
        // Endlosschleife: am Ende zurück an den Anfang
        w.bind(window.SC.Widget.Events.FINISH, () => { w.seekTo(0); w.play(); });
        fertig(w);
      });
    };
    document.head.append(skript);
  });
  return widgetLaden;
}

/** Song starten; true, sobald SoundCloud wirklich spielt. */
async function songAn(url) {
  widget ??= await ladeWidget(url);
  widget.setVolume(70);
  return new Promise((ergebnis) => {
    const warte = setTimeout(() => ergebnis(false), 4000);
    widget.bind(window.SC.Widget.Events.PLAY, () => { clearTimeout(warte); ergebnis(true); });
    widget.play();
  });
}

export function initAudio(knopf, label, songUrl) {
  if (!knopf) return;
  let modus = null; // 'song' | 'synth' | null

  const zeige = (an) => {
    knopf.setAttribute('aria-pressed', String(an));
    if (label) label.textContent = an ? 'Ton aus' : 'Ton';
  };

  knopf.addEventListener('click', async () => {
    if (modus === 'song') {
      widget.pause();
      songLaeuft = false;
      modus = null;
      zeige(false);
      return;
    }
    if (modus === 'synth') {
      aus();
      modus = null;
      zeige(false);
      return;
    }

    zeige(true);
    if (songUrl) {
      try {
        if (await songAn(songUrl)) {
          songLaeuft = true;
          modus = 'song';
          return;
        }
        widget?.pause();
      } catch {
        /* weiter mit dem Synth-Loop */
      }
    }
    try {
      await an();
      modus = 'synth';
    } catch {
      // Kein Audio möglich — der Knopf verschwindet lieber, als kaputt dazustehen.
      knopf.hidden = true;
    }
  });

  // Im Hintergrund-Tab läuft nichts weiter.
  document.addEventListener('visibilitychange', () => {
    if (modus === 'synth') {
      if (document.hidden) ctx?.suspend();
      else ctx?.resume();
    }
    if (modus === 'song' && widget) {
      if (document.hidden) widget.pause();
      else if (songLaeuft) widget.play();
    }
  });
}
