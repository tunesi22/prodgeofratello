# Breadcrumb — spec (from Figma node 2029:2325)

## Variant matrix (all props/variants/states)

Single prop: `States` — this set defines one breadcrumb ITEM (icon + label), not the full trail.

| States | Node id | Label text in Figma | Visual |
|---|---|---|---|
| Idle | 2029:2322 | "Home" | gray text, no underline |
| Hover | 2029:2324 | "Home" | gray text, underlined |
| Active | 2029:2323 | "Project" | brand-green text, no underline |

No separator (chevron/slash) is part of this component set. UNCERTAIN: separator glyph between breadcrumb items is not defined here.

## Anatomy (structure, exact dimensions, gaps, padding)

```
Breadcrumb item (flex row, items-center, gap 4px)
├── House icon — 20×20px container
│   └── Vector — house outline stroke, inset 12.5% top / ~15.63% other sides
└── Label text (nowrap, word-break: break-word)
```

- Gap icon↔label: `4px` (`Gaps/gap-4`)
- No padding on the item itself
- Icon: 20×20px slot; house path drawn as 1px stroke, `stroke-linecap: round`, `stroke-linejoin: round`
- Item height = 20px (icon) ≥ 16px text line — effective 20px

## Sizing / radius (exact px AND the DS token names)

| Property | Token | Value |
|---|---|---|
| Icon size | — | 20×20px |
| Gap | `Gaps/gap-4` | 4px |
| Radius | — | none |
| Icon stroke width | — | 1px (rendered) |

## Typography (token names + px/weight/line-height)

Text style: `Paragraph/Small`
- Family: Figtree
- Weight: `General/Font-weight-regular` (400)
- Size: `Font Sizes/Paragraph/Small` → 12px
- Line height: `Line Height/Paragraph/Small` → 16px
- Letter spacing: `General/Letter-spacing-max` → 0
- Hover only: `text-decoration: underline` (solid, `text-underline-position: from-font`, `text-decoration-thickness: from-font`)

## Colors per state (light-mode hex)

| State | Element | Token name | Light hex |
|---|---|---|---|
| Idle | Label text | `Text/text-tertiary` | #7f7f7f |
| Idle | House icon stroke | `Icons/icon-light-gray` | #7f7f7f |
| Hover | Label text (underlined) | `Text/text-tertiary` | #7f7f7f |
| Hover | House icon stroke | `Icons/icon-light-gray` | #7f7f7f |
| Active | Label text | `Text/text-brand` | #06472c |
| Active | House icon stroke | `Icons/icon-brand` | #06472c |

No background in any state.

## Motion notes

- Hover adds an underline; suggested instant or ~100ms underline/color transition. UNCERTAIN: no prototype/transition data in the node.
- Active (current page) item is non-interactive; Idle/Hover items behave as links.

## Assets (downloaded paths + inline path data)

In `/Users/alessandroairlangga/geonineten/.design/assets/`:

- `breadcrumb-house-frame.svg` — empty 32×32 frame (icon component bounding box only, no geometry)
- `breadcrumb-house-vector-gray.svg` — viewBox `0 0 14.75 15.3755`, stroke `var(--stroke-0, #7F7F7F)`
- `breadcrumb-house-vector-brand.svg` — same path, stroke `var(--stroke-0, #06472C)`

House path data (identical in both, stroke-linecap/linejoin round, stroke-width 1):

```
M5.5 14.8755V9.87549H9.25V14.8755H14.25V7.37549C14.2501 7.29339 14.234 7.21208 14.2026 7.13621C14.1712 7.06034 14.1252 6.99139 14.0672 6.9333L7.81719 0.683304C7.75914 0.625194 7.69021 0.579095 7.61434 0.547642C7.53846 0.516189 7.45713 0.5 7.375 0.5C7.29287 0.5 7.21154 0.516189 7.13566 0.547642C7.05979 0.579095 6.99086 0.625194 6.93281 0.683304L0.682813 6.9333C0.624791 6.99139 0.578782 7.06034 0.547415 7.13621C0.516047 7.21208 0.499936 7.29339 0.5 7.37549V14.8755H5.5Z
```

Source icon component: "House" (node 2029:2063, tagged: homes, buildings, places, locations, maps & travel).

## Source node ids

- Component set: `2029:2325`
- Idle: `2029:2322` (icon `2029:2311`, label `2029:2312`)
- Hover: `2029:2324` (icon `2029:2306`, label `2029:2307`)
- Active: `2029:2323` (icon `2029:2316`, label `2029:2317`)
- House icon component: `2029:2063`
