import { joinURL } from 'ufo'

export const useAssetUrl = () => {
  const config = useRuntimeConfig()

  return (path: string | null | undefined): string | undefined => {
    if (!path) return undefined
    if (path.startsWith('http') || path.startsWith('data:')) return path
    return joinURL(config.app.baseURL, path)
  }
}
