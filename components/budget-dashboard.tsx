import { getBudgetAnalysis } from "@/actions/expense-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, Percent, PiggyBank } from "lucide-react"
import { formatCurrency, formatPercentage } from "@/lib/utils"

interface BudgetDashboardProps {
  year?: number
  month?: number
}

export async function BudgetDashboard({ year, month }: BudgetDashboardProps) {
  const budgetData = await getBudgetAnalysis(year, month)
  
  if (budgetData.monthlyIncome === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Análisis de Presupuesto
          </CardTitle>
          <CardDescription>Realiza un seguimiento de tus gastos en comparación con la asignación de tu presupuesto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No se encontraron datos de salario</p>
            <p className="text-sm">Por favor, establece tu salario mensual para ver el análisis del presupuesto</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const monthName = new Date(budgetData.year, budgetData.month - 1).toLocaleString('default', { 
    month: 'long', 
    year: 'numeric' 
  })

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Resumen del Presupuesto - {monthName}
          </CardTitle>
          <CardDescription>
            Ingreso mensual: {formatCurrency(budgetData.monthlyIncome)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Presupuesto Asignado</span>
              </div>
              <p className="text-2xl font-bold">
                {formatPercentage(budgetData.totalBudgetPercentage)}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <PiggyBank className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-muted-foreground">Total Ahorrado</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(budgetData.totalSavings || 0)}
              </p>
            </div>
            
            {budgetData.hasUnassignedIncome && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-muted-foreground">No Asignado</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(budgetData.unassignedAmount || 0)}
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-muted-foreground">Sobre Presupuesto</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {budgetData.categories.filter(c => c.isOverBudget).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {budgetData.categories
          .filter(category => category.budgetPercentage > 0)
          .map((category) => (
            <Card key={category.id} className={category.isOverBudget ? "border-red-200" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{category.name}</CardTitle>
                  {category.isOverBudget && (
                    <Badge variant="destructive" className="text-xs">
                      Sobre Presupuesto
                    </Badge>
                  )}
                </div>
                <CardDescription className="flex items-center gap-1">
                  <Percent className="h-3 w-3" />
                  {category.budgetPercentage}% del ingreso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Gastado</span>
                    <span className={category.isOverBudget ? "text-red-600" : "text-green-600"}>
                      {formatCurrency(category.actualSpent)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Presupuesto</span>
                    <span>{formatCurrency(category.budgetAmount)}</span>
                  </div>
                  <Progress 
                    value={Math.min(category.usagePercentage, 100)} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatPercentage(category.usagePercentage)} usado</span>
                    <span>
                      {category.remaining >= 0 ? (
                        <span className="text-green-600">
                          {formatCurrency(category.remaining)} restante
                        </span>
                      ) : (
                        <span className="text-red-600">
                          {formatCurrency(Math.abs(category.remaining))} sobre
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{category.expenseCount} gastos</span>
                  {category.isOverBudget ? (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  ) : (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Categories without budget */}
      {budgetData.categories.filter(c => c.budgetPercentage === 0).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Categorías Sin Presupuesto</CardTitle>
            <CardDescription>
              Estas categorías no tienen un porcentaje de presupuesto asignado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {budgetData.categories
                .filter(c => c.budgetPercentage === 0)
                .map((category) => (
                  <Badge key={category.id} variant="outline">
                    {category.name} ({formatCurrency(category.actualSpent)} gastado)
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
