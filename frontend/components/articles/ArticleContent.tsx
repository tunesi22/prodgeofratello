'use client'

import { createElement, type ReactElement, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Renders an article's markdown as a real, readable article, no raw `#` or `**`
 * on screen. Intentionally dependency-free and XSS-safe: it builds React
 * elements from a small markdown subset and NEVER uses dangerouslySetInnerHTML,
 * so LLM-generated content can't inject markup.
 *
 * Supported: headings (#..######), bold (**\/__), italic (*\/_), inline code,
 * links, unordered + ordered lists, blockquotes, fenced code blocks, and
 * horizontal rules. Anything unrecognised renders as plain paragraph text.
 */

export interface ArticleContentProps {
  content: string
  /** Drop a leading "# Title" so it doesn't duplicate the reader's own title. */
  omitFirstH1?: boolean
  className?: string
}

/** Only allow links our reader should open; everything else renders as text. */
const SAFE_HREF = /^(https?:\/\/|mailto:|\/)/i

/** Heading visual per level (semantic tag is derived separately). */
const HEADING_CLASS: Record<number, string> = {
  1: 'text-h3 font-semibold text-primary mt-10 mb-4',
  2: 'text-h4 font-semibold text-primary mt-8 mb-3',
  3: 'text-h5 font-semibold text-primary mt-6 mb-2',
  4: 'text-h6 font-semibold text-primary mt-6 mb-2',
  5: 'text-h6 font-medium text-primary mt-4 mb-2',
  6: 'text-h6 font-medium text-secondary mt-4 mb-2',
}

/** Parse inline spans (bold/italic/code/link) into React nodes. */
function parseInline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = []
  let rest = text
  let n = 0

  while (rest.length > 0) {
    const code = /`([^`]+)`/.exec(rest)
    const link = /\[([^\]]+)\]\(([^)\s]+)\)/.exec(rest)
    const bold = /\*\*([^*]+)\*\*|__([^_]+)__/.exec(rest)
    const ital = /\*([^*]+)\*|_([^_]+)_/.exec(rest)

    const candidates = [
      code && { kind: 'code' as const, m: code, idx: code.index },
      link && { kind: 'link' as const, m: link, idx: link.index },
      bold && { kind: 'bold' as const, m: bold, idx: bold.index },
      ital && { kind: 'ital' as const, m: ital, idx: ital.index },
    ].filter(Boolean) as { kind: 'code' | 'link' | 'bold' | 'ital'; m: RegExpExecArray; idx: number }[]

    if (candidates.length === 0) {
      out.push(rest)
      break
    }

    // Earliest match wins; ties resolve by the array order above (code first).
    candidates.sort((a, b) => a.idx - b.idx)
    const hit = candidates[0]
    const { m, idx } = hit
    const key = `${keyBase}-${n++}`

    if (idx > 0) out.push(rest.slice(0, idx))

    if (hit.kind === 'code') {
      out.push(
        <code key={key} className="rounded-token-4 bg-secondary px-1 py-0.5 text-primary">
          {m[1]}
        </code>,
      )
    } else if (hit.kind === 'link') {
      const href = m[2]
      out.push(
        SAFE_HREF.test(href) ? (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-token underline underline-offset-2 transition-opacity duration-200 ease-standard hover:opacity-80"
          >
            {parseInline(m[1], key)}
          </a>
        ) : (
          m[1]
        ),
      )
    } else if (hit.kind === 'bold') {
      out.push(
        <strong key={key} className="font-semibold text-primary">
          {parseInline(m[1] ?? m[2], key)}
        </strong>,
      )
    } else {
      out.push(
        <em key={key} className="italic">
          {parseInline(m[1] ?? m[2], key)}
        </em>,
      )
    }

    rest = rest.slice(idx + m[0].length)
  }

  return out
}

const isSpecial = (line: string): boolean =>
  /^(#{1,6})\s+/.test(line) ||
  /^```/.test(line.trim()) ||
  /^>\s?/.test(line) ||
  /^\s*[-*+]\s+/.test(line) ||
  /^\s*\d+\.\s+/.test(line) ||
  /^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())

export function ArticleContent({ content, omitFirstH1 = false, className }: ArticleContentProps): ReactElement {
  const lines = content.replace(/\r\n/g, '\n').split('\n')
  const blocks: ReactNode[] = []
  let i = 0
  let key = 0
  let firstH1Skipped = false

  while (i < lines.length) {
    const line = lines[i]

    if (line.trim() === '') {
      i++
      continue
    }

    // Fenced code block.
    if (/^```/.test(line.trim())) {
      const buf: string[] = []
      i++
      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        buf.push(lines[i])
        i++
      }
      i++ // closing fence
      blocks.push(
        <pre
          key={`b${key++}`}
          className="my-4 overflow-x-auto rounded-token-8 border border-neutral-primary bg-secondary p-4 text-paragraph-medium text-primary"
        >
          <code>{buf.join('\n')}</code>
        </pre>,
      )
      continue
    }

    // Heading.
    const h = /^(#{1,6})\s+(.*)$/.exec(line)
    if (h) {
      const level = h[1].length
      if (omitFirstH1 && level === 1 && !firstH1Skipped) {
        firstH1Skipped = true
        i++
        continue
      }
      blocks.push(
        createElement(
          `h${Math.min(level, 6)}`,
          { key: `b${key++}`, className: HEADING_CLASS[level] },
          parseInline(h[2], `b${key}`),
        ),
      )
      i++
      continue
    }

    // Horizontal rule.
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      blocks.push(<hr key={`b${key++}`} className="my-8 border-neutral-primary" />)
      i++
      continue
    }

    // Blockquote.
    if (/^>\s?/.test(line)) {
      const buf: string[] = []
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ''))
        i++
      }
      blocks.push(
        <blockquote
          key={`b${key++}`}
          className="my-4 border-l-2 border-brand-token pl-4 text-paragraph-big italic leading-7 text-secondary"
        >
          {parseInline(buf.join(' '), `b${key}`)}
        </blockquote>,
      )
      continue
    }

    // Unordered list.
    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*+]\s+/, ''))
        i++
      }
      blocks.push(
        <ul key={`b${key++}`} className="my-4 list-disc space-y-2 pl-6 marker:text-tertiary">
          {items.map((it, idx) => (
            <li key={idx} className="text-paragraph-big leading-7 text-primary">
              {parseInline(it, `b${key}-${idx}`)}
            </li>
          ))}
        </ul>,
      )
      continue
    }

    // Ordered list.
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''))
        i++
      }
      blocks.push(
        <ol key={`b${key++}`} className="my-4 list-decimal space-y-2 pl-6 marker:text-tertiary">
          {items.map((it, idx) => (
            <li key={idx} className="text-paragraph-big leading-7 text-primary">
              {parseInline(it, `b${key}-${idx}`)}
            </li>
          ))}
        </ol>,
      )
      continue
    }

    // Paragraph: gather consecutive plain lines.
    const buf: string[] = [line]
    i++
    while (i < lines.length && lines[i].trim() !== '' && !isSpecial(lines[i])) {
      buf.push(lines[i])
      i++
    }
    blocks.push(
      <p key={`b${key++}`} className="my-4 text-paragraph-big leading-7 text-primary">
        {parseInline(buf.join(' '), `b${key}`)}
      </p>,
    )
  }

  return <div className={cn('[&>*:first-child]:mt-0', className)}>{blocks}</div>
}
