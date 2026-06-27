import type { ReactElement } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Blog - Fratello',
  description: 'Insight, strategi, dan panduan seputar GEO (Generative Engine Optimization) dari tim Fratello.',
}

const posts = [
  {
    slug: 'apa-itu-geo',
    category: 'Panduan',
    date: '20 Juni 2026',
    title: 'Apa itu GEO? Panduan Lengkap Generative Engine Optimization',
    excerpt:
      'GEO adalah praktik mengoptimalkan konten brand agar direkomendasikan oleh mesin AI seperti ChatGPT, Gemini, dan Perplexity -- bukan hanya muncul di hasil pencarian Google.',
  },
  {
    slug: 'mengapa-brand-harus-peduli-ai',
    category: 'Strategi',
    date: '14 Juni 2026',
    title: 'Mengapa Brand Harus Mulai Peduli dengan Visibilitas AI Sekarang',
    excerpt:
      'Setiap bulan lebih dari 2,4 juta pertanyaan tentang produk diajukan ke mesin AI. Jika brand Anda tidak terlihat di sana, pesaing Anda yang akan direkomendasikan.',
  },
  {
    slug: 'cara-kerja-audit-geo',
    category: 'Produk',
    date: '7 Juni 2026',
    title: 'Bagaimana Audit GEO Fratello Bekerja di Balik Layar',
    excerpt:
      'Kami mengirim ratusan prompt ke empat mesin AI setiap minggu untuk mengukur seberapa sering dan seberapa positif brand Anda disebut -- inilah cara kami melakukannya.',
  },
]

export default function BlogPage(): ReactElement {
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

      {/* Posts grid */}
      <section className="mx-auto max-w-[1180px] px-6 py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.slug}
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
            </article>
          ))}
        </div>

        {/* Empty state placeholder for future posts */}
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
