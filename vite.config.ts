import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/10k-forge-pwa/',
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'icons/*.svg'],
      manifest: {
        id: '/10k-forge-pwa/?source=pwa',
        name: '10K Forge - Race Prep Coach',
        short_name: '10K Forge',
        description: 'Offline 10K training coach with guided HIIT, run logs, dashboards, and local progress tracking.',
        start_url: '/10k-forge-pwa/?source=pwa',
        scope: '/10k-forge-pwa/',
        display: 'standalone',
        display_override: ['standalone'],
        background_color: '#07080d',
        theme_color: '#07080d',
        orientation: 'portrait',
        categories: ['health', 'fitness', 'sports'],
        icons: [
          { src: '/icons/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ],
        shortcuts: [
          { name: 'Start Today', short_name: 'Start', url: '/?tab=start', icons: [{ src: '/icons/pwa-192x192.png', sizes: '192x192' }] },
          { name: 'Dashboard', short_name: 'Stats', url: '/?tab=dashboard', icons: [{ src: '/icons/pwa-192x192.png', sizes: '192x192' }] }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,mp4}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-webfonts' }
          }
        ]
      }
    })
  ]
});
