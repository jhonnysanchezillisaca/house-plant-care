const HA_ADDON = process.env.HA_ADDON === 'true'

export default defineNitroPlugin((nitroApp) => {
  if (!HA_ADDON) return

  nitroApp.hooks.hook('request', (event) => {
    const ingressPath = (event.context.ingressPath as string | undefined)
      || getRequestHeader(event, 'x-ingress-path')
      || (process.env.NUXT_APP_BASE_URL || '').replace(/\/$/, '')

    if (!ingressPath) return

    const path = event.path

    if (path.startsWith('/api/') || path.startsWith('/_nuxt/') || path.startsWith('/__')) {
      return
    }

    if (!path.startsWith(ingressPath)) {
      event.path = ingressPath + path
    }
  })
})