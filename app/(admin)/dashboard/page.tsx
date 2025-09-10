import { getMonthlyDashboard } from "@/actions/expense-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// Iconos se gestionan dentro de StatCard para evitar pasar funciones a componentes cliente
import { ExpenseActionButtons } from "@/components/expense-action-buttons";
import { BudgetAlerts } from "@/components/budget-alerts";
import { formatCurrency } from "@/lib/utils";
import { DashboardCharts } from "@/components/dashboard-charts";
import { DashboardStatsClient } from "@/components/dashboard-stats";

export default async function DashboardPage() {
  const data = await getMonthlyDashboard();
  const monthName = new Date(data.year, data.month - 1).toLocaleString(
    "default",
    { month: "long", year: "numeric" }
  );
  return (
    <div className="flex flex-col gap-8 w-full rounded-xl">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Panel Mensual</h2>
        <p className="text-muted-foreground text-sm md:text-base">
          Seguimiento rápido de tus gastos y progreso de pagos para {monthName}
        </p>
      </header>

      <BudgetAlerts />

      <DashboardStatsClient
        monthName={monthName}
        totalEstimated={data.totalEstimated}
        totalPaid={data.totalPaid}
        totalPending={data.totalPending}
        itemCount={data.items.length}
        paidCount={data.items.filter(i=>i.isPaid).length}
        remainingCount={data.items.filter(i=>!i.isPaid && !i.isSkipped).length}
  skippedCount={data.items.filter(i=>i.isSkipped).length}
      />

      {/* Sanitizamos items para evitar pasar instancias Date a un componente cliente */}
      <DashboardCharts
        items={data.items.map(it => ({
          expenseId: it.expenseId,
            name: it.name,
            categoryName: it.categoryName,
            subcategoryName: it.subcategoryName,
            estimatedAmount: it.estimatedAmount,
            isPaid: it.isPaid,
            isSkipped: it.isSkipped,
        }))}
      />

      <DashboardList data={data} monthName={monthName} />
    </div>
  );
}


function DashboardList({
  data,
  monthName,
}: {
  data: Awaited<ReturnType<typeof getMonthlyDashboard>>;
  monthName: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Lista de Gastos</span>
          <Badge variant="outline">{monthName}</Badge>
        </CardTitle>
        <CardDescription>
          Gestiona tus gastos mensuales y realiza un seguimiento de los pagos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No se encontraron gastos para este mes.</p>
            <p className="text-sm">¡Agrega algunos gastos para comenzar!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.items.map((item) => (
              <div
                key={item.expenseId}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg border bg-card/40 backdrop-blur-sm hover:bg-muted/40 transition-colors"
              >
                <div className="flex flex-col space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium leading-tight truncate max-w-[70vw] sm:max-w-[40vw]">{item.name}</span>
                    {item.isPaid && (
                      <Badge variant="secondary" className="text-xs">Pagado</Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {item.categoryName} / {item.subcategoryName}
                  </span>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-sm font-medium tabular-nums text-foreground sm:text-right">
                    {formatCurrency(item.estimatedAmount)}
                  </span>
                  <ExpenseActionButtons
                    expenseId={item.expenseId}
                    expenseName={item.name}
                    estimatedAmount={item.estimatedAmount}
                    isPaid={item.isPaid}
                    isSkipped={item.isSkipped}
                    year={data.year}
                    month={data.month}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
