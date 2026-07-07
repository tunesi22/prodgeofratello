import type { Post } from '../types'

export const post: Post = {
  slug: 'llms-txt-standar-baru-ai-crawler',
  category: 'Guide',
  date: '2026-07-05',
  title: 'llms.txt: A New Standard That Helps AI Understand Your Website',
  excerpt:
    'Like robots.txt for search engines, llms.txt is a simple file that helps AI engines understand your website\'s content faster and more accurately. Here is how it works.',
  sections: [
    {
      body: 'For years, robots.txt was the standard way a website talked to search engine crawlers. Now, as AI engines like ChatGPT, Claude, and Perplexity actively crawl the web to answer user questions, a similar new standard has emerged: llms.txt.',
    },
    {
      heading: 'What is llms.txt?',
      body: 'llms.txt is a simple text file placed at your domain root (e.g. hifratello.com/llms.txt) containing a structured summary of your website, what the business is, which important pages are available, and context that helps AI understand your content without having to crawl the entire site in depth.',
    },
    {
      heading: 'Why does this matter for GEO?',
      body: 'AI engines have real limits on how much of a website\'s full content they can process every time they answer a question. llms.txt gives them an "executive summary" that makes it easy for AI to pick up the right context quickly. A brand that provides a clear llms.txt has a better chance of being represented accurately when AI mentions it.',
    },
    {
      heading: 'The basic structure of an effective llms.txt',
      body: 'The community-recommended format includes: a title and short brand description, a list of important pages with links and a one-sentence summary per page, and an optional short FAQ section. Avoid filling this file with heavy marketing language, AI responds better to factual, straight-to-the-point language.',
    },
    {
      heading: 'How Fratello helps',
      body: 'Fratello\'s technical audit feature can auto-generate an llms.txt draft based on your website\'s structure, including routing configuration for popular AI crawlers (GPTBot, ClaudeBot, PerplexityBot). It is one of the easiest technical steps a brand can implement right away to improve how readable its site is to AI engines.',
    },
  ],
}
