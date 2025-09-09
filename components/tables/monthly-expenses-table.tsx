"use client"

import * as React from "react"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { SortableTableHead, useSortableData } from "@/components/ui/sortable-table-client"
import { ExpenseActionButtons } from "@/components/expense-action-buttons"
import { formatCurrency } from "@/lib/utils"

// Tipo para los elementos mensuales
type MonthlyExpenseItem = {
  expenseId: string
  name: string
  categoryName: string
  subcategoryName: string
  frequency: string
  estimatedAmount: number
  actualAmount: number | null
  isPaid: boolean
  isSkipped: boolean
  paidAt: Date | null
  skippedAt: Date | null
  hasOccurrence: boolean
}

interface MonthlyExpensesTableProps {
  data: MonthlyExpenseItem[]
  year: number
  month: number
  emptyMessage?: string
}

export function MonthlyExpensesTable({ 
  data, 
  year, 
  month, 
  emptyMessage = "No tienes gastos programados para este mes" 
}: MonthlyExpensesTableProps) {
  const frequencyColors = {
    WEEKLY: "bg-blue-100 text-blue-800",
    MONTHLY: "bg-green-100 text-green-800", 
    ANNUAL: "bg-purple-100 text-purple-800",
    ONE_TIME: "bg-orange-100 text-orange-800"
  }

  // Función para obtener el valor de ordenamiento
  const getSortValue = React.useCallback((item: MonthlyExpenseItem, key: string) => {
    switch (key) {
      case 'name':
        return item.name
      case 'categoryName':
        return item.categoryName
      case 'frequency':
        return item.frequency
      case 'estimatedAmount':
        return item.estimatedAmount
      case 'actualAmount':
        return item.actualAmount || 0
      case 'status':
        if (!item.hasOccurrence) return 0
        if (item.isSkipped) return 1
        if (item.isPaid) return 2
        return 3 // pending
      default:
        return ''
    }
  }, [])

  const { sortedData, sortConfig, requestSort } = useSortableData(data, getSortValue)

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableTableHead
            sortKey="name"
            currentSort={sortConfig}
            onSort={requestSort}
          >
            Gasto
          </SortableTableHead>
          <SortableTableHead
            sortKey="categoryName"
            currentSort={sortConfig}
            onSort={requestSort}
          >
            Categoría
          </SortableTableHead>
          <SortableTableHead
            sortKey="frequency"
            currentSort={sortConfig}
            onSort={requestSort}
          >
            Frecuencia
          </SortableTableHead>
          <SortableTableHead
            sortKey="estimatedAmount"
            currentSort={sortConfig}
            onSort={requestSort}
          >
            Estimado
          </SortableTableHead>
          <SortableTableHead
            sortKey="actualAmount"
            currentSort={sortConfig}
            onSort={requestSort}
          >
            Actual
          </SortableTableHead>
          <SortableTableHead
            sortKey="status"
            currentSort={sortConfig}
            onSort={requestSort}
          >
            Estado
          </SortableTableHead>
          <SortableTableHead
            sortable={false}
            sortKey="actions"
            currentSort={sortConfig}
            onSort={requestSort}
          >
            Acciones
          </SortableTableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((item) => (
          <TableRow key={item.expenseId}>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-medium">{item.name}</span>
                <span className="text-xs text-muted-foreground">
                  {item.categoryName} / {item.subcategoryName}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{item.categoryName}</Badge>
            </TableCell>
            <TableCell>
              <Badge 
                variant="secondary" 
                className={frequencyColors[item.frequency as keyof typeof frequencyColors]}
              >
                {item.frequency === 'ONE_TIME' ? 'único' : item.frequency.toLowerCase()}
              </Badge>
            </TableCell>
            <TableCell>
              <span className="font-medium">
                {formatCurrency(item.estimatedAmount)}
              </span>
            </TableCell>
            <TableCell>
              {item.actualAmount ? (
                <span className="text-green-600 font-medium">{formatCurrency(item.actualAmount)}</span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </TableCell>
            <TableCell>
              {!item.hasOccurrence ? (
                <Badge variant="destructive">No occurrence</Badge>
              ) : item.isSkipped ? (
                <Badge variant="outline" className="text-orange-600">Skipped</Badge>
              ) : item.isPaid ? (
                <Badge variant="default">Paid</Badge>
              ) : (
                <Badge variant="secondary">Pending</Badge>
              )}
            </TableCell>
            <TableCell>
              {item.hasOccurrence && (
                <ExpenseActionButtons
                  expenseId={item.expenseId}
                  expenseName={item.name}
                  estimatedAmount={item.estimatedAmount}
                  isPaid={item.isPaid}
                  isSkipped={item.isSkipped}
                  year={year}
                  month={month}
                />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
