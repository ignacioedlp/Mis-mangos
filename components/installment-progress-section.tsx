import Link from "next/link";
import { CreditCard, TrendingUp } from "lucide-react";

import type { InstallmentProgressOverviewDTO } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface InstallmentProgressSectionProps {
  data: InstallmentProgressOverviewDTO;
  monthLabel: string;
  maxItems?: number;
}

export function InstallmentProgressSection({
  data,
  monthLabel,
  maxItems = 6,
}: InstallmentProgressSectionProps) {
  const visibleItems = data.items.slice(0, maxItems);

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif text-lg font-bold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <CreditCard className="h-4 w-4 text-primary" />
          </div>
          Seguimiento de Cuotas
        </CardTitle>
        <CardDescription>
          Progreso de productos financiados en {monthLabel}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.totalProducts === 0 ? (
          <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
            Aun no hay productos en cuotas activos.
          </p>
        ) : (
          <>
            <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-md border bg-muted/30 p-2">
                <span className="block">Productos activos</span>
                <strong className="text-sm text-foreground">
                  {data.activeProducts}
                </strong>
              </div>
              <div className="rounded-md border bg-muted/30 p-2">
                <span className="block">Productos completados</span>
                <strong className="text-sm text-foreground">
                  {data.completedProducts}
                </strong>
              </div>
              <div className="rounded-md border bg-muted/30 p-2">
                <span className="block">Vence este mes</span>
                <strong className="text-sm text-foreground">
                  {formatCurrency(data.dueThisMonthAmount)}
                </strong>
              </div>
              <div className="rounded-md border bg-muted/30 p-2">
                <span className="block">Saldo pendiente</span>
                <strong className="text-sm text-foreground">
                  {formatCurrency(data.totalPendingAmount)}
                </strong>
              </div>
            </div>

            <div className="space-y-2">
              {visibleItems.map((item) => (
                <div key={item.purchaseId} className="rounded-lg border p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {item.productName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.expenseName}
                      </p>
                    </div>
                    <Badge variant={item.isCompleted ? "secondary" : "outline"}>
                      {item.paidCount}/{item.totalInstallments}
                    </Badge>
                  </div>

                  <Progress value={item.progressPercentage} className="mb-2" />

                  <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-3">
                    <p>
                      Este mes:{" "}
                      <strong className="text-foreground">
                        {formatCurrency(item.dueThisMonthAmount)}
                      </strong>
                    </p>
                    <p>
                      Restante:{" "}
                      <strong className="text-foreground">
                        {formatCurrency(item.remainingAmount)}
                      </strong>
                    </p>
                    <p>
                      Proxima:{" "}
                      <strong className="text-foreground">
                        {item.nextInstallmentNumber
                          ? `${item.nextInstallmentMonth}/${item.nextInstallmentYear} (${item.nextInstallmentNumber}/${item.totalInstallments})`
                          : "Completado"}
                      </strong>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Link
                href="/expenses"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <TrendingUp className="h-3.5 w-3.5" />
                Ver detalle por gasto
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
