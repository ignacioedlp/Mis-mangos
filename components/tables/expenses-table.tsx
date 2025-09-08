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
  emptyMessage = "No expenses yet. Create your first expense to get started",
  emptyIcon 
}: ExpensesTableProps) {
  const frequencyColors = {
    WEEKLY: "bg-blue-100 text-blue-800",
    MONTHLY: "bg-green-100 text-green-800", 
    ANNUAL: "bg-purple-100 text-purple-800",
    ONE_TIME: "bg-orange-100 text-orange-800"
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
            Name
          </SortableTableHead>
          <SortableTableHead
            sortKey="category"
            currentSort={sortConfig}
            onSort={requestSort}
          >
            Category
          </SortableTableHead>
          <SortableTableHead
            sortKey="estimatedAmount"
            currentSort={sortConfig}
            onSort={requestSort}
          >
            Amount
          </SortableTableHead>
          <SortableTableHead
            sortKey="frequency"
            currentSort={sortConfig}
            onSort={requestSort}
          >
            Frequency
          </SortableTableHead>
          <SortableTableHead
            sortable={false}
            sortKey="actions"
            currentSort={sortConfig}
            onSort={requestSort}
            className="w-20"
          >
            Actions
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
                {expense.frequency === 'ONE_TIME' ? 'único' : expense.frequency.toLowerCase()}
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
