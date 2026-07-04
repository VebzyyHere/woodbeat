import { defineConfig } from 'vite';

// Auf GitHub Pages liegt die Seite unter /woodbeat/ — lokal weiter unter /.
// (GITHUB_ACTIONS ist nur im Deploy-Workflow gesetzt.)
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/woodbeat/' : '/',
});
