import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { TextSize } from '../types'

interface FeedStore {
  preferredCategories: string[]
  onboardingComplete: boolean
  textSize: TextSize
  likedFactIds: string[]
  // Per-category engagement points (likes, shares, dwell time). The feed uses
  // these as sampling weights — every category always stays in the mix, the
  // points only tilt the odds toward what the user responds to.
  engagementByCategory: Record<string, number>
  // Same idea, one level finer: per-tag points. Tags cut across categories
  // (a "gaming" tag shows up under weird, art, and technology alike), so this
  // catches affinities category alone can't — liking Nintendo trivia filed
  // under "weird" should also lift Nintendo trivia filed under "technology."
  engagementByTag: Record<string, number>
  // factId -> epoch ms when it was last shown. Persisted, unlike useFeed's
  // per-session `seen` set: without this the feed forgets everything shown to
  // a user the moment the app closes, so it can't tell a fact someone loved
  // from one they scrolled past, and re-draws both with equal odds forever.
  // Recency here drives the resurfacing weight in useFeed.
  seenAt: Record<string, number>
  hasHydrated: boolean
  setPreferredCategories: (categories: string[]) => void
  setOnboardingComplete: (complete: boolean) => void
  setTextSize: (size: TextSize) => void
  toggleLike: (factId: string) => void
  recordEngagement: (fact: { categorySlug: string; tags: string[] }, points: number) => void
  recordSeen: (factId: string) => void
  setHasHydrated: (hydrated: boolean) => void
}

export const useFeedStore = create<FeedStore>()(
  persist(
    (set) => ({
      preferredCategories: [],
      onboardingComplete: false,
      textSize: 'medium',
      likedFactIds: [],
      engagementByCategory: {},
      engagementByTag: {},
      seenAt: {},
      hasHydrated: false,
      setPreferredCategories: (categories) => set({ preferredCategories: categories }),
      setOnboardingComplete: (complete) => set({ onboardingComplete: complete }),
      setTextSize: (size) => set({ textSize: size }),
      toggleLike: (factId) =>
        set((state) => ({
          likedFactIds: state.likedFactIds.includes(factId)
            ? state.likedFactIds.filter((id) => id !== factId)
            : [...state.likedFactIds, factId],
        })),
      recordEngagement: (fact, points) =>
        set((state) => {
          const engagementByTag = { ...state.engagementByTag }
          for (const tag of fact.tags) {
            // The category-matching tag is already covered by engagementByCategory;
            // counting it again here would double-credit the ~92% of facts whose
            // tags repeat their own category.
            if (tag === fact.categorySlug) continue
            engagementByTag[tag] = Math.max((engagementByTag[tag] ?? 0) + points, 0)
          }
          return {
            engagementByCategory: {
              ...state.engagementByCategory,
              [fact.categorySlug]: Math.max(
                (state.engagementByCategory[fact.categorySlug] ?? 0) + points,
                0
              ),
            },
            engagementByTag,
          }
        }),
      recordSeen: (factId) =>
        set((state) => ({ seenAt: { ...state.seenAt, [factId]: Date.now() } })),
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
    }),
    {
      name: 'spark-store',
      storage: createJSONStorage(() => AsyncStorage),
      // hasHydrated is transient UI state, not something to persist/restore itself
      partialize: (state) => ({
        preferredCategories: state.preferredCategories,
        onboardingComplete: state.onboardingComplete,
        textSize: state.textSize,
        likedFactIds: state.likedFactIds,
        engagementByCategory: state.engagementByCategory,
        engagementByTag: state.engagementByTag,
        seenAt: state.seenAt,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
