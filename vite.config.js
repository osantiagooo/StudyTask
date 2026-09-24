import { defineConfig } from 'vite';

export default defineConfig({
  base: '/StudyTask/',
  build: {
    outDir: 'dist', // Pasta onde os arquivos minificados serão salvos
    minify: true,   // Habilita a minificação automática de JS, HTML e CSS
  },
});