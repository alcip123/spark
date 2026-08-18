import type { Fact } from '../types'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// Metro inlines EXPO_PUBLIC_* vars at build time. In dev this should be the
// machine's LAN IP + spark-server port (not localhost — the app runs on a
// device/simulator, not this machine).
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? ''

const REQUEST_TIMEOUT_MS = 10_000

export async function postChatMessage(params: {
  fact: Pick<Fact, 'text' | 'categorySlug'>
  history: ChatMessage[]
  message: string
}): Promise<string> {
  if (!API_BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL is not configured')
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
    throw new Error('EXPO_PUBLIC_API_BASE_URL is not configured')
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
