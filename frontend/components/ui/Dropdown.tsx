'use client'

import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent, ReactElement } from 'react'
import { CaretDown, CaretUp, Check } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/cn'

/**
 * Dropdown, implemented from the design-system spec (Figma node 2097:835).
 *
 * A labelled single-select control: a bordered trigger showing the selected
 * value (or a tertiary placeholder) plus a caret that flips up while open, and
 * a listbox panel of options. States from the spec: Idle, Active (open, brand
 * border + CaretUp), Disabled (btn-disabled bg), Error (error border + label),
 * Filled (value in text-primary).
 *
 * A11y: combobox + listbox pattern. Focus stays on the trigger; ArrowUp/Down
 * move `aria-activedescendant`, Enter/Space selects, Escape/click-outside close.
 */

export interface DropdownOption {
  value: string
  label: string
  disabled?: boolean
}

export interface DropdownProps {
  /** Field label rendered above the control. */
  label?: string
  /** Selected value (controlled). */
  value: string
  options: DropdownOption[]
  onChange: (value: string) => void
  /** Shown (text-tertiary) when no option matches `value`. */
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: boolean
  /** Accessible name when no visible `label` is rendered. */
  'aria-label'?: string
  className?: string
}

export function Dropdown({
  label,
  value,
  options,
  onChange,
  placeholder = '',
  required = false,
  disabled = false,
  error = false,
  className,
  'aria-label': ariaLabel,
}: DropdownProps): ReactElement {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [dropUp, setDropUp] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const baseId = useId()
  const labelId = `${baseId}-label`
  const listId = `${baseId}-list`
  const optionId = (i: number): string => `${baseId}-opt-${i}`

  const selected = options.find((o) => o.value === value) ?? null
  const displayText = selected?.label ?? placeholder

  // Close when clicking outside the control.
  useEffect(() => {
    if (!open) return
    function onDocMouseDown(e: MouseEvent): void {
      if (rootRef.current != null && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [open])

  // Keep the highlighted option in view.
  useEffect(() => {
    if (!open || activeIndex < 0) return
    document.getElementById(optionId(activeIndex))?.scrollIntoView({ block: 'nearest' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeIndex])

  function nextEnabled(from: number, dir: 1 | -1): number {
    const n = options.length
    if (n === 0) return -1
    let i = from
    for (let step = 0; step < n; step++) {
      i = (i + dir + n) % n
      if (!options[i].disabled) return i
    }
    return from
  }

  function openMenu(): void {
    if (disabled) return
    const idx = options.findIndex((o) => o.value === value)
    setActiveIndex(idx >= 0 ? idx : nextEnabled(-1, 1))
    // Flip the menu above the trigger when there is not enough room below.
    const rect = triggerRef.current?.getBoundingClientRect()
    if (rect != null) {
      const spaceBelow = window.innerHeight - rect.bottom
      setDropUp(spaceBelow < 280 && rect.top > spaceBelow)
    }
    setOpen(true)
  }

  function commit(idx: number): void {
    const opt = options[idx]
    if (opt == null || opt.disabled) return
    onChange(opt.value)
    setOpen(false)
    triggerRef.current?.focus()
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>): void {
    if (disabled) return
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        openMenu()
      }
      return
    }
    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        break
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((i) => nextEnabled(i, 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((i) => nextEnabled(i, -1))
        break
      case 'Home':
        e.preventDefault()
        setActiveIndex(nextEnabled(-1, 1))
        break
      case 'End':
        e.preventDefault()
        setActiveIndex(nextEnabled(0, -1))
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        commit(activeIndex)
        break
      default:
        break
    }
  }

  return (
    <div ref={rootRef} className={cn('relative flex w-full flex-col gap-2', className)}>
      {label != null && (
        <span
          id={labelId}
          className={cn('text-field-label font-semibold', error ? 'text-error-token' : 'text-secondary')}
        >
          {label}
          {required && (
            <span aria-hidden="true" className="text-error-token">
              {' '}
              *
            </span>
          )}
        </span>
      )}
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && activeIndex >= 0 ? optionId(activeIndex) : undefined}
        aria-labelledby={label != null ? labelId : undefined}
        aria-label={label == null ? ariaLabel : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-token-8 border px-3 py-2 text-left outline-none transition-colors duration-200 ease-standard',
          disabled ? 'cursor-not-allowed bg-btn-disabled' : 'bg-primary',
          error ? 'border-error-token' : open ? 'border-brand-token' : 'border-neutral-primary',
        )}
      >
        <span
          className={cn(
            'min-w-0 flex-1 truncate text-field-input font-normal',
            selected != null ? 'text-primary' : 'text-tertiary',
          )}
        >
          {displayText}
        </span>
        {open ? (
          <CaretUp className="size-5 shrink-0 text-icon-dark-gray" aria-hidden="true" />
        ) : (
          <CaretDown className="size-5 shrink-0 text-icon-dark-gray" aria-hidden="true" />
        )}
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={label != null ? labelId : undefined}
          className={cn(
            'absolute inset-x-0 z-30 flex max-h-96 flex-col gap-1.5 overflow-y-auto rounded-token-12 border border-neutral-primary bg-card p-2 shadow-center-md',
            dropUp ? 'bottom-full mb-2' : 'top-full mt-2',
          )}
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value
            const isActive = i === activeIndex
            return (
              <li key={opt.value} id={optionId(i)} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  tabIndex={-1}
                  disabled={opt.disabled}
                  onClick={() => commit(i)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-token-8 px-3 py-2.5 text-left text-paragraph-medium transition-colors duration-200 ease-standard',
                    opt.disabled
                      ? 'cursor-not-allowed text-disabled'
                      : isSelected
                        ? 'bg-display-brand text-brand-token'
                        : isActive
                          ? 'bg-btn-ghost-pressed text-primary'
                          : 'text-primary',
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                  {isSelected && <Check className="size-4 shrink-0" aria-hidden="true" />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
