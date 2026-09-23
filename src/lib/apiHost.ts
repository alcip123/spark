// Where spark-server lives, worked out at runtime instead of being pinned in
// .env. In dev the backend runs on the same machine that serves the JS bundle,
// so Metro's own URL already carries the right LAN IP — reading it off there
// means a new DHCP lease doesn't silently break Dive Deeper.
//
// Kept free of react-native imports so the resolution logic stays plain,
// testable TypeScript; api.ts supplies the platform values.

export const DEFAULT_API_PORT = '5001'

/**
 * Pulls the host out of a dev server URL — either the origin getDevServer()
 * returns ("http://192.168.0.176:8081/") or a full bundle URL. Returns null
 * for a production bundle, which is loaded from disk (file://) and so has no
 * host to borrow.
 */
export function hostFromUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const match = /^https?:\/\/([^/:?#]+)/.exec(url)
  return match ? match[1] : null
}

export function resolveApiBaseUrl(params: {
  envBaseUrl?: string
  devServerUrl?: string | null
  port?: string
}): string {
  // An explicit EXPO_PUBLIC_API_BASE_URL always wins — that's how a release
  // build points at a real deployed backend rather than someone's laptop.
  const envBaseUrl = params.envBaseUrl?.trim()
  if (envBaseUrl) return envBaseUrl.replace(/\/+$/, '')

  const host = hostFromUrl(params.devServerUrl)
  if (!host) return ''
  return `http://${host}:${params.port?.trim() || DEFAULT_API_PORT}`
}
