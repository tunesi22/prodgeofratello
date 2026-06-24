# Icon Button — spec (from Figma node 52:25162)

## Variant matrix (all types × sizes × states)

Component set `52:25162`. Same 5 × 3 × 3 = 45 variants as Button, all present in the dump:

- `Type`: `Primary` | `Ghost` | `Error` | `Primary Outlined` | `Error Outlined`
- `Size`: `SM` | `MD` | `LG`
- `State`: `Idle` | `Pressed / Focused` | `Disabled`

No icon-toggle props — the icon is the only child. Generated props type, verbatim:

```ts
type IconButtonProps = {
  className?: string;
  size?: "SM" | "MD" | "LG";
  state?: "Idle" | "Pressed / Focused" | "Disabled";
  type?: "Primary" | "Primary Outlined" | "Error Outlined" | "Ghost" | "Error";
};
```

Default variant (fallback return in generated code): `Size=SM, State=Idle, Type=Primary`.

## Anatomy (structure, icon slot, exact dimensions per size)

```
IconButton (flex, items-center justify-center, overflow-clip, square padding, content-hug)
└── left-icon (single square slot — "Plus" placeholder, swap target)
```

| Size | Outer size (derived: 2×pad + icon) | Padding (uniform) | Icon slot |
|---|---|---|---|
| SM | **36×36px** (8+20+8) | 8px (`Wrapper/wrap-8`) | 20×20px |
| MD | **40×40px** (10+20+10) | **10px — hardcoded `p-[10px]`, no DS token** | 20×20px |
| LG | **48×48px** (12+24+12) | 12px (`Wrapper/wrap-12`) | 24×24px |

Outer sizes are derived from hug-content layout (padding + icon slot), not set explicitly in the dump. They match the Button heights per size (36/40/48).

MD quirk, verbatim from dump: `p-[10px]` is a literal value — `Wrapper/wrap-16` is absent from this set's variable defs and no wrap-10 token exists. UNCERTAIN: whether a 10px wrapper token exists elsewhere in the DS; the dump uses a raw 10px.

Icon slot detail: same "Plus" placeholder as Button (component 38:20952) — two 1.5px round-cap stroke vectors, horizontal bar inset `left/right 15.63%`, vertical bar inset `top/bottom 15.63%` (glyph spans 68.75% of slot).

## Sizing / radius

| Property | px | DS token |
|---|---|---|
| Corner radius (all variants) | 8px | `Corner Radius/radius-8` (`--corner-radius/radius-8`) |
| Padding SM | 8px | `Wrapper/wrap-8` (`--wrapper/wrap-8`) |
| Padding MD | 10px | none — hardcoded `p-[10px]` |
| Padding LG | 12px | `Wrapper/wrap-12` (`--wrapper/wrap-12`) |
| Border width (outlined types, Idle/Pressed only) | 1px | Tailwind `border` class — no token, plain 1px solid |

## Typography per size

Not applicable — Icon Button has no text node. (Button's `Actions/Small|Medium|Big` styles do not appear in this set's variable defs.)

## Colors per type and state (light-mode hex from get_variable_defs)

| Type | State | Background token | Icon token | Border token |
|---|---|---|---|---|
| Primary | Idle | `Button/btn-primary` #06472c | `Icons/icon-white-remain` #ffffff | — |
| Primary | Pressed/Focused | `Button/btn-primary-pressed` #053521 | `Icons/icon-white-remain` #ffffff | — |
| Primary | Disabled | `Button/btn-disabled` #f0f0f0 | `Icons/icon-disabled` #b8b8b8 | — |
| Ghost | Idle | none (transparent) | `Icons/icon-black-invert` #141414 | — |
| Ghost | Pressed/Focused | `Button/btn-ghost-pressed` #0000001a (`rgba(0,0,0,0.1)`) | `Icons/icon-black-invert` #141414 | — |
| Ghost | Disabled | none (transparent) | `Icons/icon-disabled` #b8b8b8 | — |
| Error | Idle | `Button/btn-error` #a2212a | `Icons/icon-white-remain` #ffffff | — |
| Error | Pressed/Focused | `Button/btn-error-pressed` #79171d | `Icons/icon-white-remain` #ffffff | — |
| Error | Disabled | `Button/btn-disabled` #f0f0f0 | `Icons/icon-disabled` #b8b8b8 | — |
| Primary Outlined | Idle | none (transparent) | `Icons/icon-brand` #06472c | `Icons/icon-brand` #06472c (sic — border bound to icon token) |
| Primary Outlined | Pressed/Focused | `Button/btn-primary-light` #ceded7 | `Icons/icon-brand` #06472c | `Border/border-brand` #06472c |
| Primary Outlined | Disabled | `Button/btn-disabled` #f0f0f0 — **no border, no opacity** | `Icons/icon-disabled` #b8b8b8 | — |
| Error Outlined | Idle | none (transparent) | `Icons/icon-error` #ca2c36 | `Icons/icon-error` #ca2c36 (sic) |
| Error Outlined | Pressed/Focused | `Button/btn-error-light` #fdd7d9 | `Icons/icon-error` #ca2c36 | `Icons/icon-error` #ca2c36 (sic) |
| Error Outlined | Disabled | `Button/btn-disabled` #f0f0f0 — **no border, no opacity** | `Icons/icon-disabled` #b8b8b8 | — |

**Disabled rendering — DIFFERENT from Button:** all five types (including both Outlined types) collapse to the same disabled look: solid `Button/btn-disabled` bg (#f0f0f0, Ghost stays transparent) + `Icons/icon-disabled` icon (#b8b8b8). Outlined disabled drops the border entirely and uses no opacity. Verbatim container class for LG/Disabled/Primary Outlined: `bg-[var(--button\/btn-disabled,#f0f0f0)] … p-[var(--wrapper\/wrap-12,12px)] … rounded-[var(--corner-radius\/radius-8,8px)]` — no `border`, no `opacity-50`. (Button instead keeps outline colors and applies `opacity-50`.) Confirmed visually in the set screenshot.

**Border token inconsistency (quote-level finding):** Idle outlined borders are bound to ICON tokens, verbatim: `border-[var(--icons\/icon-error,#ca2c36)]` and `border-[var(--icons\/icon-brand,#06472c)]`. Only Pressed/Focused Primary Outlined uses `border-[var(--border\/border-brand,#06472c)]`; Pressed Error Outlined stays on `--icons/icon-error`. Light-mode hex values are identical (`icon-brand` = `border-brand` = #06472c; `icon-error` = `border-error` = #ca2c36), so visually equivalent — but dark-mode resolutions could diverge. UNCERTAIN: whether this is intentional; recommend normalizing to `Border/border-*` in implementation.

## Behavior notes

- Same single `Pressed / Focused` state as Button — no focus ring drawn anywhere in the set; no hover state defined.
- Pressed mechanics identical to Button: Primary/Error darken via `btn-*-pressed`; Ghost gets `Button/btn-ghost-pressed` 10% black overlay; Outlined fill with `btn-primary-light` / `btn-error-light` and keep the 1px border.
- Container `overflow-clip`, content centered both axes; always square.

## Assets (downloaded paths)

The Icon Button dump references exactly the same 22 asset hashes as Button (same "Plus" placeholder, component 38:20952). Saved copies under `/Users/alessandroairlangga/geonineten/.design/assets/`:

- `iconbutton-plus-frame-empty.svg`, `iconbutton-plus-frame-empty-2.svg` — empty 32×32 viewBox frames (byte-identical to each other)
- `iconbutton-plus-h-20-{white,black,brand,error,disabled}.svg` — viewBox `0 0 15.25 1.5`, path `M0.75 0.75H14.5`, stroke `var(--stroke-0, <color>)` 1.5px round
- `iconbutton-plus-v-20-{white,black,brand,error,disabled}.svg` — viewBox `0 0 1.5 15.25`, path `M0.75 0.75V14.5`
- `iconbutton-plus-h-24-{white,black,brand,error,disabled}.svg` — viewBox `0 0 18 1.5`, path `M0.75 0.75H17.25`
- `iconbutton-plus-v-24-{white,black,brand,error,disabled}.svg` — viewBox `0 0 1.5 18`, path `M0.75 0.75V17.25`

(`button-plus-*.svg` files are byte-identical copies of the same hashes.)

## Source node ids

- Component set: `52:25162`
- Sample variant nodes: `52:25161` LG/Idle/Primary; default branch = SM/Idle/Primary; icon slot instances e.g. `52:23770` (LG), `52:23781` (SM default)
- Plus icon component: `38:20952`; icon vectors inside instances: `…;8899:53793` (horizontal), `…;8899:53794` (vertical)
