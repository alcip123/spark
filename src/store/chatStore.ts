import { create } from 'zustand'
import { postChatMessage, type ChatMessage } from '../lib/api'
import type { Fact } from '../types'

export type ChatStatus = 'idle' | 'sending' | 'error'

export interface ChatThread {
  messages: ChatMessage[]
  status: ChatStatus
  draft: string
}

export const EMPTY_THREAD: ChatThread = { messages: [], status: 'idle', draft: '' }

// Threads live here (not in component state) so a conversation survives tab
// switches. Keyed by fact id: coming back to the same fact resumes the thread,
// a different fact starts its own. Deliberately not persisted — conversations
// are session-scoped, like uiStore.
interface ChatStore {
  threads: Record<string, ChatThread>
  // The payload of the last failed send per fact, so retry re-sends exactly it
  pendingRetry: Record<string, { history: ChatMessage[]; message: string } | undefined>
  send: (fact: Fact, message: string) => void
  retry: (fact: Fact) => void
  setDraft: (factId: string, draft: string) => void
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

  return {
    threads: {},
    pendingRetry: {},

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
  }
})
