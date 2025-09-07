import { getComparison } from "@/actions/expense-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react"
import { ComparisonSelector } from "@/components/comparison-selector"
import { ComparisonCharts } from "@/components/comparison-charts"

interface ComparisonPageProps {
  searchParams: Promise<{ 
    startYear?: string
    startMonth?: string
    endYear?: string
    endMonth?: string
  }>
}

export default async function ComparisonPage({ searchParams }: ComparisonPageProps) {
  const params = await searchParams
  const currentDate = new Date()
  
  // Default to last 6 months
  const defaultEndYear = currentDate.getFullYear()
  const defaultEndMonth = currentDate.getMonth() + 1
  const defaultStartDate = new Date(defaultEndYear, defaultEndMonth - 7, 1)
  
  const startYear = parseInt(params.startYear || defaultStartDate.getFullYear().toString())
  const startMonth = parseInt(params.startMonth || (defaultStartDate.getMonth() + 1).toString())
  const endYear = parseInt(params.endYear || defaultEndYear.toString())
  const endMonth = parseInt(params.endMonth || defaultEndMonth.toString())
  
  const comparisonData = await getComparison(startYear, startMonth, endYear, endMonth)

  const totalEstimated = comparisonData.reduce((sum, d) => sum + d.totalEstimated, 0)
  const totalActual = comparisonData.reduce((sum, d) => sum + d.totalActual, 0)
  const totalSalary = comparisonData.reduce((sum, d) => sum + d.salary, 0)
  const avgSavingsRate = comparisonData.length > 0 
    ? comparisonData.reduce((sum, d) => sum + d.savingsRate, 0) / comparisonData.length 
    : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Expense Comparison</h2>
            <p className="text-muted-foreground">Compare expenses across different time periods</p>
          </div>
          <ComparisonSelector 
            startYear={startYear} 
            startMonth={startMonth}
            endYear={endYear}
            endMonth={endMonth}
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Period Estimated</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEstimated.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{comparisonData.length} months</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Period Actual</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalActual.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {totalEstimated > 0 ? ((totalActual / totalEstimated) * 100).toFixed(1) : 0}% of estimated
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Salary</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalSalary.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total income period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Savings Rate</CardTitle>
            <Percent className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{avgSavingsRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Average across period</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <ComparisonCharts data={comparisonData} />

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Breakdown</CardTitle>
          <CardDescription>Detailed comparison by month</CardDescription>
        </CardHeader>
        <CardContent>
          {comparisonData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No data available for the selected period</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Estimated</TableHead>
                  <TableHead>Actual</TableHead>
                  <TableHead>Savings</TableHead>
                  <TableHead>Savings Rate</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonData.map((data) => (
                  <TableRow key={`${data.year}-${data.month}`}>
                    <TableCell className="font-medium">
                      {data.monthName}
                    </TableCell>
                    <TableCell>
                      {data.salary > 0 ? `$${data.salary.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell>
                      ${data.totalEstimated.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      ${data.totalActual.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {data.salary > 0 ? (
                        <span className={data.salary - data.totalActual > 0 ? 'text-green-600' : 'text-red-600'}>
                          ${(data.salary - data.totalActual).toFixed(2)}
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {data.salary > 0 ? (
                        <span className={data.savingsRate > 0 ? 'text-green-600' : 'text-red-600'}>
                          {data.savingsRate.toFixed(1)}%
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Badge variant={data.totalPaid === data.items.length ? "default" : "secondary"}>
                          {data.totalPaid}/{data.items.length} paid
                        </Badge>
                        {data.savingsRate > 20 && (
                          <Badge variant="outline" className="text-green-600">
                            Good savings
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
