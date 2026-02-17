"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"

// Tipo para los datos de comparación que incluyen items
type ComparisonDataItem = {
  year: number
  month: number
  monthName: string
  items: Array<{
    expenseId: string
    name: string
    categoryName: string
    subcategoryName: string
    frequency: string
    estimatedAmount: number
    actualAmount: number | null
    isPaid: boolean
    isSkipped: boolean
  }>
}

interface ExpensesByMonthTableProps {
  data: ComparisonDataItem[]
}

export function ExpensesByMonthTable({ data }: ExpensesByMonthTableProps) {
  // Filtrar gastos que no sean ONE_TIME y que no estén saltados
  const filteredItems = data.flatMap(monthData =>
    monthData.items
      .filter(item => item.frequency !== 'ONE_TIME' && !item.isSkipped)
      .map(item => ({
        ...item,
        monthKey: monthData.monthName,
        year: monthData.year,
        month: monthData.month
      }))
  )

  // Obtener todos los nombres únicos de gastos
  const expenseNames = Array.from(new Set(filteredItems.map(item => item.name)))

  // Si no hay gastos, mostrar mensaje
  if (expenseNames.length === 0) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="font-serif text-lg font-bold">Gastos por Mes</CardTitle>
          <CardDescription>Desglose de gastos recurrentes por mes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No hay gastos recurrentes disponibles para mostrar</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Crear estructura de datos para la tabla
  // Cada fila será un gasto, cada columna será un mes
  // Primero, crear un mapa de meses con su información
  const monthsData = data.map(monthData => ({
    monthName: monthData.monthName,
    year: monthData.year,
    month: monthData.month,
    key: `${monthData.year}-${monthData.month}`
  }))

  // Crear estructura de datos: cada gasto tiene un objeto con los montos por mes
  const tableData = expenseNames.map(expenseName => {
    const expenseRow: Record<string, string | number> = {
      expenseName: expenseName
    }

    // Para cada mes, buscar el gasto y obtener su monto
    monthsData.forEach(monthInfo => {
      const monthData = data.find(d => d.year === monthInfo.year && d.month === monthInfo.month)
      if (monthData) {
        const expenseItem = monthData.items.find(
          item => item.name === expenseName &&
            item.frequency !== 'ONE_TIME' &&
            !item.isSkipped
        )

        if (expenseItem) {
          // Usar el monto actual si está disponible y pagado, sino el estimado
          const amount = expenseItem.isPaid && expenseItem.actualAmount !== null
            ? expenseItem.actualAmount
            : expenseItem.estimatedAmount
          expenseRow[monthInfo.key] = amount
        } else {
          // Si el gasto no existe en este mes, poner 0
          expenseRow[monthInfo.key] = 0
        }
      }
    })

    return expenseRow
  })

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="font-serif text-lg font-bold">Gastos por Mes</CardTitle>
        <CardDescription>Desglose de gastos recurrentes por mes (excluye gastos únicos)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 z-10">Gasto</TableHead>
                {monthsData.map(monthInfo => (
                  <TableHead key={monthInfo.key} className="min-w-[120px]">
                    {monthInfo.monthName}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row) => (
                <TableRow key={row.expenseName as string}>
                  <TableCell className="font-medium sticky left-0  z-10">
                    {row.expenseName as string}
                  </TableCell>
                  {monthsData.map(monthInfo => {
                    const amount = row[monthInfo.key] as number
                    return (
                      <TableCell key={monthInfo.key}>
                        {amount > 0 ? (
                          <span className="font-medium">
                            {formatCurrency(amount)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

