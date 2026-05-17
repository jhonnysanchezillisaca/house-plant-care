import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  devtools: { enabled: true },
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/'
  },
  router: {
    options: {
      hashMode: true
    }
  },
  vite: {
    plugins: [tailwindcss()]
  },
  css: ['~/app/assets/main.css'],
  nitro: {
    preset: 'node-server',
    externals: process.env.NODE_ENV === 'production' 
      ? { external: ['better-sqlite3'] }
      : {},
    cache: false
  },
  routeRules: {
    '/**': {
      cache: false,
      swr: false,
      static: false
    }
  },
  experimental: {
    manifest: false
  },
  runtimeConfig: {
    trefleApiToken: process.env.TREFLE_API_TOKEN
  }
})