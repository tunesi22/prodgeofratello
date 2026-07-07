export type Section = { heading?: string; body: string }

export type Post = {
  slug: string
  category: string
  date: string
  title: string
  excerpt: string
  sections: Section[]
}
