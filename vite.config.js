import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false, // Lo hacemos manual en index.html
      manifest: false, // Usamos public/manifest.json
      devOptions: {
        enabled: true
      }
    })
  ],
});
