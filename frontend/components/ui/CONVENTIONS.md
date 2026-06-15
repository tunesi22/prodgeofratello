# components/ui — implementation conventions

Every component here is implemented 1:1 from `.design/specs/<name>.md`. Read
`DESIGN_SYSTEM.md` (repo root) first. These conventions are mandatory:

## Files & exports
- One component per file, PascalCase: `Button.tsx`, `IconButton.tsx`, `Chip.tsx`,
  `Input.tsx`, `TextBox.tsx`, `Toggle.tsx`, `Checkbox.tsx`, `Radio.tsx`, `Tabs.tsx`,
  `ProgressBar.tsx`, `LoadingCircle.tsx`, `ValidationCheck.tsx`, `ContextualMenu.tsx`,
  `Breadcrumb.tsx`, `ListRow.tsx`.
- Named export of the component AND its props type: `export function Button(...)`,
  `export interface ButtonProps`.
- Re-export everything from `index.ts`.

## Styling
- Tailwind utilities mapped to tokens ONLY (see `tailwind.config.ts`):
  `bg-btn-primary`, `text-white-remain`, `border-neutral-primary`, `rounded-token-8`,
  `text-action-medium`, `shadow-regular-sm`, etc.
- NO hex literals, NO arbitrary values for tokenized properties. Exceptions allowed:
  exact component dimensions from the spec (e.g. `h-[36px] w-[36px]`, `size-[20px]`)
  where no spacing utility matches, and SVG geometry.
- States: `active:` for pressed (+ `data-[pressed=true]:` if controlled),
  `focus-visible:` mirrors pressed per design ("Pressed / Focused" is one state),
  `disabled:` for disabled. Hover uses the pressed token at reduced confidence only
  if the spec defines it — otherwise no hover-specific color.
- All state changes ease: `transition-colors duration-200 ease-standard`.

## Behavior
- `'use client'` only when the component uses hooks/handlers internally.
- Native semantics: Button → `<button>`, Input → `<label>+<input>`, Checkbox →
  `<button role="checkbox" aria-checked>` or native input, Toggle → `role="switch"`.
- Spread `...rest` onto the root interactive element; accept `className` merged last
  via `cn()` from `@/lib/cn`.
- Icons are passed as props (`icon?: React.ReactNode`, `iconLeft`, `iconRight`) —
  components never bake in specific icons unless the spec defines them (e.g.
  Checkbox checkmark, ValidationCheck circle) — those are inline `<svg>` with
  `currentColor`/token classes, path data from the spec.
- Disabled: `disabled` attribute + spec-defined disabled tokens (not just opacity,
  unless the spec says opacity).

## Motion
- Use tokens from `@/lib/motion` for any framer-motion usage; plain CSS transitions
  use `ease-standard` / `duration-200|300|400|500` utilities only.
- LoadingCircle: CSS rotation animation, 1s linear infinite is allowed (continuous
  spin is exempt from the duration tokens; the arc itself per spec).

## Theming
- Never reference light/dark explicitly — semantic tokens flip automatically with
  `[data-theme]`. If a spec lists light hex values, use the TOKEN, not the hex.
