export default defineNuxtPlugin(() => {
  const meta = document.querySelector('meta[name="x-ingress-path"]')
  if (!meta) return

  const ingressPath = meta.getAttribute('content') || ''
  if (!ingressPath || ingressPath === '/') return

  const originalFetch = globalThis.$fetch
  if (!originalFetch) return

  globalThis.$fetch = ((input: any, opts: any) => {
    if (typeof input === 'string' && !input.startsWith('http') && !input.startsWith('//')) {
      input = ingressPath + (input.startsWith('/') ? input : `/${input}`)
    }
    return originalFetch(input, opts)
  }) as any
})