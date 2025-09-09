"use client"

import * as React from "react"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { SortableTableHead, useSortableData } from "@/components/ui/sortable-table-client"
import { DeleteSubcategoryButton } from "@/components/delete-subcategory-button"

// Tipo para las subcategorías
type SubcategoryData = {
  id: string
  name: string
  categoryId: string
}

// Tipo para las categorías (para obtener el nombre padre)
type CategoryData = {
  id: string
  name: string
}

interface SubcategoriesTableProps {
  data: SubcategoryData[]
  categories: CategoryData[]
  emptyMessage?: string
}

export function SubcategoriesTable({ 
  data, 
  categories,
  emptyMessage = "Aun no hay subcategorías. Crea tu primera subcategoría para comenzar"
}: SubcategoriesTableProps) {
  // Función para obtener el valor de ordenamiento
  const getSortValue = React.useCallback((item: SubcategoryData, key: string) => {
    switch (key) {
      case 'name':
        return item.name
      case 'category':
        const parentCategory = categories.find(c => c.id === item.categoryId)
        return parentCategory?.name || ''
      default:
        return ''
    }
  }, [categories])

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
            Nombre
          </SortableTableHead>
          <SortableTableHead
            sortKey="category"
            currentSort={sortConfig}
            onSort={requestSort}
          >
            Categoria
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
        {sortedData.map((subcategory) => {
          const parentCategory = categories.find(c => c.id === subcategory.categoryId)
          return (
            <TableRow key={subcategory.id}>
              <TableCell>
                <span className="font-medium">{subcategory.name}</span>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {parentCategory?.name || 'Unknown'}
                </Badge>
              </TableCell>
              <TableCell>
                <DeleteSubcategoryButton 
                  subcategoryId={subcategory.id} 
                  subcategoryName={subcategory.name} 
                />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
