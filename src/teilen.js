// ============================================================
// Teilen — Web-Share auf dem Handy, WhatsApp-Link auf dem Desktop.
// Genau EIN Emoji ist in diesen Texten erlaubt: sie landen in einem
// Chat, nicht auf dem Plakat.
// ============================================================

export async function teilen(text) {
  if (navigator.share) {
    try {
      await navigator.share({ text });
    } catch {
      /* abgebrochen — nichts tun */
    }
    return;
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
}
