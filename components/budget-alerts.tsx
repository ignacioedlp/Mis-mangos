import { getBudgetAnalysis } from "@/actions/expense-actions"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          All categories are within budget! Great job managing your expenses.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {/* Over Budget Alerts */}
      {overBudgetCategories.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="space-y-2">
              <p className="font-medium">
                {overBudgetCategories.length} {overBudgetCategories.length === 1 ? 'category is' : 'categories are'} over budget:
              </p>
              <div className="flex flex-wrap gap-2">
                {overBudgetCategories.map((category) => (
                  <Badge key={category.id} variant="destructive" className="text-xs">
                    {category.name}: {formatCurrency(Math.abs(category.remaining))} over
                  </Badge>
                ))}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Near Limit Alerts */}
      {nearLimitCategories.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <TrendingUp className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="space-y-2">
              <p className="font-medium">
                {nearLimitCategories.length} {nearLimitCategories.length === 1 ? 'category is' : 'categories are'} near budget limit:
              </p>
              <div className="flex flex-wrap gap-2">
                {nearLimitCategories.map((category) => (
                  <Badge key={category.id} variant="outline" className="text-xs border-orange-300">
                    {category.name}: {formatPercentage(category.usagePercentage)} used
                  </Badge>
                ))}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Budget Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Budget Status</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600">
                {formatPercentage(budgetData.totalBudgetPercentage)} allocated
              </p>
              {budgetData.hasUnassignedIncome && (
                <p className="text-xs text-blue-500">
                  {formatCurrency(budgetData.unassignedAmount || 0)} unassigned
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
