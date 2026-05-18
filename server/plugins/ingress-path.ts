const HA_ADDON = process.env.HA_ADDON === 'true'

export default defineNitroPlugin((nitroApp) => {
  if (!HA_ADDON) return

  nitroApp.hooks.hook('request', (event) => {
    const ingressPath = getRequestHeader(event, 'x-ingress-path') || process.env.NUXT_APP_BASE_URL?.replace(/\/$/, '') || ''
    if (!ingressPath) return

    if (!event.path.startsWith(ingressPath)) {
      event.path = ingressPath + event.path
    }
  })
})