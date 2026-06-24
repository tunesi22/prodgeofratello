import type { ReactElement, ReactNode } from 'react'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'

/**
 * Public marketing shell (hifratello.com). Sits inside the root layout (theme +
 * providers) and wraps every marketing route with the fixed nav and footer. The
 * nav is fixed/transparent, so each page opens with its own colored header
 * section for the nav to sit over.
 */
export default function MarketingLayout({ children }: { children: ReactNode }): ReactElement {
  return (
    // Public marketing pages are always light, regardless of the saved theme.
    <div data-theme="light" className="flex min-h-screen flex-col bg-primary">
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  )
}
