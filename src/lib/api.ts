import { NativeModules } from 'react-native'
import type { Fact } from '../types'
import { resolveApiBaseUrl } from './apiHost'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

/**
 * The URL the JS bundle was served from, which in dev is also the machine
 * running spark-server.
 *
 * Order matters. `NativeModules.SourceCode.scriptURL` is the familiar trick
 * but it is undefined under the New Architecture (bridgeless), which Expo
 * SDK 54 enables by default — the SourceCode object is still there, just
 * without its constants, so it fails silently. getDevServer() is RN's own
 * accessor and works in both architectures; it's checked first for that
 * reason, with the others as fallbacks for older runtimes and for web.
 */
function devServerUrl(): string | null {
  try {
    const getDevServer = require('react-native/Libraries/Core/Devtools/getDevServer')
      .default as () => { url?: string; bundleLoadedFromServer?: boolean }
    const info = getDevServer()
    // False for a production bundle, where `url` is a meaningless placeholder.
    if (info?.bundleLoadedFromServer && info.url) return info.url
  } catch {
    // Internal RN path — if a future version moves it, fall through.
  }

  const scriptURL = (NativeModules.SourceCode as { scriptURL?: string } | undefined)?.scriptURL
  if (scriptURL) return scriptURL

  // react-native-web: the bundle came from the same dev server as the page.
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin

  return null
}

// Set EXPO_PUBLIC_API_BASE_URL to override the derived value (a release build
// pointing at a deployed backend), and EXPO_PUBLIC_API_PORT if spark-server
// isn't on 5001.
export const API_BASE_URL = resolveApiBaseUrl({
  envBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
  devServerUrl: devServerUrl(),
  port: process.env.EXPO_PUBLIC_API_PORT,
})

const REQUEST_TIMEOUT_MS = 10_000

export async function postChatMessage(params: {
  fact: Pick<Fact, 'text' | 'categorySlug'>
  history: ChatMessage[]
  message: string
}): Promise<string> {
  if (!API_BASE_URL) {
    throw new Error('No API base URL — could not derive one from Metro, and EXPO_PUBLIC_API_BASE_URL is unset')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const res = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: controller.signal,
    })
    if (!res.ok) {
      throw new Error(`Chat request failed (${res.status})`)
    }
    const data = (await res.json()) as { reply?: string }
    if (typeof data.reply !== 'string') {
      throw new Error('Malformed chat response')
    }
    return data.reply
  } finally {
    clearTimeout(timeout)
  }
}

export async function postSuggestions(params: {
  fact: Pick<Fact, 'text' | 'categorySlug'>
  history: ChatMessage[]
}): Promise<string[]> {
  if (!API_BASE_URL) {
    throw new Error('No API base URL — could not derive one from Metro, and EXPO_PUBLIC_API_BASE_URL is unset')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const res = await fetch(`${API_BASE_URL}/api/suggestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: controller.signal,
    })
    if (!res.ok) {
      throw new Error(`Suggestions request failed (${res.status})`)
    }
    const data = (await res.json()) as { suggestions?: unknown }
    if (!Array.isArray(data.suggestions)) {
      throw new Error('Malformed suggestions response')
    }
    return data.suggestions.filter((s): s is string => typeof s === 'string')
  } finally {
    clearTimeout(timeout)
  }
}
