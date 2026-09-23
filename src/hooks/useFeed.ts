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

// How a previously-seen fact earns its way back into the feed. A fact isn't
// spent inventory — people forget, which is the premise of the product — but
// one seen yesterday should be all but impossible to draw, and one seen months
// ago is a genuine candidate again. Ramps linearly from FLOOR to CEILING over
// RESURFACE_DAYS; never reaches 1, so an unseen fact always outranks a seen one
// of equal category weight.
const RESURFACE_DAYS = 30
const RESURFACE_FLOOR = 0.02
const RESURFACE_CEILING = 0.8
const DAY_MS = 24 * 60 * 60 * 1000

export function recencyFactor(lastSeenAt: number | undefined, now: number): number {
  if (lastSeenAt === undefined) return 1
  const days = (now - lastSeenAt) / DAY_MS
  // A clock change (timezone, manual set) can put lastSeenAt in the future;
  // treat that as "just seen" rather than letting a negative ratio invert the ramp.
  if (days <= 0) return RESURFACE_FLOOR
  const ramped = (days / RESURFACE_DAYS) * RESURFACE_CEILING
  return Math.min(Math.max(ramped, RESURFACE_FLOOR), RESURFACE_CEILING)
}

function factWeight(
  fact: Fact,
  preferred: string[],
  engagement: Record<string, number>,
  seenAt: Record<string, number>,
  now: number
): number {
  const base = 1
  const prefBoost = preferred.includes(fact.categorySlug) ? PREFERRED_BOOST : 0
  const engBoost = Math.min(engagement[fact.categorySlug] ?? 0, ENGAGEMENT_CAP) / ENGAGEMENT_SCALE
  return (base + prefBoost + engBoost) * recencyFactor(seenAt[fact.id], now)
}

// Weighted sampling without replacement (Efraimidis-Spirakis): each item gets
// key = random^(1/weight); taking the largest keys draws a batch whose odds
// are proportional to weight, while every fact still has a chance to appear.
function weightedSample(
  pool: Fact[],
  count: number,
  preferred: string[],
  engagement: Record<string, number>,
  seenAt: Record<string, number>,
  now: number
): Fact[] {
  return pool
    .map((fact) => ({
      fact,
      key: Math.pow(Math.random(), 1 / factWeight(fact, preferred, engagement, seenAt, now)),
    }))
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

    // Engagement and view history are read at draw time (not subscribed) so a
    // like, share, or fact just scrolled past influences the next batch without
    // rebuilding the feed.
    const { engagementByCategory: engagement, seenAt } = useFeedStore.getState()
    const batch = weightedSample(pool, BATCH_SIZE, preferredCategories, engagement, seenAt, Date.now())
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
