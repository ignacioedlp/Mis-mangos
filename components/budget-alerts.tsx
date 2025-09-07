import { getBudgetAnalysis } from "@/actions/expense-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, TrendingUp, CheckCircle, DollarSign } from "lucide-react"
import { formatCurrency, formatPercentage } from "@/lib/utils"

interface BudgetAlertsProps {
  year?: number
  month?: number
}

export async function BudgetAlerts({ year, month }: BudgetAlertsProps) {
  const budgetData = await getBudgetAnalysis(year, month)
  
  if (budgetData.monthlyIncome === 0) {
    return null // Don't show alerts if no salary is set
  }

  const overBudgetCategories = budgetData.categories.filter(c => c.isOverBudget && c.budgetPercentage > 0)
  const nearLimitCategories = budgetData.categories.filter(c => 
    !c.isOverBudget && 
    c.budgetPercentage > 0 && 
    c.usagePercentage >= 80 && 
    c.usagePercentage < 100
  )
  
  const hasAlerts = overBudgetCategories.length > 0 || nearLimitCategories.length > 0

  if (!hasAlerts) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Budget Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-green-600">
            All categories are within budget! Great job managing your expenses.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Over Budget Alerts */}
      {overBudgetCategories.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Budget Exceeded
              <Badge variant="destructive">{overBudgetCategories.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overBudgetCategories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-3 rounded-lg border border-red-800 bg-red-950/20">
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{category.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatPercentage(category.usagePercentage)} used
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-xs">
                    +{formatCurrency(Math.abs(category.remaining))} over
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Near Limit Alerts */}
      {nearLimitCategories.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              Near Budget Limit
              <Badge variant="outline" className="text-orange-600">{nearLimitCategories.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nearLimitCategories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-3 rounded-lg border border-orange-800 bg-orange-950/20">
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{category.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatPercentage(category.usagePercentage)} used
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs border-orange-300">
                    {formatPercentage(category.usagePercentage)}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Budget Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Budget Summary</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{formatPercentage(budgetData.totalBudgetPercentage)}</div>
              <p className="text-xs text-muted-foreground">allocated</p>
            </div>
            {budgetData.hasUnassignedIncome && (
              <div className="text-right">
                <div className="text-sm font-medium">{formatCurrency(budgetData.unassignedAmount || 0)}</div>
                <p className="text-xs text-muted-foreground">unassigned</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
