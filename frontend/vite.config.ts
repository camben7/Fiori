import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages publica el sitio bajo /<nombre-del-repositorio>/.
// En local y en previews se mantiene la ruta raíz.
const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const base = process.env.GITHUB_ACTIONS && repositoryName ? `/${repositoryName}/` : '/';

export default defineConfig({
  plugins: [react()],
  base,
  server: { port: 5173 },
});
