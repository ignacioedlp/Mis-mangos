"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts'

interface ComparisonChartsProps {
  data: Array<{
    monthName: string
    year: number
    month: number
    totalEstimated: number
    totalActual: number
    salary: number
    savingsRate: number
  }>
}

export function ComparisonCharts({ data }: ComparisonChartsProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Grafico de Comparación</CardTitle>
          <CardDescription>No hay datos disponibles para los gráficos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Selecciona un período de tiempo para ver los gráficos de comparación</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare data for charts
  const chartData = data.map(item => ({
    month: item.monthName.split(' ')[0], // Just month name
    estimated: item.totalEstimated,
    actual: item.totalActual,
    salary: item.salary,
    savings: item.salary - item.totalActual,
    savingsRate: item.savingsRate
  }))

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Spending Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Tendencias de gastos</CardTitle>
          <CardDescription>Gasto estimado vs real a lo largo del tiempo</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `${formatCurrency(value)}`, 
                  name === 'estimated' ? 'Estimado' : 'Real'
                ]}
              />
              <Line type="monotone" dataKey="estimated" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="actual" stroke="#82ca9d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Savings Rate Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Tendencia de la Tasa de Ahorro</CardTitle>
          <CardDescription>Tu porcentaje de tasa de ahorro a lo largo del tiempo</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Tasa de Ahorro']}
              />
              <Area 
                type="monotone" 
                dataKey="savingsRate" 
                stroke="#ffc658" 
                fill="#ffc658" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Income vs Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Ingreso vs Gastos</CardTitle>
          <CardDescription>Salario mensual en comparación con el gasto real</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `${formatCurrency(value)}`, 
                  name === 'salary' ? 'Salario' : 'Gasto'
                ]}
              />
              <Bar dataKey="salary" fill="#4ade80" />
              <Bar dataKey="actual" fill="#f87171" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Net Savings */}
      <Card>
        <CardHeader>
          <CardTitle>Ahorros Netos</CardTitle>
          <CardDescription>Monto ahorrado cada mes (Salario - Gastos)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [
                  `${formatCurrency(value)}`, 
                  value >= 0 ? 'Ahorrado' : 'Déficit'
                ]}
              />
              <Bar 
                dataKey="savings" 
                fill="#10b981"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
