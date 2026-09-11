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
import { CheckCircle2, Clock3, ReceiptText, Target, Wallet } from "lucide-react";
// Iconos se gestionan dentro de StatCard para evitar pasar funciones a componentes cliente
import { BudgetAlerts } from "@/components/budget-alerts";
import { formatCurrency, formatUsdCurrency } from "@/lib/utils";
import { DashboardCharts } from "@/components/dashboard-charts";
import { getInstallmentProgressOverview } from "@/actions/installment-actions";
import { InstallmentProgressSection } from "@/components/installment-progress-section";
import { getCryptoDollarRate } from "@/lib/crypto-dollar-server";
import type { CryptoDollarRate } from "@/lib/crypto-dollar";
import { formatArsToCryptoUsd } from "@/lib/crypto-dollar";
import { CryptoDollarQuote } from "@/components/crypto-dollar-quote";
import { AdminPageHeader } from "@/components/admin-page-header";
import { SummaryStrip } from "@/components/summary-strip";
import { DashboardExpenseList } from "@/components/dashboard-expense-list";

export default async function DashboardPage() {
  const [data, installmentProgress, cryptoDollarRate] = await Promise.all([
    getMonthlyDashboard(),
    getInstallmentProgressOverview(),
    getCryptoDollarRate(),
  ]);
  const usdCashflow = await getUsdCashflow(data.year, data.month);
  const monthName = new Date(data.year, data.month - 1).toLocaleString(
    "es-AR",
    { month: "long", year: "numeric" },
  );
  const paidPercent =
    data.totalEstimated > 0 ? (data.totalPaid / data.totalEstimated) * 100 : 0;
  const activeItems = data.items.filter((i) => !i.isSkipped).length;
  const completedItems = data.items.filter((i) => i.isPaid).length;

  return (
    <div className="flex w-full flex-col gap-6">
      <AdminPageHeader
        eyebrow="Operación"
        title="Panel mensual"
        description={
          <div className="space-y-2">
            <p>
              Lo que falta pagar y el avance de{" "}
              <span className="font-medium text-foreground">{monthName}</span>.
            </p>
            <CryptoDollarQuote rate={cryptoDollarRate} />
          </div>
        }
      />

      <SummaryStrip
        aria-label={`Estado de pagos de ${monthName}`}
        items={[
          {
            label: "Pendiente",
            value: formatCurrency(data.totalPending),
            detail: `${data.items.filter((i) => !i.isPaid && !i.isSkipped).length} pagos por resolver`,
            icon: Clock3,
            tone: data.totalPending > 0 ? "accent" : "success",
          },
          {
            label: "Pagado",
            value: formatCurrency(data.totalPaid),
            detail: `${paidPercent.toFixed(1)}% del total estimado`,
            icon: CheckCircle2,
            tone: "success",
            progress: paidPercent,
          },
          {
            label: "Estimado del mes",
            value: formatCurrency(data.totalEstimated),
            detail: formatArsToCryptoUsd(data.totalEstimated, cryptoDollarRate) ?? monthName,
            icon: Target,
          },
          {
            label: "Avance",
            value: `${completedItems}/${activeItems || 0}`,
            detail: "Gastos activos pagados",
            icon: ReceiptText,
            progress: activeItems > 0 ? (completedItems / activeItems) * 100 : 0,
          },
        ]}
      />

      <DashboardList
        data={data}
        monthName={monthName}
        cryptoDollarRate={cryptoDollarRate}
      />

      <BudgetAlerts />

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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>
              USD disponible
            </CardTitle>
            <CardDescription>
              Sueldo y transferencias a cuenta de uso para {monthName}
            </CardDescription>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/35 bg-primary/10 text-primary">
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
            <div key={label} className="data-panel p-3">
              <div className="metric-label">
                {label}
              </div>
              <div className="metric-value mt-1 text-lg">
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
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>
            Lista de Gastos
          </CardTitle>
          <Badge
            variant="outline"
            className="border-primary/25 text-primary"
          >
            {monthName}
          </Badge>
        </div>
        <CardDescription>
            Administrá los pagos del mes y resolvé primero lo pendiente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <DashboardExpenseList
          items={data.items}
          year={data.year}
          month={data.month}
          cryptoDollarRate={cryptoDollarRate}
        />
      </CardContent>
    </Card>
  );
}
