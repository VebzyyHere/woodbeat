import { defineConfig } from 'vite';

// Auf GitHub Pages liegt die Seite unter /woodbeat/ — lokal weiter unter /.
// (GITHUB_ACTIONS ist nur im Deploy-Workflow gesetzt.)
//
// Eine Seite. Die alten Unterseiten (/programm/, /tickets/, …) sind
// Weiterleitungs-Stubs in public/ und springen zum passenden Anker.
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/woodbeat/' : '/',
});
