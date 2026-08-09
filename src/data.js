// ============================================================
// WoodBeat — alle Inhalte der Seite an EINEM Ort.
// Texte/Zeiten hier ändern, speichern, fertig — kein HTML nötig.
//
// Zwei Regeln:
//   1. Keine Emoji in Feldern, die auf der Seite landen. Die Seite
//      ist ein gedrucktes Plakat; Emoji rendern in OS-Vollfarbe und
//      schlagen ein Loch in die Palette. Ausnahme: `ctaText` &
//      `shareText` — die gehen nach WhatsApp, nicht aufs Plakat.
//   2. Umfrage-Optionen haben einen `key`. Der `label` darf jederzeit
//      umformuliert werden, ohne dass Stimmen verrutschen. Vorher hing
//      die Stimme am Text — ein Tippfehler-Fix hat sie gelöscht.
// ============================================================

export const FESTIVAL = {
  // Steuert die Wortmarke im Kopf. Eine Zeile ändern = neues Jahr.
  jahr: 2027,
  // TBD — Termin steht noch nicht fest. Platzhalter: letztes volles
  // Juli-Wochenende 2027, analog zu 2026 (Fr–So).
  startISO: '2027-07-23T15:00',
  endISO: '2027-07-25T15:00',
  datumKurz: '23.–25. Juli 2027',
  datumLang: 'Freitag 23. bis Sonntag 25. Juli 2027',
  abPreis: '10 €',
  locationShort: 'Ort folgt',
  // Der Originaltext aus dem Banner-Artwork. Läuft in der Banderole.
  motto: 'Rave Culture · Love · Freedom · Friendship',
};

// Der Seitenschnitt steht in src/seiten.js — nicht hier, weil er
// eine Struktur-, keine Inhaltsentscheidung ist.

export const SPOTIFY = {
  // Playlist muss in Spotify auf "öffentlich" stehen, damit Gäste sie sehen.
  playlistUrl: 'https://open.spotify.com/playlist/3hbyWrakdcD9R2bQnFN1JI',
};

// ============================================================
// UMFRAGEN
// `multi: true` = Mehrfachauswahl. `key` ist der Speicherschlüssel
// und darf NIE geändert werden — `label` jederzeit.
// ============================================================

export const UMFRAGEN = [
  {
    id: 'sound',
    frage: 'Welcher Sound soll nachts laufen?',
    multi: false,
    options: [
      { key: 'techno', label: 'Techno — hart & treibend' },
      { key: 'melodic', label: 'Melodic Techno / House' },
      { key: 'dnb', label: 'Drum & Bass' },
      { key: 'goa', label: 'Goa / Psytrance' },
    ],
  },
  {
    id: 'features',
    frage: 'Was bauen wir 2027 Neues?',
    multi: true,
    options: [
      { key: 'silentdisco', label: 'Silent Disco' },
      { key: 'cocktailbar', label: 'Cocktailbar' },
      { key: 'chillarea', label: 'Chill-Area mit Hängematten' },
      { key: 'feuershow', label: 'Feuershow' },
      { key: 'pool', label: 'Planschbecken' },
      { key: 'visuals', label: 'Visuals & Lasershow' },
    ],
  },
  {
    id: 'essen',
    frage: 'Food-Special am Samstag?',
    multi: false,
    options: [
      { key: 'grill', label: 'Grill Deluxe' },
      { key: 'taco', label: 'Taco-Stand' },
      { key: 'pizza', label: 'Pizza aus dem Ofen' },
      { key: 'veggie', label: 'Veggie-Buffet' },
    ],
  },
];

export const UMFRAGEN_SHARE = 'So steht die Abstimmung für WoodBeat 2027 🌲';

// ============================================================
// LINE-UP — wer spielt. Leere Slots bleiben leer: die Seite
// stempelt "wird gedruckt" statt ein trauriges "TBD" zu zeigen.
// ============================================================

export const LINEUP = [
  { name: '', rolle: 'Opening', tag: 'Freitag', zeit: '20:00', genre: '' },
  { name: '', rolle: 'Nacht', tag: 'Freitag', zeit: '23:00', genre: '' },
  { name: '', rolle: 'Day-Rave', tag: 'Samstag', zeit: '16:00', genre: '' },
  { name: '', rolle: 'Main', tag: 'Samstag', zeit: '21:00', genre: '' },
  { name: '', rolle: 'Afterhour', tag: 'Samstag', zeit: '01:00', genre: '' },
];

export const LINEUP_HINWEIS =
  'Wer auflegen will: meld dich in der Gruppe. B2B-Slots sind ausdrücklich erwünscht.';

// ============================================================
// LAUFPLAN
// ============================================================

export const TIMETABLE = [
  {
    day: 'Freitag',
    kurz: 'Fr',
    slots: [
      { time: '15:00', title: 'Anreise & Zeltaufbau', note: 'Ankommen, Platz suchen, einrichten' },
      { time: '18:00', title: 'Grill an', note: 'Gemeinsames Abendessen' },
      { time: '20:00', title: 'Opening-Set', note: '' },
      { time: '23:00', title: 'Lagerfeuer & Chill-Beats', note: 'runterkommen, ankommen' },
    ],
  },
  {
    day: 'Samstag',
    kurz: 'Sa',
    slots: [
      { time: '10:00', title: 'Frühstück', note: 'Kaffee läuft ab 9:30' },
      { time: '14:00', title: 'Spiele & Turnier', note: 'Flunkyball, Wikingerschach' },
      { time: '16:00', title: 'Day-Rave im Wald', note: 'B2B-Sets, wer will legt auf' },
      { time: '19:00', title: 'Abendessen', note: '' },
      { time: '21:00', title: 'Main Acts', note: '' },
      { time: '01:00', title: 'Afterhour', note: 'leise Runde am Feuer' },
    ],
  },
  {
    day: 'Sonntag',
    kurz: 'So',
    slots: [
      { time: '10:00', title: 'Katerfrühstück', note: 'Alle helfen, alle essen' },
      { time: '12:00', title: 'Abbau & Aufräumen', note: 'Gelände so schön hinterlassen wie vorgefunden' },
      { time: '15:00', title: 'Abreise', note: 'Bis zum nächsten WoodBeat' },
    ],
  },
];

// ============================================================
// TICKETS & BAR
// ============================================================

export const TICKETS = [
  {
    // key ist der Speicherschlüssel für die Zusagen — nie ändern.
    key: 'weekend',
    name: 'Wochenendticket',
    preis: '25 €',
    einheit: 'einmalig · Fr–So',
    featured: true,
    badge: 'Empfohlen',
    ctaText: 'Ich bin dabei! 1× Wochenendticket (25 €) für WoodBeat 2027 🌲',
    includes: [
      'Camping direkt auf dem Gelände',
      'Nutzung des Kühlanhängers',
      'Eigene Getränke erlaubt',
      'Alle 3 Tage & 2 Nächte',
      'Grundversorgung Essen (Grill, Frühstück)',
    ],
  },
  {
    key: 'day',
    name: 'Tagesticket',
    preis: '10 €',
    einheit: 'pro Tag',
    featured: false,
    ctaText: 'Ich bin dabei! 1× Tagesticket (10 €) für WoodBeat 2027 🌲',
    includes: [
      'Ein Festivaltag deiner Wahl',
      'Getränke gibt es an der Bar',
      'Keine eigenen Getränke — dafür Bar-Preise, die keinem wehtun',
    ],
  },
];

export const TICKETS_HINWEIS =
  'Beitrag bitte vorab überweisen — Details kommen in der Gruppe. Wer knapp bei Kasse ist: melden, wir finden eine Lösung.';

export const BAR = [
  {
    kategorie: 'Cocktails',
    drinks: [
      { name: 'Cuba Libre', preis: '3 €' },
      { name: 'Aperol Spritz', preis: '3 €' },
      { name: 'Skinny Bitch', preis: '3 €' },
      { name: 'Gin Tonic', preis: '3 €' },
    ],
  },
  {
    kategorie: 'Bier',
    drinks: [{ name: 'Bier 0,33 l', preis: '2 €' }],
  },
  {
    kategorie: 'Softdrinks',
    drinks: [
      { name: 'Cola', preis: '2 €' },
      { name: 'Fanta', preis: '2 €' },
      { name: 'Sprite', preis: '2 €' },
      { name: 'Wasser', preis: '1 €' },
    ],
  },
];

// ============================================================
// WER KOMMT — öffentlich ist NUR die Zahl. Namen sieht der
// Organisator im Supabase-Dashboard, nicht die Seite.
// ============================================================

export const RSVP = {
  ziel: 60,
  hinweis:
    'Öffentlich steht hier nur die Zahl. Deinen Namen sieht niemand außer der Orga — und du kannst ihn jederzeit wieder löschen.',
};

// ============================================================
// RÜCKBLICK — Bilder kommen nach public/rueckblick/.
// Leer lassen ist erlaubt: die Sektion stempelt dann selbst.
// ============================================================

export const RUECKBLICK = {
  jahr: 2026,
  text: 'Drei Tage, zwei Nächte, ein Wald. Danke an alle, die mit aufgebaut, gekocht, aufgelegt und am Sonntag noch Müll gesammelt haben.',
  bilder: [],
};

// ============================================================
// ANFAHRT
// ============================================================

export const ANFAHRT = {
  name: 'TBD — Location folgt',
  address: 'Adresse wird noch bekannt gegeben',
  mapsUrl: '',
  hints: [
    { titel: 'Auto', text: 'Parken direkt am Gelände. Bildet Fahrgemeinschaften.' },
    { titel: 'Bahn', text: 'Sag rechtzeitig Bescheid, wir organisieren einen Shuttle vom Bahnhof.' },
    { titel: 'Zelt', text: 'Zelte werden auf dem Gelände aufgebaut. Anreise am besten ab Freitagnachmittag.' },
  ],
};

// ============================================================
// MITBRINGEN
// ============================================================

export const WUENSCHE = [
  { item: 'Zelt, Isomatte & Schlafsack', note: 'bringt jede:r selbst mit' },
  { item: 'Campingstuhl', note: 'Sitzplätze sind Gold wert' },
  { item: 'Kühlbox & Lieblingsgetränke', note: 'Grundversorgung ist da, Spezialwünsche selbst' },
  { item: 'Sonnencreme & Mückenspray', note: '' },
  { item: 'Taschenlampe / Stirnlampe', note: 'der Wald ist nachts dunkel' },
  { item: 'Spiele', note: 'Karten, Wikingerschach, was ihr habt' },
  { item: 'Müllbeutel', note: 'Leave no trace' },
  { item: 'Musikwünsche', note: 'ab in die Playlist' },
];

// ============================================================
// WALD-KODEX & CREW
// ============================================================

export const KODEX = [
  { regel: 'Leave no trace', text: 'Das Gelände sieht am Sonntag besser aus als am Freitag. Ohne Ausnahme.' },
  { regel: 'Respekt', text: 'Niemand wird angefasst, angemacht oder ausgelacht. Wer das nicht kann, fährt heim.' },
  { regel: 'Nachbarn', text: 'Ab 1 Uhr fährt der Bass runter. Wir wollen nächstes Jahr wiederkommen.' },
  { regel: 'Feuer', text: 'Nur in der Feuerschale, nie unbeaufsichtigt, Wasser steht daneben.' },
  { regel: 'Passt aufeinander auf', text: 'Wer zu viel hat, wird begleitet — nicht ausgelacht.' },
];

export const CREW = [
  { rolle: 'Orga & Gelände', name: '' },
  { rolle: 'Sound & Technik', name: '' },
  { rolle: 'Küche & Grill', name: '' },
  { rolle: 'Bar', name: '' },
  { rolle: 'Aufbau & Abbau', name: '' },
];

// ============================================================
// KLEINGEDRUCKTES
// ============================================================

export const FAQ = [
  {
    q: 'Kann ich jemanden mitbringen?',
    a: 'Grundsätzlich ja, aber bitte vorher kurz abklären — wir planen Essen und Platz pro Kopf.',
  },
  {
    q: 'Gibt es Strom und Duschen?',
    a: 'Strom fürs Nötigste ja. Duschen: sobald die Location fix ist, steht es hier.',
  },
  {
    q: 'Was passiert bei Regen?',
    a: 'Wir bauen überdachte Bereiche auf. Das Festival findet statt. Gummistiefel einpacken.',
  },
  {
    q: 'Sind Hunde erlaubt?',
    a: 'Bitte vorher fragen. Laute Musik und viele Menschen sind nicht für jeden Hund entspannt.',
  },
  {
    q: 'Ab wann kann ich anreisen?',
    a: 'Freitag ab 15:00. Früher nur nach Absprache — die Aufbau-Crew darf immer.',
  },
  {
    q: 'Wie werden die Umfragen ausgezählt?',
    a: 'Jedes Gerät hat eine Stimme pro Frage. Die Zahlen auf dieser Seite sind die echten Stimmen aller Gäste, nicht nur deine. Wer seine Meinung ändert, tippt einfach die andere Antwort an — die alte Stimme wird ersetzt, nicht addiert.',
  },
];
