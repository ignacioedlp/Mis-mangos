"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

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

interface ExpensesByMonthChartProps {
  data: ComparisonDataItem[]
}

export function ExpensesByMonthChart({ data }: ExpensesByMonthChartProps) {
  // Filtrar gastos que no sean ONE_TIME y que no estén saltados
  const filteredItems = data.flatMap(monthData =>
    monthData.items
      .filter(item => item.frequency !== 'ONE_TIME' && !item.isSkipped)
      .map(item => ({
        ...item,
        monthKey: monthData.monthName,
        monthShort: monthData.monthName.split(' ')[0], // Solo el nombre del mes
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
          <CardTitle className="font-serif text-lg font-bold">Evolución de Gastos por Mes</CardTitle>
          <CardDescription>Gastos recurrentes a lo largo del tiempo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No hay gastos recurrentes disponibles para mostrar</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Función para sanitizar nombres (para usar como claves en datos y config)
  const sanitizeName = (name: string) => {
    return name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
  }

  // Crear mapeo de nombres sanitizados a nombres originales
  const nameMap = new Map<string, string>()
  expenseNames.forEach(originalName => {
    nameMap.set(sanitizeName(originalName), originalName)
  })

  // Colores para las líneas (usar colores hexadecimales directos y visibles)
  const chartColors = [
    '#3b82f6', // Azul
    '#ef4444', // Rojo
    '#10b981', // Verde
    '#f59e0b', // Naranja
    '#8b5cf6', // Púrpura
    '#ec4899', // Rosa
    '#06b6d4', // Cian
    '#84cc16', // Lima
  ]

  // También crear un mapeo de nombres sanitizados a colores para usar directamente
  const expenseColorMap = new Map<string, string>()
  expenseNames.forEach((name, index) => {
    expenseColorMap.set(sanitizeName(name), chartColors[index % chartColors.length])
  })

  // Crear estructura de datos para el gráfico
  // Usar nombres sanitizados como claves para evitar problemas con espacios
  const chartData = data.map(monthData => {
    const monthEntry: Record<string, string | number> = {
      month: monthData.monthName.split(' ')[0], // Solo nombre del mes
      monthFull: monthData.monthName // Nombre completo para el tooltip
    }

    // Para cada gasto, agregar su monto usando el nombre sanitizado como clave
    expenseNames.forEach(expenseName => {
      const expenseItem = monthData.items.find(
        item => item.name === expenseName &&
          item.frequency !== 'ONE_TIME' &&
          !item.isSkipped
      )

      const sanitizedKey = sanitizeName(expenseName)
      if (expenseItem) {
        // Usar el monto actual si está disponible y pagado, sino el estimado
        const amount = expenseItem.isPaid && expenseItem.actualAmount !== null
          ? expenseItem.actualAmount
          : expenseItem.estimatedAmount
        monthEntry[sanitizedKey] = amount
      } else {
        // Si el gasto no existe en este mes, poner 0
        monthEntry[sanitizedKey] = 0
      }
    })

    return monthEntry
  })

  // Crear configuración del gráfico
  // Usar nombres sanitizados como claves
  const chartConfig: ChartConfig = expenseNames.reduce((config, originalName, index) => {
    const sanitizedKey = sanitizeName(originalName)
    config[sanitizedKey] = {
      label: originalName, // Mostrar el nombre original en las etiquetas
      color: chartColors[index % chartColors.length]
    }
    return config
  }, {} as ChartConfig)

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="font-serif text-lg font-bold">Evolución de Gastos por Mes</CardTitle>
        <CardDescription>Gastos recurrentes a lo largo del tiempo (excluye gastos únicos)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[400px]">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value?: unknown, name?: unknown) => {
                    // name será el nombre sanitizado, necesitamos el original
                    const sanitizedName = String(name ?? '')
                    const originalName = nameMap.get(sanitizedName) || sanitizedName
                    return (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{originalName}</span>
                        <span className="font-mono">
                          {typeof value === 'number' ? formatCurrency(value) : String(value ?? '')}
                        </span>
                      </div>
                    )
                  }}
                  labelFormatter={(label) => `Mes: ${label}`}
                />
              }
            />
            {expenseNames.map((originalName, index) => {
              const sanitizedKey = sanitizeName(originalName)
              // Obtener el color directamente del array
              const lineColor = chartColors[index % chartColors.length]
              return (
                <Line
                  key={originalName}
                  type="monotone"
                  dataKey={sanitizedKey}
                  stroke={lineColor}
                  strokeWidth={3}
                  dot={{ r: 4, fill: lineColor }}
                  activeDot={{ r: 6, fill: lineColor }}
                  connectNulls={true}
                  isAnimationActive={true}
                />
              )
            })}
            <ChartLegend content={<ChartLegendContent />} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

