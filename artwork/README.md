# Artwork-Quellen

Diese Dateien liegen bewusst **nicht** in `public/` — alles dort wird beim
Build nach `dist/` kopiert und mit deployt, auch wenn die Seite es nie lädt.

- `banner.jpg` — das offizielle Banner-Artwork. Quelle für die Hero-Textur.
  Neu erzeugen (einmalig `npm i --no-save sharp`):

  ```
  node -e "require('sharp')('artwork/banner.jpg').resize(1200).modulate({saturation:0.8}).webp({quality:42}).toFile('public/banner-textur.webp')"
  ```

- `woodbeat-cover.png` — quadratisches Cover (1000×1000) für die
  Spotify-Playlist. Wird von Hand in Spotify hochgeladen.

Das Link-Vorschaubild `public/og-image.png` wird dagegen ausgeliefert und
gehört deshalb dorthin.
