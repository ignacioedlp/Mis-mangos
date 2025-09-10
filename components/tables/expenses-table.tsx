"use client"

import * as React from "react"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { SortableTableHead, useSortableData } from "@/components/ui/sortable-table-client"
import { ExpenseDeleteButton } from "@/components/table-actions/expense-delete-button"
import { formatCurrency } from "@/lib/utils"

// Tipo para los gastos con relaciones incluidas
type ExpenseWithRelations = {
  id: string
  name: string
  estimatedAmount: number
  frequency: string
  category: {
    name: string
  }
  subcategory: {
    name: string
  }
}

interface ExpensesTableProps {
  data: ExpenseWithRelations[]
  emptyMessage?: string
  emptyIcon?: React.ReactNode
}

export function ExpensesTable({ 
  data, 
  emptyMessage = "No hay gastos aún. Crea tu primer gasto para comenzar",
  emptyIcon 
}: ExpensesTableProps) {
  const frequencyColors = {
    WEEKLY: "bg-muted text-foreground",
    MONTHLY: "bg-primary/10 text-primary", 
    ANNUAL: "bg-accent/10 text-accent-foreground",
    ONE_TIME: "bg-muted text-foreground"
  }

  // Función para obtener el valor de ordenamiento
  const getSortValue = React.useCallback((item: ExpenseWithRelations, key: string) => {
    switch (key) {
      case 'name':
        return item.name
      case 'category':
        return item.category.name
      case 'estimatedAmount':
        return Number(item.estimatedAmount)
      case 'frequency':
        return item.frequency
      default:
        return ''
    }
  }, [])

  const getStatusName = (expense: ExpenseWithRelations) => {
    switch (expense.frequency) {
      case 'WEEKLY':
        return 'Semanal'
      case 'MONTHLY':
        return 'Mensual'
      case 'ANNUAL':
        return 'Anual'
      case 'ONE_TIME':
        return 'Único'
    }
  }

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
    <Table>
      <TableHeader>
        <TableRow>
          <SortableTableHead
            sortKey="name"
            currentSort={sortConfig}
            onSort={requestSort}
          >
            Nombre
          </SortableTableHead>
          <SortableTableHead
            sortKey="category"
            currentSort={sortConfig}
            onSort={requestSort}
          >
            Categoría
          </SortableTableHead>
          <SortableTableHead
            sortKey="estimatedAmount"
            currentSort={sortConfig}
            onSort={requestSort}
          >
            Monto
          </SortableTableHead>
          <SortableTableHead
            sortKey="frequency"
            currentSort={sortConfig}
            onSort={requestSort}
          >
            Frecuencia
          </SortableTableHead>
          <SortableTableHead
            sortable={false}
            sortKey="actions"
            currentSort={sortConfig}
            onSort={requestSort}
            className="w-20"
          >
            Acciones
          </SortableTableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((expense) => (
          <TableRow key={expense.id}>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-medium">{expense.name}</span>
                <span className="text-xs text-muted-foreground">
                  {expense.category.name} / {expense.subcategory.name}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{expense.category.name}</Badge>
            </TableCell>
            <TableCell>
              <span className="font-medium">
                {formatCurrency(Number(expense.estimatedAmount))}
              </span>
            </TableCell>
            <TableCell>
              <Badge 
                variant="secondary" 
                className={frequencyColors[expense.frequency as keyof typeof frequencyColors]}
              >
                {getStatusName(expense)}
              </Badge>
            </TableCell>
            <TableCell>
              <ExpenseDeleteButton expenseId={expense.id} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
