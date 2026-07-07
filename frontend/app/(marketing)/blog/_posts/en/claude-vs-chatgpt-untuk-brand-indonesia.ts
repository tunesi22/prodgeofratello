import type { Post } from '../types'

export const post: Post = {
  slug: 'claude-vs-chatgpt-untuk-brand-indonesia',
  category: 'Research',
  date: '2026-06-23',
  title: 'Claude vs ChatGPT: Which One Recommends Indonesian Local Brands More Often?',
  excerpt:
    'Every AI engine has a different way of choosing which brand to mention. Here are the findings from an analysis of 10,000 prompts against Claude and ChatGPT for Indonesian brands.',
  sections: [
    {
      body: 'Claude (Anthropic) and ChatGPT (OpenAI) are the two AI engines with the largest user base in Indonesia. But do they recommend brands the same way? The Fratello research team analyzed 10,000 relevant prompts for Indonesian brands and found some interesting differences.',
    },
    {
      heading: 'Differences in how each picks its sources',
      body: 'ChatGPT tends to lean more on training data and existing knowledge, while Claude, with its web search capability, actively looks up current information. That means for a brand that recently picked up a lot of media coverage or positive reviews in the past few months, Claude is more likely to catch that recent momentum.',
    },
    {
      heading: 'Differences in recommendation style',
      body: 'ChatGPT tends to give a longer list with a brief explanation per brand. Claude tends to give a shorter list, but with deeper, more nuanced explanations. The implication: a brand that wants to get mentioned by ChatGPT needs a consistent presence across many places, while for Claude, deep, well-documented information about the brand from one strong source can be more effective.',
    },
    {
      heading: 'A surprising finding: local brands get mentioned more by Claude',
      body: 'From our analysis, Claude consistently mentions more Indonesian local brands than ChatGPT for the same query. Our hypothesis: Claude has a lower threshold for mentioning a brand that is not globally known but strong locally, while ChatGPT is more biased toward brands that are already known internationally.',
    },
    {
      heading: 'Practical implications',
      body: 'An optimal GEO strategy has to account for each engine\'s characteristics. There is no one-size-fits-all approach. A brand that wants maximum results should track its visibility across every engine separately and adjust content strategy based on the data from each platform.',
    },
  ],
}
