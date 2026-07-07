import type { Post } from '../types'

export const post: Post = {
  slug: 'ai-crawler-gptbot-claudebot-perplexitybot-panduan',
  category: 'Guide',
  date: '2026-07-04',
  title: 'Meet the AI Crawlers: GPTBot, ClaudeBot, PerplexityBot, and How to Manage Them',
  excerpt:
    'Before your brand can be mentioned by AI, your site has to actually be crawlable by AI crawlers. Get to know these bots and make sure you are not accidentally blocking them.',
  sections: [
    {
      body: 'Every AI engine that answers questions using web data has its own crawler to gather fresh information from the internet. Unfortunately, a lot of websites accidentally block these crawlers through an overly strict robots.txt configuration or firewall, making that brand effectively invisible to AI.',
    },
    {
      heading: 'The main AI crawlers you should know',
      body: 'GPTBot (OpenAI) crawls content to train and enrich ChatGPT\'s answers. ClaudeBot (Anthropic) does the same for Claude. PerplexityBot indexes content in real time to answer Perplexity queries. Googlebot itself is now also a data source for Gemini and AI Overview. Each has a user-agent you can identify in your server\'s access logs.',
    },
    {
      heading: 'How to check whether AI crawlers can access your site',
      body: 'Check your robots.txt file at yourdomain.com/robots.txt. If there is a "Disallow: /" line with no exception for the AI user-agents above, that crawler cannot read your content at all. You can also check your server access logs to see whether these bots have actually visited your site in the last 30 days.',
    },
    {
      heading: 'The recommended configuration',
      body: 'For a brand that wants to maximize AI visibility, allow full access to public pages (product, blog, about us) while still blocking sensitive pages like internal dashboards, checkout pages, or customer data. This is exactly the same principle as robots.txt for Googlebot, just extended to cover AI user-agents too.',
    },
    {
      heading: 'Do not let your content get blocked without realizing it',
      body: 'Some hosting providers and CDNs now ship a "block AI crawlers" option turned on by default as a privacy feature, well-intentioned, but it can backfire for a brand that actually wants to be mentioned by AI. Fratello recommends brands explicitly review this configuration at least once a quarter, especially after a hosting migration or a CDN change.',
    },
  ],
}
