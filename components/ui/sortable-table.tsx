import * as React from "react"
import { SortableTableWrapper } from "./sortable-table-wrapper"

// Tipos para definir las columnas y el ordenamiento
export interface SortableColumn<T> {
  key: keyof T | string // La clave del campo o un identificador personalizado
  label: string // Texto que se muestra en el header
  sortable?: boolean // Si esta columna es ordenable (por defecto true)
  render?: (item: T) => React.ReactNode // Función personalizada para renderizar la celda
  getSortValue?: (item: T) => unknown // Función para obtener el valor de ordenamiento
  className?: string // Clases CSS adicionales para la celda
}

export interface SortableTableProps<T> {
  data: T[] // Los datos a mostrar
  columns: SortableColumn<T>[] // Definición de las columnas
  className?: string // Clases CSS adicionales para la tabla
  emptyMessage?: string // Mensaje cuando no hay datos
  emptyIcon?: React.ReactNode // Icono cuando no hay datos
}

// Componente principal de la tabla ordenable (Server Component)
export function SortableTable<T>(props: SortableTableProps<T>) {
  return <SortableTableWrapper {...props} />
}

export default SortableTable
