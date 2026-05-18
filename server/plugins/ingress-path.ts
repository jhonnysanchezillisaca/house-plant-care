const HA_ADDON = process.env.HA_ADDON === 'true'

export default defineNitroPlugin((nitroApp) => {
  if (!HA_ADDON) return

  nitroApp.hooks.hook('render:response', (response, { event }) => {
    const ingressPath = (event.context.ingressPath as string | undefined) || getRequestHeader(event, 'x-ingress-path')
    if (!ingressPath) return

    const contentType = getResponseHeader(event, 'content-type') as string || ''
    if (!contentType.includes('text/html')) return

    if (typeof response.body !== 'string') return

    const prefix = ingressPath.replace(/\/$/, '')

    let html = response.body as string

    html = html.replace(/(href|src)="\/(?!\/)/g, `$1="${prefix}/`)
    html = html.replace(/(href|src)='\/(?!\/)/g, `$1='${prefix}/`)

    const meta = `<meta name="x-ingress-path" content="${prefix}/">`
    if (!html.includes('x-ingress-path') && html.includes('<head>')) {
      html = html.replace('<head>', `<head>${meta}`)
    }

    response.body = html
    setResponseHeader(event, 'content-length', Buffer.byteLength(html))
  })
})