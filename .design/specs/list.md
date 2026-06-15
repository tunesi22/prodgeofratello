# List (.base List) — spec (from Figma node 57:34346)

Base list-row component; reused as the row inside Contextual Menu (57:34340).

## Variant matrix (all props/variants/states)

Boolean props (no state variants defined — single visual state):

| Prop | Default | Effect |
|---|---|---|
| `caption` | true | Shows single-line supporting text under the label |
| `avatar` | false | Shows leading 40×40px circular avatar |

Combinations: label-only / label+caption / avatar+label / avatar+label+caption. UNCERTAIN: no hover/selected/disabled states exist on this node.

## Anatomy (row height, padding, separators, icon slots)

```
.base List (flex row, items-center, width 360px in Figma example)
├── [avatar?] 40×40px image, fully rounded (radius-circle), z-2
└── Content (flex column, flex-1 min-w-px, justify-center, z-1)
    ├── Label — "Label text", Actions/Medium, full width
    └── [caption?] — "Supporting line text, lorem ipsum dolor", Paragraph/Medium,
        single line: overflow hidden + text-ellipsis + nowrap
```

- Padding: `16px` horizontal (`Wrapper/wrap-16`), `12px` vertical (`Wrapper/wrap-12`)
- Row radius: `Corner Radius/radius-12` → 12px (visible when the row is used standalone; clipped when stacked inside a bordered container)
- Row heights (computed): label+caption = 20+20 text + 2×12 = 64px; label-only = 44px; with avatar = max(40, content) + 24
- No separators built into the row
- No trailing slot (no chevron/action icon) in this base component
- No explicit gap between avatar and Content in the extracted layout (UNCERTAIN: avatar+text spacing — verify in Figma before building avatar rows)
- Background: none/transparent on the row itself (screenshot shows it over the page's light gray canvas)

## Sizing / radius (exact px AND the DS token names)

| Property | Token | Value |
|---|---|---|
| Padding X | `Wrapper/wrap-16` | 16px |
| Padding Y | `Wrapper/wrap-12` | 12px |
| Row corner radius | `Corner Radius/radius-12` | 12px |
| Avatar size | — | 40×40px |
| Avatar radius | `Corner Radius/radius-circle` | 400px (full circle) |
| Example row width | — | 360px |

## Typography (token names + px/weight/line-height)

| Element | Text style | Family | Weight | Size token → px | Line-height token → px | Letter spacing |
|---|---|---|---|---|---|---|
| Label | `Actions/Medium` | Figtree | `General/Font-weight-medium` (500) | `Font Sizes/Actions/Medium` → 16px | `Line Height/Actions/Medium` → 20px | `General/Letter-spacing-max` → 0 |
| Caption | `Paragraph/Medium` | Figtree | `General/Font-weight-regular` (400) | `Font Sizes/Paragraph/Medium` → 14px | `Line Height/Paragraph/Medium` → 20px | `General/Letter-spacing-max` → 0 |

Caption truncates with ellipsis (one line). Label wraps with `word-break: break-word` (whole Content has it) but is full-width.

## Colors per state (light-mode hex)

Single state defined:

| Element | Token name | Light hex |
|---|---|---|
| Label text | `Text/text-primary` | #141414 |
| Caption text | `Text/text-secondary` | #3d3d3d |
| Row background | — | transparent (none set) |

## Motion notes

- None implied by the static design. If rows become interactive (menu/list selection), add a hover background consistent with the DS. UNCERTAIN: no prototype data.

## Assets

- Avatar placeholder (raster, only when `avatar=true`): `http://localhost:3845/assets/261d783da4147da7fea569d1940840845897657f.png` — content placeholder photo, not downloaded.
- No SVG icons.

## Source node ids

- `.base List`: `57:34346`
- Avatar: `57:34342`
- Content: `57:34343`
- Label: `57:34344`
- Caption: `57:34345`
- Consumer: Contextual Menu `57:34340`
