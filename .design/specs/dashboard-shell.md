# Dashboard Shell — spec (Figma node 55:137)

Source: Figma frame "MacBook Air - 1" (`data-node-id="55:137"`), generated React/Tailwind reference.
Component docs referenced in the dump: **Sidebar** (56:371, "left rail"), **SquaresFour** (60:572, grid icon used as nav-item placeholder), **GearSix** (105:1136, settings icon).
All values below are quoted verbatim from the dump. Anything inferred is marked `UNCERTAIN:`.

## Layout (canvas bg token; sidebar: position/inset/width/height behavior, bg, border, radius, internal column gaps/padding)

- **Canvas (root frame):** `bg-[var(--background/bg-primary,white)]`, `relative size-full`. Frame height is 900px (content column `h-[900px]`, sidebar `16 + 868 + 16 = 900`). UNCERTAIN: frame width — content wrapper is `left-[256px] w-[1165px]` → 1421px total; actual Figma frame width not stated in dump (MacBook Air preset is typically 1440; treat content column as flex-1 fill in implementation).
- **Sidebar (56:185 "Sidebar"):** floating card, `absolute left-[16px] top-[16px] w-[240px] h-[868px]` — i.e. inset 16px from left/top/bottom of a 900px-tall canvas. Implementation behavior: fixed-width 240px rail with 16px margin on all open sides, full viewport height minus 32px.
  - bg: `var(--background/bg-brand-green,#f6f9f8)`
  - border: `1px solid var(--border/border-neutral-primary,#d8d8d8)`
  - radius: `var(--corner-radius/radius-16,16px)`
  - root layout: `flex flex-col gap-[24px] items-start` (literal 24px gap between the scrollable main block and the footer card)
- **Sidebar main block (105:1110):** `flex-[1_0_0] flex-col gap-[var(--gaps/gap-24,24px)] p-[var(--wrapper/wrap-16,16px)] w-full min-h-px` — 16px padding all around, 24px gap between header / Getting Started item / nav sections.
- **Nav sections container (56:190):** `flex-[1_0_0] flex-col gap-[16px] w-full` — 16px gap between sections.
- **Content column (80:578):** `absolute left-[256px] top-0 w-[1165px] h-[900px] flex flex-col items-center justify-center gap-[var(--gaps/gap-8,0px)]` (note the odd `0px` fallback on gap-8 here — single child, gap is moot).

## Sidebar header (logo size/arrangement, "Fratello" text style, collapse button size/icon)

Row (56:186 "Sidebar header"): `flex items-center justify-between w-full`.

- **Logo lockup (56:261):** `w-[120px] h-[33.613px]`, `overflow-clip`, `rounded-[0.896px]`. Contains:
  - Polygon 1 (56:262): `13.782 × 17.479` at `left-[5.49px] top-[6.61px]` (asset dash-1)
  - Polygon 3 (56:263): `13.782 × 17.479` at `left-[20.39px] top-[6.61px]`, wrapped in `rotate-180` + `-scale-y-100` (net horizontal mirror; asset dash-2, byte-identical path to dash-1)
  - Polygon 2 (56:264): `12.325 × 17.367` at `left-[9.86px] top-[6.72px]` (asset dash-3)
  - The three dark-green (`#085937`) triangles overlap to form the mountain/"A" mark (same glyph family as `.design/assets/logo-poly-*.svg`, smaller scale).
- **"Fratello" text (56:265):** `font-['Lora:Regular'] font-normal text-[22.409px] text-[#085937] tracking-[-0.4482px] leading-[normal] text-center whitespace-nowrap`, centered at `left-[75.76px] top-[1.57px]` within the 120px lockup. Non-token hex + non-DS font (Lora) — logo artwork, treat as image/brand asset, not a text style.
- **Collapse button (56:188 "Toggle sidebar button"):** wrapper `flex items-center p-[4px]` (hit area 28×28); icon (56:189 "Toggle sidebar icon") `size-[20px]`. Icon anatomy = panel-left glyph built from: rounded-rect outline (dash-6), inner vertical divider at ~34% from left (dash-5), and 3 short horizontal "list" lines stacked in the left pane (dash-7 used 3×). Stroke `#121212`, round caps/joins. UNCERTAIN: no hover/pressed states in dump.

## Getting Started item (the highlighted menu item: bg, radius, height, loading-circle slot, "1/3" trailing text style)

Node 80:559 (data-name "Market Insights menu item" — naming leftover; the label is "Getting Started"). Pinned directly under the header, above all nav sections.

- Container: `bg-[var(--display/display-brand,#ceded7)] flex gap-[8px] items-center p-[8px] rounded-[8px] w-full` → height = 20px slot + 2×8px padding = **36px**. (Radius is a literal `8px`, not a radius token var.)
- **Loading-circle slot (90:797):** `size-[20px]`, Loading Circle component instance at 1/3-ish progress: track ring stroke `#D8D8D8` width 3 (asset dash-8) + progress arc stroke `#06472C` width 3 covering the right half (asset dash-9, clipped via `inset-[-8.57%_-8.57%_-8.57%_41.43%]`). Matches existing `loading-circle.md` spec / `loading-circle-bg-*` assets.
- **Label "Getting Started":** `font-['Figtree:Regular'] font-normal text-[length:var(--font-sizes/paragraph/medium,14px)] leading-[var(--line-height/paragraph/medium,20px)] text-[color:var(--text/text-primary,#141414)] tracking-[var(--general/letter-spacing-max,0px)] flex-[1_0_0]` (Paragraph/Medium).
- **Trailing "1/3":** `font-['Figtree:Medium'] font-medium text-[length:var(--font-sizes/label/small,12px)] leading-[var(--line-height/label/small,16px)] text-[color:var(--text/text-tertiary,#7f7f7f)] whitespace-nowrap` (Label/Small).

## Nav sections (section heading: text style/size/color, chip-like container if any; item: height 28px, icon 20px slot, text style + color, gaps; EXACT label strings in order with their section names)

**Section block** (e.g. 56:463): `flex-col gap-[4px] w-full` — heading then items list (`flex-col gap-[4px] w-full`).

- **Section heading:** chip-like container `flex items-center justify-center px-[8px] py-[4px]` (no bg, no radius — padding-only). Text: `font-['Inter:Regular'] font-normal text-[12px] text-[#424242] leading-[1.2] tracking-[-0.2px] whitespace-nowrap`. UNCERTAIN: Inter + literal `#424242` are off-system (DS font is Figtree; nearest token `--text/text-secondary,#3d3d3d`); likely un-detached Figma text — normalize to a DS Label/Small-style heading on implementation.
- **Nav item** (e.g. 56:467): `flex gap-[var(--gaps/gap-8,8px)] items-center px-[var(--wrapper/wrap-8,8px)] py-[var(--wrapper/wrap-4,4px)] rounded-[8px] w-full` → height = 20px icon + 2×4px = **28px**.
  - **Icon slot:** `size-[20px]`. Every item in the dump uses the same placeholder: SquaresFour (four `6×6` rounded squares, stroke `#141414`, asset dash-10 used 4× at insets 18.75%/56.25%). Real per-item icons TBD — UNCERTAIN: dump shows placeholders only.
  - **Item text:** inconsistent across the dump (un-normalized Figma):
    - "Overview": `Figtree:Medium`, `text-[length:var(--font-sizes/actions/small,14px)] leading-[var(--line-height/actions/small,16px)] text-[color:var(--text/text-primary,#141414)] tracking-[var(--general/letter-spacing-max,0px)]` (Actions/Small)
    - "Prompts": `Figtree:Regular`, Paragraph/Medium tokens (14/20), `text-primary`
    - All remaining items: `font-['Inter:Regular'] text-[14px] leading-[1.2] tracking-[-0.2px] text-[#121212]` — off-system. UNCERTAIN which is canonical; recommend Actions/Small (Figtree Medium 14/16, text-primary) for all items, Paragraph/Medium for the pinned Getting Started row, since those are the tokenized instances.
- **EXACT labels in order:**
  - *(pinned, no section)* — `Getting Started` (highlighted item above)
  - **Brand Insights** — `Overview`, `Prompts`, `Citations`, `Agents Insights`
  - **AI Visibility** — `AI Prompt Research`, `GEO Audit Tools`
  - **Recommendations** — `Suggested`, `To-Do`
  - **Admin** — `All Projects`, `Billing`, `Monitor Usage`, `Boost your AI Ranking`

## Footer (divider, user row: name text style + Chips instance variant "Free Tier", Account Settings item anatomy)

Node 56:214 "Settings and logout items". There is **no divider line element** in the dump; separation from the nav is achieved by the footer being its own bordered card: `border 1px solid var(--border/border-neutral-primary,#d8d8d8)`, `rounded-[var(--corner-radius/radius-16,16px)]`, `p-[var(--wrapper/wrap-16,16px)]`, `flex-col gap-[var(--gaps/gap-16,16px)] items-center justify-center w-full`, pinned at the bottom of the sidebar (24px gap from main block). UNCERTAIN: if a "divider" is wanted, it is not in this frame.

- **User row (105:1126):** `flex gap-[var(--gaps/gap-8,8px)] items-center w-full`.
  - Name "John Doe" (71:3417): `font-['Figtree:Medium'] font-medium text-[length:var(--font-sizes/label/big,16px)] leading-[var(--line-height/label/large,24px)] text-[color:var(--text/text-primary,#141414)] whitespace-nowrap`, in a `flex-[1_0_0]` wrapper (Label/Big style).
  - **Chips instance (71:3612, "Free Tier"):** `bg-[var(--display/display-neutral,#d8d8d8)] px-[var(--wrapper/wrap-12,12px)] py-[var(--wrapper/wrap-4,4px)] rounded-[var(--corner-radius/radius-4,4px)] gap-[var(--gaps/gap-8,8px)]`; label `Figtree:Medium`, `text-[length:var(--font-sizes/label/medium,14px)] leading-[var(--line-height/label/medium,20px)] text-[color:var(--text/text-primary,#141414)]` — i.e. the neutral/display variant of the existing Chips component (`.design/specs/chips.md`).
- **Account Settings item (105:1127):** same menu-item anatomy but **no horizontal padding**: `flex gap-[var(--gaps/gap-8,8px)] items-center py-[var(--wrapper/wrap-4,4px)] rounded-[8px] w-full` (28px tall). Icon: 20px GearSix — center circle `7.25×7.25` (asset dash-11) + 6-lobed gear outline `17.246×16` (asset dash-12), stroke `#141414`. Text "Account Settings": `font-['Inter:Regular'] text-[14px] leading-[1.2] tracking-[-0.2px] text-[#121212]` (same off-system style as other nav items — normalize per note above).

## Content area (max width 756 centered; welcome header: logo 48px + H3 title + Paragraph/Medium subtitle colors; "Getting Started" section: Label/Big heading, "1/3" + small progress bar at right, 3 cards 225x204 display-brand bg + radius; "How to use Fratello?" section: 3 list rows ~57px bordered + radius)

Outer column (80:578) centers inner page (80:582): `max-w-[756px] w-full flex-[1_0_0] flex-col gap-[var(--gaps/gap-40,40px)] px-[var(--wrapper/wrap-24,24px)] py-[var(--wrapper/wrap-80,80px)]` → usable content width 756 − 48 = 708px.

- **Welcome header (80:716):** `flex-col gap-[var(--gaps/gap-12,12px)] w-full`
  - Title row (80:713): `flex gap-[8px] items-center w-full`. Logo (80:708): `w-[48.462px] h-[30px]` — full Fratello mark, 3 polygons fill `#085937` (asset dash-13). Title "Welcome to Fratello" (80:579): `font-['Figtree:Regular'] text-[length:var(--font-sizes/headings/h3,28px)] leading-[1.2] text-[color:var(--text/text-primary,#141414)] tracking-[var(--general/letter-spacing-max,0px)]` (Headings/H3-regular).
  - Subtitle (80:580): `font-['Figtree:Regular'] text-[length:var(--font-sizes/paragraph/medium,14px)] leading-[var(--line-height/paragraph/medium,20px)] text-[color:var(--text/text-secondary,#3d3d3d)] w-full` (Paragraph/Medium, text-secondary). Copy: "This is the place for you to explore about our products. Great products are taken care with ease and shouldn’t be hard."
- **"Getting Started" section (80:811):** `flex-col gap-[var(--gaps/gap-16,16px)] h-[242px] w-full`
  - Header row (80:723): `flex gap-[40px] items-center w-full`. Heading "Getting Started" (80:714): in the dump this is `font-['Figtree:Regular'] text-[length:var(--font-sizes/headings/h6,18px)] leading-[1.2] text-[color:var(--text/text-primary,#141414)]` (Headings/H6-regular), `flex-[1_0_0]`. UNCERTAIN: the requested "Label/Big heading" (Figtree Medium 16/24) does not match the dump — dump says Headings/H6 18px; follow the dump.
  - Right cluster (80:809): `flex gap-[var(--gaps/gap-8,8px)] items-center`. Text "1 / 3" (80:807): Label/Small — `Figtree:Medium`, `var(--font-sizes/label/small,12px)` / `var(--line-height/label/small,16px)`, `var(--text/text-tertiary,#7f7f7f)`. Progress Bar (80:797): `w-[78px]`, container `h-[12px]`, track shape `h-[4px] rounded-[2px] bg-[var(--background/bg-tertiary,#cbcbcb)]` centered vertically; active indicator spans `inset-[0_71.71%_0_0.66%]` (≈28% fill ≈ 1/3) rendered with the wave-increment stroke `#06472C` width 4 (asset dash-14); "Stop" notch `6×8` at right. Matches existing `progress-bar.md` (4dp wave variant).
  - Cards row (81:825): `flex-[1_0_0] flex gap-[var(--gaps/gap-16,16px)] w-full`; 3 empty cards (80:810, 81:821, 81:823), each `flex-[1_0_0] h-full bg-[var(--display/display-brand,#ceded7)] rounded-[var(--corner-radius/radius-16,16px)]`. Computed ≈ **225 × 204** each ((708 − 2×16)/3 wide; 242 − heading ~22 − gap 16 tall). Card contents not designed in this frame — UNCERTAIN: placeholders only.
- **"How to use Fratello?" section (81:827):** `flex-col gap-[var(--gaps/gap-16,16px)] h-[242px] w-full`
  - Heading "How to use Fratello?" (81:829): identical Headings/H6-regular style as above.
  - List (81:839): `flex-[1_0_0] flex-col gap-[var(--gaps/gap-16,16px)] w-full`; 3 empty rows (81:840/841/842), each `flex-[1_0_0] w-full border 1px solid var(--border/border-neutral-primary,#d8d8d8) rounded-[var(--corner-radius/radius-12,12px)]` → ≈ **708 × 57** each. Row contents not designed — UNCERTAIN: placeholders only.

## Token map (every CSS var used -> value, deduplicated)

| CSS var | Fallback value in dump |
|---|---|
| `--background/bg-primary` | `white` |
| `--background/bg-brand-green` | `#f6f9f8` |
| `--background/bg-tertiary` | `#cbcbcb` |
| `--border/border-neutral-primary` | `#d8d8d8` |
| `--display/display-brand` | `#ceded7` |
| `--display/display-neutral` | `#d8d8d8` |
| `--text/text-primary` | `#141414` |
| `--text/text-secondary` | `#3d3d3d` |
| `--text/text-tertiary` | `#7f7f7f` |
| `--corner-radius/radius-4` | `4px` |
| `--corner-radius/radius-12` | `12px` |
| `--corner-radius/radius-16` | `16px` |
| `--gaps/gap-8` | `8px` (one outlier usage on 80:578 has fallback `0px`) |
| `--gaps/gap-12` | `12px` |
| `--gaps/gap-16` | `16px` |
| `--gaps/gap-24` | `24px` |
| `--gaps/gap-40` | `40px` |
| `--wrapper/wrap-4` | `4px` |
| `--wrapper/wrap-8` | `8px` |
| `--wrapper/wrap-12` | `12px` |
| `--wrapper/wrap-16` | `16px` |
| `--wrapper/wrap-24` | `24px` |
| `--wrapper/wrap-80` | `80px` |
| `--font-sizes/paragraph/medium` | `14px` |
| `--font-sizes/label/small` | `12px` |
| `--font-sizes/label/medium` | `14px` |
| `--font-sizes/label/big` | `16px` |
| `--font-sizes/actions/small` | `14px` |
| `--font-sizes/headings/h3` | `28px` |
| `--font-sizes/headings/h6` | `18px` |
| `--line-height/paragraph/medium` | `20px` |
| `--line-height/label/small` | `16px` |
| `--line-height/label/medium` | `20px` |
| `--line-height/label/large` | `24px` |
| `--line-height/actions/small` | `16px` |
| `--general/letter-spacing-max` | `0px` |

These map to `frontend/app/design-tokens.css` names (e.g. `--bg-brand-green`, `--display-brand` already exist with light/dark values).

Off-token literals appearing in the dump (do NOT invent tokens; flag during build): `#085937` (logo green), `#06472C` (progress/loading active stroke), `#424242` + `#121212` + Inter + `tracking-[-0.2px]` (un-normalized nav text), `rounded-[8px]` (menu items / Getting Started card), `rounded-[2px]` (progress track), `rounded-[0.896px]` (logo clip), literal gaps `4px/8px/24px/40px`, Lora 22.409px (logo wordmark).

## Assets (each downloaded file -> what it depicts, path data for small icons)

All in `/Users/alessandroairlangga/geonineten/.design/assets/`. All are stroke/fill-parameterized via `var(--fill-0, …)` / `var(--stroke-0, …)`.

| File | Dump const | Depicts | viewBox | Path data |
|---|---|---|---|---|
| `dash-1.svg` | `imgPolygon1` | Logo left triangle, fill `#085937` | `0 0 13.7815 17.479` | `M13.7815 0L3.27457 17.479H0L13.7815 0Z` |
| `dash-2.svg` | `imgPolygon3` | Logo right triangle — **duplicate of dash-1** (byte-identical except path id "Polygon 3"); mirrored at usage via rotate-180 + -scale-y-100 | `0 0 13.7815 17.479` | same as dash-1 |
| `dash-3.svg` | `imgPolygon2` | Logo center triangle, fill `#085937` | `0 0 12.3249 17.3669` | `M10.1095 0L12.3249 17.3669H0L10.1095 0Z` |
| `dash-4.svg` | `imgToggleSidebarIcon` | **Empty 32×32 icon frame** (contains only an empty `<g id="Vector">`); reused as the base layer of every 20px icon slot — duplicate of existing `*-frame-empty.svg` pattern | `0 0 32 32` | (none) |
| `dash-5.svg` | `imgVector` | Toggle-sidebar icon: inner vertical divider line, stroke `#121212` | `0 0 1 13.5` | `M0.5 0.5V13` |
| `dash-6.svg` | `imgVector1` | Toggle-sidebar icon: rounded panel outline, stroke `#121212` | `0 0 16 13.5` | `M14.875 0.5H1.125C0.779822 0.5 0.5 0.779822 0.5 1.125V12.375C0.5 12.7202 0.779822 13 1.125 13H14.875C15.2202 13 15.5 12.7202 15.5 12.375V1.125C15.5 0.779822 15.2202 0.5 14.875 0.5Z` |
| `dash-7.svg` | `imgVector2` | Toggle-sidebar icon: short horizontal list line, stroke `#121212` — used 3× in the glyph | `0 0 2.875 1` | `M0.5 0.5H2.375` |
| `dash-8.svg` | `imgBackground` | Loading-circle track ring, stroke `#D8D8D8` width 3 (full circle as path) — same glyph as existing `loading-circle-bg-*.svg` | `0 0 20.5 20.5` | full-circle arc path (large; see file) |
| `dash-9.svg` | `imgLine` | Loading-circle progress arc (right half), stroke `#06472C` width 3 — same family as `loading-circle-line-*.svg` | `0 0 11.75 20.5` | right-semicircle arc path (see file) |
| `dash-10.svg` | `imgVector3` | SquaresFour nav icon: one rounded square, stroke `#141414` — used 4× per icon, and the icon repeats on all 13 nav items | `0 0 6 6` | `M4.875 0.5H1.125C0.779822 0.5 0.5 0.779822 0.5 1.125V4.875C0.5 5.22018 0.779822 5.5 1.125 5.5H4.875C5.22018 5.5 5.5 5.22018 5.5 4.875V1.125C5.5 0.779822 5.22018 0.5 4.875 0.5Z` |
| `dash-11.svg` | `imgVector4` | GearSix icon: center circle, stroke `#141414` | `0 0 7.25 7.25` | `M3.625 6.75C5.35089 6.75 6.75 5.35089 6.75 3.625C6.75 1.89911 5.35089 0.5 3.625 0.5C1.89911 0.5 0.5 1.89911 0.5 3.625C0.5 5.35089 1.89911 6.75 3.625 6.75Z` |
| `dash-12.svg` | `imgVector5` | GearSix icon: 6-lobed gear outline, stroke `#141414` | `0 0 17.2457 16` | long lobed outline path (see file) |
| `dash-13.svg` | `imgFrame188` | Full Fratello logo mark (3 polygons, fill `#085937`, clipPath) used in the welcome header at 48.462×30 | `0 0 48.4615 30` | 3 triangle paths (see file) |
| `dash-14.svg` | `imgWaveIncrement` | Progress-bar active segment ("wave-increment"), straight stroke `#06472C` width 4, round caps — same family as `progress-bar-wave-4dp-*.svg` | `0 0 25 4` | `M2 2H7.25H17.75H23` |

**Duplicates:** dash-1 ≡ dash-2 (identical path). dash-1/2/3 are scaled-down versions of existing `logo-poly-left/right/center.svg`. dash-4 duplicates the empty icon-frame asset pattern. dash-8/9 duplicate the loading-circle glyphs; dash-14 duplicates the progress-bar wave glyph. dash-10 is reused 4× per icon and the whole SquaresFour icon is a per-item placeholder repeated 13×.
