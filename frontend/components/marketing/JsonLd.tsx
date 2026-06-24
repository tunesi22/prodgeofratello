import type { ReactElement } from 'react'

/**
 * Renders one or more JSON-LD blocks as <script type="application/ld+json">.
 * Server-rendered so crawlers see it in the raw HTML (important: Fratello's own
 * GEO audit reads raw HTML, so the marketing site must pass its own test).
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }): ReactElement {
  const blocks = Array.isArray(data) ? data : [data]
  return (
    <>
      {blocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  )
}
