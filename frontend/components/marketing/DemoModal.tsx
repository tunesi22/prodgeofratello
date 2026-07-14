'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactElement,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, CircleNotch, CheckCircle, CalendarCheck } from '@phosphor-icons/react/dist/ssr'
import { Button, Input, TextBox, Dropdown, type DropdownOption } from '@/components/ui'
import { useMarketingLang } from '@/lib/marketing/useMarketingLang'
import { ctaButtonClasses, type ButtonVariant } from './ui'
import { cn } from '@/lib/cn'

/**
 * "Book a demo" modal. A provider mounts a single dialog; any `BookDemoButton`
 * (or `useDemoModal().openDemo`) opens it. The form posts to /api/demo, which
 * emails the sales inbox. Bilingual (follows the site language toggle); fields
 * reuse the DS Input / TextBox / Dropdown / Button.
 */

interface DemoCtx {
  openDemo: () => void
}
const Ctx = createContext<DemoCtx | null>(null)

export function useDemoModal(): DemoCtx {
  const ctx = useContext(Ctx)
  if (ctx == null) throw new Error('useDemoModal must be used within <DemoModalProvider>')
  return ctx
}

export function DemoModalProvider({ children }: { children: ReactNode }): ReactElement {
  const [open, setOpen] = useState(false)
  const openDemo = useCallback(() => setOpen(true), [])
  const closeDemo = useCallback(() => setOpen(false), [])
  const value = useMemo(() => ({ openDemo }), [openDemo])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <Ctx.Provider value={value}>
      {children}
      <AnimatePresence>{open && <DemoDialog onClose={closeDemo} />}</AnimatePresence>
    </Ctx.Provider>
  )
}

/** Styled like a CTAButton, but opens the modal instead of navigating. */
export function BookDemoButton({
  children = 'Book a demo',
  variant = 'light',
  size = 'md',
  className,
  withIcon = false,
}: {
  children?: ReactNode
  variant?: ButtonVariant
  size?: 'md' | 'lg'
  className?: string
  withIcon?: boolean
}): ReactElement {
  const { openDemo } = useDemoModal()
  return (
    <button type="button" onClick={openDemo} className={ctaButtonClasses(variant, size, className)}>
      {withIcon && <CalendarCheck className="size-5" weight="fill" aria-hidden="true" />}
      {children}
    </button>
  )
}

const COUNTRY_CODES: DropdownOption[] = [
  { value: '+62', label: '+62 (ID)' },
  { value: '+1', label: '+1 (US)' },
  { value: '+44', label: '+44 (UK)' },
  { value: '+65', label: '+65 (SG)' },
  { value: '+60', label: '+60 (MY)' },
  { value: '+61', label: '+61 (AU)' },
  { value: '+63', label: '+63 (PH)' },
  { value: '+66', label: '+66 (TH)' },
  { value: '+91', label: '+91 (IN)' },
  { value: '+81', label: '+81 (JP)' },
  { value: '+971', label: '+971 (AE)' },
  { value: '+49', label: '+49 (DE)' },
]

const MODAL_COPY = {
  id: {
    title: 'Jadwalkan Demo',
    subtitle: 'Isi data singkat di bawah ini. Kami akan menghubungi Anda untuk menjadwalkan demo.',
    name: 'Nama',
    namePh: 'Nama lengkap',
    email: 'Email',
    emailPh: 'anda@perusahaan.com',
    phone: 'Nomor telepon',
    phonePh: '81234567890',
    code: 'Kode negara',
    companyType: 'Jenis perusahaan',
    pickType: 'Pilih jenis',
    companySize: 'Ukuran perusahaan',
    pickSize: 'Pilih ukuran',
    source: 'Dari mana Anda mengenal kami?',
    pickSource: 'Pilih sumber',
    message: 'Pesan (opsional)',
    messagePh: 'Ceritakan kebutuhan atau pertanyaan Anda.',
    send: 'Kirim',
    sending: 'Mengirim...',
    successTitle: 'Permintaan terkirim',
    successBody: 'Terima kasih. Tim kami akan menghubungi Anda untuk menjadwalkan demo Fratello GEO.',
    close: 'Tutup',
    errInvalid: 'Mohon lengkapi nama dan email yang valid.',
    errSend: 'Gagal mengirim, silakan coba lagi.',
    errConn: 'Koneksi bermasalah, silakan coba lagi.',
    companyTypes: ['UMKM', 'E-commerce', 'Agensi / Konsultan', 'SaaS & Startup', 'F&B & Restoran', 'Kesehatan & Klinik', 'Properti', 'Media / Publisher', 'Lainnya'],
    companySizes: ['1-10 karyawan', '11-50 karyawan', '51-200 karyawan', '201-500 karyawan', 'Lebih dari 500'],
    sources: ['Pencarian Google', 'Media sosial', 'Rekomendasi / teman', 'Jawaban AI (ChatGPT, Perplexity, dll)', 'Event / webinar', 'Lainnya'],
  },
  en: {
    title: 'Book a demo',
    subtitle: 'Fill in a few details below. We will reach out to schedule your demo.',
    name: 'Name',
    namePh: 'Full name',
    email: 'Email',
    emailPh: 'you@company.com',
    phone: 'Phone number',
    phonePh: '81234567890',
    code: 'Country code',
    companyType: 'Company type',
    pickType: 'Select type',
    companySize: 'Company size',
    pickSize: 'Select size',
    source: 'How did you hear about us?',
    pickSource: 'Select source',
    message: 'Message (optional)',
    messagePh: 'Tell us about your needs or questions.',
    send: 'Send',
    sending: 'Sending...',
    successTitle: 'Request sent',
    successBody: 'Thank you. Our team will reach out to schedule your Fratello GEO demo.',
    close: 'Close',
    errInvalid: 'Please provide a valid name and email.',
    errSend: 'Could not send, please try again.',
    errConn: 'Connection problem, please try again.',
    companyTypes: ['Small business', 'E-commerce', 'Agency / Consultant', 'SaaS & Startup', 'F&B & Restaurant', 'Health & Clinic', 'Property', 'Media / Publisher', 'Other'],
    companySizes: ['1-10 employees', '11-50 employees', '51-200 employees', '201-500 employees', 'More than 500'],
    sources: ['Google search', 'Social media', 'Referral / friend', 'AI answers (ChatGPT, Perplexity, etc.)', 'Event / webinar', 'Other'],
  },
}

type Status = 'idle' | 'sending' | 'success' | 'error'

function toOptions(values: string[]): DropdownOption[] {
  return values.map((v) => ({ value: v, label: v }))
}

function DemoDialog({ onClose }: { onClose: () => void }): ReactElement {
  const { lang } = useMarketingLang()
  const c = MODAL_COPY[lang]

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [dialCode, setDialCode] = useState('+62')
  const [phone, setPhone] = useState('')
  const [companyType, setCompanyType] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [source, setSource] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  const dialogRef = useRef<HTMLDivElement>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)
  const successRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    firstFieldRef.current?.focus()
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const root = dialogRef.current
      if (root == null) return
      const items = root.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
      )
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === first || !root.contains(active))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (active === last || !root.contains(active))) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      opener?.focus?.()
    }
  }, [onClose])

  // Move focus into the dialog when the success state replaces the form.
  useEffect(() => {
    if (status === 'success') successRef.current?.focus()
  }, [status])

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())
  const nameInvalid = status === 'error' && name.trim() === ''
  const emailInvalid = status === 'error' && !emailValid

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault()
    if (status === 'sending') return
    if (name.trim() === '' || !emailValid) {
      setStatus('error')
      setError(c.errInvalid)
      return
    }
    setStatus('sending')
    setError('')
    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone: phone.trim() === '' ? '' : `${dialCode} ${phone.trim()}`,
          companyType,
          companySize,
          source,
          message,
        }),
      })
      if (res.ok) {
        setStatus('success')
      } else {
        const data = await res.json().catch(() => ({}))
        setStatus('error')
        setError(data.error || c.errSend)
      }
    } catch {
      setStatus('error')
      setError(c.errConn)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end justify-center overflow-y-auto bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-title"
        className="relative w-full max-w-2xl rounded-t-token-24 border border-neutral-primary bg-card p-7 sm:rounded-token-24 sm:p-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.3, ease: [0.5, 0, 0.2, 1] }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={c.close}
          className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-token-8 text-icon-dark-gray transition-colors hover:bg-secondary hover:text-primary"
        >
          <X className="size-5" />
        </button>

        {status === 'success' ? (
          <div ref={successRef} tabIndex={-1} role="status" aria-live="polite" className="flex flex-col items-center gap-4 py-10 text-center outline-none">
            <span className="flex size-14 items-center justify-center rounded-full bg-display-brand text-icon-brand">
              <CheckCircle className="size-8" weight="fill" />
            </span>
            <h2 className="text-h4 font-semibold text-primary">{c.successTitle}</h2>
            <p className="max-w-sm text-paragraph-medium text-neutral-500">{c.successBody}</p>
            <Button htmlType="button" size="lg" className="mt-2 w-full" onClick={onClose}>
              {c.close}
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6 pr-8">
              <h2 id="demo-title" className="text-h3 font-semibold tracking-tight text-primary">
                {c.title}
              </h2>
              <p className="mt-1.5 text-paragraph-medium text-neutral-500">{c.subtitle}</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  ref={firstFieldRef}
                  label={c.name}
                  required
                  placeholder={c.namePh}
                  value={name}
                  error={nameInvalid}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  label={c.email}
                  required
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder={c.emailPh}
                  value={email}
                  error={emailInvalid}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Phone with country code */}
              <div className="flex flex-col gap-2">
                <span className="text-field-label font-semibold text-secondary">{c.phone}</span>
                <div className="flex gap-2">
                  <div className="w-32 shrink-0">
                    <Dropdown aria-label={c.code} value={dialCode} onChange={setDialCode} options={COUNTRY_CODES} />
                  </div>
                  <input
                    aria-label={c.phone}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder={c.phonePh}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-full min-w-0 flex-1 rounded-token-8 border border-neutral-primary bg-primary px-3 py-2 text-field-input text-primary outline-none transition-colors duration-200 ease-standard placeholder:text-tertiary focus:border-brand-token"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Dropdown label={c.companyType} value={companyType} onChange={setCompanyType} options={toOptions(c.companyTypes)} placeholder={c.pickType} />
                <Dropdown label={c.companySize} value={companySize} onChange={setCompanySize} options={toOptions(c.companySizes)} placeholder={c.pickSize} />
              </div>

              <Dropdown label={c.source} value={source} onChange={setSource} options={toOptions(c.sources)} placeholder={c.pickSource} />

              <TextBox
                label={c.message}
                className="!w-full"
                placeholder={c.messagePh}
                value={message}
                rows={4}
                onChange={(e) => setMessage(e.target.value)}
              />

              {error !== '' && (
                <p role="alert" className="text-paragraph-medium text-error-token">
                  {error}
                </p>
              )}

              <Button
                htmlType="submit"
                size="lg"
                className="mt-1 w-full"
                disabled={status === 'sending'}
                iconLeft={status === 'sending' ? <CircleNotch className="size-5 animate-spin" aria-hidden="true" /> : undefined}
              >
                {status === 'sending' ? c.sending : c.send}
              </Button>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
