# Toggle — spec (from Figma node 57:28692)

## Variant matrix (all props/variants)

Component set with 2 props → 6 variants:

| Prop | Values |
|---|---|
| `switched` | `No` (false) / `Yes` (true) |
| `state` | `Idle` / `Pressed / Focused` / `Disabled` |

Full matrix: off-idle, off-pressed/focused, off-disabled, on-idle, on-pressed/focused, on-disabled.

React prop shape from Figma's generated reference code (verbatim):

```ts
type ToggleProps = {
  className?: string;
  state?: "Idle" | "Disabled" | "Pressed / Focused";
  switched?: boolean;
};
```

## Anatomy (structure: track, thumb, dimensions of each, gaps, padding)

```
Track (flex row, items-center, overflow-clip)
└── Thumb ("Button") — white circle
```

- **Track:** `w-[36px] h-[20px] min-w-[36px]`, `p-[2px]` (2px padding on all sides), `items-center`, `overflow-clip`, fully rounded.
- **Thumb:** `size-[16px]` (16×16), rendered as an SVG circle `cx=8 cy=8 r=8`, white fill.
- **Inset:** 2px between thumb and track edge on every side (20 − 16 = 4 → 2px top/bottom; 2px left/right via padding).
- **Travel distance:** inner width 36 − 2·2 = 32px; thumb 16px → thumb travels **16px** horizontally. Off = `justify-start` (default flex), On = `justify-end` in the generated code.
- No gaps between siblings (single child); no other layers (no border layer, no focus-ring layer in the design).

## Sizing / radius (exact px and which DS token)

| Property | Value | Token |
|---|---|---|
| Track width | 36px | hardcoded `w-[36px]` / `min-w-[36px]` |
| Track height | 20px | hardcoded `h-[20px]` |
| Track padding | 2px | hardcoded `p-[2px]` (no wrap-*/gap-* token used) |
| Track radius | `400px` (pill/circle) | `--corner-radius/radius-circle` = `400` |
| Thumb size | 16×16px | hardcoded `size-[16px]` |
| Thumb radius | full circle (r=8) | SVG circle, no token |
| Thumb travel | 16px | derived (32px inner − 16px thumb) |

## Colors per variant/state (token name → light-mode hex)

| State | Track bg token | Track bg hex | Thumb fill token | Thumb hex | Border | Extra |
|---|---|---|---|---|---|---|
| off-idle | `--background/bg-tertiary` | `#cbcbcb` | `Icons/icon-white-remain` | `#ffffff` | none | — |
| off-pressed/focused | `--background/bg-column` | `#b8b8b8` | `Icons/icon-white-remain` | `#ffffff` | none | — |
| off-disabled | `--icons/icon-disabled` | `#b8b8b8` | `Icons/icon-white-remain` | `#ffffff` | none | whole component `opacity-50` |
| on-idle | `--button/btn-primary` | `#06472c` | `Icons/icon-white-remain` | `#ffffff` | none | thumb at end (`justify-end`) |
| on-pressed/focused | `--button/btn-primary-pressed` | `#053521` | `Icons/icon-white-remain` | `#ffffff` | none | thumb at end |
| on-disabled | `--button/btn-primary` | `#06472c` | `Icons/icon-white-remain` | `#ffffff` | none | thumb at end, whole component `opacity-50` |

Notes:
- No borders/strokes in any state.
- Disabled is the same bg token as another state (off-disabled uses `icon-disabled` which resolves to the same hex as `bg-column`; on-disabled reuses `btn-primary`) plus a **50% opacity on the entire component**.
- Implementation must use CSS variables (token names above), never hardcoded hex.

Variable defs returned by Figma for this node (verbatim):

```json
{"Icons/icon-white-remain":"#ffffff","Corner Radius/radius-circle":"400","Button/btn-primary":"#06472c","Button/btn-primary-pressed":"#053521","Background/bg-tertiary":"#cbcbcb","Background/bg-column":"#b8b8b8","Icons/icon-disabled":"#b8b8b8"}
```

## Motion notes (what should animate when toggling)

The Figma file is static (no prototype transitions captured); recommended motion for implementation:

1. **Thumb translate:** slide 16px horizontally (translateX 0 → 16px) when toggling — animate `transform`, not flex justification.
2. **Track background:** crossfade between off bg (`--background/bg-tertiary`) and on bg (`--button/btn-primary`).
3. **Pressed feedback:** instant or very fast swap to pressed bg (`bg-column` / `btn-primary-pressed`) on pointer-down/focus.
4. Suggested timing: ~150–200ms ease-out for thumb + bg (recommendation, not from Figma).
5. Disabled: no animation/interaction; apply `opacity: 0.5` to the whole control.

## Assets (downloaded file paths + inline SVG path data)

Both thumb assets are identical — a plain 16×16 white circle (no shadow, no icon). Trivial to recreate in CSS; no SVG asset needed in implementation.

- `/Users/alessandroairlangga/geonineten/.design/assets/toggle-thumb-on.svg` (from `d54ccf116424eb40228088e42b87887418646ddd.svg`)
- `/Users/alessandroairlangga/geonineten/.design/assets/toggle-thumb-off.svg` (from `c4845e1edfc0963bdca6b375a3c6993aa6bb29db.svg`)

Inline content (both files):

```svg
<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="8" cy="8" r="8" fill="var(--fill-0, white)"/>
</svg>
```

## Source node ids

- Component set: `57:28692`
- Variant containers: off-idle `57:28687`, off-pressed/focused `57:28690`, off-disabled `57:28686`, on-idle `57:28689`, on-pressed/focused `57:28691`, on-disabled `57:28688`
- Thumb ("Button") nodes: off-idle `56:28677`, off-pressed/focused `56:28685`, off-disabled `56:28681`, on-idle `56:28675`, on-pressed/focused `56:28683`, on-disabled `56:28679`
