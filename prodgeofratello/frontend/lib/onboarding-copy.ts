import type { Lang } from '@/components/providers/LanguageProvider'

/**
 * Onboarding copy, both languages.
 * Indonesian uses the formal "Anda" register (no slang). No dashes anywhere.
 */

export interface StepCopy {
  title: string
  subtitle: string
}

export interface OnboardingCopy {
  welcome: StepCopy & { cta: string }
  brandName: StepCopy & { placeholder: string; label: string }
  website: StepCopy & { placeholder: string; label: string }
  industry: StepCopy & { otherLabel: string; otherPlaceholder: string }
  competitors: StepCopy & {
    counter: (n: number, max: number) => string
    addPlaceholder: string
    emptyHint: string
    nameLabel: string
    domainLabel: string
    domainPlaceholder: string
    subdomainLabel: string
    subdomainTooltip: string
    editSave: string
    addLabel: string
  }
  completion: { title: string; subtitle: string }
  loading: { analyzing: string; almostThere: string }
  nav: { next: string; back: string; finish: string; start: string; skip: string }
  toggles: { langLabel: string; light: string; dark: string }
  industries: string[]
  errors: {
    required: string
    invalidUrl: string
    createFailed: string
  }
}

export const ONBOARDING_COPY: Record<Lang, OnboardingCopy> = {
  id: {
    welcome: {
      title: 'Selamat datang di Fratello',
      subtitle: 'Platform terbaik untuk membuat brand Anda dibaca dan dikenal oleh AI',
      cta: 'Mulai sekarang',
    },
    brandName: {
      title: 'Beri tahu nama brand Anda',
      subtitle: 'Nama ini yang akan kami pantau di ChatGPT, Gemini, dan AI lainnya',
      label: 'Nama brand',
      placeholder: 'Ketik di sini...',
    },
    website: {
      title: 'Link website brand Anda',
      subtitle: 'Kami menganalisis website Anda untuk mengenal brand Anda lebih dalam. Pastikan website dapat diakses publik',
      label: 'Website',
      placeholder: 'contoh: brandanda.com',
    },
    industry: {
      title: 'Pilih industri brand Anda',
      subtitle: 'Pilih satu yang paling sesuai. Ini menjadi dasar bagaimana AI melihat brand Anda',
      otherLabel: 'Lainnya',
      otherPlaceholder: 'Ketik industri Anda...',
    },
    competitors: {
      title: 'Siapa kompetitor brand Anda?',
      subtitle: 'Berdasarkan analisis awal kami, berikut kompetitor terdekat Anda. Anda dapat mengubah, menghapus, atau menambahkannya',
      counter: (n: number, max: number): string => `${n}/${max} brand kompetitor`,
      addPlaceholder: 'Tambah kompetitor...',
      emptyHint: 'Tambahkan hingga 3 kompetitor utama brand Anda',
      nameLabel: 'Nama brand',
      domainLabel: 'Domain',
      domainPlaceholder: 'contoh: kompetitor.com',
      subdomainLabel: 'Sertakan semua subdomain',
      subdomainTooltip:
        'Jika aktif, kami memantau semua subdomain dari domain ini (misalnya blog.kompetitor.com, shop.kompetitor.com), bukan hanya domain utamanya.',
      editSave: 'Simpan',
      addLabel: 'Tambah kompetitor',
    },
    completion: {
      title: 'Semua siap!',
      subtitle: 'Kami sedang menyiapkan dashboard brand Anda...',
    },
    loading: {
      analyzing: 'Menganalisis website Anda...',
      almostThere: 'Sebentar lagi...',
    },
    nav: { next: 'Selanjutnya', back: 'Kembali', finish: 'Selesai', start: 'Mulai sekarang', skip: 'Lewati' },
    toggles: { langLabel: 'IND', light: 'Light', dark: 'Dark' },
    industries: [
      'Toko Kue',
      'FMCG',
      'Keuangan',
      'Software',
      'Artificial Intelligence',
      'Bakery',
      'Retail',
      'Edukasi',
    ],
    errors: {
      required: 'Bagian ini wajib diisi',
      invalidUrl: 'Format website belum valid',
      createFailed: 'Gagal menyimpan brand. Silakan coba lagi.',
    },
  },
  en: {
    welcome: {
      title: 'Welcome to Fratello',
      subtitle: 'The best platform to get your brand read and known by AI',
      cta: 'Get started',
    },
    brandName: {
      title: "What's your brand name?",
      subtitle: "This is the name we'll track across ChatGPT, Gemini, and other AI models",
      label: 'Brand name',
      placeholder: 'Type here...',
    },
    website: {
      title: "Your brand's website",
      subtitle: "We'll analyze it to understand your brand. Make sure it's publicly accessible",
      label: 'Website',
      placeholder: 'e.g. yourbrand.com',
    },
    industry: {
      title: 'Pick your industry',
      subtitle: 'Choose the one that fits best, it shapes how AI sees your brand',
      otherLabel: 'Other',
      otherPlaceholder: 'Type your industry...',
    },
    competitors: {
      title: 'Who are your competitors?',
      subtitle: 'Based on our first analysis, here are your closest competitors. Edit, remove, or add your own',
      counter: (n: number, max: number): string => `${n}/${max} competitor brands`,
      addPlaceholder: 'Add a competitor...',
      emptyHint: "Add up to 3 of your brand's main competitors",
      nameLabel: 'Brand name',
      domainLabel: 'Domain',
      domainPlaceholder: 'e.g. competitor.com',
      subdomainLabel: 'Include all subdomains',
      subdomainTooltip:
        'When on, we track every subdomain of this domain (e.g. blog.competitor.com, shop.competitor.com), not just the main domain.',
      editSave: 'Save',
      addLabel: 'Add competitor',
    },
    completion: {
      title: 'All set!',
      subtitle: "We're preparing your brand dashboard...",
    },
    loading: {
      analyzing: 'Analyzing your website...',
      almostThere: 'Almost there...',
    },
    nav: { next: 'Next', back: 'Back', finish: 'Finish', start: 'Get started', skip: 'Skip' },
    toggles: { langLabel: 'ENG', light: 'Light', dark: 'Dark' },
    industries: [
      'Bakery Shop',
      'FMCG',
      'Finance',
      'Software',
      'Artificial Intelligence',
      'Bakery',
      'Retail',
      'Education',
    ],
    errors: {
      required: 'This field is required',
      invalidUrl: "That website format doesn't look valid",
      createFailed: 'We could not save your brand. Please try again.',
    },
  },
}
