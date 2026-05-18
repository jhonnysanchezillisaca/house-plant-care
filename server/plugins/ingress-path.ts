import type { H3Event } from 'h3'

const HA_ADDON = process.env.HA_ADDON === 'true'

export default defineNitroPlugin((nitroApp) => {
  if (!HA_ADDON) return

  nitroApp.hooks.hook('render:response', (response, { event }: { event: H3Event }) => {
    const ingressPath = event.context.ingressPath as string | undefined
    if (!ingressPath) return

    const contentType = response.headers?.['content-type'] || response.headers?.['Content-Type'] as string | undefined
    if (!contentType || !contentType.includes('text/html')) return

    if (typeof response.body !== 'string') return

    const prefix = ingressPath

    let html = response.body as string

    html = html.replace(/(href|src)="\/(?!\/)/g, `$1="${prefix}/`)

    html = html.replace(/(href|src)='\/(?!\/)/g, `$1='${prefix}/`)

    if (!html.includes('x-ingress-path')) {
      const meta = `<meta name="x-ingress-path" content="${prefix}/">`
      if (html.includes('<head>')) {
        html = html.replace('<head>', `<head>${meta}`)
      }
    }

    response.body = html
  })
})