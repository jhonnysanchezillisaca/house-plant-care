export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  nitro: {
    preset: 'node-server'
  },
  tailwindcss: {
    cssPath: '~/assets/main.css',
    configPath: 'tailwind.config.ts'
  }
})