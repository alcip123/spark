import AsyncStorage from '@react-native-async-storage/async-storage'
import { AppState } from 'react-native'
import { API_BASE_URL } from './api'

// Anonymous, self-hosted analytics. Events carry a random per-install id and
// nothing else identifying — no device id, no IP (the server deliberately
// doesn't record one), no account. That keeps the privacy position the
// business plan treats as a real asset, while still answering the only
// questions that matter early: does anyone come back, and what did they do
// first.
//
// Everything here fails silent. Analytics must never be able to break the
// feed — a dropped event costs a data point, a thrown error costs a user.

export type EventName =
  | 'app_open'
  | 'fact_viewed'
  | 'fact_liked'
  | 'fact_unliked'
  | 'fact_shared'
  | 'fact_expanded'
  | 'feed_tab_changed'
  | 'topic_selected'
  | 'dive_deeper_opened'
  | 'dive_deeper_message'
  | 'feed_exhausted'
  | 'session_end'

type Props = Record<string, string | number | boolean | null>

interface QueuedEvent {
  name: EventName
  anonId: string
  sessionId: string
  ts: number
  props: Props
}

const ANON_ID_KEY = 'spark-anon-id'
const FLUSH_INTERVAL_MS = 15_000
const FLUSH_AT_COUNT = 20
// Hard cap so a long offline session can't grow the queue without bound.
const MAX_QUEUE = 200
const REQUEST_TIMEOUT_MS = 8_000

let anonId: string | null = null
let sessionId = newId()
let queue: QueuedEvent[] = []
let timer: ReturnType<typeof setInterval> | null = null
let started = false

function newId(): string {
  // Not a real UUID — this only needs to be collision-free across installs,
  // not cryptographically random. Avoids pulling in a uuid dependency.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

async function loadAnonId(): Promise<string> {
  if (anonId) return anonId
  try {
    const stored = await AsyncStorage.getItem(ANON_ID_KEY)
    if (stored) {
      anonId = stored
      return stored
    }
  } catch {
    // Storage unavailable — fall through to an ephemeral id. The install
    // will look like a new user next launch, which is worth knowing about
    // but not worth crashing over.
  }
  const fresh = newId()
  anonId = fresh
  try {
    await AsyncStorage.setItem(ANON_ID_KEY, fresh)
  } catch {
    // Ephemeral for this session only.
  }
  return fresh
}

/**
 * Starts the flush timer and records app_open. Safe to call more than once.
 */
export function initAnalytics(): void {
  if (started) return
  started = true

  void loadAnonId().then(() => track('app_open'))

  timer = setInterval(() => void flush(), FLUSH_INTERVAL_MS)

  // Backgrounding is the last reliable moment to send — an app the OS kills
  // from the background never gets another chance.
  AppState.addEventListener('change', (state) => {
    if (state === 'background' || state === 'inactive') {
      track('session_end')
      void flush()
      // A return to foreground is a new session for retention purposes.
      sessionId = newId()
    }
  })
}

export function track(name: EventName, props: Props = {}): void {
  if (!anonId) {
    // Before the id resolves, queue under a placeholder and let loadAnonId
    // backfill — losing the first few events of a first launch would lose
    // exactly the onboarding data that matters most.
    void loadAnonId().then((id) => {
      queue.forEach((e) => {
        if (e.anonId === '') e.anonId = id
      })
    })
  }
  queue.push({ name, anonId: anonId ?? '', sessionId, ts: Date.now(), props })
  if (queue.length > MAX_QUEUE) queue = queue.slice(-MAX_QUEUE)
  if (queue.length >= FLUSH_AT_COUNT) void flush()
}

export async function flush(): Promise<void> {
  if (queue.length === 0 || !API_BASE_URL) return
  // Events without a resolved id yet stay queued for the next flush.
  const ready = queue.filter((e) => e.anonId !== '')
  if (ready.length === 0) return

  const batch = ready.slice(0, 50)
  const sent = new Set(batch)
  queue = queue.filter((e) => !sent.has(e))

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    await fetch(`${API_BASE_URL}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: batch }),
      signal: controller.signal,
    })
  } catch {
    // Dropped on purpose rather than retried forever: a server that is down
    // shouldn't leave the app retrying a growing backlog on every timer tick.
  } finally {
    clearTimeout(timeout)
  }
}

/** Test seam — resets module state between checks. */
export function __resetForTests(): void {
  anonId = null
  sessionId = newId()
  queue = []
  started = false
  if (timer) clearInterval(timer)
  timer = null
}
