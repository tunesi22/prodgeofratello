# Text Box (textarea) — spec (from Figma nodes 56:28140 + 56:28113)

## Variant matrix (all props/variants/states)

Component set `56:28140` — single variant prop:

| Prop | Values |
|---|---|
| State | `Idle` (56:28139) \| `Active` (56:28141) \| `Error` (56:28152) \| `Filled` (56:28163) |

Base component `.base Text Box` (`56:28113`) — boolean props (all default **false**, unlike Input where icons default true):

| Prop | Default | Effect |
|---|---|---|
| `required` | false | Red `*` after the label |
| `leftIcon` | false | 20×20 leading icon (Plus in design) |
| `rightIcon` | false | 20×20 trailing icon (CaretDown in design) |
| `additionalText` | false | Trailing inline text ("CDD") |
| `caption` | false | Caption row below the box |

Note: base Text Box has no `showTop` toggle — label row is always present.

## Anatomy (structure, dimensions, gaps, padding)

```
Field root (vertical flex, width 330px, gap 12px = Gaps/gap-12)   ← larger than Input's 8px
├── Label row (horizontal flex, gap 4px = Gaps/gap-4, full width)
│   ├── Label text ("Name", Fields/Label style)
│   └── [required] "*" (red)
├── Container (the textarea box)
│   • horizontal flex, items-START (text starts at top), gap 8px
│   • fixed height 120px
│   • padding: 12px horizontal (Wrapper/wrap-12), 8px vertical (Wrapper/wrap-8)
│   • bg Background/bg-primary, 1px solid border, radius 8px (Corner Radius/radius-8)
│   ├── [leftIcon] icon 20×20px
│   ├── Text (flex 1, Fields/Input style — placeholder or value, top-aligned)
│   ├── [additionalText] suffix text
│   └── [rightIcon] icon 20×20px
└── [caption] Caption row (Fields/Caption style, text-secondary)
```

- Total width: 330px. Box height: fixed 120px. Total height (label + gap + box): 14 + 12 + 120 = 146px.
- Label is static above the box; content is top-aligned inside the box (`items-start`).

## Sizing / radius

| Property | Token | px |
|---|---|---|
| Box corner radius | `Corner Radius/radius-8` | 8px |
| Container padding X | `Wrapper/wrap-12` | 12px |
| Container padding Y | `Wrapper/wrap-8` | 8px |
| Label↔box gap (root column) | `Gaps/gap-12` | 12px |
| Label↔asterisk gap | `Gaps/gap-4` | 4px |
| Icon↔text gap inside container | — (literal `gap-[8px]`, not tokenized in output) | 8px |
| Border width | — | 1px |
| Box height | — | 120px |
| Field width | — | 330px |

## Typography

| Element | Style token | Family | Size token / px | Weight | Line-height token / px | Letter-spacing |
|---|---|---|---|---|---|---|
| Label | `Fields/Label` | Figtree | `Font Sizes/Fields/Label` = 14px | `General/Font-weight-semiBold` (600) | `Line Height/Fields/Label` = 14px | `General/Letter-spacing-max` = 0 |
| Textarea text / placeholder | `Fields/Input` | Figtree | `Font Sizes/Fields/Input` = 16px | `General/Font-weight-regular` (400) | `Line Height/Fields/Input` = 20px | `General/Letter-spacing-max` = 0 |
| Caption (base only) | Fields/Caption | Figtree Regular | `Font Sizes/Fields/Caption` = 12px (code default) | 400 | `Line Height/Fields/Caption` = 14px (code default) | 0 |

## Colors per state (light mode)

| State | Element | Token | Hex |
|---|---|---|---|
| Idle | Label | `Text/text-secondary` | #3d3d3d |
| Idle | Box background | `Background/bg-primary` | #ffffff |
| Idle | Box border | `Border/border-neutral-primary` | #d8d8d8 |
| Idle | Placeholder text | `Text/text-tertiary` | #7f7f7f |
| Active | Label | `Text/text-secondary` | #3d3d3d |
| Active | Box border | `Border/border-brand` | #06472c |
| Active | Caret/text ("\|") | `Text/text-tertiary` | #7f7f7f |
| Error | Label | `Text/text-secondary` | #3d3d3d |
| Error | Box border | `Border/border-error` | #ca2c36 |
| Error | Text value | `Text/text-tertiary` | #7f7f7f |
| Filled | Label | `Text/text-secondary` | #3d3d3d |
| Filled | Box border | `Border/border-neutral-primary` | #d8d8d8 |
| Filled | Text value | `Text/text-primary` | #141414 |
| (base) | Caption text | `Text/text-secondary` | #3d3d3d |

Differences vs Input (verbatim from Figma, confirmed by screenshot):
- Error state label stays `Text/text-secondary` #3d3d3d (Input's Error label turns #ca2c36).
- Error state text value renders `Text/text-tertiary` #7f7f7f, NOT text-primary (Input's Error value is #141414). UNCERTAIN whether this is design intent or a Figma oversight — recorded verbatim.
- The variant containers in set 56:28140 emit no background class (only the base 56:28113 carries `Background/bg-primary` white); screenshots render white. Treat box bg as `Background/bg-primary` #ffffff.

No Disabled state exists in this component set.

## Behavior notes

- Placeholder = `Text/text-tertiary` #7f7f7f; filled value = `Text/text-primary` #141414.
- Active shows a bare caret "|" in tertiary color at top-left of the box; border turns `Border/border-brand` #06472c.
- Filled/Error sample text: "This is a longer text than usual".
- Text is top-aligned (textarea semantics), box has fixed 120px height in the design (implementation: min-height 120px, resizable optional).
- No caption/error-message row shown in any State variant; caption exists only as a base-component option.

## Assets

Same icon assets as Input (only used when leftIcon/rightIcon enabled on the base; OFF in all State variants):
- `/Users/alessandroairlangga/geonineten/.design/assets/input-left-icon-frame.svg` — empty 32×32 icon frame
- `/Users/alessandroairlangga/geonineten/.design/assets/input-plus-vector-h.svg` — `M0.75 0.75H14.5`, stroke #282828, 1.5, round
- `/Users/alessandroairlangga/geonineten/.design/assets/input-plus-vector-v.svg` — `M0.75 0.75V14.5`, stroke #282828, 1.5, round
- `/Users/alessandroairlangga/geonineten/.design/assets/input-caretdown-vector.svg` — `M13.25 0.75L7 7L0.75 0.75` (viewBox 0 0 14 7.75), stroke #282828, 1.5, round

## Source node ids

- Component set (State variants): `56:28140`
  - Idle `56:28139`, Active `56:28141`, Error `56:28152`, Filled `56:28163`
- Base component `.base Text Box`: `56:28113`
  - Label row `56:28093`, Label `56:28094`, required `*` `56:28095`, Container `56:28096`, left icon `56:28097`, text `56:28098`, additional text `56:28099`, right icon `56:28100`, caption `56:28101`
