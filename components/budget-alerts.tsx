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
    .sort((a, b) => b.budgetPercentage - a.budgetPercentage);

  // Limitar segmentos para no saturar la barra (agrupa "otros")
  const maxSegments = 8;
  let display = ordered.slice(0, maxSegments);
  if (ordered.length > maxSegments) {
    const restPct = ordered.slice(maxSegments).reduce((s, c) => s + c.budgetPercentage, 0);
    display = [...display, { id: 'otros', name: 'Otros', budgetPercentage: restPct, isOverBudget: false }];
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] uppercase tracking-wide text-muted-foreground">
        <span>Distribución</span>
        <span>{totalBudgetPercentage.toFixed(1)}% asignado</span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-sm border border-border/65 bg-muted/40">
        <div className="absolute inset-0 flex">
          {display.map((c, idx) => (
            <div
              key={c.id}
              title={`${c.name}: ${c.budgetPercentage.toFixed(1)}%`}
              className="h-full first:rounded-l-sm last:rounded-r-sm"
              style={{
                width: `${c.budgetPercentage}%`,
                background: c.id === 'otros'
                  ? 'repeating-linear-gradient(45deg,var(--border) 0 4px,var(--muted) 4px 8px)'
                  : c.isOverBudget
                    ? 'linear-gradient(135deg,var(--destructive),var(--primary))'
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
        {display.slice(0, 6).map((c, idx) => (
          <span key={c.id} className="flex items-center gap-1 rounded-md border border-border/55 bg-muted/60 px-1.5 py-0.5 text-[10px]">
            <span
              className="inline-block h-2 w-2 rounded-[2px]"
              style={{
                background: c.id === 'otros'
                  ? 'var(--border)'
                  : c.isOverBudget
                    ? 'var(--destructive)'
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
          <CardTitle className="flex items-center gap-2 text-sm font-bold">
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-chart-5/35 bg-chart-5/10">
              <CheckCircle className="h-3.5 w-3.5 text-chart-5" />
            </div>
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
        <Card className="border-destructive/35">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <div className="flex h-7 w-7 items-center justify-center rounded-md border border-destructive/35 bg-destructive/10">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
              </div>
              Presupuesto Excedido
              <Badge variant="destructive" className="rounded-full">{overBudgetCategories.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overBudgetCategories.map((category) => (
              <div key={category.id} className="data-panel flex items-center justify-between border-destructive/25 bg-destructive/5 p-3.5">
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
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <div className="flex h-7 w-7 items-center justify-center rounded-md border border-chart-1/35 bg-chart-1/10">
                <TrendingUp className="h-3.5 w-3.5 text-chart-1" />
              </div>
              Cerca del Límite del Presupuesto
            <Badge variant="outline" className="border-chart-1/35 text-chart-1">{nearLimitCategories.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nearLimitCategories.map((category) => (
              <div key={category.id} className="data-panel flex items-center justify-between border-chart-1/25 bg-chart-1/5 p-3.5">
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{category.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatPercentage(category.usagePercentage)} utilizado
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-chart-1/35 text-chart-1">
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
          <CardTitle className="text-sm font-bold">Resumen del Presupuesto</CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/65 bg-muted">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="metric-value text-xl">{formatPercentage(budgetData.totalBudgetPercentage)}</div>
              <p className="metric-label">Asignado</p>
            </div>
            {budgetData.hasUnassignedIncome && (
              <div className="text-right">
                <div className="text-sm font-bold">{formatCurrency(budgetData.unassignedAmount || 0)}</div>
                <p className="metric-label">No Asignado</p>
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
