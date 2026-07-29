import { ArrowDownToLine, Banknote, PiggyBank, Wallet } from "lucide-react";

import { getUsdCashflow } from "@/actions/usd-cashflow-actions";
import { AdminPageHeader } from "@/components/admin-page-header";
import { SummaryStrip } from "@/components/summary-strip";
import { DataSection } from "@/components/data-section";
import { MonthSelector } from "@/components/month-selector";
import { CryptoDollarQuote } from "@/components/crypto-dollar-quote";
import { UsdCsvImportDialog } from "@/components/usd-csv-import-dialog";
import { UsdIncomeDialog } from "@/components/usd-income-dialog";
import { UsdTransferDialog } from "@/components/usd-transfer-dialog";
import { UsdTransfersTable } from "@/components/usd-transfers-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getCryptoDollarRate } from "@/lib/crypto-dollar-server";
import { formatCryptoUsdToArs } from "@/lib/crypto-dollar";
import { formatUsdCurrency } from "@/lib/utils";

interface UsdCashflowPageProps {
  searchParams: Promise<{ year?: string; month?: string }>;
}

export default async function UsdCashflowPage({
  searchParams,
}: UsdCashflowPageProps) {
  const params = await searchParams;
  const currentDate = new Date();
  const year = Number.parseInt(
    params.year || currentDate.getFullYear().toString(),
    10,
  );
  const month = Number.parseInt(
    params.month || (currentDate.getMonth() + 1).toString(),
    10,
  );

  const [data, cryptoDollarRate] = await Promise.all([
    getUsdCashflow(year, month),
    getCryptoDollarRate(),
  ]);
  const usagePct =
    data.monthlyIncome > 0
      ? Math.min((data.totalTransferred / data.monthlyIncome) * 100, 100)
      : 0;
  const monthName = new Date(year, month - 1).toLocaleString("es-AR", {
    month: "long",
    year: "numeric",
  });
  const transfers = data.transfers.map((transfer) => ({
    id: transfer.id,
    amount: transfer.amount,
    year: transfer.year,
    month: transfer.month,
    transferredAt: transfer.transferredAt.toISOString(),
    description: transfer.description,
  }));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Control USD"
        title="USD disponible"
        description={
          <>
            Seguimiento granular del sueldo mensual en dólares y las
            transferencias a tu cuenta de uso en{" "}
            <span className="font-medium text-foreground/80">{monthName}</span>
            .
            <span className="mt-2 block">
              <CryptoDollarQuote rate={cryptoDollarRate} />
            </span>
          </>
        }
        actions={
          <>
            <MonthSelector currentYear={year} currentMonth={month} />
            <UsdIncomeDialog
              year={year}
              month={month}
              currentAmount={data.income?.amount}
            />
            <UsdCsvImportDialog year={year} month={month} />
            <UsdTransferDialog year={year} month={month} />
          </>
        }
      />

      <SummaryStrip
        aria-label="Resumen de fondos en dólares"
        items={[
          {
          label: "Acumulado sin usar",
          value:
            <UsdArsMetricValue
              amount={data.totalStored}
              arsValue={formatCryptoUsdToArs(
                data.totalStored,
                cryptoDollarRate,
              )}
            />,
          detail: "Todos los meses cargados",
          icon: PiggyBank,
          tone: data.totalStored >= 0 ? "success" : "danger",
          },
          {
          label: "Disponible USD",
          value:
            <UsdArsMetricValue
              amount={data.available}
              arsValue={formatCryptoUsdToArs(data.available, cryptoDollarRate)}
            />,
          detail:
            data.monthlyIncome > 0
              ? `${(100 - usagePct).toFixed(1)}% sin transferir`
              : "Cargá el sueldo del mes",
          icon: Wallet,
          tone: data.available >= 0 ? "success" : "danger",
          progress: data.monthlyIncome > 0 ? 100 - usagePct : 0,
          },
          {
          label: "Transferido",
          value:
            <UsdArsMetricValue
              amount={data.totalTransferred}
              arsValue={formatCryptoUsdToArs(
                data.totalTransferred,
                cryptoDollarRate,
              )}
            />,
          detail: `${data.transfers.length} transferencia${data.transfers.length === 1 ? "" : "s"}`,
          icon: ArrowDownToLine,
          tone: "accent",
          progress: usagePct,
          },
          {
          label: "Sueldo mensual",
          value:
            <UsdArsMetricValue
              amount={data.monthlyIncome}
              arsValue={formatCryptoUsdToArs(
                data.monthlyIncome,
                cryptoDollarRate,
              )}
            />,
          detail: data.income ? monthName : "No establecido",
          icon: Banknote,
          tone: "default",
          },
        ]}
      />

      <DataSection
        title="Avance de transferencias"
        description="Cuánto del sueldo USD del mes ya fue movido a la cuenta de uso."
      >
        <div className="space-y-3 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">Transferido del sueldo</span>
            <span className="font-medium tabular-nums">
              {data.monthlyIncome > 0 ? usagePct.toFixed(1) : "0.0"}%
            </span>
          </div>
          <Progress value={usagePct} />
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
            <span>
              Sueldo:{" "}
              <strong className="text-foreground">
                {formatUsdCurrency(data.monthlyIncome)}
              </strong>
            </span>
            <span>
              Transferido:{" "}
              <strong className="text-foreground">
                {formatUsdCurrency(data.totalTransferred)}
              </strong>
            </span>
            <span>
              Disponible:{" "}
              <strong className="text-foreground">
                {formatUsdCurrency(data.available)}
              </strong>
            </span>
          </div>
        </div>
      </DataSection>

      <Card>
        <CardHeader>
          <CardTitle>
            Transferencias del mes
          </CardTitle>
          <CardDescription>
            Registro de movimientos en USD hacia tu cuenta de uso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsdTransfersTable year={year} month={month} transfers={transfers} />
        </CardContent>
      </Card>
    </div>
  );
}

function UsdArsMetricValue({
  amount,
  arsValue,
}: {
  amount: number;
  arsValue: string | null;
}) {
  return (
    <div className="space-y-1">
      <div>{formatUsdCurrency(amount)}</div>
      <div className="font-sans text-xs font-medium text-muted-foreground">
        {arsValue ?? "Cotización no disponible"}
      </div>
    </div>
  );
}
