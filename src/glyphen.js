// ============================================================
// DAS EMBLEM
//
// Aus dem Banner-Artwork als Vektor nachgezogen: Baum mit Wurzeln,
// darüber der Jahresring-Fächer, quer durch den Stamm die Waveform.
// Wald und Rave stehen im selben Zeichen — das ist der Kern der Marke.
//
// Liegt hier statt in jeder HTML-Datei, weil es sonst auf fünf Seiten
// dupliziert wäre. Es ist rein dekorativ (aria-hidden), darf also auf
// JavaScript warten. Die Wortmarke im Kopf wartet NICHT — die steht
// hartkodiert im HTML, weil sie das LCP-Element ist.
// ============================================================

const SPRITE = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
  <symbol id="emblem" viewBox="0 0 88 88">
    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="44" cy="44" r="42.2" stroke-width="1.1" opacity=".45" />
      <circle cx="44" cy="44" r="38.6" stroke-width="2.6" />
      <g stroke-width="1.5" opacity=".9">
        <path d="M37.4 45.6A7 7 0 0 1 50.6 45.6" />
        <path d="M32.7 43.9A12 12 0 0 1 55.3 43.9" />
        <path d="M28 42.2A17 17 0 0 1 60 42.2" />
        <path d="M23.3 40.5A22 22 0 0 1 64.7 40.5" />
        <path d="M18.6 38.8A27 27 0 0 1 69.4 38.8" />
        <path d="M13.9 37.1A32 32 0 0 1 74.1 37.1" />
      </g>
      <g stroke-width="2">
        <path d="M44 21v45" />
        <path d="M44 28.5l-5.5-4.5M44 28.5l5.5-4.5" />
        <path d="M44 36l-7.5-5.5M44 36l7.5-5.5" />
        <path d="M44 60l-9.5 8.5M44 60l9.5 8.5" />
        <path d="M44 64.5l-14.5 6M44 64.5l14.5 6" />
        <path d="M34.5 68.5l-3.5 4.5M53.5 68.5l3.5 4.5" />
      </g>
      <g stroke-width="1.9">
        <path d="M7 50h16l2-7 2 13 2-18 2 22 2-12 2 8 2-10 2 4h3" />
        <path d="M46 50h3l2-5 2 11 2-16 2 20 2-11 2 7 2-9 2 3h16" />
      </g>
    </g>
  </symbol>

  <symbol id="emblem-klein" viewBox="0 0 88 88">
    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="44" cy="44" r="38" stroke-width="5" />
      <path d="M22 38a22 22 0 0 1 44 0" stroke-width="4" opacity=".7" />
      <path d="M44 22v44" stroke-width="5" />
      <path d="M44 60l-11 10M44 60l11 10" stroke-width="4.5" />
      <path d="M12 47h9l3-9 3 18 3-13 3 4h6" stroke-width="4.5" />
      <path d="M46 47h6l3-4 3 13 3-18 3 9h9" stroke-width="4.5" />
    </g>
  </symbol>
</svg>`;

export function emblemeEinsetzen() {
  document.body.insertAdjacentHTML('beforeend', SPRITE);
}
