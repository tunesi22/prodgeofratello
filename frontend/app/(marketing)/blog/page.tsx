'use client'

import type { ReactElement } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { posts } from './_posts'

const ALL = 'Semua'

const categories = [ALL, ...Array.from(new Set(posts.map((p) => p.category)))]

export default function BlogPage(): ReactElement {
  const [active, setActive] = useState(ALL)

  const filtered = active === ALL ? posts : posts.filter((p) => p.category === active)

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#021a0e] pb-16 pt-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,#0d6b3a33,transparent)]" />
        <div className="relative mx-auto max-w-[1180px] px-6 text-center">
          <span className="mb-4 inline-block rounded-full border border-brand-600/40 bg-brand-700/30 px-3.5 py-1 text-[13px] font-medium text-brand-200">
            Blog Fratello
          </span>
          <h1 className="mt-3 font-serif text-[40px] leading-tight tracking-tight text-white-remain sm:text-[52px]">
            Insight seputar GEO
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-brand-200">
            Strategi, panduan, dan perspektif dari tim Fratello tentang bagaimana brand bisa terlihat di era mesin AI.
          </p>
        </div>
      </section>

      {/* Category filter */}
      <div className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-[1180px] px-6">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
                  active === cat
                    ? 'bg-brand-700 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts grid */}
      <section className="mx-auto max-w-[1180px] px-6 py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[12px] font-medium text-brand-700">
                  {post.category}
                </span>
                <span className="text-[13px] text-gray-400">{post.date}</span>
              </div>
              <h2 className="mb-3 text-[18px] font-semibold leading-snug text-gray-900 group-hover:text-brand-700 transition-colors duration-200">
                {post.title}
              </h2>
              <p className="flex-1 text-[14px] leading-relaxed text-gray-500">{post.excerpt}</p>
              <div className="mt-5">
                <span className="text-[14px] font-semibold text-brand-600 group-hover:underline">
                  Baca selengkapnya &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-16 text-center text-[14px] text-gray-400">
          Artikel baru akan hadir setiap minggu.{' '}
          <Link href="/#faq" className="text-brand-600 hover:underline">
            Ada pertanyaan?
          </Link>
        </p>
      </section>
    </>
  )
}
