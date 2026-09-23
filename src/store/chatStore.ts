import { create } from 'zustand'
import { track } from '../lib/analytics'
import { postChatMessage, postSuggestions, type ChatMessage } from '../lib/api'
import type { Fact } from '../types'

export type ChatStatus = 'idle' | 'sending' | 'error'

export interface ChatThread {
  messages: ChatMessage[]
  status: ChatStatus
  draft: string
}

export const EMPTY_THREAD: ChatThread = { messages: [], status: 'idle', draft: '' }

// 'dismissed' is terminal for a fact: once the reader has taken one of the
// suggested questions, the chips stay gone for that conversation rather than a
// fresh set appearing after every reply. Asking one question is the signal
// that they're engaged and can carry the conversation themselves.
export type SuggestionsStatus = 'idle' | 'loading' | 'error' | 'dismissed'

export interface SuggestionsState {
  items: string[]
  status: SuggestionsStatus
}

export const EMPTY_SUGGESTIONS: SuggestionsState = { items: [], status: 'idle' }

// Threads live here (not in component state) so a conversation survives tab
// switches. Keyed by fact id: coming back to the same fact resumes the thread,
// a different fact starts its own. Deliberately not persisted — conversations
// are session-scoped, like uiStore.
interface ChatStore {
  threads: Record<string, ChatThread>
  // The payload of the last failed send per fact, so retry re-sends exactly it
  pendingRetry: Record<string, { history: ChatMessage[]; message: string } | undefined>
  suggestions: Record<string, SuggestionsState>
  send: (fact: Fact, message: string) => void
  retry: (fact: Fact) => void
  setDraft: (factId: string, draft: string) => void
  fetchSuggestions: (fact: Fact, history: ChatMessage[]) => void
  dismissSuggestions: (factId: string) => void
}

export const useChatStore = create<ChatStore>()((set, get) => {
  function patchThread(factId: string, patch: Partial<ChatThread>) {
    set((s) => ({
      threads: {
        ...s.threads,
        [factId]: { ...(s.threads[factId] ?? EMPTY_THREAD), ...patch },
      },
    }))
  }

  async function dispatch(fact: Fact, history: ChatMessage[], message: string) {
    patchThread(fact.id, { status: 'sending' })
    // turn_number is what §8.3's cost model needs: history is resent every
    // turn, so cost per conversation grows with depth, not just count.
    track('dive_deeper_message', { fact_id: fact.id, turn_number: history.length / 2 + 1 })
    try {
      const reply = await postChatMessage({
        fact: { text: fact.text, categorySlug: fact.categorySlug },
        history,
        message,
      })
      set((s) => ({ pendingRetry: { ...s.pendingRetry, [fact.id]: undefined } }))
      patchThread(fact.id, {
        status: 'idle',
        messages: [
          ...history,
          { role: 'user', content: message },
          { role: 'assistant', content: reply },
        ],
      })
    } catch {
      set((s) => ({
        pendingRetry: { ...s.pendingRetry, [fact.id]: { history, message } },
      }))
      patchThread(fact.id, {
        status: 'error',
        messages: [...history, { role: 'user', content: message }],
      })
    }
  }

  function patchSuggestions(factId: string, patch: Partial<SuggestionsState>) {
    set((s) => ({
      suggestions: {
        ...s.suggestions,
        [factId]: { ...(s.suggestions[factId] ?? EMPTY_SUGGESTIONS), ...patch },
      },
    }))
  }

  return {
    threads: {},
    pendingRetry: {},
    suggestions: {},

    send: (fact, message) => {
      const text = message.trim()
      const thread = get().threads[fact.id] ?? EMPTY_THREAD
      if (!text || thread.status === 'sending') return
      // On a fresh send after an error, the failed user message is already the
      // last entry in messages — drop it from history so it isn't duplicated.
      const history = get().pendingRetry[fact.id]
        ? thread.messages.slice(0, thread.messages.length - 1)
        : thread.messages
      set((s) => ({ pendingRetry: { ...s.pendingRetry, [fact.id]: undefined } }))
      patchThread(fact.id, { draft: '' })
      dispatch(fact, history, text)
    },

    retry: (fact) => {
      const pending = get().pendingRetry[fact.id]
      const thread = get().threads[fact.id] ?? EMPTY_THREAD
      if (!pending || thread.status === 'sending') return
      dispatch(fact, pending.history, pending.message)
    },

    setDraft: (factId, draft) => patchThread(factId, { draft }),

    fetchSuggestions: async (fact, history) => {
      // A dismissal outlives any in-flight or future fetch for this fact.
      if (get().suggestions[fact.id]?.status === 'dismissed') return
      patchSuggestions(fact.id, { status: 'loading' })
      try {
        const items = await postSuggestions({
          fact: { text: fact.text, categorySlug: fact.categorySlug },
          history,
        })
        // Re-checked after the await: the reader can tap a chip while this
        // request is still in flight, and the reply landing must not put a
        // fresh set of chips back on screen.
        if (get().suggestions[fact.id]?.status === 'dismissed') return
        patchSuggestions(fact.id, { items, status: 'idle' })
      } catch {
        if (get().suggestions[fact.id]?.status === 'dismissed') return
        patchSuggestions(fact.id, { items: [], status: 'error' })
      }
    },

    dismissSuggestions: (factId) => patchSuggestions(factId, { items: [], status: 'dismissed' }),
  }
})
