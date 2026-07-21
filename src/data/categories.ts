import type { Category } from '../types'

export const categories: Category[] = [
  {
    name: 'Science',
    slug: 'science',
    description: 'How the universe actually works',
    icon: '🔬',
    colorHex: '#4A90D9',
  },
  {
    name: 'History',
    slug: 'history',
    description: 'Stories from the past that shaped today',
    icon: '🏛️',
    colorHex: '#C0392B',
  },
  {
    name: 'Animals',
    slug: 'animals',
    description: 'The weird and wonderful animal kingdom',
    icon: '🐾',
    colorHex: '#27AE60',
  },
  {
    name: 'Space',
    slug: 'space',
    description: 'Beyond our tiny blue dot',
    icon: '🌌',
    colorHex: '#2C3E7A',
  },
  {
    name: 'Geography',
    slug: 'geography',
    description: 'Places, borders, and Earth itself',
    icon: '🌍',
    colorHex: '#2ECC71',
  },
  {
    name: 'Food',
    slug: 'food',
    description: 'What we eat and why it is fascinating',
    icon: '🍕',
    colorHex: '#E67E22',
  },
  {
    name: 'Technology',
    slug: 'technology',
    description: 'Inventions that changed everything',
    icon: '💻',
    colorHex: '#8E44AD',
  },
  {
    name: 'Sports',
    slug: 'sports',
    description: 'Records, rivalries, and remarkable athletes',
    icon: '⚽',
    colorHex: '#16A085',
  },
  {
    name: 'Language',
    slug: 'language',
    description: 'Words, grammar, and how we communicate',
    icon: '📖',
    colorHex: '#D35400',
  },
  {
    name: 'Art',
    slug: 'art',
    description: 'Creativity, culture, and human expression',
    icon: '🎨',
    colorHex: '#9B59B6',
  },
  {
    name: 'Psychology',
    slug: 'psychology',
    description: 'Why your brain does what it does',
    icon: '🧠',
    colorHex: '#F39C12',
  },
  {
    name: 'Weird Facts',
    slug: 'weird',
    description: 'Trivia, pop culture, and everything else that does not fit elsewhere',
    icon: '🤯',
    colorHex: '#E74C3C',
  },
]

export const categoryBySlug = Object.fromEntries(
  categories.map(c => [c.slug, c])
) as Record<string, Category>
