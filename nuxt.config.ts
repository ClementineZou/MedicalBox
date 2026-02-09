// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@vite-pwa/nuxt',
    'nuxt-gtag'
  ],

  gtag: {
    id: process.env.GOOGLE_ANALYTICS_ID || '',
    loadingStrategy: 'async',
    config: {
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure'
    }
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'MedicalBox - 家庭药箱管理系统',
      short_name: 'MedicalBox',
      description: '让用药更安全，让健康更可控',
      theme_color: '#1976d2',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      lang: 'zh-CN',
      icons: [
        {
          src: '/icon.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
          purpose: 'any'
        },
        {
          src: '/icon.svg',
          sizes: '192x192',
          type: 'image/svg+xml',
          purpose: 'any'
        },
        {
          src: '/icon.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
          purpose: 'maskable'
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff,woff2}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'gstatic-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          urlPattern: /\/api\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 5 // 5 minutes
            },
            networkTimeoutSeconds: 10,
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }
      ]
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600 // Check for updates every hour
    },
    devOptions: {
      enabled: true,
      type: 'module'
    }
  },

  css: ['~/assets/css/main.css'],

  typescript: {
    strict: true,
    typeCheck: true
  },

  app: {
    head: {
      title: 'MedicalBox - 家庭药箱管理系统',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '让用药更安全，让健康更可控' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined' }
      ]
    }
  },

  runtimeConfig: {
    // Private keys (server-only)
    databaseUrl: process.env.DATABASE_URL,
    betterAuthSecret: process.env.BETTER_AUTH_SECRET,
    betterAuthUrl: process.env.BETTER_AUTH_URL,
    turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY,

    // Public keys (exposed to client)
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
      turnstileSiteKey: process.env.TURNSTILE_SITE_KEY,
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID
    },

    // ICD API Keys
    icdClientId: process.env.ICD_CLIENT_ID,
    icdClientSecret: process.env.ICD_CLIENT_SECRET
  }
})
