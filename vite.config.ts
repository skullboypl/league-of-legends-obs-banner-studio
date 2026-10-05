import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Identyfikator builda: porównywany z /version.json, aby wykryć nową wersję.
const buildId = Date.now().toString(36);

export default defineConfig(({ command }) => ({
  define: { __BUILD_ID__: JSON.stringify(command === 'build' ? buildId : 'dev') },

  plugins: [
    react(),
    {
      name: 'emit-version',
      generateBundle() {
        this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ id: buildId }) });
      },
    },
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:8787',
      '/riot.txt': 'http://localhost:8787',
      '/docs': 'http://localhost:8787',
      '/sitemap.xml': 'http://localhost:8787',
      '/robots.txt': 'http://localhost:8787',
      '/llms.txt': 'http://localhost:8787',
      '/llms-full.txt': 'http://localhost:8787',
    },
  },
}));
