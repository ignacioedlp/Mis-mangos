import {
  getMonthlyDetails,
  generateMonthOccurrences,
  getSalary,
  getExportData,
  getDailyExpensesHeatmap,
} from "@/actions/expense-actions";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin-page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CalendarDays,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { MonthSelector } from "@/components/month-selector";
import { ExpenseCharts } from "@/components/expense-charts";
import { ExportDialog } from "@/components/export-dialog";
import { SalaryDialog } from "@/components/salary-dialog";
import { PendingAlerts } from "@/components/pending-alerts";
import type { ExpenseFrequency } from "@/lib/types";
import { MonthlyExpensesTable } from "@/components/tables/monthly-expenses-table";
import { SummaryStrip } from "@/components/summary-strip";
import { DataSection } from "@/components/data-section";
import { ExpenseHeatmap } from "@/components/expense-heatmap";
import { getInstallmentProgressOverview } from "@/actions/installment-actions";
import { InstallmentProgressSection } from "@/components/installment-progress-section";
import { getCryptoDollarRate } from "@/lib/crypto-dollar-server";
import { formatArsToCryptoUsd } from "@/lib/crypto-dollar";
import { CryptoDollarQuote } from "@/components/crypto-dollar-quote";

interface MonthlyPageProps {
  searchParams: Promise<{ year?: string; month?: string }>;
}

export default async function MonthlyPage({ searchParams }: MonthlyPageProps) {
  const params = await searchParams;
  const currentDate = new Date();
  const year = parseInt(params.year || currentDate.getFullYear().toString());
  const month = parseInt(
    params.month || (currentDate.getMonth() + 1).toString(),
  );

  const [data, salary, heatmapData, installmentProgress, cryptoDollarRate] =
    await Promise.all([
      getMonthlyDetails(year, month),
      getSalary(year, month),
      getDailyExpensesHeatmap(year, month),
      getInstallmentProgressOverview(year, month),
      getCryptoDollarRate(),
    ]);

  const exportData = await getExportData(year, month);

  // Tipado mínimo para evitar `any` en filtros
  type ItemForCounts = {
    isSkipped: boolean;
    frequency: ExpenseFrequency;
    hasOccurrence: boolean;
  };
  // Derivados para visualización
  const activeCount = data.items.filter(
    (i: ItemForCounts) => !i.isSkipped,
  ).length;
  const completionPct =
    activeCount > 0 ? (data.totalPaid / activeCount) * 100 : 0;
  const estUsagePct =
    data.totalEstimated > 0
      ? (data.totalActual / data.totalEstimated) * 100
      : 0;
  const salaryUsagePct = salary?.amount
    ? (data.totalActual / salary.amount) * 100
    : 0;
  const missingRecurringOccurrences = data.items.filter(
    (i: ItemForCounts) => i.frequency !== "ONE_TIME" && !i.hasOccurrence,
  ).length;

  async function generateOccurrencesAction() {
    "use server";
    await generateMonthOccurrences(year, month);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Mes activo"
        title="Vista mensual"
        description={
          <>
            Resumen y detalle de tus gastos en{" "}
            <span className="font-medium text-foreground/80">
              {data.monthName}
            </span>
            <span className="mt-2 block">
              <CryptoDollarQuote rate={cryptoDollarRate} />
            </span>
          </>
        }
        actions={
          <>
            <MonthSelector currentYear={year} currentMonth={month} />
            <ExportDialog data={exportData} />
            <SalaryDialog
              year={year}
              month={month}
              currentSalary={salary?.amount}
            />
          </>
        }
      />

      <SummaryStrip
        aria-label={`Resumen de ${data.monthName}`}
        items={[
          {
            label: "Salario",
            value: salary ? formatCurrency(salary.amount) : "Sin cargar",
            detail: salary ? `${salaryUsagePct.toFixed(1)}% utilizado` : "Establecé el ingreso del mes",
            icon: DollarSign,
            tone: "success",
            progress: salary?.amount ? salaryUsagePct : 0,
          },
          {
            label: "Gasto real",
            value: formatCurrency(data.totalActual),
            detail: `${estUsagePct.toFixed(1)}% de ${formatCurrency(data.totalEstimated)} estimado`,
            icon: TrendingDown,
            tone: estUsagePct > 100 ? "danger" : "accent",
            progress: estUsagePct,
          },
          {
            label: "Disponible",
            value: salary ? formatCurrency(salary.amount - data.totalActual) : "—",
            detail: formatArsToCryptoUsd(data.totalEstimated, cryptoDollarRate) ?? "Cotización no disponible",
            icon: TrendingUp,
            tone: salary && salary.amount - data.totalActual < 0 ? "danger" : "success",
          },
          {
            label: "Pagos",
            value: `${data.totalPaid}/${activeCount}`,
            detail: activeCount > 0 ? `${completionPct.toFixed(1)}% completado` : "Sin gastos activos",
            icon: BarChart3,
            progress: completionPct,
          },
        ]}
      />

      {/* Charts */}
      <ExpenseCharts categoryData={data.categoryData} />

      {/* Heatmap Calendar */}
      <ExpenseHeatmap data={heatmapData} year={year} month={month} />

      <InstallmentProgressSection
        data={installmentProgress}
        monthLabel={data.monthName}
        maxItems={8}
      />

      {/* Detalle de gastos */}
      <DataSection
        title="Detalle de gastos"
        description={`Lista completa para ${data.monthName}`}
      >
          <MonthlyExpensesTable
            data={data.items}
            year={year}
            month={month}
            cryptoDollarRate={cryptoDollarRate}
            emptyMessage="No se encontraron gastos. Agregá gastos para comenzar."
          />
      </DataSection>

      {/* Pending Alerts */}
      <PendingAlerts />

      {/* Generar ocurrencias */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/35 bg-primary/10">
              <CalendarDays className="h-4 w-4 text-primary" />
            </div>
            Configuración del Mes
          </CardTitle>
          <CardDescription>
            Generá ocurrencias de gastos para {data.monthName} y comenzá a
            rastrear pagos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={generateOccurrencesAction}>
            <Button type="submit" disabled={missingRecurringOccurrences === 0}>
              <Plus className="h-4 w-4" />
              {missingRecurringOccurrences === 0
                ? "No hay ocurrencias pendientes"
                : `Generar ${missingRecurringOccurrences} ocurrencia${missingRecurringOccurrences !== 1 ? "s" : ""} pendientes`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
