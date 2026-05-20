const HA_ADDON = process.env.HA_ADDON === 'true'

export default defineNitroPlugin((nitroApp) => {
  if (!HA_ADDON) return

  const baseUrl = (process.env.NUXT_APP_BASE_URL || '').replace(/\/$/, '')
  if (!baseUrl) return

  nitroApp.hooks.hook('request', (event) => {
    const path = event.path
    if (!path.startsWith(baseUrl)) {
      event.path = baseUrl + path
    }
  })
})