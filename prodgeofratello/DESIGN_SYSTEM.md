# Fratello Design System — MANDATORY RULES

> Claude: baca file ini SEBELUM menulis UI code apapun di `/frontend`.
> Dua aturan inti di bawah ini TIDAK BISA dinego.

---

## RULE 1 — Semua styling WAJIB pakai design tokens

Setiap warna, font, spacing, radius, shadow, easing, dan duration HARUS berasal dari
token design system. Sumber kebenaran:

- `fratello-DS.json` (repo root) — token export dari Figma (dark mode values)
- `frontend/app/design-tokens.css` — CSS variables, light + dark via `[data-theme]`
- `frontend/tailwind.config.ts` — Tailwind utilities yang memetakan token
- `frontend/lib/motion.ts` — motion tokens (easing, duration, stagger)

**DILARANG:**
- Hex/RGB literal di komponen (`#06472c`, `rgb(...)`) — pakai `var(--btn-primary)` / `bg-btn-primary`
- Arbitrary values Tailwind untuk hal yang sudah ada tokennya (`text-[17px]`, `rounded-[10px]`, `bg-[#0a0a0a]`)
- Font selain Figtree (`font-sans` sudah di-set ke Figtree)
- Easing/duration di luar motion tokens (lihat RULE 3)
- Hardcode warna theme — semua warna semantik harus berubah otomatis saat `data-theme` ganti

**Token reference cepat:**

| Kebutuhan | Pakai |
|---|---|
| Warna teks | `text-primary`, `text-secondary`, `text-tertiary`, `text-disabled`, `text-error-token`, `text-warning-token`, `text-brand-token`, `text-white-remain` |
| Background | `bg-primary`, `bg-secondary`, `bg-tertiary`, `bg-card`, `bg-nav`, `bg-field`, `bg-overlay`, `bg-brand-green`, `bg-brand-pastel` |
| Border | `border-neutral-primary`, `border-neutral-secondary`, `border-neutral-tertiary`, `border-error-token`, `border-brand-token`, `border-disabled` |
| Button fill | `bg-btn-primary`, `bg-btn-primary-pressed`, `bg-btn-neutral`, `bg-btn-disabled`, `bg-btn-error`, `bg-btn-ghost-pressed`, dst |
| Chips/badge fill | `bg-display-neutral`, `bg-display-brand`, `bg-display-error`, `bg-display-warning` |
| Icon | `text-icon-brand`, `text-icon-disabled`, `text-icon-white-remain`, dst (atau `fill-icon-*`/`stroke-icon-*`) |
| Typography | `text-h1`…`text-h6`, `text-action-big/medium/small`, `text-paragraph-big/medium`, `text-label-big/medium`, `text-field-label/input/caption` + `font-normal/medium/semibold/bold` |

**ATURAN UKURAN MINIMUM (keputusan user):** ukuran 12px (`text-label-small`,
`text-paragraph-small`, `text-paragraph-xs`, `text-field-caption`) HANYA boleh
dipakai untuk caption di dalam input box (`Input`/`TextBox` caption). Semua teks
lain minimal 14px (`text-label-medium` / `text-paragraph-medium`). Token 12px
tetap ada di Tailwind config untuk komponen input, tapi jangan dipakai di tempat
lain.
| Ikon | **WAJIB Phosphor Icons** (`@phosphor-icons/react`), lihat aturan di bawah |
| Radius | `rounded-token-4/8/12/16/24/40`, `rounded-circle` (pill) |
| Shadow | `shadow-center-sm/md/lg`, `shadow-regular-sm/md/lg/xl` |
| Spacing | Skala default Tailwind 4px-based, hanya nilai DS: 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 110 px |

---

## ATURAN IKON — Phosphor Icons

Semua komponen di Figma design system memakai **Phosphor Icons**. Di kode,
semua ikon WAJIB berasal dari `@phosphor-icons/react` (sudah ter-install).
Dilarang menggambar ikon SVG sendiri.

- Import dari `@phosphor-icons/react/dist/ssr` (berfungsi di server dan client
  component, tanpa context).
- Weight default `regular`; `fill` hanya jika desain menunjukkan ikon solid
  (contoh: CheckCircle pada state valid); `bold` untuk mark kecil di dalam
  Checkbox.
- Warna selalu lewat `currentColor` (token `text-icon-*` di parent), ukuran
  lewat `className` (mis. `size-5`) atau prop `size`.
- Pakai wrapper yang sudah ada bila tersedia:
  `components/dashboard/nav-icons.tsx` (ikon sidebar/dashboard) dan
  `components/onboarding/icons.tsx` (ikon umum: ArrowRight, Trash, dll).
  Tambah ikon baru ke wrapper tersebut, bukan inline di halaman.
- Pengecualian (bukan ikon): logo Fratello, ring/bar progress, thumb Toggle,
  dot Radio, dan grafik chart.

### Logo brand pihak ketiga (pengecualian khusus)

Logo brand pihak ketiga BUKAN ikon UI dan tidak bisa digambar ulang sebagai
glyph Phosphor. Logo tetap memakai warna resminya supaya dikenali pengguna.

- Sumber Google dan Reddit memakai `GoogleLogo` / `RedditLogo` dari Phosphor.
- Logo model AI (OpenAI/ChatGPT, Google Gemini, Perplexity, Anthropic Claude)
  memakai komponen `components/dashboard/ModelLogo.tsx`. Path SVG resmi berasal
  dari simple-icons (CC0). Ini satu-satunya tempat warna hex brand boleh ada,
  dan semua hex dikurung di file itu saja. Selalu pakai `ModelLogo` untuk
  menampilkan logo model, jangan inline path di halaman.

---

## RULE 2 — Dilarang bikin komponen di luar design system

Semua UI dibangun HANYA dari komponen di `frontend/components/ui/` yang
diimplementasi 1:1 dari halaman komponen Figma (file "Mockups -internal-").

Komponen yang tersedia (sumber spec: `.design/specs/*.md`):

| Komponen | Varian |
|---|---|
| `Button` | type: primary, ghost, error, primary-outlined, error-outlined × size: sm, md, lg × state: idle, pressed/focused, disabled |
| `IconButton` | sama dengan Button |
| `Chip` | type: neutral, success, error, warning × shape: squared, rounded × size: sm, md × outlined |
| `Input` | state: idle, active, filled, error |
| `TextBox` (textarea) | state: idle, active, filled, error |
| `Toggle` | on/off × idle, pressed, disabled |
| `Checkbox` | default, checked, mixed × idle, pressed, disabled |
| `Radio` | marked yes/no × idle, pressed, disabled |
| `Tabs` | active, idle, disabled |
| `ProgressBar` | thickness 4dp/8dp × progress 0–100 |
| `LoadingCircle` | sm, md, lg |
| `ValidationCheck` | checked / unchecked |
| `ContextualMenu` | — |
| `Breadcrumb` | idle, hover, active |
| `List` | base list row |

**Kalau butuh komponen yang belum ada:** JANGAN improvisasi. Bilang ke user bahwa
komponen tersebut belum ada di design system dan minta ditambahkan dulu di Figma.
Komposisi dari komponen yang ada (layout wrapper, halaman) boleh — primitive UI baru tidak.

### Komponen tambahan atas permintaan user (belum ada spec Figma)

Komponen berikut belum punya spec di Figma. Dibuat atas permintaan eksplisit
user, dibangun penuh dengan token + motion token. Kalau nanti didesain di Figma,
ganti ke versi resminya. Selalu pakai komponen ini, jangan bikin versi inline.

| Komponen | Fungsi |
|---|---|
| `Popover` | Panel mengambang kecil yang muncul saat hover atau focus pada trigger (mis. ikon "?"). Untuk bantuan inline, menggantikan teks panjang. Menggantikan `HelpTooltip` lama. |
| `Toast` + `ToastProvider` / `useToast()` | Notifikasi sementara di tengah atas layar untuk feedback aksi (tersalin, berhasil dibuat, error). Provider dipasang sekali di root layout; panggil `useToast()` dari komponen client mana pun. Varian: success, error, info. |

---

## RULE 3 — Motion rules (dari Figma motion spec)

- **Standard easing** `cubic-bezier(0.5, 0, 0.2, 1)` — semua entrance/movement
- **Exit easing** `cubic-bezier(0.4, 1, 0.2, 1)` — elemen yang menutup/keluar
- **Duration** hanya: 200ms (jarak pendek/exit), 300ms, 400ms, 500ms (jarak jauh)
- **Stagger**: interval 50ms antar layer; layer yang di-stagger HANYA boleh animasi
  vertical movement + opacity — TANPA scale, TANPA horizontal movement
- Selalu hormati `prefers-reduced-motion`
- Sumber: `frontend/lib/motion.ts` (`EASE_STANDARD`, `EASE_EXIT`, `DURATION`, `STAGGER_INTERVAL`, variants siap pakai)

---

## Theming & bahasa

- Theme: `[data-theme='light' | 'dark']` di `<html>`, dikelola `ThemeProvider`
  (`components/providers/ThemeProvider.tsx`), persist di localStorage `fratello-theme`.
- Bahasa: IND/ENG via `LanguageProvider` (`fratello-lang`). Copy onboarding tersedia dua bahasa.

## Checklist sebelum commit UI code

1. Tidak ada hex/arbitrary value di luar token? (`grep -nE '#[0-9a-fA-F]{3,8}' <file>` harus kosong, kecuali di design-tokens.css)
2. Semua komponen berasal dari `components/ui/`?
3. Animasi pakai motion tokens dari `lib/motion.ts`?
4. Tampilan benar di light DAN dark mode?
