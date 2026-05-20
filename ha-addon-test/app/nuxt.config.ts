export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/'
  },
  nitro: {
    preset: 'node-server'
  }
})