// ============================================================
// Teilen — Web-Share auf dem Handy, WhatsApp-Link auf dem Desktop.
//
// Die URL MUSS mit: 80 % der Gäste kommen über einen Link aus der
// WhatsApp-Gruppe. Eine Nachricht ohne Link ist eine Sackgasse und
// bricht genau die Schleife, von der diese Seite lebt.
//
// Genau EIN Emoji ist in diesen Texten erlaubt: sie landen in einem
// Chat, nicht auf dem Plakat.
// ============================================================

export async function teilen(text, url = location.href) {
  if (navigator.share) {
    try {
      await navigator.share({ text, url });
    } catch {
      /* abgebrochen — nichts tun */
    }
    return;
  }
  // wa.me kennt kein eigenes URL-Feld — die Adresse gehört in den Text.
  const nachricht = `${text}\n\n${url}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(nachricht)}`, '_blank', 'noopener');
}
