import { useCallback, useEffect, useRef, useState } from 'react'
import allFacts from '../data/facts.json'
import { useFeedStore } from '../store/feedStore'
import type { Fact } from '../types'

const BATCH_SIZE = 20

// How strongly signals tilt the feed. Preferred categories (from onboarding)
// get a fixed head start; engagement points accumulate from likes, shares,
// and dwell time but are capped so no category can drown out the rest.
const PREFERRED_BOOST = 1.5
const ENGAGEMENT_CAP = 25
const ENGAGEMENT_SCALE = 5

function factWeight(
  fact: Fact,
  preferred: string[],
  engagement: Record<string, number>
): number {
  const base = 1
  const prefBoost = preferred.includes(fact.categorySlug) ? PREFERRED_BOOST : 0
  const engBoost = Math.min(engagement[fact.categorySlug] ?? 0, ENGAGEMENT_CAP) / ENGAGEMENT_SCALE
  return base + prefBoost + engBoost
}

// Weighted sampling without replacement (Efraimidis-Spirakis): each item gets
// key = random^(1/weight); taking the largest keys draws a batch whose odds
// are proportional to weight, while every fact still has a chance to appear.
function weightedSample(pool: Fact[], count: number, preferred: string[], engagement: Record<string, number>): Fact[] {
  return pool
    .map((fact) => ({ fact, key: Math.pow(Math.random(), 1 / factWeight(fact, preferred, engagement)) }))
    .sort((a, b) => b.key - a.key)
    .slice(0, count)
    .map((entry) => entry.fact)
}

export function useFeed() {
  const preferredCategories = useFeedStore((s) => s.preferredCategories)
  const seen = useRef(new Set<string>())
  const [feed, setFeed] = useState<Fact[]>([])
  const [exhausted, setExhausted] = useState(false)

  const loadBatch = useCallback(() => {
    const facts = allFacts as Fact[]
    const pool = facts.filter((f) => !seen.current.has(f.id))

    if (pool.length === 0) {
      setExhausted(true)
      return
    }

    // Engagement is read at draw time (not subscribed) so a like or share
    // mid-scroll influences the next batch without rebuilding the feed.
    const engagement = useFeedStore.getState().engagementByCategory
    const batch = weightedSample(pool, BATCH_SIZE, preferredCategories, engagement)
    batch.forEach((f) => seen.current.add(f.id))
    setFeed((prev) => [...prev, ...batch])
  }, [preferredCategories])

  // Reset and reload if the user changes their favorite topics in Settings
  useEffect(() => {
    seen.current.clear()
    setExhausted(false)
    setFeed([])
  }, [preferredCategories])

  // Load initial batch once feed is empty (on mount and after category reset)
  useEffect(() => {
    if (feed.length === 0 && !exhausted) {
      loadBatch()
    }
  }, [feed.length, exhausted, loadBatch])

  return { feed, loadMore: loadBatch, hasMore: !exhausted }
}
