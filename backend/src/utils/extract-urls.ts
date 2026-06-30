const URL_REGEX = /https?:\/\/[^\s<>"')\]},]+/g

export function extractUrls(text: string): string[] {
  const matches = text.match(URL_REGEX) ?? []
  return [...new Set(
    matches.map((u) => u.replace(/[.,;:!?]+$/, ''))
  )]
}
