import { create } from 'zustand'
import { track } from '../lib/analytics'
import type { Fact } from '../types'

export type Tab = 'home' | 'diveDeeper' | 'profile'

// Which list the feed screen is showing. Transient like activeTab — reopening
// the app should land on the personalized feed, not wherever you last browsed.
export type FeedTab = 'topics' | 'forYou' | 'saved'

// Transient UI state only — deliberately NOT wrapped in persist(). The active
// tab and the fact currently on screen must never survive a restart, and
// keeping them out of feedStore makes that boundary structural rather than
// something partialize has to remember.
interface UiStore {
  activeTab: Tab
  feedTab: FeedTab
  selectedTopic: string | null
  currentVisibleFact: Fact | null
  // Snapshot of the fact Dive Deeper is about, captured when the sheet opens.
  // Never driven by live viewability: the feed's viewability callback can
  // flicker to null while the sheet is showing, and that must not be able to
  // yank the fact out from under an open conversation.
  diveDeeperFact: Fact | null
  // Sheet visibility lives here rather than in App's local state: Dive Deeper
  // is now opened from inside an expanded fact, several components deep, and
  // threading a callback down for it would be worse than one shared flag.
  diveDeeperVisible: boolean
  // The fact opened into the full-screen view, or null. Lives here rather than
  // in FeedScreen so App can render it *above* the dock — nested inside the
  // feed it was painted under the dock's floating pill.
  expandedFact: Fact | null
  setActiveTab: (tab: Tab) => void
  setFeedTab: (tab: FeedTab) => void
  setSelectedTopic: (slug: string | null) => void
  setExpandedFact: (fact: Fact | null) => void
  openDiveDeeper: () => void
  closeDiveDeeper: () => void
  setCurrentVisibleFact: (fact: Fact | null) => void
}

export const useUiStore = create<UiStore>()((set) => ({
  activeTab: 'home',
  feedTab: 'forYou',
  selectedTopic: null,
  currentVisibleFact: null,
  diveDeeperFact: null,
  diveDeeperVisible: false,
  expandedFact: null,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setFeedTab: (tab) => {
    track('feed_tab_changed', { tab })
    // Leaving Topics drops the drill-down, so returning to it shows the
    // category list rather than whatever was last opened.
    set(tab === 'topics' ? { feedTab: tab } : { feedTab: tab, selectedTopic: null })
  },
  setSelectedTopic: (slug) => {
    if (slug) track('topic_selected', { category: slug })
    set({ selectedTopic: slug })
  },
  openDiveDeeper: () =>
    set((s) => {
      const fact = s.currentVisibleFact ?? s.diveDeeperFact
      if (fact) track('dive_deeper_opened', { fact_id: fact.id, category: fact.categorySlug })
      return { diveDeeperFact: fact, diveDeeperVisible: true }
    }),
  closeDiveDeeper: () => set({ diveDeeperVisible: false }),
  setExpandedFact: (fact) => {
    // The clearest deliberate-interest signal the feed produces — a tap costs
    // effort in a way a scroll-past doesn't.
    if (fact) track('fact_expanded', { fact_id: fact.id, category: fact.categorySlug })
    set({ expandedFact: fact })
  },
  setCurrentVisibleFact: (fact) => set({ currentVisibleFact: fact }),
}))
