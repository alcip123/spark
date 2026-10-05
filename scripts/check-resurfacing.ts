// Self-check for the resurfacing weight and tag/category scoring in useFeed.
// Run: npx tsx scripts/check-resurfacing.ts
import assert from 'node:assert'
import { factWeight, recencyFactor } from '../src/hooks/useFeed'
import type { Fact } from '../src/types'

const DAY = 24 * 60 * 60 * 1000
const now = Date.UTC(2026, 8, 22)
const ago = (days: number) => now - days * DAY

// An unseen fact is never suppressed.
assert.strictEqual(recencyFactor(undefined, now), 1)

// A fact just seen is all but unreachable, but never zero — zero would make it
// permanently unreachable once the unseen pool runs dry.
assert.strictEqual(recencyFactor(now, now), 0.02)
assert.ok(recencyFactor(ago(1), now) < 0.05)

// Older means likelier, monotonically.
const ramp = [1, 7, 14, 30, 60].map((d) => recencyFactor(ago(d), now))
ramp.forEach((v, i) => i > 0 && assert.ok(v >= ramp[i - 1], `not monotonic at ${i}`))

// A seen fact never outranks an unseen one, however old.
assert.ok(recencyFactor(ago(3650), now) <= 0.8)

// A future timestamp (clock change) is treated as just-seen, not as ancient.
assert.strictEqual(recencyFactor(now + 5 * DAY, now), 0.02)

console.log('resurfacing weights OK', ramp.map((v) => v.toFixed(3)).join(' '))

// factWeight: tag engagement lifts a fact's odds.
const fact: Fact = { id: 'f-1', text: 'test', categorySlug: 'weird', tags: ['weird', 'gaming'] }
const noEngagement = factWeight(fact, [], {}, {}, {}, now)
const withTagEngagement = factWeight(fact, [], {}, { gaming: 25 }, {}, now)
assert.ok(withTagEngagement > noEngagement, 'tag engagement should raise weight')

// factWeight sums whatever engagementByTag it's given — the guarantee that a
// tag matching the fact's own category never gets written there in the first
// place lives in feedStore.recordEngagement, not here.

// Tag contribution is capped the same way category contribution is — several
// hot tags can't stack past a single hot category's ceiling.
const manyTags: Fact = { ...fact, tags: ['a', 'b', 'c', 'd'] }
const stackedTags = factWeight(manyTags, [], {}, { a: 25, b: 25, c: 25, d: 25 }, {}, now)
const singleHotCategory = factWeight(fact, [], { weird: 25 }, {}, {}, now)
assert.strictEqual(stackedTags, singleHotCategory, 'tag boost should cap same as category boost')

console.log('factWeight tag scoring OK')
