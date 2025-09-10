import { getBudgetAnalysis } from "@/actions/expense-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, Percent, PiggyBank } from "lucide-react"
import { formatCurrency, formatPercentage } from "@/lib/utils"

// Tipos locales para evitar any y mejorar DX
type CategoryBudget = {
  id: string
  name: string
  budgetPercentage: number
  budgetAmount: number
  actualSpent: number
  oneTimeSpent: number
  oneTimeCount: number
  recurringSpent: number
  remaining: number
  usagePercentage: number
  isOverBudget: boolean
  expenseCount: number
}

type BudgetAnalysis = {
  year: number
  month: number
  monthlyIncome: number
  categories: CategoryBudget[]
  totalBudgetPercentage: number
  hasUnassignedIncome: boolean
  unassignedAmount?: number
  totalSavings?: number
}

// Componente para la barra de distribución stackeada
function BudgetDistributionBar({
  categories,
  totalBudgetPercentage,
  unassignedPercentage,
}: {
  categories: Pick<CategoryBudget, 'id' | 'name' | 'budgetPercentage' | 'isOverBudget'>[];
  totalBudgetPercentage: number;
  unassignedPercentage: number;
}) {
  const ordered = [...categories]
    .filter(c => c.budgetPercentage > 0)
    .sort((a,b) => b.budgetPercentage - a.budgetPercentage);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Distribución del presupuesto</span>
        <span>{formatPercentage(totalBudgetPercentage)} asignado</span>
      </div>
      <div className="relative h-4 w-full overflow-hidden rounded-md border bg-muted/40">
        <div className="absolute inset-0 flex">
          {ordered.map((c, idx) => {
            const width = `${c.budgetPercentage}%`;
            return (
              <div
                key={c.id}
                title={`${c.name}: ${c.budgetPercentage}%`}
                className="h-full first:rounded-l-md last:rounded-r-md transition-colors"
                style={{
                  width,
                  background: c.isOverBudget ? 'hsl(var(--destructive))' : `var(--color-chart-${(idx % 5) + 1})`,
                  opacity: 0.9,
                }}
              />
            )
          })}
          {unassignedPercentage > 0 && (
            <div
              title={`No asignado: ${unassignedPercentage.toFixed(1)}%`}
              className="h-full bg-border/50 text-[10px] flex items-center justify-center uppercase tracking-wide"
              style={{ width: `${unassignedPercentage}%` }}
            >
              <span className="text-foreground/70 hidden sm:block">Libre</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-1">
        {ordered.slice(0,6).map((c, idx) => (
          <div key={c.id} className="flex items-center gap-1 rounded px-2 py-0.5 bg-muted/60 text-xs border">
            <span className="inline-block h-3.5 w-3.5 rounded-sm" style={{ background: c.isOverBudget ? 'hsl(var(--destructive))' : `var(--color-chart-${(idx % 5) + 1})` }} />
            <span className="font-medium">{c.name}</span>
            <span className="text-muted-foreground">{c.budgetPercentage}%</span>
          </div>
        ))}
        {ordered.length > 6 && (
          <span className="text-xs text-muted-foreground">+{ordered.length - 6} más</span>
        )}
      </div>
    </div>
  )
}

interface BudgetDashboardProps {
  year?: number
  month?: number
}

export async function BudgetDashboard({ year, month }: BudgetDashboardProps) {
  const budgetData = (await getBudgetAnalysis(year, month)) as BudgetAnalysis
  
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
          <BudgetDistributionBar
            categories={budgetData.categories}
            totalBudgetPercentage={budgetData.totalBudgetPercentage}
            unassignedPercentage={budgetData.hasUnassignedIncome ? (100 - budgetData.totalBudgetPercentage) : 0}
          />
          <Separator className="my-4" />
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
                <PiggyBank className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Total Ahorrado</span>
              </div>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(budgetData.totalSavings || 0)}
              </p>
            </div>
            
            {budgetData.hasUnassignedIncome && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">No Asignado</span>
                </div>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(budgetData.unassignedAmount || 0)}
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-muted-foreground">Sobre Presupuesto</span>
              </div>
              <p className="text-2xl font-bold text-destructive">
                {budgetData.categories.filter(c => c.isOverBudget).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(budgetData.categories as CategoryBudget[])
          .filter(category => category.budgetPercentage > 0)
          .map((category: CategoryBudget) => (
            <Card key={category.id} className={category.isOverBudget ? "border-destructive/30" : ""}>
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
                    <span className={category.isOverBudget ? "text-destructive" : "text-primary"}>
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
                        <span className="text-primary">
                          {formatCurrency(category.remaining)} restante
                        </span>
                      ) : (
                        <span className="text-destructive">
                          {formatCurrency(Math.abs(category.remaining))} sobre
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {category.expenseCount} gastos
                    {category.oneTimeCount > 0 && (
                      <span className="ml-2 inline-flex items-center gap-1">
                        • {category.oneTimeCount} único(s) ({formatCurrency(category.oneTimeSpent)})
                      </span>
                    )}
                  </span>
                  {category.isOverBudget ? (
                    <TrendingDown className="h-3 w-3 text-destructive" />
                  ) : (
                    <TrendingUp className="h-3 w-3 text-primary" />
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
