# Checkbox — spec (from Figma node 56:28643)

## Variant matrix (all props/variants/states)

Component set `56:28643` — two variant props, 9 combinations:

| Type \ State | Idle | Pressed | Disabled |
|---|---|---|---|
| Default (unchecked) | 56:28642 | 56:28641 | 56:28638 |
| Checked | 56:28639 | 56:28637 | 56:28636 |
| Mixed (indeterminate) | 56:28640 | 56:28635 | 56:28634 |

No label/text in the component — box only (20×20).

## Anatomy (structure, dimensions, gaps, padding)

- Overall box: 20×20px, corner radius 4px (`Corner Radius/radius-4`).
- Default (unchecked) variants: 20×20 box, 1.5px solid border (except Disabled Default which is a solid fill with no border).
- Checked/Mixed variants: filled box with `p-[2px]` padding containing a 16×16 icon (2 + 16 + 2 = 20px), no border.
- Check icon (Check, node 56:28280): stroke path inside 16×16, positioned inset `28.13% 12.5% 21.88% 15.63%`.
- Minus icon (Minus, node 56:28578): horizontal stroke centered vertically, inset `left/right 15.63%`.

## Sizing / radius

| Property | Token | px |
|---|---|---|
| Corner radius | `Corner Radius/radius-4` | 4px |
| Box size | — | 20×20px |
| Inner icon size | — | 16×16px |
| Fill padding (checked/mixed) | — (literal `p-[2px]`) | 2px |
| Border width (unchecked idle/pressed) | — | 1.5px |
| Icon stroke width | — | 1.5px (round cap/join) |

## Typography

None — component has no text.

## Colors per state (light mode)

| Type | State | Element | Token | Hex |
|---|---|---|---|---|
| Default | Idle | Background | `Background/bg-primary` | #ffffff |
| Default | Idle | Border (1.5px) | `Border/border-neutral-tertiary` | #989898 |
| Default | Pressed | Background | `Background/bg-tertiary` | #cbcbcb |
| Default | Pressed | Border (1.5px) | `Border/border-neutral-tertiary` | #989898 |
| Default | Disabled | Background (solid, no border) | `Icons/icon-disabled` | #b8b8b8 |
| Checked | Idle | Background | `Button/btn-primary` | #06472c |
| Checked | Idle | Checkmark stroke | `Icons/icon-white-remain` | #ffffff |
| Checked | Pressed | Background | `Button/btn-primary-pressed` | #053521 |
| Checked | Pressed | Checkmark stroke | `Icons/icon-white-remain` | #ffffff |
| Checked | Disabled | Background | `Button/btn-primary` @ 50% opacity | #06472c, opacity 0.5 |
| Checked | Disabled | Checkmark stroke | `Icons/icon-white-remain` | #ffffff (whole box at 50% opacity) |
| Mixed | Idle | Background | `Button/btn-primary` | #06472c |
| Mixed | Idle | Minus stroke | `Icons/icon-white-remain` | #ffffff |
| Mixed | Pressed | Background | `Button/btn-primary-pressed` | #053521 |
| Mixed | Pressed | Minus stroke | `Icons/icon-white-remain` | #ffffff |
| Mixed | Disabled | Background | `Button/btn-primary` @ 50% opacity | #06472c, opacity 0.5 |
| Mixed | Disabled | Minus stroke | `Icons/icon-white-remain` | #ffffff (whole box at 50% opacity) |

## Behavior notes

- Disabled Checked/Mixed = same fill as Idle (`Button/btn-primary`) with `opacity: 0.5` applied to the entire box (icon included).
- Disabled Default has NO border — it is a solid #b8b8b8 (`Icons/icon-disabled`) square.
- Pressed Default keeps the 1.5px #989898 border and darkens the bg to `Background/bg-tertiary` #cbcbcb.
- Pressed Checked/Mixed darkens fill to `Button/btn-primary-pressed` #053521.
- Mixed = indeterminate; renders the Minus icon instead of Check.
- No focus ring/Focused variant in this set.

## Assets

Downloaded (from http://localhost:3845/assets/):
- `/Users/alessandroairlangga/geonineten/.design/assets/checkbox-icon-frame.svg` — empty 32×32 icon frame (no path)
- `/Users/alessandroairlangga/geonineten/.design/assets/checkbox-check-vector.svg` — Check: `M0.75 5.25L4.25 8.75L12.25 0.75` (viewBox 0 0 13 9.5), stroke white, width 1.5, round cap/join
- `/Users/alessandroairlangga/geonineten/.design/assets/checkbox-minus-vector.svg` — Minus: `M0.75 0.75H11.75` (viewBox 0 0 12.5 1.5), stroke white, width 1.5, round cap/join

Icon components: Check (Figma node 56:28280), Minus (56:28578).

## Source node ids

- Component set: `56:28643`
- Variants: Default/Idle `56:28642`, Default/Pressed `56:28641`, Default/Disabled `56:28638`, Checked/Idle `56:28639`, Checked/Pressed `56:28637`, Checked/Disabled `56:28636`, Mixed/Idle `56:28640`, Mixed/Pressed `56:28635`, Mixed/Disabled `56:28634`
