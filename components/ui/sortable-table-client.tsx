"use client"

import * as React from "react"
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

export type SortDirection = 'asc' | 'desc' | null

export interface SortConfig {
  key: string
  direction: SortDirection
}

interface SortableTableHeadProps {
  children: React.ReactNode
  sortable?: boolean
  sortKey: string
  currentSort: SortConfig | null
  onSort: (key: string) => void
  className?: string
}

export function SortableTableHead({ 
  children, 
  sortable = true,
  sortKey,
  currentSort,
  onSort,
  className 
}: SortableTableHeadProps) {
  if (!sortable) {
    return (
      <th className={cn("h-12 px-4 text-left align-middle font-medium text-muted-foreground", className)}>
        {children}
      </th>
    )
  }

  const isActive = currentSort?.key === sortKey
  const direction = isActive ? currentSort.direction : null

  return (
    <th className={cn("h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer select-none hover:bg-muted/50", className)}>
      <div 
        className="flex items-center gap-2"
        onClick={() => onSort(sortKey)}
      >
        <span>{children}</span>
        <div className="flex flex-col">
          {direction === null && <ChevronsUpDown className="h-3 w-3 text-muted-foreground" />}
          {direction === 'asc' && <ChevronUp className="h-3 w-3 text-foreground" />}
          {direction === 'desc' && <ChevronDown className="h-3 w-3 text-foreground" />}
        </div>
      </div>
    </th>
  )
}

// Hook personalizado para manejar el estado del ordenamiento
export function useSortableData<T>(data: T[], getSortValue: (item: T, key: string) => unknown) {
  const [sortConfig, setSortConfig] = React.useState<SortConfig | null>(null)

  const sortedData = React.useMemo(() => {
    if (!sortConfig || sortConfig.direction === null) {
      return data
    }

    return [...data].sort((a, b) => {
      const aValue = getSortValue(a, sortConfig.key)
      const bValue = getSortValue(b, sortConfig.key)

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [data, sortConfig, getSortValue])

  const requestSort = (key: string) => {
    let direction: SortDirection = 'asc'
    
    if (sortConfig && sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc'
      } else if (sortConfig.direction === 'desc') {
        direction = null // Volver al orden original
      }
    }

    setSortConfig({ key, direction })
  }

  return { sortedData, sortConfig, requestSort }
}
