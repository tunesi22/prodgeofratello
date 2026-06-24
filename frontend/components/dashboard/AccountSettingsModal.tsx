'use client'

import { type ReactElement } from 'react'
import { X, SignOut } from '@phosphor-icons/react/dist/ssr'
import { useTheme } from '@/components/providers/ThemeProvider'
import { useLanguage, type Lang } from '@/components/providers/LanguageProvider'
import { cn } from '@/lib/cn'

type Theme = 'light' | 'dark'

/**
 * Account settings modal. Opened from the dashboard so settings stay in place
 * (no jarring navigation into the sidebar shell). Surfaces the essentials:
 * account, theme, language, logout. Full settings still live at /settings.
 */
const COPY = {
  id: {
    title: 'Pengaturan Akun',
    close: 'Tutup',
    account: 'Akun',
    theme: 'Tema',
    light: 'Terang',
    dark: 'Gelap',
    language: 'Bahasa',
    logout: 'Keluar',
  },
  en: {
    title: 'Account Settings',
    close: 'Close',
    account: 'Account',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    language: 'Language',
    logout: 'Log out',
  },
} as const

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: ReadonlyArray<{ v: T; label: string }>
  onChange: (v: T) => void
}): ReactElement {
  return (
    <div className="flex items-center gap-0.5 rounded-circle border border-neutral-primary bg-secondary p-0.5">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          aria-pressed={value === o.v}
          className={cn(
            'rounded-circle px-3.5 py-1 text-label-medium font-medium transition-colors duration-200 ease-standard',
            value === o.v ? 'bg-card text-primary shadow-sm' : 'text-tertiary hover:text-primary',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function AccountSettingsModal({
  email,
  plan,
  onLogout,
  onClose,
}: {
  email: string
  plan: string
  onLogout: () => void
  onClose: () => void
}): ReactElement {
  const { theme, setTheme } = useTheme()
  const { lang, setLang } = useLanguage()
  const t = COPY[lang]
  const planLabel = plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="w-full max-w-md rounded-token-16 border border-neutral-primary bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-h5 font-semibold tracking-tight text-primary">{t.title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="flex size-8 items-center justify-center rounded-token-8 text-icon-dark-gray transition-colors duration-200 ease-standard hover:bg-btn-ghost-pressed hover:text-primary"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 rounded-token-12 border border-neutral-primary p-3.5">
          <div className="min-w-0">
            <p className="text-label-medium text-tertiary">{t.account}</p>
            <p className="truncate text-paragraph-medium font-medium text-primary">{email || '-'}</p>
          </div>
          {planLabel !== '' && (
            <span className="inline-flex shrink-0 items-center rounded-token-8 border border-brand-token bg-display-brand px-2.5 py-0.5 text-label-medium font-medium text-brand-token">
              {planLabel}
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-col divide-y divide-[var(--border-neutral-primary)]">
          <div className="flex items-center justify-between py-3.5">
            <span className="text-paragraph-medium font-medium text-primary">{t.theme}</span>
            <Segmented<Theme>
              value={theme}
              onChange={setTheme}
              options={[{ v: 'light', label: t.light }, { v: 'dark', label: t.dark }]}
            />
          </div>
          <div className="flex items-center justify-between py-3.5">
            <span className="text-paragraph-medium font-medium text-primary">{t.language}</span>
            <Segmented<Lang>
              value={lang}
              onChange={setLang}
              options={[{ v: 'id', label: 'ID' }, { v: 'en', label: 'EN' }]}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-token-8 border border-neutral-primary py-2.5 text-action-small font-medium text-primary transition-colors duration-200 ease-standard hover:bg-btn-ghost-pressed"
        >
          <SignOut className="size-5" aria-hidden="true" />
          {t.logout}
        </button>
      </div>
    </div>
  )
}
