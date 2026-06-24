# Contextual Menu — spec (from Figma node 57:34340)

## Variant matrix (all props/variants/states)

The Contextual Menu node itself has no variant props — it is a container composing `.base List` rows (node 57:34346). Row-level boolean props (from the base List):

| Row prop | Default | Effect |
|---|---|---|
| `caption` | true | Shows supporting line under the label |
| `avatar` | false | Shows 40px circular avatar before the content |

The Figma example shows 3 rows: label-only, label+caption, label-only. No hover/active/disabled row states are defined on this node. UNCERTAIN: interaction states for menu rows are not present in this component set.

## Anatomy (row height, padding, separators, icon slots)

```
Contextual Menu (vertical flex, width 360px, min-height 72px, overflow clipped)
└── n × .base List row (width 360px)
    ├── [avatar?] 40×40px circle (radius-circle), z-2
    └── Content (flex column, flex-1, centered vertically, z-1)
        ├── Label text  — Actions/Medium
        └── [caption?] Supporting line — Paragraph/Medium, single-line, ellipsis
```

- Container: `border: 1px solid` `Border/border-neutral-primary`, radius `Corner Radius/radius-12` (12px), background `Background/bg-primary` (white), `overflow: clip` (rows' own 12px radius is hidden by clipping).
- Row padding: `16px` horizontal (`Wrapper/wrap-16`), `12px` vertical (`Wrapper/wrap-12`).
- Row heights (computed): label-only = 20px line + 2×12px = 44px; label+caption = 40px + 24px = 64px; with avatar = max(40px avatar, content) + 24px.
- Separators: NONE between rows (rows touch directly; screenshot confirms no divider lines).
- No gap between avatar and content in the extracted code (UNCERTAIN: flex has no explicit gap; if avatar is enabled a spacing token would be expected — verify before using avatar rows).
- No trailing icon slot defined.

## Sizing / radius (exact px AND the DS token names)

| Property | Token | Value |
|---|---|---|
| Container radius | `Corner Radius/radius-12` | 12px |
| Container border | — | 1px solid |
| Container width (example) | — | 360px |
| Container min-height | — | 72px |
| Row padding X | `Wrapper/wrap-16` | 16px |
| Row padding Y | `Wrapper/wrap-12` | 12px |
| Row radius (clipped by container) | `Corner Radius/radius-12` | 12px |
| Avatar size | — | 40×40px |
| Avatar radius | `Corner Radius/radius-circle` | 400px (full circle) |

## Typography (token names + px/weight/line-height)

| Element | Text style | Family | Weight | Size token | Size | Line height token | LH | Letter spacing |
|---|---|---|---|---|---|---|---|---|
| Label | `Actions/Medium` | Figtree | `General/Font-weight-medium` (500) | `Font Sizes/Actions/Medium` | 16px | `Line Height/Actions/Medium` | 20px | `General/Letter-spacing-max` = 0 |
| Caption | `Paragraph/Medium` | Figtree | `General/Font-weight-regular` (400) | `Font Sizes/Paragraph/Medium` | 14px | `Line Height/Paragraph/Medium` | 20px | `General/Letter-spacing-max` = 0 |

Caption is single-line with `text-overflow: ellipsis`, `white-space: nowrap`, `overflow: hidden`.

## Colors per state (light-mode hex)

| Element | Token name | Light hex |
|---|---|---|
| Container background | `Background/bg-primary` | #ffffff |
| Container border | `Border/border-neutral-primary` | #d8d8d8 |
| Label text | `Text/text-primary` | #141414 |
| Caption text | `Text/text-secondary` | #3d3d3d |

No hover/active/disabled row colors defined on this node (UNCERTAIN — see List spec for the same base row).

## Motion notes

- As a contextual/dropdown menu: typical entrance is fade + slight scale/translate from the anchor (~150ms ease-out). UNCERTAIN: no prototype data in the node.
- Row hover feedback not specified; if added, use a subtle background tint consistent with the DS.

## Assets

- Avatar placeholder image (only used when `avatar=true`): `http://localhost:3845/assets/261d783da4147da7fea569d1940840845897657f.png` — a raster placeholder photo, not downloaded (content placeholder, not a design asset).
- No SVG icons referenced.

## Source node ids

- Contextual Menu: `57:34340`
- `.base List` row component: `57:34346`
- Avatar: `57:34342`, Content: `57:34343`, Label: `57:34344`, Caption: `57:34345`
