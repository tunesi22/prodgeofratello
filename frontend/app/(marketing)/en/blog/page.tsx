'use client'

import type { ReactElement } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from '@phosphor-icons/react/dist/ssr'
import { Container, HERO_BG } from '@/components/marketing/ui'
import { posts } from '../../blog/_posts/en'

const ALL = 'All'

const categories = [ALL, ...Array.from(new Set(posts.map((p) => p.category)))]

const dateFmt = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' })

export default function BlogPage(): ReactElement {
  const [active, setActive] = useState(ALL)

  const filtered = active === ALL ? posts : posts.filter((p) => p.category === active)

  return (
    <>
      {/* Hero — aligned with the Audit + About heroes. */}
      <section className="relative w-full overflow-hidden" style={{ background: HERO_BG }}>
        <Container className="relative flex min-h-[60vh] flex-col items-center justify-center py-32 text-center">
          <h1 className="max-w-3xl text-h2 font-semibold text-white-remain sm:text-h1">GEO Insights</h1>
          <p className="mx-auto mt-6 max-w-2xl text-h4 font-normal leading-relaxed text-brand-100">
            Strategy, guides, and perspective from the Fratello team on how brands get seen in the age of AI engines.
          </p>
        </Container>
      </section>

      {/* Category filter — extra breathing room above the chips. */}
      <div className="sticky top-0 z-10 bg-primary/85 backdrop-blur-md">
        <Container>
          <div className="flex gap-2 overflow-x-auto pb-4 pt-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActive(cat)}
                className={`shrink-0 rounded-full px-4 py-2 text-label-medium font-medium transition-colors duration-200 ease-standard ${
                  active === cat
                    ? 'bg-brand-600 text-white-remain'
                    : 'bg-secondary text-neutral-500 hover:bg-neutral-100 hover:text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </Container>
      </div>

      {/* Posts grid */}
      <Container className="pb-16 pt-6 lg:pb-20 lg:pt-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <Link
              key={post.slug}
              href={`/en/blog/${post.slug}`}
              className="group flex flex-col rounded-token-24 border border-neutral-primary bg-card p-7 transition-all duration-200 ease-standard hover:-translate-y-0.5 hover:border-brand-token hover:shadow-regular-lg"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-display-brand px-3 py-1 text-label-small font-semibold text-brand-token">
                  {post.category}
                </span>
                <span className="text-label-small text-neutral-500">{dateFmt.format(new Date(post.date))}</span>
              </div>
              <h2 className="mt-4 text-h5 font-semibold leading-snug text-primary transition-colors duration-200 ease-standard group-hover:text-brand-token">
                {post.title}
              </h2>
              <p className="mt-3 flex-1 text-paragraph-medium leading-relaxed text-neutral-500">{post.excerpt}</p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-label-medium font-semibold text-brand-token">
                Read more
                <ArrowRight className="size-4 transition-transform duration-200 ease-standard group-hover:translate-x-0.5" weight="bold" />
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-16 text-center text-paragraph-medium text-neutral-500">
          New articles every week.{' '}
          <Link href="/en#faq" className="font-medium text-brand-token hover:underline">
            Have a question?
          </Link>
        </p>
      </Container>
    </>
  )
}
