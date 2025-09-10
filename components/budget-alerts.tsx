import { getBudgetAnalysis } from "@/actions/expense-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, TrendingUp, CheckCircle, DollarSign } from "lucide-react"
import { formatCurrency, formatPercentage } from "@/lib/utils"

// Barra stackeada compacta para distribución del presupuesto
function BudgetDistributionMini({
  categories,
  totalBudgetPercentage,
  unassignedPercentage,
}: {
  categories: { id: string; name: string; budgetPercentage: number; isOverBudget: boolean }[];
  totalBudgetPercentage: number;
  unassignedPercentage: number;
}) {
  const ordered = categories
    .filter(c => c.budgetPercentage > 0)
    .sort((a,b) => b.budgetPercentage - a.budgetPercentage);

  // Limitar segmentos para no saturar la barra (agrupa "otros")
  const maxSegments = 8;
  let display = ordered.slice(0, maxSegments);
  if (ordered.length > maxSegments) {
    const restPct = ordered.slice(maxSegments).reduce((s,c)=> s + c.budgetPercentage, 0);
    display = [...display, { id: 'otros', name: 'Otros', budgetPercentage: restPct, isOverBudget: false }];
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] uppercase tracking-wide text-muted-foreground">
        <span>Distribución</span>
        <span>{totalBudgetPercentage.toFixed(1)}% asignado</span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-sm border bg-muted/40">
        <div className="absolute inset-0 flex">
          {display.map((c, idx) => (
            <div
              key={c.id}
              title={`${c.name}: ${c.budgetPercentage.toFixed(1)}%`}
              className="h-full first:rounded-l-sm last:rounded-r-sm"
              style={{
                width: `${c.budgetPercentage}%`,
                background: c.id === 'otros'
                  ? 'repeating-linear-gradient(45deg,hsl(var(--border)) 0 4px,hsl(var(--muted)) 4px 8px)'
                  : c.isOverBudget
                    ? 'linear-gradient(135deg,hsl(var(--destructive)),hsl(var(--destructive-foreground)))'
                    : `var(--color-chart-${(idx % 5) + 1})`,
                opacity: c.isOverBudget ? 0.9 : 0.85,
              }}
            />
          ))}
          {unassignedPercentage > 0 && (
            <div
              title={`No asignado: ${unassignedPercentage.toFixed(1)}%`}
              style={{ width: `${unassignedPercentage}%` }}
              className="h-full bg-border/50 text-[9px] flex items-center justify-center text-foreground/60"
            >
              Libre
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {display.slice(0,6).map((c, idx) => (
          <span key={c.id} className="flex items-center gap-1 rounded bg-muted/60 px-1.5 py-0.5 text-[10px]">
            <span
              className="inline-block h-2 w-2 rounded-[2px]"
              style={{
                background: c.id === 'otros'
                  ? 'hsl(var(--border))'
                  : c.isOverBudget
                    ? 'hsl(var(--destructive))'
                    : `var(--color-chart-${(idx % 5) + 1})`,
              }}
            />
            {c.name} {c.budgetPercentage.toFixed(0)}%
          </span>
        ))}
        {display.length > 6 && (
          <span className="text-[10px] text-muted-foreground">+{display.length - 6}</span>
        )}
      </div>
    </div>
  );
}

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
            <CheckCircle className="h-4 w-4 text-primary" />
            Estado del Presupuesto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            ¡Todas las categorías están dentro del presupuesto! Gran trabajo gestionando tus gastos.
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
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Presupuesto Excedido
              <Badge variant="destructive">{overBudgetCategories.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overBudgetCategories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-3 rounded-lg border border-destructive/30 bg-destructive/10">
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{category.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatPercentage(category.usagePercentage)} utilizado
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-xs">
                    +{formatCurrency(Math.abs(category.remaining))} sobre el presupuesto
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
        <TrendingUp className="h-4 w-4 text-accent-foreground" />
              Cerca del Límite del Presupuesto
        <Badge variant="outline" className="border-accent/50 text-accent-foreground">{nearLimitCategories.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nearLimitCategories.map((category) => (
        <div key={category.id} className="flex items-center justify-between p-3 rounded-lg border border-accent/40 bg-accent/10">
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{category.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatPercentage(category.usagePercentage)} utilizado
                  </span>
                </div>
                <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs border-accent/50 text-accent-foreground">
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
          <CardTitle className="text-sm font-medium">Resumen del Presupuesto</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xl font-bold leading-tight">{formatPercentage(budgetData.totalBudgetPercentage)}</div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Asignado</p>
            </div>
            {budgetData.hasUnassignedIncome && (
              <div className="text-right">
                <div className="text-sm font-medium">{formatCurrency(budgetData.unassignedAmount || 0)}</div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">No Asignado</p>
              </div>
            )}
          </div>
          <BudgetDistributionMini
            categories={budgetData.categories}
            totalBudgetPercentage={budgetData.totalBudgetPercentage}
            unassignedPercentage={budgetData.hasUnassignedIncome ? (100 - budgetData.totalBudgetPercentage) : 0}
          />
        </CardContent>
      </Card>
    </div>
  )
}
