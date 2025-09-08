"use client"

import * as React from "react"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { SortableTableHead, useSortableData } from "@/components/ui/sortable-table-client"
import type { SortableTableProps } from "./sortable-table"

// Función auxiliar para obtener valores anidados (ej: "category.name")
function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((current: unknown, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

// Client Component que maneja la lógica de ordenamiento
export function SortableTableWrapper<T>({
  data,
  columns,
  className,
  emptyMessage = "No data available",
  emptyIcon
}: SortableTableProps<T>) {
  // Función para obtener el valor de ordenamiento
  const getSortValue = React.useCallback((item: T, key: string) => {
    const column = columns.find(col => String(col.key) === key)
    if (column?.getSortValue) {
      return column.getSortValue(item)
    }
    return getNestedValue(item, key)
  }, [columns])

  const { sortedData, sortConfig, requestSort } = useSortableData(data, getSortValue)

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyIcon && <div className="mb-4">{emptyIcon}</div>}
        <p>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <Table className={className}>
      <TableHeader>
        <TableRow>
          {columns.map((column, index) => (
            <SortableTableHead
              key={`${String(column.key)}-${index}`}
              sortable={column.sortable}
              sortKey={String(column.key)}
              currentSort={sortConfig}
              onSort={requestSort}
              className={column.className}
            >
              {column.label}
            </SortableTableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((item, index) => (
          <TableRow key={index}>
            {columns.map((column, colIndex) => (
              <TableCell 
                key={`${String(column.key)}-${colIndex}`}
                className={column.className}
              >
                {column.render 
                  ? column.render(item)
                  : String(getNestedValue(item, column.key as string) || '')
                }
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
