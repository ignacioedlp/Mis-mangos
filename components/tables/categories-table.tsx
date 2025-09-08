"use client"

import * as React from "react"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Percent } from "lucide-react"
import { SortableTableHead, useSortableData } from "@/components/ui/sortable-table-client"
import { EditCategoryDialog } from "@/components/edit-category-dialog"
import { DeleteCategoryButton } from "@/components/delete-category-button"

// Tipo para las categorías con subcategorías
type CategoryWithSubcategories = {
  id: string
  name: string
  budgetPercentage: number | null
  subcategories: Array<{ id: string; name: string; categoryId: string }>
}

interface CategoriesTableProps {
  data: CategoryWithSubcategories[]
  emptyMessage?: string
  emptyIcon?: React.ReactNode
}

export function CategoriesTable({ 
  data, 
  emptyMessage = "No categories yet. Create your first category to get started",
  emptyIcon 
}: CategoriesTableProps) {
  // Función para obtener el valor de ordenamiento
  const getSortValue = React.useCallback((item: CategoryWithSubcategories, key: string) => {
    switch (key) {
      case 'name':
        return item.name
      case 'budgetPercentage':
        return item.budgetPercentage || 0
      case 'subcategories':
        return item.subcategories.length
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
            sortKey="budgetPercentage"
            currentSort={sortConfig}
            onSort={requestSort}
            className="w-24"
          >
            Budget %
          </SortableTableHead>
          <SortableTableHead
            sortKey="subcategories"
            currentSort={sortConfig}
            onSort={requestSort}
            className="w-20"
          >
            Subcategories
          </SortableTableHead>
          <SortableTableHead
            sortable={false}
            sortKey="actions"
            currentSort={sortConfig}
            onSort={requestSort}
            className="w-24"
          >
            Actions
          </SortableTableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((category) => (
          <TableRow key={category.id}>
            <TableCell>
              <span className="font-medium">{category.name}</span>
            </TableCell>
            <TableCell>
              {category.budgetPercentage ? (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Percent className="h-3 w-3" />
                  {category.budgetPercentage}%
                </Badge>
              ) : (
                <span className="text-muted-foreground text-sm">Not set</span>
              )}
            </TableCell>
            <TableCell>
              <Badge variant="secondary">
                {category.subcategories.length}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <EditCategoryDialog category={category} />
                <DeleteCategoryButton 
                  categoryId={category.id} 
                  categoryName={category.name} 
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
