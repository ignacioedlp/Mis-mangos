"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
          <CardTitle>Expense Analytics</CardTitle>
          <CardDescription>No data available for charts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Generate expense occurrences to see analytics</p>
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
          <CardTitle>Estimated vs Actual Spending</CardTitle>
          <CardDescription>Compare planned vs actual expenses by category</CardDescription>
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
                  `$${value.toFixed(2)}`, 
                  name === 'estimated' ? 'Estimated' : 'Actual'
                ]}
                labelFormatter={(label) => `Category: ${label}`}
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
          <CardTitle>Spending Distribution</CardTitle>
          <CardDescription>Breakdown of expenses by category</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Category Summary</CardTitle>
          <CardDescription>Detailed breakdown by category</CardDescription>
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
                    <p>Est: ${item.estimated.toFixed(2)}</p>
                    <p>Actual: ${item.actual.toFixed(2)}</p>
                    <p>{item.count} expense{item.count !== 1 ? 's' : ''}</p>
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
