import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    base: '/Bestiee/',   // GitHub Pages base path
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'pwa-64x64.png', 'pwa-192x192.png', 'pwa-512x512.png'],
            workbox: {
                maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB limit
                // Cache app shell (JS, CSS, HTML) for offline
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                runtimeCaching: [
                    {
                        // Cache Google Fonts
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: { cacheName: 'gstatic-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
                    },
                ],
            },
            manifest: {
                name: 'Bestiee - Your AI Best Friend',
                short_name: 'Bestiee',
                description: 'An emotionally intelligent AI best friend who is always there for you.',
                theme_color: '#fef6fb',
                background_color: '#fef6fb',
                display: 'standalone',
                scope: '/Bestiee/',
                start_url: '/Bestiee/',
                orientation: 'portrait',
                icons: [
                    { src: 'pwa-64x64.png',   sizes: '64x64',   type: 'image/png' },
                    { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
                    { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
                    { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
                ],
            },
        }),
    ],
})
