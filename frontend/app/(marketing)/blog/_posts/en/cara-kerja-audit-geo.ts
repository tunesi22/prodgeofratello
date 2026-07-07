import type { Post } from '../types'

export const post: Post = {
  slug: 'cara-kerja-audit-geo',
  category: 'Product',
  date: '2026-06-07',
  title: 'How the Fratello GEO Audit Works Behind the Scenes',
  excerpt:
    'We send hundreds of prompts to four AI engines every week to measure how often, and how positively, your brand is mentioned, here is exactly how we do it.',
  sections: [
    {
      body: 'One of the questions we hear most from new users: "How do you know what AI is saying about my brand?" The answer is a process we call the GEO Audit, and in this article we explain transparently how it works.',
    },
    {
      heading: 'Step 1: Building the prompt bank',
      body: 'Every brand has a different category and context. Before tracking starts, Fratello builds a bank of prompts relevant to that brand. For a local shoe brand, for example, prompts might include: "best local running shoes 2026", "comfortable everyday sneaker recommendations", "Indonesian shoe brand with good quality". This prompt bank is built from keyword research, search trends, and direct input from the brand.',
    },
    {
      heading: 'Step 2: Sending prompts to four AI engines',
      body: 'Fratello sends every prompt to ChatGPT (OpenAI), Gemini (Google), Perplexity, and Claude (Anthropic), the four engines consumers rely on most today. Each engine responds differently: Perplexity leans on real-time web data, while ChatGPT relies more on its training data. That is exactly why a brand needs to be visible across all of them, not just one.',
    },
    {
      heading: 'Step 3: Analyzing the responses',
      body: 'Once responses come back, our system analyzes three things: whether the brand was mentioned at all (mention rate), how positive the mention was, positive, neutral, or negative (sentiment score), and where the brand appeared in the answer (ranking position). This data is collected from every prompt on every engine, producing thousands of data points every month.',
    },
    {
      heading: 'Step 4: Tracking change over time',
      body: 'A single snapshot is not enough. Fratello runs this audit on a recurring basis, ideally weekly, so a brand can see trends: did visibility rise after new content shipped? Did a particular AI engine start mentioning the brand after positive reviews started appearing? These trends are what help a brand understand what is actually working.',
    },
    {
      heading: 'Step 5: Reporting it all in a dashboard',
      body: 'Everything is summarized in the Fratello dashboard, accessible anytime. There is no stale monthly PDF, data refreshes automatically and can be drilled down by engine, by prompt, or by time period. A brand can see exactly where it is strong and where the gaps are that need filling.',
    },
  ],
}
