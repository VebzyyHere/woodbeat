// ============================================================
// Live-Auszählung der Umfragen (Supabase).
//
// Beide Werte stehen im Supabase-Dashboard:
//   url = Project Settings → Data API → Project URL
//   key = Project Settings → API Keys → der Wert mit "sb_publishable_"
//
// Der publishable Key DARF öffentlich im Repo stehen. Die Sicherheit
// steckt in den RLS-Regeln der Datenbank, nicht in diesem String.
// NIEMALS den "secret key" (sb_secret_…) hier eintragen.
//
// Beide Felder leer = die Umfragen laufen rein lokal weiter.
// Die Seite funktioniert in beiden Fällen vollständig.
// ============================================================

export const SUPABASE = {
  url: 'https://fvuseciopsycvdvabxbp.supabase.co',
  key: 'sb_publishable_hDRoNhbchhzuyA5QylcZow_pliTUl66',
};
