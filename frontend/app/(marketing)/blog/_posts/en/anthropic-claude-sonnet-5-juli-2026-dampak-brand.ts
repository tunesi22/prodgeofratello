import type { Post } from '../types'

export const post: Post = {
  slug: 'anthropic-claude-sonnet-5-juli-2026-dampak-brand',
  category: 'News',
  date: '2026-07-15',
  title: 'Claude Sonnet 5 Is Here: What It Means for Brand Visibility in Claude Answers',
  excerpt:
    'Anthropic shipped Claude Sonnet 5 in late June 2026 with much stronger reasoning and web-research ability. For brands, the bar for "GEO-ready" just moved up another notch.',
  sections: [
    {
      body: 'Anthropic officially released Claude Sonnet 5 on June 30, 2026, a model built for agentic coding, tool use, reasoning, and knowledge work at a lower cost. For brands already tracking Claude as one of the four main AI engines to watch, this is not just a technical update, it has a direct effect on how Claude searches for and recommends brands.',
    },
    {
      heading: 'What actually changed in Sonnet 5',
      body: 'Claude Sonnet 5 scores 63.2% on SWE-bench Pro and beats Claude Opus 4.8 on Terminal-Bench 2.1 (80.4% vs 74.6%), priced at $2/$10 per million tokens through August 31, 2026. What matters more for GEO: stronger reasoning and tool use mean Claude can now do deeper, more structured web research before composing an answer, instead of leaning mostly on training data like before.',
    },
    {
      heading: 'A brief drama: Claude Fable 5 briefly disappeared',
      body: 'On June 12, 2026, a US government export-control directive forced Anthropic to suspend Claude Fable 5 and Mythos 5 globally, affecting every user regardless of nationality. The model was restored on July 1, 2026 across the Claude Platform, Claude.ai, Claude Code, and Claude Cowork. The episode is a reminder that AI model availability itself is now news that reaches a mainstream audience, not just developers.',
    },
    {
      heading: 'Why this matters for GEO',
      body: 'Our earlier research found that Claude, compared to ChatGPT, leans more heavily on active web search for current information rather than training data alone. With stronger reasoning in Sonnet 5, that tendency is likely to sharpen further, Claude should get even better at telling apart brands with clean, consistent online data from brands whose information is scattered or outdated.',
    },
    {
      heading: 'What brands should do now',
      body: 'Three priority steps: first, make sure recent brand information (product launches, reviews, media coverage) is actually indexed and easy to find, not buried on pages that rarely get crawled. Second, keep your brand narrative consistent across sources, stronger reasoning also means Claude is better at catching inconsistencies. Third, re-check how your brand gets mentioned by Claude after this update, since recommendation patterns can shift significantly.',
    },
    {
      heading: 'Fratello has already adjusted',
      body: 'Fratello\'s Claude testing prompt bank has been updated to reflect Sonnet 5\'s characteristics, so brands using Fratello can see right away whether their standing in Claude\'s answers has changed since this model shipped.',
    },
  ],
}
