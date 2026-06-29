import { getMonthlyDashboard } from "@/actions/expense-actions";
import { getUsdCashflow } from "@/actions/usd-cashflow-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet } from "lucide-react";
// Iconos se gestionan dentro de StatCard para evitar pasar funciones a componentes cliente
import { ExpenseActionButtons } from "@/components/expense-action-buttons";
import { BudgetAlerts } from "@/components/budget-alerts";
import { formatCurrency, formatUsdCurrency } from "@/lib/utils";
import { DashboardCharts } from "@/components/dashboard-charts";
import { DashboardStatsClient } from "@/components/dashboard-stats";
import { getInstallmentProgressOverview } from "@/actions/installment-actions";
import { InstallmentProgressSection } from "@/components/installment-progress-section";
import { getCryptoDollarRate } from "@/lib/crypto-dollar-server";
import type { CryptoDollarRate } from "@/lib/crypto-dollar";
import { formatArsToCryptoUsd } from "@/lib/crypto-dollar";
import { CryptoDollarQuote } from "@/components/crypto-dollar-quote";

export default async function DashboardPage() {
  const [data, installmentProgress, cryptoDollarRate] = await Promise.all([
    getMonthlyDashboard(),
    getInstallmentProgressOverview(),
    getCryptoDollarRate(),
  ]);
  const usdCashflow = await getUsdCashflow(data.year, data.month);
  const monthName = new Date(data.year, data.month - 1).toLocaleString(
    "default",
    { month: "long", year: "numeric" },
  );
  const paidPercent =
    data.totalEstimated > 0 ? (data.totalPaid / data.totalEstimated) * 100 : 0;
  const activeItems = data.items.filter((i) => !i.isSkipped).length;
  const completedItems = data.items.filter((i) => i.isPaid).length;

  return (
    <div className="flex flex-col gap-8 w-full">
      <header className="fintech-hero relative overflow-hidden rounded-xl p-5">
        <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex flex-col gap-3">
            <span className="w-fit rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-normal text-primary">
              Snapshot mensual
            </span>
            <div>
              <h2 className="font-serif text-3xl font-extrabold tracking-normal">
                Panel Mensual
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Seguimiento de gastos y pagos —{" "}
                <span className="font-medium text-foreground/80">
                  {monthName}
                </span>
              </p>
            </div>
            <CryptoDollarQuote rate={cryptoDollarRate} />
          </div>

          <div className="grid gap-2 sm:grid-cols-3 xl:min-w-[34rem]">
            {[
              ["Pagado", formatCurrency(data.totalPaid), `${paidPercent.toFixed(1)}%`],
              ["Pendiente", formatCurrency(data.totalPending), `${data.items.filter((i) => !i.isPaid && !i.isSkipped).length} items`],
              ["Avance", `${completedItems}/${activeItems || 0}`, "gastos"],
            ].map(([label, value, meta]) => (
              <div key={label} className="fintech-kpi rounded-lg p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[10px] font-semibold uppercase text-muted-foreground">
                    {label}
                  </span>
                  <span className="rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary">
                    {meta}
                  </span>
                </div>
                <div className="mt-1.5 font-serif text-base font-extrabold tracking-normal">
                  {value}
                </div>
              </div>
            ))}
            <div className="h-1 overflow-hidden rounded-full bg-primary/15 sm:col-span-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary via-gold-300 to-gold-200"
                style={{ width: `${Math.min(paidPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <BudgetAlerts />

      <DashboardStatsClient
        monthName={monthName}
        totalEstimated={data.totalEstimated}
        totalPaid={data.totalPaid}
        totalPending={data.totalPending}
        itemCount={data.items.length}
        paidCount={data.items.filter((i) => i.isPaid).length}
        remainingCount={
          data.items.filter((i) => !i.isPaid && !i.isSkipped).length
        }
        skippedCount={data.items.filter((i) => i.isSkipped).length}
        cryptoDollarRate={cryptoDollarRate}
      />

      <UsdCashflowSummary data={usdCashflow} monthName={monthName} />

      {/* Sanitizamos items para evitar pasar instancias Date a un componente cliente */}
      <DashboardCharts
        items={data.items.map((it) => ({
          expenseId: it.expenseId,
          name: it.name,
          categoryName: it.categoryName,
          subcategoryName: it.subcategoryName,
          estimatedAmount: it.estimatedAmount,
          isPaid: it.isPaid,
          isSkipped: it.isSkipped,
        }))}
      />

      <InstallmentProgressSection
        data={installmentProgress}
        monthLabel={monthName}
      />

      <DashboardList
        data={data}
        monthName={monthName}
        cryptoDollarRate={cryptoDollarRate}
      />
    </div>
  );
}

function UsdCashflowSummary({
  data,
  monthName,
}: {
  data: Awaited<ReturnType<typeof getUsdCashflow>>;
  monthName: string;
}) {
  return (
    <Card className="border-border/60 bg-card/[0.94]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="font-serif text-lg font-bold tracking-normal">
              USD disponible
            </CardTitle>
            <CardDescription>
              Sueldo y transferencias a cuenta de uso para {monthName}
            </CardDescription>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <Wallet className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["Disponible", formatUsdCurrency(data.available)],
            ["Transferido", formatUsdCurrency(data.totalTransferred)],
            ["Sueldo USD", formatUsdCurrency(data.monthlyIncome)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-border/60 bg-background/50 p-3">
              <div className="font-mono text-[10px] font-semibold uppercase text-muted-foreground">
                {label}
              </div>
              <div className="mt-1 font-serif text-lg font-extrabold tabular-nums tracking-normal">
                {value}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardList({
  data,
  monthName,
  cryptoDollarRate,
}: {
  data: Awaited<ReturnType<typeof getMonthlyDashboard>>;
  monthName: string;
  cryptoDollarRate: CryptoDollarRate | null;
}) {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif text-lg font-bold tracking-normal">
            Lista de Gastos
          </CardTitle>
          <Badge
            variant="outline"
            className="rounded-full border-primary/20 text-primary font-medium text-xs px-3"
          >
            {monthName}
          </Badge>
        </div>
        <CardDescription>
          Gestiona tus gastos mensuales y realiza un seguimiento de los pagos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {data.items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 mb-3">
              <span className="text-2xl">🥭</span>
            </div>
            <p className="font-medium">
              No se encontraron gastos para este mes.
            </p>
            <p className="text-sm mt-1">
              ¡Agrega algunos gastos para comenzar!
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {data.items.map((item) => (
              <div
                key={item.expenseId}
                className="grid gap-3 rounded-xl border border-border/60 bg-background/60 p-3.5 shadow-xs transition-all duration-200 hover:border-primary/25 hover:bg-accent/30 hover:shadow-sm md:grid-cols-[minmax(0,1fr)_9rem_12rem] md:items-center"
              >
                <div className="flex flex-col space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`font-medium text-sm leading-tight truncate max-w-[70vw] sm:max-w-[40vw]`}
                    >
                      {item.name}
                    </span>
                    {item.isPaid && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] rounded-full px-2 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-0"
                      >
                        Pagado
                      </Badge>
                    )}
                    {item.isHidden && (
                      <Badge
                        variant="outline"
                        className="text-[10px] rounded-full px-2 text-muted-foreground"
                      >
                        Oculto
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {item.categoryName} <span className="text-border">·</span>{" "}
                    {item.subcategoryName}
                  </span>
                </div>
                <div className="flex flex-col md:items-end md:text-right">
                  <span className="font-serif text-sm font-bold tabular-nums text-foreground">
                    {formatCurrency(item.estimatedAmount)}
                  </span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {formatArsToCryptoUsd(
                      item.estimatedAmount,
                      cryptoDollarRate,
                    ) ?? "Cotización no disponible"}
                  </span>
                </div>
                <div className="flex min-w-0 items-center md:justify-end">
                  <ExpenseActionButtons
                    expenseId={item.expenseId}
                    expenseName={item.name}
                    estimatedAmount={item.estimatedAmount}
                    isPaid={item.isPaid}
                    isSkipped={item.isSkipped}
                    hasInstallments={item.hasInstallments}
                    isHidden={item.isHidden}
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
