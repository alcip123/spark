import type { Category } from '../types'

export const categories: Category[] = [
  {
    name: 'Science',
    slug: 'science',
    description: 'How the universe actually works',
  },
  {
    name: 'History',
    slug: 'history',
    description: 'Stories from the past that shaped today',
  },
  {
    name: 'Animals',
    slug: 'animals',
    description: 'The weird and wonderful animal kingdom',
  },
  {
    name: 'Space',
    slug: 'space',
    description: 'Beyond our tiny blue dot',
  },
  {
    name: 'Geography',
    slug: 'geography',
    description: 'Places, borders, and Earth itself',
  },
  {
    name: 'Food',
    slug: 'food',
    description: 'What we eat and why it is fascinating',
  },
  {
    name: 'Technology',
    slug: 'technology',
    description: 'Inventions that changed everything',
  },
  {
    name: 'Sports',
    slug: 'sports',
    description: 'Records, rivalries, and remarkable athletes',
  },
  {
    name: 'Language',
    slug: 'language',
    description: 'Words, grammar, and how we communicate',
  },
  {
    name: 'Art',
    slug: 'art',
    description: 'Creativity, culture, and human expression',
  },
  {
    name: 'Psychology',
    slug: 'psychology',
    description: 'Why your brain does what it does',
  },
  {
    name: 'Weird Facts',
    slug: 'weird',
    description: 'Trivia, pop culture, and everything else that does not fit elsewhere',
  },
]

export const categoryBySlug = Object.fromEntries(
  categories.map(c => [c.slug, c])
) as Record<string, Category>
