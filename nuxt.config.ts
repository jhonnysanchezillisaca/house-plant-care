export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  nitro: {
    preset: 'node-server',
    externals: {
      external: ['better-sqlite3']
    }
  },
  routeRules: {
    '/**': { cache: { maxAge: 0 } }
  },
  tailwindcss: {
    cssPath: '~/assets/main.css',
    configPath: 'tailwind.config.ts'
  }
})