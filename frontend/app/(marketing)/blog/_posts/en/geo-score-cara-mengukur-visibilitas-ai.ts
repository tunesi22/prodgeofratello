import type { Post } from '../types'

export const post: Post = {
  slug: 'geo-score-cara-mengukur-visibilitas-ai',
  category: 'Product',
  date: '2026-06-23',
  title: 'GEO Score: How to Accurately Measure Your Brand\'s Visibility on AI Engines',
  excerpt:
    'AI visibility cannot be measured with ordinary SEO metrics. Fratello introduces GEO Score, a comprehensive measurement framework built for the AI search era.',
  sections: [
    {
      body: 'One of the biggest challenges in GEO is measurement. Unlike SEO, which has well-established metrics, keyword ranking, domain authority, organic traffic, GEO needs a new way to measure success. Fratello built the GEO Score framework to answer exactly that need.',
    },
    {
      heading: 'What is GEO Score?',
      body: 'GEO Score is a 0-100 number that represents the strength of a brand\'s AI visibility. The score is calculated from four core components: Mention Rate (how often the brand is mentioned out of total prompts sent), Sentiment Score (how positive the context of the mention is), Position Score (whether the brand is mentioned first, second, or last in an AI answer), and Coverage Score (across how many AI engines the brand is consistently mentioned).',
    },
    {
      heading: 'How is GEO Score calculated?',
      body: 'Every week, Fratello sends a bank of relevant prompts to four AI engines. Each engine\'s response is analyzed to determine whether the brand was mentioned, in what context, and at what position. This data is aggregated and normalized into a 0-100 score. A brand scoring above 70 is considered to have strong AI visibility; below 30 signals a serious gap that needs urgent attention.',
    },
    {
      heading: 'Using GEO Score for strategic decisions',
      body: 'GEO Score is most useful when tracked over time. A sudden drop can signal a change in an AI engine\'s algorithm, or a new competitor starting to take share of voice. A rising score can confirm that a content strategy or review campaign currently underway is actually working.',
    },
    {
      heading: 'Industry benchmark',
      body: 'Based on data from hundreds of brands using Fratello, a brand just getting started typically scores in the 15-25 range. Brands that have actively invested in content and digital reputation for 6-12 months usually reach a 45-65 score. Brands with the strongest AI visibility in their category generally score above 75.',
    },
  ],
}
