# Validation Check — spec (from Figma node 56:28238)

## Variant matrix (all props/variants/states)

Component set `56:28238` — single boolean variant prop:

| Prop | Values |
|---|---|
| Checked | `Yes` (56:28237, default) \| `No` (56:28236) |

Used as a password-rule / requirement row (sample text: "One Uppercase Letter").

## Anatomy (structure, dimensions, gaps, padding)

```
Row (horizontal flex, items-center, gap 8px = Gaps/gap-8)
├── Icon 20×20px
│   • Checked=Yes  → filled CheckCircle (solid circle w/ knocked-out checkmark), brand green
│   • Checked=No   → outlined MinusCircle (1.5px circle stroke + centered minus), gray
└── Text ("One Uppercase Letter", Label/Medium style, no wrap)
```

- No fixed width — row hugs content. Row height = 20px (icon and 20px text line-height).
- Text color does NOT change between states — only the icon changes.

## Sizing / radius

| Property | Token | px |
|---|---|---|
| Icon↔text gap | `Gaps/gap-8` | 8px |
| Icon size | — | 20×20px |
| Icon stroke width (unchecked) | — | 1.5px |
| Radius | — | n/a (no container box) |

## Typography

| Element | Style token | Family | Size token / px | Weight token | Line-height token / px | Letter-spacing |
|---|---|---|---|---|---|---|
| Rule text | `Label/Medium` | Figtree | `Font Sizes/Label/Medium` = 14px | `General/Font-weight-medium` (500) | `Line Height/Label/Medium` = 20px | 0 |

## Colors per state (light mode)

| State | Element | Token | Hex |
|---|---|---|---|
| Checked=Yes | CheckCircle icon fill | `Icons/icon-brand` | #06472c |
| Checked=Yes | Checkmark (knockout inside circle) | — (negative space in the filled path) | transparent/background shows through |
| Checked=Yes | Text | `Text/text-primary` | #141414 |
| Checked=No | MinusCircle outline stroke | `Icons/icon-light-gray` | #7f7f7f |
| Checked=No | Minus line stroke | `Icons/icon-light-gray` | #7f7f7f |
| Checked=No | Text | `Text/text-primary` | #141414 |

## Behavior notes

- State toggles only the icon: satisfied rule = solid brand-green CheckCircle; unsatisfied = gray outlined MinusCircle.
- Text remains `Text/text-primary` #141414 in both states (no graying out of the label).
- Icons are circle variants (CheckCircle / MinusCircle), distinct from the square Checkbox icons.

## Assets

Downloaded (from http://localhost:3845/assets/):
- `/Users/alessandroairlangga/geonineten/.design/assets/validation-check-circle.svg` — CheckCircle (Checked=Yes): single filled path, fill #06472c (`Icons/icon-brand`), viewBox 0 0 16.25 16.25, rendered at inset 9.38% of the 20px box. Path: `M8.125 0C6.51803 0 ... 11.6922 6.69219Z` (solid circle with check knockout — full path data in the file).
- `/Users/alessandroairlangga/geonineten/.design/assets/validation-circle-outline.svg` — MinusCircle ring (Checked=No): `M8.25 15.75C12.3921 15.75 15.75 12.3921 15.75 8.25C15.75 4.10786 12.3921 0.75 8.25 0.75C4.10786 0.75 0.75 4.10786 0.75 8.25C0.75 12.3921 4.10786 15.75 8.25 15.75Z`, stroke #7f7f7f, width 1.5, miterlimit 10 (viewBox 0 0 16.5 16.5).
- `/Users/alessandroairlangga/geonineten/.design/assets/validation-minus-line.svg` — Minus line (Checked=No): `M0.75 0.75H7`, stroke #7f7f7f, width 1.5, round cap/join (viewBox 0 0 7.75 1.5).
- Shared empty 20px icon frame: `/Users/alessandroairlangga/geonineten/.design/assets/input-left-icon-frame.svg`.

Icon components: CheckCircle (Figma node 56:28199), MinusCircle (56:28223).

## Source node ids

- Component set: `56:28238`
- Variants: Checked=Yes `56:28237` (icon `56:28212`, text `56:28216`), Checked=No `56:28236` (icon `56:28219`, text `56:28220`)
