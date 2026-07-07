import type { ReactElement } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { posts, getPostBySlug } from '../../../blog/_posts/en'
import { pageMetadata } from '@/lib/marketing/seo'

type Props = { params: Promise<{ slug: string }> }

const dateFmt = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' })

export async function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}
  return pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    lang: 'en',
  })
}

export default async function BlogPostPage({ params }: Props): Promise<ReactElement> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const others = posts.filter((p) => p.slug !== slug && p.category === post.category).slice(0, 4)

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#021a0e] pb-14 pt-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,#0d6b3a33,transparent)]" />
        <div className="relative mx-auto max-w-[760px] px-6">
          <Link
            href="/en/blog"
            className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-300 transition-colors hover:text-white-remain"
          >
            &larr; Back to Blog
          </Link>
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-full border border-brand-600/40 bg-brand-700/30 px-3 py-0.5 text-[12px] font-medium text-brand-200">
              {post.category}
            </span>
            <span className="text-[13px] text-brand-400">{dateFmt.format(new Date(post.date))}</span>
          </div>
          <h1 className="font-serif text-[32px] leading-tight tracking-tight text-white-remain sm:text-[42px]">
            {post.title}
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-brand-200">{post.excerpt}</p>
        </div>
      </section>

      {/* Article body */}
      <article className="mx-auto max-w-[760px] px-6 py-14">
        {post.sections.map((section, i) => (
          <>
            <div key={i} className="mb-8">
              {section.heading && (
                <h2 className="mb-3 text-[22px] font-semibold text-gray-900">{section.heading}</h2>
              )}
              <p className="text-[16px] leading-[1.8] text-gray-600">{section.body}</p>
            </div>

            {/* Mid-article CTA after section 3 */}
            {i === 2 && post.sections.length > 4 && (
              <div className="my-10 rounded-2xl border border-brand-100 bg-brand-50 px-7 py-6">
                <p className="text-[13px] font-semibold uppercase tracking-wide text-brand-600">
                  Fratello — GEO Platform
                </p>
                <p className="mt-1.5 text-[17px] font-semibold text-gray-900">
                  Already know if your brand gets mentioned by ChatGPT or Gemini?
                </p>
                <p className="mt-2 text-[14px] leading-relaxed text-gray-500">
                  Fratello tracks your brand's visibility across 4 AI engines at once, automatically, every week.
                </p>
                <Link
                  href="/fratello"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-700 px-5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-brand-800"
                >
                  Try it free &rarr;
                </Link>
              </div>
            )}
          </>
        ))}
      </article>

      {/* Bottom CTA banner */}
      <div className="mx-auto max-w-[760px] px-6 pb-14">
        <div className="relative overflow-hidden rounded-2xl bg-[#021a0e] px-8 py-10 text-center">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,#0d6b3a44,transparent)]" />
          <div className="relative">
            <p className="text-[13px] font-semibold uppercase tracking-widest text-brand-400">
              Get started
            </p>
            <h2 className="mt-2 font-serif text-[26px] leading-snug text-white-remain sm:text-[30px]">
              Monitor your brand's visibility<br />across every AI engine in one dashboard
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-brand-200">
              ChatGPT, Gemini, Perplexity, Claude — Fratello audits all four automatically and shows you exactly where your brand stands.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/fratello"
                className="rounded-full bg-brand-500 px-6 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-brand-400"
              >
                Start for free
              </Link>
              <Link
                href="/fratello"
                className="rounded-full border border-brand-600/50 px-6 py-2.5 text-[14px] font-medium text-brand-200 transition-colors hover:border-brand-400 hover:text-white-remain"
              >
                See pricing
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-auto max-w-[760px] border-t border-gray-100 px-6" />

      {/* Other articles */}
      {others.length > 0 && (
        <section className="mx-auto max-w-[760px] px-6 py-14">
          <h3 className="mb-6 text-[18px] font-semibold text-gray-900">More articles</h3>
          <div className="flex flex-col gap-4">
            {others.map((other) => (
              <Link
                key={other.slug}
                href={`/en/blog/${other.slug}`}
                className="group flex flex-col gap-1 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-medium text-brand-700">
                    {other.category}
                  </span>
                  <span className="text-[12px] text-gray-400">{dateFmt.format(new Date(other.date))}</span>
                </div>
                <p className="text-[15px] font-semibold text-gray-800 group-hover:text-brand-700 transition-colors">
                  {other.title}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
