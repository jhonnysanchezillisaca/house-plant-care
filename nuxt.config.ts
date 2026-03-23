export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
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
  },
  tailwindcss: {
    cssPath: '~/assets/main.css',
    configPath: 'tailwind.config.ts'
  }
})