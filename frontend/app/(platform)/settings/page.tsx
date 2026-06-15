'use client'

import { useEffect, useState } from 'react'
import type { FormEvent, ReactElement } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { fadeUp } from '@/lib/motion'
import { useApiFetch } from '@/lib/useApiFetch'
import { Button, Checkbox, Chip, Input, Radio, Tabs, Toggle } from '@/components/ui'
import type { ChipType } from '@/components/ui'
import {
  Card,
  ErrorBanner,
  PageContainer,
  PageHeader,
  Section,
  Skeleton,
} from '@/components/dashboard/primitives'
import { useTheme } from '@/components/providers/ThemeProvider'
import { useLanguage } from '@/components/providers/LanguageProvider'
import type { Lang } from '@/components/providers/LanguageProvider'
import { MoonIcon, SunIcon } from '@/components/onboarding/icons'

interface UserSettings {
  email: string
  plan: string
  alertThreshold: number
  alertEmail: boolean
  alertWhatsApp: boolean
  whatsappNumber: string
}

const PLAN_LABELS: Record<string, string> = {
  starter: 'Starter',
  pro: 'Pro',
  agency: 'Agency',
}

// Legacy plan badges (starter gray / pro blue / agency purple) have no token
// equivalents. Mapped onto DS chip variants: neutral / success(brand) / warning.
const PLAN_CHIP_TYPE: Record<string, ChipType> = {
  starter: 'neutral',
  pro: 'success',
  agency: 'warning',
}

/**
 * Sensitivity presets replacing the raw "Drop threshold (%)" number input.
 * Same backend field (alertThreshold, PATCH /user/me), human wording on top:
 * the value is the weekly mention-rate drop (in percent) that triggers an alert.
 */
const ALERT_PRESETS = [5, 20, 50] as const

/** Page copy, both languages. Indonesian uses the formal "Anda" register. */
const COPY = {
  id: {
    title: 'Pengaturan Akun',
    subtitle: 'Atur akun, tampilan, bahasa, dan notifikasi Anda',
    plan: 'Paket',
    currentPlan: 'Paket Anda saat ini',
    manageBilling: 'Atur Tagihan',
    appearance: 'Tampilan',
    theme: 'Tema',
    light: 'Terang',
    dark: 'Gelap',
    themeAria: 'Ganti tema gelap',
    language: 'Bahasa',
    languageHint: 'Pilih bahasa untuk seluruh aplikasi',
    alerts: 'Notifikasi',
    alertsIntro:
      'Kami memantau seberapa sering AI menyebut brand Anda. Jika angkanya turun dibanding minggu sebelumnya, kami mengirim pemberitahuan kepada Anda.',
    sensitivity: 'Kapan kami perlu memberi tahu Anda?',
    presetLabels: {
      5: 'Setiap ada penurunan, sekecil apa pun',
      20: 'Hanya penurunan yang cukup berarti (disarankan)',
      50: 'Hanya penurunan besar',
    } as Record<number, string>,
    customCurrent: (n: number): string => `Pengaturan saat ini: penurunan ${n}%`,
    emailAlerts: 'Kirim pemberitahuan lewat email',
    waAlerts: 'Kirim pemberitahuan lewat WhatsApp',
    waNumber: 'Nomor WhatsApp',
    save: 'Simpan',
    saving: 'Menyimpan...',
    saved: 'Tersimpan!',
    retry: 'Coba lagi',
    loadFailed: 'Gagal memuat pengaturan',
    saveFailed: 'Gagal menyimpan pengaturan',
  },
  en: {
    title: 'Account Settings',
    subtitle: 'Manage your account, appearance, language, and notifications',
    plan: 'Plan',
    currentPlan: 'Your current plan',
    manageBilling: 'Manage Billing',
    appearance: 'Appearance',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    themeAria: 'Toggle dark mode',
    language: 'Language',
    languageHint: 'Choose the language for the whole app',
    alerts: 'Notifications',
    alertsIntro:
      'We keep an eye on how often AI mentions your brand. If that number drops compared to the week before, we send you a notification.',
    sensitivity: 'When should we notify you?',
    presetLabels: {
      5: 'Any drop, even a small one',
      20: 'Only meaningful drops (recommended)',
      50: 'Only big drops',
    } as Record<number, string>,
    customCurrent: (n: number): string => `Current setting: ${n}% drop`,
    emailAlerts: 'Send notifications by email',
    waAlerts: 'Send notifications by WhatsApp',
    waNumber: 'WhatsApp number',
    save: 'Save',
    saving: 'Saving...',
    saved: 'Saved!',
    retry: 'Retry',
    loadFailed: 'Could not load your settings',
    saveFailed: 'Could not save your settings',
  },
} as const

export default function SettingsPage(): ReactElement {
  const apiFetch = useApiFetch()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const { lang, setLang } = useLanguage()
  const t = COPY[lang]

  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function loadSettings(): Promise<void> {
    setLoadError(null)
    try {
      const data = await apiFetch<UserSettings>('/user/me')
      setSettings(data)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : t.loadFailed)
    }
  }

  useEffect(() => {
    void loadSettings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSave(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    if (!settings) return
    setSaving(true)
    setSaveError(null)
    try {
      await apiFetch('/user/me', {
        method: 'PATCH',
        body: JSON.stringify({
          alertThreshold: settings.alertThreshold,
          alertEmail: settings.alertEmail,
          alertWhatsApp: settings.alertWhatsApp,
          whatsappNumber: settings.whatsappNumber,
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : t.saveFailed)
    } finally {
      setSaving(false)
    }
  }

  const header = <PageHeader title={t.title} subtitle={t.subtitle} />

  if (loadError != null) {
    return (
      <PageContainer>
        {header}
        <motion.div variants={fadeUp} className="flex w-full flex-col items-start gap-4">
          <ErrorBanner message={loadError} />
          <Button type="ghost" onClick={() => void loadSettings()}>
            {t.retry}
          </Button>
        </motion.div>
      </PageContainer>
    )
  }

  if (!settings) {
    return (
      <PageContainer>
        {header}
        <motion.div variants={fadeUp} className="flex w-full flex-col gap-5">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-72 w-full" />
        </motion.div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      {header}

      {/* Plan */}
      <Section title={t.plan}>
        <Card className="flex items-center justify-between gap-4 p-5">
          <div className="flex flex-col items-start gap-2">
            <span className="text-label-medium font-medium text-tertiary transition-colors duration-200 ease-standard">
              {t.currentPlan}
            </span>
            <Chip type={PLAN_CHIP_TYPE[settings.plan] ?? 'neutral'} size="sm">
              {PLAN_LABELS[settings.plan] ?? settings.plan}
            </Chip>
          </div>
          <Button type="ghost" onClick={() => router.push('/settings/billing')}>
            {t.manageBilling}
          </Button>
        </Card>
      </Section>

      {/* Appearance */}
      <Section title={t.appearance}>
        <Card className="flex items-center justify-between gap-4 p-5">
          <span className="text-paragraph-medium text-primary transition-colors duration-200 ease-standard">
            {t.theme}
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 text-paragraph-medium text-secondary transition-colors duration-200 ease-standard">
              {theme === 'light' ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
              {theme === 'light' ? t.light : t.dark}
            </span>
            <Toggle checked={theme === 'dark'} onChange={toggleTheme} aria-label={t.themeAria} />
          </div>
        </Card>
      </Section>

      {/* Language */}
      <Section title={t.language}>
        <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-paragraph-medium text-secondary transition-colors duration-200 ease-standard">
            {t.languageHint}
          </span>
          <Tabs
            items={[
              { id: 'id', label: 'Bahasa Indonesia' },
              { id: 'en', label: 'English' },
            ]}
            activeId={lang}
            onChange={(id) => setLang(id as Lang)}
            aria-label={t.language}
          />
        </Card>
      </Section>

      {/* Alert preferences */}
      <Section title={t.alerts}>
        <Card className="p-5">
          <form onSubmit={handleSave} className="flex w-full flex-col gap-5">
            <p className="text-paragraph-medium text-secondary transition-colors duration-200 ease-standard">
              {t.alertsIntro}
            </p>

            {/* Sensitivity presets replace the technical "Drop threshold (%)"
                number input. Same alertThreshold field and PATCH payload. */}
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-3 text-field-label font-semibold text-secondary transition-colors duration-200 ease-standard">
                {t.sensitivity}
              </legend>
              {ALERT_PRESETS.map((preset) => (
                <label key={preset} className="flex cursor-pointer items-center gap-3">
                  <Radio
                    name="alert-sensitivity"
                    checked={settings.alertThreshold === preset}
                    onChange={() => setSettings({ ...settings, alertThreshold: preset })}
                    aria-label={t.presetLabels[preset]}
                  />
                  <span className="text-paragraph-medium text-primary transition-colors duration-200 ease-standard">
                    {t.presetLabels[preset]}
                  </span>
                </label>
              ))}
              {!ALERT_PRESETS.includes(settings.alertThreshold as (typeof ALERT_PRESETS)[number]) &&
                !Number.isNaN(settings.alertThreshold) && (
                  <span className="text-paragraph-medium text-tertiary">
                    {t.customCurrent(settings.alertThreshold)}
                  </span>
                )}
            </fieldset>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={settings.alertEmail}
                  onChange={(checked) => setSettings({ ...settings, alertEmail: checked })}
                  aria-label={t.emailAlerts}
                />
                <span
                  className="cursor-pointer text-paragraph-medium text-primary transition-colors duration-200 ease-standard"
                  onClick={() => setSettings({ ...settings, alertEmail: !settings.alertEmail })}
                >
                  {t.emailAlerts}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  checked={settings.alertWhatsApp}
                  onChange={(checked) => setSettings({ ...settings, alertWhatsApp: checked })}
                  aria-label={t.waAlerts}
                />
                <span
                  className="cursor-pointer text-paragraph-medium text-primary transition-colors duration-200 ease-standard"
                  onClick={() => setSettings({ ...settings, alertWhatsApp: !settings.alertWhatsApp })}
                >
                  {t.waAlerts}
                </span>
              </div>
            </div>

            {settings.alertWhatsApp && (
              <Input
                label={t.waNumber}
                type="text"
                value={settings.whatsappNumber || ''}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                placeholder="628123456789"
              />
            )}

            {saveError != null && <ErrorBanner message={saveError} />}

            <div className="flex items-center gap-3 pt-1">
              <Button htmlType="submit" type="primary" disabled={saving}>
                {saving ? t.saving : t.save}
              </Button>
              {saved && (
                <span className="text-paragraph-medium text-brand-token transition-colors duration-200 ease-standard">
                  {t.saved}
                </span>
              )}
            </div>
          </form>
        </Card>
      </Section>
    </PageContainer>
  )
}
