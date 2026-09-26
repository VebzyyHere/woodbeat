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

export function initAudio(knopf, label) {
  if (!knopf) return;

  knopf.addEventListener('click', async () => {
    if (laeuft) {
      aus();
      knopf.setAttribute('aria-pressed', 'false');
      if (label) label.textContent = 'Ton';
      return;
    }
    try {
      await an();
      knopf.setAttribute('aria-pressed', 'true');
      if (label) label.textContent = 'Ton aus';
    } catch {
      // Kein Audio möglich (alte Browser, blockierter Context) —
      // der Knopf verschwindet lieber, als kaputt dazustehen.
      knopf.hidden = true;
    }
  });

  // Im Hintergrund-Tab läuft nichts weiter.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && laeuft) ctx?.suspend();
    else if (!document.hidden && laeuft) ctx?.resume();
  });
}
