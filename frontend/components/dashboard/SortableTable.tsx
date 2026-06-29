'use client'

import { useMemo, useState } from 'react'
import type { KeyboardEvent, ReactElement, ReactNode } from 'react'
import { CaretUp, CaretDown, CaretUpDown } from '@phosphor-icons/react/dist/ssr'
import { Button, Popover } from '@/components/ui'
import { QuestionIcon } from '@/components/onboarding/icons'
import { cn } from '@/lib/cn'

export type SortDir = 'asc' | 'desc'

export interface Column<T> {
  /** Stable key, also used as the sort identity. */
  key: string
  header: string
  /** Cell renderer. */
  render: (row: T) => ReactNode
  /** When set, the column is sortable; returns the comparable value. */
  sortValue?: (row: T) => number | string
  align?: 'left' | 'right'
  /** Tailwind width/!min-width hint for the header cell. */
  className?: string
  /** Optional explainer shown as a "?" popover beside the header text. */
  help?: ReactNode
}

export interface SortableTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  /** Initial sort; omit for the rows' given order. */
  initialSort?: { key: string; dir: SortDir }
  /** Rows per page; omit to show all without pagination. */
  pageSize?: number
  /** Optional <caption> for screen readers. */
  caption?: string
  emptyMessage?: string
  /** Localized "Page X of Y" + prev/next labels for the footer. */
  paginationLabels?: { pageOf: (page: number, total: number) => string; prev: string; next: string }
  /** 'fixed' lets columns be sized by their header `className` and one flex column. */
  layout?: 'auto' | 'fixed'
  /** When set, rows become interactive (click + keyboard) and call this. */
  onRowClick?: (row: T) => void
  /** Render the pagination footer even when there is only one page. */
  alwaysShowPagination?: boolean
}

/**
 * Generic sortable table primitive (DS-styled). Click a sortable header to
 * toggle asc/desc; a Phosphor caret shows the current direction. Headers are
 * <button>s with aria-sort for keyboard + screen-reader support. Optional
 * client-side pagination. Text is >=14px (label/paragraph medium) per the DS
 * 12px-only-in-input-captions rule.
 */
export function SortableTable<T>({
  columns,
  rows,
  rowKey,
  initialSort,
  pageSize,
  caption,
  emptyMessage,
  paginationLabels,
  layout = 'auto',
  onRowClick,
  alwaysShowPagination = false,
}: SortableTableProps<T>): ReactElement {
  const [sort, setSort] = useState<{ key: string; dir: SortDir } | null>(initialSort ?? null)
  const [page, setPage] = useState(0)

  const sortedRows = useMemo(() => {
    if (sort == null) return rows
    const col = columns.find((c) => c.key === sort.key)
    if (col?.sortValue == null) return rows
    const getValue = col.sortValue
    const factor = sort.dir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      const av = getValue(a)
      const bv = getValue(b)
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor
      return String(av).localeCompare(String(bv)) * factor
    })
  }, [rows, sort, columns])

  const totalPages = pageSize != null ? Math.max(1, Math.ceil(sortedRows.length / pageSize)) : 1
  const safePage = Math.min(page, totalPages - 1)
  const pageRows =
    pageSize != null ? sortedRows.slice(safePage * pageSize, safePage * pageSize + pageSize) : sortedRows

  function toggleSort(key: string): void {
    setPage(0)
    setSort((prev) => {
      if (prev?.key !== key) return { key, dir: 'desc' }
      return { key, dir: prev.dir === 'desc' ? 'asc' : 'desc' }
    })
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="w-full overflow-hidden rounded-token-12 border border-neutral-primary bg-card transition-colors duration-300 ease-standard">
        <div className="w-full overflow-x-auto">
          <table className={cn('w-full', layout === 'fixed' && 'table-fixed')}>
          {caption != null && <caption className="sr-only">{caption}</caption>}
          <thead className="bg-secondary transition-colors duration-200 ease-standard">
            <tr>
              {columns.map((col) => {
                const isSorted = sort?.key === col.key
                const ariaSort = !col.sortValue
                  ? undefined
                  : isSorted
                    ? sort?.dir === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={ariaSort}
                    className={cn('px-4 py-3', col.align === 'right' ? 'text-right' : 'text-left', col.className)}
                  >
                    <span className={cn('inline-flex items-center gap-1', col.align === 'right' && 'flex-row-reverse')}>
                      {col.help != null && (
                        <Popover side="bottom" label={col.header} content={col.help} panelClassName="w-64">
                          <QuestionIcon className="size-3.5" />
                        </Popover>
                      )}
                      {col.sortValue != null ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(col.key)}
                          className={cn(
                            'inline-flex items-center gap-1 whitespace-nowrap text-label-medium font-medium text-tertiary',
                            'rounded transition-colors duration-200 ease-standard hover:text-primary',
                            'focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--border-brand)]',
                            col.align === 'right' && 'flex-row-reverse',
                          )}
                        >
                          {col.header}
                          {isSorted ? (
                            sort?.dir === 'asc' ? (
                              <CaretUp className="size-3.5" aria-hidden="true" />
                            ) : (
                              <CaretDown className="size-3.5" aria-hidden="true" />
                            )
                          ) : (
                            <CaretUpDown className="size-3.5 opacity-50" aria-hidden="true" />
                          )}
                        </button>
                      ) : (
                        <span className="whitespace-nowrap text-label-medium font-medium text-tertiary">{col.header}</span>
                      )}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-paragraph-medium text-tertiary"
                >
                  {emptyMessage ?? '-'}
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr
                  key={rowKey(row)}
                  {...(onRowClick != null
                    ? {
                        onClick: () => onRowClick(row),
                        onKeyDown: (e: KeyboardEvent<HTMLTableRowElement>) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            onRowClick(row)
                          }
                        },
                        tabIndex: 0,
                      }
                    : {})}
                  className={cn(
                    'border-t border-neutral-primary transition-colors duration-200 ease-standard hover:bg-secondary',
                    onRowClick != null && 'cursor-pointer outline-none focus-visible:bg-secondary',
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn('px-4 py-3 align-middle', col.align === 'right' ? 'text-right' : 'text-left')}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
          </table>
        </div>
      </div>

      {pageSize != null && paginationLabels != null && (totalPages > 1 || alwaysShowPagination) && (
        <TablePagination
          page={safePage}
          totalPages={totalPages}
          labels={paginationLabels}
          onPrev={() => setPage(safePage - 1)}
          onNext={() => setPage(safePage + 1)}
        />
      )}
    </div>
  )
}

/**
 * Pagination control, rendered as a dedicated row OUTSIDE the table's border
 * (a clean bar below the bordered table) rather than inside it.
 */
export function TablePagination({
  page,
  totalPages,
  labels,
  onPrev,
  onNext,
}: {
  page: number
  totalPages: number
  labels: { pageOf: (page: number, total: number) => string; prev: string; next: string }
  onPrev: () => void
  onNext: () => void
}): ReactElement {
  return (
    <div className="flex items-center justify-between gap-3 px-1">
      <span className="text-paragraph-medium text-tertiary">{labels.pageOf(page + 1, totalPages)}</span>
      <div className="flex items-center gap-2">
        <Button type="ghost" size="sm" disabled={page === 0} onClick={onPrev}>
          {labels.prev}
        </Button>
        <Button type="ghost" size="sm" disabled={page >= totalPages - 1} onClick={onNext}>
          {labels.next}
        </Button>
      </div>
    </div>
  )
}
