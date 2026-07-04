// WoodBeat 2026 — füllt die Sektionen in index.html mit den Daten aus data.js.
// Inhalte ändern? → src/data.js. Aussehen ändern? → src/style.css.

import './style.css';
import { FESTIVAL, ANFAHRT, TIMETABLE, WUENSCHE, KOSTEN, FAQ, UMFRAGEN, MARQUEE, SPOTIFY } from './data.js';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Hero ----------

// Kinetische Typografie: Titel in einzelne Buchstaben zerlegen —
// sie fallen gestaffelt ein und reagieren einzeln auf Hover.
const heroTitle = document.querySelector('.hero__title');
heroTitle.setAttribute('aria-label', heroTitle.textContent.trim());
let letterIndex = 0;
function wrapLetters(el) {
  [...el.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      [...node.textContent].forEach((ch) => {
        if (ch.trim() === '') {
          frag.append(ch);
          return;
        }
        const span = document.createElement('span');
        span.className = 'ltr';
        span.style.setProperty('--i', letterIndex++);
        span.textContent = ch;
        span.setAttribute('aria-hidden', 'true');
        frag.append(span);
      });
      node.replaceWith(frag);
    } else {
      wrapLetters(node);
    }
  });
}
wrapLetters(heroTitle);

// Laufband: Einträge doppelt einfüllen → nahtlose Endlosschleife
const marqueeTrack = document.querySelector('#marquee-track');
[...MARQUEE, ...MARQUEE].forEach((eintrag) => {
  const item = document.createElement('span');
  item.textContent = eintrag;
  const star = document.createElement('span');
  star.className = 'marquee__star';
  star.textContent = '✦';
  marqueeTrack.append(item, star);
});

document.querySelector('#hero-claim').textContent = FESTIVAL.claim;
document.querySelector('#hero-date').textContent = `📅 ${FESTIVAL.date}`;
document.querySelector('#hero-location').textContent = `📍 ${FESTIVAL.locationShort}`;

// Countdown — erscheint automatisch, sobald FESTIVAL.dateISO gesetzt ist
if (FESTIVAL.dateISO) {
  const target = new Date(FESTIVAL.dateISO);
  const countdown = document.querySelector('#hero-countdown');
  countdown.hidden = false;

  function tick() {
    const restMin = Math.floor((target - Date.now()) / 60000);
    if (restMin <= 0) {
      countdown.textContent = '🎉 Es ist so weit!';
      return;
    }
    const tage = Math.floor(restMin / 1440);
    const std = Math.floor(restMin / 60) % 24;
    const min = restMin % 60;
    countdown.textContent = `⏳ Noch ${tage} T · ${std} Std · ${min} Min`;
    setTimeout(tick, 30_000);
  }
  tick();
}

// ---------- Timetable: Tag-Chips + Slots ----------

const dayChips = document.querySelector('#day-chips');
const slotList = document.querySelector('#slot-list');
let activeDay = 0;

function renderDayChips() {
  dayChips.innerHTML = '';
  TIMETABLE.forEach((day, i) => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.textContent = day.day;
    chip.setAttribute('role', 'tab');
    chip.setAttribute('aria-selected', String(i === activeDay));
    chip.addEventListener('click', () => {
      activeDay = i;
      renderDayChips();
      renderSlots();
    });
    dayChips.appendChild(chip);
  });
}

function renderSlots() {
  slotList.innerHTML = '';
  TIMETABLE[activeDay].slots.forEach((slot) => {
    const li = document.createElement('li');

    const time = document.createElement('span');
    time.className = 'time';
    time.textContent = slot.time;

    const title = document.createElement('span');
    title.className = 'title';
    title.textContent = slot.title;

    li.append(time, title);

    if (slot.note) {
      const note = document.createElement('span');
      note.className = 'note';
      note.textContent = slot.note;
      li.append(note);
    }
    slotList.appendChild(li);
  });
}

renderDayChips();
renderSlots();

// ---------- Anfahrt ----------

document.querySelector('#anfahrt-name').textContent = ANFAHRT.name;
document.querySelector('#anfahrt-address').textContent = ANFAHRT.address;
document.querySelector('#anfahrt-maps').href = ANFAHRT.mapsUrl;

const hintsList = document.querySelector('#anfahrt-hints');
ANFAHRT.hints.forEach((hint) => {
  const li = document.createElement('li');
  li.textContent = hint;
  hintsList.appendChild(li);
});

// ---------- Wünsche & Mitbringliste (Häkchen in localStorage) ----------

const STORAGE_KEY = 'woodbeat-checked';
const checked = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'));
const checklist = document.querySelector('#checklist');

WUENSCHE.forEach((wunsch) => {
  const li = document.createElement('li');
  const label = document.createElement('label');

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = checked.has(wunsch.item);
  box.addEventListener('change', () => {
    if (box.checked) checked.add(wunsch.item);
    else checked.delete(wunsch.item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...checked]));
    updateProgress();
  });

  const item = document.createElement('span');
  item.className = 'item';
  item.textContent = wunsch.item;

  label.append(box, item);

  if (wunsch.note) {
    const note = document.createElement('span');
    note.className = 'note';
    note.textContent = `— ${wunsch.note}`;
    label.append(note);
  }

  li.appendChild(label);
  checklist.appendChild(li);
});

// Packfortschritt + Konfetti, wenn alles abgehakt ist
const progressLabel = document.querySelector('#checklist-progress');
let confettiGefeiert = false;

function updateProgress() {
  const anzahl = checked.size;
  const gesamt = WUENSCHE.length;
  if (anzahl === gesamt) {
    progressLabel.textContent = `🎒 ${anzahl}/${gesamt} — alles gepackt, du bist festival-ready! 🎉`;
    if (!confettiGefeiert) {
      confettiGefeiert = true;
      confetti();
    }
  } else {
    progressLabel.textContent = `🎒 ${anzahl}/${gesamt} gepackt`;
    confettiGefeiert = false;
  }
}

function confetti() {
  if (reducedMotion) return;
  const emojis = ['🎉', '🌲', '🎶', '✨', '🍻', '🔥'];
  for (let i = 0; i < 36; i++) {
    const teil = document.createElement('span');
    teil.className = 'confetti';
    teil.textContent = emojis[i % emojis.length];
    teil.style.left = `${Math.random() * 100}vw`;
    document.body.append(teil);
    teil
      .animate(
        [
          { transform: 'translateY(-10vh) rotate(0deg)', opacity: 1 },
          { transform: `translateY(110vh) rotate(${Math.random() * 720 - 360}deg)`, opacity: 0.8 },
        ],
        { duration: 2200 + Math.random() * 1800, easing: 'ease-in', fill: 'forwards' },
      )
      .finished.then(() => teil.remove());
  }
}

updateProgress();

// ---------- Abstimmen: Umfragen (Auswahl in localStorage, Teilen per WhatsApp) ----------

const VOTES_KEY = 'woodbeat-votes';
const votes = JSON.parse(localStorage.getItem(VOTES_KEY) ?? '{}');
const pollsRoot = document.querySelector('#umfragen-list');

function saveVotes() {
  localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
}

function renderPolls() {
  pollsRoot.innerHTML = '';
  UMFRAGEN.forEach((poll) => {
    const card = document.createElement('div');
    card.className = 'card poll';

    const frage = document.createElement('h3');
    frage.textContent = poll.frage;

    const hint = document.createElement('p');
    hint.className = 'muted';
    hint.textContent = poll.multi ? 'Mehrfachauswahl möglich' : 'Eine Antwort';

    const chips = document.createElement('div');
    chips.className = 'chips';

    poll.options.forEach((option) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.textContent = option;
      const selected = (votes[poll.id] ?? []).includes(option);
      chip.setAttribute('aria-pressed', String(selected));
      chip.addEventListener('click', () => {
        if (poll.multi) {
          const current = new Set(votes[poll.id] ?? []);
          if (current.has(option)) current.delete(option);
          else current.add(option);
          votes[poll.id] = [...current];
        } else {
          votes[poll.id] = selected ? [] : [option]; // nochmal klicken = abwählen
        }
        saveVotes();
        renderPolls();
      });
      chips.appendChild(chip);
    });

    card.append(frage, hint, chips);
    pollsRoot.appendChild(card);
  });
}

renderPolls();

// Eigene Idee (Freitext, bleibt ebenfalls auf dem Gerät)
const IDEA_KEY = 'woodbeat-idea';
const ideaField = document.querySelector('#eigene-idee');
ideaField.value = localStorage.getItem(IDEA_KEY) ?? '';
ideaField.addEventListener('input', () => localStorage.setItem(IDEA_KEY, ideaField.value));

// Stimmen teilen: Web-Share-API (Handy) oder WhatsApp-Link (Desktop)
document.querySelector('#share-votes').addEventListener('click', async () => {
  const lines = ['🗳️ Meine WoodBeat-Stimmen:'];
  UMFRAGEN.forEach((poll) => {
    const auswahl = votes[poll.id];
    if (auswahl?.length) lines.push(`• ${poll.frage} → ${auswahl.join(', ')}`);
  });
  if (ideaField.value.trim()) lines.push(`💡 Idee: ${ideaField.value.trim()}`);
  if (lines.length === 1) lines.push('(noch nichts ausgewählt 😅)');

  const text = lines.join('\n');
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return;
    } catch {
      // abgebrochen → nichts tun
      return;
    }
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
});

// ---------- Playlist: Spotify-Embed ----------

const embedRoot = document.querySelector('#spotify-embed');
const playlistId = SPOTIFY.playlistUrl?.match(/playlist\/([A-Za-z0-9]+)/)?.[1];

if (playlistId) {
  const iframe = document.createElement('iframe');
  iframe.src = `https://open.spotify.com/embed/playlist/${playlistId}?theme=0`;
  iframe.width = '100%';
  iframe.height = '420';
  iframe.loading = 'lazy';
  iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
  iframe.title = 'WoodBeat Spotify-Playlist';
  embedRoot.appendChild(iframe);
} else {
  const platzhalter = document.createElement('div');
  platzhalter.className = 'card';
  platzhalter.textContent = '🎧 Playlist folgt — Link kommt in src/data.js rein.';
  embedRoot.appendChild(platzhalter);
}

// ---------- Cursor-Glow (nur Desktop-Maus, nicht bei reduzierter Bewegung) ----------

if (matchMedia('(pointer: fine)').matches && !reducedMotion) {
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.append(glow);
  addEventListener(
    'pointermove',
    (e) => {
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    },
    { passive: true },
  );
}

// ---------- Kosten ----------

document.querySelector('#kosten-beitrag').textContent = KOSTEN.beitrag;
document.querySelector('#kosten-hinweis').textContent = KOSTEN.hinweis;

const includesList = document.querySelector('#kosten-includes');
KOSTEN.includes.forEach((punkt) => {
  const li = document.createElement('li');
  li.textContent = punkt;
  includesList.appendChild(li);
});

// ---------- FAQ ----------

const faqList = document.querySelector('#faq-list');
FAQ.forEach((eintrag) => {
  const details = document.createElement('details');
  const summary = document.createElement('summary');
  summary.textContent = eintrag.q;
  const p = document.createElement('p');
  p.textContent = eintrag.a;
  details.append(summary, p);
  faqList.appendChild(details);
});
