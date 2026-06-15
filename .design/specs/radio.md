# Radio — spec (from Figma node 57:28772)

## Variant matrix (all props/variants/states)

Component set `57:28772` — two variant props, 6 combinations:

| Marked \ State | Idle | Pressed / Focused | Disabled |
|---|---|---|---|
| No (false) | 57:28771 | 57:28767 | 57:28769 |
| Yes (true) | 57:28770 | 57:28768 | 57:28766 |

No label/text in the component — circle only (20×20).

## Anatomy (structure, dimensions, gaps, padding)

- Overall circle: 20×20px, fully round (`Corner Radius/radius-circle` = 400px).
- Unmarked variants: 20×20 circle, 1.5px solid border (except Disabled which is a solid fill, no border).
- Marked variants: filled circle with `p-[6px]` padding containing an 8×8 white dot (6 + 8 + 6 = 20px), no border.
- Dot: plain circle, `cx=4 cy=4 r=4`, white fill.

## Sizing / radius

| Property | Token | px |
|---|---|---|
| Corner radius | `Corner Radius/radius-circle` | 400px (fully circular) |
| Circle size | — | 20×20px |
| Inner dot size | — | 8×8px |
| Fill padding (marked) | — (literal `p-[6px]`) | 6px |
| Border width (unmarked idle/pressed) | — | 1.5px |

## Typography

None — component has no text.

## Colors per state (light mode)

| Marked | State | Element | Token | Hex |
|---|---|---|---|---|
| No | Idle | Background | `Background/bg-primary` | #ffffff |
| No | Idle | Border (1.5px) | `Border/border-neutral-tertiary` | #989898 |
| No | Pressed / Focused | Background | `Background/bg-tertiary` | #cbcbcb |
| No | Pressed / Focused | Border (1.5px) | `Border/border-neutral-tertiary` | #989898 |
| No | Disabled | Background (solid, no border) | `Icons/icon-disabled` | #b8b8b8 |
| Yes | Idle | Background | `Button/btn-primary` | #06472c |
| Yes | Idle | Dot fill | `Icons/icon-white-remain` (white in SVG) | #ffffff |
| Yes | Pressed / Focused | Background | `Button/btn-primary-pressed` | #053521 |
| Yes | Pressed / Focused | Dot fill | `Icons/icon-white-remain` | #ffffff |
| Yes | Disabled | Background | `Button/btn-primary` @ 50% opacity | #06472c, opacity 0.5 |
| Yes | Disabled | Dot fill | `Icons/icon-white-remain` | #ffffff (whole circle at 50% opacity) |

UNCERTAIN: the dot SVG carries `fill="var(--fill-0, white)"` and `Icons/icon-white-remain` (#ffffff) appears in the node's variable defs — assumed the dot is bound to `Icons/icon-white-remain`.

## Behavior notes

- State model identical to Checkbox: Pressed darkens (unmarked bg → #cbcbcb; marked bg → #053521), Disabled marked = `Button/btn-primary` at 50% opacity, Disabled unmarked = solid #b8b8b8 with no border.
- "Pressed / Focused" is a single combined state in the design — no separate focus-ring treatment is drawn.
- Marked variants drop the border entirely; the green fill goes edge to edge.

## Assets

Downloaded (from http://localhost:3845/assets/):
- `/Users/alessandroairlangga/geonineten/.design/assets/radio-dot-ellipse.svg` — dot: `<circle cx="4" cy="4" r="4" fill="white"/>` (viewBox 0 0 8 8)

## Source node ids

- Component set: `57:28772`
- Variants: No/Idle `57:28771`, No/Pressed-Focused `57:28767`, No/Disabled `57:28769`, Yes/Idle `57:28770`, Yes/Pressed-Focused `57:28768`, Yes/Disabled `57:28766`
- Dot nodes: `57:28753` (idle), `57:28756` (pressed), `57:28763` (disabled)
