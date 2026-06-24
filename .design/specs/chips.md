# Chips — spec (from Figma node 53:25653)

## Variant matrix
- `size`: SM | MD
- `shape`: Squared | Rounded
- `type`: Neutral | Success | Error | Warning
- `outlined`: yes | no
- optional `iconLeft` / `iconRight` (20px at SM, 24px at MD)

## Anatomy
Horizontal flex, `gap: var(--gap-8)` (8px), items centered. Label text + optional icons.

## Sizing / padding / radius
| Variant | Padding | Radius |
|---|---|---|
| MD Squared | px 12 (wrap-12) / py 8 (wrap-8) | radius-8 (8px) |
| SM Squared | px 12 (wrap-12) / py 4 (wrap-4) | radius-4 (4px) |
| MD Rounded | px 16 (wrap-16) / py 8 (wrap-8) | radius-circle (400px) |
| SM Rounded | px 16 (wrap-16) / py 4 (wrap-4) | radius-circle (400px) |

## Typography
- MD: Figtree Medium (500), size `--font-label-big` 16px, line-height `--leading-label-large` 24px
- SM: Figtree Medium (500), size `--font-label-medium` 14px, line-height `--leading-label-medium` 20px

## Colors per type (token → light-mode resolved value)
| Type | Background (fill variants) | Text/Icon | Border (outlined) |
|---|---|---|---|
| Neutral filled | `display-neutral` → #d8d8d8 | `text-primary` → #141414 | — |
| Neutral outlined | transparent (NO bg) | `text-primary` → #141414 | `border-neutral-tertiary` → #989898 |
| Success filled | `display-brand` → #ceded7 | `text-brand` → #06472c | — |
| Success outlined | `display-brand` → #ceded7 (bg stays) | `text-brand` → #06472c | `border-brand` → #06472c |
| Error filled | `display-error` → #fdd7d9 | `text-error` → #ca2c36 | — |
| Error outlined | `display-error` → #fdd7d9 (bg stays) | `text-error` → #ca2c36 | `border-error` → #ca2c36 |
| Warning filled | `display-warning` → #fbd8c1 | `text-warning` → #ba4e06 | — |
| Warning outlined | `display-warning` → #fbd8c1 (bg stays) | `text-warning` → #ba4e06 | `border-warning` → #ba4e06 |

NOTE: Only the Neutral outlined variant drops the background; Success/Error/Warning outlined keep their tinted bg AND add the border. Border width 1px solid.

NOTE (dark mode): the tokens above are semantic — dark values come from fratello-DS.json token colors (e.g. display-neutral → neutral.800 #282828, text-primary → neutral.25 #f0f0f0, display-error → error.800 #79171d, display-brand → brand.800 #032416, display-warning → warning.800 #461d02). Use CSS vars, never hardcode.

## Dark-mode token mapping (from fratello-DS.json "token colors")
- display-neutral = neutral.800, display-brand = brand.800, display-error = error.800, display-warning = warning.800
- text-primary = neutral.25, text-brand = brand.400, text-error = error.500, text-warning = warning.500
- border-neutral-tertiary = neutral.600, border-brand = brand.400, border-error = error.500, border-warning = warning.500

## Source node ids
Set frame 53:25653. Representative: MD Squared Neutral outlined 53:25652, SM Squared Neutral outlined 53:26246.
