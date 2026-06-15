# Progress Bar — spec (from Figma node 57:29619)

Figma component description links to Material 3 progress indicators:
https://m3.material.io/components/progress-indicators/overview

## Variant matrix (all props/variants/states)

Two props, 12 variants total:

| Thickness | Progress | Node id |
|---|---|---|
| 4 dp | 0 | 57:29620 |
| 4 dp | 10 | 57:29624 |
| 4 dp | 20 | 57:29631 |
| 4 dp | 50 | 57:29639 |
| 4 dp | 80 | 57:29647 |
| 4 dp | 100 | 57:29655 |
| 8 dp | 0 | 57:29658 |
| 8 dp | 10 | 57:29662 |
| 8 dp | 20 | 57:29669 |
| 8 dp | 50 | 57:29677 |
| 8 dp | 80 | 57:29685 |
| 8 dp | 100 | 57:29693 |

## Anatomy (track + fill structure)

```
ProgressBar (flex row, width 404px in Figma example, height 12px)
├── Active indicator (fill)         — left portion, width = progress %
│   └── wave-increment SVG stroke   — round-cap line, stroke-width = thickness
├── [gap]                           — 6px (4dp) / 8px (8dp) between fill end and track start
└── track-and-stop (remaining width)
    ├── Track shape                 — rounded rect, vertically centered
    └── Stop                        — slot at track right end: 6×8px (4dp) / 8×8px (8dp)
```

Details (exact values from extracted code):
- Outer container height: 12px for both thicknesses (hit/layout box); visual bar is centered vertically.
- Container horizontal padding (to make room for the round stroke caps): `2px` per side for 4dp, `4px` per side for 8dp (px on 100%, pl-only on 10–80, none at 0).
- Fill: SVG `<path>` horizontal line, `stroke-width: 4` (4dp) or `8` (8dp), `stroke-linecap: round` → fill ends are fully rounded (radius = thickness/2).
- Track: plain div, height `4px` radius `2px` (4dp) or height `8px` radius `4px` (8dp), starts after the fill plus a gap of `6px` (4dp) / `8px` (8dp) — M3-style "gap between active indicator and track".
- At progress 0: track spans full width, no fill, gap absent.
- At progress 100: fill spans full width, no track.
- Segment construction: at 20/50/80 the fill is built as a fixed 40px "Segment - start" + flexible "Segment" — Figma construction detail for the M3 wave component; both render as one continuous flat stroke. Implement as a single fill.
- Stop indicator: an element is reserved at the right end of the track (4dp: 6px wide × 8px tall; 8dp: 8×8px), vertically centered. UNCERTAIN: the extracted code gives it no visible fill and the screenshot shows no dot — in M3 this is a brand-colored stop dot; here it appears to be an empty slot.

Active-indicator widths at example node (404px wide): 10 → ~11.4% / 13.5%, 20 → ~22.6% / 22.75%, 50 → ~56.7% / 57%, 80 → ~90.8% / 91.25% (4dp / 8dp, includes gap offset). Treat as `width: progress%` with the fixed gap before the track.

## Sizing / radius (exact px AND the DS token names)

| Property | 4 dp | 8 dp | Token |
|---|---|---|---|
| Bar (fill) thickness | 4px | 8px | — (variant "Thickness 4 dp / 8 dp") |
| Track height | 4px | 8px | — |
| Track corner radius | 2px | 4px | — (= thickness/2, fully rounded) |
| Fill cap radius | 2px (round cap) | 4px (round cap) | — |
| Fill–track gap | 6px | 8px | — |
| Edge padding (cap clearance) | 2px | 4px | — |
| Component layout height | 12px | 12px | — |
| Stop slot | 6×8px | 8×8px | — |

No DS spacing tokens are bound on this component — values are hard px in Figma.

## Typography

None — no text in this component.

## Colors per state (light-mode hex)

| Element | Token name | Light hex | Applies to |
|---|---|---|---|
| Track | `Background/bg-tertiary` | #cbcbcb | all variants with progress < 100 |
| Fill (active indicator stroke) | `Border/border-brand` | #06472c | all variants with progress > 0 |

(SVGs embed the stroke as `var(--stroke-0, #06472C)`; the bound Figma variable on the node is `Border/border-brand`.)

## Motion notes

- Determinate progress: animate fill width left→right; track shrinks accordingly while keeping the 6/8px gap. Suggested: `width` transition ~250–400ms ease-out on value change (M3 reference behavior).
- The M3 source component supports a "wave" fill during activity; this design uses amplitude 0 (flat). No wavy animation needed.
- UNCERTAIN: no prototype/animation data in the node itself.

## Assets (downloaded paths + inline path data)

All in `/Users/alessandroairlangga/geonineten/.design/assets/`. All are flat horizontal strokes, `stroke: var(--stroke-0, #06472C)`, `stroke-linecap: round`:

| File | viewBox | path d | stroke-width |
|---|---|---|---|
| progress-bar-wave-4dp-p10.svg | 0 0 50 4 | M2 2H13.5H36.5H48 | 4 |
| progress-bar-wave-4dp-p20.svg | 0 0 55 4 | M2 2H14.75H40.25H53 | 4 |
| progress-bar-wave-4dp-p50.svg | 0 0 192 4 | M2 2H49H143H190 | 4 |
| progress-bar-wave-4dp-p80.svg | 0 0 329 4 | M2 2H83.25H245.75H327 | 4 |
| progress-bar-wave-4dp-p100.svg | 0 0 404 4 | M2 2H102H302H402 | 4 |
| progress-bar-wave-8dp-p10.svg | 0 0 62 8 | M4 4H17.5H44.5H58 | 8 |
| progress-bar-wave-8dp-p20.svg | 0 0 59 8 | M4 4H16.75H42.25H55 | 8 |
| progress-bar-wave-8dp-p50.svg | 0 0 196 8 | M4 4H51H145H192 | 8 |
| progress-bar-wave-8dp-p80.svg | 0 0 333 8 | M4 4H85.25H247.75H329 | 8 |
| progress-bar-wave-8dp-p100.svg | 0 0 404 8 | M4 4H103H301H400 | 8 |
| progress-bar-segment-start-4dp-p20-80.svg | 0 0 44 12 | M2 6H12H32H42 | 4 |
| progress-bar-segment-start-4dp-p50.svg | 0 0 44 12 | M2 6H12H32H42 | 4 |
| progress-bar-segment-start-8dp-p20-80.svg | 0 0 48 12 | M4 6H14H34H44 | 8 |
| progress-bar-segment-start-8dp-p50.svg | 0 0 48 12 | M4 6H14H34H44 | 8 |

Implementation note: these SVGs are not needed — render the fill as a CSS rounded div (or a single round-cap stroke) instead.

## Source node ids

- Component set: `57:29619`
- Variants: see matrix above. Key internals: Track shape e.g. `2036:2544` (4dp p0), `2036:2556` (8dp p0); Active indicator e.g. `57:29626` (4dp p10), `57:29694` (8dp p100); Stop e.g. `2036:2541`, `2036:2557`.
