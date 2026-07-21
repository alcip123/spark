export interface Fact {
  id: string
  text: string
  categorySlug: string
  tags: string[]
}

export interface Category {
  name: string
  slug: string
  description: string
  icon: string
  colorHex: string
}

export type TextSize = 'small' | 'medium' | 'large'
