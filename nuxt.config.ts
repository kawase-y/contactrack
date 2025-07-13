// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  
  modules: [
    '@vite-pwa/nuxt'
  ],

  // GitHub Pages用の設定
  app: {
    baseURL: process.env.NODE_ENV === 'production' ? '/contactrack/' : '/'
  },

  nitro: {
    prerender: {
      routes: ['/']
    }
  },
  
  pwa: {
    registerType: 'autoUpdate',
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}']
    },
    client: {
      installPrompt: true
    },
    manifest: {
      name: 'ContacTrack',
      short_name: 'ContacTrack',
      description: '人脈管理アプリ',
      theme_color: '#ffffff',
      icons: [
        {
          src: 'icon-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'icon-512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    }
  },
  
  css: ['~/assets/css/main.css'],
  
  runtimeConfig: {
    public: {
      googleApiKey: process.env.GOOGLE_API_KEY,
      googleClientId: process.env.GOOGLE_CLIENT_ID
    }
  },
  
  head: {
    script: [
      {
        src: 'https://accounts.google.com/gsi/client',
        defer: true
      }
    ]
  },
  
  ssr: false
})
