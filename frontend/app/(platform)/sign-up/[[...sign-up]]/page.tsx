'use client'

import { FormEvent, useState, type ReactElement } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { CircleNotch, Eye, EyeSlash, CheckCircle, Circle } from '@phosphor-icons/react/dist/ssr'
import { Button, Input } from '@/components/ui'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { cn } from '@/lib/cn'

/**
 * Sign-up (Figma 138:649): the "Welcome beta users" form inside the shared
 * AuthLayout. Email / Password / Confirm Password with required asterisks. The
 * password-requirement checklist sits under the Password field and appears while
 * that field (or confirm) is active, or after a failed submit. The submit button
 * stays enabled; an invalid attempt surfaces field errors instead of silently
 * disabling. Wires to POST /api/auth/register (a backend task, see README-BACKEND).
 */
const COPY = {
  id: {
    heading: 'Selamat datang, pengguna beta!',
    sub: 'Saat ini kami hanya menerima pengguna yang ada di waitlist. Pantau media sosial kami untuk tahu kapan peluncurannya, tidak akan lama lagi.',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    confirmLabel: 'Konfirmasi Password',
    emailPlaceholder: 'anda@perusahaan.com',
    passwordPlaceholder: 'Buat password',
    confirmPlaceholder: 'Masukkan ulang password',
    req8: 'Minimal 8 karakter',
    reqUpper: 'Satu huruf kapital',
    reqNumber: 'Satu angka',
    reqMatch: 'Password cocok',
    emailRequired: 'Email wajib diisi.',
    confirmMismatch: 'Password tidak cocok.',
    show: 'Tampilkan password',
    hide: 'Sembunyikan password',
    submit: 'Buat akun',
    submitting: 'Membuat akun...',
    signUpFailed: 'Tidak bisa membuat akun Anda.',
    connectionError: 'Koneksi bermasalah, coba lagi.',
    haveAccount: 'Sudah punya akun?',
    signInLink: 'Masuk',
  },
  en: {
    heading: 'Welcome beta users!',
    sub: "Currently we're only accepting users who are in our waitlist. Stay tuned on our social media to see when launching happens, it won't be long.",
    emailLabel: 'Email',
    passwordLabel: 'Password',
    confirmLabel: 'Confirm Password',
    emailPlaceholder: 'you@company.com',
    passwordPlaceholder: 'Create a password',
    confirmPlaceholder: 'Re-enter your password',
    req8: 'At least 8 characters',
    reqUpper: 'One uppercase letter',
    reqNumber: 'One number',
    reqMatch: 'Passwords match',
    emailRequired: 'Email is required.',
    confirmMismatch: 'Passwords do not match.',
    show: 'Show password',
    hide: 'Hide password',
    submit: 'Create account',
    submitting: 'Creating account...',
    signUpFailed: 'Could not create your account.',
    connectionError: 'Connection problem, please try again.',
    haveAccount: 'Already have an account?',
    signInLink: 'Sign in',
  },
} as const

export default function SignUpPage(): ReactElement {
  const router = useRouter()
  const { lang } = useLanguage()
  const t = COPY[lang]

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [attempted, setAttempted] = useState(false)
  const [pwFocused, setPwFocused] = useState(false)
  const [confirmFocused, setConfirmFocused] = useState(false)

  // Live password requirements (the "parameters").
  const has8 = password.length >= 8
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const matches = password.length > 0 && password === confirm
  const reqs = [
    { ok: has8, label: t.req8 },
    { ok: hasUpper, label: t.reqUpper },
    { ok: hasNumber, label: t.reqNumber },
    { ok: matches, label: t.reqMatch },
  ]

  const pwStrengthOk = has8 && hasUpper && hasNumber
  const emailFilled = email.trim() !== ''
  const canSubmit = emailFilled && pwStrengthOk && matches

  // Field errors only surface after a submit attempt (or for an obvious mismatch).
  const emailError = attempted && !emailFilled
  const pwError = attempted && !pwStrengthOk
  const confirmError = (confirm.length > 0 && !matches) || (attempted && !matches)
  // Requirements appear while the password area is active, or after a failed try.
  const showReqs = pwFocused || confirmFocused || (attempted && !canSubmit)

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault()
    if (loading) return
    setAttempted(true)
    if (!canSubmit) {
      // Button stays enabled; invalid fields now show their errors above.
      setError('')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      if (res.ok) {
        router.push('/onboarding')
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || t.signUpFailed)
      }
    } catch {
      setError(t.connectionError)
    }
    setLoading(false)
  }

  return (
    <AuthLayout>
      <div className="mb-8 text-center">
        <h1 className="text-h2 font-normal tracking-tight text-primary lg:text-h1">{t.heading}</h1>
        <p className="mx-auto mt-3 max-w-[440px] text-paragraph-big leading-relaxed text-tertiary">{t.sub}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <Input
          label={t.emailLabel}
          required
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={t.emailPlaceholder}
          value={email}
          error={emailError}
          caption={emailError ? t.emailRequired : undefined}
          onChange={(e) => {
            setEmail(e.target.value)
            setError('')
          }}
        />

        <div className="flex flex-col gap-2.5">
          <Input
            label={t.passwordLabel}
            required
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder={t.passwordPlaceholder}
            value={password}
            error={pwError}
            onFocus={() => setPwFocused(true)}
            onBlur={() => setPwFocused(false)}
            onChange={(e) => {
              setPassword(e.target.value)
              setError('')
            }}
            trailingAction={
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t.hide : t.show}
                aria-pressed={showPassword}
                className="flex size-7 items-center justify-center rounded-token-4 text-icon-dark-gray transition-colors duration-200 ease-standard hover:bg-btn-ghost-pressed hover:text-primary focus-visible:bg-btn-ghost-pressed focus-visible:text-primary focus-visible:outline-none"
              >
                {showPassword ? <EyeSlash className="size-5" /> : <Eye className="size-5" />}
              </button>
            }
          />

          <AnimatePresence initial={false}>
            {showReqs && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <ul className="flex flex-col gap-1.5 pt-0.5">
                  {reqs.map((r) => (
                    <li
                      key={r.label}
                      className={cn(
                        'flex items-center gap-2 text-label-medium font-medium transition-colors duration-200 ease-standard',
                        r.ok ? 'text-brand-token' : 'text-tertiary',
                      )}
                    >
                      {r.ok ? (
                        <CheckCircle weight="fill" className="size-4 shrink-0" aria-hidden="true" />
                      ) : (
                        <Circle className="size-4 shrink-0" aria-hidden="true" />
                      )}
                      {r.label}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Input
          label={t.confirmLabel}
          required
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder={t.confirmPlaceholder}
          value={confirm}
          error={confirmError}
          caption={confirmError ? t.confirmMismatch : undefined}
          onFocus={() => setConfirmFocused(true)}
          onBlur={() => setConfirmFocused(false)}
          onChange={(e) => {
            setConfirm(e.target.value)
            setError('')
          }}
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
          disabled={loading}
          iconLeft={loading ? <CircleNotch className="size-5 animate-spin" aria-hidden="true" /> : undefined}
        >
          {loading ? t.submitting : t.submit}
        </Button>

        <p className="text-center text-paragraph-medium text-tertiary">
          {t.haveAccount}{' '}
          <Link
            href="/sign-in"
            className="font-medium text-brand-token transition-colors duration-200 ease-standard hover:underline"
          >
            {t.signInLink}
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
