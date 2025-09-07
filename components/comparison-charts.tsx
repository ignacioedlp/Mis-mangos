"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
          <CardTitle>Comparison Charts</CardTitle>
          <CardDescription>No data available for charts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Select a time period to view comparison charts</p>
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
          <CardTitle>Spending Trends</CardTitle>
          <CardDescription>Estimated vs actual spending over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `$${value.toFixed(2)}`, 
                  name === 'estimated' ? 'Estimated' : 'Actual'
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
          <CardTitle>Savings Rate Trend</CardTitle>
          <CardDescription>Your savings rate percentage over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Savings Rate']}
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
          <CardTitle>Income vs Expenses</CardTitle>
          <CardDescription>Monthly salary compared to actual spending</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `$${value.toFixed(2)}`, 
                  name === 'salary' ? 'Salary' : 'Spending'
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
          <CardTitle>Net Savings</CardTitle>
          <CardDescription>Amount saved each month (Salary - Expenses)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [
                  `$${value.toFixed(2)}`, 
                  value >= 0 ? 'Saved' : 'Deficit'
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
