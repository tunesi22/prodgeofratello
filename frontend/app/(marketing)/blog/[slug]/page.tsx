import type { ReactElement } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { posts, getPostBySlug } from '../_posts'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}
  return {
    title: `${post.title} - Blog Fratello`,
    description: post.excerpt,
  }
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
            href="/blog"
            className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-300 transition-colors hover:text-white-remain"
          >
            &larr; Kembali ke Blog
          </Link>
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-full border border-brand-600/40 bg-brand-700/30 px-3 py-0.5 text-[12px] font-medium text-brand-200">
              {post.category}
            </span>
            <span className="text-[13px] text-brand-400">{post.date}</span>
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
          <div key={i} className="mb-8">
            {section.heading && (
              <h2 className="mb-3 text-[22px] font-semibold text-gray-900">{section.heading}</h2>
            )}
            <p className="text-[16px] leading-[1.8] text-gray-600">{section.body}</p>
          </div>
        ))}
      </article>

      {/* Divider */}
      <div className="mx-auto max-w-[760px] border-t border-gray-100 px-6" />

      {/* Other articles */}
      {others.length > 0 && (
        <section className="mx-auto max-w-[760px] px-6 py-14">
          <h3 className="mb-6 text-[18px] font-semibold text-gray-900">Artikel lainnya</h3>
          <div className="flex flex-col gap-4">
            {others.map((other) => (
              <Link
                key={other.slug}
                href={`/blog/${other.slug}`}
                className="group flex flex-col gap-1 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-medium text-brand-700">
                    {other.category}
                  </span>
                  <span className="text-[12px] text-gray-400">{other.date}</span>
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
