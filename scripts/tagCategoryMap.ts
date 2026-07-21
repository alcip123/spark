// Priority-ordered tag -> category-slug buckets used by convert-facts.ts.
// The FIRST bucket whose tag set overlaps a fact's tags wins. Order matters:
// "history" and "mythology" are deliberately near the end because "history"
// alone appears on ~3,300 of 6,462 facts (often as a loose secondary tag),
// so checking it early would swallow facts that are really animals/science/etc.
export const CATEGORY_PRIORITY: { slug: string; tags: string[] }[] = [
  { slug: 'space', tags: ['space', 'astronomy'] },
  { slug: 'animals', tags: ['animals', 'insects', 'ocean'] },
  {
    slug: 'science',
    tags: [
      'science',
      'chemistry',
      'physics',
      'math',
      'biology',
      'human body',
      'engineering',
      'measurement',
      'nature',
    ],
  },
  { slug: 'food', tags: ['food'] },
  { slug: 'technology', tags: ['technology', 'internet', 'tech', 'inventions', 'aviation'] },
  { slug: 'sports', tags: ['sports', 'games'] },
  { slug: 'language', tags: ['language', 'words'] },
  { slug: 'art', tags: ['art', 'music', 'movies'] },
  { slug: 'geography', tags: ['geography', 'countries', 'landmarks', 'weather'] },
  { slug: 'psychology', tags: ['psychology'] },
  {
    slug: 'weird',
    tags: ['pop culture', 'video games', 'toys', 'tv', 'records', 'money', 'business', 'fashion', 'law', 'time'],
  },
  { slug: 'history', tags: ['history', 'mythology'] },
]

export const FALLBACK_CATEGORY_SLUG = 'weird'

export function mapTagsToCategory(tags: string[]): string {
  for (const bucket of CATEGORY_PRIORITY) {
    if (tags.some((t) => bucket.tags.includes(t))) {
      return bucket.slug
    }
  }
  return FALLBACK_CATEGORY_SLUG
}
