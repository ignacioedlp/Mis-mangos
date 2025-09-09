"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface ExpenseChartsProps {
  categoryData: Array<{
    category: string
    estimated: number
    actual: number
    count: number
  }>
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
  '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'
]

export function ExpenseCharts({ categoryData }: ExpenseChartsProps) {
  if (!categoryData || categoryData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analisis de gastos</CardTitle>
          <CardDescription>No hay datos disponibles para los gráficos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Genera ocurrencias de gastos para ver análisis</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare data for pie chart
  const pieData = categoryData.map((item, index) => ({
    name: item.category,
    value: item.actual || item.estimated,
    color: COLORS[index % COLORS.length]
  }))

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Bar Chart - Estimated vs Actual */}
      <Card>
        <CardHeader>
          <CardTitle>Gastos Estimados vs Reales</CardTitle>
          <CardDescription>Compara los gastos planificados vs reales por categoría</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `${formatCurrency(value)}`, 
                  name === 'estimated' ? 'Estimado' : 'Real'
                ]}
                labelFormatter={(label) => `Categoría: ${label}`}
              />
              <Bar dataKey="estimated" fill="#8884d8" name="estimated" />
              <Bar dataKey="actual" fill="#82ca9d" name="actual" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pie Chart - Spending Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Gastos</CardTitle>
          <CardDescription>Desglose de gastos por categoría</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: { name?: string; percent?: number }) => `${props.name} ${((props.percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${formatCurrency(value)}`, 'Monto']} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Resumen por Categoría</CardTitle>
          <CardDescription>Desglose detallado por categoría</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {categoryData.map((item, index) => (
              <div 
                key={item.category}
                className="flex items-center gap-3 p-3 rounded-lg border"
              >
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.category}</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Est: {formatCurrency(item.estimated)}</p>
                    <p>Actual: {formatCurrency(item.actual)}</p>
                    <p>{item.count} gasto{item.count !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
