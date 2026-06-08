import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const FEATURES = [
  { title: 'LLM Brand Tracking', desc: 'Query ChatGPT, Gemini, Perplexity & Claude 5x per prompt for statistical accuracy.' },
  { title: 'Analytics Dashboard', desc: 'Mention rate, share of voice, sentiment breakdown, and trend over time.' },
  { title: 'GEO Content Engine', desc: 'Auto-generate AI-optimized articles from your prompt gaps via Claude.' },
  { title: 'Technical GEO Tools', desc: 'llms.txt generator, GEO score audit, nginx bot config, and backlink finder.' },
]

const PLANS = [
  { name: 'Starter', price: '$49', priceIDR: 'Rp 750k', prompts: '25', models: '3 models', articles: '4 articles/mo', cta: 'Get Started' },
  { name: 'Pro', price: '$149', priceIDR: 'Rp 2.25jt', prompts: '100', models: 'All 4 models', articles: '8 articles/mo', cta: 'Go Pro', highlight: true },
  { name: 'Agency', price: '$399', priceIDR: 'Rp 6jt', prompts: 'Unlimited', models: 'All 4 models', articles: 'Unlimited', cta: 'Contact Us' },
]

export default async function LandingPage() {
  const { userId } = await auth()
  if (userId) redirect('/brands')
  redirect('/sign-in')
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <span className="font-bold text-xl tracking-tight">GEO Platform</span>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm text-gray-600 hover:text-black transition-colors">Sign in</Link>
          <Link href="/sign-in" className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-8 py-24 max-w-4xl mx-auto">
        <div className="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          Generative Engine Optimization
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Track how often your brand<br />is mentioned by AI
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Monitor your brand visibility across ChatGPT, Gemini, Perplexity, and Claude.
          Get analytics, identify gaps, and generate AI-optimized content automatically.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/sign-in" className="bg-gray-900 text-white px-7 py-3 rounded-xl text-base font-medium hover:bg-gray-700 transition-colors">
            Start free trial
          </Link>
          <Link href="#pricing" className="border border-gray-200 text-gray-700 px-7 py-3 rounded-xl text-base font-medium hover:border-gray-400 transition-colors">
            See pricing
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">Everything you need for GEO</h2>
          <div className="grid grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-8 py-20 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-3">Simple pricing</h2>
        <p className="text-gray-500 text-center mb-12">Available in USD (global) and IDR (Indonesia)</p>
        <div className="grid grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`rounded-2xl p-6 border ${plan.highlight ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200'}`}>
              <p className={`text-sm font-medium mb-4 ${plan.highlight ? 'text-gray-400' : 'text-gray-500'}`}>{plan.name}</p>
              <div className="mb-1">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className={`text-sm ml-1 ${plan.highlight ? 'text-gray-400' : 'text-gray-400'}`}>/mo</span>
              </div>
              <p className={`text-sm mb-6 ${plan.highlight ? 'text-gray-500' : 'text-gray-400'}`}>{plan.priceIDR}/mo</p>
              <ul className={`space-y-2 text-sm mb-8 ${plan.highlight ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>✓ {plan.prompts} prompts</li>
                <li>✓ {plan.models}</li>
                <li>✓ {plan.articles}</li>
                <li>✓ All GEO tools</li>
                <li>✓ Auto-scan scheduling</li>
              </ul>
              <Link
                href="/sign-in"
                className={`block text-center py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  plan.highlight
                    ? 'bg-white text-gray-900 hover:bg-gray-100'
                    : 'bg-gray-900 text-white hover:bg-gray-700'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-8 py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} GEO Platform. All rights reserved.
      </footer>
    </div>
  )
}
