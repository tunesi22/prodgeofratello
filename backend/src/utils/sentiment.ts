import type { Sentiment } from '../../../shared/constants'

const POSITIVE_WORDS = [
  'best', 'great', 'excellent', 'top', 'leading', 'recommended', 'popular',
  'trusted', 'reliable', 'outstanding', 'innovative', 'superior', 'preferred',
  'highly rated', 'well-known', 'reputable', 'strong', 'impressive',
]

const NEGATIVE_WORDS = [
  'worst', 'bad', 'poor', 'avoid', 'problem', 'issue', 'complaint',
  'unreliable', 'expensive', 'overpriced', 'difficult', 'lacking',
  'disappointing', 'inferior', 'weak', 'limited', 'concerning',
]

export function detectSentiment(context: string): Sentiment {
  if (!context) return 'neutral'

  const lower = context.toLowerCase()

  let positiveScore = 0
  let negativeScore = 0

  for (const word of POSITIVE_WORDS) {
    if (lower.includes(word)) positiveScore++
  }
  for (const word of NEGATIVE_WORDS) {
    if (lower.includes(word)) negativeScore++
  }

  if (positiveScore > negativeScore) return 'positive'
  if (negativeScore > positiveScore) return 'negative'
  return 'neutral'
}
