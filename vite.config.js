import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

const seite = (pfad) => fileURLToPath(new URL(pfad, import.meta.url));

// Auf GitHub Pages liegt die Seite unter /woodbeat/ — lokal weiter unter /.
// (GITHUB_ACTIONS ist nur im Deploy-Workflow gesetzt.)
//
// Mehrseitig: jede Seite ist ein echtes HTML-Dokument mit eigener URL,
// eigenem Titel und eigener Link-Vorschau. Kein Router, kein JS nötig,
// damit eine Seite überhaupt erscheint — und man kann "guck mal das
// Programm" verschicken, statt "scroll mal weit runter".
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/woodbeat/' : '/',
  build: {
    rollupOptions: {
      input: {
        start: seite('index.html'),
        programm: seite('programm/index.html'),
        tickets: seite('tickets/index.html'),
        abstimmen: seite('abstimmen/index.html'),
        praktisches: seite('praktisches/index.html'),
      },
    },
  },
});
