'use client'

import { useMemo, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { CaretUp, CaretDown, CaretUpDown } from '@phosphor-icons/react/dist/ssr'
import { Button } from '@/components/ui'
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
    <div className="w-full">
      <div className="w-full overflow-x-auto">
        <table className="w-full">
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
                    {col.sortValue != null ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className={cn(
                          'inline-flex items-center gap-1 text-label-medium font-medium text-tertiary',
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
                      <span className="text-label-medium font-medium text-tertiary">{col.header}</span>
                    )}
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
                  className="border-t border-neutral-primary transition-colors duration-200 ease-standard hover:bg-secondary"
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

      {pageSize != null && totalPages > 1 && paginationLabels != null && (
        <div className="flex items-center justify-between gap-3 border-t border-neutral-primary px-4 py-3">
          <span className="text-paragraph-medium text-tertiary">
            {paginationLabels.pageOf(safePage + 1, totalPages)}
          </span>
          <div className="flex items-center gap-2">
            <Button type="ghost" size="sm" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
              {paginationLabels.prev}
            </Button>
            <Button
              type="ghost"
              size="sm"
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage(safePage + 1)}
            >
              {paginationLabels.next}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
