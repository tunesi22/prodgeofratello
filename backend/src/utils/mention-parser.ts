export interface MentionResult {
  mentioned: boolean
  mentionContext: string
}

export function parseMention(response: string, brandName: string): MentionResult {
  const escaped = brandName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(escaped, 'i')

  if (!regex.test(response)) {
    return { mentioned: false, mentionContext: '' }
  }

  const mentionContext = extractContext(response, regex)
  return { mentioned: true, mentionContext }
}

function extractContext(text: string, regex: RegExp): string {
  // Split into sentences and find the one(s) containing the mention
  const sentences = text.split(/(?<=[.!?])\s+/)
  const matchingSentences = sentences.filter((s) => regex.test(s))

  if (matchingSentences.length === 0) return ''

  // Return up to 2 sentences for context, truncated to 500 chars
  return matchingSentences.slice(0, 2).join(' ').slice(0, 500)
}
