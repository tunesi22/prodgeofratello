# Button — spec (from Figma node 51:23650)

## Variant matrix (all types × sizes × states)

Component set `51:23650`. Three variant props — full 5 × 3 × 3 = 45 variants, all present in the dump:

- `Type`: `Primary` | `Ghost` | `Error` | `Primary Outlined` | `Error Outlined`
- `Size`: `SM` | `MD` | `LG`
- `State`: `Idle` | `Pressed / Focused` | `Disabled`

Boolean layer props (not variants): `iconLeft` (default true), `iconRight` (default true) — both slots can be toggled independently. Generated props type, verbatim:

```ts
type ButtonProps = {
  className?: string;
  iconLeft?: boolean;
  iconRight?: boolean;
  size?: "SM" | "MD" | "LG";
  state?: "Idle" | "Pressed / Focused" | "Disabled";
  type?: "Primary" | "Primary Outlined" | "Error Outlined" | "Ghost" | "Error";
};
```

Default variant (fallback return in generated code): `Size=SM, State=Idle, Type=Primary`.

## Anatomy (structure, icon slots, exact dimensions per size)

```
Button (flex row, items-center justify-center, overflow-clip, content-hug)
├── left-icon  (optional, square slot — "Plus" placeholder, swap target)
├── Label "Button" (Figtree Medium, nowrap, word-break:break-word)
│     MD only: label is wrapped in an inner flex with py-[2px]
└── right-icon (optional, same slot; layer is also named "left-icon" in Figma)
```

| Size | Height (derived: 2×pad-y + tallest child) | Padding-x | Padding-y | Gap | Icon slot | Label line-height |
|---|---|---|---|---|---|---|
| SM | **36px** (8+20+8) | 12px (`Wrapper/wrap-12`) | 8px (`Wrapper/wrap-8`) | 8px (`Gaps/gap-8`) | 20×20px | 16px |
| MD | **40px** (8+24+8) | 12px (`Wrapper/wrap-12`) | 8px (`Wrapper/wrap-8`) | 8px (`Gaps/gap-8`) | 24×24px | 20px (+2px py wrapper → 24px box) |
| LG | **48px** (12+24+12) | 16px (`Wrapper/wrap-16`) | 12px (`Wrapper/wrap-12`) | 8px (`Gaps/gap-8`) | 24×24px | 24px |

Heights are derived from hug-content layout (padding + icon slot), not set explicitly in the dump.

MD quirk, verbatim from the dump: the label sits inside `"content-stretch flex items-center justify-center py-[2px]"` — this 2px vertical padding makes the 20px text line box 24px tall to match the 24px icon, producing the 40px MD height even without icons.

Icon slot detail (the "Plus" placeholder, component 38:20952): two 1.5px stroke vectors (`stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"`), horizontal bar inset `left-[15.63%] right-[15.63%]`, vertical bar inset `top-[15.63%] bottom-[15.63%]` — i.e. glyph spans 68.75% of the slot (13.75px in a 20px slot, 16.5px in a 24px slot).

## Sizing / radius

| Property | px | DS token |
|---|---|---|
| Corner radius (all variants) | 8px | `Corner Radius/radius-8` (`--corner-radius/radius-8`) |
| Padding-x SM/MD | 12px | `Wrapper/wrap-12` (`--wrapper/wrap-12`) |
| Padding-y SM/MD | 8px | `Wrapper/wrap-8` (`--wrapper/wrap-8`) |
| Padding-x LG | 16px | `Wrapper/wrap-16` (`--wrapper/wrap-16`) |
| Padding-y LG | 12px | `Wrapper/wrap-12` (`--wrapper/wrap-12`) |
| Gap icon↔label | 8px | `Gaps/gap-8` (`--gaps/gap-8`) |
| Border width (outlined types) | 1px | Tailwind `border` class — no token, plain 1px solid |

## Typography per size

All sizes: family **Figtree**, weight **Medium (500)** (`General/Font-weight-medium`), letter-spacing **0** (`General/Letter-spacing-max`, `--general/letter-spacing-max`).

| Size | Text style | Font size | Line height | Tokens (verbatim) |
|---|---|---|---|---|
| SM | `Actions/Small` | 14px | 16px | `--font-sizes/actions/small` (14px), `--line-height/actions/small` (16px) |
| MD | `Actions/Medium` | 16px | 20px | `--font-sizes/actions/medium` (16px), `--line-height/actions/medium` (20px) |
| LG | `Actions/Big` | 18px | 24px | `--font-sizes/actions/big` (18px), `--line-height/actions/big` (24px) |

Style definitions verbatim from dump: `Actions/Small: Font(family: "Figtree", style: General/Font-weight-medium, size: Font Sizes/Actions/Small, weight: 500, lineHeight: Line Height/Actions/Small, letterSpacing: General/Letter-spacing-max)` — same pattern for Medium and Big.

## Colors per type and state (light-mode hex from get_variable_defs)

Icon color always matches text color (icon tokens mirror text tokens).

| Type | State | Background token | Text token / Icon token | Border token |
|---|---|---|---|---|
| Primary | Idle | `Button/btn-primary` #06472c | `Text/text-white-remain` #ffffff / `Icons/icon-white-remain` #ffffff | — |
| Primary | Pressed/Focused | `Button/btn-primary-pressed` #053521 | `Text/text-white-remain` #ffffff | — |
| Primary | Disabled | `Button/btn-disabled` #f0f0f0 | `Text/text-disabled` #b8b8b8 / `Icons/icon-disabled` #b8b8b8 | — |
| Ghost | Idle | none (transparent) | `Text/text-primary` #141414 / `Icons/icon-black-invert` #141414 | — |
| Ghost | Pressed/Focused | `Button/btn-ghost-pressed` #0000001a (`rgba(0,0,0,0.1)`) | `Text/text-primary` #141414 | — |
| Ghost | Disabled | none (transparent) | `Text/text-disabled` #b8b8b8 / `Icons/icon-disabled` #b8b8b8 | — |
| Error | Idle | `Button/btn-error` #a2212a | `Text/text-white-remain` #ffffff | — |
| Error | Pressed/Focused | `Button/btn-error-pressed` #79171d | `Text/text-white-remain` #ffffff | — |
| Error | Disabled | `Button/btn-disabled` #f0f0f0 | `Text/text-disabled` #b8b8b8 / `Icons/icon-disabled` #b8b8b8 | — |
| Primary Outlined | Idle | none (transparent) | `Text/text-brand` #06472c / `Icons/icon-brand` #06472c | `Border/border-brand` #06472c |
| Primary Outlined | Pressed/Focused | `Button/btn-primary-light` #ceded7 | `Text/text-brand` #06472c | `Border/border-brand` #06472c |
| Primary Outlined | Disabled | none + **`opacity-50` on container** | `Text/text-brand` #06472c (under 50% opacity) / `Icons/icon-brand` | `Border/border-brand` #06472c (under 50% opacity) |
| Error Outlined | Idle | none (transparent) | `Text/text-error` #ca2c36 / `Icons/icon-error` #ca2c36 | `Border/border-error` #ca2c36 |
| Error Outlined | Pressed/Focused | `Button/btn-error-light` #fdd7d9 | `Text/text-error` #ca2c36 | `Border/border-error` #ca2c36 |
| Error Outlined | Disabled | none + **`opacity-50` on container** | `Text/text-error` #ca2c36 (under 50% opacity) / `Icons/icon-error` | `Border/border-error` #ca2c36 (under 50% opacity) |

**Disabled rendering — two different mechanisms:**
- Filled types (Primary, Error) and Ghost: dedicated tokens — bg swaps to `Button/btn-disabled` (#f0f0f0, Ghost stays transparent), text/icon swap to `Text/text-disabled` / `Icons/icon-disabled` (#b8b8b8). No opacity.
- Outlined types (Primary Outlined, Error Outlined): colors stay brand/error, the whole container gets `opacity-50` (verbatim class in dump). Icon SVGs in disabled-outlined branches keep brand/error stroke colors.

CSS var names verbatim from dump (escaped form): `var(--button\/btn-primary,#06472c)`, `var(--text\/text-white-remain,white)`, `var(--icons\/...)` etc. — figma names lowercase the group: `--button/btn-*`, `--text/text-*`, `--icons/icon-*`, `--border/border-*`.

## Behavior notes

- **Pressed and Focused are one state** in this DS (`State=Pressed / Focused`). No separate focus ring is drawn anywhere in the set — no outline/ring classes in any of the 45 variants. Focus is communicated by the same fill change as pressed.
- Pressed mechanics per type:
  - Primary / Error: darker solid bg via `Button/btn-primary-pressed` / `Button/btn-error-pressed`.
  - Ghost: 10% black overlay bg via `Button/btn-ghost-pressed` (#0000001a) — works as a scrim on any surface.
  - Outlined: tinted solid fill via `Button/btn-primary-light` / `Button/btn-error-light`; border stays.
- No hover state is defined in the component set. UNCERTAIN: hover treatment (Figma set only has Idle / Pressed-Focused / Disabled).
- Container is `overflow-clip`; label is `whitespace-nowrap` — button never wraps.

## Assets (downloaded paths)

Placeholder icon = "Plus" (Figma component 38:20952, description: "addition, sum, mathematics, arithmetic, calculator, +, math & finance"). It is a swap-slot placeholder, not a fixed glyph. All under `/Users/alessandroairlangga/geonineten/.design/assets/`:

- `button-plus-frame-empty.svg`, `button-plus-frame-empty-2.svg` — empty 32×32 viewBox frame SVGs (icon bounding box only, no path; the two referenced hashes are byte-identical)
- `button-plus-h-20-{white,black,brand,error,disabled}.svg` — horizontal bar, viewBox `0 0 15.25 1.5`, path `M0.75 0.75H14.5`, stroke `var(--stroke-0, <color>)` 1.5px round
- `button-plus-v-20-{white,black,brand,error,disabled}.svg` — vertical bar, viewBox `0 0 1.5 15.25`, path `M0.75 0.75V14.5`
- `button-plus-h-24-{white,black,brand,error,disabled}.svg` — viewBox `0 0 18 1.5`, path `M0.75 0.75H17.25`
- `button-plus-v-24-{white,black,brand,error,disabled}.svg` — viewBox `0 0 1.5 18`, path `M0.75 0.75V17.25`

Color suffix → token: white=`Icons/icon-white-remain`, black(#141414)=`Icons/icon-black-invert`, brand(#06472C)=`Icons/icon-brand`, error(#CA2C36)=`Icons/icon-error`, disabled(#B8B8B8)=`Icons/icon-disabled`.

## Source node ids

- Component set: `51:23650`
- Sample variant nodes: SM/Idle/Primary (default), `51:23633` MD/Idle/Primary, `51:23649` LG/Idle/Primary, `51:23618` SM/Pressed/Primary, `51:23632` MD/Pressed/Primary, `51:23648` LG/Pressed/Primary, `51:23617` SM/Disabled/Primary, `51:23630` MD/Disabled/Primary, `51:23638` LG/Disabled/Primary, `51:23616` SM/Idle/Ghost, `51:23628` MD/Idle/Ghost, `51:23636` LG/Disabled/Error Outlined
- Plus icon component: `38:20952`; icon vectors inside instances: `…;8899:53793` (horizontal), `…;8899:53794` (vertical)
