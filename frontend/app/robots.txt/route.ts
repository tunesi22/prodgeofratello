import { NextResponse } from 'next/server'

/**
 * Hand-written route (not the `app/robots.ts` metadata convention) because
 * Next.js's typed Robots output only supports allow/disallow/crawlDelay per
 * group — it can't emit a Content-Signal line or repeat the same rule set
 * across several named User-agent blocks, both of which we need below.
 */

const ALLOW = ['/', '/blog', '/about', '/sign-in', '/en', '/en/blog', '/en/about']
const DISALLOW = ['/brands', '/settings', '/usage', '/admin', '/onboarding', '/getting-started', '/api/']

// search=yes, ai-input=yes: fine to be retrieved and quoted in a live AI
// answer, which is the entire point of a GEO product. ai-train=no: don't
// fold this content into a foundation-model training corpus. See
// https://contentsignals.org
const CONTENT_SIGNAL = 'Content-Signal: search=yes, ai-input=yes, ai-train=no'

// Bots that fetch pages live to answer one user's question right now (chat
// search, on-demand browsing). This is the traffic Fratello's whole product
// is about being visible to, so these get an explicit Allow instead of
// relying on the wildcard rule.
const AI_ANSWER_BOTS = ['OAI-SearchBot', 'ChatGPT-User', 'Claude-User', 'Claude-SearchBot', 'PerplexityBot', 'Perplexity-User']

// Bots that harvest pages into a training corpus, listed separately so the
// ai-train=no signal above is unambiguous about which crawlers it targets.
const AI_TRAINING_BOTS = ['GPTBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended', 'meta-externalagent']

function group(userAgents: string[]): string {
  return [
    ...userAgents.map((ua) => `User-agent: ${ua}`),
    CONTENT_SIGNAL,
    ...ALLOW.map((p) => `Allow: ${p}`),
    ...DISALLOW.map((p) => `Disallow: ${p}`),
  ].join('\n')
}

export function GET(): NextResponse {
  const body = `${[group(['*']), group(AI_ANSWER_BOTS), group(AI_TRAINING_BOTS)].join('\n\n')}\n\nSitemap: https://hifratello.com/sitemap.xml\n`

  return new NextResponse(body, {
    status: 200,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
