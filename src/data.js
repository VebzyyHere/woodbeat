// ============================================================
// WoodBeat 2026 — alle Inhalte der Seite an EINEM Ort.
// Texte/Zeiten hier ändern, speichern, fertig — kein HTML nötig.
// Alles mit "TBD" ist ein Platzhalter und wartet auf echte Infos.
// ============================================================

export const FESTIVAL = {
  claim: 'Ein Wochenende. Freunde, Beats, Wald — unser eigenes kleines Festival.',
  date: '24.–26. Juli 2026',
  // Startzeitpunkt — steuert den Live-Countdown im Hero.
  dateISO: '2026-07-24T15:00',
  locationShort: 'Ort folgt',
};

// Laufband unter dem Hero — Einträge beliebig ändern/ergänzen.
export const MARQUEE = [
  'WoodBeat 2026',
  '24.–26. Juli',
  '3 Tage · 2 Nächte · 1 Wald',
  'Freunde · Beats · Lagerfeuer',
  'Bring deine Crew',
];

export const SPOTIFY = {
  // Offizielle WoodBeat-Playlist (04.07.2026 per Claude auf dem Spotify-Account
  // angelegt). Andere Playlist einbetten = einfach diesen Link austauschen.
  // Wichtig: Damit alle Gäste sie sehen, in Spotify auf "öffentlich" stellen.
  playlistUrl: 'https://open.spotify.com/playlist/3hbyWrakdcD9R2bQnFN1JI',
};

export const ANFAHRT = {
  name: 'TBD — Location folgt',
  address: 'Adresse wird noch bekannt gegeben',
  mapsUrl: 'https://www.google.com/maps',
  hints: [
    '🚗 Auto: Parken direkt am Gelände (Details folgen). Bildet Fahrgemeinschaften!',
    '🚆 Bahn & Abholung: Sag rechtzeitig Bescheid, wir organisieren einen Shuttle vom Bahnhof.',
    '⛺ Zelte werden direkt auf dem Gelände aufgebaut — Anreise am besten ab Freitagnachmittag.',
  ],
};

export const TIMETABLE = [
  {
    day: 'Freitag',
    slots: [
      { time: '15:00', title: 'Anreise & Zeltaufbau', note: 'Ankommen, Platz suchen, einrichten' },
      { time: '18:00', title: 'Grill an 🔥', note: 'Gemeinsames Abendessen' },
      { time: '20:00', title: 'Opening DJ-Set 🎛️', note: 'Act TBD' },
      { time: '23:00', title: 'Lagerfeuer & Chill-Beats', note: 'runterkommen, ankommen' },
    ],
  },
  {
    day: 'Samstag',
    slots: [
      { time: '10:00', title: 'Frühstück', note: 'Kaffee läuft ab 9:30' },
      { time: '14:00', title: 'Spiele & Turnier', note: 'Flunkyball? Wikingerschach? TBD' },
      { time: '16:00', title: 'Day-Rave im Wald 🌲', note: 'B2B-Sets, wer will legt auf' },
      { time: '19:00', title: 'Abendessen', note: '' },
      { time: '21:00', title: 'Main Acts 🎶', note: 'Line-up TBD' },
      { time: '01:00', title: 'Afterhour', note: 'leise Runde am Feuer' },
    ],
  },
  {
    day: 'Sonntag',
    slots: [
      { time: '10:00', title: 'Katerfrühstück', note: 'Alle helfen, alle essen' },
      { time: '12:00', title: 'Abbau & Aufräumen', note: 'Gelände so schön hinterlassen wie vorgefunden' },
      { time: '15:00', title: 'Abreise', note: 'Bis zum nächsten WoodBeat! 💚' },
    ],
  },
];

export const WUENSCHE = [
  { item: 'Zelt, Isomatte & Schlafsack', note: 'bringt jede:r selbst mit' },
  { item: 'Campingstuhl', note: 'Sitzplätze sind Gold wert' },
  { item: 'Kühlbox & Lieblingsgetränke', note: 'Grundversorgung ist da, Spezialwünsche selbst' },
  { item: 'Sonnencreme & Mückenspray', note: '' },
  { item: 'Taschenlampe / Stirnlampe', note: 'der Wald ist nachts dunkel' },
  { item: 'Spiele', note: 'Karten, Wikingerschach, was ihr habt' },
  { item: 'Müllbeutel', note: 'Leave no trace 🌲' },
  { item: 'Musikwünsche', note: 'ab in die Gruppen-Playlist (Link folgt)' },
];

// Umfragen: Frage + Antwort-Optionen. `multi: true` = Mehrfachauswahl.
// Neue Umfrage = neuer Eintrag hier, sonst nichts.
// (Achtung: Wer schon abgestimmt hat, verliert seine Auswahl für eine
// Option, wenn deren Text geändert wird — Stimmen hängen am Options-Text.)
export const UMFRAGEN = [
  {
    id: 'sound',
    frage: 'Welcher Sound soll nachts laufen?',
    multi: false,
    options: ['Techno — hart & treibend 🔨', 'Melodic Techno / House 🌅', 'Drum & Bass ⚡', 'Goa / Psytrance 🍄'],
  },
  {
    id: 'features',
    frage: 'Was bauen wir 2026 Neues?',
    multi: true,
    options: ['Silent Disco 🎧', 'Cocktailbar 🍹', 'Chill-Area mit Hängematten 🌙', 'Feuershow 🔥', 'Planschbecken 💦', 'Visuals & Lasershow 🌈'],
  },
  {
    id: 'essen',
    frage: 'Food-Special am Samstag?',
    multi: false,
    options: ['Grill Deluxe 🍖', 'Taco-Stand 🌮', 'Pizza aus dem Ofen 🍕', 'Veggie-Buffet 🥗'],
  },
];

export const KOSTEN = {
  beitrag: 'TBD € pro Person',
  includes: [
    'Gelände & Infrastruktur (Strom, Wasser, Klo)',
    'Grundversorgung Essen (Grill, Frühstück)',
    'Getränke-Grundstock',
    'Technik & Licht',
  ],
  hinweis: 'Beitrag bitte vorab überweisen — Details kommen in der Gruppe. Wer knapp bei Kasse ist: melden, wir finden eine Lösung.',
};

export const FAQ = [
  {
    q: 'Kann ich jemanden mitbringen (+1)?',
    a: 'Grundsätzlich ja, aber bitte vorher kurz abklären — wir planen Essen und Platz pro Kopf.',
  },
  {
    q: 'Gibt es Strom und Duschen?',
    a: 'Strom fürs Nötigste ja. Duschen: TBD — Infos folgen, sobald die Location fix ist.',
  },
  {
    q: 'Was passiert bei Regen?',
    a: 'Wir bauen überdachte Bereiche auf. Festival findet statt — Gummistiefel einpacken.',
  },
  {
    q: 'Sind Hunde erlaubt?',
    a: 'Bitte vorher fragen. Laute Musik + viele Menschen sind nicht für jeden Hund entspannt.',
  },
  {
    q: 'Ab wann kann ich anreisen?',
    a: 'Freitag ab 15:00. Früher nur nach Absprache (Aufbau-Crew darf immer 💪).',
  },
];
