# Input — spec (from Figma nodes 53:26551 + 53:26519)

## Variant matrix (all props/variants/states)

Component set `53:26551` — single variant prop:

| Prop | Values |
|---|---|
| State | `Idle` (53:26550) \| `Active` (53:26568) \| `Filled` (54:26579) \| `Error` (56:27408) |

Base component `.base Input` (`53:26519`) — boolean props:

| Prop | Default | Effect |
|---|---|---|
| `showTop` | true | Shows the label row above the field |
| `required` | false | Appends red `*` after label (in label row) |
| `iconLeft` | true | 20×20 leading icon inside the field (Plus icon in design) |
| `iconRight` | true | 20×20 trailing icon inside the field (CaretDown icon in design) |
| `additionalText` | true | Trailing inline text inside the field ("CDD" in design, e.g. unit/suffix) |
| `caption` | false | Shows caption row below the field |

Note: the State variants in set 53:26551 use the base with `iconLeft=false, iconRight=false, additionalText=false, caption=false, required=false`.

## Anatomy (structure, dimensions, gaps, padding)

```
Field root (vertical flex, width 330px, gap 8px = Gaps/gap-8)
├── Label row (horizontal flex, gap 4px = Gaps/gap-4, full width)
│   ├── Label text  ("Name", Fields/Label style)
│   └── [required] "*" (red)
├── Container (the input box)
│   • horizontal flex, items-center, gap 8px (Gaps/gap-8)
│   • padding: 12px horizontal (Wrapper/wrap-12), 8px vertical (Wrapper/wrap-8)
│   • bg Background/bg-primary, 1px solid border, radius 8px (Corner Radius/radius-8)
│   ├── [iconLeft] icon 20×20px
│   ├── Input text (flex 1, Fields/Input style — placeholder or value)
│   ├── [additionalText] suffix text (Fields/Input style, text-primary, no wrap)
│   └── [iconRight] icon 20×20px
└── [caption] Caption row (full width, Fields/Caption style, text-secondary)
```

- Total width: 330px. Total height (label + field, no caption): ~58px (label 14px + gap 8px + field 36px = 20px line + 2×8px pad + 2×1px border).
- There is NO floating label — the label sits in its own row above the field.
- Caption row exists in the base component but is OFF in all four State variants.

## Sizing / radius

| Property | Token | px |
|---|---|---|
| Field corner radius | `Corner Radius/radius-8` | 8px |
| Container padding X | `Wrapper/wrap-12` | 12px |
| Container padding Y | `Wrapper/wrap-8` | 8px |
| Label↔field gap (root column) | `Gaps/gap-8` | 8px |
| Label↔asterisk gap (label row) | `Gaps/gap-4` | 4px |
| Icon↔text gap inside container | `Gaps/gap-8` | 8px |
| Border width | — | 1px |
| Icon size | — | 20×20px |
| Field width | — | 330px (instance width; component is fluid `w-full` inside) |

## Typography

| Element | Style token | Family | Size token / px | Weight token | Line-height token / px | Letter-spacing |
|---|---|---|---|---|---|---|
| Label | `Fields/Label` | Figtree | `Font Sizes/Fields/Label` = 14px | `General/Font-weight-semiBold` (600) | `Line Height/Fields/Label` = 14px | `General/Letter-spacing-max` = 0 |
| Input text / placeholder | `Fields/Input` | Figtree | `Font Sizes/Fields/Input` = 16px | `General/Font-weight-regular` (400) | `Line Height/Fields/Input` = 20px | `General/Letter-spacing-max` = 0 |
| Caption (base only) | Fields/Caption | Figtree Regular | `Font Sizes/Fields/Caption` = 12px (from code default) | regular (400) | `Line Height/Fields/Caption` = 14px (from code default) | 0 |
| Required `*` (base only) | — | `General/Font-family` ('Poppins:Regular' fallback in code) | `Font Sizes/Label/md` = 14px (code default) | regular | `Line Height/Label/md` = 18px (code default) | — |

UNCERTAIN: Caption and required-asterisk token values (12/14, 14/18) come from the code fallback defaults only — they were not present in the variable_defs payload (caption/required are hidden in the captured variants). The `*` uses `--text/error` (#dc2626 fallback) which differs from `Text/text-error` (#ca2c36).

## Colors per state (light mode)

| State | Element | Token | Hex |
|---|---|---|---|
| Idle | Label | `Text/text-secondary` | #3d3d3d |
| Idle | Field background | `Background/bg-primary` | #ffffff |
| Idle | Field border | `Border/border-neutral-primary` | #d8d8d8 |
| Idle | Placeholder text | `Text/text-tertiary` | #7f7f7f |
| Active | Label | `Text/text-secondary` | #3d3d3d |
| Active | Field background | `Background/bg-primary` | #ffffff |
| Active | Field border | `Border/border-brand` | #06472c |
| Active | Caret/text (shows "\|") | `Text/text-tertiary` | #7f7f7f |
| Filled | Label | `Text/text-secondary` | #3d3d3d |
| Filled | Field background | `Background/bg-primary` | #ffffff |
| Filled | Field border | `Border/border-neutral-primary` | #d8d8d8 |
| Filled | Value text | `Text/text-primary` | #141414 |
| Error | Label | `Text/text-error` | #ca2c36 |
| Error | Field background | `Background/bg-primary` | #ffffff |
| Error | Field border | `Border/border-error` | #ca2c36 |
| Error | Value text | `Text/text-primary` | #141414 |
| (base) | Icons (left/right) | `Icons/icon-dark-gray` | #282828 |
| (base) | Additional/suffix text | `Text/text-primary` | #141414 |
| (base) | Caption text | `Text/text-secondary` | #3d3d3d |

No Disabled state exists in this component set.

## Behavior notes

- Placeholder text = `Text/text-tertiary` #7f7f7f; filled value = `Text/text-primary` #141414.
- Active state: border switches to `Border/border-brand` #06472c; the design shows a bare caret "|" rendered in the tertiary (placeholder) color. UNCERTAIN: actual caret color in implementation — the Figma text node for Active is `Text/text-tertiary`, but a brand-colored caret is a plausible intent; spec follows Figma verbatim (#7f7f7f).
- Error state keeps the filled value text (#141414); only label + border turn `*-error` #ca2c36. No error message/caption row is shown in the Error variant.
- Label is always above the field (static), never floating.
- Border color is the ONLY box change between Idle/Active/Filled/Error — bg stays white, no shadow/ring in the design.

## Assets

Downloaded (from http://localhost:3845/assets/):
- `/Users/alessandroairlangga/geonineten/.design/assets/input-left-icon-frame.svg` — empty 32×32 frame (icon container, no path)
- `/Users/alessandroairlangga/geonineten/.design/assets/input-plus-vector-h.svg` — Plus horizontal stroke: `M0.75 0.75H14.5`, stroke #282828 (`Icons/icon-dark-gray`), width 1.5, round caps
- `/Users/alessandroairlangga/geonineten/.design/assets/input-plus-vector-v.svg` — Plus vertical stroke: `M0.75 0.75V14.5`, stroke #282828, width 1.5, round caps
- `/Users/alessandroairlangga/geonineten/.design/assets/input-caretdown-vector.svg` — CaretDown: `M13.25 0.75L7 7L0.75 0.75` (viewBox 0 0 14 7.75), stroke #282828, width 1.5, round caps/joins

Icon components referenced: Plus (Figma node 38:20952), CaretDown (53:26501); both rendered at 20×20 inside the field.

## Source node ids

- Component set (State variants): `53:26551`
  - Idle `53:26550`, Active `53:26568`, Filled `54:26579`, Error `56:27408`
- Base component `.base Input`: `53:26519`
  - Label row `53:26493`, Label `53:26481`, required `*` `53:26491`, Container `53:26482`, left icon `53:26510`, input text `53:26483`, additional text `53:26517`, right icon `53:26496`, caption `53:26494`
