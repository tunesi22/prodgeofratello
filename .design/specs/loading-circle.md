# Loading Circle (spinner) — spec (from Figma node 2036:2526)

## Variant matrix (all props/variants/states)

Single prop: `Size`

| Size | Node id | Container | Stroke width |
|---|---|---|---|
| Small | 2036:2525 | 24×24px | 4px |
| Medium | 2036:2524 | 32×32px | 6px |
| Large | 2036:2523 | 40×40px | 6px |

No color/state variants — one visual style.

## Anatomy (stroke width, arc shape)

```
LoadingCircle (square container)
├── Background — full 360° circle stroke (the track)
└── Line       — 180° arc (semicircle, right half: top → bottom), the spinning indicator
```

- Both strokes use `stroke-linecap: round`, `stroke-linejoin: round`.
- The arc ("Line") is exactly half the circle (50% sweep). It is drawn on the right side from the 12 o'clock point to the 6 o'clock point.
- Circle center-line diameters (path geometry):
  - Small: 21px ring diameter inside 24px box (background inset 6.25% per side = 1.5px), stroke 4px
  - Medium: 28px ring diameter inside 32px box (inset 6.25% = 2px), stroke 6px
  - Large: ~35.7px ring diameter inside 40px box (inset 5.36% ≈ 2.14px), stroke 6px
- Note: round caps + stroke make the painted ring extend ~0.5px beyond the container at Small/Large — the SVG wrappers use negative insets (`overflow: visible`) to avoid clipping.

## Sizing / radius (exact px AND the DS token names)

| Property | Small | Medium | Large | Token |
|---|---|---|---|---|
| Container | 24×24px | 32×32px | 40×40px | — (variant prop) |
| Stroke width | 4px | 6px | 6px | — |
| Ring center-line radius | 10.5px | 14px | ~17.86px | — |

No DS spacing/size tokens are bound — dimensions are intrinsic to the variant.

## Typography

None.

## Colors per state (light-mode hex)

| Element | Token name | Light hex | Applies to |
|---|---|---|---|
| Background (track circle) | `Border/border-neutral-primary` | #d8d8d8 | all sizes |
| Line (active arc) | `Icons/icon-brand` | #06472c | all sizes |

(SVGs embed `var(--stroke-0, #D8D8D8)` and `var(--stroke-0, #06472C)`; the bound Figma variables are the token names above.)

## Motion notes

- Indeterminate spinner: rotate the "Line" arc continuously 360° around the container center. Suggested: `animation: spin 1s linear infinite` on the arc layer (track stays static). UNCERTAIN: no explicit duration/easing in the Figma node; static frames only.
- Arc length stays constant at 180° in the design (no grow/shrink arc like M3 indeterminate — the asset is a fixed semicircle).

## Assets (downloaded paths + inline path data)

All in `/Users/alessandroairlangga/geonineten/.design/assets/`:

- `loading-circle-bg-small.svg` — viewBox `0 0 25 25`, full circle path centered (12.5,12.5) r=10.5, stroke-width 4, #D8D8D8
- `loading-circle-line-small.svg` — viewBox `0 0 14.5 25`, arc `M2 2 ... 12.5,12.5 r=10.5 ... 2 23` (right semicircle), stroke-width 4, #06472C
- `loading-circle-bg-medium.svg` — viewBox `0 0 34 34`, full circle centered (17,17) r=14, stroke-width 6, #D8D8D8
- `loading-circle-line-medium.svg` — viewBox `0 0 20 34`, right semicircle r=14, stroke-width 6, #06472C
- `loading-circle-bg-large.svg` — viewBox `0 0 41.7143 41.7143`, full circle centered (20.857,20.857) r=17.857, stroke-width 6, #D8D8D8
- `loading-circle-line-large.svg` — viewBox `0 0 23.8571 41.7143`, right semicircle r=17.857, stroke-width 6, #06472C

Simple-arc path (small Line, representative):
`M2 2C3.37888 2 4.74426 2.27159 6.01818 2.79927C7.2921 3.32694 8.44961 4.10036 9.42463 5.07538C10.3996 6.05039 11.1731 7.20791 11.7007 8.48183C12.2284 9.75574 12.5 11.1211 12.5 12.5C12.5 13.8789 12.2284 15.2443 11.7007 16.5182C11.1731 17.7921 10.3996 18.9496 9.42462 19.9246C8.44961 20.8996 7.2921 21.6731 6.01818 22.2007C4.74426 22.7284 3.37888 23 2 23`

Implementation note: simplest faithful build is a single SVG `<circle>` for the track + `<circle>` with `stroke-dasharray` = 50% circumference for the arc, rotating via CSS.

## Source node ids

- Component set: `2036:2526`
- Small: `2036:2525` (Background `2036:2513`, Line `2036:2514`)
- Medium: `2036:2524` (Background `2036:2516`, Line `2036:2517`)
- Large: `2036:2523` (Background `2036:2519`, Line `2036:2520`)
