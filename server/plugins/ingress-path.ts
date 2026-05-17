const INGRESS_PATH = (process.env.NUXT_APP_BASE_URL || '').replace(/\/$/, '')

export default defineNitroPlugin((nitroApp) => {
  if (!INGRESS_PATH) return

  nitroApp.hooks.hook('request', (event) => {
    if (event.path.startsWith(INGRESS_PATH)) {
      event.path = event.path.slice(INGRESS_PATH.length) || '/'
    }
  })
})