# Tab — spec (from Figma node 57:28852)

## Variant matrix (all props/variants/states)

Single variant prop: `Style`

| Style | Node id | Description |
|---|---|---|
| Active | 57:28849 | Brand-colored label + 1px bottom border (brand) |
| Idle | 57:28850 | Secondary gray label, no border |
| Disabled | 57:28851 | Disabled gray label, no border |

No size variants, no icon slot in this set — text-only tab item.

## Anatomy (structure, exact dimensions, gaps, padding)

```
Tab (flex, items-center, justify-center)
└── Label text ("Tab")
```

- Padding: `16px` horizontal (`Wrapper/wrap-16`), `8px` vertical (`Wrapper/wrap-8`)
- Layout: flex row, centered both axes; label is `whitespace-nowrap`, `word-break: break-word`
- Active state only: bottom border, `1px` solid, color `Icons/icon-brand` (#06472c)
- Intrinsic height: 24px line-height + 2×8px padding = 40px (41px with bottom border in Active)

## Sizing / radius (exact px AND the DS token names)

| Property | Token | Value |
|---|---|---|
| Padding X | `Wrapper/wrap-16` | 16px |
| Padding Y | `Wrapper/wrap-8` | 8px |
| Active underline | (border-bottom, no token for width) | 1px solid |
| Border radius | — | none (0) |

## Typography (token names + px/weight/line-height)

Text style: `Label/Big`
- Family: Figtree
- Weight: `General/Font-weight-medium` → Medium (500)
- Size: `Font Sizes/Label/Big` → 16px
- Line height: `Line Height/Label/Large` → 24px
- Letter spacing: 0

## Colors per state (light-mode hex)

| State | Element | Token name | Light hex |
|---|---|---|---|
| Active | Label text | `Text/text-brand` | #06472c |
| Active | Bottom border (underline) | `Icons/icon-brand` | #06472c |
| Idle | Label text | `Text/text-secondary-invert` | #989898 |
| Idle | Border | — | none |
| Disabled | Label text | `Text/text-disabled` | #b8b8b8 |
| Disabled | Border | — | none |

No background fill in any state (transparent).

## Motion notes

- Visuals imply a sliding/appearing underline on activation. Suggested: transition `color` and `border-color`/underline opacity ~150–200ms ease. UNCERTAIN: no explicit motion/prototype data in the Figma node.
- Disabled state should not respond to hover/press (cursor: not-allowed or default).

## Assets

None — no icons or images referenced by this node.

## Source node ids

- Component set: `57:28852`
- Active: `57:28849` (label `57:28843`)
- Idle: `57:28850` (label `57:28846`)
- Disabled: `57:28851` (label `57:28848`)
