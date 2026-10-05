import { create } from 'zustand'
import type { Fact } from '../types'

export type Tab = 'home' | 'diveDeeper' | 'profile'

// Transient UI state only — deliberately NOT wrapped in persist(). The active
// tab and the fact currently on screen must never survive a restart, and
// keeping them out of feedStore makes that boundary structural rather than
// something partialize has to remember.
interface UiStore {
  activeTab: Tab
  currentVisibleFact: Fact | null
  // Snapshot of the fact Dive Deeper is about, captured when the sheet opens.
  // Never driven by live viewability: the feed's viewability callback can
  // flicker to null while the sheet is showing, and that must not be able to
  // yank the fact out from under an open conversation.
  diveDeeperFact: Fact | null
  setActiveTab: (tab: Tab) => void
  openDiveDeeper: () => void
  setCurrentVisibleFact: (fact: Fact | null) => void
}

export const useUiStore = create<UiStore>()((set) => ({
  activeTab: 'home',
  currentVisibleFact: null,
  diveDeeperFact: null,
  setActiveTab: (tab) => set({ activeTab: tab }),
  openDiveDeeper: () =>
    set((s) => ({ diveDeeperFact: s.currentVisibleFact ?? s.diveDeeperFact })),
  setCurrentVisibleFact: (fact) => set({ currentVisibleFact: fact }),
}))
