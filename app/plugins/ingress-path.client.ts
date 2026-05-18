export default defineNuxtPlugin(() => {
  const meta = document.querySelector('meta[name="x-ingress-path"]')
  if (meta) {
    const ingressPath = meta.getAttribute('content') || ''
    if (ingressPath) {
      const config = useRuntimeConfig()
      config.app.baseURL = ingressPath

      const originalFetch = globalThis.$fetch
      if (originalFetch && ingressPath !== '/') {
        globalThis.$fetch = ((input: any, opts: any) => {
          if (typeof input === 'string' && !input.startsWith('http') && !input.startsWith('//')) {
            input = ingressPath + (input.startsWith('/') ? input : `/${input}`)
          }
          return originalFetch(input, opts)
        }) as any
      }
    }
  }
})